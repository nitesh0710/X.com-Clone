import type { Env } from './env';
import { escapeHtml, log, oneLine } from './util';

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(env: Env, mail: Mail): Promise<void> {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) throw new Error('Email is not configured (RESEND_API_KEY / FROM_EMAIL)');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [mail.to],
      subject: oneLine(mail.subject, 200),
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** Free push alert: an ntfy topic URL, or a Telegram bot sendMessage URL with chat_id. */
export async function pushAlert(env: Env, text: string, rid: string): Promise<void> {
  if (!env.ALERT_WEBHOOK_URL) return;
  try {
    const isTelegram = env.ALERT_WEBHOOK_URL.includes('api.telegram.org');
    const res = await fetch(env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': isTelegram ? 'application/json' : 'text/plain; charset=utf-8' },
      body: isTelegram ? JSON.stringify({ text }) : text,
    });
    if (!res.ok) log('warn', rid, 'push alert failed', { status: res.status });
  } catch (e) {
    log('warn', rid, 'push alert error', { error: String(e) });
  }
}

/** Last-resort alert to the owner when something important fails. */
export async function alertOwnerOfFailure(env: Env, rid: string, what: string, error: unknown): Promise<void> {
  log('error', rid, what, { error: String(error) });
  await pushAlert(env, `⚠️ Speed Agency: ${what} (request ${rid}). ${String(error).slice(0, 200)}`, rid);
  if (env.OWNER_ALERT_EMAIL && !String(error).startsWith('Resend')) {
    try {
      await sendEmail(env, {
        to: env.OWNER_ALERT_EMAIL,
        subject: `Speed Agency: ${what}`,
        text: `${what}\nRequest: ${rid}\n${String(error)}`,
        html: `<p>${escapeHtml(what)}</p><p>Request: ${escapeHtml(rid)}</p><pre>${escapeHtml(String(error))}</pre>`,
      });
    } catch {
      /* already logged */
    }
  }
}

export function rowsHtml(rows: [string, unknown][]): string {
  return rows
    .filter(([, v]) => v !== '' && v != null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#4A4F57;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
}

export function rowsText(rows: [string, unknown][]): string {
  return rows
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}
