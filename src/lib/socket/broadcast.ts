import { getIO } from "@/lib/socket/server";
import {
  SOCKET_EVENTS,
  BoardEventPayload,
  ColumnEventPayload,
  TaskEventPayload,
  MemberEventPayload,
} from "@/lib/socket/events";

function boardRoom(boardId: string) {
  return `board:${boardId}`;
}

export function broadcastBoardUpdated(payload: BoardEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.BOARD_UPDATED, payload);
}

export function broadcastBoardDeleted(payload: BoardEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.BOARD_DELETED, payload);
}

export function broadcastColumnCreated(payload: ColumnEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.COLUMN_CREATED, payload);
}

export function broadcastColumnUpdated(payload: ColumnEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.COLUMN_UPDATED, payload);
}

export function broadcastColumnDeleted(payload: ColumnEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.COLUMN_DELETED, payload);
}

export function broadcastColumnMoved(payload: ColumnEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.COLUMN_MOVED, payload);
}

export function broadcastTaskCreated(payload: TaskEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.TASK_CREATED, payload);
}

export function broadcastTaskUpdated(payload: TaskEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.TASK_UPDATED, payload);
}

export function broadcastTaskDeleted(payload: TaskEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.TASK_DELETED, payload);
}

export function broadcastTaskCompleted(payload: TaskEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.TASK_COMPLETED, payload);
}

export function broadcastTaskMoved(payload: TaskEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.TASK_MOVED, payload);
}

export function broadcastMemberInvited(payload: MemberEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.MEMBER_INVITED, payload);
}

export function broadcastActivityCreated(payload: BoardEventPayload) {
  getIO()
    ?.to(boardRoom(payload.boardId))
    .emit(SOCKET_EVENTS.ACTIVITY_CREATED, payload);
}
