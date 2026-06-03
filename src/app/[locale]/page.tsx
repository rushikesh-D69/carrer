import { useTranslations } from 'next-intl'
import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import CareerCategoriesSection from '@/components/home/CareerCategoriesSection'
import FeaturedCareersSection from '@/components/home/FeaturedCareersSection'
import AssessmentCTASection from '@/components/home/AssessmentCTASection'
import AnnouncementsSection from '@/components/home/AnnouncementsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import StatsSection from '@/components/home/StatsSection'

export const revalidate = 3600 // ISR: revalidate every hour

export const metadata: Metadata = {
  title: 'Ramanujonomics — Career Guidance Platform | Wealth is Health',
  description: "India's premier career guidance platform. Expert guidance for UPSC, SSC, Banking, Private Jobs, and Entrepreneurship. Start your career journey today.",
  openGraph: {
    title: 'Ramanujonomics — Wealth is Health',
    description: "India's premier career guidance platform for students and professionals.",
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CareerCategoriesSection />
      <StatsSection />
      <FeaturedCareersSection />
      <AssessmentCTASection />
      <AnnouncementsSection />
      <TestimonialsSection />
    </>
  )
}
