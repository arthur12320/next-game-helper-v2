"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createDGCharacter } from "@/app/actions/dg-characters"
import { DEFAULT_DG_SKILLS, calcDerived } from "@/lib/dg-data"
import { DGCharacter } from "@/db/schema/dg-character"
import type { DGMoS } from "@/db/schema/dg-mos"
import { toast } from "sonner"
import { PersonalDataStep } from "./steps/PersonalDataStep"
import { StatsStep } from "./steps/StatsStep"
import { SkillsStep } from "./steps/SkillsStep"
import { BondsStep } from "./steps/BondsStep"
import { MotivationsStep } from "./steps/MotivationsStep"
import { FinalizeStep } from "./steps/FinalizeStep"

const STEPS = [
  { id: 1, title: "Personal Data", description: "Identity and background" },
  { id: 2, title: "Statistics", description: "Distribute 72 points" },
  { id: 3, title: "Skills", description: "MoS skills and bonus points" },
  { id: 4, title: "Bonds", description: "Vital relationships" },
  { id: 5, title: "Motivations", description: "What drives your agent" },
  { id: 6, title: "Finalize", description: "Review and create" },
]

interface DGCharacterCreationWizardProps {
  mosList: DGMoS[]
}

export function DGCharacterCreationWizard({ mosList }: DGCharacterCreationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bonusSelections, setBonusSelections] = useState<Record<string, number>>({})
  const [typedSkills, setTypedSkills] = useState<Record<string, number>>({})
  const [statsValid, setStatsValid] = useState(true)

  const defaultMoS = mosList[0]?.name ?? ""
  const defaultMoSSkills = mosList[0]?.skills ?? {}

  const [characterData, setCharacterData] = useState<Partial<DGCharacter>>({
    name: "New Agent",
    profession: defaultMoS,
    nationality: "American",
    sex: "",
    age: "",
    employer: "",
    educationHistory: "",
    physicalDescription: "",
    stats: { STR: 10, CON: 10, DEX: 10, INT: 10, POW: 10, CHA: 12 },
    skills: { ...DEFAULT_DG_SKILLS, ...defaultMoSSkills },
    bonds: [],
    motivations: [],
  })

  const updateCharacterData = useCallback((updates: Partial<DGCharacter>) => {
    setCharacterData((prev) => {
      // If MoS changed, reset bonus selections and recompute base skills (keep typedSkills)
      if (updates.profession !== undefined && updates.profession !== prev.profession) {
        const newMoS = mosList.find((m) => m.name === updates.profession)
        const newMoSSkills = newMoS?.skills ?? {}
        setBonusSelections({})
        return {
          ...prev,
          ...updates,
          skills: { ...DEFAULT_DG_SKILLS, ...newMoSSkills, ...typedSkills },
        }
      }
      return { ...prev, ...updates }
    })
  }, [mosList, typedSkills])

  const handleAddTypedSkill = useCallback((name: string) => {
    setTypedSkills((prev) => {
      if (name in prev) return prev
      const next = { ...prev, [name]: 0 }
      return next
    })
  }, [])

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep((p) => p + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const stats = characterData.stats!
      const derived = calcDerived(stats)

      const result = await createDGCharacter({
        ...characterData,
        derivedMax: derived,
        derivedCurrent: { HP: derived.HP, WP: derived.WP, SAN: derived.SAN },
      })

      if (result.success && result.character) {
        toast("Agent Created!", {
          description: `${result.character.name} is ready for operations.`,
        })
        router.push(`/dg-characters/${result.character.id}/play`)
      } else {
        toast.error("Error", { description: result.error || "Failed to create agent" })
      }
    } catch {
      toast.error("Error", { description: "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMoSBonds =
    mosList.find((m) => m.name === characterData.profession)?.bonds ?? 3

  const isNextDisabled = isSubmitting || (currentStep === 2 && !statsValid)

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
          {currentStep === 1 && (
            <PersonalDataStep
              data={characterData}
              onUpdate={updateCharacterData}
              mosList={mosList}
            />
          )}
          {currentStep === 2 && (
            <StatsStep
              data={characterData}
              onUpdate={updateCharacterData}
              onValidityChange={setStatsValid}
            />
          )}
          {currentStep === 3 && (
            <SkillsStep
              onUpdate={updateCharacterData}
              bonusSelections={bonusSelections}
              onBonusChange={setBonusSelections}
              mosList={mosList}
              selectedMoS={characterData.profession ?? ""}
              typedSkills={typedSkills}
              onAddTypedSkill={handleAddTypedSkill}
            />
          )}
          {currentStep === 4 && (
            <BondsStep
              data={characterData}
              onUpdate={updateCharacterData}
              mosBonds={selectedMoSBonds}
            />
          )}
          {currentStep === 5 && <MotivationsStep data={characterData} onUpdate={updateCharacterData} />}
          {currentStep === 6 && <FinalizeStep data={characterData} />}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          Back
        </Button>
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={isNextDisabled}>
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
