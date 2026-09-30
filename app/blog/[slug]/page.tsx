import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ArticleContent from '@/components/blog/article-content'
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data'
import { NEW_BLOG_CONTENT } from '@/lib/blog-content'
import { getBusinessPostBySlug } from '@/lib/user-post-service'
import { 
  BookOpen, Clock, Calendar, ShieldCheck, ChevronRight, User, 
  ArrowLeft, Building2, Users, Briefcase, HelpCircle, CheckCircle2,
  ExternalLink, Tag
} from 'lucide-react'
import { toCanonicalUrl } from '@/lib/directory-helpers'

export const dynamicParams = true
export const revalidate = 3600

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const editorialPost = BLOG_POSTS[slug]
  
  const canonicalUrl = toCanonicalUrl(`blog/${slug}`)
  
  if (editorialPost) {
    return {
      title: editorialPost.metaTitle,
      description: editorialPost.metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: editorialPost.metaTitle,
        description: editorialPost.metaDescription,
        url: canonicalUrl,
        type: 'article',
        publishedTime: editorialPost.date,
        modifiedTime: editorialPost.dateModified || editorialPost.date,
        authors: [editorialPost.authorName],
      },
    }
  }

  // Fallback: User-generated business post
  const userPost = await getBusinessPostBySlug(slug)
  if (userPost) {
    const metaTitle = userPost.seoTitle || `${userPost.title} | ${userPost.businessName} on BizNest USA`
    const metaDesc = userPost.metaDescription || userPost.excerpt
    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        url: canonicalUrl,
        type: 'article',
        publishedTime: userPost.publishedAt || userPost.createdAt,
        authors: [userPost.authorName || userPost.businessName],
      },
    }
  }

  return { title: 'Guide Not Found | BizNest USA' }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const editorialPost = BLOG_POSTS[slug]
  const contentDoc = NEW_BLOG_CONTENT[slug]

  // CASE 1: EDITORIAL CORNERSTONE ARTICLE
  if (editorialPost) {
    const PillarIcon = editorialPost.pillar === 'businesses'
      ? Building2
      : editorialPost.pillar === 'professionals'
      ? Users
      : Briefcase

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: editorialPost.title,
      description: editorialPost.metaDescription,
      author: {
        '@type': 'Organization',
        name: editorialPost.authorName,
        url: 'https://biznestusa.com/about',
      },
      publisher: {
        '@type': 'Organization',
        name: 'BizNest USA',
        url: 'https://biznestusa.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://biznestusa.com/logo.png',
        },
      },
      datePublished: editorialPost.date,
      dateModified: editorialPost.dateModified || editorialPost.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': toCanonicalUrl(`blog/${slug}`),
      },
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://biznestusa.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Guides & Resources',
          item: toCanonicalUrl('blog'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: editorialPost.title,
          item: toCanonicalUrl(`blog/${slug}`),
        },
      ],
    }

    const faqSchema = editorialPost.faqs && editorialPost.faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: editorialPost.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    } : null

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}

        <Navbar />

        <main className="flex-1 pb-16">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <Link href="/blog" className="hover:text-blue-600">Guides</Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold truncate max-w-xs">{editorialPost.title}</span>
            </div>
          </div>

          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            <header className="space-y-4 pb-8 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-blue-700 bg-blue-50 border border-blue-200">
                  <PillarIcon className="w-3.5 h-3.5" />
                  <span>{editorialPost.category}</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {editorialPost.readTime}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Published {editorialPost.date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {editorialPost.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {editorialPost.excerpt}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    BN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{editorialPost.authorName}</div>
                    <div className="text-[11px] text-slate-500">{editorialPost.authorRole}</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Editorial Research Standard</span>
                </div>
              </div>
            </header>

            <div className="pt-8 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
              {contentDoc ? (
                <ArticleContent content={contentDoc} />
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-slate-200">
                  <p>{editorialPost.excerpt}</p>
                </div>
              )}

              {editorialPost.faqs && editorialPost.faqs.length > 0 && (
                <section className="pt-8 border-t border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {editorialPost.faqs.map((faq, idx) => (
                      <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/90 space-y-2 shadow-2xs">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <section className="mt-12 p-8 bg-blue-50/70 border border-blue-200 rounded-3xl space-y-4 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
                Related Directory Action
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Explore Verified Listings or Publish Your Profile
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect with verified trade businesses and certified professionals across all 50 states on BizNest USA.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/add-business"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  List Your Business
                </Link>
                <Link
                  href="/categories"
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
                >
                  Browse Categories
                </Link>
              </div>
            </section>
          </article>
        </main>

        <Footer />
      </div>
    )
  }

  // CASE 2: USER-GENERATED BUSINESS POST (Requirements 11, 13, 26)
  const userPost = await getBusinessPostBySlug(slug)
  if (!userPost) {
    notFound()
  }

  const businessPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: userPost.title,
    description: userPost.metaDescription || userPost.excerpt,
    author: {
      '@type': 'Organization',
      name: userPost.businessName,
      url: `https://biznestusa.com/business/${userPost.businessSlug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BizNest USA',
      url: 'https://biznestusa.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://biznestusa.com/logo.png',
      },
    },
    datePublished: userPost.publishedAt || userPost.createdAt,
    dateModified: userPost.updatedAt || userPost.publishedAt || userPost.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toCanonicalUrl(`blog/${slug}`),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://biznestusa.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Business Articles',
        item: toCanonicalUrl('blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: userPost.title,
        item: toCanonicalUrl(`blog/${slug}`),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessPostSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/blog" className="hover:text-blue-600">Business Articles</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate max-w-xs">{userPost.title}</span>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Post Header */}
          <header className="space-y-4 pb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Business Attribution Pill with Backlink (Requirement 26) */}
              <Link
                href={`/business/${userPost.businessSlug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Published by {userPost.businessName}</span>
              </Link>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Published {new Date(userPost.publishedAt || userPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {userPost.title}
            </h1>

            {userPost.excerpt && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {userPost.excerpt}
              </p>
            )}

            {/* Author / Business Trust Card */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm">
                  {userPost.businessName ? userPost.businessName.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {userPost.authorName || userPost.businessName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Contributor on BizNest USA
                  </div>
                </div>
              </div>

              <Link
                href={`/business/${userPost.businessSlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl border border-purple-200 transition-colors self-start sm:self-auto"
              >
                <span>View {userPost.businessName} Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Article Body Content */}
          <div className="pt-8 space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base font-normal">
            {userPost.content.split('\n\n').map((paragraph, idx) => {
              const cleanPara = paragraph.trim()
              if (!cleanPara) return null
              return (
                <p key={idx} className="leading-relaxed">
                  {cleanPara}
                </p>
              )
            })}

            {/* Optional Keywords Tags (Requirement 10 & 13) */}
            {userPost.keywords && userPost.keywords.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Related Topics &amp; Services:
                </span>
                <div className="flex flex-wrap gap-2">
                  {userPost.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BUSINESS BACKLINK & DISCOVERY CTA (Requirement 26) */}
          <section className="mt-12 p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Verified Business Author
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Learn more about {userPost.businessName}
                </h3>
              </div>
              <Link
                href={`/business/${userPost.businessSlug}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Visit Business Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This article was authored and published by <strong className="text-slate-800">{userPost.businessName}</strong> on BizNest USA. Explore their verified profile to view their full range of services, location hours, and direct customer contact options.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  )
}
