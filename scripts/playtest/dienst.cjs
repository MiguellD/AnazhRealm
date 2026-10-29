"use strict";
// scripts/playtest/dienst.cjs — der Richter von Dienst (spec/stamm/modul-karte.json): Log · Journal · Melder · Takt-Budgets · Entsorgung · die Dienste, die jeder ruft.
// 2 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const SK = require("../lib/shader-kosten.cjs");
const stammLib = require("../lib/stamm.cjs");
const { safeEvaluate } = require("../playtest.cjs");

// W3 UI-Puls: dirty(raum) → EINE rAF-gebündelte Render-Insel pro Raum. Das Organ `_uiDirty` dedupt
// (Set + ein rAF) → Doppel-Render/Stale durch hand-verdrahtete Render-Aufrufe strukturell unmöglich.
async function checkBandW3UiPuls({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) das Organ + die Registry existieren.
        const reg = r._uiRoomRegistry();
        out.registryRooms = !!reg && !!reg.ich && !!reg.hof;
        // (3) DEDUP: zwei dirty-Rufe in einem Frame → EIN Puls (Set dedupt).
        r._uiPulseQueued = false;
        r._uiDirtyRooms = new Set();
        r._uiDirty("hof");
        r._uiDirty("hof");
        r._uiDirty("hof");
        out.dedup = r._uiPulseQueued === true && r._uiDirtyRooms.size === 1;
        // (4) MIGRATION am Ruf: die Mechanik-Pfade des Hofs (Auftrag · Ausrüstung · Schaden · Abschied) melden den Puls, an
        // einem eigenen Probe-Tier fern der Welt-Tiere.
        const cap = r.state.maxCreatures;
        const pm = r.state.playerMesh.position;
        r.state.maxCreatures = r.state.creatures.length + 16;
        const c = r.spawnCreatureAt(pm.x + 240, pm.y, pm.z + 240, "happy", "wesen");
        const puls = (m, a) => !!c && window.__consumes(r, m, r, "_uiDirty", a);
        out.hofPfade = [
            puls("assignCreatureTask", [c, "wait", {}, { silent: true }]),
            puls("_afterCreatureEquipChange", [c]),
            puls("damageCreature", [c, 0.01]),
            puls("removeCreature", [c]),
        ];
        r.state.maxCreatures = cap;
        // (6) der ON-OPEN-Render im Hof-Hook am Ruf (so darf die Insel isOpen-skippen); die Bühne ruht für die Probe.
        const eigenS = Object.prototype.hasOwnProperty.call(r, "_hofEnsureStage");
        const altS = r._hofEnsureStage;
        r._hofEnsureStage = () => null;
        try {
            out.hofOnOpen = window.__consumes(r, "_hofHandleDrawerChange", r, "_renderCreatureListUI", ["kreaturen"]);
        } finally {
            if (eigenS) r._hofEnsureStage = altS;
            else delete r._hofEnsureStage;
        }
        out.hofSkipsWhenClosed = !!reg.hof.isOpen && typeof reg.hof.isOpen === "function";
        return out;
    });
    // (4b) die Absenz über den EINEN Helfer: die direkte Aufruf-Krankheit der Mechanik-Pfade ist tot (sie melden
    // `_uiDirty("hof")`, s. hofPfade am Ruf); die Hof-UI selbst rendert ihre Liste weiter direkt.
    const srcOk = stammLib.fehlt(null, /if \(typeof this\._renderCreatureListUI === "function"\) this\._renderCreatureListUI\(\);/);
    check("W3 UI-Puls: das EINE Organ trägt die Räume ich/hof", res.registryRooms);
    check(
        "W3 UI-Puls: DEDUP — drei dirty-Rufe in einem Frame → EIN Puls, EIN Raum (Set dedupt; die Boost-Doppel-Krankheit strukturell tot)",
        res.dedup
    );
    check(
        `W3 UI-Puls: die Hof-Mechanik-Pfade (Auftrag · Ausrüstung · Schaden · Abschied) melden den Puls am Ruf (${JSON.stringify(res.hofPfade)}) + kein direkter _renderCreatureListUI-Mechanik-Aufruf mehr (Grep-Wand)`,
        srcOk && Array.isArray(res.hofPfade) && res.hofPfade.every(Boolean)
    );
    check(
        "W3 UI-Puls: der Hof rendert On-Open (isOpen-Skip sicher)",
        res.hofOnOpen && res.hofSkipsWhenClosed
    );
}

// Die Stellvertreter-Wand — eingefaltet aus gate:feld-stellvertreter: der Feld-Pass zeichnet keinen Vollbild-Draw
// mit Fragment-Tiefe und Discard. Die Heilung im Pass (`_feldPassEnsure`): MARCH je Satz ein
// Stellvertreter (Rückseiten seiner Hülle, EIN instanzierter Draw), PANORAMA ein Vollbild-Dreieck ohne Fragment-Tiefe. Die ECHTEN
// Organ-Methoden: O1/O2 die Obergrenze folgt dem höchsten belegten Slot, freie Slots kehren zurück · T1 der Takt aus EINER Matrix ·
// K1 der March-Draw · K2 das statische Budget je Fragment (`wgslKosten`); Selbsttests S1 (Panorama mit Tiefe) und S2 (ohne Nachzug).
async function checkBandFeldStellvertreter({ page, check }) {
    const budget = function budget(texte) {
        const code = texte.join("\n");
        const k = SK.wgslKosten(texte.map((t, i) => (i === 0 ? t.replace(/\bfn\s+/, "@fragment fn ") : t)).join("\n"));
        if (!k.einstieg) throw new Error("K2: kein Einstieg im WGSL des Draws (die Linse ist blind)");
        return {
            schleifen: k.schleifen,
            abtastungen: k.abtastungen.gesamt,
            seitenSchleife: /for \(var (pi|q|pk): i32/.test(code),
            einSatz: /let j = i32\(i \/ \d+u\);/.test(code),
            funktionen: texte.length,
        };
    };
    const mitBudget = (a) => Object.assign(a, { budgetPano: budget(a.wgslPano), budgetMarch: budget(a.wgslMarch) });
    const probe = function probe(modus) {
        const T = window.THREE;
        const W = r.constructor.WELT_MARCH;
        if (r.state.feldPass) r._feldPassDispose();
        r.state.weltMarch = null;
        const wm = r._weltMarchEnsure();
        if (modus === "ohneNachzug") {
            // S2: die Freigabe ohne Nachzug (die Obergrenze bleibt der Hochwasser-Stand)
            const P = Object.getPrototypeOf(r);
            const echt = P._weltFeldFrei;
            r._weltFeldFrei = function (h) {
                const o = wm.obergrenze;
                echt.call(this, h);
                wm.obergrenze = o;
            };
        }
        let s = 12345;
        const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        const box = () => [{ box: true, c: new T.Vector3(1, 2, 1), h: new T.Vector3(1, 2, 1) }];
        const M = new T.Matrix4();
        const handles = [];
        for (let i = 0; i < 300; i++) {
            M.makeTranslation((rnd() - 0.5) * 600, rnd() * 20, (rnd() - 0.5) * 600);
            handles.push(r._weltKapselSpawn("stellv-probe:kiste", M, box));
        }
        for (let i = 0; i < handles.length; i += 7) r._weltFeldFrei(handles[i]); // Lücken wie im Spiel
        for (let i = 250; i < handles.length; i++) if (i % 7 !== 0) r._weltFeldFrei(handles[i]); // die obersten fallen
        let hoechster = -1;
        for (let f = 0; f < W.felder; f++) if (wm.handles[f]) hoechster = f;
        const grenzeNachFrei = wm.obergrenze;
        // O2: ein neuer Eintrag nimmt einen freien Slot, die Obergrenze trägt ihn
        M.makeTranslation(5, 0, 5);
        const neu = r._weltKapselSpawn("stellv-probe:kiste", M, box);
        const belegt = new Set();
        let doppelt = 0;
        for (let f = 0; f < W.felder; f++) {
            const h = wm.handles[f];
            if (!h) continue;
            if (belegt.has(h)) doppelt++;
            belegt.add(h);
            if (h.feld !== f) doppelt++;
        }
        if (modus === "ohneNachzug") delete r._weltFeldFrei;
        // Der Pass unter dem Linsen-Seam (der Null-Renderer zeichnet nie; die Knoten entstehen GPU-frei)
        const hookAlt = window.__anazhFernRing;
        window.__anazhFernRing = true;
        let fp = null;
        try {
            fp = r._feldPassEnsure(r.state.fernRing || { anchorX: null, anchorZ: null });
        } finally {
            if (hookAlt === undefined) delete window.__anazhFernRing;
            else window.__anazhFernRing = hookAlt;
        }
        if (!fp) return { fehler: "kein Feld-Pass" };
        if (modus === "panoTiefe") fp.mat.depthNode = window.THREE.TSL.float(0.999999); // S1
        // T1: der Takt (Anker gleich → kein Anstrich; sichtbar → Kamera-Uniforms + Instanzen)
        fp.mesh.visible = true;
        fp.march.visible = true;
        const cam = r.state.camera;
        // BÜHNE: die Kamera vor dem gestellten Stellvertreter (Anordnung, nicht das Gelände)
        cam.position.set(12, 30, -40);
        cam.lookAt(0, 0, 0);
        cam.updateMatrixWorld(true);
        r._tickFeldPass({ anchorX: fp.anchorX, anchorZ: fp.anchorZ });
        const vp = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        const ident = new T.Matrix4().multiplyMatrices(fp.U.vp.value, fp.U.invVP.value);
        let abwVp = 0,
            abwIdent = 0;
        for (let i = 0; i < 16; i++) {
            abwVp = Math.max(abwVp, Math.abs(fp.U.vp.value.elements[i] - vp.elements[i]));
            abwIdent = Math.max(abwIdent, Math.abs(ident.elements[i] - (i % 5 === 0 ? 1 : 0)));
        }
        // K2: der WGSL-Text der Draws (die Funktion samt Includes, `fp.wgsl`) — das statische Budget je Fragment
        const wgsl = (fn) => {
            const texte = [];
            const lauf = (n) => {
                if (!n || typeof n.code !== "string" || texte.includes(n.code)) return;
                texte.push(n.code);
                for (const inc of n.includes || []) lauf(inc);
            };
            lauf(fn && fn.functionNode);
            return texte;
        };
        const panoTexte = wgsl(fp.wgsl.panorama);
        const marchTexte = wgsl(fp.wgsl.march);
        const vertexTexte = wgsl(fp.wgsl.stellvertreter);
        return {
            hoechster,
            grenzeNachFrei,
            neuFeld: neu ? neu.feld : -1,
            grenzeNeu: wm.obergrenze,
            doppelt,
            instanzen: fp.march.geometry.instanceCount,
            plaetze: W.gesetzBlock,
            abwVp,
            abwIdent,
            march: {
                instanziert: fp.march.geometry.isInstancedBufferGeometry === true,
                rueckseite: fp.matMarch.side === T.BackSide,
                tiefe: fp.matMarch.depthNode != null,
                vertex:
                    vertexTexte.some((t) => /fn feldStellvertreter\(i: u32/.test(t)) &&
                    !!fp.matMarch.vertexNode &&
                    fp.matMarch.vertexNode.functionNode === fp.wgsl.stellvertreter.functionNode,
                reihe: fp.march.renderOrder < fp.mesh.renderOrder,
                inventar: fp.march.userData.inventar === "feld-pass" && fp.mesh.userData.inventar === "feld-pass",
            },
            pano: { tiefe: fp.mat.depthNode != null, z: fp.mat.vertexNode != null },
            wgslPano: panoTexte,
            wgslMarch: marchTexte,
        };
    };
    const urteilO1 = (a) => a.grenzeNachFrei === a.hoechster + 1;
    const urteilK2 = (a) => !a.pano.tiefe && a.budgetPano.schleifen === 0 && a.budgetPano.abtastungen <= 4 && a.budgetMarch.schleifen <= 4 && !a.budgetMarch.seitenSchleife && a.budgetMarch.einSatz;
    const a = await safeEvaluate(page, probe, "echt");
    if (!a || a.fehler) return check("Feld-Stellvertreter: die Probe antwortet", false, a ? a.fehler : "keine Antwort der Seite");
    mitBudget(a);
    check(
        "Feld-Stellvertreter O1/O2: die Obergrenze folgt dem höchsten belegten Slot, ein freier Slot kehrt zurück, kein Slot doppelt",
        urteilO1(a) && a.neuFeld >= 0 && a.grenzeNeu >= a.neuFeld + 1 && a.doppelt === 0,
        `Obergrenze ${a.grenzeNachFrei}, höchster Slot ${a.hoechster}, neu ${a.neuFeld} → ${a.grenzeNeu}`
    );
    check(
        "Feld-Stellvertreter T1: Instanzen = Obergrenze × Plätze, Raster und Strahl aus EINER Matrix",
        a.instanzen === a.grenzeNeu * a.plaetze && a.abwVp < 1e-9 && a.abwIdent < 1e-4,
        `${a.instanzen} Instanzen (${a.grenzeNeu} × ${a.plaetze}), |vp − Kamera| ${a.abwVp.toExponential(1)}, |vp·invVP − I| ${a.abwIdent.toExponential(1)}`
    );
    const m = a.march;
    check("Feld-Stellvertreter K1: der March-Draw instanziert, Rückseiten, Stellvertreter-Vertex, Fragment-Tiefe, vor dem Panorama", m.instanziert && m.rueckseite && m.vertex && m.tiefe && m.reihe && m.inventar, JSON.stringify(m));
    check(
        "Feld-Stellvertreter K2: Panorama ohne Schleife und Fragment-Tiefe, March EIN Satz ohne Seiten-Schleife",
        urteilK2(a),
        `Panorama ${a.budgetPano.schleifen} Schleifen · ${a.budgetPano.abtastungen} Abtastung · Tiefe ${a.pano.tiefe}; March ${a.budgetMarch.schleifen} Schleifen · ein Satz ${a.budgetMarch.einSatz}`
    );
    const s1 = await safeEvaluate(page, probe, "panoTiefe");
    const s2 = await safeEvaluate(page, probe, "ohneNachzug");
    check("Feld-Stellvertreter SELBSTTEST: ein Panorama mit Fragment-Tiefe bricht K2, eine Obergrenze ohne Nachzug bricht O1", !!s1 && !!s2 && !urteilK2(mitBudget(s1)) && !urteilO1(s2), s2 ? `Obergrenze ${s2.grenzeNachFrei}, höchster Slot ${s2.hoechster}` : "");
}

module.exports = {
    checkBandW3UiPuls, checkBandFeldStellvertreter,
};
