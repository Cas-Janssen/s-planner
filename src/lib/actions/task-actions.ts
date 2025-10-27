"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBoardPermission } from "@/lib/auth/permissions";
import { BoardRole } from "@prisma/client";
import { getServerSession } from "../auth/get-session";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  columnId: z.string(),
  boardId: z.string(),
});

export async function createTask(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  const validated = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    columnId: formData.get("columnId"),
    boardId: formData.get("boardId"),
  });

  if (!validated.success) {
    return { error: "Invalid input" };
  }

  const { title, description, columnId, boardId } = validated.data;

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    const maxPosition = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId,
        position: (maxPosition?.position ?? -1) + 1,
      },
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
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: completed },
    });

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
  data: { title?: string; description?: string | null },
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    await prisma.task.update({
      where: { id: taskId },
      data,
    });

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
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    await prisma.task.delete({
      where: { id: taskId },
    });

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
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        position: newOrder,
      },
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
