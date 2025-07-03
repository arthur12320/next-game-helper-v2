/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"


import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface CharacterData {
  concept: {
    description: string
    personality: string
    specialty: string
  }
  guardRank: {
    rank: string
    age: number
    abilities: { will: number; health: number }
    skills: Record<string, number>
    birthYear: number
  }
  name: string
  furColor: string
  parentNames: { mother: string; father: string }
  relationships: any
}

interface ConceptStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const CONCEPT_EXAMPLES = [
  {
    title: "Grizzled Veteran",
    description: "A battle-scarred mouse who has seen many seasons of conflict",
    personality: "Stoic, wise, protective of younger mice",
    specialty: "Combat tactics and survival",
  },
  {
    title: "Young Upstart",
    description: "An eager young mouse ready to prove themselves",
    personality: "Enthusiastic, brave, sometimes reckless",
    specialty: "Quick thinking and agility",
  },
  {
    title: "Reluctant Fighter",
    description: "A tough mouse who can fight but prefers peaceful solutions",
    personality: "Strong but gentle, diplomatic, conflicted about violence",
    specialty: "Negotiation and defensive combat",
  },
  {
    title: "Scholar Warrior",
    description: "A learned mouse who combines knowledge with martial skill",
    personality: "Thoughtful, strategic, values wisdom over brute force",
    specialty: "Lore and tactical planning",
  },
  {
    title: "Wilderness Expert",
    description: "A mouse who knows the wild territories like the back of their paw",
    personality: "Independent, observant, comfortable in nature",
    specialty: "Pathfinding and survival skills",
  },
  {
    title: "Inspiring Leader",
    description: "A charismatic mouse who others naturally follow",
    personality: "Confident, caring, leads by example",
    specialty: "Motivation and team coordination",
  },
]

export default function ConceptStep({ characterData, updateCharacterData }: ConceptStepProps) {
  const updateConcept = (field: string, value: string) => {
    const updatedConcept = {
      ...characterData.concept,
      [field]: value,
    }
    updateCharacterData("concept", updatedConcept)
  }

  const selectExample = (example: (typeof CONCEPT_EXAMPLES)[0]) => {
    updateCharacterData("concept", {
      description: example.description,
      personality: example.personality,
      specialty: example.specialty,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Define your character concept</h3>
        <p className="text-gray-600 mb-6">
          {`Before we start, think about what kind of character you want to play in the world of Mouse Guard. What's their
          personality like? What's their specialty? You can use one of the examples below or create your own unique
          concept.`}
        </p>
      </div>

      {/* Example Concepts */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3">Example Concepts</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {CONCEPT_EXAMPLES.map((example, index) => (
            <button
              key={index}
              onClick={() => selectExample(example)}
              className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h5 className="font-medium text-blue-700 mb-1">{example.title}</h5>
              <p className="text-sm text-gray-600 mb-1">{example.description}</p>
              <p className="text-xs text-gray-500">Specialty: {example.specialty}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Concept Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Character Description</label>
          <Textarea
            placeholder="e.g., A tough guardmouse who's a fighter but doesn't like fighting..."
            value={characterData.concept.description}
            onChange={(e) => updateConcept("description", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">Describe the overall concept and background of your character</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
          <Textarea
            placeholder="e.g., Brave but conflicted, prefers to solve problems without violence, protective of others..."
            value={characterData.concept.personality}
            onChange={(e) => updateConcept("personality", e.target.value)}
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">{`What is your character's personality and temperament?`}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
          <Input
            placeholder="e.g., Combat and protection, Scouting and stealth, Diplomacy and negotiation..."
            value={characterData.concept.specialty}
            onChange={(e) => updateConcept("specialty", e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">What is your character particularly good at or known for?</p>
        </div>
      </div>

      {/* Current Concept Summary */}
      {(characterData.concept.description || characterData.concept.personality || characterData.concept.specialty) && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Your Character Concept</h4>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            {characterData.concept.description && (
              <p className="text-sm">
                <span className="font-medium">Description:</span> {characterData.concept.description}
              </p>
            )}
            {characterData.concept.personality && (
              <p className="text-sm">
                <span className="font-medium">Personality:</span> {characterData.concept.personality}
              </p>
            )}
            {characterData.concept.specialty && (
              <p className="text-sm">
                <span className="font-medium">Specialty:</span> {characterData.concept.specialty}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
