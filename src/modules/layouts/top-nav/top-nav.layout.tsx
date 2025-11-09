import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, CheckSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { getCurrentUser } from "@/modules/auth/utils/auth-utils";
import authRoutes from "@/modules/auth/auth.route";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";
import todosRoutes from "@/modules/todos/todos.route";
import { UserNav } from "../components/user-nav";

interface TopNavLayoutProps {
	children: React.ReactNode;
}

export default async function TopNavLayout({ children }: TopNavLayoutProps) {
	// Check authentication
	const user = await getCurrentUser();
	if (!user) {
		redirect(authRoutes.login);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<nav className="sticky top-0 z-50 border-b bg-card">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						{/* Logo and desktop nav */}
						<div className="flex items-center gap-6">
							<Link
								href={dashboardRoutes.dashboard}
								className="text-xl font-bold"
							>
								TodoApp
							</Link>
							<div className="hidden items-center gap-4 md:flex">
								<Button asChild variant="ghost" size="sm">
									<Link href={dashboardRoutes.dashboard}>
										<Home className="mr-2 h-4 w-4" />
										Home
									</Link>
								</Button>
								<Button asChild variant="ghost" size="sm">
									<Link href={todosRoutes.list}>
										<CheckSquare className="mr-2 h-4 w-4" />
										Todos
									</Link>
								</Button>
							</div>
						</div>

						{/* Desktop actions */}
						<div className="hidden items-center gap-2 md:flex">
							<ModeToggle />
							<UserNav user={user} />
						</div>

						{/* Mobile menu */}
						<div className="flex items-center gap-2 md:hidden">
							<ModeToggle />
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon">
										<Menu className="h-5 w-5" />
										<span className="sr-only">Open menu</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="right">
									<SheetHeader>
										<SheetTitle>Navigation</SheetTitle>
										<SheetDescription>
											Access your dashboard and features
										</SheetDescription>
									</SheetHeader>
									<div className="mt-6 flex flex-col gap-4">
										<Button asChild variant="ghost" size="sm" className="w-full justify-start">
											<Link href={dashboardRoutes.dashboard}>
												<Home className="mr-2 h-4 w-4" />
												Home
											</Link>
										</Button>
										<Button asChild variant="ghost" size="sm" className="w-full justify-start">
											<Link href={todosRoutes.list}>
												<CheckSquare className="mr-2 h-4 w-4" />
												Todos
											</Link>
										</Button>
										<div className="mt-4 border-t pt-4">
											<UserNav user={user} />
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</nav>

			{/* Full-width content */}
			<main className="flex-1 p-4">{children}</main>
		</div>
	);
}
