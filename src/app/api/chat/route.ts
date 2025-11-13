import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { createWorkersAI } from "workers-ai-provider";
import { streamText } from "ai";
import { getAuthInstance } from "@/modules/auth/utils/auth-utils";
import {
	rateLimit,
	rateLimitPresets,
	getIdentifier,
	createRateLimitResponse,
} from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(request: Request) {
	// Apply rate limiting (AI calls are expensive - strict limits)
	const identifier = getIdentifier(request);
	const rateLimitResult = await rateLimit(rateLimitPresets.ai, identifier);

	if (!rateLimitResult.allowed) {
		return createRateLimitResponse(rateLimitResult);
	}

	try {
		// Check authentication
		const auth = await getAuthInstance();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return new Response(
				JSON.stringify({
					error: "Authentication required",
				}),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// Get Workers AI binding
		const { env } = await getCloudflareContext();

		if (!env.AI) {
			return new Response(
				JSON.stringify({
					error: "AI service is not available",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// Parse request body
		const { messages } = await request.json();

		// Create Workers AI provider
		const workersai = createWorkersAI({ binding: env.AI });

		// Stream response using Vercel AI SDK
		const result = streamText({
			model: workersai("@cf/openai/gpt-oss-120b"),
			messages,
			system:
				"You are a helpful AI assistant. Provide clear, accurate, and concise responses.",
		});

		// Return streaming response with rate limit headers
		const response = result.toDataStreamResponse();

		// Add rate limit headers
		response.headers.set(
			"X-RateLimit-Limit",
			String(rateLimitResult.limit),
		);
		response.headers.set(
			"X-RateLimit-Remaining",
			String(rateLimitResult.remaining),
		);
		response.headers.set(
			"X-RateLimit-Reset",
			String(Math.floor(Date.now() / 1000) + rateLimitResult.resetIn),
		);

		return response;
	} catch (error) {
		console.error("Chat API error:", error);
		return new Response(
			JSON.stringify({
				error:
					error instanceof Error ? error.message : "Internal server error",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
