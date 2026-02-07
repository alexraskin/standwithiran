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
    category: 'information',
    featured: true,
  },
  {
    id: 2,
    title: 'Terminate Hadi Ardeshir Larijani’s Employment',
    url: 'https://c.org/6qDmhFnPgR',
    icon: 'megaphone',
    category: 'information',
    featured: false,
  },
  {
    id: 3,
    title: 'Letter to United Nations',
    url: 'https://c.org/bwHfPNHhVm',
    icon: 'book',
    category: 'information',
    featured: false,
  },
  {
    id: 4,
    title: 'Make Your Voice Heard',
    url: 'https://support-iran.org/',
    icon: 'rocket',
    category: 'information',
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
