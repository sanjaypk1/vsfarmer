import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function FarmerStorefront() {
  const router = useRouter()
  const { id } = router.query
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/api/farmers/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          return setSeller(null)
        }
        setSeller(data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main><p>Loading seller storefront…</p></main>
  if (!seller) return <main><p>Seller storefront not found.</p></main>

  return (
    <main>
      <section className="page-card storefront-hero">
        <div className="page-header">
          <div>
            <p className="eyebrow">Storefront</p>
            <h2>{seller.name}</h2>
            <p className="section-copy">{seller.bio || 'Premium products from a trusted farm seller.'}</p>
          </div>
          <Link href="/farmers" className="text-link">Back to seller directory</Link>
        </div>
        <div className="hero-badges">
          <span className="pill">{seller.location || 'Local region'}</span>
          <span className="pill">{seller.sellingCategories?.length ? seller.sellingCategories.join(', ') : 'General'}</span>
          <span className="pill">{seller.products?.length || 0} products</span>
        </div>
      </section>

      <section className="section-block" style={{ marginTop: 20 }}>
        <div className="section-heading">
          <h2>Available products</h2>
          <Link href={`/products?farmerId=${seller.id}`} className="text-link">View all store products</Link>
        </div>
        <div className="card-grid">
          {seller.products?.map((product) => (
            <article key={product.id} className="product-card">
              <div className="card-top">
                <span className="pill">{product.category || 'OTHER'}</span>
              </div>
              <h4>{product.name}</h4>
              <p>{product.description || 'No description available.'}</p>
              <div className="meta-list">
                <span>₹{(product.priceCents / 100).toFixed(2)} / {product.unit}</span>
                <span>{product.quantity} available</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
