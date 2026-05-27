"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DGCharacter } from "@/db/schema/dg-character"
import type { DGMoS } from "@/db/schema/dg-mos"
import { DEFAULT_DG_SKILLS, TYPED_SKILL_CATEGORIES } from "@/lib/dg-data"
import { Plus, Minus } from "lucide-react"

const BONUS_SLOTS = 8

interface SkillsStepProps {
  onUpdate: (updates: Partial<DGCharacter>) => void
  bonusSelections: Record<string, number>
  onBonusChange: (selections: Record<string, number>) => void
  mosList: DGMoS[]
  selectedMoS: string
  typedSkills: Record<string, number>
  onAddTypedSkill: (name: string) => void
}

function applyBonusSelections(
  base: Record<string, number>,
  bonus: Record<string, number>
): Record<string, number> {
  const result = { ...base }
  for (const [skill, times] of Object.entries(bonus)) {
    if (times > 0 && result[skill] !== undefined) {
      result[skill] = Math.min(80, result[skill] + times * 20)
    }
  }
  return result
}

export function SkillsStep({
  onUpdate,
  bonusSelections,
  onBonusChange,
  mosList,
  selectedMoS,
  typedSkills,
  onAddTypedSkill,
}: SkillsStepProps) {
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [typeSuffix, setTypeSuffix] = useState("")

  const mosData = mosList.find((m) => m.name === selectedMoS)
  const mosSkills = mosData?.skills ?? {}

  // Base = defaults overridden by MoS professional values, plus player-added typed skills
  const baseSkills: Record<string, number> = { ...DEFAULT_DG_SKILLS, ...mosSkills, ...typedSkills }

  const slotsUsed = Object.values(bonusSelections).reduce((sum, v) => sum + v, 0)
  const slotsLeft = BONUS_SLOTS - slotsUsed

  const skillsWithBonus = applyBonusSelections(baseSkills, bonusSelections)

  const handleAdd = (skill: string) => {
    if (slotsLeft <= 0) return
    if (skill === "Unnatural") return
    const current = bonusSelections[skill] || 0
    const currentValue = skillsWithBonus[skill] ?? 0
    if (currentValue >= 80) return
    const newSelections = { ...bonusSelections, [skill]: current + 1 }
    onBonusChange(newSelections)
    onUpdate({ skills: applyBonusSelections(baseSkills, newSelections) })
  }

  const handleRemove = (skill: string) => {
    const current = bonusSelections[skill] || 0
    if (current <= 0) return
    const newSelections = { ...bonusSelections, [skill]: current - 1 }
    if (newSelections[skill] === 0) delete newSelections[skill]
    onBonusChange(newSelections)
    onUpdate({ skills: applyBonusSelections(baseSkills, newSelections) })
  }

  const handleAddTyped = () => {
    if (!pendingCategory || !typeSuffix.trim()) return
    const skillName = `${pendingCategory} (${typeSuffix.trim()})`
    onAddTypedSkill(skillName)
    // Update character skills immediately to include the new typed skill at 0
    onUpdate({ skills: applyBonusSelections({ ...baseSkills, [skillName]: 0 }, bonusSelections) })
    setPendingCategory(null)
    setTypeSuffix("")
  }

  const sortedSkills = Object.entries(baseSkills).sort(([a], [b]) => a.localeCompare(b))
  const mosProfessionalSkillNames = Object.keys(mosSkills)

  // Typed categories not yet added as specific instances in this session
  const availableCategories = TYPED_SKILL_CATEGORIES

  return (
    <div className="space-y-6">
      {mosProfessionalSkillNames.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">{selectedMoS || "MoS"} — Professional Skills</h3>
          <p className="text-sm text-muted-foreground mb-3">
            These replace the base values on your character sheet.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mosSkills)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([skill, pct]) => (
                <Badge key={skill} variant="secondary">
                  {skill} {pct}%
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Typed skill adder */}
      <div className="space-y-2">
        <h3 className="font-semibold">Add Typed Skill</h3>
        <p className="text-sm text-muted-foreground">
          Art, Craft, Foreign Language, Military Science, Pilot, and Science require a specific type.
        </p>
        {pendingCategory ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{pendingCategory} (</span>
            <Input
              value={typeSuffix}
              onChange={(e) => setTypeSuffix(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTyped()}
              placeholder={
                pendingCategory === "Art" ? "e.g. Photography" :
                pendingCategory === "Craft" ? "e.g. Carpentry" :
                pendingCategory === "Foreign Language" ? "e.g. Spanish" :
                pendingCategory === "Military Science" ? "e.g. Land" :
                pendingCategory === "Pilot" ? "e.g. Aircraft" :
                "e.g. Biology"
              }
              className="w-36 h-8 text-sm"
              autoFocus
            />
            <span className="text-sm font-medium">)</span>
            <Button size="sm" onClick={handleAddTyped} disabled={!typeSuffix.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setPendingCategory(null); setTypeSuffix("") }}>
              Cancel
            </Button>
          </div>
        ) : (
          <Select onValueChange={(v) => { setPendingCategory(v); setTypeSuffix("") }}>
            <SelectTrigger className="w-52 h-8 text-sm border-dashed">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Add typed skill…" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat} (…)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* Currently added typed skills preview */}
        {Object.keys(typedSkills).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Object.keys(typedSkills).map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s} (added)
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Bonus Skill Points</h3>
            <p className="text-sm text-muted-foreground">
              Pick 8 skills (+20 each, max 80%). Same skill can be chosen multiple times.
            </p>
          </div>
          <Badge variant={slotsLeft === 0 ? "default" : "outline"}>
            {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} left
          </Badge>
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {sortedSkills.map(([skill]) => {
            const bonus = bonusSelections[skill] || 0
            const currentPct = skillsWithBonus[skill] ?? 0
            const isUnnatural = skill === "Unnatural"
            const isCapped = currentPct >= 80
            const isMoS = mosProfessionalSkillNames.includes(skill)
            const isTyped = skill in typedSkills

            return (
              <div
                key={skill}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{skill}</span>
                  {isMoS && (
                    <Badge variant="outline" className="text-xs h-4 px-1">MoS</Badge>
                  )}
                  {isTyped && !isMoS && (
                    <Badge variant="outline" className="text-xs h-4 px-1 border-dashed">typed</Badge>
                  )}
                  {isCapped && !isUnnatural && (
                    <Badge variant="secondary" className="text-xs h-4 px-1">max</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm w-10 text-right font-mono ${bonus > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {currentPct}%
                  </span>
                  {!isUnnatural && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleRemove(skill)}
                        disabled={bonus === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      {bonus > 0 && (
                        <span className="text-xs text-primary font-medium w-3 text-center">{bonus}</span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleAdd(skill)}
                        disabled={slotsLeft <= 0 || isCapped}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
