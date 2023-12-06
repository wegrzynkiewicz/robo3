import { assertEquals } from "../../deps.ts";
import { GONormChunkPosition } from "./position.ts";

Deno.test("GONormChunkPosition.fromChunkPosition", () => {
  const position = GONormChunkPosition.fromChunkPosition(2, 2, 2, 1024);
  assertEquals(position.index.toString(2), (0b0010_0000_0000_1000_0000_0000_0010_0000).toString(2));
});
