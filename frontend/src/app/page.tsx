"use client";

import { useEffect, useState } from "react";
import UploadForm from "./components/UploadForm";
import ContainsForm from "./components/ContainForm";
import MapView from "./components/MapView";

export default function Page() {
  const [features, setFeatures] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        setStatus(d?.ok ? `PostGIS: ${d.postgis}` : "Backend unreachable");
      })
      .catch(() => setStatus("Backend unreachable"));
  }, [apiBase]);

  const loadLayers = async () => {
    const r = await fetch(`${apiBase}/layers`);
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
        <h2 className="heading">KML Upload & Search</h2>
        <div aria-live="polite" className="status">
          {status}
        </div>

        <UploadForm onUploaded={(f) => setFeatures(f)} />

        <div className="spacerSm" />
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
        <button className="btn" onClick={loadLayers} type="button">
          Load last layers
        </button>
      </div>

      <div>
        <MapView features={features} />
      </div>
    </div>
  );
}
