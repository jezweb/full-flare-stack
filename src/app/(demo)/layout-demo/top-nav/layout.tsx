import TopNavLayout from "@/modules/layouts/top-nav/top-nav.layout";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <TopNavLayout>{children}</TopNavLayout>;
}
