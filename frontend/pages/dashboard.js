import { useEffect, useState } from 'react'
import Link from 'next/link'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const totalProducts = products.length
  const openOrders = orders.filter(order => order.status !== 'FULFILLED' && order.status !== 'CANCELLED').length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error)
        }
        setUser(data)
        if (data.role === 'FARMER') {
          return Promise.all([
            fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
            fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/products?farmerId=' + data.farmer?.id, { headers: { Authorization: `Bearer ${token}` } })
          ])
        }
        return [fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/orders', { headers: { Authorization: `Bearer ${token}` } })]
      })
      .then(([ordersRes, productsRes]) => Promise.all([ordersRes.json(), productsRes ? productsRes.json() : Promise.resolve([])]))
      .then(([ordersData, productsData]) => {
        setOrders(ordersData || [])
        setProducts(productsData || [])
      })
      .catch(() => {
        setUser(null)
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    const token = getToken()
    if (!token) return
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    })
    const updated = await res.json()
    if (updated.error) {
      alert(updated.error)
      return
    }
    setOrders((prev) => prev.map(order => order.id === updated.id ? updated : order))
  }

  if (loading) return <main><p>Loading dashboard…</p></main>

  if (!user) return (
    <main>
      <h2>Dashboard</h2>
      <p>Please login or register to access your dashboard.</p>
      <div style={{ display: 'grid', gap: 10, maxWidth: 320 }}>
        <Link href="/auth" className="btn btn-primary">Login or Register</Link>
        <Link href="/register" className="btn btn-secondary">Register as buyer</Link>
        <Link href="/register?role=FARMER" className="btn btn-secondary">Register as seller</Link>
      </div>
    </main>
  )

  return (
    <main>
      <section className="page-card">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Welcome back, {user.email}</h2>
            <p className="section-copy">Manage your store, products, and orders from one simple seller workspace.</p>
          </div>
          <div className="hero-actions">
            <Link href="/add-product" className="btn btn-primary">Add product</Link>
            <Link href="/products" className="btn btn-secondary">Browse marketplace</Link>
          </div>
        </div>

        <div className="metrics-grid">
          <article className="stats-card">
            <p className="eyebrow">Products</p>
            <h3>{totalProducts}</h3>
            <p>{user.role === 'FARMER' ? 'Your active store items' : 'Items you are tracking'}</p>
          </article>
          <article className="stats-card">
            <p className="eyebrow">Orders</p>
            <h3>{orders.length}</h3>
            <p>{openOrders} open orders</p>
          </article>
          <article className="stats-card">
            <p className="eyebrow">Revenue</p>
            <h3>₹{(totalRevenue / 100).toFixed(2)}</h3>
            <p>Total sales captured</p>
          </article>
        </div>

        {user.role === 'FARMER' && (
          <section className="seller-summary">
            <div className="seller-banner">
              <div>
                <p className="eyebrow">Your store</p>
                <h3>{user.farmer?.name}</h3>
                <p>{user.farmer?.bio || 'Share your farm story and products to attract buyers.'}</p>
              </div>
              <div className="seller-card-details">
                <div>
                  <strong>Location</strong>
                  <p>{user.farmer?.location || 'Not set'}</p>
                </div>
                <div>
                  <strong>Categories</strong>
                  <p>{user.farmer?.sellingCategories ? user.farmer.sellingCategories.split(',').join(', ') : 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="store-products">
              <h4>Store products</h4>
              {products.length ? (
                <div className="card-grid">
                  {products.map(product => (
                    <article className="display-card" key={product.id}>
                      <div className="card-top">
                        <span className="pill">{product.category}</span>
                      </div>
                      <h4>{product.name}</h4>
                      <p>{product.description || 'No description yet.'}</p>
                      <div className="meta-list">
                        <span>₹{(product.priceCents / 100).toFixed(2)} / {product.unit}</span>
                        <span>{product.quantity} available</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p>You have no products yet. Add your first product to start selling.</p>
              )}
            </div>
          </section>
        )}
      </section>
      <section style={{ marginTop: 20 }}>
        <h3>Your orders</h3>
        {!orders.length ? <p>No orders found.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {orders.map(order => (
              <li key={order.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <p>Order #{order.id} — Status: {order.status}</p>
                <p>Total: ₹{(order.totalCents / 100).toFixed(2)}</p>
                {order.deliveryType && <p>Delivery: {order.deliveryType}{order.deliveryType === 'DELIVERY' ? ` — ${order.deliveryAddress}` : ''}</p>}
                <p>Items:</p>
                <ul>
                  {order.items.map(item => (
                    <li key={item.id}>{item.product.name} × {item.quantity} — ₹{(item.unitPrice/100).toFixed(2)}</li>
                  ))}
                </ul>
                {(user.role === 'ADMIN' || user.role === 'FARMER') && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => updateStatus(order.id, 'PAID')} style={{ marginRight: 8 }}>Mark PAID</button>
                    <button onClick={() => updateStatus(order.id, 'FULFILLED')} style={{ marginRight: 8 }}>Mark FULFILLED</button>
                    <button onClick={() => updateStatus(order.id, 'CANCELLED')}>Cancel</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
