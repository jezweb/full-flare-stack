"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateTodoFieldAction } from "../actions/update-todo.action";

interface ToggleCompleteProps {
    todoId: number;
    completed: boolean;
}

export function ToggleComplete({ todoId, completed }: ToggleCompleteProps) {
    const [isCompleted, setIsCompleted] = useState(completed);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        setIsCompleted(checked);

        startTransition(async () => {
            try {
                const result = await updateTodoFieldAction(todoId, {
                    completed: checked,
                });

                if (!result.success) {
                    throw new Error(result.error || "Failed to update todo");
                }

                // No need to refresh - server action handles revalidation
            } catch (error) {
                console.error("Error updating todo:", error);
                // Revert the optimistic update
                setIsCompleted(!checked);
                toast.error(
                    error instanceof Error ? error.message : "Failed to update todo",
                );
            }
        });
    };

    return (
        <Switch
            checked={isCompleted}
            onCheckedChange={handleToggle}
            disabled={isPending}
        />
    );
}
