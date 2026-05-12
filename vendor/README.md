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
| `tf.min.js` | `@tensorflow/tfjs@3.21.0` | UMD build, exposes `tf` |
| `simplex-noise.js` | `simplex-noise@2.4.0` | Not minified upstream (only ~17 KB) |

`index.html` includes them in that order.

## Updating

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
