/** Cal.com webhook → stores the booking as a 'booking' enquiry. */
import type { Env } from '../_lib/env';
import { hmacSha256Hex, json, log, requestId, timingSafeEqual } from '../_lib/util';
import { pushAlert } from '../_lib/notify';

type CalPayload = {
  triggerEvent?: string;
  payload?: {
    uid?: string;
    title?: string;
    type?: string;
    eventTypeId?: number;
    startTime?: string;
    attendees?: { name?: string; email?: string; timeZone?: string; phoneNumber?: string }[];
    responses?: Record<string, { value?: unknown } | undefined>;
    additionalNotes?: string;
  };
};

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const rid = requestId(request);
  if (!env.CAL_WEBHOOK_SECRET) return json({ ok: false, message: 'Webhook not configured' }, 503);
  const raw = await request.text();
  if (raw.length > 64_000) return json({ ok: false }, 413);
  const given = (request.headers.get('x-cal-signature-256') ?? '').toLowerCase();
  const expected = await hmacSha256Hex(env.CAL_WEBHOOK_SECRET, raw);
  if (!given || !timingSafeEqual(given, expected)) {
    log('warn', rid, 'booking webhook: bad signature');
    return json({ ok: false, message: 'Invalid signature' }, 401);
  }

  let body: CalPayload;
  try {
    body = JSON.parse(raw) as CalPayload;
  } catch {
    return json({ ok: false, message: 'Invalid JSON' }, 400);
  }
  if (body.triggerEvent !== 'BOOKING_CREATED') return json({ ok: true, ignored: body.triggerEvent ?? 'unknown' });

  const p = body.payload ?? {};
  const a = p.attendees?.[0] ?? {};
  const r = p.responses ?? {};
  const name = str(a.name ?? r.name?.value, 100) || 'Unknown';
  const email = str(a.email ?? r.email?.value, 200);
  const phone = str(a.phoneNumber ?? r.attendeePhoneNumber?.value ?? r.phone?.value, 40);
  const notes = str(p.additionalNotes ?? r.notes?.value, 3000);
  const business = str(r.business_name?.value ?? r.business?.value, 150);
  const town = str(r.town_state?.value ?? r.town?.value, 120);
  const id = p.uid ? `cal_${p.uid}`.slice(0, 80) : crypto.randomUUID();
  const message = [`Booked: ${str(p.title, 200)}`, p.startTime && `Start: ${p.startTime} (${str(a.timeZone, 60)})`, notes].filter(Boolean).join('\n');

  try {
    const inserted = await env.DB.prepare(
      `INSERT INTO enquiries (id, created_at, form_type, name, email, phone, business_name, town_state, need, message, source_page, status)
       VALUES (?1, ?2, 'booking', ?3, ?4, ?5, ?6, ?7, 'booking', ?8, '/book', 'new')
       ON CONFLICT(id) DO NOTHING`,
    )
      .bind(id, new Date().toISOString(), name, email, phone, business, town, message)
      .run();
    // Cal.com retries deliveries; only count a booking once.
    if (!inserted.meta.changes) return json({ ok: true, duplicate: true });
    await env.DB.prepare('INSERT INTO events (created_at, name, page, label, session_id) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(new Date().toISOString(), 'booking_made', '/book', str(p.type, 120) || String(p.eventTypeId ?? ''), '')
      .run();
  } catch (err) {
    log('error', rid, 'booking store failed', { error: String(err) });
    return json({ ok: false }, 500);
  }
  waitUntil(pushAlert(env, `New call booked: ${name}${p.startTime ? ` at ${p.startTime}` : ''}`, rid));
  log('info', rid, 'booking stored', { id });
  return json({ ok: true });
};
