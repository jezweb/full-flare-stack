import { CheckSquare, Square, ListTodo, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProfileStatsProps {
    stats: {
        totalTodos: number;
        completedTodos: number;
        activeTodos: number;
        completionRate: number;
    };
}

/**
 * Display todo statistics card
 * Shows total, completed, active todos and completion rate
 */
export function ProfileStats({ stats }: ProfileStatsProps) {
    const { totalTodos, completedTodos, activeTodos, completionRate } = stats;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Todo completion statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ListTodo className="h-5 w-5 mr-3 text-muted-foreground" />
                            <span className="text-sm font-medium">Total Todos</span>
                        </div>
                        <span className="text-2xl font-bold">{totalTodos}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckSquare className="h-5 w-5 mr-3 text-primary" />
                            <span className="text-sm font-medium">Completed</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{completedTodos}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Square className="h-5 w-5 mr-3 text-muted-foreground" />
                            <span className="text-sm font-medium">Active</span>
                        </div>
                        <span className="text-2xl font-bold">{activeTodos}</span>
                    </div>
                </div>

                {totalTodos > 0 && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                                    <span className="font-medium">Completion Rate</span>
                                </div>
                                <span className="font-bold text-primary">
                                    {completionRate.toFixed(1)}%
                                </span>
                            </div>
                            <Progress value={completionRate} className="h-2" />
                        </div>
                    </>
                )}

                {totalTodos === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        No todos yet. Create one to start tracking your progress!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
