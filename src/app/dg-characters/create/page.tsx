import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DGCharacterCreationWizard } from "@/components/dg-character/DGCharacterCreationWizard"
import { fetchDGMoSList } from "@/app/actions/dg-config"

export default async function CreateDGCharacterPage() {
  const mosList = await fetchDGMoSList()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dg-characters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create New Agent</h1>
        <p className="text-muted-foreground mt-2">Recruit your Delta Green operative</p>
      </div>

      <DGCharacterCreationWizard mosList={mosList} />
    </div>
  )
}
