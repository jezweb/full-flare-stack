"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodoFiltersProps {
    onFilterChange: (filter: "all" | "active" | "completed") => void;
}

export function TodoFilters({ onFilterChange }: TodoFiltersProps) {
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");

    const handleFilterChange = (value: string) => {
        const filter = value as "all" | "active" | "completed";
        setActiveFilter(filter);
        onFilterChange(filter);
    };

    return (
        <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">All Todos</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
