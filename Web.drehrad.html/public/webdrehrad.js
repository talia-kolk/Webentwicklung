const canvas = document.getElementById("wheel"),
  ctx = canvas.getContext("2d"),
  [addBtn, removeBtn, clearInputsBtn] = document.querySelectorAll("section button"),
  startBtn = document.querySelector(".center button"),
  clearResultsBtn = document.querySelector("section:last-of-type button"),
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


const getOptions = () => [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");

function draw() {
  const opts = getOptions(), r = canvas.width / 2, a = 2 * Math.PI / opts.length,
    bg = ["#000", "#fff", "#ccc"], fg = ["#fff", "#000", "#001f4d"];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  segmente = [];
  let last = -1;

  opts.forEach((txt, i) => {
    let c = 0;
    while (c === last || (i === opts.length - 1 && c === segmente[0]?.color)) c = (c + 1) % bg.length;
    last = c;
    const start = i * a, end = (i + 1) * a;
    segmente.push({ start, end, text: txt, color: c });

    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, start, end);
    ctx.fillStyle = bg[c]; ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(start + a / 2);
    ctx.fillStyle = fg[c];
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(txt, r - 10, 5);
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
      const deg = (rot % 360 + 360) % 360;
      const ziel = ((270 - deg + 360) % 360) * Math.PI / 180;
      const seg = segmente.find(s => ziel >= s.start && ziel < s.end);
      showResult(seg?.text || "❓");
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

async.function requestTextWithGET(url) {
  const respomse = await fetch(url); 
  console.log('Response:', response);
  const text = await response.text(); 
  console.log('Respons-Text:',text); 
}
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
  