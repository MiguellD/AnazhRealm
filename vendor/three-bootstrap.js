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
//   - `three.tsl.min.js`    — eine feste Liste der TSL-Helpers aus `TSL` von
//                              three/webgpu (die Addons CSM und TRAA lesen sie);
//                              die Welt liest den Namensraum der Engine selbst.
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
// B4 (V18.130, gigant-plan §5 — U5 Schatten-CSM): das r184-Addon
// `examples/jsm/csm/CSMShadowNode.js` + `CSMFrustum.js`, verbatim vendort
// (Quelle: npm three@0.184.0). Importiert 'three/webgpu' + 'three/tsl' —
// exakt unsere Import-Map-Pfade. WICHTIG (eingebaut, kein Eigenbau nötig):
// `updateBefore` snappt das Kaskaden-Zentrum auf das TEXEL-Grid im
// LICHT-Raum (floor(center/texel)·texel in der Light-Orientierung) —
// die V17.111-R1-Lehre ist im Addon pro Kaskade schon Gesetz.
import { CSMShadowNode } from "./CSMShadowNode.js";
// DIE ZEITLICHE AUFLÖSUNG (04.10.): das r184-Addon `examples/jsm/tsl/display/TRAANode.js`, verbatim vendort
// (Quelle: npm three@0.184.0, unpkg). Importiert 'three/webgpu' + 'three/tsl' — unsere Import-Map-Pfade. Die
// Post-Kette (_ensurePostProcessing) baut es als erste Stufe; FXAA ist gefallen.
import TRAANode from "./TRAANode.js";

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
// V18.223 (DER LEBENDIGE GIGANT §10 Ω-P) — PBR-NodeMaterial. r184 trägt es
// nativ; der Welt-weite Switch (`state.atmosphere.materialMode = "pbr"`) baut
// damit Materials mit roughness + metalness aus den Material-Tags hergeleitet.
// Schöpfer-Wort 14.06.: „pbr ist die regel, physik, der richtige weg".
const MeshStandardNodeMaterial = requireWebGPU("MeshStandardNodeMaterial");
// licht-eine-skala — der Sprite im Stoff der Knoten (die Klasse Erscheinung: Kreatur-Aura, Namensschild). Bis hier reichte die
// Tür ihn nicht durch: `new THREE.SpriteNodeMaterial` warf, sobald ein Tier eine Aufgabe trug (`_refreshCreatureTaskAura`).
const SpriteNodeMaterial = requireWebGPU("SpriteNodeMaterial");
// V12.0-vendor.1 — r184 hat den `WebGPU`-Capability-Wrapper entfernt
// (war r160's `WebGPU.isAvailable()`). Direkt-Lookup via `navigator.gpu`
// in der Renderer-Auswahl-Logik (Stamm `_holzWahl`).

// `import * as X` liefert einen read-only Module-Namespace. Damit wir
// `THREE.WebGPURenderer` + die TSL-Helpers + die NodeMaterial-Klassen
// hinzufügen können, kopieren wir alle Exports in ein einfaches Object.
const THREE_GLOBAL = { ...THREE };
THREE_GLOBAL.WebGPURenderer = WebGPURenderer;
THREE_GLOBAL.MeshBasicNodeMaterial = MeshBasicNodeMaterial;
THREE_GLOBAL.PointsNodeMaterial = PointsNodeMaterial;
THREE_GLOBAL.MeshLambertNodeMaterial = MeshLambertNodeMaterial;
THREE_GLOBAL.MeshToonNodeMaterial = MeshToonNodeMaterial;
THREE_GLOBAL.MeshStandardNodeMaterial = MeshStandardNodeMaterial;
THREE_GLOBAL.SpriteNodeMaterial = SpriteNodeMaterial;
// V18.98 — Post-Processing-Heilung: `PostProcessing`/`RenderPipeline` lebt im
// three/webgpu-Bundle und wurde hier NIE kopiert → der ganze V17-Post-FX-Bogen
// (Bloom · Grading · Kanten-Schärfe · Entgrauen) war still aus. SOFT-Lookup
// (Post-FX ist optional → fehlt das Symbol, fällt `_ensurePostProcessing` sauber
// auf den direkten Render-Pfad).
// V18.267 — DIE KONSOLEN-WURZEL (Schöpfer „die Warnungen fluten die Konsole"):
// r184 benannte `PostProcessing` → `RenderPipeline` um. Der alte Name lebt als
// DEPRECATED Alias, der schon beim ZUGRIFF (`typeof WEBGPU.PostProcessing`) eine
// Konsolen-Warnung feuert — UND er ist intern ShaderMaterial-basiert, das der
// WebGPU-NodeBuilder ablehnt („ShaderMaterial is not compatible"). BEIDE Warnungen,
// EINE Wurzel: wir kopierten nur den alten Namen → der Code fiel immer auf ihn
// zurück. Jetzt RenderPipeline ZUERST (NodeMaterial-basiert, kein deprecated-
// Zugriff → keine Warnung); nur wenn es fehlt (älteres Bundle) der alte Fallback.
if (typeof WEBGPU.RenderPipeline === "function") {
    THREE_GLOBAL.RenderPipeline = WEBGPU.RenderPipeline;
} else if (typeof WEBGPU.PostProcessing === "function") {
    THREE_GLOBAL.PostProcessing = WEBGPU.PostProcessing;
}
// 08.07. — DIESELBE V18.267-WURZEL-KLASSE beim PMREM: `{...THREE}` spreizt den
// WebGL-Ära-PMREMGenerator (ShaderMaterial-intern) über das Objekt — der WebGPU-
// Renderer lehnt dessen interne Materialien ab („ShaderMaterial is not compatible",
// 2× je Env-Bau im Schöpfer-Log). Das three/webgpu-Bundle exportiert seinen EIGENEN
// node-basierten PMREMGenerator (gleiche fromEquirectangular(tex, rt)-Signatur) —
// er gewinnt; fehlt er (Vendor-Wechsel), bleibt der alte als Fallback funktional.
if (typeof WEBGPU.PMREMGenerator === "function") {
    THREE_GLOBAL.PMREMGenerator = WEBGPU.PMREMGenerator;
}
// DIE TÜR REICHT DIE GANZE TSL DER ENGINE (nacht-gasse-licht): `three/tsl` (vendor/three.tsl.min.js) reicht eine feste Liste aus
// `TSL` von three/webgpu weiter — ihr fehlen `specularColorBlended` und `diffuseContribution` der Beleuchtung von r184. Das Gesetz
// der Scheibe (welt-licht `scheibe`) las beide: sein setupVariants warf, und r184 baute jeden Scheiben-Stoff still als leeren
// NodeMaterial neu (`getForRender`: catch → neuer Bau, „TSL: TypeError …“) — kein Fenster, kein Laternenkopf glühte, kein Glas
// spiegelte (GTX 1050, Dorf third: das nahe Glas mit einem Leuchten von 50 cd/m² änderte 0 von 518 400 Pixeln). Der Namensraum
// der Engine ist die Obermenge derselben Knoten (gate:vendor-anker, DIE TÜR DER TSL).
THREE_GLOBAL.TSL = requireWebGPU("TSL");
// DER TEXEL-ABGRIFF GEHT NIE DURCH DIE UV-MATRIX (w28-ankunft-faden). r184 `TextureNode.load(texel)` klont den Knoten samt
// `updateMatrix` — true an jedem `texture(tex)` ohne UV —, und jeder Klon legt sich seine EIGENE mat3-Uniform an und
// multipliziert sein ganzzahliges Texel mit ihr: `vec2<i32>( ( object.nodeUniformN * vec3<f32>( vec2<f32>( texel ), 1.0 ) ).xy )`.
// Die Matrix einer Textur ist ein UV-Gesetz (offset · repeat · rotation); ein Texel-Index liest sie nie. Der Bake der Karten
// trug so 81 mat3 je Programm (9 Richtungen × 9 Abgriffe der Sonnen-Sicht), der Spiegel 47, die Kontakt-Verdeckung 22 + 9,
// der Rückstrahl 6 — DXC übersetzte die zwei Bake-Programme 1,27 s statt 0,45 s (Übersetzungs-Bank GTX 1050, je Programm
// allein). Hier, an der EINEN Tür von TSL in die Welt, fällt die Matrix für jeden Leser von `load` (Stamm, Bühne, TRAANode).
const TextureNode = requireWebGPU("TextureNode");
const texelLaden = TextureNode.prototype.load;
if (typeof texelLaden !== "function" || typeof TextureNode.prototype.setUpdateMatrix !== "function")
    throw new Error("three-bootstrap: TextureNode.load/setUpdateMatrix fehlt (r184-Bundle-Kompat-Bruch?)");
TextureNode.prototype.load = function (texel) {
    return texelLaden.call(this, texel).setUpdateMatrix(false);
};
// B4 — CSM ist optional (fehlt das Symbol nach einem Vendor-Wechsel, fällt
// initThreeJS sauber auf die EINE 2048er-Map zurück — Soft-Anbindung wie
// PostProcessing, kein requireWebGPU-Throw).
if (typeof CSMShadowNode === "function") {
    THREE_GLOBAL.CSMShadowNode = CSMShadowNode;
}
// Die zeitliche Auflösung ist die EINE Kantenglättung — hart angebunden (der Import selbst fällt laut, fehlt die Datei).
THREE_GLOBAL.TRAANode = TRAANode;
// Ein eigener Pass der Post-Kette (der Lichtschacht, `_godrayStufe`) ist ein TempNode mit `updateBefore` je Frame: Klasse und
// Takt-Art leben nur im three/webgpu-Bundle — hart angebunden wie die zeitliche Auflösung.
THREE_GLOBAL.TempNode = requireWebGPU("TempNode");
THREE_GLOBAL.NodeUpdateType = requireWebGPU("NodeUpdateType");
// T3 (DC-SUBMIT-TÖTER) — BundleGroup lebt NUR im three/webgpu-Bundle (r184:
// WebGPU-RenderBundles; der Renderer replayed statischer Subbäume statt sie
// jeden Frame neu zu encoden). Soft-Anbindung wie PostProcessing/CSM: fehlt
// das Symbol nach einem Vendor-Wechsel, bleibt der Region-Bundle-Pfad im
// Stamm einfach aus (Meshes hängen dann direkt an der Szene — 0 Regress).
if (typeof WEBGPU.BundleGroup === "function") {
    THREE_GLOBAL.BundleGroup = WEBGPU.BundleGroup;
}
// V18.510 — die Instanz-Matrix als STORAGE (StorageInstancedBufferAttribute lebt NUR im three/webgpu-Bundle):
// unter 64 KB legt r184 instanceMatrix als Uniform-Array MIT Länge in den Vertex-Shader — jede Kapazität
// würde ein eigenes Programm. Soft-Anbindung: fehlt das Symbol, bleibt die InstancedMesh beim Uniform-Array.
if (typeof WEBGPU.StorageInstancedBufferAttribute === "function") {
    THREE_GLOBAL.StorageInstancedBufferAttribute = WEBGPU.StorageInstancedBufferAttribute;
}
// V18.510 — InstanceNode für den stabilen Puffer-Namen (der Stamm benennt die Instanz-Matrix im WGSL, sonst
// trägt jede InstancedMesh `NodeBuffer_<id>` und wird ihr eigenes Programm). Soft: fehlt es, bleibt der id-Name.
if (typeof WEBGPU.InstanceNode === "function") {
    THREE_GLOBAL.InstanceNode = WEBGPU.InstanceNode;
}
window.THREE = THREE_GLOBAL;
