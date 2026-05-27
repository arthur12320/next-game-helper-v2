"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { DGCharacter } from "@/db/schema/dg-character"
import { updateDGCharacter, deleteDGCharacter } from "@/app/actions/dg-characters"
import { calcDerived } from "@/lib/dg-data"
import { Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface DGEditFormProps {
  character: DGCharacter
}

const TOTAL_POINTS = 72
const MIN_STAT = 3
type StatKey = "STR" | "CON" | "DEX" | "INT" | "POW" | "CHA"

export function DGEditForm({ character }: DGEditFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState(character.name)
  const [profession, setProfession] = useState(character.profession || "Sniper")
  const [employer, setEmployer] = useState(character.employer || "")
  const [nationality, setNationality] = useState(character.nationality || "American")
  const [sex, setSex] = useState(character.sex || "")
  const [age, setAge] = useState(character.age || "")
  const [dob] = useState(character.dob || "")
  const [educationHistory, setEducationHistory] = useState(character.educationHistory || "")
  const [physicalDescription, setPhysicalDescription] = useState(character.physicalDescription || "")

  const [stats, setStats] = useState(character.stats)

  const totalPoints = Object.values(stats).reduce((s, v) => s + v, 0)
  const derived = calcDerived(stats)

  const isStatInvalid = (v: number) => isNaN(v) || v < MIN_STAT || v > 99
  const hasStatErrors = (["STR", "CON", "DEX", "INT", "POW", "CHA"] as StatKey[]).some((k) =>
    isStatInvalid(stats[k])
  )

  const handleStatChange = (key: StatKey, value: string) => {
    const num = parseInt(value, 10)
    setStats((prev) => ({ ...prev, [key]: isNaN(num) ? (0 as unknown as number) : num }))
  }

  const handleSavePersonal = async () => {
    setIsSaving(true)
    const result = await updateDGCharacter(character.id, {
      name, profession, employer, nationality, sex, age, dob, educationHistory, physicalDescription,
    })
    setIsSaving(false)
    if (result.success) {
      toast("Saved", { description: "Personal data updated." })
    } else {
      toast.error("Error", { description: result.error })
    }
  }

  const handleSaveStats = async () => {
    setIsSaving(true)
    const derivedMax = derived
    const result = await updateDGCharacter(character.id, {
      stats,
      derivedMax,
    })
    setIsSaving(false)
    if (result.success) {
      toast("Saved", { description: "Statistics updated. Derived attributes recalculated." })
    } else {
      toast.error("Error", { description: result.error })
    }
  }

  const handleDelete = async () => {
    const result = await deleteDGCharacter(character.id)
    if (result.success) {
      router.push("/dg-characters")
    } else {
      toast.error("Error", { description: result.error })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Data</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* ---- PERSONAL DATA ---- */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>MoS</Label>
                  <Input value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employer</Label>
                  <Input value={employer} onChange={(e) => setEmployer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Input value={sex} onChange={(e) => setSex(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Age & D.O.B.</Label>
                  <Input value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Education and Occupational History</Label>
                <Textarea
                  value={educationHistory}
                  onChange={(e) => setEducationHistory(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Physical Description</Label>
                <Textarea
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSavePersonal} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- STATISTICS ---- */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Statistics</CardTitle>
                <span className={`text-sm font-medium ${totalPoints === TOTAL_POINTS ? "text-green-600" : "text-destructive"}`}>
                  {totalPoints} / {TOTAL_POINTS} points
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(["STR", "CON", "DEX", "INT", "POW", "CHA"] as StatKey[]).map((key) => {
                  const val = stats[key]
                  const invalid = isStatInvalid(val)
                  return (
                    <div key={key} className="space-y-1">
                      <Label>{key}</Label>
                      <Input
                        type="number"
                        value={isNaN(val) ? "" : val}
                        onChange={(e) => handleStatChange(key, e.target.value)}
                        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
                      />
                      {invalid ? (
                        <p className="text-xs text-destructive">Min {MIN_STAT} · Max 99</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{val * 5}%</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-3">Derived Attributes (preview)</p>
                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  {[
                    { label: "HP", value: derived.HP },
                    { label: "WP", value: derived.WP },
                    { label: "SAN", value: derived.SAN },
                    { label: "BP", value: derived.BP },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-background rounded p-2">
                      <div className="font-bold text-lg">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveStats} disabled={isSaving || hasStatErrors || totalPoints !== TOTAL_POINTS}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Statistics"}
              </Button>
              {hasStatErrors && (
                <p className="text-xs text-destructive">Fix stat errors before saving.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- DANGER ZONE ---- */}
        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                <div>
                  <p className="font-medium">Delete Agent</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete {character.name}. This cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {character.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All data for this agent will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Agent
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
