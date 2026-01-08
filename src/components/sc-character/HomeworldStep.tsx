"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SCCharacter } from "@/db/schema/sc-character"

interface HomeworldStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

const homeworlds = [
  {
    name: "Core World",
    description: "Wealthy, stable, bureaucratic.",
    prompt: "What privilege did you take for granted that others might resent?",
  },
  {
    name: "Frontier Colony",
    description: "Harsh survival, scarce resources.",
    prompt: "What danger almost killed you before adulthood?",
  },
  {
    name: "Trade Hub",
    description: "A crossroads of cultures and species.",
    prompt: "Which offworlder taught you something you still carry?",
  },
  {
    name: "Industrial World",
    description: "Factories, shipyards, endless labor.",
    prompt: "What skill or craft did you inherit from the machinery around you?",
  },
  {
    name: "Exotic World",
    description: "Harsh alien ecology or unusual traditions.",
    prompt: "What belief or adaptation sets you apart from the rest of the crew?",
  },
]

export function HomeworldStep({ data, onUpdate }: HomeworldStepProps) {
  const selectedHomeworld = homeworlds.find(
    (h) => h.name === data.homeworld?.name
  )

  const handleSelectHomeworld = (name: string) => {
    onUpdate({ homeworld: { name, promptAnswer: "" } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Homeworld</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {homeworlds.map((homeworld) => (
            <Button
              key={homeworld.name}
              variant={selectedHomeworld?.name === homeworld.name ? "default" : "outline"}
              onClick={() => handleSelectHomeworld(homeworld.name)}
              className="h-auto text-left flex flex-col items-start p-4"
            >
              <span className="font-semibold">{homeworld.name}</span>
              <span className="text-sm font-normal text-muted-foreground">{homeworld.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {selectedHomeworld && (
        <div className="space-y-2">
          <Label htmlFor="homeworld-prompt">{selectedHomeworld.prompt}</Label>
          <Textarea
            id="homeworld-prompt"
            value={data.homeworld?.promptAnswer}
            onChange={(e) =>
              onUpdate({
                homeworld: {
                  name: selectedHomeworld.name,
                  promptAnswer: e.target.value,
                },
              })
            }
            placeholder="Your answer here..."
          />
        </div>
      )}
    </div>
  )
}
