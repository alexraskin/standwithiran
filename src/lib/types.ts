export interface Link {
  id: number;
  title: string;
  url: string;
  icon: string;
  category: string;
  featured: boolean;
  sort_order: number;
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
