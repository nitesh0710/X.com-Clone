import type { Env } from '../_lib/env';
import { verifyAccess } from '../_lib/access';

/** Guards the static /admin pages too (they hold no data, but keep them private). */
export const onRequest: PagesFunction<Env> = async (ctx) => {
  const r = await verifyAccess(ctx.request, ctx.env);
  if (!r.ok) return new Response(`Forbidden: ${r.reason}`, { status: r.status, headers: { 'cache-control': 'no-store' } });
  const res = await ctx.next();
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'no-store');
  out.headers.set('x-robots-tag', 'noindex');
  return out;
};
