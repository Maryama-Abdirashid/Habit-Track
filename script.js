
// ========================================
// Daywell Habit Tracker - script.js
// ========================================

"use strict";

// ---------- HTML ELEMENTS ----------
const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");
const filters = document.getElementById("filters");

const habitTotal = document.getElementById("habitTotal");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const completedCount = document.getElementById("completedCount");
const streakCount = document.getElementById("streakCount");

const historyList = document.getElementById("historyList");

const habitModal = document.getElementById("habitModal");
const habitForm = document.getElementById("habitForm");
const habitName = document.getElementById("habitName");
const habitCategory = document.getElementById("habitCategory");
const habitIcon = document.getElementById("habitIcon");

const openAddModal = document.getElementById("openAddModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const exportBtn = document.getElementById("exportBtn");

// ---------- DATE ----------
function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function updateDate() {
    const dateElement = document.getElementById("todayDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );
    }
}

// ---------- DEFAULT HABITS ----------
const defaultHabits = [
    {
        id: 1,
        name: "Drink 8 glasses of water",
        category: "Health",
        icon: "💧",
        completedDates: []
    },
    {
        id: 2,
        name: "Read for 20 minutes",
        category: "Learning",
        icon: "📚",
        completedDates: []
    },
    {
        id: 3,
        name: "Exercise for 30 minutes",
        category: "Fitness",
        icon: "🏃",
        completedDates: []
    },
    {
        id: 4,
        name: "Meditate",
        category: "Mindfulness",
        icon: "🧘",
        completedDates: []
    }
];

// ---------- LOCAL STORAGE ----------
function loadHabits() {
    try {
        const savedHabits = localStorage.getItem("daywellHabits");

        if (savedHabits !== null) {
            const parsedHabits = JSON.parse(savedHabits);

            if (Array.isArray(parsedHabits)) {
                return parsedHabits;
            }
        }
    } catch (error) {
        console.error("Could not load habits:", error);
    }

    return defaultHabits.map(habit => ({
        ...habit,
        completedDates: [...habit.completedDates]
    }));
}

let habits = loadHabits();
let activeFilter = "all";

function saveHabits() {
    localStorage.setItem("daywellHabits", JSON.stringify(habits));
}

// ---------- HELPERS ----------
function isCompletedToday(habit) {
    return habit.completedDates.includes(getToday());
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// ---------- RENDER HABITS ----------
function renderHabits() {
    if (!habitList) {
        console.error('HTML element "#habitList" was not found.');
        return;
    }

    let filteredHabits = habits;

    if (activeFilter === "completed") {
        filteredHabits = habits.filter(isCompletedToday);
    } else if (activeFilter === "pending") {
        filteredHabits = habits.filter(habit => !isCompletedToday(habit));
    } else if (
        activeFilter !== "all" &&
        activeFilter !== "All"
    ) {
        filteredHabits = habits.filter(
            habit =>
                habit.category.toLowerCase() ===
                activeFilter.toLowerCase()
        );
    }

    if (emptyState) {
        emptyState.style.display =
            filteredHabits.length === 0 ? "block" : "none";
    }

    habitList.innerHTML = filteredHabits.map(habit => {
        const completed = isCompletedToday(habit);

        return `
            <article class="habit-card ${completed ? "completed" : ""}"
                     data-id="${habit.id}">

                <div class="habit-icon">
                    ${escapeHTML(habit.icon)}
                </div>

                <div class="habit-info">
                    <h3>${escapeHTML(habit.name)}</h3>
                    <span class="habit-category">
                        ${escapeHTML(habit.category)}
                    </span>
                </div>

                <div class="habit-actions">
                    <button
                        type="button"
                        class="complete-btn"
                        data-action="complete"
                        data-id="${habit.id}"
                        aria-label="${completed ? "Mark incomplete" : "Complete habit"}">
                        ${completed ? "✓ Completed" : "✓ Complete"}
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-id="${habit.id}"
                        aria-label="Delete ${escapeHTML(habit.name)}">
                        🗑
                    </button>
                </div>

            </article>
        `;
    }).join("");
}

// ---------- COMPLETE HABIT ----------
function toggleHabit(id) {
    const habit = habits.find(item => item.id === id);

    if (!habit) return;

    const today = getToday();

    if (habit.completedDates.includes(today)) {
        habit.completedDates = habit.completedDates.filter(
            date => date !== today
        );
    } else {
        habit.completedDates.push(today);
    }

    saveHabits();
    renderAll();
}

// ---------- DELETE HABIT ----------
function deleteHabit(id) {
    const habit = habits.find(item => item.id === id);

    if (!habit) return;

    const confirmed = window.confirm(
        `Delete "${habit.name}"?`
    );

    if (!confirmed) return;

    habits = habits.filter(item => item.id !== id);

    saveHabits();
    renderAll();
}

// ---------- ADD HABIT ----------
function addHabit(event) {
    event.preventDefault();

    const name = habitName.value.trim();
    const category = habitCategory.value;
    const icon = habitIcon.value.trim() || "🌱";

    if (!name) {
        habitName.focus();
        return;
    }

    const newHabit = {
        id: Date.now(),
        name,
        category,
        icon,
        completedDates: []
    };

    habits.unshift(newHabit);

    saveHabits();

    activeFilter = "all";
    renderAll();

    habitForm.reset();

    if (habitModal && habitModal.open) {
        habitModal.close();
    }
}

// ---------- STATISTICS ----------
function renderStats() {
    const total = habits.length;
    const completed = habits.filter(isCompletedToday).length;
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    if (habitTotal) {
        habitTotal.textContent = total;
    }

    if (completedCount) {
        completedCount.textContent = completed;
    }

    if (progressPercent) {
        progressPercent.textContent = `${percentage}%`;
    }

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent =
            `${completed} of ${total} habits completed today`;
    }

    if (streakCount) {
        streakCount.textContent = calculateStreak();
    }
}

// ---------- STREAK ----------
function calculateStreak() {
    if (habits.length === 0) return 0;

    const completedDays = new Set();

    habits.forEach(habit => {
        habit.completedDates.forEach(date => {
            completedDays.add(date);
        });
    });

    let streak = 0;
    const currentDate = new Date();

    while (true) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        if (completedDays.has(dateString)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// ---------- HISTORY ----------
function renderHistory() {
    if (!historyList) return;

    const completedHabits = habits.filter(isCompletedToday);

    if (completedHabits.length === 0) {
        historyList.innerHTML = `
            <p class="history-empty">
                No completed habits yet today.
            </p>
        `;
        return;
    }

    historyList.innerHTML = completedHabits.map(habit => `
        <div class="history-item">
            <span>${escapeHTML(habit.icon)}</span>
            <span>${escapeHTML(habit.name)}</span>
            <span>✓</span>
        </div>
    `).join("");
}

// ---------- FILTERS ----------
if (filters) {
    filters.addEventListener("click", event => {
        const button = event.target.closest("button");

        if (!button) return;

        activeFilter =
            button.dataset.filter ||
            button.dataset.category ||
            button.textContent.trim().toLowerCase();

        filters.querySelectorAll("button").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderHabits();
    });
}

// ---------- HABIT BUTTON ACTIONS ----------
if (habitList) {
    habitList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "complete") {
            toggleHabit(id);
        }

        if (action === "delete") {
            deleteHabit(id);
        }
    });
}

// ---------- MODAL ----------
if (openAddModal && habitModal) {
    openAddModal.addEventListener("click", () => {
        if (typeof habitModal.showModal === "function") {
            habitModal.showModal();
        } else {
            habitModal.setAttribute("open", "");
        }

        if (habitName) {
            habitName.focus();
        }
    });
}

function closeHabitModal() {
    if (!habitModal) return;

    if (typeof habitModal.close === "function") {
        habitModal.close();
    } else {
        habitModal.removeAttribute("open");
    }
}

if (closeModal) {
    closeModal.addEventListener("click", closeHabitModal);
}

if (cancelModal) {
    cancelModal.addEventListener("click", closeHabitModal);
}

if (habitForm) {
    habitForm.addEventListener("submit", addHabit);
}

// Close modal if user clicks its backdrop
if (habitModal) {
    habitModal.addEventListener("click", event => {
        if (event.target === habitModal) {
            closeHabitModal();
        }
    });
}

// ---------- EXPORT DATA ----------
function exportData() {
    const data = {
        app: "Daywell Habit Tracker",
        exportedAt: new Date().toISOString(),
        habits
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "daywell-habits.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

if (exportBtn) {
    exportBtn.addEventListener("click", exportData);
}

// ---------- RENDER EVERYTHING ----------
function renderAll() {
    renderHabits();
    renderStats();
    renderHistory();
}

// ---------- START APP ----------
updateDate();
renderAll();

