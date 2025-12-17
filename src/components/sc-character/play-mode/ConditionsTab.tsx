import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ConditionsTabProps {
  conditions: Record<string, boolean>
  onConditionChange: (condition: string, checked: boolean) => void
}

export function ConditionsTab({ conditions, onConditionChange }: ConditionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Condition Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(conditions).map(([condition, active]) => (
            <div key={condition} className="flex items-center space-x-2 p-3 rounded border">
              <Checkbox
                id={condition}
                checked={active}
                onCheckedChange={(checked) => onConditionChange(condition, checked as boolean)}
              />
              <Label htmlFor={condition} className="flex-1 cursor-pointer">
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
