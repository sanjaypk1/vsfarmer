import { useState } from 'react'
import Router from 'next/router'

function showNotification(message, type = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('appNotification', { detail: { message, type } }))
}

export default function AddProduct() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priceCents, setPriceCents] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [category, setCategory] = useState('SEEDS')
  const [imageUrls, setImageUrls] = useState('')
  const [uploadedImages, setUploadedImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    const newImages = []

    for (const file of files) {
      try {
        const reader = new FileReader()
        reader.onload = (event) => {
          newImages.push(event.target.result)
          if (newImages.length === files.length) {
            setUploadedImages(prev => [...prev, ...newImages])
            showNotification(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`, 'success')
            setIsUploading(false)
          }
        }
        reader.readAsDataURL(file)
      } catch (err) {
        showNotification('Failed to upload image', 'error')
        setIsUploading(false)
      }
    }
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const submit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      showNotification('Login to add products', 'error')
      Router.push('/auth?mode=login')
      return
    }

    const urlImages = imageUrls.split(',').map(url => url.trim()).filter(Boolean)
    const images = [...uploadedImages, ...urlImages]

    if (images.length === 0) {
      showNotification('Please add at least one product image', 'error')
      return
    }

    const payload = { name, description, priceCents: Number(priceCents), quantity: Number(quantity), unit, category, images }
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.error) {
      showNotification(data.error, 'error')
      return
    }
    showNotification('Product added', 'success')
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

        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 600, color: '#11251b' }}>Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{ padding: '8px' }}
          />
          <textarea
            placeholder="Or paste image URLs (comma separated)"
            value={imageUrls}
            onChange={e=>setImageUrls(e.target.value)}
            rows={2}
          />
          {uploadedImages.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#516c58' }}>Uploaded images ({uploadedImages.length})</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                {uploadedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', backgroundColor: '#f5f8f2' }}>
                    <img src={img} alt="preview" style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        padding: 0,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0 8px 0 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
        <button type="submit" disabled={isUploading}>Create product</button>
      </form>
    </main>
  )
}
