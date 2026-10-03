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

      {/* ================= SIDEBAR ================= */}
      <DashboardMobileNav
  isShopkeeper={isShopkeeper}
  name={session.name}
  role={session.role}
/>

      <aside className="dashboard-side">

        <a href="/" className="brand">
          <span className="brand-icon">⚙</span>

          <span className="brand-text">
            <b>PartNear</b>
            <small>
              {isShopkeeper
                ? "SHOP PLATFORM"
                : "HARDWARE MARKETPLACE"}
            </small>
          </span>
        </a>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="dashboard-nav">

          <a href="/dashboard" className="active">
            <span>▦</span>
            Dashboard
          </a>

          {isShopkeeper ? (
            <>
              <a href="#inventory">
                <span>📦</span>
                Inventory
              </a>

              <a href="/dashboard/billing">
                <span>🧾</span>
                Billing
              </a>

              <a href="/dashboard/bills">
                <span>📋</span>
                Bill History
              </a>

              <a href="/dashboard/scanner">
                <span>🤖</span>
                AI Bill Scanner
              </a>

              <a href="/dashboard/reports">
                <span>📈</span>
                Sales & Reports
              </a>

              <a href="#">
                <span>👥</span>
                Customers
              </a>
            </>
          ) : (
            <>
              <a href="/#search">
                <span>🔎</span>
                Search Parts
              </a>

              <a href="/#shops">
                <span>📍</span>
                Nearby Shops
              </a>

              <a href="/">
                <span>🏪</span>
                Browse Store
              </a>
            </>
          )}

        </nav>

        {/* USER */}

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="user-avatar">
              {session.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{session.name}</strong>
              <small>
                {session.role}
              </small>
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

      {/* ================= MAIN ================= */}

      <section className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              {isShopkeeper
                ? "SHOPKEEPER DASHBOARD"
                : "CUSTOMER DASHBOARD"}
            </p>

            <h1>
              Welcome back, {session.name} 👋
            </h1>

            <p className="header-description">
              {isShopkeeper
                ? "Manage your shop, inventory and daily operations."
                : "Find hardware parts and nearby shops quickly."}
            </p>

          </div>

          <div className="header-actions">

            <span className="role-pill">
              <span className="status-dot" />
              {session.role}
            </span>

            <a
              href="/"
              className="home-btn"
            >
              View Store →
            </a>

          </div>

        </header>


        {/* ================= SHOPKEEPER ================= */}

        {isShopkeeper ? (

          <>

            {/* SHOP STATUS */}

            <ShopStatusBanner
              status={shopStatus}
            />


            {/* STATS */}

            <div className="stats-grid">

              <StatCard
                icon="📦"
                title="Total Products"
                value={stats.products}
                subtitle="Products in inventory"
              />

              <StatCard
                icon="📊"
                title="Total Stock"
                value={stats.stock}
                subtitle="Units available"
              />

              <StatCard
                icon="⚠️"
                title="Low Stock"
                value={stats.lowStock}
                subtitle="Needs attention"
                warning
              />

              <StatCard
                icon="🚫"
                title="Out of Stock"
                value={stats.outOfStock}
                subtitle="Currently unavailable"
                danger
              />

            </div>


            {/* QUICK ACTIONS */}

            <div className="section-heading">

              <div>
                <p className="eyebrow">
                  QUICK ACTIONS
                </p>

                <h2>
                  Manage your business
                </h2>
              </div>

            </div>


            <div className="quick-actions">

              <a
                href="#inventory"
                className="action-card"
              >
                <div className="action-icon blue">
                  📦
                </div>

                <div>
                  <strong>
                    Manage Inventory
                  </strong>

                  <span>
                    Add, edit and update products
                  </span>
                </div>

                <b>→</b>
              </a>


              <a
                href="/dashboard/billing"
                className="action-card"
              >
                <div className="action-icon green">
                  🧾
                </div>

                <div>
                  <strong>
                    Create Bill
                  </strong>

                  <span>
                    Generate a new customer bill
                  </span>
                </div>

                <b>→</b>
              </a>


              <a
                href="/dashboard/reports"
                className="action-card"
              >
                <div className="action-icon purple">
                  📈
                </div>

                <div>
                  <strong>
                    Sales Reports
                  </strong>

                  <span>
                    View sales analytics
                  </span>
                </div>

                <b>→</b>
              </a>


              <a
                href="/dashboard/scanner"
                className="action-card"
              >
                <div className="action-icon orange">
                  🤖
                </div>

                <div>
                  <strong>
                    AI Bill Scanner
                  </strong>

                  <span>
                    Scan bills automatically
                  </span>
                </div>

                <b>→</b>
              </a>

            </div>


            {/* INVENTORY */}

            <div
              id="inventory"
              className="manager-panel"
            >

              <div className="panel-heading">

                <div>
                  <p className="eyebrow">
                    INVENTORY
                  </p>

                  <h2>
                    Your Products
                  </h2>
                </div>

                <span className="product-count">
                  {stats.products} products
                </span>

              </div>

              <ShopkeeperManager
                initialShop={shop}
                initialProducts={safeProducts}
              />

            </div>

          </>

        ) : (

          /* ================= CUSTOMER ================= */

          <CustomerDashboard />

        )}

      </section>


      {/* ================= STYLES ================= */}

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
          background: #f5f7fb;
          color: #172033;
        }


        /* ================= SIDEBAR ================= */

        .dashboard-side {
          width: 255px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e7eaf0;
          padding: 25px 16px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 28px;
          text-decoration: none;
          color: #111827;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
          color: white;
          display: grid;
          place-items: center;
          font-size: 21px;
          box-shadow:
            0 8px 20px
            rgba(37, 99, 235, .2);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-text b {
          font-size: 20px;
          letter-spacing: -.5px;
        }

        .brand-text small {
          color: #8b95a7;
          font-size: 8px;
          letter-spacing: 1.1px;
          margin-top: 2px;
        }

        .sidebar-label {
          padding: 0 12px 10px;
          font-size: 10px;
          font-weight: 800;
          color: #9aa3b2;
          letter-spacing: 1.1px;
        }

        .dashboard-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .dashboard-nav a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 13px;
          border-radius: 10px;
          color: #657084;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: .2s ease;
        }

        .dashboard-nav a span {
          width: 22px;
          text-align: center;
          font-size: 17px;
        }

        .dashboard-nav a:hover {
          background: #f2f6ff;
          color: #2563eb;
          transform: translateX(2px);
        }

        .dashboard-nav a.active {
          background: #eaf1ff;
          color: #2563eb;
        }


        /* USER */

        .sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #edf0f4;
          padding-top: 17px;
        }

        .user-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          margin-bottom: 10px;
        }

        .user-avatar {
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .user-mini div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .user-mini strong {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-mini small {
          color: #8a94a6;
          margin-top: 2px;
          text-transform: capitalize;
        }

        .logout-btn {
          width: 100%;
          border: 0;
          background: #f8f9fb;
          color: #667085;
          padding: 11px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout-btn:hover {
          background: #fff1f2;
          color: #dc2626;
        }


        /* ================= MAIN ================= */

        .dashboard-main {
          flex: 1;
          min-width: 0;
          padding: 38px 42px 60px;
          max-width: 1600px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: clamp(27px, 3vw, 38px);
          letter-spacing: -1.2px;
          line-height: 1.15;
        }

        .header-description {
          color: #7b8494;
          margin: 9px 0 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .role-pill {
          background: white;
          border: 1px solid #e4e8ef;
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          margin-right: 5px;
        }

        .home-btn {
          text-decoration: none;
          background: #2563eb;
          color: white;
          padding: 10px 15px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          box-shadow:
            0 7px 18px
            rgba(37, 99, 235, .18);
        }


        /* ================= STATUS ================= */

        .shop-status {
          padding: 17px 20px;
          border-radius: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid;
        }

        .shop-status-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.7);
          font-size: 19px;
        }

        .shop-status strong {
          display: block;
          font-size: 14px;
        }

        .shop-status p {
          margin: 4px 0 0;
          font-size: 13px;
        }

        .status-neutral {
          background: #f8fafc;
          border-color: #dce2ea;
          color: #475569;
        }

        .status-pending {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }

        .status-approved {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }

        .status-rejected {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }


        /* ================= STATS ================= */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 34px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 16px;
          padding: 20px;
          transition: .2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, .07);
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #eff6ff;
          display: grid;
          place-items: center;
          font-size: 19px;
        }

        .stat-value {
          margin: 16px 0 3px;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -.8px;
        }

        .stat-title {
          font-size: 12px;
          color: #8992a2;
        }


        /* ================= ACTIONS ================= */

        .section-heading {
          margin-bottom: 14px;
        }

        .section-heading h2,
        .panel-heading h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -.4px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 34px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 14px;
          padding: 15px;
          text-decoration: none;
          color: #172033;
          transition: .2s ease;
        }

        .action-card:hover {
          transform: translateY(-3px);
          border-color: #bfdbfe;
          box-shadow:
            0 10px 25px
            rgba(15, 23, 42, .06);
        }

        .action-card > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .action-card strong,
        .action-card span {
          display: block;
        }

        .action-card strong {
          font-size: 13px;
        }

        .action-card span {
          color: #8a94a6;
          font-size: 11px;
          margin-top: 3px;
        }

        .action-card > b {
          color: #9aa3b2;
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .action-icon.blue {
          background: #eff6ff;
        }

        .action-icon.green {
          background: #ecfdf5;
        }

        .action-icon.purple {
          background: #f5f3ff;
        }

        .action-icon.orange {
          background: #fff7ed;
        }


        /* ================= MANAGER ================= */

        .manager-panel {
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 18px;
          padding: 24px;
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .product-count {
          background: #f3f6fb;
          color: #687386;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 11px;
          font-weight: 700;
        }
        
        .mobile-dashboard-bar {
  display: none;
}

.mobile-nav-drawer {
  display: none;
}

.mobile-nav-overlay {
  display: none;
}

@media (max-width: 850px) {
  .dashboard-side {
    display: none !important;
  }

  .mobile-dashboard-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 18px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 80;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #111827;
  }

  .mobile-brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111827;
    color: #ffffff;
    font-size: 19px;
  }

  .mobile-brand b {
    display: block;
    font-size: 17px;
    line-height: 20px;
  }

  .mobile-brand small {
    display: block;
    font-size: 8px;
    letter-spacing: 1px;
    color: #6b7280;
    margin-top: 2px;
  }

  .mobile-menu-btn {
    width: 42px;
    height: 42px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 23px;
    cursor: pointer;
  }

  .mobile-nav-overlay {
    display: block;
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 90;
  }

  .mobile-nav-drawer {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(310px, 86vw);
    background: #ffffff;
    z-index: 100;
    padding: 18px;
    box-shadow: 12px 0 35px rgba(0, 0, 0, 0.12);
    transform: translateX(-105%);
    transition: transform 0.25s ease;
  }

  .mobile-nav-drawer.open {
    transform: translateX(0);
  }

  .mobile-nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 22px;
    border-bottom: 1px solid #eef0f3;
  }

  .mobile-close-btn {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 10px;
    background: #f3f4f6;
    color: #111827;
    font-size: 25px;
    cursor: pointer;
  }

  .mobile-sidebar-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    color: #9ca3af;
    margin: 25px 8px 10px;
  }

  .mobile-dashboard-nav {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .mobile-dashboard-nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 46px;
    padding: 0 13px;
    border-radius: 10px;
    color: #4b5563;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: 0.2s ease;
  }

  .mobile-dashboard-nav a span {
    width: 24px;
    text-align: center;
    font-size: 17px;
  }

  .mobile-dashboard-nav a:hover,
  .mobile-dashboard-nav a.active {
    background: #111827;
    color: #ffffff;
  }

  .mobile-sidebar-bottom {
    margin-top: auto;
    padding-top: 18px;
    border-top: 1px solid #eef0f3;
  }

  .mobile-user-mini {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .mobile-user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #111827;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .mobile-user-mini strong {
    display: block;
    font-size: 13px;
    color: #111827;
  }

  .mobile-user-mini small {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
    text-transform: capitalize;
  }

  .mobile-logout-btn {
    width: 100%;
    height: 44px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
    color: #dc2626;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .mobile-logout-btn:hover {
    background: #fef2f2;
  }
}

        /* ================= CUSTOMER HERO ================= */

        .customer-hero {
          position: relative;
          min-height: 335px;
          background:
            linear-gradient(
              135deg,
              #eff6ff 0%,
              #ffffff 58%,
              #f8fbff 100%
            );
          border: 1px solid #dbeafe;
          border-radius: 24px;
          padding: 45px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
        }

        .customer-hero::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: #dbeafe;
          opacity: .35;
          right: -100px;
          top: -120px;
        }

        .customer-hero-content {
          position: relative;
          z-index: 1;
        }

        .customer-hero h2 {
          margin: 0;
          font-size: clamp(
            30px,
            4vw,
            46px
          );
          line-height: 1.08;
          letter-spacing: -1.7px;
        }

        .customer-hero-description {
          color: #697386;
          max-width: 570px;
          line-height: 1.7;
          margin: 15px 0 24px;
          font-size: 14px;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2563eb;
          color: white;
          padding: 13px 19px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          box-shadow:
            0 9px 22px
            rgba(37,99,235,.2);
          transition: .2s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          background: #1d4ed8;
        }


        /* CUSTOMER VISUAL */

        .customer-visual {
          position: relative;
          z-index: 1;
          width: 205px;
          height: 205px;
          border-radius: 50%;
          background: rgba(255,255,255,.85);
          border: 10px solid rgba(255,255,255,.7);
          box-shadow:
            0 20px 55px
            rgba(37,99,235,.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-right: 30px;
        }

        .customer-visual-icon {
          font-size: 45px;
          margin-bottom: 8px;
        }

        .customer-visual strong {
          font-size: 18px;
        }

        .customer-visual small {
          color: #8b95a7;
          margin-top: 4px;
        }


        /* ================= CUSTOMER SEARCH ================= */

        .customer-search {
          background: white;
          border: 1px solid #e4e8ef;
          border-radius: 16px;
          padding: 7px;
          display: flex;
          max-width: 590px;
          margin-top: 20px;
          box-shadow:
            0 10px 30px
            rgba(15,23,42,.06);
        }

        .customer-search-icon {
          width: 45px;
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .customer-search input {
          flex: 1;
          border: 0;
          outline: none;
          font-size: 14px;
          min-width: 0;
          color: #172033;
        }

        .customer-search input::placeholder {
          color: #9aa3b2;
        }

        .search-btn {
          border: 0;
          background: #2563eb;
          color: white;
          border-radius: 9px;
          padding: 11px 18px;
          font-weight: 700;
          cursor: pointer;
        }


        /* ================= CUSTOMER CARDS ================= */

        .customer-section {
          margin-top: 30px;
        }

        .customer-section-title {
          margin-bottom: 14px;
        }

        .customer-section-title h2 {
          margin: 0;
          font-size: 20px;
        }

        .customer-section-title p {
          margin: 5px 0 0;
          color: #8992a2;
          font-size: 13px;
        }

        .customer-cards {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
        }

        .customer-card {
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 16px;
          padding: 22px;
          text-decoration: none;
          color: #172033;
          transition: .2s ease;
        }

        .customer-card:hover {
          transform: translateY(-4px);
          border-color: #bfdbfe;
          box-shadow:
            0 12px 30px
            rgba(15,23,42,.07);
        }

        .customer-card-icon {
          width: 47px;
          height: 47px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-size: 22px;
          background: #eff6ff;
          margin-bottom: 15px;
        }

        .customer-card:nth-child(2)
          .customer-card-icon {
          background: #ecfdf5;
        }

        .customer-card:nth-child(3)
          .customer-card-icon {
          background: #f5f3ff;
        }

        .customer-card strong {
          display: block;
          font-size: 15px;
        }

        .customer-card p {
          color: #8992a2;
          font-size: 12px;
          line-height: 1.6;
          margin: 7px 0 0;
        }

        .customer-card-arrow {
          display: block;
          color: #2563eb;
          margin-top: 15px;
          font-size: 13px;
          font-weight: 700;
        }


        /* ================= CUSTOMER CATEGORIES ================= */

        .category-row {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .category-card {
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 13px;
          padding: 16px;
          text-decoration: none;
          color: #172033;
          transition: .2s ease;
        }

        .category-card:hover {
          border-color: #bfdbfe;
          background: #f8fbff;
          transform: translateY(-2px);
        }

        .category-card span {
          font-size: 22px;
        }

        .category-card strong {
          display: block;
          font-size: 13px;
          margin-top: 8px;
        }


        /* ================= MOBILE ================= */

        @media (max-width: 1150px) {

          .stats-grid,
          .quick-actions {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .category-row {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dashboard-main {
            padding: 30px;
          }

        }


        @media (max-width: 850px) {

          .dashboard-shell {
            display: block;
          }

          .dashboard-side {
            width: 100%;
            height: auto;
            min-height: auto;
            position: relative;
            border-right: 0;
            border-bottom: 1px solid #e7eaf0;
          }

          .dashboard-nav {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
          }

          .sidebar-bottom {
            margin-top: 15px;
          }

          .dashboard-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .home-btn {
            margin-left: auto;
          }

          .customer-hero {
            padding: 30px;
          }

          .customer-visual {
            display: none;
          }

        }


        @media (max-width: 550px) {

          .dashboard-main {
            padding: 22px 15px 40px;
          }

          .stats-grid,
          .quick-actions,
          .customer-cards,
          .category-row {
            grid-template-columns: 1fr;
          }

          .dashboard-nav {
            grid-template-columns: 1fr;
          }

          .manager-panel {
            padding: 16px;
          }

          .customer-hero {
            padding: 25px 20px;
          }

          .customer-hero h2 {
            font-size: 31px;
          }

          .customer-search {
            flex-wrap: wrap;
          }

          .customer-search input {
            min-height: 42px;
          }

          .search-btn {
            width: 100%;
          }

        }

      `}</style>

    </main>
  );
}


/* ================================================= */
/* CUSTOMER DASHBOARD */
/* ================================================= */

function CustomerDashboard() {

  return (
    <div className="customer-dashboard">

      {/* HERO */}

      <section className="customer-hero">

        <div className="customer-hero-content">

          <p className="eyebrow">
            PARTNEAR MARKETPLACE
          </p>

          <h2>
            Find the right hardware part,
            <br />
            near you.
          </h2>

          <p className="customer-hero-description">
            Search hardware products, check live
            availability and discover nearby shops
            with PartNear.
          </p>

          <a
            href="/#search"
            className="primary-btn"
          >
            🔎 Search Hardware Parts
          </a>


          {/* SEARCH */}

          <form
            action="/"
            method="get"
            className="customer-search"
          >

            <div className="customer-search-icon">
              🔎
            </div>

            <input
              type="text"
              name="q"
              placeholder="Search bearings, bolts, tools..."
            />

            <button
              type="submit"
              className="search-btn"
            >
              Search
            </button>

          </form>

        </div>


        {/* VISUAL */}

        <div className="customer-visual">

          <div className="customer-visual-icon">
            📍
          </div>

          <strong>
            Nearby
          </strong>

          <small>
            Hardware Shops
          </small>

        </div>

      </section>


      {/* QUICK ACCESS */}

      <section className="customer-section">

        <div className="customer-section-title">

          <p className="eyebrow">
            QUICK ACCESS
          </p>

          <h2>
            What are you looking for?
          </h2>

          <p>
            Start exploring PartNear in one click.
          </p>

        </div>


        <div className="customer-cards">

          <a
            href="/#search"
            className="customer-card"
          >

            <div className="customer-card-icon">
              🔎
            </div>

            <strong>
              Search Parts
            </strong>

            <p>
              Find bearings, tools, fasteners,
              electrical parts and more.
            </p>

            <span className="customer-card-arrow">
              Search now →
            </span>

          </a>


          <a
            href="/#shops"
            className="customer-card"
          >

            <div className="customer-card-icon">
              📍
            </div>

            <strong>
              Nearby Shops
            </strong>

            <p>
              Discover hardware shops around
              your current location.
            </p>

            <span className="customer-card-arrow">
              Explore shops →
            </span>

          </a>


          <a
            href="/"
            className="customer-card"
          >

            <div className="customer-card-icon">
              🏪
            </div>

            <strong>
              Browse Store
            </strong>

            <p>
              Explore available hardware products
              on the PartNear marketplace.
            </p>

            <span className="customer-card-arrow">
              Browse products →
            </span>

          </a>

        </div>

      </section>


      {/* POPULAR CATEGORIES */}

      <section className="customer-section">

        <div className="customer-section-title">

          <p className="eyebrow">
            POPULAR CATEGORIES
          </p>

          <h2>
            Explore hardware categories
          </h2>

        </div>


        <div className="category-row">

          <a
            href="/?q=bearing"
            className="category-card"
          >
            <span>⚙️</span>
            <strong>Bearings</strong>
          </a>

          <a
            href="/?q=fastener"
            className="category-card"
          >
            <span>🔩</span>
            <strong>Fasteners</strong>
          </a>

          <a
            href="/?q=electrical"
            className="category-card"
          >
            <span>🔌</span>
            <strong>Electrical</strong>
          </a>

          <a
            href="/?q=tools"
            className="category-card"
          >
            <span>🔧</span>
            <strong>Tools</strong>
          </a>

        </div>

      </section>

    </div>
  );
}


/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  warning,
  danger,
}) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div
        className="stat-value"
        style={{
          color: danger
            ? "#dc2626"
            : warning
            ? "#d97706"
            : "#172033",
        }}
      >
        {value}
      </div>

      <div className="stat-title">
        {title} · {subtitle}
      </div>

    </div>
  );
}


/* ================================================= */
/* SHOP STATUS */
/* ================================================= */

function ShopStatusBanner({
  status,
}) {

  if (!status) {

    return (
      <div className="shop-status status-neutral">

        <div className="shop-status-icon">
          🏪
        </div>

        <div>
          <strong>
            Shop not created
          </strong>

          <p>
            Create your shop profile to
            start adding products.
          </p>
        </div>

      </div>
    );
  }


  if (status === "pending") {

    return (
      <div className="shop-status status-pending">

        <div className="shop-status-icon">
          ⏳
        </div>

        <div>
          <strong>
            Shop Approval Pending
          </strong>

          <p>
            Your shop has been submitted and
            is waiting for admin approval.
          </p>
        </div>

      </div>
    );
  }


  if (status === "approved") {

    return (
      <div className="shop-status status-approved">

        <div className="shop-status-icon">
          ✓
        </div>

        <div>
          <strong>
            Shop Approved
          </strong>

          <p>
            Your shop is approved and visible
            to customers on PartNear.
          </p>
        </div>

      </div>
    );
  }


  if (status === "rejected") {

    return (
      <div className="shop-status status-rejected">

        <div className="shop-status-icon">
          ✕
        </div>

        <div>
          <strong>
            Shop Rejected
          </strong>

          <p>
            Your shop is currently not visible
            to customers. Please contact the
            administrator.
          </p>
        </div>

      </div>
    );
  }


  return null;
}