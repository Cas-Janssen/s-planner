import { UserProfile } from "@/app/(main)/dashboard/_components/profile";
import { BoardInvites } from "@/app/(main)/dashboard/_components/board-invites";
import { getPendingInvites } from "@/lib/actions/invite-actions";

export default async function UserProfilePage() {
  const invites = await getPendingInvites();

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <BoardInvites invites={invites} />
      <UserProfile />
    </div>
  );
}
