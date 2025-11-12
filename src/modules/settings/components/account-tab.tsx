import { CheckCircle2, XCircle, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AccountSettings } from "../actions/get-account-settings.action";

interface AccountTabProps {
	settings: AccountSettings;
}

export function AccountTab({ settings }: AccountTabProps) {
	const { user, connectedAccounts } = settings;

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	};

	const formatMemberSince = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			year: "numeric",
		}).format(date);
	};

	const hasGoogleAccount = connectedAccounts.some((acc) => acc.provider === "google");

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>Your account details and verification status</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Mail className="h-5 w-5 mr-3 text-muted-foreground" />
								<div>
									<div className="text-sm font-medium">Email Address</div>
									<div className="text-sm text-muted-foreground">{user.email}</div>
								</div>
							</div>
							{user.emailVerified ? (
								<Badge variant="default" className="gap-1">
									<CheckCircle2 className="h-3 w-3" />
									Verified
								</Badge>
							) : (
								<Badge variant="secondary" className="gap-1">
									<XCircle className="h-3 w-3" />
									Not Verified
								</Badge>
							)}
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
								<div>
									<div className="text-sm font-medium">Member Since</div>
									<div className="text-sm text-muted-foreground">
										{formatMemberSince(user.createdAt)}
									</div>
								</div>
							</div>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
								<div>
									<div className="text-sm font-medium">Last Updated</div>
									<div className="text-sm text-muted-foreground">
										{formatDate(user.updatedAt)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Connected Accounts</CardTitle>
					<CardDescription>
						Accounts you use to sign in to Full Flare Stack
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="currentColor"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="currentColor"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="currentColor"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
							</div>
							<div>
								<div className="font-medium">Google</div>
								<div className="text-sm text-muted-foreground">
									Sign in with Google account
								</div>
							</div>
						</div>
						{hasGoogleAccount ? (
							<Badge variant="default" className="gap-1">
								<CheckCircle2 className="h-3 w-3" />
								Connected
							</Badge>
						) : (
							<Badge variant="secondary">Not Connected</Badge>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
