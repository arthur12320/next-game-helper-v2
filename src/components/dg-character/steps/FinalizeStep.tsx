"use client"

import { Badge } from "@/components/ui/badge"
import { DGCharacter } from "@/db/schema/dg-character"
import { calcDerived } from "@/lib/dg-data"

interface FinalizeStepProps {
  data: Partial<DGCharacter>
}

export function FinalizeStep({ data }: FinalizeStepProps) {
  const stats = data.stats || { STR: 10, CON: 10, DEX: 10, INT: 10, POW: 10, CHA: 12 }
  const derived = calcDerived(stats)
  const totalPoints = Object.values(stats).reduce((s, v) => s + v, 0)
  const bonds = data.bonds || []
  const motivations = data.motivations || []

  const checkedSkills = Object.entries(data.skills || {})
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Personal Data</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {data.name || "—"}</div>
          <div><span className="text-muted-foreground">MoS:</span> {data.profession || "Sniper"}</div>
          <div><span className="text-muted-foreground">Nationality:</span> {data.nationality || "American"}</div>
          <div><span className="text-muted-foreground">Age:</span> {data.age || "—"}</div>
          <div><span className="text-muted-foreground">Employer:</span> {data.employer || "—"}</div>
          <div><span className="text-muted-foreground">Sex:</span> {data.sex || "—"}</div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">
          Statistics{" "}
          <span className={totalPoints === 72 ? "text-green-600 text-sm font-normal" : "text-destructive text-sm font-normal"}>
            ({totalPoints}/72 points)
          </span>
        </h3>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {(["STR", "CON", "DEX", "INT", "POW", "CHA"] as const).map((stat) => (
            <div key={stat} className="border rounded p-2">
              <div className="font-bold text-lg">{stats[stat]}</div>
              <div className="text-muted-foreground text-xs">{stat}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Derived Attributes</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          {[
            { label: "HP", value: derived.HP },
            { label: "WP", value: derived.WP },
            { label: "SAN", value: derived.SAN },
            { label: "BP", value: derived.BP },
          ].map(({ label, value }) => (
            <div key={label} className="border rounded p-2">
              <div className="font-bold text-lg">{value}</div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {checkedSkills.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Skills above base value</h3>
          <div className="flex flex-wrap gap-2">
            {checkedSkills.map(([skill, pct]) => (
              <Badge key={skill} variant="secondary">
                {skill} {pct}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Bonds ({bonds.length})</h3>
        {bonds.length === 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">No bonds selected — consider adding bonds before creating.</p>
        ) : (
          <div className="space-y-1">
            {bonds.map((b) => (
              <div key={b.id} className="text-sm flex justify-between">
                <span>{b.name}</span>
                <span className="text-muted-foreground">Score: {b.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {motivations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Motivations</h3>
          <ul className="list-disc list-inside space-y-1">
            {motivations.map((m, i) => (
              <li key={i} className="text-sm">{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
