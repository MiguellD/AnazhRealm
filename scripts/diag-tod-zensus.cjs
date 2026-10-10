#!/usr/bin/env node
// diag-tod-zensus.cjs — DER TOD-ZENSUS (npm run gate:tod-zensus; Welle LF kampf Nachbesserung 4).
//
// Befund Gegenprüfung 3: ein Leichnam behielt 90 s die Darstellung des lebenden Tiers — der Fall (_kreaturFaellt) und der
// Takt der Gefallenen (_tickLeichname) übernahmen weder die Stufen- und Fell-Wahl des Kreatur-Takts noch das Räumen von
// Aura und Traglast: ein fern gefallenes Tier lag auf 2 m als Fern-Guss ohne Schatten, ein nah gefallenes trug auf 40 m
// die volle Gestalt, die Begleiter-Aura schwebte, wo es stand. Der Zensus fährt den ECHTEN Weg (headless, Null-Renderer,
// Produktions-Boot): zwei Tiere mit Auftrag (Aura) und Traglast, eines stirbt am Alter (_creatureNaturalDeath), eines im
// Kampf mitten im Sprung (damageCreature) — dann je Kreatur-Takt (_kreaturStossSchritt · _leibKontakte · updateCreatures)
// über die ganze Frist des Leichnams, der Spieler wechselt nach 10 s und nach 50 s die Seite (2 m ↔ 40 m). Je Takt und
// Leichnam beim NAMEN:
//   stufe      die Stufe passt zum Abstand wie bei einem lebenden Tier (Fern-Guss jenseits TIER_FERN_DIST × Größe × (1 + Hyst.),
//              die volle Gestalt diesseits × (1 − Hyst.); dazwischen genau eine), der Leib ist sichtbar
//   schatten   nah wirft die Gestalt Schatten (mindestens ein sichtbares Mesh mit castShadow)
//   aura       die Aura des Auftrags hängt nicht mehr in der Szene
//   traglast   keine Traglast (Datum, Sprite in der Szene) und kein Auftrag
//   wesen      kein Wesen-Takt erreicht ihn (Lebens-Strom, Auftrag, Furcht, Abstand, Hüllen-Kontakt, Verhalten, Lauf, Gang)
//   stimme     der Leichnam ruft nicht (_tierRuf mit einem Gefallenen)
//   schwebt    er liegt, wo sein Leib stand: die Wurzel der Tod-Lage höchstens 0,1 m über dem Stand-Boden (ein Tod im
//              Sprung legte ihn auf die Höhe des Hüpfers)
//   abschied   nach der Frist ist er fort (nicht in state.leichname, nicht in der Szene)
// SELBST-TEST (im selben Boot): je Täter der alte Defekt eingespielt — jede Probe muss ROT lesen, aus ihrem Grund.
//   node scripts/diag-tod-zensus.cjs [--ohne-selbsttest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.TOD_ZENSUS_PORT || 4494);
const SELBST = !process.argv.includes("--ohne-selbsttest");

// ═══ DIE SEITEN-FUNKTION (im Browser: r = die Welt, T = THREE) ═══
function todZensus(r, T, taeter) {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const P0 = pm.clone();
    const altK = s.creatures,
        altE = s.creatureEmotions,
        altL = s.leichname,
        altMax = s.maxCreatures,
        altModus = r.getGameMode();
    const restore = [];
    const decke = (name, fn) => {
        const hatte = Object.prototype.hasOwnProperty.call(r, name);
        const alt = r[name];
        r[name] = fn(alt);
        restore.push(() => {
            if (hatte) r[name] = alt;
            else delete r[name];
        });
    };
    s.creatures = [];
    s.creatureEmotions = [];
    s.leichname = [];
    s.maxCreatures = 64;
    r.setGameMode("pfad");
    const o = { taeter: taeter || null };
    try {
        // der Ort: Spieler P, Tier A 2 m vor ihm, Tier B 40 m — dieselbe Linie, damit ein Blick beide fasst; nach dem Wechsel
        // steht der Spieler 42 m weiter und blickt zurück (A auf 40 m, B auf 2 m). Jeder Punkt trocken und eben.
        const trocken = (x, z) => {
            if (r._isAboveWaterAt && !r._isAboveWaterAt(x, z)) return false;
            const gy = r.getTerrainHeightAt(x, z);
            return Number.isFinite(gy) && Math.abs(r._standSicht(x, z, gy, false) - gy) < 0.15;
        };
        let ort = null;
        for (let ring = 0; ring < 12 && !ort; ring++)
            for (let q = 0; q < 16 && !ort; q++) {
                const w = (q / 16) * Math.PI * 2;
                const dx = Math.sin(w),
                    dz = Math.cos(w);
                const px = P0.x + Math.cos(w + 1) * ring * 15,
                    pz = P0.z + Math.sin(w + 1) * ring * 15;
                if (
                    [0, 2, 40, 42].every((m) => trocken(px + dx * m, pz + dz * m)) &&
                    trocken(px + dx * 2 - dz * 3, pz + dz * 2 + dx * 3)
                )
                    ort = { px, pz, dx, dz };
            }
        if (!ort) return { fehler: "kein trockener, ebener Ort (42 m Linie)" };
        const stelle = (m, blick) => {
            const x = ort.px + ort.dx * m,
                z = ort.pz + ort.dz * m;
            pm.set(x, r.getTerrainHeightAt(x, z) + 1, z);
            const cam = s.camera;
            cam.position.set(pm.x, pm.y + 0.6, pm.z);
            const lx = pm.x + ort.dx * blick * 10,
                lz = pm.z + ort.dz * blick * 10;
            cam.lookAt(lx, r.getTerrainHeightAt(lx, lz), lz); // der Boden 10 m voraus: 2 m und 40 m im Bild
            cam.updateMatrixWorld(true);
            if (cam.matrixWorldInverse) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
            r._loopFrustumCulling();
        };
        stelle(0, 1);
        const tier = (m, seele, quer = 0) => {
            const x = ort.px + ort.dx * m - ort.dz * quer,
                z = ort.pz + ort.dz * m + ort.dx * quer;
            const c = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z), z, "happy", seele, {
                precise: true,
                bodySize: 1,
            });
            if (!c) throw new Error("Spawn " + seele);
            c.rotation.y = Math.atan2(ort.dz, -ort.dx); // quer zur Linie: die Flanke zum Spieler
            // ein Auftrag, der hält (die Aura des Auftrags), und eine Traglast (der echte Lebenszyklus der Sprites)
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            c.userData.carrying = { materials: { holz: 3 }, blueprint: null, since: 0 };
            r._refreshCreatureCarryingVisual(c);
            return c;
        };
        const tA = tier(2, "wesen"); // der Hirsch
        const tB = tier(40, "wolf");
        const tC = tier(2, "fuchs", 3); // stirbt, während das Feld seine Wurzel verbirgt (jenseits der Mesh-Zone)
        const ALLE = [
            ["A", tA],
            ["B", tB],
            ["C", tC],
        ];
        const zeichen = new Map(); // die Sprites, die das lebende Tier trug
        for (const [, c] of ALLE) zeichen.set(c, [c.userData.taskAura, c.userData.carryingSprite].filter(Boolean));
        o.zeichenVorher = [...zeichen.values()].reduce((n, z) => n + z.length, 0);

        // DIE KOPIE BEIM MITSPIELER: der Strom trägt die Lage eines Gefallenen (q) — je ein Leichnam des Mitspielers 1,5 m
        // neben A und neben B (Ids mit Größe ≈ 1: die Stufen-Grenze 35 m wie bei A und B); seine Sicht wählt derselbe Weg
        const remote = s.p2p && s.p2p.remoteCreatures;
        if (!remote) return { fehler: "kein p2p-Zustand" };
        restore.push(() => {
            for (const [key, rc] of remote) if (rc.peerId === "zensus-peer") r._disposeRemoteCreature(key, rc);
        });
        const qLiegt = new T.Quaternion().setFromAxisAngle(new T.Vector3(ort.dx, 0, ort.dz), A.TOD_KIPP_RAD);
        const ids = [];
        for (let i = 0; i < 400 && ids.length < 2; i++) {
            const g = r._creatureBodySize("c99" + i);
            if (g > 0.95 && g < 1.05) ids.push("c99" + i);
        }
        const kopieListe = [2, 40].map((m, i) => {
            const x = ort.px + ort.dx * m + ort.dz * 1.5,
                z = ort.pz + ort.dz * m - ort.dx * 1.5;
            return {
                id: ids[i],
                x,
                y: r.getTerrainHeightAt(x, z),
                z,
                yaw: 0,
                soul: i ? "wolf" : "wesen",
                q: [qLiegt.x, qLiegt.y, qLiegt.z, qLiegt.w],
            };
        });
        const dt = 1 / 30;
        const takt = () => {
            r._kreaturStossSchritt(dt);
            r._leibKontakte();
            r.updateCreatures(dt);
            r._p2pHandleCreaturePos("zensus-peer", { list: kopieListe });
            r._p2pTickRemoteCreatures(s.creatureAnimationTime, dt);
        };
        for (let k = 0; k < 30; k++) takt(); // das lebende Tier: seine Stufe steht
        const L0 = (c) => {
            const tb = c.userData._tierBaum;
            return tb && tb.wrap && tb.fern ? (tb.wrap.visible ? "nah" : "fern") : null;
        };
        o.lebend = { A: L0(tA), B: L0(tB) };

        // DER WESEN-TAKT, mitlaufend gezählt (durchgereicht, nie gestubbt): erreicht er einen Gefallenen?
        const wesenTakt = {};
        const istTot = (c) => !!c && s.leichname.indexOf(c) !== -1;
        for (const name of [
            "_tickCreatureLifeTrickle",
            "_getCreatureTask",
            "_tickCreatureTaskDirection",
            "_creatureWariness",
            "_applyCreatureSeparation",
            "_kreaturHuellenKontakt",
            "_tickKreaturVerhalten",
            "_kreaturLaufTakt",
            "_animateCompoundMotion",
        ]) {
            if (typeof r[name] !== "function") continue;
            decke(
                name,
                (alt) =>
                    function (c, ...rest) {
                        if (istTot(c)) wesenTakt[name] = (wesenTakt[name] || 0) + 1;
                        return alt.call(this, c, ...rest);
                    }
            );
        }
        let rufe = 0;
        decke(
            "_tierRuf",
            (alt) =>
                function (c, ...rest) {
                    if (istTot(c)) rufe++;
                    return alt.call(this, c, ...rest);
                }
        );

        // DIE TÄTER (Selbst-Test): der alte Defekt, eingespielt an der Naht, die ihn heute trägt
        if (taeter === "sicht")
            // der Takt der Gefallenen ohne die Sicht des Leibs (vorher: _tickLeichname trieb nur den Fall)
            decke(
                "_leibSicht",
                (alt) =>
                    function (c, ...rest) {
                        if (istTot(c)) return;
                        return alt.call(this, c, ...rest);
                    }
            );
        if (taeter === "zeichen")
            // der Fall ohne das Räumen dessen, was das lebende Tier trug (vorher: erst removeCreature räumte)
            decke(
                "_leibZeichenFrei",
                (alt) =>
                    function (c, ...rest) {
                        if (s.creatures.indexOf(c) !== -1 && c.userData && c.userData.dying) return;
                        return alt.call(this, c, ...rest);
                    }
            );
        if (taeter === "kopie")
            // die Kopie beim Mitspieler ohne die Sicht des Leibs (vorher: jede Kopie in jeder Ferne die volle Gestalt)
            decke(
                "_p2pTickRemoteCreatures",
                (alt) =>
                    function (...a) {
                        const hatte = Object.prototype.hasOwnProperty.call(this, "_leibSicht");
                        const sicht = this._leibSicht;
                        this._leibSicht = function () {};
                        try {
                            return alt.apply(this, a);
                        } finally {
                            if (hatte) this._leibSicht = sicht;
                            else delete this._leibSicht;
                        }
                    }
            );
        if (taeter === "lage")
            decke(
                "_todHebeTafel",
                (alt) =>
                    function (c, ...rest) {
                        if (c.visible === false) return null;
                        return alt.call(this, c, ...rest);
                    }
            );
        if (taeter === "sprung")
            // der Fall nimmt die Höhe des Hüpfers mit (vorher: die Wurzel der Tod-Lage stand, wo der Sprung den Leib trug)
            decke(
                "_kreaturFaellt",
                (alt) =>
                    function (c, ...rest) {
                        c.userData._hopH = 0; // der Fall sieht den Sprung nicht: die Lage des Sprungs bleibt die Wurzel
                        c.userData._hopV = 0;
                        return alt.call(this, c, ...rest);
                    }
            );
        if (taeter === "wesen")
            // der Leichnam bleibt unter den Wesen (vorher, bis Nachbesserung 3)
            decke(
                "_kreaturFaellt",
                (alt) =>
                    function (c, ...rest) {
                        const out = alt.call(this, c, ...rest);
                        s.creatures.push(c);
                        s.creatureEmotions.push("happy");
                        return out;
                    }
            );
        if (taeter === "stimme")
            // der letzte Ruf aus dem liegenden Leib (vorher: _tickLeichname rief, wenn er lag)
            decke(
                "_tickLeichname",
                (alt) =>
                    function (...a) {
                        const out = alt.apply(this, a);
                        for (const c of s.leichname) {
                            const d = c.userData.dying;
                            if (d && d.t >= d.dauer && !d._taeterRuf) {
                                d._taeterRuf = true;
                                this._tierRuf(c, "trauer");
                            }
                        }
                        return out;
                    }
            );

        // DER TOD: A am Alter (auf dem Boden), B im Kampf mitten im Sprung
        const boden = (c) =>
            r._standSicht(c.position.x, c.position.z, r.getTerrainHeightAt(c.position.x, c.position.z), false);
        r.creatureJump(tB);
        let hop = 0;
        for (let k = 0; k < 60 && !(tB.userData._hopH > 0.3 && !(tB.userData._hopV > 0)); k++) takt(); // im Scheitel
        hop = tB.userData._hopH || 0;
        o.hopBeimTod = +hop.toFixed(3);
        r._creatureNaturalDeath(tA);
        const kill = r.damageCreature(tB, 1e9, { source: "player" });
        tC.visible = false;
        r._creatureNaturalDeath(tC);
        o.tot = { A: istTot(tA), B: istTot(tB) && !!(kill && kill.killed), C: istTot(tC) };
        // DIE TOD-LAGE: jeder Gefallene trägt seine Hebe-Tafel (die Flanke legt sich auf den Hang, nie in ihn)
        o.lage = {};
        for (const [n, c] of ALLE) o.lage[n] = !!(c.userData.dying && c.userData.dying.hebe);
        const schwebt = {};
        for (const [n, c] of ALLE) {
            const d = c.userData.dying;
            schwebt[n] = d && Number.isFinite(d.baseY) ? +(d.baseY - boden(c)).toFixed(3) : null;
        }
        o.schwebtM = schwebt;

        // JE TAKT DER FRIST: der Zensus jedes Leichnams
        const G = A._arenaGesetz().gefuehl;
        const frist = G.kippDauerSec + G.leichnamSec;
        const n = Math.ceil((frist + 1) / dt);
        const H = A.TIER_FERN_HYST;
        const verstoss = {};
        const beispiel = {};
        // je Leichnam und Takt zählt eine Klasse einmal (die Zahl = Leichnam-Takte mit dem Verstoß)
        let diesmal = null;
        const melde = (klasse, text) => {
            if (diesmal) {
                if (diesmal.has(klasse)) return;
                diesmal.add(klasse);
            }
            verstoss[klasse] = (verstoss[klasse] || 0) + 1;
            if (!beispiel[klasse]) beispiel[klasse] = text;
        };
        let geprueft = 0,
            ausserBlick = 0,
            nahGeprueft = 0,
            fernGeprueft = 0;
        const caster = (c) => {
            let nZ = 0;
            c.traverseVisible((x) => {
                if (x.isMesh && x.castShadow) nZ++;
            });
            return nZ;
        };
        const kopieGeprueft = { nah: 0, fern: 0 };
        // die Stufe eines Leibs im Bild (Leichnam oder Kopie): genau eine Darstellung, nah die Gestalt mit Schatten, fern der
        // Fern-Guss — dieselben Grenzen wie die eines lebenden Tiers
        const stufe = (c, klasse, txt, zaehl) => {
            const tb = c.userData._tierBaum;
            const d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
            const grenze = Math.sqrt(A.TIER_FERN_DIST_SQ) * (c.scale.x || 1);
            if (!c.visible) melde(klasse, `${txt}: der Leib ist unsichtbar`);
            if (!(tb && tb.wrap && tb.fern)) return;
            if (tb.wrap.visible === tb.fern.visible)
                melde(klasse, `${txt}: Gestalt ${tb.wrap.visible} und Fern-Guss ${tb.fern.visible} zugleich`);
            if (d < grenze * (1 - H)) {
                zaehl.nah++;
                if (!tb.wrap.visible) melde(klasse, `${txt}: der Fern-Guss liegt nah (Grenze ${grenze.toFixed(1)} m)`);
                if (!(caster(c) > 0)) melde("schatten", `${txt}: nah ohne Schatten-Werfer (0 Meshes mit castShadow)`);
            } else if (d > grenze * (1 + H)) {
                zaehl.fern++;
                if (!tb.fern.visible)
                    melde(klasse, `${txt}: die volle Gestalt liegt fern (Grenze ${grenze.toFixed(1)} m)`);
            }
        };
        for (let k = 0; k < n; k++) {
            const tS = k * dt;
            if (k === Math.round(10 / dt)) stelle(42, -1); // nach 10 s: der Spieler wechselt die Seite
            if (k === Math.round(50 / dt)) stelle(0, 1); // nach 50 s: zurück
            takt();
            for (const [name, c] of ALLE) {
                if (!istTot(c)) continue;
                const ud = c.userData;
                const d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                if (!r.isInFrustum(c)) {
                    ausserBlick++;
                    continue;
                }
                geprueft++;
                diesmal = new Set();
                const stelleTxt = `${name} (${ud.soul}) t=${tS.toFixed(1)} s auf ${d.toFixed(1)} m`;
                const zaehl = { nah: 0, fern: 0 };
                stufe(c, "stufe", stelleTxt, zaehl);
                nahGeprueft += zaehl.nah;
                fernGeprueft += zaehl.fern;
                for (const z of zeichen.get(c) || [])
                    if (z.parent)
                        melde(
                            "aura",
                            `${stelleTxt}: ${z.name} hängt in der Szene (y ${(z.position.y - c.position.y).toFixed(2)} m über dem Leib)`
                        );
                if (ud.taskAura) melde("aura", `${stelleTxt}: userData.taskAura besteht`);
                if (ud.carrying || ud.carryingSprite)
                    melde("traglast", `${stelleTxt}: er trägt noch (${ud.carrying ? "Traglast" : "Sprite"})`);
                if (ud.task) melde("traglast", `${stelleTxt}: der Auftrag „${ud.task.name}" besteht`);
                diesmal = null;
            }
            for (const id of ids) {
                const rc = remote.get("zensus-peer:" + id);
                if (!rc || !rc.mesh) {
                    melde("kopie", `die Kopie ${id} fehlt`);
                    continue;
                }
                diesmal = new Set();
                const dK = Math.hypot(rc.mesh.position.x - pm.x, rc.mesh.position.z - pm.z);
                stufe(rc.mesh, "kopie", `Kopie ${id} t=${tS.toFixed(1)} s auf ${dK.toFixed(1)} m`, kopieGeprueft);
                diesmal = null;
            }
        }
        for (const k in wesenTakt) melde("wesen", `${k} erreicht einen Gefallenen ${wesenTakt[k]}×`);
        if (rufe) melde("stimme", `der Leichnam ruft ${rufe}× (_tierRuf mit einem Gefallenen)`);
        for (const [nm] of ALLE)
            if (!o.lage[nm]) melde("lage", `${nm}: ohne Tod-Lage (die Hebe-Tafel fehlt — die Flanke läge im Hang)`);
        for (const [nm] of ALLE)
            if (!(schwebt[nm] !== null && schwebt[nm] <= 0.1))
                melde(
                    "schwebt",
                    `${nm}: die Wurzel der Tod-Lage ${schwebt[nm]} m über dem Stand-Boden (Hüpfer beim Tod ${o.hopBeimTod} m)`
                );
        for (const [nm, c] of ALLE) {
            if (istTot(c) || c.parent) melde("abschied", `${nm}: nach ${(n * dt).toFixed(0)} s noch da`);
            for (const z of zeichen.get(c) || [])
                if (z.parent) melde("abschied", `${nm}: ${z.name} überlebt den Abschied`);
        }
        Object.assign(o, {
            frist: +frist.toFixed(1),
            takte: n,
            geprueft,
            nahGeprueft,
            fernGeprueft,
            ausserBlick,
            kopieGeprueft,
            wesenTakt,
            rufe,
            verstoss,
            beispiel,
        });
        return o;
    } catch (e) {
        o.fehler = String((e && e.stack) || e).slice(0, 600);
        return o;
    } finally {
        for (const f of restore.reverse())
            try {
                f();
            } catch (_e) {
                /* Aufräumen bleibt best effort, die Zahl steht schon */
            }
        for (const c of s.creatures.slice()) r.removeCreature(c);
        for (const c of s.leichname.slice()) r.removeCreature(c);
        s.creatures = altK;
        s.creatureEmotions = altE;
        s.leichname = altL;
        s.maxCreatures = altMax;
        r.setGameMode(altModus);
        pm.copy(P0);
    }
}

// ═══ DAS URTEIL (pure Funktion) ═══
const KLASSEN = ["stufe", "schatten", "kopie", "aura", "traglast", "wesen", "stimme", "lage", "schwebt", "abschied"];
function urteil(z) {
    if (!z || z.fehler) return { ok: false, grund: `keine Probe: ${(z && z.fehler) || "leer"}` };
    const v = [];
    if (!(z.tot && z.tot.A && z.tot.B && z.tot.C))
        v.push(`vakuös: nicht alle drei gefallen (${JSON.stringify(z.tot)})`);
    if (!(z.zeichenVorher >= 6)) v.push(`vakuös: die lebenden Tiere trugen nur ${z.zeichenVorher} Sprites (Soll 6)`);
    if (!(z.hopBeimTod > 0.3)) v.push(`vakuös: B starb nicht im Sprung (Hüpfer ${z.hopBeimTod} m)`);
    if (!(z.nahGeprueft >= 300 && z.fernGeprueft >= 300))
        v.push(`vakuös: ${z.nahGeprueft} nahe und ${z.fernGeprueft} ferne Leichnam-Takte geprüft (Soll je ≥ 300)`);
    if (z.ausserBlick > 0) v.push(`vakuös: ${z.ausserBlick} Leichnam-Takte außer Blick`);
    const kg = z.kopieGeprueft || { nah: 0, fern: 0 };
    if (!(kg.nah >= 300 && kg.fern >= 300))
        v.push(`vakuös: ${kg.nah} nahe und ${kg.fern} ferne Takte der Kopie geprüft (Soll je ≥ 300)`);
    for (const k of KLASSEN) if (z.verstoss && z.verstoss[k]) v.push(`${k}: ${z.verstoss[k]} Takte — ${z.beispiel[k]}`);
    return { ok: v.length === 0, grund: v.join(" · ") };
}
const TAETER = [
    ["sicht", /^stufe|· stufe|schatten/],
    ["kopie", /kopie:/],
    ["zeichen", /aura|traglast/],
    ["lage", /lage:/],
    ["sprung", /schwebt/],
    ["wesen", /wesen:/],
    ["stimme", /stimme:/],
];

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};

(async () => {
    const t0 = Date.now();
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const fehler = [];
    const laeufe = [null, ...(SELBST ? TAETER.map(([t]) => t) : [])];
    const aus = [];
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(580000);
        page.on("pageerror", (e) => fehler.push((e.stack || e.message).split("\n")[0]));
        await page.evaluateOnNewDocument(() => {
            window.__anazhHeadlessNullRenderer = true;
        });
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let last = -1,
                stabil = 0;
            for (let t = 0; t < 3000; t++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const n = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (n === last) stabil++;
                else {
                    stabil = 0;
                    last = n;
                }
                if (n > 20 && stabil > 40) break;
                if (t % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });
        for (const t of laeufe)
            aus.push(
                await page.evaluate(
                    (src, tt) => (0, eval)("(" + src + ")")(window.anazhRealm, window.THREE, tt),
                    todZensus.toString(),
                    t
                )
            );
    } finally {
        await browser.close();
        server.close();
    }
    console.log("\n===== DER TOD-ZENSUS (gate:tod-zensus) — headless, Null-Renderer =====\n");
    let rot = 0;
    aus.forEach((z, i) => {
        const t = laeufe[i];
        const u = urteil(z);
        const kurz = Object.assign({}, z);
        delete kurz.beispiel;
        if (!t) {
            console.log(`  ${u.ok ? "✅" : "❌"} der Fall ${JSON.stringify(kurz)}`);
            if (!u.ok) {
                console.log(`       ↳ ${u.grund}`);
                rot++;
            }
            return;
        }
        const re = TAETER.find(([n]) => n === t)[1];
        const sieht = !u.ok && re.test(u.grund);
        if (!sieht) rot++;
        console.log(
            `  ${sieht ? "✅" : "❌"} Täter ${t.padEnd(8)} ${u.ok ? "unsichtbar — die Linse ist blind" : u.grund.slice(0, 260)}`
        );
    });
    if (fehler.length) {
        console.log(`\n  ❌ Seiten-Fehler: ${fehler.slice(0, 3).join(" | ")}`);
        rot++;
    }
    console.log(`\n  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    if (rot) {
        console.log(
            `\n❌ ROT — ${rot} Urteil(e): der Leichnam trägt, was das lebende Tier trug, oder ein Täter bleibt unsichtbar.`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — der Leichnam liegt in der Stufe seines Abstands, wirft nah Schatten, ohne Aura, Traglast, Wesen-Takt und Stimme${SELBST ? `; ${TAETER.length} Täter beim Namen` : ""}.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("TOD-ZENSUS-FEHLER:", e);
    process.exit(1);
});
