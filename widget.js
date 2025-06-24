const url = window.location.href;
const count = (url.match(/e/gi) || []).length;
document.getElementById("text-widget").innerText = `🔡 Nombre de "e" dans l'URL : ${count}`;
