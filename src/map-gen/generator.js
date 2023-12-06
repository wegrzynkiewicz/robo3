import { createNoise2D } from "https://esm.sh/simplex-noise@4.0.1"
import { NoiseGenerator } from "./NoiseGenerator.ts";

const seed = 0.9054922579831908;

const noise1 = createNoise2D(() => seed);
function normalize(v) {
  return v / 2 + 0.5;
}

const scale = 1;

window.ctx = {
  height: 1024,
  width: 1024,
  e1s: scale * 32,
  e1x: scale * 1,
  e1y: scale * 1,
  e2s: scale * 6,
  e2x: scale * 0.2,
  e2y: scale * 0.2,
  e3s: scale * 0.2,
  e3x: scale * 4,
  e3y: scale * 4,
};

function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const image = context.getImageData(0, 0, w, h);
  document.body.appendChild(canvas);
  return { context, image };
}

function heightMap(nx, ny, noise) {
  const e = 0 +
    4.000 * noise(0.25 * nx, 0.25 * ny) +
    2.000 * noise(0.5 * nx, 0.5 * ny) +
    1.000 * noise(1 * nx, 1 * ny) +
    0.500 * noise(2 * nx, 2 * ny) +
    0.250 * noise(4 * nx, 4 * ny) +
    // 0.125 * noise(8 * nx, 8 * ny);
    0;
  const value = e / (4 + 2 + 1.0 + 0.5 + 0.25 + 0.125);
  return value;
}

function fillCanvas(data, callback) {
  let i = 0;
  for (let y = 0; y < ctx.height; y++) {
    for (let x = 0; x < ctx.width; x++) {
      const nx = x / 1024;
      const ny = y / 1024;
      const value = callback(nx, ny);
      data[i++] = 255 * value;
      data[i++] = 255 * value;
      data[i++] = 255 * value;
      data[i++] = 255;
    }
  }
}

const { context, image } = createCanvas(1024, 1024);
const { context: ctx2, image: i2, } = createCanvas(1024, 1024);
function draw() {
  fillCanvas(image.data, (nx, ny) => {
    let v;
    let e1 = ctx.e1s * noise1(ctx.e1x * nx, ctx.e1y * ny);
    e1 *= 1.5;
    const e2 = ctx.e2s * noise1(ctx.e2x * nx, ctx.e2y * ny);
    const e3 = ctx.e3s * noise1(ctx.e3x * nx, ctx.e3y * ny);
    v = (e1 + e2 + e3) / (ctx.e1s + ctx.e2s + ctx.e3s);
    v = normalize(v);
    v = Math.round(v * 8) / 8;
    return v;
  });
  context.putImageData(image, 0, 0);

  const mg = new NoiseGenerator(seed);

  const buffer = new Uint8Array(1024);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const image = ctx2.getImageData(x * 32, y * 32, 32, 32);
      mg.genChunkTerrain(buffer, x, y);
      let i = 0;
      for (const color of buffer) {
        image.data[i++] = color;
        image.data[i++] = color;
        image.data[i++] = color;
        image.data[i++] = 255;
      }
      ctx2.putImageData(image, x * 32, y * 32);
    }
  }

}

function createRange(name, min, value, max, step, callback) {
  const span = document.createElement('span');
  span.innerText = value;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.name = name;
  slider.step = step;
  slider.addEventListener('input', () => {
    callback(parseFloat(slider.value));
    span.innerText = slider.value;
    draw();
  });

  const label = document.createElement('label');
  label.for = name;
  label.innerText = name;

  const br = document.createElement('br');

  const controls = document.getElementById('controls');
  controls.append(label, slider, span, br);
}

createRange('e1s', 0, ctx.e1s, 32, 0.005, v => ctx.e1s = v);
createRange('e1x', 0, ctx.e1x, 32, 0.005, v => ctx.e1x = v);
createRange('e1y', 0, ctx.e1y, 32, 0.005, v => ctx.e1y = v);
createRange('e2s', 0, ctx.e2s, 32, 0.01, v => ctx.e2s = v);
createRange('e2x', 0, ctx.e2x, 32, 0.01, v => ctx.e2x = v);
createRange('e2y', 0, ctx.e2y, 32, 0.01, v => ctx.e2y = v);
createRange('e3s', 0, ctx.e3s, 32, 0.01, v => ctx.e3s = v);
createRange('e3x', 0, ctx.e3x, 32, 0.01, v => ctx.e3x = v);
createRange('e3y', 0, ctx.e3y, 32, 0.01, v => ctx.e3y = v);
draw();



