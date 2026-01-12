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
  SELECT
    c.id as course_id,
    c.title::TEXT as course_title,
    COUNT(DISTINCT up.user_id)::BIGINT as total_enrollments,
    COUNT(DISTINCT CASE WHEN up.progress_percentage = 100 THEN up.user_id END)::BIGINT as completed_count,
    ROUND(
      COUNT(DISTINCT CASE WHEN up.progress_percentage = 100 THEN up.user_id END)::NUMERIC /
      NULLIF(COUNT(DISTINCT up.user_id), 0) * 100,
      2
    ) as completion_rate
  FROM courses c
  LEFT JOIN user_progress up ON up.course_id = c.id
  WHERE c.is_published = true
  GROUP BY c.id, c.title
  ORDER BY completion_rate DESC NULLS LAST;
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
