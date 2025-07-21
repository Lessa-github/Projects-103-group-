// script.js
// Main Application Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Study session data
    let studySessions = [];
    
    // Task data
    let tasks = [];
    
    // Load data from localStorage or initialize with sample data
    loadStudySessions();
    loadTasks();
    
    // Initialize the app based on the current page
    const currentPage = getCurrentPage();
    
    // Map of page names to initialization functions
    const pageInitMap = {
        'index.html': initializeDashboard,
        'tasks.html': initializeTaskManager,
        'stats.html': initializeStatistics,
        'settings.html': initializeSettings,
        'about.html': initializeAbout
    };
    
    // Check if current page has an initialization function
    if (currentPage in pageInitMap) {
        pageInitMap[currentPage]();
    } else {
        // Default initialization for pages without specific initialization
        checkFocusMode();
        initializeFocusModeToggle();
    }
    
    // Get current page name
    function getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop();
    }
    
    // Initialize dashboard functionality
    function initializeDashboard() {
        updateDashboardMetrics();
        
        // Set up interval to periodically save timer state
        setInterval(saveTimerState, 1000);
        
        // Update quick tasks list every 30 seconds
        setInterval(updateQuickTasksList, 30000);
        
        // Check for focus mode preference
        checkFocusMode();
        
        // Ensure focus mode toggle is properly initialized
        initializeFocusModeToggle();
    }
    
    // Initialize task manager functionality
    function initializeTaskManager() {
        setupTaskForm();
        setupTaskFilters();
        renderTaskList();
        
        // Check focus mode preference
        checkFocusMode();
        
        // Ensure focus mode toggle is properly initialized
        initializeFocusModeToggle();
    }
    
    // Initialize statistics functionality
    function initializeStatistics() {
        calculateWeeklyStats();
        renderDailyBreakdown();
        renderSubjectBreakdown();
        renderProductivityInsights();
        
        // Check focus mode preference
        checkFocusMode();
        
        // Ensure focus mode toggle is properly initialized
        initializeFocusModeToggle();
        
        // Setup event listeners for stats page
        document.getElementById('exportBtn')?.addEventListener('click', exportReport);
        document.getElementById('setGoalsBtn')?.addEventListener('click', setGoals);
    }
    
    // Initialize settings functionality
    function initializeSettings() {
        // Initialize focus mode toggle
        initializeFocusModeToggle();
        
        // Load saved settings
        loadSettings();
        
        // Add event listener for save button
        document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    }
    
    // Initialize about functionality
    function initializeAbout() {
        // Initialize focus mode toggle
        initializeFocusModeToggle();
        
        // Add event listener for version info
        document.getElementById('versionInfo')?.addEventListener('click', showVersionDetails);
    }
    
    // DASHBOARD FUNCTIONALITY
    
    function updateDashboardMetrics() {
        const todayStats = calculateDailyStats();
        
        document.getElementById('studyTime').textContent = formatTime(todayStats.totalTime);
        document.getElementById('sessionCountDisplay').textContent = todayStats.sessionCount;
        document.getElementById('tasksCompleted').textContent = todayStats.completedTasks;
        document.getElementById('totalTasks').textContent = todayStats.totalTasks;
        
        const goalProgress = Math.min(100, Math.round((todayStats.totalTime / 360) * 100)); // Assuming 6 hours daily goal
        document.getElementById('goalProgress').textContent = `${goalProgress}%`;
        
        // Update session count
        const sessionCount = document.getElementById('sessionCount');
        if (sessionCount) {
            const currentSession = (todayStats.sessionCount % 4) + 1;
            sessionCount.textContent = currentSession;
        }
    }

    // Function to update the quick tasks list on the dashboard
    function updateQuickTasksList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        // Clear existing list
        taskList.innerHTML = '';
        
        // Get pending tasks
        const pendingTasks = tasks.filter(task => !task.completed);
        
        // Display up to 5 pending tasks
        pendingTasks.slice(0, 5).forEach(task => {
            const li = document.createElement('li');
            li.className = `quick-task ${task.priority}`;
            li.textContent = `${task.title} (${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)})`;
            
            // Add data attribute for task ID
            li.setAttribute('data-task-id', task.id);
            
            // Add click event to remove task from quick list
            li.addEventListener('click', () => {
                // This just removes it from the quick list, not from the task manager
                li.remove();
            });
            
            taskList.appendChild(li);
        });
        
        // Add 'View All' link if there are more than 5 tasks
        if (pendingTasks.length > 5) {
            const li = document.createElement('li');
            li.className = 'view-all';
            li.textContent = `View all ${pendingTasks.length} tasks...`;
            li.addEventListener('click', () => {
                // Navigate to task manager
                window.location.href = 'tasks.html';
            });
            taskList.appendChild(li);
        }
    }
    
    // Calculate daily statistics
    function calculateDailyStats() {
        const today = new Date().toISOString().split('T')[0];
        
        let totalTime = 0;
        let sessionCount = 0;
        let completedTasks = 0;
        let totalTasks = tasks.length;
        
        // Calculate study time from sessions
        studySessions.forEach(session => {
            if (session.date === today && session.completed) {
                totalTime += session.duration;
                sessionCount++;
            }
        });
        
        // Count completed tasks
        tasks.forEach(task => {
            if (task.completed) {
                completedTasks++;
            }
        });
        
        return {
            totalTime,
            sessionCount,
            completedTasks,
            totalTasks
        };
    }
    
    // Format time in minutes to hours:minutes
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
    
    // TASK MANAGER FUNCTIONS
    
    function setupTaskForm() {
        const form = document.getElementById('taskForm');
        const clearBtn = document.getElementById('clearBtn');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                addTask();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                form.reset();
            });
        }
    }
    
    function addTask() {
        const title = document.getElementById('taskInput').value.trim();
        const subject = document.getElementById('subject').value;
        const priority = document.getElementById('priority').value.toLowerCase();
        const dueDate = document.getElementById('dueDate').value;
        let estTime = document.getElementById('estTime').value;
        const timeUnit = document.getElementById('timeUnit').value;
        
        if (!title || !dueDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Convert time to minutes
        estTime = timeUnit === 'hours' ? parseInt(estTime) * 60 : parseInt(estTime);
        
        const newTask = {
            id: Date.now(), // Simple unique ID using timestamp
            title,
            subject,
            priority,
            dueDate,
            estimatedTime: estTime,
            completed: false,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        
        tasks.push(newTask);
        saveTasks();
        document.getElementById('taskForm').reset();
        renderTaskList();
        
        // Update quick tasks list on dashboard
        updateQuickTasksList();
    }
    
    function setupTaskFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', renderTaskList);
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', renderTaskList);
        }
    }
    
    function renderTaskList() {
        const taskList = document.getElementById('pendingTasks');
        if (!taskList) return;
        
        // Get filter values
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        
        // Filter tasks based on selection
        let filteredTasks = tasks.filter(task => !task.completed);
        
        if (priorityFilter !== 'All Priority') {
            const priorityLevel = priorityFilter.toLowerCase().replace(' priority', '');
            filteredTasks = filteredTasks.filter(task => task.priority === priorityLevel);
        }
        
        // Clear existing list
        taskList.innerHTML = '';
        
        // Render tasks
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.priority}`;
            
            li.innerHTML = `
                <strong>● ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}:</strong> ${task.title}
                <div class="task-details">
                    <p>Subject: ${task.subject}</p>
                    <p>Due: ${formatDate(task.dueDate)} (${getDaysRemaining(task.dueDate)} days)</p>
                    <p>Estimated: ${formatTime(task.estimatedTime)}</p>
                </div>
                <div class="task-actions">
                    <button class="complete-btn">Complete</button>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Del</button>
                </div>
            `;
            
            // Add event listeners to task actions
            const completeBtn = li.querySelector('.complete-btn');
            const editBtn = li.querySelector('.edit-btn');
            const deleteBtn = li.querySelector('.delete-btn');
            
            completeBtn.addEventListener('click', () => completeTask(task.id));
            editBtn.addEventListener('click', () => editTask(task.id));
            deleteBtn.addEventListener('click', () => {
                // Call the existing deleteTask function
                deleteTask(task.id);
                
                // Update quick tasks list on dashboard
                updateQuickTasksList();
            });
            
            taskList.appendChild(li);
        });
        
        // Update task counts
        updateTaskCounts();
    }
    
    function completeTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = true;
            saveTasks();
            renderTaskList();
            
            // Update quick tasks list on dashboard
            updateQuickTasksList();
            
            // Create a study session for this task completion
            const sessionId = Date.now();
            studySessions.push({
                id: sessionId,
                subject: task.subject,
                duration: 25, // Default Pomodoro session length
                date: new Date().toISOString().split('T')[0],
                startTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                completed: true,
                taskId: taskId
            });
            saveStudySessions();
            
            // Update dashboard metrics
            updateDashboardMetrics();
            
            // Update stats page if it's loaded
            if (document.getElementById('weeklyTasksCompleted')) {
                calculateWeeklyStats();
                renderSubjectBreakdown();
            }
        }
    }
    
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Fill form with task data
            document.getElementById('taskInput').value = task.title;
            document.getElementById('subject').value = task.subject;
            document.getElementById('priority').value = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            document.getElementById('dueDate').value = task.dueDate;
            
            // Convert time back to original unit
            document.getElementById('estTime').value = Math.max(1, Math.floor(task.estimatedTime / 60));
            document.getElementById('timeUnit').value = 'hours';
            
            // Scroll to top to show form
            window.scrollTo({top: 0, behavior: 'smooth'});
            
            // Remove the task from the list
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTaskList();
            
            // Update quick tasks list on dashboard
            updateQuickTasksList();
        }
    }
    
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTaskList();
            
            // Update quick tasks list on dashboard
            updateQuickTasksList();
        }
    }
    
    function updateTaskCounts() {
        const completedCount = document.getElementById('completedCount');
        const remainingCount = document.getElementById('remainingCount');
        
        if (completedCount) {
            completedCount.textContent = tasks.filter(t => t.completed).length;
        }
        
        if (remainingCount) {
            remainingCount.textContent = tasks.filter(t => !t.completed).length;
        }
    }
    
    // STATISTICS FUNCTIONS
    
    function calculateWeeklyStats() {
        const weeklyStats = {
            totalTime: 0,
            totalSessions: 0,
            completedTasks: 0,
            mostProductiveDay: {day: '', time: 0},
            dailyTotals: {
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            },
            subjectTotals: {
                Mathematics: 0,
                WebDevelopment: 0,
                History: 0,
                Chemistry: 0
            }
        };
        
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1-6 = Monday-Saturday, 7 = Sunday
        
        // Calculate start of week (Monday)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        
        // Calculate study time and sessions
        studySessions.forEach(session => {
            const sessionDate = new Date(session.date);
            if (sessionDate >= startDate && session.completed) {
                weeklyStats.totalTime += session.duration;
                weeklyStats.totalSessions++;
                
                // Add to daily totals
                const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                weeklyStats.dailyTotals[dayName] += session.duration;
                
                // Add to subject totals
                if (session.taskId) {
                    const task = tasks.find(t => t.id === session.taskId);
                    if (task) {
                        weeklyStats.subjectTotals[task.subject] += session.duration;
                    }
                }
            }
        });
        
        // Calculate most productive day
        let maxTime = 0;
        Object.entries(weeklyStats.dailyTotals).forEach(([day, time]) => {
            if (time > maxTime) {
                maxTime = time;
                weeklyStats.mostProductiveDay = {day: day.charAt(0).toUpperCase() + day.slice(1), time};
            }
        });
        
        // Calculate completed tasks this week
        weeklyStats.completedTasks = tasks.filter(task => {
            const completeDate = new Date(task.dateCompleted || task.dateAdded);
            return completeDate >= startDate && task.completed;
        }).length;
        
        // Save to localStorage
        localStorage.setItem('weeklyStats', JSON.stringify(weeklyStats));
        
        return weeklyStats;
    }
    
    function renderDailyBreakdown() {
        const weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || {};
        const dailyTotals = weeklyStats.dailyTotals || {};
        
        document.getElementById('mondayTime').textContent = formatTime(dailyTotals.monday || 0);
        document.getElementById('tuesdayTime').textContent = formatTime(dailyTotals.tuesday || 0);
        document.getElementById('wednesdayTime').textContent = formatTime(dailyTotals.wednesday || 0);
        document.getElementById('thursdayTime').textContent = formatTime(dailyTotals.thursday || 0);
        document.getElementById('fridayTime').textContent = formatTime(dailyTotals.friday || 0);
        document.getElementById('saturdayTime').textContent = formatTime(dailyTotals.saturday || 0);
        document.getElementById('sundayTime').textContent = formatTime(dailyTotals.sunday || 0);
    }
    
    function renderSubjectBreakdown() {
        const weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || {};
        const subjectTotals = weeklyStats.subjectTotals || {};
        const totalTime = Object.values(subjectTotals).reduce((sum, val) => sum + val, 0);
        
        Object.keys(subjectTotals).forEach(subject => {
            const elementId = `${subject.toLowerCase()}Time`;
            const percentElementId = `${subject.toLowerCase()}Percent`;
            
            document.getElementById(elementId).textContent = formatTime(subjectTotals[subject]);
            
            if (totalTime > 0) {
                const percentage = Math.round((subjectTotals[subject] / totalTime) * 100);
                document.getElementById(percentElementId).textContent = percentage;
            }
        });
    }
    
    function renderProductivityInsights() {
        const weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || {};
        const studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        
        // Find best time of day
        const timeSlots = {
            morning: {start: 6, end: 12, total: 0, count: 0},
            afternoon: {start: 12, end: 18, total: 0, count: 0},
            evening: {start: 18, end: 24, total: 0, count: 0},
            night: {start: 0, end: 6, total: 0, count: 0}
        };
        
        studySessions.forEach(session => {
            if (session.completed) {
                const hour = parseInt(session.startTime.split(':')[0]);
                
                Object.values(timeSlots).forEach(slot => {
                    if (hour >= slot.start && hour < slot.end) {
                        slot.total += session.duration;
                        slot.count++;
                    }
                });
            }
        });
        
        let bestTimeSlot = {name: 'Unknown', avg: 0};
        Object.entries(timeSlots).forEach(([name, slot]) => {
            if (slot.count > 0) {
                const avg = slot.total / slot.count;
                if (avg > bestTimeSlot.avg) {
                    bestTimeSlot = {name, avg: Math.round(avg)};
                }
            }
        });
        
        // Format best time name
        let bestTimeName = '';
        if (bestTimeSlot.name === 'morning') bestTimeName = '6AM-12PM';
        else if (bestTimeSlot.name === 'afternoon') bestTimeName = '12PM-6PM';
        else if (bestTimeSlot.name === 'evening') bestTimeName = '6PM-12AM';
        else if (bestTimeSlot.name === 'night') bestTimeName = '12AM-6AM';
        
        document.getElementById('bestTime').textContent = bestTimeName;
        document.getElementById('bestTimeAvg').textContent = bestTimeSlot.avg;
        
        // Calculate longest streak
        const dates = studySessions
            .filter(s => s.completed)
            .map(s => s.date)
            .sort();
        
        let currentStreak = 1;
        let maxStreak = 0;
        
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i-1]);
            const currDate = new Date(dates[i]);
            
            // Calculate difference in days
            const diffTime = currDate.getTime() - prevDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else if (diffDays > 1) {
                currentStreak = 1;
            }
        }
        
        document.getElementById('longestStreak').textContent = maxStreak || 0;
        
        // Week goal progress
        const weeklyGoal = 20 * 60; // 20 hours per week
        const progress = Math.min(100, Math.round((weeklyStats.totalTime / weeklyGoal) * 100));
        document.getElementById('weekGoalProgress').textContent = `${progress}%`;
    }
    
    function exportReport() {
        // This is a simple implementation that displays an alert
        // In a real app, you would generate a downloadable report
        alert('Exporting study report... (This feature would be implemented with PDF generation or data export)');
    }
    
    function setGoals() {
        // This would open a modal or form to set study goals
        alert('Setting study goals... (This feature would be implemented with a goal setting interface)');
    }
    
    // DATA PERSISTENCE
    
    function saveStudySessions() {
        localStorage.setItem('studySessions', JSON.stringify(studySessions));
    }
    
    function loadStudySessions() {
        const saved = localStorage.getItem('studySessions');
        if (saved) {
            try {
                studySessions = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading study sessions:', e);
                studySessions = [];
            }
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            try {
                tasks = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading tasks:', e);
                tasks = [];
            }
        }
    }
    

    function loadSettings() {
        // Load settings from localStorage
    }

    function saveSettings() {
        // Save settings to localStorage
    }
    
    // UTILITY FUNCTIONS
    
    function formatDate(dateString) {
        const options = {month: 'short', day: 'numeric'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function getDaysRemaining(dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
    
});