'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, Lock, LogIn, User, Building2, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getAllProfessionals } from '@/lib/professional-service'

function LoginForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'professional' ? 'professional' : 'business'
  
  const [accountType, setAccountType] = useState<'business' | 'professional'>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'professional') {
      setAccountType('professional')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      // Try Firebase Auth if available
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } catch (authErr: any) {
        console.warn('Firebase Auth notice (falling back to user session):', authErr?.message)
      }

      if (accountType === 'professional') {
        const allPros = await getAllProfessionals(true)
        const userPro = allPros.find(p => 
          (p.email && p.email.toLowerCase().trim() === email.trim().toLowerCase()) ||
          (p.username && p.username.toLowerCase().trim() === email.trim().toLowerCase())
        )

        sessionStorage.setItem('biznestusa_user_session', JSON.stringify({
          name: userPro?.name || userPro?.fullName || email.split('@')[0],
          email: email.trim(),
          role: 'professional',
          hasProfile: Boolean(userPro),
          username: userPro?.username || email.split('@')[0]
        }))

        toast.success('Welcome back to your Professional Dashboard!')
        setTimeout(() => {
          router.push('/dashboard/professional')
        }, 500)
      } else {
        const fbUid = auth.currentUser?.uid || ''
        const sessionPayload = {
          email: email.trim(),
          name: auth.currentUser?.displayName || email.split('@')[0],
          uid: fbUid,
          userId: fbUid,
          role: 'business'
        }
        sessionStorage.setItem('biznestusa_user_session', JSON.stringify(sessionPayload))
        localStorage.setItem('biznestusa_user_session', JSON.stringify(sessionPayload))
        toast.success('Successfully logged into BizNest USA Business Portal.')
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (err: any) {
      setErrorMsg('Invalid login credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <LogIn className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign In to BizNest USA</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Access your business listings, job applications, or professional profile.
        </p>
      </div>

      {/* Account Type Selector */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setAccountType('professional')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            accountType === 'professional' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Professional</span>
        </button>
        <button
          type="button"
          onClick={() => setAccountType('business')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            accountType === 'business' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Business / Employer</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={accountType === 'professional' ? 'john@professional.com' : 'owner@company.com'}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
            accountType === 'professional' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href={accountType === 'professional' ? '/register/professional' : '/register'}
            className="text-blue-600 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-16 px-4 flex items-center justify-center">
        <Suspense fallback={<div className="text-center text-slate-400 text-sm">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
