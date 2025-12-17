"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Plus, Minus } from "lucide-react"

interface TokensCardProps {
  interventionTokens: number
  onTokenChange: (delta: number) => void
}

export function TokensCard({ interventionTokens, onTokenChange }: TokensCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Intervention Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg">
          <span className="font-semibold text-lg">Global Pool</span>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" onClick={() => onTokenChange(-1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold w-16 text-center">{interventionTokens}</span>
            <Button size="icon" variant="outline" onClick={() => onTokenChange(1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
