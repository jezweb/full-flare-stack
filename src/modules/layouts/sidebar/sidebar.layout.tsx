import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/modules/auth/utils/auth-utils";
import authRoutes from "@/modules/auth/auth.route";
import { AppSidebar } from "../components/app-sidebar";
import { Header } from "../components/header";

interface SidebarLayoutProps {
	children: React.ReactNode;
	title?: string;
}

export default async function SidebarLayout({
	children,
	title,
}: SidebarLayoutProps) {
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
				<Header user={user} title={title} />
				<div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
