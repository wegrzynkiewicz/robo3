const size = 64;

const array: number[] = [];
Deno.bench("write array with index", () => {
  let i = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      array[index] = i++;
    }
  }
});

const array2: number[] = [];
Deno.bench("write array with armed index", () => {
  let i = 0;
  for (let y = 0; y < size; y++) {
    let index = y * size;
    for (let x = 0; x < size; x++) {
      array2[index++] = i++;
    }
  }
});

const array2D: number[][] = [];
for (let y = 0; y < size; y++) {
  array2D.push([]);
}
Deno.bench("write array 2 dim", () => {
  let i = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      array2D[y][x] = i++;
    }
  }
});

const typedArray = new Uint32Array(size * size);
Deno.bench("write typed array with index", () => {
  let i = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      typedArray[index] = i++;
    }
  }
});

Deno.bench("read array with index", () => {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const i = array[index];
    }
  }
});

Deno.bench("read array with armed index", () => {
  for (let y = 0; y < size; y++) {
    let index = y * size;
    for (let x = 0; x < size; x++) {
      const i = array2[index++];
    }
  }
});

Deno.bench("read array 2 dim", () => {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = array2D[y][x];
    }
  }
});

Deno.bench("read typed array with index", () => {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const i = typedArray[index];
    }
  }
});
