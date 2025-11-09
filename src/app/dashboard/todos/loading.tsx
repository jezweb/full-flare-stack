/**
 * Todos List Loading State
 *
 * Skeleton loading state matching the todos list layout.
 * Shows card-based skeletons that match TodoCard components.
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TodosLoading() {
	return (
		<div className="space-y-6">
			{/* Page header */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-32" /> {/* "Todos" title */}
				<Skeleton className="h-4 w-64" /> {/* Description */}
			</div>

			<Separator />

			{/* Filter and action bar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-10 w-48" /> {/* Category filter */}
				<Skeleton className="h-10 w-32" /> {/* "New Todo" button */}
			</div>

			{/* Todo cards skeleton */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="p-4">
						<div className="space-y-3">
							{/* Todo header (checkbox + title + menu) */}
							<div className="flex items-start gap-3">
								<Skeleton className="mt-0.5 h-4 w-4 rounded" /> {/* Checkbox */}
								<Skeleton className="h-5 flex-1" /> {/* Title */}
								<Skeleton className="h-4 w-4" /> {/* Menu icon */}
							</div>

							{/* Description lines */}
							<div className="ml-7 space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-4/5" />
							</div>

							{/* Category badge */}
							<div className="ml-7 flex gap-2">
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>

							{/* Metadata (date) */}
							<div className="ml-7 pt-2">
								<Skeleton className="h-3 w-32" />
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
