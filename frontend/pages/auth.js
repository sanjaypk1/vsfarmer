import Link from 'next/link'

export default function AuthSelect() {
  return (
    <main>
      <section className="auth-card">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2>Sign in or create an account</h2>
          <p>Choose whether you want to login, register as a buyer, or register as a seller.</p>
        </div>
        <div className="auth-form" style={{ display: 'grid', gap: 16 }}>
          <Link href="/login" className="btn btn-primary">Login</Link>
          <Link href="/register" className="btn btn-secondary">Register as buyer</Link>
          <Link href="/register?role=FARMER" className="btn btn-secondary">Register as seller</Link>
        </div>
      </section>
    </main>
  )
}
