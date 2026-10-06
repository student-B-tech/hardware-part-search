import { redirect } from "next/navigation";
import DashboardMobileNav from "./DashboardMobileNav";
import { getSession } from "../../lib/auth";
import { getDb } from "../../lib/db";
import ShopkeeperManager from "./ShopkeeperManager";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/dashboard/admin");
  }

  const isShopkeeper = session.role === "shopkeeper";
  const db = await getDb();

  let shop = null;
  let products = [];

  const stats = {
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
          sum + Number(product.inventory?.quantity || 0),
        0
      );

      stats.lowStock = products.filter((product) => {
        const quantity = Number(product.inventory?.quantity || 0);
        return quantity > 0 && quantity <= 5;
      }).length;

      stats.outOfStock = products.filter(
        (product) =>
          Number(product.inventory?.quantity || 0) === 0
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
          updatedAt: product.inventory.updatedAt.toISOString(),
        }
      : null,
  }));

  const shopStatus = shop?.status || null;

  return (
    <main className="dashboard-shell">
      <DashboardMobileNav
        isShopkeeper={isShopkeeper}
        name={session.name}
        role={session.role}
      />

      {/* SIDEBAR */}
      <aside className="dashboard-side">
        <a href="/" className="brand">
          <div className="brand-icon">⚙</div>

          <div className="brand-text">
            <strong>PartNear</strong>
            <span>
              {isShopkeeper
                ? "SHOP PLATFORM"
                : "HARDWARE MARKETPLACE"}
            </span>
          </div>
        </a>

        <div className="menu-title">MAIN MENU</div>

        <nav className="dashboard-nav">
          <a href="/dashboard" className="active">
            <span>▦</span>
            <label>Dashboard</label>
          </a>

          {isShopkeeper ? (
            <>
              <a href="#inventory">
                <span>📦</span>
                <label>Inventory</label>
              </a>

              <a href="/dashboard/billing">
                <span>🧾</span>
                <label>Billing</label>
              </a>

              <a href="/dashboard/bills">
                <span>📋</span>
                <label>Bill History</label>
              </a>

              <a href="/dashboard/scanner">
                <span>🤖</span>
                <label>AI Bill Scanner</label>
              </a>

              <a href="/dashboard/reports">
                <span>📈</span>
                <label>Sales & Reports</label>
              </a>

              <a href="#">
                <span>👥</span>
                <label>Customers</label>
              </a>
            </>
          ) : (
            <>
              <a href="/#search">
                <span>🔎</span>
                <label>Search Parts</label>
              </a>

              <a href="/#shops">
                <span>📍</span>
                <label>Nearby Shops</label>
              </a>

              <a href="/">
                <span>🏪</span>
                <label>Browse Store</label>
              </a>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-card">
            <div className="avatar">
              {session.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="profile-info">
              <strong>{session.name}</strong>
              <span>{session.role}</span>
            </div>
          </div>

          <form
            action="/api/auth/logout"
            method="post"
          >
            <button className="logout-btn">
              <span>↪</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <section className="dashboard-main">
        <header className="top-header">
          <div>
            <div className="eyebrow">
              {isShopkeeper
                ? "SHOPKEEPER DASHBOARD"
                : "CUSTOMER DASHBOARD"}
            </div>

            <h1>
              Welcome back, {session.name}
              <span className="wave">👋</span>
            </h1>

            <p>
              {isShopkeeper
                ? "Manage your shop, inventory and daily operations."
                : "Find hardware parts and nearby shops quickly."}
            </p>
          </div>

          <div className="header-right">
            <div className="online-pill">
              <i />
              {session.role}
            </div>

            <a href="/" className="store-btn">
              View Store
              <span>→</span>
            </a>
          </div>
        </header>

        {isShopkeeper ? (
          <>
            {/* SHOP STATUS */}
            <ShopStatusBanner status={shopStatus} />

            {/* STATS */}
            <div className="stats-grid">
              <StatCard
                icon="📦"
                title="Total Products"
                value={stats.products}
                subtitle="Products in inventory"
                className="blue"
              />

              <StatCard
                icon="📊"
                title="Total Stock"
                value={stats.stock}
                subtitle="Units available"
                className="green"
              />

              <StatCard
                icon="⚠️"
                title="Low Stock"
                value={stats.lowStock}
                subtitle="Needs attention"
                className="orange"
              />

              <StatCard
                icon="🚫"
                title="Out of Stock"
                value={stats.outOfStock}
                subtitle="Currently unavailable"
                className="red"
              />
            </div>

            {/* QUICK ACTIONS */}
            <section className="content-section">
              <div className="section-header">
                <div>
                  <div className="eyebrow">
                    QUICK ACTIONS
                  </div>
                  <h2>Manage your business</h2>
                </div>
              </div>

              <div className="action-grid">
                <ActionCard
                  href="#inventory"
                  icon="📦"
                  title="Manage Inventory"
                  description="Add, edit and update products"
                  theme="blue"
                />

                <ActionCard
                  href="/dashboard/billing"
                  icon="🧾"
                  title="Create Bill"
                  description="Generate a new customer bill"
                  theme="green"
                />

                <ActionCard
                  href="/dashboard/reports"
                  icon="📈"
                  title="Sales Reports"
                  description="View sales analytics"
                  theme="purple"
                />

                <ActionCard
                  href="/dashboard/scanner"
                  icon="🤖"
                  title="AI Bill Scanner"
                  description="Scan bills automatically"
                  theme="orange"
                />
              </div>
            </section>

            {/* INVENTORY */}
            <section
              id="inventory"
              className="inventory-panel"
            >
              <div className="panel-header">
                <div>
                  <div className="eyebrow">
                    INVENTORY
                  </div>

                  <h2>Your Products</h2>

                  <p>
                    Manage products and stock levels
                  </p>
                </div>

                <div className="count-pill">
                  {stats.products} Products
                </div>
              </div>

              <ShopkeeperManager
                initialShop={shop}
                initialProducts={safeProducts}
              />
            </section>
          </>
        ) : (
          <CustomerDashboard />
        )}
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5f7fb;
        }

        .dashboard-shell {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(59, 130, 246, 0.08),
              transparent 30%
            ),
            #f5f7fb;
          color: #172033;
        }

        /* SIDEBAR */

        .dashboard-side {
          width: 265px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;

          background: rgba(255,255,255,.94);
          backdrop-filter: blur(20px);

          border-right: 1px solid #e7ebf2;

          padding: 24px 15px;

          box-shadow:
            10px 0 35px rgba(15,23,42,.04);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;

          padding: 5px 10px 30px;

          text-decoration: none;
          color: #111827;
        }

        .brand-icon {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          border-radius: 14px;

          color: white;
          font-size: 21px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          box-shadow:
            0 12px 28px
            rgba(37,99,235,.25);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-text strong {
          font-size: 21px;
          letter-spacing: -.7px;
        }

        .brand-text span {
          margin-top: 3px;

          color: #98a2b3;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 1.2px;
        }

        .menu-title {
          padding: 0 12px 10px;

          color: #98a2b3;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1.2px;
        }

        .dashboard-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .dashboard-nav a {
          position: relative;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 12px 13px;

          border-radius: 12px;

          color: #667085;

          text-decoration: none;

          font-size: 14px;
          font-weight: 650;

          transition: .2s ease;
        }

        .dashboard-nav a span {
          width: 23px;

          text-align: center;

          font-size: 17px;
        }

        .dashboard-nav a:hover {
          color: #2563eb;

          background: #f3f6ff;

          transform: translateX(2px);
        }

        .dashboard-nav a.active {
          color: #2458d7;

          background:
            linear-gradient(
              90deg,
              #eaf1ff,
              #f5f7ff
            );

          box-shadow:
            inset 3px 0 0 #2563eb;
        }

        .sidebar-footer {
          margin-top: auto;

          padding-top: 17px;

          border-top: 1px solid #edf0f4;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 8px;

          margin-bottom: 10px;
        }

        .avatar {
          width: 41px;
          height: 41px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 13px;

          color: #315dcc;

          font-weight: 800;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #e0e7ff
            );
        }

        .profile-info {
          min-width: 0;

          display: flex;
          flex-direction: column;
        }

        .profile-info strong {
          overflow: hidden;

          white-space: nowrap;
          text-overflow: ellipsis;

          font-size: 13px;
        }

        .profile-info span {
          margin-top: 2px;

          color: #8b95a7;

          font-size: 11px;

          text-transform: capitalize;
        }

        .logout-btn {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 11px;

          border: 1px solid #edf0f4;
          border-radius: 11px;

          background: #fafbfc;

          color: #667085;

          font-weight: 650;

          cursor: pointer;

          transition: .2s;
        }

        .logout-btn:hover {
          color: #dc2626;

          background: #fff1f2;

          border-color: #fecdd3;
        }

        /* MAIN */

        .dashboard-main {
          flex: 1;
          min-width: 0;

          padding: 35px 42px 60px;
        }

        .top-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 25px;

          margin-bottom: 28px;
        }

        .eyebrow {
          margin-bottom: 7px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 850;

          letter-spacing: 1.4px;
        }

        .top-header h1 {
          margin: 0;

          color: #111827;

          font-size: 32px;
          line-height: 1.15;

          letter-spacing: -1.2px;
        }

        .wave {
          margin-left: 6px;
        }

        .top-header p {
          margin: 9px 0 0;

          color: #7a8496;

          font-size: 14px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .online-pill {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 9px 13px;

          border: 1px solid #e6eaf1;
          border-radius: 999px;

          background: white;

          color: #667085;

          font-size: 12px;
          font-weight: 700;

          box-shadow:
            0 4px 14px
            rgba(15,23,42,.035);

          text-transform: capitalize;
        }

        .online-pill i {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 4px
            rgba(34,197,94,.1);
        }

        .store-btn {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 10px 15px;

          border-radius: 11px;

          color: white;

          background: #111827;

          text-decoration: none;

          font-size: 12px;
          font-weight: 750;

          box-shadow:
            0 8px 18px
            rgba(17,24,39,.13);

          transition: .2s;
        }

        .store-btn:hover {
          transform: translateY(-1px);
          background: #1f2937;
        }

        /* STATS */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 15px;

          margin-bottom: 32px;
        }

        .stat-card {
          position: relative;

          overflow: hidden;

          min-height: 150px;

          padding: 19px;

          border: 1px solid #e7ebf1;
          border-radius: 18px;

          background:
            rgba(255,255,255,.96);

          box-shadow:
            0 10px 30px
            rgba(15,23,42,.055);

          transition: .22s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 17px 38px
            rgba(15,23,42,.09);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          width: 43px;
          height: 43px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          font-size: 19px;
        }

        .stat-card.blue .stat-icon {
          background: #eaf2ff;
        }

        .stat-card.green .stat-icon {
          background: #eaf9ef;
        }

        .stat-card.orange .stat-icon {
          background: #fff3e6;
        }

        .stat-card.red .stat-icon {
          background: #fff0f1;
        }

        .stat-value {
          margin-top: 19px;

          color: #111827;

          font-size: 29px;
          font-weight: 800;

          letter-spacing: -1px;
        }

        .stat-title {
          margin-top: 2px;

          color: #475467;

          font-size: 12px;
          font-weight: 700;
        }

        .stat-subtitle {
          margin-top: 5px;

          color: #98a2b3;

          font-size: 11px;
        }

        /* SECTIONS */

        .content-section {
          margin-bottom: 30px;
        }

        .section-header {
          margin-bottom: 15px;
        }

        .section-header h2,
        .panel-header h2 {
          margin: 0;

          color: #111827;

          font-size: 20px;

          letter-spacing: -.5px;
        }

        /* ACTIONS */

        .action-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 13px;
        }

        .action-card {
          position: relative;

          overflow: hidden;

          min-height: 120px;

          display: flex;
          align-items: center;

          gap: 13px;

          padding: 17px;

          border: 1px solid #e7ebf1;
          border-radius: 17px;

          background:
            rgba(255,255,255,.96);

          color: #172033;

          text-decoration: none;

          box-shadow:
            0 8px 24px
            rgba(15,23,42,.045);

          transition: .22s ease;
        }

        .action-card:hover {
          transform: translateY(-3px);

          border-color: #d8e2fb;

          box-shadow:
            0 17px 35px
            rgba(15,23,42,.08);
        }

        .action-card::after {
          content: "";

          position: absolute;

          width: 100px;
          height: 100px;

          right: -48px;
          top: -48px;

          border-radius: 50%;

          background: #f5f7ff;
        }

        .action-icon {
          width: 47px;
          height: 47px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 14px;

          font-size: 20px;

          position: relative;
          z-index: 1;
        }

        .action-icon.blue {
          background: #eaf2ff;
        }

        .action-icon.green {
          background: #e9f9ef;
        }

        .action-icon.purple {
          background: #f1ecff;
        }

        .action-icon.orange {
          background: #fff2e5;
        }

        .action-content {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 4px;

          position: relative;
          z-index: 1;
        }

        .action-content strong {
          font-size: 13px;
        }

        .action-content span {
          color: #8a94a6;

          font-size: 11px;

          line-height: 1.4;
        }

        .action-arrow {
          margin-left: auto;

          color: #98a2b3;

          font-size: 18px;

          position: relative;
          z-index: 1;
        }

        /* INVENTORY */

        .inventory-panel {
          padding: 22px;

          border: 1px solid #e6eaf1;
          border-radius: 20px;

          background:
            rgba(255,255,255,.97);

          box-shadow:
            0 12px 35px
            rgba(15,23,42,.055);
        }

        .panel-header {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 20px;
        }

        .panel-header p {
          margin: 6px 0 0;

          color: #8a94a6;

          font-size: 12px;
        }

        .count-pill {
          padding: 8px 12px;

          border: 1px solid #e9edf3;
          border-radius: 999px;

          background: #f7f9fc;

          color: #667085;

          font-size: 11px;
          font-weight: 750;
        }

        /* RESPONSIVE */

        @media (max-width: 1150px) {
          .dashboard-main {
            padding: 30px 25px 50px;
          }

          .stats-grid,
          .action-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 800px) {
          .dashboard-side {
            display: none;
          }

          .dashboard-main {
            padding: 22px 15px 40px;
          }

          .top-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            width: 100%;
          }

          .top-header h1 {
            font-size: 27px;
          }

          .stats-grid,
          .action-grid {
            grid-template-columns: 1fr;
          }

          .inventory-panel {
            padding: 15px;
            border-radius: 16px;
          }

          .panel-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
          /* =========================
   MOBILE SHOPKEEPER FIX
========================= */

@media (max-width: 800px) {

  html,
  body {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  .dashboard-shell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    display: block !important;
    overflow-x: hidden;
  }

  .dashboard-main {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 76px 14px 32px !important;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .dashboard-header {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .dashboard-header > div {
    min-width: 0;
    max-width: 100%;
  }

  .dashboard-header h1,
  .header-description {
    overflow-wrap: anywhere;
  }

  .stats-grid {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .stat-card,
  .stat,
  .panel,
  .manager-panel,
  .manage-card,
  .inventory-stats,
  .manager-grid,
  .quick-actions {
    min-width: 0 !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }

  .inventory-stats {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px;
  }

  .manager-grid {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 14px;
  }

  .manage-card {
    width: 100%;
    overflow: hidden;
  }

  .manage-form {
    width: 100%;
    min-width: 0;
  }

  .manage-form input,
  .manage-form select,
  .manage-form textarea,
  .manage-form button {
    max-width: 100%;
    box-sizing: border-box;
  }

  .quick-actions {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .action-card {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {

  .dashboard-main {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  .stats-grid,
  .inventory-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .stat,
  .mini-stat {
    min-width: 0;
    padding: 15px !important;
  }

  .stat b,
  .mini-stat b {
    font-size: 24px;
  }

  .stat span,
  .mini-stat span {
    font-size: 11px;
  }

  .manage-card {
    padding: 14px !important;
  }

  .section-head {
    flex-wrap: wrap;
  }
}
      `}</style>
    </main>
  );
}

/* STAT CARD */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  className = "",
}) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-subtitle">
        {subtitle}
      </div>
    </div>
  );
}

/* ACTION CARD */

function ActionCard({
  href,
  icon,
  title,
  description,
  theme,
}) {
  return (
    <a href={href} className="action-card">
      <div className={`action-icon ${theme}`}>
        {icon}
      </div>

      <div className="action-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <b className="action-arrow">
        →
      </b>
    </a>
  );
}

/* SHOP STATUS */

function ShopStatusBanner({ status }) {
  if (!status) {
    return null;
  }

  const config = {
    approved: {
      icon: "✓",
      title: "Shop approved",
      text: "Your shop is live and visible to customers.",
      className: "approved",
    },
    pending: {
      icon: "◷",
      title: "Approval pending",
      text: "Your shop is waiting for admin approval.",
      className: "pending",
    },
    rejected: {
      icon: "!",
      title: "Shop rejected",
      text: "Your shop needs attention before it can go live.",
      className: "rejected",
    },
  };

  const current =
    config[status] || config.pending;

  return (
    <div
      className={`shop-status ${current.className}`}
    >
      <div className="shop-status-icon">
        {current.icon}
      </div>

      <div>
        <strong>{current.title}</strong>
        <span>{current.text}</span>
      </div>
    </div>
  );
}

/* CUSTOMER DASHBOARD */

function CustomerDashboard() {
  return (
    <div className="customer-area">
      <div className="customer-hero">
        <div>
          <div className="eyebrow">
            PARTNEAR MARKETPLACE
          </div>

          <h2>
            Find the right hardware part,
            <br />
            near you.
          </h2>

          <p>
            Search products, discover nearby shops
            and get directions instantly.
          </p>

          <div className="customer-actions">
            <a href="/#search">
              Search Parts →
            </a>

            <a href="/#shops">
              Nearby Shops
            </a>
          </div>
        </div>

        <div className="hero-art">
          🔧
        </div>
      </div>
    </div>
  );
}