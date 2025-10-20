import { getServerSession } from "@/lib/auth/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function UserProfile() {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const { name, email, image } = session.user;
  const initials =
    name
      ?.split(" ")
      .map((n: any[]) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={image || undefined} alt={name || "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
