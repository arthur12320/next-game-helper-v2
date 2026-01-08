import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GlobalCondition } from "@/db/schema/conditions";

interface ConditionsTabProps {
  allGlobalConditions: GlobalCondition[];
  characterConditions: GlobalCondition[];
  onConditionChange: (conditionId: string, checked: boolean) => void;
}

/**
 * A component that renders the "Conditions" tab in the character's play mode interface.
 * It displays all available global conditions and allows users to apply or remove them from the character.
 * It also provides a dialog to create new global conditions.
 * @param {ConditionsTabProps} props - The props for the component.
 */
export function ConditionsTab({
  allGlobalConditions,
  characterConditions,
  onConditionChange,
}: ConditionsTabProps) {


  return (
    <Card>
      <CardHeader>
        <CardTitle>Condition Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {allGlobalConditions.length === 0 ? (
          <p>No global conditions defined. Please add some in the GM panel.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {allGlobalConditions.map((condition) => (
              <div
                key={condition.id}
                className="flex items-start space-x-2 p-3 rounded border"
              >
                <Checkbox
                  id={condition.id}
                  checked={characterConditions.some((c) => c.id === condition.id)}
                  onCheckedChange={(checked) =>
                    onConditionChange(condition.id, checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={condition.id}
                    className="cursor-pointer font-medium"
                  >
                    {condition.name}
                  </Label>
                  {condition.description && (
                    <p className="text-sm text-muted-foreground">
                      {condition.description}
                    </p>
                  )}
                  {condition.recovery && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Recovery:</strong> {condition.recovery}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

    </Card>
  );
}
