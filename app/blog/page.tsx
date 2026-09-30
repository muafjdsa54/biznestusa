import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data'
import { getAllPublishedBusinessPosts } from '@/lib/user-post-service'
import { 
  BookOpen, Sparkles, ShieldCheck, ArrowRight, Clock, User, 
  ChevronRight, Building2, Users, Briefcase, Calendar, FileText 
} from 'lucide-react'

export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Editorial Guides & Industry Resources | BizNest USA',
  description: 'Expert research, local SEO strategies, contractor licensing guides, and hiring benchmarks for American businesses, independent professionals, and employers.',
  alternates: {
    canonical: 'https://biznestusa.com/blog',
  },
  openGraph: {
    title: 'Editorial Guides & Industry Resources | BizNest USA',
    description: 'Expert research, local SEO strategies, contractor licensing guides, and hiring benchmarks across the United States.',
    url: 'https://biznestusa.com/blog',
    type: 'website',
  },
}

export default async function BlogIndexPage() {
  const posts = Object.values(BLOG_POSTS)
  const featuredPost = posts[0]
  const regularPosts = posts.slice(1)
  const businessPosts = await getAllPublishedBusinessPosts(30)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Hero Section */}
        <section className="bg-white border-b border-slate-200/80 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Topical Authority &amp; Research</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                USA Directory Guides, Compliance &amp; Career Insights
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                In-depth educational resources researched to help American small businesses grow local prominence, professionals build standout portfolios, and employers recruit top US talent.
              </p>
            </div>

            {/* Editorial Disclosure Banner separating UGC from Editorial content */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Editorial Transparency:</strong> Our articles and guides are independently researched by the BizNest USA editorial team for educational purposes. Business articles and directory listings across our platform are created and managed directly by the respective business owners and professionals (UGC).
              </p>
            </div>
          </div>
        </section>

        {/* Content Clusters Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          
          {/* Featured Cornerstone Article */}
          {featuredPost && (
            <div>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start justify-between">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200">
                        Featured Guide
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        {featuredPost.title}
                      </Link>
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        By <span className="font-semibold text-slate-800">{featuredPost.authorName}</span>
                      </div>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 group"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Supporting Topical Pillar Info Box */}
                  <div className="w-full lg:w-80 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 shrink-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Topical Pillar
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>{featuredPost.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Includes checklists for state licensing verification, liability insurance verification, and authentic client reviews.
                    </p>
                    <Link
                      href="/category/home-services"
                      className="block text-xs font-semibold text-blue-700 hover:underline pt-1"
                    >
                      Browse Related Home Service Businesses →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER-GENERATED BUSINESS ARTICLES SECTION (Requirement 11 & 26) */}
          {businessPosts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Articles by Verified US Businesses</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Insights and service advice authored by verified American businesses and contractors.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {businessPosts.length} Articles Published
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessPosts.map((bPost) => (
                  <article
                    key={bPost.id || bPost.slug}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={`/business/${bPost.businessSlug}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors truncate max-w-[200px]"
                        >
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{bPost.businessName}</span>
                        </Link>
                        <span className="text-slate-400 text-[11px]">
                          {bPost.publishedAt ? new Date(bPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${bPost.slug}`}>
                          {bPost.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {bPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                      <Link
                        href={`/business/${bPost.businessSlug}`}
                        className="text-[11px] text-slate-500 hover:text-blue-600 font-medium truncate max-w-[160px]"
                      >
                        By {bPost.authorName || bPost.businessName}
                      </Link>
                      <Link
                        href={`/blog/${bPost.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Regular Editorial Articles Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Researched Guides &amp; Handbooks
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Editorial compliance guides, licensing checklists, and hiring benchmarks.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {posts.length} Guides Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => {
                const PillarIcon = post.pillar === 'businesses'
                  ? Building2
                  : post.pillar === 'professionals'
                  ? Users
                  : Briefcase

                return (
                  <article
                    key={post.slug}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] text-blue-700 bg-blue-50 border border-blue-200">
                          <PillarIcon className="w-3 h-3" />
                          <span>{post.category}</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">{post.readTime}</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {post.authorName}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          {/* UGC Acquisition / Conversion Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700">
                Join America&apos;s Verified Directory
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Are you an American business owner or independent professional?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Create a dedicated public profile page on BizNest USA in minutes. Showcase your trade services, verified skills, and portfolio directly to local customers and hiring employers across the country.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/add-business"
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all"
                >
                  List Your Business Free
                </Link>
                <Link
                  href="/register/professional"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
                >
                  Create Professional Profile
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
