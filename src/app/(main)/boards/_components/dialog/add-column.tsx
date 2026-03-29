"use client";

import { useState } from "react";
import { createColumn } from "@/lib/actions/column-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useBoardContext } from "../board-context";

export function AddColumnDialog({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const { optimisticAddColumn, snapshotColumns, rollbackColumns } =
    useBoardContext();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const snapshot = snapshotColumns();

    optimisticAddColumn(title);

    const savedTitle = title;
    setOpen(false);
    setTitle("");

    const formData = new FormData();
    formData.append("boardId", boardId);
    formData.append("title", savedTitle);

    const result = await createColumn(formData);

    if (result?.error) {
      rollbackColumns(snapshot);
      toast.error(result.error);
    } else {
      toast.success("Column added");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setTitle("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Add Column
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Create a new column for your board
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Column Name</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., To Do"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
