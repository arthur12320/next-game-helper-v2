import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCCharacter } from "@/db/schema/sc-character"

type BackgroundTabProps = Pick<
  SCCharacter,
  | "homeworld"
  | "upbringing"
  | "lifepaths"
  | "connections"
  | "beliefs"
  | "instincts"
  | "goals"
  | "traitPairs"
>

export function BackgroundTab({
  homeworld,
  upbringing,
  lifepaths,
  connections,
  beliefs,
  instincts,
  goals,
  traitPairs,
}: BackgroundTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background & Development</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {homeworld?.name && (
          <div>
            <h4 className="font-semibold mb-1">Homeworld: {homeworld.name}</h4>
            <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">
              {homeworld.promptAnswer}
            </p>
          </div>
        )}
        {upbringing?.name && (
          <div>
            <h4 className="font-semibold mb-1">Upbringing: {upbringing.name}</h4>
            <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">
              {upbringing.promptAnswer}
            </p>
          </div>
        )}
        {lifepaths && lifepaths.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Lifepaths</h4>
            <div className="space-y-3">
              {lifepaths.map((lp, i) => (
                <div key={i}>
                  <h5 className="font-medium">{lp.name}</h5>
                  <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">
                    {lp.promptAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {traitPairs && traitPairs.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Traits</h4>
            <div className="flex flex-wrap gap-2">
              {traitPairs.map((pair, i) => (
                <Badge key={i} variant="secondary">
                  {pair.trait1} / {pair.trait2}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {connections && connections.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Connections</h4>
            <div className="space-y-3">
              {connections.map((conn, i) => (
                <div key={i}>
                  <h5 className="font-medium">{conn.characterName}</h5>
                  <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">
                    {conn.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {beliefs && (
          <div>
            <h4 className="font-semibold mb-1">Beliefs</h4>
            <p className="text-sm text-muted-foreground">{beliefs}</p>
          </div>
        )}
        {instincts && (
          <div>
            <h4 className="font-semibold mb-1">Instincts</h4>
            <p className="text-sm text-muted-foreground">{instincts}</p>
          </div>
        )}
        {goals && (
          <div>
            <h4 className="font-semibold mb-1">Goals</h4>
            <p className="text-sm text-muted-foreground">{goals}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

