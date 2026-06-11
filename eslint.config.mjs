// ESLint Flat-Config für AnazhRealm.
// anazhRealm.js läuft im Browser und nutzt CDN-Globale; save-server.js ist Node.
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["anazhRealm.js"],
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
            },
        },
        rules: {
            "no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
            ],
            "no-empty": ["warn", { allowEmptyCatch: true }],
            "no-prototype-builtins": "off",
            "no-inner-declarations": "off",
        },
    },
    {
        files: ["voxel-worker.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                // Web-Worker scope
                self: "readonly",
                importScripts: "readonly",
                postMessage: "readonly",
                onmessage: "writable",
                SimplexNoise: "readonly",
                Float32Array: "readonly",
                Uint8Array: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
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
