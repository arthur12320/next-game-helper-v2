"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

interface CharacterData {
  concept: any
  guardRank: any
  skillChoices: any
  hometown: any
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
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface MouseNatureStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const WINTER_TRAITS = ["Bold", "Generous", "Impetuous"]
const PREDATOR_TRAITS = ["Fearless", "Brave", "Foolish"]

export default function MouseNatureStep({ characterData, updateCharacterData }: MouseNatureStepProps) {
  const updateNatureChoice = (field: string, value: boolean) => {
    let newNature = characterData.mouseNature.baseNature
    let availableTraits: string[] = []
    let fighterReduction = false

    // Calculate nature and available traits based on all choices
    const choices = {
      ...characterData.mouseNature,
      [field]: value,
    }

    // Winter saving question
    if (choices.winterSaving) {
      newNature += 1
    } else {
      availableTraits = [...availableTraits, ...WINTER_TRAITS]
    }

    // Confrontation question
    if (!choices.confrontation) {
      newNature += 1
      fighterReduction = true
    }

    // Fear predators question
    if (choices.fearPredators) {
      newNature += 1
    } else {
      availableTraits = [...availableTraits, ...PREDATOR_TRAITS]
    }

    updateCharacterData("mouseNature", {
      ...characterData.mouseNature,
      [field]: value,
      finalNature: newNature,
      availableTraits,
      fighterReduction,
      // Reset selected trait if it's no longer available
      selectedTrait: availableTraits.includes(characterData.mouseNature.selectedTrait)
        ? characterData.mouseNature.selectedTrait
        : "",
    })
  }

  const selectTrait = (trait: string) => {
    updateCharacterData("mouseNature", {
      ...characterData.mouseNature,
      selectedTrait: trait,
    })
  }

  const QuestionCard = ({
    title,
    question,
    yesText,
    noText,
    yesEffect,
    noEffect,
    value,
    onChange,
  }: {
    title: string
    question: string
    yesText: string
    noText: string
    yesEffect: string
    noEffect: string
    value: boolean | null
    onChange: (value: boolean) => void
  }) => (
    <div className="border p-4 rounded-lg">
      <h4 className="font-medium mb-3 text-blue-700">{title}</h4>
      <p className="text-gray-700 mb-4">{question}</p>

      <div className="grid md:grid-cols-2 gap-3">
        <button
          onClick={() => onChange(true)}
          className={`p-3 border rounded-lg text-left transition-all ${
            value === true
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="font-medium mb-1">{yesText}</div>
          <div className="text-sm text-gray-600">{yesEffect}</div>
        </button>

        <button
          onClick={() => onChange(false)}
          className={`p-3 border rounded-lg text-left transition-all ${
            value === false
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="font-medium mb-1">{noText}</div>
          <div className="text-sm text-gray-600">{noEffect}</div>
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mouse Nature</h3>
        <p className="text-gray-600 mb-6">
          All characters have a base Nature of 3. Answer the following three questions to determine your final starting
          Nature score. The choices will limit some of your skill and trait choices later.
        </p>
      </div>

      {/* Base Nature Display */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-2">Current Nature Score</h4>
        <div className="text-2xl font-bold text-blue-600">Base: 3 → Final: {characterData.mouseNature.finalNature}</div>
      </div>

      {/* Question 1: Winter Saving */}
      <QuestionCard
        title="Winter Preparation"
        question="Do you save for winter even if it means going without something now? Or do you use what you have when you need it?"
        yesText="Save for Winter"
        noText="Use What You Have"
        yesEffect="Increase Nature by 1"
        noEffect="May take Bold, Generous, or Impetuous trait"
        value={characterData.mouseNature.winterSaving}
        onChange={(value) => updateNatureChoice("winterSaving", value)}
      />

      {/* Question 2: Confrontation */}
      <QuestionCard
        title="When Confronted"
        question="When confronted, do you stand your ground and fight or do you run and hide?"
        yesText="Stand and Fight"
        noText="Run and Hide"
        yesEffect="Leave Fighter and Nature as they are"
        noEffect="Increase Nature by 1, decrease Fighter skill by 1"
        value={characterData.mouseNature.confrontation}
        onChange={(value) => updateNatureChoice("confrontation", value)}
      />

      {/* Question 3: Fear Predators */}
      <QuestionCard
        title="Fear of Predators"
        question="Do you fear owls, weasels and wolves?"
        yesText="Yes, I Fear Them"
        noText="No, I Don't Fear Them"
        yesEffect="Increase Nature by 1"
        noEffect="Take Fearless, Brave, or Foolish trait"
        value={characterData.mouseNature.fearPredators}
        onChange={(value) => updateNatureChoice("fearPredators", value)}
      />

      {/* Available Traits Selection */}
      {characterData.mouseNature.availableTraits.length > 0 && (
        <div className="border p-4 rounded-lg bg-green-50 border-green-200">
          <h4 className="font-medium mb-3 text-green-800">Available Traits</h4>
          <p className="text-sm text-green-700 mb-4">
            Based on your choices, you may select one of the following traits at level 1:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {characterData.mouseNature.availableTraits.map((trait) => (
              <button
                key={trait}
                onClick={() => selectTrait(trait)}
                className={`p-2 text-sm border rounded transition-colors ${
                  characterData.mouseNature.selectedTrait === trait
                    ? "border-green-500 bg-green-100 text-green-700"
                    : "border-green-300 hover:bg-green-100"
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Effects Summary */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Summary of Effects</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Final Nature Score:</span>
            <span className="text-blue-600">{characterData.mouseNature.finalNature}</span>
          </div>

          {characterData.mouseNature.selectedTrait && (
            <div className="flex justify-between">
              <span className="font-medium">Selected Trait:</span>
              <span className="text-green-600">{characterData.mouseNature.selectedTrait}</span>
            </div>
          )}

          {characterData.mouseNature.fighterReduction && (
            <div className="flex justify-between">
              <span className="font-medium">Fighter Skill:</span>
              <span className="text-red-600">Reduced by 1 (if you have it)</span>
            </div>
          )}
        </div>

        {characterData.mouseNature.finalNature > 3 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Higher Nature scores make it easier to survive in the wild but harder to work with
              other mice in civilized settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
