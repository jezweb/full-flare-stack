/**
 * Dashboard Loading State
 *
 * Shown during navigation to dashboard pages.
 * Uses skeleton components to match the content layout.
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardLoading() {
	return (
		<div className="space-y-6">
			{/* Page header skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" /> {/* Page title */}
				<Skeleton className="h-4 w-96" /> {/* Page description */}
			</div>

			<Separator />

			{/* Action bar skeleton */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-64" /> {/* Search or filter */}
				<Skeleton className="h-10 w-32" /> {/* Action button */}
			</div>

			{/* Content skeleton - grid of cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="p-4">
						<div className="space-y-3">
							<div className="flex items-start justify-between">
								<Skeleton className="h-5 w-3/4" /> {/* Card title */}
								<Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
							</div>
							<Skeleton className="h-4 w-full" /> {/* Line 1 */}
							<Skeleton className="h-4 w-5/6" /> {/* Line 2 */}
							<div className="flex gap-2 pt-2">
								<Skeleton className="h-6 w-16" /> {/* Badge 1 */}
								<Skeleton className="h-6 w-16" /> {/* Badge 2 */}
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
