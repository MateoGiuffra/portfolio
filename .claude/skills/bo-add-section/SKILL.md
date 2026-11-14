---
name: bo-add-section
description: Receta para agregar una sección o lista editable de punta a punta (esquema, migración, web y backoffice).
---
1. `schema.js`: agregar a `SECTION_SPECS` (texto suelto) o `LIST_SPECS` + `listSources` (lista), y a `COLLECTIONS` si es una colección nueva.
2. `firestore.rules`: sumar la colección a las dos listas (lectura pública / escritura admin) y desplegar con `bo-deploy-rules`.
3. `assemble()`: decodificar hacia la forma que consume el componente (misma forma que `content.js`).
4. Componente: leer del `t` ya armado; si es una lista nueva, agregar su plantilla en `NEW_ITEM` y una pestaña en `src/admin/Admin.jsx`.
5. `bo-migrate` y luego `bo-parity`. Pedir OK al usuario antes de commit/push.
