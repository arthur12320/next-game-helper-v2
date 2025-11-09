"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/lib/character-context"
import { UPBRINGINGS } from "@/lib/character-data"
import { cn } from "@/lib/utils"
import { Users, ChevronRight, ChevronLeft } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function Step2Upbringing() {
  const { character, updateCharacter, setCurrentStep } = useCharacter()
  const [selectedUpbringing, setSelectedUpbringing] = useState(character.upbringing?.id || "")
  const [promptAnswer, setPromptAnswer] = useState(character.upbringing?.promptAnswer || "")
  const [npcRelationship, setNpcRelationship] = useState(character.upbringing?.npcRelationship || "")
  const [will, setWill] = useState(character.upbringing?.will || 4)
  const [health, setHealth] = useState(character.upbringing?.health || 4)

  const totalPoints = 8
  const usedPoints = will + health
  const remainingPoints = totalPoints - usedPoints

  const handleNext = () => {
    const upbringing = UPBRINGINGS.find((u) => u.id === selectedUpbringing)
    if (upbringing && usedPoints === totalPoints) {
      updateCharacter({
        upbringing: {
          id: upbringing.id,
          name: upbringing.name,
          promptAnswer,
          npcRelationship,
          will,
          health,
        },
      })
      setCurrentStep(3)
    }
  }

  const selectedUpbringingData = UPBRINGINGS.find((u) => u.id === selectedUpbringing)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(1)}>
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Choose Your Upbringing</h2>
        <p className="text-muted-foreground text-pretty">Who raised you? Who shaped you before your career began?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {UPBRINGINGS.map((upbringing) => (
          <Card
            key={upbringing.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedUpbringing === upbringing.id && "ring-2 ring-primary shadow-lg",
            )}
            onClick={() => setSelectedUpbringing(upbringing.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{upbringing.name}</CardTitle>
              </div>
              <CardDescription>{upbringing.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium mb-1">Benefits:</p>
                <p className="text-muted-foreground">+{upbringing.benefits.skills} Skill Points, +1 NPC Relationship</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedUpbringingData && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Define Your Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt-answer">Reflect on Your Past</Label>
              <p className="text-sm text-muted-foreground">{selectedUpbringingData.prompt}</p>
              <Textarea
                id="prompt-answer"
                placeholder="Share your character's story..."
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="npc-relationship">NPC Relationship</Label>
              <p className="text-sm text-muted-foreground">Name an ally, rival, or mentor from your upbringing</p>
              <Input
                id="npc-relationship"
                placeholder="e.g., Commander Soran, my former instructor..."
                value={npcRelationship}
                onChange={(e) => setNpcRelationship(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Distribute Ability Points ({remainingPoints} remaining)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Distribute 8 points between Will and Health. Neither stat may be lower than 2 or higher than 6.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="will-slider">Will</Label>
                    <span className="text-2xl font-mono font-bold text-primary">{will}</span>
                  </div>
                  <Slider
                    id="will-slider"
                    min={2}
                    max={6}
                    step={1}
                    value={[will]}
                    onValueChange={([value]) => {
                      const newWill = value
                      const newHealth = totalPoints - newWill
                      if (newHealth >= 2 && newHealth <= 6) {
                        setWill(newWill)
                        setHealth(newHealth)
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="health-slider">Health</Label>
                    <span className="text-2xl font-mono font-bold text-primary">{health}</span>
                  </div>
                  <Slider
                    id="health-slider"
                    min={2}
                    max={6}
                    step={1}
                    value={[health]}
                    onValueChange={([value]) => {
                      const newHealth = value
                      const newWill = totalPoints - newHealth
                      if (newWill >= 2 && newWill <= 6) {
                        setHealth(newHealth)
                        setWill(newWill)
                      }
                    }}
                  />
                </div>
              </div>

              {remainingPoints !== 0 && <p className="text-sm text-destructive">You must use all 8 points</p>}
            </div>

            <Button
              onClick={handleNext}
              disabled={!promptAnswer.trim() || !npcRelationship.trim() || remainingPoints !== 0}
              className="w-full sm:w-auto"
            >
              Continue to Lifepaths
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
