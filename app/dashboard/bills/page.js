"use client";

import { useEffect, useState } from "react";

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openBill, setOpenBill] = useState(null);

  async function loadBills() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/bills", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load bills.");
      }

      setBills(data.bills || []);
    } catch (error) {
      console.error("BILLS LOAD ERROR:", error);
      setError(error.message || "Unable to load bills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
  }, []);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function toggleBill(id) {
    setOpenBill((current) => (current === id ? null : id));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/dashboard"
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              ← Dashboard
            </a>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Bill History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View all bills created from your shop.
            </p>
          </div>

          <a
            href="/dashboard/billing"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            + Create New Bill
          </a>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading bill history...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">{error}</p>

            <button
              onClick={loadBills}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bills.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">🧾</div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No Bills Yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your first bill from the billing page.
            </p>

            <a
              href="/dashboard/billing"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Create Bill
            </a>
          </div>
        )}

        {/* Bills */}
        {!loading && !error && bills.length > 0 && (
          <div className="space-y-4">
            {bills.map((bill, index) => (
              <div
                key={bill.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
              >
                {/* Bill Header */}
                <button
                  onClick={() => toggleBill(bill.id)}
                  className="w-full p-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                          BILL #{bills.length - index}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(bill.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {bill.paymentMode
                            ? bill.paymentMode.toUpperCase()
                            : "CASH"}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {bill.items.length}{" "}
                          {bill.items.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div>
                        <p className="text-xs text-slate-400">
                          Total Amount
                        </p>

                        <p className="text-2xl font-bold text-slate-900">
                          ₹{Number(bill.total).toFixed(2)}
                        </p>
                      </div>

                      <span className="text-xl text-slate-400">
                        {openBill === bill.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Bill Details */}
                {openBill === bill.id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900">
                        Bill Items
                      </h3>

                      {bill.invoiceNo && (
                        <p className="mt-1 text-xs text-slate-500">
                          Invoice: {bill.invoiceNo}
                        </p>
                      )}
                    </div>

                    <div className="overflow-x-auto rounded-xl bg-white">
                      <table className="w-full min-w-[600px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-left">
                            <th className="px-4 py-3 font-semibold text-slate-500">
                              Product
                            </th>

                            <th className="px-4 py-3 font-semibold text-slate-500">
                              Qty
                            </th>

                            <th className="px-4 py-3 font-semibold text-slate-500">
                              Unit Price
                            </th>

                            <th className="px-4 py-3 text-right font-semibold text-slate-500">
                              Subtotal
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {bill.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="px-4 py-4">
                                <p className="font-semibold text-slate-900">
                                  {item.productName}
                                </p>

                                {item.productId && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    Product ID: {item.productId}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4 text-slate-700">
                                {item.quantity}
                              </td>

                              <td className="px-4 py-4 text-slate-700">
                                ₹{Number(item.unitPrice).toFixed(2)}
                              </td>

                              <td className="px-4 py-4 text-right font-semibold text-slate-900">
                                ₹{Number(item.subtotal).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total */}
                    <div className="mt-5 flex justify-end">
                      <div className="w-full max-w-sm rounded-xl bg-white p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">
                            Total
                          </span>

                          <span className="text-xl font-bold text-slate-900">
                            ₹{Number(bill.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}