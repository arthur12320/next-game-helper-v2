"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

interface SkillItemProps {
  skill: string
  value: number
  tests?: { successes: number; failures: number }
  editMode: boolean
  isTrained: boolean
  onClick: () => void
  onSkillLevelChange: (delta: number, e: React.MouseEvent) => void
  onTestCountChange: (type: "successes" | "failures", delta: number, e: React.MouseEvent) => void
}

export function SkillItem({
  skill,
  value,
  tests,
  editMode,
  isTrained,
  onClick,
  onSkillLevelChange,
  onTestCountChange,
}: SkillItemProps) {
  const bgClass = isTrained
    ? "bg-primary/10 hover:bg-primary/20 border-primary/20"
    : "bg-secondary/50 hover:bg-secondary"

  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center p-3 rounded transition-colors cursor-pointer border ${bgClass}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium truncate ${!isTrained ? "text-muted-foreground" : ""}`}>{skill}</span>
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
        </div>
        {tests && (tests.successes > 0 || tests.failures > 0) && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0"
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
  )
}
