import { useEffect } from "react";
import { socket } from "@/services/socket";
import { SOCKET_EVENTS, IRoomState, IServerError } from '@proxymity/shared';
import { useAppStore } from "@/store/useAppStore";

export const useRoomConnection = (roomId: string) => {
  const setResponse = useAppStore((state) => state.setResponse);
  const setLoading = useAppStore((state) => state.setLoading);
  const setRequest = useAppStore((state) => state.setRequest);
  const setMethod = useAppStore((state) => state.setMethod);
  const setUrl = useAppStore((state) => state.setUrl);
  const setBody = useAppStore((state) => state.setBody);
  const setActiveUsers = useAppStore((state) => state.setActiveUsers);
  const setHeaders = useAppStore((state) => state.setHeaders);
  const setQueryParams = useAppStore((state) => state.setQueryParams);
  const setServerError = useAppStore((state) => state.setServerError);

  useEffect(() => {
    const onConnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.JOIN_ROOM, roomId);
    };

    const onDisconnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, roomId);
    };

    const onSyncState = (roomState: IRoomState) => {
      setRequest(roomState.request);
    };

    const onBroadcastChange = (updatedData: { field: string, value: any }) => {
      switch (updatedData.field) {
        case 'method': setMethod(updatedData.value); break;
        case 'url': setUrl(updatedData.value); break;
        case 'body': setBody(updatedData.value); break;
        case 'headers': setHeaders(updatedData.value); break;
        case 'queryParams': setQueryParams(updatedData.value); break;
        default: 
          console.warn(`Unknown field broadcasted from server: ${updatedData.field}`);
          break;
      }
    };

    const onRequestStarted = () => {
      setLoading(true);
      setServerError(null);
    }

    const onRequestComplete = (response: any) => {
      setResponse(response);
      setLoading(false);
    }

    const onUserCount = (count: number) => {
      setActiveUsers(count);
    }

    const onServerError = (error: IServerError) => {
      setLoading(false);
      setServerError(error);
    }

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
  }, [roomId, setRequest, setMethod, setUrl, setBody, setHeaders, setQueryParams, setResponse, setLoading, setActiveUsers, setServerError]);

  const sendRequest = () => {
    socket.emit(SOCKET_EVENTS.CLIENT.EXECUTE_REQUEST, { roomId });
  };

  return { sendRequest };
};