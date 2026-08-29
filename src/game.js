// snake game
(function() {
  'use strict';
  const G = 20, T = 25, SZ = G * T;
  const cv = document.getElementById('c');
  const cx = cv.getContext('2d');
  cv.width = SZ; cv.height = SZ;

  let snake, dir, nDir, food, score, hi, speed, alive, acc, last;
  const HI_KEY = 'snakeHi';
  const BASE = 8, MAXSPD = 20;

  document.getElementById('highScore').textContent = 'High Score: ' + (hi = +(localStorage.getItem(HI_KEY) || 0));

  function reset() {
    snake = [{x:12,y:12}]; dir = {x:1,y:0}; nDir = {x:1,y:0};
    score = 0; speed = BASE; alive = true; acc = 0;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('overlay').style.display = 'none';
    spawnFood();
  }

  function spawnFood() {
    let f; do { f = {x:Math.floor(Math.random()*T), y:Math.floor(Math.random()*T)}; } while(snake.some(s=>s.x===f.x&&s.y===f.y)); food=f;
  }

  document.addEventListener('keydown', function(e) {
    if (!alive && e.key !== 'Enter') return;
    var m = {'arrowup':'u','arrowdown':'d','arrowleft':'l','arrowright':'r',
             'w':'u','s':'d','a':'l','d':'r'}[e.key.toLowerCase()];
    if (!m) return; e.preventDefault();
    var n;
    if(m==='u') n={x:0,y:-1}; if(m==='d') n={x:0,y:1};
    if(m==='l') n={x:-1,y:0}; if(m==='r') n={x:1,y:0};
    if(n.x !== -dir.x || n.y !== -dir.y) nDir = {x:n.x, y:n.y};
  });

  document.getElementById('restartBtn').addEventListener('click', reset);

  function update() {
    if (!alive) return;
    dir = {x:nDir.x, y:nDir.y};
    var h = {x: snake[snake.length-1].x+dir.x, y: snake[snake.length-1].y+dir.y};
    if (h.x<0||h.x>=T||h.y<0||h.y>=T||snake.some(s=>s.x===h.x&&s.y===h.y)) {
      alive = false;
      if (score > hi) { hi=score; localStorage.setItem(HI_KEY, hi); }
      document.getElementById('highScore').textContent = 'High Score: ' + hi;
      document.getElementById('finalScore').textContent = 'Score: ' + score;
      document.getElementById('overlay').style.display = 'block';
      return;
    }
    snake.push(h);
    if (food && h.x===food.x && h.y===food.y) {
      score += 10;
      speed = Math.min(BASE + Math.floor(score/50)*0.5, MAXSPD);
      document.getElementById('score').textContent = 'Score: '+score;
      spawnFood();
    } else { snake.shift(); }
  }

  function draw() {
    // BG
    cx.fillStyle = '#000'; cx.fillRect(0,0,SZ,SZ);
    // Grid
    cx.strokeStyle='#111'; cx.lineWidth=.5;
    for (var i=0;i<=T;i++){cx.beginPath();cx.moveTo(i*G,0);cx.lineTo(i*G,SZ);cx.stroke();cx.beginPath();cx.moveTo(0,i*G);cx.lineTo(SZ,i*G);cx.stroke();}
    // Snake
    for (var i=0;i<snake.length;i++) {
      var s=snake[i], head=i===snake.length-1;
      cx.fillStyle = head?'#0f0':'rgba(0,'+Math.floor(180+75*(1-i/snake.length))+',0,0.7)';
      if(head){cx.shadowColor='#0f0';cx.shadowBlur=8;} else {cx.shadowBlur=0;}
      cx.fillRect(s.x*G+1,s.y*G+1,G-3,G-3);
      cx.shadowBlur=0;
      // Eyes on head
      if(head){
        cx.fillStyle='#000';
        var ex1,ey1,ex2,ey2;
        if(dir.x===1){ex1=s.x*G+G-5;ey1=s.y*G+4;ex2=s.x*G+G-5;ey2=s.y*G+G-7;}
        else if(dir.x===-1){ex1=s.x*G+3;ey1=s.y*G+4;ex2=s.x*G+3;ey2=s.y*G+G-7;}
        else if(dir.y===-1){ex1=s.x*G+5;ey1=s.y*G+3;ex2=s.x*G+G-6;ey2=s.y*G+3;}
        else{ex1=s.x*G+5;ey1=s.y*G+G-5;ex2=s.x*G+G-6;ey2=s.y*G+G-5;}
        cx.fillRect(ex1,ey1,3,3);cx.fillRect(ex2,ey2,3,3);
      }
    }
    // Food
    if(food){
      var fx=food.x*G+G/2, fy=food.y*G+G/2;
      cx.fillStyle='#f33'; cx.shadowColor='#f00'; cx.shadowBlur=12;
      cx.beginPath(); cx.arc(fx,fy,G/2-2,0,Math.PI*2); cx.fill();
      cx.fillStyle='rgba(255,200,200,.6)'; cx.beginPath();
      cx.arc(fx-2,fy-2,3,0,Math.PI*2);cx.fill();
      cx.shadowBlur=0;
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    var dt = ts - last; last = ts;
    acc += dt;
    var rate = 1000 / speed;
    while(acc >= rate) { update(); acc -= rate; }
    draw();
    requestAnimationFrame(loop);
  }

  reset();
  requestAnimationFrame(function(ts){ last=ts; loop(ts); });
})();
