"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SCCharacter } from "@/db/schema/sc-character"

interface BasicInfoStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name *</Label>
        <Input
          id="name"
          value={data.name || ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter agent name"
          required
        />
        <p className="text-sm text-muted-foreground">Your agent's operational codename or real name</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pronouns">Pronouns</Label>
        <Input
          id="pronouns"
          value={data.pronouns || ""}
          onChange={(e) => onUpdate({ pronouns: e.target.value })}
          placeholder="e.g., they/them, she/her, he/him"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concept">Concept</Label>
        <Textarea
          id="concept"
          value={data.concept || ""}
          onChange={(e) => onUpdate({ concept: e.target.value })}
          placeholder="Describe your agent's background, personality, and specialty..."
          rows={4}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">A brief description of your agent's role and personality</p>
      </div>
    </div>
  )
}
