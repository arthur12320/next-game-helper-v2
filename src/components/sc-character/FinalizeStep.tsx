/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCCharacter } from "@/db/schema/sc-character"

interface FinalizeStepProps {
  data: Partial<SCCharacter>
}

export function FinalizeStep({ data }: FinalizeStepProps) {
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
            <div className="flex flex-wrap gap-2">
              {topSkills.map(([skill, value]) => (
                <Badge key={skill} variant="secondary">
                  {skill}: {value}
                </Badge>
              ))}
            </div>
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
                <span>{data.homeworld}</span>
              </div>
            )}
            {data.upbringing && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upbringing:</span>
                <span>{data.upbringing}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
