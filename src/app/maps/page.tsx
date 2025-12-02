import { Suspense } from "react";
import MapList from "@/components/MapList";
import CreateMapButton from "@/components/CreateMapButton";

export default async function MapsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Battle Maps</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage battle maps using OTFBM
          </p>
        </div>
        <CreateMapButton />
      </div>

      <Suspense fallback={<MapList.Skeleton />}>
        <MapList />
      </Suspense>
    </div>
  );
}
