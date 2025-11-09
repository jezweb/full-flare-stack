import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingLayoutDemo() {
	return (
		<div>
			{/* Hero Section */}
			<section className="border-b bg-gradient-to-b from-muted/50 to-background py-20">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Marketing Layout
						</h1>
						<p className="mt-6 text-lg text-muted-foreground">
							Perfect for landing pages, pricing pages, and public marketing sites.
							No authentication required.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-4">
							<Link href="/dashboard">
								<Button size="lg">Go to Dashboard</Button>
							</Link>
							<Link href="/layout-demo/sidebar">
								<Button size="lg" variant="outline">
									View Other Layouts
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<h2 className="text-center text-3xl font-bold">Key Features</h2>
					<p className="mt-4 text-center text-muted-foreground">
						What makes this layout great
					</p>
					<div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>No Authentication</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Public-facing pages don't require login. Perfect for landing pages.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Header with CTA</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Sticky header with Log in / Sign up buttons for conversions.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Full-Width Content</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Support for hero sections, grid layouts, and wide content.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Footer with Links</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Comprehensive footer with navigation, legal, and company links.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Theme Toggle</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Dark/light mode support for better user experience.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Mobile Responsive</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Fully responsive design that works on all devices.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="border-t bg-muted/40 py-20">
				<div className="container mx-auto px-4">
					<div className="grid gap-8 md:grid-cols-3">
						<div className="text-center">
							<div className="text-4xl font-bold">5</div>
							<div className="mt-2 text-sm text-muted-foreground">
								Layout Variants
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold">100%</div>
							<div className="mt-2 text-sm text-muted-foreground">
								Responsive Design
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold">0</div>
							<div className="mt-2 text-sm text-muted-foreground">
								Additional Dependencies
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<Card className="border-2">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">Try Other Layouts</CardTitle>
							<CardDescription>
								Explore all 5 production-ready layout variants
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-wrap justify-center gap-2">
							<Link href="/layout-demo/sidebar">
								<Button variant="outline">Sidebar Layout</Button>
							</Link>
							<Link href="/layout-demo/top-nav">
								<Button variant="outline">Top Nav Layout</Button>
							</Link>
							<Link href="/layout-demo/hybrid">
								<Button variant="outline">Hybrid Layout</Button>
							</Link>
							<Link href="/layout-demo/centered">
								<Button variant="outline">Centered Layout</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
