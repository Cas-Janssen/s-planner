"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BoardWithDetails } from "@/types/database";
import DragableColumn from "./dragable-column";
import CollapsedColumn from "./collapsed-column";
import { moveColumn, toggleColumnCollapse } from "@/lib/actions/column-actions";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AddColumnDialog } from "./dialog/add-column";
import BoardNavbar from "./board-navbar";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { moveTask } from "@/lib/actions/task-actions";
import { positionBetween } from "@/lib/helpers/position-calculator";
import { BoardRole } from "@prisma/client";
import { toast } from "sonner";
import { useBoardSocket } from "@/lib/socket/use-board-socket";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function BoardContainer({
  data,
  role,
}: {
  data: BoardWithDetails;
  role: BoardRole;
}) {
  const initialCollapsed = useMemo(
    () =>
      Object.fromEntries(
        data.columns.map((c) => [c.id, Boolean(c.isCollapsed)]),
      ) as Record<string, boolean>,
    [data.columns],
  );

  const [collapsed, setCollapsed] =
    useState<Record<string, boolean>>(initialCollapsed);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [columns, setColumns] = useState(data.columns);
  const [isMoving, startMoving] = useTransition();

  const canEdit = role === BoardRole.MANAGER || role === BoardRole.MEMBER;
  const canManage = role === BoardRole.MANAGER;

  const router = useRouter();

  useBoardSocket(data.id, (event) => {
    if (event === SOCKET_EVENTS.BOARD_DELETED) {
      toast.info("This board has been deleted");
      router.push("/boards");
      return;
    }
    router.refresh();
  });

  useEffect(() => {
    setColumns(data.columns);
    setCollapsed(
      Object.fromEntries(
        data.columns.map((c) => [c.id, Boolean(c.isCollapsed)]),
      ),
    );
  }, [data.columns]);

  const onToggle = (columnId: string) => {
    setCollapsed((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
    setPending((p) => ({ ...p, [columnId]: true }));

    startTransition(async () => {
      const res = await toggleColumnCollapse(columnId, data.id);
      setPending((p) => ({ ...p, [columnId]: false }));
      if (res && "error" in res) {
        setCollapsed((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
      }
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!canEdit) return;
    if (!result.destination) return;

    if (result.type === "column") {
      if (result.source.index === result.destination.index) return;
      const nextColumns = Array.from(columns);
      const [moved] = nextColumns.splice(result.source.index, 1);
      nextColumns.splice(result.destination.index, 0, moved);

      const prevPos =
        nextColumns[result.destination.index - 1]?.position ?? null;
      const nextPos =
        nextColumns[result.destination.index + 1]?.position ?? null;
      const newPosition = positionBetween(prevPos, nextPos);
      moved.position = newPosition;

      setColumns(nextColumns);

      startMoving(async () => {
        const res = await moveColumn(data.id, moved.id, newPosition);
        if (res?.error) {
          toast.error(res.error);
        }
      });
      return;
    }

    const sourceColId = result.source.droppableId;
    const destColId = result.destination.droppableId;

    if (
      sourceColId === destColId &&
      result.source.index === result.destination.index
    ) {
      return;
    }

    const sourceColumn = columns.find((c) => c.id === sourceColId);
    const destColumn = columns.find((c) => c.id === destColId);
    if (!sourceColumn || !destColumn) return;

    const nextColumns = columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));
    const nextSource = nextColumns.find((c) => c.id === sourceColId);
    const nextDest = nextColumns.find((c) => c.id === destColId);
    if (!nextSource || !nextDest) return;

    const [movedTask] = nextSource.tasks.splice(result.source.index, 1);
    if (!movedTask) return;

    nextDest.tasks.splice(result.destination.index, 0, movedTask);

    const prevTask = nextDest.tasks[result.destination.index - 1];
    const nextTask = nextDest.tasks[result.destination.index + 1];
    const newPosition = positionBetween(prevTask?.position, nextTask?.position);
    movedTask.position = newPosition;
    movedTask.columnId = nextDest.id;

    setColumns(nextColumns);

    startMoving(async () => {
      const res = await moveTask(
        data.id,
        movedTask.id,
        nextDest.id,
        newPosition,
        sourceColId,
      );
      if (res?.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex w-full grow flex-col">
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <BoardNavbar board={data} role={role} canManage={canManage} />
      </div>
      <div className="relative mx-auto flex w-[95vw] grow flex-row overflow-x-auto">
        <ScrollArea className="flex w-auto grow rounded-md whitespace-nowrap">
          <div className="mx-auto flex w-fit flex-row pr-2">
            {canEdit ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId="board-columns"
                  type="column"
                  direction="horizontal"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-row"
                    >
                      {columns.map((column, index) => {
                        const isCollapsed =
                          collapsed[column.id] ?? Boolean(column.isCollapsed);
                        const isBusy = Boolean(
                          pending[column.id] || isPending || isMoving,
                        );

                        return !isCollapsed ? (
                          <DragableColumn
                            key={column.id}
                            column={column}
                            onToggle={() => onToggle(column.id)}
                            disabled={isBusy}
                            canEdit={canEdit}
                            draggableIndex={index}
                            members={data.members}
                          />
                        ) : (
                          <CollapsedColumn
                            key={column.id}
                            column={column}
                            onToggle={() => onToggle(column.id)}
                            disabled={isBusy}
                            canEdit={canEdit}
                          />
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="flex flex-row items-start">
                {columns.map((column) => {
                  const isCollapsed =
                    collapsed[column.id] ?? Boolean(column.isCollapsed);
                  const isBusy = Boolean(pending[column.id] || isPending);

                  return !isCollapsed ? (
                    <DragableColumn
                      key={column.id}
                      column={column}
                      onToggle={() => onToggle(column.id)}
                      disabled={isBusy}
                      canEdit={canEdit}
                      members={data.members}
                    />
                  ) : (
                    <CollapsedColumn
                      key={column.id}
                      column={column}
                      onToggle={() => onToggle(column.id)}
                      disabled={isBusy}
                      canEdit={canEdit}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {canEdit && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="pointer-events-auto absolute right-4 bottom-4">
              <AddColumnDialog boardId={data.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
