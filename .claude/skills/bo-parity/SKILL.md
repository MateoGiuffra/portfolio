---
name: bo-parity
description: Prueba visual de paridad de la web (hash de textos por sección y colores de tarjetas, ES y EN) con Claude in Chrome. Usar tras cualquier cambio de datos o de componentes.
---
1. Con el dev server en `http://localhost:5173/` y Chrome conectado, para cada idioma (`localStorage['portfolio-lang']` = `es` | `en`):
   limpiá `portfolio-content-v1`, recargá, esperá ~5 s y calculá SHA-256 (primeros 12 hex + largo) del `innerText` de `header`, cada `main section[id]` y `footer`, más `--card-bg/fg/accent` de cada `.fcard`.
2. Compará con la línea base (guardada en el scratchpad de la sesión que la generó, `baseline.json`, o regenerala desde la rama `main` limpia con `VITE` sin datos remotos).
3. Reportá "idéntico" o la lista exacta de secciones/idiomas que difieren. Revisá también una captura a 1366×768.
Línea base vigente (14/11/2026) — ES: header d87d2f49543c, top 85def3899d99, experience 1653d6a888fe, projects 11f3efe5f0d7, work 521eea04af75, skills 1b49fb21f49a, contact 6cb827d368b6, footer 0ee8d0b0f303.
EN: header c785690316a1, top d05b5b489c5c, experience e07ba4fcfc24, projects 6f554f3e6077, work f0e9516912a4, skills 63ca11d280ef, contact e5896ba79893, footer 0ee8d0b0f303.
(Si se cambia contenido a propósito, la línea base cambia: regenerarla.)
