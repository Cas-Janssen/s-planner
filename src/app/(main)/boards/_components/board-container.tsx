"use client";

import { useMemo, useState, useTransition } from "react";
import { BoardWithDetails } from "@/types/database";
import DragableColumn from "./dragable-column";
import CollapsedColumn from "./collapsed-column";
import { AddColumnDialog } from "./dialog/add-column";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toggleColumnCollapse } from "@/lib/actions/column-actions";
import BoardNavbar from "./board-navbar";

export default function BoardContainer({
  data,
}: {
  readonly data: BoardWithDetails;
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

  return (
    <div className="flex grow flex-col">
      <BoardNavbar board={data} />
      <div className="flex grow flex-row overflow-x-auto">
        <ScrollArea className="flex w-auto grow rounded-md whitespace-nowrap">
          <div className="flex flex-row pr-2">
            {data.columns.map((column) => {
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
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <AddColumnDialog boardId={data.id} />
      </div>
    </div>
  );
}
