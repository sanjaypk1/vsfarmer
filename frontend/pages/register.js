import { useState } from 'react'
import Router from 'next/router'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('CUSTOMER')
  const [name,setName]=useState('')
  const [location,setLocation]=useState('')
  const [bio,setBio]=useState('')
  const handle = async e => {
    e.preventDefault();
    const payload = { email, password, role };
    if (role === 'FARMER') payload.name = name;
    if (role === 'FARMER') payload.location = location;
    if (role === 'FARMER') payload.bio = bio;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
    const j = await res.json();
    if (j.token) { localStorage.setItem('token', j.token); Router.push('/products'); }
    else alert(j.error || 'Register failed');
  }
  return (
    <main style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handle}>
        <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <div style={{ marginTop: 10 }}>
          <label><input type="radio" name="role" value="CUSTOMER" onChange={e=>setRole(e.target.value)} defaultChecked /> Customer</label>
          <label style={{ marginLeft: 10 }}><input type="radio" name="role" value="FARMER" onChange={e=>setRole(e.target.value)} /> Farmer</label>
        </div>
        {role === 'FARMER' && (
          <div style={{ marginTop: 10 }}>
            <div><input placeholder="Farm name" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div><input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} /></div>
            <div><textarea placeholder="Short farm bio" value={bio} onChange={e=>setBio(e.target.value)} rows={3} /></div>
          </div>
        )}
        <button style={{ marginTop: 16 }}>Register</button>
      </form>
    </main>
  )
}
