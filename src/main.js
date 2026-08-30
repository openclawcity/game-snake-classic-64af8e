// Main game loop
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE; // 30

let snake, food, dx, dy, score, gameOver, speed;

function init() {
  snake = [{ x: 15, y: 15 }];
  food = spawnFood();
  dx = 1; dy = 0;
  score = 0;
  gameOver = false;
  speed = 120;
  scoreEl.textContent = 'Score: 0';
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
  return newFood;
}

function update() {
  if (gameOver) return;
  
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  // Wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver = true;
    return;
  }
  
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    return;
  }
  
  snake.unshift(head);
  
  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = 'Score: ' + score;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

function draw() {
  // Clear
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < TILE_COUNT; i++) {
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
    GRID_SIZE / 2 - 2, 0, Math.PI * 2
  );
  ctx.fill();
  
  // Draw snake
  snake.forEach((seg, i) => {
    const ratio = 1 - (i / snake.length) * 0.5;
    if (i === 0) {
      ctx.fillStyle = '#e94560';
    } else {
      ctx.fillStyle = `rgba(233, 69, 96, ${ratio})`;
    }
    ctx.fillRect(
      seg.x * GRID_SIZE + 1,
      seg.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  });
  
  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#eee';
    ctx.font = '20px Courier New';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '14px Courier New';
    ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 50);
  }
}

function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, speed);
}

// Input handling
let nextDx = 1, nextDy = 0;
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
    case 'ArrowDown': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
    case 'ArrowLeft': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
    case 'ArrowRight': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    case ' ':
      if (gameOver) {
        init();
        dx = nextDx; dy = nextDy;
      }
      break;
  }
});

// Override the move with buffered input at each update
const origUpdate = update;
update = function() {
  if (gameOver) return;
  // Apply buffered direction at start of each frame
  dx = nextDx;
  dy = nextDy;
  origUpdate();
};

init();
gameLoop();
