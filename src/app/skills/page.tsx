// src/app/skills/page.tsx
import { getAllSkills } from "@/app/actions/sc-skills";
import { SkillsClient } from "./skills-client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function SkillsPage() {
  const { skills, error } = await getAllSkills();

  if (error || !skills) {
    return <div>Error loading skills: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}>
        <SkillsClient skills={skills} />
      </Suspense>
    </div>
  );
}