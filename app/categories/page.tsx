import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES } from '@/lib/data'
import { getSubcategoryHref } from '@/lib/services-data'
import Link from 'next/link'
import { 
  Sparkles, ArrowRight, Building2, ChevronRight,
  Wrench, Briefcase, HeartPulse, UtensilsCrossed, Car,
  Scissors, GraduationCap, Laptop, Home, HardHat,
  ShoppingBag, DollarSign, PawPrint, Scale, Sparkle, PartyPopper
} from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Categories in the USA | BizNestUSA Directory',
  description: 'Explore business categories in the United States including home services, technology, healthcare, professional services, pet care, legal, automotive, and local contractors.',
  alternates: { canonical: 'https://biznestusa.com/categories/' },
  openGraph: {
    title: 'Business Categories in the USA | BizNestUSA Directory',
    description: 'Explore business categories in the United States including home services, technology, healthcare, professional services, pet care, legal, automotive, and local contractors.',
    url: 'https://biznestusa.com/categories/',
    type: 'website',
  },
}

function getCategoryIcon(catId: string) {
  switch (catId) {
    case 'home-services': return <Wrench className="w-5 h-5 text-sky-600" />
    case 'professional-services': return <Briefcase className="w-5 h-5 text-indigo-600" />
    case 'health-wellness': return <HeartPulse className="w-5 h-5 text-rose-600" />
    case 'restaurants-food': return <UtensilsCrossed className="w-5 h-5 text-amber-600" />
    case 'automotive': return <Car className="w-5 h-5 text-teal-600" />
    case 'beauty-personal-care': return <Scissors className="w-5 h-5 text-fuchsia-600" />
    case 'education': return <GraduationCap className="w-5 h-5 text-violet-600" />
    case 'technology': return <Laptop className="w-5 h-5 text-blue-600" />
    case 'real-estate': return <Home className="w-5 h-5 text-emerald-600" />
    case 'construction': return <HardHat className="w-5 h-5 text-orange-600" />
    case 'retail': return <ShoppingBag className="w-5 h-5 text-pink-600" />
    case 'finance': return <DollarSign className="w-5 h-5 text-blue-700" />
    case 'pets-animals': return <PawPrint className="w-5 h-5 text-emerald-600" />
    case 'legal-services': return <Scale className="w-5 h-5 text-indigo-700" />
    case 'cleaning-maintenance': return <Sparkle className="w-5 h-5 text-cyan-600" />
    case 'events-weddings': return <PartyPopper className="w-5 h-5 text-pink-600" />
    default: return <Building2 className="w-5 h-5 text-blue-600" />
  }
}

export default function CategoriesIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <section className="bg-white border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>National Directory Taxonomy</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Browse Businesses by Category
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Explore verified businesses, licensed contractors, certified specialists, pet care providers, legal counsel, and employers across the United States.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <Link href={`/category/${cat.id}`} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <span>View Category</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div>
                  <Link href={`/category/${cat.id}`} className="text-base font-bold text-slate-900 hover:text-blue-600 block">
                    {cat.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {cat.subcategories.slice(0, 6).map((sub) => (
                    <Link
                      key={sub}
                      href={getSubcategoryHref(sub, cat.id)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                  {cat.subcategories.length > 6 && (
                    <Link
                      href={`/category/${cat.id}`}
                      className="text-[11px] text-blue-600 font-medium self-center hover:underline"
                    >
                      +{cat.subcategories.length - 6} more
                    </Link>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="text-slate-500 hover:text-blue-600 font-medium"
                >
                  Search in {cat.name}
                </Link>
                <Link
                  href={`/category/${cat.id}`}
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
