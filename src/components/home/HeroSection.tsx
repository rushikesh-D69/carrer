'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, CheckCircle, Star, Users, BookOpen, Award } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}


const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function HeroSection() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = (p: string) => `/${locale}${p}`

  return (
    <section
      className="relative min-h-[92dvh] md:min-h-[88dvh] flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Gold accent blob top-right */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #FDC500 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="container-base relative z-10 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-school-bus-yellow fill-current" />
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-6"
            >
              {t('hero.title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs — stacked on mobile, inline on md+ */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            >
              <Link
                href={lp('/careers')}
                className="btn-cta w-full sm:w-auto text-base px-7 h-12 shadow-lg shadow-school-bus-yellow/20"
              >
                {t('hero.cta_primary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={lp('/dashboard/assessments')}
                className="btn-outline w-full sm:w-auto text-base px-7 h-12 border-white/40 text-white hover:bg-white hover:text-imperial-blue"
              >
                {t('hero.cta_secondary')}
              </Link>
              <Link
                href={lp('/events')}
                className="flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm transition-colors w-full sm:w-auto justify-center sm:justify-start"
              >
                <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
                {t('hero.cta_tertiary')}
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-school-bus-yellow" />
                <span>Free for students</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-school-bus-yellow" />
                <span>50+ Career paths</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-school-bus-yellow" />
                <span>Telugu & English</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
