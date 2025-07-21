// timer.js
// Pomodoro Timer Logic

document.addEventListener('DOMContentLoaded', function() {
    // Timer variables
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Timer state
    let timerState = {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        currentSession: null,
        totalSeconds: 1500, // 25 minutes
        breakMinutes: 5,
        breakSeconds: 0
    };
    
    // Load saved timer state from localStorage if available
    loadTimerState();
    
    // Update display with current timer state
    updateDisplay();
    
    // Event listeners for timer buttons
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Start the timer
    function startTimer() {
        if (!timerState.isRunning) {
            timerState.isRunning = true;
            updateDisplay();
            
            // Save timer state every second
            setInterval(saveTimerState, 1000);
            
            // Update timer every second
            setInterval(() => {
                if (timerState.isRunning && timerState.totalSeconds > 0) {
                    timerState.totalSeconds--;
                    updateDisplay();
                    
                    // Check if session is complete
                    if (timerState.totalSeconds === 0) {
                        completeSession();
                    }
                }
            }, 1000);
        }
    }
    
    // Pause the timer
    function pauseTimer() {
        timerState.isRunning = false;
        updateDisplay();
    }
    
    // Stop the timer and reset to 25 minutes
    function stopTimer() {
        timerState.minutes = 25;
        timerState.seconds = 0;
        timerState.totalSeconds = 1500;
        timerState.isRunning = false;
        updateDisplay();
        saveTimerState();
    }
    
    // Reset the timer to 25 minutes without stopping it
    function resetTimer() {
        timerState.minutes = 25;
        timerState.seconds = 0;
        timerState.totalSeconds = 1500;
        timerState.isRunning = false; // Keep the timer paused after reset
        updateDisplay();
        saveTimerState();
    }
    
    // Update the timer display
    function updateDisplay() {
        timerState.minutes = Math.floor(timerState.totalSeconds / 60);
        timerState.seconds = timerState.totalSeconds % 60;
        
        const displayTime = `${timerState.minutes.toString().padStart(2, '0')}:${timerState.seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = displayTime;
    }
    
    // Complete a study session
    function completeSession() {
        timerState.isRunning = false;
        updateDisplay();
        
        // TODO: Implement session completion handling
        console.log('Study session completed');
        
        // You could add a notification here
        // or switch to break mode
    }
    
    // Save timer state to localStorage
    function saveTimerState() {
        localStorage.setItem('timerState', JSON.stringify(timerState));
    }
    
    // Load timer state from localStorage
    function loadTimerState() {
        const saved = localStorage.getItem('timerState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                timerState.minutes = parsed.minutes;
                timerState.seconds = parsed.seconds;
                timerState.totalSeconds = parsed.totalSeconds;
                timerState.isRunning = parsed.isRunning;
                timerState.currentSession = parsed.currentSession;
                
                // If the timer was running when saved, continue running
                if (timerState.isRunning) {
                    timerState.isRunning = false;
                    // Don't keep running state after refresh to avoid confusion
                }
            } catch (e) {
                console.error('Error loading timer state:', e);
                // Reset timer state if there's an error loading
                timerState.totalSeconds = 1500;
            }
        }
    }
});