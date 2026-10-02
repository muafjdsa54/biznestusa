'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('admin@biznestusa.com')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isMasterAdmin = user?.uid === 'Mg7clnjHqqTUWk4uBw2zd0yLAcX2' || user?.email?.toLowerCase() === 'admin@biznestusa.com'
      setIsAuthenticated(Boolean(isMasterAdmin))
    })
    return () => unsubscribe()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const emailTrimmed = (email || '').trim().toLowerCase()
      const passTrimmed = (password || '').trim()
      const credential = await signInWithEmailAndPassword(auth, emailTrimmed, passTrimmed)
      const isMasterAdmin = credential.user.uid === 'Mg7clnjHqqTUWk4uBw2zd0yLAcX2' || credential.user.email?.toLowerCase() === 'admin@biznestusa.com'
      if (!isMasterAdmin) {
        await signOut(auth)
        throw new Error('Unauthorized administrator account')
      }
      setIsAuthenticated(true)
    } catch (err: any) {
      const errCode = err?.code || ''
      const errMsg = err?.message || 'Invalid BizNestUSA administrator credentials'
      setError(`Authentication failed${errCode ? ` [${errCode}]` : ''}: ${errMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setIsAuthenticated(false)
    setPassword('')
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Panel</h2>
            <p className="text-center text-gray-600 mb-6">Enter password to access admin dashboard</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <div className="relative mb-3">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" required />
                </div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Access Admin Panel
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Website
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <Shield className="w-4 h-4" />
          Logout Admin
        </button>
      </div>
    </>
  )
}
