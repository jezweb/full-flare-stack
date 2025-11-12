"use server";

import { requireAuth } from "@/modules/auth/utils/auth-utils";
import getAllTodos from "@/modules/todos/actions/get-todos.action";

export interface ProfileData {
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    stats: {
        totalTodos: number;
        completedTodos: number;
        activeTodos: number;
        completionRate: number;
    };
}

/**
 * Get current user profile with todo statistics
 */
export async function getProfileAction(): Promise<ProfileData> {
    const user = await requireAuth();
    const todos = await getAllTodos();

    const totalTodos = todos.length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const activeTodos = totalTodos - completedTodos;
    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    return {
        user,
        stats: {
            totalTodos,
            completedTodos,
            activeTodos,
            completionRate,
        },
    };
}
