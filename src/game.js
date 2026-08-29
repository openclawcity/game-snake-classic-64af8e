// Snake game — everything inline
(function() {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('score');
  var highEl = document.getElementById('high');
  var overlay = document.getElementById('overlay');
  var startBtn = document.getElementById('startBtn');

  var GRID = 20;
  var COLS, ROWS, TILE;

  function resizeCanvas() {
    var maxW = Math.min(window.innerWidth - 40, 600);
    var maxH = Math.min(window.innerHeight - 80, 600);
    TILE = GRID;
    COLS = Math.floor(maxW / TILE);
    ROWS = Math.floor(maxH / TILE);
    canvas.width = COLS * TILE;
    canvas.height = ROWS * TILE;
  }

  var snake, dir, food, score, highScore, gameOver, gameLoop, speed, specialFood;

  highScore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
  highEl.textContent = highScore;

  function init() {
    resizeCanvas();
    var midX = Math.floor(COLS / 2);
    snake = [
      { x: midX, y: Math.floor(ROWS / 2) },
      { x: midX - 1, y: Math.floor(ROWS / 2) },
      { x: midX - 2, y: Math.floor(ROWS / 2) }
    ];
    dir = 'right';
    score = 0;
    speed = 150;
    gameOver = false;
    specialFood = null;
    scoreEl.textContent = '0';
    placeFood();
  }

  function placeFood() {
    var pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(function(s) { return s.x === pos.x && s.y === pos.y; }));
    food = pos;
  }

  function placeSpecialFood() {
    if (Math.random() < 0.3) {
      var pos;
      do {
        pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      } while (
        snake.some(function(s) { return s.x === pos.x && s.y === pos.y; }) ||
        (food.x === pos.x && food.y === pos.y)
      );
      specialFood = { x: pos.x, y: pos.y, timer: 30 };
    }
  }

  function getDirFromKey(key) {
    var map = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right'
    };
    return map[key] || null;
  }

  var currentDir = 'right';
  var nextDir = 'right';
  var OPPOSITES = { up: 'down', down: 'up', left: 'right', right: 'left' };

  document.addEventListener('keydown', function(e) {
    var d = getDirFromKey(e.key);
    if (d && d !== OPPOSITES[currentDir]) {
      nextDir = d;
      e.preventDefault();
    }
  });

  var touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  document.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    var d;
    if (Math.abs(dx) > Math.abs(dy)) {
      d = dx > 0 ? 'right' : 'left';
    } else {
      d = dy > 0 ? 'down' : 'up';
    }
    if (d !== OPPOSITES[currentDir]) nextDir = d;
  });

  function update() {
    if (gameOver) return;
    currentDir = nextDir;
    dir = currentDir;

    var head = { x: snake[0].x, y: snake[0].y };
    switch (dir) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    // Wall wrap
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // Self collision
    if (snake.some(function(s) { return s.x === head.x && s.y === head.y; })) {
      endGame();
      return;
    }

    snake.unshift(head);

    var ate = false;
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();
      ate = true;
    } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
      score += 30;
      scoreEl.textContent = score;
      specialFood = null;
      ate = true;
    }

    if (!ate) snake.pop();

    // Special food timer
    if (specialFood) {
      specialFood.timer--;
      if (specialFood.timer <= 0) specialFood = null;
    } else {
      placeSpecialFood();
    }

    // Speed up
    speed = Math.max(60, 150 - Math.floor(score / 50) * 5);
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = '#1a1a2e';
    for (var x = 0; x < COLS; x++) {
      for (var y = 0; y < ROWS; y++) {
        ctx.fillRect(x * TILE + TILE / 2 - 1, y * TILE + TILE / 2 - 1, 2, 2);
      }
    }

    // Food
    ctx.fillStyle = '#ff3357';
    ctx.shadowColor = '#ff3357';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(food.x * TILE + TILE / 2, food.y * TILE + TILE / 2, TILE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Special food
    if (specialFood) {
      var alpha = specialFood.timer < 10 ? (Math.sin(Date.now() / 100) + 1) / 2 : 1;
      ctx.fillStyle = 'rgba(255, 204, 0, ' + alpha + ')';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(specialFood.x * TILE + TILE / 2, specialFood.y * TILE + TILE / 2, TILE / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Snake
    snake.forEach(function(seg, i) {
      var ratio = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = 'rgba(51, 255, 87, ' + ratio + ')';
      if (i === 0) {
        ctx.shadowColor = '#33ff57';
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(seg.x * TILE + 1, seg.y * TILE + 1, TILE - 2, TILE - 2);
    });
    ctx.shadowBlur = 0;

    if (gameOver) {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff3357';
      ctx.font = 'bold 30px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffcc00';
      ctx.font = '20px Courier New';
      ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 15);
    }
  }

  function endGame() {
    gameOver = true;
    clearInterval(gameLoop);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHigh', String(highScore));
      highEl.textContent = highScore;
    }
  }

  var speedTimer = null;
  function startGame() {
    overlay.style.display = 'none';
    init();
    clearInterval(speedTimer);
    gameLoop = setInterval(function() { update(); draw(); }, speed);
    speedTimer = setInterval(function() {
      if (!gameOver) {
        var newSpeed = Math.max(60, 150 - Math.floor(score / 50) * 5);
        if (newSpeed !== speed) {
          speed = newSpeed;
          clearInterval(gameLoop);
          gameLoop = setInterval(function() { update(); draw(); }, speed);
        }
      }
    }, 1000);
  }

  window.addEventListener('resize', function() {
    if (gameOver || !snake) return;
    resizeCanvas();
  });

  startBtn.addEventListener('click', startGame);
  draw();
})();
