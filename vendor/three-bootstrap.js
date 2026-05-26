// V10.0-b/c/f — ESM-Loading-Bootstrap für Three.js + Addons.
//
// Three.js ist seit r150+ ESM-only (vendor/three.module.min.js ist der ESM-
// Build, das alte UMD `three.min.js` bleibt nur als Fallback). Dieser
// Bootstrap-Module-Script importiert den ESM-Build via Import-Map und legt
// `THREE` als globales Window-Property ab — kompatibel mit dem klassisch
// geladenen `anazhRealm.js`, das `THREE.*` aus dem Global-Scope erwartet.
//
// V10.0-c: WebGPURenderer + WebGPU-Capability aus `three/addons/renderers/`
// importieren + an `THREE.WebGPURenderer`/`THREE.WebGPU` hängen, damit der
// Render-Pfad in `anazhRealm.js` (V10.0-d) zur Laufzeit den passenden
// Renderer instantiieren kann (WebGPU wenn verfügbar, sonst WebGL).
//
// V10.0-f-1: drei zusätzliche Imports machen NodeMaterial + TSL global
// verfügbar:
//   1. `MeshBasicNodeMaterial` (default-Export aus `nodes/materials/`)
//   2. `* as TSL` aus `nodes/Nodes.js` — alle TSL-Helper (uniform, vec3,
//      sin, mix, smoothstep, positionLocal, tslFn, …) als ein Namespace.
//   3. `webgl-legacy/nodes/WebGLNodes.js` als SIDE-EFFECT-IMPORT — das
//      Modul patcht `Material.prototype.onBuild` so, dass jedes
//      NodeMaterial AUCH unter dem klassischen `THREE.WebGLRenderer`
//      kompiliert + rendert. Damit läuft skyboxMaterial (jetzt TSL) auf
//      WebGPURenderer NATIV und auf WebGLRenderer via Legacy-Builder —
//      keine Doppel-Pflege, kein "WebGPU-only-Material"-Risiko.
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
import MeshBasicNodeMaterial from "three/addons/nodes/materials/MeshBasicNodeMaterial.js";
import PointsNodeMaterial from "three/addons/nodes/materials/PointsNodeMaterial.js";
import * as TSL from "three/addons/nodes/Nodes.js";
import "three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js";

// `import * as X` liefert einen read-only Module-Namespace. Damit wir
// `THREE.WebGPURenderer` + die TSL-Helpers + die NodeMaterial-Klassen
// hinzufügen können, kopieren wir alle Exports in ein einfaches Object —
// anazhRealm.js sieht THREE als Plain-Object mit allen Klassen + den
// Renderer-Addons + dem TSL-Namespace + den TSL-Material-Klassen.
//
// V10.0-f-2: PointsNodeMaterial wird für die Stern-Feld-Migration ergänzt
// (starsMaterial → PointsNodeMaterial, `sizeNode` + `colorNode` aus TSL).
const THREE_GLOBAL = { ...THREE };
THREE_GLOBAL.WebGPURenderer = WebGPURenderer;
THREE_GLOBAL.WebGPU = WebGPU;
THREE_GLOBAL.MeshBasicNodeMaterial = MeshBasicNodeMaterial;
THREE_GLOBAL.PointsNodeMaterial = PointsNodeMaterial;
THREE_GLOBAL.TSL = TSL;
window.THREE = THREE_GLOBAL;
