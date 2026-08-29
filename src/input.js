// Input handler for Snake
const Input = (() => {
  let currentDir = 'right';
  let nextDir = 'right';

  const KEY_MAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right'
  };

  const OPPOSITES = { up: 'down', down: 'up', left: 'right', right: 'left' };

  document.addEventListener('keydown', (e) => {
    const dir = KEY_MAP[e.key];
    if (dir && dir !== OPPOSITES[currentDir]) {
      nextDir = dir;
      e.preventDefault();
    }
  });

  // Touch controls for mobile
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    let dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    if (dir !== OPPOSITES[currentDir]) nextDir = dir;
  });

  return {
    getDirection() { currentDir = nextDir; return currentDir; }
  };
})();

export { Input };