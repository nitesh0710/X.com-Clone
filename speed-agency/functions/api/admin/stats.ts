import type { Env } from '../../_lib/env';
import { json } from '../../_lib/util';

type Row = { label: string; n: number };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const days = [7, 30, 90].includes(Number(new URL(request.url).searchParams.get('days'))) ? Number(new URL(request.url).searchParams.get('days')) : 30;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const q = (sql: string) => env.DB.prepare(sql).bind(since);
  const [cta, starts, submits, byNeed, byCampaign, bookings, funnel, events] = await env.DB.batch<Record<string, unknown>>([
    q(`SELECT label, COUNT(*) AS n FROM events WHERE name = 'cta_click' AND created_at >= ?1 GROUP BY label ORDER BY n DESC LIMIT 50`),
    q(`SELECT COUNT(*) AS n FROM events WHERE name = 'form_start' AND created_at >= ?1`),
    q(`SELECT COUNT(*) AS n FROM events WHERE name = 'form_submit' AND created_at >= ?1`),
    q(`SELECT COALESCE(need, '') AS label, COUNT(*) AS n FROM enquiries WHERE created_at >= ?1 AND status != 'spam' GROUP BY need ORDER BY n DESC`),
    q(`SELECT COALESCE(NULLIF(utm_campaign, ''), '(none)') AS label, COUNT(*) AS n FROM enquiries WHERE created_at >= ?1 AND status != 'spam' GROUP BY label ORDER BY n DESC`),
    q(`SELECT COUNT(*) AS n FROM events WHERE name = 'booking_made' AND created_at >= ?1`),
    q(`SELECT status AS label, COUNT(*) AS n FROM enquiries WHERE created_at >= ?1 GROUP BY status`),
    q(`SELECT name AS label, COUNT(*) AS n FROM events WHERE created_at >= ?1 GROUP BY name ORDER BY n DESC`),
  ]);
  const rows = (r: D1Result<Record<string, unknown>> | undefined) => (r?.results ?? []) as Row[];
  const count = (r: D1Result<Record<string, unknown>> | undefined) => Number(r?.results?.[0]?.n ?? 0);
  const order = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'];
  const f = rows(funnel);
  return json({
    days,
    cta: rows(cta),
    formStarts: count(starts),
    formSubmits: count(submits),
    byNeed: rows(byNeed),
    byCampaign: rows(byCampaign),
    bookings: count(bookings),
    funnel: order.map((s) => ({ label: s, n: f.find((x) => x.label === s)?.n ?? 0 })),
    events: rows(events),
  });
};
