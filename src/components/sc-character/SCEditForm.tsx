"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateSCCharacter, deleteSCCharacter } from "@/app/actions/sc-characters"
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
import { SCCharacter } from "@/db/schema/sc-character"
import { toast } from "sonner"

interface SCEditFormProps {
  character: SCCharacter
}

export function SCEditForm({ character }: SCEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: character.name,
    pronouns: character.pronouns || "",
    concept: character.concept || "",
    homeworld: character.homeworld || "",
    upbringing: character.upbringing || "",
    beliefs: character.beliefs || "",
    instincts: character.instincts || "",
    goals: character.goals || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateSCCharacter(character.id, formData)

      if (result.success) {
        toast("Agent Updated",{
          description: "Changes saved successfully",
        })
        router.push(`/sc-characters/${character.id}/play`)
      } else {
        toast.error("Error",{
          description: result.error || "Failed to update agent",
        })
      }
    } catch (error) {
      console.log(error)
      toast.error("Error",{
        description: "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteSCCharacter(character.id)

      if (result.success) {
        toast("Agent Deleted",{
          description: "Agent has been removed",
        })
        router.push("/sc-characters")
      } else {
        toast.error("Error",{
          description: result.error || "Failed to delete agent",
        })
      }
    } catch (error) {
      console.log(error)
      toast.error("Error",{
        description: "An unexpected error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Input
              id="pronouns"
              value={formData.pronouns}
              onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concept</Label>
            <Textarea
              id="concept"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homeworld">Homeworld</Label>
            <Input
              id="homeworld"
              value={formData.homeworld}
              onChange={(e) => setFormData({ ...formData, homeworld: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upbringing">Upbringing</Label>
            <Input
              id="upbringing"
              value={formData.upbringing}
              onChange={(e) => setFormData({ ...formData, upbringing: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Character Development</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beliefs">Beliefs</Label>
            <Textarea
              id="beliefs"
              value={formData.beliefs}
              onChange={(e) => setFormData({ ...formData, beliefs: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instincts">Instincts</Label>
            <Textarea
              id="instincts"
              value={formData.instincts}
              onChange={(e) => setFormData({ ...formData, instincts: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

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
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
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
