import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { IKeyValue } from "@proxymity/shared/src/types"

interface KeyValueTableProps {
  items: IKeyValue[]
  onAdd: () => void
  onUpdate: (id: string, field: keyof IKeyValue, value: string | boolean) => void;
  onDelete: (id: string) => void;
  placeholder?: string
}

export function KeyValueTable({ items, onAdd, onDelete, onUpdate, placeholder = "Key" }: KeyValueTableProps) {
  return (
    <div className="space-y-1.5">
      {/* Column labels */}
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-2 pb-1.5 border-b border-border/50">
        <div className="w-7" />
        <div
          className="text-[0.6875rem] tracking-[0.1em] uppercase"
          style={{ color: '#404950' }}
        >
          Key
        </div>
        <div
          className="text-[0.6875rem] tracking-[0.1em] uppercase"
          style={{ color: '#404950' }}
        >
          Value
        </div>
        <div className="w-7" />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center px-1 rounded-sm"
          style={{ opacity: item.isEnabled ? 1 : 0.38, transition: 'opacity 0.15s ease' }}
        >
          <Checkbox
            checked={item.isEnabled}
            onCheckedChange={(checked) => onUpdate(item.id, "isEnabled", checked === true)}
            className="w-4 h-4"
          />
          <Input
            type="text"
            placeholder={placeholder}
            value={item.key}
            onChange={(e) => onUpdate(item.id, "key", e.target.value)}
            className="text-xs h-7.5 border-0 border-b rounded-none px-1 focus-visible:ring-0 focus-visible:border-b-[var(--color-min-teal)]"
            style={{
              backgroundColor: 'transparent',
              borderBottomColor: '#252930',
              borderBottomWidth: '1px',
              color: '#5A8FC0',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
            }}
            disabled={!item.isEnabled}
          />
          <Input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => onUpdate(item.id, "value", e.target.value)}
            className="text-xs h-7.5 border-0 border-b rounded-none px-1 focus-visible:ring-0"
            style={{
              backgroundColor: 'transparent',
              borderBottomColor: '#252930',
              borderBottomWidth: '1px',
              color: '#E8EDF0',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
            }}
            disabled={!item.isEnabled}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="h-7 w-7 transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" style={{ color: '#404950' }} />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className="w-full gap-2 mt-4 text-xs transition-colors border border-dashed"
        style={{
          color: '#3D8F82',
          borderColor: 'rgba(61, 143, 130, 0.25)',
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Add {placeholder}
      </Button>
    </div>
  );
}
