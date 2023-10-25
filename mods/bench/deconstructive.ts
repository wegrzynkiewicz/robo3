const cells = new Uint16Array(9);

Deno.bench("deconstructive", () => {
  const [vq, vw, ve, va, _vs, vd, vz, vx, vc] = cells;
});

Deno.bench("line-by-line", () => {
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
