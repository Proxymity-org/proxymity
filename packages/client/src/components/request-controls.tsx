import { Loader2, Send } from "lucide-react"
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

const METHOD_STYLES: Record<HttpMethod, { color: string; bg: string; border: string }> = {
  GET:    { color: '#5A8FC0', bg: 'rgba(90, 143, 192, 0.07)',  border: 'rgba(90, 143, 192, 0.22)'  },
  POST:   { color: '#4A9E6E', bg: 'rgba(74, 158, 110, 0.07)',  border: 'rgba(74, 158, 110, 0.22)'  },
  PUT:    { color: '#B08840', bg: 'rgba(176, 136, 64, 0.07)',   border: 'rgba(176, 136, 64, 0.22)'  },
  DELETE: { color: '#B06060', bg: 'rgba(176, 96, 96, 0.07)',    border: 'rgba(176, 96, 96, 0.22)'   },
  PATCH:  { color: '#8C7BC4', bg: 'rgba(140, 123, 196, 0.07)', border: 'rgba(140, 123, 196, 0.22)' },
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
      socket.once('connect', () => socket.emit(event, data));
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

  const ms = METHOD_STYLES[method];

  return (
    <div
      className="min-page-enter-2 flex items-center gap-3 border-b border-border px-6 py-3"
      style={{ backgroundColor: '#141618' }}
    >
      <Select value={method} onValueChange={handleMethodChange}>
        <SelectTrigger
          className="w-[100px] font-mono font-medium text-sm border transition-all"
          style={{
            color: ms.color,
            backgroundColor: ms.bg,
            borderColor: ms.border,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(METHOD_STYLES) as HttpMethod[]).map((m) => {
            const s = METHOD_STYLES[m];
            return (
              <SelectItem
                key={m}
                value={m}
                className="font-mono font-medium text-sm"
                style={{ color: s.color, fontFamily: '"JetBrains Mono", monospace' }}
              >
                {m}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Input
        type="url"
        placeholder="https://api.example.com/endpoint"
        value={url}
        onChange={handleUrlChange}
        className="flex-1 text-sm"
        style={{
          backgroundColor: '#0D0F10',
          borderColor: '#252930',
          color: '#E8EDF0',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.8125rem',
        }}
      />

      <Button
        onClick={onSend}
        disabled={isLoading}
        className="gap-2 min-w-24 text-sm font-medium border-0 transition-all"
        style={{
          backgroundColor: isLoading ? 'rgba(61, 143, 130, 0.4)' : '#3D8F82',
          color: '#0D0F10',
        }}
      >
        {isLoading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Send className="h-3.5 w-3.5" />
        }
        {isLoading ? "Sending…" : "Send"}
      </Button>
    </div>
  );
}
