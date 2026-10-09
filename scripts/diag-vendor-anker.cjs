#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker (GOLD 3, 19.07.)
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
    // DER EINE KNOTEN JE QUELLE (_configureRenderer, Welle K): r184 teilt eine geteilte Gruppe über Programme nur bei
    // GLEICHEN Knoten-Ids (je Render-Kontext EIN Puffer); ReferenceNode legt seinen Uniform-Knoten in setNodeType an (der
    // Eingriff gibt jedem Verweis auf dasselbe Objekt und dieselbe Eigenschaft einer geteilten Gruppe DENSELBEN), die CSM
    // baut ihre Render-Knoten in setup (einmal je Instanz).
    { file: "vendor/three.webgpu.min.js", sub: 'setNodeType(e){let t=null;t=null!==this.count?Zl(null,e,this.count):Array.isArray(this.getValueFromReference())?td(null,e):"texture"===e?Kl(null):"cubeTexture"===e?$c(null):Sa(null,e),null!==this.group&&t.setGroup(this.group),null!==this.name&&t.setName(this.name),this.node=t}', organ: "EIN KNOTEN JE QUELLE (ReferenceNode.setNodeType legt den Uniform-Knoten an)" },
    { file: "vendor/three.webgpu.min.js", sub: "e.uniforms.sort((e,t)=>e.nodeUniform.node.id-t.nodeUniform.node.id);for(const t of e.uniforms)r+=t.nodeUniform.node.id}else r+=e.nodeUniform.id;const i=this.renderer._currentRenderContext||this.renderer;let n=qN.get(i);", organ: "EIN KNOTEN JE QUELLE (_getBindGroup teilt die Gruppe nach Knoten-Ids je Render-Kontext)" },
    { file: "vendor/CSMShadowNode.js", sub: "setup( builder ) {\n\n\t\tif ( this.camera === null ) this._init( builder );\n\n\t\treturn this.fade === true ? this._setupFade() : this._setupStandard();", organ: "EIN KNOTEN JE QUELLE (CSMShadowNode.setup baut die Render-Knoten je Aufruf — einmal je Instanz)" },
    { file: "vendor/CSMShadowNode.js", sub: "this.setupShadowPosition( builder );", organ: "EIN KNOTEN JE QUELLE (die Schatten-Lage baut der Fn-Rumpf je Programm, nie setup)" },
    // EIN SCHREIBEN JE PUFFER: das Backend lädt eine Uniform-Gruppe Bereich für Bereich (je Bereich ein writeBuffer).
    { file: "vendor/three.webgpu.min.js", sub: "updateBinding(e){const t=this.backend,r=t.device,s=e.buffer,i=t.get(e).buffer,n=e.updateRanges;if(0===n.length)r.queue.writeBuffer(i,0,s,0);else{", organ: "EIN SCHREIBEN JE PUFFER (backend.updateBinding: ein writeBuffer je Bereich)" },
    { file: "vendor/three.webgpu.min.js", sub: "t.isBuffer&&t.updateRanges.length>0&&t.clearUpdateRanges()", organ: "EIN SCHREIBEN JE PUFFER (r184 leert die Bereiche nach dem Upload)" },
    // EIN GANG JE GRUPPE UND RENDER (_diaetGang): Bindegruppen und Knoten tragen Ids, Vorher-Knoten ihren Takt.
    { file: "vendor/three.webgpu.min.js", sub: 'class bN{constructor(e="",t=[]){this.name=e,this.bindings=t,this.id=yN++}}', organ: "AnazhRealm._diaetGang (die Bindegruppe trägt eine Id)" },
    { file: "vendor/three.webgpu.min.js", sub: "getUpdateBeforeType(){return this.updateBeforeType}", organ: "AnazhRealm._diaetGang (Vorher-Takt: object geht je Programm)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateBeforeNode(e){const t=e.getUpdateBeforeType(),r=e.updateReference(this);if(t===ri.FRAME){", organ: "AnazhRealm._diaetGeteiltSchreiben (NodeFrame.updateBeforeNode je Vorher-Knoten, wie Nodes.updateBefore)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateReference(e){return this.reference=null!==this.object?this.object:e.object,this.reference}", organ: "AnazhRealm._diaetGang (ein Verweis ohne festes Objekt liest frame.object — sein Programm geht seinen eigenen Gang)" },
    // DER RENDER-ABSCHNITT (Gegenprüfung 07.10.): der Stempel des Gangs ist (Render-Id, info.calls) — jeder betretene
    // Render zählt info.calls hoch und nimmt ihn als Render-Id, das Verlassen gibt die äußere Id zurück (Anker der
    // Bundle-Wahrheit), info.reset lässt info.calls stehen. So wechselt das Paar beim Betreten UND Verlassen.
    { file: "vendor/three.webgpu.min.js", sub: "this.info.calls++,this.info.render.calls++,this.info.render.frameCalls++,i.renderId=this.info.calls", organ: "AnazhRealm._diaetGeteiltSchreiben (Render-Abschnitt: jeder betretene Render zählt info.calls, die Render-Id folgt)" },
    { file: "vendor/three.webgpu.min.js", sub: "reset(){this.render.drawCalls=0,this.render.frameCalls=0,this.compute.frameCalls=0,this.render.triangles=0,this.render.points=0,this.render.lines=0}", organ: "AnazhRealm._diaetGeteiltSchreiben (Render-Abschnitt: info.reset lässt info.calls stehen)" },
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
    // DIE ERST-ZEICHNUNG (Welle K, `_configureRenderer`): der Stamm bildet `_renderObjectDirect` nach (ändert r184 den Körper,
    // zieht die Nachbildung nach), baut den Stoff im Pass je Render-Aufruf (`info.calls`) höchstens einmal und lässt die
    // Pipeline asynchron entstehen (`getForRender(ro, promises)`); der Record droppt unfertige Draws und versiegelt danach.
    { file: "vendor/three.webgpu.min.js", sub: "isReady(u)&&", organ: null, weich: true },
    { file: "vendor/three.webgpu.min.js", sub: "u.version=s.version", organ: "_erstWartet (2): die Marke des Knoten-Baus fällt nach der Versiegelung" },
    {
        file: "vendor/three.webgpu.min.js",
        sub: "_renderObjectDirect(e,t,r,s,i,n,a,o){const u=this._objects.get(e,t,r,s,i,this._currentRenderContext,a,o);if(u.drawRange=e.geometry.drawRange,u.group=n,null!==this._currentRenderBundle){this.backend.get(this._currentRenderBundle).renderObjects.push(u),u.bundle=this._currentRenderBundle.bundleGroup}const l=this._nodes.needsRefresh(u);l&&(this._nodes.updateBefore(u),this._geometries.updateForRender(u),this._nodes.updateForRender(u),this._bindings.updateForRender(u)),this._pipelines.updateForRender(u),this._pipelines.isReady(u)&&(this.backend.draw(u,this.info),l&&this._nodes.updateAfter(u))}",
        organ: "Erst-Zeichnung (die Nachbildung von _renderObjectDirect)",
    },
    { file: "vendor/three.webgpu.min.js", sub: "this._handleObjectFunction=this._renderObjectDirect,this.info.calls++,this.info.render.calls++", organ: "Erst-Zeichnung (jeder Render liest die Methode am Exemplar; info.calls zählt je Render-Aufruf)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateForRender(e){this.getForRender(e)}", organ: "Erst-Zeichnung (der Vendor-Draw baut die Pipeline ohne Versprechen = synchron)" },
    { file: "vendor/three.webgpu.min.js", sub: "getForRender(e,t=null){const{backend:r}=this,s=this.get(e);if(this._needsRenderUpdate(e))", organ: "Erst-Zeichnung (die Pipeline mit Versprechen-Liste)" },
    { file: "vendor/three.webgpu.min.js", sub: "null===t)h.pipeline=d.createRenderPipeline(A)", organ: "Erst-Zeichnung (ohne Liste synchron)" },
    { file: "vendor/three.webgpu.min.js", sub: "h.pipeline=await d.createRenderPipelineAsync(A)", organ: "_erstWartet (1): die Zuweisung der fertigen Pipeline ist die Bereitschaft (der Setter am Zustand)" },
    { file: "vendor/three.webgpu.min.js", sub: "h.pipeline=await d.createRenderPipelineAsync(A)}catch(e){}const t=await d.popErrorScope()", organ: "_erstWartet (1): das Vendor-Versprechen wartet danach auf den Fehler-Scope — an ihm hängt nichts; _erstAbsageWache: r184 verschluckt die Absage (catch(e){})" },
    { file: "vendor/three.webgpu.min.js", sub: "label:`renderPipeline_${s.name||s.type}_${s.id}`", organ: "_erstAbsageWache (das Label der Absage nennt den Stoff)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._setupBindings(u,n),this.set(t,{programGPU:n,pipeline:n})", organ: "_erstWartet (WebGL2-Weiche: _completeCompile ersetzt das Datenobjekt, ein Setter feuerte nie)" },
    { file: "vendor/three.webgpu.min.js", sub: "isReady(e){const t=this.get(e).pipeline;if(void 0===t)return!1;const r=this.backend.get(t);return void 0!==r.pipeline&&null!==r.pipeline}", organ: "Erst-Zeichnung (gezeichnet wird ab der fertigen Pipeline)" },
    { file: "vendor/three.webgpu.min.js", sub: "getForRenderCacheKey(e){return e.initialCacheKey}", organ: "Erst-Zeichnung (ein Bau-Cache-Treffer ist kein Bau)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._nodeBuilderState=null", organ: "Erst-Zeichnung (der gebaute Stoff am RenderObject)" },
    { file: "vendor/three.webgpu.min.js", sub: "getNodeBuilderState(){return this._nodeBuilderState||(this._nodeBuilderState=this._nodes.getForRender(this))}", organ: "Erst-Zeichnung (needsRefresh baut den Stoff synchron)" },
    // Warum kein Vorwärmen: r184-compileAsync liest die Attribute (→ synchroner Knoten-Bau) VOR seinem asynchronen Bau
    { file: "vendor/three.webgpu.min.js", sub: "this._geometries.updateForRender(t),await this._nodes.getForRenderAsync(t)", organ: "Erst-Zeichnung (das Vendor-Kompilat baut synchron — kein Vorwärmen daneben)" },
    // Bundle-Pass-Physik (Wasser bleibt draußen, solange der Copy den Pass bricht)
    { file: "vendor/three.webgpu.min.js", sub: "currentPass.end()", organ: "Wasser-Bundle-Wand (copyFramebufferToTexture-Pass-Bruch)" },
    // Bundle-Replay-Buchung: die Draw-Wahrheit im Info (der Replay zieht aufgenommene RenderObjects)
    { file: "vendor/three.webgpu.min.js", sub: "_renderBundle(e,t,r){const{bundleGroup:s,camera:i,renderList:n}=e,a=this._currentRenderContext,o=this._bundles.get(s,i,a)", organ: "Bundle-Replay-Buchung (renderer._renderBundle → info.update)" },
    { file: "vendor/three.webgpu.min.js", sub: "getDrawParameters(){", organ: "Bundle-Replay-Buchung (Draw-Parameter)" },
    // Der Fenster-Wechsel: die Viewport-Tiefe ist ein Klon je Render-Ziel (der EINE Leser bindet nach setSize neu)
    { file: "vendor/three.webgpu.min.js", sub: "getTextureForReference(e=null){", organ: "_tiefenLeserNeuBinden (Viewport-Tiefen-Klon je Ziel)" },
    // Der Name der Viewport-Tiefe: EIN geteiltes Original je Seite, jeder Klon je Ziel erbt seinen Namen
    { file: "vendor/three.webgpu.min.js", sub: '"ViewportDepthTextureNode"}constructor(e=ud,t=null,r=null){null===r&&(null===Kp&&(Kp=new Z),r=Kp)', organ: "_szeneTiefe (WebGL2-Rückfall und Null-Renderer: r184s Viewport-Tiefe, szene:tiefenkopie)" },
    // DAS TIEFEN-ABBILD (0710-1 P2, Runde 2): r184s Bruch-Weg (Pass beenden, auf demselben Encoder kopieren, mit load neu
    // beginnen) trägt den Abbild-Pass — seine Quelle ist die Tiefe des Kontexts, seine Kopie die EINE Encoder-Stelle, die
    // `_tiefenAbbild` für die Attrappe durch den Abbild-Pass ersetzt; der Knoten zieht je Render einmal; r32float bindet
    // r184 als (unfilterable-)float.
    { file: "vendor/three.webgpu.min.js", sub: "i=t.renderTarget?e.isDepthTexture?this.get(t.depthTexture).texture", organ: "_tiefenAbbild (Quelle des Bruchs = die Tiefe des Kontexts)" },
    { file: "vendor/three.webgpu.min.js", sub: 's.currentPass?(s.currentPass.end(),a=s.encoder):a=this.device.createCommandEncoder({label:"copyFramebufferToTexture_"+e.id}),a.copyTextureToTexture({texture:i,origin:[r.x,r.y,0]},{texture:n},[r.z,r.w])', organ: "_tiefenAbbild (Pass-Ende und die EINE Encoder-Kopie)" },
    { file: "vendor/three.webgpu.min.js", sub: "s.currentPass=a.beginRenderPass(e),s.currentSets={attributes:{},bindingGroups:[],pipeline:null,index:null}", organ: "_tiefenAbbild (der Neubeginn mit load)" },
    { file: "vendor/three.webgpu.min.js", sub: "else if(t===ri.RENDER){const t=this._getMaps(this.updateBeforeMap,r);if(t.renderId!==this.renderId)", organ: "_szeneTiefe (der Abbild-Knoten zieht je Render einmal)" },
    { file: "vendor/three.webgpu.min.js", sub: 'e===K&&(this.backend.hasFeature("float32-filterable")?t.sampleType=Gw:t.sampleType=zw)', organ: "_szeneTiefe (das r32float-Abbild als float-Textur gebunden)" },
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
    { file: "vendor/TRAANode.js", sub: "this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, depthTexture: new DepthTexture() } );", organ: "_traaVortiefe (die Vortiefe der Geschichte — ihr Typ wird 16 bit, bevor die GPU sie anlegt)" },
    { file: "vendor/TRAANode.js", sub: "renderer.copyTextureToTexture( currentDepth, this._historyRenderTarget.depthTexture );", organ: "_traaVortiefe (der EINE Kopier-Ruf des Knotens — am Renderer gehakt, gezeichnet in 16 bit; Name TRAANode.history:tiefe)" },
    { file: "vendor/TRAANode.js", sub: "let depth = this._previousDepthNode.sample( uv ).r;", organ: "TRAA-Tiefen-Kopie (der Leser: die Vortiefe der Disokklusion — die Kopie bleibt)" },
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
    // DIE KARTE OHNE FARBE (0710-1 P2, Ziel-Zensus: kaskade0/1:farbe OHNE LESER): die Ziel-Daten tragen eine leere Farb-
    // Liste, die Farb-Textur legt die GPU nie an — der Ziel-Bau misst textures[0] und reicht die Liste an den Kontext,
    // updateTexture ist der EINE Anlage-Weg, der Pass-Deskriptor und der Pipeline-Bau laufen über die Liste, Format und
    // Farbraum lasen blind textures[0].
    { file: "vendor/three.webgpu.min.js", sub: "updateRenderTarget(e,t=0){const r=this.get(e),s=0===e.samples?1:e.samples,i=r.depthTextureMips||(r.depthTextureMips={}),n=e.textures,a=this.getSize(n[0])", organ: "_kaskadenZiele (der Ziel-Bau misst textures[0] — das Textur-Objekt bleibt)" },
    { file: "vendor/three.webgpu.min.js", sub: "r.width=a.width,r.height=a.height,r.textures=n,r.depthTexture=l||null", organ: "_kaskadenZiele (die Ziel-Daten tragen die Farb-Liste — die Hülle leert sie)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateTexture(e,t={}){const r=this.get(e);if(!0===r.initialized&&r.version===e.version)return;", organ: "_kaskadenZiele (der EINE Anlage-Weg einer Textur — die Karten-Farbe überspringt ihn)" },
    { file: "vendor/three.webgpu.min.js", sub: "getCurrentColorFormat(e){let t;return t=null!==e.textures?this.getTextureFormatGPU(e.textures[0]):this.getPreferredCanvasFormat(),t}", organ: "_kaskadenZiele (Format auf leerer Liste: null)" },
    { file: "vendor/three.webgpu.min.js", sub: "getCurrentColorSpace(e){return null!==e.textures?e.textures[0].colorSpace:this.backend.renderer.outputColorSpace}", organ: "_kaskadenZiele (Farbraum auf leerer Liste: null)" },
    { file: "vendor/three.webgpu.min.js", sub: "if(null!==e.context.textures){const t=e.context.textures,r=e.context.mrt;for(let e=0;e<t.length;e++)", organ: "_kaskadenZiele (der Pipeline-Bau: je Farbe ein Ziel — leere Liste, reine Tiefen-Pipeline)" },
    { file: "vendor/three.webgpu.min.js", sub: "const t=e.textures,o=[];let u;const l=this._isRenderCameraDepthArray(e);for(let s=0;s<t.length;s++)", organ: "_kaskadenZiele (der Pass-Deskriptor: je Farbe ein Anhang — leere Liste, nur die Tiefe)" },
    { file: "vendor/three.webgpu.min.js", sub: "g.clippingContext.updateGlobal(l,t),l.onBeforeRender(this,e,t,p);const v=t.isArrayCamera", organ: "_passSicht (der Vorher-Haken je Render, vor der Projektion — auch im Schatten-Render)" },
    { file: "vendor/three.webgpu.min.js", sub: "l.onAfterRender(this,e,t,p),this.inspector.finishRender", organ: "_passSicht (der Nachher-Haken je Render)" },
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
    // gibt seinen Befehl am Pass-Ende ab (ein Umlegen mitten im Frame zieht nur Abschnitte von Schatten-Pässen um, die
    // schon abgegeben sind; den Lauf des offenen Haupt-Passes lässt es liegen).
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
        organ: "_chunkSatzUmlegen (jeder Schatten-Pass ist am Ende abgegeben — ein Umzug mitten im Frame trifft ihn nie)",
    },
    // DIE INSTANZ-WAHL JE PASS (Welle 7): eine Pflanzen-Stufe ordnet im Szenen-Haken ihre Slots und setzt `count` — der Draw
    // liest die Instanz-Zahl beim ZEICHNEN (nicht einmal je Objekt), und jeder Pass ist am Ende abgegeben: die Kaskade k0
    // schreibt die Puffer eines Zwillings, gibt ab, dann schreibt k1 — der Inhalt jedes Passes erreicht die GPU vor dem nächsten.
    {
        file: "vendor/three.webgpu.min.js",
        sub: "r.instanceCount:void 0!==e.count&&(u=Math.max(0,e.count)),0===u)return null",
        organ: "_instanzWahlPass (der Draw liest count beim Zeichnen; count 0 zeichnet nicht)",
    },
    {
        file: "vendor/three.webgpu.min.js",
        sub: "if(this.device.queue.submit([t.encoder.finish()]),null!==e.textures)",
        organ: "_instanzWahlPass (jeder Kaskaden-Pass ist abgegeben, bevor der nächste die Zwillings-Puffer schreibt)",
    },
    // Das Wachsen des Satzes tauscht die Geometrie am selben Mesh: das Render-Objekt sieht den Tausch beim nächsten Zeichnen
    // und liest die Attribute der neuen Geometrie (der Geometrie-Hörer, der sonst die neuen Puffer zerstörte, fällt im
    // Register — `_renderObjektRegister`, Anker unten).
    {
        file: "vendor/three.webgpu.min.js",
        sub: "l.needsGeometryUpdate&&l.setGeometry(e.geometry)",
        organ: "_chunkSatzGeometrie (der Tausch am selben Mesh: das Render-Objekt folgt der Geometrie)",
    },
    {
        file: "vendor/three.webgpu.min.js",
        sub: "setGeometry(e){this.geometry=e,this.attributes=null,this.attributesId=null}",
        organ: "_chunkSatzGeometrie (nach dem Tausch liest das Render-Objekt die Attribute neu)",
    },
    // DIE RESIDENZ (W6): r184 hält jedes hochgeladene Attribut STARK in `info.memoryMap` und gibt es nur über
    // `_attributes.delete` frei — der GPU-Abschied (_gpuAbschied · _instanzAbschied) und der Kehraus (_gpuKehraus) lesen das
    // Register, die Zeichen-Spur je Attribut (`attributeCall`) und wissen, warum ein Speicher-Puffer nur mit seiner Senke fällt.
    { file: "vendor/three.webgpu.min.js", sub: "this._attributes=new By(r,this.info)", organ: "_gpuAbschied (renderer._attributes)" },
    { file: "vendor/three.webgpu.min.js", sub: "delete(e){const t=super.delete(e);return null!==t&&(this.backend.destroyAttribute(e),this.info.destroyAttribute(e)),t}", organ: "_gpuAbschied (Attributes.delete: GPU-Puffer + Register)" },
    { file: "vendor/three.webgpu.min.js", sub: "destroyAttribute(e){const t=this.backend;t.get(this._getBufferAttribute(e)).buffer.destroy(),t.delete(e)}", organ: "_gpuAbschied (verschränkte Attribute fallen nie einzeln: der geteilte Puffer bliebe tot im Gedächtnis)" },
    { file: "vendor/three.webgpu.min.js", sub: "_createAttribute(e,t){const r=this._getAttributeMemorySize(e);this.memoryMap.set(e,{size:r,type:t})", organ: "_gpuKehraus (das Register: memoryMap hält jedes Attribut stark)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._geometries=new Dy(this._attributes,this.info)", organ: "_gpuKehraus (renderer._geometries)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.attributeCall=new WeakMap", organ: "_gpuKehraus (die Zeichen-Spur je Attribut)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateAttribute(e,t){const r=this.info.render.calls;", organ: "_gpuKehraus (attributeCall = render.calls des letzten Zeichnens)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.attributes.update(e,i),n.attribute!==e&&(n.attribute=e,s=!0)", organ: "_instanzAbschied (die Bindegruppe eines Speicher-Puffers folgt nur dem Attribut-Objekt — er fällt nur mit seiner Senke)" },
    // Das Render-Objekt-Register: r184 baut Render-Objekte über die Instanz-Methode createRenderObject und hängt jedes an das
    // dispose-Ereignis von Stoff und Geometrie (der geteilte Stoff hielt sie für immer).
    { file: "vendor/three.webgpu.min.js", sub: "this._objects=new Sy(this,this._nodes,this._geometries,this._pipelines,this._bindings,this.info)", organ: "_renderObjektRegister (renderer._objects)" },
    { file: "vendor/three.webgpu.min.js", sub: "l=this.createRenderObject(this.nodes,this.geometries,this.renderer,e,t,r,s,i,n,a,o)", organ: "_renderObjektRegister (jedes Render-Objekt entsteht über createRenderObject)" },
    { file: "vendor/three.webgpu.min.js", sub: 'this.onMaterialDispose=()=>{this.dispose()},this.onGeometryDispose=()=>{this.attributes=null,this.attributesId=null},this.material.addEventListener("dispose",this.onMaterialDispose),this.geometry.addEventListener("dispose",this.onGeometryDispose)', organ: "_instanzAbschied (Stoff und Geometrie halten das Render-Objekt über ihr dispose-Ereignis)" },
    { file: "vendor/three.webgpu.min.js", sub: "delete(e){if(e.isRenderObject){const t=this.get(e).nodeBuilderState;void 0!==t&&(t.usedTimes--,0===t.usedTimes&&this.nodeBuilderCache.delete(this.getForRenderCacheKey(e)))}return super.delete(e)}", organ: "_instanzAbschied (der Knoten-Zustand einer Senke verlässt den nodeBuilderCache — er hält die Senke)" },
    { file: "vendor/three.webgpu.min.js", sub: "deleteBindGroupData(e){const{backend:t}=this,r=t.get(e);r.layout&&(r.layout.usedTimes--,0===r.layout.usedTimes&&this._bindGroupLayoutCache.delete(r.layoutKey)", organ: "_instanzAbschied (die eigenen Bindegruppen verlassen die Layout-Zählung)" },
    { file: "vendor/three.webgpu.min.js", sub: "getNodeBuilderState(){return this._nodeBuilderState||(this._nodeBuilderState=this._nodes.getForRender(this))}", organ: "_instanzAbschied (Render-Objekt: Knoten-Zustand gecacht am Objekt)" },
    // Der Geometrie-Halter: initGeometry hängt EINEN dispose-Hörer je Geometrie, der das erste Render-Objekt einfängt und in
    // _geometryDisposeListeners lebt — _renderObjektRegister nimmt ihn heraus (der Kehraus trägt die Residenz).
    { file: "vendor/three.webgpu.min.js", sub: "initGeometry(e){const t=e.geometry;this.get(t).initialized=!0,this.info.memory.geometries++;const r=()=>{", organ: "_renderObjektRegister (der Geometrie-Hörer fängt das erste Render-Objekt ein)" },
    { file: "vendor/three.webgpu.min.js", sub: 't.addEventListener("dispose",r),this._geometryDisposeListeners.set(t,r)}', organ: "_renderObjektRegister (der Hörer lebt in _geometryDisposeListeners)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateForRender(e){!1===this.has(e)&&this.initGeometry(e),this.updateAttributes(e)}", organ: "_renderObjektRegister (initGeometry läuft über die Instanz, einmal je Geometrie)" },
    // Die Textur merkt jede Bindegruppe, die sie liest, und vergisst sie nie — _instanzAbschied nimmt die Gruppen der Senke heraus.
    { file: "vendor/three.webgpu.min.js", sub: "l=this.textures.get(u);o&&(this.textures.updateTexture(u),t.generation!==l.generation&&(t.generation=l.generation,s=!0),l.bindGroups.add(e))", organ: "_instanzAbschied (die Textur hält die Bindegruppen ihrer Leser)" },
    { file: "vendor/three.webgpu.min.js", sub: "this._textures=new tb(this,r,this.info)", organ: "_instanzAbschied (renderer._textures)" },
    // DER EINE TIEFEN-WEG DER LEINWAND (`_leinwandTiefe`, gestellt von der Weiche in `_loopRender`): der Leinwand-Pass trägt
    // eine Tiefe nur bei renderer.depth/stencil, updateSize verwirft seinen Deskriptor; das Rahmen-Ziel des Direktpfads
    // (Tonemapping zur Leinwand) nimmt seine Tiefe aus renderer.depth — ohne sie liest copyFramebufferToTexture die Tiefen-
    // Textur eines Ziels, das keine trägt (der Absturz des Direktpfads, gate:post-kette); die GPU-Textur der Leinwand-Tiefe
    // hängt am Leinwand-Ziel und fällt über destroyTexture.
    { file: "vendor/three.webgpu.min.js", sub: "!0!==e.depth&&!0!==e.stencil||(i.depthStencilAttachment={view:this.textureUtils.getDepthBuffer(e.depth,e.stencil).createView()})", organ: "_leinwandTiefe (die Post-Kette zeichnet in eine Leinwand ohne Tiefe)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateSize(){this.delete(this.renderer.getCanvasTarget())}", organ: "_leinwandTiefe (der Leinwand-Pass baut seinen Deskriptor neu)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.isWebGPUBackend=!0", organ: "_leinwandTiefe (Leinwand-Tiefe nur auf WebGPU)" },
    { file: "vendor/three.webgpu.min.js", sub: "{depth:a,stencil:o}=this,u=this._outputRenderTarget||this._canvasTarget;", organ: "_leinwandTiefe (das Rahmen-Ziel des Direktpfads liest renderer.depth)" },
    { file: "vendor/three.webgpu.min.js", sub: "l.depthBuffer=a,l.stencilBuffer=o,", organ: "_leinwandTiefe (das Rahmen-Ziel folgt renderer.depth je Frame)" },
    { file: "vendor/three.webgpu.min.js", sub: "i=t.renderTarget?e.isDepthTexture?this.get(t.depthTexture).texture:", organ: "_leinwandTiefe (die Tiefen-Kopie liest die Tiefen-Textur des Ziels — ohne sie der WeakMap-Absturz)" },
    { file: "vendor/three.webgpu.min.js", sub: "a=r.renderer.currentSamples,o=s.depthTexture;", organ: "_leinwandTiefe (die Leinwand-Tiefe ist die DepthTexture des Leinwand-Ziels)" },
    { file: "vendor/three.webgpu.min.js", sub: "getCanvasTarget(){return this._canvasTarget}", organ: "_leinwandTiefe (das Leinwand-Ziel)" },
    { file: "vendor/three.webgpu.min.js", sub: "destroyTexture(e,t=!1){this.textureUtils.destroyTexture(e,t)}", organ: "_leinwandTiefe (die GPU-Textur der Leinwand-Tiefe fällt in der Post-Kette)" },
    { file: "vendor/three.webgpu.min.js", sub: "destroyTexture(e,t=!1){const r=this.backend,s=r.get(e);void 0!==s.texture&&!1===t&&s.texture.destroy(),void 0!==s.msaaTexture&&s.msaaTexture.destroy(),r.delete(e)}", organ: "_leinwandTiefe (destroyTexture zerstört und vergisst — getDepthBuffer legt sie im Direktpfad neu an)" },
    // DAS GESETZ DES SCHATTEN-BIAS (`_schattenBias`, 0710-12): r184 schiebt die Probe des Empfängers um normalWorld × normalBias
    // in WELT-METERN und addiert `bias` auf die Tiefe der Schatten-Koordinate (0..1) — beides in Texeln der Kaskade.
    { file: "vendor/three.webgpu.min.js", sub: "qc(\"normalBias\",\"float\",i).setGroup(_a)", organ: "_schattenBias (normalBias ist eine Uniform des Lichts)" },
    { file: "vendor/three.webgpu.min.js", sub: "h=Rc.mul(d);", organ: "_schattenBias (normalBias × normalWorld)" },
    { file: "vendor/three.webgpu.min.js", sub: "p=c.mul(w_.add(h))", organ: "_schattenBias (die Probe sitzt bei positionWorld + normalWorld × normalBias — Welt-Meter)" },
    { file: "vendor/three.webgpu.min.js", sub: "s.reversedDepthBuffer?n.sub(i):n.add(i)", organ: "_schattenBias (bias addiert auf die Tiefe der Schatten-Koordinate)" },
    // DIE STUFE KOSTET NUR, WENN SIE ZEIGT (`nurBeiStaerke` in _ensurePostProcessing): ein Fn-Aufruf trägt seine Argumente
    // als `rawInputs` (der Ketten-Graph der Zerleg-Linse liest sie), ein Fn ohne Layout baut seinen Rumpf inline.
    { file: "vendor/three.webgpu.min.js", sub: "constructor(e,t){super(),this.shaderNode=e,this.rawInputs=t,this.isShaderCallNodeInternal=!0}", organ: "_ensurePostProcessing (nurBeiStaerke — die Stufe bleibt im Ketten-Graph sichtbar)" },
    // DER SCHMALE INDEX (W7): r184 weitet beim Anlegen jedes nicht-normierte 8-/16-bit-Attribut auf 32 bit — auch den Index;
    // `_backendGesetz` setzt `normalized` nur für das Anlegen eines Uint16-Index (der EINE Weg jedes Index), der Draw bindet ihn
    // nach dem Array-Typ als uint16. Das Haut-Gewicht reist als normiertes Uint16 (unorm16x4, nie geweitet).
    // DER FROST (07.10.): das Weiten schreibt die geweitete Form in das GETEILTE Attribut zurück (`r.array=o`) — darum sitzt
    // die Hülle an der KLASSE (jedes Backend der Seite: Welt + Bühnen), und Index-Wache und GPU-Wache hängen an Draw und init.
    { file: "vendor/three.webgpu.min.js", sub: "if(!1===e.normalized)if(o.constructor===Int16Array||o.constructor===Int8Array)o=new Int32Array(o);else if((o.constructor===Uint16Array||o.constructor===Uint8Array)&&(o=new Uint32Array(o),t&GPUBufferUsage.INDEX))", organ: "_backendGesetz (das Weiten fragt normalized — die Hülle setzt es nur für das Anlegen)" },
    { file: "vendor/three.webgpu.min.js", sub: "for(let e=0;e<o.length;e++)65535===o[e]&&(o[e]=4294967295);if(r.array=o,", organ: "_backendGesetz (das Weiten schreibt in das geteilte Attribut zurück — die Hülle gilt jedem Backend)" },
    { file: "vendor/three.webgpu.min.js", sub: "createIndexAttribute(e){let t=GPUBufferUsage.INDEX|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST;", organ: "_backendGesetz (der EINE Weg jedes Index auf die GPU)" },
    { file: "vendor/three.webgpu.min.js", sub: "t=h.array instanceof Uint16Array?uA:lA;o.setIndexBuffer(e,t)", organ: "_backendGesetz (der Draw bindet das Index-Format nach dem Array-Typ)" },
    { file: "vendor/three.webgpu.min.js", sub: "updateAttribute(e){this.attributeUtils.updateAttribute(e)}", organ: "_backendGesetz (das Nachschreiben bucht das Index-Maximum der geschriebenen Bereiche)" },
    // DIE LÖSUNG DER RENDER-OBJEKTE (Frost-Nachbesserung 4): r184 hängt jedes Render-Objekt an das dispose-Ereignis seines
    // Stoffs (6:205594) und löst es selbst nur dort (6:210413) — ein geteilter Stoff fällt nie; das Register sitzt an der
    // Klasse (createRenderObject, 6:211320), die Lösung nimmt die Hörer in ihrem eigenen Renderer ab (ro.renderer, 6:205002).
    { file: "vendor/three.webgpu.min.js", sub: 'this.onMaterialDispose=()=>{this.dispose()},this.onGeometryDispose=()=>{this.attributes=null,this.attributesId=null},this.material.addEventListener("dispose",this.onMaterialDispose),this.geometry.addEventListener("dispose",this.onGeometryDispose)', organ: "_renderObjekteLoesen (die Hörer, die ein Render-Objekt an Stoff und Geometrie hängt)" },
    { file: "vendor/three.webgpu.min.js", sub: 'dispose(){this.material.removeEventListener("dispose",this.onMaterialDispose),this.geometry.removeEventListener("dispose",this.onGeometryDispose),this.onDispose()}', organ: "_renderObjekteLoesen (r184 löst ein Render-Objekt nur beim Stoff-dispose)" },
    { file: "vendor/three.webgpu.min.js", sub: "createRenderObject(e,t,r,s,i,n,a,o,u,l,d){const c=this.getChainMap(d),h=new vy(e,t,r,s,i,n,a,o,u,l);return h.onDispose=", organ: "_renderObjektRegister (die Hülle an der Klasse der Render-Objekt-Verwaltung)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.id=_y++,this._nodes=e,this._geometries=t,this.renderer=r,this.object=s", organ: "_renderObjekteLoesen (jedes Render-Objekt kennt seinen Renderer)" },
    // DER KNOTEN-BAU gehört seinem Schlüssel (Frost-Nachbesserung 5): Cache je initialCacheKey (6:378979), Auswurf beim letzten
    // Nutzer (6:380856), die uuid im Schlüssel nur bei Instanz-Senke · count > 1 · Morph (6:209550) — nur dort löst die Lösung ihn.
    { file: "vendor/three.webgpu.min.js", sub: "getForRenderCacheKey(e){return e.initialCacheKey}", organ: "_renderObjekteLoesen (der Knoten-Bau ist je Schlüssel gecacht)" },
    { file: "vendor/three.webgpu.min.js", sub: "delete(e){if(e.isRenderObject){const t=this.get(e).nodeBuilderState;void 0!==t&&(t.usedTimes--,0===t.usedTimes&&this.nodeBuilderCache.delete(this.getForRenderCacheKey(e)))}return super.delete(e)}", organ: "_renderObjekteLoesen (Nodes.delete wirft den Knoten-Bau beim letzten Nutzer aus dem Cache)" },
    { file: "vendor/three.webgpu.min.js", sub: '(e.isInstancedMesh||e.count>1||Array.isArray(e.morphTargetInfluences))&&(s+=e.uuid+",")', organ: "_renderObjekteLoesen (nur ein Schlüssel mit uuid gehört dem Objekt)" },
    { file: "vendor/three.webgpu.min.js", sub: "draw(e,t){const{object:r,context:s,pipeline:i}=e,n=this.get(s),a=this.get(i),o=a.pipeline;", organ: "_indexWacheDraw (die Index-Wache am Draw jedes Backends)" },
    { file: "vendor/three.webgpu.min.js", sub: "getIndex(){return this._geometries.getIndex(this)}", organ: "_indexWacheDraw (der Index, den der Draw bindet)" },
    { file: "vendor/three.webgpu.min.js", sub: "async init(e){await super.init(e);const t=this.parameters;", organ: "_gpuWacheAn (das Device jedes Backends nach seinem init)" },
    { file: "vendor/three.webgpu.min.js", sub: '[Uint16Array,["uint16","unorm16"]]', organ: "_hautGewicht (normiertes Uint16 → unorm16x4)" },
];

// DIE DIÄT-PRÜFUNG (Kamera-Treue je Programm): die Diät-Funktionen aus dem Stamm schneiden (vom ersten
// `AnazhRealm._diaet… = function` bis zum Ende von `_diaetRefresh`) und gegen Schein-Programme fahren — r184-
// Semantik: EIN Beobachter und EINE geteilte Gruppe je Programm, mehrere Objekte je Programm, die Vendor-Bahn
// (Kopf → renderId-Wand → equals()). Manipulationen für den Selbsttest: "abkuerzung" kürzt jedes bekannte Objekt
// ohne Schreiben ab (die Klasse der Bundle-Abkürzung V18.518 mit Render-Stempel), "schreiben" nimmt der Diät ihr Schreiben der
// geteilten Gruppe (falls sie eins hat).
// Weitere Manipulationen (Welle K, EIN GANG JE KNOTEN UND GRUPPE): "gangWiederholung" nimmt den Knoten ihren Render-Stempel
// (jedes Programm stellt sie wieder), "gruppenWiederholung" nimmt der geteilten Gruppe ihren
// (jedes Programm lädt sie wieder), "eigen" nimmt ihm die Weiche für Knoten je Zeichen-Objekt (ein Verweis ohne festes
// Objekt teilte dann den Gang eines Geschwisters und arbeitete nie für sein eigenes Objekt), "stempelOhneVerlassen" nimmt
// dem Stempel den Render-Abschnitt (nur die Render-Id: er überlebt einen verschachtelten Render, der die geteilten Knoten
// über die Vendor-Bahn auf seine Kamera stellt — Gegenprüfung 07.10.).
function diaetLaden(manipuliert) {
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const b = stamm.indexOf("AnazhRealm._diaetRefresh = function");
    if (b < 0) return null;
    let a = b;
    for (const kopf of ["AnazhRealm._diaetGang = function", "AnazhRealm._diaetGeteiltSchreiben = function"]) {
        const s0 = stamm.indexOf(kopf);
        if (s0 >= 0 && s0 < a) a = s0;
    }
    const e = stamm.indexOf("\n};\n", b);
    if (e < 0) return null;
    let src = stamm.slice(a, e + 3);
    const ersetze = (alt, neu) => {
        const vor = src;
        src = src.split(alt).join(neu);
        return src !== vor;
    };
    if (manipuliert === "schreiben" && !ersetze("AnazhRealm._diaetGeteiltSchreiben(rend, ro, rid);", "")) return null;
    if (
        manipuliert === "gangWiederholung" &&
        !(
            ersetze("if (n._anazhRid === rid && n._anazhRuf === ruf) continue;", "") &&
            ersetze("if (n._anazhVorRid === rid && n._anazhVorRuf === rend.info.calls) continue;", "")
        )
    )
        return null;
    if (manipuliert === "gruppenWiederholung" && !ersetze("if (g._anazhRid === rid && g._anazhRuf === ruf) continue;", ""))
        return null;
    if (manipuliert === "stempelOhneVerlassen" && !ersetze("rend.info.calls", "rid")) return null;
    if (
        manipuliert === "frameAlt" &&
        !ersetze(
            "rend._nodes.getNodeFrameForRender(ro).updateBeforeNode(n);",
            "(nf || (nf = rend._nodes.getNodeFrameForRender(ro))).updateBeforeNode(n);"
        )
    )
        return null;
    if (manipuliert === "eigen" && !ersetze('typ === "object" || (typeof n.property === "string" && n.object === null)', "false"))
        return null;
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
    // Der Schein-Renderer: was die Diät selbst schreibt (Knoten der Gruppe + Upload), zählt je GRUPPE (die Diät) und die
    // Gänge des Knotens je Zeichen-Objekt je Programm. Die Wiederholung zählt je RENDER-ABSCHNITT (r184: jeder betretene
    // Render zählt `info.calls` hoch, die Render-Id kehrt nach einem verschachtelten Render zurück).
    let dieDiaet = null,
        zeichenGaenge = null,
        knotenGaenge = null,
        fremdeKamera = 0,
        fremdeGruppe = 0,
        aktRid = 0;
    // Der Wert jedes render-Knotens: welche Kamera er gerade hält. Der Vorher-Knoten des Schattens verschachtelt EINMAL je
    // Render-Id (r184 updateBeforeMap) einen Render, dessen Werfer ohne Diät jeden geteilten Knoten über die Vendor-Bahn
    // auf SEINE Kamera stellen — eine danach geladene Gruppe muss die Knoten vorher neu gestellt bekommen.
    const wert = new Map();
    const vorGemacht = new Map();
    const abschnitt = () => aktRid + ":" + rend.info.calls + ":";
    const frame = {
        camera: null,
        ro: null,
        updateBeforeNode(n) {
            const k = abschnitt() + "v" + n.id;
            knotenGaenge.set(k, (knotenGaenge.get(k) || 0) + 1);
            if (n.verschachtelt && vorGemacht.get(n.id) !== aktRid) {
                rend.info.calls++;
                for (const id of wert.keys()) wert.set(id, "schatten");
                this.camera = "schatten";
                vorGemacht.set(n.id, aktRid);
            }
        },
        updateNode(n) {
            if (this.camera !== "haupt") fremdeKamera++;
            if (n.object === null) zeichenGaenge.add(this.ro.progId);
            else {
                const k = abschnitt() + n.id;
                knotenGaenge.set(k, (knotenGaenge.get(k) || 0) + 1);
                wert.set(n.id, this.camera);
            }
        },
    };
    const rend = {
        info: { calls: 0 },
        _nodes: {
            updateBefore() {},
            // r184: EIN Node-Frame, getNodeFrameForRender stellt Kamera und Objekt des Render-Objekts. Der Vorher-Knoten
            // des Schattens verschachtelt einen Render, der den Frame auf SEINE Kamera stellt.
            getNodeFrameForRender: (ro) => {
                frame.camera = "haupt";
                frame.ro = ro;
                return frame;
            },
        },
        _bindings: {
            _update(g) {
                if (g.bindings[0].groupNode.shared === true) {
                    geschrieben.set(g.id, (geschrieben.get(g.id) || 0) + 1);
                    const k = abschnitt() + g.id;
                    dieDiaet.set(k, (dieDiaet.get(k) || 0) + 1);
                    if (g.knoten.some((id) => wert.get(id) !== "haupt")) fremdeGruppe++;
                } else objektDurchDiaet++;
            },
        },
    };
    // r184-Ids (Knoten · Bindegruppen): Programme 0–9 tragen je ihre EIGENE geteilte Gruppe und ihren eigenen Render-
    // Knoten (wie vor dem EINEN Knoten je Quelle), 10–17 teilen EINE Gruppe und EINEN Knoten (dieselbe Arbeit), 18–19
    // teilen sie auch, tragen aber denselben Verweis ohne festes Objekt (er liest frame.object — je Programm ein Gang).
    // Jede Gruppe kennt die render-Knoten, deren Werte sie lädt.
    const geteilteGruppe = { id: 500, knoten: [600], bindings: [{ groupNode: { shared: true } }] };
    const geteilterKnoten = { id: 600, getUpdateType: () => "render" };
    const zeichenKnoten = { id: 700, property: "x", object: null, getUpdateType: () => "render" };
    const objektKnoten = { id: 800, getUpdateType: () => "object" };
    // Ein Vorher-Knoten aller Programme (wie der Schatten des Lichts): EINMAL je Render.
    const vorKnoten = { id: 900, verschachtelt: true, getUpdateBeforeType: () => "render" };
    // DER STEIN (Gegenprüfung 07.10.): ein Diät-Stoff ohne Schatten-Empfang zeichnet ZUERST — er stellt und stempelt den
    // geteilten Knoten, bevor der Schatten des ersten Empfängers verschachtelt; seine eigene Gruppe lädt nur ihn.
    const steinProg = {
        id: 20,
        obs: beobachter(),
        geteilt: { id: 502, knoten: [600], bindings: [{ groupNode: { shared: true } }] },
        nbs: { updateNodes: [geteilterKnoten], updateBeforeNodes: [], updateAfterNodes: [] },
    };
    const stein = {
        prog: steinProg,
        ro: {
            progId: 20,
            object: { material: { _anazhDiaet: true }, welt: 0 },
            material: { _anazhDiaet: true },
            lightsNode: {},
            getBindings: () => [steinProg.geteilt],
            getNodeBuilderState: () => steinProg.nbs,
        },
    };
    const programme = [];
    for (let p = 0; p < N_PROG; p++) {
        const eigen = p < 10;
        programme.push({
            id: p,
            obs: beobachter(),
            geteilt: eigen ? { id: 100 + p, knoten: [200 + p], bindings: [{ groupNode: { shared: true } }] } : geteilteGruppe,
            nbs: {
                updateNodes: [
                    eigen ? { id: 200 + p, getUpdateType: () => "render" } : geteilterKnoten,
                    objektKnoten,
                    ...(p >= 18 ? [zeichenKnoten] : []),
                ],
                updateBeforeNodes: [vorKnoten],
                updateAfterNodes: [],
            },
        });
    }
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
                progId: prog.id,
                object: obj,
                material: obj.material,
                lightsNode: {},
                getBindings: () => [prog.geteilt, objektGruppe],
                getNodeBuilderState: () => prog.nbs,
            },
        });
    }
    const render = (vorher) => {
        // r184: der Render zählt `info.calls` hoch, seine Render-Id ist der Zählerstand.
        aktRid = ++rend.info.calls;
        const frame = { renderer: rend, renderId: aktRid };
        if (vorher) vorher();
        geschrieben = new Map();
        dieDiaet = new Map();
        zeichenGaenge = new Set();
        knotenGaenge = new Map();
        fremdeKamera = 0;
        fremdeGruppe = 0;
        objektDurchDiaet = 0;
        const voll = new Set();
        const steinVoll = fn(stein.prog.obs, stein.ro, frame, altNR);
        if (steinVoll) wert.set(600, "haupt");
        for (let i = 0; i < objekte.length; i++) {
            const x = objekte[i];
            // Ein Voll-Refresh schreibt alle Gruppen des Objekts (die Vendor-Bahn), die geteilte eingeschlossen.
            if (fn(x.prog.obs, x.ro, frame, altNR)) {
                voll.add(i);
                // Der Voll-Refresh fährt jeden Knoten für SEIN Objekt (die Vendor-Bahn) mit der Kamera dieses Renders.
                zeichenGaenge.add(x.prog.id);
                for (const n of x.prog.nbs.updateNodes) if (n.getUpdateType() !== "object" && n.object !== null) wert.set(n.id, "haupt");
                geschrieben.set(x.prog.geteilt.id, (geschrieben.get(x.prog.geteilt.id) || 0) + 1);
            }
        }
        let fehlt = 0;
        for (const p of programme) if (!geschrieben.get(p.geteilt.id)) fehlt++;
        // Die Wiederholung: dieselbe geteilte Gruppe oder derselbe render-Knoten mehr als EINMAL je Render durch die Diät.
        let wiederholt = 0;
        for (const n of dieDiaet.values()) if (n > 1) wiederholt += n - 1;
        for (const n of knotenGaenge.values()) if (n > 1) wiederholt += n - 1;
        const zeichenFehlt = [18, 19].filter((p) => !zeichenGaenge.has(p)).length;
        return { voll, steinVoll, fehlt, objektDurchDiaet, wiederholt, zeichenFehlt, fremdeKamera, fremdeGruppe };
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
            if (r.wiederholt)
                f.push(
                    `Wiederholung ${k}: ${r.wiederholt} Gänge über eine schon geschriebene geteilte Gruppe oder einen schon gestellten Knoten — gleiche Arbeit läuft EINMAL je Render`
                );
            if (r.fremdeKamera)
                f.push(
                    `Node-Frame ${k}: ${r.fremdeKamera} Knoten mit der Kamera eines verschachtelten Renders gestellt — der Frame wurde vor dem Vorher-Knoten gemerkt`
                );
            if (r.fremdeGruppe)
                f.push(
                    `Verschachtelt ${k}: ${r.fremdeGruppe} geteilte Gruppe(n) mit der Kamera eines verschachtelten Renders geladen — ein Stempel überlebte ihn (er muss beim Betreten UND Verlassen jedes Renders wechseln)`
                );
            if (r.zeichenFehlt)
                f.push(
                    `Zeichen-Objekt ${k}: ${r.zeichenFehlt} von 2 Programmen mit einem Verweis ohne festes Objekt gingen keinen eigenen Gang — er arbeitete nie für ihr Objekt`
                );
        }
        if (!z.r4.voll.has(7)) f.push("Objekt-Wahrheit: ein bewegtes Objekt refresht voll (equals)");
        if (!z.r5.voll.has(11)) f.push("Instanz-Wächter: eine Instanz-Mutation refresht voll");
        return f;
    };
    const z = diaetLauf(fn);
    fehler.push(...pruefe(z));
    const stand = [z.r2, z.r3, z.r6].map((r) => r.voll.size + (r.steinVoll ? 1 : 0));
    // Die Kamera-Treue kostet im Stand keinen Voll-Refresh: je Programm schreibt die Diät nur die geteilte Gruppe.
    if (stand.some((n) => n !== 0))
        fehler.push(`Stand: ${stand.join("/")} Voll-Refreshs je Render (Soll 0 — die renderId-Wand refresht jedes Programm voll)`);
    let selbstFeuert = false;
    if (selftest) {
        const abk = pruefe(diaetLauf(diaetLaden("abkuerzung")));
        // Die Diät MUSS ihr Schreiben tragen: fehlt der Ruf `_diaetGeteiltSchreiben(rend, ro)`, ist die Manipulation
        // nicht anwendbar und der Selbsttest rot (nie still übersprungen).
        const schreibFn = diaetLaden("schreiben");
        if (!schreibFn) fehler.push("Selbsttest: die Diät trägt keinen Ruf `AnazhRealm._diaetGeteiltSchreiben(rend, ro, rid);`");
        const ohneSchreiben = schreibFn ? pruefe(diaetLauf(schreibFn)) : [];
        // Der Gang je Signatur MUSS seinen Render-Stempel und seine Weiche je Zeichen-Objekt tragen (sonst rot, nie still).
        const gangFn = diaetLaden("gangWiederholung");
        if (!gangFn) fehler.push("Selbsttest: der Knoten-Gang trägt keinen Render-Stempel je Knoten (`n._anazhRid` · `n._anazhVorRid`)");
        const gruppeFn = diaetLaden("gruppenWiederholung");
        if (!gruppeFn) fehler.push("Selbsttest: die geteilte Gruppe trägt keinen Render-Stempel `if (g._anazhRid === rid) continue;`");
        const wieder = [
            ...(gangFn ? pruefe(diaetLauf(gangFn)).filter((e) => e.startsWith("Wiederholung")).slice(0, 1) : []),
            ...(gruppeFn ? pruefe(diaetLauf(gruppeFn)).filter((e) => e.startsWith("Wiederholung")).slice(0, 1) : []),
        ];
        const frameFn = diaetLaden("frameAlt");
        if (!frameFn) fehler.push("Selbsttest: der Gang stellt den Node-Frame nicht je Vorher-Knoten neu");
        const frameAlt = frameFn ? pruefe(diaetLauf(frameFn)) : [];
        const eigenFn = diaetLaden("eigen");
        if (!eigenFn) fehler.push("Selbsttest: der Gang trägt keine Weiche für Knoten je Zeichen-Objekt");
        const ohneEigen = eigenFn ? pruefe(diaetLauf(eigenFn)) : [];
        const verlassenFn = diaetLaden("stempelOhneVerlassen");
        if (!verlassenFn) fehler.push("Selbsttest: der Gang liest seinen Render-Abschnitt nicht aus `rend.info.calls`");
        const ohneVerlassen = verlassenFn ? pruefe(diaetLauf(verlassenFn)) : [];
        selbstFeuert =
            abk.some((e) => e.startsWith("Kamera-Treue")) &&
            ohneSchreiben.some((e) => e.startsWith("Kamera-Treue")) &&
            wieder.length === 2 &&
            ohneEigen.some((e) => e.startsWith("Zeichen-Objekt")) &&
            frameAlt.some((e) => e.startsWith("Node-Frame")) &&
            ohneVerlassen.some((e) => e.startsWith("Verschachtelt"));
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
                ? "✅ SELBST-TEST: die Diät-Probe feuert (eine Abkürzung ohne Schreiben lässt Programme an der alten Kamera kleben; ein Gang ohne Render-Stempel wiederholt Knoten und Gruppen; ein Verweis ohne festes Objekt ohne eigenen Gang; ein gemerkter Node-Frame trägt die Schatten-Kamera; ein Stempel nur aus der Render-Id überlebt den verschachtelten Render)"
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
        `✅ DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der Laufzeit-Organe leben im Vendor, die Diät-Prüfung hält am Schein-Programm (Kamera-Treue: jede geteilte Gruppe je Render geschrieben, keine Gruppe und kein Knoten zweimal; Voll-Refreshs im Stand ${diaet.stand.join("/")} von 50), der Schatten-Stoff prüft im Stand ${stoff.stand} von 40 Bürgern, ein eigener Wechsel ${stoff.eigener}; die Haupt-Aufnahme verfolgt ${wahr.z.verfolgtHaupt} von ${wahr.z.gezeichnetHaupt} Draws trotz Schatten-Render, ${wahr.z.unterOverride} Bundles unter dem Override-Stoff.`
    );
}
main();
