"use client";

import { useState } from "react";
import { updateTask } from "@/lib/actions/task-actions";
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
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { BoardMemberWithUser } from "@/types/database";
import { useBoardContext } from "../board-context";

interface EditTaskDialogProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    memberIds: string[];
  };
  boardId: string;
  members: BoardMemberWithUser[];
  triggerLabel?: string;
}

export function EditTaskDialog({
  task,
  boardId,
  members,
  triggerLabel,
}: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
  );
  const [memberIds, setMemberIds] = useState<string[]>(task.memberIds || []);

  const { optimisticUpdateTask, snapshotColumns, rollbackColumns } =
    useBoardContext();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const updateData = {
      title,
      description: description || null,
      dueDate: dueDate || null,
      memberIds,
    };

    const resolvedMembers = memberIds
      .map((uid) => {
        const m = members.find((mb) => mb.userId === uid);
        return m?.user
          ? {
              id: m.user.id,
              name: m.user.name || "",
              email: m.user.email || "",
              image: (m.user as { image?: string | null }).image ?? null,
            }
          : null;
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      email: string;
      image: string | null;
    }>;

    const snapshot = snapshotColumns();

    optimisticUpdateTask(task.id, updateData, resolvedMembers);

    setOpen(false);

    const result = await updateTask(task.id, boardId, updateData);

    if (result?.error) {
      rollbackColumns(snapshot);
      toast.error(result.error);
    } else {
      toast.success("Task updated successfully");
    }
  }

  function handleCancel() {
    setOpen(false);
  }

  const trigger =
    triggerLabel === "" ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0"
        aria-label="Edit task"
        title="Edit task"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
    ) : (
      <Button variant="outline" size="sm">
        {triggerLabel}
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-due-date">Due date</Label>
              <Input
                id="edit-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
            {members.length > 0 && (
              <div className="grid gap-2">
                <Label>Assignees</Label>
                <div className="grid gap-2">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={member.userId}
                        checked={memberIds.includes(member.userId)}
                        onChange={(event) => {
                          const next = new Set(memberIds);
                          if (event.target.checked) {
                            next.add(member.userId);
                          } else {
                            next.delete(member.userId);
                          }
                          setMemberIds(Array.from(next));
                        }}
                        disabled={loading}
                      />
                      <span>
                        {member.user?.name || member.user?.email || "Member"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
