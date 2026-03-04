"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useSocket, type TypedSocket } from "@/lib/socket/use-socket";

const SocketContext = createContext<TypedSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext(): TypedSocket | null {
  return useContext(SocketContext);
}
