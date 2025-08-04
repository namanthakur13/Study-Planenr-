// start at the login page if not logged in
if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname.includes("tasks.html")
) {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
}

// Signup function
function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (email && password) {
    localStorage.setItem("user", JSON.stringify({ email, password }));
    localStorage.setItem("loggedIn", "true");
    alert("Signup successful! You are now logged in.");
    window.location.href = "index.html";
  } else {
    alert("Please fill in all fields.");
  }
}

// Login function
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (savedUser && email === savedUser.email && password === savedUser.password) {
    alert("Login successful!");
    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html";
  } else {
    alert("Incorrect email or password.");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// Stopwatch logic
let startTime;
let timerInterval;

function startTimer() {
  if (timerInterval) return; // Prevent multiple timers
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    document.getElementById("stopwatch").textContent = formatTime(elapsed);
  }, 1000);
}

function stopTimer() {
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = null;
  const elapsed = Date.now() - startTime;
  saveStudyTime(Math.floor(elapsed / 1000));
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  document.getElementById("stopwatch").textContent = "00:00:00";
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return (
    (hrs < 10 ? "0" + hrs : hrs) +
    ":" +
    (mins < 10 ? "0" + mins : mins) +
    ":" +
    (secs < 10 ? "0" + secs : secs)
  );
}

function formatSecondsToHMS(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return (
    (hrs < 10 ? "0" + hrs : hrs) +
    ":" +
    (mins < 10 ? "0" + mins : mins) +
    ":" +
    (secs < 10 ? "0" + secs : secs)
  );
}

function saveStudyTime(seconds) {
  const history = JSON.parse(localStorage.getItem("studyHistory")) || [];
  const timestamp = new Date().toLocaleString();
  history.push({ time: seconds, date: timestamp }); // store as number now
  localStorage.setItem("studyHistory", JSON.stringify(history));
  displayStudyHistory();
  updateStats();
}

function displayStudyHistory() {
  const history = JSON.parse(localStorage.getItem("studyHistory")) || [];
  const list = document.getElementById("historyList");
  if (list) {
    list.innerHTML = "";
    history.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${formatSecondsToHMS(entry.time)} on ${entry.date}`;
      list.appendChild(li);
    });
  }
}

// Update dashboard stats
function updateStats() {
  // Calculate pending tasks by summing all tasks in all subjects
  const subjects = JSON.parse(localStorage.getItem("kanbanSubjects")) || [];
  let totalTasks = 0;
  subjects.forEach(subject => {
    totalTasks += subject.tasks.length;
  });
  const pendingTasksElem = document.getElementById("pendingTasks");
  if (pendingTasksElem) {
    pendingTasksElem.textContent = totalTasks;
  }

  // Calculate total hours studied with hours and minutes format
  const history = JSON.parse(localStorage.getItem("studyHistory")) || [];
  const totalSeconds = history.reduce((acc, entry) => {
    // Make sure to parse the seconds safely as number
    const secs = parseInt(entry.time, 10);
    return acc + (isNaN(secs) ? 0 : secs);
  }, 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  // Format minutes always as two digits for display
  const totalHoursFormatted = `${hours}.${minutes < 10 ? "0" + minutes : minutes}`;
  const totalHoursElem = document.getElementById("totalHours");
  if (totalHoursElem) {
    totalHoursElem.textContent = totalHoursFormatted + " hrs";
  }

  // Calculate average daily study time (past 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSeconds = history.reduce((acc, entry) => {
    const entryDate = new Date(entry.date);
    if (entryDate.getTime() >= oneWeekAgo) {
      return acc + (entry.time || 0);
    }
    return acc;
  }, 0);
  const avgMinsPerDay = (recentSeconds / 60 / 7).toFixed(1);
  const avgTimeElem = document.getElementById("avgTime");
  if (avgTimeElem) {
    avgTimeElem.textContent = avgMinsPerDay + " mins/day";
  }
}

// Call display functions as soon as the page loads
window.onload = function () {
  renderSubjects();
  displayStudyHistory();
  updateStats();
};

// Task plananer has Kabanan logic 

const subjectsKey = "kanbanSubjects";

function getSubjects() {
  return JSON.parse(localStorage.getItem(subjectsKey)) || [];
}

function saveSubjects(subjects) {
  localStorage.setItem(subjectsKey, JSON.stringify(subjects));
}

function renderSubjects() {
  const container = document.getElementById("subjectsContainer");
  if (!container) return;
  container.innerHTML = "";
  const subjects = getSubjects();

  subjects.forEach((subject, subjectIndex) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card";

    const header = document.createElement("div");
    header.className = "subject-header";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = subject.name;

    const collapseIcon = document.createElement("span");
    collapseIcon.className = "collapse-icon";
    collapseIcon.textContent = "▼";

    header.onclick = () => {
      if (taskList.style.display === "none") {
        taskList.style.display = "block";
        collapseIcon.textContent = "▼";
      } else {
        taskList.style.display = "none";
        collapseIcon.textContent = "▶";
      }
    };

    header.appendChild(titleSpan);
    header.appendChild(collapseIcon);

    const subjectMenu = document.createElement("div");
    subjectMenu.className = "three-dot-menu";
    subjectMenu.textContent = "⋮";
    subjectMenu.title = "Options";

    const subjectDropdown = document.createElement("div");
    subjectDropdown.className = "dropdown";

    const deleteSubject = document.createElement("div");
    deleteSubject.textContent = "Delete Subject";
    deleteSubject.onclick = (e) => {
      e.stopPropagation();
      if (
        confirm(`Delete subject "${subject.name}"? This will remove all its tasks.`)
      ) {
        subjects.splice(subjectIndex, 1);
        saveSubjects(subjects);
        renderSubjects();
        updateStats(); // update the dashboard stats 
      }
    };
    subjectDropdown.appendChild(deleteSubject);

    subjectMenu.appendChild(subjectDropdown);

    subjectMenu.onclick = (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      subjectMenu.classList.toggle("open");
    };

    header.appendChild(subjectMenu);

    subjectCard.appendChild(header);

    const taskList = document.createElement("div");
    taskList.className = "task-list";

    subject.tasks.forEach((task, taskIndex) => {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";

      const taskText = document.createElement("span");
      taskText.textContent = task;

      const taskMenu = document.createElement("div");
      taskMenu.className = "three-dot-menu";
      taskMenu.textContent = "⋮";
      taskMenu.title = "Options";

      const taskDropdown = document.createElement("div");
      taskDropdown.className = "dropdown";

      const deleteTask = document.createElement("div");
      deleteTask.textContent = "Delete Task";
      deleteTask.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete task "${task}"?`)) {
          subject.tasks.splice(taskIndex, 1);
          saveSubjects(subjects);
          renderSubjects();
          updateStats();
        }
      };
      taskDropdown.appendChild(deleteTask);

      taskMenu.appendChild(taskDropdown);

      taskMenu.onclick = (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        taskMenu.classList.toggle("open");
      };

      taskItem.appendChild(taskText);
      taskItem.appendChild(taskMenu);

      taskList.appendChild(taskItem);
    });

    subjectCard.appendChild(taskList);

    const addTaskContainer = document.createElement("div");
    addTaskContainer.className = "add-task-container";

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "Add new task...";
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addTask(subjectIndex, taskInput);
      }
    });

    const addTaskBtn = document.createElement("button");
    addTaskBtn.textContent = "+";
    addTaskBtn.title = "Add Task";
    addTaskBtn.onclick = () => addTask(subjectIndex, taskInput);

    addTaskContainer.appendChild(taskInput);
    addTaskContainer.appendChild(addTaskBtn);

    subjectCard.appendChild(addTaskContainer);

    container.appendChild(subjectCard);
  });
}

function addTask(subjectIndex, inputElem) {
  const val = inputElem.value.trim();
  if (!val) return alert("Please enter a task name.");
  const subjects = getSubjects();
  subjects[subjectIndex].tasks.push(val);
  saveSubjects(subjects);
  inputElem.value = "";
  renderSubjects();
  updateStats();
}

function addSubject() {
  const input = document.getElementById("newSubjectInput");
  const val = input.value.trim();
  if (!val) return alert("Please enter a subject name.");
  const subjects = getSubjects();
  if (subjects.some(s => s.name.toLowerCase() === val.toLowerCase())) {
    return alert("Subject already exists.");
  }
  subjects.push({ name: val, tasks: [] });
  saveSubjects(subjects);
  input.value = "";
  renderSubjects();
  updateStats();
}

function closeAllDropdowns() {
  document.querySelectorAll(".three-dot-menu.open").forEach(menu => {
    menu.classList.remove("open");
  });
}

window.addEventListener("click", () => {
  closeAllDropdowns();
});

