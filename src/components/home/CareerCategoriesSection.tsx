'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Landmark, Briefcase, Store, Rocket, TrendingUp, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    key: 'government',
    slug: 'government',
    icon: Landmark,
    color: '#00296B',
    bg: '#EEF2FF',
    description: 'UPSC, SSC, RRB, Banking, APPSC and all state exams',
    count: '15+ careers',
  },
  {
    key: 'private',
    slug: 'private',
    icon: Briefcase,
    color: '#003F88',
    bg: '#EFF6FF',
    description: 'Corporate, MNC, tech, and industry jobs',
    count: '20+ careers',
  },
  {
    key: 'self_employment',
    slug: 'self-employment',
    icon: Store,
    color: '#00509D',
    bg: '#F0F7FF',
    description: 'Home-based, skill-based, and passion-driven ventures',
    count: '10+ paths',
  },
  {
    key: 'entrepreneurship',
    slug: 'entrepreneurship',
    icon: Rocket,
    color: '#92600A',
    bg: '#FFFBEB',
    description: 'Startups, registration, funding, and legal guidance',
    count: '8+ guides',
  },
  {
    key: 'economic_literacy',
    slug: 'economic-literacy',
    icon: TrendingUp,
    color: '#065F46',
    bg: '#ECFDF5',
    description: 'Wealth, investing, budgeting, and citizen rights',
    count: '12+ topics',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
}


export default function CareerCategoriesSection() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <section className="section bg-surface-2">
      <div className="container-base">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="divider-gold mb-4" />
          <h2 className="section-title">{t('categories.title')}</h2>
          <p className="section-subtitle">{t('categories.subtitle')}</p>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="scroll-cards -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4">
          {CATEGORIES.map(({ key, slug, icon: Icon, color, bg, description, count }, i) => (
            <motion.div
              key={slug}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              // Mobile card width — show 2 at a time with hint of 3rd
              className="w-[72vw] sm:w-64 md:w-auto flex-shrink-0"
            >
              <Link
                href={`/${locale}/careers?category=${slug}`}
                className="group card-base flex flex-col h-full p-5 hover:border-opacity-0 transition-all"
                style={{
                  ['--hover-border' as string]: color,
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                {/* Category name */}
                <h3 className="font-heading font-bold text-base text-foreground mb-2 group-hover:text-imperial-blue transition-colors">
                  {t(`categories.${key}`)}
                </h3>

                {/* Description */}
                <p className="text-muted text-sm leading-relaxed flex-1 mb-3">
                  {description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="badge badge-primary text-[11px]">{count}</span>
                  <ArrowRight
                    className="w-4 h-4 text-muted group-hover:text-imperial-blue group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile: scroll indicator dots */}
        <div className="flex md:hidden justify-center gap-1.5 mt-5">
          {CATEGORIES.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-border-strong first:bg-imperial-blue first:w-3"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
