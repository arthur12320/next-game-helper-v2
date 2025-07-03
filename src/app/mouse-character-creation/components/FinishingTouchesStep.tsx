/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"


import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

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
  wises: any
  resources: any
  traits: any
  name: string
  furColor: string
  parentNames: any
  relationships: any
  finishingTouches: {
    cloakColor: string
    cloakReason: string
    belief: string
    goal: string
    instinct: string
    weapon: string
    additionalGear: string[]
    fatePoints: number
    personaPoints: number
  }
}

interface FinishingTouchesStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const CLOAK_COLORS = [
  { color: "Red", meaning: "Courage, valor, and strength in battle" },
  { color: "Blue", meaning: "Wisdom, loyalty, and steadfast service" },
  { color: "Green", meaning: "Growth, harmony with nature, and healing" },
  { color: "Gold", meaning: "Compassion, generosity, and noble spirit" },
  { color: "Purple", meaning: "Leadership, dignity, and strategic thinking" },
  { color: "Brown", meaning: "Reliability, hard work, and connection to the earth" },
  { color: "Gray", meaning: "Balance, neutrality, and practical wisdom" },
  { color: "Black", meaning: "Determination, mystery, and unwavering resolve" },
  { color: "White", meaning: "Purity, hope, and new beginnings" },
  { color: "Orange", meaning: "Enthusiasm, creativity, and adaptability" },
]

const WEAPONS = ["Shield", "Knife", "Sword", "Staff", "Spear", "Hook and Line", "Halberd", "Sling", "Bow"]

const COMMON_GEAR = [
  "Rope",
  "Lantern",
  "Carving Knife",
  "Cooking Pot",
  "Blanket",
  "Waterskin",
  "Rations",
  "Flint and Steel",
  "Needle and Thread",
  "Parchment and Ink",
  "Compass",
  "Spyglass",
  "Healing Herbs",
  "Trap",
  "Net",
]

export default function FinishingTouchesStep({ characterData, updateCharacterData }: FinishingTouchesStepProps) {
  const [newGearItem, setNewGearItem] = useState("")

  const isTenderpaw = characterData.guardRank.rank === "Tenderpaw"

  const updateFinishingTouch = (field: string, value: any) => {
    updateCharacterData("finishingTouches", {
      ...characterData.finishingTouches,
      [field]: value,
    })
  }

  const addGearItem = (item: string) => {
    if (item && !characterData.finishingTouches.additionalGear.includes(item)) {
      updateFinishingTouch("additionalGear", [...characterData.finishingTouches.additionalGear, item])
    }
  }

  const removeGearItem = (item: string) => {
    updateFinishingTouch(
      "additionalGear",
      characterData.finishingTouches.additionalGear.filter((gear) => gear !== item),
    )
  }

  const addCustomGear = () => {
    if (newGearItem.trim()) {
      addGearItem(newGearItem.trim())
      setNewGearItem("")
    }
  }

  if (!characterData.guardRank.rank) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please complete the previous steps first to continue with finishing touches.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Finishing Touches</h3>
        <p className="text-gray-600 mb-6">
          Complete your character with these final details that will bring them to life in the world of Mouse Guard.
        </p>
      </div>

      {/* Cloak Color (Not for Tenderpaws) */}
      {!isTenderpaw && (
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-700">Cloak Color</h4>
          <p className="text-sm text-gray-600 mb-4">
            Your mentor gave you your cloak on the day you were formally inducted into the Guard. What color is it and
            why? What part of your personality made your mentor decide on that particular color?
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cloak Color</label>
              <Select
                value={characterData.finishingTouches.cloakColor}
                onValueChange={(value) => updateFinishingTouch("cloakColor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose cloak color" />
                </SelectTrigger>
                <SelectContent>
                  {CLOAK_COLORS.map((cloak) => (
                    <SelectItem key={cloak.color} value={cloak.color}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: cloak.color.toLowerCase() }}
                        />
                        {cloak.color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {characterData.finishingTouches.cloakColor && (
                <p className="text-xs text-gray-500 mt-1">
                  {CLOAK_COLORS.find((c) => c.color === characterData.finishingTouches.cloakColor)?.meaning}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Why This Color?</label>
            <Textarea
              placeholder="e.g., My mentor chose gold to reflect my compassionate core and generous spirit..."
              value={characterData.finishingTouches.cloakReason}
              onChange={(e) => updateFinishingTouch("cloakReason", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Tenderpaw Note */}
      {isTenderpaw && (
        <div className="border p-4 rounded-lg bg-yellow-50 border-yellow-200">
          <h4 className="font-medium mb-2 text-yellow-800">Tenderpaw Status</h4>
          <p className="text-sm text-yellow-700">
            Tenderpaws do not start with a cloak and will receive one upon full induction into the Guard.
          </p>
        </div>
      )}

      {/* Belief */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-green-700">Belief</h4>
        <p className="text-sm text-gray-600 mb-4">
          Write a Belief for your character based on how they view their role in the Guard. A Belief is an overarching
          ethical or moral stance that guides your character's actions.
        </p>
        <Textarea
          placeholder="e.g., 'I'll build a good name for the Mouse Guard' or 'The Guard must protect all mice, no matter the cost'"
          value={characterData.finishingTouches.belief}
          onChange={(e) => updateFinishingTouch("belief", e.target.value)}
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-2">
          <strong>Examples:</strong> "The Guard serves all mice equally" • "Knowledge is the greatest weapon" • "No
          mouse left behind"
        </p>
      </div>

      {/* Goal */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-purple-700">Goal</h4>
        <p className="text-sm text-gray-600 mb-4">
          Write a Goal for your character based on their current mission or situation. A Goal is an objective you could
          feasibly accomplish in the near future via your character's actions.
        </p>
        <Textarea
          placeholder="e.g., 'I will ensure that none of my patrolmates come to harm on this mission' or 'I will prove my worth to the patrol leader'"
          value={characterData.finishingTouches.goal}
          onChange={(e) => updateFinishingTouch("goal", e.target.value)}
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-2">
          <strong>Examples:</strong> "Deliver the mail safely" • "Uncover the truth about the missing mice" • "Earn my
          mentor's respect"
        </p>
      </div>

      {/* Instinct */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-red-700">Instinct</h4>
        <p className="text-sm text-gray-600 mb-4">
          How does your character react? What has your guardmouse been trained to do? Write an Instinct that describes
          your character's automatic responses or habits.
        </p>
        <Textarea
          placeholder="e.g., 'Anticipate what the patrol leader needs' or 'Always check for predators before entering open ground'"
          value={characterData.finishingTouches.instinct}
          onChange={(e) => updateFinishingTouch("instinct", e.target.value)}
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-2">
          <strong>Examples:</strong> "Draw weapon when threatened" • "Protect the youngest first" • "Never leave a
          trail"
        </p>
      </div>

      {/* Gear */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-orange-700">Gear & Equipment</h4>
        <p className="text-sm text-gray-600 mb-4">
          What weapon does your mouse carry? What other tools or devices do they have for their job?
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Weapon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Weapon</label>
            <Select
              value={characterData.finishingTouches.weapon}
              onValueChange={(value) => updateFinishingTouch("weapon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose weapon" />
              </SelectTrigger>
              <SelectContent>
                {WEAPONS.map((weapon) => (
                  <SelectItem key={weapon} value={weapon}>
                    {weapon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Gear */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Gear</label>
            <div className="space-y-2">
              {/* Common Gear Buttons */}
              <div className="flex flex-wrap gap-1">
                {COMMON_GEAR.map((item) => (
                  <button
                    key={item}
                    onClick={() => addGearItem(item)}
                    disabled={characterData.finishingTouches.additionalGear.includes(item)}
                    className={`px-2 py-1 text-xs border rounded transition-colors ${
                      characterData.finishingTouches.additionalGear.includes(item)
                        ? "bg-green-100 border-green-300 text-green-700 cursor-not-allowed"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom Gear Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Custom gear item..."
                  value={newGearItem}
                  onChange={(e) => setNewGearItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomGear()}
                  className="text-sm"
                />
                <Button size="sm" onClick={addCustomGear} disabled={!newGearItem.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Gear Display */}
        {characterData.finishingTouches.additionalGear.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Gear:</h5>
            <div className="flex flex-wrap gap-2">
              {characterData.finishingTouches.additionalGear.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {item}
                  <button onClick={() => removeGearItem(item)} className="text-blue-600 hover:text-blue-800">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Starting Rewards */}
      <div className="border p-4 rounded-lg bg-green-50 border-green-200">
        <h4 className="font-medium mb-3 text-green-800">Starting Rewards</h4>
        <p className="text-sm text-green-700 mb-4">
          All characters begin the game with one fate point and one persona point.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">{characterData.finishingTouches.fatePoints}</div>
            <div className="text-sm text-gray-600">Fate Point</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">{characterData.finishingTouches.personaPoints}</div>
            <div className="text-sm text-gray-600">Persona Point</div>
          </div>
        </div>
      </div>

      {/* Character Completion Summary */}
      <div className="border-t pt-6">
        <h4 className="font-medium mb-3">Character Completion</h4>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {!isTenderpaw && (
                <p>
                  <span className="font-medium text-blue-800">Cloak:</span>{" "}
                  {characterData.finishingTouches.cloakColor || "Not selected"}
                </p>
              )}
              <p>
                <span className="font-medium text-blue-800">Belief:</span>{" "}
                {characterData.finishingTouches.belief || "Not written"}
              </p>
              <p>
                <span className="font-medium text-blue-800">Goal:</span>{" "}
                {characterData.finishingTouches.goal || "Not written"}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-blue-800">Instinct:</span>{" "}
                {characterData.finishingTouches.instinct || "Not written"}
              </p>
              <p>
                <span className="font-medium text-blue-800">Weapon:</span>{" "}
                {characterData.finishingTouches.weapon || "Not selected"}
              </p>
              <p>
                <span className="font-medium text-blue-800">Additional Gear:</span>{" "}
                {characterData.finishingTouches.additionalGear.length > 0
                  ? `${characterData.finishingTouches.additionalGear.length} items`
                  : "None selected"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
