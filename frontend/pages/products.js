import { useEffect, useState } from 'react';
import Link from 'next/link';

function getCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('farmers-market-cart', JSON.stringify(cart));
}

export default function Products() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/products' + query)
      .then(r => r.json())
      .then(setList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const cart = getCart();
    const existing = cart.find(item => item.productId === product.id);
    const next = existing
      ? cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { productId: product.id, name: product.name, unitPrice: product.priceCents, quantity: 1 }];
    saveCart(next);
    alert('Added to cart');
  };

  return (
    <main>
      <section className="page-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h2>Products</h2>
          </div>
          <Link href="/cart" className="text-link">View cart</Link>
        </div>

        <div className="search-row">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search produce" />
          <button type="button" onClick={fetchProducts}>Search</button>
        </div>

        <div className="card-grid">
          {list.map((p) => (
            <article className="display-card" key={p.id}>
              <div className="card-top">
                <span className="pill">{p.unit}</span>
                <span className="pill muted">In stock</span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="meta-list">
                <span>Farm: {p.farmer?.name || 'Local grower'}</span>
                <span>₹{(p.priceCents / 100).toFixed(2)} / {p.unit}</span>
                <span>{p.quantity} available</span>
              </div>
              <button type="button" onClick={() => addToCart(p)}>Add to cart</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
