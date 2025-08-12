// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { DOMParser } from "@xmldom/xmldom";
import * as toGeoJSON from "@tmcw/togeojson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const kmlText = await file.text();
    const dom = new DOMParser().parseFromString(kmlText, "text/xml") as any;

    const geojson = toGeoJSON.kml(dom as any);

    if (!geojson?.features?.length) {
      return NextResponse.json(
        { error: "No features found in KML" },
        { status: 400 }
      );
    }

    for (const feature of geojson.features) {
      const name = feature?.properties?.name ?? file.name ?? "untitled";
      const desc = feature?.properties?.description ?? null;
      const props = feature?.properties ?? {};
      const geomJson = JSON.stringify(feature.geometry);

      await prisma.$executeRaw`
        INSERT INTO "KmlLayer" (name, description, properties, geom)
        VALUES (${name}, ${desc}, ${props},
                ST_SetSRID(ST_GeomFromGeoJSON(${geomJson}), 4326))
      `;
    }

    return NextResponse.json({
      success: true,
      count: geojson.features.length,
      features: geojson.features,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Upload failed", details: String(e) },
      { status: 500 }
    );
  }
}
