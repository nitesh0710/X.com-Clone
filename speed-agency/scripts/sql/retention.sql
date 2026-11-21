-- Data retention, run weekly by .github/workflows/speed-agency-maintenance.yml.
-- RETENTION_MONTHS is substituted by the workflow (repository variable, default 24).
DELETE FROM enquiries WHERE status IN ('lost', 'spam') AND created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-__RETENTION_MONTHS__ months');
DELETE FROM events WHERE created_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-13 months');
DELETE FROM rate_limits WHERE window_start < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day');
