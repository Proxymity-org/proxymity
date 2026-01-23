import { useEffect } from "react";
import { socket } from "@/services/socket";
import { SOCKET_EVENTS, IRoomState } from '@proxymity/shared';
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

  useEffect(() => {
    const onConnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.JOIN_ROOM, roomId);
    };

    const onDisconnect = () => {
      socket.emit(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, roomId);
    };

    const onSyncState = (roomState: IRoomState) => {
      console.log("Received state from server:", roomState);
      setRequest(roomState.request);
    };

    const onBroadcastChange = (updatedData: { field: string, value: any }) => {
      console.log("Received broadcasted change:", updatedData);
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
    }

    const onRequestComplete = (response: any) => {
      setResponse(response);
      setLoading(false);
    }

    const onUserCount = (count: number) => {
      setActiveUsers(count);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.SERVER.SYNC_STATE, onSyncState);
    socket.on(SOCKET_EVENTS.SERVER.BROADCAST_CHANGE, onBroadcastChange);
    socket.on(SOCKET_EVENTS.SERVER.REQUEST_STARTED, onRequestStarted);
    socket.on(SOCKET_EVENTS.SERVER.REQUEST_COMPLETE, onRequestComplete);
    socket.on(SOCKET_EVENTS.SERVER.USER_COUNT, onUserCount);

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
      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, roomId);
      }
    };
  }, [roomId, setRequest, setMethod, setUrl, setBody, setHeaders, setQueryParams, setResponse, setLoading, setActiveUsers]);

  const sendRequest = () => {
    const currentRequest = useAppStore.getState().request;
    console.log("Sending request:", currentRequest);
    console.log(roomId);
    socket.emit(SOCKET_EVENTS.CLIENT.EXECUTE_REQUEST, { roomId });
  };

  return { sendRequest };
};