import { eventSchema, CLIENT_EVENT_NAMES } from '../../src/lib/schema';
import type { Env } from '../_lib/env';
import { ipHash, json, sameOrigin } from '../_lib/util';
import { rateLimit } from '../_lib/ratelimit';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json(null, 204);
  const raw = await request.text();
  if (raw.length > 2000) return json(null, 204);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json(null, 204);
  }
  const parsed = eventSchema.safeParse(data);
  if (!parsed.success || !CLIENT_EVENT_NAMES.includes(parsed.data.name)) return json(null, 204);
  try {
    const hash = await ipHash(request, env);
    if (!(await rateLimit(env.DB, `${hash}:event`, 300, 3600))) return json(null, 204);
    const e = parsed.data;
    await env.DB.prepare('INSERT INTO events (created_at, name, page, label, session_id) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(new Date().toISOString(), e.name, e.page, e.label, e.session_id)
      .run();
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'event insert failed', error: String(err) }));
  }
  return json(null, 204);
};
