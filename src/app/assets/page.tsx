import { getUserAssets } from "@/app/actions/assets";
import { AssetGrid } from "@/components/AssetGrid";

export default async function AssetsPage() {
  const assets = await getUserAssets();

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Assets</h1>
        <p className="text-muted-foreground">
          Manage your uploaded images and files
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {"You haven't uploaded any assets yet"}
          </p>
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}
    </div>
  );
}
