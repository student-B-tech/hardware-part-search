"use client";

import { useState } from "react";

const categories = [
  "Bearings",
  "Fasteners",
  "Electrical",
  "Plumbing",
  "Tools",
  "Automotive",
  "Pipes & Fittings",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(value = search) {
    const query = value.trim();

    if (!query) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
        console.error(data.error);
      }
    } catch (error) {
      console.error("SEARCH ERROR:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePopularSearch(value) {
    setSearch(value);
    handleSearch(value);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl text-white">
              ⚙
            </div>

            <div>
              <div className="text-xl font-extrabold tracking-tight">
                PartNear
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Find Hardware. Near You.
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="text-indigo-600" href="#">
              Home
            </a>
            <a href="#shops">Nearby Shops</a>
            <a href="#categories">Categories</a>
            <a href="#shopkeepers">For Shopkeepers</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold md:block"
            >
              Sign in
            </a>

            <a
              href="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-[1500px] px-6 pb-8 pt-10">

        <div className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 shadow-xl lg:grid-cols-[1.15fr_.85fr]">

          <div className="p-8 md:p-12 lg:p-16">

            <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-indigo-100">
              REAL-TIME LOCAL INVENTORY
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
              Find any hardware part near you.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100 md:text-lg">
              Search nearby shops, check live stock and price, then go directly
              to the shop instead of wasting time visiting multiple stores.
            </p>

            {/* SEARCH */}
            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">

              <div className="flex flex-1 items-center rounded-2xl bg-white px-4 py-2 shadow-lg">
                <span className="mr-3 text-xl">⌕</span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                  placeholder="Search parts: 6204 bearing, 12V adapter..."
                />
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="rounded-2xl bg-indigo-500 px-7 py-4 font-bold text-white shadow-lg hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search Parts"}
              </button>

              <button
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 font-semibold text-white"
              >
                📷 Image
              </button>
            </div>

            {/* POPULAR */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-indigo-100">
              <span>Popular:</span>

              {["6204 Bearing", "12V SMPS", "M8 Nut", "PVC Pipe"].map(
                (x) => (
                  <button
                    key={x}
                    onClick={() => handlePopularSearch(x)}
                    className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20"
                  >
                    {x}
                  </button>
                )
              )}
            </div>
          </div>

          {/* HERO RIGHT */}
          <div className="relative hidden min-h-[360px] overflow-hidden lg:block">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,.45),transparent_35%)]" />

            <div className="absolute left-[18%] top-[22%] h-28 w-28 rounded-full border-8 border-indigo-300/20 bg-indigo-500/20 blur-sm" />

            <div className="absolute right-[16%] top-[18%] h-20 w-20 rounded-full border-8 border-blue-300/20 bg-blue-500/20 blur-sm" />

            <div className="absolute left-[35%] top-[36%] grid h-40 w-40 place-items-center rounded-full border border-white/15 bg-white/10 text-7xl shadow-2xl backdrop-blur">
              ⚙️
            </div>

            <div className="absolute bottom-8 left-8 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur">
              <div className="text-xs text-indigo-200">
                Nearby availability
              </div>

              <div className="mt-1 text-2xl font-bold">
                128+ shops
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {searched && (
        <section className="mx-auto max-w-[1500px] px-6 py-8">

          <div className="mb-6">
            <p className="text-sm font-semibold text-indigo-600">
              SEARCH RESULTS
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Results for "{search}"
            </h2>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <p className="font-semibold text-slate-600">
                Searching products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">🔍</div>

              <h3 className="mt-4 text-xl font-bold">
                No products found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try searching with another part name, SKU, brand or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >

                  <div className="flex gap-4">

                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-3xl">
                      ⚙️
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      {product.brand && (
                        <p className="mt-1 text-xs text-slate-500">
                          Brand: {product.brand}
                        </p>
                      )}

                      {product.category && (
                        <p className="text-xs text-slate-400">
                          {product.category}
                        </p>
                      )}

                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Price
                      </span>

                      <span className="font-bold text-rose-600">
                        ₹{product.price}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Stock
                      </span>

                      <span
                        className={
                          product.stock > 0
                            ? "font-bold text-emerald-600"
                            : "font-bold text-red-600"
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} pcs`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">

                    <h4 className="font-bold">
                      {product.shop.name}
                    </h4>

                    {product.shop.address && (
                      <p className="mt-1 text-xs text-slate-500">
                        {product.shop.address}
                      </p>
                    )}

                    {product.shop.city && (
                      <p className="text-xs text-slate-400">
                        {product.shop.city}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">

                    {product.shop.phone && (
                      <a
                        href={`tel:${product.shop.phone}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold"
                      >
                        Call
                      </a>
                    )}

                    <button
                      className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      View Shop →
                    </button>

                  </div>
                </article>
              ))}

            </div>
          )}
        </section>
      )}

      {/* CATEGORIES */}
      <section
        id="categories"
        className="mx-auto max-w-[1500px] px-6 py-4"
      >

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              BROWSE PARTS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Popular categories
            </h2>
          </div>

          <button className="text-sm font-semibold text-indigo-600">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

          {categories.map((category, i) => (

            <div
              key={category}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
            >

              <div className="mb-4 text-3xl">
                {["⚙️", "🔩", "⚡", "🚰", "🛠️", "🚗", "🔧"][i]}
              </div>

              <div className="text-sm font-bold">
                {category}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                1,200+ parts
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* SHOPS */}
      <section
        id="shops"
        className="mx-auto max-w-[1500px] px-6 py-12"
      >

        <div className="mb-6">

          <p className="text-sm font-semibold text-indigo-600">
            LIVE STOCK
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Nearby shops
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search for a part above to see real shop inventory.
          </p>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">📍</div>

          <h3 className="mt-4 text-xl font-bold">
            Find hardware shops near you
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Search a product to see available shops and stock.
          </p>

        </div>

      </section>

      {/* SHOPKEEPERS */}
      <section
        id="shopkeepers"
        className="mx-auto max-w-[1500px] px-6 pb-16"
      >

        <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 md:p-10">

          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">

            <div>

              <p className="text-sm font-bold text-indigo-600">
                FOR SHOPKEEPERS
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Run your shop smarter.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                Manage inventory, scan bills with AI, track daily sales and
                make your products visible to nearby customers.
              </p>

              <a
                href="/register"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
              >
                Open Shop Dashboard →
              </a>

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl bg-indigo-50 p-5">
                <div className="text-2xl">🧾</div>
                <b className="mt-3 block">AI Bill Scanner</b>
                <span className="mt-1 block text-xs text-slate-500">
                  Bill → stock update
                </span>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="text-2xl">📦</div>
                <b className="mt-3 block">Live Inventory</b>
                <span className="mt-1 block text-xs text-slate-500">
                  Keep stock current
                </span>
              </div>

              <div className="rounded-2xl bg-amber-50 p-5">
                <div className="text-2xl">📈</div>
                <b className="mt-3 block">Sales Analytics</b>
                <span className="mt-1 block text-xs text-slate-500">
                  Daily & monthly records
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-6 py-7 text-sm text-slate-500">
          © 2026 PartNear · Smart local hardware discovery & inventory platform
        </div>

      </footer>

    </main>
  );
}