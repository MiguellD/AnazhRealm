// Stationen der Gruppe IV (src/g4.js · Schöpfung: Studios, Pipeline, KI, Spieler-Bauen). Format und Regeln: punkte/punkte.cjs (Kopf).
// Erfasst ist jedes Kriterium mit Punkten am Kopf 452972a6 (studios.K2, pipeline.K3, pipeline.K4, ki.K1, bauen.K1, bauen.K3)
// und jedes, das ein Zweig im Stau kippen soll (uebergabe-kanal pipeline.K1, ki-regler ki.K2, editform-kern bauen.K4); die
// Messschuld M30–M43 trägt kein Kriterium dieser Gruppe. Jede Browser-Station fährt LINSE_GPU=software: lokal griffe
// starteBrowser sonst die Karte (scripts/lib/software-gpu.cjs), und eine Karte gibt es nur unter dem Schloss.
// Ein Eintrag mit befehl: null ist eine Staffel, die kein Werkzeug im Spiel-Baum messen kann — grund nennt, was fehlt.
"use strict";

const { jsonZeile } = require("../hilfe.cjs");

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
// DER LOKALE ANBIETER der Stationen mit Modell (ki.K1#2, ki.K3#1, ki.K4#1): läuft ollama auf 127.0.0.1:11434 nicht, startet ihn die
// Station und beendet ihn danach; die Zeile ANBIETER beweist, dass der Host das Modell trägt (kein Stub, kein Mitschnitt)
const OLLAMA_AN =
    "set -u; O=127.0.0.1:11434; S=''; " +
    "if ! curl -s -m 3 -o /dev/null http://$O/api/tags; then X=\"${LOCALAPPDATA:-}/Programs/Ollama/ollama.exe\"; " +
    "[ -x \"$X\" ] || X=ollama; (\"$X\" serve > /dev/null 2>&1 < /dev/null &); S=1; " +
    "for t in $(seq 1 30); do curl -s -m 2 -o /dev/null http://$O/api/tags && break; sleep 1; done; fi; " +
    "echo \"ANBIETER $O $(curl -s -m 5 http://$O/api/tags | node -e \"let s='';process.stdin.on('data',(d)=>(s+=d)).on('end',()=>{" +
    "try{const m=JSON.parse(s).models.map((x)=>x.name);console.log(JSON.stringify({traegt:m.includes(process.env.KI_MODELL),modelle:m}))}" +
    "catch(e){console.log('{}')}})\")\"; ";
const OLLAMA_AUS = "[ -n \"$S\" ] && taskkill //F //IM ollama.exe > /dev/null 2>&1; exit $e";
const OLLAMA_ENV = { ...SOFT, V1_PFAD_PORT: "{PORT}", KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" };
const anbieterVon = (out) => {
    try {
        return JSON.parse((/^ANBIETER \S+ (.*)$/m.exec(out) || [])[1]);
    } catch (_e) {
        return null;
    }
};
const KEIN_ANBIETER = (anb) => ({
    gruen: false,
    zahl: "kein echter Anbieter: 127.0.0.1:11434 trägt qwen3:4b-instruct nicht (" + JSON.stringify(anb) + ")",
});
// der gemessene Pfad des Korpus mit Modell (ki.K1#2 und die Teile seele, regeln)
const KI_KORPUS_PFAD = [
    "spec/abnahme/ki-korpus.json",
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
];
// gate:praegung-welt (K): spawn_studio und sein Stempel, die Werke je Art (Bau, Wesen, Prägung) und ihre Leser in der Welt
// (die Gesetze des Tors und des Wagens, der Guss der Gattung, der Leib des Spielers, der Klang), der Korpus-Teil Regler-Wörter
const KI_K2_PFAD = [
    "stamm/feld-*.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/studio-*.js",
    "stamm/netz-portal.js",
    "stamm/koerper-*.js",
    "stamm/kreatur-*.js",
    "stamm/klang.js",
    "stamm/gelaende-kollision.js",
    "stamm/siedlung-ort.js",
    "*-core.js",
    "foundry-bruecke.js",
    "cores.manifest.json",
    "spec/vertraege/ratsche.json",
    "spec/abnahme/ki-korpus.json",
    "scripts/diag-praegung-welt.cjs",
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

const alle = [
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
        zeit: false,
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
        // DIE GANG-PROBE (H7, Zweig studios-k2-sitzung): je Studio-Seite 20 zufällige Griffe (Saat, nie zweimal derselbe Wert) —
        // die Zeit vom Eingabe-Ereignis bis zum ersten Bild mit neuem Bau-Hash (AnazhHuelle.gang: der rAF nach dem Render der
        // Seite trägt den Plan, den bei/nachRuhe anwandte); die Klasse je Zeile steht im Vertrag (`uniform: true` ≤ 200 ms, sonst
        // Neubau ≤ 1 s); dann das Neuladen (jeder Regler der Sitzung steht wieder, der EINE Speicher-Weg localStorage) und A/B
        // (der Gang H3: A zeigt den Stand der Öffnung, B den Zug). Die Zeit urteilt nur auf der Karte (Kopfzeile „geurteilt“).
        befehl: ["node", "scripts/diag-studio-huelle.cjs", "--engine"],
        env: { STUDIO_HUELLE_PORT: "{PORT}" },
        gpu: true,
        zeit: true,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const karte = /=== H7 DIE SITZUNG — Saat \d+, die Zeit geurteilt \(Karte\)/.test(out);
            const je = {};
            for (const l of zeilen(out)) {
                const t = /^\s{2}⏱ (\S+)\s+Griff → Bild p95 Gesetz-Wert (\S+) ms · Neubau (\S+) ms · (\d+) Griffe mit Bild · Neuladen (\d+)\/(\d+)/.exec(l);
                if (t && SEITEN[t[1]]) je[t[1]] = Object.assign(je[t[1]] || {}, { u: +t[2], n: +t[3], mit: +t[4], bleibt: +t[5] > 0 && t[5] === t[6] });
                const g = /^\s{2}(\S+)\s+\d+ Anfragen · .*?Schieber ([^,\s]+) → ([^,\s]+),.*, A → ([^,\s]+), B → ([^,\s]+)/.exec(l);
                if (g && SEITEN[g[1]]) je[g[1]] = Object.assign(je[g[1]] || {}, { ab: g[2] !== g[3] && g[4] === g[2] && g[5] === g[3] });
            }
            const s = Object.keys(SEITEN).map((id) => ({ id, ...(je[id] || {}) }));
            const klasse = (z, k, max) => !(z[k] > max); // „–“ (keine Zeile der Klasse im Studio) ist NaN und zählt nicht
            const zeit = s.filter((z) => z.mit === 20 && klasse(z, "u", 200) && klasse(z, "n", 1000));
            const bleibt = s.filter((z) => z.bleibt).length;
            const ab = s.filter((z) => z.ab).length;
            const hoch = (k) => s.reduce((m, z) => (z[k] > m.v ? { v: z[k], id: z.id } : m), { v: 0, id: "–" });
            const u = hoch("u"),
                n = hoch("n");
            return {
                gruen: karte && zeit.length === 8 && bleibt === 8 && ab === 8,
                zahl:
                    (karte ? "" : "die Zeit ungeurteilt (kein Hardware-Adapter) · ") +
                    "p95 Griff → Bild unter der Schranke in " + zeit.length + "/8 (Gesetz-Wert höchstens " + u.v + " ms " + u.id +
                    ", Neubau höchstens " + n.v + " ms " + n.id + ") · Neuladen " + bleibt + "/8 · A/B " + ab + "/8",
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
            "*-core.js",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle:
            "2 = p95 Griff → erstes Bild mit neuem Bau-Hash ≤ 200 ms (Zeilen mit `uniform: true` im Vertrag) bzw. ≤ 1 s (Neubau) " +
            "auf beiden Geräten, dazu A/B und Persistenz über das Neuladen in 8/8",
    },
    // ── studios.K3 ── das Thermometer: die Kosten-Leiste der Hülle zeichnet je Stufe das Werk ALLEIN in einem eigenen
    // Render-Abschnitt (worlds/huelle/huelle.js `zeichne`, renderer.info) und trägt neben der gezählten Zahl die gezeichnete;
    // der Gang (H7, Zwilling von studios.K2#1) druckt je Seite `Kosten [{stufe, leiste, deckel, gezeichnet}]`.
    {
        kriterium: "studios.K3",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-huelle.cjs", "--engine"],
        env: { ...SOFT, STUDIO_HUELLE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 3,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .* · Kosten (\[.*\])\s*$/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = JSON.parse(m[2]);
            }
            // die Mesh-Studios: jede Seite außer klang (meshfrei, Studio-Vertrag §8); je Seite die größte Abweichung ihrer Stufen
            const mesh = Object.keys(SEITEN).filter((s) => s !== "klang");
            const abw = (k) => (k.leiste > 0 && k.gezeichnet > 0 ? Math.abs(k.leiste / k.gezeichnet - 1) : Infinity);
            const groesste = (s) => (je[s] && je[s].length ? Math.max(...je[s].map(abw)) : Infinity);
            const wahr = mesh.filter((s) => groesste(s) <= 0.05);
            const ohne = mesh.filter((s) => !wahr.includes(s));
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Kosten-Zeile des Gangs (Exit " + lauf.exit + ")" };
            const stufen = wahr.reduce((n, s) => n + je[s].length, 0);
            return {
                gruen: wahr.length >= 4,
                zahl:
                    "Dreiecke ±5 % gegen renderer.info in " + wahr.length + "/" + mesh.length + " Mesh-Studios (" + stufen +
                    " Stufen, größte Abweichung " + (Math.max(0, ...wahr.map(groesste)) * 100).toFixed(1) + " %)" +
                    (ohne.length ? ", ohne " + ohne.map((s) => s + (je[s] ? " " + (groesste(s) * 100).toFixed(1) + " %" : " (keine Zeile)")).join(", ") : ""),
            };
        },
        pfad: [
            "worlds/huelle/",
            "worlds/garage/",
            "worlds/schmiede/",
            "worlds/portale/",
            "worlds/fachwerk/",
            "worlds/koerperstudio/",
            "worlds/tetrapoda/",
            "worlds/terrain/",
            "*-core.js",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = Dreiecke ±5 % gegen renderer.info in ≥ 4/7 Mesh-Studios",
    },
    {
        kriterium: "studios.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: null,
        grund:
            "die Leiste trägt gezeichnete Dreiecke und Befehle aus renderer.info (Zähl-Abschnitt, studios.K3#1), aber kein VRAM " +
            "(info.memoryMap je Werk-Attribut), keine GPU-ms (Timer-Query gegen gpu-bank) und beim Klang keine Audio-Graph-ms; " +
            "der Gang urteilt nur die Dreiecke",
        quelle: "2 = Dreiecke, Befehle, VRAM und GPU-ms ±5 % in 7/7, beim Klang die Audio-Graph-ms",
    },

    // ───────────────────────────── Pipeline ─────────────────────────────
    {
        kriterium: "pipeline.K1",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-studio-uebergabe.cjs", "--welt"],
        env: { ...SOFT, STUDIO_UEBERGABE_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
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
        zeit: false,
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
        zeit: false,
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
        zeit: false,
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
    // die Liefer-Marke des Spiels (`_foundryLiefer` am EINEN Weg jedes Körpers: der Auftrag `_foundryAuftrag`, die Antwort
    // `_foundryAntwort` — von der Platte, im Werk gebaut (die Schale `_foundrySchale` stempelt `bau` an jeden Studio-Lauf), leer —
    // und der Guss des Haupt-Fadens `_ofenBudget`): der Erst-Boot füllt ein frisches Profil bis zur Ruhe der Foundry, der Zweit-Boot
    // zählt jede Lieferung bis zur Ruhe. Bau-Ereignisse in Worker UND Haupt-Faden zählen gegen die Platte, ein Auftrag ohne Antwort
    // ist verschluckt (ROT); den gepflanzten Bruch fährt gate:boot-stage.
    {
        kriterium: "pipeline.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            `P="$(cygpath -m '{AUS}' 2>/dev/null || echo '{AUS}').profil"; rm -rf "$P"; node scripts/diag-boot-stage.cjs --kalt --echt --profil "$P" > /dev/null; node scripts/diag-boot-stage.cjs --kalt --echt --profil "$P"; E=$?; rm -rf "$P"; exit $E`,
        ],
        env: { BOOT_STAGE_PORT: "{PORT}" },
        gpu: true,
        zeit: false,
        minuten: 6,
        urteil: (j, lauf) => {
            const m =
                /^\s*(?:✅|❌) LIEFERUNG zweit: (\d+) von (\d+) von der Platte \([\d.]+ %\) · Werk (\d+) · Haupt-Faden (\d+) · leer (\d+) · verschluckt (-?\d+)$/m.exec(
                    String(lauf.stdout || "")
                );
            if (!m) return { gruen: false, zahl: "keine Liefer-Zeile am Zweit-Boot (Exit " + lauf.exit + ")" };
            const [p, n, werk, haupt, leer, weg] = m.slice(1).map(Number);
            return {
                gruen: n > 0 && weg === 0 && p / n >= 0.95,
                zahl:
                    p + " von " + n + " build-asset von der Platte (" + ((100 * p) / n).toFixed(1) + " %), Bau-Ereignisse Werk " + werk +
                    " · Haupt-Faden " + haupt + ", leer " + leer + ", verschluckt " + weg,
            };
        },
        pfad: [
            "stamm/studio-bruecke.js",
            "stamm/studio-gestalt.js",
            "stamm/koerper-leib.js",
            "foundry-bruecke.js",
            "cores.manifest.json",
            "scripts/diag-boot-stage.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
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
        zeit: false,
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
        // derselbe Korpus über denselben Chat-Pfad, aber gegen das ECHTE Modell (`--echt`, KI_ENDPUNKT = ollama auf dem Laptop,
        // 127.0.0.1:11434): läuft der Anbieter nicht, startet ihn die Station und beendet ihn danach; die Zeile ANBIETER beweist,
        // dass der Host das Modell trägt (kein Stub, kein Mitschnitt). Geurteilt wird das Soll der Staffel aus den Satz-Zeilen:
        // gültig ≥ 95 % und Absicht ≥ 85 % über alle Sätze, 0 Brüche, jeder Negativ-Satz ohne Tat und mit Antwort (✓). Die übrigen
        // Täter des Werkzeugs (Prädikat nie geprüft, CSP-Türen, Satz-Zahl) sind ROT; das p95 Satz → Welt (Soll des Werkzeugs 6 s)
        // steht nicht in der Staffel und wird nur genannt. Das Prädikat liest state (Null-Renderer, R3: Mechanik) — das Bild-Prädikat
        // der Messung trägt die Station nicht (es fiel als blind, 10–17 % Ruhe-Rauschen ohne Tat).
        befehl: [
            "bash",
            "-c",
            OLLAMA_AN +
                "node scripts/diag-v1-pfad.cjs --korpus --echt; e=$?; " +
                "node -e \"const k=require('./spec/abnahme/ki-korpus.json'); " +
                "console.log('NEGATIV ' + JSON.stringify(Object.keys(k.saetze).filter((s) => k.saetze[s].still))); " +
                "console.log('KORPUS ' + Object.keys(k.saetze).length)\"; " +
                OLLAMA_AUS,
        ],
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            let neg = null, anb = null;
            try {
                neg = JSON.parse((/^NEGATIV (.*)$/m.exec(out) || [])[1]);
                anb = JSON.parse((/^ANBIETER \S+ (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                return { gruen: false, zahl: "Korpus oder Anbieter-Zeile unlesbar (Exit " + lauf.exit + ")" };
            }
            const n = +((/^KORPUS (\d+)$/m.exec(out) || [])[1] || 0);
            if (!anb || anb.traegt !== true)
                return { gruen: false, zahl: "kein echter Anbieter: 127.0.0.1:11434 trägt qwen3:4b-instruct nicht (" + JSON.stringify(anb) + ")" };
            const s = [];
            for (const l of zeilen(out)) {
                const m = /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l);
                if (m) s.push({ ok: m[1] === "✓", gueltig: !m[2], bruch: !!m[3], satz: m[4], negativ: neg.includes(m[4]) });
            }
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \((echter Anbieter|Mitschnitt)\).*?(?: — Täter: (.*))?$/m.exec(out);
            if (!wort || wort[2] !== "echter Anbieter")
                return { gruen: false, zahl: "keine WORT-Zeile des echten Anbieters (" + s.length + " Satz-Zeilen, Exit " + lauf.exit + ")" };
            const taeter = (wort[3] || "").split(" · ").filter((t) => t && !/^p95 Satz → Welt/.test(t) && !/^(gueltig|absicht) /.test(t));
            const p95 = (/· p95 (\S+) ms/.exec(out) || [])[1] || "?";
            const q = (f) => s.filter(f).length / Math.max(1, s.length);
            const gueltig = q((x) => x.gueltig), absicht = q((x) => x.ok);
            const brueche = s.filter((x) => x.bruch).length;
            const negS = s.filter((x) => x.negativ), negOk = negS.filter((x) => x.ok).length;
            const pz = (x) => (100 * x).toFixed(1) + " %";
            return {
                gruen:
                    n > 0 && s.length === n && negS.length === neg.length && gueltig >= 0.95 && absicht >= 0.85 && brueche === 0 &&
                    negOk === neg.length && !taeter.length,
                zahl:
                    s.length + "/" + n + " Sätze gegen qwen3:4b-instruct @ 127.0.0.1:11434: gültig " + pz(gueltig) + " (Soll 95), Absicht " +
                    pz(absicht) + " (Soll 85), Brüche " + brueche + ", Negativ " + negOk + "/" + neg.length + " ohne Tat benannt, p95 " + p95 +
                    " ms (genannt)" + (taeter.length ? ", Täter " + taeter.join(" · ").slice(0, 160) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "2 = das Soll mit Modell (gültig ≥ 95 %, Absicht ≥ 85 %, 0 Brüche, Negativ-Sätze scheitern benannt)",
    },
    {
        kriterium: "ki.K2",
        staffel: 1,
        geraet: "headless",
        // gate:praegung-welt (K) KI-REGLER (ki-regler 804954ab, ki-k2-regler): je Zeile von PARAMS_BY_KIND spawn_studio mit ov im
        // fünften Argument durch den EINEN Stempel; ERREICHT verlangt Welt-Werk ≠ ohne ov und = Studio-Werk (der Bau-Hash folgt).
        befehl: ["node", "scripts/diag-praegung-welt.cjs"],
        env: { ...SOFT, PRAEGUNG_WELT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
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
        pfad: KI_K2_PFAD,
        quelle: "1 = ≥ 50 % der Zeilen von PARAMS_BY_KIND sind aus einem KI-Programm erreichbar",
    },
    {
        kriterium: "ki.K2",
        staffel: 2,
        geraet: "headless",
        // gate:praegung-welt (K) mit ≥ 95 % (ki-k2-regler: je Zeile Bau samt Gesetzen, Wesen oder Prägung an ihrem Leser; der
        // Korpus-Teil sagbar) und der Korpus-Teil Regler-Wörter (spec/abnahme/ki-korpus.json `regler`) im Mitschnitt des echten
        // Laufs: diag-v1-pfad --korpus --regler spielt die Programme des Modells (spec/profiband/ratsche-ki-korpus-regler.json,
        // geschrieben von `--echt --aufnahme` gegen ollama qwen3:4b auf dem Laptop) durch den echten Chat-Pfad in die Welt, das
        // Prädikat liest den Stempel jedes neuen Werks. Ohne Mitschnitt eines echten Laufs ist die Staffel ROT beim Namen.
        befehl: [
            "bash",
            "-c",
            "node scripts/diag-praegung-welt.cjs; node scripts/diag-v1-pfad.cjs --korpus --regler; e=$?; node -e \"let r = {}; " +
                "try { r = require('./spec/profiband/ratsche-ki-korpus-regler.json'); } catch (_e) {} " +
                "console.log('MITSCHNITT ' + JSON.stringify({ modell: r.modell, anbieter: r.anbieter, datum: r.datum }))\"; exit $e",
        ],
        env: { ...SOFT, PRAEGUNG_WELT_PORT: "{PORT}", V1_PFAD_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const e = /^\s*(✅|❌) ERREICHT: (\d+) von (\d+) Zeilen von PARAMS_BY_KIND \(([\d.]+) %\) erreicht/m.exec(out);
            if (!e) return { gruen: false, zahl: "keine ERREICHT-Zeile (Exit " + lauf.exit + ")" };
            let mit = null;
            try {
                mit = JSON.parse((/^MITSCHNITT (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                mit = null;
            }
            const s = zeilen(out).map((l) => /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“/.exec(l)).filter(Boolean);
            const erf = s.filter((x) => x[1] === "✓").length;
            const rot = ["KLEMME:", "FAIL-CLOSED:", "SELBST-TEST: ein ov, das nicht ankommt", "KORPUS-TEIL Regler-Wörter:", "WORT der Korpus"]
                .filter((w) => !out.includes("✅ " + w));
            const echt = !!(mit && mit.anbieter && mit.modell);
            const n = +e[2], m = +e[3];
            return {
                gruen: e[1] === "✅" && m > 0 && n / m >= 0.95 && !rot.length && echt && s.length >= 20 && erf / s.length >= 0.8,
                zahl:
                    n + " von " + m + " Zeilen (" + e[4] + " %), Korpus-Teil " + erf + " von " + s.length + " Sätzen mit Welt-Prädikat" +
                    (echt ? " (Mitschnitt " + mit.modell + " @ " + mit.anbieter + " " + mit.datum + ")" : ", kein Mitschnitt eines echten Laufs") +
                    (rot.length ? ", ROT: " + rot.join(" · ") : ""),
            };
        },
        pfad: [...KI_K2_PFAD, "spec/profiband/ratsche-ki-korpus*.json", "scripts/diag-v1-pfad.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
        quelle: "2 = ≥ 95 % und der Korpus-Teil Regler-Wörter („knorrig“, „schmal und hoch“) ≥ 80 % mit Modell",
    },
    {
        kriterium: "ki.K3",
        staffel: 1,
        geraet: "headless",
        // die Seele im Gespräch (ki-seele-regeln): der Teil seele des Korpus (spec/abnahme/ki-korpus.json, 12 Fragen) über den echten
        // Chat-Pfad gegen das lokale Modell — je Frage ein Wesen und seine Taten über die Wege des Spiels (der Schlag des Spielers
        // `damageCreature`, die Gabe `activateCreatureConsumable`, die Geste „folge mir", erinnert, wenn es beim Spieler ankommt),
        // dann die Frage im Chat an seinen Namen (`maybeAnswerCreature` → Persona-Prompt mit den letzten 8 Erinnerungen in den Worten
        // von ERINNERUNG_SATZ). Das Prädikat sucht in der Antwort den Bezug auf eine erlebte Tat und keinen auf eine fremde (das
        // Nachplappern aller Taten fällt). Soll ≥ 70 % der Antworten. Trocken am Kopf f1400431 gegen einen Stub-Anbieter auf
        // 11434 (Mechanik, kein Modell): 11 von 12 GRÜN, Mutante V1_MUTANTE=gedaechtnis-leer 0 von 12 ROT; vorher (main a03b7b06)
        // trug der Prompt „Deine Erinnerungen: ." — 0 von 12. Das Urteil mit qwen3:4b-instruct fällt am Laptop.
        befehl: [
            "bash",
            "-c",
            OLLAMA_AN +
                "node scripts/diag-v1-pfad.cjs --korpus --seele --echt; e=$?; " +
                "node -e \"console.log('KORPUS ' + Object.keys(require('./spec/abnahme/ki-korpus.json').seele.saetze).length)\"; " +
                OLLAMA_AUS,
        ],
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const anb = anbieterVon(out);
            if (!anb || anb.traegt !== true) return KEIN_ANBIETER(anb);
            const n = +((/^KORPUS (\d+)$/m.exec(out) || [])[1] || 0);
            const s = zeilen(out).map((l) => /^\s*(✓|✗)( ungültig)?( BRUCH)? „(.+?)“ .*? · (.*)$/.exec(l)).filter(Boolean);
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \(echter Anbieter\).*? · seele · /m.exec(out);
            const erf = s.filter((x) => x[1] === "✓");
            return {
                gruen: !!wort && n > 0 && s.length === n && erf.length / n >= 0.7,
                zahl:
                    erf.length + " von " + s.length + "/" + n + " Antworten nennen eine erlebte Tat (Soll 70 %) gegen qwen3:4b-instruct @ " +
                    "127.0.0.1:11434" + (wort ? "" : ", keine WORT-Zeile des echten Anbieters (Exit " + lauf.exit + ")") +
                    (erf.length ? ", z. B. „" + erf[0][4] + "“ → " + erf[0][5].slice(0, 90) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "1 = mit lokalem Modell nennen ≥ 70 % der Antworten aus dem Gesprächs-Korpus eine der letzten 8 Erinnerungen, an einem Gerät",
    },
    {
        kriterium: "ki.K4",
        staffel: 1,
        geraet: "headless",
        // die Regeln des Modells in der Wertung (ki-seele-regeln): der Teil regeln des Korpus (6 Sätze, die Regeln verlangen) über den
        // echten Chat-Pfad gegen das lokale Modell, verteilt über einen Selbstlauf von 600 s Welt-Zeit im Zeitraffer, in dem der Nexus
        // je 3 s eine Regel schreibt; gezählt je Drittel und Quelle (source llm gegen nexus): neu · erneuert · verfallen · verdrängt.
        // Der Gegenlauf mischt das δ (je Quelle im Wechsel +1 / −1 über die Baseline des Rewards, der Nexus schreibt je Sekunde, die
        // Kappe verdrängt). GRÜN, wenn die WORT-Zeile des echten Anbieters ohne Täter steht: je Drittel eine neue LLM-Regel, LLM- und
        // Nexus-Regeln gewertet und verdrängt, im Gegenlauf je Quelle die Heiler um ≥ 0,25 öfter erneuert als die Schädlinge
        // (regelVerdict). Trocken am Kopf f1400431 gegen einen Stub-Anbieter (Mechanik, kein Modell): LLM-Regeln 2/2/2 je Drittel,
        // Gegenlauf δ+ 0,75 · δ− 0,00 GRÜN; Mutante V1_MUTANTE=wertung-aus ROT (0,00 · 0,00). Das Urteil mit Modell fällt am Laptop.
        befehl: [
            "bash",
            "-c",
            OLLAMA_AN + "node scripts/diag-v1-pfad.cjs --korpus --regeln --echt; e=$?; " + OLLAMA_AUS,
        ],
        env: OLLAMA_ENV,
        gpu: false,
        zeit: false,
        minuten: 12,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const anb = anbieterVon(out);
            if (!anb || anb.traegt !== true) return KEIN_ANBIETER(anb);
            const wort = /^\s*(✅|❌) WORT der Korpus über den echten Chat-Pfad \(echter Anbieter\).*? · regeln · .*?(?: — Täter: (.*))?$/m.exec(out);
            let R = null;
            try {
                R = JSON.parse((/^REGELN (.*)$/m.exec(out) || [])[1]);
            } catch (_e) {
                R = null;
            }
            if (!wort || !R) return { gruen: false, zahl: "keine WORT- oder REGELN-Zeile des echten Anbieters (Exit " + lauf.exit + ")" };
            const sum = (k) => [...R.echt, ...R.gegen].reduce((a, d) => a + (d[k] || 0), 0);
            const fort = (q) => sum(q + "erneuert") + sum(q + "verfallen") + sum(q + "verdraengt");
            const heil = (v) => (sum("llm" + v + "erneuert") / Math.max(1, fort("llm" + v))).toFixed(2);
            return {
                gruen: wort[1] === "✅" && lauf.exit === 0,
                zahl:
                    "LLM-Regeln neu je Drittel " + R.echt.map((d) => d["llm neu"] || 0).join("/") + ", erneuert " + sum("llm erneuert") +
                    " · verfallen " + sum("llm verfallen") + " · verdrängt " + sum("llm verdraengt") + " (Nexus " + sum("nexus erneuert") + " · " +
                    sum("nexus verfallen") + " · " + sum("nexus verdraengt") + "); Gegenlauf: erneuert LLM δ+ " + heil("+ ") + " · δ− " +
                    heil("- ") + ", verdrängt " + (sum("llm+ verdraengt") + sum("llm- verdraengt")) + (wort[2] ? ", Täter " + wort[2].slice(0, 160) : ""),
            };
        },
        pfad: KI_KORPUS_PFAD,
        quelle: "1 = im Selbstlauf mit Modell registrierte LLM-Regeln (source llm) werden von derselben Fitness gewertet und verdrängt wie Nexus-Regeln, gegen den Gegenlauf mit gemischtem δ",
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
        zeit: false,
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
    // ── bauen.K1 Staffel 2 ── L-BILD (diag-werkstatt-weg --echt, bauen-k1-bild): je Weg (Werkstatt · Rezeptbuch · Hotbar) ein
    // frischer Browser auf der Karte (leeres Profil: Platte und Foundry kalt), die Welt steht unter der Bühne; je Lage mit Bau
    // (schöpfer · frieden mit Material · pfad) × Werk (Eiche · Haus · GT · Teil) × Sicht (Ego · Third) über echte Eingaben die Zeit
    // von der ersten Eingabe bis zum von der GPU abgearbeiteten Bild, in dem jede L0-Senke des Werks für die Kamera der Szene zog
    // (der Haken am Render des Takts, gezählt am Backend); der Bau-Hash des Bilds gleicht dem L0-Bau derselben Anfrage im Werk.
    // kalt = der erste Bau des Werks im frischen Profil (4 je Weg), warm = jeder weitere (20 je Weg); p95 je Weg und Klasse.
    {
        kriterium: "bauen.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            "rm -f artifacts/werkstatt-weg/weg.json; node scripts/diag-werkstatt-weg.cjs --echt; e=$?; " +
                "cp artifacts/werkstatt-weg/weg.json \"$PUNKTE_AUS\" 2>/dev/null; exit $e",
        ],
        env: { WERKSTATT_WEG_PORT: "{PORT}", PUNKTE_AUS: "{AUS}" },
        gpu: true,
        zeit: true,
        minuten: 10,
        urteil: (j, lauf) => {
            if (!j || j.gestartet !== true || j.bild !== true || j.echt !== true || !j.wege)
                return { gruen: false, zahl: "keine Rohdatei des Bild-Wegs auf der Karte (Exit " + lauf.exit + ")" };
            const p95 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.ceil(0.95 * a.length) - 1] : null);
            const rot = [];
            let n = 0, imBild = 0;
            const jeWeg = WEG_WEGE.map((weg) => {
                const jeKlasse = { kalt: [], warm: [] };
                for (const lage of WEG_LAGEN)
                    for (const werk of WEG_WERKE)
                        for (const sicht of WEG_SICHTEN) {
                            const e = ((((j.wege[lage] || {})[weg] || {})[werk] || {})[sicht]) || null;
                            n++;
                            const ms = e && Array.isArray(e.zeiten) ? e.zeiten[4] : null; // [eingabe, steht, l0, bild, gpu] ab der ersten Eingabe
                            const ok = e && !e.fehler && !(e.unecht > 0) && e.eingaben > 0 && e.eingaben <= 3 && Number.isFinite(ms) && e.bau && e.bau === e.soll;
                            if (!ok) {
                                rot.push(weg + " · " + lage + " · " + werk + " · " + sicht);
                                continue;
                            }
                            imBild++;
                            jeKlasse[e.kalt ? "kalt" : "warm"].push(ms);
                        }
                const k = p95(jeKlasse.kalt), w = p95(jeKlasse.warm);
                if (!(k <= 1000) || !(w <= 1000)) rot.push(weg + " p95 kalt " + k + " · warm " + w + " ms");
                return weg + " kalt " + k + " · warm " + w + " ms (" + jeKlasse.kalt.length + "+" + jeKlasse.warm.length + ")";
            });
            return {
                gruen: n === 72 && imBild === n && !rot.length,
                zahl: imBild + "/" + n + " Werke in L0 im Bild (Bau-Hash = L0-Bau, ≤ 3 Eingaben) · p95 bis zum Bild " + jeWeg.join(" · ") +
                    (rot.length ? " · ROT: " + rot.slice(0, 6).join(" · ") + (rot.length > 6 ? " … (" + rot.length + ")" : "") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-seele.js",
            "stamm/siedlung-*.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/stoff-*.js",
            "stamm/bild-*.js",
            "stamm/dirigent-*.js",
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
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/ausgabe-aufnahme.cjs",
        ],
        quelle: "2 = ≤ 3 Eingaben und p95 ≤ 1 s bis zum ersten Ausgabe-Bild in L0, kalt und warm, beide Geräte",
    },
    // ── bauen.K2 ── W9 SLOT (gate:haus-welt, Phase grund; w3t-grund): ein Haus in der Gestalt eines Dorf-Hauses (Rezept, Stempel,
    // Same und Gier des Dorf-Slots), gesetzt über die Werkstatt (Phantom, confirmBuild) auf dem ersten Ort mit Gefälle ≥ 15 % über
    // ±4 m — sein Erdbau (`haus:`) byte-gleich dem Plan v2 (fachwerk `ortPlan`) des Dorf-Slots aus dem Gedächtnis des Orts an
    // seinem Ort und Boden, Platte · Grund · Vorplatz, der Vorplatz ist Boden (Dichte ±0,3 m), über der Diele keine Erde. Der
    // Null-Renderer misst Plan und Dichte, nie das Bild (Lehre 16); Bild und Gang des Leibs zählen Staffel 2 und siedlung.K1.
    {
        kriterium: "bauen.K2",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=grund"],
        env: { ...SOFT, HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        zeit: false,
        minuten: 8, // lokal 61–83 s (eine Welt, Phase grund), die Farm ~3,5× langsamer
        urteil: (j) => {
            const w9 = (j && j.w9) || {};
            const sl = w9.slot;
            if (!sl || !sl.typ) return { gruen: false, zahl: "kein gesetztes Haus am Hang (W9 Slot " + JSON.stringify(sl || null) + ")" };
            const h = (w9.haeuser || []).find((x) => x.id === "w9-slot");
            const k = (h && h.koerper) || [];
            const [dichte, proben] = ["dichte", "proben"].map((f) => k.reduce((a, b) => a + (b[f] || 0), 0));
            const arten = String(sl.arten || "");
            return {
                gruen:
                    sl.hang >= 0.15 && sl.byte === true && sl.boden === 1 && /\bgrund\b/.test(arten) &&
                    /\/vorplatz/.test(arten) && proben > 0 && dichte === 0,
                zahl:
                    `${sl.typ} am Hang ${Number(sl.hang).toFixed(3)} (Soll ≥ 0,15) · Erdbau ${arten} · byte-gleich dem Dorf-Slot ` +
                    `${sl.byte} · Vorplatz-Boden ${sl.boden} (Erde 0,3 m unter, keine 0,3 m über der Platte) · Erde über der Diele ${dichte}/${proben}`,
            };
        },
        pfad: [
            "fachwerk-core.js",
            "gelaende-core.js",
            "voxel-worker.js",
            "foundry-bruecke.js",
            "stamm/gelaende-*.js",
            "stamm/studio-bruecke.js",
            "stamm/siedlung-*.js",
            "stamm/werkstatt-bauen.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = Erdbau und Vorplatz wie ein Dorf-Slot derselben Gestalt (Byte-Vergleich der ortPlan-Ausgabe), am Hang mit Gefälle ≥ 15 %",
    },
    {
        kriterium: "bauen.K2",
        staffel: 2,
        geraet: "headless",
        befehl: null,
        grund:
            "Kein Werkzeug im Spiel-Baum: ortPlan kennt keinen festen Fremd-Slot (die Gasse wird im Ortsradius nicht um das " +
            "gesetzte Haus umgelegt), und der Keller ist ohne Anti-Clip-Hub nicht erreichbar — die Linse dafür fehlt mit dem Gesetz.",
        quelle: "2 = im Ortsradius Slot des Plans mit umgelegter Gasse, Keller über die Treppe ohne Anti-Clip-Hub",
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
        zeit: false,
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
        // DER PRÜF-SATZ (diag-werkstatt-weg, spec/pruefsatz/bauen-k3.json): zehn Konstruktionen über den Bau-Weg des Spielers
        // (Hotbar, Phantom, confirmBuild) — das Stabile steht nach 150 Takten, das Instabile stürzt sichtbar (die gezeichnete
        // Lage kippt ≥ 30° oder fällt ≥ 0,3 m), bricht und nennt den Grund (die EINE Statik beim Setzen, `_werkGesetzSetzen`);
        // Wirkung: Brennglas mittags und nachts, das Rad rollt den Hang hinab (der Klotz nicht), die Schale hält Regen (die mit
        // Loch nicht), der Gründer legt den Aufruhr (der Stapel derselben Steine nicht). Am main 833bbc24: Statik 5/10, Wirkung 3/5.
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const l = zeilen(lauf.stdout).find((x) => /^\s*(✅|❌) Prüf-Satz über den Bau-Weg/.test(x));
            if (!l) return { gruen: false, zahl: "keine Prüf-Satz-Zeile (Exit " + lauf.exit + ")" };
            const m = l.match(/Statik (\d+)\/10 · Wirkung (\d+)\/5/);
            if (!m) return { gruen: false, zahl: "keine Zahl in der Prüf-Satz-Zeile" };
            return {
                gruen: /^\s*✅/.test(l) && m[1] === "10" && m[2] === "5",
                zahl: `Statik ${m[1]}/10 richtig, Wirkung ${m[2]}/5`,
            };
        },
        pfad: [
            "stamm/bau-*.js",
            "stamm/werkstatt-*.js",
            "stamm/siedlung-satz.js",
            "stamm/siedlung-bauten.js",
            "stamm/koerper-fahrt.js",
            "stamm/bild-himmel.js",
            "stamm/wasser-hydro.js",
            "stamm/gelaende-kollision.js",
            "stamm/studio-bruecke.js",
            "stamm/vegetation-baum.js",
            "stamm/dienst.js",
            "stamm/daten.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "vehicle-core.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "2 = ein Prüf-Satz aus 10 Konstruktionen (5 stabil, 5 instabil) wird in der Welt 10/10 richtig geurteilt mit sichtbarer Folge, und 5 Wirkungs-Konstruktionen halten 100 %",
    },
    // gate:fall-waechter (B) DER TURM (bauen-k4-editform): je Klick der rechten Maus am Canvas (`tryMousePlace`, der Blick senkrecht
    // nach unten) ein Block r 3,5 unter dem Spieler — Hub je Block, die Sohlen der Fuß-IK neben dem gebauten Mesh (`_bodenSichtAt`),
    // die Höhe über dem Gelände; Save, Reload: die Edits des Turms, ihre Hülle (Löcher), Sohle und Stand. Gelesen wird die B-ZAHL
    // (die Probe B allein: ein rotes O1–O3 des Wächters ist nicht der Turm).
    {
        kriterium: "bauen.K4",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fall-waechter.cjs"],
        env: { ...SOFT, FALL_WAECHTER_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 13, // 27.10.: der Fall-Wächter wuchs mit bk4-turm (sechs Türme à 20 Klicks) auf 162–291 s lokal, die Station läuft ~3,5× langsamer (ek-schleife)
        urteil: (j, lauf) => {
            const b = jsonZeile(lauf.stdout, /^\s*B-ZAHL \{/);
            if (!b) return { gruen: false, zahl: "keine B-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const [n, f] = [b.nach || {}, (x) => (Number.isFinite(x) ? x.toFixed(2) : "?")];
            const befunde = b.befunde || ["keine Befund-Liste"];
            return {
                gruen:
                    befunde.length === 0 && b.bloecke === 20 && b.hoehe >= 60 && b.sohle <= 0.15 &&
                    n.edits === 20 && n.loecher === 0 && n.sohle <= 0.15,
                zahl:
                    `Turm aus ${b.bloecke}/20 Blöcken über die Maus ${f(b.hoehe)} m über dem Gelände · Hub ${f((b.hub || [])[0])}–` +
                    `${f((b.hub || [])[1])} m je Block · Sohle ≤ ${f(b.sohle)} m neben dem Mesh · nach dem Reload ${n.edits} Edits, ` +
                    `${n.loecher} Löcher, Sohle ${f(n.sohle)} m` + (befunde.length ? " — " + befunde.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/koerper-*.js",
            "stamm/dirigent-*.js",
            "stamm/speicher-*.js",
            "stamm/kampf.js",
            "stamm/feld-dsl.js",
            "stamm/werkstatt-bauen.js",
            "stamm/dienst.js",
            "scripts/diag-fall-waechter.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände (Fuß ≤ 0,15 m über dem Mesh) und hält über den Reload (0 Löcher)",
    },
    // gate:fall-waechter (B2) DER TURM AUF DACH, FELS UND BRÜCKE (bk4-turm): derselbe Turm wie #1 über die Maus, je in Ego und
    // Third, im Haus der Werkstatt (vom Dachboden durch das Dach), auf der Felsdecke über der nächsten Spalte und auf dem Deck der
    // Brücke des Prüf-Satzes — die Sohlen neben der obersten Fläche (`_bodenSichtAt`); dann der Spieler 320 m fern: die
    // Lage-Bytes des Fern-Rings tragen die Krone, ein Block auf sie (`voxel_fill`) steht ≤ 1 s Spielzeit in ihnen (byte-Diff);
    // Reload: jeder Edit, kein Loch. Gelesen wird die B2-ZAHL. Gerät headless: die Lage des Rings ist eine CPU-Geometrie (der
    // Fern-Faden rechnet sie, `fernKrone`) — das Bild auf Radeon und GTX misst die Station nicht.
    {
        kriterium: "bauen.K4",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-fall-waechter.cjs"],
        env: { ...SOFT, FALL_WAECHTER_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 13,
        urteil: (j, lauf) => {
            const b = jsonZeile(lauf.stdout, /^\s*B2-ZAHL \{/);
            if (!b) return { gruen: false, zahl: "keine B2-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const [tuerme, befunde, f] = [b.tuerme || [], b.befunde || ["keine Befund-Liste"], (x) => Number(x).toFixed(2)];
            const je = tuerme.map((t) => {
                const g = t.ring || {};
                const sohle = Math.max(...(t.bloecke || []).map((k) => k[1]));
                return t.fehler
                    ? `${t.wo}: ${t.fehler}`
                    : `${t.wo} ${f(t.hoehe)} m, Sohle ≤ ${f(sohle)} m, Ring ${f(g.vor)}/${f(g.krone)} m, Edit nach ${g.takte} Takten (${g.bytes} Bytes)`;
            });
            return {
                gruen: befunde.length === 0 && tuerme.length === 6 && tuerme.every((t) => !t.fehler),
                zahl: je.join(" · ") + (befunde.length ? " — " + befunde.slice(0, 3).join(" · ") : ""),
            };
        },
        pfad: [
            "gelaende-core.js",
            "voxel-worker.js",
            "stamm/gelaende-*.js",
            "stamm/bild-sicht.js",
            "stamm/koerper-*.js",
            "stamm/dirigent-*.js",
            "stamm/speicher-*.js",
            "stamm/kampf.js",
            "stamm/feld-dsl.js",
            "stamm/werkstatt-bauen.js",
            "stamm/dienst.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-fall-waechter.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/welt-orte.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = auch auf Dach, Fels und Brücke (oberste Fläche, `_bodenSichtAt`), der Fern-Ring zeigt den Edit ≤ 1 s (byte-Diff), Ego und Third, beide Geräte",
    },
    // ── bauen.K5 ── L-VERBEN (diag-werkstatt-weg, bauen-k5-verben): je Werk über die Werkstatt gesetzt (das Tor über die Hotbar: die
    // Werkstatt fertigt kein Portal), über die Taste benutzt — Haus: W von 8 m vor der Tür bis hinter die Schwelle, der gezeichnete
    // Türflügel dreht > 29° (die Tür-Zeile reist in der Hülle) · Wagen (GT): E, W bis 5 m, E · Tor: E öffnet das Portal · Brücke (das
    // Teil-Werk des Prüf-Satzes, kein Gesetzbuch trägt eine Welt-Brücke): W von Deck-Ende zu Deck-Ende auf dem Deck. Leiter und Bank
    // trägt kein Gesetzbuch: offen, benannt. Am main 4a5f5e2c 3/6 (die Tür des gesetzten Hauses dreht 0°), am Zweig 4/6. Gerät
    // headless wie bauen.K1/K3 (derselbe Befehl): die Linse urteilt Verhalten im Null-Renderer, eine Karten-Station verlangte ein
    // Bild auf der Karte (GPU-Wand).
    {
        kriterium: "bauen.K5",
        staffel: 1,
        geraet: "headless",
        befehl: WEG_BEFEHL,
        env: WEG_ENV,
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const v = j && j.verben;
            if (!v) return { gruen: false, zahl: "keine Verben in weg.json (Exit " + lauf.exit + ")" };
            const werke = ["Haus", "Wagen", "Tor", "Brücke", "Leiter", "Bank"];
            const ja = werke.filter((w) => v[w] && v[w].steht === 1 && v[w].verb === true && !v[w].fehler);
            const nein = werke
                .filter((w) => !ja.includes(w))
                .map((w) => w + " (" + (v[w] ? v[w].fehler || v[w].warum || "steht nicht" : "kein Gesetzbuch trägt das Werk") + ")");
            return {
                gruen: ja.length === werke.length,
                zahl: ja.length + "/" + werke.length + " Werke tragen ihr Verb über die Taste" + (nein.length ? " — offen: " + nein.join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-*.js",
            "stamm/netz-portal.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-*.js",
            "stamm/vegetation-baum.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/kampf.js",
            "stamm/dirigent-*.js",
            "index.html",
            "fachwerk-core.js",
            "vehicle-core.js",
            "porta-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = von 6 gesetzten Werken (Haus, Wagen, Tor, Brücke, Leiter, Bank) ist jedes Verb aus KIND_POLICY (betreten, drive, portal, sitzen, klettern) über die echte Eingabe nutzbar, an einem Gerät",
    },
    // Staffel 2 (bauen-k5-verben 57f568bd): L-VERBEN je Herkunft — die Werkstatt (das Tor über die Hotbar) · der Satz an die KI (Enter, der
    // Satz, Enter → maybeAnswerWithLlm, die Antwort ein fester DSL-Text: spawn_studio mit dem Wort hinter dem Art-Präfix, das eigene
    // Werk spawn_blueprint) · geteilt (der Teilen-Knopf der Werkstatt, sein Code getippt in den Chat → empfangeWerk) — × Ego und
    // Third × 6 Werke, benutzt über die Taste; `--verben` fährt nur L-VERBEN, mit echtem Renderer (die Karte). Das Haus in Third:
    // die Kamera steht hinter dem Spieler, das Haus bleibt bis zur Schwelle in Stufe 1 (K36), die die Tür offen bäckt — dort zählt
    // der Eintritt durch die offene Tür, die der Tür-Takt hält (`_tuerRec`), nicht ihr Drehen. Cloud headless (Null-Renderer)
    // 26/36 → 36/36 (Wurzel `_werkFuss`: spawn_blueprint stellte das Werk in die Fußhöhe des Spielers).
    {
        kriterium: "bauen.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        befehl: [
            "bash",
            "-c",
            "rm -f artifacts/werkstatt-weg/weg.json; node scripts/diag-werkstatt-weg.cjs --verben; e=$?; " +
                "cp artifacts/werkstatt-weg/weg.json \"$PUNKTE_AUS\" 2>/dev/null; exit $e",
        ],
        env: { WERKSTATT_WEG_PORT: "{PORT}", PUNKTE_AUS: "{AUS}" },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            const je = j && j.verbenJe;
            if (!je) return { gruen: false, zahl: "keine verbenJe in weg.json (Exit " + lauf.exit + ")" };
            const [teile, nein] = [[], []];
            let [ja, n] = [0, 0];
            for (const h of ["werkstatt", "ki", "geteilt"])
                for (const s of ["Ego", "Third"]) {
                    let k = 0;
                    for (const w of ["Haus", "Wagen", "Tor", "Brücke", "Leiter", "Bank"]) {
                        const e = ((je[h] || {})[s] || {})[w];
                        n++;
                        if (e && e.steht === 1 && e.verb === true && !e.fehler) k++;
                        else nein.push(`${h} · ${s} · ${w} (${e ? e.fehler || e.warum || "steht nicht" : "nicht gelaufen"})`);
                    }
                    ja += k;
                    teile.push(`${h} ${s} ${k}/6`);
                }
            return {
                gruen: lauf.exit === 0 && ja === n,
                zahl:
                    `${ja}/${n} Herkunft × Sicht × Werk tragen ihr Verb über die Taste (${teile.join(" · ")})` +
                    (nein.length ? " — offen: " + nein.slice(0, 6).join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/werkstatt-*.js",
            "stamm/koerper-*.js",
            "stamm/netz-*.js",
            "stamm/feld-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/siedlung-*.js",
            "stamm/vegetation-baum.js",
            "stamm/bau-*.js",
            "stamm/studio-*.js",
            "stamm/kampf.js",
            "stamm/dirigent-*.js",
            "stamm/stoff-material.js",
            "index.html",
            "fachwerk-core.js",
            "vehicle-core.js",
            "porta-core.js",
            "foundry-core.js",
            "foundry-bruecke.js",
            "spec/pruefsatz/bauen-k3.json",
            "scripts/diag-werkstatt-weg.cjs",
            "scripts/lib/stamm.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/software-gpu.cjs",
        ],
        quelle: "2 = auch für KI-gesetzte und geteilte Werke, Ego und Third, beide Geräte",
    },
    // ── studios.K5 ── das Probe-Gesetzbuch (Fixture-Kern in spec/) über die Werkstatt in der Welt (gate:nervensystem E)
    {
        kriterium: "studios.K5",
        staffel: 1,
        geraet: "headless",
        befehl: ["node", "scripts/diag-nervensystem.cjs"],
        env: { ...SOFT, NERV_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 2,
        urteil: (j, lauf) => {
            const e = jsonZeile(lauf.stdout, /^E-ZAHL \{/);
            if (!e) return { gruen: false, zahl: "keine E-ZAHL-Zeile (Exit " + lauf.exit + ")" };
            const lod = (e.lod || []).map((x) => "L" + x.ist + " " + x.tris).join(" · ");
            const taeter = e.taeter || [];
            return {
                gruen: lauf.exit === 0 && taeter.length === 0,
                zahl:
                    `${e.bauplaene}/3 Baupläne · Stufen ${lod || "keine"} △ · Kosten ${(e.kosten || []).map((k) => k.klasse).join("/") || "keine"} · ` +
                    `Neuladen ${e.geladen === true ? "steht" : "fehlt"} · der Wirt nennt die Art ${e.nennt}×` +
                    (taeter.length ? " — " + taeter.join(" · ") : ""),
            };
        },
        pfad: [
            "stamm/",
            "index.html",
            "cores.manifest.json",
            "*-core.js",
            "foundry-bruecke.js",
            "worlds/neuntes-buch/",
            "worlds/huelle/huelle.js",
            "worlds/terrain/lib/",
            "signaling-server.js",
            "scripts/diag-nervensystem.cjs",
            "scripts/diag-atlas.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "1 = ein Probe-Gesetzbuch (Fixture-Kern in spec/ mit PARAMS_BY_KIND und Bauer) steht über die Werkstatt in der Welt mit LOD-Kette, Kosten-Leiste und Speicher-Rundlauf, `git diff stamm/` = 0",
    },
    // gate:nervensystem E2: je Weg der Bau-Hash der gezeigten Stufe (Werkstatt · KI-Satz mit festem DSL-Text, das Prompt lehrt
    // das Wort · Foundry build-asset L0–L2 = die gezeigten Stufen · P2P: der Mitspieler baut das Werk byte-gleich), der Atlas
    // (`--find neuntes`) nennt die EINE Quelle, der Wirt nennt die Art 0×
    {
        kriterium: "studios.K5",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-nervensystem.cjs"],
        env: { ...SOFT, NERV_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 4,
        urteil: (j, lauf) => {
            const e = jsonZeile(lauf.stdout, /^E-ZAHL \{/);
            if (!e || !Array.isArray(e.wege)) return { gruen: false, zahl: "keine Wege in der E-ZAHL (Exit " + lauf.exit + ")" };
            const auf = e.wege.filter((w) => w.ok).length;
            return {
                gruen:
                    lauf.exit === 0 && !(e.taeter || []).length && auf === 4 && e.atlas === "worlds/neuntes-buch/stele-core.js" && e.nennt === 0,
                zahl:
                    `${auf}/4 Wege (${e.wege.map((w) => `${w.ok ? "✓" : "✗"} ${w.weg} ${w.bau || "kein Bau"}`).join(" · ")}) · ` +
                    `Atlas ${e.atlas || "kein Gesetzbuch"} · der Wirt nennt die Art ${e.nennt}×`,
            };
        },
        pfad: [
            "stamm/",
            "index.html",
            "cores.manifest.json",
            "*-core.js",
            "foundry-bruecke.js",
            "signaling-server.js",
            "worlds/neuntes-buch/",
            "worlds/huelle/huelle.js",
            "worlds/terrain/lib/",
            "scripts/diag-nervensystem.cjs",
            "scripts/diag-atlas.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
        quelle: "2 = auf allen Wegen (Werkstatt, KI-Satz, Foundry, P2P), und der Atlas nennt seine EINE Quelle",
    },
];

// die fahrbaren Stationen sind die Liste, die Staffeln ohne Werkzeug (befehl: null, grund) stehen daneben in `fehlt`
module.exports = alle.filter((st) => st.befehl !== null);
module.exports.fehlt = alle.filter((st) => st.befehl === null);
