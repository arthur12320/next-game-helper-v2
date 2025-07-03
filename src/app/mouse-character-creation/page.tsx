/* eslint-disable @typescript-eslint/no-explicit-any */
 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import ConceptStep from "./components/ConceptStep"
import GuardRankStep from "./components/GuardRankStep"
import SkillsStep from "./components/SkillsStep"
import HometownStep from "./components/HometownStep"
import MouseNatureStep from "./components/MouseNatureStep"
import WisesStep from "./components/WisesStep"
import ResourcesStep from "./components/ResourcesStep"
import TraitsStep from "./components/TraitsStep"
import NameStep from "./components/NameStep"
import FurColorStep from "./components/FurColorStep"
import ParentsStep from "./components/ParentsStep"
import RelationshipsStep from "./components/RelationshipsStep"
import SummaryStep from "./components/SummaryStep"
import FinishingTouchesStep from "./components/FinishingTouchesStep"

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
  skillChoices: {
    naturalTalent: string[]
    parentsTradeSkill: string
    persuasionSkill: string[]
    apprenticeshipSkill: string
    mentorSkill: string[]
    specialty: string
    finalSkills: Record<string, number>
  }
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
  wises: {
    count: number
    selectedWises: string[]
    customWises: string[]
  }
  resources: {
    resourcesRating: number
    circlesRating: number
  }
  traits: {
    bornWith: string
    parentalInheritance: string
    lifeOnTheRoad: string
    finalTraits: Record<string, number>
  }
  name: string
  furColor: string
  parentNames: {
    mother: string
    father: string
  }
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

const STEPS = [
  { id: "concept", title: "Concept", description: "Define your character's core concept and personality" },
  { id: "guard-rank", title: "Guard Rank", description: "Choose your character's rank and experience level" },
  { id: "skills", title: "Skills", description: "Develop your character's skills and abilities" },
  { id: "hometown", title: "Hometown", description: "Choose where your character was born" },
  { id: "mouse-nature", title: "Mouse Nature", description: "Determine your character's nature score" },
  { id: "wises", title: "Wises", description: "Choose your character's areas of knowledge" },
  { id: "resources", title: "Resources", description: "Set your character's resources and connections" },
  { id: "traits", title: "Traits", description: "Select your character's personality traits" },
  { id: "name", title: "Name", description: "Choose a name for your character" },
  { id: "fur-color", title: "Fur Color", description: "Select your mouse's fur color" },
  { id: "parents", title: "Parents", description: "Name your character's parents" },
  { id: "relationships", title: "Relationships", description: "Define your character's connections" },
  { id: "finishing-touches", title: "Finishing Touches", description: "Complete your character with final details" },
  { id: "summary", title: "Summary", description: "Review your character" },
]

export default function MouseCharacterCreation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [characterData, setCharacterData] = useState<CharacterData>({
    concept: {
      description: "",
      personality: "",
      specialty: "",
    },
    guardRank: {
      rank: "",
      age: 0,
      abilities: {
        will: 0,
        health: 0,
      },
      skills: {},
      birthYear: 0,
    },
    skillChoices: {
      naturalTalent: [],
      parentsTradeSkill: "",
      persuasionSkill: [],
      apprenticeshipSkill: "",
      mentorSkill: [],
      specialty: "",
      finalSkills: {},
    },
    hometown: {
      city: "",
      trait: "",
      skill: "",
    },
    mouseNature: {
      baseNature: 3,
      finalNature: 3,
      winterSaving: false,
      confrontation: false,
      fearPredators: false,
      availableTraits: [],
      selectedTrait: "",
      fighterReduction: false,
    },
    wises: {
      count: 0,
      selectedWises: [],
      customWises: [],
    },
    resources: {
      resourcesRating: 0,
      circlesRating: 0,
    },
    traits: {
      bornWith: "",
      parentalInheritance: "",
      lifeOnTheRoad: "",
      finalTraits: {},
    },
    name: "",
    furColor: "",
    parentNames: {
      mother: "",
      father: "",
    },
    relationships: {
      seniorArtisan: {
        name: "",
        profession: "",
      },
      mentor: {
        name: "",
        type: "",
        location: "",
      },
      friend: {
        name: "",
        profession: "",
        location: "",
        background: "",
      },
      enemy: {
        name: "",
        profession: "",
        location: "",
        background: "",
      },
    },
    finishingTouches: {
      cloakColor: "",
      cloakReason: "",
      belief: "",
      goal: "",
      instinct: "",
      weapon: "",
      additionalGear: [],
      fatePoints: 1,
      personaPoints: 1,
    },
  })

  const updateCharacterData = (field: string, value: any) => {
    setCharacterData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case "concept":
        return <ConceptStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "guard-rank":
        return <GuardRankStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "skills":
        return <SkillsStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "hometown":
        return <HometownStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "mouse-nature":
        return <MouseNatureStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "wises":
        return <WisesStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "resources":
        return <ResourcesStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "traits":
        return <TraitsStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "name":
        return <NameStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "fur-color":
        return <FurColorStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "parents":
        return <ParentsStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "relationships":
        return <RelationshipsStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "finishing-touches":
        return <FinishingTouchesStep characterData={characterData} updateCharacterData={updateCharacterData} />
      case "summary":
        return <SummaryStep characterData={characterData} />
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mouse Character Creation</h1>
        <p className="text-gray-600">Create your unique mouse character step by step</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{STEPS[currentStep].title}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex justify-center space-x-2">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                index === currentStep
                  ? "bg-blue-600 text-white"
                  : index < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
              title={step.title}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="border p-6 rounded-lg shadow mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{STEPS[currentStep].title}</h2>
          <p className="text-gray-600">{STEPS[currentStep].description}</p>
        </div>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  )
}

// 🦴 Skeleton Loader
MouseCharacterCreation.Skeleton = function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>

      <div className="mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="flex space-x-2 mb-6">
          {[...Array(13)].map((_, i) => (
            <div key={i} className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>

      <div className="border p-6 rounded-lg shadow mb-8 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>

      <div className="flex justify-between">
        <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  )
}
