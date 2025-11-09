import CenteredLayout from "@/modules/layouts/centered/centered.layout";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <CenteredLayout>{children}</CenteredLayout>;
}
