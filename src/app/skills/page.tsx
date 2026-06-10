import { getAllSkills } from "@/app/actions/sc-skills";
import { fetchDGMoSList } from "@/app/actions/dg-config";
import { SkillsClient } from "./skills-client";
import { DGConfigPanel } from "@/components/dg-character/DGConfigPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SkillsPage() {
  const [{ skills, error }, mosList] = await Promise.all([
    getAllSkills(),
    fetchDGMoSList(),
  ]);

  if (error || !skills) {
    return <div>Error loading skills: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="sc">
        <TabsList className="mb-4">
          <TabsTrigger value="sc">Special Circumstances</TabsTrigger>
          <TabsTrigger value="dg">Delta Green</TabsTrigger>
        </TabsList>
        <TabsContent value="sc">
          <SkillsClient skills={skills} />
        </TabsContent>
        <TabsContent value="dg">
          <DGConfigPanel mosList={mosList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
