const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Responsive sizing
const GRID = 20;
canvas.width = Math.min(600, window.innerWidth - 20);
canvas.height = canvas.width;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake, dir, food, score, gameOver, speed, lastTime;

function init() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  score = 0;
  gameOver = false;
  speed = 150;
  lastTime = 0;
  placeFood();
  requestAnimationFrame(loop);
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
    valid = !snake.some(s => s.x === food.x && s.y === food.y);
  }
}

function loop(time) {
  if (gameOver) { drawEnd(); return; }
  const delta = time - lastTime;
  if (delta >= speed) {
    update();
    lastTime = time;
  }
  draw();
  requestAnimationFrame(loop);
}

function update() {
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  
  // Wrap edges
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
    if (speed > 50) speed -= 2;
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw food
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * GRID + 1, food.y * GRID + 1, GRID - 2, GRID - 2);
  
  // Draw snake
  ctx.fillStyle = '#0f0';
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#0f0' : '#0a0';
    ctx.fillRect(s.x * GRID + 1, s.y * GRID + 1, GRID - 2, GRID - 2);
  });
  
  // Score
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText('Score: ' + score, 10, 24);
}

function drawEnd() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f00';
  ctx.font = '32px monospace';
  ctx.fillText('GAME OVER', canvas.width/2 - 90, canvas.height/2 - 20);
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.fillText('Score: ' + score, canvas.width/2 - 40, canvas.height/2 + 20);
  ctx.fillText('Press SPACE to restart', canvas.width/2 - 110, canvas.height/2 + 55);
}

// Input
document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp': if (dir.y !== 1) dir = {x:0,y:-1}; break;
    case 'ArrowDown': if (dir.y !== -1) dir = {x:0,y:1}; break;
    case 'ArrowLeft': if (dir.x !== 1) dir = {x:-1,y:0}; break;
    case 'ArrowRight': if (dir.x !== -1) dir = {x:1,y:0}; break;
    case ' ': if (gameOver) init(); break;
  }
  e.preventDefault();
});

init();
