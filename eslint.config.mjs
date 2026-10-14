// ESLint Flat-Config für AnazhRealm.
// Der Stamm läuft im Browser und nutzt CDN-Globale; save-server.js ist Node.
import js from "@eslint/js";
import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";

// die Stamm-Dateien aus der EINEN Liste (scripts/lib/stamm.cjs: die eine Datei, nach dem Schnitt stamm/NN.js)
const stammLib = createRequire(import.meta.url)("./scripts/lib/stamm.cjs");
const STAMM = stammLib.dateien(dirname(fileURLToPath(import.meta.url)));
// Kern (stamm/01.js: Kopf, `class AnazhRealm`, die Naht-Funktion) und Zonen (stamm/NN[x].js): klassische defer-Skripte in
// EINEM globalen lexikalischen Raum. Die Zonen lesen die Klasse des Kerns, die Naht (erste Außen-Datei) dazu _stammZonen
// und die Zonen-Klassen — ihre Namen kommen aus derselben Liste (S benennt sie `AnazhRealm_Z<NN[x]>`).
const ZONEN = STAMM.slice(1);
const ZONEN_GLOBALE = Object.fromEntries(
    ["AnazhRealm", "_stammZonen", ...ZONEN.map((p) => `AnazhRealm_Z${p.replace(/^.*\/|\.js$/g, "")}`)].map((n) => [
        n,
        "readonly",
    ])
);

export default [
    js.configs.recommended,
    {
        files: STAMM,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                // Browser
                window: "readonly",
                document: "readonly",
                performance: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                ResizeObserver: "readonly",
                Worker: "readonly",
                Blob: "readonly",
                URL: "readonly",
                console: "readonly",
                localStorage: "readonly",
                location: "readonly", // JEDES-HOLZ: _holzWahl liest ?holz= aus der URL
                URLSearchParams: "readonly",
                fetch: "readonly",
                FileReader: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                SpeechSynthesisUtterance: "readonly",
                AudioContext: "readonly",
                HTMLElement: "readonly",
                crypto: "readonly",
                WebSocket: "readonly",
                RTCPeerConnection: "readonly",
                navigator: "readonly",
                atob: "readonly",
                btoa: "readonly",
                TextEncoder: "readonly",
                indexedDB: "readonly", // V18.151 IndexedDB-Spiegel (vorbestehender Lint-Riss, M2-Beifang)
                AnazhHuelle: "readonly", // die Studio-Hülle (worlds/huelle/huelle.js, K41): die Werkstatt ruft DENSELBEN Regler-Generator
                // CDN-Libs
                THREE: "readonly",
                Ammo: "readonly",
                tf: "readonly",
                SimplexNoise: "readonly",
                // WebGPU (V9.95-a Foundation). Global, weil _voxelGpuInit
                // navigator.gpu nutzt + die BufferUsage-/MapMode-Konstanten
                // sind im Browser-Global-Scope; ESLint kennt sie nicht
                // out-of-the-box (mit Eslint v9 + `globals.browser` würden
                // sie kommen, aber wir pflegen eine explizite Liste).
                GPUBufferUsage: "readonly",
                GPUMapMode: "readonly",
                GPUShaderStage: "readonly",
                // Das Tiefen-Abbild (`_tiefenAbbild`) hängt für EINEN Pass-Bruch an die Encoder-Kopie.
                GPUCommandEncoder: "readonly",
                // Die Rundungs-Sonde des Ausgabe-Ziels (`_ausgabeSonde`, 0910-1 B) legt ihr 1×1-Ziel roh an.
                GPUTextureUsage: "readonly",
            },
        },
        rules: {
            // die Klassen des Stamms liest die NAHT in einer anderen Datei (der Kern `AnazhRealm`, die Zonen `AnazhRealm_Z…`)
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    varsIgnorePattern: "^AnazhRealm(_Z\\w+)?$",
                },
            ],
            "no-empty": ["warn", { allowEmptyCatch: true }],
            "no-prototype-builtins": "off",
            "no-inner-declarations": "off",
        },
    },
    ...(ZONEN.length
        ? [
              {
                  files: ZONEN,
                  languageOptions: { globals: ZONEN_GLOBALE },
                  rules: {
                      // die eigene Zonen-Klasse ist zugleich ein Global der Liste: kein Zwilling (den fängt die Naht laut)
                      "no-redeclare": ["error", { builtinGlobals: false }],
                  },
              },
          ]
        : []),
    {
        files: ["voxel-worker.js", "bake-worker.js", "bake-core.js", "phyto-core.js", "gelaende-core.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                // Web-Worker scope (voxel-worker, bake-worker) + bake-core/phyto-core/gelaende-core (geteilt: Worker + Main)
                self: "readonly",
                globalThis: "readonly",
                importScripts: "readonly",
                postMessage: "readonly",
                onmessage: "writable",
                URLSearchParams: "readonly",
                SimplexNoise: "readonly",
                Float32Array: "readonly",
                Uint8Array: "readonly",
                Uint32Array: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
        },
    },
    {
        // DAS GELÄNDE-STUDIO (K16b): das Panel im Browser (studio.js) und sein Makro-Worker (makro-worker.js).
        files: ["worlds/gelaende/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                AnazhHuelle: "readonly", // die Studio-Hülle (K47): die Heimat lädt worlds/huelle/huelle.js vor dem Studio
                THREE: "readonly", // die three-Instanz der Heimat (window.THREE): der Sicht-Kegel der Kosten-Leiste
                window: "readonly",
                self: "readonly",
                document: "readonly",
                location: "readonly",
                localStorage: "readonly",
                performance: "readonly",
                crypto: "readonly",
                importScripts: "readonly",
                postMessage: "readonly",
                Worker: "readonly",
                Blob: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                ImageData: "readonly",
                fetch: "readonly",
                Event: "readonly",
                alert: "readonly",
                setTimeout: "readonly",
                setInterval: "readonly",
                console: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["save-server.js", "signaling-server.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                console: "readonly",
                Buffer: "readonly",
            },
        },
    },
];
