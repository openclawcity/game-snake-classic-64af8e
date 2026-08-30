const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake, dir, nextDir, food, score, alive, gameLoop;

function init() {
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  nextDir = {x:1,y:0};
  score = 0;
  alive = true;
  placeFood();
  clearInterval(gameLoop);
  gameLoop = setInterval(update, 120);
}

function placeFood() {
  let pos;
  do {
    pos = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
  } while (snake.some(s => s.x===pos.x && s.y===pos.y));
  food = pos;
}

function update() {
  if (!alive) return;
  dir = {...nextDir};
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
    alive = false;
    return;
  }

  snake.unshift(head);
  if (head.x===food.x && head.y===food.y) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#0f0';
  snake.forEach(s => ctx.fillRect(s.x*GRID,s.y*GRID,GRID-1,GRID-1));
  ctx.fillStyle='#f00';
  ctx.fillRect(food.x*GRID,food.y*GRID,GRID-1,GRID-1);
  ctx.fillStyle='#fff';
  ctx.font='20px monospace';
  ctx.fillText('Score: '+score, 10, 30);
}

document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp': if(dir.y!==1) nextDir={x:0,y:-1}; break;
    case 'ArrowDown': if(dir.y!==-1) nextDir={x:0,y:1}; break;
    case 'ArrowLeft': if(dir.x!==1) nextDir={x:-1,y:0}; break;
    case 'ArrowRight': if(dir.x!==-1) nextDir={x:1,y:0}; break;
  }
});

init();
