"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/socket/events";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket(): TypedSocket | null {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const s: TypedSocket = io({
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socket;
}
