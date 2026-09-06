/**
 * Single source for the vocabularies the CMS offers and the API accepts.
 * Previously the icon and category lists were declared in admin.astro while the
 * icon-to-emoji map lived in ResourcesPanel.astro, and the API validated
 * neither, so a value outside the list reached the page with no CSS class.
 */
export const ICON_EMOJI = {
  heart: '❤️',
  shield: '🛡️',
  book: '📖',
  megaphone: '📢',
  globe: '🌍',
  money: '💰',
  people: '👥',
  fist: '✊',
  flame: '🔥',
  star: '⭐',
  rocket: '🚀',
  lightning: '⚡',
  hand: '👊',
  peace: '🤝',
} as const;

export const ICONS = Object.keys(ICON_EMOJI) as (keyof typeof ICON_EMOJI)[];

export const CATEGORIES = [
  'information',
  'organization',
  'fundraiser',
  'demonstration',
  'news',
] as const;

export const BANNER_TYPES = ['info', 'urgent', 'success'] as const;

export const DEFAULT_ICON = 'globe';
export const DEFAULT_CATEGORY = 'information';

export function iconEmoji(icon: string): string {
  return ICON_EMOJI[icon as keyof typeof ICON_EMOJI] ?? '🔗';
}

export function isIcon(value: string): boolean {
  return Object.hasOwn(ICON_EMOJI, value);
}

export function isCategory(value: string): boolean {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isBannerType(value: string): boolean {
  return (BANNER_TYPES as readonly string[]).includes(value);
}

/** Rejects every scheme but http and https, so a stored link can never be a
 *  `javascript:` URL rendered into an href on the public page. */
export function isHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/** Accepts an empty string or an ISO `YYYY-MM-DD` date. */
export function isIsoDateOrEmpty(value: string): boolean {
  if (value === '') return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
