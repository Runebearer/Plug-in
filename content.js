console.log("✅ content.js injecté");

// 1. Charger le HTML du widget
fetch(chrome.runtime.getURL("overlay/overlay.html"))
  .then(response => response.text())
  .then(html => {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 2. Mettre à jour l'image avec l'URL de l'extension
    const widgetImage = document.getElementById("heroImg");
    if (widgetImage) {
      widgetImage.src = chrome.runtime.getURL("images/paras.webp");
    }
    // Ne pas injecter overlay.js ici : il est déjà déclaré comme content_script dans le manifest.json
  })
  .catch(err => {
    console.error("💥 Erreur lors de l’injection du widget :", err);
  });
