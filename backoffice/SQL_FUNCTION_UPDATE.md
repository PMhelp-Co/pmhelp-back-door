# SQL Function Update Required

## ⚠️ Important: You Need to Update the SQL Function

The JavaScript code has been updated to support daily/weekly grouping, but you **must also update the SQL function** in Supabase for it to work correctly.

## Steps to Update:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this SQL** (replaces the old function):

```sql
-- Function: Get new users over time (UPDATED)
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
```

3. **Click "Run"** to execute the SQL

## What Changed:

- Parameter changed from `time_interval INTERVAL` to `trunc_level TEXT`
- Function now uses `DATE_TRUNC(trunc_level, created_at)` instead of hardcoded `'day'`
- Supports `'day'` for daily view and `'week'` for weekly view

## After Updating:

- ✅ Daily button will show data grouped by day
- ✅ Weekly button will show data grouped by week
- ✅ Chart will display correctly for both views

## Note:

The JavaScript code has a fallback that groups by week in JavaScript if the SQL function doesn't exist or fails, but using the SQL function is more efficient and recommended.
