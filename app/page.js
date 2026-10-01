"use client";

import { useState } from "react";

const categories = [
  { name: "Bearings", icon: "⚙️", color: "bg-blue-50", query: "Bearings" },
  { name: "Fasteners", icon: "🔩", color: "bg-slate-50", query: "Fasteners" },
  { name: "Electrical", icon: "⚡", color: "bg-amber-50", query: "Electrical" },
  { name: "Plumbing", icon: "🚰", color: "bg-cyan-50", query: "Plumbing" },
  { name: "Tools", icon: "🛠️", color: "bg-violet-50", query: "Tools" },
  { name: "Automotive", icon: "🚗", color: "bg-rose-50", query: "Automotive" },
  {
    name: "Pipes & Fittings",
    icon: "🔧",
    color: "bg-emerald-50",
    query: "Pipes & Fittings",
  },
];

const popularSearches = [
  "6204 Bearing",
  "12V SMPS",
  "M8 Nut",
  "PVC Pipe",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // --------------------------------------------------
  // GET USER LOCATION
  // --------------------------------------------------

  function getMyLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });
        setLocationLoading(false);

        if (search.trim()) {
          setLoading(true);

          try {
            const res = await fetch(
              `/api/nearby?q=${encodeURIComponent(
                search.trim()
              )}&lat=${lat}&lng=${lng}`
            );

            const data = await res.json();

            setProducts(res.ok ? data.products || [] : []);
          } catch (error) {
            console.error(error);
            setProducts([]);
          } finally {
            setLoading(false);
          }
        }
      },
      (error) => {
        console.error(error);

        if (error.code === 1) {
          setLocationError("Location permission was denied.");
        } else if (error.code === 2) {
          setLocationError("Your location could not be determined.");
        } else {
          setLocationError("Location request timed out.");
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  async function handleSearch(value = search) {
    const query = value.trim();

    if (!query) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setLocationError("");

    try {
      const url = location
        ? `/api/nearby?q=${encodeURIComponent(query)}&lat=${
            location.lat
          }&lng=${location.lng}`
        : `/api/search?q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      const data = await res.json();

      setProducts(res.ok ? data.products || [] : []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // POPULAR SEARCH
  // --------------------------------------------------

  function popularSearch(value) {
    setSearch(value);
    handleSearch(value);
  }

  // --------------------------------------------------
  // CATEGORY CLICK
  // --------------------------------------------------

  function handleCategory(category) {
    setSearch(category.query);

    // Scroll to search area
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    handleSearch(category.query);
  }

  // --------------------------------------------------
  // FORMAT PRICE
  // --------------------------------------------------

  function formatPrice(price) {
    const value = Number(price);

    if (Number.isNaN(value)) {
      return price;
    }

    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 lg:px-8">

          {/* LOGO */}

          <a href="/" className="group flex items-center gap-3">

            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/20 transition duration-300 group-hover:scale-105">
              ⚙️
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                Part<span className="text-blue-600">Near</span>
              </div>

              <div className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">
                Find Hardware. Near You.
              </div>
            </div>

          </a>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex">

            <a
              href="#"
              className="rounded-xl bg-blue-50 px-4 py-2 text-blue-600"
            >
              Home
            </a>

            <a
              href="#shops"
              className="transition hover:text-blue-600"
            >
              Nearby Shops
            </a>

            <a
              href="#categories"
              className="transition hover:text-blue-600"
            >
              Categories
            </a>

            <a
              href="#shopkeepers"
              className="transition hover:text-blue-600"
            >
              For Shopkeepers
            </a>

          </div>

          {/* NAV ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={getMyLocation}
              disabled={locationLoading}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 md:flex"
            >
              <span className="text-blue-600">📍</span>

              <span>
                {locationLoading
                  ? "Getting location..."
                  : location
                  ? "Location Ready"
                  : "Use Location"}
              </span>
            </button>

            <a
              href="/login"
              className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:border-blue-300 hover:bg-blue-50 sm:block"
            >
              Sign in
            </a>

            <a
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started
            </a>

          </div>

        </div>
      </nav>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pt-8">

        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#e8efff] shadow-[0_25px_70px_rgba(37,99,235,0.12)]">

          <div className="grid lg:grid-cols-[1.08fr_.92fr]">

            {/* HERO LEFT */}

            <div className="p-7 sm:p-10 lg:p-14 xl:p-16">

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                REAL-TIME LOCAL INVENTORY
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Find Hardware Parts
                <span className="block text-blue-600">
                  Near You
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Search hardware parts, compare prices, check live stock,
                find nearby shops and get directions instantly.
              </p>

              {/* SEARCH BOX */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <div className="flex min-h-[58px] flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-lg shadow-slate-200/50 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">

                  <span className="mr-3 text-2xl text-slate-400">
                    🔍
                  </span>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearch()
                    }
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 sm:text-base"
                    placeholder="Search bearing, bolt, pipe..."
                  />

                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setProducts([]);
                        setSearched(false);
                      }}
                      className="rounded-full px-2 text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  )}

                </div>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="min-h-[58px] rounded-2xl bg-blue-600 px-7 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Searching..."
                    : location
                    ? "Find Nearby Parts"
                    : "Search Parts"}
                </button>

              </div>

              {/* LOCATION */}

              <div className="mt-3 flex flex-wrap gap-2">

                <button
                  onClick={getMyLocation}
                  disabled={locationLoading}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    location
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {locationLoading
                    ? "📍 Getting Location..."
                    : location
                    ? "✓ Location Ready"
                    : "📍 Use My Location"}
                </button>

                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                  onClick={() => {
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Browse Categories →
                </button>

              </div>

              {locationError && (
                <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">
                  {locationError}
                </p>
              )}

              {/* POPULAR SEARCHES */}

              <div className="mt-7 flex flex-wrap items-center gap-2">

                <span className="mr-1 text-xs font-bold text-slate-500">
                  Popular:
                </span>

                {popularSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => popularSearch(item)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>

            {/* HERO RIGHT */}

            <div className="relative hidden min-h-[430px] overflow-hidden lg:block">

              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-500/20" />

              {/* Decorative circles */}

              <div className="absolute right-12 top-12 h-32 w-32 rounded-full border border-blue-200/70" />
              <div className="absolute bottom-16 left-10 h-20 w-20 rounded-full border border-blue-200/60" />

              {/* Hardware visual */}

              <div className="absolute left-[22%] top-[17%] grid h-52 w-52 place-items-center rounded-full border border-white bg-white/70 text-8xl shadow-2xl backdrop-blur">
                ⚙️
              </div>

              <div className="absolute right-[12%] top-[15%] grid h-24 w-24 place-items-center rounded-3xl bg-white text-5xl shadow-xl">
                🔩
              </div>

              <div className="absolute bottom-[23%] right-[17%] grid h-28 w-28 place-items-center rounded-3xl bg-white text-6xl shadow-xl">
                🛠️
              </div>

              <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-xl backdrop-blur">

                <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">

                  <div>
                    <div className="text-xl font-black text-blue-600">
                      500+
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Shops
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-black text-orange-500">
                      10K+
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Parts
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-black text-violet-600">
                      1,200+
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Customers
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          SEARCH RESULTS
      ================================================== */}

      {searched && (
        <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                {location
                  ? "Nearby Search Results"
                  : "Search Results"}
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {location
                  ? `Parts near you for "${search}"`
                  : `Results for "${search}"`}
              </h2>

              {location && (
                <p className="mt-2 text-sm text-slate-500">
                  Results are sorted using your location.
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setSearched(false);
                setProducts([]);
              }}
              className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              Clear Results
            </button>

          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-200" />
                  <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                  <div className="mt-7 h-20 rounded-2xl bg-slate-100" />
                </div>
              ))}

            </div>
          ) : products.length === 0 ? (

            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-4xl">
                🔍
              </div>

              <h3 className="mt-5 text-xl font-black">
                No products found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try another part name, SKU, brand or category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSearched(false);
                }}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Search Again
              </button>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {products.map((product) => (

                <article
                  key={`${product.id}-${product.shop.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
                >

                  {/* PRODUCT HEADER */}

                  <div className="flex gap-4">

                    <a
                      href={`/product/${product.id}`}
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-3xl transition group-hover:scale-105"
                    >
                      ⚙️
                    </a>

                    <div className="min-w-0 flex-1">

                      <a
                        href={`/product/${product.id}`}
                        className="line-clamp-2 font-black transition hover:text-blue-600"
                      >
                        {product.name}
                      </a>

                      {product.brand && (
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Brand: {product.brand}
                        </p>
                      )}

                      {product.category && (
                        <p className="mt-1 text-xs text-slate-400">
                          {product.category}
                        </p>
                      )}

                      {product.distance != null && (
                        <p className="mt-2 text-xs font-bold text-blue-600">
                          📍 {product.distance} km away
                        </p>
                      )}

                    </div>

                  </div>

                  {/* PRICE / STOCK */}

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Price
                      </span>

                      <span className="text-lg font-black text-blue-600">
                        ₹{formatPrice(product.price)}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Availability
                      </span>

                      <span
                        className={
                          product.stock > 0
                            ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600"
                            : "rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600"
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} pcs`
                          : "Out of stock"}
                      </span>

                    </div>

                  </div>

                  {/* SHOP */}

                  <a
                    href={`/shop/${product.shop.id}`}
                    className="mt-4 block rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-blue-50"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="min-w-0">

                        <h4 className="truncate font-black text-slate-900">
                          {product.shop.name}
                        </h4>

                        {product.shop.address && (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {product.shop.address}
                          </p>
                        )}

                        {product.shop.city && (
                          <p className="text-xs text-slate-400">
                            {product.shop.city}
                          </p>
                        )}

                      </div>

                      <span className="shrink-0 text-xs font-black text-blue-600">
                        View →
                      </span>

                    </div>

                  </a>

                  {/* ACTIONS */}

                  <div className="mt-4 flex gap-2">

                    {product.shop.phone && (
                      <a
                        href={`tel:${product.shop.phone}`}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-xs font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        📞 Call
                      </a>
                    )}

                    {product.shop.latitude != null &&
                      product.shop.longitude != null && (

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${product.shop.latitude},${product.shop.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          📍 Directions
                        </a>

                      )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>
      )}

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <section
        id="categories"
        className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8"
      >

        <div className="mb-7 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Browse Parts
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Popular Categories
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Explore hardware parts by category.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">

          {categories.map((category) => (

            <button
              key={category.name}
              onClick={() => handleCategory(category)}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 active:scale-[0.98]"
            >

              {/* TOP ICON */}

              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl ${category.color} text-2xl transition duration-300 group-hover:scale-110`}
              >
                {category.icon}
              </div>

              {/* NAME */}

              <div className="mt-5 text-sm font-black text-slate-900">
                {category.name}
              </div>

              {/* PART COUNT */}

              <div className="mt-1 text-xs font-medium text-slate-400">
                1,200+ parts
              </div>

              {/* ARROW */}

              <div className="absolute bottom-5 right-5 grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-blue-600 group-hover:text-white">
                →
              </div>

            </button>

          ))}

        </div>

      </section>

      {/* ==================================================
          NEARBY SHOPS
      ================================================== */}

      <section
        id="shops"
        className="border-y border-slate-200 bg-white"
      >

        <div className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8">

          <div className="mb-8">

            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Live Stock
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Nearby Hardware Shops
            </h2>

            <p className="mt-2 max-w-xl text-sm text-slate-500">
              {location
                ? "Your location is active. Search a part above to see available nearby shops."
                : "Enable your location and search for a hardware part to find nearby shops."}
            </p>

          </div>

          <div className="grid gap-5 lg:grid-cols-3">

            {/* SHOP CARD 1 */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">

              <div className="flex items-start justify-between">

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-2xl">
                  🏪
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
                  ● Nearby
                </span>

              </div>

              <h3 className="mt-5 font-black">
                Search Nearby Shops
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search a part with your location enabled and PartNear will
                show available shops sorted by distance.
              </p>

              <button
                onClick={getMyLocation}
                disabled={locationLoading}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "📍 Enable Location"}
              </button>

            </div>

            {/* SHOP CARD 2 */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-2xl">
                📦
              </div>

              <h3 className="mt-5 font-black">
                Check Live Stock
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                See current available quantity and price before visiting
                the hardware shop.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("categories")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Browse Parts →
              </button>

            </div>

            {/* SHOP CARD 3 */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl">
                🗺️
              </div>

              <h3 className="mt-5 font-black">
                Get Directions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open Google Maps directly from a product result and navigate
                to the selected shop.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("categories")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Find a Part →
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          MAP
      ================================================== */}

      {location && (
        <section className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="p-6 sm:p-8">

              <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                Live Location
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Nearby Hardware Map
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your current location and available hardware shops.
              </p>

            </div>

            <div className="overflow-hidden border-t">

              <iframe
                title="Nearby Hardware Shops Map"
                width="100%"
                height="450"
                loading="lazy"
                allowFullScreen
                src={
                  products.length > 0 &&
                  products[0].shop.latitude != null &&
                  products[0].shop.longitude != null
                    ? `https://www.google.com/maps?q=${products[0].shop.latitude},${products[0].shop.longitude}&z=15&output=embed`
                    : `https://www.google.com/maps?q=${location.lat},${location.lng}&z=14&output=embed`
                }
                className="border-0"
              />

            </div>

            <div className="border-t bg-slate-50 px-6 py-4 text-xs font-medium text-slate-500">
              📍 Location: {location.lat.toFixed(6)},{" "}
              {location.lng.toFixed(6)}
            </div>

          </div>

        </section>
      )}

      {/* ==================================================
          SHOPKEEPER SECTION
      ================================================== */}

      <section
        id="shopkeepers"
        className="mx-auto max-w-[1500px] px-4 pb-16 pt-4 sm:px-6 lg:px-8"
      >

        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 text-white shadow-2xl sm:p-10 lg:p-14">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                For Shopkeepers
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Run your hardware shop smarter.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                Manage inventory, create bills, scan bills with OCR,
                track sales and make your products visible to nearby
                customers.
              </p>

              <a
                href="/register"
                className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Open Shop Dashboard →
              </a>

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10">
                <div className="text-2xl">🧾</div>
                <b className="mt-4 block">Billing</b>
                <span className="mt-1 block text-xs text-slate-400">
                  Create and manage bills
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10">
                <div className="text-2xl">📦</div>
                <b className="mt-4 block">Inventory</b>
                <span className="mt-1 block text-xs text-slate-400">
                  Keep stock updated
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10">
                <div className="text-2xl">📈</div>
                <b className="mt-4 block">Reports</b>
                <span className="mt-1 block text-xs text-slate-400">
                  Track sales analytics
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div>
            © 2026 <b className="text-slate-800">PartNear</b>
          </div>

          <div>
            Smart local hardware discovery & inventory platform
          </div>

        </div>

      </footer>

    </main>
  );
}