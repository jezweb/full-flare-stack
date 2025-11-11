import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { getCurrentUser } from "@/modules/auth/utils/auth-utils";
import authRoutes from "@/modules/auth/auth.route";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";
import { AppSidebar } from "../components/app-sidebar";
import { UserNav } from "../components/user-nav";

interface HybridLayoutProps {
	children: React.ReactNode;
}

export default async function HybridLayout({ children }: HybridLayoutProps) {
	// Check authentication
	const user = await getCurrentUser();
	if (!user) {
		redirect(authRoutes.login);
	}

	// Read sidebar state from cookie (server-side)
	const cookieStore = await cookies();
	const sidebarState = cookieStore.get("sidebar_state");
	const defaultOpen = sidebarState?.value !== "false";

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset>
				{/* Top header bar */}
				<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4">
					<Link href={dashboardRoutes.dashboard} className="text-xl font-bold">
						Full Flare Stack
					</Link>
					<div className="ml-auto flex items-center gap-2">
						<ModeToggle />
						<UserNav user={user} />
					</div>
				</header>

				{/* Content area */}
				<div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
