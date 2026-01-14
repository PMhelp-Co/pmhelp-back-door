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
            if (!searchTerm || searchTerm.trim().length < 2) {
                return [];
            }
            
            const cleanTerm = searchTerm.trim();
            
            // Use database function to search both name and email
            const { data: results, error: rpcError } = await this.supabase
                .rpc('search_users_by_email_or_name', {
                    search_term: cleanTerm,
                    result_limit: limit
                });
            
            if (rpcError) {
                console.error('Error searching users:', rpcError);
                return [];
            }
            
            return results || [];
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
            // Get user profile with email from auth.users using RPC function
            const { data: userData, error: userError } = await this.supabase
                .rpc('get_user_details_with_email', { user_id: userId });
            
            if (userError || !userData || userData.length === 0) {
                console.error('Error fetching user:', userError);
                // Fallback: Get user profile without email
                const { data: user, error: fallbackError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (fallbackError || !user) {
                    return null;
                }
                return { ...user, email: null };
            }
            
            const user = userData[0];
            
            // Get enrolled courses with progress - need completed_at to calculate progress correctly
            const { data: progress, error: progressError } = await this.supabase
                .from('user_progress')
                .select(`
                    course_id,
                    lesson_id,
                    completed_at,
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
            
            const progressData = progress || [];
            
            // Group progress by course_id and calculate progress based on completed_at
            const courseProgressMap = new Map();
            const courseIds = new Set();
            
            for (const progressRecord of progressData) {
                const courseId = progressRecord.course_id;
                courseIds.add(courseId);
                
                if (!courseProgressMap.has(courseId)) {
                    courseProgressMap.set(courseId, {
                        course_id: courseId,
                        courses: progressRecord.courses,
                        lessonMap: new Map(), // Map<lesson_id, {completed_at, updated_at}>
                        lastUpdated: progressRecord.updated_at
                    });
                }
                
                const courseData = courseProgressMap.get(courseId);
                
                // Store the most recent progress record for each lesson
                const lessonId = progressRecord.lesson_id;
                if (!courseData.lessonMap.has(lessonId) || 
                    new Date(progressRecord.updated_at) > new Date(courseData.lessonMap.get(lessonId).updated_at)) {
                    courseData.lessonMap.set(lessonId, {
                        completed_at: progressRecord.completed_at,
                        updated_at: progressRecord.updated_at
                    });
                }
                
                // Update last updated timestamp
                if (new Date(progressRecord.updated_at) > new Date(courseData.lastUpdated)) {
                    courseData.lastUpdated = progressRecord.updated_at;
                }
            }
            
            // Get total lessons per course from lessons table
            const totalLessonsPerCourse = new Map();
            if (courseIds.size > 0) {
                const { data: lessonsData, error: lessonsError } = await this.supabase
                    .from('lessons')
                    .select('id, course_id')
                    .in('course_id', Array.from(courseIds));
                
                if (!lessonsError && lessonsData) {
                    for (const lesson of lessonsData) {
                        const courseId = lesson.course_id;
                        totalLessonsPerCourse.set(courseId, (totalLessonsPerCourse.get(courseId) || 0) + 1);
                    }
                }
            }
            
            // Convert map to array and calculate progress percentage
            const uniqueCourses = Array.from(courseProgressMap.values()).map(courseData => {
                // Count unique lessons with completed_at IS NOT NULL
                const completedLessons = Array.from(courseData.lessonMap.values())
                    .filter(lesson => lesson.completed_at !== null).length;
                
                // Get total lessons in course from lessons table
                const totalLessons = totalLessonsPerCourse.get(courseData.course_id) || 0;
                
                // Calculate progress: (completed lessons / total lessons in course) * 100
                const progressPercentage = totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0;
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:137',message:'Calculating course progress',data:{courseId:courseData.course_id,completedLessons,totalLessons,progressPercentage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                
                return {
                    course_id: courseData.course_id,
                    courses: courseData.courses,
                    progress_percentage: progressPercentage,
                    updated_at: courseData.lastUpdated
                };
            });
            
            // Sort by most recent update
            uniqueCourses.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users-api.js:128',message:'Course progress calculated',data:{totalCourses:uniqueCourses.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            // Calculate overall progress using deduplicated courses
            const overallProgress = this.calculateOverallProgress(uniqueCourses);
            
            // Get last activity date (most recent progress update)
            const lastActivity = uniqueCourses.length > 0
                ? uniqueCourses[0].updated_at
                : null;
            
            return {
                ...user,
                enrolledCourses: uniqueCourses,
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
