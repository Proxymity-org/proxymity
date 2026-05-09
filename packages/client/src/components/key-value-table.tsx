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
  disabled?: boolean
}

export function KeyValueTable({ items, onAdd, onDelete, onUpdate, placeholder = "Key", disabled = false }: KeyValueTableProps) {
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-2">
        <div className="w-8"></div>
        <div>KEY</div>
        <div>VALUE</div>
        <div className="w-8"></div>
      </div>

      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
          <Checkbox
            checked={item.isEnabled}
            onCheckedChange={(checked) => onUpdate(item.id, "isEnabled", checked === true)}
            disabled={disabled}
          />
          <Input
            type="text"
            placeholder={placeholder}
            value={item.key}
            onChange={(e) => onUpdate(item.id, "key", e.target.value)}
            className="font-mono text-sm"
            disabled={disabled || !item.isEnabled}
          />
          <Input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => onUpdate(item.id, "value", e.target.value)}
            className="font-mono text-sm"
            disabled={disabled || !item.isEnabled}
          />
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8" disabled={disabled}>
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={onAdd} className="w-full gap-2 mt-4 bg-transparent" disabled={disabled}>
        <Plus className="h-4 w-4" />
        Add {placeholder}
      </Button>
    </div>
  )
}