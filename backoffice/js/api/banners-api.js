// Banners API
// Handles all banner-related CRUD operations

class BannersAPI {
    constructor() {
        this.supabase = window.supabase;
    }

    /**
     * Get all banners
     * @returns {Promise<Array>} Array of all banners
     */
    async getAllBanners() {
        try {
            const { data, error } = await this.supabase
                .from('website_banners')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching banners:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('Error in getAllBanners:', error);
            return [];
        }
    }

    /**
     * Get active banner by key
     * @param {string} bannerKey - Banner key (e.g., 'homepage-announcement')
     * @returns {Promise<Object|null>} Banner object or null
     */
    async getActiveBanner(bannerKey) {
        try {
            const { data, error } = await this.supabase
                .from('website_banners')
                .select('*')
                .eq('banner_key', bannerKey)
                .eq('is_active', true)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned - banner doesn't exist
                    return null;
                }
                console.error('Error fetching active banner:', error);
                return null;
            }
            
            // Check if banner is within date range
            if (data && this.isBannerActive(data)) {
                return data;
            }
            
            return null;
        } catch (error) {
            console.error('Error in getActiveBanner:', error);
            return null;
        }
    }

    /**
     * Get banner by key (regardless of active status)
     * @param {string} bannerKey - Banner key
     * @returns {Promise<Object|null>} Banner object or null
     */
    async getBannerByKey(bannerKey) {
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:73',message:'getBannerByKey entry',data:{bannerKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            const { data, error } = await this.supabase
                .from('website_banners')
                .select('*')
                .eq('banner_key', bannerKey)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:81',message:'getBannerByKey result',data:{hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,statusCode:error?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Error fetching banner by key:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error in getBannerByKey:', error);
            return null;
        }
    }

    /**
     * Check if banner is currently active (within date range)
     * @param {Object} banner - Banner object
     * @returns {boolean} True if banner is active
     */
    isBannerActive(banner) {
        if (!banner.is_active) {
            return false;
        }
        
        const now = new Date();
        
        if (banner.start_date && new Date(banner.start_date) > now) {
            return false;
        }
        
        if (banner.end_date && new Date(banner.end_date) < now) {
            return false;
        }
        
        return true;
    }

    /**
     * Create or update banner
     * @param {Object} bannerData - Banner data object
     * @returns {Promise<Object|null>} Saved banner object or null
     */
    async saveBanner(bannerData) {
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:127',message:'saveBanner entry',data:{hasId:!!bannerData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:129',message:'getSession result',data:{hasData:!!sessionData,hasSession:!!sessionData?.session,hasError:!!sessionError,sessionStructure:JSON.stringify(Object.keys(sessionData||{}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            const session = sessionData?.session;
            if (!session) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:133',message:'No session found',data:{sessionError:sessionError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                throw new Error('Not authenticated');
            }
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:137',message:'Session validated',data:{hasUser:!!session.user,hasUserId:!!session.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            const now = new Date().toISOString();
            const bannerToSave = {
                ...bannerData,
                updated_at: now
            };
            
            if (bannerData.id) {
                // Update existing banner
                const { data, error } = await this.supabase
                    .from('website_banners')
                    .update(bannerToSave)
                    .eq('id', bannerData.id)
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error updating banner:', error);
                    throw error;
                }
                
                return data;
            } else {
                // Create new banner
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:161',message:'Creating banner',data:{userId:session.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                const { data, error } = await this.supabase
                    .from('website_banners')
                    .insert({
                        ...bannerToSave,
                        created_by: session.user.id,
                        created_at: now
                    })
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error creating banner:', error);
                    throw error;
                }
                
                return data;
            }
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'banners-api.js:175',message:'saveBanner error',data:{errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.error('Error in saveBanner:', error);
            throw error;
        }
    }

    /**
     * Delete banner
     * @param {string} bannerId - Banner ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteBanner(bannerId) {
        try {
            const { error } = await this.supabase
                .from('website_banners')
                .delete()
                .eq('id', bannerId);
            
            if (error) {
                console.error('Error deleting banner:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error in deleteBanner:', error);
            return false;
        }
    }

    /**
     * Toggle banner active status
     * @param {string} bannerId - Banner ID
     * @param {boolean} isActive - New active status
     * @returns {Promise<Object|null>} Updated banner or null
     */
    async toggleBannerStatus(bannerId, isActive) {
        try {
            const { data, error } = await this.supabase
                .from('website_banners')
                .update({ 
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bannerId)
                .select()
                .single();
            
            if (error) {
                console.error('Error toggling banner status:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error in toggleBannerStatus:', error);
            return null;
        }
    }

    /**
     * Validate banner data before saving
     * @param {Object} bannerData - Banner data to validate
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateBannerData(bannerData) {
        const errors = [];
        
        if (!bannerData.banner_key || bannerData.banner_key.trim() === '') {
            errors.push('Banner key is required');
        }
        
        if (!bannerData.text || bannerData.text.trim() === '') {
            errors.push('Banner text is required');
        }
        
        if (bannerData.link_url && bannerData.link_url.trim() !== '') {
            try {
                new URL(bannerData.link_url);
            } catch (e) {
                errors.push('Invalid link URL format');
            }
        }
        
        if (bannerData.start_date && bannerData.end_date) {
            if (new Date(bannerData.start_date) > new Date(bannerData.end_date)) {
                errors.push('Start date must be before end date');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
