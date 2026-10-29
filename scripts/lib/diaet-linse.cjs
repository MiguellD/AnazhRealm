// diaet-linse.cjs — DIE DIÄT-LINSE: was Diät und Bundles je gerendertem Frame im echten Loop arbeiten (Prüfungen, Gänge,
// Uploads, Renders; netto je Bereich). Urteil im Stand: kein Gang zweimal, jeder Voll-Refresh trägt eine Änderung, keine Prüfung
// ohne Meldung; immer: keine Regung ohne Meldung, kein zeichnendes Render-Objekt ohne Attribute.
//   Seite:     window.__diaetLauf({ frames: 90, modus: "ruhe"|"drehen"|"gehen", grad: 1, tiere: "halten"|"frei" })
//   Werkbank:  node scripts/werkbank.cjs diaet [frames] [--modus ruhe] [--tiere halten] | diaet --selbsttest

// DER ZÄHLER (die Werkbank-Linse und gate:kamera-treue STAND).
function diaetZaehler() {
    const A = r.constructor;
    const rend = st.renderer;
    const be = rend.backend;
    const nf = rend._nodes.nodeFrame;
    // JEDER Haken über EINEN Setzer: er merkt den Vorbestand (eigen oder geerbt), das finally stellt jeden zurück.
    const roh = {};
    const zurueck = [];
    const haken = (name, wo, k, fn) => {
        const eigen = Object.prototype.hasOwnProperty.call(wo, k);
        const alt = (roh[name] = wo[k]);
        zurueck.push(() => (eigen ? (wo[k] = alt) : delete wo[k]));
        wo[k] = fn;
    };
    let c = null;
    const stapel = [];
    let imGang = 0;
    let imOG = 0;
    // DER REFRESH OHNE ÄNDERUNG: kein Gruppen-Upload, kein neuer Puffer, jedes geschriebene Byte gleich dem alten —
    // offen bis zum Ende seiner Bindungen; Schreibe zählen beim Render-Objekt, dessen Auffrischung sie trägt.
    const offen = new Map();
    let aktRo = null;
    const kopie = new WeakMap();
    const nameVon = (ro) => {
        const obj = ro && ro.object;
        let nm = (obj && (obj.name || obj.type)) || "?";
        for (let p = obj && obj.parent, i = 0; p && i < 4; p = p.parent, i++)
            if (p.name) {
                nm = p.name + "/" + nm;
                break;
            }
        return (ro && ro.material && ro.material.isShadowPassMaterial ? "Schatten " : "") + nm;
    };
    const wirkt = () => {
        const w = aktRo && offen.get(aktRo);
        if (w) w.wirkung++;
    };
    const mitRo = (ro, fn) => {
        const alt = aktRo;
        aktRo = ro;
        try {
            return fn();
        } finally {
            aktRo = alt;
        }
    };
    const rahmen = (name, fn) => {
        if (!c) return fn();
        if (name === "schattenRender") {
            const pfad = stapel.map((x) => x.name).join(" › ") || "(oben)";
            c.schattenPfad[pfad] = (c.schattenPfad[pfad] || 0) + 1;
        }
        const f = { name, kind: 0 };
        stapel.push(f);
        const t0 = performance.now();
        try {
            return fn();
        } finally {
            const d = performance.now() - t0;
            stapel.pop();
            c.ms[name] = (c.ms[name] || 0) + d - f.kind;
            const aussen = stapel[stapel.length - 1];
            if (aussen) aussen.kind += d;
        }
    };
    const zaehle = (k, n = 1) => c && (c.n[k] = (c.n[k] || 0) + n);
    // Die Wiederholung zählt je RENDER-ABSCHNITT (Render-Id und `info.calls`, wie der Stempel des Gangs): nach einem
    // verschachtelten Render stellt der äußere seine Knoten zu Recht ein zweites Mal.
    const besuch = (art, id) => {
        if (!c) return;
        const k = nf.renderId + ":" + rend.info.calls + ":" + art + ":" + id;
        const v = (c.besuche.get(k) || 0) + 1;
        c.besuche.set(k, v);
        zaehle("gang" + art);
        if (v > 1) zaehle("wiederholt" + art);
    };
    haken("refresh", A, "_diaetRefresh", function (obs, ro, frame, altNR) {
        const v = rahmen("pruef", () => roh.refresh(obs, ro, frame, altNR));
        zaehle("pruef");
        if (c && ro.attributes === null && ro.vertexBuffers) {
            zaehle("geloescht");
            c.tot[nameVon(ro)] = (c.tot[nameVon(ro)] || 0) + 1;
        }
        if (frame) c && c.rids.add(frame.renderId);
        if (v && c) {
            offen.set(ro, { name: nameVon(ro), wirkung: 0 });
            zaehle("voll");
            c.grund[nameVon(ro)] = (c.grund[nameVon(ro)] || 0) + 1;
        }
        return v;
    });
    const bekannt = new WeakSet();
    haken("vt", A, "_diaetVorTextur", function (ro) {
        zaehle("pruefVoll");
        if (c && ro._anazhObs === undefined && bekannt.has(ro)) {
            zaehle("ohneMeldung");
            c.ohneM[nameVon(ro)] = (c.ohneM[nameVon(ro)] || 0) + 1;
        }
        bekannt.add(ro);
        return roh.vt.call(this, ro);
    });
    haken("ruhig", A, "_diaetRuhig", function (obs, ro, rr, rid) {
        const v = roh.ruhig.call(this, obs, ro, rr, rid);
        zaehle(ro._anazhBeweglich ? "lageVergleich" : "lageStatisch");
        if (c && v && !ro._anazhBeweglich && ro._anazhOd.worldMatrix.equals(ro.object.matrixWorld) !== true) {
            zaehle("regungOhne");
            c.regungO[nameVon(ro) + " Lage"] = 1;
        }
        return v;
    });
    haken("schreib", A, "_diaetGeteiltSchreiben", function (rr, ro, rid) {
        imGang++;
        try {
            return rahmen("gang", () => roh.schreib(rr, ro, rid));
        } finally {
            imGang--;
        }
    });
    // DER FREMDE VERWEIS (E-Diät): ein Verweis auf ein festes Objekt (Schatten-Bias · Radius · Kaskaden des Lichts)
    // speist eine GETEILTE Uniform — EIN Wert je Render-Abschnitt; der Objekt-Gang stellte ihn je Objekt (Fremd).
    const fremd = (n) =>
        n.isMaterialReferenceNode !== true &&
        typeof n.getValueFromReference === "function" &&
        n.object != null &&
        n.count === null &&
        !!(n.node && n.node.groupNode && n.node.groupNode.shared === true);
    haken("og", A, "_diaetObjektGang", function (...a) {
        imOG++;
        try {
            return rahmen("objektGang", () => roh.og.apply(this, a));
        } finally {
            imOG--;
        }
    });
    haken("knoten", nf, "updateNode", function (n) {
        if ((imGang || imOG) && fremd(n)) besuch("Fremd", n.node.id);
        else if (imGang) besuch("Knoten", n.id);
        return roh.knoten.call(this, n);
    });
    haken("vorher", nf, "updateBeforeNode", function (n) {
        if (imGang) besuch("Vorher", n.id);
        return roh.vorher.call(this, n);
    });
    haken("bu", rend._bindings, "_update", function (g, alle) {
        if (imGang) besuch("Gruppe", g.id);
        return roh.bu.call(this, g, alle);
    });
    haken("ub", be, "updateBinding", function (b) {
        zaehle(b && b.groupNode && b.groupNode.shared === true ? "uploadGeteilt" : "uploadEigen");
        wirkt();
        return roh.ub.call(this, b);
    });
    haken("wb", be.device.queue, "writeBuffer", function (buf, off, data, dOff, size) {
        zaehle("writeBuffer");
        zaehle("writeBufferBytes", size != null ? size * (data.BYTES_PER_ELEMENT || 1) : data.byteLength || 0);
        // die Bytes dieses Schreibens gegen das, was an dieser Stelle zuletzt lag (auch im Einschwingen gemerkt)
        const bpe = data.BYTES_PER_ELEMENT || 1;
        const quelle = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
        const u8 = new Uint8Array(
            quelle.buffer,
            quelle.byteOffset + (dOff || 0) * bpe,
            size != null ? size * bpe : quelle.byteLength - (dOff || 0) * bpe
        );
        let m = kopie.get(buf);
        if (!m) kopie.set(buf, (m = new Map()));
        const k = off + ":" + u8.byteLength;
        const alt = m.get(k);
        let gleich = !!alt;
        if (alt)
            for (let i = 0; i < u8.length; i++)
                if (alt[i] !== u8[i]) {
                    gleich = false;
                    break;
                }
        if (!gleich) {
            // ein Schreiben über einen anderen Bereich macht dessen Kopie alt
            for (const k2 of m.keys()) {
                const [o2, n2] = k2.split(":").map(Number);
                if (k2 !== k && o2 < off + u8.byteLength && off < o2 + n2) m.delete(k2);
            }
            m.set(k, u8.slice());
            wirkt();
        }
        return roh.wb.call(this, buf, off, data, dOff, size);
    });
    // Ein verschachtelter Render (der Schatten, den ein Vorher-Knoten im Gang startet) und ein Voll-Refresh sind nie
    // der Gang: ihre Knoten-Besuche zählen nicht als Wiederholung des äußeren Gangs.
    const ohneGang = (fn) => {
        const alt = imGang;
        const altOG = imOG;
        imGang = imOG = 0;
        try {
            return fn();
        } finally {
            imGang = alt;
            imOG = altOG;
        }
    };
    haken("szene", rend, "_renderScene", function (scene, camera, fb) {
        const schatten = !!(scene && scene.overrideMaterial && scene.overrideMaterial.isShadowPassMaterial);
        zaehle(schatten ? "schattenRenders" : "szenen");
        return ohneGang(() => rahmen(schatten ? "schattenRender" : "szene", () => roh.szene.call(this, scene, camera, fb)));
    });
    haken("bundle", rend, "_renderBundle", function (bundle, sceneRef, lightsNode) {
        const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
        const d = this.backend.get(rb);
        const replay = d.bundleGPU !== undefined && bundle.bundleGroup.version === d.version;
        if (replay) zaehle("replayBuerger", d.renderObjects ? d.renderObjects.length : 0);
        else zaehle("aufnahmen");
        return rahmen(replay ? "replay" : "aufnahme", () => roh.bundle.call(this, bundle, sceneRef, lightsNode));
    });
    haken("nUpd", rend._nodes, "updateForRender", function (ro) {
        return mitRo(ro, () => ohneGang(() => rahmen("vollKnoten", () => roh.nUpd.call(this, ro))));
    });
    haken("bUpd", rend._bindings, "updateForRender", function (ro) {
        try {
            return mitRo(ro, () => ohneGang(() => rahmen("vollBindung", () => roh.bUpd.call(this, ro))));
        } finally {
            const w = offen.get(ro);
            if (w) {
                offen.delete(ro);
                if (w.wirkung === 0 && c) {
                    zaehle("ohne");
                    c.ohne[w.name] = (c.ohne[w.name] || 0) + 1;
                }
            }
        }
    });
    haken("gUpd", rend._geometries, "updateForRender", function (ro) {
        return mitRo(ro, () => rahmen("vollGeo", () => roh.gUpd.call(this, ro)));
    });
    // ein neuer Puffer, eine Textur, eine neue Bindegruppe tragen immer eine Änderung
    haken("cb", be.device, "createBuffer", function (d) {
        wirkt();
        return roh.cb.call(this, d);
    });
    haken("wt", be.device.queue, "writeTexture", function (...a) {
        wirkt();
        return roh.wt.apply(this, a);
    });
    haken("ubs", be, "updateBindings", function (...a) {
        wirkt();
        return roh.ubs.apply(this, a);
    });
    return {
        an: () => (c = { n: {}, ms: {}, grund: {}, ohne: {}, ohneM: {}, regungO: {}, tot: {}, schattenPfad: {}, besuche: new Map(), rids: new Set() }),
        aus: () => (c = null),
        zurueck: () => zurueck.forEach((z) => z()),
    };
}
function diaetLauf(opts) {
    return (async () => {
        const o = opts || {};
        const rend = st.renderer;
        const Z = window.__diaetZaehler();
        const N = Number(o.frames) || 90;
        const modus = o.modus || "ruhe";
        if (typeof window.__buehne === "function") window.__buehne();
        if (o.tiere !== "frei" && typeof window.__tiereHalten === "function") window.__tiereHalten();
        const decke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const gier0 = st.yaw;
        const pos0 = st.playerMesh ? st.playerMesh.position.clone() : null;
        const frames = [];
        let ein = o.ein != null ? Number(o.ein) : 20;
        try {
            await new Promise((fertig) => {
                let i = 0;
                rend.setAnimationLoop((t) => {
                    if (typeof window.__wetterHalten === "function") window.__wetterHalten();
                    if (ein <= 0) {
                        if (modus === "drehen") st.yaw += ((Number(o.grad) || 1) * Math.PI) / 180;
                        if (modus === "gehen" && pos0) {
                            const p = st.playerMesh.position;
                            p.x += Math.sin(st.yaw) * -0.08;
                            p.z += Math.cos(st.yaw) * -0.08;
                        }
                    }
                    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
                    const f = Z.an();
                    const t0 = performance.now();
                    try {
                        r._gameLoopTick(t);
                    } finally {
                        f.ms.cpu = performance.now() - t0;
                        Z.aus();
                    }
                    const gerendert = !r._gpuLeine || r._gpuLeine.gerendert > g0;
                    if (ein > 0) return void ein--;
                    if (gerendert) frames.push(f);
                    if (++i >= N) {
                        rend.setAnimationLoop(null);
                        fertig();
                    }
                });
            });
        } finally {
            Z.zurueck();
            st.perfTargetMs = decke;
            if (modus === "drehen") st.yaw = gier0;
            if (modus === "gehen" && pos0) st.playerMesh.position.copy(pos0);
        }
        const F = Math.max(1, frames.length);
        const mittel = (feld) => {
            const m = {};
            for (const f of frames) for (const [k, v] of Object.entries(f[feld])) m[k] = (m[k] || 0) + v / F;
            for (const k in m) m[k] = Math.round(m[k] * 1000) / 1000;
            return m;
        };
        const zahl = mittel("n");
        zahl.renders = Math.round((frames.reduce((a, f) => a + f.rids.size, 0) / F) * 10) / 10;
        const top = (m, n) =>
            Object.entries(m)
                .sort((a, b) => b[1] - a[1])
                .slice(0, n)
                .map(([k, v]) => `${k}: ${Math.round(v * 10) / 10}`);
        return {
            modus,
            tiere: o.tiere || "halten",
            frames: frames.length,
            zahl,
            netto: mittel("ms"),
            schattenPfad: top(mittel("schattenPfad"), 6),
            vollGrund: top(mittel("grund"), 12),
            ohneAenderung: top(mittel("ohne"), 12),
            ohneMeldung: top(mittel("ohneM"), 8),
            regungOhne: top(mittel("regungO"), 8),
            geloescht: top(mittel("tot"), 8),
        };
    })();
}

// DAS URTEIL (Node, auch im Selbsttest); die Netto-Zeiten sind Richtwerte (die Zeit misst der OMEN).
function diaetUrteil(e) {
    const v = [];
    if (!e || !(e.frames > 0)) return ["DIÄT: kein gerenderter Frame gemessen — die Linse ist blind"];
    const z = e.zahl || {};
    if (!(z.pruef > 0)) v.push("DIÄT: keine Diät-Prüfung gezählt — die Linse ist blind");
    if (e.modus === "ruhe") {
        const arten = ["Knoten", "Vorher", "Gruppe", "Fremd"];
        const w = arten.reduce((s, k) => s + (z["wiederholt" + k] || 0), 0);
        if (w > 0)
            v.push(
                `RUHE: ${Math.round(w * 10) / 10} wiederholte Gänge je Frame (${arten.map((k) => k + " " + (z["wiederholt" + k] || 0)).join(" · ")}) — dieselbe Arbeit je Programm statt EINMAL je Render`
            );
        // K71: im Stand trägt jeder Voll-Refresh eine Änderung zur GPU — ein Refresh ohne Änderung nennt sein Objekt
        if (z.ohne > 0)
            v.push(
                `RUHE: ${Math.round(z.ohne * 100) / 100} Refreshs ohne Änderung je Frame (${(e.ohneAenderung || []).join(" · ") || "?"}) — die Diät zahlt ohne neuen Eingang`
            );
        if (z.ohneMeldung > 0.5) v.push(`RUHE: ${z.ohneMeldung} Prüfungen ohne Meldung je Frame (${e.ohneMeldung.join(" · ")}) — die Diät fragt`);
    }
    if (z.geloescht > 0.5) v.push(`ATTRIBUTE GELÖSCHT: ${z.geloescht} je Frame (${e.geloescht}) — zeichnet, prüft voll`);
    if (z.regungOhne > 0) v.push(`REGUNG OHNE MELDUNG: ${e.regungOhne.join(" · ")} — das Bild trüge die alte Lage`);
    return v;
}

function selbsttest() {
    const fehler = [];
    const gruen = { modus: "ruhe", frames: 60, zahl: { pruef: 120, gangKnoten: 66, wiederholtKnoten: 0 } };
    if (diaetUrteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + diaetUrteil(gruen).join(" · "));
    const faelle = [
        ["Gang je Programm, Fremd je Objekt", Object.assign({}, gruen, { zahl: { pruef: 120, wiederholtKnoten: 850, wiederholtGruppe: 70, wiederholtFremd: 40 } }), /RUHE: 960 wiederholte Gänge .*Gruppe 70 · Fremd 40/],
        ["blind (kein Frame)", { modus: "ruhe", frames: 0, zahl: {} }, /kein gerenderter Frame/],
        ["blind (keine Prüfung)", Object.assign({}, gruen, { zahl: { pruef: 0 } }), /keine Diät-Prüfung/],
        [
            "Refresh ohne Änderung (K71: Satz-Ausschnitt, Senke ohne neue Bytes)",
            Object.assign({}, gruen, { zahl: { pruef: 120, ohne: 6.5 }, ohneAenderung: ["bauSatz: 1.7", "nahWiese:L2:0:0: 0.3"] }),
            /RUHE: 6\.5 Refreshs ohne Änderung je Frame \(bauSatz: 1\.7 · nahWiese:L2:0:0: 0\.3\)/,
        ],
        ["Prüfung ohne Meldung", Object.assign({}, gruen, { zahl: { pruef: 85, ohneMeldung: 85 }, ohneMeldung: ["Ring: 12"] }), /RUHE: 85 Prüfungen ohne Meldung je Frame \(Ring: 12\)/],
        ["gelöschte Attribute", Object.assign({}, gruen, { zahl: { pruef: 85, geloescht: 5 }, geloescht: "bauSatz" }), /GELÖSCHT: 5 .*bauSatz/],
        ["statische Regung ohne Meldung", Object.assign({}, gruen, { zahl: { pruef: 85, regungOhne: 1 }, regungOhne: ["haus Lage: 1"] }), /REGUNG OHNE MELDUNG: haus Lage/],
    ];
    require("./welt-boot.cjs").taeterFaelle(faelle.map(([name, z, muss]) => ({ name, z, muss })), diaetUrteil, { fehler });
    // Drehen und Gehen dürfen Arbeit tragen (die Änderung) — das Urteil fällt dort nie über Wiederholung.
    if (diaetUrteil(Object.assign({}, gruen, { modus: "drehen", zahl: { pruef: 120, wiederholtKnoten: 5, ohne: 3 } })).length)
        fehler.push("Drehen fällt rot über Wiederholung oder Refresh ohne Änderung");
    return fehler;
}

module.exports = {
    DIAET_INSTALL: `window.__diaetZaehler = ${diaetZaehler.toString()}; window.__diaetLauf = (o) => (${diaetLauf.toString()})(o);`,
    diaetUrteil,
    selbsttest,
};
