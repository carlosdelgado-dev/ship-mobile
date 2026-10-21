---
tags: [ship-mobile, docs, preflight]
---

# 06 · Antes de enviar

Cada fila de esta lista, si falla, suele costar un rechazo y otro turno de revisión (en iOS, a menudo 24-48 h más; en Play, otro ciclo entero). Pásala sobre **el mismo binario** que vas a subir, no sobre el debug.

En la terminal: `ship-mobile gate`. En la web: pestaña **Pre-envío**.

## Las dos tiendas

- [ ] El release abre en un teléfono real. Ciérralo, ábrelo, entra y usa la función principal.
- [ ] Ese binario habla con la API de producción. Nada de localhost, staging ni un menú de desarrollador.
- [ ] La política de privacidad abre en una ventana privada, con el nombre de la app y un email.
- [ ] Si la app crea cuentas: se pueden borrar **dentro de la app** (Apple) y hay una **URL pública** que lo explica (Play). Plantilla: [`templates/account-deletion.md`](../templates/account-deletion.md).
- [ ] La cuenta demo entra ahora mismo. Sin 2FA, o con el código escrito en las notas. Plantilla: [`templates/review-notes.md`](../templates/review-notes.md).
- [ ] Seguridad de los datos (Play) y Privacidad de la app (Apple) incluyen lo que recopilan tus SDK: analytics, ads, crashes, Firebase.
- [ ] Cada permiso se usa de verdad. En iOS el texto dice qué pantalla lo necesita, no «para mejorar tu experiencia».
- [ ] No queda lorem ipsum, «beta», «TODO» ni capturas que no son la app.
- [ ] Lo que se vende dentro de la app (suscripción, desbloqueo digital) pasa por la compra de la tienda.

## Solo iOS

- [ ] Si hay login con Google, Facebook u otra red, también está Sign in with Apple. Si el login es solo el tuyo, no hace falta.
- [ ] El ícono de 1024×1024 no tiene transparencia ni esquinas redondeadas hechas por ti.
- [ ] TestFlight no está parado en «falta cumplimiento de exportación». Si solo usas HTTPS, dilo ahí. TestFlight no sustituye un plazo de 14 días: eso es de ciertas cuentas de Play.
- [ ] Hay capturas del tamaño que marca la ficha, y de iPad si la app lo admite. No hace falta vídeo de vista previa.
- [ ] La clasificación por edad sale del cuestionario, con las funciones reales. No se elige un 18+ para “cubrirse” si el cuestionario no lo da.
- [ ] Si la app es una billetera de cripto, el desarrollador está inscrito como organización. Si hay compra y venta, hay exchange aprobado y licencia en cada país de la ficha, más una cuenta demo que entra a esos flujos. [Directrices](https://developer.apple.com/app-store/review/guidelines/es/).

## Solo Android

- [ ] El AAB de teléfono apunta a Android 16 (API 36) o al nivel que indique la consola. Wear OS y Automotive piden API 35; TV y XR, API 34. [Requisito de API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es-419).
- [ ] Si la app es de banca, préstamos, trading, fondos, exchange, billetera de software de criptomonedas, salud de las categorías que Play lista, VPN o un gobierno, la cuenta es de **organización** con D-U-N-S. Una cuenta personal no cumple esa política.
- [ ] La declaración de funciones financieras está enviada. Todas las apps la completan; si no hay ninguna, se certifica así. En cripto, declara la función real y quita los países sin licencia. [Política de exchanges y billeteras](https://support.google.com/googleplay/android-developer/answer/16329703?hl=es-419).

Cuando esté todo marcado, envía. Mirar la consola cada hora no adelanta la revisión.
