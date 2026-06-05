-- ============================================================
-- RAMANUJONOMICS — Production hardening (run after 001_schema.sql)
-- ============================================================

-- Section type used by UI (feedback tab)
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'feedback';

-- Premium check: allow lifetime premium when expires_at is null
-- Keep parameter name `uid` to match 001_schema.sql (Postgres rejects renamed params on REPLACE)
CREATE OR REPLACE FUNCTION public.is_premium_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid
      AND is_premium = true
      AND (premium_expires_at IS NULL OR premium_expires_at > NOW())
  );
$$;

-- Auto-create profile + student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_locale', 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, 'student'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Locale constraints
ALTER TABLE profiles
  ADD CONSTRAINT profiles_preferred_locale_check
  CHECK (preferred_locale IN ('en', 'te'));

-- Test questions for clients (no correct_answer exposed)
CREATE OR REPLACE FUNCTION public.get_test_questions(p_test_id UUID)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  sort_order INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    qb.id,
    qb.question_text,
    qb.option_a,
    qb.option_b,
    qb.option_c,
    qb.option_d,
    tq.sort_order
  FROM test_questions tq
  INNER JOIN question_bank qb ON qb.id = tq.question_id
  INNER JOIN tests t ON t.id = tq.test_id
  WHERE tq.test_id = p_test_id
    AND t.published = true
    AND (
      t.is_premium = false
      OR is_premium_user(auth.uid())
      OR is_admin(auth.uid())
    )
  ORDER BY tq.sort_order ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_test_questions(UUID) TO authenticated, anon;

-- Server-side grading (prevents client score tampering)
CREATE OR REPLACE FUNCTION public.submit_test_attempt(
  p_test_id UUID,
  p_answers JSONB,
  p_time_taken INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_test RECORD;
  v_marks_per_q DECIMAL;
  v_neg_mark DECIMAL;
  v_score DECIMAL := 0;
  v_correct INT := 0;
  v_wrong INT := 0;
  v_skipped INT := 0;
  v_total_questions INT := 0;
  v_q RECORD;
  v_selected TEXT;
  v_percentage DECIMAL;
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_test FROM tests
  WHERE id = p_test_id AND published = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Test not found or not published';
  END IF;

  IF v_test.is_premium AND NOT is_premium_user(v_user_id) AND NOT is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Premium test requires subscription';
  END IF;

  SELECT COUNT(*)::INT INTO v_total_questions
  FROM test_questions tq WHERE tq.test_id = p_test_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'Test has no questions';
  END IF;

  v_neg_mark := COALESCE(v_test.negative_marking, 0.33);
  v_marks_per_q := v_test.total_marks::DECIMAL / v_total_questions;

  FOR v_q IN
    SELECT qb.id, qb.correct_answer
    FROM test_questions tq
    INNER JOIN question_bank qb ON qb.id = tq.question_id
    WHERE tq.test_id = p_test_id
    ORDER BY tq.sort_order
  LOOP
    v_selected := p_answers->>v_q.id::TEXT;

    IF v_selected IS NULL OR v_selected = '' THEN
      v_skipped := v_skipped + 1;
    ELSIF lower(v_selected) = lower(v_q.correct_answer) THEN
      v_correct := v_correct + 1;
      v_score := v_score + v_marks_per_q;
    ELSE
      v_wrong := v_wrong + 1;
      v_score := v_score - (v_marks_per_q * v_neg_mark);
    END IF;
  END LOOP;

  v_score := GREATEST(0, v_score);
  v_percentage := ROUND((v_score / v_test.total_marks::DECIMAL) * 100, 2);

  INSERT INTO test_attempts (
    user_id, test_id, answers, score, percentage, time_taken,
    correct_count, wrong_count, skipped_count, is_completed
  ) VALUES (
    v_user_id, p_test_id, p_answers, v_score, v_percentage, p_time_taken,
    v_correct, v_wrong, v_skipped, true
  )
  RETURNING id INTO v_attempt_id;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'percentage', v_percentage,
    'correct_count', v_correct,
    'wrong_count', v_wrong,
    'skipped_count', v_skipped,
    'total_marks', v_test.total_marks
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_test_attempt(UUID, JSONB, INT) TO authenticated;

-- Fix RLS: translation tables tied to published parents
DROP POLICY IF EXISTS "Anyone can read section translations" ON career_section_translations;
CREATE POLICY "Anyone can read section translations" ON career_section_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM career_sections cs
      INNER JOIN careers c ON c.id = cs.career_id
      WHERE cs.id = section_id AND c.published = true
    )
  );

DROP POLICY IF EXISTS "Anyone can read blog translations" ON blog_translations;
CREATE POLICY "Anyone can read blog translations" ON blog_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blogs b
      WHERE b.id = blog_id AND b.published = true
    )
  );

DROP POLICY IF EXISTS "Anyone can read assessment questions" ON assessment_questions;
CREATE POLICY "Anyone can read assessment questions" ON assessment_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id AND a.is_active = true
    )
  );

-- Public media for marketing pages
DROP POLICY IF EXISTS "Authenticated users can view media" ON media;
CREATE POLICY "Anyone can read media" ON media
  FOR SELECT USING (true);

-- Tighten writes
DROP POLICY IF EXISTS "Users insert own events" ON important_events;
CREATE POLICY "Users insert own events" ON important_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System inserts audit logs" ON audit_logs;
-- Only service role / migrations insert audit logs (no client INSERT policy)

DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
CREATE POLICY "Anyone can submit a lead" ON leads
  FOR INSERT WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND (message IS NULL OR char_length(message) <= 5000)
    AND (phone IS NULL OR char_length(phone) <= 20)
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (
    char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

-- Test attempts: users cannot forge scores via direct insert
DROP POLICY IF EXISTS "Users can manage own attempts" ON test_attempts;
CREATE POLICY "Users select own attempts" ON test_attempts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert in_progress attempts" ON test_attempts
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND is_completed = false
    AND score IS NULL
    AND percentage IS NULL
  );
CREATE POLICY "Users update own in_progress attempts" ON test_attempts
  FOR UPDATE USING (user_id = auth.uid() AND is_completed = false)
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON test_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_career_translations_career_locale ON career_translations(career_id, locale);
CREATE INDEX IF NOT EXISTS idx_blog_translations_blog_locale ON blog_translations(blog_id, locale);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
