import { useEffect } from 'react'
import Router from 'next/router'

export default function Logout() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('farmers-market-cart')
    }
    Router.replace('/')
  }, [])

  return <main style={{ padding: 20 }}><p>Signing out...</p></main>
}
