'use client';

import { useState } from 'react';

const emptyProduct = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  price: '',
  quantity: '',
};

export default function ShopkeeperManager({
  initialShop,
  initialProducts,
}) {
  const [shop, setShop] = useState(
    initialShop || {
      name: '',
      address: '',
      city: '',
      phone: '',
      latitude: null,
      longitude: null,
    }
  );

  const [products, setProducts] = useState(initialProducts || []);

  const [shopForm, setShopForm] = useState(
    initialShop || {
      name: '',
      address: '',
      city: '',
      phone: '',
      latitude: null,
      longitude: null,
    }
  );

  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const flash = (msg) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const fail = (msg) => {
    setError(msg);
    setMessage('');
  };

  // =========================
  // GET CURRENT LOCATION
  // =========================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      fail('Location is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setError('');
    setMessage('');

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
        flash('Location detected. Now save the shop profile.');
      },
      (err) => {
        setLocationLoading(false);

        if (err.code === 1) {
          fail(
            'Location permission denied. Please allow location access in your browser.'
          );
        } else if (err.code === 2) {
          fail('Unable to detect your location.');
        } else if (err.code === 3) {
          fail('Location request timed out. Please try again.');
        } else {
          fail('Unable to get your current location.');
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
      const res = await fetch('/api/shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to save shop');
      }

      setShop(data.shop);
      setShopForm(data.shop);

      flash('Shop profile saved successfully.');
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

    setBusy(true);

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };

      const res = await fetch('/api/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(
          data.error || 'Unable to save product'
        );
      }

      setProducts((prev) =>
        editingId
          ? prev.map((p) =>
              p.id === data.product.id
                ? data.product
                : p
            )
          : [data.product, ...prev]
      );

      setProductForm(emptyProduct);

      const wasEditing = editingId;

      setEditingId(null);

      flash(
        wasEditing
          ? 'Product updated.'
          : 'Product added.'
      );
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
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      brand: p.brand || '',
      price: String(p.price),
      quantity: String(
        p.inventory?.quantity ?? 0
      ),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) {
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return fail(
          data.error || 'Unable to delete product'
        );
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== id)
      );

      flash('Product deleted.');
    } catch (e) {
      fail('Unable to delete product.');
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
    (sum, p) =>
      sum + (p.inventory?.quantity || 0),
    0
  );

  const lowStock = products.filter((p) => {
    const q = p.inventory?.quantity || 0;
    return q > 0 && q <= 5;
  }).length;

  const outOfStock = products.filter((p) => {
    return (p.inventory?.quantity || 0) === 0;
  }).length;

  const hasLocation =
    shopForm?.latitude !== null &&
    shopForm?.latitude !== undefined &&
    shopForm?.longitude !== null &&
    shopForm?.longitude !== undefined;

  return (
    <div className="manager">

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
          <span>Products</span>
          <b>{products.length}</b>
        </div>

        <div className="mini-stat">
          <span>Total Stock</span>
          <b>{totalStock}</b>
        </div>

        <div className="mini-stat">
          <span>Low Stock</span>
          <b>{lowStock}</b>
        </div>

        <div className="mini-stat">
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

          <div className="section-head">

            <div>
              <p className="eyebrow">
                SHOP PROFILE
              </p>

              <h2>
                {shop?.name
                  ? 'Your shop details'
                  : 'Create your shop'}
              </h2>
            </div>

            <span className="soft-badge">
              ● {shop?.status || 'pending'}
            </span>

          </div>

          <form
            className="manage-form"
            onSubmit={saveShop}
          >

            <label>
              Shop name

              <input
                value={shopForm.name || ''}
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
                value={shopForm.phone || ''}
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
                value={shopForm.address || ''}
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
                value={shopForm.city || ''}
                onChange={(e) =>
                  setShopForm({
                    ...shopForm,
                    city: e.target.value,
                  })
                }
                placeholder="Kanpur"
              />
            </label>

            {/* =========================
                LOCATION
            ========================= */}

            <div
              style={{
                marginTop: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                background: '#fafafa',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '10px',
                }}
              >

                <div>
                  <strong>
                    📍 Shop Location
                  </strong>

                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginTop: '4px',
                    }}
                  >
                    Used to calculate distance
                    from customers.
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
                style={{
                  width: '100%',
                  marginBottom: '10px',
                }}
              >
                {locationLoading
                  ? '📍 Detecting location...'
                  : '📍 Use my current location'}
              </button>

              {hasLocation && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                  }}
                >
                  Latitude:{' '}
                  {Number(shopForm.latitude).toFixed(6)}
                  <br />
                  Longitude:{' '}
                  {Number(shopForm.longitude).toFixed(6)}
                </div>
              )}

            </div>

            <button
              className="primary-btn"
              disabled={busy}
            >
              {busy
                ? 'Saving...'
                : 'Save shop profile'}
            </button>

          </form>

        </section>

        {/* =========================
            ADD PRODUCT
        ========================= */}

        <section className="manage-card">

          <div className="section-head">

            <div>

              <p className="eyebrow">
                {editingId
                  ? 'EDIT PRODUCT'
                  : 'ADD PRODUCT'}
              </p>

              <h2>
                {editingId
                  ? 'Update inventory item'
                  : 'Add hardware part'}
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
                disabled={
                  busy || !shop?.id
                }
              >
                {busy
                  ? 'Saving...'
                  : editingId
                  ? 'Update product'
                  : 'Add to inventory'}
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

        </section>

      </div>

      {/* =========================
          PRODUCT TABLE
      ========================= */}

      <section className="manage-card product-table-card">

        <div className="section-head">

          <div>

            <p className="eyebrow">
              INVENTORY
            </p>

            <h2>
              Your hardware parts
            </h2>

          </div>

          <span className="soft-badge">
            {products.length} items
          </span>

        </div>

        {products.length === 0 ? (

          <div className="empty-state">

            <div>📦</div>

            <h3>
              No products yet
            </h3>

            <p>
              Add your first hardware part above.
              It will be ready for customer search.
            </p>

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
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {products.map((p) => {

                  const q =
                    p.inventory?.quantity ?? 0;

                  return (
                    <tr key={p.id}>

                      <td>
                        <b>{p.name}</b>

                        <small>
                          {p.brand || 'No brand'}
                        </small>
                      </td>

                      <td>
                        {p.sku || '—'}
                      </td>

                      <td>
                        {p.category || '—'}
                      </td>

                      <td>
                        ₹
                        {Number(
                          p.price
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </td>

                      <td>
                        <b>{q}</b>
                      </td>

                      <td>

                        <span
                          className={`stock-badge ${
                            q === 0
                              ? 'out'
                              : q <= 5
                              ? 'low'
                              : 'ok'
                          }`}
                        >
                          {q === 0
                            ? 'Out of stock'
                            : q <= 5
                            ? 'Low stock'
                            : 'Available'}
                        </span>

                      </td>

                      <td>

                        <div className="table-actions">

                          <button
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

      </section>

    </div>
  );
}