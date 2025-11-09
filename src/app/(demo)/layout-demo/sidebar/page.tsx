import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SidebarLayoutDemo() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Sidebar Layout</h1>
				<p className="text-muted-foreground mt-2">
					Collapsible sidebar perfect for dashboards, CRMs, and admin panels
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
							<strong>Collapsible sidebar</strong> - Toggle between full (16rem) and icon mode (3rem)
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Keyboard shortcut</strong> - Press Cmd/Ctrl+B to toggle
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Cookie persistence</strong> - Remembers your preference (7 days)
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Mobile responsive</strong> - Sheet overlay on mobile devices
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-green-500">✓</span>
						<div>
							<strong>Full-width content</strong> - No width constraints
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">2,543</div>
						<p className="text-xs text-muted-foreground">+12% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Active Sessions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1,234</div>
						<p className="text-xs text-muted-foreground">+8% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$45,231</div>
						<p className="text-xs text-muted-foreground">+23% from last month</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Try Other Layouts</CardTitle>
					<CardDescription>Explore all 5 layout variants</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Button asChild variant="outline">
						<Link href="/layout-demo/top-nav">Top Nav Layout</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/layout-demo/hybrid">Hybrid Layout</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/layout-demo/centered">Centered Layout</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/marketing-demo">Marketing Layout</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
