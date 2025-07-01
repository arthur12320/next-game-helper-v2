import { getUserAssets } from "@/app/actions/assets";
import { AssetsPageClient } from "@/components/assets-page-client";

export default async function AssetsPage() {
  const assets = await getUserAssets();

  return <AssetsPageClient assets={assets} />;
}
