/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  updateSCAbility,
  updateSkillTest,
  updateSCSkillLevel,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateMindchipBoost,
} from "@/app/actions/sc-characters"
import {
  addConditionToCharacter,
  removeConditionFromCharacter,
  getConditionsForCharacter,
  getConditions,
} from "@/app/actions/conditions"
import { updateGlobalTokens } from "@/app/actions/global-tokens"
import { getAllSkills, updateSkill } from "@/app/actions/sc-skills"

import { toast } from "sonner"
import { SkillRollModal } from "./SkillRollModal"
import { CharacterHeader } from "./play-mode/CharacterHeader"
import { AbilitiesCard } from "./play-mode/AbilitiesCard"
import { TokensCard } from "./play-mode/TokensCard"
import { ConditionsTab } from "./play-mode/ConditionsTab"
import { SkillsTab } from "./play-mode/SkillsTab"
import { InventoryTab } from "./play-mode/InventoryTab"
import { SCCharacter } from "@/db/schema/sc-character"
import { SCSkill } from "@/db/schema/sc-skills"
import { BackgroundTab } from "./play-mode/BackgroundTable"
import { GlobalCondition } from "@/db/schema/conditions"

interface SCPlayModeProps {
  character: SCCharacter
  initialGlobalTokens: number
}


/**
 * Renders the main interface for "play mode" for a Special Circumstances character.
 * This component manages the character's abilities, skills, conditions, inventory, and more,
 * allowing for real-time updates and interactions during a game session.
 * @param {SCPlayModeProps} props - The props for the component, including the character data.
 */
export function SCPlayMode({ character, initialGlobalTokens }: SCPlayModeProps) {

  // Local state for character abilities, allowing for optimistic updates.
  const [localAbilities, setLocalAbilities] = useState(character.abilities)
  // State for the global intervention tokens.
  const [interventionTokens, setInterventionTokens] = useState(initialGlobalTokens)
  // State for the character's inventory.
  const [inventory, setInventory] = useState<string[]>(character.inventory || [])
  // State to toggle the edit mode for skills and other fields.
  const [editMode, setEditMode] = useState(false)
  // State for the name of a new inventory item being added.
  const [newItemName, setNewItemName] = useState("")
  // State to track the index of the inventory item being edited.
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  // State for the name of the inventory item being edited.
  const [editingItemName, setEditingItemName] = useState("")

  // State for Mindchip boosts applied to skills.
  const [mindchipBoosts, setMindchipBoosts] = useState<Record<string, number>>(character.mindchipBoosts || {})
  // State for the character's current conditions.
  const [characterConditions, setCharacterConditions] = useState<GlobalCondition[]>([]);
  // State for all available global conditions.
  const [allGlobalConditions, setAllGlobalConditions] = useState<GlobalCondition[]>([]);

  // State for all available skills in the system.
  const [allSkills, setAllSkills] = useState<SCSkill[]>([])
  // Loading state for fetching skills.
  const [skillsLoading, setSkillsLoading] = useState(true)

  // State for the skill or ability currently selected for a roll.
  const [selectedSkill, setSelectedSkill] = useState<{
    name: string
    value: number
    type: "skill" | "ability"
    skillId?: string
    ability?: string
    mindchipBoost?: number
  } | null>(null)
  // State to control the visibility of the skill roll modal.
  const [rollModalOpen, setRollModalOpen] = useState(false)

  

  // --- Data Fetching Functions ---

  /**
   * Fetches all skills from the database and updates the local state.
   */
  const fetchSkills = async () => {
    const result = await getAllSkills()
    if (result.success && result.skills) {
      setAllSkills(result.skills)
    }
    setSkillsLoading(false)
  }

  /**
   * Fetches the conditions currently applied to the character.
   */
  const fetchCharacterConditions = useCallback(async () => {
    const result = await getConditionsForCharacter(character.id);
    if (result.success && result.data) {
      setCharacterConditions(result.data);
    } else {
      toast.error("Error fetching character conditions", { description: result.error });
    }
  }, [character.id]);

  /**
   * Fetches all global conditions available in the system.
   */
  const fetchAllGlobalConditions = useCallback(async () => {
    const result = await getConditions();
    if (result.success && result.data) {
      setAllGlobalConditions(result.data);
    } else {
      toast.error("Error fetching global conditions", { description: result.error });
    }
  }, []);


  /**
   * Fetches all necessary data when the component mounts, including
   * all skills, the character's current conditions, and all available global conditions.
   */
  useEffect(() => {
    fetchSkills();
    fetchCharacterConditions();
    fetchAllGlobalConditions();
  }, [character.id, fetchAllGlobalConditions, fetchCharacterConditions]);


  // --- Event Handlers ---

  /**
   * Handles changes to a character's ability score.
   * Updates the local state optimistically and then sends the update to the server.
   * @param ability - The name of the ability to change.
   * @param delta - The amount to change the ability by (e.g., 1 or -1).
   */
  const handleAbilityChange = async (ability: string, delta: number) => {
    const newValue = Math.max(0, localAbilities[ability as keyof typeof localAbilities] + delta)
    setLocalAbilities({ ...localAbilities, [ability]: newValue })

    const result = await updateSCAbility(character.id, ability as keyof typeof localAbilities, newValue)
    if (!result.success) {
      toast.error("Error", { description: "Failed to update ability" })
    } else {
      window.location.reload()
    }
  }

  /**
   * Handles adding or removing a condition from the character.
   * @param conditionId - The ID of the condition to add or remove.
   * @param checked - Whether the condition is being added or removed.
   */
  const handleConditionChange = async (conditionId: string, checked: boolean) => {
    let result;
    if (checked) {
      result = await addConditionToCharacter(character.id, conditionId);
    } else {
      result = await removeConditionFromCharacter(character.id, conditionId);
    }

    if (result.success) {
      toast.success("Condition updated successfully.");
      fetchCharacterConditions(); // Re-fetch conditions to update UI
    } else {
      toast.error(result.error || "Failed to update condition");
    }
  };

  /**
   * Handles changes to the global intervention tokens.
   * Updates the local state and then sends the update to the server.
   * @param delta - The amount to change the tokens by.
   */
  const handleTokenChange = async (delta: number) => {
    const newValue = Math.max(0, interventionTokens + delta)
    setInterventionTokens(newValue)

    const result = await updateGlobalTokens(delta)
    if (!result.success) {
      toast.error("Error", { description: result.error || "Failed to update tokens" })
      // Revert on error
      setInterventionTokens(interventionTokens)
    }
  }

  /**
   * Opens the skill roll modal when an ability is clicked.
   * @param abilityName - The name of the ability.
   * @param abilityValue - The current value of the ability.
   */
  const handleAbilityClick = (abilityName: string, abilityValue: number) => {
    setSelectedSkill({ name: abilityName, value: abilityValue, type: "ability" })
    setRollModalOpen(true)
  }

  /**
   * Opens the skill roll modal when a skill is clicked.
   * @param skillName - The name of the skill.
   * @param skillValue - The current value of the skill.
   */
  const handleSkillClick = (skillName: string, skillValue: number) => {
    console.log("hangdle it")
    console.log("skill click", skillName, skillValue)
    if (!editMode) {
      const skillInfo = allSkills.find((s) => s.name === skillName)
      const boost = mindchipBoosts[skillName] || 0
      setSelectedSkill({
        name: skillName,
        value: skillValue,
        type: "skill",
        skillId: skillInfo?.id,
        ability: skillInfo?.ability,
        mindchipBoost: boost,
      })
      setRollModalOpen(true)
    }
  }

  /**
   * Handles changes to the success/failure counts for a skill test.
   * @param skill - The name of the skill.
   * @param type - Whether to change "successes" or "failures".
   * @param delta - The amount to change the count by.
   * @param e - The mouse event, to stop propagation.
   */
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

  /**
   * Handles changes to a skill's level.
   * @param skill - The name of the skill.
   * @param delta - The amount to change the level by.
   * @param e - The mouse event, to stop propagation.
   */
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

  /**
   * Handles changes to a skill's Mindchip boost.
   * @param skillName - The name of the skill.
   * @param delta - The amount to change the boost by.
   * @param e - The mouse event, to stop propagation.
   */
  const handleMindchipBoostChange = useCallback(
    async (skillName: string, delta: number, e: React.MouseEvent) => {
      e.stopPropagation()

      const currentBoost = mindchipBoosts[skillName] || 0
      const newBoost = Math.max(0, currentBoost + delta)

      const result = await updateMindchipBoost(character.id, skillName, newBoost)
      if (result.success) {
        setMindchipBoosts({ ...mindchipBoosts, [skillName]: newBoost })
        toast("Mindchip Boost Updated", {
          description: `${skillName} now has ${newBoost > 0 ? `+${newBoost}` : "no"} Mindchip boost`,
        })
      } else {
        toast.error("Error", { description: result.error || "Failed to update Mindchip boost" })
      }
    },
    [character.id, mindchipBoosts],
  )

    // --- Inventory Management Handlers ---

  /**
   * Handles adding a new item to the inventory.
   */
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

  /**
   * Enters edit mode for a specific inventory item.
   * @param index - The index of the item to edit.
   * @param currentName - The current name of the item.
   */
  const handleEditItem = useCallback((index: number, currentName: string) => {
    setEditingItemIndex(index)
    setEditingItemName(currentName)
  }, [])

  /**
   * Saves the changes to an inventory item being edited.
   * @param index - The index of the item being saved.
   */
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

  /**
   * Cancels the edit mode for an inventory item.
   */
  const handleCancelEdit = useCallback(() => {
    setEditingItemIndex(null)
    setEditingItemName("")
  }, [])

  /**
   * Deletes an item from the inventory.
   * @param index - The index of the item to delete.
   */
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

  // --- Skill Management Handlers ---

  /**
   * Handles changing the associated ability for a skill.
   * @param skillId - The ID of the skill to update.
   * @param newAbility - The new ability to associate with the skill.
   * @param e - The mouse event, to stop propagation.
   */
  const handleSkillAbilityChange = useCallback(
    async (skillId: string, newAbility: string, e: React.MouseEvent) => {
      e.stopPropagation()

      const skill = allSkills.find((s) => s.id === skillId)
      if (!skill) return

      const result = await updateSkill(skillId, {
        name: skill.name,
        ability: newAbility,
        category: skill.category,
      })

      if (result.success) {
        // Update local state
        setAllSkills(allSkills.map((s) => (s.id === skillId ? { ...s, ability: newAbility } : s)))
        toast("Skill Updated", { description: `${skill.name} now uses ${newAbility}` })
      } else {
        toast.error("Error", { description: result.error || "Failed to update skill ability" })
      }
    },
    [allSkills],
  )

  const activeConditions = characterConditions.map((cond) => [
    cond.name,
    true,
  ]) as Array<[string, boolean]>;

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
        <TokensCard interventionTokens={interventionTokens} onTokenChange={handleTokenChange} />
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions">
          <ConditionsTab
            allGlobalConditions={allGlobalConditions}
            characterConditions={characterConditions}
            onConditionChange={handleConditionChange}
            onConditionCreated={fetchAllGlobalConditions}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab
            allSkills={allSkills}
            characterSkills={character.skills}
            mindchipBoosts={mindchipBoosts}
            skillTests={character.skillTests as Record<string, { successes: number; failures: number }>}
            editMode={editMode}
            skillsLoading={skillsLoading}
            mindchipLevel={localAbilities.Mindchip}
            onEditModeToggle={() => setEditMode(!editMode)}
            onSkillClick={handleSkillClick}
            onSkillLevelChange={handleSkillLevelChange}
            onTestCountChange={handleTestCountChange}
            onAbilityChange={handleSkillAbilityChange}
            onMindchipBoostChange={handleMindchipBoostChange}
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
          abilityValue={
            selectedSkill.ability
              ? (character.abilities[selectedSkill.ability as keyof typeof character.abilities] as number)
              : undefined
          }
          mindchipBoost={selectedSkill.type === "skill" ? selectedSkill.mindchipBoost || 0 : 0}
          activeConditions={characterConditions}
          abilityName={selectedSkill.ability || ""}
        />
      )}
    </div>
  )
}
