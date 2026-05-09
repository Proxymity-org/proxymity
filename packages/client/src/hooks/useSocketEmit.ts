import { socket } from "@/services/socket";

export const useSocketEmit = () => {
  return (event: string, data: unknown) => {
    if (socket.connected) {
      socket.emit(event, data);
    }
  };
};
