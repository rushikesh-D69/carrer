'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { confirmAndDelete } from '@/lib/admin/helpers'
import { toast } from 'sonner'

export default function BlogEditorPage() {
  const supabase = createClient()
  const locale = useLocale()
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, blog_categories(name), profiles(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBlogs(data || [])
    } catch (err) {
      console.error('Error fetching blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blogs')
        // @ts-ignore
        .update({ 
          published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        } as any)
        .eq('id', id)

      if (error) throw error
      
      setBlogs(blogs.map(b => b.id === id ? { 
        ...b, 
        published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      } : b))
    } catch (err) {
      console.error('Error toggling publish status:', err)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirmAndDelete(title, () => supabase.from('blogs').delete().eq('id', id))
    if (ok) {
      setBlogs((b) => b.filter((x) => x.id !== id))
      toast.success('Article deleted')
    }
  }

  const filteredBlogs = blogs.filter(blog => 
    (blog.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (blog.blog_categories?.name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog Markdown Editor</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your articles, categories, and publications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue transition-all"
            />
          </div>
          <Link href={`/${locale}/admin/blogs/new`} className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Write Article
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Article Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-imperial-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading articles...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No articles found. Click "Write Article" to start your first post.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{blog.title}</div>
                      <div className="text-xs text-slate-500 mt-1">/{blog.slug}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>{blog.view_count || 0} views</span>
                        <span>•</span>
                        <span>{blog.reading_time || 5} min read</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                        {blog.blog_categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{blog.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(blog.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(blog.id, blog.published)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-blue focus:ring-offset-2 ${blog.published ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${blog.published ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-2 text-xs font-medium text-slate-600">
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${locale}/blog/${blog.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-french-blue hover:bg-slate-100 rounded-lg transition-colors" title="View Live">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/${locale}/admin/blogs/${blog.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Markdown">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(blog.id, blog.title)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
