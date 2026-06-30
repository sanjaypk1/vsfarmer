import { useEffect, useState } from 'react';
import Router from 'next/router';

function getCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('farmers-market-cart') || '[]');
}

function parseToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState('');
  const [deliveryType, setDeliveryType] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    setCart(getCart());
  }, []);

  const placeOrder = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Please login first.');
      Router.push('/login');
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
    } else {
      localStorage.removeItem('farmers-market-cart');
      setCart([]);
      setStatus('Order placed successfully! Order ID: ' + data.id);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <main>
      <h2>Checkout</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty. Add items from <a href="/products">products</a>.</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.productId}>{item.name} × {item.quantity} — ₹{(item.unitPrice * item.quantity / 100).toFixed(2)}</li>
            ))}
          </ul>
              <p><strong>Total:</strong> ₹{(total / 100).toFixed(2)}</p>
          <div style={{ marginBottom: 12 }}>
            <label>
              <input type="radio" name="delivery" value="PICKUP" checked={deliveryType === 'PICKUP'} onChange={() => setDeliveryType('PICKUP')} /> Pickup
            </label>
            <label style={{ marginLeft: 16 }}>
              <input type="radio" name="delivery" value="DELIVERY" checked={deliveryType === 'DELIVERY'} onChange={() => setDeliveryType('DELIVERY')} /> Delivery
            </label>
          </div>
          {deliveryType === 'DELIVERY' && (
            <div style={{ marginBottom: 12 }}>
              <textarea placeholder="Delivery address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3} style={{ width: '100%', maxWidth: 420 }} />
            </div>
          )}
          <button type="button" onClick={placeOrder}>Place order</button>
          {status && <p>{status}</p>}
        </>
      )}
    </main>
  );
}
