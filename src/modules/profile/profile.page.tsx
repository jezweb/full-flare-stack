import { Separator } from "@/components/ui/separator";
import { getProfileAction } from "./actions/get-profile.action";
import { ProfileForm } from "./components/profile-form";
import { ProfileInfo } from "./components/profile-info";
import { ProfileStats } from "./components/profile-stats";

/**
 * Profile page showing user information, stats, and edit form
 */
export default async function ProfilePage() {
    const profileData = await getProfileAction();

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and view your activity
                </p>
            </div>

            <Separator className="mb-8" />

            <div className="space-y-6">
                <ProfileInfo user={profileData.user} />

                {profileData.stats.totalTodos > 0 && (
                    <ProfileStats stats={profileData.stats} />
                )}

                <ProfileForm initialName={profileData.user.name} />
            </div>
        </div>
    );
}
