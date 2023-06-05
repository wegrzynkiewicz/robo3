import { assertEquals } from "../deps.ts";
import { coords2index, index2coords } from "./texture.ts";

Deno.test("coords2index", () => {
  assertEquals(coords2index(3, 3, 3), 3171);
  assertEquals(coords2index(4, 4, 4), 4228);
  assertEquals(coords2index(2, 3, 4), 4194);
});

Deno.test("index2coords", () => {
  assertEquals(index2coords(3171), [3, 3, 3]);
  assertEquals(index2coords(4228), [4, 4, 4]);
  assertEquals(index2coords(4194), [2, 3, 4]);
});
