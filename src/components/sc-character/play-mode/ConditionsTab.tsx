import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GlobalCondition } from "@/db/schema/conditions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCondition } from "@/app/actions/conditions";
import { toast } from "sonner";

interface ConditionsTabProps {
  allGlobalConditions: GlobalCondition[];
  characterConditions: GlobalCondition[];
  onConditionChange: (conditionId: string, checked: boolean) => void;
  onConditionCreated: () => void;
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
  onConditionCreated,
}: ConditionsTabProps) {
  // State to control the visibility of the "Create New Condition" dialog.
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  /**
   * Checks if a specific condition is currently active on the character.
   * @param conditionId - The ID of the condition to check.
   * @returns True if the condition is active, false otherwise.
   */
  const isConditionActive = (conditionId: string) => {
    return characterConditions.some((c) => c.id === conditionId);
  };

  /**
   * Handles the form submission for creating a new global condition.
   * @param formData - The form data from the create condition dialog.
   */
  const handleCreate = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    if (!name) {
      toast.error("Condition name is required.");
      return;
    }
    const result = await createCondition(name, description);
    if (result.success) {
      toast.success("Condition created successfully.");
      setOpenCreateDialog(false);
      onConditionCreated(); // Trigger refetch in parent
    } else {
      toast.error(result.error || "Failed to create condition.");
    }
  };

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
                  checked={isConditionActive(condition.id)}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Create New Condition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Condition</DialogTitle>
              <DialogDescription>
                Add a new global condition that can be applied to any character.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Condition</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
