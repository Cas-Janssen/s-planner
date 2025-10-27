import { CreateBoardDialog } from "@/app/(main)/boards/_components/dialog/create-board";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteBoardButton } from "@/app/(main)/boards/_components/buttons/delete-board";
import { getServerSession } from "@/lib/auth/get-session";
import { getUserBoards } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";

export default async function BoardsPage() {
  const session = await getServerSession();
  const userId = session?.user?.id || null;

  const boards = await getUserBoards(userId);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Boards</h1>
        {userId && <CreateBoardDialog />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => {
          const totalTasks = board.columns.reduce(
            (sum, col) => sum + col._count.tasks,
            0
          );

          return (
            <Card key={board.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Link href={`/boards/${board.id}`} className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="hover:text-primary transition-colors">
                        {board.title}
                      </CardTitle>
                      {board.type === "PUBLIC" && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {board.columns.length} column
                      {board.columns.length !== 1 ? "s" : ""} · {totalTasks}{" "}
                      task
                      {totalTasks !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                    {board.role && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: {board.role}
                      </p>
                    )}
                  </Link>
                  {userId && board.role === "OWNER" && (
                    <DeleteBoardButton
                      boardId={board.id}
                      boardTitle={board.title}
                      columnCount={board.columns.length}
                      taskCount={totalTasks}
                    />
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {boards.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">
              {userId ? "No boards yet" : "No public boards available"}
            </p>
            {userId && <CreateBoardDialog />}
          </div>
        )}
      </div>
    </div>
  );
}
