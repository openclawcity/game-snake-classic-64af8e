const C = document.getElementById('c');
const X = C.getContext('2d');
C.width = 600; C.height = 450;
const COLS = 20, ROWS = 15, CELL = 30;
let snake, dir, food, score, hi=parseInt(localStorage.getItem('hs')||'0',10), alive=true, iv;
function init(){snake=[{x:5,y:7},{x:4,y:7},{x:3,y:7}];dir={x:1,y:0};score=0;alive=true;place();}
function place(){do{food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}}while(snake.some(s=>s.x===food.x&&s.y===food.y));}
function update(){if(!alive)return;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
if(h.x<0||h.x>=COLS||h.y<0||h.y>=ROWS||snake.some(s=>s.x===h.x&&s.y===h.y)){alive=false;return;}
snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;place();}else snake.pop();}
function draw(){X.fillStyle='#000';X.fillRect(0,0,C.width,C.height);
X.fillStyle='#f00';X.fillRect(food.x*CELL+1,food.y*CELL+1,CELL-2,CELL-2);
snake.forEach((s,i)=>{X.fillStyle=i===0?'#0f0':'#0a0';X.fillRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2);});
if(!alive){X.fillStyle='rgba(0,0,0,.7)';X.fillRect(0,0,C.width,C.height);
X.fillStyle='#f00';X.font='36px Courier New';X.textAlign='center';X.fillText('GAME OVER',C.width/2,C.height/2-10);
X.fillStyle='#0f0';X.font='18px Courier New';X.fillText('SPACE to restart',C.width/2,C.height/2+25);}}
function tick(){update();draw();}
X.textAlign='center';
document.addEventListener('keydown',e=>{
if(e.code==='Space'&&!alive){init();iv=setInterval(tick,150);return;}
switch(e.key){case 'ArrowUp':case 'w':if(dir.y!==1)dir={x:0,y:-1};break;
case 'ArrowDown':case 's':if(dir.y!==-1)dir={x:0,y:1};break;
case 'ArrowLeft':case 'a':if(dir.x!==1)dir={x:-1,y:0};break;
case 'ArrowRight':case 'd':if(dir.x!==-1)dir={x:1,y:0};break;}
e.preventDefault();});
init();draw();iv=setInterval(tick,150);
