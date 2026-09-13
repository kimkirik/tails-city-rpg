import { newGame } from './model.ts';
export function fieldGame() {
  const s = newGame();
  s.region = 0;
  s.visited = [0];
  s.y = 1190;
  return s;
}
