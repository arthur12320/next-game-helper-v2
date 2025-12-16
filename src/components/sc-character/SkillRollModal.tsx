"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Dices } from "lucide-react"
import { recordSkillTest } from "@/app/actions/sc-characters"
import { toast } from "sonner"


interface SkillRollModalProps {
  isOpen: boolean
  onClose: () => void
  skillName: string
  skillValue: number
  characterId: string
  skillTests?: { successes: number; failures: number }
}

export function SkillRollModal({
  isOpen,
  onClose,
  skillName,
  skillValue,
  characterId,
  skillTests,
}: SkillRollModalProps) {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<"success" | "fail" | null>(null)
  const [localTests, setLocalTests] = useState(skillTests || { successes: 0, failures: 0 })

  const handleRecordResult = async (isSuccess: boolean) => {
    setRecording(true)
    setResult(isSuccess ? "success" : "fail")

    // Record the test result
    const recordResult = await recordSkillTest(characterId, skillName, isSuccess)
    if (recordResult.success && recordResult.skillTest) {
      setLocalTests(recordResult.skillTest)
    } else {
      toast.warning("Warning",{
        description: "Couldn't save roll result",
      })
    }

    setRecording(false)
  }

  const handleClose = () => {
    setResult(null)
    setRecording(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            {skillName} Test
          </DialogTitle>
          <DialogDescription>
            Skill Level: {skillValue} | Tests: {localTests.successes}S / {localTests.failures}F
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {!result && !recording && (
            <div className="flex flex-col gap-3 w-full">
              <p className="text-center text-sm text-muted-foreground mb-2">Roll your dice and record the result:</p>
              <Button
                onClick={() => handleRecordResult(true)}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Success
              </Button>
              <Button onClick={() => handleRecordResult(false)} size="lg" variant="destructive" className="w-full">
                <XCircle className="h-5 w-5 mr-2" />
                Fail
              </Button>
            </div>
          )}

          {recording && (
            <div className="flex flex-col items-center gap-4">
              <Dices className="h-16 w-16 animate-pulse text-primary" />
              <p className="text-muted-foreground">Recording result...</p>
            </div>
          )}

          {result === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <div>
                <h3 className="text-2xl font-bold text-green-500">Success!</h3>
                <p className="text-muted-foreground mt-2">Total successes: {localTests.successes}</p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}

          {result === "fail" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-20 w-20 text-red-500" />
              <div>
                <h3 className="text-2xl font-bold text-red-500">Fail!</h3>
                <p className="text-muted-foreground mt-2">Total failures: {localTests.failures}</p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
          <span>Successes: {localTests.successes}</span>
          <span>Failures: {localTests.failures}</span>
          <span>Total: {localTests.successes + localTests.failures}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
