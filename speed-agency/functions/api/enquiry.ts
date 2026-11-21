import { enquirySchema, fieldErrors, NEEDS, type Enquiry } from '../../src/lib/schema';
import { config, facts } from '../../src/config/site';
import type { Env } from '../_lib/env';
import { ipHash, json, log, requestId, sameOrigin, oneLine } from '../_lib/util';
import { rateLimit } from '../_lib/ratelimit';
import { verifyTurnstile } from '../_lib/turnstile';
import { alertOwnerOfFailure, pushAlert, rowsHtml, rowsText, sendEmail } from '../_lib/notify';

const LIMIT_PER_HOUR = 5;

async function readBody(req: Request): Promise<{ data: Record<string, unknown>; isForm: boolean } | null> {
  const ct = req.headers.get('content-type') ?? '';
  if (Number(req.headers.get('content-length') ?? 0) > 32_000) return null;
  try {
    if (ct.includes('application/json')) return { data: (await req.json()) as Record<string, unknown>, isForm: false };
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const fd = await req.formData();
      const data: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) if (typeof v === 'string') data[k] = v;
      data.marketing_consent = data.marketing_consent === '1';
      data.turnstile_token = data['cf-turnstile-response'] ?? '';
      delete data['cf-turnstile-response'];
      return { data, isForm: true };
    }
  } catch {
    return null;
  }
  return null;
}

const needLabel = (v: string) => NEEDS.find((n) => n.value === v)?.label ?? v;

async function recordEvent(db: D1Database, name: string, label: string, page: string) {
  await db
    .prepare('INSERT INTO events (created_at, name, page, label, session_id) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(new Date().toISOString(), name, page.slice(0, 200), label.slice(0, 120), '')
    .run();
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request: req, env } = ctx;
  const rid = requestId(req);
  if (!sameOrigin(req)) return json({ ok: false, message: 'Bad origin.' }, 403);

  const body = await readBody(req);
  const back = (q: string) => Response.redirect(new URL(`/contact?${q}`, req.url).toString(), 303);
  if (!body) return json({ ok: false, message: 'Please send the form again.' }, 400);
  const { data, isForm } = body;

  try {
    // 1. Honeypot: pretend success so bots learn nothing.
    if (typeof data.company_website === 'string' && data.company_website.trim() !== '') {
      log('info', rid, 'honeypot tripped');
      return isForm ? Response.redirect(new URL('/thanks?type=quick', req.url).toString(), 303) : json({ ok: true });
    }

    // 2. Rate limit: 5 per IP per hour.
    const hash = await ipHash(req, env);
    if (!(await rateLimit(env.DB, `${hash}:enquiry`, LIMIT_PER_HOUR, 3600))) {
      return isForm ? back('error=rate') : json({ ok: false, message: 'Too many submissions. Please try again later.' }, 429);
    }

    // 3. Validate (same schema as the browser).
    const turnstileToken = typeof data.turnstile_token === 'string' ? data.turnstile_token : '';
    delete data.company_website;
    delete data.turnstile_token;
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      const first = Object.keys(errors)[0] ?? 'form';
      ctx.waitUntil(recordEvent(env.DB, 'form_error', first, String(data.source_page ?? '')).catch(() => {}));
      return isForm ? back('error=invalid') : json({ ok: false, errors }, 400);
    }

    // 4. Turnstile.
    if (!(await verifyTurnstile(env, turnstileToken, req.headers.get('cf-connecting-ip')))) {
      ctx.waitUntil(recordEvent(env.DB, 'form_error', 'turnstile', parsed.data.source_page).catch(() => {}));
      return isForm
        ? back('error=spamcheck')
        : json({ ok: false, errors: { form: "The spam check didn't complete. Please wait a moment and try again." } }, 400);
    }

    // 5. Store with a consent record.
    const e = parsed.data;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const message = [e.message, e.services && `Services: ${e.services}`, e.towns && `Towns: ${e.towns}`].filter(Boolean).join('\n\n');
    await env.DB.prepare(
      `INSERT INTO enquiries (id, created_at, form_type, name, email, phone, business_name, town_state, trade, need,
        website_url, timeline, budget, message, source_page, utm_source, utm_medium, utm_campaign,
        marketing_consent, consent_text_version, ip_hash, status)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, 'new')`,
    )
      .bind(
        id, createdAt, e.form_type, e.name, e.email, e.phone, e.business_name, e.town_state, e.trade, e.need,
        e.website_url, e.timeline, e.budget, message, e.source_page, e.utm_source, e.utm_medium, e.utm_campaign,
        e.marketing_consent ? 1 : 0, config.consentTextVersion, hash,
      )
      .run();

    // form_submit is recorded server-side, once, when the row is stored.
    ctx.waitUntil(recordEvent(env.DB, 'form_submit', `${e.form_type}:${e.need}`, e.source_page).catch(() => {}));

    // 6. Notifications (after the response, so the visitor isn't kept waiting).
    ctx.waitUntil(notify(env, rid, id, e, message));

    log('info', rid, 'enquiry stored', { id, form_type: e.form_type });
    return isForm
      ? Response.redirect(new URL(`/thanks?type=${e.need === 'video_review' ? 'review' : e.form_type}`, req.url).toString(), 303)
      : json({ ok: true });
  } catch (err) {
    log('error', rid, 'enquiry failed', { error: String(err) });
    ctx.waitUntil(alertOwnerOfFailure(env, rid, 'An enquiry could not be saved', err));
    return isForm ? back('error=server') : json({ ok: false, message: `Something went wrong on my side. Please email ${facts.CONTACT_EMAIL || 'me'} instead.` }, 500);
  }
};

async function notify(env: Env, rid: string, id: string, e: Enquiry, message: string) {
  const rows: [string, unknown][] = [
    ['Form', e.form_type],
    ['Need', needLabel(e.need)],
    ['Name', e.name],
    ['Email', e.email],
    ['Phone', e.phone],
    ['Business', e.business_name],
    ['Town/state', e.town_state],
    ['Trade', e.trade],
    ['Website', e.website_url],
    ['Timeline', e.timeline],
    ['Budget', e.budget],
    ['Message', message],
    ['Page', e.source_page],
    ['Campaign', [e.utm_source, e.utm_medium, e.utm_campaign].filter(Boolean).join(' / ')],
    ['Tips consent', e.marketing_consent ? 'Yes' : 'No'],
    ['Lead ID', id],
  ];
  const replyHref = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(`Re: your enquiry, ${oneLine(e.business_name, 80)}`)}`;

  // Owner alert
  if (env.OWNER_ALERT_EMAIL) {
    try {
      await sendEmail(env, {
        to: env.OWNER_ALERT_EMAIL,
        replyTo: e.email,
        subject: `New enquiry: ${oneLine(e.business_name, 60)} (${needLabel(e.need)})`,
        text: `${rowsText(rows)}\n\nReply: ${e.email}`,
        html: `<table style="font:15px/1.5 system-ui,sans-serif">${rowsHtml(rows)}</table><p><a href="${replyHref}" style="font:600 16px system-ui,sans-serif">Reply to ${oneLine(e.name, 80).replace(/[<>&"]/g, '')}</a></p>`,
      });
    } catch (err) {
      await alertOwnerOfFailure(env, rid, `Owner alert email failed for lead ${id}`, err);
    }
  } else {
    log('warn', rid, 'OWNER_ALERT_EMAIL not set; no owner alert sent');
  }

  await pushAlert(env, `New enquiry: ${oneLine(e.business_name, 60)}, ${oneLine(e.town_state, 60)} (${needLabel(e.need)})`, rid);

  // Customer auto-reply
  try {
    const founder = facts.FOUNDER_NAME || 'Speed Agency';
    const replyTo = env.REPLY_TO_EMAIL || env.OWNER_ALERT_EMAIL;
    const text = `Hi ${oneLine(e.name, 80)}, thanks for getting in touch about ${oneLine(e.business_name, 120)}. I'll reply within one business day with next steps. If it's urgent, reply to this email.\n\n— ${founder}, Speed Agency`;
    await sendEmail(env, {
      to: e.email,
      ...(replyTo ? { replyTo } : {}),
      subject: 'Got your message — Speed Agency',
      text,
      html: `<div style="font:16px/1.6 system-ui,sans-serif;color:#16181B"><p>${text
        .split('\n\n')
        .map((p) => p.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!))
        .join('</p><p>')}</p></div>`,
    });
  } catch (err) {
    await alertOwnerOfFailure(env, rid, `Auto-reply failed for lead ${id} (${e.email})`, err);
  }

  // Optional outbound CRM webhook (n8n-compatible JSON). No IP hash.
  if (env.CRM_WEBHOOK_URL) {
    try {
      const res = await fetch(env.CRM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, created_at: new Date().toISOString(), ...e, message }),
      });
      if (!res.ok) log('warn', rid, 'CRM webhook failed', { status: res.status });
    } catch (err) {
      log('warn', rid, 'CRM webhook error', { error: String(err) });
    }
  }
}

export const onRequest: PagesFunction<Env> = async () => json({ ok: false, message: 'Method not allowed' }, 405, { allow: 'POST' });
