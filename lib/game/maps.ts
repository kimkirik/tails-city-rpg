import { REGIONS } from './regions';
export const MAP_FRAMES = REGIONS.map(() => [1254, 1254] as const);
export const mapAsset = (region: number) => `/art/routes/${region}.png`;
