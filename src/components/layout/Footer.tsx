'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  BookOpen, Mail, Phone, MapPin,
  Send, Home, Briefcase, FileText, Calendar, ChevronRight,
  TrendingUp
} from 'lucide-react'

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)


export default function Footer() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = (path: string) => `/${locale}${path}`

  const currentYear = new Date().getFullYear()

  const careerLinks = [
    { label: 'Government Careers', href: lp('/careers?category=government') },
    { label: 'Private Careers', href: lp('/careers?category=private') },
    { label: 'Self Employment', href: lp('/careers?category=self-employment') },
    { label: 'Entrepreneurship', href: lp('/careers?category=entrepreneurship') },
    { label: 'Economic Literacy', href: lp('/careers?category=economic-literacy') },
    { label: 'Compare Careers', href: lp('/compare') },
  ]

  const resourceLinks = [
    { label: 'Blog', href: lp('/blog') },
    { label: 'Events & Seminars', href: lp('/events') },
    { label: 'Announcements', href: lp('/announcements') },
    { label: 'Practice Tests', href: lp('/dashboard/tests') },
    { label: 'Career Assessment', href: lp('/dashboard/assessments') },
    { label: 'Contact Us', href: lp('/contact') },
  ]

  return (
    <footer className="bg-imperial-blue text-white">
      {/* Newsletter Strip */}
      <div className="border-b border-white/10 bg-french-blue/40">
        <div className="container-base py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                {t('newsletter.title')}
              </h3>
              <p className="text-white/70 text-sm">{t('newsletter.subtitle')}</p>
            </div>
            <form
              className="flex w-full md:w-auto gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="input-base bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-school-bus-yellow focus:shadow-none flex-1 md:w-64"
              />
              <button type="submit" className="btn-cta flex-shrink-0 px-5">
                {t('newsletter.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-base py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={lp('/')} className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-school-bus-yellow/20 border border-school-bus-yellow/30">
                <BookOpen className="w-5 h-5 text-school-bus-yellow" />
              </div>
              <div>
                <span className="font-heading font-bold text-white text-lg leading-none block">
                  Ramanujonomics
                </span>
                <span className="text-school-bus-yellow text-xs font-medium">
                  {t('footer.tagline')}
                </span>
              </div>
            </Link>

            <p className="text-white/65 text-sm leading-relaxed mb-5">
              {t('footer.footer_about' as any) ?? 'India\'s premier career guidance platform helping students and professionals build meaningful careers and lasting wealth.'}
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-5">
              <a href="mailto:info@ramanujonomics.com" className="flex items-center gap-2 text-white/70 hover:text-school-bus-yellow text-sm transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@ramanujonomics.com
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-2 text-white/70 hover:text-school-bus-yellow text-sm transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 99999 99999
              </a>
              <div className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Hyderabad, Telangana, India
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-school-bus-yellow/20 hover:text-school-bus-yellow flex items-center justify-center transition-all">
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-school-bus-yellow/20 hover:text-school-bus-yellow flex items-center justify-center transition-all">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-school-bus-yellow/20 hover:text-school-bus-yellow flex items-center justify-center transition-all">
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Telegram" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-school-bus-yellow/20 hover:text-school-bus-yellow flex items-center justify-center transition-all">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Career Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-school-bus-yellow" />
              {t('footer.careers')}
            </h4>
            <ul className="space-y-2.5">
              {careerLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-1.5 text-sm text-white/65 hover:text-school-bus-yellow transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-school-bus-yellow" />
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2.5">
              {resourceLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-1.5 text-sm text-white/65 hover:text-school-bus-yellow transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-school-bus-yellow" />
              Why Ramanujonomics
            </h4>
            <div className="space-y-3">
              {[
                { num: '50+', label: 'Career Paths' },
                { num: '500+', label: 'Practice Questions' },
                { num: '10+', label: 'Free Assessments' },
                { num: 'Telugu', label: 'Language Support' },
              ].map(({ num, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="text-school-bus-yellow font-heading font-bold text-base min-w-[52px]">
                    {num}
                  </div>
                  <div className="text-white/65 text-sm">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-school-bus-yellow/10 border border-school-bus-yellow/20 rounded-xl">
              <p className="text-xs text-white/80 italic leading-relaxed">
                "The goal of education is not to fill a bucket but to light a fire."
              </p>
              <p className="text-xs text-school-bus-yellow font-semibold mt-1">— Ramanujonomics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-base py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/50 text-xs text-center sm:text-left">
              © {currentYear} Ramanujonomics. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-4">
              <Link href={lp('/privacy')} className="text-white/50 hover:text-white/80 text-xs transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href={lp('/terms')} className="text-white/50 hover:text-white/80 text-xs transition-colors">
                {t('footer.terms')}
              </Link>
              <Link href={lp('/sitemap.xml')} className="text-white/50 hover:text-white/80 text-xs transition-colors">
                {t('footer.sitemap')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
