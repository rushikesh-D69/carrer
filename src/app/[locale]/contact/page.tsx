'use client'

import { useState, use } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Send, MessageSquare, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { submitContactLead } from '@/app/actions/contact'
import TurnstileWidget from '@/components/security/TurnstileWidget'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default function ContactPage({ params }: PageProps) {
  const { locale } = use(params)
  const t = useTranslations()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    career_interest: '',
    message: '',
    website: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await submitContactLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        career_interest: formData.career_interest,
        message: formData.message,
        honeypot: formData.website,
        turnstileToken,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setSuccess(true)
      toast.success(t('contact.success'))
      setFormData({
        name: '',
        email: '',
        phone: '',
        career_interest: '',
        message: '',
        website: '',
      })
    } catch {
      toast.error(t('contact.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner */}
      <section className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-base relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-school-bus-yellow text-xs font-semibold uppercase tracking-wider mb-4 border border-white/5">
            <MessageSquare className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Grid Area */}
      <section className="container-base py-12 -mt-8 relative z-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contact info */}
          <div className="lg:col-span-1 bg-imperial-blue text-white rounded-2xl p-6 md:p-8 space-y-8 shadow-md relative overflow-hidden">
            {/* Background Accent glow */}
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-school-bus-yellow/10 blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-xl text-white">
                Contact Information
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect with our administrative desk or request direct consultations with the professor.
              </p>
            </div>

            {/* Info details */}
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                  <Mail className="w-5 h-5 text-school-bus-yellow" />
                </div>
                <div>
                  <span className="text-[10px] text-white/55 font-bold uppercase tracking-wider block">Email Address</span>
                  <a href="mailto:info@ramanujonomics.com" className="text-white hover:text-school-bus-yellow font-semibold text-sm transition-colors">
                    info@ramanujonomics.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                  <Phone className="w-5 h-5 text-school-bus-yellow" />
                </div>
                <div>
                  <span className="text-[10px] text-white/55 font-bold uppercase tracking-wider block">Phone Number</span>
                  <a href="tel:+919999999999" className="text-white hover:text-school-bus-yellow font-semibold text-sm transition-colors">
                    +91 99999 99999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                  <MapPin className="w-5 h-5 text-school-bus-yellow" />
                </div>
                <div>
                  <span className="text-[10px] text-white/55 font-bold uppercase tracking-wider block">Desk Office</span>
                  <span className="text-white font-semibold text-sm">
                    Hyderabad, Telangana, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900">Enquiry Submitted</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  {t('contact.success')}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-primary text-sm px-6"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden
                />
                <h3 className="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  Send a Direct Message
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Anand Rao"
                      className="input-base text-sm"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {t('contact.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. anand@email.com"
                      className="input-base text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 99999 99999"
                      className="input-base text-sm"
                    />
                  </div>

                  {/* Career Interest */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 text-slate-400" />
                      {t('contact.career_interest')}
                    </label>
                    <select
                      name="career_interest"
                      value={formData.career_interest}
                      onChange={handleChange}
                      className="input-base text-sm bg-white"
                    >
                      <option value="">Choose a path...</option>
                      <option value="UPSC Civil Services">UPSC Civil Services</option>
                      <option value="SSC CGL">SSC CGL</option>
                      <option value="Banking (IBPS/SBI)">Banking Exams</option>
                      <option value="Software Careers">Software Engineering</option>
                      <option value="Self Employment">Self Employment Ventures</option>
                      <option value="Entrepreneurship">Entrepreneurship & Startups</option>
                      <option value="Economic Literacy">Economic & Wealth Literacy</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {t('contact.message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your detailed query..."
                    className="input-base text-sm"
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    required
                  />
                </div>

                <TurnstileWidget
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(undefined)}
                  className="flex justify-center"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full md:w-auto px-6 h-11 text-sm font-bold justify-center"
                >
                  {loading ? 'Sending...' : t('contact.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
