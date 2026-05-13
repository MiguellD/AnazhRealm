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
| `three.min.js` | `three@0.134.0` (`build/three.min.js`) | UMD build, exposes `THREE` |
| `ammo.js` | `ammojs3@0.0.11` (`dist/ammo.wasm.js`) | WASM loader; needs `ammo.wasm.wasm` next to it |
| `ammo.wasm.wasm` | `ammojs3@0.0.11` (`dist/ammo.wasm.wasm`) | Bullet physics WASM binary |
| `simplex-noise.js` | `simplex-noise@2.4.0` | Not minified upstream (only ~17 KB) |

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
npm install three@0.134.0 ammojs3@0.0.11 \
  @tensorflow/tfjs@3.21.0 simplex-noise@2.4.0

# Copy into the project:
cp node_modules/three/build/three.min.js              <repo>/vendor/
cp node_modules/ammojs3/dist/ammo.wasm.js             <repo>/vendor/ammo.js
cp node_modules/ammojs3/dist/ammo.wasm.wasm           <repo>/vendor/
cp node_modules/@tensorflow/tfjs/dist/tf.min.js       <repo>/vendor/
cp node_modules/simplex-noise/simplex-noise.js        <repo>/vendor/
```

Bump the versions above when you update.
