'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, Lock, UserPlus, Building2, Phone, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { isValidPersonName, validatePersonName, isValidUsPhone, validateUsPhone, formatUsPhone, filterPersonNameInput, isValidEmail, isValidPassword } from '@/lib/validation'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const router = useRouter()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUsPhone(e.target.value)
    setPhone(formatted)
    setPhoneError('')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip numeric digits in real-time so numbers like '232' cannot be entered
    const filtered = filterPersonNameInput(e.target.value)
    setName(filtered)
    setNameError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setNameError('')
    setPhoneError('')

    const nameValidation = validatePersonName(name)
    if (!nameValidation.isValid) {
      const err = nameValidation.error || 'Full Name must contain only alphabetic letters (no numbers like "232" or special symbols).'
      setNameError(err)
      setErrorMsg(err)
      toast.error(err)
      return
    }

    if (!isValidEmail(email)) {
      const err = 'Please enter a valid email address.'
      setErrorMsg(err)
      toast.error(err)
      return
    }

    const phoneValidation = validateUsPhone(phone)
    if (!phoneValidation.isValid) {
      const err = phoneValidation.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX.'
      setPhoneError(err)
      setErrorMsg(err)
      toast.error(err)
      return
    }

    if (!isValidPassword(password)) {
      const err = 'Password must be at least 6 characters long.'
      setErrorMsg(err)
      toast.error(err)
      return
    }

    setIsLoading(true)

    try {
      let fbUid = ''
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
        fbUid = cred.user.uid
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {})
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          // If already registered, sign in to link session
          try {
            const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
            fbUid = cred.user.uid
          } catch (signInErr) {
            console.warn('Sign-in with existing email warning:', signInErr)
          }
        } else {
          console.warn('Firebase Auth creation notice:', authErr?.message)
        }
      }

      // Store user session for seamless flow
      const userSession = JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: company.trim(),
        role: 'business',
        uid: fbUid || auth.currentUser?.uid || '',
        userId: fbUid || auth.currentUser?.uid || ''
      })

      try {
        sessionStorage.setItem('biznestusa_user_session', userSession)
        localStorage.setItem('biznestusa_user_session', userSession)
      } catch {}

      toast.success('BizNestUSA Business Account registered successfully!')
      router.push('/add-business')
    } catch (err: any) {
      console.error('Registration error:', err)
      setErrorMsg(err.message || 'Registration failed. Please try again.')
      toast.error(err.message || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Register BizNestUSA Account</h1>
            <p className="text-xs text-slate-500 mt-1">List your business and connect with customers across the United States</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Alex Morgan"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none ${
                  nameError ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-emerald-600'
                }`}
              />
              {nameError ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{nameError}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Real person name (alphabetic letters only, no numbers allowed).</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (USA Standard) *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={17}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 234-5678"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none ${
                    phoneError ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{phoneError}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">USA Standard format: +1 (XXX) XXX-XXXX (exactly 10 digits).</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Apex Digital Solutions"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (min 6 characters)"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
