import prisma from "@/lib/prisma";
import BoardContainer from "./_components/board";
import { notFound } from "next/navigation";

interface BoardIdPageProps {
  readonly params: Promise<{
    readonly boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: BoardIdPageProps) {
  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        include: { tasks: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div>
      <BoardContainer data={board} />
    </div>
  );
}
