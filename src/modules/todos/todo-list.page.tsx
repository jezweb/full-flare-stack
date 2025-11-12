import { cookies } from "next/headers";
import getAllTodos from "@/modules/todos/actions/get-todos.action";
import { TodoListClient } from "@/modules/todos/components/todo-list-client";
import { WarningToast } from "@/modules/todos/components/warning-toast";

export default async function TodoListPage() {
    const todos = await getAllTodos();

    // Check for warning cookie
    const cookieStore = await cookies();
    const warningCookie = cookieStore.get("todo-warning");
    const warning = warningCookie?.value || null;

    // Clear the cookie after reading
    if (warningCookie) {
        cookieStore.delete("todo-warning");
    }

    return (
        <>
            <WarningToast warning={warning} />
            <TodoListClient todos={todos} />
        </>
    );
}
