"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { BoardMemberWithUser, TaskWithMembers } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Pencil, Users } from "lucide-react";
import { completeTask, updateTask } from "@/lib/actions/task-actions";
import { toast } from "sonner";
import { EditTaskDialog } from "./dialog/edit-task";
import UserAvatar from "@/components/shared/user-avatar";

export default function TaskCard({
  task,
  boardId,
  canEdit,
  members,
}: {
  task: TaskWithMembers;
  boardId: string;
  canEdit: boolean;
  members: BoardMemberWithUser[];
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isPending, startTransition] = useTransition();
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [done, setDone] = useState<boolean>(Boolean(task.isCompleted));

  useEffect(() => {
    setTitle(task.title);
    setDone(Boolean(task.isCompleted));
  }, [task.title, task.isCompleted]);

  useEffect(() => {
    if (isEditingTitle && titleTextareaRef.current) {
      autoResize(titleTextareaRef.current);
      titleTextareaRef.current.focus();
      titleTextareaRef.current.select();
    }
  }, [isEditingTitle]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  };

  const commitTitle = () => {
    const next = title.trim();
    if (!next || next === task.title) {
      setTitle(task.title);
      setIsEditingTitle(false);
      return;
    }
    setIsEditingTitle(false);

    startTransition(async () => {
      const res = await updateTask(task.id, boardId, {
        title: next,
      });
      if (res?.error) {
        toast.error(res.error);
        setTitle(task.title);
      } else {
        toast.success("Task title updated");
      }
    });
  };

  const toggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const res = await completeTask(task.id, boardId, next);
      if (res?.error) {
        setDone(!next);
        toast.error(res.error);
      }
    });
  };

  const assignees = task.members || [];
  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;

  return (
    <>
      <Card
        className={[
          "group relative rounded-md shadow-sm",
          canEdit ? "cursor-pointer" : "cursor-default",
          "hover:border-border focus-within:border-border border border-transparent transition-colors",
          "px-3 py-3",
          done ? "pl-8" : "focus-within:pl-8 hover:pl-8",
          "m-2 w-auto min-w-0",
          "transition-[padding] duration-150",
          done ? "bg-muted/60 border-green-500/30" : "",
          isPending ? "opacity-80" : "",
        ].join(" ")}
        aria-pressed={done}
      >
        {canEdit && (
          <div
            className={[
              "absolute top-2 left-2 z-10 transition-opacity duration-150",
              done
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100",
            ].join(" ")}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCompleted}
              className={[
                "h-5 w-5 rounded-full border p-0",
                done
                  ? "border-green-500 bg-green-600/20"
                  : "border-muted-foreground/40 bg-transparent",
              ].join(" ")}
              aria-label={done ? "Mark as incomplete" : "Mark as complete"}
              title={done ? "Mark as incomplete" : "Mark as complete"}
            >
              {done && <Check className="h-3 w-3 text-green-500" />}
            </Button>
          </div>
        )}

        {!isEditingTitle ? (
          <Button
            type="button"
            variant="noStyles"
            onClick={(e) => {
              e.stopPropagation();
              if (canEdit) setIsEditingTitle(true);
            }}
            className="h-auto w-full min-w-0 justify-start border-0 p-0 text-left"
            title={canEdit ? "Click to edit title" : "Task title"}
            aria-label="Edit task title"
            disabled={!canEdit}
          >
            <span
              className={[
                "block w-full min-w-0 overflow-hidden text-sm font-medium text-wrap wrap-anywhere",
                done ? "text-muted-foreground line-through" : "",
              ].join(" ")}
            >
              {title}
            </span>
          </Button>
        ) : (
          <Textarea
            ref={titleTextareaRef}
            value={title}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleTextareaRef.current)
                autoResize(titleTextareaRef.current);
            }}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitTitle();
              }
              if (e.key === "Escape") {
                setTitle(task.title);
                setIsEditingTitle(false);
              }
            }}
            rows={1}
            className="w-full min-w-0 resize-none overflow-hidden bg-transparent p-0 text-sm font-medium text-wrap wrap-anywhere focus-visible:ring-0"
            aria-label="Task title input"
          />
        )}

        {!isEditingTitle && canEdit && (
          <div className="pointer-events-none absolute top-2 right-2 z-20 opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <EditTaskDialog
              task={task}
              boardId={boardId}
              members={members}
              triggerLabel=""
            />
          </div>
        )}

        {(dueLabel || assignees.length > 0) && (
          <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-xs">
            {dueLabel && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dueLabel}
              </span>
            )}
            {assignees.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {assignees.length}
              </span>
            )}
          </div>
        )}

        {assignees.length > 0 && (
          <div className="mt-2 flex -space-x-2">
            {assignees.map((assignee) => (
              <div
                key={assignee.id}
                className="border-background rounded-full border-2"
                title={assignee.name || assignee.email || "Assignee"}
              >
                <UserAvatar
                  name={assignee.name || assignee.email || "Assignee"}
                  imageURL={assignee.image || null}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
