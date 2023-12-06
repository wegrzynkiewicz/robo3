const size = 64;
const ab = new ArrayBuffer(size ** 2);

const basicView = new Uint8Array(ab);

const chunk = {
  segment: {
    grid: {
      view: basicView,
    },
  },
};

const chunks: Record<number, Record<number, typeof chunk>> = {
  0: {
    0: chunk,
    1: chunk,
  },
  1: {
    0: chunk,
    1: chunk,
  },
};

Deno.bench("read chunk", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      for (let i = 0; i < 9; i++) {
        const chunkX = Math.floor(x / size);
        const chunkY = Math.floor(y / size);
        const chunk = chunks?.[chunkY]?.[chunkX];
        const tileX = x % size;
        const tileY = y % size;
        const srcIndex = tileY * size + tileX;
        const value = chunk.segment.grid.view[srcIndex];
      }
    }
  }
});

Deno.bench("read chunk2", () => {
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const srcIndex = y * size + x;
      const value = basicView[srcIndex];
      basicView[srcIndex] = value;
      for (let i = 0; i < 9; i++) {
        const value = basicView[srcIndex];
      }
    }
  }
});
