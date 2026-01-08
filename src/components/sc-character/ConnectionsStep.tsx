"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SCCharacter } from "@/db/schema/sc-character"

interface ConnectionsStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

export function ConnectionsStep({ data, onUpdate }: ConnectionsStepProps) {
  const handleConnectionChange = (
    index: number,
    field: "characterName" | "description",
    value: string
  ) => {
    const newConnections = [...(data.connections || [])]
    newConnections[index] = { ...newConnections[index], [field]: value, characterId: "" }
    onUpdate({ connections: newConnections })
  }

  const addConnection = () => {
    onUpdate({
      connections: [
        ...(data.connections || []),
        { characterId: "", characterName: "", description: "" },
      ],
    })
  }

  const removeConnection = (index: number) => {
    const newConnections = [...(data.connections || [])]
    newConnections.splice(index, 1)
    onUpdate({ connections: newConnections })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Forge Connections</h3>
      <p className="text-sm text-muted-foreground">
        Describe your character&apos;s relationship with other characters.
      </p>
      {(data.connections || []).map((connection, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-md relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeConnection(index)}
          >
            &times;
          </Button>
          <div className="space-y-2">
            <Label htmlFor={`connection-name-${index}`}>Character Name</Label>
            <Input
              id={`connection-name-${index}`}
              value={connection.characterName}
              onChange={(e) =>
                handleConnectionChange(index, "characterName", e.target.value)
              }
              placeholder="Enter character name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`connection-desc-${index}`}>Description</Label>
            <Textarea
              id={`connection-desc-${index}`}
              value={connection.description}
              onChange={(e) =>
                handleConnectionChange(index, "description", e.target.value)
              }
              placeholder="Describe your connection to this character"
            />
          </div>
        </div>
      ))}
      <Button onClick={addConnection} variant="outline">
        Add Connection
      </Button>
    </div>
  )
}
