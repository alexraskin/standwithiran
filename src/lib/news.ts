import { decodeEntities } from './entities';
import type { NewsItem } from './types';

const RSS_URL = 'https://azadiwire.org/feed.xml';
const MAX_ITEMS = 5;
const DESCRIPTION_CHARS = 200;

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
    const itemRegex = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = clean(extractTag(itemXml, 'title'));
      // The link is decoded like every other field. Left raw it kept the
      // `&amp;` escaping the feed is required to use, producing broken hrefs
      // for any item whose URL carries query parameters.
      const link = decodeEntities(extractTag(itemXml, 'link')).trim();

      if (!title || !link) continue;

      items.push({
        title,
        link,
        pubDate: extractTag(itemXml, 'pubDate'),
        description: clean(extractTag(itemXml, 'description')).slice(0, DESCRIPTION_CHARS),
        category: clean(extractTag(itemXml, 'category')),
      });

      if (items.length >= MAX_ITEMS) break;
    }

    return items;
  } catch {
    return null;
  }
}

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp(
    `<${tag}(?:\\s[^>]*)?>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    'i',
  ).exec(xml);
  if (cdata) return cdata[1].trim();

  const plain = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml);
  return plain ? plain[1].trim() : '';
}

/**
 * Decode first, then strip. The previous order stripped literal tags but left
 * entity-encoded ones (`&lt;b&gt;`) to decode into visible markup afterwards.
 */
function clean(text: string): string {
  return decodeEntities(text)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
