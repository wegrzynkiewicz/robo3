const cells = new Uint16Array(9);

Deno.bench("typed array deconstructive", () => {
  const [vq, vw, ve, va, _vs, vd, vz, vx, vc] = cells;
});

Deno.bench("typed array line-by-line", () => {
  const vq = cells[0];
  const vw = cells[1];
  const ve = cells[2];
  const va = cells[3];
  const vs = cells[4];
  const vd = cells[5];
  const vz = cells[6];
  const vx = cells[7];
  const vc = cells[8];
});

const obj = { x: 1, y: 2, z: 3, w: 4 };

Deno.bench("object deconstructive", () => {
  const { x, y, z, w } = obj;
});

Deno.bench("object line-by-line", () => {
  const x = obj.x;
  const y = obj.y;
  const z = obj.z;
  const w = obj.w;
});
