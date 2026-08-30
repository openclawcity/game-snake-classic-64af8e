const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1, dy = 0, score = 0, gameSpeed = 100;

function randomFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

function gameLoop() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x < 0) head.x = TILE_COUNT - 1;
    if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    if (head.y >= TILE_COUNT) head.y = 0;
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            snake = [{x: 10, y: 10}]; dx = 1; dy = 0; score = 0;
            document.getElementById('score').textContent = 'Score: 0'; return;
        }
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = 'Score: ' + score;
        randomFood();
    } else { snake.pop(); }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#0f0' : '#0a0';
        ctx.fillRect(snake[i].x * GRID_SIZE, snake[i].y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    setTimeout(gameLoop, gameSpeed);
}

randomFood();
gameLoop();
