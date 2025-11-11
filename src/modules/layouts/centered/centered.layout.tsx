import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { getCurrentUser } from "@/modules/auth/utils/auth-utils";
import authRoutes from "@/modules/auth/auth.route";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";
import todosRoutes from "@/modules/todos/todos.route";
import { UserNav } from "../components/user-nav";

interface CenteredLayoutProps {
	children: React.ReactNode;
}

export default async function CenteredLayout({
	children,
}: CenteredLayoutProps) {
	// Check authentication
	const user = await getCurrentUser();
	if (!user) {
		redirect(authRoutes.login);
	}

	return (
		<div className="flex min-h-screen flex-col">
			{/* Top navigation */}
			<nav className="sticky top-0 z-50 border-b bg-card">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link
								href={dashboardRoutes.dashboard}
								className="text-xl font-bold"
							>
								Full Flare Stack
							</Link>
							<div className="hidden items-center gap-4 md:flex">
								<Link href={dashboardRoutes.dashboard}>
									<Button variant="ghost" size="sm">
										<Home className="mr-2 h-4 w-4" />
										Home
									</Button>
								</Link>
								<Link href={todosRoutes.list}>
									<Button variant="ghost" size="sm">
										<CheckSquare className="mr-2 h-4 w-4" />
										Todos
									</Button>
								</Link>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<ModeToggle />
							<UserNav user={user} />
						</div>
					</div>
				</div>
			</nav>

			{/* Centered content (max-width) */}
			<main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
		</div>
	);
}
