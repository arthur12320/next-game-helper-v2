"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react"

interface CharacterData {
  concept: any
  guardRank: {
    rank: string
    age: number
    abilities: { will: number; health: number }
    skills: Record<string, number>
    birthYear: number
  }
  skillChoices: {
    naturalTalent: string[]
    parentsTradeSkill: string
    persuasionSkill: string[]
    apprenticeshipSkill: string
    mentorSkill: string[]
    specialty: string
    finalSkills: Record<string, number>
  }
  hometown: any
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface SkillsStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const ALL_SKILLS = [
  "Administrator",
  "Apiarist",
  "Archivist",
  "Armorer",
  "Baker",
  "Boatcrafter",
  "Brewer",
  "Carpenter",
  "Cartographer",
  "Cook",
  "Fighter",
  "Glazier",
  "Haggler",
  "Harvester",
  "Healer",
  "Hunter",
  "Insectrist",
  "Instructor",
  "Laborer",
  "Loremouse",
  "Manipulator",
  "Militarist",
  "Miller",
  "Orator",
  "Pathfinder",
  "Persuader",
  "Potter",
  "Scientist",
  "Scout",
  "Smith",
  "Stonemason",
  "Survivalist",
  "Weather Watcher",
  "Weaver",
]

const NATURAL_TALENT_SKILLS = ALL_SKILLS

const PARENTS_TRADE_SKILLS = [
  "Apiarist",
  "Archivist",
  "Armorer",
  "Baker",
  "Boatcrafter",
  "Brewer",
  "Carpenter",
  "Cartographer",
  "Glazier",
  "Harvester",
  "Insectrist",
  "Miller",
  "Potter",
  "Smith",
  "Stonemason",
  "Weaver",
]

const PERSUASION_SKILLS = ["Manipulator", "Orator", "Persuader"]

const APPRENTICESHIP_SKILLS = [
  "Apiarist",
  "Archivist",
  "Armorer",
  "Baker",
  "Brewer",
  "Carpenter",
  "Cartographer",
  "Cook",
  "Glazier",
  "Harvester",
  "Healer",
  "Insectrist",
  "Laborer",
  "Miller",
  "Potter",
  "Smith",
  "Stonemason",
  "Weaver",
]

const MENTOR_SKILLS = [
  "Fighter",
  "Healer",
  "Hunter",
  "Instructor",
  "Pathfinder",
  "Scout",
  "Survivalist",
  "Weather Watcher",
]

const SPECIALTY_SKILLS = [
  "Fighter",
  "Healer",
  "Hunter",
  "Instructor",
  "Pathfinder",
  "Scout",
  "Survivalist",
  "Weather Watcher",
]

export default function SkillsStep({ characterData, updateCharacterData }: SkillsStepProps) {
  const [currentSkills, setCurrentSkills] = useState<Record<string, number>>({})

  // Calculate how many choices each section gets based on rank
  const getChoiceCount = (section: string) => {
    const rank = characterData.guardRank.rank
    switch (section) {
      case "naturalTalent":
        return rank === "Tenderpaw" || rank === "Guard Captain" ? 2 : 1
      case "persuasion":
        return rank === "Patrol Leader" || rank === "Guard Captain" ? 2 : 1
      case "mentor":
        return rank === "Patrol Leader" ? 2 : 1
      default:
        return 1
    }
  }

  // Calculate final skills whenever choices change
  useEffect(() => {
    const finalSkills = { ...characterData.guardRank.skills }

    // Add natural talent skills
    characterData.skillChoices.naturalTalent.forEach((skill) => {
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    })

    // Add parents trade skill
    if (characterData.skillChoices.parentsTradeSkill) {
      const skill = characterData.skillChoices.parentsTradeSkill
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    }

    // Add persuasion skills
    characterData.skillChoices.persuasionSkill.forEach((skill) => {
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    })

    // Add apprenticeship skill
    if (characterData.skillChoices.apprenticeshipSkill) {
      const skill = characterData.skillChoices.apprenticeshipSkill
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    }

    // Add mentor skills
    characterData.skillChoices.mentorSkill.forEach((skill) => {
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    })

    // Add specialty skill (except for tenderpaws)
    if (characterData.skillChoices.specialty && characterData.guardRank.rank !== "Tenderpaw") {
      const skill = characterData.skillChoices.specialty
      finalSkills[skill] = (finalSkills[skill] || 0) + (finalSkills[skill] ? 1 : 2)
    }

    // Cap all skills at 6
    Object.keys(finalSkills).forEach((skill) => {
      if (finalSkills[skill] > 6) finalSkills[skill] = 6
    })

    setCurrentSkills(finalSkills)

  }, [characterData.skillChoices, characterData.guardRank.skills])

  const updateSkillChoice = (section: string, value: string | string[]) => {
    updateCharacterData("skillChoices", {
      ...characterData.skillChoices,
      [section]: value,
    })
  }

  const toggleSkillInArray = (section: string, skill: string, maxCount: number) => {
    const currentArray = characterData.skillChoices[section as keyof typeof characterData.skillChoices] as string[]
    const newArray = currentArray.includes(skill)
      ? currentArray.filter((s) => s !== skill)
      : currentArray.length < maxCount
        ? [...currentArray, skill]
        : currentArray

    updateSkillChoice(section, newArray)
  }

  const SkillButton = ({
    skill,
    isSelected,
    onClick,
    disabled = false,
    currentRating = 0,
  }: {
    skill: string
    isSelected: boolean
    onClick: () => void
    disabled?: boolean
    currentRating?: number
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 text-sm border rounded-lg transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="font-medium">{skill}</div>
      {currentRating > 0 && <div className="text-xs text-gray-500 mt-1">Current: {currentRating}</div>}
    </button>
  )

  if (!characterData.guardRank.rank) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a Guard Rank first to continue with skill selection.
      </div>
    )
  }

  const calculateAndSaveFinalSkills = () => {
    updateCharacterData("skillChoices", {
      ...characterData.skillChoices,
      finalSkills: currentSkills,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Develop Your Skills</h3>
        <p className="text-gray-600 mb-6">
          Your rank determines your starting skill package. Now you'll choose to focus on additional skills based on
          your character's background and training.
        </p>
      </div>

      {/* Starting Skills from Rank */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-3">Starting Skills from {characterData.guardRank.rank} Rank</h4>
        <div className="text-sm text-gray-700">
          {Object.entries(characterData.guardRank.skills).map(([skill, rating]) => (
            <span key={skill} className="inline-block mr-4 mb-1">
              {skill}: {rating}
            </span>
          ))}
        </div>
      </div>

      {/* Natural Talent */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-700">
          Natural Talent ({characterData.skillChoices.naturalTalent.length}/{getChoiceCount("naturalTalent")})
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Pick an area in which you're naturally talented.
          {getChoiceCount("naturalTalent") === 2 ? " Choose two skills." : " Choose one skill."}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {NATURAL_TALENT_SKILLS.map((skill) => (
            <SkillButton
              key={skill}
              skill={skill}
              isSelected={characterData.skillChoices.naturalTalent.includes(skill)}
              onClick={() => toggleSkillInArray("naturalTalent", skill, getChoiceCount("naturalTalent"))}
              currentRating={currentSkills[skill] || 0}
            />
          ))}
        </div>
      </div>

      {/* Parents' Trade */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-green-700">Parents' Trade</h4>
        <p className="text-sm text-gray-600 mb-4">
          What was your parents' trade? Choose one skill from the list below.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PARENTS_TRADE_SKILLS.map((skill) => (
            <SkillButton
              key={skill}
              skill={skill}
              isSelected={characterData.skillChoices.parentsTradeSkill === skill}
              onClick={() => updateSkillChoice("parentsTradeSkill", skill)}
              currentRating={currentSkills[skill] || 0}
            />
          ))}
        </div>
      </div>

      {/* Persuasion Method */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-purple-700">
          Persuasion Method ({characterData.skillChoices.persuasionSkill.length}/{getChoiceCount("persuasion")})
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          How do you convince people that you're right or to do what you need?
          {getChoiceCount("persuasion") === 2 ? " Choose two skills." : " Choose one skill."}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PERSUASION_SKILLS.map((skill) => (
            <SkillButton
              key={skill}
              skill={skill}
              isSelected={characterData.skillChoices.persuasionSkill.includes(skill)}
              onClick={() => toggleSkillInArray("persuasionSkill", skill, getChoiceCount("persuasion"))}
              currentRating={currentSkills[skill] || 0}
            />
          ))}
        </div>
      </div>

      {/* Apprenticeship */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-orange-700">Senior Artisan's Trade</h4>
        <p className="text-sm text-gray-600 mb-4">
          With whom did you apprentice for the Guard? What was that mouse's trade?
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {APPRENTICESHIP_SKILLS.map((skill) => (
            <SkillButton
              key={skill}
              skill={skill}
              isSelected={characterData.skillChoices.apprenticeshipSkill === skill}
              onClick={() => updateSkillChoice("apprenticeshipSkill", skill)}
              currentRating={currentSkills[skill] || 0}
            />
          ))}
        </div>
      </div>

      {/* Mentor Training */}
      <div className="border p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-red-700">
          Mentor's Training ({characterData.skillChoices.mentorSkill.length}/{getChoiceCount("mentor")})
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          What did your mentor stress in training?
          {getChoiceCount("mentor") === 2 ? " Choose two skills." : " Choose one skill."}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MENTOR_SKILLS.map((skill) => (
            <SkillButton
              key={skill}
              skill={skill}
              isSelected={characterData.skillChoices.mentorSkill.includes(skill)}
              onClick={() => toggleSkillInArray("mentorSkill", skill, getChoiceCount("mentor"))}
              currentRating={currentSkills[skill] || 0}
            />
          ))}
        </div>
      </div>

      {/* Specialty (not for Tenderpaws) */}
      {characterData.guardRank.rank !== "Tenderpaw" && (
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-3 text-indigo-700">Your Specialty</h4>
          <p className="text-sm text-gray-600 mb-4">
            Choose a skill as your specialty. Each player must choose a unique specialty.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SPECIALTY_SKILLS.map((skill) => (
              <SkillButton
                key={skill}
                skill={skill}
                isSelected={characterData.skillChoices.specialty === skill}
                onClick={() => updateSkillChoice("specialty", skill)}
                currentRating={currentSkills[skill] || 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Final Skills Summary */}
      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Final Skill Ratings</h4>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(currentSkills)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([skill, rating]) => (
                <div key={skill} className="flex justify-between">
                  <span className="font-medium">{skill}:</span>
                  <span className="text-green-700">{rating}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Skills are capped at rating 6. You can learn other skills during play or rely on
              your patrolmates.
            </p>
          </div>

          <button
            onClick={calculateAndSaveFinalSkills}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Skills
          </button>
        </div>

        {characterData.skillChoices.finalSkills && Object.keys(characterData.skillChoices.finalSkills).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">✓ Skills confirmed and saved!</p>
          </div>
        )}
      </div>
    </div>
  )
}
