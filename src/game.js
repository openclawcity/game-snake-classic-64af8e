// Snake game — main module
import { Input } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const GRID = 20;
let COLS, ROWS, TILE;

function resizeCanvas() {
  const maxW = Math.min(window.innerWidth - 40, 600);
  const maxH = Math.min(window.innerHeight - 80, 600);
  TILE = GRID;
  COLS = Math.floor(maxW / TILE);
  ROWS = Math.floor(maxH / TILE);
  canvas.width = COLS * TILE;
  canvas.height = ROWS * TILE;
}

let snake, dir, food, score, highScore, gameOver, gameLoop, speed, specialFood;

highScore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
highEl.textContent = highScore;

function init() {
  resizeCanvas();
  const midX = Math.floor(COLS / 2);
  snake = [
    { x: midX, y: Math.floor(ROWS / 2) },
    { x: midX - 1, y: Math.floor(ROWS / 2) },
    { x: midX - 2, y: Math.floor(ROWS / 2) }
  ];
  dir = 'right';
  score = 0;
  speed = 150;
  gameOver = false;
  specialFood = null;
  scoreEl.textContent = '0';
  placeFood();
}

function placeFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function placeSpecialFood() {
  if (Math.random() < 0.3) {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y) || (food.x === pos.x && food.y === pos.y));
    specialFood = { ...pos, timer: 30 };
  }
}

function update() {
  if (gameOver) return;

  dir = Input.getDirection();

  const head = { ...snake[0] };
  switch (dir) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // Wall wrap
  if (head.x < 0) head.x = COLS - 1;
  if (head.x >= COLS) head.x = 0;
  if (head.y < 0) head.y = ROWS - 1;
  if (head.y >= ROWS) head.y = 0;

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  let ate = false;
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    ate = true;
  } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    score += 30;
    scoreEl.textContent = score;
    specialFood = null;
    ate = true;
  }

  if (!ate) snake.pop();

  // Special food timer
  if (specialFood) {
    specialFood.timer--;
    if (specialFood.timer <= 0) specialFood = null;
  } else {
    placeSpecialFood();
  }

  // Speed up as score increases
  speed = Math.max(60, 150 - Math.floor(score / 50) * 5);
}

function draw() {
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid dots
  ctx.fillStyle = '#1a1a2e';
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      ctx.fillRect(x * TILE + TILE / 2 - 1, y * TILE + TILE / 2 - 1, 2, 2);
    }
  }

  // Food
  ctx.fillStyle = '#ff3357';
  ctx.shadowColor = '#ff3357';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(food.x * TILE + TILE / 2, food.y * TILE + TILE / 2, TILE / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Special food
  if (specialFood) {
    const alpha = specialFood.timer < 10 ? (Math.sin(Date.now() / 100) + 1) / 2 : 1;
    ctx.fillStyle = `rgba(255, 204, 0, ${alpha})`;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(specialFood.x * TILE + TILE / 2, specialFood.y * TILE + TILE / 2, TILE / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Snake
  snake.forEach((seg, i) => {
    const ratio = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = `rgba(51, 255, 87, ${ratio})`;
    if (i === 0) {
      ctx.shadowColor = '#33ff57';
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(seg.x * TILE + 1, seg.y * TILE + 1, TILE - 2, TILE - 2);
  });
  ctx.shadowBlur = 0;

  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff3357';
    ctx.font = 'bold 30px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#ffcc00';
    ctx.font = '20px Courier New';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
  }
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHigh', String(highScore));
    highEl.textContent = highScore;
  }
}

function startGame() {
  overlay.style.display = 'none';
  init();
  gameLoop = setInterval(() => { update(); draw(); }, speed);
  // Dynamic speed
  const speedCheck = setInterval(() => {
    if (!gameOver && speed !== Math.max(60, 150 - Math.floor(score / 50) * 5)) {
      clearInterval(gameLoop);
      gameLoop = setInterval(() => { update(); draw(); }, speed);
    }
  }, 1000);
}

// Handle resize
window.addEventListener('resize', () => {
  if (gameOver || !snake) return;
  resizeCanvas();
});

startBtn.addEventListener('click', startGame);
draw();

export { SnakeGame: { startGame, gameOver: () => gameOver } };