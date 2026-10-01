/**
 * BizNest USA Security & Validation Engine
 * Enforces strict validation for Person Names, US Phone Numbers (NANP +1),
 * Emails, and Form Submissions across all application surfaces.
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  formatted?: string
}

/**
 * Validates a human person's full name.
 * - Strictly forbids numbers/digits (e.g. "232" or "John123").
 * - Only permits alphabetic characters (including accented/Unicode latin letters), spaces, hyphens, apostrophes, and periods (e.g. Jr.).
 * - Minimum 2 alphabetic characters.
 * - Maximum 70 characters.
 */
/**
 * Validates a human person's full name and returns detailed validation result.
 * - Strictly forbids numbers/digits (e.g. "232" or "John123").
 * - Only permits alphabetic characters (including accented/Unicode latin letters), spaces, hyphens, apostrophes, and periods (e.g. Jr.).
 * - Minimum 2 alphabetic characters.
 * - Maximum 70 characters.
 */
export function validatePersonName(name?: string | null): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Full name is required.' }
  }

  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' }
  }

  if (trimmed.length > 70) {
    return { isValid: false, error: 'Name cannot exceed 70 characters.' }
  }

  // Strictly disallow any numeric digit (e.g. "232" or "Alex123")
  if (/\d/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name cannot contain numbers (such as "232"). Please enter a valid person name using letters only.'
    }
  }

  // Allowed: letters (including latin accents), spaces, hyphens, apostrophes, and periods (e.g., "Mary-Jane O'Connor", "Dr. Al Smith Jr.")
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'. -]+$/
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name contains invalid characters. Use letters, spaces, hyphens, and apostrophes only.'
    }
  }

  // Ensure there are at least 2 actual letters (e.g. avoid "- ." or single letter)
  const letterCount = (trimmed.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length
  if (letterCount < 2) {
    return {
      isValid: false,
      error: 'Please enter a valid full name with at least 2 letters.'
    }
  }

  return { isValid: true }
}

/**
 * Returns true if the person name is strictly valid (no digits, valid letters and length).
 */
export function isValidPersonName(name?: string | null): boolean {
  return validatePersonName(name).isValid
}

/**
 * Real-time input filter for Person Name fields.
 * Strips all numeric digits (0-9) immediately so numbers like "232" cannot even be typed into name inputs.
 */
export function filterPersonNameInput(input: string): string {
  if (!input) return ''
  return input.replace(/[0-9]/g, '')
}

/**
 * Auto-formats US Phone numbers as user types:
 * Generates standard "+1 (XXX) XXX-XXXX" format without locking input.
 */
export function formatUsPhone(input: string): string {
  if (!input) return ''

  const trimmed = input.trim()

  // If user clears the input or only '+', '+1', '+1 ', '+1 (' remains, return empty
  if (['+', '+1', '+1 ', '+1 (', '+1 ()', '1', '+1-1', '+1 () -'].includes(trimmed)) {
    return ''
  }

  let clean = trimmed
  // Remove leading +1 or leading 1 if user typed country code
  if (clean.startsWith('+1')) {
    clean = clean.slice(2).trim()
  } else if (clean.startsWith('1') && clean.replace(/\D/g, '').length > 10) {
    clean = clean.replace(/\D/g, '').slice(1)
  }

  // Extract national digits only and cap at 10
  const digits = clean.replace(/\D/g, '').slice(0, 10)

  if (digits.length === 0) {
    return ''
  }

  if (digits.length <= 3) {
    return `+1 (${digits}`
  }
  if (digits.length <= 6) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`
  }
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

/**
 * Extracts raw 10 national digits from a US phone string.
 */
export function getUsPhoneDigits(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return ''
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}

/**
 * Validates a USA Phone Number according to North American Numbering Plan (NANP).
 * - USA numbers consist of exactly 10 digits: 3-digit Area Code + 7-digit Subscriber Number.
 * - Country code is +1.
 * - Area Code first digit cannot be 0 or 1 ([2-9]).
 * - Central Office / Exchange Code first digit cannot be 0 or 1 ([2-9]).
 * - Reject 7 digits, 15 digits, alphabets, or arbitrary strings.
 */
export function validateUsPhone(phone?: string | null): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' }
  }

  const trimmed = phone.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.' }
  }

  // Detect alphabets or illegal characters
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number cannot contain alphabetic characters. Standard USA format requires digits only: +1 (XXX) XXX-XXXX.'
    }
  }

  // Extract digits
  let digits = trimmed.replace(/\D/g, '')

  // Handle leading 1 (US country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }

  // Reject invalid digit counts (e.g. 7 digits or 15 digits)
  if (digits.length !== 10) {
    if (digits.length < 10) {
      return {
        isValid: false,
        error: `Incomplete USA phone number (${digits.length}/10 digits). Standard US numbers require exactly 10 digits in +1 (XXX) XXX-XXXX format.`
      }
    }
    return {
      isValid: false,
      error: `Phone number is too long (${digits.length} digits). Standard USA numbers have exactly 10 digits plus the +1 country code.`
    }
  }

  // Validate NANP area code (first digit cannot be 0 or 1)
  const areaCodeFirstDigit = digits[0]
  if (areaCodeFirstDigit === '0' || areaCodeFirstDigit === '1') {
    return {
      isValid: false,
      error: `Invalid US Area Code (${digits.slice(0, 3)}). US area codes cannot begin with 0 or 1.`
    }
  }

  // Validate NANP central office exchange code (4th digit / exchange start cannot be 0 or 1)
  const exchangeFirstDigit = digits[3]
  if (exchangeFirstDigit === '0' || exchangeFirstDigit === '1') {
    return {
      isValid: false,
      error: 'Invalid US Exchange Code. Central office exchange numbers cannot begin with 0 or 1.'
    }
  }

  const formatted = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  return {
    isValid: true,
    formatted
  }
}

/**
 * Returns true if the phone number is a valid 10-digit US NANP number.
 */
export function isValidUsPhone(phone?: string | null): boolean {
  return validateUsPhone(phone).isValid
}

/**
 * Validates Email Address with strict format check.
 */
export function validateEmail(email?: string | null): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' }
  }

  const trimmed = email.trim()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' }
  }

  return { isValid: true }
}

/**
 * Returns true if the email is valid.
 */
export function isValidEmail(email?: string | null): boolean {
  return validateEmail(email).isValid
}

/**
 * Validates Password strength (at least 6 characters).
 */
export function validatePassword(password?: string | null): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' }
  }

  return { isValid: true }
}

/**
 * Returns true if password has minimum required length.
 */
export function isValidPassword(password?: string | null): boolean {
  return validatePassword(password).isValid
}
