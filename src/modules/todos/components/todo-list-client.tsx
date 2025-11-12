"use client";

import { useState, useMemo } from "react";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TodoCard } from "./todo-card";
import { TodoFilters } from "./todo-filters";
import { TodosTable } from "./todos-table";
import todosRoutes from "../todos.route";

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    categoryId: number | null;
    categoryName?: string | null;
    categoryColor?: string | null;
    dueDate: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
}

interface TodoListClientProps {
    todos: Todo[];
}

type ViewMode = "cards" | "table";

export function TodoListClient({ todos }: TodoListClientProps) {
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [viewMode, setViewMode] = useState<ViewMode>("cards");

    const filteredTodos = useMemo(() => {
        switch (filter) {
            case "active":
                return todos.filter((todo) => !todo.completed);
            case "completed":
                return todos.filter((todo) => todo.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter((todo) => todo.completed).length;
        const active = total - completed;
        return { total, completed, active };
    }, [todos]);

    return (
        <>
            <div className="flex justify-between items-center mb-8 w-full">
                <div>
                    <h1 className="text-3xl font-bold">Todos</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your tasks and stay organized
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {stats.active} active · {stats.completed} completed · {stats.total} total
                    </p>
                </div>
                <Link href={todosRoutes.new}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Todo
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <TodoFilters onFilterChange={setFilter} />
                <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                        if (value) setViewMode(value as ViewMode);
                    }}
                >
                    <ToggleGroupItem value="cards" aria-label="Card view">
                        <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Table view">
                        <TableIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {filteredTodos.length === 0 ? (
                <div className="text-center py-12 w-full">
                    <div className="text-muted-foreground/40 text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                        {filter === "all" && "No todos yet"}
                        {filter === "active" && "No active todos"}
                        {filter === "completed" && "No completed todos"}
                    </h3>
                    <p className="text-muted-foreground/80 mb-6">
                        {filter === "all" && "Create your first todo to get started"}
                        {filter === "active" && "All tasks are completed! Great job!"}
                        {filter === "completed" && "Complete some tasks to see them here"}
                    </p>
                    {filter === "all" && (
                        <Link href={todosRoutes.new}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create First Todo
                            </Button>
                        </Link>
                    )}
                </div>
            ) : viewMode === "table" ? (
                <TodosTable todos={filteredTodos} />
            ) : (
                <div className="grid gap-4">
                    {filteredTodos.map((todo) => (
                        <TodoCard key={todo.id} todo={todo} />
                    ))}
                </div>
            )}
        </>
    );
}
