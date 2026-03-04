"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBoardPermission } from "@/lib/auth/permissions";
import { ActivityType, BoardRole } from "@prisma/client";
import { getServerSession } from "../auth/get-session";
import { logBoardActivity } from "@/lib/log-activity";
import {
  broadcastTaskCreated,
  broadcastTaskUpdated,
  broadcastTaskDeleted,
  broadcastTaskCompleted,
  broadcastTaskMoved,
} from "@/lib/socket/broadcast";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  columnId: z.string(),
  boardId: z.string(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function createTask(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  const validated = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    memberIds: formData.getAll("memberIds").map(String),
    columnId: formData.get("columnId"),
    boardId: formData.get("boardId"),
  });

  if (!validated.success) {
    return { error: "Invalid input" };
  }

  const { title, description, columnId, boardId, dueDate, memberIds } =
    validated.data;

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const maxPosition = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        columnId,
        position: (maxPosition?.position ?? -1) + 1,
        memberIds: memberIds || [],
      },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.CREATED_TASK,
      `created task "${title}"`,
      { taskId: task.id, columnId },
    );

    broadcastTaskCreated({
      boardId,
      userId: session.user.id,
      taskId: task.id,
      columnId,
    });

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient permissions") {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to create task" };
  }
}

export async function completeTask(
  taskId: string,
  boardId: string,
  completed: boolean,
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };
  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: completed },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.UPDATED_TASK,
      completed
        ? `marked task "${task?.title || "Untitled"}" as done`
        : `reopened task "${task?.title || "Untitled"}"`,
      { taskId },
    );

    broadcastTaskCompleted({ boardId, userId: session.user.id, taskId });

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient permissions") {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to complete task" };
  }
}

export async function updateTask(
  taskId: string,
  boardId: string,
  data: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    memberIds?: string[];
  },
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  const validated = updateTaskSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid task data" };
  }

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const taskBefore = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, dueDate: true, memberIds: true },
    });

    const updateData: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      memberIds?: string[];
    } = {
      title: validated.data.title,
      description: validated.data.description,
    };

    if ("dueDate" in validated.data) {
      updateData.dueDate = validated.data.dueDate
        ? new Date(validated.data.dueDate)
        : null;
    }

    if ("memberIds" in validated.data) {
      updateData.memberIds = validated.data.memberIds || [];
    }

    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.UPDATED_TASK,
      `updated task "${validated.data.title || taskBefore?.title || "Untitled"}"`,
      { taskId },
    );

    const dueDateChanged =
      "dueDate" in validated.data &&
      (taskBefore?.dueDate?.toISOString() || null) !==
        (updateData.dueDate?.toISOString() || null);

    if (dueDateChanged) {
      await logBoardActivity(
        boardId,
        session.user.id,
        ActivityType.UPDATED_DEADLINE,
        "updated a task deadline",
        { taskId },
      );
    }

    if ("memberIds" in validated.data) {
      await logBoardActivity(
        boardId,
        session.user.id,
        ActivityType.UPDATED_ASSIGNEES,
        "updated task assignees",
        { taskId },
      );
    }

    broadcastTaskUpdated({ boardId, userId: session.user.id, taskId });

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient permissions") {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: string, boardId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.DELETED_TASK,
      `deleted task "${task?.title || "Untitled"}"`,
      { taskId },
    );

    await prisma.task.delete({
      where: { id: taskId },
    });

    broadcastTaskDeleted({ boardId, userId: session.user.id, taskId });
    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient permissions") {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to delete task" };
  }
}

export async function moveTask(
  boardId: string,
  taskId: string,
  targetColumnId: string,
  newOrder: number,
  sourceColumnId?: string,
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, columnId: true },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        position: newOrder,
      },
    });

    if (task?.columnId !== targetColumnId || sourceColumnId) {
      await logBoardActivity(
        boardId,
        session.user.id,
        ActivityType.MOVED_TASK,
        `moved task "${task?.title || "Untitled"}"`,
        {
          taskId,
          metadata: {
            fromColumnId: sourceColumnId || task?.columnId,
            toColumnId: targetColumnId,
          },
        },
      );
    }

    broadcastTaskMoved({
      boardId,
      userId: session.user.id,
      taskId,
      columnId: targetColumnId,
    });

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient permissions") {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to move task" };
  }
}
