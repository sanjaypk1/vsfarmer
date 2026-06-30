import { useEffect, useState } from 'react'
import Link from 'next/link'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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
        return fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      })
      .then(r => r.json())
      .then(data => setOrders(data || []))
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
      <p>Please <Link href="/login">login</Link> to access your dashboard.</p>
    </main>
  )

  return (
    <main>
      <h2>Dashboard</h2>
      <p>Welcome back, {user.email}! Role: {user.role}</p>
      {user.role === 'FARMER' && (
        <section style={{ marginTop: 20 }}>
          <h3>Your farm</h3>
          <p>Name: {user.farmer?.name}</p>
          <p>Location: {user.farmer?.location || 'Not set'}</p>
          <p>{user.farmer?.bio || 'No bio yet.'}</p>
          <p><Link href="/add-product">Add new product</Link></p>
        </section>
      )}
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
