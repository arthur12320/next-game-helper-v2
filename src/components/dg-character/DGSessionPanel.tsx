"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import SessionTracker from "@/components/session-tracker";
import { fetchCampaigns } from "@/app/actions/campaign";
import {
  fetchSessionsByCampaign,
  fetchSessionData,
} from "@/app/actions/sessions";
import type { Session } from "@/db/schema/rpgSessions";
import type { Campaign } from "@/db/schema/campaigns";

interface DGSessionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  refreshSignal: number;
}

interface SessionData {
  session: Session;
  activeUsers: Array<{ userId: string; userName: string; lastSeen: Date }>;
}

export function DGSessionPanel({
  open,
  onOpenChange,
  selectedSessionId,
  onSessionSelect,
  refreshSignal,
}: DGSessionPanelProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingCampaigns(true);
    fetchCampaigns().then((data) => {
      setCampaigns(data);
      setLoadingCampaigns(false);
    });
  }, [open]);

  const handleCampaignChange = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    onSessionSelect(null);
    setSessionData(null);
    setSessions([]);
    setLoadingSessions(true);
    const data = await fetchSessionsByCampaign(campaignId);
    setSessions(data);
    setLoadingSessions(false);
  };

  const handleSessionChange = async (sessionId: string) => {
    onSessionSelect(sessionId);
    setSessionData(null);
    setLoadingSession(true);
    const data = await fetchSessionData(sessionId);
    setSessionData(data);
    setLoadingSession(false);
  };

  if (!open) return null;

  return (
    <div className="w-[420px] shrink-0 sticky top-4 border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
      <div className="p-4 pb-3 space-y-3 border-b bg-background">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Session</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Select
          disabled={loadingCampaigns}
          value={selectedCampaignId ?? ""}
          onValueChange={handleCampaignChange}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loadingCampaigns ? "Loading…" : "Select campaign"}
            />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          disabled={!selectedCampaignId || loadingSessions}
          value={selectedSessionId ?? ""}
          onValueChange={handleSessionChange}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !selectedCampaignId
                  ? "Select a campaign first"
                  : loadingSessions
                    ? "Loading…"
                    : "Select session"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                #{s.sessionNumber} — {s.title}
                {s.status === "completed" ? " (completed)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {loadingSession && (
          <p className="text-sm text-muted-foreground p-6 text-center">
            Loading session…
          </p>
        )}
        {!selectedSessionId && !loadingSession && (
          <p className="text-sm text-muted-foreground p-6 text-center">
            Select a campaign and session above to view the session tracker.
          </p>
        )}
        {sessionData && !loadingSession && (
          <SessionTracker
            session={sessionData.session}
            activeUsers={sessionData.activeUsers}
            externalRefreshSignal={refreshSignal}
          />
        )}
      </div>
    </div>
  );
}
