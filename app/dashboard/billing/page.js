"use client";

import { useEffect, useState } from "react";

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch("/api/products");

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to load products.");
        return;
      }

      // Normalize stock value
      const normalizedProducts = (data.products || []).map((product) => ({
        ...product,
        stock: Number(
          product.stock ??
            product.inventory?.quantity ??
            0
        ),
      }));

      setProducts(normalizedProducts);
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
      setMessage("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  function addProduct(product) {
    const existing = items.find(
      (item) => item.productId === product.id
    );

    if (existing) {
      if (existing.quantity >= product.stock) {
        setMessage(
          `Only ${product.stock} units available.`
        );
        return;
      }

      setItems(
        items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );

      setMessage("");
      return;
    }

    if (product.stock <= 0) {
      setMessage("Product is out of stock.");
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
      },
    ]);

    setMessage("");
  }

  function updateQuantity(productId, quantity) {
    const item = items.find(
      (item) => item.productId === productId
    );

    if (!item) return;

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return;
    }

    if (newQuantity > item.stock) {
      setMessage(
        `Only ${item.stock} units available.`
      );
      return;
    }

    setItems(
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );

    setMessage("");
  }

  function removeItem(productId) {
    setItems(
      items.filter(
        (item) => item.productId !== productId
      )
    );

    setMessage("");
  }

  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  async function createBill() {
    if (items.length === 0) {
      setMessage(
        "Please add at least one product."
      );
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Unable to create bill."
        );
        return;
      }

      setMessage(
        `Bill created successfully. Total: ₹${Number(
          data.bill.total
        ).toFixed(2)}`
      );

      setItems([]);

      await loadProducts();
    } catch (error) {
      console.error(
        "CREATE BILL ERROR:",
        error
      );

      setMessage(
        "Something went wrong while creating the bill."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            ← Back to Dashboard
          </a>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Create Bill
          </h1>

          <p className="mt-2 text-slate-500">
            Select products, add quantities and create a customer bill.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Products */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Products
                </h2>

                <span className="text-sm text-slate-500">
                  {products.length} products
                </span>
              </div>

              {loading ? (
                <p className="py-10 text-center text-slate-500">
                  Loading products...
                </p>
              ) : products.length === 0 ? (
                <p className="py-10 text-center text-slate-500">
                  No products found.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">

                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {product.name}
                          </h3>

                          {product.brand && (
                            <p className="text-sm text-slate-500">
                              {product.brand}
                            </p>
                          )}

                          <p className="mt-2 font-semibold text-indigo-600">
                            ₹
                            {Number(
                              product.price
                            ).toFixed(2)}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            Stock: {product.stock}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            addProduct(product)
                          }
                          disabled={
                            product.stock <= 0
                          }
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {product.stock > 0
                            ? "Add"
                            : "Out of Stock"}
                        </button>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </section>

          {/* Current Bill */}
          <section>
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900">
                Current Bill
              </h2>

              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-500">
                    No products added yet.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">

                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="border-b border-slate-100 pb-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {item.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            ₹
                            {item.price.toFixed(2)}
                            {" "}each
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Available: {item.stock}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(
                              item.productId
                            )
                          }
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Remove
                        </button>

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              e.target.value
                            )
                          }
                          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />

                        <span className="font-bold text-slate-900">
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </span>

                      </div>

                    </div>
                  ))}

                </div>
              )}

              {/* Payment */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-700">
                  Payment Mode
                </label>

                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="cash">
                    Cash
                  </option>

                  <option value="upi">
                    UPI
                  </option>

                  <option value="card">
                    Card
                  </option>
                </select>
              </div>

              {/* Total */}
              <div className="mt-6 border-t border-slate-200 pt-5">

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-700">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-slate-900">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={createBill}
                  disabled={
                    creating ||
                    items.length === 0
                  }
                  className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {creating
                    ? "Creating Bill..."
                    : "Create Bill"}
                </button>

              </div>

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}