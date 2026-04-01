// packages/client/src/components/CursorOverlay.tsx

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { ICursorPosition } from '@proxymity/shared';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function CursorMarker({ cursor, fading }: { cursor: ICursorPosition; fading: boolean }) {
  const x = cursor.x * 100;
  const y = cursor.y * 100;
  const flipLeft = cursor.x > 0.85;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transition: 'left 80ms ease-out, top 80ms ease-out, opacity 400ms ease',
        opacity: fading ? 0 : 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Cursor arrow SVG */}
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
        <path
          d="M1 1 L1 13 L4 9.5 L7 15.5 L8.5 14.8 L5.5 8.5 L10.5 8.5 Z"
          fill={cursor.color}
          fillOpacity={0.9}
          stroke={cursor.color}
          strokeWidth="0.5"
          strokeOpacity={0.35}
        />
      </svg>

      {/* Username pill */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          ...(flipLeft ? { right: '10px' } : { left: '10px' }),
          backgroundColor: hexToRgba(cursor.color, 0.12),
          border: `1px solid ${hexToRgba(cursor.color, 0.28)}`,
          color: cursor.color,
          borderRadius: '3px',
          padding: '1px 6px',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          whiteSpace: 'nowrap',
          lineHeight: '16px',
        }}
      >
        {cursor.username}
      </div>
    </div>
  );
}

export function CursorOverlay() {
  const presenceCursors = useAppStore((state) => state.presenceCursors);
  const [fadingCursors, setFadingCursors] = useState<Record<string, ICursorPosition>>({});
  const prevRef = useRef<Record<string, ICursorPosition>>({});

  useEffect(() => {
    const prev = prevRef.current;
    const removed = Object.keys(prev).filter((id) => !presenceCursors[id]);

    if (removed.length > 0) {
      const toFade: Record<string, ICursorPosition> = {};
      removed.forEach((id) => { toFade[id] = prev[id]; });
      setFadingCursors((f) => ({ ...f, ...toFade }));

      const timer = setTimeout(() => {
        setFadingCursors((f) => {
          const next = { ...f };
          removed.forEach((id) => delete next[id]);
          return next;
        });
      }, 420);

      prevRef.current = presenceCursors;
      return () => clearTimeout(timer);
    }

    prevRef.current = presenceCursors;
  }, [presenceCursors]);

  const activeCursors = Object.values(presenceCursors);
  const staleCursors = Object.values(fadingCursors).filter((c) => !presenceCursors[c.userId]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {activeCursors.map((cursor) => (
        <CursorMarker key={cursor.userId} cursor={cursor} fading={false} />
      ))}
      {staleCursors.map((cursor) => (
        <CursorMarker key={`fading-${cursor.userId}`} cursor={cursor} fading={true} />
      ))}
    </div>
  );
}
