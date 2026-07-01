import { useEffect, useState } from 'react';
import Router from 'next/router';

function getCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState('');
  const [deliveryType, setDeliveryType] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    setCart(getCart());
  }, []);

  const showNotification = (message, type = 'success') => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('appNotification', { detail: { message, type } }))
  }

  const placeOrder = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      showNotification('Please login first.', 'error');
      Router.push('/auth?mode=login');
      return;
    }
    setStatus('Placing order...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : null
      })
    });
    const data = await res.json();
    if (data.error) {
      setStatus('Order failed: ' + data.error);
      showNotification(data.error, 'error');
    } else {
      localStorage.removeItem('farmers-market-cart');
      setCart([]);
      setStatus('Order placed successfully! Order ID: ' + data.id);
      showNotification('Order placed successfully', 'success');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <main>
      <section className="page-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2>Confirm your order</h2>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty. Add items from the products page.</p>
            <a href="/products" className="btn btn-primary">Browse products</a>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="card-stack">
              {cart.map(item => (
                <div className="display-card" key={item.productId}>
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>₹{(item.unitPrice * item.quantity / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="summary-card">
              <h3>Delivery options</h3>
              <label className="radio-row">
                <input type="radio" name="delivery" value="PICKUP" checked={deliveryType === 'PICKUP'} onChange={() => setDeliveryType('PICKUP')} />
                <span>Pickup</span>
              </label>
              <label className="radio-row">
                <input type="radio" name="delivery" value="DELIVERY" checked={deliveryType === 'DELIVERY'} onChange={() => setDeliveryType('DELIVERY')} />
                <span>Delivery</span>
              </label>
              {deliveryType === 'DELIVERY' && (
                <textarea placeholder="Delivery address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3} />
              )}
              <div className="summary-row total"><span>Total</span><strong>₹{(total / 100).toFixed(2)}</strong></div>
              <button type="button" onClick={placeOrder}>Place order</button>
              {status && <p className="status-text">{status}</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
