export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
  featured: boolean;
  /** Organizations that document victims and abuses: listed on /victims/, /evidence/ and in the footer. */
  documentation: boolean;
  /** One-line description, shown on the /victims/ organisation cards. Empty for most links. */
  description: string;
  description_fa: string;
}

export interface TimelineEvent {
  id: string;
  /** ASCII digits, e.g. "1979" or "2025–2026". */
  year: string;
  title: string;
  title_fa: string;
  summary: string;
  summary_fa: string;
  /** Shown on the home page. */
  featured: boolean;
}

export interface Report {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  category: string;
}

export interface StatDates {
  amini: string;
  protest: string;
  blackout: string;
  /** Optional. Empty until set in src/data/site.yaml; the counter is hidden while empty
   *  rather than falling back to an invented date. */
  war: string;
}

export interface SiteData {
  links: Link[];
  timeline: TimelineEvent[];
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

export interface Victim {
  id: string;
  name: string;
  name_fa: string;
  age?: number;
  place: string;
  /** ISO date of death, YYYY-MM-DD. */
  date: string;
  summary: string;
  /** Organisation that documents this person; `url` is their case record. */
  source: string;
  url: string;
  group: string;
}

export interface VictimStat {
  id: string;
  figure: string;
  label: string;
  label_fa: string;
  source: string;
  url: string;
}
