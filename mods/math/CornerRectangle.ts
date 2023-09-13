export interface CornerRectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function cornerRect(x1: number, y1: number, x2: number, y2: number): CornerRectangle {
  return { x1, y1, x2, y2 };
}

export function intersectsNonStrict(r1: CornerRectangle, r2: CornerRectangle): boolean {
  return (
    r1.x2 > r2.x1 &&
    r1.x1 < r2.x2 &&
    r1.y2 > r2.y1 &&
    r1.y1 < r2.y2
  );
}
