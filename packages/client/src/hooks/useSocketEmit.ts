import { useEffect, useRef } from "react";
import { socket } from "@/services/socket";

export const useSocketEmit = () => {
  const pendingRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    const flushPending = () => {
      pendingRef.current.forEach((data, event) => {
        socket.emit(event, data);
      });
      pendingRef.current.clear();
    };

    socket.on("connect", flushPending);

    return () => {
      socket.off("connect", flushPending);
      pendingRef.current.clear();
    };
  }, []);

  return (event: string, data: unknown) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      pendingRef.current.set(event, data);
    }
  };
};
