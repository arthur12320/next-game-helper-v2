"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Dices, TrendingUp } from "lucide-react"
import { recordSkillTest, recordAbilityTest } from "@/app/actions/sc-characters"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface SkillRollModalProps {
  isOpen: boolean
  onClose: () => void
  skillName: string
  skillValue: number
  characterId: string
  skillTests?: { successes: number; failures: number }
  type?: "skill" | "ability"
  abilityValue?: number
  onAbilityLevelUp?: (abilityName: string, newLevel: number) => void
  mindchipBoost?: number
  abilityName?: string
}

export function SkillRollModal({
  isOpen,
  onClose,
  skillName,
  skillValue,
  characterId,
  skillTests,
  type = "skill",
  abilityValue = 3,
  onAbilityLevelUp,
  mindchipBoost = 0,
  abilityName,
}: SkillRollModalProps) {
  // State management
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<"success" | "fail" | null>(null)
  const [localTests, setLocalTests] = useState(skillTests || { successes: 0, failures: 0 })
  const [leveledUp, setLeveledUp] = useState(false)

  // Handle recording test result (success or fail)
  const handleRecordResult = async (isSuccess: boolean) => {
    setRecording(true)
    setResult(isSuccess ? "success" : "fail")

    // Call appropriate server action based on type
    const recordResult =
      type === "ability"
        ? await recordAbilityTest(characterId, skillName, isSuccess)
        : await recordSkillTest(characterId, skillName, isSuccess)

    if (recordResult.success) {
      // Update local test counts
      if (type === "ability" && "abilityTest" in recordResult) {
        setLocalTests(recordResult.abilityTest as { successes: number; failures: number })
        setLeveledUp(!!recordResult.leveledUp)
        if (recordResult.leveledUp && onAbilityLevelUp) {
          onAbilityLevelUp(skillName, abilityValue + 1)
        }
      } else if ("skillTest" in recordResult) {
        setLocalTests(recordResult.skillTest as { successes: number; failures: number })
        setLeveledUp(!!recordResult.leveledUp)
      }
    } else {
      toast.error("Warning", {
        description: "Couldn't save roll result",
      })
    }

    setRecording(false)
  }

  // Reset state and close modal
  const handleClose = () => {
    setResult(null)
    setRecording(false)
    setLeveledUp(false)
    onClose()
  }

  const isLearning = skillValue === 0 && mindchipBoost === 0
  const effectiveRollLevel = isLearning ? abilityValue : skillValue + mindchipBoost
  const usingAbility = isLearning && type === "skill"

  const requiredLearningTests = isLearning ? 6 - abilityValue : 0
  const learningProgress = localTests.successes + localTests.failures
  const learningTestProgress = isLearning ? Math.min((learningProgress / requiredLearningTests) * 100, 100) : 0

  const requiredSuccesses = skillValue
  const requiredFailures = Math.floor(skillValue / 2)
  const successProgress = Math.min((localTests.successes / requiredSuccesses) * 100, 100)
  const failureProgress = Math.min((localTests.failures / requiredFailures) * 100, 100)
  const canAdvance = localTests.successes >= requiredSuccesses && localTests.failures >= requiredFailures

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            {skillName} Test
          </DialogTitle>
          <DialogDescription>
            Level {skillValue} | Tests: {localTests.successes}S / {localTests.failures}F
          </DialogDescription>
        </DialogHeader>

        <div className="border-2 rounded-lg p-4 bg-primary/5 border-primary/20 text-center">
          <div className="text-sm text-muted-foreground mb-1">Roll with</div>
          <div className="text-5xl font-bold text-primary">{effectiveRollLevel}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {usingAbility ? (
              <span className="text-blue-500 font-medium">Using {abilityName} ability (Beginner&apos;s Luck)</span>
            ) : mindchipBoost > 0 ? (
              <span>
                Base {skillValue} + <span className="text-purple-500 font-medium">Mindchip +{mindchipBoost}</span>
              </span>
            ) : (
              <span>Base skill level</span>
            )}
          </div>
        </div>

        {!result && !recording && (
          <>
            {/* Beginner's Luck Warning */}
            {isLearning && type === "skill" && (
              <div className="border-2 rounded-lg p-4 bg-amber-500/10 border-amber-500/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Beginner&apos;s Luck Warning</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  When using an untrained skill, all <strong>Obstacles (Ob) are doubled</strong>. Easy tasks remain
                  achievable, but complex challenges become significantly harder.
                </p>
              </div>
            )}
            {/* Beginner's Luck Learning (Level 0) */}
            {isLearning && (
              <div className="border rounded-lg p-4 bg-blue-500/10 border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{`Learning Skill (Beginner's Luck)`}</span>
                  {learningProgress >= requiredLearningTests && (
                    <span className="text-blue-500 font-semibold">Ready to Learn!</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Test Progress</span>
                    <span className={learningProgress >= requiredLearningTests ? "text-blue-500 font-medium" : ""}>
                      {learningProgress} / {requiredLearningTests}
                    </span>
                  </div>
                  <Progress value={learningTestProgress} className="h-2" />
                </div>

                <p className="text-xs text-muted-foreground">
                  {learningProgress < requiredLearningTests &&
                    `Need ${requiredLearningTests - learningProgress} more test(s) to learn this skill.`}
                </p>
              </div>
            )}

            {/* Skill Advancement (Level > 0) */}
            {skillValue > 0 && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress to Level {skillValue + 1}</span>
                  {canAdvance && <span className="text-green-500 font-semibold">Ready to Advance!</span>}
                </div>

                {/* Success requirement */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Successes</span>
                    <span className={localTests.successes >= requiredSuccesses ? "text-green-500 font-medium" : ""}>
                      {localTests.successes} / {requiredSuccesses}
                    </span>
                  </div>
                  <Progress value={successProgress} className="h-2" />
                </div>

                {/* Failure requirement */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Failures</span>
                    <span className={localTests.failures >= requiredFailures ? "text-green-500 font-medium" : ""}>
                      {localTests.failures} / {requiredFailures}
                    </span>
                  </div>
                  <Progress value={failureProgress} className="h-2" />
                </div>

                {!canAdvance && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    {localTests.successes < requiredSuccesses && localTests.failures < requiredFailures
                      ? `Need ${requiredSuccesses - localTests.successes} more success(es) and ${requiredFailures - localTests.failures} more failure(s)`
                      : localTests.successes < requiredSuccesses
                        ? `Need ${requiredSuccesses - localTests.successes} more success(es)`
                        : `Need ${requiredFailures - localTests.failures} more failure(s)`}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Initial state: Show success/fail buttons */}
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

          {/* Recording state: Show loading indicator */}
          {recording && (
            <div className="flex flex-col items-center gap-4">
              <Dices className="h-16 w-16 animate-pulse text-primary" />
              <p className="text-muted-foreground">Recording result...</p>
            </div>
          )}

          {/* Level up celebration: Show advancement screen */}
          {leveledUp && (
            <div className="flex flex-col items-center gap-4 text-center bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-lg border border-amber-500/20">
              <TrendingUp className="h-20 w-20 text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold text-amber-500">
                  {type === "ability" ? "Ability" : "Skill"} Advanced!
                </h3>
                <p className="text-muted-foreground mt-2">
                  {skillName} advanced to level {skillValue + 1}!
                </p>
                <p className="text-xs text-muted-foreground mt-1">Test progress has been reset.</p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Success result: Show success screen */}
          {!leveledUp && result === "success" && (
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

          {/* Fail result: Show fail screen */}
          {!leveledUp && result === "fail" && (
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

        {/* Footer: Test statistics */}
        <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
          <span>Successes: {localTests.successes}</span>
          <span>Failures: {localTests.failures}</span>
          <span>Total: {localTests.successes + localTests.failures}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
