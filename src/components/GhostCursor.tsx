'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './GhostCursor.css';
import { VERTEX, SIM, SHADE, DOWN, BLUR, COMPOSITE } from '@/shaders/ghostCursor';
import { clamp } from '@/lib/math';
import { parseColor } from '@/lib/webgl/color';
import { compileShader, linkSharedVertex, inspectProgram } from '@/lib/webgl/program';
import type { SharedVertexProgram } from '@/lib/webgl/program';
import { createFloatTarget, allocateFloatTarget } from '@/lib/webgl/targets';
import type { FloatTarget } from '@/lib/webgl/targets';

const INTRO_MS = 1900;

export interface GhostCursorProps {
  color?: string;
  brightness?: number;
  size?: number;
  trailLength?: number;
  inertia?: number;
  turbulence?: number;
  drift?: number;
  detail?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  edgeIntensity?: number;
  clickPuff?: boolean;
  intro?: boolean;
  theme?: 'dark' | 'light';
  mixBlendMode?: CSSProperties['mixBlendMode'];
  fadeDelayMs?: number;
  fadeDurationMs?: number;
  maxDevicePixelRatio?: number;
  targetPixels?: number;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
}

interface Puff {
  x: number;
  y: number;
}

const GhostCursor = ({
  color = '#B497CF',
  brightness = 1,
  size = 80,
  trailLength = 50,
  inertia = 0.5,
  turbulence = 0.5,
  drift = 0.3,
  detail = 1,
  grainIntensity = 0.05,
  bloomStrength = 0.6,
  bloomRadius = 1,
  bloomThreshold = 0.025,
  edgeIntensity = 0,
  clickPuff = true,
  intro = true,
  theme = 'dark',
  mixBlendMode,
  fadeDelayMs,
  fadeDurationMs,
  maxDevicePixelRatio = 2,
  targetPixels,
  zIndex = 10,
  className = '',
  style
}: GhostCursorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const releaseRef = useRef(0);
  const [generation, setGeneration] = useState(0);
  const [touch] = useState(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  const light = theme === 'light';
  const settings = {
    color: parseColor(color).map(channel => Math.pow(channel, 2.2)),
    brightness: Math.max(0, brightness),
    size: Math.max(8, size),
    trail: clamp(trailLength, 1, 200),
    inertia: clamp(inertia, 0, 0.99),
    turbulence: clamp(turbulence, 0, 2),
    drift,
    detail: clamp(detail, 0, 1),
    grain: clamp(grainIntensity, 0, 1),
    bloom: Math.max(0, bloomStrength),
    bloomRadius: clamp(bloomRadius, 0, 3),
    threshold: Math.max(0, bloomThreshold),
    edge: clamp(edgeIntensity, 0, 1),
    clickPuff,
    intro,
    theme: light ? 1 : 0,
    fadeDelay: Math.max(0, fadeDelayMs ?? (touch ? 500 : 1000)),
    fadeDuration: Math.max(1, fadeDurationMs ?? (touch ? 1000 : 1500)),
    maxRatio: clamp(maxDevicePixelRatio, 0.25, 3),
    budget: Math.max(5e4, targetPixels ?? (touch ? 3e5 : 6e5))
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    window.clearTimeout(releaseRef.current);
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const parent = container?.parentElement;
    if (!container || !canvas || !parent) return;

    const previousPosition = parent.style.position;
    const reposition = getComputedStyle(parent).position === 'static';
    if (reposition) parent.style.position = 'relative';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'default'
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      if (reposition) parent.style.position = previousPosition;
      return;
    }
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
    const linked = [
      linkSharedVertex(gl, vertex, SIM),
      linkSharedVertex(gl, vertex, SHADE),
      linkSharedVertex(gl, vertex, DOWN),
      linkSharedVertex(gl, vertex, BLUR),
      linkSharedVertex(gl, vertex, COMPOSITE)
    ];
    const [simProgram, shadeProgram, downProgram, blurProgram, compositeProgram] = linked;
    let ready = false;
    let broken = false;

    const complete = () =>
      !parallel || linked.every(item => !item || gl.getProgramParameter(item.program, parallel.COMPLETION_STATUS_KHR));

    const discard = () => {
      if (gl.isContextLost()) return;
      if (!ready && !complete()) {
        requestAnimationFrame(discard);
        return;
      }
      for (const item of linked) {
        if (!item) continue;
        gl.deleteShader(item.fragment);
        gl.deleteProgram(item.program);
      }
      gl.deleteShader(vertex);
    };

    if (!vertex || !simProgram || !shadeProgram || !downProgram || !blurProgram || !compositeProgram) {
      discard();
      if (reposition) parent.style.position = previousPosition;
      return;
    }
    const programs: Record<'sim' | 'shade' | 'down' | 'blur' | 'composite', SharedVertexProgram> = {
      sim: simProgram,
      shade: shadeProgram,
      down: downProgram,
      blur: blurProgram,
      composite: compositeProgram
    };

    const finish = () => {
      if (!complete()) return false;
      for (const item of Object.values(programs)) if (!inspectProgram(gl, vertex, item)) broken = true;
      ready = true;
      return true;
    };

    if (!parallel) finish();
    if (broken) {
      discard();
      if (reposition) parent.style.position = previousPosition;
      return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const createTarget = () => createFloatTarget(gl);
    const allocate = (target: FloatTarget, width: number, height: number) => allocateFloatTarget(gl, target, width, height);

    const sims = [createTarget(), createTarget()];
    const shade = createTarget();
    const downs = [createTarget(), createTarget(), createTarget()];
    const blurs = [createTarget(), createTarget(), createTarget()];

    const pass = (target: FloatTarget | null, program: SharedVertexProgram) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
      gl.useProgram(program.program);
      return program.uniforms;
    };

    const bind = (unit: number, texture: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    };

    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false };
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 };
    const flow = { y: 0 };
    const puffs: Puff[] = [];
    let presence = 0;
    let current = 0;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== 'hidden';
    let lost = false;
    let dirty = true;
    let disposed = false;
    let introLive = settingsRef.current.intro && !reduced && generation === 0;
    let introStart = -1;

    const resize = () => {
      const s = settingsRef.current;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, s.maxRatio);
      view.width = width;
      view.height = height;
      view.ratio = ratio;
      const cw = Math.max(1, Math.round(width * ratio));
      const ch = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      view.shade = Math.min(1, Math.sqrt(s.budget / (width * height)));
      const sw = Math.max(8, Math.round(width * view.shade));
      const sh = Math.max(8, Math.round(height * view.shade));
      allocate(shade, sw, sh);
      let w = Math.max(4, Math.round(sw / 2));
      let h = Math.max(4, Math.round(sh / 2));
      for (let i = 0; i < 3; i++) {
        allocate(downs[i], w, h);
        allocate(blurs[i], w, h);
        w = Math.max(2, Math.round(w / 2));
        h = Math.max(2, Math.round(h / 2));
      }
      view.sim = Math.min(0.35, 220 / Math.max(width, height));
      const simW = Math.max(16, Math.round(width * view.sim));
      const simH = Math.max(16, Math.round(height * view.sim));
      allocate(sims[0], simW, simH);
      allocate(sims[1], simW, simH);
      dirty = true;
    };

    const simulate = (dt: number, active: boolean) => {
      const s = settingsRef.current;
      const src = sims[current];
      const dst = sims[1 - current];
      const scale = view.sim;
      const sigma = s.size * scale * 0.3;
      const decay = Math.exp(-dt / (0.12 + s.trail * 0.022));
      const u = pass(dst, programs.sim);
      bind(0, src.texture);
      gl.uniform1i(u.uState, 0);
      gl.uniform2f(u.uSize, dst.width, dst.height);
      gl.uniform1f(u.uDt, dt);
      gl.uniform1f(u.uTime, clock);
      gl.uniform1f(u.uDecay, decay);
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));
      gl.uniform2f(u.uDrift, 0, s.drift * 110 * scale);
      gl.uniform1f(u.uTurbulence, s.turbulence * 70 * scale);
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, s.size * scale * 2.2));
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);
      gl.uniform1f(u.uRadius, sigma);
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0);
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0);
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);
      const puff = puffs.shift();
      if (puff) {
        gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9);
      } else {
        gl.uniform4f(u.uPuff, 0, 0, 1, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      current = 1 - current;
    };

    const render = () => {
      const s = settingsRef.current;
      let u = pass(shade, programs.shade);
      bind(0, sims[current].texture);
      gl.uniform1i(u.uState, 0);
      gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);
      gl.uniform2f(u.uView, view.width, view.height);
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);
      gl.uniform1f(u.uHeadSize, s.size * 0.38);
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0);
      gl.uniform1f(u.uTime, clock);
      gl.uniform3fv(u.uColor, s.color);
      gl.uniform1f(u.uDetail, s.detail);
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, s.size * 2.6));
      gl.uniform2f(u.uFlow, 0, flow.y);
      gl.uniform1f(u.uBrightness, s.brightness);
      gl.uniform1f(u.uTheme, s.theme);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      let source = shade;
      for (let i = 0; i < 3; i++) {
        u = pass(downs[i], programs.down);
        bind(0, source.texture);
        gl.uniform1i(u.uSource, 0);
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);
        gl.uniform1f(u.uThreshold, i === 0 ? s.threshold : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        u = pass(blurs[i], programs.blur);
        bind(0, downs[i].texture);
        gl.uniform1i(u.uSource, 0);
        gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        u = pass(downs[i], programs.blur);
        bind(0, blurs[i].texture);
        gl.uniform1i(u.uSource, 0);
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        source = downs[i];
      }

      u = pass(null, programs.composite);
      bind(0, shade.texture);
      bind(1, downs[0].texture);
      bind(2, downs[1].texture);
      bind(3, downs[2].texture);
      gl.uniform1i(u.uShade, 0);
      gl.uniform1i(u.uBloom0, 1);
      gl.uniform1i(u.uBloom1, 2);
      gl.uniform1i(u.uBloom2, 3);
      gl.uniform2f(u.uShadeSize, shade.width, shade.height);
      const spread = s.bloomRadius;
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));
      gl.uniform1f(u.uBloom, s.bloom);
      gl.uniform1f(u.uPresence, presence);
      gl.uniform1f(u.uGrain, s.grain);
      gl.uniform1f(u.uEdge, s.edge);
      gl.uniform1f(u.uTime, clock);
      gl.uniform1f(u.uTheme, s.theme);
      gl.uniform3fv(u.uColor, s.color);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const hold = () => {
      last = performance.now();
      if (pointer.moved > -1e9) pointer.moved = last;
      if (ghost.ready && pointer.inside) {
        ghost.x = ghost.px = pointer.x;
        ghost.y = ghost.py = pointer.y;
        ghost.vx = ghost.vy = 0;
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (lost) return;
      if (!ready) {
        if (gl.isContextLost()) return;
        if (!finish()) {
          hold();
          if (visible && pageVisible) raf = requestAnimationFrame(frame);
          return;
        }
        if (broken) {
          dispose();
          return;
        }
      }
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
      last = Math.max(last, now);
      clock += dt;
      const s = settingsRef.current;
      if (dirty) resize();
      dirty = false;

      if (introLive) {
        if (introStart < 0) introStart = now + 280;
        const t = (now - introStart) / INTRO_MS;
        if (t >= 0) {
          const e = t < 1 ? t * t * (3 - 2 * t) : 1;
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI));
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2));
          if (!ghost.ready) {
            ghost.x = ghost.px = x;
            ghost.y = ghost.py = y;
            ghost.vx = ghost.vy = 0;
            ghost.ready = true;
          }
          pointer.x = x;
          pointer.y = y;
          pointer.inside = true;
          pointer.moved = now;
          if (t >= 1) introLive = false;
        }
      }

      const idle = now - pointer.moved;
      const target = !ghost.ready ? 0 : idle < s.fadeDelay ? 1 : Math.max(0, 1 - (idle - s.fadeDelay) / s.fadeDuration);
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)));
      if (Math.abs(target - presence) < 0.002) presence = target;

      ghost.px = ghost.x;
      ghost.py = ghost.y;
      if (ghost.ready) {
        if (pointer.inside) {
          const stiffness = 520 * Math.pow(1 - s.inertia, 2) + 26;
          const damping = 2 * Math.sqrt(stiffness) * 0.92;
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
          const h = dt / steps;
          for (let i = 0; i < steps; i++) {
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;
            ghost.x += ghost.vx * h;
            ghost.y += ghost.vy * h;
          }
        } else {
          const glide = Math.pow(s.inertia, dt * 60);
          ghost.vx *= glide;
          ghost.vy *= glide;
          ghost.x += ghost.vx * dt;
          ghost.y += ghost.vy * dt;
        }
      }
      flow.y -= s.drift * 110 * dt;

      simulate(dt, presence > 0.01);
      render();

      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;
      if (!busy) {
        for (const target of sims) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }
      if (visible && pageVisible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || lost || !visible || !pageVisible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };

    const onPointerMove = (event: PointerEvent) => {
      const spot = locate(event);
      if (spot.inside) introLive = false;
      if (!spot.inside) {
        if (pointer.inside) onLeave();
        return;
      }
      if (!pointer.inside && !ghost.ready) {
        ghost.x = ghost.px = spot.x;
        ghost.y = ghost.py = spot.y;
        ghost.vx = ghost.vy = 0;
        ghost.ready = true;
      } else if (!pointer.inside && presence < 0.05) {
        ghost.x = ghost.px = spot.x;
        ghost.y = ghost.py = spot.y;
        ghost.vx = ghost.vy = 0;
      }
      pointer.x = spot.x;
      pointer.y = spot.y;
      pointer.inside = true;
      pointer.moved = performance.now();
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      const spot = locate(event);
      if (!spot.inside) return;
      onPointerMove(event);
      if (settingsRef.current.clickPuff) {
        puffs.push({ x: spot.x, y: spot.y });
        wake();
      }
    };

    const onLeave = () => {
      const now = performance.now();
      if (pointer.inside && now - pointer.moved < settingsRef.current.fadeDelay) pointer.moved = now;
      pointer.inside = false;
      wake();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration(value => value + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const resizeObserver = new ResizeObserver(() => {
      dirty = true;
      wake();
    });
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      wake();
    });
    intersection.observe(container);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden';
      wake();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (!gl.isContextLost()) {
        for (const target of [...sims, shade, ...downs, ...blurs]) {
          gl.deleteFramebuffer(target.framebuffer);
          gl.deleteTexture(target.texture);
        }
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        discard();
      }
      if (reposition) parent.style.position = previousPosition;
    };

    resize();
    if (introLive) wake();

    return () => {
      dispose();
      releaseRef.current = window.setTimeout(() => {
        if (!canvas.isConnected && !gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
      }, 0);
    };
  }, [generation]);

  const blend = mixBlendMode ?? (light ? 'normal' : 'screen');

  return (
    <div ref={containerRef} className={`ghost-cursor ${className}`.trim()} style={{ zIndex, ...style }}>
      <canvas ref={canvasRef} className="ghost-cursor__canvas" style={{ mixBlendMode: blend }} aria-hidden="true" />
    </div>
  );
};

export default GhostCursor;
