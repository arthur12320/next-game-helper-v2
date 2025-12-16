import { fetchSCCharacter } from "@/app/actions/sc-characters"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SCPlayMode } from "@/components/sc-character/SCPlayMode"

interface PlayModePageProps {
  params: Promise<{ characterId: string }>
}

export default async function SCPlayModePage({ params }: PlayModePageProps) {
  const { characterId } = await params
  const character = await fetchSCCharacter(characterId)

  if (!character) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/sc-characters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/sc-characters/${characterId}/edit`}>Edit Agent</Link>
        </Button>
      </div>

      <SCPlayMode character={character} />
    </div>
  )
}
