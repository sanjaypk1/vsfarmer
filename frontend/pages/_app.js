import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import '../styles/globals.css'

function getCartCount() {
  if (typeof window === 'undefined') return 0
  const cart = JSON.parse(localStorage.getItem('farmers-market-cart') || '[]')
  return cart.reduce((total, item) => total + (item.quantity || 0), 0)
}

export default function App({ Component, pageProps }) {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setCartCount(getCartCount())
    const handleCartUpdate = () => setCartCount(getCartCount())
    window.addEventListener('storage', handleCartUpdate)
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('storage', handleCartUpdate)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  return (
    <>
      <header className="app-header">
        <nav className="app-nav">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/farmers">Farmers</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/my-products">My Products</Link>
          <Link href="/auth">Login / Register</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/logout">Logout</Link>
        </nav>
      </header>
      <Component {...pageProps} />
      <Link href="/cart" className="cart-fab" aria-label="View cart">
        <span className="cart-fab-icon">🛒</span>
        {cartCount > 0 && <span className="cart-fab-badge">{cartCount}</span>}
      </Link>
    </>
  )
}
