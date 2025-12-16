"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CharacterData {
  name: string
}

interface NameStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const MALE_NAMES = [
  "Abram",
  "Aengus",
  "Algomin",
  "Beagan",
  "Brand",
  "Cale",
  "Connor",
  "Finn",
  "Garrow",
  "Grahame",
  "Jasper",
  "Kole",
  "Laird",
  "Seyth",
  "Thom",
]

const FEMALE_NAMES = [
  "Autumn",
  "Brynn",
  "Caley",
  "Clove",
  "Daye",
  "Gale",
  "Ivy",
  "Kearra",
  "Laurel",
  "Lilly",
  "Moira",
  "Quinn",
  "Rona",
  "Serra",
]

export default function NameStep({ characterData, updateCharacterData }: NameStepProps) {
  const [customName, setCustomName] = useState(characterData.name)

  const handleNameSelect = (name: string) => {
    setCustomName(name)
    updateCharacterData("name", name)
  }

  const handleCustomNameChange = (value: string) => {
    setCustomName(value)
    updateCharacterData("name", value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a name for your character</h3>
        <p className="text-muted-foreground mb-6">
          You can select from common mouse names below or create your own unique name.
        </p>
      </div>

      {/* Custom Name Input */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3">Custom Name</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a custom name..."
            value={customName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            className="flex-1"
          />
          {customName && (
            <Button
              variant="outline"
              onClick={() => {
                setCustomName("")
                updateCharacterData("name", "")
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Common Names Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Male Names */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-center">Male Names</h4>
          <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
            {MALE_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => handleNameSelect(name)}
                className={`p-2 text-sm rounded hover:bg-accent transition-colors text-left ${
                  customName === name ? "bg-primary text-primary-foreground font-medium" : ""
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Female Names */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-center">Female Names</h4>
          <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
            {FEMALE_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => handleNameSelect(name)}
                className={`p-2 text-sm rounded hover:bg-accent transition-colors text-left ${
                  customName === name ? "bg-primary text-primary-foreground font-medium" : ""
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Selection */}
      <div className="border-t pt-4">
        <p className="font-medium">
          Selected Name: <span className="text-primary">{customName || "None selected"}</span>
        </p>
      </div>
    </div>
  )
}
