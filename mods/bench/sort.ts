interface Example {
  z: number;
}

const array: Example[] = [];
for (let x = 0; x < 1000; x++) {
  const element = { z: Math.floor(Math.random() * 255) };
  array.push(element);
}

Deno.bench("sort", () => {
  array.toSorted((a, b) => a.z - b.z);
});

const sort = (a: Example, b: Example) => a.z - b.z
Deno.bench("sort with function", () => {
  array.toSorted(sort);
});
