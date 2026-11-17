import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  isBannerType,
  isCategory,
  isHttpUrl,
  isIcon,
  isIsoDateOrEmpty,
  REPORT_CATEGORIES,
  VICTIM_GROUPS,
} from './lib/content-schema';

// Content is edited as YAML in src/data/. These schemas are the only validation
// it gets, so a bad URL, icon or date fails the build instead of reaching the page.
const httpUrl = z.string().refine(isHttpUrl, 'must be an http(s) URL');
const isoDate = z.string().refine(isIsoDateOrEmpty, 'must be YYYY-MM-DD or empty');

const links = defineCollection({
  loader: file('src/data/links.yaml'),
  schema: z.object({
    title: z.string().min(1),
    url: httpUrl,
    icon: z.string().refine(isIcon, 'unknown icon, see ICON_EMOJI'),
    category: z.string().refine(isCategory, 'unknown category, see CATEGORIES'),
    featured: z.boolean().default(false),
    documentation: z.boolean().default(false),
    description: z.string().default(''),
    description_fa: z.string().default(''),
  }),
});

const timeline = defineCollection({
  loader: file('src/data/timeline.yaml'),
  schema: z.object({
    year: z.string().regex(/^\d{4}(–\d{4})?$/, 'YYYY or YYYY–YYYY (en dash)'),
    title: z.string().min(1),
    title_fa: z.string().min(1),
    summary: z.string().min(1),
    summary_fa: z.string().min(1),
    featured: z.boolean().default(false),
  }),
});

const reports = defineCollection({
  loader: file('src/data/reports.yaml'),
  schema: z.object({
    title: z.string().min(1),
    source: z.string().min(1),
    date: z.string().min(1).refine(isIsoDateOrEmpty, 'must be YYYY-MM-DD'),
    summary: z.string().min(1),
    url: httpUrl,
    category: z.enum(REPORT_CATEGORIES),
  }),
});

const site = defineCollection({
  loader: file('src/data/site.yaml'),
  schema: z.object({
    banner: z.object({
      enabled: z.boolean(),
      type: z.string().refine(isBannerType, 'unknown banner type, see BANNER_TYPES'),
      text: z.string(),
      link: z.union([httpUrl, z.literal('')]),
    }),
    profile: z.object({
      description: z.string(),
      description_fa: z.string(),
    }),
    stats: z.object({
      amini: isoDate,
      protest: isoDate,
      blackout: isoDate,
      war: isoDate,
    }),
    contact_email: z.union([z.email(), z.literal('')]),
    last_updated: isoDate,
  }),
});

const victims = defineCollection({
  loader: file('src/data/victims.yaml'),
  schema: z.object({
    name: z.string().min(1),
    name_fa: z.string().min(1),
    age: z.number().int().positive().optional(),
    place: z.string().min(1),
    date: z.string().min(1).refine(isIsoDateOrEmpty, 'must be YYYY-MM-DD'),
    summary: z.string().min(1),
    source: z.string().min(1),
    url: httpUrl,
    group: z.enum(VICTIM_GROUPS),
  }),
});

const victimStats = defineCollection({
  loader: file('src/data/victim-stats.yaml'),
  schema: z.object({
    figure: z.string().min(1),
    label: z.string().min(1),
    label_fa: z.string().min(1),
    source: z.string().min(1),
    url: httpUrl,
  }),
});

export const collections = { links, timeline, reports, site, victims, victimStats };
