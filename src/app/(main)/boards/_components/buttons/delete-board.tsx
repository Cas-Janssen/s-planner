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
        <Button variant="destructive" size="sm">
          <Trash2Icon className="mr-2 h-4 w-4" />
          Delete Board
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Board</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>Are you sure you want to delete &quot;{boardTitle}&quot;?</p>
              {(columnCount > 0 || taskCount > 0) && (
                <div className="mt-2 text-red-600 font-semibold">
                  <p>This will permanently delete:</p>
                  <ul className="list-disc list-inside mt-1">
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
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete Board"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
