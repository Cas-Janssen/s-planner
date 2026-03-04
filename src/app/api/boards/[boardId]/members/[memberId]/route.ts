import { getServerSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";
import { canUserManageBoard } from "@/lib/auth/permissions";
import { ActivityType, BoardRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { logBoardActivity } from "@/lib/log-activity";
import { broadcastBoardUpdated } from "@/lib/socket/broadcast";

interface RouteParams {
  params: Promise<{
    boardId: string;
    memberId: string;
  }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, memberId } = await params;

  try {
    const canManage = await canUserManageBoard(boardId, session.user.id);
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to manage this board" },
        { status: 403 },
      );
    }

    const managers = await prisma.boardMember.findMany({
      where: { boardId, role: BoardRole.MANAGER },
    });

    if (managers.length === 1 && managers[0].userId === memberId) {
      return NextResponse.json(
        { error: "Cannot remove the last manager from the board" },
        { status: 400 },
      );
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberId,
        },
      },
    });

    const removedUser = await prisma.user.findUnique({
      where: { id: memberId },
      select: { name: true, email: true },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.REMOVED_MEMBER,
      `removed ${removedUser?.name || removedUser?.email || "a member"} from the board`,
    );

    broadcastBoardUpdated({ boardId, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing board member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, memberId } = await params;

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role } = body;

  if (!role || !Object.values(BoardRole).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const canManage = await canUserManageBoard(boardId, session.user.id);
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to manage this board" },
        { status: 403 },
      );
    }

    if (role !== BoardRole.MANAGER) {
      const managers = await prisma.boardMember.findMany({
        where: { boardId, role: BoardRole.MANAGER },
      });

      if (managers.length === 1 && managers[0].userId === memberId) {
        return NextResponse.json(
          { error: "Cannot demote the only manager from the board" },
          { status: 400 },
        );
      }
    }

    await prisma.boardMember.update({
      where: {
        boardId_userId: {
          boardId,
          userId: memberId,
        },
      },
      data: { role },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: memberId },
      select: { name: true, email: true },
    });

    await logBoardActivity(
      boardId,
      session.user.id,
      ActivityType.UPDATED_MEMBER_ROLE,
      `changed ${updatedUser?.name || updatedUser?.email || "a member"}'s role to ${role.toLowerCase()}`,
    );

    broadcastBoardUpdated({ boardId, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 },
    );
  }
}
