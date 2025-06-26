// background.js
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
