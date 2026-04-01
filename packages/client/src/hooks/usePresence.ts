// packages/client/src/hooks/usePresence.ts

import { useEffect, useRef } from 'react';
import { socket } from '@/services/socket';
import { SOCKET_EVENTS } from '@proxymity/shared';
import type { ICursorPosition, IEditorCursor, IPresenceUser } from '@proxymity/shared';
import { useAppStore } from '@/store/useAppStore';

export function usePresence(roomId: string) {
  const setPresenceCursor = useAppStore((state) => state.setPresenceCursor);
  const removePresenceCursor = useAppStore((state) => state.removePresenceCursor);
  const setEditorCursor = useAppStore((state) => state.setEditorCursor);
  const removeEditorCursor = useAppStore((state) => state.removeEditorCursor);
  const setMyIdentity = useAppStore((state) => state.setMyIdentity);

  const rafRef = useRef<number | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // ── Mouse tracking (throttled via rAF) ───────────────────
    const handleMouseMove = (e: MouseEvent) => {
      // Use the root app div as coordinate space
      const container = document.getElementById('app-root');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      pendingPos.current = {
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingPos.current && socket.connected) {
            socket.emit(SOCKET_EVENTS.CLIENT.CURSOR_MOVE, {
              roomId,
              x: pendingPos.current.x,
              y: pendingPos.current.y,
            });
          }
          pendingPos.current = null;
          rafRef.current = null;
        });
      }
    };

    const handleMouseLeave = () => {
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.CLIENT.CURSOR_LEAVE, { roomId });
      }
    };

    // ── Socket listeners ──────────────────────────────────────
    const onPresenceInit = ({
      self,
    }: {
      self: IPresenceUser;
      users: IPresenceUser[];
    }) => {
      setMyIdentity(self);
      // `users` are existing room members — their cursors will arrive via CURSOR_UPDATE
      // as they move. No need to pre-populate cursor positions.
    };

    const onCursorUpdate = (cursor: ICursorPosition) => {
      setPresenceCursor(cursor);
    };

    const onCursorRemoved = ({ userId }: { userId: string }) => {
      removePresenceCursor(userId);
      removeEditorCursor(userId);
    };

    const onEditorCursorUpdate = (cursor: IEditorCursor) => {
      setEditorCursor(cursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    socket.on(SOCKET_EVENTS.SERVER.PRESENCE_INIT, onPresenceInit);
    socket.on(SOCKET_EVENTS.SERVER.CURSOR_UPDATE, onCursorUpdate);
    socket.on(SOCKET_EVENTS.SERVER.CURSOR_REMOVED, onCursorRemoved);
    socket.on(SOCKET_EVENTS.SERVER.EDITOR_CURSOR_UPDATE, onEditorCursorUpdate);

    // ── Inactivity eviction (every 1s, remove cursors older than 3s) ──
    const evictionInterval = setInterval(() => {
      const cursors = useAppStore.getState().presenceCursors;
      const now = Date.now();
      Object.values(cursors).forEach((cursor) => {
        if (now - cursor.updatedAt > 3000) {
          removePresenceCursor(cursor.userId);
          removeEditorCursor(cursor.userId);
        }
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      socket.off(SOCKET_EVENTS.SERVER.PRESENCE_INIT, onPresenceInit);
      socket.off(SOCKET_EVENTS.SERVER.CURSOR_UPDATE, onCursorUpdate);
      socket.off(SOCKET_EVENTS.SERVER.CURSOR_REMOVED, onCursorRemoved);
      socket.off(SOCKET_EVENTS.SERVER.EDITOR_CURSOR_UPDATE, onEditorCursorUpdate);
      clearInterval(evictionInterval);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [roomId, setPresenceCursor, removePresenceCursor, setEditorCursor, removeEditorCursor, setMyIdentity]);
}
