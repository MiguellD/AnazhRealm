#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// seinen Organen (Observer-Diät + Kamera-Treue · Schatten-Diät · Schatten-Stoff ·
// Bundle-Wahrheit · Bundle-Reihenfolge · Replay-Buchung · Erst-Zeichnung · Uniform-
// Heimat · Schatten-Takt · Instanz-Puffer-Name · Satz-Teil-Upload). Jeder dieser
// Eingriffe hängt an EXAKTEN Vendor-Wahrheiten (Methoden-/Feld-Namen, Verhaltens-
// Signaturen) — auch an PRIVATEN (_renderScene, _currentRenderBundle, _bindings.
// _update, getNodeFrameForRender …). Ein three-Versions-Sprung würde sie STILL
// brechen — die Welt liefe, aber die Diät griffe nie, ein Bundle klebte an der
// Kamera seiner Aufnahme. Jede benutzte Stelle steht hier mit ihrem Organ.
//
// Diese Wand pinnt: (1) den Fingerabdruck (Größe + FNV-Hash) jeder Vendor-
// Datei — ein Bump ist ein BEWUSSTER Akt (Hash hier nachziehen = der Vertrag,
// alle Anker neu zu beweisen); (2) die ANKER-Substrings, von denen unsere
// Laufzeit-Eingriffe abhängen. Fällt ein Anker, nennt die Wand den Täter und
// das abhängige Organ BEIM NAMEN.
//
// Selbst-Test: --selftest beweist, dass ein manipulierter Anker feuert.
// ============================================================================
"use strict";
const { wandEnde, ausDatei, SELBSTTEST, path, fs, stammLib } = require("./lib/welt-boot.cjs");
const root = path.resolve(__dirname, "..");

// FNV-1a (dieselbe Hash-Familie wie der Warm-Start-Byte-Beweis).
function fnv(buf) {
    let h = 0x811c9dc5;
    for (let i = 0; i < buf.length; i++) {
        h ^= buf[i];
        h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
}

// Die gepinnten Vendor-Fingerabdrücke (Bump = Hash bewusst nachziehen).
const PINS = [
    { file: "vendor/three.webgpu.min.js", hash: null },
    { file: "vendor/three.core.min.js", hash: null },
    { file: "vendor/three.tsl.min.js", hash: null },
    { file: "vendor/TRAANode.js", hash: null },
    { file: "vendor/CSMShadowNode.js", hash: null },
];

// Die Anker: Vendor-Substring → abhängiges Stamm-Organ.
// DIE DATEI DER ANKER: ohne `file` der WebGPU-Vendor (in ihm leben fast alle Organe), jede andere steht beim Anker — ihre
// Namen aus den Pins (EINE Liste der Vendor-Dateien)
const [ANKER_DATEI, CORE, TSL, TRAA, CSM] = PINS.map((p) => p.file);
const ANKER = [
    // Observer-Diät + Batch-Textur-Wächter (setupObserver-Naht + Monitor-Kurzschluss)
    { sub: "setupObserver(e){return new", organ: "_materialObserverDiaet (Diät-Naht)" },
    { sub: "this.hasNode=this.containsNode(", organ: "_materialObserverDiaet (hasNode-Kurzschluss)" },
    { sub: "needsRefresh(e,t){if(this.hasNode||this.hasAnimation", organ: "_materialObserverDiaet (Monitor-Bahn)" },
    // DIE KAMERA-TREUE der Diät (direkter Draw UND Bundle-Replay): Beobachter UND geteilte Bindegruppe (render · frame: Kamera-Matrizen,
    // uLodAuge) hängen am PROGRAMM (NodeBuilderState), nie an der Welt; die renderId-Wand je Beobachter schreibt sie
    // je Programm und Render. Jede Abkürzung der Diät muss diese Gruppe je Programm und Render selbst schreiben.
    { sub: "getMonitor(){return this._monitor||(this._monitor=this.getNodeBuilderState().observer)}", organ: "AnazhRealm._diaetRefresh (Beobachter je Programm)" },
    { sub: "createBindings(){const e=[];for(const t of this.bindings){if(!0!==t.bindings[0].groupNode.shared){", organ: "AnazhRealm._diaetRefresh (geteilte Gruppe je Programm)" },
    { sub: "if(this.renderId!==r)return this.renderId=r,!0;", organ: "AnazhRealm._diaetRefresh (renderId-Wand je Beobachter)" },
    // Die Schatten-Diät: EIN Schatten-Material je Licht, die Original-Knoten hängen je Objekt darin
    { sub: 't.isShadowPassMaterial=!0,t.name="ShadowMaterial"', organ: "Schatten-Diät (_configureRenderer, isShadowPassMaterial)" },
    { sub: "e.isShadowPassMaterial){const{colorNode:t,depthNode:r,positionNode:s}=this._getShadowNodes(i)", organ: "Schatten-Diät (Original-Knoten im Override)" },
    // DER SCHATTEN-STOFF JE OBJEKT: renderObject setzt je Objekt alphaTest des Originals auf den EINEN geteilten
    // Schatten-Stoff, der Setter zählt bei jedem Wechsel über 0 die Version; jede Version prüft je Bürger den Schlüssel
    // und die Pipeline — _configureRenderer trägt je Objekt die Version des Original-Materials in den Stoff.
    { file: CORE, sub: "set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}", organ: "Schatten-Stoff je Objekt (der Setter, den der Stoff überschreibt)" },
    { sub: "e.alphaTest=i.alphaTest,e.alphaMap=i.alphaMap,e.transparent=", organ: "Schatten-Stoff je Objekt (renderObject setzt die Werte je Objekt)" },
    { sub: "(l.version!==t.version||l.needsUpdate)&&(l.initialCacheKey!==l.getCacheKey()", organ: "Schatten-Stoff je Objekt (Version → Schlüssel-Prüfung je Bürger)" },
    { sub: "t.material===s&&t.materialVersion===s.version", organ: "Schatten-Stoff je Objekt (Version → Pipeline-Prüfung je Bürger)" },
    { sub: "e.depthNode&&e.depthNode.isNode&&(l=e.depthNode),e.castShadowPositionNode&&e.castShadowPositionNode.isNode?o=e.castShadowPositionNode:e.positionNode&&e.positionNode.isNode&&(o=e.positionNode)", organ: "_wurfOhneFarbe" },
    { sub: "customProgramCacheKey();for(const e of function(e){const t=Object.keys(e);", organ: "_materialObserverDiaet" },
    { sub: "this._currentRenderObjectFunction=this._renderObjectFunction||this.renderObject", organ: "Schatten-Stoff je Objekt (renderObject am Renderer gelesen)" },
    // DIE DIÄT-BAHN am Programm (_diaetGeteiltSchreiben / _diaetRefresh): jede private Stelle, die sie ruft.
    { sub: "updateBefore(e){const t=e.getNodeBuilderState();for(const r of t.updateBeforeNodes)this.getNodeFrameForRender(e).updateBeforeNode(r)}", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._nodes.updateBefore)" },
    { sub: "getNodeFrameForRender(e){return this.getNodeFrame(e.renderer,e.scene,e.object,e.camera,e.material)}", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._nodes.getNodeFrameForRender)" },
    { sub: "updateNode(e){const t=e.getUpdateType(),r=e.updateReference(this);", organ: "AnazhRealm._diaetGeteiltSchreiben (NodeFrame.updateNode)" },
    { sub: "getUpdateType(){return this.updateType}", organ: "AnazhRealm._diaetGeteiltSchreiben (Knoten-Takt render/frame/object)" },
    { sub: "_update(e,t){const{backend:r}=this;let s=!1,i=!0,n=0,a=0;for(const t of e.bindings){if(!1!==this.nodes.updateGroup(t)){", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._bindings._update je Gruppe)" },
    { sub: "getBindings(){return this._bindings||(this._bindings=this.getNodeBuilderState().createBindings())}", organ: "AnazhRealm._diaetGeteiltSchreiben (ro.getBindings)" },
    { sub: "this.updateNodes=n,this.updateBeforeNodes=a,this.updateAfterNodes=o,this.observer=u", organ: "AnazhRealm._diaetRefresh (NodeBuilderState: updateNodes · updateAfterNodes · observer)" },
    { sub: "equals(e,t,r){const{object:s,material:i,geometry:n}=e,a=this.getRenderObjectData(e);", organ: "AnazhRealm._diaetRefresh (obs.equals)" },
    // (7) DER WÄCHTER IST DIE GEOMETRIE-PRÜFUNG: equals() prüft die Geometrie je Geometrie und Render (Stempel `_renderId`,
    // Urteil `_equal`, Id je Objekt `geometryId`) samt drawRange — die Diät stellt diese Daten als geprüft; der Ausschnitt ist ein
    // Draw-Parameter (jeder Draw liest `geometry.drawRange`).
    { sub: "if(a.geometryId!==n.id)return a.geometryId=n.id,!1;const u=this.getGeometryData(e.geometry);if(u._renderId!==r){u._renderId=r;", organ: "AnazhRealm._diaetRefresh (7: equals prüft die Geometrie je Geometrie und Render)" },
    { sub: "u.drawRange.start!==n.drawRange.start||u.drawRange.count!==n.drawRange.count)return u.drawRange.start=n.drawRange.start,u.drawRange.count=n.drawRange.count,u._equal=!1,!1;u._equal=!0}else if(!1===u._equal)return!1;", organ: "AnazhRealm._diaetRefresh (7: der Vendor-Vergleich frischt auf einen anderen Ausschnitt auf)" },
    { sub: "getGeometryData(e){let t=Ps.get(e);return void 0===t&&(t={_renderId:-1,_equal:!1,", organ: "AnazhRealm._diaetRefresh (7: obs.getGeometryData je Geometrie)" },
    { sub: "const u=this._objects.get(e,t,r,s,i,this._currentRenderContext,a,o);if(u.drawRange=e.geometry.drawRange,", organ: "AnazhRealm._diaetRefresh (7: der Ausschnitt ist ein Draw-Parameter)" },
    // (8) GETRAGEN: r184 lädt ein Attribut EINMAL je Version für alle Render-Objekte — die Daten je Attribut-Objekt am
    // Renderer (`_attributes`, eine DataMap mit `has`), `version` die hochgeladene; die Diät liest sie, bevor ein Render-Objekt
    // auf eine neue Version hin voll auffrischt.
    { sub: "this._attributes=new By(r,this.info)", organ: "AnazhRealm._diaetGetragen (8: rend._attributes)" },
    { sub: "update(e,t){const r=this.get(e);if(void 0===r.version)", organ: "AnazhRealm._diaetGetragen (8: die Daten je Attribut-Objekt, version undefined = nie hochgeladen)" },
    { sub: "(r.version<t.version||t.usage===x)&&(this.backend.updateAttribute(e),r.version=t.version)", organ: "AnazhRealm._diaetGetragen (8: EIN Upload je Version, version = die hochgeladene)" },
    { sub: "has(e){return this.data.has(e)}", organ: "AnazhRealm._diaetGetragen (8: DataMap.has legt nichts an)" },
    { sub: "getLights(e,t){if(", organ: "AnazhRealm._diaetRefresh (obs.getLights)" },
    { sub: 'needsVelocity(e){const t=e.getMRT();return null!==t&&t.has("velocity")}', organ: "AnazhRealm._diaetRefresh (obs.needsVelocity)" },
    { sub: "firstInitialization(e){return!1===this.renderObjects.has(e)&&(this.getRenderObjectData(e),!0)}", organ: "AnazhRealm._diaetRefresh (obs.renderObjects = Erst-Init)" },
    // DER EINE KNOTEN JE QUELLE (_configureRenderer): r184 teilt eine geteilte Gruppe über Programme nur bei
    // GLEICHEN Knoten-Ids (je Render-Kontext EIN Puffer); ReferenceNode legt seinen Uniform-Knoten in setNodeType an (der
    // Eingriff gibt jedem Verweis auf dasselbe Objekt und dieselbe Eigenschaft einer geteilten Gruppe DENSELBEN), die CSM
    // baut ihre Render-Knoten in setup (einmal je Instanz).
    { sub: 'setNodeType(e){let t=null;t=null!==this.count?Zl(null,e,this.count):Array.isArray(this.getValueFromReference())?td(null,e):"texture"===e?Kl(null):"cubeTexture"===e?$c(null):Sa(null,e),null!==this.group&&t.setGroup(this.group),null!==this.name&&t.setName(this.name),this.node=t}', organ: "EIN KNOTEN JE QUELLE (ReferenceNode.setNodeType legt den Uniform-Knoten an)" },
    { sub: "e.uniforms.sort((e,t)=>e.nodeUniform.node.id-t.nodeUniform.node.id);for(const t of e.uniforms)r+=t.nodeUniform.node.id}else r+=e.nodeUniform.id;const i=this.renderer._currentRenderContext||this.renderer;let n=qN.get(i);", organ: "EIN KNOTEN JE QUELLE (_getBindGroup teilt die Gruppe nach Knoten-Ids je Render-Kontext)" },
    { file: CSM, sub: "setup( builder ) {\n\n\t\tif ( this.camera === null ) this._init( builder );\n\n\t\treturn this.fade === true ? this._setupFade() : this._setupStandard();", organ: "EIN KNOTEN JE QUELLE (CSMShadowNode.setup baut die Render-Knoten je Aufruf — einmal je Instanz)" },
    { file: CSM, sub: "this.setupShadowPosition( builder );", organ: "EIN KNOTEN JE QUELLE (die Schatten-Lage baut der Fn-Rumpf je Programm, nie setup)" },
    // EIN SCHREIBEN JE PUFFER: das Backend lädt eine Uniform-Gruppe Bereich für Bereich (je Bereich ein writeBuffer).
    { sub: "updateBinding(e){const t=this.backend,r=t.device,s=e.buffer,i=t.get(e).buffer,n=e.updateRanges;if(0===n.length)r.queue.writeBuffer(i,0,s,0);else{", organ: "EIN SCHREIBEN JE PUFFER (backend.updateBinding: ein writeBuffer je Bereich)" },
    { sub: "t.isBuffer&&t.updateRanges.length>0&&t.clearUpdateRanges()", organ: "EIN SCHREIBEN JE PUFFER (r184 leert die Bereiche nach dem Upload)" },
    // EIN GANG JE GRUPPE UND RENDER (_diaetGang): Bindegruppen und Knoten tragen Ids, Vorher-Knoten ihren Takt.
    { sub: 'class bN{constructor(e="",t=[]){this.name=e,this.bindings=t,this.id=yN++}}', organ: "AnazhRealm._diaetGang (die Bindegruppe trägt eine Id)" },
    { sub: "getUpdateBeforeType(){return this.updateBeforeType}", organ: "AnazhRealm._diaetGang (Vorher-Takt: object geht je Programm)" },
    { sub: "updateBeforeNode(e){const t=e.getUpdateBeforeType(),r=e.updateReference(this);if(t===ri.FRAME){", organ: "AnazhRealm._diaetGeteiltSchreiben (NodeFrame.updateBeforeNode je Vorher-Knoten, wie Nodes.updateBefore)" },
    { sub: "updateReference(e){return this.reference=null!==this.object?this.object:e.object,this.reference}", organ: "AnazhRealm._diaetGang (ein Verweis ohne festes Objekt liest frame.object — sein Programm geht seinen eigenen Gang) · _stoffWert (der Wert je Stoff liest den Stoff des zeichnenden Objekts, in jedem Pass)" },
    // EIN GRAPH JE SIGNATUR (`_foundryTreeMaterial` · `_membranGraph`): r184 schlüsselt ein Programm
    // nach der IDENTITÄT seiner Knoten — der Knoten-Schlüssel endet in `customCacheKey` = Knoten-id; frisch gebaute Knoten
    // hießen ein Programm je Stoff. Und je InstancedMesh hängt r184 die Objekt-uuid an den Schlüssel (der InstanceNode bindet
    // die Matrix-Puffer des Objekts in den Graphen): die instanzierten Foundry-Teile bauen je Objekt, auch mit EINEM Graphen —
    // fällt dieser Term, teilen sie ihr Programm ohne Umbau.
    { sub: "customCacheKey(){return this.id}", organ: "EIN GRAPH JE SIGNATUR (_foundryTreeMaterial · _membranGraph: Programm-Schlüssel = Knoten-Identität)" },
    { sub: '(e.isInstancedMesh||e.count>1||Array.isArray(e.morphTargetInfluences))&&(s+=e.uuid+",")', organ: "EIN GRAPH JE SIGNATUR (je InstancedMesh ein Programm — darum zeichnet die Senke über ihren Zeichner, `_instanzZeichner`)" },
    // DIE SENKE ZEICHNET ÜBER IHREN ZEICHNER (1410-1, `_instanzZeichner` · `_senkenKnoten` · der setupPosition-Haken in
    // `_configureRenderer`): ein LOD ohne Takt zeichnet nicht, seine Kinder schon; die Zahl eines Draws ist instanceCount der
    // InstancedBufferGeometry (die Senke projiziert als LOD ohne Takt, ihr Zeichner erbt die Reihe der Eltern); der Instanz-Knoten steht in setupPosition, wo r184s InstanceNode steht (sein setup legt die
    // Matrix am Builder ab, seine Zuweisung baut NACH der des positionNode), r184 liest die Instanz-Farbe als vInstanceColor; je Bindung trägt der Speicher-Knoten sein Attribut, ein Wechsel baut die Bindegruppe neu.
    { sub: "else if(e.isLOD)!0===e.autoUpdate&&e.update(t);", organ: "DIE SENKE (projiziert als LOD ohne Takt: sie zeichnet nicht, ihr Zeichner erbt die Reihe ihrer Eltern)" },
    { sub: "if(e.layers.test(t.layers))if(e.isGroup)r=e.renderOrder", organ: "DIE SENKE (eine GRUPPE setzte die Reihe ihrer Kinder auf ihre renderOrder — darum projiziert die Senke als LOD)" },
    { sub: "!0===r.isInstancedBufferGeometry?u=r.instanceCount", organ: "DIE SENKE (die Instanz-Zahl des Zeichners ist instanceCount seiner Fassade)" },
    { sub: "t.isInstancedMesh&&t.instanceMatrix&&!0===t.instanceMatrix.isInstancedBufferAttribute&&Sp(t).toStack(),null!==this.positionNode", organ: "DIE SENKE (setupPosition: der Haken stellt den EINEN Instanz-Knoten an die Stelle des InstanceNode)" },
    { sub: 't.instanceColor){s=kn("vec3","vInstanceColor").mul(s)}', organ: "DIE SENKE (die Instanz-Farbe liest r184 als vInstanceColor — der Instanz-Knoten schreibt sie aus `instanzFarbe`)" },
    { sub: "n.attribute!==e&&(n.attribute=e,s=!0)", organ: "DIE SENKE (je Bindung das Attribut des Speicher-Knotens, ein Wechsel baut die Bindegruppe neu — die Matrix je Zeichen-Objekt)" },
    { sub: "get attribute(){return this.nodeUniform.value}", organ: "DIE SENKE (die Speicher-Bindung liest das Attribut aus dem Wert ihres Knotens — `_senkenKnoten` stellt ihn je Objekt)" },
    // DER POSITIONS-KNOTEN VOR DER INSTANZ-MATRIX: `setupPosition` legt die Zuweisung des
    // positionNode auf den Stapel, der Instanz-Knoten hängt sein `positionLocal = M × positionLocal` erst in seinem setup an,
    // und `StackNode.build` baut nachgereichte Knoten NACH den ersten — im positionNode sind positionLocal, normalLocal und
    // positionWorld die VORLAGE. Wer die Welt braucht, liest die EINE Naht `_weltNaht`.
    { sub: 'Sp(t).toStack(),null!==this.positionNode&&lc.assign(Gu(this.positionNode,"POSITION","vec3"))', organ: "AnazhRealm._weltNaht (setupPosition: die Zuweisung des positionNode steht im Stapel vor der Instanzierung)" },
    { sub: "const n=t.mul(lc).xyz;if(lc.assign(n)", organ: "AnazhRealm._weltNaht (InstanceNode.setup: die Instanz-Matrix wird erst im setup an den aktiven Stapel gehängt)" },
    { sub: "const a=this.nodes.filter(e=>-1===n.indexOf(e));for(const e of a)i(e)", organ: "AnazhRealm._weltNaht (StackNode.build: nachgereichte Knoten bauen NACH den ersten — positionNode vor der Instanz-Matrix)" },
    // JEDE TEXTUR DES PROGRAMMS: die Bindung einer Textur trägt ihren Knoten, und r184 lädt die Textur
    // nur im Binde-Gang eines Render-Objekts hoch — den fährt nur ein Refresh (der Textur-Wächter der Diät).
    { sub: "textureNode=t,this.groupNode=r,this.access=s}update(){const{textureNode:e}=this;return this.texture!==e.value?(this.texture=e.value,!0):super.update()}", organ: "AnazhRealm._diaetGang (die Textur-Bindung trägt ihren Knoten: jede Textur des Programms)" },
    { sub: "if(t.isSampledTexture){const o=t.update(),u=t.texture,l=this.textures.get(u);o&&(this.textures.updateTexture(u)", organ: "AnazhRealm._diaetVorTextur (r184 lädt eine Textur nur im Binde-Gang hoch)" },
    // DER RENDER-ABSCHNITT: der Stempel des Gangs ist (Render-Id, info.calls) — jeder betretene
    // Render zählt info.calls hoch und nimmt ihn als Render-Id, das Verlassen gibt die äußere Id zurück (Anker der
    // Bundle-Wahrheit), info.reset lässt info.calls stehen. So wechselt das Paar beim Betreten UND Verlassen.
    { sub: "this.info.calls++,this.info.render.calls++,this.info.render.frameCalls++,i.renderId=this.info.calls", organ: "AnazhRealm._diaetGeteiltSchreiben (Render-Abschnitt: jeder betretene Render zählt info.calls, die Render-Id folgt)" },
    { sub: "reset(){this.render.drawCalls=0,this.render.frameCalls=0,this.compute.frameCalls=0,this.render.triangles=0,this.render.points=0,this.render.lines=0}", organ: "AnazhRealm._diaetGeteiltSchreiben (Render-Abschnitt: info.reset lässt info.calls stehen)" },
    // DIE BUNDLE-WAHRHEIT (_configureRenderer, Chokepoint _renderScene): r184 hält den Aufnahme-Zeiger ohne Stapel,
    // verfolgt nur bei stehendem Zeiger, refresht im Replay ausserhalb von renderObject; der Override-Stoff wird je
    // Objekt eingerichtet und zurückgesetzt; eine BundleGroup ohne backend.beginBundle ist eine Gruppe.
    { sub: 'this.isBundleGroup=!0,this.type="BundleGroup",this.static=!0,this.version=0}set needsUpdate(e){!0===e&&this.version++}', organ: "_archRegionBundleFor (THREE.BundleGroup)" },
    { sub: "this._currentRenderBundle=o;const{transparentDoublePass:e,transparent:d,opaque:c}=n;", organ: "Bundle-Wahrheit (die Aufnahme setzt den Zeiger)" },
    { sub: "this._currentRenderBundle=null,this.backend.finishBundle(a,o),u.version=s.version", organ: "Bundle-Wahrheit (die Aufnahme nullt den Zeiger, ohne Stapel)" },
    { sub: "null!==this._currentRenderBundle){this.backend.get(this._currentRenderBundle).renderObjects.push(u),u.bundle=this._currentRenderBundle.bundleGroup}", organ: "Bundle-Wahrheit (verfolgt nur bei stehendem Zeiger)" },
    { sub: "i.renderId=n,this._currentRenderContext=a,this._currentRenderObjectFunction=o,this._handleObjectFunction=u,this._callDepth--", organ: "Bundle-Wahrheit (_renderScene stellt den Zeiger NICHT wieder her)" },
    { sub: "if(!0===e.isBundleGroup&&void 0!==this.backend.beginBundle){", organ: "Bundle-Wahrheit (ohne beginBundle ist die BundleGroup eine Gruppe)" },
    { sub: "const{renderObjects:e}=u;for(let t=0,r=e.length;t<r;t++){const r=e[t];this._nodes.needsRefresh(r)&&(this._nodes.updateBefore(r),this._nodes.updateForRender(r),this._bindings.updateForRender(r),this._nodes.updateAfter(r))}", organ: "Bundle-Wahrheit (der Replay refresht ausserhalb von renderObject)" },
    { sub: "p&&(t.overrideMaterial.colorNode=l,t.overrideMaterial.depthNode=d,t.overrideMaterial.positionNode=c,t.overrideMaterial.side=h)", organ: "Bundle-Wahrheit (der Override-Stoff wird je Objekt zurückgesetzt)" },
    { sub: "n.overrideMaterial=$_(r),i.setRenderObjectFunction(", organ: "Bundle-Wahrheit (der Schatten-Render trägt overrideMaterial an der Szene)" },
    // Die Bundle-Reihenfolge: r184 sammelt Bundles und führt sie erst in finishRender aus (nach allen direkten Draws);
    // _configureRenderer führt sie direkt nach _renderBundles aus und setzt den gemerkten Pass-Zustand zurück
    { sub: "finishRender(e){const t=this.get(e),r=e.occlusionQueryCount;t.renderBundles.length>0&&t.currentPass.executeBundles(t.renderBundles)", organ: "Bundle-Reihenfolge (_configureRenderer, executeBundles erst in finishRender)" },
    { sub: "S.length>0&&this._renderBundles(S,l,R),!0===this.opaque&&w.length>0&&this._renderObjects(w,t,l,R)", organ: "Bundle-Reihenfolge (Bundles vor den opaken Direkt-Draws)" },
    { sub: "addBundle(e,t){this.get(e).renderBundles.push(this.get(t).bundleGPU)}", organ: "Bundle-Reihenfolge (die gesammelte Liste)" },
    { sub: "t.currentSets={attributes:{},bindingGroups:[],pipeline:null,index:null},t.renderBundles=[]", organ: "Bundle-Reihenfolge (Pass-Zustand nach executeBundles)" },
    // DIE ERST-ZEICHNUNG (`_configureRenderer`): der Stamm bildet `_renderObjectDirect` nach (ändert r184 den Körper,
    // zieht die Nachbildung nach), baut den Stoff im Pass je Render-Aufruf (`info.calls`) höchstens einmal und lässt die
    // Pipeline asynchron entstehen (`getForRender(ro, promises)`); der Record droppt unfertige Draws und versiegelt danach.
    { sub: "u.version=s.version", organ: "_erstWartet (2): die Marke des Knoten-Baus fällt nach der Versiegelung" },
    {
        sub: "_renderObjectDirect(e,t,r,s,i,n,a,o){const u=this._objects.get(e,t,r,s,i,this._currentRenderContext,a,o);if(u.drawRange=e.geometry.drawRange,u.group=n,null!==this._currentRenderBundle){this.backend.get(this._currentRenderBundle).renderObjects.push(u),u.bundle=this._currentRenderBundle.bundleGroup}const l=this._nodes.needsRefresh(u);l&&(this._nodes.updateBefore(u),this._geometries.updateForRender(u),this._nodes.updateForRender(u),this._bindings.updateForRender(u)),this._pipelines.updateForRender(u),this._pipelines.isReady(u)&&(this.backend.draw(u,this.info),l&&this._nodes.updateAfter(u))}",
        organ: "Erst-Zeichnung (die Nachbildung von _renderObjectDirect)",
    },
    { sub: "this._handleObjectFunction=this._renderObjectDirect,this.info.calls++,this.info.render.calls++", organ: "Erst-Zeichnung (jeder Render liest die Methode am Exemplar; info.calls zählt je Render-Aufruf)" },
    { sub: "updateForRender(e){this.getForRender(e)}", organ: "Erst-Zeichnung (der Vendor-Draw baut die Pipeline ohne Versprechen = synchron)" },
    { sub: "getForRender(e,t=null){const{backend:r}=this,s=this.get(e);if(this._needsRenderUpdate(e))", organ: "Erst-Zeichnung (die Pipeline mit Versprechen-Liste)" },
    { sub: "null===t)h.pipeline=d.createRenderPipeline(A)", organ: "Erst-Zeichnung (ohne Liste synchron)" },
    { sub: "h.pipeline=await d.createRenderPipelineAsync(A)", organ: "_erstWartet (1): die Zuweisung der fertigen Pipeline ist die Bereitschaft (der Setter am Zustand)" },
    { sub: "h.pipeline=await d.createRenderPipelineAsync(A)}catch(e){}const t=await d.popErrorScope()", organ: "_erstWartet (1): das Vendor-Versprechen wartet danach auf den Fehler-Scope — an ihm hängt nichts; _erstAbsageWache: r184 verschluckt die Absage (catch(e){})" },
    { sub: "label:`renderPipeline_${s.name||s.type}_${s.id}`", organ: "_erstAbsageWache (das Label der Absage nennt den Stoff)" },
    { sub: "this._setupBindings(u,n),this.set(t,{programGPU:n,pipeline:n})", organ: "_erstWartet (WebGL2-Weiche: _completeCompile ersetzt das Datenobjekt, ein Setter feuerte nie)" },
    { sub: "isReady(e){const t=this.get(e).pipeline;if(void 0===t)return!1;const r=this.backend.get(t);return void 0!==r.pipeline&&null!==r.pipeline}", organ: "Erst-Zeichnung (gezeichnet wird ab der fertigen Pipeline)" },
    { sub: "getForRenderCacheKey(e){return e.initialCacheKey}", organ: "Erst-Zeichnung (ein Bau-Cache-Treffer ist kein Bau)" },
    { sub: "this._nodeBuilderState=null", organ: "Erst-Zeichnung (der gebaute Stoff am RenderObject)" },
    { sub: "getNodeBuilderState(){return this._nodeBuilderState||(this._nodeBuilderState=this._nodes.getForRender(this))}", organ: "Erst-Zeichnung (needsRefresh baut den Stoff synchron)" },
    // Warum kein Vorwärmen: r184-compileAsync liest die Attribute (→ synchroner Knoten-Bau) VOR seinem asynchronen Bau
    { sub: "this._geometries.updateForRender(t),await this._nodes.getForRenderAsync(t)", organ: "Erst-Zeichnung (das Vendor-Kompilat baut synchron — kein Vorwärmen daneben)" },
    // Bundle-Pass-Physik (Wasser bleibt draußen, solange der Copy den Pass bricht)
    { sub: "currentPass.end()", organ: "Wasser-Bundle-Wand (copyFramebufferToTexture-Pass-Bruch)" },
    // Bundle-Replay-Buchung: die Draw-Wahrheit im Info (der Replay zieht aufgenommene RenderObjects)
    { sub: "_renderBundle(e,t,r){const{bundleGroup:s,camera:i,renderList:n}=e,a=this._currentRenderContext,o=this._bundles.get(s,i,a)", organ: "Bundle-Replay-Buchung (renderer._renderBundle → info.update)" },
    { sub: "getDrawParameters(){", organ: "Bundle-Replay-Buchung (Draw-Parameter)" },
    // Der Fenster-Wechsel: die Viewport-Tiefe ist ein Klon je Render-Ziel (der EINE Leser bindet nach setSize neu)
    { sub: "getTextureForReference(e=null){", organ: "Diät (6) / _tiefenKnotenTausch (Viewport-Tiefen-Klon je Ziel)" },
    // Der Name der Viewport-Tiefe: EIN geteiltes Original je Seite, jeder Klon je Ziel erbt seinen Namen
    { sub: '"ViewportDepthTextureNode"}constructor(e=ud,t=null,r=null){null===r&&(null===Kp&&(Kp=new Z),r=Kp)', organ: "_szeneTiefe (WebGL2-Rückfall und Null-Renderer: r184s Viewport-Tiefe, szene:tiefenkopie)" },
    // DAS TIEFEN-ABBILD: r184s Bruch-Weg (Pass beenden, auf demselben Encoder kopieren, mit load neu
    // beginnen) trägt den Abbild-Pass — seine Quelle ist die Tiefe des Kontexts, seine Kopie die EINE Encoder-Stelle, die
    // `_tiefenAbbild` für die Attrappe durch den Abbild-Pass ersetzt; der Knoten zieht je Render einmal; r32float bindet
    // r184 als (unfilterable-)float.
    { sub: "i=t.renderTarget?e.isDepthTexture?this.get(t.depthTexture).texture", organ: "_tiefenAbbild (Quelle des Bruchs = die Tiefe des Kontexts)" },
    { sub: 's.currentPass?(s.currentPass.end(),a=s.encoder):a=this.device.createCommandEncoder({label:"copyFramebufferToTexture_"+e.id}),a.copyTextureToTexture({texture:i,origin:[r.x,r.y,0]},{texture:n},[r.z,r.w])', organ: "_tiefenAbbild (Pass-Ende und die EINE Encoder-Kopie)" },
    { sub: "s.currentPass=a.beginRenderPass(e),s.currentSets={attributes:{},bindingGroups:[],pipeline:null,index:null}", organ: "_tiefenAbbild (der Neubeginn mit load)" },
    // DER VORHER-TEXTUR-WÄCHTER der Diät: r184 zerstört beim Neu-Anlegen einer Ziel-Textur (das Tiefen-Abbild
    // in neuer Größe) die alte GPU-Textur; die Diät liest die Texturen der Vorher-Knoten am NodeBuilderState.
    { sub: "const s=e.isRenderTargetTexture||e.isDepthTexture||e.isFramebufferTexture,i=this.backend;if(s&&!0===r.initialized&&i.destroyTexture(e)", organ: "Diät (6) Vorher-Textur-Wächter (updateTexture zerstört die alte Ziel-Textur)" },
    { sub: "this.updateNodes=n,this.updateBeforeNodes=a,this.updateAfterNodes=o,this.observer=u", organ: "Diät (6) Vorher-Textur-Wächter (die Vorher-Knoten am NodeBuilderState)" },
    { sub: '"assign"!==e&&(ci.prototype[e]=function(...e){', organ: "Diät (9) die eigenen Felder: das Geerbte am Knoten-Prototyp sind nur Ketten-Methoden (B4, 18.10.: 122 Klassen, 2 324 Felder, 0 Uniform/Knoten/Accessor)" },
    { sub: "this.hasAnimation=!0===e.object.isSkinnedMesh,this.refreshUniforms=", organ: "Diät (11) nach Eingang: der Stoff-Verweis, dessen Eigenschaft equals() prüft (refreshUniforms)" },
    { sub: "const o=this.getMaterialData(e.material);if(o._renderId!==r){o._renderId=r;for(const e in o){const t=o[e],r=i[e];", organ: "Diät (13) · AnazhRealm._diaetStoffBlick: equals() merkt die Stoff-Daten je STOFF und Render-Id (getMaterialData), nie je Render-Objekt, und geht JEDEN Schlüssel der Daten durch (der Stempel steht am Stoff)" },
    { sub: "clearUpdateRanges(){this._updateRangeCache.clear(),super.clearUpdateRanges()}", organ: "Diät (11) nach Eingang: der eigene Uniform-Puffer lädt seine Bereiche und leert sie (wie Bindings._update)" },
    // DIE VERDECKUNGS-ABFRAGE: r184 beginnt die Query im Draw und schließt sie träge beim nächsten Objekt; der
    // Wirt hält die offene am selben Feld (`lastOcclusionObject`), schließt sie vor dem Pass-Bruch, lässt `finishRender` nur
    // eine offene schließen und füllt die Lücken nie begonnener Indizes vor dem WeakSet.
    { sub: "if(void 0!==n.occlusionQuerySet){const e=n.lastOcclusionObject;e!==r&&(null!==e&&!0===e.occlusionTest&&(n.currentPass.endOcclusionQuery(),n.occlusionQueryIndex++),!0===r.occlusionTest&&(n.currentPass.beginOcclusionQuery(n.occlusionQueryIndex),n.occlusionQueryObjects[n.occlusionQueryIndex]=r),n.lastOcclusionObject=r)}", organ: "Verdeckungs-Abfrage (träges Ende am nächsten Objekt, `lastOcclusionObject`)" },
    { sub: "t.occlusionQueryIndex=0,t.occlusionQueryObjects=new Array(s),t.lastOcclusionObject=null", organ: "Verdeckungs-Abfrage (beginRender: Index, Objekt-Feld mit Lücken, keine offene)" },
    { sub: "r>t.occlusionQueryIndex&&t.currentPass.endOcclusionQuery()", organ: "Verdeckungs-Abfrage (finishRender schließt nach Zähler, nicht nach offen)" },
    { sub: "for(let t=0;t<s.length;t++)n[t]===BigInt(0)&&e.add(s[t])", organ: "Verdeckungs-Abfrage (resolveOccludedAsync: das WeakSet nimmt jede Lücke)" },
    // das Feld der Hülle des Auflösens: beginRender reicht es als `currentOcclusionQueryObjects` weiter
    { sub: "t.currentOcclusionQuerySet=t.occlusionQuerySet,t.currentOcclusionQueryBuffer=t.occlusionQueryBuffer,t.currentOcclusionQueryObjects=t.occlusionQueryObjects", organ: "Verdeckungs-Abfrage (beginRender: das Objekt-Feld wandert nach current*)" },
    { sub: "{currentOcclusionQueryBuffer:r,currentOcclusionQueryObjects:s}=t;if(r&&s){const e=new WeakSet;t.currentOcclusionQueryObjects=null", organ: "Verdeckungs-Abfrage (resolveOccludedAsync liest currentOcclusionQueryObjects)" },
    { sub: "else if(t===ri.RENDER){const t=this._getMaps(this.updateBeforeMap,r);if(t.renderId!==this.renderId)", organ: "_szeneTiefe (der Abbild-Knoten zieht je Render einmal)" },
    { sub: 'e===K&&(this.backend.hasFeature("float32-filterable")?t.sampleType=Gw:t.sampleType=zw)', organ: "_szeneTiefe (das r32float-Abbild als float-Textur gebunden)" },
    { sub: "if(!1===r.has(e)){const s=t.clone();r.set(e,s)}return r.get(e)}", organ: "_szeneTiefe (der Klon je Ziel trägt den Namen)" },
    // Der Schatten-Takt (_loopShadowUpdate): der EINE Leser je Licht, die Matrix nur im Schatten-Render; der Filter je Kaskade
    { sub: "updateBefore(e){const{shadow:t}=this;let r=t.needsUpdate||t.autoUpdate;", organ: "_loopShadowUpdate (Leser je Licht)" },
    { sub: "renderShadow(e){const{shadow:t,shadowMap:r,light:s}=this,{renderer:i,scene:n}=e;t.updateMatrices(s)", organ: "_loopShadowUpdate (Matrix nur im Render)" },
    { sub: "renderer.shadowMap.enabled||(e.shadow.camera.coordinateSystem!==", organ: "_loopShadowUpdate (Uniform nur ohne Map)" },
    { sub: "m=i.filterNode||this.getShadowFilterFn(t.shadowMap.type)", organ: "_schattenFilter (shadow.filterNode vor dem Typ-Filter)" },
    // Uniform-Heimat (shared-Gruppen-Klon-Weiche + renderGroup-Export)
    { sub: "groupNode.shared", organ: "_uniformHeimatTeilen (Klon-Weiche)" },
    { sub: "setGroup(e){return this.groupNode=e,this}", organ: "_uniformHeimatTeilen (setGroup)" },
    // Der stabile Puffer-Name: InstanceNode baut die Matrix-Puffer, der WGSL-Builder nennt sie ohne Namen nach der id
    { sub: "_createInstanceMatrixNode(e,t){let r;const{instanceMatrix:s}=this", organ: "Instanz-Puffer-Name (InstanceNode._createInstanceMatrixNode → setName)" },
    { sub: '"NodeBuffer_"+', organ: "Instanz-Puffer-Name (der id-Name, den setName ersetzt)" },
    // Die zeitliche Hochskalierung (`_zeitAufloesung`, K50) erbt von r184s TRAANode (verbatim): Bau der Ziele (die
    // Geschichte ist das Ziel des letzten Resolve, G7), `setViewOffset` legt den Halton-Versatz in der Größe an, die der
    // Knoten ihm reicht (die Eingangs-Größe), `setSize` stellt `_invSize` (die Ausgabe), `clearViewOffset` schaltet die
    // Folge; das Quad nimmt die Klasse des Quads der Post-Kette; die Reprojektion steht VOR dem Post-Render (der Versatz lebt
    // nur zwischen den Pipeline-Haken); die Aufnahme rendert eine Halton-Runde (31 Versätze) und schaltet den Node-Frame
    { sub: "t.generation!==l.generation&&(t.generation=l.generation,s=!0)", organ: "_zeitAufloesung (die Lage ist die Generation: eine getauschte Textur bindet nur bei anderer Generation neu)" },
    { file: TRAA, sub: "viewOffset.offsetX + jitterOffset[ 0 ] - 0.5, viewOffset.offsetY + jitterOffset[ 1 ] - 0.5,", organ: "_zeitAufloesung (der Versatz in Pixeln der gereichten Größe, gelesen aus camera.view)" },
    { file: TRAA, sub: "this._invSize.value.set( 1 / width, 1 / height );", organ: "_zeitAufloesung (setSize stellt die Ausgabe-Größe des Resolve)" },
    { sub: 'this._quadMesh=new gx(r),this._quadMesh.name="Render Pipeline"', organ: "_zeitAufloesung (das Quad der Post-Kette — seine Klasse zeichnet den Resolve)" },
    { sub: "null!==this._context.onBeforeRenderPipeline&&this._context.onBeforeRenderPipeline()", organ: "_traaReprojektion (RenderPipeline ruft den Vorher-Haken)" },
    { file: TRAA, sub: "this._jitterIndex = this._jitterIndex % ( _haltonOffsets.length - 1 );", organ: "Ausgabe-Aufnahme (32 Frames = eine Halton-Runde)" },
    { file: TRAA, sub: "this.updateBeforeType = NodeUpdateType.FRAME;", organ: "Ausgabe-Aufnahme/gpu-bank (je Frame nodeFrame.update)" },
    // DAS AUSGABE-ZIEL IN 32 BIT (`_ausgabeFormat`): r184 fordert jedes Feature an, das der Adapter trägt (darum
    // fragt der Stamm `device.features`); RGBFormat × UnsignedInt101111Type ist rg11b10ufloat; PassNode.setup schreibt den
    // Typ je Bau auf den des Renderers zurück (der Stamm stellt ihn danach).
    { sub: 'RG11B10UFloat:"rg11b10ufloat-renderable"', organ: "_ausgabeFormat (das Feature, das r184 anfordert)" },
    { sub: 'case Xe:switch(s){case Je:u=OA;break;case et:u=kA;break;default:o("WebGPURenderer: Unsupported texture type with RGBFormat."', organ: "_ausgabeFormat (RGBFormat × UnsignedInt101111Type → rg11b10ufloat)" },
    { sub: "setup({renderer:e}){return this.renderTarget.samples=void 0===this.options.samples?e.samples:this.options.samples,this.renderTarget.texture.type=e.getOutputBufferType()", organ: "_ausgabeFormat (PassNode.setup stellt den Typ je Bau zurück — der Pass stellt ihn danach)" },
    // DIE KASKADEN-BOX (W7: _kaskadenGeburt · _kaskadenPassen · _kaskadenZiele · _passSicht): der Host ersetzt je Instanz
    // die Licht-Stellung des Addons (updateBefore stumm, sein Zweit-Schreiber _updateShadowBounds stumm), ruft dessen
    // _init vom Prototyp, liest seine Kaskaden-Uniform und den Fade-Saum des Shaders, hüllt den Ziel-Bau jedes
    // Kaskaden-Knotens; die Szenen-Haken laufen je Render vor der Projektion und danach — auch im Kompilat (nur vorher).
    { file: CSM, sub: "_init( { camera, renderer } ) {", organ: "_kaskadenGeburt (ruft CSMShadowNode.prototype._init)" },
    { file: CSM, sub: "this._shadowNodes.push( shadow( lwLight, lShadow ) );", organ: "_kaskadenZiele (je Kaskaden-Knoten die Hülle um setupRenderTarget)" },
    { file: CSM, sub: "this._updateShadowBounds();", organ: "der stumme Zweit-Schreiber (updateFrustums ruft _updateShadowBounds — je Instanz stumm)" },
    { file: CSM, sub: "updateBefore( /*builder*/ ) {", organ: "_kaskadenPassen ersetzt die Licht-Stellung (updateBefore je Instanz stumm)" },
    { file: CSM, sub: "margin.assign( float( 0.25 ).mul( closestEdge.pow( 2.0 ) ) );", organ: "_kaskadenSaum + gate:schatten-werfer K1 (der Fade-Saum des Shaders)" },
    { file: CSM, sub: "const cascades = reference( '_cascades', 'vec2', this )", organ: "gate:schatten-werfer K1 (die Kaskaden-Uniform, die der Shader liest)" },
    { sub: 'r.name="ShadowDepthTexture",r.compareFunction=', organ: "_kaskadenZiele (ShadowNode.setupRenderTarget baut Tiefe …)" },
    { sub: 'return s.texture.name="ShadowMap",s.texture.type=e.mapType,s.depthTexture=r,{shadowMap:s,depthTexture:r}}', organ: "_kaskadenZiele (… und Farbe, die Hülle setzt r8 + 16 bit)" },
    // DIE KARTE OHNE FARBE (Ziel-Zensus: kaskade0/1:farbe OHNE LESER): die Ziel-Daten tragen eine leere Farb-
    // Liste, die Farb-Textur legt die GPU nie an — der Ziel-Bau misst textures[0] und reicht die Liste an den Kontext,
    // updateTexture ist der EINE Anlage-Weg, der Pass-Deskriptor und der Pipeline-Bau laufen über die Liste, Format und
    // Farbraum lasen blind textures[0].
    { sub: "updateRenderTarget(e,t=0){const r=this.get(e),s=0===e.samples?1:e.samples,i=r.depthTextureMips||(r.depthTextureMips={}),n=e.textures,a=this.getSize(n[0])", organ: "_kaskadenZiele (der Ziel-Bau misst textures[0] — das Textur-Objekt bleibt)" },
    { sub: "r.width=a.width,r.height=a.height,r.textures=n,r.depthTexture=l||null", organ: "_kaskadenZiele (die Ziel-Daten tragen die Farb-Liste — die Hülle leert sie)" },
    { sub: "updateTexture(e,t={}){const r=this.get(e);if(!0===r.initialized&&r.version===e.version)return;", organ: "_kaskadenZiele (der EINE Anlage-Weg einer Textur — die Karten-Farbe überspringt ihn)" },
    { sub: "getCurrentColorFormat(e){let t;return t=null!==e.textures?this.getTextureFormatGPU(e.textures[0]):this.getPreferredCanvasFormat(),t}", organ: "_kaskadenZiele (Format auf leerer Liste: null)" },
    { sub: "getCurrentColorSpace(e){return null!==e.textures?e.textures[0].colorSpace:this.backend.renderer.outputColorSpace}", organ: "_kaskadenZiele (Farbraum auf leerer Liste: null)" },
    { sub: "if(null!==e.context.textures){const t=e.context.textures,r=e.context.mrt;for(let e=0;e<t.length;e++)", organ: "_kaskadenZiele (der Pipeline-Bau: je Farbe ein Ziel — leere Liste, reine Tiefen-Pipeline)" },
    { sub: "const t=e.textures,o=[];let u;const l=this._isRenderCameraDepthArray(e);for(let s=0;s<t.length;s++)", organ: "_kaskadenZiele (der Pass-Deskriptor: je Farbe ein Anhang — leere Liste, nur die Tiefe)" },
    { sub: "g.clippingContext.updateGlobal(l,t),l.onBeforeRender(this,e,t,p);const v=t.isArrayCamera", organ: "_passSicht (der Vorher-Haken je Render, vor der Projektion — auch im Schatten-Render)" },
    { sub: "l.onAfterRender(this,e,t,p),this.inspector.finishRender", organ: "_passSicht (der Nachher-Haken je Render)" },
    // DAS REGISTER (Melder und Tor)
    { file: CORE, sub: "onUploadCallback(){}set needsUpdate(t){!0===t&&this.version++}", organ: "AnazhRealm._regungMelder (BufferAttribute · InterleavedBuffer)" },
    { file: CORE, sub: "this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),", organ: "AnazhRealm._regungMelder (updateMatrix)" },
    { sub: "setGeometry(e){this.geometry=e,this.attributes=null,this.attributesId=null}getAttributes(){if(null!==this.attributes)return this.attributes;", organ: "AnazhRealm._diaetRuhig (Bau-Wechsel, gelesene Attribute)" },
    // Der Satz: ein Chunk ist ein Bereich im Pool-Puffer — sein Upload ist ein Teil-Schreiben ab dem
    // Bereichs-Anfang (updateRanges → queue.writeBuffer(offset)); ohne diese Bahn lüde jeder Chunk den ganzen Satz.
    {
        sub: "const o=t.updateRanges;if(0===o.length)s.queue.writeBuffer(n,0,a,0);else{",
        organ: "_chunkSatzEin/_chunkSatzMarke (Teil-Upload je Chunk-Bereich)",
    },
    // Der Satz je Pass: jeder Pass setzt im Szenen-Haken seinen Abschnitt als drawRange — der
    // Draw liest die Geometrie-drawRange beim ZEICHNEN (Referenz am Render-Objekt), nie einmal je Objekt; und jeder Pass
    // gibt seinen Befehl am Pass-Ende ab (ein Umlegen mitten im Frame zieht nur Abschnitte von Schatten-Pässen um, die
    // schon abgegeben sind; den Lauf des offenen Haupt-Passes lässt es liegen).
    {
        sub: "if(u.drawRange=e.geometry.drawRange,u.group=n,null!==this._currentRenderBundle)",
        organ: "_chunkSatzPass/_chunkSatzZeige (der Abschnitt je Pass als drawRange)",
    },
    {
        sub: "getDrawParameters(){const{object:e,material:t,geometry:r,group:s,drawRange:i}=this",
        organ: "_chunkSatzZeige (der Draw liest die drawRange beim Zeichnen)",
    },
    {
        sub: "if(this.device.queue.submit([t.encoder.finish()]),null!==e.textures)",
        organ: "_chunkSatzUmlegen (jeder Schatten-Pass ist am Ende abgegeben — ein Umzug mitten im Frame trifft ihn nie)",
    },
    // DIE INSTANZ-WAHL JE PASS: eine Pflanzen-Stufe ordnet im Szenen-Haken ihre Slots und setzt `count` — der Draw
    // liest die Instanz-Zahl beim ZEICHNEN (nicht einmal je Objekt), und jeder Pass ist am Ende abgegeben: die Kaskade k0
    // schreibt die Puffer eines Zwillings, gibt ab, dann schreibt k1 — der Inhalt jedes Passes erreicht die GPU vor dem nächsten.
    {
        sub: "r.instanceCount:void 0!==e.count&&(u=Math.max(0,e.count)),0===u)return null",
        organ: "_instanzWahlPass (der Draw liest count beim Zeichnen; count 0 zeichnet nicht)",
    },
    {
        sub: "if(this.device.queue.submit([t.encoder.finish()]),null!==e.textures)",
        organ: "_instanzWahlPass (jeder Kaskaden-Pass ist abgegeben, bevor der nächste die Zwillings-Puffer schreibt)",
    },
    // Das Wachsen des Satzes tauscht die Geometrie am selben Mesh: das Render-Objekt sieht den Tausch beim nächsten Zeichnen
    // und liest die Attribute der neuen Geometrie (der Geometrie-Hörer, der sonst die neuen Puffer zerstörte, fällt im
    // Register — `_renderObjektRegister`, Anker unten).
    {
        sub: "l.needsGeometryUpdate&&l.setGeometry(e.geometry)",
        organ: "_chunkSatzGeometrie (der Tausch am selben Mesh: das Render-Objekt folgt der Geometrie)",
    },
    {
        sub: "setGeometry(e){this.geometry=e,this.attributes=null,this.attributesId=null}",
        organ: "_chunkSatzGeometrie (nach dem Tausch liest das Render-Objekt die Attribute neu)",
    },
    // DIE RESIDENZ (W6): r184 hält jedes hochgeladene Attribut STARK in `info.memoryMap` und gibt es nur über
    // `_attributes.delete` frei — der GPU-Abschied (_gpuAbschied · _instanzAbschied) und der Kehraus (_gpuKehraus) lesen das
    // Register, die Zeichen-Spur je Attribut (`attributeCall`) und wissen, warum ein Speicher-Puffer nur mit seiner Senke fällt.
    { sub: "this._attributes=new By(r,this.info)", organ: "_gpuAbschied (renderer._attributes)" },
    { sub: "delete(e){const t=super.delete(e);return null!==t&&(this.backend.destroyAttribute(e),this.info.destroyAttribute(e)),t}", organ: "_gpuAbschied (Attributes.delete: GPU-Puffer + Register)" },
    { sub: "destroyAttribute(e){const t=this.backend;t.get(this._getBufferAttribute(e)).buffer.destroy(),t.delete(e)}", organ: "_gpuAbschied (verschränkte Attribute fallen nie einzeln: der geteilte Puffer bliebe tot im Gedächtnis)" },
    { sub: "_createAttribute(e,t){const r=this._getAttributeMemorySize(e);this.memoryMap.set(e,{size:r,type:t})", organ: "_gpuKehraus (das Register: memoryMap hält jedes Attribut stark)" },
    { sub: "this._geometries=new Dy(this._attributes,this.info)", organ: "_gpuKehraus (renderer._geometries)" },
    { sub: "this.attributeCall=new WeakMap", organ: "_gpuKehraus (die Zeichen-Spur je Attribut)" },
    { sub: "updateAttribute(e,t){const r=this.info.render.calls;", organ: "_gpuKehraus (attributeCall = render.calls des letzten Zeichnens)" },
    { sub: "this.attributes.update(e,i),n.attribute!==e&&(n.attribute=e,s=!0)", organ: "_instanzAbschied (die Bindegruppe eines Speicher-Puffers folgt nur dem Attribut-Objekt — er fällt nur mit seiner Senke)" },
    // Das Render-Objekt-Register: r184 baut Render-Objekte über die Instanz-Methode createRenderObject und hängt jedes an das
    // dispose-Ereignis von Stoff und Geometrie (der geteilte Stoff hielt sie für immer).
    { sub: "this._objects=new Sy(this,this._nodes,this._geometries,this._pipelines,this._bindings,this.info)", organ: "_renderObjektRegister (renderer._objects)" },
    { sub: "l=this.createRenderObject(this.nodes,this.geometries,this.renderer,e,t,r,s,i,n,a,o)", organ: "_renderObjektRegister (jedes Render-Objekt entsteht über createRenderObject)" },
    { sub: 'this.onMaterialDispose=()=>{this.dispose()},this.onGeometryDispose=()=>{this.attributes=null,this.attributesId=null},this.material.addEventListener("dispose",this.onMaterialDispose),this.geometry.addEventListener("dispose",this.onGeometryDispose)', organ: "_instanzAbschied (Stoff und Geometrie halten das Render-Objekt über ihr dispose-Ereignis)" },
    { sub: "delete(e){if(e.isRenderObject){const t=this.get(e).nodeBuilderState;void 0!==t&&(t.usedTimes--,0===t.usedTimes&&this.nodeBuilderCache.delete(this.getForRenderCacheKey(e)))}return super.delete(e)}", organ: "_instanzAbschied (der Knoten-Zustand einer Senke verlässt den nodeBuilderCache — er hält die Senke)" },
    { sub: "deleteBindGroupData(e){const{backend:t}=this,r=t.get(e);r.layout&&(r.layout.usedTimes--,0===r.layout.usedTimes&&this._bindGroupLayoutCache.delete(r.layoutKey)", organ: "_instanzAbschied (die eigenen Bindegruppen verlassen die Layout-Zählung)" },
    { sub: "getNodeBuilderState(){return this._nodeBuilderState||(this._nodeBuilderState=this._nodes.getForRender(this))}", organ: "_instanzAbschied (Render-Objekt: Knoten-Zustand gecacht am Objekt)" },
    // Der Geometrie-Halter: initGeometry hängt EINEN dispose-Hörer je Geometrie, der das erste Render-Objekt einfängt und in
    // _geometryDisposeListeners lebt — _renderObjektRegister nimmt ihn heraus (der Kehraus trägt die Residenz).
    { sub: "initGeometry(e){const t=e.geometry;this.get(t).initialized=!0,this.info.memory.geometries++;const r=()=>{", organ: "_renderObjektRegister (der Geometrie-Hörer fängt das erste Render-Objekt ein)" },
    { sub: 't.addEventListener("dispose",r),this._geometryDisposeListeners.set(t,r)}', organ: "_renderObjektRegister (der Hörer lebt in _geometryDisposeListeners)" },
    { sub: "updateForRender(e){!1===this.has(e)&&this.initGeometry(e),this.updateAttributes(e)}", organ: "_renderObjektRegister (initGeometry läuft über die Instanz, einmal je Geometrie)" },
    // Die Textur merkt jede Bindegruppe, die sie liest, und vergisst sie nie — _instanzAbschied nimmt die Gruppen der Senke heraus.
    { sub: "l=this.textures.get(u);o&&(this.textures.updateTexture(u),t.generation!==l.generation&&(t.generation=l.generation,s=!0),l.bindGroups.add(e))", organ: "_instanzAbschied (die Textur hält die Bindegruppen ihrer Leser)" },
    { sub: "this._textures=new tb(this,r,this.info)", organ: "_instanzAbschied (renderer._textures)" },
    // DER EINE LEINWAND-WEG (`_leinwandWeg`, gestellt von der Weiche in `_loopRender`): der Leinwand-Pass trägt
    // eine Tiefe nur bei renderer.depth/stencil, updateSize verwirft seinen Deskriptor; das Rahmen-Ziel des Direktpfads
    // (Tonemapping zur Leinwand) nimmt seine Tiefe aus renderer.depth — ohne sie liest copyFramebufferToTexture die Tiefen-
    // Textur eines Ziels, das keine trägt (der Absturz des Direktpfads, gate:post-kette); die GPU-Textur der Leinwand-Tiefe
    // hängt am Leinwand-Ziel und fällt über destroyTexture.
    { sub: "!0!==e.depth&&!0!==e.stencil||(i.depthStencilAttachment={view:this.textureUtils.getDepthBuffer(e.depth,e.stencil).createView()})", organ: "_leinwandWeg (die Post-Kette zeichnet in eine Leinwand ohne Tiefe)" },
    { sub: "updateSize(){this.delete(this.renderer.getCanvasTarget())}", organ: "_leinwandWeg (der Leinwand-Pass baut seinen Deskriptor neu)" },
    { sub: "this.isWebGPUBackend=!0", organ: "_leinwandWeg (Leinwand-Tiefe nur auf WebGPU)" },
    { sub: "{depth:a,stencil:o}=this,u=this._outputRenderTarget||this._canvasTarget;", organ: "_leinwandWeg (das Rahmen-Ziel des Direktpfads liest renderer.depth)" },
    { sub: "l.depthBuffer=a,l.stencilBuffer=o,", organ: "_leinwandWeg (das Rahmen-Ziel folgt renderer.depth je Frame)" },
    { sub: "i=t.renderTarget?e.isDepthTexture?this.get(t.depthTexture).texture:", organ: "_leinwandWeg (die Tiefen-Kopie liest die Tiefen-Textur des Ziels — ohne sie der WeakMap-Absturz)" },
    { sub: "a=r.renderer.currentSamples,o=s.depthTexture;", organ: "_leinwandWeg (die Leinwand-Tiefe ist die DepthTexture des Leinwand-Ziels)" },
    { sub: "getCanvasTarget(){return this._canvasTarget}", organ: "_leinwandWeg (das Leinwand-Ziel)" },
    { sub: "destroyTexture(e,t=!1){this.textureUtils.destroyTexture(e,t)}", organ: "_leinwandWeg (die GPU-Textur der Leinwand-Tiefe fällt in der Post-Kette)" },
    { sub: "destroyTexture(e,t=!1){const r=this.backend,s=r.get(e);void 0!==s.texture&&!1===t&&s.texture.destroy(),void 0!==s.msaaTexture&&s.msaaTexture.destroy(),r.delete(e)}", organ: "_leinwandWeg (destroyTexture zerstört und vergisst — getDepthBuffer legt sie im Direktpfad neu an)" },
    // DAS RAHMEN-ZIEL DES DIREKTPFADS (`_rahmenZielAbschied`, 0910-1): r184 legt es je Leinwand- bzw. Ausgabe-Ziel einmal an
    // (Map `_frameBufferTargets`), markiert es `isPostProcessingRenderTarget` (der Erzeuger `r184-ausgabe` im Band) und hängt
    // seinen Abschied als dispose-Hörer an das Ziel — der Stamm findet ihn am Text (`_frameBufferTargets.delete(`) und ruft ihn,
    // sobald die Post-Kette zeichnet.
    { sub: 'l.isPostProcessingRenderTarget=!0;const e=()=>{u.removeEventListener("dispose",e),l.dispose(),this._frameBufferTargets.delete(u)};u.addEventListener("dispose",e),this._frameBufferTargets.set(u,l)}', organ: "_rahmenZielAbschied (r184s Abschied des Rahmen-Ziels: Hörer ab, Ziel entsorgt, Eintrag fort)" },
    { sub: "this._frameBufferTargets=new Map;", organ: "_rahmenZielAbschied (die Rahmen-Ziele je Ziel)" },
    // … und die Liste, aus der `_rahmenZielAbschied` den Hörer liest: der EventDispatcher von three.core hält die Hörer je Art in
    // `this._listeners[art]`, und das Leinwand-Ziel des Renderers (`GS`) ist einer. Die Drift-Probe
    // in gate:post-kette (g) fährt den Zweig ohne Hörer.
    { file: CORE, sub: "addEventListener(t,e){void 0===this._listeners&&(this._listeners={});const i=this._listeners;void 0===i[t]&&(i[t]=[]),-1===i[t].indexOf(e)&&i[t].push(e)}", organ: "_rahmenZielAbschied (die Hörer je Art in `_listeners`)" },
    { file: CORE, sub: "removeEventListener(t,e){const i=this._listeners;if(void 0===i)return;const s=i[t];if(void 0!==s){const t=s.indexOf(e);-1!==t&&s.splice(t,1)}}", organ: "_rahmenZielAbschied (der Hörer nimmt sich aus `_listeners`)" },
    { sub: "class GS extends u{", organ: "_rahmenZielAbschied (das Leinwand-Ziel ist ein EventDispatcher)" },
    { sub: "EventDispatcher as u", organ: "_rahmenZielAbschied (u ist der EventDispatcher von three.core)" },
    { sub: "this._canvasTarget=new GS(", organ: "_rahmenZielAbschied (der Renderer hält sein Leinwand-Ziel)" },
    // DAS GESETZ DES SCHATTEN-BIAS (`_schattenBias`, 0710-12): r184 schiebt die Probe des Empfängers um normalWorld × normalBias
    // in WELT-METERN und addiert `bias` auf die Tiefe der Schatten-Koordinate (0..1) — beides in Texeln der Kaskade.
    { sub: "qc(\"normalBias\",\"float\",i).setGroup(_a)", organ: "_schattenBias (normalBias ist eine Uniform des Lichts)" },
    { sub: "h=Rc.mul(d);", organ: "_schattenBias (normalBias × normalWorld)" },
    { sub: "p=c.mul(w_.add(h))", organ: "_schattenBias (die Probe sitzt bei positionWorld + normalWorld × normalBias — Welt-Meter)" },
    { sub: "s.reversedDepthBuffer?n.sub(i):n.add(i)", organ: "_schattenBias (bias addiert auf die Tiefe der Schatten-Koordinate)" },
    // DIE STUFE KOSTET NUR, WENN SIE ZEIGT (`nurBeiStaerke` in _ensurePostProcessing): ein Fn-Aufruf trägt seine Argumente
    // als `rawInputs` (der Ketten-Graph der Zerleg-Linse liest sie), ein Fn ohne Layout baut seinen Rumpf inline.
    { sub: "constructor(e,t){super(),this.shaderNode=e,this.rawInputs=t,this.isShaderCallNodeInternal=!0}", organ: "_ensurePostProcessing (nurBeiStaerke — die Stufe bleibt im Ketten-Graph sichtbar)" },
    // DER SCHMALE INDEX (W7): r184 weitet beim Anlegen jedes nicht-normierte 8-/16-bit-Attribut auf 32 bit — auch den Index;
    // `_backendGesetz` setzt `normalized` nur für das Anlegen eines Uint16-Index (der EINE Weg jedes Index), der Draw bindet ihn
    // nach dem Array-Typ als uint16. Das Haut-Gewicht reist als normiertes Uint16 (unorm16x4, nie geweitet).
    // DER FROST: das Weiten schreibt die geweitete Form in das GETEILTE Attribut zurück (`r.array=o`) — darum sitzt
    // die Hülle an der KLASSE (jedes Backend der Seite: Welt + Bühnen), und Index-Wache und GPU-Wache hängen an Draw und init.
    { sub: "if(!1===e.normalized)if(o.constructor===Int16Array||o.constructor===Int8Array)o=new Int32Array(o);else if((o.constructor===Uint16Array||o.constructor===Uint8Array)&&(o=new Uint32Array(o),t&GPUBufferUsage.INDEX))", organ: "_backendGesetz (das Weiten fragt normalized — die Hülle setzt es nur für das Anlegen)" },
    { sub: "for(let e=0;e<o.length;e++)65535===o[e]&&(o[e]=4294967295);if(r.array=o,", organ: "_backendGesetz (das Weiten schreibt in das geteilte Attribut zurück — die Hülle gilt jedem Backend)" },
    { sub: "createIndexAttribute(e){let t=GPUBufferUsage.INDEX|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST;", organ: "_backendGesetz (der EINE Weg jedes Index auf die GPU)" },
    { sub: "t=h.array instanceof Uint16Array?uA:lA;o.setIndexBuffer(e,t)", organ: "_backendGesetz (der Draw bindet das Index-Format nach dem Array-Typ)" },
    { sub: "updateAttribute(e){this.attributeUtils.updateAttribute(e)}", organ: "_backendGesetz (das Nachschreiben bucht das Index-Maximum der geschriebenen Bereiche)" },
    // DIE LÖSUNG DER RENDER-OBJEKTE (Frost-Nachbesserung 4): r184 hängt jedes Render-Objekt an das dispose-Ereignis seines
    // Stoffs (6:205594) und löst es selbst nur dort (6:210413) — ein geteilter Stoff fällt nie; das Register sitzt an der
    // Klasse (createRenderObject, 6:211320), die Lösung nimmt die Hörer in ihrem eigenen Renderer ab (ro.renderer, 6:205002).
    { sub: 'this.onMaterialDispose=()=>{this.dispose()},this.onGeometryDispose=()=>{this.attributes=null,this.attributesId=null},this.material.addEventListener("dispose",this.onMaterialDispose),this.geometry.addEventListener("dispose",this.onGeometryDispose)', organ: "_renderObjekteLoesen (die Hörer, die ein Render-Objekt an Stoff und Geometrie hängt)" },
    { sub: 'dispose(){this.material.removeEventListener("dispose",this.onMaterialDispose),this.geometry.removeEventListener("dispose",this.onGeometryDispose),this.onDispose()}', organ: "_renderObjekteLoesen (r184 löst ein Render-Objekt nur beim Stoff-dispose)" },
    { sub: "createRenderObject(e,t,r,s,i,n,a,o,u,l,d){const c=this.getChainMap(d),h=new vy(e,t,r,s,i,n,a,o,u,l);return h.onDispose=", organ: "_renderObjektRegister (die Hülle an der Klasse der Render-Objekt-Verwaltung)" },
    { sub: "this.id=_y++,this._nodes=e,this._geometries=t,this.renderer=r,this.object=s", organ: "_renderObjekteLoesen (jedes Render-Objekt kennt seinen Renderer)" },
    // DER KNOTEN-BAU gehört seinem Schlüssel (Frost-Nachbesserung 5): Cache je initialCacheKey (6:378979), Auswurf beim letzten
    // Nutzer (6:380856), die uuid im Schlüssel nur bei Instanz-Senke · count > 1 · Morph (6:209550) — nur dort löst die Lösung ihn.
    { sub: "getForRenderCacheKey(e){return e.initialCacheKey}", organ: "_renderObjekteLoesen (der Knoten-Bau ist je Schlüssel gecacht)" },
    { sub: "delete(e){if(e.isRenderObject){const t=this.get(e).nodeBuilderState;void 0!==t&&(t.usedTimes--,0===t.usedTimes&&this.nodeBuilderCache.delete(this.getForRenderCacheKey(e)))}return super.delete(e)}", organ: "_renderObjekteLoesen (Nodes.delete wirft den Knoten-Bau beim letzten Nutzer aus dem Cache)" },
    { sub: '(e.isInstancedMesh||e.count>1||Array.isArray(e.morphTargetInfluences))&&(s+=e.uuid+",")', organ: "_renderObjekteLoesen (nur ein Schlüssel mit uuid gehört dem Objekt)" },
    { sub: "draw(e,t){const{object:r,context:s,pipeline:i}=e,n=this.get(s),a=this.get(i),o=a.pipeline;", organ: "_indexWacheDraw (die Index-Wache am Draw jedes Backends)" },
    { sub: "getIndex(){return this._geometries.getIndex(this)}", organ: "_indexWacheDraw (der Index, den der Draw bindet)" },
    { sub: "async init(e){await super.init(e);const t=this.parameters;", organ: "_gpuWacheAn (das Device jedes Backends nach seinem init)" },
    { sub: '[Uint16Array,["uint16","unorm16"]]', organ: "_hautGewicht (normiertes Uint16 → unorm16x4)" },
    // Die Ego-Sicht ist EIN Ebenen-Schalter: jede Kamera — Haupt-Kamera wie Kaskade — zeichnet nur, was ihre Ebenen
    // trifft, und projiziert die Kinder JEDES Knotens danach ohne Ebenen-Test (das Gerät in der Hand hängt an Knochen auf
    // SHADOW_TWIN_LAYER und zeichnet doch im Auge).
    { sub: "_projectObject(e,t,r,s,i){if(!1===e.visible)return;if(e.layers.test(t.layers))", organ: "_applyEgoSicht (jede Kamera zeichnet nur ihre Ebenen)" },
    { sub: "const n=e.children;for(let e=0,a=n.length;e<a;e++)this._projectObject(n[e],t,r,s,i)", organ: "_applyEgoSicht (die Kinder ohne Ebenen-Test: das Gerät unter Ebene-2-Knochen zeichnet)" },
    // DIE WURF-EBENE: `castShadow` ist ein Accessor auf das Bit SHADOW_TWIN_LAYER — der Konstruktor legt die Ebenen VOR der
    // ersten Zuweisung an, `copy` trägt beide; die Schatten-Kamera behält eine Maske mit einem Bit jenseits der 0 (sonst nähme
    // r184 die Maske der Haupt-Kamera und die Kaskade sähe keinen Werfer); die Schatten-Funktion liest `castShadow`.
    { file: CORE, sub: "this.layers=new lr,this.visible=!0,this.castShadow=!1", organ: "_wurfEbene (die Ebenen stehen vor der ersten Zuweisung des Wurfs)" },
    { file: CORE, sub: "this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow", organ: "_wurfEbene (copy trägt Ebenen und Wurf)" },
    { sub: "4294967294&s.camera.layers.mask||(s.camera.layers.mask=a.layers.mask)", organ: "_wurfEbene (die Schatten-Kamera behält ihre Wurf-Maske)" },
    { sub: "(!0===i.castShadow||i.receiveShadow&&r===pt)", organ: "_wurfEbene (die Schatten-Funktion liest den Wurf)" },
    { sub: "getNode(e){if(e.isQuadMesh)return ES;let t=wS.get(e);", organ: "_wurfEbene (EIN Lichter-Knoten je Szene, auch im Schatten-Pass: jedes Licht liegt auf der Wurf-Ebene)" },
];

// DIE DIÄT-PRÜFUNG (wer voll frischt): die Diät-Funktionen aus dem Stamm laden (vom ersten
// `AnazhRealm._diaet… = function` bis zum Ende von `_diaetRefresh`) und gegen Schein-Programme fahren — r184-
// Semantik: EIN Beobachter und EINE geteilte Gruppe je Programm, mehrere Objekte je Programm, die Vendor-Bahn
// (Kopf → renderId-Wand → equals()). Manipulationen für den Selbsttest tauschen den VERSORGER am geladenen Objekt,
// nie den Text: "ohneMeldung" mutet den Melder (die vergessene Lage nennt gate:kamera-treue ÄNDERUNG),
// "ohneGetragen" macht jede neue Version zum Grund
// für jedes Render-Objekt (der Stand vor K71), "getragenImmer" hält jede Version für getragen (ein Attribut, das nur
// ein Pass liest, lüde nie hoch). Ruft die Diät einen Versorger nicht, bleibt die Manipulation wirkungslos und der
// Selbsttest wird ROT (Konsum statt Zitat).
function diaetLaden(manipuliert) {
    const stamm = stammLib.text(root);
    const b = (stammLib.treffer(stamm, null, "AnazhRealm._diaetRefresh = function") || { index: -1 }).index;
    if (b < 0) return null;
    let a = b;
    for (const kopf of ["AnazhRealm._diaetGang = function", "AnazhRealm._diaetGeteiltSchreiben = function"]) {
        const s0 = (stammLib.treffer(stamm, null, kopf) || { index: -1 }).index;
        if (s0 >= 0 && s0 < a) a = s0;
    }
    const e = stamm.indexOf("\n};\n", b);
    if (e < 0) return null;
    const AnazhRealm = {};
    new Function("AnazhRealm", stamm.slice(a, e + 3))(AnazhRealm);
    if (manipuliert === "ohneGetragen") AnazhRealm._diaetGetragen = () => false;
    if (manipuliert === "getragenImmer") AnazhRealm._diaetGetragen = () => true;
    const verpasst = AnazhRealm._diaetStoffVerpasst;
    if (manipuliert === "ohneStoffStand") AnazhRealm._diaetStoffVerpasst = (od, s, md, vorR, rid, liest, v) => v;
    if (manipuliert === "stoffBlind")
        AnazhRealm._diaetStoffVerpasst = (od, s, md, vorR, rid, l, v) => verpasst(od, s, md, vorR, rid, true, v);
    if (manipuliert === "ohneMeldung") AnazhRealm._regt = () => 0;
    const fn = AnazhRealm._diaetRefresh;
    fn.A = AnazhRealm;
    return fn;
}
// ein Puffer wie three.core, dessen Setter meldet wie der Melder (`_regungMelder`)
const puffer = (fn, p) =>
    Object.defineProperty(p, "needsUpdate", {
        set(v) {
            if (v !== true) return;
            this.version++;
            fn.A._regt(this);
        },
    });
// DER SCHEIN-BEOBACHTER (r184 NodeMaterialObserver) der drei Diät-Proben: Daten je Render-Objekt (die Lage `welt`), die
// Vendor-Bahn (Kopf → renderId-Wand → equals()), und equals() vergleicht die Stoff-Daten `md` EINMAL je Render-Id
// (`getMaterialData`: `_renderId`/`_equal`) und geht wie r184 JEDEN Schlüssel der Daten gegen den Stoff durch (ein fremder
// Schlüssel bricht wie im Vendor an `.isTexture`) — ohne Stoff ruht er.
function scheinBeobachter(md = { _renderId: -1, _equal: true }, stoff = null) {
    return {
        renderObjects: new Map(),
        renderId: -1,
        hasNode: false,
        hasAnimation: false,
        getRenderObjectData(ro) {
            if (!this.renderObjects.has(ro)) {
                const w = { w: ro.object.welt, equals: (m) => m.w === w.w, copy: (m) => (w.w = m.w) };
                this.renderObjects.set(ro, { worldMatrix: w });
            }
            return this.renderObjects.get(ro);
        },
        getMaterialData: () => md,
        getGeometryData: () => ({}),
        needsVelocity: () => false,
        getLights: () => [],
        equals(ro, l, rid) {
            const w = this.getRenderObjectData(ro).worldMatrix;
            if (w.w !== ro.object.welt) return (w.w = ro.object.welt) === null;
            if (stoff && md._renderId !== rid) {
                md._renderId = rid;
                md._equal = true;
                for (const k in md) {
                    if (k === "_renderId" || k === "_equal" || stoff[k].isTexture === true || md[k] === stoff[k]) continue;
                    md[k] = stoff[k];
                    md._equal = false;
                    break;
                }
            }
            return md._equal;
        },
    };
}
function scheinVendor(ro, frame) {
    if (this.hasNode || this.hasAnimation || !this.renderObjects.has(ro)) {
        this.getRenderObjectData(ro);
        return true;
    }
    if (this.renderId !== frame.renderId) {
        this.renderId = frame.renderId;
        return true;
    }
    return this.equals(ro, [], frame.renderId) !== true;
}
function scheinObjekt(extra) {
    return Object.assign(
        {
            welt: 0,
            get matrixWorld() {
                return { w: this.welt, elements: Array(16).fill(this.welt) };
            },
        },
        extra
    );
}
// DIE SCHEIN-DIÄT zählt, WER voll frischt und welche Objekt-Gruppe lädt: 20 Programme mit je EINER geteilten Gruppe (18–19
// tragen einen Verweis ohne festes Objekt — er liest frame.object, je Programm ein Gang), 50 Senken, der Stein mit freier
// Uniform. Die Kamera-Treue (jede geteilte Gruppe je Render-Abschnitt geschrieben, kein Gang zweimal, verschachtelte Renders)
// urteilt der ECHTE Renderer (gate:kamera-treue BILD · STAND · VERSCHACHTELT) — ihr Schein-Zwilling fiel mit (13), samt Stand.
function diaetLauf(fn) {
    let objektDurchDiaet = 0,
        zeichenGaenge = null;
    const nf = {
        ro: null,
        updateBeforeNode() {},
        updateNode(n) {
            if (n.object === null) zeichenGaenge.add(this.ro.progId);
        },
    };
    const rend = {
        info: { calls: 0 },
        backend: { updateBinding: () => objektDurchDiaet++ },
        _nodes: { updateBefore() {}, getNodeFrameForRender: (ro) => ((nf.ro = ro), nf) },
        _bindings: { _update: (g) => g.bindings[0].groupNode.shared === true || objektDurchDiaet++ },
    };
    const zeichenKnoten = { id: 700, property: "x", object: null, getUpdateType: () => "render" };
    const objektKnoten = { id: 800, getUpdateType: () => "object" };
    // Ein Render-Objekt EINES Programms: die geteilte Gruppe und der Beobachter des Programms, dazu seine eigene Gruppe.
    const prog = (id, objekt) => {
        const geteilt = { id: 100 + id, bindings: [{ groupNode: { shared: true } }] };
        const updateNodes = [{ id: 200 + id, getUpdateType: () => "render" }, ...objekt];
        const nbs = { updateNodes, updateBeforeNodes: [], updateAfterNodes: [] };
        const obs = scheinBeobachter();
        return (object, eigen) => ({
            obs,
            ro: {
                progId: id,
                object,
                material: object.material,
                getBindings: () => [geteilt, eigen],
                getNodeBuilderState: () => nbs,
            },
        });
    };
    // DER STEIN: seine freie Uniform (ein Schreiber setzt `.value`, E1-n1) lädt im Wechsel die eigene Gruppe im Objekt-Gang,
    // nie voll; die eigene Gruppe ist EIN Uniform-Puffer wie r184 (updateByType vergleicht, updateBinding lädt).
    const freiWert = { isUniformNode: true, value: 0, getUpdateType: () => "none" };
    const steinPuffer = scheinPuffer([{ nodeUniform: { node: freiWert }, getValue: () => freiWert.value }]);
    const stein = prog(20, [])(scheinObjekt({ material: { _anazhDiaet: true } }), { bindings: [steinPuffer] });
    const programme = [];
    for (let p = 0; p < 20; p++) programme.push(prog(p, [objektKnoten, ...(p >= 18 ? [zeichenKnoten] : [])]));
    const objekte = [];
    for (let i = 0; i < 50; i++) {
        const senke = scheinObjekt({
            isInstancedMesh: true,
            instanceMatrix: puffer(fn, { version: 0 }),
            material: { _anazhDiaet: true },
        });
        objekte.push(programme[i % 20](senke, { bindings: [{ groupNode: { shared: false } }] }));
    }
    const render = (vorher) => {
        // r184: der Render zählt `info.calls` hoch, seine Render-Id ist der Zählerstand.
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        if (vorher) vorher();
        zeichenGaenge = new Set();
        objektDurchDiaet = 0;
        const voll = new Set();
        const steinVoll = fn(stein.obs, stein.ro, frame, scheinVendor);
        for (let i = 0; i < objekte.length; i++)
            if (fn(objekte[i].obs, objekte[i].ro, frame, scheinVendor)) {
                voll.add(i);
                zeichenGaenge.add(objekte[i].ro.progId); // der Voll-Refresh fährt jeden Knoten für SEIN Objekt
            }
        const zeichenFehlt = [18, 19].filter((p) => !zeichenGaenge.has(p)).length;
        return { voll, steinVoll, objektDurchDiaet, zeichenFehlt };
    };
    const r1 = render();
    const r2 = render();
    const r3 = render();
    const r4 = render(() => objekte[7].ro.object.welt++);
    const r5 = render(() => (objekte[11].ro.object.instanceMatrix.needsUpdate = true));
    const r6 = render();
    const r7 = render(() => freiWert.value++);
    return { r1, r2, r3, r4, r5, r6, r7 };
}
// (8) GETRAGEN: EIN Objekt in zwei Pässen — der Schatten (zuerst) liest Instanz-Matrix und Lage, das Hauptbild dazu
// die Normale; jeder Pass hat seinen Beobachter. Der Schein-Renderer lädt wie r184 je Attribut-Objekt EINMAL je Version
// (`_attributes`: `version` die hochgeladene), und nur die Attribute, die der Pass liest. Gemessen je Render: wie viele
// Pässe voll auffrischen. Soll: eine neue Version der Matrix oder der Lage frischt EINEN Pass auf (der zweite liest, was der
// erste hochlud), eine neue Normale frischt das Hauptbild auf (nur es lädt sie).
function getragenLauf(fn) {
    let n = 0;
    const attr = (k) => puffer(fn, { id: 900 + n++, version: 0, k });
    const im = attr("im"),
        lage = attr("lage"),
        normale = attr("normale");
    const daten = new Map();
    const A = { has: (a) => daten.has(a), get: (a) => daten.get(a) || (daten.set(a, {}), daten.get(a)) };
    const rend = {
        info: { calls: 0 },
        _attributes: A,
        _nodes: { getNodeFrameForRender: () => ({}) },
        _bindings: { _update() {} },
    };
    const obj = scheinObjekt({ isInstancedMesh: true, instanceMatrix: im, instanceColor: null });
    const geo = { id: 77, index: null, attributes: { position: lage, normal: normale } };
    const pass = (liest) => {
        const nbs = { updateNodes: [], updateBeforeNodes: [], updateAfterNodes: [] };
        const ro = { object: obj, geometry: geo, attributes: liest, getBindings: () => [], getNodeBuilderState: () => nbs };
        return { obs: scheinBeobachter(), ro, liest };
    };
    const paesse = [pass([im, lage]), pass([im, lage, normale])];
    const render = (vorher) => {
        if (vorher) vorher();
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        const voll = [];
        for (const p of paesse)
            if (fn(p.obs, p.ro, frame, scheinVendor)) {
                voll.push(p === paesse[0] ? "schatten" : "haupt");
                // der Voll-Refresh lädt, was dieser Pass liest (r184 `Attributes.update`)
                for (const a of p.liest) {
                    const d = A.get(a);
                    if (d.version === undefined || d.version < a.version) d.version = a.version;
                }
            }
        return voll;
    };
    return {
        erst: render(),
        stand: render(),
        matrix: render(() => (im.needsUpdate = true)),
        lage: render(() => (lage.needsUpdate = true)),
        normale: render(() => (normale.needsUpdate = true)),
        danach: render(),
    };
}
// r184 `UniformBuffer`: vergleicht je Uniform (`updateByType`), merkt den geladenen Wert, `updateBinding` lädt.
function scheinPuffer(uniforms) {
    return {
        groupNode: { shared: false },
        isUniformBuffer: true,
        updateRanges: [],
        geladen: 0,
        updateByType(u) {
            const neu = this.geladen !== u.getValue();
            this.geladen = u.getValue();
            return neu;
        },
        uniforms,
    };
}
// (13) DER STOFF JE RENDER-OBJEKT: r184 merkt die Stoff-Daten in equals() je STOFF und Render-Id, der Puffer
// des Stoff-Verweises liegt je Render-Objekt. Fünf Objekte EINES Stoffs: D (eine Senke) frischt im Render des Farbwechsels
// aus eigenem Grund VOR A, A verbraucht ihn, B und C fehlen (verdeckt), E (ein Programm ohne Stoff-Verweis, der Schatten-
// Pass) fehlt auch; danach bewegt sich B, C steht. Gemessen: welche Puffer den alten Wert tragen (`alt`) und
// wer ohne Änderung voll frischt (`ueber`) — Soll je keiner.
function stoffLauf(fn) {
    const stoff = { farbe: 1 };
    const obs = scheinBeobachter({ _renderId: -1, _equal: false, farbe: 1 }, stoff);
    const wert = { isUniformNode: true, value: 0, getUpdateType: () => "none" };
    const verweis = { isMaterialReferenceNode: true, property: "farbe", node: wert, getUpdateType: () => "object" };
    const prog = (updateNodes) => ({
        updateNodes,
        updateBeforeNodes: [],
        updateAfterNodes: [],
        observer: { refreshUniforms: ["farbe"] },
    });
    const nbs = prog([verweis]),
        nbsOhne = prog([]);
    let akt = null;
    const nf = { updateNode: (n) => n === verweis && (wert.value = akt.material.farbe), updateBeforeNode() {} };
    const rend = {
        info: { calls: 0 },
        backend: { updateBinding() {} },
        _nodes: { getNodeFrameForRender: (ro) => ((akt = ro), nf) },
        _bindings: { _update: (g) => g.bindings.forEach((b) => b.uniforms && b.updateByType(b.uniforms[0])) },
    };
    const geteilt = { bindings: [{ groupNode: { shared: true } }] };
    const ros = ["D", "A", "B", "C", "E"].map((name) => {
        const eigen = { bindings: [scheinPuffer([{ nodeUniform: { node: wert }, getValue: () => wert.value }])] };
        const object = scheinObjekt(
            name === "D" ? { isInstancedMesh: true, instanceMatrix: puffer(fn, { id: 7, version: 0 }) } : {}
        );
        const n = name === "E" ? nbsOhne : nbs;
        return {
            name,
            eigen,
            object,
            material: stoff,
            getBindings: () => [geteilt, eigen],
            getNodeBuilderState: () => n,
        };
    });
    // Ein Voll-Refresh (die Vendor-Bahn) stellt jeden Knoten für SEIN Objekt und lädt jede Gruppe.
    const render = (wer) => {
        const frame = { renderer: rend, renderId: ++rend.info.calls };
        const voll = [];
        for (const ro of ros)
            if (wer.includes(ro.name) && fn(obs, ro, frame, scheinVendor)) {
                voll.push(ro.name);
                if (ro.name !== "E") rend._nodes.getNodeFrameForRender(ro).updateNode(verweis);
                rend._bindings._update(ro.eigen);
            }
        return voll;
    };
    render("DABCE");
    render("DABCE");
    stoff.farbe = 2;
    ros[0].object.instanceMatrix.needsUpdate = true;
    render("DA");
    ros[2].object.welt = 1;
    const ueber = render("DABCE").filter((n) => n !== "B" && n !== "C");
    ueber.push(...render("DABCE"));
    const alt = ros.filter((ro) => ro.name !== "E" && ro.eigen.bindings[0].geladen !== stoff.farbe);
    return { alt: alt.map((ro) => ro.name), ueber };
}
function getragenPruefe(g) {
    const f = [];
    if (g.erst.length !== 2) f.push(`GETRAGEN: der Erst-Render initialisiert ${g.erst.length} von 2 Pässen`);
    for (const k of ["matrix", "lage"])
        if (g[k].length !== 1)
            f.push(
                `GETRAGEN: eine neue Version der ${k === "matrix" ? "Instanz-Matrix" : "Lage"} frischt ${g[k].length} Pässe voll auf (${g[k].join(" + ")}; Soll 1 — der zweite lädt nichts, die GPU trägt sie schon)`
            );
    if (!g.normale.includes("haupt"))
        f.push("GETRAGEN UPLOAD: eine neue Normale (nur das Hauptbild liest sie) frischt das Hauptbild nicht auf — sie lädt nie hoch");
    if (g.stand.length || g.danach.length) f.push(`GETRAGEN: im Stand ${g.stand.length}/${g.danach.length} Voll-Refreshs (Soll 0)`);
    return f;
}
function diaetProbe(selftest) {
    const fehler = [];
    const fn = diaetLaden(null);
    if (!fn) return { fehler: ["AnazhRealm._diaetRefresh nicht im Stamm gefunden"], selbstFeuert: false };
    const getragen = getragenLauf(fn);
    fehler.push(...getragenPruefe(getragen));
    const pruefe = (z) => {
        const f = [];
        if (z.r1.voll.size !== 50) f.push(`Erst-Render: alle 50 Objekte initialisieren (ist ${z.r1.voll.size})`);
        for (const [k, r] of Object.entries(z)) {
            if (r.objektDurchDiaet !== (k === "r4" || k === "r7" ? 1 : 0)) f.push(`${k}: die Diät schrieb ${r.objektDurchDiaet} Objekt-Gruppen (Soll: nur die des bewegten Objekts, sein Objekt-Gang)`);
            if (r.zeichenFehlt)
                f.push(
                    `Zeichen-Objekt ${k}: ${r.zeichenFehlt} von 2 Programmen mit einem Verweis ohne festes Objekt gingen keinen eigenen Gang — er arbeitete nie für ihr Objekt`
                );
        }
        if (z.r4.voll.has(7)) f.push("Objekt-Gang: ein bewegtes Objekt frischt voll auf, statt nur seine eigenen Werte zu stellen");
        if (z.r7.steinVoll) f.push("Uniform-Wächter: eine freie Objekt-Uniform frischt voll auf, statt ihre eigene Gruppe zu laden");
        if (!z.r5.voll.has(11)) f.push("Instanz-Wächter: eine Instanz-Mutation refresht voll");
        return f;
    };
    const z = diaetLauf(fn);
    fehler.push(...pruefe(z));
    // ein fremder Schlüssel in den Stoff-Daten bricht equals() (r184 liest `material[k].isTexture`) — der Render wirft
    const stoffProbe = (f) => {
        const v = [];
        try {
            const { alt, ueber } = stoffLauf(f);
            if (alt.length)
                v.push(
                    `STOFF: ${alt.join(" + ")} tragen nach einem verpassten Render den alten Stoff-Wert (equals() merkt je Stoff, nie je Render-Objekt)`
                );
            if (ueber.length)
                v.push(
                    `STOFF ÜBERFRISCHT: ${ueber.join(" + ")} frischen ohne Änderung voll auf (ein Voll-Refresh im Render des Verbrauchs, ein Programm ohne Stoff-Verweis)`
                );
        } catch (e) {
            v.push(`STOFF BRUCH: equals() bricht nach dem ersten Stoff-Wechsel (${e.message}) — ein Diät-Stempel in den Stoff-Daten`);
        }
        return v;
    };
    fehler.push(...stoffProbe(fn));
    let selbstFeuert = false;
    if (selftest) {
        // Die Diät MUSS den Getragen-Wächter fragen: ein blinder frischt jede Version auf bzw. lädt die Normale nie.
        const ohneG = getragenPruefe(getragenLauf(diaetLaden("ohneGetragen")));
        const immer = getragenPruefe(getragenLauf(diaetLaden("getragenImmer")));
        const ohneStand = stoffProbe(diaetLaden("ohneStoffStand"));
        const stumm = pruefe(diaetLauf(diaetLaden("ohneMeldung")));
        const blind = stoffProbe(diaetLaden("stoffBlind"));
        selbstFeuert =
            ohneStand.length === 1 &&
            blind.length === 1 &&
            blind[0].startsWith("STOFF ÜBERFRISCHT: E") &&
            ohneG.some((e) => e.startsWith("GETRAGEN: eine neue Version")) &&
            immer.some((e) => e.startsWith("GETRAGEN UPLOAD")) &&
            stumm.some((e) => e.startsWith("Instanz-Wächter"));
    }
    return { fehler, selbstFeuert, getragen };
}

function main() {
    const selftest = SELBSTTEST;
    const errs = [];
    const srcCache = new Map();
    const les = (f) => {
        if (!srcCache.has(f)) srcCache.set(f, fs.readFileSync(path.join(root, f)));
        return srcCache.get(f);
    };
    // (1) Fingerabdrücke: beim ersten Lauf gepinnt (Datei anker.lock.json),
    // danach Pflicht-Gleichheit — ein Vendor-Bump ändert die Lock-Datei
    // BEWUSST (im Diff sichtbar = der Vertrags-Akt).
    const lockPfad = path.join(root, "vendor", "anker.lock.json");
    let lock = fs.existsSync(lockPfad) ? ausDatei(lockPfad, true) : null;
    const ist = {};
    for (const p of PINS) {
        const buf = les(p.file);
        ist[p.file] = { bytes: buf.length, fnv: fnv(buf) };
    }
    if (!lock) {
        fs.writeFileSync(lockPfad, JSON.stringify(ist, null, 4) + "\n");
        console.log("  ℹ anker.lock.json GEMINTET (erster Lauf) — ab jetzt ist jeder Vendor-Bump ein bewusster Akt.");
        lock = ist;
    }
    for (const f in ist) {
        if (!lock[f]) errs.push(`${f}: kein Lock-Eintrag (Lock nachziehen = bewusster Akt)`);
        else if (lock[f].fnv !== ist[f].fnv || lock[f].bytes !== ist[f].bytes)
            errs.push(`${f}: Fingerabdruck weicht vom Lock ab (${ist[f].bytes} B, fnv ${ist[f].fnv}) — Vendor-Bump? ALLE Anker neu beweisen + Lock nachziehen`);
    }
    // (2) Anker:
    let geprueft = 0;
    for (const a of ANKER) {
        geprueft++;
        const src = les(a.file || ANKER_DATEI).toString("latin1");
        const sub = selftest && a.organ && a.organ.startsWith("_materialObserverDiaet (hasNode") ? a.sub + "_MANIPULIERT" : a.sub;
        if (!src.includes(sub)) errs.push(`ANKER GEFALLEN: "${a.sub}" fehlt in ${a.file || ANKER_DATEI} → Organ: ${a.organ}`);
    }
    // (3) DIE DIÄT-PRÜFUNG am Schein-Programm (r184-Semantik: Beobachter + geteilte Gruppe je Programm, renderId-
    // Wand, equals()): AnazhRealm._diaetRefresh aus dem Stamm geladen, deterministisch, GPU-frei. Bundle-Wahrheit und
    // Schatten-Stoff beweist gate:kamera-treue am echten Renderer (Aufnahme verfolgt, kein Bundle unter dem Override).
    const diaet = diaetProbe(selftest);
    for (const e of diaet.fehler) errs.push("DIÄT: " + e);
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        const diaetFeuert = diaet.selbstFeuert;
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        console.log(
            diaetFeuert
                ? "✅ SELBST-TEST: die Diät-Probe feuert (ein gemuteter Melder lässt die Instanz-Mutation ruhen; ohne Getragen-Wächter frischt jede Version jeden Pass auf, ein blinder lädt die Normale nie; ohne Stoff-Stand trägt ein verpasstes Objekt den alten Stoff, ein blinder frischt ein Programm ohne Stoff-Verweis auf)"
                : "❌ SELBST-TEST: die Diät-Probe ist vakuös"
        );
        if (errs.length > 1 || !errs.some((e) => e.includes("hasNode"))) for (const e of errs) console.error("   ❌ " + e);
        process.exit(feuert && diaetFeuert && errs.length === 1 ? 0 : 1);
    }
    wandEnde(
        errs,
        `DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Programm (ein bewegtes Objekt geht nur seinen Objekt-Gang; eine neue Version, die die GPU trägt, frischt ${diaet.getragen.matrix.length} von 2 Pässen auf; ein verpasster Stoff-Wechsel lässt 0 von 4 Puffern alt und frischt 0 Objekte ohne Änderung auf).`
    );
}
main();
