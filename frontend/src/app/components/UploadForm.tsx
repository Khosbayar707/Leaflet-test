"use client";

import { useState } from "react";
import axios from "axios";

export default function UploadForm({
  onUploaded,
}: {
  onUploaded: (features: any[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("KML файл сонгоно уу");
    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);
    try {
      const r = await axios.post(`${apiBase}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(r.data?.features || []);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} aria-label="Upload KML">
      <div className="field">
        <label htmlFor="kmlFile" className="label">
          KML
        </label>
        <input
          id="kmlFile"
          name="file"
          type="file"
          accept=".kml"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="field">
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Uploading…" : "Upload KML"}
        </button>
      </div>
    </form>
  );
}
