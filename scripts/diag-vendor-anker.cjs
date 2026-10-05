#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker (GOLD 3, 19.07.)
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// seinen Organen (Observer-Diät + Kamera-Treue · Schatten-Diät · Schatten-Stoff ·
// Bundle-Wahrheit · Bundle-Reihenfolge · Replay-Buchung · Reife-Wache · Uniform-
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
const fs = require("fs");
const path = require("path");
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
const ANKER = [
    // Observer-Diät + Batch-Textur-Wächter (setupObserver-Naht + Monitor-Kurzschluss)
    { file: "vendor/three.webgpu.min.js", sub: "setupObserver(e){return new", organ: "_materialObserverDiaet (Diät-Naht)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.hasNode=this.containsNode(", organ: "_materialObserverDiaet (hasNode-Kurzschluss)" },
    { file: "vendor/three.webgpu.min.js", sub: "needsRefresh(e,t){if(this.hasNode||this.hasAnimation", organ: "_materialObserverDiaet (Monitor-Bahn)" },
    // DIE KAMERA-TREUE der Diät (direkter Draw UND Bundle-Replay): Beobachter UND geteilte Bindegruppe (render · frame: Kamera-Matrizen,
    // uLodAuge) hängen am PROGRAMM (NodeBuilderState), nie an der Welt; die renderId-Wand je Beobachter schreibt sie
    // je Programm und Render. Jede Abkürzung der Diät muss diese Gruppe je Programm und Render selbst schreiben.
    { file: "vendor/three.webgpu.min.js", sub: "getMonitor(){return this._monitor||(this._monitor=this.getNodeBuilderState().observer)}", organ: "AnazhRealm._diaetRefresh (Beobachter je Programm)" },
    { file: "vendor/three.webgpu.min.js", sub: "createBindings(){const e=[];for(const t of this.bindings){if(!0!==t.bindings[0].groupNode.shared){", organ: "AnazhRealm._diaetRefresh (geteilte Gruppe je Programm)" },
    { file: "vendor/three.webgpu.min.js", sub: "if(this.renderId!==r)return this.renderId=r,!0;", organ: "AnazhRealm._diaetRefresh (renderId-Wand je Beobachter)" },
    // Die Schatten-Diät: EIN Schatten-Material je Licht, die Original-Knoten hängen je Objekt darin
    { file: "vendor/three.webgpu.min.js", sub: 't.isShadowPassMaterial=!0,t.name="ShadowMaterial"', organ: "Schatten-Diät (_configureRenderer, isShadowPassMaterial)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.isShadowPassMaterial){const{colorNode:t,depthNode:r,positionNode:s}=this._getShadowNodes(i)", organ: "Schatten-Diät (Original-Knoten im Override)" },
    // DER SCHATTEN-STOFF JE OBJEKT: renderObject setzt je Objekt alphaTest des Originals auf den EINEN geteilten
    // Schatten-Stoff, der Setter zählt bei jedem Wechsel über 0 die Version; jede Version prüft je Bürger den Schlüssel
    // und die Pipeline — _configureRenderer trägt je Objekt die Version des Original-Materials in den Stoff.
    { file: "vendor/three.core.min.js", sub: "set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}", organ: "Schatten-Stoff je Objekt (der Setter, den der Stoff überschreibt)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.alphaTest=i.alphaTest,e.alphaMap=i.alphaMap,e.transparent=", organ: "Schatten-Stoff je Objekt (renderObject setzt die Werte je Objekt)" },
    { file: "vendor/three.webgpu.min.js", sub: "(l.version!==t.version||l.needsUpdate)&&(l.initialCacheKey!==l.getCacheKey()", organ: "Schatten-Stoff je Objekt (Version → Schlüssel-Prüfung je Bürger)" },
    { file: "vendor/three.webgpu.min.js", sub: "t.material===s&&t.materialVersion===s.version", organ: "Schatten-Stoff je Objekt (Version → Pipeline-Prüfung je Bürger)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._currentRenderObjectFunction=this._renderObjectFunction||this.renderObject", organ: "Schatten-Stoff je Objekt (renderObject am Renderer gelesen)" },
    // DIE DIÄT-BAHN am Programm (_diaetGeteiltSchreiben / _diaetRefresh): jede private Stelle, die sie ruft.
    { file: "vendor/three.webgpu.min.js", sub: "updateBefore(e){const t=e.getNodeBuilderState();for(const r of t.updateBeforeNodes)this.getNodeFrameForRender(e).updateBeforeNode(r)}", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._nodes.updateBefore)" },
    { file: "vendor/three.webgpu.min.js", sub: "getNodeFrameForRender(e){return this.getNodeFrame(e.renderer,e.scene,e.object,e.camera,e.material)}", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._nodes.getNodeFrameForRender)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateNode(e){const t=e.getUpdateType(),r=e.updateReference(this);", organ: "AnazhRealm._diaetGeteiltSchreiben (NodeFrame.updateNode)" },
    { file: "vendor/three.webgpu.min.js", sub: "getUpdateType(){return this.updateType}", organ: "AnazhRealm._diaetGeteiltSchreiben (Knoten-Takt render/frame/object)" },
    { file: "vendor/three.webgpu.min.js", sub: "_update(e,t){const{backend:r}=this;let s=!1,i=!0,n=0,a=0;for(const t of e.bindings){if(!1!==this.nodes.updateGroup(t)){", organ: "AnazhRealm._diaetGeteiltSchreiben (rend._bindings._update je Gruppe)" },
    { file: "vendor/three.webgpu.min.js", sub: "getBindings(){return this._bindings||(this._bindings=this.getNodeBuilderState().createBindings())}", organ: "AnazhRealm._diaetGeteiltSchreiben (ro.getBindings)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.updateNodes=n,this.updateBeforeNodes=a,this.updateAfterNodes=o,this.observer=u", organ: "AnazhRealm._diaetRefresh (NodeBuilderState: updateNodes · updateAfterNodes · observer)" },
    { file: "vendor/three.webgpu.min.js", sub: "equals(e,t,r){const{object:s,material:i,geometry:n}=e,a=this.getRenderObjectData(e);", organ: "AnazhRealm._diaetRefresh (obs.equals)" },
    { file: "vendor/three.webgpu.min.js", sub: "getLights(e,t){if(", organ: "AnazhRealm._diaetRefresh (obs.getLights)" },
    { file: "vendor/three.webgpu.min.js", sub: 'needsVelocity(e){const t=e.getMRT();return null!==t&&t.has("velocity")}', organ: "AnazhRealm._diaetRefresh (obs.needsVelocity)" },
    { file: "vendor/three.webgpu.min.js", sub: "firstInitialization(e){return!1===this.renderObjects.has(e)&&(this.getRenderObjectData(e),!0)}", organ: "AnazhRealm._diaetRefresh (obs.renderObjects = Erst-Init)" },
    // DIE BUNDLE-WAHRHEIT (_configureRenderer, Chokepoint _renderScene): r184 hält den Aufnahme-Zeiger ohne Stapel,
    // verfolgt nur bei stehendem Zeiger, refresht im Replay ausserhalb von renderObject; der Override-Stoff wird je
    // Objekt eingerichtet und zurückgesetzt; eine BundleGroup ohne backend.beginBundle ist eine Gruppe.
    { file: "vendor/three.webgpu.min.js", sub: 'this.isBundleGroup=!0,this.type="BundleGroup",this.static=!0,this.version=0}set needsUpdate(e){!0===e&&this.version++}', organ: "_archRegionBundleFor (THREE.BundleGroup)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._currentRenderBundle=o;const{transparentDoublePass:e,transparent:d,opaque:c}=n;", organ: "Bundle-Wahrheit (die Aufnahme setzt den Zeiger)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._currentRenderBundle=null,this.backend.finishBundle(a,o),u.version=s.version", organ: "Bundle-Wahrheit (die Aufnahme nullt den Zeiger, ohne Stapel)" },
    { file: "vendor/three.webgpu.min.js", sub: "null!==this._currentRenderBundle){this.backend.get(this._currentRenderBundle).renderObjects.push(u),u.bundle=this._currentRenderBundle.bundleGroup}", organ: "Bundle-Wahrheit (verfolgt nur bei stehendem Zeiger)" },
    { file: "vendor/three.webgpu.min.js", sub: "i.renderId=n,this._currentRenderContext=a,this._currentRenderObjectFunction=o,this._handleObjectFunction=u,this._callDepth--", organ: "Bundle-Wahrheit (_renderScene stellt den Zeiger NICHT wieder her)" },
    { file: "vendor/three.webgpu.min.js", sub: "if(!0===e.isBundleGroup&&void 0!==this.backend.beginBundle){", organ: "Bundle-Wahrheit (ohne beginBundle ist die BundleGroup eine Gruppe)" },
    { file: "vendor/three.webgpu.min.js", sub: "const{renderObjects:e}=u;for(let t=0,r=e.length;t<r;t++){const r=e[t];this._nodes.needsRefresh(r)&&(this._nodes.updateBefore(r),this._nodes.updateForRender(r),this._bindings.updateForRender(r),this._nodes.updateAfter(r))}", organ: "Bundle-Wahrheit (der Replay refresht ausserhalb von renderObject)" },
    { file: "vendor/three.webgpu.min.js", sub: "p&&(t.overrideMaterial.colorNode=l,t.overrideMaterial.depthNode=d,t.overrideMaterial.positionNode=c,t.overrideMaterial.side=h)", organ: "Bundle-Wahrheit (der Override-Stoff wird je Objekt zurückgesetzt)" },
    { file: "vendor/three.webgpu.min.js", sub: "n.overrideMaterial=$_(r),i.setRenderObjectFunction(", organ: "Bundle-Wahrheit (der Schatten-Render trägt overrideMaterial an der Szene)" },
    // Die Bundle-Reihenfolge: r184 sammelt Bundles und führt sie erst in finishRender aus (nach allen direkten Draws);
    // _configureRenderer führt sie direkt nach _renderBundles aus und setzt den gemerkten Pass-Zustand zurück
    { file: "vendor/three.webgpu.min.js", sub: "finishRender(e){const t=this.get(e),r=e.occlusionQueryCount;t.renderBundles.length>0&&t.currentPass.executeBundles(t.renderBundles)", organ: "Bundle-Reihenfolge (_configureRenderer, executeBundles erst in finishRender)" },
    { file: "vendor/three.webgpu.min.js", sub: "S.length>0&&this._renderBundles(S,l,R),!0===this.opaque&&w.length>0&&this._renderObjects(w,t,l,R)", organ: "Bundle-Reihenfolge (Bundles vor den opaken Direkt-Draws)" },
    { file: "vendor/three.webgpu.min.js", sub: "addBundle(e,t){this.get(e).renderBundles.push(this.get(t).bundleGPU)}", organ: "Bundle-Reihenfolge (die gesammelte Liste)" },
    { file: "vendor/three.webgpu.min.js", sub: "t.currentSets={attributes:{},bindingGroups:[],pipeline:null,index:null},t.renderBundles=[]", organ: "Bundle-Reihenfolge (Pass-Zustand nach executeBundles)" },
    // Reife-Wache (Record droppt unfertige Pipelines + versiegelt danach)
    { file: "vendor/three.webgpu.min.js", sub: "isReady(u)&&", organ: null, weich: true },
    { file: "vendor/three.webgpu.min.js", sub: "u.version=s.version", organ: "_bundleReifeWache (Record-Versiegelung)" },
    // Bundle-Pass-Physik (Wasser bleibt draußen, solange der Copy den Pass bricht)
    { file: "vendor/three.webgpu.min.js", sub: "currentPass.end()", organ: "Wasser-Bundle-Wand (copyFramebufferToTexture-Pass-Bruch)" },
    // Bundle-Replay-Buchung: die Draw-Wahrheit im Info (der Replay zieht aufgenommene RenderObjects)
    { file: "vendor/three.webgpu.min.js", sub: "_renderBundle(e,t,r){const{bundleGroup:s,camera:i,renderList:n}=e,a=this._currentRenderContext,o=this._bundles.get(s,i,a)", organ: "Bundle-Replay-Buchung (renderer._renderBundle → info.update)" },
    { file: "vendor/three.webgpu.min.js", sub: "getDrawParameters(){", organ: "Bundle-Replay-Buchung (Draw-Parameter)" },
    // Der Fenster-Wechsel: die Viewport-Tiefe ist ein Klon je Render-Ziel (der EINE Leser bindet nach setSize neu)
    { file: "vendor/three.webgpu.min.js", sub: "getTextureForReference(e=null){", organ: "_tiefenLeserNeuBinden (Viewport-Tiefen-Klon je Ziel)" },
    // Der Name der Viewport-Tiefe: EIN geteiltes Original je Seite, jeder Klon je Ziel erbt seinen Namen
    { file: "vendor/three.webgpu.min.js", sub: '"ViewportDepthTextureNode"}constructor(e=ud,t=null,r=null){null===r&&(null===Kp&&(Kp=new Z),r=Kp)', organ: "_szeneTiefe (szene:tiefenkopie am geteilten Original)" },
    { file: "vendor/three.webgpu.min.js", sub: "if(!1===r.has(e)){const s=t.clone();r.set(e,s)}return r.get(e)}", organ: "_szeneTiefe (der Klon je Ziel trägt den Namen)" },
    // Der Schatten-Takt (_loopShadowUpdate): der EINE Leser je Licht, die Matrix nur im Schatten-Render, die
    // Matrix-Uniform rechnet nur bei abgeschalteter Map selbst nach — sonst bliebe eine übersprungene Kaskade
    // nicht konsistent zu ihrer Map.
    { file: "vendor/three.webgpu.min.js", sub: "updateBefore(e){const{shadow:t}=this;let r=t.needsUpdate||t.autoUpdate;", organ: "_loopShadowUpdate (Leser je Licht)" },
    { file: "vendor/three.webgpu.min.js", sub: "renderShadow(e){const{shadow:t,shadowMap:r,light:s}=this,{renderer:i,scene:n}=e;t.updateMatrices(s)", organ: "_loopShadowUpdate (Matrix nur im Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "renderer.shadowMap.enabled||(e.shadow.camera.coordinateSystem!==", organ: "_loopShadowUpdate (Uniform nur ohne Map)" },
    // Uniform-Heimat (shared-Gruppen-Klon-Weiche + renderGroup-Export)
    { file: "vendor/three.webgpu.min.js", sub: "groupNode.shared", organ: "_uniformHeimatTeilen (Klon-Weiche)" },
    { file: "vendor/three.webgpu.min.js", sub: "setGroup(e){return this.groupNode=e,this}", organ: "_uniformHeimatTeilen (setGroup)" },
    // Der stabile Puffer-Name: InstanceNode baut die Matrix-Puffer, der WGSL-Builder nennt sie ohne Namen nach der id
    { file: "vendor/three.webgpu.min.js", sub: "_createInstanceMatrixNode(e,t){let r;const{instanceMatrix:s}=this", organ: "Instanz-Puffer-Name (InstanceNode._createInstanceMatrixNode → setName)" },
    { file: "vendor/three.webgpu.min.js", sub: '"NodeBuffer_"+', organ: "Instanz-Puffer-Name (der id-Name, den setName ersetzt)" },
    // Die zeitliche Auflösung (TRAANode r184 verbatim): der Stamm reicht die Kamera-Bewegung als `load(texel)` (NDC,
    // y oben), setzt die Reprojektion VOR dem Post-Render (der Halton-Versatz lebt nur zwischen den Pipeline-Haken),
    // die Tiefen-Kopie braucht gleiche Formate (Szenen-Tiefe und Geschichte beide depth24plus), die Aufnahme rendert
    // eine Halton-Runde (31 Versätze) und schaltet den Node-Frame (TRAA rechnet je FRAME)
    { file: "vendor/TRAANode.js", sub: "const offsetUV = this.velocityNode.load( closestPositionTexel ).xy.mul( vec2( 0.5, - 0.5 ) );", organ: "_traaKameraBewegung (velocityNode.load → NDC-Bewegung)" },
    { file: "vendor/TRAANode.js", sub: "renderPipeline.context.onBeforeRenderPipeline = () => {", organ: "_traaReprojektion (der Versatz lebt nur im Post-Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "null!==this._context.onBeforeRenderPipeline&&this._context.onBeforeRenderPipeline()", organ: "_traaReprojektion (RenderPipeline ruft den Vorher-Haken)" },
    { file: "vendor/TRAANode.js", sub: "this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, depthTexture: new DepthTexture() } );", organ: "TRAA-Tiefen-Kopie (Geschichte depth24plus wie die Szenen-Tiefe)" },
    { file: "vendor/TRAANode.js", sub: "renderer.copyTextureToTexture( currentDepth, this._historyRenderTarget.depthTexture );", organ: "TRAA-Tiefen-Kopie (Textur zu Textur, gleiches Format)" },
    // Die Platzhalter-Tiefe (1×1, namenlos, ohne Ziel): der Stamm nennt sie über den Knoten (Band-Linse, Textur-Zensus)
    { file: "vendor/TRAANode.js", sub: "this._previousDepthNode = texture( new DepthTexture( 1, 1 ) );", organ: "_ensurePostProcessing (TRAANode.vortiefe — die Band-Linse nennt jede Textur)" },
    { file: "vendor/TRAANode.js", sub: "this._jitterIndex = this._jitterIndex % ( _haltonOffsets.length - 1 );", organ: "Ausgabe-Aufnahme (32 Frames = eine Halton-Runde)" },
    { file: "vendor/TRAANode.js", sub: "this.updateBeforeType = NodeUpdateType.FRAME;", organ: "Ausgabe-Aufnahme/gpu-bank (je Frame nodeFrame.update)" },
    // DIE KASKADEN-BOX (W7: _kaskadenGeburt · _kaskadenPassen · _kaskadenZiele · _passSicht): der Host ersetzt je Instanz
    // die Licht-Stellung des Addons (updateBefore stumm, sein Zweit-Schreiber _updateShadowBounds stumm), ruft dessen
    // _init vom Prototyp, liest seine Kaskaden-Uniform und den Fade-Saum des Shaders, hüllt den Ziel-Bau jedes
    // Kaskaden-Knotens; die Szenen-Haken laufen je Render vor der Projektion und danach — auch im Kompilat (nur vorher).
    { file: "vendor/CSMShadowNode.js", sub: "_init( { camera, renderer } ) {", organ: "_kaskadenGeburt (ruft CSMShadowNode.prototype._init)" },
    { file: "vendor/CSMShadowNode.js", sub: "this._shadowNodes.push( shadow( lwLight, lShadow ) );", organ: "_kaskadenZiele (je Kaskaden-Knoten die Hülle um setupRenderTarget)" },
    { file: "vendor/CSMShadowNode.js", sub: "this._updateShadowBounds();", organ: "der stumme Zweit-Schreiber (updateFrustums ruft _updateShadowBounds — je Instanz stumm)" },
    { file: "vendor/CSMShadowNode.js", sub: "updateBefore( /*builder*/ ) {", organ: "_kaskadenPassen ersetzt die Licht-Stellung (updateBefore je Instanz stumm)" },
    { file: "vendor/CSMShadowNode.js", sub: "margin.assign( float( 0.25 ).mul( closestEdge.pow( 2.0 ) ) );", organ: "_kaskadenSaum + gate:schatten-werfer K1 (der Fade-Saum des Shaders)" },
    { file: "vendor/CSMShadowNode.js", sub: "const cascades = reference( '_cascades', 'vec2', this )", organ: "gate:schatten-werfer K1 (die Kaskaden-Uniform, die der Shader liest)" },
    { file: "vendor/three.webgpu.min.js", sub: 'r.name="ShadowDepthTexture",r.compareFunction=', organ: "_kaskadenZiele (ShadowNode.setupRenderTarget baut Tiefe …)" },
    { file: "vendor/three.webgpu.min.js", sub: 'return s.texture.name="ShadowMap",s.texture.type=e.mapType,s.depthTexture=r,{shadowMap:s,depthTexture:r}}', organ: "_kaskadenZiele (… und Farbe, die Hülle setzt r8 + 16 bit)" },
    { file: "vendor/three.webgpu.min.js", sub: "g.clippingContext.updateGlobal(l,t),l.onBeforeRender(this,e,t,p);const v=t.isArrayCamera", organ: "_passSicht (der Vorher-Haken je Render, vor der Projektion — auch im Schatten-Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "l.onAfterRender(this,e,t,p),this.inspector.finishRender", organ: "_passSicht (der Nachher-Haken je Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "c.clippingContext.updateGlobal(l,t),l.onBeforeRender(this,e,t,d);const g=this._renderLists.get(l,t)", organ: "_kompiliere (compileAsync ruft den Vorher-Haken synchron — die Wache _imKompilat)" },
    // compileAsync wartet vor dem Lesen des Ziels auf init() — ein Kompilat davor läse die Leinwand (23,7 MB Rahmenpuffer)
    { file: "vendor/three.webgpu.min.js", sub: "!1===this._initialized&&await this.init();const s=this._nodes.nodeFrame,i=s.renderId,n=this._currentRenderContext", organ: "_kompiliere (erst init, dann das Ziel)" },
    // instanceMatrix-Versions-Wächter (Kern-Setter)
    { file: "vendor/three.core.min.js", sub: "set needsUpdate(", organ: "Diät-Versions-Wächter (Attribut-Versionen)" },
    // Der Satz (Welle B): ein Chunk ist ein Bereich im Pool-Puffer — sein Upload ist ein Teil-Schreiben ab dem
    // Bereichs-Anfang (updateRanges → queue.writeBuffer(offset)); ohne diese Bahn lüde jeder Chunk den ganzen Satz.
    {
        file: "vendor/three.webgpu.min.js",
        sub: "const o=t.updateRanges;if(0===o.length)s.queue.writeBuffer(n,0,a,0);else{",
        organ: "_chunkSatzEin/_chunkSatzMarke (Teil-Upload je Chunk-Bereich)",
    },
    // Der Satz je Pass (Welle 6 Boden-Schatten): jeder Pass setzt im Szenen-Haken seinen Abschnitt als drawRange — der
    // Draw liest die Geometrie-drawRange beim ZEICHNEN (Referenz am Render-Objekt), nie einmal je Objekt; und jeder Pass
    // gibt seinen Befehl am Pass-Ende ab (ein Schatten-Pass mitten im Haupt-Pass ist abgegeben, ehe der nächste Haken einen
    // verdrängten Abschnitt überschreibt).
    {
        file: "vendor/three.webgpu.min.js",
        sub: "if(u.drawRange=e.geometry.drawRange,u.group=n,null!==this._currentRenderBundle)",
        organ: "_chunkSatzPass/_chunkSatzZeige (der Abschnitt je Pass als drawRange)",
    },
    {
        file: "vendor/three.webgpu.min.js",
        sub: "getDrawParameters(){const{object:e,material:t,geometry:r,group:s,drawRange:i}=this",
        organ: "_chunkSatzZeige (der Draw liest die drawRange beim Zeichnen)",
    },
    {
        file: "vendor/three.webgpu.min.js",
        sub: "if(this.device.queue.submit([t.encoder.finish()]),null!==e.textures)",
        organ: "_chunkSatzVerdraengen (jeder Pass ist am Ende abgegeben — ein späterer Schreiber trifft ihn nie)",
    },
];

// DIE DIÄT-PRÜFUNG (Kamera-Treue je Programm): die Diät-Funktionen aus dem Stamm schneiden (vom ersten
// `AnazhRealm._diaet… = function` bis zum Ende von `_diaetRefresh`) und gegen Schein-Programme fahren — r184-
// Semantik: EIN Beobachter und EINE geteilte Gruppe je Programm, mehrere Objekte je Programm, die Vendor-Bahn
// (Kopf → renderId-Wand → equals()). Manipulationen für den Selbsttest: "abkuerzung" kürzt jedes bekannte Objekt
// ohne Schreiben ab (die Klasse der Bundle-Abkürzung V18.518 mit Render-Stempel), "schreiben" nimmt der Diät ihr Schreiben der
// geteilten Gruppe (falls sie eins hat).
function diaetLaden(manipuliert) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const b = stamm.indexOf("AnazhRealm._diaetRefresh = function");
    if (b < 0) return null;
    const s0 = stamm.indexOf("AnazhRealm._diaetGeteiltSchreiben = function");
    const a = s0 >= 0 && s0 < b ? s0 : b;
    const e = stamm.indexOf("\n};\n", b);
    if (e < 0) return null;
    let src = stamm.slice(a, e + 3);
    if (manipuliert === "schreiben") {
        const vor = src;
        src = src.split("AnazhRealm._diaetGeteiltSchreiben(rend, ro);").join("");
        if (src === vor) return null;
    }
    const AnazhRealm = {};
    new Function("AnazhRealm", src)(AnazhRealm);
    const echt = AnazhRealm._diaetRefresh;
    if (manipuliert === "abkuerzung")
        return (obs, ro, frame, altNR) => (obs.renderObjects.has(ro) ? false : echt(obs, ro, frame, altNR));
    return echt;
}
function diaetLauf(fn) {
    const N_PROG = 20,
        N_OBJ = 50;
    let geschrieben = null,
        objektDurchDiaet = 0;
    const beobachter = () => ({
        renderObjects: new Map(),
        renderId: -1,
        hasNode: false,
        hasAnimation: false,
        getRenderObjectData(ro) {
            let d = this.renderObjects.get(ro);
            if (!d) {
                d = { welt: ro.object.welt };
                this.renderObjects.set(ro, d);
            }
            return d;
        },
        needsVelocity() {
            return false;
        },
        getLights() {
            return [];
        },
        equals(ro) {
            const d = this.getRenderObjectData(ro);
            if (d.welt !== ro.object.welt) {
                d.welt = ro.object.welt;
                return false;
            }
            return true;
        },
    });
    // Die r184-Vendor-Bahn eines Beobachters: Kopf (hasNode/Animation/Erst-Init) → renderId-Wand → equals().
    const altNR = function (ro, frame) {
        if (this.hasNode || this.hasAnimation || !this.renderObjects.has(ro)) {
            this.getRenderObjectData(ro);
            return true;
        }
        if (this.renderId !== frame.renderId) {
            this.renderId = frame.renderId;
            return true;
        }
        return this.equals(ro, [], frame.renderId) !== true;
    };
    // Der Schein-Renderer: was die Diät selbst schreibt (Knoten der Gruppe + Upload), zählt je Programm.
    const rend = {
        _nodes: {
            updateBefore() {},
            getNodeFrameForRender: () => ({ updateNode() {} }),
        },
        _bindings: {
            _update(g) {
                if (g.bindings[0].groupNode.shared === true) geschrieben.set(g.prog, (geschrieben.get(g.prog) || 0) + 1);
                else objektDurchDiaet++;
            },
        },
    };
    const programme = [];
    for (let p = 0; p < N_PROG; p++)
        programme.push({
            id: p,
            obs: beobachter(),
            geteilt: { prog: p, bindings: [{ groupNode: { shared: true } }] },
            nbs: {
                updateNodes: [{ getUpdateType: () => "render" }, { getUpdateType: () => "object" }],
                updateBeforeNodes: [],
                updateAfterNodes: [],
            },
        });
    const objekte = [];
    for (let i = 0; i < N_OBJ; i++) {
        const prog = programme[i % N_PROG];
        const obj = {
            isInstancedMesh: true,
            instanceMatrix: { version: 0 },
            instanceColor: null,
            material: { _anazhDiaet: true },
            welt: 0,
        };
        const objektGruppe = { bindings: [{ groupNode: { shared: false } }] };
        objekte.push({
            prog,
            ro: {
                object: obj,
                material: obj.material,
                lightsNode: {},
                getBindings: () => [prog.geteilt, objektGruppe],
                getNodeBuilderState: () => prog.nbs,
            },
        });
    }
    let rid = 0;
    const render = (vorher) => {
        rid++;
        const frame = { renderer: rend, renderId: rid };
        if (vorher) vorher();
        geschrieben = new Map();
        objektDurchDiaet = 0;
        const voll = new Set();
        for (let i = 0; i < objekte.length; i++) {
            const x = objekte[i];
            // Ein Voll-Refresh schreibt alle Gruppen des Objekts (die Vendor-Bahn), die geteilte eingeschlossen.
            if (fn(x.prog.obs, x.ro, frame, altNR)) {
                voll.add(i);
                geschrieben.set(x.prog.id, (geschrieben.get(x.prog.id) || 0) + 1);
            }
        }
        let fehlt = 0;
        for (const p of programme) if (!geschrieben.get(p.id)) fehlt++;
        return { voll, fehlt, objektDurchDiaet };
    };
    const r1 = render();
    const r2 = render();
    const r3 = render();
    const r4 = render(() => objekte[7].ro.object.welt++);
    const r5 = render(() => objekte[11].ro.object.instanceMatrix.version++);
    const r6 = render();
    return { r1, r2, r3, r4, r5, r6 };
}
function diaetProbe(selftest) {
    const fehler = [];
    const fn = diaetLaden(null);
    if (!fn) return { fehler: ["AnazhRealm._diaetRefresh nicht im Stamm gefunden"], selbstFeuert: false };
    const pruefe = (z) => {
        const f = [];
        if (z.r1.voll.size !== 50) f.push(`Erst-Render: alle 50 Objekte initialisieren (ist ${z.r1.voll.size})`);
        for (const [k, r] of Object.entries(z)) {
            if (r.fehlt)
                f.push(
                    `Kamera-Treue ${k}: ${r.fehlt} von 20 Programmen ohne geschriebene geteilte Gruppe — sie zeigen die Kamera ihres letzten Refreshs`
                );
            if (r.objektDurchDiaet) f.push(`${k}: die Diät schrieb ${r.objektDurchDiaet} Objekt-Gruppen (nur die geteilte ist ihre)`);
        }
        if (!z.r4.voll.has(7)) f.push("Objekt-Wahrheit: ein bewegtes Objekt refresht voll (equals)");
        if (!z.r5.voll.has(11)) f.push("Instanz-Wächter: eine Instanz-Mutation refresht voll");
        return f;
    };
    const z = diaetLauf(fn);
    fehler.push(...pruefe(z));
    const stand = [z.r2.voll.size, z.r3.voll.size, z.r6.voll.size];
    // Die Kamera-Treue kostet im Stand keinen Voll-Refresh: je Programm schreibt die Diät nur die geteilte Gruppe.
    if (stand.some((n) => n !== 0))
        fehler.push(`Stand: ${stand.join("/")} Voll-Refreshs je Render (Soll 0 — die renderId-Wand refresht jedes Programm voll)`);
    let selbstFeuert = false;
    if (selftest) {
        const abk = pruefe(diaetLauf(diaetLaden("abkuerzung")));
        // Die Diät MUSS ihr Schreiben tragen: fehlt der Ruf `_diaetGeteiltSchreiben(rend, ro)`, ist die Manipulation
        // nicht anwendbar und der Selbsttest rot (nie still übersprungen).
        const schreibFn = diaetLaden("schreiben");
        if (!schreibFn) fehler.push("Selbsttest: die Diät trägt keinen Ruf `AnazhRealm._diaetGeteiltSchreiben(rend, ro);`");
        const ohneSchreiben = schreibFn ? pruefe(diaetLauf(schreibFn)) : [];
        selbstFeuert =
            abk.some((e) => e.startsWith("Kamera-Treue")) && ohneSchreiben.some((e) => e.startsWith("Kamera-Treue"));
    }
    return { fehler, selbstFeuert, stand };
}

// DIE SCHATTEN-STOFF-PROBE: den Block aus _configureRenderer schneiden und an einem Schein-Renderer fahren, dessen
// renderObject wie r184 je Objekt alphaTest des Originals auf den geteilten Stoff setzt und je Bürger den Schlüssel
// prüft, sobald die Stoff-Version wechselt. Der Setter ist der Vendor-Text (Anker oben). 40 Objekte, Blätter und
// Stämme im Wechsel: im Stand prüft kein Bürger, ein eigener alphaTest-Wechsel prüft genau EINEN.
function schattenStoffProbe(ohne) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const kopf = 'if (typeof renderer.renderObject !== "function")';
    const a = stamm.indexOf(kopf);
    const e = a < 0 ? -1 : stamm.indexOf("renderer.__anazhSchattenStoff = true;", a);
    const zu = e < 0 ? -1 : stamm.indexOf("}", e);
    if (zu < 0) return { fehler: ["der Schatten-Stoff-Block fehlt in _configureRenderer"] };
    const laut = [];
    const block = new Function("renderer", stamm.slice(a, zu + 1));
    const einbau = (r) => block.call({ log: (m) => laut.push(m) }, r);
    const core = fs.readFileSync(path.join(root, "vendor/three.core.min.js"), "latin1");
    const setter = "set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}";
    if (!core.includes(setter)) return { fehler: ["der Vendor-Setter alphaTest fehlt (Anker)"] };
    const Stoff = new Function(
        `return class { constructor() { this.version = 0; this._alphaTest = 0; this.allowOverride = true; } get alphaTest() { return this._alphaTest; } ${setter} }`
    )();
    const sm = new Stoff();
    sm.isShadowPassMaterial = true;
    const szene = { overrideMaterial: sm };
    const gesehen = new Map();
    let pruefungen = 0;
    const renderer = {
        renderObject(object, scene, camera, geometry, material) {
            const s = scene.overrideMaterial;
            s.alphaTest = material.alphaTest;
            const v = gesehen.get(object);
            if (v !== s.version) {
                if (v !== undefined) pruefungen++;
                gesehen.set(object, s.version);
            }
        },
    };
    if (!ohne) einbau(renderer);
    if (laut.length) return { fehler: ["Schatten-Stoff meldet sich laut am Schein-Renderer: " + laut[0]] };
    const objekte = [];
    for (let i = 0; i < 40; i++) {
        const m = new Stoff();
        m.alphaTest = i % 2 ? 0.5 : 0;
        objekte.push({ o: { i }, m });
    }
    const frame = () => {
        pruefungen = 0;
        for (const x of objekte) renderer.renderObject(x.o, szene, null, null, x.m);
        return pruefungen;
    };
    frame();
    frame();
    const stand = frame();
    objekte[4].m.alphaTest = 0.5;
    const eigener = frame();
    const fehler = [];
    if (stand !== 0)
        fehler.push(`Schatten-Stoff: ${stand} von 40 Bürgern prüfen im Stand je Frame ihren Schlüssel (die geteilte Version springt je Objekt)`);
    if (eigener !== 1) fehler.push(`Schatten-Stoff: ein eigener alphaTest-Wechsel prüft ${eigener} Bürger (Soll genau 1)`);
    return { fehler, stand, eigener };
}

// DIE BUNDLE-WAHRHEITS-PROBE: den Block aus _configureRenderer (Chokepoint _renderScene) schneiden und an einem
// Schein-Renderer mit der r184-Semantik fahren — die Aufnahme setzt den Zeiger und nullt ihn danach OHNE Stapel; der
// erste Bürger wird verfolgt, BEVOR sein updateBefore den Schatten-Render startet; der Schatten-Render trägt
// overrideMaterial an der Szene; _projectObject sammelt Bundles nur, solange backend.beginBundle steht.
// Soll: die Haupt-Aufnahme verfolgt 10 von 10, kein Bundle unter dem Override-Stoff, nach dem Render steht der Zeiger
// der äußeren Aufnahme wieder und beginBundle ist wieder die Methode des Backends. `ohne` = ohne Block (Selbsttest).
function bundleWahrheitProbe(ohne) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const kopf = 'if (typeof renderer._renderScene !== "function" || !renderer.backend)';
    const a = stamm.indexOf(kopf);
    const e = a < 0 ? -1 : stamm.indexOf("renderer.__anazhBundleWahrheit = true;", a);
    const zu = e < 0 ? -1 : stamm.indexOf("}", e);
    if (zu < 0) return { fehler: ["der Bundle-Wahrheits-Block fehlt in _configureRenderer"] };
    const laut = [];
    const block = new Function("renderer", stamm.slice(a, zu + 1));
    class Backend {
        beginBundle() {}
    }
    const be = new Backend();
    const z = { verfolgtHaupt: 0, gezeichnetHaupt: 0, unterOverride: 0, schattenAufnahmen: 0 };
    const renderer = {
        backend: be,
        _currentRenderBundle: null,
        _renderScene(scene) {
            const bundles = this.backend.beginBundle !== undefined ? scene.bundles : [];
            if (scene.overrideMaterial) z.unterOverride += bundles.length;
            for (const b of bundles) {
                this._currentRenderBundle = b;
                for (let i = 0; i < b.n; i++) {
                    if (scene.haupt) {
                        z.gezeichnetHaupt++;
                        if (this._currentRenderBundle !== null) z.verfolgtHaupt++;
                    } else z.schattenAufnahmen++;
                    if (i === 0 && scene.schatten) this._renderScene(scene.schatten);
                }
                this._currentRenderBundle = null;
            }
            return scene;
        },
    };
    if (!ohne) block.call({ log: (m) => laut.push(m) }, renderer);
    const schatten = { overrideMaterial: { isShadowPassMaterial: true }, bundles: [{ n: 4 }], schatten: null };
    const haupt = { haupt: true, overrideMaterial: null, bundles: [{ n: 10 }], schatten };
    const aussen = { aeussere: true };
    renderer._currentRenderBundle = aussen;
    renderer._renderScene(haupt);
    const fehler = [];
    if (laut.length) fehler.push("Bundle-Wahrheit meldet sich laut am Schein-Renderer: " + laut[0]);
    if (z.verfolgtHaupt !== z.gezeichnetHaupt)
        fehler.push(
            `Aufnahme-Stapel: die Haupt-Aufnahme verfolgt ${z.verfolgtHaupt} von ${z.gezeichnetHaupt} Draws (der Schatten-Render nullte den Zeiger) — der Replay refresht die übrigen nie`
        );
    if (z.unterOverride !== 0)
        fehler.push(`Override-Stoff: ${z.unterOverride} Bundle(s) unter einem overrideMaterial gesammelt — der Replay refresht sie gegen den geteilten Stoff`);
    if (renderer._currentRenderBundle !== aussen) fehler.push("Aufnahme-Stapel: der Zeiger der äußeren Aufnahme kam nicht zurück");
    if (Object.prototype.hasOwnProperty.call(be, "beginBundle") || typeof be.beginBundle !== "function")
        fehler.push("Override-Stoff: backend.beginBundle ist nach dem Render nicht wieder die Methode des Backends");
    return { fehler, z };
}

function main() {
    const selftest = process.argv.includes("--selftest");
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
    let lock = fs.existsSync(lockPfad) ? JSON.parse(fs.readFileSync(lockPfad, "utf8")) : null;
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
        if (a.weich) continue; // dokumentarisch, kein harter Substring (minifier-variabel)
        geprueft++;
        const src = les(a.file).toString("latin1");
        const sub = selftest && a.organ && a.organ.startsWith("_materialObserverDiaet (hasNode") ? a.sub + "_MANIPULIERT" : a.sub;
        if (!src.includes(sub)) errs.push(`ANKER GEFALLEN: "${a.sub}" fehlt in ${a.file} → Organ: ${a.organ}`);
    }
    // (3) DIE DIÄT-PRÜFUNG am Schein-Programm (r184-Semantik: Beobachter + geteilte Gruppe je Programm, renderId-
    // Wand, equals()): AnazhRealm._diaetRefresh aus dem Stamm-Quelltext, deterministisch, GPU-frei.
    const diaet = diaetProbe(selftest);
    for (const e of diaet.fehler) errs.push("DIÄT: " + e);
    // (4) DIE SCHATTEN-STOFF-PROBE (der Block aus _configureRenderer am Schein-Renderer, Setter aus dem Vendor).
    const stoff = schattenStoffProbe(false);
    for (const e of stoff.fehler) errs.push("SCHATTEN: " + e);
    // (5) DIE BUNDLE-WAHRHEITS-PROBE (der Chokepoint-Block aus _configureRenderer am Schein-Renderer).
    const wahr = bundleWahrheitProbe(false);
    for (const e of wahr.fehler) errs.push("BUNDLE: " + e);
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        const diaetFeuert = diaet.selbstFeuert;
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        console.log(
            diaetFeuert
                ? "✅ SELBST-TEST: die Diät-Probe feuert (eine Abkürzung ohne Schreiben lässt Programme an der alten Kamera kleben)"
                : "❌ SELBST-TEST: die Diät-Probe ist vakuös"
        );
        const stoffFeuert = schattenStoffProbe(true).fehler.length > 0;
        console.log(
            stoffFeuert
                ? "✅ SELBST-TEST: die Schatten-Stoff-Probe feuert (ohne den Block prüft jeder Bürger je Frame seinen Schlüssel)"
                : "❌ SELBST-TEST: die Schatten-Stoff-Probe ist vakuös"
        );
        const ohneWahr = bundleWahrheitProbe(true).fehler;
        const wahrFeuert =
            ohneWahr.some((e) => e.startsWith("Aufnahme-Stapel")) && ohneWahr.some((e) => e.startsWith("Override-Stoff"));
        console.log(
            wahrFeuert
                ? "✅ SELBST-TEST: die Bundle-Wahrheits-Probe feuert (ohne den Block: Zeiger genullt, Bundle unter dem Override-Stoff)"
                : "❌ SELBST-TEST: die Bundle-Wahrheits-Probe ist vakuös"
        );
        if (errs.length > 1 || !errs.some((e) => e.includes("hasNode"))) for (const e of errs) console.error("   ❌ " + e);
        process.exit(feuert && diaetFeuert && stoffFeuert && wahrFeuert && errs.length === 1 ? 0 : 1);
    }
    if (errs.length) {
        console.error("⛔ DIE VENDOR-ANKER-WAND:");
        for (const e of errs) console.error("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Programm (Kamera-Treue: jede geteilte Gruppe je Programm und Render geschrieben; Voll-Refreshs im Stand ${diaet.stand.join("/")} von 50), der Schatten-Stoff prüft im Stand ${stoff.stand} von 40 Bürgern, ein eigener Wechsel ${stoff.eigener}; die Haupt-Aufnahme verfolgt ${wahr.z.verfolgtHaupt} von ${wahr.z.gezeichnetHaupt} Draws trotz Schatten-Render, ${wahr.z.unterOverride} Bundles unter dem Override-Stoff.`
    );
}
main();
