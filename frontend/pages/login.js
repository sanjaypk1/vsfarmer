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
    <main style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handle}>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button>Login</button>
      </form>
    </main>
  )
}
