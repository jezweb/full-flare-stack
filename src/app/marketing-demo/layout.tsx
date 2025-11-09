import MarketingLayout from "@/modules/layouts/marketing/marketing.layout";

export default function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MarketingLayout>{children}</MarketingLayout>;
}
