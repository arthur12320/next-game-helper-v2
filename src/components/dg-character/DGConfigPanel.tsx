"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DGMoSEditor } from "./DGMoSEditor"
import { createDGMoS, updateDGMoS, deleteDGMoS } from "@/app/actions/dg-config"
import type { DGMoS } from "@/db/schema/dg-mos"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DGConfigPanelProps {
  mosList: DGMoS[]
}

export function DGConfigPanel({ mosList: initial }: DGConfigPanelProps) {
  const [mosList, setMosList] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [, startTransition] = useTransition()

  const handleCreate = async (name: string, bonds: number, skills: Record<string, number>) => {
    const result = await createDGMoS(name, bonds, skills)
    if (result.success) {
      toast.success(`MoS "${name}" created`)
      setAddingNew(false)
      startTransition(() => {
        // optimistic update: reload via revalidatePath will fire on next nav;
        // for instant feedback, append locally
        setMosList((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name,
            bonds,
            skills,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
      })
    } else {
      toast.error(result.error ?? "Failed to create MoS")
    }
  }

  const handleUpdate = async (id: string, name: string, bonds: number, skills: Record<string, number>) => {
    const result = await updateDGMoS(id, name, bonds, skills)
    if (result.success) {
      toast.success(`MoS "${name}" updated`)
      setEditingId(null)
      setMosList((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, name, bonds, skills, updatedAt: new Date() } : m
        )
      )
    } else {
      toast.error(result.error ?? "Failed to update MoS")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete MoS "${name}"? Existing characters using this MoS are unaffected.`)) return
    const result = await deleteDGMoS(id)
    if (result.success) {
      toast.success(`MoS "${name}" deleted`)
      setMosList((prev) => prev.filter((m) => m.id !== id))
    } else {
      toast.error(result.error ?? "Failed to delete MoS")
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold">Military Occupational Specialties</h2>
            <p className="text-sm text-muted-foreground">
              Each MoS defines professional skills and bond count for new agents.
              Rule: 10 skills, 400 pts at 3 bonds (±50 pts per ±1 bond, range 1–4).
              No skill above 60%.
            </p>
          </div>
          {!addingNew && (
            <Button size="sm" onClick={() => { setAddingNew(true); setEditingId(null) }}>
              <Plus className="h-4 w-4 mr-1" />
              Add MoS
            </Button>
          )}
        </div>
      </div>

      {/* Add form */}
      {addingNew && (
        <DGMoSEditor
          onSave={handleCreate}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {/* MoS list */}
      <div className="space-y-2">
        {mosList.map((mos) => (
          <div key={mos.id}>
            {editingId === mos.id ? (
              <DGMoSEditor
                initial={mos}
                onSave={(name, bonds, skills) => handleUpdate(mos.id, name, bonds, skills)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{mos.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {Object.keys(mos.skills).length} skills · {mos.bonds} bond{mos.bonds !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-w-sm">
                  {Object.entries(mos.skills)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(0, 5)
                    .map(([skill, pct]) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill} {pct}%
                      </Badge>
                    ))}
                  {Object.keys(mos.skills).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.keys(mos.skills).length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => { setEditingId(mos.id); setAddingNew(false) }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(mos.id, mos.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {mosList.length === 0 && !addingNew && (
          <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
            No MoS configured. Add one to enable agent creation.
          </div>
        )}
      </div>
    </div>
  )
}
