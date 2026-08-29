// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = 20; // 400 / 20

// Game state
let snake = [];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let gameRunning = false;
let gameOver = false;
let speed = 100; // ms per frame
let lastTime = 0;

// DOM elements
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highscore');
const messageEl = document.getElementById('message');

highScoreEl.textContent = highScore;

// Initialize snake in center
function initSnake() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 1;
  dy = 0;
}

// Place food randomly
function placeFood() {
  let valid = false;
  while (!valid) {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    valid = !snake.some(s => s.x === food.x && s.y === food.y);
  }
}

// Main game loop
function gameLoop(timestamp) {
  if (!gameRunning || gameOver) return;
  
  const elapsed = timestamp - lastTime;
  if (elapsed >= speed) {
    lastTime = timestamp;
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
  // Move snake head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  // Check wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    endGame();
    return;
  }
  
  // Check self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }
  
  snake.unshift(head);
  
  // Check food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    // Speed up slightly every 50 points
    if (score % 50 === 0 && speed > 50) {
      speed -= 5;
    }
  } else {
    snake.pop();
  }
}

// Draw everything
function draw() {
  // Clear background
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid lines (subtle)
  ctx.strokeStyle = '#1a2744';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
  
  // Draw food
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0, Math.PI * 2
  );
  ctx.fill();
  
  // Draw snake
  snake.forEach((segment, i) => {
    const brightness = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = `rgba(46, 204, 113, ${brightness})`;
    ctx.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
    
    // Eyes on head
    if (i === 0) {
      ctx.fillStyle = '#fff';
      const eyeSize = 3;
      let ex1, ey1, ex2, ey2;
      if (dx === 1) { ex1 = 12; ey1 = 5; ex2 = 12; ey2 = 13; }
      else if (dx === -1) { ex1 = 6; ey1 = 5; ex2 = 6; ey2 = 13; }
      else if (dy === -1) { ex1 = 5; ey1 = 6; ex2 = 13; ey2 = 6; }
      else { ex1 = 5; ey1 = 12; ex2 = 13; ey2 = 12; }
      ctx.fillRect(segment.x * GRID_SIZE + ex1, segment.y * GRID_SIZE + ey1, eyeSize, eyeSize);
      ctx.fillRect(segment.x * GRID_SIZE + ex2, segment.y * GRID_SIZE + ey2, eyeSize, eyeSize);
    }
  });
}

// End game
function endGame() {
  gameOver = true;
  gameRunning = false;
  messageEl.textContent = 'Game Over! Press SPACE to restart';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreEl.textContent = highScore;
  }
}

// Reset game
function reset() {
  snake = [];
  score = 0;
  speed = 100;
  gameOver = false;
  scoreEl.textContent = '0';
  messageEl.textContent = '';
  initSnake();
  placeFood();
  gameRunning = true;
  lastTime = performance.now();
  draw();
  requestAnimationFrame(gameLoop);
}

// Input handling
let nextDx = 1;
let nextDy = 0;

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      if (dy !== 1) { nextDx = 0; nextDy = -1; }
      break;
    case 'ArrowDown':
    case 's':
      if (dy !== -1) { nextDx = 0; nextDy = 1; }
      break;
    case 'ArrowLeft':
    case 'a':
      if (dx !== 1) { nextDx = -1; nextDy = 0; }
      break;
    case 'ArrowRight':
    case 'd':
      if (dx !== -1) { nextDx = 1; nextDy = 0; }
      break;
    case ' ':
      if (gameOver) {
        reset();
      } else if (!gameRunning) {
        reset();
        dx = nextDx;
        dy = nextDy;
      }
      break;
  }
});

// Also handle direction changes during play
const originalUpdate = update;
update = function() {
  if (!gameRunning || gameOver) return;
  dx = nextDx;
  dy = nextDy;
  originalUpdate();
};

// Initial draw
initSnake();
draw();
