-- Speed Agency: initial schema. Apply with `wrangler d1 migrations apply`.
CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,               -- uuid
  created_at TEXT NOT NULL,          -- ISO 8601 UTC
  form_type TEXT NOT NULL,           -- quick | brief | booking
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  town_state TEXT,
  trade TEXT,
  need TEXT,
  website_url TEXT,
  timeline TEXT,
  budget TEXT,
  message TEXT,
  source_page TEXT,                  -- page the form was on
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  consent_text_version TEXT,
  ip_hash TEXT,                      -- SHA-256 of IP + secret salt, never the raw IP
  status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | quoted | won | lost | spam
  notes TEXT
);
CREATE INDEX idx_enquiries_created ON enquiries(created_at);
CREATE INDEX idx_enquiries_status ON enquiries(status);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,                -- see section 10
  page TEXT,
  label TEXT,
  session_id TEXT                    -- random per page load, memory only, no cookie
);
CREATE INDEX idx_events_created_name ON events(created_at, name);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,              -- ip_hash + route
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL
);
