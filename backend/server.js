// backend/server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import dotenv from "dotenv";
import { DOMParser } from "xmldom";
import * as toGeoJSON from "@tmcw/togeojson";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
  try {
    const [{ postgis_version }] = await prisma.$queryRaw`
      SELECT PostGIS_Version() AS postgis_version
    `;
    res.json({ ok: true, postgis: postgis_version });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// KML upload → GeoJSON → PostGIS insert
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const kmlText = await fs.readFile(req.file.path, "utf8");

    // KML → GeoJSON хөрвүүлэлт
    const dom = new DOMParser().parseFromString(kmlText, "text/xml");
    const geojson = toGeoJSON.kml(dom);
    if (!geojson?.features?.length) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: "No features found in KML" });
    }

    // Feature бүрийг DB-д оруулах
    for (const feature of geojson.features) {
      const name =
        feature?.properties?.name || req.file.originalname || "untitled";
      const desc = feature?.properties?.description || null;
      const props = feature?.properties || {};
      const geomJson = JSON.stringify(feature.geometry); // GeoJSON geometry

      // Prisma RAW + PostGIS
      await prisma.$executeRaw`
        INSERT INTO "KmlLayer" (name, description, properties, geom)
        VALUES (
          ${name},
          ${desc},
          ${props},
          ST_SetSRID(ST_GeomFromGeoJSON(${geomJson}), 4326)
        )
      `;
    }

    await fs.unlink(req.file.path);
    res.json({
      success: true,
      count: geojson.features.length,
      features: geojson.features,
    });
  } catch (e) {
    console.error(e);
    try {
      await fs.unlink(req.file.path);
    } catch {}
    res.status(500).json({ error: "Upload failed", details: String(e) });
  }
});

// Point within polygon query
app.get("/query/contains", async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return res
      .status(400)
      .json({ error: "lng and lat query params are required" });
  }

  try {
    const rows = await prisma.$queryRaw`
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
    res.json({ features });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Query failed", details: String(e) });
  }
});

// Бүх layer-үүдийг авах (optional)
app.get("/layers", async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT id, name, description, properties, ST_AsGeoJSON(geom) AS geometry
      FROM "KmlLayer"
      ORDER BY id DESC
      LIMIT 500
    `;
    const features = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      properties: r.properties,
      geometry: JSON.parse(r.geometry),
    }));
    res.json({ features });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fetch failed", details: String(e) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
