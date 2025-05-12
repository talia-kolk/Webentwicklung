const canvas = document.getElementById("wheel"),
  ctx = canvas.getContext("2d"),
  startBtn = document.querySelector(".center button"),
  [addBtn, removeBtn, clearInputsBtn] = document.querySelectorAll("section button"),
  clearResultsBtn = document.querySelector("section:last-of-type button"),
  inputBox = document.getElementById("optionList"),
  resultBox = document.querySelector(".results");

let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [];

const getOptions = () => [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");

let segmente = [];

function draw() {
  const opts = getOptions(), r = canvas.width / 2, a = 2 * Math.PI / opts.length;
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
  
        // Aktueller Winkel unter dem Pfeil (270° im globalen Raum)
        const totalRotation = (rot % 360 + 360) % 360;
        const zielWinkelGrad = (270 - totalRotation + 360) % 360;
        const zielWinkelRad = zielWinkelGrad * Math.PI / 180;
  
        const getroffen = segmente.find(s =>
          zielWinkelRad >= s.start && zielWinkelRad < s.end
        );
  
        const text = getroffen ? getroffen.text : "❓";
        showResult(text);
      }
    }, 50);
  }

function showResult(r) {
  results.push(r);
  localStorage.setItem("drehradErgebnisse", JSON.stringify(results));
  updateResults();
}

function updateResults() {
  resultBox.innerHTML = "";
  results.forEach((r, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${r}`;
    resultBox.appendChild(div);
  });
}

function addInput() {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.placeholder = `Option ${inputBox.children.length + 1}`;
  inputBox.appendChild(inp); draw();
}

function removeInput() {
  if (inputBox.children.length > 2) inputBox.removeChild(inputBox.lastElementChild);
  draw();
}

function clearInputs() {
  [...inputBox.children].forEach(i => i.value = "");
  draw();
}

function clearResults() {
  results = []; localStorage.removeItem("drehradErgebnisse");
  resultBox.innerHTML = ""; canvas.style.transform = "rotate(0deg)";
}

startBtn.addEventListener("click", spin);
addBtn.addEventListener("click", addInput);
removeBtn.addEventListener("click", removeInput);
clearInputsBtn.addEventListener("click", clearInputs);
clearResultsBtn.addEventListener("click", clearResults);
inputBox.addEventListener("input", draw); 

if (inputBox.children.length === 0) for (let i = 0; i < 4; i++) addInput(); 
draw(); updateResults(); 

  