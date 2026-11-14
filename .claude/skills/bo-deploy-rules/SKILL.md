---
name: bo-deploy-rules
description: Despliega las reglas de Firestore y verifica que sigan siendo restrictivas (lectura pública, escritura solo admins).
---
1. Revisar `firestore.rules`: la escritura exige `isAdmin()` (mail en la lista + `email_verified`) y la colección está en la lista permitida. Nunca `allow write: if true`.
2. Los mails de `firestore.rules` y `src/services/firebase.js` (`ADMIN_EMAILS`) deben coincidir.
3. `firebase deploy --only firestore:rules --project counter-a05c4` (la CLI ya está logueada).
