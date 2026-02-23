import { ActivityType } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function logBoardActivity(
  boardId: string,
  userId: string,
  type: ActivityType,
  message: string,
  options?: {
    columnId?: string | null;
    taskId?: string | null;
    metadata?: Record<string, unknown> | null;
  },
) {
  return prisma.activity.create({
    data: {
      boardId,
      userId,
      type,
      message,
      columnId: options?.columnId ?? null,
      taskId: options?.taskId ?? null,
      metadata: (options?.metadata as any) ?? null,
    },
  });
}

export async function logUserActivity(
  userId: string,
  type: ActivityType,
  message: string,
) {
  return prisma.activity.create({
    data: {
      userId,
      type,
      message,
    },
  });
}
