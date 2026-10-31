#!/usr/bin/env node
// omen-messfolge.cjs — DIE EINE MESS-FOLGE je Boot. Diese Datei IST die Folge: sie startet die Welt (`werkbank start --echt`), fährt die Schritte in fester
// Ordnung, prüft nach jedem Schritt jede Wache und schreibt EIN JSON je Boot — jeder Stand misst gleich.
//
//   DIE FOLGE: boot · dorf-aus (`window.__anazhAutoSettlement = false`, vor dem Umstellen) · fenster 1920 1080 · umstellen
//   --ort wiese · buehne (einmal: Mittag · Sonne · Sommer, das Wetter gehalten) · lauf voll · lauf frei (je `lauf 30 --ein 20
//   --ruhe 300 --tiere frei`) · gpu-bank (12 × 3 je Blick: Gier 0 und −0,88, danach zurück zur Gier des Orts) · band ·
//   profil (12 s, Regler voll, Top 60) — und stop. DER GENESIS-RING (`--ort genesis`, 0910-1) misst in seinem EIGENEN Boot:
//   boot · dorf-aus · fenster · umstellen --ort genesis · buehne · band — nie in einer Sitzung, die schon anderes maß.
//   DIE BAND urteilt ihre Aufzeichnung selbst: steht der Ort nicht (`ortGestellt`: „NICHT GESTELLT"), ist der Lauf ROT und
//   zählt nie; JEDE Rot-Zeile der Band-Linse (ratsche · haushalt · unbenannt · stufe · leck · weit · ungemessen) ebenso —
//   außer die Basis-Seite A des ABAB (`--basis`) trägt sie. Die Band richtet die Ratsche ihres Orts × Geräts × Sicht.
//   DIE WACHEN nach jedem Schritt (`/wache` der Werkbank):
//     WETTER   ab der Bühne: kein Schreiber dreht das Wetter (das Buch des Wetter-Spions, `wetterUrteil`), die Uhr des
//              Auto-Zugs steht eingefroren, das Wort bleibt „sunny";
//     WELTAKT  ab der Bühne: kein Welt-Akt der DSL (Dorf, Spawn, Tier-Spawn, Größen-/Tempo-Würfel, Tageszeit …) läuft unter dem
//              Halt durch — die Engstelle `dslEval` verweigert jeden, das Buch des Welt-Akt-Spions nennt ihn (`weltaktUrteil`);
//     STEMPEL  der Zeitstempel-Pool läuft in KEINEM Schritt über (sonst ist jeder Pass-Stempel danach blind);
//     ORT      vor und nach jedem messenden Schritt: aufgestellt am Ort, Dorf-Zug und Ort-Takt wie der Ort sie will, die Gier
//              des Orts, der Spieler am Messort (≤ 8 m) — `BAND.ortGestellt`;
//     FENSTER  vor und nach jedem messenden Schritt: der Viewport 1920 × 1080;
//     FOLGE    die Schritte in der Ordnung der FOLGE: kein Lauf nach einem Pool-Füller (gpu-bank, band), die Bühne vor dem
//              ersten Messen, der Dorf-Zug ruht vor dem Umstellen.
//   DIE TIERE neben jeder Messung (der größte unbenannte Störfaktor jeder ABAB): je messendem Schritt und je Blick der Bank die Zahl gesamt, im Sichtkegel (davon
//   nah), mit Schatten-Wurf je Kaskade (k0/k1) und die Arten (`tierZahl` der Werkbank) — im JSON und in `kurz`, damit Boots
//   vergleichbar gefiltert werden. Die Zahl ist Weltzustand und nie rot; nur ein fehlender oder zerbrochener Zähler ist ein
//   Befund (`tierUrteil`: die Messung stünde ohne ihre Tiere).
//   Die Messwerte stehen roh je Schritt im JSON, dazu die Kurzfassung (`kurz`): fps · Frame p50/p95/max · CPU-Takt · render-EWMA
//   je Lauf, gpu-bank, Band-Urteil, Profil-Top, die Tiere je Messung. Die render-EWMA ist die WANDUHR der Render-Phase
//   (`_loopShadowUpdate` + `_loopRender`) und trägt den Takt-Zustand der CPU mit — die Zeile nennt sie so; ein Kosten-Urteil über
//   den Render geben gpu-bank, Band und die Frame-Zeit, über die CPU der CPU-Takt (die Summe aller Phasen). Exit 0 = alle Wachen grün, 1 = eine Wache rot (der Lauf
//   misst Falsches — die Zahlen stehen trotzdem im JSON, beim Namen markiert), 2 = Abbruch. Am Ende stirbt die Werkbank samt
//   Chrome (`beendeBaum`: `/stop`, und hängt er, der ganze Prozess-Baum) — erst dann endet die Folge.
//
//   node scripts/omen-messfolge.cjs [--ort <FOLGEN>] [--port 4490] [--seite http://localhost:4312] [--serie <name>] [--datei f.json]
//                                   [--lauf-sek 30] [--ein 20] [--ruhe 300] [--profil-sek 12] [--proben 6]
//                                   [--sicht ego|third] [--basis <A.json>]   (K26: die Sicht des Orts; die Basis-Seite A des ABAB)
//   node scripts/omen-messfolge.cjs --urteil <boot.json> [--basis <A.json>]   (K26, ohne GPU: ein gespeicherter Boot neu gelesen)
//   node scripts/omen-messfolge.cjs --schalter <bloecke.json> (1310-1: ein Schalter in EINER Sitzung, Erst- gegen Dauer-Zeichnung)
//   node scripts/omen-messfolge.cjs --selbsttest       (ohne Welt: jede Wache und die Folge-Regel fallen bei ihrem Täter rot)
//
// Der save-server läuft vorher (`npm start`, :4312 — am OMEN der Mess-Klon); die Werkbank startet und stoppt die Folge selbst
// (ein Boot je Aufruf; `--serie` hält das Profil für den Zweit-Boot).
"use strict";
const { werkbankRuf, hauptLauf, sleep, selbsttestEnde, argOpt: opt, ausDatei, path, fs, os } = require("./lib/welt-boot.cjs");
const { spawn, execSync } = require("child_process");
const BAND = require("./lib/band-urteil.cjs");
const { wetterUrteil, weltaktUrteil } = require("./lib/ausgabe-aufnahme.cjs");

const root = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);

// DIE FOLGE je Messort — fest; die Ordnung ist das Gesetz der Messung. Die Mess-Wiese trägt die volle Folge. Der Genesis-Ring
// misst sein Band in einer EIGENEN frischen Sitzung (jeder Aufruf ist ein Boot): in 0710-6 und 0710-9 lief
// `band --ort genesis` in der Zerleg-Sitzung an der Wiese — die Band-Linse schrieb selbst „NICHT GESTELLT … aufgestellt am Ort
// wiese", und das Band trug 23,7 MB Rahmen-Ziel des Direktpfads (`tex:r184-ausgabe`). Keine der beiden Zahlen war Genesis.
const FOLGEN = {
    wiese: [
        "boot",
        "dorf-aus",
        "fenster",
        "umstellen",
        "buehne",
        "lauf-voll",
        "lauf-frei",
        "gpu-bank",
        "band",
        "profil",
    ],
    // DAS PROFI-BAND E (frozen-a1, 1110-9) richtet beide Orte unter Regler voll: Frame p95 und CPU-Takt p95 AUCH an der
    // Genesis — der Lauf steht dort vor dem Band (der Pool füllt erst nach jedem Pass-Stempel).
    genesis: ["boot", "dorf-aus", "fenster", "umstellen", "buehne", "lauf-voll", "band"],
    // DAS MESS-DORF: der Dorf-Zug läuft (der Ort schaltet ihn beim Umstellen wieder an), das Band zählt Befehle, Dreiecke und
    // VRAM des gebauten Dorfs.
    dorf: ["boot", "dorf-aus", "fenster", "umstellen", "buehne", "band"],
    // DER TOGGLE-ORT (1110-6): die Prüfbühne richtet keine Band-Klasse, sondern die GPU-Zeit eines Schalters unter 0,3 ms —
    // die lange Bank je Pose (haushalt.json `bank`, `posen`), bei festen Stellgrößen des Reglers (`stell`).
    buehne: ["boot", "dorf-aus", "fenster", "umstellen", "buehne", "gpu-bank"],
};
// DER STADT-GIPFEL (E an JEDEM Messort): der Ort schwingt am Anlauf ein und weckt die Stadt (der Dorf-Zug läuft), dann richten Lauf und
// Band (mit seiner GPU-Bank) Frame, CPU-Takt, Befehle, Dreiecke, VRAM und GPU-Zeit der vollen Stadt, vom Gipfel und vom Hochhaus-Dach.
FOLGEN["stadt-voll"] = FOLGEN["gipfel-blick"] = FOLGEN["hochhaus-dach"] = FOLGEN.genesis;

// DIE WIEDERHOLBARKEIT EINES MESSORTS (1110-6, rein): dieselbe Seite in N frischen Sitzungen — je Pose (Toggle-Ort) bzw. je
// Blick (Band-Ort) das Bank-Mittel jeder Sitzung. Liegt die Spanne (max − min) über dem Soll, ist der Ort für Toggle-Urteile
// dieser Größe blind und nennt die Pose.
// DER TAKT (1110-7): die GTX des OMEN läuft unter Last am Leistungs-Deckel (Drossel 0x4, ~70 W) mit 1680–1710 MHz, in Ruhe mit
// 1771 MHz — zwischen Sitzungen ~4 %, so viel wie der vermeintliche Merge-Täter von 1110-6. Verglichen wird nur bei gleichem
// Takt (±0,5 % um den Median); fehlt er in einer Sitzung (kein nvidia-smi), ist der gleiche Takt nicht belegt — beides laut.
// `sitzungen` = [{ name, je: { <pose|gier>: ms }, takt: { <pose|gier>: MHz | null } }]; mindestens drei.
const TAKT_TOLERANZ = 0.005;
function streuungUrteil(sitzungen, soll) {
    const befunde = [];
    const zeilen = [];
    if (!(soll > 0)) befunde.push("STREUUNG: kein Soll (ms > 0)");
    if (sitzungen.length < 3)
        befunde.push(`STREUUNG: ${sitzungen.length} Sitzungen — die Wiederholbarkeit braucht mindestens drei`);
    const schluessel = [...new Set(sitzungen.flatMap((s) => Object.keys(s.je || {})))];
    if (!schluessel.length) befunde.push("STREUUNG: keine Bank in den Sitzungen");
    for (const k of schluessel) {
        const w = sitzungen.map((s) => (s.je || {})[k]);
        const fehlt = w.filter((x) => !Number.isFinite(x)).length;
        if (fehlt) {
            befunde.push(`STREUUNG ${k}: in ${fehlt} von ${w.length} Sitzungen kein Wert`);
            continue;
        }
        const min = Math.min(...w);
        const max = Math.max(...w);
        const mittel = w.reduce((a, b) => a + b, 0) / w.length;
        const sigma = Math.sqrt(w.reduce((a, b) => a + (b - mittel) ** 2, 0) / Math.max(1, w.length - 1));
        const t = sitzungen.map((s) => (s.takt || {})[k]);
        const ohneTakt = t.filter((x) => !(Number.isFinite(x) && x > 0)).length;
        if (ohneTakt)
            befunde.push(
                `TAKT ${k}: in ${ohneTakt} von ${t.length} Sitzungen kein Takt (nvidia-smi) — der gleiche Takt ist nicht belegt`
            );
        else {
            const ts = t.slice().sort((a, b) => a - b);
            const med = ts.length % 2 ? ts[ts.length >> 1] : (ts[ts.length / 2 - 1] + ts[ts.length / 2]) / 2;
            sitzungen.forEach((s, i) => {
                if (Math.abs(t[i] - med) > med * TAKT_TOLERANZ)
                    befunde.push(
                        `TAKT ${k}: Sitzung ${s.name || i + 1} bei ${t[i].toFixed(0)} MHz, Median ${med.toFixed(0)} MHz ` +
                            `(±${TAKT_TOLERANZ * 100} %) — der Vergleich ist blind (Täter: Takt)`
                    );
            });
        }
        zeilen.push({
            k,
            werte: w,
            takt: t,
            mittel: +mittel.toFixed(3),
            spanne: +(max - min).toFixed(3),
            sigma: +sigma.toFixed(3),
        });
        if (max - min > soll)
            befunde.push(
                `STREUUNG ${k}: Spanne ${(max - min).toFixed(2)} ms über dem Soll ${soll} ms (${w.map((x) => x.toFixed(2)).join(" · ")})`
            );
    }
    return { befunde, zeilen };
}

// Die Bank eines Laufs je Pose bzw. Blick (aus `kurz.gpuBank`) und ihr Takt — die Eingabe des Streuungs-Urteils.
function bankJe(lauf) {
    const je = {};
    const takt = {};
    for (const [k, b] of Object.entries((lauf && lauf.kurz && lauf.kurz.gpuBank) || {})) {
        je[k] = b && Number.isFinite(b.gpuJeFrameMs) ? b.gpuJeFrameMs : NaN;
        takt[k] = b && b.takt && Number.isFinite(b.takt.mhz) ? b.takt.mhz : null;
    }
    return { je, takt };
}

// DAS SCHALTER-URTEIL (1310-1, rein): ein Schalter in EINER Sitzung, die Erst-Zeichnung von der Dauer-Zeichnung getrennt.
// Ein Schalter-Vergleich ist nur ein Urteil, wenn (a) je Block das erste Band nach dem Eingriff verworfen
// wird (die Erst-Zeichnung: neue Programme, Bündel-Neuaufnahme), (b) jeder Schalter-Block gegen den Mittelwert seiner
// Grund-Nachbarn davor UND danach steht (linearer Drift fällt heraus) und (c) ein NULL-Schalter (derselbe Eingriff ohne
// Änderung) im Rauschband liegt — sonst misst die Methode den Eingriff mit (Täter: Methode). `bloecke` = [{ zustand:
// "grund" | "null" | <schalter>, baender: [ms …] (das erste = Aufwärm-Band), takt: [MHz …] }] in Zeitfolge. DAS
// RAUSCHEN misst dieselbe Rechnung ohne Schalter: jeder innere Grund-Block gegen das Mittel seiner Grund-Nachbarn
// (σ_d, quadratisch um 0) — Drift über die Sitzung (der Takt fällt mit der Wärme) fällt so aus Rauschen UND Schalter
// heraus; das Rauschband eines Schalters über k Blöcke = 2σ_d/√k. DER TAKT gilt lokal: der Schalter-Block gegen das
// Mittel seiner Grund-Nachbarn (±0,5 %), je Band das Mittel der nvidia-smi-Proben.
const SCHALTER_MIN_BLOECKE = 2;
const SCHALTER_MIN_BAENDER = 3; // gemessen je Block, nach dem Aufwärm-Band
function schalterUrteil(bloecke, toleranz = 0.005) {
    const befunde = [];
    const verworfen = [];
    const mittel = (w) => w.reduce((a, b) => a + b, 0) / w.length;
    const B = bloecke.map((b, i) => {
        const roh = (b.baender || []).filter((x) => Number.isFinite(x));
        const dauer = roh.slice(1);
        if ((b.baender || []).length !== roh.length)
            befunde.push(`SCHALTER Block ${i + 1} (${b.zustand}): ${(b.baender || []).length - roh.length} Band ohne Wert`);
        if (dauer.length < SCHALTER_MIN_BAENDER)
            befunde.push(
                `SCHALTER Block ${i + 1} (${b.zustand}): ${dauer.length} Dauer-Bänder — je Block ein Aufwärm-Band und mindestens ${SCHALTER_MIN_BAENDER} gemessene`
            );
        const m = dauer.length ? mittel(dauer) : NaN;
        return {
            i,
            zustand: b.zustand,
            m,
            erst: roh.length > 1 ? roh[0] - m : NaN,
            dauer,
            takt: b.takt || [],
            ohneTakt: (b.baender || []).length !== (b.takt || []).length,
        };
    });
    // DER TAKT: fehlt er an einem Band, ist der gleiche Takt nicht belegt (der lokale Vergleich steht unten je Schalter-Block).
    const takte = B.flatMap((b) => b.takt);
    const taktDa = takte.length > 0 && !B.some((b) => b.ohneTakt) && takte.every((t) => Number.isFinite(t) && t > 0);
    if (!taktDa) befunde.push("TAKT: nicht jedes Band trägt seinen Takt (nvidia-smi) — der gleiche Takt ist nicht belegt");
    for (const b of B) b.taktM = taktDa && b.takt.length ? mittel(b.takt) : NaN;
    const grund = B.filter((b) => b.zustand === "grund" && Number.isFinite(b.m));
    if (grund.length < 4) befunde.push(`SCHALTER: ${grund.length} Grund-Blöcke — das Rauschen braucht mindestens vier`);
    const rest = [];
    for (let k = 1; k + 1 < grund.length; k++) rest.push(grund[k].m - (grund[k - 1].m + grund[k + 1].m) / 2);
    const sigma = rest.length ? Math.sqrt(rest.reduce((a, r) => a + r * r, 0) / rest.length) : NaN;
    const schalter = [...new Set(B.filter((b) => b.zustand !== "grund").map((b) => b.zustand))];
    if (!schalter.includes("null"))
        befunde.push("SCHALTER: kein Null-Schalter — ohne ihn ist nicht belegt, dass die Methode den Eingriff nicht mitmisst");
    const zeilen = [];
    for (const s of schalter) {
        const d = [];
        for (const b of B) {
            if (b.zustand !== s || !Number.isFinite(b.m)) continue;
            let vor = null,
                nach = null;
            for (let j = b.i - 1; j >= 0 && !vor; j--) if (B[j].zustand === "grund" && Number.isFinite(B[j].m)) vor = B[j];
            for (let j = b.i + 1; j < B.length && !nach; j++)
                if (B[j].zustand === "grund" && Number.isFinite(B[j].m)) nach = B[j];
            if (!vor || !nach) {
                befunde.push(`SCHALTER ${s}: Block ${b.i + 1} ohne Grund-Block davor UND danach — der Drift fällt nicht heraus`);
                continue;
            }
            // ein Block bei anderem Takt als seine Nachbarn fällt beim Namen aus dem Urteil (nie still); bleiben zu wenige,
            // ist der Schalter ROT
            const tN = (vor.taktM + nach.taktM) / 2;
            if (Number.isFinite(b.taktM) && Number.isFinite(tN) && Math.abs(b.taktM - tN) > tN * toleranz) {
                verworfen.push(
                    `TAKT: Block ${b.i + 1} (${b.zustand}) bei ${b.taktM.toFixed(0)} MHz, Grund-Nachbarn ${tN.toFixed(0)} MHz (±${toleranz * 100} %) — der Block fällt aus dem Urteil (Täter: Takt)`
                );
                continue;
            }
            d.push(b.m - (vor.m + nach.m) / 2);
        }
        if (d.length < SCHALTER_MIN_BLOECKE) {
            befunde.push(`SCHALTER ${s}: ${d.length} Blöcke — ein Urteil braucht mindestens ${SCHALTER_MIN_BLOECKE}`);
            continue;
        }
        const delta = mittel(d);
        const band = (2 * sigma) / Math.sqrt(d.length);
        const erstS = B.filter((b) => b.zustand === s && Number.isFinite(b.erst)).map((b) => b.erst);
        const z = {
            schalter: s,
            bloecke: d.length,
            delta: +delta.toFixed(3),
            je: d.map((x) => +x.toFixed(3)),
            rauschband: +band.toFixed(3),
            erst: erstS.length ? +mittel(erstS).toFixed(3) : null,
            urteil: !Number.isFinite(band) ? "BLIND" : Math.abs(delta) > band ? "TRÄGT" : "IM RAUSCHEN",
        };
        zeilen.push(z);
        if (s === "null" && z.urteil !== "IM RAUSCHEN")
            befunde.push(
                `NULL-SCHALTER: Δ ${z.delta >= 0 ? "+" : ""}${z.delta.toFixed(2)} ms außerhalb des Rauschbands ±${z.rauschband.toFixed(2)} ms — die Methode misst den Eingriff mit (Täter: Methode)`
            );
    }
    const erstG = grund.filter((b) => b.i > 0 && Number.isFinite(b.erst)).map((b) => b.erst);
    return {
        befunde,
        verworfen,
        zeilen,
        sigma: Number.isFinite(sigma) ? +sigma.toFixed(3) : null,
        takt: taktDa ? { erst: +B[0].taktM.toFixed(0), letzt: +B[B.length - 1].taktM.toFixed(0) } : null,
        grund: grund.map((b) => +b.m.toFixed(3)),
        erstGrund: erstG.length ? +mittel(erstG).toFixed(3) : null,
    };
}

// DER TAKT EINER BANK (rein): `nvidia-smi --format=csv,noheader,nounits` je Zeile Takt (MHz), Temperatur, Leistung und die
// Drossel-Gründe (Maske) → Mittel, Spanne und die Zahl der Proben je Drossel-Maske; ohne eine lesbare Zeile null.
const SMI_ABFRAGE = [
    "--query-gpu=clocks.gr,temperature.gpu,power.draw,clocks_throttle_reasons.active",
    "--format=csv,noheader,nounits",
    "-lms",
    "250",
];
function taktAus(zeilen) {
    const w = zeilen
        .map((l) => l.split(",").map((x) => x.trim()))
        .filter((r) => r.length >= 4 && Number(r[0]) > 0 && Number.isFinite(Number(r[1])));
    if (!w.length) return null;
    const m = (i) => w.reduce((a, r) => a + Number(r[i]), 0) / w.length;
    const mhz = w.map((r) => Number(r[0]));
    const drossel = {};
    for (const r of w) drossel[r[3]] = (drossel[r[3]] || 0) + 1;
    return {
        mhz: +m(0).toFixed(1),
        min: Math.min(...mhz),
        max: Math.max(...mhz),
        temp: +m(1).toFixed(1),
        watt: +m(2).toFixed(1),
        drossel,
        n: w.length,
    };
}

// Eine Bank mit ihrem Takt: `nvidia-smi` liest je 250 ms, solange die Bank läuft; ohne nvidia-smi (kein NVIDIA-Treiber) steht
// `takt: null` — das Streuungs-Urteil nennt es.
async function mitTakt(fn) {
    const zeilen = [];
    let proc = null;
    try {
        proc = spawn("nvidia-smi", SMI_ABFRAGE, { windowsHide: true });
        proc.on("error", () => (proc = null));
        proc.stdout.on("data", (d) => zeilen.push(...String(d).split(/\r?\n/).filter(Boolean)));
    } catch {
        proc = null;
    }
    try {
        const b = await fn();
        return { b, takt: taktAus(zeilen) };
    } finally {
        if (proc) proc.kill();
    }
}

// Die Takte mehrerer Bänke derselben Pose zu EINEM: Mittel der Mittel, Spanne über alle, die Drossel-Masken summiert.
function taktZusammen(liste) {
    const t = liste.filter(Boolean);
    if (!t.length) return null;
    const drossel = {};
    for (const x of t) for (const [k, n] of Object.entries(x.drossel)) drossel[k] = (drossel[k] || 0) + n;
    return {
        mhz: +(t.reduce((a, x) => a + x.mhz, 0) / t.length).toFixed(1),
        min: Math.min(...t.map((x) => x.min)),
        max: Math.max(...t.map((x) => x.max)),
        temp: +(t.reduce((a, x) => a + x.temp, 0) / t.length).toFixed(1),
        watt: +(t.reduce((a, x) => a + x.watt, 0) / t.length).toFixed(1),
        drossel,
        n: t.reduce((a, x) => a + x.n, 0),
        baenke: t.length,
    };
}
const ORT = opt("--ort", "wiese");
if (!FOLGEN[ORT]) throw new Error(`omen-messfolge: kein Messort „${ORT}" (Folgen: ${Object.keys(FOLGEN).join(", ")})`);
const FOLGE = FOLGEN[ORT];
// DIE SICHT (K26, Pflicht-OFFEN E in Ego UND Third-Person): der Ort wird in ihr aufgestellt, die Band richtet die Ratsche
// dieses Orts × Geräts × Sicht.
const SICHT = opt("--sicht", "ego");
if (!BAND.ladeSpec(ORT).haushalt.sichten[SICHT])
    throw new Error(`omen-messfolge: keine Sicht „${SICHT}" (${Object.keys(BAND.ladeSpec(ORT).haushalt.sichten).join(", ")})`);
const FENSTER = [1920, 1080];
// die messenden Schritte (Ort und Fenster gelten vor und nach ihnen), die Leser der Pass-Stempel und die Pool-Füller
const MESSEN = new Set(["lauf-voll", "lauf-frei", "gpu-bank", "band", "profil"]);
const STEMPEL_LESER = new Set(["lauf-voll", "lauf-frei"]);
const POOL_FUELLER = new Set(["gpu-bank", "band"]);
// die Blicke der GPU-Bank (Gier, Bogenmaß): der Blick des Orts und der Schräg-Blick, in dem die ferne Kaskade mehr nimmt
const BANK_GIER = [0, -0.88];

// DIE FOLGE-REGEL (rein): die gefahrenen Schritte gegen das Gesetz der Messung (die Folge des Orts) — jeder Bruch beim Namen.
function folgeUrteil(namen, FOLGE = FOLGEN.wiese) {
    const v = [];
    let i = -1;
    for (const n of namen) {
        const j = FOLGE.indexOf(n);
        if (j < 0) v.push(`FOLGE: unbekannter Schritt „${n}"`);
        else if (j <= i) v.push(`FOLGE: „${n}" nach „${FOLGE[i]}" — die Ordnung ist ${FOLGE.join(" · ")}`);
        else i = j;
    }
    const pos = (n) => namen.indexOf(n);
    for (const l of STEMPEL_LESER)
        for (const f of POOL_FUELLER)
            if (pos(l) >= 0 && pos(f) >= 0 && pos(f) < pos(l))
                v.push(`FOLGE: ${f} vor ${l} — der Pool ist gefüllt, jeder Pass-Stempel des Laufs ist blind`);
    const erstesMessen = namen.findIndex((n) => MESSEN.has(n));
    if (erstesMessen >= 0) {
        for (const n of ["dorf-aus", "fenster", "umstellen", "buehne"])
            if (pos(n) < 0 || pos(n) > erstesMessen)
                v.push(`FOLGE: „${n}" fehlt vor dem ersten Messen (${namen[erstesMessen]})`);
    }
    if (pos("dorf-aus") > pos("umstellen") && pos("umstellen") >= 0)
        v.push("FOLGE: der Dorf-Zug ruht erst nach dem Umstellen — der Ort stand mit laufendem Zug");
    return v;
}

// DER TIER-ZÄHLER (rein): steht er in der Wache eines messenden Schritts, vorhanden und ohne NaN? Die Zahl selbst ist
// Weltzustand und nie rot — nur ein fehlender oder zerbrochener Zähler ist ein Befund (die Messung stünde ohne ihre Tiere).
function tierUrteil(name, t) {
    if (!t || typeof t !== "object") return [`TIERE ${name}: kein Tier-Zähler — die Messung steht ohne ihre Tiere`];
    const v = [];
    const zahlen = { gesamt: t.gesamt, sicht: t.sicht, sichtNah: t.sichtNah };
    if (!t.schatten || typeof t.schatten !== "object") v.push(`TIERE ${name}: kein Schatten-Wurf je Kaskade gezählt`);
    else for (const [k, n] of Object.entries(t.schatten)) zahlen["schatten " + k] = n;
    if (!t.arten || typeof t.arten !== "object") v.push(`TIERE ${name}: keine Arten gezählt`);
    else for (const [a, n] of Object.entries(t.arten)) zahlen["Art " + a] = n;
    for (const [k, n] of Object.entries(zahlen))
        if (typeof n !== "number" || !Number.isFinite(n)) v.push(`TIERE ${name}: ${k} ist ${n}`);
    return v;
}
// DIE BAND-MESSUNG SELBST (rein, 0910-1; der LESER K26): was die Band beim Zählen aufzeichnete — der gestellte Ort
// (`ortGestellt`: Ort der letzten Aufstellung, Dorf-Zug, Ort-Takt, Gier, Sicht; „NICHT GESTELLT" ist ROT, der Lauf zählt nie),
// das Gerät und die Sicht, die ihre Ratsche wählen, und JEDE Rot-Zeile der Band-Linse (ratsche · haushalt · unbenannt ·
// stufe · leck · weit · ungemessen) als Befund.
// `basis` = die Band-Messung der Basis-Seite A des ABAB (`--basis`): eine Zeile, die A am selben Ort, Gerät und in derselben
// Sicht trägt (derselbe Schlüssel, B nicht über A hinaus), ist kein Befund dieser Seite — sie bleibt der Befund von A.
function bandBefunde(messung, basis) {
    if (!messung || typeof messung !== "object") return ["BAND band: keine Messung (die Band schrieb keine Datei)"];
    const v = [];
    if (!Array.isArray(messung.ortGestellt)) v.push("ORT band: die Band zeichnete den gestellten Ort nicht auf");
    else if (messung.ortGestellt.length) v.push(`ORT band: NICHT GESTELLT — ${messung.ortGestellt.join(" · ")}`);
    const geraet = messung.geraet && messung.geraet.schluessel;
    if (!geraet)
        v.push(
            `BAND band: die Messung nennt kein Gerät (${(messung.geraet && messung.geraet.text) || "kein Adapter-Text"}) — keine Ratsche richtet sie`
        );
    if (!messung.sicht) v.push("BAND band: die Messung nennt keine Sicht — keine Ratsche richtet sie");
    if (!Array.isArray(messung.rot)) {
        v.push("BAND band: die Band-Linse schrieb kein Urteil (keine Rot-Liste)");
        return v;
    }
    let traeger = null;
    if (basis) {
        const bg = basis.geraet && basis.geraet.schluessel;
        const fremd = [];
        if (basis.ort !== messung.ort) fremd.push(`Ort ${basis.ort}`);
        if (bg !== geraet) fremd.push(`Gerät ${bg || "?"}`);
        if (basis.sicht !== messung.sicht) fremd.push(`Sicht ${basis.sicht || "?"}`);
        if (fremd.length || !Array.isArray(basis.rot))
            v.push(
                `BASIS band: die Basis-Seite A stand an ${fremd.join(" · ") || "?"}${Array.isArray(basis.rot) ? "" : " ohne Rot-Liste"} — sie trägt keine Zeile dieser Seite`
            );
        else traeger = new Map(basis.rot.filter((r) => r && r.schluessel).map((r) => [r.schluessel, r]));
    }
    const tol = (basis && basis.toleranz) || messung.toleranz || null;
    const zahl = Number.isFinite;
    for (const r of messung.rot) {
        const a = traeger && r.schluessel ? traeger.get(r.schluessel) : null;
        if (a && !(zahl(r.ist) && zahl(a.ist) && r.groesse && BAND.ueberRatsche(r.ist, a.ist, tol, r.groesse))) continue;
        v.push(`BAND-LINSE ${r.art}: ${r.text}${a ? ` (über der Basis A ${a.ist})` : ""}`);
    }
    return v;
}
// Die Band-Messung eines Boots (das JSON der Folge: der Schritt „band", seine Messung) — null, wenn keiner da ist.
const bandMessungAus = (j) => {
    const e = j && Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
    return e && e.ergebnis ? e.ergebnis.messung || null : null;
};

// die Tiere in der Kurzfassung (je Messung eine Zeile im Bericht)
const tierKurz = (t) =>
    t && typeof t === "object"
        ? { gesamt: t.gesamt, sicht: t.sicht, sichtNah: t.sichtNah, schatten: t.schatten, arten: t.arten }
        : null;
const tierZeile = (t) =>
    t
        ? `Tiere ${t.gesamt} (Sicht ${t.sicht}, nah ${t.sichtNah}, Schatten ` +
          `${Object.entries(t.schatten || {})
              .map(([k, n]) => k + " " + n)
              .join(" / ")}; ${Object.entries(t.arten || {})
              .map(([a, n]) => a + " " + n)
              .join(", ")})`
        : "Tiere ?";

// DIE WACHEN EINES SCHRITTS (rein): `vor` und `nach` sind Antworten von `/wache` (vor dem Schritt, nach ihm), `ort` der Messort
// (spec/profiband/haushalt.json), `gehalten` = die Bühne steht (ab dem Schritt „buehne"). Nach jedem messenden Schritt steht
// der Tier-Zähler in der Wache (`tierUrteil`).
function wachenUrteil(name, vor, nach, ort, gehalten) {
    const v = [];
    if (!nach) return [`WACHE ${name}: keine Antwort der Werkbank`];
    if (gehalten) {
        const w = wetterUrteil({
            vorher: vor ? vor.wetter.wetter : nach.wetter.wetter,
            nachher: nach.wetter.wetter,
            uhrVorher: vor ? vor.wetter.uhr : nach.wetter.uhr,
            uhrNachher: nach.wetter.uhr,
            buch: nach.wetter.buch,
        });
        for (const t of w.taeter) v.push(`WETTER ${name}: ${t}`);
        if (nach.wetter.wetter !== "sunny")
            v.push(`WETTER ${name}: das Wetter ist „${nach.wetter.wetter}", die Bühne hält „sunny"`);
        for (const t of weltaktUrteil(nach.weltakt).taeter) v.push(`WELTAKT ${name}: ${t}`);
    }
    const s0 = vor && vor.stempel,
        s1 = nach.stempel;
    if (s1 && Number.isFinite(s1.ueberlauf)) {
        const d = s1.ueberlauf - (s0 && Number.isFinite(s0.ueberlauf) ? s0.ueberlauf : 0);
        if (d > 0)
            v.push(
                `STEMPEL ${name}: ${d} verweigerte Abfragen (Pool ${s1.pool ? s1.pool.stand + "/" + s1.pool.max : "?"}) — ` +
                    "jeder Pass-Stempel danach ist blind" +
                    (s1.taeter && Object.keys(s1.taeter).length
                        ? "; Täter: " +
                          Object.entries(s1.taeter)
                              .sort((x, y) => y[1] - x[1])
                              .slice(0, 3)
                              .map(([k, n]) => `${k} ${n}`)
                              .join(" · ")
                        : "")
            );
    }
    if (MESSEN.has(name)) {
        for (const [wann, w] of [
            ["vor", vor],
            ["nach", nach],
        ]) {
            if (!w) {
                v.push(`ORT ${name}: keine Wache ${wann} dem Schritt`);
                continue;
            }
            for (const f of BAND.ortGestellt(ort, w.ort, SICHT)) v.push(`ORT ${name} (${wann}): ${f}`);
            const d = Math.hypot(w.ort.spieler[0] - ort.spieler[0], w.ort.spieler[1] - ort.spieler[1]);
            if (!(d <= 8))
                v.push(
                    `ORT ${name} (${wann}): der Spieler steht ${d.toFixed(1)} m vom Messort ${ort.spieler.join(" ")}`
                );
            const f = w.fenster && w.fenster.innen;
            if (!f || f[0] !== FENSTER[0] || f[1] !== FENSTER[1])
                v.push(`FENSTER ${name} (${wann}): ${f ? f.join(" × ") : "?"} statt ${FENSTER.join(" × ")}`);
        }
        v.push(...tierUrteil(name, nach.tiere));
    }
    return v;
}

// DAS ENDE DER WERKBANK: `/stop` beendet sie samt Chrome; die Folge wartet auf ihr Ende (`frist`). Hängt
// `/stop` (eine tote Seite, ein hängender Browser), stirbt der ganze Prozess-Baum — Werkbank und Chrome (Windows:
// `taskkill /T /F`, ein TerminateProcess allein ließe Chrome stehen; sonst SIGTERM, puppeteer räumt Chrome, dann SIGKILL).
// Rückgabe: wie sie endete (`stop` · `getoetet` · `beendet` = schon vorher · `waise`).
async function beendeBaum(kind, frist) {
    const lebt = () => kind.exitCode === null && kind.signalCode === null;
    if (!lebt()) return "beendet";
    const ende = new Promise((res) => kind.once("exit", () => res(true)));
    const warte = (ms) => Promise.race([ende, new Promise((res) => setTimeout(() => res(false), ms))]);
    if (await warte(frist)) return "stop";
    try {
        if (process.platform === "win32") execSync(`taskkill /PID ${kind.pid} /T /F`, { stdio: "ignore" });
        else {
            kind.kill("SIGTERM");
            if (!(await warte(10000))) kind.kill("SIGKILL");
        }
    } catch {
        try {
            kind.kill("SIGKILL");
        } catch {}
    }
    return (await warte(10000)) || !lebt() ? "getoetet" : "waise";
}

// Ein Abbruch der Werkbank ist ein Fehler-TEXT (`{ fehler: "…" }`); die Liste `fehler` eines Laufs sind die Konsolen-Zeilen
// der Seite (sie reisen im JSON mit, sie sind keine Wache).
const abbruchVon = (o) => (o && typeof o.fehler === "string" ? o.fehler : null);

// Die Kurzfassung eines Laufs (das, was der OMEN-Bericht zitiert).
function laufKurz(l) {
    if (!l || abbruchVon(l)) return l ? { fehler: abbruchVon(l) } : null;
    const ph = l.phasenEwmaMs || {};
    return {
        fps: l.fps,
        frames: l.frames,
        frameMs: l.frameMs,
        cpuTaktMs: l.cpuTaktMs,
        gpuDurchsatzMs: l.gpuDurchsatzMs,
        renderEwmaMs: ph.render != null ? ph.render : null,
        befehle: l.befehle ? { mittel: l.befehle.mittel, max: l.befehle.max } : null,
        dreiecke: l.dreiecke ? { mittel: l.dreiecke.mittel, max: l.dreiecke.max } : null,
        vramMB: l.vramMB ? l.vramMB.jetzt : null,
        stempelGueltig: l.stempel ? l.stempel.gueltig : null,
        takt: l.takt || null,
        wetter: l.wetterHalt ? l.wetterHalt.urteil : null,
        ruhe: l.ruhe ? l.ruhe.ruhig : null,
    };
}

// ── der Lauf gegen die Werkbank ─────────────────────────────────────────────────────────────────────────────────────

// DER NEULAUF: ein Boot, dessen Band nicht einschwingt (nach dem Deckel baut die Welt noch — ein Dorf-Plan,
// eine Schlange), misst eine andere Szene als seine Geschwister und trägt kein Urteil (1510-k72-abab: an Genesis 7 von 16
// Boots, −2 Baum-Befehle, +6 fps). Die Folge fährt ihn neu, höchstens NEULAUF_MAX-mal — ein Erst-Boot einer Serie mit
// frischem Profil, sonst wäre der Neulauf ein Zweit-Boot; schwingt auch der letzte nicht ein, ist er ROT beim Namen
// (`EINSCHWINGEN`). Jeder verworfene Lauf liegt neben dem JSON (`<datei>-verworfen-<n>.json`), das JSON nennt sie (`versuche`).
const NEULAUF_MAX = 2;
const neulaufNoetig = (r) => !!r && r.code !== 2 && !!r.einschwung && r.einschwung.eingeschwungen === false;
const einschwingBefund = (e, versuch, letzter) =>
    e && e.eingeschwungen === false && letzter
        ? `EINSCHWINGEN: ${versuch} Läufe, keiner schwingt ein (${e.takte} Takte) — offen ${JSON.stringify(e.offen)}`
        : null;
const dorfBefund = (um) =>
    um && um.dorfSchwebt
        ? `DORF: vor dem Ort ging ein Dorf los (${um.dorfSchwebt}) — sein Plan schwebt, der Wald weicht ihm, die Szene ist nicht die des Orts`
        : null;
// der Start der Werkbank: der Ort schon hier (`start --ort`) — ein Ort ohne Dorf-Zug sperrt ihn ab dem ersten Skript
const startArgs = (port, seite, ort, serie) => {
    const a = [path.join(__dirname, "werkbank.cjs"), "start", "--echt", "--port", String(port), "--seite", seite, "--ort", ort];
    if (serie) a.push("--serie", serie);
    return a;
};
const serieProfil = (serie) =>
    serie ? path.join(root, "artifacts", "werkbank", "profil-" + serie.replace(/[^a-z0-9_-]+/gi, "_")) : null;

async function folgeMitNeulauf() {
    const versuche = [];
    for (let v = 1; ; v++) {
        const r = await folge({ versuch: v, versuche: versuche.slice(), letzter: v > NEULAUF_MAX });
        if (!neulaufNoetig(r) || v > NEULAUF_MAX) process.exit(r.code);
        const weg = r.datei.replace(/\.json$/, "") + `-verworfen-${v}.json`;
        fs.renameSync(r.datei, weg);
        versuche.push({ versuch: v, datei: path.basename(weg), takte: r.einschwung.takte, offen: r.einschwung.offen });
        console.log(
            `[folge] Lauf ${v} NICHT eingeschwungen (offen ${JSON.stringify(r.einschwung.offen)}) — Neulauf ${v + 1} von höchstens ${NEULAUF_MAX + 1}`
        );
        if (r.profilFrisch) fs.rmSync(r.profilFrisch, { recursive: true, force: true });
    }
}

async function folge(neu = { versuch: 1, versuche: [], letzter: true }) {
    const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
    const SEITE = String(opt("--seite", process.env.WERKBANK_SEITE || "http://localhost:4312"));
    const SERIE = opt("--serie", "");
    const P = {
        laufSek: Number(opt("--lauf-sek", 30)),
        ein: Number(opt("--ein", 20)),
        ruhe: Number(opt("--ruhe", 300)),
        profilSek: Number(opt("--profil-sek", 12)),
        proben: Number(opt("--proben", 6)),
    };
    const git = (c) => {
        try {
            return execSync(`git ${c}`, { cwd: root, encoding: "utf8" }).trim();
        } catch {
            return null;
        }
    };
    const sha = git("rev-parse HEAD");
    // DIE BASIS-SEITE A (`--basis <A.json>`, das JSON ihres Boots): vor dem Boot gelesen — ein anderer Ort, eine andere Sicht
    // oder keine Band-Messung brechen ab (Exit 2), nie still ohne Basis.
    const basisDatei = opt("--basis", null);
    let basis = null;
    if (basisDatei) {
        const bj = ausDatei(path.resolve(basisDatei), true);
        basis = bandMessungAus(bj);
        const bp = bj.parameter || {};
        if (!basis || bp.ort !== ORT || bp.sicht !== SICHT)
            throw new Error(
                `--basis ${basisDatei}: ${basis ? `Ort ${bp.ort} · Sicht ${bp.sicht}` : "keine Band-Messung"} — die Basis-Seite A misst ${ORT} · ${SICHT}`
            );
    }
    const start = new Date();
    const datei = path.resolve(
        opt(
            "--datei",
            path.join(
                root,
                "artifacts",
                "omen",
                `messfolge-${(sha || "ohne-git").slice(0, 8)}-${start.toISOString().replace(/[:.]/g, "-")}.json`
            )
        )
    );
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    const { ort } = BAND.ladeSpec(ORT);
    const aus = {
        folge: FOLGE,
        stand: {
            sha,
            zweig: git("rev-parse --abbrev-ref HEAD"),
            schmutzig: !!git("status --porcelain"),
            version: null,
        },
        start: start.toISOString(),
        rechner: { name: os.hostname(), cpu: (os.cpus()[0] || {}).model || null },
        parameter: Object.assign(
            { port: PORT, seite: SEITE, serie: SERIE || null, ort: ORT, sicht: SICHT, basis: basisDatei, fenster: FENSTER },
            P
        ),
        schritte: [],
        befunde: [],
        kurz: {},
        urteil: null,
        versuch: neu.versuch,
        versuche: neu.versuche,
        einschwung: null,
    };
    const schreibe = () => fs.writeFileSync(datei, JSON.stringify(aus, null, 1));
    const log = [];
    const profilSerie = serieProfil(SERIE);
    const serieNeu = !!profilSerie && !fs.existsSync(profilSerie);
    const args = startArgs(PORT, SEITE, ORT, SERIE);
    const kind = spawn(process.execPath, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let bereit = null;
    const fertigP = new Promise((res) => (bereit = res));
    const zeile = (d) => {
        for (const l of String(d).split("\n").filter(Boolean)) {
            log.push(l);
            if (log.length > 200) log.shift();
            if (/WERKBANK bereit/.test(l)) bereit(true);
        }
    };
    kind.stdout.on("data", zeile);
    kind.stderr.on("data", zeile);
    kind.on("exit", (c) => {
        log.push(`[werkbank] Ende mit ${c}`);
        bereit(false);
    });
    const R = (weg, n) => werkbankRuf(PORT, weg, n);
    let vor = null;
    let gehalten = false;
    const gefahren = [];
    const schritt = async (name, tat) => {
        const t0 = Date.now();
        const e = { name, ergebnis: null, ms: 0, befunde: [] };
        aus.schritte.push(e);
        console.log(`[folge] ${name} …`);
        e.ergebnis = await tat();
        e.ms = Date.now() - t0;
        gefahren.push(name);
        if (name === "buehne") gehalten = true;
        const nach = await R("/wache", {
            seit: vor && vor.wetter ? vor.wetter.seq : 0,
            seitWelt: vor && vor.weltakt ? vor.weltakt.seq : 0,
        });
        e.wache = nach;
        if (MESSEN.has(name)) e.tiere = tierKurz(nach && nach.tiere);
        e.befunde = wachenUrteil(name, vor, nach, ort, gehalten && name !== "buehne");
        if (name === "buehne" && nach.wetter.wetter !== "sunny")
            e.befunde.push(`WETTER buehne: „${nach.wetter.wetter}" nach der Bühne`);
        if (abbruchVon(e.ergebnis)) e.befunde.push(`SCHRITT ${name}: ${abbruchVon(e.ergebnis)}`);
        aus.befunde.push(...e.befunde);
        for (const b of e.befunde) console.log(`  ROT ${b}`);
        if (nach && nach.version) aus.stand.version = nach.version;
        vor = nach;
        schreibe();
        return e.ergebnis;
    };
    let abbruch = null;
    try {
        const ok = await Promise.race([fertigP, new Promise((res) => setTimeout(() => res(false), 600000))]);
        if (!ok) throw new Error("die Werkbank wurde nicht bereit (10 min) — " + log.slice(-5).join(" | "));
        await schritt("boot", () => R("/status"));
        // die Wache vor dem ersten Schritt mit Ort: der Stand nach dem Boot
        await schritt("dorf-aus", () => R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" }));
        await schritt("fenster", () => R("/fenster", { w: FENSTER[0], h: FENSTER[1] }));
        const um = await schritt("umstellen", () => R("/umstellen", { ort: ORT, sicht: SICHT }));
        const db = dorfBefund(um);
        if (db) {
            aus.schritte[aus.schritte.length - 1].befunde.push(db);
            aus.befunde.push(db);
            console.log(`  ROT ${db}`);
        }
        await schritt("buehne", () => R("/eval", { code: "return window.__buehne();" }));
        // die Tiere des zuletzt gefahrenen Schritts (aus seiner Wache) — neben jede Kurzfassung
        const tiereZuletzt = () => {
            const e = aus.schritte[aus.schritte.length - 1];
            return e ? e.tiere || null : null;
        };
        const mitTieren = (k) => (k ? Object.assign(k, { tiere: tiereZuletzt() }) : { tiere: tiereZuletzt() });
        const hat = (n) => FOLGE.includes(n);
        // Der Lauf trägt seinen Takt wie die Bank (1110-9: CPU-Takt und Frame p95 unter dem Leistungs-Deckel der GPU).
        const lauf = async (regler) => {
            const { b, takt } = await mitTakt(() => R("/lauf", { sek: P.laufSek, ein: P.ein, ruhe: P.ruhe, regler, tiere: "frei" }));
            if (b && typeof b === "object") b.takt = takt;
            return b;
        };
        if (hat("lauf-voll")) aus.kurz.laufVoll = mitTieren(laufKurz(await schritt("lauf-voll", () => lauf("voll"))));
        if (hat("lauf-frei")) aus.kurz.laufFrei = mitTieren(laufKurz(await schritt("lauf-frei", () => lauf("frei"))));
        // DIE BANK je Blick (Gier 0 und −0,88: der ferne Schatten nimmt je Blick andere Gruppen mit), danach steht der Blick
        // wieder auf der Gier des Orts — die Ort-Wache nach dem Schritt prüft es. Je Blick zählt die Werkbank die Tiere
        // (Sichtkegel und Kaskaden dieses Blicks).
        const blick = (g) =>
            R("/eval", {
                code:
                    `r.state.yaw = ${g}; r.state.pitch = 0;` +
                    "for (let i = 0; i < 20; i++) { window.__wetterHalten(); if (window.__ortSchritt) window.__ortSchritt(); " +
                    "r._gameLoopTick(performance.now()); await sleep(16); } " +
                    "r.state.renderer.setAnimationLoop(null); " +
                    "return { gier: r.state.yaw, tiere: typeof window.__tierZahl === 'function' ? window.__tierZahl() : null };",
            });
        if (hat("gpu-bank") && ort.bank) {
            // DIE LANGE BANK je Pose (Toggle-Ort, 1110-6): der Spieler steht an der Pose (die Werkbank wartet, bis der
            // Chunk-Bestand ruht), eine Aufwärm-Bank fällt weg (nach jedem Wechsel trägt die erste Bank Neu-Übersetzung und
            // den letzten Zuzug), dann `bank.je` Bänke zu `bank.n` × `bank.runden`; ihr Mittel ist der Wert der Pose.
            const B = ort.bank;
            const bank = await schritt("gpu-bank", async () => {
                const je = {};
                for (const p of ort.posen) {
                    const u = await R("/umstellen", { ort: ORT, pose: p.id });
                    if (abbruchVon(u)) {
                        je[p.id] = u;
                        continue;
                    }
                    await blick(BAND.ortGier(p));
                    await R("/gpu-bank", { n: 120, runden: 2 });
                    const werte = [];
                    const takte = [];
                    let cpu = 0;
                    for (let i = 0; i < B.je; i++) {
                        const { b, takt } = await mitTakt(() => R("/gpu-bank", { n: B.n, runden: B.runden }));
                        if (abbruchVon(b)) {
                            je[p.id] = b;
                            break;
                        }
                        werte.push(b.gpuJeFrameMs);
                        takte.push(takt);
                        cpu += b.cpuJeFrameMs / B.je;
                    }
                    if (je[p.id]) continue;
                    const mittel = werte.reduce((a, c) => a + c, 0) / werte.length;
                    je[p.id] = {
                        gpuJeFrameMs: +mittel.toFixed(3),
                        cpuJeFrameMs: +cpu.toFixed(3),
                        werte,
                        chunks: u.chunks,
                        takt: taktZusammen(takte),
                    };
                }
                await R("/umstellen", { ort: ORT });
                return je;
            });
            aus.kurz.gpuBank = {};
            for (const p of ort.posen) {
                const b = bank && bank[p.id];
                if (abbruchVon(b)) aus.befunde.push(`SCHRITT gpu-bank (Pose ${p.id}): ${abbruchVon(b)}`);
                aus.kurz.gpuBank[p.id] = b && !abbruchVon(b) ? b : null;
            }
        } else if (hat("gpu-bank")) {
            const bank = await schritt("gpu-bank", async () => {
                const je = {};
                for (const g of BANK_GIER) {
                    const b = await blick(g);
                    const m = await mitTakt(() => R("/gpu-bank", { n: 12, runden: 3 }));
                    je[String(g)] = m.b;
                    if (je[String(g)] && typeof je[String(g)] === "object") {
                        je[String(g)].tiere = b && b.ergebnis ? b.ergebnis.tiere : null;
                        je[String(g)].takt = m.takt;
                    }
                }
                await blick(BAND.ortGier(ort));
                return je;
            });
            aus.kurz.gpuBank = {};
            for (const g of BANK_GIER) {
                const b = bank && bank[String(g)];
                if (abbruchVon(b)) aus.befunde.push(`SCHRITT gpu-bank (Gier ${g}): ${abbruchVon(b)}`);
                else aus.befunde.push(...tierUrteil(`gpu-bank (Gier ${g})`, b && b.tiere));
                aus.kurz.gpuBank[String(g)] =
                    b && !abbruchVon(b)
                        ? {
                              gpuJeFrameMs: b.gpuJeFrameMs,
                              cpuJeFrameMs: b.cpuJeFrameMs,
                              tiere: tierKurz(b.tiere),
                              takt: b.takt || null,
                          }
                        : b;
            }
        }
        if (hat("band")) {
            const bandDatei = path.join(os.tmpdir(), `messfolge-band-${PORT}-${Date.now()}.json`);
            const band = await schritt("band", () => R("/band", { ort: ORT, datei: bandDatei, proben: P.proben }));
            // die Band-Messung reist im EINEN JSON mit (die Werkbank schrieb sie in eine Zwischen-Datei)
            let messung = null;
            if (band && fs.existsSync(bandDatei)) {
                const e = aus.schritte[aus.schritte.length - 1];
                messung = ausDatei(bandDatei, true);
                e.ergebnis = Object.assign({}, band, { messung });
                delete e.ergebnis.datei;
                fs.rmSync(bandDatei, { force: true });
            }
            // schwang die Welt ein? (der Neulauf entscheidet daran; der letzte Versuch, der nicht einschwingt, ist ROT)
            const m = messung && messung.messung;
            if (m) aus.einschwung = { eingeschwungen: m.eingeschwungen === true, takte: m.takte, offen: m.offen || null };
            const eb = einschwingBefund(aus.einschwung, neu.versuch, neu.letzter);
            if (eb) {
                aus.schritte[aus.schritte.length - 1].befunde.push(eb);
                aus.befunde.push(eb);
                console.log(`  ROT ${eb}`);
            }
            // die Band urteilt ihre eigene Aufzeichnung: der gestellte Ort, Gerät und Sicht und jede Rot-Zeile der Linse, die
            // die Basis-Seite A nicht trägt
            if (!abbruchVon(band)) {
                const e = aus.schritte[aus.schritte.length - 1];
                const bb = bandBefunde(messung, basis);
                e.befunde.push(...bb);
                aus.befunde.push(...bb);
                for (const b of bb) console.log(`  ROT ${b}`);
            }
            schreibe();
            const vram = messung && messung.vram ? messung.vram.mb : null;
            aus.kurz.band = mitTieren(
                band
                    ? {
                          urteil: band.urteil,
                          linse: band.linse,
                          stempel: band.stempel && band.stempel.urteil,
                          gestellt:
                              messung && Array.isArray(messung.ortGestellt) ? messung.ortGestellt.length === 0 : null,
                          vramMB: vram,
                          geraet: messung && messung.geraet ? messung.geraet.schluessel : null,
                          sicht: messung ? messung.sicht || null : null,
                          rot: messung && Array.isArray(messung.rot) ? messung.rot.length : null,
                          befunde: messung ? bandBefunde(messung, basis).length : null,
                      }
                    : null
            );
        }
        if (hat("profil")) {
            const prof = await schritt("profil", () =>
                R("/haenger", { spitze: true, sek: P.profilSek, ein: 2, regler: "voll", tiere: "frei" })
            );
            aus.kurz.profil = mitTieren(
                prof && !abbruchVon(prof) ? { cpuMs: prof.cpuMs, taeter: prof.taeter.slice(0, 12) } : null
            );
            if (prof && prof.wetterHalt && prof.wetterHalt.urteil === "ROT")
                aus.befunde.push(...prof.wetterHalt.taeter.map((t) => `WETTER profil (Lauf): ${t}`));
        }
    } catch (e) {
        abbruch = String((e && e.message) || e);
        aus.abbruch = abbruch;
    } finally {
        aus.befunde.push(...folgeUrteil(gefahren, FOLGE).filter(() => !abbruch));
        if (!abbruch && gefahren.length !== FOLGE.length)
            aus.befunde.push(`FOLGE: ${gefahren.length} von ${FOLGE.length} Schritten gefahren`);
        try {
            await Promise.race([R("/stop"), sleep(30000)]);
        } catch {}
        aus.werkbankEnde = await beendeBaum(kind, 30000);
        if (aus.werkbankEnde === "waise")
            aus.befunde.push(
                `ENDE: die Werkbank (PID ${kind.pid}) überlebt /stop und den Baum-Abbau — Port ${PORT} bleibt belegt`
            );
        aus.ende = new Date().toISOString();
        aus.urteil = abbruch ? "ABBRUCH" : aus.befunde.length ? "ROT" : "GRUEN";
        aus.werkbankLog = log.slice(-40);
        schreibe();
    }
    console.log(`\nMESS-FOLGE ${aus.urteil}${abbruch ? ": " + abbruch : ""} — ${aus.befunde.length} Befunde\n${datei}`);
    for (const k of ["laufVoll", "laufFrei"]) {
        const l = aus.kurz[k];
        if (l && l.frameMs)
            console.log(
                `  ${k}: ${l.fps} fps · Frame p50/p95/max ${l.frameMs.p50}/${l.frameMs.p95}/${l.frameMs.max} ms · CPU p50/p95 ` +
                    `${l.cpuTaktMs.p50}/${l.cpuTaktMs.p95} · render-Wanduhr (EWMA, mit CPU-Zustand) ${l.renderEwmaMs} · ${tierZeile(l.tiere)}`
            );
    }
    for (const [g, b] of Object.entries(aus.kurz.gpuBank || {}))
        if (b && b.gpuJeFrameMs != null)
            console.log(
                b.werte
                    ? `  gpu-bank Pose ${g}: ${b.gpuJeFrameMs} ms je Frame (${b.werte.join(" · ")}; CPU ${b.cpuJeFrameMs}, Chunks ${b.chunks}; Takt ${b.takt ? b.takt.mhz + " MHz, " + b.takt.temp + " °C, Drossel " + Object.keys(b.takt.drossel).join("/") : "—"})`
                    : `  gpu-bank Gier ${g}: ${b.gpuJeFrameMs} ms je Frame (CPU ${b.cpuJeFrameMs}) · ${tierZeile(b.tiere)}`
            );
    if (aus.kurz.band && aus.kurz.band.urteil)
        console.log(
            `  band: ${aus.kurz.band.urteil} (Linse ${aus.kurz.band.linse}, Stempel ${aus.kurz.band.stempel}) · ` +
                tierZeile(aus.kurz.band.tiere)
        );
    if (aus.kurz.profil && aus.kurz.profil.cpuMs)
        console.log(`  profil: CPU-Takt p95 ${aus.kurz.profil.cpuMs.p95} ms · ${tierZeile(aus.kurz.profil.tiere)}`);
    console.log(`  Werkbank-Ende: ${aus.werkbankEnde}`);
    return {
        code: abbruch ? 2 : aus.befunde.length ? 1 : 0,
        einschwung: aus.einschwung,
        profilFrisch: serieNeu ? profilSerie : null,
        datei,
    };
}

// DER SELBSTTEST (ohne Welt): die Folge-Regel und jede Wache fallen bei ihrem Täter rot und nennen ihn; der Tier-Zähler steht
// und zählt; eine Werkbank mit hängendem `/stop` stirbt samt Kind.
async function selbsttest() {
    const { ort } = BAND.ladeSpec(ORT);
    const fehler = [];
    const pruefe = (name, v, muss) => {
        const ok = muss ? v.some((x) => muss.test(x)) : v.length === 0;
        if (!ok) fehler.push(`${name}: ${v.join(" · ") || "(grün)"}`);
        console.log(`  ${ok ? "✅" : "❌"} ${name} → ${v.join(" · ") || "grün"}`);
    };
    pruefe("die Folge", folgeUrteil(FOLGE), null);
    const tausch = FOLGE.slice();
    tausch.splice(FOLGE.indexOf("band"), 1);
    tausch.splice(FOLGE.indexOf("lauf-voll"), 0, "band");
    pruefe("band vor lauf", folgeUrteil(tausch), /band vor lauf-voll — der Pool ist gefüllt/);
    pruefe("ohne Bühne", folgeUrteil(FOLGE.filter((n) => n !== "buehne")), /„buehne" fehlt vor dem ersten Messen/);
    const spaet = FOLGE.filter((n) => n !== "dorf-aus");
    spaet.splice(spaet.indexOf("umstellen") + 1, 0, "dorf-aus");
    pruefe(
        "Dorf-Zug erst nach dem Umstellen",
        folgeUrteil(spaet),
        /Dorf-Zug ruht erst nach dem Umstellen|„dorf-aus" nach/
    );
    const wache = (o) =>
        Object.assign(
            {
                wetter: { seq: 0, wetter: "sunny", uhr: -1e9, fest: true, buch: [] },
                weltakt: { seq: 0, gehalten: true, blind: false, buch: [] },
                stempel: { ueberlauf: 0, spitze: 40, pool: { stand: 0, max: 2048 }, taeter: {} },
                ort: {
                    ort: "wiese",
                    dorfZug: false,
                    ortTakt: [],
                    gier: BAND.ortGier(ort),
                    spieler: ort.spieler.slice(),
                    sicht: "ego",
                },
                fenster: { innen: FENSTER.slice(), puffer: FENSTER.slice() },
                tiere: {
                    gesamt: 14,
                    sicht: 3,
                    sichtNah: 1,
                    schatten: { k0: 2, k1: 3 },
                    arten: { wolf: 6, hirsch: 8 },
                    artenSicht: { hirsch: 3 },
                },
            },
            o
        );
    pruefe("ruhige Wachen", wachenUrteil("lauf-voll", wache(), wache(), ort, true), null);
    // DER TIER-ZÄHLER: die Zahl ist Weltzustand (nie rot, auch 101 Tiere nicht), der Zähler muss stehen und zählen
    pruefe(
        "viele Tiere sind kein Befund",
        wachenUrteil(
            "lauf-frei",
            wache(),
            wache({
                tiere: { gesamt: 101, sicht: 40, sichtNah: 9, schatten: { k0: 30, k1: 60 }, arten: { wolf: 101 } },
            }),
            ort,
            true
        ),
        null
    );
    pruefe(
        "der Tier-Zähler fehlt",
        wachenUrteil("lauf-voll", wache(), wache({ tiere: null }), ort, true),
        /TIERE lauf-voll: kein Tier-Zähler — die Messung steht ohne ihre Tiere/
    );
    pruefe(
        "der Sichtkegel zählt NaN",
        wachenUrteil(
            "band",
            wache(),
            wache({ tiere: { gesamt: 14, sicht: NaN, sichtNah: 0, schatten: { k0: 1 }, arten: { wolf: 14 } } }),
            ort,
            true
        ),
        /TIERE band: sicht ist NaN/
    );
    pruefe(
        "der Schatten-Wurf einer Kaskade zählt nicht",
        tierUrteil("gpu-bank (Gier -0.88)", {
            gesamt: 14,
            sicht: 3,
            sichtNah: 1,
            schatten: { k0: 2, k1: undefined },
            arten: { wolf: 14 },
        }),
        /TIERE gpu-bank \(Gier -0\.88\): schatten k1 ist undefined/
    );
    pruefe(
        "die Arten fehlen",
        tierUrteil("profil", { gesamt: 14, sicht: 3, sichtNah: 1, schatten: { k0: 2, k1: 3 } }),
        /TIERE profil: keine Arten gezählt/
    );
    pruefe(
        "vor dem Messen zählt der Zähler nicht",
        wachenUrteil("umstellen", wache(), wache({ tiere: null }), ort, false),
        null
    );
    const regen = wache({
        wetter: {
            seq: 1,
            wetter: "rainy",
            uhr: -1e9,
            fest: true,
            buch: [
                {
                    art: "schreiber",
                    von: "sunny",
                    zu: "rainy",
                    quelle: "emotion:sorrow",
                    stapel: "weather ← … ← dslRun ← trigger ← updatePlayerEmotions",
                },
            ],
        },
    });
    pruefe(
        "Wetter dreht (Emotion)",
        wachenUrteil("lauf-voll", wache(), regen, ort, true),
        /WETTER lauf-voll: sunny → rainy durch emotion:sorrow/
    );
    pruefe(
        "Wetter taut",
        wachenUrteil(
            "lauf-frei",
            wache(),
            wache({ wetter: { seq: 0, wetter: "sunny", uhr: 17.6, fest: false, buch: [] } }),
            ort,
            true
        ),
        /taut/
    );
    pruefe(
        "Pool läuft über",
        wachenUrteil(
            "band",
            wache(),
            wache({ stempel: { ueberlauf: 927, pool: { stand: 2048, max: 2048 }, taeter: { "PMREM.cubeUv": 806 } } }),
            ort,
            true
        ),
        /STEMPEL band: 927 verweigerte Abfragen .*PMREM\.cubeUv 806/
    );
    pruefe(
        "Dorf-Zug läuft",
        wachenUrteil("gpu-bank", wache(), wache({ ort: Object.assign({}, wache().ort, { dorfZug: true }) }), ort, true),
        /ORT gpu-bank \(nach\): Dorf-Zug läuft/
    );
    pruefe(
        "Spieler gewandert",
        wachenUrteil(
            "profil",
            wache({ ort: Object.assign({}, wache().ort, { spieler: [ort.spieler[0] + 40, ort.spieler[1]] }) }),
            wache(),
            ort,
            true
        ),
        /der Spieler steht 40\.0 m vom Messort/
    );
    pruefe(
        "Fenster kleiner",
        wachenUrteil("lauf-voll", wache(), wache({ fenster: { innen: [1280, 720], puffer: [1280, 720] } }), ort, true),
        /FENSTER lauf-voll \(nach\): 1280 × 720/
    );
    pruefe("vor der Bühne zählt das Wetter nicht", wachenUrteil("umstellen", wache(), regen, ort, false), null);
    // DIE WELT-WACHE (0710-7, OMEN 0710-6 Boot 4B: ein Nexus-Dorf drehte den Blick mitten im Lauf)
    const dorf = wache({
        weltakt: {
            seq: 1,
            gehalten: true,
            blind: false,
            buch: [
                {
                    art: "durch",
                    op: "spawn_village",
                    quelle: "nexus",
                    stapel: "dslEval ← … ← dslRun ← _loopNexusUpdate",
                },
            ],
        },
    });
    pruefe(
        "Nexus-Dorf unter dem Halt",
        wachenUrteil("lauf-voll", wache(), dorf, ort, true),
        /WELTAKT lauf-voll: spawn_village durch nexus/
    );
    pruefe(
        "verweigerte Welt-Akte sind grün",
        wachenUrteil(
            "lauf-voll",
            wache(),
            wache({
                weltakt: {
                    seq: 2,
                    gehalten: true,
                    blind: false,
                    buch: [{ art: "verweigert", op: "spawn_creature", quelle: "nexus" }],
                },
            }),
            ort,
            true
        ),
        null
    );
    pruefe(
        "Welt-Akt-Spion blind",
        wachenUrteil(
            "lauf-voll",
            wache(),
            wache({ weltakt: { seq: 0, gehalten: true, blind: true, buch: [] } }),
            ort,
            true
        ),
        /WELTAKT lauf-voll: das Spiel nennt keine Welt-Akte/
    );
    pruefe(
        "Wache ohne Welt-Akt-Spion",
        wachenUrteil("lauf-voll", wache(), wache({ weltakt: null }), ort, true),
        /WELTAKT lauf-voll: kein Welt-Akt-Spion/
    );
    pruefe("vor der Bühne zählen Welt-Akte nicht", wachenUrteil("umstellen", wache(), dorf, ort, false), null);
    // DER GENESIS-RING: seine Folge ist die eigene (Boot · Ort · Bühne · Lauf voll · Band — seit 1110-9 richtet E dort
    // auch Frame und CPU-Takt); eine Bank der Wiese an der Genesis fällt beim Namen, ein Lauf an der Wiese, der „genesis"
    // heißt, an der Ort-Wache und an der Aufzeichnung der Band — und ein liegen gelassenes Rahmen-Ziel des Direktpfads
    // (0710-9 B: `band --ort genesis` nach `zerlegen` in derselben Sitzung) beim Namen.
    pruefe("die Genesis-Folge", folgeUrteil(FOLGEN.genesis, FOLGEN.genesis), null);
    pruefe("die Dorf-Folge", folgeUrteil(FOLGEN.dorf, FOLGEN.dorf), null);
    pruefe(
        "Genesis mit einer Bank der Wiese",
        folgeUrteil(["boot", "dorf-aus", "fenster", "umstellen", "buehne", "lauf-voll", "gpu-bank", "band"], FOLGEN.genesis),
        /unbekannter Schritt „gpu-bank"/
    );
    pruefe(
        "Genesis: Band vor dem Lauf",
        folgeUrteil(["boot", "dorf-aus", "fenster", "umstellen", "buehne", "band", "lauf-voll"], FOLGEN.genesis),
        /„lauf-voll" nach „band"/
    );
    {
        const g = BAND.ladeSpec("genesis").ort;
        const anWiese = wache({ ort: Object.assign({}, wache().ort, { spieler: g.spieler.slice() }) });
        pruefe(
            "Genesis gezählt an der Wiese (Ort-Wache)",
            wachenUrteil("band", anWiese, anWiese, g, true),
            /ORT band \(vor\): aufgestellt am Ort wiese, nicht genesis/
        );
        // DER LESER DER BAND-LINSE: jede
        // Rot-Zeile der Linse ist ein Befund der Folge — außer die Basis-Seite A des ABAB trägt sie (derselbe Schlüssel, B nicht
        // über A hinaus, A am selben Ort, Gerät und in derselben Sicht).
        const { haushalt } = BAND.ladeSpec("genesis");
        const zerlegSitzung = Object.assign(
            BAND.bandUrteil({
                zensus: { klassen: [] },
                vram: {
                    mb: 141.1,
                    liste: [
                        { k: "buf:szene:bodenSatz", mb: 24.5, n: 6 },
                        { k: "tex:r184-ausgabe rgba16float 1920x1080x1", mb: 15.8, n: 1 },
                        { k: "tex:r184-ausgabe:tiefe depth24plus 1920x1080x1", mb: 7.9, n: 1 },
                    ],
                },
                haushalt,
                ratsche: BAND.ladeSpec("genesis", { geraet: "radeon", sicht: "ego" }).ratsche,
                ort: g,
            }),
            {
                ortGestellt: [
                    "aufgestellt am Ort wiese, nicht genesis",
                    "Ort-Takt [], der Ort will [_genesisPortalRing,_portalApproachPrefetch]",
                ],
                geraet: { schluessel: "radeon", text: "amd rdna-3" },
                sicht: "ego",
            }
        );
        const bz = bandBefunde(zerlegSitzung);
        pruefe("0710-9: Genesis nicht gestellt", bz, /ORT band: NICHT GESTELLT — aufgestellt am Ort wiese, nicht genesis/);
        pruefe("0710-9: das Rahmen-Ziel der Zerleg-Linse", bz, /BAND-LINSE leck: tex:r184-ausgabe 23\.7 MB in 2 Texturen/);
        const TOL = { toleranzPct: 1, toleranzAbs: { befehle: 2, dreiecke: 5000, vramMB: 2 } };
        const M = (rot, z) =>
            Object.assign({ ort: "wiese", geraet: { schluessel: "gtx", text: "nvidia pascal" }, sicht: "ego", ortGestellt: [], toleranz: TOL, rot }, z);
        const zeile = (art, schluessel, ist, groesse, text) => ({ art, schluessel, ist, groesse, text });
        const EINZEL = zeile("ratsche", "ratsche:einzelstuecke:k0:dreiecke", 37964, "dreiecke", "einzelstuecke k0: 37964 dreiecke über der Ratsche 0 (Täter: spieler, dsl-insel, feld-pass)");
        pruefe("ein gestellter Ring ohne Rot-Zeile", bandBefunde(M([])), null);
        pruefe("eine eingeschmuggelte Rot-Zeile der Band-Linse", bandBefunde(M([EINZEL])), /^BAND-LINSE ratsche: einzelstuecke k0: 37964 dreiecke über der Ratsche 0/);
        for (const [art, s, ist, gr] of [
            ["haushalt", "haushalt:g:neu", 4, "befehle"],
            ["unbenannt", "unbenannt:UNBENANNT:Mesh", 3, "befehle"],
            ["stufe", "stufe:f:buche:L0:L0", 120, null],
            ["leck", "leck:buf:verwaist", 12.5, "vramMB"],
            ["weit", "weit:baum:haupt:dreiecke", null, null],
            ["ungemessen", "ratsche:ungemessen", null, null],
        ])
            pruefe(`Rot-Zeile ${art}`, bandBefunde(M([zeile(art, s, ist, gr, `${art}-Zeile`)])), new RegExp(`^BAND-LINSE ${art}: ${art}-Zeile`));
        pruefe("die Basis A trägt die Zeile (gleicher Schlüssel, gleiches Ist)", bandBefunde(M([EINZEL]), M([EINZEL])), null);
        pruefe(
            "B über der Basis A hinaus (47 028 gegen 37 964 Dreiecke)",
            bandBefunde(M([Object.assign({}, EINZEL, { ist: 47028 })]), M([EINZEL])),
            /^BAND-LINSE ratsche: .* \(über der Basis A 37964\)/
        );
        pruefe("die Basis A trägt einen anderen Schlüssel", bandBefunde(M([EINZEL]), M([zeile("ratsche", "ratsche:boden:haupt:dreiecke", 1, "dreiecke", "x")])), /^BAND-LINSE ratsche: einzelstuecke/);
        pruefe("die Basis A an einem anderen Gerät", bandBefunde(M([EINZEL]), M([EINZEL], { geraet: { schluessel: "radeon", text: "amd" } })), /^BASIS band: .*Gerät radeon/);
        pruefe("die Basis A in einer anderen Sicht", bandBefunde(M([EINZEL]), M([EINZEL], { sicht: "third" })), /^BASIS band: .*Sicht third/);
        pruefe("eine Zeile ohne Schlüssel trägt keine Basis", bandBefunde(M([{ art: "ratsche", text: "alt" }]), M([{ art: "ratsche", text: "alt" }])), /^BAND-LINSE ratsche: alt/);
        pruefe("die Messung nennt kein Gerät", bandBefunde(M([], { geraet: null })), /^BAND band: die Messung nennt kein Gerät/);
        pruefe("die Band-Linse schrieb kein Urteil", bandBefunde(M(undefined)), /^BAND band: die Band-Linse schrieb kein Urteil/);
        pruefe("die Band schrieb keine Messung", bandBefunde(null), /keine Messung/);
        // DIE GEGENPROBE 1110-12 (spec/profiband/probe-1110-12.json): beide Boots ROT beim Namen
        const probe = ausDatei(path.join(root, "spec", "profiband", "probe-1110-12.json"), true);
        const bandVon = (j) => j.schritte.find((s) => s.name === "band").ergebnis.messung;
        pruefe("1110-12 w2B (Wiese)", bandBefunde(bandVon(probe.boots.w2B)), /^BAND-LINSE ratsche: einzelstuecke k0: 37964 dreiecke über der Ratsche 0/);
        pruefe("1110-12 g2B (Genesis)", bandBefunde(bandVon(probe.boots.g2B)), /^BAND-LINSE ratsche: boden haupt: 101954 dreiecke über der Ratsche 95817/);
        pruefe("1110-12 w2B mit sich selbst als Basis (alte Zeilen ohne Schlüssel)", bandBefunde(bandVon(probe.boots.w2B), bandVon(probe.boots.w2B)), /^BAND-LINSE ratsche: einzelstuecke k0/);
        // DIE SICHT gehört zum gestellten Ort (Pflicht-OFFEN E in Ego und Third-Person): eine Wache in der anderen Sicht ist rot
        pruefe(
            "Third-Person gezählt, Ego verlangt (Ort-Wache)",
            wachenUrteil("band", wache(), wache({ ort: Object.assign({}, wache().ort, { sicht: "third" }) }), ort, true),
            /ORT band \(nach\): Sicht third, verlangt ego/
        );
    }
    // DAS ENDE DER WERKBANK: eine Werkbank, deren `/stop` hängt (sie lebt weiter) und die ein Kind trägt (Chrome) — nach
    // `beendeBaum` lebt keiner der beiden mehr
    {
        const werkbank = spawn(
            process.execPath,
            [
                "-e",
                "const { spawn } = require('child_process');" +
                    "const k = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });" +
                    "console.log('KIND ' + k.pid);" +
                    "process.on('SIGTERM', () => { k.kill('SIGKILL'); process.exit(0); });" +
                    "setInterval(() => {}, 1000);",
            ],
            { stdio: ["ignore", "pipe", "ignore"] }
        );
        const kindPid = await new Promise((res) => {
            let d = "";
            werkbank.stdout.on("data", (c) => {
                d += c;
                const m = /KIND (\d+)/.exec(d);
                if (m) res(Number(m[1]));
            });
            setTimeout(() => res(null), 10000);
        });
        const ende = await beendeBaum(werkbank, 300);
        const lebt = (pid) => {
            try {
                process.kill(pid, 0);
                return true;
            } catch {
                return false;
            }
        };
        let kindLebt = kindPid ? lebt(kindPid) : true;
        for (let i = 0; i < 20 && kindLebt; i++) {
            await sleep(100);
            kindLebt = lebt(kindPid);
        }
        const v = [];
        if (!kindPid) v.push("ENDE: die Probe-Werkbank nannte ihr Kind nicht");
        if (ende !== "getoetet") v.push(`ENDE: die hängende Werkbank endete als „${ende}"`);
        if (werkbank.exitCode === null && werkbank.signalCode === null) v.push("ENDE: die Werkbank lebt");
        if (kindLebt) v.push(`ENDE: ihr Kind (PID ${kindPid}) lebt als Waise`);
        if (kindLebt)
            try {
                process.kill(kindPid, "SIGKILL");
            } catch {}
        pruefe("hängender /stop: Werkbank und Kind sterben", v, null);
    }
    // DIE WIEDERHOLBARKEIT (1110-6): vier ruhige Sitzungen liegen im Soll; eine fünfte 0,3 ms daneben fällt an IHRER Pose;
    // zwei Sitzungen sind zu wenig; eine Pose ohne Wert steht beim Namen; die Spanne der Wiese (1110-3: 0,40 ms) ist rot.
    // DER TAKT (1110-7): eine Sitzung mit denselben ms bei 1640 statt ~1700 MHz fällt an ihrer Pose mit dem Täter „Takt"; eine
    // Sitzung ohne Takt ist laut; die nvidia-smi-Zeile wird gelesen.
    const S = (je, mhz) => ({
        je,
        takt: Object.fromEntries(Object.keys(je).map((k) => [k, mhz === undefined ? 1700 : mhz])),
    });
    const ruhig = [
        S({ a: 13.5, b: 12.1 }, 1700),
        S({ a: 13.56, b: 12.14 }, 1702),
        S({ a: 13.52, b: 12.08 }, 1698),
        S({ a: 13.58, b: 12.12 }, 1701),
    ];
    pruefe(
        "Takt gedrosselt",
        streuungUrteil(ruhig.concat([S({ a: 13.54, b: 12.1 }, 1640)]), 0.1).befunde,
        /^TAKT a: Sitzung 5 bei 1640 MHz, Median 1700 MHz .*Täter: Takt/
    );
    pruefe(
        "ohne Takt",
        streuungUrteil(ruhig.slice(0, 3).concat([S({ a: 13.54, b: 12.1 }, null)]), 0.1).befunde,
        /^TAKT a: in 1 von 4 Sitzungen kein Takt/
    );
    {
        const t = taktAus(["1701, 78, 70.1, 0x0000000000000004", "1699, 79, 70.5, 0x0000000000000001", "", "[N/A], x"]);
        const v = [];
        if (
            !t ||
            t.mhz !== 1700 ||
            t.n !== 2 ||
            t.drossel["0x0000000000000004"] !== 1 ||
            t.min !== 1699 ||
            t.max !== 1701
        )
            v.push(`taktAus las ${JSON.stringify(t)}`);
        pruefe("die nvidia-smi-Zeile", v, null);
    }
    pruefe("Streuung im Soll", streuungUrteil(ruhig, 0.1).befunde, null);
    pruefe(
        "eine Sitzung 0,3 ms daneben",
        streuungUrteil(ruhig.concat([S({ a: 13.85, b: 12.1 })]), 0.1).befunde,
        /^STREUUNG a: Spanne 0\.35 ms über dem Soll 0\.1/
    );
    pruefe("zwei Sitzungen", streuungUrteil(ruhig.slice(0, 2), 0.1).befunde, /mindestens drei/);
    pruefe(
        "Pose ohne Wert",
        streuungUrteil(ruhig.concat([S({ a: 13.5 })]), 0.1).befunde,
        /STREUUNG b: in 1 von 5 Sitzungen/
    );
    pruefe(
        "die Spanne der Wiese (1110-3)",
        streuungUrteil(
            [11.42, 11.82, 11.6, 11.7].map((x) => S({ 0: x })),
            0.1
        ).befunde,
        /STREUUNG 0: Spanne 0\.40 ms/
    );
    // DAS SCHALTER-URTEIL (1310-1): Erst- gegen Dauer-Zeichnung, der Null-Schalter, Drift und Takt.
    {
    // Grund 20,30 ± 0,05; Bänder je Block [Aufwärm, 3 gemessen]; Takt 1700 MHz.
    const G = (m, erst = 0) => ({ zustand: "grund", baender: [m + erst, m - 0.03, m + 0.02, m + 0.01], takt: [1700, 1700, 1700, 1700] });
    const S = (name, m, erst = 0, takt = 1700) => ({ zustand: name, baender: [m + erst, m + 0.02, m - 0.01, m - 0.01], takt: [takt, takt, takt, takt] });
    const folge = (blocke) => blocke;
    const ruhig = folge([G(20.3), S("null", 20.31), G(20.28), S("weg", 20.31), G(20.34), S("null", 20.29), G(20.3), S("weg", 20.3), G(20.27)]);
    pruefe("Null im Rauschen, Schalter ohne Kosten", schalterUrteil(ruhig).befunde, null);
    {
        const u = schalterUrteil(ruhig);
        const z = u.zeilen.find((x) => x.schalter === "weg");
        pruefe("Schalter ohne Kosten im Rauschen", z && z.urteil === "IM RAUSCHEN" ? [] : [JSON.stringify(z)], null);
    }
    // die Erst-Zeichnung allein (+1,1 ms im Aufwärm-Band, die Dauer gleich) — der Schalter trägt NICHTS, die Erst-Zeichnung steht
    {
        const u = schalterUrteil(folge([G(20.3, 1.1), S("null", 20.31, 1.1), G(20.28, 1.1), S("stoff", 20.29, 1.1), G(20.33, 1.1), S("null", 20.3, 1.1), G(20.3, 1.1), S("stoff", 20.31, 1.1), G(20.29, 1.1)]));
        const z = u.zeilen.find((x) => x.schalter === "stoff");
        const v = [...u.befunde];
        if (!z || z.urteil !== "IM RAUSCHEN" || !(z.erst > 1)) v.push(`Erst-Zeichnung nicht getrennt: ${JSON.stringify(z)}`);
        pruefe("die Erst-Zeichnung allein trägt nicht", v, null);
    }
    // der Befund vom 12.10. ohne Aufwärm-Verwurf: der Null-Schalter selbst +1 ms in der Dauer → die Methode
    pruefe(
        "Null-Schalter teurer",
        schalterUrteil(folge([G(20.3), S("null", 21.3), G(20.28), S("null", 21.25), G(20.34), S("weg", 20.3), G(20.3), S("weg", 20.31), G(20.27)])).befunde,
        /^NULL-SCHALTER: Δ \+0?\.?9|^NULL-SCHALTER: Δ \+1\.0/
    );
    {
        const u = schalterUrteil(folge([G(20.3), S("null", 20.31), G(20.28), S("stoff", 21.3), G(20.34), S("null", 20.29), G(20.3), S("stoff", 21.32), G(20.27)]));
        const z = u.zeilen.find((x) => x.schalter === "stoff");
        pruefe("der Schalter trägt +1 ms", z && z.urteil === "TRÄGT" && Math.abs(z.delta - 1.01) < 0.05 ? [] : [JSON.stringify(z)], null);
    }
    pruefe("ohne Null-Schalter", schalterUrteil(folge([G(20.3), S("weg", 20.3), G(20.3), S("weg", 20.3), G(20.3)])).befunde, /kein Null-Schalter/);
    {
        // ein Block bei 1640 MHz fällt beim Namen; zwei Null-Blöcke bleiben → das Urteil steht
        const u = schalterUrteil(folge([G(20.3), S("null", 20.31), G(20.28), S("null", 20.3, 0, 1640), G(20.3), S("null", 20.3), G(20.31)]));
        pruefe("Takt gedrosselt: der Block fällt beim Namen", u.verworfen, /^TAKT: Block 4 \(null\) bei 1640 MHz, Grund-Nachbarn 1700 MHz.*Täter: Takt/);
        pruefe("Takt gedrosselt: zwei Blöcke tragen das Urteil", u.befunde, null);
    }
    pruefe(
        "Takt gedrosselt, zu wenige Blöcke",
        schalterUrteil(folge([G(20.3), S("null", 20.31), G(20.28), S("null", 20.3, 0, 1640), G(20.3), S("weg", 20.3), G(20.31), S("weg", 20.3), G(20.3)])).befunde,
        /^SCHALTER null: 1 Blöcke/
    );
    // Drift über die Sitzung: Grund und Takt fallen linear (20,6 → 20,0 ms, 1800 → 1760 MHz) — die Nachbarn tragen ihn
    {
        const D = (i, name) => {
            const m = 20.6 - 0.075 * i + (i % 3 === 0 ? 0.02 : -0.01);
            const t = 1800 - 5 * i;
            return { zustand: name, baender: [m, m - 0.02, m + 0.01, m + 0.01], takt: [t, t, t, t] };
        };
        const z = ["grund", "null", "grund", "weg", "grund", "null", "grund", "weg", "grund"].map((n, i) => D(i, n));
        pruefe("Drift über die Sitzung", schalterUrteil(z).befunde, null);
    }
    pruefe(
        "ohne Takt",
        schalterUrteil(folge([G(20.3), S("null", 20.31), G(20.28), Object.assign(S("null", 20.3), { takt: [] }), G(20.3)])).befunde,
        /^TAKT: nicht jedes Band/
    );
    pruefe(
        "ohne Aufwärm-Band",
        schalterUrteil(folge([G(20.3), { zustand: "null", baender: [20.3, 20.3, 20.3], takt: [1700, 1700, 1700] }, G(20.3), S("null", 20.3), G(20.3)])).befunde,
        /Block 2 \(null\): 2 Dauer-Bänder/
    );
    pruefe(
        "Schalter am Rand",
        schalterUrteil(folge([G(20.3), S("null", 20.3), G(20.3), S("null", 20.3), G(20.3), S("null", 20.3)])).befunde,
        /Block 6 ohne Grund-Block davor UND danach/
    );
    }
    // DER NEULAUF und der Ort vor dem Boot: ein nicht eingeschwungener Lauf fährt neu, ein Abbruch nie; der letzte
    // Versuch nennt sich ROT; ein schwebender Dorf-Plan ist ein Befund; die Werkbank startet mit dem Ort, und jeder Messort
    // sagt, ob sein Dorf-Zug läuft (die Werkbank sperrt ihn danach vor dem ersten Skript).
    const offen = { eingeschwungen: false, takte: 4213, offen: { dorfWaechst: "0/18" } };
    const r1 = { code: 1, einschwung: offen };
    pruefe(
        "Neulauf",
        [
            !neulaufNoetig(r1) && "ein nicht eingeschwungener Lauf fährt nicht neu",
            neulaufNoetig({ code: 2, einschwung: offen }) && "ein Abbruch fährt neu",
            neulaufNoetig({ code: 0, einschwung: { eingeschwungen: true } }) && "ein eingeschwungener Lauf fährt neu",
            neulaufNoetig({ code: 1, einschwung: null }) && "ein Lauf ohne Band fährt neu",
        ].filter(Boolean),
        null
    );
    pruefe("letzter Versuch nicht eingeschwungen", [einschwingBefund(offen, 3, true)].filter(Boolean), /EINSCHWINGEN: 3 Läufe.*dorfWaechst/);
    pruefe("Zwischen-Versuch ohne Befund", [einschwingBefund(offen, 1, false)].filter(Boolean), null);
    pruefe("Dorf-Plan schwebt", [dorfBefund({ dorfSchwebt: "Plan 0/18 (Zelle start)" })].filter(Boolean), /DORF: vor dem Ort.*0\/18/);
    pruefe("Dorf ruht", [dorfBefund({ dorfSchwebt: null })].filter(Boolean), null);
    const sa = startArgs(4490, "http://localhost:4312", "genesis", "s1");
    pruefe(
        "Start mit dem Ort",
        [sa[sa.indexOf("--ort") + 1] !== "genesis" && `start ohne --ort genesis: ${sa.slice(1).join(" ")}`].filter(Boolean),
        null
    );
    const orte = BAND.ladeSpec(ORT).haushalt.messorte || [];
    pruefe(
        "Dorf-Zug je Messort",
        orte.filter((o) => typeof o.dorfZug !== "boolean").map((o) => `${o.id}: dorfZug ${o.dorfZug}`),
        null
    );
    selbsttestEnde(fehler, "die Folge-Regel und jede Wache nennen ihren Täter.");
    process.exit(0);
}

// DAS STREUUNGS-URTEIL über N Läufe desselben Orts (1110-6, die Linse der Wiederholbarkeit): je Pose bzw. Blick die Werte,
// Mittel, Spanne und σ; ROT, wenn eine Spanne über dem Soll liegt (Toggle-Ort: `bank.soll`, sonst `--soll`).
function streuungCli() {
    const dateien = argv.slice(argv.indexOf("--streuung") + 1).filter((a) => !a.startsWith("--") && /\.json$/.test(a));
    const laeufe = dateien.map((d) => ({ name: path.basename(d), lauf: ausDatei(d, true) }));
    const orte = [...new Set(laeufe.map((l) => l.lauf.parameter && l.lauf.parameter.ort))];
    if (orte.length !== 1) {
        console.log(
            `❌ STREUUNG: die Läufe stehen an ${orte.join(", ") || "keinem Ort"} — ein Urteil braucht EINEN Ort`
        );
        process.exit(1);
    }
    const { ort } = BAND.ladeSpec(orte[0]);
    const soll = Number(opt("--soll", ort.bank ? ort.bank.soll : NaN));
    const u = streuungUrteil(
        laeufe.map((l) => Object.assign({ name: l.name }, bankJe(l.lauf))),
        soll
    );
    console.log(
        `\n=== DIE WIEDERHOLBARKEIT am Ort ${ort.id}: ${laeufe.length} Sitzungen, Soll Spanne ≤ ${soll} ms ===`
    );
    for (const z of u.zeilen)
        console.log(
            `  ${z.k}: ${z.werte.map((x) => x.toFixed(2)).join(" · ")} ms bei ${z.takt.map((x) => (x ? x.toFixed(0) : "?")).join(" · ")} MHz → Mittel ${z.mittel}, Spanne ${z.spanne}, σ ${z.sigma} ` +
                `(2σ ${(2 * z.sigma).toFixed(3)})`
        );
    if (u.befunde.length) {
        for (const b of u.befunde) console.log("  ROT " + b);
        console.log(`\n❌ STREUUNG ROT — der Ort ${ort.id} ist für Toggle-Urteile unter ${soll} ms blind.`);
        process.exit(1);
    }
    console.log(`\n✅ STREUUNG GRÜN — der Ort ${ort.id} richtet Toggle-Urteile ab ${soll} ms.`);
    process.exit(0);
}

// DAS SCHALTER-URTEIL einer Sitzung (1310-1): `bloecke.json` = { bloecke: [{ zustand, baender, takt }] } in Zeitfolge
// (je Block das erste Band nach dem Eingriff verworfen) — je Schalter Δ gegen die Grund-Nachbarn, Rauschband, Erst-Zeichnung;
// ROT, wenn der Null-Schalter außerhalb des Rauschbands liegt (die Methode misst den Eingriff mit), Takt oder Bänder fehlen.
function schalterCli() {
    const datei = argv[argv.indexOf("--schalter") + 1];
    const { bloecke } = ausDatei(datei, true);
    const u = schalterUrteil(bloecke.filter(Boolean));
    console.log(`\n=== DAS SCHALTER-URTEIL: ${bloecke.length} Blöcke, Grund σ ${u.sigma} ms, Erst-Zeichnung der Grund-Blöcke ${u.erstGrund} ms ===`);
    for (const z of u.zeilen)
        console.log(
            `  ${z.schalter}: Δ ${z.delta >= 0 ? "+" : ""}${z.delta.toFixed(3)} ms (je Block ${z.je.join(" · ")}) · Rauschband ±${z.rauschband} · ` +
                `Erst-Zeichnung ${z.erst} ms → ${z.urteil}`
        );
    for (const b of u.verworfen) console.log("  VERWORFEN " + b);
    if (u.takt) console.log(`  Takt über die Sitzung ${u.takt.erst} → ${u.takt.letzt} MHz`);
    if (u.befunde.length) {
        for (const b of u.befunde) console.log("  ROT " + b);
        console.log("\n❌ SCHALTER ROT — das Urteil ist blind oder die Methode misst den Eingriff mit.");
        process.exit(1);
    }
    console.log("\n✅ SCHALTER GRÜN — der Null-Schalter liegt im Rauschen, jeder Schalter steht mit Δ und Erst-Zeichnung.");
    process.exit(0);
}

// DER LESER OHNE GPU (K26, `--urteil <boot.json> [--basis <A.json>]`): ein gespeicherter Boot der Folge, neu gelesen — die
// Befunde seiner Wachen und die Band-Linse (jede Rot-Zeile, die die Basis-Seite A nicht trägt). Exit 1, sobald einer steht.
function urteilCli() {
    const lies = (d) => ausDatei(path.resolve(d), true);
    const j = lies(argv[argv.indexOf("--urteil") + 1]);
    const bd = opt("--basis", null);
    const basis = bd ? bandMessungAus(lies(bd)) : null;
    const wachen = (j.befunde || []).filter((b) => !/^(BAND|BAND-LINSE|BASIS|ORT band|RAHMEN-ZIEL band)\b/.test(b));
    const band = (j.folge || []).includes("band") || bandMessungAus(j) ? bandBefunde(bandMessungAus(j), basis) : [];
    const p = j.parameter || {};
    console.log(
        `=== DER LESER: ${p.ort || "?"} · Sicht ${p.sicht || "?"} · ${(j.stand && j.stand.version) || "?"}${bd ? " gegen die Basis " + bd : ""} ===`
    );
    for (const b of [...wachen, ...band]) console.log("  ROT " + b);
    const n = wachen.length + band.length;
    console.log(n ? `\n❌ LESER ROT — ${n} Befunde (gespeichert: ${j.urteil})` : `\n✅ LESER GRÜN (gespeichert: ${j.urteil})`);
    process.exit(n ? 1 : 0);
}

if (require.main === module) {
    if (argv.includes("--selbsttest"))
        hauptLauf(selbsttest);
    else if (argv.includes("--streuung")) streuungCli();
    else if (argv.includes("--schalter")) schalterCli();
    else if (argv.includes("--urteil")) urteilCli();
    else
        hauptLauf(folgeMitNeulauf);
}
