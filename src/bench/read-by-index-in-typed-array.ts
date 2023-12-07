const size = 64;
const ab = new ArrayBuffer(size ** 2);

const basicView = new Uint8Array(ab);

const yView: Uint8Array[] = [];
for (let i = 0; i < size; i++) {
  yView.push(new Uint8Array(ab, i * size, 64));
}

Deno.bench("basic read", () => {
  let accumulator = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const value = basicView[index];
      accumulator += value;
    }
  }
});

Deno.bench("yView read", () => {
  let accumulator = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = yView[y][x];
      accumulator += value;
    }
  }
});

Deno.bench("basic 3x3", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const v0 = basicView[(y - 1) * size + (x - 1)];
      const v1 = basicView[(y - 1) * size + (x + 0)];
      const v2 = basicView[(y - 1) * size + (x + 1)];
      const v3 = basicView[(y + 0) * size + (x - 1)];
      const v4 = basicView[(y + 0) * size + (x + 0)];
      const v5 = basicView[(y + 0) * size + (x + 1)];
      const v6 = basicView[(y + 1) * size + (x - 1)];
      const v7 = basicView[(y + 1) * size + (x + 0)];
      const v8 = basicView[(y + 1) * size + (x + 1)];
      const va = v0 + v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8;
    }
  }
});

Deno.bench("yView 3x3", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const v0 = yView[y - 1][x - 1];
      const v1 = yView[y - 1][x + 0];
      const v2 = yView[y - 1][x + 1];
      const v3 = yView[y + 0][x - 1];
      const v4 = yView[y + 0][x + 0];
      const v5 = yView[y + 0][x + 1];
      const v6 = yView[y + 1][x - 1];
      const v7 = yView[y + 1][x + 0];
      const v8 = yView[y + 1][x + 1];
      const va = v0 + v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8;
    }
  }
});

const rt = new Uint8Array(9);

Deno.bench("basic 3x3 reader typed", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      rt[0] = basicView[(y - 1) * size + (x - 1)];
      rt[1] = basicView[(y - 1) * size + (x + 0)];
      rt[2] = basicView[(y - 1) * size + (x + 1)];
      rt[3] = basicView[(y + 0) * size + (x - 1)];
      rt[4] = basicView[(y + 0) * size + (x + 0)];
      rt[5] = basicView[(y + 0) * size + (x + 1)];
      rt[6] = basicView[(y + 1) * size + (x - 1)];
      rt[7] = basicView[(y + 1) * size + (x + 0)];
      rt[8] = basicView[(y + 1) * size + (x + 1)];
      const rta = rt[0] + rt[1] + rt[2] + rt[3] + rt[4] + rt[5] + rt[6] + rt[7] + rt[8];
    }
  }
});

const ra: number[] = [];

Deno.bench("basic 3x3 reader array", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      ra[0] = basicView[(y - 1) * size + (x - 1)];
      ra[1] = basicView[(y - 1) * size + (x + 0)];
      ra[2] = basicView[(y - 1) * size + (x + 1)];
      ra[3] = basicView[(y + 0) * size + (x - 1)];
      ra[4] = basicView[(y + 0) * size + (x + 0)];
      ra[5] = basicView[(y + 0) * size + (x + 1)];
      ra[6] = basicView[(y + 1) * size + (x - 1)];
      ra[7] = basicView[(y + 1) * size + (x + 0)];
      ra[8] = basicView[(y + 1) * size + (x + 1)];
      const raa = ra[0] + ra[1] + ra[2] + ra[3] + ra[4] + ra[5] + ra[6] + ra[7] + ra[8];
    }
  }
});
