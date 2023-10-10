const src = new Uint16Array(1024);
const dst = new Uint16Array(1024);

Deno.bench("total", () => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const index = y * 32 + x;
      const value = src[index];
      dst[index] = value;
    }
  }
});

Deno.bench("partial", () => {
  for (let y = 16; y < 32; y++) {
    for (let x = 16; x < 32; x++) {
      const index = y * 32 + x;
      const value = src[index];
      dst[index] = value;
    }
  }
});
