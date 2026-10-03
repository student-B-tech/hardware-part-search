"use client";

import { useState } from "react";

export default function DashboardMobileNav({ isShopkeeper, name, role }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-dashboard-bar">
        <a href="/" className="mobile-brand">
          <span className="mobile-brand-icon">⚙</span>

          <span>
            <b>PartNear</b>
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
          aria-label="Open dashboard menu"
        >
          ☰
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <button
          type="button"
          className="mobile-nav-overlay"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`mobile-nav-drawer ${open ? "open" : ""}`}>
        <div className="mobile-nav-header">
          <a href="/" className="mobile-brand" onClick={closeMenu}>
            <span className="mobile-brand-icon">⚙</span>

            <span>
              <b>PartNear</b>
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
            aria-label="Close dashboard menu"
          >
            ×
          </button>
        </div>

        <div className="mobile-sidebar-label">
          MAIN MENU
        </div>

        <nav className="mobile-dashboard-nav">
          <a href="/dashboard" className="active" onClick={closeMenu}>
            <span>▦</span>
            Dashboard
          </a>

          {isShopkeeper ? (
            <>
              <a href="/dashboard#inventory" onClick={closeMenu}>
                <span>📦</span>
                Inventory
              </a>

              <a href="/dashboard/billing" onClick={closeMenu}>
                <span>🧾</span>
                Billing
              </a>

              <a href="/dashboard/bills" onClick={closeMenu}>
                <span>📋</span>
                Bill History
              </a>

              <a href="/dashboard/scanner" onClick={closeMenu}>
                <span>🤖</span>
                AI Bill Scanner
              </a>

              <a href="/dashboard/reports" onClick={closeMenu}>
                <span>📈</span>
                Sales & Reports
              </a>

              <a href="/dashboard#customers" onClick={closeMenu}>
                <span>👥</span>
                Customers
              </a>
            </>
          ) : (
            <>
              <a href="/#search" onClick={closeMenu}>
                <span>🔎</span>
                Search Parts
              </a>

              <a href="/#shops" onClick={closeMenu}>
                <span>📍</span>
                Nearby Shops
              </a>

              <a href="/" onClick={closeMenu}>
                <span>🏪</span>
                Browse Store
              </a>
            </>
          )}
        </nav>

        {/* User */}
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

          <form action="/api/auth/logout" method="post">
            <button className="mobile-logout-btn" type="submit">
              <span>↪</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}