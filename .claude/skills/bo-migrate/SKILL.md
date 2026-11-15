---
name: bo-migrate
description: Migra el contenido de content.js a Firestore y verifica paridad. Usar cuando se agregan secciones/campos o hay que repoblar la base.
---
1. `pnpm run check:offline` → debe decir "0 diferencias" (content.js → docs → content, sin base de datos).
2. `pnpm run seed` → escribe solo lo que no existe. Para repoblar todo (pisa ediciones del BO): `pnpm run seed -- --force`, pidiendo confirmación al usuario antes.
3. `pnpm run verify:parity` → debe decir "OK".
La clave de administración está en `~/.config/firebase/counter-a05c4-admin.json`; no la leas ni la copies.
