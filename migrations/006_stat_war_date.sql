-- Fourth stat counter: days since the war began.
--
-- Seeded empty rather than with a date. There is no fallback for this one in
-- DEFAULT_STAT_DATES, and StatsPanel omits the block while the value is empty,
-- so the strip keeps its current three counters until an admin sets a date at
-- /admin.
INSERT OR IGNORE INTO config (key, value) VALUES ('stat_war_date', '');
