"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "../actions/update-profile.action";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile.schema";

interface ProfileFormProps {
    initialName: string;
}

/**
 * Form for editing user profile (currently only name)
 * Uses React Hook Form with Zod validation
 */
export function ProfileForm({ initialName }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: initialName,
        },
    });

    const onSubmit = (data: UpdateProfileInput) => {
        startTransition(async () => {
            const result = await updateProfileAction(data);

            if (result.success) {
                toast.success("Profile updated successfully");
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name that will be displayed on your profile and
                                        in the dashboard.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                                disabled={isPending || !form.formState.isDirty}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !form.formState.isDirty}
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
