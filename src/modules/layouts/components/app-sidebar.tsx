"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, type LucideIcon } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import dashboardRoutes from "@/modules/dashboard/dashboard.route";
import todosRoutes from "@/modules/todos/todos.route";
import type { NavGroup } from "./types";

// Navigation configuration
const navGroups: NavGroup[] = [
	{
		title: "Main",
		items: [
			{
				title: "Dashboard",
				url: dashboardRoutes.dashboard,
				icon: Home,
			},
			{
				title: "Todos",
				url: todosRoutes.list,
				icon: CheckSquare,
			},
		],
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href={dashboardRoutes.dashboard}>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<CheckSquare className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">TodoApp</span>
									<span className="text-xs">Starter Kit</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{navGroups.map((group) => (
					<SidebarGroup key={group.title}>
						{group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive = pathname === item.url;
									const Icon = item.icon as LucideIcon;

									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={isActive}>
												<Link href={item.url}>
													{Icon && <Icon />}
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="sm" asChild>
							<a href="https://github.com/jezweb/fullstack-next-cloudflare">
								<span className="text-xs">View on GitHub</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
