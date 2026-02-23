import { getServerSession } from "@/lib/auth/get-session";
import { getUserBoards } from "@/lib/auth/permissions";
import { BoardsPageClient } from "./_components/boards-page-client";

export default async function BoardsPage() {
  const session = await getServerSession();
  const userId = session?.user?.id || null;

  const boards = await getUserBoards(userId);

  return <BoardsPageClient boards={boards} userId={userId} />;
}
