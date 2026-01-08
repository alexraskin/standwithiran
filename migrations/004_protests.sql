-- Create protests table
CREATE TABLE IF NOT EXISTS protests (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    city_village TEXT,
    county TEXT,
    province TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    estimated_size INTEGER,
    description TEXT,
    injured INTEGER DEFAULT 0,
    arrested INTEGER DEFAULT 0,
    killed INTEGER DEFAULT 0,
    link TEXT,
    media_url TEXT,
    source TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_protests_date ON protests(date DESC);
CREATE INDEX IF NOT EXISTS idx_protests_province ON protests(province);
CREATE INDEX IF NOT EXISTS idx_protests_location ON protests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_protests_custom ON protests(is_custom);

-- Store last sync time for FDD data
INSERT INTO settings (key, value) 
VALUES ('protests_last_sync', '0') 
ON CONFLICT (key) DO NOTHING;
