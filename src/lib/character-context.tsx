"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface CharacterData {
  // Step 1: Homeworld
  homeworld?: {
    id: string
    name: string
    promptAnswer: string
  }

  // Step 2: Upbringing
  upbringing?: {
    id: string
    name: string
    promptAnswer: string
    npcRelationship: string
    will: number
    health: number
  }

  // Step 3: Lifepaths
  lifepaths: Array<{
    id: string
    name: string
    promptAnswer: string
  }>

  // Step 4: Beliefs & Instincts
  beliefs?: {
    belief: string
    instinct: string
  }

  // Step 5: Connections
  connections?: string[]
}

interface CharacterContextType {
  character: CharacterData
  updateCharacter: (data: Partial<CharacterData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacter] = useState<CharacterData>({
    lifepaths: [],
  })
  const [currentStep, setCurrentStep] = useState(1)

  const updateCharacter = (data: Partial<CharacterData>) => {
    setCharacter((prev) => ({ ...prev, ...data }))
  }

  return (
    <CharacterContext.Provider value={{ character, updateCharacter, currentStep, setCurrentStep }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  const context = useContext(CharacterContext)
  if (!context) {
    throw new Error("useCharacter must be used within CharacterProvider")
  }
  return context
}
