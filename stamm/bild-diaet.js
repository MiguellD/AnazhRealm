//# allFunctionsCalledOnLoad
class AnazhRealm_bild_diaet {
    // ===== ATLAS · Bild/diaet — Die Diät · das Register der Regung (Melder · Stand · Tor) · Gang · Objekt-Gang · Stoff je Render-Objekt =====
    // DER MELDER DER VERSIONEN: jede Version läuft durch EINEN Setter in three.core (`set needsUpdate(t){!0===t&&this.version++}` an
    // BufferAttribute und InterleavedBuffer; Index und Instanz-Puffer sind BufferAttribute) — er meldet die Regung mit.
    // Ein Glied der Klasse (kein Außen-Satz): die Zone Bild/diaet lädt so vor dem Boot (`_bootAnazhRealm` am Ende der Ankunft).
    _regungMelder() {
        const T = THREE;
        const log = (t, l) => this.log(t, l);
        for (const [name, K] of [
            ["BufferAttribute", T.BufferAttribute],
            ["InterleavedBuffer", T.InterleavedBuffer],
        ]) {
            const p = K && K.prototype;
            const d = p && Object.getOwnPropertyDescriptor(p, "needsUpdate");
            if (!d || typeof d.set !== "function") {
                log(`REGISTER: r184-${name}.needsUpdate nicht gefunden (Vendor-Drift)`, "ERROR");
                continue;
            }
            if (d.set.__anazhRegung === true) continue;
            const roh = d.set;
            const set = function (v) {
                roh.call(this, v);
                if (v === true) AnazhRealm._regt(this);
            };
            set.__anazhRegung = true;
            Object.defineProperty(p, "needsUpdate", { configurable: true, enumerable: d.enumerable, get: d.get, set });
        }
        // DIE LAGE DES STATISCHEN: three rechnet die Matrix eines Objekts mit matrixAutoUpdate = false nur, wenn sein Schreiber
        // updateMatrix ruft — der EINE Ort, an dem ein Statisches rückt, meldet es
        const O = T.Object3D && T.Object3D.prototype;
        if (!O || typeof O.updateMatrix !== "function")
            log("REGISTER: r184-Object3D.updateMatrix nicht gefunden (Vendor-Drift)", "ERROR");
        else if (O.updateMatrix.__anazhRegung !== true) {
            const roh = O.updateMatrix;
            O.updateMatrix = function () {
                roh.call(this);
                if (this.matrixAutoUpdate === false) AnazhRealm._regt(this);
            };
            O.updateMatrix.__anazhRegung = true;
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_diaet]);

// ===== ATLAS · Bild/diaet — Außen-Konstanten =====
// DIE EINE DIÄT-PRÜFUNG (needsRefresh) für jeden Beobachter eines Diät-Objekts — Hauptpass (der Material-
// Beobachter aus _materialObserverDiaet) UND Schattenpass (der Beobachter des r184-Schatten-Materials, s.
// _configureRenderer; dort zählt die Diät des ORIGINAL-Materials am Objekt). `obs` = der Beobachter, `altNR`
// seine Vendor-Bahn. Sie läuft im direkten Draw UND im Bundle-Replay (r184 ruft needsRefresh je verfolgtem Bürger).
//  (1) Instanz-Wächter: equals() walkt nur geometry.attributes — instanceMatrix/instanceColor leben am MESH →
//      Mutation → genau EIN Refresh.
//  (2) gefallen in (6): die Erklärung der Atlanten an die Diät (Integration V18.542) — wer eine Textur liest, muss sich
//      nicht mehr erklären, der Textur-Wächter sieht jede.
//  (3) DIE KAMERA-TREUE: Beobachter UND geteilte Bindegruppe (render · frame: cameraViewMatrix ·
//      cameraProjectionMatrix · uLodAuge) hängen in r184 am PROGRAMM (NodeBuilderState), und jedes Objekt mit eigener
//      Geometrie hat sein eigenes (gemessen 04.10. an der Mess-Wiese: 218 von 234 Programmen sind Diät-Programme).
//      Die renderId-Wand des Vendors refreshte darum JEDES Objekt in JEDEM Pass voll; die Bundle-Abkürzung (V18.518)
//      ließ je Render nur das Stempel-Objekt refreshen, 98 von 99 Programmen zeigten die Kamera ihrer letzten
//      Aufnahme. Die Diät schreibt je Programm und Render die geteilten Gruppen (_diaetGeteiltSchreiben: updateBefore,
//      die render-/frame-Knoten, der Upload genau dieser Gruppen) und fragt dann equals() (Welt-Matrix · Material ·
//      Geometrie · Lichter): voll nur, was sich änderte. Diät-Stoffe tragen nur geteilte renderGroup-Uniforms
//      (Pflicht-Paar _uniformHeimatTeilen), ihre Objekt-Gruppe ändert sich nur mit dem Objekt. Kopf wie der Vendor:
//      Erst-Init, Velocity und Programme mit updateAfter fahren die Vendor-Bahn (Knochen: der Objekt-Gang (11)). gate:vendor-anker pinnt
//      jede benutzte r184-Stelle und fährt die Treue am Schein-Programm, gate:kamera-treue am echten Bild.
//  (4) EIN GANG JE KNOTEN UND GRUPPE UND RENDER (Welle K, 07.10.): seit der EINE Knoten je Quelle die Render-Gruppen
//      über Programme teilt (_configureRenderer), tragen die Programme DIESELBEN Vorher-Knoten, render-/frame-Knoten und
//      geteilten Gruppen. Der Gang je Programm wiederholte sie: gemessen an der Mess-Wiese (echte GPU, Stand, ein Frame)
//      69–89 Gänge über 9–12 geteilte Gruppen, 930–1 150 Knoten-Besuche, 190–225 Vorher-Besuche — jeder Knoten im Schnitt
//      in 60 Programmen. Jetzt stellt die Diät jeden Knoten und lädt jede geteilte Gruppe EINMAL je RENDER-ABSCHNITT
//      (Stempel am Knoten und an der Gruppe; die Uniform-Knoten einer geteilten Gruppe sind Knoten jedes Programms, das sie
//      trägt — der erste Gang hat sie gestellt). Nur Knoten mit eigener Arbeit je Programm bleiben je Programm: die Instanz-
//      Knoten (je InstancedMesh, 61 von 101 Programmen) haben ohnehin ihren eigenen Stempel. Ein Knoten, der je Zeichen-
//      Objekt arbeitet (Takt object, oder ein Verweis ohne festes Objekt — er liest frame.object), geht je Programm wie bisher.
//  (5) DER RENDER-ABSCHNITT (Gegenprüfung K, 07.10.): der Stempel ist das Paar (Render-Id, `info.calls`) und wechselt beim
//      Betreten UND Verlassen jedes Renders. r184 stapelt die Render-Id (`_renderScene` setzt sie auf `info.calls` und gibt
//      dem äußeren Render danach seine zurück), `info.calls` zählt jeden betretenen Render und fällt nie (`info.reset` lässt
//      ihn stehen). Ein verschachtelter Render, der die geteilten Kamera-Knoten über die VENDOR-Bahn auf seine Kamera stellt
//      (ein Werfer ohne Diät, oder jeder Diät-Werfer der Kaskade an einem Wächter), lässt die Render-Id unverändert zurück:
//      ein Stempel nur aus ihr überlebte ihn, die nächste erstmals geladene Gruppe trug die Schatten-Kamera (gemessen am
//      echten Renderer: das Bild 0,11 gleich mit dem vollen Refresh statt 1,0 — gate:kamera-treue VERSCHACHTELT).
//  (6) DER VORHER-TEXTUR-WÄCHTER (0910-3 A1, Leben-Schau 2: 264× „Destroyed texture [Texture "szene:tiefenabbild"] used
//      in a submit" beim Fenster-Wechsel mit laufendem Loop): ein Vorher-Knoten, der eine Textur zieht (das Tiefen-Abbild,
//      `_tiefenAbbild`), legt sie bei jedem Größenwechsel der Szenen-Tiefe neu an — r184 zerstört dabei die alte GPU-Textur.
//      equals() sieht Textur-Knoten nie: jedes Render-Objekt des Stoffs (das Wasser) zeichnete weiter mit der Bindegruppe
//      der zerstörten Textur, bis sein Stoff neu gebaut wurde. Den Fenster-Wechsel deckte bis dahin ein Wasser-Neubau im
//      resize-Handler (ein Zwilling, gefallen), jeden anderen Wechsel nicht: `setPixelRatio` (die DPR-Kappe
//      `_applyRenderScale` nach einem DPR-Wechsel, Frames NACH dem resize-Ereignis) — nachgestellt am OMEN (GTX 1060,
//      Mess-Wiese, laufender Loop): vier Wechsel, 118 Fehler. Je Render-Objekt merkt die Diät Id und Version dieser
//      Texturen; nach dem Gang (der den Zug und damit den Neubau ausgelöst hat) zieht ein Wechsel den Objekt-Gang (11) nach sich,
//      die Bindung folgt der Textur — für JEDEN Größenwechsel, den des Fensters eingeschlossen.
//      JEDE TEXTUR DES PROGRAMMS (Integration V18.542, die weiße Masse): r184 lädt eine Textur nur im Binde-Gang eines
//      Render-Objekts hoch (`Bindings._update`: SampledTexture.update → updateTexture), und den fährt nur ein Refresh. Der
//      Wächter sah nur die Vorher-Knoten, die Atlanten erklärten sich selbst (der Atlas-Wächter (2)); die Daten-Bilder des
//      Boden-Stoffs erklärte niemand: in der stehenden Welt (Mess-Wiese, Software-Holz) hob ein Schreiber die Version der
//      Fern-Krone, der Wege-Karte (nah und fern) und der Kronen-Streu, und die GPU hielt 20 Takte lang die alte (die
//      Version der GPU 3 gegen 4, 20 gegen 21, 17 gegen 18) — hochgeladen nur, wenn zufällig ein Chunk den Satz änderte.
//      Jetzt merkt die Diät Id und Version JEDES Textur-Knotens der Bindegruppen (und der Vorher-Knoten) je Render-Objekt.
AnazhRealm._diaetGang = function (ro, nbs) {
    const jeZeichen = (n, typ) => typ === "object" || (typeof n.property === "string" && n.object === null);
    const vor = [],
        knoten = [],
        eigenVor = [],
        eigenKnoten = [];
    for (const n of nbs.updateBeforeNodes) (jeZeichen(n, n.getUpdateBeforeType()) ? eigenVor : vor).push(n);
    for (const n of nbs.updateNodes) {
        const typ = n.getUpdateType();
        if (typ !== "object") (jeZeichen(n, typ) ? eigenKnoten : knoten).push(n);
    }
    const gruppen = [];
    for (const g of ro.getBindings()) {
        const b0 = g.bindings && g.bindings[0];
        if (b0 && b0.groupNode && b0.groupNode.shared === true) gruppen.push(g);
    }
    // (6) JEDE Textur des Programms: die Vorher-Knoten, die eine Textur ziehen (ihr `value` kann neu angelegt werden), und
    // jeder Textur-Knoten seiner Bindegruppen (ein Daten-Bild oder Atlas, dessen Version ein Schreiber oder ein Wachsen hebt,
    // `_texturAbschied`) — die Knoten sind die des Programms, jedes seiner Render-Objekte bindet dieselben.
    const texturen = nbs.updateBeforeNodes.filter((n) => n.isTextureNode === true);
    for (const g of ro.getBindings())
        for (const b of g.bindings)
            if (b.isSampledTexture === true && b.textureNode && texturen.indexOf(b.textureNode) < 0)
                texturen.push(b.textureNode);
    // (9) die FREIEN Uniforms der eigenen Gruppen (nicht geteilt): kein Knoten des Programms stellt sie (die Bau-Uniforms
    // wie `modelWorldMatrix` hält ein Objekt-Knoten in `uniformNode`, die Material-Verweise in `node` — der Vendor stellt sie,
    // equals() prüft ihr Objekt) — ein Schreiber setzt `.value`
    // NUR DIE EIGENEN FELDER (B4): TSL hängt jede Ketten-Methode aufzählbar an den Prototyp des Knotens (`addMethodChaining`:
    // `Node.prototype[name]` und `[name + "Assign"]`) — ein `for … in` ging je Knoten ~2 350 geerbte Namen durch, keiner davon
    // eine Uniform (Radeon kalt am Kopf 130ba565: `_diaetGang` 585–708 ms Selbstzeit vor dem ersten Weltbild, 96 % in dieser Zeile).
    const gespeist = new Set();
    for (const liste of [nbs.updateNodes, nbs.updateBeforeNodes, nbs.updateAfterNodes])
        for (const n of liste || [])
            for (const k of Object.keys(n)) {
                const v = n[k];
                if (v && v.isUniformNode === true) gespeist.add(v);
            }
    const frei = [];
    for (const g of ro.getBindings()) {
        const b0 = g.bindings && g.bindings[0];
        if (b0 && b0.groupNode && b0.groupNode.shared === true) continue;
        for (const b of g.bindings) {
            if (b.isUniformBuffer !== true || !b.uniforms) continue;
            for (const u of b.uniforms) {
                const n = u.nodeUniform && u.nodeUniform.node;
                if (n && n.isUniformNode === true && n.getUpdateType() === "none" && !gespeist.has(n)) frei.push(u);
            }
        }
    }
    // (10) DIE OBJEKT-VERWEISE (E1): ein Verweis je Zeichen-Objekt (`reference`, Takt object — der Stoff-Wert `_stoffWert`,
    // `material.userData.…`) liest seinen Wert erst im Refresh; equals() sieht userData nie. Ein fester Stoff-Wert (die Art-
    // Größe des Winds) wechselt nie, ein atmender (die Membran des Tors: Zeit · Aktiv · Puls · Tiefe) je Bild.
    const verweise = nbs.updateNodes.filter(
        (n) =>
            n.getUpdateType() === "object" &&
            typeof n.getValueFromReference === "function" &&
            n.isMaterialReferenceNode !== true &&
            n.object === null &&
            n.count === null
    );
    // (11) DER OBJEKT-GANG (E1): die Knoten im Takt object (Welt-Matrix, Knochen, Stoff-Verweise) und die Stellen der eigenen
    // Gruppen — Render-Objekte desselben Programms tragen ihre eigenen Gruppen an derselben Stelle (`createBindings`).
    // NACH EINGANG (E-Diät, 19.10.): ein FREMDER Verweis (festes Objekt, geteilte Uniform: Schatten-Bias · normalBias · Radius ·
    // mapSize · Kaskaden des Lichts) trägt EINEN Wert je Render-Abschnitt — der Gang stellt ihn (12), nie das Objekt; ein
    // STOFF-Verweis, dessen Eigenschaft equals() prüft (r184 `refreshUniforms`), ist gleich, solange der Stoff-Stand seines
    // Render-Objekts gleich ist (13 `_diaetStoffVerpasst` — equals() merkt je STOFF, nie je Render-Objekt). Die REGUNG ist der Rest (Lage, Knochen, Objekt-Verweise, jeder Knoten ohne Zuordnung). Gemessen am Kopf e93134f4 (Radeon,
    // Genesis Third, Stand): am Leib 28 Objekt-Knoten je Gang, 11 fremde und 5–9 Stoff-Verweise; 108 fremde Gänge je Frame für
    // ~12 Uniforms (Diät-Linse: Fremd 96 wiederholt).
    const objekt = nbs.updateNodes.filter((n) => n.getUpdateType() === "object");
    // Im Schatten-Pass prüft equals() den GETEILTEN Schatten-Stoff (je Objekt umgestellt, je Render EINMAL verglichen): dort
    // trägt der Stoff-Verweis den Wert seines Objekts nur aus dem Gang — er bleibt Regung.
    const ru = new Set(
        (ro.material && ro.material.isShadowPassMaterial !== true && nbs.observer && nbs.observer.refreshUniforms) || []
    );
    const fremd = [],
        regung = [],
        stoffUniform = new Set();
    let stoffLiest = false; // (13) das Programm liest eine Stoff-Eigenschaft, die equals() prüft (Wert oder Textur)
    for (const n of objekt) {
        const u = n.node && n.node.isUniformNode === true && n.node.isTextureNode !== true ? n.node : null;
        if (
            u &&
            n.isMaterialReferenceNode !== true &&
            typeof n.getValueFromReference === "function" &&
            n.object != null &&
            n.count === null &&
            u.groupNode &&
            u.groupNode.shared === true
        )
            fremd.push(n);
        else if (u && n.isMaterialReferenceNode === true && ru.has(n.property)) stoffUniform.add(u);
        else regung.push(n);
        if (n.isMaterialReferenceNode === true && ru.has(n.property)) stoffLiest = true;
    }
    // VOLL lädt der Vendor eine eigene Gruppe, die mehr trägt als Uniform-Puffer, Texturen und Sampler (Speicher-Puffer)
    const eigen = [];
    let objektVoll = false;
    ro.getBindings().forEach((g, i) => {
        const b0 = g.bindings && g.bindings[0];
        if (b0 && b0.groupNode && b0.groupNode.shared === true) return;
        eigen.push(i);
        for (const b of g.bindings)
            if (b.isUniformBuffer !== true && b.isSampledTexture !== true && b.isSampler !== true) objektVoll = true;
    });
    return {
        vor,
        knoten,
        eigenVor,
        eigenKnoten,
        gruppen,
        texturen,
        frei,
        verweise,
        objekt,
        eigen,
        fremd,
        regung,
        stoffUniform,
        stoffLiest,
        objektVoll,
    };
};
// DAS REGISTER DER REGUNG (E-Bauart, 21.10.): die Diät HÖRT, statt jedes Render-Objekt in jedem Pass zu fragen. Bis hier ging jede
// Prüfung alles durch, was sich ändern KÖNNTE (Instanz · Geometrie · Texturen · freie Uniforms · Lage · Stoff; ~85 Prüfungen je
// Frame an Genesis Third, Radeon aa709f30 — die Prüfung kostete so viel wie ihr Ergebnis: Nachschläge, nicht Vergleiche). Jetzt
// meldet die QUELLE: EINE monotone Zahl (`_regungN`), jede Regung hebt sie und stempelt ihre Quelle (`_regt`):
//   · jede Version (Attribut · Index · Instanz-Puffer · verschachtelter Puffer) — der EINE needsUpdate-Setter (`_regungMelder`);
//   · die Texturen und freien Uniforms eines Programms — der Programm-Melder im Gang (`_diaetProgrammMelder`): three schreibt
//     `.value` ohne Signal, der Gang vergleicht EINMAL je Programm und Render, nie je Render-Objekt;
//   · jeder Stoff — der Stoff-Blick (`_diaetStoffBlick`, r184s Vergleich EINMAL je Stoff und Render) und sein Verbrauch (13).
// Jedes Render-Objekt trägt am EIGENEN Feld den Stand, den es zuletzt verbrauchte (`_anazhR`, `_diaetStand`; ein verdeckter Pass
// holt nach), das Tor (`_diaetRuhig`) liest nur die Stempel seiner Quellen. Ohne Melder bleibt, was three nicht meldet: die Lage
// (16 Zahlen, nur wer sich bewegen KANN), die Verweise je Objekt (10), die Knochen.
AnazhRealm._regungN = 0;
AnazhRealm._regt = function (q) {
    const n = ++AnazhRealm._regungN;
    q._anazhRegung = n;
    AnazhRealm._regtHalter(q, n);
    return n;
};
// DER HALTER hört die Regung seiner Quelle mit (`_anazhHaltR`) — die Werfer-Hülle eines Bündels die Puffer und die Sicht seiner
// Kinder (`_bundleWerferHuelle`, der Leser der Pass-Sicht). Die Sicht einer Senke (`_instanzZahl`) meldet nur den Haltern.
// Die Quelle hält ihre Halter SCHWACH: sie lebt oft länger als jeder Halter (der Lager-Puffer einer Arena über jede neue
// Fassade, `_geoNeu`; ein Kind über seine Bündel) — die starke Liste hielt jeden gefallenen Halter samt seinen Puffern
// (`werkbank puffer --gang` 22.10.: +178 MB in 2 min am Pfad `renderer.info.memoryMap[k]._anazhHalter[]`).
AnazhRealm._regtHalter = function (q, n) {
    const h = q._anazhHalter;
    if (h === undefined) return;
    const z = n === undefined ? ++AnazhRealm._regungN : n;
    for (let i = 0; i < h.length; i++) {
        const o = h[i].deref();
        if (o !== undefined) o._anazhHaltR = z;
    }
};
// Anmelden räumt die Gefallenen aus der Liste (sie wächst nur mit lebenden Haltern).
AnazhRealm._regungHalter = function (q, h) {
    const l = q._anazhHalter;
    if (l === undefined) return void (q._anazhHalter = [new WeakRef(h)]);
    let w = 0,
        da = false;
    for (let i = 0; i < l.length; i++) {
        const o = l[i].deref();
        if (o === undefined) continue;
        da = da || o === h;
        l[w++] = l[i];
    }
    l.length = w;
    if (!da) l.push(new WeakRef(h));
};
// DER STAND: jeder Ausgang der Diät verbraucht — das Render-Objekt merkt die Zahl des Registers und, was ihm das Tor liest:
// Beobachter · r184-Daten (je Objekt und Stoff fest) · Index · Instanz-Puffer · ob es sich bewegen KANN: BEWEGLICH ist eine Kette
// mit matrixAutoUpdate bis zur Szene (three rechnet ihre Welt-Matrix jeden Frame neu, ohne Signal — der Leib, die Tiere, das
// Fahrzeug, der Himmel am Auge), STATISCH eine Kette ohne (die Bündel der Welt, `_archRegionBundleFor`): sie fällt aus dem
// Lage-Vergleich, ihre Glieder melden über updateMatrix. STÄNDIG (kein Stand, jede Prüfung voll) bleibt, was nur equals() je
// Render-Objekt sieht: Morph-Gewichte, die Karten der Spot-Lichter, die Mitte eines Sprites.
AnazhRealm._diaetStand = function (obs, ro, od, md) {
    ro._anazhR = AnazhRealm._regungN;
    const obj = ro.object;
    const staendig = !!(od.morphTargetInfluences || (od.lights && od.lights.length > 0) || (obj && obj.center));
    ro._anazhObs = staendig ? null : obs;
    if (staendig) return;
    ro._anazhOd = od;
    ro._anazhMd = md;
    const senke = obj && obj.isInstanzZeichner === true ? obj.__instanzQuelle : obj;
    ro._anazhSenke = senke;
    const nbs = ro.getNodeBuilderState();
    ro._anazhNbs = nbs;
    const geo = ro.geometry;
    const at = ro.attributes;
    const ix = geo ? geo.index : undefined,
        im = senke ? senke.instanceMatrix : undefined,
        ic = senke ? senke.instanceColor : undefined;
    // DIE SAMMEL-STELLE (Spitze): die Puffer melden ihrem Halter — Attribute, die das Programm liest, und der Index ihrer
    // Geometrie, die Instanz-Puffer ihrer Senke (`_regtHalter`). Das Tor liest EINEN Stempel je Halter statt jedes Puffers: jeder
    // Puffer war ein Speicher-Zugriff im kalten Cache zwischen zwei Draws. Angemeldet wird, wenn ein Puffer neu am Render-Objekt hängt.
    const halte = AnazhRealm._regungHalter;
    if (geo && (ro._anazhAtt !== at || ro._anazhGeo !== geo || ro._anazhIx !== ix)) {
        if (at)
            for (let i = 0; i < at.length; i++)
                halte(at[i].isInterleavedBufferAttribute === true ? at[i].data : at[i], geo);
        if (ix) halte(ix, geo);
    }
    if (im && ro._anazhIM !== im) halte(im, senke);
    if (ic && ro._anazhIC !== ic) halte(ic, senke);
    ro._anazhIx = ix;
    ro._anazhIM = im;
    ro._anazhIC = ic;
    ro._anazhGeo = geo;
    ro._anazhAtt = at;
    const k = nbs._anazhGang;
    ro._anazhVw = !k || k.verweise.length > 0;
    const kette = ro._anazhKette || [];
    kette.length = 0;
    let kann = false;
    for (let o = obj; o && o.isScene !== true && !kann; o = o.parent) {
        kann = o.matrixAutoUpdate !== false;
        kette.push(o);
    }
    ro._anazhBeweglich = kann;
    ro._anazhKette = kette;
    // die Lage, gegen die das Tor vergleicht, liegt am Render-Objekt (nicht in den r184-Daten: zwei Zugriffe weniger je Tor)
    let L = ro._anazhLage;
    if (kann) {
        if (!L) L = new Float64Array(16);
        L.set(obj.matrixWorld.elements);
    }
    ro._anazhLage = L || null;
};
// DAS TOR: trägt das Render-Objekt einen Stand und meldete keine seiner Quellen seither eine Regung (Attribute, die sein Programm
// liest · Index · Instanz-Puffer · Programm · Stoff), ruht es — kein Nachschlag, kein equals(). Den Bau-Wechsel meldet r184 selbst
// (`setGeometry` leert `attributes`), Index und Instanz-Puffer ihre Identität. Was three nicht meldet, stellt das Tor hier: die
// Lage dessen, der sich bewegen kann, die Verweise je Objekt (10), die Knochen — der Objekt-Gang (11). true: es ruht (kein
// Refresh); sonst geht die volle Prüfung (der Körper von `_diaetRefresh`).
AnazhRealm._diaetRuhig = function (obs, ro, rend, rid) {
    const r = ro._anazhR;
    const at = ro.attributes;
    if (at === null || at !== ro._anazhAtt) return false;
    // die Velocity-MRT ist je Render EINE (r184 needsVelocity liest nur den Renderer)
    if (rend._anazhVelR !== rid) {
        rend._anazhVelR = rid;
        rend._anazhVel = obs.needsVelocity(rend);
    }
    if (rend._anazhVel === true) return false;
    // die Puffer über ihre Halter (die Sammel-Stelle, `_diaetStand`): Attribute + Index an der Geometrie, Instanz an der Senke
    const geo = ro.geometry,
        senke = ro._anazhSenke;
    if (geo !== ro._anazhGeo || (geo && (geo.index !== ro._anazhIx || geo._anazhHaltR > r))) return false;
    if (senke.instanceMatrix !== ro._anazhIM || senke.instanceColor !== ro._anazhIC || senke._anazhHaltR > r)
        return false;
    const nbs = ro._anazhNbs;
    const m = ro.material;
    if (nbs._anazhRegung > r) return false;
    if (m) {
        const md = ro._anazhMd;
        if (
            m._anazhRegung > r ||
            (md._renderId === rid ? md._equal === false : AnazhRealm._diaetStoffBlick(md, m, rid))
        )
            return false;
    }
    const obj = ro.object;
    let og = obs.hasAnimation === true;
    if (ro._anazhBeweglich !== true) {
        const kette = ro._anazhKette;
        for (let i = 0; i < kette.length; i++) if (kette[i]._anazhRegung > r) return false;
    } else {
        const L = ro._anazhLage,
            e = obj.matrixWorld.elements;
        let i = 0;
        while (i < 16 && L[i] === e[i]) i++;
        if (i < 16) {
            L.set(e);
            ro._anazhOd.worldMatrix.copy(obj.matrixWorld);
            og = true;
        }
    }
    if (ro._anazhVw === true) {
        const k = nbs._anazhGang;
        if (k.verweise.length > 0 && AnazhRealm._diaetVerweisAnders(obs, ro, k)) og = true;
    }
    if (og) AnazhRealm._diaetObjektGang(rend, ro, nbs._anazhGang, false);
    return true;
};
// DER STOFF-BLICK: r184 vergleicht die Stoff-Daten EINMAL je Stoff und Render (equals: `_renderId` · `_equal` · jeder Schlüssel
// gegen den Stoff; Farbe, Deckung … sind Klar-Felder ohne Melder). Zeichnet ein ruhendes Render-Objekt als erstes seines Stoffs
// im Render, vergleicht das Tor — derselbe Vergleich (vendor-anker pinnt ihn), equals() liest danach sein Urteil. Ein Wechsel ist
// die Regung des Stoffs (13: der Render seines Verbrauchs). Transmission (die Puffer-Größe je Render-Objekt) bleibt equals().
// true: der Stoff wechselte in diesem Render.
AnazhRealm._diaetStoffBlick = function (md, stoff, rid) {
    if (md._renderId === rid) return md._equal === false;
    if (stoff.transmission > 0) return true;
    md._renderId = rid;
    md._equal = true;
    for (const e in md) {
        if (e === "_renderId" || e === "_equal") continue;
        const t = md[e],
            s = stoff[e];
        if (t.equals !== undefined) {
            if (t.equals(s) !== false) continue;
            t.copy(s);
        } else if (s.isTexture === true) {
            if (t.id === s.id && t.version === s.version) continue;
            t.id = s.id;
            t.version = s.version;
        } else if (t === s) continue;
        else md[e] = s;
        md._equal = false;
        stoff._anazhStoffR = rid;
        AnazhRealm._regt(stoff);
        return true;
    }
    return false;
};
// DER WERT-STAND: die Zahlen eines Uniform-Werts in einen Stand `w` (`w.z` ab `w.i`, `w.anders` hebt jeder Wechsel) — die EINE
// Abflachung für den Programm-Melder und die Verweise (Zahl · Wahrheit · Textur Id+Version · Matrix · Farbe · Vektor, sonst
// die Identität).
AnazhRealm._diaetZahl = function (w, x) {
    if (w.z[w.i] !== x) {
        w.z[w.i] = x;
        w.anders = true;
    }
    w.i++;
};
AnazhRealm._diaetWert = function (w, v) {
    const z = AnazhRealm._diaetZahl;
    if (typeof v === "number" || typeof v === "boolean") z(w, +v);
    else if (v && v.isTexture === true) {
        z(w, v.id);
        z(w, v.version);
    } else if (v && (v.isMatrix4 === true || v.isMatrix3 === true)) for (const e of v.elements) z(w, e);
    else if (v && v.isColor === true) {
        z(w, v.r);
        z(w, v.g);
        z(w, v.b);
    } else if (v && typeof v.x === "number") {
        z(w, v.x);
        z(w, v.y);
        z(w, v.z === undefined ? 0 : v.z);
        z(w, v.w === undefined ? 0 : v.w);
    } else z(w, v);
};
// DER PROGRAMM-MELDER: die Texturen (6) und die freien Uniforms (9) eines Programms melden sich nicht — der Gang vergleicht sie
// EINMAL je Programm und Render (alle Render-Objekte des Programms binden dieselben Knoten) und meldet den Wechsel am Programm:
// `_anazhTexR` · `_anazhFreiR`, an denen jedes Render-Objekt seinen Verbrauch misst (`_diaetVorTextur`, `_diaetFreiAnders`).
AnazhRealm._diaetProgrammMelder = function (nbs, k) {
    if (k.texturen.length === 0 && k.frei.length === 0) return;
    const w = k.stand || (k.stand = { z: [], i: 0, anders: false });
    w.i = 0;
    w.anders = false;
    for (const n of k.texturen) {
        const t = n.value;
        AnazhRealm._diaetZahl(w, t ? t.id : -1);
        AnazhRealm._diaetZahl(w, t ? t.version : -1);
    }
    if (w.anders) nbs._anazhTexR = AnazhRealm._regt(nbs);
    w.anders = false;
    for (const u of k.frei) AnazhRealm._diaetWert(w, u.getValue());
    if (w.anders) nbs._anazhFreiR = AnazhRealm._regt(nbs);
};
// (11) DER OBJEKT-GANG (E1, Lehre 25): ein Objekt, das sich bewegt (Welt-Matrix), atmet (ein Objekt-Verweis) oder Knochen
// trägt, ändert nur seine EIGENEN Werte — die geteilten stellt der Gang je Render (`_diaetGeteiltSchreiben`). Bis E1 frischte
// es dafür voll auf (Vorher-Knoten, Geometrie, jeder Knoten, jede Gruppe): an Genesis Third je Bild acht Membranen, der Leib
// mit Knochen in Bild und Kaskade, Kopf, Plattform und Sonne. Jetzt stellt es seine Objekt-Knoten und lädt seine eigenen Gruppen.
// NACH EINGANG (E-Diät): es stellt nur die REGUNG und vergleicht je eigenem Uniform-Puffer nur ihre Uniforms — ein Stoff-
// Verweis behält, was sein Objekt zuletzt lud (sein Stoff-Stand (13) gleich), Texturen und Sampler folgen ihrem Wächter (6). VOLL (der
// Textur-Grund, eine Gruppe mit Puffer-Speicher) lädt der Vendor jede Bindung und vergleicht jede Uniform gegen den Wert ihres
// Knotens — darum stellt der volle Gang ALLE Objekt-Knoten (ein Stoff-Verweis trüge sonst den Wert des Render-Objekts, das ihn
// zuletzt stellte). Gemessen am Kopf e93134f4 (Radeon, Genesis Third, Stand, Profil 200 µs): 0,381 ms je Frame.
AnazhRealm._diaetObjektGang = function (rend, ro, k, voll) {
    const nf = rend._nodes.getNodeFrameForRender(ro);
    for (const n of k.eigenVor) nf.updateBeforeNode(n);
    const alle = ro.getBindings();
    if (voll === true || k.objektVoll === true) {
        for (const n of k.objekt) nf.updateNode(n);
        for (const n of k.eigenKnoten) nf.updateNode(n);
        for (const i of k.eigen) rend._bindings._update(alle[i], alle);
        return;
    }
    for (const n of k.regung) nf.updateNode(n);
    for (const n of k.eigenKnoten) nf.updateNode(n);
    for (const i of k.eigen)
        for (const b of alle[i].bindings) {
            if (b.isUniformBuffer !== true) continue;
            // ein Puffer ohne Uniform-Liste (die Knochen-Matrizen, r184 NodeUniformBuffer) lädt wie im Vendor bei jedem Gang
            let neu = !b.uniforms && b.update() === true;
            for (const u of b.uniforms || []) {
                const n = u.nodeUniform && u.nodeUniform.node;
                if (!(n && k.stoffUniform.has(n)) && b.updateByType(u) === true) neu = true;
            }
            if (neu) rend.backend.updateBinding(b);
            if (b.updateRanges.length > 0) b.clearUpdateRanges();
        }
};
// (10) Wechselte ein Objekt-Verweis des Programms seit dem letzten Blick dieses Render-Objekts? Ein Wechsel ist der Wert
// eines Stoffs, kein Bruch: EIN Refresh, kein Melder. Der erste Blick merkt (die Erst-Anlage lud eben hoch).
AnazhRealm._diaetVerweisAnders = function (obs, ro, k) {
    if (k.verweise.length === 0 || !ro.object) return false;
    const d = obs.getRenderObjectData(ro);
    const erst = !d._anazhVerweisW;
    const w = d._anazhVerweisW || (d._anazhVerweisW = { z: [], i: 0, anders: false });
    w.i = 0;
    w.anders = false;
    for (const n of k.verweise) AnazhRealm._diaetWert(w, n.getValueFromReference(ro.object));
    return w.anders && !erst;
};
// (9) DER UNIFORM-WÄCHTER (A1-n1): wechselte eine freie Uniform einer eigenen Gruppe, seit dieses Render-Objekt zuletzt
// verbrauchte? Die Diät lädt nur geteilte Gruppen hoch — eine Objekt-Uniform, die ein Schreiber stellt, fror unter ihr ein
// (D10-n1 die Ansicht des Spiegels, A1-n1 die Wolken-Uhr seines Himmels: Puffer 74,8 gegen Knoten 228,0). Jeder Wechsel lädt die
// eigene Gruppe im Objekt-Gang (11); `_uniformHeimatTeilen` lädt sie EINMAL je Render statt je Objekt. Den Wechsel meldet der
// Programm-Melder (EIN Vergleich je Programm und Render, bis E-Bauart je Render-Objekt und Pass).
AnazhRealm._diaetFreiAnders = function (ro, k) {
    return k.frei.length > 0 && ro.getNodeBuilderState()._anazhFreiR > (ro._anazhR === undefined ? -1 : ro._anazhR);
};
// (6) Wechselte eine Textur des Programms (Id oder Version), seit dieses Render-Objekt zuletzt verbrauchte? Der Programm-Melder
// meldet den Wechsel (bis E-Bauart verglich jedes Render-Objekt jede Textur in jedem Pass).
AnazhRealm._diaetVorTextur = function (ro) {
    return ro.getNodeBuilderState()._anazhTexR > (ro._anazhR === undefined ? -1 : ro._anazhR);
};
AnazhRealm._diaetGeteiltSchreiben = function (rend, ro, rid) {
    const nbs = ro.getNodeBuilderState();
    const k = nbs._anazhGang || (nbs._anazhGang = AnazhRealm._diaetGang(ro, nbs));
    // Die Reihenfolge des Vendors (updateBefore → updateForRender): erst alle Vorher-Knoten, dann die Knoten. Ein
    // Vorher-Knoten kann einen Render verschachteln (der Schatten am ersten Licht-Empfänger), und der stellt den EINEN
    // Node-Frame auf SEINE Kamera und SEIN Objekt — der Frame wird darum wie im Vendor je Vorher-Knoten und nach allen
    // Vorher-Knoten neu gestellt (ein vorher gemerkter Frame zeichnete das Hauptbild mit der Schatten-Kamera:
    // gate:kamera-treue ÄNDERUNG 0,10 statt 1). Der Stempel ist der RENDER-ABSCHNITT (rid, `rend.info.calls`, s. (5)):
    // ein Vorher-Knoten trägt den Abschnitt NACH seinem Ruf (der Render, den er verschachtelt, ist dann vorbei), Knoten
    // und Gruppen den Abschnitt nach allen Vorher-Knoten.
    let nf = null;
    for (const n of k.vor) {
        if (n._anazhVorRid === rid && n._anazhVorRuf === rend.info.calls) continue;
        rend._nodes.getNodeFrameForRender(ro).updateBeforeNode(n);
        n._anazhVorRid = rid;
        n._anazhVorRuf = rend.info.calls;
    }
    for (const n of k.eigenVor) rend._nodes.getNodeFrameForRender(ro).updateBeforeNode(n);
    const ruf = rend.info.calls;
    for (const n of k.knoten) {
        if (n._anazhRid === rid && n._anazhRuf === ruf) continue;
        n._anazhRid = rid;
        n._anazhRuf = ruf;
        (nf || (nf = rend._nodes.getNodeFrameForRender(ro))).updateNode(n);
    }
    if (k.eigenKnoten.length) {
        nf = nf || rend._nodes.getNodeFrameForRender(ro);
        for (const n of k.eigenKnoten) nf.updateNode(n);
    }
    // (12) DER FREMDE VERWEIS (E-Diät, s. (11)): EIN Wert je Render-Abschnitt, gestempelt an seiner geteilten Uniform (jedes
    // Programm trägt seinen eigenen Verweis-Knoten auf dieselbe Uniform) — vor den Gruppen, die sie laden. `_schattenBias` und
    // die Kaskaden-Karten setzen bias · normalBias · mapSize zur Laufzeit: der Wert folgt im nächsten Abschnitt.
    for (const n of k.fremd) {
        const u = n.node;
        if (u._anazhFremdRid === rid && u._anazhFremdRuf === ruf) continue;
        u._anazhFremdRid = rid;
        u._anazhFremdRuf = ruf;
        (nf || (nf = rend._nodes.getNodeFrameForRender(ro))).updateNode(n);
    }
    let alle = null;
    for (const g of k.gruppen) {
        if (g._anazhRid === rid && g._anazhRuf === ruf) continue;
        g._anazhRid = rid;
        g._anazhRuf = ruf;
        rend._bindings._update(g, alle || (alle = ro.getBindings()));
    }
    // DAS REGISTER: der Gang meldet, was sich am Programm ohne Melder änderte (Texturen nach den Vorher-Knoten, freie Uniforms)
    AnazhRealm._diaetProgrammMelder(nbs, k);
};
// (8) GETRAGEN (K71): trägt die GPU die Version dieses Attributs schon? r184 lädt ein Attribut EINMAL je Version für alle
// Render-Objekte (`Attributes.update`: Daten je Attribut-Objekt, `version` die hochgeladene) — hat ein anderer Pass es
// hochgeladen, bringt ein Refresh dieses Render-Objekts nichts Neues zur GPU.
AnazhRealm._diaetGetragen = function (A, a) {
    if (!A || !A.has(a)) return false;
    const v = A.get(a).version;
    return v !== undefined && v >= (a.isInterleavedBufferAttribute ? a.data.version : a.version);
};
// (13) DER STOFF JE RENDER-OBJEKT (E-Diät, Prüfer 19.10.): r184 merkt die Stoff-Daten in equals() je STOFF und Render-Id
// (`getMaterialData`: `_renderId`, `_equal`), nie je Render-Objekt — wer den Render verpasst, in dem ein anderes Render-Objekt
// die Änderung verbrauchte (verdeckt, außerhalb des Passes, eine zweite Sicht), hört danach „gleich“, und sein eigener Puffer
// trägt den alten Wert (am Kopf 783fcdc1: zwei Boxen EINES Stoffs, B verdeckt beim Farbwechsel; ein stehendes Objekt schon an
// e93134f4). Die Wahrheit sind Render-Ids: der Stoff merkt den Render seines letzten Verbrauchs (`_anazhStoffR` — `vorR`, die
// Render-Id seiner Daten vor dem Vendor, wechselte und `_equal` steht falsch), das Render-Objekt den Render JEDES Voll-Refreshs
// (`_anazhVollR`, jeder Ausgang der Diät). Verpasst ist nur, wer den Stoff LIEST (`stoffLiest`, der Schatten-Pass nie) und
// zuletzt vor dem Verbrauch voll frischte — ein Voll-Refresh im Render des Verbrauchs las den neuen Wert schon. Der Stempel
// steht am STOFF, nie in seinen Daten: equals() geht jeden Schlüssel der Daten durch und bricht an einem fremden (r184 liest
// `material[k].isTexture` — am Kopf c7225684 warf jeder Render eines Stoffs nach seinem ersten Wechsel, `_callDepth` wuchs).
AnazhRealm._diaetStoffVerpasst = function (od, stoff, md, vorR, rid, liest, v) {
    if (rid === undefined) return v;
    // der Verbrauch ist die Regung des Stoffs (das Register): jedes ruhende Render-Objekt des Stoffs prüft danach voll
    if (md && md._renderId !== vorR && md._equal === false) {
        stoff._anazhStoffR = rid;
        AnazhRealm._regt(stoff);
    }
    if (!v && liest && stoff && stoff._anazhStoffR > (od._anazhVollR === undefined ? -1 : od._anazhVollR)) v = true;
    if (v) od._anazhVollR = rid;
    return v;
};
AnazhRealm._diaetRefresh = function (obs, ro, frame, altNR) {
    const obj = ro && ro.object;
    const rend = frame && frame.renderer;
    // DAS TOR DES REGISTERS: ein Render-Objekt mit Stand geht zuerst den Gang seines Programms (die geteilten Gruppen des
    // Render-Abschnitts, der Programm-Melder) und ruht, wenn keine seiner Quellen sich meldete (`_diaetRuhig`); sonst die volle
    // Prüfung (unten, unverändert der EINE Pfad)
    if (rend && ro._anazhObs === obs) {
        const rid = frame.renderId;
        if (obs.renderId !== rid) {
            obs.renderId = rid;
            AnazhRealm._diaetGeteiltSchreiben(rend, ro, rid);
        }
        if (AnazhRealm._diaetRuhig(obs, ro, rend, rid)) return false;
    }
    // (8) eine neue VERSION desselben Attributs (Id gleich) ist ein Refresh-Grund nur, solange die GPU sie nicht trägt: der
    // erste Pass, der sie sieht, lädt sie hoch, jeder weitere frischte bis K71 voll auf und lud nichts (an Genesis Third in
    // Ruhe die Kaskaden-Zeichner der @wahl-Senken nach jedem Tausch ihres Hauptbilds, jeder Satz nach dem Index-Schreiben
    // eines anderen Passes). Eine neue Id (ein gewachsener Puffer) bleibt ein Grund für jedes Render-Objekt.
    const A = rend ? rend._attributes : null;
    // Die Wächter vergleichen Zahlen am EINEN Daten-Satz des Render-Objekts — eine Prüfung ohne Änderung legt nichts an
    // (vorher je Prüfung zwei Versions-Zeichenketten: Instanz und Atlas). Eine Senke zeichnet über ihren Zeichner (1410-1):
    // ihre Instanz-Puffer sind die der Senke.
    // Beide Wächter merken jeden Blick, bevor einer den Refresh meldet: ein Instanz-Grund, der vor dem Geometrie-Wächter
    // zurückkehrte, ließ dessen Stempel stehen — jedes neue Instanz-Objekt frischte im Render danach ein zweites Mal auf.
    const senke = obj && obj.isInstanzZeichner === true ? obj.__instanzQuelle : obj;
    let d = null,
        grund = false;
    if (senke && senke.isInstancedMesh === true) {
        const im = senke.instanceMatrix,
            ic = senke.instanceColor;
        const iId = im ? im.id : -1,
            iV = im ? im.version : -1,
            cId = ic ? ic.id : -1,
            cV = ic ? ic.version : -1;
        d = obs.getRenderObjectData(ro);
        if (d._anazhIId !== iId || d._anazhIV !== iV || d._anazhICId !== cId || d._anazhICV !== cV) {
            grund =
                d._anazhIId !== iId ||
                d._anazhICId !== cId ||
                (d._anazhIV !== iV && !AnazhRealm._diaetGetragen(A, im)) ||
                (d._anazhICV !== cV && !AnazhRealm._diaetGetragen(A, ic));
            d._anazhIId = iId;
            d._anazhIV = iV;
            d._anazhICId = cId;
            d._anazhICV = cV;
        }
    }
    // DER GEOMETRIE-WÄCHTER JE RENDER-OBJEKT (Welle 6): der Vendor merkt Attribut-Versionen je GEOMETRIE, nicht je
    // Render-Objekt — der erste Pass, der eine Änderung sieht (die Kaskade), verbraucht sie, und ein Pass, der ein Attribut
    // allein liest (die Normale im Hauptbild), lädt es nie hoch. Gemessen am werfenden Bau-Satz (echte GPU, Dorf der
    // Mess-Wiese): nach dem Wachsen trug die Normale keinen GPU-Puffer, das Hauptbild-Kommando-Paket war ungültig
    // („Vertex buffer slot 5 … was not set"). Geometrie-Id, Index und jedes Attribut (Id · Version) je Render-Objekt.
    const geo = ro && ro.geometry;
    if (geo && geo.attributes) {
        if (d === null) d = obs.getRenderObjectData(ro);
        const g = d._anazhGeoV || (d._anazhGeoV = []);
        const ix = geo.index;
        let anders =
            g[0] !== geo.id ||
            g[1] !== (ix ? ix.id : -1) ||
            (g[2] !== (ix ? ix.version : -1) && !(ix && AnazhRealm._diaetGetragen(A, ix)));
        g[0] = geo.id;
        g[1] = ix ? ix.id : -1;
        g[2] = ix ? ix.version : -1;
        let i = 3;
        for (const k in geo.attributes) {
            const a = geo.attributes[k];
            if (g[i] !== a.id || g[i + 1] !== a.version) {
                if (g[i] !== a.id || !AnazhRealm._diaetGetragen(A, a)) anders = true;
                g[i] = a.id;
                g[i + 1] = a.version;
            }
            i += 2;
        }
        if (g.length !== i) {
            g.length = i;
            anders = true;
        }
        if (anders || grund) {
            AnazhRealm._diaetStand(obs, ro, d, ro.material ? obs.getMaterialData(ro.material) : null);
            return AnazhRealm._diaetStoffVerpasst(d, null, null, null, frame && frame.renderId, false, true);
        }
        // (7) DER WÄCHTER IST DIE GEOMETRIE-PRÜFUNG (K71): der Vendor prüft sie in equals() ein zweites Mal, je Geometrie und
        // Render (Id je Objekt, Attribute, Index, drawRange) — die Diät stellt seine Daten als geprüft. Der Ausschnitt ist ein
        // Draw-Parameter (r184 liest `geometry.drawRange` bei jedem Draw), kein Grund für einen Refresh: jeder Satz zeichnet je
        // Pass seinen Abschnitt, und der Vendor-Vergleich frischte jeden Satz in jedem Render voll auf; eine Attribut-Änderung,
        // die der Wächter schon trug, frischte im nächsten Render ein zweites Mal auf.
        d.geometryId = geo.id;
        if (frame) {
            const gd = obs.getGeometryData(geo);
            gd._renderId = frame.renderId;
            gd._equal = true;
        }
    }
    const md = ro && ro.material ? obs.getMaterialData(ro.material) : null;
    if (grund) {
        AnazhRealm._diaetStand(obs, ro, d, md);
        return AnazhRealm._diaetStoffVerpasst(d, null, null, null, frame && frame.renderId, false, true);
    }
    if (
        !rend ||
        !obs.renderObjects.has(ro) ||
        obs.needsVelocity(rend) ||
        ro.getNodeBuilderState().updateAfterNodes.length > 0
    ) {
        const vorR = md && md._renderId;
        const alt = altNR.call(obs, ro, frame);
        const od = obs.getRenderObjectData(ro);
        const v = AnazhRealm._diaetStoffVerpasst(od, ro && ro.material, md, vorR, frame && frame.renderId, true, alt);
        // die Vendor-Bahn trägt keinen Stand; ihr voller Refresh verbraucht alles (die Felder in der Reihenfolge des Stands:
        // EINE Form je Render-Objekt für das Tor)
        ro._anazhR = v ? AnazhRealm._regungN : ro._anazhR === undefined ? -1 : ro._anazhR;
        ro._anazhObs = null;
        return v;
    }
    const rid = frame.renderId;
    if (obs.renderId !== rid) {
        obs.renderId = rid;
        AnazhRealm._diaetGeteiltSchreiben(rend, ro, rid);
    }
    // (6) NACH dem Gang: der Zug des ersten Render-Objekts kann die Textur eben neu angelegt haben — die Bindung folgt ihr im
    // Objekt-Gang (11, `Bindings._update`: Hochladen, neue Generation → neue Bindegruppe), geteilte Gruppen im Gang je Render
    const textur = AnazhRealm._diaetVorTextur(ro);
    const nbs = ro.getNodeBuilderState();
    const gang = nbs._anazhGang || (nbs._anazhGang = AnazhRealm._diaetGang(ro, nbs));
    // (10) ein Objekt-Verweis wechselte seinen Wert (der Stoff-Wert eines atmenden Stoffs): der Objekt-Gang (11) stellt ihn
    const verweis = AnazhRealm._diaetVerweisAnders(obs, ro, gang);
    // (9) eine freie Uniform der eigenen Gruppen wechselte (ein Schreiber setzte `.value`): ein Objekt-Wert wie die Lage —
    // der Objekt-Gang (11) lädt die eigene Gruppe, die ihn trägt (bis E1-n1 ein Voll-Refresh und ein Bruch je Wechsel)
    const frei = AnazhRealm._diaetFreiAnders(ro, gang);
    // (11) DIE LAGE vor equals(): eine neue Welt-Matrix ist ein Objekt-Wert (der Objekt-Gang), kein Grund für den vollen
    // Gang; jede andere Änderung (Stoff · Geometrie · Morph · Lichter), die equals() danach sieht, bleibt einer.
    const od = obs.getRenderObjectData(ro);
    let lage = false;
    if (obj && od.worldMatrix.equals(obj.matrixWorld) !== true) {
        od.worldMatrix.copy(obj.matrixWorld);
        lage = true;
    }
    const vorR = md && md._renderId;
    const anders = obs.equals(ro, obs.getLights(ro.lightsNode, rid), rid) !== true;
    const v = AnazhRealm._diaetStoffVerpasst(od, ro.material, md, vorR, rid, gang.stoffLiest, anders);
    AnazhRealm._diaetStand(obs, ro, od, md);
    if (v) return true;
    if (lage || verweis || textur || frei || obs.hasAnimation === true)
        AnazhRealm._diaetObjektGang(rend, ro, gang, textur);
    return false;
};
