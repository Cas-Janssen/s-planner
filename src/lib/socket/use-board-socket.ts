"use client";

import { useEffect, useRef } from "react";
import { useSocketContext } from "@/lib/socket/socket-provider";
import { SOCKET_EVENTS } from "@/lib/socket/events";

const BOARD_EVENTS = [
  SOCKET_EVENTS.BOARD_UPDATED,
  SOCKET_EVENTS.BOARD_DELETED,
  SOCKET_EVENTS.COLUMN_CREATED,
  SOCKET_EVENTS.COLUMN_UPDATED,
  SOCKET_EVENTS.COLUMN_DELETED,
  SOCKET_EVENTS.COLUMN_MOVED,
  SOCKET_EVENTS.TASK_CREATED,
  SOCKET_EVENTS.TASK_UPDATED,
  SOCKET_EVENTS.TASK_DELETED,
  SOCKET_EVENTS.TASK_COMPLETED,
  SOCKET_EVENTS.TASK_MOVED,
  SOCKET_EVENTS.MEMBER_INVITED,
  SOCKET_EVENTS.MEMBER_UPDATED,
  SOCKET_EVENTS.ACTIVITY_CREATED,
] as const;

export function useBoardSocket(
  boardId: string,
  onBoardEvent: (event: string, payload: unknown) => void,
) {
  const socket = useSocketContext();
  const onBoardEventRef = useRef(onBoardEvent);
  onBoardEventRef.current = onBoardEvent;

  useEffect(() => {
    if (!socket || !boardId) return;

    socket.emit(SOCKET_EVENTS.JOIN_BOARD, boardId);

    const handlers = BOARD_EVENTS.map((event) => {
      const handler = (payload: unknown) => {
        onBoardEventRef.current(event, payload);
      };
      socket.on(event as any, handler);
      return { event, handler };
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_BOARD, boardId);
      for (const { event, handler } of handlers) {
        socket.off(event as any, handler);
      }
    };
  }, [socket, boardId]);
}
