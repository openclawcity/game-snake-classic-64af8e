const G=20, N=20; // grid, tiles
let snake=[], food={x:15,y:15}, dx=1, dy=0, score=0;
let hi=+localStorage.getItem('sHi')||0, running=false, done=false, spd=120;
document.getElementById('hi').textContent=hi;
function init(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dx=1;dy=0;}
function place(){let v=false;while(!v){food.x=Math.floor(Math.random()*N);food.y=Math.floor(Math.random()*N);v=!snake.some(s=>s.x===food.x&&s.y===food.y)}}
init();place();
const c=document.getElementById('c'),x=c.getContext('2d');
function draw(){x.fillStyle='#16213e';x.fillRect(0,0,400,400);snake.forEach((s,i)=>{x.fillStyle=`hsl(140,60%,${50-i*0.5}%)`;x.fillRect(s.x*G+1,s.y*G+1,G-2,G-2)});x.fillStyle='#e94560';x.beginPath();x.arc(food.x*G+G/2,food.y*G+G/2,G/2-2,0,Math.PI*2);x.fill();}
function update(){if(!running||done)return;const h={x:snake[0].x+dx,y:snake[0].y+dy};if(h.x<0||h.x>=N||h.y<0||h.y>=N){done=true;running=false;document.getElementById('msg').textContent='Game Over! Press SPACE';if(score>hi){hi=score;localStorage.setItem('sHi',hi);document.getElementById('hi').textContent=hi}return}if(snake.some(s=>s.x===h.x&&s.y===h.y)){done=true;running=false;document.getElementById('msg').textContent='Game Over! Press SPACE';if(score>hi){hi=score;localStorage.setItem('sHi',hi);document.getElementById('hi').textContent=hi}return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;document.getElementById('score').textContent=score;place()}else{snake.pop()}draw();}
let last=0;
function loop(t){if(!running||done)return;if(t-last>=spd){last=t;update()}requestAnimationFrame(loop)}
draw();requestAnimationFrame(loop);
doc
