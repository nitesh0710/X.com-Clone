import type { Env } from '../../_lib/env';
import { verifyAccess } from '../../_lib/access';
import { json, sameOrigin } from '../../_lib/util';

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const r = await verifyAccess(ctx.request, ctx.env);
  if (!r.ok) return json({ ok: false, message: r.reason }, r.status);
  if (ctx.request.method !== 'GET' && !sameOrigin(ctx.request)) return json({ ok: false, message: 'Bad origin' }, 403);
  return ctx.next();
};
