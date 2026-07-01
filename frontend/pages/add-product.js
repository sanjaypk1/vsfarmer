import { useState } from 'react'
import Router from 'next/router'

export default function AddProduct() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priceCents, setPriceCents] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [category, setCategory] = useState('SEEDS')

  const submit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Login to add products')
      Router.push('/auth?mode=login')
      return
    }
    const payload = { name, description, priceCents: Number(priceCents), quantity: Number(quantity), unit, category }
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.error) return alert(data.error)
    alert('Product added')
    Router.push('/dashboard')
  }

  return (
    <main>
      <h2>Add Product</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <input placeholder="Product name" value={name} onChange={e=>setName(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
        <input placeholder="Price in cents" type="number" value={priceCents} onChange={e=>setPriceCents(e.target.value)} required />
        <input placeholder="Quantity available" type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} required />
        <input placeholder="Unit (kg, lb, dozen)" value={unit} onChange={e=>setUnit(e.target.value)} required />
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="SEEDS">Seeds</option>
          <option value="SAPLINGS">Saplings</option>
          <option value="VEGETABLES">Vegetables</option>
          <option value="FRUITS">Fruits</option>
          <option value="PESTICIDES">Pesticides</option>
          <option value="FERTILIZERS">Fertilizers</option>
          <option value="TOOLS">Tools</option>
          <option value="OTHER">Other</option>
        </select>
        <button type="submit">Create product</button>
      </form>
    </main>
  )
}
