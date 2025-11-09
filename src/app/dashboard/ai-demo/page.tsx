"use client";

/**
 * AI Summarizer Demo Page
 *
 * Demonstrates Cloudflare Workers AI text summarization with rate limiting.
 * Users can paste text, configure summarization options, and see rate limit enforcement.
 */

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Example texts for quick testing
const EXAMPLES = [
	{
		title: "Tech Article (Short)",
		text: "Next.js 15 introduces several groundbreaking features that transform how developers build web applications. The new Turbopack bundler delivers up to 70% faster local development, while Server Actions simplify data mutations without API routes. React Server Components enable server-side rendering by default, reducing JavaScript bundle sizes and improving performance. The enhanced Image component now supports automatic WebP and AVIF conversion, plus built-in lazy loading. TypeScript support has been upgraded with stricter type checking and better auto-completion. These improvements make Next.js 15 the most developer-friendly and performant version yet, setting new standards for modern web development.",
	},
	{
		title: "Blog Post (Medium)",
		text: "The rise of edge computing is fundamentally changing how we think about web infrastructure. Traditional cloud architectures rely on centralized data centers located in specific geographic regions, which can introduce latency for users far from those locations. Edge computing solves this by distributing computation and data storage across hundreds of locations worldwide, placing them physically closer to end users. This proximity dramatically reduces latency, often from hundreds of milliseconds to just tens of milliseconds. For applications like real-time collaboration tools, video streaming, and e-commerce sites, this performance improvement directly translates to better user experiences and higher conversion rates. Platforms like Cloudflare Workers, Vercel Edge Functions, and Deno Deploy are making edge computing accessible to developers of all skill levels, democratizing what was once only available to large tech companies with global infrastructure.",
	},
	{
		title: "News Article (Long)",
		text: "Artificial intelligence continues to evolve at an unprecedented pace, with new models and capabilities emerging almost weekly. The latest generation of large language models demonstrates remarkable improvements in reasoning, coding, and creative tasks. These models can now write production-quality code, analyze complex data sets, and even engage in nuanced philosophical discussions. However, this rapid advancement raises important questions about AI safety, ethics, and societal impact. Researchers are actively working on alignment techniques to ensure AI systems remain beneficial and controllable as they become more powerful. Meanwhile, businesses across industries are integrating AI into their workflows, from customer service chatbots to automated data analysis and content generation. The economic impact is already visible, with some estimates suggesting AI could add trillions of dollars to global GDP over the next decade. Yet challenges remain, including concerns about job displacement, algorithmic bias, and the environmental cost of training massive models. As we navigate this AI revolution, finding the right balance between innovation and responsible development will be crucial.",
	},
];

interface SummaryResult {
	summary: string;
	originalLength: number;
	summaryLength: number;
	tokensUsed: {
		input: number;
		output: number;
	};
}

interface RateLimitInfo {
	limit: number;
	remaining: number;
	resetAt: number;
}

export default function AISummarizerDemoPage() {
	// Form state
	const [text, setText] = useState("");
	const [style, setStyle] = useState<"concise" | "detailed" | "bullet-points">("concise");
	const [maxLength, setMaxLength] = useState([200]);
	const [language, setLanguage] = useState("English");

	// UI state
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<SummaryResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [rateLimit, setRateLimit] = useState<RateLimitInfo>({
		limit: 10,
		remaining: 10,
		resetAt: 0,
	});
	const [copied, setCopied] = useState(false);

	// Character count validation
	const charCount = text.length;
	const isValidLength = charCount >= 50 && charCount <= 50000;
	const canSubmit = isValidLength && !isLoading;

	// Calculate time until rate limit resets
	const getResetTime = () => {
		if (rateLimit.resetAt === 0) return "";
		const now = Math.floor(Date.now() / 1000);
		const diff = rateLimit.resetAt - now;
		if (diff <= 0) return "Reset";

		const hours = Math.floor(diff / 3600);
		const minutes = Math.floor((diff % 3600) / 60);

		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch("/api/summarize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text,
					config: {
						maxLength: maxLength[0],
						style,
						language,
					},
				}),
			});

			// Extract rate limit headers
			const remaining = response.headers.get("X-RateLimit-Remaining");
			const reset = response.headers.get("X-RateLimit-Reset");
			const limit = response.headers.get("X-RateLimit-Limit");

			if (remaining && reset && limit) {
				setRateLimit({
					limit: Number.parseInt(limit),
					remaining: Number.parseInt(remaining),
					resetAt: Number.parseInt(reset),
				});
			}

			const data = await response.json() as {
				success: boolean;
				data: SummaryResult | null;
				error: string | null;
				message?: string;
			};

			if (!response.ok) {
				if (response.status === 429) {
					setError(
						`Rate limit exceeded! You can make ${rateLimit.limit} requests per hour. ${data.message || "Try again later."}`,
					);
					toast.error("Rate limit exceeded");
				} else {
					setError(data.error || "Something went wrong");
					toast.error("Failed to generate summary");
				}
				return;
			}

			if (data.data) {
				setResult(data.data);
			}
			toast.success("Summary generated!");
		} catch (err) {
			setError("Network error. Please check your connection and try again.");
			toast.error("Network error");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle example selection
	const loadExample = (exampleText: string) => {
		setText(exampleText);
		setResult(null);
		setError(null);
	};

	// Handle copy to clipboard
	const handleCopy = async () => {
		if (!result) return;
		await navigator.clipboard.writeText(result.summary);
		setCopied(true);
		toast.success("Copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	// Handle clear
	const handleClear = () => {
		setText("");
		setResult(null);
		setError(null);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd/Ctrl + Enter to submit
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
				handleSubmit(e as unknown as React.FormEvent);
			}
			// Cmd/Ctrl + K to clear
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				handleClear();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [text, canSubmit]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Sparkles className="h-8 w-8" />
						AI Text Summarizer
					</h1>
					<p className="text-muted-foreground mt-1">
						Powered by Cloudflare Workers AI • Rate Limited: {rateLimit.limit} requests/hour
					</p>
				</div>
				<div className="flex gap-2">
					<Badge variant={rateLimit.remaining > 3 ? "default" : "destructive"}>
						{rateLimit.remaining}/{rateLimit.limit} requests
					</Badge>
					{rateLimit.resetAt > 0 && (
						<Badge variant="outline">Resets: {getResetTime()}</Badge>
					)}
				</div>
			</div>

			{/* Rate limit warning */}
			{rateLimit.remaining <= 3 && rateLimit.remaining > 0 && (
				<Alert>
					<AlertTitle>Low requests remaining</AlertTitle>
					<AlertDescription>
						You have {rateLimit.remaining} request{rateLimit.remaining === 1 ? "" : "s"} left.
						Rate limit resets in {getResetTime()}.
					</AlertDescription>
				</Alert>
			)}

			{/* Error alert */}
			{error && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Input Section */}
				<Card>
					<CardHeader>
						<CardTitle>Input Text</CardTitle>
						<CardDescription>
							Paste or type the text you want to summarize (50 - 50,000 characters)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Paste your text here..."
								className="min-h-[200px] font-mono text-sm"
								autoFocus
							/>
							<div className="flex items-center justify-between text-sm">
								<span className={charCount < 50 || charCount > 50000 ? "text-destructive" : "text-muted-foreground"}>
									{charCount.toLocaleString()} / 50,000 characters
									{charCount > 0 && charCount < 50 && " (minimum 50 required)"}
									{charCount > 50000 && " (maximum 50,000)"}
								</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleClear}
									disabled={text.length === 0}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Clear
								</Button>
							</div>
						</div>

						{/* Example buttons */}
						<div className="space-y-2">
							<Label>Try an example:</Label>
							<div className="flex flex-wrap gap-2">
								{EXAMPLES.map((example, index) => (
									<Button
										key={index}
										type="button"
										variant="outline"
										size="sm"
										onClick={() => loadExample(example.text)}
									>
										<FileText className="h-4 w-4 mr-2" />
										{example.title}
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Configuration Section */}
				<Card>
					<CardHeader>
						<CardTitle>Configuration</CardTitle>
						<CardDescription>
							Customize how the AI summarizes your text
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Style selector */}
						<div className="space-y-3">
							<Label>Summary Style</Label>
							<RadioGroup value={style} onValueChange={(v) => setStyle(v as typeof style)}>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="concise" id="concise" />
									<Label htmlFor="concise" className="font-normal">
										Concise - Brief and to the point
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="detailed" id="detailed" />
									<Label htmlFor="detailed" className="font-normal">
										Detailed - More comprehensive summary
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bullet-points" id="bullet-points" />
									<Label htmlFor="bullet-points" className="font-normal">
										Bullet Points - Key points in list format
									</Label>
								</div>
							</RadioGroup>
						</div>

						<Separator />

						{/* Max length slider */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Maximum Length</Label>
								<span className="text-sm text-muted-foreground">{maxLength[0]} words</span>
							</div>
							<Slider
								value={maxLength}
								onValueChange={setMaxLength}
								min={50}
								max={1000}
								step={50}
							/>
						</div>

						<Separator />

						{/* Language input */}
						<div className="space-y-2">
							<Label htmlFor="language">Language</Label>
							<Input
								id="language"
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								placeholder="e.g., English, Spanish, French"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Submit button */}
				<Button
					type="submit"
					size="lg"
					className="w-full"
					disabled={!canSubmit}
				>
					{isLoading ? (
						<>
							<Sparkles className="mr-2 h-5 w-5 animate-spin" />
							Summarizing...
						</>
					) : (
						<>
							<Sparkles className="mr-2 h-5 w-5" />
							Summarize Text
						</>
					)}
				</Button>
				<p className="text-xs text-center text-muted-foreground">
					Tip: Press Cmd/Ctrl+Enter to summarize • Cmd/Ctrl+K to clear
				</p>
			</form>

			{/* Results Section */}
			{(isLoading || result) && (
				<Card>
					<CardHeader>
						<CardTitle>Summary Result</CardTitle>
						<CardDescription>AI-generated summary of your text</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						) : result ? (
							<>
								<div className="rounded-lg bg-muted p-4">
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{result.summary}
									</p>
								</div>

								{/* Stats */}
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary">
										Original: {result.originalLength.toLocaleString()} chars
									</Badge>
									<Badge variant="secondary">
										Summary: {result.summaryLength.toLocaleString()} chars
									</Badge>
									<Badge variant="secondary">
										Reduction: {Math.round((1 - result.summaryLength / result.originalLength) * 100)}%
									</Badge>
									<Badge variant="outline">
										Input tokens: {result.tokensUsed.input}
									</Badge>
									<Badge variant="outline">
										Output tokens: {result.tokensUsed.output}
									</Badge>
								</div>

								{/* Copy button */}
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleCopy}
								>
									{copied ? (
										<>
											<Check className="mr-2 h-4 w-4" />
											Copied!
										</>
									) : (
										<>
											<Copy className="mr-2 h-4 w-4" />
											Copy to Clipboard
										</>
									)}
								</Button>
							</>
						) : null}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
