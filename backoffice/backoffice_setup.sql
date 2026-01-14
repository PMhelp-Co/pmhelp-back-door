-- =====================================================
-- PMHelp Back-Office System - Database Setup Script
-- =====================================================
-- This file contains all SQL statements needed for
-- the backoffice system to function properly.
-- =====================================================
-- Instructions:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire file
-- 3. Run the SQL script
-- 4. Verify all tables, functions, and policies are created
-- =====================================================

-- =====================================================
-- STEP 1: Update is_admin() Function
-- =====================================================
-- Update the existing is_admin() function to support
-- 'admin', 'team', and 'instructor' roles for backoffice access
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND role IN ('admin', 'team', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 2: Create website_banners Table
-- =====================================================
-- Table for managing marketing banners on the main website
-- =====================================================

CREATE TABLE IF NOT EXISTS website_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_key TEXT UNIQUE NOT NULL,
  title TEXT,
  text TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  badge_text TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_banners_active ON website_banners(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_key ON website_banners(banner_key);

-- Enable RLS on website_banners
ALTER TABLE website_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can read active banners (main website needs this)
-- Drop policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Public can read active banners" ON website_banners;

CREATE POLICY "Public can read active banners"
ON website_banners FOR SELECT
USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
);

-- RLS Policy: Admins/team/instructors can manage banners
-- Drop policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Admins can manage banners" ON website_banners;

CREATE POLICY "Admins can manage banners"
ON website_banners FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team', 'instructor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'team', 'instructor')
  )
);

-- =====================================================
-- STEP 3: Create Analytics SQL Functions
-- =====================================================
-- Functions used by the Analytics Dashboard
-- =====================================================

-- Function: Get new users over time
CREATE OR REPLACE FUNCTION get_new_users_over_time(trunc_level TEXT DEFAULT 'day')
RETURNS TABLE (
  period_start TIMESTAMP,
  new_users_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC(trunc_level, created_at) as period_start,
    COUNT(*)::BIGINT as new_users_count
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC(trunc_level, created_at)
  ORDER BY period_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get course completion rates
CREATE OR REPLACE FUNCTION get_course_completion_rates()
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  total_enrollments BIGINT,
  completed_count BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH course_lesson_counts AS (
    -- Get total lessons per course
    SELECT 
      course_id,
      COUNT(*)::BIGINT as total_lessons
    FROM lessons
    GROUP BY course_id
  ),
  user_course_completed_lessons AS (
    -- Count completed lessons per user per course
    SELECT 
      up.course_id,
      up.user_id,
      COUNT(DISTINCT up.lesson_id) FILTER (WHERE up.completed_at IS NOT NULL)::BIGINT as completed_lessons
    FROM user_progress up
    GROUP BY up.course_id, up.user_id
  ),
  course_enrollments AS (
    -- Count distinct users per course (enrollments)
    SELECT 
      course_id,
      COUNT(DISTINCT user_id)::BIGINT as total_enrollments
    FROM user_progress
    GROUP BY course_id
  ),
  course_completions AS (
    -- Count users who completed all lessons (completed_lessons = total_lessons)
    SELECT 
      ucc.course_id,
      COUNT(DISTINCT ucc.user_id)::BIGINT as completed_count
    FROM user_course_completed_lessons ucc
    INNER JOIN course_lesson_counts clc ON clc.course_id = ucc.course_id
    WHERE ucc.completed_lessons = clc.total_lessons AND clc.total_lessons > 0
    GROUP BY ucc.course_id
  )
  SELECT
    c.id as course_id,
    c.title::TEXT as course_title,
    COALESCE(ce.total_enrollments, 0)::BIGINT as total_enrollments,
    COALESCE(cc.completed_count, 0)::BIGINT as completed_count,
    ROUND(
      COALESCE(cc.completed_count, 0)::NUMERIC /
      NULLIF(COALESCE(ce.total_enrollments, 0), 0) * 100,
      2
    ) as completion_rate
  FROM courses c
  LEFT JOIN course_enrollments ce ON ce.course_id = c.id
  LEFT JOIN course_completions cc ON cc.course_id = c.id
  WHERE c.is_published = true
  ORDER BY completion_rate DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3.5: Create User Search Function
-- =====================================================
-- Function to search users by email or name
-- Searches both profiles.full_name and auth.users.email
-- Returns profiles with matching name or email
-- =====================================================

CREATE OR REPLACE FUNCTION search_users_by_email_or_name(search_term TEXT, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP,
  role TEXT,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    au.email::TEXT,
    p.created_at,
    p.role,
    p.updated_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE 
    (p.full_name ILIKE '%' || search_term || '%' OR au.email ILIKE '%' || search_term || '%')
    AND LENGTH(search_term) >= 2
  ORDER BY p.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3.6: Create Get User Details Function
-- =====================================================
-- Function to get user details with email from auth.users
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_details_with_email(user_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP,
  role TEXT,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    au.email::TEXT,
    p.created_at,
    p.role,
    p.updated_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: Add/Update RLS Policies for Admin Access
-- =====================================================
-- Ensure admins/team/instructors can view all profiles
-- and user progress for the backoffice dashboard
-- =====================================================

-- RLS Policy: Admins can view all profiles
-- (Drop if exists to avoid conflicts, then create)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin(auth.uid()));

-- RLS Policy: Admins can view all user progress
-- (This should already exist, but ensure it uses the updated is_admin function)
DROP POLICY IF EXISTS "Admins can read all progress" ON user_progress;
CREATE POLICY "Admins can read all progress"
ON user_progress FOR SELECT
USING (is_admin(auth.uid()));

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next step: Set at least one admin user (see SIMPLE_SETUP_GUIDE.md)
-- =====================================================
