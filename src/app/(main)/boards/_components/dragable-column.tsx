import { ColumnWithTasks } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ChevronsRightLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddTaskDialog } from "@/app/(main)/boards/_components/dialog/create-task";
import EditColumnDialog from "./dropdown/edit-column";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateColumnTitle } from "@/lib/actions/column-actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import TaskCard from "./task-card";

export default function DragableColumn({
  column,
  onToggle,
  disabled,
}: {
  column: ColumnWithTasks;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(column.title);
  const [editValue, setEditValue] = useState(column.title);
  const [isSaving, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState(column.tasks);

  useEffect(() => {
    setTasks(column.tasks);
  }, [column.tasks]);

  useEffect(() => {
    if (isEditing || isSaving) return;
    setDisplayTitle(column.title);
    setEditValue(column.title);
  }, [column.title, isEditing, isSaving]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    const next = editValue.trim();
    if (!next) {
      setEditValue(displayTitle);
      setIsEditing(false);
      return;
    }
    if (next === displayTitle) {
      setIsEditing(false);
      return;
    }

    const prev = displayTitle;
    setDisplayTitle(next);
    setIsEditing(false);

    startTransition(async () => {
      try {
        await updateColumnTitle(column.id, column.boardId, next);
        toast.success("Title updated");
      } catch {
        toast.error("Failed to update title");
        setDisplayTitle(prev);
        setEditValue(prev);
      }
    });
  };

  return (
    <div className="relative m-2 h-full w-xs overflow-hidden rounded-lg bg-gray-700">
      <div className="grid grid-rows-[auto,1fr,auto]">
        <div className="grid grid-cols-[1fr,auto] items-start gap-2 px-2 py-2">
          <div className="flex min-w-0 items-start gap-2">
            {!isEditing ? (
              <button
                type="button"
                className="min-w-0 flex-1 text-left font-bold text-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setIsEditing(true);
                }}
                title="Click to rename"
              >
                <span className="wrap-break-word break-all whitespace-normal">
                  {displayTitle}
                </span>
              </button>
            ) : (
              <Input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                }}
                disabled={disabled || isSaving}
                className="w-full min-w-0 border-transparent bg-transparent font-bold text-slate-200 outline-none focus:border-slate-500"
                aria-label="Edit column title"
              />
            )}
            <span className="shrink-0 rounded-full bg-purple-600 px-2 py-1 text-xs font-semibold text-white">
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              disabled={disabled}
              aria-label="Collapse column"
            >
              <ChevronsRightLeft className="h-4 w-4 text-gray-300" />
            </Button>
            <div>
              <EditColumnDialog />
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-y-auto px-2 pb-2">
          <ScrollArea className="max-h-[55vh] min-h-0 min-w-0 md:max-h-[65vh]">
            <Droppable droppableId={column.id} type="task">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {tasks.map((task, index) => (
                    <Draggable
                      draggableId={task.id}
                      index={index}
                      key={task.id}
                    >
                      {(taskProvided, snapshot) => (
                        <div
                          ref={taskProvided.innerRef}
                          {...taskProvided.draggableProps}
                          {...taskProvided.dragHandleProps}
                          className={snapshot.isDragging ? "shadow-lg" : ""}
                        >
                          <TaskCard
                            key={task.id}
                            task={task}
                            boardId={column.boardId}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </ScrollArea>
        </div>

        <div className="border-t border-gray-700 p-2">
          <div>
            <AddTaskDialog columnId={column.id} boardId={column.boardId} />
          </div>
        </div>
      </div>
    </div>
  );
}
