"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/lib/character-context"
import { ChevronLeft, Plus, X, Users2, Download } from "lucide-react"
import { LIFEPATHS } from "@/lib/character-data"

export function Step5Connections() {
  const { character, updateCharacter, setCurrentStep } = useCharacter()
  const [connections, setConnections] = useState<string[]>(character.connections || [])
  const [newConnection, setNewConnection] = useState("")
  const [characterName, setCharacterName] = useState("")

  const handleAddConnection = () => {
    if (newConnection.trim()) {
      setConnections([...connections, newConnection.trim()])
      setNewConnection("")
    }
  }

  const handleRemoveConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index))
  }

  const handleComplete = () => {
    updateCharacter({ connections })
    alert("Character creation complete! In a full implementation, this would generate a character sheet.")
  }

  const exportCharacterMarkdown = () => {
    if (!characterName.trim()) {
      alert("Please enter a character name first!")
      return
    }

    const homeworld = character.homeworld
    const upbringing = character.upbringing
    const lifepaths = character.lifepaths || []
    const beliefs = character.beliefs

    const skillsMap = new Map<string, number>()
    lifepaths.forEach((lp) => {
      const lifepathData = LIFEPATHS.find((l) => l.id === lp.id)
      if (lifepathData) {
        lifepathData.skills.forEach((skill) => {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1)
        })
      }
    })

    const skillRows = Array.from(skillsMap.entries())
      .map(([skill, level]) => `| ${skill} | ${level} | 0 | 0 |`)
      .join("\n")

    const traits = lifepaths
      .slice(0, 2)
      .map((lp) => {
        const lifepathData = LIFEPATHS.find((l) => l.id === lp.id)
        return lifepathData?.traitPair || ""
      })
      .filter(Boolean)

    const lifepathRows = lifepaths
      .map((lp) => {
        const lifepathData = LIFEPATHS.find((l) => l.id === lp.id)
        if (!lifepathData) return ""
        return `| ${lifepathData.name} | ${lifepathData.skills.join(", ")} | ${lifepathData.traitPair} | ${lp.promptAnswer} |`
      })
      .join("\n\n")

    const markdown = `## ${characterName}

**Designation:** Special Circumstances Operative  
**Homeworld:** ${homeworld?.name || "Unknown"}  
**Status:** Active Field Agent

### Overview

${homeworld?.promptAnswer || "A specialist operative of Contact's Special Circumstances division."}

${upbringing?.promptAnswer || ""}

### Background

**Upbringing:** ${upbringing?.name || "Unknown"}

${upbringing?.npcRelationship ? `**Key Contact:** ${upbringing.npcRelationship}` : ""}

### Physical & Mental Stats

- **Will:** ${upbringing?.will || 0}
- **Health:** ${upbringing?.health || 0}

### Behavior

${beliefs?.belief ? `**Core Belief:** ${beliefs.belief}` : ""}

${beliefs?.instinct ? `**Instinct:** ${beliefs.instinct}` : ""}

### Connections

${connections.map((conn) => `- ${conn}`).join("\n")}

### Traits
${traits.map((trait) => `- ${trait}`).join("\n")}

### Skills

| **Skill** | **level** | **Successes** | **fails** |
| --------- | :-------: | :-----------: | :-------: |
${skillRows}

### Life Paths

${lifepathRows}
`

    const dataUri = "data:text/markdown;charset=utf-8," + encodeURIComponent(markdown)
    const fileName = `${characterName.toLowerCase().replace(/\s+/g, "-")}-character-sheet.md`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", fileName)
    linkElement.click()
  }

  const exportCharacter = () => {
    const characterSheet = {
      homeworld: character.homeworld,
      upbringing: character.upbringing,
      lifepaths: character.lifepaths,
      beliefs: character.beliefs,
      connections: connections,
      name: characterName,
    }

    const dataStr = JSON.stringify(characterSheet, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "character-sheet.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(4)}>
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Forge Your Connections</h2>
        <p className="text-muted-foreground text-pretty">
          Define your relationships with fellow PCs and important NPCs. These connections will shape your story.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Character Identity</CardTitle>
          <CardDescription>Give your Special Circumstances operative a name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="character-name">Character Name</Label>
            <Input
              id="character-name"
              placeholder="e.g., Kael Veyr, Diziet Sma, Cheradenine Zakalwe"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            <CardTitle>Your Network</CardTitle>
          </div>
          <CardDescription>
            Add connections to other operatives, contacts, rivals, or anyone who matters to your story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-connection">Add Connection</Label>
            <div className="flex gap-2">
              <Input
                id="new-connection"
                placeholder='e.g., "I trust Agent Kelsier with my life" or "Dr. Vex owes me a favor"'
                value={newConnection}
                onChange={(e) => setNewConnection(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddConnection()
                  }
                }}
              />
              <Button onClick={handleAddConnection} disabled={!newConnection.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {connections.length > 0 && (
            <div className="space-y-2">
              <Label>Your Connections ({connections.length})</Label>
              <div className="space-y-2">
                {connections.map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg group">
                    <p className="text-sm flex-1">{connection}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConnection(index)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connections.length === 0 && (
            <div className="p-6 text-center bg-muted/50 rounded-lg">
              <Users2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No connections yet. Add at least one to complete your character.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Character Summary</CardTitle>
          <CardDescription>Review your Special Circumstances operative</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Homeworld</p>
              <p className="font-semibold">{character.homeworld?.name || "Not selected"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Upbringing</p>
              <p className="font-semibold">{character.upbringing?.name || "Not selected"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Will / Health</p>
              <p className="font-semibold font-mono">
                {character.upbringing?.will || 0} / {character.upbringing?.health || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Lifepaths</p>
              <p className="font-semibold">{character.lifepaths?.length || 0} completed</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={exportCharacterMarkdown}
              variant="default"
              className="flex-1 sm:flex-initial"
              disabled={!characterName.trim()}
            >
              <Download className="mr-2 w-4 h-4" />
              Export as Markdown
            </Button>
            <Button onClick={exportCharacter} variant="outline" className="flex-1 sm:flex-initial bg-transparent">
              <Download className="mr-2 w-4 h-4" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
