"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Edit, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ToggleComplete } from "./toggle-complete";
import { DeleteTodo } from "./delete-todo";
import todosRoutes from "../todos.route";
import { TodoPriority, TodoStatus } from "@/modules/todos/models/todo.enum";

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

interface TodosTableProps {
    todos: Todo[];
}

type SortField = "title" | "priority" | "status" | "dueDate" | "category";
type SortDirection = "asc" | "desc";

const priorityColors = {
    [TodoPriority.LOW]: "bg-muted text-muted-foreground border-border",
    [TodoPriority.MEDIUM]: "bg-accent text-accent-foreground border-border",
    [TodoPriority.HIGH]: "bg-secondary text-secondary-foreground border-border",
    [TodoPriority.URGENT]: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusColors = {
    [TodoStatus.PENDING]: "bg-muted text-muted-foreground border-border",
    [TodoStatus.IN_PROGRESS]: "bg-accent text-accent-foreground border-border",
    [TodoStatus.COMPLETED]: "bg-primary/10 text-primary border-primary/30",
    [TodoStatus.ARCHIVED]: "bg-secondary text-secondary-foreground border-border",
};

const priorityOrder = {
    [TodoPriority.LOW]: 0,
    [TodoPriority.MEDIUM]: 1,
    [TodoPriority.HIGH]: 2,
    [TodoPriority.URGENT]: 3,
};

export function TodosTable({ todos }: TodosTableProps) {
    const [sortField, setSortField] = useState<SortField>("title");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedTodos = useMemo(() => {
        return [...todos].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "title":
                    comparison = a.title.localeCompare(b.title);
                    break;
                case "priority":
                    comparison =
                        priorityOrder[a.priority as keyof typeof priorityOrder] -
                        priorityOrder[b.priority as keyof typeof priorityOrder];
                    break;
                case "status":
                    comparison = a.status.localeCompare(b.status);
                    break;
                case "dueDate":
                    if (!a.dueDate && !b.dueDate) comparison = 0;
                    else if (!a.dueDate) comparison = 1;
                    else if (!b.dueDate) comparison = -1;
                    else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    break;
                case "category":
                    comparison = (a.categoryName || "").localeCompare(b.categoryName || "");
                    break;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [todos, sortField, sortDirection]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="font-semibold hover:bg-accent/50"
        >
            {children}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );

    if (todos.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No todos to display</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Done</TableHead>
                        <TableHead>
                            <SortButton field="title">Title</SortButton>
                        </TableHead>
                        <TableHead>
                            <SortButton field="priority">Priority</SortButton>
                        </TableHead>
                        <TableHead>
                            <SortButton field="status">Status</SortButton>
                        </TableHead>
                        <TableHead>
                            <SortButton field="category">Category</SortButton>
                        </TableHead>
                        <TableHead>
                            <SortButton field="dueDate">Due Date</SortButton>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTodos.map((todo) => {
                        const isOverdue =
                            todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

                        return (
                            <TableRow
                                key={todo.id}
                                className={todo.completed ? "opacity-60" : ""}
                            >
                                <TableCell>
                                    <ToggleComplete todoId={todo.id} completed={todo.completed} />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div
                                            className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                                        >
                                            {todo.title}
                                        </div>
                                        {todo.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {todo.description.length > 50
                                                    ? `${todo.description.substring(0, 50)}...`
                                                    : todo.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            priorityColors[
                                                todo.priority as keyof typeof priorityColors
                                            ]
                                        }
                                    >
                                        {todo.priority.charAt(0).toUpperCase() +
                                            todo.priority.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            statusColors[todo.status as keyof typeof statusColors]
                                        }
                                    >
                                        {todo.status
                                            .replace("_", " ")
                                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {todo.categoryName && (
                                        <Badge
                                            variant="outline"
                                            className="border-2"
                                            style={
                                                todo.categoryColor
                                                    ? {
                                                          backgroundColor: `${todo.categoryColor}15`,
                                                          borderColor: todo.categoryColor,
                                                          color: todo.categoryColor,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {todo.categoryName}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {todo.dueDate && (
                                        <div
                                            className={`flex items-center text-sm ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                                        >
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {formatDate(todo.dueDate)}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href={todosRoutes.edit(todo.id)}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteTodo todoId={todo.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
