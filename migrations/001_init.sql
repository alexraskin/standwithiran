
CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT 'Stand With Iran',
    title TEXT NOT NULL DEFAULT 'Woman, Life, Freedom',
    subtitle TEXT NOT NULL DEFAULT 'زن، زندگی، آزادی',
    description TEXT NOT NULL DEFAULT 'Supporting the people of Iran in their fight for freedom and human rights.',
    avatar TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'organization',
    icon TEXT NOT NULL DEFAULT 'link',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
    
INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('admin_password', 'changeme123') ON CONFLICT (key) DO NOTHING;
