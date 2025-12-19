"use client";

import { useEffect, useState } from "react";
import {
  createCondition,
  deleteCondition,
  getConditions,
  updateCondition,
} from "@/app/actions/conditions";
import { GlobalCondition } from "@/db/schema/conditions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { toast } from "sonner";

/**
 * A page component for managing global conditions.
 * It allows users to view, create, edit, and delete conditions that can be applied to characters.
 */
export default function ConditionsPage() {
  // --- State Management ---
  // Stores the list of all global conditions.
  const [conditions, setConditions] = useState<GlobalCondition[]>([]);
  // Tracks the loading state while fetching conditions.
  const [loading, setLoading] = useState(true);
  // Controls the visibility of the "Create New Condition" dialog.
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  // Controls the visibility of the "Edit Condition" dialog.
  const [openEditDialog, setOpenEditDialog] = useState(false);
  // Stores the condition that is currently being edited.
  const [currentCondition, setCurrentCondition] = useState<GlobalCondition | null>(
    null,
  );

  // --- Data Fetching ---
  /**
   * Fetches all global conditions when the component mounts.
   */
  useEffect(() => {
    fetchConditions();
  }, []);

  /**
   * Fetches the list of global conditions from the server and updates the state.
   */
  const fetchConditions = async () => {
    setLoading(true);
    const result = await getConditions();
    if (result.success && result.data) {
      setConditions(result.data);
    } else {
      toast.error("Failed to fetch conditions.");
    }
    setLoading(false);
  };

  // --- Event Handlers ---
  /**
   * Handles the form submission for creating a new condition.
   * @param formData - The form data from the create dialog.
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
      fetchConditions();
    } else {
      toast.error(result.error || "Failed to create condition.");
    }
  };

  /**
   * Handles the form submission for updating an existing condition.
   * @param formData - The form data from the edit dialog.
   */
  const handleUpdate = async (formData: FormData) => {
    if (!currentCondition) return;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    if (!name) {
      toast.error("Condition name is required.");
      return;
    }
    const result = await updateCondition(currentCondition.id, name, description);
    if (result.success) {
      toast.success("Condition updated successfully.");
      setOpenEditDialog(false);
      fetchConditions();
    } else {
      toast.error(result.error || "Failed to update condition.");
    }
  };

  /**
   * Handles the deletion of a condition.
   * @param id - The ID of the condition to delete.
   */
  const handleDelete = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to delete this condition? This cannot be undone.")
    ) {
      return;
    }
    const result = await deleteCondition(id);
    if (result.success) {
      toast.success("Condition deleted successfully.");
      fetchConditions();
    } else {
      toast.error(result.error || "Failed to delete condition.");
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading conditions...</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto p-4 pt-10 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Global Conditions</h1>
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>Add New Condition</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Condition</DialogTitle>
                <DialogDescription>
                  Add a new condition that can be applied to characters.
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreate} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label  className="text-right">
                    Name
                  </Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label  className="text-right">
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
        </div>

        {conditions.length === 0 ? (
          <p>No conditions found. Add a new one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conditions.map((condition) => (
              <Card key={condition.id}>
                <CardHeader>
                  <CardTitle>{condition.name}</CardTitle>
                  <CardDescription>ID: {condition.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{condition.description || "No description provided."}</p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Dialog open={openEditDialog && currentCondition?.id === condition.id} onOpenChange={setOpenEditDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentCondition(condition);
                            setOpenEditDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Condition</DialogTitle>
                          <DialogDescription>
                            Modify the name and description of the condition.
                          </DialogDescription>
                        </DialogHeader>
                        {currentCondition && (
                          <form action={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                Name
                              </Label>
                              <Input
                                id="edit-name"
                                name="name"
                                className="col-span-3"
                                defaultValue={currentCondition.name}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label
                                
                                className="text-right"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                className="col-span-3"
                                defaultValue={currentCondition.description || ""}
                              />
                            </div>
                            <DialogFooter>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(condition.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
