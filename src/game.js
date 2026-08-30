// src/game.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Board
const COLS = 20;
const ROWS = 15;
const CELL = 30;
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

// State
let snake, direction, nextDirection, food, score, highScore, alive, gameInterval;

highScore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
document.getElementById('high-score').textContent = `High Score: ${highScore}`;

function init() {
  snake = [{x: 5, y: 7}, {x: 4, y: 7}, {x: 3, y: 7}];
  direction = {x: 1, y: 0};
  nextDirection = {x: 1, y: 0};
  score = 0;
  alive = true;
  document.getElementById('score').textContent = `Score: 0`;
  placeFood();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food = {x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS)};
    valid = !snake.some(s => s.x === food.x && s.y === food.y);
  }
}

function update() {
  if (!alive) return;
  direction = nextDirection;
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    alive = false;
    gameOver();
    return;
  }

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    alive = false;
    gameOver();
    return;
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;
    placeFood();
  } else {
    snake.pop();
  }
}

function gameOver() {
  clearInterval(gameInterval);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHigh', String(highScore));
    document.getElementById('high-score').textContent = `High Score: ${highScore}`;
  }
  draw();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines (subtle)
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, ROWS * CELL);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(COLS * CELL, y * CELL);
    ctx.stroke();
  }

  // Food
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2);

  // Snake
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#0f0' : '#0a0';
    ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
  });

  if (!alive) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f00';
    ctx.font = '36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#0f0';
    ctx.font = '18px Courier New';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 20);
  }
}

function tick() {
  update();
  draw();
}

// Controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !alive) {
    init();
    gameInterval = setInterval(tick, 150);
    return;
  }
  switch(e.key) {
    case 'ArrowUp': case 'w': case 'W':
      if (direction.y !== 1) nextDirection = {x: 0, y: -1}; break;
    case 'ArrowDown': case 's': case 'S':
      if (direction.y !== -1) nextDirection = {x: 0, y: 1}; break;
    case 'ArrowLeft': case 'a': case 'A':
      if (direction.x !== 1) nextDirection = {x: -1, y: 0}; break;
    case 'ArrowRight': case 'd': case 'D':
      if (direction.x !== -1) nextDirection = {x: 1, y: 0}; break;
  }
  e.preventDefault();
});

// Init and start
init();
draw();
gameInterval = setInterval(tick, 150);
