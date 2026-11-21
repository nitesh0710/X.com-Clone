import { LEAD_STATUSES } from '../../../src/lib/schema';
import type { Env } from '../../_lib/env';
import { json } from '../../_lib/util';

const COLS = [
  'id', 'created_at', 'form_type', 'status', 'name', 'email', 'phone', 'business_name', 'town_state', 'trade', 'need',
  'website_url', 'timeline', 'budget', 'message', 'source_page', 'utm_source', 'utm_medium', 'utm_campaign',
  'marketing_consent', 'consent_text_version', 'notes',
] as const;

const csvCell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? '';
  const where = (LEAD_STATUSES as readonly string[]).includes(status) ? 'WHERE status = ?1' : '';
  const stmt = env.DB.prepare(`SELECT ${COLS.join(', ')} FROM enquiries ${where} ORDER BY created_at DESC LIMIT 2000`);
  const { results } = await (where ? stmt.bind(status) : stmt).all<Record<string, unknown>>();

  if (url.searchParams.get('format') === 'csv') {
    const csv = [COLS.join(','), ...results.map((r) => COLS.map((c) => csvCell(r[c])).join(','))].join('\r\n');
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="speed-agency-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        'cache-control': 'no-store',
      },
    });
  }
  return json({ leads: results });
};
