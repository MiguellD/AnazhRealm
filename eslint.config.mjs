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
                Worker: "readonly",
                Blob: "readonly",
                URL: "readonly",
                console: "readonly",
                localStorage: "readonly",
                fetch: "readonly",
                FileReader: "readonly",
                // CDN-Libs
                THREE: "readonly",
                Ammo: "readonly",
                tf: "readonly",
                SimplexNoise: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-empty": ["warn", { allowEmptyCatch: true }],
            "no-prototype-builtins": "off",
            "no-inner-declarations": "off",
        },
    },
    {
        files: ["save-server.js"],
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
