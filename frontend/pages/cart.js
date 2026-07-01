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
      <section className="page-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Basket</p>
            <h2>Cart</h2>
          </div>
          <Link href="/products" className="text-link">Continue shopping</Link>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link href="/products" className="btn btn-primary">Shop produce</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="card-stack">
              {items.map(item => (
                <div className="display-card cart-item" key={item.productId}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>₹{(item.unitPrice / 100).toFixed(2)} each</p>
                  </div>
                  <div className="cart-actions">
                    <input type="number" min="1" value={item.quantity} onChange={e => updateQty(item.productId, Number(e.target.value))} />
                    <button type="button" onClick={() => remove(item.productId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <aside className="summary-card">
              <h3>Order summary</h3>
              <div className="summary-row"><span>Subtotal</span><strong>₹{(total / 100).toFixed(2)}</strong></div>
              <div className="summary-row"><span>Delivery</span><strong>Free</strong></div>
              <div className="summary-row total"><span>Total</span><strong>₹{(total / 100).toFixed(2)}</strong></div>
              <Link href="/checkout" className="btn btn-primary wide">Proceed to checkout</Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
