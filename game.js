const minWaitRange = [6, 12];

let state = "READY";
let startTime = null;
let minWait = 0;

let streak = 0;
let streakScore = 0;
let totalScore = 0;
let bestScore = parseInt(localStorage.getItem("bestPoints"), 10);

if (isNaN(bestScore)) {
  bestScore = 0;
}

const body = document.body;
const message = document.getElementById("message");
const streakDisplay = document.getElementById("streak");
const totalDisplay = document.getElementById("total");
const best = document.getElementById("best");

message.textContent = "CLICK TO START";
streakDisplay.textContent = "";
totalDisplay.textContent = "";
best.textContent = isNaN(bestScore) ? "" : `BEST SCORE: ${bestScore}`;
body.className = "ready";
message.style.transition = "color 0.3s, font-size 0.3s";

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function calculatePoints(diff) {
  if (diff < 0) return 0;
  if (diff <= 0.2) return 100;
  if (diff <= 0.5) return 70;
  if (diff <= 1) return 40;
  return -1;
}

function startGame() {
  minWait = +(Math.random() * (minWaitRange[1] - minWaitRange[0]) + minWaitRange[0]).toFixed(1);
  startTime = Date.now();
  state = "PLAYING";
  body.className = "playing";
  message.textContent = `WAIT AT LEAST ${minWait}s`;
  streakDisplay.textContent = `STREAK: ${streak}`;
  totalDisplay.textContent = `TOTAL SCORE: ${totalScore}`;
  message.style.color = "white";
  message.style.fontSize = "20px";
}

document.addEventListener("click", () => {

  if (state === "READY") {
    startGame();
    return;
  }

  if (state === "PLAYING") {
    state = "GAME_OVER";

    const elapsed = (Date.now() - startTime) / 1000;
    const diff = +(elapsed - minWait).toFixed(2);
    let points = calculatePoints(diff);

    if (points === 0 || points === -1) {
      message.textContent = points === 0 ? "TOO SOON" : "TOO LATE";

      if (streakScore > bestScore || isNaN(bestScore)) {
        bestScore = streakScore;
        localStorage.setItem("bestPoints", bestScore);
      }

      streak = 0;
      streakScore = 0;
      totalScore = 0;                 // reset total score
      totalDisplay.textContent = `TOTAL SCORE: ${totalScore}`;
      vibrate(200);

      body.className = "fail";
      message.style.color = "white";
      message.style.fontSize = "20px";

    } else {
      streak += 1;
      const gained = points * streak;
      streakScore += gained;
      totalScore += gained;

      message.textContent = `+${points} PTS x${streak} = ${gained}`;
      streakDisplay.textContent = `STREAK: ${streak}`;
      totalDisplay.textContent = `TOTAL SCORE: ${totalScore}`;
      vibrate([100, 50, 100]);

      let greenIntensity = Math.min(255, 100 + streak*30);
      message.style.color = `rgb(0, ${greenIntensity}, 0)`; 
      message.style.fontSize = `${20 + streak*2}px`;

      setTimeout(() => {
        message.style.fontSize = "20px";
        message.style.color = "white";
        body.className = "ready";
      }, 300);

      body.className = "success";
    }

    best.textContent = isNaN(bestScore) ? "" : `BEST SCORE: ${bestScore}`;

    setTimeout(() => {
      message.textContent += "\nCLICK TO RESTART";
    }, 500);

    return;
  }

  if (state === "GAME_OVER") {
    startGame();
  }

});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    document.dispatchEvent(new Event("click"));
  }
});
