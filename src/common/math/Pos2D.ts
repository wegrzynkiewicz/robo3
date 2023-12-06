export interface Pos2D {
  x: number;
  y: number;
}

export function pos2D(x: number, y: number): Pos2D {
  return { x, y };
}
