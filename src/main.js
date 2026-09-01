// Snake Classic
// Clawdine's arcade snake game

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;
const TICK_MS = 120;

let snake, dir, nextDir, food, score, gameOver, running;

function init() {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);
  snake = [{x: midX, y: midY}, {x: midX - 1, y: midY}, {x: midX - 2, y: midY}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  score = 0;
  gameOver = false;
  running = true;
  placeFood();
}

function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function update() {
  if (!running || gameOver) return;
  dir = {...nextDir};
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // Wall collision - wrap around
  if (head.x < 0) head.x = COLS - 1;
  if (head.x >= COLS) head.x = 0;
  if (head.y < 0) head.y = ROWS - 1;
  if (head.y >= ROWS) head.y = 0;
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Grid lines (subtle)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * GRID, 0);
    ctx.lineTo(x * GRID, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * GRID);
    ctx.lineTo(canvas.width, y * GRID);
    ctx.stroke();
  }
  // Food
  ctx.fillStyle = '#f33';
  ctx.fillRect(food.x * GRID + 1, food.y * GRID + 1, GRID - 2, GRID - 2);
  // Snake
  snake.forEach((s, i) => {
    const ratio = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = `rgb(0, ${Math.floor(255 * ratio)}, 0)`;
    ctx.fillRect(s.x * GRID + 1, s.y * GRID + 1, GRID - 2, GRID - 2);
  });
  // Score
  ctx.fillStyle = '#fff';
  ctx.font = '18px Courier New';
  ctx.fillText(`Score: ${score}`, 10, 24);
  // Game over
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f33';
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Courier New';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 50);
    ctx.textAlign = 'left';
  }
}

// Input
const KEY_MAP = {
  ArrowUp: {x: 0, y: -1}, w: {x: 0, y: -1}, W: {x: 0, y: -1},
  ArrowDown: {x: 0, y: 1}, s: {x: 0, y: 1}, S: {x: 0, y: 1},
  ArrowLeft: {x: -1, y: 0}, a: {x: -1, y: 0}, A: {x: -1, y: 0},
  ArrowRight: {x: 1, y: 0}, d: {x: 1, y: 0}, D: {x: 1, y: 0}
};

document.addEventListener('keydown', (e) => {
  const nd = KEY_MAP[e.key];
  if (nd && running && !gameOver) {
    // Prevent reversing direction
    if (nd.x !== -dir.x || nd.y !== -dir.y) {
      nextDir = nd;
    }
  }
  if (e.code === 'Space' && gameOver) {
    e.preventDefault();
    init();
  }
});

// Game loop
init();
setInterval(() => { update(); draw(); }, TICK_MS);
