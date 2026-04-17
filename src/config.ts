export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 560;
export const TILE_SIZE = 16;
export const RENDER_SCALE = 2; // pixel art 2x scale

export const PHYSICS = {
  gravity: 900,
  playerSpeed: 210,
  caramelSpeedMultiplier: 0.40,
  playerJumpVel: -530,
  playerDoubleJumpVel: -450,
  stompBounceVel: -380,
  projectileSpeed: 520,
};

export const PLAYER = {
  normalWidth: 22,
  normalHeight: 30,
  largeWidth: 36,
  largeHeight: 50,
  maxHealth: 3,
  maxLives: 3,
  invincibilityMs: 2000,
  maxShards: 3,
};

export const ENEMY = {
  gummySpeed: 90,
  jawbreakerSpeed: 70,
  droneSpeed: 80,
  dronePatrolRange: 180,
  golemSpeed: 50,
  golemMaxHp: 3,
};

export const SCORE = {
  stompGummy: 100,
  stompJawbreaker: 200,
  killGolem: 500,
  collectPowerUp: 50,
  checkpoint: 250,
};

export const COLORS = {
  // Wafer platform stripes
  waferPink: 0xe8a0b4,
  waferCream: 0xf5e6c8,
  waferChoc: 0x8b5c3a,
  waferEdge: 0xd4956a,

  // Toffee/concrete candy
  toffeeBase: 0x8b6914,
  toffeeDark: 0x5c4109,
  toffeeLight: 0xc49a2a,
  toffeeCrack: 0x3d2a00,

  // Crumble platform
  crumbleBase: 0xb0a090,
  crumbleDark: 0x7a6e62,
  crumbleLight: 0xd4cfc8,

  // Caramel platform
  caramelBase: 0xd4900a,
  caramelDark: 0x8b5e00,
  caramelLight: 0xffc93c,
  caramelDrip: 0xa06800,

  // World BG
  skyDeep: 0x0d0514,
  skyMid: 0x1a0a2e,
  skyHorizon: 0x2d1040,
};
