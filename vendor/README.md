# Vendored third-party libraries

Drei reasons we host these instead of using a CDN:

1. The development sandbox where Claude tests the game has a strict
   outbound filter that blocks `cdn.jsdelivr.net` and
   `cdnjs.cloudflare.com` with `host_not_allowed`. Without local
   copies headless playtests are impossible.
2. Offline play and reproducibility: a CDN outage or version change
   no longer breaks the game.
3. Saves one DNS+TLS roundtrip per script on first load.

## Contents

| File | Source npm package | Notes |
|---|---|---|
| `three.core.min.js` | `three@0.184.0` (`build/three.core.min.js`) | Basis-Symbole (Matrix4, Vector3, Material, …), wird von den anderen Bundles via relative path importiert (V12.0-vendor.1 Migration r160 → r184) |
| `three.module.min.js` | `three@0.184.0` (`build/three.module.min.js`) | Renderer-Pfad (WebGLRenderer, Mesh, Light, Shadow, Fog, Texture) + Re-Exporte aus `three.core.min.js` |
| `three.webgpu.min.js` | `three@0.184.0` (`build/three.webgpu.min.js`) | WebGPURenderer + alle NodeMaterials (inkl. `MeshToonNodeMaterial` neu in r184) + WebGPU-Capability + alle Lighting-Modelle. Via `three/webgpu` Import-Map-Pfad geladen |
| `three.tsl.min.js` | `three@0.184.0` (`build/three.tsl.min.js`) | TSL-Helpers (texture, vec2/3/4, float, attribute, uniform, positionLocal, normalWorld, `Fn` (war `tslFn`), `select` (war `cond`)). Via `three/tsl` Import-Map-Pfad geladen |
| `three-bootstrap.js` | own | V12.0-vendor.1 — importiert THREE + WebGPU-Bundle + TSL-Bundle via neue `three/webgpu` + `three/tsl` Pfade, hängt an `window.THREE` (CSP-konform, kein eval). `webgl-legacy/WebGLNodes.js`-Side-Effect-Import gestrichen (in r164 strukturell entfernt — V12-Bogen-Konsequenz: WebGPU-required, kein WebGL-Fallback für NodeMaterials) |
| `three-importmap.json` | own | Fallback-Variante der Inline-Importmap (V10.0-b, aktuell nicht referenziert) |
| `simplex-noise.js` | `simplex-noise@2.4.0` | Not minified upstream (only ~17 KB) |

> **Ammo.js wurde V18.331 entfernt** (Determinismus-Bogen, P3): die Physik ist
> feld-nativ (Kollision aus dem Dichtefeld, kein Bullet/WASM). `vendor/ammo.js`,
> `vendor/ammo.wasm.wasm`, `vendor/ammo-bootstrap.js` + `scripts/patch-ammo-memory.cjs`
> sind gelöscht. Historie: git-log ≤ V18.330 + `docs/archiv/eigene-physik-plan.md`.
| `CSMShadowNode.js` | `three@0.184.0` (`examples/jsm/csm/CSMShadowNode.js`) | B4/V18.130 — Cascaded Shadow Maps fuer den WebGPURenderer, verbatim (importiert `three/webgpu` + `three/tsl` via Import-Map + `./CSMFrustum.js` relativ). Traegt den Light-Space-Texel-Snap PRO Kaskade eingebaut (`updateBefore`) |
| `CSMFrustum.js` | `three@0.184.0` (`examples/jsm/csm/CSMFrustum.js`) | Frustum-Split-Helfer von CSMShadowNode (importiert nur `three`) |

**V10.0-Bogen (Three.js r134 → r160 + WebGPU, 26-27.05.2026)** — Migration in vier Schritten: UMD `three.min.js` r134 → ESM r160 + Inline-Importmap mit CSP-SHA256-Hash + 238 Addon-Files aus `examples/jsm/` + WebGPURenderer aktiv mit Hot-Swap-Safety-Net. Welt rendert dauerhaft auf WebGPU.

**V12.0-Bogen (r160 → r184, WebGPU-required, 28.05.2026)** — die strukturelle Befreiung:
- V12.0-vendor.1: r184-Build-Split. Statt 670 KB Single-File + 1.5 MB Addons jetzt 4 ESM-Bundles (core/module/webgpu/tsl, 1.4 MB total — netto ~700 KB Verkleinerung). Import-Map auf `three/webgpu` + `three/tsl` umgestellt, CSP-SHA256-Hash neu (`sha256-0Uxx8GfPSERurkq9sL6uAmur5cQSOlBXJPyZmEpXMVA=`).
- r164 hat `WebGLNodeBuilder` strukturell entfernt — NodeMaterials laufen NUR auf WebGPURenderer. Konsequenz: Hot-Swap-Pfad gestrichen (V12.0-a), WebGPU-required mit User-Banner-Wand wenn `navigator.gpu` fehlt.
- TSL-API-Renames in r167-r170: `tslFn` → `Fn`, `cond` → `select`, `transformedNormalWorld` → `normalWorld` (letzteres war FPS-Bombe weil `console.warn()` mit Stack-Capture per Frame pro Material).
- r184's „Bind Group Layout cache system" + „compileAsync truly non-blocking" heilen den v160-WebGPU-InstancedMesh-Re-Use-Race strukturell — V10.0-j.j-Memory-Trade obsolet, V11-Mesh-Pool aktiv (V12.0-d).
- V9.95-WebGPU-Compute-Pipeline (Mai 2026 als „Vorarbeit für V10+" abgeklemmt) reaktiviert in V12.0-e — same-device-mapAsync auf WebGPURenderer ist billig (war cross-backend ~200-300 ms auf WebGL-Renderer).

Die alten `three.min.js` r134 + `three-addons/`-Tree sind aus dem Build-Pfad entfernt. Plus `three-addons/`-Ordner ist gestrichen (vendor-Verzeichnis ~700 KB schlanker).

TensorFlow.js wurde im Mai 2026 entfernt — `playerMovementModel` trainierte
in eine Sackgasse (kein Konsument von `predictPlayerMove`). Der Lern-Loop läuft
heute komplett über die DSL: `state.dsl.history` mit Fitness-V2, Roulette-
Selektion und Mutation. Ohne TF kann die CSP `'unsafe-eval'` ablehnen.

`index.html` includes them in that order.

## Fonts (UI V2 — painterly theme)

`vendor/fonts/` carries three Google-Fonts families, each as a Latin
woff2 subset. They're loaded via local `@font-face` declarations in
`index.html`, so the strict CSP can stay on `font-src 'self'` without
allowing fonts.googleapis.com.

| File | Family | License |
|---|---|---|
| `Cinzel-Variable.woff2` | Cinzel (variable, weights 400-800) | SIL OFL 1.1 |
| `IMFellEnglish-400-normal.woff2` | IM Fell English (400, upright) | SIL OFL 1.1 |
| `IMFellEnglish-400-italic.woff2` | IM Fell English (400, italic) | SIL OFL 1.1 |
| `JetBrainsMono-Variable.woff2` | JetBrains Mono (variable) | SIL OFL 1.1 |

Latin subset covers German umlauts (U+00C4..U+00DC). For other
languages add the matching subset alongside.

### Refreshing the fonts

```sh
# Google's CSS API returns the latest woff2 URLs when called with a
# modern browser user-agent. Save the response and extract Latin-only
# @font-face blocks (those whose unicode-range begins with U+0000-00FF).

curl -s -A "Mozilla/5.0" \
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono:wght@400&display=swap" \
  > /tmp/gfonts.css

# A Python helper that drops files into vendor/fonts/ is in the
# commit message that introduced this directory — search for
# "UI V2 step A". Cinzel and JetBrains Mono are variable fonts: the
# 500 and 700 URLs return the same bytes, so we keep one file each
# (Cinzel-Variable, JetBrainsMono-Variable) and let @font-face accept
# the full weight range.
```

## Updating libraries

```sh
# Pull a fresh copy of each library:
mkdir -p /tmp/lib-fetch && cd /tmp/lib-fetch && npm init -y
npm install three@0.184.0 simplex-noise@2.4.0

# Copy into the project (V12.0-vendor — r184 ESM Build-Split):
cp node_modules/three/build/three.core.min.js         <repo>/vendor/
cp node_modules/three/build/three.module.min.js       <repo>/vendor/
cp node_modules/three/build/three.webgpu.min.js       <repo>/vendor/
cp node_modules/three/build/three.tsl.min.js          <repo>/vendor/
cp node_modules/simplex-noise/simplex-noise.js        <repo>/vendor/

# Bei Vendor-Updates die CSP-SHA256-Hash der Inline-Importmap in
# index.html neu berechnen wenn der Importmap-Body sich ändert:
python3 -c "import hashlib,base64; print('sha256-' + base64.b64encode(hashlib.sha256(open('index.html').read().split('<script type=\"importmap\">')[1].split('</script>')[0].encode()).digest()).decode())"
```

Bump the versions above when you update.

## Ammo.js — ENTFERNT (V18.331, Determinismus-Bogen P3)

Die Physik ist feld-nativ (Kollision/Raycast aus dem Dichtefeld, kein Bullet,
kein WASM-Heap). Der frühere `ammojs3@0.0.11`-Vendor + der V9.40-f-Heap-Patch
(`scripts/patch-ammo-memory.cjs` + `vendor/ammo-bootstrap.js`) sind gelöscht.
Der ganze Bogen lebt in `docs/archiv/eigene-physik-plan.md`; die Ammo-Historie
(WASM-Heap-Patch, BVH, Lifecycle) in git-log ≤ V18.330.
