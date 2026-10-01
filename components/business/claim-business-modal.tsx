'use client'

import { useState } from 'react'
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { isValidPersonName, validatePersonName, filterPersonNameInput, isValidUsPhone, validateUsPhone, formatUsPhone } from '@/lib/validation'

interface ClaimBusinessModalProps {
  businessName: string
  isOpen: boolean
  onClose: () => void
}

export default function ClaimBusinessModal({ businessName, isOpen, onClose }: ClaimBusinessModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [taxIdOrLicense, setTaxIdOrLicense] = useState('')
  const [phone, setPhone] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const nameVal = validatePersonName(ownerName)
    if (!nameVal.isValid) {
      const err = nameVal.error || 'Owner / Manager Name must contain only alphabetic letters (no numbers like "232" or special symbols).'
      setFormError(err)
      toast.error(err)
      return
    }

    if (!taxIdOrLicense.trim()) {
      const err = 'Please provide State Filing / EIN / License number.'
      setFormError(err)
      toast.error(err)
      return
    }

    const phoneVal = validateUsPhone(phone)
    if (!phoneVal.isValid) {
      const err = phoneVal.error || 'Please enter a valid 10-digit US phone number: +1 (XXX) XXX-XXXX'
      setFormError(err)
      toast.error(err)
      return
    }

    setSubmitted(true)
    toast.success('Ownership claim submitted! Our compliance team will review within 24 hours.')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 font-sans">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Claim Business Ownership</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Claim Under Verification</h4>
            <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
              We received your ownership request for <strong className="text-slate-900">{businessName}</strong>. Our compliance team will reach out via verified business email or phone within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify ownership for <strong className="text-slate-900">{businessName}</strong> to gain full control over profile edits, customer review replies, and leads dashboard.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Authorized Manager Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(filterPersonNameInput(e.target.value))}
                  placeholder="e.g. Michael R. Reynolds"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Alphabetic letters only (no numbers like &quot;232&quot;).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State Filing / EIN / License # *</label>
                  <input
                    type="text"
                    required
                    value={taxIdOrLicense}
                    onChange={(e) => setTaxIdOrLicense(e.target.value)}
                    placeholder="e.g. 12-3456789 or State Lic #"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Mobile / Direct Phone (USA) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={17}
                    value={phone}
                    onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">USA format: +1 (XXX) XXX-XXXX (10 digits).</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proof Document (Business License / Utility Bill / State Filing)</label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors block relative">
                  {proofPreview ? (
                    <div className="space-y-2">
                      <img src={proofPreview} alt="Proof preview" className="max-h-36 mx-auto rounded-lg object-contain border border-slate-200 shadow-xs" />
                      <span className="text-xs text-emerald-700 font-bold block">✓ {proofFile?.name} uploaded</span>
                      <span className="text-[10px] text-slate-400 block">(Click box to choose a different image)</span>
                    </div>
                  ) : proofFile ? (
                    <div className="space-y-1 py-1">
                      <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                      <span className="text-xs text-emerald-700 font-bold block">{proofFile.name}</span>
                      <span className="text-[10px] text-slate-400 block">(Click box to change document)</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-600 font-medium block">
                        Click to select & upload proof of ownership image or PDF
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG, JPG, WEBP, PDF</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setProofFile(file)
                        if (file.type.startsWith('image/')) {
                          setProofPreview(URL.createObjectURL(file))
                        } else {
                          setProofPreview(null)
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Submit Ownership Claim
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
