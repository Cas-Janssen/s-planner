"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { BoardWithDetails } from "@/types/database";
import DragableColumn from "./dragable-column";
import CollapsedColumn from "./collapsed-column";
import { toggleColumnCollapse } from "@/lib/actions/column-actions";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AddColumnDialog } from "./dialog/add-column";
import BoardNavbar from "./board-navbar";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

export default function BoardContainer({ data }: { data: BoardWithDetails }) {
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
    if (!result.destination) return;
    if (result.source.droppableId === result.destination.droppableId) return;
    const sourceColId = result.source.droppableId;
    const destColId = result.destination.droppableId;
    const taskId = result.draggableId;
    setColumns((cols) => {
      const sourceCol = cols.find((c) => c.id === sourceColId);
      const destCol = cols.find((c) => c.id === destColId);
      if (!sourceCol || !destCol) return cols;
      return cols;
    });
  };

  return (
    <div className="flex grow flex-col">
      <BoardNavbar board={data} />
      <div className="flex grow flex-row overflow-x-auto">
        <ScrollArea className="flex w-auto grow rounded-md whitespace-nowrap">
          <div className="flex flex-row pr-2">
            <DragDropContext onDragEnd={onDragEnd}>
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
                  />
                ) : (
                  <CollapsedColumn
                    key={column.id}
                    column={column}
                    onToggle={() => onToggle(column.id)}
                    disabled={isBusy}
                  />
                );
              })}
            </DragDropContext>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <AddColumnDialog boardId={data.id} />
      </div>
    </div>
  );
}
