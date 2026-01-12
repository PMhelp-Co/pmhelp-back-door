// Users API
// Handles all user-related database queries

class UsersAPI {
    constructor() {
        this.supabase = window.supabase;
    }

    /**
     * Search users by email or name
     * @param {string} searchTerm - Search term (email or name)
     * @param {number} limit - Maximum results (default: 50)
     * @returns {Promise<Array>} Array of user profiles
     */
    async searchUsersByEmail(searchTerm, limit = 50) {
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:15',message:'searchUsersByEmail entry',data:{searchTerm,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            if (!searchTerm || searchTerm.trim().length < 2) {
                return [];
            }
            
            const cleanTerm = searchTerm.trim();
            const searchPattern = `%${cleanTerm}%`;
            
            // Use separate queries and combine (more reliable than .or() with ilike)
            // Search by name only (email is in auth.users, not profiles)
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:26',message:'Starting name search',data:{searchPattern},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const { data: nameData, error: nameError } = await this.supabase
                .from('profiles')
                .select('id, full_name, created_at, role, updated_at')
                .ilike('full_name', searchPattern)
                .limit(limit)
                .order('created_at', { ascending: false });
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:33',message:'Name search result',data:{hasData:!!nameData,dataCount:nameData?.length||0,hasError:!!nameError,errorCode:nameError?.code,errorMessage:nameError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            if (nameError) {
                console.error('Error searching users by name:', nameError);
            }
            
            // Return name results (email search removed since email is not in profiles table)
            const results = (nameData || [])
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:42',message:'searchUsersByEmail result',data:{resultCount:results.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return results;
        } catch (error) {
            console.error('Error in searchUsersByEmail:', error);
            return [];
        }
    }

    /**
     * Get detailed user information including progress
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User details object or null
     */
    async getUserDetails(userId) {
        try {
            // Get user profile
            const { data: user, error: userError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (userError || !user) {
                console.error('Error fetching user:', userError);
                return null;
            }
            
            // Get enrolled courses with progress
            const { data: progress, error: progressError } = await this.supabase
                .from('user_progress')
                .select(`
                    course_id,
                    progress_percentage,
                    updated_at,
                    courses:course_id (
                        id,
                        title,
                        slug
                    )
                `)
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });
            
            if (progressError) {
                console.error('Error fetching user progress:', progressError);
            }
            
            // Calculate overall progress
            const overallProgress = this.calculateOverallProgress(progress || []);
            
            // Get last activity date (most recent progress update)
            const lastActivity = progress && progress.length > 0
                ? progress[0].updated_at
                : null;
            
            return {
                ...user,
                enrolledCourses: progress || [],
                overallProgress,
                lastActivity
            };
        } catch (error) {
            console.error('Error in getUserDetails:', error);
            return null;
        }
    }

    /**
     * Calculate overall learning progress from progress data
     * @param {Array} progressData - Array of user progress objects
     * @returns {number} Average progress percentage (0-100)
     */
    calculateOverallProgress(progressData) {
        if (!progressData || progressData.length === 0) {
            return 0;
        }
        
        const totalProgress = progressData.reduce((sum, p) => {
            return sum + (p.progress_percentage || 0);
        }, 0);
        
        return Math.round(totalProgress / progressData.length);
    }

    /**
     * Get user's last login time
     * Note: This requires admin API access. For MVP, we'll use updated_at as proxy.
     * @param {string} userId - User ID
     * @returns {Promise<string|null>} Last login timestamp or null
     */
    async getUserLastLogin(userId) {
        try {
            // Try to use SQL function if available
            const { data, error } = await this.supabase
                .rpc('get_user_last_login', { user_id: userId });
            
            if (!error && data) {
                return data;
            }
            
            // Fallback: Use updated_at from profile as proxy
            const { data: profile } = await this.supabase
                .from('profiles')
                .select('updated_at')
                .eq('id', userId)
                .single();
            
            return profile?.updated_at || null;
        } catch (error) {
            console.error('Error getting last login:', error);
            return null;
        }
    }

    /**
     * Get inactive users (no activity in last N days)
     * @param {number} days - Number of days (default: 30)
     * @returns {Promise<Array>} Array of inactive users
     */
    async getInactiveUsers(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            // Get users with no recent progress
            const { data: activeUserIds } = await this.supabase
                .from('user_progress')
                .select('user_id')
                .gte('updated_at', cutoffDate.toISOString());
            
            const activeIds = new Set(activeUserIds?.map(p => p.user_id) || []);
            
            // Get all student users
            const { data: allUsers, error } = await this.supabase
                .from('profiles')
                .select('id, full_name, email, created_at, updated_at, role')
                .eq('role', 'student')
                .order('updated_at', { ascending: true });
            
            if (error) {
                console.error('Error fetching inactive users:', error);
                return [];
            }
            
            // Filter out active users
            const inactiveUsers = (allUsers || []).filter(user => {
                // Not in active list AND updated_at is before cutoff
                return !activeIds.has(user.id) && 
                       new Date(user.updated_at) < cutoffDate;
            });
            
            return inactiveUsers;
        } catch (error) {
            console.error('Error in getInactiveUsers:', error);
            return [];
        }
    }

    /**
     * Format user role for display
     * @param {string} role - User role
     * @returns {string} Formatted role name
     */
    formatRole(role) {
        const roleMap = {
            'student': 'Student',
            'admin': 'Admin',
            'team': 'Team Member',
            'instructor': 'Instructor'
        };
        return roleMap[role] || role;
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
