"use client"
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
    defaultValue: 3,
  },
  {
    key: "Health" as const,
    label: "Health",
    description: "Physical wellbeing and stamina",
    defaultValue: 5,
  },
  {
    key: "Resources" as const,
    label: "Resources",
    description: "Material wealth and equipment access",
    defaultValue: 1,
  },
  {
    key: "Circles" as const,
    label: "Circles",
    description: "Social connections and contacts",
    defaultValue: 1,
  },
  {
    key: "Mindchip" as const,
    label: "Mindchip",
    description: "Neural enhancement and data processing",
    defaultValue: 1,
  },
]

export function AbilitiesStep({ data, onUpdate }: AbilitiesStepProps) {
  const abilities = data.abilities || {
    Will: 3,
    Health: 5,
    Resources: 1,
    Circles: 1,
    Mindchip: 1,
  }

  const handleAbilityChange = (ability: keyof typeof abilities, value: string) => {
    const numValue = Number.parseInt(value) || 0
    onUpdate({
      abilities: {
        ...abilities,
        [ability]: numValue,
      },
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set your agent's core abilities. These represent fundamental capabilities.
      </p>

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
                min="0"
                max="10"
                value={abilities[ability.key]}
                onChange={(e) => handleAbilityChange(ability.key, e.target.value)}
                className="w-20 text-center text-lg font-semibold"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
