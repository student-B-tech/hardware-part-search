"use client";

import { useEffect, useState } from "react";

export default function ShopPage({ params }) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShop() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/shop/${id}`);
        const data = await response.json();

        if (response.ok) {
          setShop(data.shop);
        }
      } catch (error) {
        console.error("SHOP ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [params]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          Loading shop...
        </p>
      </main>
    );
  }

  // Shop not found
  if (!shop) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Shop not found
          </h1>

          <a
            href="/"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            ← Back to PartNear
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <a
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            PartNear
          </a>

          <a
            href="/"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Back to Home
          </a>

        </div>
      </header>

      {/* ================= SHOP DETAILS ================= */}
      <section className="max-w-6xl mx-auto px-6 py-8">

        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* Shop Information */}
            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                {shop.name}
              </h1>

              <p className="mt-2 text-gray-600">
                📍 {shop.address}, {shop.city}
              </p>

              {shop.phone && (
                <p className="mt-1 text-gray-600">
                  📞 {shop.phone}
                </p>
              )}

            </div>

            {/* Shop Actions */}
            <div className="flex flex-wrap gap-3">

              {/* Call */}
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  📞 Call
                </a>
              )}

              {/* Directions */}
              {shop.latitude && shop.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🗺️ Directions
                </a>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-10">

        {/* Product Heading */}
        <div className="mb-6">

          <h2 className="text-2xl font-bold text-gray-900">
            Products Available
          </h2>

          <p className="text-gray-500 mt-1">
            {shop.products?.length || 0} products available at this shop
          </p>

        </div>

        {/* ================= PRODUCT LIST ================= */}

        {shop.products && shop.products.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {shop.products.map((product) => (

              <a
                key={product.id}
                href={`/product/${product.id}`}
                className="block bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
              >

                {/* Product Name */}
                <h3 className="text-xl font-semibold text-gray-900">
                  {product.name}
                </h3>

                {/* Product Information */}
                <div className="mt-3 space-y-1 text-sm text-gray-600">

                  <p>
                    <span className="font-medium">
                      SKU:
                    </span>{" "}
                    {product.sku}
                  </p>

                  <p>
                    <span className="font-medium">
                      Brand:
                    </span>{" "}
                    {product.brand || "N/A"}
                  </p>

                  <p>
                    <span className="font-medium">
                      Category:
                    </span>{" "}
                    {product.category || "N/A"}
                  </p>

                </div>

                {/* Price + Stock */}
                <div className="mt-5 flex items-center justify-between gap-3">

                  {/* Price */}
                  <div>

                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                      ₹{product.price}
                    </p>

                  </div>

                  {/* Stock */}
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0
                      ? `In Stock: ${product.stock}`
                      : "Out of Stock"}
                  </div>

                </div>

                {/* View Product */}
                <div className="mt-5 text-blue-600 text-sm font-medium">
                  View Product →
                </div>

              </a>

            ))}

          </div>

        ) : (

          /* No Products */
          <div className="bg-white border rounded-2xl p-10 text-center">

            <p className="text-gray-500">
              No products available at this shop.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}