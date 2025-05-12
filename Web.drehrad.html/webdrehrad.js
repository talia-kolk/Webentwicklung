const canvas = document.getElementById("wheel"),
  ctx = canvas.getContext("2d"),
  btnStart = document.querySelector(".center button"),
  btns = document.querySelectorAll("section button"),
  optionBox = document.getElementById("optionList"),
  resultBox = document.querySelector(".results"),
  resultClear = document.querySelector("section:last-of-type button");

let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [];

// Optionen aus Eingabefeldern sammeln
const getOptions = () => [...optionBox.querySelectorAll("input")].map(i => i.value || "Leer");

function draw() {
    const opts = getOptions(), r = canvas.width / 2, a = (2 * Math.PI) / opts.length;
    const bg = ["#000", "#fff", "#ccc"], fg = ["#fff", "#000", "#001f4d"];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    opts.forEach((txt, i) => {
      const color = i % 3;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r, i * a, (i + 1) * a);
      ctx.fillStyle = bg[color]; ctx.fill(); ctx.stroke();
  
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(i * a + a / 2);
      ctx.fillStyle = fg[color];
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(txt, r - 10, 5);
      ctx.restore();
    });
  }
  
  
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r, i * a, (i + 1) * a);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.stroke();
  
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(i * a + a / 2);
      ctx.fillStyle = textColor;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(txt, r - 10, 5);
      ctx.restore();
    });
  }

// Ergebnis anzeigen
function show(r) {
  results.push(r);
  localStorage.setItem("drehradErgebnisse", JSON.stringify(results));
  updateResults();
}

// Ergebnisse dynamisch darstellen
function updateResults() {
  resultBox.innerHTML = "";
  results.forEach((res, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${res}`;
    resultBox.appendChild(div);
  });
}

// Drehen starten
function spin() {
  let rot = 0, speed = Math.random() * 30 + 20, opts = getOptions();
  const spinLoop = setInterval(() => {
    rot += speed; speed *= 0.95;
    canvas.style.transform = `rotate(${rot}deg)`;
    if (speed < 0.5) {
      clearInterval(spinLoop);
      const i = Math.floor(((rot % 360) / 360) * opts.length) % opts.length;
      show(opts[i]);
    }
  }, 50);
}

// Felder hinzufügen
const addInput = () => {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.placeholder = `Option ${optionBox.children.length + 1}`;
  optionBox.appendChild(inp); draw();
};

// Felder entfernen
const removeInput = () => {
  if (optionBox.children.length > 2) optionBox.removeChild(optionBox.lastElementChild);
  draw();
};

// Eingaben löschen
const clearInputs = () => {
  [...optionBox.children].forEach(i => i.value = "");
  draw();
};

// Ergebnisse löschen
const clearResults = () => {
  results = [];
  localStorage.removeItem("drehradErgebnisse");
  resultBox.innerHTML = "";
  canvas.style.transform = "rotate(0deg)";
};

// Events binden
btnStart.addEventListener("click", spin);
btns[0].addEventListener("click", addInput);
btns[1].addEventListener("click", removeInput);
btns[2].addEventListener("click", clearInputs);
resultClear.addEventListener("click", clearResults);
optionBox.addEventListener("input", draw);

// Startzustand
if (optionBox.children.length === 0) for (let i = 0; i < 4; i++) addInput();
draw();
updateResults();

  