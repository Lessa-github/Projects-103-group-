(function () {
  // Só adiciona se ainda não tiver tasks nem sessions salvos
  const existingTasks = localStorage.getItem("tasks");
  const existingSessions = localStorage.getItem("studySessions");
  if (!existingTasks || JSON.parse(existingTasks).length === 0) {
    localStorage.setItem("tasks", JSON.stringify([
      {
        id: 1, title: "Review Math Notes", subject: "Math", priority: "high",
        dueDate: "2025-08-02", estimatedTime: 40, completed: true, dateAdded: "2025-08-01"
      },
      {
        id: 2, title: "Read English Article", subject: "English", priority: "medium",
        dueDate: "2025-08-03", estimatedTime: 20, completed: false, dateAdded: "2025-08-01"
      },
      {
        id: 3, title: "Chemistry Quiz Prep", subject: "Chemistry", priority: "low",
        dueDate: "2025-08-04", estimatedTime: 30, completed: false, dateAdded: "2025-08-01"
      }
    ]));
  }

  if (!existingSessions || JSON.parse(existingSessions).length === 0) {
    localStorage.setItem("studySessions", JSON.stringify([
      {
        subject: "Math", duration: 50, date: "2025-08-01", startTime: "10:00:00", completed: true, taskId: 1
      },
      {
        subject: "English", duration: 25, date: "2025-08-01", startTime: "14:00:00", completed: true, taskId: 2
      },
      {
        subject: "Chemistry", duration: 30, date: "2025-08-02", startTime: "09:30:00", completed: true, taskId: 3
      },
      {
        subject: "General", duration: 45, date: "2025-08-02", startTime: "17:00:00", completed: true, taskId: null
      }
    ]));
  }
})();
