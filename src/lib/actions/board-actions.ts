"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBoardPermission } from "@/lib/auth/permissions";
import { BoardRole, BoardType } from "@prisma/client";
import { getServerSession } from "../auth/get-session";
import { computeInitialPosition } from "@/lib/helpers/position-calculator";

const createBoardSchema = z.object({
  title: z.string().min(1).max(100),
  template: z.enum(["trello", "kanban", "custom"]),
  type: z.enum(BoardType).default(BoardType.PRIVATE),
});

export async function createBoard(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  const validatedFields = createBoardSchema.safeParse({
    title: formData.get("title"),
    template: formData.get("template"),
    type: formData.get("type") || BoardType.PRIVATE,
  });

  if (!validatedFields.success) {
    return {
      error: "Title is required and must be less than 100 characters",
    };
  }

  const { title, template, type } = validatedFields.data;

  try {
    let columnData: { title: string; position: number }[];

    switch (template) {
      case "trello": {
        const titles = ["To Do", "In Progress", "Done"];
        columnData = titles.map((t, i) => ({
          title: t,
          position: computeInitialPosition(i),
        }));
        break;
      }
      case "kanban": {
        const titles = ["Backlog", "To Do", "In Progress", "Review", "Done"];
        columnData = titles.map((t, i) => ({
          title: t,
          position: computeInitialPosition(i),
        }));
        break;
      }
      case "custom":
        columnData = [];
        break;
    }

    const board = await prisma.board.create({
      data: {
        title,
        type,
        columns:
          columnData.length > 0
            ? {
                create: columnData,
              }
            : undefined,
        members: {
          create: {
            userId: session.user.id,
            role: BoardRole.OWNER,
          },
        },
        User: {
          connect: { id: session.user.id },
        },
      },
    });

    revalidatePath("/boards");
    return { success: true, boardId: board.id };
  } catch (error) {
    return { error: "Failed to create board" };
  }
}

export async function deleteBoard(boardId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.OWNER);

    await prisma.board.delete({
      where: { id: boardId },
    });

    revalidatePath("/boards");
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return { error: "You don't have permission to delete this board" };
    }
    return { error: "Failed to delete board" };
  }
}

export async function updateBoard(
  boardId: string,
  data: { title?: string; type?: BoardType }
) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await requireBoardPermission(boardId, session.user.id, BoardRole.OWNER);

    await prisma.board.update({
      where: { id: boardId },
      data,
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
    return { error: "Failed to update board" };
  }
}
