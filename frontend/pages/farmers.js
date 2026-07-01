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
            <h2>Verified farmers & stores</h2>
            <p className="section-copy">Explore trusted seller storefronts with product collections, categories, and farm details.</p>
          </div>
          <Link href="/products" className="text-link">Back to products</Link>
        </div>

        <div className="seller-grid">
          {farmers.map(f => (
            <article className="seller-card" key={f.id}>
              <div className="seller-header">
                <div>
                  <span className="eyebrow">Seller</span>
                  <h3>{f.name}</h3>
                  <p>{f.location || 'Local region'}</p>
                </div>
                <div className="seller-contact">
                  <span>{f.sellerEmail}</span>
                </div>
              </div>

              <div className="seller-stats">
                <span>{f.products?.length || 0} products</span>
                <span>{f.sellingCategories?.length ? `${f.sellingCategories.length} categories` : 'General store'}</span>
              </div>

              <div className="tag-row">
                {f.sellingCategories?.map(cat => (
                  <span key={cat} className="pill">{cat}</span>
                ))}
              </div>

              <p className="section-copy">{f.bio || 'Quality farm products delivered with care.'}</p>

              <div className="store-highlights">
                <p className="featured-title">Featured products</p>
                <div className="product-list">
                  {f.products?.slice(0, 4).map(p => (
                    <div key={p.id} className="product-chip">
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.category}</span>
                      </div>
                      <strong>₹{(p.priceCents / 100).toFixed(2)}</strong>
                    </div>
                  )) || <p>No products available yet.</p>}
                </div>
              </div>

              <Link href={`/farmer/${f.id}`} className="btn btn-secondary">Visit storefront</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
