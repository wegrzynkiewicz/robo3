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
        this.name = "StateError";
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
function assertNonNegativeNumber(value, message, data) {
    if (typeof value !== "number" || value < 0 || isNaN(value)) {
        __throws(message, data);
    }
}
const SPRITES_COUNT_PER_AXIS = 512 / 32;
const SPRITE_STRIDE_NORMALIZED = 32 / 512;
function toShaderLine(va) {
    const { location , name , shaderType  } = va;
    return `layout(location = ${location}) in ${shaderType} ${name};`;
}
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
    assertNonNegativeNumber(location, "attribute-location-not-found-in-shader", {
        vertexAttribute
    });
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
const vertexPosition = {
    accessor: Float32Array,
    axes: 2,
    byteSize: 4,
    divisor: 0,
    glType: WebGL2RenderingContext.FLOAT,
    isInteger: false,
    isSigned: false,
    location: 0,
    name: "a_vertexPosition",
    normalize: false,
    shaderType: "vec2",
    totalByteSize: 8
};
const vertexTextureCoords = {
    accessor: Float32Array,
    axes: 2,
    byteSize: 4,
    divisor: 0,
    glType: WebGL2RenderingContext.FLOAT,
    isInteger: false,
    isSigned: false,
    location: 1,
    name: "a_vertexTextureCoords",
    normalize: false,
    shaderType: "vec2",
    totalByteSize: 8
};
const blockPosition = {
    accessor: Uint8Array,
    axes: 2,
    byteSize: 1,
    divisor: 1,
    glType: WebGL2RenderingContext.UNSIGNED_BYTE,
    isInteger: true,
    isSigned: false,
    location: 2,
    name: "a_blockPosition",
    normalize: false,
    shaderType: "uvec2",
    totalByteSize: 2
};
const blockTextureIndex = {
    accessor: Uint16Array,
    axes: 1,
    byteSize: 2,
    divisor: 1,
    glType: WebGL2RenderingContext.UNSIGNED_SHORT,
    isInteger: true,
    isSigned: false,
    location: 3,
    name: "a_blockTextureIndex",
    normalize: false,
    shaderType: "uint",
    totalByteSize: 2
};
({
    accessor: Uint8Array,
    axes: 1,
    byteSize: 1,
    divisor: 1,
    glType: WebGL2RenderingContext.UNSIGNED_BYTE,
    isInteger: true,
    isSigned: false,
    location: 4,
    name: "a_blockTextureAtlas",
    normalize: false,
    shaderType: "uint",
    totalByteSize: 1
});
const vertexShader = `#version 300 es

${toShaderLine(vertexPosition)}
${toShaderLine(vertexTextureCoords)}
${toShaderLine(blockPosition)}
${toShaderLine(blockTextureIndex)}

out vec2 v_texCoords;
out vec2 v_color;
out vec2 v_color2;
flat out ivec2 texture4;

struct PerTile {
  ivec4 position;
  ivec4 textures;
};

uniform instanced {
  PerTile test[10];
};

uniform mat4 u_Projection;

uint SPRITES_COUNT_PER_AXIS = uint(${SPRITES_COUNT_PER_AXIS});
float SPRITE_STRIDE_NORMALIZED = ${SPRITE_STRIDE_NORMALIZED};

vec2 calcTextureCoords() {
  uint col = a_blockTextureIndex % SPRITES_COUNT_PER_AXIS;
  uint row = a_blockTextureIndex / SPRITES_COUNT_PER_AXIS;
  return vec2(
    a_vertexTextureCoords.x + SPRITE_STRIDE_NORMALIZED * float(col),
    a_vertexTextureCoords.y + SPRITE_STRIDE_NORMALIZED * float(row)
  );
}

void main(void) {
    gl_Position = u_Projection * vec4(a_vertexPosition * 32.0 + float(gl_InstanceID) * 32.0, 0.0, 1.0);
    v_texCoords = calcTextureCoords();
    v_color = calcTextureCoords();
    v_color2 = vec2(float(a_blockPosition), 0.0);
}

`;
const fragmentShader = `#version 300 es

in highp vec2 v_texCoords;
in highp vec2 v_color;
in highp vec2 v_color2;
flat in highp ivec2 texture4;

out highp vec4 outputColor;

uniform sampler2D u_texture;

void main(void) {
  outputColor = vec4(texture(u_texture, v_texCoords).xyz, 1.0);
//   outputColor = vec4(v_color, 0.0, 1.0);
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
        SPRITE_STRIDE_NORMALIZED,
        0,
        SPRITE_STRIDE_NORMALIZED,
        SPRITE_STRIDE_NORMALIZED,
        0,
        SPRITE_STRIDE_NORMALIZED
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
    const buffer = new ArrayBuffer(16);
    const dv = new DataView(buffer);
    let n = 0;
    dv.setUint8(n + 0, 0);
    dv.setUint8(n + 1, 0);
    dv.setUint16(n + 2, 1, true);
    n += 4;
    dv.setUint8(n + 0, 1);
    dv.setUint8(n + 1, 1);
    dv.setUint16(n + 2, 2, true);
    n += 4;
    dv.setUint8(n + 0, 2);
    dv.setUint8(n + 1, 2);
    dv.setUint16(n + 2, 3, true);
    n += 4;
    dv.setUint8(n + 0, 3);
    dv.setUint8(n + 1, 3);
    dv.setUint16(n + 2, 4, true);
    n += 4;
    const glBlockBuffer = gl.createBuffer();
    assertNonNull(glBlockBuffer, "cannot-create-block-buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, glBlockBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
    const totalByteStride = blockPosition.totalByteSize + blockTextureIndex.totalByteSize;
    initVertexAttribute({
        byteOffset: 0,
        byteStride: totalByteStride,
        gl,
        glProgram,
        vertexAttribute: blockPosition
    });
    initVertexAttribute({
        byteOffset: blockPosition.totalByteSize,
        byteStride: totalByteStride,
        gl,
        glProgram,
        vertexAttribute: blockTextureIndex
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
    gl.uniformBlockBinding(glProgram, gl.getUniformBlockIndex(glProgram, 'instanced'), 0);
    const redMatUniformBlockBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, redMatUniformBlockBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(80).fill(1.0), gl.STATIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, redMatUniformBlockBuffer);
    return {
        glBlockBuffer,
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
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: false
});
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);
const img = new Image();
let updateTexture = ()=>{};
const onLoadedImage = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
};
img.addEventListener("load", ()=>{
    onLoadedImage();
});
img.src = "2.png";
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
assertNonNull(nearestSampler, 'cannot-create-nearest-sampler');
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.samplerParameteri(nearestSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindSampler(0, nearestSampler);
const ab = new ArrayBuffer(4 * 100);
const dv = new DataView(ab);
let n = 0;
for(let y = 0; y < 10; y++){
    for(let x = 0; x < 10; x++){
        dv.setUint8(n + 0, y);
        dv.setUint8(n + 1, x);
        dv.setUint16(n + 2, Math.random() * 256, true);
        n += 4;
    }
}
const { glProgram , glVAOGrid , glBlockBuffer  } = initGridProgram(gl);
gl.bindBuffer(gl.ARRAY_BUFFER, glBlockBuffer);
gl.bufferData(gl.ARRAY_BUFFER, ab, gl.DYNAMIC_DRAW);
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
    console.log(canvas.width, 'x', canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
function drawScene(now) {
    now *= 0.001;
    now;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 4);
    updateTexture();
    requestAnimationFrame(drawScene);
}
drawScene(0);
