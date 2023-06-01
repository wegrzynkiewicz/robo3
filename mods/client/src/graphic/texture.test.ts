import { assertEquals } from "../deps.ts";
import { index2coords, toTextureIndex } from "./texture.ts";

Deno.test("toTextureIndex", () => {
  assertEquals(toTextureIndex(3, 3, 3), 3171);
  assertEquals(toTextureIndex(4, 4, 4), 4228);
  assertEquals(toTextureIndex(2, 3, 4), 4194);
});

Deno.test("index2coords", () => {
  assertEquals(index2coords(3171), [3, 3, 3]);
  assertEquals(index2coords(4228), [4, 4, 4]);
  assertEquals(index2coords(4194), [2, 3, 4]);
});
