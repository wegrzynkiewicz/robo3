const size = 32;

const src = new Uint16Array(size ** 2);
const dst = new Uint16Array(size ** 2);

Deno.bench("total", () => {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const value = src[index];
      dst[index] = value;
    }
  }
});

Deno.bench("partial", () => {
  for (let y = size / 2; y < size; y++) {
    for (let x = size / 2; x < size; x++) {
      const index = y * size + x;
      const value = src[index];
      dst[index] = value;
    }
  }
});

Deno.bench("subarray", () => {
  for (let y = 0; y < size; y++) {
    const index = y * size;
    dst.set(src.subarray(index, index + size), index);
  }
});
