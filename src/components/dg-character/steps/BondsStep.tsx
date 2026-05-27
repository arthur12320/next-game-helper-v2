"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DGCharacter } from "@/db/schema/dg-character"
import { Trash2, Plus } from "lucide-react"

interface BondsStepProps {
  data: Partial<DGCharacter>
  onUpdate: (updates: Partial<DGCharacter>) => void
  mosBonds?: number
}

export function BondsStep({ data, onUpdate, mosBonds = 3 }: BondsStepProps) {
  const [newBondName, setNewBondName] = useState("")
  const bonds = data.bonds || []
  const cha = data.stats?.CHA || 10

  const addBond = () => {
    if (!newBondName.trim()) return
    const newBond = {
      id: crypto.randomUUID(),
      name: newBondName.trim(),
      score: cha,
      broken: false,
    }
    onUpdate({ bonds: [...bonds, newBond] })
    setNewBondName("")
  }

  const removeBond = (id: string) => {
    onUpdate({ bonds: bonds.filter((b) => b.id !== id) })
  }

  const remaining = mosBonds - bonds.length

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Choose <strong>{mosBonds} non-Delta Green bond{mosBonds !== 1 ? "s" : ""}</strong> — vital people in your agent&apos;s life. Each bond starts
          with a score equal to your CHA ({cha}).
        </p>
        <p className="text-xs text-muted-foreground">
          Examples: &quot;My Wife&quot;, &quot;My Husband and Kids&quot;, &quot;The Platoon&quot;, &quot;My Ex-Partner in the LAPD&quot;
        </p>
      </div>

      <div className="space-y-3">
        {bonds.map((bond) => (
          <div key={bond.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">{bond.name}</p>
              <p className="text-sm text-muted-foreground">Score: {bond.score}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeBond(bond.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {remaining > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {remaining === mosBonds
              ? `Add ${mosBonds} bond${mosBonds !== 1 ? "s" : ""}`
              : `Add ${remaining} more bond${remaining !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bondName">Bond description</Label>
        <div className="flex gap-2">
          <Input
            id="bondName"
            value={newBondName}
            onChange={(e) => setNewBondName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBond()}
            placeholder='e.g. "My Wife", "The Platoon"'
          />
          <Button onClick={addBond} disabled={!newBondName.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
