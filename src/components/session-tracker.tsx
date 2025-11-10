"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  MapPin,
  BookOpen,
  Download,
  Save,
  CheckCircle,
  Wifi,
} from "lucide-react";
import {
  updateSessionNotes,
  completeSession,
  getSessionData,
  updatePresence,
} from "@/app/actions/sessions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { Session, SessionNotes } from "@/db/schema/rpgSessions";

interface SessionTrackerProps {
  session: Session;
  activeUsers?: Array<{ userId: string; userName: string; lastSeen: Date }>;
}

export default function SessionTracker({
  session: initialSession,
  activeUsers: initialActiveUsers = [],
}: SessionTrackerProps) {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<SessionNotes>(() => {
    if (typeof initialSession.notes === "string") {
      return JSON.parse(initialSession.notes);
    }
    return initialSession.notes as SessionNotes;
  });

  const [activeUsers, setActiveUsers] = useState(initialActiveUsers);
  // const [lastUpdated, setLastUpdated] = useState(
  //   new Date(initialSession.updatedAt)
  // );
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSaveRef = useRef<Date>(new Date());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        startTransition(async () => {
          try {
            await updateSessionNotes(initialSession.id, notes);
            lastSaveRef.current = new Date();
            setHasUnsavedChanges(false);
            console.log("[v0] Auto-saved changes");
          } catch (error) {
            console.error("[v0] Failed to auto-save:", error);
          }
        });
      }
    }, 3000); // Auto-save after 3 seconds of inactivity
  }, [hasUnsavedChanges, notes, initialSession.id]);

  useEffect(() => {
    console.log(sessionData);
    if (!sessionData?.user?.id || initialSession.status === "completed") return;

    console.log(
      "[v0] Starting real-time polling for session",
      initialSession.id
    );

    pollIntervalRef.current = setInterval(async () => {
      if (document.hidden) return;

      console.log("[v0] Polling for updates");
      try {
        const data = await getSessionData(initialSession.id);

        const serverUpdated = new Date(data.session.updatedAt);
        if (serverUpdated > lastSaveRef.current && !hasUnsavedChanges) {
          console.log("[v0] Received updates from server", {
            serverUpdated,
            lastSave: lastSaveRef.current,
          });

          const serverNotes =
            typeof data.session.notes === "string"
              ? JSON.parse(data.session.notes)
              : (data.session.notes as SessionNotes);

          setNotes(serverNotes);
          // setLastUpdated(serverUpdated);
        }

        setActiveUsers(data.activeUsers);
        setIsOnline(true);
      } catch (error) {
        console.error("[v0] Failed to fetch session updates:", error);
        setIsOnline(false);
      }
    }, 30000);

    presenceIntervalRef.current = setInterval(async () => {
      if (document.hidden) return;

      try {
        await updatePresence(initialSession.id);
      } catch (error) {
        console.error("[v0] Failed to update presence:", error);
      }
    }, 60000);

    updatePresence(initialSession.id).catch(console.error);

    const handleVisibilityChange = () => {
      if (!document.hidden && sessionData?.user?.id) {
        getSessionData(initialSession.id)
          .then((data) => {
            const serverUpdated = new Date(data.session.updatedAt);
            if (serverUpdated > lastSaveRef.current && !hasUnsavedChanges) {
              const serverNotes =
                typeof data.session.notes === "string"
                  ? JSON.parse(data.session.notes)
                  : (data.session.notes as SessionNotes);
              setNotes(serverNotes);
              // setLastUpdated(serverUpdated);
            }
            setActiveUsers(data.activeUsers);
            setIsOnline(true);
          })
          .catch(console.error);

        updatePresence(initialSession.id).catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      console.log("[v0] Cleaning up real-time polling");
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (presenceIntervalRef.current)
        clearInterval(presenceIntervalRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    initialSession.id,
    initialSession.status,
    sessionData,
    hasUnsavedChanges,
  ]);

  const [newEvent, setNewEvent] = useState("");

  const addEvent = useCallback(() => {
    if (!newEvent.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    setNotes((prev) => ({
      ...prev,
      events: [...prev.events, { timestamp, description: newEvent }],
    }));
    setNewEvent("");
    setHasUnsavedChanges(true);
    autoSave();
  }, [newEvent, autoSave]);

  const [npcName, setNpcName] = useState("");
  const [npcNotes, setNpcNotes] = useState("");

  const addNPC = useCallback(() => {
    if (!npcName.trim()) return;
    setNotes((prev) => ({
      ...prev,
      npcs: [...prev.npcs, { name: npcName, notes: npcNotes }],
    }));
    setNpcName("");
    setNpcNotes("");
    setHasUnsavedChanges(true);
    autoSave();
  }, [npcName, npcNotes, autoSave]);

  const [locationName, setLocationName] = useState("");
  const [locationNotes, setLocationNotes] = useState("");

  const addLocation = useCallback(() => {
    if (!locationName.trim()) return;
    setNotes((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        { name: locationName, notes: locationNotes },
      ],
    }));
    setLocationName("");
    setLocationNotes("");
    setHasUnsavedChanges(true);
    autoSave();
  }, [locationName, locationNotes, autoSave]);

  const updateGeneralNotes = useCallback((value: string) => {
    setNotes((prev) => ({ ...prev, generalNotes: value }));
    setHasUnsavedChanges(true);
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSave();
    }
  }, [notes.generalNotes, hasUnsavedChanges, autoSave]);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        await updateSessionNotes(initialSession.id, notes);
        lastSaveRef.current = new Date();
        setHasUnsavedChanges(false);
        toast.success("Session notes saved!");
        router.refresh();
      } catch (error) {
        toast.error("Failed to save notes");
        console.error(error);
      }
    });
  }, [initialSession.id, notes, router]);

  const handleComplete = useCallback(() => {
    startTransition(async () => {
      try {
        await completeSession(initialSession.id);
        toast.success(
          "Session completed! You can now convert it to a journal entry."
        );
        router.refresh();
      } catch (error) {
        toast.error("Failed to complete session");
        console.error(error);
      }
    });
  }, [initialSession.id, router]);

  const exportMarkdown = useCallback(() => {
    const markdown = generateMarkdown(initialSession, notes);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${initialSession.sessionNumber}-${initialSession.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown exported!");
  }, [initialSession, notes]);

  const exportPDF = useCallback(() => {
    const markdown = generateMarkdown(initialSession, notes);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Session ${initialSession.sessionNumber}: ${initialSession.title}</title>
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
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      toast.success("PDF print dialog opened!");
    }, 250);
  }, [initialSession, notes]);

  const isCompleted = initialSession.status === "completed";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session in Progress
                <Badge
                  variant={isOnline ? "default" : "destructive"}
                  className="ml-2"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  {isOnline ? "Live" : "Offline"}
                </Badge>
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="ml-2">
                    Unsaved changes
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Track events, NPCs, locations, and notes in real-time
                {activeUsers.length > 0 && (
                  <span className="ml-2 text-xs">
                    • {activeUsers.length}{" "}
                    {activeUsers.length === 1 ? "user" : "users"} active
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isPending || isCompleted}
                variant="outline"
              >
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
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1 flex-wrap">
                {activeUsers.map((user) => (
                  <Badge
                    key={user.userId}
                    variant="secondary"
                    className="text-xs"
                  >
                    {user.userName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

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

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Event Logger</CardTitle>
              <CardDescription>
                Track key moments as they happen
              </CardDescription>
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
                  <p className="text-muted-foreground text-center py-8">
                    No events logged yet
                  </p>
                ) : (
                  notes.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50"
                    >
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

        <TabsContent value="npcs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NPC Tracker</CardTitle>
              <CardDescription>
                Remember the characters you meet
              </CardDescription>
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
                  <p className="text-muted-foreground text-center py-8">
                    No NPCs tracked yet
                  </p>
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

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Tracker</CardTitle>
              <CardDescription>
                Track where your adventures take you
              </CardDescription>
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
                  <p className="text-muted-foreground text-center py-8">
                    No locations tracked yet
                  </p>
                ) : (
                  notes.locations.map((location, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {location.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {location.notes || "No notes"}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Session Notes</CardTitle>
              <CardDescription>
                Free-form notes about the session
              </CardDescription>
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
              This session has been marked as complete. Export it as Markdown
              for Obsidian, or use the data to create a journal entry.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function generateMarkdown(session: Session, notes: SessionNotes): string {
  const startDate = new Date(session.startDate);
  const endDate = session.endDate ? new Date(session.endDate) : null;
  const duration = endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 1000 / 60)
    : null;

  let markdown = `# Session ${session.sessionNumber}: ${session.title}\n\n`;
  markdown += `**Date**: ${startDate.toLocaleDateString()}\n`;
  markdown += `**Time**: ${startDate.toLocaleTimeString()}`;
  if (endDate) {
    markdown += ` - ${endDate.toLocaleTimeString()}`;
    if (duration) markdown += ` (${duration} minutes)`;
  }
  markdown += `\n**Status**: ${session.status}\n\n`;

  if (session.summary) {
    markdown += `## Summary\n\n${session.summary}\n\n`;
  }

  markdown += `---\n\n`;

  markdown += `## Events\n\n`;
  if (notes.events.length === 0) {
    markdown += `*No events logged*\n\n`;
  } else {
    notes.events.forEach((event) => {
      markdown += `- **${event.timestamp}** - ${event.description}\n`;
    });
    markdown += `\n`;
  }

  markdown += `## NPCs Encountered\n\n`;
  if (notes.npcs.length === 0) {
    markdown += `*No NPCs tracked*\n\n`;
  } else {
    notes.npcs.forEach((npc) => {
      markdown += `### ${npc.name}\n\n`;
      markdown += `${npc.notes || "*No notes*"}\n\n`;
    });
  }

  markdown += `## Locations Visited\n\n`;
  if (notes.locations.length === 0) {
    markdown += `*No locations tracked*\n\n`;
  } else {
    notes.locations.forEach((location) => {
      markdown += `### ${location.name}\n\n`;
      markdown += `${location.notes || "*No notes*"}\n\n`;
    });
  }

  if (notes.generalNotes) {
    markdown += `## Session Notes\n\n${notes.generalNotes}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*Generated from Next Game Helper on ${new Date().toLocaleDateString()}*\n`;

  return markdown;
}
