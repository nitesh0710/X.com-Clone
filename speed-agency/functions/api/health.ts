import type { Env } from '../_lib/env';
import { json } from '../_lib/util';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const row = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    return json({ ok: row?.ok === 1, db: 'up', time: new Date().toISOString() });
  } catch {
    return json({ ok: false, db: 'down' }, 503);
  }
};
