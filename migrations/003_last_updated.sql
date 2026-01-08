-- Add last_updated timestamp to settings
INSERT INTO settings (key, value) 
VALUES ('last_updated', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT) 
ON CONFLICT (key) DO NOTHING;
