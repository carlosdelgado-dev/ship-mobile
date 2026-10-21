#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const http = require('http');
const catalog = require('../web/catalog.js');
const { STEPS, CLOSED_DAYS, daysSince, plusDays, orgCanSkip, nextAction, gatesFor } = catalog;

const PROGRESS_FILE = path.join(process.cwd(), '.ship-progress.json');
const WEB_ROOT = path.join(__dirname, '..', 'web');
const PLATFORMS = [['android', 'Android'], ['ios', 'iOS'], ['both', 'Android + iOS']];
const FRAMEWORKS = [
  ['react-native', 'React Native (CLI)'],
  ['expo', 'Expo (EAS)'],
  ['flutter', 'Flutter'],
  ['native', 'Nativo (Kotlin / Swift)'],
];
const ACCOUNTS = [
  ['personal', 'Personal nueva, si Play no exige organización (hay 14 días)'],
  ['org', 'Organización ya verificada'],
  ['unknown', 'Aún no lo sé'],
];
const label = (list, key) => (list.find((x) => x[0] === key) || [])[1] || key;

const paint = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
const bold = paint(1), dim = paint(2), green = paint(32), yellow = paint(33), cyan = paint(36);

function load() {
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { return { done: {}, skipped: {} }; }
}
const save = (s) => fs.writeFileSync(PROGRESS_FILE, JSON.stringify(s, null, 2));
const stepsFor = (st) => STEPS.filter((s) => s.platform === 'all' || st.platform === 'both' || s.platform === st.platform);
const cmdsFor = (step, fw) => (step.commands ? step.commands[fw] || step.commands.default || [] : []);
const finished = (st, step) => !!(st.done && st.done[step.id]) || !!(st.skipped && st.skipped[step.id]);

let rl, waiter = null, closed = false;
const queue = [];
function initInput() {
  rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (l) => { if (waiter) { const w = waiter; waiter = null; w(l); } else queue.push(l); });
  rl.on('close', () => { closed = true; if (waiter) { const w = waiter; waiter = null; w('q'); } });
}
function ask(q) {
  process.stdout.write(q);
  if (queue.length) return Promise.resolve(queue.shift());
  if (closed) return Promise.resolve('q');
  return new Promise((r) => { waiter = r; });
}
async function menu(title, options) {
  for (;;) {
    console.log('\n' + bold(title));
    options.forEach(([, name], i) => console.log(`  ${i + 1}) ${name}`));
    const a = (await ask('> ')).trim().toLowerCase();
    if (a === 'q') { console.log('Hasta luego. Tu progreso queda guardado.'); process.exit(0); }
    const n = parseInt(a, 10);
    if (n >= 1 && n <= options.length) return options[n - 1][0];
    console.log(yellow('Opción inválida.'));
  }
}

function bar(done, total) {
  const w = 24, f = total ? Math.round((done / total) * w) : 0;
  return `[${'█'.repeat(f)}${'░'.repeat(w - f)}] ${done}/${total}`;
}

function printClocks(st) {
  if (st.accounts === 'wait') console.log(yellow('Cuentas: alta enviada, verificación en curso. Sigue con el resto; no esperes parado.'));
  else if (st.accounts === 'ok') console.log(green('Cuentas: listas.'));
  if (st.closedStartedAt && st.playAccount === 'org') {
    console.log(dim(`Prueba cerrada anotada el ${st.closedStartedAt}. Con organización verificada ese plazo no bloquea producción; confírmalo en la consola.`));
  } else if (st.closedStartedAt && st.playAccount !== 'org') {
    const since = daysSince(st.closedStartedAt);
    const earliest = plusDays(st.closedStartedAt, CLOSED_DAYS);
    if (since < CLOSED_DAYS) {
      console.log(yellow(`Prueba cerrada: día ${since + 1} de ${CLOSED_DAYS}. Producción como pronto el ${earliest}.`));
      console.log(dim('  La fecha que vale es la de Play Console. Esto solo evita pedirlo antes de tiempo.'));
    } else {
      console.log(green(`Prueba cerrada: ya pasaron ${CLOSED_DAYS} días (desde ${st.closedStartedAt}). Revisa si Play ya habilita producción.`));
    }
  }
  if (st.iosSubmittedAt) console.log(cyan(`Revisión de App Store enviada el ${st.iosSubmittedAt}. Suele responder en 24-48 h, a veces más.`));
  if (st.playSubmittedAt) console.log(cyan(`Producción de Play enviada el ${st.playSubmittedAt}.`));
}

function printStep(step, idx, total, fw) {
  const head = idx ? `${cyan(`[${idx}/${total}]`)} ` : '';
  console.log('\n' + '─'.repeat(64));
  console.log(`${head}${dim(step.phase)} · ${bold(step.title)}  ${dim('~' + step.time)}`);
  if (step.why) console.log(`  ${step.why}`);
  if (step.tip) console.log(yellow('  → ' + step.tip));
  const cmds = cmdsFor(step, fw);
  if (cmds.length) {
    console.log('');
    cmds.forEach((c) => console.log(c.startsWith('#') ? dim('  ' + c) : green('  $ ' + c)));
  }
  if (step.id === 'prep-accounts') {
    console.log(cyan('\n  Crear Play Console:  https://play.google.com/console/signup'));
    console.log(cyan('  Abrir Play Console:   https://play.google.com/console'));
    console.log(cyan('  Inscribir Apple:      https://developer.apple.com/programs/enroll/'));
    console.log(cyan('  Cuenta de Apple:      https://developer.apple.com/account'));
  }
  if (step.links) step.links.forEach((l) => console.log(cyan('  ' + l.label + ': ' + l.href)));
  if (step.doc) console.log(dim(`\n  Más detalle: ${step.doc}`));
}

async function start() {
  initInput();
  const st = load();
  st.done = st.done || {};
  st.skipped = st.skipped || {};
  console.log(bold('\nship-mobile — publica en el menor calendario que las tiendas permiten'));
  console.log(dim('Los relojes (cuentas, 14 días, revisión) no se adelantan. El asistente evita que el resto los alargue.'));
  if (!st.platform) st.platform = await menu('¿Dónde vas a publicar?', PLATFORMS);
  if (!st.framework) st.framework = await menu('¿Con qué está hecha tu app?', FRAMEWORKS);
  if ((st.platform === 'android' || st.platform === 'both') && !st.playAccount) {
    st.playAccount = await menu('¿Qué cuenta de Google Play vas a usar?', ACCOUNTS);
  }
  save(st);
  console.log(dim(`\nPlataforma: ${label(PLATFORMS, st.platform)} · Tecnología: ${label(FRAMEWORKS, st.framework)}`));
  if (st.playAccount === 'org') console.log(dim('Cuenta de organización: puedes saltar testers y prueba cerrada si la consola no te los pide (tecla s).'));
  if (st.playAccount === 'unknown') console.log(yellow('Hasta confirmarlo, el plan incluye los 14 días. Si la app es financiera, de cripto, de salud, VPN o de un gobierno, la cuenta tiene que ser de organización: el D-U-N-S es el reloj.'));

  const steps = stepsFor(st);
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (finished(st, s)) continue;
    printStep(s, i + 1, steps.length, st.framework);
    if (orgCanSkip(st, s)) console.log(yellow('  En una organización ya verificada este paso normalmente no aplica. Pulsa s para omitirlo.'));
    const a = (await ask('\nEnter = hecho · s = no aplica · q = salir > ')).trim().toLowerCase();
    if (a === 'q') { save(st); console.log('\nProgreso guardado. Siguiente acción: ship-mobile next'); process.exit(0); }
    if (a === 's') st.skipped[s.id] = true;
    else {
      st.done[s.id] = true;
      if (s.id === 'prep-accounts' && !st.accounts) st.accounts = 'wait';
      if (s.id === 'a-closed' && !st.closedStartedAt) {
        st.closedStartedAt = new Date().toISOString().slice(0, 10);
        console.log(yellow(`Reloj de prueba cerrada: día 1 (${st.closedStartedAt}). Producción como pronto el ${plusDays(st.closedStartedAt, CLOSED_DAYS)}.`));
      }
      if (s.id === 'i-submit' && !st.iosSubmittedAt) st.iosSubmittedAt = new Date().toISOString().slice(0, 10);
      if (s.id === 'a-prod' && !st.playSubmittedAt) st.playSubmittedAt = new Date().toISOString().slice(0, 10);
    }
    save(st);
    const done = steps.filter((x) => finished(st, x)).length;
    console.log(bar(done, steps.length));
  }
  console.log(green('\nPasos marcados.'));
  console.log('La tienda todavía tiene que aprobar el envío. Antes de mandarlo: ship-mobile gate');
  printClocks(st);
  process.exit(0);
}

function status() {
  const st = load();
  if (!st.platform) return console.log('Aún no has empezado. Ejecuta: ship-mobile');
  const steps = stepsFor(st);
  const done = steps.filter((s) => finished(st, s)).length;
  console.log(`\n${bold('Progreso')} ${bar(done, steps.length)}  (${label(PLATFORMS, st.platform)} · ${label(FRAMEWORKS, st.framework || '')})`);
  printClocks(st);
  let phase = '';
  const seen = new Set();
  steps.forEach((s) => {
    if (s.phase !== phase) {
      const again = seen.has(s.phase);
      seen.add(s.phase);
      phase = s.phase;
      console.log('\n' + bold(again ? phase + ' · producción' : phase));
    }
    const mark = st.done[s.id] ? green('✔') : st.skipped[s.id] ? yellow('–') : '○';
    console.log(`  ${mark} ${s.title}`);
  });
  const n = nextAction(st);
  if (n.waiting) console.log(yellow(`\nAhora: esperar la prueba cerrada. Producción como pronto el ${n.earliest}.`));
  else if (n.step) console.log(`\nSiguiente: ${bold(n.step.title)}`);
  else console.log(green('\nPasos completos. Corre ship-mobile gate antes de enviar.'));
}

function nextCmd() {
  const st = load();
  if (!st.platform) return console.log('Aún no has empezado. Ejecuta: ship-mobile   o abre la guía: ship-mobile web');
  const n = nextAction(st);
  console.log('');
  if (n.waiting) {
    console.log(bold('Ahora: no pidas producción todavía.'));
    console.log(`La prueba cerrada va por el día ${n.day} de ${CLOSED_DAYS}. Puedes pedirla como pronto el ${n.earliest}.`);
    console.log(dim('Usa la espera para iOS, la ficha y el CI. La fecha oficial es la de Play Console.'));
  } else if (n.step) {
    console.log(bold('Ahora'));
    printStep(n.step, 0, 0, st.framework);
  } else {
    console.log(green('No quedan pasos. Corre ship-mobile gate y envía a revisión.'));
  }
  if (n.also.length) {
    console.log(bold('\nPuedes adelantar en paralelo'));
    n.also.forEach((s) => console.log('  · ' + s.title));
  }
  if (n.optional.length) {
    console.log(yellow('\nEn cuenta de organización normalmente no aplican (tecla s en el asistente):'));
    n.optional.forEach((s) => console.log('  · ' + s.title));
  }
  console.log('');
  printClocks(st);
}

function exportMd(file) {
  const st = load();
  if (!st.platform) { console.log('Primero elige plataforma y tecnología: ship-mobile'); return; }
  const steps = stepsFor(st);
  const done = steps.filter((s) => finished(st, s)).length;
  const out = [
    '---',
    'tags: [ship-mobile, checklist, release]',
    `platform: ${st.platform}`,
    `framework: ${st.framework || ''}`,
    `generated: ${new Date().toISOString().slice(0, 10)}`,
    '---',
    '',
    `# Publicación — ${label(PLATFORMS, st.platform)} (${label(FRAMEWORKS, st.framework || '')})`,
    '',
    `Progreso de pasos: ${done}/${steps.length}`,
    '',
  ];
  if (st.closedStartedAt) out.push(`Prueba cerrada iniciada: ${st.closedStartedAt}. Producción como pronto: ${plusDays(st.closedStartedAt, CLOSED_DAYS)}.`, '');
  let phase = '';
  const seen = new Set();
  steps.forEach((s) => {
    if (s.phase !== phase) {
      const again = seen.has(s.phase);
      seen.add(s.phase);
      phase = s.phase;
      out.push('', `## ${again ? phase + ' · producción' : phase}`, '');
    }
    const box = finished(st, s) ? 'x' : ' ';
    const note = st.skipped && st.skipped[s.id] ? ' _(no aplica)_' : '';
    out.push(`- [${box}] **${s.title}** \`~${s.time}\`${note}`);
    if (s.why) out.push(`  - ${s.why}`);
    if (s.tip) out.push(`  - ${s.tip}`);
    const cmds = cmdsFor(s, st.framework);
    if (cmds.length) out.push('', '```bash', ...cmds, '```', '');
    if (s.doc) out.push(`  - Detalle: [${s.doc}](${s.doc})`);
  });
  out.push('', '## Antes de enviar', '');
  gatesFor(st.platform).forEach((g) => {
    const on = st.gates && st.gates[g.id] === true;
    out.push(`- [${on ? 'x' : ' '}] **${g.title}** — ${g.how}`);
  });
  const target = file || 'SHIP-CHECKLIST.md';
  fs.writeFileSync(target, out.join('\n') + '\n');
  console.log(`Checklist exportada en ${target}.`);
}

async function gate() {
  initInput();
  const st = load();
  st.gates = st.gates || {};
  const list = gatesFor(st.platform || 'both').filter((g) => st.gates[g.id] !== true);
  console.log(bold('\nAntes de enviar'));
  console.log(dim('Cada punto que falla aquí suele costar un rechazo y otro ciclo de revisión.'));
  if (!list.length) { console.log(green('Compuerta completa.')); process.exit(0); }
  for (const g of list) {
    console.log(`\n${bold(g.title)}\n  ${g.how}`);
    const a = (await ask('Enter = cumple · n = aún no · q = salir > ')).trim().toLowerCase();
    if (a === 'q') { save(st); console.log('Progreso guardado.'); process.exit(0); }
    if (a === 'n') continue;
    st.gates[g.id] = true;
    save(st);
  }
  const pending = gatesFor(st.platform || 'both').filter((g) => st.gates[g.id] !== true);
  console.log(pending.length ? yellow(`\nFaltan ${pending.length}. No envíes todavía.`) : green('\nCompuerta completa. Ya puedes enviar a revisión.'));
  process.exit(0);
}

function clockCmd(which, date) {
  const map = { closed: 'closedStartedAt', ios: 'iosSubmittedAt', play: 'playSubmittedAt' };
  if (!map[which] || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
    console.log('Uso:');
    console.log('  ship-mobile clock closed 2026-10-20   # día en que publicaste la prueba cerrada');
    console.log('  ship-mobile clock ios 2026-10-22      # día en que enviaste a la App Store');
    console.log('  ship-mobile clock play 2026-11-05     # día en que pediste producción');
    return;
  }
  const st = load();
  st.done = st.done || {};
  st.skipped = st.skipped || {};
  st[map[which]] = date;
  save(st);
  console.log(`Reloj guardado: ${which} = ${date}`);
  printClocks(st);
}

function doctor() {
  const cwd = process.cwd();
  const here = (p) => path.join(cwd, p);
  const exists = (p) => fs.existsSync(here(p));
  const read = (p) => { try { return fs.readFileSync(here(p), 'utf8'); } catch { return ''; } };
  const ok = (m) => console.log(green('✔ ') + m);
  const warn = (m) => console.log(yellow('! ') + m);
  const info = (m) => console.log(cyan('· ') + m);

  if (exists('web/catalog.js') && exists('bin/ship.js')) {
    console.log(yellow('Estás en el repo ship-mobile, no en tu app.'));
    console.log('Entra en la carpeta del proyecto y vuelve a ejecutar: ship-mobile doctor');
    console.log('Para abrir la guía: ship-mobile web');
    return;
  }

  let kind = 'no detectada';
  const appJson = read('app.json');
  if (exists('pubspec.yaml')) kind = 'Flutter';
  else if ((exists('app.json') && appJson.includes('"expo"')) || exists('eas.json') || exists('app.config.js') || exists('app.config.ts')) kind = 'Expo';
  else if (exists('package.json') && exists('android') && exists('ios')) kind = 'React Native';
  else if (exists('android') || exists('ios') || exists('app')) kind = 'nativo o mixto';

  console.log(bold('\nDiagnóstico rápido'));
  console.log(`Carpeta: ${cwd}`);
  console.log(`Tecnología: ${kind}`);
  console.log(dim('No sustituye instalar el release en un teléfono.\n'));

  const gi = read('.gitignore');
  if (!gi) warn('No hay .gitignore. Copia templates/gitignore-app.txt de ship-mobile.');
  else {
    ['.env', '.jks', 'keystore'].forEach((token) => {
      if (gi.toLowerCase().includes(token)) ok(`.gitignore menciona ${token}`);
      else warn(`.gitignore no menciona ${token}. No subas firmas ni secretos.`);
    });
  }

  if (exists('android/key.properties') || exists('upload-keystore.jks') || exists('android/app/upload-keystore.jks')) {
    warn('Hay un keystore o key.properties en el árbol. Confirma con git status que no se van a commitear.');
  }

  const blobs = [
    read('android/app/build.gradle'),
    read('android/app/build.gradle.kts'),
    appJson,
    read('app.config.js'),
    read('app.config.ts'),
  ].join('\n');
  if (/com\.example/.test(blobs)) warn('Aparece com.example. Cámbialo antes de la primera subida: el ID no se puede cambiar después.');
  else if (blobs.trim()) ok('No aparece com.example en los archivos de identificador revisados.');

  if (kind === 'Expo' && !exists('eas.json')) warn('No hay eas.json. En ship-mobile está templates/eas.json; autoIncrement evita repetir versionCode.');
  if (kind === 'Expo' && exists('eas.json')) ok('eas.json presente.');

  const vc = blobs.match(/versionCode\s+(\d+)/);
  if (vc) info(`versionCode de Android visto: ${vc[1]}. Cada subida a Play tiene que usar uno mayor.`);

  const envBlob = read('.env') + '\n' + read('.env.production') + '\n' + appJson;
  if (/localhost|10\.0\.2\.2|staging/i.test(envBlob)) {
    warn('Vi localhost, 10.0.2.2 o staging en .env o app.json. El release tiene que apuntar a producción.');
  }

  console.log(dim('\nLista de rechazo: ship-mobile gate'));
}

function serveWeb() {
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  const port = Number(process.env.PORT) || 4173;
  const server = http.createServer((req, res) => {
    const raw = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
    const file = path.normalize(path.join(WEB_ROOT, rel));
    if (file !== WEB_ROOT && !file.startsWith(WEB_ROOT + path.sep)) {
      res.writeHead(403); res.end('Ruta no permitida'); return;
    }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('No encontrado'); return; }
      const type = types[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(bold(`Guía web en http://127.0.0.1:${port}`));
    console.log(dim('El progreso se guarda en el navegador. Ctrl+C para parar.'));
    console.log(dim('Para llevarlo a la app: en la web, Exportar JSON, y deja el archivo en la carpeta del proyecto.'));
  });
}

function help() {
  console.log(`
${bold('ship-mobile')} — publica en Google Play y App Store sin alargar los relojes

  ship-mobile            Asistente (retoma donde lo dejaste)
  ship-mobile next       Solo la siguiente acción, y qué hacer en paralelo
  ship-mobile status     Progreso y relojes (14 días, revisión)
  ship-mobile web        Abre la guía visual en http://127.0.0.1:4173
  ship-mobile gate       Compuerta previa al envío (evita un rechazo)
  ship-mobile doctor     Revisa la carpeta de tu app (ID, firmas, .gitignore)
  ship-mobile export     Genera SHIP-CHECKLIST.md
  ship-mobile clock closed AAAA-MM-DD
                         Anota cuándo empezó la prueba cerrada
  ship-mobile reset      Borra el progreso de esta carpeta

El progreso vive en .ship-progress.json dentro de tu app.
`);
}

const cmd = process.argv[2];
if (!cmd || cmd === 'start') start();
else if (cmd === 'status') status();
else if (cmd === 'next') nextCmd();
else if (cmd === 'export') exportMd(process.argv[3]);
else if (cmd === 'reset') { try { fs.unlinkSync(PROGRESS_FILE); } catch (e) {} console.log('Progreso borrado.'); }
else if (cmd === 'web') serveWeb();
else if (cmd === 'gate') gate();
else if (cmd === 'doctor') doctor();
else if (cmd === 'clock') clockCmd(process.argv[3], process.argv[4]);
else help();
