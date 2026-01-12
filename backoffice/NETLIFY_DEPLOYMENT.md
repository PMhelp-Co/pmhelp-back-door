# Netlify Deployment Guide for PMHelp Back-Office

## 🚀 Complete Deployment Guide (GitHub + Netlify)

This guide walks you through creating a GitHub repository and deploying to Netlify.

---

## Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub

1. **Go to your GitHub organization**
   - Visit: https://github.com/your-org-name (replace with your org name)
   - Make sure you're logged in

2. **Create New Repository**
   - Click the "+" icon in top right → "New repository"
   - **Repository name:** `pmhelp-back-door`
   - **Description:** "PMHelp Back-Office System - Internal admin dashboard"
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
   - Click "Create repository"

3. **Copy the repository URL**
   - GitHub will show you the repository URL
   - It will look like: `https://github.com/your-org-name/pmhelp-back-door.git`
   - Copy this URL (you'll need it in the next step)

---

## Step 2: Upload Files to GitHub

### 2.1 Initialize Git in Backoffice Folder

**Open Terminal/Command Prompt** and run these commands:

```bash
# Navigate to the backoffice folder
cd backoffice

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: PMHelp Back-Office system"
```

### 2.2 Connect to GitHub and Push

```bash
# Add GitHub repository as remote (replace YOUR-ORG-NAME with your actual org name)
git remote add origin https://github.com/YOUR-ORG-NAME/pmhelp-back-door.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If you get authentication errors:
- GitHub may ask for username/password
- Use a Personal Access Token instead of password
- Or use GitHub Desktop app for easier authentication

### 2.3 Verify Files on GitHub

1. Go to your repository: `https://github.com/YOUR-ORG-NAME/pmhelp-back-door`
2. Verify all files are there:
   - `index.html`
   - `login.html`
   - `css/` folder
   - `js/` folder
   - `netlify.toml`
   - `_redirects`
   - All other files

---

## Step 3: Deploy to Netlify

### 3.1 Connect GitHub to Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign in or create an account (it's free)

2. **Import from Git**
   - Click "Add new site" → "Import an existing project"
   - Click "Deploy with GitHub" (or your Git provider)
   - Authorize Netlify to access your GitHub account (if first time)
   - Select your organization
   - Find and select: `pmhelp-back-door` repository
   - Click "Next"

### 3.2 Configure Build Settings

**Important Settings:**

- **Branch to deploy:** `main` (or `master` if that's your default)
- **Base directory:** Leave **EMPTY** (since backoffice folder IS the repo root)
- **Build command:** Leave **EMPTY** (no build needed - static files only)
- **Publish directory:** Leave **EMPTY** or enter `.` (current directory)

**Click "Deploy site"**

### 3.3 Wait for Deployment

- Netlify will start deploying
- You'll see build logs (should be very quick since no build step)
- Wait for "Site is live" message

### 3.4 Get Your Site URL

- Netlify will show you a URL like: `https://random-name-12345.netlify.app`
- This is your backoffice URL!
- You can also change it in Site settings → Change site name

---

## Step 4: Test Your Deployment

1. **Visit your Netlify URL**
   - You should see the login page

2. **Test Login**
   - Log in with an admin email
   - Verify you can access the dashboard

3. **Test All Features**
   - Analytics tab (check charts load)
   - Users tab (test search)
   - Marketing tab (test banner save)

---

## Step 5: Future Updates

### Making Changes and Redeploying

1. **Make changes** to files in your local `backoffice` folder

2. **Commit and push to GitHub:**
   ```bash
   cd backoffice
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```

3. **Netlify auto-deploys**
   - Netlify automatically detects the push
   - Starts a new deployment
   - Your site updates automatically (usually within 1-2 minutes)

**No manual deployment needed!** Just push to GitHub and Netlify handles the rest.

---

## Alternative: Manual Deploy (If You Skip GitHub)

If you don't want to use GitHub:

1. Go to Netlify Dashboard
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the entire `backoffice` folder
4. Netlify will create a site automatically

**Note:** Manual deploy means you'll need to drag and drop again for each update (not recommended for ongoing use).

---

## Quick Reference: Git Commands

### First Time Setup (One-time)
```bash
cd backoffice
git init
git add .
git commit -m "Initial commit: PMHelp Back-Office system"
git remote add origin https://github.com/YOUR-ORG-NAME/pmhelp-back-door.git
git branch -M main
git push -u origin main
```

### Making Updates (Every time you change files)
```bash
cd backoffice
git add .
git commit -m "Your change description"
git push origin main
```

---

## Alternative: Deploy via Netlify CLI (Advanced)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Navigate to backoffice folder:**
   ```bash
   cd backoffice
   ```

4. **Initialize and deploy:**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts
   - When asked about build command, press Enter (no build needed)
   - When asked about publish directory, enter `.` or press Enter

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## Configuration Files (Already Created)

Your deployment files are already set up:

- ✅ `netlify.toml` - Netlify configuration with security headers
- ✅ `_redirects` - SPA routing configuration

These files are already in the `backoffice` folder and will be automatically used by Netlify.

---

## Important Notes

### 1. Environment Variables (Not Required)

The Supabase URL and key are hardcoded in `js/supabase-config.js` (as per your setup). You don't need to set environment variables, but if you want to use them:

1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Add:
   - `SUPABASE_URL` = `https://igiemqicokpdyhunldtq.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Then update `js/supabase-config.js` to use:
```javascript
const supabaseUrl = process.env.SUPABASE_URL || 'https://igiemqicokpdyhunldtq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-key';
```

**But since this is client-side JavaScript, environment variables won't work directly.** The current hardcoded approach is fine for your use case.

### 2. Custom Domain Setup (Later)

Once deployed and tested:

1. Go to Netlify Dashboard → Your Site → Domain settings
2. Click "Add custom domain"
3. Enter: `backoffice.pmhelp.co`
4. Follow Netlify's DNS instructions
5. Update your DNS provider (where pmhelp.co is hosted) to point `backoffice.pmhelp.co` to Netlify

---

## Testing After Deployment

1. Visit your Netlify URL
2. You should see the login page
3. Log in with an admin email
4. Test all three tabs:
   - Analytics tab
   - Users tab (search functionality)
   - Marketing tab (banner management)

---

## Troubleshooting

### Site shows "Page not found"
- Check that `_redirects` file is in the `backoffice` folder
- Verify you deployed the `backoffice` folder, not the parent folder

### Login doesn't work
- Verify Supabase URL and key are correct in `js/supabase-config.js`
- Check browser console (F12) for errors
- Verify your admin user is set in Supabase

### Charts/Data don't load
- Check browser console for errors
- Verify SQL setup script was run in Supabase
- Check network tab to see if API calls are failing

### CSS/Styles look broken
- Clear browser cache
- Check that all files deployed correctly
- Verify `css/backoffice.css` and `css/normalize.css` are in the deployment

---

## Updating Your Deployment

### Using Git (Recommended):
1. Make changes to files locally
2. Run:
   ```bash
   cd backoffice
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Netlify automatically detects the push and redeploys
4. Wait 1-2 minutes for deployment to complete
5. Visit your site to see changes

### If using manual deploy:
- Drag and drop the `backoffice` folder again
- Netlify will replace the old deployment
- **Note:** This is not recommended for ongoing updates

---

## Security Considerations

✅ **Already Configured:**
- Security headers in `netlify.toml`
- Authentication required (login page)
- RLS policies in Supabase (database-level security)

⚠️ **Note:**
- The backoffice is separate from your main website
- Don't link to it from pmhelp.co (as per requirements)
- Only share the URL with authorized team members

---

## Next Steps After Deployment

1. ✅ Test all functionality on the deployed site
2. ✅ Share URL with team for review
3. ✅ Set up custom domain (backoffice.pmhelp.co) after approval
4. ✅ Remove debug logs (if you added any) before production use

---

## Quick Checklist

### Before GitHub Setup:
- [ ] GitHub repository `pmhelp-back-door` created in your organization
- [ ] All files are in the `backoffice` folder
- [ ] `.gitignore` file exists (created automatically)

### Before Netlify Deployment:
- [ ] Files pushed to GitHub repository
- [ ] Can see all files on GitHub (verify in browser)
- [ ] `netlify.toml` exists in repository
- [ ] `_redirects` file exists in repository
- [ ] SQL setup script has been run in Supabase
- [ ] Admin users are set up

### After Netlify Deployment:
- [ ] Netlify site created and connected to GitHub
- [ ] Can access the login page at Netlify URL
- [ ] Can log in with admin credentials
- [ ] All three tabs work correctly
- [ ] No errors in browser console
- [ ] Tested Analytics, Users, and Marketing tabs

---

**That's it! Your backoffice should now be live on Netlify!** 🎉
