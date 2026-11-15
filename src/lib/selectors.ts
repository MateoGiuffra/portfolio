// Selectores CSS que el JS necesita (acoplan el código a clases del CSS: se centralizan acá).
export const SEL = {
  ghostLayer: '.ghost-layer',
  featuredList: '.featured-list',
  featuredCard: '.fcard',
  reveal: '[data-reveal]',
  hero: 'top', // id (sin #)
  hoverTarget: '[data-cursor]',
  ghostBlockers: [
    '.fcard', '.work-card', '.exp-card', '.exp-list li', '.edu-card', '.skill-row',
    '.site-header', '.menu-panel', '.contact-form', '.scroll-indicator',
    'a', 'button', 'input', 'textarea',
  ].join(','),
} as const
