const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake, direction, food, score, gameOver, speed, lastTime;

function init() {
    snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    direction = {x: 1, y: 0};
    score = 0;
    gameOver = false;
    speed = 120;
    lastTime = 0;
    placeFood();
}

function placeFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
        if (!snake.some(s => s.x === food.x && s.y === food.y)) break;
    }
}

function update(timestamp) {
    if (gameOver) return;
    
    if (timestamp - lastTime >= speed) {
        lastTime = timestamp;
        
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
        
        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
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
            if (speed > 60) speed -= 2;
            placeFood();
        } else {
            snake.pop();
        }
    }
    
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (subtle)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID, 0);
        ctx.lineTo(x * GRID, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID);
        ctx.lineTo(canvas.width, y * GRID);
        ctx.stroke();
    }
    
    // Draw food
    ctx.fillStyle = '#f33';
    ctx.beginPath();
    ctx.arc(food.x * GRID + GRID/2, food.y * GRID + GRID/2, GRID/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw snake
    snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#4d4' : '#3a3';
        ctx.fillRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2);
        if (i === 0) {
            ctx.strokeStyle = '#5f5';
            ctx.lineWidth = 1;
            ctx.strokeRect(seg.x * GRID + 1, seg.y * GRID + 1, GRID - 2, GRID - 2);
        }
    });
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Courier New';
    ctx.fillText('Score: ' + score, 10, 25);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f44';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '18px Courier New';
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 20);
    }
}

// Controls
document.addEventListener('keydown', e => {
    if (gameOver && e.code === 'Space') {
        init();
        requestAnimationFrame(update);
        return;
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (direction.y !== -1) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x !== -1) direction = {x: 1, y: 0};
            break;
    }
    e.preventDefault();
});

init();
requestAnimationFrame(update);
