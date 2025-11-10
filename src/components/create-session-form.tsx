"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createSession } from "@/app/actions/sessions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CreateSessionFormProps {
  campaignId: string
}

export default function CreateSessionForm({ campaignId }: CreateSessionFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const session = await createSession(campaignId, title)
        toast.success("Session started!")
        setOpen(false)
        setTitle("")
        router.push(`/sessions/${session.id}`)
      } catch (error) {
        toast.error("Failed to create session")
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Start New Session</DialogTitle>
            <DialogDescription>Begin tracking a new game session</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="e.g., 'The Journey to Darkheather'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Starting..." : "Start Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
