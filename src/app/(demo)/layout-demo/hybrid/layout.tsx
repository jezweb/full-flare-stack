import HybridLayout from "@/modules/layouts/hybrid/hybrid.layout";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <HybridLayout>{children}</HybridLayout>;
}
