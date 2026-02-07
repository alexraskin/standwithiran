/**
 * Links Configuration
 *
 * To add a new link, add an object to the `links` array below.
 * Each link requires: id, title, url, icon, category
 * Optional: featured (boolean) - highlights the link
 *
 * Available icons: heart, shield, book, megaphone, globe, money, people, fist
 * Available categories: fundraiser, demonstration, organization, news
 */

export interface Link {
  id: number
  title: string
  url: string
  icon: string
  category: string
  featured?: boolean
}

export const links: Link[] = [
  {
    id: 1,
    title: 'Iran Victims',
    url: 'https://iranvictims.com/',
    icon: 'heart',
    category: 'organization',
    featured: true,
  },
  {
    id: 2,
    title: 'Terminate Hadi Ardeshir Larijani’s Employment',
    url: 'https://c.org/6qDmhFnPgR',
    icon: 'megaphone',
    category: 'demonstration',
    featured: false,
  },
  {
    id: 3,
    title: 'Letter to United Nations',
    url: 'https://c.org/bwHfPNHhVm',
    icon: 'book',
    category: 'news',
    featured: false,
  },
  {
    id: 4,
    title: 'Make Your Voice Heard',
    url: 'https://support-iran.org/',
    icon: 'megaphone',
    category: 'demonstration',
    featured: false,
  },
  {
    id: 5,
    title: 'United 4 Iran',
    url: 'https://united4iran.org',
    icon: 'people',
    category: 'organization',
    featured: false,
  },
  {
    id: 6,
    title: 'Iran Rights',
    url: 'https://www.iranrights.org',
    icon: 'shield',
    category: 'organization',
    featured: false,
  },
  {
    id: 7,
    title: 'Iran Human Rights',
    url: 'https://iranhr.net',
    icon: 'shield',
    category: 'organization',
    featured: false,
  },
]
