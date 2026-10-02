'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

interface FailedAttempt {
  email: string
  timestamp: number
  attempts: number
}

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('admin@biznestusa.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)

  // Check for existing blocks on mount
  useEffect(() => {
    checkBlockStatus()
    const interval = setInterval(checkBlockStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const checkBlockStatus = () => {
    const blockedData = localStorage.getItem('admin_login_blocked')
    if (blockedData) {
      const blocked: FailedAttempt = JSON.parse(blockedData)
      const timePassed = Date.now() - blocked.timestamp
      const oneHour = 60 * 60 * 1000

      if (timePassed < oneHour) {
        setIsBlocked(true)
        setBlockTimeLeft(Math.ceil((oneHour - timePassed) / 60000))
      } else {
        localStorage.removeItem('admin_login_blocked')
        setIsBlocked(false)
        setBlockTimeLeft(0)
      }
    }
  }

  const recordFailedAttempt = (email: string) => {
    const failedData = localStorage.getItem('admin_login_failed')
    let failed: FailedAttempt[] = failedData ? JSON.parse(failedData) : []
    
    const existingUser = failed.find(f => f.email === email)
    if (existingUser) {
      existingUser.attempts += 1
      existingUser.timestamp = Date.now()
    } else {
      failed.push({ email, timestamp: Date.now(), attempts: 1 })
    }

    // Clean old attempts (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    failed = failed.filter(f => f.timestamp > oneHourAgo)

    localStorage.setItem('admin_login_failed', JSON.stringify(failed))

    // Check if this user should be blocked (3 failed attempts)
    const userAttempts = failed.find(f => f.email === email)
    if (userAttempts && userAttempts.attempts >= 3) {
      const blockData: FailedAttempt = {
        email,
        timestamp: Date.now(),
        attempts: userAttempts.attempts
      }
      localStorage.setItem('admin_login_blocked', JSON.stringify(blockData))
      setIsBlocked(true)
      setBlockTimeLeft(60)
      return true
    }
    return false
  }

  const clearFailedAttempts = (email: string) => {
    const failedData = localStorage.getItem('admin_login_failed')
    if (failedData) {
      let failed: FailedAttempt[] = JSON.parse(failedData)
      failed = failed.filter(f => f.email !== email)
      localStorage.setItem('admin_login_failed', JSON.stringify(failed))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isBlocked) {
      setError('Account temporarily blocked due to multiple failed attempts')
      return
    }

    setLoading(true)
    setError('')

    try {
      const emailTrimmed = (email || '').trim().toLowerCase()
      const passTrimmed = (password || '').trim()
      const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, passTrimmed)
      const authed = userCredential.user
      const isMasterAdmin = authed.uid === 'Mg7clnjHqqTUWk4uBw2zd0yLAcX2' || authed.email?.toLowerCase() === 'admin@biznestusa.com'

      if (!isMasterAdmin) {
        await signOut(auth)
        setError(`Access Denied: Account (${authed.email || authed.uid}) is not authorized as administrator`)
        return
      }

      clearFailedAttempts(emailTrimmed)
      onLoginSuccess()
    } catch (error: any) {
      console.error('Login error:', error)
      const errCode = error?.code || ''
      const errMsg = error?.message || 'Login failed. Please check your credentials'
      setError(`Login failed${errCode ? ` [${errCode}]` : ''}: ${errMsg}`)
    } finally {
      setLoading(false)
    }
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Blocked</h1>
            <p className="text-gray-600 mb-6">
              Your account has been temporarily blocked due to multiple failed login attempts.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                Try again in: {blockTimeLeft} minutes
              </p>
            </div>
            <p className="text-sm text-gray-500">
              For immediate assistance, contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 ml-3">Admin Login</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
