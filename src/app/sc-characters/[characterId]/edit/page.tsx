import { fetchSCCharacter } from "@/app/actions/sc-characters"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SCEditForm } from "@/components/sc-character/SCEditForm"

interface EditPageProps {
  params: Promise<{ characterId: string }>
}

export default async function SCEditPage({ params }: EditPageProps) {
  const { characterId } = await params
  const character = await fetchSCCharacter(characterId)

  if (!character) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/sc-characters/${characterId}/play`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Play Mode
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Edit Agent</h1>
        <p className="text-muted-foreground mt-2">{`Update your agent's information`}</p>
      </div>

      <SCEditForm character={character} />
    </div>
  )
}
