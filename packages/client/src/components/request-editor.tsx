import { useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyValueTable } from "@/components/key-value-table"
import { useAppStore } from "@/store/useAppStore"
import Editor, { type BeforeMount, type OnMount, type Monaco } from "@monaco-editor/react"
import { socket } from "@/services/socket"
import { SOCKET_EVENTS } from "@proxymity/shared"
import type { IEditorCursor } from "@proxymity/shared"

type MonacoEditor = Parameters<OnMount>[0];
type IContentWidget = Parameters<MonacoEditor['addContentWidget']>[0];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface RequestEditorProps {
  roomId: string;
}

export function RequestEditor({ roomId }: RequestEditorProps) {
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('proxymity-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000', // Transparent background
      }
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

  const editorCursors = useAppStore((state) => state.editorCursors);
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const widgetsRef = useRef<Map<string, IContentWidget>>(new Map());
  const editorRafRef = useRef<number | null>(null);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    editor.onDidChangeCursorPosition((e) => {
      if (editorRafRef.current !== null) return;
      editorRafRef.current = requestAnimationFrame(() => {
        emitWithConnection(SOCKET_EVENTS.CLIENT.EDITOR_CURSOR_CHANGE, {
          roomId,
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
        editorRafRef.current = null;
      });
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const monacoInstance = monacoRef.current;
    if (!monacoInstance) return;

    const currentIds = new Set(Object.keys(editorCursors));
    const existingIds = new Set(widgetsRef.current.keys());

    // Remove widgets for users who left
    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        editor.removeContentWidget(widgetsRef.current.get(id)!);
        widgetsRef.current.delete(id);
      }
    });

    // Add or update widgets for current users
    currentIds.forEach((id) => {
      const cursor: IEditorCursor = editorCursors[id];

      // Remove old widget for this user before re-adding at new position
      if (widgetsRef.current.has(id)) {
        editor.removeContentWidget(widgetsRef.current.get(id)!);
      }

      const domNode = document.createElement('div');
      domNode.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;pointer-events:none;';

      const label = document.createElement('div');
      label.textContent = cursor.username;
      label.style.cssText = `
        background-color: ${hexToRgba(cursor.color, 0.12)};
        border: 1px solid ${hexToRgba(cursor.color, 0.28)};
        color: ${cursor.color};
        border-radius: 3px;
        padding: 0 5px;
        font-size: 10px;
        font-family: "JetBrains Mono", monospace;
        white-space: nowrap;
        line-height: 16px;
        margin-bottom: 1px;
      `;

      const line = document.createElement('div');
      line.style.cssText = `
        width: 2px;
        height: 18px;
        background-color: ${cursor.color};
        opacity: 0.8;
      `;

      domNode.appendChild(label);
      domNode.appendChild(line);

      const widget: IContentWidget = {
        getId: () => `presence-cursor-${id}`,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: { lineNumber: cursor.lineNumber, column: cursor.column },
          preference: [monacoInstance.editor.ContentWidgetPositionPreference.EXACT],
        }),
      };

      editor.addContentWidget(widget);
      widgetsRef.current.set(id, widget);
    });
  }, [editorCursors]);

  useEffect(() => {
    return () => {
      const editor = editorRef.current;
      if (!editor) return;
      widgetsRef.current.forEach((widget) => editor.removeContentWidget(widget));
      widgetsRef.current.clear();
      if (editorRafRef.current !== null) cancelAnimationFrame(editorRafRef.current);
    };
  }, []);

  const emitWithConnection = (event: string, data: any) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      socket.once('connect', () => {
        socket.emit(event, data);
      });
    }
  }

  const handleBodyChange = (newBody: string | undefined) => {
    const bodyContent = newBody || "";
    setBody(bodyContent);
    emitWithConnection(SOCKET_EVENTS.CLIENT.UPDATE_BODY, { roomId, body: bodyContent });
  }

  const handleHeadersChange = (action: () => void) => {
    try{ 
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
      <Tabs defaultValue="params" className="flex flex-1 flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
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

        <TabsContent value="body" className="flex-1 overflow-auto p-6 mt-0">
          <div className="flex h-full flex-col gap-2">
            
            <div className="relative flex-1 rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                defaultValue={body}
                value={body}
                onChange={handleBodyChange}
                theme="proxymity-dark"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                  fontFamily: 'var(--font-mono)',
                  renderLineHighlight: "none",
                  scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                    verticalScrollbarSize: 10,
                  },
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Supports JSON format with syntax highlighting.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}