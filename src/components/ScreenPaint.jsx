import { useEffect, useRef } from 'react'

// Réplica del "screen paint" de lusion.co: el mouse dibuja un campo de velocidad en un buffer
// de baja resolución (RGBA16F), que se disipa solo y se muestra como estela iridiscente.
// Parámetros tomados del JS de lusion: push 25, curl 0.02 / 3, disipaciones .975 / .95 / .8.

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG_UPDATE = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec4 uFrom;
uniform vec4 uTo;
uniform float uPush;
uniform vec3 uDiss;
uniform vec2 uVel;
uniform float uCurlScale;
uniform float uCurlStrength;
in vec2 vUv;
out vec4 o;

vec2 sdSegment(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
  return vec2(length(pa - ba * h), h);
}
vec2 hash(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}
vec3 noised(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
  vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
  vec2 ga = hash(i), gb = hash(i+vec2(1,0)), gc = hash(i+vec2(0,1)), gd = hash(i+vec2(1,1));
  float va = dot(ga, f), vb = dot(gb, f-vec2(1,0)), vc = dot(gc, f-vec2(0,1)), vd = dot(gd, f-vec2(1,1));
  return vec3(va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),
    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) + du*(u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
}
void main(){
  vec2 res = sdSegment(gl_FragCoord.xy, uFrom.xy, uTo.xy);
  vec2 radiusWeight = mix(uFrom.zw, uTo.zw, res.y);
  float d = 1.0 - smoothstep(-0.01, radiusWeight.x, res.x);
  vec4 low = texture(uPrev, vUv);
  vec2 velInv = (0.5 - low.xy) * uPush;
  vec3 n3 = noised(gl_FragCoord.xy * uCurlScale * (1.0 - low.xy));
  vec2 noise = noised(gl_FragCoord.xy * uCurlScale * (2.0 - low.xy * (0.5 + n3.x) + n3.yz * 0.1)).yz;
  velInv += noise * (low.z + low.w) * uCurlStrength;
  vec4 data = texture(uPrev, vUv + velInv * uTexel);
  data.xy -= 0.5;
  vec4 delta = (uDiss.xxyz - 1.0) * data;
  vec2 newVel = uVel * d;
  delta += vec4(newVel, radiusWeight.yy * d);
  delta.zw = sign(delta.zw) * max(vec2(0.004), abs(delta.zw));
  data += delta;
  data.xy += 0.5;
  o = clamp(data, vec4(0.0), vec4(1.0));
}`

const FRAG_DISPLAY = `#version 300 es
precision highp float;
uniform sampler2D uPaint;
uniform float uTime;
uniform float uStrength;
in vec2 vUv;
out vec4 o;
vec3 pal(float t){ return 0.55 + 0.35 * cos(6.28318 * (t * 0.6 + vec3(0.55, 0.7, 0.85))); }
void main(){
  vec4 p = texture(uPaint, vUv);
  float d = cos((vUv.x + vUv.y) * 4.0 + uTime) * 0.5 + 0.5;
  float hue = (p.x + p.y) * 1.5 + d * 2.0;
  float a = clamp(max(p.z, p.w) * uStrength, 0.0, 1.0);
  a = smoothstep(0.0, 1.0, a) * 0.75;
  vec3 c = pal(hue);
  o = vec4(c * a, a);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

function program(gl, frag) {
  const p = gl.createProgram()
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag))
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
  const u = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name
    u[name] = gl.getUniformLocation(p, name)
  }
  return { p, u }
}

const ScreenPaint = ({ strength = 1, className = '' }) => {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas.parentElement
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return

    let upd, dsp
    try {
      upd = program(gl, FRAG_UPDATE)
      dsp = program(gl, FRAG_DISPLAY)
    } catch (e) {
      console.warn('ScreenPaint', e)
      return
    }

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    let rts = []
    let rw = 1
    let rh = 1
    const makeRT = (w, h) => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const fbo = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.viewport(0, 0, w, h)
      gl.clearColor(0.5, 0.5, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { tex, fbo }
    }
    const freeRTs = () => rts.forEach((r) => { gl.deleteTexture(r.tex); gl.deleteFramebuffer(r.fbo) })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.floor(host.clientWidth * dpr))
      const h = Math.max(1, Math.floor(host.clientHeight * dpr))
      canvas.width = w
      canvas.height = h
      const nw = Math.max(2, w >> 2)
      const nh = Math.max(2, h >> 2)
      if (nw !== rw || nh !== rh || rts.length === 0) {
        freeRTs()
        rw = nw
        rh = nh
        rts = [makeRT(rw, rh), makeRT(rw, rh)]
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // Mouse en coordenadas del buffer (origen abajo-izquierda).
    const mouse = { x: 0, y: 0, px: 0, py: 0, moved: false, inside: false }
    const onMove = (e) => {
      const r = host.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = 1 - (e.clientY - r.top) / r.height
      mouse.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
      mouse.x = x
      mouse.y = y
      mouse.moved = true
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const from = [0, 0, 0, 0]
    const to = [0, 0, 0, 1]
    const vel = [0, 0]
    let time = 0
    let last = performance.now()
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting })
    io.observe(host)

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      if (!visible) { last = now; return }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt * 0.2

      const tx = mouse.x * rw
      const ty = mouse.y * rh
      const distPx = Math.hypot((mouse.x - mouse.px) * host.clientWidth, (mouse.y - mouse.py) * host.clientHeight)
      let radius = Math.min(distPx, 100) * 0.4 // radio máx ~40px
      if (!mouse.moved || !mouse.inside) radius = 0
      radius = (radius / host.clientHeight) * rh

      from[0] = to[0]; from[1] = to[1]; from[2] = to[2]; from[3] = to[3]
      to[0] = tx; to[1] = ty; to[2] = radius; to[3] = 1
      vel[0] = vel[0] * 0.8 + (to[0] - from[0]) * dt * 0.8
      vel[1] = vel[1] * 0.8 + (to[1] - from[1]) * dt * 0.8
      mouse.px = mouse.x
      mouse.py = mouse.y
      mouse.moved = false

      // ping-pong: rts[0] = prev, rts[1] = curr
      const prev = rts[0]
      const curr = rts[1]
      gl.useProgram(upd.p)
      gl.bindFramebuffer(gl.FRAMEBUFFER, curr.fbo)
      gl.viewport(0, 0, rw, rh)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, prev.tex)
      gl.uniform1i(upd.u.uPrev, 0)
      gl.uniform2f(upd.u.uTexel, 1 / rw, 1 / rh)
      gl.uniform4f(upd.u.uFrom, from[0], from[1], from[2], from[3])
      gl.uniform4f(upd.u.uTo, to[0], to[1], to[2], to[3])
      gl.uniform1f(upd.u.uPush, 25)
      gl.uniform3f(upd.u.uDiss, 0.975, 0.95, 0.8)
      gl.uniform2f(upd.u.uVel, vel[0], vel[1])
      gl.uniform1f(upd.u.uCurlScale, 0.02)
      gl.uniform1f(upd.u.uCurlStrength, 3)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(dsp.p)
      gl.bindTexture(gl.TEXTURE_2D, curr.tex)
      gl.uniform1i(dsp.u.uPaint, 0)
      gl.uniform1f(dsp.u.uTime, time * 5)
      gl.uniform1f(dsp.u.uStrength, strength)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.disable(gl.BLEND)

      rts = [curr, prev]
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      ro.disconnect()
      io.disconnect()
      freeRTs()
    }
  }, [strength])

  return <canvas ref={ref} className={`screen-paint ${className}`} aria-hidden="true" />
}

export default ScreenPaint
