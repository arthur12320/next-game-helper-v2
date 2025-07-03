"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CharacterData {
  name: string
  furColor: string
  parentNames: {
    mother: string
    father: string
  }
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
  "Caley",
  "Connor",
  "Curt",
  "Faolan",
  "Finn",
  "Folker",
  "Gamlion",
  "Garnier",
  "Garrow",
  "Grahame",
  "Gurney",
  "Hannidy",
  "Henson",
  "Jasper",
  "Joseff",
  "Kole",
  "Laird",
  "Noelan",
  "Seyth",
  "Siemon",
  "Sloan",
  "Tander",
  "Thom",
  "Thurstan",
  "Trevor",
  "Vidar",
  "Walmond",
]

const FEMALE_NAMES = [
  "Autumn",
  "Aynslle",
  "Baeylie",
  "Brynn",
  "Caley",
  "Clove",
  "Daewn",
  "Dalia",
  "Daye",
  "Gale",
  "Ingrid",
  "Ivy",
  "Josephine",
  "Julyia",
  "Kearra",
  "Laurel",
  "Lilly",
  "Loonis",
  "Loralai",
  "Maren",
  "Millicent",
  "Moira",
  "Nola",
  "Quinn",
  "Rona",
  "Rosalee",
  "Sayble",
  "Serra",
  "Sloan",
  "Sylvia",
  "Taryn",
  "Tinble",
  "Veira",
]

export default function NameStep({ characterData, updateCharacterData }: NameStepProps) {
  const [customName, setCustomName] = useState("")
  const [selectedName, setSelectedName] = useState(characterData.name)

  const handleNameSelect = (name: string) => {
    setSelectedName(name)
    updateCharacterData("name", name)
    setCustomName("")
  }

  const handleCustomNameChange = (value: string) => {
    setCustomName(value)
    setSelectedName(value)
    updateCharacterData("name", value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a name for your character</h3>
        <p className="text-gray-600 mb-6">
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
                setSelectedName("")
                updateCharacterData("name", "")
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Common Names Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Male Names */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-center">Male Names</h4>
          <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
            {MALE_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => handleNameSelect(name)}
                className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors text-left ${
                  selectedName === name ? "bg-blue-100 text-blue-700 font-medium" : ""
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
                className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors text-left ${
                  selectedName === name ? "bg-blue-100 text-blue-700 font-medium" : ""
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
          Selected Name: <span className="text-blue-600">{selectedName || "None selected"}</span>
        </p>
        {selectedName && !MALE_NAMES.includes(selectedName) && !FEMALE_NAMES.includes(selectedName) && (
          <p className="text-sm text-gray-500 mt-1">Custom name - great choice!</p>
        )}
      </div>
    </div>
  )
}
