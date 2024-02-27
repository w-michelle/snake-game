import { addDoc, collection } from "@firebase/firestore";
import { loadScores } from "./scoreboard";
import { db } from "../utils/firebase";

const $grid = document.querySelector(".grid");
const $score = document.querySelector(".score");

const $instruction = document.querySelector(".instruction");
const $end = document.querySelector(".end");

// "build": "webpack --mode=production"

let food = createFood();
let snakehead = [{ x: 16, y: 16 }];
let startedGame = false;
let direction = "right";
let gameSpeedDelay = 100;
let gameInterval;

function startGame() {
  const leaderboard = document.querySelector(".leader-bg");
  if (leaderboard) {
    leaderboard.remove();
  }
  startedGame = true;
  $instruction.style.display = "none";
  gameInterval = setInterval(() => {
    move();
    checkCollision();
    draw();
  }, gameSpeedDelay);
}
function draw() {
  $grid.innerHTML = "";
  drawSnake();
  drawfood();
  updateScore();
}

function drawSnake() {
  if (startedGame) {
    snakehead.forEach((el) => {
      const snakeElement = document.createElement("div");
      snakeElement.className = "snake";
      snakeElement.style.gridColumn = el.x;
      snakeElement.style.gridRow = el.y;
      $grid.appendChild(snakeElement);
    });
  }
}
function drawfood() {
  if (startedGame) {
    const foodElement = document.createElement("div");
    foodElement.className = "food";
    foodElement.style.gridColumn = food.x;
    foodElement.style.gridRow = food.y;
    $grid.appendChild(foodElement);
  }
}

function createFood() {
  let x = Math.floor(Math.random() * 31) + 1;
  let y = Math.floor(Math.random() * 31) + 1;

  return { x, y };
}

function move() {
  const head = { ...snakehead[0] };

  switch (direction) {
    case "right":
      head.x++;
      break;
    case "left":
      head.x--;
      break;
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
  }
  //adding to snake body
  snakehead.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = createFood();
    increaseSpeed();
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      move();
      checkCollision();
      draw();
    }, gameSpeedDelay);
  } else {
    snakehead.pop();
  }
}
function increaseSpeed() {
  if (gameSpeedDelay > 60) {
    gameSpeedDelay -= 5;
  } else if (gameSpeedDelay > 30) {
    gameSpeedDelay -= 3;
  } else {
    gameSpeedDelay -= 1;
  }
}
function checkCollision() {
  const head = snakehead[0];
  //check if head is hitting walls
  if (head.x < 1 || head.x > 31 || head.y < 1 || head.y > 31) {
    resetGame();
  }
  //check if head is hitting body
  for (let i = 1; i < snakehead.length; i++) {
    if (head.x === snakehead[i].x && head.y === snakehead[i].y) {
      resetGame();
    }
  }
}
function handleKeyDown(e) {
  // check if game started
  if (!startedGame && e.code === "Space") {
    startGame();
  }

  if (
    (snakehead.length > 1 && direction == "up" && e.key == "ArrowDown") ||
    (snakehead.length > 1 && direction == "down" && e.key == "ArrowUp") ||
    (snakehead.length > 1 && direction == "left" && e.key == "ArrowRight") ||
    (snakehead.length > 1 && direction == "right" && e.key == "ArrowLeft")
  ) {
    return;
  } else {
    switch (e.key) {
      case "ArrowUp":
        direction = "up";
        break;
      case "ArrowDown":
        direction = "down";
        break;
      case "ArrowLeft":
        direction = "left";
        break;
      case "ArrowRight":
        direction = "right";
        break;
    }
  }
}
document.addEventListener("keydown", handleKeyDown);

function updateScore() {
  const currentScore = snakehead.length - 1;
  $score.textContent = currentScore.toString().padStart(3, "0");
}

function stopGame() {
  clearInterval(gameInterval);
  startedGame = false;
  $instruction.style.display = "block";
}

function resetGame() {
  const currentScore = snakehead.length - 1;
  if (currentScore > 0) {
    enterScore();
    stopGame();
  } else {
    resetState();
    stopGame();
  }
}
function resetState() {
  snakehead = [{ x: 16, y: 16 }];
  food = createFood();
  direction = "right";
  gameSpeedDelay = 100;
  updateScore();
}
function enterScore() {
  let markup = `
    <div class="gameover">
    <h1>Game Over</h1>
    <h2>Enter Your Initials (3 LETTERS)</h2>
  <form>
    <input
      placeholder="XXX"
      type="text"
      minlength="3"
      maxlength="3"
      class="name"
      pattern="[a-zA-Z]{3}"
    />
    <button class="submitScore">SAVE</button>
  </form>
  <button class="return">return to game</button>
  </div>
  `;
  $end.innerHTML = markup;

  $end.removeEventListener("click", handleSubmitScore);
  $end.removeEventListener("keyup", handleSubmitScore);

  $end.addEventListener("click", handleSubmitScore);
  $end.addEventListener("keyup", handleSubmitScore);
}

async function handleSubmitScore(e) {
  $end.removeEventListener("keyup", handleSubmitScore);

  e.preventDefault();
  e.stopPropagation();
  if (e.keyCode === 13 || (e.target && e.target.matches(".submitScore"))) {
    let currentScore = snakehead.length - 1;
    let name = document.querySelector(".name");

    if (name.value.length === 3 && /^[a-zA-Z]{3}$/.test(name.value)) {
      await addDoc(collection(db, "scores"), {
        score: currentScore,
        name: name.value.toUpperCase(),
      });

      updateHighScore();
    }
  } else if (e.target && e.target.matches(".return")) {
    resetState();
    $end.innerHTML = "";
  }
}
async function updateHighScore() {
  let allScores = await loadScores();

  if (allScores) {
    let markup = `   
    <div class="leader-bg">
    <h1>High Score</h1>
    <div class="leader">`;

    allScores.forEach((result, index) => {
      markup += `


        <div class="indv-score">
          <p>${index + 1}</p>
          <p>${result.score.toString().padStart(3, "0")}</p>
          <p>${result.name}</p>
        </div>
   
    `;
    });
    markup += `   
    </div>
    <p id="instruction">Press spacebar to start the game</p>
  </div>
`;
    $end.innerHTML = markup;
  }
  resetState();
}
