let timerInterval = null;
let timerState = {
  isRunning: false,
  mode: "work", // "work" or "break"
  sessionTaskId: null,
  plannedSessions: 4,
  session: 1,
  startTimestamp: null, // Epoch ms when started
  elapsedBeforePause: 0, // seconds
  duration: 25 * 60,     // work duration (seconds)
  breakDuration: 5 * 60, // break duration (seconds)
};

function getActiveTask() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  return tasks.find(t => t.id === timerState.sessionTaskId) || null;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getTodaysTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  let today = getTodayString();
  return tasks.filter(t => t.dueDate === today);
}

function updateSessionCountDisplay() {
  let todaysTasks = getTodaysTasks();
  let completed = todaysTasks.filter(t => t.completed).length;
  let total = todaysTasks.length;
  let txt = total
    ? `${completed} of ${total} tasks completed today`
    : `No tasks scheduled for today`;
  if (document.getElementById("sessionCount"))
    document.getElementById("sessionCount").textContent = txt;
}

function getTimeLeft() {
  let total = timerState.mode === "work" ? timerState.duration : timerState.breakDuration;
  let elapsed = timerState.elapsedBeforePause;
  if (timerState.isRunning && timerState.startTimestamp) {
    elapsed += Math.floor((Date.now() - timerState.startTimestamp) / 1000);
  }
  return Math.max(total - elapsed, 0);
}

function updateTimerDisplay() {
  let timeLeft = getTimeLeft();
  let min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  let sec = String(timeLeft % 60).padStart(2, '0');
  if (document.getElementById("timerDisplay"))
    document.getElementById("timerDisplay").textContent = `${min}:${sec}`;
  let task = getActiveTask();
  if (document.getElementById("sessionTask"))
    document.getElementById("sessionTask").textContent = "Study Session: " + (task ? (task.title || "Select a task") : "General");

  // Progress ring
  let total = timerState.mode === "work" ? timerState.duration : timerState.breakDuration;
  let percent = (timeLeft / total) * 100;
  if (document.getElementById("progressRing"))
    document.getElementById("progressRing").style.background =
      `conic-gradient(#2196f3 ${percent}%, #e0e0e0 ${percent}% 100%)`;

  updateSessionCountDisplay();
}

function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.startTimestamp = Date.now();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    updateTimerDisplay();
    let timeLeft = getTimeLeft();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerState.isRunning = false;
      timerState.elapsedBeforePause = 0;
      timerState.startTimestamp = null;
      playSound('complete');
      // Agora SEMPRE salva a sessão ao terminar
      if (timerState.mode === "work") saveStudySession();
      if (timerState.mode === "work") {
        timerState.mode = "break";
        alert("Break Time! 5 minutes.");
      } else {
        timerState.mode = "work";
        timerState.session++;
        if (timerState.session > timerState.plannedSessions) timerState.session = 1;
        alert("Back to study!");
      }
      saveTimerState();
      updateDashboardStats && updateDashboardStats();
      updateTimerDisplay();
      setTimeout(startTimer, 1000); // next cycle
    }
    saveTimerState();
  }, 1000);

  playSound('start');
  saveTimerState();
}

function pauseTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  if (timerState.startTimestamp) {
    timerState.elapsedBeforePause += Math.floor((Date.now() - timerState.startTimestamp) / 1000);
    timerState.startTimestamp = null;
  }
  clearInterval(timerInterval);
  saveTimerState();
  updateTimerDisplay();
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.mode = "work";
  timerState.session = 1;
  timerState.sessionTaskId = null;
  timerState.startTimestamp = null;
  timerState.elapsedBeforePause = 0;
  clearInterval(timerInterval);
  saveTimerState();
  updateTimerDisplay();
}

function playSound(type) {
  try {
    let audio = new Audio(type === "start" ? "sounds/start.mp3" : "sounds/complete.mp3");
    audio.play();
  } catch {}
}

function saveTimerState() {
  localStorage.setItem("timerState", JSON.stringify(timerState));
}
function loadTimerState() {
  let data = localStorage.getItem("timerState");
  if (data) {
    Object.assign(timerState, JSON.parse(data));
    updateTimerDisplay();
    if (timerState.isRunning) {
      clearInterval(timerInterval);
      timerState.startTimestamp = Date.now();
      startTimer();
    }
  }
}

// Salva sessão vinculada à tarefa ou como "General" se não tiver selecionado
function saveStudySession() {
  let sessions = JSON.parse(localStorage.getItem("studySessions") || "[]");
  let now = new Date();
  let task = getActiveTask();
  sessions.push({
    subject: task ? (task.subject || task.title || "General") : "General",
    duration: timerState.duration / 60,
    date: now.toISOString().split("T")[0],
    startTime: now.toTimeString().split(" ")[0],
    completed: true,
    taskId: task ? (task.id || null) : null
  });
  localStorage.setItem("studySessions", JSON.stringify(sessions));
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("timerDisplay")) {
    loadTimerState();
    updateTimerDisplay();
    document.getElementById("startBtn").onclick = () => { startTimer(); };
    document.getElementById("pauseBtn").onclick = () => { pauseTimer(); };
    document.getElementById("stopBtn").onclick = () => { stopTimer(); };

    // Dropdown para seleção da tarefa
    renderTaskSelectForSession();

    document.addEventListener("visibilitychange", () => {
      saveTimerState();
      if (document.hidden && timerState.isRunning) {
        pauseTimer();
      }
    });
    window.addEventListener("beforeunload", saveTimerState);
  }
});

function renderTaskSelectForSession() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]").filter(t => !t.completed);
  let parent = document.getElementById("sessionTask")?.parentNode;
  if (!parent) return;
  let select = document.createElement("select");
  select.id = "sessionTaskSelect";
  select.style.marginBottom = "7px";
  select.innerHTML = `<option value="">-- Select a task --</option>` +
    tasks.map(t => `<option value="${t.id}" ${t.id == timerState.sessionTaskId ? "selected" : ""}>${t.title} (${t.subject})</option>`).join("");
  select.onchange = (e) => {
    timerState.sessionTaskId = Number(e.target.value) || null;
    saveTimerState();
    updateTimerDisplay();
  };
  if (!document.getElementById("sessionTaskSelect")) {
    parent.insertBefore(select, document.getElementById("sessionTask"));
  }
}
