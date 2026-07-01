import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function getCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('farmers-market-cart', JSON.stringify(cart));
}

export default function Products() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const fetchProducts = (selectedCategory = category, searchText = search) => {
    const query = new URLSearchParams();
    if (searchText) query.set('search', searchText);
    if (selectedCategory && selectedCategory !== 'ALL') query.set('category', selectedCategory);
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/products?' + query.toString())
      .then(r => r.json())
      .then(setList);
  };

  useEffect(() => {
    if (!router.isReady) return;
    const categoryFromQuery = router.query.category ? String(router.query.category).toUpperCase() : 'ALL';
    setCategory(categoryFromQuery);
    fetchProducts(categoryFromQuery, search);
  }, [router.isReady, router.query.category]);

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
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="ALL">All categories</option>
            <option value="SEEDS">Seeds</option>
            <option value="PESTICIDES">Pesticides</option>
            <option value="FERTILIZERS">Fertilizers</option>
            <option value="TOOLS">Tools</option>
            <option value="OTHER">Other</option>
          </select>
          <button type="button" onClick={fetchProducts}>Search</button>
        </div>

        <div className="card-grid">
          {list.map((p) => (
            <article className="display-card" key={p.id}>
              <div className="card-top">
                <span className="pill">{p.category || 'OTHER'}</span>
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
