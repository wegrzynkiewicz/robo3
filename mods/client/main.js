// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Breaker extends Error {
    options;
    constructor(message, data){
        const { error , cause , ...others } = data ?? {};
        super(message, {
            cause: cause ?? error
        });
        this.name = "Breaker";
        this.options = data ?? {};
        const json = JSON.stringify(others);
        this.stack += `\n    with parameters ${json}.`;
        if (error) {
            this.stack += `\n    cause error ${error instanceof Error ? error.stack : error}.`;
        }
    }
}
function __throws(message, data) {
    throw new Breaker(message, data);
}
function assertTrue(value, message, data) {
    if (value !== true) {
        __throws(message, data);
    }
}
function assertNonNull(value, message, data) {
    if (value === null) {
        __throws(message, data);
    }
}
function assertObject(value, message, data) {
    if (typeof value !== "object" || value === null) {
        throw new Breaker(message, data);
    }
}
function assertRequiredString(value, message, data) {
    if (typeof value !== "string" || value === "") {
        __throws(message, data);
    }
}
function isPositiveNumber(value) {
    return typeof value === "number" && value >= 0 && !isNaN(value);
}
function assertPositiveNumber(value, message, data) {
    if (!isPositiveNumber(value)) {
        __throws(message, data);
    }
}
function generateHighContrastColor(index, maxIndex) {
    const hue = Math.floor(index / maxIndex * 360);
    const rgb = hslToRgb(hue, 100, 50);
    return rgb;
}
function hueToRgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
        g = Math.round(hueToRgb(p, q, h) * 255);
        b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
    }
    return [
        r,
        g,
        b
    ];
}
const TILES_TEXTURE_SIZE = 256;
const TILES_PER_TEXTURE_AXIS = Math.floor(256 / 32);
const TILES_PER_TEXTURE = TILES_PER_TEXTURE_AXIS ** 2;
const TILE_STRIDE_NORMALIZED = 32 / 256;
function coords2index(x, y, z) {
    return z * TILES_PER_TEXTURE + y * TILES_PER_TEXTURE_AXIS + x;
}
function index2coords(index) {
    const z = Math.floor(index / TILES_PER_TEXTURE);
    const y = Math.floor(index % TILES_PER_TEXTURE / TILES_PER_TEXTURE_AXIS);
    const x = index % TILES_PER_TEXTURE_AXIS;
    return [
        x,
        y,
        z
    ];
}
function coords2ImageRect(x, y) {
    const s = x * 32;
    const t = (TILES_PER_TEXTURE_AXIS - y - 1) * 32;
    return [
        s,
        t
    ];
}
const { Deno  } = globalThis;
typeof Deno?.noColor === "boolean" ? Deno.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
].join("|"), "g");
var DiffType;
(function(DiffType) {
    DiffType["removed"] = "removed";
    DiffType["common"] = "common";
    DiffType["added"] = "added";
})(DiffType || (DiffType = {}));
function deferred() {
    let methods;
    let state = "pending";
    const promise = new Promise((resolve, reject)=>{
        methods = {
            async resolve (value) {
                await value;
                state = "fulfilled";
                resolve(value);
            },
            reject (reason) {
                state = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", {
        get: ()=>state
    });
    return Object.assign(promise, methods);
}
function loadImage({ height , src , width  }) {
    const promise = deferred();
    const image = new Image();
    image.src = src;
    image.onload = ()=>{
        try {
            assertTrue(image.width === width, "unexpected-image-width", {
                src,
                imageWidth: image.width,
                width
            });
            assertTrue(image.height === height, "unexpected-image-height", {
                src,
                imageHeight: image.height,
                height
            });
        } catch (error) {
            promise.reject(error);
            return;
        }
        promise.resolve(image);
    };
    return promise;
}
async function processTileSet(data) {
    assertObject(data, "invalid-tile-set-structure");
    const { image , imageheight , imagewidth , tilecount , tileheight , tilewidth  } = data;
    assertRequiredString(image, "tile-set-image-should-be-required-string", {
        data,
        image
    });
    assertPositiveNumber(imagewidth, "tile-set-image-width-should-be-positive-number", {
        data,
        imagewidth
    });
    assertPositiveNumber(imageheight, "tile-set-image-height-should-be-positive-number", {
        data,
        imageheight
    });
    assertPositiveNumber(tilecount, "tile-set-tile-count-should-be-positive-number", {
        data,
        tilecount
    });
    assertTrue(tilewidth === 32, "tile-set-tile-height-should-be-32", {
        data,
        tilewidth
    });
    assertTrue(tileheight === 32, "tile-set-tile-height-should-be-32", {
        data,
        tileheight
    });
    const imageSrc = new URL(`${window.location}assets/${image}`);
    const htmlImage = await loadImage({
        height: imageheight,
        src: imageSrc.toString(),
        width: imagewidth
    });
    const contexts = loadTiles({
        tileAtlases: [
            {
                image: htmlImage
            }
        ]
    });
    return contexts[0].getImageData(0, 0, 256, 256);
}
async function processMap() {
    const request = await fetch("./assets/kafelki.tsj");
    const json = await request.json();
    return processTileSet(json);
}
function createContext2D(width, height) {
    const canvas = document.createElement("canvas");
    assertTrue(width % 32 === 0, `canvas-width-must-be-multiples-of-${32}`, {
        width
    });
    assertTrue(height % 32 === 0, `canvas-height-must-be-multiples-of-${32}`, {
        height
    });
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", {
        willReadFrequently: true,
        alpha: true
    });
    assertNonNull(context, "cannot-create-context-from-canvas");
    return context;
}
function* getTilesFromCanvasContext(context) {
    const { canvas  } = context;
    const { height , width  } = canvas;
    const tilesPerWidth = Math.floor(width / 32);
    const tilesPerHeight = Math.floor(height / 32);
    for(let y = 0; y < tilesPerHeight; y++){
        for(let x = 0; x < tilesPerWidth; x++){
            const tileImageData = context.getImageData(x * 32, y * 32, 32, 32, {
                colorSpace: "display-p3"
            });
            yield tileImageData;
        }
    }
}
function createTextureTileHelper(r, g, b) {
    const tile = new ImageData(32, 32);
    const buffer = tile.data;
    let pixelIndex = 0;
    for(let y = 0; y < 32; y++){
        for(let x = 0; x < 32; x++){
            const paint = x % 2 === 1 || y % 2 === 0;
            buffer[pixelIndex + 0] = paint ? r : 0xFF;
            buffer[pixelIndex + 1] = paint ? g : 0x00;
            buffer[pixelIndex + 2] = paint ? b : 0xFF;
            buffer[pixelIndex + 3] = 0xFF;
            pixelIndex += 4;
        }
    }
    return tile;
}
class TilesTextureAllocator {
    contexts = [];
    textureIndex = 0;
    currentZ = -1;
    currentTargetContext;
    insert(image) {
        let [x, y, z] = index2coords(this.textureIndex);
        if (z !== this.currentZ) {
            this.currentZ = z;
            this.currentTargetContext = createContext2D(TILES_TEXTURE_SIZE, TILES_TEXTURE_SIZE);
            this.contexts.push(this.currentTargetContext);
            this.textureIndex++;
            [x, y] = index2coords(this.textureIndex);
        }
        const [s, t] = coords2ImageRect(x, y);
        this.currentTargetContext.putImageData(image, s, t);
        this.textureIndex++;
    }
    paintHelperTiles() {
        const countOfContexts = this.contexts.length;
        const [s, t] = coords2ImageRect(0, 0);
        for(let z = 0; z < countOfContexts; z++){
            const context = this.contexts[z];
            const [r, g, b] = generateHighContrastColor(z, countOfContexts);
            const helperTile = createTextureTileHelper(r, g, b);
            context.putImageData(helperTile, s, t);
        }
    }
}
function loadTiles({ tileAtlases  }) {
    const tilesTextureAllocator = new TilesTextureAllocator();
    for (const atlas of tileAtlases){
        const { image  } = atlas;
        const sourceContext = createContext2D(image.width, image.height);
        sourceContext.drawImage(image, 0, 0);
        const tiles = getTilesFromCanvasContext(sourceContext);
        for (const tileImage of tiles){
            tilesTextureAllocator.insert(tileImage);
        }
    }
    tilesTextureAllocator.paintHelperTiles();
    tilesTextureAllocator.contexts.map((c)=>document.body.appendChild(c.canvas));
    return tilesTextureAllocator.contexts;
}
function toShaderLine(va) {
    const { location , name , shaderType  } = va;
    return `layout(location = ${location}) in ${shaderType} ${name};`;
}
({
    accessor: Float32Array,
    axes: 4,
    byteSize: 4,
    divisor: 1,
    glType: WebGL2RenderingContext.FLOAT,
    isInteger: false,
    isSigned: false,
    location: 5,
    name: "a_blockAlpha",
    normalize: false,
    shaderType: "vec4",
    totalByteSize: 16
});
function resolveIntegerTypeByByte(__byte) {
    switch(__byte){
        case 1:
            return WebGL2RenderingContext["BYTE"];
        case 2:
            return WebGL2RenderingContext["SHORT"];
        case 4:
            return WebGL2RenderingContext["INT"];
        default:
            return 0;
    }
}
function attribute(text) {
    const segments = text.split(":");
    const [location, structure, name, divisor] = segments;
    const chars = structure.split("");
    const type = chars.shift();
    let glType = WebGL2RenderingContext["FLOAT"];
    let axes = 1;
    let isInteger = false;
    let isSigned = false;
    let shaderType = "";
    if (type === "v") {
        axes = parseInt(chars.shift());
    }
    const scalar = chars.shift();
    const byteSize = parseInt(chars.shift());
    switch(scalar){
        case "b":
            {
                glType = WebGL2RenderingContext["BOOL"];
                shaderType = axes > 1 ? `bvec${axes}` : "bool";
                break;
            }
        case "f":
            {
                shaderType = axes > 1 ? `vec${axes}` : "float";
                break;
            }
        case "i":
            {
                isSigned = true;
                isInteger = true;
                glType = resolveIntegerTypeByByte(byteSize);
                shaderType = axes > 1 ? `ivec${axes}` : "int";
                break;
            }
        case "u":
            {
                isInteger = true;
                glType = resolveIntegerTypeByByte(byteSize) + 1;
                shaderType = axes > 1 ? `uvec${axes}` : "uint";
            }
    }
    const totalByteSize = byteSize * axes;
    return {
        accessor: Float32Array,
        axes,
        byteSize,
        divisor: divisor ? parseInt(divisor) : 0,
        glType,
        isInteger,
        isSigned,
        location: parseInt(location),
        name,
        normalize: false,
        shaderType,
        totalByteSize
    };
}
const logger = {
    warn: console.warn,
    info: console.info
};
function createShader(gl, type, shaderSource) {
    const shader = gl.createShader(type);
    assertObject(shader, "shader-cannot-be-created", {
        gl,
        type,
        shaderSource
    });
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const infoLog = gl.getShaderInfoLog(shader);
        throw new Breaker("shader-cannot-be-compiled", {
            gl,
            infoLog,
            type,
            shaderSource
        });
    }
    return shader;
}
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    assertObject(program, "program-cannot-be-created", {
        fragmentShaderSource,
        gl,
        program,
        vertexShaderSource
    });
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const infoLog = gl.getProgramInfoLog(program);
        throw new Breaker("program-cannot-be-linked", {
            gl,
            infoLog,
            program,
            fragmentShaderSource,
            vertexShaderSource
        });
    }
    return program;
}
function getActiveUniformBlockParameters(gl, program, ubi) {
    const binding = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_BINDING);
    const dataSize = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_DATA_SIZE);
    const activeUniforms = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS);
    const activeUniformIndices = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
    const referencedByVertexShader = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER);
    const referencedByFragmentShader = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER);
    return {
        activeUniformIndices,
        activeUniforms,
        binding,
        dataSize,
        referencedByFragmentShader,
        referencedByVertexShader
    };
}
function getActiveUniformParameters(gl, program, uniformIndex) {
    const [type] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_TYPE);
    const [size] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_SIZE);
    const [blockIndex] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_BLOCK_INDEX);
    const [offset] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_OFFSET);
    const [arrayStride] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_ARRAY_STRIDE);
    const [matrixStride] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_MATRIX_STRIDE);
    const [isRowMajor] = gl.getActiveUniforms(program, [
        uniformIndex
    ], gl.UNIFORM_IS_ROW_MAJOR);
    return {
        arrayStride,
        blockIndex,
        isRowMajor,
        matrixStride,
        offset,
        size,
        type
    };
}
function getUniformBlocksInfo(gl, program) {
    const activeUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
    const blocks = [];
    for(let i = 0; i < activeUniformBlocks; i++){
        const blockName = gl.getActiveUniformBlockName(program, i);
        if (blockName === null) {
            break;
        }
        const blockIndex = gl.getUniformBlockIndex(program, blockName);
        const parameters = getActiveUniformBlockParameters(gl, program, blockIndex);
        const uniforms = [];
        for (const activeUniformIndex of parameters.activeUniformIndices){
            const uniformInfo = gl.getActiveUniform(program, activeUniformIndex);
            if (uniformInfo === null) {
                throw new Error("invalid-uniform-info");
            }
            const uniform = {
                name: uniformInfo.name,
                uniformIndex: activeUniformIndex,
                ...getActiveUniformParameters(gl, program, activeUniformIndex)
            };
            uniforms.push(uniform);
        }
        const block = {
            blockIndex,
            blockName,
            ...parameters,
            uniforms
        };
        blocks.push(block);
    }
    return blocks;
}
function getUniformInfo(gl, program) {
    const activeUniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniforms = [];
    for(let index = 0; index < activeUniformsCount; index++){
        const info = gl.getActiveUniform(program, index);
        if (info === null) {
            break;
        }
        const uniform = {
            name: info.name,
            ...getActiveUniformParameters(gl, program, index)
        };
        uniforms.push(uniform);
    }
    return uniforms;
}
function initVertexAttribute({ byteOffset , byteStride , gl , glProgram , vertexAttribute  }) {
    const { axes , divisor , glType , isInteger , name , normalize  } = vertexAttribute;
    const location = gl.getAttribLocation(glProgram, name);
    if (!isPositiveNumber(location)) {
        logger.warn("attribute-location-not-found-in-shader", {
            vertexAttribute
        });
        return;
    }
    gl.enableVertexAttribArray(location);
    if (isInteger) {
        gl.vertexAttribIPointer(location, axes, glType, byteStride, byteOffset);
    } else {
        gl.vertexAttribPointer(location, axes, glType, normalize, byteStride, byteOffset);
    }
    if (divisor > 0) {
        gl.vertexAttribDivisor(location, divisor);
    }
}
const vertexPosition = attribute("0:v2f4:a_vertexPosition:0");
const vertexTextureCoords = attribute("1:v2f4:a_vertexTextureCoords:0");
const tilePosition = attribute("2:v2f4:a_tilePosition:1");
const tileTextureIndex = attribute("3:si4:a_tileTextureIndex:1");
const tileTextureAtlas = attribute("4:su4:a_tileTextureAtlas:1");
const tileAlpha = attribute("5:sf4:a_tileAlpha:1");
const vertexShader = `#version 300 es

${toShaderLine(vertexPosition)}
${toShaderLine(vertexTextureCoords)}
${toShaderLine(tilePosition)}
${toShaderLine(tileTextureIndex)}
${toShaderLine(tileAlpha)}

out vec3 v_texCoords;
out vec3 v_color;
out vec2 v_color2;
out float alpha;
flat out ivec2 texture4;

struct PerTile {
  ivec4 position;
  ivec4 textures;
};

uniform instanced {
  PerTile test[10];
};

uniform mat4 u_Projection;

float TILE_STRIDE_NORMALIZED = ${TILE_STRIDE_NORMALIZED};

int TILES_PER_TEXTURE = ${TILES_PER_TEXTURE};
int TILES_PER_TEXTURE_AXIS = ${TILES_PER_TEXTURE_AXIS};

vec3 getTileTextureCoords(int index) {
//   float z = float(index >> 10);
//   float y = float(index % 1024 >> 5) * TILE_STRIDE_NORMALIZED;
//   float x = float(index % 32) * TILE_STRIDE_NORMALIZED;

  float z = float(index / TILES_PER_TEXTURE);
  float y = float((index % TILES_PER_TEXTURE) / TILES_PER_TEXTURE_AXIS) * TILE_STRIDE_NORMALIZED;
  float x = float(index % TILES_PER_TEXTURE_AXIS) * TILE_STRIDE_NORMALIZED;
  return vec3(x, y, z);
}

void main(void) {
    gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + a_tilePosition, 0.0, 1.0);
    // gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + float(gl_InstanceID) * 32.0, 0.0, 1.0);
    v_texCoords = vec3(a_vertexTextureCoords, 0.0) + getTileTextureCoords(a_tileTextureIndex);
    v_color = vec3(1.0, 1.0, 0.0);
    v_color2 = vec2(float(a_tilePosition.x), 0.0);
}

`;
const fragmentShader = `#version 300 es

in highp vec3 v_texCoords;
in highp vec3 v_color;
in highp vec2 v_color2;
in highp float alpha;
flat in highp ivec2 texture4;

out highp vec4 outputColor;

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords.xy));
//   outputColor = vec4(v_texCoords, 1.0);
}
`;
function initGridProgram(gl) {
    const glProgram = createProgram(gl, vertexShader, fragmentShader);
    const glVAOGrid = gl.createVertexArray();
    assertNonNull(glVAOGrid, "cannot-create-vertex-array-object");
    gl.bindVertexArray(glVAOGrid);
    const perVertexBuffer = new ArrayBuffer((vertexPosition.totalByteSize + vertexTextureCoords.totalByteSize) * 4);
    const positionAccessor = new vertexPosition.accessor(perVertexBuffer, 0, vertexPosition.axes * 4);
    positionAccessor.set([
        0,
        0,
        1,
        0,
        1,
        1,
        0,
        1
    ]);
    const textureCoordsOffset = vertexPosition.totalByteSize * 4;
    const textureAccessor = new vertexTextureCoords.accessor(perVertexBuffer, textureCoordsOffset, vertexTextureCoords.axes * 4);
    textureAccessor.set([
        0,
        0,
        TILE_STRIDE_NORMALIZED,
        0,
        TILE_STRIDE_NORMALIZED,
        TILE_STRIDE_NORMALIZED,
        0,
        TILE_STRIDE_NORMALIZED
    ]);
    const glPerVertexBuffer = gl.createBuffer();
    assertNonNull(glPerVertexBuffer, "cannot-create-vertex-buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, glPerVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, perVertexBuffer, gl.STATIC_DRAW);
    initVertexAttribute({
        byteOffset: 0,
        byteStride: 0,
        gl,
        glProgram,
        vertexAttribute: vertexPosition
    });
    initVertexAttribute({
        byteOffset: textureCoordsOffset,
        byteStride: 0,
        gl,
        glProgram,
        vertexAttribute: vertexTextureCoords
    });
    const glTilesBuffer = gl.createBuffer();
    assertNonNull(glTilesBuffer, "cannot-create-tile-buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
    const totalByteStride = tilePosition.totalByteSize + tileTextureIndex.totalByteSize + tileAlpha.totalByteSize;
    initVertexAttribute({
        byteOffset: 0,
        byteStride: totalByteStride,
        gl,
        glProgram,
        vertexAttribute: tilePosition
    });
    initVertexAttribute({
        byteOffset: tilePosition.totalByteSize,
        byteStride: totalByteStride,
        gl,
        glProgram,
        vertexAttribute: tileTextureIndex
    });
    initVertexAttribute({
        byteOffset: tilePosition.totalByteSize + tileTextureAtlas.totalByteSize,
        byteStride: totalByteStride,
        gl,
        glProgram,
        vertexAttribute: tileAlpha
    });
    const indicesBuffer = new Uint8Array([
        0,
        1,
        2,
        0,
        2,
        3
    ]);
    const glIndicesBuffer = gl.createBuffer();
    assertNonNull(glIndicesBuffer, "cannot-create-element-array-buffer");
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.uniformBlockBinding(glProgram, gl.getUniformBlockIndex(glProgram, "instanced"), 0);
    const redMatUniformBlockBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, redMatUniformBlockBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(80).fill(1.0), gl.STATIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, redMatUniformBlockBuffer);
    return {
        glTilesBuffer,
        glIndicesBuffer,
        glPerVertexBuffer,
        glProgram,
        glVAOGrid
    };
}
function ortho(out, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
}
document.addEventListener("DOMContentLoaded", ()=>{});
const canvas = document.getElementById("primary-canvas");
assertNonNull(canvas, "cannot-find-primary-canvas");
const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: true,
    alpha: false
});
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);
const img = new Image();
let updateTexture = ()=>{};
img.addEventListener("load", ()=>{});
img.src = "./assets/1.png";
processMap().then((imageData)=>{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    gl.generateMipmap(gl.TEXTURE_2D);
});
{
    gl.R8;
    gl.RED;
    gl.UNSIGNED_BYTE;
    new Uint8Array([
        128,
        64,
        128,
        0,
        192,
        0
    ]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
        0,
        0,
        255,
        255
    ]));
}const nearestSampler = gl.createSampler();
assertNonNull(nearestSampler, "cannot-create-nearest-sampler");
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindSampler(0, nearestSampler);
const ab = new ArrayBuffer(20 * 8024);
const ta = new Float32Array(ab);
const ia = new Int32Array(ab);
const { glProgram , glVAOGrid , glTilesBuffer  } = initGridProgram(gl);
function load() {
    let n = 0;
    for(let y = 0; y < 20; y++){
        for(let x = 0; x < 20; x++){
            ta[n + 0] = x * 32.0;
            ta[n + 1] = y * 32.0;
            ia[n + 2] = 40;
            ta[n + 3] = 1;
            n += 4;
        }
    }
    for(let y = 2; y < 6; y++){
        for(let x = 2; x < 6; x++){
            ta[n + 0] = x * 32.0;
            ta[n + 1] = y * 32.0;
            ia[n + 2] = coords2index(4, 7, 0);
            ta[n + 3] = 1;
            n += 4;
        }
    }
    for(let y = 2; y <= 6; y++){
        for(let x = 10; x <= 14; x++){
            ta[n + 0] = x * 32.0;
            ta[n + 1] = y * 32.0;
            ia[n + 2] = 56;
            ta[n + 3] = 1;
            n += 4;
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, glTilesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
}
console.log({
    ab
});
load();
gl.useProgram(glProgram);
const projectionLoc1 = gl.getUniformLocation(glProgram, "u_Projection");
const textureLoc1 = gl.getUniformLocation(glProgram, "u_texture");
console.log(getUniformBlocksInfo(gl, glProgram));
console.log(getUniformInfo(gl, glProgram));
gl.bindVertexArray(glVAOGrid);
const projection = new Float32Array(16);
gl.uniformMatrix4fv(projectionLoc1, false, projection);
gl.uniform1i(textureLoc1, 0);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.BLEND);
const datas = [
    [
        "ZERO",
        gl.ZERO
    ],
    [
        "ONE",
        gl.ONE
    ],
    [
        "SRC_COLOR",
        gl.SRC_COLOR
    ],
    [
        "ONE_MINUS_SRC_COLOR",
        gl.ONE_MINUS_SRC_COLOR
    ],
    [
        "DST_COLOR",
        gl.DST_COLOR
    ],
    [
        "ONE_MINUS_DST_COLOR",
        gl.ONE_MINUS_DST_COLOR
    ],
    [
        "SRC_ALPHA",
        gl.SRC_ALPHA
    ],
    [
        "ONE_MINUS_SRC_ALPHA",
        gl.ONE_MINUS_SRC_ALPHA
    ],
    [
        "DST_ALPHA",
        gl.DST_ALPHA
    ],
    [
        "ONE_MINUS_DST_ALPHA",
        gl.ONE_MINUS_DST_ALPHA
    ],
    [
        "CONSTANT_COLOR",
        gl.CONSTANT_COLOR
    ],
    [
        "ONE_MINUS_CONSTANT_COLOR",
        gl.ONE_MINUS_CONSTANT_COLOR
    ],
    [
        "CONSTANT_ALPHA",
        gl.CONSTANT_ALPHA
    ],
    [
        "ONE_MINUS_CONSTANT_ALPHA",
        gl.ONE_MINUS_CONSTANT_ALPHA
    ],
    [
        "SRC_ALPHA_SATURATE",
        gl.SRC_ALPHA_SATURATE
    ]
];
let sb = 0;
let eb = 0;
document.addEventListener("keypress", (event)=>{
    if (event.key === "q") {
        sb += 1;
    }
    if (event.key === "z") {
        sb -= 1;
    }
    if (event.key === "e") {
        eb += 1;
    }
    if (event.key === "c") {
        eb -= 1;
    }
    console.log(datas[sb][0], "----", datas[eb][0]);
    gl.blendFunc(datas[sb][1], datas[eb][1]);
});
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
document.querySelector("#fps");
const count = 2 ** 16;
const ab1 = new ArrayBuffer(count);
console.log(count);
console.log(ab1);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ortho(projection, 0, canvas.width / 2, 0, canvas.height / 2, -10, 10);
    gl.uniformMatrix4fv(projectionLoc1, false, projection);
    gl.viewport(20, 20, canvas.width, canvas.height);
    console.log(canvas.width, "x", canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
function drawScene(now) {
    now *= 0.001;
    now;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 560);
    updateTexture();
    requestAnimationFrame(drawScene);
}
drawScene(0);
