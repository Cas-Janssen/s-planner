"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBoard } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";

export function DeleteBoardButton({
  boardId,
  boardTitle,
  columnCount,
  taskCount,
}: {
  boardId: string;
  boardTitle: string;
  columnCount: number;
  taskCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const result = await deleteBoard(boardId);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push("/boards");
      router.refresh();
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Board</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>Are you sure you want to delete &quot;{boardTitle}&quot;?</p>
              {(columnCount > 0 || taskCount > 0) && (
                <div className="mt-2 font-semibold text-red-600">
                  <p>This will permanently delete:</p>
                  <ul className="mt-1 list-inside list-disc">
                    {columnCount > 0 && (
                      <li>
                        {columnCount} column{columnCount !== 1 ? "s" : ""}
                      </li>
                    )}
                    {taskCount > 0 && (
                      <li>
                        {taskCount} task{taskCount !== 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <p className="mt-2">This action cannot be undone.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {loading ? "Deleting..." : "Delete Board"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
