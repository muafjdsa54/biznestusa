import { Search, Users, Globe, TrendingUp, MapPin } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className="w-full border-y border-slate-200 bg-white" aria-labelledby="what-is-biznest">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-5xl">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4 border border-blue-200">
            <Globe className="w-3.5 h-3.5" />
            Verified American Business Ecosystem
          </span>
          <h2 id="what-is-biznest" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            What is BizNest USA?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BizNest USA is an American business and professional directory built for connecting clients with verified local services. Find verified <strong>local businesses by city</strong> and{' '}
            <a className="text-blue-600 font-medium hover:underline" href="/categories/" title="Browse all business categories in the USA">
              business categories across the United States
            </a>
            , or list your own enterprise at no cost.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Search &amp; Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Find contractors, healthcare practices, shops, and services by state and metro.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Free Listing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Submit your business profile free with complete NAP details and website link.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">All 50 States</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Covering top metros from New York and Los Angeles to Austin and Chicago.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Verified Badging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Earn verified credibility through verified license and phone verification.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
            <a 
              href="/add-business/"
              title="Add your business listing for free on BizNest USA"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Add Your Business Free
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
