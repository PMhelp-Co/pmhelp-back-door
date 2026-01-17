// Users Management Logic
// Handles UI interactions for user search, filtering, and details

let usersAPI;
let currentUserId = null;
let allUsers = [];
let filteredUsers = [];

// Initialize users module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    usersAPI = new UsersAPI();
    
    // Filter handlers
    const filterRole = document.getElementById('filter-role');
    const filterSort = document.getElementById('filter-sort');
    
    if (filterRole) {
        filterRole.addEventListener('change', applyFilters);
    }
    
    if (filterSort) {
        filterSort.addEventListener('change', applyFilters);
    }
    
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
 * Load all users and display as cards
 */
async function loadAllUsers() {
    const cardsContainer = document.getElementById('user-cards-container');
    const searchResults = document.getElementById('search-results');
    
    if (!cardsContainer) return;
    
    // Show cards container, hide search results
    cardsContainer.style.display = 'grid';
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    showLoading(true);
    cardsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Loading users...</div>';
    
    try {
        allUsers = await usersAPI.getAllUsers(1000);
        filteredUsers = [...allUsers];
        
        if (allUsers.length === 0) {
            cardsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">No users found</div>';
            return;
        }
        
        applyFilters(); // This will display the cards
    } catch (error) {
        console.error('Error loading users:', error);
        cardsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--danger-color);">Error loading users. Please try again.</div>';
        showToast('Error loading users', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Apply filters to user cards
 */
function applyFilters() {
    const filterRole = document.getElementById('filter-role');
    const filterSort = document.getElementById('filter-sort');
    const cardsContainer = document.getElementById('user-cards-container');
    
    if (!cardsContainer) return;
    
    // Start with all users
    filteredUsers = [...allUsers];
    
    // Filter by role
    if (filterRole && filterRole.value) {
        filteredUsers = filteredUsers.filter(user => user.role === filterRole.value);
    }
    
    // Sort
    if (filterSort && filterSort.value) {
        const [sortField, sortOrder] = filterSort.value.split('-');
        const ascending = sortOrder === 'asc';
        
        filteredUsers.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';
            
            if (sortField === 'created_at') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }
            
            if (ascending) {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    }
    
    // Display filtered cards
    displayUserCards(filteredUsers);
}

/**
 * Display user cards in grid
 * @param {Array} users - Array of user objects
 */
function displayUserCards(users) {
    const cardsContainer = document.getElementById('user-cards-container');
    if (!cardsContainer) return;
    
    if (!users || users.length === 0) {
        cardsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">No users found</div>';
        return;
    }
    
    cardsContainer.innerHTML = users.map(user => {
        const roleBadge = getRoleBadge(user.role);
        const initials = getUserInitials(user.full_name || user.email || 'U');
        
        return `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-card-avatar">${initials}</div>
                <div class="user-card-content">
                    <div class="user-card-name">
                        ${escapeHtml(user.full_name || 'No name')} ${roleBadge}
                    </div>
                    <div class="user-card-email">${escapeHtml(user.email || 'No email')}</div>
                    <div class="user-card-meta">
                        <span class="user-card-date">Joined ${usersAPI.formatDate(user.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers to cards
    cardsContainer.querySelectorAll('.user-card').forEach(card => {
        card.addEventListener('click', () => {
            const userId = card.dataset.userId;
            loadUserDetails(userId);
        });
    });
}

/**
 * Get role badge HTML
 * @param {string} role - User role
 * @returns {string} Badge HTML
 */
function getRoleBadge(role) {
    const roleConfig = {
        'admin': { text: 'ADMIN', color: 'var(--danger-color)' },
        'team': { text: 'TEAM', color: 'var(--primary-color)' },
        'instructor': { text: 'INSTRUCTOR', color: 'var(--pmhelp-purple-accent)' },
        'student': { text: 'STUDENT', color: 'var(--text-secondary)' }
    };
    
    const config = roleConfig[role] || { text: role?.toUpperCase() || '', color: 'var(--text-muted)' };
    
    return config.text ? `<span class="user-role-badge" style="background: ${config.color};">${config.text}</span>` : '';
}

/**
 * Get user initials
 * @param {string} name - User name or email
 * @returns {string} Initials (max 2 characters)
 */
function getUserInitials(name) {
    if (!name) return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase().substring(0, 2);
    }
    
    return name.substring(0, 2).toUpperCase();
}

/**
 * Perform user search - clears cards and shows search results
 */
async function performSearch() {
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    const cardsContainer = document.getElementById('user-cards-container');
    const filtersSection = document.getElementById('user-filters-section');
    
    if (!searchInput || !searchResults) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 2) {
        showToast('Please enter at least 2 characters to search', 'warning');
        return;
    }
    
    // Hide cards and filters, show search results
    if (cardsContainer) {
        cardsContainer.style.display = 'none';
    }
    if (filtersSection) {
        filtersSection.style.display = 'none';
    }
    searchResults.style.display = 'block';
    
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
 * Clear search and return to card view
 */
function clearSearch() {
    const searchInput = document.getElementById('user-search-input');
    const searchResults = document.getElementById('search-results');
    const cardsContainer = document.getElementById('user-cards-container');
    const filtersSection = document.getElementById('user-filters-section');
    
    if (searchInput) {
        searchInput.value = '';
    }
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    if (cardsContainer) {
        cardsContainer.style.display = 'grid';
    }
    if (filtersSection) {
        filtersSection.style.display = 'block';
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
        const roleBadge = getRoleBadge(user.role);
        
        return `
            <div class="result-item" data-user-id="${user.id}">
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
