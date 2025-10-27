import BoardContainer from "@/app/(main)/boards/_components/board-container";
import { getServerSession } from "@/lib/auth/get-session";
import { getBoardWithAccessCheck } from "@/lib/auth/permissions";
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
    session?.user.id
  );
  if (!board) {
    redirect("/sign-in");
  }

  return <BoardContainer data={board} />;
}
