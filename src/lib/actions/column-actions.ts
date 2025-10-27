"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/get-session";
import { requireBoardPermission } from "@/lib/auth/permissions";
import { BoardRole } from "@prisma/client";

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
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

    const maxPosition = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    await prisma.column.create({
      data: {
        title,
        boardId,
        position: (maxPosition?.position ?? -1) + 1,
      },
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

    return { error: "Failed to create column" };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);

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
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);
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
    await requireBoardPermission(boardId, session.user.id, BoardRole.EDITOR);
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { isCollapsed: true },
    });
    if (!column) {
      return { error: "Column not found" };
    }
    await prisma.column.update({
      where: { id: columnId },
      data: { isCollapsed: !column.isCollapsed },
    });
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
