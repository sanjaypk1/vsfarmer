import { useState } from 'react'
import Router from 'next/router'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const handle = async e => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if (j.token) { localStorage.setItem('token', j.token); Router.push('/products'); }
    else alert(j.error || 'Login failed');
  }
  return (
    <main>
      <section className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Login</h2>
          <p>Access your dashboard, orders and saved farming essentials.</p>
        </div>
        <form onSubmit={handle} className="auth-form">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  )
}
