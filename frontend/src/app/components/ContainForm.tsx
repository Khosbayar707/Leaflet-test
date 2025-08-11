"use client";

import { useState } from "react";

export default function ContainsForm({
  onResult,
}: {
  onResult: (features: any[]) => void;
}) {
  const [lng, setLng] = useState("106.875");
  const [lat, setLat] = useState("47.94");
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/query/contains?lng=${lng}&lat=${lat}`
      );
      const data = await res.json();
      onResult(data?.features || []);
    } catch (e) {
      console.error(e);
      alert("Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <fieldset>
      <legend>Point within polygon</legend>
      <div className="field">
        <label htmlFor="lng" className="label">
          Lng
        </label>
        <input
          id="lng"
          className="input"
          inputMode="decimal"
          placeholder="106.875"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="lat" className="label">
          Lat
        </label>
        <input
          id="lat"
          className="input"
          inputMode="decimal"
          placeholder="47.94"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </div>
      <button className="btn" onClick={run} disabled={loading} type="button">
        {loading ? "Checking…" : "Point within polygon"}
      </button>
    </fieldset>
  );
}
