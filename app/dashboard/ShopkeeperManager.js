"use client";

import { useMemo, useState } from "react";

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  brand: "",
  price: "",
  quantity: "",
};

export default function ShopkeeperManager({
  initialShop,
  initialProducts,
}) {
  const [shop, setShop] = useState(
    initialShop || {
      name: "",
      address: "",
      city: "",
      phone: "",
      latitude: null,
      longitude: null,
    }
  );

  const [products, setProducts] = useState(initialProducts || []);

  const [shopForm, setShopForm] = useState(
    initialShop || {
      name: "",
      address: "",
      city: "",
      phone: "",
      latitude: null,
      longitude: null,
    }
  );

  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const flash = (msg) => {
    setMessage(msg);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fail = (msg) => {
    setError(msg);
    setMessage("");
  };

  // =========================
  // LOCATION
  // =========================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      fail("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setShopForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        setLocationLoading(false);
        flash("Location detected. Now save the shop profile.");
      },
      (err) => {
        setLocationLoading(false);

        if (err.code === 1) {
          fail(
            "Location permission denied. Please allow location access in your browser."
          );
        } else if (err.code === 2) {
          fail("Unable to detect your location.");
        } else if (err.code === 3) {
          fail("Location request timed out. Please try again.");
        } else {
          fail("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =========================
  // SAVE SHOP
  // =========================

  const saveShop = async (e) => {
    e.preventDefault();

    setBusy(true);

    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to save shop");
      }

      setShop(data.shop);
      setShopForm(data.shop);

      flash("Shop profile saved successfully.");
    } catch (e) {
      fail(e.message);
    } finally {
      setBusy(false);
    }
  };

  // =========================
  // SAVE PRODUCT
  // =========================

  const saveProduct = async (e) => {
    e.preventDefault();

    if (!shop?.id) {
      fail("Please create your shop profile first.");
      return;
    }

    setBusy(true);

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };

      const res = await fetch("/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                ...payload,
                id: editingId,
              }
            : payload
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to save product");
      }

      setProducts((prev) =>
        editingId
          ? prev.map((p) =>
              p.id === data.product.id ? data.product : p
            )
          : [data.product, ...prev]
      );

      const wasEditing = editingId;

      setProductForm(emptyProduct);
      setEditingId(null);

      flash(wasEditing ? "Product updated." : "Product added.");
    } catch (e) {
      fail(e.message);
    } finally {
      setBusy(false);
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const editProduct = (p) => {
    setEditingId(p.id);

    setProductForm({
      name: p.name || "",
      sku: p.sku || "",
      category: p.category || "",
      brand: p.brand || "",
      price: String(p.price ?? ""),
      quantity: String(p.inventory?.quantity ?? 0),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) {
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return fail(data.error || "Unable to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));

      flash("Product deleted.");
    } catch (e) {
      fail("Unable to delete product.");
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingId(null);
    setProductForm(emptyProduct);
  };

  // =========================
  // INVENTORY STATS
  // =========================

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.inventory?.quantity || 0),
    0
  );

  const lowStock = products.filter((p) => {
    const q = Number(p.inventory?.quantity || 0);
    return q > 0 && q <= 5;
  }).length;

  const outOfStock = products.filter((p) => {
    return Number(p.inventory?.quantity || 0) === 0;
  }).length;

  const availableStock = products.length - outOfStock;

  const hasLocation =
    shopForm?.latitude !== null &&
    shopForm?.latitude !== undefined &&
    shopForm?.longitude !== null &&
    shopForm?.longitude !== undefined;

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((p) => {
      const quantity = Number(p.inventory?.quantity || 0);

      const matchesSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term);

      let matchesFilter = true;

      if (filter === "available") {
        matchesFilter = quantity > 5;
      }

      if (filter === "low") {
        matchesFilter = quantity > 0 && quantity <= 5;
      }

      if (filter === "out") {
        matchesFilter = quantity === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="manager">
      <style>{`
        .manager {
          width: 100%;
          color: #172033;
        }

        .manager * {
          box-sizing: border-box;
        }

        .manager button,
        .manager input {
          font: inherit;
        }

        /* =========================
           TOASTS
        ========================= */

        .toast {
          position: fixed;
          top: 22px;
          right: 22px;
          z-index: 1000;
          min-width: 280px;
          max-width: 420px;
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.18);
          animation: slideIn .25s ease;
        }

        .toast.success {
          background: #ecfdf3;
          color: #087443;
          border: 1px solid #b7ebca;
        }

        .toast.error {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================
           TOP HEADER
        ========================= */

        .manager-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .manager-kicker {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .12em;
          color: #64748b;
        }

        .manager-title {
          margin: 0;
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.1;
          letter-spacing: -.04em;
          color: #111827;
        }

        .manager-subtitle {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .shop-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid #dbe4ef;
          border-radius: 999px;
          background: #fff;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          box-shadow: 0 5px 18px rgba(15,23,42,.04);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        /* =========================
           STAT CARDS
        ========================= */

        .inventory-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .mini-stat {
          background: #fff;
          border: 1px solid #e5eaf1;
          border-radius: 18px;
          padding: 18px;
          min-height: 105px;
          box-shadow: 0 8px 25px rgba(15,23,42,.045);
        }

        .mini-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .mini-stat-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f1f5f9;
          font-size: 18px;
        }

        .mini-stat span {
          display: block;
          margin-top: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
        }

        .mini-stat b {
          display: block;
          margin-top: 3px;
          font-size: 25px;
          letter-spacing: -.03em;
          color: #111827;
        }

        .mini-stat.warning .mini-stat-icon {
          background: #fff7ed;
        }

        .mini-stat.danger .mini-stat-icon {
          background: #fff1f2;
        }

        /* =========================
           MAIN GRID
        ========================= */

        .manager-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .manage-card {
          background: #fff;
          border: 1px solid #e5eaf1;
          border-radius: 20px;
          box-shadow: 0 8px 28px rgba(15,23,42,.045);
          overflow: hidden;
        }

        .card-inner {
          padding: 22px;
        }

        .section-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 5px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
          color: #94a3b8;
        }

        .section-head h2 {
          margin: 0;
          font-size: 19px;
          letter-spacing: -.025em;
          color: #172033;
        }

        .soft-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding: 7px 10px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .manage-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .manage-form label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }

        .manage-form input {
          width: 100%;
          height: 45px;
          padding: 0 13px;
          border: 1px solid #dbe3ed;
          border-radius: 11px;
          outline: none;
          background: #fff;
          color: #172033;
          font-size: 13px;
          transition: .2s ease;
        }

        .manage-form input:focus {
          border-color: #94a3b8;
          box-shadow: 0 0 0 4px rgba(148,163,184,.12);
        }

        .two-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .button-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn,
        .edit-btn,
        .danger-btn {
          border: 0;
          cursor: pointer;
          border-radius: 11px;
          min-height: 42px;
          padding: 0 15px;
          font-size: 13px;
          font-weight: 800;
          transition: .2s ease;
        }

        .primary-btn {
          background: #111827;
          color: #fff;
          flex: 1;
        }

        .primary-btn:hover {
          background: #263244;
          transform: translateY(-1px);
        }

        .secondary-btn {
          background: #f8fafc;
          border: 1px solid #dbe3ed;
          color: #334155;
        }

        .secondary-btn:hover {
          background: #f1f5f9;
        }

        .primary-btn:disabled,
        .secondary-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .notice {
          padding: 12px 14px;
          border-radius: 12px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
        }

        /* =========================
           LOCATION
        ========================= */

        .location-box {
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 15px;
          background: #f8fafc;
        }

        .location-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .location-title {
          font-size: 13px;
          font-weight: 850;
          color: #172033;
        }

        .location-help {
          margin-top: 4px;
          font-size: 11px;
          color: #64748b;
        }

        .location-coordinates {
          margin-top: 9px;
          padding: 9px 10px;
          border-radius: 9px;
          background: #fff;
          border: 1px solid #e5e7eb;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        /* =========================
           PRODUCT TABLE
        ========================= */

        .product-table-card {
          margin-bottom: 30px;
        }

        .inventory-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .inventory-search {
          position: relative;
          flex: 1;
          min-width: 240px;
        }

        .inventory-search input {
          width: 100%;
          height: 43px;
          padding: 0 14px 0 40px;
          border: 1px solid #dbe3ed;
          border-radius: 11px;
          outline: none;
          font-size: 13px;
        }

        .inventory-search input:focus {
          border-color: #94a3b8;
          box-shadow: 0 0 0 4px rgba(148,163,184,.12);
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
        }

        .filter-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filter-btn {
          border: 1px solid #dbe3ed;
          background: #fff;
          color: #64748b;
          border-radius: 9px;
          padding: 9px 12px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .filter-btn.active {
          background: #111827;
          color: #fff;
          border-color: #111827;
        }

        .product-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .product-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        .product-table th {
          padding: 12px 14px;
          text-align: left;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
          border-bottom: 1px solid #e5eaf1;
        }

        .product-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #edf1f5;
          font-size: 12px;
          color: #475569;
          vertical-align: middle;
        }

        .product-table tbody tr {
          transition: .15s ease;
        }

        .product-table tbody tr:hover {
          background: #fafcff;
        }

        .product-name {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
        }

        .product-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f1f5f9;
          font-size: 17px;
        }

        .product-name-text b {
          display: block;
          color: #172033;
          font-size: 13px;
        }

        .product-name-text small {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        .stock-badge {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 850;
        }

        .stock-badge.ok {
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
        }

        .stock-badge.low {
          color: #b45309;
          background: #fffbeb;
          border: 1px solid #fde68a;
        }

        .stock-badge.out {
          color: #be123c;
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }

        .table-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .edit-btn,
        .danger-btn {
          min-height: 34px;
          padding: 0 10px;
          font-size: 11px;
        }

        .edit-btn {
          background: #f1f5f9;
          color: #334155;
        }

        .edit-btn:hover {
          background: #e2e8f0;
        }

        .danger-btn {
          background: #fff1f2;
          color: #be123c;
        }

        .danger-btn:hover {
          background: #ffe4e6;
        }

        .empty-state {
          padding: 55px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 18px;
          background: #f8fafc;
          font-size: 28px;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 17px;
          color: #172033;
        }

        .empty-state p {
          max-width: 420px;
          margin: 8px auto 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .no-results {
          padding: 35px 20px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1050px) {
          .inventory-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .manager-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .manager-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .inventory-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .mini-stat {
            padding: 14px;
            min-height: 95px;
          }

          .mini-stat b {
            font-size: 21px;
          }

          .card-inner {
            padding: 17px;
          }

          .section-head {
            flex-direction: column;
          }

          .two-fields {
            grid-template-columns: 1fr;
          }

          .inventory-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .inventory-search {
            min-width: 0;
          }

          .filter-buttons {
            width: 100%;
          }

          .filter-btn {
            flex: 1;
          }

          .toast {
            left: 15px;
            right: 15px;
            top: 15px;
            min-width: 0;
          }
        }

        @media (max-width: 430px) {
          .inventory-stats {
            grid-template-columns: 1fr 1fr;
          }

          .button-row {
            flex-direction: column;
          }

          .button-row button {
            width: 100%;
          }

          .location-top {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <div className="manager-header">
        <div>
          <p className="manager-kicker">SHOP MANAGEMENT</p>

          <h1 className="manager-title">
            {shop?.name || "Manage your shop"}
          </h1>

          <p className="manager-subtitle">
            Manage your hardware products, pricing and live inventory.
          </p>
        </div>

        <div className="shop-live">
          <span className="live-dot" />
          {shop?.status === "approved"
            ? "Shop is live"
            : shop?.status || "Setup pending"}
        </div>
      </div>

      {/* =========================
          TOASTS
      ========================= */}

      {message && (
        <div className="toast success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="toast error">
          ! {error}
        </div>
      )}

      {/* =========================
          INVENTORY STATS
      ========================= */}

      <div className="inventory-stats">
        <div className="mini-stat">
          <div className="mini-stat-top">
            <div className="mini-stat-icon">📦</div>
          </div>

          <span>Total Products</span>
          <b>{products.length}</b>
        </div>

        <div className="mini-stat">
          <div className="mini-stat-top">
            <div className="mini-stat-icon">📊</div>
          </div>

          <span>Total Stock</span>
          <b>{totalStock}</b>
        </div>

        <div className="mini-stat warning">
          <div className="mini-stat-top">
            <div className="mini-stat-icon">⚠️</div>
          </div>

          <span>Low Stock</span>
          <b>{lowStock}</b>
        </div>

        <div className="mini-stat danger">
          <div className="mini-stat-top">
            <div className="mini-stat-icon">🚫</div>
          </div>

          <span>Out of Stock</span>
          <b>{outOfStock}</b>
        </div>
      </div>

      {/* =========================
          MAIN GRID
      ========================= */}

      <div className="manager-grid">

        {/* =========================
            SHOP PROFILE
        ========================= */}

        <section className="manage-card">
          <div className="card-inner">

            <div className="section-head">
              <div>
                <p className="eyebrow">SHOP PROFILE</p>

                <h2>
                  {shop?.name
                    ? "Your shop details"
                    : "Create your shop"}
                </h2>
              </div>

              <span className="soft-badge">
                ● {shop?.status || "pending"}
              </span>
            </div>

            <form className="manage-form" onSubmit={saveShop}>

              <label>
                Shop name

                <input
                  value={shopForm.name || ""}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Sharma Hardware"
                  required
                />
              </label>

              <label>
                Phone

                <input
                  value={shopForm.phone || ""}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 98xxxxxx"
                />
              </label>

              <label>
                Address

                <input
                  value={shopForm.address || ""}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="Shop address"
                />
              </label>

              <label>
                City

                <input
                  value={shopForm.city || ""}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      city: e.target.value,
                    })
                  }
                  placeholder="Kanpur"
                />
              </label>

              {/* LOCATION */}

              <div className="location-box">
                <div className="location-top">

                  <div>
                    <div className="location-title">
                      📍 Shop Location
                    </div>

                    <div className="location-help">
                      Used to calculate distance from customers.
                    </div>
                  </div>

                  {hasLocation && (
                    <span className="stock-badge ok">
                      Location set
                    </span>
                  )}

                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  style={{ width: "100%" }}
                >
                  {locationLoading
                    ? "📍 Detecting location..."
                    : "📍 Use my current location"}
                </button>

                {hasLocation && (
                  <div className="location-coordinates">
                    Latitude:{" "}
                    {Number(shopForm.latitude).toFixed(6)}
                    <br />
                    Longitude:{" "}
                    {Number(shopForm.longitude).toFixed(6)}
                  </div>
                )}
              </div>

              <button
                className="primary-btn"
                disabled={busy}
              >
                {busy
                  ? "Saving..."
                  : "Save shop profile"}
              </button>

            </form>
          </div>
        </section>

        {/* =========================
            ADD PRODUCT
        ========================= */}

        <section className="manage-card">
          <div className="card-inner">

            <div className="section-head">
              <div>
                <p className="eyebrow">
                  {editingId
                    ? "EDIT PRODUCT"
                    : "ADD PRODUCT"}
                </p>

                <h2>
                  {editingId
                    ? "Update inventory item"
                    : "Add hardware part"}
                </h2>
              </div>

              <span className="soft-badge">
                LIVE STOCK
              </span>
            </div>

            {!shop?.id && (
              <div className="notice">
                Create your shop profile first.
              </div>
            )}

            <form
              className="manage-form"
              onSubmit={saveProduct}
            >

              <label>
                Product name

                <input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="6204 Bearing"
                  required
                />
              </label>

              <div className="two-fields">

                <label>
                  SKU / Part No.

                  <input
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        sku: e.target.value,
                      })
                    }
                    placeholder="6204-2RS"
                  />
                </label>

                <label>
                  Brand

                  <input
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        brand: e.target.value,
                      })
                    }
                    placeholder="SKF"
                  />
                </label>

              </div>

              <div className="two-fields">

                <label>
                  Category

                  <input
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="Bearings"
                  />
                </label>

                <label>
                  Price (₹)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: e.target.value,
                      })
                    }
                    placeholder="150"
                    required
                  />
                </label>

              </div>

              <label>
                Stock quantity

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.quantity}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="20"
                  required
                />
              </label>

              <div className="button-row">

                <button
                  className="primary-btn"
                  disabled={busy || !shop?.id}
                >
                  {busy
                    ? "Saving..."
                    : editingId
                    ? "Update product"
                    : "Add to inventory"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>
          </div>
        </section>

      </div>

      {/* =========================
          INVENTORY
      ========================= */}

      <section className="manage-card product-table-card">
        <div className="card-inner">

          <div className="section-head">
            <div>
              <p className="eyebrow">INVENTORY</p>

              <h2>Your hardware parts</h2>
            </div>

            <span className="soft-badge">
              {products.length} items
            </span>
          </div>

          {/* SEARCH + FILTER */}

          <div className="inventory-toolbar">

            <div className="inventory-search">
              <span className="search-icon">
                🔎
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search product, SKU, brand or category..."
              />
            </div>

            <div className="filter-buttons">

              <button
                className={`filter-btn ${
                  filter === "all" ? "active" : ""
                }`}
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                className={`filter-btn ${
                  filter === "available" ? "active" : ""
                }`}
                onClick={() => setFilter("available")}
              >
                Available
              </button>

              <button
                className={`filter-btn ${
                  filter === "low" ? "active" : ""
                }`}
                onClick={() => setFilter("low")}
              >
                Low
              </button>

              <button
                className={`filter-btn ${
                  filter === "out" ? "active" : ""
                }`}
                onClick={() => setFilter("out")}
              >
                Out
              </button>

            </div>

          </div>

          {products.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📦
              </div>

              <h3>No products yet</h3>

              <p>
                Add your first hardware part above.
                It will be ready for customer search.
              </p>

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="no-results">
              No products match your current search or filter.
            </div>

          ) : (

            <div className="product-table-wrap">

              <table className="product-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((p) => {

                    const q = Number(
                      p.inventory?.quantity ?? 0
                    );

                    return (
                      <tr key={p.id}>

                        <td>
                          <div className="product-name">

                            <div className="product-icon">
                              ⚙️
                            </div>

                            <div className="product-name-text">

                              <b>{p.name}</b>

                              <small>
                                {p.brand || "No brand"}
                              </small>

                            </div>

                          </div>
                        </td>

                        <td>
                          {p.sku || "—"}
                        </td>

                        <td>
                          {p.category || "—"}
                        </td>

                        <td>
                          ₹
                          {Number(
                            p.price
                          ).toLocaleString("en-IN")}
                        </td>

                        <td>
                          <b>{q}</b>
                        </td>

                        <td>
                          <span
                            className={`stock-badge ${
                              q === 0
                                ? "out"
                                : q <= 5
                                ? "low"
                                : "ok"
                            }`}
                          >
                            {q === 0
                              ? "Out of stock"
                              : q <= 5
                              ? "Low stock"
                              : "Available"}
                          </span>
                        </td>

                        <td>

                          <div className="table-actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                editProduct(p)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="danger-btn"
                              onClick={() =>
                                deleteProduct(p.id)
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>
      </section>
    </div>
  );
}