import Link from 'next/link'

const categories = [
  { name: 'Seeds', icon: '🌱' },
  { name: 'Pesticides', icon: '🛡️' },
  { name: 'Fertilizers', icon: '🌾' },
  { name: 'Tools', icon: '🧰' },
]

const offers = [
  { title: 'High yield tomato seeds', price: '₹ 499', badge: '32% OFF' },
  { title: 'Organic growth booster', price: '₹ 799', badge: 'New' },
  { title: 'Battery sprayer', price: '₹ 2,499', badge: 'Top Rated' },
]

export default function Home() {
  return (
    <main className="home-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Trusted by Indian farmers</p>
          <h1>Agri essentials for every season.</h1>
          <p>Discover crop protection, seeds, nutrition and smart tools at farm-friendly prices.</p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">Shop now</Link>
            <Link href="/farmers" className="btn btn-secondary">Meet farmers</Link>
            <Link href="/auth" className="btn btn-secondary">Login / Register</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-stat">
            <strong>400+</strong>
            <span>Trusted brands</span>
          </div>
          <div className="hero-stat">
            <strong>30M+</strong>
            <span>Farmers served</span>
          </div>
          <div className="hero-stat">
            <strong>9K+</strong>
            <span>Products available</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Shop by category</h2>
          <Link href="/products">View all</Link>
        </div>
        <div className="category-grid">
          {categories.map((item) => (
            <Link href={`/products?category=${item.name.toUpperCase()}`} key={item.name} className="category-card">
              <span className="category-icon">{item.icon}</span>
              <h3>{item.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Today's offers</h2>
          <Link href="/products">See more</Link>
        </div>
        <div className="offer-grid">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.title}>
              <span className="offer-badge">{offer.badge}</span>
              <h3>{offer.title}</h3>
              <p>{offer.price}</p>
              <Link href="/products" className="text-link">Add to cart</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
