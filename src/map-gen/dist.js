// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var M1 = .5 * (Math.sqrt(3) - 1), r1 = (3 - Math.sqrt(3)) / 6, W = (Z)=>Math.floor(Z) | 0, h1 = new Float64Array([
    1,
    1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1,
    0,
    0,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1
]), A1 = new Float64Array([
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    0,
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1
]), i1 = new Float64Array([
    0,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    1,
    0,
    1,
    1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    1,
    0,
    1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0
]);
function S1(Z = Math.random) {
    let t = G1(Z), i = new Float64Array(t).map((a)=>h1[a % 12 * 2]), n = new Float64Array(t).map((a)=>h1[a % 12 * 2 + 1]);
    return function(f, m) {
        let G = 0, h = 0, M = 0, b = (f + m) * M1, z = W(f + b), A = W(m + b), D = (z + A) * r1, P = z - D, T = A - D, u = f - P, F = m - T, S, q;
        u > F ? (S = 1, q = 0) : (S = 0, q = 1);
        let U = u - S + r1, p = F - q + r1, d = u - 1 + 2 * r1, g = F - 1 + 2 * r1, j = z & 255, k = A & 255, s = .5 - u * u - F * F;
        if (s >= 0) {
            let o = j + t[k], w = i[o], x = n[o];
            s *= s, G = s * s * (w * u + x * F);
        }
        let c = .5 - U * U - p * p;
        if (c >= 0) {
            let o = j + S + t[k + q], w = i[o], x = n[o];
            c *= c, h = c * c * (w * U + x * p);
        }
        let e = .5 - d * d - g * g;
        if (e >= 0) {
            let o = j + 1 + t[k + 1], w = i[o], x = n[o];
            e *= e, M = e * e * (w * d + x * g);
        }
        return 70 * (G + h + M);
    };
}
function G1(Z) {
    let i = new Uint8Array(512);
    for(let n = 0; n < 512 / 2; n++)i[n] = n;
    for(let n = 0; n < 512 / 2 - 1; n++){
        let a = n + ~~(Z() * (256 - n)), f = i[n];
        i[n] = i[a], i[a] = f;
    }
    for(let n = 256; n < 512; n++)i[n] = i[n - 256];
    return i;
}
class NoiseGenerator {
    seed;
    noise;
    constructor(seed){
        this.seed = seed;
        this.noise = S1(()=>seed);
    }
    genChunkTerrain(buffer, offsetX, offsetY) {
        const noise = this.noise;
        let i = 0;
        let e = 0;
        for(let y = 0; y < 32; y++){
            for(let x = 0; x < 32; x++){
                const nx = (x + offsetX * 32) / 1024;
                const ny = (y + offsetY * 32) / 1024;
                const e1 = 4.0 * noise(0.20 * nx, 0.20 * ny);
                const e2 = 2.0 * noise(2.00 * nx, 2.00 * ny);
                const e3 = 1.0 * noise(4.00 * nx, 4.00 * ny);
                const e4 = 0.1 * noise(30.00 * nx, 30.00 * ny);
                e = (e1 + e2 + e3 + e4) / (4.0 + 2.0 + 1.0 + 0.1);
                e = e / 2 + 0.5;
                e = Math.round(e * 16) / 16;
                e = e * 255;
                buffer[i++] = e;
            }
        }
    }
}
const noise1 = S1(()=>0.9054922579831908);
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
    e3y: scale * 4
};
function createCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d', {
        willReadFrequently: true
    });
    const image = context.getImageData(0, 0, w, h);
    document.body.appendChild(canvas);
    return {
        context,
        image
    };
}
function fillCanvas(data, callback) {
    let i = 0;
    for(let y = 0; y < ctx.height; y++){
        for(let x = 0; x < ctx.width; x++){
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
const { context , image  } = createCanvas(1024, 1024);
const { context: ctx2 , image: i2  } = createCanvas(1024, 1024);
function draw() {
    fillCanvas(image.data, (nx, ny)=>{
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
    const mg = new NoiseGenerator(0.9054922579831908);
    const buffer = new Uint8Array(1024);
    for(let y = 0; y < 32; y++){
        for(let x = 0; x < 32; x++){
            const image = ctx2.getImageData(x * 32, y * 32, 32, 32);
            mg.genChunkTerrain(buffer, x, y);
            let i = 0;
            for (const color of buffer){
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
    slider.addEventListener('input', ()=>{
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
createRange('e1s', 0, ctx.e1s, 32, 0.005, (v)=>ctx.e1s = v);
createRange('e1x', 0, ctx.e1x, 32, 0.005, (v)=>ctx.e1x = v);
createRange('e1y', 0, ctx.e1y, 32, 0.005, (v)=>ctx.e1y = v);
createRange('e2s', 0, ctx.e2s, 32, 0.01, (v)=>ctx.e2s = v);
createRange('e2x', 0, ctx.e2x, 32, 0.01, (v)=>ctx.e2x = v);
createRange('e2y', 0, ctx.e2y, 32, 0.01, (v)=>ctx.e2y = v);
createRange('e3s', 0, ctx.e3s, 32, 0.01, (v)=>ctx.e3s = v);
createRange('e3x', 0, ctx.e3x, 32, 0.01, (v)=>ctx.e3x = v);
createRange('e3y', 0, ctx.e3y, 32, 0.01, (v)=>ctx.e3y = v);
draw();
