import BoardContainer from "@/app/(main)/boards/_components/board-container";
import { getServerSession } from "@/lib/auth/get-session";
import {
  getBoardWithAccessCheck,
  getUserBoardPermission,
} from "@/lib/auth/permissions";
import { BoardRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface BoardIdPageProps {
  readonly params: Promise<{
    readonly boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: BoardIdPageProps) {
  const session = await getServerSession();

  const board = await getBoardWithAccessCheck(
    (await params).boardId,
    session?.user.id,
  );
  if (!board) {
    redirect("/sign-in");
  }
  const permission = session?.user?.id
    ? await getUserBoardPermission(board.id, session.user.id)
    : null;
  const role = permission?.role ?? BoardRole.VIEWER;

  return <BoardContainer data={board} role={role} />;
}
