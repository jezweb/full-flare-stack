import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "./user-nav";
import type { AuthUser } from "@/modules/auth/models/user.model";

interface HeaderProps {
	user: AuthUser;
	title?: string;
}

export function Header({ user, title }: HeaderProps) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<Separator orientation="vertical" className="mr-2 h-4" />
			{title && <h1 className="text-lg font-semibold">{title}</h1>}
			<div className="ml-auto flex items-center gap-2">
				<ModeToggle />
				<UserNav user={user} />
			</div>
		</header>
	);
}
