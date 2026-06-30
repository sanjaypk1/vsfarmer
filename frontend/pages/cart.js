import { useEffect, useState } from 'react';
import Link from 'next/link';

function loadCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

function saveCart(items) {
  localStorage.setItem('farmers-market-cart', JSON.stringify(items));
}

export default function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const updateQty = (id, qty) => {
    const next = items.map(item => item.productId === id ? { ...item, quantity: qty } : item).filter(item => item.quantity > 0);
    setItems(next);
    saveCart(next);
  };

  const remove = id => {
    const next = items.filter(item => item.productId !== id);
    setItems(next);
    saveCart(next);
  };

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <main>
      <h2>Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty. <Link href="/products">Shop produce</Link>.</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.productId} style={{ marginBottom: 12 }}>
                <strong>{item.name}</strong> — ₹{(item.unitPrice / 100).toFixed(2)} ×{' '}
                <input type="number" min="1" value={item.quantity} onChange={e => updateQty(item.productId, Number(e.target.value))} style={{ width: 80 }} />
                <button type="button" onClick={() => remove(item.productId)} style={{ marginLeft: 10 }}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 20 }}>
            <p><strong>Total:</strong> ₹{(total / 100).toFixed(2)}</p>
            <Link href="/checkout"><button>Proceed to checkout</button></Link>
          </div>
        </>
      )}
    </main>
  );
}
