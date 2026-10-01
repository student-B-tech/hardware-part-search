"use client";

import { useEffect, useState } from "react";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/product/${id}`);
        const data = await response.json();

        if (response.ok) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("PRODUCT ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Product not found
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

  const shop = product.shop;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            PartNear
          </a>

          <a
            href={`/shop/${shop.id}`}
            className="text-gray-600 hover:text-blue-600"
          >
            ← Back to Shop
          </a>
        </div>
      </header>

      {/* Product Details */}
      <section className="max-w-6xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Product Card */}
          <div className="bg-white border rounded-2xl shadow-sm p-8">

            <p className="text-sm text-blue-600 font-medium">
              {product.category || "Hardware Part"}
            </p>

            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>

            <div className="mt-6 space-y-3 text-gray-600">

              <p>
                <span className="font-semibold text-gray-800">
                  SKU:
                </span>{" "}
                {product.sku}
              </p>

              <p>
                <span className="font-semibold text-gray-800">
                  Brand:
                </span>{" "}
                {product.brand || "N/A"}
              </p>

              <p>
                <span className="font-semibold text-gray-800">
                  Category:
                </span>{" "}
                {product.category || "N/A"}
              </p>

            </div>

            <div className="mt-8 flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Price
                </p>

                <p className="text-3xl font-bold text-blue-600">
                  ₹{product.price}
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-full font-medium ${
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

          </div>

          {/* Shop Card */}
          <div className="bg-white border rounded-2xl shadow-sm p-8">

            <p className="text-sm text-gray-500">
              Available at
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {shop.name}
            </h2>

            <div className="mt-5 space-y-3 text-gray-600">

              <p>
                📍 {shop.address}, {shop.city}
              </p>

              {shop.phone && (
                <p>
                  📞 {shop.phone}
                </p>
              )}

            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-wrap gap-3">

              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📞 Call Shop
                </a>
              )}

              {shop.latitude && shop.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  🗺️ Directions
                </a>
              )}

            </div>

            <a
              href={`/shop/${shop.id}`}
              className="inline-block mt-5 text-blue-600 hover:underline"
            >
              View all products from this shop →
            </a>

          </div>

        </div>

      </section>

    </main>
  );
}