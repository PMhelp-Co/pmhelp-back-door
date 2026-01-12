# PMHelp Back-Office - Simple Setup Guide

## 📋 What's Already Done

✅ **All code files have been created** (17 files total)
- Login page ✅
- Dashboard with 3 tabs ✅
- All JavaScript code ✅
- All styling ✅

**The backoffice code is READY, but it can't work yet because the database needs setup first.**

---

## ⚠️ What YOU Need to Do

Before you can use the backoffice, you need to set up the database. This is a one-time setup.

### Step 1: Run the Database Setup Script

**What it does:**
- Creates a new table for banners
- Updates security functions
- Creates analytics functions
- Sets up security rules

**How to do it:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the ENTIRE contents of `backoffice_setup.sql`
6. Paste it into the SQL Editor
7. Click "Run" (or press Ctrl+Enter)

**What to expect:**
- You should see "Success" message
- If you see errors, read them carefully (some are OK if things already exist)

---

### Step 2: Set At Least One Admin User

**Why:** Only users with admin/team/instructor roles can log into the backoffice.

**How to do it:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL (replace `your-email@pmhelp.co` with YOUR actual email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@pmhelp.co'
);
```

3. Verify it worked by running this:

```sql
SELECT 
  p.full_name,
  au.email,
  p.role
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.role = 'admin';
```

You should see your email in the results.

---

## 🧪 Testing the Backoffice

### Option 1: Test Locally (Before Deploying)

1. Open `backoffice/login.html` in your web browser
2. Try to log in with your admin email
3. If it works, you should see the dashboard
4. If it doesn't work, check the browser console (F12) for errors

### Option 2: Deploy to Netlify First (Recommended)

1. Create a new Netlify site
2. Point it to the `backoffice` folder
3. Deploy
4. Visit the Netlify URL and try logging in

---

## 🚨 Common Problems & Solutions

### Problem: "Access denied" after login
**Solution:** Your user doesn't have admin role. Run Step 2 above.

### Problem: "Table website_banners does not exist"
**Solution:** The SQL setup script wasn't run. Go back to Step 1.

### Problem: Login works but pages are blank
**Solution:** Check browser console (F12) for errors. Usually means database tables/functions are missing.

### Problem: Charts don't show data
**Solution:** The analytics functions might not exist. Make sure Step 1 completed successfully.

---

## 📝 Quick Checklist

Before you can use the backoffice, make sure:

- [ ] Ran `backoffice_setup.sql` in Supabase SQL Editor
- [ ] Set at least one user as admin (Step 2)
- [ ] Can log in with admin email
- [ ] Can see the dashboard after login

---

## 🎯 What Each Tab Does

### Analytics Tab
- Shows total users, active users, courses, completions
- Shows charts of new users over time
- Shows course completion rates

### Users Tab
- Search for users by email or name
- View detailed user information
- See which courses users are enrolled in
- See user progress percentages

### Marketing Tab
- Manage website banners
- Update banner text without changing code
- Activate/deactivate banners
- Set banner date ranges

---

## 🔄 Next Steps After Setup

1. ✅ Database setup (you're here)
2. ✅ Test login and dashboard
3. ⏭️ Deploy to Netlify
4. ⏭️ Share URL with team for review
5. ⏭️ Set up subdomain (backoffice.pmhelp.co) later

---

## 💡 Need Help?

If something doesn't work:
1. Check the browser console (F12 → Console tab) for errors
2. Make sure you ran the SQL script (Step 1)
3. Make sure your user is set as admin (Step 2)
4. Try logging out and back in
