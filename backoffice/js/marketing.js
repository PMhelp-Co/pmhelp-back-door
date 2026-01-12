// Marketing/Banner Management Logic
// Handles banner CRUD operations and form management

let bannersAPI;

// Initialize marketing module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    bannersAPI = new BannersAPI();
    
    // Load banner form when marketing tab is active
    const marketingTab = document.getElementById('marketing-tab');
    if (marketingTab && marketingTab.classList.contains('active')) {
        loadBannerForm();
    }
    
    // Form submission handler
    const bannerForm = document.getElementById('banner-form');
    if (bannerForm) {
        bannerForm.addEventListener('submit', handleBannerSubmit);
    }
    
    // Preview button handler
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', showBannerPreview);
    }
    
    // Delete button handler
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleBannerDelete);
    }
    
    // Active status checkbox handler
    const isActiveCheckbox = document.getElementById('is-active');
    if (isActiveCheckbox) {
        isActiveCheckbox.addEventListener('change', updateStatusBadge);
    }
});

/**
 * Load banner form with existing banner data
 */
async function loadBannerForm() {
    try {
        const bannerKey = document.getElementById('banner-key')?.value || 'homepage-announcement';
        const banner = await bannersAPI.getBannerByKey(bannerKey);
        
        if (banner) {
            populateBannerForm(banner);
            updateStatusBadge();
        } else {
            // New banner - reset form
            resetBannerForm();
        }
    } catch (error) {
        console.error('Error loading banner form:', error);
        showToast('Error loading banner data', 'error');
    }
}

/**
 * Populate form with banner data
 * @param {Object} banner - Banner object
 */
function populateBannerForm(banner) {
    document.getElementById('banner-id').value = banner.id || '';
    document.getElementById('badge-text').value = banner.badge_text || '';
    document.getElementById('banner-text').value = banner.text || '';
    document.getElementById('link-url').value = banner.link_url || '';
    document.getElementById('link-text').value = banner.link_text || '';
    document.getElementById('is-active').checked = banner.is_active !== false;
    
    // Format dates for datetime-local input
    if (banner.start_date) {
        const startDate = new Date(banner.start_date);
        document.getElementById('start-date').value = formatDateTimeLocal(startDate);
    } else {
        document.getElementById('start-date').value = '';
    }
    
    if (banner.end_date) {
        const endDate = new Date(banner.end_date);
        document.getElementById('end-date').value = formatDateTimeLocal(endDate);
    } else {
        document.getElementById('end-date').value = '';
    }
    
    updateStatusBadge();
}

/**
 * Reset banner form to empty state
 */
function resetBannerForm() {
    document.getElementById('banner-id').value = '';
    document.getElementById('badge-text').value = '';
    document.getElementById('banner-text').value = '';
    document.getElementById('link-url').value = '';
    document.getElementById('link-text').value = '';
    document.getElementById('is-active').checked = true;
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    updateStatusBadge();
}

/**
 * Update status badge based on current form values
 */
function updateStatusBadge() {
    const statusBadge = document.getElementById('status-badge');
    const isActive = document.getElementById('is-active')?.checked;
    
    if (!statusBadge) return;
    
    if (isActive) {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'badge-status active';
    } else {
        statusBadge.textContent = 'Inactive';
        statusBadge.className = 'badge-status inactive';
    }
}

/**
 * Handle banner form submission
 * @param {Event} e - Form submit event
 */
async function handleBannerSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    // Validate form data
    const validation = bannersAPI.validateBannerData(formData);
    if (!validation.valid) {
        showToast(validation.errors.join(', '), 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const savedBanner = await bannersAPI.saveBanner(formData);
        
        if (savedBanner) {
            showToast('Banner saved successfully!', 'success');
            
            // Update form with saved data (includes generated ID if new)
            populateBannerForm(savedBanner);
            
            // Hide preview if showing
            const previewSection = document.getElementById('preview-section');
            if (previewSection) {
                previewSection.style.display = 'none';
            }
        } else {
            throw new Error('Failed to save banner');
        }
    } catch (error) {
        console.error('Error saving banner:', error);
        showToast(error.message || 'Error saving banner. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Get form data as object
 * @returns {Object} Banner data object
 */
function getFormData() {
    const bannerKey = document.getElementById('banner-key')?.value;
    const bannerId = document.getElementById('banner-id')?.value;
    
    const formData = {
        banner_key: bannerKey,
        badge_text: document.getElementById('badge-text')?.value.trim() || null,
        text: document.getElementById('banner-text')?.value.trim(),
        link_url: document.getElementById('link-url')?.value.trim() || null,
        link_text: document.getElementById('link-text')?.value.trim() || null,
        is_active: document.getElementById('is-active')?.checked,
        start_date: null,
        end_date: null
    };
    
    // Add ID if editing existing banner
    if (bannerId) {
        formData.id = bannerId;
    }
    
    // Handle date fields
    const startDateValue = document.getElementById('start-date')?.value;
    if (startDateValue) {
        formData.start_date = new Date(startDateValue).toISOString();
    }
    
    const endDateValue = document.getElementById('end-date')?.value;
    if (endDateValue) {
        formData.end_date = new Date(endDateValue).toISOString();
    }
    
    return formData;
}

/**
 * Show banner preview
 */
function showBannerPreview() {
    const formData = getFormData();
    
    // Validate required fields
    if (!formData.text || formData.text.trim() === '') {
        showToast('Please enter banner text to preview', 'warning');
        return;
    }
    
    const previewSection = document.getElementById('preview-section');
    const previewContainer = document.getElementById('banner-preview');
    
    if (!previewSection || !previewContainer) return;
    
    // Build preview HTML (matching main website banner structure)
    let previewHTML = '<div style="padding: 1rem; background: #f0f9ff; border-left: 4px solid var(--primary-color); border-radius: 4px;">';
    
    if (formData.badge_text) {
        previewHTML += `<span style="display: inline-block; background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">${escapeHtml(formData.badge_text)}</span> `;
    }
    
    previewHTML += `<span style="color: var(--text-primary);">${escapeHtml(formData.text)}</span>`;
    
    if (formData.link_url) {
        const linkText = formData.link_text || 'Learn more';
        previewHTML += ` <a href="${escapeHtml(formData.link_url)}" target="_blank" style="color: var(--primary-color); text-decoration: underline; margin-left: 8px;">${escapeHtml(linkText)}</a>`;
    }
    
    previewHTML += '</div>';
    
    previewContainer.innerHTML = previewHTML;
    previewSection.style.display = 'block';
    
    // Scroll to preview
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Handle banner deletion
 */
async function handleBannerDelete() {
    const bannerId = document.getElementById('banner-id')?.value;
    
    if (!bannerId) {
        showToast('No banner to delete', 'warning');
        return;
    }
    
    const confirmed = confirm('Are you sure you want to delete this banner? This action cannot be undone.');
    
    if (!confirmed) return;
    
    showLoading(true);
    
    try {
        const success = await bannersAPI.deleteBanner(bannerId);
        
        if (success) {
            showToast('Banner deleted successfully', 'success');
            resetBannerForm();
            
            // Hide preview
            const previewSection = document.getElementById('preview-section');
            if (previewSection) {
                previewSection.style.display = 'none';
            }
        } else {
            throw new Error('Failed to delete banner');
        }
    } catch (error) {
        console.error('Error deleting banner:', error);
        showToast(error.message || 'Error deleting banner. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Format date for datetime-local input
 * @param {Date} date - Date object
 * @returns {string} Formatted datetime string
 */
function formatDateTimeLocal(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show/hide loading overlay
 * @param {boolean} show - Whether to show loading
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'warning'
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
