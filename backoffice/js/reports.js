// Reports Management Logic
// Handles UI interactions for report downloads tracking

let reportsAPI;

// Initialize reports module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    reportsAPI = new ReportsAPI();
    
    // Refresh button handler
    const refreshBtn = document.getElementById('refresh-reports');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadReports();
        });
    }
});

/**
 * Load and display all report downloads
 */
async function loadReports() {
    const tbody = document.getElementById('reports-tbody');
    
    if (!tbody) return;
    
    showLoading(true);
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading reports...</td></tr>';
    
    try {
        const reports = await reportsAPI.getAllReportDownloads();
        
        if (!reports || reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No report downloads found</td></tr>';
            return;
        }
        
        tbody.innerHTML = reports.map(report => {
            return `
                <tr>
                    <td><strong>${escapeHtml(report.name || 'N/A')}</strong></td>
                    <td>${escapeHtml(report.email || 'N/A')}</td>
                    <td>${escapeHtml(report.report_title || 'N/A')}</td>
                    <td>${report.report_year || 'N/A'}</td>
                    <td style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${reportsAPI.formatDateTime(report.downloaded_at)}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-color); padding: 2rem;">Error loading reports. Please try again.</td></tr>';
        showToast('Error loading reports', 'error');
    } finally {
        showLoading(false);
    }
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
