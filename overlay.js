const widget = document.getElementById("my-extension-widget");
const statsContainer = document.getElementById("stats-container");

// Default style for visibility and drag & drop
widget.style.position = "fixed";
widget.style.right = "20px";
widget.style.bottom = "20px";
widget.style.zIndex = "2147483647";
widget.style.cursor = "move";

// Function to load and apply stored position
function loadWidgetPosition() {
  try {
    const storedLeft = localStorage.getItem('widgetStoredLeft');
    const storedTop = localStorage.getItem('widgetStoredTop');

    if (storedLeft && storedTop) {
      widget.style.left = storedLeft;
      widget.style.top = storedTop;
      // Ensure these are set to prevent conflicts if CSS had right/bottom initially
      widget.style.right = "auto";
      widget.style.bottom = "auto";
    }
  } catch (error) {
    console.error("Error loading widget position from localStorage:", error);
  }
}

// Load position when the script runs
loadWidgetPosition();

// Fetch and display stats
fetch(chrome.runtime.getURL("stats/paras.json"))
  .then(response => response.json())
  .then(data => {
    const level1Stats = data.find(stats => stats.Level === 1);
    if (level1Stats) {
      for (const [key, value] of Object.entries(level1Stats)) {
        const statElement = document.createElement("p");
        statElement.innerText = `${key}: ${value}`;
        statsContainer.appendChild(statElement);
      }
    }
  })
  .catch(err => {
    console.error("💥 Error loading stats:", err);
    statsContainer.innerText = "Error loading stats.";
  });

// Drag and drop functionality
let isDragging = false;
let offsetX, offsetY;

widget.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - widget.getBoundingClientRect().left;
  offsetY = e.clientY - widget.getBoundingClientRect().top;
  widget.style.cursor = "grabbing"; // Optional: change cursor while dragging

  // Prevent text selection while dragging
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;

  // Constrain movement within the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const widgetWidth = widget.offsetWidth;
  const widgetHeight = widget.offsetHeight;

  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX + widgetWidth > viewportWidth) newX = viewportWidth - widgetWidth;
  if (newY + widgetHeight > viewportHeight) newY = viewportHeight - widgetHeight;

  widget.style.left = `${newX}px`;
  widget.style.top = `${newY}px`;
  // Important: remove bottom and right if they were set, to avoid conflicts
  widget.style.right = "auto";
  widget.style.bottom = "auto";
});

document.addEventListener("mouseup", (e) => { // Added 'e' parameter, though not strictly needed for this part
  if (isDragging) {
    isDragging = false;
    widget.style.cursor = "move"; // Optional: revert cursor

    // Save position to localStorage
    try {
      localStorage.setItem('widgetStoredLeft', widget.style.left);
      localStorage.setItem('widgetStoredTop', widget.style.top);
    } catch (error) {
      console.error("Error saving widget position to localStorage:", error);
      // This might happen if localStorage is disabled or full
    }
  }
});
