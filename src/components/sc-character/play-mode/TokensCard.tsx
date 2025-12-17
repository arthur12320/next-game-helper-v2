"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Plus, Minus } from "lucide-react"

interface TokensCardProps {
  interventionTokens: number
  heroTokens: number
  onTokenChange: (type: "interventionTokens" | "heroTokens", delta: number) => void
}

export function TokensCard({ interventionTokens, heroTokens, onTokenChange }: TokensCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded">
          <span className="font-semibold">Intervention Tokens</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => onTokenChange("interventionTokens", -1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-bold w-12 text-center">{interventionTokens}</span>
            <Button size="icon" variant="outline" onClick={() => onTokenChange("interventionTokens", 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded">
          <span className="font-semibold">Hero Tokens</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => onTokenChange("heroTokens", -1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-bold w-12 text-center">{heroTokens}</span>
            <Button size="icon" variant="outline" onClick={() => onTokenChange("heroTokens", 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
