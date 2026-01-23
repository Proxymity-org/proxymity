import { useState } from "react"
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