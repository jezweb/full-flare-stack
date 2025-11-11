/**
 * Dashboard Not Found Page
 *
 * Handles missing dashboard resources (invalid todo IDs, deleted items, etc.).
 * Assumes user is authenticated (they're in the dashboard).
 */

import Link from "next/link";
import { FileQuestion, Home, ListTodo, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardNotFound() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Card className="w-full max-w-lg p-6">
				<Alert className="mb-6">
					<FileQuestion className="h-4 w-4" />
					<AlertTitle className="text-lg font-semibold">
						Resource Not Found
					</AlertTitle>
					<AlertDescription className="mt-2">
						The item you're looking for doesn't exist or may have been deleted.
					</AlertDescription>
				</Alert>

				{/* Navigation options */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild className="flex-1">
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Dashboard Home
						</Link>
					</Button>
					<Button asChild variant="outline" className="flex-1">
						<Link href="/dashboard/todos">
							<ListTodo className="mr-2 h-4 w-4" />
							View Todos
						</Link>
					</Button>
				</div>

				{/* Quick actions */}
				<div className="mt-6 border-t pt-6">
					<p className="mb-3 text-sm font-medium text-muted-foreground">
						Quick Actions:
					</p>
					<Button asChild variant="secondary" className="w-full">
						<Link href="/dashboard/todos/new">
							<Plus className="mr-2 h-4 w-4" />
							Create New Todo
						</Link>
					</Button>
				</div>

				{/* Common causes */}
				<div className="mt-6 space-y-2 text-sm text-muted-foreground">
					<p>This might have happened because:</p>
					<ul className="ml-4 list-disc space-y-1">
						<li>The item was deleted by you or another user</li>
						<li>The link you followed is outdated</li>
						<li>You don't have access to this resource</li>
					</ul>
				</div>
			</Card>
		</div>
	);
}
