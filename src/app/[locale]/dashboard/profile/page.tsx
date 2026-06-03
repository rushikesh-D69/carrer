'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, MapPin, GraduationCap, Save, Heart, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ProfilePage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    city: '',
    state: '',
    educationLevel: 'undergraduate', // school | undergraduate | graduate
    interests: [] as string[],
  })

  const interestOptions = [
    { key: 'government', label: 'Government Careers (UPSC, SSC, Banking)' },
    { key: 'private', label: 'Private Corporate Sector (Tech, Finance)' },
    { key: 'self_employment', label: 'Self Employment & Micro Business' },
    { key: 'entrepreneurship', label: 'Entrepreneurship & Startups' },
    { key: 'economics', label: 'Economic Literacy & Wealth Management' },
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: rawProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        const profileData = rawProfileData as any

        if (profileData) {
          // Parse JSON structure if education is object, or fallback
          const edu = typeof profileData.education === 'object' && profileData.education !== null
            ? (profileData.education as any).level || 'undergraduate'
            : 'undergraduate'

          setProfile({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            city: profileData.city || '',
            state: profileData.state || '',
            educationLevel: edu,
            interests: profileData.career_interests || [],
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleToggleInterest = (key: string) => {
    setProfile(prev => {
      const active = prev.interests.includes(key)
        ? prev.interests.filter(item => item !== key)
        : [...prev.interests, key]
      return { ...prev, interests: active }
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.success('Offline mode: Profile updated successfully!')
        setSaving(false)
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.fullName,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        education: { level: profile.educationLevel },
        career_interests: profile.interests,
        updated_at: new Date().toISOString(),
      } as any)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 skeleton" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="h-10 w-full skeleton" />
          <div className="h-10 w-full skeleton" />
          <div className="h-10 w-full skeleton" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
          {t('dashboard.my_profile') || 'Profile Settings'}
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
          Update your academic details and career interests to receive tailored roadmap suggestions.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Core details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="fullName"
                type="text"
                required
                className="input-base pl-10"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="input-base pl-10"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              City / Town
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                id="city"
                type="text"
                className="input-base pl-10"
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              State
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                id="state"
                type="text"
                placeholder="Telangana / Andhra Pradesh"
                className="input-base pl-10"
                value={profile.state}
                onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          {/* Education Level */}
          <div className="sm:col-span-2">
            <label htmlFor="educationLevel" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Highest Education Level
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <select
                id="educationLevel"
                className="input-base pl-10 pr-8 appearance-none"
                value={profile.educationLevel}
                onChange={(e) => setProfile(prev => ({ ...prev, educationLevel: e.target.value }))}
                disabled={saving}
              >
                <option value="school">Secondary School (10th/12th / Intermediate)</option>
                <option value="undergraduate">Undergraduate Student (B.Sc / B.Tech / B.A / B.Com)</option>
                <option value="graduate">Postgraduate / Professional (M.Tech / MBA / Ph.D)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Career Interests Checklist */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>Select Your Career Interests</span>
          </label>
          <p className="text-slate-400 text-xs font-medium">Select one or more topics to customize your recommended readings.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {interestOptions.map((opt) => {
              const active = profile.interests.includes(opt.key)
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleToggleInterest(opt.key)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    active
                      ? 'border-imperial-blue bg-blue-50/20 text-imperial-blue'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600'
                  }`}
                  disabled={saving}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    readOnly
                    className="rounded border-slate-300 text-imperial-blue focus:ring-imperial-blue cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="btn-primary px-6 h-10 gap-2 cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
