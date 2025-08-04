function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function renderQuickTasks() {
  if (!document.getElementById("quickTaskList")) return;
  let tasks = getTasks();
  let quickList = document.getElementById("quickTaskList");
  quickList.innerHTML = "";
  tasks.slice(0, 5).forEach(task => {
    quickList.innerHTML += `<li class="${task.priority}">${task.completed ? "✅" : "☐"} ${task.title} (${task.priority[0].toUpperCase() + task.priority.slice(1)})</li>`;
  });
}

function renderTasksPage() {
  if (!document.getElementById("pendingTasks")) return;
  let tasks = getTasks();
  let filter = (document.getElementById("filterPriority") || {}).value || "all";
  let search = (document.getElementById("searchTask") || {}).value || "";
  let pendingDiv = document.getElementById("pendingTasks");
  let completedDiv = document.getElementById("completedTasks");
  pendingDiv.innerHTML = "";
  completedDiv.innerHTML = "";
  tasks.forEach(task => {
    let matchesFilter = (filter === "all" || task.priority === filter);
    let matchesSearch = (!search || task.title.toLowerCase().includes(search.toLowerCase()) || task.subject.toLowerCase().includes(search.toLowerCase()));
    if (matchesFilter && matchesSearch) {
      let card = `<div class="task-card ${task.priority}">
        <strong>${task.priority.toUpperCase()}: ${task.title}</strong><br>
        <span>Subject: ${task.subject}</span><br>
        <span>Due: ${task.dueDate}</span><br>
        <span>Estimated: ${task.estimatedTime} min</span>
        <div class="task-actions">
          <button class="complete" onclick="completeTask(${task.id})">✅ Complete</button>
          <button class="edit" onclick="editTask(${task.id})">📝 Edit</button>
          <button class="delete" onclick="deleteTask(${task.id})">🗑 Del</button>
        </div>
      </div>`;
      if (!task.completed) pendingDiv.innerHTML += card;
      else completedDiv.innerHTML += card;
    }
  });
}

function completeTask(id) {
  let tasks = getTasks();
  let idx = tasks.findIndex(t => t.id === id);
  if (idx > -1) {
    tasks[idx].completed = true;
    saveTasks(tasks);
    renderTasksPage();
    renderQuickTasks();
    updateDashboardStats();
  }
}
function deleteTask(id) {
  let tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasksPage();
  renderQuickTasks();
  updateDashboardStats();
}
function editTask(id) {
  let tasks = getTasks();
  let t = tasks.find(t => t.id === id);
  if (t) {
    document.getElementById("taskTitle").value = t.title;
    document.getElementById("taskSubject").value = t.subject;
    document.getElementById("taskPriority").value = t.priority;
    document.getElementById("taskDueDate").value = t.dueDate;
    document.getElementById("taskEstTime").value = t.estimatedTime;
    deleteTask(id);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("taskForm")) {
    document.getElementById("taskForm").onsubmit = function (e) {
      e.preventDefault();
      let tasks = getTasks();
      let id = Date.now();
      let title = document.getElementById("taskTitle").value;
      let subject = document.getElementById("taskSubject").value;
      let priority = document.getElementById("taskPriority").value;
      let dueDate = document.getElementById("taskDueDate").value;
      let estimatedTime = document.getElementById("taskEstTime").value;
      tasks.push({
        id, title, subject, priority, dueDate,
        estimatedTime, completed: false,
        dateAdded: new Date().toISOString().split("T")[0]
      });
      saveTasks(tasks);
      this.reset();
      renderTasksPage();
      renderQuickTasks();
      updateDashboardStats();
    };
    document.getElementById("clearBtn").onclick = function () {
      document.getElementById("taskForm").reset();
    };
    renderTasksPage();
  }
  renderQuickTasks();

  if (document.getElementById("filterPriority")) {
    document.getElementById("filterPriority").onchange = renderTasksPage;
    document.getElementById("searchTask").oninput = renderTasksPage;
  }


  updateDashboardStats();
  renderStatsPage();
});

function updateDashboardStats() {
  let sessions = JSON.parse(localStorage.getItem("studySessions") || "[]");
  let today = new Date().toISOString().split('T')[0];
  let todays = sessions.filter(s => s.date === today);
  let totalMin = todays.reduce((acc, cur) => acc + cur.duration, 0);
  let studyTimeStr = `${Math.floor(totalMin / 60)}h ${String(totalMin % 60).padStart(2, '0')}m`;
  let sessionCount = todays.length;

  let tasks = getTasks();
  let completedToday = tasks.filter(t => t.completed && t.dateAdded === today).length;
  let totalTasks = tasks.length;

  if (document.getElementById("todayTime")) document.getElementById("todayTime").textContent = `Study Time: ${studyTimeStr}`;
  if (document.getElementById("todaySessions")) document.getElementById("todaySessions").textContent = `Sessions: ${sessionCount}`;
  if (document.getElementById("tasksCompleted")) document.getElementById("tasksCompleted").textContent = `Task Completed: ${completedToday}/${totalTasks}`;
  if (document.getElementById("progressFill")) {
    let percent = totalTasks ? (completedToday / totalTasks * 100) : 0;
    document.getElementById("progressFill").style.width = percent + "%";
    if (document.getElementById("progressPercent")) document.getElementById("progressPercent").textContent = `${Math.round(percent)}% daily goal`;
  }
}

function renderStatsPage() {
  if (!document.getElementById("weekStats")) return;
  let sessions = JSON.parse(localStorage.getItem("studySessions") || "[]");
  let tasks = getTasks();

  let week = [];
  let today = new Date();
  for (let i = 6; i >= 0; i--) {
    let d = new Date(today);
    d.setDate(d.getDate() - i);
    let iso = d.toISOString().split('T')[0];
    week.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), date: iso });
  }
  let weekStats = week.map(day => {
    let daily = sessions.filter(s => s.date === day.date);
    let mins = daily.reduce((acc, cur) => acc + cur.duration, 0);
    return `<div>${day.label} <span style="background:#2196f3;width:${mins * 2}px;display:inline-block;height:15px;border-radius:4px;margin-left:5px;"></span> ${Math.floor(mins / 60)}h ${mins % 60}m</div>`;
  }).join('');
  document.getElementById("weekStats").innerHTML = weekStats;

  document.getElementById("dailyBreakdown").innerHTML = weekStats;

  let bySubject = {};
  sessions.forEach(s => {
    if (!bySubject[s.subject]) bySubject[s.subject] = 0;
    bySubject[s.subject] += s.duration;
  });
  let totalSubjectMin = Object.values(bySubject).reduce((a, b) => a + b, 0);
  let subjStats = Object.entries(bySubject).map(([subject, min]) =>
    `<div>${subject}: ${Math.floor(min / 60)}h ${min % 60}m (${Math.round((min / totalSubjectMin) * 100)}%)</div>`
  ).join('');
  document.getElementById("subjectBreakdown").innerHTML = subjStats;

  let streak = 0, maxStreak = 0, prev = false;
  week.forEach(day => {
    let didStudy = sessions.some(s => s.date === day.date);
    if (didStudy) streak++; else streak = 0;
    if (streak > maxStreak) maxStreak = streak;
  });
  let avgSession = sessions.length ? (sessions.reduce((a, b) => a + b.duration, 0) / sessions.length) : 0;
  document.getElementById("insights").innerHTML = `
    • Average Session: ${Math.round(avgSession)} min<br>
    • Longest streak: ${maxStreak} days<br>
    • Week goal progress: ${(sessions.length / 12 * 100).toFixed(0)}% complete<br>
    • Most productive: ${getMostProductiveDay(sessions)}
  `;
}

function getMostProductiveDay(sessions) {
  let byDay = {};
  sessions.forEach(s => {
    byDay[s.date] = (byDay[s.date] || 0) + s.duration;
  });
  let max = 0, bestDay = "";
  Object.entries(byDay).forEach(([date, min]) => {
    if (min > max) {
      max = min;
      bestDay = date;
    }
  });
  return bestDay ? `${bestDay} (${Math.floor(max / 60)}h ${max % 60}m)` : "-";
}
