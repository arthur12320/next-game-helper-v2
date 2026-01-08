/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCCharacter } from "@/db/schema/sc-character"
import { getAllSkills } from "@/app/actions/sc-skills"
import { SCSkill } from "@/db/schema/sc-skills"
import { Skeleton } from "../ui/skeleton"

interface FinalizeStepProps {
  data: Partial<SCCharacter>
}

export function FinalizeStep({ data }: FinalizeStepProps) {
  const [skills, setSkills] = useState<SCSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSkills() {
      setIsLoading(true)
      const { skills: fetchedSkills, success } = await getAllSkills()
      if (success && fetchedSkills) {
        setSkills(fetchedSkills)
      }
      setIsLoading(false)
    }
    fetchSkills()
  }, [])

  const skillIdToNameMap = skills.reduce(
    (acc, skill) => {
      acc[skill.id] = skill.name
      return acc
    },
    {} as Record<string, string>
  )

  const topSkills = Object.entries(data.skills || {})
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-semibold">{data.name}</span>
          </div>
          {data.pronouns && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pronouns:</span>
              <span>{data.pronouns}</span>
            </div>
          )}
          {data.concept && (
            <div>
              <span className="text-muted-foreground">Concept:</span>
              <p className="mt-1 text-sm">{data.concept}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(data.abilities || {}).map(([ability, value]) => (
              <div key={ability} className="text-center p-3 bg-secondary/50 rounded">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{ability}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: topSkills.length }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topSkills.map(([skillId, value]) => (
                  <Badge key={skillId} variant="secondary">
                    {skillIdToNameMap[skillId] || skillId}: {value}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(data.homeworld || data.upbringing) && (
        <Card>
          <CardHeader>
            <CardTitle>Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.homeworld && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Homeworld:</span>
                <span>{data.homeworld.name}</span>
              </div>
            )}
            {data.upbringing && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upbringing:</span>
                <span>{data.upbringing.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
