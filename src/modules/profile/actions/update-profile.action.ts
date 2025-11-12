"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user as userTable } from "@/db/schema";
import { requireAuth } from "@/modules/auth/utils/auth-utils";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile.schema";

interface UpdateProfileResult {
    success: boolean;
    error?: string;
}

/**
 * Update user profile (currently only name)
 * Also updates the better-auth session to reflect changes immediately
 */
export async function updateProfileAction(
    data: UpdateProfileInput
): Promise<UpdateProfileResult> {
    try {
        // Validate input
        const validatedData = updateProfileSchema.parse(data);

        // Get current user
        const currentUser = await requireAuth();

        // Update database
        const db = await getDb();
        await db
            .update(userTable)
            .set({
                name: validatedData.name,
                updatedAt: new Date(),
            })
            .where(eq(userTable.id, currentUser.id));

        // Revalidate pages that display user data
        revalidatePath("/dashboard/profile");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Failed to update profile",
        };
    }
}
