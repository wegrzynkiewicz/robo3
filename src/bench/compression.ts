import { deflate } from "../common/storage/deps.ts";

const u16a = new Uint16Array(32 * 32 * 1);
const u16v = new Uint8Array(u16a.buffer)
for (let i = 0; i < u16a.length / 2; i++) {
  u16a[i] = Math.random() * 32;
}
const o16 = deflate(u16v);
console.log('u16: ', u16v.length, 'o16: ', o16.length);

const u8a = new Uint8Array(32 * 32 * 1);
const u8v = new Uint8Array(u8a.buffer);
for (let i = 0; i < u8a.length / 2; i++) {
  u8a[i] = Math.random() * 32;
}
const o8 = deflate(u8v);
console.log('u8: ', u8v.length, 'o8: ', o8.length);
