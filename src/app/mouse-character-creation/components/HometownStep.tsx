"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

interface CharacterData {
  concept: any
  guardRank: any
  skillChoices: {
    naturalTalent: string[]
    parentsTradeSkill: string
    persuasionSkill: string[]
    apprenticeshipSkill: string
    mentorSkill: string[]
    specialty: string
    finalSkills: Record<string, number>
  }
  hometown: {
    city: string
    trait: string
    skill: string
  }
  mouseNature: any
  wises: any
  resources: any
  name: string
  furColor: string
  parentNames: any
  relationships: any
}

interface HometownStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const CITIES = [
  {
    name: "Barkstone",
    description: "A busy working-class town",
    skills: ["Carpenter", "Potter", "Glazier"],
    traits: ["Steady Paw"],
  },
  {
    name: "Copperwood",
    description: "One of the oldest cities and home to one of the two mines in the Territories",
    skills: ["Smith", "Haggler"],
    traits: ["Independent"],
  },
  {
    name: "Elmoss",
    description: "A once thriving city known for its medicinal moss",
    skills: ["Carpenter", "Harvester"],
    traits: ["Alert"],
  },
  {
    name: "Ivydale",
    description: "Renowned for its bakers and bread",
    skills: ["Harvester", "Baker"],
    traits: ["Hard Worker"],
  },
  {
    name: "Lockhaven",
    description: "The home of the Mouse Guard",
    skills: ["Weaver", "Armorer"],
    traits: ["Generous", "Guard's Honor"],
  },
  {
    name: "Port Sumac",
    description: "A busy little port town between Darkwater and Rustleaf",
    skills: ["Boatcrafter", "Weather Watcher"],
    traits: ["Tough", "Weather Sense"],
  },
  {
    name: "Shaleburrow",
    description: "A simple town known for its delicious drinks!",
    skills: ["Mason", "Harvester", "Miller"],
    traits: ["Open-Minded"],
  },
  {
    name: "Sprucetuck",
    description: "Known for its scientists, medicine and scent concoctions",
    skills: ["Scientist", "Loremouse"],
    traits: ["Inquisitive", "Rational"],
  },
]

export default function HometownStep({ characterData, updateCharacterData }: HometownStepProps) {
  const selectedCity = CITIES.find((city) => city.name === characterData.hometown.city)

  // Get current skill ratings from the skills step
  const getCurrentSkillRating = (skill: string): number => {
    // First check finalSkills if they've been calculated
    if (characterData.skillChoices.finalSkills && Object.keys(characterData.skillChoices.finalSkills).length > 0) {
      return characterData.skillChoices.finalSkills[skill] || 0
    }

    // Otherwise, calculate from base skills and current choices
    let rating = characterData.guardRank.skills[skill] || 0

    // Add natural talent
    if (characterData.skillChoices.naturalTalent.includes(skill)) {
      rating += 2
    }

    // Add parents trade
    if (characterData.skillChoices.parentsTradeSkill === skill) {
      rating += rating > 0 ? 1 : 2
    }

    // Add persuasion skills
    if (characterData.skillChoices.persuasionSkill.includes(skill)) {
      rating += rating > 0 ? 1 : 2
    }

    // Add apprenticeship
    if (characterData.skillChoices.apprenticeshipSkill === skill) {
      rating += 1
    }

    // Add mentor skills
    if (characterData.skillChoices.mentorSkill.includes(skill)) {
      rating += 1
    }

    // Add specialty
    if (characterData.skillChoices.specialty === skill && characterData.guardRank.rank !== "Tenderpaw") {
      rating += 1
    }

    return Math.min(rating, 6) // Cap at 6
  }

  const getNewSkillRating = (skill: string): number => {
    const current = getCurrentSkillRating(skill)
    return Math.min(current > 0 ? current + 1 : 2, 6)
  }

  const selectCity = (cityName: string) => {
    updateCharacterData("hometown", {
      city: cityName,
      trait: "",
      skill: "",
    })
  }

  const selectTrait = (trait: string) => {
    updateCharacterData("hometown", {
      ...characterData.hometown,
      trait,
    })
  }

  const selectSkill = (skill: string) => {
    updateCharacterData("hometown", {
      ...characterData.hometown,
      skill,
    })
  }

  const SkillButton = ({ skill }: { skill: string }) => {
    const currentRating = getCurrentSkillRating(skill)
    const newRating = getNewSkillRating(skill)
    const isSelected = characterData.hometown.skill === skill

    return (
      <button
        onClick={() => selectSkill(skill)}
        className={`w-full p-3 text-sm border rounded transition-colors text-left ${
          isSelected ? "border-blue-500 bg-blue-100 text-blue-700" : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="font-medium mb-1">{skill}</div>
        <div className="text-xs text-gray-600">
          {currentRating > 0 ? (
            <span>
              Current: {currentRating} → <span className="font-medium text-green-600">New: {newRating}</span>
            </span>
          ) : (
            <span>
              No skill → <span className="font-medium text-green-600">New: 2</span>
            </span>
          )}
        </div>
      </button>
    )
  }

  // Check if skills step has been completed
  const skillsCompleted =
    characterData.skillChoices.finalSkills && Object.keys(characterData.skillChoices.finalSkills).length > 0

  if (!skillsCompleted) {
    return (
      <div className="text-center p-8 text-gray-500">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Skills Step Required</h3>
          <p>Please complete the Skills step first before selecting your hometown.</p>
          <p className="text-sm mt-2">
            Your hometown choice will modify your skill ratings, so we need your base skills calculated first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Where Were You Born?</h3>
        <p className="text-gray-600 mb-6">
          Choose a mouse town or city in which your character was born. Each city has its own culture as represented by
          the skills and traits it provides. You'll choose one trait and one skill from your birthplace.
        </p>
      </div>

      {/* Current Skills Summary */}
      <div className="border p-4 rounded-lg bg-blue-50 border-blue-200">
        <h4 className="font-medium mb-3 text-blue-800">Your Current Skills</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {Object.entries(characterData.skillChoices.finalSkills)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([skill, rating]) => (
              <div key={skill} className="flex justify-between">
                <span className="font-medium">{skill}:</span>
                <span className="text-blue-700">{rating}</span>
              </div>
            ))}
        </div>
      </div>

      {/* City Selection */}
      <div className="space-y-3">
        {CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => selectCity(city.name)}
            className={`w-full text-left p-4 border rounded-lg transition-all ${
              characterData.hometown.city === city.name
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4
                className={`font-semibold ${
                  characterData.hometown.city === city.name ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {city.name}
              </h4>
            </div>

            <p className="text-gray-600 mb-3">{city.description}</p>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Skills: </span>
                <span className="text-gray-600">{city.skills.join(", ")}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Traits: </span>
                <span className="text-gray-600">{city.traits.join(", ")}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Trait and Skill Selection */}
      {selectedCity && (
        <div className="border p-4 rounded-lg bg-blue-50 border-blue-200">
          <h4 className="font-medium mb-4 text-blue-800">Choose from {selectedCity.name}</h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Trait Selection */}
            <div>
              <h5 className="font-medium mb-2 text-blue-700">Choose One Trait</h5>
              <div className="space-y-2">
                {selectedCity.traits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => selectTrait(trait)}
                    className={`w-full p-2 text-sm border rounded transition-colors ${
                      characterData.hometown.trait === trait
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Selection */}
            <div>
              <h5 className="font-medium mb-2 text-blue-700">Choose One Skill</h5>
              <div className="space-y-2">
                {selectedCity.skills.map((skill) => (
                  <SkillButton key={skill} skill={skill} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Selection Summary */}
      {characterData.hometown.city && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Your Hometown Selection</h4>
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium text-green-800">Birthplace:</span> {characterData.hometown.city}
            </p>
            {characterData.hometown.trait && (
              <p className="text-sm">
                <span className="font-medium text-green-800">Trait:</span> {characterData.hometown.trait}
              </p>
            )}
            {characterData.hometown.skill && (
              <p className="text-sm">
                <span className="font-medium text-green-800">Skill Bonus:</span> {characterData.hometown.skill} (
                {getCurrentSkillRating(characterData.hometown.skill)} →{" "}
                {getNewSkillRating(characterData.hometown.skill)})
              </p>
            )}
          </div>

          {characterData.hometown.skill && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> If you don't have the {characterData.hometown.skill} skill, it will be added at
                rating 2. If you already have it, the rating will increase by 1 (maximum 6).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
