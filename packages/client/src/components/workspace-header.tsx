interface WorkspaceHeaderProps {
  roomId: string;
  activeUsers: number;
}

const AVATAR_COLORS = [
  { bg: 'rgba(61, 143, 130, 0.12)',  border: 'rgba(61, 143, 130, 0.28)',  text: '#3D8F82' },
  { bg: 'rgba(74, 158, 110, 0.12)',  border: 'rgba(74, 158, 110, 0.28)',  text: '#4A9E6E' },
  { bg: 'rgba(90, 143, 192, 0.12)',  border: 'rgba(90, 143, 192, 0.28)',  text: '#5A8FC0' },
  { bg: 'rgba(140, 123, 196, 0.12)', border: 'rgba(140, 123, 196, 0.28)', text: '#8C7BC4' },
];

const AVATAR_INITIALS = ['W', 'J', 'A', 'M'];

export function WorkspaceHeader({ roomId, activeUsers }: WorkspaceHeaderProps) {
  const visible = Math.min(activeUsers, 4);
  const extra = Math.max(0, activeUsers - 4);

  return (
    <header className="min-page-enter flex items-center justify-between border-b border-border px-6 py-4"
      style={{ backgroundColor: '#141618' }}
    >
      {/* Brand — upright serif, more architectural than the italic POC 1 */}
      <div className="flex items-center gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full min-teal-breath"
          style={{ backgroundColor: '#3D8F82' }}
        />
        <h1
          className="text-[1.1875rem] tracking-wide text-foreground select-none"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Proxymity
        </h1>
        {/* Slash separator */}
        <span className="text-border text-base select-none" style={{ color: '#252930' }}>/</span>
        <span
          className="font-mono text-xs tracking-wider"
          style={{ color: '#6B7880', fontFamily: '"JetBrains Mono", monospace' }}
        >
          {roomId}
        </span>
      </div>

      {/* Users */}
      {activeUsers > 0 && (
        <div className="flex items-center gap-3">
          <span
            className="text-[0.6875rem] tracking-[0.12em] uppercase select-none"
            style={{ color: '#404950' }}
          >
            {activeUsers} online
          </span>
          <div className="flex items-center">
            {Array.from({ length: visible }).map((_, i) => {
              const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div
                  key={i}
                  className="relative w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-semibold border"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    color: c.text,
                    marginLeft: i === 0 ? 0 : -6,
                    zIndex: visible - i,
                    fontFamily: '"IBM Plex Sans", sans-serif',
                  }}
                >
                  {AVATAR_INITIALS[i % AVATAR_INITIALS.length]}
                </div>
              );
            })}
            {extra > 0 && (
              <div
                className="relative w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] border"
                style={{
                  marginLeft: -6,
                  zIndex: 0,
                  backgroundColor: 'rgba(37, 41, 48, 0.9)',
                  borderColor: '#252930',
                  color: '#6B7880',
                }}
              >
                +{extra}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
