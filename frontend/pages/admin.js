import { useEffect, useState } from 'react'
import Link from 'next/link'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return

    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setOrders(data)
      })
      .catch(err => setError(err.message))

    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        if (data.role !== 'ADMIN') throw new Error('Admin access only')
      })
      .catch(err => setError(err.message))
  }, [])

  const updateStatus = async (orderId, status) => {
    const token = getToken()
    if (!token) return
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); return }
    setOrders(prev => prev.map(order => order.id === data.id ? data : order))
  }

  if (error) return <main><h2>Admin panel</h2><p>{error}</p><p><Link href="/login">Login</Link></p></main>

  return (
    <main>
      <h2>Admin panel</h2>
      <p>Only admin users can access this page.</p>
      <section style={{ marginTop: 20 }}>
        <h3>Orders</h3>
        {!orders.length ? <p>No orders yet.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {orders.map(order => (
              <li key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <p><strong>Order #{order.id}</strong> — {order.status}</p>
                <p>Total: ₹{(order.totalCents / 100).toFixed(2)}</p>
                <p>Customer: {order.customerId}</p>
                <ul>
                  {order.items.map(item => (
                    <li key={item.id}>{item.product.name} × {item.quantity} — ₹{(item.unitPrice / 100).toFixed(2)}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => updateStatus(order.id, 'PAID')} style={{ marginRight: 8 }}>PAID</button>
                  <button onClick={() => updateStatus(order.id, 'FULFILLED')} style={{ marginRight: 8 }}>FULFILLED</button>
                  <button onClick={() => updateStatus(order.id, 'CANCELLED')}>CANCELLED</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p><Link href="/dashboard">Back to dashboard</Link></p>
    </main>
  )
}
