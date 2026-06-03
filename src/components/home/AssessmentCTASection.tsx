'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'

export default function AssessmentCTASection() {
  const t = useTranslations()
  const locale = useLocale()

  const benefits = [
    t('assessment.result_1'),
    t('assessment.result_2'),
    t('assessment.result_3'),
  ]

  return (
    <section className="section bg-hero-gradient-subtle">
      <div className="container-base">
        <div className="bg-imperial-blue rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">

            {/* Left: Text */}
            <div className="flex-1 p-7 md:p-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-school-bus-yellow/20 border border-school-bus-yellow/30 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-school-bus-yellow" />
                <span className="text-school-bus-yellow text-xs font-semibold uppercase tracking-wide">
                  Free Assessment
                </span>
              </div>

              <h2 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-white mb-3 leading-tight">
                {t('assessment.title')}
              </h2>

              <p className="text-white/70 mb-6 leading-relaxed">
                {t('assessment.subtitle')}
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-8">
                <p className="text-white/50 text-sm font-medium uppercase tracking-wide mb-1">
                  {t('assessment.results_include')}:
                </p>
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2.5 text-white/85 text-sm">
                    <CheckCircle className="w-4 h-4 text-school-bus-yellow flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${locale}/dashboard/assessments`}
                  className="btn-cta text-base px-7 h-12"
                >
                  {t('assessment.take_free')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-white/50 text-sm self-center">
                  <CheckCircle className="w-4 h-4" />
                  {t('assessment.takes_minutes')}
                </div>
              </div>
            </div>

            {/* Right: Visual — score preview */}
            <div className="w-full md:w-80 lg:w-96 bg-french-blue/40 p-7 md:p-10 flex items-center justify-center border-t md:border-t-0 md:border-l border-white/10">
              <div className="w-full">
                <p className="text-white/60 text-sm font-medium mb-4 text-center">
                  Sample Career Fit Results
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Government Jobs', score: 72, color: '#FDC500' },
                    { label: 'Private Sector', score: 64, color: '#60A5FA' },
                    { label: 'Entrepreneurship', score: 91, color: '#34D399' },
                    { label: 'Self Employment', score: 58, color: '#F87171' },
                  ].map(({ label, score, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>{label}</span>
                        <span className="font-bold" style={{ color }}>{score}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs text-center mt-4">
                  Your results will vary based on your answers
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
