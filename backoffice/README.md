# PMHelp Back-Office System

This is the internal back-office system for PMHelp team members to manage analytics, users, and marketing content.

## 🚀 Quick Start

**Need help?** Read `SIMPLE_SETUP_GUIDE.md` first - it has step-by-step instructions!

## 📁 Files in This Folder

- `index.html` - Main dashboard
- `login.html` - Login page
- `css/` - Stylesheets
- `js/` - JavaScript files
- `backoffice_setup.sql` - Database setup script (RUN THIS FIRST!)
- `SIMPLE_SETUP_GUIDE.md` - Step-by-step setup instructions

## ⚡ Quick Setup (3 Steps)

### 1. Run Database Setup
Open `backoffice_setup.sql` in Supabase SQL Editor and run it.

### 2. Set Admin User
Run this SQL in Supabase (replace with your email):
```sql
UPDATE profiles SET role = 'admin' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'your-email@pmhelp.co');
```

### 3. Test Login
Open `login.html` in browser and log in with your admin email.

## 📚 Full Documentation

See `SIMPLE_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
