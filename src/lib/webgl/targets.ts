// Render targets. Dos familias: float16 de un adjunto (GhostCursor) y RGBA8 multi-adjunto (GradientASCII).

export interface FloatTarget {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
  width: number
  height: number
}

export const createFloatTarget = (gl: WebGL2RenderingContext): FloatTarget => {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const framebuffer = gl.createFramebuffer()
  return { texture, framebuffer, width: 0, height: 0 }
}

// Reasigna la textura (y la limpia). Devuelve false si el tamaño no cambió.
export const allocateFloatTarget = (
  gl: WebGL2RenderingContext,
  target: FloatTarget,
  width: number,
  height: number,
): boolean => {
  if (target.width === width && target.height === height) return false
  target.width = width
  target.height = height
  gl.bindTexture(gl.TEXTURE_2D, target.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  return true
}

export interface MultiTarget {
  textures: WebGLTexture[]
  framebuffer: WebGLFramebuffer
  width: number
  height: number
}

export const createMultiTarget = (gl: WebGL2RenderingContext, count: number): MultiTarget => {
  const textures = Array.from({ length: count }, () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
  })
  return { textures, framebuffer: gl.createFramebuffer(), width: 0, height: 0 }
}

export const sizeMultiTarget = (gl: WebGL2RenderingContext, target: MultiTarget, width: number, height: number): void => {
  if (target.width === width && target.height === height) return
  target.width = width
  target.height = height
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  target.textures.forEach((texture, i) => {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0)
  })
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}
