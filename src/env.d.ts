type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

/**
 * Cloudflare Access settings, set as Worker vars rather than checked in: the
 * team domain and application AUD tag are account-specific and do not exist
 * until the Access application is created. Neither is secret — they identify
 * the application, they do not authorize anything — but declaring them here
 * rather than in wrangler.jsonc keeps `wrangler types` from narrowing them to
 * literal string types, and survives regeneration of worker-configuration.d.ts.
 *
 *   npx wrangler secret put CF_ACCESS_TEAM_DOMAIN   # e.g. yourteam.cloudflareaccess.com
 *   npx wrangler secret put CF_ACCESS_AUD           # the application's Audience tag
 *
 * Both are optional at the type level so a missing one fails closed at runtime
 * instead of failing to compile.
 */
declare namespace Cloudflare {
	interface Env {
		CF_ACCESS_TEAM_DOMAIN?: string;
		CF_ACCESS_AUD?: string;
	}
}
