export interface Box2P {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function box2P(x1: number, y1: number, x2: number, y2: number): Box2P {
  return { x1, y1, x2, y2 };
}

export function intersectsNonStrict(r1: Box2P, r2: Box2P): boolean {
  return (
    r1.x2 > r2.x1 &&
    r1.x1 < r2.x2 &&
    r1.y2 > r2.y1 &&
    r1.y1 < r2.y2
  );
}

export function getIntersection(r1: Box2P, r2: Box2P): Box2P {
  const x1 = Math.max(r1.x1, r2.x1);
  const y1 = Math.max(r1.y1, r2.y1);
  const x2 = Math.min(r1.x2, r2.x2);
  const y2 = Math.min(r1.y2, r2.y2);
  return { x1, y1, x2, y2 };
}
