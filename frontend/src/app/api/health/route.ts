import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ postgis_version: string }[]>`
      SELECT PostGIS_Version() AS postgis_version
    `;
    return NextResponse.json({ ok: true, postgis: rows?.[0]?.postgis_version });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
