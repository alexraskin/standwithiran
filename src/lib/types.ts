export interface Link {
  id: number;
  title: string;
  url: string;
  icon: string;
  category: string;
  featured: boolean;
  sort_order: number;
}

/** Raw `links` row shape as D1 returns it, before `featured` is narrowed. */
export interface LinkRow extends Omit<Link, 'featured'> {
  featured: number;
}

export interface StatDates {
  amini: string;
  protest: string;
  blackout: string;
  /** Optional. Empty until an admin sets it; the counter is hidden while empty
   *  rather than falling back to an invented date. */
  war: string;
}

export interface SiteData {
  links: Link[];
  banner: {
    enabled: boolean;
    type: string;
    text: string;
    link: string;
  };
  profile: {
    description: string;
    description_fa: string;
  };
  stats: StatDates;
  contactEmail: string;
  lastUpdated: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: string;
}
