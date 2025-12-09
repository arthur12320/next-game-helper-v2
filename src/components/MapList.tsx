import { CardFooter } from "@/components/ui/card";
import { fetchMaps } from "@/app/actions/maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteMapButton from "./DeleteMapButton";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default async function MapList() {
  const maps = await fetchMaps();

  if (maps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No maps yet. Create your first battle map!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {maps.map((map) => (
        <Card
          key={map.id}
          className="overflow-hidden group hover:shadow-lg transition-shadow"
        >
          <Link href={`/maps/${map.id}`} className="block">
            <CardHeader>
              <CardTitle className="line-clamp-1">{map.name}</CardTitle>
              {map.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {map.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Map Preview */}
              <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
                <Image
                  src={map.otfbmUrl || "/placeholder.svg"}
                  alt={map.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </div>

              {/* Map Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{map.size}</span>
                </div>
                {map.tokens && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens:</span>
                    <span className="font-mono text-xs truncate ml-2">
                      {map.tokens.split("/").length}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Link>
          <div className="px-6 pb-4">
            <DeleteMapButton mapId={map.id} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Skeleton Loader
MapList.Skeleton = function skeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
