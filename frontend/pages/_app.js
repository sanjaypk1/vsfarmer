import React from 'react'
import Link from 'next/link'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: 14 }}>
        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/farmers">Farmers</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/my-products">My Products</Link>
          <Link href="/auth">Login / Register</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/logout">Logout</Link>
        </nav>
      </header>
      <Component {...pageProps} />
    </>
  )
}
