// Analytics Dashboard Logic
// Handles UI interactions and data display for analytics tab

let analyticsAPI;
let currentPeriod = 'weekly';
let previousStats = {}; // Store previous week's stats for week-on-week comparison
let currentDateFilter = { startDate: null, endDate: null }; // Store current date filter state

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    analyticsAPI = new AnalyticsAPI();
    
    // Load analytics when tab becomes active
    const analyticsTab = document.getElementById('analytics-tab');
    if (analyticsTab && analyticsTab.classList.contains('active')) {
        loadAnalytics();
    }
    
    // Refresh button handler
    const refreshBtn = document.getElementById('refresh-analytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAnalytics();
        });
    }
    
    // Period button handlers
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            // Reload chart with current period and date filter
            loadUsersChart(currentPeriod, currentDateFilter.startDate, currentDateFilter.endDate);
        });
    });
    
    // Date filter handlers
    const applyDateFilterBtn = document.getElementById('apply-date-filter');
    const clearDateFilterBtn = document.getElementById('clear-date-filter');
    
    if (applyDateFilterBtn) {
        applyDateFilterBtn.addEventListener('click', () => {
            const startDateInput = document.getElementById('chart-start-date');
            const endDateInput = document.getElementById('chart-end-date');
            const startDate = startDateInput?.value?.trim() || null;
            const endDate = endDateInput?.value?.trim() || null;
            
            currentDateFilter.startDate = startDate;
            currentDateFilter.endDate = endDate;
            
            console.log('Applying date filter:', { startDate, endDate, period: currentPeriod });
            loadUsersChart(currentPeriod, startDate, endDate);
        });
    }
    
    if (clearDateFilterBtn) {
        clearDateFilterBtn.addEventListener('click', () => {
            const startDateInput = document.getElementById('chart-start-date');
            const endDateInput = document.getElementById('chart-end-date');
            if (startDateInput) startDateInput.value = '';
            if (endDateInput) endDateInput.value = '';
            currentDateFilter.startDate = null;
            currentDateFilter.endDate = null;
            loadUsersChart(currentPeriod);
        });
    }
});

/**
 * Load all analytics data
 */
async function loadAnalytics() {
    showLoading(true);
    
    try {
        // Load overall stats
        await loadOverallStats();
        
        // Load users chart (default: weekly)
        await loadUsersChart('weekly');
        
        // Load completion rates
        await loadCompletionRates();
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Error loading analytics data', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Load and display overall statistics
 */
async function loadOverallStats() {
    try {
        const stats = await analyticsAPI.getOverallStats();
        
        // Store previous stats for week-on-week comparison (using localStorage)
        const storedStats = JSON.parse(localStorage.getItem('previousStats') || '{}');
        
        // Update stat cards with values and tooltips
        updateStatCard('total-users', stats.totalUsers, storedStats.totalUsers);
        updateStatCard('active-users', stats.activeUsers, storedStats.activeUsers);
        updateStatCard('total-courses', stats.totalCourses, storedStats.totalCourses);
        updateStatCard('total-completions', stats.totalCompletions, storedStats.totalCompletions);
        
        // Store current stats for next comparison
        localStorage.setItem('previousStats', JSON.stringify(stats));
    } catch (error) {
        console.error('Error loading overall stats:', error);
        updateStatCard('total-users', 'Error');
        updateStatCard('active-users', 'Error');
        updateStatCard('total-courses', 'Error');
        updateStatCard('total-completions', 'Error');
    }
}

/**
 * Update a stat card value
 * @param {string} elementId - ID of the stat value element
 * @param {number|string} value - Value to display
 * @param {number} previousValue - Previous value for week-on-week comparison
 */
function updateStatCard(elementId, value, previousValue = null) {
    const element = document.getElementById(elementId);
    if (element) {
        if (typeof value === 'number') {
            element.textContent = value.toLocaleString();
        } else {
            element.textContent = value;
        }
    }
    
    // Clear tooltip content - user doesn't want to see week-on-week differences in stat cards
    const tooltipId = `tooltip-${elementId}`;
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement) {
        tooltipElement.innerHTML = '';
    }
}

/**
 * Load and display users chart
 * @param {string} period - 'daily' or 'weekly'
 * @param {string} startDate - Optional start date filter (YYYY-MM-DD)
 * @param {string} endDate - Optional end date filter (YYYY-MM-DD)
 */
async function loadUsersChart(period = 'weekly', startDate = null, endDate = null) {
    try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:100',message:'loadUsersChart entry',data:{period,startDate,endDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        let data = await analyticsAPI.getNewUsersOverTime(period);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:104',message:'Chart data received',data:{hasData:!!data,dataLength:data?.length||0,firstItem:data?.[0]?JSON.stringify(data[0]):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Apply date filter if provided
        if (startDate || endDate) {
            data = data.filter(item => {
                if (!item.period_start) return false;
                
                const itemDate = new Date(item.period_start);
                // Compare dates at midnight for accurate filtering
                const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
                
                if (startDate) {
                    const startDateObj = new Date(startDate + 'T00:00:00');
                    const startDateOnly = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
                    if (itemDateOnly < startDateOnly) return false;
                }
                
                if (endDate) {
                    const endDateObj = new Date(endDate + 'T23:59:59');
                    const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());
                    if (itemDateOnly > endDateOnly) return false;
                }
                
                return true;
            });
        }
        
        if (!data || data.length === 0) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:108',message:'No data - displaying empty chart',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            displayEmptyChart();
            return;
        }
        
        renderSimpleBarChart(data, period);
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:115',message:'Chart load error',data:{errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Error loading users chart:', error);
        displayChartError();
    }
}

/**
 * Render a simple bar chart using CSS/HTML
 * @param {Array} data - Array of {period_start, new_users_count}
 * @param {string} period - 'daily' or 'weekly'
 */
function renderSimpleBarChart(data, period = 'weekly') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:120',message:'renderSimpleBarChart entry',data:{dataLength:data?.length||0,period},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const chartContainer = document.getElementById('users-chart');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:123',message:'Chart container check',data:{hasContainer:!!chartContainer,containerId:chartContainer?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (!chartContainer) return;
    
    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.new_users_count || 0), 1);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:128',message:'Max value calculated',data:{maxValue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Create chart HTML
    chartContainer.innerHTML = '';
    
    // Limit to last 30 data points for readability
    const displayData = data.slice(-30);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:135',message:'Display data prepared',data:{displayDataLength:displayData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    let barCount = 0;
    const containerHeight = 300; // Match CSS height
    displayData.forEach((item, index) => {
        // Calculate difference - for weekly compare to previous week, for daily compare to previous day
        const comparisonIndex = period === 'weekly' ? index - 1 : index - 1;
        const previousValue = comparisonIndex >= 0 && comparisonIndex < displayData.length 
            ? displayData[comparisonIndex].new_users_count 
            : null;
        const difference = previousValue !== null ? item.new_users_count - previousValue : null;
        const percentageChange = previousValue !== null && previousValue !== 0
            ? ((difference / previousValue) * 100).toFixed(1)
            : null;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-bar-wrapper';
        barWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            flex: 1;
            min-width: 0;
            height: ${containerHeight}px;
        `;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        const heightPercent = (item.new_users_count / maxValue) * 100;
        const barHeight = Math.max((containerHeight * heightPercent) / 100, 2); // Calculate actual pixel height
        bar.style.cssText = `
            width: 100%;
            height: ${barHeight}px;
            background-color: var(--primary-color);
            border-radius: 2px 2px 0 0;
            margin-bottom: 4px;
            transition: all 0.3s;
            min-height: 2px;
            position: relative;
        `;
        
        // Add number on top of bar
        const barNumber = document.createElement('div');
        barNumber.className = 'chart-bar-number';
        barNumber.textContent = item.new_users_count;
        bar.appendChild(barNumber);
        
        // Add hover tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-bar-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-value">${formatChartDate(item.period_start)}: ${item.new_users_count} users</div>
            ${difference !== null ? `
                <div class="tooltip-change ${difference >= 0 ? 'positive' : 'negative'}">
                    ${difference >= 0 ? '+' : ''}${difference} (${difference >= 0 ? '+' : ''}${percentageChange}%) vs previous ${period === 'weekly' ? 'week' : 'day'}
                </div>
            ` : ''}
        `;
        barWrapper.appendChild(tooltip);
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.style.cssText = `
            font-size: 10px;
            color: var(--text-secondary);
            text-align: center;
            transform: rotate(-45deg);
            white-space: nowrap;
            margin-top: 4px;
            transform-origin: center;
        `;
        label.textContent = formatChartDate(item.period_start);
        
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
        barCount++;
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/13978a60-52fa-47d2-b247-7e88c907794b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:176',message:'Chart bars created',data:{barCount,containerChildren:chartContainer.children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
}

/**
 * Format date for chart display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatChartDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Display empty chart message
 */
function displayEmptyChart() {
    const chartContainer = document.getElementById('users-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No data available</p>';
    }
}

/**
 * Display chart error message
 */
function displayChartError() {
    const chartContainer = document.getElementById('users-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 2rem;">Error loading chart data</p>';
    }
}

/**
 * Load and display course completion rates
 */
async function loadCompletionRates() {
    try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/ce2938ad-f898-40c9-98e9-4551009b4f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:349',message:'loadCompletionRates entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const completionData = await analyticsAPI.getCourseCompletionRates();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/ce2938ad-f898-40c9-98e9-4551009b4f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:352',message:'Completion data received',data:{dataLength:completionData?.length||0,allCourses:completionData?.map(c=>({title:c.course_title,enrollments:c.total_enrollments,completions:c.completed_count,rate:c.completion_rate}))||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const tbody = document.getElementById('completion-tbody');
        
        if (!tbody) return;
        
        if (!completionData || completionData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">No completion data available</td></tr>';
            return;
        }
        
        tbody.innerHTML = completionData.map(course => {
            const completionRate = course.completion_rate || 0;
            const rateDisplay = isNaN(completionRate) ? '0.00' : completionRate.toFixed(2);
            
            // #region agent log
            if (completionRate > 100) {
                fetch('http://127.0.0.1:7243/ingest/ce2938ad-f898-40c9-98e9-4551009b4f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:365',message:'Found completion rate >100%',data:{courseTitle:course.course_title,enrollments:course.total_enrollments,completions:course.completed_count,rate:completionRate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            }
            // #endregion
            
            return `
                <tr>
                    <td><strong>${escapeHtml(course.course_title || 'Unknown Course')}</strong></td>
                    <td>${course.total_enrollments || 0}</td>
                    <td>${course.completed_count || 0}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; background: var(--bg-tertiary); height: 20px; border-radius: 4px; overflow: hidden;">
                                <div style="background: var(--primary-color); height: 100%; width: ${Math.min(completionRate, 100)}%; transition: width 0.3s;"></div>
                            </div>
                            <span style="min-width: 50px; text-align: right;">${rateDisplay}%</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/ce2938ad-f898-40c9-98e9-4551009b4f6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:382',message:'loadCompletionRates error',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('Error loading completion rates:', error);
        const tbody = document.getElementById('completion-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Error loading completion data</td></tr>';
        }
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
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
 * @param {string} type - Toast type: 'success', 'error', 'warning' (default: 'success')
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
