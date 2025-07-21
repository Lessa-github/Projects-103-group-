# Study Timer & Productivity App

A powerful study productivity website that helps students focus with timers, track study sessions, and manage tasks. Perfect for boosting academic productivity!

## Features

### Pomodoro Timer
- 25-minute work sessions with 5-minute breaks
- Start, pause, and stop functionality
- Visual progress indicator
- Persistent timer state using localStorage
- Sound notifications (optional)

### Task Management
- Add tasks with priority and due dates
- Mark tasks complete
- Filter by priority and subject
- Edit or delete existing tasks

### Study Tracking
- Track study sessions and time
- Daily and weekly statistics
- Subject-based time tracking

### Simple Analytics
- Total study time display
- Tasks completed counter
- Basic progress visualization
- Productivity insights

## Technologies Used

- HTML5
- CSS3
- JavaScript
- LocalStorage for data persistence
- Sample data for testing and demonstration
- Basic sound support for notifications

## File Structure

```
study-app/
    index.html                # Study Dashboard with timer
    tasks.html                # Task management interface
    stats.html                # Study statistics and analytics
    css/
        style.css             # Main styling
        focus-theme.css       # Distraction-free design theme
    js/
        script.js             # Main application logic
        timer.js              # Timer functionality
    sounds/                   # Placeholder for sound notifications
    README.md                 # Project documentation
```

## Getting Started

1. Clone the repository:
```bash
   git clone https://github.com/sbzsilva/study-timer.git
```

2. Open the project directory:
```bash
   cd study-timer
```

3. Simply open `index.html` in your browser to start using the app:
```bash
   double-click index.html
```

## Using the Application with Sample Data

The app includes sample data that automatically loads when you first open it. This data demonstrates:
- How study sessions are tracked
- Different task priorities and subjects
- Completed and pending tasks
- Study statistics examples

To reset to the sample data at any time:
1. Clear your browser's localStorage:
   - In Chrome: Settings > Privacy and Security > Clear browsing data > Cookies and site data > Clear
2. Reload the page
3. The sample data will be reloaded automatically

## Usage Instructions

### Study Dashboard (index.html)
- Use the **Start!** button to begin a 25-minute study session
- Click **Pause!** to temporarily stop the timer
- Press **Stop!** to reset the timer
- View your daily progress metrics below the timer
- Manage quick tasks listed on the dashboard
- Navigate to other pages using the links at the bottom

### Task Manager (tasks.html)
- **Add New Task** by filling out the form:
  - Enter task description
  - Select subject and priority level
  - Set due date and estimated time
  - Click **Add Task** to save
- Use **Clear** to reset the form
- Apply filters to view specific tasks by status or priority
- Complete tasks by clicking **Complete**
- Edit tasks by clicking **Edit** (will pre-fill the form)
- Delete tasks by clicking **Del**

### Study Statistics (stats.html)
- View **This Week's Progress** including total study time and tasks completed
- Check **Daily Breakdown** to see study time distribution throughout the week
- Review **Subject Breakdown** to understand where you're spending your study time
- Explore **Productivity Insights** to optimize your study habits
- Use **Export Report** to generate a study report (feature placeholder)
- Click **Set Goals** to define your study objectives (feature placeholder)

## Settings Page

The app includes a settings page that allows users to:
- Customize timer duration (work and break times)
- Select sound notifications
- Set daily study goals
- Choose target subjects
- Customize the appearance (color scheme and font preference)

To access the settings page, click on the "[Settings]" link in the navigation menu.

## Contributing

Contributions are welcome! Please feel free to:
- Suggest new productivity features
- Improve the design and user experience
- Add additional statistics visualizations
- Implement sound notifications
- Enhance data persistence and export capabilities

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.