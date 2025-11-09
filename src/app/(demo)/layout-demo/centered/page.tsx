import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CenteredLayoutDemo() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Centered Layout</h1>
				<p className="text-muted-foreground mt-2">
					Max-width centered content for documentation, blogs, and forms
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Key Features</CardTitle>
					<CardDescription>What makes this layout great</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Max-width centered</strong> - Optimal reading width (768px)
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Top navigation</strong> - Simple header with user menu
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Clean & distraction-free</strong> - Focus on content
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Prose-friendly</strong> - Perfect for reading and writing
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Best for</strong> - Documentation, blogs, forms, wizards
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="prose prose-neutral dark:prose-invert max-w-none">
				<h2>Example Documentation Content</h2>
				<p>
					This layout is perfect for content-heavy pages where readability is paramount.
					The centered column with optimal width prevents eye strain and makes it easy
					to scan through long-form content.
				</p>
				<p>
					Notice how the content stays within a comfortable reading width, even on
					ultra-wide monitors. This is the same pattern used by popular documentation
					sites and blog platforms.
				</p>
				<h3>Code Examples</h3>
				<p>
					This layout also works great for technical documentation with code examples:
				</p>
				<pre className="bg-muted p-4 rounded-lg overflow-x-auto">
					{`export default function MyComponent() {
  return <div>Hello World</div>;
}`}
				</pre>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Try Other Layouts</CardTitle>
					<CardDescription>Explore all 5 layout variants</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Link href="/layout-demo/sidebar">
						<Button variant="outline">Sidebar Layout</Button>
					</Link>
					<Link href="/layout-demo/top-nav">
						<Button variant="outline">Top Nav Layout</Button>
					</Link>
					<Link href="/layout-demo/hybrid">
						<Button variant="outline">Hybrid Layout</Button>
					</Link>
					<Link href="/marketing-demo">
						<Button variant="outline">Marketing Layout</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
