// Configuration
const HSC_DATE = new Date("2026-06-15T00:00:00");
const YEAR_START = new Date("2026-01-01T00:00:00");
const YEAR_END = new Date("2027-01-01T00:00:00");

let currentMode = "year"; // 'year' or 'hsc'

const labelText = document.getElementById("label-text");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const countdownDiv = document.getElementById("countdown");
const btnYear = document.getElementById("btn-year");
const btnHsc = document.getElementById("btn-hsc");

function switchMode(mode) {
  currentMode = mode;
  updateUI();

  // Toggle active state of chips
  // Toggle active state of chips
  if (mode === "year") {
    btnYear.classList.add("active");
    btnHsc.classList.remove("active");
    progressContainer.style.display = "block";
    countdownDiv.style.display = "none";

    // Year Mode: Show date, Left Align
    document.getElementById("date-display").style.display = "block";
    document.querySelector(".content").style.textAlign = "left";
  } else {
    btnHsc.classList.add("active");
    btnYear.classList.remove("active");
    progressContainer.style.display = "none";
    countdownDiv.style.display = "block";

    // HSC Mode: Hide date, Center Align
    document.getElementById("date-display").style.display = "none";
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
    return { months: 0, days: 0, hours: 0, seconds: 0, passed: true };
  }

  // Accurate calculation for Months/Days/Hours/Seconds
  // start from 'now' and increment months until we pass target, then backtrack one.
  let tempDate = new Date(now);
  let months = 0;

  // Advance months safely
  while (true) {
    // Create a probe date advanced by 1 month
    let nextMonthLine = new Date(tempDate);
    nextMonthLine.setMonth(tempDate.getMonth() + 1);

    // If advancing one month overshoots the target, stop.
    if (nextMonthLine > targetDate) break;

    tempDate = nextMonthLine;
    months++;
  }

  // Now calculate remaining difference from tempDate to targetDate
  let diff = targetDate - tempDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);

  const seconds = Math.floor(diff / 1000);

  return { months, days, hours, minutes, seconds, passed: false };
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
    const progress = getYearProgress();
    const shortYear = 2026;

    // Update Label
    labelText.textContent = `${progress.toFixed(6)}% of ${shortYear} has passed`;

    // Update Bar
    progressBar.style.width = `${progress}%`;
  } else {
    const remaining = getTimeRemaining(HSC_DATE);

    if (remaining.passed) {
      labelText.textContent = "HSC '26 has started!";
      countdownDiv.textContent = "Good Luck!";
    } else {
      labelText.textContent = "Time until HSC '26";
      // format: "4 months, 0 days, 10 hours, 30 min, 20sec"
      countdownDiv.textContent = `${remaining.months} months, ${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} min, ${remaining.seconds}sec`;
    }
  }
}

// Initial Render
switchMode("year");

// Update loop (every second is enough for this precision, but 60fps frame for bar smoothness)
setInterval(updateUI, 100);

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
