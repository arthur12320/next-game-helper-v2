import { fetchSession } from "@/app/actions/sessions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import SessionTracker from "@/components/session-tracker"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const session = await fetchSession(sessionId)

  if (!session) return redirect("/")

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 space-y-6">
      <Link href={`/campaigns/${session.campaignId}`} className="inline-block text-blue-500 hover:underline">
        ← Back to Campaign
      </Link>

      <div>
        <h1 className="text-3xl font-bold">
          Session {session.sessionNumber}: {session.title}
        </h1>
        <p className="text-muted-foreground">
          Started: {new Date(session.startDate).toLocaleString()}
          {session.endDate && ` • Ended: ${new Date(session.endDate).toLocaleString()}`}
        </p>
      </div>

      <Suspense fallback={<SessionTrackerSkeleton />}>
        <SessionTracker session={session} />
      </Suspense>
    </div>
  )
}

function SessionTrackerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
