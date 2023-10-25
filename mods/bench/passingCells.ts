const src = new Uint16Array(9);
const cells = new Uint16Array(9);

function processBuffer(cells: Uint16Array): number {
  const vq = cells[0];
  const vw = cells[1];
  const ve = cells[2];
  const va = cells[3];
  const vs = cells[4];
  const vd = cells[5];
  const vz = cells[6];
  const vx = cells[7];
  const vc = cells[8];

  return vq + vw + ve + va + vs + vd + vz + vx + vc;
}
Deno.bench("buffer", () => {
  cells[0] = src[0];
  cells[1] = src[1];
  cells[2] = src[2];
  cells[3] = src[3];
  cells[4] = src[4];
  cells[5] = src[5];
  cells[6] = src[6];
  cells[7] = src[7];
  cells[8] = src[8];
  processBuffer(cells);
});

function processArguments(
  vq: number,
  vw: number,
  ve: number,
  va: number,
  vs: number,
  vd: number,
  vz: number,
  vx: number,
  vc: number,
): number {
  return vq + vw + ve + va + vs + vd + vz + vx + vc;
}

Deno.bench("arguments", () => {
  const vq = src[0];
  const vw = src[1];
  const ve = src[2];
  const va = src[3];
  const vs = src[4];
  const vd = src[5];
  const vz = src[6];
  const vx = src[7];
  const vc = src[8];
  processArguments(vq, vw, ve, va, vs, vd, vz, vx, vc);
});
