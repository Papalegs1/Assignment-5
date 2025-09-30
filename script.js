// ----- Config -----
const MOVES = ["rock", "paper", "scissors"];
const IMG_BY_MOVE = {
  rock: "rock.png",
  paper: "paper.png",
  scissors: "scissors.png",
};
const QUESTION_IMG = "question-mark.png";
const SHUFFLE_INTERVAL_MS = 500; 
const THINK_TOTAL_MS = 3000;    

// ----- State -----
let isThinking = false;
let shuffleTimer = null;
let thinkTimer = null;
let wins = 0, losses = 0, ties = 0;
let selectedMove = null;

// ----- Elements -----
const choiceFigures = Array.from(document.querySelectorAll(".choice"));
const choiceButtons = Array.from(document.querySelectorAll(".throw-btn"));
const computerImg = document.getElementById("computer-img");
const computerStatus = document.getElementById("computer-status");
const outcome = document.getElementById("outcome");
const playAgainBtn = document.getElementById("play-again");
const resetBtn = document.getElementById("reset");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const tiesEl = document.getElementById("ties");


function setSelected(move) {
  selectedMove = move;
  choiceFigures.forEach(fig => {
    const isSel = fig.dataset.move === move;
    fig.classList.toggle("selected", isSel);
    const btn = fig.querySelector(".throw-btn");
    btn.setAttribute("aria-pressed", String(isSel));
  });
}

function randomMove() {
  const idx = Math.floor(Math.random() * MOVES.length);
  return MOVES[idx];
}

function beats(a, b) {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

function decideWinner(player, comp) {
  if (player === comp) return "tie";
  return beats(player, comp) ? "player" : "computer";
}

function updateScoreboard(result) {
  if (result === "player") wins += 1;
  else if (result === "computer") losses += 1;
  else ties += 1;

  winsEl.textContent = String(wins);
  lossesEl.textContent = String(losses);
  tiesEl.textContent = String(ties);
}

function disableInputs(disabled) {
  choiceButtons.forEach(btn => btn.disabled = disabled);
  playAgainBtn.disabled = disabled;
}

function clearTimers() {
  if (shuffleTimer) {
    clearInterval(shuffleTimer);
    shuffleTimer = null;
  }
  if (thinkTimer) {
    clearTimeout(thinkTimer);
    thinkTimer = null;
  }
}

// ----- Game flow -----
function startComputerThink(onDone) {
  isThinking = true;
  disableInputs(true);

  computerStatus.textContent = "Thinking…";
  let i = 0;

  shuffleTimer = setInterval(() => {
    const move = MOVES[i % MOVES.length];
    computerImg.setAttribute("src", IMG_BY_MOVE[move]);
    computerImg.setAttribute("alt", `Shuffling: ${move}`);
    i += 1;
  }, SHUFFLE_INTERVAL_MS);

  thinkTimer = setTimeout(() => {
    clearTimers();
    const finalMove = randomMove();
    computerImg.setAttribute("src", IMG_BY_MOVE[finalMove]);
    computerImg.setAttribute("alt", `Computer chose ${finalMove}`);
    computerStatus.textContent = `Chose ${finalMove}.`;
    isThinking = false;
    disableInputs(false);
    onDone(finalMove);
  }, THINK_TOTAL_MS);
}

function handlePlayerChoice(move) {
  if (isThinking) return;

  setSelected(move);
  outcome.textContent = "You locked in your throw. Computer is thinking…";
  startComputerThink((compMove) => {
    const res = decideWinner(move, compMove);
    if (res === "player") outcome.textContent = "You win! 🎉";
    else if (res === "computer") outcome.textContent = "Computer wins! 🤖";
    else outcome.textContent = "It’s a tie. 😐";

    updateScoreboard(res);
  });
}

function playAgain() {
  if (isThinking) return;
  setSelected(null);
  selectedMove = null;
  computerImg.setAttribute("src", QUESTION_IMG);
  computerImg.setAttribute("alt", "Waiting for computer choice");
  computerStatus.textContent = "Waiting…";
  outcome.textContent = "Make your move!";
}

function resetAll() {
  clearTimers();
  isThinking = false;
  wins = 0; losses = 0; ties = 0;
  winsEl.textContent = "0";
  lossesEl.textContent = "0";
  tiesEl.textContent = "0";
  playAgain();
}

// ----- Wire up events -----
choiceFigures.forEach(fig => {
  const move = fig.dataset.move;
  const btn = fig.querySelector(".throw-btn");
  btn.addEventListener("click", () => handlePlayerChoice(move));
});

playAgainBtn.addEventListener("click", playAgain);
resetBtn.addEventListener("click", resetAll);


playAgain();

// ===== Theme Toggle =====
const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  themeToggleBtn.setAttribute("aria-pressed", String(theme === "light"));
  themeToggleBtn.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
}

const savedTheme = localStorage.getItem("rps-theme");
applyTheme(savedTheme === "light" ? "light" : "dark");

themeToggleBtn.addEventListener("click", () => {
  const next = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("rps-theme", next);
});
