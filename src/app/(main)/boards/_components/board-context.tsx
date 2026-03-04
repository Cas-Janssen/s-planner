"use client";

import { createContext, useContext, useCallback } from "react";
import { ColumnWithTasks } from "@/types/database";

type SetColumnsAction = React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;

interface BoardContextValue {
  columns: ColumnWithTasks[];
  setColumns: SetColumnsAction;
  boardId: string;

  optimisticAddTask: (
    columnId: string,
    task: {
      title: string;
      description?: string | null;
      dueDate?: string | null;
      memberIds?: string[];
    },
    members: Array<{
      id: string;
      name: string;
      email: string;
      image: string | null;
    }>,
  ) => string;

  optimisticUpdateTask: (
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      memberIds?: string[];
    },
    resolvedMembers?: Array<{
      id: string;
      name: string;
      email: string;
      image: string | null;
    }>,
  ) => void;

  optimisticDeleteTask: (taskId: string, columnId: string) => void;

  optimisticAddColumn: (title: string) => string;

  optimisticDeleteColumn: (columnId: string) => void;

  optimisticUpdateColumnColor: (columnId: string, color: string) => void;

  rollbackColumns: (snapshot: ColumnWithTasks[]) => void;

  snapshotColumns: () => ColumnWithTasks[];
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx)
    throw new Error("useBoardContext must be used within a BoardProvider");
  return ctx;
}

let optimisticIdCounter = 0;
function generateOptimisticId() {
  return `optimistic-${Date.now()}-${++optimisticIdCounter}`;
}

export function BoardProvider({
  children,
  columns,
  setColumns,
  boardId,
}: {
  children: React.ReactNode;
  columns: ColumnWithTasks[];
  setColumns: SetColumnsAction;
  boardId: string;
}) {
  const snapshotColumns = useCallback(() => {
    return columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));
  }, [columns]);

  const rollbackColumns = useCallback(
    (snapshot: ColumnWithTasks[]) => {
      setColumns(snapshot);
    },
    [setColumns],
  );

  const optimisticAddTask = useCallback(
    (
      columnId: string,
      task: {
        title: string;
        description?: string | null;
        dueDate?: string | null;
        memberIds?: string[];
      },
      members: Array<{
        id: string;
        name: string;
        email: string;
        image: string | null;
      }>,
    ) => {
      const tempId = generateOptimisticId();

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;

          const maxPos = col.tasks.reduce(
            (max, t) => Math.max(max, t.position),
            -1,
          );

          const resolvedMembers = (task.memberIds || [])
            .map((uid) => members.find((m) => m.id === uid))
            .filter(Boolean) as Array<{
            id: string;
            name: string;
            email: string;
            image: string | null;
          }>;

          const newTask = {
            id: tempId,
            title: task.title,
            description: task.description ?? null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            isCompleted: false,
            position: maxPos + 1,
            columnId,
            memberIds: task.memberIds || [],
            members: resolvedMembers.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              emailVerified: false,
              image: m.image,
              taskIds: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as ColumnWithTasks["tasks"][number];

          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }),
      );

      return tempId;
    },
    [setColumns],
  );

  const optimisticUpdateTask = useCallback(
    (
      taskId: string,
      data: {
        title?: string;
        description?: string | null;
        dueDate?: string | null;
        memberIds?: string[];
      },
      resolvedMembers?: Array<{
        id: string;
        name: string;
        email: string;
        image: string | null;
      }>,
    ) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => {
            if (t.id !== taskId) return t;

            const updated = { ...t };
            if (data.title !== undefined) updated.title = data.title;
            if (data.description !== undefined)
              updated.description = data.description;
            if (data.dueDate !== undefined)
              updated.dueDate = data.dueDate ? new Date(data.dueDate) : null;
            if (data.memberIds !== undefined) {
              updated.memberIds = data.memberIds;
              if (resolvedMembers) {
                updated.members = resolvedMembers.map((m) => ({
                  id: m.id,
                  name: m.name,
                  email: m.email,
                  emailVerified: false,
                  image: m.image,
                  taskIds: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }));
              }
            }
            updated.updatedAt = new Date();
            return updated;
          }),
        })),
      );
    },
    [setColumns],
  );

  const optimisticDeleteTask = useCallback(
    (taskId: string, columnId: string) => {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }),
      );
    },
    [setColumns],
  );

  const optimisticAddColumn = useCallback(
    (title: string) => {
      const tempId = generateOptimisticId();

      setColumns((prev) => {
        const maxPos = prev.reduce(
          (max, col) => Math.max(max, col.position),
          0,
        );

        const newColumn = {
          id: tempId,
          title,
          position: maxPos + 16384,
          isCollapsed: false,
          color: "gray",
          boardId,
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ColumnWithTasks;

        return [...prev, newColumn];
      });

      return tempId;
    },
    [setColumns, boardId],
  );

  const optimisticDeleteColumn = useCallback(
    (columnId: string) => {
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    },
    [setColumns],
  );

  const optimisticUpdateColumnColor = useCallback(
    (columnId: string, color: string) => {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;
          return { ...col, color };
        }),
      );
    },
    [setColumns],
  );

  return (
    <BoardContext.Provider
      value={{
        columns,
        setColumns,
        boardId,
        optimisticAddTask,
        optimisticUpdateTask,
        optimisticDeleteTask,
        optimisticAddColumn,
        optimisticDeleteColumn,
        optimisticUpdateColumnColor,
        rollbackColumns,
        snapshotColumns,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
