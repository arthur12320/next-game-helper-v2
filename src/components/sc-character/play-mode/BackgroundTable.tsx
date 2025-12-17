import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BackgroundTabProps {
  homeworld?: string | null
  upbringing?: string | null
  beliefs?: string | null
  instincts?: string | null
  goals?: string | null
}

export function BackgroundTab({ homeworld, upbringing, beliefs, instincts, goals }: BackgroundTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background & Development</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {homeworld && (
          <div>
            <h4 className="font-semibold mb-1">Homeworld</h4>
            <p className="text-sm text-muted-foreground">{homeworld}</p>
          </div>
        )}
        {upbringing && (
          <div>
            <h4 className="font-semibold mb-1">Upbringing</h4>
            <p className="text-sm text-muted-foreground">{upbringing}</p>
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
