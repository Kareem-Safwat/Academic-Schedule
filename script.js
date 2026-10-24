/**
 * Academic Schedule Script
 */

const INITIAL_SCHEDULE = [
  { id: "1", code: "CS111", title: "Fundamentals of Computers", type: "Lecture", day: "Sunday", startTime: "08:30", endTime: "11:30", location: "H2-3", instructor: "Dr. Manar el Kady", group: "Sec: 1", customColor: "" },
  { id: "2", code: "MA112", title: "Discrete Mathematics", type: "Lecture", day: "Sunday", startTime: "11:30", endTime: "14:30", location: "H2-3", instructor: "Dr. Mai, Dr. Shourouk", group: "Sec: 1", customColor: "" },
  
  { id: "3", code: "HU111", title: "Technical Report Writing", type: "Lecture", day: "Monday", startTime: "08:30", endTime: "10:00", location: "H2-1", instructor: "Prof. Ihab El Khodary", group: "Sec: 1", customColor: "" },
  { id: "4", code: "HU112", title: "Ethics and Professionalism", type: "Lecture", day: "Monday", startTime: "16:00", endTime: "17:30", location: "H2-1", instructor: "Prof. Haitham S. Hamza", group: "Sec: 1", customColor: "" },

  { id: "5", code: "IT111", title: "Electronics-1", type: "Tutorial", day: "Tuesday", startTime: "08:30", endTime: "10:00", location: "H2-8", instructor: "Eng.", group: "Sec: 1A", customColor: "" },
  { id: "6", code: "CS111", title: "Fundamentals of Computers", type: "Tutorial", day: "Tuesday", startTime: "10:00", endTime: "11:30", location: "B0-21", instructor: "Eng.", group: "Sec: 1F", customColor: "" },

  { id: "7", code: "IT111", title: "Electronics-1", type: "Lecture", day: "Wednesday", startTime: "11:30", endTime: "14:30", location: "H1-2", instructor: "Dr. Mona, Dr. Ibrahim", group: "Sec: 1", customColor: "" },
  { id: "8", code: "HU225", title: "Entrepreneurship", type: "Lecture", day: "Wednesday", startTime: "17:30", endTime: "19:00", location: "Online", instructor: "Dr. Hayam", group: "Sec: 1", customColor: "" },

  { id: "9", code: "MA111", title: "Math-1", type: "Lecture", day: "Thursday", startTime: "08:30", endTime: "11:30", location: "H1-3", instructor: "Dr. Hala Fayez", group: "Sec: 1", customColor: "" },
  { id: "10", code: "MA112", title: "Discrete Mathematics", type: "Tutorial", day: "Thursday", startTime: "11:30", endTime: "13:00", location: "H2-7", instructor: "Eng.", group: "Sec: 1C", customColor: "" },
  { id: "11", code: "MA111", title: "Math-1", type: "Tutorial", day: "Thursday", startTime: "14:30", endTime: "16:00", location: "H2-7", instructor: "Eng.", group: "Sec: 1D", customColor: "" }
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const TIME_SLOTS = [
  { label: "08:30 - 10:00", startMinutes: 510, endMinutes: 600 },
  { label: "10:00 - 11:30", startMinutes: 600, endMinutes: 690 },
  { label: "11:30 - 01:00", startMinutes: 690, endMinutes: 780 },
  { label: "01:00 - 02:30", startMinutes: 780, endMinutes: 870 },
  { label: "02:30 - 04:00", startMinutes: 870, endMinutes: 960 },
  { label: "04:00 - 05:30", startMinutes: 960, endMinutes: 1050 },
  { label: "05:30 - 07:00", startMinutes: 1050, endMinutes: 1140 }
];

let schedule = [];
let activeView = "cards";
let activeTypeFilter = "all";
let searchQuery = "";

const viewport = document.getElementById("schedule-viewport");
const searchInput = document.getElementById("search-input");
const themeToggleBtn = document.getElementById("theme-toggle");
const modal = document.getElementById("modal");
const classForm = document.getElementById("class-form");
const addClassBtn = document.getElementById("add-class-btn");
const modalCloseBtn = document.getElementById("modal-close");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const resetBtn = document.getElementById("reset-btn");

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadData();
  bindEvents();
  render();
});

function initTheme() {
  if (localStorage.getItem("app_theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("app_theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

function loadData() {
  const saved = localStorage.getItem("academic_schedule_v6");
  schedule = saved ? JSON.parse(saved) : [...INITIAL_SCHEDULE];
}

function saveData() {
  localStorage.setItem("academic_schedule_v6", JSON.stringify(schedule));
  render();
}

function bindEvents() {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      e.target.classList.add("active");
      activeTypeFilter = e.target.dataset.type;
      render();
    });
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");
      activeView = target.dataset.view;
      render();
    });
  });

  addClassBtn.addEventListener("click", () => openModal());
  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);
  classForm.addEventListener("submit", handleFormSubmit);

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.json";
    a.click();
  });

  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        schedule = JSON.parse(event.target.result);
        saveData();
      } catch (err) {
        alert("Invalid schedule JSON file.");
      }
    };
    reader.readAsText(file);
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset schedule back to default timetable?")) {
      schedule = [...INITIAL_SCHEDULE];
      saveData();
    }
  });
}

function parseMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getCourseTheme(code) {
  const upper = code.toUpperCase();
  if (upper.startsWith("CS")) return "theme-cs";
  if (upper.startsWith("MA")) return "theme-ma";
  if (upper.startsWith("HU")) return "theme-hu";
  if (upper.startsWith("IT")) return "theme-it";
  return "theme-red";
}

function formatTime12(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function updateStats() {
  document.getElementById("stat-total").textContent = schedule.length;
  document.getElementById("stat-lectures").textContent = schedule.filter((i) => i.type === "Lecture").length;
  document.getElementById("stat-tutorials").textContent = schedule.filter((i) => i.type === "Tutorial").length;
  document.getElementById("stat-online").textContent = schedule.filter((i) => i.location.toLowerCase().includes("online")).length;
}

function getFilteredSchedule() {
  return schedule.filter((item) => {
    const matchesType = activeTypeFilter === "all" || item.type === activeTypeFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery) ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.location.toLowerCase().includes(searchQuery) ||
      item.instructor.toLowerCase().includes(searchQuery);
    return matchesType && matchesSearch;
  });
}

function render() {
  updateStats();
  const filtered = getFilteredSchedule();

  if (activeView === "cards") {
    renderCardsView(filtered);
  } else {
    renderGridView(filtered);
  }
}

function renderCardsView(items) {
  viewport.className = "schedule-viewport cards-layout";
  viewport.innerHTML = "";

  DAYS.forEach((day) => {
    const dayItems = items
      .filter((i) => i.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const dayCol = document.createElement("div");
    dayCol.className = "day-column";

    dayCol.innerHTML = `
      <div class="day-header">
        <span class="day-title">${day}</span>
        <span class="day-badge">${dayItems.length}</span>
      </div>
    `;

    dayItems.forEach((item) => {
      const themeClass = getCourseTheme(item.code);
      const isOnline = item.location.toLowerCase().includes("online");

      const card = document.createElement("div");
      card.className = `class-card ${themeClass}`;
      
      if (item.customColor) {
        card.style.backgroundColor = `${item.customColor}1a`;
        card.style.borderColor = item.customColor;
      }

      card.innerHTML = `
        <div>
          <div class="card-header-row">
            <span class="badge-code" ${item.customColor ? `style="background:${item.customColor}; color:#fff;"` : ""}>${item.code}</span>
            <span class="badge-type" ${item.customColor ? `style="color:${item.customColor};"` : ""}>${item.type}</span>
          </div>
          <h3 class="card-title" ${item.customColor ? `style="color:${item.customColor};"` : ""}>${item.title}</h3>
          <div class="card-info">
            <div class="info-row">
              <i class="fa-regular fa-clock"></i>
              <span>${formatTime12(item.startTime)} - ${formatTime12(item.endTime)}</span>
            </div>
            <div class="info-row">
              <i class="${isOnline ? 'fa-solid fa-wifi' : 'fa-solid fa-location-dot'}"></i>
              <span>${item.location}</span>
              ${item.group ? `<span class="sec-tag">${item.group}</span>` : ""}
            </div>
            <div class="info-row">
              <i class="fa-regular fa-user"></i>
              <span>${item.instructor}</span>
            </div>
          </div>
        </div>

        <div class="card-bottom-bar">
          <div class="card-actions">
            <button class="card-act-btn edit-btn" title="Edit Class"><i class="fa-solid fa-pen"></i></button>
            <button class="card-act-btn danger delete-btn" title="Delete Class"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;

      card.querySelector(".edit-btn").addEventListener("click", () => openModal(item));
      card.querySelector(".delete-btn").addEventListener("click", () => deleteClass(item.id));

      dayCol.appendChild(card);
    });

    viewport.appendChild(dayCol);
  });
}

function renderGridView(items) {
  viewport.className = "schedule-viewport";
  
  let html = `
    <div class="grid-table-container">
      <table class="grid-table">
        <thead>
          <tr>
            <th style="width: 120px;">TIME SLOT</th>
            ${DAYS.map((day) => `<th>${day}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
  `;

  const skipGrid = {};
  DAYS.forEach(day => { skipGrid[day] = {}; });

  TIME_SLOTS.forEach((slot, slotIndex) => {
    html += `<tr><td class="grid-time-col">${slot.label}</td>`;

    DAYS.forEach((day) => {
      if (skipGrid[day][slotIndex]) return;

      const match = items.find((i) => {
        if (i.day !== day) return false;
        const start = parseMinutes(i.startTime);
        return start >= slot.startMinutes && start < slot.endMinutes;
      });

      if (match) {
        const startMin = parseMinutes(match.startTime);
        const endMin = parseMinutes(match.endTime);
        const durationMin = endMin - startMin;
        const rowSpan = Math.max(1, Math.round(durationMin / 90));

        if (rowSpan > 1) {
          for (let r = 1; r < rowSpan; r++) {
            skipGrid[day][slotIndex + r] = true;
          }
        }

        const themeClass = getCourseTheme(match.code);
        const customStyle = match.customColor 
          ? `style="background-color: ${match.customColor}22; border-color: ${match.customColor}; color: ${match.customColor}; height: 100%;"` 
          : 'style="height: 100%;"';

        html += `
          <td ${rowSpan > 1 ? `rowspan="${rowSpan}"` : ""}>
            <div class="grid-cell-card ${themeClass}" ${customStyle}>
              <div style="font-weight: 800;">${match.code} (${match.type})</div>
              <div style="font-weight: 700; font-size: 0.85rem;">${match.title}</div>
              <div style="margin-top: 0.25rem; font-size: 0.75rem; opacity: 0.85;">
                <i class="fa-regular fa-clock"></i> ${formatTime12(match.startTime)} - ${formatTime12(match.endTime)}
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: auto; opacity: 0.85; font-weight: 600;">
                <span>${match.location}</span>
                <span>${match.instructor.split(",")[0]}</span>
              </div>
            </div>
          </td>
        `;
      } else {
        html += `<td class="empty-cell">-</td>`;
      }
    });

    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  viewport.innerHTML = html;
}

function openModal(item = null) {
  classForm.reset();
  if (item) {
    document.getElementById("modal-title").textContent = "Edit Class";
    document.getElementById("form-id").value = item.id;
    document.getElementById("form-code").value = item.code;
    document.getElementById("form-title").value = item.title;
    document.getElementById("form-day").value = item.day;
    document.getElementById("form-type").value = item.type;
    document.getElementById("form-start").value = item.startTime;
    document.getElementById("form-end").value = item.endTime;
    document.getElementById("form-location").value = item.location;
    document.getElementById("form-instructor").value = item.instructor;
    document.getElementById("form-group").value = item.group || "";
    document.getElementById("form-color").value = item.customColor || "#3b82f6";
  } else {
    document.getElementById("modal-title").textContent = "Add Class";
    document.getElementById("form-id").value = "";
    document.getElementById("form-color").value = "#3b82f6";
  }
  modal.classList.add("active");
}

function closeModal() { modal.classList.remove("active"); }

function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("form-id").value;

  const newItem = {
    id: id || Date.now().toString(),
    code: document.getElementById("form-code").value.trim(),
    title: document.getElementById("form-title").value.trim(),
    day: document.getElementById("form-day").value,
    type: document.getElementById("form-type").value,
    startTime: document.getElementById("form-start").value,
    endTime: document.getElementById("form-end").value,
    location: document.getElementById("form-location").value.trim(),
    instructor: document.getElementById("form-instructor").value.trim(),
    group: document.getElementById("form-group").value.trim(),
    customColor: document.getElementById("form-color").value
  };

  if (id) {
    schedule = schedule.map((item) => (item.id === id ? newItem : item));
  } else {
    schedule.push(newItem);
  }

  saveData();
  closeModal();
}

function deleteClass(id) {
  if (confirm("Are you sure you want to delete this class?")) {
    schedule = schedule.filter((item) => item.id !== id);
    saveData();
  }
}
document.getElementById("current-year").textContent = new Date().getFullYear();