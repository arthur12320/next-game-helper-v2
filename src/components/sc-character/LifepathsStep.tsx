"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SCCharacter } from "@/db/schema/sc-character"
import { lifepaths } from "@/lib/character-data"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"

interface LifepathsStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

export function LifepathsStep({ data, onUpdate }: LifepathsStepProps) {
  const selectedLifepaths = data.lifepaths || []

  const handleToggleLifepath = (lifepathName: string) => {
    const lifepath = lifepaths.find((lp) => lp.name === lifepathName)
    if (!lifepath) return

    const newLifepaths = [...selectedLifepaths]
    const existingIndex = newLifepaths.findIndex(
      (lp) => lp.name === lifepathName
    )

    if (existingIndex > -1) {
      // Deselect lifepath
      newLifepaths.splice(existingIndex, 1)
    } else if (newLifepaths.length < 2) {
      // Select lifepath
      newLifepaths.push({
        name: lifepath.name,
        promptAnswer: "",
        traits: { trait1: lifepath.traitPair[0], trait2: lifepath.traitPair[1] },
      })
    }

    // Rebuild trait pairs from the updated lifepaths
    const newTraitPairs = newLifepaths.map((lp) => lp.traits)

    onUpdate({ lifepaths: newLifepaths, traitPairs: newTraitPairs })
  }

  const handlePromptChange = (index: number, promptAnswer: string) => {
    const newLifepaths = [...selectedLifepaths]
    newLifepaths[index] = { ...newLifepaths[index], promptAnswer }
    onUpdate({ lifepaths: newLifepaths })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select up to 2 Lifepaths</h3>
        <p className="text-sm text-muted-foreground">
          Each lifepath grants skills and a trait pair.
        </p>
        <ScrollArea className="h-72 w-full mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
            {lifepaths.map((lp) => {
              const isSelected = selectedLifepaths.some(
                (sl) => sl.name === lp.name
              )
              const isDisabled = !isSelected && selectedLifepaths.length >= 2
              return (
                <Button
                  key={lp.name}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleToggleLifepath(lp.name)}
                  disabled={isDisabled}
                  className="h-auto text-left flex flex-col items-start p-3"
                >
                  <span className="font-semibold">{lp.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {lp.skills.join(", ")}
                  </span>
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {selectedLifepaths.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Lifepath Details</h4>
          {selectedLifepaths.map((sl, index) => {
            const lifepathDetails = lifepaths.find(
              (lp) => lp.name === sl.name
            )
            if (!lifepathDetails) return null
            return (
              <div
                key={sl.name}
                className="p-4 border rounded-md space-y-2"
              >
                <h5 className="font-semibold">{sl.name}</h5>
                <div className="text-sm text-muted-foreground">
                  <strong>Traits:</strong>{" "}
                  {lifepathDetails.traitPair.join(" / ")}
                </div>
                <div>
                  <Label htmlFor={`lifepath-prompt-${index}`}>
                    {lifepathDetails.prompt}
                  </Label>
                  <Textarea
                    id={`lifepath-prompt-${index}`}
                    value={sl.promptAnswer}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder="Your answer here..."
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
