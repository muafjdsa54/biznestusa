import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BizNest USA Administration Portal',
  description: 'BizNest USA internal administrative dashboard for moderating business listings, verified professionals, and job submissions.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
