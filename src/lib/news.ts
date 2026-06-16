import he from 'he';
import type { NewsItem } from './types';

const RSS_URL = 'https://azadiwire.org/feed.xml';

export async function getNewsItems(): Promise<NewsItem[] | null> {
  try {
    const res = await fetch(RSS_URL, {
      signal: AbortSignal.timeout(4000),
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'StandWithIran/1.0',
      },
    });

    if (!res.ok) return null;

    const xml = await res.text();
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate');
      const description = extractTag(itemXml, 'description');
      const category = extractTag(itemXml, 'category');

      if (title && link) {
        items.push({
          title: he.decode(stripHtml(title)),
          link,
          pubDate: pubDate || '',
          description: he.decode(stripHtml(description || '')).slice(0, 200),
          category: he.decode(stripHtml(category || '')),
        });
      }

      if (items.length >= 5) break;
    }

    return items;
  } catch {
    return null;
  }
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`).exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
  return match ? match[1].trim() : '';
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}
