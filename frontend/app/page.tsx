'use client'

import { useRouter } from 'next/navigation'

export default function HomePageRedirect() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={() => router.push('/home')}
        className="btn btn-lg bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6 py-3 transition-all duration-300"
      >
        Go to Home Page
      </button>
    </div>
  )
}
