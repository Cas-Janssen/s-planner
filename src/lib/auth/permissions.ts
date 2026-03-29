"use server";

import prisma from "@/lib/prisma";
import { BoardRole, BoardType } from "@prisma/client";
import { redirect } from "next/navigation";

function isValidObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/.test(id);
}

export async function getUserBoardPermission(boardId: string, userId: string) {
  if (!isValidObjectId(boardId)) {
    return null;
  }

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
  requiredRole: BoardRole,
): boolean {
  const roleHierarchy = {
    [BoardRole.MANAGER]: 3,
    [BoardRole.MEMBER]: 2,
    [BoardRole.VIEWER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

async function canUserAccessBoard(
  boardId: string,
  userId: string | undefined,
  requiredRole?: BoardRole,
): Promise<boolean> {
  if (!isValidObjectId(boardId)) {
    return false;
  }

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
  userId: string | undefined,
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.VIEWER);
}

export async function canUserEditBoard(
  boardId: string,
  userId: string,
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.MEMBER);
}

export async function canUserManageBoard(
  boardId: string,
  userId: string,
): Promise<boolean> {
  return canUserAccessBoard(boardId, userId, BoardRole.MANAGER);
}

export async function isUserBoardOwner(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const permission = await getUserBoardPermission(boardId, userId);
  return permission?.role === BoardRole.MANAGER;
}

export async function requireBoardPermission(
  boardId: string,
  userId: string,
  requiredRole: BoardRole = BoardRole.VIEWER,
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
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return publicBoards.map((board) => ({
      ...board,
      role: null as BoardRole | null,
      lastActivity: board.activities[0]?.createdAt ?? board.updatedAt,
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
          activities: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
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
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const all = [
    ...permissionedBoards.map((p) => ({
      ...p.board,
      role: p.role as BoardRole | null,
      lastActivity: p.board.activities[0]?.createdAt ?? p.board.updatedAt,
    })),
    ...publicBoards.map((board) => ({
      ...board,
      role: BoardRole.VIEWER as BoardRole | null,
      lastActivity: board.activities[0]?.createdAt ?? board.updatedAt,
    })),
  ];

  all.sort(
    (a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  return all;
}

export async function getBoardWithAccessCheck(
  boardId: string,
  userId: string | undefined,
  requiredRole?: BoardRole,
) {
  if (!isValidObjectId(boardId)) {
    return null;
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              members: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
      members: {
        include: {
          user: true,
        },
      },
      activities: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!board) {
    redirect("/not-found");
  }

  if (board.type === BoardType.PUBLIC) {
    if (!requiredRole) return board;

    if (!userId) return null;

    const permission = board.members.find((m) => m.userId === userId);
    if (!permission) return null;

    if (!checkRoleHierarchy(permission.role, requiredRole)) return null;
    return board;
  }

  if (board.type === BoardType.PRIVATE) {
    if (!userId) return null;

    const permission = board.members.find((m) => m.userId === userId);
    if (!permission) return null;

    if (!requiredRole) return board;

    if (!checkRoleHierarchy(permission.role, requiredRole)) return null;
    return board;
  }

  return null;
}
