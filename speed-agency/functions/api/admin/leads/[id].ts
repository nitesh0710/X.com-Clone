import { LEAD_STATUSES } from '../../../../src/lib/schema';
import type { Env } from '../../../_lib/env';
import { json } from '../../../_lib/util';

export const onRequestPatch: PagesFunction<Env, 'id'> = async ({ request, env, params }) => {
  const id = String(params.id ?? '').slice(0, 80);
  let body: { status?: unknown; notes?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, message: 'Invalid JSON' }, 400);
  }
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !(LEAD_STATUSES as readonly string[]).includes(body.status))
      return json({ ok: false, message: 'Invalid status' }, 400);
    vals.push(body.status);
    sets.push(`status = ?${vals.length}`);
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string' || body.notes.length > 5000) return json({ ok: false, message: 'Invalid notes' }, 400);
    vals.push(body.notes);
    sets.push(`notes = ?${vals.length}`);
  }
  if (!sets.length) return json({ ok: false, message: 'Nothing to update' }, 400);
  vals.push(id);
  const res = await env.DB.prepare(`UPDATE enquiries SET ${sets.join(', ')} WHERE id = ?${vals.length}`).bind(...vals).run();
  if (!res.meta.changes) return json({ ok: false, message: 'Not found' }, 404);
  return json({ ok: true });
};
