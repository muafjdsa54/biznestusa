'use client'

import React, { useState, useEffect } from 'react'
import {
  CmsCategory,
  CmsLocation,
  CmsArticle,
  SiteSettings,
  getCmsCategories,
  saveCmsCategory,
  deleteCmsCategory,
  getCmsLocations,
  saveCmsLocation,
  deleteCmsLocation,
  getCmsArticles,
  saveCmsArticle,
  deleteCmsArticle,
  getSiteSettings,
  saveSiteSettings
} from '@/lib/admin-cms-service'
import {
  Tag,
  MapPin,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  Globe,
  RefreshCw,
  X,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminCmsTabsProps {
  activeTab: 'categories' | 'locations' | 'articles' | 'settings'
}

export default function AdminCmsTabs({ activeTab }: AdminCmsTabsProps) {
  // Categories State
  const [categories, setCategories] = useState<CmsCategory[]>([])
  const [editingCategory, setEditingCategory] = useState<CmsCategory | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categorySubcatsInput, setCategorySubcatsInput] = useState('')

  // Locations State
  const [locations, setLocations] = useState<CmsLocation[]>([])
  const [editingLocation, setEditingLocation] = useState<CmsLocation | null>(null)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  // Articles State
  const [articles, setArticles] = useState<CmsArticle[]>([])
  const [editingArticle, setEditingArticle] = useState<CmsArticle | null>(null)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)

  // Settings State
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTabData()
  }, [activeTab])

  const loadTabData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'categories') {
        const data = await getCmsCategories()
        setCategories(data)
      } else if (activeTab === 'locations') {
        const data = await getCmsLocations()
        setLocations(data)
      } else if (activeTab === 'articles') {
        const data = await getCmsArticles()
        setArticles(data)
      } else if (activeTab === 'settings') {
        const data = await getSiteSettings()
        setSettings(data)
      }
    } catch (err) {
      console.error('Error loading CMS data:', err)
      toast.error('Failed to load CMS data from Firestore.')
    } finally {
      setLoading(false)
    }
  }

  // --- CATEGORIES HANDLERS ---
  const handleOpenCategoryModal = (cat?: CmsCategory) => {
    if (cat) {
      setEditingCategory(cat)
      setCategorySubcatsInput((cat.subcategories || []).join(', '))
    } else {
      setEditingCategory({
        id: '',
        name: '',
        slug: '',
        description: '',
        subcategories: [],
        seoTitle: '',
        metaDescription: '',
        featured: true
      })
      setCategorySubcatsInput('')
    }
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const subcats = categorySubcatsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const toSave: CmsCategory = {
        ...editingCategory,
        subcategories: subcats,
        slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }

      await saveCmsCategory(toSave)
      toast.success(`Category "${toSave.name}" saved!`)
      setIsCategoryModalOpen(false)
      loadTabData()
    } catch (err) {
      toast.error('Failed to save category.')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      await deleteCmsCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success(`Category "${name}" deleted.`)
    } catch (err) {
      toast.error('Failed to delete category.')
    }
  }

  // --- LOCATIONS HANDLERS ---
  const handleOpenLocationModal = (loc?: CmsLocation) => {
    if (loc) {
      setEditingLocation(loc)
    } else {
      setEditingLocation({
        id: '',
        city: '',
        state: 'United States',
        stateCode: 'US',
        slug: '',
        description: '',
        heroHeading: '',
        featured: true
      })
    }
    setIsLocationModalOpen(true)
  }

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLocation) return

    try {
      const slug = editingLocation.slug || editingLocation.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const toSave: CmsLocation = {
        ...editingLocation,
        slug
      }

      await saveCmsLocation(toSave)
      toast.success(`Location "${toSave.city}" saved!`)
      setIsLocationModalOpen(false)
      loadTabData()
    } catch (err) {
      toast.error('Failed to save location.')
    }
  }

  const handleDeleteLocation = async (id: string, city: string) => {
    if (!confirm(`Delete location "${city}"?`)) return
    try {
      await deleteCmsLocation(id)
      setLocations(prev => prev.filter(l => l.id !== id))
      toast.success(`Location "${city}" deleted.`)
    } catch (err) {
      toast.error('Failed to delete location.')
    }
  }

  // --- ARTICLES HANDLERS ---
  const handleOpenArticleModal = (art?: CmsArticle) => {
    if (art) {
      setEditingArticle(art)
    } else {
      setEditingArticle({
        id: '',
        title: '',
        slug: '',
        pillar: 'businesses',
        excerpt: '',
        content: '',
        authorName: 'BizNest USA Editorial Team',
        status: 'published',
        seoTitle: '',
        metaDescription: ''
      })
    }
    setIsArticleModalOpen(true)
  }

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArticle) return

    try {
      const slug = editingArticle.slug || editingArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const toSave: CmsArticle = {
        ...editingArticle,
        slug
      }

      await saveCmsArticle(toSave)
      toast.success(`Article "${toSave.title}" saved!`)
      setIsArticleModalOpen(false)
      loadTabData()
    } catch (err) {
      toast.error('Failed to save article.')
    }
  }

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete article "${title}"?`)) return
    try {
      await deleteCmsArticle(id)
      setArticles(prev => prev.filter(a => a.id !== id))
      toast.success(`Article deleted.`)
    } catch (err) {
      toast.error('Failed to delete article.')
    }
  }

  // --- SETTINGS HANDLERS ---
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setIsSavingSettings(true)
    try {
      await saveSiteSettings(settings)
      toast.success('Platform settings updated successfully!')
    } catch (err) {
      toast.error('Failed to save platform settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs font-bold text-slate-600">Loading {activeTab} from database...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>Directory Categories ({categories.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage business taxonomy, subcategories, and SEO meta tags without editing codebase.
              </p>
            </div>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.slug}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      /{cat.slug}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{cat.description}</p>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Subcategories:</span>
                      <div className="flex flex-wrap gap-1">
                        {cat.subcategories.slice(0, 4).map((sub, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center">
                            +{cat.subcategories.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {cat.featured ? 'Featured' : 'Standard'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LOCATIONS MANAGEMENT */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Metro &amp; City Hubs ({locations.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize local city landing pages, SEO descriptions, and local headings.
              </p>
            </div>
            <button
              onClick={() => handleOpenLocationModal()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Metro City</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id || loc.slug}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      /city/{loc.slug}
                    </span>
                    <button
                      onClick={() => handleDeleteLocation(loc.id, loc.city)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition"
                      title="Delete Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{loc.city}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{loc.state} ({loc.stateCode})</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {loc.description || loc.heroHeading || 'Metro directory landing page.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`/city/${loc.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>View City Directory</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] text-slate-400">USA Metro</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ARTICLES / EDITORIAL GUIDES */}
      {activeTab === 'articles' && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Editorial Guides &amp; Articles ({articles.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Publish high-authority guides supporting the 3 pillars (Businesses, Professionals, Jobs).
              </p>
            </div>
            <button
              onClick={() => handleOpenArticleModal()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Guide</span>
            </button>
          </div>

          <div className="space-y-4">
            {articles.map((art) => (
              <div
                key={art.id || art.slug}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {art.pillar}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Status: {art.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{art.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{art.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenArticleModal(art)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(art.id, art.title)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PLATFORM SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="space-y-6 animate-in fade-in-50 max-w-4xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>General Platform Settings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure brand name, support channels, and default directory SEO metadata without code modifications.
              </p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
                  <input
                    type="text"
                    required
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Support Email Desk</label>
                  <input
                    type="email"
                    required
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Toll-Free / Support Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Physical Office</label>
                  <input
                    type="text"
                    value={settings.officeAddress}
                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Announcement Banner Notification</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={settings.announcementEnabled}
                      onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Banner</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="e.g. Free listings open for all US small businesses and independent contractors."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* SEO Defaults */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Meta Title</label>
                  <input
                    type="text"
                    value={settings.defaultMetaTitle}
                    onChange={(e) => setSettings({ ...settings, defaultMetaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Meta Description</label>
                  <textarea
                    rows={2}
                    value={settings.defaultMetaDescription}
                    onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving to Database...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CATEGORY EDIT */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Legal & Law Practice"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Slug (lowercase-with-hyphens)</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="e.g. legal-services"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Brief summary of businesses in this category..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subcategories (comma separated)</label>
                <input
                  type="text"
                  value={categorySubcatsInput}
                  onChange={(e) => setCategorySubcatsInput(e.target.value)}
                  placeholder="e.g. Corporate Law, Family Law, Criminal Defense, Real Estate Closings"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom SEO Title (Optional)</label>
                  <input
                    type="text"
                    value={editingCategory.seoTitle || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, seoTitle: e.target.value })}
                    placeholder="e.g. Top Plumbers Directory in USA"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom H1 Heading (Optional)</label>
                  <input
                    type="text"
                    value={editingCategory.h1 || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, h1: e.target.value })}
                    placeholder="e.g. Plumbers & Drain Specialists Directory"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meta Description (Optional)</label>
                <textarea
                  rows={2}
                  value={editingCategory.metaDescription || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, metaDescription: e.target.value })}
                  placeholder="Compelling meta description summarizing category for search engines..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Intro Content (Optional)</label>
                <textarea
                  rows={2}
                  value={editingCategory.introContent || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, introContent: e.target.value })}
                  placeholder="Introductory text displayed at top of category page explaining value..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Long Editorial Description (Optional)</label>
                <textarea
                  rows={3}
                  value={editingCategory.longDescription || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, longDescription: e.target.value })}
                  placeholder="In-depth guide, what to compare, and overview of services included..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category-Aware CTA Heading</label>
                  <input
                    type="text"
                    value={editingCategory.ctaHeading || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, ctaHeading: e.target.value })}
                    placeholder="e.g. Own a Plumbing Business?"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category CTA Body Text</label>
                  <input
                    type="text"
                    value={editingCategory.ctaText || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, ctaText: e.target.value })}
                    placeholder="e.g. Get discovered by customers searching for plumbers."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Search Engine Indexing Control</span>
                  <span className="text-[11px] text-slate-500">Prevent search engines from indexing this category</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingCategory.noIndex || false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, noIndex: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>noindex</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: LOCATION EDIT */}
      {isLocationModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingLocation.id ? 'Edit Metro Location' : 'Add Metro Location'}
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.city}
                    onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                    placeholder="e.g. Austin"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State Code *</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.stateCode}
                    onChange={(e) => setEditingLocation({ ...editingLocation, stateCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. TX"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State Full Name</label>
                <input
                  type="text"
                  value={editingLocation.state}
                  onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                  placeholder="e.g. Texas"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Heading</label>
                <input
                  type="text"
                  value={editingLocation.heroHeading || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, heroHeading: e.target.value })}
                  placeholder="e.g. Best Local Businesses & Services in Austin, TX"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location SEO Description</label>
                <textarea
                  rows={2}
                  value={editingLocation.description || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: ARTICLE EDIT */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingArticle.id ? 'Edit Editorial Article' : 'Write New Article'}
              </h3>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="e.g. How to Verify Licensed Trade Contractors in the USA"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topical Pillar</label>
                  <select
                    value={editingArticle.pillar}
                    onChange={(e) => setEditingArticle({ ...editingArticle, pillar: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="businesses">Business Directory</option>
                    <option value="professionals">Professional Talent</option>
                    <option value="jobs">Jobs & Hiring</option>
                    <option value="guides">General Guides</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publish Status</label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="published">Published Live</option>
                    <option value="draft">Draft Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.excerpt}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  placeholder="Key takeaway for search results and previews..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Content</label>
                <textarea
                  rows={6}
                  required
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="Write article paragraphs and guidelines..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
