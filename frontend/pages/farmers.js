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
      <section className="page-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Community</p>
            <h2>Farmers & stores</h2>
          </div>
          <Link href="/products" className="text-link">Back to products</Link>
        </div>

        <div className="card-grid">
          {farmers.map(f => (
            <article className="display-card" key={f.id}>
              <h3>{f.name}</h3>
              <p>{f.bio || 'No bio provided yet.'}</p>
              <div className="meta-list">
                <span>Location: {f.location || 'Local'}</span>
                <span>Contact: {f.sellerEmail}</span>
              </div>
              <div className="mini-list">
                {f.products?.map(p => (
                  <div key={p.id} className="mini-item">
                    <span>{p.name}</span>
                    <strong>₹{(p.priceCents / 100).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
