import Link from 'next/link'
export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Farmers Market</h1>
      <nav>
        <Link href="/products">Products</Link> | <Link href="/cart">Cart</Link> | <Link href="/login">Login</Link> | <Link href="/register">Register</Link>
      </nav>
    </main>
  )
}
