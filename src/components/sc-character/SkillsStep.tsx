"use client"

import { useState, useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCCharacter } from "@/db/schema/sc-character"
import { SCSkill } from "@/db/schema/sc-skills"
import { getAllSkills } from "@/app/actions/sc-skills"

interface SkillsStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

export function SkillsStep({ data, onUpdate }: SkillsStepProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [allSkills, setAllSkills] = useState<SCSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSkills = async () => {
      const result = await getAllSkills()
      if (result.success && result.skills) {
        setAllSkills(result.skills)
      }
      setIsLoading(false)
    }
    fetchSkills()
  }, [])

  const skills = useMemo(() => {
    if (data.skills && Object.keys(data.skills).length > 0) {
      return data.skills
    }
    return {}
  }, [data.skills])

  const handleSkillChange = (skillId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    onUpdate({
      skills: {
        ...skills,
        [skillId]: numValue,
      },
    })
  }

  const skillsByCategory = useMemo(() => {
    return allSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = []
        }
        acc[skill.category].push(skill)
        return acc
      },
      {} as Record<string, SCSkill[]>,
    )
  }, [allSkills])

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return skillsByCategory

    const filtered: Record<string, SCSkill[]> = {}
    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      const matchingSkills = categorySkills.filter((skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills
      }
    })
    return filtered
  }, [searchTerm, skillsByCategory])

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading skills...</div>
  }

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

      <Tabs defaultValue={Object.keys(skillsByCategory)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.keys(skillsByCategory).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(filteredCategories).map(([category, categorySkills]) => (
          <TabsContent key={category} value={category} className="space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {categorySkills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={skill.id} className="text-sm block mb-1">
                          {skill.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {skill.ability}
                        </Badge>
                      </div>
                      <Input
                        id={skill.id}
                        type="number"
                        min="0"
                        max="10"
                        value={skills[skill.id] || 0}
                        onChange={(e) => handleSkillChange(skill.id, e.target.value)}
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
