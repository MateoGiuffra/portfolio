# Portfolio de Mateo Giuffra

Sitio personal en React + Vite, bilingüe (ES/EN). Publicado en https://mateogiuffra.github.io/portfolio/

## Estructura

- `src/i18n/content.js`: todo el texto del sitio (ES y EN). Para cambiar contenido, se edita acá.
- `src/components/`: una sección por componente. `ArchitectureDiagram.jsx` dibuja el diagrama del hero en SVG.
- `src/index.css`: tokens de diseño (colores, tipografías). `src/App.css`: layout y componentes.
- `public/files/`: CV en español e inglés (`.docx`).

## Desarrollo

```bash
pnpm install
pnpm run dev      # http://localhost:5173
pnpm run lint
```

## Formulario de contacto (opcional)

El formulario usa EmailJS y solo se muestra si existen estas variables en un `.env` (no se versiona):

```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

Sin ellas, la sección de contacto muestra solo los enlaces (email, LinkedIn, GitHub).

## Deploy

GitHub Pages sirve la rama `gh-pages`. Desde la raíz del repo, con el `.env` presente si se quiere el formulario:

```bash
pnpm run deploy   # compila con base /portfolio/ y publica dist en gh-pages
```
