"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { account } from "@/db/schema";
import { requireAuth } from "@/modules/auth/utils/auth-utils";

export interface AccountSettings {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
	connectedAccounts: Array<{
		provider: string;
		providerId: string;
	}>;
}

export async function getAccountSettingsAction(): Promise<AccountSettings> {
	const user = await requireAuth();

	// Get connected OAuth accounts
	const db = await getDb();
	const accounts = await db
		.select({
			provider: account.providerId,
			providerId: account.accountId,
		})
		.from(account)
		.where(eq(account.userId, user.id));

	return {
		user,
		connectedAccounts: accounts.map((acc) => ({
			provider: acc.provider,
			providerId: acc.providerId,
		})),
	};
}
