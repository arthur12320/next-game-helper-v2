"use client"
 
/* eslint-disable react/no-unescaped-entities */

import type React from "react"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { useState } from "react"

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
  mouseNature: {
    baseNature: number
    finalNature: number
    winterSaving: boolean
    confrontation: boolean
    fearPredators: boolean
    availableTraits: string[]
    selectedTrait: string
    fighterReduction: boolean
  }
  wises: {
    count: number
    selectedWises: string[]
    customWises: string[]
  }
  resources: {
    resourcesRating: number
    circlesRating: number
  }
  traits: {
    bornWith: string
    parentalInheritance: string
    lifeOnTheRoad: string
    finalTraits: Record<string, number>
  }
  name: string
  furColor: string
  parentNames: {
    mother: string
    father: string
  }
  relationships: {
    seniorArtisan: { name: string; profession: string }
    mentor: { name: string; type: string; location: string }
    friend: { name: string; profession: string; location: string; background: string }
    enemy: { name: string; profession: string; location: string; background: string }
  }
  finishingTouches: {
    cloakColor: string
    cloakReason: string
    belief: string
    goal: string
    instinct: string
    weapon: string
    additionalGear: string[]
    fatePoints: number
    personaPoints: number
  }
}

interface SummaryStepProps {
  characterData: CharacterData
}

const FUR_COLORS = [
  { name: "Brown", color: "#8B4513" },
  { name: "Blonde", color: "#F5DEB3" },
  { name: "Gray", color: "#808080" },
  { name: "Black", color: "#2C2C2C" },
  { name: "White", color: "#F8F8FF" },
  { name: "Red", color: "#CD853F" },
]

export default function SummaryStep({ characterData }: SummaryStepProps) {
  const selectedColor = FUR_COLORS.find((c) => c.name === characterData.furColor)
  const isTenderpaw = characterData.guardRank.rank === "Tenderpaw"

  const isComplete = () => {
    const basicComplete =
      characterData.name &&
      characterData.furColor &&
      characterData.guardRank.rank &&
      characterData.finishingTouches.belief &&
      characterData.finishingTouches.goal &&
      characterData.finishingTouches.instinct &&
      characterData.finishingTouches.weapon

    const cloakComplete = isTenderpaw || characterData.finishingTouches.cloakColor

    return basicComplete && cloakComplete
  }

  const exportToMarkdown = () => {
    const md = generateMarkdown(characterData)
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${characterData.name || "mouse-character"}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const md = generateMarkdown(characterData)
    navigator.clipboard.writeText(md).then(() => {
      // Could add a toast notification here
      alert("Character sheet copied to clipboard!")
    })
  }

  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    } else {
      alert("Please select a valid PDF file")
    }
  }

  const generatePDF = async () => {
    if (!pdfFile) {
      alert("Please upload a blank character sheet PDF first")
      return
    }

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const filledPdfBytes = await generateFilledPDF(characterData, arrayBuffer)

      const blob = new Blob([filledPdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${characterData.name || "mouse-character"}-sheet.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please make sure the uploaded file is a valid character sheet.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Character Summary</h3>
        <p className="text-gray-600 mb-6">Review your complete character before finalizing the creation.</p>
      </div>

      {/* Character Header */}
      <div className="border p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center text-2xl bg-gray-50">
            🐭
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-800">{characterData.name || "Unnamed Mouse"}</h4>
            <p className="text-gray-600">
              {characterData.guardRank.rank || "No Rank"} • Age {characterData.guardRank.age || "Unknown"}
            </p>
            {characterData.hometown.city && (
              <p className="text-sm text-gray-500">Born in {characterData.hometown.city}</p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Fur Color:</span>
              <div className="flex items-center gap-2">
                {selectedColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: selectedColor.color }}
                  ></div>
                )}
                <span className={characterData.furColor ? "text-gray-900" : "text-gray-400"}>
                  {characterData.furColor || "Not set"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Nature:</span>
              <span className="text-gray-900">{characterData.mouseNature.finalNature}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Will:</span>
              <span className="text-gray-900">{characterData.guardRank.abilities.will}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Health:</span>
              <span className="text-gray-900">{characterData.guardRank.abilities.health}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Resources:</span>
              <span className="text-gray-900">{characterData.resources.resourcesRating}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Circles:</span>
              <span className="text-gray-900">{characterData.resources.circlesRating}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Weapon:</span>
              <span className="text-gray-900">{characterData.finishingTouches.weapon || "None"}</span>
            </div>

            {!isTenderpaw && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Cloak:</span>
                <span className="text-gray-900">{characterData.finishingTouches.cloakColor || "None"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Character Concept */}
        {characterData.concept.description && (
          <div className="mb-6">
            <h5 className="font-medium text-gray-800 mb-2">Concept</h5>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{characterData.concept.description}</p>
          </div>
        )}

        {/* Belief, Goal, Instinct */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <h5 className="font-medium text-blue-700 mb-2">Belief</h5>
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded min-h-[60px]">
              {characterData.finishingTouches.belief || "Not set"}
            </p>
          </div>
          <div>
            <h5 className="font-medium text-green-700 mb-2">Goal</h5>
            <p className="text-sm text-gray-700 bg-green-50 p-3 rounded min-h-[60px]">
              {characterData.finishingTouches.goal || "Not set"}
            </p>
          </div>
          <div>
            <h5 className="font-medium text-red-700 mb-2">Instinct</h5>
            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded min-h-[60px]">
              {characterData.finishingTouches.instinct || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="border p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-3">Skills</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {Object.entries(characterData.skillChoices.finalSkills || characterData.guardRank.skills)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([skill, rating]) => (
              <div key={skill} className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="font-medium">{skill}:</span>
                <span className="text-blue-700">{rating}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Traits */}
      {Object.keys(characterData.traits.finalTraits || {}).length > 0 && (
        <div className="border p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Traits</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(characterData.traits.finalTraits || {})
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([trait, level]) => (
                <div key={trait} className="flex justify-between bg-green-50 p-2 rounded">
                  <span className="font-medium">{trait}:</span>
                  <span className="text-green-700">Level {level}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Wises */}
      {characterData.wises.selectedWises.length > 0 && (
        <div className="border p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Wises</h5>
          <div className="flex flex-wrap gap-2">
            {characterData.wises.selectedWises.map((wise, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                {wise}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Family */}
      <div className="border p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-3">Family</h5>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Mother:</span>{" "}
            <span className="text-gray-900">{characterData.parentNames.mother || "Not named"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Father:</span>{" "}
            <span className="text-gray-900">{characterData.parentNames.father || "Not named"}</span>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="border p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-3">Relationships</h5>
        <div className="space-y-3 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-blue-700">Senior Artisan:</span>{" "}
              <span className="text-gray-900">
                {characterData.relationships.seniorArtisan.name
                  ? `${characterData.relationships.seniorArtisan.name} (${characterData.relationships.seniorArtisan.profession})`
                  : "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium text-green-700">Mentor:</span>{" "}
              <span className="text-gray-900">{characterData.relationships.mentor.name || "Not set"}</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-purple-700">Friend:</span>{" "}
              <span className="text-gray-900">
                {characterData.relationships.friend.name
                  ? `${characterData.relationships.friend.name} (${characterData.relationships.friend.profession})`
                  : "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium text-red-700">Enemy:</span>{" "}
              <span className="text-gray-900">
                {characterData.relationships.enemy.name
                  ? `${characterData.relationships.enemy.name} (${characterData.relationships.enemy.profession})`
                  : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment */}
      {characterData.finishingTouches.additionalGear.length > 0 && (
        <div className="border p-4 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Additional Equipment</h5>
          <div className="flex flex-wrap gap-2">
            {characterData.finishingTouches.additionalGear.map((item, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Starting Points */}
      <div className="border p-4 rounded-lg bg-green-50 border-green-200">
        <h5 className="font-medium text-green-800 mb-3">Starting Points</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{characterData.finishingTouches.fatePoints}</div>
            <div className="text-sm text-green-700">Fate Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{characterData.finishingTouches.personaPoints}</div>
            <div className="text-sm text-green-700">Persona Points</div>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="border-t pt-6">
        {isComplete() ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">✓ Character is complete and ready for adventure!</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium">
              ⚠ Please complete all required fields before finalizing your character.
            </p>
          </div>
        )}

        {/* PDF Upload and Generation */}
        <div className="border p-4 rounded-lg bg-blue-50 border-blue-200 mb-4">
          <h5 className="font-medium text-blue-800 mb-3">Generate Filled Character Sheet</h5>
          <p className="text-sm text-blue-700 mb-4">
            Upload a blank character sheet PDF to generate a filled version with your character's information.
          </p>

          <div className="space-y-3">
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {pdfFile && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <span>✓ PDF uploaded: {pdfFile.name}</span>
              </div>
            )}

            <Button onClick={generatePDF} disabled={!pdfFile} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Filled PDF
            </Button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={exportToMarkdown} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Character Sheet
          </Button>
          <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2 bg-transparent">
            <FileText className="w-4 h-4" />
            Copy to Clipboard
          </Button>
        </div>
      </div>
    </div>
  )
}

function generateMarkdown(characterData: CharacterData): string {
  const isTenderpaw = characterData.guardRank.rank === "Tenderpaw"

  return `# ${characterData.name || "Unnamed Mouse"}

**${characterData.guardRank.rank}** • Age ${characterData.guardRank.age} • Born ${characterData.guardRank.birthYear}
${characterData.hometown.city ? `*Born in ${characterData.hometown.city}*` : ""}

## Character Concept
${characterData.concept.description || "No concept defined"}

**Personality:** ${characterData.concept.personality || "Not defined"}
**Specialty:** ${characterData.concept.specialty || "Not defined"}

## Core Attributes
- **Nature:** ${characterData.mouseNature.finalNature}
- **Will:** ${characterData.guardRank.abilities.will}
- **Health:** ${characterData.guardRank.abilities.health}
- **Resources:** ${characterData.resources.resourcesRating}
- **Circles:** ${characterData.resources.circlesRating}

## Appearance
- **Fur Color:** ${characterData.furColor || "Not set"}
${!isTenderpaw && characterData.finishingTouches.cloakColor ? `- **Cloak Color:** ${characterData.finishingTouches.cloakColor}` : ""}
${!isTenderpaw && characterData.finishingTouches.cloakReason ? `  - *${characterData.finishingTouches.cloakReason}*` : ""}

## Belief, Goal & Instinct
**Belief:** ${characterData.finishingTouches.belief || "Not set"}

**Goal:** ${characterData.finishingTouches.goal || "Not set"}

**Instinct:** ${characterData.finishingTouches.instinct || "Not set"}

## Skills
${Object.entries(characterData.skillChoices.finalSkills || characterData.guardRank.skills)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([skill, rating]) => `- **${skill}:** ${rating}`)
  .join("\n")}

${
  Object.keys(characterData.traits.finalTraits || {}).length > 0
    ? `## Traits
${Object.entries(characterData.traits.finalTraits || {})
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([trait, level]) => `- **${trait}:** Level ${level}`)
  .join("\n")}`
    : ""
}

${
  characterData.wises.selectedWises.length > 0
    ? `## Wises
${characterData.wises.selectedWises.map((wise) => `- ${wise}`).join("\n")}`
    : ""
}

## Family & Relationships
**Parents:** ${characterData.parentNames.mother || "Unknown"} (mother), ${characterData.parentNames.father || "Unknown"} (father)

**Senior Artisan:** ${characterData.relationships.seniorArtisan.name ? `${characterData.relationships.seniorArtisan.name} (${characterData.relationships.seniorArtisan.profession})` : "Not set"}

**Mentor:** ${characterData.relationships.mentor.name || "Not set"}

**Friend:** ${characterData.relationships.friend.name ? `${characterData.relationships.friend.name} (${characterData.relationships.friend.profession})` : "Not set"}
${characterData.relationships.friend.background ? `*${characterData.relationships.friend.background}*` : ""}

**Enemy:** ${characterData.relationships.enemy.name ? `${characterData.relationships.enemy.name} (${characterData.relationships.enemy.profession})` : "None"}
${characterData.relationships.enemy.background ? `*${characterData.relationships.enemy.background}*` : ""}

## Equipment
**Primary Weapon:** ${characterData.finishingTouches.weapon || "None"}

${characterData.finishingTouches.additionalGear.length > 0 ? `**Additional Gear:** ${characterData.finishingTouches.additionalGear.join(", ")}` : ""}

## Starting Points
- **Fate Points:** ${characterData.finishingTouches.fatePoints}
- **Persona Points:** ${characterData.finishingTouches.personaPoints}

---
*Character created with the Mouse Guard Character Creator*`
}

async function generateFilledPDF(characterData: CharacterData, blankPdfBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(blankPdfBytes)
  const form = pdfDoc.getForm()

  try {
    // Basic Information
    const nameField = form.getTextField("Name")
    nameField.setText(characterData.name || "")

    const ageField = form.getTextField("Age")
    ageField.setText(characterData.guardRank.age?.toString() || "")

    const homeField = form.getTextField("Home")
    homeField.setText(characterData.hometown.city || "")

    const furColorField = form.getTextField("Fur Color")
    furColorField.setText(characterData.furColor || "")

    const guardRankField = form.getTextField("Guard Rank")
    guardRankField.setText(characterData.guardRank.rank || "")

    const cloakColorField = form.getTextField("Cloak Color")
    if (characterData.guardRank.rank !== "Tenderpaw") {
      cloakColorField.setText(characterData.finishingTouches.cloakColor || "")
    }

    // Relationships
    const parentsField = form.getTextField("Parents")
    const parents = [characterData.parentNames.mother, characterData.parentNames.father].filter(Boolean).join(", ")
    parentsField.setText(parents)

    const seniorField = form.getTextField("Senior")
    seniorField.setText(characterData.relationships.seniorArtisan.name || "")

    const mentorField = form.getTextField("Mentor")
    mentorField.setText(characterData.relationships.mentor.name || "")

    const friendField = form.getTextField("Friend")
    friendField.setText(characterData.relationships.friend.name || "")

    const enemyField = form.getTextField("Enemy")
    enemyField.setText(characterData.relationships.enemy.name || "")

    // Belief, Goal, Instinct
    const beliefField = form.getTextField("Belief")
    beliefField.setText(characterData.finishingTouches.belief || "")

    const goalField = form.getTextField("Goal")
    goalField.setText(characterData.finishingTouches.goal || "")

    const instinctField = form.getTextField("Instinct")
    instinctField.setText(characterData.finishingTouches.instinct || "")

    // Abilities
    const natureField = form.getTextField("MOUSE NATURE")
    natureField.setText(characterData.mouseNature.finalNature?.toString() || "")

    const willField = form.getTextField("WILL")
    willField.setText(characterData.guardRank.abilities.will?.toString() || "")

    const healthField = form.getTextField("HEALTH")
    healthField.setText(characterData.guardRank.abilities.health?.toString() || "")

    const resourcesField = form.getTextField("RESOURCES")
    resourcesField.setText(characterData.resources.resourcesRating?.toString() || "")

    const circlesField = form.getTextField("CIRCLES")
    circlesField.setText(characterData.resources.circlesRating?.toString() || "")

    // Skills - Fill in the character's skills
    const skills = characterData.skillChoices.finalSkills || characterData.guardRank.skills || {}
    Object.entries(skills).forEach(([skillName, rating]) => {
      try {
        const skillField = form.getTextField(skillName.toUpperCase())
        skillField.setText(rating.toString())
      } catch (e) {
        console.log(e)
        // Skill field might not exist in PDF, skip it
        console.warn(`Skill field ${skillName} not found in PDF`)
      }
    })

    // Traits
    const traits = characterData.traits.finalTraits || {}
    let traitIndex = 0
    Object.entries(traits).forEach(([traitName, level]) => {
      if (traitIndex < 5) {
        // Assuming 5 trait slots in the PDF
        try {
          const traitNameField = form.getTextField(`TRAIT NAME ${traitIndex + 1}`)
          traitNameField.setText(traitName)

          const traitLevelField = form.getTextField(`TRAIT LEVEL ${traitIndex + 1}`)
          traitLevelField.setText(level.toString())

          traitIndex++
        } catch (e) {
          console.log(e)
          console.warn(`Trait field ${traitIndex + 1} not found in PDF`)
        }
      }
    })

    // Wises
    characterData.wises.selectedWises.forEach((wise, index) => {
      if (index < 4) {
        // Assuming 4 wise slots
        try {
          const wiseField = form.getTextField(`Wise ${index + 1}`)
          wiseField.setText(wise)
        } catch (e) {
          console.log(e)
          console.warn(`Wise field ${index + 1} not found in PDF`)
        }
      }
    })

    // Gear
    const gearText = [characterData.finishingTouches.weapon, ...characterData.finishingTouches.additionalGear]
      .filter(Boolean)
      .join(", ")

    try {
      const gearField = form.getTextField("Gear and Possessions")
      gearField.setText(gearText)
    } catch (e) {
      console.log(e)
      console.warn("Gear field not found in PDF")
    }
  } catch (error) {
    console.error("Error filling PDF form:", error)
  }

  // Flatten the form to prevent further editing
  form.flatten()

  return await pdfDoc.save()
}
