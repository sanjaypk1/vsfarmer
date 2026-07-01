import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const CATEGORY_OPTIONS = ['SEEDS','SAPLINGS','VEGETABLES','FRUITS','PESTICIDES','FERTILIZERS','TOOLS','OTHER']

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    const queryMode = router.query.mode
    const queryRole = router.query.role
    if (queryMode === 'register') setMode('register')
    else if (queryMode === 'login') setMode('login')
    if (queryRole === 'FARMER') setRole('FARMER')
  }, [router.isReady, router.query.mode, router.query.role])

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category])
  }

  useEffect(() => {
    if (role !== 'FARMER') {
      setSelectedCategories([])
    }
  }, [role])

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
      return
    }
    setMessage(data.error || 'Login failed')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')
    const payload = { email, password, role }
    if (role === 'FARMER') {
      payload.name = name
      payload.location = location
      payload.bio = bio
      payload.sellingCategories = selectedCategories
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
      return
    }
    setMessage(data.error || 'Register failed')
  }

  return (
    <main>
      <section className="auth-card">
        <div>
          <p className="eyebrow">Welcome</p>
          <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
          <p>Use one page for signing in or creating a new buyer or farmer account.</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('register')}>Register</button>
        </div>

        {message && <p className="auth-message">{message}</p>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="radio-group">
              <label><input type="radio" name="role" value="CUSTOMER" onChange={e => setRole(e.target.value)} checked={role === 'CUSTOMER'} /> Buyer</label>
              <label><input type="radio" name="role" value="FARMER" onChange={e => setRole(e.target.value)} checked={role === 'FARMER'} /> Farmer</label>
            </div>
            {role === 'FARMER' && (
              <>
                <input placeholder="Farm name" value={name} onChange={e => setName(e.target.value)} required />
                <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
                <textarea placeholder="Short farm bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} required />
                <div>
                  <p className="eyebrow">What do you sell?</p>
                  <div className="checkbox-grid">
                    {CATEGORY_OPTIONS.filter(category => category !== 'OTHER').map(category => (
                      <label key={category} className="checkbox-label">
                        <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} /> {category}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        )}
      </section>
    </main>
  )
}
