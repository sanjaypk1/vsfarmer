import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function getCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

function saveCart(cart) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('farmers-market-cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'))
}

function showNotification(message, type = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('appNotification', { detail: { message, type } }))
}

export default function Products() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [quantities, setQuantities] = useState({});

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

  const setQuantity = (id, value, max = 1) => {
    const quantity = Math.max(1, Math.min(max, Number(value) || 1));
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };

  const addToCart = (product) => {
    const requested = quantities[product.id] || 1;
    if (requested > product.quantity) {
      showNotification(`Only ${product.quantity} ${product.unit} available`, 'error');
      return;
    }

    const cart = getCart();
    const existing = cart.find(item => item.productId === product.id);
    const next = existing
      ? cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + requested } : item)
      : [...cart, { productId: product.id, name: product.name, unitPrice: product.priceCents, quantity: requested }];
    saveCart(next);
    showNotification(`Added ${requested} ${product.unit} of ${product.name} to cart`);
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
            <option value="SAPLINGS">Saplings</option>
            <option value="VEGETABLES">Vegetables</option>
            <option value="FRUITS">Fruits</option>
            <option value="PESTICIDES">Pesticides</option>
            <option value="FERTILIZERS">Fertilizers</option>
            <option value="TOOLS">Tools</option>
            <option value="OTHER">Other</option>
          </select>
          <button type="button" onClick={fetchProducts}>Search</button>
        </div>

        <div className="card-grid">
          {list.map((p) => {
            const selectedQty = quantities[p.id] || 1;
            return (
              <article className="display-card" key={p.id}>
                <div className="card-top">
                  <span className="pill">{p.category || 'OTHER'}</span>
                  <span className="pill muted">In stock</span>
                </div>
                {p.images && p.images.length > 0 && (
                  <div className="product-media">
                    <img src={p.images[0]} alt={p.name} className="product-image" />
                  </div>
                )}
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="meta-list">
                  <span>Farm: {p.farmer?.name || 'Local grower'}</span>
                  <span>₹{(p.priceCents / 100).toFixed(2)} / {p.unit}</span>
                  <span>{p.quantity} available</span>
                </div>
                <div className="quantity-row">
                  <label>
                    Qty:
                    <input
                      type="number"
                      min="1"
                      max={p.quantity}
                      value={selectedQty}
                      onChange={e => setQuantity(p.id, e.target.value, p.quantity)}
                    />
                  </label>
                  <button type="button" onClick={() => addToCart(p)}>Add to cart</button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  );
}
