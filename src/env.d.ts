type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

/**
 * ADMIN_PASSWORD is a Worker secret, so it never appears in wrangler.jsonc and
 * `wrangler types` cannot discover it. Declaring it here survives regeneration
 * of worker-configuration.d.ts.
 */
declare namespace Cloudflare {
	interface Env {
		ADMIN_PASSWORD: string;
	}
}
