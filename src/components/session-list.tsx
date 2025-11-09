import { fetchSessionsByCampaign } from "@/app/actions/sessions"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface SessionListProps {
  campaignId: string
}

export default async function SessionList({ campaignId }: SessionListProps) {
  const sessions = await fetchSessionsByCampaign(campaignId)

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center py-8">
              No sessions yet. Start tracking your first session!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        sessions.map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Session {session.sessionNumber}: {session.title}
                      {session.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(session.startDate).toLocaleString()}
                      {session.endDate && ` - ${new Date(session.endDate).toLocaleString()}`}
                    </CardDescription>
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                    {session.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}
