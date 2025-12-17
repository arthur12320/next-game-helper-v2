"use client"

import type React from "react"

import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Package, Plus, Pencil, Trash2, Check, X } from "lucide-react"

interface InventoryTabProps {
  inventory: string[]
  newItemName: string
  editingItemIndex: number | null
  editingItemName: string
  onNewItemNameChange: (value: string) => void
  onEditingItemNameChange: (value: string) => void
  onAddItem: () => void
  onEditItem: (index: number, currentName: string) => void
  onSaveEdit: (index: number) => void
  onCancelEdit: () => void
  onDeleteItem: (index: number) => void
}

export function InventoryTab({
  inventory,
  newItemName,
  editingItemIndex,
  editingItemName,
  onNewItemNameChange,
  onEditingItemNameChange,
  onAddItem,
  onEditItem,
  onSaveEdit,
  onCancelEdit,
  onDeleteItem,
}: InventoryTabProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter") {
        action()
      } else if (e.key === "Escape" && editingItemIndex !== null) {
        onCancelEdit()
      }
    },
    [editingItemIndex, onCancelEdit],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new item..."
              value={newItemName}
              onChange={(e) => onNewItemNameChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, onAddItem)}
            />
            <Button onClick={onAddItem} size="icon" disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items in inventory</p>
          ) : (
            <div className="space-y-2">
              {inventory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-secondary/50 rounded border hover:bg-secondary transition-colors"
                >
                  {editingItemIndex === index ? (
                    <>
                      <Input
                        value={editingItemName}
                        onChange={(e) => onEditingItemNameChange(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, () => onSaveEdit(index))}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={() => onSaveEdit(index)}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={onCancelEdit}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{item}</span>
                      <Button size="icon" variant="ghost" onClick={() => onEditItem(index, item)} title="Edit item">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteItem(index)} title="Delete item">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
