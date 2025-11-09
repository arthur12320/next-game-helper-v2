"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/lib/character-context"
import { LIFEPATHS } from "@/lib/character-data"
import { cn } from "@/lib/utils"
import { Briefcase, ChevronRight, ChevronLeft, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Step3Lifepaths() {
  const { character, updateCharacter, setCurrentStep } = useCharacter()
  const [lifepaths, setLifepaths] = useState(character.lifepaths || [])
  const [selectedLifepath, setSelectedLifepath] = useState("")
  const [promptAnswer, setPromptAnswer] = useState("")

  const handleAddLifepath = () => {
    if (lifepaths.length >= 2) {
      return
    }
    const lifepath = LIFEPATHS.find((l) => l.id === selectedLifepath)
    if (lifepath && promptAnswer.trim()) {
      setLifepaths([
        ...lifepaths,
        {
          id: lifepath.id,
          name: lifepath.name,
          promptAnswer,
        },
      ])
      setSelectedLifepath("")
      setPromptAnswer("")
    }
  }

  const handleRemoveLifepath = (index: number) => {
    setLifepaths(lifepaths.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    updateCharacter({ lifepaths })
    setCurrentStep(4)
  }

  const selectedLifepathData = LIFEPATHS.find((l) => l.id === selectedLifepath)
  const hasMinimumLifepaths = lifepaths.length >= 1
  const isMaxLifepaths = lifepaths.length >= 2

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(2)}>
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Select Your Lifepaths</h2>
        <p className="text-muted-foreground text-pretty">
          Your history is told through lifepaths — narrative chapters that shape you. Select up to 2 lifepaths. Each
          grants trait pairs.
        </p>
      </div>

      {lifepaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Career History</CardTitle>
            <CardDescription>{`Lifepaths you've completed ${lifepaths.length/2}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lifepaths.map((lifepath, index) => {
                const data = LIFEPATHS.find((l) => l.id === lifepath.id)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{lifepath.name}</span>
                        {index < 2 && data && (
                          <Badge variant="secondary" className="text-xs">
                            {data.traitPair}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{lifepath.promptAnswer}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLifepath(index)} className="ml-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!isMaxLifepaths && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIFEPATHS.map((lifepath) => (
            <Card
              key={lifepath.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedLifepath === lifepath.id && "ring-2 ring-primary shadow-lg",
              )}
              onClick={() => setSelectedLifepath(lifepath.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{lifepath.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {lifepath.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Trait Pair:</p>
                    <Badge variant="secondary" className="text-xs">
                      {lifepath.traitPair}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedLifepathData && !isMaxLifepaths && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Reflect on Your Career as a {selectedLifepathData.name}</CardTitle>
            <CardDescription>{selectedLifepathData.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lifepath-answer">Your Answer</Label>
              <Textarea
                id="lifepath-answer"
                placeholder="Share this chapter of your character's story..."
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <Button onClick={handleAddLifepath} disabled={!promptAnswer.trim()} className="w-full sm:w-auto">
              <Plus className="mr-2 w-4 h-4" />
              Add Lifepath
            </Button>
          </CardContent>
        </Card>
      )}

      {hasMinimumLifepaths && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            Continue to Beliefs & Instincts
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
