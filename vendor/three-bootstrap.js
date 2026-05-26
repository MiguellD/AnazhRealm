// V10.0-b — ESM-Loading-Bootstrap für Three.js.
//
// Three.js ist seit r150+ ESM-only (vendor/three.module.min.js ist der ESM-
// Build, das alte UMD `three.min.js` bleibt nur als Fallback). Dieser
// Bootstrap-Module-Script importiert den ESM-Build via Import-Map und legt
// `THREE` als globales Window-Property ab — kompatibel mit dem klassisch
// geladenen `anazhRealm.js`, das `THREE.*` aus dem Global-Scope erwartet.
//
// Reihenfolge im HTML: Module-Scripts (implicit-defer) und defer-Scripts
// werden beide nach Parser-Complete in document order ausgeführt (WHATWG-
// Spec). Da dieser Bootstrap im HTML VOR `anazhRealm.js?v=...` steht,
// läuft `window.THREE = THREE;` garantiert bevor anazhRealm.js startet.
//
// CSP: `script-src 'self'` erlaubt diese externe Module-Datei, blockt aber
// Inline-Module-Scripts ohne 'unsafe-inline' — daher dieser Vendor-Path.
//
// V10.0-c wird hier zusätzlich `WebGPURenderer` aus dem `three/addons/`-
// Verzeichnis importieren und an `THREE.WebGPURenderer` hängen.

import * as THREE from "three";

window.THREE = THREE;
