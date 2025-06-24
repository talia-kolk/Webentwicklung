const canvas = document.getElementById("wheel"),
  ctx = canvas.getContext("2d"),
  addBtn = document.getElementById("addBtn"),
  removeBtn = document.getElementById("removeBtn"),
  clearInputsBtn = document.getElementById("clearInputsBtn"),
  startBtn = document.getElementById("startBtn"),
  clearResultsBtn = document.getElementById("clearResultsBtn"),
  inputBox = document.getElementById("optionList"),
  resultBox = document.querySelector(".results");


// Optionen vom Server laden
fetch("/api/options")
  .then(res => res.json())
  .then(data => {
    inputBox.innerHTML = ""; // Vorherige löschen
    data.forEach(opt => {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = opt.name;
      inputBox.appendChild(inp);
    });
    draw();
  });

  let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [], segmente = [];
const getOptions = () => [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");

function draw() {
  const opts = getOptions(), r = canvas.width / 2, a = 2 * Math.PI / opts.length;Add commentMore actions
  const bg = ["#000", "#fff", "#ccc"], fg = ["#fff", "#000", "#001f4d"];
  segmente = []; // leeren!

  let last = -1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  opts.forEach((txt, i) => {
    let c = 0;
    while (c === last || (i === opts.length - 1 && c === segmente[0]?.color)) c = (c + 1) % bg.length;
    last = c;

    const startAngle = i * a;
    const endAngle = (i + 1) * a;

    segmente.push({ start: startAngle, end: endAngle, text: txt, color: c });

    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, startAngle, endAngle);
    ctx.fillStyle = bg[c]; ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(startAngle + a / 2);
    ctx.fillStyle = fg[c];
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(txt, r - 10, 5);Add commentMore actions
    ctx.restore();
  });
}

function spin() {
  let rot = 0, speed = Math.random() * 30 + 20;
  const loop = setInterval(() => {
    rot += speed;
    speed *= 0.95;
    canvas.style.transform = `rotate(${rot}deg)`;
    if (speed < 0.5) {
      clearInterval(loop);
      const totalRotation = (rot % 360 + 360) % 360;Add commentMore actions
        const zielWinkelGrad = (270 - totalRotation + 360) % 360;
        const zielWinkelRad = zielWinkelGrad * Math.PI / 180;
  Add commentMore actions
        const getroffen = segmente.find(s =>
          zielWinkelRad >= s.start && zielWinkelRad < s.end
        );‚
      showResult(seg?.text || "❓");
      const text = getroffen ? getroffen.text : "❓";Add commentMore actions
        showResult(text);
    }
  }, 50);
}


const showResult = r => {
  results.push(r); 
  fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result: r })
  });
  updateResults();
};

const updateResults = () => {
  resultBox.innerHTML = "";
  results.forEach((r, i) => {
    const d = document.createElement("div");
    d.textContent = `${i + 1}. ${r}`;
    resultBox.appendChild(d);
  });
};

const addInput = () => {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.placeholder = `Option ${inputBox.children.length + 1}`;
  inputBox.appendChild(inp);
  draw();
};

const removeInput = () => {
  if (inputBox.children.length > 2) inputBox.removeChild(inputBox.lastChild);
  draw();
};

const clearInputs = () => {
  [...inputBox.children].forEach(i => i.value = "");
  draw();
};

const clearResults = () => {
  fetch("/api/results", { method: "DELETE" })
  .then(() => {
    results = [];
    resultBox.innerHTML = "";
    canvas.style.transform = "rotate(0deg)";
  });
};

startBtn.addEventListener("click", async () => {
  await speichereOptionen(); 
  spin(); 
}); 

addBtn.addEventListener("click", addInput); 
removeBtn.addEventListener("click", removeInput);
clearInputsBtn.addEventListener("click", clearInputs);
clearResultsBtn.addEventListener("click", clearResults);
inputBox.addEventListener("input", draw);

if (inputBox.children.length === 0) for (let i = 0; i < 4; i++) addInput();
draw();
 updateResults();


  const respomse = await fetch(url); 
  console.log('Response:', response);
  const text = await response.text(); 
  console.log('Respons-Text:',text); 

requestTextWithGET('http://127.0.0.1:3000/');
console.log('Zwischenzeitlich weiterarbeiten...');

async function sendJsonWithGET(url,jsonData) {
  const response = await fetch(url,{
    method: 'post', 
    body: jsonData}
  )
}

const person = {name: "Max", alter: 19}; 
const jsonData = JSON.stringify(person); 

sendJsonWithPOST('http://localhost:3000/', jsonData);  

async function speichereOptionen() {
  const options = [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");
  await fetch("/api/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options)
  });
}