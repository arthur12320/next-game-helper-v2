"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { SCCharacter } from "@/db/schema/sc-character"

interface AbilitiesStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

const ABILITIES = [
  {
    key: "Will" as const,
    label: "Will",
    description: "Mental fortitude and determination",
  },
  {
    key: "Health" as const,
    label: "Health",
    description: "Physical wellbeing and stamina",
  },
]

const FIXED_ABILITIES = [
  {
    key: "Resources" as const,
    label: "Resources",
    description: "Material wealth and equipment access",
    value: 1,
  },
  {
    key: "Circles" as const,
    label: "Circles",
    description: "Social connections and contacts",
    value: 2, // From Homeworld
  },
  {
    key: "Mindchip" as const,
    label: "Mindchip",
    description: "Neural enhancement and data processing",
    value: 1,
  },
]

const TOTAL_POINTS = 6
const MIN_SCORE = 2
const MAX_SCORE = 6

export function AbilitiesStep({ data, onUpdate }: AbilitiesStepProps) {
  const abilities = data.abilities || {
    Will: 1,
    Health: 1,
    Resources: 1,
    Circles: 2,
    Mindchip: 1,
  }

  // Set Circles to 2 when component mounts, as it comes from homeworld
  useEffect(() => {
    if (abilities.Circles !== 2) {
      onUpdate({ abilities: { ...abilities, Circles: 2 } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAbilityChange = (ability: "Will" | "Health", value: string) => {
    const numValue = Number.parseInt(value) || 0
    const otherAbility = ability === "Will" ? "Health" : "Will"
    const otherValue = abilities[otherAbility]

    if (numValue < MIN_SCORE || numValue > MAX_SCORE) return

    if (numValue + otherValue > TOTAL_POINTS + MIN_SCORE + MIN_SCORE) {
      // If we are over the total, we can't increase
      if (numValue > abilities[ability]) return
    }

    onUpdate({
      abilities: {
        ...abilities,
        [ability]: numValue,
      },
    })
  }

  const pointsSpent = abilities.Will + abilities.Health
  const pointsRemaining = TOTAL_POINTS + MIN_SCORE + MIN_SCORE - pointsSpent

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Distribute 8 points between Will and Health. Both must be between 2 and 6.
      </p>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Points Remaining</h4>
            <div className="text-2xl font-bold">{pointsRemaining}</div>
          </div>
        </CardContent>
      </Card>

      {ABILITIES.map((ability) => (
        <Card key={ability.key}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor={ability.key} className="text-base font-semibold">
                  {ability.label}
                </Label>
                <CardDescription className="mt-1">{ability.description}</CardDescription>
              </div>
              <Input
                id={ability.key}
                type="number"
                min={MIN_SCORE}
                max={MAX_SCORE}
                value={abilities[ability.key]}
                onChange={(e) => handleAbilityChange(ability.key, e.target.value)}
                className="w-20 text-center text-lg font-semibold"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {FIXED_ABILITIES.map((ability) => (
        <Card key={ability.key}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold">{ability.label}</Label>
                <CardDescription className="mt-1">{ability.description}</CardDescription>
              </div>
              <div className="w-20 text-center text-lg font-semibold">{ability.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
