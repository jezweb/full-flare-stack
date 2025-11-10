import { describe, expect, it, beforeEach, vi } from "vitest";
import {
	rateLimit,
	getIdentifier,
	createRateLimitResponse,
	withRateLimit,
	rateLimitPresets,
	type RateLimitConfig,
} from "../rate-limit";

describe("rate-limit", () => {
	describe("rateLimit", () => {
		const config: RateLimitConfig = {
			limit: 5,
			windowSeconds: 60,
		};

		beforeEach(() => {
			// Clear memory store between tests by using unique identifiers
			vi.clearAllTimers();
		});

		it("allows requests within limit", async () => {
			const identifier = `test-${Date.now()}-1`;

			const result1 = await rateLimit(config, identifier);
			expect(result1.allowed).toBe(true);
			expect(result1.remaining).toBe(4);

			const result2 = await rateLimit(config, identifier);
			expect(result2.allowed).toBe(true);
			expect(result2.remaining).toBe(3);
		});

		it("blocks requests exceeding limit", async () => {
			const identifier = `test-${Date.now()}-2`;

			// Use up all 5 requests
			for (let i = 0; i < 5; i++) {
				const result = await rateLimit(config, identifier);
				expect(result.allowed).toBe(true);
			}

			// 6th request should be blocked
			const blocked = await rateLimit(config, identifier);
			expect(blocked.allowed).toBe(false);
			expect(blocked.remaining).toBe(0);
		});

		it("returns correct reset time", async () => {
			const identifier = `test-${Date.now()}-3`;
			const result = await rateLimit(config, identifier);

			expect(result.resetIn).toBeLessThanOrEqual(config.windowSeconds);
			expect(result.resetIn).toBeGreaterThan(0);
		});

		it("resets count after window expires", async () => {
			const identifier = `test-${Date.now()}-4`;
			const shortConfig: RateLimitConfig = {
				limit: 2,
				windowSeconds: 1, // 1 second window for testing
			};

			// Use up limit
			await rateLimit(shortConfig, identifier);
			await rateLimit(shortConfig, identifier);

			// Should be blocked
			const blocked = await rateLimit(shortConfig, identifier);
			expect(blocked.allowed).toBe(false);

			// Wait for window to expire
			await new Promise((resolve) => setTimeout(resolve, 1100));

			// Should be allowed again
			const allowed = await rateLimit(shortConfig, identifier);
			expect(allowed.allowed).toBe(true);
			expect(allowed.remaining).toBe(shortConfig.limit - 1);
		});

		it("returns correct limit values", async () => {
			const identifier = `test-${Date.now()}-5`;
			const result = await rateLimit(config, identifier);

			expect(result.limit).toBe(config.limit);
			expect(result.remaining).toBe(config.limit - 1);
		});
	});

	describe("getIdentifier", () => {
		it("extracts CF-Connecting-IP header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "1.2.3.4",
				},
			});

			expect(getIdentifier(request)).toBe("1.2.3.4");
		});

		it("extracts X-Forwarded-For header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"X-Forwarded-For": "1.2.3.4, 5.6.7.8",
				},
			});

			expect(getIdentifier(request)).toBe("1.2.3.4");
		});

		it("extracts X-Real-IP header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"X-Real-IP": "1.2.3.4",
				},
			});

			expect(getIdentifier(request)).toBe("1.2.3.4");
		});

		it("falls back to dev-user when no headers", () => {
			const request = new Request("http://localhost");
			expect(getIdentifier(request)).toBe("dev-user");
		});

		it("prioritizes CF-Connecting-IP over others", () => {
			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "1.2.3.4",
					"X-Forwarded-For": "5.6.7.8",
					"X-Real-IP": "9.10.11.12",
				},
			});

			expect(getIdentifier(request)).toBe("1.2.3.4");
		});
	});

	describe("createRateLimitResponse", () => {
		it("creates 429 response with correct headers", () => {
			const result = {
				allowed: false,
				remaining: 0,
				limit: 5,
				resetIn: 30,
			};

			const response = createRateLimitResponse(result);

			expect(response.status).toBe(429);
			expect(response.headers.get("Retry-After")).toBe("30");
			expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
			expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
			expect(response.headers.get("Content-Type")).toBe("application/json");
		});

		it("includes error message in body", async () => {
			const result = {
				allowed: false,
				remaining: 0,
				limit: 5,
				resetIn: 30,
			};

			const response = createRateLimitResponse(result);
			const body = await response.json();

			expect(body.error).toBe("Too many requests");
			expect(body.retryAfter).toBe(30);
		});
	});

	describe("withRateLimit", () => {
		it("allows requests within limit", async () => {
			const mockHandler = vi.fn(() =>
				Promise.resolve(new Response("OK"))
			);
			const config: RateLimitConfig = { limit: 10, windowSeconds: 60 };
			const wrappedHandler = withRateLimit(config, mockHandler);

			const request = new Request("http://localhost");
			const response = await wrappedHandler(request);

			expect(response.status).toBe(200);
			expect(mockHandler).toHaveBeenCalledWith(request);
			expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
		});

		it("blocks requests exceeding limit", async () => {
			const mockHandler = vi.fn(() =>
				Promise.resolve(new Response("OK"))
			);
			const config: RateLimitConfig = { limit: 2, windowSeconds: 60 };
			const wrappedHandler = withRateLimit(config, mockHandler);

			const identifier = "test-ip-" + Date.now();
			const request = new Request("http://localhost", {
				headers: { "CF-Connecting-IP": identifier },
			});

			// First two requests should succeed
			await wrappedHandler(request);
			await wrappedHandler(request);

			// Third request should be blocked
			const blocked = await wrappedHandler(request);
			expect(blocked.status).toBe(429);
			expect(mockHandler).toHaveBeenCalledTimes(2); // Handler not called for 3rd request
		});

		it("adds rate limit headers to successful responses", async () => {
			const mockHandler = vi.fn(() =>
				Promise.resolve(new Response("OK"))
			);
			const config: RateLimitConfig = { limit: 10, windowSeconds: 60 };
			const wrappedHandler = withRateLimit(config, mockHandler);

			// Use unique IP to avoid shared state with other tests
			const uniqueIp = "unique-test-ip-" + Date.now();
			const request = new Request("http://localhost", {
				headers: { "CF-Connecting-IP": uniqueIp },
			});
			const response = await wrappedHandler(request);

			expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
			expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
			expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
		});
	});

	describe("rateLimitPresets", () => {
		it("has correct strict preset", () => {
			expect(rateLimitPresets.strict).toEqual({
				limit: 5,
				windowSeconds: 60,
			});
		});

		it("has correct moderate preset", () => {
			expect(rateLimitPresets.moderate).toEqual({
				limit: 30,
				windowSeconds: 60,
			});
		});

		it("has correct relaxed preset", () => {
			expect(rateLimitPresets.relaxed).toEqual({
				limit: 100,
				windowSeconds: 60,
			});
		});

		it("has correct AI preset", () => {
			expect(rateLimitPresets.ai).toEqual({
				limit: 10,
				windowSeconds: 3600,
			});
		});
	});
});
