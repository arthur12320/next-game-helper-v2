import { getSessionData } from "@/app/actions/sessions";
import { redirect } from "next/navigation";
import Link from "next/link";
import SessionTracker from "@/components/session-tracker";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const sessionData = await getSessionData(sessionId);

  if (!sessionData.session) return redirect("/");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 space-y-6">
      <Link
        href={`/campaigns/${sessionData.session.campaignId}`}
        className="inline-block text-blue-500 hover:underline"
      >
        ← Back to Campaign
      </Link>

      <div>
        <h1 className="text-3xl font-bold">
          Session {sessionData.session.sessionNumber}:{" "}
          {sessionData.session.title}
        </h1>
        <p className="text-muted-foreground">
          Started: {new Date(sessionData.session.startDate).toLocaleString()}
          {sessionData.session.endDate &&
            ` • Ended: ${new Date(
              sessionData.session.endDate
            ).toLocaleString()}`}
        </p>
      </div>

      <Suspense fallback={<SessionTrackerSkeleton />}>
        <SessionTracker
          session={sessionData.session}
          activeUsers={
            (sessionData.activeUsers.map((u) => ({
              userId: u.userId,
              userName: u.userName,
              lastSeen: u.lastSeen,
            })) || []) as Array<{
              userId: string;
              userName: string;
              lastSeen: Date;
            }>
          }
        />
      </Suspense>
    </div>
  );
}

function SessionTrackerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
