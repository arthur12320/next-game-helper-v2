"use client"

import { useState, useCallback, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, MapPin, BookOpen, Download, Save, CheckCircle } from "lucide-react"
import { updateSessionNotes, completeSession } from "@/app/actions/sessions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Session, SessionNotes } from "@/db/schema/rpgSessions"

interface SessionTrackerProps {
  session: Session
}

export default function SessionTracker({ session }: SessionTrackerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState<SessionNotes>(() => {
    if (typeof session.notes === "string") {
      return JSON.parse(session.notes)
    }
    return session.notes as SessionNotes
  })

  // Event tracking
  const [newEvent, setNewEvent] = useState("")

  const addEvent = useCallback(() => {
    if (!newEvent.trim()) return
    const timestamp = new Date().toLocaleTimeString()
    setNotes((prev) => ({
      ...prev,
      events: [...prev.events, { timestamp, description: newEvent }],
    }))
    setNewEvent("")
  }, [newEvent])

  // NPC tracking
  const [npcName, setNpcName] = useState("")
  const [npcNotes, setNpcNotes] = useState("")

  const addNPC = useCallback(() => {
    if (!npcName.trim()) return
    setNotes((prev) => ({
      ...prev,
      npcs: [...prev.npcs, { name: npcName, notes: npcNotes }],
    }))
    setNpcName("")
    setNpcNotes("")
  }, [npcName, npcNotes])

  // Location tracking
  const [locationName, setLocationName] = useState("")
  const [locationNotes, setLocationNotes] = useState("")

  const addLocation = useCallback(() => {
    if (!locationName.trim()) return
    setNotes((prev) => ({
      ...prev,
      locations: [...prev.locations, { name: locationName, notes: locationNotes }],
    }))
    setLocationName("")
    setLocationNotes("")
  }, [locationName, locationNotes])

  // General notes
  const updateGeneralNotes = useCallback((value: string) => {
    setNotes((prev) => ({ ...prev, generalNotes: value }))
  }, [])

  // Save notes
  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        await updateSessionNotes(session.id, notes)
        toast.success("Session notes saved!")
        router.refresh()
      } catch (error) {
        toast.error("Failed to save notes")
        console.error(error)
      }
    })
  }, [session.id, notes, router])

  // Complete session
  const handleComplete = useCallback(() => {
    startTransition(async () => {
      try {
        await completeSession(session.id)
        toast.success("Session completed! You can now convert it to a journal entry.")
        router.refresh()
      } catch (error) {
        toast.error("Failed to complete session")
        console.error(error)
      }
    })
  }, [session.id, router])

  // Export functions
  const exportMarkdown = useCallback(() => {
    const markdown = generateMarkdown(session, notes)
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `session-${session.sessionNumber}-${session.title.toLowerCase().replace(/\s+/g, "-")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Markdown exported!")
  }, [session, notes])

  const exportPDF = useCallback(() => {
    // Generate HTML for PDF printing
    const markdown = generateMarkdown(session, notes)
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Session ${session.sessionNumber}: ${session.title}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 { color: #1a202c; margin-bottom: 8px; }
            h2 { color: #2d3748; margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
            h3 { color: #4a5568; margin-top: 16px; }
            .metadata { color: #718096; margin-bottom: 24px; }
            ul { list-style-type: disc; padding-left: 20px; }
            li { margin: 8px 0; }
            pre { background: #f7fafc; padding: 16px; border-radius: 4px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${markdown}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      toast.success("PDF print dialog opened!")
    }, 250)
  }, [session, notes])

  const isCompleted = session.status === "completed"

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session in Progress
              </CardTitle>
              <CardDescription>Track events, NPCs, locations, and notes in real-time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isPending || isCompleted} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={exportMarkdown} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                .md
              </Button>
              <Button onClick={exportPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              {!isCompleted && (
                <Button onClick={handleComplete} disabled={isPending}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Tracker Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">
            <Clock className="h-4 w-4 mr-2" />
            Events ({notes.events.length})
          </TabsTrigger>
          <TabsTrigger value="npcs">
            <Users className="h-4 w-4 mr-2" />
            NPCs ({notes.npcs.length})
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="h-4 w-4 mr-2" />
            Locations ({notes.locations.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <BookOpen className="h-4 w-4 mr-2" />
            General Notes
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Event Logger</CardTitle>
              <CardDescription>Track key moments as they happen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What just happened? (e.g., 'Party encounters bandits')"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEvent()}
                  disabled={isCompleted}
                />
                <Button onClick={addEvent} disabled={isCompleted}>
                  Add
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notes.events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No events logged yet</p>
                ) : (
                  notes.events.map((event, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="shrink-0">
                        {event.timestamp}
                      </Badge>
                      <p className="flex-1">{event.description}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NPCs Tab */}
        <TabsContent value="npcs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NPC Tracker</CardTitle>
              <CardDescription>Remember the characters you meet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="npc-name">NPC Name</Label>
                  <Input
                    id="npc-name"
                    placeholder="e.g., 'Celanawe the Elder'"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    disabled={isCompleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npc-notes">Notes</Label>
                  <Textarea
                    id="npc-notes"
                    placeholder="Description, role, relationship to party..."
                    value={npcNotes}
                    onChange={(e) => setNpcNotes(e.target.value)}
                    disabled={isCompleted}
                  />
                </div>
                <Button onClick={addNPC} disabled={isCompleted}>
                  Add NPC
                </Button>
              </div>

              <Separator />

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.npcs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No NPCs tracked yet</p>
                ) : (
                  notes.npcs.map((npc, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{npc.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{npc.notes || "No notes"}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Tracker</CardTitle>
              <CardDescription>Track where your adventures take you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input
                    id="location-name"
                    placeholder="e.g., 'Lockhaven', 'Darkheather'"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    disabled={isCompleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location-notes">Notes</Label>
                  <Textarea
                    id="location-notes"
                    placeholder="Description, dangers, resources..."
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                    disabled={isCompleted}
                  />
                </div>
                <Button onClick={addLocation} disabled={isCompleted}>
                  Add Location
                </Button>
              </div>

              <Separator />

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.locations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No locations tracked yet</p>
                ) : (
                  notes.locations.map((location, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{location.notes || "No notes"}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Session Notes</CardTitle>
              <CardDescription>Free-form notes about the session</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Overall session notes, memorable moments, party decisions, GM notes..."
                value={notes.generalNotes}
                onChange={(e) => updateGeneralNotes(e.target.value)}
                className="min-h-96"
                disabled={isCompleted}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isCompleted && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Session Completed!</CardTitle>
            <CardDescription>
              This session has been marked as complete. Export it as Markdown for Obsidian, or use the data to create a
              journal entry.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

// Helper function to generate Markdown export
function generateMarkdown(session: Session, notes: SessionNotes): string {
  const startDate = new Date(session.startDate)
  const endDate = session.endDate ? new Date(session.endDate) : null
  const duration = endDate ? Math.round((endDate.getTime() - startDate.getTime()) / 1000 / 60) : null

  let markdown = `# Session ${session.sessionNumber}: ${session.title}\n\n`
  markdown += `**Date**: ${startDate.toLocaleDateString()}\n`
  markdown += `**Time**: ${startDate.toLocaleTimeString()}`
  if (endDate) {
    markdown += ` - ${endDate.toLocaleTimeString()}`
    if (duration) markdown += ` (${duration} minutes)`
  }
  markdown += `\n**Status**: ${session.status}\n\n`

  if (session.summary) {
    markdown += `## Summary\n\n${session.summary}\n\n`
  }

  markdown += `---\n\n`

  // Events
  markdown += `## Events\n\n`
  if (notes.events.length === 0) {
    markdown += `*No events logged*\n\n`
  } else {
    notes.events.forEach((event) => {
      markdown += `- **${event.timestamp}** - ${event.description}\n`
    })
    markdown += `\n`
  }

  // NPCs
  markdown += `## NPCs Encountered\n\n`
  if (notes.npcs.length === 0) {
    markdown += `*No NPCs tracked*\n\n`
  } else {
    notes.npcs.forEach((npc) => {
      markdown += `### ${npc.name}\n\n`
      markdown += `${npc.notes || "*No notes*"}\n\n`
    })
  }

  // Locations
  markdown += `## Locations Visited\n\n`
  if (notes.locations.length === 0) {
    markdown += `*No locations tracked*\n\n`
  } else {
    notes.locations.forEach((location) => {
      markdown += `### ${location.name}\n\n`
      markdown += `${location.notes || "*No notes*"}\n\n`
    })
  }

  // General Notes
  if (notes.generalNotes) {
    markdown += `## Session Notes\n\n${notes.generalNotes}\n\n`
  }

  markdown += `---\n\n`
  markdown += `*Generated from Next Game Helper on ${new Date().toLocaleDateString()}*\n`

  return markdown
}
