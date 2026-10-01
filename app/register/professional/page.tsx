'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, Lock, User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone, isValidEmail } from '@/lib/validation'
import { Phone } from 'lucide-react'

export default function ProfessionalRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setFullNameError('')
    setPhoneError('')

    const nameVal = validatePersonName(fullName)
    if (!nameVal.isValid) {
      const err = nameVal.error || 'Full Name must contain only alphabetic letters (numbers like "232" are strictly not allowed).'
      setFullNameError(err)
      setErrorMsg(err)
      return
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    const phoneVal = validateUsPhone(phone)
    if (!phoneVal.isValid) {
      const err = phoneVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX.'
      setPhoneError(err)
      setErrorMsg(err)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.')
      return
    }

    setIsLoading(true)
    try {
      // Create Firebase Auth user or session
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        if (cred.user) {
          await updateProfile(cred.user, { displayName: fullName.trim() })
        }
      } catch (authErr: any) {
        // If Firebase Auth fails (e.g., in offline or client mode), store session
        console.warn('Firebase Auth fallback:', authErr?.message)
        if (authErr?.code === 'auth/email-already-in-use') {
          setErrorMsg('An account with this email address already exists. Please login.')
          setIsLoading(false)
          return
        }
      }

      // Store professional user session
      const proSession = JSON.stringify({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'professional',
        hasProfile: false
      })
      sessionStorage.setItem('biznestusa_user_session', proSession)
      localStorage.setItem('biznestusa_user_session', proSession)

      toast.success('Professional account created successfully! Redirecting to profile setup...')
      setTimeout(() => {
        router.push(`/add-professional?name=${encodeURIComponent(fullName.trim())}&email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(phone.trim())}`)
      }, 700)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Create Your Professional Account</h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Join the United States network of verified engineers, physicians, educators, attorneys, and skilled experts.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(filterPersonNameInput(e.target.value))
                    setFullNameError('')
                  }}
                  placeholder="e.g. David Miller"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none ${
                    fullNameError ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {fullNameError ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{fullNameError}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Real person name (letters only, no numbers like &quot;232&quot;).</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number (USA Standard) *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={17}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatUsPhone(e.target.value))
                    setPhoneError('')
                  }}
                  placeholder="+1 (555) 234-5678"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none ${
                    phoneError ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{phoneError}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">USA format: +1 (XXX) XXX-XXXX (exactly 10 digits).</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login?role=professional" className="text-blue-600 font-bold hover:underline">
                Login Here
              </Link>
            </p>
            <div className="text-[11px] text-slate-400">
              Registering a Business Store or Company?{' '}
              <Link href="/register" className="text-slate-600 font-semibold underline">
                Business Signup
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
