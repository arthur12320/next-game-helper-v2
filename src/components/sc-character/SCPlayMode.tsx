"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Coins, Dices, Settings, Package, Pencil, Trash2, Check, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  updateSCCondition,
  updateSCAbility,
  updateSCTokens,
  updateSkillTest,
  updateSCSkillLevel,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/app/actions/sc-characters"
import { SCCharacter } from "@/db/schema/sc-character"
import { toast } from "sonner"

interface SCPlayModeProps {
  character: SCCharacter
}

export function SCPlayMode({ character }: SCPlayModeProps) {

  const [localConditions, setLocalConditions] = useState(character.conditions)
  const [localAbilities, setLocalAbilities] = useState(character.abilities)
  const [interventionTokens, setInterventionTokens] = useState(character.interventionTokens)
  const [heroTokens, setHeroTokens] = useState(character.heroTokens)
  const [editMode, setEditMode] = useState(false)

  const [selectedSkill, setSelectedSkill] = useState<{ name: string; level: number } | null>(null)

  const [inventory, setInventory] = useState<string[]>(character.inventory || [])
  const [newItemName, setNewItemName] = useState("")
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editingItemName, setEditingItemName] = useState("")

  const handleAbilityChange = async (ability: keyof typeof localAbilities, delta: number) => {
    const newValue = Math.max(0, localAbilities[ability] + delta)
    setLocalAbilities({ ...localAbilities, [ability]: newValue })

    const result = await updateSCAbility(character.id, ability, newValue)
    if (!result.success) {
      toast.error("Error",{
        description: "Failed to update ability",
      })
    }
  }

  const handleConditionChange = async (condition: keyof typeof localConditions, checked: boolean) => {
    setLocalConditions({ ...localConditions, [condition]: checked })

    const result = await updateSCCondition(character.id, condition, checked)
    if (!result.success) {
      toast.error("Error",{
        description: "Failed to update condition",
      })
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

    const result = await updateSCTokens(character.id, type, newValue)
    if (!result.success) {
      toast.error("Error",{
        description: "Failed to update tokens",
      })
    }
  }

  const handleSkillClick = (skillName: string, skillValue: number) => {
    if (!editMode) {
      setSelectedSkill({ name: skillName, level: skillValue })
      // Assuming SkillRollModal is defined elsewhere to handle skill rolls
      // setRollModalOpen(true)
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
        toast("Test Count Updated",{
          description: `${type} count for ${skill} updated successfully`,
        })
      } else {
        toast.error("Error",{
          description: result.error || "Failed to update skill tests",
        })
      }
    },
    [character.id, character.skillTests, toast],
  )

  const handleSkillLevelChange = useCallback(
    async (skill: string, delta: number, e: React.MouseEvent) => {
      e.stopPropagation()

      const currentLevel = character.skills[skill] || 0
      const newLevel = Math.max(0, currentLevel + delta)

      const result = await updateSCSkillLevel(character.id, skill, newLevel)
      if (result.success) {
        toast("Skill Updated",{
          description: `${skill} level changed to ${newLevel}. Tests reset.`,
        })
      } else {
        toast.error("Error",{
          description: result.error || "Failed to update skill",
        })
      }
    },
    [character.id, character.skills, toast],
  )

  const handleAddItem = useCallback(async () => {
    if (!newItemName.trim()) return

    const result = await addInventoryItem(character.id, newItemName.trim())
    if (result.success) {
      setInventory([...inventory, newItemName.trim()])
      setNewItemName("")
      toast("Item Added",{
        description: `${newItemName} added to inventory`,
      })
    } else {
      toast.error("Error",{
        description: result.error || "Failed to add item",
      })
    }
  }, [character.id, newItemName, inventory, toast])

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
        toast("Item Updated",{
          description: "Item name updated successfully",
        })
      } else {
        toast.error("Error",{
          description: result.error || "Failed to update item",
        })
      }
    },
    [character.id, editingItemName, inventory, toast],
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
        toast("Item Removed",{ 
          description: "Item removed from inventory",
        })
      } else {
        toast.error("Error",{
          description: result.error || "Failed to remove item",
        })
      }
    },
    [character.id, inventory, toast],
  )

  const topSkills = Object.entries(character.skills)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)

  const allSkills = Object.entries(character.skills).sort(([a], [b]) => a.localeCompare(b))

  const activeConditions = Object.entries(localConditions).filter(([_, active]) => active)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{character.name}</h1>
          {character.pronouns && <p className="text-muted-foreground mt-1">{character.pronouns}</p>}
          {character.concept && <p className="text-sm mt-2 max-w-2xl">{character.concept}</p>}
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Agent
        </Badge>
      </div>

      {activeConditions.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Active Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeConditions.map(([condition]) => (
                <Badge key={condition} variant="destructive">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(localAbilities).map(([ability, value]) => (
              <div key={ability} className="flex items-center justify-between p-3 bg-secondary/50 rounded">
                <span className="font-semibold">{ability}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAbilityChange(ability as keyof typeof localAbilities, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{value}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAbilityChange(ability as keyof typeof localAbilities, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded">
              <span className="font-semibold">Intervention Tokens</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => handleTokenChange("interventionTokens", -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{interventionTokens}</span>
                <Button size="icon" variant="outline" onClick={() => handleTokenChange("interventionTokens", 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded">
              <span className="font-semibold">Hero Tokens</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => handleTokenChange("heroTokens", -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{heroTokens}</span>
                <Button size="icon" variant="outline" onClick={() => handleTokenChange("heroTokens", 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Condition Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(localConditions).map(([condition, active]) => (
                  <div key={condition} className="flex items-center space-x-2 p-3 rounded border">
                    <Checkbox
                      id={condition}
                      checked={active}
                      onCheckedChange={(checked) =>
                        handleConditionChange(condition as keyof typeof localConditions, checked as boolean)
                      }
                    />
                    <Label htmlFor={condition} className="flex-1 cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dices className="h-5 w-5" />
                  Skills
                </CardTitle>
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {editMode ? "Done Editing" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Trained Skills</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {topSkills.map(([skill, value]) => {
                        const tests = character.skillTests?.[skill]
                        return (
                          <div
                            key={skill}
                            onClick={() => handleSkillClick(skill, value)}
                            className="flex justify-between items-center p-3 bg-primary/10 hover:bg-primary/20 rounded transition-colors cursor-pointer border border-primary/20"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium truncate">{skill}</span>
                                {editMode ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5"
                                      onClick={(e) => handleSkillLevelChange(skill, -1, e)}
                                      title="Decrease skill level (resets tests)"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Badge variant="default" className="text-xs">
                                      {value}
                                    </Badge>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5"
                                      onClick={(e) => handleSkillLevelChange(skill, 1, e)}
                                      title="Increase skill level (resets tests)"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="default" className="text-xs">
                                    {value}
                                  </Badge>
                                )}
                              </div>
                              {tests && (tests.successes > 0 || tests.failures > 0) && (
                                <div className="flex gap-2">
                                  {editMode ? (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "successes", -1, e)}
                                        >
                                          <Minus className="h-3 w-3 text-green-700" />
                                        </Button>
                                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                                          {tests.successes}S
                                        </Badge>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "successes", 1, e)}
                                        >
                                          <Plus className="h-3 w-3 text-green-700" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "failures", -1, e)}
                                        >
                                          <Minus className="h-3 w-3 text-red-700" />
                                        </Button>
                                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                                          {tests.failures}F
                                        </Badge>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "failures", 1, e)}
                                        >
                                          <Plus className="h-3 w-3 text-red-700" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                                        {tests.successes}S
                                      </Badge>
                                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                                        {tests.failures}F
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">All Skills (Untrained)</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {allSkills
                      .filter(([_, value]) => value === 0)
                      .map(([skill, value]) => {
                        const tests = character.skillTests?.[skill]
                        return (
                          <div
                            key={skill}
                            onClick={() => handleSkillClick(skill, value)}
                            className="flex justify-between items-center p-3 bg-secondary/50 hover:bg-secondary rounded transition-colors cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-muted-foreground truncate">{skill}</span>
                                {editMode ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5"
                                      onClick={(e) => handleSkillLevelChange(skill, -1, e)}
                                      title="Decrease skill level (resets tests)"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Badge variant="secondary" className="text-xs">
                                      {value}
                                    </Badge>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5"
                                      onClick={(e) => handleSkillLevelChange(skill, 1, e)}
                                      title="Increase skill level (resets tests)"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {value}
                                  </Badge>
                                )}
                              </div>
                              {tests && (tests.successes > 0 || tests.failures > 0) && (
                                <div className="flex gap-2">
                                  {editMode ? (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "successes", -1, e)}
                                        >
                                          <Minus className="h-3 w-3 text-green-700" />
                                        </Button>
                                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                                          {tests.successes}S
                                        </Badge>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "successes", 1, e)}
                                        >
                                          <Plus className="h-3 w-3 text-green-700" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "failures", -1, e)}
                                        >
                                          <Minus className="h-3 w-3 text-red-700" />
                                        </Button>
                                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                                          {tests.failures}F
                                        </Badge>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-4 w-4 p-0"
                                          onClick={(e) => handleTestCountChange(skill, "failures", 1, e)}
                                        >
                                          <Plus className="h-3 w-3 text-red-700" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                                        {tests.successes}S
                                      </Badge>
                                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700">
                                        {tests.failures}F
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new item..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem()
                      }
                    }}
                  />
                  <Button onClick={handleAddItem} size="icon" disabled={!newItemName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {inventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No items in inventory</p>
                ) : (
                  <div className="space-y-2">
                    {inventory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-secondary/50 rounded border hover:bg-secondary transition-colors"
                      >
                        {editingItemIndex === index ? (
                          <>
                            <Input
                              value={editingItemName}
                              onChange={(e) => setEditingItemName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(index)
                                } else if (e.key === "Escape") {
                                  handleCancelEdit()
                                }
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(index)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1">{item}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditItem(index, item)}
                              title="Edit item"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteItem(index)}
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="background">
          <Card>
            <CardHeader>
              <CardTitle>Background & Development</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.homeworld && (
                <div>
                  <h4 className="font-semibold mb-1">Homeworld</h4>
                  <p className="text-sm text-muted-foreground">{character.homeworld}</p>
                </div>
              )}
              {character.upbringing && (
                <div>
                  <h4 className="font-semibold mb-1">Upbringing</h4>
                  <p className="text-sm text-muted-foreground">{character.upbringing}</p>
                </div>
              )}
              {character.beliefs && (
                <div>
                  <h4 className="font-semibold mb-1">Beliefs</h4>
                  <p className="text-sm text-muted-foreground">{character.beliefs}</p>
                </div>
              )}
              {character.instincts && (
                <div>
                  <h4 className="font-semibold mb-1">Instincts</h4>
                  <p className="text-sm text-muted-foreground">{character.instincts}</p>
                </div>
              )}
              {character.goals && (
                <div>
                  <h4 className="font-semibold mb-1">Goals</h4>
                  <p className="text-sm text-muted-foreground">{character.goals}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
