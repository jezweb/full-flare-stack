import { z } from "zod";

/**
 * Schema for updating user profile
 * Currently only supports name updates
 */
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .transform((val) => val.trim()),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
