const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

let snake = [{x: 10, y: 10}];
let dir = {x: 1, y: 0};
let nextDir = {x: 1, y: 0};
let food = spawnFood();
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHigh') || '0');
let gameOver = false;
let speed = 120;
let lastUpdate = 0;

document.getElementById('highscore').textContent = highScore;

function spawnFood() {
    let pos;
    do {
        pos = {x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS)};
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

function update() {
    if (gameOver) return;
    dir = {...nextDir};
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHigh', highScore);
        }
        return;
    }
    
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (const s of snake) {
        ctx.fillStyle = s === snake[0] ? '#0f0' : '#0a0';
        ctx.fillRect(s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2);
    }
    
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(food.x * TILE + TILE/2, food.y * TILE + TILE/2, TILE/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f00';
        ctx.font = '36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '18px Courier New';
        ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 10);
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 40);
    }
}

function gameLoop(time) {
    if (time - lastUpdate > speed) {
        update();
        lastUpdate = time;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': if(dir.y!==1) nextDir={x:0,y:-1}; break;
        case 'ArrowDown': if(dir.y!==-1) nextDir={x:0,y:1}; break;
        case 'ArrowLeft': if(dir.x!==1) nextDir={x:-1,y:0}; break;
        case 'ArrowRight': if(dir.x!==-1) nextDir={x:1,y:0}; break;
        case ' ':
            if(gameOver) {
                snake = [{x: 10, y: 10}];
                dir = {x: 1, y: 0};
                nextDir = {x: 1, y: 0};
                food = spawnFood();
                score = 0;
                gameOver = false;
                speed = 120;
                document.getElementById('score').textContent = '0';
            }
            break;
    }
});

requestAnimationFrame(gameLoop);
