"use client"

import { useState, useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { SCCharacter } from "@/db/schema/sc-character"
import { SCSkill } from "@/db/schema/sc-skills"
import { getAllSkills } from "@/app/actions/sc-skills"
import { lifepaths as allLifepaths } from "@/lib/character-data"

const UNRESTRICTED_POINTS = 5 // 2 from homeworld, 3 from upbringing

interface SkillsStepProps {
  data: Partial<SCCharacter>
  onUpdate: (updates: Partial<SCCharacter>) => void
}

function LifepathSkills({
  lifepath,
  skillsData,
  allSkills,
  onSkillChange,
}: {
  lifepath: NonNullable<SCCharacter["lifepaths"]>[0]
  skillsData: Record<string, number> // skillName -> level
  allSkills: SCSkill[]
  onSkillChange: (skillId: string, value: number) => void
}) {
  const lifepathDetails = allLifepaths.find(lp => lp.name === lifepath.name)
  if (!lifepathDetails) return null

  const lifepathSkills = allSkills.filter(s =>
    lifepathDetails.skills.includes(s.name)
  )

  const pointsSpent = lifepathSkills.reduce(
    (acc, skill) => acc + (skillsData[skill.name] || 0),
    0
  )

  const pointsRemaining = 3 - pointsSpent

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{lifepath.name} Skills</CardTitle>
        <p className="text-sm text-muted-foreground">
          You have {pointsRemaining} points to spend on these skills.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {lifepathSkills.map(skill => (
          <div key={skill.id} className="flex items-center justify-between">
            <Label>{skill.name}</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  onSkillChange(skill.id, (skillsData[skill.name] || 0) - 1)
                }
                disabled={(skillsData[skill.name] || 0) <= 0}
              >
                -
              </Button>
              <Input
                type="number"
                readOnly
                value={skillsData[skill.name] || 0}
                className="w-12 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  onSkillChange(skill.id, (skillsData[skill.name] || 0) + 1)
                }
                disabled={pointsRemaining <= 0}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
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

  const skills = useMemo(() => data.skills || {}, [data.skills]) // skillName -> level

  const getSkillNameById = (skillId: string) =>
    allSkills.find(s => s.id === skillId)?.name

  const { restrictedSkillNames } = useMemo(() => {
    const names = new Set<string>()

    data.lifepaths?.forEach(lp => {
      const details = allLifepaths.find(d => d.name === lp.name)
      if (!details) return

      details.skills.forEach(skillName => {
        names.add(skillName)
      })
    })

    return { restrictedSkillNames: names }
  }, [data.lifepaths])

  const unrestrictedPointsSpent = useMemo(() => {
    return Object.entries(skills).reduce((acc, [skillName, value]) => {
      if (!restrictedSkillNames.has(skillName)) {
        return acc + value
      }
      return acc
    }, 0)
  }, [skills, restrictedSkillNames])

  const unrestrictedPointsRemaining =
    UNRESTRICTED_POINTS - unrestrictedPointsSpent

  const handleSkillChange = (skillId: string, value: number) => {
    const skillName = getSkillNameById(skillId)
    if (!skillName) return

    const clampedValue = Math.max(0, value)

    onUpdate({
      skills: {
        ...skills,
        [skillName]: clampedValue,
      },
    })
  }

  const skillsByCategory = useMemo(() => {
    const generalSkills = allSkills.filter(
      s => !restrictedSkillNames.has(s.name)
    )

    return generalSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, SCSkill[]>)
  }, [allSkills, restrictedSkillNames])

  const filteredSkillsByCategory = useMemo(() => {
    if (!searchTerm) return skillsByCategory

    const filtered: Record<string, SCSkill[]> = {}

    for (const category in skillsByCategory) {
      const matches = skillsByCategory[category].filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (matches.length > 0) {
        filtered[category] = matches
      }
    }

    return filtered
  }, [skillsByCategory, searchTerm])

  const defaultTab = Object.keys(filteredSkillsByCategory)[0]

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading skills...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {data.lifepaths?.map(lp => (
          <LifepathSkills
            key={lp.name}
            lifepath={lp}
            skillsData={skills}
            allSkills={allSkills}
            onSkillChange={handleSkillChange}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Skills</CardTitle>
          <p className="text-sm text-muted-foreground">
            You have {unrestrictedPointsRemaining} points to spend on any skill.
          </p>
        </CardHeader>
        <CardContent>
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for a skill..."
            className="mb-4"
          />

          {defaultTab ? (
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
                {Object.keys(filteredSkillsByCategory).map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(filteredSkillsByCategory).map(
                ([cat, catSkills]) => (
                  <TabsContent key={cat} value={cat} className="mt-4">
                    <div className="space-y-3">
                      {catSkills.map(skill => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <Label className="text-sm">{skill.name}</Label>
                            <Badge
                              variant="outline"
                              className="text-xs w-fit mt-1"
                            >
                              {skill.ability}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleSkillChange(
                                  skill.id,
                                  (skills[skill.name] || 0) - 1
                                )
                              }
                              disabled={(skills[skill.name] || 0) <= 0}
                            >
                              -
                            </Button>

                            <Input
                              type="number"
                              readOnly
                              value={skills[skill.name] || 0}
                              className="w-12 text-center"
                            />

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleSkillChange(
                                  skill.id,
                                  (skills[skill.name] || 0) + 1
                                )
                              }
                              disabled={unrestrictedPointsRemaining <= 0}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )
              )}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No skills found for &quot;{searchTerm}&quot;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
