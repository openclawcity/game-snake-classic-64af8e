// Game configuration
const GRID_SIZE = 20;
const TILE_COUNT = 25;
const CANVAS_SIZE = GRID_SIZE * TILE_COUNT;
const BASE_SPEED = 8;
const SPEED_INCREMENT = 0.5;
const MAX_SPEED = 20;

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Game state
let snake = [{ x: 12, y: 12 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let speed = BASE_SPEED;
let gameRunning = true;
let lastTime = 0;
let accumulator = 0;

// DOM elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

highScoreEl.textContent = `High Score: ${highScore}`;

// Input handling
let pendingInputs = [];
document.addEventListener('keydown', (e) => {
  if (!gameRunning && e.key !== 'Enter') return;
  
  const key = e.key.toLowerCase();
  let newDir = null;
  
  switch(key) {
    case 'arrowup': case 'w': newDir = { x: 0, y: -1 }; break;
    case 'arrowdown': case 's': newDir = { x: 0, y: 1 }; break;
    case 'arrowleft': case 'a': newDir = { x: -1, y: 0 }; break;
    case 'arrowright': case 'd': newDir = { x: 1, y: 0 }; break;
  }
  
  if (newDir) {
    e.preventDefault();
    pendingInputs.push(newDir);
  }
});

function processInput() {
  while (pendingInputs.length > 0) {
    const next = pendingInputs.shift();
    // Prevent reversing direction
    if (next.x !== -direction.x || next.y !== -direction.y) {
      nextDirection = { ...next };
    }
  }
}

// Food placement
function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  food = newFood;
}

// Collision detection
function checkCollision(head) {
  // Wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    return true;
  }
  // Self collision
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  return false;
}

// Game update
function update() {
  if (!gameRunning) return;
  
  processInput();
  direction = { ...nextDirection };
  
  const head = {
    x: snake[snake.length - 1].x + direction.x,
    y: snake[snake.length - 1].y + direction.y
  };
  
  if (checkCollision(head)) {
    gameOver();
    return;
  }
  
  snake.push(head);
  
  // Check food eaten
  if (food && head.x === food.x && head.y === food.y) {
    score += 10;
    speed = Math.min(BASE_SPEED + Math.floor(score / 50) * SPEED_INCREMENT, MAX_SPEED);
    scoreEl.textContent = `Score: ${score}`;
    spawnFood();
  } else {
    snake.shift();
  }
}

// Game over
function gameOver() {
  gameRunning = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore.toString());
    highScoreEl.textContent = `High Score: ${highScore}`;
  }
  finalScoreEl.textContent = `Score: ${score}`;
  gameOverEl.style.display = 'block';
}

// Restart
restartBtn.addEventListener('click', () => {
  snake = [{ x: 12, y: 12 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  pendingInputs = [];
  score = 0;
  speed = BASE_SPEED;
  gameRunning = true;
  scoreEl.textContent = 'Score: 0';
  gameOverEl.style.display = 'none';
  spawnFood();
});

// Drawing functions
function drawGrid() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  // Subtle grid lines
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
    ctx.stroke();
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const isHead = i === snake.length - 1;
    
    if (isHead) {
      // Head with eyes
      ctx.fillStyle = '#0f0';
      ctx.shadowColor = '#0f0';
      ctx.shadowBlur = 8;
      ctx.fillRect(seg.x * GRID_SIZE, seg.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      ctx.shadowBlur = 0;
      
      // Eyes
      ctx.fillStyle = '#000';
      const eyeSize = 3;
      let eye1x, eye1y, eye2x, eye2y;
      if (direction.x === 1) {
        eye1x = seg.x * GRID_SIZE + GRID_SIZE - 6;
        eye1y = seg.y * GRID_SIZE + 5;
        eye2x = seg.x * GRID_SIZE + GRID_SIZE - 6;
        eye2y = seg.y * GRID_SIZE + GRID_SIZE - 8;
      } else if (direction.x === -1) {
        eye1x = seg.x * GRID_SIZE + 3;
        eye1y = seg.y * GRID_SIZE + 5;
        eye2x = seg.x * GRID_SIZE + 3;
        eye2y = seg.y * GRID_SIZE + GRID_SIZE - 8;
      } else if (direction.y === -1) {
        eye1x = seg.x * GRID_SIZE + 5;
        eye1y = seg.y * GRID_SIZE + 3;
        eye2x = seg.x * GRID_SIZE + GRID_SIZE - 8;
        eye2y = seg.y * GRID_SIZE + 3;
      } else {
        eye1x = seg.x * GRID_SIZE + 5;
        eye1y = seg.y * GRID_SIZE + GRID_SIZE - 6;
        eye2x = seg.x * GRID_SIZE + GRID_SIZE - 8;
        eye2y = seg.y * GRID_SIZE + GRID_SIZE - 6;
      }
      ctx.fillRect(eye1x, eye1y, eyeSize, eyeSize);
      ctx.fillRect(eye2x, eye2y, eyeSize, eyeSize);
    } else {
      // Body with gradient from head
      const alpha = Math.max(0.4, 1 - (i / snake.length) * 0.6);
      ctx.fillStyle = `rgba(0, ${Math.floor(180 + 75 * (1 - i / snake.length))}, 0, ${alpha})`;
      ctx.shadowColor = `rgba(0, 255, 0, ${alpha * 0.3})`;
      ctx.shadowBlur = 4;
      ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 3, GRID_SIZE - 3);
      ctx.shadowBlur = 0;
    }
  }
}

function drawFood() {
  if (!food) return;
  
  const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 15;
  
  // Draw food as circle
  const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
  const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
  const radius = GRID_SIZE / 2 - 2;
  
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Shine effect
  ctx.fillStyle = `rgba(255, 200, 200, ${pulse})`;
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, radius / 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
}

// Main game loop
function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  
  accumulator += delta;
  const tickRate = 1000 / speed;
  
  while (accumulator >= tickRate) {
    update();
    accumulator -= tickRate;
  }
  
  drawGrid();
  drawFood();
  drawSnake();
  
  requestAnimationFrame(gameLoop);
}

// Start game
spawnFood();
requestAnimationFrame((ts) => {
  lastTime = ts;
  gameLoop(ts);
});
