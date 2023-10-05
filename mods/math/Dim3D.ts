export interface Dim3D {
  d: number;
  h: number;
  w: number;
}

export function dim3D(w: number, h: number, d: number): Dim3D {
  return { d, h, w };
}
