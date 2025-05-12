const canvas = document.getElementById("wheel"),
  ctx = canvas.getContext("2d"),
  startBtn = document.querySelector(".center button"),
  [addBtn, removeBtn, clearInputsBtn] = document.querySelectorAll("section button"),
  clearResultsBtn = document.querySelector("section:last-of-type button"),
  inputBox = document.getElementById("optionList"),
  resultBox = document.querySelector(".results");

let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [];

const getOptions = () => [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");

function draw() {
    const opts = getOptions(), r = canvas.width / 2, a = 2 * Math.PI / opts.length;
    const bg = ["#000", "#fff", "#ccc"], fg = ["#fff", "#000", "#001f4d"];
    const cList = [], n = bg.length;
    let last = -1;
  
    for (let i = 0; i < opts.length; i++) {
      let c = 0;
      while (c === last || (i === opts.length - 1 && c === cList[0])) c = (c + 1) % n;
      cList.push(last = c);
    }
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    opts.forEach((t, i) => {
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r, i * a, (i + 1) * a);
      ctx.fillStyle = bg[cList[i]]; ctx.fill(); ctx.stroke();
  
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(i * a + a / 2);
      ctx.fillStyle = fg[cList[i]];
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(t, r - 10, 5);
      ctx.restore();
    });
  }


  function spin() {
    let rot = 0, speed = Math.random() * 30 + 20, opts = getOptions();
    const loop = setInterval(() => {
      rot += speed;
      speed *= 0.95;
      canvas.style.transform = `rotate(${rot}deg)`;
      if (speed < 0.5) {
        clearInterval(loop);
  
        // Korrektur: Ergebnis liegt oben (Pfeilposition), aber Zeichenstart ist rechts (90°)
        const winkel = (360 - (rot % 360) + 90) % 360;
        const index = Math.floor((winkel / 360) * opts.length) % opts.length;
  
        showResult(opts[index]);
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

  