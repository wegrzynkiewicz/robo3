import { Buffer } from "https://deno.land/std@0.160.0/io/buffer.ts";
import { writeAll } from "https://deno.land/std@0.160.0/streams/conversion.ts";

const size = 32 * 32 * 4;
const b = new Uint8Array(size);

for (let y = 0; y < size; y++) {
  b[y] = Math.random() * 2 ** 4;
}

const stream = new CompressionStream("deflate");
const reader = stream.readable.pipeTo(Deno.stdout.writable);
const writer = stream.writable.getWriter();
writer.write(b);
