console.log("✅ content.js injecté");

fetch(chrome.runtime.getURL("widget.html"))
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur de chargement du widget.html : ${res.statusText}`);
    }
    return res.text();
  })
  .then(html => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    // Charger CSS
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL("widget.css");
    document.head.appendChild(style);

    // Charger JS
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("widget.js");
    document.body.appendChild(script);

    console.log("✅ Widget injecté !");
  })
  .catch(err => {
    console.error("💥 Erreur lors de l’injection du widget :", err);
  });
