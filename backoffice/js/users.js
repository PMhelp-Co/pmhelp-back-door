// Users Management Logic
// Handles UI interactions for user search and details

let usersAPI;
let currentUserId = null;

// Initialize users module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    usersAPI = new UsersAPI();
    
    // Search input handlers
    const searchInput = document.getElementById('user-search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Action button handlers
    const flagInactiveBtn = document.getElementById('flag-inactive-btn');
    const sendEmailBtn = document.getElementById('send-email-btn');
    
    if (flagInactiveBtn) {
        flagInactiveBtn.addEventListener('click', handleFlagInactive);
    }
    
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', handleSendEmail);
    }
});

/**
 * Perform user search
 */
async function performSearch() {
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 2) {
        showToast('Please enter at least 2 characters to search', 'warning');
        return;
    }
    
    showLoading(true);
    searchResults.innerHTML = '<div style="padding: 1rem; text-align: center;">Searching...</div>';
    
    try {
        const users = await usersAPI.searchUsersByEmail(searchTerm);
        
        if (users.length === 0) {
            searchResults.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    No users found matching "${escapeHtml(searchTerm)}"
                </div>
            `;
        } else {
            displaySearchResults(users);
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div style="padding: 1rem; color: var(--danger-color);">
                Error searching users. Please try again.
            </div>
        `;
        showToast('Error searching users', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Display search results
 * @param {Array} users - Array of user objects
 */
function displaySearchResults(users) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    searchResults.innerHTML = users.map(user => {
        const roleBadge = user.role === 'admin' ? '<span style="background: var(--danger-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">ADMIN</span>' : '';
        
        return `
            <div class="result-item" data-user-id="${user.id}" style="padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background-color 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; margin-bottom: 4px;">
                            ${escapeHtml(user.full_name || 'No name')} ${roleBadge}
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${escapeHtml(user.email || 'No email')}
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${usersAPI.formatDate(user.created_at)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers to result items
    searchResults.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.userId;
            loadUserDetails(userId);
        });
    });
}

/**
 * Load and display user details
 * @param {string} userId - User ID
 */
async function loadUserDetails(userId) {
    currentUserId = userId;
    const userDetails = document.getElementById('user-details');
    
    if (!userDetails) return;
    
    showLoading(true);
    userDetails.style.display = 'none';
    
    try {
        const userData = await usersAPI.getUserDetails(userId);
        
        if (!userData) {
            showToast('Error loading user details', 'error');
            return;
        }
        
        // Update basic info
        document.getElementById('detail-name').textContent = userData.full_name || 'N/A';
        document.getElementById('detail-email').textContent = userData.email || 'N/A';
        document.getElementById('detail-signup').textContent = usersAPI.formatDate(userData.created_at);
        document.getElementById('detail-last-login').textContent = userData.lastActivity 
            ? usersAPI.formatDateTime(userData.lastActivity)
            : 'N/A';
        document.getElementById('detail-overall-progress').textContent = `${userData.overallProgress}%`;
        document.getElementById('detail-role').textContent = usersAPI.formatRole(userData.role);
        
        // Display enrolled courses
        displayEnrolledCourses(userData.enrolledCourses || []);
        
        // Show user details section
        userDetails.style.display = 'block';
        
        // Scroll to details
        userDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error loading user details:', error);
        showToast('Error loading user details', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Display enrolled courses table
 * @param {Array} courses - Array of course progress objects
 */
function displayEnrolledCourses(courses) {
    const tbody = document.getElementById('courses-tbody');
    if (!tbody) return;
    
    if (!courses || courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No enrolled courses</td></tr>';
        return;
    }
    
    tbody.innerHTML = courses.map(course => {
        const progress = course.progress_percentage || 0;
        const courseTitle = course.courses?.title || 'Unknown Course';
        const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
        const statusColor = progress === 100 ? 'var(--success-color)' : progress > 0 ? 'var(--primary-color)' : 'var(--text-muted)';
        
        return `
            <tr>
                <td><strong>${escapeHtml(courseTitle)}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; background: var(--bg-tertiary); height: 20px; border-radius: 4px; overflow: hidden; max-width: 200px;">
                            <div style="background: ${statusColor}; height: 100%; width: ${Math.min(progress, 100)}%; transition: width 0.3s;"></div>
                        </div>
                        <span style="min-width: 45px; text-align: right; font-size: 0.875rem;">${progress}%</span>
                    </div>
                </td>
                <td style="font-size: 0.875rem; color: var(--text-secondary);">
                    ${course.updated_at ? usersAPI.formatDateTime(course.updated_at) : 'N/A'}
                </td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; background: ${statusColor}; color: white;">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Handle flag as inactive action
 */
async function handleFlagInactive() {
    if (!currentUserId) {
        showToast('No user selected', 'warning');
        return;
    }
    
    const confirmed = confirm('Are you sure you want to flag this user as inactive? This action may trigger follow-up workflows.');
    
    if (!confirmed) return;
    
    // TODO: Implement flag inactive functionality
    // This would typically update a flag in the database or trigger a workflow
    showToast('Flag inactive functionality coming soon', 'warning');
}

/**
 * Handle send follow-up email action
 */
async function handleSendEmail() {
    if (!currentUserId) {
        showToast('No user selected', 'warning');
        return;
    }
    
    // TODO: Implement email sending functionality
    // This would typically integrate with an email service or trigger a workflow
    showToast('Send email functionality coming soon', 'warning');
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
