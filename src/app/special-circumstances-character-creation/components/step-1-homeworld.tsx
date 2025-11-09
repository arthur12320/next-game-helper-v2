"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/lib/character-context"
import { HOMEWORLDS } from "@/lib/character-data"
import { cn } from "@/lib/utils"
import { Globe, ChevronRight } from "lucide-react"

export function Step1Homeworld() {
  const { character, updateCharacter, setCurrentStep } = useCharacter()
  const [selectedHomeworld, setSelectedHomeworld] = useState(character.homeworld?.id || "")
  const [promptAnswer, setPromptAnswer] = useState(character.homeworld?.promptAnswer || "")

  const handleNext = () => {
    const homeworld = HOMEWORLDS.find((h) => h.id === selectedHomeworld)
    if (homeworld) {
      updateCharacter({
        homeworld: {
          id: homeworld.id,
          name: homeworld.name,
          promptAnswer,
        },
      })
      setCurrentStep(2)
    }
  }

  const selectedHomeworldData = HOMEWORLDS.find((h) => h.id === selectedHomeworld)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Choose Your Homeworld</h2>
        <p className="text-muted-foreground text-pretty">
          Every character begins in a world — lush or barren, decadent or desperate. Your homeworld gives you your first
          perspective on life among the stars.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOMEWORLDS.map((homeworld) => (
          <Card
            key={homeworld.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedHomeworld === homeworld.id && "ring-2 ring-primary shadow-lg",
            )}
            onClick={() => setSelectedHomeworld(homeworld.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{homeworld.name}</CardTitle>
              </div>
              <CardDescription>{homeworld.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium mb-1">Benefits:</p>
                <p className="text-muted-foreground">
                  +{homeworld.benefits.circles} Circles, +{homeworld.benefits.skills} Skill Points
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedHomeworldData && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Reflect on Your Past</CardTitle>
            <CardDescription>{selectedHomeworldData.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-answer">Your Answer</Label>
              <Textarea
                id="prompt-answer"
                placeholder="Share your character's story..."
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button onClick={handleNext} disabled={!promptAnswer.trim()} className="w-full sm:w-auto">
              Continue to Upbringing
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
