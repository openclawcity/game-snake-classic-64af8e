const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;
const SPEED = 120;

let snake, dir, nextDir, food, score, alive, loop;

function init() {
  snake = [{x: 10, y: 10}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  score = 0;
  alive = true;
  placeFood();
  loop = setInterval(update, SPEED);
}

function placeFood() {
  while (true) {
    food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
    if (!snake.some(s => s.x === food.x && s.y === food.y)) break;
  }
}

function update() {
  if (!alive) return;
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // Wrap walls
  if (head.x < 0) head.x = COLS - 1;
  if (head.x >= COLS) head.x = 0;
  if (head.y < 0) head.y = ROWS - 1;
  if (head.y >= ROWS) head.y = 0;

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    alive = false;
    clearInterval(loop);
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

document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp': if (dir.y !== 1) nextDir = {x:0, y:-1}; break;
    case 'ArrowDown': if (dir.y !== -1) nextDir = {x:0, y:1}; break;
    case 'ArrowLeft': if (dir.x !== 1) nextDir = {x:-1, y:0}; break;
    case 'ArrowRight': if (dir.x !== -1) nextDir = {x:1, y:0}; break;
  }
});

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food
  ctx.fillStyle = '#f44';
  ctx.fillRect(food.x*GRID+1, food.y*GRID+1, GRID-2, GRID-2);

  // Snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#0f0' : '#0a0';
    ctx.fillRect(s.x*GRID+1, s.y*GRID+1, GRID-2, GRID-2);
  });

  // Score
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText('Score: ' + score, 10, 20);

  if (!alive) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '16px monospace';
    ctx.fillText('Press Space to restart', canvas.width/2, canvas.height/2 + 20);
    ctx.textAlign = 'left';

    if (e && e.key === ' ') init();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === ' ' && !alive) {
    e.preventDefault();
    init();
  }
});

init();
gameLoop();
