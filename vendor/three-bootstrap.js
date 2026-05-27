// V10.0-b/c/f/g — ESM-Loading-Bootstrap für Three.js + Addons.
//
// Three.js ist seit r150+ ESM-only (vendor/three.module.min.js ist der ESM-
// Build, das alte UMD `three.min.js` bleibt nur als Fallback). Dieser
// Bootstrap-Module-Script importiert den ESM-Build via Import-Map und legt
// `THREE` als globales Window-Property ab — kompatibel mit dem klassisch
// geladenen `anazhRealm.js`, das `THREE.*` aus dem Global-Scope erwartet.
//
// V10.0-c: WebGPURenderer + WebGPU-Capability aus `three/addons/renderers/`
// importieren + an `THREE.WebGPURenderer`/`THREE.WebGPU` hängen.
//
// V10.0-f-1: MeshBasicNodeMaterial + `* as TSL` aus `nodes/Nodes.js` +
// SIDE-EFFECT-IMPORT `webgl-legacy/nodes/WebGLNodes.js` (patcht
// `Material.prototype.onBuild` damit NodeMaterial AUCH unter dem klassischen
// WebGLRenderer kompiliert + rendert).
// V10.0-f-2: PointsNodeMaterial (Stern-Feld-Migration).
//
// V10.0-g — EIGENE `ToonNodeMaterial`-Klasse: Three.js r160 bietet kein
// MeshToonNodeMaterial im Vendor (nur Lambert/Phong/Standard/Physical/Basic
// als NodeMaterial-Varianten). Toon ist aber zentral für AnazhRealm —
// Voxel-Chunks + Architekturen + Sun/Moon + Felsbögen nutzen Cel-Shading
// mit `gradientMap`. Wir bauen eine ToonNodeMaterial als Subclass von
// MeshLambertNodeMaterial mit eigenem `ToonLightingModel`, das dotNL durch
// gradientMap-Texture-Lookup mapped (klassische Cel-Shading-Mathematik).
// gradientMap-Slider-Updates (DataTexture.needsUpdate=true in
// _refreshToonGradient) propagieren automatisch — der texture()-Knoten
// samplet beim nächsten Frame die aktualisierten Pixel.

import * as THREE from "three";
import { MeshToonMaterial } from "three";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import WebGPU from "three/addons/capabilities/WebGPU.js";
import MeshBasicNodeMaterial from "three/addons/nodes/materials/MeshBasicNodeMaterial.js";
import PointsNodeMaterial from "three/addons/nodes/materials/PointsNodeMaterial.js";
import MeshLambertNodeMaterial from "three/addons/nodes/materials/MeshLambertNodeMaterial.js";
import LightingModel from "three/addons/nodes/core/LightingModel.js";
import { diffuseColor } from "three/addons/nodes/core/PropertyNode.js";
import { transformedNormalView } from "three/addons/nodes/accessors/NormalNode.js";
import { texture } from "three/addons/nodes/accessors/TextureNode.js";
import { vec2, float } from "three/addons/nodes/shadernode/ShaderNode.js";
import * as TSL from "three/addons/nodes/Nodes.js";
import "three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js";

// V10.0-g BAUSTELLE — eine eigene ToonNodeMaterial-Subclass mit lights=true
// + Shadow-Support + gradientMap-LightingModel ist im r160-Vendor NICHT
// trivial. Der webgl-legacy/nodes/WebGLNodes.js-Patch unterstützt die
// eingebauten NodeMaterials (Basic, Lambert, Phong, Standard, Physical),
// aber eigene Subclasses triggern beim renderBufferDirect-Pfad einen
// Three.js-internal "Cannot set properties of undefined (setting 'value')"
// auf einen uniform-Slot — vermutlich weil eine Lighting-Pipeline-Initiali-
// sierung fehlt oder die Shadow-Map-Uniform-Setup-Reihenfolge bricht.
//
// Solange diese Wurzel nicht geklärt ist: `THREE.ToonNodeMaterial` ist NICHT
// exportiert. `anazhRealm.js`'s `_buildToonNodeMaterial`-Helper fällt auf
// klassisches `new THREE.MeshToonMaterial(...)` zurück → der V10.0-e/f-5/f-6-
// Hot-Swap-Pfad bleibt aktiv (WebGPU-Init → MeshToon-Reject → Hot-Swap zu
// WebGL → Welt rendert sichtbar). Wenn die echte Migration kommt, ändert
// sich NUR der Helper-Body — die 5 Call-Sites bleiben unverändert.
//
// Diagnose-Spur für die nächste V10.0-g-Welle:
//  - `scripts/diag-page-error.cjs` reproduziert den Crash sichtbar
//  - Stack endet in `Kt (three.module.min.js)` während `renderBufferDirect`
//  - betrifft NodeMaterial-Subclasses mit `lights = true`, NICHT
//    MeshBasicNodeMaterial (kein Lights-Pfad).
//  - mögliche Heilungen: (a) `MeshPhongNodeMaterial` extends statt Lambert,
//    (b) outputNode-Override mit toon-step-mapping nach dem standard-Light,
//    (c) custom Light-Subscription via lightsNode-Knoten.
void LightingModel;
void diffuseColor;
void transformedNormalView;
void texture;
void vec2;
void float;
void MeshToonMaterial;
void MeshLambertNodeMaterial;

// `import * as X` liefert einen read-only Module-Namespace. Damit wir
// `THREE.WebGPURenderer` + die TSL-Helpers + die NodeMaterial-Klassen
// hinzufügen können, kopieren wir alle Exports in ein einfaches Object.
const THREE_GLOBAL = { ...THREE };
THREE_GLOBAL.WebGPURenderer = WebGPURenderer;
THREE_GLOBAL.WebGPU = WebGPU;
THREE_GLOBAL.MeshBasicNodeMaterial = MeshBasicNodeMaterial;
THREE_GLOBAL.PointsNodeMaterial = PointsNodeMaterial;
THREE_GLOBAL.MeshLambertNodeMaterial = MeshLambertNodeMaterial;
THREE_GLOBAL.TSL = TSL;
window.THREE = THREE_GLOBAL;
