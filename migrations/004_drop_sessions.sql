-- Admin auth moved to Cloudflare Access, which issues and validates its own
-- signed assertions. The Worker no longer mints or stores sessions, so this
-- table is dead weight holding hashes of revoked cookies.
DROP TABLE IF EXISTS sessions;
