"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react"
import { Input } from "@/components/ui/input"

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
  name: string
  furColor: string
  parentNames: { mother: string; father: string }
  relationships: any
}

interface GuardRankStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const GUARD_RANKS = [
  {
    rank: "Tenderpaw",
    description: "Fresh recruits to the Mouse Guard",
    abilities: { will: 2, health: 6 },
    skills: { Pathfinder: 2, Scout: 2, Laborer: 2 },
    ageRange: "14-17",
    birthYears: "1135-1138",
    notes: "If a tenderpaw is played, one of the other players must be their mentor.",
  },
  {
    rank: "Guardmouse",
    description: "The foot soldiers of the Guard",
    abilities: { will: 3, health: 5 },
    skills: { Fighter: 3, Haggler: 2, Scout: 2, Pathfinder: 3, Survivalist: 2 },
    ageRange: "18-25",
    birthYears: "1127-1134",
    notes: "The standard rank for most Guard characters.",
  },
  {
    rank: "Patrol Guard",
    description: "Veteran guardmice responsible for complicated or independent missions",
    abilities: { will: 4, health: 4 },
    skills: {
      Cook: 2,
      Fighter: 3,
      Hunter: 3,
      Scout: 2,
      Healer: 2,
      Pathfinder: 2,
      Survivalist: 2,
      "Weather Watcher": 2,
    },
    ageRange: "21-50",
    birthYears: "1102-1131",
    notes: "Experienced mice with specialized skills.",
  },
  {
    rank: "Patrol Leader",
    description: "Patrol guards who have demonstrated independent thinking and leadership",
    abilities: { will: 5, health: 4 },
    skills: {
      Fighter: 3,
      Hunter: 3,
      Instructor: 2,
      Loremouse: 2,
      Persuader: 2,
      Pathfinder: 3,
      Scout: 2,
      Survivalist: 3,
      "Weather Watcher": 2,
    },
    ageRange: "21-60",
    birthYears: "1092-1131",
    notes: "Except for special circumstances, there can only be one patrol leader player in your group.",
  },
  {
    rank: "Guard Captain",
    description: "Powerful mice appointed to the highest rank due to longstanding service and exemplary valor",
    abilities: { will: 6, health: 3 },
    skills: {
      Administrator: 3,
      Fighter: 3,
      Healer: 2,
      Hunter: 3,
      Instructor: 2,
      Militarist: 3,
      Orator: 2,
      Pathfinder: 3,
      Scout: 3,
      Survivalist: 3,
      "Weather Watcher": 3,
    },
    ageRange: "41-60",
    birthYears: "1092-1111",
    notes: "Guard captains are rare and may only be played at the discretion of the group. Only one per group.",
  },
]

export default function GuardRankStep({ characterData, updateCharacterData }: GuardRankStepProps) {
  const [selectedAge, setSelectedAge] = useState(characterData.guardRank.age || "")

  const selectRank = (rankData: (typeof GUARD_RANKS)[0]) => {
    const currentYear = 1152 // Assuming current game year
    const birthYear = currentYear - (selectedAge ? Number.parseInt(selectedAge.toString()) : 20)

    updateCharacterData("guardRank", {
      rank: rankData.rank,
      age: selectedAge ? Number.parseInt(selectedAge.toString()) : 20,
      abilities: rankData.abilities,
      skills: rankData.skills,
      birthYear: birthYear,
    })
  }

  const updateAge = (age: string) => {
    setSelectedAge(age)
    if (characterData.guardRank.rank) {
      const currentYear = 1152
      const birthYear = currentYear - Number.parseInt(age)
      updateCharacterData("guardRank", {
        ...characterData.guardRank,
        age: Number.parseInt(age),
        birthYear: birthYear,
      })
    }
  }

  const selectedRank = GUARD_RANKS.find((r) => r.rank === characterData.guardRank.rank)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose your Guard Rank</h3>
        <p className="text-gray-600 mb-6">
          What level of experience or rank would you like to play? Each rank has different abilities, skills, and
          responsibilities. Choose carefully as this will define your character's capabilities.
        </p>
      </div>

      {/* Age Input */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3">Character Age</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Enter age..."
              value={selectedAge}
              onChange={(e) => updateAge(e.target.value)}
              min="14"
              max="60"
            />
          </div>
          <div className="text-sm text-gray-600">
            {selectedAge && (
              <span>
                Birth Year: {1152 - Number.parseInt(selectedAge.toString())} (Age {selectedAge} in 1152)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rank Selection */}
      <div className="space-y-4">
        {GUARD_RANKS.map((rank) => {
          const isSelected = characterData.guardRank.rank === rank.rank
          const [minAge, maxAge] = rank.ageRange.split("-").map(Number)
          const ageInRange = selectedAge
            ? Number.parseInt(selectedAge.toString()) >= minAge && Number.parseInt(selectedAge.toString()) <= maxAge
            : true

          return (
            <button
              key={rank.rank}
              onClick={() => selectRank(rank)}
              disabled={selectedAge as unknown as boolean && !ageInRange}
              className={`w-full text-left p-4 border rounded-lg transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : selectedAge && !ageInRange
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>{rank.rank}</h4>
                <div className="text-right text-sm">
                  <div className={selectedAge && !ageInRange ? "text-red-600" : "text-gray-600"}>
                    Age: {rank.ageRange}
                  </div>
                  <div className="text-gray-500">({rank.birthYears})</div>
                </div>
              </div>

              <p className="text-gray-600 mb-3">{rank.description}</p>

              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Abilities</h5>
                  <div className="text-sm text-gray-600">
                    Will: {rank.abilities.will}, Health: {rank.abilities.health}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-1">Skills</h5>
                  <div className="text-sm text-gray-600">
                    {Object.entries(rank.skills)
                      .map(([skill, level]) => `${skill} ${level}`)
                      .join(", ")}
                  </div>
                </div>
              </div>

              {rank.notes && (
                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Note:</strong> {rank.notes}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Special Rules */}
      <div className="border p-4 rounded-lg bg-yellow-50 border-yellow-200">
        <h4 className="font-medium mb-2 text-yellow-800">Special Rules</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• In groups of four players, there can be two patrol leaders if the other two are tenderpaws</li>
          <li>• If a tenderpaw is played, one other player must be their mentor</li>
          <li>• Guard captains require group discretion and only one is allowed per group</li>
        </ul>
      </div>

      {/* Current Selection Summary */}
      {selectedRank && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Your Character Stats</h4>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium text-green-800">Rank & Age</h5>
                <p className="text-sm text-green-700">
                  {selectedRank.rank}
                  {selectedAge && ` (Age ${selectedAge})`}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-green-800">Abilities</h5>
                <p className="text-sm text-green-700">
                  Will: {selectedRank.abilities.will}, Health: {selectedRank.abilities.health}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-green-800">Birth Year</h5>
                <p className="text-sm text-green-700">{characterData.guardRank.birthYear}</p>
              </div>
            </div>
            <div className="mt-3">
              <h5 className="font-medium text-green-800">Starting Skills</h5>
              <p className="text-sm text-green-700">
                {Object.entries(selectedRank.skills)
                  .map(([skill, level]) => `${skill} ${level}`)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
