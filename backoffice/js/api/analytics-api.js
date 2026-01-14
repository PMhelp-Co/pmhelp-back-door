// Analytics API
// Handles all analytics-related database queries

class AnalyticsAPI {
    constructor() {
        this.supabase = window.supabase;
    }

    /**
     * Get total number of users
     * @returns {Promise<number>} Total user count
     */
    async getTotalUsers() {
        try {
            const { count, error } = await this.supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.error('Error fetching total users:', error);
                return 0;
            }
            
            return count || 0;
        } catch (error) {
            console.error('Error in getTotalUsers:', error);
            return 0;
        }
    }

    /**
     * Get active users in the last N days (based on updated_at or user_progress)
     * @param {number} days - Number of days to look back (default: 30)
     * @returns {Promise<number>} Active user count
     */
    async getActiveUsers(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            // Get users who have updated progress in the last N days
            const { data, error } = await this.supabase
                .from('user_progress')
                .select('user_id')
                .gte('updated_at', cutoffDate.toISOString());
            
            if (error) {
                console.error('Error fetching active users:', error);
                // Fallback: count profiles updated in last N days
                const { count: profileCount } = await this.supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .gte('updated_at', cutoffDate.toISOString());
                return profileCount || 0;
            }
            
            // Count distinct user_ids
            const uniqueUsers = new Set();
            if (data && Array.isArray(data)) {
                data.forEach(item => uniqueUsers.add(item.user_id));
            }
            
            return uniqueUsers.size;
        } catch (error) {
            console.error('Error in getActiveUsers:', error);
            return 0;
        }
    }

    /**
     * Get total number of courses
     * @returns {Promise<number>} Total course count
     */
    async getTotalCourses() {
        try {
            const { count, error } = await this.supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true);
            
            if (error) {
                console.error('Error fetching total courses:', error);
                return 0;
            }
            
            return count || 0;
        } catch (error) {
            console.error('Error in getTotalCourses:', error);
            return 0;
        }
    }

    /**
     * Get total course completions
     * @returns {Promise<number>} Total completion count
     */
    async getTotalCompletions() {
        try {
            const { count, error } = await this.supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('progress_percentage', 100);
            
            if (error) {
                console.error('Error fetching total completions:', error);
                return 0;
            }
            
            return count || 0;
        } catch (error) {
            console.error('Error in getTotalCompletions:', error);
            return 0;
        }
    }

    /**
     * Get new users over time
     * Uses the SQL function get_new_users_over_time if available, otherwise queries directly
     * @param {string} period - 'daily' or 'weekly' (default: 'daily')
     * @returns {Promise<Array>} Array of {period_start, new_users_count}
     */
    async getNewUsersOverTime(period = 'daily') {
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:123',message:'getNewUsersOverTime entry',data:{period},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            // Determine truncation level
            const truncLevel = period === 'daily' ? 'day' : 'week';
            
            // Try to use the SQL function first
            const { data: functionData, error: functionError } = await this.supabase
                .rpc('get_new_users_over_time', { 
                    trunc_level: truncLevel
                });
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:131',message:'SQL function result',data:{hasData:!!functionData,dataLength:functionData?.length||0,hasError:!!functionError,errorCode:functionError?.code,errorMessage:functionError?.message,truncLevel},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            if (!functionError && functionData) {
                const reversed = functionData.reverse(); // Return chronological order
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:137',message:'Returning SQL function data',data:{dataLength:reversed.length,firstItem:reversed[0]?JSON.stringify(reversed[0]):null,truncLevel},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                return reversed;
            }
            
            // Fallback: Query directly if function doesn't exist
            const days = period === 'daily' ? 90 : 90; // Last 90 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:148',message:'Using fallback query',data:{cutoffDate:cutoffDate.toISOString(),period},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            const { data, error } = await this.supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', cutoffDate.toISOString())
                .order('created_at', { ascending: true });
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:155',message:'Fallback query result',data:{hasData:!!data,dataLength:data?.length||0,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            if (error) {
                console.error('Error fetching new users over time:', error);
                return [];
            }
            
            // Group by day or week based on period
            const grouped = {};
            data.forEach(profile => {
                const date = new Date(profile.created_at);
                let key;
                
                if (period === 'weekly') {
                    // Group by week (start of week: Monday)
                    const weekStart = new Date(date);
                    const dayOfWeek = date.getDay();
                    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
                    weekStart.setDate(diff);
                    weekStart.setHours(0, 0, 0, 0);
                    key = weekStart.toISOString().split('T')[0]; // Use YYYY-MM-DD format
                } else {
                    // Group by day
                    key = date.toISOString().split('T')[0];
                }
                
                grouped[key] = (grouped[key] || 0) + 1;
            });
            
            const result = Object.entries(grouped).map(([period_start, new_users_count]) => ({
                period_start: new Date(period_start).toISOString(),
                new_users_count
            })).sort((a, b) => new Date(a.period_start) - new Date(b.period_start)); // Sort chronologically
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:183',message:'Returning grouped data',data:{resultLength:result.length,period,groupingType:period === 'weekly' ? 'week' : 'day'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return result;
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-api.js:187',message:'getNewUsersOverTime error',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.error('Error in getNewUsersOverTime:', error);
            return [];
        }
    }

    /**
     * Get course completion rates
     * Uses the SQL function get_course_completion_rates if available
     * @returns {Promise<Array>} Array of course completion data
     */
    async getCourseCompletionRates() {
        try {
            // Try to use the SQL function first
            const { data: functionData, error: functionError } = await this.supabase
                .rpc('get_course_completion_rates');
            
            if (!functionError && functionData) {
                return functionData;
            }
            
            // Fallback: Query manually if function doesn't exist
            const { data: courses, error: coursesError } = await this.supabase
                .from('courses')
                .select('id, title')
                .eq('is_published', true);
            
            if (coursesError || !courses) {
                console.error('Error fetching courses:', coursesError);
                return [];
            }
            
            const completionRates = [];
            
            for (const course of courses) {
                const { data: progress, error: progressError } = await this.supabase
                    .from('user_progress')
                    .select('user_id, progress_percentage')
                    .eq('course_id', course.id);
                
                if (progressError) {
                    console.error(`Error fetching progress for course ${course.id}:`, progressError);
                    continue;
                }
                
                const totalEnrollments = new Set(progress.map(p => p.user_id)).size;
                const completedCount = progress.filter(p => p.progress_percentage === 100).length;
                const completionRate = totalEnrollments > 0 
                    ? ((completedCount / totalEnrollments) * 100).toFixed(2) 
                    : 0;
                
                completionRates.push({
                    course_id: course.id,
                    course_title: course.title,
                    total_enrollments: totalEnrollments,
                    completed_count: completedCount,
                    completion_rate: parseFloat(completionRate)
                });
            }
            
            // Sort by completion rate descending
            return completionRates.sort((a, b) => b.completion_rate - a.completion_rate);
        } catch (error) {
            console.error('Error in getCourseCompletionRates:', error);
            return [];
        }
    }

    /**
     * Get overall statistics (convenience method)
     * @returns {Promise<Object>} Object with all key metrics
     */
    async getOverallStats() {
        try {
            const [totalUsers, activeUsers, totalCourses, totalCompletions] = await Promise.all([
                this.getTotalUsers(),
                this.getActiveUsers(30),
                this.getTotalCourses(),
                this.getTotalCompletions()
            ]);
            
            return {
                totalUsers,
                activeUsers,
                totalCourses,
                totalCompletions
            };
        } catch (error) {
            console.error('Error in getOverallStats:', error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                totalCourses: 0,
                totalCompletions: 0
            };
        }
    }
}
