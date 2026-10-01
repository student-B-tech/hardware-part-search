"use client";

import { useState } from "react";

export default function ScannerPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setMessage("");

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
  }

  async function handleScan() {
    if (!file) {
      setMessage("Please select a bill image first.");
      return;
    }

    try {
      setScanning(true);
      setMessage("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scanner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to scan bill.");
      }

      console.log("SCANNER RESULT:", data);

      setResult(data.bill);
      setMessage(data.message || "Bill scanned successfully.");
    } catch (error) {
      console.error("SCAN ERROR:", error);
      setMessage(error.message || "Unable to scan bill.");
    } finally {
      setScanning(false);
    }
  }

  function formatMoney(value) {
    return `₹${Number(value || 0).toFixed(2)}`;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              AI BILL SCANNER
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Scan Your Bill
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Upload a bill image and extract products automatically.
            </p>
          </div>

          <a
            href="/dashboard"
            className="w-fit rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </a>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* LEFT - UPLOAD */}
          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black text-slate-900">
              Upload Bill
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              JPG, PNG or WEBP image
            </p>

            <label className="mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50">

              {preview ? (
                <img
                  src={preview}
                  alt="Bill preview"
                  className="max-h-64 max-w-full rounded-xl object-contain shadow-sm"
                />
              ) : (
                <>
                  <div className="text-5xl">📷</div>

                  <p className="mt-4 font-bold text-slate-800">
                    Click to upload bill
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Select an image from your computer
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* FILE INFO */}
            {file && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Selected file
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            {/* SCAN BUTTON */}
            <button
              onClick={handleScan}
              disabled={!file || scanning}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanning ? "🤖 Scanning Bill..." : "🤖 Scan Bill"}
            </button>

            {/* MESSAGE */}
            {message && (
              <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
                {message}
              </div>
            )}

          </section>

          {/* RIGHT - HOW IT WORKS */}
          <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">

            <p className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-2xl font-black">
              From Bill Image to Inventory
            </h2>

            <div className="mt-8 space-y-5">

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-black">
                  1
                </div>

                <div>
                  <h3 className="font-bold">
                    Upload Bill
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    Upload a clear photo or scanned copy of the customer bill.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-black">
                  2
                </div>

                <div>
                  <h3 className="font-bold">
                    AI Reads Bill
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    AI identifies product names, quantities and prices.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-black">
                  3
                </div>

                <div>
                  <h3 className="font-bold">
                    Review Data
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    Review the extracted information before saving.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-black">
                  4
                </div>

                <div>
                  <h3 className="font-bold">
                    Update Inventory
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    Confirmed items can be connected to your billing and
                    inventory system.
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* AI RESULT */}
        {result && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  AI SCAN RESULT
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Extracted Bill Details
                </h2>
              </div>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                ✓ Scanned
              </span>
            </div>

            {/* ITEMS */}
            <div className="mt-6 overflow-x-auto">
              {result.items?.length > 0 ? (
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-4 font-bold text-slate-900">
                          {item.productName || "Unknown Product"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {item.quantity || 0}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {formatMoney(item.unitPrice)}
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-900">
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-2xl bg-amber-50 p-5 text-sm font-semibold text-amber-700">
                  No product items were detected from this bill.
                </div>
              )}
            </div>

            {/* TOTALS */}
            <div className="mt-6 ml-auto max-w-sm rounded-2xl bg-slate-50 p-5">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-bold text-slate-900">
                  {formatMoney(result.subtotal)}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">
                  Tax
                </span>

                <span className="font-bold text-slate-900">
                  {formatMoney(result.tax)}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-black text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-black text-indigo-600">
                    {formatMoney(result.total)}
                  </span>
                </div>
              </div>

            </div>

            {/* NEXT STEP BUTTON */}
            {result.items?.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
                  onClick={() =>
                    alert(
                      "Product matching and inventory update will be connected in the next step."
                    )
                  }
                >
                  ✓ Review & Continue
                </button>
              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}