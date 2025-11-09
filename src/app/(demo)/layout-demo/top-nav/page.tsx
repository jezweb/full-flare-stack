import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopNavLayoutDemo() {
	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Top Nav Layout</h1>
				<p className="text-muted-foreground mt-2">
					Horizontal navigation for simple apps and tools
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
							<strong>Horizontal navigation</strong> - All links visible in top bar
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Full-width content</strong> - No sidebar taking up space
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Mobile responsive</strong> - Hamburger menu with Sheet drawer
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Sticky header</strong> - Navigation always accessible
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Best for</strong> - Simple apps, tools, utilities
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">+3 this week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">156</div>
						<p className="text-xs text-muted-foreground">42 completed</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Team Members</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">2 online now</p>
					</CardContent>
				</Card>
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
					<Link href="/layout-demo/hybrid">
						<Button variant="outline">Hybrid Layout</Button>
					</Link>
					<Link href="/layout-demo/centered">
						<Button variant="outline">Centered Layout</Button>
					</Link>
					<Link href="/marketing-demo">
						<Button variant="outline">Marketing Layout</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
