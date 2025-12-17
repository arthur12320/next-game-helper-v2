import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CharacterHeaderProps {
  name: string
  pronouns?: string | null
  concept?: string | null
  activeConditions: Array<[string, boolean]>
}

export function CharacterHeader({ name, pronouns, concept, activeConditions }: CharacterHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
          {pronouns && <p className="text-muted-foreground mt-1">{pronouns}</p>}
          {concept && <p className="text-sm mt-2 max-w-2xl">{concept}</p>}
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Agent
        </Badge>
      </div>

      {activeConditions.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Active Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeConditions.map(([condition]) => (
                <Badge key={condition} variant="destructive">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
