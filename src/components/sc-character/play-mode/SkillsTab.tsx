"use client"

import type React from "react"
import {  useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dices, Settings, Loader2 } from "lucide-react"
import { SkillItem } from "./SkillItem"
import { Badge } from "@/components/ui/badge"
import { SCSkill } from "@/db/schema/sc-skills"

interface SkillsTabProps {
  allSkills: SCSkill[]
  characterSkills: Record<string, number>
  mindchipBoosts: Record<string, number>
  skillTests: Record<string, { successes: number; failures: number }> | undefined
  editMode: boolean
  skillsLoading: boolean
  mindchipLevel: number
  onEditModeToggle: () => void
  onSkillClick: (skillName: string, skillValue: number) => void
  onSkillLevelChange: (skill: string, delta: number, e: React.MouseEvent) => void
  onTestCountChange: (skill: string, type: "successes" | "failures", delta: number, e: React.MouseEvent) => void
  onAbilityChange: (skillId: string, newAbility: string, e: React.MouseEvent) => void
  onMindchipBoostChange: (skillName: string, delta: number, e: React.MouseEvent) => void
}

export function SkillsTab({
  allSkills,
  characterSkills,
  mindchipBoosts,
  skillTests,
  editMode,
  skillsLoading,
  mindchipLevel,
  onEditModeToggle,
  onSkillClick,
  onSkillLevelChange,
  onTestCountChange,
  onAbilityChange,
  onMindchipBoostChange,
}: SkillsTabProps) {


  const totalBoostsUsed = Object.values(mindchipBoosts).reduce((sum, val) => sum + val, 0)
  const mindchipAvailable = mindchipLevel - totalBoostsUsed
  const mergedSkills = useMemo(() => {
    return allSkills.map((skill) => ({
      ...skill,
      level: characterSkills[skill.name] || 0,
      mindchipBoost: mindchipBoosts[skill.name] || 0,
      tests: skillTests?.[skill.name] || { successes: 0, failures: 0 },
    }))
  }, [allSkills, characterSkills, mindchipBoosts, skillTests])

  const trainedSkills = mergedSkills.filter((skill) => skill.level > 0).sort((a, b) => b.level - a.level)

  const untrainedSkills = mergedSkills.filter((skill) => skill.level === 0).sort((a, b) => a.name.localeCompare(b.name))

  const skillsByCategory = useMemo(() => {
    const categories: Record<string, typeof untrainedSkills> = {}
    untrainedSkills.forEach((skill) => {
      if (!categories[skill.category]) {
        categories[skill.category] = []
      }
      categories[skill.category].push(skill)
    })
    return categories
  }, [untrainedSkills])



  if (skillsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Skills</h3>
            {editMode && (
              <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-700 border-cyan-500/20">
                🧠 {mindchipAvailable}/{mindchipLevel} available
              </Badge>
            )}

            {mindchipAvailable < 0 && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-500/20">
                🧠 negative mindchip available edit to fix it
              </Badge>
            )}
          </div>
          <div className="flex gap-2">

            <Button variant={editMode ? "default" : "outline"} size="sm" onClick={onEditModeToggle} className="gap-2">
              <Settings className="h-4 w-4" />
              {editMode ? "Done Editing" : "Edit"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trainedSkills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Trained Skills</h4>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {trainedSkills.map((skill) => (
                  <SkillItem
                    key={skill.id}
                    skillId={skill.id}
                    skill={skill.name}
                    ability={skill.ability}
                    value={skill.level}
                    mindchipBoost={skill.mindchipBoost}
                    tests={skill.tests}
                    editMode={editMode}
                    isTrained={true}
                    onClick={() => {

                      console.log("got here")
                      console.log("skill click", skill.name, skill.level)
                      onSkillClick(skill.name, skill.level )
                    }}
                    onSkillLevelChange={(delta, e) => onSkillLevelChange(skill.name, delta, e)}
                    onTestCountChange={(type, delta, e) => onTestCountChange(skill.name, type, delta, e)}
                    onAbilityChange={onAbilityChange}
                    onMindchipBoostChange={(delta, e) => onMindchipBoostChange(skill.name, delta, e)}
                    mindchipAvailable={mindchipAvailable}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">All Skills (Untrained)</h4>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} className="mb-4">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">{category}</h5>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => (
                    <SkillItem
                      key={skill.id}
                      skillId={skill.id}
                      skill={skill.name}
                      ability={skill.ability}
                      value={skill.level}
                      mindchipBoost={skill.mindchipBoost}
                      tests={skill.tests}
                      editMode={editMode}
                      isTrained={false}
                      onClick={() => onSkillClick(skill.name, skill.level )}
                      onSkillLevelChange={(delta, e) => onSkillLevelChange(skill.name, delta, e)}
                      onTestCountChange={(type, delta, e) => onTestCountChange(skill.name, type, delta, e)}
                      onAbilityChange={onAbilityChange}
                      onMindchipBoostChange={(delta, e) => onMindchipBoostChange(skill.name, delta, e)}
                      mindchipAvailable={mindchipAvailable}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
