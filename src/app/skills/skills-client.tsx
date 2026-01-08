"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Dices, Plus, Loader2, Edit, Trash } from "lucide-react"
import { createSkill, updateSkill, deleteSkill } from "@/app/actions/sc-skills"
import { toast } from "sonner"
import { SCSkill } from "@/db/schema/sc-skills"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SkillsClientProps {
  skills: SCSkill[]
}

export function SkillsClient({ skills }: SkillsClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [skillToEdit, setSkillToEdit] = useState<SCSkill | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // State for new skill
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillAbility, setNewSkillAbility] = useState("")
  const [newSkillCategory, setNewSkillCategory] = useState("")

  const skillsByCategory = useMemo(() => {
    const categories: Record<string, SCSkill[]> = {}
    skills.forEach((skill) => {
      if (!categories[skill.category]) {
        categories[skill.category] = []
      }
      categories[skill.category].push(skill)
    })
    return categories
  }, [skills])

  const handleCreateSkill = async () => {
    if (!newSkillName.trim() || !newSkillAbility || !newSkillCategory) {
      toast.error("Error", { description: "Please fill in all fields" })
      return
    }

    setIsCreating(true)
    const result = await createSkill({
      name: newSkillName.trim(),
      ability: newSkillAbility,
      category: newSkillCategory,
    })

    if (result.success) {
      toast("Skill Created", { description: `${newSkillName} has been created.` })
      setNewSkillName("")
      setNewSkillAbility("")
      setNewSkillCategory("")
      setCreateDialogOpen(false)
      window.location.reload()
    } else {
      toast.error("Error", { description: result.error || "Failed to create skill" })
    }
    setIsCreating(false)
  }
  
  const handleEditClick = (skill: SCSkill) => {
    setSkillToEdit(skill)
    setNewSkillName(skill.name)
    setNewSkillAbility(skill.ability)
    setNewSkillCategory(skill.category)
    setEditDialogOpen(true)
  }

  const handleUpdateSkill = async () => {
    if (!skillToEdit || !newSkillName.trim() || !newSkillAbility || !newSkillCategory) {
      toast.error("Error", { description: "Please fill in all fields" })
      return
    }

    setIsUpdating(true)
    const result = await updateSkill(skillToEdit.id, {
      name: newSkillName.trim(),
      ability: newSkillAbility,
      category: newSkillCategory,
    })

    if (result.success) {
      toast("Skill Updated", { description: `${newSkillName} has been updated.` })
      setEditDialogOpen(false)
      setSkillToEdit(null)
      window.location.reload()
    } else {
      toast.error("Error", { description: result.error || "Failed to update skill" })
    }
    setIsUpdating(false)
  }

  const handleDeleteSkill = async (id: string) => {
    setIsDeleting(true)
    const result = await deleteSkill(id)
    if (result.success) {
      toast("Skill Deleted", { description: "The skill has been deleted." })
      window.location.reload()
    } else {
      toast.error("Error", { description: result.error || "Failed to delete skill" })
    }
    setIsDeleting(false)
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Manage Skills</h3>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Skill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Skill Name</label>
                  <Input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Associated Ability</label>
                  <Select value={newSkillAbility} onValueChange={setNewSkillAbility}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Will">Will</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Resources">Resources</SelectItem>
                      <SelectItem value="Circles">Circles</SelectItem>
                      <SelectItem value="Mindchip">Mindchip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crafting">Crafting</SelectItem>
                      <SelectItem value="Exploration">Exploration</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Lore">Lore</SelectItem>
                      <SelectItem value="Combat">Combat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateSkill} disabled={isCreating} className="w-full">
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Skill"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skillList]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">{category}</h4>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {skillList.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-semibold">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.ability}</p>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleEditClick(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4 text-red-500" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the skill.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Skill Name</label>
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Associated Ability</label>
              <Select value={newSkillAbility} onValueChange={setNewSkillAbility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Will">Will</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Resources">Resources</SelectItem>
                  <SelectItem value="Circles">Circles</SelectItem>
                  <SelectItem value="Mindchip">Mindchip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crafting">Crafting</SelectItem>
                  <SelectItem value="Exploration">Exploration</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Lore">Lore</SelectItem>
                  <SelectItem value="Combat">Combat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateSkill} disabled={isUpdating} className="w-full">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Skill"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
