"use client";

import { useEffect, useMemo, useState } from "react";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/reports");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load report.");
      }

      setReport(data.report);
    } catch (err) {
      setError(err.message || "Unable to load report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const chartData = useMemo(() => {
    if (!report?.charts) return [];

    if (period === "7days") {
      return report.charts.sevenDays || [];
    }

    if (period === "1month") {
      return report.charts.oneMonth || [];
    }

    return report.charts.oneYear || [];
  }, [report, period]);

  const maxSales = useMemo(() => {
    if (!chartData.length) return 1;

    const max = Math.max(...chartData.map((item) => Number(item.sales)));

    return max > 0 ? max : 1;
  }, [chartData]);

  const selectedPeriodTotal = useMemo(() => {
    return chartData.reduce(
      (sum, item) => sum + Number(item.sales || 0),
      0
    );
  }, [chartData]);

  function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              SALES & REPORTS
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Sales Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your shop sales and payment performance.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Dashboard
            </a>

            <button
              onClick={loadReport}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && !report ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-500">
              Loading sales report...
            </p>
          </div>
        ) : report ? (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Total Sales
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-900">
                  {formatMoney(report.totalSales)}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  All recorded bills
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Today&apos;s Sales
                </p>

                <h2 className="mt-3 text-3xl font-black text-emerald-600">
                  {formatMoney(report.todaySales)}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Sales generated today
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Total Bills
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-900">
                  {report.totalBills}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Completed transactions
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Items Sold
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-900">
                  {report.totalItemsSold}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Total quantity sold
                </p>
              </div>
            </div>

            {/* SALES GRAPH */}
            <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm md:p-7">

              {/* GRAPH HEADER */}
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                    SALES TREND
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Sales Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {period === "7days"
                      ? "Daily sales for the last 7 days"
                      : period === "1month"
                      ? "Daily sales for the last 30 days"
                      : "Monthly sales for the last 12 months"}
                  </p>
                </div>

                {/* PERIOD BUTTONS */}
                <div className="flex rounded-xl bg-slate-100 p-1">

                  <button
                    onClick={() => setPeriod("7days")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                      period === "7days"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    7 Days
                  </button>

                  <button
                    onClick={() => setPeriod("1month")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                      period === "1month"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    1 Month
                  </button>

                  <button
                    onClick={() => setPeriod("1year")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                      period === "1year"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    1 Year
                  </button>
                </div>
              </div>

              {/* PERIOD TOTAL */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected Period Sales
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {formatMoney(selectedPeriodTotal)}
                </p>
              </div>

              {/* GRAPH */}
              <div className="mt-8">

                <div className="relative h-80">

                  {/* Y AXIS */}
                  <div className="absolute bottom-8 left-0 top-0 flex w-16 flex-col justify-between text-right text-xs text-slate-400">
                    <span>{formatMoney(maxSales)}</span>
                    <span>{formatMoney(maxSales / 2)}</span>
                    <span>₹0</span>
                  </div>

                  {/* GRAPH AREA */}
                  <div className="absolute bottom-8 left-20 right-0 top-0">

                    {/* GRID */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                      <div className="border-t border-dashed border-slate-200" />
                      <div className="border-t border-dashed border-slate-200" />
                      <div className="border-t border-dashed border-slate-200" />
                    </div>

                    {/* BARS */}
                    <div className="absolute inset-0 flex items-end gap-1">

                      {chartData.map((item, index) => {
                        const sales = Number(item.sales || 0);

                        const height =
                          sales > 0
                            ? Math.max((sales / maxSales) * 100, 4)
                            : 0;

                        return (
                          <div
                            key={`${item.date || item.month}-${index}`}
                            className="group relative flex h-full flex-1 items-end"
                          >

                            {/* TOOLTIP */}
                            {sales > 0 && (
                              <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                                {item.label}: {formatMoney(sales)}
                              </div>
                            )}

                            {/* BAR */}
                            <div
                              className="w-full rounded-t-md bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-700"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* X AXIS LABELS */}
                  <div className="absolute bottom-0 left-20 right-0 flex justify-between overflow-hidden">

                    {chartData.length > 0 &&
                      chartData.map((item, index) => {

                        let showLabel = false;

                        if (period === "7days") {
                          showLabel = true;
                        } else if (period === "1month") {
                          showLabel =
                            index === 0 ||
                            index === 6 ||
                            index === 13 ||
                            index === 20 ||
                            index === 27 ||
                            index === 29;
                        } else {
                          showLabel = true;
                        }

                        return (
                          <span
                            key={`${item.date || item.month}-label-${index}`}
                            className={`flex-1 truncate text-center text-[10px] text-slate-400 ${
                              showLabel ? "" : "invisible"
                            }`}
                          >
                            {item.label}
                          </span>
                        );
                      })}

                  </div>
                </div>

                {/* NO SALES */}
                {selectedPeriodTotal === 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm font-semibold text-slate-500">
                    No sales recorded for this period.
                  </div>
                )}
              </div>
            </section>

            {/* PAYMENT SUMMARY */}
            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  PAYMENT SUMMARY
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Payment Methods
                </h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Cash
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatMoney(report.paymentSummary.cash)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    UPI
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatMoney(report.paymentSummary.upi)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Card
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatMoney(report.paymentSummary.card)}
                  </p>
                </div>

              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="mt-6 grid gap-4 md:grid-cols-2">

              <a
                href="/dashboard/billing"
                className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm transition hover:bg-indigo-700"
              >
                <p className="text-lg font-black">
                  🧾 Create New Bill
                </p>

                <p className="mt-1 text-sm text-indigo-100">
                  Create a new customer bill.
                </p>
              </a>

              <a
                href="/dashboard/bills"
                className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm transition hover:bg-slate-800"
              >
                <p className="text-lg font-black">
                  📋 Bill History
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  View all previous transactions.
                </p>
              </a>

            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}