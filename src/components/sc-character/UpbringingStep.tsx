"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SCCharacter } from "@/db/schema/sc-character"

interface UpbringingStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

const upbringings = [
  {
    name: "Family",
    description: "Kinship and obligation.",
    prompt: "Whose expectations and bounds from your family still shape your choices?",
  },
  {
    name: "Institution",
    description: "Monastery, academy, guild, or military school.",
    prompt: "What lesson did they drill into you that you now resist?",
  },
  {
    name: "Street",
    description: "Hustling, surviving, improvising.",
    prompt: "Who did you betray to get by?",
  },
  {
    name: "Machine",
    description: "Raised among robots, AIs, or cybernetic systems.",
    prompt: "What part of humanity still feels alien to you?",
  },
]

export function UpbringingStep({ data, onUpdate }: UpbringingStepProps) {
  const selectedUpbringing = upbringings.find(
    (u) => u.name === data.upbringing?.name
  )

  const handleSelectUpbringing = (name: string) => {
    onUpdate({ upbringing: { name, promptAnswer: "" } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Upbringing</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {upbringings.map((upbringing) => (
            <Button
              key={upbringing.name}
              variant={
                selectedUpbringing?.name === upbringing.name
                  ? "default"
                  : "outline"
              }
              onClick={() => handleSelectUpbringing(upbringing.name)}
              className="h-auto text-left flex flex-col items-start p-4"
            >
              <span className="font-semibold">{upbringing.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {upbringing.description}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {selectedUpbringing && (
        <div className="space-y-2">
          <Label htmlFor="upbringing-prompt">{selectedUpbringing.prompt}</Label>
          <Textarea
            id="upbringing-prompt"
            value={data.upbringing?.promptAnswer}
            onChange={(e) =>
              onUpdate({
                upbringing: {
                  name: selectedUpbringing.name,
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
