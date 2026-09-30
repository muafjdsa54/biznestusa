// Email service - uses Resend via /api/send-business-email route
export interface EmailData {
  to: string
  businessName: string
  businessId: string
  email: string
  phone: string
  category: string
  city: string
  address?: string
  description?: string
  slug?: string
}

export interface PriorityEmailData {
  to: string
  businessName: string
  referralCount: number
}

export interface ContactEmailData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface PriorityRequestEmailData {
  businessName: string
  contactPerson: string
  email: string
  phone: string
  city: string
  currentListing: string
  message: string
}

// Send business submission confirmation via Resend (server-side route)
export async function sendBusinessSubmissionEmail(data: EmailData) {
  try {
    if (!data.to) {
      console.log('[v0] No recipient email provided - skipping submission email')
      return false
    }

    const payload = {
      to: data.to,
      businessName: data.businessName,
      category: data.category,
      address: data.address || '',
      phone: data.phone,
      description: data.description || '',
      slug: data.slug || '',
      city: data.city,
    }

    const res = await fetch('/api/send-business-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[v0] Business submission email failed:', res.status, err)
      return false
    }

    const result = await res.json()
    console.log('[v0] Business submission email sent:', result?.id ?? 'ok')
    return true
  } catch (error) {
    console.error('[v0] Email sending error:', error)
    return false
  }
}

// Send priority confirmation email
export async function sendPriorityConfirmationEmail(data: PriorityEmailData) {
  try {
    console.log('📧 SENDING PRIORITY CONFIRMATION EMAIL:', {
      to: data.to,
      businessName: data.businessName,
      referralCount: data.referralCount,
    })
    
    // Simulate email sending for now
    // In production, integrate with EmailJS or SendGrid
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Priority confirmation email sent successfully')
    return true
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}

// Send contact form email
export async function sendContactEmail(data: ContactEmailData) {
  try {
    console.log('📧 SENDING CONTACT EMAIL:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    })
    
    // Simulate email sending for now
    // In production, integrate with EmailJS or SendGrid
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Contact email sent successfully')
    return true
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}

// Send priority request email
export async function sendPriorityRequestEmail(data: PriorityRequestEmailData) {
  try {
    console.log('📧 SENDING PRIORITY REQUEST EMAIL:', {
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      city: data.city,
      currentListing: data.currentListing,
      message: data.message,
    })
    
    // Simulate email sending for now
    // In production, integrate with EmailJS or SendGrid
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Priority request email sent successfully')
    return true
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}
