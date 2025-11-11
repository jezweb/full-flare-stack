/**
 * Global 404 Not Found Page
 *
 * Triggered automatically for unmatched URLs.
 * Provides personalized navigation based on authentication status.
 */

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isAuthenticated } from "@/modules/auth/utils/auth-utils";

export default async function NotFound() {
	const authenticated = await isAuthenticated();

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-lg p-6">
				<Alert className="mb-6">
					<Search className="h-4 w-4" />
					<AlertTitle className="text-lg font-semibold">
						Page Not Found
					</AlertTitle>
					<AlertDescription className="mt-2">
						The page you're looking for doesn't exist or has been moved.
					</AlertDescription>
				</Alert>

				{/* Personalized navigation based on auth status */}
				<div className="flex flex-col gap-3 sm:flex-row">
					{authenticated ? (
						<>
							<Button asChild className="flex-1">
								<Link href="/dashboard">
									<Home className="mr-2 h-4 w-4" />
									Go to Dashboard
								</Link>
							</Button>
							<Button asChild variant="outline" className="flex-1">
								<Link href="/">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Home
								</Link>
							</Button>
						</>
					) : (
						<>
							<Button asChild className="flex-1">
								<Link href="/">
									<Home className="mr-2 h-4 w-4" />
									Go to Home
								</Link>
							</Button>
							<Button asChild variant="outline" className="flex-1">
								<Link href="/login">Sign In</Link>
							</Button>
						</>
					)}
				</div>

				{/* Help text */}
				<div className="mt-6 space-y-2 text-sm text-muted-foreground">
					<p>Common reasons for this error:</p>
					<ul className="ml-4 list-disc space-y-1">
						<li>The URL was typed incorrectly</li>
						<li>The page has been moved or deleted</li>
						<li>You followed an outdated link</li>
					</ul>
				</div>
			</Card>
		</div>
	);
}
