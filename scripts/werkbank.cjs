// werkbank.cjs — DIE WERKBANK der Look-Arbeit: EINE Welt bleibt offen, Fragen gehen per Befehl hinein, eine Methode aus
// dem Arbeitsbaum wird in die laufende Seite getauscht, das Bild ist in Sekunden da.
//
//   node scripts/werkbank.cjs start [--port 4490] [--holz voll|nah|kienspan] [--ort <id>]  Welt + Steuer-Server (bleibt offen)
//   node scripts/werkbank.cjs umstellen <x> <z>            Spieler setzen, einschwingen
//   node scripts/werkbank.cjs umstellen --ort <id> [--pose p] [--sicht ego|third] an einen MESSORT (spec/profiband/haushalt.json
//                                                           `messorte`): Spieler, Blick, Dorf-Zug, Ort-Takt und Sicht; buehne betritt ihre Welt;
//                                                           mit `anlauf` schwingt der Ort dort ein (Gründung, Stadt), `dach` stellt aufs Dach
//   node scripts/werkbank.cjs bild <px> <py> <pz> <lx> <ly> <lz> [--datei f.png] [--w 640 --h 360] [--ziel name] [--wahl N]
//                                      [--uhr 0..1] [--wetter rainy] [--saison winter] Bühne + echter Frame (Ausgabe-Pfad)
//                                      [--klasse <regex>] [--spieler] [--abstand] [--ist <id>[:L<n>|:wirkung]] [--fov v]
//                                                           DIE KLASSEN IM BILD (spec/abnahme/soll-tafel.json): Teilung, Rauschen und Maße je Klasse;
//                                                           `--ist` schreibt in die Tafel, `--arm <m>` die Kamera <m> vor die Fläche des Ego-Blicks
//   node scripts/werkbank.cjs methode <name> [--terrain] [--quelle datei]  Methode aus dem Stamm live tauschen
//                                                           (`--quelle` ein anderer Stand; --terrain das Chunk-Material neu)
//   node scripts/werkbank.cjs eval '<js>'                  Funktionsrumpf in der Seite (r = Welt, T = THREE)
//   node scripts/werkbank.cjs albedo --tafel [--datei f.json] [--ordner d]  DIE WELT-SEITE DER ALBEDO-TAFEL (je Klasse ihr Exemplar,
//                                                           jede Stufe zu jeder Uhr der Tafel; die Zählung je Mesh-Klasse fiel mit material-k3-stufen)
//                                                           (spec/farbe/albedo-tafel.json, Eichung 0,180; Nachzug diag-albedo-tafel.cjs --nachziehen)
//   node scripts/werkbank.cjs licht [--ist <id>]           DIE LICHT-BILANZ (18-%-Karte, je Licht; `--ist` in die Soll-Tafel)
//   node scripts/werkbank.cjs licht --luft [--ort genesis] [--eigen] | --selbsttest  DIE LUFT IM BILD (Koschmieder je Kanal, Farbton,
//                                                           Sonnenseite, fernes Weiß; Rand und Kante an Hügel und Gipfel)
//   node scripts/werkbank.cjs licht --laub [eiche,birke] [--ordner d] [--karte --uhr u,u] | --selbsttest  DAS LAUB IM GEGENLICHT
//   node scripts/werkbank.cjs licht --kontakt [--uhr 0.5,0.3] [--bilder d] | --selbsttest  DER KONTAKT-SCHATTEN (schatten.K1)
//   node scripts/werkbank.cjs licht --naesse [wiese,dorf] [--bilder d] [--datei f] | --selbsttest  DIE NÄSSE (wetter.K2)
//   node scripts/werkbank.cjs fernwald [--blicke nord,ost] DIE FERNWALD-LINSE (scripts/lib/fernwald-linse.cjs)
//   node scripts/werkbank.cjs zaehlen [px py pz lx ly lz] [--alle]  DER DRAW-ZÄHLER je Pass (scripts/lib/draw-zaehler.cjs)
//   node scripts/werkbank.cjs puffer [--top n]             DIE PUFFER-LINSE: jeder Geometrie-Puffer beim Halter nach GC
//   node scripts/werkbank.cjs puffer --gang [min]          DER GANG (profiband K5): Heap ≤ 5 MB/min, VRAM ≤ 2 MB zurück
//   node scripts/werkbank.cjs fluss                        DIE FLUSS-LINSE des Foundry-Kanals (scripts/lib/fluss-linse.cjs)
//   node scripts/werkbank.cjs diaet [frames] [--modus ruhe|drehen|gehen] [--tiere halten|frei] | diaet --selbsttest
//                                                           DIE DIÄT-LINSE: Arbeit der Observer-Diät und Bundles je Frame (scripts/lib/diaet-linse.cjs)
//   node scripts/werkbank.cjs takt [sek] [--ein s] [--wandern bahn|fahrt|aus] [--json datei] | takt --auswerten <x.roh.json>
//                                                           DIE TAKT-SPITZE je Methode beim Gehen oder Fahren (scripts/lib/haenger-linse.cjs)
//   node scripts/werkbank.cjs stand [n] [--ein s] [--ruhe max-s] [--regler voll|frei] [--tiere frei|halten] [--sim s]
//                                                           DIE STAND-LINSE: die Fege-Takte im Stand, Folge B A A B (scripts/lib/stand-linse.cjs)
//   node scripts/werkbank.cjs sicht [--ruhe n] [--sonne n] [--drehen n] [--dreh-grad g] [--gehen n] [--tag laeuft|steht]
//                                                           [--ein s] [--regler voll] DIE SICHT-LINSE je Frame im echten Loop (scripts/lib/sicht-linse.cjs)
//   node scripts/werkbank.cjs lauf [sek] [--ein s] [--regler frei|voll] [--tiere halten|frei|n] [--wetter w] [--ruhe max-s] [--wandern bahn|kreis]
//                                                           | lauf --selbsttest — DER ECHTE LAUF: Frame- und GPU-Zeit, Befehle, Dreiecke und VRAM je Frame und Pass;
//                                                           `kreis` geht eine Runde in [sek] Spiel-s und zählt die Tiere im Bild (`KREIS`, tiere.K5)
//   node scripts/werkbank.cjs latenz [--proben 50] [--sicht ego,third] [--verb gehen,wechsel,springen,einsteigen,hieb] [--json datei] | --selbsttest | --verzugprobe
//                                                           DIE LATENZ (leib.K1): Taste → erstes Bild mit bewegtem Leib, je Sicht × Verb, ROT über 50 ms
//   node scripts/werkbank.cjs haenger [sek] [--ein s] [--regler voll|frei] [--tiere frei|halten] [--wandern bahn|sprung]
//                                                           [--schwelle ms] [--probe] [--json datei] | haenger --auswerten <x.roh.json>
//                                                           DIE HÄNGER-LINSE: jeder Frame über der Schwelle mit Ursache (scripts/lib/haenger-linse.cjs)
//   node scripts/werkbank.cjs schirm [--datei f.png]         DER SCHIRM: das präsentierte Canvas nach 1 s echtem Loop
//   node scripts/werkbank.cjs fenster <w> <h>               Viewport wechseln wie ein Spieler (resize-Ereignis)
//   node scripts/werkbank.cjs gpu-bank [n] [--runden r]      DIE GPU-BANK: GPU-Zeit je Frame, n Frames ohne rAF
//   node scripts/werkbank.cjs zerlegen [--runden r] [--n frames] [--nur a,b] [--json datei] [--bilder [ordner]]
//                                                           [--selbsttest [--last iter]] DIE GPU-ZERLEGUNG je Verbraucher, ABBA (scripts/lib/zerlege-linse.cjs)
//   node scripts/werkbank.cjs ziele [--n frames] [--json datei] [--selbsttest]
//                                                           DER ZIEL-ZENSUS: jede GPU-Textur mit Erzeuger, Schreibern, Lesern (scripts/lib/ziel-zensus.cjs)
//   node scripts/werkbank.cjs shader [--nur <regex>] [--top n] [--ordner d]
//                                                           [--stoff boden [--gegen alt.wgsl] [--datei neu.wgsl] [--rauschprobe]] | shader --selbsttest
//                                                           DIE SHADER-KOSTEN je gezeichnetem Programm (scripts/lib/shader-kosten.cjs)
//   node scripts/werkbank.cjs band [--ort <id>] [--datei f.json] [--proben n] [--cap sek]
//                                                           DIE BAND-LINSE gegen Haushalt und Ratsche des Orts (spec/profiband/, scripts/lib/band-urteil.cjs)
//   node scripts/werkbank.cjs ratsche [--ort <id>] <band-*.json | messfolge-*.json …> [--nur vram] [--neu]
//                                                           DIE RATSCHE aus ≥ 4 Läufen eines Orts × Geräts × Sicht; `--neu` der Re-Mint (nur Node)
//   node scripts/werkbank.cjs gpu-fehler                     DIE GPU-FEHLER-LINSE nach `start --gpu-fehler` (scripts/lib/gpu-fehler.cjs)
//   node scripts/werkbank.cjs reload | status | stop
//
// DIE MESS-SERIE: jeder `start` fährt ein eigenes Browser-Profil (ERST-Boot), jedes `reload` einen ZWEIT-Boot; `--serie <name>`
// hält das Profil unter artifacts/werkbank/profil-<name>. `start --echt [--seite <url>]` fährt die ECHTE GPU im Fenster gegen den
// save-server (`npm start`, :4312), ohne `--echt` headless an der Weiche des Start-Rezepts (`[linse-gpu]` nennt den Adapter);
// Zeit-Urteile (band, gpu-bank) zählen nur mit `--echt` unter dem GPU-Schloss. `bild` nimmt py/ly mit `+` über dem Boden.
"use strict";
const { statikServer, werkbankRuf, werkbankTor, ROOT: root, selbsttestEnde, sleep, hauptLauf, pngDatei } = require("./lib/welt-boot.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { AUSGABE_INSTALL, wetterUrteil } = require("./lib/ausgabe-aufnahme.cjs");
const LL = require("./lib/licht-linsen.cjs");
const { ZAEHLER_INSTALL, FALTE_INSTALL, gangLauf } = require("./lib/draw-zaehler.cjs");
const { FLUSS_INSTALL } = require("./lib/fluss-linse.cjs");
const SICHT = require("./lib/sicht-linse.cjs");
const DIAET = require("./lib/diaet-linse.cjs");
const STAND = require("./lib/stand-linse.cjs");
const { FERNWALD_INSTALL } = require("./lib/fernwald-linse.cjs");
const { GPU_FEHLER_INSTALL, GPU_FEHLER_OBJEKT } = require("./lib/gpu-fehler.cjs");
const BAND = require("./lib/band-urteil.cjs");
const ZL = require("./lib/zerlege-linse.cjs");
const SK = require("./lib/shader-kosten.cjs");
const AT = require("./lib/albedo-tafel.cjs");
// DIE WIESE des Messorts: die EINE Messung und ihr Urteil, in die Seite getragen beim Umstellen
const { WIESE_INSTALL } = require("./lib/welt-orte.cjs");
// DER VRAM-ABGRIFF (jede GPU-Allokation beim Namen, dazu der Grund des Ziel-Zensus) — EINE Quelle für Werkbank und Gates.
const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const ZZ = require("./lib/ziel-zensus.cjs");
const HL = require("./lib/haenger-linse.cjs");

// DIE MESSUNG IN DIE SOLL-TAFEL (`bild --klasse … --ist <id>[:L<n>|:wirkung]`, `licht --ist <id>`): das Werkzeug
// schreibt, was es gemessen hat, in die EINE Tafel (spec/abnahme/soll-tafel.json, wie `--nachziehen` die Albedo-Tafel) — Ist
// und Täter rechnet die Linse daraus (abnahme-urteil `sollTafelUrteil`); von Hand steht dort keine Zahl.
const SOLL_TAFEL = path.join(root, "spec", "abnahme", "soll-tafel.json");
// der Ordner einer Datei, die das Werkzeug schreibt
const ordnerFuer = (datei) => fs.mkdirSync(path.dirname(datei), { recursive: true });
const jsonAb = (datei, o) => (ordnerFuer(datei), fs.writeFileSync(datei, JSON.stringify(o, null, 1)));
// die Ablage der Werkbank (artifacts/werkbank)
const ablage = (...teile) => path.join(root, "artifacts", "werkbank", ...teile);
// DER ORT DER BILDER DER TAFEL (abnahme-urteil `bildPfadFehler`): je Ziel `--ist <id>[:teil]` EIN Name unter
// artifacts/soll-tafel/ (gitignored, lokal) — Bild, Maske und Begleit-JSON nebeneinander
const sollAblage = (ziel, endung) => {
    const d = path.join(root, "artifacts", "soll-tafel");
    fs.mkdirSync(d, { recursive: true });
    return path.join(d, String(ziel).replace(/:/g, "-") + endung);
};
// der Stand des Arbeitsbaums für jedes Begleit-JSON: `gitStand` und der Code-Abdruck jeder Quelle (abnahme-urteil)
const AU = require("./lib/abnahme-urteil.cjs");
const { stammVersion, pruefsumme, kernStand, sollQuelle, gitStand } = AU.standLeser(root);
// DER EINE SCHUSS (W1-n1, abnahme-urteil `schussVon`): das erste Ziel von „a,b:L1,…" trägt den Schuss mit dem Abdruck der
// Quellen ALLER Ziele, jedes weitere NENNT es; geschrieben wird einmal, nach der Prüfung jeder Zeile
function sollIstSchreiben(ziele, messung) {
    const text = fs.readFileSync(SOLL_TAFEL, "utf8");
    const t = JSON.parse(text);
    const liste = String(ziele).split(",").filter(Boolean);
    const orte = liste.map((ziel) => [t.klassen.find((x) => x.id === ziel.split(":")[0]), ziel.split(":")[1], ziel]);
    for (const [k, teil, ziel] of orte)
        if (!k || (teil && teil !== "wirkung" && !/^L\d$/.test(teil)))
            throw new Error(`--ist ${ziel}: keine Klasse der Soll-Tafel oder Teil unbekannt (L<n> je Stufe, wirkung)`);
    // DER STAND (abnahme-urteil `messStand`): die Version des Stamms und die Prüfsumme jeder Quelle der Klasse, wie sie
    // beim Messen auf der Platte standen — ändert sich eine, ist das Ist veraltet
    messung.stand = Object.assign({}, messung.stand, { version: messung.stand.version || stammVersion() });
    messung.quellen = Object.fromEntries([...new Set(orte.flatMap(([k]) => k.quellen || []))].map((d) => [d, pruefsumme(d)]));
    orte.forEach(([k, teil], i) => {
        const s = i ? liste[0] : messung;
        if (teil === "wirkung") (k.wirkung = k.wirkung || {}).messung = s;
        // je Stufe ein Schuss (`milchweiss`: die Tore des Schusses in der Stufe L<n>)
        else if (teil) (k.mass.messung = Object(k.mass.messung) === k.mass.messung ? k.mass.messung : {})[teil] = s;
        else k.mass.messung = s;
    });
    // DER SCHREIBER PRÜFT (abnahme-urteil `sollIstAbweisung`): in die Tafel fällt nur, was die Linse liest — ein Schuss,
    // in dem die Klasse nicht zeichnete (der L1-Schuss 14 s nach dem Umstellen: Membran und Nebel ohne Tor), bricht laut
    const ab = AU.sollIstAbweisung(JSON.parse(text), t, sollQuelle());
    if (ab.length)
        throw new Error(`--ist ${ziele}: die Linse liest die Messung nicht — ${ab.join(" · ")} — die Tafel bleibt, wie sie war`);
    fs.writeFileSync(SOLL_TAFEL, tafelText(t) + "\n");
    return `${liste.join(", ")} → spec/abnahme/soll-tafel.json`;
}
// DIE TAFEL IN IHRER FORM (F1 + L2, Wachstums-Wand): eine Zahlen-Reihe steht auf EINER Zeile, und jede Teil-Klasse einer Messung
// (`klassen` unter einem `werkzeug`) steht auf EINER Zeile — eine Neumessung ersetzt ihre Zeilen, ein neues Maß-Feld wächst die
// Tafel nie
function tafelText(v, ein = "") {
    if (Array.isArray(v) && v.every((x) => x === null || typeof x !== "object")) return `[${v.map((x) => JSON.stringify(x)).join(", ")}]`;
    if (!v || typeof v !== "object") return JSON.stringify(v);
    const innen = ein + "    ";
    const jeZeile = (k) => k === "klassen" && v.werkzeug && v[k] && typeof v[k] === "object" && !Array.isArray(v[k]);
    const wert = (k) =>
        jeZeile(k) && Object.keys(v[k]).length
            ? "{\n" +
              Object.keys(v[k]).map((n) => `${innen}    ${JSON.stringify(n)}: ${JSON.stringify(v[k][n])}`).join(",\n") +
              "\n" +
              innen +
              "}"
            : tafelText(v[k], innen);
    const teile = Array.isArray(v)
        ? v.map((x) => innen + tafelText(x, innen))
        : Object.keys(v).map((k) => `${innen}${JSON.stringify(k)}: ${wert(k)}`);
    if (!teile.length) return Array.isArray(v) ? "[]" : "{}";
    return (Array.isArray(v) ? "[\n" : "{\n") + teile.join(",\n") + "\n" + ein + (Array.isArray(v) ? "]" : "}");
}
const argv = process.argv.slice(2);
const hat = (k) => argv.includes("--" + k);
const SELBST = hat("selbsttest"); // `<befehl> --selbsttest`: das Urteil ohne Welt
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
const SEITEN_PORT = PORT - 1;
// Das Holz-Profil der Welt: ohne Wahl erkennt sie swiftshader und fährt „kienspan" (ohne Schatten,
// kleiner Ring) — Kosten-Fragen für das Schöpfer-Holz stellen `--holz voll`.
const HOLZ = opt("--holz", process.env.WERKBANK_HOLZ || "");
const ECHT = hat("echt");
// DIE GPU-FEHLER-LINSE nur auf Zuruf (`start --gpu-fehler`): sie hüllt jeden Draw in eine JS-Probe — eine Zeit-Messung
// (lauf, gpu-bank, band) liefe sonst mit ihrer Last.
const GPU_FEHLER = hat("gpu-fehler");
// DER MESSORT VOR DEM BOOT (`start --ort <id>`): ein Ort ohne Dorf-Zug (`dorfZug: false` im Haushalt) sperrt den Auto-Zug ab
// dem ersten Skript der Seite — sonst käme ein im Boot losgegangener Auftrag danach an, und jeder Boot mäße eine andere Szene.
// `umstellen --ort` stellt den Ort, wie er im Haushalt steht — der Dorf-Ort schaltet den Zug dort wieder an.
const START_ORT = argv[0] === "start" ? opt("--ort", null) : null;
// DIE SEITE der echten Welt: `--seite` (oder WERKBANK_SEITE) hat EINE Bedeutung — die URL des save-servers
// (Ursprung, z. B. http://localhost:4312), nie eine Portnummer. Alles andere bricht laut ab, statt still eine
// falsche Adresse („5312/") zu bauen.
const ECHT_SEITE = (() => {
    const s = String(opt("--seite", process.env.WERKBANK_SEITE || "http://localhost:4312"));
    if (!/^https?:\/\/[^/\s]+\/?$/.test(s))
        throw new Error(`--seite/WERKBANK_SEITE erwartet die URL des save-servers (http://host:port), nicht „${s}"`);
    return s.replace(/\/$/, "");
})();
const SERIE = opt("--serie", process.env.WERKBANK_SERIE || "");

// ── Client ──────────────────────────────────────────────────────────────────────────────────────
const rufe = (weg, nutzlast) => werkbankRuf(PORT, weg, nutzlast);
const evalRuf = (code) => rufe("/eval", { code });
const umstellen = (o) => rufe("/umstellen", o);
const ergebnis = (a) => a.ergebnis || { fehler: a.fehler || "kein Ergebnis" };
// DAS ENDE eines Befehls: die Antwort (ein Satz oder das JSON) und der Exit — 0 nur, wenn `gruen`; ein Fehler ist nie grün
const endeMit = (t, gruen) => (console.log(typeof t === "string" ? t : JSON.stringify(t, null, 1)), process.exit(gruen ? 0 : 1));
// `--eigen`: die Welt als Kind von `start` am EINEN Tor (welt-boot `werkbankTor`, bereit am Ereignis), gestoppt am Ende
const eigeneWelt = async (tor) => (hat("eigen") ? ((tor = werkbankTor(PORT)), await tor.bereit, tor.stop) : null);
// `--datei`: das Ergebnis dorthin; das Ende eines Urteils `{ urteil, befunde }` unter seinem Namen
const dateiAb = (o) => opt("--datei") && jsonAb(path.resolve(opt("--datei")), o);
const urteilEnde = (name, u) => endeMit(`${name} ${u.urteil}${u.befunde.length ? ": " + u.befunde.join(" | ") : ""}`, u.urteil === "GRUEN");

// Eine Klassen-Methode (4 Leerzeichen eingerückt, prettier-Form, auch ein Gang) aus dem Quelltext schneiden.
function methodeAusQuelle(quelle, name) {
    const kopf = new RegExp(`\\n    (async |\\*)?${name}\\(([^)]*)\\) \\{\\n`);
    const m = kopf.exec(quelle);
    if (!m) return null;
    const start = m.index + 1;
    const ende = quelle.indexOf("\n    }\n", start);
    if (ende < 0) return null;
    const text = quelle.slice(start, ende + 6);
    const art = m[1] === "*" ? "function*" : `${m[1] || ""}function`;
    return `(${art} ${name}(${m[2]}) {${text.slice(text.indexOf("{\n") + 1)})`;
}

// DER ECHTE LAUF (Seiten-Kontext): der Spiel-Loop läuft über rAF wie im Spiel; nach dem Einschwingen
// zählt jeder Frame — Intervall (rAF-Zeitstempel = was der Spieler sieht), CPU-Takt, GPU-Zeit des Frames
// (r184-Pool löst den LETZTEN Frame auf, Summe aller Pässe), Befehle/Dreiecke je gerendertem Frame und je Pass
// (renderer.info, die Quelle von HUD und Flugschreiber). Die Bühne (Mittag · Sonne · Sommer) und stille Tiere halten den Vergleich
// gleich; „voll" hebt die Regler-Decke, der PID wächst loadScale → 1 (die volle Welt, wie die Cloud maß).

function lauf(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const rend = st.renderer;
        // DIE BÜHNE: Mittag · Sonne · Sommer, oder das Wort des Spielers (`--wetter stormy`) und n Tiere frei im Ring
        // (`--tiere 50`) — Profiband K1 „Sturm"
        const tiereN = /^\d+$/.test(k.tiere) ? Number(k.tiere) : 0;
        if (!tiereN && k.tiere !== "frei" && k.tiere !== "halten") throw new Error(`--tiere ${k.tiere}: halten · frei · <n>`);
        window.__buehne({ wetter: k.wetter, tiere: tiereN });
        // DIE WETTER-WACHE: der Zustand nach der Bühne (Wort und Uhr des Auto-Zugs — eine Uhr unter 0 ist eingefroren, der Halt)
        // und die Marke im Buch des Wetter-Spions. Dreht im Lauf ein Schreiber das Wetter, schreibt einer am
        // `_setWeather` vorbei, taut die Uhr oder ist ein eingefrorenes Wort danach ein anderes, ist der Lauf ROT und nennt den
        // Täter (`wetterUrteil`, scripts/lib/ausgabe-aufnahme.cjs).
        const wetterVor = { wetter: st.weather, uhr: st.weatherEffectTime, seq: window.__wetterBuch().seq };
        // Die Tiere halten still (Vergleichbarkeit) — außer `--tiere frei` oder n: der Halte-Griff setzt x/z je Takt zurück,
        // die Tier-KI sucht dann jeden Takt neu (Feld-Raycasts), das kostet CPU, die das Spiel so nie zahlt.
        if (k.tiere === "halten") window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        st.playerMesh.visible = true;
        // DIE PASS-UHR (scripts/lib/zerlege-linse.cjs, dieselbe wie `zerlegen`): je Render-Pass die ms (`__passName`), dazu je
        // Frame Befehle und Dreiecke je Pass, exklusiv (`uhr.frameZ`, renderer.info).
        const uhr = window.__passUhr();
        const proben = [];
        let messen = false, tRenderVor = null, gpuAm = r._gpuTsAtMs, erledigtVor = r._gpuLeine.erledigt;
        // DIE HÄNGER-LINSE (`k.haenger`, scripts/lib/haenger-linse.cjs) misst in DIESEM Lauf: je Takt Beginn, Ende, gerendert
        // und die Geräte-Aufträge im Takt und davor (`__haengerAn`); `probe` schmuggelt 250 ms in den Takt.
        // DIE BAHN (`wandern: "bahn"`): 4 m/s die Kette des Orts (haushalt.json `bahn`) oder −z 0 → −60 m, hin und zurück;
        // der Geher lebt IM Lauf.
        const H = k.haenger ? window.__haengerAn() : null, T = { t: [], c0: [], c1: [], g: [], innen: [], aussen: [] };
        const diff = (a, b) => {
            const o = {};
            for (const x in a) if (a[x] !== (b[x] || 0)) o[x] = +(a[x] - (b[x] || 0)).toFixed(2);
            return Object.keys(o).length ? o : 0;
        };
        const ort = st.playerMesh.position.clone();
        const bahn = k.wandern === "bahn" ? { t0: null, weg: 0 } : null;
        // DIE FAHRT (`wandern: "fahrt"`, OMEN „GT-Fahrt Third ↔ Ego"): aufgestiegen im GT, V alle 4 s; die Bahn legt Wagen
        // (`_fahr`) und Reiter vor dem Takt auf +x, 20 m/s 0 → 800 m und zurück (gegen die Natur-Wand stünde er nach 39 m).
        const fahrt = k.wandern === "fahrt" ? { t0: null } : null;
        // DER KREIS (`wandern: "kreis"`, tiere.K5 „Begegnung im Bild"): der Spieler GEHT (Taste W, das Tempo des Spiels) und dreht
        // den Blick gleichmäßig (alle 250 ms um 2π · Δs / sek), eine Runde im Fenster; das Fenster zählt `sek` SPIEL-Sekunden (`kreisGang`).
        const kreis = k.wandern === "kreis" ? { gier: st.yaw, gesehen: new Map(), schuesse: 0, imBlick: 0, max: 0 } : null;
        // DER SPRUNG (`wandern: "sprung"`, streaming.K3): mit dem Mess-Fenster steht der Spieler 1 km weiter auf +x am Boden des
        // Gesetzes (der Loop übernimmt den Teleport, `_loopFixedStep`); gemessen wird die Kadenz, während die Welt dort neu
        // entsteht, dazu nach wie vielen s sie steht (A9 `_weltSteht`) und jeder Bau im Haupt-Faden (`_syncBauten`).
        const sprung = k.wandern === "sprung" && { m: 1000, stehtS: null };
        const kette = window.__ortBahn || [[ort.x, ort.z], [ort.x, ort.z - 60]];
        const laenge = kette.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - kette[i][0], q[1] - kette[i][1]), 0);
        // DER WEG des Spielers im Mess-Fenster (die Bahn oder ein Geher von außen) — „Weg 0 m" nennt eine stehende Zerlegung
        const lage = ort.clone();
        let weg = 0;
        let snap = H && Object.assign({}, H.acc), probeTakt = 0;
        // DIE SICHTUNG: ein Tier (`_tierBaum`, die Klasse `tier:` der Teilung) deckt ≥ 200 px der Klassen-Maske am Maß 1280×720 —
        // drei Schüsse des Ausgabe-Pfads unter der EINEN Uhr: G und G2 mit, dann O ohne Tiere (`toggleCreatures`, das Wort des
        // Spiels: Leib, Feld und Satz — das Wieder-Einschalten wirkt erst im nächsten Takt, darum steht O zuletzt); ein Pixel ist
        // Tier, wenn G UND G2 von O abweichen (`__klassenTeilung`): was zwischen zwei Schüssen wandert (headless 0,5 % des Bilds,
        // die Welt streamt im Gang), steht in O wie in G2 und fällt heraus; ein Pixel gehört unter ALLEN Tieren im Blick dem, dessen Körper-Kugel
        // (`_kreaturAusserBlick`) ihn deckt und dessen Mitte im Bild ihm relativ zum Radius am nächsten liegt (ein Glied des
        // Verbands schluckt nie die Pixel seiner Nachbarn); der Schatten am Boden zählt mit (mittags unter dem Leib, im flachen
        // Blick verkürzt). Geschossen wird höchstens alle 2 Spiel-s und nur, wenn ein ungesehenes Tier im Blick
        // 200 px decken KANN: seine Gestalt passt in 2 · Reichweite × Höhe (`_kreaturLeib`; die Kugel R = Reichweite + Höhe/2, ihre
        // Mitte Höhe/2 über dem Fuß). `imBlick` zählt Tiere, die im Blick erschienen (das Schlupfloch der Staffel).
        const kreisGang = async () => {
            const T = window.THREE, cam = st.camera, db = rend.getDrawingBufferSize(new T.Vector2()), fr = new T.Frustum(), v = new T.Vector3();
            const W = db.x, H = db.y, soll = (200 * W * H) / 921600, alt = new Set(st.creatures);
            const taste = (art) => window.dispatchEvent(new KeyboardEvent(art, { bubbles: true, code: "KeyW", key: "w" }));
            const schuss = async () => (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
            kreis.z0 = st.spielZeit;
            taste("keydown");
            try {
                for (let s = 0, naechst = 0; s < k.sek; s = st.spielZeit - kreis.z0) {
                    await sleep(250);
                    st.yaw = kreis.gier + (2 * Math.PI * s) / k.sek;
                    cam.updateMatrixWorld();
                    fr.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                    kreis.max = Math.max(kreis.max, st.creatures.length);
                    const kand = [];
                    for (const c of st.creatures) {
                        const u = c.userData, blick = u._tierBaum && !r._kreaturAusserBlick(c, fr, 0);
                        if (!alt.has(c)) alt.add(c), (kreis.imBlick += blick ? 1 : 0);
                        if (!blick) continue;
                        const d = v.set(c.position.x, c.position.y + u._ruheKugelH, c.position.z).distanceTo(cam.position);
                        const f = H / (2 * d * Math.tan((cam.fov * Math.PI) / 360)), neu = !kreis.gesehen.has(c) && s >= naechst;
                        v.project(cam);
                        kand.push({ c, d, rp: u._ruheKugelR * f, x: ((v.x + 1) * W) / 2, y: ((1 - v.y) * H) / 2, px: 0, neu: neu && 4 * (u._ruheKugelR - u._ruheKugelH) * u._ruheKugelH * f * f >= soll });
                    }
                    if (!kand.some((q) => q.neu)) continue;
                    naechst = s + 2;
                    kreis.halt = ++kreis.schuesse;
                    const G = [await schuss(), await schuss()];
                    r.toggleCreatures(false);
                    const O = await schuss().finally(() => r.toggleCreatures(true));
                    kreis.halt = 0;
                    const [teil, auch] = G.map((g) => window.__klassenTeilung(g, [O], W, H, 18).teil);
                    for (let p = 0; p < W * H; p++) {
                        let q = null, e = 1;
                        if (teil[p] && auch[p]) for (const k of kand) e > (k.e = ((k.x - (p % W)) ** 2 + (k.y - Math.floor(p / W)) ** 2) / k.rp ** 2) && ((e = k.e), (q = k));
                        if (q) q.px++;
                    }
                    for (const q of kand)
                        if (q.neu && q.px >= soll) kreis.gesehen.set(q.c, [q.c.userData.soul, Math.round((q.px * 200) / soll) + " px", Math.round(q.d) + " m", Math.round(s) + " s"]);
                }
            } finally {
                taste("keyup");
            }
        };
        rend.setAnimationLoop((t) => {
            // die Schüsse der Sichtung halten die Welt: kein Takt, die Spiel-Uhr steht, die Lücke ist kein Frame
            if (kreis && kreis.halt) return void (tRenderVor = null);
            // DIE BELEGUNG: zwei Marken je Takt nennen den Rückruf, der ihn trägt (`belegungAuswerten`: der Takt ist seine Hülle).
            const spur = messen && k.spur;
            if (spur) performance.mark("anazh-takt");
            // Das Wetter hält die Wetter-Wache der Bühne (scripts/lib/ausgabe-aufnahme.cjs) je Takt.
            window.__wetterHalten();
            const c0 = performance.now();
            const g0 = r._gpuLeine.gerendert;
            const z = (uhr.frameZ = {}), aussen = H && diff(H.acc, snap);
            if (H) snap = Object.assign({}, H.acc);
            if (bahn) {
                bahn.weg = (4 * (t - (bahn.t0 ??= t))) / 1000;
                let s = laenge - Math.abs((bahn.weg % (2 * laenge)) - laenge);
                for (let i = 1; i < kette.length; i++) {
                    const [ax, az] = kette[i - 1], [bx, bz] = kette[i], l = Math.hypot(bx - ax, bz - az);
                    if (s > l && i < kette.length - 1) s -= l;
                    else {
                        st.playerMesh.position.set(ax + ((bx - ax) * s) / l, st.playerMesh.position.y, az + ((bz - az) * s) / l);
                        break;
                    }
                }
            }
            if (fahrt && fahrt.e) {
                const x = fahrt.x0 + 800 - Math.abs(((20 * (t - (fahrt.t0 ??= t))) / 1000) % 1600 - 800), fz = fahrt.e._fahr;
                if (fz) [fz.x, fz.vlong, fz.vlat] = [x, 0, 0];
                fahrt.e.position.x = st.playerMesh.position.x = x;
            }
            try {
                if (window.__ortSchritt) window.__ortSchritt();
                if (probeTakt > 0) {
                    window.__haengerProbe(probeTakt);
                    probeTakt = 0;
                }
                r._gameLoopTick(t);
            } finally {
                uhr.frameZ = null;
            }
            const c1 = performance.now(), innen = H && diff(H.acc, snap);
            if (H) snap = Object.assign({}, H.acc);
            // Unter der GPU-Leine rendert nicht jeder Takt — gezählt werden GERENDERTE Frames (der Takt läuft weiter).
            const gerendert = r._gpuLeine.gerendert > g0;
            const pm = st.playerMesh.position;
            if (messen) weg += Math.hypot(pm.x - lage.x, pm.z - lage.z);
            lage.copy(pm);
            if (!messen) {
                if (gerendert) tRenderVor = t;
                return;
            }
            const p = { cpu: c1 - c0, gerendert };
            if (H) [t, c0, c1, gerendert ? 1 : 0, innen, aussen]
                .forEach((x, i) => Object.values(T)[i].push(typeof x === "number" ? +x.toFixed(2) : x));
            if (gerendert) {
                p.dtRender = tRenderVor == null ? null : t - tRenderVor;
                tRenderVor = t;
                p.jePass = z;
            }
            if (r._gpuTsAtMs !== gpuAm) {
                p.gpu = r._gpuTsLast;
                gpuAm = r._gpuTsAtMs;
            }
            // DIE GPU-WAHRHEIT: die Pass-Stempel sahen nur einen Teil (das Wasser bricht den Hauptpass für die
            // Tiefen-Kopie, der Neustart überschreibt die Stempel; Arbeit außerhalb der Pässe fehlt ganz). Der
            // Abstand der Zeitpunkte, an denen die GPU ein Bild abgearbeitet hat, ist der echte Durchsatz — die Leine
            // des Spiels zählt sie (`erledigt`).
            const L = r._gpuLeine;
            if (L.erledigt !== erledigtVor) {
                p.erledigt = L.erledigt - erledigtVor;
                p.gpuErledigt = L.erledigtMs;
                erledigtVor = L.erledigt;
            }
            proben.push(p);
            if (spur) performance.mark(gerendert ? "anazh-bild" : "anazh-leer");
        });
        try {
            if (fahrt) {
                const { x, z } = st.playerMesh.position;
                const e = r.spawnArchitecture("fahrzeug_gt", { x: x + 4, y: r.getTerrainHeightAt(x + 4, z) + 0.5, z }, { silent: true, id: "werkbank-fahrt" });
                await window.__gebautNach(e, { takt: () => sleep(16) });
                r.mountArchitecture(e);
                if (st.player.mountedArch !== e.id) throw new Error("--wandern fahrt: der Spieler steigt nicht in den GT");
                const v = (art) => window.dispatchEvent(new KeyboardEvent(art, { bubbles: true, code: "KeyV", key: "v" }));
                Object.assign(fahrt, { e, x0: e.position.x, uhr: setInterval(() => (v("keydown"), v("keyup")), 4000) });
            }
            await sleep(k.ein * 1000);
            // DIE RUHE: zwischen frischen Welten streute die GPU um ±5 ms (Foundry, Karten-Bäcker, Streaming noch
            // unterwegs). Mit `--ruhe <max s>` misst der Lauf erst, wenn 3 s lang alles steht: Chunks gleich, Foundry-
            // Schlange + Ingest leer, Karten-Bäcker ohne Wartende/Hängende, die Mesh-Zone fertig oder 10 s ohne Fortschritt.
            const ruheZustand = () => {
                const z = r._impostorCensus() || {};
                return {
                    chunks: st.voxelChunks.size,
                    foundry: r._weltOffen().foundry, // wie das Wort „die Welt steht" sie zählt (A9)
                    karten: (r._impostorBakeQueue || []).length + (z.wartend || 0), meshOffen: window.__ungebaut(),
                };
            };
            let ruhe = null;
            if (k.ruhe > 0) {
                const t0 = performance.now();
                let vor = ruheZustand(), ruhigSeit = performance.now(), offenSeit = performance.now(), ruhig = false;
                while (performance.now() - t0 < k.ruhe * 1000) {
                    await sleep(250);
                    const z = ruheZustand();
                    if (z.meshOffen !== vor.meshOffen) offenSeit = performance.now();
                    const still = z.chunks === vor.chunks && z.foundry === 0 && z.karten === 0 &&
                        (z.meshOffen === 0 || performance.now() - offenSeit > 10000);
                    if (!still) ruhigSeit = performance.now();
                    vor = z;
                    if (performance.now() - ruhigSeit >= 3000) {
                        ruhig = true;
                        break;
                    }
                }
                ruhe = Object.assign({ ruhig, sek: +((performance.now() - t0) / 1000).toFixed(1) }, vor);
            }
            const v0 = Object.assign({}, window.__vram);
            const wache = window.__stempelWache;
            const s0 = wache();
            if (k.spur) await window.__spurAn();
            // die Erst-Zeichnung (der EINE Ort in _configureRenderer): ihre Zähler über den Lauf
            const ERST = ["verschoben", "pipeAsync", "neubauN"], E = r._erstZeichnung;
            const erst0 = ERST.map((x) => E[x] || 0), probe = [];
            const tMess0 = performance.now();
            if (H) {
                H.namen.length = 0;
                H.an = true;
            }
            if (H && k.probe) {
                setTimeout(() => {
                    probe.push({ art: "takt", t: performance.now() });
                    probeTakt = 250;
                }, (k.sek * 1000) / 3);
                setTimeout(() => {
                    probe.push({ art: "neben", t: performance.now() });
                    window.__haengerProbe(250);
                }, (k.sek * 2000) / 3);
            }
            if (sprung) {
                const p = st.playerMesh.position, x = p.x + sprung.m;
                p.set(x, r._voxelSurfaceY(x, p.z) + 1.8, p.z);
                Object.assign(sprung, { t0: performance.now(), bau: r._syncBauten() });
            }
            messen = uhr.messen = true;
            // der Sprung misst in Bau-Ereignissen (`__deckel`), bis die Welt am Ziel steht (nachdem sie dort einmal nicht stand), dann 1 s
            if (sprung) {
                for (const weiter = window.__deckel("der Sprung um 1 km"); weiter() && !(sprung.offen && r._weltSteht()); await sleep(250))
                    sprung.offen ||= !r._weltSteht();
                sprung.stehtS = performance.now();
            }
            await (kreis ? kreisGang() : sleep(sprung ? 1000 : k.sek * 1000));
            messen = uhr.messen = false;
            if (H) H.an = false;
            const haenger = H && {
                takte: T, namen: H.namen.slice(), probe, k, tMess: [tMess0, performance.now()], kreaturen: st.creatures.length, wetter: st.weather,
                chunks: st.voxelChunks.size,
                sprung: sprung && Object.assign(sprung, { bau: [sprung.bau, r._syncBauten()] }),
                loadScale: +st.perfSense.loadScale.toFixed(2),
                erst: Object.assign(Object.fromEntries(ERST.map((x, i) => [x, +((E[x] || 0) - erst0[i]).toFixed(1)])),
                    { offen: E.offen.size }),
            };
            for (const m of ["anazh-takt", "anazh-bild", "anazh-leer"]) performance.clearMarks(m);
            const s1 = wache();
            rend.setAnimationLoop(null);
            // Die GPU-Fertig-Meldungen laufen der CPU hinterher — warten, bis die Schlange leer ist.
            await rend.backend.device.queue.onSubmittedWorkDone();
            await sleep(50);
            const jePassFrame = (await uhr.lesen()) || {};
            const quant = (arr, q) => {
                const a = arr.filter(Number.isFinite).sort((x, y) => x - y);
                return a.length ? +a[Math.min(a.length - 1, Math.floor(q * a.length))].toFixed(2) : null;
            };
            const spalte = (f) => proben.map((p) => p[f]).filter(Number.isFinite);
            const dt = spalte("dtRender"), gpu = spalte("gpu");
            const cpu = proben.filter((p) => p.gerendert).map((p) => p.cpu);
            const zahl = (a) => ({ p50: quant(a, 0.5), p95: quant(a, 0.95), p99: quant(a, 0.99), max: quant(a, 1) });
            // Je gerendertem Frame: die Summe (Mittel · p95 · max — ihr p50 springt zwischen den Pass-Moden) und je Pass
            // der Anteil der Frames, in denen er lief, und seine Zahl, WENN er lief.
            const jeFrame = proben.filter((p) => p.jePass);
            const passZahl = (feld) => {
                const n = jeFrame.length;
                const summe = jeFrame.map((p) => Object.values(p.jePass).reduce((a, e) => a + e[feld], 0));
                const passe = [...new Set(jeFrame.flatMap((p) => Object.keys(p.jePass)))];
                const jePass = {};
                for (const ps of passe) {
                    const w = jeFrame.filter((p) => p.jePass[ps]).map((p) => p.jePass[ps][feld]);
                    jePass[ps] = { anteil: n ? +(w.length / n).toFixed(2) : null, p50: quant(w, 0.5), max: quant(w, 1) };
                }
                const mittel = n ? Math.round(summe.reduce((a, b) => a + b, 0) / n) : null;
                return { frames: n, mittel, p95: quant(summe, 0.95), max: quant(summe, 1), jePass };
            };
            const s = st.perfSense, v = window.__vram;
            const mb = (b) => (Number.isFinite(b) ? +(b / 1048576).toFixed(1) : null);
            const cam = st.camera, dir = new window.THREE.Vector3();
            cam.getWorldDirection(dir);
            return {
                regler: k.regler,
                sekunden: k.sek,
                frames: dt.length,
                fps: dt.length ? +((1000 * dt.length) / dt.reduce((a, b) => a + b, 0)).toFixed(1) : null,
                frameMs: zahl(dt),
                cpuTaktMs: zahl(cpu),
                leine: { ausgesetztPct: +((100 * proben.filter((p) => !p.gerendert).length) / Math.max(1, proben.length)).toFixed(1), imFlug: r._gpuLeine.imFlug },
                gpuMs: Object.assign(zahl(gpu), { n: gpu.length, quelle: s.gpuQuelle || null }),
                gpuDurchsatzMs: (() => {
                    const g = proben.filter((p) => p.erledigt);
                    return zahl(g.slice(1).map((p, i) => (p.gpuErledigt - g[i].gpuErledigt) / p.erledigt));
                })(),
                // DIE PASS-ZAHL: die Pascal-Pass-Stempel tragen präsentations-gebundene Fremdzeit, der p50 kippt bei
                // Anteil 0,5. ABAB-Urteile über
                // Pass-Kosten lesen `rein` (unterer Gipfel; `__zweiGipfel`, scripts/lib/zerlege-linse.cjs) oder gpu-bank.
                gpuJePassMs: Object.fromEntries(
                    Object.entries(jePassFrame).map(([p, e]) => [p, window.__zweiGipfel(Object.values(e))])
                ),
                // Die Pass-Stempel gelten nur, wenn im Fenster kein Pass ohne Abfrage blieb (ein voller Pool schreibt
                // seine Stempel in fremde Plätze — `__stempelWache`).
                stempel: { imLauf: s1.ueberlauf - s0.ueberlauf, seitBoot: s1.ueberlauf, spitze: s1.spitze, pool: s1.pool, gueltig: s1.ueberlauf === s0.ueberlauf },
                befehle: passZahl("dc"),
                dreiecke: passZahl("tri"),
                vramMB: {
                    jetzt: mb(v.puffer + v.texturen), puffer: mb(v.puffer), texturen: mb(v.texturen), spitze: mb(v.spitze),
                    nPuffer: v.nPuffer, nTexturen: v.nTexturen,
                    wuchsImFenster: mb(v.puffer + v.texturen - (v0.puffer + v0.texturen)),
                    gross: window.__vramBericht(14),
                },
                stellgroessen: {
                    loadScale: +s.loadScale.toFixed(2),
                    szeneSkala: r._szeneSkalaWirk(),
                    pixelRatio: rend.getPixelRatio(),
                    foliageRadius: st.foliageRadius != null ? Math.round(st.foliageRadius) : null,
                    foliageDichte: st._foliageDensityScale != null ? +(+st._foliageDensityScale).toFixed(2) : null,
                    archRadius: Math.round(st.architectureCullingRadius),
                    ring: st._activeRingRadius,
                    schattenIntervall: +st._shadowMinInterval.toFixed(1),
                    holz: st._holzProfil,
                },
                phasenEwmaMs: Object.fromEntries(Object.entries(s.phase).map(([a, b]) => [a, +(+b).toFixed(2)])),
                kamera: {
                    pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)),
                    blick: [dir.x, dir.y, dir.z].map((x) => +x.toFixed(2)),
                },
                chunks: st.voxelChunks.size,
                ruhe,
                wetter: st.weather,
                // das Rohe der Wetter-Wache — das Urteil spricht die Werkbank (`wetterUrteil`)
                wetterHalt: {
                    vorher: wetterVor.wetter, nachher: st.weather,
                    uhrVorher: Number.isFinite(wetterVor.uhr) ? +wetterVor.uhr.toFixed(1) : null,
                    uhrNachher: Number.isFinite(st.weatherEffectTime) ? +st.weatherEffectTime.toFixed(1) : null,
                    buch: window.__wetterBuch(wetterVor.seq).buch,
                },
                saison: st.season,
                bahnM: Math.round(weg),
                kreis: kreis && { ...kreis, sicht: st.cameraMode, spielS: Math.round(st.spielZeit - kreis.z0), gesehen: [...kreis.gesehen.values()] },
                buehnenTiere: st.creatures.filter((c) => c.userData.buehne).length,
                haenger,
            };
        } finally {
            messen = false;
            if (H) H.an = false;
            rend.setAnimationLoop(null);
            uhr.ab();
            st.perfTargetMs = decke;
            if (bahn || kreis) st.playerMesh.position.copy(ort);
            if (kreis) st.yaw = kreis.gier;
            if (fahrt && fahrt.e) (clearInterval(fahrt.uhr), r.dismountArchitecture(), r.removeArchitecture(fahrt.e));
        }
    })();
}

// DIE GPU-BANK (Seiten-Kontext): n Frames direkt hintereinander rendern (ohne rAF, ohne VSync), dann auf die GPU
// warten. Liegt die GPU je Frame über der CPU, ist Gesamtzeit / n die reine GPU-Zeit je Frame — die rAF-Kadenz rastet
// am VSync ein und misst nur bei tiefer Schlange die GPU.
function gpuBank(k) {
    return (async () => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        // DIE EINE BANK-RUNDE (scripts/lib/zerlege-linse.cjs) — dieselbe Messung, die `zerlegen` je Schalter fährt.
        const runde = (n) => window.__bankRunde(n);
        await runde(3); // warm
        const n = k.n || 12;
        const rr = [];
        for (let i = 0; i < (k.runden || 3); i++) rr.push(await runde(n));
        const med = (key) => {
            const v = rr.map((x) => x[key]).sort((a, b) => a - b);
            return +v[Math.floor(v.length / 2)].toFixed(2);
        };
        const jeFrame = med("jeFrame"),
            cpu = med("cpuJeFrame");
        return {
            n,
            runden: rr.length,
            gpuJeFrameMs: jeFrame,
            cpuJeFrameMs: cpu,
            gpuGebunden: jeFrame > cpu * 1.15,
            nachlaufMs: med("nachlauf"),
        };
    })();
}

// DER TIER-ZÄHLER (Seiten-Kontext): die Tiere streuen zwischen Boots stark und stören jede ABAB-Folge — je Messung steht
// ihre Zahl daneben, ein Weltzustand, kein
// Urteil: gesamt, im Sichtkegel des Hauptbilds (die Körper-Kugel des Spiels, `_kreaturAusserBlick` — dieselbe Frage wie Ruhe,
// Satz und `lauf --wandern kreis`; davon nah ≤ `ANALOG_NAH_M`), mit Schatten-Wurf je Kaskade (ein sichtbarer werfender Leib,
// dessen Körper-Kugel das Frustum der Kaskaden-Kamera trifft), die Arten (die Gattung) gesamt und im Sichtkegel.
function tierZahl() {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const frustum = (kam) =>
        kam && new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse), kam.coordinateSystem);
    const cam = st.camera;
    const csm = st.csmNode;
    const dl = st.directionalLight;
    const kf = (csm && csm.lights && csm.lights.length ? csm.lights.map((l) => l && l.shadow && l.shadow.camera) : dl && dl.shadow ? [dl.shadow.camera] : []).map(frustum);
    const nahM = r.constructor.ANALOG_NAH_M || 64;
    const aus = { gesamt: 0, sicht: 0, sichtNah: 0, schatten: {}, arten: {}, artenSicht: {} };
    kf.forEach((_, i) => (aus.schatten["k" + i] = 0));
    const sicht = frustum(cam), kugel = new T.Sphere();
    for (const c of st.creatures) {
        const u = c.userData, art = u.gattung || u.soul || "?";
        aus.gesamt++;
        aus.arten[art] = (aus.arten[art] || 0) + 1;
        if (!r._kreaturAusserBlick(c, sicht, 0)) {
            aus.sicht++;
            aus.artenSicht[art] = (aus.artenSicht[art] || 0) + 1;
            if (cam.position.distanceTo(c.position) <= nahM) aus.sichtNah++;
        }
        let wirft = false;
        c.traverseVisible((n) => (wirft = wirft || (n.isMesh && n.castShadow)));
        kugel.set(c.position, u._ruheKugelR).center.y += u._ruheKugelH;
        if (wirft) kf.forEach((f, i) => f && f.intersectsSphere(kugel) && aus.schatten["k" + i]++);
    }
    return aus;
}

// DAS EINSCHWINGEN DER BAND-MESSUNG (Seiten-Kontext): der Spiel-Takt läuft mit der Bühne (Mittag · Sonne · Sommer),
// bis der Bau ruht — die Foundry-Schlange leer und kein Auftrag im Flug, kein Karten-Bake offen, kein Streu-Nachschub,
// keine aufgeschobene Streu-Region, kein Chunk im Bau, kein Dorf-Export unterwegs und keine wachsende Siedlung (der
// Messort dorf läuft mit dem Dorf-Zug; die EINE Liste `einschwingOffen`, band-urteil), und die Zahl der Chunks, der
// lebenden Instanzen und der
// ungebauten Bauten in der Mesh-Zone steht
// still — `ruhig` Takte am Stück. Ein Bau, der in Ruhe ungebaut bleibt (Bake-Lücke), steht im Ergebnis. Deckel `capMs`:
// dann `eingeschwungen: false`, und die Ratsche verweigert den Nachzug.
function bandEinschwingen(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const RUHIG = k.ruhig || 30;
        // DIE VOLLE WELT: der Regler misst hier Takte mit 50 ms Pause (65 ms je Frame) und drosselte auf loadScale 0 —
        // je nach Vorgeschichte stand die Messung auf einer anderen Welt (Streu-Stufen, Laub-Radius). Die Decke geht hoch
        // (`perfTargetMs` 1000, wie `lauf --regler voll`), der PID wächst auf 1: das Band misst die volle Welt. Die
        // Werkbank setzt die Decke nach den Proben zurück.
        if (window.__bandDecke == null) window.__bandDecke = st.perfTargetMs;
        st.perfTargetMs = 1000;
        const t0 = performance.now();
        const dl = t0 + (k.capMs || 240000);
        let takte = 0,
            ruhig = 0,
            vor = null,
            o = {};
        const stand = () => {
            let instanzen = 0;
            if (st.archInstanceGroups)
                for (const g of st.archInstanceGroups.values()) instanzen += g.mesh ? g.mesh.count : 0;
            const ls = st.perfSense ? +st.perfSense.loadScale.toFixed(3) : 1;
            return { chunks: st.voxelChunks ? st.voxelChunks.size : 0, instanzen, ungebaut: window.__ungebaut(), loadScale: ls };
        };
        while (performance.now() < dl) {
            window.__werkTakt();
            takte++;
            // was die Welt noch baut — die EINE Liste (band-urteil `einschwingOffen`, mit der Dorf-Wache des Messorts dorf)
            o = window.__einschwingOffen(r);
            const s = stand();
            if (s.loadScale < 1) o.loadScale = s.loadScale;
            if (vor) for (const key of Object.keys(s)) if (s[key] !== vor[key]) o[key] = `${vor[key]}→${s[key]}`;
            vor = s;
            ruhig = Object.keys(o).length ? 0 : ruhig + 1;
            if (takte >= 40 && ruhig >= RUHIG) break;
            await sleep(50);
        }
        return {
            eingeschwungen: ruhig >= RUHIG,
            takte,
            ms: Math.round(performance.now() - t0),
            stand: vor,
            offen: Object.keys(o).length ? o : null,
        };
    })();
}

// DIE PROBEN DER BAND-MESSUNG (Seiten-Kontext): `n` Zähl-Frames, zwischen zweien `zwischen` Spiel-Takte mit der Bühne
// (die Tiere wandern, der Takt rechnet weiter) — die Werkbank nimmt je Klasse × Pass das Maximum (`zensusMax`).
function bandProben(k) {
    return (async () => {
        const r = window.anazhRealm;
        const proben = [];
        for (let i = 0; i < (k.n || 6); i++) {
            if (i)
                for (let t = 0; t < (k.zwischen || 20); t++) {
                    window.__werkTakt();
                    await sleep(50);
                }
            window.__buehne();
            try {
                if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
            } catch {}
            proben.push(await window.__drawZensus({ alle: true }));
        }
        return proben;
    })();
}

// ── Server ──────────────────────────────────────────────────────────────────────────────────────
async function starte() {
    const puppeteer = require("puppeteer");
    const { linsenWebGpuArgs, adapterZeile, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    const seiten = statikServer();
    if (ECHT) {
        // Der Flugschreiber schreibt nur vom save-server-Ursprung (isSaveServerHost) — ohne ihn kein Echt-Lauf.
        const da = await new Promise((r) =>
            http.get(ECHT_SEITE + "/", (res) => (res.resume(), r(res.statusCode === 200))).on("error", () => r(false))
        );
        if (!da) throw new Error(`--echt braucht den save-server auf ${ECHT_SEITE} (npm start)`);
    } else await seiten.lausche(SEITEN_PORT);
    // DAS PROFIL DER MESS-SERIE: ohne eigenes Profil legte puppeteer je Start ein namenloses an — jede Zahl war eine
    // Erst-Boot-Zahl („17 von 319 von der Platte"). Scratch je Start (beim `stop` gelöscht) oder benannt (`--serie`).
    const profil = SERIE
        ? ablage("profil-" + SERIE.replace(/[^a-z0-9_-]+/gi, "_"))
        : path.join(require("os").tmpdir(), `werkbank-profil-${PORT}-${Date.now()}`);
    const serieNeu = !fs.existsSync(profil);
    fs.mkdirSync(profil, { recursive: true });
    const boot = { serie: SERIE || null, profil, serieNeu, ladungen: 0 };
    const bootArt = () => (boot.serieNeu && boot.ladungen <= 1 ? "erst" : "zweit");
    const browser = await puppeteer.launch({
        headless: !ECHT,
        userDataDir: profil,
        protocolTimeout: 10800000,
        defaultViewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : null,
        // Echt: der Hardware-Adapter im Fenster; sonst die Weiche (lokal der Hardware-Adapter headless, in der CI swiftshader)
        // — die Schalter je Plattform trägt das EINE Rezept.
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1940,1200"] : linsenWebGpuArgs(),
    });
    await adapterZeile(browser);
    const page = await browser.newPage();
    const loopAus = () => page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
    // ein Seiten-Werkzeug beim Namen (`window[name](k)`)
    const seite = (name, k) => page.evaluate((n, k) => window[n](k), name, k);
    if (!ECHT) await page.setViewport({ width: 640, height: 360 });
    const spur = { an: null }; // DIE BELEGUNG: der Lauf ruft die Spur vor seinem ersten gemessenen Takt an (`/lauf`)
    await page.exposeFunction("__spurAn", () => spur.an && spur.an());
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    // DIE GPU-FEHLER-LINSE (V-D7): jede WebGPU-Validierung mit Pass und Objekt beim Namen (scripts/lib/gpu-fehler.cjs).
    if (GPU_FEHLER) await page.evaluateOnNewDocument(GPU_FEHLER_INSTALL);
    if (START_ORT && BAND.ladeSpec(START_ORT).ort.dorfZug === false)
        await page.evaluateOnNewDocument(() => {
            window.__anazhAutoSettlement = false;
        });
    const fehler = [];
    const zerstoert = { n: 0 };
    // Der Zeuge des vollen Stempel-Pools (r184 warnt nur EINMAL je Seite — warnOnce): die Zahl zählt
    // `__stempelWache` (scripts/lib/zerlege-linse.cjs), die Warnung belegt, dass es geschah.
    const stempelWarnung = { n: 0 };
    page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
    // Der Tod der Seite beim NAMEN: jedes Ende (Absturz, Schließen, Navigation) landet mit Uhrzeit im Werkbank-Log.
    const tod = (was) => console.log(`[seite] ${new Date().toISOString()} ${was}`);
    page.on("error", (e) => tod("ABSTURZ " + ((e && e.message) || e)));
    page.on("close", () => tod("GESCHLOSSEN"));
    page.on("framenavigated", (f) => {
        if (f === page.mainFrame()) tod("navigiert " + f.url());
    });
    browser.on("disconnected", () => tod("Browser getrennt"));
    // WebGPU-Validierung meldet sich nur als Konsolen-Fehler (kein pageerror) — die Wahrheit über schwarze Bilder.
    page.on("console", (m) => {
        if (/Destroyed texture|Destroyed buffer/.test(m.text())) zerstoert.n++;
        if (/TimestampQueryPool \[render\]: Maximum number of queries exceeded/.test(m.text())) stempelWarnung.n++;
        if (m.type() === "error" || /WebGPU|GPUValidation|Invalid/.test(m.text()))
            fehler.push(("[konsole] " + m.text()).split("\n").slice(0, 3).join(" | ").slice(0, 400));
        if (fehler.length > 200) fehler.splice(0, fehler.length - 200);
    });
    const lade = async (nav) => {
        boot.ladungen++;
        const basis = ECHT ? ECHT_SEITE : `http://127.0.0.1:${SEITEN_PORT}`;
        await (nav ||
            page.goto(`${basis}/index.html${HOLZ ? `?holz=${HOLZ}` : ""}`, {
                waitUntil: "domcontentloaded",
                timeout: 60000,
            }));
        for (const i of [AUSGABE_INSTALL, LL.LINSEN_INSTALL, ZAEHLER_INSTALL, BAND.EINSCHWING_INSTALL, FLUSS_INSTALL, DIAET.DIAET_INSTALL, SICHT.SICHT_INSTALL])
            await page.evaluate(i);
        // DER TAKT DER WERKBANK: die Bühne, der Ort und ein Takt des Loops (ein Wurf des Loops bricht die Probe nicht); dazu die
        // ungebauten Werke in der Mesh-Zone (`architectureCullingRadius` um den Spieler)
        await page.evaluate(() => {
            window.__werkTakt = () => {
                try {
                    window.__buehne();
                    if (window.__ortSchritt) window.__ortSchritt();
                    window.anazhRealm._gameLoopTick(performance.now());
                } catch {}
            };
            window.__ungebaut = (r = window.anazhRealm, st = r.state, pm = st.playerMesh.position) =>
                (st.architectures || []).filter(
                    (e) =>
                        (e.position.x - pm.x) ** 2 + (e.position.z - pm.z) ** 2 <= (st.architectureCullingRadius || 0) ** 2 &&
                        !r._archIsRendered(e)
                ).length;
        });
        // dazu die Orte aus der Welt (`__weltOrt`: eben · hang · hangfuss · ufer — der Wasser-Ort der Soll-Tafel, K63-n4)
        for (const i of [`window.__tierZahl = ${tierZahl.toString()};`, STAND.STAND_INSTALL, FERNWALD_INSTALL, require("./lib/welt-orte.cjs").WELT_ORTE_INSTALL, ZL.ZERLEGE_INSTALL, SK.SHADER_INSTALL, ZZ.ZIEL_INSTALL, HL.HAENGER_INSTALL])
            await page.evaluate(i);
        await page.evaluate(() => window.__weltDa((r) => !!(r.state.renderer && r.state.renderer.backend)));
        if (GPU_FEHLER) await page.evaluate(GPU_FEHLER_OBJEKT);
    };
    await lade();
    await loopAus();

    // DER ORT (spec/profiband/haushalt.json `messorte`): mit `--ort` steht der Spieler am Ort und blickt in seine Richtung,
    // der Dorf-Zug folgt dem Ort, und der Ort-Takt läuft in JEDEM Takt der Werkbank (`__ortSchritt`). Ohne `--ort` bleiben
    // Zug und Blick, der Ort-Takt ist leer.
    // Der Ort, an dem die Werkbank zuletzt umstellte (`umstellen --ort`) — die Albedo-Tafel nennt ihn.
    let aktOrt = null;
    // DIE SICHT des gestellten Orts: Ego oder Third-Person — der Ort wird in ihr aufgestellt, die Band richtet die
    // Ratsche dieses Orts × Geräts × Sicht.
    let aktSicht = null;
    // DIE WELT DES ORTS (Toggle-Ort, haushalt.json `welt`): die Prüfbühne ist eine geborene Welt — sie betritt die
    // Seite wie im Spiel durch DIE TÜR (`importWorldBeside` mit `reload`: Sperre, Zeiger, Neuladen). Steht die Seite schon in ihr
    // (derselbe slug), bleibt sie; ein Import, der nicht greift, oder eine Seite, die danach in einer anderen Welt steht, bricht laut.
    const weltDesOrts = async (ort) => {
        const json = JSON.parse(fs.readFileSync(path.join(root, "spec", ort.welt), "utf8"));
        const slug = json.worldMeta && json.worldMeta.slug;
        if (!slug) throw new Error(`Messort ${ort.id}: die Welt ${ort.welt} trägt keinen worldMeta.slug`);
        const steht = () =>
            page.evaluate((s) => {
                const m = window.anazhRealm.state.worldMeta;
                return !!(m && m.slug === s);
            }, slug);
        if (await steht()) return { slug, neu: false };
        const nav = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });
        const res = await page.evaluate((j) => {
            const x = window.anazhRealm.importWorldBeside(j, { reload: true });
            return x && x.ok ? { id: x.worldId } : { fehler: JSON.stringify(x).slice(0, 200) };
        }, json);
        if (res.fehler)
            throw new Error(`Messort ${ort.id}: die Welt ${ort.welt} ließ sich nicht importieren (${res.fehler})`);
        await lade(nav);
        await loopAus();
        if (!(await steht())) throw new Error(`Messort ${ort.id}: nach dem Neuladen steht die Seite nicht in ${slug}`);
        return { slug, neu: true, id: res.id };
    };
    // Der Adapter-Text des Geräts (WebGPU `adapterInfo`: Hersteller · Architektur · Beschreibung) — EIN Leser für Albedo und Band.
    const geraetInfo = () =>
        page.evaluate(async () => {
            const a = navigator.gpu ? await navigator.gpu.requestAdapter() : null;
            const i = a && a.info ? a.info : null;
            return i ? [i.vendor, i.architecture, i.description].filter(Boolean).join(" ") : null;
        });
    const umstellen = (x, z, o) =>
        page.evaluate(
            async (x, z, o) => {
                const r = window.anazhRealm;
                // DER ANKER des Orts (haushalt.json `anker`): die Stamm-Methode nennt, wo der Ort in DIESER Welt steht —
                // steht er mehr als 1 m neben dem Spieler-Platz der Spec, bricht die Aufstellung laut ab (sonst urteilte
                // die Messung über einen leeren Rand).
                if (o && o.anker) {
                    const a = r[o.anker]();
                    if (!a || !Number.isFinite(a.x) || !Number.isFinite(a.z) || Math.hypot(a.x - x, a.z - z) > 1)
                        throw new Error(
                            `Messort ${o.ort}: der Anker ${o.anker} steht bei ${a ? a.x + " " + a.z : "?"}, der Ort bei ${x} ${z} — ` +
                                "der Ort wandert mit der Welt (spec/profiband/haushalt.json)"
                        );
                }
                window.__ortTakt = (o && o.takt) || [];
                // DIE STELLGRÖSSEN des Orts (Toggle-Ort, haushalt.json `stell`): der Regler hält sie je Takt fest — sonst
                // wanderten Laub-Radius und Lade-Ring je Sitzung (der Ring wächst nur bei Kopfraum und vollem Ring,
                // `_activeRingRadius`) und mit ihnen die Bank. `ring` setzt Ziel UND aktiven Ring, wie der Null-Renderer es tut.
                const FELD = {
                    foliageRadius: ["foliageRadius"],
                    architectureCullingRadius: ["architectureCullingRadius"],
                    dichte: ["_foliageDensityScale"],
                    perfTargetMs: ["perfTargetMs"],
                    ring: ["chunkRingRadius", "_activeRingRadius"],
                };
                const stell = (o && o.stell) || null;
                for (const k of Object.keys(stell || {}))
                    if (!FELD[k])
                        throw new Error(
                            `Messort ${o.ort}: unbekannte Stellgröße „${k}" (${Object.keys(FELD).join(", ")})`
                        );
                window.__ortStell = stell
                    ? () => {
                          for (const [k, v] of Object.entries(stell)) for (const f of FELD[k]) r.state[f] = v;
                      }
                    : null;
                window.__ortSchritt = () => {
                    if (window.__ortStell) window.__ortStell();
                    const pm = r.state.playerMesh.position;
                    for (const m of window.__ortTakt) r[m](pm);
                };
                if (window.__ortStell) window.__ortStell();
                if (o && Number.isFinite(o.gier)) {
                    r.state.yaw = o.gier;
                    r.state.pitch = 0;
                }
                // DER ANLAUF (haushalt.json `anlauf`): dort steht der Spieler zuerst und schwingt ein — er gründet die Stadt, der Zug baut
                // kein Haus auf ihm, eine Stadt erwacht erst, wenn er naht —, dann steht er am Ort: am Boden oder auf dem Dach (`dach`, m)
                const a = (o && o.anlauf) || [x, z];
                r.state.playerMesh.position.set(a[0], r._voxelSurfaceY(a[0], a[1]) + 1.8, a[1]);
                // DIE GRÜNDUNG (haushalt.json `gruendung`, die Stadt): der Spieler sagt sein Wort am Anlauf mit dem Blick des Orts, wie im
                // Spiel (Chat) — die Siedlung steht danach am Anker der Spec (±1 m, sonst laut: die Ort-Wahl wanderte mit der Welt); eine Welt,
                // die sie trägt, gründet nicht neu. Die Bahn des Orts (`bahn`, die Hauptgasse) liegt Meter für Meter auf ihrem Weg (`_aufWeg`).
                const g = o && o.gruendung;
                window.__ortBahn = (o && o.bahn) || null;
                if (g) {
                    const same = g.wort.split(" ")[1];
                    const zellen = () => Object.values(r.state.worldMeta.settlementCells || {});
                    const steht = () =>
                        zellen().find((c) => String(c.seed) === same && Math.hypot(c.x - g.anker[0], c.z - g.anker[1]) <= 1);
                    if (!steht()) {
                        r._chatDispatchLegacyCommand(g.wort, [], () => {});
                        for (const weiter = window.__deckel(`die Gründung „${g.wort}"`); !steht() && weiter(); ) await sleep(250);
                    }
                    if (!steht())
                        throw new Error(`Messort ${o.ort}: „${g.wort}" steht nicht am Anker ${g.anker} (${JSON.stringify(zellen())})`);
                }
                if (o && o.dorfZug === false) window.__anazhAutoSettlement = false;
                else if (o && o.dorfZug === true) delete window.__anazhAutoSettlement;
                if (o && o.kamera) r.setCameraMode(o.kamera);
                // eingeschwungen, wenn der Ring an seinem Ziel gebaut ist, dann DIE WELT STEHT (A9, `__weltStehtNach` hält den Regler) —
                // in Bau-Ereignissen, nie an der Wanduhr. Der Ort schwingt unter REGLER VOLL ein (die Bedingung der Messung, E): der Ring
                // steht an seinem Ziel, gehalten wie `stell.ring`, nie nach der Last der Nachbarn auf der geteilten GPU (A9, Mess-Wiese:
                // Ring 2 statt 4, boden-nah 2,391 statt 1,814 — die nahen Kronen fehlten)
                const ziel = stell && stell.ring ? stell.ring : Math.min(12, r.state.chunkRingRadius || 4);
                const decke = r.state.perfTargetMs;
                r.state.perfTargetMs = 1000;
                const takt = async () => {
                    if (r.state._activeRingRadius < ziel) r.state._activeRingRadius = ziel;
                    try {
                        window.__buehne();
                        window.__ortSchritt();
                        r._gameLoopTick(performance.now());
                    } catch {}
                    await sleep(50);
                };
                let takte;
                try {
                    takte = await window.__gebautNach(`Messort ${o ? o.ort : `${x} ${z}`}: der Ring ${ziel}`, {
                        fertig: () => r._builtRingRadius() >= ziel,
                        takt,
                        max: 1800,
                        warum: () => `der Ring steht bei ${r._builtRingRadius()}`,
                    });
                    takte += await window.__weltStehtNach(takt);
                    // die Bahn der Gründung erst, wenn die Welt am Anlauf steht: der Zug legt die Wege der Stadt nach ihrem Gedächtnis
                    const k = g ? o.bahn : [];
                    for (let i = 1; i < k.length; i++)
                        for (let s = 0, l = Math.hypot(k[i][0] - k[i - 1][0], k[i][1] - k[i - 1][1]); s <= l; s++) {
                            const x = k[i - 1][0] + ((k[i][0] - k[i - 1][0]) * s) / l, z = k[i - 1][1] + ((k[i][1] - k[i - 1][1]) * s) / l;
                            if (!r._aufWeg(x, z, 0)) throw new Error(`Messort ${o.ort}: die Bahn verlässt die Gasse bei ${x.toFixed(1)} ${z.toFixed(1)}`);
                        }
                    if (o && o.anlauf) {
                        r.state.playerMesh.position.set(x, o.dach ? o.dach + AnazhRealm.PLAYER_FOOT_OFFSET : r._voxelSurfaceY(x, z) + 1.8, z);
                        takte += await window.__weltStehtNach(takt);
                        // der Träger der Kapsel (`_stepCharacter`): steht der Spieler auf dem Bau in der Höhe des Dachs?
                        if (o.dach && !(r.state._kapselStruktur && Math.abs(r.state._kapselTraegerY - o.dach) < 0.5))
                            throw new Error(`Messort ${o.ort}: kein Dach bei ${o.dach} m (Träger ${r.state._kapselTraegerY})`);
                    }
                } finally {
                    r.state.perfTargetMs = decke;
                }
                // ein Dorf, das vor dem Ort losging (ein Ort ohne Dorf-Zug, der Zug lief im Boot): sein Plan schwebt — Wege und
                // Platz stehen, der Wald weicht, das Dorf wächst nie. Beim Namen (die Folge startet mit `start --ort`).
                const q = r._autoSettlementQueue;
                const dorfSchwebt =
                    o && o.dorfZug === false && (q || r._autoSettlementPendingKey)
                        ? q && q.plan && q.plan.slots
                            ? `Plan ${q.idx}/${q.plan.slots.length} (Zelle ${q.cellKey})`
                            : `Export ${r._autoSettlementPendingKey || "?"}`
                        : null;
                return {
                    takte,
                    steht: r._weltSteht(),
                    chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
                    gier: +r.state.yaw.toFixed(4),
                    dorfZug: window.__anazhAutoSettlement !== false,
                    ortTakt: window.__ortTakt,
                    dorfSchwebt,
                };
            },
            x,
            z,
            o || null
        );

    const bild = (k) =>
        page.evaluate(async (k) => {
            const r = window.anazhRealm;
            const rend = r.state.renderer;
            const boden = (x, z, v) =>
                typeof v === "string" && v[0] === "+" ? r._voxelSurfaceY(x, z) + Number(v.slice(1)) : Number(v);
            // DAS GESICHT (`--gesicht <m>`): die Kamera steht <m> vor dem Kopf des Spielers (sein Kopf-Gelenk, 8 cm darüber
            // die Augenhöhe, seine Blick-Richtung) und blickt ihn an — die Pose kommt aus dem Leib, nie von Hand
            let gpos = null;
            if (k.gesicht != null) {
                const T = window.THREE;
                const pm = r.state.playerMesh;
                let kopf = null;
                pm.updateMatrixWorld(true);
                pm.traverse((o) => {
                    if (!kopf && o.name === "head") kopf = o;
                });
                if (!kopf) throw new Error("--gesicht: der Spieler trägt kein Kopf-Gelenk „head“");
                const h = kopf.getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 0.08, 0));
                const fw = new T.Vector3(0, 0, 1).applyQuaternion(pm.getWorldQuaternion(new T.Quaternion()));
                const c = h.clone().addScaledVector(fw, Number(k.gesicht));
                gpos = [c.x, c.y, c.z, h.x, h.y, h.z];
            }
            const bundlesNeu = window.__bundlesNeu;
            // DIE ARMLÄNGE (material.K2, `--arm <m> --klasse <regex>`): der Ego-Blick des Spielers (das Rig `_loopCamera`) zielt auf
            // die Klasse IM AUSGABE-BILD — die Tiefe mit und ohne ihre Objekte trennt ihre Pixel, der Strahl des Auges geht durch das
            // nächste zur Bildmitte, die Kamera steht <m> vor dem Treffer auf ihm; zeigt der Blick keines, ist die Pose ROT beim
            // Namen. Bis mk2-mikro traf der Arm die Bildmitte (durch die Pflanzen, `_fieldRaycast`): die Kuppe des Fels im Gras lag
            // daneben, die Station maß 0 Fels-Pixel. `mitte(S, i)`: der Welt-Punkt des Tiefe-Pixels i (ohne i die Bildmitte).
            const mitte = ({ tiefe, tw, th, ivp }, i = (th >> 1) * tw + (tw >> 1)) => {
                const T = window.THREE;
                const P = new T.Vector3((2 * (i % tw) + 1) / tw - 1, 1 - (2 * Math.floor(i / tw) + 1) / th, tiefe[i]);
                return tiefe[i] < 0.99999 ? P.applyMatrix4(new T.Matrix4().fromArray(ivp)) : null;
            };
            if (k.arm != null) {
                if (r.state.cameraMode !== "first" || !k.klasse) throw new Error("--arm: Ego (--sicht ego) und --klasse");
                for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
                const a = r.state.camera.position.clone();
                const tiefe = async () => (await window.__ausgabeAufnahme(64, 36, 1, { satz: "messung" }), await window.__spiegelDaten());
                const re = new RegExp(k.klasse),
                    aus = [],
                    S = await tiefe();
                r.state.scene.traverse((o) => o.visible === true && o.isMesh && re.test(r._taeterKlasse(o)) && aus.push(o));
                aus.forEach((o) => (o.visible = false));
                bundlesNeu();
                const O = await tiefe();
                aus.forEach((o) => (o.visible = true));
                bundlesNeu();
                const ab = (j) => ((j % S.tw) - S.tw / 2) ** 2 + (Math.floor(j / S.tw) - S.th / 2) ** 2;
                let i = -1;
                S.tiefe.forEach((z, j) => z !== O.tiefe[j] && (i < 0 || ab(j) < ab(i)) && (i = j));
                if (i < 0) throw new Error(`--arm: POSE /${k.klasse}/ steht nicht im Ausgabe-Bild des Ego-Blicks (${aus.length} Objekte)`);
                const hit = mitte(S, i);
                const c = hit.clone().addScaledVector(hit.clone().sub(a).normalize(), -Number(k.arm));
                gpos = [c.x, c.y, c.z, hit.x, hit.y, hit.z];
            }
            const px = gpos ? gpos[0] : Number(k.px),
                pz = gpos ? gpos[2] : Number(k.pz),
                lx = gpos ? gpos[3] : Number(k.lx),
                lz = gpos ? gpos[5] : Number(k.lz);
            const py = gpos ? gpos[1] : boden(px, pz, k.py),
                ly = gpos ? gpos[4] : boden(lx, lz, k.ly);
            rend.setAnimationLoop(null);
            // DIE KLASSE (die Soll-Tafel): das Bild in voller Puffer-Größe — Dither und Kanten leben im Pixel des Schirms
            if (k.klasse) {
                const db = rend.getDrawingBufferSize(new window.THREE.Vector2());
                k.w = Math.round(db.x);
                k.h = Math.round(db.y);
            }
            // die Kamera VOR der Bühne: die Bühne setzt Tag und Nacht neu, und das Licht des Auges steht an der Kamera
            // (`_dayNightApplyAugenLicht`, seine Stärke aus dem Himmel am Auge) — danach gesetzt, stand es an der Kamera des
            // letzten Schusses (das Auge in der Höhle schwarz, Helligkeit 0, das Licht lag draußen unter dem Himmel)
            const cam = r.state.camera,
                fov0 = cam.fov; // `--fov v`: das Blickfeld (vertikal) dieses Schusses, danach wieder das des Spiels
            if (k.fov) (cam.fov = Number(k.fov)), cam.updateProjectionMatrix();
            cam.position.set(px, py, pz);
            cam.lookAt(lx, ly, lz + 1e-4);
            cam.updateMatrixWorld(true);
            window.__buehne(k);
            // `--uhr u` (0..1, 0,5 = Mittag): die Bühne mit Sonne und Sommer, aber zu dieser Stunde — Himmel, Umgebung und die
            // Leuchtquellen (`_leuchtTakt`, eine Sekunde, bis jede gewählte Quelle eingeblendet ist) folgen ihr
            if (Number.isFinite(k.uhr)) {
                const st = r.state;
                if (st.world) st.world.timeOfDay = k.uhr;
                // der Pfad des Spielers (sein Satz „nacht"): der Uhr-Schreiber springt, der Himmel folgt im selben Anwenden
                r.setTimeOfDay(k.uhr, "human");
                for (let i = 0; i < 20; i++) {
                    r._leuchtTakt();
                    await sleep(50);
                }
            }
            if (r.state.playerMesh) r.state.playerMesh.visible = !!k.spieler;
            // DAS ZIEL des Bilds ist der Blick-Punkt: die Aufnahme prüft, ob es im Bild und frei ist, und die Blick-Wahl
            // sucht bis zu `wahl` Posen um den Ort (Standard drei Runden, 42; `--wahl 0` schießt nur die genannte Pose)
            const ziel = { x: lx, y: ly, z: lz, name: k.ziel || "Blickziel", punkte: k.punkte };
            const wahl = k.wahl != null ? Number(k.wahl) : 42;
            let auf = null;
            let gewaehlt = null;
            for (let i = 0; i < 2; i++) {
                try {
                    if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
                } catch {}
                r._schattenAlleNeu();
                // die Blick-Wahl im ersten Schuss, der zweite steht an ihrer Pose; das Bild trägt die Wahl des ersten
                auf = await window.__ausgabeAufnahme(k.w, k.h, 1, { ziel, wahl: i === 0 ? wahl : 0 });
                if (i === 0) gewaehlt = auf.abnahme.wahl || null;
            }
            if (gewaehlt) {
                auf.abnahme.wahl = gewaehlt;
                auf.abnahme.zeile = window.__abnahmeUrteil(auf.abnahme).zeile;
            }
            // Die Welt RUHT zwischen den Befehlen (nur `umstellen` tickt): im Leerlauf fraß der Loop unter
            // swiftshader ~3 Kerne und verfälschte jede andere Messung.
            window.__letzteAufnahme = auf.u8;
            // die Tiefe und Kamera des Schusses (A13, die Achse der Spiegel-Treue), ehe ein weiterer Schuss sie überschreibt
            const spiegel = (window.__letzteSpiegel = k.klasse ? await window.__spiegelDaten() : null);
            const u8 = auf.u8,
                W = k.w,
                H = k.h;
            // DIE KLASSEN IM BILD (scripts/lib/abnahme-urteil.cjs): an derselben Pose unter der EINEN Uhr G, G2 (das
            // Rauschen) und je Teil-Klasse (`_taeterKlasse`) O ohne sie; jedes Pixel höchstens EINER Klasse, die Maße aus dem Bild. `k.abstand`: je 2×2-Block der Teilung der Strahl der Block-Mitte bis zum gezeichneten Boden
            // (`_bodenSichtAt`), gezählt je Klasse in Abstands-Bändern, dazu cos θ des Blicks je Band. Solange Objekte verborgen
            // sind, ruhen die Schreiber im Render-Pfad: die Nah-Wiese (ihr Takt setzt je Kachel `visible`) und der Blick des Bilds
            // (`_ruheImBild`: die Plätze des Tier-Satzes setzen über `_instanzZahl` ihr `visible`, ein geweckter Leib sein Feld —
            // tiere.K1 Herde am Hang: der Hirsch im Satz zeichnete in G und O und fehlte der Maske); jedes Bündel nimmt neu auf,
            // danach steht alles wie vorher.
            let klasse = null;
            if (k.klasse) {
                const re = new RegExp(k.klasse);
                const zeichnet = (o) =>
                    o.visible === true && !!o.geometry && (o.isMesh || o.isLine || o.isPoints || o.isSprite);
                // DER KOPF IN STOFFEN (`--gesicht`): ein Teil des Spielers, dessen Gewichte am Kopf hängen (head, Augen,
                // Lider) oder der am Kopf-Gelenk sitzt, heißt `spieler:kopf/<Stoff>` (Stoff = `__klasse`, sonst `auge`), der Rest
                // `spieler:leib/…` — die Teilung zeigt dann jeden Stoff des Kopfs für sich
                const KOPF_GELENK = /^(head|eye[LR]|iris[LR]|lid[TB][LR])$/;
                const kopfGewicht = (o) => {
                    for (let p = o; p; p = p.parent) if (p.name === "head") return 1;
                    const a = o.geometry.attributes.skinIndex,
                        w = o.geometry.attributes.skinWeight;
                    if (!a || !o.skeleton) return 0;
                    let kz = 0,
                        n = 0;
                    for (let i = 0; i < a.count; i++)
                        for (let c = 0; c < 4; c++) {
                            const wt = w.getComponent(i, c);
                            n += wt;
                            if (KOPF_GELENK.test(o.skeleton.bones[a.getComponent(i, c)].name)) kz += wt;
                        }
                    return n ? kz / n : 0;
                };
                const teilName = (o) => {
                    const kl = r._taeterKlasse(o);
                    if (k.gesicht == null || kl !== "spieler") return kl;
                    const auge =
                        o.isSkinnedMesh && o.skeleton && o.skeleton.bones.some((b) => /^iris[LR]$/.test(b.name));
                    return `spieler:${kopfGewicht(o) >= 0.3 ? "kopf" : "leib"}/${o.userData.__klasse || (auge ? "auge" : "stoff")}`;
                };
                const teile = new Map();
                const nimm = (kl, o) => {
                    if (!teile.has(kl)) teile.set(kl, []);
                    teile.get(kl).push(o);
                };
                // DER BAU-SATZ IN BEREICHEN (`_bauSatzArt` · `_tickBauSatz`): ein Bau-Satz zeichnet die Instanz-Gruppen
                // vieler Exemplare als EIN Mesh — die Teilung führt jeden Bereich beim Namen seiner Gruppe (`_taeterGruppe`:
                // Exemplar und Stufe, f:drachentor:L1), nie den Satz. Ein Bereich verbirgt sich, indem er den Satz verlässt
                // (`_chunkSatzAus`), und kehrt über den EINEN Weg zurück (`_bauSatzMarke` → `_tickBauSatz`); ein Nur-Wurf-Satz
                // zeichnet nie ins Bild und bleibt, wie er ist.
                const bauSaetze = new Map();
                for (const [art, s] of r.state.chunkSaetze || [])
                    if (s.mesh && s.mesh.userData && s.mesh.userData.bauSatz && !s.spec.nurWurf)
                        bauSaetze.set(s.mesh, { art, s });
                r.state.scene.traverse((o) => {
                    if (!zeichnet(o)) return;
                    const bs = bauSaetze.get(o);
                    if (bs) {
                        // ruft die Klasse den Satz beim Namen (`^formationenSatz$`, material.K2), sind seine Bereiche EINE Klasse
                        for (const key of bs.s.bloecke.keys()) {
                            const kl = re.test(o.name) ? o.name : r._taeterGruppe(key);
                            if (re.test(kl)) nimm(kl, { bereich: true, art: bs.art, key, mesh: o });
                        }
                        return;
                    }
                    const kl = teilName(o);
                    if (re.test(kl)) nimm(kl, o);
                });
                if (!teile.size)
                    throw new Error(
                        `Klasse /${k.klasse}/: kein gezeichnetes Objekt in der Szene — die Soll-Messung braucht ihr Exemplar`
                    );
                const namen = [...teile.keys()].sort();
                if (namen.length > 250) throw new Error(`Klasse /${k.klasse}/: ${namen.length} Teil-Klassen (höchstens 250)`);
                const alle = [].concat(...teile.values());
                // der Wurf eines Bereichs ist der seines Satzes: der Satz wirft für die Messung nicht
                const wurf = new Map(alle.map((o) => (o.bereich ? o.mesh : o)).map((o) => [o, o.castShadow]));
                const verbirg = (o) => (o.bereich ? r._chunkSatzAus(o.art, o.key) : (o.visible = false));
                const zeig = (o) => (o.bereich ? r._bauSatzMarke(o.key, o.art) : (o.visible = true));
                const ruhen = ["_tickNahWiese", "_ruheImBild"].map((m) => [m, Object.prototype.hasOwnProperty.call(r, m), r[m]]);
                for (const [m] of ruhen) r[m] = () => 0;
                const schuss = async (aus) => {
                    for (const o of aus) verbirg(o);
                    bundlesNeu();
                    try {
                        r._schattenAlleNeu();
                        return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
                    } finally {
                        for (const o of aus) zeig(o);
                        r._tickBauSatz(Infinity);
                        bundlesNeu();
                    }
                };
                try {
                    for (const o of wurf.keys()) o.castShadow = false;
                    const G = await schuss([]);
                    const G2 = await schuss([]);
                    const Os = [];
                    for (const n of namen) Os.push(await schuss(teile.get(n)));
                    // DAS BILD OHNE FILM (D8, K5 milchweiss): misst die Tafel die Membran, zeichnet derselbe Schuss sie noch einmal
                    // mit ihrem Ziel allein (`__membranOhneFilm`) — Milch ist, was der Film dem Ziel hinzufügt, nie ein blasses Ziel
                    let ohneFilm = null;
                    if (teile.has("portal-membran")) {
                        window.__membranOhneFilm(true);
                        try {
                            ohneFilm = await schuss([]);
                        } finally {
                            window.__membranOhneFilm(false);
                        }
                    }
                    const schwelle = 18;
                    const rauschen = window.__bildRauschen(G, G2, W, H, schwelle);
                    const { teil, misch } = window.__klassenTeilung(G, Os, W, H, schwelle);
                    // die Teilung des Schusses für ein folgendes `eval` (der Pulk der Herde, tiere.K1): je Pixel 1 + Index in `namen`
                    window.__letzteTeilung = { teil, namen, W, H };
                    const klassen = {};
                    // das Außen der Silhouette (`klassenMasse` kante): kein gemessener Teil — Himmel, Boden, Holz
                    const aussen = new Uint8Array(W * H);
                    for (let p = 0; p < W * H; p++) aussen[p] = teil[p] === 0 ? 1 : 0;
                    // DIE TREUE ZUM ZIEL (D8, abnahme-urteil `zielTreue`): je Pixel der Membran-Klasse der Strahl der Kamera auf die Ebene
                    // jeder wachen Membran, von dort die Stellvertreter-Kugel (`MEMBRAN_GESETZ.film.kugel`) → das Ziel-Panorama
                    // (`r._torZielDaten(rec)`). r = Spearman zwischen der Luma des Bilds und der des Ziels
                    // — rang-treu über Belichtung, Tonkurve und sRGB. Die Welle (≤ Amplitude) und die Brechung des Films sind nicht gerechnet.
                    const zielTreue = (m) => {
                        const T = window.THREE;
                        if (typeof r._torZielDaten !== "function")
                            return { r: null, pixel: 0, grund: "die Welt hält kein Ziel-Panorama (kein Studio-Export)" };
                        const cam = r.state.camera;
                        cam.updateMatrixWorld(true);
                        const recs = [];
                        for (const rec of r._portalMembranes ? r._portalMembranes.values() : []) {
                            if (!rec.mesh || !rec.mesh.visible || !rec.mesh.parent) continue;
                            const Z = r._torZielDaten(rec);
                            if (!Z)
                                return { r: null, pixel: 0, grund: `die Membran ${rec.entry.type} hält kein Ziel-Panorama` };
                            const film = rec.tor.gesetz.film;
                            if (!film || !(film.kugel > 0)) return { r: null, pixel: 0, grund: "MEMBRAN_GESETZ ohne film.kugel" };
                            rec.mesh.updateMatrixWorld(true);
                            recs.push({ Z, inv: rec.mesh.matrixWorld.clone().invert(), mu: rec.tor.mu, R: rec.tor.mu.height * film.kugel });
                        }
                        const o = new T.Vector3(),
                            q = new T.Vector3(),
                            ol = new T.Vector3(),
                            dl = new T.Vector3();
                        const bild = [],
                            ziel = [];
                        for (let y = 0; y < H; y++)
                            for (let x = 0; x < W; x++) {
                                const p = y * W + x;
                                if (m[p] !== 1) continue;
                                o.setFromMatrixPosition(cam.matrixWorld);
                                q.set(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).unproject(cam).sub(o).normalize().add(o);
                                let best = null;
                                for (const R of recs) {
                                    ol.copy(o).applyMatrix4(R.inv);
                                    dl.copy(q).applyMatrix4(R.inv).sub(ol);
                                    if (Math.abs(dl.z) < 1e-9) continue;
                                    const t = -ol.z / dl.z;
                                    if (t <= 0 || (best && t >= best.t)) continue;
                                    const hx = ol.x + dl.x * t,
                                        hy = ol.y + dl.y * t;
                                    const mu = R.mu;
                                    const u = (hx - mu.left) / mu.spanW;
                                    if (!(u >= 0 && u <= 1) || hy < mu.baseY) continue;
                                    const fi = u * (mu.profil.length - 1),
                                        i0 = Math.floor(fi),
                                        i1 = Math.min(mu.profil.length - 1, i0 + 1);
                                    const top = mu.baseY + (mu.profil[i0] + (mu.profil[i1] - mu.profil[i0]) * (fi - i0)) * mu.height;
                                    if (hy > top) continue;
                                    best = { t, R, hx, hy, d: dl.clone().normalize() };
                                }
                                if (!best) continue;
                                const { R, d } = best;
                                const ox = best.hx,
                                    oy = best.hy - R.mu.centerY;
                                const bq = ox * d.x + oy * d.y,
                                    cq = ox * ox + oy * oy - R.R * R.R;
                                const tq = -bq + Math.sqrt(Math.max(bq * bq - cq, 0));
                                const vx = ox + d.x * tq,
                                    vy = oy + d.y * tq,
                                    vz = d.z * tq;
                                const vl = Math.hypot(vx, vy, vz) || 1;
                                const uu = Math.atan2(vz / vl, vx / vl) / (2 * Math.PI) + 0.5;
                                const vv = Math.asin(Math.max(-1, Math.min(1, vy / vl))) / Math.PI + 0.5;
                                const Z = R.Z;
                                const zx = Math.min(Z.w - 1, Math.max(0, Math.floor(uu * Z.w))),
                                    zy = Math.min(Z.h - 1, Math.max(0, Math.floor(vv * Z.h)));
                                const zi = (zy * Z.w + zx) * 4;
                                ziel.push(0.2126 * Z.daten[zi] + 0.7152 * Z.daten[zi + 1] + 0.0722 * Z.daten[zi + 2]);
                                bild.push(0.2126 * u8[p * 4] + 0.7152 * u8[p * 4 + 1] + 0.0722 * u8[p * 4 + 2]);
                            }
                        const P = bild.length;
                        if (P < 50) return { r: null, pixel: P, grund: "kein Pixel der Klasse trifft eine Apertur" };
                        const raenge = (a) => {
                            const idx = a.map((_v, i) => i).sort((i, j) => a[i] - a[j]);
                            const rg = new Float64Array(a.length);
                            for (let k = 0; k < idx.length; ) {
                                let e = k;
                                while (e + 1 < idx.length && a[idx[e + 1]] === a[idx[k]]) e++;
                                for (let z = k; z <= e; z++) rg[idx[z]] = (k + e) / 2;
                                k = e + 1;
                            }
                            return rg;
                        };
                        const ra = raenge(bild),
                            rb = raenge(ziel);
                        const mittel = (P - 1) / 2;
                        let sab = 0,
                            saa = 0,
                            sbb = 0;
                        for (let i = 0; i < P; i++) {
                            sab += (ra[i] - mittel) * (rb[i] - mittel);
                            saa += (ra[i] - mittel) ** 2;
                            sbb += (rb[i] - mittel) ** 2;
                        }
                        if (!(saa > 0 && sbb > 0)) return { r: null, pixel: P, grund: "Bild oder Ziel ohne Struktur in der Öffnung" };
                        return { r: +(sab / Math.sqrt(saa * sbb)).toFixed(3), pixel: P, grund: null };
                    };
                    namen.forEach((n, j) => {
                        const m = new Uint8Array(W * H);
                        for (let p = 0; p < W * H; p++) m[p] = teil[p] === j + 1 ? 1 : 0;
                        const mb = /^portal-membran$/.test(n);
                        const ms = window.__klassenMasse(u8, m, W, H, aussen, mb ? ohneFilm : null, spiegel);
                        if (mb && ms.pixel) ms.ziel = zielTreue(m);
                        if (ms.pixel) klassen[n] = Object.assign({ objekte: teile.get(n).length }, ms);
                    });
                    // DIE PROBEN DES GESICHTS (`--gesicht`): je Vertex des Kopfs sein Zug (Iris am Gelenk, auf der
                    // Kopf-Haut der Ton des Ofens, koerper `kopfToene`), projiziert auf den Schirm; `__gesichtMasse` liest das BILD dort,
                    // wo die Teilung den Teil des Vertex zeigt (abnahme-urteil). Die Töne kommen aus dem Leib selbst (der häufigste
                    // Vertex-Ton der Kopf-Haut ist die Haut, der der Strähnen das Haar), nie von Hand.
                    let gesicht = null;
                    if (k.gesicht != null) {
                        const T = window.THREE;
                        const K = window.__koerperCore;
                        if (!K || typeof K.kopfToene !== "function" || !K.KOPF_SOLL)
                            throw new Error("--gesicht: koerper-core ohne kopfToene/KOPF_SOLL in der Seite");
                        const lin = (hx) =>
                            [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map((c) =>
                                c / 255 <= 0.04045 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4)
                            );
                        const hexAus = (c) =>
                            c.reduce((h, x0) => {
                                const x = x0 <= 0.0031308 ? 12.92 * x0 : 1.055 * Math.pow(x0, 1 / 2.4) - 0.055;
                                return h * 256 + Math.max(0, Math.min(255, Math.round(x * 255)));
                            }, 0);
                        const knochen = (o, i) => {
                            const si = o.geometry.attributes.skinIndex,
                                sw = o.geometry.attributes.skinWeight;
                            if (!si || !o.skeleton) return o.parent && o.parent.name === "head" ? "head" : null;
                            let best = null,
                                bw = 0;
                            for (let c = 0; c < 4; c++) {
                                const wt = sw.getComponent(i, c);
                                if (wt > bw) {
                                    bw = wt;
                                    best = o.skeleton.bones[si.getComponent(i, c)].name;
                                }
                            }
                            return best;
                        };
                        const modus = (liste) => {
                            const z = new Map();
                            for (const c of liste) {
                                const key = c.map((x) => x.toFixed(3)).join(",");
                                z.set(key, (z.get(key) || 0) + 1);
                            }
                            const best = [...z.entries()].sort((a, b) => b[1] - a[1])[0];
                            return best ? best[0].split(",").map(Number) : null;
                        };
                        const farbe = (o, i) => {
                            const ca = o.geometry.attributes.color;
                            return ca
                                ? [ca.getX(i), ca.getY(i), ca.getZ(i)]
                                : [o.material.color.r, o.material.color.g, o.material.color.b];
                        };
                        const hautVs = [],
                            haarVs = [];
                        for (const [n, os] of teile) {
                            if (!/^spieler:kopf\//.test(n)) continue;
                            for (const o of os) {
                                const pa = o.geometry.attributes.position;
                                for (let i = 0; i < pa.count; i++) {
                                    if (/\/hair$/.test(n)) haarVs.push(farbe(o, i));
                                    else if (/\/(haut|skin)$/.test(n) && knochen(o, i) === "head")
                                        hautVs.push(farbe(o, i));
                                }
                            }
                        }
                        const hautLin = modus(hautVs),
                            haarLin = modus(haarVs);
                        if (!hautLin) throw new Error("--gesicht: keine Kopf-Haut am Gelenk head");
                        const KT = K.kopfToene(hexAus(hautLin));
                        const toene = { haut: hautLin, lippe: lin(KT.lips), hoehle: lin(KT.socket) };
                        if (haarLin) toene.kappe = haarLin;
                        const v = new T.Vector3();
                        const roh = [];
                        let minY = Infinity,
                            maxY = -Infinity,
                            nm = 0;
                        const mitte = new T.Vector3();
                        for (const [n, os] of teile) {
                            if (!/^spieler:kopf\/(auge|haut|skin)$/.test(n)) continue;
                            const kix = namen.indexOf(n) + 1;
                            for (const o of os) {
                                const pa = o.geometry.attributes.position;
                                for (let i = 0; i < pa.count; i++) {
                                    const kn = knochen(o, i);
                                    let z = null,
                                        seite = null;
                                    if (/\/auge$/.test(n) && /^iris[LR]$/.test(kn)) {
                                        z = "iris";
                                        seite = kn;
                                    } else if (kn === "head" && /\/(haut|skin)$/.test(n)) {
                                        const c = farbe(o, i);
                                        let bd = 1e-4;
                                        for (const [t, tc] of Object.entries(toene)) {
                                            const d = (c[0] - tc[0]) ** 2 + (c[1] - tc[1]) ** 2 + (c[2] - tc[2]) ** 2;
                                            if (d < bd) {
                                                bd = d;
                                                z = t;
                                            }
                                        }
                                    }
                                    if (!z) continue;
                                    o.getVertexPosition(i, v);
                                    v.applyMatrix4(o.matrixWorld);
                                    if (z !== "iris") {
                                        minY = Math.min(minY, v.y);
                                        maxY = Math.max(maxY, v.y);
                                        mitte.add(v);
                                        nm++;
                                    }
                                    const ndc = v.clone().project(cam);
                                    roh.push({
                                        z,
                                        seite,
                                        k: kix,
                                        w: v.clone(),
                                        d: v.distanceTo(cam.position),
                                        x: Math.floor(((ndc.x + 1) / 2) * W),
                                        y: Math.floor(((1 - ndc.y) / 2) * H),
                                    });
                                }
                            }
                        }
                        mitte.divideScalar(Math.max(1, nm));
                        const zurCam = cam.position.clone().sub(mitte);
                        const yHaar = minY + K.KOPF_SOLL.haarLinie * (maxY - minY);
                        const median = {};
                        for (const sd of ["irisL", "irisR"]) {
                            const ds = roh
                                .filter((p) => p.seite === sd)
                                .map((p) => p.d)
                                .sort((a, b) => a - b);
                            median[sd] = ds.length ? ds[Math.floor(ds.length / 2)] : null;
                        }
                        const proben = roh
                            .filter((p) => p.x >= 0 && p.y >= 0 && p.x < W && p.y < H)
                            .map((p) => ({
                                z: p.z,
                                x: p.x,
                                y: p.y,
                                k: p.k,
                                vorn: p.z === "iris" ? p.d < median[p.seite] : p.w.clone().sub(mitte).dot(zurCam) > 0,
                                kalotte: p.z !== "iris" && p.w.y > yHaar,
                            }));
                        const haarK = namen.map((n, j) => (/^spieler:kopf\/hair$/.test(n) ? j + 1 : 0)).filter(Boolean);
                        gesicht = window.__gesichtMasse(u8, teil, W, H, proben, haarK);
                        gesicht.toene = Object.fromEntries(
                            Object.entries(toene).map(([t, c]) => [t, hexAus(c).toString(16).padStart(6, "0")])
                        );
                    }
                    let abstand = null;
                    if (k.abstand) {
                        const T = window.THREE;
                        // die Bänder: der Ring der Nah-Wiese (ihr Radius in DIESER Welt) ist eine Kante
                        const ring = r.constructor.NAH_WIESE ? r.constructor.NAH_WIESE.radius : null;
                        const baender = [...new Set([0, 2, 5, 10, ring, 30, 80, 200].filter((x) => x != null))].sort(
                            (a, b2) => a - b2
                        );
                        const zahl = {},
                            cosS = baender.slice(1).map(() => 0),
                            cosN = baender.slice(1).map(() => 0),
                            ftK = new Map(); // DIE FARBTON-STREUUNG (W1): je 2-m-Kachel des Bodens in 2–5 m die Proben
                        const pos = cam.position.clone();
                        const v = new T.Vector3();
                        const band = (d) => {
                            for (let b = 0; b < baender.length - 1; b++) if (d < baender[b + 1]) return b;
                            return -1;
                        };
                        for (let y0 = 0; y0 < H; y0 += 2)
                            for (let x0 = 0; x0 < W; x0 += 2) {
                                let jemand = false;
                                for (let q = 0; q < 4; q++) {
                                    const x = x0 + (q & 1),
                                        y = y0 + (q >> 1);
                                    if (x < W && y < H && teil[y * W + x]) jemand = true;
                                }
                                if (!jemand) continue;
                                v.set(((x0 + 1) / W) * 2 - 1, -(((y0 + 1) / H) * 2 - 1), 0.5)
                                    .unproject(cam)
                                    .sub(pos)
                                    .normalize();
                                if (v.y >= -1e-4) continue;
                                // der Strahl bis zum gezeichneten Boden: Schritte wachsen mit dem Abstand, dann halbiert
                                let t0 = 0,
                                    t = 0.2,
                                    hit = -1;
                                while (t < baender[baender.length - 1]) {
                                    const gy = r._bodenSichtAt(pos.x + v.x * t, pos.z + v.z * t);
                                    if (gy != null && pos.y + v.y * t <= gy) {
                                        let a = t0,
                                            b = t;
                                        for (let it = 0; it < 8; it++) {
                                            const m2 = (a + b) / 2;
                                            const g2 = r._bodenSichtAt(pos.x + v.x * m2, pos.z + v.z * m2);
                                            if (g2 != null && pos.y + v.y * m2 <= g2) b = m2;
                                            else a = m2;
                                        }
                                        hit = b;
                                        break;
                                    }
                                    t0 = t;
                                    t += Math.max(0.05, 0.04 * t);
                                }
                                if (hit < 0) continue;
                                const d = Math.hypot(v.x * hit, v.z * hit);
                                const bi = band(d);
                                if (bi < 0) continue;
                                const kk = d >= 2 && d < 5 && x0 + 1 < W && y0 + 1 < H && `${Math.floor((pos.x + v.x * hit) / 2)},${Math.floor((pos.z + v.z * hit) / 2)}`;
                                if (kk) window.__farbtonProbe(ftK.get(kk) || ftK.set(kk, [0, 0, 0, 0]).get(kk), u8, (y0 * W + x0) * 4, W);
                                for (let q = 0; q < 4; q++) {
                                    const x = x0 + (q & 1),
                                        y = y0 + (q >> 1);
                                    const c = x < W && y < H ? teil[y * W + x] : 0;
                                    if (!c) continue;
                                    const n = namen[c - 1];
                                    (zahl[n] || (zahl[n] = baender.slice(1).map(() => 0)))[bi]++;
                                    cosS[bi] += -v.y;
                                    cosN[bi]++;
                                }
                            }
                        abstand = {
                            baender,
                            ring,
                            augeUeberBoden: +(pos.y - (r._bodenSichtAt(pos.x, pos.z) || 0)).toFixed(2),
                            cos: cosS.map((s, b) => (cosN[b] ? +(s / cosN[b]).toFixed(4) : null)),
                            klassen: zahl,
                            farbton: { kachel: 2, band: [2, 5], belichtung: +r.state.renderer.toneMappingExposure.toFixed(4) },
                        };
                        abstand.farbton.kacheln = [...ftK].map(([kk, a]) => [kk, a[0], +a[1].toFixed(3), +a[2].toFixed(3), a[3]]);
                    }
                    // die Maske: jede Klasse in ihrem Ton über dem Bild, der Rest blau-grau
                    const ton = [
                        [255, 80, 80],
                        [80, 255, 80],
                        [80, 120, 255],
                        [255, 220, 60],
                        [255, 80, 255],
                        [60, 230, 230],
                        [255, 150, 40],
                        [180, 120, 255],
                    ];
                    const mu8 = new Uint8Array(W * H * 4);
                    for (let p = 0; p < W * H; p++) {
                        const i = p * 4;
                        const c = teil[p];
                        if (c) {
                            const f = ton[(c - 1) % ton.length];
                            for (let ch = 0; ch < 3; ch++) mu8[i + ch] = Math.round(0.6 * u8[i + ch] + 0.4 * f[ch]);
                        } else {
                            const g = 0.25 * (0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2]);
                            mu8[i] = g;
                            mu8[i + 1] = g;
                            mu8[i + 2] = g + 40;
                        }
                        mu8[i + 3] = 255;
                    }
                    klasse = {
                        ausdruck: k.klasse,
                        schwelle,
                        rauschen,
                        misch,
                        toene: namen.map((n, j) => `${n}=${ton[j % ton.length].join("/")}`),
                        klassen,
                        abstand,
                        gesicht,
                        // die Armlänge, wie die Tiefe der Bildmitte sie misst
                        arm: k.arm == null ? undefined : { soll: +k.arm, ist: +(mitte(spiegel) || cam.position).distanceTo(cam.position).toFixed(3) },
                        maske: window.__png(mu8, W, H),
                    };
                } finally {
                    for (const [o, c] of wurf) o.castShadow = c;
                    bundlesNeu();
                    r._schattenAlleNeu();
                    for (const [m, eigen, alt] of ruhen)
                        if (eigen) r[m] = alt;
                        else delete r[m];
                }
            }
            const lum = (i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            let n = 0,
                l = 0,
                k2 = 0;
            for (let y = Math.floor(H / 2); y < H - 1; y++)
                for (let x = 0; x < W - 1; x++) {
                    const i = (y * W + x) * 4;
                    const a = lum(i);
                    l += a;
                    k2 += Math.abs(a - lum(i + 4)) + Math.abs(a - lum(i + W * 4));
                    n++;
                }
            (cam.fov = fov0), cam.updateProjectionMatrix();
            return {
                kamera: auf.abnahme.pose.kamera.map((v) => +v.toFixed(2)),
                abnahme: auf.abnahme,
                hell: +(l / n).toFixed(1),
                kontrast: +(k2 / (2 * n)).toFixed(2),
                dc: auf.info.drawCalls,
                dreiecke: auf.info.triangles,
                ms: Math.round(auf.ms),
                klasse,
                png: window.__png(u8, W, H),
            };
        }, k);

    const steuer = http.createServer((req, res) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", async () => {
            const send = (o) => {
                if (res.headersSent) return;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(Object.assign({ ms: Date.now() - t0 }, o))); // jede Antwort trägt ihre Dauer
            };
            let b = {};
            try {
                b = d ? JSON.parse(d) : {};
            } catch {}
            const t0 = Date.now();
            // DIE STEMPEL-WACHE (scripts/lib/zerlege-linse.cjs): sobald der Pool steht, zählt sie jede verweigerte Abfrage.
            const stempel = () =>
                page
                    .evaluate(() => (window.__stempelWache ? window.__stempelWache() : null))
                    .then((w) => Object.assign({ warnung: stempelWarnung.n }, w || {}))
                    .catch(() => null);
            await stempel();
            try {
                // DER SCHIRM: was der Spieler sieht — der präsentierte Canvas nach einer Sekunde echter Loop.
                if (req.url === "/schirm") {
                    await page.evaluate(lauf, { sek: 0.5, ein: 1, regler: b.regler || "frei", tiere: "halten" });
                    await page.evaluate(() => {
                        const r = window.anazhRealm;
                        r.state.renderer.setAnimationLoop((t) => r._gameLoopTick(t));
                    });
                    await sleep(300);
                    const datei = path.resolve(
                        b.datei || ablage(`schirm-${Date.now()}.png`)
                    );
                    ordnerFuer(datei);
                    await page.screenshot({ path: datei });
                    await loopAus();
                    return send({ datei });
                }
                // DAS FENSTER: Viewport wechseln wie ein Spieler (Fenster ziehen, Vollbild) — feuert das resize-Ereignis.
                if (req.url === "/fenster") {
                    await page.setViewport({ width: +b.w || 1920, height: +b.h || 1080, deviceScaleFactor: 1 });
                    return send({ fenster: [+b.w || 1920, +b.h || 1080] });
                }
                if (req.url === "/latenz") {
                    const cdp = await page.target().createCDPSession(), proben = {}, vp = page.viewport();
                    const taste = { gehen: ["KeyW", "w", 87], wechsel: ["KeyV", "v", 86], springen: ["Space", " ", 32], einsteigen: ["KeyE", "e", 69] }; // hieb klickt
                    const tu = (verb, type, [code, key, vk] = taste[verb] || []) =>
                        code
                            ? cdp.send("Input.dispatchKeyEvent", { type, code, key, windowsVirtualKeyCode: vk })
                            : cdp.send("Input.dispatchMouseEvent", { type: type === "keyDown" ? "mousePressed" : "mouseReleased", x: vp.width / 2, y: vp.height / 2, button: "left", clickCount: 1 });
                    for (const type of ["keyDown", "keyUp"]) await tu("hieb", type); // der Klick fängt den Zeiger, wie beim Spieler
                    await page.evaluate(HL.latenzAn, { verzug: +b.verzug || 0 });
                    let bildMs = null;
                    try {
                        for (const sicht of String(b.sichten).split(","))
                            for (const verb of String(b.verben).split(",")) {
                                const reihe = (proben[`${sicht}/${verb}`] = []);
                                for (let i = 0; i < +b.proben; i++) {
                                    const s = sicht === "ego" ? "first" : "third";
                                    if (!taste[verb] && verb !== "hieb") throw new Error(`latenz: kein Verb ${verb}`);
                                    if (!(await page.evaluate((s, z, v) => window.__latenz.bereit(s, z, v), s, verb !== "wechsel", verb))) {
                                        reihe.push({ unruhe: true });
                                        if (reihe.filter((p) => p.unruhe).length < 3) continue;
                                        throw new Error(`latenz ${sicht}/${verb}: keine Ruhe (8 stille in 240 Bildern) — der Leib steht nicht`);
                                    }
                                    await tu(verb, "keyDown");
                                    if (verb === "hieb") await tu(verb, "keyUp"); // gehalten mahlte der Hieb nach
                                    reihe.push(await page.evaluate(() => window.__latenz.treffer()));
                                    await tu(verb, "keyUp");
                                }
                            }
                    } finally {
                        bildMs = await page.evaluate(() => window.__latenz.ende());
                        await cdp.detach();
                    }
                    return send(Object.assign(HL.latenzUrteil(proben, bildMs), { ort: aktOrt }));
                }
                if (req.url === "/gpu-bank")
                    return send(
                        Object.assign(await page.evaluate(gpuBank, { n: +b.n || 12, runden: +b.runden || 3 }), {
                        })
                    );
                // DIE WACHEN der Mess-Folge (scripts/omen-messfolge.cjs, nach jedem Schritt): der Stempel-Pool, das Buch des
                // Wetter-Spions seit `seit` und das des Welt-Akt-Spions seit `seitWelt`, der gestellte Ort (Aufstellung,
                // Dorf-Zug, Ort-Takt, Gier, Spieler), das Fenster (Viewport und Zeichen-Puffer), die Seiten-Fehler — das Urteil
                // spricht die Folge (`wachenUrteil`); dazu die Tiere (`tierZahl`: ein Weltzustand neben jeder Messung, kein
                // Urteil).
                if (req.url === "/wache") {
                    const w = await page.evaluate(
                        (a) => {
                            const r = window.anazhRealm;
                            const st = r.state;
                            const pm = st.playerMesh.position;
                            const db = st.renderer.getDrawingBufferSize(new window.THREE.Vector2());
                            return {
                                wetter: window.__wetterBuch(a.seit),
                                weltakt: window.__weltaktBuch(a.seitWelt),
                                ort: {
                                    dorfZug: window.__anazhAutoSettlement !== false,
                                    ortTakt: window.__ortTakt || [],
                                    gier: st.yaw,
                                    spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                                    kamera: st.cameraMode,
                                },
                                fenster: { innen: [window.innerWidth, window.innerHeight], puffer: [db.x, db.y] },
                                tiere: window.__tierZahl(),
                                version: r.constructor.VERSION,
                            };
                        },
                        { seit: Number(b.seit) || 0, seitWelt: Number(b.seitWelt) || 0 }
                    );
                    w.ort.ort = aktOrt;
                    w.ort.sicht = BAND.sichtSchluessel(BAND.ladeSpec().haushalt, w.ort.kamera);
                    return send(
                        Object.assign(w, {
                            stempel: await stempel(),
                            boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                            echt: ECHT,
                            fehler: fehler.slice(),
                            zerstoert: zerstoert.n,
                        })
                    );
                }
                if (req.url === "/status") {
                    const s = await page.evaluate(() => {
                        const st = window.anazhRealm.state;
                        const p = st.playerMesh.position;
                        return {
                            spieler: [p.x, p.y, p.z].map((v) => +v.toFixed(1)),
                            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                            wetter: st.weather,
                            saison: st.season,
                        };
                    });
                    return send(
                        Object.assign(s, {
                            boot: Object.assign({ art: bootArt() }, boot),
                            zerstoert: zerstoert.n,
                            stempel: await stempel(),
                            fehler: fehler.slice(-12),
                            gpuFehler: await page.evaluate(() => {
                                const F = window.__gpuFehler;
                                return F ? { device: F.device.length, drawsOhneSlot: F.draws.length } : null;
                            }),
                        })
                    );
                }
                // DIE GPU-FEHLER-LINSE (V-D7): jede Device-Meldung und jeder Draw ohne gesetzten Vertex-Slot, mit Objekt.
                if (req.url === "/gpu-fehler")
                    return send(await page.evaluate(() => window.__gpuFehler || { fehlt: "Abgriff nicht installiert" }));
                if (req.url === "/umstellen") {
                    if (b.ort) {
                        const { ort, haushalt } = BAND.ladeSpec(b.ort);
                        // die Sicht des Orts: verlangt (`--sicht`) oder Ego, der Start jeder Welt — nie die zuletzt gespeicherte
                        // (`anazhRealmCameraMode` überlebt im Profil der Serie den Zweit-Boot)
                        const sicht = b.sicht || "ego";
                        if (!haushalt.sichten[sicht])
                            throw new Error(`keine Sicht „${sicht}" (${Object.keys(haushalt.sichten).join(", ")})`);
                        aktOrt = ort.id;
                        aktSicht = sicht;
                        const welt = ort.welt ? await weltDesOrts(ort) : null;
                        // DIE POSE (Toggle-Ort): eine Station des Orts mit eigenem Spieler-Platz und Blick
                        const pose = b.pose ? (ort.posen || []).find((p) => p.id === b.pose) : null;
                        if (b.pose && !pose)
                            throw new Error(
                                `Messort ${ort.id}: keine Pose „${b.pose}" (posen: ${(ort.posen || []).map((p) => p.id).join(", ")})`
                            );
                        const stelle = pose || ort;
                        const o = await umstellen(stelle.spieler[0], stelle.spieler[1], {
                            ort: ort.id,
                            anker: ort.anker || null,
                            gier: BAND.ortGier(stelle),
                            dorfZug: ort.dorfZug,
                            takt: ort.ortTakt,
                            stell: ort.stell || null,
                            kamera: haushalt.sichten[sicht].kamera,
                            gruendung: ort.gruendung || null,
                            bahn: ort.bahn || null,
                            anlauf: ort.anlauf || null,
                            dach: ort.dach || null,
                        });
                        // DIE WIESE: ein Ort mit Wiesen-Gesetz (`wiese`) hält es in der Welt, die eben stand — dieselbe
                        // Messung wie gate:profiband H1 (scripts/lib/welt-orte.cjs), dazu das Gras der gebauten Boden-Karte. Ein
                        // Ort, der keine Wiese ist, bricht die Aufstellung laut.
                        let wiese = null;
                        if (ort.wiese && !pose) {
                            wiese = await page.evaluate(
                                (install, x, z, blick, S) => {
                                    (0, eval)(install);
                                    const m = window.__wieseMessen(window.anazhRealm, x, z, blick, S);
                                    return { messung: m, befunde: window.__wieseUrteil(m, S, true) };
                                },
                                WIESE_INSTALL,
                                ort.spieler[0],
                                ort.spieler[1],
                                ort.blick,
                                ort.wiese
                            );
                            if (wiese.befunde.length)
                                throw new Error(`Messort ${ort.id} ist keine Wiese: ${wiese.befunde.join(" · ")}`);
                        }
                        return send(
                            Object.assign(
                                { ort: ort.id, sicht, pose: pose ? pose.id : null, welt, spieler: stelle.spieler, wiese },
                                o,
                                {
                                }
                            )
                        );
                    }
                    aktOrt = null;
                    aktSicht = null;
                    return send(await umstellen(+b.x, +b.z));
                }
                if (req.url === "/bild") {
                    // DER SPIELER AN DER POSE: Ring, Wald und Stufen-Auge stehen am Spieler — eine Kamera mehr als einen Chunk
                    // neben ihm sah fernen Boden ohne die Bäume der Pose (laub-kante: fimp:atlas:L2 0,6737 bei misch 0). Die Pose
                    // aus dem Leib (`--gesicht`, `--arm`) und der Spieler im Bild (`--spieler`) bleiben, wo er steht.
                    const fern = (x, z, p = window.anazhRealm.state.playerMesh.position) =>
                        Math.hypot(p.x - x, p.z - z) > window.anazhRealm._voxelChunkConfig(0).span;
                    if (b.gesicht == null && b.arm == null && !b.spieler && (await page.evaluate(fern, +b.px, +b.pz)))
                        await umstellen(+b.px, +b.pz, null);
                    // DIE LEINWAND DER KLASSE: die Soll-Tafel misst im Pixel des Schirms, 1920 × 1080 wie ihre Messungen — das
                    // Fenster wie ein Spieler (`/fenster`), bis die Welt es trägt; danach das Fenster der Sitzung
                    const vp = page.viewport();
                    if (b.klasse) {
                        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
                        await page.waitForFunction(() => window.anazhRealm.state.renderer.domElement.clientWidth === 1920);
                    }
                    const o = await bild(Object.assign({ w: 640, h: 360 }, b));
                    if (b.klasse) await page.setViewport(vp);
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `bild-${Date.now()}.png`)
                    );
                    ordnerFuer(datei);
                    pngDatei(datei, o.png);
                    delete o.png;
                    // DIE KLASSE: die Maske neben dem Bild, die Maße im Begleit-JSON
                    if (o.klasse) {
                        const mdatei = datei.replace(/\.png$/i, "") + ".maske.png";
                        pngDatei(mdatei, o.klasse.maske);
                        o.klasse.maske = mdatei;
                        if (b.arm != null) o.klasse.urteil = AU.armUrteil(o.klasse);
                        o.abnahme.klasse = o.klasse;
                    }
                    // DAS BEGLEIT-JSON: die Abnahme des Bilds mit dem Stand des Arbeitsbaums (SHA, geändert ja/nein)
                    o.abnahme.stand.sha = gitStand();
                    // DIE MESSUNG IN DIE SOLL-TAFEL (`--ist <id>[:L<n>|:wirkung]`)
                    if (b.ist) {
                        if (!o.klasse) throw new Error("--ist braucht --klasse (die Teilung des Bilds)");
                        const kl = o.klasse;
                        if (!Object.keys(kl.klassen).length)
                            throw new Error(`--ist ${b.ist}: die Klasse zeichnet kein Pixel im Bild — die Tafel bleibt, wie sie war`);
                        // DER ORT DES BILDS (abnahme-urteil `bildPfadFehler`): das Bild der Tafel liegt beim Namen des
                        // Ziels unter artifacts/soll-tafel/ (gitignored, lokal) — nie im Scratch, auf den die Tafel nicht zeigen
                        // darf; kopiert erst, wenn die Tafel die Messung genommen hat (eine abgewiesene ersetzt kein Bild)
                        // MEHRERE ZIELE (D8, `--ist tor-fern:L1,tor-bunt:L1,tor-ziel:L1`): derselbe Schuss misst je Ziel sein
                        // Maß — das erste Ziel trägt den Schuss, jedes weitere nennt ihn (W1-n1, `sollIstSchreiben`)
                        const ziele = String(b.ist).split(",").filter(Boolean);
                        const ablage = sollAblage(ziele[0], ".png");
                        const messung = () => ({
                            werkzeug: "bild",
                            datum: new Date().toISOString(),
                            stand: { version: o.abnahme.stand.version, sha: o.abnahme.stand.sha },
                            geraet: { backend: o.abnahme.geraet.backend, adapter: o.abnahme.geraet.adapter },
                            leinwand: [o.abnahme.bild.w, o.abnahme.bild.h],
                            kamera: o.kamera,
                            ausdruck: kl.ausdruck,
                            schwelle: kl.schwelle,
                            rauschen: kl.rauschen,
                            misch: kl.misch,
                            klassen: kl.klassen,
                            abstand: kl.abstand,
                            gesicht: kl.gesicht || null,
                            bild: path.relative(root, ablage).split(path.sep).join("/"),
                        });
                        o.ist = sollIstSchreiben(b.ist, messung());
                        if (ablage !== datei) {
                            fs.copyFileSync(datei, ablage);
                            fs.copyFileSync(kl.maske, sollAblage(ziele[0], ".maske.png"));
                        }
                    }
                    const begleit = datei.replace(/\.png$/i, "") + ".abnahme.json";
                    fs.writeFileSync(begleit, JSON.stringify(o.abnahme, null, 1));
                    if (b.ist && sollAblage(String(b.ist).split(",")[0], ".png") !== datei)
                        fs.copyFileSync(begleit, sollAblage(String(b.ist).split(",")[0], ".abnahme.json"));
                    const zeile = o.abnahme.zeile;
                    delete o.abnahme;
                    return send(Object.assign(o, { abnahme: zeile, datei, gesamtMs: Date.now() - t0 }));
                }
                if (req.url === "/eval") {
                    const o = await page.evaluate(
                        (code) =>
                            new Function("r", "T", `return (async () => { ${code} })();`)(
                                window.anazhRealm,
                                window.THREE
                            ),
                        b.code
                    );
                    return send({ ergebnis: o });
                }
                if (req.url === "/methode") {
                    // `--quelle <datei>`: die Methode aus einem anderen Stand (die Basis eines A/B in EINER Welt)
                    // die Quelle ist eine Stamm-Datei oder ein Baum (scripts/lib/stamm.cjs: beide Formen, laut)
                    const quelle = stammLib.text(b.quelle ? path.resolve(b.quelle) : root);
                    const src = methodeAusQuelle(quelle, b.name);
                    if (!src) return send({ fehler: `Methode ${b.name} nicht gefunden` });
                    const o = await page.evaluate(
                        (name, src, terrain) => {
                            const r = window.anazhRealm;
                            const fn = (0, eval)(src);
                            Object.getPrototypeOf(r)[name] = fn;
                            const aus = { getauscht: name };
                            if (terrain) {
                                const alt = r.state.voxelChunkMaterial;
                                r.state.voxelChunkMaterial = null;
                                const neu = r._getVoxelChunkMaterial();
                                let n = 0;
                                r.state.scene.traverse((m) => {
                                    if (m.material === alt) {
                                        m.material = neu;
                                        n++;
                                    }
                                });
                                aus.chunksNeu = n;
                            }
                            return aus;
                        },
                        b.name,
                        src,
                        !!b.terrain
                    );
                    return send(o);
                }
                if (req.url === "/albedo" && b.nahFern) {
                    // DIE ALBEDO NAH GEGEN FERN: Boden-Satz gegen Fern-Ring an derselben Stelle, das Urteil in Node.
                    // Den Takt treibt die Route selbst wie `umstellen` (danach läuft kein
                    // Loop: einmal stand die Welt 120 s bei 9 Chunks und bereit 0). Steht sie am Deckel nicht, misst die Linse
                    // trotzdem und urteilt laut — mit dem Zustand der Welt (`welt`) beim Namen.
                    // DAS QUADRAT DER LINSE ist das 5 × 5 der Chunks um den Chunk des SPIELERS (die Linse wählt ihre Orte um
                    // ihn): jeder steht im Boden-Satz oder ist leer. `_builtRingRadius` misst um `lastPlayerVoxelChunk` — in
                    const welt = await page.evaluate(async () => {
                        const r = window.anazhRealm;
                        const st = r.state;
                        const t0 = performance.now();
                        const quadrat = () => {
                            const satz = st.chunkSaetze && st.chunkSaetze.get("boden");
                            const span = r._voxelChunkConfig().span;
                            const pp = st.playerMesh.position;
                            const cx = Math.floor(pp.x / span),
                                cz = Math.floor(pp.z / span);
                            const fehlt = [];
                            for (let dx = -2; dx <= 2; dx++)
                                for (let dz = -2; dz <= 2; dz++) {
                                    const key = `${cx + dx},${cz + dz}`;
                                    const e = st.voxelChunks ? st.voxelChunks.get(key) : null;
                                    if (!(e && e.empty) && !(satz && satz.bloecke.has(key))) fehlt.push(key);
                                }
                            return { chunk: `${cx},${cz}`, fehlt };
                        };
                        let q = quadrat(),
                            takte = 0;
                        // DIE KARTE GEHÖRT DIESEM ORT: ihr Anker ist die Chunk-Mitte des Spielers in der Größe des Rings
                        // (`_fernKroneNahTakt`) — bereit 1 ohne Job hiess nach dem Umstellen zweimal von acht: die Karte des alten
                        // Orts (Welt stand nach 2 Takten), dann füllte sie neu und der Boden mischte im Schuss nichts (ROT „Karte“).
                        const karteHier = (k) => {
                            const a = k && k.anker;
                            const span = r._voxelChunkConfig().span;
                            const ring = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
                            const p = st.playerMesh.position;
                            return (
                                !!a &&
                                k.U.bereit.value === 1 &&
                                !k.job &&
                                a.x === (Math.floor(p.x / span) + 0.5) * span &&
                                a.z === (Math.floor(p.z / span) + 0.5) * span &&
                                a.groesse === span * (2 * ring + 1 + r.constructor.FERN_KRONE_NAH.rand)
                            );
                        };
                        const zustand = (gestanden) => {
                            const k = st.fernKroneNah;
                            return {
                                gestanden,
                                ms: Math.round(performance.now() - t0),
                                takte,
                                chunk: q.chunk,
                                fehlt: q.fehlt,
                                gebaut: r._builtRingRadius(),
                                ring: st.chunkRingRadius,
                                imBau: st.voxelMeshPending ? st.voxelMeshPending.size : 0,
                                karte: k ? (karteHier(k) ? 1 : 0) : null,
                            };
                        };
                        const steht = () => {
                            if (!(st.chunkRingRadius >= 2)) st.chunkRingRadius = 2;
                            if (!(st._activeRingRadius >= 2)) st._activeRingRadius = 2;
                            const k = st.fernKroneNah;
                            const baut = st.voxelMeshPending && st.voxelMeshPending.size > 0;
                            q = quadrat();
                            return q.fehlt.length === 0 && !baut && (!k || karteHier(k));
                        };
                        const takt = async () => {
                            window.__werkTakt();
                            takte++;
                            await sleep(50);
                        };
                        return window.__gebautNach("das Quadrat der Linse", { fertig: steht, takt, max: 1800 }).then(
                            () => zustand(true),
                            () => (steht(), zustand(false))
                        );
                    });
                    // DER UPLOAD IM HAUPTBILD, VOR der Linse in der stehenden Welt: die Linse schießt in
                    // einem eigenen Pass — dort baut jedes Render-Objekt neu und lädt jede Textur frisch, das Hauptbild nicht
                    // (die Observer-Diät refresht nur, was sich ändert). Die Daten-Bilder des Boden-Stoffs (Fern-Krone,
                    // Wege-Karte, Kronen-Streu) heben ihre Version, dann laufen drei Takte der Welt: jede muss die GPU erreichen
                    // (r184 `_textures`), sonst zeichnet der Boden im Spiel ein altes Bild. Vor dem Textur-Wächter der Diät
                    // hielt die GPU 20 Takte lang die alte.
                    const upload = await page.evaluate(async () => {
                        const r = window.anazhRealm;
                        const st = r.state;
                        const rend = st.renderer;
                        const texe = [];
                        if (st.fernKroneNah) texe.push(st.fernKroneNah.tex);
                        if (st.wegeKarte) texe.push(st.wegeKarte.stufen[0].tex, st.wegeKarte.stufen[0].kronen.tex); // je Art EINE Array-Textur
                        const gpu = (t) => {
                            const d = rend._textures.get(t);
                            return d && Number.isFinite(d.version) ? d.version : -1;
                        };
                        // DIE BILDER: ein Takt zeichnet nur, wenn die GPU-Leine frei ist (`_gpuLeineFrei`) — im Software-Holz
                        // zeichneten drei Takte hintereinander kein Bild (die Probe war blind). Gezählt wird `_loopRender`.
                        let gezeichnet = 0;
                        const eigen = Object.prototype.hasOwnProperty.call(r, "_loopRender");
                        const altRender = r._loopRender;
                        r._loopRender = function (...a) {
                            gezeichnet++;
                            return altRender.apply(this, a);
                        };
                        // je Gang die Abgabe der GPU: danach ist die Leine frei, der nächste Takt zeichnet
                        const bilder = async (n) => {
                            const ziel = gezeichnet + n;
                            for (const weiter = window.__deckel("die Bilder der Linse", 120, false); gezeichnet < ziel && weiter(); ) {
                                try {
                                    if (window.__buehne) window.__buehne();
                                    r._gameLoopTick(performance.now());
                                } catch {}
                                await rend.backend.device.queue.onSubmittedWorkDone();
                            }
                            return n - Math.max(0, ziel - gezeichnet);
                        };
                        // DIE RUHE: jede Änderung am Boden-Satz (ein Chunk tritt ein, der Geomorph schreibt) refresht sein
                        // Render-Objekt und lädt dabei jede Textur mit — die Probe gilt nur in drei Bildern, in denen der Satz
                        // ruht (nach der Linse lud das Neu-Aufnehmen der Bündel jede Textur ohnehin: blind). Ruht er in fünf
                        // Versuchen nie, urteilt die Probe laut.
                        const satzV = () => {
                            const s = st.chunkSaetze && st.chunkSaetze.get("boden");
                            const g = s && s.geom;
                            if (!g) return "leer";
                            let v = g.id + ":" + (g.index ? g.index.version : -1);
                            for (const k in g.attributes) v += ":" + g.attributes[k].version;
                            return v;
                        };
                        let versuche = 0,
                            ruhig = false,
                            soll = null,
                            danach = 0;
                        try {
                            while (versuche < 5 && !ruhig) {
                                versuche++;
                                await bilder(versuche === 1 ? 10 : 5);
                                const v0 = satzV();
                                soll = texe.map((t) => {
                                    t.needsUpdate = true;
                                    return t.version;
                                });
                                danach = await bilder(3);
                                ruhig = satzV() === v0;
                            }
                        } finally {
                            if (eigen) r._loopRender = altRender;
                            else delete r._loopRender;
                        }
                        return {
                            ruhig,
                            versuche,
                            bilder: danach,
                            texe: texe.map((t, i) => ({ name: t.name, soll: soll[i], gpu: gpu(t) })),
                        };
                    });
                    const m = await seite("__nahFernSicht", {});
                    m.welt = welt;
                    m.upload = upload;
                    const u = LL.nahFernUrteil(m);
                    const aus = Object.assign({ messung: m }, u);
                    if (b.datei) fs.writeFileSync(path.resolve(b.datei), JSON.stringify(aus, null, 1));
                    return send(
                        Object.assign(aus, { datei: b.datei ? path.resolve(b.datei) : null })
                    );
                }
                if (req.url === "/albedo") {
                    // DIE WELT-SEITE DER ALBEDO-TAFEL: dieselbe Linse, je Tafel-Zeile Exemplar · Klasse · Stoff.
                    const t = AT.ladeTafel();
                    // DAS AUGE DER STUFE (`exemplar.stufe`, K63-n7, S8) wählt die Stufe JEDES Exemplars neu — jede solche Zeile misst in ihrem eigenen Gang NACH
                    // den übrigen, die Karte der Eichung liest der erste Gang
                    // DIE UHR-SPALTEN (`uhren`, material.K3 Staffel 2): jede Stufen-Zeile misst zu jeder Uhr der Tafel — die erste ist
                    // die Bühne (Mittag), jede weitere steht als `<id>@<uhr>`
                    const nahZ = t.zeilen.filter((z) => Number.isInteger(z.welt.exemplar.stufe)),
                        liste = [];
                    for (const uhr of t.uhren)
                        for (const zeilen of [...(uhr === 0.5 ? [t.zeilen.filter((z) => !nahZ.includes(z))] : []), ...nahZ.map((z) => [z])])
                            for (const e of await seite("__albedoSicht", { zeilen, w: 640, h: 400, uhr }))
                                if (e.name !== "graukarte" || zeilen.length > 1) liste.push(uhr === 0.5 ? e : Object.assign(e, { id: e.id + "@" + uhr }));
                    const ordner = path.resolve(b.ordner || ablage("albedo-tafel"));
                    fs.mkdirSync(ordner, { recursive: true });
                    const welt = {};
                    let eichung = null;
                    for (const e of liste) {
                        if (e.png) {
                            pngDatei(path.join(
                                    ordner,
                                    "welt-" + String(e.id || e.name).replace(/[^a-z0-9_-]+/gi, "_") + ".png"
                                ), e.png);
                            delete e.png;
                        }
                        if (e.name === "graukarte") eichung = e.gesamt ? e.gesamt.Y : null;
                        else
                            welt[e.id] = e.gesamt
                                ? {
                                      Y: e.gesamt.Y,
                                      rgb: e.gesamt.rgb,
                                      pixel: e.pixel,
                                      zuege: e.zuege,
                                      stoffe: e.stoffe,
                                      gesetzt: e.gesetzt,
                                      stufen: e.stufen,
                                  }
                                : { Y: null, fehler: e.fehler || "kein Pixel" };
                    }
                    const geraet = await geraetInfo();
                    const spieler = await page.evaluate(() => {
                        const p = window.anazhRealm.state.playerMesh.position;
                        return [p.x, p.z].map((v) => +v.toFixed(1));
                    });
                    const messung = {
                        datum: new Date().toISOString(),
                        // der Stand der Welt-Seite (abnahme-urteil `kernStand`): Version und Prüfsumme jedes Kerns
                        stand: kernStand(),
                        echt: ECHT,
                        geraet,
                        ort: aktOrt,
                        spieler,
                        eichung,
                        welt,
                    };
                    const datei = path.resolve(b.datei || path.join(ordner, `welt-${Date.now()}.json`));
                    jsonAb(datei, messung);
                    // Das Urteil gegen das LABOR-Ist der Tafel (die Labor-Seite misst diag-albedo-tafel.cjs --labor).
                    const g = { labor: {}, welt, karten: {}, eichung: { welt: eichung, labor: {} } };
                    for (const z of t.zeilen) if (z.ist) g.labor[z.id] = z.ist.labor;
                    for (const [sid, k] of Object.entries(t.karten)) {
                        if (k.ist) g.karten[sid] = k.ist;
                        g.eichung.labor[sid] = t.karte.albedo;
                    }
                    const u = AT.tafelUrteil(t, g);
                    return send({ urteil: u.urteil, tabelle: AT.tafelTabelle(u), datei, ordner });
                }
                // DIE SHADER-KOSTEN-LINSE (scripts/lib/shader-kosten.cjs): ein echter Frame (Bühne), je gezeichnetem Programm
                // die statischen Kosten seines erzeugten Fragments; `--ordner` legt je Programm das WGSL ab. `--stoff` hält die
                // Programme eines Stoffs (SK.STOFFE) gegen sein Budget (`--gegen` daneben, `--datei` sichert), `--rauschprobe`
                // fährt die Rausch-Probe. `rot` sammelt jeden Bruch beim Namen — der Befehl endet dann mit Exit 1.
                if (req.url === "/shader") {
                    const stoff = b.stoff ? SK.STOFFE[b.stoff] : null;
                    if (b.stoff && !stoff)
                        return send({
                            fehler: `unbekannter Stoff „${b.stoff}" (STOFFE: ${Object.keys(SK.STOFFE).join(", ")})`,
                        });
                    if ((b.gegen || b.datei) && !stoff)
                        return send({
                            fehler: "--gegen und --datei gelten den Programmen eines Stoffs (--stoff <name>)",
                        });
                    const rot = [];
                    const zustand = {};
                    for (const [n, s] of Object.entries(SK.STOFFE)) zustand[n] = s.zustand;
                    const liste = await page.evaluate(async (stoffe) => {
                        window.__buehne();
                        return window.__shaderKosten({ frames: 1, stoffe });
                    }, zustand);
                    if (!liste.length) rot.push("kein Programm im Frame (die Linse ist blind)");
                    const alle = liste
                        .map((p) =>
                            Object.assign(
                                {
                                    programm: p.programm,
                                    objekte: p.objekte,
                                    klassen: p.klassen,
                                    stoffe: p.stoffe,
                                    wgsl: p.fragment,
                                },
                                SK.wgslKosten(p.fragment)
                            )
                        )
                        .sort((x, y) => y.abtastungen.unbedingt - x.abtastungen.unbedingt || y.ops - x.ops);
                    const nur = b.nur ? new RegExp(b.nur) : null;
                    const zeilen = alle.filter(
                        (p) => !nur || nur.test(p.programm) || p.klassen.some(([k]) => nur.test(k))
                    );
                    if (b.ordner) {
                        const ordner = path.resolve(b.ordner);
                        fs.mkdirSync(ordner, { recursive: true });
                        zeilen.forEach((z, i) =>
                            fs.writeFileSync(
                                path.join(
                                    ordner,
                                    `${String(i).padStart(3, "0")}-${z.programm.replace(/[^a-z0-9._-]+/gi, "_")}.wgsl`
                                ),
                                z.wgsl
                            )
                        );
                    }
                    const top = Math.max(1, Number(b.top) || 30);
                    const pad = (x, n) => String(x).padStart(n);
                    const tabelle = [
                        `DIE SHADER-KOSTEN je Programm (statisch, erzeugtes Fragment-WGSL, je Fragment) · ${zeilen.length} Programme${nur ? " (" + b.nur + ")" : ""}`,
                        "Abtastungen: gesamt · unbedingt · im Zweig · in Schleife | Ladungen | Schleifen | Rauschen |   Ops | Objekte | Programm [Stoff] (Klassen)",
                        ...zeilen
                            .slice(0, top)
                            .map(
                                (z) =>
                                    `${pad(z.abtastungen.gesamt, 4)} ${pad(z.abtastungen.unbedingt, 4)} ${pad(z.abtastungen.zweig, 4)} ${pad(z.abtastungen.schleife, 4)} | ${pad(z.ladungen, 4)} | ${pad(z.schleifen, 3)} | ${pad(z.rauschen, 3)} | ${pad(z.ops, 5)} | ${pad(z.objekte, 4)} | ${z.programm}` +
                                    (z.stoffe.length ? " [" + z.stoffe.join(", ") + "]" : "") +
                                    (z.klassen.length > 1
                                        ? " (" + z.klassen.map(([k, n]) => k + " ×" + n).join(", ") + ")"
                                        : "")
                            ),
                    ].join("\n");
                    let stoffBericht = null;
                    if (stoff) {
                        const progs = alle.filter((z) => z.stoffe.includes(b.stoff));
                        if (!progs.length)
                            rot.push(
                                `der Stoff ${b.stoff} (state.${stoff.zustand}) zeichnet in diesem Frame kein Programm (die Linse ist blind)`
                            );
                        const vor = b.gegen ? SK.wgslKosten(fs.readFileSync(path.resolve(b.gegen), "utf8")) : null;
                        if (vor && !vor.einstieg)
                            rot.push(`--gegen ${b.gegen}: kein Fragment-Einstieg (die Linse ist blind)`);
                        if (b.datei)
                            progs.forEach((z, i) => {
                                const d = path.resolve(i ? b.datei.replace(/(\.wgsl)?$/, `-${i + 1}.wgsl`) : b.datei);
                                ordnerFuer(d);
                                fs.writeFileSync(d, z.wgsl);
                            });
                        for (const z of progs)
                            rot.push(...SK.kostenUrteil(z, stoff.budget, `${b.stoff} (${z.programm})`));
                        const namen = (z) =>
                            Object.keys(z.rauschNamen).length
                                ? "\nRausch-Aufrufe: " +
                                  Object.entries(z.rauschNamen)
                                      .map(([f, c]) => f + " ×" + c)
                                      .join(" · ")
                                : "";
                        stoffBericht = {
                            name: b.stoff,
                            budget: stoff.budget,
                            programme: progs.length,
                            tabelle: progs
                                .map(
                                    (z, i) =>
                                        `STOFF ${b.stoff} — Programm ${i + 1}/${progs.length}: ${z.programm} (${z.objekte} Objekte)\n` +
                                        SK.kostenTabelle(z, vor) +
                                        namen(z)
                                )
                                .join("\n\n"),
                        };
                    }
                    let probe = null;
                    if (b.rauschprobe) {
                        probe = await seite("__rauschProbe");
                        rot.push(...SK.probeUrteil(probe));
                    }
                    return send({
                        programme: zeilen.length,
                        tabelle,
                        stoff: stoffBericht,
                        probe,
                        rot,
                        ordner: b.ordner || null,
                    });
                }
                if (req.url === "/diaet") {
                    const o = await seite("__diaetLauf", b);
                    return send(Object.assign(o, { urteil: DIAET.diaetUrteil(o) }));
                }
                if (req.url === "/stand") {
                    const o = await seite("__standLauf", {
                        n: Number(b.n) || 120,
                        ein: b.ein != null ? Number(b.ein) : 5,
                        ruhe: b.ruhe != null ? Number(b.ruhe) : 120,
                        regler: b.regler || "voll",
                        tiere: b.tiere || "frei",
                        sim: b.sim != null ? Number(b.sim) : 60,
                    });
                    return send(
                        Object.assign(o, {
                            urteil: STAND.standUrteil(o),
                            fehler: fehler.slice(-5),
                        })
                    );
                }
                if (req.url === "/sicht") {
                    const o = await seite("__sichtLauf", {
                        ein: Number(b.ein) || 5,
                        ruhe: b.ruhe != null ? Number(b.ruhe) : 120,
                        sonne: b.sonne != null ? Number(b.sonne) : 0,
                        drehen: b.drehen != null ? Number(b.drehen) : 360,
                        drehGrad: b.drehGrad != null ? Number(b.drehGrad) : 1,
                        gehen: b.gehen != null ? Number(b.gehen) : 120,
                        tag: b.tag || "laeuft",
                        regler: b.regler || "voll",
                    });
                    return send(Object.assign(o, { urteil: SICHT.sichtUrteil(o) }));
                }
                if (req.url === "/fluss") {
                    const o = await page.evaluate(() => {
                        const i = window.__flussLinse();
                        return i && i.installiert ? i : window.__flussBericht();
                    });
                    return send(o);
                }
                // DIE PUFFER-LINSE: nach erzwungenem GC jeder Geometrie-Puffer beim Halter (szene · bild · ruhend · verwaist,
                // `__pufferZensus`), der VRAM je Schlüssel, der Heap (JS + Typed-Arrays) und mit `halter` jeder Typed-Array-Pfad.
                const pufferStand = async (halter, top) => {
                    const cdp = await page.target().createCDPSession();
                    for (let i = 0; i < 2; i++) await cdp.send("HeapProfiler.collectGarbage");
                    const u = await cdp.send("Runtime.getHeapUsage");
                    await cdp.detach();
                    const o = await page.evaluate(
                        async (halter, top) => {
                            await window.__drawZensus({ top: 1 });
                            window.__kehrausJetzt();
                            const texturen = window.__texturZensus(),
                                v = window.__vram || {},
                                mb = (x) => +((x || 0) / 1048576).toFixed(1);
                            return {
                                texturen,
                                vram: !(v.nTexturen + v.nPuffer > 0) ? null : {
                                    mb: mb(v.puffer + v.texturen),
                                    puffer: mb(v.puffer),
                                    texturen: mb(v.texturen),
                                    spitze: mb(v.spitze),
                                    gc: mb(v.gc),
                                    liste: window.__vramBericht(top),
                                },
                                puffer: window.__pufferZensus(),
                                halter: halter ? window.__heapHalter(window.anazhRealm, 8) : null,
                            };
                        },
                        halter,
                        top
                    );
                    return Object.assign(o, { heapMB: +((u.usedSize + u.backingStorageSize) / 1048576).toFixed(1) });
                };
                if (req.url === "/puffer")
                    return send(await pufferStand(false, Number(b.top) || 30));
                if (req.url === "/gang")
                    return send(await gangLauf(page, pufferStand, b));
                if (req.url === "/zaehlen") {
                    const o = await page.evaluate(async (k) => {
                        const r = window.anazhRealm;
                        window.__buehne();
                        if (k.px != null) {
                            const boden = (x, z, v) =>
                                typeof v === "string" && v[0] === "+"
                                    ? r._voxelSurfaceY(x, z) + Number(v.slice(1))
                                    : Number(v);
                            const cam = r.state.camera;
                            cam.position.set(+k.px, boden(+k.px, +k.pz, k.py), +k.pz);
                            cam.lookAt(+k.lx, boden(+k.lx, +k.lz, k.ly), +k.lz + 1e-4);
                            cam.updateMatrixWorld(true);
                        }
                        try {
                            if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
                        } catch {}
                        return window.__drawZensus({ top: 16, alle: !!k.alle });
                    }, b);
                    return send(o);
                }
                // DIE BAND-LINSE: ein Zähl-Frame (alle Klassen) + der VRAM je Erzeuger + die Szenen-Puffer je Klasse +
                // die GPU-Bank (nur mit GPU-Device) + der Fluss — geurteilt gegen Haushalt und Ratsche (spec/profiband).
                if (req.url === "/band") {
                    // DIE BAND-MESSUNG: einschwingen (bis der Bau ruht), Proben (das Maximum je Klasse × Pass), dann der
                    // VRAM je Erzeuger, die Szenen-Puffer je Klasse, der Fluss und die GPU-Bank — geurteilt gegen Haushalt
                    // und Ratsche (spec/profiband).
                    // Ein Toggle-Ort (bank) trägt keine Ratsche: das Band bricht VOR dem Messen laut.
                    BAND.ratscheVon(BAND.ladeSpec(b.ort));
                    // DAS GERÄT und DIE SICHT: sie wählen die Ratsche — der Adapter-Text gegen die Muster des Haushalts, der
                    // Kamera-Modus des Stamms; ohne Schlüssel richtet keine Ratsche (das Urteil nennt es `ungemessen`).
                    const hh = BAND.ladeSpec(b.ort).haushalt;
                    const geraetText = await geraetInfo();
                    const kamera = await page.evaluate(() => window.anazhRealm.state.cameraMode);
                    const geraet = { schluessel: BAND.geraetSchluessel(hh, geraetText), text: geraetText };
                    const sicht = BAND.sichtSchluessel(hh, kamera);
                    const bandSpec =
                        geraet.schluessel && sicht
                            ? BAND.ladeSpec(b.ort, { geraet: geraet.schluessel, sicht })
                            : BAND.ladeSpec(b.ort);
                    // DIE STEMPEL-WACHE je Phase: welche Frames den Pool füllen, ohne ihn aufzulösen, steht beim Namen.
                    const w0 = await stempel();
                    const messung = await page.evaluate(bandEinschwingen, {
                        capMs: Number(b.capMs) || 240000,
                        ruhig: Number(b.ruhig) || 30,
                    });
                    const w1 = await stempel();
                    const proben = await page.evaluate(bandProben, { n: Number(b.proben) || 6, zwischen: 20 });
                    const w2 = await stempel();
                    // DER SPEICHER NACH DEM COLLECTOR (`pufferStand`): gemessen wird das Lebende, nicht die Laune des GC.
                    const roh = Object.assign(await pufferStand(false, 1e5), await page.evaluate(() => {
                        // Die Regler-Decke zurück (bandEinschwingen hob sie für die volle Welt).
                        if (window.__bandDecke != null) window.anazhRealm.state.perfTargetMs = window.__bandDecke;
                        window.__bandDecke = null;
                        const pm = window.anazhRealm.state.playerMesh.position;
                        return { spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)), fluss: window.__flussBericht ? window.__flussBericht() : null };
                    }));
                    const gpu = await page.evaluate(gpuBank, { n: 12, runden: 3 });
                    const w3 = await stempel();
                    const ue = (a, c) =>
                        a && c && Number.isFinite(c.ueberlauf) ? c.ueberlauf - (a.ueberlauf || 0) : null;
                    const stempelBand = w3
                        ? {
                              einschwingen: ue(w0, w1),
                              proben: ue(w1, w2),
                              bank: ue(w2, w3),
                              seitBoot: w3.ueberlauf,
                              warnung: w3.warnung,
                              spitze: w3.spitze,
                              pool: w3.pool,
                              taeter: w3.taeter,
                              urteil: w3.ueberlauf === 0 && w3.warnung === 0 ? "GRUEN" : "ROT",
                          }
                        : null;
                    const { haushalt, ort } = bandSpec;
                    const ratsche = BAND.ratscheVon(bandSpec);
                    const zensus = BAND.zensusMax(proben);
                    const u = BAND.bandUrteil({
                        zensus,
                        vram: roh.vram,
                        texturen: roh.texturen,
                        gpu: gpu && !gpu.fehler ? gpu : null,
                        haushalt,
                        ratsche,
                        ort,
                        ratscheDatei:
                            bandSpec.ratscheDatei ||
                            `(Gerät ${geraet.schluessel || "? — " + (geraetText || "kein Adapter")} × Sicht ${sicht || "? — " + kamera})`,
                    });
                    // Der Foundry-Kanal dieser Ladung über alle Antwort-Arten (asset · impostor · book …): Platte gegen
                    // Neubau — im Zweit-Boot der Serie die Neubau-Zahl, die der Spieler beim zweiten Start bezahlt.
                    let fl = null;
                    for (const k of Object.values((roh.fluss && roh.fluss.kanal) || {})) {
                        fl = fl || { n: 0, platte: 0, mb: 0, platteMb: 0, neuMb: 0 };
                        for (const f of Object.keys(fl)) fl[f] += k[f] || 0;
                    }
                    if (fl) for (const f of ["mb", "platteMb", "neuMb"]) fl[f] = +fl[f].toFixed(1);
                    const am = ort.spieler;
                    const amMessort = Math.hypot(roh.spieler[0] - am[0], roh.spieler[1] - am[1]) <= 8;
                    // DER GESTELLTE ORT (die Orts-Wache, `BAND.ortGestellt`): was beim Zählen wirklich stand — der Ort der
                    // letzten Aufstellung, der Dorf-Zug, der Ort-Takt, die Gier —, nicht nur der Ort, den der Aufruf nennt.
                    const zustand = Object.assign(
                        { ort: aktOrt },
                        await page.evaluate(() => ({
                            dorfZug: window.__anazhAutoSettlement !== false,
                            ortTakt: window.__ortTakt || [],
                            gier: window.anazhRealm.state.yaw,
                        })),
                        { sicht }
                    );
                    Object.assign(u, {
                        kamera: proben.length ? proben[proben.length - 1].kamera : null,
                        spieler: roh.spieler,
                        amMessort,
                        zustand,
                        ortGestellt: BAND.ortGestellt(ort, zustand, aktSicht),
                        geraet,
                        sicht,
                        version: await page.evaluate(() => window.anazhRealm.constructor.VERSION),
                        ratscheDatei: bandSpec.ratscheDatei,
                        boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                        messung: Object.assign({ proben: proben.length }, messung),
                        fluss: fl,
                        gpu,
                        stempel: stempelBand,
                        puffer: roh.puffer,
                        unbenannt: zensus.unbenannt,
                        frameMs: proben.map((z) => z.frameMs),
                        programme: proben.length ? proben[proben.length - 1].programme : null,
                        // je Probe die Summe je Pass: die Streuung, aus der die Toleranz der Ratsche kommt
                        proben: proben.map((z) => z.passe),
                    });
                    const datei = path.resolve(
                        b.datei || ablage(`band-${Date.now()}.json`)
                    );
                    ordnerFuer(datei);
                    // Das ROHE der Messung reist mit: `werkbank ratsche` urteilt eine Serie neu (gegen den Haushalt von
                    // heute) und nimmt ihre Hülle — nie einen einzelnen Lauf.
                    Object.assign(u, {
                        echt: ECHT,
                        roh: { zensus: zensus.klassen, vram: roh.vram, texturen: roh.texturen },
                    });
                    fs.writeFileSync(datei, JSON.stringify(u, null, 1));
                    const sb = stempelBand;
                    return send({
                        urteil: u.urteil,
                        linse: u.linse,
                        stempel: sb,
                        tabelle:
                            BAND.bandTabelle(u) +
                            (sb
                                ? `\nSTEMPEL-POOL ${sb.urteil}: ${sb.seitBoot} verweigerte Abfragen seit Boot (Einschwingen ` +
                                  `${sb.einschwingen} · Proben ${sb.proben} · Bank ${sb.bank}), Warnung ${sb.warnung}, Spitze ` +
                                  `${sb.spitze}${sb.pool ? "/" + sb.pool.max : ""}` +
                                  (sb.taeter && Object.keys(sb.taeter).length
                                      ? " — Täter: " +
                                        Object.entries(sb.taeter)
                                            .sort((x, y) => y[1] - x[1])
                                            .slice(0, 4)
                                            .map(([k, n]) => `${k} ${n}`)
                                            .join(" · ")
                                      : "")
                                : "\nSTEMPEL-POOL: kein Pool (kein timestamp-query)"),
                        datei,
                    });
                }
                // DER ZIEL-ZENSUS (scripts/lib/ziel-zensus.cjs): n Frames der Bank-Runde, jede Textur mit Erzeuger, Schreibern
                // und Lesern je Pass, der Inhalt der Farb-Texturen zurück → das Urteil über die Täter-Klassen. `selbsttest`
                // schmuggelt je Klasse einen Täter ein (jeder muss beim Namen rot fallen) und baut ihn danach restlos ab (kein
                // Name des Selbsttests bleibt im Zensus).
                if (req.url === "/ziele") {
                    const n = Number(b.n) || 12;
                    const zensus = async () => {
                        const z = await seite("__zielZensus", { n });
                        if (!z || z.fehler) return { z, u: ZZ.zielUrteil(z, []) };
                        const ids = z.ziele
                            .filter(
                                (x) =>
                                    !x.leinwand &&
                                    !x.tiefe &&
                                    x.kopierbar &&
                                    /^(r|rg|rgba|bgra)(8|16|32)/.test(x.format)
                            )
                            .map((x) => x.id);
                        const lesen = await seite("__zielLesen", { ids });
                        return { z, lesen, u: ZZ.zielUrteil(z, lesen) };
                    };
                    let selbst = null;
                    if (b.selbsttest) {
                        const s = await seite("__zielSchmuggel", true);
                        if (!s || s.fehler)
                            return send({ fehler: "Schmuggel: " + ((s && s.fehler) || "keine Antwort") });
                        let mit;
                        try {
                            mit = await zensus();
                        } finally {
                            await seite("__zielSchmuggel", false);
                        }
                        const soll = [
                            /OHNE LESER: zensus-selbsttest:ohne-leser/,
                            /VOLLE AUFLÖSUNG: zensus-selbsttest:bloom/,
                            /TEILBAR: zensus-selbsttest:paar-a und zensus-selbsttest:paar-b/,
                            /DOPPELTE TIEFE: zensus-selbsttest:tiefe-kopie .* ist eine Kopie von depth,/,
                            /FORMAT: zensus-selbsttest:f32 /,
                        ];
                        selbst = soll.map((m) => ({ muss: m.source, ok: mit.u.rot.some((x) => m.test(x)) }));
                    }
                    const { z, lesen, u } = await zensus();
                    if (!z || z.fehler) return send({ fehler: (z && z.fehler) || "keine Antwort", rot: u.rot });
                    const rest = selbst
                        ? u.zeilen.filter((x) => /zensus-selbsttest/.test(x.name)).map((x) => x.name)
                        : [];
                    const selbstOk = selbst ? selbst.every((x) => x.ok) && !rest.length : null;
                    const datei = path.resolve(
                        b.json || ablage(`ziele-${Date.now()}.json`)
                    );
                    jsonAb(datei, { zensus: z, lesen, urteil: u, selbst, rest });
                    return send({
                        ok: selbst ? selbstOk : u.rot.length === 0,
                        tabelle: ZZ.zielTabelle(u, z),
                        rot: u.rot,
                        selbst: selbst
                            ? (selbstOk ? "SELBSTTEST GRÜN" : "SELBSTTEST ROT") +
                              ` — ${selbst.filter((x) => x.ok).length} von ${selbst.length} Tätern beim Namen` +
                              (selbst.some((x) => !x.ok)
                                  ? "; blind für: " +
                                    selbst
                                        .filter((x) => !x.ok)
                                        .map((x) => x.muss)
                                        .join(" · ")
                                  : "") +
                              (rest.length
                                  ? "; nach dem Abbau noch im Zensus: " + rest.join(", ")
                                  : "; danach restlos fort")
                            : null,
                        datei,
                    });
                }
                // DIE GPU-ZERLEGUNG (scripts/lib/zerlege-linse.cjs): Inventur (ein Zähl-Frame + Pass-Baum + Frame-Anatomie) →
                // Schalter aus dem echten Weg → ABBA je Schalter mit der Bank-Runde → Beleg je Schalter → Tabelle.
                if (req.url === "/zerlegen") {
                    const n = Number(b.n) || 12;
                    const runden = Math.max(4, Number(b.runden) || 4);
                    const kette = ZL.KETTE.map((x) => x.uniform);
                    let last = null;
                    const zw0 = await stempel();
                    if (b.selbsttest) {
                        await page.evaluate(() => {
                            window.__zerlegeVorSelbst = window.__zerlegeZustand();
                        });
                        last = await seite("__zerlegeLast", {
                            an: true,
                            iter: Number(b.last) || 96,
                        });
                        if (!last || last.fehler) return send(Object.assign({ fehler: "Selbsttest-Last" }, last || {}));
                    }
                    try {
                        const inv = await seite("__zerlegeInventur", { n, kette });
                        if (inv.fehler) return send(inv);
                        const { haushalt } = BAND.ladeSpec();
                        const sch = ZL.zerlegeSchalter(inv, haushalt, {
                            nur: b.nur ? String(b.nur).split(",") : null,
                            unbekannteImmer: !!b.selbsttest,
                        });
                        const roh = await seite("__zerlegeMessen", {
                            schalter: sch.schalter,
                            n,
                            runden,
                            bilder: !!b.bilder,
                        });
                        if (roh.fehler) return send(roh);
                        // Die Bilder des Belegs (Ausgabe-Pfad, AN einmal, AUS je Schalter) in den Ordner, nie ins JSON.
                        let ordner = null;
                        if (b.bilder) {
                            ordner = path.resolve(
                                typeof b.bilder === "string"
                                    ? b.bilder
                                    : ablage(`zerlegen-${Date.now()}`)
                            );
                            fs.mkdirSync(ordner, { recursive: true });
                            const schreibe = (name, png) =>
                                pngDatei(path.join(ordner, name), png);
                            if (roh.bildAn) schreibe("00-an.png", roh.bildAn);
                            delete roh.bildAn;
                            roh.schalter.forEach((e, i) => {
                                if (e.beleg && e.beleg.bild) {
                                    schreibe(
                                        `${String(i + 1).padStart(2, "0")}-${e.id.replace(/[^a-z0-9_-]+/gi, "_")}-aus.png`,
                                        e.beleg.bild
                                    );
                                    delete e.beleg.bild;
                                }
                            });
                        }
                        const a = ZL.zerlegeAuswerten(roh, sch.schalter);
                        let selbst = null;
                        if (last) {
                            await seite("__zerlegeLast", { an: false });
                            last.weg = true;
                            const inv2 = await seite("__zerlegeInventur", { n: 3, kette });
                            const zurueck = await page.evaluate(() =>
                                window.__zerlegeVergleich(window.__zerlegeVorSelbst, window.__zerlegeZustand())
                            );
                            const z = a.zeilen.find((x) => x.id === "pass:zerlege-selbsttest");
                            const toleranzMs = +Math.max(1, 0.35 * last.alleinMs).toFixed(2);
                            selbst = {
                                iter: last.iter,
                                ziel: last.ziel,
                                alleinMs: last.alleinMs,
                                alleinWerte: last.alleinWerte,
                                deltaMs: z ? z.deltaMs : null,
                                streuungMs: z ? z.streuungMs : null,
                                // die Stempel-Probe: was der r184-Pass-Stempel von dieser bekannten Last sieht
                                stempelMs: a.stempelJePass ? a.stempelJePass["zerlege-selbsttest"] : null,
                                toleranzMs,
                                gefunden: !!z,
                                plausibel:
                                    !!z &&
                                    Math.abs(z.deltaMs - last.alleinMs) <= toleranzMs &&
                                    z.deltaMs > 2 * z.streuungMs,
                                verschwunden: !inv2.passe.some((p) => p.name === "zerlege-selbsttest"),
                                zurueck,
                            };
                            selbst.urteil =
                                selbst.gefunden && selbst.plausibel && selbst.verschwunden && !zurueck.length
                                    ? "GRUEN"
                                    : "ROT";
                        }
                        // Die Stempel der Zerlegung gelten nur ohne verweigerte Abfrage in ihrer Dauer (`__stempelWache`).
                        const zw1 = await stempel();
                        const stempelZ =
                            zw0 && zw1
                                ? {
                                      imZerlegen: zw1.ueberlauf - (zw0.ueberlauf || 0),
                                      seitBoot: zw1.ueberlauf,
                                      warnung: zw1.warnung,
                                      spitze: zw1.spitze,
                                      pool: zw1.pool,
                                  }
                                : null;
                        const datei = path.resolve(
                            b.json || ablage(`zerlegen-${Date.now()}.json`)
                        );
                        jsonAb(datei, {
                            echt: ECHT,
                            boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                            inventur: inv,
                            schalter: sch,
                            auswertung: a,
                            roh,
                            selbsttest: selbst,
                            stempel: stempelZ,
                        });
                        let tabelle = ZL.zerlegeTabelle(a, inv, sch);
                        if (selbst)
                            tabelle +=
                                `\n\nSELBSTTEST ${selbst.urteil}: eingeschmuggelter Vollbild-Pass (${selbst.iter} Runden sin/cos, ` +
                                `${selbst.ziel.join("×")}) allein ${selbst.alleinMs} ms, als Posten pass:zerlege-selbsttest ` +
                                `${selbst.gefunden ? selbst.deltaMs + " ± " + selbst.streuungMs + " ms" : "NICHT GEFUNDEN"} ` +
                                `(Toleranz ± ${selbst.toleranzMs} ms: ${selbst.plausibel ? "plausibel" : "NICHT plausibel"}); ` +
                                `ohne ihn: Posten ${selbst.verschwunden ? "verschwunden" : "NOCH DA"}, Zustand ` +
                                `${selbst.zurueck.length ? "NICHT zurück (" + selbst.zurueck.join(" · ") + ")" : "zurück"}` +
                                `\nSTEMPEL-PROBE: der r184-Pass-Stempel derselben Last zeigt ${selbst.stempelMs} ms ` +
                                `(${selbst.stempelMs != null && selbst.alleinMs ? Math.round((100 * selbst.stempelMs) / selbst.alleinMs) : "–"} % ` +
                                "ihrer Kosten allein) — so viel Fragment-Arbeit sehen die Stempel dieses Geräts";
                        if (stempelZ)
                            tabelle +=
                                `\nSTEMPEL-POOL ${stempelZ.imZerlegen === 0 ? "GRUEN" : "ROT"}: ${stempelZ.imZerlegen} verweigerte ` +
                                `Abfragen in der Zerlegung (seit Boot ${stempelZ.seitBoot}, Warnung ${stempelZ.warnung}), Spitze ` +
                                `${stempelZ.spitze}${stempelZ.pool ? "/" + stempelZ.pool.max : ""}`;
                        const ok =
                            !a.zurueck.length &&
                            !a.fenster.some((e) => !e.geschluckt) &&
                            a.zeilen.every((z) => z.geschaltet !== false) &&
                            (!selbst || selbst.urteil === "GRUEN") &&
                            (!stempelZ || stempelZ.imZerlegen === 0);
                        return send({
                            tabelle,
                            ok,
                            datei,
                            ordner,
                            selbsttest: selbst,
                            stempel: stempelZ,
                        });
                    } finally {
                        if (last && !last.weg) await seite("__zerlegeLast", { an: false });
                    }
                }
                // DIE EINE SPUR (CDP-Trace) um den Lauf, nur im Mess-Fenster: die Belegung liest den Faden (`BELEGUNG_SPUR`,
                // `belegungAuswerten`), Profil und Hänger-Linse lesen Stichproben aus derselben Spur (`HL.spurProfil`) — nie ein
                // zweites Instrument; ein langer Hänger-Lauf nimmt nur Marken, Stichproben und die Aufträge des GPU-Prozesses
                // (`gpu`: eine Leine ohne Auftrag der Seite heißt nach ihm) — der Faden voll sprengt den Puffer.
                const laufMitSpur = async (k, kategorien) => {
                    const cdp = await page.target().createCDPSession(), ev = [];
                    cdp.on("Tracing.dataCollected", (e) => e.value.forEach((x) => ev.push(x)));
                    let an = false, o;
                    spur.an = () => cdp.send("Tracing.start", { traceConfig: { includedCategories: kategorien } }).then(() => (an = true));
                    try {
                        o = await page.evaluate(lauf, Object.assign({ regler: b.regler || "voll", tiere: b.tiere || "halten", wetter: b.wetter, spur: true }, k));
                    } finally {
                        spur.an = null;
                        const komplett = an && new Promise((r) => cdp.once("Tracing.tracingComplete", r));
                        if (an) await cdp.send("Tracing.end").then(() => komplett);
                        await cdp.detach();
                    }
                    return { o, ev };
                };
                const PROBEN = ["blink.user_timing", "disabled-by-default-v8.cpu_profiler", "gpu"];
                if (req.url === "/lauf") {
                    const { o, ev } = await laufMitSpur(
                        { sek: Number(b.sek) || 20, ein: b.ein != null ? Number(b.ein) : 30, ruhe: Number(b.ruhe) || 0, regler: b.regler || "frei", wandern: b.wandern },
                        ZL.BELEGUNG_SPUR
                    );
                    o.belegung = ZL.belegungAuswerten(ev);
                    o.stempel.warnung = stempelWarnung.n;
                    if (o.wetterHalt) o.wetterHalt = wetterUrteil(o.wetterHalt);
                    return send(Object.assign(o, { fehler: fehler.slice(-5) }));
                }
                // DIE HÄNGER-LINSE (scripts/lib/haenger-linse.cjs): der echte Lauf (`lauf`, `k.haenger`) mit den Stichproben der
                // Spur (1 ms), je Frame über der Schwelle die Ursache beim Namen (TAKT · NEBEN · GC · GPU und die Engstelle);
                // `spitze` urteilt die Takt-Spitze (`takt`), `wandern: bahn` geht die Bahn der OMEN-Zellen „geht".
                if (req.url === "/haenger") {
                    const { o: l, ev } = await laufMitSpur({
                        sek: Number(b.sek) || 120,
                        ein: b.ein != null ? Number(b.ein) : 10,
                        tiere: b.tiere || "frei",
                        wandern: b.wandern || "aus",
                        probe: !!b.probe,
                        haenger: true,
                    }, PROBEN);
                    const roh = Object.assign(l.haenger, { bahnM: l.bahnM, wandern: b.wandern, wetterHalt: wetterUrteil(l.wetterHalt) });
                    const sp = HL.spurProfil(ev);
                    const a = HL.linseWerten(roh, sp, b);
                    const datei = path.resolve(
                        b.json || ablage(`${b.spitze ? "takt" : "haenger"}-${Date.now()}.json`)
                    );
                    ordnerFuer(datei);
                    // Das ROHE (Takte + Stichproben der Spur) daneben: `haenger --auswerten <roh>` urteilt es neu, ohne Welt
                    fs.writeFileSync(datei.replace(/\.json$/, "") + ".roh.json", JSON.stringify({ roh, spur: sp }));
                    jsonAb(datei, Object.assign({ echt: ECHT, boot: { art: bootArt(), ladungen: boot.ladungen } }, a));
                    const { tabelle, befunde, cpuMs, taeter } = a;
                    return send({ tabelle, befunde, cpuMs, taeter, wetterHalt: roh.wetterHalt, datei });
                }
                if (req.url === "/licht") {
                    const o = await seite("__lichtBilanz");
                    // DIE MESSUNG IN DIE SOLL-TAFEL (`licht --ist <id>`): E an der waagrechten Karte, alle Lichter und
                    // nur die Umgebung (der Himmel)
                    if (b.ist)
                        o.ist = sollIstSchreiben(b.ist, {
                            werkzeug: "licht",
                            datum: new Date().toISOString(),
                            stand: { sha: gitStand() },
                            geraet: { adapter: await page.evaluate(() => window.__abnahmeMessen({}).geraet.adapter) },
                            E_alle: o.alle && o.alle.oben ? o.alle.oben.E : null,
                            E_umgebung: o.umgebung && o.umgebung.oben ? o.umgebung.oben.E : null,
                            // die senkrechten Karten im Himmel allein (D3): zur Sonne und von ihr weg (`umgebungAzimut`)
                            E_umgebung_zurSonne: o.umgebung && o.umgebung.zurSonne ? o.umgebung.zurSonne.E : null,
                            E_umgebung_vonSonne: o.umgebung && o.umgebung.vonSonne ? o.umgebung.vonSonne.E : null,
                            sonnenRichtung: o.sonnenRichtung,
                        });
                    return send(o);
                }
                if (req.url === "/fernwald")
                    return send(
                        await seite("__fernwaldLinse", {
                            blicke: b.blicke ? String(b.blicke).split(",") : null,
                            w: Number(b.w) || 1280,
                            h: Number(b.h) || 720,
                        })
                    );
                if (req.url === "/reload") {
                    await lade();
                    await loopAus();
                    return send({ neu: true });
                }
                if (req.url === "/stop") {
                    send({ stop: true });
                    // Ports SOFORT frei geben (sonst fände ein Neustart :4489 noch belegt).
                    seiten.close();
                    steuer.close();
                    // Eine tote Seite lässt close() werfen — der catch unten sendete dann ein zweites Mal
                    // (ERR_HTTP_HEADERS_SENT) und riss den Prozess ohne Chrome-Abbau herunter.
                    await browser.close().catch((e) => tod("close: " + ((e && e.message) || e)));
                    // Das Scratch-Profil stirbt mit der Serie; ein benanntes (`--serie`) bleibt für den nächsten Start.
                    if (!SERIE)
                        try {
                            fs.rmSync(profil, { recursive: true, force: true, maxRetries: 5 });
                        } catch (e) {
                            tod("Profil bleibt liegen: " + ((e && e.message) || e));
                        }
                    process.exit(0);
                }
                send({ fehler: "unbekannter Weg " + req.url });
            } catch (e) {
                // der Fehler mit seinen ersten Rahmen (der Täter beim Namen, nicht nur die Meldung)
                send({
                    fehler: String((e && e.message) || e).split("\n")[0],
                    stapel: String((e && e.stack) || "")
                        .split("\n")
                        .slice(1, 5)
                        .map((s) => s.trim()),
                });
            }
        });
    });
    await new Promise((r) => steuer.listen(PORT, "127.0.0.1", r));
    console.log(`WERKBANK bereit: Steuer 127.0.0.1:${PORT} · Seite :${SEITEN_PORT}`);
}

hauptLauf(async () => {
    const cmd = argv[0];
    if (cmd === "start") return starte();
    const a = argv.slice(1).filter((x, i, arr) => !x.startsWith("--") && !(i > 0 && arr[i - 1].startsWith("--")));
    let o;
    if (cmd === "status") o = await rufe("/status");
    else if (cmd === "umstellen")
        o = await umstellen({ x: a[0], z: a[1], ort: opt("--ort"), pose: opt("--pose"), sicht: opt("--sicht") });
    else if (cmd === "bild")
        o = await rufe("/bild", {
            px: a[0],
            py: a[1],
            pz: a[2],
            lx: a[3],
            ly: a[4],
            lz: a[5],
            datei: opt("--datei"),
            uhr: opt("--uhr") === undefined ? undefined : Number(opt("--uhr")),
            wetter: opt("--wetter"),
            saison: opt("--saison"),
            w: Number(opt("--w", 640)),
            h: Number(opt("--h", 360)),
            ziel: opt("--ziel"),
            wahl: opt("--wahl"),
            klasse: opt("--klasse"),
            spieler: argv.includes("--spieler"),
            abstand: argv.includes("--abstand"),
            gesicht: opt("--gesicht"),
            arm: opt("--arm"),
            ist: opt("--ist"),
            fov: opt("--fov"),
        });
    else if (cmd === "methode")
        o = await rufe("/methode", { name: a[0], terrain: hat("terrain"), quelle: opt("--quelle") });
    else if (cmd === "eval") o = await evalRuf(a[0]);
    else if (cmd === "albedo" && hat("nah-fern")) {
        // DIE ALBEDO NAH GEGEN FERN: je Ort im Chunk-Quadrat Boden-Satz gegen Fern-Ring aus 420 m, dazu das Gesetz an
        // der Stelle; `--selbsttest` (ohne Welt) prüft das Urteil: im Band grün (auch ein Ring, der im Band seiner Abtastung
        // rauscht), der Boden-Satz doppelt so hell rot mit dem Täter Boden-Satz, ein Ring neben dem Gesetz mit dem Täter
        // Fern-Ring, zu wenige Orte, ein leerer Schuss, ein fehlendes Gesetz und eine Karte, die nicht steht, laut.
        if (SELBST) {
            const ort = (klasse, x, nY, fY, nG, gY) => ({
                klasse,
                ort: [x, 0],
                deckung: klasse === "wald" ? 0.9 : 0.3,
                nah: { n: 4096, Y: nY, rgb: [nY * 0.8, nY * (nG || 1.1), nY * 0.5] },
                fern: { n: 4096, Y: fY, rgb: [fY * 0.8, fY * 1.1, fY * 0.5] },
                gesetz: { Y: gY || fY },
            });
            const ruhig = ["wald", "wald", "wald", "wiese", "wiese", "wiese"].map((k, i) =>
                ort(k, i * 50, 0.06, 0.058)
            );
            const f = [];
            // das Urteil, wenn der erste Ort `x` ist und die übrigen ruhig stehen
            const nf = (orte, mehr) => LL.nahFernUrteil({ orte, ...mehr }), erst = (x) => nf(ruhig.map((o, i) => (i ? o : x)));
            const pruefe = (name, u, muss) => {
                const ok = muss ? u.befunde.some((b) => muss.test(b)) : u.befunde.length === 0;
                if (!ok) f.push(`${name}: ${u.befunde.join(" · ") || "(grün)"}`);
            };
            pruefe("im Band", nf(ruhig), null);
            pruefe(
                "main (Boden doppelt so hell)",
                erst(ort("wald", 0, 0.115, 0.056)),
                /^NAH-FERN wald 0\/0 .*Y 0.115 gegen Fern-Ring Y 0.056 \(\+105 %\).*Täter Boden-Satz \+105 %/
            );
            pruefe(
                "der Ring neben dem Gesetz",
                erst(ort("wald", 0, 0.055, 0.075, 1.1, 0.056)),
                /Täter Fern-Ring \+34 %/
            );
            pruefe(
                "das Rauschen des Rings im Band",
                erst(ort("wald", 0, 0.055, 0.066, 1.1, 0.056)),
                null
            );
            pruefe(
                "ohne Gesetz",
                erst(Object.assign(ort("wald", 0, 0.06, 0.06), { gesetz: null })),
                /ohne das Gesetz an der Stelle/
            );
            pruefe("zu wenige Wiesen-Orte", nf(ruhig.slice(0, 4)), /NAH-FERN wiese: 1 Orte/);
            pruefe(
                "leerer Schuss",
                LL.nahFernUrteil({
                    orte: ruhig.concat([Object.assign(ort("wiese", 400, 0.06, 0.06), { nah: { n: 0 } })]),
                }),
                /leerer Schuss/
            );
            pruefe("Karte steht nicht", nf(ruhig, { nahKarte: 0 }), /NAH-FERN Karte: .*bereit 0/);
            const frisch = [
                { name: "fern-krone-nah", soll: 4, gpu: 4 },
                { name: "wege-karte:nah", soll: 21, gpu: 21 },
            ];
            const hoch = (texe, ruhigOk, bilder) => ({
                ruhig: ruhigOk !== false,
                versuche: 1,
                bilder: bilder == null ? 3 : bilder,
                texe,
            });
            pruefe(
                "das Hauptbild lädt jedes Daten-Bild",
                nf(ruhig, { upload: hoch(frisch) }),
                null
            );
            pruefe(
                "ein Daten-Bild bleibt alt",
                LL.nahFernUrteil({
                    orte: ruhig,
                    upload: hoch([frisch[0], { name: "kronen-streu:nah", soll: 18, gpu: 17 }]),
                }),
                /NAH-FERN Upload: kronen-streu:nah — die GPU hält Version 17, der Schreiber hob sie auf 18/
            );
            pruefe(
                "die Upload-Probe ohne Bild",
                nf(ruhig, { upload: hoch([]) }),
                /die Probe ist blind/
            );
            pruefe(
                "die Upload-Probe ohne gezeichnetes Bild",
                nf(ruhig, { upload: hoch(frisch, true, 0) }),
                /NAH-FERN Upload: 0 von 3 Bildern gezeichnet/
            );
            pruefe(
                "die Upload-Probe in einer Welt, die nie ruht",
                nf(ruhig, { upload: hoch(frisch, false) }),
                /NAH-FERN Upload: der Boden-Satz ruhte in 1 Versuchen nie drei Takte/
            );
            pruefe(
                "die Welt steht",
                nf(ruhig, { welt: { gestanden: true, ms: 900, chunk: "-21,-20", fehlt: [] } }),
                null
            );
            pruefe(
                "die Welt stand nicht",
                LL.nahFernUrteil({
                    orte: ruhig,
                    welt: {
                        gestanden: false,
                        ms: 120000,
                        chunk: "-21,-20",
                        fehlt: ["-19,-18"],
                        gebaut: 1,
                        ring: 2,
                        imBau: 3,
                        karte: 1,
                    },
                }),
                /NAH-FERN Welt: das Quadrat der Linse stand nach 120 s nicht \(Chunk -21,-20, fehlt 1: -19,-18/
            );
            pruefe(
                "ein Schuss, der nicht stillsteht",
                erst(Object.assign(ort("wald", 0, 0.06, 0.058), { nah: { n: 4096, Y: 0.6, rgb: [0.6, 0.6, 0.6], still: false, spur: { hell: [[4096, 0.69]] } } })),
                /NAH-FERN wald 0\/0: der Schuss nah stand nicht still oder wiederholte sich nicht/
            );
            pruefe(
                "ein Paar, das sich in vier Runden nicht wiederholt",
                LL.nahFernUrteil({
                    orte: ruhig.map((o, i) => {
                        if (i) return o;
                        const w = ort("wald", 0, 0.06, 0.058);
                        w.fern.wiederholt = false;
                        return Object.assign(w, { runden: 4, verworfen: [[0.06, 0.15]] });
                    }),
                }),
                /NAH-FERN wald 0\/0: der Schuss fern stand nicht still oder wiederholte sich nicht \(Runden 4/
            );
            selbsttestEnde(f, "das Nah-Fern-Urteil nennt die zwei Farben derselben Stelle beim Namen");
            process.exit(0);
        }
        o = await rufe("/albedo", { nahFern: true, datei: opt("--datei") });
        if (o && o.zeilen) {
            const w = o.messung && o.messung.welt;
            if (w)
                console.log(
                    `  Welt ${w.gestanden ? "steht" : "STAND NICHT"} nach ${w.ms} ms (${w.takte} Takte): Chunk ${w.chunk}, ` +
                        `fehlt ${w.fehlt.length}, gebaut ${w.gebaut}, Ring ${w.ring}, im Bau ${w.imBau}, Karte ${w.karte}`
                );
            for (const z of o.zeilen)
                console.log(
                    `  ${z.klasse.padEnd(5)} ${z.ort.join("/").padEnd(12)} Deckung ${z.deckung} · nah Y ${z.nahY} · fern Y ${z.fernY} · ` +
                        `${(z.dY * 100).toFixed(0)} % · Gesetz Y ${z.gesetzY}: nah ${z.nahGesetz} (Grün ${z.gruenNah}), fern ${z.fernGesetz} (Grün ${z.gruenFern}) · Runden ${z.runden}`
                );
            const up = o.messung && o.messung.upload;
            if (up)
                console.log(
                    `  Upload im Hauptbild (${up.ruhig ? "ruhig" : "UNRUHIG"}, Versuch ${up.versuche}, ${up.bilder} Bilder): ` +
                        (up.texe || []).map((u) => `${u.name} GPU ${u.gpu}/${u.soll}`).join(" · ")
                );
            for (const b of o.befunde) console.log("  ROT " + b);
            console.log(
                o.befunde.length
                    ? "\n❌ NAH-FERN ROT — zwei Farben derselben Stelle"
                    : "\n✅ NAH-FERN GRÜN — EINE Boden-Farbe je Ort"
            );
            if (o.datei) console.log(o.datei);
            process.exit(o.befunde.length ? 1 : 0);
        }
    } else if (cmd === "albedo") {
        // die Tafel (`--tafel` bleibt das Wort der Rufer); ein Fehler der Tafel ist nie grün
        o = await rufe("/albedo", { ordner: opt("--ordner"), datei: opt("--datei") });
        if (o && o.tabelle) endeMit(o.tabelle + "\n\n" + o.datei + "\n" + o.ordner, o.urteil === "GRUEN");
        endeMit(o);
    } else if (cmd === "licht" && hat("tag")) {
        // DIE TAG-ACHSE (S7, W7): je Messort (`--orte`, Standard der Spawn und die Mess-Wiese) in Ego die Uhr-Kurve aus dem
        // Ausgabe-Pfad (`__tagKurve`), ihre Nachtastung (`tagFeinUhren`) und ihr Urteil `tagKurveUrteil` (licht-linsen.cjs);
        // `--kurz` und `--eigen` die Wand der Karte, `--ordner d` die Bilder, `--datei f.json` die Messung.
        const halt = await eigeneWelt();
        const welt = {};
        if (opt("--ordner")) fs.mkdirSync(path.resolve(opt("--ordner")), { recursive: true });
        const kurve = (uhren, png) => evalRuf(`return await window.__tagKurve(${JSON.stringify({ uhren, png })});`);
        try {
            for (const ort of String(opt("--orte", "genesis,wiese")).split(",")) {
                await umstellen({ ort, sicht: "ego" });
                const a = await kurve(hat("kurz") ? LL.TAG_UHREN_KURZ : LL.TAG_UHREN, !!opt("--ordner"));
                const m = (welt[ort] = ergebnis(a));
                for (const z of m.zeilen || []) {
                    if (z.png) pngDatei(path.resolve(opt("--ordner"), `tag-${ort}-${z.uhr}.png`), z.png);
                    delete z.png;
                }
                const f = m.zeilen && (await kurve(LL.tagFeinUhren(m.zeilen), false)).ergebnis;
                if (f) (m.fein = f.zeilen), Object.assign(m.schreiber, f.schreiber);
            }
        } finally {
            if (halt) await halt();
        }
        dateiAb(welt);
        const u = LL.tagKurveUrteil(welt);
        console.log(JSON.stringify(u.kurven, null, 1));
        urteilEnde("TAG-ACHSE", u);
    } else if (cmd === "licht" && hat("kontakt")) {
        // DER KONTAKT-SCHATTEN (schatten.K1): `kontaktSicht` auf der Prüfbühne je Uhr, das Urteil `kontaktUrteil`
        const fehl = LL.kontaktSelbsttest();
        console.log(`KONTAKT Selbsttest ${fehl.length ? "ROT: " + fehl.join(" | ") : "3/3"}`);
        if (fehl.length || SELBST) process.exit(fehl.length ? 1 : 0);
        const welt = {};
        for (const uhr of opt("--uhr", "0.5").split(",").map(Number)) {
            await umstellen({ ort: "buehne", sicht: "ego" });
            const o = { uhr, png: !!opt("--bilder") };
            const m = (welt[uhr] = (await evalRuf(`return await (${LL.kontaktSicht})(${JSON.stringify(o)});`)).ergebnis);
            for (const [pose, p] of Object.entries((m && m.posen) || {}))
                if (p.png) pngDatei(path.resolve(opt("--bilder"), `kontakt-${uhr}-${pose}.png`), p.png), delete p.png;
        }
        const rot = Object.entries(welt).flatMap(([uhr, m]) => LL.kontaktUrteil(m).befunde.map((b) => `Uhr ${uhr} ${b}`));
        console.log(JSON.stringify(welt, null, 1));
        endeMit(`KONTAKT ${rot.length ? "ROT: " + rot.join(" | ") : "GRUEN"}`, !rot.length);
    } else if (cmd === "licht" && hat("naesse")) {
        // DIE NÄSSE (wetter.K2): Selbsttest Basis, Nässe ohne Dach, Regen im Haus, nasser Marktstand, helles Regenbild ROT
        const m = (aussen, innen, regenbild, ri = 0, dach = 2) => ({ aussen: { n: 400, verhaeltnis: aussen }, innen: { n: 400, verhaeltnis: innen }, dicht: 1, glanz: 16, regen: { innen: ri, aussen: 9 }, dachBauten: { n: 2, trocken: dach }, regenbild });
        const f = [
            [LL.naesseUrteil({ wiese: m(1.0, null, 1.08) }).befunde.join(), /wiese Nässe porös draußen 1 außerhalb.*Regenbild 1\.08/],
            [LL.naesseUrteil({ dorf: m(0.62, 0.64, 0.7) }).befunde.join(), /dorf innen unter dem Dach 0\.64 außerhalb/],
            [LL.naesseUrteil({ dorf: m(0.62, 1, 0.7, 7, 0) }).befunde.join(), /7 Regen-Punkte innen.*trocken 0\/2/],
            [LL.naesseUrteil({ wiese: m(0.66, null, 0.7), dorf: m(0.62, 1.01, 0.7) }).urteil, "GRUEN"],
            [LL.naesseUrteil({}).urteil, "ROT"],
        ];
        const fehl = f.filter(([ist, soll]) => (soll instanceof RegExp ? !soll.test(ist) : ist !== soll));
        console.log(`NÄSSE Selbsttest: ${f.length - fehl.length}/${f.length}`);
        if (fehl.length || SELBST) process.exit(fehl.length ? 1 : 0);
        const halt = await eigeneWelt();
        const welt = {};
        try {
            for (const ort of /^(wiese|dorf)/.test(opt("--naesse", "")) ? opt("--naesse").split(",") : ["wiese", "dorf"]) {
                await umstellen({ ort, sicht: "ego" });
                const lauf = (o) => evalRuf(`return await (${LL.naesseSicht.toString()})(${JSON.stringify(o)});`);
                let dach;
                if (ort === "dorf") {
                    const z = (await lauf({ ort, dach: "ziel" })).ergebnis.ziel;
                    if (z) await umstellen({ x: z[0] + 3, z: z[1] + 3 });
                    dach = z ? (await lauf({ ort, dach: "pruefen" })).ergebnis : { n: 0, trocken: 0 };
                    await umstellen({ ort, sicht: "ego" });
                    const s = (await lauf({ ort, haus: true })).ergebnis.schwelle;
                    await umstellen({ x: s[0], z: s[2] });
                }
                const a = await lauf({ ort, png: !!opt("--bilder") });
                welt[ort] = Object.assign(ergebnis(a), dach && { dachBauten: dach });
                for (const [i, png] of (welt[ort].png || []).entries())
                    pngDatei(path.resolve(opt("--bilder"), `naesse-${ort}-${["klar", "frisch", "nass"][i]}.png`), png);
                delete welt[ort].png;
            }
        } finally {
            if (halt) await halt();
        }
        dateiAb(welt);
        const u = LL.naesseUrteil(welt);
        console.log(JSON.stringify(welt, null, 1));
        urteilEnde("NÄSSE", u);
    } else if (cmd === "licht" && hat("luft")) {
        // DIE LUFT IM BILD (ferne-luft): `luftTiefe` vom Hügel am Ort (`--ort`, Standard Genesis: offen) je Uhr der Referenz,
        // zu Mittag dazu vom Gipfel (das Höchste des Gesetzes binnen 3 km, Auge 40 m); das Urteil `luftTiefeUrteil` gegen die
        // externe Referenz spec/farbe/luft-referenz.json.
        const LL = require("./lib/licht-linsen.cjs");
        const ref = JSON.parse(fs.readFileSync(path.join(__dirname, "../spec/farbe/luft-referenz.json"), "utf8"));
        const fehl = LL.luftTiefeSelbsttest(ref);
        selbsttestEnde(fehl, "grauer β, Kante 21 %, Linie und leere Messung beim Namen ROT");
        if (SELBST) process.exit(0);
        const halt = await eigeneWelt();
        const luft = async (o) =>
            ergebnis(await evalRuf(`const kantenLinie = ${LL.kantenLinie}; return await (${LL.luftTiefe})(${JSON.stringify(o)});`));
        let m;
        try {
            await umstellen({ ort: opt("--ort", "genesis"), sicht: "ego" });
            m = await luft({ ref, augeM: 120 });
            const g = (await rufe("/eval", {
                code: "const p = r.state.playerMesh.position; let g = [0, 0, -1e9]; for (let x = -3e3; x <= 3e3; x += 50) for (let z = -3e3; z <= 3e3; z += 50) " +
                    "{ const y = r._terrainMacroSurfaceY(p.x + x, p.z + z, false); if (y > g[2]) g = [p.x + x, p.z + z, y]; } return g;",
            })).ergebnis;
            await umstellen({ x: g[0], z: g[1] });
            m.gipfel = Object.assign({ ort: g.map(Math.round) }, await luft({ ref: Object.assign({}, ref, { uhren: [0.5] }), augeM: 40 }));
        } finally {
            if (halt) await halt();
        }
        dateiAb(m);
        if (m.fehler) throw new Error("LUFT: " + m.fehler);
        const u = LL.luftTiefeUrteil(m, ref);
        for (const b of u.befunde.map((x) => "ROT " + x).concat(u.offen.map((x) => "OFFEN " + x))) console.log("  " + b);
        endeMit(`LUFT ${u.urteil} · ${Object.entries(u.staffel).map((e) => e.join(" ")).join(" · ")} (offen: ${Object.keys(ref.offen).join(", ")})`, u.urteil === "GRUEN");
    } else if (cmd === "licht" && hat("laub")) {
        // DAS LAUB IM GEGENLICHT: je Art der nächste Baum, der Spieler am Augen-Ort (die Stufe folgt ihm), Gegenlicht
        // gegen Auflicht; das Urteil `laubLichtUrteil` (≥ 1,3, Labor ± 10 % wo gemessen). `--selbsttest` ohne Welt.
        if (SELBST) {
            const m = (v) => ({ verhaeltnis: v, gegen: { Y: v }, auf: { Y: 1 }, stoffe: "laub" });
            const fz = (v, dL, dC) => ({ paar: "fern/nah", stufe: "bodenSatz → fern-ring", karte: { verhaeltnis: v, dL, dC } });
            const lu = (welt, labor) => LL.laubLichtUrteil({ welt, labor });
            const f = [
                [lu({ eiche: m(1.4) }).urteil, "GRUEN"],
                [
                    lu({ eiche: m(0.3) }).befunde.join(),
                    /eiche: Gegenlicht\/Auflicht 0\.3 < 1\.3/,
                ],
                [lu({ eiche: m(1.4) }, { eiche: { verhaeltnis: 1.0 } }).urteil, "ROT"],
                [
                    lu({ eiche: m(1.4) }, { eiche: { verhaeltnis: 1.35 } }).urteil,
                    "GRUEN",
                ],
                // das Labor misst unter EINEM Licht: gegen die Welt-Seite `sonne`, nie gegen die volle Licht-Kette
                [
                    lu({ eiche: Object.assign(m(1.4), { sonne: { verhaeltnis: 1.0 } }) }, { eiche: { verhaeltnis: 1.4 } }).befunde.join(),
                    /Welt 1 gegen Labor 1\.4 \(nur Sonne\)/,
                ],
                [lu({ birke: { fehler: "keine Laub-Senke" } }).urteil, "ROT"],
                // die Karte gegen ihre Gestalt (A7) — ROT beim Namen
                [lu({ fichte: { stufe: "f:fichte:L1", karte: { verhaeltnis: 1.24, dL: 3.7, dC: 1.4 } } }).befunde.join(), /KARTE fichte: Karte\/Gestalt \(f:fichte:L1\) Luma 1\.24/],
                [lu({ fichte: { karte: { verhaeltnis: 1.04, dL: 0.8, dC: -0.8 } } }).urteil, "GRUEN"],
                // die Karte in der Nacht (F6): ROT beim Namen der Stunde
                [lu({ "fichte@0": { stufe: "f:fichte:L1", karte: { verhaeltnis: 4.737, dL: 16.6, dC: 2.73 } } }).befunde.join(), /KARTE fichte@0: Karte\/Gestalt \(f:fichte:L1\) Luma 4\.737/],
                // ohne das Band die Wirts-Zahlen (Rauheit 0,9, Mikro-Kavität): die Karte nachts 0,544 ihrer Gestalt — ROT nach unten
                [lu({ "fichte@0": { stufe: "f:fichte:L1", karte: { verhaeltnis: 0.544, dL: -3.86, dC: -0.53 } } }).befunde.join(), /KARTE fichte@0: Karte\/Gestalt \(f:fichte:L1\) Luma 0\.544/],
                // die ganze Normale im zum Auge gekippten Rahmen: mittags 1,278 — ROT nach oben
                [lu({ "fichte@0.5": { stufe: "f:fichte:L1", karte: { verhaeltnis: 1.278, dL: 4.21, dC: -1.75 } } }).urteil, "ROT"],
                [lu({ eiche: { karte: { verhaeltnis: 1.02, dL: 0.3, dC: 4.2 } } }).urteil, "ROT"],
                [LL.laubLichtUrteil({}).urteil, "ROT"],
                // DIE FERNE JE STUNDE (F6): Fern-Ring gegen Boden-Satz nachts über Mittag ROT beim Namen
                [lu({ "ring@0.5": fz(1.072, 1.97, -7.21), "ring@0": fz(1.604, 7.04, -4.17) }).befunde.join(), /FERN ring@0: fern\/nah gegen Mittag \(bodenSatz → fern-ring\) Luma 1\.496/],
                [lu({ "ring@0.5": fz(1.038, 0.96, -5.6), "ring@0": fz(1.047, 0.45, -2.82) }).urteil, "GRUEN"],
                [JSON.stringify(lu({ "haus@0.5": fz(0.788, -5.35, -1.7), "haus@0": fz(0.763, -4.17, 1.04) }).zeilen[1]), /"karte":0\.968.*"mittag":0\.788/],
                [lu({ "haus@0": fz(0.763, -4.17, 1.04) }).befunde.join(), /FERN haus@0: ohne die Zeile zu Mittag/],
                // die Krone von oben: Zwei-Strom-Band über der gemessenen Blatt-Albedo
                [LL.kronenReflexionSoll(0.164, [0.5, 1]).join("/"), "0.0705/0.099"],
                [LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.08, A: 0.164, tau: [0.5, 1] } } } }).urteil, "GRUEN"],
                [
                    LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.15, A: 0.164, tau: [0.5, 1] } } } }).befunde.join(),
                    /fichte: Reflexion 0\.15 außerhalb \[0\.0705, 0\.099\].*besonnte Schale/,
                ],
                [LL.kronenObenUrteil({ welt: { fichte: { oben: { R: 0.03, A: 0.164, tau: [0.5, 1] } } } }).urteil, "ROT"],
                [LL.kronenObenUrteil({ welt: { fichte: { fehler: "keine Laub-Senke" } } }).urteil, "ROT"],
                [LL.kronenObenUrteil({}).urteil, "ROT"],
                ...LL.tagKurveSelbsttest(),
            ];
            const fehl = f.filter(([ist, soll]) => (soll instanceof RegExp ? !soll.test(ist) : ist !== soll));
            endeMit(`LAUB-LICHT Selbsttest: ${f.length - fehl.length}/${f.length}`, !fehl.length);
        }
        const welt = {};
        // Das Exemplar je Art: das nächste zum Messort Wiese (spec/profiband/haushalt.json) — derselbe Baum in jedem Lauf.
        // `--ort genesis`: die Bäume der Ankunft (A7, die Karte gegen ihre Gestalt)
        const wiese = require("../spec/profiband/haushalt.json").messorte.find((m) => m.id === (opt("--ort") || "wiese"));
        // `--oben`: dasselbe Exemplar lotrecht von oben, die Reflexion der Krone gegen das Zwei-Strom-Band
        // (`kronenObenUrteil`). Die Arten stehen hinter `--laub`, ohne Liste eiche,birke (ein folgender Schalter ist keine Art).
        const oben = hat("oben");
        const arten = opt("--laub") && !String(opt("--laub")).startsWith("--") ? opt("--laub") : "eiche,birke";
        // DAS SPIEL-AUGE (S2b): `--wechsel f` das Auge im f-fachen Abstand, ab dem das Spiel die Karte zeigt, `--auge h` die
        // Augenhöhe (Ego 1,6 · Third 3,5), `--hang g` ein Exemplar am Hang (Gefälle ≥ g), das Auge talwärts
        // DIE STUNDEN (F6): `--uhr 0.5,0.25,0` misst jede Art je Stunde (Mittag · Dämmerung · Nacht) — die Karte antwortet dem
        // Licht der Uhr wie ihre Gestalt; die Zeile heißt `<art>@<uhr>`
        const uhren = opt("--uhr") === undefined ? [null] : String(opt("--uhr")).split(",").map(Number);
        // DIE FERNE JE STUNDE (F6): zwei Namen der Liste gehen den Weg der Karte (dasselbe Auge, zwei Stufen) — `ring` Boden-Satz
        // gegen Fern-Ring am Messort, `haus` L0 gegen L2 im Spiel-Abstand am Messort dorf (der Dorf-Zug baut es beim Spieler)
        const dorf = require("../spec/profiband/haushalt.json").messorte.find((m) => m.id === "dorf");
        // `--eigen` die Wand der Karte (gate:licht-weg:echt): die Welt als Kind, gestoppt nach der letzten Zeile
        const halt = await eigeneWelt();
        try {
            for (const art of String(arten).split(",")) for (const uhr of uhren) {
                const zeile = uhr == null ? art : `${art}@${uhr}`;
                // DER LICHTWEG (Licht K3): `panorama`, `feld`, `spiegel` und `wasser` (eine Zahl stellt die Fläche senkrecht, Grad neben
                // der Sonne) — die graue Fläche im Licht der Welt gegen das Licht des Wegs
                if (/^(panorama|feld|spiegel|wasser)\d*$/.test(art)) {
                    if (!Object.keys(welt).length) await umstellen({ ort: "dorf" }); // der Feld-Pass steht erst im Takt
                    welt[zeile] = (await evalRuf(`return await window.__lichtWeg({ weg: "${art}", uhr: ${uhr} });`)).ergebnis;
                    continue;
                }
                const [haus, boden] = [art === "haus", art === "ring"];
                const anker = haus || boden ? dorf.spieler : wiese.spieler;
                if ((haus || boden) && !(welt[`haus@${uhren[0]}`] || welt[`ring@${uhren[0]}`])) await umstellen({ ort: "dorf" });
                const spiel = `wechsel: ${Number(opt("--wechsel", 0)) || 0}, augeH: ${Number(opt("--auge", 1.7)) || 1.7}, hang: ${Number(opt("--hang", 0)) || 0}, uhr: ${uhr}, haus: ${haus}, boden: ${boden}`;
                const c = `return await window.__laubGegenlicht(Object.assign({ art: ${JSON.stringify(art)} }, __o));`;
                // am Anker stehen: welche Bäume eine nahe Stufe (eine Laub-Senke) tragen, folgt dem Spieler
                await umstellen({ x: anker[0], z: anker[1] });
                const ein = () => hat("karte") && rufe("/lauf", { sek: 5, ein: 8, ruhe: 120, regler: "voll" });
                // die Stufen der Gestalten schwingen ein (nach dem Umstellen fehlt dem Plan der Karte die Laub-Senke)
                let plan = null;
                for (let i = 0; i < (hat("karte") ? 6 : 1) && !(plan && !plan.fehler); i++, await ein())
                    plan = (await rufe("/eval", {
                        // `--abstand m`: der Augen-Ort so weit vom Fuß (die Stufe folgt dem Spieler: nah L0, weiter L1)
                        code: `const __o = { plan: true, anker: ${JSON.stringify(anker)}, abstand: ${Number(opt("--abstand", 8)) || 8}, ${spiel} }; ${c}`,
                    })).ergebnis;
                if (!plan || plan.fehler) {
                    welt[zeile] = plan || { fehler: "kein Plan" };
                    continue;
                }
                await umstellen({ x: plan.auge[0], z: plan.auge[1] });
                await ein();
                // `--karte` (A7): dasselbe Auge, erst die Gestalt in ihrer Stufe, dann die Karte (Schwellen 0,3/0,6 m), danach zurück
                // — auch der Boden: Boden-Satz und Fern-Ring aus dem fernen Auge der Naht (zwei Augen maßen den Blickwinkel mit, Licht K3)
                const k = (n) => evalRuf(`const __o = { ziel: ${JSON.stringify(plan.ziel)}, auge: ${JSON.stringify(boden ? plan.fern : plan.auge)}, karte: ${n}, stufe: ${haus ? (n === 1 ? 0 : 2) : null}, ${spiel} }; ${c}`);
                // `plan.l1` hält das Exemplar im Spiel-Abstand auf L1, 0,6 m jede Krone auf der Karte, null stellt zurück; das Haus: Schuss 1
                // in L0 (`t01`: beide Schwellen über dem Auge), Schuss 2 in L2 (`stufe`, sonst urteilt die Linse laut)
                const stufen = async (t12, t01) => {
                    const D = "const D = r.constructor.LOD_DISTANCES; window.__karteD = window.__karteD || [D.thresh01, D.thresh12];";
                    await evalRuf(t12 == null ? `${D} [D.thresh01, D.thresh12] = window.__karteD; window.__karteD = null; return 1;` : `${D} D.thresh01 = ${t01 == null ? `Math.min(window.__karteD[0], ${t12} / 2)` : t01}; D.thresh12 = ${t12}; return 1;`);
                    await ein();
                };
                if (hat("karte")) {
                    if (haus) await stufen(plan.l1, plan.l1);
                    else if (opt("--wechsel") && !boden) await stufen(plan.l1);
                    // die Gestalt des Exemplars kann noch reisen (L1 im Bau): bis zu drei Läufe mehr, sonst urteilt die Linse laut
                    for (let i = 0; i < 4 && ((await k(1)).ergebnis || {}).fehler; i++) await ein();
                    if (!boden) await stufen(0.6);
                }
                const w = hat("karte")
                    ? (await k(2)).ergebnis
                    : (await evalRuf(`const __o = { ziel: ${JSON.stringify(plan.ziel)}, oben: ${oben} }; ${c}`)).ergebnis;
                if (hat("karte") && !boden) await stufen(null);
                if (w && w.karte && opt("--ordner"))
                    w.karte.png.forEach((p, i) => pngDatei(path.join(opt("--ordner"), `karte-${zeile}-${i ? "karte" : "gestalt"}.png`), p));
                if (w && w.karte) delete w.karte.png;
                const ordner = opt("--ordner");
                if (w && w.oben && w.oben.png) {
                    if (ordner)
                        pngDatei(path.join(ordner, `krone-${art}-oben.png`), w.oben.png);
                    delete w.oben.png;
                }
                if (w && w.gegen)
                    for (const k of ["gegen", "auf"]) {
                        if (ordner)
                            pngDatei(path.join(ordner, `laub-${art}-${k}.png`), w[k].png);
                        delete w[k].png;
                    }
                welt[zeile] = w;
            }
        } finally {
            if (halt) await halt();
        }
        if (oben) {
            const u = LL.kronenObenUrteil({ welt });
            console.log(JSON.stringify({ welt, zeilen: u.zeilen }, null, 1));
            urteilEnde("KRONE-OBEN", u);
        }
        const u = LL.laubLichtUrteil({ welt });
        // `--datei`: die Welt-Seite für das Labor-Urteil (diag-albedo-tafel.cjs --laub --welt <datei>)
        dateiAb({ welt });
        console.log(JSON.stringify({ welt, zeilen: u.zeilen }, null, 1));
        urteilEnde("LAUB-LICHT", u);
    } else if (cmd === "licht") o = await rufe("/licht", { ist: opt("--ist") });
    else if (cmd === "fernwald") o = await rufe("/fernwald", { blicke: opt("--blicke"), w: opt("--w"), h: opt("--h") });
    else if (cmd === "fluss") o = await rufe("/fluss", {});
    else if (cmd === "puffer" && hat("gang")) {
        o = await rufe("/gang", { min: opt("--gang") });
        console.log(JSON.stringify(o, null, 1));
        endeMit(o.urteil && !o.urteil.length ? "GANG GRÜN" : "GANG ROT", o.urteil && !o.urteil.length);
    } else if (cmd === "puffer") o = await rufe("/puffer", { top: opt("--top") });
    else if (cmd === "diaet") {
        if (SELBST) {
            const f = DIAET.selbsttest();
            selbsttestEnde(f, "das Diät-Urteil nennt die Wiederholung im Stand, den Refresh ohne Änderung, die Prüfung ohne Meldung und eine blinde Linse beim Namen");
            process.exit(0);
        }
        o = await rufe("/diaet", {
            frames: a[0],
            modus: opt("--modus", "ruhe"),
            grad: opt("--grad"),
            tiere: opt("--tiere", "halten"),
        });
        if (o && o.urteil) endeMit(o, !o.urteil.length);
    } else if (cmd === "stand")
        o = await rufe("/stand", {
            n: a[0],
            ein: opt("--ein"),
            ruhe: opt("--ruhe"),
            regler: opt("--regler", "voll"),
            tiere: opt("--tiere", "frei"),
            sim: opt("--sim"),
        });
    else if (cmd === "sicht")
        o = await rufe("/sicht", {
            ruhe: opt("--ruhe"),
            sonne: opt("--sonne"),
            drehen: opt("--drehen"),
            drehGrad: opt("--dreh-grad"),
            gehen: opt("--gehen"),
            tag: opt("--tag", "laeuft"),
            ein: opt("--ein"),
            regler: opt("--regler", "voll"),
        });
    else if (cmd === "zaehlen")
        o = await rufe(
            "/zaehlen",
            Object.assign(
                { alle: hat("alle") },
                a.length >= 6 ? { px: a[0], py: a[1], pz: a[2], lx: a[3], ly: a[4], lz: a[5] } : {}
            )
        );
    else if (cmd === "band") {
        o = await rufe("/band", {
            ort: opt("--ort"),
            datei: opt("--datei"),
            proben: opt("--proben"),
            capMs: opt("--cap") ? Number(opt("--cap")) * 1000 : undefined,
        });
        if (o && o.tabelle) endeMit(o.tabelle + "\n\n" + (o.datei || ""), o.urteil === "GRUEN" && (!o.stempel || o.stempel.urteil === "GRUEN"));
    } else if (cmd === "ratsche") {
        // DIE RATSCHE AUS EINER SERIE (nur Node): ≥ 4 eingeschwungene Band-Messungen aus Erst- UND Zweit-Boot an EINEM Ort ×
        // Gerät × Sicht und EINER Version; die Hülle zieht nur bei sauberer LINSE nach (setzt, senkt, hebt nie), `--neu`
        // ist der RE-MINT. Die Serie: jede .json der Befehlszeile (`--neu` ist ein Schalter ohne Wert).
        const dateien = argv
            .slice(1)
            .filter((x) => /\.json$/i.test(x))
            .map((f) => path.resolve(f));
        const laeufe = dateien.map((f) => {
            const j = JSON.parse(fs.readFileSync(f, "utf8"));
            const e = Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
            return e ? (e.ergebnis && e.ergebnis.messung) || null : j;
        });
        const neu = hat("neu");
        const nurVram = opt("--nur") === "vram";
        const fehler = [];
        if (laeufe.length < 4) fehler.push(`${laeufe.length} Läufe — die Serie braucht mindestens vier`);
        const eins = (name, werte) => {
            const w = [...new Set(werte)];
            if (w.length !== 1 || w[0] == null) fehler.push(`${name} ${w.join(" / ") || "?"} — die Serie steht an EINEM ${name}`);
            return w[0];
        };
        const ortId = eins("Ort", laeufe.map((u) => (u ? u.ort : null)));
        const geraet = eins("Gerät", laeufe.map((u) => (u && u.geraet ? u.geraet.schluessel : null)));
        const sicht = eins("Sicht", laeufe.map((u) => (u ? u.sicht : null)));
        const version = eins("Version", laeufe.map((u) => (u ? u.version : null)));
        if (opt("--ort") && opt("--ort") !== ortId) fehler.push(`--ort ${opt("--ort")}, die Serie steht an ${ortId}`);
        if (fehler.length) endeMit("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
        const ratscheSpec = BAND.ladeSpec(ortId, { geraet, sicht });
        const { haushalt, ort } = ratscheSpec;
        const alt = BAND.ratscheVon(ratscheSpec);
        if (!alt) endeMit(`Ratsche NICHT nachgezogen: ${ratscheSpec.ratscheDatei} fehlt — jeder Ort × Gerät × Sicht trägt seine Datei`);
        const ratsche = neu ? BAND.ratscheNeu(alt) : alt;
        const boots = new Set(laeufe.map((u) => u.boot && u.boot.art));
        if (!boots.has("erst") || !boots.has("zweit"))
            fehler.push(`Boot-Arten ${[...boots].join("/")} — Erst- UND Zweit-Boot`);
        laeufe.forEach((u, i) => {
            const n = path.basename(dateien[i]);
            if (!u.roh) fehler.push(`${n}: kein Rohes (eine Messung vor der Serien-Ratsche)`);
            if (u.echt !== true) fehler.push(`${n}: nicht die echte GPU (start --echt)`);
            if (u.amMessort !== true) fehler.push(`${n}: nicht am Messort ${ort.id} ${ort.spieler.join(" ")}`);
            // Die Orts-Wache: der Lauf stand im Zustand des Orts (Aufstellung, Dorf-Zug, Ort-Takt, Blick, Sicht).
            for (const f of BAND.ortGestellt(ort, u.zustand, sicht)) fehler.push(`${n}: ${f}`);
            if (!u.messung || u.messung.eingeschwungen !== true) fehler.push(`${n}: nicht eingeschwungen`);
        });
        if (fehler.length) endeMit("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
        const h = BAND.bandHuelle(laeufe.map((u) => u.roh));
        const u = BAND.bandUrteil(Object.assign({ haushalt, ratsche: alt, ort, ratscheDatei: ratscheSpec.ratscheDatei }, h));
        Object.assign(u, { messung: null, boot: null });
        console.log(BAND.bandTabelle(u));
        // `--nur vram` zieht nur den Speicher nach: dann zählen nur die Speicher-Befunde der LINSE; der Re-Mint lässt die
        // Ratschen-Zeilen der alten Ratsche aus (er ersetzt sie), Haushalt, Namen und Lecks nie.
        const linse = (u.rot || []).filter((r) => ["unbenannt", "haushalt", "ratsche", "leck"].includes(r.art));
        const sperrt = nurVram ? BAND.vramBefunde(u) : neu ? linse.filter((r) => r.art !== "ratsche") : linse;
        if (sperrt.length) endeMit("\nRatsche NICHT nachgezogen: LINSE ROT — erst die Befunde heilen:\n  " + sperrt.map((r) => r.text).join("\n  "));
        const r = BAND.ratscheNachziehen(
            ratsche,
            u,
            {
                datum: new Date().toISOString(),
                version,
                ort: ort.id,
                geraet,
                geraetText: laeufe[0].geraet.text,
                sicht,
                eingeschwungen: true,
                neu: neu || undefined,
                laeufe: laeufe.length,
                boots: laeufe.map((x) => x.boot.art + "/" + x.boot.ladungen),
                dateien: dateien.map((d) => path.basename(d)),
            },
            opt("--nur")
        );
        // Was der Re-Mint HEBT, steht beim Namen (der Commit trägt es): jede Zeile über der alten Ratsche.
        const hebt = [];
        if (neu)
            for (const [id, rz] of Object.entries(r.ratsche.klassen))
                for (const [p, z] of Object.entries(rz))
                    for (const g of ["befehle", "dreiecke"]) {
                        const a0 = ((alt.klassen[id] || {})[p] || {})[g];
                        if (z[g] != null && a0 != null && z[g] > a0) hebt.push(`${id}.${p}.${g} ${a0} → ${z[g]}`);
                    }
        BAND.schreibeRatsche(ratscheSpec.ratscheDatei, r.ratsche);
        endeMit(
            `\nRatsche ${ratscheSpec.ratscheDatei} (Ort ${ort.id} × ${geraet} × ${sicht}, V${version}) ` +
                `${neu ? "NEU GEMINTET" : "nachgezogen"} (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}` +
                (neu ? `\nDer Re-Mint hebt ${hebt.length} Zeilen: ${hebt.join(" · ") || "keine"}` : ""),
            true
        );
    } else if (cmd === "lauf") {
        if (SELBST) {
            const f = [...ZL.zweiGipfelSelbsttest(), ...ZL.belegungSelbsttest(), ...require("./lib/ausgabe-aufnahme.cjs").buehneSelbsttest()];
            selbsttestEnde(f, "die Pass-Teilung trennt zwei Gipfel " +
                "(rein = der untere, anteilOben genau) und lässt einhöckrige Pässe ganz; die Belegung nennt eine Pflicht-Last je " +
                "Bild beim Klassen-Namen und lässt vertagbare Zeitgeber im Bild-Fenster GRÜN; die Bühne stellt n Tiere im Ring auf Land, " +
                "füllt nur auf und bricht ohne Platz laut");
            process.exit(0);
        }
        o = await rufe("/lauf", {
            sek: a[0],
            ein: opt("--ein"),
            regler: opt("--regler", "frei"),
            tiere: opt("--tiere", "halten"),
            wetter: opt("--wetter"),
            ruhe: opt("--ruhe", 0),
            wandern: opt("--wandern"),
        });
        if (o.kreis) console.log("KREIS " + JSON.stringify(o.kreis));
        // Die Wetter-Wache (ein Lauf, der das Wetter nicht hält) und die Belegung enden mit Exit 1 und nennen den Täter.
        const rot = [
            o.wetterHalt && o.wetterHalt.urteil === "ROT" && `WETTER-WACHE ROT: ${o.wetterHalt.taeter.join(" · ")}`,
            o.belegung && o.belegung.urteil === "ROT" && `BELEGUNG ROT: ${o.belegung.befund}`,
            o.buehnenTiere < Number(opt("--tiere")) && `BÜHNE ROT: ${o.buehnenTiere} von ${opt("--tiere")} Tieren stehen am Ende`,
        ].filter(Boolean);
        if (rot.length) endeMit(JSON.stringify(o, null, 1) + "\n" + rot.join("\n"));
    } else if (cmd === "haenger" || cmd === "takt") {
        // `takt` ist die Takt-Spitze des Gehens (Bahn, 30 s nach 2 s Einschwingen), `haenger` die Hänger über der Schwelle
        const spitze = cmd === "takt";
        if (SELBST) {
            const f = HL.selbsttest();
            selbsttestEnde(f, "die Hänger-Linse nennt Takt-Last, Neben-Last, Collector, GPU-Warten nach synchronen Pipelines und den Auftrag des GPU-Prozesses beim Namen, die Takt-Marken legen die Stichproben der Spur auf die Takte; die Takt-Spitze nennt eine 3-ms-Last je 10. Takt allein beim Namen und ist ohne Last GRÜN, in Fahrt ein computeVertexNormals im Takt beim Namen und einen stehenden Wagen");
            process.exit(0);
        }
        // `--auswerten <x.roh.json>`: ein gesicherter Lauf neu geurteilt (nur Node — eine andere Schwelle, eine neue Linse)
        if (opt("--auswerten")) {
            const { roh, spur } = JSON.parse(fs.readFileSync(opt("--auswerten"), "utf8"));
            const w = HL.linseWerten(roh, spur, { spitze, schwelle: opt("--schwelle"), posten: opt("--posten") });
            console.log(w.tabelle);
            if (w.befunde.length) console.log("\nLINSE ROT:\n  " + w.befunde.join("\n  "));
            process.exit(w.befunde.length ? 1 : 0);
        }
        o = await rufe("/haenger", {
            spitze,
            sek: opt("--sek", a[0] || (spitze ? 30 : undefined)),
            ein: opt("--ein", spitze ? 2 : undefined),
            regler: opt("--regler", "voll"),
            tiere: opt("--tiere", "frei"),
            wetter: opt("--wetter"),
            wandern: opt("--wandern", spitze ? "bahn" : "aus"),
            schwelle: opt("--schwelle", 100),
            posten: opt("--posten"),
            probe: hat("probe"),
            json: opt("--json"),
        });
        if (!o || o.fehler || !o.tabelle) endeMit(o);
        console.log(o.tabelle + "\n\n" + o.datei);
        if (o.befunde.length) console.log("\nLINSE ROT:\n  " + o.befunde.join("\n  "));
        process.exit(o.befunde.length ? 1 : 0);
    } else if (cmd === "schirm") o = await rufe("/schirm", { datei: opt("--datei"), regler: opt("--regler", "frei") });
    else if (cmd === "fenster") o = await rufe("/fenster", { w: a[0], h: a[1] });
    else if (cmd === "gpu-fehler") o = await rufe("/gpu-fehler", {});
    else if (cmd === "gpu-bank") o = await rufe("/gpu-bank", { n: a[0], runden: opt("--runden", 3) });
    else if (cmd === "latenz") {
        if (SELBST) {
            selbsttestEnde(HL.latenzSelbsttest(), "das Latenz-Urteil nennt jede fehlende Größe beim Namen"); // ohne Welt: das Urteil
            process.exit(0);
        }
        // die Verzug-Probe (in der Welt): 3 Bilder Verzug im Eingabe-Pfad sind ROT und heben den Median um mindestens 2 Bilder
        const reihe = { proben: opt("--proben", 50), sichten: opt("--sicht", "ego,third"), verben: opt("--verb", "gehen,wechsel") };
        const selbst = hat("verzugprobe"), klein = { proben: 12, sichten: "ego", verben: "gehen" };
        o = await rufe("/latenz", selbst ? klein : reihe);
        const mit = selbst && (await rufe("/latenz", Object.assign({ verzug: 3 }, klein)));
        if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify(selbst ? { ohne: o, mit } : o, null, 1));
        for (const x of [o, mit].filter(Boolean)) {
            for (const [n, e] of Object.entries(x.reihen || {})) console.log(n, JSON.stringify(e));
            console.log(`LATENZ ${x.urteil} (Bild ${x.bildMs} ms) ${x.rot ? x.rot.join(" · ") : x.fehler}`);
        }
        const g = (x) => ((x.reihen || {})["ego/gehen"] || {}).p50; // ein Lauf mit `fehler` trägt keine Reihe
        const hub = mit && +(g(mit) - g(o)).toFixed(1);
        const gut = selbst ? mit.urteil === "ROT" && hub >= 2 * o.bildMs : o.urteil === "GRÜN";
        if (selbst) console.log(`VERZUGPROBE ${gut ? "GRÜN" : "ROT"}: Verzug 3 Bilder hebt p50 um ${hub} ms ${o.fehler || mit.fehler || ""}`);
        process.exit(gut ? 0 : 1);
    }
    else if (cmd === "ziele") {
        o = await rufe("/ziele", { n: opt("--n"), json: opt("--json"), selbsttest: SELBST });
        if (o && o.tabelle) endeMit(o.tabelle + (o.selbst ? "\n\n" + o.selbst : "") + "\n" + o.datei, o.ok);
        endeMit(o);
    } else if (cmd === "zerlegen") {
        const bi = argv.indexOf("--bilder");
        o = await rufe("/zerlegen", {
            runden: opt("--runden"),
            n: opt("--n"),
            nur: opt("--nur"),
            json: opt("--json"),
            bilder: bi < 0 ? false : argv[bi + 1] && !argv[bi + 1].startsWith("--") ? argv[bi + 1] : true,
            selbsttest: SELBST,
            last: opt("--last"),
        });
        if (o && o.tabelle) endeMit(o.tabelle + "\n\n" + o.datei + (o.ordner ? "\n" + o.ordner : ""), o.ok);
        if (!o || o.fehler) endeMit(o);
    } else if (cmd === "shader") {
        if (SELBST) {
            const f = SK.selbsttest();
            selbsttestEnde(f, "die Shader-Kosten-Linse zählt Orte, Arten, Arbeit, Rauschen und den Stoff-Graph, das Urteil nennt jeden Bruch");
            process.exit(0);
        }
        o = await rufe("/shader", {
            nur: opt("--nur"),
            top: opt("--top", 30),
            ordner: opt("--ordner"),
            stoff: opt("--stoff"),
            gegen: opt("--gegen"),
            datei: opt("--datei"),
            rauschprobe: hat("rauschprobe"),
        });
        // Ein Fehler ist nie grün: ohne Tabelle und Urteil endet der Befehl mit Exit 1.
        if (!o || o.fehler || !o.tabelle || !Array.isArray(o.rot)) endeMit(o);
        console.log(o.tabelle + (o.ordner ? "\n" + o.ordner : ""));
        if (o.stoff)
            console.log("\n" + o.stoff.tabelle + "\nBudget " + o.stoff.name + " " + JSON.stringify(o.stoff.budget));
        if (o.probe) console.log("\nRausch-Probe (max |GPU − CPU| je Probe, Grenze 1e-4) " + JSON.stringify(o.probe));
        endeMit(o.rot.length ? "\nROT:\n  " + o.rot.join("\n  ") : "\nGRÜN", !o.rot.length);
    } else if (cmd === "reload") o = await rufe("/reload");
    else if (cmd === "stop") o = await rufe("/stop");
    else {
        endeMit(fs.readFileSync(__filename, "utf8").split('"use strict"')[0].trimEnd());
    }
    // `fehler` als Zeichenkette ist das Versagen des Befehls; als Liste ist es das Konsolen-Buch der Sitzung (pageerror und
    // WebGPU-Meldungen, auch INFO) — ein Buch urteilt nicht, und `[]` ist wahr: status · wache · stand · lauf endeten immer mit 1.
    endeMit(o, !(o && typeof o.fehler === "string"));
});
