import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // эсвэл '@/lib/prisma'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type LayerRow = {
  id: number;
  name: string;
  description: string | null;
  properties: any;
  geometry: string;
};

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<LayerRow[]>`
      SELECT id, name, description, properties, ST_AsGeoJSON(geom) AS geometry
      FROM "KmlLayer"
      ORDER BY id DESC
      LIMIT 500
    `;

    const features = rows.map((r: LayerRow) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      properties: r.properties,
      geometry: JSON.parse(r.geometry),
    }));

    return NextResponse.json({ features });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Fetch failed", details: String(e) },
      { status: 500 }
    );
  }
}
