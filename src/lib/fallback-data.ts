export interface FallbackCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
}

export interface FallbackCareer {
  id: string
  slug: string
  title: string
  short_description: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  competition_level: 'low' | 'medium' | 'high' | 'very_high'
  duration: string
  featured: boolean
  published: boolean
  salary_range: {
    min?: number
    max?: number
    currency?: string
    display: string
  }
  career_categories: {
    name: string
    color: string
    slug: string
  }
}

export const FALLBACK_CATEGORIES: FallbackCategory[] = [
  {
    id: 'cat-1',
    name: 'Government Careers',
    slug: 'government',
    description: 'UPSC, SSC, RRB, Banking, APPSC and all central and state government jobs',
    icon: 'landmark',
    color: '#00296B',
    sort_order: 1,
  },
  {
    id: 'cat-2',
    name: 'Private Careers',
    slug: 'private',
    description: 'Corporate jobs at local, regional, national and international levels',
    icon: 'briefcase',
    color: '#003F88',
    sort_order: 2,
  },
  {
    id: 'cat-3',
    name: 'Self Employment',
    slug: 'self-employment',
    description: 'Home-based, skill-based, market-based and passion-based business ideas',
    icon: 'store',
    color: '#00509D',
    sort_order: 3,
  },
  {
    id: 'cat-4',
    name: 'Support Ecosystem for Entrepreneurship in India',
    slug: 'entrepreneurship',
    description: 'Startup ecosystem, legal, financial and institutional support',
    icon: 'rocket',
    color: '#FDC500',
    sort_order: 4,
  },
  {
    id: 'cat-5',
    name: 'Economic Literacy',
    slug: 'economic-literacy',
    description: 'Wealth concepts, sustainable health, and informed citizenship',
    icon: 'trending-up',
    color: '#10B981',
    sort_order: 5,
  },
]

export const FALLBACK_CAREERS: FallbackCareer[] = [
  // GOVERNMENT SECTORS
  {
    id: 'car-1',
    slug: 'upsc-civil-services',
    title: 'UPSC (Union Public Service Commission)',
    short_description: 'Indian Civil Services like IAS, IPS, and IFS. The premier administrative exam in India.',
    difficulty_level: 'expert',
    competition_level: 'very_high',
    duration: '2-4 years',
    featured: true,
    published: true,
    salary_range: { min: 600000, max: 2500000, currency: 'INR', display: '₹6L - ₹25L per year' },
    career_categories: { name: 'Government Careers', color: '#00296B', slug: 'government' },
  },
  {
    id: 'car-2',
    slug: 'ssc-cgl',
    title: 'SSC (Staff Selection Commission)',
    short_description: 'Group B and C officers for central ministries and administrative departments.',
    difficulty_level: 'intermediate',
    competition_level: 'high',
    duration: '6-12 months',
    featured: true,
    published: true,
    salary_range: { min: 350000, max: 700000, currency: 'INR', display: '₹3.5L - ₹7L per year' },
    career_categories: { name: 'Government Careers', color: '#00296B', slug: 'government' },
  },
  {
    id: 'car-3',
    slug: 'rrb-railway',
    title: 'RRB (Railway Recruitment Board)',
    short_description: 'Technical and non-technical career paths in Indian Railways (NTPC, JE, Group D).',
    difficulty_level: 'beginner',
    competition_level: 'high',
    duration: '6-12 months',
    featured: true,
    published: true,
    salary_range: { min: 300000, max: 600000, currency: 'INR', display: '₹3L - ₹6L per year' },
    career_categories: { name: 'Government Careers', color: '#00296B', slug: 'government' },
  },
  {
    id: 'car-4',
    slug: 'banking-ibps-sbi',
    title: 'Banking (SBI & IBPS Exams)',
    short_description: 'Career paths for Probationary Officers and Clerks in public and regional rural banks.',
    difficulty_level: 'intermediate',
    competition_level: 'high',
    duration: '6-12 months',
    featured: true,
    published: true,
    salary_range: { min: 400000, max: 800000, currency: 'INR', display: '₹4L - ₹8L per year' },
    career_categories: { name: 'Government Careers', color: '#00296B', slug: 'government' },
  },
  {
    id: 'car-5',
    slug: 'appsc-state',
    title: 'APPSC (Andhra Pradesh Public Service Commission)',
    short_description: 'Group 1, 2, and 4 services in the Andhra Pradesh state government administration.',
    difficulty_level: 'advanced',
    competition_level: 'very_high',
    duration: '1-2 years',
    featured: true,
    published: true,
    salary_range: { min: 350000, max: 1500000, currency: 'INR', display: '₹3.5L - ₹15L per year' },
    career_categories: { name: 'Government Careers', color: '#00296B', slug: 'government' },
  },

  // PRIVATE SECTORS
  {
    id: 'car-6',
    slug: 'private-local',
    title: 'Local Private Careers',
    short_description: 'Corporate and operations job opportunities in municipal, retail, and local enterprise sectors.',
    difficulty_level: 'beginner',
    competition_level: 'medium',
    duration: '3-6 months',
    featured: true,
    published: true,
    salary_range: { min: 180000, max: 400000, currency: 'INR', display: '₹1.8L - ₹4L per year' },
    career_categories: { name: 'Private Careers', color: '#003F88', slug: 'private' },
  },
  {
    id: 'car-7',
    slug: 'private-regional',
    title: 'Regional Private Careers',
    short_description: 'Employment paths in state-level industries, manufacturing, and regional business hubs.',
    difficulty_level: 'intermediate',
    competition_level: 'medium',
    duration: '3-6 months',
    featured: false,
    published: true,
    salary_range: { min: 300000, max: 800000, currency: 'INR', display: '₹3L - ₹8L per year' },
    career_categories: { name: 'Private Careers', color: '#003F88', slug: 'private' },
  },
  {
    id: 'car-8',
    slug: 'private-national',
    title: 'National Private Careers',
    short_description: 'Opportunities with major domestic enterprises, logistics networks, and top-tier national IT firms.',
    difficulty_level: 'intermediate',
    competition_level: 'high',
    duration: '3-6 months',
    featured: true,
    published: true,
    salary_range: { min: 400000, max: 1500000, currency: 'INR', display: '₹4L - ₹15L per year' },
    career_categories: { name: 'Private Careers', color: '#003F88', slug: 'private' },
  },
  {
    id: 'car-9',
    slug: 'private-international',
    title: 'International Private Careers',
    short_description: 'Careers with multinational corporations, global consulting firms, and cross-border businesses.',
    difficulty_level: 'advanced',
    competition_level: 'high',
    duration: '6-12 months',
    featured: true,
    published: true,
    salary_range: { min: 800000, max: 5000000, currency: 'INR', display: '₹8L - ₹50L+ per year' },
    career_categories: { name: 'Private Careers', color: '#003F88', slug: 'private' },
  },

  // SELF EMPLOYMENT
  {
    id: 'car-10',
    slug: 'self-employment-home',
    title: 'Home Related Self Employment',
    short_description: 'Freelance writing, digital design, online education, and home-based culinary ventures.',
    difficulty_level: 'beginner',
    competition_level: 'low',
    duration: '1-3 months',
    featured: true,
    published: true,
    salary_range: { min: 120000, max: 1000000, currency: 'INR', display: '₹1.2L - ₹10L per year' },
    career_categories: { name: 'Self Employment', color: '#00509D', slug: 'self-employment' },
  },
  {
    id: 'car-11',
    slug: 'self-employment-qualification',
    title: 'Qualification Related Self Employment',
    short_description: 'Professional consulting in law, taxation, accounting, medical clinics, and engineering advice.',
    difficulty_level: 'advanced',
    competition_level: 'medium',
    duration: '6-12 months',
    featured: true,
    published: true,
    salary_range: { min: 500000, max: 3000000, currency: 'INR', display: '₹5L - ₹30L per year' },
    career_categories: { name: 'Self Employment', color: '#00509D', slug: 'self-employment' },
  },
  {
    id: 'car-12',
    slug: 'self-employment-market',
    title: 'Market Related Self Employment',
    short_description: 'Retail businesses, franchise operations, real estate brokerages, and local trading ventures.',
    difficulty_level: 'intermediate',
    competition_level: 'medium',
    duration: '2-4 months',
    featured: false,
    published: true,
    salary_range: { min: 300000, max: 2000000, currency: 'INR', display: '₹3L - ₹20L per year' },
    career_categories: { name: 'Self Employment', color: '#00509D', slug: 'self-employment' },
  },
  {
    id: 'car-13',
    slug: 'self-employment-passion',
    title: 'Passion Related Self Employment',
    short_description: 'Photography studios, fitness coaching, performing arts academies, and travel vlogging.',
    difficulty_level: 'beginner',
    competition_level: 'low',
    duration: '2-6 months',
    featured: true,
    published: true,
    salary_range: { min: 200000, max: 1500000, currency: 'INR', display: '₹2L - ₹15L per year' },
    career_categories: { name: 'Self Employment', color: '#00509D', slug: 'self-employment' },
  },

  // SUPPORT ECOSYSTEM FOR ENTREPRENEURSHIP IN INDIA
  {
    id: 'car-14',
    slug: 'entrepreneurship-individual',
    title: 'Individual Support System',
    short_description: 'Mentorship for solo founders, bootstrapping models, and individual angel investor networks.',
    difficulty_level: 'intermediate',
    competition_level: 'low',
    duration: 'Continuous learning',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 10000000, currency: 'INR', display: 'Unlimited potential' },
    career_categories: { name: 'Support Ecosystem for Entrepreneurship in India', color: '#FDC500', slug: 'entrepreneurship' },
  },
  {
    id: 'car-15',
    slug: 'entrepreneurship-institutions',
    title: 'Institutional Ecosystem',
    short_description: 'Business incubators, innovation hubs (like T-Hub), and government startup assistance centers.',
    difficulty_level: 'intermediate',
    competition_level: 'low',
    duration: 'Continuous learning',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 100000000, currency: 'INR', display: 'Unlimited potential' },
    career_categories: { name: 'Support Ecosystem for Entrepreneurship in India', color: '#FDC500', slug: 'entrepreneurship' },
  },
  {
    id: 'car-16',
    slug: 'entrepreneurship-legal',
    title: 'Legal Support Framework',
    short_description: 'Company registration (Pvt Ltd, LLP), intellectual property patents, and legal compliance guides.',
    difficulty_level: 'advanced',
    competition_level: 'low',
    duration: '1-3 months setup',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 10000000, currency: 'INR', display: 'Protection & Compliance' },
    career_categories: { name: 'Support Ecosystem for Entrepreneurship in India', color: '#FDC500', slug: 'entrepreneurship' },
  },
  {
    id: 'car-17',
    slug: 'entrepreneurship-financial',
    title: 'Financial Schemes & Capital',
    short_description: 'Startup India Seed Fund, MUDRA business loans, credit guarantee programs, and venture capital.',
    difficulty_level: 'intermediate',
    competition_level: 'medium',
    duration: '3-6 months process',
    featured: true,
    published: true,
    salary_range: { min: 500000, max: 50000000, currency: 'INR', display: 'Funding Scaffolding' },
    career_categories: { name: 'Support Ecosystem for Entrepreneurship in India', color: '#FDC500', slug: 'entrepreneurship' },
  },

  // ECONOMIC LITERACY
  {
    id: 'car-18',
    slug: 'economic-literacy-wealth',
    title: 'Wealth Concept & Principles',
    short_description: 'Understanding compounding interest, asset vs. liability, inflation management, and wealth security.',
    difficulty_level: 'beginner',
    competition_level: 'low',
    duration: 'Lifetime habit',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 100000000, currency: 'INR', display: 'Wealth Maximization' },
    career_categories: { name: 'Economic Literacy', color: '#10B981', slug: 'economic-literacy' },
  },
  {
    id: 'car-19',
    slug: 'economic-literacy-health',
    title: 'Sustainable Health & Insurance',
    short_description: 'Emergency fund planning, health and life insurance evaluation, and wellness budgeting.',
    difficulty_level: 'beginner',
    competition_level: 'low',
    duration: 'Lifetime habit',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 100000000, currency: 'INR', display: 'Security Scaffold' },
    career_categories: { name: 'Economic Literacy', color: '#10B981', slug: 'economic-literacy' },
  },
  {
    id: 'car-20',
    slug: 'economic-literacy-citizen',
    title: 'Informed Responsible Citizen',
    short_description: 'Direct and indirect taxes (Income Tax & GST), consumer protection laws, and civic financial duties.',
    difficulty_level: 'intermediate',
    competition_level: 'low',
    duration: 'Lifetime habit',
    featured: true,
    published: true,
    salary_range: { min: 0, max: 10000000, currency: 'INR', display: 'Financial Civics' },
    career_categories: { name: 'Economic Literacy', color: '#10B981', slug: 'economic-literacy' },
  },
]
