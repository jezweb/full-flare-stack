/**
 * Environment Variable Validation
 *
 * Validates required environment variables at build time and runtime.
 * Uses Zod for type-safe validation with helpful error messages.
 *
 * Usage:
 * - Server Components/Actions: Use `env` directly (validated at import)
 * - Prevents deployment with missing/invalid environment variables
 */

import { z } from "zod";

/**
 * Environment variable schema
 *
 * Define all required and optional environment variables here.
 * The app will fail to start if required variables are missing.
 */
const envSchema = z.object({
	// Next.js Environment
	NEXTJS_ENV: z
		.enum(["development", "preview", "production"])
		.default("development")
		.describe("Next.js environment (development/preview/production)"),

	// Cloudflare Configuration
	CLOUDFLARE_ACCOUNT_ID: z
		.string()
		.min(1, "CLOUDFLARE_ACCOUNT_ID is required")
		.describe("Cloudflare account ID"),

	CLOUDFLARE_D1_TOKEN: z
		.string()
		.optional()
		.describe("Cloudflare D1 API token (for remote database access)"),

	CLOUDFLARE_R2_URL: z
		.string()
		.url("CLOUDFLARE_R2_URL must be a valid URL")
		.optional()
		.describe("Cloudflare R2 public URL"),

	CLOUDFLARE_API_TOKEN: z
		.string()
		.optional()
		.describe("Cloudflare API token (for programmatic access)"),

	// Authentication (better-auth)
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
		.describe("Secret key for better-auth session encryption"),

	BETTER_AUTH_URL: z
		.string()
		.url("BETTER_AUTH_URL must be a valid URL")
		.optional()
		.describe("Base URL for better-auth (defaults to localhost in dev)"),

	// OAuth Providers
	GOOGLE_CLIENT_ID: z
		.string()
		.min(1, "GOOGLE_CLIENT_ID is required for Google OAuth")
		.describe("Google OAuth client ID"),

	GOOGLE_CLIENT_SECRET: z
		.string()
		.min(1, "GOOGLE_CLIENT_SECRET is required for Google OAuth")
		.describe("Google OAuth client secret"),

	// Node Environment (set by Next.js)
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development")
		.describe("Node.js environment"),
});

/**
 * Validated environment variables
 *
 * TypeScript will infer the correct types from the schema.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 *
 * This runs at module import time, so the app will fail fast
 * if environment variables are missing or invalid.
 */
function parseEnv(): Env {
	// In Cloudflare Workers, process.env may not be available
	// Use globalThis or other methods to access env vars
	const rawEnv =
		typeof process !== "undefined" ? process.env : ({} as NodeJS.ProcessEnv);

	try {
		return envSchema.parse(rawEnv);
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Format Zod errors into readable messages
			const missingVars = error.issues
				.map((err: z.ZodIssue) => {
					const path = err.path.join(".");
					return `  - ${path}: ${err.message}`;
				})
				.join("\n");

			console.error(
				"\n❌ Environment variable validation failed:\n\n" +
					missingVars +
					"\n\nPlease check your .dev.vars file (local) or Cloudflare Workers secrets (production).\n",
			);

			// In development, provide helpful instructions
			if (rawEnv.NODE_ENV === "development") {
				console.error(
					"💡 To fix:\n" +
						"  1. Copy .dev.vars.example to .dev.vars (if it doesn't exist)\n" +
						"  2. Fill in all required values\n" +
						"  3. Restart your dev server\n",
				);
			}

			throw new Error("Environment validation failed. See errors above.");
		}

		throw error;
	}
}

/**
 * Validated environment variables
 *
 * Import this in server-side code to access validated env vars.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env'
 *
 * const secret = env.BETTER_AUTH_SECRET
 * const accountId = env.CLOUDFLARE_ACCOUNT_ID
 * ```
 */
export const env = parseEnv();

/**
 * Check if we're in production
 */
export const isProd = env.NODE_ENV === "production";

/**
 * Check if we're in development
 */
export const isDev = env.NODE_ENV === "development";

/**
 * Check if we're in test
 */
export const isTest = env.NODE_ENV === "test";

/**
 * Get the base URL for the application
 *
 * Uses BETTER_AUTH_URL if set, otherwise constructs from Vercel/Cloudflare env,
 * or defaults to localhost in development.
 */
export function getBaseUrl(): string {
	if (env.BETTER_AUTH_URL) {
		return env.BETTER_AUTH_URL;
	}

	// In production, try to detect the URL from platform environment
	if (isProd) {
		// Cloudflare Workers URL (when deployed)
		if (
			typeof globalThis !== "undefined" &&
			"CF_PAGES_URL" in globalThis &&
			typeof (globalThis as Record<string, unknown>).CF_PAGES_URL === "string"
		) {
			return (globalThis as Record<string, unknown>)
				.CF_PAGES_URL as string;
		}

		// Vercel URL (if deployed on Vercel)
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}`;
		}

		// Fallback: assume production domain
		console.warn(
			"Production URL not detected. Set BETTER_AUTH_URL environment variable.",
		);
		return "https://your-domain.com";
	}

	// Development default
	return "http://localhost:3000";
}
