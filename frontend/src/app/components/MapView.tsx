"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L, { GeoJSON as LGeoJSON, Map as LeafletMap } from "leaflet";

export type GeoJSONFeature = {
  type: "Feature";
  geometry: any;
  properties?: Record<string, any>;
};

export default function MapView({ features }: { features: GeoJSONFeature[] }) {
  if (typeof window === "undefined") return null;

  const mapRef = useRef<LeafletMap | null>(null);
  const hasFeatures = Array.isArray(features) && features.length > 0;

  useEffect(() => {
    if (!mapRef.current || !hasFeatures) return;
    try {
      const fc = { type: "FeatureCollection", features } as any;
      const layer = new LGeoJSON(fc);
      const bounds = layer.getBounds();
      if (bounds && bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch {}
  }, [hasFeatures, features]);

  return (
    <MapContainer id="map" center={[47.92, 106.9]} zoom={8} ref={mapRef}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {hasFeatures && (
        <GeoJSON data={{ type: "FeatureCollection", features } as any} />
      )}
    </MapContainer>
  );
}
