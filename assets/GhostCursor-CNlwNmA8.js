import{r as b,j as Ue}from"./index-CDLRPKiO.js";import{p as st,c as ft,l as N,a as S,i as lt,b as vt,d as mt}from"./Home-DrNsnmPx.js";import"./FigmaCursor-DJcYJQU8.js";import"./ProjectCardArt-CZAD8Yu1.js";const dt=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ht=`
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

vec3 gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hash2(i);
  vec2 gb = hash2(i + vec2(1.0, 0.0));
  vec2 gc = hash2(i + vec2(0.0, 1.0));
  vec2 gd = hash2(i + vec2(1.0, 1.0));
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(value, slope);
}
`,xt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSize;
uniform float uDt;
uniform float uTime;
uniform float uDecay;
uniform float uDrag;
uniform vec2 uDrift;
uniform float uTurbulence;
uniform float uSwirl;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uTrail;
uniform float uIdle;
uniform vec2 uVelocity;
uniform vec4 uPuff;
${ht}
float erf(float x) {
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}
vec2 curl(vec2 p) {
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);
  vec2 g = a.yz + b.yz * 0.5;
  return vec2(g.y, -g.x);
}
vec4 fetch(vec2 p) {
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);
  return texture(uState, p / uSize);
}
void main() {
  vec2 p = gl_FragCoord.xy;
  vec4 here = texture(uState, vUv);
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;
  vec4 state = fetch(p - flow * uDt);
  float density = state.r * uDecay;
  vec2 velocity = state.gb * uDrag;

  float sigma = max(uRadius, 0.5);
  vec2 ab = uTo - uFrom;
  float len = length(ab);
  float trail = 0.0;
  if (len > 0.25) {
    vec2 dir = ab / len;
    vec2 ap = p - uFrom;
    float along = dot(ap, dir);
    float across = dot(ap, vec2(-dir.y, dir.x));
    float k = 1.4142136 * sigma;
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));
  }
  vec2 dh = p - uTo;
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));
  density += uTrail * trail + uIdle * uDt * head;
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);

  if (uPuff.w > 0.0) {
    vec2 d = p - uPuff.xy;
    float r2 = dot(d, d);
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));
    density += uPuff.w * g;
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;
  }

  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);
}`,pt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSimSize;
uniform vec2 uView;
uniform vec2 uHead;
uniform float uHeadSize;
uniform float uHeadAmount;
uniform float uTime;
uniform vec3 uColor;
uniform float uDetail;
uniform float uNoiseScale;
uniform vec2 uFlow;
uniform float uBrightness;
uniform float uTheme;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.5;
  }
  return v;
}
float fbm5(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.52;
  }
  return v;
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
float field(vec2 uv, vec2 p) {
  vec2 d = p - uHead;
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));
}
void main() {
  vec2 p = vUv * uView;
  float density = field(vUv, p);
  if (density < 0.002) {
    fragColor = vec4(0.0);
    return;
  }
  vec2 step = vec2(1.5) / uSimSize;
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));

  vec2 n = (p + uFlow) * uNoiseScale;
  float t = uTime;
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));
  float smoke = fbm5(n + r * 1.1);
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;
  float body = density * mix(1.0, wisp, uDetail);
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;
  if (cloud <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));
  float light = 0.7 + 0.5 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);
  float core = smoothstep(0.7, 2.2, cloud);

  vec3 tint = mix(uColor * light, mix(uColor, vec3(1.0), 0.55) * light, core);
  vec3 ink = mix(uColor, uColor * 0.78, core * 0.6) * (1.12 - 0.12 * light);
  vec3 color = mix(tint * uBrightness, ink, uTheme) * cloud;
  fragColor = vec4(color, cloud);
}`,gt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));
  vec4 color = (a + b + c + d) * 0.25;
  float peak = max(color.r, max(color.g, color.b));
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;
  fragColor = color * keep;
}`,yt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uDirection;
void main() {
  vec4 color = texture(uSource, vUv) * 0.181862;
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;
  fragColor = color;
}`,wt=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uShade;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform vec2 uShadeSize;
uniform vec3 uWeights;
uniform float uBloom;
uniform float uPresence;
uniform float uGrain;
uniform float uEdge;
uniform float uTime;
uniform float uTheme;
uniform vec3 uColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
void main() {
  vec4 shade = cubic(uShade, vUv, uShadeSize);
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;
  vec2 edge = min(vUv, 1.0 - vUv);
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));
  float fade = uPresence * vignette;
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;
  if (uTheme > 0.5) {
    float coverage = 1.0 - exp(-(shade.a + bloom.a * uBloom * 0.6) * 0.95);
    coverage = clamp(coverage * fade * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);
    vec3 pigment = shade.a > 0.0001 ? clamp(shade.rgb / shade.a, 0.0, 1.0) : uColor;
    fragColor = vec4(pow(pigment, vec3(1.0 / 2.2)) * coverage, coverage);
    return;
  }
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));
  color += color * grain * uGrain * 2.0;
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));
}`,bt=1900,Rt=({color:Pe="#B497CF",brightness:Be=1,size:Le=80,trailLength:_e=50,inertia:ke=.5,turbulence:Ie=.5,drift:Ne=.3,detail:Ve=1,grainIntensity:He=.05,bloomStrength:Oe=.6,bloomRadius:Ge=1,bloomThreshold:qe=.025,edgeIntensity:We=0,clickPuff:Xe=!0,intro:je=!0,theme:Ye="dark",mixBlendMode:Ke,fadeDelayMs:$e,fadeDurationMs:Je,maxDevicePixelRatio:Qe=2,targetPixels:Ze,zIndex:et=10,className:tt="",style:ot})=>{const ie=b.useRef(null),ne=b.useRef(null),B=b.useRef(null),ae=b.useRef(0),[ue,rt]=b.useState(0),[j]=b.useState(()=>typeof window<"u"&&("ontouchstart"in window||navigator.maxTouchPoints>0)),ce=Ye==="light",se={color:st(Pe).map(d=>Math.pow(d,2.2)),brightness:Math.max(0,Be),size:Math.max(8,Le),trail:S(_e,1,200),inertia:S(ke,0,.99),turbulence:S(Ie,0,2),drift:Ne,detail:S(Ve,0,1),grain:S(He,0,1),bloom:Math.max(0,Oe),bloomRadius:S(Ge,0,3),threshold:Math.max(0,qe),edge:S(We,0,1),clickPuff:Xe,intro:je,theme:ce?1:0,fadeDelay:Math.max(0,$e??(j?500:1e3)),fadeDuration:Math.max(1,Je??(j?1e3:1500)),maxRatio:S(Qe,.25,3),budget:Math.max(5e4,Ze??(j?3e5:6e5))},T=b.useRef(se);T.current=se,b.useEffect(()=>{var d;(d=B.current)==null||d.call(B)}),b.useEffect(()=>{window.clearTimeout(ae.current);const d=ie.current,m=ne.current,M=d==null?void 0:d.parentElement;if(!d||!m||!M)return;const V=M.style.position,L=getComputedStyle(M).position==="static";L&&(M.style.position="relative");const nt=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"});if(!e||!e.getExtension("EXT_color_buffer_float")){L&&(M.style.position=V);return}const Y=e.getExtension("KHR_parallel_shader_compile"),E=ft(e,e.VERTEX_SHADER,dt),K=[N(e,E,xt),N(e,E,pt),N(e,E,gt),N(e,E,yt),N(e,E,wt)],[fe,le,ve,me,de]=K;let $=!1,J=!1;const he=()=>!Y||K.every(o=>!o||e.getProgramParameter(o.program,Y.COMPLETION_STATUS_KHR)),H=()=>{if(!e.isContextLost()){if(!$&&!he()){requestAnimationFrame(H);return}for(const o of K)o&&(e.deleteShader(o.fragment),e.deleteProgram(o.program));e.deleteShader(E)}};if(!E||!fe||!le||!ve||!me||!de){H(),L&&(M.style.position=V);return}const z={sim:fe,shade:le,down:ve,blur:me,composite:de},xe=()=>{if(!he())return!1;for(const o of Object.values(z))lt(e,E,o)||(J=!0);return $=!0,!0};if(Y||xe(),J){H(),L&&(M.style.position=V);return}const pe=e.createVertexArray();e.bindVertexArray(pe);const ge=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.disable(e.BLEND),e.disable(e.DEPTH_TEST);const g=()=>vt(e),_=(o,t,i)=>mt(e,o,t,i),y=[g(),g()],C=g(),p=[g(),g(),g()],k=[g(),g(),g()],U=(o,t)=>(e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,o?o.width:m.width,o?o.height:m.height),e.useProgram(t.program),t.uniforms),w=(o,t)=>{e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,t)},f={width:1,height:1,ratio:1,sim:.25,shade:1},r={x:0,y:0,vx:0,vy:0,px:0,py:0,ready:!1},u={x:0,y:0,inside:!1,moved:-1e9},ye={y:0},Q=[];let h=0,A=0,R=0,P=0,O=0,G=!0,q=document.visibilityState!=="hidden",Z=!1,W=!0,we=!1,I=T.current.intro&&!nt&&ue===0,ee=-1;const be=()=>{const o=T.current,t=d.getBoundingClientRect(),i=Math.max(1,Math.round(t.width)),s=Math.max(1,Math.round(t.height)),a=Math.min(window.devicePixelRatio||1,o.maxRatio);f.width=i,f.height=s,f.ratio=a;const l=Math.max(1,Math.round(i*a)),c=Math.max(1,Math.round(s*a));(m.width!==l||m.height!==c)&&(m.width=l,m.height=c),f.shade=Math.min(1,Math.sqrt(o.budget/(i*s)));const x=Math.max(8,Math.round(i*f.shade)),n=Math.max(8,Math.round(s*f.shade));_(C,x,n);let v=Math.max(4,Math.round(x/2)),F=Math.max(4,Math.round(n/2));for(let X=0;X<3;X++)_(p[X],v,F),_(k[X],v,F),v=Math.max(2,Math.round(v/2)),F=Math.max(2,Math.round(F/2));f.sim=Math.min(.35,220/Math.max(i,s));const Ae=Math.max(16,Math.round(i*f.sim)),Fe=Math.max(16,Math.round(s*f.sim));_(y[0],Ae,Fe),_(y[1],Ae,Fe),W=!0},at=(o,t)=>{const i=T.current,s=y[A],a=y[1-A],l=f.sim,c=i.size*l*.3,x=Math.exp(-o/(.12+i.trail*.022)),n=U(a,z.sim);w(0,s.texture),e.uniform1i(n.uState,0),e.uniform2f(n.uSize,a.width,a.height),e.uniform1f(n.uDt,o),e.uniform1f(n.uTime,O),e.uniform1f(n.uDecay,x),e.uniform1f(n.uDrag,Math.exp(-o*2.4)),e.uniform2f(n.uDrift,0,i.drift*110*l),e.uniform1f(n.uTurbulence,i.turbulence*70*l),e.uniform1f(n.uSwirl,1/Math.max(1,i.size*l*2.2)),e.uniform2f(n.uFrom,r.px*l,(f.height-r.py)*l),e.uniform2f(n.uTo,r.x*l,(f.height-r.y)*l),e.uniform1f(n.uRadius,c),e.uniform1f(n.uTrail,t?.42*h:0),e.uniform1f(n.uIdle,t?.22*h:0),e.uniform2f(n.uVelocity,r.vx*l*.5,-r.vy*l*.5);const v=Q.shift();v?e.uniform4f(n.uPuff,v.x*l,(f.height-v.y)*l,c*1.4,.9):e.uniform4f(n.uPuff,0,0,1,0),e.drawArrays(e.TRIANGLES,0,3),A=1-A},ut=()=>{const o=T.current;let t=U(C,z.shade);w(0,y[A].texture),e.uniform1i(t.uState,0),e.uniform2f(t.uSimSize,y[A].width,y[A].height),e.uniform2f(t.uView,f.width,f.height),e.uniform2f(t.uHead,r.x,f.height-r.y),e.uniform1f(t.uHeadSize,o.size*.38),e.uniform1f(t.uHeadAmount,r.ready?.8*h:0),e.uniform1f(t.uTime,O),e.uniform3fv(t.uColor,o.color),e.uniform1f(t.uDetail,o.detail),e.uniform1f(t.uNoiseScale,2.4/Math.max(20,o.size*2.6)),e.uniform2f(t.uFlow,0,ye.y),e.uniform1f(t.uBrightness,o.brightness),e.uniform1f(t.uTheme,o.theme),e.drawArrays(e.TRIANGLES,0,3);let i=C;for(let a=0;a<3;a++)t=U(p[a],z.down),w(0,i.texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uTexel,1/i.width,1/i.height),e.uniform1f(t.uThreshold,a===0?o.threshold:0),e.drawArrays(e.TRIANGLES,0,3),t=U(k[a],z.blur),w(0,p[a].texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uDirection,1/p[a].width,0),e.drawArrays(e.TRIANGLES,0,3),t=U(p[a],z.blur),w(0,k[a].texture),e.uniform1i(t.uSource,0),e.uniform2f(t.uDirection,0,1/k[a].height),e.drawArrays(e.TRIANGLES,0,3),i=p[a];t=U(null,z.composite),w(0,C.texture),w(1,p[0].texture),w(2,p[1].texture),w(3,p[2].texture),e.uniform1i(t.uShade,0),e.uniform1i(t.uBloom0,1),e.uniform1i(t.uBloom1,2),e.uniform1i(t.uBloom2,3),e.uniform2f(t.uShadeSize,C.width,C.height);const s=o.bloomRadius;e.uniform3f(t.uWeights,1,.6+.4*s,.25+.75*Math.min(1,s*s*.5)),e.uniform1f(t.uBloom,o.bloom),e.uniform1f(t.uPresence,h),e.uniform1f(t.uGrain,o.grain),e.uniform1f(t.uEdge,o.edge),e.uniform1f(t.uTime,O),e.uniform1f(t.uTheme,o.theme),e.uniform3fv(t.uColor,o.color),e.drawArrays(e.TRIANGLES,0,3)},ct=()=>{P=performance.now(),u.moved>-1e9&&(u.moved=P),r.ready&&u.inside&&(r.x=r.px=u.x,r.y=r.py=u.y,r.vx=r.vy=0)},te=o=>{if(R=0,Z)return;if(!$){if(e.isContextLost())return;if(!xe()){ct(),G&&q&&(R=requestAnimationFrame(te));return}if(J){Ce();return}}const t=S((o-P)/1e3||0,0,.05);P=Math.max(P,o),O+=t;const i=T.current;if(W&&be(),W=!1,I){ee<0&&(ee=o+280);const c=(o-ee)/bt;if(c>=0){const x=c<1?c*c*(3-2*c):1,n=f.width*(.16+.44*x+.05*Math.sin(x*Math.PI)),v=f.height*(.7-.24*x-.1*Math.sin(x*Math.PI*2));r.ready||(r.x=r.px=n,r.y=r.py=v,r.vx=r.vy=0,r.ready=!0),u.x=n,u.y=v,u.inside=!0,u.moved=o,c>=1&&(I=!1)}}const s=o-u.moved,a=r.ready?s<i.fadeDelay?1:Math.max(0,1-(s-i.fadeDelay)/i.fadeDuration):0;if(h+=(a-h)*(1-Math.exp(-t/(a>h?.12:.08))),Math.abs(a-h)<.002&&(h=a),r.px=r.x,r.py=r.y,r.ready)if(u.inside){const c=520*Math.pow(1-i.inertia,2)+26,x=2*Math.sqrt(c)*.92,n=Math.max(1,Math.ceil(t/(1/240))),v=t/n;for(let F=0;F<n;F++)r.vx+=(c*(u.x-r.x)-x*r.vx)*v,r.vy+=(c*(u.y-r.y)-x*r.vy)*v,r.x+=r.vx*v,r.y+=r.vy*v}else{const c=Math.pow(i.inertia,t*60);r.vx*=c,r.vy*=c,r.x+=r.vx*t,r.y+=r.vy*t}if(ye.y-=i.drift*110*t,at(t,h>.01),ut(),!(I||a>0||h>.001||Q.length>0)){for(const c of y)e.bindFramebuffer(e.FRAMEBUFFER,c.framebuffer),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);return}G&&q&&(R=requestAnimationFrame(te))},D=()=>{R||Z||!G||!q||(P=performance.now(),R=requestAnimationFrame(te))};B.current=D;const Se=o=>{const t=d.getBoundingClientRect(),i=o.clientX-t.left,s=o.clientY-t.top;return{x:i,y:s,inside:i>=0&&s>=0&&i<=t.width&&s<=t.height}},oe=o=>{const t=Se(o);if(t.inside&&(I=!1),!t.inside){u.inside&&re();return}!u.inside&&!r.ready?(r.x=r.px=t.x,r.y=r.py=t.y,r.vx=r.vy=0,r.ready=!0):!u.inside&&h<.05&&(r.x=r.px=t.x,r.y=r.py=t.y,r.vx=r.vy=0),u.x=t.x,u.y=t.y,u.inside=!0,u.moved=performance.now(),D()},Te=o=>{const t=Se(o);t.inside&&(oe(o),T.current.clickPuff&&(Q.push({x:t.x,y:t.y}),D()))},re=()=>{const o=performance.now();u.inside&&o-u.moved<T.current.fadeDelay&&(u.moved=o),u.inside=!1,D()};window.addEventListener("pointermove",oe,{passive:!0}),window.addEventListener("pointerdown",Te,{passive:!0}),document.documentElement.addEventListener("pointerleave",re);const Me=o=>{o.preventDefault(),Z=!0,cancelAnimationFrame(R),R=0},Ee=()=>rt(o=>o+1);m.addEventListener("webglcontextlost",Me),m.addEventListener("webglcontextrestored",Ee);const Re=new ResizeObserver(()=>{W=!0,D()});Re.observe(d);const De=new IntersectionObserver(o=>{G=o.some(t=>t.isIntersecting),D()});De.observe(d);const ze=()=>{q=document.visibilityState!=="hidden",D()};document.addEventListener("visibilitychange",ze);const Ce=()=>{if(!we){if(we=!0,cancelAnimationFrame(R),B.current=null,Re.disconnect(),De.disconnect(),window.removeEventListener("pointermove",oe),window.removeEventListener("pointerdown",Te),document.documentElement.removeEventListener("pointerleave",re),document.removeEventListener("visibilitychange",ze),m.removeEventListener("webglcontextlost",Me),m.removeEventListener("webglcontextrestored",Ee),!e.isContextLost()){for(const o of[...y,C,...p,...k])e.deleteFramebuffer(o.framebuffer),e.deleteTexture(o.texture);e.deleteBuffer(ge),e.deleteVertexArray(pe),H()}L&&(M.style.position=V)}};return be(),I&&D(),()=>{Ce(),ae.current=window.setTimeout(()=>{var o;!m.isConnected&&!e.isContextLost()&&((o=e.getExtension("WEBGL_lose_context"))==null||o.loseContext())},0)}},[ue]);const it=Ke??(ce?"normal":"screen");return Ue.jsx("div",{ref:ie,className:`ghost-cursor ${tt}`.trim(),style:{zIndex:et,...ot},children:Ue.jsx("canvas",{ref:ne,className:"ghost-cursor__canvas",style:{mixBlendMode:it},"aria-hidden":"true"})})};export{Rt as default};
