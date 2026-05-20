"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DGCharacter } from "@/db/schema/dg-character"
import { DEFAULT_DG_SKILLS } from "@/lib/dg-data"
import { Plus, Minus } from "lucide-react"

const MOS_PROFESSIONAL_SKILLS: Record<string, number> = {
  Alertness: 60,
  Athletics: 60,
  Search: 60,
  Firearms: 60,
  "Heavy Weapons": 50,
  "Melee Weapons": 40,
  "Military Science (Land)": 60,
  Navigate: 50,
  Stealth: 60,
  Survival: 60,
  Swim: 50,
  "Unarmed Combat": 50,
}

const BONUS_SLOTS = 8

interface SkillsStepProps {
  onUpdate: (updates: Partial<DGCharacter>) => void
  bonusSelections: Record<string, number>
  onBonusChange: (selections: Record<string, number>) => void
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

export function SkillsStep({ onUpdate, bonusSelections, onBonusChange }: SkillsStepProps) {
  const baseSkills = DEFAULT_DG_SKILLS
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

  const sortedSkills = Object.entries(baseSkills).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Sniper MoS — Professional Skills</h3>
        <p className="text-sm text-muted-foreground mb-3">
          These replace the base values on your character sheet.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MOS_PROFESSIONAL_SKILLS).map(([skill, pct]) => (
            <Badge key={skill} variant="secondary">
              {skill} {pct}%
            </Badge>
          ))}
        </div>
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

            return (
              <div
                key={skill}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{skill}</span>
                  {skill in MOS_PROFESSIONAL_SKILLS && (
                    <Badge variant="outline" className="text-xs h-4 px-1">MoS</Badge>
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
