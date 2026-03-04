"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Copy, Palette, Trash2, CopyPlus } from "lucide-react";
import {
  deleteColumn,
  duplicateColumn,
  updateColumnColor,
} from "@/lib/actions/column-actions";
import { toast } from "sonner";
import { ColumnWithTasks } from "@/types/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBoardContext } from "../board-context";

const COLUMN_COLORS = [
  { label: "Gray", value: "gray", class: "bg-gray-500" },
  { label: "Red", value: "red", class: "bg-red-500" },
  { label: "Orange", value: "orange", class: "bg-orange-500" },
  { label: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { label: "Green", value: "green", class: "bg-green-500" },
  { label: "Blue", value: "blue", class: "bg-blue-500" },
  { label: "Purple", value: "purple", class: "bg-purple-500" },
  { label: "Pink", value: "pink", class: "bg-pink-500" },
];

interface EditColumnDropdownProps {
  column: ColumnWithTasks;
}

export default function EditColumnDropdown({
  column,
}: EditColumnDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    optimisticDeleteColumn,
    optimisticUpdateColumnColor,
    snapshotColumns,
    rollbackColumns,
  } = useBoardContext();

  const handleDuplicate = () => {
    startTransition(async () => {
      const res = await duplicateColumn(column.id, column.boardId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Column duplicated");
      }
    });
  };

  const handleCopyTasks = () => {
    const taskTitles = column.tasks.map((t) => t.title).join("\n");
    navigator.clipboard.writeText(taskTitles).then(
      () => toast.success(`Copied ${column.tasks.length} task titles`),
      () => toast.error("Failed to copy"),
    );
  };

  const handleColorChange = (color: string) => {
    const snapshot = snapshotColumns();

    optimisticUpdateColumnColor(column.id, color);

    startTransition(async () => {
      const res = await updateColumnColor(column.id, column.boardId, color);
      if (res?.error) {
        rollbackColumns(snapshot);
        toast.error(res.error);
      } else {
        toast.success("Color updated");
      }
    });
  };

  const handleDelete = () => {
    const snapshot = snapshotColumns();

    optimisticDeleteColumn(column.id);
    setShowDeleteDialog(false);

    startTransition(async () => {
      const res = await deleteColumn(column.id, column.boardId);
      if (res?.error) {
        rollbackColumns(snapshot);
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <Ellipsis className="h-4 w-4 text-gray-300" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleCopyTasks}>
              <Copy className="mr-2 h-4 w-4" />
              Copy all tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <CopyPlus className="mr-2 h-4 w-4" />
              Duplicate Column
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Change Color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {COLUMN_COLORS.map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => handleColorChange(c.value)}
                  >
                    <span
                      className={`mr-2 inline-block h-3 w-3 rounded-full ${c.class}`}
                    />
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Column
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{column.title}&quot;?
              {column.tasks.length > 0 && (
                <span className="mt-2 block font-semibold text-red-600">
                  This will also delete {column.tasks.length} task
                  {column.tasks.length !== 1 ? "s" : ""}.
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
