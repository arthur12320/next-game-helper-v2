"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_DG_SKILLS, TYPED_SKILL_CATEGORIES } from "@/lib/dg-data"
import type { DGMoS } from "@/db/schema/dg-mos"
import { Plus, Trash2 } from "lucide-react"

const ALL_BASE_SKILLS = Object.keys(DEFAULT_DG_SKILLS).sort()

function calcBudget(bonds: number) {
  return 400 + (3 - bonds) * 50
}

function calcPointsUsed(skills: Record<string, number>): number {
  return Object.entries(skills).reduce((sum, [skill, finalVal]) => {
    const base = DEFAULT_DG_SKILLS[skill] ?? 0
    return sum + Math.max(0, finalVal - base)
  }, 0)
}

function isSkillInvalid(skill: string, finalVal: number): { over60: boolean; tooLow: boolean } {
  const base = DEFAULT_DG_SKILLS[skill] ?? 0
  return {
    over60: finalVal > 60,
    tooLow: finalVal < 0 || finalVal < base,
  }
}

interface DGMoSEditorProps {
  initial?: DGMoS
  onSave: (name: string, bonds: number, skills: Record<string, number>) => Promise<void>
  onCancel: () => void
}

export function DGMoSEditor({ initial, onSave, onCancel }: DGMoSEditorProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [bonds, setBonds] = useState(initial?.bonds ?? 3)
  const [skills, setSkills] = useState<Record<string, number>>(initial?.skills ?? {})
  const [saving, setSaving] = useState(false)

  // Typed skill pending state
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [typeSuffix, setTypeSuffix] = useState("")

  const budget = calcBudget(bonds)
  const pointsUsed = calcPointsUsed(skills)
  const overBudget = pointsUsed > budget
  const skillCount = Object.keys(skills).length

  // Check validity of all skill values
  const skillErrors = Object.entries(skills).reduce<Record<string, { over60: boolean; tooLow: boolean }>>(
    (acc, [skill, val]) => {
      const err = isSkillInvalid(skill, val)
      if (err.over60 || err.tooLow) acc[skill] = err
      return acc
    },
    {}
  )
  const hasSkillErrors = Object.keys(skillErrors).length > 0

  // Skills not yet assigned (regular non-typed)
  const availableBaseSkills = ALL_BASE_SKILLS.filter((s) => !(s in skills))

  const addSkill = (skill: string) => {
    const base = DEFAULT_DG_SKILLS[skill] ?? 0
    setSkills((prev) => ({ ...prev, [skill]: base }))
  }

  const addTypedSkill = () => {
    if (!pendingCategory || !typeSuffix.trim()) return
    const skillName = `${pendingCategory} (${typeSuffix.trim()})`
    setSkills((prev) => ({ ...prev, [skillName]: 0 }))
    setPendingCategory(null)
    setTypeSuffix("")
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => {
      const next = { ...prev }
      delete next[skill]
      return next
    })
  }

  const setSkillValue = (skill: string, val: number) => {
    setSkills((prev) => ({ ...prev, [skill]: val }))
  }

  const canSave =
    name.trim().length > 0 &&
    skillCount > 0 &&
    !overBudget &&
    !hasSkillErrors

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(name.trim(), bonds, skills)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectSkill = (value: string) => {
    if (value.startsWith("__typed__")) {
      const cat = value.replace("__typed__", "")
      setPendingCategory(cat)
      setTypeSuffix("")
    } else {
      addSkill(value)
    }
  }

  return (
    <div className="space-y-5 border rounded-lg p-4 bg-muted/20">
      {/* Name */}
      <div className="space-y-1.5">
        <Label>MoS Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Medic, Engineer, Analyst"
          className="max-w-xs"
        />
      </div>

      {/* Bonds */}
      <div className="space-y-1.5">
        <Label>Bonds</Label>
        <div className="flex items-center gap-3">
          <Select
            value={String(bonds)}
            onValueChange={(v) => setBonds(Number(v))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Budget: <span className="font-medium text-foreground">{budget} pts</span>
            {" "}(400 + (3 − {bonds}) × 50)
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Professional Skills</Label>
          <div className="flex items-center gap-2">
            {skillCount !== 10 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {skillCount} / 10 skills
              </span>
            )}
            <Badge variant={overBudget ? "destructive" : pointsUsed === budget ? "default" : "outline"}>
              {pointsUsed} / {budget} pts
            </Badge>
          </div>
        </div>

        {/* Assigned skills */}
        <div className="space-y-1.5">
          {Object.entries(skills)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([skill, finalVal]) => {
              const base = DEFAULT_DG_SKILLS[skill] ?? 0
              const added = Math.max(0, finalVal - base)
              const err = skillErrors[skill]
              return (
                <div key={skill} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-52 truncate">{skill}</span>
                    <span className="text-xs text-muted-foreground w-16">base {base}%</span>
                    <Input
                      type="number"
                      value={isNaN(finalVal) ? "" : finalVal}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        setSkillValue(skill, isNaN(v) ? 0 : v)
                      }}
                      className={`h-7 w-20 text-sm ${err ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    <span className="text-xs text-muted-foreground w-16">+{added} pts</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {err?.over60 && (
                    <p className="text-xs text-destructive ml-[268px]">Max 60%</p>
                  )}
                  {err?.tooLow && (
                    <p className="text-xs text-destructive ml-[268px]">Below base ({base}%)</p>
                  )}
                </div>
              )
            })}
        </div>

        {/* Typed skill pending form */}
        {pendingCategory && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-sm font-medium">{pendingCategory} (</span>
            <Input
              value={typeSuffix}
              onChange={(e) => setTypeSuffix(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTypedSkill()}
              placeholder={
                pendingCategory === "Art" ? "e.g. Photography" :
                pendingCategory === "Craft" ? "e.g. Carpentry" :
                pendingCategory === "Foreign Language" ? "e.g. Spanish" :
                pendingCategory === "Military Science" ? "e.g. Land" :
                pendingCategory === "Pilot" ? "e.g. Aircraft" :
                "e.g. Biology"
              }
              className="w-32 h-7 text-sm"
              autoFocus
            />
            <span className="text-sm font-medium">)</span>
            <Button size="sm" onClick={addTypedSkill} disabled={!typeSuffix.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPendingCategory(null)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Add skill dropdown */}
        {!pendingCategory && (
          <Select onValueChange={handleSelectSkill}>
            <SelectTrigger className="w-56 h-8 text-sm border-dashed">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Add skill…" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Skills</SelectLabel>
                {availableBaseSkills.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} ({DEFAULT_DG_SKILLS[s] ?? 0}%)
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Typed Skills</SelectLabel>
                {TYPED_SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={`__typed__${cat}`}>
                    {cat} (…)
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={!canSave || saving} size="sm">
          {saving ? "Saving…" : "Save MoS"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
