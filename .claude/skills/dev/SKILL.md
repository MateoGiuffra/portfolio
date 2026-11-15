---
name: dev
description: Convenciones de desarrollo de este portfolio (React 19 + TypeScript + Vite + Firebase + Mantine). Leerla antes de escribir o mover código en src/ o scripts/. La usan los agentes dev; el orquestador reparte el trabajo y evita duplicados.
license: MIT
metadata:
  adapted-from: vercel-labs/agent-skills · skills/composition-patterns (MIT, © Vercel)
  version: '0.2.0'
---

# dev

Quien la lee es un **agente dev**: ejecuta UN paquete de trabajo que le dio el orquestador, dentro de los
archivos que se le asignaron. No decide el alcance, no toca archivos ajenos.

## Reglas del juego
1. **Alcance cerrado**: editar solo los archivos de tu paquete. Si necesitás algo de otro paquete, lo pedís en tu reporte; no lo escribís.
2. **No repetir**: antes de crear un tipo, hook, helper o constante, buscar (`Grep`) si ya existe en `domain/`, `hooks/`, `services/`, `config/`, `lib/`. Si existe, se importa. Si lo necesitan 2+ paquetes, es del orquestador (va a `domain/` o `lib/` antes de que arranquen).
3. **UI intacta**: mismas clases CSS, mismo DOM, mismos textos. No tocar `*.css` ni `public/`. Cambio que pueda alterar el DOM → avisarlo en el reporte.
4. **Sin commit/push** nunca. Sin leer la service account.
5. **Verificar antes de reportar**: `pnpm exec tsc --noEmit` y `pnpm run lint` limpios en tus archivos. Si el cambio toca contenido o esquema: `pnpm run check:offline` y `pnpm run verify:parity`.
6. **Reporte corto** (≤10 líneas): archivos tocados, exports nuevos (nombre + firma), pendientes para otro paquete, riesgos.
7. Disco lento: no escribir de más, no reformatear archivos que no cambiás.

## Arquitectura (dependencias solo hacia abajo)
```
pages/ → features(=components/ en la web pública, admin/ en el BO) → hooks/ → services/ → domain/
```
- `domain/`: tipos + `schema` puro (sin React ni SDK). Lo usan web, BO y scripts.
- `services/`: ÚNICO lugar con `firebase/*`, `emailjs`, `localStorage`. Devuelven tipos de `domain/`.
- `hooks/`: estado + efectos; hablan con `services/`. Nada de `document.querySelector` con clases CSS fuera de un hook (usar `ref` o `config/selectors.ts`).
- `features/`: componentes de una sección. `pages/`: componen features, sin lógica ni SDK.
- Principio (de composition-patterns): solo el provider/hook sabe de dónde viene el dato; la UI consume `{ state, actions }`.

## TypeScript
- `strict: true`. Prohibido `any` (usar `unknown` + narrowing), `@ts-ignore`, casts `as X` sin comentario. `satisfies` y uniones discriminadas antes que casts.
- Tipo de retorno explícito en exports (hooks, servicios, funciones de `domain/`). Props con `interface XProps`.
- Entidades en `domain/types.ts`: `Localized<T> = { es: T; en: T }`, `Project`, `Job`, `Education`, `SkillGroup`, `WorkItem`, `ContentDoc`. Nada de tuplas posicionales en el modelo.
- Firestore: sin arrays anidados (ver encode/decode en `schema`). Un converter tipado por colección (`FirestoreDataConverter<T>`).
- Imports con `import type` para tipos. Rutas con alias `@/` → `src/`.
- Env: `import.meta.env.VITE_*` tipado en `vite-env.d.ts` (EmailJS). La config web de Firebase es pública: objeto plano en `services/firebase.ts`, sin base64 ni env (el CI no tiene variables). Sin secretos en el frontend.

## React
- React 19: sin `forwardRef` (ref como prop), `use()` si aplica. Sin `useEffect` para derivar estado; derivarlo en render.
- Efectos: siempre con cleanup; sin `eslint-disable` de deps (reestructurar).
- Keys por `id` estable, nunca por texto. Props booleanas de modo → variantes explícitas o composición; `children` antes que `renderX`.
- Hooks custom: `useXxx` en `hooks/`, un propósito, devuelven objeto nombrado (`{ items, status, error, actions }`).
- Errores: un `notifyError` central; `ErrorBoundary` alrededor de WebGL y de datos remotos.
- Router: `react-router` (basename `/portfolio`), guard con `<Navigate>`, cambios sin guardar con `useBlocker`.

## Archivos y nombres
- Componentes `PascalCase.tsx`, hooks `useCamelCase.ts`, servicios `camelCaseService.ts`/`xxxRepo.ts`, tipos en `domain/`.
- Un componente por archivo; si pasa de ~200 líneas, partir. Shaders/GLSL en `shaders/*.ts`.
- `.jsx → .tsx` hojas primero; mover con `git mv` (conserva historial).

## Referencias
- `references/refactor-ts.md`: misión del refactor a TS (reglas, orden y mapa archivo → destino).
