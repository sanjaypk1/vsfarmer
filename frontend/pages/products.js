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
      <h2>Products</h2>
      <p><Link href="/cart">View Cart</Link></p>
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search produce" style={{ width: 280 }} />
        <button type="button" onClick={fetchProducts} style={{ marginLeft: 8 }}>Search</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map((p) => (
          <li key={p.id} style={{ marginBottom: 14, padding: 14, border: '1px solid #e5e7eb', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <strong>{p.name}</strong>
                <p style={{ margin: 4 }}>{p.description}</p>
                <p style={{ margin: 4 }}>Farm: {p.farmer.name}</p>
                <p style={{ margin: 4 }}>Price: ₹{(p.priceCents / 100).toFixed(2)} per {p.unit}</p>
                <p style={{ margin: 4 }}>Stock: {p.quantity}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button type="button" onClick={() => addToCart(p)}>Add to cart</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
