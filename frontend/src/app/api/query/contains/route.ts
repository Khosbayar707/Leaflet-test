import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lng = Number(searchParams.get("lng"));
    const lat = Number(searchParams.get("lat"));
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return NextResponse.json(
        { error: "lng and lat required" },
        { status: 400 }
      );
    }

    const rows = await prisma.$queryRaw<
      {
        id: number;
        name: string;
        description: string | null;
        properties: any;
        geometry: string;
      }[]
    >`
      SELECT id, name, description, properties, ST_AsGeoJSON(geom) AS geometry
      FROM "KmlLayer"
      WHERE ST_Contains(
        geom,
        ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)
      )
    `;

    const features = rows.map((r) => ({
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
      { error: "Query failed", details: String(e) },
      { status: 500 }
    );
  }
}
