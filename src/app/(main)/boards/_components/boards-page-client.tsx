"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteBoardButton } from "@/app/(main)/boards/_components/buttons/delete-board";
import { CreateBoardDialog } from "@/app/(main)/boards/_components/dialog/create-board";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Board {
  id: string;
  title: string;
  type: string;
  role?: string | null;
  updatedAt: string | Date;
  columns: Array<any>;
}

interface BoardsPageClientProps {
  boards: Board[];
  userId: string | null;
}

export function BoardsPageClient({
  boards: initialBoards,
  userId,
}: BoardsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBoards, setFilteredBoards] = useState(initialBoards);

  useEffect(() => {
    const filtered = initialBoards.filter((board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredBoards(filtered);
  }, [searchQuery, initialBoards]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Boards</h1>
          {userId && <CreateBoardDialog />}
        </div>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-muted-foreground mb-4 text-sm">
        {filteredBoards.length === 0 ? (
          <p>
            {searchQuery
              ? `No boards found matching "${searchQuery}"`
              : "No boards yet"}
          </p>
        ) : (
          <p>
            {filteredBoards.length} board
            {filteredBoards.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBoards.map((board) => {
          const totalTasks = board.columns.reduce(
            (sum, col) => sum + col._count.tasks,
            0,
          );

          return (
            <Card key={board.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/boards/${board.id}`} className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <CardTitle className="hover:text-primary transition-colors">
                        {board.title}
                      </CardTitle>
                      {board.type === "PUBLIC" && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {board.columns.length} column
                      {board.columns.length !== 1 ? "s" : ""} · {totalTasks}{" "}
                      task
                      {totalTasks !== 1 ? "s" : ""}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Updated{" "}
                      {new Date(board.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {board.role && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Role: {board.role}
                      </p>
                    )}
                  </Link>
                  {userId && board.role === "MANAGER" && (
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
      </div>
    </div>
  );
}
