// Stationen der Gruppe IV (src/g4.js · Schöpfung: Studios, Pipeline, KI, Spieler-Bauen). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium mit Punkten am Kopf 452972a6 (studios.K2, pipeline.K3, pipeline.K4, ki.K1, bauen.K1, bauen.K3)
// und jedes, das ein Zweig im Stau kippen soll (uebergabe-kanal pipeline.K1, ki-regler ki.K2, editform-kern bauen.K4); die
// Messschuld M30–M43 trägt kein Kriterium dieser Gruppe. Jede Browser-Station fährt LINSE_GPU=software: lokal griffe
// starteBrowser sonst die Karte (scripts/lib/software-gpu.cjs), und eine Karte gibt es nur unter dem Schloss.
// Ein Eintrag mit befehl: null ist eine Staffel, die kein Werkzeug im Spiel-Baum messen kann — grund nennt, was fehlt.
"use strict";

const zeilen = (t) => String(t || "").split(/\r?\n/);
const SOFT = { LINSE_GPU: "software" };

// Studio-Seite → die Arten aus PARAMS_BY_KIND, die ihr werk() der Hülle schickt (worlds/<seite>/*.js `werk:`)
const SEITEN = {
    garage: ["vehicle"],
    schmiede: ["weapon"],
    portale: ["gate"],
    klang: ["klang"],
    fachwerk: ["haus", "ausstattung"],
    koerperstudio: ["koerper"],
    tetrapoda: ["kreatur"],
    terrain: ["flower", "grass"],
};
const UEBERGABE_PFAD = [
    "worlds/huelle/",
    "worlds/garage/",
    "worlds/schmiede/",
    "worlds/portale/",
    "worlds/klang/",
    "worlds/fachwerk/",
    "worlds/koerperstudio/",
    "worlds/tetrapoda/",
    "worlds/terrain/",
    "stamm/netz-portal.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/studio-*.js",
    "stamm/koerper-leib.js",
    "stamm/kreatur-leben.js",
    "stamm/klang.js",
    "stamm/speicher-*.js",
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "scripts/diag-studio-uebergabe.cjs",
    "scripts/lib/asset-worker-harness.cjs",
    "scripts/lib/stamm.cjs",
    "scripts/lib/welt-boot.cjs",
];
// gate:studio-uebergabe (uebergabe-kanal 3e00dc62): (K) je Art ein Rezept, Same und JEDE Zeile zufällig (Saat je Lauf), der Leser
// der Welt bis an den Bäcker, Bau-Hash Studio = Welt; (S) nur die Hülle postet; --welt der Konsum im echten Spiel. Die Seite selbst
// (ihr Knopf und ihr werk()) fährt die Linse nicht — sie zählt eine Seite, wenn JEDE ihrer Arten byte-gleich reist.
function uebergabeLesen(lauf) {
    const out = String(lauf.stdout || "");
    const saat = (/=== \(K\) KANAL — Saat (\d+)/.exec(out) || [])[1];
    if (!saat) return null;
    const art = {};
    for (const l of zeilen(out)) {
        const m = /^\s*(✅|❌) (\w+): das Werk des Studios steht byte-gleich in der Welt/.exec(l);
        if (m) art[m[2]] = m[1] === "✅";
    }
    const wand =
        /✅ nur die Hülle postet eine Übergabe/.test(out) && /✅ die Heimat leitet die Übergabe an genau EINEN Empfänger/.test(out);
    const i = out.indexOf("=== --welt");
    const weltTeil = i < 0 ? "" : out.slice(i).split(/\n\s*\n/)[0];
    const welt = i >= 0 && /✅/.test(weltTeil) && !/❌/.test(weltTeil);
    const seiten = Object.keys(SEITEN).filter((s) => SEITEN[s].every((a) => art[a] === true));
    const zahl =
        seiten.length + "/8 Studio-Seiten mit gleichem Bau-Hash in der Welt (Arten " +
        Object.values(art).filter(Boolean).length + "/" + Object.keys(art).length + ", Saat " + saat + ")" +
        (seiten.length < 8 ? ", ohne " + Object.keys(SEITEN).filter((s) => !seiten.includes(s)).join(", ") : "") +
        (wand ? "" : ", Sonderweg-Wand ROT") + (welt ? ", Konsum im Spiel grün" : ", Konsum im Spiel (--welt) ROT oder fehlt");
    return { art, wand, welt, seiten, zahl };
}

// gate:regler-wirkt Teil 1–3 und die Budget-Ratsche dahinter (spec/vertraege/ratsche.json reglerBudget)
const REGLER_BEFEHL = [
    "bash",
    "-c",
    "for t in 1 2 3; do node scripts/diag-regler-wirkt.cjs --teil=$t; echo \"TEIL $t EXIT $?\"; done; " +
        "node -e \"console.log('RATSCHE ' + JSON.stringify(require('./spec/vertraege/ratsche.json').reglerBudget || null))\"",
];
const REGLER_PFAD = [
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "spec/vertraege/ratsche.json",
    "stamm/studio-*.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/koerper-*.js",
    "stamm/kreatur-*.js",
    "stamm/stoff-instanz.js",
    "stamm/vegetation-*.js",
    "scripts/diag-regler-wirkt.cjs",
    "scripts/lib/asset-worker-harness.cjs",
    "scripts/lib/plattform-probe.cjs",
    "scripts/lib/stamm.cjs",
    "scripts/lib/welt-boot.cjs",
];
function reglerLesen(lauf) {
    const out = String(lauf.stdout || "");
    const teile = [];
    for (const l of zeilen(out)) {
        const s = /^STUFEN \(B2c, pipeline\.K3\): (\d+) Bauten .*? · über Budget (\d+) · Reduktion je Art (.*)$/.exec(l);
        if (s) teile.push({ bauten: +s[1], ueber: +s[2], reduktion: s[3] });
    }
    const exits = [...out.matchAll(/^TEIL (\d) EXIT (\d+)/gm)].map((m) => +m[2]);
    const r = /^RATSCHE (.*)$/m.exec(out);
    let ratsche = null;
    try {
        ratsche = r ? JSON.parse(r[1]) : null;
    } catch (_e) {
        ratsche = null;
    }
    const quote = {};
    for (const t of teile)
        for (const seg of t.reduktion.split(" · ")) {
            const art = seg.trim().split(" ")[0];
            for (const m of seg.matchAll(/L(\d)\/L0 ([\d.]+)/g)) {
                const k = art + ":L" + m[1];
                quote[k] = Math.max(quote[k] || 0, +m[2]);
            }
        }
    return {
        teile,
        exits,
        ratsche,
        quote,
        ueber: teile.reduce((s, t) => s + t.ueber, 0),
        leer: (out.match(/^❌ LEER: .*/gm) || []).length,
        neuQuote: (out.match(/^❌ NEU ÜBER DER QUOTE: .*/gm) || []).length,
        bauten: teile.reduce((s, t) => s + t.bauten, 0),
    };
}

// diag-werkstatt-weg (L-WERKSTATT, BRENNGLAS): die Rohdatei artifacts/werkstatt-weg/weg.json wandert nach {AUS}
const WEG_BEFEHL = [
    "bash",
    "-c",
    "rm -f artifacts/werkstatt-weg/weg.json; node scripts/diag-werkstatt-weg.cjs; e=$?; " +
        "cp artifacts/werkstatt-weg/weg.json \"$PUNKTE_AUS\" 2>/dev/null; exit $e",
];
const WEG_ENV = { ...SOFT, WERKSTATT_WEG_PORT: "{PORT}", PUNKTE_AUS: "{AUS}" };
const WEG_WEGE = ["werkstatt", "rezeptbuch", "hotbar"];
const WEG_LAGEN = ["schöpfer", "frieden mit Material", "pfad"];
const WEG_WERKE = ["Eiche", "Haus", "GT", "Teil"];
const WEG_SICHTEN = ["Ego", "Third"];

module.exports = [
    // ───────────────────────────── Studios ─────────────────────────────
    {
        kriterium: "studios.K2",
        staffel: 1,
        geraet: "headless",
        // DER GANG der Hülle (H3, Beleg 1972da18): je Studio-Seite der erste Hüllen-Schieber an seinen Rand, Strg+Z, der Wert
        // kehrt zurück. Redo (Strg+Umschalt+Z · Strg+Y) fährt der Gang nicht — die Zahl nennt es.
        befehl: ["node", "scripts/diag-studio-huelle.cjs", "--engine"],
        env: { ...SOFT, STUDIO_HUELLE_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .*?(?:Schieber ([^,\s]+) → ([^,\s]+), Strg\+Z → ([^,\s]+)|ohne Sitzung)/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = m[2] == null ? null : { vor: m[2], mitte: m[3], nach: m[4] };
            }
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Zeile des Gangs (Exit " + lauf.exit + ")" };
            const wirkt = Object.keys(SEITEN).filter((s) => je[s] && je[s].mitte !== je[s].vor && je[s].nach === je[s].vor);
            const ohne = Object.keys(SEITEN).filter((s) => !wirkt.includes(s));
            return {
                gruen: wirkt.length === 8,
                zahl:
                    "Undo wirkt in " + wirkt.length + "/8 Studios" + (ohne.length ? " (ohne " + ohne.join(", ") + ")" : "") +
                    ", Redo ungeprobt (der Gang fährt nur Strg+Z)",
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/klang/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Undo/Redo wirkt in 8/8 Studios",
    },
    {
        kriterium: "studios.K2",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "kein Werkzeug misst Griff → erstes Ausgabe-Bild mit neuem Bau-Hash: die Gang-Probe (20 zufällige Griffe je Studio) " +
            "fehlt in diag-studio-huelle --engine, die Zeilen tragen kein `uniform: true` im Vertrag, A/B nur im Gelände-Studio, " +
            "Persistenz über das Neuladen 0 (worlds/huelle/huelle.js ohne localStorage/indexedDB)",
        quelle: "2 = p95 Griff → erstes Bild mit neuem Bau-Hash ≤ 200 ms",
    },

    // ───────────────────────────── Pipeline ─────────────────────────────
    {
        kriterium: "pipeline.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-uebergabe.cjs", "--welt"],
        env: { ...SOFT, STUDIO_UEBERGABE_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const u = uebergabeLesen(lauf);
            if (!u) return { gruen: false, zahl: "kein (K)-Kanal: die Linse kennt den EINEN Übergabe-Kanal nicht (Exit " + lauf.exit + ")" };
            return { gruen: u.wand && u.welt && u.seiten.length >= 4, zahl: u.zahl };
        },
        pfad: UEBERGABE_PFAD,
        quelle: "1 = ≥ 4/8 Studio-Seiten, deren Werk mit gleichem Bau-Hash in der Welt steht",
    },
    {
        kriterium: "pipeline.K1",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-uebergabe.cjs", "--welt"],
        env: { ...SOFT, STUDIO_UEBERGABE_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const u = uebergabeLesen(lauf);
            if (!u) return { gruen: false, zahl: "kein (K)-Kanal: die Linse kennt den EINEN Übergabe-Kanal nicht (Exit " + lauf.exit + ")" };
            const alle = Object.keys(u.art).length > 0 && Object.values(u.art).every(Boolean);
            return { gruen: lauf.exit === 0 && u.wand && u.welt && alle && u.seiten.length === 8, zahl: u.zahl };
        },
        pfad: UEBERGABE_PFAD,
        quelle: "2 = 8/8, mit zufälligem ov je Lauf und jeder Zeile von PARAMS_BY_KIND",
    },
    {
        kriterium: "pipeline.K3",
        staffel: 1,
        geraet: "headless",
        // die Stufen-Probe über die echte Foundry-Brücke (Dreiecke rechnet der Worker in JS, geräteunabhängig, R3). Der
        // Wertebereich ist kein Messwert der Linse: eine Verengung im Kern fällt am Diff (Vertrags-Akt, Lehre 11), R6 über die
        // Kerne erzwingt die Neumessung.
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const r = reglerLesen(lauf);
            if (r.teile.length !== 3) return { gruen: false, zahl: r.teile.length + " von 3 Teilen mit STUFEN-Zeile (Exits " + r.exits.join("/") + ")" };
            const gruen = r.exits.every((e) => e === 0 || e === 1) && r.leer === 0 && r.ueber <= 3;
            return { gruen, zahl: "über Budget " + r.ueber + " (Staffel 1 ≤ 3) in " + r.bauten + " Bauten, leer " + r.leer + ", Exits " + r.exits.join("/") };
        },
        pfad: REGLER_PFAD,
        quelle: "1 = reglerBudget ≤ 3 ohne geschrumpften Wertebereich",
    },
    {
        kriterium: "pipeline.K3",
        staffel: 2,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const r = reglerLesen(lauf);
            if (r.teile.length !== 3) return { gruen: false, zahl: r.teile.length + " von 3 Teilen mit STUFEN-Zeile (Exits " + r.exits.join("/") + ")" };
            if (!r.ratsche) return { gruen: false, zahl: "keine RATSCHE-Zeile (spec/vertraege/ratsche.json reglerBudget)" };
            // exakt: jede Quote über L1 0,5 / L2 0,15 steht beim Namen in reglerBudget.quote oder ist NEU ÜBER DER QUOTE (Exit 1)
            const benannt = Object.keys(r.ratsche.quote || {});
            const ueberQ = Object.entries(r.quote).filter(([k, q]) => q > (/:L1$/.test(k) ? 0.5 : 0.15));
            const gruen =
                r.exits.every((e) => e === 0 || e === 1) && r.leer === 0 && r.ueber === 0 && r.neuQuote === 0 &&
                benannt.length === 0 && ueberQ.length === 0;
            const max = (s) => Math.max(0, ...Object.entries(r.quote).filter(([k]) => k.endsWith(s)).map(([, q]) => q));
            return {
                gruen,
                zahl:
                    "über Budget " + r.ueber + ", Quote max L1/L0 " + max(":L1").toFixed(2) + " · L2/L0 " + max(":L2").toFixed(2) +
                    (benannt.length ? ", in der Ratsche " + benannt.join(" ") : "") + (r.neuQuote ? ", neu über der Quote " + r.neuQuote : "") +
                    (ueberQ.length ? ", über " + ueberQ.map(([k, q]) => k + " " + q).join(" ") : ""),
            };
        },
        pfad: REGLER_PFAD,
        quelle: "2 = 0, und je Art L1/L0 ≤ 0,5, L2/L0 ≤ 0,15 Dreiecke",
    },
    {
        kriterium: "pipeline.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "diag-boot-stage --kalt --echt --profil zählt keine Lieferung und kein Bau-Ereignis: der Beleg (107–109 von 108–110, GTX " +
            "18.10.) maß ein Instrument-Patch im koordination-Baum (bericht/1810-b5/befund/lieferung-patch.cjs, Anker an 452972a6 noch " +
            "eindeutig) über die OMEN-Serie serie2.sh mit festen OMEN-Pfaden, und er zählte Platten-Treffer — die Messung verlangt " +
            "Bau-Ereignisse in Worker UND Haupt-Faden",
        quelle: "1 = build-asset kommt beim Zweit-Boot zu ≥ 95 % von der Platte",
    },
    {
        kriterium: "pipeline.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "Blatt-Atlas, Dorf-Export und Karten laufen jedes Boot live (nie auf der Platte), und kein Werkzeug zählt fremde Neubauten " +
            "nach einem geänderten Kern-SHA",
        quelle: "2 = jede Lieferung (Blatt-Atlas, Dorf-Export, Karten) 100 %",
    },

    // ───────────────────────────── KI ─────────────────────────────
    {
        kriterium: "ki.K1",
        staffel: 1,
        geraet: "headless",
        // die Station WORT (diag-v1-pfad --korpus) spielt den Mitschnitt des echten Laufs (spec/profiband/ratsche-ki-korpus.json:
        // Modell, Anbieter-Host, Datum) Satz → Programm in der echten Welt ab; die Prädikate lesen state. „gehalten" = die Ratsche
        // hält (✅ WORT); die Negativ-Sätze nennt der Korpus selbst (still).
        befehl: [
            "bash",
            "-c",
            "node scripts/diag-v1-pfad.cjs --korpus; e=$?; node -e \"const k=require('./spec/abnahme/ki-korpus.json'); " +
                "const r=require('./spec/profiband/ratsche-ki-korpus.json'); " +
                "console.log('NEGATIV ' + JSON.stringify(Object.keys(k.saetze).filter((s) => k.saetze[s].still))); " +
                "console.log('MITSCHNITT ' + JSON.stringify({ modell: r.modell, anbieter: r.anbieter, datum: r.datum }))\"; exit $e",
        ],
        env: { ...SOFT, V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            let neg = null, mit = null;
            try {
                neg = JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
                mit = JSON.parse((/^MITSCHNITT (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                return { gruen: false, zahl: "Korpus oder Mitschnitt unlesbar" };
            }
            const s = [];
            for (const l of zeilen(out)) {
                const m = /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l);
                if (m) s.push({ ok: m[1] === "✓", bruch: !!m[3], satz: m[4], negativ: neg.includes(m[4]) });
            }
            const pos = s.filter((x) => !x.negativ);
            const erf = pos.filter((x) => x.ok).length;
            const negOk = s.filter((x) => x.negativ && x.ok).length;
            const brueche = s.filter((x) => x.bruch).length;
            const gehalten = /✅ WORT der Korpus/.test(out);
            const echt = !!(mit && mit.anbieter && mit.modell);
            return {
                gruen: gehalten && echt && erf >= 10,
                zahl:
                    erf + " von " + pos.length + " Positiv-Sätzen mit Welt-Prädikat, Negativ " + negOk + "/" + neg.length +
                    " ohne Tat, Brüche " + brueche + (gehalten ? ", Ratsche hält" : ", Ratsche ROT") +
                    " (Mitschnitt " + (mit && mit.modell) + " @ " + (mit && mit.anbieter) + " " + (mit && mit.datum) + ")",
            };
        },
        pfad: [
            "spec/abnahme/ki-korpus.json",
            "spec/profiband/ratsche-ki-korpus.json",
            "stamm/feld-*.js",
            "stamm/werkstatt-vorschau.js",
            "stamm/studio-*.js",
            "stamm/bild-himmel.js",
            "stamm/dirigent-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/daten.js",
            "*-core.js",
            "foundry-bruecke.js",
            "index.html",
            "scripts/diag-v1-pfad.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Grundstufe ohne Schlüssel: ≥ 10 Positiv-Sätze mit Welt-Prädikat gemessen und gehalten",
    },
    {
        kriterium: "ki.K1",
        staffel: 2,
        geraet: "headless",
        befehl: null,
        grund:
            "das Soll braucht den Lauf mit echtem Modell (`diag-v1-pfad --korpus --echt`, KI_ENDPUNKT) auf einem Host mit Anbieter " +
            "(der LLM-Lauf mit Schlüssel, Drehbuch-Schritt 18, steht aus) UND ein sehendes Bild-Prädikat: das Bild-Prädikat je Satz fiel " +
            "als blind (10–17 % Ruhe-Rauschen ohne Tat), ein Bild-Diff gegen dieselbe Ruhe gibt es nicht",
        quelle: "2 = das Soll mit Modell (gültig ≥ 95 %, Absicht ≥ 85 %, 0 Brüche, Negativ-Sätze scheitern benannt)",
    },
    {
        kriterium: "ki.K2",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (K) KI-REGLER (ki-regler 804954ab): je Zeile von PARAMS_BY_KIND spawn_studio mit ov im fünften
        // Argument durch den EINEN Stempel; ERREICHT verlangt Welt-Werk ≠ ohne ov und = Studio-Werk (der Bau-Hash folgt) und ≥ 50 %.
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { ...SOFT, PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const e = /^\s*(✅|❌) ERREICHT: (\d+) von (\d+) Zeilen von PARAMS_BY_KIND \(([\d.]+) %\) erreicht(?: — (.*))?$/m.exec(out);
            if (!e) return { gruen: false, zahl: "keine ERREICHT-Zeile: spawn_studio trägt kein ov (Exit " + lauf.exit + ")" };
            const klemme = /✅ KLEMME:/.test(out);
            const zu = /✅ FAIL-CLOSED:/.test(out);
            const selbst = /✅ SELBST-TEST: ein ov, das nicht ankommt/.test(out);
            const n = +e[2], m = +e[3];
            return {
                gruen: e[1] === "✅" && m > 0 && n / m >= 0.5 && klemme && zu && selbst,
                zahl:
                    n + " von " + m + " Zeilen (" + e[4] + " %) aus einem KI-Programm, Bau-Hash folgt" + (e[1] === "✅" ? "" : " NICHT") +
                    (klemme ? "" : ", Klemme ROT") + (zu ? "" : ", fail-closed ROT") + (selbst ? "" : ", Selbsttest ROT"),
            };
        },
        pfad: [
            "stamm/feld-*.js",
            "stamm/werkstatt-vorschau.js",
            "stamm/studio-*.js",
            "stamm/netz-portal.js",
            "stamm/koerper-leib.js",
            "*-core.js",
            "foundry-bruecke.js",
            "cores.manifest.json",
            "spec/vertraege/ratsche.json",
            "scripts/diag-praegung-welt.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = ≥ 50 % der Zeilen von PARAMS_BY_KIND sind aus einem KI-Programm erreichbar",
    },
    {
        kriterium: "ki.K2",
        staffel: 2,
        geraet: "headless",
        befehl: null,
        grund:
            "der Korpus trägt keinen Teil Regler-Wörter („knorrig“, „schmal und hoch“), und der Lauf mit Modell fehlt (Drehbuch 18); " +
            "die Erreichbarkeit ≥ 95 % misst gate:praegung-welt (K), den Korpus-Teil nichts",
        quelle: "2 = ≥ 95 % und der Korpus-Teil Regler-Wörter („knorrig“, „schmal und hoch“) ≥ 80 % mit Modell",
    },

    // ───────────────────────────── Bauen ─────────────────────────────
    {
        kriterium: "bauen.K1",
        staffel: 1,
        geraet: "headless",
        // L-WERKSTATT (bauen-k1 64e153f2/b0c842a9): Eiche, Haus, GT, eigene Hütte × Werkstatt, Rezeptbuch, Hotbar × schöpfer,
        // frieden mit Material, pfad × Ego, Third über page.keyboard/page.mouse, gezählt pointerdown/keydown/wheel mit isTrusted.
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            if (!j || j.gestartet !== true || !j.wege) return { gruen: false, zahl: "keine Rohdatei weg.json (Exit " + lauf.exit + ")" };
            let n = 0, steht = 0;
            const jeWeg = {};
            for (const weg of WEG_WEGE) {
                const ein = [];
                let s = 0, z = 0;
                for (const lage of WEG_LAGEN)
                    for (const werk of WEG_WERKE)
                        for (const sicht of WEG_SICHTEN) {
                            const e = ((((j.wege[lage] || {})[weg] || {})[werk] || {})[sicht]) || null;
                            z++;
                            if (e && !e.fehler && e.steht === 1 && e.eingaben > 0 && !(e.unecht > 0)) {
                                s++;
                                ein.push(e.eingaben);
                            }
                        }
                n += z;
                steht += s;
                jeWeg[weg] = s + "/" + z + (ein.length ? " (Eingaben " + Math.min(...ein) + "–" + Math.max(...ein) + ")" : "");
            }
            return {
                gruen: n === 72 && steht === n,
                zahl: steht + "/" + n + " Werke stehen über echte Ereignisse · " + WEG_WEGE.map((w) => w + " " + jeWeg[w]).join(" · "),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/siedlung-satz.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/dirigent-kern.js",
            "stamm/daten.js",
            "index.html",
            "worlds/huelle/huelle.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "fachwerk-core.js",
            "vehicle-core.js",
            "phyto-core.js",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = jeder Weg (Werkstatt, Rezeptbuch, Hotbar) stellt das Werk über echte DOM-Ereignisse, gezählt am Ereignis-Strom",
    },
    {
        kriterium: "bauen.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "diag-werkstatt-weg misst die ms bis zum stehenden Werk im Null-Renderer (kein --echt), nicht das erste Ausgabe-Bild in L0; " +
            "die Radeon-Zeiten des Belegs (kalt 1 519 / 2 346 ms) sind ein Hand-Lauf, die GTX ungemessen",
        quelle: "2 = ≤ 3 Eingaben und p95 ≤ 1 s bis zum ersten Ausgabe-Bild in L0, kalt und warm, beide Geräte",
    },
    {
        kriterium: "bauen.K3",
        staffel: 1,
        geraet: "headless",
        // BRENNGLAS (diag-werkstatt-weg): die Linse wird als Form gebaut (Quarz-Kugel im Bronze-Ring, kein Tag), zündet zu Mittag
        // die Eiche darunter, nachts nie, außerhalb kühlt es; die Statik urteilt nur beim Fertigen (_workshopPhysicsVerdict).
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const l = zeilen(lauf.stdout).find((x) => /^\s*(✅|❌) Brennglas die Eiche an der Genesis-Plattform/.test(x));
            if (!l) return { gruen: false, zahl: "keine Brennglas-Zeile (Exit " + lauf.exit + ")" };
            const d = l.split(" — ").slice(1).join(" — ");
            return { gruen: /^\s*✅/.test(l), zahl: "Wirkung aus der Form: " + (d.slice(0, 160) || "ohne Detail") };
        },
        pfad: [
            "stamm/koerper-fahrt.js",
            "stamm/bau-teile.js",
            "stamm/bild-himmel.js",
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/kreatur-verhalten.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-ort.js",
            "stamm/koerper-bewegung.js",
            "stamm/dienst.js",
            "stamm/daten.js",
            "phyto-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = die Wirkung aus der Form ist gemessen, die Statik gilt nur in der Werkstatt",
    },
    {
        kriterium: "bauen.K3",
        staffel: 2,
        geraet: "headless",
        befehl: null,
        grund:
            "kein Prüf-Satz in der Welt: das Statik-Urteil fällt nur beim Fertigen (`_workshopPhysicsVerdict`), beim Setzen zählt nur " +
            "„Phantom auf dem Boden“ (`_setzUrteil`); Turm, Kragarm, Brücke, Bogen und Rad/Schale baut keine Linse",
        quelle: "2 = ein Prüf-Satz aus 10 Konstruktionen (5 stabil, 5 instabil) wird in der Welt 10/10 richtig geurteilt",
    },
    {
        kriterium: "bauen.K4",
        staffel: 1,
        geraet: "headless",
        befehl: null,
        grund:
            "kein Werkzeug fährt 20 Blöcke ≥ 60 m mit dem Fuß auf dem Mesh: gate:worker-dichte (2) DIE HÜLLE (editform-kern) baut 10 " +
            "Füll-Edits r 3,5 (N_TURM fest, Hub je Edit, keine Sohle), gate:persistence (L) zählt 300 Löcher über den Reload ohne Turm, " +
            "der Fall-Wächter trägt seit editform-kern keinen Turm; der Beleg 69,5 m / Fuß 0,04–0,15 m (hoch-bauen 9d987a93) war ein " +
            "Hand-Lauf an der Radeon",
        quelle: "1 = ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände (Fuß ≤ 0,15 m über dem Mesh) und hält über den Reload (0 Löcher)",
    },
    {
        kriterium: "bauen.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "kein Werkzeug setzt den Turm auf Dach, Fels und Brücke (`_bodenSichtAt`) und misst den Fern-Ring-Edit ≤ 1 s per byte-Diff " +
            "in Ego und Third",
        quelle: "2 = auch auf Dach, Fels und Brücke (oberste Fläche, `_bodenSichtAt`), der Fern-Ring zeigt den Edit ≤ 1 s (byte-Diff), Ego und Third, beide Geräte",
    },
];
