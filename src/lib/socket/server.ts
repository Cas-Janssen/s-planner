import { Server as SocketIOServer } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/socket/events";

type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

const globalForIO = globalThis as unknown as {
  __socketIO?: TypedServer;
};

export function setIO(io: TypedServer) {
  globalForIO.__socketIO = io;
}

export function getIO(): TypedServer | null {
  return globalForIO.__socketIO ?? null;
}
