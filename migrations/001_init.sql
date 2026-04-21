-- Links table
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'globe',
  category TEXT NOT NULL DEFAULT 'information',
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Key-value config table
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Seed config
INSERT INTO config (key, value) VALUES
  ('banner_enabled', '1'),
  ('banner_type', 'urgent'),
  ('banner_text', 'Iran Victims'),
  ('banner_link', 'https://iranvictims.com/'),
  ('profile_description', 'The Iranian freedom movement has persisted for over four decades with little global awareness. What started in 1979 continues today.

People are demanding basic protections: the ability to speak without prosecution, equal treatment regardless of gender, and safety in daily life. These requests reflect universal principles, not regional politics.

Iran''s contributions to human civilization span millennia. Ancient Persia developed early legal codes protecting individual rights. The region produced breakthrough work in mathematics, astronomy, and literature that influenced cultures worldwide.

Modern Iran operates under a system that contradicts this legacy. Citizens face restrictions that would be unacceptable in most of the world.

Global response has been weak and inconsistent. Brief periods of attention fade quickly. Policy remains largely unchanged.

What Iranians want is straightforward: they want other nations to acknowledge what is occurring and act on that knowledge. They are asking for solidarity based on shared human values, not charity or intervention.

The question is whether the international community will finally pay sustained attention to a struggle that has gone on far too long.'),
  ('contact_email', 'hi@standwithiran.org'),
  ('last_updated', 'Feb 7, 2026');

-- Seed links
INSERT INTO links (title, url, icon, category, featured, sort_order) VALUES
  ('Iran Victims', 'https://iranvictims.com/', 'heart', 'information', 1, 1),
  ('Terminate Hadi Ardeshir Larijani''s Employment', 'https://c.org/6qDmhFnPgR', 'megaphone', 'information', 0, 2),
  ('Letter to United Nations', 'https://c.org/bwHfPNHhVm', 'book', 'information', 0, 3),
  ('Make Your Voice Heard', 'https://support-iran.org/', 'rocket', 'information', 0, 4),
  ('United 4 Iran', 'https://united4iran.org', 'people', 'organization', 0, 5),
  ('Abdorrahman Boroumand Center', 'https://www.iranrights.org', 'shield', 'organization', 0, 6),
  ('Iran Human Rights', 'https://iranhr.net', 'shield', 'organization', 0, 7);
