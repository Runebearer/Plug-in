// background.js
// Sauvegarde de data
async function saveCharacter(username, level) {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzAzsBgabttRqSaaGg0YoEy9T82OWd6l7ceYNzern2QS6XPz3Jm4OJ-WHsrsI4JMzK_/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, level: level })
  });

  const result = await response.json();
  console.log("Réponse API :", result);
}

// Exemple d'appel :
saveCharacter("PlayerOne", 42);

// Gère la position globale du widget via chrome.storage et la messagerie

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getWidgetPosition') {
    chrome.storage.sync.get(['widgetStoredLeft', 'widgetStoredTop'], (result) => {
      sendResponse({
        left: result.widgetStoredLeft || null,
        top: result.widgetStoredTop || null
      });
    });
    return true; // réponse asynchrone
  }
  if (request.type === 'setWidgetPosition') {
    chrome.storage.sync.set({
      widgetStoredLeft: request.left,
      widgetStoredTop: request.top
    }, () => {
      sendResponse({success: true});
    });
    return true;
  }
});
