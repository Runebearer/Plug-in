console.log("✅ content.js injecté");

const testDiv = document.createElement('div');
testDiv.innerText = "Ceci est un test de widget";
testDiv.style.position = 'fixed';
testDiv.style.bottom = '10px';
testDiv.style.right = '10px';
testDiv.style.background = 'white';
testDiv.style.padding = '10px';
testDiv.style.border = '1px solid #ccc';
testDiv.style.zIndex = '9999';

document.body.appendChild(testDiv);
