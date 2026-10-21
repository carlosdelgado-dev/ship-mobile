---
tags: [ship-mobile, docs, troubleshooting]
---

# 05 · Errores y rechazos comunes

Pasa antes [06 · Antes de enviar](06-antes-de-enviar.md) (`ship-mobile gate` o la pestaña Pre-envío). Casi todas las filas de abajo son un ciclo de revisión que se podía haber evitado.

## Rechazos frecuentes

| Tienda | Motivo | Solución |
|---|---|---|
| Ambas | La app crashea al abrir | Prueba el build **release** en dispositivo real; revisa logs (`adb logcat`, Xcode Devices) |
| Ambas | No pueden iniciar sesión | Agrega cuenta demo con datos y notas de revisión |
| Ambas | Política de privacidad ausente o inaccesible | URL pública, sin login, con el nombre de tu app |
| Ambas | Datos declarados ≠ datos reales | Alinea *Data safety* / *App Privacy* con tus SDKs (analytics, ads, Firebase) |
| Ambas | Sin opción de eliminar cuenta | Agrega "Eliminar cuenta" dentro de la app |
| Ambas | Contenido de prueba / placeholder / "beta" | Quita textos lorem ipsum y pantallas de desarrollo |
| iOS | Guideline 4.8: login social sin Sign in with Apple | Añade Sign in with Apple (o cumple una excepción) |
| iOS | Falta texto de permisos (`NS...UsageDescription`) | Escribe un motivo claro por cada permiso |
| iOS | Funcionalidad mínima / app = web envuelta | Aporta valor nativo real |
| iOS | Pagos de contenido digital fuera de IAP | Usa compras in-app de Apple |
| iOS | Billetera o exchange sin cuenta de organización, o sin licencia en un país de la ficha | Inscribe la organización, adjunta la licencia de ese país o quítalo de la distribución, y deja una cuenta demo que entra a los flujos |
| Android | Target API por debajo de lo que pide Play | Teléfono: Android 16, API 36, desde el 31 de agosto de 2026. Wear OS y Automotive: API 35. TV y XR: API 34. [Requisito oficial](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es-419) |
| Android | Permisos sensibles sin justificación | Quita el permiso o completa la declaración |

## Errores de build

| Error | Causa probable | Arreglo |
|---|---|---|
| `versionCode X has already been used` | AAB con el mismo código | Sube `versionCode` |
| `You uploaded an APK/AAB signed with the wrong key` | Firmaste con otra clave | Usa la upload key registrada, o solicita reseteo en Play Console |
| `No signing certificate` / `No profiles for 'com.x'` (iOS) | Firma sin configurar | Selecciona Team + firma automática, o ejecuta `fastlane match` |
| `The bundle version must be higher` (iOS) | Build number repetido | Sube el Build number |
| `Missing Privacy Manifest` / `ITMS-91053` (iOS) | SDK de terceros sin declarar uso de APIs | Actualiza las librerías o agrega `PrivacyInfo.xcprivacy` |
| `Pod install` falla | Caché / versión | `cd ios && pod deintegrate && pod install --repo-update` |
| Gradle `OutOfMemory` | Heap bajo | `org.gradle.jvmargs=-Xmx4g` en `gradle.properties` |
| `Unable to find a destination` | Destino equivocado | Selecciona *Any iOS Device (arm64)* para archivar |

## Si ya publicaste y algo sale mal
- **Android:** *Producción → Detener despliegue*, sube parche con `versionCode` mayor.
- **iOS:** pausa el lanzamiento por fases, o *Remover de la venta* si es grave; envía una versión corregida (puedes pedir **revisión acelerada** para arreglos críticos).
