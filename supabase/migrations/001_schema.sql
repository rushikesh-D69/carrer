-- ============================================================
-- RAMANUJONOMICS DATABASE SCHEMA
-- Version: 1.0 | Date: 2026-06-03
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin', 'super_admin');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE competition_level AS ENUM ('low', 'medium', 'high', 'very_high');
CREATE TYPE resource_type AS ENUM ('youtube', 'pdf', 'drive', 'website', 'book');
CREATE TYPE media_type AS ENUM ('image', 'document', 'video_thumb', 'icon', 'banner');
CREATE TYPE section_type AS ENUM (
  'overview', 'eligibility', 'salary', 'preparation_timeline',
  'nature_strategy', 'study_materials', 'videos', 'books',
  'practice_tests', 'previous_papers', 'faq', 'roadmap', 'resources', 'custom'
);
CREATE TYPE question_category AS ENUM (
  'upsc', 'ssc', 'rrb', 'banking', 'appsc',
  'aptitude', 'reasoning', 'verbal', 'general_knowledge',
  'economics', 'current_affairs', 'entrepreneurship'
);
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('mcq', 'multi_select', 'true_false');
CREATE TYPE assessment_type AS ENUM ('aptitude', 'personality', 'interest', 'career_fit');
CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE library_item_type AS ENUM ('career', 'blog', 'resource', 'test', 'event');
CREATE TYPE event_type AS ENUM ('webinar', 'seminar', 'workshop', 'exam', 'other');
CREATE TYPE lead_source AS ENUM (
  'home_page', 'career_page', 'contact_form',
  'assessment', 'blog', 'event', 'announcement', 'other'
);
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'enrolled', 'closed', 'spam');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE payment_gateway AS ENUM ('razorpay', 'stripe', 'manual');
CREATE TYPE important_event_name AS ENUM (
  'career_viewed', 'test_started', 'test_completed',
  'assessment_completed', 'resource_accessed',
  'blog_viewed', 'lead_submitted', 'signup_completed',
  'premium_unlocked', 'certificate_issued'
);

-- ============================================================
-- SECTION 2: HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 3: CORE USER TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  profile_image TEXT,
  education JSONB,              -- { level: 'Graduate', institution: 'OU', year: 2023 }
  career_interests TEXT[],      -- ['upsc', 'software_engineer']
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  preferred_locale TEXT DEFAULT 'en', -- 'en' or 'te'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role DEFAULT 'student',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper functions querying profiles/user_roles
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = uid AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_premium_user(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_premium FROM profiles WHERE id = uid AND premium_expires_at > NOW()), FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- SECTION 4: SITE SETTINGS
-- ============================================================

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  label TEXT,
  type TEXT DEFAULT 'text',    -- text | number | boolean | json | image | url
  group_name TEXT DEFAULT 'general', -- general | seo | social | hero | footer | analytics
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: MEDIA LIBRARY
-- ============================================================

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  alt_text TEXT,
  url TEXT NOT NULL,
  type media_type DEFAULT 'image',
  file_size INT,
  width INT,
  height INT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: CAREER MODULE
-- ============================================================

CREATE TABLE career_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,                   -- lucide icon name e.g. 'landmark', 'briefcase'
  color TEXT,                  -- hex color for category badge
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES career_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  hero_image TEXT,
  salary_range JSONB,          -- { min: 300000, max: 2000000, currency: 'INR' }
  difficulty_level difficulty_level DEFAULT 'intermediate',
  competition_level competition_level DEFAULT 'medium',
  duration TEXT,               -- e.g. '2-4 years'
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER careers_updated_at
  BEFORE UPDATE ON careers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Career Translations (i18n)
CREATE TABLE career_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,        -- 'en' | 'te'
  title TEXT NOT NULL,
  short_description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(career_id, locale)
);

-- Career Sections (Block System)
CREATE TABLE career_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
  section_type section_type NOT NULL,
  title TEXT,                  -- custom override title
  content_md TEXT,             -- raw Markdown content
  content_json JSONB,          -- structured content for FAQs, roadmaps
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER career_sections_updated_at
  BEFORE UPDATE ON career_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Career Section Translations (i18n)
CREATE TABLE career_section_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES career_sections(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT,
  content_md TEXT,
  UNIQUE(section_id, locale)
);

-- Career Resources (YouTube/Drive/PDF)
CREATE TABLE career_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
  resource_type resource_type NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career Comparisons
CREATE TABLE career_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_a UUID REFERENCES careers(id) ON DELETE CASCADE,
  career_b UUID REFERENCES careers(id) ON DELETE CASCADE,
  comparison_data JSONB,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(career_a, career_b)
);

-- ============================================================
-- SECTION 7: TEST ENGINE
-- ============================================================

-- Question Bank (decoupled from tests)
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category question_category NOT NULL,
  topic TEXT,
  subtopic TEXT,
  difficulty question_difficulty DEFAULT 'medium',
  question_type question_type DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  question_image TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL, -- 'a','b','c','d' or JSON array for multi_select
  explanation TEXT,
  marks INT DEFAULT 1,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER question_bank_updated_at
  BEFORE UPDATE ON question_bank
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tests
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration INT NOT NULL,        -- minutes
  total_marks INT NOT NULL,
  negative_marking DECIMAL(3,2) DEFAULT 0.33,
  category question_category DEFAULT 'aptitude',
  difficulty question_difficulty DEFAULT 'medium',
  is_premium BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  random_order BOOLEAN DEFAULT FALSE,
  passing_percentage INT DEFAULT 40,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pivot: Test ↔ Question Bank
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE RESTRICT,
  sort_order INT DEFAULT 0,
  UNIQUE(test_id, question_id)
);

-- Test Attempts
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id),
  answers JSONB,               -- { questionId: 'a' }
  score DECIMAL(8,2),
  percentage DECIMAL(5,2),
  time_taken INT,              -- seconds
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: ASSESSMENT SYSTEM
-- ============================================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type assessment_type NOT NULL,
  duration INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,      -- [{ value, label, scores: { govt: 2, pvt: 1, startup: 0 } }]
  weight DECIMAL(3,2) DEFAULT 1.0,
  sort_order INT DEFAULT 0
);

CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id),
  answers JSONB,
  result_json JSONB,           -- { government: 72, private: 64, entrepreneurship: 91 }
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: BLOG ENGINE
-- ============================================================

CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL,   -- Raw Markdown (NOT HTML)
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES blog_categories(id),
  tags TEXT[],
  reading_time INT,           -- auto-calculated: ceil(words / 200)
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Blog Translations (i18n)
CREATE TABLE blog_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(blog_id, locale)
);

-- ============================================================
-- SECTION 10: ANNOUNCEMENTS
-- ============================================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  priority announcement_priority DEFAULT 'normal',
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_popup BOOLEAN DEFAULT FALSE,
  is_banner BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11: EVENTS
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type event_type DEFAULT 'seminar',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  meeting_url TEXT,
  registration_link TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2),
  max_participants INT,
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 12: ENGAGEMENT SYSTEMS
-- ============================================================

-- User Library (replaces bookmarks - polymorphic)
CREATE TABLE user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type library_item_type NOT NULL,
  item_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  test_id UUID REFERENCES tests(id),
  attempt_id UUID REFERENCES test_attempts(id),
  certificate_number TEXT UNIQUE,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 13: LEADS & NEWSLETTER
-- ============================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source lead_source DEFAULT 'contact_form',
  status lead_status DEFAULT 'new',
  career_interest TEXT,
  metadata JSONB,              -- { utm_source, utm_medium, page_url, user_agent }
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 14: PAYMENT SCAFFOLD (Phase 4 ready)
-- ============================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  duration_days INT,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan_id UUID REFERENCES subscription_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway payment_gateway DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  status payment_status DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  payment_id UUID REFERENCES payments(id),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 15: ANALYTICS (lightweight)
-- ============================================================

CREATE TABLE important_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event important_event_name NOT NULL,
  item_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 16: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_section_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- USER ROLES
CREATE POLICY "Admins manage roles" ON user_roles
  FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- SITE SETTINGS (public read, admin write)
CREATE POLICY "Anyone can read settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON site_settings
  FOR ALL USING (is_admin(auth.uid()));

-- MEDIA (admin write, authenticated read)
CREATE POLICY "Authenticated users can view media" ON media
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage media" ON media
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER CATEGORIES (public read, admin write)
CREATE POLICY "Anyone can read career categories" ON career_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage career categories" ON career_categories
  FOR ALL USING (is_admin(auth.uid()));

-- CAREERS
CREATE POLICY "Anyone can read published careers" ON careers
  FOR SELECT USING (published = true);
CREATE POLICY "Admins manage careers" ON careers
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER TRANSLATIONS
CREATE POLICY "Anyone can read career translations" ON career_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM careers WHERE id = career_id AND published = true)
  );
CREATE POLICY "Admins manage career translations" ON career_translations
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER SECTIONS
CREATE POLICY "Anyone can read visible non-premium sections" ON career_sections
  FOR SELECT USING (
    is_visible = true AND (is_premium = false OR is_premium_user(auth.uid()) OR is_admin(auth.uid()))
  );
CREATE POLICY "Admins manage career sections" ON career_sections
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER SECTION TRANSLATIONS
CREATE POLICY "Anyone can read section translations" ON career_section_translations
  FOR SELECT USING (true);
CREATE POLICY "Admins manage section translations" ON career_section_translations
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER RESOURCES
CREATE POLICY "Free resources are public" ON career_resources
  FOR SELECT USING (
    is_premium = false OR is_premium_user(auth.uid()) OR is_admin(auth.uid())
  );
CREATE POLICY "Admins manage career resources" ON career_resources
  FOR ALL USING (is_admin(auth.uid()));

-- CAREER COMPARISONS
CREATE POLICY "Anyone can read comparisons" ON career_comparisons
  FOR SELECT USING (true);
CREATE POLICY "Admins manage comparisons" ON career_comparisons
  FOR ALL USING (is_admin(auth.uid()));

-- QUESTION BANK
CREATE POLICY "Admins manage question bank" ON question_bank
  FOR ALL USING (is_admin(auth.uid()));

-- TESTS
CREATE POLICY "Anyone can read published free tests" ON tests
  FOR SELECT USING (published = true AND (is_premium = false OR is_premium_user(auth.uid())));
CREATE POLICY "Admins manage tests" ON tests
  FOR ALL USING (is_admin(auth.uid()));

-- TEST QUESTIONS
CREATE POLICY "Users can read test questions" ON test_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tests WHERE id = test_id AND published = true)
  );
CREATE POLICY "Admins manage test questions" ON test_questions
  FOR ALL USING (is_admin(auth.uid()));

-- TEST ATTEMPTS
CREATE POLICY "Users can manage own attempts" ON test_attempts
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all attempts" ON test_attempts
  FOR SELECT USING (is_admin(auth.uid()));

-- ASSESSMENTS
CREATE POLICY "Anyone can read active assessments" ON assessments
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage assessments" ON assessments
  FOR ALL USING (is_admin(auth.uid()));

-- ASSESSMENT QUESTIONS
CREATE POLICY "Anyone can read assessment questions" ON assessment_questions
  FOR SELECT USING (true);
CREATE POLICY "Admins manage assessment questions" ON assessment_questions
  FOR ALL USING (is_admin(auth.uid()));

-- ASSESSMENT RESULTS
CREATE POLICY "Users can manage own assessment results" ON assessment_results
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all results" ON assessment_results
  FOR SELECT USING (is_admin(auth.uid()));

-- BLOG CATEGORIES
CREATE POLICY "Anyone can read blog categories" ON blog_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage blog categories" ON blog_categories
  FOR ALL USING (is_admin(auth.uid()));

-- BLOGS
CREATE POLICY "Anyone can read published blogs" ON blogs
  FOR SELECT USING (published = true);
CREATE POLICY "Admins manage blogs" ON blogs
  FOR ALL USING (is_admin(auth.uid()));

-- BLOG TRANSLATIONS
CREATE POLICY "Anyone can read blog translations" ON blog_translations
  FOR SELECT USING (true);
CREATE POLICY "Admins manage blog translations" ON blog_translations
  FOR ALL USING (is_admin(auth.uid()));

-- ANNOUNCEMENTS
CREATE POLICY "Anyone can read active announcements" ON announcements
  FOR SELECT USING (
    is_active = true AND
    (publish_date IS NULL OR publish_date <= NOW()) AND
    (expiry_date IS NULL OR expiry_date > NOW())
  );
CREATE POLICY "Admins manage announcements" ON announcements
  FOR ALL USING (is_admin(auth.uid()));

-- EVENTS
CREATE POLICY "Anyone can read published events" ON events
  FOR SELECT USING (published = true);
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (is_admin(auth.uid()));

-- USER LIBRARY
CREATE POLICY "Users manage own library" ON user_library
  FOR ALL USING (user_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications" ON notifications
  FOR ALL USING (is_admin(auth.uid()));

-- CERTIFICATES
CREATE POLICY "Users view own certificates" ON certificates
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage certificates" ON certificates
  FOR ALL USING (is_admin(auth.uid()));

-- LEADS (insert public, manage admin)
CREATE POLICY "Anyone can submit a lead" ON leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage leads" ON leads
  FOR ALL USING (is_admin(auth.uid()));

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage subscribers" ON newsletter_subscribers
  FOR ALL USING (is_admin(auth.uid()));

-- SUBSCRIPTION PLANS
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage plans" ON subscription_plans
  FOR ALL USING (is_admin(auth.uid()));

-- PAYMENTS
CREATE POLICY "Users view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all payments" ON payments
  FOR SELECT USING (is_admin(auth.uid()));

-- SUBSCRIPTIONS
CREATE POLICY "Users view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage subscriptions" ON subscriptions
  FOR ALL USING (is_admin(auth.uid()));

-- IMPORTANT EVENTS
CREATE POLICY "Users insert own events" ON important_events
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins view all events" ON important_events
  FOR SELECT USING (is_admin(auth.uid()));

-- AUDIT LOGS
CREATE POLICY "Admins view audit logs" ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "System inserts audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- SECTION 17: INDEXES
-- ============================================================

CREATE INDEX idx_careers_slug ON careers(slug);
CREATE INDEX idx_careers_category ON careers(category_id);
CREATE INDEX idx_careers_featured ON careers(featured) WHERE featured = true;
CREATE INDEX idx_careers_published ON careers(published) WHERE published = true;
CREATE INDEX idx_career_sections_career ON career_sections(career_id);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published_at DESC) WHERE published = true;
CREATE INDEX idx_blogs_category ON blogs(category_id);
CREATE INDEX idx_question_bank_category ON question_bank(category);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_user_library_user ON user_library(user_id);
CREATE INDEX idx_important_events_user ON important_events(user_id);
CREATE INDEX idx_important_events_created ON important_events(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_announcements_active ON announcements(is_active, publish_date);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
