/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CharacterData {
  name: string
  furColor: string
  parentNames: {
    mother: string
    father: string
  }
  relationships: {
    seniorArtisan: {
      name: string
      profession: string
    }
    mentor: {
      name: string
      type: string
      location: string
    }
    friend: {
      name: string
      profession: string
      location: string
      background: string
    }
    enemy: {
      name: string
      profession: string
      location: string
      background: string
    }
  }
}

interface RelationshipsStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const PROFESSIONS = [
  "Carpenter",
  "Blacksmith",
  "Baker",
  "Weaver",
  "Merchant",
  "Farmer",
  "Hunter",
  "Scholar",
  "Healer",
  "Guard",
  "Patrol Leader",
  "Bandit",
  "Innkeeper",
  "Miller",
  "Fisherman",
]

const LOCATIONS = [
  "Lockhaven",
  "Elmoss",
  "Barkstone",
  "Copperwood",
  "Gilpledge",
  "Ivydale",
  "Rootwallow",
  "Sandmason",
  "Shaleburrow",
  "Sprucetuck",
  "Wolfepointe",
  "Appleloft",
  "Dorigift",
  "Flintrust",
  "Pebblebrook",
]

const MENTOR_TYPES = [
  "Current Player Character (Patrol Leader)",
  "Current Player Character (Other)",
  "NPC Guard",
  "NPC with Oldfur Trait",
]

export default function RelationshipsStep({ characterData, updateCharacterData }: RelationshipsStepProps) {
  const updateRelationship = (relationshipType: string, field: string, value: string) => {
    const updatedRelationships = {
      ...characterData.relationships,
      [relationshipType]: {
        ...characterData.relationships[relationshipType as keyof typeof characterData.relationships],
        [field]: value,
      },
    }
    updateCharacterData("relationships", updatedRelationships)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Define your character's relationships</h3>
        <p className="text-gray-600 mb-6">
          These connections will shape your character's background and provide roleplay opportunities.
        </p>
      </div>

      {/* Senior Artisan */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700">Senior Artisan</h4>
        <p className="text-sm text-gray-600 mb-4">
          What is the name of the senior artisan whom you apprenticed with? Name them and note their profession.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Artisan Name</label>
            <Input
              placeholder="e.g., Feris"
              value={characterData.relationships.seniorArtisan.name}
              onChange={(e) => updateRelationship("seniorArtisan", "name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <Select
              value={characterData.relationships.seniorArtisan.profession}
              onValueChange={(value) => updateRelationship("seniorArtisan", "profession", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mentor */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-green-700">Guard Mentor</h4>
        <p className="text-sm text-gray-600 mb-4">
          Who was your Guard mentor? For tenderpaws, this should be a current player character (preferably a patrol
          leader). For experienced characters, this can be an NPC or player character with the Oldfur trait.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name</label>
            <Input
              placeholder="e.g., Gavin"
              value={characterData.relationships.mentor.name}
              onChange={(e) => updateRelationship("mentor", "name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Type</label>
            <Select
              value={characterData.relationships.mentor.type}
              onValueChange={(value) => updateRelationship("mentor", "type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MENTOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select
              value={characterData.relationships.mentor.location}
              onValueChange={(value) => updateRelationship("mentor", "location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Friend */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-purple-700">Friend</h4>
        <p className="text-sm text-gray-600 mb-4">
          Does your mouse have a good friend who can be relied upon? Choose a name, profession, and location. Describe
          their relationship and background.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Friend's Name</label>
            <Input
              placeholder="e.g., Tuk"
              value={characterData.relationships.friend.name}
              onChange={(e) => updateRelationship("friend", "name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <Select
              value={characterData.relationships.friend.profession}
              onValueChange={(value) => updateRelationship("friend", "profession", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select
              value={characterData.relationships.friend.location}
              onValueChange={(value) => updateRelationship("friend", "location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background & Relationship</label>
          <Textarea
            placeholder="e.g., They grew up together in Elmoss. Your character joined the Guard, while they fell on hard times and became a bandit. Despite this, you remain close friends..."
            value={characterData.relationships.friend.background}
            onChange={(e) => updateRelationship("friend", "background", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Enemy (Optional) */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-red-700">Enemy (Optional)</h4>
        <p className="text-sm text-gray-600 mb-4">
          Does your character have an enemy? This can be from before your Guard days or from your time in service.
          Choose a name, profession, location, and describe the conflict.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enemy's Name</label>
            <Input
              placeholder="e.g., Paul"
              value={characterData.relationships.enemy.name}
              onChange={(e) => updateRelationship("enemy", "name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <Select
              value={characterData.relationships.enemy.profession}
              onValueChange={(value) => updateRelationship("enemy", "profession", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select
              value={characterData.relationships.enemy.location}
              onValueChange={(value) => updateRelationship("enemy", "location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conflict Background</label>
          <Textarea
            placeholder="e.g., A mission went wrong early in your career with another patrol leader. Now these two mice do not like each other at all..."
            value={characterData.relationships.enemy.background}
            onChange={(e) => updateRelationship("enemy", "background", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Current Relationships Summary */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Relationship Summary</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p>
              <span className="font-medium text-blue-700">Senior Artisan:</span>{" "}
              {characterData.relationships.seniorArtisan.name ? (
                <>
                  {characterData.relationships.seniorArtisan.name}
                  {characterData.relationships.seniorArtisan.profession &&
                    ` (${characterData.relationships.seniorArtisan.profession})`}
                </>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
            <p>
              <span className="font-medium text-green-700">Mentor:</span>{" "}
              {characterData.relationships.mentor.name ? (
                <>
                  {characterData.relationships.mentor.name}
                  {characterData.relationships.mentor.location && ` (${characterData.relationships.mentor.location})`}
                </>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-purple-700">Friend:</span>{" "}
              {characterData.relationships.friend.name ? (
                <>
                  {characterData.relationships.friend.name}
                  {characterData.relationships.friend.profession &&
                    ` (${characterData.relationships.friend.profession})`}
                </>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
            <p>
              <span className="font-medium text-red-700">Enemy:</span>{" "}
              {characterData.relationships.enemy.name ? (
                <>
                  {characterData.relationships.enemy.name}
                  {characterData.relationships.enemy.profession && ` (${characterData.relationships.enemy.profession})`}
                </>
              ) : (
                <span className="text-gray-400">None</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
