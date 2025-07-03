"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react"
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
  hometown: {
    city: string
    trait: string
    skill: string
  }
  mouseNature: {
    baseNature: number
    finalNature: number
    winterSaving: boolean
    confrontation: boolean
    fearPredators: boolean
    availableTraits: string[]
    selectedTrait: string
    fighterReduction: boolean
  }
  wises: any
  resources: any
  traits: {
    bornWith: string
    parentalInheritance: string
    lifeOnTheRoad: string
    finalTraits: Record<string, number>
  }
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface TraitsStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const BORN_WITH_TRAITS = [
  "Bigpaw",
  "Bitter",
  "Bodyguard",
  "Bold",
  "Brave",
  "Calm",
  "Clever",
  "Compassionate",
  "Cunning",
  "Curious",
  "Deep Ear",
  "Defender",
  "Determined",
  "Driven",
  "Early Riser",
  "Extrovert",
  "Fat",
  "Fearful",
  "Fearless",
  "Fiery",
  "Generous",
  "Graceful",
  "Guard's Honor",
  "Innocent",
  "Jaded",
  "Leader",
  "Longtail",
  "Lost",
  "Natural Bearings",
  "Nimble",
  "Nocturnal",
  "Oldfur",
  "Quick-Witted",
  "Quiet",
  "Scarred",
  "Sharp-Eyed",
  "Sharptooth",
  "Short",
  "Skeptical",
  "Skinny",
  "Stoic",
  "Stubborn",
  "Suspicious",
  "Tall",
  "Thoughtful",
  "Tough",
  "Weather Sense",
  "Wise",
  "Wolf's Snout",
  "Young",
]

const PARENTAL_TRAITS = [
  "Bigpaw",
  "Brave",
  "Calm",
  "Clever",
  "Compassionate",
  "Curious",
  "Deep Ear",
  "Defender",
  "Determined",
  "Early Riser",
  "Extrovert",
  "Fearful",
  "Fearless",
  "Fiery",
  "Generous",
  "Graceful",
  "Longtail",
  "Lost",
  "Natural Bearings",
  "Nimble",
  "Quick-Witted",
  "Quiet",
  "Scarred",
  "Sharptooth",
  "Short",
  "Skeptical",
  "Skinny",
  "Stubborn",
  "Suspicious",
  "Tall",
  "Tough",
  "Wolf's Snout",
]

const LIFE_ON_ROAD_TRAITS = [
  "Bitter",
  "Bodyguard",
  "Brave",
  "Calm",
  "Clever",
  "Compassionate",
  "Cunning",
  "Curious",
  "Defender",
  "Driven",
  "Early Riser",
  "Fearful",
  "Fearless",
  "Jaded",
  "Leader",
  "Natural Bearings",
  "Nocturnal",
  "Oldfur",
  "Quiet",
  "Scarred",
  "Sharp-Eyed",
  "Skeptical",
  "Skinny",
  "Stoic",
  "Thoughtful",
  "Tough",
  "Weather Sense",
  "Wise",
]

export default function TraitsStep({ characterData, updateCharacterData }: TraitsStepProps) {
  const [finalTraits, setFinalTraits] = useState<Record<string, number>>({})

  // Determine which sections apply based on rank
  const isTenderpaw = characterData.guardRank.rank === "Tenderpaw"
  const isPatrolLeaderOrCaptain =
    characterData.guardRank.rank === "Patrol Leader" || characterData.guardRank.rank === "Guard Captain"

  // Calculate final traits whenever selections change
  useEffect(() => {
    const traits: Record<string, number> = {}

    // Add Mouse Nature trait if selected
    if (characterData.mouseNature.selectedTrait) {
      traits[characterData.mouseNature.selectedTrait] = (traits[characterData.mouseNature.selectedTrait] || 0) + 1
    }

    // Add hometown trait if selected
    if (characterData.hometown.trait) {
      traits[characterData.hometown.trait] = (traits[characterData.hometown.trait] || 0) + 1
    }

    // Add born with trait
    if (characterData.traits.bornWith) {
      traits[characterData.traits.bornWith] = (traits[characterData.traits.bornWith] || 0) + 1
    }

    // Add parental inheritance trait (Tenderpaws only)
    if (characterData.traits.parentalInheritance && isTenderpaw) {
      traits[characterData.traits.parentalInheritance] = (traits[characterData.traits.parentalInheritance] || 0) + 1
    }

    // Add life on the road trait (Patrol Leaders and Guard Captains only)
    if (characterData.traits.lifeOnTheRoad && isPatrolLeaderOrCaptain) {
      traits[characterData.traits.lifeOnTheRoad] = (traits[characterData.traits.lifeOnTheRoad] || 0) + 1
    }

    setFinalTraits(traits)
  }, [
    characterData.mouseNature.selectedTrait,
    characterData.hometown.trait,
    characterData.traits,
    isTenderpaw,
    isPatrolLeaderOrCaptain,
  ])

  const updateTrait = (section: string, trait: string) => {
    updateCharacterData("traits", {
      ...characterData.traits,
      [section]: trait,
    })
  }

  const confirmTraits = () => {
    updateCharacterData("traits", {
      ...characterData.traits,
      finalTraits,
    })
  }

  const TraitButton = ({
    trait,
    isSelected,
    onClick,
    currentLevel = 0,
  }: {
    trait: string
    isSelected: boolean
    onClick: () => void
    currentLevel?: number
  }) => (
    <button
      onClick={onClick}
      className={`p-2 text-sm border rounded transition-colors text-left ${
        isSelected ? "border-blue-500 bg-blue-100 text-blue-700" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="font-medium">{trait}</div>
      {currentLevel > 0 && <div className="text-xs text-green-600 mt-1">Current Level: {currentLevel}</div>}
    </button>
  )

  const getTraitLevel = (trait: string): number => {
    return finalTraits[trait] || 0
  }

  if (!characterData.guardRank.rank) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a Guard Rank first to continue with trait selection.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mouse Traits</h3>
        <p className="text-gray-600 mb-6">
          Traits describe the personality quirks and special qualities that guardmice possess. You can choose a variety
          of traits or choose the same trait multiple times to increase its level.
        </p>
      </div>

      {/* Trait Levels Explanation */}
      <div className="border p-4 rounded-lg bg-blue-50 border-blue-200">
        <h4 className="font-medium mb-2 text-blue-800">Trait Levels</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>Level 1:</strong> +1D once per session when the trait is useful
          </p>
          <p>
            <strong>Level 2:</strong> +1D for two rolls per session
          </p>
          <p>
            <strong>Level 3:</strong> +1s to all rolls related to the trait
          </p>
        </div>
      </div>

      {/* Existing Traits from Previous Steps */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-800">Traits from Previous Steps</h4>
        <div className="space-y-2 text-sm">
          {characterData.mouseNature.selectedTrait && (
            <p>
              <span className="font-medium text-green-700">Mouse Nature:</span>{" "}
              {characterData.mouseNature.selectedTrait}
            </p>
          )}
          {characterData.hometown.trait && (
            <p>
              <span className="font-medium text-green-700">Hometown:</span> {characterData.hometown.trait}
            </p>
          )}
          {!characterData.mouseNature.selectedTrait && !characterData.hometown.trait && (
            <p className="text-gray-500">No traits selected from previous steps</p>
          )}
        </div>
      </div>

      {/* Born With Trait */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700">Choose a Quality You Were Born With</h4>
        <p className="text-sm text-gray-600 mb-4">
          All players get one trait from this list. You can reinforce your hometown trait if it's available, or pick
          something new.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {BORN_WITH_TRAITS.map((trait) => (
            <TraitButton
              key={trait}
              trait={trait}
              isSelected={characterData.traits.bornWith === trait}
              onClick={() => updateTrait("bornWith", trait)}
              currentLevel={getTraitLevel(trait)}
            />
          ))}
        </div>
      </div>

      {/* Parental Inheritance (Tenderpaws Only) */}
      {isTenderpaw && (
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-green-700">Something You Learned or Inherited from Your Parents</h4>
          <p className="text-sm text-gray-600 mb-4">This is for tenderpaws only. Take one trait from this list.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {PARENTAL_TRAITS.map((trait) => (
              <TraitButton
                key={trait}
                trait={trait}
                isSelected={characterData.traits.parentalInheritance === trait}
                onClick={() => updateTrait("parentalInheritance", trait)}
                currentLevel={getTraitLevel(trait)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Life on the Road (Patrol Leaders and Guard Captains Only) */}
      {isPatrolLeaderOrCaptain && (
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-purple-700">Life on the Road</h4>
          <p className="text-sm text-gray-600 mb-4">
            Patrol leaders and guard captains may choose a trait that represents a lesson learned during their tenure in
            the Guard.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {LIFE_ON_ROAD_TRAITS.map((trait) => (
              <TraitButton
                key={trait}
                trait={trait}
                isSelected={characterData.traits.lifeOnTheRoad === trait}
                onClick={() => updateTrait("lifeOnTheRoad", trait)}
                currentLevel={getTraitLevel(trait)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Final Traits Summary */}
      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Your Character's Traits</h4>
        {Object.keys(finalTraits).length > 0 ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="space-y-2">
              {Object.entries(finalTraits)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([trait, level]) => (
                  <div key={trait} className="flex justify-between items-center">
                    <span className="font-medium text-green-800">{trait}</span>
                    <span className="text-green-700">
                      Level {level}
                      {level === 1 && " (+1D once per session)"}
                      {level === 2 && " (+1D twice per session)"}
                      {level === 3 && " (+1s to all related rolls)"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No traits selected yet</p>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Traits can be increased to higher levels by selecting the same trait multiple times
              from different sources.
            </p>
          </div>

          <Button onClick={confirmTraits} className="bg-blue-600 text-white hover:bg-blue-700">
            Confirm Traits
          </Button>
        </div>

        {characterData.traits.finalTraits && Object.keys(characterData.traits.finalTraits).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">✓ Traits confirmed and saved!</p>
          </div>
        )}
      </div>
    </div>
  )
}
