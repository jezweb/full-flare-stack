import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAccountSettingsAction } from "./actions/get-account-settings.action";
import { AccountTab } from "./components/account-tab";
import { AppearanceTab } from "./components/appearance-tab";

export default async function SettingsPage() {
	const settings = await getAccountSettingsAction();

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your account settings and preferences
				</p>
			</div>

			<Separator className="mb-8" />

			<Tabs defaultValue="appearance" className="space-y-6">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="appearance">Appearance</TabsTrigger>
					<TabsTrigger value="account">Account</TabsTrigger>
				</TabsList>

				<TabsContent value="appearance" className="space-y-6">
					<AppearanceTab />
				</TabsContent>

				<TabsContent value="account" className="space-y-6">
					<AccountTab settings={settings} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
