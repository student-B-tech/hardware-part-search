"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      const response = await fetch("/api/admin/shops");
      const data = await response.json();

      if (response.ok) {
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error("Failed to load shops:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateShopStatus(shopId, status) {
    try {
      setUpdatingId(shopId);

      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to update shop status.");
        return;
      }

      setShops((currentShops) =>
        currentShops.map((shop) =>
          shop.id === shopId
            ? { ...shop, status: data.shop.status }
            : shop
        )
      );
    } catch (error) {
      console.error("Failed to update shop:", error);
      alert("Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = shops.filter(
    (shop) => shop.status === "pending"
  ).length;

  const approved = shops.filter(
    (shop) => shop.status === "approved"
  ).length;

  const rejected = shops.filter(
    (shop) => shop.status === "rejected"
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "8px" }}>
          PartNear Admin Dashboard
        </h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          Manage registered hardware shops.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          <StatCard title="Total Shops" value={shops.length} />

          <StatCard title="Pending Shops" value={pending} />

          <StatCard title="Approved Shops" value={approved} />

          <StatCard title="Rejected Shops" value={rejected} />
        </div>

        {/* Shop List */}
        <section
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Registered Shops
          </h2>

          {loading ? (
            <p>Loading shops...</p>
          ) : shops.length === 0 ? (
            <p style={{ color: "#777" }}>
              No shops registered yet.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Shop</th>
                    <th style={thStyle}>Owner</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop.id}>
                      <td style={tdStyle}>
                        {shop.name}
                      </td>

                      <td style={tdStyle}>
                        {shop.owner?.name || "-"}
                      </td>

                      <td style={tdStyle}>
                        {shop.city || "-"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            background:
                              shop.status === "approved"
                                ? "#dcfce7"
                                : shop.status === "rejected"
                                ? "#fee2e2"
                                : "#fef3c7",
                            color:
                              shop.status === "approved"
                                ? "#166534"
                                : shop.status === "rejected"
                                ? "#991b1b"
                                : "#92400e",
                          }}
                        >
                          {shop.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateShopStatus(
                                shop.id,
                                "approved"
                              )
                            }
                            disabled={updatingId === shop.id}
                            style={approveButton}
                          >
                            {updatingId === shop.id
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() =>
                              updateShopStatus(
                                shop.id,
                                "rejected"
                              )
                            }
                            disabled={updatingId === shop.id}
                            style={rejectButton}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ color: "#666", marginBottom: "8px" }}>
        {title}
      </p>

      <h2 style={{ margin: 0 }}>
        {value}
      </h2>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #eee",
};

const approveButton = {
  border: "none",
  background: "#16a34a",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const rejectButton = {
  border: "none",
  background: "#dc2626",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};