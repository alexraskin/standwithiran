-- Add announcement banner settings
INSERT INTO settings (key, value) VALUES ('banner_enabled', 'false') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('banner_text', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('banner_link', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('banner_type', 'info') ON CONFLICT (key) DO NOTHING;

