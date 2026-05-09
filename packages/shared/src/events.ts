// packages/shared/src/events.ts

export const SOCKET_EVENTS = {
  CLIENT: {
    JOIN_ROOM: 'client:join_room',
    LEAVE_ROOM: 'client:leave_room',

    UPDATE_METHOD: 'client:update_method', // Payload: "GET" | "POST"
    UPDATE_URL: 'client:update_url',       // Payload: string
    UPDATE_HEADERS: 'client:update_headers',   // Payload: IKeyValue[]
    UPDATE_PARAMS: 'client:update_params',     // Payload: IKeyValue[]
    UPDATE_BODY: 'client:update_body',         // Payload: string (JSON)

    EXECUTE_REQUEST: 'client:execute_request', // Payload: IRequestData (opcional, o usa el estado del server)
  },
  
  SERVER: {
    SYNC_STATE: 'server:sync_state',     // Payload: IRoomState completo
    USER_COUNT: 'server:user_count',     // Payload: number
    BROADCAST_CHANGE: 'server:broadcast_change', 
    REQUEST_STARTED: 'server:request_started',   // "Loading..."
    REQUEST_COMPLETE: 'server:request_complete', // Payload: IResponseData
    ERROR: 'server:error'                        // Payload: IServerError
  }
} as const;