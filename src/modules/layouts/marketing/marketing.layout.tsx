import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import authRoutes from "@/modules/auth/auth.route";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";

interface MarketingLayoutProps {
	children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Marketing header */}
			<header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						<Link href="/" className="text-xl font-bold">
							TodoApp
						</Link>
						<div className="flex items-center gap-4">
							<ModeToggle />
							<Link href={authRoutes.login}>
								<Button variant="ghost" size="sm">
									Log in
								</Button>
							</Link>
							<Link href={authRoutes.signup}>
								<Button size="sm">Sign up</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Full-width content */}
			<main className="flex-1">{children}</main>

			{/* Footer */}
			<footer className="border-t bg-muted/40">
				<div className="container mx-auto px-4 py-8">
					<div className="grid gap-8 md:grid-cols-3">
						<div>
							<h3 className="mb-3 text-sm font-semibold">Product</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<Link href="#features" className="hover:text-foreground">
										Features
									</Link>
								</li>
								<li>
									<Link href="#pricing" className="hover:text-foreground">
										Pricing
									</Link>
								</li>
								<li>
									<Link href={dashboardRoutes.dashboard} className="hover:text-foreground">
										Dashboard
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-3 text-sm font-semibold">Company</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<Link href="#about" className="hover:text-foreground">
										About
									</Link>
								</li>
								<li>
									<Link href="#blog" className="hover:text-foreground">
										Blog
									</Link>
								</li>
								<li>
									<Link href="#contact" className="hover:text-foreground">
										Contact
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-3 text-sm font-semibold">Legal</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<Link href="#privacy" className="hover:text-foreground">
										Privacy
									</Link>
								</li>
								<li>
									<Link href="#terms" className="hover:text-foreground">
										Terms
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
						© {new Date().getFullYear()} TodoApp. Built with Next.js +
						Cloudflare.
					</div>
				</div>
			</footer>
		</div>
	);
}
