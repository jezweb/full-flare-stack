import SidebarLayout from "@/modules/layouts/sidebar/sidebar.layout";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SidebarLayout>{children}</SidebarLayout>;
}
