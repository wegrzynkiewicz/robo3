import { assertEquals } from "../../deps.ts";
import { ChunkId } from "./chunkId.ts";

Deno.test("encodeChunkId", () => {
  const chunkId = new ChunkId(1, 0x44, 0x55, 0x66);
  assertEquals(chunkId.toHex(), "00000001006600550044");
});

Deno.test("decodeChunkId", () => {
  const { spaceId, x, y, z  } = ChunkId.fromHex("00000001000400050006");
  assertEquals(spaceId, 1);
  assertEquals(z, 4);
  assertEquals(y, 5);
  assertEquals(x, 6);
});
