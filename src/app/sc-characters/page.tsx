import { fetchSCCharacters } from "@/app/actions/sc-characters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, User, Play, Edit } from "lucide-react"

export default async function SCCharactersPage() {
  const characters = await fetchSCCharacters()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Special Circumstances</h1>
          <p className="text-muted-foreground mt-2">Manage your agents and their missions</p>
        </div>
        <Button asChild size="lg">
          <Link href="/sc-characters/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Agent
          </Link>
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first Special Circumstances agent to begin your missions
            </p>
            <Button asChild>
              <Link href="/sc-characters/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{character.name}</CardTitle>
                    {character.pronouns && <CardDescription className="mt-1">{character.pronouns}</CardDescription>}
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Agent
                  </Badge>
                </div>
                {character.concept && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{character.concept}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="font-semibold text-lg">{character.abilities.Will}</div>
                      <div className="text-xs text-muted-foreground">Will</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="font-semibold text-lg">{character.abilities.Health}</div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="font-semibold text-lg">{character.abilities.Mindchip}</div>
                      <div className="text-xs text-muted-foreground">Mindchip</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="default" className="flex-1">
                      <Link href={`/sc-characters/${character.id}/play`}>
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/sc-characters/${character.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
