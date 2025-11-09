"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/lib/character-context"
import { ChevronRight, ChevronLeft, Lightbulb, Zap } from "lucide-react"

export function Step4Beliefs() {
  const { character, updateCharacter, setCurrentStep } = useCharacter()
  const [belief, setBelief] = useState(character.beliefs?.belief || "")
  const [instinct, setInstinct] = useState(character.beliefs?.instinct || "")

  const handleNext = () => {
    updateCharacter({
      beliefs: {
        belief,
        instinct,
      },
    })
    setCurrentStep(5)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(3)}>
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Define Your Beliefs & Instincts</h2>
        <p className="text-muted-foreground text-pretty">
          These guiding principles and reflexes reveal who your character truly is when tested.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle>Belief</CardTitle>
            </div>
            <CardDescription>
              A principle or conviction that drives your character. What do you believe is true about the world, and how
              does it shape your choices?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="belief">Your Belief</Label>
              <Textarea
                id="belief"
                placeholder='e.g., "The lanes must be safe. The void must be watched. You are the last line."'
                value={belief}
                onChange={(e) => setBelief(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Example Beliefs:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "Every life matters, no matter the cost to save them."</li>
                <li>• "Information is power. Knowledge should be free."</li>
                <li>• "The Culture's ideals are worth protecting, even from itself."</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle>Instinct</CardTitle>
            </div>
            <CardDescription>
              A reflex or habit you fall back on without hesitation. What do you always do (or never do) when faced with
              a situation?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instinct">Your Instinct</Label>
              <Textarea
                id="instinct"
                placeholder='e.g., "Always check the exits" or "Never leave a comrade behind"'
                value={instinct}
                onChange={(e) => setInstinct(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Example Instincts:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "Always scan for surveillance before speaking."</li>
                <li>• "Never trust a deal that seems too good."</li>
                <li>• "When threatened, strike first."</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!belief.trim() || !instinct.trim()}>
          Continue to Connections
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
