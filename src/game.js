// Snake Classic — Clawdine
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const CELL = 20;
const COLS = 35;
const ROWS = 25;
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
let snake, direction, nextDir, food, score, hiScore, over, running, speed, loop;
hiScore = parseInt(localStorage.getItem('snakeHi') || '0');
document.getElementById('high').textContent = 'High: ' + hiScore;
function init() {
    snake = [{x:17, y:12}]; direction = {x:1,y:0}; nextDir = {x:1,y:0};
    score = 0; over = false; speed = 120;
    document.getElementById('score').textContent = 'Score: 0';
    placeFood();
}
function placeFood() {
    let v = false;
    while (!v) {
        food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
        v = !snake.some(s => s.x===food.x && s.y===food.y);
    }
}
function update() {
    if (over || !running) return;
    direction = nextDir;
    const head = {x: snake[0].x+direction.x, y: snake[0].y+direction.y};
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS) { endGame(); return; }
    if (snake.some(s => s.x===head.x && s.y===head.y)) { endGame(); return; }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
        score += 10;
        document.getElementById('score').textContent = 'Score: '+score;
        placeFood();
        if (speed > 60) speed -= 2;
        clearInterval(loop);
        loop = setInterval(update, speed);
    } else {
        snake.pop();
    }
    draw();
}
function endGame() {
    over = true;
    if (score > hiScore) { hiScore = score; localStorage.setItem('snakeHi',hiScore); document.getElementById('high').textContent='High: '+hiScore; }
    showOv('GAME OVER','Score: '+score,'Press SPACE to restart');
}
function draw() {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#0a0a0a'; ctx.lineWidth=0.5;
    for (let x=0;x<=COLS;x++) { ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,canvas.height);ctx.stroke(); }
    for (let y=0;y<=ROWS;y++) { ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(canvas.width,y*CELL);ctx.stroke(); }
    ctx.shadowColor='#f00'; ctx.shadowBlur=15;
    ctx.fillStyle='#f44'; ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    snake.forEach((seg,i) => {
        const ratio = 1-(i/snake.length)*0.6;
        if (i===0) { ctx.fillStyle='#0f0'; ctx.shadowColor='#0f0'; ctx.shadowBlur=8; }
        else { ctx.fillStyle='rgb(0,'+Math.floor(255*ratio)+',0)'; ctx.shadowBlur=0; }
        ctx.fillRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2);
    });
    ctx.shadowBlur=0;
}
function showOv(title, sub, act) {
    const ov=document.getElementById('overlay'); ov.style.display='flex';
    ov.innerHTML='<h1>'+title+'</h1><p>'+sub+'</p><p class="blink">'+act+'</p>';
}
function hideOv() { document.getElementById('overlay').style.display='none'; }
document.addEventListener('keydown', function(e) {
    if (e.code==='Space') { e.preventDefault(); if(over||!running){init();hideOv();running=true;loop=setInterval(update,speed);} return; }
    const map = {'ArrowUp':{x:0,y:-1},'KeyW':{x:0,y:-1},'ArrowDown':{x:0,y:1},'KeyS':{x:0,y:1},'ArrowLeft':{x:-1,y:0},'KeyA':{x:-1,y:0},'ArrowRight':{x:1,y:0},'KeyD':{x:1,y:0}};
    if (map[e.code]) { e.preventDefault(); const nd=map[e.code]; if(!(nd.x===-direction.x&&nd.y===-direction.y)) nextDir=nd; }
});
init(); draw();
