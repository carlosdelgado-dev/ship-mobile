# ship-mobile

Guía open source para publicar en **Google Play** y la **App Store** en el menor calendario que las tiendas permiten.

El trabajo de build, ficha y formularios cabe en uno o dos días. Lo que alarga la publicación son tres esperas que no se pueden acortar: la verificación de las cuentas, los **14 días de prueba cerrada** de una cuenta personal nueva en Play, y la revisión. Este repo te dice cuál encender hoy y qué hacer mientras corre, con los comandos de React Native, Expo, Flutter y nativo.

![Calendario corto: cuentas el día 0, prueba cerrada de Android 14 días, revisión de iOS en paralelo](web/img/ruta.svg)

## Abrir la guía

Desde esta carpeta:

```bash
node bin/ship.js web
```

Abre http://127.0.0.1:4173. También puedes abrir `web/index.html` en el navegador, sin servidor.

En GitHub Pages: *Settings → Pages → Source: GitHub Actions* y push a `main`. El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publica la carpeta `web/`.

La web lleva el control: el paso de hoy, el día de la prueba cerrada, el estado de cada tienda y una compuerta antes de enviar. El progreso se queda en el navegador. **Exportar JSON** lo guarda como `.ship-progress.json` para la terminal, e **Importar** lo trae de vuelta.

## Usarla dentro de tu app

Hace falta Node.js 18 o superior. No instala dependencias.

```bash
git clone https://github.com/<tu-usuario>/ship-mobile.git
cd ship-mobile && npm link
cd /ruta/a/tu-app && ship-mobile
```

Sin `npm link`: `node /ruta/ship-mobile/bin/ship.js` desde tu app, o `node bin/ship.js web` desde este repo.

| Comando | Para qué |
|---|---|
| `ship-mobile` | Asistente. Retoma donde lo dejaste. `s` marca un paso como no aplica |
| `ship-mobile next` | Solo la siguiente acción, y qué puedes adelantar en paralelo |
| `ship-mobile status` | Progreso y relojes |
| `ship-mobile web` | Esta guía en el navegador |
| `ship-mobile gate` | Compuerta previa al envío. Evita un rechazo y otro ciclo de revisión |
| `ship-mobile doctor` | En la carpeta de tu app: ID `com.example`, firmas y `.gitignore` |
| `ship-mobile clock closed 2026-10-20` | Anota el día en que publicaste la prueba cerrada |
| `ship-mobile export` | `SHIP-CHECKLIST.md` con casillas |
| `ship-mobile reset` | Borra `.ship-progress.json` de la carpeta actual |

Ese JSON es de tu app. Ya está ignorado en este repo; añádelo al `.gitignore` de la tuya (`templates/gitignore-app.txt`).

## Qué acorta de verdad el calendario

1. **Da de alta las dos cuentas el día 0**, aunque el build no exista. Márcalo hecho al enviar el alta, no al recibir la verificación.
2. **Publica la prueba cerrada en cuanto el AAB instale, si la cuenta es personal y se creó después del 13 de noviembre de 2023.** Son 12 testers durante 14 días ([`templates/mensaje-testers.md`](templates/mensaje-testers.md)). La prueba interna no cuenta. Puedes subir otro build mientras el reloj corre. Una organización ya verificada no tiene ese requisito. Si la app es financiera, de cripto, de salud, VPN o de un gobierno, la cuenta tiene que ser de organización: el D-U-N-S (gratis, hasta unos 30 días) es el reloj, y una cuenta personal no lo sustituye.
3. **iOS va en paralelo.** El Archive sale de Xcode (Any iOS Device → Product → Archive → Organizer → App Store Connect). TestFlight no pide 14 días. Sin Mac, Expo (EAS), Codemagic o un runner macOS. Si la app es una billetera o un exchange, la cuenta de Apple es de organización y las licencias van en el primer envío ([`docs/03-ios.md`](docs/03-ios.md)).
4. **Ficha mínima, no una campaña.** Ícono, feature graphic y 2 o 3 capturas del simulador ([imagen](web/img/assets.svg)). El marketing se edita con la prueba ya corriendo.
5. **Pasa la compuerta antes de enviar** ([`docs/06-antes-de-enviar.md`](docs/06-antes-de-enviar.md)). Cuenta demo, política en una URL pública, borrar cuenta, y Data safety coherente con tus SDK. Un rechazo te devuelve al final de la cola.
6. **La primera subida a Play es manual.** Automatiza desde la segunda versión, durante los 14 días de espera ([`docs/04-ci-cd.md`](docs/04-ci-cd.md)).

## Qué hay en el repo

| Ruta | Contenido |
|---|---|
| [`web/`](web/index.html) | Panel: hoy, relojes, pasos, pre-envío y prompts de políticas |
| [`docs/00-indice.md`](docs/00-indice.md) | Calendario, tiempos y qué máquina necesitas |
| [`docs/01-preparacion.md`](docs/01-preparacion.md) | ID, cuentas, assets, release |
| [`docs/02-android.md`](docs/02-android.md) | Play Console, firma, AAB, pruebas, producción |
| [`docs/03-ios.md`](docs/03-ios.md) | Bundle ID, firma, TestFlight, revisión |
| [`docs/04-ci-cd.md`](docs/04-ci-cd.md) | EAS, GitHub Actions y fastlane |
| [`docs/05-errores-comunes.md`](docs/05-errores-comunes.md) | Rechazos y errores de build |
| [`docs/06-antes-de-enviar.md`](docs/06-antes-de-enviar.md) | Lista que evita perder un ciclo de revisión |
| [`templates/`](templates) | Privacidad, baja de cuenta, ficha, notas del revisor, mensaje a testers, `eas.json`, CI, Fastfile |

Los pasos viven en [`web/catalog.js`](web/catalog.js). La web y la terminal leen el mismo archivo.

Los requisitos de SDK, capturas y cuentas nuevas cambian. Los pasos están pensados para durar, pero el texto que manda es el de [Play Console](https://play.google.com/console) y [App Store Connect](https://appstoreconnect.apple.com). Si algo cambió, abre un PR.

## Contribuir

[CONTRIBUTING.md](CONTRIBUTING.md). Licencia [MIT](LICENSE).
