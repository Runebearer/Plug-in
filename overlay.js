const widget = document.getElementById("my-extension-widget");
const textWidget = document.getElementById("text-widget");

// Ajout d'un style par défaut pour garantir la visibilité et le drag & drop
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

// Fonction pour mettre à jour le widget (compte les 'e' dans l'URL)
function updateWidgetText() {
  const url = window.location.href;
  const count = (url.match(/e/gi) || []).length;
  textWidget.innerText = `🔡 Nombre de "e" dans l'URL : ${count}`;
}

// Appel initial
updateWidgetText();

// Surveille les changements d'URL (y compris pushState/replaceState)
function observeUrlChanges(callback) {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      callback();
    }
  }).observe(document, {subtree: true, childList: true});

  window.addEventListener('popstate', callback);
  window.addEventListener('hashchange', callback);

  // Patch pushState et replaceState
  const pushState = history.pushState;
  const replaceState = history.replaceState;
  history.pushState = function () {
    pushState.apply(this, arguments);
    callback();
  };
  history.replaceState = function () {
    replaceState.apply(this, arguments);
    callback();
  };
}

observeUrlChanges(updateWidgetText);

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
