"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { SCCharacter } from "@/db/schema/sc-character"

interface SkillsStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

const SKILL_CATEGORIES = {
  "Crafting & Technical": [
    "Electronics",
    "Mechanics",
    "Engineering",
    "Computer",
    "Comms",
    "Gravitics",
    "Demolitions",
    "Screens",
  ],
  "Exploration & Survival": [
    "Athletics",
    "Zero-G",
    "Survival",
    "Recon",
    "Navigation",
    "Grav Vehicle",
    "Wheeled Vehicle",
    "Tracked Vehicle",
    "Riding",
    "Winged Aircraft",
    "Rotor Aircraft",
    "Motorboats",
    "Ocean Ships",
    "Sailing Ships",
    "Submarine",
    "Mole",
  ],
  "Social & Interpersonal": [
    "Leadership",
    "Instruction",
    "Barter",
    "Diplomacy",
    "Etiquette",
    "Streetwise",
    "Intimidation",
    "Deception",
    "Seduction",
    "Performance",
    "Empathy",
    "Willpower",
  ],
  "Lore & Knowledge": [
    "Ecology",
    "Genetics",
    "Botanics",
    "Zoology",
    "Mathematics",
    "Chemistry",
    "Geology",
    "Physics",
    "History",
    "Psychology",
    "Economics",
    "Sociology",
    "Astronomy",
    "First Aid",
    "Surgery",
    "Pharmacology",
    "Linguistics",
    "Military Strategy",
    "Combat Tactics",
    "Veterinary Medicine",
  ],
  Combat: [
    "Archery",
    "Bludgeoning Weapons",
    "Natural Weapons",
    "Piercing Weapons",
    "Slashing Weapons",
    "Shotgun",
    "Slug Pistol",
    "Slug Rifle",
    "Energy Pistol",
    "Energy Rifle",
    "Heavy Weapons",
    "Mounted Weapons",
    "Battle Dress",
  ],
}

export function SkillsStep({ data, onUpdate }: SkillsStepProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const skills = useMemo(() => {
    if (data.skills && Object.keys(data.skills).length > 0) {
      return data.skills
    }

    // Initialize with default values
    const defaultSkills: Record<string, number> = {}
    Object.values(SKILL_CATEGORIES)
      .flat()
      .forEach((skill) => {
        defaultSkills[skill] = 0
      })
    return defaultSkills
  }, [data.skills])

  const handleSkillChange = (skill: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    onUpdate({
      skills: {
        ...skills,
        [skill]: numValue,
      },
    })
  }

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return SKILL_CATEGORIES

    const filtered: Record<string, string[]> = {}
    Object.entries(SKILL_CATEGORIES).forEach(([category, categorySkills]) => {
      const matchingSkills = categorySkills.filter((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills
      }
    })
    return filtered
  }, [searchTerm])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="skill-search">Search Skills</Label>
        <Input
          id="skill-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to filter skills..."
        />
      </div>

      <Tabs defaultValue={Object.keys(SKILL_CATEGORIES)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.keys(SKILL_CATEGORIES).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category.split(" & ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(filteredCategories).map(([category, categorySkills]) => (
          <TabsContent key={category} value={category} className="space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {categorySkills.map((skill) => (
                <Card key={skill}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={skill} className="text-sm flex-1">
                        {skill}
                      </Label>
                      <Input
                        id={skill}
                        type="number"
                        min="0"
                        max="10"
                        value={skills[skill] || 0}
                        onChange={(e) => handleSkillChange(skill, e.target.value)}
                        className="w-16 text-center"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
