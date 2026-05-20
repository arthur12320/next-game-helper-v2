import { fetchDGCharacter } from "@/app/actions/dg-characters"
import { DGPlayMode } from "@/components/dg-character/DGPlayMode"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DGPlayModePageProps {
  params: Promise<{ characterId: string }>
}

export default async function DGPlayModePage({ params }: DGPlayModePageProps) {
  const { characterId } = await params
  const character = await fetchDGCharacter(characterId)

  if (!character) notFound()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dg-characters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dg-characters/${characterId}/edit`}>Edit Agent</Link>
        </Button>
      </div>

      <DGPlayMode character={character} />
    </div>
  )
}
