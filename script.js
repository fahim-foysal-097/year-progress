// Configuration
const ADM_DATE = new Date("2026-12-01T00:00:00");
const YEAR_START = new Date("2026-01-01T00:00:00");
const YEAR_END = new Date("2027-01-01T00:00:00");

// Default Settings
const defaultSettings = {
  precision: 6,
  color: "#00ff66",
};
let settings = { ...defaultSettings };

// DOM Elements
const labelText = document.getElementById("label-text");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const countdownDiv = document.getElementById("countdown");
const btnYear = document.getElementById("btn-year");
const btnAdm = document.getElementById("btn-adm");

// Settings DOM
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const precisionInput = document.getElementById("precision-input");
const colorSwatches = document.querySelectorAll(".color-swatch");
const customColorPicker = document.getElementById("custom-color-picker");

// Load Settings
function loadSettings() {
  const saved = localStorage.getItem("yearProgressSettings");
  if (saved) {
    settings = { ...defaultSettings, ...JSON.parse(saved) };
  }
  applySettings(false); // false = don't save again
  updateSettingsUI();
}

function saveSettings() {
  localStorage.setItem("yearProgressSettings", JSON.stringify(settings));
}

function applySettings(save = true) {
  // Apply Color
  document.documentElement.style.setProperty("--accent-green", settings.color);

  // Update inputs to match state
  precisionInput.value = settings.precision;
  customColorPicker.value = settings.color;

  // Highlight active swatch
  colorSwatches.forEach((swatch) => {
    if (swatch.dataset.color.toLowerCase() === settings.color.toLowerCase()) {
      swatch.classList.add("active");
    } else {
      swatch.classList.remove("active");
    }
  });

  if (save) saveSettings();

  // Trigger UI update to reflect precision change immediately
  if (!isAnimating) updateUI();
}

function updateSettingsUI() {
  precisionInput.value = settings.precision;
}

// Event Listeners
settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

precisionInput.addEventListener("input", (e) => {
  let val = parseInt(e.target.value);
  if (isNaN(val) || val < 0) val = 0;
  if (val > 12) val = 12;
  settings.precision = val;
  applySettings();
});

colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    settings.color = swatch.dataset.color;
    applySettings();
  });
});

customColorPicker.addEventListener("input", (e) => {
  settings.color = e.target.value;
  applySettings();
});

let currentMode = "year"; // 'year' or 'adm'

let isAnimating = false;
let animationStartTime = 0;
const ANIMATION_DURATION = 2000; // 2 seconds

function switchMode(mode) {
  currentMode = mode;

  // Start animation when switching to year mode
  if (mode === "year") {
    isAnimating = true;
    animationStartTime = performance.now();
  }

  updateUI();

  // Toggle active state of chips
  if (mode === "year") {
    btnYear.classList.add("active");
    btnAdm.classList.remove("active");
    progressContainer.style.display = "block";
    countdownDiv.style.display = "none";

    // Year Mode: Show date, Left Align
    document.getElementById("date-display").style.display = "block";
    labelText.style.display = "block"; // Show main label
    document.querySelector(".content").style.textAlign = "left";
  } else {
    btnAdm.classList.add("active");
    btnYear.classList.remove("active");
    progressContainer.style.display = "none";
    countdownDiv.style.display = "block";
    document.getElementById("date-display").style.display = "none";
    labelText.style.display = "none"; // Hide main label, let the card header do the work
    document.querySelector(".content").style.textAlign = "center";
  }
}

function getYearProgress() {
  const now = new Date();
  const totalDuration = YEAR_END - YEAR_START;
  const elapsed = now - YEAR_START;
  let percentage = (elapsed / totalDuration) * 100;

  // Clamp between 0 and 100
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  return percentage;
}

function getTimeRemaining(targetDate) {
  const now = new Date();
  if (now >= targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }

  let diff = targetDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);

  const seconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds, passed: false };
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function updateUI() {
  const now = new Date();

  const dateDisplay = document.getElementById("date-display");

  // Format Date: "January 22, 19:51"
  const options = {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  dateDisplay.textContent = now.toLocaleDateString("en-US", options);

  if (currentMode === "year") {
    const realProgress = getYearProgress();
    let displayProgress = realProgress;

    if (isAnimating) {
      const nowTime = performance.now();
      const elapsedAnimation = nowTime - animationStartTime;
      const progressFactor = Math.min(elapsedAnimation / ANIMATION_DURATION, 1);

      // Apply easing function for smooth start/end
      const easedFactor = easeOutCubic(progressFactor);

      displayProgress = realProgress * easedFactor;

      if (progressFactor >= 1) {
        isAnimating = false;
      }
    }

    const shortYear = 2026;

    // Update Label
    labelText.textContent = `${displayProgress.toFixed(settings.precision)}% of ${shortYear} has passed`;

    // Update Bar
    progressBar.style.width = `${displayProgress}%`;
  } else {
    // Stop animation if we switch away
    isAnimating = false;

    const remaining = getTimeRemaining(ADM_DATE);

    if (remaining.passed) {
      document.getElementById("cd-body").innerHTML =
        "<div style='font-size: 2.5rem; padding: 20px 0;'>Good Luck!</div>";
      document.getElementById("cd-header").textContent = "ADM '26 HAS STARTED!";
    } else {
      document.getElementById("cd-header").textContent =
        "ADM EXAM COUNTDOWN: 1ST DECEMBER";
      // .padStart(2, '0') forces numbers like 5 to show as "05" to match the visual look
      document.getElementById("cd-days").textContent = remaining.days
        .toString()
        .padStart(2, "0");
      document.getElementById("cd-hours").textContent = remaining.hours
        .toString()
        .padStart(2, "0");
      document.getElementById("cd-mins").textContent = remaining.minutes
        .toString()
        .padStart(2, "0");
      document.getElementById("cd-secs").textContent = remaining.seconds
        .toString()
        .padStart(2, "0");
    }
  }

  if (isAnimating) {
    requestAnimationFrame(updateUI);
  }
}

// Initial Render
loadSettings();
switchMode("year");

// Update loop (every second is enough for this precision, but 60fps frame for bar smoothness)
// We keep this for the steady state updates.
// Note: When isAnimating is true, we are also calling requestAnimationFrame.
// This is fine, updateUI is idempotent enough.
setInterval(() => {
  if (!isAnimating) updateUI();
}, 100);

// Expose to window for HTML onclick handling
window.switchMode = switchMode;

// --- Custom Cursor Logic ---
const cursor = document.getElementById("custom-cursor");

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// Optional: Add hover effect for clickable elements
const clickableElements = document.querySelectorAll("button, a");
clickableElements.forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
});
