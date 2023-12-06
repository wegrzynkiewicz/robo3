export interface Position {
  x: number;
  y: number;
  z: number;
}

export function position(x: number, y: number, z: number): Position {
  return { x, y, z };
}
