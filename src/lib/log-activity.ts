import { ActivityType } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function logBoardActivity(
  boardId: string,
  userId: string,
  type: ActivityType,
  message: string
) {
  return prisma.activity.create({
    data: {
      boardId,
      userId,
      type,
      message,
    },
  });
}

export async function logUserActivity(
  userId: string,
  type: ActivityType,
  message: string
) {}
