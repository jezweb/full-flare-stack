"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/modules/auth/actions/auth.action";
import authRoutes from "../auth.route";
import type React from "react";

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {
    children?: React.ReactNode;
}

export default function LogoutButton({
    variant = "ghost",
    className,
    children,
    ...props
}: LogoutButtonProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const result = await signOut();
            if (result.success) {
                router.push(authRoutes.login);
                router.refresh(); // Refresh to clear any cached data
            } else {
                console.error("Logout failed:", result.message);
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <Button variant={variant} className={className} onClick={handleLogout} {...props}>
            {children || (
                <>
                    Log Out <LogOut className="size-4" />
                </>
            )}
        </Button>
    );
}
