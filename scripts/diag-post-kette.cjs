#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-post-kette.cjs — DIE POST-KETTE UND IHR DIREKTPFAD (gate:post-kette): der Direktpfad ohne Post-Kette (der
// Rückfall, wenn die Kette scheitert, und die Weiche der Zerleg-Linse) zeichnet mit Tiefe, die Godrays tasten nur mit Stärke.
//
// Die Wand fährt den ECHTEN Renderer des Spiels (WebGPU auf swiftshader, Holz `kienspan`) mit seinem echten Frame
// (`_loopRender`) an einer eigenen Bühne in der Welt-Szene: eine nahe rote Kiste vor einer fernen grünen, eine Wasser-
// Fläche mit dem echten Wasser-Stoff (er liest die EINE Szenen-Tiefe `_szeneTiefe`). Sie nennt jeden Täter:
//   (a) WEICHE — Post-Kette → Direktpfad (die Weiche, wie die Zerleg-Linse sie stellt) → Post-Kette → ein Render-Fehler
//       der Kette (der Rückfall des Spiels): je Schritt N Frames in die Leinwand und eine Aufnahme aus dem Ausgabe-Pfad,
//       kein Fehler (Seite, Frame, GPU-Validierung), der Tiefen-Leser kopiert (sonst ist die Wand blind).
//   (b) TIEFE — der Direktpfad zeichnet mit Tiefe (`renderer.depth`, und die nahe Kiste deckt die ferne: die Bild-Mitte
//       ist rot), die Post-Kette ohne (die Leinwand trägt keine Tiefe, auch keine GPU-Textur nach einem Ausflug).
//   (c) SHADER — das erzeugte Fragment der Ausgabe (scripts/lib/shader-kosten.cjs): höchstens 9 unbedingte Abtastungen
//       (Bloom samt Mitte), mindestens 24 in Zweigen (Godrays 20 + lokaler Kontrast 4 hinter ihrer Stärke).
//   (d) GODRAYS — mit der Sonne im Bild trägt der Zweig: das Bild mit Godrays weicht von dem ohne ab (über dem Rausch-Boden
//       zweier gleicher Aufnahmen).
//   (f) SAUM — auf UNGERADER Leinwand (321×241) liest jedes Pixel den Block des Abbilds, der es enthält: ein schräger
//       schwarzer Pfahl steht im Wasser, je Zeile das Wasser-Pixel links an seiner Kante mit Abbild und mit r184s Tiefe.
//   (e) WASSER — das Wasser über einem hellen Grund (0,3 m) liest das Tiefen-Abbild wie r184s Viewport-Tiefe: bei festen
//       Uhren dieselbe Farbe mit dem Abbild und mit dem vollen Klon, und ohne Grund eine andere (die Probe hängt an der
//       Tiefe). Die Bühnen-Ebene trägt die Wicklung des Iso-Wassers (Vorderseite unten, der Stoff zeichnet BackSide).
//   (g) RAHMEN-ZIEL — der Direktpfad zeichnet in r184s Rahmen-Ziel (`_getFrameBufferTarget`, rgba16float +
//       depth24plus, `isPostProcessingRenderTarget` → im Band `tex:r184-ausgabe`); die Post-Kette legt es nie an. Vor dem
//       ersten Ausflug, nach der Rückkehr und am Ende lebt keines, im Direktpfad steht es, und die Regel der Band
//       (`rahmenZielBefunde`) nennt es.
//       DIE DRIFT: fehlt r184s Abschied am Leinwand-Ziel, fällt das Ziel trotzdem, und `_rahmenZielAbschied`
//       meldet ERROR — eine ERROR-Zeile von ihm außerhalb der Probe und jede andere ERROR-Zeile der Seite sind rot.
//   (h) DUNKEL (D3-N2, der Abend) — eine flache Fläche füllt das Bild mit dunklem Szenen-Licht, belichtet gleich hell
//       (0,05 bei Belichtung 1, 0,0125 bei 4 — ein Schatten 1,6 EV unter dem belichteten Mittelgrau): das Bild ist nicht schwarz
//       und bei beiden Belichtungen gleich: der Kontrast dreht über Belichtung 1 um 0,5 nach der Belichtung (25c).
//       DIE NACHT (D3-2): 0,02 bei Belichtung 1 und nightFactor 1 (der Boden im Mondlicht, unter dem Schnitt der Tag-Kurve) ist
//       nicht schwarz — der Kontrast fadet zur Nacht aus wie die Entgrauung (25c).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Shader-Kosten-Linse an gebauten WGSL-Stücken und das
// Urteil über einen grünen Lauf und je einen injizierten Täter — jeder fällt rot und wird genannt.
//   node scripts/diag-post-kette.cjs [--selftest]   (npm run gate:post-kette)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser, laufUhr, taeterFaelle, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");
const SK = require("./lib/shader-kosten.cjs");
const BAND = require("./lib/band-urteil.cjs");

const N_FRAMES = 4;
const BUDGET_AUSGABE = { unbedingtMax: 9, zweigMin: 24 };
// Die Godrays ändern mit der Sonne im Bild mindestens so viele Pixel (% des Bildes, je Pixel ≥ 4/255 in einem Kanal) —
// sie sitzen um die Sonne.
const GODRAY_MIN_PCT = 2;
// Das Wasser über dem Grund (unten im Bild, Mittel je Kanal in 8 bit): mit dem Tiefen-Abbild höchstens WASSER_TOL von
// r184s Viewport-Tiefe entfernt; zweimal das Abbild höchstens WASSER_RAUSCHEN; ohne Grund mindestens WASSER_TIEFE_MIN
// anders. Mit dem Wasser der Welle L las das 2×2-Maximum 6,0 daneben; das waagrechte Paar (die Zeile ganz) 0.
const WASSER_TOL = 4;
const WASSER_RAUSCHEN = 1;
const WASSER_TIEFE_MIN = 15;
// (f) Der Saum auf ungerader Leinwand: so viele Kanten-Pixel links am Pfahl dürfen zwischen Abbild und r184s Tiefe
// höchstens um mehr als 8 Luma abweichen (Rauschen), und so viele Kanten-Pixel braucht die Probe mindestens (sonst blind).
const SAUM_MAX = 2;
const SAUM_KANTEN_MIN = 10;
// (h) Das Dunkel: die dunkle Fläche zeigt im Mittel mindestens DUNKEL_LUMA_MIN Luma, und die zwei Belichtungen desselben
// belichteten Lichts weichen höchstens DUNKEL_TOL Luma voneinander ab. Die lineare Kurve schneidet 2,5 EV unter dem belichteten
// Mittelgrau ab (0,028 belichtet), die Tonkurve der Ausgabe (BELICHTUNG.kurve, Neutral: Fuß 6,25·x²) gar nicht; 0,05 liegt über beiden.
const DUNKEL_LUMA_MIN = 3;
const DUNKEL_TOL = 1.5;
// (h) Die Nacht (D3-2): das Licht des Bodens im Mondlicht (0,02 Szenen-Einheiten bei Belichtung 1, unter dem Schnitt der
// Tag-Kurve bei 0,028) bei nightFactor 1 zeigt mindestens DUNKEL_LUMA_MIN Luma — der Kontrast fadet zur Nacht aus wie die
// Entgrauung.
const DUNKEL_NACHT_LICHT = 0.02;

function urteil(z) {
    const v = [];
    const schritte = z.schritte || [];
    if (z.abbruch) v.push(`ABBRUCH: die Bühne brach ab — ${z.abbruch}`);
    if (schritte.length < 4) v.push(`WEICHE: nur ${schritte.length} von 4 Schritten liefen`);
    for (const s of schritte) {
        for (const f of s.fehler || []) v.push(`WEICHE: ${s.name} — ${f}`);
        if (!(s.tiefenKopien > 0))
            v.push(`WEICHE: ${s.name} — der Tiefen-Leser kopierte nie (die Wand ist blind für die Szenen-Tiefe)`);
        if (s.direkt) {
            if (s.tiefe !== true)
                v.push(`TIEFE: ${s.name} — der Direktpfad zeichnet ohne Tiefe (renderer.depth ${s.tiefe})`);
        } else {
            if (s.tiefe !== false)
                v.push(`TIEFE: ${s.name} — die Post-Kette trägt eine Leinwand-Tiefe (renderer.depth ${s.tiefe})`);
            if (s.leinwandTiefeGpu)
                v.push(`TIEFE: ${s.name} — die GPU-Textur der Leinwand-Tiefe lebt in der Post-Kette weiter`);
        }
        const ab = s.abbild || { fehlt: true };
        if (ab.fehlt) v.push(`ABBILD: ${s.name} — kein Tiefen-Abbild (die Leser der Szenen-Tiefe lesen nichts)`);
        else {
            // halbe Breite, ganze Höhe: je Texel das waagrechte Pixel-Paar (die Zeile bleibt ganz — das Wasser liest den Grund
            // seiner Zeile, gemessen am 2×2-Maximum (e) 6 Stufen und (f) 7 Kanten-Pixel bis 14 Luma daneben)
            const halb = [Math.ceil((ab.leinwand || [0, 0])[0] / 2), (ab.leinwand || [0, 0])[1]];
            if (ab.format !== "r32float" || !ab.groesse || ab.groesse[0] !== halb[0] || ab.groesse[1] !== halb[1])
                v.push(
                    `ABBILD: ${s.name} — ${ab.format} ${(ab.groesse || []).join("×")} statt r32float ${halb.join("×")} (halbe Breite, ganze Höhe)`
                );
            if (!(Math.abs(ab.mitte - ab.soll) < 1e-4))
                v.push(
                    `ABBILD: ${s.name} — an der Bild-Mitte ${ab.mitte} statt der Kisten-Tiefe ${ab.soll} (das Abbild trägt die Szene nicht)`
                );
        }
        const m = s.mitte;
        if (!m || !(m[0] > 1.5 * m[1] && m[0] > 40))
            v.push(
                `TIEFE: ${s.name} — die Bild-Mitte ist ${JSON.stringify(m)}, nicht die nahe rote Kiste (Tiefentest fehlt)`
            );
    }
    const b = z.buehne || {};
    if (!(b.wasserY < b.eisNull))
        v.push(`BÜHNE: ihr Wasser (${b.wasserY} m) liegt über der Eis-Linie (${b.eisNull} m) — Saum und Wasser messen Eis`);
    const w = z.wasser;
    const abst = (a, b) => (a && b ? Math.max(...[0, 1, 2].map((c) => Math.abs(a[c] - b[c]))) : NaN);
    if (!w) v.push("WASSER: die Probe Abbild gegen r184s Viewport-Tiefe lief nicht");
    else {
        if (!((w.umgehaengt || [])[0] > 0 && w.umgehaengt[1] > 0))
            v.push(
                `WASSER: das Bühnen-Wasser wurde nicht umgehängt (${JSON.stringify(w.umgehaengt)}) — die Probe vergleicht nichts`
            );
        if (!(abst(w.abbild, w.zurueck) <= WASSER_RAUSCHEN))
            v.push(
                `WASSER: zweimal das Abbild bei festen Uhren ${JSON.stringify(w.abbild)} / ${JSON.stringify(w.zurueck)} — der Rausch-Boden trägt keinen Vergleich`
            );
        if (!(abst(w.abbild, w.ohneGrund) >= WASSER_TIEFE_MIN))
            v.push(
                `WASSER: mit und ohne Grund ${JSON.stringify(w.abbild)} / ${JSON.stringify(w.ohneGrund)} — die Farbe hängt nicht an der Tiefe (die Probe ist blind)`
            );
        if (!(abst(w.abbild, w.r184) <= WASSER_TOL))
            v.push(
                `WASSER: mit dem Abbild ${JSON.stringify(w.abbild)}, mit r184s Viewport-Tiefe ${JSON.stringify(w.r184)} (Soll ≤ ${WASSER_TOL} je Kanal) — das Wasser liest eine andere Tiefe`
            );
    }
    const sm = z.saum;
    if (!sm) v.push("SAUM: die Probe auf ungerader Leinwand lief nicht");
    else if (sm.abbruch) v.push(`SAUM: ABBRUCH — ${sm.abbruch}`);
    else {
        const lw = sm.leinwand || [0, 0];
        if (!(lw[0] % 2 === 1 && lw[1] % 2 === 1))
            v.push(`SAUM: die Leinwand ${lw.join("×")} ist nicht ungerade (die Probe ist blind)`);
        if (!(sm.kanten >= SAUM_KANTEN_MIN && sm.paritaeten === 2))
            v.push(
                `SAUM: ${sm.kanten} Kanten-Pixel in ${sm.paritaeten} Paritäten — kein Gegenstand vor dem Wasser (die Probe ist blind)`
            );
        else if (!(sm.abweichend <= SAUM_MAX))
            v.push(
                `SAUM: ${sm.abweichend} von ${sm.kanten} Kanten-Pixeln links am Gegenstand weichen bis ${sm.dMax} Luma ab — das Abbild liest auf ungerader Leinwand den Nachbar-Block (ein heller Saum)`
            );
        if (sm.gpuFehler && sm.gpuFehler.length)
            v.push(`SAUM: ${sm.gpuFehler.length} GPU-Validierungs-Fehler: ${sm.gpuFehler[0]}`);
    }
    // (g) DAS RAHMEN-ZIEL: der Direktpfad legt es an (sonst ist die Probe blind), und die Regel der Band nennt es; in der
    // Post-Kette — vor dem ersten Ausflug, nach der Rückkehr und am Ende — lebt keines
    const rahmenRot = (wo, rz) => {
        if (!rz) return v.push(`RAHMEN-ZIEL: ${wo} — nicht gemessen (die Wand ist blind)`);
        if (rz.ziele > 0 || rz.n > 0)
            v.push(
                `RAHMEN-ZIEL: ${wo} — ${rz.ziele} r184-Rahmen-Ziel(e) leben in der Post-Kette weiter: ` +
                    (BAND.rahmenZielBefunde(null, { erzeuger: [{ erzeuger: "r184-ausgabe", mb: rz.mb, n: rz.n }] })
                        .map((b) => b.text)
                        .join("") || `${rz.ziele} Ziel(e) ohne Textur`)
            );
    };
    for (const s of schritte) {
        if (s.name === "Render-Fehler") continue; // der Rückfall des Spiels bleibt im Direktpfad, sein Ziel ist in Gebrauch
        if (!s.direkt) rahmenRot(s.name, s.rahmenZiel);
        else if (
            !(s.rahmenZiel && s.rahmenZiel.ziele >= 1 && s.rahmenZiel.n >= 1) ||
            BAND.rahmenZielBefunde(null, {
                erzeuger: [{ erzeuger: "r184-ausgabe", mb: s.rahmenZiel.mb, n: s.rahmenZiel.n }],
            }).length !== 1
        )
            v.push(
                `RAHMEN-ZIEL: ${s.name} — r184 legte kein Rahmen-Ziel an, oder die Band nennt es nicht ` +
                    `(${JSON.stringify(s.rahmenZiel)}) — die Probe ist blind`
            );
    }
    if (schritte.length >= 4) rahmenRot("am Ende (nach Wasser und Godrays)", z.rahmenEnde);
    // (g) die Drift: ohne r184s Hörer fällt das Ziel trotzdem (die Schritt-Prüfung oben: „Post-Kette nach Drift" trägt 0), und
    // der Abschied meldet es LAUT — eine ERROR-Zeile von `_rahmenZielAbschied` außerhalb der Drift ist rot
    const DRIFT = /RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt/;
    const d = z.drift;
    if (!d) v.push("RAHMEN-ZIEL: die Drift-Probe lief nicht (der zweite Abschied steht ohne Wand)");
    else if (!(d.hoererWeg >= 1))
        v.push("RAHMEN-ZIEL: am Leinwand-Ziel hängt kein r184-Abschied (`_frameBufferTargets.delete(`) — Vendor-Drift, die Probe ist blind");
    else if (!(d.fehler || []).some((f) => DRIFT.test(f)))
        v.push(`RAHMEN-ZIEL: ohne r184s Hörer fiel der Abschied STILL (${JSON.stringify(d.fehler)}) — die Drift bräche nur im Log`);
    const rahmenErrors = (z.konsolenFehler || []).filter((t) => /RAHMEN-ZIEL/.test(t));
    const erwartet = d ? (d.fehler || []).filter((f) => DRIFT.test(f)).length : 0;
    if (rahmenErrors.length > erwartet)
        v.push(
            `RAHMEN-ZIEL: ${rahmenErrors.length - erwartet} ERROR-Zeile(n) von \`_rahmenZielAbschied\` außerhalb der Drift-Probe: ${rahmenErrors[0]}`
        );
    // (a) DER ERZWUNGENE BRUCH: der Render-Fehler, den die Wand selbst in die Kette wirft, bricht LAUT beim Namen
    // (`_loopRender` → `_stoffBruch`, ERROR „STOFF: die Post-Kette …" mit der Ursache) — GENAU EINMAL; still (0) ist rot,
    // ein zweiter ist rot. Bis zur Nachbesserung 2 zählte die Konsolen-Wand ihn als fremd (die CI voll 6/11 rot).
    const ERZWUNGEN = /\[ERROR\] STOFF: die Post-Kette .*gate:post-kette — erzwungener Render-Fehler der Kette/;
    const fang = schritte.find((s) => s.name === "Render-Fehler");
    const erzwungen = (z.konsolenFehler || []).filter((x) => ERZWUNGEN.test(x));
    if (fang && erzwungen.length !== 1)
        v.push(
            `WEICHE: der erzwungene Render-Fehler der Kette meldet ${erzwungen.length}× „STOFF: die Post-Kette …" (Soll genau 1 — ${erzwungen.length ? "doppelt" : "er bricht STILL"})`
        );
    for (const t of (z.konsolenFehler || []).filter((x) => !/RAHMEN-ZIEL/.test(x) && !ERZWUNGEN.test(x)))
        v.push(`KONSOLE: ${t}`);
    if (fang && !fang.direkt) v.push("WEICHE: nach dem Render-Fehler der Kette fährt der Loop nicht den Direktpfad");
    if (z.gpuFehler && z.gpuFehler.length) v.push(`GPU: ${z.gpuFehler.length} Validierungs-Fehler: ${z.gpuFehler[0]}`);
    if (!z.ausgabe) v.push("SHADER: kein Fragment der Ausgabe gefunden (die Linse ist blind)");
    else for (const x of SK.kostenUrteil(z.ausgabe, BUDGET_AUSGABE, "SHADER: Ausgabe der Post-Kette")) v.push(x);
    const dk = z.dunkel;
    if (!dk) v.push("DUNKEL: die Probe lief nicht");
    else if (!(dk.k1 === 1 && dk.k4 === 4))
        v.push(`DUNKEL: die Belichtung stand bei ${dk.k1} / ${dk.k4} statt 1 / 4 (die Probe ist blind)`);
    else if (!(Math.min(dk.luma1, dk.luma4) >= DUNKEL_LUMA_MIN))
        v.push(
            `DUNKEL: dunkles Szenen-Licht (0,05 bei Belichtung 1, 0,0125 bei 4) zeigt Luma ${dk.luma1} / ${dk.luma4} (Soll ≥ ${DUNKEL_LUMA_MIN}) — die Kette schneidet dunkles Licht ab (der Kontrast des Gradings vor der Belichtung)`
        );
    else if (!(Math.abs(dk.luma1 - dk.luma4) <= DUNKEL_TOL))
        v.push(
            `DUNKEL: dasselbe belichtete Licht zeigt bei Belichtung 1 Luma ${dk.luma1}, bei 4 Luma ${dk.luma4} (Soll ≤ ${DUNKEL_TOL} Abstand) — das Grading hängt an der Belichtung`
        );
    if (dk && dk.nachtFaktor !== 1)
        v.push(`DUNKEL: die Nacht stand bei nightFactor ${dk.nachtFaktor} statt 1 (die Probe ist blind)`);
    else if (dk && !(dk.lumaNacht >= DUNKEL_LUMA_MIN))
        v.push(
            `DUNKEL: das Licht der Nacht (${DUNKEL_NACHT_LICHT} bei Belichtung 1, nightFactor 1) zeigt Luma ${dk.lumaNacht} (Soll ≥ ${DUNKEL_LUMA_MIN}) — der Kontrast des Gradings schwärzt die Nacht (Post-Kette 25c: er fadet nicht über nightFactor)`
        );
    const g = z.godray || {};
    if (!(g.staerke > 0)) v.push(`GODRAYS: die Sonne im Bild gibt Stärke ${g.staerke} (die Probe ist blind)`);
    else if (!(g.aenderungPct >= GODRAY_MIN_PCT))
        v.push(
            `GODRAYS: mit der Sonne im Bild ändern die Godrays ${g.aenderungPct} % der Pixel (Soll ≥ ${GODRAY_MIN_PCT}) — der Zweig trägt nicht`
        );
    else if (!(g.rauschenPct < g.aenderungPct / 2))
        v.push(
            `GODRAYS: der Rausch-Boden ${g.rauschenPct} % liegt zu nah an der Änderung ${g.aenderungPct} % (die Probe ist blind)`
        );
    return v;
}

function selbsttest() {
    const fehler = SK.selbsttest().map((s) => "Shader-Kosten-Linse: " + s);
    const ausgabe = {
        einstieg: "main",
        abtastungen: { gesamt: 33, unbedingt: 9, zweig: 24, schleife: 0 },
        schleifen: 0,
        rauschen: 0,
    };
    const schritt = (name, direkt) => ({
        name,
        direkt,
        fehler: [],
        tiefenKopien: 4,
        tiefe: direkt,
        leinwandTiefeGpu: false,
        rahmenZiel: direkt ? { ziele: 1, n: 2, mb: 0.01 } : { ziele: 0, n: 0, mb: 0 },
        mitte: [190, 40, 40],
        abbild: { format: "r32float", groesse: [16, 24], leinwand: [32, 24], mitte: 0.98, soll: 0.98 },
    });
    const gruen = {
        schritte: [
            schritt("Post-Kette", false),
            schritt("Direktpfad", true),
            schritt("Post-Kette zurück", false),
            schritt("Render-Fehler", true),
            schritt("Post-Kette nach Drift", false),
        ],
        drift: {
            hoererWeg: 1,
            fehler: ["RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt"],
        },
        konsolenFehler: [
            "[AnazhRealm V18.543] [ERROR] STOFF: die Post-Kette (Render-Lauf: TRAA · Bloom · Grading) — der Schirm zeichnet direkt — gate:post-kette — erzwungener Render-Fehler der Kette",
            "[AnazhRealm V18.536] [ERROR] RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt",
        ],
        gpuFehler: [],
        ausgabe,
        godray: { staerke: 0.6, aenderungPct: 14, rauschenPct: 0 },
        buehne: { boden: 90.3, wasserY: 147.1, eisNull: 157.1 },
        wasser: {
            umgehaengt: [1, 1],
            abbild: [60, 90, 80],
            r184: [60, 91, 80],
            zurueck: [60, 90, 80],
            ohneGrund: [20, 40, 50],
        },
        saum: { leinwand: [321, 241], kanten: 30, abweichend: 0, dMax: 3, paritaeten: 2, gpuFehler: [] },
        rahmenEnde: { ziele: 0, n: 0, mb: 0 },
        dunkel: { k1: 1, k4: 4, luma1: 8, luma4: 8, nachtFaktor: 1, lumaNacht: 6 },
    };
    const faelle = [
        ["der grüne Lauf", () => {}],
        ["Direktpfad stürzt", (z) => (z.schritte[1].fehler = ["TypeError: Invalid value used as weak map key"]), /Direktpfad — TypeError/],
        ["Direktpfad ohne Tiefe", (z) => (z.schritte[1].tiefe = false), /Direktpfad zeichnet ohne Tiefe/],
        ["Leinwand-Tiefe in der Kette", (z) => (z.schritte[2].tiefe = true), /trägt eine Leinwand-Tiefe/],
        ["GPU-Textur bleibt", (z) => (z.schritte[2].leinwandTiefeGpu = true), /GPU-Textur der Leinwand-Tiefe lebt/],
        ["Rahmen-Ziel bleibt nach dem Ausflug (0710-9: band nach zerlegen, +23,7 MB)", (z) => (z.schritte[2].rahmenZiel = { ziele: 1, n: 2, mb: 23.73 }), /RAHMEN-ZIEL: Post-Kette zurück — 1 r184-Rahmen-Ziel\(e\) leben .*23\.7 MB in 2 Texturen — Rahmen-Ziel des Direktpfads/],
        ["Rahmen-Ziel am Ende", (z) => (z.rahmenEnde = { ziele: 1, n: 0, mb: 0 }), /RAHMEN-ZIEL: am Ende .* 1 Ziel\(e\) ohne Textur/],
        ["Direktpfad ohne Rahmen-Ziel (blind)", (z) => (z.schritte[1].rahmenZiel = { ziele: 0, n: 0, mb: 0 }), /RAHMEN-ZIEL: Direktpfad — r184 legte kein Rahmen-Ziel an/],
        ["Rahmen-Ziel ungemessen", (z) => delete z.schritte[0].rahmenZiel, /nicht gemessen/],
        ["Drift: das Ziel bleibt ohne r184s Hörer", (z) => (z.schritte[4].rahmenZiel = { ziele: 1, n: 2, mb: 0.88 }), /RAHMEN-ZIEL: Post-Kette nach Drift — 1 r184-Rahmen-Ziel/],
        ["Drift: der Abschied fällt still", (z) => (z.drift.fehler = []), /ohne r184s Hörer fiel der Abschied STILL/],
        ["Drift: kein r184-Hörer zu finden (Vendor-Drift)", (z) => (z.drift.hoererWeg = 0), /kein r184-Abschied .* die Probe ist blind/],
        ["Drift-Probe fehlt", (z) => delete z.drift, /die Drift-Probe lief nicht/],
        ["ERROR von _rahmenZielAbschied außerhalb der Drift", (z) => z.konsolenFehler.push("[AnazhRealm V18.536] [ERROR] RAHMEN-ZIEL: r184s Abschied … (Vendor-Drift)"), /1 ERROR-Zeile\(n\) von `_rahmenZielAbschied` außerhalb der Drift-Probe/],
        ["der erzwungene Render-Fehler bricht still", (z) => (z.konsolenFehler = z.konsolenFehler.filter((x) => !/STOFF:/.test(x))), /WEICHE: der erzwungene Render-Fehler der Kette meldet 0× .*er bricht STILL/],
        ["der erzwungene Render-Fehler bricht doppelt", (z) => z.konsolenFehler.push(z.konsolenFehler[0]), /WEICHE: der erzwungene Render-Fehler der Kette meldet 2× .*doppelt/],
        ["ein fremder Stoff-Bruch der Seite", (z) => z.konsolenFehler.push("[AnazhRealm V18.543] [ERROR] STOFF: die Post-Kette (Render-Lauf) — Knoten fehlt"), /KONSOLE: .*STOFF: die Post-Kette \(Render-Lauf\) — Knoten fehlt/],
        ["eine fremde ERROR-Zeile der Seite", (z) => z.konsolenFehler.push("[AnazhRealm V18.536] [ERROR] Post-Processing fehlt"), /KONSOLE: .*Post-Processing fehlt/],
        ["Abbild fehlt", (z) => (z.schritte[0].abbild = { fehlt: true }), /kein Tiefen-Abbild/],
        ["Abbild in voller Auflösung", (z) => (z.schritte[1].abbild.groesse = [32, 24]), /statt r32float 16×24/],
        ["Abbild als 2×2-Block (die Zeile halbiert)", (z) => (z.schritte[1].abbild.groesse = [16, 12]), /statt r32float 16×24/],
        ["Abbild leer", (z) => (z.schritte[2].abbild.mitte = 1), /trägt die Szene nicht/],
        ["Wasser liest eine andere Tiefe (vec4-Weg)", (z) => (z.wasser.r184 = [75, 118, 105]), /das Wasser liest eine andere Tiefe/],
        ["Wasser-Probe blind", (z) => (z.wasser.ohneGrund = z.wasser.abbild), /Probe ist blind/],
        // stoffe-k3-phasen a3b87db1: die Bühne 160 m über Genesis (247,3 m) über der Eis-Linie 157,1 m
        ["Bühne im Eis", (z) => (z.buehne.wasserY = 247.3), /über der Eis-Linie/],
        ["Wasser nicht umgehängt", (z) => (z.wasser.umgehaengt = [0, 1]), /nicht umgehängt/],
        ["Wasser-Probe fehlt", (z) => delete z.wasser, /lief nicht/],
        ["Saum auf ungerader Leinwand (Gegenprüfung 0710-3: 37 von 561 Kanten-Pixeln bis +25 Luma)", (z) => Object.assign(z.saum, { abweichend: 14, dMax: 25 }), /Nachbar-Block/],
        ["Saum-Probe auf gerader Leinwand (blind)", (z) => (z.saum.leinwand = [320, 240]), /nicht ungerade/],
        ["kein Gegenstand vor dem Wasser (blind)", (z) => Object.assign(z.saum, { kanten: 0, paritaeten: 0 }), /kein Gegenstand vor dem Wasser/],
        ["ferne Kiste vorn", (z) => (z.schritte[1].mitte = [40, 190, 40]), /Tiefentest fehlt/],
        ["Tiefen-Leser blind", (z) => (z.schritte[0].tiefenKopien = 0), /kopierte nie/],
        ["Fang ohne Direktpfad", (z) => (z.schritte[3].direkt = false), /nicht den Direktpfad/],
        ["GPU-Validierung", (z) => (z.gpuFehler = ["Attachment state mismatch"]), /Validierungs-Fehler/],
        ["Godrays unbedingt", (z) => Object.assign(z.ausgabe.abtastungen, { unbedingt: 29, zweig: 4 }), /29 unbedingte Abtastungen/],
        ["Shader blind", (z) => (z.ausgabe = null), /kein Fragment der Ausgabe/],
        ["Bühne bricht ab", (z) => (z.abbruch = "TypeError: x"), /ABBRUCH/],
        ["Godray-Zweig trägt nicht", (z) => (z.godray.aenderungPct = 0), /der Zweig trägt nicht/],
        ["Godray-Probe blind", (z) => (z.godray.staerke = 0), /die Probe ist blind/],
        ["Grading schneidet dunkles Licht ab", (z) => Object.assign(z.dunkel, { luma1: 0, luma4: 0 }), /DUNKEL: .*schneidet dunkles Licht ab/],
        ["Grading hängt an der Belichtung", (z) => Object.assign(z.dunkel, { luma1: 12, luma4: 7 }), /DUNKEL: .*hängt an der Belichtung/],
        ["Dunkel-Probe fehlt", (z) => delete z.dunkel, /DUNKEL: die Probe lief nicht/],
        ["Kontrast schwärzt die Nacht", (z) => (z.dunkel.lumaNacht = 0), /DUNKEL: das Licht der Nacht .*Post-Kette 25c/],
        ["Nacht-Probe blind", (z) => (z.dunkel.nachtFaktor = 0), /DUNKEL: die Nacht stand bei nightFactor 0/],
    ];
    taeterFaelle(faelle, urteil, { fehler, gruen });
    selbsttestEnde(fehler, "die Shader-Kosten-Linse zählt richtig, jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== POST-KETTE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const fs = require("fs");

const server = statikServer();

// (f) DER SAUM AUF UNGERADER LEINWAND (Seiten-Kontext, nach `buehne`; die Seite steht auf einer ungeraden Größe): das Wasser
// über dem hellen Grund, darin ein schwarzer, schräg stehender Pfahl in der rechten Bildhälfte (seine Kante wechselt von
// Zeile zu Zeile die Spalte, also beide Paritäten). Je Wasser-Zeile das Pixel links an der Kante des Pfahls, mit dem
// Tiefen-Abbild und mit r184s Viewport-Tiefe bei festen Uhren, in voller Auflösung: liest das Wasser den Block, der sein
// Pixel enthält, ist es dasselbe Wasser; liest es den Nachbar-Block (der Pfahl, nah), ist es durchsichtig — ein heller Saum.
function saumProbe(ort) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        const dev = rend.backend.device;
        const gpuFehler = [];
        const gpuHoer = (e) => gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        const cam = st.camera;
        const { x: x0, y: y0, z: z0 } = ort; // die Bühne der Wand (`buehne`): ihr Wasser ist flüssig
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        const gruppe = new T.Group();
        gruppe.name = "post-kette:SAUM";
        const [wasser, grund] = window.__postWasser; // das Wasser und der Grund der Bühne (`buehne`), an ihrem Ort
        const pfahl = new T.Mesh(new T.BoxGeometry(0.5, 4, 0.5), new T.MeshBasicNodeMaterial({ color: 0x000000 }));
        pfahl.position.set(x0 + 2.5, y0 - 3, z0 - 9);
        pfahl.rotation.z = 0.35;
        for (const m of [wasser, grund, pfahl]) {
            m.frustumCulled = false;
            gruppe.add(m);
        }
        st.scene.add(gruppe);
        const db = rend.getDrawingBufferSize(new T.Vector2());
        const W = Math.round(db.x),
            H = Math.round(db.y);
        const aufnahme = async () => {
            for (let i = 0; i < 3; i++) {
                setzeKamera();
                if (rend._nodes?.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender();
            }
            setzeKamera();
            const { u8 } = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
            return u8;
        };
        const aus = { leinwand: [W, H], gpuFehler };
        try {
            const a = await aufnahme();
            const knoten = r._szeneTiefeKnoten,
                wert = r._szeneTiefeWert;
            r._szeneTiefeKnoten = T.TSL.viewportDepthTexture();
            r._szeneTiefeWert = r._szeneTiefeKnoten;
            let b;
            try {
                r._tiefenKnotenTausch();
                b = await aufnahme();
            } finally {
                r._szeneTiefeKnoten = knoten;
                r._szeneTiefeWert = wert;
                r._tiefenKnotenTausch();
            }
            const L = (u, x, y) => luma709(u, (y * W + x) * 4);
            // je Zeile der rechten Hälfte die linke Kante des Pfahls (das erste schwarze Pixel nach Wasser), das Wasser-Pixel
            // links davon: beide Aufnahmen
            let kanten = 0,
                abweichend = 0,
                dMax = 0;
            const paritaet = new Set();
            for (let y = 0; y < H; y++) {
                for (let x = Math.ceil(W / 2); x < W - 1; x++) {
                    if (L(b, x + 1, y) < 12 && L(b, x, y) > 60 && L(a, x + 1, y) < 12) {
                        kanten++;
                        paritaet.add(x & 1);
                        const d = L(a, x, y) - L(b, x, y);
                        dMax = Math.max(dMax, Math.abs(d));
                        if (Math.abs(d) > 8) abweichend++;
                        break;
                    }
                }
            }
            Object.assign(aus, { kanten, abweichend, dMax: +dMax.toFixed(1), paritaeten: paritaet.size });
        } catch (e) {
            aus.abbruch = String((e && (e.stack || e.message)) || e)
                .split("\n")
                .slice(0, 4)
                .join(" ← ");
        } finally {
            dev.removeEventListener("uncapturederror", gpuHoer);
            st.scene.remove(gruppe);
        }
        return aus;
    })();
}

// DIE BÜHNE (Seiten-Kontext): die echte Welt-Szene, der echte Frame, eigene Gegenstände vor der Kamera.
function buehne(nFrames, nachtLicht) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        const gpuFehler = [];
        const dev = rend.backend.device;
        const gpuHoer = (e) => gpuFehler.push(String(e.error?.message || e.message || e).slice(0, 240));
        dev.addEventListener("uncapturederror", gpuHoer);
        // Die Kamera hoch über dem Boden (nichts von der Welt zwischen ihr und der Bühne), Blick waagrecht nach −z — und das
        // Wasser der Bühne flüssig (stoffe.K3): 10 m unter der tiefsten Höhe, über der Eis beginnt (`_eisLinien`, die Linie
        // der flachsten Säule, die auch der Stoff liest; im Sommer der Bühne über Genesis 11,4 m über dem Boden).
        const cam = st.camera;
        const x0 = cam.position.x,
            z0 = cam.position.z;
        const boden = r._voxelSurfaceY(x0, z0),
            eisNull = r._eisLinien().null[0];
        const y0 = Math.min(boden + 160, eisNull - 7);
        const setzeKamera = () => {
            cam.position.set(x0, y0, z0);
            cam.up.set(0, 1, 0);
            cam.lookAt(x0, y0, z0 - 10);
            cam.updateMatrixWorld(true);
        };
        setzeKamera();
        const gruppe = new T.Group();
        gruppe.name = "post-kette:BUEHNE";
        const stoff = (hex) => new T.MeshBasicNodeMaterial({ color: hex });
        const nah = new T.Mesh(new T.BoxGeometry(1.6, 1.6, 1.6), stoff(0xff2020));
        nah.position.set(x0, y0, z0 - 6);
        const fern = new T.Mesh(new T.BoxGeometry(12, 12, 1), stoff(0x20ff20));
        fern.position.set(x0, y0, z0 - 16);
        // Das Wasser: der echte Stoff (er liest die EINE Szenen-Tiefe), mit den Attributen, die er trägt.
        // Die Wicklung wie das Iso-Wasser: die Vorderseite nach UNTEN — der Stoff zeichnet BackSide (die Oberseite von oben).
        const wg = new T.PlaneGeometry(24, 24, 4, 4);
        wg.rotateX(Math.PI / 2);
        const nV = wg.attributes.position.count;
        wg.setAttribute("aFlow", new T.BufferAttribute(new Float32Array(nV * 2), 2));
        wg.setAttribute("aShore", new T.BufferAttribute(new Float32Array(nV).fill(1), 1));
        wg.setAttribute("aWave", new T.BufferAttribute(new Float32Array(nV), 1));
        const wasser = new T.Mesh(wg, r._ensureHydroSurfaceMaterial());
        wasser.position.set(x0, y0 - 3, z0 - 14);
        // Der Grund 0,3 m unter dem Spiegel, weiß: der optische Weg ist endlich und kurz, der Grund scheint durch, die Farbe
        // des Wassers hängt an der Szenen-Tiefe (ohne Grund läge dahinter die Welt über Genesis 57 m tiefer — der Durchlass 0, jede
        // Tiefe gäbe dieselbe Farbe).
        const grund = new T.Mesh(new T.PlaneGeometry(24, 24), stoff(0xffffff));
        grund.rotation.x = -Math.PI / 2;
        grund.position.set(x0, y0 - 3.3, z0 - 14);
        window.__postWasser = [wasser, grund]; // der Saum (`saumProbe`) misst an DEMSELBEN Wasser über demselben Grund
        for (const m of [nah, fern, wasser, grund]) {
            m.frustumCulled = false;
            gruppe.add(m);
        }
        st.scene.add(gruppe);
        // Die Pass-Brüche für die Szenen-Tiefe zählen (der Tiefen-Leser muss je Schritt seine Tiefe holen, sonst ist die
        // Wand blind): am Backend, dem EINEN Bruch-Weg — r184s Viewport-Tiefe (Rückfall) und das Tiefen-Abbild nehmen ihn.
        let kopien = 0;
        const kopieRoh = rend.backend.copyFramebufferToTexture;
        rend.backend.copyFramebufferToTexture = function (...a) {
            kopien++;
            return kopieRoh.apply(this, a);
        };
        const frame = () => {
            if (rend._nodes?.nodeFrame) rend._nodes.nodeFrame.update();
            r._loopRender();
        };
        const canvasTiefe = () => {
            const t = rend.getCanvasTarget().depthTexture;
            return !!(t && rend.backend.has(t) && rend.backend.get(t).texture);
        };
        // (g) DAS RAHMEN-ZIEL DES DIREKTPFADS: r184s Rahmen-Ziele (`_frameBufferTargets`, je Leinwand- bzw.
        // Ausgabe-Ziel) und die Textur-Objekte, die der Zensus der Band dem Erzeuger `r184-ausgabe` gibt
        // (`isPostProcessingRenderTarget`) — in MB nach r184s eigener Schätzung
        const rahmenZiel = () => {
            let n = 0,
                b = 0;
            for (const [t, v] of rend.info.memoryMap)
                if (t?.isTexture && t.renderTarget?.isPostProcessingRenderTarget) {
                    n++;
                    b += typeof v === "number" ? v : 0;
                }
            return {
                ziele: rend._frameBufferTargets ? rend._frameBufferTargets.size : null,
                n,
                mb: +(b / 1048576).toFixed(2),
            };
        };
        const schritte = [];
        const schritt = async (name) => {
            const s = { name, fehler: [] };
            kopien = 0;
            for (let i = 0; i < nFrames; i++) {
                setzeKamera();
                try {
                    frame();
                } catch (e) {
                    s.fehler.push(
                        String((e && (e.stack || e.message)) || e)
                            .split("\n")
                            .slice(0, 3)
                            .join(" ← ")
                    );
                    break;
                }
            }
            await dev.queue.onSubmittedWorkDone();
            s.direkt = !st.postProcessing || st.postProcessingFailed === true;
            s.tiefe = rend.depth;
            s.leinwandTiefeGpu = canvasTiefe();
            s.rahmenZiel = rahmenZiel();
            // Die Bild-Mitte aus dem Ausgabe-Pfad (was der Spieler sieht): 32×24, das Mittel der vier Mitten-Zellen.
            try {
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                const px = (x, y) => [0, 1, 2].map((c) => u8[(y * 32 + x) * 4 + c]);
                const m = [px(15, 11), px(16, 11), px(15, 12), px(16, 12)];
                s.mitte = [0, 1, 2].map((c) => Math.round(m.reduce((a, p) => a + p[c], 0) / 4));
            } catch (e) {
                s.fehler.push("Aufnahme: " + String(e?.message || e).slice(0, 200));
            }
            await dev.queue.onSubmittedWorkDone();
            s.tiefenKopien = kopien;
            // DAS TIEFEN-ABBILD (WebGPU): halbe Auflösung, je Texel die fernste Tiefe seiner 2×2 Pixel — an der Bild-Mitte
            // die Vorderseite der nahen Kiste, 5,2 m vor der Kamera (perspektivische Tiefe aus near/far der Kamera)
            const ab = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
            if (ab && ab.isDataTexture === true && rend.backend.has(ab) && rend.backend.get(ab).texture) {
                const g = rend.backend.get(ab).texture;
                const db = rend.getDrawingBufferSize(new T.Vector2());
                const bpr = Math.ceil((g.width * 4) / 256) * 256;
                const buf = dev.createBuffer({
                    size: bpr * g.height,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                });
                const enc = dev.createCommandEncoder();
                enc.copyTextureToBuffer({ texture: g }, { buffer: buf, bytesPerRow: bpr }, [g.width, g.height]);
                dev.queue.submit([enc.finish()]);
                await buf.mapAsync(GPUMapMode.READ);
                const f32 = new Float32Array(buf.getMappedRange().slice(0));
                buf.unmap();
                buf.destroy();
                const mitte = f32[Math.floor(g.height / 2) * (bpr / 4) + Math.floor(g.width / 2)];
                const z = 5.2;
                const soll = (cam.far * (z - cam.near)) / (z * (cam.far - cam.near));
                s.abbild = {
                    format: g.format,
                    groesse: [g.width, g.height],
                    leinwand: [Math.round(db.x), Math.round(db.y)],
                    mitte: +mitte.toFixed(6),
                    soll: +soll.toFixed(6),
                };
            } else s.abbild = { fehlt: true };
            schritte.push(s);
        };
        const aus = { schritte, gpuFehler, buehne: { x: x0, y: y0, z: z0, boden, eisNull, wasserY: y0 - 3 } };
        try {
            // (a) Post-Kette — der Normalfall.
            await schritt("Post-Kette");
            // (c) das Fragment der Ausgabe, so wie die Kette es zeichnet.
            const prog = await window.__shaderKosten({ frames: 1 });
            const ausg = prog.find((p) => p.programm === "post:ausgabe");
            aus.ausgabeWgsl = ausg ? ausg.fragment : null;
            // (a) die Weiche: Direktpfad (wie die Zerleg-Linse sie stellt), zurück, dann ein Render-Fehler der Kette.
            st.postProcessingFailed = true;
            await schritt("Direktpfad");
            st.postProcessingFailed = false;
            await schritt("Post-Kette zurück");
            const pp = st.postProcessing;
            const renderRoh = pp.render;
            pp.render = function () {
                pp.render = renderRoh;
                throw new Error("gate:post-kette — erzwungener Render-Fehler der Kette");
            };
            await schritt("Render-Fehler");
            // (g) DIE DRIFT: fehlt r184s Abschied am Leinwand-Ziel (der dispose-Hörer, den
            // `_getFrameBufferTarget` anhängt), fällt das Rahmen-Ziel des Rückfalls trotzdem — LAUT: `_rahmenZielAbschied` meldet
            // ERROR. Die Wand nimmt den Hörer fort, kehrt zur Kette zurück und verlangt beides; ihre ERROR-Zeile ist die einzige,
            // die das Urteil duldet.
            const leinwand = rend.getCanvasTarget();
            const hoerer = leinwand._listeners?.dispose || [];
            const fort = hoerer.filter((h) => /_frameBufferTargets\.delete\(/.test(Function.prototype.toString.call(h)));
            for (const h of fort) leinwand.removeEventListener("dispose", h);
            const driftFehler = [];
            const logRoh = r.log;
            r.log = function (m, lvl) {
                if (lvl === "ERROR") driftFehler.push(String(m).slice(0, 200));
                return logRoh.apply(this, arguments);
            };
            st.postProcessingFailed = false;
            try {
                await schritt("Post-Kette nach Drift");
            } finally {
                delete r.log;
            }
            aus.drift = { hoererWeg: fort.length, fehler: driftFehler };
            st.postProcessingFailed = false;
            // (e) DAS WASSER LIEST DAS ABBILD WIE r184s TIEFE: die unteren sieben Zeilen des Bildes (32×24) sind Wasser über
            // dem Grund. Bei festen Uhren (die Bühne hält jede je Frame der Aufnahme) einmal mit dem Abbild, einmal mit r184s
            // Viewport-Tiefe (der volle Klon im Pass-Bruch), wieder mit dem Abbild (der Rausch-Boden) und ohne Grund (die
            // Probe ist nicht blind: die Farbe hängt an der Tiefe). Die Leser hängt `_tiefenKnotenTausch` um, der Weg
            // des Resize.
            const wasserFarbe = async () => {
                for (let i = 0; i < 3; i++) {
                    setzeKamera();
                    frame();
                }
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                const s = [0, 0, 0];
                let n = 0;
                for (let y = 17; y < 24; y++)
                    for (let x = 0; x < 32; x++, n++) for (let c = 0; c < 3; c++) s[c] += u8[(y * 32 + x) * 4 + c];
                return s.map((v) => +(v / n).toFixed(1));
            };
            const w = { umgehaengt: [] };
            w.abbild = await wasserFarbe();
            const knoten = r._szeneTiefeKnoten,
                wert = r._szeneTiefeWert;
            r._szeneTiefeKnoten = T.TSL.viewportDepthTexture();
            r._szeneTiefeWert = r._szeneTiefeKnoten;
            try {
                w.umgehaengt.push(r._tiefenKnotenTausch());
                w.r184 = await wasserFarbe();
            } finally {
                r._szeneTiefeKnoten = knoten;
                r._szeneTiefeWert = wert;
                w.umgehaengt.push(r._tiefenKnotenTausch());
            }
            w.zurueck = await wasserFarbe();
            grund.visible = false;
            w.ohneGrund = await wasserFarbe();
            grund.visible = true;
            aus.wasser = w;
            // (d) die Godrays mit der Sonne im Bild: tiefe Sonne, Blick in die Sonne; mit und ohne Godrays (der Regler).
            gruppe.visible = false;
            st.timeOfDay = 0.3;
            if (st.world) st.world.timeOfDay = 0.3;
            r._applyDayNightToScene();
            const blickSonne = () => {
                cam.position.set(x0, y0, z0);
                frame();
                cam.lookAt(st.sunMesh.position);
                cam.updateMatrixWorld(true);
            };
            const bild = async (skala) => {
                st._godrayScale = skala;
                blickSonne();
                blickSonne();
                const { u8 } = await window.__ausgabeAufnahme(64, 48, 1, { satz: "messung" });
                return u8;
            };
            // der Anteil der Pixel, die sich in einem Kanal um mindestens 4/255 ändern
            const diff = (a, b) => {
                let n = 0;
                for (let i = 0; i < a.length; i += 4)
                    if (
                        Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) >=
                        4
                    )
                        n++;
                return +((100 * n) / (a.length / 4)).toFixed(2);
            };
            const mit1 = await bild(1);
            const staerke = st.godrayUniforms ? st.godrayUniforms.strength.value : null;
            const mit2 = await bild(1);
            const ohne = await bild(0);
            aus.godray = {
                staerke: staerke == null ? null : +staerke.toFixed(3),
                aenderungPct: diff(mit1, ohne),
                rauschenPct: diff(mit1, mit2),
            };
            // (h) DAS DUNKEL: eine flache, unbeleuchtete Fläche ohne Luft füllt das Bild (die Bühne verborgen, Godrays aus),
            // zweimal mit demselben belichteten Licht — Belichtung 1 mit 0,05, Belichtung 4 mit 0,0125 —, gemessen im Ausgabe-Pfad.
            // DIE KAMERA SIEHT NUR DIE FLÄCHE (ihre Proben-Schicht, wie diag-hitch-telemetrie): die Probe misst die Kette an EINEM
            // Licht — jedes Welt-Pixel im Bild ist beleuchtet und wächst mit der Belichtung. Die Kamera der Bühne steht genau über der
            // Achse der Genesis-Scheibe (der Spawn) und blickt genau waagrecht: die Mitte ihres Deckels liegt in der Ebene der Kamera
            // (w = 0), und swiftshader (die CI) rastert den Fächer mit falscher Tiefe (1,4–2 m statt 4,9–6,5 m) VOR die Fläche, unten
            // ein Keil der Scheibe (1 cm Versatz längs des Blicks, 0,06° Neigung oder die Radeon: kein Keil). Am main zeichnete ihn der
            // Rausch-Bump schwarz (ohne den Bump auch dort beleuchtet) — Luma 32,4 / 32,4 —, seit material.K5 beleuchtet: 33,4 / 35,0;
            // die Fläche allein 33,0 / 33,0.
            const SCHICHT = 31;
            const flach = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshBasicNodeMaterial({ color: 0xffffff }));
            flach.material.fog = false;
            flach.frustumCulled = false;
            flach.layers.set(SCHICHT);
            flach.position.set(x0, y0, z0 - 2);
            st.scene.add(flach);
            const maskeVor = cam.layers.mask;
            const kVor = rend.toneMappingExposure;
            const nachtU = st.postProcessingUniforms && st.postProcessingUniforms.nightFactor;
            const nachtVor = nachtU ? nachtU.value : null;
            const dunkel = async (k, c, nacht) => {
                flach.material.color.setRGB(c, c, c);
                rend.toneMappingExposure = k;
                if (nacht && nachtU) nachtU.value = 1;
                for (let i = 0; i < nFrames; i++) {
                    setzeKamera();
                    frame();
                }
                setzeKamera();
                const { u8 } = await window.__ausgabeAufnahme(32, 24, 1, { satz: "messung" });
                let s = 0;
                for (let i = 0; i < u8.length; i += 4) s += luma709(u8, i);
                return { luma: +(s / (u8.length / 4)).toFixed(1), k: rend.toneMappingExposure, nacht: nachtU ? nachtU.value : null };
            };
            try {
                cam.layers.set(SCHICHT);
                const a = await dunkel(1, 0.05);
                const b = await dunkel(4, 0.0125);
                // die Nacht (D3-2): das Licht des Bodens im Mondlicht unter dem Schnitt der Tag-Kurve, nightFactor 1
                const n = await dunkel(1, nachtLicht, true);
                aus.dunkel = { k1: a.k, luma1: a.luma, k4: b.k, luma4: b.luma, nachtFaktor: n.nacht, lumaNacht: n.luma };
            } finally {
                cam.layers.mask = maskeVor;
                if (nachtU) nachtU.value = nachtVor;
                rend.toneMappingExposure = kVor;
                st.scene.remove(flach);
                flach.geometry.dispose();
                flach.material.dispose();
            }
            // (g) am Ende: nach Wasser, Godrays und Dunkel (Post-Kette) steht kein Rahmen-Ziel mehr
            await dev.queue.onSubmittedWorkDone();
            aus.rahmenEnde = rahmenZiel();
        } catch (e) {
            aus.abbruch = String((e && (e.stack || e.message)) || e)
                .split("\n")
                .slice(0, 4)
                .join(" ← ");
        } finally {
            rend.backend.copyFramebufferToTexture = kopieRoh;
            dev.removeEventListener("uncapturederror", gpuHoer);
            st.scene.remove(gruppe);
        }
        return aus;
    })();
}

(async () => {
    console.log(
        "=== POST-KETTE — echter Renderer (WebGPU, swiftshader-Adapter, kienspan): Weiche · Tiefe · Shader · Godrays ==="
    );
    await server.lausche(0);
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    // die ERROR-Zeilen der Seite (das Spiel meldet über `log(…, "ERROR")` → console.log „[ERROR]")
    const konsolenFehler = [];
    page.on("console", (m) => {
        const t = m.text();
        if (m.type() === "error" || /\[ERROR\]/.test(t)) konsolenFehler.push(t.slice(0, 240));
    });
    let out = null;
    const log = laufUhr();
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        // Die Kette steht erst nach dem ersten Frame mit bereitem Renderer (`_ensurePostProcessing` im Loop).
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            await window.__weltDa((r) => {
                const st = r.state;
                return !!(st?.rendererReady && st.renderer?.backend && st.postProcessing && st.camera);
            });
            return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
        });
        if (!bereit.webgpu)
            throw new Error("kein WebGPU-Backend — die Leinwand-Tiefe lebt nur dort, die Wand wäre blind");
        log(`Renderer und Post-Kette bereit nach ${Math.round(bereit.ms / 1000)} s`);
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(SK.SHADER_INSTALL);
        out = await page.evaluate(buehne, N_FRAMES, DUNKEL_NACHT_LICHT);
        if (out.abbruch) log(`ABBRUCH: ${out.abbruch}`);
        // (f) die ungerade Leinwand: die Seite wächst um ein Pixel je Achse, die Welt zieht nach (Resize, Leser neu gebunden)
        await page.setViewport({ width: 321, height: 241 });
        await page.evaluate(async () => {
            for (let i = 0; i < 6; i++) {
                if (st.renderer._nodes?.nodeFrame)
                    st.renderer._nodes.nodeFrame.update();
                r._loopRender();
                await sleep(50);
            }
        });
        const b = out.buehne;
        log(`Bühne: Boden ${b.boden.toFixed(1)} m · Wasser ${b.wasserY.toFixed(1)} m · Eis-Linie ${b.eisNull.toFixed(1)} m`);
        out.saum = await page.evaluate(saumProbe, b);
        if (out.saum)
            log(
                `Saum (ungerade Leinwand ${out.saum.leinwand.join("×")}): ${out.saum.abweichend} von ${out.saum.kanten} Kanten-Pixeln links am Pfahl weichen > 8 Luma ab (größte ${out.saum.dMax}, Paritäten ${out.saum.paritaeten})${out.saum.abbruch ? " · ABBRUCH " + out.saum.abbruch : ""}`
            );
        for (const s of out.schritte)
            log(
                `${s.name}: ${s.direkt ? "Direktpfad" : "Post-Kette"} · Tiefe ${s.tiefe} · Leinwand-Tiefe auf der GPU ${s.leinwandTiefeGpu} · ` +
                    `Rahmen-Ziele ${s.rahmenZiel ? `${s.rahmenZiel.ziele} (${s.rahmenZiel.n} Texturen, ${s.rahmenZiel.mb} MB)` : "?"} · ` +
                    `Tiefen-Kopien ${s.tiefenKopien} · Mitte ${JSON.stringify(s.mitte)} · Abbild ${s.abbild && !s.abbild.fehlt ? `${s.abbild.format} ${s.abbild.groesse.join("×")} Mitte ${s.abbild.mitte}/${s.abbild.soll}` : "fehlt"}${s.fehler.length ? " · FEHLER " + s.fehler[0] : ""}`
            );
        if (out.rahmenEnde)
            log(`Rahmen-Ziele am Ende: ${out.rahmenEnde.ziele} (${out.rahmenEnde.n} Texturen, ${out.rahmenEnde.mb} MB)`);
        if (out.drift)
            log(
                `Drift (r184s Abschied entfernt): ${out.drift.hoererWeg} Hörer fort · ERROR-Meldungen ${JSON.stringify(out.drift.fehler)}`
            );
        out.ausgabe = out.ausgabeWgsl ? SK.wgslKosten(out.ausgabeWgsl) : null;
        if (out.ausgabe)
            log(
                `Ausgabe-Fragment: ${out.ausgabe.abtastungen.gesamt} Abtastungen (unbedingt ${out.ausgabe.abtastungen.unbedingt} · ` +
                    `Zweig ${out.ausgabe.abtastungen.zweig} · Schleife ${out.ausgabe.abtastungen.schleife}) · ${out.ausgabe.schleifen} Schleifen · ` +
                    `${out.ausgabe.rauschen} Rausch-Aufrufe`
            );
        if (process.env.POST_KETTE_WGSL && out.ausgabeWgsl)
            fs.writeFileSync(process.env.POST_KETTE_WGSL, out.ausgabeWgsl);
        if (out.wasser)
            log(
                `Wasser über dem Grund: Abbild ${JSON.stringify(out.wasser.abbild)} · r184-Tiefe ${JSON.stringify(out.wasser.r184)} · ` +
                    `Abbild wieder ${JSON.stringify(out.wasser.zurueck)} · ohne Grund ${JSON.stringify(out.wasser.ohneGrund)} · umgehängt ${JSON.stringify(out.wasser.umgehaengt)}`
            );
        if (out.godray)
            log(
                `Godrays mit der Sonne im Bild: Stärke ${out.godray.staerke} · ${out.godray.aenderungPct} % der Pixel geändert (Rausch-Boden ${out.godray.rauschenPct} %)`
            );
    } catch (e) {
        out = { error: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    out.konsolenFehler = konsolenFehler;
    const v = urteil(out);
    wandEnde(v, () => {
        const a = out.ausgabe.abtastungen;
        return (
            `fünf Wege durch die Weiche ohne Fehler (mit der Drift ohne r184s Abschied), der Direktpfad zeichnet mit Tiefe, die Post-Kette ohne Leinwand-Tiefe und ohne Rahmen-Ziel; ` +
            `die Ausgabe tastet unbedingt ${a.unbedingt}×, ${a.zweig}× nur hinter ihrer Stärke; die Godrays tragen mit der Sonne im Bild ` +
            `(${out.godray.aenderungPct} % der Pixel gegen ${out.godray.rauschenPct} % Rauschen); das Wasser liest das Tiefen-Abbild wie r184s Tiefe ` +
            `(${JSON.stringify(out.wasser.abbild)} gegen ${JSON.stringify(out.wasser.r184)}, ohne Grund ${JSON.stringify(out.wasser.ohneGrund)}); ` +
            `das Dunkel trägt (Luma ${out.dunkel.luma1} bei Belichtung 1, ${out.dunkel.luma4} bei 4, die Nacht ${out.dunkel.lumaNacht}).`
        );
    });
})();
