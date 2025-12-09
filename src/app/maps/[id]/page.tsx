import { fetchMaps } from "@/app/actions/maps";
import { notFound } from "next/navigation";
import MapEditor from "@/components/mapEditor";

export default async function MapEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const maps = await fetchMaps();
  const param = await params;
  const map = maps.find((m) => m.id === param.id);

  if (!map) {
    notFound();
  }

  return <MapEditor map={map} />;
}
