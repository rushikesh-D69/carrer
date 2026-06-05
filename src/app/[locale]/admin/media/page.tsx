'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Trash2, FileText, Image as ImageIcon, Video, Link as LinkIcon, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function MediaLibraryPage() {
  const supabase = createClient()
  const locale = useLocale()
  
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'document',
    alt_text: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setMediaItems(data || [])
    } catch (err) {
      console.error('Error fetching media:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item? It might be in use on the website.')) return;
    
    try {
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
      setMediaItems(mediaItems.filter(m => m.id !== id))
    } catch (err) {
      console.error('Error deleting media:', err)
      alert('Failed to delete media item.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // Ensure YouTube URLs are converted to embed format if they are raw watch URLs
      let finalUrl = formData.url
      if (formData.type === 'video' || formData.type === 'video_thumb') {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = formData.url.match(youtubeRegex)
        if (match && match[1]) {
          finalUrl = `https://www.youtube.com/embed/${match[1]}`
        }
      }

      const payload = {
        title: formData.title,
        url: finalUrl,
        type: formData.type === 'video' ? 'video_thumb' : formData.type, // map video to allowed enum
        alt_text: formData.alt_text,
        uploaded_by: userData.user.id
      }

      const { data, error } = await supabase.from('media').insert(payload as any).select().single()
      if (error) throw error

      setMediaItems([data, ...mediaItems])
      setIsModalOpen(false)
      setFormData({ title: '', url: '', type: 'document', alt_text: '' })
    } catch (err) {
      console.error('Error adding media:', err)
      alert('Failed to add media.')
    } finally {
      setIsUploading(false)
    }
  }

  const filteredMedia = mediaItems.filter(m => {
    const matchesSearch = (m.title?.toLowerCase() || '').includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || 
                      m.type === typeFilter || 
                      (typeFilter === 'video' && m.type === 'video_thumb')
    return matchesSearch && matchType
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Drive / Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">Manage study materials, files, and embedded YouTube videos.</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue transition-all"
            />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-imperial-blue/20"
          >
            <option value="all">All Files</option>
            <option value="document">Study Materials (PDF/Drive)</option>
            <option value="video">Videos (YouTube)</option>
            <option value="image">Images</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full pt-20 text-slate-500">
            <div className="w-8 h-8 border-4 border-imperial-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading Admin Drive...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-20 text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No media found</h3>
            <p className="text-sm mt-1 mb-4">You haven't added any study materials or videos yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-imperial-blue hover:underline">
              Add your first file
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group border border-slate-200 rounded-xl overflow-hidden hover:border-imperial-blue/50 hover:shadow-md transition-all flex flex-col bg-slate-50">
                <div className="aspect-video bg-slate-200 relative flex items-center justify-center overflow-hidden">
                  {item.type === 'video_thumb' ? (
                    <iframe 
                      src={item.url} 
                      className="w-full h-full pointer-events-none" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  ) : item.type === 'image' ? (
                    <img src={item.url} alt={item.alt_text || item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-10 h-10 mb-2" />
                      <span className="text-xs font-semibold uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm">Document</span>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-slate-900 rounded-full hover:bg-imperial-blue hover:text-white transition-colors" title="Open Link">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1 flex-1" title={item.title}>{item.title}</h3>
                    {item.type === 'video_thumb' ? <Video className="w-4 h-4 text-rose-500 shrink-0" /> : 
                     item.type === 'document' ? <FileText className="w-4 h-4 text-blue-500 shrink-0" /> :
                     <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="mt-auto pt-3 flex items-center text-xs text-slate-400 gap-1.5 truncate">
                    <LinkIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add New Media / File</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">File Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['document', 'video', 'image'].map((t) => (
                    <label key={t} className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.type === t ? 'border-imperial-blue bg-blue-50 text-imperial-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="type" 
                        value={t} 
                        checked={formData.type === t}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {t === 'document' && <FileText className="w-5 h-5 mb-1" />}
                      {t === 'video' && <Video className="w-5 h-5 mb-1" />}
                      {t === 'image' && <ImageIcon className="w-5 h-5 mb-1" />}
                      <span className="text-xs font-semibold capitalize">
                        {t === 'document' ? 'File/PDF' : t === 'video' ? 'YouTube' : 'Image'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title / Name *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                  placeholder="e.g. Current Affairs PDF May 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {formData.type === 'video' ? 'YouTube URL *' : 'Drive Link / External URL *'}
                </label>
                <input
                  required
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                  placeholder={formData.type === 'video' ? "https://youtube.com/watch?v=..." : "https://drive.google.com/..."}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  {formData.type === 'video' 
                    ? "Paste any YouTube link, we'll automatically convert it to an embedded player." 
                    : "Paste a shareable Google Drive link, AWS S3 link, or any direct file URL."}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 py-2.5 px-4 bg-imperial-blue hover:bg-french-blue text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Add to Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
