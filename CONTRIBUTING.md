# Contribuir

Los pasos, los prompts y la compuerta previa al envío viven en [`web/catalog.js`](web/catalog.js). La web y la terminal leen ese archivo. [`data/steps.js`](data/steps.js) solo reexporta la lista, para no tener dos copias.

1. Haz fork y crea una rama: `git checkout -b fix/paso-ios-firma`.
2. Edita `web/catalog.js` o los `.md` de `docs/`.
3. Prueba el flujo: `printf '3\n1\n2\nq\n' | node bin/ship.js` y abre la guía con `node bin/ship.js web`.
4. Abre un PR con qué cambió en las tiendas, la fecha y el enlace a la fuente oficial.

## Reglas

- Un paso = una acción comprobable. Si enciende una espera (cuenta, prueba cerrada, revisión), dilo en `tip` y pon `startsClock`.
- Los comandos se copian tal cual. Las notas empiezan con `#`.
- Nunca incluyas claves, keystores ni IDs reales.
- Sin dependencias npm: el CLI sigue funcionando con solo Node.js 18+.
