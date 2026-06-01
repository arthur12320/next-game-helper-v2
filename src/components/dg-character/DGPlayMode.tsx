"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DGCharacter } from "@/db/schema/dg-character";
import {
  updateDGDerivedCurrent,
  toggleSkillCheck,
  endDGSession,
  updateDGBond,
  addDGBond,
  removeDGBond,
  addDGMotivation,
  removeDGMotivation,
  updateDGGearAndNotes,
  updateDGWeapons,
  updateDGCharacter,
  applyDGSessionAdvancement,
} from "@/app/actions/dg-characters";
import { appendSessionEvent } from "@/app/actions/sessions";
import { DGSessionPanel } from "./DGSessionPanel";
import { Minus, Plus, Trash2, Swords, RefreshCw, Pencil, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DGPlayModeProps {
  character: DGCharacter;
}

interface RollResult {
  rolled: number;
  success: boolean;
  skillName: string;
  skillPct: number;
}

export function DGPlayMode({ character }: DGPlayModeProps) {
  const [derivedCurrent, setDerivedCurrent] = useState(
    character.derivedCurrent,
  );
  const [skills, setSkills] = useState(character.skills);
  const [skillChecks, setSkillChecks] = useState<Record<string, boolean>>(
    character.skillChecks || {},
  );
  const [bonds, setBonds] = useState(character.bonds);
  const [motivations, setMotivations] = useState(character.motivations);
  const [woundsAndAilments, setWoundsAndAilments] = useState(
    character.woundsAndAilments || "",
  );
  const [armorAndGear, setArmorAndGear] = useState(
    character.armorAndGear || "",
  );
  const [personalDetails, setPersonalDetails] = useState(
    character.personalDetails || "",
  );
  const [homeAndFamily, setHomeAndFamily] = useState(
    character.homeAndFamily || "",
  );
  const [weapons, setWeapons] = useState(character.weapons || []);
  const [endSessionLoading, setEndSessionLoading] = useState(false);

  const [rollModal, setRollModal] = useState<{
    open: boolean;
    skill: string;
    pct: number;
  } | null>(null);
  const [rollResult, setRollResult] = useState<RollResult | null>(null);

  // --- End session dialog ---
  const [endSessionOpen, setEndSessionOpen] = useState(false);
  const [endSessionMode, setEndSessionMode] = useState<"auto" | "manual">(
    "auto",
  );
  const [manualRolls, setManualRolls] = useState<Record<string, number>>({});

  // --- Admin mode (direct skill editing) ---
  const [adminMode, setAdminMode] = useState(false);
  const [editedSkills, setEditedSkills] = useState<Record<string, number>>({});
  const [adminSaving, setAdminSaving] = useState(false);

  const [bp, setBP] = useState(character.derivedMax.BP);
  const [sessionPanelOpen, setSessionPanelOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionRefreshSignal, setSessionRefreshSignal] = useState(0);
  const [rollMode, setRollMode] = useState<"auto" | "manual">("auto");
  const [manualD100, setManualD100] = useState("");

  const enterAdminMode = () => {
    setEditedSkills({ ...skills });
    setAdminMode(true);
  };

  const cancelAdminMode = () => {
    setEditedSkills({});
    setAdminMode(false);
  };

  const handleAdminSkillChange = (skill: string, value: string) => {
    const num = parseInt(value, 10);
    setEditedSkills((prev) => ({ ...prev, [skill]: isNaN(num) ? 0 : num }));
  };

  const handleAdminSave = async () => {
    setAdminSaving(true);
    const result = await updateDGCharacter(character.id, {
      skills: editedSkills,
    });
    setAdminSaving(false);
    if (result.success) {
      setSkills(editedSkills);
      setAdminMode(false);
      setEditedSkills({});
      toast("Skills updated", { description: "All skill values saved." });
    } else {
      toast.error("Error", {
        description: result.error || "Failed to save skills.",
      });
    }
  };

  const [newBondName, setNewBondName] = useState("");
  const [newMotivation, setNewMotivation] = useState("");
  const [noteSaveTimeout, setNoteSaveTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const stats = character.stats;
  const derivedMax = character.derivedMax;

  // --- Stats helpers ---

  const handleDerivedChange = useCallback(
    async (key: "HP" | "WP" | "SAN", delta: number) => {
      const max = derivedMax[key];
      const current = derivedCurrent[key];
      const newVal = Math.max(0, Math.min(max, current + delta));
      const newCurrent = { ...derivedCurrent, [key]: newVal };
      setDerivedCurrent(newCurrent);
      await updateDGDerivedCurrent(character.id, { [key]: newVal });
    },
    [character.id, derivedCurrent, derivedMax],
  );

  const handleBPChange = useCallback(
    async (delta: number) => {
      const newBP = Math.max(0, bp + delta);
      setBP(newBP);
      await updateDGCharacter(character.id, {
        derivedMax: { ...derivedMax, BP: newBP },
      });
    },
    [character.id, bp, derivedMax],
  );

  // --- Skill roll ---

  const openRoll = (skill: string, pct: number) => {
    setRollResult(null);
    setRollMode("auto");
    setManualD100("");
    setRollModal({ open: true, skill, pct });
  };

  const handleRoll = async (manualValue?: number) => {
    if (!rollModal) return;
    const rolled =
      manualValue !== undefined
        ? manualValue
        : Math.floor(Math.random() * 100) + 1;
    const success = rolled <= rollModal.pct;
    setRollResult({
      rolled,
      success,
      skillName: rollModal.skill,
      skillPct: rollModal.pct,
    });

    if (!success && rollModal.pct > 0) {
      const newChecks = { ...skillChecks, [rollModal.skill]: true };
      setSkillChecks(newChecks);
      await toggleSkillCheck(character.id, rollModal.skill, true);
    }
  };

  const handlePostRollToSession = async () => {
    if (!rollResult || !selectedSessionId) return;
    const emoji = rollResult.success ? "✅" : "❌";
    const desc = `${emoji} **${rollResult.skillName}** (${rollResult.skillPct}%): rolled **${rollResult.rolled}** — ${rollResult.success ? "Success" : "Failure"}`;
    const result = await appendSessionEvent(selectedSessionId, desc);
    if (result.success) {
      toast("Posted to session");
      setSessionRefreshSignal((s) => s + 1);
    } else {
      toast.error("Failed to post", { description: result.error });
    }
  };

  const handleCheckToggle = useCallback(
    async (skill: string, checked: boolean) => {
      const newChecks = { ...skillChecks, [skill]: checked };
      setSkillChecks(newChecks);
      await toggleSkillCheck(character.id, skill, checked);
    },
    [character.id, skillChecks],
  );

  // --- End session ---

  const handleEndSession = async () => {
    setEndSessionLoading(true);
    const result = await endDGSession(character.id);
    setEndSessionLoading(false);
    setEndSessionOpen(false);

    if (!result.success) {
      toast.error("Error", { description: result.error });
      return;
    }

    if (result.results!.length === 0) {
      toast("No skills to advance", {
        description: "No checked skills this session.",
      });
    } else {
      applySessionResults(result.results!);
    }
  };

  const openEndSessionDialog = () => {
    setEndSessionMode("auto");
    setManualRolls({});
    setEndSessionOpen(true);
  };

  const initManualRolls = () => {
    const rolls: Record<string, number> = {};
    Object.entries(skillChecks)
      .filter(([, v]) => v)
      .forEach(([skill]) => {
        rolls[skill] = 1;
      });
    setManualRolls(rolls);
  };

  const applySessionResults = (
    results: Array<{ skill: string; roll: number; newValue: number }>,
  ) => {
    const newSkills = { ...skills };
    const newChecks = { ...skillChecks };
    results.forEach(({ skill, newValue }) => {
      newSkills[skill] = newValue;
      newChecks[skill] = false;
    });
    setSkills(newSkills);
    setSkillChecks(newChecks);
    toast("Session ended!", {
      description: `${results.length} skill${results.length !== 1 ? "s" : ""} advanced.`,
    });
    results.forEach(({ skill, roll, newValue }) => {
      toast(`${skill} +${roll}`, { description: `Now at ${newValue}%` });
    });
  };

  const handleManualEndSession = async () => {
    setEndSessionLoading(true);
    const result = await applyDGSessionAdvancement(character.id, manualRolls);
    setEndSessionLoading(false);
    setEndSessionOpen(false);
    if (!result.success) {
      toast.error("Error", { description: result.error });
      return;
    }
    if (result.results!.length === 0) {
      toast("No skills advanced");
    } else {
      applySessionResults(result.results!);
    }
  };

  // --- Bonds ---

  const handleBondChange = useCallback(
    async (bondId: string, delta: number) => {
      const result = await updateDGBond(character.id, bondId, delta);
      if (result.success && result.bonds) setBonds(result.bonds);
    },
    [character.id],
  );

  const handleAddBond = async () => {
    if (!newBondName.trim()) return;
    const result = await addDGBond(character.id, newBondName.trim(), stats.CHA);
    if (result.success && result.bonds) {
      setBonds(result.bonds);
      setNewBondName("");
      toast("Bond added");
    }
  };

  const handleRemoveBond = async (bondId: string) => {
    const result = await removeDGBond(character.id, bondId);
    if (result.success) setBonds((prev) => prev.filter((b) => b.id !== bondId));
  };

  // --- Motivations ---

  const handleAddMotivation = async () => {
    if (!newMotivation.trim()) return;
    const result = await addDGMotivation(character.id, newMotivation.trim());
    if (result.success && result.motivations) {
      setMotivations(result.motivations);
      setNewMotivation("");
    } else {
      toast.error("Error", { description: result.error });
    }
  };

  const handleRemoveMotivation = async (index: number) => {
    const result = await removeDGMotivation(character.id, index);
    if (result.success && result.motivations)
      setMotivations(result.motivations);
  };

  // --- Notes (debounced save) ---

  const scheduleSave = (fields: Parameters<typeof updateDGGearAndNotes>[1]) => {
    if (noteSaveTimeout) clearTimeout(noteSaveTimeout);
    setNoteSaveTimeout(
      setTimeout(() => {
        updateDGGearAndNotes(character.id, fields);
      }, 1200),
    );
  };

  // --- Weapons ---

  const addWeaponRow = () => {
    const newWeapon = {
      id: crypto.randomUUID(),
      name: "",
      skillPct: "",
      baseRange: "",
      damage: "",
      armorPiercing: "",
      lethality: "",
      killRadius: "",
      ammo: "",
    };
    const updated = [...weapons, newWeapon];
    setWeapons(updated);
    updateDGWeapons(character.id, updated);
  };

  const updateWeapon = (id: string, field: string, value: string) => {
    const updated = weapons.map((w) =>
      w.id === id ? { ...w, [field]: value } : w,
    );
    setWeapons(updated);
    if (noteSaveTimeout) clearTimeout(noteSaveTimeout);
    setNoteSaveTimeout(
      setTimeout(() => updateDGWeapons(character.id, updated), 1200),
    );
  };

  const removeWeapon = (id: string) => {
    const updated = weapons.filter((w) => w.id !== id);
    setWeapons(updated);
    updateDGWeapons(character.id, updated);
  };

  const sortedSkills = Object.entries(skills).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const checkedCount = Object.values(skillChecks).filter(Boolean).length;

  return (
    <div className="flex gap-6 items-start">
    <div className="flex-1 min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold">{character.name}</h2>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge>{character.profession}</Badge>
            {character.nationality && (
              <Badge variant="outline">{character.nationality}</Badge>
            )}
            {character.age && (
              <Badge variant="outline">Age {character.age}</Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setSessionPanelOpen(true)}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Session
        </Button>
      </div>

      {/* Stats & Derived */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2 text-sm mb-4">
              {(["STR", "CON", "DEX", "INT", "POW", "CHA"] as const).map(
                (s) => (
                  <button
                    key={s}
                    className="bg-muted/50 rounded p-2 text-center hover:bg-muted transition-colors cursor-pointer w-full"
                    onClick={() => openRoll(s, stats[s] * 5)}
                  >
                    <div className="font-bold text-lg">{stats[s]}</div>
                    <div className="text-xs text-muted-foreground">{s}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats[s] * 5}%
                    </div>
                  </button>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Derived Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["HP", "WP", "SAN"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium w-10">{key}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleDerivedChange(key, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">
                      {derivedCurrent[key]}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleDerivedChange(key, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      / {derivedMax[key]}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="font-medium w-10">BP</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleBPChange(-1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center text-destructive">
                    {bp}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleBPChange(1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">
            Skills
            {checkedCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 text-xs px-1">
                {checkedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bonds">Bonds</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        {/* ---- SKILLS TAB ---- */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div>
                  <CardTitle className="text-base">
                    Applicable Skill Sets
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {adminMode
                      ? "Type a new value to directly set any skill."
                      : "Check a box when you attempt to use a skill and fail."}
                  </p>
                </div>
                {adminMode && (
                  <Badge variant="secondary" className="shrink-0">
                    Admin Mode
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {adminMode ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAdminSave}
                      disabled={adminSaving}
                    >
                      {adminSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelAdminMode}
                      disabled={adminSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={endSessionLoading || checkedCount === 0}
                      onClick={openEndSessionDialog}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {endSessionLoading
                        ? "Processing..."
                        : `End Session (${checkedCount})`}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enterAdminMode}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Admin
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {sortedSkills.map(([skill, pct]) => {
                  const checked = skillChecks[skill] || false;

                  if (adminMode) {
                    const editVal = editedSkills[skill] ?? pct;
                    const isInvalid = editVal < 0 || editVal > 99;
                    return (
                      <div
                        key={skill}
                        className="flex items-center gap-3 py-1 px-2 rounded"
                      >
                        <span className="text-sm flex-1">{skill}</span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={isNaN(editVal) ? "" : editVal}
                            onChange={(e) =>
                              handleAdminSkillChange(skill, e.target.value)
                            }
                            className={cn(
                              "h-7 w-20 text-sm text-right font-mono",
                              isInvalid &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={skill}
                      className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/40 group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) =>
                          handleCheckToggle(skill, !!val)
                        }
                        disabled={pct === 0}
                        className="shrink-0"
                      />
                      <button
                        className="flex-1 flex items-center justify-between text-left"
                        onClick={() => openRoll(skill, pct)}
                      >
                        <span className="text-sm">{skill}</span>
                        <span
                          className={`text-sm font-mono font-medium ${pct > 0 ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {pct}%
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- BONDS TAB ---- */}
        <TabsContent value="bonds">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bonds</CardTitle>
              <p className="text-xs text-muted-foreground">
                When a bond reaches 0 the relationship is damaged beyond repair.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {bonds.map((bond) => (
                  <div
                    key={bond.id}
                    className={`border rounded-lg p-3 ${bond.broken ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${bond.broken ? "line-through" : ""}`}
                        >
                          {bond.name}
                        </span>
                        {bond.broken && (
                          <Badge variant="destructive" className="text-xs">
                            Broken
                          </Badge>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Bond?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &quot;{bond.name}
                              &quot; from your character sheet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveBond(bond.id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleBondChange(bond.id, -1)}
                        disabled={bond.broken}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xl font-bold w-8 text-center">
                        {bond.score}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleBondChange(bond.id, 1)}
                        disabled={bond.broken}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Add Bond</Label>
                <div className="flex gap-2">
                  <Input
                    value={newBondName}
                    onChange={(e) => setNewBondName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddBond()}
                    placeholder='e.g. "My Sister"'
                  />
                  <Button
                    onClick={handleAddBond}
                    disabled={!newBondName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Motivations ({motivations.length}/5)
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Each time your Agent hits the Breaking Point, remove one
                    motivation.
                  </p>
                  <div className="space-y-2">
                    {motivations.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 border rounded p-2"
                      >
                        <span className="flex-1 text-sm">{m}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMotivation(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {motivations.length < 5 && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newMotivation}
                        onChange={(e) => setNewMotivation(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddMotivation()
                        }
                        placeholder="Add a motivation..."
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddMotivation}
                        disabled={!newMotivation.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- NOTES TAB ---- */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Personal Details and Notes</Label>
                  <Textarea
                    value={personalDetails}
                    onChange={(e) => {
                      setPersonalDetails(e.target.value);
                      scheduleSave({ personalDetails: e.target.value });
                    }}
                    rows={5}
                    placeholder="Personal details, background notes..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Developments affecting Home and Family</Label>
                  <Textarea
                    value={homeAndFamily}
                    onChange={(e) => {
                      setHomeAndFamily(e.target.value);
                      scheduleSave({ homeAndFamily: e.target.value });
                    }}
                    rows={5}
                    placeholder="Family developments, home life changes..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- EQUIPMENT TAB ---- */}
        <TabsContent value="equipment">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Wounds and Ailments</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={woundsAndAilments}
                  onChange={(e) => {
                    setWoundsAndAilments(e.target.value);
                    scheduleSave({ woundsAndAilments: e.target.value });
                  }}
                  rows={3}
                  placeholder="Current injuries, illnesses, or ailments..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Armor and Gear</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Body armor reduces damage of all attacks except Called Shots
                  and successful Lethality rolls.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={armorAndGear}
                  onChange={(e) => {
                    setArmorAndGear(e.target.value);
                    scheduleSave({ armorAndGear: e.target.value });
                  }}
                  rows={4}
                  placeholder="Body armor, tactical gear, equipment..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Weapons</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={addWeaponRow}>
                  <Swords className="h-3 w-3 mr-1" />
                  Add Weapon
                </Button>
              </CardHeader>
              <CardContent>
                {weapons.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No weapons added.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-1 pr-2 font-medium">
                            Name
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Skill %
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Range
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Damage
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            AP
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Lethality
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Kill R.
                          </th>
                          <th className="text-left py-1 pr-2 font-medium">
                            Ammo
                          </th>
                          <th className="py-1" />
                        </tr>
                      </thead>
                      <tbody>
                        {weapons.map((w) => (
                          <tr key={w.id} className="border-b last:border-0">
                            {(
                              [
                                "name",
                                "skillPct",
                                "baseRange",
                                "damage",
                                "armorPiercing",
                                "lethality",
                                "killRadius",
                                "ammo",
                              ] as const
                            ).map((field) => (
                              <td key={field} className="py-1 pr-1">
                                <Input
                                  value={w[field]}
                                  onChange={(e) =>
                                    updateWeapon(w.id, field, e.target.value)
                                  }
                                  className="h-7 text-xs px-1"
                                />
                              </td>
                            ))}
                            <td className="py-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeWeapon(w.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* End Session Dialog */}
      <Dialog
        open={endSessionOpen}
        onOpenChange={(open) => {
          if (!open) setEndSessionOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Session — Skill Advancement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={endSessionMode === "auto" ? "default" : "outline"}
                onClick={() => setEndSessionMode("auto")}
              >
                Auto Roll
              </Button>
              <Button
                size="sm"
                variant={endSessionMode === "manual" ? "default" : "outline"}
                onClick={() => {
                  setEndSessionMode("manual");
                  initManualRolls();
                }}
              >
                Manual Roll
              </Button>
            </div>

            {endSessionMode === "auto" ? (
              <p className="text-sm text-muted-foreground">
                Roll 1D4 for each of the {checkedCount} checked skill
                {checkedCount !== 1 ? "s" : ""} and add the result to that
                skill&apos;s percentage. All checks will be cleared.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter your d4 roll result (1–4) for each checked skill.
                </p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(skillChecks)
                    .filter(([, v]) => v)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([skill]) => {
                      const val = manualRolls[skill] ?? 1;
                      const isInvalid = isNaN(val) || val < 1 || val > 4;
                      return (
                        <div
                          key={skill}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm truncate">{skill}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {skills[skill]}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              +
                            </span>
                            <Input
                              type="number"
                              value={isNaN(val) ? "" : val}
                              onChange={(e) => {
                                const n = parseInt(e.target.value, 10);
                                setManualRolls((prev) => ({
                                  ...prev,
                                  [skill]: isNaN(n) ? 0 : n,
                                }));
                              }}
                              className={cn(
                                "h-7 w-16 text-center text-sm font-mono",
                                isInvalid &&
                                  "border-destructive focus-visible:ring-destructive",
                              )}
                            />
                            <span className="text-xs text-muted-foreground">
                              d4
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEndSessionOpen(false)}
              disabled={endSessionLoading}
            >
              Cancel
            </Button>
            {endSessionMode === "auto" ? (
              <Button onClick={handleEndSession} disabled={endSessionLoading}>
                {endSessionLoading ? "Rolling..." : "Roll and Advance"}
              </Button>
            ) : (
              <Button
                onClick={handleManualEndSession}
                disabled={
                  endSessionLoading ||
                  Object.values(manualRolls).some(
                    (v) => isNaN(v) || v < 1 || v > 4,
                  )
                }
              >
                {endSessionLoading ? "Applying..." : "Apply"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roll Modal */}
      {rollModal && (
        <Dialog
          open={rollModal.open}
          onOpenChange={(open) => {
            if (!open) setRollModal(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{rollModal.skill}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Target: {rollModal.pct}% or lower
                </p>
              </div>

              {/* Auto / Manual toggle */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={rollMode === "auto" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => { setRollMode("auto"); setManualD100(""); setRollResult(null); }}
                >
                  Auto Roll
                </Button>
                <Button
                  size="sm"
                  variant={rollMode === "manual" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => { setRollMode("manual"); setRollResult(null); }}
                >
                  Manual Roll
                </Button>
              </div>

              {!rollResult ? (
                rollMode === "auto" ? (
                  <Button
                    className="w-full"
                    onClick={() => handleRoll()}
                    disabled={rollModal.pct === 0}
                  >
                    Roll d100
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="1–100"
                      value={manualD100}
                      onChange={(e) => setManualD100(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        const val = parseInt(manualD100, 10);
                        if (!isNaN(val) && val >= 1 && val <= 100)
                          handleRoll(val);
                      }}
                      disabled={
                        isNaN(parseInt(manualD100, 10)) ||
                        parseInt(manualD100, 10) < 1 ||
                        parseInt(manualD100, 10) > 100
                      }
                    >
                      Apply
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div
                    className={`text-center p-4 rounded-lg ${rollResult.success ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"}`}
                  >
                    <div className="text-4xl font-bold mb-1">
                      {rollResult.rolled}
                    </div>
                    <div
                      className={`text-lg font-semibold ${rollResult.success ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                    >
                      {rollResult.success ? "SUCCESS" : "FAILURE"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rollResult.success
                        ? `${rollResult.rolled} ≤ ${rollResult.skillPct}%`
                        : `${rollResult.rolled} > ${rollResult.skillPct}%`}
                    </p>
                  </div>
                  {!rollResult.success && rollModal.pct > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Skill check marked for end-of-session advancement.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRollResult(null)}
                    >
                      Roll Again
                    </Button>
                    {selectedSessionId && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handlePostRollToSession}
                      >
                        Post to Session
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRollModal(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
      <DGSessionPanel
        open={sessionPanelOpen}
        onOpenChange={setSessionPanelOpen}
        selectedSessionId={selectedSessionId}
        onSessionSelect={setSelectedSessionId}
        refreshSignal={sessionRefreshSignal}
      />
    </div>
  );
}
