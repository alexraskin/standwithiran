const RSS_URL = 'https://azadiwire.org/feed.xml'
const CACHE_MAX_AGE = 600 // 10 minutes

export const onRequestGet: PagesFunction = async () => {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'StandWithIran/1.0',
      },
    })

    if (!res.ok) {
      return Response.json(
        { error: 'Failed to fetch RSS feed' },
        { status: 502 },
      )
    }

    const xml = await res.text()

    const items: {
      title: string
      link: string
      pubDate: string
      description: string
      category: string
    }[] = []

    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      const title = extractTag(itemXml, 'title')
      const link = extractTag(itemXml, 'link')
      const pubDate = extractTag(itemXml, 'pubDate')
      const description = extractTag(itemXml, 'description')
      const category = extractTag(itemXml, 'category')

      if (title && link) {
        items.push({
          title: decodeEntities(title),
          link,
          pubDate: pubDate || '',
          description: decodeEntities(description || '').slice(0, 200),
          category: decodeEntities(category || ''),
        })
      }

      if (items.length >= 5) break
    }

    return Response.json(
      { items },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=3600`,
        },
      },
    )
  } catch {
    return Response.json(
      { error: 'Failed to parse RSS feed' },
      { status: 500 },
    )
  }
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`).exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()

  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml)
  return match ? match[1].trim() : ''
}

function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#034;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}
