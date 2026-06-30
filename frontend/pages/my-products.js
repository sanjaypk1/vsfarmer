import { useEffect, useState } from 'react'
import Link from 'next/link'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function MyProducts() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setError('Please login to view your products.')
      return
    }
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setUser(data)
        if (data.role !== 'FARMER') throw new Error('Only farmers can manage products.')
        return fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/api/products?farmerId=${data.farmer?.id}`, { headers: { Authorization: `Bearer ${token}` } })
      })
      .then(r => r.json())
      .then(setProducts)
      .catch(err => setError(err.message || 'Unable to load products'))
  }, [])

  if (error) return (
    <main style={{ padding: 20 }}>
      <h2>My Products</h2>
      <p>{error}</p>
      <p><Link href="/login">Login</Link></p>
    </main>
  )

  return (
    <main style={{ padding: 20 }}>
      <h2>My Products</h2>
      <p><Link href="/add-product">Add a new product</Link></p>
      {products.length === 0 ? (
        <p>No products found. Add one to start selling.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map(p => (
            <li key={p.id} style={{ marginBottom: 16, padding: 14, border: '1px solid #e5e7eb', borderRadius: 10 }}>
              <h3>{p.name}</h3>
              <p>{p.description || 'No description yet.'}</p>
              <p>Price: ₹{(p.priceCents / 100).toFixed(2)} per {p.unit}</p>
              <p>Stock: {p.quantity}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
