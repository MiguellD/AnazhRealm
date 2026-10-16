# vendor/ — die eingebundenen Fremd-Bibliotheken

Drei Gründe, sie selbst auszuliefern statt über ein CDN:

1. Die Sandbox, in der Claude das Spiel prüft, sperrt `cdn.jsdelivr.net` und `cdnjs.cloudflare.com`
   (`host_not_allowed`); ohne lokale Kopien laufen keine Headless-Playtests.
2. Offline-Spiel und Reproduzierbarkeit: ein CDN-Ausfall oder Versionssprung bricht das Spiel nicht.
3. Ein DNS+TLS-Roundtrip je Skript weniger beim ersten Laden.

Was hier liegt, wird nie von Hand verändert: `vendor/anker.lock.json` pinnt Größe und FNV-Abdruck der three-Bündel,
die der Stamm zur Laufzeit liest, und `gate:vendor-anker` nennt jeden Anker, von dem ein Eingriff des Stamms abhängt.

## Inhalt

| Datei                    | Quelle                                                          | Rolle                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `three.core.min.js`      | `three@0.184.0` (`build/three.core.min.js`)                     | Basis-Symbole (Matrix4, Vector3, Material …), von den anderen Bündeln über relativen Pfad importiert                                        |
| `three.module.min.js`    | `three@0.184.0` (`build/three.module.min.js`)                   | das nackte `three` der Import-Map + Re-Exporte aus `three.core.min.js`                                                                      |
| `three.webgpu.min.js`    | `three@0.184.0` (`build/three.webgpu.min.js`)                   | WebGPURenderer + alle NodeMaterials + Licht-Modelle; Import-Map-Pfad `three/webgpu`                                                         |
| `three.tsl.min.js`       | `three@0.184.0` (`build/three.tsl.min.js`)                      | TSL-Helfer (`Fn`, `select`, `texture`, `uniform` …); Import-Map-Pfad `three/tsl`                                                            |
| `CSMShadowNode.js`       | `three@0.184.0` (`examples/jsm/csm/CSMShadowNode.js`)           | Kaskaden-Schatten für den WebGPURenderer, verbatim (importiert `three/webgpu` + `three/tsl` + `./CSMFrustum.js`)                            |
| `CSMFrustum.js`          | `three@0.184.0` (`examples/jsm/csm/CSMFrustum.js`)              | Frustum-Teiler von CSMShadowNode                                                                                                            |
| `TRAANode.js`            | `three@0.184.0` (`examples/jsm/tsl/display/TRAANode.js`)        | die zeitliche Auflösung (Temporal Reprojection AA), verbatim; die EINE Kantenglättung der Post-Kette (`_ensurePostProcessing`)             |
| `three-bootstrap.js`     | eigen                                                           | importiert `three`, `three/webgpu`, `three/tsl` und hängt sie an `window.THREE` (CSP-konform, kein `eval`); geladen von `index.html`       |
| `three.min.js`           | `three@0.160` (UMD)                                             | lädt das Spiel nicht; die Werkzeuge (`scripts/lib/stamm.cjs`) lesen daraus die Top-Level-Symbole der Kerne in node                         |
| `three-importmap.json`   | eigen                                                           | Datei-Form der Inline-Import-Map in `index.html`; nicht referenziert                                                                        |
| `simplex-noise.js`       | `simplex-noise@2.4.0`                                           | Rausch-Funktionen; upstream unminifiziert (~17 KB)                                                                                          |
| `anker.lock.json`        | eigen                                                           | Größe + FNV-Abdruck je gepinntem Bündel (`gate:vendor-anker`)                                                                               |
| `fonts/*.woff2`          | Google Fonts, Latin-Teilmenge                                   | die Schriften der Oberfläche (unten)                                                                                                        |

`index.html` lädt die Import-Map, dann `three-bootstrap.js` als Modul und `simplex-noise.js` — vor dem Stamm.

## Schriften

`vendor/fonts/` trägt drei Google-Fonts-Familien, je als woff2-Teilmenge (Latin). Sie laden über lokale
`@font-face`-Deklarationen in `index.html`, damit die strenge CSP bei `font-src 'self'` bleibt.

| Datei                            | Familie                             | Lizenz      |
| -------------------------------- | ----------------------------------- | ----------- |
| `Cinzel-Variable.woff2`          | Cinzel (variabel, Gewichte 400–800) | SIL OFL 1.1 |
| `IMFellEnglish-400-normal.woff2` | IM Fell English (400, aufrecht)     | SIL OFL 1.1 |
| `IMFellEnglish-400-italic.woff2` | IM Fell English (400, kursiv)       | SIL OFL 1.1 |
| `JetBrainsMono-Variable.woff2`   | JetBrains Mono (variabel)           | SIL OFL 1.1 |

Die Latin-Teilmenge deckt die Umlaute (U+00C4..U+00DC); andere Sprachen brauchen ihre Teilmenge daneben.

```sh
# Die CSS-API von Google liefert die aktuellen woff2-URLs bei einem modernen User-Agent; aus der Antwort die
# Latin-Blöcke (unicode-range beginnt mit U+0000-00FF) nehmen. Cinzel und JetBrains Mono sind variabel: 500 und 700
# liefern dieselben Bytes, darum je EINE Datei mit vollem Gewichts-Bereich.
curl -s -A "Mozilla/5.0" \
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono:wght@400&display=swap" \
  > /tmp/gfonts.css
```

## Bibliotheken erneuern

```sh
mkdir -p /tmp/lib-fetch && cd /tmp/lib-fetch && npm init -y
npm install three@0.184.0 simplex-noise@2.4.0

cp node_modules/three/build/three.core.min.js         <repo>/vendor/
cp node_modules/three/build/three.module.min.js       <repo>/vendor/
cp node_modules/three/build/three.webgpu.min.js       <repo>/vendor/
cp node_modules/three/build/three.tsl.min.js          <repo>/vendor/
cp node_modules/simplex-noise/simplex-noise.js        <repo>/vendor/

# Ändert sich der Text der Inline-Import-Map in index.html, muss ihr CSP-SHA256-Hash neu gerechnet werden:
python3 -c "import hashlib,base64; print('sha256-' + base64.b64encode(hashlib.sha256(open('index.html').read().split('<script type=\"importmap\">')[1].split('</script>')[0].encode()).digest()).decode())"
```

Ein Versionssprung ist ein bewusster Akt: `vendor/anker.lock.json` nachziehen heißt, jeden Anker in
`scripts/diag-vendor-anker.cjs` neu zu beweisen. Die Geschichte der Bibliotheken (Ammo, TensorFlow, die r134→r160→r184-Bögen)
trägt `git log -- vendor/`.
