"use client"

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DGCharacter } from "@/db/schema/dg-character"
import { calcDerived } from "@/lib/dg-data"
import { cn } from "@/lib/utils"

const TOTAL_POINTS = 72
const MIN_STAT = 3
const MAX_STAT = 99

const STATS = [
  { key: "STR", label: "Strength", description: "Physical power, size, and musculature" },
  { key: "CON", label: "Constitution", description: "Health and physical resilience" },
  { key: "DEX", label: "Dexterity", description: "Agility, coordination, and nimbleness" },
  { key: "INT", label: "Intelligence", description: "How well an Agent notices and connects things" },
  { key: "POW", label: "Power", description: "Force of personality and psychic resilience" },
  { key: "CHA", label: "Charisma", description: "Charm, leadership, and personal appeal" },
] as const

type StatKey = "STR" | "CON" | "DEX" | "INT" | "POW" | "CHA"

function isStatInvalid(v: number) {
  return isNaN(v) || v < MIN_STAT || v > MAX_STAT
}

interface StatsStepProps {
  data: Partial<DGCharacter>
  onUpdate: (updates: Partial<DGCharacter>) => void
  onValidityChange?: (valid: boolean) => void
}

export function StatsStep({ data, onUpdate, onValidityChange }: StatsStepProps) {
  const stats = data.stats || { STR: 10, CON: 10, DEX: 10, INT: 10, POW: 10, CHA: 12 }
  const totalUsed = Object.values(stats).reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0)
  const remaining = TOTAL_POINTS - totalUsed
  const derived = calcDerived({
    STR: stats.STR || 0,
    CON: stats.CON || 0,
    POW: stats.POW || 0,
  })

  const hasErrors = STATS.some(({ key }) => isStatInvalid(stats[key]))
  const isPointsInvalid = remaining !== 0

  useEffect(() => {
    onValidityChange?.(!hasErrors && !isPointsInvalid)
  }, [hasErrors, isPointsInvalid, onValidityChange])

  const handleStatChange = (key: StatKey, value: string) => {
    const num = parseInt(value, 10)
    onUpdate({ stats: { ...stats, [key]: isNaN(num) ? (0 as unknown as number) : num } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Distribute <strong>72 points</strong> between the six statistics. Minimum 3 per stat, maximum 99.
        </p>
        <Badge variant={remaining === 0 ? "default" : remaining < 0 ? "destructive" : "secondary"}>
          {remaining === 0 ? "Points distributed" : remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATS.map(({ key, label, description }) => {
          const val = stats[key]
          const invalid = isStatInvalid(val)
          return (
            <div key={key} className="space-y-1">
              <Label htmlFor={key}>
                {label} <span className="text-muted-foreground font-normal">({key})</span>
              </Label>
              <p className="text-xs text-muted-foreground">{description}</p>
              <div className="flex items-center gap-3">
                <Input
                  id={key}
                  type="number"
                  value={isNaN(val) ? "" : val}
                  onChange={(e) => handleStatChange(key, e.target.value)}
                  className={cn("w-24", invalid && "border-destructive focus-visible:ring-destructive")}
                />
                <span className="text-sm text-muted-foreground">
                  ×5 = {isNaN(val) ? "—" : `${val * 5}%`}
                </span>
              </div>
              {invalid && (
                <p className="text-xs text-destructive">Min {MIN_STAT} · Max {MAX_STAT}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="border rounded-lg p-4 bg-muted/30">
        <p className="text-sm font-medium mb-3">Derived Attributes (calculated automatically)</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-background rounded p-2">
            <div className="text-xl font-bold">{derived.HP}</div>
            <div className="text-xs text-muted-foreground">HP</div>
            <div className="text-xs text-muted-foreground">ceil((STR+CON)/2)</div>
          </div>
          <div className="bg-background rounded p-2">
            <div className="text-xl font-bold">{derived.WP}</div>
            <div className="text-xs text-muted-foreground">WP</div>
            <div className="text-xs text-muted-foreground">= POW</div>
          </div>
          <div className="bg-background rounded p-2">
            <div className="text-xl font-bold">{derived.SAN}</div>
            <div className="text-xs text-muted-foreground">SAN</div>
            <div className="text-xs text-muted-foreground">POW × 5</div>
          </div>
          <div className="bg-background rounded p-2">
            <div className="text-xl font-bold">{derived.BP}</div>
            <div className="text-xs text-muted-foreground">BP</div>
            <div className="text-xs text-muted-foreground">SAN − POW</div>
          </div>
        </div>
      </div>
    </div>
  )
}
