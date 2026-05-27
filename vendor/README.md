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
| `three.module.min.js` | `three@0.160.0` (`build/three.module.min.js`) | ESM build (V10.0-b Migration von r134-UMD → r160-ESM), via Inline-Importmap geladen |
| `three-addons/` | `three@0.160.0` (`examples/jsm/`) | 238 Files, ~1.5 MB — WebGPURenderer-Addon + TSL-NodeBuilder + WGSL/GLSL-Builder. Geladen via `three/addons/`-Import-Map-Pfad (V10.0-c) |
| `three-bootstrap.js` | own | V10.0-b/c — importiert THREE + WebGPURenderer + TSL aus den ESM-Vendors, hängt sie an `window.THREE` (CSP-konform, kein eval) |
| `three-importmap.json` | own | Fallback-Variante der Inline-Importmap (V10.0-b, aktuell nicht referenziert) |
| `ammo.js` | `ammojs3@0.0.11` (`dist/ammo.wasm.js`) | WASM loader; needs `ammo.wasm.wasm` next to it |
| `ammo.wasm.wasm` | `ammojs3@0.0.11` (`dist/ammo.wasm.wasm`) | Bullet physics WASM binary, V9.40-f-gepatcht (max 64→256 MB) |
| `ammo-bootstrap.js` | own | V9.40-f pre-grow-Hook — MUSS vor `ammo.js` geladen werden |
| `simplex-noise.js` | `simplex-noise@2.4.0` | Not minified upstream (only ~17 KB) |

**V10.0-Bogen (Three.js r134 → r160 + WebGPU)** — Migration in vier Schritten:
- V10.0-a: UMD `three.min.js` r134 → ESM `three.module.min.js` r160 (670 KB ESM-Single-File-Bundle, drop-in Replacement)
- V10.0-b: Inline-Importmap mit CSP-SHA256-Hash (`sha256-0wZnc3btID51aZv5XxEWftOn3by2Jg2Jjb6FWPNAnyA=` in `script-src`), Bootstrap-Module für ESM→window.THREE-Bridge
- V10.0-c: 238 Files aus `three@0.160.0/examples/jsm/` vendored (renderers/webgpu, nodes/, capabilities/, objects/, lights/). Import-Map: `"three/addons/": "./vendor/three-addons/"`
- V10.0-d..j: WebGPURenderer aktiv, alle Material-Familien als NodeMaterials, Welt rendert dauerhaft auf WebGPU

Die alte `three.min.js` r134 ist NICHT mehr im Build-Pfad referenziert (vendor-Datei darf bleiben als Fallback-Reserve).

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
npm install three@0.160.0 ammojs3@0.0.11 simplex-noise@2.4.0

# Copy into the project (V10.0-Bogen — ESM + addons):
cp node_modules/three/build/three.module.min.js       <repo>/vendor/
cp -r node_modules/three/examples/jsm/                <repo>/vendor/three-addons/
cp node_modules/ammojs3/dist/ammo.wasm.js             <repo>/vendor/ammo.js
cp node_modules/ammojs3/dist/ammo.wasm.wasm           <repo>/vendor/
cp node_modules/simplex-noise/simplex-noise.js        <repo>/vendor/
```

Bump the versions above when you update.

## V9.40-f — Ammo-Heap-Patch (256 MB statt 64 MB)

Der vendored `ammo.wasm.wasm` von `ammojs3@0.0.11` ist mit Emscripten ohne
`-s ALLOW_MEMORY_GROWTH=1` gebaut — der C-Allocator ruft `memory.grow()` NIE,
ein OOM aborted das WASM-Modul direkt. Default-Heap ist fix 64 MB. Eine
Voxel-Welt mit Sicht-Ring 4-8 (81-289 `btBvhTriangleMeshShape`-Chunks)
braucht mehr.

Zwei Stellen heilen das:

1. **`scripts/patch-ammo-memory.cjs`** patcht den WASM-Memory-Header
   (Section 5) von `max=1024 pages` (64 MB) auf `max=4096 pages` (256 MB).
   Memory wird damit growable. Läuft automatisch bei `npm install` via
   `postinstall`-Hook + manuell via `npm run patch:ammo`. Idempotent.

2. **`vendor/ammo-bootstrap.js`** setzt `window.Module.instantiateWasm`
   mit einem Hook, der die Memory direkt nach `WebAssembly.instantiate`
   auf 256 MB pre-grow't. Ohne diesen Hook würde der C-Allocator auch
   bei growable Memory NIE `grow()` rufen — Emscripten muss zur Build-
   Zeit den Flag haben oder die Memory muss von Anfang an groß sein.
   MUSS in `index.html` VOR `<script src="vendor/ammo.js">` geladen
   werden. `anazhRealm.js` ruft `Ammo(window.Module)`, sonst greift der
   Hook nicht (Ammo's IIFE `function(moduleArg = {})` liest NUR sein
   Argument, nicht `window.Module` automatisch).

Bei einem Vendor-Update (`ammojs3` neue Version): nach `cp ammo.wasm.wasm`
einmal `npm run patch:ammo` rufen. Der Patcher prüft den aktuellen Stand
und ist idempotent.
