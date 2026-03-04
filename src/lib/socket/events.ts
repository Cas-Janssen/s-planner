export const SOCKET_EVENTS = {
  JOIN_BOARD: "board:join",
  LEAVE_BOARD: "board:leave",

  BOARD_UPDATED: "board:updated",
  BOARD_DELETED: "board:deleted",

  COLUMN_CREATED: "column:created",
  COLUMN_UPDATED: "column:updated",
  COLUMN_DELETED: "column:deleted",
  COLUMN_MOVED: "column:moved",

  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_COMPLETED: "task:completed",
  TASK_MOVED: "task:moved",

  MEMBER_INVITED: "member:invited",
  MEMBER_UPDATED: "member:updated",

  ACTIVITY_CREATED: "activity:created",
} as const;

export interface BoardEventPayload {
  boardId: string;
  userId: string;
}

export interface ColumnEventPayload extends BoardEventPayload {
  columnId: string;
}

export interface TaskEventPayload extends BoardEventPayload {
  taskId: string;
  columnId?: string;
}

export interface MemberEventPayload extends BoardEventPayload {
  memberId?: string;
  email?: string;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.BOARD_UPDATED]: (payload: BoardEventPayload) => void;
  [SOCKET_EVENTS.BOARD_DELETED]: (payload: BoardEventPayload) => void;

  [SOCKET_EVENTS.COLUMN_CREATED]: (payload: ColumnEventPayload) => void;
  [SOCKET_EVENTS.COLUMN_UPDATED]: (payload: ColumnEventPayload) => void;
  [SOCKET_EVENTS.COLUMN_DELETED]: (payload: ColumnEventPayload) => void;
  [SOCKET_EVENTS.COLUMN_MOVED]: (payload: ColumnEventPayload) => void;

  [SOCKET_EVENTS.TASK_CREATED]: (payload: TaskEventPayload) => void;
  [SOCKET_EVENTS.TASK_UPDATED]: (payload: TaskEventPayload) => void;
  [SOCKET_EVENTS.TASK_DELETED]: (payload: TaskEventPayload) => void;
  [SOCKET_EVENTS.TASK_COMPLETED]: (payload: TaskEventPayload) => void;
  [SOCKET_EVENTS.TASK_MOVED]: (payload: TaskEventPayload) => void;

  [SOCKET_EVENTS.MEMBER_INVITED]: (payload: MemberEventPayload) => void;
  [SOCKET_EVENTS.MEMBER_UPDATED]: (payload: MemberEventPayload) => void;

  [SOCKET_EVENTS.ACTIVITY_CREATED]: (payload: BoardEventPayload) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_BOARD]: (boardId: string) => void;
  [SOCKET_EVENTS.LEAVE_BOARD]: (boardId: string) => void;
}
