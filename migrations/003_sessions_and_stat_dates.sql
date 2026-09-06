-- Admin sessions.
--
-- Replaces the previous scheme where the session cookie was an unsalted
-- SHA-256 of ADMIN_PASSWORD. That value was an offline-crackable hash of the
-- password itself, never expired server side, and survived logout because the
-- server held no session state to revoke.
--
-- Tokens are 256 bits of CSPRNG output. Only sha256(token) is stored, so a
-- database read never yields a usable cookie.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

-- Stat counter dates, previously hardcoded in src/components/StatsPanel.astro.
-- These are the most time-sensitive numbers on the page and were the only
-- content an admin could not edit.
INSERT OR IGNORE INTO config (key, value) VALUES
  ('stat_amini_date', '2022-09-16'),
  ('stat_protest_date', '2025-12-28'),
  ('stat_blackout_date', '2026-01-08');
