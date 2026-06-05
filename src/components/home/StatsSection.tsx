'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, ClipboardList, Star } from 'lucide-react'

const STATS = [
  { icon: BookOpen, value: '50+', label: 'Career Paths', color: '#00296B' },
  { icon: ClipboardList, value: '500+', label: 'Practice Questions', color: '#FDC500' },
  { icon: Users, value: '100%', label: 'Free to Start', color: '#10B981' },
  { icon: Star, value: 'Telugu', label: 'Language Support', color: '#00509D' },
]

export default function StatsSection() {
  return (
    <section className="py-10 md:py-14 bg-imperial-blue">
      <div className="container-base">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}25` }}
                >
                  <Icon className="w-6 h-6" style={{ color: color === '#FDC500' ? color : 'white' }} />
                </div>
              </div>
              <div className="font-heading font-black text-2xl md:text-3xl text-white mb-1">
                {value}
              </div>
              <div className="text-white/60 text-xs sm:text-sm font-medium leading-snug px-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
