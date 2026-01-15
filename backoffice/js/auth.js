// Backoffice Authentication
// Handles authentication and authorization for the backoffice system

class BackofficeAuth {
    constructor() {
        this.allowedRoles = ['admin', 'team', 'instructor'];
    }

    /**
     * Require authentication and admin role
     * Redirects to login if not authenticated or not admin
     * @returns {Promise<Session|null>} Session object or null if not authorized
     */
    async requireAuth() {
        try {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
                this.redirectToLogin();
                return null;
            }
            
            if (!session) {
                this.redirectToLogin();
                return null;
            }
            
            // Check if user has admin/team/instructor role
            const hasAccess = await this.checkAdminAccess(session);
            
            if (!hasAccess) {
                alert('Access denied. Admin, team, or instructor role required.');
                await window.supabase.auth.signOut();
                this.redirectToLogin();
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('Auth check error:', error);
            this.redirectToLogin();
            return null;
        }
    }

    /**
     * Check if user has admin/team/instructor role
     * @param {Session} session - Supabase session object
     * @returns {Promise<boolean>} True if user has access
     */
    async checkAdminAccess(session) {
        try {
            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            
            if (error || !profile) {
                console.error('Profile fetch error:', error);
                return false;
            }
            
            return this.allowedRoles.includes(profile.role);
        } catch (error) {
            console.error('Admin access check error:', error);
            return false;
        }
    }

    /**
     * Get current user's profile with role information
     * @returns {Promise<Object|null>} User profile or null
     */
    async getCurrentUserProfile() {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (!session) {
                return null;
            }
            
            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (error) {
                console.error('Profile fetch error:', error);
                return null;
            }
            
            return profile;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    /**
     * Logout user and redirect to login page
     */
    async logout() {
        try {
            const { error } = await window.supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
            this.redirectToLogin();
        } catch (error) {
            console.error('Logout error:', error);
            this.redirectToLogin();
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        // Get current pathname
        const currentPath = window.location.pathname;
        
        // If already on login page, don't redirect
        if (currentPath.includes('login.html')) {
            return;
        }
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    /**
     * Check if user is authenticated (without redirect)
     * Useful for conditional UI rendering
     * @returns {Promise<boolean>} True if authenticated and has access
     */
    async isAuthenticated() {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (!session) {
                return false;
            }
            
            return await this.checkAdminAccess(session);
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }
}
