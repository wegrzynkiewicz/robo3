interface Example {
  x: number;
  y: number;
  z: number;
  w: number;
}

const size = 4000;

const array: Example[] = [];
for (let x = 0; x < size; x++) {
  const element = { x, y: x, z: Math.floor(Math.random() * 255), w: 1 };
  array.push(element);
}

Deno.bench("sort", () => {
  array.sort((a, b) => a.z - b.z);
});

const sort = (a: Example, b: Example) => a.z - b.z
Deno.bench("sort with function", () => {
  array.sort(sort);
});

const output = new Uint16Array(65536);

const creating: Example[] = [];
Deno.bench("creating object", () => {
  creating.length = 0;
  for (let x = 0; x < size; x++) {
    const element = { x, y: x, z: Math.floor(Math.random() * 255), w: 1 };
    creating.push(element);
  }
  array.sort(sort);
  let index = 0;
  for (let x = 0; x < size; x++) {
    const element = array[x];
    output[index++] = element.x;
    output[index++] = element.y;
    output[index++] = element.z;
    output[index++] = element.z;
  }
});

const typedArray = new Uint16Array(size);
const indexes = new Uint16Array(size);
const sortTypedArray = (a: number, b: number) => typedArray[a * 4 + 2] - typedArray[b * 4 + 2];
Deno.bench("creating typedArray", () => {
  for (let x = 0; x < size; x++) {
    const index = x * 4;
    typedArray[index + 0] = x;
    typedArray[index + 1] = x;
    typedArray[index + 2] = Math.floor(Math.random() * 255);
    typedArray[index + 3] = 1;
    indexes[x] = x;
  }
  const toSort = new Uint16Array(indexes);
  toSort.sort(sortTypedArray);
  let index = 0;
  for (let x = 0; x < size; x++) {
    const srcIndex = toSort[x];
    output[index++] = typedArray[srcIndex + 0];
    output[index++] = typedArray[srcIndex + 1];
    output[index++] = typedArray[srcIndex + 2];
    output[index++] = typedArray[srcIndex + 3];
  }
});
