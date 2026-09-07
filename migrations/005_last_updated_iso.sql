-- `last_updated` was free text ("Feb 7, 2026") because the admin field was a
-- plain text input. It is now a date picker, which only round-trips ISO
-- YYYY-MM-DD, so the seeded value is normalised to match. The footer formats
-- it for display, so nothing user-visible changes.
UPDATE config SET value = '2026-02-07' WHERE key = 'last_updated' AND value = 'Feb 7, 2026';
