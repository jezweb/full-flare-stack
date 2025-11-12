import { Mail, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AuthUser } from "@/modules/auth/models/user.model";

interface ProfileInfoProps {
    user: AuthUser;
}

/**
 * Display-only user information card
 * Shows avatar, email, verification status, and account dates
 */
export function ProfileInfo({ user }: ProfileInfoProps) {
    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-lg">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-2xl font-semibold">{user.name}</h3>
                        <div className="flex items-center text-muted-foreground mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email Verification</span>
                        {user.emailVerified ? (
                            <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Not Verified
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Account Created</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(user.createdAt)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Updated</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(user.updatedAt)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
