"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/get-session";
import { requireBoardPermission } from "@/lib/auth/permissions";
import { ActivityType, BoardRole } from "@prisma/client";
import { logBoardActivity } from "@/lib/log-activity";

const createColumnSchema = z.object({
  title: z.string().min(1, "Column title is required"),
  boardId: z.string(),
});

export async function createColumn(formData: FormData) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = createColumnSchema.safeParse({
    title: formData.get("title"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid input" };
  }

  const { title, boardId } = validatedFields.data;

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const maxPosition = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        position: (maxPosition?.position ?? -1) + 1,
      },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.CREATED_COLUMN,
      `created column "${title}"`,
      { columnId: column.id },
    );

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to edit this board" };
    }

    return { error: "Failed to create column" };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { title: true },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.DELETED_COLUMN,
      `deleted column "${column?.title || "Untitled"}"`,
      { columnId },
    );

    await prisma.column.delete({
      where: { id: columnId },
    });

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to edit this board" };
    }

    return { error: "Failed to delete column" };
  }
}

export async function updateColumnTitle(
  columnId: string,
  boardId: string,
  title: string,
) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);
    if (title.trim().length === 0) {
      return { error: "Column title cannot be empty" };
    }
    if (title.length > 50) {
      return { error: "Column title cannot exceed 50 characters" };
    }

    await prisma.column.update({
      where: { id: columnId },
      data: { title },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.UPDATED_COLUMN,
      `renamed column to "${title}"`,
      { columnId },
    );

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to edit this board" };
    }

    return { error: "Failed to update column" };
  }
}

export async function toggleColumnCollapse(columnId: string, boardId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { isCollapsed: true, title: true },
    });
    if (!column) {
      return { error: "Column not found" };
    }
    await prisma.column.update({
      where: { id: columnId },
      data: { isCollapsed: !column.isCollapsed },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.UPDATED_COLUMN,
      `${column.isCollapsed ? "expanded" : "collapsed"} column "${column.title}"`,
      { columnId },
    );

    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to edit this board" };
    }
    return { error: "Failed to toggle column collapse" };
  }
}

export async function moveColumn(
  boardId: string,
  columnId: string,
  newPosition: number,
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.MEMBER);

    await prisma.column.update({
      where: { id: columnId },
      data: { position: newPosition },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.MOVED_COLUMN,
      "reordered a column",
      { columnId },
    );

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to edit this board" };
    }

    return { error: "Failed to move column" };
  }
}
