import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HybridLayoutDemo() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Hybrid Layout</h1>
				<p className="text-muted-foreground mt-2">
					Top header + sidebar for complex enterprise applications
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
							<strong>Top header bar</strong> - Branding and global actions
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Left sidebar</strong> - Main navigation menu
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Most polished</strong> - Linear/Notion style appearance
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Separates concerns</strong> - Branding separate from navigation
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Best for</strong> - Complex SaaS, enterprise apps
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle>Organizations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">8</div>
						<p className="text-xs text-muted-foreground">3 active</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Workspaces</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">15</div>
						<p className="text-xs text-muted-foreground">12 configured</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>API Keys</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">23</div>
						<p className="text-xs text-muted-foreground">5 expiring soon</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Integrations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">All active</p>
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
					<Link href="/layout-demo/top-nav">
						<Button variant="outline">Top Nav Layout</Button>
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
