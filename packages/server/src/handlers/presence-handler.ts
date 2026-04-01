// packages/server/src/handlers/presence-handler.ts

import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@proxymity/shared';

export const registerPresenceHandlers = (io: Server, socket: Socket) => {
  socket.on(SOCKET_EVENTS.CLIENT.CURSOR_MOVE, ({ roomId, x, y }: { roomId: string; x: number; y: number }) => {
    if (!socket.data.username || !socket.data.color) return;
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.CURSOR_UPDATE, {
      userId: socket.id,
      username: socket.data.username,
      color: socket.data.color,
      x,
      y,
      updatedAt: Date.now(),
    });
  });

  socket.on(SOCKET_EVENTS.CLIENT.CURSOR_LEAVE, ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.CURSOR_REMOVED, { userId: socket.id });
  });

  socket.on(
    SOCKET_EVENTS.CLIENT.EDITOR_CURSOR_CHANGE,
    ({ roomId, lineNumber, column }: { roomId: string; lineNumber: number; column: number }) => {
      if (!socket.data.username || !socket.data.color) return;
      socket.to(roomId).emit(SOCKET_EVENTS.SERVER.EDITOR_CURSOR_UPDATE, {
        userId: socket.id,
        username: socket.data.username,
        color: socket.data.color,
        lineNumber,
        column,
      });
    }
  );

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId as string | undefined;
    if (roomId) {
      socket.to(roomId).emit(SOCKET_EVENTS.SERVER.CURSOR_REMOVED, { userId: socket.id });
    }
  });
};
