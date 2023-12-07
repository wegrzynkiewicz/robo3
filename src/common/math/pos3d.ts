export interface Pos3D {
  x: number;
  y: number;
  z: number;
}

export function pos3D(x: number, y: number, z: number): Pos3D {
  return { x, y, z };
}
