"use client";

/**
 * Dashboard Error Boundary
 *
 * Catches errors specific to the dashboard and its nested routes.
 * Provides dashboard-specific recovery options and maintains layout context.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw, ListTodo } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	logError,
	categorizeError,
	getUserFriendlyMessage,
} from "@/lib/error-logger";

interface DashboardErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
	useEffect(() => {
		// Log error with dashboard context
		logError(error, {
			route: window.location.pathname,
			action: "dashboard_error",
		});
	}, [error]);

	const errorType = categorizeError(error);
	const userMessage = getUserFriendlyMessage(errorType);

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Card className="w-full max-w-lg p-6">
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle className="text-lg font-semibold">
						Dashboard Error
					</AlertTitle>
					<AlertDescription className="mt-2">{userMessage}</AlertDescription>
				</Alert>

				{/* Show error details in development */}
				{process.env.NODE_ENV === "development" && (
					<div className="mb-6 rounded-lg bg-muted p-4">
						<p className="mb-2 text-sm font-medium text-muted-foreground">
							Development Details:
						</p>
						<p className="text-sm font-mono text-muted-foreground break-all">
							{error.message}
						</p>
						{error.digest && (
							<p className="mt-2 text-xs text-muted-foreground">
								Error ID: {error.digest}
							</p>
						)}
					</div>
				)}

				{/* Dashboard-specific action buttons */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button onClick={reset} className="flex-1">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try Again
					</Button>

					<Button asChild variant="outline" className="flex-1">
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Dashboard Home
						</Link>
					</Button>
				</div>

				{/* Quick navigation to common areas */}
				<div className="mt-4 border-t pt-4">
					<p className="mb-3 text-sm font-medium text-muted-foreground">
						Quick Navigation:
					</p>
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="ghost" size="sm">
							<Link href="/dashboard/todos">
								<ListTodo className="mr-2 h-4 w-4" />
								Todos
							</Link>
						</Button>
					</div>
				</div>

				{/* Help text */}
				<p className="mt-6 text-center text-sm text-muted-foreground">
					If this problem persists, please contact support.
				</p>
			</Card>
		</div>
	);
}
