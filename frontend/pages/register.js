import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const router = useRouter()
  useEffect(() => {
    const role = router.query.role === 'FARMER' ? 'FARMER' : undefined
    router.replace(`/auth?mode=register${role ? `&role=${role}` : ''}`)
  }, [router])
  return null
}
