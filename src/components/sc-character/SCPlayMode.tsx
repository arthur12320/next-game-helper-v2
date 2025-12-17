"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  updateSCCondition,
  updateSCAbility,
  updateSkillTest,
  updateSCSkillLevel,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/app/actions/sc-characters"
import { toast } from "sonner"
import { SkillRollModal } from "./SkillRollModal"
import { CharacterHeader } from "./play-mode/CharacterHeader"
import { AbilitiesCard } from "./play-mode/AbilitiesCard"
import { TokensCard } from "./play-mode/TokensCard"
import { ConditionsTab } from "./play-mode/ConditionsTab"
import { SkillsTab } from "./play-mode/SkillsTab"
import { InventoryTab } from "./play-mode/InventoryTab"
import { SCCharacter } from "@/db/schema/sc-character"
import { BackgroundTab } from "./play-mode/BackgroundTable"

interface SCPlayModeProps {
  character: SCCharacter
}

export function SCPlayMode({ character }: SCPlayModeProps) {
  const [localConditions, setLocalConditions] = useState(character.conditions)
  const [localAbilities, setLocalAbilities] = useState(character.abilities)
  const [interventionTokens, setInterventionTokens] = useState(character.interventionTokens)
  const [heroTokens, setHeroTokens] = useState(character.heroTokens)
  const [inventory, setInventory] = useState<string[]>(character.inventory || [])
  const [editMode, setEditMode] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editingItemName, setEditingItemName] = useState("")

  const [selectedSkill, setSelectedSkill] = useState<{ name: string; value: number; type: "skill" | "ability" } | null>(
    null,
  )
  const [rollModalOpen, setRollModalOpen] = useState(false)

  const handleAbilityChange = async (ability: string, delta: number) => {
    const newValue = Math.max(0, localAbilities[ability as keyof typeof localAbilities] + delta)
    setLocalAbilities({ ...localAbilities, [ability]: newValue })

    const result = await updateSCAbility(character.id, ability as keyof typeof localAbilities, newValue)
    if (!result.success) {
      toast.error("Error", { description: "Failed to update ability" })
    }
  }

  const handleConditionChange = async (condition: string, checked: boolean) => {
    setLocalConditions({ ...localConditions, [condition]: checked })

    const result = await updateSCCondition(character.id, condition as keyof typeof localConditions, checked)
    if (!result.success) {
      toast.error("Error", { description: "Failed to update condition" })
    }
  }

  const handleTokenChange = async (type: "interventionTokens" | "heroTokens", delta: number) => {
    const currentValue = type === "interventionTokens" ? interventionTokens : heroTokens
    const newValue = Math.max(0, currentValue + delta)

    if (type === "interventionTokens") {
      setInterventionTokens(newValue)
    } else {
      setHeroTokens(newValue)
    }

    // const result = await updateSCTokens(character.id, type, newValue)
    // if (!result.success) {
    //   toast.error("Error", { description: "Failed to update tokens" })
    // }
  }

  const handleAbilityClick = (abilityName: string, abilityValue: number) => {
    setSelectedSkill({ name: abilityName, value: abilityValue, type: "ability" })
    setRollModalOpen(true)
  }

  const handleSkillClick = (skillName: string, skillValue: number) => {
    if (!editMode) {
      setSelectedSkill({ name: skillName, value: skillValue, type: "skill" })
      setRollModalOpen(true)
    }
  }

  const handleTestCountChange = useCallback(
    async (skill: string, type: "successes" | "failures", delta: number, e: React.MouseEvent) => {
      e.stopPropagation()

      const tests = character.skillTests?.[skill] || { successes: 0, failures: 0 }
      const newSuccesses = type === "successes" ? Math.max(0, tests.successes + delta) : tests.successes
      const newFailures = type === "failures" ? Math.max(0, tests.failures + delta) : tests.failures

      const result = await updateSkillTest(character.id, skill, newSuccesses, newFailures)
      if (result.success) {
        toast("Test Count Updated", { description: `${type} count for ${skill} updated successfully` })
      } else {
        toast.error("Error", { description: result.error || "Failed to update skill tests" })
      }
    },
    [character.id, character.skillTests],
  )

  const handleSkillLevelChange = useCallback(
    async (skill: string, delta: number, e: React.MouseEvent) => {
      e.stopPropagation()

      const currentLevel = character.skills[skill] || 0
      const newLevel = Math.max(0, currentLevel + delta)

      const result = await updateSCSkillLevel(character.id, skill, newLevel)
      if (result.success) {
        toast("Skill Updated", { description: `${skill} level changed to ${newLevel}. Tests reset.` })
      } else {
        toast.error("Error", { description: result.error || "Failed to update skill" })
      }
    },
    [character.id, character.skills],
  )

  const handleAddItem = useCallback(async () => {
    if (!newItemName.trim()) return

    const result = await addInventoryItem(character.id, newItemName.trim())
    if (result.success) {
      setInventory([...inventory, newItemName.trim()])
      setNewItemName("")
      toast("Item Added", { description: `${newItemName} added to inventory` })
    } else {
      toast.error("Error", { description: result.error || "Failed to add item" })
    }
  }, [character.id, newItemName, inventory])

  const handleEditItem = useCallback((index: number, currentName: string) => {
    setEditingItemIndex(index)
    setEditingItemName(currentName)
  }, [])

  const handleSaveEdit = useCallback(
    async (index: number) => {
      if (!editingItemName.trim()) return

      const result = await updateInventoryItem(character.id, index, editingItemName.trim())
      if (result.success) {
        const updatedInventory = [...inventory]
        updatedInventory[index] = editingItemName.trim()
        setInventory(updatedInventory)
        setEditingItemIndex(null)
        setEditingItemName("")
        toast("Item Updated", { description: "Item name updated successfully" })
      } else {
        toast.error("Error", { description: result.error || "Failed to update item" })
      }
    },
    [character.id, editingItemName, inventory],
  )

  const handleCancelEdit = useCallback(() => {
    setEditingItemIndex(null)
    setEditingItemName("")
  }, [])

  const handleDeleteItem = useCallback(
    async (index: number) => {
      const result = await deleteInventoryItem(character.id, index)
      if (result.success) {
        setInventory(inventory.filter((_, i) => i !== index))
        toast("Item Removed", { description: "Item removed from inventory" })
      } else {
        toast.error("Error", { description: result.error || "Failed to remove item" })
      }
    },
    [character.id, inventory],
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeConditions = Object.entries(localConditions).filter(([_, active]) => active)

  return (
    <div className="space-y-6">
      <CharacterHeader
        name={character.name}
        pronouns={character.pronouns}
        concept={character.concept}
        activeConditions={activeConditions}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AbilitiesCard
          abilities={localAbilities}
          abilityTests={character.abilityTests || {}}
          onAbilityChange={handleAbilityChange}
          onAbilityClick={handleAbilityClick}
        />
        <TokensCard interventionTokens={interventionTokens} heroTokens={heroTokens} onTokenChange={handleTokenChange} />
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions">
          <ConditionsTab conditions={localConditions} onConditionChange={handleConditionChange} />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab
            skills={character.skills}
            skillTests={character.skillTests as Record<string, { successes: number; failures: number }> | undefined}
            editMode={editMode}
            onEditModeToggle={() => setEditMode(!editMode)}
            onSkillClick={handleSkillClick}
            onSkillLevelChange={handleSkillLevelChange}
            onTestCountChange={handleTestCountChange}
          />
        </TabsContent>

        <TabsContent value="items">
          <InventoryTab
            inventory={inventory}
            newItemName={newItemName}
            editingItemIndex={editingItemIndex}
            editingItemName={editingItemName}
            onNewItemNameChange={setNewItemName}
            onEditingItemNameChange={setEditingItemName}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onDeleteItem={handleDeleteItem}
          />
        </TabsContent>

        <TabsContent value="background">
          <BackgroundTab
            homeworld={character.homeworld}
            upbringing={character.upbringing}
            beliefs={character.beliefs}
            instincts={character.instincts}
            goals={character.goals}
          />
        </TabsContent>
      </Tabs>

      {selectedSkill && (
        <SkillRollModal
          isOpen={rollModalOpen}
          onClose={() => {
            setRollModalOpen(false)
            setSelectedSkill(null)
          }}
          skillName={selectedSkill.name}
          skillValue={selectedSkill.value}
          characterId={character.id}
          skillTests={
            selectedSkill.type === "ability"
              ? character.abilityTests?.[selectedSkill.name]
              : character.skillTests?.[selectedSkill.name]
          }
          type={selectedSkill.type}
        />
      )}
    </div>
  )
}
