// import { Buffer } from "https://deno.land/std@0.160.0/io/buffer.ts";
// import { writeAll } from "https://deno.land/std@0.160.0/streams/conversion.ts";

// const size = 32 * 32 * 4;
// const b = new Uint8Array(size);

// for (let y = 0; y < size; y++) {
//   b[y] = Math.random() * 2 ** 4;
// }

// const stream = new CompressionStream("deflate");
// const reader = stream.readable.pipeTo(Deno.stdout.writable);
// const writer = stream.writable.getWriter();
// writer.write(b);

const json = {
  "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 54, 0, 0, 0, 9, 10, 0, 0, 279, 280, 0, 263, 264, 0, 54, 0, 11, 12, 173, 0, 17, 18, 0, 0, 287, 288, 0, 271, 272, 0, 0, 0, 19, 20, 0, 0, 0, 58, 0, 0, 0, 0, 0, 54, 0, 0, 52, 0, 176, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 0, 0, 49, 0, 179, 185, 185, 185, 185, 185, 180, 57, 47, 48, 868, 0, 0, 0, 0, 0, 177, 0, 0, 0, 0, 0, 177, 0, 725, 228, 0, 50, 0, 0, 0, 0, 177, 0, 68, 0, 68, 0, 177, 0, 0, 0, 0, 0, 0, 0, 0, 0, 177, 0, 68, 0, 69, 0, 177, 0, 153, 154, 154, 155, 0, 0, 0, 49, 177, 0, 68, 0, 68, 0, 177, 0, 161, 162, 162, 163, 0, 0, 0, 0, 177, 0, 68, 0, 69, 0, 177, 0, 169, 170, 170, 171, 0, 0, 49, 0, 177, 0, 0, 0, 0, 0, 177, 0, 0, 0, 0, 0, 0, 0, 0, 0, 187, 924, 181, 0, 0, 189, 188, 0, 0, 50, 0, 0, 0, 0, 13, 14, 0, 932, 0, 0, 0, 0, 0, 230, 0, 0, 15, 16, 0, 0, 21, 22, 0, 0, 50, 0, 0, 0, 0, 238, 229, 0, 23, 24, 0, 56, 0, 0, 0, 0, 0, 0, 50, 0, 50, 0, 0, 46, 0, 0, 0,],
  "height": 16,
  "width": 16,
  "x": 0,
  "y": 0,
};

const json2 = {
  "data": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
  "height": 16,
  "width": 16,
  "x": 0,
  "y": 0,
};

function arrayChunk<T>(arr: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  const len = arr.length;

  for (let i = 0; i < len; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
}

function compress(binary: any) {
  const hexChars: string[] = [];
  for (const byte of binary) {
    const hexByte = byte.toString(16).padStart(2, "0");
    hexChars.push(hexByte);
  }
  for (const chunk of arrayChunk(hexChars, 16)) {
    console.log(chunk.join(" "));
  }
}

import { decode, encode } from "https://deno.land/std/encoding/base64.ts";
import { deflate, inflate } from "https://deno.land/x/compress@v0.4.5/zlib/mod.ts";

const blocks: { pos: number; id: number }[] = [];
let z = 0;
function add(data: number[]) {
  let pos = 0;
  for (const id of data) {
    if (id) {
      blocks.push({ pos: z * 262144 + pos, id });
    }
    pos++;
  }
}
// add(json2.data);
add(json.data);

const ar = new Uint32Array(blocks.length * 2);

let i = 0;
for (const { pos, id } of blocks) {
  ar[i] = id;
  ar[i + 1] = pos;
  i += 2;
}

const g3 = new Uint8Array(ar.buffer);
const data9 = deflate(g3);
console.log("ilosc blokow łącznie w danej:", ar.length);
console.log("ilosc bajtow nieskompresowanych:", g3.length);
console.log("ilosc bajtow skompresowanych:", data9.length);

// const data = "eAGlUUlOQkEUbHDBIPO8gxMwhRBwrTfxUgwb0A0YE4i6MOAxvAG49AxUQ1XSdJoFoZP69V69qtdJf2OuP30vkkCfdLRqxJgaYE8MHGet3D30FPBuDTh5oHCsTp86\/A1msuAca1mKKEpqyA9er1Z32r5HcaXhDaxddkWHez7A3wF8QhsCLaANPN\/hEzjrgGYl6b9RY3b0dANe+R45E0sPRM4k+ZR74lT6CP2YmJwlT28gn\/Ji6TNk5sSLl7etfMr59y\/gWRJvNsDTISsvXXxJ11y8QTHFv\/mSAP4Btk4fevc05hl6Xi\/82z9nRxZ1zunLqCtOH7rjH\/M9PVVwjfWAHCLtEVtP0zMeAKEkJu0=";

// const data2 = decode(data);
// const data3 = inflate(data2);
// const ar4 = new Uint32Array(data3.buffer);
// compress(ar4);
// console.log(ar4);
// console.log(data2);
// console.log(data3);

const grid2 = Uint32Array.from(json2.data).buffer;
const grid1 = Uint32Array.from(json.data).buffer;
const g1 = new Uint8Array(grid1);
const g2 = new Uint8Array(grid2);

const summary = new Uint8Array(g1.length + g2.length);
summary.set(g1, 0);
summary.set(g2, g1.length);

const data5 = deflate(g1);
const data6 = deflate(g2);
const data7 = deflate(summary);
console.log("ilosc bajtow w nieskompresowanym gridzie lacznie:", summary.length);
console.log("ilosc bajtow w skompresowanym pierwszy gridzie", data5.length);
console.log("ilosc bajtow w skompresowanym drugim gridzie:", data6.length);
console.log("ilosc bajtow w skompresowanych obydwu gridach:", data7.length);
