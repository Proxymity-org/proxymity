import { useEffect } from "react";
import { socket } from "@/services/socket";
import { SOCKET_EVENTS, IRoomState, IServerError } from '@proxymity/shared';
import { useAppStore } from "@/store/useAppStore";

export const useRoomConnection = (roomId: string) => {
  useEffect(() => {
    const onConnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.JOIN_ROOM, roomId);
    };

    const onDisconnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, roomId);
    };

    const onSyncState = (roomState: IRoomState) => {
      const store = useAppStore.getState();
      store.setRequest(roomState.request);
      store.setLoading(roomState.isLoading);
      store.setResponse(roomState.response);
    };

    const onBroadcastChange = (updatedData: { field: string, value: any }) => {
      const store = useAppStore.getState();
      switch (updatedData.field) {
        case 'method': store.setMethod(updatedData.value); break;
        case 'url': store.setUrl(updatedData.value); break;
        case 'body': store.setBody(updatedData.value); break;
        case 'headers': store.setHeaders(updatedData.value); break;
        case 'queryParams': store.setQueryParams(updatedData.value); break;
        default:
          console.warn(`Unknown field broadcasted from server: ${updatedData.field}`);
          break;
      }
    };

    const onRequestStarted = () => {
      const store = useAppStore.getState();
      store.setLoading(true);
      store.setServerError(null);
    };

    const onRequestComplete = (response: any) => {
      const store = useAppStore.getState();
      store.setResponse(response);
      store.setLoading(false);
    };

    const onUserCount = (count: number) => {
      useAppStore.getState().setActiveUsers(count);
    };

    const onServerError = (error: IServerError) => {
      const store = useAppStore.getState();
      store.setLoading(false);
      store.setServerError(error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.SERVER.SYNC_STATE, onSyncState);
    socket.on(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, onBroadcastChange);
    socket.on(SOCKET_EVENTS.SERVER.REQUEST_STARTED, onRequestStarted);
    socket.on(SOCKET_EVENTS.SERVER.REQUEST_COMPLETE, onRequestComplete);
    socket.on(SOCKET_EVENTS.SERVER.USER_COUNT, onUserCount);
    socket.on(SOCKET_EVENTS.SERVER.ERROR, onServerError);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      useAppStore.getState().setServerError(null);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.SERVER.SYNC_STATE, onSyncState);
      socket.off(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, onBroadcastChange);
      socket.off(SOCKET_EVENTS.SERVER.REQUEST_STARTED, onRequestStarted);
      socket.off(SOCKET_EVENTS.SERVER.REQUEST_COMPLETE, onRequestComplete);
      socket.off(SOCKET_EVENTS.SERVER.USER_COUNT, onUserCount);
      socket.off(SOCKET_EVENTS.SERVER.ERROR, onServerError);
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, roomId);
      }
    };
  }, [roomId]);

  const sendRequest = () => {
    socket.emit(SOCKET_EVENTS.CLIENT.EXECUTE_REQUEST, { roomId });
  };

  return { sendRequest };
};
