import { useState } from 'react'
import Router from 'next/router'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('CUSTOMER')
  const [name,setName]=useState('')
  const [location,setLocation]=useState('')
  const [bio,setBio]=useState('')
  const [selectedCategories,setSelectedCategories]=useState([])
  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category])
  }
  const handle = async e => {
    e.preventDefault();
    const payload = { email, password, role };
    if (role === 'FARMER') {
      payload.name = name;
      payload.location = location;
      payload.bio = bio;
      payload.sellingCategories = selectedCategories;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
    const j = await res.json();
    if (j.token) { localStorage.setItem('token', j.token); Router.push('/products'); }
    else alert(j.error || 'Register failed');
  }
  return (
    <main>
      <section className="auth-card">
        <div>
          <p className="eyebrow">Join the network</p>
          <h2>Create account</h2>
          <p>Sign up as a buyer or list your farm products with ease.</p>
        </div>
        <form onSubmit={handle} className="auth-form">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="radio-group">
            <label><input type="radio" name="role" value="CUSTOMER" onChange={e=>setRole(e.target.value)} defaultChecked /> Customer</label>
            <label><input type="radio" name="role" value="FARMER" onChange={e=>setRole(e.target.value)} /> Farmer</label>
          </div>
          {role === 'FARMER' && (
            <>
              <input placeholder="Farm name" value={name} onChange={e=>setName(e.target.value)} />
              <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
              <textarea placeholder="Short farm bio" value={bio} onChange={e=>setBio(e.target.value)} rows={3} />
              <div>
                <p className="eyebrow">What do you sell?</p>
                <div className="radio-group">
                  {['SEEDS','PESTICIDES','FERTILIZERS','TOOLS','OTHER'].map(category => (
                    <label key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} /> {category}</label>
                  ))}
                </div>
              </div>
            </>
          )}
          <button type="submit">Register</button>
        </form>
      </section>
    </main>
  )
}
