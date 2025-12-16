"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { SCCharacter } from "@/db/schema/sc-characters"

interface BackgroundStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

export function BackgroundStep({ data, onUpdate }: BackgroundStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="homeworld">Homeworld</Label>
        <Input
          id="homeworld"
          value={data.homeworld || ""}
          onChange={(e) => onUpdate({ homeworld: e.target.value })}
          placeholder="Your agent's planet of origin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="upbringing">Upbringing</Label>
        <Input
          id="upbringing"
          value={data.upbringing || ""}
          onChange={(e) => onUpdate({ upbringing: e.target.value })}
          placeholder="Early life and background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beliefs">Beliefs</Label>
        <Textarea
          id="beliefs"
          value={data.beliefs || ""}
          onChange={(e) => onUpdate({ beliefs: e.target.value })}
          placeholder="What does your agent believe in?"
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instincts">Instincts</Label>
        <Textarea
          id="instincts"
          value={data.instincts || ""}
          onChange={(e) => onUpdate({ instincts: e.target.value })}
          placeholder="How does your agent react instinctively?"
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Goals</Label>
        <Textarea
          id="goals"
          value={data.goals || ""}
          onChange={(e) => onUpdate({ goals: e.target.value })}
          placeholder="What does your agent want to achieve?"
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  )
}
