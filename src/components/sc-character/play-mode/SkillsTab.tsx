"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Dices, Settings, Plus, Loader2 } from "lucide-react"
import { SkillItem } from "./SkillItem"
import { createSkill } from "@/app/actions/sc-skills"
import { toast } from "sonner"
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillAbility, setNewSkillAbility] = useState("")
  const [newSkillCategory, setNewSkillCategory] = useState("")
  const [isCreating, setIsCreating] = useState(false)

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

  const handleCreateSkill = async () => {
    if (!newSkillName.trim() || !newSkillAbility || !newSkillCategory) {
      toast.error("Error", { description: "Please fill in all fields" })
      return
    }

    setIsCreating(true)
    const result = await createSkill({
      name: newSkillName.trim(),
      ability: newSkillAbility,
      category: newSkillCategory,
    })

    if (result.success) {
      toast("Skill Created", { description: `${newSkillName} is now available to all users` })
      setNewSkillName("")
      setNewSkillAbility("")
      setNewSkillCategory("")
      setCreateDialogOpen(false)
      // Refresh the page to show the new skill
      window.location.reload()
    } else {
      toast.error("Error", { description: result.error || "Failed to create skill" })
    }
    setIsCreating(false)
  }

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
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  New Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Skill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Skill Name</label>
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Associated Ability</label>
                    <Select value={newSkillAbility} onValueChange={setNewSkillAbility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Will">Will</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Resources">Resources</SelectItem>
                        <SelectItem value="Circles">Circles</SelectItem>
                        <SelectItem value="Mindchip">Mindchip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crafting">Crafting</SelectItem>
                        <SelectItem value="Exploration">Exploration</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Lore">Lore</SelectItem>
                        <SelectItem value="Combat">Combat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateSkill} disabled={isCreating} className="w-full">
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Skill"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

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
