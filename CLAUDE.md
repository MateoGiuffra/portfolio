# Portfolio — contexto para Claude

React 19 + Vite. Hosting: GitHub Pages (`/portfolio/`, deploy por CI en cada push a `main`).
Contenido y backoffice en **Firebase (plan Spark, proyecto `counter-a05c4`)**: Auth con Google + Firestore. Sin Storage (fotos → Cloudinary, pendiente).

## Arquitectura de datos
- `src/services/schema.js`: ÚNICA fuente del esquema (secciones, listas, `buildSeed`, `assemble`). Lo usan web, backoffice y scripts.
- `content/<seccion>`: docs con cada clave como `{es, en}`. Listas: `projects`, `jobs`, `education`, `skillGroups`, `workItems` (campos localizados `{es,en}`, `order`, `visible`).
- La web arranca con `src/i18n/content.js` como respaldo y lo reemplaza con lo de Firestore (`ContentProvider`, caché en localStorage). Los componentes reciben `t` con la misma forma de siempre.
- Firestore NO admite arrays anidados: `stats` y `skills.groups` se codifican como objetos (ver schema.js).
- Backoffice en `/bo` o `/backoffice` (`public/bo`, `public/backoffice` redirigen a `#/bo` en GitHub Pages). Formularios genéricos (`src/admin/Tree.jsx`).
- Tarjetas de proyecto: `card = {variant, bg, fg, accent}`; variantes en `src/config/cardPalette.js`, render en `ProjectCardArt.jsx`.

## Reglas
- NUNCA hacer commit/push sin que el usuario lo pida (el push publica el sitio).
- La clave de service account vive en `~/.config/firebase/counter-a05c4-admin.json`. No leerla, no copiarla al repo, no pegarla en el frontend.
- Admins (login Google): `matteogiuffrah40@gmail.com`, `mgiuffra@mobeats.io`. Deben coincidir en `firestore.rules` y `src/services/firebase.js`.
- Cambios de contenido/esquema → correr `pnpm run check:offline` y `pnpm run verify:parity`; verificación visual con la skill `bo-parity`.
- `pnpm run seed` NO pisa documentos existentes (protege lo editado en el BO); `--force` sí pisa.
- Usuario: español rioplatense, mínimo trabajo para él, HDD lento (no escribir de más), pantalla 1366x768.

## Orquestación
El agente principal orquesta. Subagentes en `.claude/agents/`: `data-modeler`, `migrator`, `frontend-services`, `bo-builder`, `parity-qa`. Orden: modelar esquema → (migrator ‖ frontend-services ‖ bo-builder, archivos disjuntos) → parity-qa → pedir OK al usuario para commit/push.
