"use server";

import prisma from "@/lib/prisma";
import { BoardRole, BoardType } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getUserBoardPermission(boardId: string, userId: string) {
  return await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });
}

function checkRoleHierarchy(
  userRole: BoardRole,
  requiredRole: BoardRole
): boolean {
  const roleHierarchy = {
    [BoardRole.OWNER]: 4,
    [BoardRole.ADMIN]: 3,
    [BoardRole.EDITOR]: 2,
    [BoardRole.VIEWER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

async function canUserAccessBoard(
  boardId: string,
  userId: string | undefined,
  requiredRole?: BoardRole
): Promise<boolean> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { type: true },
  });

  if (!board) redirect("/not-found");

  if (board.type === BoardType.PUBLIC) {
    if (!requiredRole) return true;

    if (!userId) return false;

    const permission = await getUserBoardPermission(boardId, userId);
    if (!permission) return false;

    return checkRoleHierarchy(permission.role, requiredRole);
  }

  if (board.type === BoardType.PRIVATE) {
    if (!userId) return false;

    const permission = await getUserBoardPermission(boardId, userId);
    if (!permission) return false;

    if (!requiredRole) return true;

    return checkRoleHierarchy(permission.role, requiredRole);
  }

  return false;
}

export async function canUserViewBoard(
  boardId: string,
  userId: string | undefined
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.VIEWER);
}

export async function canUserEditBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.EDITOR);
}

export async function canUserManageBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.ADMIN);
}

export async function isUserBoardOwner(
  boardId: string,
  userId: string
): Promise<boolean> {
  const permission = await getUserBoardPermission(boardId, userId);
  return permission?.role === BoardRole.OWNER;
}

export async function requireBoardPermission(
  boardId: string,
  userId: string,
  requiredRole: BoardRole = BoardRole.VIEWER
): Promise<void> {
  const hasPermission = await canUserAccessBoard(boardId, userId, requiredRole);

  if (!hasPermission) {
    throw new Error("Insufficient permissions");
  }
}

export async function getUserBoards(userId: string | null) {
  if (!userId) {
    const publicBoards = await prisma.board.findMany({
      where: { type: BoardType.PUBLIC },
      include: {
        columns: {
          include: {
            _count: { select: { tasks: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return publicBoards.map((board) => ({
      ...board,
      role: null as BoardRole | null,
    }));
  }

  const permissionedBoards = await prisma.boardMember.findMany({
    where: { userId },
    include: {
      board: {
        include: {
          columns: {
            include: {
              _count: { select: { tasks: true } },
            },
          },
        },
      },
    },
    orderBy: {
      board: { updatedAt: "desc" },
    },
  });

  const permissionedBoardIds = permissionedBoards.map((p) => p.boardId);

  const publicBoards = await prisma.board.findMany({
    where: {
      type: BoardType.PUBLIC,
      id: { notIn: permissionedBoardIds },
    },
    include: {
      columns: {
        include: {
          _count: { select: { tasks: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return [
    ...permissionedBoards.map((p) => ({
      ...p.board,
      role: p.role as BoardRole | null,
    })),
    ...publicBoards.map((board) => ({
      ...board,
      role: BoardRole.VIEWER as BoardRole | null,
    })),
  ];
}

export async function getBoardWithAccessCheck(
  boardId: string,
  userId: string | undefined,
  requiredRole?: BoardRole
) {
  const hasAccess = await canUserAccessBoard(boardId, userId, requiredRole);

  if (!hasAccess) {
    return null;
  }

  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
}
