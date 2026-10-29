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

// studios.K1 aus demselben Lauf (REGLER_BEFEHL): je Teil die Zeilen-Zahl (`Regler-wirkt Teil N (…): Y PARAMS-Zeilen`), die
// toten (`  TOT <name> — …`) und gebrochenen (`❌ BRICHT <name>`) beim Namen, die Bild-Schwelle des Selbsttests (das
// Schlupfloch „0,1 mm am Hash": ein Hash allein zählt nie) und die Baum-Zeilen (die Art tree in der Reduktion der Stufen-Probe)
function k1Lesen(lauf) {
    const out = String(lauf.stdout || "");
    const teile = [...out.matchAll(/^Regler-wirkt Teil (\d) \(.*?\): (\d+) PARAMS-Zeilen .*?· (\d+) Zeilen an ihrem Leser der Welt/gm)];
    const tot = [...out.matchAll(/^ {2}TOT (\S+) — (.*)$/gm)].map((m) => [m[1], m[2]]);
    const bricht = [...out.matchAll(/^❌ BRICHT (\S+) — /gm)].map((m) => m[1]);
    const zeilen = teile.reduce((n, m) => n + Number(m[2]), 0);
    const bild = /^✅ SELBST-TEST Bild-Schwelle: 0,1 mm .* → tot · 3 cm .* → wirkt/m.exec(out);
    return {
        teile: teile.length,
        zeilen,
        wirkt: zeilen - tot.length - bricht.length,
        leser: teile.reduce((n, m) => n + Number(m[3]), 0),
        tot,
        bricht,
        bild: bild ? bild[0].replace(/^✅ SELBST-TEST Bild-Schwelle: /, "") : null,
        baum: /^STUFEN \(B2c, pipeline\.K3\): .*Reduktion je Art .*\btree L1\/L0/m.test(out),
        exits: [...out.matchAll(/^TEIL (\d) EXIT (\d+)/gm)].map((m) => +m[2]),
    };
}
const k1Zahl = (k) =>
    k.wirkt + "/" + k.zeilen + " Zeilen von PARAMS_BY_KIND wirken am Bild bzw. Ohr (" + (k.zeilen ? ((100 * k.wirkt) / k.zeilen).toFixed(1) : "–") +
    " %, davon " + k.leser + " an ihrem Leser der Welt) · " + (k.bild ? "Bild-Schwelle " + k.bild : "OHNE Bild-Schwelle (der Hash allein zählt nie)") +
    (k.tot.length ? " · tot " + k.tot.map(([n, g]) => n + " (" + (/(\d+(?:\.\d+)?) %/.exec(g) || ["", "0"])[1] + " %)").join(", ") : "") +
    (k.bricht.length ? " · BRICHT " + k.bricht.join(", ") : "") + " · Baum-Zeilen " + (k.baum ? "gemessen" : "keine in PARAMS_BY_KIND") +
    " · Exits " + k.exits.join("/");

// DIE K4-PROBE (studios.K4, Zweig w3w-studios-koord): das Skript im Koordinations-Baum (bericht/2910-w3w-studios/skripte/k4-bild.cjs)
// fährt in der warmen Welt der Sitzung (Werkbank {PORT}+20000) je Mesh-Studio dasselbe Werk in Bühne und Welt — die Bühne nennt es
// über ihren Knopf „In der Welt ansehen" (die Übergabe der Hülle), die Welt setzt es über den EINEN Übergabe-Kanal; Pose = die
// Vorschau-Kamera der Welt (Gier 0,6 · Neigung 0,32 · fov 45, Rahmen-Gesetz `_workshopRahmen`), beide aus dem Ausgabe-Pfad;
// Bild-Differenz über der Vereinigung der Masken (ΔLuma > 18 oder nur eine Seite), dazu die Albedo-Tafel beider Seiten je Studio.
const K4_BEFEHL = [
    "bash",
    "-c",
    `set -u; K=$(cygpath -m '{KOORD}'); A=$(cygpath -m '{AUS}'); export WERKBANK_PORT=$(({PORT}+20000)); node "$K/bericht/2910-w3w-studios/skripte/k4-bild.cjs" "$A" {PORT}`,
];
const K4_STUDIOS = ["garage", "portale", "schmiede", "fachwerk", "terrain", "koerperstudio", "tetrapoda"];
const k4Zahl = (j) => {
    const s = (j && j.studios) || {};
    const gruen = K4_STUDIOS.filter((id) => s[id] && s[id].gruen === true);
    return {
        gruen,
        zahl:
            gruen.length + "/7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo Labor/Welt im Rand 0,10 (" + (j.geraet || "Gerät ungenannt") + ") · " +
            K4_STUDIOS.map((id) => {
                const z = s[id] || {};
                return id + " " + (z.differenz && z.differenz.anteil != null ? (100 * z.differenz.anteil).toFixed(1) + " %" : "–") +
                    "/" + (z.albedo && z.albedo.max != null ? z.albedo.max : "–") + (z.gruen ? "" : z.grund ? " [" + String(z.grund).slice(0, 90) + "]" : "");
            }).join(" · ") + ((j.fehler || []).length ? " · " + j.fehler.join(" | ").slice(0, 200) : ""),
    };
};
const K4_PFAD = [
    "worlds/huelle/",
    "worlds/garage/",
    "worlds/portale/",
    "worlds/schmiede/",
    "worlds/fachwerk/",
    "worlds/terrain/",
    "worlds/koerperstudio/",
    "worlds/tetrapoda/",
    "*-core.js",
    "foundry-bruecke.js",
    "stamm/werkstatt-vorschau.js",
    "stamm/werkstatt-bauen.js",
    "stamm/netz-portal.js",
    "stamm/studio-*.js",
    "stamm/siedlung-*.js",
    "stamm/stoff-*.js",
    "stamm/bild-*.js",
    "stamm/dirigent-*.js",
    "spec/farbe/albedo-tafel.json",
    "scripts/werkbank.cjs",
    "scripts/diag-albedo-tafel.cjs",
    "scripts/lib/albedo-tafel.cjs",
    "scripts/lib/licht-linsen.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/welt-boot.cjs",
    "scripts/lib/software-gpu.cjs",
];

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

// ───────────────────────── DIE PROBEN IN DER SITZUNG (29.10., stationen/sitzung-seite.js) ─────────────────────────
// Das Gesetz des Schöpfers: eine Fahrt durch jedes System ≤ 30 min samt Dauerlast — keine Station bootet mehr einen eigenen Browser.
// Die Linse des Spiels läuft als Bibliothek (`H.linse`) im Browser der Welt der Sitzung; geschrumpft ist nur der Lauf.
const { probeBefehl, ANKUNFT_PROBE, ANKUNFT_AUSNAHME } = require("./sitzung-seite.js");

// DIE STUDIOS (studios.K2#2 · K3#2, Zwillinge): der Gang der Linse diag-studio-huelle (`gang`: H3 die Folge, H8 die Kosten-Leiste mit
// der Bank `?bank=12`, H7 die Sitzung mit dem Neuladen) über die acht Studios — je Studio eine Seite im Browser der Sitzung, geliefert
// vom save-server der Sitzung (welt-boot `statikServer` und `starteBrowser` still ersetzt); die Nebenwelten (H6, ohne Urteil dieser
// Stationen) fallen aus dem Gang, je Studio 5 Griffe statt 20 (p95 aus 5 ist ihr Größtes). Bis 29.10. ein eigener Browser je Lauf:
// Radeon e18195be 2,27 min, 4abae42d 3,5 min (K2#2), K3#2 6 min Soll. Die Herkunft teilt den localStorage mit der Welt (die
// Sitzung leert ihn am Ende): mutiert.
async function probeStudios(H) {
    const { page, browser } = await H.verbinde();
    const adapter = await page.evaluate(async () => {
        const a = navigator.gpu && (await navigator.gpu.requestAdapter());
        const i = (a && a.info) || {};
        return a ? { vendor: i.vendor || "?", architecture: i.architecture || "?" } : { fehlt: "kein Adapter" };
    });
    const server = {
        lausche: async () => server,
        zeige: (seite, frist, rest = "index.html", warte = "domcontentloaded") =>
            seite.goto("http://localhost:" + H.S + "/" + rest, { waitUntil: warte, timeout: frist }),
        close: () => {},
    };
    // jede Seite im Fenster der Linse (starteBrowser ohne viewport: puppeteer 800 × 600) — die Zeit je Griff hängt an der Fläche
    const neueSeite = async () => {
        const p = await browser.newPage();
        await p.setViewport({ width: 800, height: 600 });
        return p;
    };
    const derSitzung = { newPage: neueSeite, close: async () => {}, adapter };
    const L = H.linse("scripts/diag-studio-huelle.cjs", ["gang", "GRIFFE"], {
        argv: ["--engine"],
        stumm: { statikServer: () => server, starteBrowser: async () => derSitzung },
        ersetze: [
            ['const NEBENWELTEN = ["skeleton", "fluid", "translated"];', "const NEBENWELTEN = [];"],
            ["const GRIFFE = 20;", "const GRIFFE = 5;"],
        ],
    });
    await L.gang();
    return { griffe: L.GRIFFE, adapter };
}
const STUDIO_PROBE = probeBefehl(probeStudios, 75);
const STUDIO_AUSNAHME = "acht Studio-Seiten je mit Laden, 1,5 s Ruhe der Linse, Kosten-Leiste mit Bank, 5 Griffen bis zum Bild und dem Neuladen — je Studio ~6 s";

// DER BILD-WEG (bauen.K1#2): die Linse diag-werkstatt-weg mit `--echt` (`wegHelfer` mit dem Haken am Render des Takts, `wegLauf` über
// echte Eingaben) in der Welt der Sitzung — die Seite neu (die Foundry der Seite leer: der erste Bau jedes Werks ist kalt), die Bühne
// (Mittag · Sonne · Sommer), dann 8 Läufe: jedes Werk zweimal (kalt, warm), jeder Weg mit kalt und warm, Lage und Sicht im Wechsel.
// Bis 29.10. drei frische Browser (je Weg ein leeres Profil) × 24 Läufe = 72 (Soll 10 min, Radeon b3f9ae95 43,7 min).
const BILD_FAELLE = [
    ["werkstatt", "schöpfer", "Eiche", "Ego"],
    ["rezeptbuch", "frieden mit Material", "Haus", "Third"],
    ["hotbar", "pfad", "GT", "Ego"],
    ["werkstatt", "frieden mit Material", "Teil", "Third"],
    ["rezeptbuch", "pfad", "Eiche", "Third"],
    ["hotbar", "schöpfer", "Haus", "Ego"],
    ["werkstatt", "pfad", "GT", "Ego"],
    ["hotbar", "frieden mit Material", "Teil", "Third"],
];
async function probeBildWeg(H) {
    const { path } = H;
    const L = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "WERKE", "TEILE", "PHASEN"], { argv: ["--echt"] });
    const { buehne } = require(path.resolve("scripts/lib/welt-boot.cjs"));
    const { page } = await H.verbinde();
    await page.setViewport({ width: 1280, height: 720 }); // das Fenster der Linse (--echt); die Grundstellung stellt 1920 × 1080 zurück
    await H.lade(page);
    await page.evaluate(() => window.__weltDa((w) => !!(w.state.renderer && w.state.renderer.backend)));
    await H.ereignisStrom(page);
    const { frei } = await page.evaluate(L.probe, { nurOrt: true });
    await buehne(page);
    await H.binnen(page.evaluate(() => window.__weltStehtNach()), 15000);
    await page.evaluate(L.wegHelfer, { frei, teile: { eigen_huette: L.TEILE.eigen_huette }, bild: true });
    let offen = true;
    H.beimAbbau(() => offen && L.bauWeg(page, "ende"));
    const j = (H.teil = { gestartet: true, bild: true, echt: true, wege: {}, faelle: [], frei });
    j.konsum = await L.bauWeg(page, "konsum");
    for (const [weg, lage, werk, sicht] of H.seite.FAELLE) {
        if (H.rest() < 6) break;
        const e = await H.binnen(L.wegLauf(page, { lage, weg, name: L.WERKE[werk], sicht }), (H.rest() - 4) * 1000, { fehler: "Frist der Probe" });
        (((j.wege[lage] ||= {})[weg] ||= {})[werk] ||= {})[sicht] = e;
        j.faelle.push([weg, lage, werk, sicht]);
        const z = e.zeiten || [];
        console.log(
            `  [bild] ${weg} · ${lage} · ${werk} · ${sicht} ${e.kalt ? "kalt" : "warm"} ${z[4]} ms, Bau-Hash ${e.bau === e.soll ? "=" : "≠"} L0 · ` +
                `${L.PHASEN.map((k, i) => k + " " + (z[i] - (z[i - 1] || 0))).join(" · ")} ${e.fehler || ""}`
        );
        await H.binnen(page.evaluate(() => window.__weltStehtNach()), Math.min(8000, (H.rest() - 4) * 1000));
    }
    offen = false;
    Object.assign(j, await L.bauWeg(page, "ende"));
    return j;
}
const BILD_PROBE = probeBefehl(probeBildWeg, 60, { FAELLE: JSON.stringify(BILD_FAELLE) });

// DIE VERBEN (bauen.K5#2): die Linse diag-werkstatt-weg mit `--verben` (`wegHelfer`, `wegLauf`: gesetzt, dann das Verb über die echte
// Taste — Haus W bis hinter die Schwelle, Wagen E · W · E, Tor E, Brücke W über das Deck, Leiter W bis aufs Podest, Bank E) in der Welt
// der Sitzung, der Loop des Spiels läuft. Je Herkunft × Sicht ein Werk, jedes Werk einmal (6 Läufe). Bis 29.10. ein eigener Browser
// mit dem ganzen Raster 3 × 2 × 6 = 36 Läufe (Radeon b3f9ae95 7,14 min).
const VERB_FAELLE = [
    ["werkstatt", "Ego", "Haus"],
    ["werkstatt", "Third", "Tor"],
    ["ki", "Ego", "Wagen"],
    ["ki", "Third", "Leiter"],
    ["geteilt", "Ego", "Bank"],
    ["geteilt", "Third", "Brücke"],
];
async function probeVerben(H) {
    const L = H.linse("scripts/diag-werkstatt-weg.cjs", ["probe", "wegHelfer", "bauWeg", "wegLauf", "TEILE", "VERBEN"], { argv: ["--verben"] });
    const { page } = await H.verbinde();
    await page.setViewport({ width: 1280, height: 720 }); // das Fenster der Linse (--verben); die Grundstellung stellt 1920 × 1080 zurück
    await H.ereignisStrom(page);
    // der Loop des Spiels läuft wie im Spiel (die Werkbank hält ihn zwischen ihren Befehlen an)
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop((t) => window.anazhRealm._gameLoopTick(t)));
    H.beimAbbau(() => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null)));
    const { frei } = await page.evaluate(L.probe, { nurOrt: true });
    await page.evaluate(L.wegHelfer, { frei, teile: { eigen_huette: L.TEILE.eigen_huette }, bild: false });
    let offen = true;
    H.beimAbbau(() => offen && L.bauWeg(page, "ende"));
    await L.bauWeg(page, "teile", L.TEILE);
    await L.bauWeg(page, "wort");
    const j = (H.teil = { verbenJe: {}, faelle: [], frei });
    for (const [h, sicht, werk] of H.seite.FAELLE) {
        if (H.rest() < 6) break;
        const [name, verb, weg] = L.VERBEN[werk];
        const e = await H.binnen(L.wegLauf(page, { lage: "schöpfer", weg: h === "werkstatt" ? weg || h : h, name, sicht, verb }), (H.rest() - 4) * 1000, {
            fehler: "Frist der Probe",
        });
        ((j.verbenJe[h] ||= {})[sicht] ||= {})[werk] = e;
        j.faelle.push([h, sicht, werk]);
        const ok = e.steht === 1 && e.verb === true && !e.fehler;
        console.log(`  ${ok ? "✅" : "❌"} ${h} · ${sicht} · ${werk} × ${verb}${ok ? "" : " — " + (e.fehler || e.warum || "steht nicht")} · ${H.sek()} s`);
    }
    offen = false;
    await L.bauWeg(page, "ende");
    return j;
}
const VERB_PROBE = probeBefehl(probeVerben, 60, { FAELLE: JSON.stringify(VERB_FAELLE) });

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
        // IN DER SITZUNG (29.10., `probeStudios`, Zwilling von studios.K3#2): 5 Griffe je Studio — jeder trägt sein Bild (`j.griffe`).
        probe: { ...STUDIO_PROBE, mutiert: true, ausnahme: STUDIO_AUSNAHME },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const karte = /=== H7 DIE SITZUNG — Saat \d+, die Zeit geurteilt \(Karte\)/.test(out);
            const N = j && j.griffe > 0 ? j.griffe : Infinity; // ohne Ausgabe der Probe trägt kein Studio seine Griffe
            const je = {};
            for (const l of zeilen(out)) {
                const t = /^\s{2}⏱ (\S+)\s+Griff → Bild p95 Gesetz-Wert (\S+) ms · Neubau (\S+) ms · (\d+) Griffe mit Bild · Neuladen (\d+)\/(\d+)/.exec(l);
                if (t && SEITEN[t[1]]) je[t[1]] = Object.assign(je[t[1]] || {}, { u: +t[2], n: +t[3], mit: +t[4], bleibt: +t[5] > 0 && t[5] === t[6] });
                const g = /^\s{2}(\S+)\s+\d+ Anfragen · .*?Schieber ([^,\s]+) → ([^,\s]+),.*, A → ([^,\s]+), B → ([^,\s]+)/.exec(l);
                if (g && SEITEN[g[1]]) je[g[1]] = Object.assign(je[g[1]] || {}, { ab: g[2] !== g[3] && g[4] === g[2] && g[5] === g[3] });
            }
            const s = Object.keys(SEITEN).map((id) => ({ id, ...(je[id] || {}) }));
            const klasse = (z, k, max) => !(z[k] > max); // „–“ (keine Zeile der Klasse im Studio) ist NaN und zählt nicht
            const zeit = s.filter((z) => z.mit === N && klasse(z, "u", 200) && klasse(z, "n", 1000));
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
                    ", Neubau höchstens " + n.v + " ms " + n.id + ", je Studio " + (j && j.griffe) + " Griffe) · Neuladen " + bleibt + "/8 · A/B " + ab + "/8",
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
            "save-server.js",
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
    // ── studios.K3#2 ── das Thermometer ganz (w3u-leiste): dieselbe Kosten-Zeile des Gangs trägt je Stufe die gezählten Befehle und
    // das VRAM (r184 weitet 8/16-Bit-Felder samt Index auf 32 Bit) mit ihren Gegenzahlen — Befehle aus renderer.info, VRAM aus der
    // Speicher-Karte des Renderers je Werk-Puffer (r184 info.memoryMap, r128 am GL-Kontext) —, die GPU-ms der Zeitstempel des
    // Abschnitts und auf der Karte die Bank-Runde von gpu-bank (`?bank=12`, die EINE Bank der Hülle); beim Klang je Ort des
    // Umwelt-Gesetzes die Audio-Graph-ms (offline, je Quantum). GPU-ms haben eine Gegenzahl nur gegen eine GPU-gebundene Bank
    // (gpu-bank: über × 1,15) — der Zähl-Abschnitt (1×1, viele Befehle) kann CPU-gebunden sein, dann steht die Stufe ohne.
    // IN DER SITZUNG (29.10., `probeStudios`, Zwilling von studios.K2#2): derselbe Gang im Browser der Sitzung, die Kosten-Zeile je Studio.
    {
        kriterium: "studios.K3",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...STUDIO_PROBE, mutiert: true, ausnahme: STUDIO_AUSNAHME },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            const je = {};
            for (const l of zeilen(lauf.stdout)) {
                const m = /^\s{2}(\S+)\s+\d+ Anfragen · .* · Kosten (\[.*\])\s*$/.exec(l);
                if (m && SEITEN[m[1]]) je[m[1]] = JSON.parse(m[2]);
            }
            if (!Object.keys(je).length) return { gruen: false, zahl: "keine Kosten-Zeile des Gangs (Exit " + lauf.exit + ")" };
            const ab = (a, b) => Math.abs(a / b - 1) <= 0.05;
            // je Stufe der erste Täter (null: wahr) — Dreiecke, Befehle, VRAM gegen ihre Gegenzahl, GPU-ms gegen die Bank
            const taeter = (k) =>
                !ab(k.leiste, k.gezeichnet) ? "△ " + k.leiste + "↔" + k.gezeichnet
                : !ab(k.befehle, k.befehleGezeichnet) ? "Befehle " + k.befehle + "↔" + k.befehleGezeichnet
                : !ab(k.vram, k.vramGpu) ? "VRAM " + k.vram + "↔" + k.vramGpu
                : !(+k.bank > 1.15 * k.bankCpu) ? "Bank " + k.bank + " ms nicht GPU-gebunden (CPU " + k.bankCpu + ")"
                : !ab(k.ms, k.bank) ? "GPU " + (k.ms || k.zeitFehlt) + " ms↔Bank " + k.bank
                : null;
            const mesh = Object.keys(SEITEN).filter((s) => s !== "klang");
            const ohne = [];
            let stufen = 0;
            for (const s of mesh) {
                const t = (je[s] || []).map((k) => taeter(k) && "L" + k.stufe + " " + taeter(k)).filter(Boolean);
                if (!(je[s] || []).length) ohne.push(s + " (keine Zeile)");
                else if (t.length) ohne.push(s + " " + t[0] + (t.length > 1 ? " (+" + (t.length - 1) + ")" : ""));
                else stufen += je[s].length;
            }
            const orte = je.klang || [];
            const imQuantum = orte.filter((k) => +k.audio <= +k.audioDeckel);
            const klang = orte.length > 0 && imQuantum.length === orte.length;
            return {
                gruen: !ohne.length && klang,
                zahl:
                    "Dreiecke, Befehle, VRAM und GPU-ms ±5 % in " + (mesh.length - ohne.length) + "/" + mesh.length + " Mesh-Studios (" +
                    stufen + " Stufen), Klang " + imQuantum.length + "/" + orte.length + " Orte im Quantum" +
                    (imQuantum.length ? " (Audio-Graph höchstens " + Math.max(...imQuantum.map((k) => +k.audio)).toFixed(3) + " ms)" : "") +
                    (ohne.length ? ", ohne " + ohne.join(", ") : ""),
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
            "spec/profiband/haushalt.json",
            "scripts/diag-studio-huelle.cjs",
            "scripts/lib/software-gpu.cjs",
            "scripts/lib/welt-boot.cjs",
            "save-server.js",
        ],
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
    // ist verschluckt (ROT); den gepflanzten Bruch fährt gate:boot-stage. IN DER SITZUNG (29.10., stationen/sitzung-seite.js
    // `probeAnkunft`, Zwilling von ankunft.K2#1/K3#1 und pipeline.K4#2): der Erst-Boot ist das kalte Laden mit leerer Herkunft bis zur
    // Ruhe der Foundry, der Zweit-Boot die Seite neu im warmen Browser (der Stand gesichert) — bis 29.10. zwei eigene Browser mit
    // einem Profil (Radeon b3f9ae95 10,61 min, davon 4,4 am Schloss).
    {
        kriterium: "pipeline.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { ...ANKUNFT_PROBE, mutiert: true, ausnahme: ANKUNFT_AUSNAHME },
        gpu: true,
        zeit: false,
        minuten: 1,
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
            "stamm/speicher-*.js",
            "save-server.js",
        ],
        quelle: "1 = build-asset kommt beim Zweit-Boot zu ≥ 95 % von der Platte",
    },
    // die Art-Zeile und der Kern-Wechsel (Stufe 2, w3u-platte): der Erst-Boot füllt ein frisches Profil, der Zweit-Boot nimmt
    // Blatt-Atlas, Dorf-Export und Karten je ganz von der Platte (die Liefer-Marke `_foundryLiefer` je Art: Bau-Ereignisse im
    // Werk UND im Haupt-Faden — die Karte backt dort, ein Blatt-Atlas, den der Haupt-Faden malt, zählt neu), der dritte Boot
    // serviert fachwerk-core mit einem Kommentar mehr (sein Gesetz-SHA springt): nur die Leser von fachwerk bauen neu, jeder
    // fremde Neubau dessen, was die Platte trug, und jeder Leser, der noch von ihr kommt, ist ROT beim Namen (`wechselUrteil`
    // in diag-boot-stage, die Schale `_foundrySchale` stempelt jede Lieferung mit dem Gesetz-SHA der Kerne, die sie liest).
    // IN DER SITZUNG (29.10., `probeAnkunft`): der dritte Boot ist die Seite neu, während die Skripte von fachwerk auf der Platte des
    // Spiel-Baums einen Kommentar mehr tragen (der save-server liefert no-cache mit ETag, der Browser holt sie neu; sie kehren sofort
    // zurück) — bis 29.10. drei eigene Browser, der dritte an einem eigenen Server, der den Kern wandelte.
    {
        kriterium: "pipeline.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...ANKUNFT_PROBE, mutiert: true, ausnahme: ANKUNFT_AUSNAHME },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const out = String(lauf.stdout || "");
            const art = /^\s*(?:✅|❌) LIEFERUNG je Art: (.+)$/m.exec(out);
            const kw = /^\s*(?:✅|❌) KERN-WECHSEL fachwerk: (\d+) Leser neu · fremd (\d+)(.*) · alt (\d+)(.*)$/m.exec(out);
            if (!art || !kw) return { gruen: false, zahl: "keine Art-Zeile oder kein Kern-Wechsel (Exit " + lauf.exit + ")" };
            const je = {};
            for (const m of art[1].matchAll(/([\w-]+) (\d+)\/(\d+) (\d+) ms/g)) je[m[1]] = { platte: +m[2], n: +m[3] };
            const ganz = ["blatt-atlas", "dorf-export", "karte"].every((k) => je[k] && je[k].n > 0 && je[k].platte === je[k].n);
            const [leser, fremd, alt] = [+kw[1], +kw[2], +kw[4]];
            return {
                gruen: ganz && leser > 0 && fremd === 0 && alt === 0,
                zahl:
                    "Zweit-Boot von der Platte " + art[1] + " · Kern-Wechsel fachwerk: " + leser + " Leser neu, fremd " + fremd +
                    kw[3] + ", alt " + alt + kw[5],
            };
        },
        pfad: [
            "stamm/studio-bruecke.js",
            "stamm/stoff-instanz.js",
            "stamm/vegetation-baum.js",
            "stamm/siedlung-ort.js",
            "foundry-bruecke.js",
            "cores.manifest.json",
            "scripts/diag-boot-stage.cjs",
            "scripts/lib/welt-boot.cjs",
            "save-server.js",
        ],
        quelle: "2 = jede Lieferung (Blatt-Atlas, Dorf-Export, Karten) 100 %, ein geänderter Kern-SHA baut nur seine Art neu (0 fremde Neubauten), beide Geräte",
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
    // IN DER SITZUNG (29.10., `probeBildWeg`): die Seite neu im Browser der Sitzung (die Foundry der Seite leer: der erste Bau jedes
    // Werks ist kalt), 8 Läufe (BILD_FAELLE: jedes Werk kalt und warm, jeder Weg mit beiden Klassen, Lage und Sicht im Wechsel).
    {
        kriterium: "bauen.K1",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...BILD_PROBE, mutiert: true, ausnahme: "8 Bauten über echte Eingaben bis zum Bild in L0, dazu die Seite neu (kalt) und je Bau die Ruhe der Welt danach" },
        gpu: true,
        zeit: true,
        minuten: 1,
        urteil: (j, lauf) => {
            if (!j || j.gestartet !== true || j.bild !== true || j.echt !== true || !j.wege)
                return { gruen: false, zahl: "keine Ausgabe des Bild-Wegs auf der Karte (Exit " + lauf.exit + ")" };
            const p95 = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.ceil(0.95 * a.length) - 1] : null);
            const rot = [];
            let n = 0, imBild = 0;
            const jeWeg = WEG_WEGE.map((weg) => {
                const jeKlasse = { kalt: [], warm: [] };
                for (const [w, lage, werk, sicht] of BILD_FAELLE)
                    if (w === weg) {
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
                gruen: n === BILD_FAELLE.length && imBild === n && !rot.length,
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
            "save-server.js",
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
            // der Plan v2 eines Ein-Slot-Orts mit Tür: Platte, Grund, Vorplatz — byte-gleich dem Dorf-Slot trägt er alle drei
            return {
                gruen:
                    sl.hang >= 0.15 && sl.byte === true && sl.boden === 1 && sl.splats === 3 && proben > 0 && dichte === 0,
                zahl:
                    `${sl.typ} am Hang ${Number(sl.hang).toFixed(3)} (Soll ≥ 0,15) · Erdbau ${sl.splats} Splats (Platte, Grund, ` +
                    `Vorplatz) · byte-gleich dem Dorf-Slot ` +
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
    // Staffel 2 ── W11 FREMD-SLOT (gate:haus-welt, Phase fremd; w3u-fremdslot): ein Haus mit Keller in der Gestalt eines Dorf-
    // Hauses, gesetzt über die Werkstatt (Phantom, confirmBuild) auf die Gasse des Drehbuch-Dorfs, 14 m von jedem Haus des Plans —
    // sein Erdbau (`haus:`) byte-gleich dem Ein-Slot-Plan des Dorf-Slots, und der Plan v2 des Orts (fachwerk `ortPlan`, ctx.fest)
    // legt Gasse und Feldweg um seine Platte: im Raster 5 × 5 des Grundrisses vorher Punkte auf einer Weg-Form der Wege-Karte des
    // Orts, nachher 0, der Plan nennt den Fremd-Slot (`fest`); der Gang des Leibs (W10, Sim-Schritt, W-Taste: Tür, Kopf der
    // Kellertreppe, Keller, zurück, beide Ränder des Laufs) erreicht den Keller ohne Hub > 0,3 m je Schritt. Der Null-Renderer
    // misst Plan, Formen, Dichte und Gang, nie das Bild (Lehre 16).
    {
        kriterium: "bauen.K2",
        staffel: 2,
        geraet: "headless",
        befehl: ["node", "scripts/diag-haus-welt.cjs", "--phasen=fremd"],
        env: { ...SOFT, HAUS_WELT_JSON: "{AUS}" },
        gpu: false,
        zeit: false,
        minuten: 6, // lokal 18–37 s (eine Welt, Phase fremd)
        urteil: (j) => {
            const w = (j && j.w11) || {};
            const h = ((j && j.haeuser) || []).find((x) => x.fremd);
            const g = h && h.gang;
            if (!w.typ || !g) return { gruen: false, zahl: "kein Haus auf der Gasse (W11 " + JSON.stringify(w) + ")" };
            const keller = (g.fehlt || []).filter((x) => x.startsWith("keller"));
            return {
                gruen:
                    w.vorher > 0 && w.nachher === 0 && w.byte === true && w.fest >= 1 && g.keller && g.hub <= 0.3 && !keller.length,
                zahl:
                    `${w.typ} auf der Gasse: Grundriss-Punkte auf der Gasse ${w.vorher} → ${w.nachher} (von 25) · Erdbau ` +
                    `byte-gleich dem Ein-Slot-Plan ${w.byte} · Fremd-Slots im Plan ${w.fest} · Gang in den Keller ` +
                    `${g.keller && !keller.length ? "erreicht" : "verfehlt"}, Hub ${Number(g.hub).toFixed(2)} m je Schritt ` +
                    `(Soll ≤ 0,3)${keller.length ? " · " + keller.join(", ") : ""}`,
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
            "stamm/koerper-bewegung.js",
            "scripts/diag-haus-welt.cjs",
            "scripts/lib/welt-boot.cjs",
            "scripts/lib/stamm.cjs",
        ],
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
    // IN DER SITZUNG (29.10., `probeVerben`): je Herkunft × Sicht ein Werk, jedes Werk einmal (VERB_FAELLE, 6 Läufe) in der Welt der
    // Sitzung mit laufendem Loop; jeder Lauf trägt sein Verb, sonst ROT beim Namen.
    {
        kriterium: "bauen.K5",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { ...VERB_PROBE, mutiert: true, ausnahme: "6 Werke gesetzt und über die echte Taste in Echtzeit benutzt (Gehen bis hinter die Schwelle, Fahren 5 m, über das Deck, aufs Podest)" },
        gpu: true,
        zeit: false,
        minuten: 1,
        urteil: (j, lauf) => {
            const je = j && j.verbenJe;
            if (!je) return { gruen: false, zahl: "keine verbenJe in der Ausgabe der Probe (Exit " + lauf.exit + ")" };
            const nein = [];
            let ja = 0;
            for (const [h, s, w] of VERB_FAELLE) {
                const e = ((je[h] || {})[s] || {})[w];
                if (e && e.steht === 1 && e.verb === true && !e.fehler) ja++;
                else nein.push(`${h} · ${s} · ${w} (${e ? e.fehler || e.warum || "steht nicht" : "nicht gelaufen"})`);
            }
            return {
                gruen: lauf.exit === 0 && ja === VERB_FAELLE.length,
                zahl:
                    `${ja}/${VERB_FAELLE.length} Herkunft × Sicht × Werk tragen ihr Verb über die Taste (je Herkunft × Sicht ein Werk, jedes Werk einmal)` +
                    (nein.length ? " — offen: " + nein.join(" · ") : ""),
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
    // ── studios.K1 ── jeder Griff wirkt sichtbar oder hörbar (Zweig w3w-studios): gate:regler-wirkt urteilt am BILD des Werks
    // (`bauBild`: die Vorschau-Pose unter dem Belichtungs-Gesetz der Welt, ≥ 1 % der Gestalt-Pixel mit ΔLuma > 18) bzw. an
    // seinem Leser der Welt (Membran · Ritt · Ohr). Zwilling von pipeline.K3 (REGLER_BEFEHL): EIN Lauf, headless (die Brücke
    // baut in JS, das Raster rechnet die CPU — geräteunabhängig)
    {
        kriterium: "studios.K1",
        staffel: 1,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const k = k1Lesen(lauf);
            if (k.teile !== 3) return { gruen: false, zahl: k.teile + " von 3 Teilen mit Zeilen-Zahl (Exits " + k.exits.join("/") + ")" };
            return { gruen: !!k.bild && k.zeilen > 0 && k.wirkt / k.zeilen >= 0.8, zahl: k1Zahl(k) };
        },
        pfad: REGLER_PFAD,
        quelle: "1 = ≥ 80 % der Zeilen von PARAMS_BY_KIND wirken am Bild bzw. Ohr",
    },
    {
        kriterium: "studios.K1",
        staffel: 2,
        geraet: "headless",
        befehl: REGLER_BEFEHL,
        env: { ...SOFT, REGLER_WIRKT_PORT: "{PORT}" },
        gpu: false,
        zeit: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const k = k1Lesen(lauf);
            if (k.teile !== 3) return { gruen: false, zahl: k.teile + " von 3 Teilen mit Zeilen-Zahl (Exits " + k.exits.join("/") + ")" };
            return { gruen: !!k.bild && k.baum && k.zeilen > 0 && k.wirkt === k.zeilen, zahl: k1Zahl(k) };
        },
        pfad: REGLER_PFAD,
        quelle: "2 = 100 % — der Nenner ist die Zeilen-Zahl bei der Messung (eine Ratsche, die nur wächst, mit den Baum-Zeilen)",
    },
    // ── studios.K4 ── Studio = Welt im Bild: die K4-Probe in der warmen Welt der Sitzung (K4_BEFEHL), Staffel 1 auf einer Karte
    {
        kriterium: "studios.K4",
        staffel: 1,
        geraet: ["radeon", "gtx"],
        probe: { sek: 900, befehl: K4_BEFEHL },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            if (!j || !j.studios) return { gruen: false, zahl: "kein K4-JSON (Exit " + lauf.exit + "): " + String(lauf.stdout || "").split(/\r?\n/).filter((l) => /^K4 /.test(l)).slice(-2).join(" | ").slice(0, 300) };
            const k = k4Zahl(j);
            return { gruen: k.gruen.length >= 3, zahl: k.zahl };
        },
        pfad: K4_PFAD,
        quelle: "1 = ≥ 3/7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo Labor/Welt im Rand 0,10",
    },
    {
        kriterium: "studios.K4",
        staffel: 2,
        geraet: ["radeon", "gtx"],
        probe: { sek: 900, befehl: K4_BEFEHL },
        gpu: true,
        zeit: false,
        minuten: 15,
        urteil: (j, lauf) => {
            if (!j || !j.studios) return { gruen: false, zahl: "kein K4-JSON (Exit " + lauf.exit + ")" };
            const k = k4Zahl(j);
            return { gruen: k.gruen.length === 7, zahl: k.zahl };
        },
        pfad: K4_PFAD,
        quelle: "2 = 7/7 auf beiden Geräten",
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
