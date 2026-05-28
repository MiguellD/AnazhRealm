// V12.0-vendor.1 — ESM-Loading-Bootstrap für Three.js r184.
//
// Three.js r184 (Februar 2025) hat den Build in drei ESM-Bundles aufgeteilt
// (vorher in r160 war alles in einem `three.module.min.js`):
//   - `three.core.min.js`  — Basis-Symbole (Matrix4, Vector3, Material, …),
//                            wird von den anderen Bundles via relative path
//                            importiert (sitzt deshalb neben den anderen
//                            Files im vendor-Verzeichnis).
//   - `three.module.min.js` — Renderer-Pfad (WebGLRenderer, Mesh, Light,
//                              Shadow, Fog, Texture, etc.) + Re-Exporte
//                              aus three.core.
//   - `three.webgpu.min.js` — WebGPURenderer + NodeMaterial-Klassen +
//                              WebGPU-Capability + alle Lighting-Modelle.
//   - `three.tsl.min.js`    — TSL-Helpers (texture, vec2, float, attribute,
//                              uniform, positionLocal, transformedNormalView,
//                              tslFn, ...).
//
// Import-Map (index.html) mapped:
//   "three"        → "./vendor/three.module.min.js"
//   "three/webgpu" → "./vendor/three.webgpu.min.js"
//   "three/tsl"    → "./vendor/three.tsl.min.js"
//
// r164-Wende — webgl-legacy/nodes/WebGLNodes.js (V10.0-f-1's Side-Effect-
// Patch für NodeMaterial-Rendering auf WebGLRenderer) ist seit r164 ENTFERNT.
// NodeMaterials laufen ab r164 NUR auf WebGPURenderer. WebGLRenderer existiert
// weiter im Bundle (kann instantiiert werden als defensive Wand im Hot-Swap-
// Pfad), rendert aber keine NodeMaterial-basierten Materials mehr. Die
// Konsequenz für die Welt-Vision ist klar artikuliert: WebGPU-required.
// Browser-Realität 2026: Chrome 113+ (stable seit Mai 2023), Edge 113+,
// Safari 18+ (stable seit Sept 2024), Firefox mit dom.webgpu.enabled.
//
// V12.0-a (erledigt): Hot-Swap-Pfad + rendererKind-Gates + WebGL-Bridge-
// Heilungen gestrichen, WebGPU-required-Bootstrap-Wand in init(). V12.0-f
// (erledigt): der V10.0-g.diag-Toon-Workaround (MeshBasicNodeMaterial +
// manuelles colorNode-Lighting + handgebauter Shadow-Pass) ist durch native
// MeshToonNodeMaterial/MeshLambertNodeMaterial (lights=true) ersetzt.

import * as THREE from "three";
import * as WEBGPU from "three/webgpu";
import * as TSL from "three/tsl";

// Defensive Existence-Checks: bei Vendor-Versionswechsel (r184→r190+) können
// Symbol-Namen verschwinden — wir wollen klare Bootstrap-Fehler, KEINE stille
// undefined-Zuweisung mit Crash beim ersten Use weit im Welt-Pfad.
const requireWebGPU = (name) => {
    const v = WEBGPU[name];
    if (typeof v === "undefined") {
        throw new Error(`three-bootstrap: 'three/webgpu' export '${name}' fehlt (r184-Bundle-Kompat-Bruch?)`);
    }
    return v;
};

const WebGPURenderer = requireWebGPU("WebGPURenderer");
const MeshBasicNodeMaterial = requireWebGPU("MeshBasicNodeMaterial");
const PointsNodeMaterial = requireWebGPU("PointsNodeMaterial");
const MeshLambertNodeMaterial = requireWebGPU("MeshLambertNodeMaterial");
// V12.0-f — natives MeshToonNodeMaterial (lights=true). Seit r164 tragen
// lights=true-NodeMaterials nativ auf WebGPU; der V10.0-g.diag-Workaround
// (`_buildToonNodeMaterial` als MeshBasicNodeMaterial + manuelles colorNode-
// Lighting + handgebauter Shadow-Pass) ist obsolet. Three.js managed jetzt
// Cel-gradientMap + DirectionalLight/Ambient/Hemisphere-Lighting + Shadow-
// Map automatisch. Der tote MeshToonMaterial-Fallback-Import ist gestrichen.
const MeshToonNodeMaterial = requireWebGPU("MeshToonNodeMaterial");
// V12.0-vendor.1 — r184 hat den `WebGPU`-Capability-Wrapper entfernt
// (war r160's `WebGPU.isAvailable()`). Direkt-Lookup via `navigator.gpu`
// in der Renderer-Auswahl-Logik (anazhRealm.js init()).

// `import * as X` liefert einen read-only Module-Namespace. Damit wir
// `THREE.WebGPURenderer` + die TSL-Helpers + die NodeMaterial-Klassen
// hinzufügen können, kopieren wir alle Exports in ein einfaches Object.
const THREE_GLOBAL = { ...THREE };
THREE_GLOBAL.WebGPURenderer = WebGPURenderer;
THREE_GLOBAL.MeshBasicNodeMaterial = MeshBasicNodeMaterial;
THREE_GLOBAL.PointsNodeMaterial = PointsNodeMaterial;
THREE_GLOBAL.MeshLambertNodeMaterial = MeshLambertNodeMaterial;
THREE_GLOBAL.MeshToonNodeMaterial = MeshToonNodeMaterial;
THREE_GLOBAL.TSL = TSL;
window.THREE = THREE_GLOBAL;
