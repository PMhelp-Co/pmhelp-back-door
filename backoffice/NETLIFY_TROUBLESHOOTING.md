# Netlify 404 Error - Troubleshooting Guide

If you're seeing a "Page not found" error after deploying to Netlify, follow these steps:

## 🔍 Quick Diagnosis

The 404 error means Netlify can't find your `index.html` file. This is usually a **build settings** issue.

---

## ✅ Solution 1: Check Netlify Build Settings

### Step 1: Go to Netlify Dashboard
1. Visit: https://app.netlify.com
2. Click on your site (the one with the 404 error)

### Step 2: Check Site Settings
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Check these settings:

**If your GitHub repo root IS the backoffice folder:**
- **Base directory:** Leave **EMPTY** (blank)
- **Build command:** Leave **EMPTY** or `echo 'No build needed'`
- **Publish directory:** Leave **EMPTY** or enter `.`

**If your GitHub repo CONTAINS the backoffice folder (repo root is one level up):**
- **Base directory:** `backoffice`
- **Build command:** Leave **EMPTY** or `echo 'No build needed'`
- **Publish directory:** Leave **EMPTY** or enter `.`

### Step 3: Save and Redeploy
1. Click **Save**
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**
4. Wait for deployment to complete
5. Try accessing your site again

---

## ✅ Solution 2: Verify Files Are Deployed

### Check Deployed Files
1. In Netlify Dashboard, go to **Deploys** tab
2. Click on the latest deployment
3. Click **Browse published files** or **View deploy log**
4. Verify you can see:
   - `index.html`
   - `login.html`
   - `css/` folder
   - `js/` folder
   - `_redirects` file
   - `netlify.toml` file

**If files are missing:**
- Your base directory is wrong
- Or you deployed the wrong folder

---

## ✅ Solution 3: Check Repository Structure

### If you deployed from GitHub:

**Option A: Repository root IS backoffice folder**
```
your-repo/
├── index.html
├── login.html
├── css/
├── js/
├── _redirects
└── netlify.toml
```
**Netlify Settings:**
- Base directory: **EMPTY**
- Publish directory: **EMPTY** or `.`

**Option B: Repository contains backoffice folder**
```
your-repo/
├── backoffice/
│   ├── index.html
│   ├── login.html
│   ├── css/
│   ├── js/
│   ├── _redirects
│   └── netlify.toml
└── README.md
```
**Netlify Settings:**
- Base directory: `backoffice`
- Publish directory: **EMPTY** or `.`

---

## ✅ Solution 4: Manual Deploy (Quick Test)

If GitHub deploy isn't working, try manual deploy:

1. **Zip the backoffice folder:**
   - Select all files in `backoffice/` folder
   - Create a ZIP file

2. **Deploy manually:**
   - Go to Netlify Dashboard
   - Click **Add new site** → **Deploy manually**
   - Drag and drop the ZIP file (or the `backoffice` folder)
   - Netlify will extract and deploy

3. **If manual deploy works:**
   - The issue is with your GitHub build settings
   - Fix the base directory setting (see Solution 1)

---

## ✅ Solution 5: Verify _redirects File

The `_redirects` file must be in the **root of your publish directory**.

1. Check that `_redirects` is in the same folder as `index.html`
2. Check the file contents (should be):
   ```
   /*    /index.html   200
   ```

3. **If using base directory:**
   - The `_redirects` file should be in the `backoffice/` folder
   - Netlify will automatically find it

---

## ✅ Solution 6: Check Deploy Logs

1. Go to **Deploys** tab
2. Click on the latest deployment
3. Click **View deploy log**
4. Look for errors like:
   - "No files found"
   - "Base directory not found"
   - "Publish directory not found"

**Common errors:**
- `Base directory "backoffice" not found` → Your repo structure doesn't match
- `No files found` → Base directory is wrong
- `index.html not found` → Publish directory is wrong

---

## 🎯 Most Common Fix

**90% of the time, the issue is:**

1. **Base directory is wrong** - Check your repo structure
2. **Files not in the right place** - Make sure `index.html` is in the root of what Netlify is looking at

**Quick fix:**
1. Go to Netlify → Site settings → Build & deploy
2. Set **Base directory** to match your repo structure:
   - If repo root = backoffice folder → Leave empty
   - If repo contains backoffice → Set to `backoffice`
3. Set **Publish directory** to `.` or leave empty
4. Save and redeploy

---

## 📝 Verification Checklist

After fixing, verify:

- [ ] Can access `https://your-site.netlify.app` (shows login page)
- [ ] Can access `https://your-site.netlify.app/login.html` (shows login page)
- [ ] Can access `https://your-site.netlify.app/index.html` (shows dashboard after login)
- [ ] CSS loads correctly (check browser DevTools → Network tab)
- [ ] JavaScript loads correctly (check browser console for errors)

---

## 🆘 Still Not Working?

If none of these solutions work:

1. **Check your GitHub repository:**
   - Verify files are actually committed and pushed
   - Check the branch Netlify is deploying from (usually `main` or `master`)

2. **Try a fresh deploy:**
   - In Netlify, go to **Deploys**
   - Click **Trigger deploy** → **Clear cache and deploy site**

3. **Check Netlify support:**
   - Visit: https://docs.netlify.com/routing/redirects/
   - Or contact Netlify support with your deploy logs

---

## 💡 Pro Tip

**Always test locally first:**
1. Open `backoffice/index.html` in your browser
2. If it works locally, the issue is definitely Netlify settings
3. If it doesn't work locally, fix the file paths first

---

**Last Updated:** After initial deployment troubleshooting
