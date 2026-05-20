"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DGCharacter } from "@/db/schema/dg-character"

interface PersonalDataStepProps {
  data: Partial<DGCharacter>
  onUpdate: (updates: Partial<DGCharacter>) => void
}

export function PersonalDataStep({ data, onUpdate }: PersonalDataStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Last Name, First Name, Middle Initial</Label>
          <Input
            id="name"
            value={data.name || ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Smith, John A."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">MoS (Military Occupational Specialty)</Label>
          <Input id="profession" value="Sniper" disabled className="bg-muted" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer">Employer</Label>
          <Input
            id="employer"
            value={data.employer || ""}
            onChange={(e) => onUpdate({ employer: e.target.value })}
            placeholder="e.g. U.S. Army"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={data.nationality || "American"}
            onChange={(e) => onUpdate({ nationality: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Input
            id="sex"
            value={data.sex || ""}
            onChange={(e) => onUpdate({ sex: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age & D.O.B.</Label>
          <Input
            id="age"
            value={data.age || ""}
            onChange={(e) => onUpdate({ age: e.target.value })}
            placeholder="e.g. 28 / 1996-03-15"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="educationHistory">Education and Occupational History</Label>
        <Textarea
          id="educationHistory"
          value={data.educationHistory || ""}
          onChange={(e) => onUpdate({ educationHistory: e.target.value })}
          rows={3}
          placeholder="Military service, education, prior occupations..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="physicalDescription">Physical Description / Distinguishing Features</Label>
        <Textarea
          id="physicalDescription"
          value={data.physicalDescription || ""}
          onChange={(e) => onUpdate({ physicalDescription: e.target.value })}
          rows={3}
          placeholder="Height, weight, eye color, scars, tattoos..."
        />
      </div>
    </div>
  )
}
