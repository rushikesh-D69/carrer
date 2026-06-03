'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Hyderabad, Telangana',
    role: 'IAS Aspirant',
    text: 'Ramanujonomics gave me a clear roadmap for UPSC preparation. The career sections are detailed and the practice tests are really helpful. I recommend it to every government job aspirant.',
    rating: 5,
    initials: 'PS',
    color: '#00296B',
  },
  {
    id: 2,
    name: 'Ravi Kumar',
    location: 'Vijayawada, AP',
    role: 'Software Engineer (placed)',
    text: 'The software engineering career guide helped me understand exactly what skills to build. The roadmap was step-by-step and very practical. Landed my first job in 6 months!',
    rating: 5,
    initials: 'RK',
    color: '#003F88',
  },
  {
    id: 3,
    name: 'Lakshmi Devi',
    location: 'Warangal, Telangana',
    role: 'SSC CGL Qualifier',
    text: 'తెలుగులో కెరీర్ గైడెన్స్ చాలా helpful గా ఉంది. SSC CGL preparation కోసం అన్ని materials ఒకే చోట దొరికాయి. Thank you Ramanujonomics!',
    rating: 5,
    initials: 'LD',
    color: '#00509D',
  },
  {
    id: 4,
    name: 'Aakash Reddy',
    location: 'Kurnool, AP',
    role: 'Startup Founder',
    text: 'The entrepreneurship section opened my eyes to startup registration, GST, MSME — everything I needed to legally start my business. The economic literacy section is a goldmine.',
    rating: 5,
    initials: 'AR',
    color: '#92600A',
  },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const total = TESTIMONIALS.length

  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)

  const t = TESTIMONIALS[current]

  return (
    <section className="section bg-white">
      <div className="container-base">
        <div className="text-center mb-10 md:mb-14">
          <div className="divider-gold mb-4" />
          <h2 className="section-title">Student Success Stories</h2>
          <p className="section-subtitle">
            Real outcomes from real students across Telangana & Andhra Pradesh
          </p>
        </div>

        {/* Main testimonial card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="card-base p-7 md:p-10 text-center relative"
            >
              {/* Quote icon */}
              <Quote
                className="w-10 h-10 mx-auto mb-5 opacity-20"
                style={{ color: t.color }}
              />

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-school-bus-yellow fill-current" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-8 italic max-w-xl mx-auto">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-white text-base flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div className="text-left">
                  <div className="font-heading font-bold text-foreground text-sm">{t.name}</div>
                  <div className="text-muted text-xs">{t.role} • {t.location}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-imperial-blue hover:border-imperial-blue transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="transition-all duration-300"
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  <div
                    className={`rounded-full transition-all ${
                      i === current
                        ? 'w-6 h-2 bg-imperial-blue'
                        : 'w-2 h-2 bg-border-strong hover:bg-muted'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-imperial-blue hover:border-imperial-blue transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
