console.log("✅ content.js injecté");

// 1. Charger le HTML et le CSS en parallèle
Promise.all([
  fetch(chrome.runtime.getURL("overlay.html")).then(r => r.text()),
  fetch(chrome.runtime.getURL("overlay.css")).then(r => r.text())
]).then(([html, css]) => {
  // Nettoyer les anciens widgets (zombies) s'ils existent déjà
  const existingHost = document.getElementById("my-extension-host");
  if (existingHost) {
    existingHost.remove();
  }

  // Créer le Shadow Host
  const host = document.createElement("div");
  host.id = "my-extension-host";
  host.style.all = "initial";
  host.style.display = "block";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.bottom = "0";
  host.style.right = "0";
  host.style.width = "0";
  host.style.height = "0";
  document.body.appendChild(host);

  // Attacher le Shadow Root
  const shadow = host.attachShadow({ mode: "open" });

  // Injecter CSS et HTML directement
  shadow.innerHTML = `
    <style>
      ${css}
    </style>
    ${html}
  `;

  // 2. Mettre à jour l'image
  const widgetImage = shadow.querySelector("#heroImg");
  if (widgetImage) {
    widgetImage.src = chrome.runtime.getURL("images/paras.webp");
  }
}).catch(err => {
  console.error("💥 Erreur lors de l’injection du widget :", err);
});
