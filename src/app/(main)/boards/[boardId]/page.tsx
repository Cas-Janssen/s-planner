import prisma from "@/lib/prisma";
import BoardContainer from "@/components/board";
import { notFound } from "next/navigation";
import { BoardWithDetails } from "#/prisma/prismaTypes";

interface BoardIdPageProps {
  readonly params: Promise<{
    readonly boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: BoardIdPageProps) {
  const { boardId } = await params;

  let board: BoardWithDetails | null = null;
  try {
    board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: { tasks: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching board:", error);
    board = null;
  }

  if (!board) {
    notFound();
  }

  return (
    <div>
      <BoardContainer data={board} />
    </div>
  );
}
