import { useState } from "react"
import { Loader2, Copy, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useAppStore } from "@/store/useAppStore"

// Minerale syntax theme — cool tones
const mineraleTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: '#E8EDF0',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.8125rem',
    lineHeight: '1.65',
  },
  'token.property': { color: '#5A8FC0' },
  'token.string':   { color: '#A8C8A0' },
  'token.number':   { color: '#8C7BC4' },
  'token.boolean':  { color: '#4A9E6E' },
  'token.null':     { color: '#6B7880' },
  'token.punctuation': { color: '#6B7880' },
  'token.operator': { color: '#6B7880' },
}

const STATUS_META: Record<string, { color: string; bg: string; border: string; label: string }> = {
  '2': { color: '#4A9E6E', bg: 'rgba(74, 158, 110, 0.08)',  border: 'rgba(74, 158, 110, 0.2)',  label: 'OK' },
  '3': { color: '#5A8FC0', bg: 'rgba(90, 143, 192, 0.08)',  border: 'rgba(90, 143, 192, 0.2)',  label: 'REDIRECT' },
  '4': { color: '#B08840', bg: 'rgba(176, 136, 64, 0.08)',  border: 'rgba(176, 136, 64, 0.2)',  label: 'CLIENT ERR' },
  '5': { color: '#B06060', bg: 'rgba(176, 96, 96, 0.08)',   border: 'rgba(176, 96, 96, 0.2)',   label: 'SERVER ERR' },
}

function getStatusMeta(status: number) {
  return STATUS_META[String(Math.floor(status / 100))] ?? STATUS_META['5'];
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ResponseViewer() {
  const [isCopied, setIsCopied] = useState(false)
  const isLoading = useAppStore((state) => state.isLoading);
  const response = useAppStore((state) => state.response);
  const serverError = useAppStore((state) => state.serverError);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: '#3D8F82', opacity: 0.75 }}
          />
          <p
            className="text-[0.6875rem] tracking-[0.08em] uppercase"
            style={{ color: '#404950' }}
          >
            Sending request
          </p>
        </div>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center min-response-enter">
          <AlertCircle className="h-6 w-6" style={{ color: '#B06060', opacity: 0.75 }} />
          <p className="text-sm font-medium" style={{ color: '#B06060' }}>Request failed</p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: '#6B7880', fontFamily: '"JetBrains Mono", monospace' }}
          >
            {serverError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 select-none">
          <p
            className="text-[0.6875rem] tracking-[0.1em] uppercase"
            style={{ color: '#303840' }}
          >
            Awaiting response
          </p>
        </div>
      </div>
    );
  }

  const meta = getStatusMeta(response.status);
  const isSuccess = response.status >= 200 && response.status < 300;

  const handleCopy = async () => {
    if (!response.data) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div
      className="flex h-full flex-col transition-all duration-700"
      style={isSuccess ? {
        boxShadow: 'inset 0 0 80px 0 rgba(61, 143, 130, 0.05)',
      } : undefined}
    >
      {/* Status bar */}
      <div
        key={response.timestamp}
        className="min-response-enter flex items-center gap-4 border-b border-border px-6 py-3.5"
        style={{ backgroundColor: '#141618' }}
      >
        {/* Left accent line */}
        <div
          className="w-0.5 h-8 rounded-full self-center flex-shrink-0"
          style={{ backgroundColor: meta.color, opacity: 0.6 }}
        />

        {/* Status code */}
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-xl font-semibold tabular-nums"
              style={{ color: meta.color, fontFamily: '"JetBrains Mono", monospace' }}
            >
              {response.status}
            </span>
            <span
              className="text-xs font-mono tracking-wide"
              style={{ color: meta.color, opacity: 0.6 }}
            >
              {response.statusText}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border self-center flex-shrink-0" />

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs">
          <span>
            <span style={{ color: '#404950' }}>time </span>
            <span
              className="font-mono"
              style={{ color: '#E8EDF0', fontFamily: '"JetBrains Mono", monospace' }}
            >
              {response.time}ms
            </span>
          </span>
          <span>
            <span style={{ color: '#404950' }}>size </span>
            <span
              className="font-mono"
              style={{ color: '#E8EDF0', fontFamily: '"JetBrains Mono", monospace' }}
            >
              {formatBytes(response.size)}
            </span>
          </span>
        </div>
      </div>

      {/* Response body */}
      <div className="flex-1 overflow-auto p-5">
        <div
          key={`body-${response.timestamp}`}
          className="min-response-enter group relative rounded-sm border overflow-hidden"
          style={{ borderColor: '#252930', backgroundColor: '#141618' }}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: 'rgba(13, 15, 16, 0.85)' }}
            onClick={handleCopy}
            title="Copy"
          >
            {isCopied
              ? <Check className="h-3.5 w-3.5" style={{ color: '#4A9E6E' }} />
              : <Copy className="h-3.5 w-3.5" style={{ color: '#6B7880' }} />
            }
          </Button>

          <SyntaxHighlighter
            language="json"
            useInlineStyles={false}
            style={mineraleTheme}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.8125rem',
              lineHeight: '1.65',
              fontFamily: '"JetBrains Mono", monospace',
            }}
            wrapLongLines={true}
          >
            {JSON.stringify(response.data, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
