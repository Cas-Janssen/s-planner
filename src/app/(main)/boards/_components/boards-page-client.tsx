"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteBoardButton } from "@/app/(main)/boards/_components/buttons/delete-board";
import { CreateBoardDialog } from "@/app/(main)/boards/_components/dialog/create-board";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  LayoutDashboard,
  Columns3,
  ListTodo,
  Calendar,
} from "lucide-react";

interface Board {
  id: string;
  title: string;
  type: string;
  role?: string | null;
  updatedAt: string | Date;
  lastActivity?: string | Date;
  columns: { _count: { tasks: number } }[];
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-primary h-7 w-7" />
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
        </div>
        {userId && <CreateBoardDialog />}
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
        <Input
          placeholder="Search boards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <p className="text-muted-foreground mb-4 text-sm">
        {filteredBoards.length === 0
          ? searchQuery
            ? `No boards found matching "${searchQuery}"`
            : "No boards yet. Create one to get started!"
          : `${filteredBoards.length} board${filteredBoards.length !== 1 ? "s" : ""}`}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBoards.map((board) => {
          const totalTasks = board.columns.reduce(
            (sum, col) => sum + col._count.tasks,
            0,
          );

          return (
            <Link key={board.id} href={`/boards/${board.id}`} className="group">
              <Card className="group-hover:ring-primary/20 h-full transition-all duration-200 group-hover:shadow-lg group-hover:ring-1">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary min-w-0 flex-1 text-base leading-snug transition-colors">
                        {board.title}
                      </CardTitle>
                      {userId && board.role === "MANAGER" && (
                        <div
                          className="shrink-0"
                          onClick={(e) => e.preventDefault()}
                        >
                          <DeleteBoardButton
                            boardId={board.id}
                            boardTitle={board.title}
                            columnCount={board.columns.length}
                            taskCount={totalTasks}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {board.role && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {board.role.toLowerCase()}
                        </Badge>
                      )}
                      {board.type === "PUBLIC" && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <Separator className="mb-3" />
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Columns3 className="h-3.5 w-3.5 shrink-0" />
                      <span>{board.columns.length} cols</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5 shrink-0" />
                      <span>{totalTasks} tasks</span>
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="text-muted-foreground pt-0 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>
                      {new Date(
                        board.lastActivity || board.updatedAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
