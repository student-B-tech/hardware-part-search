"use client";

import { useState } from "react";

export default function DashboardMobileNav({
  isShopkeeper,
  name,
  role,
}) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="mobile-dashboard-bar">
        <a href="/" className="mobile-brand">
          <span className="mobile-brand-icon">⚙</span>

          <span className="mobile-brand-text">
            <strong>PartNear</strong>
            <small>
              {isShopkeeper
                ? "SHOP PLATFORM"
                : "HARDWARE MARKETPLACE"}
            </small>
          </span>
        </a>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {/* OVERLAY */}
      {open && (
        <button
          type="button"
          className="mobile-nav-overlay"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`mobile-nav-drawer ${
          open ? "open" : ""
        }`}
      >
        <div className="mobile-nav-header">
          <a
            href="/"
            className="mobile-brand"
            onClick={closeMenu}
          >
            <span className="mobile-brand-icon">
              ⚙
            </span>

            <span className="mobile-brand-text">
              <strong>PartNear</strong>
              <small>
                {isShopkeeper
                  ? "SHOP PLATFORM"
                  : "HARDWARE MARKETPLACE"}
              </small>
            </span>
          </a>

          <button
            type="button"
            className="mobile-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="mobile-sidebar-label">
          MAIN MENU
        </div>

        <nav className="mobile-dashboard-nav">
          <a
            href="/dashboard"
            className="active"
            onClick={closeMenu}
          >
            <span>▦</span>
            Dashboard
          </a>

          {isShopkeeper ? (
            <>
              <a
                href="#inventory"
                onClick={closeMenu}
              >
                <span>📦</span>
                Inventory
              </a>

              <a
                href="/dashboard/billing"
                onClick={closeMenu}
              >
                <span>🧾</span>
                Billing
              </a>

              <a
                href="/dashboard/bills"
                onClick={closeMenu}
              >
                <span>📋</span>
                Bill History
              </a>

              <a
                href="/dashboard/scanner"
                onClick={closeMenu}
              >
                <span>🤖</span>
                AI Bill Scanner
              </a>

              <a
                href="/dashboard/reports"
                onClick={closeMenu}
              >
                <span>📈</span>
                Sales & Reports
              </a>

              <a
                href="#"
                onClick={closeMenu}
              >
                <span>👥</span>
                Customers
              </a>
            </>
          ) : (
            <>
              <a
                href="/#search"
                onClick={closeMenu}
              >
                <span>🔎</span>
                Search Parts
              </a>

              <a
                href="/#shops"
                onClick={closeMenu}
              >
                <span>📍</span>
                Nearby Shops
              </a>

              <a
                href="/"
                onClick={closeMenu}
              >
                <span>🏪</span>
                Browse Store
              </a>
            </>
          )}
        </nav>

        <div className="mobile-sidebar-bottom">
          <div className="mobile-user-mini">
            <div className="mobile-user-avatar">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{name}</strong>
              <small>{role}</small>
            </div>
          </div>

          <form
            action="/api/auth/logout"
            method="post"
          >
            <button
              type="submit"
              className="mobile-logout-btn"
            >
              ↪ Sign out
            </button>
          </form>
        </div>
      </aside>

      <style jsx>{`
        .mobile-dashboard-bar {
          display: none;
        }

        .mobile-nav-drawer {
          display: none;
        }

        .mobile-nav-overlay {
          display: none;
        }

        @media (max-width: 800px) {
          .mobile-dashboard-bar {
            position: sticky;
            top: 0;
            z-index: 80;

            width: 100%;
            height: 66px;

            padding: 0 18px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            background: rgba(255, 255, 255, 0.94);

            backdrop-filter: blur(18px);

            border-bottom: 1px solid #e8ecf2;

            box-shadow:
              0 5px 20px
              rgba(15, 23, 42, 0.04);
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;

            color: #111827;
            text-decoration: none;
          }

          .mobile-brand-icon {
            width: 39px;
            height: 39px;

            display: grid;
            place-items: center;

            border-radius: 12px;

            color: #ffffff;

            background:
              linear-gradient(
                135deg,
                #2563eb,
                #4f46e5
              );

            box-shadow:
              0 8px 20px
              rgba(37, 99, 235, 0.2);

            font-size: 18px;
          }

          .mobile-brand-text {
            display: flex;
            flex-direction: column;
          }

          .mobile-brand-text strong {
            font-size: 17px;
            line-height: 19px;

            letter-spacing: -0.3px;
          }

          .mobile-brand-text small {
            margin-top: 2px;

            color: #98a2b3;

            font-size: 7px;
            font-weight: 800;

            letter-spacing: 1px;
          }

          .mobile-menu-btn {
            width: 42px;
            height: 42px;

            display: grid;
            place-items: center;

            border: 1px solid #e4e8ef;
            border-radius: 12px;

            background: #ffffff;

            color: #111827;

            font-size: 21px;

            cursor: pointer;

            box-shadow:
              0 5px 15px
              rgba(15, 23, 42, 0.05);
          }

          .mobile-menu-btn:active {
            transform: scale(0.96);
          }

          .mobile-nav-overlay {
            display: block;

            position: fixed;
            inset: 0;

            width: 100%;
            height: 100%;

            border: 0;

            background:
              rgba(15, 23, 42, 0.42);

            backdrop-filter: blur(2px);

            z-index: 90;

            cursor: pointer;
          }

          .mobile-nav-drawer {
            display: flex;

            position: fixed;

            top: 0;
            left: 0;
            bottom: 0;

            width: min(320px, 88vw);

            padding: 18px;

            flex-direction: column;

            background: #ffffff;

            z-index: 100;

            box-shadow:
              18px 0 45px
              rgba(15, 23, 42, 0.16);

            transform: translateX(-105%);

            transition:
              transform 0.28s
              cubic-bezier(.4,0,.2,1);
          }

          .mobile-nav-drawer.open {
            transform: translateX(0);
          }

          .mobile-nav-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding-bottom: 18px;

            border-bottom:
              1px solid #edf0f4;
          }

          .mobile-close-btn {
            width: 39px;
            height: 39px;

            display: grid;
            place-items: center;

            border: 1px solid #e7eaf0;
            border-radius: 11px;

            background: #f8fafc;

            color: #111827;

            font-size: 24px;

            cursor: pointer;
          }

          .mobile-close-btn:hover {
            background: #f1f5f9;
          }

          .mobile-sidebar-label {
            margin: 25px 8px 10px;

            color: #98a2b3;

            font-size: 10px;
            font-weight: 800;

            letter-spacing: 1.2px;
          }

          .mobile-dashboard-nav {
            display: flex;
            flex-direction: column;

            gap: 5px;
          }

          .mobile-dashboard-nav a {
            min-height: 47px;

            display: flex;
            align-items: center;

            gap: 12px;

            padding: 0 13px;

            border-radius: 12px;

            color: #667085;

            text-decoration: none;

            font-size: 14px;
            font-weight: 650;

            transition: 0.2s ease;
          }

          .mobile-dashboard-nav a span {
            width: 24px;

            text-align: center;

            font-size: 17px;
          }

          .mobile-dashboard-nav a:hover {
            color: #2563eb;
            background: #f3f6ff;
          }

          .mobile-dashboard-nav a.active {
            color: #2563eb;

            background:
              linear-gradient(
                90deg,
                #eaf1ff,
                #f4f7ff
              );

            box-shadow:
              inset 3px 0 0 #2563eb;
          }

          .mobile-sidebar-bottom {
            margin-top: auto;

            padding-top: 17px;

            border-top:
              1px solid #edf0f4;
          }

          .mobile-user-mini {
            display: flex;
            align-items: center;

            gap: 10px;

            margin-bottom: 12px;
          }

          .mobile-user-avatar {
            width: 41px;
            height: 41px;

            display: grid;
            place-items: center;

            border-radius: 13px;

            background:
              linear-gradient(
                135deg,
                #dbeafe,
                #e0e7ff
              );

            color: #315dcc;

            font-weight: 800;
          }

          .mobile-user-mini strong {
            display: block;

            color: #111827;

            font-size: 13px;
          }

          .mobile-user-mini small {
            display: block;

            margin-top: 2px;

            color: #98a2b3;

            font-size: 11px;

            text-transform: capitalize;
          }

          .mobile-logout-btn {
            width: 100%;
            height: 44px;

            border:
              1px solid #e5e7eb;

            border-radius: 11px;

            background: #ffffff;

            color: #dc2626;

            font-size: 13px;
            font-weight: 700;

            cursor: pointer;
          }

          .mobile-logout-btn:hover {
            background: #fff1f2;
            border-color: #fecdd3;
          }
        }
      `}</style>
    </>
  );
}
