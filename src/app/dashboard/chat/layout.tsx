import type { PropsWithChildren } from "react";

export default function ChatLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex h-full flex-col overflow-hidden">{children}</div>
	);
}
