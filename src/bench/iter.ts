function* gen() {
  for (let i = 0; i < 1000; i++) {
    yield { i };
  }
}

const arrays = [
  [...gen()],
  [...gen()],
  [...gen()],
  [...gen()],
  [...gen()],
];

const sets = [
  new Set([...gen()]),
  new Set([...gen()]),
  new Set([...gen()]),
  new Set([...gen()]),
  new Set([...gen()]),
];

Deno.bench("array merging with push single", () => {
  const output = [];
  for (const array of arrays) {
    for (const element of array) {
      output.push(element);
    }
  }
});

Deno.bench("array merging with push and deconstructing", () => {
  const output = [];
  for (const array of arrays) {
    output.push(...array);
  }
});

Deno.bench("sets merging with loop & values()", () => {
  const output = new Set();
  for (const set of sets) {
    for (const element of set.values()) {
      output.add(element);
    }
  }
});
