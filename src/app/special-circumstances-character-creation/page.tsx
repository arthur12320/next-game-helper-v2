"use client"

import { CharacterProvider, useCharacter } from "@/lib/character-context"
import { Step1Homeworld } from "./components/step-1-homeworld"
import { Step2Upbringing } from "./components/step-2-upbringing"
import { Step3Lifepaths } from "./components/step-3-lifepaths"
import { Step4Beliefs } from "./components/step-4-beliefs"
import { Step5Connections } from "./components/step-5-connections"
import { StepIndicator } from "./components/step-indicator"


function CharacterGeneratorContent() {
  const { currentStep } = useCharacter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">Special Circumstances</h1>
          <p className="text-lg text-muted-foreground text-pretty">Character Generator</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={5} />

        <div className="mt-8">
          {currentStep === 1 && <Step1Homeworld />}
          {currentStep === 2 && <Step2Upbringing />}
          {currentStep === 3 && <Step3Lifepaths />}
          {currentStep === 4 && <Step4Beliefs />}
          {currentStep === 5 && <Step5Connections />}
        </div>
      </div>
    </div>
  )
}

export default function CharacterGenerator() {
  return (
    <CharacterProvider>
      <CharacterGeneratorContent />
    </CharacterProvider>
  )
}
