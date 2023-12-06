import { assertEquals } from "../deps.ts";
import { createCoordinatesCalculator, createIndexCalculator } from "./numbers.ts";

Deno.test("createIndexCalculator", () => {
  const coords2index = createIndexCalculator(32, 32);
  assertEquals(coords2index(3, 3, 3), 3171);
  assertEquals(coords2index(4, 4, 4), 4228);
  assertEquals(coords2index(2, 3, 4), 4194);
});

Deno.test("index2coords", () => {
  const index2coords = createCoordinatesCalculator(32, 32);
  assertEquals(index2coords(3171), [3, 3, 3]);
  assertEquals(index2coords(4228), [4, 4, 4]);
  assertEquals(index2coords(4194), [2, 3, 4]);
});
