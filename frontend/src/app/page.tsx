"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ContainsForm from "./components/ContainForm";
import UploadForm from "./components/UploadForm";

const MapView = dynamic(() => import("./components/MapView"), { ssr: false });

export default function Page() {
  const [features, setFeatures] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        setStatus(d?.ok ? `PostGIS: ${d.postgis}` : "Backend unreachable");
      })
      .catch(() => setStatus("Backend unreachable"));
  }, []);

  const loadLayers = async () => {
    const r = await fetch("/api/layers", { cache: "no-store" });
    if (!r.ok) {
      setStatus("Failed to load layers");
      return;
    }
    const d = await r.json();
    const fs = (d?.features || []).map((x: any) => ({
      type: "Feature",
      geometry: x.geometry,
      properties: x.properties,
    }));
    setFeatures(fs);
  };

  return (
    <div className="appGrid">
      <div className="sidebar">
        <div className="panel">
          <h2 className="heading">KML Upload & Search</h2>
          <div aria-live="polite" className="status">
            {status}
          </div>
        </div>

        <div className="panel">
          <UploadForm onUploaded={(f) => setFeatures(f)} />
        </div>

        <div className="panel">
          <ContainsForm
            onResult={(f) =>
              setFeatures(
                f.map((x) => ({
                  type: "Feature",
                  geometry: x.geometry,
                  properties: x.properties,
                }))
              )
            }
          />
          <div className="spacerSm" />
          <button className="btn primary" onClick={loadLayers} type="button">
            Load last layers
          </button>
        </div>
      </div>

      <div className="panel">
        <MapView features={features} />
      </div>
    </div>
  );
}
