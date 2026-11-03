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
// DIE LEINE (w5-affekt): an gespannter GPU-Leine (`_gpuLeineStraff`, der Takt zeichnet kein Bild) schickt kein Glied des Takts
// GPU-Arbeit ab — sonst staut sie sich in jedem Takt ohne Bild (der Zeitraffer der Szene, affekt.K2#1: 744 s statt 83 s).
// Gezählt wird jede Abgabe an `device.queue.submit` in LEINE_TAKTE Takten von Hand ohne Pause (die Leine lockert nie), die
// Himmels-Sicht und die Umgebung in jedem Takt fällig; der Schreiber steht beim Namen (die Glieder des Stamms im Stapel).
//   GPU-ARBEIT NEBEN DER LEINE — eine Abgabe in einem Takt ohne Bild, der Schreiber beim Namen.
//   PLATZ GENOMMEN — ein Glied außer dem Bild des Takts und der Karte bindet sich selbst an die Leine: im freien Takt nimmt
//   es der Karte den Platz (w4-affekt 7105403d: die Tafeln und die Umgebung banden sich an, die Karte begann nie, und das
//   Weltbild der Mess-Wiese stand in gate:kamera-leib nie).
//   UMGEBUNG FEHLT — die Umgebung, die noch keine ist (der erste Bedarf), entsteht unter straffer Leine nicht: wer auf sie
//   wartet (das Licht des Orts, die Bestrahlung), wartete ewig.
// GEGENPROBE im selben Lauf: `_atmoTakt` ohne die Frage an die Leine fällt als GPU-ARBEIT NEBEN DER LEINE beim Namen
// `_atmoTakt` — sonst ist die Linse blind.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`).
//   node scripts/diag-takt-atem.cjs [--selftest]   (npm run gate:takt-atem)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const {
    statikServer,
    starteBrowser,
    laufUhr,
    taeterFaelle,
    selbsttestEnde,
    abwandlung,
    SELBSTTEST,
    fehlerText,
    seiteZu,
    rotListe,
} = require("./lib/welt-boot.cjs");

const SOLL = { dichte: 0.1, stand: 0.1, lage: 0.1 };
const LEINE_TAKTE = 40; // je Lauf der Leine (Kopf und Gegenprobe), die Umgebung des ersten Bedarfs 10

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

// DAS URTEIL DER LEINE: die Abgaben der Takte ohne Bild je Schreiber, die Umgebung des ersten Bedarfs, die Gegenprobe
const schreiberText = (m) =>
    Object.entries(m || {})
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `${k} ${n}×`)
        .join(" · ");
function leineUrteil(L) {
    if (!L) return ["LEINE BLIND: kein Lauf"];
    if (L.blind) return [`LEINE BLIND: ${L.blind}`];
    const v = [];
    if (L.kopf.ladeTakte > 0)
        v.push(`LEINE BLIND: ${L.kopf.ladeTakte} Takte unter dem Ladeschirm (dort ruht der Himmel ganz)`);
    if (!(L.kopf.straffTakte >= LEINE_TAKTE / 2))
        v.push(`LEINE BLIND: nur ${L.kopf.straffTakte} von ${L.kopf.takte} Takten unter straffer Leine`);
    if (L.kopf.abgaben > 0)
        v.push(
            `GPU-ARBEIT NEBEN DER LEINE: ${L.kopf.abgaben} Abgaben an die Queue in ${L.kopf.straffTakte} Takten ohne Bild — ` +
                `Schreiber ${schreiberText(L.kopf.schreiber)}`
        );
    if (Object.keys(L.kopf.binder || {}).length)
        v.push(
            `PLATZ GENOMMEN: ${schreiberText(L.kopf.binder)} bindet sich selbst an die Leine — im freien Takt nimmt er der Karte den ` +
                "Platz (an die Leine binden sich nur das Bild des Takts und die Karte)"
        );
    if (!(L.umgebung && L.umgebung.da))
        v.push(
            `UMGEBUNG FEHLT: ${L.umgebung ? L.umgebung.straffTakte : 0} Takte unter straffer Leine ohne die Umgebung des ersten ` +
                "Bedarfs — wer auf sie wartet (das Licht des Orts, die Bestrahlung), wartet ewig"
        );
    const g = L.gegenprobe || {};
    if (!Object.keys(g.schreiber || {}).some((k) => /_atmoTakt/.test(k)))
        v.push(
            `GEGENPROBE LEINE: _atmoTakt ohne die Frage an die Leine fällt nicht beim Namen (${schreiberText(g.schreiber) || "keine Abgabe"}) — die Linse ist blind`
        );
    return v;
}

function urteil(z) {
    const v = [];
    if (z.blind) v.push(`BLIND: ${z.blind}`);
    for (const s of leineUrteil(z.leine)) v.push(s);
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
        leine: {
            blind: null,
            kopf: { takte: 40, straffTakte: 38, ladeTakte: 0, abgaben: 0, karte: 24, schreiber: {}, binder: {} },
            gegenprobe: {
                takte: 40,
                straffTakte: 40,
                abgaben: 80,
                schreiber: { "_atmoZeichne ‹ _atmoTakt ‹ _applyDayNightToScene ‹ tickDayNight": 80 },
            },
            umgebung: { straffTakte: 10, da: true },
        },
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = abwandlung(gruen);
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
        {
            name: "die Umgebung zeichnet neben der Leine (vor w4-affekt 7105403d)",
            z: mit("leine.kopf", {
                abgaben: 46,
                schreiber: { "_buehneRender ‹ _ensureSkyEnvironment ‹ _applyDayNightToScene": 46 },
            }),
            muss: /GPU-ARBEIT NEBEN DER LEINE: 46 Abgaben .* 38 Takten ohne Bild — Schreiber _buehneRender ‹ _ensureSkyEnvironment/,
        },
        {
            name: "die Umgebung des ersten Bedarfs wartet auf die Leine",
            z: mit("leine.umgebung", { da: false }),
            muss: /UMGEBUNG FEHLT: 10 Takte unter straffer Leine/,
        },
        {
            name: "der Himmel bindet sich selbst an (w4-affekt 7105403d: die Karte begann nie)",
            z: mit("leine.kopf", { binder: { _atmoTakt: 2, _ensureSkyEnvironment: 2 } }),
            muss: /PLATZ GENOMMEN: _atmoTakt 2× · _ensureSkyEnvironment 2× bindet sich selbst an die Leine/,
        },
        {
            name: "der Ladeschirm steht (blind: der Himmel ruht)",
            z: mit("leine.kopf", { ladeTakte: 40 }),
            muss: /LEINE BLIND: 40 Takte unter dem Ladeschirm/,
        },
        {
            name: "die Leine lockert im Lauf (blind)",
            z: mit("leine.kopf", { straffTakte: 3 }),
            muss: /LEINE BLIND: nur 3 von 40 Takten/,
        },
        {
            name: "Gegenprobe der Leine blind",
            z: mit("leine.gegenprobe", { abgaben: 0, schreiber: {} }),
            muss: /GEGENPROBE LEINE: _atmoTakt .* \(keine Abgabe\)/,
        },
    ];
    taeterFaelle(faelle, urteil, { fehler });
    selbsttestEnde(fehler);
}

if (SELBSTTEST) {
    console.log("=== TAKT-ATEM — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const server = statikServer();

// DER ATEM (Seiten-Kontext): der Regler in festen Schritten, je Takt Aktuator · Spiegel · Takt-Planer · Sicht des Hauptbilds.
function atem() {
    return (async () => {
        const P = Object.getPrototypeOf(r);
        const aus = { blind: null };
        const baeume = st.architectures.filter((a) => a && a.instanced && a._lodSpecies !== undefined).length;
        const lu = st.lodUniforms;
        const spiegel = /uLodPerf\.value\s*=\s*this\._ankunftsFerne\(\)/.test(
            Function.prototype.toString.call(P._loopRender)
        );
        if (!baeume) aus.blind = "kein Baum der Stufen-Wahl in der Welt";
        else if (!st.chunkSaetze || !st.chunkSaetze.size) aus.blind = "kein Satz in der Welt";
        else if (!lu || !lu.uLodMaskOn || !(lu.uLodMaskOn.value > 0.5) || !lu.uLodPerf)
            aus.blind = "keine Blende (uLodMaskOn)";
        else if (!spiegel)
            aus.blind =
                "`_loopRender` spiegelt `uLodPerf` nicht mehr aus `_ankunftsFerne()` — die Linse ahmte einen toten Weg nach";
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
                    lu.uLodPerf.value = r._ankunftsFerne(); // wie `_loopRender` (der Spiegel ist oben geprüft)
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

// DIE LEINE (Seiten-Kontext): n Takte von Hand ohne Pause — nach dem zweiten Bild lockert die Leine nie (ihre Versprechen
// landen erst nach dem Lauf); je Takt die Himmels-Sicht und die Umgebung fällig. Gezählt jede Abgabe an die Queue in einem Takt,
// der an straffer Leine begann, mit den Gliedern des Stamms im Stapel (innen zuerst). Dann die Gegenprobe (`_atmoTakt` ohne die
// Frage, `leihe`) und die Umgebung des ersten Bedarfs (keine Umgebung, die Tafeln alt, 10 Takte).
async function leine(n) {
    const P = Object.getPrototypeOf(r);
    const q = r._gpuLeineQueue();
    if (!q) return { blind: "keine Queue (der Null-Renderer)" };
    // der gespielte Takt: unter dem Ladeschirm ruht ein Takt ohne Bild ganz (`_ladeTakt`, kein Himmel) — gezählt wird danach
    try {
        for (const weiter = __deckel("das Weltbild der Leine", 600); !st._weltbildDa && weiter();) await __takte(5, 20);
    } catch (e) {
        return { blind: `das Weltbild steht nicht (${String(e.message).slice(0, 160)})` };
    }
    if (!st.atmoLut || !st._skyEnvLast) return { blind: "der Himmel ist nie gezeichnet (atmoLut, die Umgebung)" };
    // die Glieder des Stamms im Stapel, innen zuerst (ohne den Takt und `ohne`)
    const glieder = (ohne) => {
        const namen = [];
        for (const zeile of String(new Error().stack).split("\n")) {
            const m = /at (?:[\w$]+\.)*([\w$]+) \(.*\/stamm\//.exec(zeile);
            if (m && m[1] !== "_gameLoopTick" && m[1] !== ohne && namen[namen.length - 1] !== m[1]) namen.push(m[1]);
        }
        return namen;
    };
    const rohSubmit = q.submit;
    let z = null;
    let w = null;
    q.submit = function (...a) {
        if (z) {
            const g = glieder();
            // DIE KARTE (lod.K3): die begonnene backt ihre Ringe ohne neue Frage (`_tickKarteWelt`), ihr Atlas wächst um eine neue Zelle
            // (`_karteWachsen`) — begrenzt je Karte, nie je Takt: gezählt, nie gerichtet
            if (g.includes("_tickKarteWelt") || g.includes("_karteWachsen")) z.karte++;
            else {
                z.abgaben++;
                const k = g.slice(0, 6).join(" ‹ ") || "(außerhalb des Stamms)";
                z.schreiber[k] = (z.schreiber[k] || 0) + 1;
            }
        }
        return rohSubmit.apply(this, a);
    };
    // DER PLATZ AN DER LEINE: an die Leine binden sich nur das Bild des Takts (`_gpuLeineAnlegen`, es deckt jede Arbeit davor) und
    // die Karte (`_tickKarteWelt`) — jeder andere Binder nimmt im freien Takt der Karte den Platz
    const binden = P._gpuLeineBinden;
    const zurueckBinden = leihe(P, {
        _gpuLeineBinden(...a) {
            const k = glieder("_gpuLeineBinden")[0] || "(außerhalb des Stamms)";
            if (w && k !== "_gpuLeineAnlegen" && k !== "_tickKarteWelt") w.binder[k] = (w.binder[k] || 0) + 1;
            return binden.apply(this, a);
        },
    });
    let uhr = performance.now();
    const lauf = (takte) => {
        w = { takte: 0, straffTakte: 0, ladeTakte: 0, abgaben: 0, karte: 0, schreiber: {}, binder: {} };
        for (let i = 0; i < takte; i++) {
            st.atmoLut.himmelSchluessel = null; // die Himmels-Sicht fällig
            if (st._skyEnvLast) st._skyEnvLast = Object.assign({}, st._skyEnvLast, { m: NaN }); // die Umgebung fällig
            st._skyEnvLastRegenMs = -Infinity;
            const straff = r._gpuLeineStraff();
            if (r._ladeTakt()) w.ladeTakte++;
            z = straff ? w : null;
            try {
                r._gameLoopTick((uhr += 1000));
            } finally {
                z = null;
            }
            w.takte++;
            if (straff) w.straffTakte++;
        }
        const fertig = w;
        w = null;
        return fertig;
    };
    const aus = { blind: null };
    try {
        aus.kopf = lauf(n);
        const atmo = P._atmoTakt;
        const zurueck = leihe(P, {
            _atmoTakt(...a) {
                const frei = leihe(this, { _gpuLeineStraff: () => false });
                try {
                    return atmo.apply(this, a);
                } finally {
                    frei();
                }
            },
        });
        try {
            aus.gegenprobe = lauf(n);
        } finally {
            zurueck();
        }
        st._skyEnvLast = null; // der erste Bedarf: keine Umgebung, die Tafeln alt
        st.atmoLut.tafelnFrisch = false;
        const u = lauf(10);
        aus.umgebung = { straffTakte: u.straffTakte, da: !!st._skyEnvLast };
    } finally {
        q.submit = rohSubmit;
        zurueckBinden();
    }
    return aus;
}

(async () => {
    console.log("=== TAKT-ATEM — der Regler atmet, der Takt rechnet nur, was sich ändert ===");
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 180 });
    let out = null;
    const log = laufUhr();
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // die Welt steht: Renderer, Foundry-Buch, Sätze und Bäume der Stufen-Wahl; danach ruht der Spiel-Loop
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            for (const weiter = __deckel("Renderer, Buch, Sätze und Bäume", 1200); weiter();) {
                const st = r && r.state;
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
            const st = r && r.state;
            if (!st || !st.rendererReady) return { ok: false };
            let n0 = -1,
                seit = 0;
            for (let k = 0, weiter = __deckel("der ruhende Bestand", 960); weiter(); k++) {
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
        out = await page.evaluate(atem);
        out.leine = await page.evaluate(leine, LEINE_TAKTE);
        const L = out.leine;
        if (L.blind) log(`Leine: blind — ${L.blind}`);
        if (L.kopf)
            log(
                `Leine: Kopf ${L.kopf.abgaben} Abgaben in ${L.kopf.straffTakte}/${L.kopf.takte} Takten ohne Bild (${schreiberText(L.kopf.schreiber) || "kein Schreiber"}; die begonnene Karte ${L.kopf.karte}), fremde Binder ${schreiberText(L.kopf.binder) || "keine"} · ` +
                    `Gegenprobe ${L.gegenprobe.abgaben} (${schreiberText(L.gegenprobe.schreiber)}) · Umgebung des ersten Bedarfs ${L.umgebung.da ? "da" : "FEHLT"} nach ${L.umgebung.straffTakte} Takten`
            );
        if (out.kopf) {
            log(`Welt: ${JSON.stringify(out.welt)} · ${out.ms} ms für zwei Läufe zu ${out.kopf.takte} Takten`);
            log(`Kopf: ${JSON.stringify(out.kopf)}`);
            log(`Gegenprobe (stoßende Dichte): ${JSON.stringify(out.gegenprobe)}`);
        }
    } catch (e) {
        out = { error: fehlerText(e) };
    }
    await seiteZu(browser, server, out);
    const v = urteil(out);
    rotListe(v);
    const k = out.kopf;
    console.log(
        `\n✅ GRÜN — unter atmendem Regler (${k.takte} gezählte Takte auf stehenden Stufen 1 → 0,1 → 1) wechselt die Dichte in ${pz(k.dichteJeTakt)} ` +
            `der Takte, die Stufen-Wahl geht ${k.archLodJeTakt} von ${k.bestand} Einträgen je Takt, die Lage des Hauptbilds fällt in ` +
            `${pz(k.lageJeTakt)} der Takte; die stoßende Dichte der Gegenprobe fällt als DICHTE ATMET. An straffer Leine (${out.leine.kopf.straffTakte} Takte ohne Bild, der ` +
            `Himmel je Takt fällig) 0 Abgaben an die Queue, die Umgebung des ersten Bedarfs entsteht; _atmoTakt ohne die Frage fällt beim Namen.`
    );
})();
