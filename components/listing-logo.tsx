import Image from 'next/image'

// Generic Unsplash images previously used as logo/avatar fallbacks across the
// site. A stored URL matching one of these is treated as "no logo", so
// existing records that still carry one render an initial tile instead.
const GENERIC_FALLBACK_IDS = [
  'photo-1618005182384-a83a8bd57fbe', // generic abstract image used as logo fallback
  'photo-1534528741775-53994a69daeb', // generic portrait used as avatar fallback
  'photo-1581578731548-c64695cc6952', // generic stock photo used as logo/cover fallback
]

export interface ListingLogoProps {
  name: string
  src?: string | null
  size?: number
  className?: string
  priority?: boolean
}

export function ListingLogo({ name, src, size = 40, className, priority = false }: ListingLogoProps) {
  const trimmed = (src || '').trim()
  const isRealLogo = trimmed !== '' && !GENERIC_FALLBACK_IDS.some((id) => trimmed.includes(id))

  if (isRealLogo) {
    return (
      <Image
        src={trimmed}
        alt={name}
        width={size}
        height={size}
        priority={priority}
        className={className}
      />
    )
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'
  // Sites that render the logo inside a fixed-size wrapper pass w-full/h-full
  // in className; let those classes size the tile instead of the fixed size.
  const fillsWidth = /\bw-full\b/.test(className || '')
  const fillsHeight = /\bh-full\b/.test(className || '')

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-[#2563EB] font-bold text-white select-none shrink-0 ${className || ''}`}
      style={{
        width: fillsWidth ? undefined : size,
        height: fillsHeight ? undefined : size,
        fontSize: Math.round(size * 0.45),
      }}
    >
      {initial}
    </div>
  )
}

export default ListingLogo
