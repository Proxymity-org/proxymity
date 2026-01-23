import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HttpMethod, SOCKET_EVENTS } from "@proxymity/shared"
import { useAppStore } from "@/store/useAppStore"
import { socket } from "@/services/socket"

interface RequestControlsProps {
  roomId: string;
  onSend: () => void
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-blue-500",
  POST: "text-emerald-500",
  PUT: "text-amber-500",
  DELETE: "text-red-500",
  PATCH: "text-purple-500",
}


export function RequestControls({ roomId, onSend }: RequestControlsProps) {
  const url = useAppStore((state) => state.request.url);
  const method = useAppStore((state) => state.request.method);
  const isLoading = useAppStore((state) => state.isLoading);
  const setUrl = useAppStore((state) => state.setUrl);
  const setMethod = useAppStore((state) => state.setMethod);

  const emitWithConnection = (event: string, data: any) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      socket.once('connect', () => {
        socket.emit(event, data);
      });
    }
  }

  const handleMethodChange = (newMethod: HttpMethod) => {
    setMethod(newMethod);
    emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_METHOD, { roomId, method: newMethod });
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_URL, { roomId, url: newUrl });
  }

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card/50 px-6 py-4">
      <Select
        value={method}
        onValueChange={handleMethodChange}
      >
        <SelectTrigger className={`w-32 font-semibold ${METHOD_COLORS[method]}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {
            Object.keys(METHOD_COLORS).map((method) => (
              <SelectItem
                key={method}
                value={method}
                className={`font-semibold ${METHOD_COLORS[method as HttpMethod]}`}
              >
                {method}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>

      <Input
        type="url"
        placeholder="https://api.example.com/endpoint"
        value={url}
        onChange={handleUrlChange}
        className="flex-1 font-mono text-sm"
      />

      <Button onClick={onSend} disabled={isLoading} className="gap-2 min-w-28" size="default">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" /> // Loading spinner
        ) : (
          <Play className="h-4 w-4" /> // Play icon
        )}
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </div>
  )
}