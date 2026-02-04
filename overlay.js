// Attendre que le widget soit présent dans le DOM avant d'exécuter la logique
function onWidgetReady(callback) {
  const tryInit = () => {
    const host = document.getElementById("my-extension-host");
    if (host && host.shadowRoot) {
      const widget = host.shadowRoot.getElementById("my-extension-widget");
      const textWidget = host.shadowRoot.getElementById("text-widget");
      if (widget && textWidget) {
        callback(widget, textWidget);
        return true;
      }
    }
    return false;
  };
  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

onWidgetReady((widget, textWidget) => {
  // Ajout d'un style par défaut pour garantir la visibilité et le drag & drop
  widget.style.position = "fixed";
  widget.style.right = "20px";
  widget.style.bottom = "20px";
  widget.style.zIndex = "2147483647";
  widget.style.cursor = "move";

  // Fonction pour charger la position depuis le background (chrome.storage)
  function loadWidgetPosition() {
    try {
      chrome.runtime.sendMessage({ type: 'getWidgetPosition' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error loading widget position from chrome.storage:", chrome.runtime.lastError.message);
          // Show widget anyway in default position
          widget.style.visibility = "visible";
          return;
        }
        if (response && response.left && response.top) {
          widget.style.left = response.left;
          widget.style.top = response.top;
          widget.style.right = "auto";
          widget.style.bottom = "auto";
        }
        // Make widget visible after positioning
        widget.style.visibility = "visible";
      });
    } catch (error) {
      console.error("Error loading widget position from chrome.storage:", error);
    }
  }

  // Load position when the script runs
  loadWidgetPosition();

  // Listen for position changes from other tabs/windows
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && !isDragging) {
      if (changes.widgetStoredLeft || changes.widgetStoredTop) {
        const newLeft = changes.widgetStoredLeft?.newValue;
        const newTop = changes.widgetStoredTop?.newValue;

        if (newLeft && newTop) {
          widget.style.left = newLeft;
          widget.style.top = newTop;
          widget.style.right = "auto";
          widget.style.bottom = "auto";
        }
      }
    }
  });

  // Fonction pour mettre à jour le widget (compte les 'e' dans l'URL)
  function updateWidgetText() {
    const url = window.location.href;
    const count = (url.match(/e/gi) || []).length;
    textWidget.innerText = `🔡 Nombre de "e" dans l'URL : ${count}`;
  }

  // Appel initial
  updateWidgetText();

  // Surveille les changements d'URL (efficace même pour les SPA via MutationObserver)
  function observeUrlChanges(callback) {
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        callback();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  observeUrlChanges(updateWidgetText);

  // Drag and drop functionality
  // State variables (hoisted for safety)
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

      // Save position to chrome.storage
      if (!chrome.runtime?.id) {
        // Extension context invalidated, stop here
        return;
      }
      try {
        chrome.runtime.sendMessage({
          type: 'setWidgetPosition',
          left: widget.style.left,
          top: widget.style.top
        }, (response) => {
          if (chrome.runtime.lastError) {
            // Silently handle error (e.g. context invalidated)
            return;
          }
        });
      } catch (error) {
        console.error("Error saving widget position to chrome.storage:", error);
      }
    }
  });
});
