import { assertNonNull, assertObject } from "../../../common/utils/asserts.ts";
import { Breaker } from "../../../common/utils/breaker.ts";

export type GL = WebGL2RenderingContext;

export function createShader(
  gl: GL,
  type: GL["VERTEX_SHADER"] | GL["FRAGMENT_SHADER"],
  shaderSource: string,
): WebGLShader {
  const shader = gl.createShader(type);
  assertObject(shader, "shader-cannot-be-created", { gl, type, shaderSource });
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const infoLog = gl.getShaderInfoLog(shader);
    throw new Breaker("shader-cannot-be-compiled", { gl, infoLog, type, shaderSource });
  }
  return shader;
}

export function createProgram(
  gl: GL,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  assertObject(program, "program-cannot-be-created", { fragmentShaderSource, gl, program, vertexShaderSource });
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
      vertexShaderSource,
    });
  }
  return program;
}

export function createTexture(gl: GL): WebGLTexture {
  const texture = gl.createTexture();
  assertNonNull(texture, "cannot-create-texture");
  return texture;
}

export function createBuffer(gl: GL): WebGLBuffer {
  const buffer = gl.createBuffer();
  assertNonNull(buffer, "cannot-create-array-buffer");
  return buffer;
}

export function createSampler(gl: GL): WebGLSampler {
  const sampler = gl.createSampler();
  assertNonNull(sampler, "cannot-create-sampler");
  return sampler;
}

export function createVertexArray(gl: GL): WebGLVertexArrayObject {
  const vao = gl.createVertexArray();
  assertNonNull(vao, "cannot-create-vertex-array-object");
  gl.bindVertexArray(vao);
  return vao;
}

export function getProgramLocation(gl: GL, glProgram: WebGLProgram, locationName: string): WebGLUniformLocation {
  const location = gl.getUniformLocation(glProgram, locationName);
  assertNonNull(location, "cannot-get-uniform-location", { locationName });
  return location;
}

export function getProgramParameters(gl: GL, program: WebGLProgram) {
  const activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  const activeUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
  const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const attachedShaders = gl.getProgramParameter(program, gl.ATTACHED_SHADERS);
  const deleteStatus = gl.getProgramParameter(program, gl.DELETE_STATUS);
  const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
  const transformFeedbackBufferMode = gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_BUFFER_MODE);
  const transformFeedbackVaryings = gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_VARYINGS);
  const validateStatus = gl.getProgramParameter(program, gl.VALIDATE_STATUS);

  return {
    activeAttributes,
    activeUniformBlocks,
    activeUniforms,
    attachedShaders,
    deleteStatus,
    linkStatus,
    transformFeedbackBufferMode,
    transformFeedbackVaryings,
    validateStatus,
  };
}

export function getActiveUniformBlockParameters(
  gl: GL,
  program: WebGLProgram,
  ubi: number,
): {
  activeUniformIndices: number[];
  activeUniforms: unknown;
  binding: unknown;
  dataSize: unknown;
  referencedByFragmentShader: unknown;
  referencedByVertexShader: unknown;
} {
  const binding = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_BINDING);
  const dataSize = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_DATA_SIZE);
  const activeUniforms = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS);
  const activeUniformIndices = gl.getActiveUniformBlockParameter(program, ubi, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
  const referencedByVertexShader = gl.getActiveUniformBlockParameter(
    program,
    ubi,
    gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER,
  );
  const referencedByFragmentShader = gl.getActiveUniformBlockParameter(
    program,
    ubi,
    gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER,
  );
  return {
    activeUniformIndices,
    activeUniforms,
    binding,
    dataSize,
    referencedByFragmentShader,
    referencedByVertexShader,
  };
}

export function getActiveUniformParameters(gl: GL, program: WebGLProgram, uniformIndex: number) {
  const [type] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_TYPE);
  const [size] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_SIZE);
  const [blockIndex] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_BLOCK_INDEX);
  const [offset] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_OFFSET);
  const [arrayStride] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_ARRAY_STRIDE);
  const [matrixStride] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_MATRIX_STRIDE);
  const [isRowMajor] = gl.getActiveUniforms(program, [uniformIndex], gl.UNIFORM_IS_ROW_MAJOR);
  return {
    arrayStride,
    blockIndex,
    isRowMajor,
    matrixStride,
    offset,
    size,
    type,
  };
}

export function getUniformBlocksInfo(gl: GL, program: WebGLProgram) {
  const activeUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
  const blocks = [];
  for (let i = 0; i < activeUniformBlocks; i++) {
    const blockName = gl.getActiveUniformBlockName(program, i);
    if (blockName === null) {
      break;
    }
    const blockIndex = gl.getUniformBlockIndex(program, blockName);
    const parameters = getActiveUniformBlockParameters(gl, program, blockIndex);
    const uniforms = [];
    for (const activeUniformIndex of parameters.activeUniformIndices) {
      const uniformInfo = gl.getActiveUniform(program, activeUniformIndex);
      if (uniformInfo === null) {
        throw new Error("invalid-uniform-info");
      }
      const uniform = {
        name: uniformInfo.name,
        uniformIndex: activeUniformIndex,
        ...getActiveUniformParameters(gl, program, activeUniformIndex),
      };
      uniforms.push(uniform);
    }
    const block = {
      blockIndex,
      blockName,
      ...parameters,
      uniforms,
    };
    blocks.push(block);
  }
  return blocks;
}

export function getUniformInfo(gl: GL, program: WebGLProgram) {
  const activeUniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  const uniforms = [];
  for (let index = 0; index < activeUniformsCount; index++) {
    const info = gl.getActiveUniform(program, index);
    if (info === null) {
      break;
    }
    const uniform = {
      name: info.name,
      ...getActiveUniformParameters(gl, program, index),
    };
    uniforms.push(uniform);
  }
  return uniforms;
}
