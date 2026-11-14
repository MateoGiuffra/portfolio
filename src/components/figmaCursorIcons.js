// Iconos del cursor estilo Figma. Cada herramienta devuelve un SVG según el estilo elegido.
// hot = punto de clic (px) dentro del icono.

export const STYLES = {
  classic: { a: '#0a0a14', as: '#ffffff', f: '#ffffff', s: '#0a0a14', tagBg: '#0a0a14', tagFg: '#ffffff' },
  blue: { a: '#0d99ff', as: '#ffffff', f: '#ffffff', s: '#0d99ff', tagBg: '#0d99ff', tagFg: '#ffffff' },
  blueprint: { a: '#ffb400', as: '#0c2a5e', f: '#ffb400', s: '#0c2a5e', tagBg: '#0c2a5e', tagFg: '#ffb400' },
  outline: { a: 'rgba(255,255,255,.55)', as: '#0a0a14', f: 'rgba(255,255,255,.55)', s: '#0a0a14', tagBg: '#0a0a14', tagFg: '#ffffff' },
}

const fill = (d, st) =>
  `<path d="${d}" fill="${st.f}" stroke="${st.s}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`
const line = (d, st, w = 1.8) =>
  `<path d="${d}" fill="none" stroke="${st.s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
const box = (body) => `<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`

export const TOOLS = {
  arrow: {
    hot: [1, 1],
    svg: (st) =>
      `<svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true"><path d="M1 1 L1 22 L6.5 17.2 L10.2 25.6 L14 24 L10.4 15.8 L17.6 15.8 Z" fill="${st.a}" stroke="${st.as}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  },
  point: {
    hot: [11, 3],
    svg: (st) =>
      box(fill('M10 2.5c-.8 0-1.5.7-1.5 1.5v8.2l-1.3-1.5c-.6-.7-1.6-.8-2.3-.2-.6.5-.7 1.4-.3 2.1l3.4 5.6c.9 1.5 2.5 2.4 4.3 2.4h2.2c2.6 0 4.7-2.1 4.7-4.7v-4.3c0-.8-.6-1.4-1.4-1.4-.3 0-.6.1-.8.3-.1-.6-.7-1-1.3-1-.4 0-.7.1-1 .4-.2-.6-.8-1-1.4-1-.3 0-.5.1-.7.2V4c0-.8-.7-1.5-1.5-1.5z', st)),
  },
  hand: {
    hot: [13, 13],
    svg: (st) =>
      box(fill('M8.2 11V4.6a1.6 1.6 0 0 1 3.2 0V10h.4V3.4a1.6 1.6 0 0 1 3.2 0V10h.4V5a1.6 1.6 0 0 1 3.2 0v8.6c0 4-2.6 7.4-6.6 7.4h-.6c-2.4 0-3.9-1.1-5.1-2.8l-2.9-4.2a1.5 1.5 0 0 1 2.3-1.9L8.2 14.5z', st)),
  },
  grab: {
    hot: [13, 13],
    svg: (st) =>
      box(fill('M6 12.5a1.5 1.5 0 0 1 3 0V11a1.5 1.5 0 0 1 3 0v-.5a1.5 1.5 0 0 1 3 0V11a1.5 1.5 0 0 1 3 0v6c0 3.2-2.4 5.5-5.5 5.5h-.5c-2 0-3.4-1-4.4-2.4L4.8 16.3A1.4 1.4 0 0 1 7 14.8L8 16z', st)),
  },
  text: {
    hot: [13, 13],
    svg: (st) => box(line('M8 3h3.5c.9 0 1.5.4 1.5 1.2V19.8c0 .8-.6 1.2-1.5 1.2H8M16 3h-3.5M16 21h-3.5', st, 2)),
  },
  comment: {
    hot: [4, 22],
    svg: (st) =>
      box(fill('M12 2.5c-5 0-9 3.3-9 7.7 0 2 .9 3.8 2.4 5.1L3.5 21.5l5.3-2.3c1 .3 2.1.5 3.2.5 5 0 9-3.4 9-7.8S17 2.5 12 2.5z', st)),
  },
  zoom: {
    hot: [10, 10],
    svg: (st) =>
      box(`<circle cx="10" cy="10" r="6.5" fill="${st.f}" stroke="${st.s}" stroke-width="1.7"/>${line('M15 15l6 6', st, 2.2)}${line('M7.5 10h5M10 7.5v5', st, 1.6)}`),
  },
  resize: {
    hot: [13, 13],
    svg: (st) => box(fill('M2 12l4.5-4.5v3h11v-3L22 12l-4.5 4.5v-3h-11v3z', st)),
  },
  cross: {
    hot: [13, 13],
    svg: (st) =>
      box(`${line('M12 2v8M12 14v8M2 12h8M14 12h8', st, 1.9)}<circle cx="12" cy="12" r="1.8" fill="${st.f}" stroke="${st.s}" stroke-width="1.3"/>`),
  },
  pen: {
    hot: [5, 21],
    svg: (st) =>
      box(`${fill('M12.5 2.5l6 8.5-3.5 10h-5L6.5 11z', st)}<circle cx="12.5" cy="13" r="1.5" fill="${st.s}"/>${line('M12.5 14.5v3', st, 1.4)}`),
  },
  move: {
    hot: [13, 13],
    svg: (st) => box(fill('M12 2l3.5 3.5h-2.5V11h5.5V8.5L22 12l-3.5 3.5V13H13v5.5h2.5L12 22l-3.5-3.5H11V13H5.5v2.5L2 12l3.5-3.5V11H11V5.5H8.5z', st)),
  },
}

export const HOTKEYS = { v: 'arrow', h: 'hand', t: 'text', c: 'comment', z: 'zoom', r: 'resize', x: 'cross', p: 'pen', m: 'move' }
