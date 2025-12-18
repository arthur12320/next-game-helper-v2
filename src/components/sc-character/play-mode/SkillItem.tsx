"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus } from "lucide-react"

interface SkillItemProps {
  skillId: string
  skill: string
  ability: string
  value: number
  mindchipBoost?: number
  tests?: { successes: number; failures: number }
  editMode: boolean
  isTrained: boolean
  onClick: () => void
  onSkillLevelChange: (delta: number, e: React.MouseEvent) => void
  onTestCountChange: (type: "successes" | "failures", delta: number, e: React.MouseEvent) => void
  onAbilityChange?: (skillId: string, newAbility: string, e: React.MouseEvent) => void
  onMindchipBoostChange?: (delta: number, e: React.MouseEvent) => void
  mindchipAvailable?: number
}

const abilityColors: Record<string, string> = {
  Will: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  Health: "bg-red-500/10 text-red-700 border-red-500/20",
  Resources: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  Circles: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  Mindchip: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
}

export function SkillItem({
  skillId,
  skill,
  ability,
  value,
  mindchipBoost = 0,
  tests,
  editMode,
  isTrained,
  onClick,
  onSkillLevelChange,
  onTestCountChange,
  onAbilityChange,
  onMindchipBoostChange,
  mindchipAvailable = 0,
}: SkillItemProps) {
  const bgClass = isTrained
    ? "bg-primary/10 hover:bg-primary/20 border-primary/20"
    : "bg-secondary/10 hover:bg-primary/600"

  


  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center p-3 rounded transition-colors cursor-pointer border ${bgClass}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium truncate ${!isTrained ? "text-muted-foreground" : ""}`}>{skill}</span>
          {editMode && onAbilityChange ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={ability}
                onValueChange={(newAbility) => {
                  const syntheticEvent = { stopPropagation: () => {} } as React.MouseEvent
                  onAbilityChange(skillId, newAbility, syntheticEvent)
                }}
              >
                <SelectTrigger className="h-6 w-24 text-xs">
                  <SelectValue />
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
          ) : (
            <Badge variant="outline" className={`text-xs ${abilityColors[ability] || ""}`}>
              {ability}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => onSkillLevelChange(-1, e)}
                title="Decrease skill level (resets tests)"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Badge variant={isTrained ? "default" : "secondary"} className="text-xs">
                {value}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => onSkillLevelChange(1, e)}
                title="Increase skill level (resets tests)"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge variant={isTrained ? "default" : "secondary"} className="text-xs">
              {value}
            </Badge>
          )}

          {mindchipBoost > 0 && !editMode && (
            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-700 border-cyan-500/20">
              +{mindchipBoost} 🧠
            </Badge>
          )}

          {editMode && onMindchipBoostChange && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => onMindchipBoostChange(-1, e)}
                disabled={mindchipBoost === 0}
                title="Remove Mindchip boost"
              >
                <Minus className="h-3 w-3 text-cyan-700" />
              </Button>
              <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-700 border-cyan-500/20">
                {mindchipBoost} 🧠
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => onMindchipBoostChange(1, e)}
                disabled={mindchipAvailable === 0}
                title="Add Mindchip boost"
              >
                <Plus className="h-3 w-3 text-cyan-700" />
              </Button>
            </div>
          )}

          
          {tests && (tests.successes > 0 || tests.failures > 0) && (
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                     variant="ghost"
                      className="h-4 w-4 p-0 "
                      onClick={(e) => onTestCountChange("successes", -1, e)}
                    >
                      <Minus className="h-3 w-3 text-green-700" />
                    </Button>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                      {tests.successes}S
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={(e) => onTestCountChange("successes", 1, e)}
                    >
                      <Plus className="h-3 w-3 text-green-700" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={(e) => onTestCountChange("failures", -1, e)}
                    >
                      <Minus className="h-3 w-3 text-red-700" />
                    </Button>
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                      {tests.failures}F
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={(e) => onTestCountChange("failures", 1, e)}
                    >
                      <Plus className="h-3 w-3 text-red-700" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                    {tests.successes}S
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                    {tests.failures}F
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
