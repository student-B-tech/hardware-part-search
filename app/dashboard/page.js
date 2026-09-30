import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth';
import { getDb } from '../../lib/db';
import ShopkeeperManager from './ShopkeeperManager';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isShopkeeper = session.role === 'shopkeeper';
  const db = await getDb();

  let shop = null;
  let products = [];
  let stats = { products: 0, stock: 0, lowStock: 0, outOfStock: 0 };

  if (isShopkeeper) {
    shop = await db.shop.findUnique({ where: { ownerId: String(session.userId) } });
    if (shop) {
      products = await db.product.findMany({
        where: { shopId: shop.id },
        include: { inventory: true },
        orderBy: { updatedAt: 'desc' },
      });
      stats.products = products.length;
      stats.stock = products.reduce((s,p) => s + (p.inventory?.quantity || 0), 0);
      stats.lowStock = products.filter(p => (p.inventory?.quantity || 0) > 0 && (p.inventory?.quantity || 0) <= 5).length;
      stats.outOfStock = products.filter(p => (p.inventory?.quantity || 0) === 0).length;
    }
  }

  const safeProducts = products.map(p => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    inventory: p.inventory ? { ...p.inventory, updatedAt: p.inventory.updatedAt.toISOString() } : null,
  }));

  return <main className="dashboard-shell">
    <aside className="dashboard-side">
      <a href="/" className="brand"><span className="brand-icon">⚙</span><span><b>PartNear</b><small>SHOP PLATFORM</small></span></a>
      <nav><a className="active">▦ Dashboard</a><a href="#inventory">📦 Inventory</a><a>🧾 Billing</a><a>🤖 AI Bill Scanner</a><a>📈 Sales & Reports</a><a>👥 Customers</a></nav>
      <form action="/api/auth/logout" method="post"><button>↪ Sign out</button></form>
    </aside>
    <section className="dashboard-main">
      <div className="dash-top">
        <div><p className="eyebrow">{isShopkeeper ? 'SHOPKEEPER DASHBOARD' : 'CUSTOMER DASHBOARD'}</p><h1>Welcome, {session.name}</h1><p>{isShopkeeper ? 'Manage your shop, products and live inventory from one place.' : 'Search nearby hardware parts and track your reservations.'}</p></div>
        <span className="session-pill">● {session.role}</span>
      </div>
      {isShopkeeper ? <ShopkeeperManager initialShop={shop} initialProducts={safeProducts} /> :
        <div className="dash-grid"><div className="panel wide-panel"><div><p className="eyebrow">READY TO SEARCH</p><h2>Find your next hardware part.</h2><p>Search nearby shops, compare availability and go directly to the right store.</p></div><a href="/#shops" className="primary-btn">Find nearby parts →</a></div></div>}
    </section>
  </main>;
}
