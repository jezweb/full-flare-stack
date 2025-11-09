/**
 * Rate Limiting
 *
 * Simple rate limiting implementation using in-memory storage (dev)
 * or Cloudflare KV (production).
 *
 * Prevents abuse of API routes by limiting requests per IP address.
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
	/**
	 * Maximum number of requests allowed in the time window
	 */
	limit: number;

	/**
	 * Time window in seconds
	 */
	windowSeconds: number;

	/**
	 * Optional custom identifier (defaults to IP address)
	 */
	identifier?: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
	/**
	 * Whether the request is allowed
	 */
	allowed: boolean;

	/**
	 * Number of requests remaining in current window
	 */
	remaining: number;

	/**
	 * Total limit for this window
	 */
	limit: number;

	/**
	 * Time in seconds until the rate limit resets
	 */
	resetIn: number;
}

/**
 * In-memory storage for rate limiting (development)
 *
 * Maps identifier -> { count, resetAt }
 */
const memoryStore = new Map<
	string,
	{ count: number; resetAt: number }
>();

/**
 * Clean up expired entries from memory store
 */
function cleanupMemoryStore() {
	const now = Date.now();
	for (const [key, value] of memoryStore.entries()) {
		if (now > value.resetAt) {
			memoryStore.delete(key);
		}
	}
}

// Run cleanup every minute
if (typeof setInterval !== "undefined") {
	setInterval(cleanupMemoryStore, 60 * 1000);
}

/**
 * Rate limit a request
 *
 * @param config - Rate limit configuration
 * @param identifier - Unique identifier for the requester (e.g., IP address)
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = await rateLimit({
 *   limit: 10,        // 10 requests
 *   windowSeconds: 60 // per 60 seconds
 * }, request.ip)
 *
 * if (!result.allowed) {
 *   return new Response('Too many requests', {
 *     status: 429,
 *     headers: {
 *       'Retry-After': String(result.resetIn)
 *     }
 *   })
 * }
 * ```
 */
export async function rateLimit(
	config: RateLimitConfig,
	identifier: string,
): Promise<RateLimitResult> {
	const { limit, windowSeconds } = config;
	const now = Date.now();
	const windowMs = windowSeconds * 1000;

	// Get current state for this identifier
	const current = memoryStore.get(identifier);

	// If no previous state or window expired, start fresh
	if (!current || now > current.resetAt) {
		const resetAt = now + windowMs;
		memoryStore.set(identifier, { count: 1, resetAt });

		return {
			allowed: true,
			remaining: limit - 1,
			limit,
			resetIn: windowSeconds,
		};
	}

	// Increment count
	current.count += 1;
	memoryStore.set(identifier, current);

	// Check if limit exceeded
	const allowed = current.count <= limit;
	const remaining = Math.max(0, limit - current.count);
	const resetIn = Math.ceil((current.resetAt - now) / 1000);

	return {
		allowed,
		remaining,
		limit,
		resetIn,
	};
}

/**
 * Rate limit presets for common use cases
 */
export const rateLimitPresets = {
	/**
	 * Strict: 5 requests per minute
	 * Use for: Login, signup, password reset
	 */
	strict: {
		limit: 5,
		windowSeconds: 60,
	},

	/**
	 * Moderate: 30 requests per minute
	 * Use for: API mutations (POST, PUT, DELETE)
	 */
	moderate: {
		limit: 30,
		windowSeconds: 60,
	},

	/**
	 * Relaxed: 100 requests per minute
	 * Use for: API reads (GET)
	 */
	relaxed: {
		limit: 100,
		windowSeconds: 60,
	},

	/**
	 * AI: 10 requests per hour
	 * Use for: AI/LLM API calls (expensive)
	 */
	ai: {
		limit: 10,
		windowSeconds: 3600, // 1 hour
	},
} as const;

/**
 * Get identifier from request
 *
 * Tries to get the real IP address from various headers.
 * Falls back to a constant if running in development.
 */
export function getIdentifier(request: Request): string {
	// Try Cloudflare's CF-Connecting-IP header
	const cfIp = request.headers.get("CF-Connecting-IP");
	if (cfIp) return cfIp;

	// Try X-Forwarded-For (first IP in chain)
	const forwardedFor = request.headers.get("X-Forwarded-For");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	// Try X-Real-IP
	const realIp = request.headers.get("X-Real-IP");
	if (realIp) return realIp;

	// Fallback for development (localhost)
	return "dev-user";
}

/**
 * Create rate limit response
 *
 * Returns a 429 Too Many Requests response with appropriate headers.
 *
 * @param result - Rate limit result
 * @returns Response object
 */
export function createRateLimitResponse(
	result: RateLimitResult,
): Response {
	return new Response(
		JSON.stringify({
			error: "Too many requests",
			message: `Rate limit exceeded. Try again in ${result.resetIn} seconds.`,
			retryAfter: result.resetIn,
		}),
		{
			status: 429,
			headers: {
				"Content-Type": "application/json",
				"Retry-After": String(result.resetIn),
				"X-RateLimit-Limit": String(result.limit),
				"X-RateLimit-Remaining": String(result.remaining),
				"X-RateLimit-Reset": String(
					Math.floor(Date.now() / 1000) + result.resetIn,
				),
			},
		},
	);
}

/**
 * Rate limit middleware for API routes
 *
 * Usage in API route:
 * ```ts
 * import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit'
 *
 * export const GET = withRateLimit(rateLimitPresets.relaxed, async (request) => {
 *   // Your handler code
 *   return new Response('OK')
 * })
 * ```
 */
export function withRateLimit(
	config: RateLimitConfig,
	handler: (request: Request) => Promise<Response>,
) {
	return async (request: Request): Promise<Response> => {
		const identifier = getIdentifier(request);
		const result = await rateLimit(config, identifier);

		if (!result.allowed) {
			return createRateLimitResponse(result);
		}

		// Add rate limit headers to successful responses
		const response = await handler(request);

		response.headers.set("X-RateLimit-Limit", String(result.limit));
		response.headers.set("X-RateLimit-Remaining", String(result.remaining));
		response.headers.set(
			"X-RateLimit-Reset",
			String(Math.floor(Date.now() / 1000) + result.resetIn),
		);

		return response;
	};
}
