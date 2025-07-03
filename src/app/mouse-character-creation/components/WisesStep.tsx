"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CharacterData {
  concept: any
  guardRank: {
    rank: string
    age: number
    abilities: { will: number; health: number }
    skills: Record<string, number>
    birthYear: number
  }
  skillChoices: any
  hometown: any
  mouseNature: any
  wises: {
    count: number
    selectedWises: string[]
    customWises: string[]
  }
  resources: any
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface WisesStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const TENDERPAW_WISES = ["Code of the Guard-wise", "Legends of the Guard-wise"]

const GENERAL_WISES = [
  "Apiary-wise",
  "Armor-wise",
  "Autumn storm-wise",
  "Badger-wise",
  "Barkstone-wise",
  "Bird-wise",
  "Blizzard-wise",
  "Bramble-wise",
  "Brush fire-wise",
  "Burrow-wise",
  "Celebrations-wise",
  "Clear and warm weather-wise",
  "Coast-wise",
  "Cold rain-wise",
  "Cold snap-wise",
  "Copperwood-wise",
  "Coyote-wise",
  "Craft-wise",
  "Crime-wise",
  "Darkheather-wise",
  "Deer-wise",
  "Drought-wise",
  "Elmoss-wise",
  "Epidemic-wise",
  "Escort-wise",
  "Famine-wise",
  "Flash flood-wise",
  "Forest fire-wise",
  "Forest-wise",
  "Fox-wise",
  "Freezing-wise",
  "Frog-wise",
  "Governor-wise",
  "Grain-wise",
  "Guard captain-wise",
  "Guardmouse-wise",
  "Harvest-wise",
  "Hawk-wise",
  "Heat wave-wise",
  "Herb-wise",
  "Hidey hole-wise",
  "Ice storm-wise",
  "Ice-wise",
  "Lake-wise",
  "Leaf cover-wise",
  "Lockhaven-wise",
  "Mail-wise",
  "Medicine-wise",
  "Moose-wise",
  "Moss-wise",
  "Mouse Guard-wise",
  "Mud-wise",
  "Night-wise",
  "Nut-wise",
  "Open ground-wise",
  "Owl-wise",
  "Path-wise",
  "Patrol guard-wise",
  "Patrol leader-wise",
  "Planting-wise",
  "Poison-wise",
  "Pond-wise",
  "Predator-wise",
  "Raccoon-wise",
  "Rain-wise",
  "Raven-wise",
  "Rebellion-wise",
  "Recipe-wise",
  "Road-wise",
  "Rocky terrain-wise",
  "Scent Border-wise",
  "Shaleburrow-wise",
  "Shield-wise",
  "Shore-wise",
  "Shortages-wise",
  "Snake-wise",
  "Snow-wise",
  "Sprucetuck-wise",
  "Squirrel-wise",
  "Star-wise",
  "Stream-wise",
  "Swamps-wise",
  "Tall grass-wise",
  "Tenderpaw-wise",
  "Thorn-wise",
  "Thunderstorm-wise",
  "Tide-wise",
  "Tradesmouse-wise",
  "Trail-wise",
  "Transport-wise",
  "Trap-wise",
  "Tunnel-wise",
  "Turtle-wise",
  "Unseasonably cold-wise",
  "Unseasonably warm-wise",
  "War-wise",
  "Weasel-wise",
  "Widget-wise",
  "Wild country-wise",
  "Wild mouse-wise",
  "Wolf-wise",
]

const REQUIRED_CAPTAIN_WISES = ["Lockhaven-wise", "Matriarch-wise"]

export default function WisesStep({ characterData, updateCharacterData }: WisesStepProps) {
  const [customWise, setCustomWise] = useState("")

  // Get wise count based on rank
  const getWiseCount = () => {
    switch (characterData.guardRank.rank) {
      case "Tenderpaw":
        return 1
      case "Guardmouse":
        return 1
      case "Patrol Guard":
        return 2
      case "Patrol Leader":
        return 3
      case "Guard Captain":
        return 4
      default:
        return 1
    }
  }

  const wiseCount = getWiseCount()
  const isTenderpaw = characterData.guardRank.rank === "Tenderpaw"
  const isGuardCaptain = characterData.guardRank.rank === "Guard Captain"

  // Get available wises based on rank
  const getAvailableWises = () => {
    if (isTenderpaw) {
      return TENDERPAW_WISES
    }
    return GENERAL_WISES
  }

  const availableWises = getAvailableWises()

  const toggleWise = (wise: string) => {
    const currentWises = characterData.wises.selectedWises
    const newWises = currentWises.includes(wise)
      ? currentWises.filter((w) => w !== wise)
      : currentWises.length < wiseCount
        ? [...currentWises, wise]
        : currentWises

    updateCharacterData("wises", {
      ...characterData.wises,
      count: wiseCount,
      selectedWises: newWises,
    })
  }

  const addCustomWise = () => {
    if (customWise.trim() && characterData.wises.selectedWises.length < wiseCount) {
      const wiseWithSuffix = customWise.trim().endsWith("-wise") ? customWise.trim() : `${customWise.trim()}-wise`

      updateCharacterData("wises", {
        ...characterData.wises,
        count: wiseCount,
        selectedWises: [...characterData.wises.selectedWises, wiseWithSuffix],
        customWises: [...characterData.wises.customWises, wiseWithSuffix],
      })

      setCustomWise("")
    }
  }

  const removeWise = (wise: string) => {
    updateCharacterData("wises", {
      ...characterData.wises,
      selectedWises: characterData.wises.selectedWises.filter((w) => w !== wise),
      customWises: characterData.wises.customWises.filter((w) => w !== wise),
    })
  }

  if (!characterData.guardRank.rank) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a Guard Rank first to continue with wise selection.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Being Wise</h3>
        <p className="text-gray-600 mb-6">
          Wises represent pure knowledge and experience. What are you particularly knowledgeable about? You start with a
          number of wises in proportion to your rank.
        </p>
      </div>

      {/* Wise Count Display */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-2">
          {characterData.guardRank.rank} Wises ({characterData.wises.selectedWises.length}/{wiseCount})
        </h4>
        <p className="text-sm text-gray-600">
          {isTenderpaw
            ? "Tenderpaws choose from Code of the Guard-wise or Legends of the Guard-wise only."
            : isGuardCaptain
              ? "Guard Captains must take Lockhaven-wise or Matriarch-wise as one of their wises."
              : "Choose from the general list or create your own custom wises."}
        </p>
      </div>

      {/* Guard Captain Requirements */}
      {isGuardCaptain && (
        <div className="border p-4 rounded-lg bg-amber-50 border-amber-200">
          <h4 className="font-medium mb-3 text-amber-800">Required Captain Wises</h4>
          <p className="text-sm text-amber-700 mb-4">
            Guard Captains must take one of the following as one of their wises:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {REQUIRED_CAPTAIN_WISES.map((wise) => (
              <button
                key={wise}
                onClick={() => toggleWise(wise)}
                className={`p-2 text-sm border rounded transition-colors ${
                  characterData.wises.selectedWises.includes(wise)
                    ? "border-amber-500 bg-amber-100 text-amber-700"
                    : "border-amber-300 hover:bg-amber-100"
                }`}
              >
                {wise}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available Wises */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700">{isTenderpaw ? "Tenderpaw Wises" : "Available Wises"}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {availableWises.map((wise) => (
            <button
              key={wise}
              onClick={() => toggleWise(wise)}
              disabled={
                characterData.wises.selectedWises.length >= wiseCount &&
                !characterData.wises.selectedWises.includes(wise)
              }
              className={`p-2 text-sm border rounded transition-colors text-left ${
                characterData.wises.selectedWises.includes(wise)
                  ? "border-blue-500 bg-blue-100 text-blue-700"
                  : characterData.wises.selectedWises.length >= wiseCount
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {wise}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Wise Creation */}
      {!isTenderpaw && characterData.wises.selectedWises.length < wiseCount && (
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-green-700">Create Custom Wise</h4>
          <p className="text-sm text-gray-600 mb-4">
            You can create custom wises for specific towns, animals, or groups of mice. Examples: "Turkey Vulture-wise",
            "Bandit-wise", "Armorer-wise"
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom wise (e.g., 'Turkey Vulture', 'Bandit')"
              value={customWise}
              onChange={(e) => setCustomWise(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomWise()}
            />
            <Button onClick={addCustomWise} disabled={!customWise.trim()}>
              Add Wise
            </Button>
          </div>
        </div>
      )}

      {/* Selected Wises */}
      {characterData.wises.selectedWises.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Your Selected Wises</h4>
          <div className="space-y-2">
            {characterData.wises.selectedWises.map((wise, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                <span className="font-medium text-green-800">{wise}</span>
                <button onClick={() => removeWise(wise)} className="text-red-600 hover:text-red-800 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>

          {characterData.wises.selectedWises.length === wiseCount && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">✓ All wises selected!</p>
            </div>
          )}
        </div>
      )}

      {/* Wise Guidelines */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-2 text-gray-800">Wise Guidelines</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            • <strong>Town Wises:</strong> Add "-wise" to any settlement (e.g., "Barkstone-wise")
          </p>
          <p>
            • <strong>Animal Wises:</strong> Add "-wise" to any animal (e.g., "Turkey Vulture-wise")
          </p>
          <p>
            • <strong>Mouse Group Wises:</strong> Add "-wise" to mouse types (e.g., "Bandit-wise", "Armorer-wise")
          </p>
          <p>• Wises are not rated and represent pure knowledge and experience</p>
        </div>
      </div>
    </div>
  )
}
