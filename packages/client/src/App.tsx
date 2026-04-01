import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { WorkspaceHeader } from "@/components/workspace-header"
import { RequestControls } from "@/components/request-controls"
import { RequestEditor } from "@/components/request-editor"
import { ResponseViewer } from "@/components/response-viewer"
import { useAppStore } from "@/store/useAppStore"
import { useRoomConnection } from "@/hooks/useRoomConnection"

function App() {
  const [roomId] = useState<string>("example-room-id");

  const { sendRequest } = useRoomConnection(roomId);
  const activeUsers = useAppStore((state) => state.activeUsers);
  const serverError = useAppStore((state) => state.serverError);

  if (serverError?.code === 'room_error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h2 className="text-base font-semibold">Could not join room</h2>
        <p className="text-sm text-muted-foreground">{serverError.message}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <WorkspaceHeader roomId={roomId} activeUsers={activeUsers} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <RequestControls
          roomId={roomId}
          onSend={sendRequest}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r border-border overflow-hidden">
            <RequestEditor
              roomId={roomId}
            />
          </div>

          <div className="w-1/2 overflow-hidden">
            <ResponseViewer/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;