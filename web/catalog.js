// Fuente única de los pasos, prompts y la compuerta previa al envío.
// La usan la web (window.SHIP) y el CLI (require).
// platform: 'all' | 'android' | 'ios'
// commands: líneas que empiezan por '#' son notas, no comandos.
// startsClock: 'verify' | 'closed-14' | 'app-review' | 'play-review'

const CLOSED_DAYS = 14;

const STEPS = [
  {
    id: 'prep-accounts', phase: 'Preparación', platform: 'all', time: '30 min + espera',
    title: 'Da de alta Play Console y Apple Developer hoy',
    why: 'Google Play son USD 25, un solo pago: el alta está en play.google.com/console/signup. Apple Developer son USD 99 al año: la inscripción está en developer.apple.com/programs/enroll. Márcalo hecho cuando envíes el alta, no cuando terminen de verificarte.',
    tip: 'La verificación de identidad es el primer reloj. Si la app es de una empresa, las dos cuentas son de esa empresa. En Play, finanzas, cripto, salud, VPN y gobiernos exigen organización. En la App Store, una billetera de cripto la ofrece un desarrollador inscrito como organización.',
    startsClock: 'verify',
    screen: ['Cuentas de desarrollador', 'Enviar alta'],
    doc: 'docs/01-preparacion.md#2-cuentas-de-desarrollador',
  },
  {
    id: 'prep-id', phase: 'Preparación', platform: 'all', time: '5 min',
    title: 'Fija el ID (applicationId y Bundle ID) y no lo vuelvas a tocar',
    why: 'Formato com.tuempresa.nombreapp. Es permanente después de la primera publicación. Usa el mismo en las dos tiendas.',
    tip: 'No uses com.example. Después de subir el primer AAB a esa ficha, el applicationId no se cambia.',
    screen: ['Identificador', 'com.tuempresa.app'],
    doc: 'docs/01-preparacion.md#1-identificador-y-versión',
  },
  {
    id: 'prep-financial', phase: 'Preparación', platform: 'android', time: 'hasta 30 días si falta el D-U-N-S',
    title: 'Si hay finanzas, cripto, salud, VPN o un gobierno: confirma la cuenta de organización',
    why: 'Play exige cuenta de organización para banca, préstamos, trading, fondos, exchange y billetera de software de criptomonedas, y también para ciertas apps de salud, VPN y gobiernos. Hace falta el D-U-N-S de la titular. Pedirlo en Dun & Bradstreet es gratis y, si la empresa no lo tiene, puede tardar hasta 30 días.',
    tip: 'Si tu app no entra en esa lista, márcalo como no aplica. Si entra, no abras una cuenta personal para evitar los 14 días: no cumple la política. Trabaja sobre la Play Console de la empresa si ya está verificada.',
    startsClock: 'verify',
    screen: ['Cuenta de organización', 'D-U-N-S'],
    doc: 'docs/02-android.md#apps-financieras-y-de-criptomonedas',
  },
  {
    id: 'prep-testers', phase: 'Preparación', platform: 'android', time: '20 min',
    title: 'Consigue 12 testers con Android antes de tener el build',
    why: 'Solo las cuentas personales creadas después del 13 de noviembre de 2023 necesitan 12 personas opted-in durante 14 días seguidos antes de producción. La prueba interna no cuenta para ese plazo.',
    tip: 'Mándales el mensaje hoy (templates/mensaje-testers.md). Si la cuenta es de organización, márcalo como no aplica. Si la app es financiera o de cripto, la cuenta personal no es una opción: hace falta la organización.',
    screen: ['Lista de testers', '12 cuentas de Google'],
    doc: 'templates/mensaje-testers.md',
  },
  {
    id: 'prep-privacy', phase: 'Preparación', platform: 'all', time: '30 min',
    title: 'Publica la política de privacidad en una URL que abra sin login',
    why: 'Las dos tiendas bloquean el envío si no hay URL pública. Sirve GitHub Pages, un Notion público o tu web. Revisa templates/privacy-policy.md y hazla coincidir con lo que de verdad recopilas.',
    tip: 'Una página fea y correcta hoy vale más que una página bonita la semana que viene. Pruébala en una ventana privada.',
    screen: ['Política de privacidad', 'Publicar URL'],
    doc: 'templates/privacy-policy.md',
  },
  {
    id: 'prep-demo', phase: 'Preparación', platform: 'all', time: '15 min',
    title: 'Crea la cuenta demo del revisor y anota los pasos',
    why: 'Un login que falla es el rechazo más caro: pierdes el ciclo entero de revisión. Usuario real, datos de ejemplo, sin 2FA o con el código escrito en las notas.',
    tip: 'Entra tú con esas credenciales en el build que vas a subir. Plantilla: templates/review-notes.md.',
    screen: ['Cuenta demo', 'Probar login'],
    doc: 'templates/review-notes.md',
  },
  {
    id: 'prep-assets', phase: 'Preparación', platform: 'all', time: '30-45 min',
    title: 'Saca el paquete mínimo de tienda: ícono y 3 capturas reales',
    why: 'Ícono 1024×1024 sin transparencia (iOS) y 512×512 (Android), feature graphic 1024×500, y capturas del tamaño que pida cada consola (en iPhone suele ser 6.9").',
    tip: 'No esperes a un diseñador. En el simulador de iOS: archivo → guardar pantalla. En Android, captura del emulador. Tres pantallas reales. Un set ilustrado que no coincide con la app se rechaza.',
    screen: ['Assets de tienda', '3 capturas + ícono'],
    doc: 'docs/01-preparacion.md#3-assets-de-tienda',
  },
  {
    id: 'prep-prod-config', phase: 'Preparación', platform: 'all', time: '30 min',
    title: 'Deja el release apuntando a producción, sin debug ni secretos',
    why: 'API de producción, sin menús de desarrollador, sin claves en el repo. Si hay registro, la app debe poder eliminar la cuenta. Si hay login social en iOS, hace falta Sign in with Apple.',
    tip: 'Haz esta pasada antes del primer AAB o IPA. Corregirlo después de un rechazo cuesta otro ciclo de revisión.',
    screen: ['Build release', 'API de producción'],
    doc: 'docs/01-preparacion.md#4-configuración-de-producción',
  },

  {
    id: 'a-console', phase: 'Android', platform: 'android', time: '20 min',
    title: 'Crea la app en Play Console',
    why: 'play.google.com/console → Crear app. Elige idioma, app o juego, y gratis o de pago. De gratis a de pago no se puede volver atrás.',
    screen: ['Play Console', 'Crear app'],
    doc: 'docs/02-android.md#crear-app',
  },
  {
    id: 'a-keystore', phase: 'Android', platform: 'android', time: '5 min',
    title: 'Genera la upload key y guárdala fuera del repo',
    why: 'Play App Signing guarda la clave de firma. Tú subes builds firmados con la upload key. Si la pierdes, el reseteo existe, pero para el proceso.',
    commands: {
      default: [
        'keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000',
        '# Respalda el .jks y las contraseñas en un gestor de secretos. Nunca en Git.',
      ],
      expo: [
        'npx eas-cli credentials --platform android',
        '# EAS genera y custodia el keystore.',
      ],
    },
    screen: ['Firma de la app', 'upload-keystore.jks'],
    doc: 'docs/02-android.md#aab',
  },
  {
    id: 'a-signing', phase: 'Android', platform: 'android', time: '10 min',
    title: 'Configura la firma de release en el proyecto',
    commands: {
      'react-native': [
        '# android/gradle.properties local, fuera de Git: MYAPP_UPLOAD_STORE_FILE, MYAPP_UPLOAD_KEY_ALIAS, MYAPP_UPLOAD_STORE_PASSWORD, MYAPP_UPLOAD_KEY_PASSWORD',
        '# android/app/build.gradle: signingConfigs.release y buildTypes.release.signingConfig signingConfigs.release',
      ],
      native: [
        '# signingConfigs.release en app/build.gradle(.kts), leyendo credenciales de un gradle.properties local.',
      ],
      flutter: [
        '# android/key.properties fuera de Git: storePassword, keyPassword, keyAlias, storeFile',
        '# android/app/build.gradle(.kts): leer key.properties y definir signingConfigs.release',
      ],
      expo: ['# EAS firma el build con las credenciales del paso anterior. No copies un keystore al repo.'],
    },
    screen: ['signingConfigs.release', 'Guardar fuera de Git'],
    doc: 'docs/02-android.md#aab',
  },
  {
    id: 'a-version', phase: 'Android', platform: 'android', time: '2 min',
    title: 'Sube versionCode y apunta el teléfono a API 36',
    why: 'Play rechaza un AAB con un versionCode ya usado. El versionName (1.0.0) es el que ve la gente. Desde el 31 de agosto de 2026 las apps nuevas y las actualizaciones de teléfono tienen que apuntar a Android 16 (API 36). Wear OS y Automotive piden API 35; TV y XR, API 34. Hay prórroga en la consola hasta el 1 de noviembre de 2026.',
    commands: {
      'react-native': ['# android/app/build.gradle: versionCode 2, versionName "1.0.0", targetSdkVersion 36'],
      native: ['# app/build.gradle(.kts): versionCode, versionName y targetSdkVersion 36'],
      flutter: ['# pubspec.yaml → version: 1.0.0+2  (lo de después de + es el versionCode). targetSdk 36 en el módulo android.'],
      expo: ['# app.json: expo.android.versionCode, o "autoIncrement": true en eas.json. targetSdk 36.'],
    },
    screen: ['versionCode', '+1'],
    doc: 'docs/02-android.md#aab',
  },
  {
    id: 'a-build', phase: 'Android', platform: 'android', time: '10-20 min',
    title: 'Genera el AAB de release',
    why: 'Play pide AAB, no APK, en apps nuevas. Instálalo en un teléfono real antes de subirlo.',
    commands: {
      'react-native': ['cd android && ./gradlew bundleRelease', '# → android/app/build/outputs/bundle/release/app-release.aab'],
      expo: ['npx eas-cli build --platform android --profile production'],
      flutter: ['flutter build appbundle --release', '# → build/app/outputs/bundle/release/app-release.aab'],
      native: ['./gradlew bundleRelease', '# → app/build/outputs/bundle/release/app-release.aab'],
    },
    screen: ['bundleRelease', 'app-release.aab'],
    doc: 'docs/02-android.md#aab',
  },
  {
    id: 'a-listing', phase: 'Android', platform: 'android', time: '30 min',
    title: 'Completa la ficha mínima de Play Store',
    why: 'Nombre, descripción breve (80) y completa (4000), ícono 512×512 y al menos dos capturas de teléfono. El correo de contacto y la política de privacidad también van en la ficha. No hace falta un vídeo promocional.',
    tip: 'Textos en templates/store-listing.md. El feature graphic 1024×500 ayuda, y no es lo que bloquea el envío. Se puede editar mientras la prueba corre.',
    screen: ['Ficha de Play Store', 'Guardar'],
    doc: 'docs/02-android.md#ficha',
  },
  {
    id: 'a-policy', phase: 'Android', platform: 'android', time: '45 min',
    title: 'Deja en verde Contenido de la aplicación',
    why: 'En Política y programas → Contenido de la aplicación: privacidad, Seguridad de los datos, funciones financieras (todas las apps), clasificación, público objetivo, anuncios y acceso para la revisión. Si hay cuentas, la eliminación dentro de la app y una URL. Los SDK también recopilan datos: decláralos.',
    tip: 'La pestaña Políticas arma el prompt de Data safety. Revísalo tú: Play compara la declaración con el binario. En finanzas o cripto, declara la función real y revisa la política del país.',
    screen: ['Contenido de la aplicación', 'Sin bloqueos'],
    doc: 'docs/02-android.md#contenido',
  },
  {
    id: 'a-internal', phase: 'Android', platform: 'android', time: '15 min',
    title: 'Sube el AAB a prueba interna y ábrelo en un teléfono',
    why: 'Prueba y lanzamiento → Pruebas → Prueba interna: llega en minutos y admite hasta 100 testers. No es la tienda pública y no cumple los 14 días de las cuentas personales nuevas. La primera subida de una app nueva se hace a mano; la API falla si lo intentas antes.',
    tip: 'Instala en un teléfono real: inicio de sesión, operaciones, red y los flujos que no pueden fallar.',
    commands: {
      default: ['# Prueba y lanzamiento → Pruebas → Prueba interna → Crear versión → subir el .aab → notas → publicar → invitar testers'],
      expo: ['npx eas-cli submit --platform android --latest', '# La primera subida hazla a mano. EAS submit sirve desde la segunda.'],
    },
    screen: ['Pruebas internas', 'Iniciar lanzamiento'],
    doc: 'docs/02-android.md#pruebas',
  },
  {
    id: 'a-closed', phase: 'Android', platform: 'android', time: '14 días',
    title: 'Publica la prueba cerrada e invita a los 12 testers',
    why: 'Las cuentas personales creadas después del 13 de noviembre de 2023 necesitan al menos 12 testers inscritos de forma continua durante 14 días, y luego hay que pedir acceso a producción. La prueba interna no cuenta. Una organización no tiene ese requisito: márcalo como no aplica y confírmalo en el panel.',
    tip: 'Puedes subir otro AAB a la misma prueba mientras corren los 14 días. Anota la fecha: ship-mobile clock closed AAAA-MM-DD. La fecha que vale es la de la consola.',
    startsClock: 'closed-14',
    commands: {
      default: ['# Prueba y lanzamiento → Pruebas → Prueba cerrada → testers por correo → publicar → comparte el enlace de participación'],
    },
    screen: ['Pruebas cerradas', 'Invitar testers'],
    doc: 'docs/02-android.md#pruebas',
  },

  {
    id: 'i-compliance', phase: 'iOS', platform: 'ios', time: 'el reloj largo si falta la licencia',
    title: 'Si hay cripto, exchange o banca: organización y licencias',
    why: 'Una billetera de criptoactivos la ofrece un desarrollador inscrito como organización. La compra y venta tiene que ir por un exchange aprobado, con licencia en cada país de la ficha. Un servicio bancario puede exigir el documento que une la app con esa entidad.',
    tip: 'Si tu app no hace nada de eso, márcalo como no aplica. Si lo hace, no uses una cuenta personal: Apple puede pedir la licencia, el contrato con el proveedor y una cuenta demo que entre a comprar, vender, depositar y retirar.',
    screen: ['Cuenta de organización', 'Licencias por país'],
    doc: 'docs/03-ios.md#criptomonedas-y-servicios-financieros',
    links: [
      { label: 'Directrices de revisión', href: 'https://developer.apple.com/app-store/review/guidelines/es/' },
      { label: 'Inscripción de organización', href: 'https://developer.apple.com/programs/enroll/' },
    ],
  },
  {
    id: 'i-bundle', phase: 'iOS', platform: 'ios', time: '10 min',
    title: 'Registra el Bundle ID y las capacidades',
    why: 'Certificates, IDs & Profiles → Identifiers → App IDs. El identificador es el definitivo. Activa solo Push, Sign in with Apple u otras capacidades que la app use de verdad.',
    screen: ['Identifiers', 'Registrar Bundle ID'],
    doc: 'docs/03-ios.md#archive',
    links: [{ label: 'Identifiers', href: 'https://developer.apple.com/account/resources/identifiers/list' }],
  },
  {
    id: 'i-appconnect', phase: 'iOS', platform: 'ios', time: '10 min',
    title: 'Crea la ficha en App Store Connect',
    why: 'Apps → + → New App. Plataforma iOS, nombre público, Bundle ID, SKU interno (no se muestra) e idioma. Acepta los acuerdos vigentes: sin eso la ficha no deja enviar.',
    tip: 'La categoría describe la función principal. Finanzas para billetera, dinero o cripto. No hace falta un vídeo de vista previa.',
    screen: ['App Store Connect', 'Nueva app'],
    doc: 'docs/03-ios.md#ficha',
    links: [{ label: 'App Store Connect', href: 'https://appstoreconnect.apple.com/' }],
  },
  {
    id: 'i-signing', phase: 'iOS', platform: 'ios', time: '15 min',
    title: 'Activa la firma (Xcode, match o EAS)',
    why: 'Una persona y un Mac: firma automática de Xcode, con el mismo Bundle ID de la ficha. Equipo o CI: fastlane match. Expo: EAS Credentials. Sin Mac, el Archive sale en EAS, Codemagic o un runner macOS.',
    commands: {
      default: [
        '# Abre ios/*.xcworkspace, no el .xcodeproj',
        '# Xcode → Target → Signing & Capabilities → Automatically manage signing → tu Team',
        '# Equipos o CI: bundle exec fastlane match appstore',
      ],
      expo: ['npx eas-cli credentials --platform ios'],
    },
    screen: ['Signing & Capabilities', 'Automatically manage'],
    doc: 'docs/03-ios.md#archive',
  },
  {
    id: 'i-version', phase: 'iOS', platform: 'ios', time: '2 min',
    title: 'Sube el número de build',
    why: 'Cada subida a App Store Connect necesita un Build nuevo para esa versión. La Version (1.0.0) es la que ve la gente.',
    commands: {
      'react-native': ['# Xcode → Target → General → Version y Build'],
      native: ['# Xcode → Target → General → Version y Build'],
      flutter: ['# pubspec.yaml → version: 1.0.0+2  (lo que va después de + es el build number)'],
      expo: ['# app.json: expo.ios.buildNumber, o "autoIncrement": true en eas.json'],
    },
    screen: ['Version / Build', 'Build +1'],
    doc: 'docs/03-ios.md#archive',
  },
  {
    id: 'i-archive', phase: 'iOS', platform: 'ios', time: '15-25 min',
    title: 'Genera el Archive en Any iOS Device',
    why: 'El destino es Any iOS Device (arm64), nunca un simulador. En el flujo de Xcode no hace falta exportar un IPA: el Organizer lo sube. Sin Mac, este paso ocurre en la nube.',
    tip: 'Antes de subirlo, ábrelo en un iPhone: arranque, botones, permisos, HTTPS de producción y el login.',
    commands: {
      'react-native': [
        'cd ios && pod install && cd ..',
        '# Xcode → Any iOS Device (arm64) → Product → Archive',
        '# o: bundle exec fastlane gym --workspace ios/App.xcworkspace --scheme App --export_method app-store',
      ],
      expo: ['npx eas-cli build --platform ios --profile production'],
      flutter: ['flutter build ipa --release', '# → build/ios/ipa/*.ipa'],
      native: ['# Xcode → Any iOS Device (arm64) → Product → Archive'],
    },
    screen: ['Product', 'Archive'],
    doc: 'docs/03-ios.md#archive',
  },
  {
    id: 'i-upload', phase: 'iOS', platform: 'ios', time: '10 min + procesado',
    title: 'Sube el build desde el Organizer',
    why: 'Window → Organizer → Distribute App → App Store Connect → Upload. Apple lo procesa y avisa si falta el privacy manifest, un permiso o el cifrado. Hasta que el build diga listo, no se puede elegir en la versión.',
    commands: {
      default: [
        '# Xcode → Window → Organizer → Distribute App → App Store Connect → Upload',
        '# Alternativa: Transporter, o bundle exec fastlane pilot upload --ipa ruta/app.ipa',
      ],
      expo: ['npx eas-cli submit --platform ios --latest'],
    },
    screen: ['Organizer', 'Distribute App'],
    doc: 'docs/03-ios.md#archive',
    links: [{ label: 'Cómo subir compilaciones', href: 'https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/' }],
  },
  {
    id: 'i-testflight', phase: 'iOS', platform: 'ios', time: '30 min',
    title: 'Prueba en TestFlight el binario que vas a enviar',
    why: 'TestFlight no pide 14 días. Los testers internos, gente de tu equipo en App Store Connect, no pasan una revisión aparte. Responde el cumplimiento de exportación: si solo usas HTTPS, se declara en el formulario.',
    tip: 'Instala ese build en un iPhone, no uno de debug. Los testers externos sí pasan una revisión beta corta; para cazar el crash bastan los internos.',
    commands: {
      default: ['# App Store Connect → tu app → TestFlight → cumplimiento de exportación → testers internos'],
    },
    screen: ['TestFlight', 'Testers internos'],
    doc: 'docs/03-ios.md#testflight',
  },
  {
    id: 'i-metadata', phase: 'iOS', platform: 'ios', time: '45 min',
    title: 'Completa metadatos, edad y App Privacy',
    why: 'Capturas del tamaño que la ficha marque, y de iPad si la app lo admite. Descripción, palabras clave (100), URL de soporte, URL de privacidad, categoría y el cuestionario de edad. App Privacy incluye los SDK. No hace falta vídeo de vista previa.',
    tip: 'La edad sale del cuestionario, no de un número elegido. Una app financiera no es 18+ por serlo. La clasificación no autoriza a ofrecer cripto o banca a menores.',
    screen: ['Versión 1.0', 'Guardar metadatos'],
    doc: 'docs/03-ios.md#requisitos',
    links: [{ label: 'Clasificación por edad', href: 'https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/' }],
  },
  {
    id: 'i-submit', phase: 'iOS', platform: 'ios', time: '10 min + revisión',
    title: 'Asigna el build y envía a revisión',
    why: 'En la versión: el build procesado, privacidad, edad y App Review Information con la cuenta demo. Add for Review y después Submit for Review. Una ficha incompleta se rechaza y vuelve a la cola. La revisión suele tardar 24-48 h y a veces más.',
    tip: 'Si hay cripto o banca, las instrucciones tienen que dejar probar compra, venta, depósito y retiro. No convoques el lanzamiento dando por hecho que la primera revisión sale.',
    startsClock: 'app-review',
    commands: {
      default: ['# App Store Connect → versión iOS → Build → App Review Information → Add for Review → Submit for Review'],
    },
    screen: ['Add for Review', 'Submit for Review'],
    doc: 'docs/03-ios.md#revision',
    links: [{ label: 'Enviar a revisión', href: 'https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app' }],
  },
  {
    id: 'i-release', phase: 'iOS', platform: 'ios', time: '5 min',
    title: 'Elige lanzamiento manual o por fases',
    why: 'Cuando Apple aprueba, la app sale sola o esperas a pulsar publicar. El lanzamiento por fases (7 días) se puede pausar si aparecen crashes. El manual deja coincidir el día con Android, si eso importa.',
    screen: ['Lanzamiento', 'Por fases'],
    doc: 'docs/03-ios.md#revision',
  },

  {
    id: 'a-prod', phase: 'Android', platform: 'android', time: '15 min + revisión',
    title: 'Pide producción y publica con despliegue gradual',
    why: 'Prueba y lanzamiento → Producción. Elige los países, resuelve los errores que bloquean el envío y pulsa Enviar para revisión. En una cuenta personal nueva el botón aparece cuando Play da por cumplidos los 14 días. Un despliegue al 10-20 % deja margen para pausar.',
    tip: 'No hay plazo garantizado de aprobación. No convoques el lanzamiento dando por hecho que la primera revisión sale. La fecha de los 14 días es la de la consola.',
    startsClock: 'play-review',
    commands: {
      default: ['# Prueba y lanzamiento → Producción → Crear versión → el .aab ya probado → países → Enviar para revisión'],
    },
    screen: ['Producción', 'Despliegue gradual'],
    doc: 'docs/02-android.md#pruebas',
  },

  {
    id: 'post-monitor', phase: 'Post-lanzamiento', platform: 'all', time: '15 min',
    title: 'Mira crashes las primeras 48 h y deja el despliegue pausable',
    why: 'Android vitals en Play Console, y App Store Connect o tu herramienta de crashes. Si algo se rompe: detén el porcentaje en Android o pausa las fases en iOS, y sube un parche con versionCode o build number mayor.',
    screen: ['Crashes', 'Primeras 48 h'],
    doc: 'docs/05-errores-comunes.md',
  },
  {
    id: 'post-automate', phase: 'Post-lanzamiento', platform: 'all', time: '1-2 h',
    title: 'Deja la siguiente versión en un tag de Git',
    why: 'La primera ficha se hace a mano. Desde la segunda, GitHub Actions, fastlane o EAS convierten publicar en subir un tag. Hazlo durante los 14 días de la prueba cerrada, que es tiempo muerto.',
    screen: ['CI', 'git tag v1.0.1'],
    doc: 'docs/04-ci-cd.md',
  },
];

const PLAY = [
  { id: 'ART_AND_DESIGN', name: 'Arte y diseño' },
  { id: 'AUTO_AND_VEHICLES', name: 'Automóviles y vehículos' },
  { id: 'BEAUTY', name: 'Belleza' },
  { id: 'BOOKS_AND_REFERENCE', name: 'Libros y referencia' },
  { id: 'BUSINESS', name: 'Empresas' },
  { id: 'COMICS', name: 'Cómics' },
  { id: 'COMMUNICATION', name: 'Comunicación' },
  { id: 'DATING', name: 'Citas' },
  { id: 'EDUCATION', name: 'Educación' },
  { id: 'ENTERTAINMENT', name: 'Entretenimiento' },
  { id: 'EVENTS', name: 'Eventos' },
  { id: 'FINANCE', name: 'Finanzas' },
  { id: 'FOOD_AND_DRINK', name: 'Comida y bebida' },
  { id: 'HEALTH_AND_FITNESS', name: 'Salud y bienestar' },
  { id: 'HOUSE_AND_HOME', name: 'Casa y hogar' },
  { id: 'LIBRARIES_AND_DEMO', name: 'Bibliotecas y demo' },
  { id: 'LIFESTYLE', name: 'Estilo de vida' },
  { id: 'MAPS_AND_NAVIGATION', name: 'Mapas y navegación' },
  { id: 'MEDICAL', name: 'Medicina' },
  { id: 'MUSIC_AND_AUDIO', name: 'Música y audio' },
  { id: 'NEWS_AND_MAGAZINES', name: 'Noticias y revistas' },
  { id: 'PARENTING', name: 'Ser padres' },
  { id: 'PERSONALIZATION', name: 'Personalización' },
  { id: 'PHOTOGRAPHY', name: 'Fotografía' },
  { id: 'PRODUCTIVITY', name: 'Productividad' },
  { id: 'SHOPPING', name: 'Compras' },
  { id: 'SOCIAL', name: 'Social' },
  { id: 'SPORTS', name: 'Deportes' },
  { id: 'TOOLS', name: 'Herramientas' },
  { id: 'TRAVEL_AND_LOCAL', name: 'Viajes y contenido local' },
  { id: 'VIDEO_PLAYERS', name: 'Reproductores y editores de video' },
  { id: 'WEATHER', name: 'El tiempo' },
  { id: 'GAME', name: 'Juegos', subs: [
    ['GAME_ACTION', 'Acción'], ['GAME_ADVENTURE', 'Aventura'], ['GAME_ARCADE', 'Arcade'],
    ['GAME_BOARD', 'Juegos de mesa'], ['GAME_CARD', 'Cartas'], ['GAME_CASINO', 'Casino'],
    ['GAME_CASUAL', 'Casual'], ['GAME_EDUCATIONAL', 'Educativos'], ['GAME_MUSIC', 'Música'],
    ['GAME_PUZZLE', 'Puzles'], ['GAME_RACING', 'Carreras'], ['GAME_ROLE_PLAYING', 'Juegos de rol'],
    ['GAME_SIMULATION', 'Simulación'], ['GAME_SPORTS', 'Deportes'], ['GAME_STRATEGY', 'Estrategia'],
    ['GAME_TRIVIA', 'Trivia'], ['GAME_WORD', 'Palabras'],
  ] },
];

const APPLE = [
  { id: 'BOOKS', name: 'Libros' },
  { id: 'BUSINESS', name: 'Economía y empresa' },
  { id: 'DEVELOPER_TOOLS', name: 'Herramientas para desarrolladores' },
  { id: 'EDUCATION', name: 'Educación' },
  { id: 'ENTERTAINMENT', name: 'Entretenimiento' },
  { id: 'FINANCE', name: 'Finanzas' },
  { id: 'FOOD_AND_DRINK', name: 'Comida y bebida' },
  { id: 'GRAPHICS_AND_DESIGN', name: 'Gráficos y diseño' },
  { id: 'HEALTH_AND_FITNESS', name: 'Salud y forma física' },
  { id: 'LIFESTYLE', name: 'Estilo de vida' },
  { id: 'MAGAZINES_AND_NEWSPAPERS', name: 'Revistas y periódicos' },
  { id: 'MEDICAL', name: 'Medicina' },
  { id: 'MUSIC', name: 'Música' },
  { id: 'NAVIGATION', name: 'Navegación' },
  { id: 'NEWS', name: 'Noticias' },
  { id: 'PHOTO_AND_VIDEO', name: 'Foto y vídeo' },
  { id: 'PRODUCTIVITY', name: 'Productividad' },
  { id: 'REFERENCE', name: 'Referencia' },
  { id: 'SHOPPING', name: 'Compras' },
  { id: 'SOCIAL_NETWORKING', name: 'Redes sociales' },
  { id: 'SPORTS', name: 'Deportes' },
  { id: 'TRAVEL', name: 'Viajes' },
  { id: 'UTILITIES', name: 'Utilidades' },
  { id: 'WEATHER', name: 'Tiempo' },
  { id: 'STICKERS', name: 'Stickers' },
  { id: 'GAMES', name: 'Juegos', subs: [
    ['GAMES_ACTION', 'Acción'], ['GAMES_ADVENTURE', 'Aventura'], ['GAMES_CASUAL', 'Casual'],
    ['GAMES_BOARD', 'Mesa'], ['GAMES_CARD', 'Cartas'], ['GAMES_CASINO', 'Casino'],
    ['GAMES_DICE', 'Dados'], ['GAMES_EDUCATIONAL', 'Educativos'], ['GAMES_FAMILY', 'Familia'],
    ['GAMES_MUSIC', 'Música'], ['GAMES_PUZZLE', 'Puzles'], ['GAMES_RACING', 'Carreras'],
    ['GAMES_ROLE_PLAYING', 'Rol'], ['GAMES_SIMULATION', 'Simulación'], ['GAMES_SPORTS', 'Deportes'],
    ['GAMES_STRATEGY', 'Estrategia'], ['GAMES_TRIVIA', 'Trivia'], ['GAMES_WORD', 'Palabras'],
  ] },
];

const ACCOUNTS = {
  playSignup: 'https://play.google.com/console/signup',
  playConsole: 'https://play.google.com/console',
  playHelp: 'https://support.google.com/googleplay/android-developer/answer/6112435?hl=es-419',
  appleEnroll: 'https://developer.apple.com/programs/enroll/',
  appleAccount: 'https://developer.apple.com/account',
  appleDuns: 'https://developer.apple.com/enroll/duns-lookup/',
  duns: 'https://www.dnb.com/duns.html',
};

function categoryById(list, id) {
  return list.find((c) => c.id === id) || null;
}

function subcategories(store, catId) {
  const list = store === 'play' ? PLAY : APPLE;
  const cat = categoryById(list, catId);
  if (!cat) return [];
  if (cat.subs) return cat.subs.map(([id, name]) => ({ id, name }));
  if (store === 'apple' && catId !== 'STICKERS') {
    const rest = list.filter((c) => c.id !== catId && c.id !== 'GAMES' && c.id !== 'STICKERS').map((c) => ({ id: c.id, name: c.name }));
    return [{ id: 'none', name: 'Sin categoría secundaria' }].concat(rest);
  }
  return [{ id: 'none', name: 'Sin subcategoría' }];
}

const PROMPTS = [
  ['both', 'Plan de las próximas 48 horas', 'Tengo la app «{app}» ({desc}), hecha con {fw}. Categoría en Google Play: {playCat} / {playSub}. Categoría en App Store: {iosCat} / {iosSub}. Quiero publicarla lo antes posible. Cuenta de Play: {cuenta}. Datos: {datos}. SDKs: {sdks}. Login: {login}. Dame solo el plan de las próximas 48 horas: qué trámite enciende una espera que no puedo acortar, qué hago en paralelo y qué dejo para mientras corre la revisión. Una acción concreta por bloque, sin teoría. Si la categoría es Finanzas, Medicina o un juego de azar, dilo en el plan de cuentas.'],
  ['both', 'Política de privacidad', 'Actúa como especialista en privacidad para tiendas de apps. Redacta en español la Política de Privacidad de la app «{app}» ({desc}). Categoría en Google Play: {playCat} / {playSub}. Categoría en App Store: {iosCat} / {iosSub}. Datos que recopila: {datos}. SDKs de terceros: {sdks}. Contacto: {email}. Titular: {pais}. Incluye: datos recopilados, finalidad, terceros, conservación, seguridad, derechos (acceso, rectificación y eliminación de cuenta), menores, cambios y contacto. Debe ser coherente con Google Play (Seguridad de los datos) y Apple (Privacidad de la app). Entrega Markdown listo para publicar y, al final, la lista de suposiciones que hiciste.'],
  ['both', 'Eliminación de cuenta y datos', 'Redacta para la app «{app}» (login: {login}): 1) el texto de una página pública de «Cómo eliminar tu cuenta y tus datos» (Google Play pide una URL web; Apple exige poder eliminar la cuenta dentro de la app), 2) los pasos dentro de la app, 3) qué datos se borran, cuáles se conservan por obligación legal y en cuánto tiempo. Contacto: {email}. Si no hay login, dime qué declarar en su lugar.'],
  ['android', 'Seguridad de los datos (Data safety)', 'Eres experto en Google Play. App «{app}»: datos {datos}; SDKs {sdks}; login {login}. Completa el formulario de Seguridad de los datos. Por cada categoría (ubicación, información personal, financiera, mensajes, fotos y videos, audio, archivos, calendario, contactos, actividad en la app, navegación web, rendimiento y diagnósticos, identificadores) indica: ¿se recopila?, ¿se comparte?, ¿obligatorio u opcional?, finalidad, cifrado en tránsito y si se puede pedir eliminación. Responde en tabla y marca lo que debo confirmar. Recuerda que los SDKs también recopilan datos.'],
  ['android', 'Clasificación de contenido (IARC)', 'Con esta descripción de «{app}» ({desc}), responde el cuestionario de clasificación de contenido de Google Play (violencia, contenido sexual, lenguaje, sustancias controladas, apuestas, interacción entre usuarios, compartir ubicación, compras digitales). Para cada pregunta da la respuesta recomendada y por qué, y avísame si alguna respuesta cambia la clasificación.'],
  ['android', 'Público objetivo y anuncios', 'Para «{app}» ({desc}) ayúdame a responder: rango de edad del público objetivo (explica el impacto de incluir menores en la política Familias), si la app atrae a niños sin pretenderlo y si contiene anuncios (SDKs: {sdks}). Entrega las respuestas sugeridas y los riesgos de rechazo.'],
  ['android', 'Funciones financieras y cripto', 'Para «{app}» ({desc}; titular: {pais}) dime qué marcar en la declaración de funciones financieras de Play Console. Distingue: la app no tiene funciones financieras; pagos; banca, préstamos, trading o fondos; exchange de criptomonedas; billetera de software de criptomonedas (custodial o no custodial). Indica si hace falta cuenta de organización y D-U-N-S, qué países conviene quitar si no hay licencia, y qué no debo declarar de más. Enlaza la política de exchanges y billeteras solo si aplica.'],
  ['android', 'Acceso a la app (credenciales de prueba)', 'Redacta las instrucciones para el revisor de Google Play de «{app}»: cómo acceder a las funciones protegidas (login: {login}), usuario y clave de prueba con marcadores, pasos para llegar a cada función clave, restricciones de región o 2FA y cómo reiniciar los datos de prueba. Máximo 1000 caracteres, claro y numerado.'],
  ['android', 'Ficha de Play Store', 'Escribe la ficha de Google Play de «{app}» ({desc}) en español. Categoría de Play: {playCat}. Subcategoría: {playSub}. Entrega: título (máx. 30 caracteres, 3 opciones), descripción corta (máx. 80), descripción larga (máx. 4000) con beneficios en viñetas y llamada a la acción, y novedades de la versión 1.0. La categoría no se menciona como spam dentro del texto. Sin superlativos no verificables y sin otras marcas.'],
  ['ios', 'Etiquetas de privacidad (App Privacy)', 'Eres experto en App Store Connect. App «{app}»: datos {datos}; SDKs {sdks}. Completa las etiquetas de privacidad: por cada tipo de dato indica si se recopila, si se vincula a la identidad del usuario, si se usa para seguimiento (tracking) y la finalidad (funcionalidad, analítica, publicidad). Responde en tabla, incluye los datos que recopilan los SDKs y avísame si necesito mostrar el aviso App Tracking Transparency.'],
  ['ios', 'Clasificación por edad', 'Para «{app}» ({desc}; categoría {iosCat}) responde el cuestionario de clasificación por edad de App Store Connect. No elijas una edad a mano. Da la respuesta recomendada por pregunta, el resultado (4+, 9+, 13+, 16+ o 18+) y qué cambiaría si añado chat o contenido de usuarios. Si hay cripto o servicios financieros, no des por hecho que es 18+, y recuerda que la clasificación no autoriza a ofrecer esas operaciones a menores.'],
  ['ios', 'Notas para el revisor y cuenta demo', 'Redacta las notas de revisión de App Store Connect para «{app}» ({desc}; login: {login}): usuario y clave demo (marcadores), pasos para probar las funciones principales, cómo activar funciones que dependen de hardware, región o suscripción, y una explicación breve de cualquier permiso solicitado. Tono profesional, máximo 4000 caracteres.'],
  ['ios', 'Textos de permisos (Info.plist)', 'Mi app «{app}» ({desc}) usa estos permisos de iOS: [cámara, ubicación, fotos…]. Redacta para cada clave NS…UsageDescription un texto claro y específico en español (qué función lo usa y por qué), sin frases genéricas, para evitar el rechazo por la guideline 5.1.1.'],
  ['ios', 'Metadatos de App Store', 'Escribe los metadatos de App Store de «{app}» ({desc}) en español. Categoría principal: {iosCat}. Categoría secundaria o de juego: {iosSub}. Entrega: nombre (máx. 30), subtítulo (máx. 30), texto promocional (máx. 170), descripción (máx. 4000), palabras clave (máx. 100 caracteres, separadas por comas, sin repetir el nombre ni la categoría) y novedades de la versión 1.0. Sin claims no verificables ni nombres de otras marcas.'],
  ['ios', 'Revisión previa de guidelines', 'Actúa como revisor de App Store. Evalúa «{app}» ({desc}; categoría {iosCat}; login: {login}; SDKs: {sdks}) contra las guidelines: ¿necesito Sign in with Apple?, ¿eliminación de cuenta dentro de la app?, ¿compras dentro de la app para contenido digital?, ¿privacy manifest y APIs de razón requerida?, ¿contenido de usuarios y moderación?, ¿funcionalidad mínima? Si es billetera, exchange o servicio financiero, aplica la norma de criptomonedas: cuenta de organización, exchange aprobado, licencias por país y credenciales para probar los flujos. Lista riesgos de rechazo por prioridad y cómo mitigarlos.'],
  ['ios', 'Revisión financiera y cripto', 'Para «{app}» ({desc}; categoría {iosCat}; titular: {pais}) dime qué exige la revisión de Apple si la app es billetera de cripto, exchange, o un servicio de una entidad financiera. Distingue lo que no aplica. Indica si hace falta desarrollador organización, licencias por territorio, contrato con el proveedor y qué escribir en App Review Information. No inventes una clasificación 18+ solo por ser financiera.'],
  ['ios', 'Respuesta a un rechazo', 'Mi app «{app}» fue rechazada en App Store con este mensaje: [pega aquí el mensaje de Resolution Center]. Analiza la guideline citada, dime si el rechazo es correcto, qué debo cambiar y redacta una respuesta cortés y concreta para el revisor con los cambios o aclaraciones.'],
  ['android', 'Respuesta a un rechazo de Play', 'Mi app «{app}» fue rechazada o bloqueada en Play Console con este mensaje: [pega aquí el aviso]. Dime qué requisito incumple, qué cambio concreto lo resuelve y qué no debo reenviar igual. Si el aviso es de la prueba cerrada de 14 días, dime cómo comprobar el contador oficial en la consola.'],
];

const FIELDS = [
  ['desc', 'Qué hace la app (1-2 frases)'],
  ['datos', 'Datos que recopila (email, nombre, ubicación…)'],
  ['sdks', 'SDKs de terceros (Firebase, Sentry, AdMob…)'],
  ['email', 'Email de soporte'],
  ['pais', 'País y titular'],
  ['login', '¿Tiene registro o login? (sí/no)'],
];

const GATES = [
  { id: 'release-device', store: 'both', title: 'El release abre en un teléfono real', how: 'Instala el mismo binario que vas a subir. Ciérralo, ábrelo, entra y recorre la función principal.' },
  { id: 'prod-api', store: 'both', title: 'Ese binario habla con la API de producción', how: 'Nada de localhost, staging ni un menú de desarrollador visible.' },
  { id: 'privacy-url', store: 'both', title: 'La política abre en una ventana privada', how: 'Sin login, con el nombre de la app y un email de contacto.' },
  { id: 'delete-account', store: 'both', title: 'Si hay cuentas, se pueden borrar', how: 'Dentro de la app (Apple) y en una URL pública (Play). Si no hay registro, no inventes el flujo.' },
  { id: 'demo', store: 'both', title: 'La cuenta demo entra ahora mismo', how: 'Pruébala en el release. Sin 2FA, o con el código escrito en las notas del revisor.' },
  { id: 'data-match', store: 'both', title: 'Lo declarado coincide con los SDK', how: 'Analytics, ads, crashes y Firebase cuentan como recolección. Data safety y App Privacy tienen que decirlo.' },
  { id: 'permissions', store: 'both', title: 'Cada permiso tiene un motivo real', how: 'Quita los que no usas. En iOS, el texto NS…UsageDescription dice qué pantalla lo necesita.' },
  { id: 'placeholder', store: 'both', title: 'No queda texto de prueba a la vista', how: 'Nada de lorem ipsum, “beta”, “TODO” ni capturas que no son la app.' },
  { id: 'iap', store: 'both', title: 'Lo digital se cobra con la tienda', how: 'Suscripciones y desbloqueos van por Play Billing o In-App Purchase, no por un pago externo.' },
  { id: 'apple-login', store: 'ios', title: 'El login social incluye Sign in with Apple', how: 'Si solo usas tu propio usuario y contraseña, este punto no aplica: márcalo igual cuando lo hayas comprobado.' },
  { id: 'icon', store: 'ios', title: 'El ícono de 1024 no tiene transparencia', how: 'Sin canal alfa y sin esquinas redondeadas hechas por ti. Apple enmascara el cuadrado.' },
  { id: 'encryption', store: 'ios', title: 'El cifrado de exportación está respondido', how: 'Si solo usas HTTPS, dilo en TestFlight. No dejes el build en “falta cumplimiento”.' },
  { id: 'ios-org', store: 'ios', title: 'La cuenta de Apple es de organización si la app lo exige', how: 'Billetera de criptoactivos: el desarrollador está inscrito como organización. Si la titular es una empresa, la membresía es de esa empresa. Si no aplica, márcalo al comprobarlo.' },
  { id: 'ios-finance-docs', store: 'ios', title: 'Licencias y cuenta demo, si hay cripto o banca', how: 'Exchange aprobado, licencia en cada país de la ficha, y una cuenta que deja probar compra, venta, depósito y retiro. Si la app no ofrece eso, márcalo al comprobarlo. La edad sale del cuestionario, no de un 18+ automático.' },
  { id: 'target-sdk', store: 'android', title: 'El AAB apunta a la API que pide Play', how: 'Teléfono: Android 16, API 36, desde el 31 de agosto de 2026. Wear OS y Automotive: API 35. TV y XR: API 34. Si la consola ofrece prórroga, úsala solo hasta la fecha que indique (hubo una hasta el 1 de noviembre de 2026).' },
  { id: 'financial-account', store: 'android', title: 'La cuenta es de organización si la categoría lo exige', how: 'Banca, préstamos, trading, fondos, exchange, billetera de software de criptomonedas, ciertas apps de salud, VPN y gobiernos. Si la tuya no entra, márcalo al comprobarlo. La cuenta personal no sustituye este requisito.' },
  { id: 'financial-declaration', store: 'android', title: 'La declaración de funciones financieras está enviada', how: 'Todas las apps la completan. Si no hay ninguna función, se certifica así. Si hay cripto, banca o pagos, se declara la función real y se quitan los países sin licencia.' },
];

const ALSO_IDS = ['prep-financial', 'i-compliance', 'prep-testers', 'prep-privacy', 'prep-assets', 'prep-demo', 'prep-prod-config', 'post-automate'];

function parseISO(iso) {
  const parts = String(iso || '').slice(0, 10).split('-').map(Number);
  const y = parts[0], m = parts[1], d = parts[2];
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function daysSince(iso) {
  const start = parseISO(iso);
  if (!start) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / 86400000);
}

function plusDays(iso, n) {
  const start = parseISO(iso);
  if (!start) return '';
  start.setDate(start.getDate() + n);
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  return start.getFullYear() + '-' + m + '-' + d;
}

function inScope(state, step) {
  const platform = state.platform || 'both';
  return step.platform === 'all' || platform === 'both' || step.platform === platform;
}

function isFinished(state, step) {
  const done = state.done || {};
  const skipped = state.skipped || {};
  return !!(done[step.id] || skipped[step.id]);
}

function orgCanSkip(state, step) {
  return state.playAccount === 'org' && (step.id === 'prep-testers' || step.id === 'a-closed');
}

function gatesFor(platform) {
  return GATES.filter((g) => g.store === 'both' || platform === 'both' || g.store === platform);
}

function nextAction(state) {
  state = state || {};
  const scoped = {
    platform: state.platform || 'both',
    playAccount: state.playAccount || '',
    done: state.done || {},
    skipped: state.skipped || {},
    closedStartedAt: state.closedStartedAt || '',
  };
  const list = STEPS.filter((s) => inScope(scoped, s));
  const open = (s) => !isFinished(scoped, s);
  const step = list.find((s) => open(s) && !orgCanSkip(scoped, s)) || null;
  const since = scoped.closedStartedAt ? daysSince(scoped.closedStartedAt) : null;
  const waiting = !!(
    step && step.id === 'a-prod' && scoped.playAccount !== 'org' &&
    since !== null && since < CLOSED_DAYS
  );
  const currentId = waiting || !step ? '' : step.id;
  const also = ALSO_IDS
    .map((id) => STEPS.find((s) => s.id === id))
    .filter((s) => s && inScope(scoped, s) && open(s) && s.id !== currentId && !orgCanSkip(scoped, s))
    .slice(0, 3);
  return {
    step: waiting ? null : step,
    waiting,
    earliest: waiting ? plusDays(scoped.closedStartedAt, CLOSED_DAYS) : '',
    day: since === null ? null : Math.min(CLOSED_DAYS, since + 1),
    since,
    also,
    optional: list.filter((s) => open(s) && orgCanSkip(scoped, s)),
    doneCount: list.filter((s) => isFinished(scoped, s)).length,
    total: list.length,
    list,
  };
}

const api = {
  STEPS, PROMPTS, FIELDS, GATES, CLOSED_DAYS, ALSO_IDS,
  PLAY, APPLE, ACCOUNTS, categoryById, subcategories,
  daysSince, plusDays, inScope, isFinished, orgCanSkip, gatesFor, nextAction,
};

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.SHIP = api;
