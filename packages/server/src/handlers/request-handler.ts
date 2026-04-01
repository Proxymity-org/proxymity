import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@proxymity/shared';
import { executeRequest } from '../services/proxy-service';
import { stateStore } from '../services/state-store';


const handleExecuteRequest = async (
  io: Server, 
  roomId: string
) => {
  const roomState = stateStore.getOrCreateRoom(roomId);
  if (roomState.isLoading) {
    console.warn(`[Handler] Request ignored for room ${roomId}: Another request is pending.`);
    return; 
  }
  const requestData = roomState.request;

  stateStore.setLoading(roomId, true);
  io.to(roomId).emit(SOCKET_EVENTS.SERVER.REQUEST_STARTED);

  try {
    const response = await executeRequest(requestData);
    stateStore.setResponse(roomId, response);

    io.to(roomId).emit(SOCKET_EVENTS.SERVER.REQUEST_COMPLETE, response);
    
  } catch (criticalError) {
    // This block catches internal server errors (NOT HTTP 404/500 errors, those are handled by the proxy)
    console.error(`[CRITICAL] Error executing request for room ${roomId}:`, criticalError);
    stateStore.setLoading(roomId, false);
    
    const message = criticalError instanceof Error ? criticalError.message : 'Internal Proxy Error';
    io.to(roomId).emit(SOCKET_EVENTS.SERVER.ERROR, {
      message,
      code: 'proxy_error'
    });
  }
};


export const registerRequestHandlers = (io: Server, socket: Socket) => {
  
  socket.on(SOCKET_EVENTS.CLIENT.EXECUTE_REQUEST, ({ roomId }) => {
    if (typeof roomId !== 'string') {
      console.warn(`[Handler] EXECUTE_REQUEST ignored: Invalid roomId type provided by ${socket.id}`);
      return;
    }

    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      console.warn(`[Handler] EXECUTE_REQUEST ignored: Empty roomId provided by ${socket.id}`);
      return;
    }

    handleExecuteRequest(io, trimmedRoomId);
  });
};