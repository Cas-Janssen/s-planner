"use client";

import { useState, useEffect } from "react";
import { createTask } from "@/lib/actions/task-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface TaskDraft {
  title: string;
  description: string;
  timestamp: number;
}

export function AddTaskDialog({
  columnId,
  boardId,
}: {
  columnId: string;
  boardId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const storageKey = `task-draft-${columnId}`;

  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const draft: TaskDraft = JSON.parse(saved);
          setTitle(draft.title || "");
          setDescription(draft.description || "");
        }
      } catch (error) {
        toast.error("Failed to load draft");
      }
    }
  }, [open, storageKey]);

  useEffect(() => {
    if (open && (title || description)) {
      try {
        const draft: TaskDraft = {
          title,
          description,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch (error) {
        toast.error("Failed to save draft");
      }
    }
  }, [title, description, open, storageKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("columnId", columnId);
    formData.append("boardId", boardId);
    formData.append("title", title);
    if (description) formData.append("description", description);

    const result = await createTask(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      toast.success("Task added successfully");
      localStorage.removeItem(storageKey);
      setOpen(false);
      setTitle("");
      setDescription("");
      setError(null);
      setLoading(false);
    }
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleDiscard() {
    localStorage.removeItem(storageKey);
    setTitle("");
    setDescription("");
    setError(null);
  }

  function getDraftAge() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const draft: TaskDraft = JSON.parse(saved);
        const minutesAgo = Math.floor(
          (Date.now() - draft.timestamp) / (1000 * 60)
        );

        if (minutesAgo < 1) return "just now";
        if (minutesAgo < 60) return `${minutesAgo}m ago`;

        const hoursAgo = Math.floor(minutesAgo / 60);
        if (hoursAgo < 24) return `${hoursAgo}h ago`;

        const daysAgo = Math.floor(hoursAgo / 24);
        return `${daysAgo}d ago`;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  const draftAge = getDraftAge();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <PlusIcon />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task in this column
              {draftAge && (
                <span className="text-xs text-muted-foreground block mt-1">
                  Draft saved {draftAge}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Complete documentation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            {(title || description) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                disabled={loading}
                className="mr-auto text-xs"
              >
                Clear Draft
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
