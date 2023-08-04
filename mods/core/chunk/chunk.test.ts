import { assertEquals } from "../../deps.ts";
import { DecodedChunkId, decodeChunkId, encodeChunkId } from "./chunkId.ts";

Deno.test("encodeChunkId", () => {
  const decodeChunkId: DecodedChunkId = {
    spaceId: 1,
    position: {
      x: 0x44,
      y: 0x55,
      z: 0x66,
    }
  }
  const chunkId = encodeChunkId(decodeChunkId);
  assertEquals(chunkId, "00000001006600550044");
});

Deno.test("decodeChunkId", () => {
  const { position: { x, y, z }, spaceId } = decodeChunkId("00000001000400050006");
  assertEquals(spaceId, 1);
  assertEquals(z, 4);
  assertEquals(y, 5);
  assertEquals(x, 6);
});
