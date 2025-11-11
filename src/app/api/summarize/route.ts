import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import handleApiError from "@/lib/api-error";
import { getAuthInstance } from "@/modules/auth/utils/auth-utils";
import {
    SummarizerService,
    summarizeRequestSchema,
} from "@/services/summarizer.service";
import {
    rateLimit,
    rateLimitPresets,
    getIdentifier,
    createRateLimitResponse,
} from "@/lib/rate-limit";

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
                    success: false,
                    error: "Authentication required",
                    data: null,
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const { env } = await getCloudflareContext();

        if (!env.AI) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "AI service is not available",
                    data: null,
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // parse request body
        const body = await request.json();
        const validated = summarizeRequestSchema.parse(body);

        const summarizerService = new SummarizerService(env.AI);
        const result = await summarizerService.summarize(
            validated.text,
            validated.config,
        );

        return new Response(
            JSON.stringify({
                success: true,
                data: result,
                error: null,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": String(rateLimitResult.limit),
                    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                    "X-RateLimit-Reset": String(
                        Math.floor(Date.now() / 1000) + rateLimitResult.resetIn,
                    ),
                },
            },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
