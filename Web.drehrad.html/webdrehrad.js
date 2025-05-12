
const canvas = document.getElementById("wheel"),
      ctx = canvas.getContext("2d"),
      btnStart = document.querySelector(".center button"),
      btns = document.querySelectorAll("section button"),
      inputBox = document.getElementById("optionList"),
      resultBoxes = document.querySelectorAll(".results div");

let results = JSON.parse(localStorage.getItem("drehradErgebnisse")) || [];

const getInputs = () => [...inputBox.querySelectorAll("input")].map(i => i.value || "Leer");

const draw = () => {
  const opts = getInputs(), r = canvas.width / 2, a = (2 * Math.PI) / opts.length,
        colors = ["#1d65f5", "#12f772", "#eafb31", "#10161d", "#e67e22", "#9b59b6", "#e84393", "#2c3e50"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  opts.forEach((txt, i) => {
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, i * a, (i + 1) * a);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(i * a + a / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(txt, r - 10, 5);
    ctx.restore();
  });
};

const spin = () => {
  let rot = 0, speed = Math.random() * 30 + 20, opts = getInputs();
  const spinLoop = setInterval(() => {
    rot += speed;
    speed *= 0.95;
    canvas.style.transform = `rotate(${rot}deg)`;
    if (speed < 0.5) {
      clearInterval(spinLoop);
      const i = Math.floor(((rot % 360) / 360) * opts.length) % opts.length;
      show(opts[i]);
    }
  }, 50);
};

const show = r => {
  results.unshift(r);
  results = results.slice(0, 3);
  resultBoxes.forEach((box, i) => box.textContent = results[i] || "-");
  localStorage.setItem("drehradErgebnisse", JSON.stringify(results));
};

const add = () => {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.placeholder = `Option ${inputBox.children.length + 1}`;
  inputBox.appendChild(inp);
  draw();
};

const remove = () => {
  if (inputBox.children.length > 2) {
    inputBox.removeChild(inputBox.lastElementChild);
    draw();
  }
};

const reset = () => {
  inputBox.innerHTML = "";
  for (let i = 0; i < 4; i++) add();
  results = [];
  canvas.style.transform = "rotate(0deg)";
  show("-");
  localStorage.removeItem("drehradErgebnisse");
};

draw(); show("-");
btnStart.addEventListener("click", spin);
btns[0].addEventListener("click", add);
btns[1].addEventListener("click", remove);
btns[2].addEventListener("click", reset);
btns[3].addEventListener("click", reset);
inputBox.addEventListener("input", draw);