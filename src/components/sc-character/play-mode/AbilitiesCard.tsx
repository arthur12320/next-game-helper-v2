"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"

interface AbilitiesCardProps {
  abilities: Record<string, number>
  abilityTests: Record<string, { successes: number; failures: number }>
  onAbilityChange: (ability: string, delta: number) => void
  onAbilityClick: (ability: string, value: number) => void
}

export function AbilitiesCard({ abilities, abilityTests, onAbilityChange, onAbilityClick }: AbilitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(abilities).map(([ability, value]) => {
          const tests = abilityTests[ability] || { successes: 0, failures: 0 }
          const hasTests = tests.successes > 0 || tests.failures > 0

          return (
            <div key={ability} className="flex items-center justify-between p-3 bg-secondary/50 rounded">
              <button
                onClick={() => onAbilityClick(ability, value)}
                className="font-semibold hover:text-primary transition-colors cursor-pointer text-left flex items-center gap-2"
              >
                {ability}
                {hasTests && (
                  <div className="flex gap-1">
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                      {tests.successes}S
                    </Badge>
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                      {tests.failures}F
                    </Badge>
                  </div>
                )}
              </button>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => onAbilityChange(ability, -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{value}</span>
                <Button size="icon" variant="outline" onClick={() => onAbilityChange(ability, 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
