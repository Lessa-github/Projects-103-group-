// sample-data.js
// Sample data for testing the study timer app

// Study session data
const sampleStudySessions = [
    {
        id: 1,
        subject: "Mathematics",
        duration: 25, // minutes
        date: "2024-03-20",
        startTime: "14:00",
        completed: true,
        taskId: 1
    },
    {
        id: 2,
        subject: "Web Development",
        duration: 25,
        date: "2024-03-20",
        startTime: "15:00",
        completed: true,
        taskId: 2
    },
    {
        id: 3,
        subject: "History",
        duration: 25,
        date: "2024-03-21",
        startTime: "10:00",
        completed: true,
        taskId: 3
    }
];

// Task data
const sampleTasks = [
    {
        id: 1,
        title: "Finish calculus assignment",
        subject: "Mathematics",
        priority: "high", // high, medium, low
        dueDate: "2024-03-22",
        estimatedTime: 180, // minutes
        completed: true,
        dateAdded: "2024-03-20"
    },
    {
        id: 2,
        title: "Read history chapter 8",
        subject: "History",
        priority: "medium",
        dueDate: "2024-03-24",
        estimatedTime: 90, // minutes
        completed: true,
        dateAdded: "2024-03-20"
    },
    {
        id: 3,
        title: "Complete coding project",
        subject: "Web Development",
        priority: "low",
        dueDate: "2024-03-25",
        estimatedTime: 120, // minutes
        completed: true,
        dateAdded: "2024-03-21"
    },
    {
        id: 4,
        title: "Review notes for quiz",
        subject: "Chemistry",
        priority: "high",
        dueDate: "2024-03-23",
        estimatedTime: 60, // minutes
        completed: false,
        dateAdded: "2024-03-21"
    }
];

// Save sample data to localStorage
function loadSampleData() {
    // Only load sample data if no existing data is present
    if (!localStorage.getItem('studySessions')) {
        localStorage.setItem('studySessions', JSON.stringify(sampleStudySessions));
    }
    
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(sampleTasks));
    }
}

// Call loadSampleData() when the page loads
window.addEventListener('load', loadSampleData);