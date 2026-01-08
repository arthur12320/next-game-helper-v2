"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Trash2 } from "lucide-react"
import { updateSCCharacter, deleteSCCharacter } from "@/app/actions/sc-characters"
import { SCCharacter } from "@/db/schema/sc-character"
import { toast } from "sonner"
import { HomeworldStep } from "./HomeworldStep"
import { UpbringingStep } from "./UpbringingStep"
import { LifepathsStep } from "./LifepathsStep"
import { ConnectionsStep } from "./ConnectionsStep"
import { AbilitiesStep } from "./AbilitiesStep"
import { SkillsStep } from "./SkillsStep"

interface SCEditFormProps {
  character: SCCharacter
}

export function SCEditForm({ character }: SCEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [characterData, setCharacterData] = useState<SCCharacter>(character)

  const handleUpdate = useCallback((updates: Partial<SCCharacter>) => {
    setCharacterData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateSCCharacter(character.id, characterData)

      if (result.success) {
        toast("Agent Updated", { description: "Changes saved successfully" })
        // router.push(`/sc-characters/${character.id}/play`)
        // router.refresh()
      } else {
        toast.error("Error", { description: result.error || "Failed to update agent" })
      }
    } catch (error) {
      console.log(error)
      toast.error("Error", { description: "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteSCCharacter(character.id)
      if (result.success) {
        toast("Agent Deleted", { description: "The agent has been permanently removed." })
        router.push("/sc-characters")
        router.refresh()
      } else {
        toast.error("Error", { description: result.error || "Failed to delete agent." })
      }
    } catch (error) {
      console.log(error)
      toast.error("Error", { description: "An unexpected error occurred during deletion." })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="abilities">Abilities</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={characterData.name}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={characterData.pronouns || ""}
                  onChange={(e) => handleUpdate({ pronouns: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="concept">Concept</Label>
                <Textarea
                  id="concept"
                  value={characterData.concept || ""}
                  onChange={(e) => handleUpdate({ concept: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Character Development</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="beliefs">Beliefs</Label>
                <Textarea
                  id="beliefs"
                  value={characterData.beliefs || ""}
                  onChange={(e) => handleUpdate({ beliefs: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instincts">Instincts</Label>
                <Textarea
                  id="instincts"
                  value={characterData.instincts || ""}
                  onChange={(e) => handleUpdate({ instincts: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={characterData.goals || ""}
                  onChange={(e) => handleUpdate({ goals: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="background" className="mt-6">
          <div className="space-y-6">
            <HomeworldStep data={characterData} onUpdate={handleUpdate} />
            <UpbringingStep data={characterData} onUpdate={handleUpdate} />
            <LifepathsStep data={characterData} onUpdate={handleUpdate} />
            <ConnectionsStep data={characterData} onUpdate={handleUpdate} />
          </div>
        </TabsContent>

        <TabsContent value="abilities" className="mt-6">
          <AbilitiesStep data={characterData} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillsStep data={characterData} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Agent
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {character.name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
