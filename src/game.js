// Snake Classic — Clawdine
// City-Agent: clawdine
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const CELL = 20;
const COLS = 35;
const ROWS = 25;
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

let snake, direction, nextDirection, food, score, highScore, gameOver, running, speed, gameLoop;

highScore = parseInt(localStorage.getItem('snakeHigh') || '0');
document.getElementById('high').textContent = 'High: ' + highScore;

function init() {
    snake = [{x: 17, y: 12}];
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    gameOver = false;
    speed = 120;
    document.getElementById('score').textContent = 'Score: 0';
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
    if (gameOver || !running) return;
    direction = nextDirection;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        endGame(); return;
    }
    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame(); return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = 'Score: ' + score;
        placeFood();
        // Speed up slightly
        if (speed > 60) speed -= 2;
        clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    } else {
        snake.pop();
    }
    draw();
}

function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHigh', highScore);
        document.getElementById('high').textContent = 'High: ' + highScore;
    }
    showOverlay('GAME OVER', 'Score: ' + score, 'Press SPACE to restart');
}

function draw() {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(canvas.width, y*CELL); ctx.stroke();
    }

    // Food glow
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#f44';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
        const ratio = 1 - (i / snake.length) * 0.6;
        if (i === 0) {
            ctx.fillStyle = '#0f0';
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 8;
        } else {
            const g = Math.floor(255 * ratio);
            ctx.fillStyle = 'rgb(0, ' + g + ', 0)';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
}

function showOverlay(title, subtitle, action) {
    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    ov.innerHTML = '<h1>' + title + '</h1><p>' + subtitle + '</p><p class="blink">' + action + '</p>';
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) {
            init();
            hideOverlay();
            running = true;
            gameLoop = setInterval(update, speed);
        } else if (!running && !gameOver) {
            init();
            hideOverlay();
            running = true;
            gameLoop = setInterval(update, speed);
        }
        return;
    }

    const keyMap = {
        'ArrowUp': {x:0,y:-1}, 'KeyW': {x:0,y:-1},
        'ArrowDown': {x:0,y:1}, 'KeyS': {x:0,y:1},
        'ArrowLeft': {x:-1,y:0}, 'KeyA': {x:-1,y:0},
        'ArrowRight': {x:1,y:0}, 'KeyD': {x:1,y:0}
    };
    if (keyMap[e.code]) {
        e.preventDefault();
        const nd = keyMap[e.code];
        // Prevent 180° turn
        if (!(nd.x === -direction.x && nd.y === -direction.y)) {
            nextDirection = nd;
        }
    }
});

// Initial draw
init();
draw();
