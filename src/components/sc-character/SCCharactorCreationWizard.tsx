"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createSCCharacter } from "@/app/actions/sc-characters"
import { BasicInfoStep } from "./BasicInfoStep"
import { AbilitiesStep } from "./AbilitiesStep"
import { BackgroundStep } from "./BackgroundStep"
import { FinalizeStep } from "./FinalizeStep"
import { SCCharacter } from "@/db/schema/sc-character"
import { SkillsStep } from "./SkillsStep"
import { toast } from "sonner"

type CharacterData = Partial<SCCharacter>

const STEPS = [
  { id: 1, title: "Basic Info", description: "Name and concept" },
  { id: 2, title: "Abilities", description: "Core attributes" },
  { id: 3, title: "Skills", description: "Learned capabilities" },
  { id: 4, title: "Background", description: "History and development" },
  { id: 5, title: "Finalize", description: "Review and create" },
]

export function SCCharacterCreationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [characterData, setCharacterData] = useState<CharacterData>({
    name: "New Agent",
    pronouns: "",
    concept: "",
    abilities: {
      Will: 3,
      Health: 5,
      Resources: 1,
      Circles: 1,
      Mindchip: 1,
    },
    skills: {},
    homeworld: "",
    upbringing: "",
    lifepaths: [],
    beliefs: "",
    instincts: "",
    goals: "",
  })

  const updateCharacterData = useCallback((updates: Partial<CharacterData>) => {
    setCharacterData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await createSCCharacter(characterData)

      if (result.success && result.character) {
        toast("Agent Created!",{
          description: `${result.character.name} is ready for deployment.`,
        })
        router.push(`/sc-characters/${result.character.id}/play`)
      } else {
        toast.error("Error",{
          description: result.error || "Failed to create agent",
        })
      }
    } catch (error) {
      toast.error("Error",{
        description: "An unexpected error occurred",
      })  
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-6">
          {currentStep === 1 && <BasicInfoStep data={characterData} onUpdate={updateCharacterData} />}
          {currentStep === 2 && <AbilitiesStep data={characterData} onUpdate={updateCharacterData} />}
          {currentStep === 3 && <SkillsStep data={characterData} onUpdate={updateCharacterData} />}
          {currentStep === 4 && <BackgroundStep data={characterData} onUpdate={updateCharacterData} />}
          {currentStep === 5 && <FinalizeStep data={characterData} />}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          Back
        </Button>
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Agent"}
          </Button>
        )}
      </div>
    </div>
  )
}
