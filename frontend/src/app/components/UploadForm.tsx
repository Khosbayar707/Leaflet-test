"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function UploadForm({
  onUploaded,
}: {
  onUploaded: (features: any[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBase = "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("KML файл сонгоно уу");
      return;
    }

    if (!file.name.endsWith(".kml")) {
      setError("Зөвхөн .kml өргөтгөлтэй файл оруулна уу");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);

    try {
      const r = await axios.post(`${apiBase}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(r.data?.features || []);
      setSuccess("Файл амжилттай орууллаа");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || "Файл оруулахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">KML Файл Оруулах</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="kmlFile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            KML Файл сонгох
          </label>

          <div className="flex items-center gap-2">
            <input
              id="kmlFile"
              name="file"
              type="file"
              accept=".kml"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />

            <label
              htmlFor="kmlFile"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer truncate"
            >
              {file ? file.name : "Файл сонгох..."}
            </label>

            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="Clear file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Зөвхөн .kml өргөтгөлтэй файлыг оруулна уу
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading || !file ? "opacity-75 cursor-not-allowed" : ""
          }`}
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
              Оруулж байна...
            </>
          ) : (
            "KML Файл Оруулах"
          )}
        </button>
      </form>
    </div>
  );
}
