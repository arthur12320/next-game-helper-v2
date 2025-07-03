"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

interface CharacterData {
  concept: any
  guardRank: {
    rank: string
    age: number
    abilities: { will: number; health: number }
    skills: Record<string, number>
    birthYear: number
  }
  skillChoices: any
  hometown: any
  mouseNature: any
  wises: any
  resources: {
    resourcesRating: number
    circlesRating: number
  }
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface ResourcesStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const RANK_RESOURCES = {
  Tenderpaw: { resources: 1, circles: 1 },
  Guardmouse: { resources: 2, circles: 2 },
  "Patrol Guard": { resources: 3, circles: 3 },
  "Patrol Leader": { resources: 4, circles: 3 },
  "Guard Captain": { resources: 5, circles: 4 },
}

export default function ResourcesStep({ characterData, updateCharacterData }: ResourcesStepProps) {
  if (!characterData.guardRank.rank) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a Guard Rank first to continue with resources setup.
      </div>
    )
  }

  const rankData = RANK_RESOURCES[characterData.guardRank.rank as keyof typeof RANK_RESOURCES]

  // Auto-set resources based on rank
  if (
    characterData.resources.resourcesRating !== rankData.resources ||
    characterData.resources.circlesRating !== rankData.circles
  ) {
    updateCharacterData("resources", {
      resourcesRating: rankData.resources,
      circlesRating: rankData.circles,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Guard Resources & Circles</h3>
        <p className="text-gray-600 mb-6">
          Your rank determines your Resources and Circles ratings. These represent your character's material wealth and
          social connections within the Guard and mouse society.
        </p>
      </div>

      {/* Resources */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700">Guard Resources</h4>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-700 mb-2">
              Resources represent the Guard's pay, but also how resourceful and clever the mouse is with possessions and
              material goods.
            </p>
            <div className="text-2xl font-bold text-blue-600">Rating: {rankData.resources}</div>
          </div>
          <div className="text-6xl">💰</div>
        </div>

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-blue-800 text-sm">
            <strong>Resources {rankData.resources}:</strong> This rating determines what equipment and supplies your
            character can acquire, as well as their general financial standing within the Guard.
          </p>
        </div>
      </div>

      {/* Circles */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-green-700">Guard Circles</h4>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-700 mb-2">
              The Circles ability represents how well-connected your character is within mouse society and the Guard
              hierarchy.
            </p>
            <div className="text-2xl font-bold text-green-600">Rating: {rankData.circles}</div>
          </div>
          <div className="text-6xl">🤝</div>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-green-800 text-sm">
            <strong>Circles {rankData.circles}:</strong> This rating determines how easily your character can call upon
            contacts, find information, or get help from other mice in the territories.
          </p>
        </div>
      </div>

      {/* Rank Breakdown Table */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-3 text-gray-800">Resources & Circles by Rank</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Rank</th>
                <th className="text-center py-2 font-medium">Resources</th>
                <th className="text-center py-2 font-medium">Circles</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(RANK_RESOURCES).map(([rank, ratings]) => (
                <tr
                  key={rank}
                  className={`border-b ${rank === characterData.guardRank.rank ? "bg-blue-100 font-medium" : ""}`}
                >
                  <td className="py-2">{rank}</td>
                  <td className="text-center py-2">{ratings.resources}</td>
                  <td className="text-center py-2">{ratings.circles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Character Summary */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Your Character's Ratings</h4>
        <div className="bg-green-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-green-800">Rank:</span>
            <span className="text-green-700">{characterData.guardRank.rank}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-green-800">Resources:</span>
            <span className="text-green-700">{rankData.resources}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-green-800">Circles:</span>
            <span className="text-green-700">{rankData.circles}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> These ratings are automatically set based on your Guard rank and cannot be modified
            during character creation. They may change during play based on your character's actions and advancement.
          </p>
        </div>
      </div>
    </div>
  )
}
