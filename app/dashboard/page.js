import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { getDb } from "../../lib/db";
import ShopkeeperManager from "./ShopkeeperManager";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const isShopkeeper = session.role === "shopkeeper";
  const db = await getDb();

  let shop = null;
  let products = [];

  let stats = {
    products: 0,
    stock: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  if (isShopkeeper) {
    shop = await db.shop.findUnique({
      where: {
        ownerId: String(session.userId),
      },
    });

    if (shop) {
      products = await db.product.findMany({
        where: {
          shopId: shop.id,
        },
        include: {
          inventory: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      stats.products = products.length;

      stats.stock = products.reduce(
        (sum, product) =>
          sum + (product.inventory?.quantity || 0),
        0
      );

      stats.lowStock = products.filter((product) => {
        const quantity = product.inventory?.quantity || 0;
        return quantity > 0 && quantity <= 5;
      }).length;

      stats.outOfStock = products.filter(
        (product) =>
          (product.inventory?.quantity || 0) === 0
      ).length;
    }
  }

  const safeProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),

    createdAt: product.createdAt.toISOString(),

    updatedAt: product.updatedAt.toISOString(),

    inventory: product.inventory
      ? {
          ...product.inventory,
          updatedAt:
            product.inventory.updatedAt.toISOString(),
        }
      : null,
  }));

  const shopStatus = shop?.status || null;

  return (
    <main className="dashboard-shell">
      {/* Sidebar */}
      <aside className="dashboard-side">
        <a href="/" className="brand">
          <span className="brand-icon">⚙</span>

          <span>
            <b>PartNear</b>
            <small>SHOP PLATFORM</small>
          </span>
        </a>

        <nav>
          <a className="active">
            ▦ Dashboard
          </a>

          <a href="#inventory">
            📦 Inventory
          </a>

          <a href="/dashboard/billing">
            🧾 Billing
          </a>

          <a href="/dashboard/bills">
            📋 Bill History
          </a>

          <a href="/dashboard/scanner">
            🤖 AI Bill Scanner
          </a>

          <a href="/dashboard/reports">
            📈 Sales & Reports
          </a>

          <a>
            👥 Customers
          </a>
        </nav>

        <form
          action="/api/auth/logout"
          method="post"
        >
          <button>
            ↪ Sign out
          </button>
        </form>
      </aside>

      {/* Main Dashboard */}
      <section className="dashboard-main">
        {/* Top Section */}
        <div className="dash-top">
          <div>
            <p className="eyebrow">
              {isShopkeeper
                ? "SHOPKEEPER DASHBOARD"
                : "CUSTOMER DASHBOARD"}
            </p>

            <h1>
              Welcome, {session.name}
            </h1>

            <p>
              {isShopkeeper
                ? "Manage your shop, products and live inventory from one place."
                : "Search nearby hardware parts and track your reservations."}
            </p>
          </div>

          <span className="session-pill">
            ● {session.role}
          </span>
        </div>

        {/* Shop Status */}
        {isShopkeeper && (
          <ShopStatusBanner status={shopStatus} />
        )}

        {/* Dashboard Content */}
        {isShopkeeper ? (
          <ShopkeeperManager
            initialShop={shop}
            initialProducts={safeProducts}
          />
        ) : (
          <div className="dash-grid">
            <div className="panel wide-panel">
              <div>
                <p className="eyebrow">
                  READY TO SEARCH
                </p>

                <h2>
                  Find your next hardware part.
                </h2>

                <p>
                  Search nearby shops, compare availability
                  and go directly to the right store.
                </p>
              </div>

              <a
                href="/#shops"
                className="primary-btn"
              >
                Find nearby parts →
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ShopStatusBanner({ status }) {
  if (!status) {
    return (
      <div
        style={{
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "25px",
        }}
      >
        <strong>Shop not created</strong>

        <p
          style={{
            margin: "6px 0 0",
            color: "#666",
          }}
        >
          Create your shop profile to start adding products.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fcd34d",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "25px",
        }}
      >
        <strong style={{ color: "#92400e" }}>
          ⏳ Shop Approval Pending
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            color: "#92400e",
          }}
        >
          Your shop has been submitted and is waiting
          for admin approval.
        </p>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "25px",
        }}
      >
        <strong style={{ color: "#166534" }}>
          ✓ Shop Approved
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            color: "#166534",
          }}
        >
          Your shop is approved and visible to customers
          on PartNear.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "25px",
        }}
      >
        <strong style={{ color: "#991b1b" }}>
          ✕ Shop Rejected
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            color: "#991b1b",
          }}
        >
          Your shop is currently not visible to customers.
          Please contact the administrator for more information.
        </p>
      </div>
    );
  }

  return null;
}