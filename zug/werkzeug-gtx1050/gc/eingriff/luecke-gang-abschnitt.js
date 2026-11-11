// Messung ohne Eingriff — DIE LÜCKE AM BILD, je Bild gezählt und unabhängig vom Spiel: welcher Bürger der Welt-Szene wollte in
// DIESEM Bild zeichnen (ein Ruf der Erst-Zeichnung `_renderObjectDirect` mit Zug-Parametern) und zeichnete nicht (kein Zug des
// Backends, `backend.draw`)? Getrennt nach Hauptbild und Wurf (jede andere Kamera). Ein Bündel, das ohne einen Bürger versiegelte,
// spielt ohne Ruf ab: seine Fehlenden gelten in jedem Bild, in dem es läuft, bis es neu aufnimmt (`_renderBundle`).
// Gemerkt: jede Änderung der Fehlenden [ms, Hauptbild, Wurf], der Stand im Task des ersten Weltbilds (`amBild`), je Name sein
// erster Zug im Hauptbild danach (`nach`) und das erste Bild ab dem Weltbild, in dem im Hauptbild keiner fehlte (`ganz`) bzw.
// auch im Wurf keiner (`ganzWurf`). Mit karte-bild.js dahinter kommen die Bilder der Leinwand dazu.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const B = (X.luecke = { verlauf: [], amBild: null, nach: {}, ganz: null, ganzWurf: null, zuege: 0, bilder: 0, fehler: "" });
    const wer = (o, m) => {
        let n;
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            n = "Arena[" + o.glieder.slice(0, 3).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 3 ? ", … " + o.glieder.length : "") + "]";
        else {
            const k = [];
            for (let x = o; x && k.length < 2; x = x.parent) k.push(x.name || x.type);
            const ud = Object.keys(o.userData || {}).slice(0, 4).join(",");
            n = k.join(" < ") + (o.userData && o.userData.archInstanceKey ? " {" + o.userData.archInstanceKey + "}" : ud ? " {" + ud + "}" : "") + (o.geometry && o.geometry.name ? " geo:" + o.geometry.name : "");
        }
        return n + " ¦ " + ((m && (m.name || m.type)) || "?") + "_" + (m ? m.id : "?");
    };
    let versucht = new Map(); // Schlüssel (Objekt-id|Art) → [Name, Art, Bündel der Aufnahme oder null]
    let gezogen = new Set();
    let gelaufen = new Set(); // die Bündel (je Kamera), die in diesem Bild liefen
    const jeBuendel = new WeakMap(); // Bündel → Map(Schlüssel → [Name, Art]): seine Fehlenden seit der letzten Aufnahme
    let gehakt = false;
    let fehltAmBild = null;
    let zuletzt = "";
    const haken = (r) => {
        const rend = r.state.renderer;
        if (!rend || rend._isHeadlessNull || typeof rend._renderObjectDirect !== "function" || !rend.backend) return false;
        const art = (kam) => (kam === r.state.camera ? "haupt" : "wurf");
        const R0 = rend._renderObjectDirect;
        rend._renderObjectDirect = function (object, material, scene, camera, lightsNode, group, clip, passId) {
            const aus = R0.call(this, object, material, scene, camera, lightsNode, group, clip, passId);
            try {
                // ein Gast des Vorbaus will nichts zeichnen, er baut nur — Gast ist nur, wer die Prägung trägt UND keinen Raum nimmt (Maßstab 0)
                if (scene === r.state.scene && !(object.__vorbauGast && object.matrixWorld.determinant() === 0)) {
                    const ro = this._objects.get(object, material, scene, camera, lightsNode, this._currentRenderContext, clip, passId);
                    if (ro.getDrawParameters() !== null) {
                        const a = art(camera);
                        versucht.set(object.id + "|" + a, [wer(object, object.material), a, this._currentRenderBundle || null]);
                    }
                }
            } catch (err) {
                B.fehler = "Ruf: " + String(err.message);
            }
            return aus;
        };
        const be = rend.backend;
        const D0 = be.draw;
        be.draw = function (ro, info) {
            try {
                gezogen.add(ro.object.id + "|" + art(ro.camera));
                B.zuege++;
            } catch (err) {
                B.fehler = "Zug: " + String(err.message);
            }
            return D0.call(this, ro, info);
        };
        const N0 = rend._renderBundle;
        rend._renderBundle = function (bundle, sceneRef, lightsNode) {
            try {
                const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
                const daten = this.backend.get(rb);
                const abspiel = daten.bundleGPU !== undefined && bundle.bundleGroup.version === daten.version;
                if (!abspiel) jeBuendel.set(rb, new Map()); // es nimmt neu auf: seine Fehlenden zählt diese Aufnahme
                gelaufen.add(rb);
            } catch (err) {
                B.fehler = "Bündel: " + String(err.message);
            }
            return N0.call(this, bundle, sceneRef, lightsNode);
        };
        return true;
    };
    const K0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (direkt) {
        const aus = K0.call(this, direkt);
        try {
            if (!gehakt) gehakt = haken(this);
            else {
                B.bilder++;
                const fehlt = { haupt: [], wurf: [] };
                const da = { haupt: new Set(), wurf: new Set() };
                for (const [k, [name, a, rb]] of versucht) {
                    const zog = gezogen.has(k);
                    if (zog) da[a].add(name);
                    if (rb) {
                        const m = jeBuendel.get(rb);
                        if (m) zog ? m.delete(k) : m.set(k, [name, a]);
                    } else if (!zog) fehlt[a].push(name);
                }
                for (const rb of gelaufen) for (const [name, a] of (jeBuendel.get(rb) || new Map()).values()) fehlt[a].push(name);
                fehlt.haupt.sort();
                fehlt.wurf.sort();
                if (fehltAmBild) {
                    for (const name of da.haupt)
                        if (fehltAmBild[name] === true) {
                            fehltAmBild[name] = false;
                            B.nach[name] = Math.round(performance.now());
                        }
                    if (B.ganz == null && !fehlt.haupt.length) B.ganz = Math.round(performance.now());
                    if (B.ganzWurf == null && !fehlt.haupt.length && !fehlt.wurf.length) B.ganzWurf = Math.round(performance.now());
                }
                B.jetzt = fehlt;
                const sig = fehlt.haupt.join(" ║ ") + " ┃ " + fehlt.wurf.join(" ║ ");
                if (sig !== zuletzt && B.verlauf.length < 400) {
                    zuletzt = sig;
                    B.verlauf.push([Math.round(performance.now()), fehlt.haupt, fehlt.wurf]);
                }
            }
            versucht = new Map();
            gezogen = new Set();
            gelaufen = new Set();
        } catch (err) {
            B.fehler = String(err.message);
        }
        return aus;
    };
    const W0 = P._weltbildSteht;
    P._weltbildSteht = function () {
        const aus = W0.call(this);
        try {
            const f = B.jetzt || { haupt: [], wurf: [] };
            const t = Math.round(performance.now());
            B.amBild = [t, f.haupt.slice(), f.wurf.slice()];
            fehltAmBild = {};
            for (const n of f.haupt) fehltAmBild[n] = true;
            if (!f.haupt.length) B.ganz = t;
            if (!f.haupt.length && !f.wurf.length) B.ganzWurf = t;
        } catch (err) {
            B.fehler = String(err.message);
        }
        return aus;
    };
}
// Messung ohne Eingriff — DER BAU IM GANG: jeder Knoten-Bau der Erst-Zeichnung in Raten (`_knotenRate`) je Render-Objekt — erster
// Ruf, fertig, Zahl der Rufe, die Zeit IM Ruf (Haupt-Faden), dazu Objekt (eine Arena nennt ihre Glieder), Stoff, Hauptbild oder
// Wurf, die Kennung des Render-Kontexts, der Bau-Schlüssel des Objekts (`getForRenderCacheKey`) und das Licht des Wurf-Passes
// (r184 nennt die Szene im Schatten-Pass „Shadow Map [ … ]“). Dazu jeder Ruf der Warteschlange (`_erstWartet`) mit Pipeline:
// [ms, Etikett, Objekt, Art]. Der Leser gang-lesen.cjs zeigt, was NACH dem ersten Weltbild neu entsteht, wie oft, und was es kostet.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const G = (X.gang = { bau: [], warte: [], fehler: "" });
    const wer = (o) => {
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            return "Arena[" + o.glieder.slice(0, 3).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 3 ? ", … " + o.glieder.length : "") + "]";
        const eltern = o.parent && o.parent.name && !/^Shadow Map/.test(o.parent.name) ? " < " + o.parent.name : "";
        return (o.name || (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.type) + eltern;
    };
    // die Szene des Render-Objekts beim Namen: der Wurf-Pass der Welt („Shadow Map [ … ]“), die Bühne der Karte mit ihrem Versuch,
    // eine andere Bühne, sonst nichts (die Welt-Szene)
    const szene = (ro) => {
        const r = window.anazhRealm;
        const s = ro.scene;
        if (!s || !r) return "";
        if (/^Shadow Map/.test(s.name || "")) return s.name;
        if (s === r.state.scene) return "";
        const B = r._karteBuehneSatz;
        if (B && s === B.szene) return "Karten-Bühne " + (B.versuch || "") + " " + String((B.zelle && B.zelle.key) || B.schluessel || "");
        return "Szene " + (s.name || s.uuid.slice(0, 6)) + (s === r._buehneJetzt ? " (Bühne)" : "");
    };
    const je = new WeakMap();
    const K0 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        const t = performance.now();
        const r = K0.call(this, N, ro, E);
        const dt = performance.now() - t;
        try {
            let e = je.get(ro);
            if (!e) {
                const [m, o] = [ro.material || {}, ro.object || {}];
                let schl = "";
                try {
                    schl = String(N.getForRenderCacheKey(ro)).slice(0, 24);
                } catch (err) {
                    schl = "?";
                }
                e = [Math.round(t), null, 0, 0, wer(o), (m.name || m.type || "?") + "_" + m.id, ro.camera === this.state.camera ? "haupt" : "wurf", (ro.context && ro.context.id) ?? "?", schl, szene(ro)];
                je.set(ro, e);
                if (G.bau.length < 1500) G.bau.push(e);
            }
            e[2]++;
            e[3] = Math.round((e[3] + dt) * 100) / 100;
            if (r && e[1] == null) e[1] = Math.round(performance.now());
        } catch (err) {
            G.fehler = "Bau: " + String(err.message);
        }
        return r;
    };
    const W0 = P._erstWartet;
    P._erstWartet = function (be, pipe, bg, buerger) {
        try {
            if (pipe && this.state._weltbildDa && G.warte.length < 800) {
                const E = this._erstZeichnung;
                const ro = buerger || null;
                G.warte.push([Math.round(performance.now()), String((E && E.namen.get(pipe)) || "?").replace("renderPipeline_", ""), ro ? wer(ro.object) : "(Vorbau ohne Zug)", ro ? (ro.camera === this.state.camera ? "haupt" : "wurf") : "", ro ? szene(ro) : ""]);
            }
        } catch (err) {
            G.fehler = "Warte: " + String(err.message);
        }
        return W0.call(this, be, pipe, bg, buerger);
    };
}
// Messung ohne Eingriff — WER TRÄGT EINE LANGE AUFGABE? (Fund 9610f42d: in 6 von 59 Zweit-Boots eines frischen Profils hielt EINE
// Aufgabe den Haupt-Faden 3,3–3,5 s; 22 Boots mit dem vollen Ruf-Profil FREI_INIT fingen sie nie.) Billig genug für JEDEN Lauf:
//  (1) die Abschnitte des Takts und der Ankunft beim Namen — eine feste Liste von Gliedern, jeder Ruf ≥ 150 ms als
//      [Name, ab ms, Dauer ms, Tiefe] in `extra.abschnitt.ruf` (bis zum ersten Weltbild + 2 s);
//  (2) das Urteil des Browsers selbst — jeder lange Bild-Rahmen ≥ 1 s (`long-animation-frame`): Dauer, davon blockiert, Stil und
//      Layout, je Skript Aufrufer · Funktion · Datei · Dauer · Pause · erzwungenes Layout (`extra.abschnitt.rahmen`). Trägt der
//      Rahmen 3 s und seine Skripte nicht, ist es kein Rahmen des Spiels (Layout, Schrift von der Platte, Fremd-Last);
//  (3) jeder Bruch über den EINEN Melder mit seiner Zeit (`extra.abschnitt.bruch`: ein Guss im Haupt-Faden nennt sich dort selbst).
// Leser: abschnitt-lesen.cjs.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const A = (X.abschnitt = { ruf: [], rahmen: [], bruch: [], fehlt: [], fehler: "" });
    const GLIEDER = [
        "loadState", "generateNewWorld", "_foundryWirtSteht", "_foundryIngestBook", "_genesisPlanAn",
        "tickDayNight", "_applyDayNightToScene", "_atmoTakt", "_ensureSkyEnvironment", "_einmalRender",
        "_loopVoxelStreaming", "_runFrameScheduler", "_dispatchFrameJobs", "_ensureFarWaterSheet", "_tickFernRing", "_tickWegeKarte",
        "_loopAutoSave", "_applyFixedInterpolation", "_tickMountedMovement", "_loopCamera", "animatePlayerSoul",
        "tickArchitectureCulling", "tickBuildMode", "tickArchitectures", "tickAffordances", "_spiegelFeldTakt", "_haarFederTakt", "_seilTakt",
        "_kernPflichtWand", "_loopShadowUpdate", "_loopRender", "_gpuLeineAnlegen", "updateFps", "_perfSenseFoldFrame",
        "_tickFoundryIngest", "_weltStandTakt", "_leibBereit", "applyPlayerSoul", "_leibDerSeele", "_buildHumanoidRig", "_gelenkGestalt",
        "_ofenMenschTemplate", "_ofenAssembleAsset", "_applyEgoSicht", "_refreshHeldMesh", "recomputePlayerStats", "_vorbauBedienung",
        "_loopPhysicsSync", "_stepCharacter", "_tickBootPhase3", "_hotbarNachBuch", "_ladeschirmStand", "_uiPuls",
    ];
    let tiefe = 0;
    const offen = (r) => !(r.state && r.state._weltbildDa) || performance.now() - r.state._weltbildDa < 2000;
    for (const name of GLIEDER) {
        const f0 = P[name];
        if (typeof f0 !== "function") {
            A.fehlt.push(name);
            continue;
        }
        P[name] = function (...a) {
            const t = performance.now();
            tiefe++;
            try {
                return f0.apply(this, a);
            } finally {
                tiefe--;
                const dt = performance.now() - t;
                if (dt >= 150 && A.ruf.length < 300 && offen(this)) A.ruf.push([name, Math.round(t), Math.round(dt), tiefe]);
            }
        };
    }
    const B0 = P._bruchMelden;
    if (typeof B0 === "function")
        P._bruchMelden = function (...a) {
            if (A.bruch.length < 60) A.bruch.push([Math.round(performance.now()), String(a[0]).slice(0, 260)]);
            return B0.apply(this, a);
        };
    try {
        new PerformanceObserver((liste) => {
            for (const e of liste.getEntries()) {
                if (e.duration < 1000 || A.rahmen.length >= 40) continue;
                A.rahmen.push({
                    ab: Math.round(e.startTime),
                    ms: Math.round(e.duration),
                    blockiert: Math.round(e.blockingDuration || 0),
                    bildAb: Math.round(e.renderStart || 0),
                    stilAb: Math.round(e.styleAndLayoutStart || 0),
                    skripte: (e.scripts || []).map((s) => ({
                        rufer: String(s.invoker || "").slice(0, 80),
                        art: s.invokerType,
                        fn: s.sourceFunctionName || "",
                        datei: String(s.sourceURL || "").split("/").pop().split("?")[0],
                        ab: Math.round(s.startTime),
                        ms: Math.round(s.duration),
                        pause: Math.round(s.pauseDuration || 0),
                        layout: Math.round(s.forcedStyleAndLayoutDuration || 0),
                    })),
                });
            }
        }).observe({ type: "long-animation-frame", buffered: true });
    } catch (err) {
        A.fehler = "kein long-animation-frame: " + String(err.message);
    }
}
