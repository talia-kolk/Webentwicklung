const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const startBtn = document.querySelector("section.center button");
const resultBoxes = document.querySelectorAll(".results div");

let options = ["Blau", "Grün", "Gelb", "Schwarz"];
let colors = ["#1d65f5", "#12f772", "#eafb31", "#10161d"];
let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [];

function drawWheel() {
  const r = canvas.width / 2;
  const a = (2 * Math.PI) / options.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  options.forEach((opt, i) => {
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, i * a, (i + 1) * a);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(i * a + a / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(opt, r - 10, 5);
    ctx.restore();
  });
}

function spinWheel() {
  let rot = 0;
  let speed = Math.random() * 30 + 20;
  const interval = setInterval(() => {
    rot += speed;
    speed *= 0.95;
    canvas.style.transform = `rotate(${rot}deg)`;
    if (speed < 0.5) {
      clearInterval(interval);
      const i = Math.floor(((rot % 360) / 360) * options.length) % options.length;
      showResult(options[i]);
    }
  }, 50);
}

function showResult(r) {
  results.unshift(r);
  results = results.slice(0, 3);
  resultBoxes.forEach((box, i) => box.textContent = results[i] || "-");
  localStorage.setItem("drehradErgebnisse", JSON.stringify(results));
}

drawWheel();
showResult("-");
startBtn.addEventListener("click", spinWheel);