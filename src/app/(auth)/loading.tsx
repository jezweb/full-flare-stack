/**
 * Auth Pages Loading State
 *
 * Simple centered spinner for login/signup pages.
 * Auth pages are typically fast, so a minimal loader is sufficient.
 */

import { Loader2 } from "lucide-react";

export default function AuthLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<p className="text-sm text-muted-foreground">Loading...</p>
			</div>
		</div>
	);
}
