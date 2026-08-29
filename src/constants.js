// Game constants
export const GRID_SIZE = 20;
export const TILE_COUNT = 25;
export const CANVAS_SIZE = GRID_SIZE * TILE_COUNT;
export const BASE_SPEED = 8;
export const SPEED_INCREMENT = 0.5;
export const MAX_SPEED = 20;

// Colors
export const COLORS = {
  background: '#000',
  grid: '#111',
  snakeHead: '#0f0',
  snakeBody: '#0a0',
  food: '#f33',
  text: '#0f0'
};

// Controls
export const CONTROLS = {
  up: ['arrowup', 'w'],
  down: ['arrowdown', 's'],
  left: ['arrowleft', 'a'],
  right: ['arrowright', 'd']
};
