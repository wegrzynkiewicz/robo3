export interface DimensionalRectangle {
  h: number;
  w: number;
  x: number;
  y: number;
}

export function dimRect(x: number, y: number, w: number, h: number): DimensionalRectangle {
  return { h, w, x, y };
}

export function intersects(r1: DimensionalRectangle, r2: DimensionalRectangle): boolean {
  return (
    r1.x + r1.w >= r2.x &&
    r1.x <= r2.x + r2.w &&
    r1.y + r1.h >= r2.y &&
    r1.y <= r2.y + r2.h
  );
}
