# Website Banner Management System - Feature Summary

## 📋 Overview

The Website Banner Management system allows non-technical team members to update website banners without developer intervention. Banners are stored in the Supabase database and can be fetched by the main website dynamically.

---

## 🎯 Key Features

### 1. **Banner CRUD Operations**
- ✅ **Create** new banners
- ✅ **Read/View** existing banners
- ✅ **Update** banner content (text, links, dates, status)
- ✅ **Delete** banners

### 2. **Banner Fields/Properties**

Each banner has the following editable fields:

- **Banner Key** (`banner_key`): Unique identifier (e.g., `'homepage-announcement'`)
  - Currently supports one banner: `homepage-announcement`
  - Fixed value, not editable in UI

- **Badge Text** (`badge_text`): Optional small badge/label (e.g., "NEW", "FEATURED")
  - Optional field
  - Displays as a small colored badge above/in the banner

- **Banner Text** (`text`): **REQUIRED** - Main banner message
  - Required field
  - Multi-line text area
  - This is the primary message displayed in the banner

- **Link URL** (`link_url`): Optional URL for banner to link to
  - Optional field
  - Must be valid URL format if provided
  - When clicked, banner can link to this URL

- **Link Text** (`link_text`): Optional text for the link (e.g., "Learn more", "Read more")
  - Optional field
  - Defaults to "Learn more" if not provided
  - Displayed as clickable text in the banner

- **Active Status** (`is_active`): Boolean toggle to activate/deactivate banner
  - Checkbox control
  - When unchecked, banner is inactive (won't show on website)
  - Visual badge shows "Active" (green) or "Inactive" (gray)

- **Start Date** (`start_date`): Optional date/time when banner should start showing
  - Optional field
  - DateTime picker
  - If set, banner only shows after this date

- **End Date** (`end_date`): Optional date/time when banner should stop showing
  - Optional field
  - DateTime picker
  - If set, banner only shows before this date
  - Must be after start date if both are set

---

## 🔧 Technical Implementation

### Database Schema

**Table:** `website_banners`

```sql
- id (UUID, Primary Key)
- banner_key (TEXT, UNIQUE, NOT NULL)
- title (TEXT, optional)
- text (TEXT, NOT NULL) - Required banner message
- link_url (TEXT, optional)
- link_text (TEXT, optional)
- badge_text (TEXT, optional)
- is_active (BOOLEAN, default: true)
- start_date (TIMESTAMP, optional)
- end_date (TIMESTAMP, optional)
- created_by (UUID, references profiles.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Security (RLS Policies)

- **Public Read Access**: Anyone can read active banners (main website needs this)
  - Only returns banners where `is_active = true`
  - Only returns banners within date range (if dates set)
  - Used by main website to fetch and display banners

- **Admin Write Access**: Only admin/team/instructor roles can create/update/delete
  - All CRUD operations require admin authentication
  - Tracked via `created_by` field

### API Methods

**Class:** `BannersAPI`

1. `getAllBanners()` - Get all banners (admin only)
2. `getActiveBanner(bannerKey)` - Get active banner by key (public read)
3. `getBannerByKey(bannerKey)` - Get banner by key regardless of status (admin)
4. `saveBanner(bannerData)` - Create or update banner (admin only)
5. `deleteBanner(bannerId)` - Delete banner (admin only)
6. `toggleBannerStatus(bannerId, isActive)` - Toggle active status (admin only)
7. `isBannerActive(banner)` - Check if banner is currently active (date logic)
8. `validateBannerData(bannerData)` - Validate banner data before saving

---

## 🎨 User Interface Features

### Form Fields (in Marketing Tab)

1. **Badge Text Input** - Text field, optional
2. **Banner Text Textarea** - Multi-line, **REQUIRED**
3. **Link URL Input** - URL field, optional, validated
4. **Link Text Input** - Text field, optional
5. **Active Status Checkbox** - Toggle, defaults to checked
6. **Start Date** - DateTime picker, optional
7. **End Date** - DateTime picker, optional

### Actions Available

1. **Save Banner Button**
   - Creates new banner if no ID exists
   - Updates existing banner if ID exists
   - Validates data before saving
   - Shows success/error toast notifications
   - Auto-populates form with saved data (including new ID)

2. **Preview Button**
   - Shows preview of how banner will look
   - Uses same styling as main website banner
   - Displays badge, text, and link as they would appear
   - No database interaction (just visual preview)

3. **Delete Button**
   - Only available if banner exists (has ID)
   - Requires confirmation dialog
   - Permanently deletes banner from database
   - Resets form after deletion

4. **Status Badge** (Visual Indicator)
   - Shows "Active" (green) or "Inactive" (gray) badge
   - Updates automatically when checkbox changes
   - Located at top of banner form

---

## 📊 Data Flow

### Saving Banner:
1. User fills form in backoffice
2. Form data validated (text required, URL format, date logic)
3. If validation passes, data sent to Supabase
4. Banner saved to `website_banners` table
5. Success message shown, form updated with saved data

### Displaying on Main Website:
1. Main website queries `website_banners` table
2. Fetches banner where `banner_key = 'homepage-announcement'`
3. Checks if banner is active (`is_active = true`)
4. Checks if current date is within `start_date` and `end_date` (if set)
5. If all conditions met, displays banner on website
6. Updates banner content dynamically (no page reload needed)

---

## ✅ Validation Rules

1. **Banner Text**: Required (cannot be empty)
2. **Banner Key**: Required (automatically set to 'homepage-announcement')
3. **Link URL**: If provided, must be valid URL format
4. **Date Logic**: If both start_date and end_date are set, start_date must be before end_date
5. **All Fields**: Trimmed of whitespace before saving

---

## 🔄 Current Implementation Status

### ✅ Fully Implemented:
- Create/Update banner functionality
- Delete banner functionality
- Preview functionality
- Active/Inactive status toggle
- Date range support (start_date/end_date)
- Form validation
- Status badge indicator
- Auto-load existing banner on form open
- Error handling and user feedback

### ⚠️ Known Issues (Fixed):
- Session handling was fixed (proper destructuring)
- Banner save errors resolved

### 📝 Integration Required:
- **Main Website Integration**: The main website (`index.html` on pmhelp.co) needs code to fetch banners from `website_banners` table
  - Code provided in implementation plan (Phase 4.4)
  - Should fetch active banner and update banner content dynamically
  - Should respect date ranges
  - Should maintain localStorage dismissal functionality

---

## 🎯 Usage Workflow

1. **Admin logs into backoffice**
2. **Clicks "Marketing" tab**
3. **Form loads** (empty if no banner exists, or populated if banner exists)
4. **Fills in banner fields**:
   - Badge text (optional): e.g., "NEW"
   - Banner text (required): e.g., "Check out our new Reports feature!"
   - Link URL (optional): e.g., "https://pmhelp.co/reports"
   - Link text (optional): e.g., "Learn more"
   - Active status: Check/uncheck to activate/deactivate
   - Dates (optional): Set when banner should appear/disappear
5. **Clicks "Preview"** to see how it looks (optional)
6. **Clicks "Save Banner"** to save
7. **Banner is saved** to database
8. **Main website fetches** and displays the banner automatically

---

## 📦 Database Table Structure

**Table Name:** `website_banners`

**Columns:**
- `id` - UUID, Primary Key
- `banner_key` - TEXT, UNIQUE, NOT NULL (e.g., 'homepage-announcement')
- `title` - TEXT (optional, not currently used in UI)
- `text` - TEXT, NOT NULL (banner message)
- `link_url` - TEXT (optional)
- `link_text` - TEXT (optional)
- `badge_text` - TEXT (optional)
- `is_active` - BOOLEAN (default: true)
- `start_date` - TIMESTAMP (optional)
- `end_date` - TIMESTAMP (optional)
- `created_by` - UUID (references profiles.id)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

**Indexes:**
- `idx_banners_active` - On (is_active, start_date, end_date) for efficient active banner queries
- `idx_banners_key` - On (banner_key) for quick lookup by key

**RLS Policies:**
- Public can read active banners (for main website)
- Admins/team/instructors can manage banners (CRUD operations)

---

## 🔗 Integration with Main Website

The main website needs to:
1. Query `website_banners` table for `banner_key = 'homepage-announcement'`
2. Check if banner is active and within date range
3. Update banner HTML content dynamically
4. Maintain existing localStorage dismissal functionality

**Integration Code Location:** Implementation Plan Phase 4.4

---

## ✨ Key Benefits

1. **No Developer Needed**: Non-technical team members can update banners
2. **Instant Updates**: Changes reflect on website immediately (no code deployment)
3. **Scheduled Banners**: Can set start/end dates for timed campaigns
4. **Preview Before Save**: See how banner looks before publishing
5. **Safe Operations**: Validation prevents invalid data
6. **Status Control**: Easy activate/deactivate without deleting
7. **Audit Trail**: Tracks who created banner and when (created_by, created_at, updated_at)

---

## 📝 Notes for Main AI

- Banner management is fully functional in the backoffice
- Main website integration code is provided in implementation plan but not yet applied
- Currently supports one banner type: `homepage-announcement`
- System is extensible - can add more banner types by adding more banner_key values
- All data stored in Supabase `website_banners` table
- RLS policies ensure security (public read for active banners, admin write access)
- Form validation ensures data integrity
- Preview functionality helps users see how banner will appear
