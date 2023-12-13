import { deflate } from "../common/storage/deps.ts";

const u16 = new Uint16Array(32 * 32 * 64);
const u16v = new Uint8Array(u16.buffer);
for (const i of u16.keys()) {
  u16[i] = Math.random() * 64;
}

const u8 = new Uint8Array(32 * 32 * 64);
const u8v = new Uint8Array(u8.buffer);
for (const i of u8.keys()) {
  u8[i] = Math.random() * 64;
}

const o16 = deflate(u16v);
const o8 = deflate(u8v);

console.log(u16.length * 2, '-', u8.length, '=', u16.length * 2 - u8.length);
console.log(o16.length, '-', o8.length, '=', o16.length - o8.length);
console.log(u16.length * 2 - o16.length, '-', u8.length - o8.length, '=');
