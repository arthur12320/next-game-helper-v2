/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"


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

interface ParentsStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const SUGGESTED_NAMES = {
  mother: ["Ma", "Mama", "Mother", "Mum", "Matilda", "Margaret", "Mary", "Molly", "Mabel"],
  father: ["Pa", "Papa", "Father", "Dad", "Patrick", "Peter", "Paul", "Percy", "Phillip"],
}

export default function ParentsStep({ characterData, updateCharacterData }: ParentsStepProps) {
  const [motherName, setMotherName] = useState(characterData.parentNames.mother)
  const [fatherName, setFatherName] = useState(characterData.parentNames.father)

  const handleMotherNameChange = (value: string) => {
    setMotherName(value)
    updateCharacterData("parentNames", {
      ...characterData.parentNames,
      mother: value,
    })
  }

  const handleFatherNameChange = (value: string) => {
    setFatherName(value)
    updateCharacterData("parentNames", {
      ...characterData.parentNames,
      father: value,
    })
  }

  const handleSuggestedName = (parent: "mother" | "father", name: string) => {
    if (parent === "mother") {
      handleMotherNameChange(name)
    } else {
      handleFatherNameChange(name)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Name your character's parents</h3>
        <p className="text-gray-600 mb-6">
          Choose appropriate names for your character's mother and father. You can use the suggestions or create your
          own.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mother's Name */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3">Mother's Name</h4>
          <Input
            placeholder="Enter mother's name..."
            value={motherName}
            onChange={(e) => handleMotherNameChange(e.target.value)}
            className="mb-3"
          />

          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_NAMES.mother.map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedName("mother", name)}
                  className={`text-xs ${motherName === name ? "bg-blue-100 border-blue-300" : ""}`}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Father's Name */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3">Father's Name</h4>
          <Input
            placeholder="Enter father's name..."
            value={fatherName}
            onChange={(e) => handleFatherNameChange(e.target.value)}
            className="mb-3"
          />

          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_NAMES.father.map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedName("father", name)}
                  className={`text-xs ${fatherName === name ? "bg-blue-100 border-blue-300" : ""}`}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Selection */}
      <div className="border-t pt-4 space-y-2">
        <p className="font-medium">
          Mother: <span className="text-blue-600">{motherName || "Not named"}</span>
        </p>
        <p className="font-medium">
          Father: <span className="text-blue-600">{fatherName || "Not named"}</span>
        </p>
        {motherName && fatherName && (
          <p className="text-sm text-gray-500 mt-2">
            Your character's parents are {motherName} and {fatherName}
          </p>
        )}
      </div>
    </div>
  )
}
