"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DGCharacter } from "@/db/schema/dg-character"
import { Trash2, Plus } from "lucide-react"

interface MotivationsStepProps {
  data: Partial<DGCharacter>
  onUpdate: (updates: Partial<DGCharacter>) => void
}

export function MotivationsStep({ data, onUpdate }: MotivationsStepProps) {
  const [newMotivation, setNewMotivation] = useState("")
  const motivations = data.motivations || []

  const add = () => {
    if (!newMotivation.trim() || motivations.length >= 5) return
    onUpdate({ motivations: [...motivations, newMotivation.trim()] })
    setNewMotivation("")
  }

  const remove = (index: number) => {
    onUpdate({ motivations: motivations.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Up to <strong>5 personal motivations</strong> that drive your agent — not Bonds, but things that keep you
          going. Faith, patriotism, hobbies, the love of a pet.
        </p>
        <p className="text-xs text-muted-foreground">
          This section is optional at creation. You can add motivations later during play.
          Each time your Agent hits the Breaking Point, remove one.
        </p>
      </div>

      <div className="space-y-2">
        {motivations.map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <p className="flex-1 text-sm">{m}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {motivations.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No motivations added yet.</p>
        )}
      </div>

      {motivations.length < 5 && (
        <div className="space-y-2">
          <Label htmlFor="motivation">Add a motivation</Label>
          <div className="flex gap-2">
            <Input
              id="motivation"
              value={newMotivation}
              onChange={(e) => setNewMotivation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="e.g. Faith in God, Love of country..."
            />
            <Button onClick={add} disabled={!newMotivation.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {motivations.length}/5 motivations
      </p>
    </div>
  )
}
