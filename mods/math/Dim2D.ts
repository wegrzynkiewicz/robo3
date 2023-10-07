export interface Dim2D {
  h: number;
  w: number;
}

export function dim2D(w: number, h: number): Dim2D {
  return { h, w };
}
