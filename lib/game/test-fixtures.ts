import { routeSpawn } from './route-layouts.ts';
import { newGame } from './model.ts';
export function fieldGame() {
  const s = newGame();
  s.region = 0;
  s.visited = [0];
  Object.assign(s, routeSpawn(0));
  return s;
}
