/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dices, Settings } from "lucide-react"
import { SkillItem } from "./SkillItem"

interface SkillsTabProps {
  skills: Record<string, number>
  skillTests: Record<string, { successes: number; failures: number }> | undefined
  editMode: boolean
  onEditModeToggle: () => void
  onSkillClick: (skillName: string, skillValue: number) => void
  onSkillLevelChange: (skill: string, delta: number, e: React.MouseEvent) => void
  onTestCountChange: (skill: string, type: "successes" | "failures", delta: number, e: React.MouseEvent) => void
}

export function SkillsTab({
  skills,
  skillTests,
  editMode,
  onEditModeToggle,
  onSkillClick,
  onSkillLevelChange,
  onTestCountChange,
}: SkillsTabProps) {
  const trainedSkills = Object.entries(skills)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)

  const untrainedSkills = Object.entries(skills)
    .filter(([_, value]) => value === 0)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Skills</h3>
          </div>
          <Button variant={editMode ? "default" : "outline"} size="sm" onClick={onEditModeToggle} className="gap-2">
            <Settings className="h-4 w-4" />
            {editMode ? "Done Editing" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trainedSkills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Trained Skills</h4>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {trainedSkills.map(([skill, value]) => (
                  <SkillItem
                    key={skill}
                    skill={skill}
                    value={value}
                    tests={skillTests?.[skill]}
                    editMode={editMode}
                    isTrained={true}
                    onClick={() => onSkillClick(skill, value)}
                    onSkillLevelChange={(delta, e) => onSkillLevelChange(skill, delta, e)}
                    onTestCountChange={(type, delta, e) => onTestCountChange(skill, type, delta, e)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">All Skills (Untrained)</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {untrainedSkills.map(([skill, value]) => (
                <SkillItem
                  key={skill}
                  skill={skill}
                  value={value}
                  tests={skillTests?.[skill]}
                  editMode={editMode}
                  isTrained={false}
                  onClick={() => onSkillClick(skill, value)}
                  onSkillLevelChange={(delta, e) => onSkillLevelChange(skill, delta, e)}
                  onTestCountChange={(type, delta, e) => onTestCountChange(skill, type, delta, e)}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
