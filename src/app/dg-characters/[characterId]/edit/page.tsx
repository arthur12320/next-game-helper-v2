import { fetchDGCharacter } from "@/app/actions/dg-characters"
import { DGEditForm } from "@/components/dg-character/DGEditForm"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DGEditPageProps {
  params: Promise<{ characterId: string }>
}

export default async function DGEditPage({ params }: DGEditPageProps) {
  const { characterId } = await params
  const character = await fetchDGCharacter(characterId)

  if (!character) notFound()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/dg-characters/${characterId}/play`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Play
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Edit Agent</h1>
        <p className="text-muted-foreground mt-2">{character.name}</p>
      </div>

      <DGEditForm character={character} />
    </div>
  )
}
