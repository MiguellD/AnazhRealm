// Stationen der Gruppe II (src/g2.js). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst: jedes Kriterium mit Punkten am Kopf (tiere.K1 · tiere.K3 · oekologie.K5 · mensch.K2 · mensch.K3) und jedes der
// Messschuld M30–M43 (M40 mensch.K1 · M41 vegetation.K4 · M42 tiere.K3); kein Stau-Zweig kippt ein Kriterium der Gruppe II.
// Was sich nicht als Station fassen lässt, steht in `fehlt` (befehl: null, grund beim Namen) — die Liste der Stationen
// bleibt dadurch lauffähig (pruefeStationen verlangt je Eintrag ein argv).
"use strict";
const { jsonZeile } = require("../hilfe.cjs");

// die Zeile „  ✅|❌ <probe> {…}" der Kreatur-Linse (diag-kreatur-takt.cjs, padEnd 9)
const probeZeile = (stdout, probe) => jsonZeile(stdout, new RegExp("^\\s*(✅|❌) " + probe + "\\s"));

// R6 der Tier-Gesetze (Zweig tier-gesetz-k5): Kern, Kreatur-Stamm, Leben-Feld, Leib und die Kreatur-Linse
const KREATUR = [
    "tetrapoda-core.js",
    "stamm/kreatur-*.js",
    "stamm/feld-leben.js",
    "stamm/daten.js",
    "stamm/koerper-leib.js",
    "scripts/diag-kreatur-takt.cjs",
    "scripts/diag-kreatur-leben.cjs",
    "scripts/lib/kreatur-proben.cjs",
    "scripts/lib/welt-boot.cjs",
];

const stationen = [
    {
        kriterium: "mensch.K3",
        staffel: 1,
        geraet: "headless",
        // die Wege der Bewohner im Start-Dorf am echten Kreatur-Takt (Kontakt-Mechanik, Null-Renderer, R3; Präzedenz Siedlung K1)
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) bewohner\s/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const w = z.wege || {};
            const gruen = w.wandN === 0 && w.durch > 0 && w.tuer === w.durch && z.huellen === z.haeuser && z.haeuser > 0;
            return {
                gruen,
                zahl:
                    "Durchdringung " + w.wandN + ", Tür " + w.tuer + "/" + w.durch + ", Hüllen " + z.huellen + "/" +
                    z.haeuser + ", Gangzeit auf Wegen " + w.aufWeg,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf",
    },
    {
        kriterium: "mensch.K2",
        staffel: 1,
        geraet: "headless",
        // der Tag der Bewohner im Zeitraffer der Spieler-Uhr (`_uhrSetzen`, 24 Spielstunden) am echten Bewohner-Takt — die
        // Tagesablauf-Mechanik (R3), gemessen wie M32 headless (bericht/2210-messschuld-6cfce.md § M32 K2). Strenger als die
        // Staffel: jeder Bewohner ≥ 0,9 (trefferMin, das Soll der Linse); das Schlupfloch Teleport fällt an sprungN, der
        // Plan muss bei gleichem Samen bit-gleich sein.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const gruen =
                z.plan === true &&
                z.planGleich === true &&
                z.bewohner > 0 &&
                typeof z.trefferMin === "number" &&
                z.trefferMin >= 0.9 &&
                z.sprungN === 0;
            return {
                gruen,
                zahl:
                    "Soll-Orte über 24 Spielstunden min " + z.trefferMin + " (" + (z.bewohner - z.unterN) + "/" +
                    z.bewohner + " ≥ 0,9), Plan bit-gleich " + z.planGleich + ", Schmiede 10/2 Uhr " + z.schmiede10 +
                    "/" + z.schmiede2 + ", Sprünge " + z.sprungN,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ein Bewohner trifft ≥ 0,9 seiner Soll-Orte über 24 Spielstunden",
    },
    {
        kriterium: "tiere.K1",
        staffel: 1,
        geraet: "headless",
        // (a) Kohäsion des Verbands am ECHTEN Wurf (`_kreaturWurf`, scheue Hirsche) wandernd und fliehend — Verband ist Mechanik
        // (R3: der Null-Renderer beweist Gesetz, Kontakt, Verband); die Probe herde der Kreatur-Linse (Q11), wie S6 (475a446a)
        // „bei jedem Push". Soll aus `messung`: wandernd ≥ 0,9, auf der Flucht ≥ 0,8; das Schlupfloch (klebende Glieder,
        // vakuöse Probe) fällt an Gliedern ≥ 3, Fluchtanteil ≥ 0,1, wandernd 0 Flucht.
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "herde"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "herde");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe herde (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const V = z.verband || {};
            const W = V.wander || {};
            const F = V.flucht || {};
            const echt = Math.min(W.n, F.n) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0;
            const gruen = echt && W.mittel >= 0.9 && F.fluchtMittel !== null && F.fluchtMittel >= 0.8;
            return {
                gruen,
                zahl:
                    "Kohäsion wandernd " + W.mittel + " (" + W.n + " Glieder), fliehend " + F.fluchtMittel + " (min " +
                    F.fluchtMin + ", in Flucht " + F.fluchtAnteil + "), fremder Verband " + z.artFremdZugM + " m",
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "gelaende-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = (a) Kohäsion an einem Gerät",
    },
    {
        kriterium: "tiere.K3",
        staffel: 1,
        geraet: "headless",
        // der Stand-Fuß gleitet nicht — Kontakt-Mechanik (R3), wie der Beleg die 1 frisch hält: gate:tier-gang (jede Gattung bei
        // v̂ 0,3 · 0,74 · 1,2 · 3,5, auch unter Last) UND die Probe tiersatz der Kreatur-Linse (die Satz-Tiere jenseits
        // `nahLeiber`, `_tierSatzGang`). Gerichtet wird nur der Schlupf der Tiere (Staffel 1), nicht Mensch, Becken, Labor.
        befehl: [
            "bash",
            "-c",
            "node scripts/diag-tier-gang.cjs; echo \"TIER-GANG EXIT=$?\"; " +
                "KREATUR_TAKT_PORT=$(( {PORT} + 20000 )) node scripts/diag-kreatur-takt.cjs --proben tiersatz; " +
                "echo \"TIERSATZ EXIT=$?\"",
        ],
        env: { TIER_GANG_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const re = /^\s*(✅|❌) (\S+)\s+v̂ (\S+) (\S+) m\/s(?: \((.*)\))? · Hüfte \S+ m · Stand \S+ · Schlupf (\S+)\s*$/;
            const tiere = String(lauf.stdout || "")
                .split(/\r?\n/)
                .map((l) => re.exec(l))
                .filter(Boolean)
                .map((m) => ({ seele: m[2], vh: m[3], last: m[5] || null, schlupf: m[6] === "null" ? null : Number(m[6]) }));
            const gattungen = new Set(tiere.map((t) => t.seele));
            const gleiten = tiere.filter((t) => !(t.schlupf !== null && t.schlupf <= 0.05));
            const s = probeZeile(lauf.stdout, "tiersatz");
            const satzOk = !!s && !s.fehler && s.satzTiere >= 10 && s.wegLeib >= 20 && s.schlupf !== null && s.schlupf <= 0.05;
            const max = tiere.reduce((m, t) => (t.schlupf === null ? m : Math.max(m, t.schlupf)), 0);
            const gruen = tiere.length >= 16 && gattungen.size >= 4 && gleiten.length === 0 && satzOk;
            return {
                gruen,
                zahl:
                    "Schlupf des Stand-Fußes max " + max + " in " + tiere.length + " Läufen (" + gattungen.size +
                    " Gattungen" + (gleiten.length ? ", über 0,05: " + gleiten.map((t) => t.seele + " v̂ " + t.vh).join(" · ") : "") +
                    "), Satz-Tiere " + (s ? (s.fehler ? "Fehler " + s.fehler : s.schlupf + " über " + s.wegLeib + " m von " + s.satzTiere) : "ohne Zeile"),
            };
        },
        pfad: [
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "tetrapoda-core.js",
            "koerper-core.js",
            "gelaende-core.js",
            "scripts/diag-tier-gang.cjs",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = der Fuß steht (Schlupf ≤ 0,05)",
    },
    {
        kriterium: "mensch.K1",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M40 = M32 wiederholt (bericht/2210-messschuld-6cfce.md § M32, skripte/sitzung.sh + m32b-schritte.txt): EINE echte
        // Werkbank-Sitzung `--echt` gegen einen eigenen save-server, darin `diag-kreatur-takt --werkbank --proben bewohner`
        // (Quote, gegangene Menschen im Blick) und `platz-8.js` als `werkbank eval` (Third am Rand des Dorfplatzes, Uhr 8 als
        // Spieler-Wort, Loop 12 s, gezählt im Frustum der Spiel-Kamera, gezeichnet, Sichtlinie frei) mit dem Bild aus dem
        // Ausgabe-Pfad (`b64png.cjs` → <aus>-platz-8uhr-third.png). Ports: save-server {PORT}, Werkbank {PORT}+20000 (Seite −1).
        // platz-8.js und b64png.cjs leben im Koord-Baum (R6 sieht sie nicht; ihr Text steht hier per Pfad im Abdruck).
        befehl: [
            "bash",
            "-c",
            [
                "A=$(printf %s '{AUS}' | tr '\\\\' /); B=\"${A%.json}\"; SK=\"$(printf %s '{KOORD}' | tr '\\\\' /)/bericht/2210-messschuld-6cfce/skripte\"",
                "S=$(( {PORT} )); W=$(( {PORT} + 20000 )); export WERKBANK_PORT=$W",
                "raeum() { for p in $(netstat -ano | grep -E \":($S|$W|$((W - 1))) .*(LISTEN|ABH)\" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done; }",
                "stand() { mkdir -p \"$B-stand\"; mv anazhRealmState.json anazhRealmState.json.bak anazhRealmPerf.json \"$B-stand/\" 2> /dev/null; }",
                "ende() { node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 2; raeum; stand; }",
                "trap ende EXIT; trap 'exit 143' INT TERM",
                "raeum; stand",
                "(PORT=$S node save-server.js > \"$B-save.log\" 2>&1 &)",
                "for t in $(seq 1 30); do curl -s -o /dev/null -w '%{http_code}' http://localhost:$S/ 2> /dev/null | grep -q 200 && break; sleep 1; done",
                "(node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:$S > \"$B-werkbank.log\" 2>&1 &)",
                "for t in $(seq 1 120); do grep -qE 'WERKBANK bereit|WERKBANK-FEHLER' \"$B-werkbank.log\" 2> /dev/null && break; sleep 5; done",
                "grep -E 'WERKBANK bereit' \"$B-werkbank.log\" || { echo 'WERKBANK startet nicht'; tail -5 \"$B-werkbank.log\"; exit 1; }",
                "node scripts/diag-kreatur-takt.cjs --werkbank $W --proben bewohner",
                "node scripts/werkbank.cjs eval \"$(cat \"$SK/platz-8.js\")\" > \"$B-platz.txt\"",
                "node \"$SK/b64png.cjs\" \"$B-platz.txt\" \"$B-platz-8uhr-third.png\"",
            ].join("\n"),
        ],
        gpu: true,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "bewohner");
            const p = jsonZeile(lauf.stdout, /^\{"uhr":/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner im Fenster (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            if (!p) return { gruen: false, zahl: "kein Platz-Bild um 8 Uhr (platz-8.js / b64png, Exit " + lauf.exit + ")" };
            if (p.fehler) return { gruen: false, zahl: "Platz-Bild: " + p.fehler };
            const ib = z.imBlick || {};
            const gruen =
                z.leiber > 0 &&
                typeof z.quote === "number" &&
                Math.abs(z.quote - 1) <= 0.05 &&
                z.leerN === 0 &&
                ib.ego >= 10 &&
                ib.third >= 10 &&
                p.imBild >= 10 &&
                p.sicht === "third";
            return {
                gruen,
                zahl:
                    "Quote " + z.leiber + "/" + z.sollSumme + " = " + z.quote + ", Häuser ohne Bewohner " + z.leerN +
                    ", gegangene im Blick " + ib.ego + " Ego / " + ib.third + " Third; Third-Bild 8 Uhr am Dorfplatz " +
                    p.imBild + " Menschen im Bild, " + p.gehendImBild + " gehend, " + p.fps + " fps",
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/stoff-instanz.js",
            "stamm/studio-bruecke.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "save-server.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/werkbank.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Start-Dorf voll: Körper mit Menschen-Leib je Siedlung ÷ Σ leute = 1,0 ±0,05, ≥ 10 Menschen im Bild am Dorfplatz an einem Gerät",
    },
    {
        kriterium: "vegetation.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        // M41 = M24 wiederholt (bericht/2110-messschuld-radeon/m24-grund-bild.*): W9 aus dem Ausgabe-Bild, echter Renderer —
        // das Start-Dorf (erwacht in Raten) und das gesetzte Haus des Spielers, je Box des Körper-Satzes Halm- und Boden-Pixel,
        // das Büschel am Gesetz, die Gegenprobe vor der Tür. Gerichtet werden die Häuser des Start-Dorfs (Staffel 1); die
        // Phasen Waise/Ausstattung sind im Bild-Lauf blind und machen den Exit 1 (so auch M24) — das Urteil liest das JSON.
        // Eine Box ohne freies Auge (M24: haus_skandinavisch, haupt) steht beim Namen in der Zahl als ungemessen, nie als ROT
        // (wie M24: 26/27 gesehen, die blinde Box offen benannt); gesehen sein müssen ≥ 90 %. Halm- UND Boden-Pixel zählen wie
        // in M24 und im W9 der Linse: der Boden-Pixel ist der Grund IN der Box (grün = die Halm-Schicht des Boden-Stoffs; trägt
        // die Box eine Diele, jeder Grund durch sie) — 23.10. an 7c6f4b49 der Turm des haus_gotisch, Bild grund-41-0-turm-*.png.
        // Jede Box heißt beim Namen wie das Bild der Linse: Haus-Index/Box-Index (artifacts/haus-welt/grund-<i>-<j>-<art>-<v>.png).
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=grund", "--bild"],
        env: { HAUS_WELT_PORT: "{PORT}", HAUS_WELT_PARALLEL: "1", HAUS_WELT_JSON: "{AUS}" },
        gpu: true,
        minuten: 6,
        urteil: (j) => {
            const w = j && j.w9;
            if (!w || !Array.isArray(w.haeuser)) return { gruen: false, zahl: "kein W9 im JSON der Linse (HAUS_WELT_JSON)" };
            if (!w.bild) return { gruen: false, zahl: "W9 ohne Bild (der Lauf fuhr nicht --bild)" };
            const dorf = w.haeuser.filter((h) => !h.spieler);
            const boxen = dorf.flatMap((h) => (h.koerper || []).map((b, jb) => ({ ...b, typ: h.typ, wo: w.haeuser.indexOf(h) + "-" + jb })));
            const name = (b) => b.typ + " " + b.wo + " " + b.art;
            const gesehen = boxen.filter((b) => b.blicke > 0);
            const blind = boxen.filter((b) => !(b.blicke > 0));
            const halm = gesehen.filter((b) => b.halm > 0 || b.boden > 0);
            const bueschel = boxen.filter((b) => b.bueschel > 0);
            const gegen = Math.max(0, ...w.haeuser.map((h) => h.gegenprobe || 0));
            const gruen =
                dorf.length >= 10 &&
                gesehen.length >= Math.ceil(0.9 * boxen.length) &&
                halm.length === 0 &&
                bueschel.length === 0 &&
                gegen > 0;
            const sum = (f) => gesehen.reduce((a, b) => a + (b[f] || 0), 0);
            return {
                gruen,
                zahl:
                    dorf.length + " Häuser des Start-Dorfs, " + gesehen.length + "/" + boxen.length + " Boxen im Bild: Halm " +
                    sum("halm") + " px, Boden " + sum("boden") + " px, Büschel am Gesetz " + bueschel.length +
                    " Boxen; Gegenprobe " + gegen + " px" +
                    (halm.length ? "; Halm/Boden in " + halm.map((b) => name(b) + " " + (b.halm || 0) + "/" + (b.boden || 0) + " px").join(" · ") : "") +
                    (bueschel.length ? "; Büschel in " + bueschel.map((b) => name(b) + " " + b.bueschel).join(" · ") : "") +
                    (blind.length ? "; ungemessen (ohne freies Auge) " + blind.map(name).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/vegetation-*.js",
            "stamm/siedlung-*.js",
            "stamm/gelaende-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/daten.js",
            "fachwerk-core.js",
            "foundry-bruecke.js",
            "phyto-core.js",
            "gelaende-core.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = Halm- und Büschel-Pixel 0 in jeder Haus-Box des Start-Dorfs an einem Gerät",
    },

    // ───────── oekologie.K3 — EIN Furcht-Gesetz (Zweig tier-gesetz-k5, tetrapoda FURCHT_GESETZ) ─────────
    // Probe furcht der Kreatur-Linse (Null-Renderer, R3: sie misst ein Gesetz): je Rolle 4 Orte, das Tier reist über
    // `_serializeCreature` → `_restoreCreatureFromSnapshot` (Speichern), dann geht der Spieler auf es zu; Schlag und Gabe über
    // die Chokepoints damageCreature (source player) und activateCreatureConsumable. Staffel 2 dazu (z.ort): ein Riss in der
    // Zelle der Herde gegen den Gegenlauf mit Feld-Furcht 0. An main fehlt die Probe (ROT „keine Zeile").
    ...[1, 2].map((staffel) => ({
        kriterium: "oekologie.K3",
        staffel,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "furcht"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "furcht");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe furcht (Exit " + lauf.exit + ")" };
            if (z.fehler || !z.erinnert || !z.ort) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne erinnert/ort") };
            const { kontrolle: K, geschlagen: G, gefuettert: F } = z.erinnert;
            const O = z.ort;
            const wesen =
                [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1) &&
                K.medianM >= 5 &&
                G.medianM >= 2 * K.medianM &&
                F.medianM <= 0.5 * K.medianM &&
                F.naeherM >= 2;
            const ort = O.gegenlauf >= 0.2 && O.aufenthalt <= 0.5 * O.gegenlauf;
            return {
                gruen: wesen && (staffel === 1 || ort),
                zahl:
                    "geschlagen " + G.medianM + " m gegen Kontrolle " + K.medianM + " m · gefüttert " + F.medianM + " m, selbst " +
                    F.naeherM + " m näher · Gedächtnis nach dem Laden " + G.erinnerungen + " / " + F.erinnerungen +
                    " · Riss-Zelle Aufenthalt " + O.aufenthalt + " gegen Gegenlauf " + O.gegenlauf,
            };
        },
        pfad: [...KREATUR],
        quelle:
            staffel === 1
                ? "1 = ein Wesen, das der Spieler schlug, hält bei der nächsten Begegnung Abstand (Median ≥ 2× ein Kontroll-Wesen), ein gefüttertes nähert sich, ohne Modell, über Speichern"
                : "2 = dazu deponiert ein Riss Furcht am Ort, und die Herde meidet die Zelle (Aufenthalt −50 % gegen den Gegenlauf)",
    })),

    // ───────── tiere.K2 — der Jagd-Kreislauf (Zweig tier-gesetz-k5, tetrapoda JAGD_GESETZ) ─────────
    // Probe jagdkreis (A) je Jagd: die Beute trägt die HP aus dem Leib-Gesetz (Hirsch 168, Kitz 60), drei Szenen — 1 Wolf und
    // 4 Wölfe gegen den gesunden Hirsch, das Rudel gegen das Kitz — mit dem Band nach MacNulty (Schlupfloch hp 1e6 / HP 1:
    // das Band hat ein Oben und ein Unten, hp0 ≥ 100 verlangt den Leib). An main zählt die Probe Riss je Ort (ROT „ohne quote").
    {
        kriterium: "tiere.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "jagdkreis"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "jagdkreis");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe jagdkreis (Exit " + lauf.exit + ")" };
            const Q = z.riss && z.riss.quote;
            if (z.fehler || !Q) return { gruen: false, zahl: "Probe-Fehler: " + (z.fehler || "ohne riss.quote") };
            const band = { einWolf: [0, 0.1], rudel: [0.2, 0.4], kitz: [0.6, 1] };
            const je = Object.entries(band).map(([sz, [lo, hi]]) => {
                const q = Q[sz] || {};
                const v = q.jagden ? q.risse / q.jagden : null;
                return { sz, ok: q.jagden >= 10 && v != null && v >= lo && v <= hi, t: sz + " " + q.risse + "/" + q.jagden + " (HP " + q.hp0 + ")" };
            });
            const hp = Q.rudel && Q.rudel.hp0 >= 100;
            return {
                gruen: je.every((x) => x.ok) && hp && z.riss.rissS != null,
                zahl: "Riss je Jagd " + je.map((x) => (x.ok ? "" : "✗ ") + x.t).join(" · ") + " · erster Riss " + z.riss.rissS + " s",
            };
        },
        pfad: [...KREATUR],
        quelle: "1 = Hetze und Riss mit HP aus dem Leib-Gesetz, Quote im Band über ≥ 10 Seeds",
    },

    // ───────── tiere.K4 — Lebensraum (Zweig tier-gesetz-k5, tetrapoda LEBENSRAUM_GESETZ) ─────────
    // Probe lebensraum: neun Orte (Raster 300 m) je 25 natürliche Geburten, je Tier die Boden-Klasse am Ort gegen die Gattung;
    // die Gegenprobe in einer importierten Welt anderer Saat (lebensraum-gegen). Schlupfloch Hand-Setzen: Saat-Wechsel. An
    // main fehlt die Probe (ROT „keine Zeile").
    {
        kriterium: "tiere.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "lebensraum"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 5,
        urteil: (j, lauf) => {
            const z = probeZeile(lauf.stdout, "lebensraum");
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe lebensraum (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const g = z.gegen || {};
            const gruen =
                z.n >= 150 && Object.keys(z.gattung || {}).length >= 3 && z.anteil >= 0.9 &&
                !g.fehler && g.n >= 150 && g.anteil >= 0.9 && !!g.saat && g.saat !== z.saat;
            return {
                gruen,
                zahl:
                    "im Lebensraum " + z.drin + "/" + z.n + " = " + z.anteil + " (Saat " + z.saat + ", " + JSON.stringify(z.gattung) + ") · Gegenprobe " +
                    (g.fehler ? g.fehler : g.drin + "/" + g.n + " = " + g.anteil + " (Saat " + g.saat + ")"),
            };
        },
        pfad: [
            ...KREATUR,
            "gelaende-core.js",
            "phyto-core.js",
            "stamm/gelaende-boden.js",
            "stamm/vegetation-wiese.js",
            "stamm/wasser-hydro.js",
            "spec/pruefbuehne/welt.json",
        ],
        quelle: "1 = ≥ 0,9 der Geburten in der Boden-Klasse der Gattung, mit Gegenprobe bei anderem Seed",
    },
];

// Nicht als Station fassbar (heute): je Kriterium und Staffel der Grund beim Namen. Sie tragen keine Punkte der Maschine;
// was hier steht, bucht weiter die Hand oder bleibt 0, bis das Werkzeug steht.
const fehlt = [
    {
        kriterium: "oekologie.K5",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt im Spiel-Baum: M19 lief als Scratch `bericht/2110-messschuld-radeon-2/skripte/m14-spielgang.cjs` " +
            "(NUR_TIER) + `m19-weg.cjs`, beide hart auf den gelöschten Baum `mess-2110b` (WT) und einen eigenen save-server " +
            "(SPIEL_URL :7960) gebunden, 10 min Spielgang über R5; keine Probe der Kreatur-Linse misst das Folgen ≥ 10 min " +
            "über Hindernisse (follow_player nur in Kurz-Proben)",
        quelle: "1 = ein gebundenes Tier folgt ≥ 10 min über Hindernisse",
    },
    {
        kriterium: "oekologie.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: kein Gegenlauf bond = 0 (Ansteckung `_tickEmotionContagion` gegen die Stimmung des Spielers) " +
            "und kein Reload der Bindung in einer Linse; GTX ungemessen",
        quelle:
            "2 = die Ansteckung verschiebt die Stimmung des Spielers messbar gegen einen Gegenlauf mit bond = 0, und die Bindung übersteht den Reload",
    },
    {
        kriterium: "tiere.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: die Probe herde misst nur (a) Kohäsion — Ausrichtung Φ (b), Alarm-Kette ≤ 1,0 s (c) und " +
            "Verbands-ID 600 s (d) misst keine Linse, die Bild-Serie „Herde am Hang“ hat keine Station",
        quelle: "2 = (a)–(d) auf beiden Geräten mit der Bild-Serie „Herde am Hang“",
    },
    {
        kriterium: "tiere.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt (M42): `scripts/diag-tier-gang.cjs` kennt `_satz` nicht — die Gang-Bühne mit 4 Tieren misst nur " +
            "Leiber, der Tastgrad der Satz-Tiere (`_tierSatzGang`, jenseits `nahLeiber` 4) und Labor = Welt über die Phasen " +
            "sind ungemessen (R10); das Third-Bild aus 10 m auf eine Herde > 4 hat keine Station",
        quelle:
            "2 = Fußfolge aus Fr für alle 4 Gattungen, Tastgrad im Band, Querhang 20°, Labor = Welt über die Phasen, Third-Bild aus 10 m",
    },
    {
        kriterium: "mensch.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug und Welt fehlen: keine Stadt ≥ 200 Bewohner mit ≥ 40 nah animiert in einer Linse (die Probe bewohner " +
            "kennt nur das Start-Dorf), das ABAB an der GTX ist ein Lauf des Richter-Zugs, keine Station",
        quelle: "2 = Stadt ≥ 200 mit ≥ 40 nah animiert, ABAB an der GTX nicht schlechter",
    },
    {
        kriterium: "mensch.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: die Wiederkehr nach 1 h Abwesenheit auf ±2 m misst keine Linse; dazu ist „alle Bewohner“ im " +
            "Fenster der Radeon ROT benannt (trefferMin 0,825, M32)",
        quelle: "2 = alle Bewohner einer Siedlung, 4–10 Wege am Tag, Wiederkehr nach 1 h Abwesenheit auf ±2 m",
    },
    {
        kriterium: "mensch.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug und Welt fehlen: keine Stadt (nH ≥ 27) in der Probe bewohner, kein 24-h-Lauf auf Steckenbleiber, " +
            "kein Ausweichen ohne Berührung; ≥ 100 m je Bewohner ist am Start-Dorf min 46 m",
        quelle:
            "2 = 24 h ohne Steckenbleiber in einer Stadt, Gangzeit auf Wegen ≥ 0,85, ≥ 100 m Weg je Bewohner und Tag, Ausweichen ohne Berührung",
    },
    {
        kriterium: "vegetation.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: kein Bild zählt Halme unter dem Wasser-Spiegel (diag-haus-welt --bild kennt nur Haus-Boxen), " +
            "Third vor dem Haus ungemessen; die Häuser-Hälfte ist die Station vegetation.K4#1 auf beiden Geräten",
        quelle: "2 = jedes Haus und jedes Wasser, auch gesetzte Bauten, beide Geräte",
    },
    {
        kriterium: "tiere.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Werkzeug fehlt: die Station Wolfsrevier im Bild beider Geräte gibt es nicht; Fressen (z.riss.fressS) und Fuchs/Bär am " +
            "Aas (z.riss.gaeste[*].kommtS) liefert die Probe jagdkreis nur headless",
        quelle:
            "2 = dazu Fressen ≥ 60 s, der Kadaver lockt Fuchs oder Bär ≤ 120 s, Station Wolfsrevier im Bild beider Geräte",
    },
    {
        kriterium: "tiere.K4",
        staffel: 2,
        geraet: "headless",
        befehl: null,
        grund:
            "nicht gebaut: das Tages-Budget je Gattung am Ethogramm fehlt (Rotwild grast tagsüber ~15 % statt ~50 %), " +
            "„Bär am Fluss ≥ 2×“ ist kein Soll der Linse; nur Durst steht (--proben durst)",
        quelle:
            "2 = dazu das Tages-Budget je Gattung ±20 % am Ethogramm, Trinken aus Durst (Mutante „Durst aus“ → 0), am Fluss Bären-Sichtung ≥ 2× wahrscheinlicher",
    },
];

module.exports = stationen;
module.exports.fehlt = fehlt;
