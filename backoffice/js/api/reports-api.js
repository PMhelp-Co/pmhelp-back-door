// Reports API
// Handles all report download tracking queries

class ReportsAPI {
    constructor() {
        this.supabase = window.supabase;
    }

    /**
     * Get all report downloads
     * @param {number} limit - Maximum results (default: 1000)
     * @returns {Promise<Array>} Array of report download records
     */
    async getAllReportDownloads(limit = 1000) {
        try {
            const { data, error } = await this.supabase
                .from('impact_report_downloads')
                .select('*')
                .order('downloaded_at', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('Error fetching report downloads:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('Error in getAllReportDownloads:', error);
            return [];
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format datetime for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted datetime
     */
    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
