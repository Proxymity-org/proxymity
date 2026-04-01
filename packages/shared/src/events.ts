// packages/shared/src/events.ts

export const SOCKET_EVENTS = {
  CLIENT: {
    JOIN_ROOM: 'client:join_room',
    LEAVE_ROOM: 'client:leave_room',

    UPDATE_METHOD: 'client:update_method',
    UPDATE_URL: 'client:update_url',
    UPDATE_HEADERS: 'client:update_headers',
    UPDATE_PARAMS: 'client:update_params',
    UPDATE_BODY: 'client:update_body',

    EXECUTE_REQUEST: 'client:execute_request',

    // Presence
    CURSOR_MOVE: 'client:cursor_move',                   // { roomId, x, y }
    CURSOR_LEAVE: 'client:cursor_leave',                 // { roomId }
    EDITOR_CURSOR_CHANGE: 'client:editor_cursor_change', // { roomId, lineNumber, column }
  },

  SERVER: {
    SYNC_STATE: 'server:sync_state',     // Payload: IRoomState completo
    USER_COUNT: 'server:user_count',     // Payload: number
    BROADCAST_CHANGE: 'server:broadcast_change',
    REQUEST_STARTED: 'server:request_started',   // "Loading..."
    REQUEST_COMPLETE: 'server:request_complete', // Payload: IResponseData
    ERROR: 'server:error',                       // Payload: IServerError

    // Presence
    PRESENCE_INIT: 'server:presence_init',               // { self: IPresenceUser, users: IPresenceUser[] }
    USER_JOINED: 'server:user_joined',                   // IPresenceUser
    CURSOR_UPDATE: 'server:cursor_update',               // ICursorPosition
    CURSOR_REMOVED: 'server:cursor_removed',             // { userId: string }
    EDITOR_CURSOR_UPDATE: 'server:editor_cursor_update', // IEditorCursor
  },
} as const;
