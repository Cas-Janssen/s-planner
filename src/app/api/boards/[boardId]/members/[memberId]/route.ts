import { getServerSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";
import {
  canUserManageBoard,
  getUserBoardPermission,
} from "@/lib/auth/permissions";
import { BoardRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

    // Prevent removing the only manager
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
  const body = await req.json();
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

    // Prevent removing the only manager
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating board member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 },
    );
  }
}
