export type UniformMap = Record<string, WebGLUniformLocation | null>

export interface LinkedProgram {
  program: WebGLProgram
  uniforms: UniformMap
}

// Programa que comparte el vertex shader (lo borra quien lo creó) y conserva su fragment.
export interface SharedVertexProgram extends LinkedProgram {
  fragment: WebGLShader
}

export const compileShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

// Linkea un fragment contra un vertex ya compilado (GhostCursor). Atributo 0 = aPosition.
export const linkSharedVertex = (
  gl: WebGL2RenderingContext,
  vertex: WebGLShader | null,
  fragmentSource: string,
): SharedVertexProgram | null => {
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = vertex && fragment ? gl.createProgram() : null
  if (!vertex || !fragment || !program) {
    if (fragment) gl.deleteShader(fragment)
    return null
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'aPosition')
  gl.linkProgram(program)
  return { program, fragment, uniforms: {} }
}

// Valida el link, resuelve uniforms y loguea errores de compilación (GhostCursor).
export const inspectProgram = (gl: WebGL2RenderingContext, vertex: WebGLShader, item: SharedVertexProgram): boolean => {
  const linked = Boolean(gl.getProgramParameter(item.program, gl.LINK_STATUS))
  if (linked) {
    const count: number = gl.getProgramParameter(item.program, gl.ACTIVE_UNIFORMS)
    for (let index = 0; index < count; index++) {
      const info = gl.getActiveUniform(item.program, index)
      if (info) item.uniforms[info.name] = gl.getUniformLocation(item.program, info.name)
    }
  } else {
    const failed = [vertex, item.fragment].filter((shader) => !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    if (failed.length) failed.forEach((shader) => console.error(gl.getShaderInfoLog(shader)))
    else console.error(gl.getProgramInfoLog(item.program))
  }
  return linked
}

// Compila vertex + fragment, linkea y descarta los shaders sueltos (GradientASCII).
export const linkProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): LinkedProgram | null => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  return { program, uniforms: {} }
}

// Resuelve uniforms (quita el sufijo [0] de arrays). false si el link falló (GradientASCII).
export const resolveUniforms = (gl: WebGL2RenderingContext, item: LinkedProgram): boolean => {
  if (!gl.getProgramParameter(item.program, gl.LINK_STATUS)) return false
  const count: number = gl.getProgramParameter(item.program, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(item.program, i)
    if (!info) continue
    const name = info.name.replace(/\[0\]$/, '')
    item.uniforms[name] = gl.getUniformLocation(item.program, name)
  }
  return true
}
