#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-takt-atem.cjs — DIE ATEM-WAND DES TAKTS (gate:takt-atem, 0910-7)
//
// Keine Stellgröße des Reglers pendelt je Takt um ihr Ziel: jeder Wechsel weckt über den Stand-Stempel jeden Fege-Takt zu
// einer vollen Runde über den Bestand und über `uLodPerf` die Lage jedes Passes.
//
// Die Linse fährt die echte Welt (swiftshader, kienspan) ohne Spiel-Loop und ohne Wanduhr — sie ZÄHLT. Je Takt: der Aktuator
// (`_nexusPerfActuate`) mit einem festen Sinn (Frame 14 ms, ehrliche Last), `uLodPerf` wie in `_loopRender`, der Takt-Planer
// (`_runFrameScheduler`), die Sicht des Hauptbilds (`_passSicht` vor und nach). Der Regler steht in festen Stufen (loadScale
// 1 → 0,7 → 0,4 → 0,1 → 0,4 → 0,7 → 1, je 80 Takte) und atmet darüber (±0,02 im Wechsel, der PID im Totband); gezählt wird die
// zweite Hälfte jeder Stufe (das Folgen ist Arbeit, das Pendeln der Täter). Gezählt je Takt:
// die Wechsel der Dichte, die Erhöhungen des Stand-Stempels (je Eingabe), die neuen Lagen des Hauptbilds, die Einheiten der
// Stufen-Wahl (`archLod`), die Aufrufe von `_lodTreeVisHeight`, `_foundrySichtHoehe`, `_chunkSatzAbschnitt`, `_hoehlenSicht`.
// Das Urteil nennt:
//   DICHTE ATMET — die Dichte wechselt in mehr als 10 % der Takte (der Regler ohne Wand).
//   STAND WACH — die Dichte weckt über den Stand-Stempel die Fege-Takte in mehr als 10 % der Takte (volle Runden über den Bestand).
//   LAGE FÄLLT — die Lage des Hauptbilds fällt in mehr als 10 % der Takte (die Satz-Wahl und die Höhlen-Sicht rechnen neu).
//   BLIND — die Welt trägt keinen Baum, keinen Satz oder keine Blende (`uLodMaskOn`), oder der Spiegel `uLodPerf` in
//   `_loopRender` fehlt (die Linse ahmte einen Weg nach, den das Spiel nicht mehr geht).
// GEGENPROBE im selben Lauf: ein Aktuator, der die Dichte nach jedem Takt um einen Schritt auf und ab stößt (die fehlende
// Wand), fällt als DICHTE ATMET — sonst ist die Linse blind.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`).
//   node scripts/diag-takt-atem.cjs [--selftest]   (npm run gate:takt-atem; Port TAKT_ATEM_PORT, 4399)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, befundVon, rotListe, bildSeite, laufUhr, taeterFaelle, selbsttestEnde } = require("./lib/welt-boot.cjs");

const SOLL = { dichte: 0.1, stand: 0.1, lage: 0.1 };

function zeitUrteil(m, wer) {
    const v = [];
    if (m.dichteJeTakt > SOLL.dichte)
        v.push(
            `DICHTE ATMET${wer}: _foliageDensityScale wechselt in ${pz(m.dichteJeTakt)} der Takte (Soll ≤ ${pz(SOLL.dichte)}) — ` +
                `der Stand-Stempel stieg in ${pz(m.stempelDichteJeTakt)} der Takte allein durch sie`
        );
    if (m.stempelDichteJeTakt > SOLL.stand)
        v.push(
            `STAND WACH${wer}: die Dichte weckt über den Stand-Stempel die Fege-Takte in ${pz(m.stempelDichteJeTakt)} der Takte ` +
                `(Soll ≤ ${pz(SOLL.stand)}) — _tickArchitectureLOD geht ${m.archLodJeTakt} von ${m.bestand} Einträgen je Takt, ` +
                `_lodTreeVisHeight ${m.sichtHoeheJeTakt}, _foundrySichtHoehe ${m.foundryHoeheJeTakt} je Takt`
        );
    if (m.lageJeTakt > SOLL.lage)
        v.push(
            `LAGE FÄLLT${wer}: die Lage des Hauptbilds fällt in ${pz(m.lageJeTakt)} der Takte (Soll ≤ ${pz(SOLL.lage)}) — ` +
                `_chunkSatzAbschnitt ${m.abschnittJeTakt}, _hoehlenSicht ${m.hoehleJeTakt} je Takt`
        );
    return v;
}
const pz = (x) => (100 * x).toFixed(1) + " %";

function urteil(z) {
    const v = [];
    if (z.blind) v.push(`BLIND: ${z.blind}`);
    for (const s of zeitUrteil(z.kopf, "")) v.push(s);
    const g = zeitUrteil(z.gegenprobe, " (Gegenprobe)");
    if (!g.some((s) => s.startsWith("DICHTE ATMET")))
        v.push(
            `GEGENPROBE: die stoßende Dichte fällt nicht als DICHTE ATMET (${g.join(" · ") || "grün"}) — die Linse ist blind`
        );
    return v;
}

function selbsttest() {
    const gut = () => ({
        bestand: 95,
        takte: 570,
        dichteJeTakt: 0.03,
        stempelDichteJeTakt: 0.03,
        archLodJeTakt: 3.1,
        sichtHoeheJeTakt: 0.7,
        foundryHoeheJeTakt: 0.7,
        lageJeTakt: 0.03,
        abschnittJeTakt: 0.3,
        hoehleJeTakt: 0.03,
    });
    const gruen = {
        blind: null,
        kopf: gut(),
        gegenprobe: Object.assign(gut(), { dichteJeTakt: 1, stempelDichteJeTakt: 1, archLodJeTakt: 95, lageJeTakt: 1 }),
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (pfad, wert) => {
        const z = JSON.parse(JSON.stringify(gruen));
        let o = z;
        for (const k of pfad ? pfad.split(".") : []) o = o[k];
        Object.assign(o, wert);
        return z;
    };
    const faelle = [
        {
            name: "Dichte ohne Wand (V18.538)",
            z: mit("kopf", { dichteJeTakt: 0.52, stempelDichteJeTakt: 0.52 }),
            muss: /DICHTE ATMET: .* 52\.0 %/,
        },
        {
            name: "Stempel je Takt durch die Dichte",
            z: mit("kopf", { stempelDichteJeTakt: 0.5, archLodJeTakt: 47.5 }),
            muss: /STAND WACH: .* 50.0 % .* geht 47.5 von/,
        },
        {
            name: "Lage fällt je Takt",
            z: mit("kopf", { lageJeTakt: 0.5, abschnittJeTakt: 4.5 }),
            muss: /LAGE FÄLLT: .* 50\.0 %/,
        },
        {
            name: "Welt ohne Baum",
            z: mit("", { blind: "kein Baum der Stufen-Wahl in der Welt" }),
            muss: /BLIND: kein Baum/,
        },
        {
            name: "Gegenprobe blind",
            z: mit("gegenprobe", { dichteJeTakt: 0.02 }),
            muss: /GEGENPROBE: die stoßende Dichte fällt nicht/,
        },
    ];
    taeterFaelle(faelle, urteil, { fehler });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== TAKT-ATEM — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}


const PORT = Number(process.env.TAKT_ATEM_PORT) || 4399;
const server = statikServer();

// DER ATEM (Seiten-Kontext): der Regler in festen Schritten, je Takt Aktuator · Spiegel · Takt-Planer · Sicht des Hauptbilds.
function atem() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state;
        const P = Object.getPrototypeOf(r);
        const aus = { blind: null };
        const baeume = st.architectures.filter((a) => a && a.instanced && a._lodSpecies !== undefined).length;
        const lu = st.lodUniforms;
        const spiegel = /uLodPerf\.value\s*=\s*this\._lodPerfMul\(\)/.test(
            Function.prototype.toString.call(P._loopRender)
        );
        if (!baeume) aus.blind = "kein Baum der Stufen-Wahl in der Welt";
        else if (!st.chunkSaetze || !st.chunkSaetze.size) aus.blind = "kein Satz in der Welt";
        else if (!lu || !lu.uLodMaskOn || !(lu.uLodMaskOn.value > 0.5) || !lu.uLodPerf)
            aus.blind = "keine Blende (uLodMaskOn)";
        else if (!spiegel)
            aus.blind =
                "`_loopRender` spiegelt `uLodPerf` nicht mehr aus `_lodPerfMul()` — die Linse ahmte einen toten Weg nach";
        if (aus.blind) return aus;
        // die Zähler (Hüllen auf dem Prototyp, nach dem Lauf zurück)
        const Z = { f: {} };
        const huellen = [
            "_tickArchitectureLOD",
            "_lodTreeVisHeight",
            "_foundrySichtHoehe",
            "_chunkSatzAbschnitt",
            "_hoehlenSicht",
        ];
        const roh = {};
        for (const n of huellen) {
            roh[n] = P[n];
            P[n] = function (...a) {
                Z.f[n] = (Z.f[n] || 0) + 1;
                return roh[n].apply(this, a);
            };
        }
        const rohStempel = P._standStempel;
        let stempelDichte = 0;
        P._standStempel = function () {
            const W = this._standWache;
            const fd = W ? W.v[1] : undefined;
            const s0 = W ? W.stempel : 0;
            const out = rohStempel.call(this);
            if (this._standWache.stempel !== s0 && !Object.is(this._standWache.v[1], fd)) stempelDichte++;
            return out;
        };
        const rohAkt = P._nexusPerfActuate;
        const lageGen = () => {
            const M = r._passLagen;
            const a = M && M.get("haupt");
            return a ? a.gen : -1;
        };
        const lauf = async (stoss) => {
            const sinn = Object.assign({}, st.perfSense, {
                frameMs: 14,
                gpuQuelle: "proxy",
                renderCalls: 600,
                phase: { archCulling: 0.6, render: 2, streaming: 1.2, waterIso: 0.4, creatures: 0.8, physics: 0.9 },
            });
            // jeder Lauf beginnt am selben Stand: der Regler oben, die Ruhe-Uhr leer, die Stellgrößen voll
            r._folRuheSec = 0;
            st._foliageDensityScale = 1;
            // Plateaus: der Regler steht je 80 Takte auf einer Stufe und atmet darüber (±0,02 im Wechsel, der PID im Totband).
            // Gezählt wird nur die zweite Hälfte jedes Plateaus: das Folgen auf eine neue Stufe ist Arbeit, das Pendeln auf
            // einer stehenden Stufe ist der Täter.
            const stufen = [1, 0.7, 0.4, 0.1, 0.4, 0.7, 1];
            const kam = st.camera;
            const pm = st.playerMesh.position;
            const zaehl = { dichte: 0, stempel: 0, lagen: 0, arbeit: 0, f: {}, takte: 0 };
            let schub = 1,
                n = 0;
            for (const ls of stufen)
                for (let t = 0; t < 80; t++) {
                    const misst = t >= 40;
                    schub = -schub;
                    sinn.loadScale = Math.max(0, Math.min(1, ls + 0.02 * schub));
                    const fd0 = st._foliageDensityScale;
                    const sd0 = stempelDichte;
                    const W0 = r._standWache.takte.get("archLod");
                    const ar0 = W0 ? W0.arbeit : 0;
                    const f0 = Object.assign({}, Z.f);
                    rohAkt.call(r, sinn);
                    if (stoss)
                        st._foliageDensityScale = Math.max(0.22, Math.min(1, st._foliageDensityScale + 0.012 * schub));
                    const wechsel = !Object.is(st._foliageDensityScale, fd0);
                    lu.uLodPerf.value = r._lodPerfMul(); // wie `_loopRender` (der Spiegel ist oben geprüft)
                    r._runFrameScheduler(pm);
                    kam.updateMatrixWorld(true);
                    const g0 = lageGen();
                    r._passSicht(kam, false);
                    r._passSicht(kam, true);
                    if (misst) {
                        zaehl.takte++;
                        if (wechsel) zaehl.dichte++;
                        if (lageGen() !== g0) zaehl.lagen++;
                        zaehl.stempel += stempelDichte - sd0;
                        const W1 = r._standWache.takte.get("archLod");
                        zaehl.arbeit += (W1 ? W1.arbeit : 0) - ar0;
                        for (const k of Object.keys(Z.f)) zaehl.f[k] = (zaehl.f[k] || 0) + Z.f[k] - (f0[k] || 0);
                    }
                    if (++n % 60 === 0) await sleep(0);
                }
            const takte = zaehl.takte;
            const d = (x) => +((x || 0) / takte).toFixed(3);
            return {
                bestand: st.architectures.length,
                takte,
                dichteJeTakt: d(zaehl.dichte),
                stempelDichteJeTakt: d(zaehl.stempel),
                archLodJeTakt: +(zaehl.arbeit / takte).toFixed(1),
                sichtHoeheJeTakt: d(zaehl.f._lodTreeVisHeight),
                foundryHoeheJeTakt: d(zaehl.f._foundrySichtHoehe),
                lageJeTakt: d(zaehl.lagen),
                abschnittJeTakt: d(zaehl.f._chunkSatzAbschnitt),
                hoehleJeTakt: d(zaehl.f._hoehlenSicht),
                dichteEnde: +st._foliageDensityScale.toFixed(3),
            };
        };
        const t0 = performance.now();
        try {
            aus.kopf = await lauf(false);
            aus.gegenprobe = await lauf(true);
        } finally {
            for (const n of huellen) P[n] = roh[n];
            P._standStempel = rohStempel;
        }
        aus.ms = Math.round(performance.now() - t0);
        aus.welt = { baeume, saetze: st.chunkSaetze.size, archs: st.architectures.length };
        return aus;
    })();
}

(async () => {
    console.log("=== TAKT-ATEM — der Regler atmet, der Takt rechnet nur, was sich ändert ===");
    await server.lausche(PORT);
    const { browser, page } = await bildSeite({ art: "linse", frist: 600000 }, 320, 180);
    const log = laufUhr();
    const out = await befundVon(async () => {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // die Welt steht: Renderer, Foundry-Buch, Sätze und Bäume der Stufen-Wahl; danach ruht der Spiel-Loop
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            for (const weiter = window.__deckel("Renderer, Buch, Sätze und Bäume", 1200); weiter(); ) {
                const r = window.anazhRealm,
                    st = r && r.state;
                const n =
                    st && Array.isArray(st.architectures)
                        ? st.architectures.filter((a) => a && a.instanced && a._lodSpecies !== undefined).length
                        : 0;
                if (
                    st &&
                    st.rendererReady &&
                    r._foundry &&
                    r._foundry.recipes &&
                    st.chunkSaetze &&
                    st.chunkSaetze.size &&
                    n > 10
                )
                    break;
                await sleep(200);
            }
            // dann ruht der Bestand: 5 s ohne neuen Eintrag und ohne offenen Chunk-Bau (eine Welt im Aufbau weckt die Fege-Takte
            // selbst — der Zähler sähe ihr Wachsen statt des Atems)
            const r = window.anazhRealm,
                st = r && r.state;
            if (!st || !st.rendererReady) return { ok: false };
            let n0 = -1,
                seit = 0;
            for (let k = 0, weiter = window.__deckel("der ruhende Bestand", 960); weiter(); k++) {
                const n = st.architectures.length;
                const offen = st.voxelMeshPending ? st.voxelMeshPending.size : 0;
                if (n !== n0 || offen > 0) {
                    n0 = n;
                    seit = k;
                } else if (k - seit > 20) {
                    st.renderer.setAnimationLoop(null);
                    const b = st.architectures.filter((a) => a && a.instanced && a._lodSpecies !== undefined).length;
                    return { ok: true, ms: Math.round(performance.now() - t0), baeume: b, bestand: n };
                }
                await sleep(250);
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("die Welt stand nach 240 s nicht (Renderer, Buch, Sätze, Bäume)");
        log(
            `Welt bereit nach ${Math.round(bereit.ms / 1000)} s (${bereit.baeume} Bäume der Stufen-Wahl, Bestand ${bereit.bestand} ruht)`
        );
        const out = await page.evaluate(atem);
        if (out.kopf) {
            log(`Welt: ${JSON.stringify(out.welt)} · ${out.ms} ms für zwei Läufe zu ${out.kopf.takte} Takten`);
            log(`Kopf: ${JSON.stringify(out.kopf)}`);
            log(`Gegenprobe (stoßende Dichte): ${JSON.stringify(out.gegenprobe)}`);
        }
        return out;
    }, browser, server);
    const v = urteil(out);
    rotListe(v);
    const k = out.kopf;
    console.log(
        `\n✅ GRÜN — unter atmendem Regler (${k.takte} gezählte Takte auf stehenden Stufen 1 → 0,1 → 1) wechselt die Dichte in ${pz(k.dichteJeTakt)} ` +
            `der Takte, die Stufen-Wahl geht ${k.archLodJeTakt} von ${k.bestand} Einträgen je Takt, die Lage des Hauptbilds fällt in ` +
            `${pz(k.lageJeTakt)} der Takte; die stoßende Dichte der Gegenprobe fällt als DICHTE ATMET.`
    );
})();
