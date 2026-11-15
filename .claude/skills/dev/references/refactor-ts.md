---
name: refactor-ts
description: Refactor de este portfolio a TS/TSX con capas pages → hooks → services (UI idéntica, CSS intacto). Usar al migrar o mover archivos de src/, al sacar el SDK de Firebase de los componentes, al reemplazar el router casero por react-router o al partir componentes gigantes.
license: MIT
metadata:
  adapted-from: vercel-labs/agent-skills · skills/composition-patterns (MIT, © Vercel)
  version: '0.1.0'
---

# Refactor a TS (misión)

Adaptación de `vercel-composition-patterns`. Idea que nos llevamos de ahí
(`state-decouple-implementation`): **solo el provider/hook sabe de dónde viene el dato; la UI
consume una interfaz `{ state, actions, meta }`**. Acá esa regla se aplica a Firebase y al router.

## Regla de oro
La UI no cambia: mismas clases CSS, mismo DOM, mismos textos. Tras cada paso:
`pnpm run lint` · `tsc --noEmit` · `pnpm run check:offline` · `pnpm run verify:parity` (+ skill `bo-parity`).
Nunca commit/push sin pedido del usuario.

## Capas (dependencias solo hacia abajo)
```
pages/      arman la pantalla: leen hooks, componen features. Sin SDK, sin lógica.
features/   componentes de una sección (hero, projects, admin/lists…). Reciben props o usan hooks.
hooks/      estado + efectos (useAuth, useDocList, useSectionDoc, useRevealCards…). Hablan con services.
services/   ÚNICO lugar que importa firebase/*, emailjs, localStorage. Devuelven tipos de domain/.
domain/     types.ts + schema.ts puros (sin React ni SDK). Los usan web, BO y scripts.
```
Prohibido: `import ... from 'firebase/*'` fuera de `services/`; `document.querySelector` con clases CSS
fuera de un hook; `localStorage` directo fuera de `services/storage`.

## Reglas (de mayor a menor impacto)

| # | Regla | Origen / qué reemplaza |
|---|---|---|
| 1 | `domain/types.ts`: `Localized<T> = {es:T; en:T}`, una interfaz por entidad (`Project`, `Job`, `Education`, `SkillGroup`, `WorkItem`), `ContentDoc`. Pares `[n,l]`/`[name,text]` → objetos tipados en el modelo; la conversión a tupla vive solo en `assemble`. | `schema.js` + `pairsEncode/Decode` |
| 2 | Servicios por dominio, sin SDK expuesto: `authService` (`signIn`, `signOut`, `onChange`), `contentRepo` (`list`, `get`, `save`, `remove`, `fetchAll`), `mailService.send`, `storage`. Config de Firebase por `import.meta.env.VITE_FIREBASE_*`. | `Admin.jsx` getAuth, `SectionsPage` getDoc, `Contact` emailjs |
| 3 | `useDocList(name)` devuelve `{ items, status, error, actions: { save, remove, toggle, reorder } }` con update optimista y rollback. `ListPage` solo pinta. Un único `notifyError` en vez de `try/catch` repetido. | `ListPage.jsx` |
| 4 | Router: `react-router` con `basename`, rutas `/bo/login`, `/bo/:page/:id?`, `useBlocker` para cambios sin guardar, `<Navigate>` para el guard. Borrar `admin/router.js` y el `popstate` de `main.jsx`. Importar el CSS de Mantine solo en el chunk admin para eliminar el `reload()`. | `router.js`, `main.jsx`, `Admin.jsx` |
| 5 | Pages: `pages/Home.tsx`, `pages/admin/{LoginPage,SectionsPage,ListPage}.tsx`, `layouts/AdminLayout.tsx`. `Admin.jsx` se parte en auth gate + layout + tabs como objetos `{key,label,icon,slug}`. | `App.jsx`, `Admin.jsx` |
| 6 | Efectos DOM → hooks con `ref`: `useRevealCards`, `useSpine`, `useOverHero`, `useSmoothScroll`, `useRafLoop`. Selectores CSS centralizados en `config/selectors.ts`. | `Projects`, `Header`, `SmoothScroll`, `useGhostOnBackground` |
| 7 | Providers puros: `ContentProvider` expone `{ content, status }` (loading/error/stale) y `ErrorBoundary` alrededor de WebGL y Firestore. Fusionar `ContentContext/useContent/ContentProvider` en un módulo. | `services/Content*` |
| 8 | Componentes con muchas props literales → presets en `config/` (`ghostPreset`, `asciiPreset`); WebGL/GLSL fuera del componente: `shaders/*.ts` + `createRenderer()`, el hook solo orquesta y limpia. Cargar `GhostCursor` con `lazy` solo si `mode==='ghost'`. | `App.jsx`, `GhostCursor`, `GradientASCII` |
| 9 | Keys estables: `key={item.id}` (id del doc), no `title`/`name`/texto. `ed.progress &&` → `ed.progress > 0 &&` (hoy imprimiría `0`; ojo: cambia solo si hay progress 0, verificar paridad). | `Projects`, `Work`, `Experience` |
| 10 | Props: `t` por prop o `useT()`, no ambos. `ICON` compartido en `admin/icons.ts`. Sin `eslint-disable` de deps: derivar estado en vez de forzar `useMemo`. | `Header`, `Contact`, `ListPage` |

## Orden de migración (cada paso deja el repo compilando)
1. `tsconfig.json` con `allowJs`, `strict` en archivos nuevos; `tsc --noEmit` en CI.
2. `domain/` (types + schema) → los scripts `.mjs` pasan a `tsx`.
3. `services/` (reglas 2 y 7). La UI sigue igual.
4. `hooks/` (3 y 6), componente por componente.
5. react-router + pages (4 y 5).
6. Partir `GhostCursor`/`GradientASCII` (8).
7. Renombrar `.jsx → .tsx` hojas primero (regla de `typescript-refactor`: leaf modules first).
8. Tests de `domain/schema` (puro) con vitest.

## Anti-patrones (heredados de composition-patterns)
- Props booleanas para variar comportamiento → variantes explícitas (`ProjectCardArt` ya usa `variant`: mantener).
- `renderX` props → `children`.
- Componente de UI que conoce la fuente del estado → leer solo de la interfaz del hook/provider.
