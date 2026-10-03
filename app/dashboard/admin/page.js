"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/shops", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load shops.");
      }

      setShops(data.shops || []);
    } catch (err) {
      console.error("Load shops error:", err);
      setError(err.message || "Failed to load shops.");
    } finally {
      setLoading(false);
    }
  }

  async function updateShopStatus(shopId, status) {
    try {
      setUpdatingId(shopId);
      setError("");
      setMessage("");

      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update shop status."
        );
      }

      setShops((current) =>
        current.map((shop) =>
          shop.id === shopId
            ? {
                ...shop,
                status: data.shop?.status || status,
              }
            : shop
        )
      );

      setMessage(
        status === "approved"
          ? "Shop approved successfully."
          : "Shop rejected successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Update shop error:", err);
      setError(err.message || "Something went wrong.");

      setTimeout(() => {
        setError("");
      }, 4000);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleStatusChange(shop, status) {
    const action =
      status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${shop.name}"?`
    );

    if (!confirmed) return;

    updateShopStatus(shop.id, status);
  }

  const total = shops.length;

  const pending = shops.filter(
    (shop) => shop.status === "pending"
  ).length;

  const approved = shops.filter(
    (shop) => shop.status === "approved"
  ).length;

  const rejected = shops.filter(
    (shop) => shop.status === "rejected"
  ).length;

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shops.filter((shop) => {
      const statusMatch =
        filter === "all" || shop.status === filter;

      if (!statusMatch) return false;

      if (!query) return true;

      return (
        shop.name?.toLowerCase().includes(query) ||
        shop.city?.toLowerCase().includes(query) ||
        shop.owner?.name?.toLowerCase().includes(query) ||
        shop.status?.toLowerCase().includes(query)
      );
    });
  }, [shops, search, filter]);

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top right,
              rgba(59, 130, 246, 0.16),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(124, 58, 237, 0.12),
              transparent 25%
            ),
            #080b14;

          color: #f8fafc;
          padding: 24px;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

        /* ================= HEADER ================= */

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-logo {
          width: 54px;
          height: 54px;
          border-radius: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 24px;
          font-weight: 900;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 15px 40px rgba(37, 99, 235, 0.3);
        }

        .eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.7px;
          color: #60a5fa;
        }

        .title {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .subtitle {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-pill {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 10px 14px;

          border: 1px solid #1e293b;
          border-radius: 12px;

          background: rgba(15, 23, 42, 0.8);

          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
        }

        .online {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px #22c55e;
        }

        .refresh-btn {
          border: 1px solid #263247;
          background: #111827;
          color: #e2e8f0;

          padding: 10px 15px;
          border-radius: 12px;

          font-weight: 700;
          font-size: 12px;

          cursor: pointer;
          transition: 0.2s;
        }

        .refresh-btn:hover {
          border-color: #3b82f6;
          background: #172033;
        }

        /* ================= ALERT ================= */

        .alert {
          margin-bottom: 20px;
          padding: 13px 16px;
          border-radius: 13px;

          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 13px;
          font-weight: 700;
        }

        .success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #86efac;
        }

        .danger-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }

        /* ================= STATS ================= */

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;

          padding: 20px;

          border: 1px solid #1d2738;
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(18, 25, 40, 0.96),
              rgba(10, 15, 27, 0.96)
            );

          box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.18);
        }

        .stat-card::after {
          content: "";
          position: absolute;

          width: 100px;
          height: 100px;

          right: -40px;
          top: -40px;

          border-radius: 50%;

          background: rgba(59, 130, 246, 0.08);
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
        }

        .stat-value {
          margin: 7px 0 0;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 18px;
        }

        .blue-icon {
          background: rgba(59, 130, 246, 0.13);
          color: #60a5fa;
        }

        .yellow-icon {
          background: rgba(245, 158, 11, 0.13);
          color: #fbbf24;
        }

        .green-icon {
          background: rgba(34, 197, 94, 0.13);
          color: #4ade80;
        }

        .red-icon {
          background: rgba(239, 68, 68, 0.13);
          color: #f87171;
        }

        .stat-note {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        /* ================= MAIN PANEL ================= */

        .panel {
          border: 1px solid #1d2738;
          border-radius: 20px;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.98),
              rgba(8, 13, 24, 0.98)
            );

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .panel-header {
          padding: 22px;
          border-bottom: 1px solid #1d2738;
        }

        .panel-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          margin-bottom: 18px;
        }

        .panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .panel-subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .result-count {
          padding: 7px 10px;
          border-radius: 9px;

          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;

          font-size: 11px;
          font-weight: 800;
        }

        /* ================= TOOLBAR ================= */

        .toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);

          color: #64748b;
          font-size: 15px;
        }

        .search-input {
          width: 100%;

          padding: 12px 14px 12px 40px;

          border: 1px solid #273449;
          border-radius: 11px;

          outline: none;

          background: #0b1220;
          color: #f8fafc;

          font-size: 13px;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow:
            0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filter-btn {
          border: 1px solid #273449;

          background: #0b1220;
          color: #94a3b8;

          padding: 10px 12px;
          border-radius: 10px;

          font-size: 11px;
          font-weight: 800;

          cursor: pointer;
          transition: 0.2s;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
          color: #60a5fa;
        }

        .filter-active {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        /* ================= TABLE ================= */

        .table-wrapper {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .table th {
          padding: 13px 22px;

          text-align: left;

          background: #0b1220;

          border-bottom: 1px solid #1d2738;

          color: #64748b;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .table td {
          padding: 16px 22px;
          border-bottom: 1px solid #151f30;
        }

        .table tbody tr {
          transition: 0.18s;
        }

        .table tbody tr:hover {
          background: rgba(59, 130, 246, 0.035);
        }

        /* ================= SHOP ================= */

        .shop-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #1d4ed8,
              #6d28d9
            );

          color: white;
          font-weight: 900;
        }

        .shop-name {
          color: #f1f5f9;
          font-size: 13px;
          font-weight: 800;
        }

        .shop-id {
          display: block;
          margin-top: 4px;

          color: #475569;
          font-size: 9px;
        }

        .owner {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .city {
          color: #94a3b8;
          font-size: 13px;
        }

        /* ================= STATUS ================= */

        .status {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 6px 10px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 800;

          text-transform: capitalize;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-approved {
          color: #86efac;
          background: rgba(34, 197, 94, 0.1);
        }

        .status-approved .status-dot {
          background: #22c55e;
          box-shadow: 0 0 7px #22c55e;
        }

        .status-pending {
          color: #fcd34d;
          background: rgba(245, 158, 11, 0.1);
        }

        .status-pending .status-dot {
          background: #f59e0b;
        }

        .status-rejected {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
        }

        .status-rejected .status-dot {
          background: #ef4444;
        }

        /* ================= ACTIONS ================= */

        .actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .action {
          border: 0;

          padding: 8px 11px;

          border-radius: 9px;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;

          transition: 0.18s;
        }

        .action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .approve {
          background: #16a34a;
          color: white;
        }

        .approve:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
        }

        .reject {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .reject:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }

        .updating {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          color: #64748b;
          font-size: 11px;
        }

        .spinner {
          width: 14px;
          height: 14px;

          border: 2px solid #334155;
          border-top-color: #60a5fa;

          border-radius: 50%;

          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ================= EMPTY ================= */

        .empty {
          padding: 70px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background: #111827;

          font-size: 22px;
        }

        .empty-title {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 800;
        }

        .empty-text {
          margin-top: 5px;
          font-size: 12px;
        }

        /* ================= FOOTER ================= */

        .footer {
          display: flex;
          justify-content: space-between;

          padding: 18px 3px 5px;

          color: #475569;
          font-size: 10px;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 1050px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 16px 12px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .title {
            font-size: 25px;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-value {
            font-size: 25px;
          }

          .stat-note {
            display: none;
          }

          .filters {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 3px;
          }

          .filter-btn {
            white-space: nowrap;
          }
        }

        @media (max-width: 430px) {
          .admin-pill {
            display: none;
          }

          .footer {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>

      <main className="page">
        <div className="container">

          {/* HEADER */}

          <header className="header">
            <div className="brand">
              <div className="brand-logo">
                ⚙
              </div>

              <div>
                <p className="eyebrow">
                  PARTNEAR ADMIN
                </p>

                <h1 className="title">
                  Control Center
                </h1>

                <p className="subtitle">
                  Manage shop registrations and approvals
                </p>
              </div>
            </div>

            <div className="header-actions">

              <div className="admin-pill">
                <span className="online" />
                Administrator
              </div>

              <button
                type="button"
                className="refresh-btn"
                onClick={loadShops}
                disabled={loading}
              >
                ↻ Refresh
              </button>

            </div>
          </header>

          {/* ALERT */}

          {message && (
            <div className="alert success">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="alert danger-alert">
              ⚠ {error}
            </div>
          )}

          {/* STATS */}

          <section className="stats">

            <StatCard
              title="Total Shops"
              value={total}
              icon="🏪"
              iconClass="blue-icon"
              note="All registered shops"
            />

            <StatCard
              title="Pending Review"
              value={pending}
              icon="◷"
              iconClass="yellow-icon"
              note="Waiting for approval"
            />

            <StatCard
              title="Approved"
              value={approved}
              icon="✓"
              iconClass="green-icon"
              note="Currently active"
            />

            <StatCard
              title="Rejected"
              value={rejected}
              icon="×"
              iconClass="red-icon"
              note="Rejected registrations"
            />

          </section>

          {/* MAIN PANEL */}

          <section className="panel">

            <div className="panel-header">

              <div className="panel-title-row">

                <div>
                  <h2 className="panel-title">
                    Shop Management
                  </h2>

                  <p className="panel-subtitle">
                    Review and manage registered hardware shops
                  </p>
                </div>

                <div className="result-count">
                  {filteredShops.length}{" "}
                  {filteredShops.length === 1
                    ? "Shop"
                    : "Shops"}
                </div>

              </div>

              {/* TOOLBAR */}

              <div className="toolbar">

                <div className="search-wrapper">

                  <span className="search-icon">
                    ⌕
                  </span>

                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search shop, owner or city..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>

                <div className="filters">

                  <FilterButton
                    label="All"
                    value="all"
                    current={filter}
                    count={total}
                    onClick={setFilter}
                  />

                  <FilterButton
                    label="Pending"
                    value="pending"
                    current={filter}
                    count={pending}
                    onClick={setFilter}
                  />

                  <FilterButton
                    label="Approved"
                    value="approved"
                    current={filter}
                    count={approved}
                    onClick={setFilter}
                  />

                  <FilterButton
                    label="Rejected"
                    value="rejected"
                    current={filter}
                    count={rejected}
                    onClick={setFilter}
                  />

                </div>

              </div>
            </div>

            {/* CONTENT */}

            {loading ? (
              <LoadingState />
            ) : filteredShops.length === 0 ? (
              <EmptyState
                search={search}
              />
            ) : (
              <div className="table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Shop</th>
                      <th>Owner</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredShops.map((shop) => {

                      const updating =
                        updatingId === shop.id;

                      return (
                        <tr key={shop.id}>

                          {/* SHOP */}

                          <td>
                            <div className="shop-cell">

                              <div className="avatar">
                                {shop.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"}
                              </div>

                              <div>

                                <div className="shop-name">
                                  {shop.name ||
                                    "Unnamed Shop"}
                                </div>

                                <span className="shop-id">
                                  ID: {shop.id}
                                </span>

                              </div>

                            </div>
                          </td>

                          {/* OWNER */}

                          <td>
                            <span className="owner">
                              {shop.owner?.name || "-"}
                            </span>
                          </td>

                          {/* CITY */}

                          <td>
                            <span className="city">
                              📍 {shop.city || "-"}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td>
                            <StatusBadge
                              status={shop.status}
                            />
                          </td>

                          {/* ACTIONS */}

                          <td>

                            {updating ? (
                              <span className="updating">
                                <span className="spinner" />
                                Updating...
                              </span>
                            ) : (
                              <div className="actions">

                                {/* PENDING */}

                                {shop.status ===
                                  "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      className="action approve"
                                      onClick={() =>
                                        handleStatusChange(
                                          shop,
                                          "approved"
                                        )
                                      }
                                    >
                                      ✓ Approve
                                    </button>

                                    <button
                                      type="button"
                                      className="action reject"
                                      onClick={() =>
                                        handleStatusChange(
                                          shop,
                                          "rejected"
                                        )
                                      }
                                    >
                                      × Reject
                                    </button>
                                  </>
                                )}

                                {/* APPROVED */}

                                {shop.status ===
                                  "approved" && (
                                  <button
                                    type="button"
                                    className="action reject"
                                    onClick={() =>
                                      handleStatusChange(
                                        shop,
                                        "rejected"
                                      )
                                    }
                                  >
                                    × Reject
                                  </button>
                                )}

                                {/* REJECTED */}

                                {shop.status ===
                                  "rejected" && (
                                  <button
                                    type="button"
                                    className="action approve"
                                    onClick={() =>
                                      handleStatusChange(
                                        shop,
                                        "approved"
                                      )
                                    }
                                  >
                                    ✓ Approve
                                  </button>
                                )}

                              </div>
                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </section>

          <footer className="footer">
            <span>
              PartNear · Hardware Marketplace
            </span>

            <span>
              Admin Control Center
            </span>
          </footer>

        </div>
      </main>
    </>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon,
  iconClass,
  note,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div>
          <p className="stat-label">
            {title}
          </p>

          <h2 className="stat-value">
            {value}
          </h2>
        </div>

        <div
          className={`stat-icon ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p className="stat-note">
        {note}
      </p>

    </div>
  );
}


/* =====================================================
   FILTER BUTTON
===================================================== */

function FilterButton({
  label,
  value,
  current,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`filter-btn ${
        current === value
          ? "filter-active"
          : ""
      }`}
      onClick={() => onClick(value)}
    >
      {label} ({count})
    </button>
  );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
  const normalized = status || "pending";

  return (
    <span
      className={`status status-${normalized}`}
    >
      <span className="status-dot" />
      {normalized}
    </span>
  );
}


/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="empty">

      <div className="empty-icon">
        <span className="spinner" />
      </div>

      <div className="empty-title">
        Loading shops...
      </div>

      <div className="empty-text">
        Please wait while we fetch the shop list.
      </div>

    </div>
  );
}


/* =====================================================
   EMPTY
===================================================== */

function EmptyState({ search }) {
  return (
    <div className="empty">

      <div className="empty-icon">
        🏪
      </div>

      <div className="empty-title">
        No shops found
      </div>

      <div className="empty-text">
        {search
          ? "Try another search term."
          : "No shop registrations are available."}
      </div>

    </div>
  );
}