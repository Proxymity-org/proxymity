import { useState } from "react"
import { Loader2, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAppStore } from "@/store/useAppStore"

export function ResponseViewer() {
    const [isCopied, setIsCopied] = useState(false)
    const isLoading = useAppStore((state) => state.isLoading);
    const response = useAppStore((state) => state.response);
  
    if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sending request...</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No response yet. Send a request to see the results.</p>
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-500 bg-emerald-500/10"
    if (status >= 300 && status < 400) return "text-blue-500 bg-blue-500/10"
    if (status >= 400 && status < 500) return "text-amber-500 bg-amber-500/10"
    return "text-red-500 bg-red-500/10"
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleCopy = async () => {
    if (!response.data) return

    try {
      const content = JSON.stringify(response.data as object | string | number | boolean | null, null, 2)
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border bg-card/50 px-6 py-4">
        <Badge className={`font-semibold ${getStatusColor(response.status)}`}>
          {response.status} {response.statusText}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Time:</span>
          <span className="font-mono font-medium text-foreground">{response.time}ms</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Size:</span>
          <span className="font-mono font-medium text-foreground">{formatBytes(response.size)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="group relative rounded-lg bg-muted/20 overflow-hidden border border-border/50">
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 bg-background/50 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              fontFamily: 'var(--font-mono)',
            }}
            wrapLongLines={true}
          >
            {JSON.stringify(response.data as object | string | number | boolean | null, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}