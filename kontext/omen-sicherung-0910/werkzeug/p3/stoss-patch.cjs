// DAS EINE IMPULS-GESETZ (0710-2, Stoß + Kampf-Rückstoß): node stoss-patch.cjs <anazhRealm.js>
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");
const r = (a, b) => {
    const n = s.split(a).length - 1;
    if (n !== 1) throw new Error("Anker (" + n + "x): " + a.slice(0, 80));
    s = s.replace(a, b);
};
const L = (...z) => z.join("\n");

// (A) Das Gesetz neben dem Arena-Leser.
r(
    L(
        "    return AnazhRealm._kernPflichtBruch(\"schmiede:ARENA\");",
        "};",
        "",
        "// Werkzeug-Anwendung kostet Stamina:"
    ),
    L(
        "    return AnazhRealm._kernPflichtBruch(\"schmiede:ARENA\");",
        "};",
        "",
        "// DAS EINE IMPULS-GESETZ (0710-2: der Stoß der Fahrt und der Rückstoß des Kampfs, K-D9): jeder Stoß zweier Körper —",
        "// Wagen an Fels, Wagen an Wagen, Wagen an Tier, Klinge und Pfeil am Tier — tauscht Impuls längs der Stoß-Normalen,",
        "// J = (1 + e) · v_rel / (1/mA + 1/mB) (ein starrer Gegner: 1/mB = 0), mit der Stoß-Zahl e des Paars. Die Masse kommt",
        "// aus dem Leib (das Tier: die Kapsel `_kreaturLeib` mal der Dichte des Gewebes) und aus dem Kern (der Wagen: carPhys",
        "// über den Fahr-Satz; der Schlag: die wirksame Masse des Schmiede-Urteils). Was ein Leib an Geschwindigkeit bekommt,",
        "// trägt ihn, bis die Reibung am Boden sie aufzehrt (`updateCreatures`) — der Bär rutscht wenig, der Fuchs fliegt;",
        "// ein gestoßener Wagen rutscht mit der Handbremse (`_fahrNachlauf`). Vorher stand der Wagen in EINEM Frame",
        "// (Leben-Schau 07.10.: Baum 10,41 → 0,16, GT 11,28 → 0,00, Bär 9,27 → 0,17 m/s), und jeder Treffer versetzte jedes",
        "// Ziel 2,16 m (eine Kappe, kein Gesetz).",
        "AnazhRealm.STOSS = Object.freeze({",
        "    dichteLeib: 1000, // kg/m³: ein Leib wiegt sein Volumen Wasser",
        "    stossZahl: Object.freeze({ starr: 0.2, wagen: 0.3, leib: 0.1 }), // Fels/Bauwerk/Baum · Wagen an Wagen · Leib",
        "    reibungLeib: 0.6, // μ des gleitenden Leibs am Boden: er verzögert mit μ·g",
        "    ruheMs: 0.05, // m/s: darunter ruht der Stoß",
        "    ereignisMs: 1, // m/s Sprung der eigenen Fahrt, ab dem ein Stoß Kamera und Klang erreicht",
        "    ruckRefMs: 8, // m/s Sprung der eigenen Fahrt, bei dem der Kamera-Ruck (der Landungs-Dip) voll ist",
        "});",
        "// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.",
        "AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {",
        "    if (!(vRel > 0) || !(mA > 0) || !(mB > 0)) return 0;",
        "    return ((1 + e) * vRel) / (1 / mA + (Number.isFinite(mB) ? 1 / mB : 0));",
        "};",
        "",
        "// Werkzeug-Anwendung kostet Stamina:"
    )
);
r(
    L(
        "        Number.isFinite(a.gefuehl.stossCap) &&",
        "        Number.isFinite(a.bogen.muendungM)"
    ),
    L(
        "        Number.isFinite(a.gefuehl.wucht) &&",
        "        Number.isFinite(a.gefuehl.pProKb) &&",
        "        Number.isFinite(a.bogen.muendungM)"
    )
);

// (B) Masse und Stoß des Leibs neben `_kreaturLeib`.
r(
    L(
        "        o.fx = Math.sin(creature.rotation.y);",
        "        o.fz = Math.cos(creature.rotation.y);",
        "        return o;",
        "    }",
        ""
    ),
    L(
        "        o.fx = Math.sin(creature.rotation.y);",
        "        o.fz = Math.cos(creature.rotation.y);",
        "        return o;",
        "    }",
        "",
        "    // DIE MASSE DES LEIBS (das EINE Impuls-Gesetz, AnazhRealm.STOSS): die Kapsel `_kreaturLeib` — der Rumpf 2·halb lang",
        "    // mit dem Radius, die Enden Halbkugeln — mal der Dichte des Gewebes. Dieselbe Gestalt, mit der jeder Kontakt löst.",
        "    _kreaturMasse(creature) {",
        "        const lb = this._kreaturLeib(creature, 0, this._kreaturMasseLeib || (this._kreaturMasseLeib = {}));",
        "        const r = lb.radius;",
        "        return AnazhRealm.STOSS.dichteLeib * Math.PI * r * r * (2 * lb.halb + (4 / 3) * r);",
        "    }",
        "",
        "    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.",
        "    _kreaturStoss(creature, nx, nz, dv) {",
        "        if (!creature || !creature.userData || !(dv > 0)) return;",
        "        const sv = creature.userData._stossV || (creature.userData._stossV = { x: 0, z: 0 });",
        "        sv.x += nx * dv;",
        "        sv.z += nz * dv;",
        "    }",
        ""
    )
);

// (C) Der Stoß trägt den Leib in updateCreatures (vor dem Hüllen-Kontakt des Tiers).
r(
    L(
        "            this._kreaturHuellenKontakt(creature, hueftL, px0, pz0);",
        "",
        "            // Sanfter Decay des Innenlebens"
    ),
    L(
        "            // DER STOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS): die Geschwindigkeit eines Treffers oder Wagens trägt den",
        "            // Leib, bis die Reibung am Boden sie aufzehrt (μ·g); der Hüllen-Kontakt danach hält ihn aus Wand und Bauwerk.",
        "            const stossV = udS._stossV;",
        "            if (stossV) {",
        "                const sp = Math.hypot(stossV.x, stossV.z);",
        "                const ab = AnazhRealm.STOSS.reibungLeib * Math.abs(this.state.gravity) * delta;",
        "                if (!(sp > Math.max(ab, AnazhRealm.STOSS.ruheMs))) udS._stossV = null;",
        "                else {",
        "                    creature.position.x += stossV.x * delta;",
        "                    creature.position.z += stossV.z * delta;",
        "                    const k = (sp - ab) / sp;",
        "                    stossV.x *= k;",
        "                    stossV.z *= k;",
        "                }",
        "            }",
        "            this._kreaturHuellenKontakt(creature, hueftL, px0, pz0);",
        "",
        "            // Sanfter Decay des Innenlebens"
    )
);

// (D) Der Rückstoß in damageCreature.
r(
    L(
        "        // Knockback nur, wenn der Angreifer Ort + Wucht liefert (LMB-Angriff; der DSL-Op gibt keinen),",
        "        // ∝ dessen knockback-Stat — NACH der Gegenwehr (Welle L, Befund K-D16): der Stoß kam vorher und schob jedes",
        "        // Ziel aus der Biss-Reichweite (Ziel in 1,6 m → 3,76 m), 0 Konter bei 96 Treffern.",
        "        if (opts.fromPos && (opts.knockback || 0) > 0) {",
        "            // Feld-nativer Knockback: direkter Positions-Stoß weg vom Angreifer; `_creatureGroundY` erdet im",
        "            // nächsten updateCreatures-Frame. Klemme + Skalen aus dem schmiede-Gesetzbuch",
        "            // (ARENA.gefuehl: push = min(stossCap, kb·stossProKb)·stossSkala).",
        "            const G = AnazhRealm._arenaGesetz().gefuehl;",
        "            const dx = creature.position.x - opts.fromPos.x;",
        "            const dz = creature.position.z - opts.fromPos.z;",
        "            const len = Math.hypot(dx, dz) || 1;",
        "            const push = Math.min(G.stossCap, opts.knockback * G.stossProKb);",
        "            creature.position.x += (dx / len) * push * G.stossSkala;",
        "            creature.position.z += (dz / len) * push * G.stossSkala;",
        "        }"
    ),
    L(
        "        // DER RÜCKSTOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS — 0710-2, K-D9), nur wenn der Angreifer Ort und Stoß",
        "        // liefert (LMB-Angriff, Pfeil; der DSL-Op gibt keinen) und NACH der Gegenwehr (Welle L, K-D16): der Schlag ist ein",
        "        // Körper — die wirksame Masse m und sein Impuls p aus dem Treffer-Urteil des Schmiede-Kerns, verstärkt um die Wucht",
        "        // der Arena (`gefuehl.wucht`) —, das Ziel ruht mit der Masse seines Leibs; was der Leib bekommt, trägt ihn in",
        "        // updateCreatures, bis die Reibung es aufzehrt. Vorher ein Positions-Satz min(stossCap, kb·stossProKb)·stossSkala:",
        "        // 2,16 m für jede Waffe und jedes Ziel, in EINEM Frame.",
        "        if (opts.fromPos && opts.stoss && opts.stoss.p > 0 && opts.stoss.m > 0) {",
        "            const G = AnazhRealm._arenaGesetz().gefuehl;",
        "            const dx = creature.position.x - opts.fromPos.x;",
        "            const dz = creature.position.z - opts.fromPos.z;",
        "            const len = Math.hypot(dx, dz) || 1;",
        "            const mT = this._kreaturMasse(creature);",
        "            const mS = opts.stoss.m;",
        "            const J = AnazhRealm._stossImpuls(mS, mT, (G.wucht * opts.stoss.p) / mS, AnazhRealm.STOSS.stossZahl.leib);",
        "            this._kreaturStoss(creature, dx / len, dz / len, J / mT);",
        "        }"
    )
);

// (E) Die Rufer: die Klinge (Urteil oder der ungemessene Schlag) und der Pfeil (sein Urteil).
r(
    L(
        "            const res = this.damageCreature(c, roh, {",
        "                source: \"player\",",
        "                fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },",
        "                knockback: this._kampfStats().knockback || 0,",
        "            });"
    ),
    L(
        "            const res = this.damageCreature(c, roh, {",
        "                source: \"player\",",
        "                fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },",
        "                stoss: urteil ? { p: urteil.p, m: urteil.mEff } : this._kampfStossOhneMessung(omega * hebel),",
        "            });"
    )
);
r(
    L(
        "                const res = this.damageCreature(hit, this._kampfRohSchaden(urteil, hitTr.zone, pf.kraft), {",
        "                    source: \"player\",",
        "                    fromPos: { x: ox, y: oy, z: oz },",
        "                    knockback: pf.kb,",
        "                });"
    ),
    L(
        "                const res = this.damageCreature(hit, this._kampfRohSchaden(urteil, hitTr.zone, pf.kraft), {",
        "                    source: \"player\",",
        "                    fromPos: { x: ox, y: oy, z: oz },",
        "                    stoss: { p: urteil.p, m: urteil.mEff },",
        "                });"
    )
);
r(
    L(
        "    // DAS TREFFER-URTEIL der Welt (Welle L, K-D2):"
    ),
    L(
        "    // DER UNGEMESSENE SCHLAG (das EINE Impuls-Gesetz): Faust und Eigenwerke ohne Schmiede-Rezept tragen keine Messung —",
        "    // ihr Impuls ist der emergente Rückschlag des Gehaltenen (`knockback` ∝ dichte + härte, je Punkt `gefuehl.pProKb`),",
        "    // ihre wirksame Masse folgt aus der Schlag-Geschwindigkeit an der Klinge (m = p / v). Wie der Schaden: gemessen",
        "    // richtet das Urteil, ungemessen die emergente Größe.",
        "    _kampfStossOhneMessung(v) {",
        "        const p = (this._kampfStats().knockback || 0) * AnazhRealm._arenaGesetz().gefuehl.pProKb;",
        "        return p > 0 && v > 0 ? { p, m: p / v } : null;",
        "    }",
        "",
        "    // DAS TREFFER-URTEIL der Welt (Welle L, K-D2):"
    )
);

// (I) Der Stoß des Wagens: die Quelle je Schub, der Austausch nach Masse, das Ereignis.
r(
    L(
        "        pos.x += ax * best;",
        "        pos.z += az * best;",
        "        h.schub.push(ax * best, az * best);",
        "    }"
    ),
    L(
        "        pos.x += ax * best;",
        "        pos.z += az * best;",
        "        h.schub.push(ax * best, az * best);",
        "        if (h.schubQuelle) h.schubQuelle.push(h.quelle || null);",
        "    }"
    )
);
r(
    L(
        "            const boxes = e.blockerAABBs;",
        "            for (let b = 0; b < boxes.length; b++) {",
        "                if (huelle) {",
        "                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);"
    ),
    L(
        "            if (huelle && huelle.eigen === e.id) continue; // ein rutschender Wagen löst nie gegen sich selbst",
        "            const boxes = e.blockerAABBs;",
        "            if (huelle) huelle.quelle = e; // der Gegner jedes Schubs (das EINE Impuls-Gesetz)",
        "            for (let b = 0; b < boxes.length; b++) {",
        "                if (huelle) {",
        "                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);"
    )
);
r(
    L(
        "            if (huelle) this._resolveHuelleVsAABB(box, pos, huelle);",
        "            else supportTop = this._resolveCapsuleVsAABB(box, pos, feetY, headY, radius, supportTop);"
    ),
    L(
        "            if (huelle) {",
        "                huelle.quelle = null; // eine Insel ist starr",
        "                this._resolveHuelleVsAABB(box, pos, huelle);",
        "            } else supportTop = this._resolveCapsuleVsAABB(box, pos, feetY, headY, radius, supportTop);"
    )
);
r(
    L(
        "            unten: 0,",
        "            oben: 0,",
        "            schub: [],",
        "        };"
    ),
    L(
        "            unten: 0,",
        "            oben: 0,",
        "            schub: [],",
        "            schubQuelle: [], // der Gegner je Schub (Bauwerk, Wagen, Leib; null = starr)",
        "            quelle: null,",
        "            eigen: entry.id, // die eigenen Boxen löst die Hülle nie",
        "        };"
    )
);
r(
    L(
        "        k.unten = fz.y + k.stufe;",
        "        k.oben = fz.y + k.dach;",
        "        k.schub.length = 0;"
    ),
    L(
        "        k.unten = fz.y + k.stufe;",
        "        k.oben = fz.y + k.dach;",
        "        k.schub.length = 0;",
        "        k.schubQuelle.length = 0;"
    )
);
r(
    L(
        "                    pos.x += sx;",
        "                    pos.z += sz;",
        "                    k.schub.push(sx, sz);"
    ),
    L(
        "                    pos.x += sx;",
        "                    pos.z += sz;",
        "                    k.schub.push(sx, sz);",
        "                    k.schubQuelle.push(cr);"
    )
);
r(
    L(
        "        // Was die Hülle schob, nimmt der Fahrt die Komponente in die Berührung.",
        "        for (let i = 0; i < k.schub.length; i += 2) {",
        "            const sx = k.schub[i];",
        "            const sz = k.schub[i + 1];",
        "            const d = Math.hypot(sx, sz);",
        "            if (!(d > 1e-9)) continue;",
        "            const into = (vx * sx + vz * sz) / d;",
        "            if (into < 0) {",
        "                vx -= (sx / d) * into;",
        "                vz -= (sz / d) * into;",
        "            }",
        "        }",
        "        return { x: pos.x, z: pos.z, vx, vz };",
        "    }"
    ),
    L(
        "        // DER STOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS — 0710-2): je Gegner EIN Stoß längs der Summe seiner Schübe",
        "        // (ein Baum trägt 44 Boxen, er stößt einmal). Ein starrer Gegner (Bauwerk, Fels, Baum, Insel) wirft den Wagen mit",
        "        // seiner Stoß-Zahl zurück; ein Wagen und ein Leib bekommen ihren Impuls nach Masse (Kern und Leib), der Wagen behält,",
        "        // was ihm bleibt. Vorher nahm die Hülle der Fahrt nur die Komponente in die Berührung — ein Stopp ohne Folge.",
        "        const ST = AnazhRealm.STOSS;",
        "        const mW = entry._fahrSatz && entry._fahrSatz.m > 0 ? entry._fahrSatz.m : 0;",
        "        const gegner = this._fahrStossGegner || (this._fahrStossGegner = new Map());",
        "        gegner.clear();",
        "        for (let i = 0; i < k.schub.length; i += 2) {",
        "            const q = k.schubQuelle[i >> 1] || null;",
        "            let g = gegner.get(q);",
        "            if (!g) gegner.set(q, (g = { x: 0, z: 0 }));",
        "            g.x += k.schub[i];",
        "            g.z += k.schub[i + 1];",
        "        }",
        "        let dvEigen = 0;",
        "        let stossTags = null;",
        "        for (const [q, g] of gegner) {",
        "            const d = Math.hypot(g.x, g.z);",
        "            if (!(d > 1e-9)) continue;",
        "            const nx = g.x / d; // vom Gegner zum Wagen",
        "            const nz = g.z / d;",
        "            const hinein = -(vx * nx + vz * nz);",
        "            if (!(hinein > 0)) continue;",
        "            const leib = !!(q && q.userData && q.userData.kind === \"creature\");",
        "            const wagenG = !leib && q && q !== entry ? this._fahrStossSatz(q) : null;",
        "            const mG = leib ? this._kreaturMasse(q) : wagenG ? wagenG.m : Infinity;",
        "            const e = leib ? ST.stossZahl.leib : wagenG ? ST.stossZahl.wagen : ST.stossZahl.starr;",
        "            // ohne Masse des eigenen Wagens (ein Werk ohne Fahr-Satz) nimmt die Berührung nur die Komponente",
        "            const J = mW > 0 ? AnazhRealm._stossImpuls(mW, mG, hinein, e) : 0;",
        "            const dv = mW > 0 ? J / mW : hinein;",
        "            vx += nx * dv;",
        "            vz += nz * dv;",
        "            if (leib) this._kreaturStoss(q, -nx, -nz, J / mG);",
        "            else if (wagenG) this._fahrWagenStoss(q, wagenG, (-nx * J) / mG, (-nz * J) / mG);",
        "            if (dv > dvEigen) {",
        "                dvEigen = dv;",
        "                stossTags = leib",
        "                    ? this.computeCreatureCompoundTags(q)",
        "                    : q && q.type && this.state.blueprints && this.state.blueprints[q.type]",
        "                      ? this.computeCompoundTags(this.state.blueprints[q.type])",
        "                      : null;",
        "            }",
        "        }",
        "        if (meldet && dvEigen >= ST.ereignisMs) this._stossEreignis(stossTags, dvEigen);",
        "        return { x: pos.x, z: pos.z, vx, vz };",
        "    }",
        "",
        "    // DER FAHR-SATZ EINES GESTOSSENEN (das EINE Impuls-Gesetz): ein Werk mit Fahr-Gesetz (Studio-Wagen, Kern-Profil) trägt",
        "    // seine Masse im Fahr-Satz; alles andere ist starr.",
        "    _fahrStossSatz(entry) {",
        "        if (!entry || !entry.position || typeof this._vehicleProfile !== \"function\") return null;",
        "        const prof = this._vehicleProfile(entry);",
        "        const G = prof ? this._fahrSatz(entry, prof) : null;",
        "        return G && G.m > 0 ? G : null;",
        "    }",
        "",
        "    // DER GESTOSSENE WAGEN (das EINE Impuls-Gesetz): ein geparkter Wagen bekommt seinen Impuls als Fahrt im eigenen Rahmen",
        "    // (vlong/vlat des Kerns) und rutscht im Nachlauf mit der Handbremse (`_fahrNachlauf`), bis er steht.",
        "    _fahrWagenStoss(entry, G, dvx, dvz) {",
        "        const pl = this.state.player;",
        "        if (pl && pl.mountedArch === entry.id) return;",
        "        const { vc } = AnazhRealm._fahrSchrittGesetz();",
        "        let fz = entry._fahr;",
        "        if (!fz || !Number.isFinite(fz.y)) {",
        "            const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;",
        "            const fahrt = entry._fahrAchseX ? ry + Math.PI / 2 : ry; // die Umkehr von _rittGier",
        "            fz = entry._fahr = vc.fahrZustand(entry.position.x, entry.position.z, fahrt - Math.PI / 2);",
        "            vc.fahrStand(fz, G, this._fahrBoden(entry), 0);",
        "            if (!Number.isFinite(fz.y)) return;",
        "        }",
        "        const cy = Math.cos(fz.yaw);",
        "        const sy = Math.sin(fz.yaw);",
        "        fz.vlong += dvx * cy - dvz * sy;",
        "        fz.vlat += -dvx * sy - dvz * cy;",
        "        entry._fahrSatz = G;",
        "        (this._fahrLos || (this._fahrLos = new Set())).add(entry);",
        "    }",
        "",
        "    // DAS STOSS-EREIGNIS (das EINE Impuls-Gesetz): der Sprung der eigenen Fahrt erreicht Kamera und Klang — der Kamera-Ruck",
        "    // über den EINEN Landungs-Dip (_landImpactPending, wie der Treffer), der Klang über das Gesetz klang:SUBSTANZ.treffer",
        "    // (die Substanz des Gegners färbt ihn; stumm ohne Symphonie).",
        "    _stossEreignis(tags, dv) {",
        "        const G = AnazhRealm._arenaGesetz().gefuehl;",
        "        const e = Math.max(0, Math.min(1, dv / AnazhRealm.STOSS.ruckRefMs));",
        "        this.state._landImpactPending = Math.max(this.state._landImpactPending || 0, G.dipMin + (G.dipMax - G.dipMin) * e);",
        "        this._substanzKlang(\"treffer\", tags || {});",
        "    }"
    )
);
// _fahrHuelleKontakt bekommt den Schalter `meldet` (nur der Wagen des Spielers erreicht Kamera und Klang)
r(
    "    _fahrHuelleKontakt(entry, k, x0, z0, vx, vz, dt) {",
    "    _fahrHuelleKontakt(entry, k, x0, z0, vx, vz, dt, meldet = true) {"
);

// (J) Der Nachlauf trägt den gestoßenen Wagen auch waagrecht (Handbremse, eigener Hüllen-Kontakt, Blocker nach).
r(
    L(
        "            vc.fahrStand(fz, entry._fahrSatz, this._fahrBoden(entry), dt);",
        "            const clear = entry._fahrAchseX ? 0 : Number.isFinite(entry._groundClear) ? entry._groundClear : 0;",
        "            entry.position.y = fz.y + 0.5 + clear;",
        "            entry._rideY = entry.position.y;",
        "            entry._rideVy = fz.vy;",
        "            if (!fz.luft) {"
    ),
    L(
        "            // DER GESTOSSENE WAGEN RUTSCHT (das EINE Impuls-Gesetz): die Handbremse hält ihn, sein Hüllen-Kontakt trägt den",
        "            // Stoß weiter (Bauwerke, Wagen, Leiber), seine Blocker ziehen mit.",
        "            const rutscht = Math.hypot(fz.vlong || 0, fz.vlat || 0) > AnazhRealm.STOSS.ruheMs;",
        "            if (rutscht) {",
        "                const x0 = fz.x;",
        "                const z0 = fz.z;",
        "                vc.fahrKraefte(fz, { brake: 1, hand: true }, entry._fahrSatz, dt);",
        "                entry._rideYaw = fz.yaw + Math.PI / 2;",
        "                const k = this._fahrHuelle(entry);",
        "                if (k) {",
        "                    const cyW = Math.cos(fz.yaw);",
        "                    const syW = Math.sin(fz.yaw);",
        "                    const vxW = fz.vlong * cyW - fz.vlat * syW;",
        "                    const vzW = -fz.vlong * syW - fz.vlat * cyW;",
        "                    const hk = this._fahrHuelleKontakt(entry, k, x0, z0, vxW, vzW, dt, false);",
        "                    fz.x = hk.x;",
        "                    fz.z = hk.z;",
        "                    fz.vlong = hk.vx * cyW - hk.vz * syW;",
        "                    fz.vlat = -hk.vx * syW - hk.vz * cyW;",
        "                }",
        "                entry.position.x = fz.x;",
        "                entry.position.z = fz.z;",
        "                entry.rotationY = this._rittGier(entry, entry._rideYaw);",
        "                if (entry.blockerAABBs) {",
        "                    this._populateBlockerAABBs(entry);",
        "                    entry._blockerStampAt = null;",
        "                }",
        "            }",
        "            vc.fahrStand(fz, entry._fahrSatz, this._fahrBoden(entry), dt);",
        "            const clear = entry._fahrAchseX ? 0 : Number.isFinite(entry._groundClear) ? entry._groundClear : 0;",
        "            entry.position.y = fz.y + 0.5 + clear;",
        "            entry._rideY = entry.position.y;",
        "            entry._rideVy = fz.vy;",
        "            if (!fz.luft && !(Math.hypot(fz.vlong || 0, fz.vlat || 0) > AnazhRealm.STOSS.ruheMs)) {",
        "                fz.vlong = fz.vlat = fz.yawRate = 0;"
    )
);

fs.writeFileSync(f, s);
console.log("Impuls-Gesetz geschrieben");
