export interface Box1P {
  h: number;
  w: number;
  x: number;
  y: number;
}

export function box1P(x: number, y: number, w: number, h: number): Box1P {
  return { h, w, x, y };
}

export function intersects(r1: Box1P, r2: Box1P): boolean {
  return (
    r1.x + r1.w >= r2.x &&
    r1.x <= r2.x + r2.w &&
    r1.y + r1.h >= r2.y &&
    r1.y <= r2.y + r2.h
  );
}
