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
  const [error, setError] = useState<string | null>(null);

  const validateCoordinates = (value: string, type: "lng" | "lat"): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (type === "lng") return num >= -180 && num <= 180;
    return num >= -90 && num <= 90;
  };

  const run = async () => {
    setError(null);

    if (!validateCoordinates(lng, "lng") || !validateCoordinates(lat, "lat")) {
      setError(
        "Please enter valid coordinates (Longitude: -180 to 180, Latitude: -90 to 90)"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/query/contains?lng=${lng}&lat=${lat}`);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      onResult(data?.features || []);
    } catch (e) {
      console.error(e);
      setError("Query failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">Spatial Query</h2>
      <p className="text-sm text-gray-600">
        Find polygons containing a specific point
      </p>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="lng"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Longitude
          </label>
          <input
            id="lng"
            className={`w-full px-3 py-2 border ${
              validateCoordinates(lng, "lng")
                ? "border-gray-300"
                : "border-red-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            inputMode="decimal"
            placeholder="e.g. 106.875"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Value between -180 and 180
          </p>
        </div>

        <div>
          <label
            htmlFor="lat"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Latitude
          </label>
          <input
            id="lat"
            className={`w-full px-3 py-2 border ${
              validateCoordinates(lat, "lat")
                ? "border-gray-300"
                : "border-red-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            inputMode="decimal"
            placeholder="e.g. 47.94"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Value between -90 and 90</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <button
        className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading ? "opacity-75 cursor-not-allowed" : ""
        }`}
        onClick={run}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Querying...
          </>
        ) : (
          "Find Containing Polygons"
        )}
      </button>
    </div>
  );
}
