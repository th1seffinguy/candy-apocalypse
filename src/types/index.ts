export enum PlatformType {
  Toffee = 'toffee',
  Wafer = 'wafer',
  Crumble = 'crumble',
  Caramel = 'caramel',
}

export enum EnemyType {
  GummyBear = 'gummyBear',
  Jawbreaker = 'jawbreaker',
  CandyDrone = 'candyDrone',
  CaramelGolem = 'caramelGolem',
}

export enum PowerUpType {
  Gobstopper = 'gobstopper',
  RockCandyShard = 'shard',
  ToxicSyrup = 'toxicSyrup',
}

export enum SizeState {
  Normal = 'normal',
  Large = 'large',
}

export enum SceneKey {
  Boot = 'BootScene',
  Menu = 'MenuScene',
  Preview = 'PreviewScene',
  Game = 'GameScene',
  UI = 'UIScene',
  GameOver = 'GameOverScene',
}

export interface PlayerInputs {
  left: boolean;
  right: boolean;
  jumpJustDown: boolean;
  attackJustDown: boolean;
  onCaramel: boolean;
}

export interface LevelObjectProperty {
  name: string;
  type: string;
  value: unknown;
}

export interface LevelObjectData {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: LevelObjectProperty[];
}

export interface LevelLayer {
  id: number;
  name: string;
  type: string;
  objects: LevelObjectData[];
}

export interface LevelData {
  properties: LevelObjectProperty[];
  layers: LevelLayer[];
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface GameRegistryData {
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  activePowerUp: PowerUpType | null;
  shards: number;
  levelName: string;
}
