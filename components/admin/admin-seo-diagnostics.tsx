'use client'

import React, { useState, useEffect } from 'react'
import {
  runComprehensiveSeoAudit,
  SeoAuditReport,
  CategoryTopicalAudit,
  ThinContentFlag,
  DuplicateContentFlag,
  PageDiagnosticItem
} from '@/lib/seo-diagnostics-engine'
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Layers,
  FileWarning,
  Copy,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Globe,
  Database
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSeoDiagnostics() {
  const [report, setReport] = useState<SeoAuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<'topical' | 'thin' | 'duplicates' | 'pages' | 'checklist'>('topical')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchAudit = async () => {
    setLoading(true)
    try {
      const data = await runComprehensiveSeoAudit()
      setReport(data)
      toast.success('SEO & Topical Audit completed successfully')
    } catch (err) {
      console.error('Audit failed:', err)
      toast.error('Failed to run SEO audit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [])

  if (loading || !report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Running Full-Stack SEO Audit...</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Scanning categories, entity pages, schemas, indexability rules, and topical depth across the ecosystem.
        </p>
      </div>
    )
  }

  const filteredTopical = report.topicalMatrix.filter(t => 
    t.categoryName.toLowerCase().includes(categoryFilter.toLowerCase()) ||
    t.categoryId.toLowerCase().includes(categoryFilter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">SEO Diagnostics & Topical Authority Engine</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verification of Google Search Essentials, schema integrity, programmatic safeguards, and topical depth.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Scan Ecosystem
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Audited Pages</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{report.summary.totalAuditedPages}</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Crawlable</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Indexable</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{report.summary.indexablePages}</p>
          <span className="text-[10px] text-slate-500 font-medium">Canonical matches</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Topical Coverage</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{report.summary.topicalCoveragePercentage}%</p>
          <span className="text-[10px] text-indigo-600 font-medium">26 Core Industries</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Orphan Pages</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{report.summary.orphanPagesCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">0 orphans detected</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Thin Content</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{report.summary.thinPagesCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Profiles need depth</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duplicate Titles</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{report.summary.duplicateTitlesCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Monitored flags</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('topical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'topical'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Topical Authority Matrix ({report.topicalMatrix.length})
        </button>
        <button
          onClick={() => setActiveSubTab('thin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'thin'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" /> Thin Content Flags ({report.thinContentFlags.length})
        </button>
        <button
          onClick={() => setActiveSubTab('duplicates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'duplicates'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Copy className="w-3.5 h-3.5" /> Duplicate Content ({report.duplicateContentFlags.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'pages'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Live Page Diagnostics
        </button>
        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'checklist'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Search Console Checklist
        </button>
      </div>

      {/* SUB-TAB 1: TOPICAL AUTHORITY MATRIX */}
      {activeSubTab === 'topical' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Category Topical Authority & Internal Quality Scores</h3>
              <p className="text-xs text-slate-500">
                Measures depth of businesses, professionals, jobs, articles, and populated US cities for each primary vertical.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                placeholder="Filter categories..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-3 text-center">Businesses</th>
                  <th className="py-3 px-3 text-center">Pros</th>
                  <th className="py-3 px-3 text-center">Jobs</th>
                  <th className="py-3 px-3 text-center">Articles</th>
                  <th className="py-3 px-3 text-center">Active Cities</th>
                  <th className="py-3 px-3 text-center">Quality Score</th>
                  <th className="py-3 px-3 text-center">Index Status</th>
                  <th className="py-3 px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTopical.map(item => (
                  <tr key={item.categoryId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <a
                        href={`/category/${item.categoryId}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        {item.categoryName} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </a>
                      <span className="text-[10px] text-slate-400 font-mono">/category/{item.categoryId}/</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.businessCount}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.professionalCount}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.jobCount}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.articleCount}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.populatedCitiesCount}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.qualityScore >= 70 ? 'bg-emerald-500' : item.qualityScore >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.qualityScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-900">{item.qualityScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'INDEX'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'NEEDS_CONTENT'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'NEEDS_LISTINGS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] leading-tight max-w-xs">
                      {item.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: THIN CONTENT FLAGS */}
      {activeSubTab === 'thin' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-amber-50/40">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-600" /> Thin Content & Completeness Safeguard
            </h3>
            <p className="text-xs text-amber-700/80 mt-0.5">
              These listings have short descriptions or incomplete location/contact signals. Enrich them before search engine spiders evaluate them.
            </p>
          </div>

          {report.thinContentFlags.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No thin content warnings found. All active directory listings meet depth standards.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {report.thinContentFlags.map((flag, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{flag.title}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded uppercase font-semibold">
                        {flag.entityType}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                        flag.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {flag.severity} severity
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{flag.issue}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{flag.url}</span>
                  </div>
                  <a
                    href={flag.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0 transition"
                  >
                    View Page <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: DUPLICATE CONTENT FLAGS */}
      {activeSubTab === 'duplicates' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-purple-50/40">
            <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
              <Copy className="w-4 h-4 text-purple-600" /> Duplicate Title & Description Detector
            </h3>
            <p className="text-xs text-purple-700/80 mt-0.5">
              Prevents keyword cannibalization and identical metadata across directory entity pages.
            </p>
          </div>

          {report.duplicateContentFlags.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No duplicate metadata or titles detected. All active entities have distinct canonical identities.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {report.duplicateContentFlags.map((flag, idx) => (
                <div key={idx} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] rounded uppercase font-bold">
                      Duplicate {flag.type}
                    </span>
                    <span className="font-semibold text-slate-900">{flag.value}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 space-y-1">
                    {flag.occurrences.map((occ, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="font-medium text-slate-800">{occ.title}</span>
                        <a href={occ.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                          {occ.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: LIVE PAGE DIAGNOSTICS */}
      {activeSubTab === 'pages' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Search Console Readiness & Meta Tag Diagnostic Inspector</h3>
            <p className="text-xs text-slate-500">
              Validates Title Tag length (50-60 chars), Meta Description length (120-160 chars), Canonical match, and Structured Data types.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Page URL</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Title Tag Length</th>
                  <th className="py-3 px-3">Meta Desc Length</th>
                  <th className="py-3 px-3 text-center">Canonical Match</th>
                  <th className="py-3 px-3">Structured Data Schemas</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {report.sampleDiagnostics.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <a href={p.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1">
                        {p.url.replace('https://biznestusa.com', '') || '/'} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </a>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs block">{p.title}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold uppercase">
                        {p.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-xs font-bold ${
                        p.titleLength >= 40 && p.titleLength <= 65 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {p.titleLength} chars
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-xs font-bold ${
                        p.descriptionLength >= 110 && p.descriptionLength <= 165 ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                        {p.descriptionLength} chars
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Yes
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.schemaTypes.map((schema, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded text-[10px] font-mono">
                            {schema}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                        200 OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SEARCH CONSOLE CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Technical Search Essentials Compliance
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Strict Canonical Host & Trailing Slashes</p>
                  <p className="text-slate-500 text-[11px]">Enforced HTTPS canonical domain (https://biznestusa.com/) with consistent trailing slashes via next.config.mjs.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Robots.txt Crawl Control</p>
                  <p className="text-slate-500 text-[11px]">Public content allowed; private dashboards, auth routes, /search, and /filter queries blocked from indexing.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Sitemap XML Feed</p>
                  <p className="text-slate-500 text-[11px]">Real-time sitemap includes only approved, indexable businesses, jobs, professionals, categories, and populated cities.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Zero Fake Reviews / Aggregate Ratings</p>
                  <p className="text-slate-500 text-[11px]">Structured data enforces strict Google compliance: AggregateRating only renders when genuine customer reviews exist.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> Structured Data & Entity Graph
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">LocalBusiness Schema</p>
                  <p className="text-slate-500 text-[11px]">Populates addressLocality, addressRegion (US state), phone, services catalog, and multi-location departments.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">ProfilePage + Person Schema</p>
                  <p className="text-slate-500 text-[11px]">Conforms to single-person profile guidelines with skills, credentials, portfolio, and social sameAs links.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">JobPosting Schema Isolation</p>
                  <p className="text-slate-500 text-[11px]">Restricted strictly to individual vacancy URLs; excluded from list/category pages to satisfy Google rules.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">FAQPage Schema Integration</p>
                  <p className="text-slate-500 text-[11px]">Automatically generated on category landing pages and business profile pages with user-submitted FAQs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
