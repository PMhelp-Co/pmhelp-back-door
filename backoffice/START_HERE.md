# 🚀 START HERE - PMHelp Back-Office Setup

## ✅ What's Done (You Don't Need to Do Anything Here)

- ✅ All 17 code files created
- ✅ Login page ready
- ✅ Dashboard ready  
- ✅ All JavaScript code written

**Status:** Code is 100% ready! ✅

---

## ⚠️ What YOU Need to Do (2 Simple Steps)

### Step 1: Run Database Setup (5 minutes)

**File to use:** `backoffice_setup.sql`

**What to do:**
1. Open Supabase: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" (left menu)
4. Click "New Query"
5. Open `backoffice_setup.sql` file
6. Copy ALL the text from that file
7. Paste it into the SQL Editor
8. Click "Run" button (or press Ctrl+Enter)
9. Wait for "Success" message

**Done when:** You see "Success" in the SQL Editor

---

### Step 2: Make Yourself an Admin (2 minutes)

**What to do:**
1. In Supabase SQL Editor, run this (REPLACE the email with YOUR email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'YOUR-EMAIL-HERE@pmhelp.co'
);
```

2. Verify it worked (run this):

```sql
SELECT email, role 
FROM profiles 
JOIN auth.users ON auth.users.id = profiles.id
WHERE role = 'admin';
```

3. You should see YOUR email in the results

**Done when:** You see your email in the admin list

---

## 🧪 Test It! (1 minute)

1. Open `backoffice/login.html` in your browser
2. Log in with YOUR email and password
3. You should see the dashboard!

**If it works:** ✅ You're done with setup!

**If it doesn't work:** See troubleshooting below

---

## 🚨 Troubleshooting

### ❌ "Access denied" when logging in
**Fix:** Step 2 didn't work. Make sure you ran the SQL and used YOUR email.

### ❌ "Table website_banners does not exist"
**Fix:** Step 1 didn't work. Go back and run `backoffice_setup.sql` again.

### ❌ Pages are blank or nothing loads
**Fix:** Press F12 → Console tab → Look for errors. Usually means Step 1 wasn't done.

### ❌ Can't find SQL Editor in Supabase
**Fix:** Make sure you're logged into Supabase dashboard and selected your project.

---

## 📝 Quick Checklist

Before you can use the backoffice:

- [ ] Ran `backoffice_setup.sql` in Supabase SQL Editor
- [ ] Set your email as admin (Step 2)
- [ ] Tested login and can see the dashboard

---

## 📚 More Help

- **Simple Guide:** See `SIMPLE_SETUP_GUIDE.md` for more details
- **Full Plan:** See `BACKOFFICE_IMPLEMENTATION_PLAN.md` (if you need it)
- **Questions?** Check browser console (F12) for error messages

---

## 🎯 What Happens Next?

After setup works:
1. ✅ Test all 3 tabs (Analytics, Users, Marketing)
2. ⏭️ Deploy to Netlify
3. ⏭️ Share with team
4. ⏭️ Set up custom domain (backoffice.pmhelp.co)

---

**That's it! Just 2 steps and you're ready to go!** 🎉
