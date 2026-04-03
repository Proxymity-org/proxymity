import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyValueTable } from "@/components/key-value-table"
import { useAppStore } from "@/store/useAppStore"
import Editor, { type BeforeMount } from "@monaco-editor/react"
import { socket } from "@/services/socket"
import { SOCKET_EVENTS } from "@proxymity/shared"

interface RequestEditorProps {
  roomId: string;
}

export function RequestEditor({ roomId }: RequestEditorProps) {
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('minerale-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json',   foreground: '5A8FC0' },
        { token: 'string.value.json', foreground: 'A8C8A0' },
        { token: 'number',            foreground: '8C7BC4' },
        { token: 'keyword.json',      foreground: '4A9E6E' },
        { token: 'string',            foreground: 'A8C8A0' },
      ],
      colors: {
        'editor.background':              '#141618',
        'editor.foreground':              '#E8EDF0',
        'editorLineNumber.foreground':    '#404950',
        'editor.selectionBackground':     '#25293080',
        'editor.lineHighlightBackground': '#00000000',
        'editorCursor.foreground':        '#3D8F82',
        'editorIndentGuide.background1':  '#252930',
        'editorBracketMatch.background':  'rgba(61,143,130,0.15)',
        'editorBracketMatch.border':      'rgba(61,143,130,0.4)',
      },
    });
  }

  const body = useAppStore((state) => state.request.body);
  const headers = useAppStore((state) => state.request.headers);
  const queryParams = useAppStore((state) => state.request.queryParams);

  const setBody = useAppStore((state) => state.setBody);
  const addHeader = useAppStore((state) => state.addHeader);
  const removeHeader = useAppStore((state) => state.removeHeader);
  const updateHeader = useAppStore((state) => state.updateHeader);
  const addQueryParam = useAppStore((state) => state.addQueryParam);
  const removeQueryParam = useAppStore((state) => state.removeQueryParam);
  const updateQueryParam = useAppStore((state) => state.updateQueryParam);

  const emitWithConnection = (event: string, data: any) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      socket.once('connect', () => socket.emit(event, data));
    }
  }

  const handleBodyChange = (newBody: string | undefined) => {
    const bodyContent = newBody || "";
    setBody(bodyContent);
    emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_BODY, { roomId, body: bodyContent });
  }

  const handleHeadersChange = (action: () => void) => {
    try {
      action();
      const updatedHeaders = useAppStore.getState().request.headers;
      emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_HEADERS, { roomId, headers: updatedHeaders });
    } catch (error) {
      console.error("Failed to update headers and emit socket event:", error);
    }
  }

  const handleParamsChange = (action: () => void) => {
    try {
      action();
      const updatedParams = useAppStore.getState().request.queryParams;
      emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_PARAMS, { roomId, queryParams: updatedParams });
    } catch (error) {
      console.error("Failed to update query parameters and emit socket event:", error);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="params" className="flex flex-1 flex-col overflow-hidden">
        <TabsList>
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="flex-1 overflow-auto p-6 mt-0">
          <KeyValueTable
            items={queryParams}
            onAdd={() => handleParamsChange(addQueryParam)}
            onUpdate={(id, field, value) => handleParamsChange(() => updateQueryParam(id, field, value))}
            onDelete={(id) => handleParamsChange(() => removeQueryParam(id))}
            placeholder="Query Parameter"
          />
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto p-6 mt-0">
          <KeyValueTable
            items={headers}
            onAdd={() => handleHeadersChange(addHeader)}
            onUpdate={(id, field, value) => handleHeadersChange(() => updateHeader(id, field, value))}
            onDelete={(id) => handleHeadersChange(() => removeHeader(id))}
            placeholder="Header"
          />
        </TabsContent>

        <TabsContent value="body" className="flex-1 overflow-hidden p-4 mt-0">
          <div className="h-full rounded-sm overflow-hidden border border-border/60">
            <Editor
              height="100%"
              defaultLanguage="json"
              defaultValue={body}
              value={body}
              onChange={handleBodyChange}
              theme="minerale-dark"
              beforeMount={handleEditorWillMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "off",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true,
                fontFamily: '"JetBrains Mono", monospace',
                fontLigatures: true,
                renderLineHighlight: "none",
                padding: { top: 12, bottom: 12 },
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                  verticalScrollbarSize: 5,
                },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
