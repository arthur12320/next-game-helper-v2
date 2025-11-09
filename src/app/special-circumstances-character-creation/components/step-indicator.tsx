"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

const STEP_NAMES = ["Homeworld", "Upbringing", "Lifepaths", "Beliefs", "Connections"]

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-semibold transition-all",
                step < currentStep && "bg-primary text-primary-foreground",
                step === currentStep &&
                  "bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background",
                step > currentStep && "bg-muted text-muted-foreground",
              )}
            >
              {step < currentStep ? "✓" : step}
            </div>
            <span
              className={cn(
                "text-xs mt-2 font-medium hidden sm:block",
                step === currentStep ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {STEP_NAMES[step - 1]}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
