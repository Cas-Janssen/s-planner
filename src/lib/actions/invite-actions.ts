"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";
import { getServerSession } from "@/lib/auth/get-session";
import { logBoardActivity } from "@/lib/log-activity";
import { broadcastBoardUpdated } from "@/lib/socket/broadcast";

export async function getPendingInvites() {
  const session = await getServerSession();
  if (!session?.user) return [];

  return prisma.boardInvite.findMany({
    where: {
      invitedUserId: session.user.id,
      status: "PENDING",
    },
    include: {
      board: { select: { id: true, title: true } },
      invitedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptInvite(inviteId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const invite = await prisma.boardInvite.findUnique({
      where: { id: inviteId },
      include: { board: { select: { title: true } } },
    });

    if (!invite || invite.invitedUserId !== session.user.id) {
      return { error: "Invite not found" };
    }

    if (invite.status !== "PENDING") {
      return { error: "Invite is no longer pending" };
    }

    await prisma.$transaction([
      prisma.boardMember.create({
        data: {
          boardId: invite.boardId,
          userId: session.user.id,
          role: invite.role,
        },
      }),
      prisma.boardInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    await logBoardActivity(
      invite.boardId,
      session.user.id,
      ActivityType.INVITED_MEMBER,
      `${session.user.name} accepted invite and joined as ${invite.role.toLowerCase()}`,
    );

    broadcastBoardUpdated({
      boardId: invite.boardId,
      userId: session.user.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath(`/boards/${invite.boardId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to accept invite" };
  }
}

export async function declineInvite(inviteId: string) {
  const session = await getServerSession();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const invite = await prisma.boardInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.invitedUserId !== session.user.id) {
      return { error: "Invite not found" };
    }

    if (invite.status !== "PENDING") {
      return { error: "Invite is no longer pending" };
    }

    await prisma.boardInvite.update({
      where: { id: inviteId },
      data: { status: "DECLINED" },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error declining invite", { inviteId, error });
    return { error: "Failed to decline invite" };
  }
}
