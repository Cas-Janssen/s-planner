import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/socket/server";
import { SOCKET_EVENTS } from "./src/lib/socket/events";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./src/lib/socket/events";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

async function main() {
  const app = next({ dev, hostname, port });
  const handler = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer(handler);

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: dev
          ? [`http://${hostname}:${port}`, "http://localhost:3000"]
          : undefined,
        methods: ["GET", "POST"],
        credentials: true,
      },
    },
  );

  setIO(io);

  io.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.JOIN_BOARD, (boardId: string) => {
      console.log(`Socket ${socket.id} joined board ${boardId}`);
      socket.join(`board:${boardId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_BOARD, (boardId: string) => {
      console.log(`Socket ${socket.id} left board ${boardId}`);
      socket.leave(`board:${boardId}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
