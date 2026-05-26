// V10.0-b/c — ESM-Loading-Bootstrap für Three.js + Addons.
//
// Three.js ist seit r150+ ESM-only (vendor/three.module.min.js ist der ESM-
// Build, das alte UMD `three.min.js` bleibt nur als Fallback). Dieser
// Bootstrap-Module-Script importiert den ESM-Build via Import-Map und legt
// `THREE` als globales Window-Property ab — kompatibel mit dem klassisch
// geladenen `anazhRealm.js`, das `THREE.*` aus dem Global-Scope erwartet.
//
// V10.0-c: zusätzlich `WebGPURenderer` aus `three/addons/renderers/webgpu/`
// importieren + an `THREE.WebGPURenderer` hängen, damit der Render-Pfad in
// `anazhRealm.js` (V10.0-d) zur Laufzeit `new THREE.WebGPURenderer()` mit
// Fallback auf `new THREE.WebGLRenderer()` instantiieren kann.
//
// Reihenfolge im HTML: Module-Scripts (implicit-defer) und defer-Scripts
// werden beide nach Parser-Complete in document order ausgeführt (WHATWG-
// Spec). Da dieser Bootstrap im HTML VOR `anazhRealm.js?v=...` steht,
// läuft `window.THREE = THREE;` garantiert bevor anazhRealm.js startet.
//
// CSP: `script-src 'self'` erlaubt diese externe Module-Datei; die inline-
// Import-Map ist via SHA256-Hash whitelisted (siehe index.html).

import * as THREE from "three";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import WebGPU from "three/addons/capabilities/WebGPU.js";

// `import * as X` liefert einen read-only Module-Namespace. Damit wir
// `THREE.WebGPURenderer` hinzufügen können, kopieren wir alle Exports in
// ein einfaches Object — anazhRealm.js sieht THREE als Plain-Object mit
// allen Klassen + den Renderer-Addons.
const THREE_GLOBAL = { ...THREE };
THREE_GLOBAL.WebGPURenderer = WebGPURenderer;
THREE_GLOBAL.WebGPU = WebGPU;
window.THREE = THREE_GLOBAL;
