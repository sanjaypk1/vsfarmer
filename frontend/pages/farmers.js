import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Farmers() {
  const [farmers, setFarmers] = useState([])

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/farmers')
      .then(r => r.json())
      .then(setFarmers)
  }, [])

  return (
    <main>
      <h2>Farmers & stores</h2>
      <p>Browse farms and the produce they sell.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {farmers.map(f => (
          <li key={f.id} style={{ marginBottom: 18, padding: 14, border: '1px solid #e5e7eb', borderRadius: 10 }}>
            <h3>{f.name}</h3>
            <p>{f.bio || 'No bio provided yet.'}</p>
            <p>Location: {f.location || 'Local'}</p>
            <p>Contact: {f.sellerEmail}</p>
            <h4>Products</h4>
            <ul>
              {f.products.map(p => (
                <li key={p.id}>{p.name} — ₹{(p.priceCents / 100).toFixed(2)} — {p.quantity} available</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p><Link href="/products">Back to products</Link></p>
    </main>
  )
}
