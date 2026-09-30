import { CheckCircle2, ShieldCheck, Zap, Users } from 'lucide-react'

const features = [
  {
    title: "Verified Listings",
    description: "Our administrative team reviews business contact details, addresses, and phone numbers to confirm authenticity.",
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "Nationwide Reach",
    description: "Explore businesses, verified professionals, and job opportunities across neighborhoods and communities throughout the United States on BizNest USA.",
    icon: <Users className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Direct Contact",
    description: "Connect directly via phone, corporate websites, and verified emails without registration walls or hidden paywalls.",
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />
  },
  {
    title: "Fast & Mobile First",
    description: "Search and discover local businesses in seconds with our optimized mobile-first directory.",
    icon: <Zap className="w-8 h-8 text-amber-500" />
  }
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose BizNest USA?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We are dedicated to building a transparent and verified American business directory, 
            connecting customers with verified local services, licensed talent, and career opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80">
          <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
            <span className="text-xl">✅</span> 100% Free Listing
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
            <span className="text-xl">🛡️</span> Verified Contact Details
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
            <span className="text-xl">📍</span> All 50 US States
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
            <span className="text-xl">🤝</span> Direct Communication
          </div>
        </div>
      </div>
    </section>
  )
}
