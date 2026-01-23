import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, HttpMethod, IKeyValue } from '@proxymity/shared';
import { stateStore } from '../services/state-store';


const handleJoinRoom = (io: Server, socket: Socket, roomId: string) => {
  socket.join(roomId);
  
  const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
  stateStore.updateUserCount(roomId, userCount);
  
  const currentState = stateStore.getOrCreateRoom(roomId);

  socket.emit(SOCKET_EVENTS.SERVER.SYNC_STATE, currentState);
  io.to(roomId).emit(SOCKET_EVENTS.SERVER.USER_COUNT, userCount);

  console.log(`[Room] ${socket.id} joined ${roomId}. State synced.`);
};

const handleLeaveRoom = (io: Server, socket: Socket, roomId: string) => {
  if (!roomId || typeof roomId !== 'string') return;

  socket.leave(roomId);

  const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
  stateStore.updateUserCount(roomId, userCount);

  if (userCount > 0) {
    io.to(roomId).emit(SOCKET_EVENTS.SERVER.USER_COUNT, userCount);
  }

  console.log(`[Room] ${socket.id} left ${roomId}. Users remaining: ${userCount}`);
};

const handleDisconnecting = (io: Server, socket: Socket) => {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      const currentSize = io.sockets.adapter.rooms.get(roomId)?.size || 1;
      const newCount = currentSize - 1;

      stateStore.updateUserCount(roomId, newCount);
      
      io.to(roomId).emit(SOCKET_EVENTS.SERVER.USER_COUNT, newCount);
    }
  }
};

const handleUpdateMethod = (socket: Socket, roomId: string, method: HttpMethod) => {
  const acceptedMethod = stateStore.updateMethod(roomId, method);
  
  if (acceptedMethod) {
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, { 
      field: 'method', 
      value: acceptedMethod 
    });
  }
};

const handleUpdateUrl = (socket: Socket, roomId: string, url: string) => {
  const acceptedUrl = stateStore.updateUrl(roomId, url);
  
  if (acceptedUrl !== null) { 
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, { 
      field: 'url', 
      value: acceptedUrl 
    });
  }
};

const handleUpdateBody = (socket: Socket, roomId: string, body: string) => {
  const acceptedBody = stateStore.updateBody(roomId, body);
  
  if (acceptedBody !== null) {
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, { 
      field: 'body', 
      value: acceptedBody 
    });
  }
};

const handleUpdateHeaders = (socket: Socket, roomId: string, headers: IKeyValue[]) => {
  const acceptedHeaders = stateStore.updateKeyValueList(roomId, 'headers', headers);
  
  if (acceptedHeaders) {
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, { 
      field: 'headers', 
      value: acceptedHeaders 
    });
  }
};

const handleUpdateParams = (socket: Socket, roomId: string, params: IKeyValue[]) => {
  const acceptedParams = stateStore.updateKeyValueList(roomId, 'queryParams', params);
  
  if (acceptedParams) {
    socket.to(roomId).emit(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, { 
      field: 'queryParams', 
      value: acceptedParams 
    });
  }
};

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on(SOCKET_EVENTS.CLIENT.JOIN_ROOM, (roomId: string) => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      console.warn(`[RoomHandler] Invalid roomId received from ${socket.id}`);
      socket.emit(SOCKET_EVENTS.SERVER.ERROR, { message: "Invalid Room ID" });
      return;
    }
    handleJoinRoom(io, socket, roomId);
  });

  socket.on(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, (roomId: string) => {
    handleLeaveRoom(io, socket, roomId);
  });

  socket.on('disconnecting', () => {
    handleDisconnecting(io, socket);
  });
  
  socket.on(SOCKET_EVENTS.CLIENT.UPDATE_METHOD, ({ roomId, method }) => {
    handleUpdateMethod(socket, roomId, method);
  });

  socket.on(SOCKET_EVENTS.CLIENT.UPDATE_URL, ({ roomId, url }) => {
    handleUpdateUrl(socket, roomId, url);
  });

  socket.on(SOCKET_EVENTS.CLIENT.UPDATE_HEADERS, ({ roomId, headers }) => {
    handleUpdateHeaders(socket, roomId, headers);
  });

  socket.on(SOCKET_EVENTS.CLIENT.UPDATE_PARAMS, ({ roomId, queryParams }) => {
    handleUpdateParams(socket, roomId, queryParams);
  });

  socket.on(SOCKET_EVENTS.CLIENT.UPDATE_BODY, ({ roomId, body }) => {
    handleUpdateBody(socket, roomId, body);
  });
};