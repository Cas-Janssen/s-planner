import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserAvatar from "@/components/shared/user-avatar";
import { getServerSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export async function UserProfile() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  const { name, email, image } = session.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={name} imageURL={image || null} />
          <div>
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
