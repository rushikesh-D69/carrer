-- ============================================================
-- RAMANUJONOMICS SEED DATA
-- Prerequisites: run 001_schema.sql, 002_production_hardening.sql, 003_fix_schema_permissions.sql
-- Safe to re-run (skips existing rows)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'careers'
  ) THEN
    RAISE EXCEPTION 'Missing schema. Run migrations/001_schema.sql first.';
  END IF;
END $$;

-- ============================================================
-- SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value, label, type, group_name) VALUES
  ('site_name', 'Ramanujonomics', 'Site Name', 'text', 'general'),
  ('site_tagline', 'Wealth is Health', 'Site Tagline', 'text', 'general'),
  ('contact_email', 'info@ramanujonomics.com', 'Contact Email', 'text', 'general'),
  ('contact_phone', '+91 99999 99999', 'Contact Phone', 'text', 'general'),
  ('contact_address', 'Hyderabad, Telangana, India', 'Address', 'text', 'general'),
  ('hero_title', 'RamanujonomicS', 'Hero Title', 'text', 'hero'),
  ('hero_subtitle', 'An Alternative to all the Alternatives for a Career Success and Wealth Security', 'Hero Subtitle', 'text', 'hero'),
  ('hero_cta_primary', 'Explore Careers', 'Hero CTA Primary Text', 'text', 'hero'),
  ('hero_cta_secondary', 'Take Assessment', 'Hero CTA Secondary Text', 'text', 'hero'),
  ('footer_text', '© 2026 Ramanujonomics. All rights reserved.', 'Footer Text', 'text', 'footer'),
  ('footer_about', 'India''s premier career guidance platform helping students and professionals build meaningful careers and lasting wealth.', 'Footer About', 'text', 'footer'),
  ('social_youtube', '', 'YouTube URL', 'url', 'social'),
  ('social_instagram', '', 'Instagram URL', 'url', 'social'),
  ('social_telegram', '', 'Telegram URL', 'url', 'social'),
  ('social_linkedin', '', 'LinkedIn URL', 'url', 'social'),
  ('og_image', '', 'Default OG Image URL', 'image', 'seo'),
  ('meta_description', 'Ramanujonomics - Premium career guidance for UPSC, SSC, Banking, Private Jobs, and Entrepreneurship. Wealth is Health.', 'Default Meta Description', 'text', 'seo')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- CAREER CATEGORIES
-- ============================================================

INSERT INTO career_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Government Careers', 'government', 'UPSC, SSC, RRB, Banking, APPSC and all central and state government jobs', 'landmark', '#00296B', 1),
  ('Private Careers', 'private', 'Corporate jobs at local, regional, national and international levels', 'briefcase', '#003F88', 2),
  ('Self Employment', 'self-employment', 'Home-based, skill-based, market-based and passion-based business ideas', 'store', '#00509D', 3),
  ('Support Ecosystem for Entrepreneurship in India', 'entrepreneurship', 'Startup ecosystem, legal, financial and institutional support', 'rocket', '#FDC500', 4),
  ('Economic Literacy', 'economic-literacy', 'Wealth concepts, long-term health, and informed citizenship', 'trending-up', '#10B981', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CAREERS
-- ============================================================

INSERT INTO careers (category_id, title, slug, short_description, difficulty_level, competition_level, duration, featured, published, salary_range, seo_title, seo_description)
SELECT c.id, v.title, v.slug, v.short_description, v.difficulty_level::difficulty_level, v.competition_level::competition_level, v.duration, v.featured, v.published, v.salary_range::jsonb, v.seo_title, v.seo_description
FROM career_categories c
JOIN (VALUES
  ('government', 'UPSC (Union Public Service Commission)', 'upsc-civil-services', 'Indian Civil Services like IAS, IPS, and IFS. The premier administrative exam in India.', 'expert', 'very_high', '2-4 years', true, true, '{"min": 600000, "max": 2500000, "currency": "INR", "display": "Rs 6L - 25L per year"}', 'UPSC Civil Services Exam Guide | IAS Prep | Ramanujonomics', 'Complete UPSC Civil Services exam guide.'),
  ('government', 'SSC (Staff Selection Commission)', 'ssc-cgl', 'Group B and C officers for central ministries and administrative departments.', 'intermediate', 'high', '6-12 months', true, true, '{"min": 350000, "max": 700000, "currency": "INR", "display": "Rs 3.5L - 7L per year"}', 'SSC Exams Preparation Guide | Ramanujonomics', 'Complete guide for SSC CGL and selection posts.'),
  ('government', 'RRB (Railway Recruitment Board)', 'rrb-railway', 'Technical and non-technical career paths in Indian Railways (NTPC, JE, Group D).', 'beginner', 'high', '6-12 months', true, true, '{"min": 300000, "max": 600000, "currency": "INR", "display": "Rs 3L - 6L per year"}', 'RRB Exams Preparation Guide | Ramanujonomics', 'Complete guide for Railway recruitment CBT exams.'),
  ('government', 'Banking (SBI & IBPS Exams)', 'banking-ibps-sbi', 'Career paths for Probationary Officers and Clerks in public and regional rural banks.', 'intermediate', 'high', '6-12 months', true, true, '{"min": 400000, "max": 800000, "currency": "INR", "display": "Rs 4L - 8L per year"}', 'SBI and IBPS PO Exams Preparation Guide | Ramanujonomics', 'Complete guide for IBPS and SBI banking careers.'),
  ('government', 'APPSC (Andhra Pradesh Public Service Commission)', 'appsc-state', 'Group 1, 2, and 4 services in the Andhra Pradesh state government administration.', 'advanced', 'very_high', '1-2 years', true, true, '{"min": 350000, "max": 1500000, "currency": "INR", "display": "Rs 3.5L - 15L per year"}', 'APPSC State Services Exam Guide | Ramanujonomics', 'Complete APPSC Group 1 and 2 exams preparation guide.'),
  ('private', 'Local Private Careers', 'private-local', 'Corporate and operations job opportunities in municipal, retail, and local enterprise sectors.', 'beginner', 'medium', '3-6 months', true, true, '{"min": 180000, "max": 400000, "currency": "INR", "display": "Rs 1.8L - 4L per year"}', 'Local Private Jobs Guide | Ramanujonomics', 'Explore job opportunities in local municipal and SME markets.'),
  ('private', 'Regional Private Careers', 'private-regional', 'Employment paths in state-level industries, manufacturing, and regional business hubs.', 'intermediate', 'medium', '3-6 months', false, true, '{"min": 300000, "max": 800000, "currency": "INR", "display": "Rs 3L - 8L per year"}', 'Regional Business and Industry Jobs | Ramanujonomics', 'Find jobs in regional industrial zones.'),
  ('private', 'National Private Careers', 'private-national', 'Opportunities with major domestic enterprises, logistics networks, and top-tier national IT firms.', 'intermediate', 'high', '3-6 months', true, true, '{"min": 400000, "max": 1500000, "currency": "INR", "display": "Rs 4L - 15L per year"}', 'National Corporates and Tech Jobs | Ramanujonomics', 'Jobs with national-level private corporations and IT firms.'),
  ('private', 'International Private Careers', 'private-international', 'Careers with multinational corporations, global consulting firms, and cross-border businesses.', 'advanced', 'high', '6-12 months', true, true, '{"min": 800000, "max": 5000000, "currency": "INR", "display": "Rs 8L - 50L+ per year"}', 'MNC and International Careers Guide | Ramanujonomics', 'Careers with global tech giants and international consulting.'),
  ('self-employment', 'Home Related Self Employment', 'self-employment-home', 'Freelance writing, digital design, online education, and home-based culinary ventures.', 'beginner', 'low', '1-3 months', true, true, '{"min": 120000, "max": 1000000, "currency": "INR", "display": "Rs 1.2L - 10L per year"}', 'Home-Based Self Employment Guide | Ramanujonomics', 'Monetize your skills directly from your home.'),
  ('self-employment', 'Qualification Related Self Employment', 'self-employment-qualification', 'Professional consulting in law, taxation, accounting, medical clinics, and engineering advice.', 'advanced', 'medium', '6-12 months', true, true, '{"min": 500000, "max": 3000000, "currency": "INR", "display": "Rs 5L - 30L per year"}', 'Professional Self-Employed Practices | Ramanujonomics', 'Launch a certified professional practice.'),
  ('self-employment', 'Market Related Self Employment', 'self-employment-market', 'Retail businesses, franchise operations, real estate brokerages, and local trading ventures.', 'intermediate', 'medium', '2-4 months', false, true, '{"min": 300000, "max": 2000000, "currency": "INR", "display": "Rs 3L - 20L per year"}', 'Market and Retail Trade Self-Employment | Ramanujonomics', 'Launch retail and franchise operations.'),
  ('self-employment', 'Passion Related Self Employment', 'self-employment-passion', 'Photography studios, fitness coaching, performing arts academies, and travel vlogging.', 'beginner', 'low', '2-6 months', true, true, '{"min": 200000, "max": 1500000, "currency": "INR", "display": "Rs 2L - 15L per year"}', 'Passion to Business Guides | Ramanujonomics', 'Turn your creative and athletic hobbies into lasting businesses.'),
  ('entrepreneurship', 'Individual Support System', 'entrepreneurship-individual', 'Mentorship for solo founders, bootstrapping models, and individual angel investor networks.', 'intermediate', 'low', 'Continuous learning', true, true, '{"min": 0, "max": 10000000, "currency": "INR", "display": "Unlimited potential"}', 'Mentors and Angel Support for Founders | Ramanujonomics', 'Connect with mentorship and bootstrapping strategies.'),
  ('entrepreneurship', 'Institutional Ecosystem', 'entrepreneurship-institutions', 'Business incubators, innovation hubs (like T-Hub), and government startup assistance centers.', 'intermediate', 'low', 'Continuous learning', true, true, '{"min": 0, "max": 100000000, "currency": "INR", "display": "Unlimited potential"}', 'Business Incubators and Hubs in India | Ramanujonomics', 'Leverage state accelerators and startup parks.'),
  ('entrepreneurship', 'Legal Support Framework', 'entrepreneurship-legal', 'Company registration (Pvt Ltd, LLP), intellectual property patents, and legal compliance guides.', 'advanced', 'low', '1-3 months setup', true, true, '{"min": 0, "max": 10000000, "currency": "INR", "display": "Protection and Compliance"}', 'Legal Incorporation and IP protection | Ramanujonomics', 'Understand registration and labor self-certification.'),
  ('entrepreneurship', 'Financial Schemes and Capital', 'entrepreneurship-financial', 'Startup India Seed Fund, MUDRA business loans, credit guarantee programs, and venture capital.', 'intermediate', 'medium', '3-6 months process', true, true, '{"min": 500000, "max": 50000000, "currency": "INR", "display": "Funding Scaffolding"}', 'Government Startup Funds and Mudra Loans | Ramanujonomics', 'Learn about seed funds and collateral-free credit.'),
  ('economic-literacy', 'Wealth Concept and Principles', 'economic-literacy-wealth', 'Understanding compounding interest, asset vs liability, inflation management, and wealth security.', 'beginner', 'low', 'Lifetime habit', true, true, '{"min": 0, "max": 100000000, "currency": "INR", "display": "Wealth Maximization"}', 'Principles of Personal Finance | Ramanujonomics', 'Learn compound interest, asset planning, and savings.'),
  ('economic-literacy', 'Health and Insurance', 'economic-literacy-health', 'Emergency fund planning, health and life insurance evaluation, and wellness budgeting.', 'beginner', 'low', 'Lifetime habit', true, true, '{"min": 0, "max": 100000000, "currency": "INR", "display": "Security Scaffold"}', 'Emergency Funds and Insurance Guide | Ramanujonomics', 'Plan term insurance and medical shields.'),
  ('economic-literacy', 'Informed Responsible Citizen', 'economic-literacy-citizen', 'Direct and indirect taxes (Income Tax and GST), consumer protection laws, and civic financial duties.', 'intermediate', 'low', 'Lifetime habit', true, true, '{"min": 0, "max": 10000000, "currency": "INR", "display": "Financial Civics"}', 'Taxes, Consumer Protection and Civics | Ramanujonomics', 'Learn direct tax slabs, GST verification, and consumer protection.')
) AS v(category_slug, title, slug, short_description, difficulty_level, competition_level, duration, featured, published, salary_range, seo_title, seo_description)
  ON c.slug = v.category_slug
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CAREER SECTIONS FOR UPSC
-- ============================================================

INSERT INTO career_sections (career_id, section_type, title, content_md, content_json, sort_order)
SELECT c.id, v.section_type::section_type, v.title, v.content_md, v.content_json, v.sort_order
FROM careers c
JOIN (VALUES
  ('upsc-civil-services', 'overview', 'Career Overview', 'The **UPSC Civil Services Examination (CSE)** is one of the most prestigious competitive examinations in India, recruiting for IAS, IPS, and IFS.', NULL::jsonb, 1),
  ('upsc-civil-services', 'nature_strategy', 'Nature and Strategy', 'UPSC is a three-tier examination testing academic rigor and public service values. Strategize with syllabus mapping and daily answer drafting.', NULL::jsonb, 2),
  ('upsc-civil-services', 'study_materials', 'Study Material', 'Core reference materials include Laxmikanth for Polity, Spectrum for History, and Mrunal notes for Economics.', NULL::jsonb, 3),
  ('upsc-civil-services', 'practice_tests', 'Practice Test', 'Solve at least 30 full-length prelims tests and join descriptive mains series post-prelims.', NULL::jsonb, 4),
  ('upsc-civil-services', 'feedback', 'Professor Feedback', 'Submit your descriptive answers to our platform panel of educators for detailed feedback.', NULL::jsonb, 5),
  ('upsc-civil-services', 'roadmap', 'Preparation Roadmap', NULL, '[{"phase": "Phase 1: Foundation (3 Months)", "description": "Read basic NCERTs and begin newspaper habits."}, {"phase": "Phase 2: Core Prep (6 Months)", "description": "Finish Optional subject and master standard books."}, {"phase": "Phase 3: Prelims Mocks (3 Months)", "description": "Take full mocks and master CSAT calculations."}]'::jsonb, 6)
) AS v(career_slug, section_type, title, content_md, content_json, sort_order)
  ON c.slug = v.career_slug
WHERE NOT EXISTS (
  SELECT 1 FROM career_sections cs
  WHERE cs.career_id = c.id AND cs.section_type = v.section_type::section_type
);

-- ============================================================
-- MOCK TESTS AND QUESTIONS (only once)
-- ============================================================

DO $$
DECLARE
  v_test_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM tests WHERE title = 'General Aptitude Sample Test') THEN
    RETURN;
  END IF;

  INSERT INTO tests (title, description, instructions, duration, total_marks, negative_marking, category, difficulty, published)
  VALUES (
    'General Aptitude Sample Test',
    'Test your quantitative, reasoning and verbal skills with this free sample test.',
    'Each question carries 1 mark. 0.33 marks will be deducted for each wrong answer.',
    30, 20, 0.33, 'aptitude', 'medium', true
  )
  RETURNING id INTO v_test_id;

  INSERT INTO question_bank (category, topic, difficulty, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, tags)
  VALUES
    ('aptitude', 'Percentage', 'easy', 'mcq', 'What is 15% of 200?', '25', '30', '35', '40', 'b', '15% of 200 = (15/100) x 200 = 30', 1, ARRAY['seed-sample-test', 'percentage', 'basic-maths']),
    ('aptitude', 'Ratio and Proportion', 'easy', 'mcq', 'If A:B = 3:4 and B:C = 4:5, what is A:C?', '3:5', '4:5', '12:20', '3:4', 'a', 'A:B = 3:4, B:C = 4:5. So A:C = 3:5', 1, ARRAY['seed-sample-test', 'ratio', 'proportion']),
    ('reasoning', 'Series', 'easy', 'mcq', 'Find the next number: 2, 6, 12, 20, ?', '28', '30', '32', '36', 'b', 'Pattern: 1x2, 2x3, 3x4, 4x5, 5x6=30.', 1, ARRAY['seed-sample-test', 'number-series', 'pattern']),
    ('reasoning', 'Coding-Decoding', 'medium', 'mcq', 'If BANK is coded as CDPM, how is LOAN coded?', 'MPCP', 'NPCQ', 'MPBO', 'MQBO', 'c', 'LOAN shifts systematically to NQCP.', 1, ARRAY['seed-sample-test', 'coding', 'decoding']),
    ('verbal', 'Synonyms', 'easy', 'mcq', 'Choose the synonym of AFFLUENT:', 'Poor', 'Wealthy', 'Humble', 'Ordinary', 'b', 'Affluent means wealthy.', 1, ARRAY['seed-sample-test', 'synonyms', 'vocabulary']),
    ('general_knowledge', 'Indian Polity', 'medium', 'mcq', 'Which Article of the Indian Constitution deals with the Right to Equality?', 'Article 12', 'Article 14', 'Article 19', 'Article 21', 'b', 'Article 14 guarantees equality before law.', 1, ARRAY['seed-sample-test', 'polity', 'constitution']),
    ('economics', 'Inflation', 'easy', 'mcq', 'Which of the following best describes inflation?', 'Decrease in money supply', 'Increase in general price level', 'Fall in GDP', 'Rise in unemployment', 'b', 'Inflation is a sustained increase in prices.', 1, ARRAY['seed-sample-test', 'inflation', 'economics-basics']),
    ('aptitude', 'Time and Work', 'medium', 'mcq', 'A can do a work in 10 days, B in 15 days. How many days will they take working together?', '5 days', '6 days', '8 days', '12 days', 'b', '1/10 + 1/15 = 1/6, so 6 days.', 1, ARRAY['seed-sample-test', 'time-work']),
    ('reasoning', 'Blood Relations', 'medium', 'mcq', 'If A is the son of B, and B is the sister of C, how is A related to C?', 'Son', 'Nephew', 'Uncle', 'Brother', 'b', 'A is the nephew of C.', 1, ARRAY['seed-sample-test', 'blood-relations']),
    ('aptitude', 'Simple Interest', 'easy', 'mcq', 'Find the Simple Interest on Rs 5000 at 8% per annum for 3 years.', 'Rs 1000', 'Rs 1200', 'Rs 1500', 'Rs 1800', 'b', 'SI = (5000 x 8 x 3)/100 = Rs 1200', 1, ARRAY['seed-sample-test', 'simple-interest']);

  INSERT INTO test_questions (test_id, question_id, sort_order)
  SELECT v_test_id, qb.id, ROW_NUMBER() OVER (ORDER BY qb.created_at)
  FROM question_bank qb
  WHERE 'seed-sample-test' = ANY(qb.tags);
END $$;

-- ============================================================
-- ASSESSMENTS
-- ============================================================

INSERT INTO assessments (title, description, type, duration, is_active)
SELECT 'Career Personality Assessment',
  'Discover which career path suits your personality and strengths. Answer 3 questions to get personalized career recommendations.',
  'career_fit'::assessment_type, 15, true
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE title = 'Career Personality Assessment');

INSERT INTO assessment_questions (assessment_id, question, options, weight, sort_order)
SELECT a.id, q.question, q.options::jsonb, q.weight, q.sort_order
FROM assessments a
JOIN (VALUES
  ('What motivates you most at work?',
   '[{"value":"a","label":"Job security and stability","scores":{"government":3,"private":1,"entrepreneurship":0,"self_employment":1}},{"value":"b","label":"High salary and perks","scores":{"government":1,"private":3,"entrepreneurship":2,"self_employment":1}},{"value":"c","label":"Building something of my own","scores":{"government":0,"private":1,"entrepreneurship":3,"self_employment":3}},{"value":"d","label":"Helping my community","scores":{"government":2,"private":1,"entrepreneurship":1,"self_employment":2}}]',
   1.0, 1),
  ('How do you handle uncertainty?',
   '[{"value":"a","label":"I prefer clear rules and processes","scores":{"government":3,"private":2,"entrepreneurship":0,"self_employment":1}},{"value":"b","label":"I adapt quickly to change","scores":{"government":1,"private":3,"entrepreneurship":2,"self_employment":2}},{"value":"c","label":"I thrive in uncertainty, I create my own path","scores":{"government":0,"private":1,"entrepreneurship":3,"self_employment":3}},{"value":"d","label":"I balance structure with flexibility","scores":{"government":2,"private":2,"entrepreneurship":2,"self_employment":2}}]',
   1.0, 2),
  ('What is your preferred work style?',
   '[{"value":"a","label":"Fixed hours, weekends free","scores":{"government":3,"private":1,"entrepreneurship":0,"self_employment":1}},{"value":"b","label":"Corporate environment, team collaboration","scores":{"government":2,"private":3,"entrepreneurship":1,"self_employment":0}},{"value":"c","label":"Work from anywhere, own schedule","scores":{"government":0,"private":1,"entrepreneurship":2,"self_employment":3}},{"value":"d","label":"Lead a team and build a company","scores":{"government":0,"private":1,"entrepreneurship":3,"self_employment":2}}]',
   1.0, 3)
) AS q(question, options, weight, sort_order)
  ON a.title = 'Career Personality Assessment'
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_questions aq WHERE aq.assessment_id = a.id
);

-- ============================================================
-- BLOGS, ANNOUNCEMENTS, EVENTS
-- ============================================================

INSERT INTO blog_categories (name, slug, description) VALUES
  ('Career Tips', 'career-tips', 'Guidance for exam prep and career planning'),
  ('Wealth and Health', 'wealth-health', 'Economic literacy and wellbeing')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content_md, published, published_at, category_id, reading_time, seo_title, seo_description)
SELECT b.title, b.slug, b.excerpt, b.content_md, true, NOW(), bc.id, b.reading_time, b.seo_title, b.seo_description
FROM (VALUES
  ('How to Manage Exam Prep Stress', 'manage-prep-stress', 'Expert tips on mental health, scheduling, and consistent planning for competitive exams.', '## Stay Consistent\n\nBuild a daily routine with fixed study blocks and recovery time.\n\n## Wealth is Health\n\nProtect sleep and nutrition — they compound your exam performance.', 'career-tips', 4, 'Manage Exam Prep Stress | Ramanujonomics', 'Practical stress management for UPSC, SSC, and banking aspirants.'),
  ('Understanding Government vs Private Careers', 'government-vs-private-careers', 'A balanced comparison to help students choose the right path.', '## Government Paths\n\nStability, structured exams, and public service impact.\n\n## Private Paths\n\nFaster growth, corporate meritocracy, and global mobility.', 'career-tips', 5, 'Government vs Private Careers | Ramanujonomics', 'Compare government and private career trade-offs in India.')
) AS b(title, slug, excerpt, content_md, category_slug, reading_time, seo_title, seo_description)
JOIN blog_categories bc ON bc.slug = b.category_slug
WHERE NOT EXISTS (SELECT 1 FROM blogs existing WHERE existing.slug = b.slug);

INSERT INTO announcements (title, content, priority, is_active, is_banner)
SELECT a.title, a.content, a.priority::announcement_priority, true, false
FROM (VALUES
  ('Welcome to Ramanujonomics!', 'India''s career guidance platform is live. Explore careers, take free tests, and save roadmaps to your library.', 'high'),
  ('Telugu language support', 'Switch to Telugu using the language menu for localized career content.', 'normal'),
  ('New practice test available', 'General Aptitude Sample Test is now available in your dashboard.', 'normal')
) AS a(title, content, priority)
WHERE NOT EXISTS (SELECT 1 FROM announcements existing WHERE existing.title = a.title);

INSERT INTO events (title, slug, description, event_type, start_date, end_date, location, published, is_free)
SELECT e.title, e.slug, e.description, e.event_type::event_type, e.start_date, e.end_date, e.location, true, true
FROM (VALUES
  ('Strategies for APPSC/TSPSC Prep and Mind Mapping', 'appsc-tspsc-prep-webinar', 'Live webinar on state PSC preparation, syllabus mapping, and answer writing.', 'webinar', (NOW() + INTERVAL '7 days'), (NOW() + INTERVAL '7 days' + INTERVAL '2 hours'), 'Online - Hyderabad HQ'),
  ('UPSC Prelims Mock Test Strategy Session', 'upsc-prelims-strategy', 'Learn how to use full-length mocks and analyze negative marking patterns.', 'seminar', (NOW() + INTERVAL '14 days'), (NOW() + INTERVAL '14 days' + INTERVAL '90 minutes'), 'Ramanujonomics Virtual Classroom')
) AS e(title, slug, description, event_type, start_date, end_date, location)
WHERE NOT EXISTS (SELECT 1 FROM events existing WHERE existing.slug = e.slug);

-- ============================================================
-- END OF SEED DATA
-- ============================================================
