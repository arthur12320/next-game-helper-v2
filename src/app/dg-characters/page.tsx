import { fetchDGCharacters } from "@/app/actions/dg-characters"
import { fetchDGMoSList } from "@/app/actions/dg-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DGConfigPanel } from "@/components/dg-character/DGConfigPanel"
import Link from "next/link"
import { Plus, User, Play, Edit } from "lucide-react"

export default async function DGCharactersPage() {
  const [characters, mosList] = await Promise.all([
    fetchDGCharacters(),
    fetchDGMoSList(),
  ])

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Delta Green</h1>
          <p className="text-muted-foreground mt-2">Manage your agents and their operations</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dg-characters/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Agent
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="config">DG Config</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          {characters.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Create your first Delta Green agent to begin operations
                </p>
                <Button asChild>
                  <Link href="/dg-characters/create">
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
                        {character.nationality && (
                          <CardDescription className="mt-1">{character.nationality}</CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {character.profession || "Agent"}
                      </Badge>
                    </div>
                    {character.age && (
                      <p className="text-sm text-muted-foreground mt-1">Age: {character.age}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-secondary/50 rounded">
                          <div className="font-semibold text-lg">{character.derivedCurrent.HP}</div>
                          <div className="text-xs text-muted-foreground">HP</div>
                        </div>
                        <div className="text-center p-2 bg-secondary/50 rounded">
                          <div className="font-semibold text-lg">{character.derivedCurrent.SAN}</div>
                          <div className="text-xs text-muted-foreground">SAN</div>
                        </div>
                        <div className="text-center p-2 bg-secondary/50 rounded">
                          <div className="font-semibold text-lg">{character.derivedMax.BP}</div>
                          <div className="text-xs text-muted-foreground">BP</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-1 text-xs text-center">
                        {(["STR", "CON", "DEX", "INT", "POW", "CHA"] as const).map((stat) => (
                          <div key={stat} className="p-1 bg-muted/50 rounded">
                            <div className="font-medium">{character.stats[stat]}</div>
                            <div className="text-muted-foreground">{stat}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button asChild variant="default" className="flex-1">
                          <Link href={`/dg-characters/${character.id}/play`}>
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dg-characters/${character.id}/edit`}>
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
        </TabsContent>

        <TabsContent value="config">
          <DGConfigPanel mosList={mosList} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
