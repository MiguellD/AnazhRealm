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
//                                      [--zeit Δt] [--bewegung KeyW[:m]] | bild --selbsttest  DIE SICHTBARE BÖE (vegetation.K2): Luma-Varianz 0–15 m am Kamm
//                                                           und im Tal der Böe über dem Rausch-Boden bei Wind 0
//                                                           DIE KLASSEN IM BILD (spec/abnahme/soll-tafel.json): Teilung, Rauschen und Maße je Klasse;
//                                                           `--ist` schreibt in die Tafel, `--arm <m>` die Kamera <m> vor die Fläche des Ego-Blicks
//   node scripts/werkbank.cjs methode <name> [--terrain] [--quelle datei]  Methode aus dem Stamm live tauschen
//                                                           (`--quelle` ein anderer Stand; --terrain das Chunk-Material neu)
//   node scripts/werkbank.cjs eval '<js>'                  Funktionsrumpf in der Seite (r = Welt, T = THREE)
//   node scripts/werkbank.cjs albedo --tafel [--datei f.json] [--ordner d]  DIE WELT-SEITE DER ALBEDO-TAFEL (je Klasse ihr Exemplar,
//                                                           jede Stufe zu jeder Uhr der Tafel; die Zählung je Mesh-Klasse fiel mit material-k3-stufen)
//                                                           (spec/farbe/albedo-tafel.json, Eichung 0,180; Nachzug diag-albedo-tafel.cjs --nachziehen)
//   node scripts/werkbank.cjs licht [--uhr u] [--ist <id>]  DIE LICHT-BILANZ (18-%-Karte, je Licht, unter der Bühne zur Uhr u —
//                                                           ohne Uhr Mittag; `--ist` in die Soll-Tafel, K5 urteilt sie mit dem Soll ihrer Uhr)
//   node scripts/werkbank.cjs licht --tag [--kurz] [--orte genesis,wiese,wiese:third] [--eigen] [--ordner d] [--datei f.json]
//                                                           DIE TAG-ACHSE (licht.K1): je Ort und Sicht die Uhr-Kurve aus dem Ausgabe-Pfad,
//                                                           je Ort EINE Zeile `TAG <ort> ROT|GRUEN:` mit den sechs Zahlen des Solls
//                                                           (gate:tag-achse:echt die Wand der Karte, gate:tag-achse:bahn die ganze Bahn)
//   node scripts/werkbank.cjs licht --luft [--ort genesis] [--eigen] [--wetter stormy [--zug]] | --selbsttest  DIE LUFT IM BILD
//                                                           (Koschmieder je Kanal, Farbton, Sonnenseite, fernes Weiß; Rand und Kante an
//                                                           Hügel und Gipfel; im Wetter die Sicht, mit --zug klar → Wort → klar je Sekunde)
//   node scripts/werkbank.cjs licht --tafeln [--eigen] [--verzoegert n] | --selbsttest  DIE TAFELN DER ATMOSPHÄRE SIND GEZEICHNET
//                                                           (Ist je Tafel, die verzögerte Pipeline von Ψ_ms, die Mutante: gate:tafel-ganz:echt)
//   node scripts/werkbank.cjs licht --laub [eiche,birke] [--ordner d] [--karte --uhr u,u] | --selbsttest  DAS LAUB IM GEGENLICHT
//   node scripts/werkbank.cjs licht --kontakt [--zuwachs] [--uhr 0.5,0.3] [--bilder d] | --selbsttest  DER KONTAKT-SCHATTEN (schatten.K1)
//   node scripts/werkbank.cjs licht --naesse [wiese,wiese:third,dorf] [--bilder d] [--datei f] | --selbsttest  DIE NÄSSE (wetter.K2)
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
//   node scripts/werkbank.cjs bedienung [--runden 3]       DIE BEDIENUNG (spielgang.K3): HUD-Deckung im Bild des Spielers, INP über HUD und Menü
//   node scripts/werkbank.cjs bedienung --staffel 2        K3#2: jeder sichtbare Text von HUD und Menü ≥ 16 px und in seinem Kasten,
//                                                           die Belegung frei (der Knopf „vor“, KeyO durch den Reload, der Leib
//                                                           ≥ 0,1 m; `taeter` · `blind`) — der Kasten hält ab 800 px, headless 640 x 360
//                                                           nicht (das Ich): dort `--echt`
//   node scripts/werkbank.cjs haenger [sek] [--ein s] [--regler voll|frei] [--tiere frei|halten] [--wandern bahn|sprung]
//                                                           [--schwelle ms] [--probe] [--json datei] | haenger --auswerten <x.roh.json>
//                                                           DIE HÄNGER-LINSE: jeder Frame über der Schwelle mit Ursache (scripts/lib/haenger-linse.cjs)
//   node scripts/werkbank.cjs schirm [--datei f.png]         DER SCHIRM: das präsentierte Canvas nach 1 s echtem Loop
//   node scripts/werkbank.cjs fenster <w> <h>               Viewport wechseln wie ein Spieler (resize-Ereignis); `takte` > 0 nur nach einem Wechsel des Schirms
//   node scripts/werkbank.cjs stufen [--ort dorf] [--eigen]  DIE STUFEN AM SCHIRM: das Bild in 1080 Zeilen trägt die Stufen der Welt,
//                                                           die ab dem Boot in 1080 Zeilen lebte (`start --fenster 1920x1080`); der Täter daneben
//   node scripts/werkbank.cjs gpu-bank [n] [--runden r]      DIE GPU-BANK: GPU-Zeit je Frame, n Frames ohne rAF
//   node scripts/werkbank.cjs zerlegen [--runden r] [--n frames] [--nur a,b] [--json datei] [--bilder [ordner]]
//                                                           [--selbsttest [--last iter]] DIE GPU-ZERLEGUNG je Verbraucher, ABBA (scripts/lib/zerlege-linse.cjs)
//   node scripts/werkbank.cjs ziele [--n frames] [--json datei]
//                                                           DER ZIEL-ZENSUS: jede GPU-Textur mit Erzeuger, Schreibern, Lesern (scripts/lib/ziel-zensus.cjs)
//   node scripts/werkbank.cjs shader [--nur <regex>] [--top n] [--ordner d]
//                                                           [--stoff boden [--gegen alt.wgsl] [--datei neu.wgsl]] | shader --selbsttest
//                                                           DIE SHADER-KOSTEN je gezeichnetem Programm (scripts/lib/shader-kosten.cjs)
//   node scripts/werkbank.cjs band [--ort <id>] [--datei f.json] [--proben n] [--cap sek]
//                                                           DIE BAND-LINSE gegen Haushalt und Ratsche des Orts (spec/profiband/, scripts/lib/band-urteil.cjs)
//   node scripts/werkbank.cjs weg [--datei f.json] [--ratsche r.json]   DER WEG DES SPEICHERS: Heap nach GC je Pose der Ratsche, Urteil H8 (scripts/lib/speicher-proben.cjs)
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
const { fehlerText, statikServer, startePuppeteer, werkbankRuf, werkbankTor, seitenAbbruch, ROOT: root, selbsttestEnde, sleep, hauptLauf, argOpt: opt, pngDatei, WARTEN_SEITE, ausDatei, path, fs, stammLib, jsonLesen, jsonSchreiben, ortZug, halteBis } = require("./lib/welt-boot.cjs");
const http = require("http");
const AA = require("./lib/ausgabe-aufnahme.cjs");
const { AUSGABE_INSTALL } = AA;
const LL = require("./lib/licht-linsen.cjs");
const LP = require("./lib/licht-proben.cjs"); // die Gänge des Lichts (`licht --tag|--kontakt|--naesse|--tafeln|--luft|--laub`)
const { ZAEHLER_INSTALL, FALTE_INSTALL, gangLauf } = require("./lib/draw-zaehler.cjs");
const { FLUSS_INSTALL } = require("./lib/fluss-linse.cjs");
const SICHT = require("./lib/sicht-linse.cjs");
const DIAET = require("./lib/diaet-linse.cjs");
const STAND = require("./lib/stand-linse.cjs");
const SP = require("./lib/schirm-proben.cjs"); // die Stufen am Schirm (`stufen`)
const { GPU_FEHLER_INSTALL, GPU_FEHLER_OBJEKT } = require("./lib/gpu-fehler.cjs");
const BAND = require("./lib/band-urteil.cjs");
const BP = require("./lib/band-proben.cjs"); // das Band am Messort und die Ratsche aus einer Serie (`band`, `ratsche`)
const ZL = require("./lib/zerlege-linse.cjs");
const ZP = require("./lib/zeit-proben.cjs"); // die Zeit: GPU-Zerlegung, der echte Lauf, die Hänger-Linse (`zerlegen`, `lauf`, `haenger`, `takt`)
const SK = require("./lib/shader-kosten.cjs");
const AP = require("./lib/albedo-proben.cjs"); // die Albedo: die Welt-Seite der Tafel und nah gegen fern (`albedo [--nah-fern]`)
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
const jsonAb = (datei, o) => (ordnerFuer(datei), jsonSchreiben(datei, o));
// die Ablage der Werkbank (artifacts/werkbank); `zeitAblage`: die gewählte Datei, sonst <name>-<Zeit>.<endung> in der Ablage
const ablage = (...teile) => path.join(root, "artifacts", "werkbank", ...teile);
const zeitAblage = (wahl, name, endung) => path.resolve(wahl || ablage(`${name}-${Date.now()}.${endung}`));
// DER ORT DER BILDER DER TAFEL (abnahme-urteil `bildPfadFehler`): je Ziel `--ist <id>[:teil]` EIN Name unter
// artifacts/soll-tafel/ (gitignored, lokal) — Bild, Maske und Begleit-JSON nebeneinander
const sollAblage = (ziel, endung) => {
    const d = path.join(root, "artifacts", "soll-tafel");
    fs.mkdirSync(d, { recursive: true });
    return path.join(d, String(ziel).replace(/:/g, "-") + endung);
};
// der Stand des Arbeitsbaums für jedes Begleit-JSON: `gitStand` und der Code-Abdruck jeder Quelle (abnahme-urteil)
const AU = require("./lib/abnahme-urteil.cjs");
const { luma709 } = AU;
const { stammVersion, pruefsumme, kernStand, sollQuelle, gitStand } = AU.standLeser(root);
// DER EINE SCHUSS (W1-n1, abnahme-urteil `schussVon`): das erste Ziel von „a,b:L1,…" trägt den Schuss mit dem Abdruck der
// Quellen ALLER Ziele, jedes weitere NENNT es; geschrieben wird einmal, nach der Prüfung jeder Zeile
function sollIstSchreiben(ziele, messung) {
    const text = ausDatei(SOLL_TAFEL);
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
// DAS FENSTER DER SITZUNG (`start --fenster <B>x<H>`, w28-probe-schirm): die Welt lebt ab dem Boot in dieser Größe; ohne Wort 640 × 360
const START_FENSTER = (() => {
    const m = /^(\d+)x(\d+)$/.exec(String(opt("--fenster", process.env.WERKBANK_FENSTER || "640x360")));
    if (!m) throw new Error("--fenster erwartet <Breite>x<Höhe>, z. B. 1920x1080");
    return { width: +m[1], height: +m[2], deviceScaleFactor: 1 };
})();
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
// DAS LANGSAME GERÄT AM SCHNELLEN (`start --drossel <n>`, w28-welt-steht): der Haupt-Faden der Seite läuft n-mal langsamer (CDP
// `Emulation.setCPUThrottlingRate`, die Sitzung bleibt angehängt, über jede Ladung) — die GTX 1050 mit dem i7-950 von 2009 an der
// Radeon nachgestellt: was die Welt beim „steht" noch nicht zeichnete, zeigt sich hier, nie erst auf dem fremden Läufer
const DROSSEL = +opt("--drossel", 0) || 0;
// … und sein GPU-Prozess (`start --pipeline-verzug <ms>`): die asynchronen Pipelines stehen in EINER Schlange, jede <ms> nach der
// vorigen — die GTX 1050 übersetzt kalt (leerer Treiber-Cache) in einer Schlange auf dem alten Kern, was nach dem Bild bestellt
// wird, steht hinten; die Drossel des Haupt-Fadens allein bremst den GPU-Prozess nie
const PIPELINE_VERZUG = +opt("--pipeline-verzug", 0) || 0;
// … und seine Platte (`start --abruf-verzug <ms> [--abruf-muster <regex>]`): jede Antwort eines Abrufs der Seite (mit Muster: nur,
// deren Adresse es trifft) kommt <ms> später — die kalte HDD der GTX 1050 (der zweite Start liest aus dem Cache des Systems)
const ABRUF_VERZUG = +opt("--abruf-verzug", 0) || 0;
const ABRUF_MUSTER = opt("--abruf-muster", "");

// ── Client ──────────────────────────────────────────────────────────────────────────────────────
const rufe = (weg, nutzlast) => werkbankRuf(PORT, weg, nutzlast);
const evalRuf = (code) => rufe("/eval", { code });
const umstellen = (o) => rufe("/umstellen", o);
const ergebnis = (a) => a.ergebnis || { fehler: a.fehler || "kein Ergebnis" };
// DAS ENDE eines Befehls: die Antwort (ein Satz oder das JSON) und der Exit — 0 nur, wenn `gruen`; ein Fehler ist nie grün
const endeMit = (t, gruen) => (console.log(typeof t === "string" ? t : JSON.stringify(t, null, 1)), process.exit(gruen ? 0 : 1));
// `--eigen`: die Welt als Kind von `start` am EINEN Tor (welt-boot `werkbankTor`, bereit am Ereignis), gestoppt am Ende
const eigeneWelt = async (zusatz, tor) => (hat("eigen") ? ((tor = werkbankTor(PORT, zusatz)), await tor.bereit, tor.stop) : null);
// `--datei`: das Ergebnis dorthin; das Ende eines Urteils `{ urteil, befunde }` unter seinem Namen
const dateiAb = (o) => opt("--datei") && jsonAb(path.resolve(opt("--datei")), o);
const urteilEnde = (name, u) => endeMit(`${name} ${u.urteil}${u.befunde.length ? ": " + u.befunde.join(" | ") : ""}`, u.urteil === "GRUEN");
// DIE HÄNDE DER WERKBANK an die Gänge der Domänen (scripts/lib/<domaene>-proben.cjs): dieselben Rufe und Schalter wie hier
const HAND = { argv, opt, hat, SELBST, rufe, evalRuf, umstellen, ergebnis, endeMit, eigeneWelt, dateiAb, urteilEnde };

// DIE SICHTBARE BÖE (vegetation.K2 Staffel 1, `bild --zeit Δt`): die zeitliche Luma-Varianz zweier Ausgabe-Bilder (Rec. 709 auf
// sRGB 0–255, `luma709`, Δt auseinander unter der Bild-Uhr der Bühne) auf den Pixeln der Maske `nah` (0–15 m), in der Seite `__boeVarianz`.
// Das Urteil: das Nah-Feld trägt ≥ 5 % des Bilds (NAH), am Kamm der Böe liegt die Varianz ≥ 2× über dem Rausch-Boden (die Paare
// bei Wind 0, nie unter 1 Stufe²; RAUSCH-BODEN), und der Kamm bewegt ≥ 2× so viel wie das Tal (LAUFZEIT) — die EINE wandernde Böe
// (WIND_BOE) erreicht den Ort zu ihrer Laufzeit; Flimmern oder ein eigener Sinus je Schicht hebt beide gleich. Je Zeitpunkt zwei
// Paare in Quadratur der Halm-Phase (uWindTime · 1,7 in `_windSwayOffset`, `viertel` = π/2 / 1,7 s): cos² + sin² hebt die Phase
// des Halms heraus, Kamm und Tal unterscheidet nur die Böe.
const BOE = { nahM: 15, viertel: Math.PI / 2 / 1.7 };
function boeVarianz(a, b, nah) {
    let s = 0,
        n = 0;
    for (let p = 0; p < nah.length; p++) if (nah[p]) (n += 1), (s += (luma709(b, p * 4) - luma709(a, p * 4)) ** 2);
    return n && s / n;
}
// `nah` zählt das Nah-Feld in 2,5 % des Bilds; `rot` nennt nah, ueber (Rausch-Boden) und lauf (Laufzeit) unter 2 beim Namen
const boeUrteil = ({ nahAnteil: n, kamm: K, tal: T }) => {
    const z = { nah: n * 40, ueber: K.v / Math.max(K.boden, 1), lauf: (K.v - K.boden) / Math.max(T.v - T.boden, 1e-3) };
    return Object.assign(z, { rot: Object.keys(z).filter((x) => z[x] < 2) });
};
// Der Selbsttest ohne Welt: die Varianz misst ΔY² nur im Nah-Feld; der Lauf an der Mess-Wiese und eine Böe über Flimmern sind GRÜN,
// Wind 0 (die Mutante), Flimmern allein, ein Sinus je Schicht ohne Böe (Kamm ≈ Tal) und ein Bild ohne Nah-Feld ROT beim Namen.
function boeSelbsttest() {
    const f = Math.abs(boeVarianz([10, 10, 10, 0, 9], [13, 13, 13, 0, 0], [1, 0]) - 9) > 1e-9 ? ["ΔY² im Nah-Feld"] : [];
    for (const [n, kv, tv, b, soll] of [[0.5, 3006, 843, 0, ""], [0.5, 1e-3, 0, 1e-3, "ueber,lauf"], [0.5, 30, 28, 20, "ueber,lauf"], [0.5, 90, 50, 40, ""], [0.5, 1470, 1427, 0, "lauf"], [0.01, 3006, 843, 0, "nah"]]) {
        const rot = boeUrteil({ nahAnteil: n, kamm: { v: kv, boden: b }, tal: { v: tv, boden: b } }).rot.join();
        if (rot !== soll) f.push(`${soll} ≠ ${rot}`);
    }
    return f;
}

// DER TIER-ZÄHLER (Seiten-Kontext): die Tiere streuen zwischen Boots stark und stören jede ABAB-Folge — je Messung steht
// ihre Zahl daneben, ein Weltzustand, kein
// Urteil: gesamt, im Sichtkegel des Hauptbilds (die Körper-Kugel des Spiels, `_kreaturAusserBlick` — dieselbe Frage wie Ruhe,
// Satz und `lauf --wandern kreis`; davon nah ≤ `ANALOG_NAH_M`), mit Schatten-Wurf je Kaskade (ein sichtbarer werfender Leib,
// dessen Körper-Kugel das Frustum der Kaskaden-Kamera trifft), die Arten (die Gattung) gesamt und im Sichtkegel.
function tierZahl() {
    const T = THREE;
    const st = r.state;
    const frustum = (kam) =>
        kam && new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse), kam.coordinateSystem);
    const cam = st.camera;
    const csm = st.csmNode;
    const dl = st.directionalLight;
    const kf = (csm?.lights?.length ? csm.lights.map((l) => l?.shadow?.camera) : dl?.shadow ? [dl.shadow.camera] : []).map(frustum);
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
        if (wirft) kf.forEach((f, i) => f?.intersectsSphere(kugel) && aus.schatten["k" + i]++);
    }
    return aus;
}

// DER POP UNTER BEWEGUNG (lod.K2 Staffel 1, die Messung der Station: koordination `bericht/2910-lod-k5/pop.js`; Seiten-Code, `r`
// die Welt): im Ego-Auge an der Mess-Wiese 4 m/s ins Offene, EINE Sekunde = 4 m in 8 Schritten zu 0,5 m. Je Schritt dieselbe Pose
// zweimal aus dem Ausgabe-Pfad (1920 × 1080): A mit dem Stand der Welt vom vorigen Ort, B nach 12 Takten des Spiels am neuen — jeder
// Pixel mit ΔLuma > 18 (Rec. 709) ist ein Pop, den keine Bewegung erklärt (die Blende dithert in beiden dieselbe Folge); die Treue
// nimmt A ein zweites Mal und bricht an jedem Byte. Je Schritt beim Namen, was zwischen A und B eintrat: die Karten-Dinge, die zum
// ersten Mal gezeichnet stehen (Zahl, nächster Abstand), und die Bauten, die ihre Stufe wechselten.
function popGang() {
    return (async () => {
        const cam = st.camera, W = 1920, H = 1080, pm = st.playerMesh.position, start = pm.clone(), y = (p) => r._voxelSurfaceY(p.x, p.z);
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
        st.renderer.setAnimationLoop(null);
        window.__buehne({});
        const schuss = async (p) => {
            cam.fov = r.constructor.KAM_FOV_GRAD;
            cam.updateProjectionMatrix();
            cam.position.set(p.x, y(p) + 1.7, p.z);
            cam.lookAt(p.x + fwd.x * 50, y(p) + 1.7, p.z + fwd.z * 50);
            cam.updateMatrixWorld(true);
            const f = await __ausgabeAufnahme(W, H, 1, { satz: "messung" }); // sie beginnt Folge und Dither neu (uDitherT 0)
            aus.kosten.push([f.info.drawCalls, f.info.triangles]); // Befehle und Dreiecke des gezählten Bilds
            return f.u8;
        };
        const geh = async (p) => {
            pm.set(p.x, y(p) + 0.05, p.z);
            for (let t = 0; t < 12; t++) (r._gameLoopTick(performance.now()), await sleep(5));
        };
        const stufe = (e) => [(e._lodLevel ?? -1) * 7 + (e._lodBandLevel | 0), r._archIsRendered(e)]; // Stufe, gezeichnet
        const aus = { schritte: [], popPixel: 0, kosten: [] };
        try {
            for (let i = 0; i < 8; i++) {
                const p1 = start.clone().addScaledVector(fwd, (i + 1) / 2);
                await geh(start.clone().addScaledVector(fwd, i / 2));
                const vor = new Map(st.architectures.filter(Boolean).map((e) => [e, stufe(e)]));
                const folgen = () => r.constructor.__arenaFolgen | 0, fA = folgen();
                // die Zahl der GPU-Wahl je Glied und Kamera nach dem Schuss (`zug.gpuZahl`, ein Bild Verzug) — wählt A anders als A2?
                const zahlen = async (z = new Map()) => { await sleep(80); for (const ar of r.constructor.__arenen.values()) for (const [k, zug] of ar._zuege || []) for (const [m, n] of zug.gpuZahl || []) z.set(`${r._taeterKlasse(m).slice(0, 40)}·${m.id}@${k === cam ? "auge" : "k" + k.id}`, n); return z; }; // prettier-ignore
                const a = await schuss(p1), zA = await zahlen();
                if (aus.treue === undefined) {
                    // der Täter beim Namen: jede Senke der GPU-Wahl, die in A außerhalb ihrer Arena stand (sie zeichnete ohne Wahl oder nicht)
                    const ohne = [];
                    st.scene.traverse((o) => o.__wahlGpu === true && !o.__arena && ohne.push(o.name || o.uuid.slice(0, 8)));
                    const [a2, fA2, zA2] = [await schuss(p1), folgen(), await zahlen()];
                    const wahl = [...new Set([...zA.keys(), ...zA2.keys()])].filter((k) => zA.get(k) !== zA2.get(k)).map((k) => `${k} ${zA.get(k) ?? "-"}→${zA2.get(k) ?? "-"}`); // prettier-ignore
                    aus.treue = a.reduce((n, x, k) => n + (x !== a2[k]), 0);
                    // der Ort beim Namen: abweichende Pixel je Feld (4 × 3, Zeilen oben → unten), der größte Luma-Sprung, und ob ein
                    // dritter Schuss dem zweiten gleicht (A unfertig) oder nicht (die Szene flackert)
                    const ort = (x, y) => { const f = Array(12).fill(0); let d = 0; for (let k = 0; k < W * H * 4; k += 4) if (x[k] !== y[k] || x[k + 1] !== y[k + 1] || x[k + 2] !== y[k + 2]) { const i = k / 4; f[Math.floor(((i / W) | 0) * 3 / H) * 4 + Math.floor((i % W) * 4 / W)]++; d = Math.max(d, Math.abs(luma709(x, k) - luma709(y, k))); } return `${f.join("/")} max ΔY ${d.toFixed(0)}`; }; // prettier-ignore
                    if (aus.treue) throw new Error(`die Treue: zwei Aufnahmen derselben Szene weichen in ${aus.treue} Bytes ab — Felder ${ort(a, a2)}; A2↔A3 ${ort(a2, await schuss(p1))}; Arena-Folgen vor A ${fA}, bis A2 ${fA2 - fA}; Wahl A↔A2 ${wahl.length} von ${zA.size} Zügen anders${wahl.length ? ": " + wahl.slice(0, 8).join(", ") : ""}${ohne.length ? ` — in A ohne Arena: ${ohne.join(", ")}` : ""}`); // prettier-ignore
                }
                await geh(p1);
                const b = await schuss(p1);
                const s = { pop: 0, ein: [], wechsel: 0 };
                for (let k = 0; k < W * H * 4; k += 4) if (Math.abs(luma709(a, k) - luma709(b, k)) > 18) s.pop++;
                for (const e of st.architectures) {
                    const v = e && vor.get(e);
                    if (e && r._archIsRendered(e) && !v?.[1]) s.ein.push(Math.round(Math.hypot(e.position.x - p1.x, e.position.z - p1.z)));
                    else if (v && v[0] !== stufe(e)[0]) s.wechsel++;
                }
                aus.popPixel += s.pop;
                aus.schritte.push(s);
            }
        } finally {
            pm.copy(start);
        }
        aus.laub = r._laubRand();
        aus.anteilJeSekunde = +((100 * aus.popPixel) / (W * H)).toFixed(4); // 4 m bei 4 m/s: EINE Sekunde
        return aus;
    })();
}

// ── Server ──────────────────────────────────────────────────────────────────────────────────────
async function starte() {
    // DIE WEICHE DER CI (welt-boot `starteBrowser`): die Werkbank zeichnet — eine CPU-Gruppe der CI trägt sie nie, ihre Stelle ist
    // die Karte (check.yml `echt`). Bis w27-swift-raus fuhren gate:nah-fern und gate:schatten-terminator so still swiftshader.
    if (process.env.CI_KLASSE === "cpu")
        throw new Error("CI_KLASSE=cpu: die Werkbank zeichnet — ihre Stelle ist die Karte");
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
    // Erst-Boot-Zahl („17 von 319 von der Platte"). Benannt (`--serie`) unter der Ablage, sonst das Scratch-Profil des EINEN
    // Starters (welt-boot `startePuppeteer`: es stirbt mit dem Browser, am Prozess-Ende und am Signal, ein toter Lauf wird gefegt).
    const profil = SERIE && ablage("profil-" + SERIE.replace(/[^a-z0-9_-]+/gi, "_"));
    const serieNeu = !fs.existsSync(profil); // ohne --serie ist profil "" (existsSync: false) — jeder Start ist neu
    if (SERIE) fs.mkdirSync(profil, { recursive: true });
    const bootArt = () => (boot.serieNeu && boot.ladungen <= 1 ? "erst" : "zweit");
    // die Boot-Zeile jeder Messung: Erst- oder Zweit-Boot, die Serie und die Ladungen der Seite
    const bootZeile = () => ({ art: bootArt(), serie: boot.serie, ladungen: boot.ladungen });
    const browser = await startePuppeteer({
        __rezept: ECHT ? "echt" : "linse", // der Start nennt sein Rezept (welt-boot startePuppeteer, z396)
        headless: !ECHT,
        userDataDir: profil,
        protocolTimeout: 10800000,
        defaultViewport: ECHT ? { width: 1920, height: 1080 } : null, // deviceScaleFactor: puppeteers Vorgabe 1
        // Echt: der Hardware-Adapter im Fenster; sonst die Weiche (lokal der Hardware-Adapter headless, in der CI swiftshader)
        // — die Schalter je Plattform trägt das EINE Rezept.
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1940,1200"] : linsenWebGpuArgs(),
    });
    // /status NENNT DAS PROFIL IMMER (`boot.profil`): die Proben der Punkte-Maschine hängen sich über sein DevToolsActivePort an
    // den Browser der Sitzung — die Serie ihr benanntes, sonst das Scratch-Profil des Starters (`browser.profil`). Bis hier nannte
    // /status ohne --serie keins (z216, w11-profil-leck): neun Stationen der Sitzung blieben an jedem Kopf UNGEMESSEN.
    const boot = { serie: SERIE || null, profil: profil || browser.profil, serieNeu, ladungen: 0 };
    await adapterZeile(browser);
    const page = await browser.newPage();
    if (DROSSEL > 1) {
        await (await page.target().createCDPSession()).send("Emulation.setCPUThrottlingRate", { rate: DROSSEL });
        console.log(`[drossel] Haupt-Faden ×${DROSSEL}`);
    }
    if (PIPELINE_VERZUG > 0) {
        await page.evaluateOnNewDocument((ms) => {
            const P = globalThis.GPUDevice && GPUDevice.prototype;
            if (!P) return;
            let schlange = Promise.resolve();
            for (const n of ["createRenderPipelineAsync", "createComputePipelineAsync"]) {
                const ur = P[n];
                P[n] = function (d) {
                    const p = ur.call(this, d);
                    const steht = schlange.then(() => p).then((x) => new Promise((ja) => setTimeout(() => ja(x), ms)));
                    schlange = steht.catch(() => {});
                    return steht;
                };
            }
        }, PIPELINE_VERZUG);
        console.log(`[drossel] jede asynchrone Pipeline +${PIPELINE_VERZUG} ms`);
    }
    if (ABRUF_VERZUG > 0) {
        await page.evaluateOnNewDocument(
            (ms, muster) => {
                const ur = globalThis.fetch;
                const trifft = new RegExp(muster || ".");
                globalThis.fetch = function (...a) {
                    const p = ur.apply(this, a);
                    if (!trifft.test(String(a[0] && a[0].url ? a[0].url : a[0]))) return p;
                    return p.then((r) => new Promise((ja) => setTimeout(() => ja(r), ms)));
                };
            },
            ABRUF_VERZUG,
            ABRUF_MUSTER
        );
        console.log(`[drossel] jeder Abruf der Seite${ABRUF_MUSTER ? ` /${ABRUF_MUSTER}/` : ""} +${ABRUF_VERZUG} ms`);
    }
    // DER ABBRUCH DER SEITE (welt-boot `seitenAbbruch`, w18-mensch-deckel): angelegt, solange die Seite ruht; der Leser ist der Rufer,
    // der vor seiner Antwort stirbt (`x-rufer`, unten) — die Zeile `[abbruch]` im Log nennt ihn
    const abbrechen = await seitenAbbruch(page);
    const loopAus = () => page.evaluate("__loop()"); // die Welt steht zwischen den Befehlen
    // ein Seiten-Werkzeug beim Namen (`window[name](k)`)
    const seite = (name, k) => page.evaluate((n, k) => window[n](k), name, k);
    if (!ECHT) await page.setViewport(START_FENSTER);
    const spur = { an: null }; // DIE BELEGUNG: der Lauf ruft die Spur vor seinem ersten gemessenen Takt an (`/lauf`)
    await page.exposeFunction("__spurAn", () => spur.an && spur.an());
    await page.evaluateOnNewDocument(WARTEN_SEITE); // die Seiten-Werkzeuge jeder Seite (`r`, sleep, das Warten), wie welt-boot
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(require("./lib/gesicht-proben.cjs").GESICHT_INSTALL); // die Proben der Iris (`bild --klasse …:kopf/`)
    await page.evaluateOnNewDocument(vramAbgriff);
    // DIE GPU-FEHLER-LINSE (V-D7): jede WebGPU-Validierung mit Pass und Objekt beim Namen (scripts/lib/gpu-fehler.cjs).
    if (GPU_FEHLER) await page.evaluateOnNewDocument(GPU_FEHLER_INSTALL);
    if (START_ORT) await ortZug(page, START_ORT);
    const fehler = [];
    const zerstoert = { n: 0 };
    // Der Zeuge des vollen Stempel-Pools (r184 warnt nur EINMAL je Seite — warnOnce): die Zahl zählt
    // `__stempelWache` (scripts/lib/zerlege-linse.cjs), die Warnung belegt, dass es geschah.
    const stempelWarnung = { n: 0 };
    page.on("pageerror", (e) => fehler.push(fehlerText(e).split("\n")[0]));
    // Der Tod der Seite beim NAMEN: jedes Ende (Absturz, Schließen, Navigation) landet mit Uhrzeit im Werkbank-Log.
    const tod = (was) => console.log(`[seite] ${new Date().toISOString()} ${was}`);
    page.on("error", (e) => tod("ABSTURZ " + (fehlerText(e))));
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
        // DER TAKT DER WERKBANK: die Bühne, der Ort und ein Takt des Loops (ein Wurf des Loops bricht die Probe nicht), sein
        // Versprechen ist das nächste Bild — wer im Schritt der Seite taktet (Ort, Band, Albedo-Tafel), wartet darauf, nie an der
        // Wanduhr (Lehre 26; bis 31.10. schliefen Band und Tafel je Takt 50 ms, der Ort trug denselben Takt als Zwilling); dazu die
        // ungebauten Werke in der Mesh-Zone (`architectureCullingRadius` um den Spieler)
        await page.evaluate(() => {
            // DER LOOP der Werkbank: an (der Spiel-Loop über rAF) oder aus (die Welt steht zwischen den Befehlen)
            window.__loop = (an, r = anazhRealm) => r.state.renderer.setAnimationLoop(an ? (t) => r._gameLoopTick(t) : null);
            window.__werkTakt = () => {
                try {
                    __buehne();
                    if (window.__ortSchritt) __ortSchritt();
                    r._gameLoopTick(performance.now());
                } catch {}
                return new Promise(requestAnimationFrame);
            };
            window.__ungebaut = (r = anazhRealm, st = r.state, pm = st.playerMesh.position) =>
                (st.architectures || []).filter(
                    (e) =>
                        (e.position.x - pm.x) ** 2 + (e.position.z - pm.z) ** 2 <= (st.architectureCullingRadius || 0) ** 2 &&
                        !r._archIsRendered(e)
                ).length;
        });
        // dazu die Orte aus der Welt (`__weltOrt`: eben · hang · hangfuss · ufer — der Wasser-Ort der Soll-Tafel, K63-n4)
        for (const i of [`window.__tierZahl = ${tierZahl};`, STAND.STAND_INSTALL, require("./lib/welt-orte.cjs").WELT_ORTE_INSTALL, ZL.ZERLEGE_INSTALL, SK.SHADER_INSTALL, ZZ.ZIEL_INSTALL, HL.HAENGER_INSTALL])
            await page.evaluate(i);
        // DIE SEITE IST GELADEN, WENN IHR ERSTES BILD DIE KETTE ENTSCHIED (w18-grund-post): die Post-Kette entsteht erst im ersten
        // gezeichneten Bild (`_ensurePostProcessing` in `_loopRender`), und `loopAus` hält die Welt danach still. Bis hier galt die Seite
        // mit dem Backend als geladen — vor ihrem ersten Bild: nach `/reload` stand die Kette in 2 von 3 Ladungen nie (Radeon 94d9c5a6,
        // die Tür der Grundstellung), und die Sitzung endete an „zeichner.postKette fort“ (GTX und Radeon, 102 von 113 Stationen
        // UNGEMESSEN). Gewartet wird, bis das Spiel die Kette gebaut hat — oder seine Weiche sie fallen ließ (`postProcessingFailed`)
        // oder das Gerät verloren ist: beides nennt danach die Zeichenkette der Sitzung beim Namen, nie hängt die Ladung daran (alle
        // drei setzt erst der bereite Renderer)
        await page.evaluate(() => __weltDa(() => st.postProcessing || st.postProcessingFailed || st._deviceLost));
        if (GPU_FEHLER) await page.evaluate(GPU_FEHLER_OBJEKT);
    };
    await lade();
    await loopAus();

    // DER ORT (spec/profiband/haushalt.json `messorte`): mit `--ort` steht der Spieler am Ort und blickt in seine Richtung,
    // der Dorf-Zug folgt dem Ort, und der Ort-Takt läuft in JEDEM Takt der Werkbank (`__ortSchritt`). Ohne `--ort` bleiben
    // Zug und Blick, der Ort-Takt ist leer.
    // Der Ort, an dem die Werkbank zuletzt umstellte (`umstellen --ort`) — die Albedo-Tafel nennt ihn.
    let aktOrt = null;
    // DER STAND dieser Aufstellung ([x, z], wie `umstellen` ihn meldet): an einem Ort mit Pose aus dem Plan (`ortPose`) der Messort
    // der Band — die Spec trägt dort keinen (stadt) oder nur den Start (dorf), `/band` las `ort.spieler` und brach (w27-ort-pose)
    let aktStand = null;
    // DIE SICHT des gestellten Orts: Ego oder Third-Person — der Ort wird in ihr aufgestellt, die Band richtet die
    // Ratsche dieses Orts × Geräts × Sicht.
    let aktSicht = null;
    // DIE WELT DES ORTS (Toggle-Ort, haushalt.json `welt`): die Prüfbühne ist eine geborene Welt — sie betritt die
    // Seite wie im Spiel durch DIE TÜR (`importWorldBeside` mit `reload`: Sperre, Zeiger, Wechsel am Ort). Steht die Seite schon in ihr
    // (derselbe slug), bleibt sie; ein Import, der nicht greift, oder eine Seite, die danach in einer anderen Welt steht, bricht laut.
    const weltDesOrts = async (ort) => {
        const json = jsonLesen(path.join("spec", ort.welt));
        const slug = json.worldMeta?.slug;
        if (!slug) throw new Error(`Messort ${ort.id}: die Welt ${ort.welt} trägt keinen worldMeta.slug`);
        const steht = () => page.evaluate((s) => st.worldMeta?.slug === s, slug);
        if (await steht()) return { slug, neu: false };
        // DIE ANKUNFT WIE IM SPIEL: die Ziel-Welt kommt mit laufendem Takt an (der Neuladen bootete die Seite mit ihm bis
        // `loopAus`), bis ihr Genesis-Ort steht — erst ihr Takt am Ankunfts-Ort setzt ihn (`_tickGenesisOrt`: jedes Tor des Plans
        // auf seinem Slot, `worldMeta.genesisOrt.steht`); mit ruhendem Takt stand die Prüfbühne ohne ihn (nur ihre 7 Prüfkörper,
        // die Nah-Deckung der Aufnahme fand keine Instanz-Gruppe)
        const res = await page.evaluate((j) => {
            const x = r.importWorldBeside(j, { reload: true });
            return x?.ok ? (__loop(1), { id: x.worldId }) : { fehler: JSON.stringify(x).slice(0, 200) };
        }, json);
        if (res.fehler)
            throw new Error(`Messort ${ort.id}: die Welt ${ort.welt} ließ sich nicht importieren (${res.fehler})`);
        // DER HAKEN DES START-ORTS (w4-proben-tempo, 30.10.): `start --ort <ohne Dorf-Zug>` legt `__anazhAutoSettlement = false` vor JEDE
        // Ladung — in der Ziel-Welt lebte der Dorf-Takt darum nie, und mit ihm nie ihr Genesis-Ort (`_dorfTaktLebt` in `_tickGenesisOrt`,
        // stamm/siedlung-ort.js:2776): die Ankunft wartete ohne Frist (die Sitzung bootet seit 30.10. mit `--ort wiese`; schatten.K1#1 GTX
        // 379e5f56 ≥ 90 s „zuletzt: fenster“, swiftshader 28 min ohne Ring). Die Ankunft hebt ihn wie im Spiel, bis der Ring steht; den
        // Zug des Orts stellt danach `umstellen` (die Bühne: dorfZug false)
        await lade(
            page.evaluate(() => {
                delete window.__anazhAutoSettlement;
                return __weltDa(() => st.worldMeta.genesisOrt?.steht);
            })
        );
        await loopAus();
        if (!(await steht())) throw new Error(`Messort ${ort.id}: nach dem Wechsel steht die Seite nicht in ${slug}`);
        return { slug, neu: true, id: res.id };
    };
    // Der Adapter-Text des Geräts (WebGPU `adapterInfo`: Hersteller · Architektur · Beschreibung) — EIN Leser für Albedo und Band.
    const geraetInfo = () =>
        page.evaluate(async () => {
            const a = navigator.gpu ? await navigator.gpu.requestAdapter() : null;
            const i = a?.info ? a.info : null;
            return i ? [i.vendor, i.architecture, i.description].filter(Boolean).join(" ") : null;
        });
    const umstellen = (x, z, o) =>
        page.evaluate(
            async (x, z, o) => {
                // DER ANKER des Orts (haushalt.json `anker`): die Stamm-Methode nennt, wo der Ort in DIESER Welt steht —
                // steht er mehr als 1 m neben dem Spieler-Platz der Spec, bricht die Aufstellung laut ab (sonst urteilte
                // die Messung über einen leeren Rand).
                if (o?.anker) {
                    const a = r[o.anker]();
                    if (!a || !Number.isFinite(a.x) || !Number.isFinite(a.z) || Math.hypot(a.x - x, a.z - z) > 1)
                        throw new Error(
                            `Messort ${o.ort}: der Anker ${o.anker} steht bei ${a ? a.x + " " + a.z : "?"}, der Ort bei ${x} ${z} — ` +
                                "der Ort wandert mit der Welt (spec/profiband/haushalt.json)"
                        );
                }
                window.__ortTakt = o?.takt || [];
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
                const stell = o?.stell || null;
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
                    if (window.__ortStell) __ortStell();
                    const pm = r.state.playerMesh.position;
                    for (const m of window.__ortTakt) r[m](pm);
                };
                if (window.__ortStell) __ortStell();
                if (o && Number.isFinite(o.gier)) {
                    r.state.yaw = o.gier;
                    r.state.pitch = 0;
                }
                // DER ANLAUF (haushalt.json `anlauf`): dort steht der Spieler zuerst und schwingt ein — er gründet die Stadt, der Zug baut
                // kein Haus auf ihm, eine Stadt erwacht erst, wenn er naht —, dann steht er am Ort: am Boden oder auf dem Dach (`dach`, m)
                const a = o?.anlauf || [x, z];
                r.state.playerMesh.position.set(a[0], r._voxelSurfaceY(a[0], a[1]) + 1.8, a[1]);
                // DIE GRÜNDUNG (haushalt.json `gruendung`, die Stadt): Same und Größe aus dem Wort, der Ort am Anker der Spec (bis w25-stadt-takt-3 sprach der Spieler sein Wort am Anlauf mit dem Blick des Orts, wie im
                // Spiel (Chat)) — die Siedlung steht danach am Anker der Spec (±1 mm, sonst laut: die Ort-Wahl wanderte mit der Welt; der
                // Richter des Verkehrs stellt die Stadt genau dorthin — bis w12-verkehr ±1 m, und 0,28 m daneben stand eine andere
                // Stadt: 295 statt 300 Häuser, vier statt einer Wende, gate:fahr-leben --verkehr GRÜN, die Radeon 7 von 20); eine Welt,
                // die sie trägt, gründet nicht neu. Die Bahn des Orts (`bahn`, die Hauptgasse) liegt Meter für Meter auf ihrem Weg (`_aufWeg`).
                const g = o?.gruendung;
                window.__ortBahn = o?.bahn || null;
                if (g) {
                    const same = g.wort.split(" ")[1];
                    const zellen = () => Object.values(r.state.worldMeta.settlementCells || {});
                    const steht = () =>
                        zellen().find((c) => String(c.seed) === same && Math.hypot(c.x - g.anker[0], c.z - g.anker[1]) <= 1e-3);
                    if (!steht()) {
                        // DIE STADT AM ANKER DER SPEC, nie am Fenster (w25-stadt-takt-3): das Wort ohne Ort misst den Anker vor dem
                        // Spieler durch den Bildwinkel der Welt-Kamera (`_siedlungsAnker`, fov × Seitenverhältnis) — das Fenster des
                        // Windows-Läufers rückte die Stadt um 5,3 mm (GTX 048c472e: 662,7171/422,3055 statt 662,7200/422,3099), und
                        // jede Probe am Ort stand still. Gegründet wird mit dem Ort des Ankers, wie der Richter des Verkehrs
                        // (fahr-proben `verkehr`); ein Wunsch-Ort, der den Spieler nicht berührt, bleibt, wie er ist.
                        const [, seed, nH] = g.wort.split(" ").map(Number);
                        // DER AKT IST DIE BEREIT-BEDINGUNG (w27-ort-pose): die Probe wartet auf sein Versprechen (`spawnSettlement`,
                        // Buch · Export · Ort-Wahl im Faden · Zug), dann urteilt sie mit den Zellen. Bis hier zählte ein Deckel jeden
                        // Gang ohne Takt (120 × 250 ms): 30 s Wanduhr, und die GTX 1050 brauchte länger — „DER BAU STEHT NICHT: die
                        // Gründung nach 120 Takten" an stadt und stadt-voll (78d37554, 41 s); davor zählte er nur stille Gänge (900 s).
                        // Das Gesetz der Siedlung im Buch zuerst (wie der Richter des Verkehrs): sonst gab der Akt nach seiner Frist
                        // (45 s) an der kalten GTX 1050 ohne Stadt auf
                        await __weltDa(() => AnazhRealm._siedlungGesetz());
                        await r.spawnSettlement({ verlangt: "human", seed, nH, position: { x: g.anker[0], y: 0, z: g.anker[1] } });
                    }
                    if (!steht())
                        throw new Error(`Messort ${o.ort}: „${g.wort}" steht nicht am Anker ${g.anker} (${JSON.stringify(zellen())})`);
                }
                if (o) window.__anazhAutoSettlement = o.dorfZug; // der Zug des Orts (haushalt.json `dorfZug`)
                if (o?.kamera) r.setCameraMode(o.kamera);
                // eingeschwungen, wenn der Ring an seinem Ziel gebaut ist, dann DIE WELT STEHT (A9, `__weltStehtNach` hält den Regler) —
                // in Bau-Ereignissen, nie an der Wanduhr. Der Ort schwingt unter REGLER VOLL ein (die Bedingung der Messung, E): der Ring
                // steht an seinem Ziel, gehalten wie `stell.ring`, nie nach der Last der Nachbarn auf der geteilten GPU (A9, Mess-Wiese:
                // Ring 2 statt 4, boden-nah 2,391 statt 1,814 — die nahen Kronen fehlten)
                const ziel = stell?.ring ? stell.ring : Math.min(12, st.chunkRingRadius || 4);
                const decke = st.perfTargetMs;
                st.perfTargetMs = 1000;
                // DER TAKT DES ORTS geht im Schritt der Seite (der Takt der Werkbank und sein Bild, `__werkTakt`; bis 31.10. sein eigener
                // Zwilling) — bis 30.10. schlief er 50 ms je Takt: an der Radeon (Mess-Sitzung, Ort wiese) waren 27–30 s von 40–48 s
                // Ring-Zeit dieser Schlaf (537–607 Takte × 50 ms), nicht das Streaming; die Ankunft des Spielers geht im Bild-Takt
                const takt = () => {
                    if (st._activeRingRadius < ziel) st._activeRingRadius = ziel;
                    return __werkTakt();
                };
                let takte;
                try {
                    takte = await __gebautNach(`Messort ${o ? o.ort : `${x} ${z}`}: der Ring ${ziel}`, {
                        fertig: () => r._builtRingRadius() >= ziel,
                        takt,
                        max: 1800,
                        warum: () => `der Ring steht bei ${r._builtRingRadius()}`,
                    });
                    takte += await __weltStehtNach(takt);
                    // die Bahn der Gründung erst, wenn die Welt am Anlauf steht: der Zug legt die Wege der Stadt nach ihrem Gedächtnis
                    const k = g ? o.bahn : [];
                    for (let i = 1; i < k.length; i++)
                        for (let s = 0, l = Math.hypot(k[i][0] - k[i - 1][0], k[i][1] - k[i - 1][1]); s <= l; s++) {
                            const x = k[i - 1][0] + ((k[i][0] - k[i - 1][0]) * s) / l, z = k[i - 1][1] + ((k[i][1] - k[i - 1][1]) * s) / l;
                            if (!r._aufWeg(x, z, 0)) throw new Error(`Messort ${o.ort}: die Bahn verlässt die Gasse bei ${x.toFixed(1)} ${z.toFixed(1)}`);
                        }
                    // DIE STADT STEHT, BEVOR DIE POSE FRAGT (w27-ort-pose-voll): `_ortPose` bricht beim Namen, solange der Verkehr
                    // einer städtischen Siedlung nicht steht — er entsteht mit ihrer Liste, wenn der Spieler naht (`_tickBewohner`,
                    // binnen `nearM` 260 m; der Anlauf liegt 264 m vor stadt und 437 m vor stadt-voll). Der Ort tritt an den Anker
                    // seiner Gründung, bis jede städtische Siedlung im Nah-Ring ihren Verkehr trägt. Bis hier fragte der erste Gang
                    // vom Anlauf: die Pose kam ohne Spur (die Mitte des Platzes), dort weckte der Spieler die Stadt, und erst der
                    // zweite Gang sah die Spur — still
                    if (o?.ortPose) {
                        if (g) r.state.playerMesh.position.set(g.anker[0], r._voxelSurfaceY(g.anker[0], g.anker[1]) + 1.8, g.anker[1]);
                        const [p, nah] = [r.state.playerMesh.position, AnazhRealm.AUTO_SETTLEMENT.nearM];
                        const schlaeft = () =>
                            [...(r._bewohnerSiedlungen || new Map()).values()].filter(
                                (S) => S.plan.staedtisch && !S.verkehr && Math.hypot(S.ox - p.x, S.oz - p.z) <= nah
                            );
                        takte += await __gebautNach(`Messort ${o.ort}: der Verkehr der Siedlung`, {
                            fertig: () => !schlaeft().length,
                            takt,
                            max: 1800,
                            warum: () => `ohne Verkehr im Nah-Ring: ${schlaeft().map((S) => S.key).join(", ")}`,
                        });
                    }
                    // DIE POSE AUS DEM PLAN (`ortPose`, w27-ort-pose): der Ort steht auf dem Platz seiner Siedlung und blickt auf
                    // ihren ersten freien Bau (`_ortPose`) — gerechnet hier, nie eine Zahl der Spec. IN ZWEI GÄNGEN: der Bestand der
                    // Welt um den Platz (`_blockerUmPlatz`) ist erst gebaut, wenn der Spieler dort steht — der zweite Gang
                    // fragt den Blick am Platz neu (nur noch den Blick: die Spur steht seit dem Warten oben schon im ersten, der
                    // Stand beider Gänge ist derselbe). Ohne Siedlung, Platz, Verkehr oder freien Bau bricht der Stamm beim Namen
                    for (let gang = o?.ortPose ? 2 : 1; gang--; ) {
                        // DIE POSE WARTET AUF IHREN STAND (w28-stadt-grammatik): das Gesetz der Pose sagt selbst, welcher Bruch mit dem
                        // Takt der Welt vergeht (`_ortPose` wirft ihn mit der Marke `warten`: der Verkehr steht noch nicht · an der
                        // Trasse trägt die Route keines fahrenden Wagens gerade einen Stand — in der geschlossenen Bauflucht der Stadt
                        // nicht an jedem Meter). Jeder Gang wartet bei JEDER Regel Takt um Takt genau auf diese Marke und fragt dann
                        // ohne einen Takt dazwischen; ein Bruch ohne Marke wirft sofort beim Namen, der Deckel nennt den letzten
                        // Grund. Bis hier fragte der Ort an der Trasse, sobald EIN Wagen fuhr (ein Stellvertreter): am Messort stadt
                        // brach er mit „kein Stand an der Trasse (1 Wagen in Fahrt von 9)“, 41 Takte später trug die Pose
                        if (o?.ortPose) {
                            let grund = "";
                            takte += await __gebautNach(`Messort ${o.ort}: der Stand der Pose`, {
                                fertig: () => {
                                    try {
                                        r._ortPose(g ? g.anker : [x, z], o.ortPose);
                                        return true;
                                    } catch (e) {
                                        if (!e.warten) throw e;
                                        grund = e.message;
                                        return false;
                                    }
                                },
                                takt,
                                max: 1800,
                                warum: () => grund,
                            });
                        }
                        var P = o?.ortPose && r._ortPose(g ? g.anker : [x, z], o.ortPose);
                        if (P) [x, z, r.state.yaw, r.state.pitch] = [P.x, P.z, P.gier, P.nick || 0]; // der Nick der Pose (trasse: über die Dächer der Wagen, die dem Auge entgegenfahren)
                        if (o?.anlauf || P) {
                            r.state.playerMesh.position.set(x, o.dach ? o.dach + AnazhRealm.PLAYER_FOOT_OFFSET : r._voxelSurfaceY(x, z) + 1.8, z);
                            takte += await __weltStehtNach(takt);
                            // der Träger der Kapsel (`_stepCharacter`): steht der Spieler auf dem Bau in der Höhe des Dachs?
                            if (o.dach && !(r.state._kapselStruktur && Math.abs(r.state._kapselTraegerY - o.dach) < 0.5))
                                throw new Error(`Messort ${o.ort}: kein Dach bei ${o.dach} m (Träger ${r.state._kapselTraegerY})`);
                        }
                    }
                } finally {
                    st.perfTargetMs = decke;
                }
                // ein Dorf, das vor dem Ort losging (ein Ort ohne Dorf-Zug, der Zug lief im Boot): sein Plan schwebt — Wege und
                // Platz stehen, der Wald weicht, das Dorf wächst nie. Beim Namen (die Folge startet mit `start --ort`).
                const q = r._autoSettlementQueue;
                const dorfSchwebt =
                    o?.dorfZug === false && (q || r._autoSettlementPendingKey)
                        ? q?.plan?.slots
                            ? `Plan ${q.idx}/${q.plan.slots.length} (Zelle ${q.cellKey})`
                            : `Export ${r._autoSettlementPendingKey || "?"}`
                        : null;
                return {
                    takte,
                    steht: r._weltSteht(),
                    spieler: [x, z],
                    blick: P && [P.ziel.x, P.ziel.z],
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
            const rend = r.state.renderer;
            const boden = (x, z, v) =>
                typeof v === "string" && v[0] === "+" ? r._voxelSurfaceY(x, z) + Number(v.slice(1)) : Number(v);
            // DAS GESICHT (`--gesicht <m>`): die Kamera steht <m> vor dem Kopf des Spielers (sein Kopf-Gelenk, 8 cm darüber
            // die Augenhöhe, seine Blick-Richtung) und blickt ihn an — die Pose kommt aus dem Leib, nie von Hand
            let gpos = null;
            if (k.gesicht != null) {
                const T = THREE;
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
            const mitte = (S, i = (S.th >> 1) * S.tw + (S.tw >> 1)) => S.punkt(i);
            if (k.arm != null) {
                if (r.state.cameraMode !== "first" || !k.klasse) throw new Error("--arm: Ego (--sicht ego) und --klasse");
                for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
                const a = r.state.camera.position.clone();
                const tiefe = async () => (await __ausgabeAufnahme(64, 36, 1, { satz: "messung", tiefe: true }), await __spiegelDaten());
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
                const db = rend.getDrawingBufferSize(new THREE.Vector2());
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
            // `--uhr u` (0..1, 0,5 = Mittag): die Bühne mit Sonne und Sommer zu dieser Stunde — die Uhr ist ihr Wort (`__buehne`
            // liest `k.uhr`, dieselbe EINE Uhr wie die Licht-Bilanz der Zelle; bis w4-himmel-uhr stand die Welt erst auf Mittag, dann
            // sprang der Uhr-Schreiber); Himmel und Umgebung springen mit ihr, die Leuchtquellen folgen ihr (der Pool zu seinem
            // Fixpunkt in der Bühne)
            __buehne(k);
            if (r.state.playerMesh) r.state.playerMesh.visible = !!k.spieler;
            // DAS ZIEL des Bilds ist der Blick-Punkt: die Aufnahme prüft, ob es im Bild und frei ist, und die Blick-Wahl
            // sucht bis zu `wahl` Posen um den Ort (Standard drei Runden, 42; `--wahl 0` schießt nur die genannte Pose).
            // Das Ziel einer Pose aus dem Leib (`--gesicht`, `--arm`) ist der Kopf oder die Fläche auf Armlänge, kein Werk hinter
            // einer Kuppe: sein Fuß (ausgabe-aufnahme `punkte`, ein Ziel 0,6–40 m über dem Boden) liegt unter dem Bild — 0,7 m vor
            // dem Gesicht 1,4 m tiefer, haar.K2#1 „Ziel Blickziel nicht im Bild (ndc [0,0])“ auf beiden Geräten —, `fuss: false`
            // `k.fuss === false` (die Zellen am Spawn): das Ziel ist der Anker des Blicks im Ring, kein Werk — sein Fuß ist kein Beweis
            const ziel = { x: lx, y: ly, z: lz, name: k.ziel || "Blickziel", benannt: !!k.ziel, punkte: k.punkte, fuss: gpos ? false : k.fuss !== "false" && k.fuss };
            const wahl = k.wahl != null ? Number(k.wahl) : 42;
            // DAS TIER STEHT (w28-linse-wahr, C): zwischen Wahl und Schuss hält der Halter die Tiere an ihrem Ort (`__halten` tiere, x/z) —
            // bis hier ging das Tier am Ziel fort, ehe der Schuss fiel (nah/tier-wiese, -genesis, -stadt, -dorf: GRÜN ohne Tier)
            const hielt = !!window.__gehalten?.has("tiere");
            __halten(["tiere"]);
            // DIE WAHL VOR DEM EINEN SCHUSS (w18-abnahme-sicht-3): die Blick-Wahl stellt die Kamera (sie urteilt ihre Pose in deren Welt), der
            // Schuss steht dort und trägt ihr Ergebnis. Bis dahin lief die Wahl in einem ersten ganzen Schuss, dessen Bild der zweite
            // verwarf (zweimal Erst-Zeichnung, Rückstrahl, 33 Bilder und Abnahme). Ohne Wahl (`--wahl 0`) wartet der Schuss, bis die Welt
            // an der Pose steht (`__weltStehtWarten`), und jeder Schuss beginnt seine Geschichte neu
            if (wahl > 0 && window.__buehneUhr) await __weltStehtWarten();
            let auf;
            try {
                const gewaehlt = wahl > 0 ? await __blickWahl({ ziel, wahl }) : null;
                try {
                    if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
                } catch {}
                // das ROTE Bild kommt zurück (`rotBild`: die Werkbank legt es als `*-rot.png` ab und meldet ROT), das Bild aus Bewegung
                // wartet auf keine stehende Welt (`bewegt`)
                auf = await __ausgabeAufnahme(k.w, k.h, 1, { ziel, wahl: gewaehlt, rotBild: true, bewegt: !!k.bewegt });
            } finally {
                if (!hielt) window.__gehalten.delete("tiere");
            }
            // Die Welt RUHT zwischen den Befehlen (nur `umstellen` tickt): im Leerlauf fraß der Loop unter
            // swiftshader ~3 Kerne und verfälschte jede andere Messung.
            // die Tiefe und Kamera des Schusses (A13, die Achse der Spiegel-Treue), ehe ein weiterer Schuss sie überschreibt
            const spiegel = (window.__letzteSpiegel = k.klasse ? auf.tiefe : null);
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
                // DER KOPF IN STOFFEN (die Kopf-Klasse des Stamms, `_kopfKlasse`): jeder Leib eines Menschen — der Spieler, jeder
                // Bewohner — teilt sich in `<leib>:kopf/<Stoff>` und `<leib>:leib/<Stoff>`; wählt der Ausdruck den Leib selbst
                // (`^spieler$`), ist er EINE Klasse, sonst zeigt die Teilung jeden Stoff des Kopfs für sich (`^bewohner:kopf/`).
                // Bis w4-bewohner-wache teilte die Werkbank selbst, nur den Spieler und nur unter `--gesicht`
                const teilName = (o) => {
                    const [grob, fein] = r._kopfKlasse(o);
                    return re.test(grob) ? grob : fein;
                };
                const teile = new Map();
                const nimm = (kl, o) => teile.set(kl, [...(teile.get(kl) || []), o]);
                // DER BAU-SATZ IN BEREICHEN (`_bauSatzArt` · `_tickBauSatz`): ein Bau-Satz zeichnet die Instanz-Gruppen
                // vieler Exemplare als EIN Mesh — die Teilung führt jeden Bereich beim Namen seiner Gruppe (`_taeterGruppe`:
                // Exemplar und Stufe, f:drachentor:L1), nie den Satz. Ein Bereich verbirgt sich, indem er den Satz verlässt
                // (`_chunkSatzAus`), und kehrt über den EINEN Weg zurück (`_bauSatzMarke` → `_tickBauSatz`); ein Nur-Wurf-Satz
                // zeichnet nie ins Bild und bleibt, wie er ist.
                const bauSaetze = new Map();
                for (const [art, s] of r.state.chunkSaetze || [])
                    if (s.mesh?.userData?.bauSatz && !s.spec.nurWurf)
                        bauSaetze.set(s.mesh, { art, s });
                // DIE KARTE IN ARTEN (w4-laub-karte): der EINE Karten-Atlas zeichnet jede Art aus EINER Gruppe
                // (`IMPOSTOR_ATLAS_GRUPPE`) — die Teilung führt jede Art beim Namen ihrer Zelle (`_instanzKlasse`: `fimp:<art>:L2`,
                // die Schicht der Instanz in aKarte.x), nie die Gruppe: das Urteil der schlechtesten Teil-Klasse sieht die Art, ein Mittel über
                // den Atlas verbarg sie. Eine Art verbirgt sich, indem ihre Instanzen für den Schuss unter die Welt ziehen (die
                // Matrix, gemerkt an der Slot-Marke `slotRef` — die Wahl je Pass ordnet die Slots um), und kehrt danach an ihre
                // Marke zurück.
                const kg = r.state.archInstanceGroups?.get(r.constructor.IMPOSTOR_ATLAS_GRUPPE),
                    arten = new Map();
                if (kg?.mesh?.geometry.attributes.aKarte) {
                    const art = new Map([...r._kartenAtlas.zellen.values()].map((z) => [z.idx, r.constructor._instanzKlasse(z.key)]));
                    for (let i = 0; i < kg.liveCount; i++) {
                        const kl = art.get(Math.round(kg.mesh.geometry.attributes.aKarte.array[i * 4]));
                        arten.set(kl, [...(arten.get(kl) || []), kg.slotRef[i]]);
                    }
                }
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
                    if (o === kg?.mesh && arten.size) return arten.forEach((refs, kl) => re.test(kl) && nimm(kl, { refs, mesh: o, y: [] }));
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
                const wurf = new Map(alle.map((o) => (o.bereich || o.refs ? o.mesh : o)).map((o) => [o, o.castShadow]));
                // die Instanzen einer Karten-Art: unter die Welt (y −10⁷) und zurück auf ihre Höhe, am Slot ihrer Marke
                const zieht = (o, weg) => {
                    const a = o.mesh.instanceMatrix.array;
                    o.refs.forEach((f, j) => {
                        const i = f.slot * 16 + 13;
                        if (weg) o.y[j] = a[i];
                        a[i] = weg ? -1e7 : o.y[j];
                    });
                    o.mesh.instanceMatrix.needsUpdate = true;
                    r._archMeshBundleTouch(o.mesh);
                };
                const verbirg = (o) => (o.bereich ? r._chunkSatzAus(o.art, o.key) : o.refs ? zieht(o, true) : (o.visible = false));
                const zeig = (o) => (o.bereich ? r._bauSatzMarke(o.key, o.art) : o.refs ? zieht(o, false) : (o.visible = true));
                const ruhen = ["_tickNahWiese", "_ruheImBild"].map((m) => [m, Object.hasOwn(r, m), r[m]]);
                for (const [m] of ruhen) r[m] = () => 0;
                // verbirgt der Schuss die Strähnen des Spielers, ist sein Kopf kahl: die Kappe gehört zum Haar (`_kopfKahl`, haar.K2)
                const schuss = async (aus) => {
                    for (const o of aus) verbirg(o);
                    r._kopfKahl(aus);
                    bundlesNeu();
                    try {
                        return (await __ausgabeAufnahme(W, H, 1, { satz: "messung", rueckstrahl: aus.length ? "halten" : null })).u8; // ohne Teil steht das Licht von unten wie in G
                    } finally {
                        for (const o of aus) zeig(o);
                        r._kopfKahl([]);
                        r._tickBauSatz(Infinity);
                        bundlesNeu();
                    }
                };
                // DIE KENNUNG DER KLASSE (w28-kante-mass, abnahme-urteil `kennTeilung`): je Schuss ohne Teil `KENN_N` Bilder der Tiefe des
                // Szenen-Passes ab dem Neubeginn der Folge (`__ausgabeAufnahme` tiefe: dieselbe TRAA-Folge und Dither-Phase wie das
                // Bild, ohne Farbe und Geschichte; `__spiegelDaten` je Bild). Ein gemessener Stoff, der keine Tiefe schreibt (der Film
                // der Membran), schreibt sie für diese Bilder — sonst trüge er keine Kennung —, danach steht jeder Stoff wie vorher.
                // `auge`: die Spur des Auges (`gesichtMasse` spur) liest die WIRKUNG seines Fehlens im Bild, nur für sie ein Farb-Schuss.
                const KENN_N = 8;
                const auge = (n) => /:kopf\/auge$/.test(n);
                const ohneTiefe = new Set(
                    [...wurf.keys()].flatMap((o) => [].concat(o.material || [])).filter((s) => s && s.depthWrite === false)
                );
                const tiefen = async (aus) => {
                    for (const s of ohneTiefe) ((s.depthWrite = true), (s.needsUpdate = true));
                    for (const o of aus) verbirg(o);
                    r._kopfKahl(aus);
                    bundlesNeu();
                    try {
                        await __ausgabeAufnahme(64, 36, 1, { satz: "messung", tiefe: true });
                        for (const D = []; ; window.__loopBild()) {
                            const S = await __spiegelDaten();
                            D.push(S.tiefe);
                            if (D.length >= KENN_N) return { D, tw: S.tw, th: S.th };
                        }
                    } finally {
                        for (const o of aus) zeig(o);
                        r._kopfKahl([]);
                        r._tickBauSatz(Infinity);
                        for (const s of ohneTiefe) ((s.depthWrite = false), (s.needsUpdate = true));
                        bundlesNeu();
                    }
                };
                // DIE KARTE OHNE IHRE RINDE (w28-karte-stamm, für abnahme-urteil `rindeAus`): die Zellen des Atlas, die im Bild
                // Instanzen tragen, backen einmal OHNE ihre Texel unter dem Kronen-Fuß — die Wahl der Ablage (`KARTE_RECHNER_WGSL`
                // bc1) hält für diesen Gang zusätzlich die Zeile des Texels gegen `saum.fuss` seines Rings, derselbe Fuß, an dem
                // das Gesetz Band und Stamm trennt —, ein Schuss; dann backen sie wieder ganz, ein Schuss. Der Satz der Programme
                // ohne Rinde bleibt je Sitzung stehen (ein Bau), der Satz der Welt kehrt unberührt zurück. Trägt die Ablage die
                // Zeile der Wahl nicht mehr, bricht die Messung laut — nie zählt die Rinde still wieder als Laub.
                const karteRinde = async (fn) => {
                    const A = r.constructor,
                        text = A.KARTE_RECHNER_WGSL,
                        WAHL = "let o = kk > 0.0 && (kk > gr || (kk == gr && (y - gf.y) * gf.z + (x - gf.x) < gj));";
                    if (typeof text !== "string" || text.split(WAHL).length !== 2)
                        throw new Error("die Rinde der Karte: die Ablage (KARTE_RECHNER_WGSL bc1) trägt die Zeile ihrer Wahl nicht");
                    const at = r._kartenAtlas,
                        schicht = kg.mesh.geometry.attributes.aKarte.array,
                        imBild = new Set(Array.from({ length: kg.liveCount }, (_, i) => Math.round(schicht[i * 4])));
                    const backe = async (wgsl, satz) => {
                        A.KARTE_RECHNER_WGSL = wgsl;
                        r._karteRechnerSatz = satz;
                        const q = r._impostorBakeQueue || (r._impostorBakeQueue = []);
                        for (const z of at.zellen.values()) {
                            if (!z || !z.gebacken || z.gescheitert || !imBild.has(z.idx)) continue;
                            z._weltNeu = true;
                            if (!q.includes(z.key)) q.push(z.key);
                        }
                        // der EINE Deckel (welt-boot `deckel`): solange die Schlange der Karten trägt, hat die Welt offen
                        // (`_weltOffen().karten`) — er wirft beim Namen, wenn sie hängt, nie an der Wanduhr
                        for (const weiter = __deckel("die Karte der Laub-Linse backt (ohne Rinde und wieder ganz)", 120); q.length && weiter(); ) {
                            r._tickImpostorBake();
                            await sleep(25);
                        }
                    };
                    // DIE PLATTE BLEIBT UNBERÜHRT: ein Bake reicht seine Bytes auf die Platte der Schale, solange die Zelle ihren
                    // Liefer-Schein trägt (`z._liefer`, `_karteAblage`) — die Karte ohne Rinde läge dort unter dem Gesetz-SHA der
                    // ganzen. Für beide Gänge ruht der Schein jeder Zelle und kehrt danach zurück.
                    const welt = r._karteRechnerSatz,
                        scheine = new Map([...at.zellen.values()].filter(Boolean).map((z) => [z, z._liefer]));
                    let ohne;
                    try {
                        for (const z of scheine.keys()) z._liefer = null;
                        await backe(
                            text.replace(WAHL, WAHL.slice(0, -1) + " && (f32(y - gf.y) + 0.5) * f32(1u << p.k) <= saum.fuss[gv0 / jeRing()];"),
                            window.__karteSatzOhneRinde
                        );
                        window.__karteSatzOhneRinde = r._karteRechnerSatz;
                        ohne = await fn();
                    } finally {
                        try {
                            await backe(text, welt);
                        } finally {
                            for (const [z, schein] of scheine) z._liefer = schein;
                        }
                    }
                    return { ohne, voll: await fn() };
                };
                try {
                    for (const o of wurf.keys()) o.castShadow = false;
                    const G = await schuss([]);
                    const G2 = await schuss([]);
                    const Os = [];
                    for (const n of namen) Os.push(auge(n) ? await schuss(teile.get(n)) : null);
                    const tK = performance.now();
                    const KG = await tiefen([]);
                    const Z = [];
                    for (const n of namen) Z.push(__kennZaehl(KG.D, (await tiefen(teile.get(n))).D));
                    // die Kennung beim Namen: Bilder, Skala der Tiefe, Zeit, und wie viele Tiefe-Pixel von G zwischen dem ersten und
                    // dem letzten Bild wechseln (die Blende dithert: 0 hieße, die Bilder stünden still und die Deckung wäre EIN Bild)
                    const kenn = { n: KENN_N, tw: KG.tw, th: KG.th, ms: Math.round(performance.now() - tK), wechsel: 0 };
                    for (let s = 0, a = KG.D[0], b = KG.D[KENN_N - 1]; s < a.length; s++) kenn.wechsel += a[s] !== b[s];
                    // DAS BILD OHNE FILM (D8, K5 milchweiss): misst die Tafel die Membran, zeichnet derselbe Schuss sie noch einmal
                    // mit ihrem Ziel allein (`__membranOhneFilm`) — Milch ist, was der Film dem Ziel hinzufügt, nie ein blasses Ziel
                    let ohneFilm = null;
                    if (teile.has("portal-membran")) {
                        __membranOhneFilm(true);
                        try {
                            ohneFilm = await schuss([]);
                        } finally {
                            __membranOhneFilm(false);
                        }
                    }
                    const schwelle = 18;
                    const rauschen = __bildRauschen(G, G2, W, H, schwelle);
                    const { teil, misch, gemischt } = __kennTeilung(Z, KENN_N, KG.tw, KG.th, W, H);
                    // DIE RINDE DER KARTE IST KEIN LAUB (w28-karte-stamm, abnahme-urteil `rindeAus`): trägt die Teilung Arten des
                    // Karten-Atlas, verlässt jedes Pixel, das die Karte ohne Rinde von der ganzen trennt, seine Klasse — es ist Außen
                    // wie das Holz der Netz-Stufen (bis hier las der gerade Stamm der Karte als Laub-Kante). `rinde` nennt je Art die
                    // Zahl und `treu`, wie weit der Schuss nach dem Gang von G abweicht (die Karte steht wieder wie vorher). Wer nur
                    // Pixel zählt (`nurPixel`), zählt die Karte samt Stamm: kein Bake-Gang je Schuss.
                    const kartenTeil = namen.map((n) => teile.get(n).some((o) => o.refs));
                    let rinde = null;
                    if (!k.nurPixel && kartenTeil.some(Boolean)) {
                        const paar = await karteRinde(() => tiefen([]));
                        const zahl = __rindeAus(teil, __kennZaehl(paar.voll.D, paar.ohne.D), KENN_N, KG.tw, KG.th, W, H, kartenTeil);
                        let anders = 0;
                        for (let s = 0, a = paar.voll.D[0], b = KG.D[0]; s < a.length; s++) anders += a[s] !== b[s];
                        rinde = {
                            pixel: Object.fromEntries(namen.map((n, j) => [n, zahl[j]]).filter((_e, j) => kartenTeil[j])),
                            treu: +(anders / KG.D[0].length).toFixed(6), // der Anteil der Tiefe, die nach dem Bake-Gang anders steht als in G
                        };
                    }
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
                        const T = THREE;
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
                                ziel.push(luma709(Z.daten, zi));
                                bild.push(luma709(u8, p * 4));
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
                    // DIE MASSE, DIE DAS URTEIL LIEST (w4-proben-tempo2, 31.10.): `nurPixel` zählt je Klasse nur ihre Pixel — ein
                    // Aufrufer, der nur sie liest (das Jahr der Vegetation, die Wiese, die Herde am Hang), trug je Schuss die ganzen Maße
                    // (Zweiton, Milch, Kante, Spiegel, Mikro; Radeon 2134b209 1,1–3,6 s je Schuss, an den Kronen 4,7 von 20,5 s). Die Pixel
                    // zählt der Gang, der die Maske legt (w4-stationen-schnell-a: ein `filter(Boolean)` je Klasse dahinter trug vier Klassen
                    // der Wiese 145 ms je Schuss auf 1920 × 1080)
                    namen.forEach((n, j) => {
                        const m = new Uint8Array(W * H);
                        let px = 0;
                        for (let p = 0; p < W * H; p++) px += m[p] = teil[p] === j + 1 ? 1 : 0;
                        const mb = /^portal-membran$/.test(n);
                        const ms = k.nurPixel ? { pixel: px } : __klassenMasse(u8, m, W, H, aussen, mb ? ohneFilm : null, spiegel);
                        if (mb && ms.pixel) ms.ziel = zielTreue(m);
                        if (ms.pixel) klassen[n] = Object.assign({ objekte: teile.get(n).length }, ms);
                    });
                    // DIE FARBE JE KLASSE (der Inhalt des Orts, `inhaltUrteil`): das Mittel ihrer Pixel in linearem Licht
                    if (k.inhalt) {
                        const s = namen.map(() => [0, 0, 0]);
                        for (let p = 0, i = 0; p < W * H; p++, i += 4)
                            if (teil[p]) for (let c = 0; c < 3; c++) s[teil[p] - 1][c] += srgbLin(u8[i + c]);
                        namen.forEach((n, j) => klassen[n] && (klassen[n].farbe = s[j].map((x) => +(x / klassen[n].pixel).toFixed(5))));
                    }
                    // DIE PROBEN DES GESICHTS: je Vertex des Kopfs sein Zug (Iris am Gelenk, auf der
                    // Kopf-Haut der Ton seiner Ecke, `aTon` — koerper `menschTon`: Haut, Lippe, Höhle, Haar-Kappe), projiziert auf den
                    // Schirm; `K.gesichtMasse` (koerper-core) liest das BILD dort, wo die Teilung den Teil des Vertex zeigt. Die Töne
                    // kommen aus dem Leib selbst, nie von Hand — bis mensch.K4 aus der Farbe der Ecke, die die Verdeckung der Haut dunkelt.
                    // Die Maße gehören der Klasse, die die Kopf-Haut eines Leibs wählt (mensch-kopf `^spieler:kopf/`, `^bewohner:kopf/`);
                    // wählt sie sie nicht (haar `^spieler:kopf/hair$`), misst sie kein Gesicht — bis dahin warf jeder Haar-Schuss „keine
                    // Kopf-Haut am Gelenk head“ (haar.K2#1 third, beide Geräte). DAS GESICHT IST EINES: das des sichtbaren gewählten
                    // Leibs, der der Kamera am nächsten steht (`_leibWurzel`, `_menschLeib`: der Spieler oder ein Bewohner — vor
                    // der Wache steht um 7,2 Uhr die zweite daneben; ein Bewohner außerhalb der Nah-Wahl trägt sichtbare Teile unter
                    // seiner verborgenen Wurzel, am Start-Dorf 77 von 81 Leibern); die Pose (`--gesicht` vor dem Spieler oder die
                    // Kamera vor einem Bewohner) ist nur die Pose. Bis w4-bewohner-wache kannte das Gesicht nur den Spieler unter
                    // `--gesicht`.
                    let gesicht = null;
                    const kopfHaut = /:kopf\/(haut|skin)$/;
                    if (namen.some((n) => kopfHaut.test(n))) {
                        const T = THREE;
                        const K = window.__koerperCore;
                        if (!K || typeof K.menschTon !== "function" || typeof K.gesichtMasse !== "function" || !K.KOPF_SOLL)
                            throw new Error("--gesicht: koerper-core ohne menschTon/gesichtMasse/KOPF_SOLL in der Seite");
                        const ab = (L) => L.position.distanceTo(cam.position);
                        const [wahlLeib] = namen
                            .filter((n) => kopfHaut.test(n))
                            .flatMap((n) => teile.get(n).map(r._leibWurzel, r))
                            .filter((L) => L.visible)
                            .sort((a, b) => ab(a) - ab(b));
                        const knochen = (o, i) => {
                            const si = o.geometry.attributes.skinIndex,
                                sw = o.geometry.attributes.skinWeight;
                            if (!si || !o.skeleton) return o.parent?.name === "head" ? "head" : null;
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
                        const ZUG = new Map([
                            [K.menschTon("skin"), "haut"],
                            [K.menschTon("lips"), "lippe"],
                            [K.menschTon("socket"), "hoehle"],
                            [K.menschTon("haarKappe"), "kappe"],
                            [K.menschTon("braue"), "braue"],
                        ]);
                        const v = new T.Vector3();
                        // DIE ALBEDO DER ECKE (das Licht des Gesichts, `gesichtMasse` weiss): ihre Farbe im Guss (linear), für einen
                        // Bewohner mal dem Verhältnis seiner Palette zu der seiner Gestalt am Ton der Ecke (`_tonFaktor`, die Ton-Tafel)
                        const tafel = r.state.tonTafel?.image ? r.state.tonTafel.image : null;
                        const albedo = (o, i) => {
                            const c = o.geometry.attributes.color;
                            if (!c) return null;
                            const a = [c.getX(i), c.getY(i), c.getZ(i)];
                            const z = o.userData?.__ton;
                            const ta = o.geometry.attributes.aTon;
                            if (z && tafel && ta && (z[0] || z[1])) {
                                const t = Math.round(ta.getX(i));
                                const zeile = (j) => tafel.data.subarray((j * tafel.width + t) * 4, (j * tafel.width + t) * 4 + 3);
                                const [x, y] = [zeile(z[0]), zeile(z[1])];
                                for (let ch = 0; ch < 3; ch++) a[ch] *= x[ch] / Math.max(1e-4, y[ch]);
                            }
                            return a;
                        };
                        const roh = [];
                        let minY = Infinity,
                            maxY = -Infinity,
                            nm = 0;
                        const mitte = new T.Vector3();
                        for (const [n, os] of teile) {
                            if (!/:kopf\/(auge|haut|skin)$/.test(n)) continue;
                            const kix = namen.indexOf(n) + 1;
                            for (const o of os) {
                                if (r._leibWurzel(o) !== wahlLeib) continue;
                                // DAS BILD DER ECKE (`gesichtMasse` bild): ob die Kamera dieses Schusses ihr Teil zeichnet (seine Ebene).
                                // Der Wurf-Zwilling (die Grobstufe auf SHADOW_TWIN_LAYER, `_gelenkStufe`) trägt dieselbe Klasse und
                                // wirft nur; bis w14-gesicht-fern lagen seine 6 299 Ecken der Kopf-Haut als Haut-Proben in jedem
                                // Bildpunkt von Lippe und Höhle (Kamera des Spiels, Radeon 341ad089: 198 von 198 Lippen-Proben in
                                // zwei Zonen, gesicht 0,333 mit Lippe und Höhle ungemessen). Mitte und Haarlinie liest nur der Kopf im Bild.
                                const bild = o.layers.test(cam.layers);
                                const pa = o.geometry.attributes.position;
                                const gf = /\/auge$/.test(n) ? __gesichtFlaeche(o, cam, T) : null; // die Fläche je Ecke (lib/gesicht-proben)
                                for (let i = 0; i < pa.count; i++) {
                                    const kn = knochen(o, i);
                                    let z = null,
                                        seite = null;
                                    if (/\/auge$/.test(n) && /^iris[LR]$/.test(kn)) {
                                        z = "iris";
                                        seite = kn;
                                    } else if (kn === "head" && /\/(haut|skin)$/.test(n)) {
                                        const ta = o.geometry.attributes.aTon;
                                        if (!ta) throw new Error(`--gesicht: ${n} trägt keinen Ton je Ecke (aTon, koerper menschTon)`);
                                        z = ZUG.get(Math.round(ta.getX(i))) || null;
                                    }
                                    if (!z) continue;
                                    o.getVertexPosition(i, v);
                                    v.applyMatrix4(o.matrixWorld);
                                    if (bild && z !== "iris" && z !== "braue") {
                                        minY = Math.min(minY, v.y);
                                        maxY = Math.max(maxY, v.y);
                                        mitte.add(v);
                                        nm++;
                                    }
                                    const ndc = v.clone().project(cam);
                                    roh.push({
                                        z,
                                        seite,
                                        bild,
                                        k: kix,
                                        a: z === "iris" ? null : albedo(o, i),
                                        g: z === "iris" ? gf[i] : undefined,
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
                                .filter((p) => p.bild && p.seite === sd)
                                .map((p) => p.d)
                                .sort(aufsteigend);
                            median[sd] = ds.length ? rang(ds) : null;
                        }
                        // DER STRAHL DER KAMERA ZUR IRIS (KOPF_SOLL augeFrei: „Strahl", die Lider sind das Rig): je vordere Iris-Probe,
                        // ob der Strahl von der Kamera dieses Schusses sie erreicht, ohne Haut, Lid, Braue oder Haar des Kopfs zu kreuzen —
                        // die Verdeckung ist Geometrie und gilt unter jedem Bildpunkt; das Bild zeigt, DASS das Auge steht (`spur`).
                        // Bis w12-gesicht entschied das Pixel allein: an der Kamera des Spiels (6 m) trägt die Iris 1,3 Bildpunkte
                        const decke = [];
                        for (const [n, os] of teile)
                            if (!/:kopf\/auge$/.test(n)) for (const o of os) if (o.isMesh && r._leibWurzel(o) === wahlLeib) decke.push(o);
                        for (const o of decke) (o.isSkinnedMesh ? o : o.geometry).computeBoundingSphere();
                        const strahl = new T.Raycaster();
                        const richt = new T.Vector3();
                        // der Täter beim Namen: je verdeckte Probe die Klasse des ersten Treffers (Haut, Haar und Braue), das Lid als
                        // `<leib>:kopf/lid` — das Lid in seiner Lage ist die Lidspalte (lib/gesicht-proben `gesichtStrahl`, `gesichtMasse` lid)
                        const decktZu = {};
                        const frei = (p) => {
                            const s = __gesichtStrahl(strahl, richt, cam, p, decke, knochen);
                            const nm = s.treffer ? r._kopfKlasse(s.treffer)[1] : s.lid ? `${r._menschLeib(wahlLeib)}:kopf/lid` : null;
                            if (nm) decktZu[nm] = (decktZu[nm] || 0) + 1;
                            return s;
                        };
                        const proben = roh
                            .filter((p) => p.x >= 0 && p.y >= 0 && p.x < W && p.y < H)
                            .map((p) => {
                                const vorn = p.z === "iris" ? p.d < median[p.seite] : p.w.clone().sub(mitte).dot(zurCam) > 0;
                                const fr = p.z === "iris" && vorn ? frei(p) : null;
                                return {
                                    ...p,
                                    frei: fr ? fr.frei : undefined,
                                    lid: fr ? fr.lid : undefined,
                                    vorn,
                                    kalotte: p.z !== "iris" && p.w.y > yHaar,
                                };
                            });
                        const haarK = namen.map((n, j) => (n === `${r._menschLeib(wahlLeib)}:kopf/hair` ? j + 1 : 0)).filter(Boolean);
                        if (!nm) throw new Error("--gesicht: keine Kopf-Haut am Gelenk head");
                        // DIE SPUR DES AUGES (`gesichtMasse` augeFrei): je Teil des Auges, wo sein Fehlen das Pixel über der Schwelle
                        // ändert — dort steht es im Bild, auch wo ein Lid den Bildpunkt mit ihm teilt (die Iris unter einem Bildpunkt)
                        const spur = {};
                        namen.forEach((n, j) => {
                            if (!/:kopf\/auge$/.test(n)) return;
                            const O = Os[j],
                                m = new Uint8Array(W * H);
                            for (let p = 0, i = 0; p < W * H; p++, i += 4)
                                m[p] = Math.abs(G[i] - O[i]) + Math.abs(G[i + 1] - O[i + 1]) + Math.abs(G[i + 2] - O[i + 2]) > schwelle ? 1 : 0;
                            spur[j + 1] = m;
                        });
                        const ungefenstert = K.gesichtMasse(u8, teil, W, H, proben, haarK, { gemischt, spur });
                        // DAS GESICHT IM MESS-FENSTER (w27-traa-fenster): an der Kamera des Spiels trägt die Iris ≈ 1 Bildpunkt, Lippe
                        // und Höhle wenige — ihre Züge las die Linse nach der Phase des Bildpunkts (gesicht 0,667 / 0,5 und lippeA
                        // 12,62 / 14,25 / 15,08 an derselben Pose, 6,11–6,13 m). Derselbe Blick, dieselbe Welt, k-fach vergrößert um
                        // die Mitte des Kopfs: die zeitliche Auflösung trägt das Fenster (`state.messFenster`, bild-kosten), die Teilung,
                        // die Spur und die Proben stehen im Fenster; Strahl, Vorderseite und Kalotte bleiben die des Spiels. Wählt die
                        // TRAA es nicht (kein Träger), misst die Linse nichts — sonst läse sie wieder die Phase.
                        const fk = 4; // vierfach: die Iris von ≈ 1 auf ≈ 4 Bildpunkte je Achse (≥ 2 × 2 rein, koerper `gesichtMasse`)
                        const mc = mitte.clone().project(cam);
                        const F = { k: fk, cx: (mc.x + 1) / 2, cy: (1 - mc.y) / 2, getragen: 0 };
                        // DIE WAHL STEHT (Bedingung des Koordinators): die Lage des Hauptbilds (`_passLageGen`, ihre Generation) vor
                        // und nach den Fenster-Schüssen — wählt jeder Pass aus der Projektion des Spiels (`_wahlMatrix`), bleibt sie
                        // dieselbe, und jeder Leser (Abschnitte, Instanzen, Streu, Werfer) behält die Wahl des Spiel-Bilds
                        // — dazu die Kaskaden (Projektion und Lage jeder Schatten-Kamera, größte Abweichung im Fenster-Schuss)
                        const lageGen = () => r._passLagen?.get("haupt")?.gen ?? null;
                        const kaskaden = () => (r.state.csmNode?.lights || []).flatMap((l) => [...l.shadow.camera.projectionMatrix.elements, ...l.shadow.camera.matrixWorld.elements]); // prettier-ignore
                        const [genVor, kVor] = [lageGen(), kaskaden()];
                        r.state.messFenster = F;
                        const Gf = [],
                            Osf = [];
                        let genErst = null,
                            kIn = [],
                            KGf = null;
                        const Zf = [];
                        try {
                            Gf.push(await schuss([]));
                            [genErst, kIn] = [lageGen(), kaskaden()];
                            for (const n of namen) Osf.push(auge(n) ? await schuss(teile.get(n)) : null);
                            KGf = await tiefen([]);
                            for (const n of namen) Zf.push(__kennZaehl(KGf.D, (await tiefen(teile.get(n))).D));
                        } finally {
                            delete r.state.messFenster;
                        }
                        const wahl = { gen: [genVor, genErst, lageGen()] };
                        wahl.steht = wahl.gen.every((g) => g === genVor);
                        wahl.kaskaden = kVor.length === kIn.length && kVor.length ? Math.max(...kVor.map((x, i) => Math.abs(x - kIn[i]))) : null;
                        const fenster = { k: fk, mitte: [+F.cx.toFixed(4), +F.cy.toFixed(4)], getragen: F.getragen, wahl };
                        if (!F.getragen || !wahl.steht) {
                            const grund = !F.getragen
                                ? "das Mess-Fenster ohne Träger (die zeitliche Auflösung setzte es nicht) — die Linse läse die Phase des Bildpunkts"
                                : `die Wahl folgte dem Fenster (Lage des Hauptbilds ${wahl.gen.join(" → ")}) — die Linse mäße eine andere Welt als die gezeichnete`;
                            gesicht ={ augeFrei: null, augeFreiGrund: grund, lippeL: null, lippeA: null, hoehleL: null, hoehleA: null, haarDeckung: null, weiss: null, irisDecke: decktZu, fenster, ungefenstert }; // prettier-ignore
                        } else {
                            const tf = __kennTeilung(Zf, KENN_N, KGf.tw, KGf.th, W, H);
                            const camF = cam.clone();
                            camF.setViewOffset(W * fk, H * fk, F.cx * W * fk - W / 2, F.cy * H * fk - H / 2, W, H);
                            const vf = new T.Vector3();
                            const probenF = proben
                                .map((p) => {
                                    vf.copy(p.w).project(camF);
                                    return { ...p, x: Math.floor(((vf.x + 1) / 2) * W), y: Math.floor(((1 - vf.y) / 2) * H) };
                                })
                                .filter((p) => p.x >= 0 && p.y >= 0 && p.x < W && p.y < H);
                            const spurF = {};
                            namen.forEach((n, j) => {
                                if (!/:kopf\/auge$/.test(n)) return;
                                const [Gx, O] = [Gf[0], Osf[j]],
                                    m = new Uint8Array(W * H);
                                for (let p = 0, i = 0; p < W * H; p++, i += 4)
                                    m[p] = Math.abs(Gx[i] - O[i]) + Math.abs(Gx[i + 1] - O[i + 1]) + Math.abs(Gx[i + 2] - O[i + 2]) > schwelle ? 1 : 0;
                                spurF[j + 1] = m;
                            });
                            gesicht = Object.assign(K.gesichtMasse(Gf[0], tf.teil, W, H, probenF, haarK, { gemischt: tf.gemischt, spur: spurF }), {
                                irisDecke: decktZu,
                                fenster,
                                ungefenstert,
                            });
                        }
                    }
                    let abstand = null;
                    if (k.abstand) {
                        const T = THREE;
                        // die Bänder: die festen Ringe des Gesetzes (vegetation.K1: 2–5 · 5–10 · 10–20 · 20–40 m) und der Ring der Nah-Wiese
                        // (ihr Radius in DIESER Welt) sind Kanten
                        const ring = r.constructor.NAH_WIESE ? r.constructor.NAH_WIESE.radius : null;
                        const baender = [...new Set([0, 2, 5, 10, 20, 40, ring, 80, 200].filter((x) => x != null))].sort(
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
                        // DER MARSCH JE POSE EINMAL (w4-stationen-schnell-a): der Treffer je 2×2-Block hängt nur an der Kamera und am
                        // gezeichneten Boden, nie an Saison, Uhr oder Klasse — ein Schuss an derselben Kamera über demselben Boden (das
                        // Jahr der Vegetation: drei Jahreszeiten an EINER Pose, vegetation.K5) liest den Treffer des vorigen
                        // (`window.__abstandSpeicher`); ein Block, den der vorige nicht marschierte, marschiert jetzt. Die Matrizen der
                        // Kamera und der Abdruck des Bodens (je Chunk Stufe, Netz und der INHALT seiner Karte und seiner Ziel-Karte; das
                        // Auge der Stufen, der Geomorph, die vorläufigen Säulen — alles, was `_bodenSichtAt` liest) fallen den Speicher
                        // bei jeder Änderung. Bis dahin rief jeder Wiesen-Schuss `_bodenSichtAt` ~20,8 Mio.-mal (≈ 1 µs je Ruf, die
                        // Mess-Wiese in der Null-Welt 20,5 s; GTX b4bcf19c je Wiesen-Schuss 30 s, die Krone 6–8 s). DER INHALT, NIE DIE
                        // IDENTITÄT (w12-wintergras): die Saison baut die Chunks im Band der Schneegrenze und am Pegel neu (`_schneeTakt`,
                        // `_pegelTakt`: neue Farbe, dieselben Höhen) — der Abdruck aus Eintrag, Karte und Netz fiel mit jedem Neubau, die
                        // Wiese des Jahrs marschierte an EINER Kamera dreimal (Radeon 79595d21: 19,2 · 17,4 · 16,4 s)
                        const abdruck = () => {
                            const a = [...cam.matrixWorld.elements, ...cam.projectionMatrix.elements, W, H, st.stufeAuge?.x, st.stufeAuge?.z];
                            for (const [k, e] of st.voxelChunks) a.push(k, e.lod, !e.mesh, e.surfMap?.join(), e.surfMapZiel?.join());
                            for (const s of st.saeulenVorlaeufig?.values() || []) a.push(s.x, s.z, s.rr, s.krone);
                            return a.concat(st.atmoUniforms?.geomorph?.value);
                        };
                        let speicher = window.__abstandSpeicher;
                        const vor = abdruck();
                        if (!(speicher?.abdruck?.length === vor.length && vor.every((x, i) => x === speicher.abdruck[i])))
                            speicher = window.__abstandSpeicher = { treffer: new Float64Array(W * H).fill(NaN) };
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
                                const blk = y0 * W + x0;
                                let hit = speicher.treffer[blk];
                                if (Number.isNaN(hit)) {
                                    let t0 = 0,
                                        t = 0.2;
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
                                    speicher.treffer[blk] = hit;
                                }
                                if (hit < 0) continue;
                                const d = Math.hypot(v.x * hit, v.z * hit);
                                const bi = band(d);
                                if (bi < 0) continue;
                                const kk = d >= 2 && d < 5 && x0 + 1 < W && y0 + 1 < H && `${Math.floor((pos.x + v.x * hit) / 2)},${Math.floor((pos.z + v.z * hit) / 2)}`;
                                if (kk) __farbtonProbe(ftK.get(kk) || ftK.set(kk, [0, 0, 0, 0]).get(kk), u8, (y0 * W + x0) * 4, W);
                                // DER WEG IST KEINE LÜCKE DER WIESE (w24-wiese-ferne): ein Boden-Pixel, dessen Treffer auf dem Weg liegt (das EINE
                                // Pfad-Feld `_pfadFeldAt` über der Hälfte — dort steht keine Karte der Ferne), zählt als `bodenSatz:weg`, nie als
                                // Grund der Wiese (vegetation.K1 liest als Grund nur `bodenSatz`): bis dahin hielt ein Ring nur „satt", solange Gras
                                // den Weg bedeckte (Mess-Wiese, 20–40 m: 581 Pixel Weg, LAI 0,88)
                                const weg = r._pfadFeldAt(pos.x + v.x * hit, pos.z + v.z * hit, pos.y + v.y * hit) > 0.5;
                                for (let q = 0; q < 4; q++) {
                                    const x = x0 + (q & 1),
                                        y = y0 + (q >> 1);
                                    const c = x < W && y < H ? teil[y * W + x] : 0;
                                    if (!c) continue;
                                    const n = weg && namen[c - 1] === "bodenSatz" ? "bodenSatz:weg" : namen[c - 1];
                                    (zahl[n] || (zahl[n] = baender.slice(1).map(() => 0)))[bi]++;
                                    cosS[bi] += -v.y;
                                    cosN[bi]++;
                                }
                            }
                        // der Abdruck NACH dem Marsch: was der Leser unterwegs anlegt (die Ziel-Karte eines Chunks im Geomorph), trägt der
                        // nächste Schuss schon — derselbe Boden
                        speicher.abdruck = abdruck();
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
                            const g = 0.25 * luma709(u8, i);
                            mu8[i] = g;
                            mu8[i + 1] = g;
                            mu8[i + 2] = g + 40;
                        }
                        // das Alpha setzt `__png` deckend (welt-boot)
                    }
                    klasse = {
                        ausdruck: k.klasse,
                        schwelle,
                        rauschen,
                        misch,
                        kenn,
                        rinde,
                        toene: namen.map((n, j) => `${n}=${ton[j % ton.length].join("/")}`),
                        klassen,
                        abstand,
                        gesicht,
                        // die Armlänge, wie die Tiefe der Bildmitte sie misst
                        arm: k.arm == null ? undefined : { soll: +k.arm, ist: +(mitte(spiegel) || cam.position).distanceTo(cam.position).toFixed(3) },
                        maske: __png(mu8, W, H),
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
            // DIE ZEIT (`--zeit Δt`, vegetation.K2): an der Pose des Bilds je Paar zwei Ausgabe-Bilder Δt auseinander unter der
            // Bild-Uhr der Bühne (`__buehneUhr.T`), am Kamm und im Tal der Böe in der Mitte des Nah-Felds (7,5 m vor dem Auge; das
            // größte und das kleinste Böen-Maß des EINEN Winds am Ort `_windAt` in der Minute ab der Bühnen-Uhr — die Laufzeit der
            // wandernden Böe bis dorthin); je Paar der Rausch-Boden derselben Uhren bei Wind 0 (die Böen-Drift `_windWob` 0: Gras
            // und Krone ruhen). Das Nah-Feld (0–15 m) aus der Tiefe des Schusses (`mitte`); die Varianz misst `boeVarianz`.
            // Headless (swiftshader, Mess-Wiese, Δt 0,25 s): Kamm 2999 über Boden 0,001, Tal 878 — Kamm/Tal 3,42, Nah-Feld 53,6 %;
            // Wind 0 (`_windWob` 0) ROT, Kamm = Boden.
            let zeit = null;
            if (k.zeit != null) {
                const U = window.__buehneUhr,
                    T0 = U.T,
                    S = auf.tiefe,
                    nah = new Uint8Array(W * H),
                    B = r.constructor.WIND_BOE;
                for (let p = 0; p < W * H; p++) {
                    const P = mitte(S, Math.floor(((Math.floor(p / W) + 0.5) * S.th) / H) * S.tw + Math.floor((((p % W) + 0.5) * S.tw) / W));
                    nah[p] = P?.distanceTo(cam.position) <= k.nahM ? 1 : 0;
                }
                const q = cam.getWorldDirection(new THREE.Vector3()).setY(0).setLength(k.nahM / 2).add(cam.position),
                    boe = Array.from({ length: 1200 }, (_, i) => [T0 + i / 20, r._windAt(q.x, q.z, T0 + i / 20).boe]).sort((a, b) => a[1] - b[1]),
                    wob = Object.getOwnPropertyDescriptor(r, "_windWob");
                const schuss = async (t, still) => {
                    U.T = t;
                    if (still) r._windWob = () => 0;
                    try {
                        return new Uint8Array((await __ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8);
                    } finally {
                        if (wob) Object.defineProperty(r, "_windWob", wob);
                        else delete r._windWob;
                    }
                };
                const paar = async ([t, boe]) => {
                    const o = { t, boe, v: 0, boden: 0 };
                    for (const tq of [t, t + k.viertel]) {
                        const [a, b, a0, b0] = [await schuss(tq), await schuss(tq + k.zeit), await schuss(tq, 1), await schuss(tq + k.zeit, 1)];
                        o.v += __boeVarianz(a, b, nah);
                        o.boden += __boeVarianz(a0, b0, nah);
                        o.bilder = o.bilder || [__png(a, W, H), __png(b, W, H)];
                    }
                    return o;
                };
                try {
                    zeit = { dt: k.zeit, nahAnteil: nah.reduce(addiere, 0) / (W * H), tempo: B.omega / B.k, kamm: await paar(boe.at(-1)), tal: await paar(boe[0]) };
                } finally {
                    U.T = T0;
                }
            }
            const lum = (i) => luma709(u8, i);
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
                zeit,
                png: __png(u8, W, H),
            };
        }, k);
    // DIE SEITE DER WERKBANK an die Wege der Domänen (scripts/lib/<domaene>-proben.cjs): Seite, Gerät, Ablage — der Ort, wie er beim Lesen steht
    const werkSeite = { page, browser, seite, spur, stempelWarnung, fehler, geraetInfo, bootZeile, ECHT, ECHT_SEITE, SEITEN_PORT, ablage, zeitAblage, ordnerFuer, jsonAb, kernStand, get aktOrt() { return aktOrt; }, get aktStand() { return aktStand; }, get aktSicht() { return aktSicht; } }; // prettier-ignore

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
            // DER RUFER TRÄGT SEINE ARBEIT (w18-mensch-deckel): wer über `werkbankRuf` ruft (Kopf `x-rufer: traegt`), dessen Arbeit lebt in
            // der Seite, solange er lebt — stirbt er vor der Antwort (der Deckel der Punkte-Maschine beendet den Prozess der Probe), bricht
            // die Werkbank sie ab (welt-boot `seitenAbbruch`). Ein Ruf mit eigener Frist (der Zapfen der Sitzung, die Grundstellung) trägt den Kopf
            // nie: seine Frist ist kein Abbruch. Bis hier rechnete die Seite nach dem Deckel weiter (Radeon 5fb21e29: mensch.K1#1 am
            // Deckel 45 s, die Grundstellung vor mensch.K5#1 „/eval ohne Antwort binnen 60 s“, die Sitzung tot)
            if (req.headers["x-rufer"] === "traegt")
                res.on("close", async () => res.writableEnded || console.log(`[abbruch] ${req.url}: der Rufer ist fort, ${await abbrechen()} Abbruch`));
            // DIE STEMPEL-WACHE (scripts/lib/zerlege-linse.cjs): sobald der Pool steht, zählt sie jede verweigerte Abfrage.
            const stempel = () =>
                page
                    .evaluate(() => (window.__stempelWache ? __stempelWache() : null))
                    .then((w) => Object.assign({ warnung: stempelWarnung.n }, w || {}))
                    .catch(() => null);
            // DER KURZE LAUF vor dem Bild des Spielers (Schirm, Bedienung): 1 s einschwingen, 0,5 s echter Loop, die Tiere gehalten
            const kurzLauf = (regler) => page.evaluate(ZL.lauf, { sek: 0.5, ein: 1, regler, tiere: "halten" });
            await stempel();
            try {
                // DER SCHIRM: was der Spieler sieht — der präsentierte Canvas nach einer Sekunde echter Loop.
                if (req.url === "/schirm") {
                    await kurzLauf(b.regler || "frei");
                    await page.evaluate("__loop(1)");
                    await sleep(300);
                    const datei = zeitAblage(b.datei, "schirm", "png");
                    ordnerFuer(datei);
                    await page.screenshot({ path: datei });
                    await loopAus();
                    return send({ datei });
                }
                // DAS FENSTER (scripts/lib/schirm-proben.cjs `fensterRoute`): Viewport wechseln wie ein Spieler (Fenster ziehen, Vollbild) —
                // wechselte der Schirm seit dem letzten Takt der Welt, lebt sie an ihm, ehe der Befehl antwortet; sonst `takte: 0`, sofort
                if (req.url === "/fenster") return send(await SP.fensterRoute(page, b));
                // DIE STUFEN AM SCHIRM (`werkbank stufen`, scripts/lib/schirm-proben.cjs): der Weg jedes Bilds mit dem Stufen-Zensus davor und danach
                if (req.url === "/stufen") return send(await SP.stufenRoute(page, b));
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
                                    if (!(await page.evaluate((s, z, v) => __latenz.bereit(s, z, v), s, verb !== "wechsel", verb))) {
                                        reihe.push({ unruhe: true });
                                        if (reihe.filter((p) => p.unruhe).length < 3) continue;
                                        throw new Error(`latenz ${sicht}/${verb}: keine Ruhe (8 stille in 240 Bildern) — der Leib steht nicht`);
                                    }
                                    await tu(verb, "keyDown");
                                    if (verb === "hieb") await tu(verb, "keyUp"); // gehalten mahlte der Hieb nach
                                    reihe.push(await page.evaluate(() => __latenz.treffer()));
                                    await tu(verb, "keyUp");
                                }
                            }
                    } finally {
                        bildMs = await page.evaluate(() => __latenz.ende());
                        await cdp.detach();
                    }
                    return send(Object.assign(HL.latenzUrteil(proben, bildMs), { ort: aktOrt }));
                }
                // DIE BEDIENUNG (spielgang.K3): die HUD-Maske aus dem Bild des Spielers (Canvas + DOM, der Loop steht) — der
                // Anteil der Pixel, die sich mit verborgenem HUD ändern —, dann HUD (Klick je Hotbar-Platz) und Menü (Tab und I,
                // Esc schließt) als echte Eingabe im laufenden Loop; die INP je Gruppe misst das Bedienungs-Ohr (`_bedienungInp`).
                if (req.url === "/bedienung") {
                    const r = "anazhRealm";
                    // DIE STAFFEL 2 (spielgang.K3#2): die EINE Seiten-Probe (`__bedienung2`, welt-boot) vor und nach dem echten Reload
                    if (+b.staffel === 2) {
                        await page.evaluate("__loop(1)");
                        const vor = await page.evaluate("__bedienung2()");
                        await lade();
                        await page.waitForFunction(`!${r}._ladeschirmSteht()`, { timeout: 600000 });
                        await page.evaluate("__loop(1)");
                        const o = await page.evaluate((v) => __bedienung2(v), vor);
                        await loopAus();
                        return send(Object.assign(o, { ort: aktOrt }));
                    }
                    await kurzLauf("frei");
                    if (await page.evaluate(`${r}._ladeschirmSteht()`)) throw new Error("bedienung: der Ladeschirm steht — kein Bild des Spielers");
                    // der Klick fängt den Zeiger wie beim Spieler: im Spiel (`body.im-spiel`), die Übergänge laufen aus
                    await page.bringToFront();
                    await page.keyboard.press("Escape"); // jede offene Schublade fällt, wie beim Spieler
                    await page.click("#world-canvas"); // die Mitte der Leinwand, wie der Spieler
                    // der Fang ist ein EREIGNIS: `pointerlockchange` kommt nach dem Klick über den Browser-Prozess zurück — die
                    // Linse wartet auf ihn (bis 2 s), statt den Zustand im selben Atemzug zu lesen (GTX c351b318 „OHNE
                    // Zeiger-Fang", 13,33 %; headless am alten Lesen 2 von 8 Läufen); ohne Fang bleibt imSpiel false
                    const imSpiel = await page
                        .waitForFunction(`${r}.state.isPointerLocked && Promise.all(document.getAnimations().map((a) => a.finished))`, { timeout: 2000 })
                        .then(Boolean, () => false);
                    await page.addStyleTag({ content: "body.__ohne-hud *:not(#world-canvas) { visibility: hidden !important; }" });
                    const bild = async (an) => (await page.evaluate(`document.body.classList.toggle("__ohne-hud", ${!an})`), AU.pngLesen(await page.screenshot()));
                    const [mit, ohne] = [await bild(true), await bild(false), await bild(true)];
                    await page.evaluate("document.exitPointerLock()");
                    let deckt = 0;
                    for (let i = 0; i < mit.u8.length; i += 4) deckt += [0, 1, 2].some((k) => Math.abs(mit.u8[i + k] - ohne.u8[i + k]) > 12);
                    const bilder = () => page.evaluate("new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)))");
                    await page.evaluate("__loop(1)");
                    const inp = {};
                    for (const art of ["hud", "menue"]) {
                        await page.evaluate(`${r}._inp.je.clear(); ${r}._inp.n0 = performance.interactionCount`);
                        for (let i = 0; i < +b.runden; i++)
                            for (const ziel of art === "hud" ? await page.$$("#hotbar .hotbar-slot") : ["Tab", "Tab", "KeyI", "Escape"]) {
                                await (art === "hud" ? ziel.click() : page.keyboard.press(ziel));
                                await bilder();
                            }
                        inp[art] = await page.evaluate(`${r}._bedienungInp()`);
                    }
                    await loopAus();
                    return send({ deckungPct: +((100 * deckt) / (mit.W * mit.H)).toFixed(2), bild: [mit.W, mit.H], imSpiel, inp, ort: aktOrt });
                }
                if (req.url === "/gpu-bank")
                    return send(
                        await page.evaluate(ZL.gpuBank, { n: +b.n || 12, runden: +b.runden || 3 })
                    );
                // DIE WACHEN der Mess-Folge (scripts/omen-messfolge.cjs, nach jedem Schritt): der Stempel-Pool, das Buch des
                // Wetter-Spions seit `seit` und das des Welt-Akt-Spions seit `seitWelt`, der gestellte Ort (Aufstellung,
                // Dorf-Zug, Ort-Takt, Gier, Spieler), das Fenster (Viewport und Zeichen-Puffer), die Seiten-Fehler — das Urteil
                // spricht die Folge (`wachenUrteil`); dazu die Tiere (`tierZahl`: ein Weltzustand neben jeder Messung, kein
                // Urteil).
                if (req.url === "/wache") {
                    const w = await page.evaluate(
                        (a) => {
                            const st = r.state;
                            const pm = st.playerMesh.position;
                            const db = st.renderer.getDrawingBufferSize(new THREE.Vector2());
                            return {
                                wetter: __wetterBuch(a.seit),
                                weltakt: __weltaktBuch(a.seitWelt),
                                ort: {
                                    dorfZug: window.__anazhAutoSettlement !== false,
                                    ortTakt: window.__ortTakt || [],
                                    gier: st.yaw,
                                    spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                                    kamera: st.cameraMode,
                                },
                                fenster: { innen: [window.innerWidth, window.innerHeight], puffer: [db.x, db.y] },
                                tiere: __tierZahl(),
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
                            boot: bootZeile(),
                            echt: ECHT,
                            fehler: fehler.slice(),
                            zerstoert: zerstoert.n,
                        })
                    );
                }
                if (req.url === "/status") {
                    const s = await page.evaluate(() => {
                        const st = anazhRealm.state;
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
                if (req.url === "/gpu-fehler") {
                    // `--selbsttest`: ein zerstörter Quell-Puffer einer Kopie MUSS als zerstörte Bindung beim Namen stehen
                    if (b.selbsttest) await page.evaluate(() => { const d = st.renderer.backend.device, U = GPUBufferUsage, [q, z] = [0, 1].map(() => d.createBuffer({ size: 16, usage: U.COPY_SRC | U.COPY_DST })), e = d.createCommandEncoder({ label: "selbsttest" }); e.copyBufferToBuffer(q, 0, z, 0, 16); const c = e.finish(); q.destroy(); d.queue.submit([c]); }); // prettier-ignore
                    return send(await page.evaluate(() => window.__gpuFehler || { fehlt: "Abgriff nicht installiert" }));
                }
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
                        // ein Ort mit Pose aus dem Plan (`ortPose`) trägt keine: er beginnt am Anlauf
                        const o = await umstellen(...(stelle.spieler || stelle.anlauf), {
                            ort: ort.id,
                            ortPose: ort.ortPose,
                            anker: ort.anker || null,
                            gier: stelle.blick && BAND.ortGier(stelle),
                            dorfZug: ort.dorfZug,
                            takt: ort.ortTakt,
                            stell: ort.stell || null,
                            kamera: haushalt.sichten[sicht].kamera,
                            gruendung: ort.gruendung || null,
                            bahn: ort.bahn || null,
                            anlauf: ort.anlauf || null,
                            dach: ort.dach || null,
                        });
                        aktStand = o.spieler;
                        // DIE WIESE: ein Ort mit Wiesen-Gesetz (`wiese`) hält es in der Welt, die eben stand — dieselbe
                        // Messung wie gate:profiband H1 (scripts/lib/welt-orte.cjs), dazu das Gras der gebauten Boden-Karte. Ein
                        // Ort, der keine Wiese ist, bricht die Aufstellung laut.
                        let wiese = null;
                        if (ort.wiese && !pose) {
                            wiese = await page.evaluate(
                                (install, x, z, blick, S) => {
                                    (0, eval)(install);
                                    const m = __wieseMessen(r, x, z, blick, S);
                                    return { messung: m, befunde: __wieseUrteil(m, S, true) };
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
                        return send(Object.assign({ ort: ort.id, sicht, pose: pose ? pose.id : null, welt, spieler: stelle.spieler, wiese }, o));
                    }
                    aktOrt = null;
                    aktSicht = null;
                    aktStand = null;
                    return send(await umstellen(+b.x, +b.z));
                }
                if (req.url === "/bild") {
                    // DER SPIELER AN DER POSE: Ring, Wald und Stufen-Auge stehen am Spieler — eine Kamera mehr als einen Chunk
                    // neben ihm sah fernen Boden ohne die Bäume der Pose (laub-kante: fimp:atlas:L2 0,6737 bei misch 0). Die Pose
                    // aus dem Leib (`--gesicht`, `--arm`) und der Spieler im Bild (`--spieler`) bleiben, wo er steht.
                    const fern = (x, z, p = st.playerMesh.position) =>
                        Math.hypot(p.x - x, p.z - z) > r._voxelChunkConfig(0).span;
                    if (b.gesicht == null && b.arm == null && !b.spieler && (await page.evaluate(fern, +b.px, +b.pz)))
                        await umstellen(+b.px, +b.pz, null);
                    // DIE BEWEGUNG (`--bewegung <Taste>[:m]`, w28-linse-wahr F): das Bild AUS Bewegung — der Loop läuft mit der gehaltenen
                    // Taste, bis sie den Leib m Meter trug (5; `halteBis`, am Ereignis), dann ruht er MIT der Taste: die Welt friert mitten im
                    // Gang ein (sie steht nie: `bewegt`), der Schuss steht an der Kamera des Spiels. Bis hier ruhte der Loop zwischen den
                    // Befehlen, und die Fahrt der Augen-Karte (W gehalten) zeigte acht pixelgleiche Bilder
                    const taste = b.bewegung ? String(b.bewegung).split(":") : null;
                    if (taste) {
                        const weg = Number(taste[1]) || 5;
                        const p0 = await page.evaluate(() => (__loop(true), [pm.position.x, pm.position.z]));
                        const h = await halteBis(page, { taste: taste[0], ziel: (p, d) => Math.hypot(pm.position.x - p[0], pm.position.z - p[1]) >= d, args: [p0, weg], los: async () => (await page.evaluate(() => __loop(false)), await page.keyboard.up(taste[0])) }); // prettier-ignore
                        if (!h.erreicht) throw new Error(`ABNAHME ROT [--bewegung ${b.bewegung}: die Taste trug den Leib in ${h.ms} ms keine ${weg} m]`);
                        const kam = await page.evaluate(() => {
                            r._loopCamera(performance.now());
                            const c = r.state.camera;
                            return [...c.position.toArray(), ...c.getWorldDirection(new THREE.Vector3()).multiplyScalar(20).add(c.position).toArray()];
                        });
                        Object.assign(b, { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], wahl: 0, bewegt: true });
                    }
                    // DER INHALT DES ORTS (`imBild`, w27-ort-pose; D der Augen-Karte, w28-linse-wahr): was der Ort IST, zeigt das Bild — je
                    // Klasse der Teilung ein Mindest-Anteil seiner Pixel und das Band ihrer Farbe (`inhaltUrteil`); ein Messort ohne imBild ist
                    // ROT. Der Anteil gilt der Leinwand der Klasse (1920 × 1080: dort zählt die Teilung, nie in `--w`/`--h`). DIE FAMILIE EINES
                    // SCHLÜSSELS (`inhaltFamilie`), EIN Leser für den Ausdruck und das Urteil
                    const spec = b.ort ? BAND.ladeSpec(b.ort) : null;
                    const inhalt = spec?.ort.imBild;
                    if (b.ort && !(inhalt && Object.keys(inhalt).length)) throw new Error(`ABNAHME ROT [der Messort ${b.ort} trägt kein imBild — sein Inhalt bliebe ungefragt]`); // prettier-ignore
                    // der Inhalt liest je Klasse Pixel und Farbe — die Maße der Tafel (`nurPixel` aus) nur, wo sie geschrieben wird
                    if (inhalt) [b.klasse, b.inhalt, b.nurPixel] = [Object.keys(inhalt).map((k) => AA.inhaltFamilie(k).source).join("|"), true, !b.ist && !b.messung];
                    // DIE LEINWAND: die Klasse misst im Pixel des Schirms (1920 × 1080 wie ihre Messungen), jedes andere Bild in seinem Maß —
                    // das Fenster wie ein Spieler (`/fenster`), nie kleiner als das Bild (die Abnahme: `leinwandRot`); danach das Fenster der Sitzung
                    const vp = page.viewport();
                    const [vw, vh] = b.klasse ? [1920, 1080] : vp ? [Math.max(vp.width, +b.w || 640), Math.max(vp.height, +b.h || 360)] : [];
                    const fenster = !!vw && !(vp && vp.width === vw && vp.height === vh);
                    if (fenster) {
                        await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 });
                        await page.waitForFunction((w) => st.renderer.domElement.clientWidth === w, {}, vw);
                    }
                    if (b.zeit != null) await page.evaluate(`window.__boeVarianz = ${boeVarianz}`);
                    let o;
                    try {
                        o = await bild(Object.assign({ w: 640, h: 360, nahM: BOE.nahM, viertel: BOE.viertel }, b));
                    } finally {
                        if (fenster) await page.setViewport(vp);
                    }
                    // DAS URTEIL DES BILDS: die Abnahme der Seite (`rot`, das Bild kommt auch ROT zurück), der Inhalt des Orts und seine Ratsche
                    // (`bekannt`: ROT wie an main reißt nicht, `ortUrteil`); ein ROT-Bild liegt als `*-rot.png` neben seinem Grund
                    const m = o.abnahme;
                    const kopfAlt = m.ok ? "ABNAHME GRÜN" : `ABNAHME ROT [${m.rot.map((q) => q.grund).join(" · ")}]`;
                    const rot = m.rot.map((q) => ({ schluessel: AA.rotSchluessel(q, m), grund: q.grund }));
                    const iu = inhalt && AA.inhaltUrteil(inhalt, spec.haushalt.inhaltBand, o.klasse?.klassen, m.bild.w * m.bild.h, b.uhr);
                    if (iu) rot.push(...iu.rot), (m.inhalt = iu);
                    const U = AA.ortUrteil(rot, spec?.ort.bekannt, b.ort);
                    [m.zeile, m.urteil] = [U.kopf + m.zeile.slice(kopfAlt.length) + (iu ? ` · ${iu.zeile}` : ""), U.u];
                    if (b.ist && U.u !== "GRÜN") throw new Error(`--ist ${b.ist}: das Bild ist nicht GRÜN, die Tafel bleibt — ${m.zeile}`);
                    const datei = zeitAblage(b.datei, "bild", "png").replace(/\.png$/i, U.u === "GRÜN" ? ".png" : "-rot.png");
                    ordnerFuer(datei);
                    pngDatei(datei, o.png);
                    delete o.png;
                    // DIE ZEIT: die zwei Bilder am Kamm neben dem Bild (`-zeit-0.png`, `-zeit-1.png`), das Urteil der Böe dazu
                    if (o.zeit) {
                        o.zeit.kamm.bilder.forEach((u, i) => pngDatei(datei.replace(/\.png$/i, `-zeit-${i}.png`), u));
                        delete o.zeit.kamm.bilder, delete o.zeit.tal.bilder;
                        Object.assign(o.zeit, boeUrteil(o.zeit));
                    }
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
                    // DIE MESSUNG DER KLASSE: der Block, den `--ist <id>[:L<n>|:wirkung]` in die Soll-Tafel schreibt und die Zellen am Spawn
                    // (`b.messung`, die Station zug/a-spawn.sh im Zweig koordination) je Zelle urteilen — ihr Bild beim Namen der Zelle
                    const kl = o.klasse;
                    const messung = (bild) => ({
                        werkzeug: "bild",
                        datum: new Date().toISOString(),
                        stand: { ...o.abnahme.stand },
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
                        bild,
                    });
                    if (b.messung && kl) o.messung = messung();
                    if (b.ist) {
                        if (!kl) throw new Error("--ist braucht --klasse (die Teilung des Bilds)");
                        if (!Object.keys(kl.klassen).length)
                            throw new Error(`--ist ${b.ist}: die Klasse zeichnet kein Pixel im Bild — die Tafel bleibt, wie sie war`);
                        // DER ORT DES BILDS (abnahme-urteil `bildPfadFehler`): das Bild der Tafel liegt beim Namen des
                        // Ziels unter artifacts/soll-tafel/ (gitignored, lokal) — nie im Scratch, auf den die Tafel nicht zeigen
                        // darf; kopiert erst, wenn die Tafel die Messung genommen hat (eine abgewiesene ersetzt kein Bild)
                        // MEHRERE ZIELE (D8, `--ist tor-fern:L1,tor-bunt:L1,tor-ziel:L1`): derselbe Schuss misst je Ziel sein
                        // Maß — das erste Ziel trägt den Schuss, jedes weitere nennt ihn (W1-n1, `sollIstSchreiben`)
                        const ziele = String(b.ist).split(",").filter(Boolean);
                        const ablage = sollAblage(ziele[0], ".png");
                        o.ist = sollIstSchreiben(b.ist, messung(path.relative(root, ablage).split(path.sep).join("/")));
                        if (ablage !== datei) {
                            fs.copyFileSync(datei, ablage);
                            fs.copyFileSync(kl.maske, sollAblage(ziele[0], ".maske.png"));
                        }
                    }
                    const begleit = datei.replace(/\.png$/i, "") + ".abnahme.json";
                    jsonSchreiben(begleit, o.abnahme);
                    if (b.ist && sollAblage(String(b.ist).split(",")[0], ".png") !== datei)
                        fs.copyFileSync(begleit, sollAblage(String(b.ist).split(",")[0], ".abnahme.json"));
                    const zeile = o.abnahme.zeile;
                    delete o.abnahme;
                    if (U.u === "ROT") throw new Error(`${zeile} · ROT-Bild ${datei}`);
                    return send(Object.assign(o, { abnahme: zeile, datei, gesamtMs: Date.now() - t0 }));
                }
                if (req.url === "/eval") {
                    const o = await page.evaluate(
                        (code) =>
                            new Function("r", "T", `return (async () => { ${code} })();`)(
                                r,
                                THREE
                            ),
                        b.code
                    );
                    return send({ ergebnis: o });
                }
                if (req.url === "/methode") {
                    // `--quelle <datei>`: die Methode aus einem anderen Stand (die Basis eines A/B in EINER Welt)
                    // die Quelle ist eine Stamm-Datei oder ein Baum (scripts/lib/stamm.cjs: beide Formen, laut)
                    const quelle = stammLib.text(b.quelle ? path.resolve(b.quelle) : root);
                    // die Methode am AST (scripts/lib/stamm.cjs `glieder`, Lehre 12): ihr Funktions-Ausdruck mit async und Gang
                    const g = stammLib.glieder(quelle).find((x) => x.name === b.name && x.art === "method" && !x.statisch), f = g?.knoten.value;
                    if (!f) return send({ fehler: `Methode ${b.name} nicht gefunden` });
                    const src = `(${f.async ? "async " : ""}function${f.generator ? "*" : ""} ${b.name}${quelle.slice(f.start, f.end)})`;
                    const o = await page.evaluate(
                        (name, src, terrain) => {
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
                // DIE ALBEDO (scripts/lib/albedo-proben.cjs): nah gegen fern (`b.nahFern`) oder die Welt-Seite der Tafel
                if (req.url === "/albedo")
                    return send(await AP[b.nahFern ? "nahFernRoute" : "tafelRoute"](werkSeite, b));
                // DIE SHADER-KOSTEN-LINSE (scripts/lib/shader-kosten.cjs): ein echter Frame (Bühne), je gezeichnetem Programm
                // die statischen Kosten seines erzeugten Fragments; `--ordner` legt je Programm das WGSL ab. `--stoff` hält die
                // Programme eines Stoffs (SK.STOFFE) gegen sein Budget (`--gegen` daneben, `--datei` sichert). `rot`
                // sammelt jeden Bruch beim Namen — der Befehl endet dann mit Exit 1.
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
                        __buehne();
                        return __shaderKosten({ frames: 1, stoffe });
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
                        const vor = b.gegen ? SK.wgslKosten(ausDatei(path.resolve(b.gegen))) : null;
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
                    return send({
                        programme: zeilen.length,
                        tabelle,
                        stoff: stoffBericht,
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
                        const i = __flussLinse();
                        return i?.installiert ? i : __flussBericht();
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
                            await __drawZensus({ top: 1 });
                            __kehrausJetzt();
                            // DER ZENSUS VOR DER LISTE: erst `__pufferZensus` bucht jeden Puffer auf seinen Halter (sonst `buf:?`)
                            const puffer = __pufferZensus(),
                                texturen = __texturZensus(),
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
                                    liste: __vramBericht(top),
                                },
                                puffer,
                                halter: halter ? __heapHalter(r, 8) : null,
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
                        __buehne();
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
                        return __drawZensus({ top: 16, alle: !!k.alle });
                    }, b);
                    return send(o);
                }
                // DIE BAND-LINSE (scripts/lib/band-proben.cjs `bandRoute`): gegen Haushalt und Ratsche des Orts (spec/profiband)
                if (req.url === "/band") return send(await BP.bandRoute({ __proto__: werkSeite, stempel, pufferStand }, b));
                // DER ZIEL-ZENSUS (scripts/lib/ziel-zensus.cjs `zensusDer`, EIN Leser mit gate:ziel-zensus): n Frames der Bank-Runde,
                // jede Textur mit Erzeuger, Schreibern und Lesern je Pass, der Inhalt der Farb-Texturen zurück → das Urteil über die
                // Täter-Klassen. Den Schmuggel (je Klasse ein Täter, beim Namen rot, danach restlos fort) trägt die EINE Wand
                // gate:ziel-zensus — bis 31.10. stand hier sein Zwilling mit 5 der 6 Täter, den kein Befehl rief.
                if (req.url === "/ziele") {
                    const { z, lesen, u } = await ZZ.zensusDer(page, Number(b.n) || 12);
                    if (!z || z.fehler) return send({ fehler: z?.fehler || "keine Antwort", rot: u.rot });
                    const datei = zeitAblage(b.json, "ziele", "json");
                    jsonAb(datei, { zensus: z, lesen, urteil: u });
                    return send({ ok: u.rot.length === 0, tabelle: ZZ.zielTabelle(u, z), rot: u.rot, datei });
                }
                // DIE ZEIT (scripts/lib/zeit-proben.cjs `zeitWege`): die GPU-Zerlegung, der echte Lauf mit seiner Spur und die Hänger-Linse
                if (["/zerlegen", "/lauf", "/haenger"].includes(req.url))
                    return send(await ZP.zeitWege({ __proto__: werkSeite, stempel }, b)[req.url]());
                if (req.url === "/licht") {
                    // die Uhr der Zelle (`licht --uhr u`, die Zellen am Spawn mit `b.uhr`): die Bühne steht zu ihr, ohne Uhr Mittag
                    const o = await seite("__lichtBilanz", { uhr: b.uhr });
                    // DIE MESSUNG IN DIE SOLL-TAFEL (`licht --ist <id>`, als Block der Zellen am Spawn mit `b.messung`): E an der waagrechten
                    // Karte, alle Lichter und nur die Umgebung (der Himmel), unter der Uhr der Bühne (K5 liest das Soll ihrer Uhr)
                    const me = {
                        werkzeug: "licht",
                        datum: new Date().toISOString(),
                        stand: { sha: gitStand() },
                        geraet: { adapter: await page.evaluate(() => __abnahmeMessen({}).geraet.adapter) },
                        uhr: o.uhr,
                        E_alle: o.alle?.oben?.E,
                        E_umgebung: o.umgebung?.oben?.E,
                        // die senkrechten Karten im Himmel allein (D3): zum Körper des Richtlichts und von ihm weg (`umgebungAzimut`)
                        E_umgebung_zurSonne: o.umgebung?.zurSonne?.E,
                        E_umgebung_vonSonne: o.umgebung?.vonSonne?.E,
                        // je Licht-Art die waagrechte Karte mit der Umgebung (die Variante trägt sie, `scene.environmentNode`): der Täter
                        // der Nacht beim Namen — Mond, Ersatz-Ambient, Hemi
                        E_richt: o.DirectionalLight?.oben?.E,
                        E_ambient: o.AmbientLight?.oben?.E,
                        E_hemi: o.HemisphereLight?.oben?.E,
                        // die Farbe an der waagrechten Karte (linear): das Richtlicht mit der Umgebung und die Umgebung allein (`mondTon`)
                        L_richt: o.DirectionalLight?.oben?.L,
                        L_umgebung: o.umgebung?.oben?.L,
                        // die Sonne (nachts unter dem Horizont: dann trägt der Mond das Richtlicht)
                        sonnenRichtung: o.sonnenRichtung,
                    };
                    if (b.ist) o.ist = sollIstSchreiben(b.ist, me);
                    if (b.messung) o.messung = me;
                    return send(o);
                }
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
                    // das Scratch-Profil stirbt mit dem Browser (welt-boot `startePuppeteer`), ein benanntes (`--serie`) bleibt
                    await browser.close().catch((e) => tod("close: " + (fehlerText(e))));
                    process.exit(0);
                }
                send({ fehler: "unbekannter Weg " + req.url });
            } catch (e) {
                // der Fehler mit seinen ersten Rahmen (der Täter beim Namen, nicht nur die Meldung)
                send({
                    fehler: fehlerText(e).split("\n")[0],
                    stapel: String(e?.stack || "")
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
    else if (cmd === "bild" && SELBST) {
        selbsttestEnde(boeSelbsttest(), "die Zeit-Linse (`--zeit`) misst ΔY² im Nah-Feld, nennt die Böe der Mess-Wiese GRÜN, Wind 0 am Rausch-Boden, einen Sinus je Schicht an der Laufzeit und ein Bild ohne Nah-Feld beim Namen ROT");
        // DIE BILD-LINSEN (w28-linse-wahr): Leib vor der Linse, leeres Ziel, Inhalt des Orts, Leinwand, der Punkt, der durchfällt, die Ratsche
        selbsttestEnde(await AA.bildLinsenSelbsttest(), "die Bild-Linsen nennen den Leib vor der Linse, das leere Ziel, Gras in Magenta, die hochgerechnete Leinwand und den Fuß unter dem Bild ROT beim Namen, jede Mutante von main besteht nicht");
        selbsttestEnde(await SP.fensterSelbsttest(), "`/fenster` antwortet am gleichen Fenster ohne Takt, auch wenn die Welt nicht steht, und lässt sie nach einem Wechsel des Schirms an ihm leben; die Mutanten (main 01a6714a, der Stand vor w28-probe-schirm) bestehen nicht");
        process.exit(0);
    } else if (cmd === "bild")
        o = await rufe("/bild", {
            px: a[0],
            py: a[1],
            pz: a[2],
            lx: a[3],
            ly: a[4],
            lz: a[5],
            datei: opt("--datei"),
            uhr: opt("--uhr") && Number(opt("--uhr")),
            wetter: opt("--wetter"),
            saison: opt("--saison"),
            w: Number(opt("--w", 640)),
            h: Number(opt("--h", 360)),
            ziel: opt("--ziel"),
            wahl: opt("--wahl"),
            klasse: opt("--klasse"),
            ort: opt("--ort"),
            spieler: argv.includes("--spieler"),
            abstand: argv.includes("--abstand"),
            gesicht: opt("--gesicht"),
            arm: opt("--arm"),
            ist: opt("--ist"),
            fov: opt("--fov"),
            fuss: opt("--fuss"),
            zeit: opt("--zeit") && Number(opt("--zeit")),
            bewegung: opt("--bewegung"),
        });
    else if (cmd === "methode")
        o = await rufe("/methode", { name: a[0], terrain: hat("terrain"), quelle: opt("--quelle") });
    else if (cmd === "eval") o = await evalRuf(a[0]);
    else if (cmd === "pop") {
        // DER POP UNTER BEWEGUNG (`popGang`) an der Mess-Wiese im Ego-Auge, 1920 × 1080 — `--eigen` in eigener Welt (`gate:pop`, der
        // Messplatz des GPU-Probe-Dienstes); die Zahl misst, der Richter ist die Station lod.K2#1. Je Schritt die Pop-Pixel, `*` ein
        // Stufen-Wechsel, `+n@d` n Karten-Dinge zum ersten Mal gezeichnet, das nächste in d m
        const halt = await eigeneWelt(["--ort", "wiese"]); // frisch an der Mess-Wiese, wie die Station
        try {
            await rufe("/fenster", { w: 1920, h: 1080 });
            await umstellen({ ort: "wiese", sicht: "ego" });
            o = ergebnis(await evalRuf(`return await (${popGang})();`));
            o.block = ergebnis(await evalRuf(`return await (${SICHT.blockTreue})();`)); // die Blöcke des letzten Bilds (sicht-linse)
            o.bank = await rufe("/gpu-bank", {}); // die GPU-Zeit je Bild am Ende des Gangs (`gpuBank`)
        } finally {
            halt?.();
        }
        const je = (o.schritte || []).map((s) => s.pop + (s.wechsel ? "*" : "") + (s.ein.length ? `+${s.ein.length}@${Math.min(...s.ein)}` : ""));
        if (typeof o.fehler === "string") console.log(`lod.K2#1 ROT — der Gang brach: ${o.fehler}`.slice(0, 590));
        if (je.length) console.log(`lod.K2#1 ${o.anteilJeSekunde <= 0.05 ? "GRÜN" : "ROT"} ${o.anteilJeSekunde} % Pop-Pixel/s (${o.popPixel} px) · ${je.join("/")} · Laub ${o.laub} · dc, Dreiecke ${o.kosten.at(-1)} · GPU ${o.bank.gpuJeFrameMs} ms, CPU ${o.bank.cpuJeFrameMs} ms je Bild`);
        const B = o.block || {}, rot = (B.rot || []).concat(B.fehler ? [B.fehler] : [], B.glieder > 0 ? [] : ["LEER: kein Glied einer Arena der Wahl im Hauptbild"], /^BLIND|^$/.test(B.selbsttest || "") ? [`SELBSTTEST ${B.selbsttest || "fehlt"}`] : []);
        console.log(rot.length ? `BLOCK-TREUE ROT:\n  ${rot.join("\n  ")}` : `BLOCK-TREUE GRÜN ${B.glieder} Blöcke treu · Selbsttest nennt ${B.selbsttest}`);
        // DAS URTEIL TRÄGT DEN EXIT (w28-probe-urteil): „lod.K2#1 ROT“ stand im Log, `fehler` setzte nur die Block-Treue — GRÜN über ROT
        const pop = je.length && !(o.anteilJeSekunde <= 0.05) ? [`lod.K2#1 ROT ${o.anteilJeSekunde} % Pop-Pixel/s > 0,05`] : [];
        if (rot.length) pop.push("BLOCK-TREUE ROT"); // ein fremder Block, ein blinder Selbsttest oder kein geprüftes Glied
        if (pop.length && typeof o.fehler !== "string") o.fehler = pop.join(" · ");
    }
    else if (cmd === "bedienung") o = await rufe("/bedienung", { runden: opt("--runden", 3), staffel: opt("--staffel") });
    else if (cmd === "albedo") o = await AP.albedoGang(HAND); // scripts/lib/albedo-proben.cjs
    else if (cmd === "licht" && LP.LICHT_GAENGE.some(hat)) await LP.lichtGang(HAND); // scripts/lib/licht-proben.cjs
    else if (cmd === "licht") o = await rufe("/licht", { ist: opt("--ist"), uhr: opt("--uhr") && Number(opt("--uhr")) });
    else if (cmd === "fluss") o = await rufe("/fluss", {});
    else if (cmd === "puffer" && hat("gang")) {
        o = await rufe("/gang", { min: opt("--gang") });
        console.log(JSON.stringify(o, null, 1));
        endeMit(o.urteil && !o.urteil.length ? "GANG GRÜN" : "GANG ROT", o.urteil && !o.urteil.length);
    } else if (cmd === "puffer") o = await rufe("/puffer", { top: opt("--top") });
    else if (cmd === "diaet") {
        if (SELBST) {
            const f = DIAET.selbsttest();
            // der Selbsttest: das Diät-Urteil nennt die Wiederholung im Stand, den Refresh ohne Änderung, die Prüfung ohne
            // Meldung und eine blinde Linse beim Namen
            selbsttestEnde(f);
            process.exit(0);
        }
        o = await rufe("/diaet", {
            frames: a[0],
            modus: opt("--modus", "ruhe"),
            grad: opt("--grad"),
            tiere: opt("--tiere", "halten"),
        });
        if (o?.urteil) endeMit(o, !o.urteil.length);
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
    else if (cmd === "weg") {
        const o = await require("./lib/speicher-proben.cjs").wegFahrt({ umstellen, rufe }); // der Weg des Speichers, H8
        endeMit(o.text, o.gruen);
    } else if (cmd === "band") o = await BP.bandGang(HAND); // scripts/lib/band-proben.cjs
    else if (cmd === "ratsche") await BP.ratscheGang(HAND);
    else if (cmd === "lauf") o = await ZP.laufGang({ ...HAND, a }); // scripts/lib/zeit-proben.cjs
    else if (cmd === "haenger" || cmd === "takt") o = await ZP.haengerGang({ ...HAND, a, cmd });
    else if (cmd === "schirm") o = await rufe("/schirm", { datei: opt("--datei"), regler: opt("--regler", "frei") });
    else if (cmd === "fenster") o = await rufe("/fenster", { w: a[0], h: a[1] });
    else if (cmd === "gpu-fehler") {
        o = await rufe("/gpu-fehler", { selbsttest: SELBST });
        const Z = o.zerstoert || [], s = Z.find((z) => z.pass === "selbsttest");
        if (SELBST) endeMit(s && /destroy/.test(s.zerstoerer) ? `SELBSTTEST GRÜN — die zerstörte Bindung steht beim Namen: ${s.weg}, ${s.zerstoerer.slice(0, 120)}` : `SELBSTTEST ROT — blind (${Z.length} genannt)`, !!s); // prettier-ignore
        if (Z.length) console.log(`ZERSTÖRTE BINDUNG ROT ×${Z.length}: ${Z.slice(0, 3).map((z) => `${z.pass} · ${z.weg} · ${z.objekt || "?"} · ${z.zerstoerer}`).join(" | ")}`.slice(0, 1200)); // prettier-ignore
    }
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
        if (opt("--json")) jsonSchreiben(opt("--json"), selbst ? { ohne: o, mit } : o);
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
    else if (cmd === "kante") o = await AU.laubKanteGang({ rufe, umstellen, evalRuf, eigeneWelt, ergebnis }); // lod.K1#1, gate:laub-kante
    else if (cmd === "stufen") endeMit(...(await SP.stufenGang({ rufe, umstellen, eigeneWelt, opt, hat }))); // gate:schirm-stufen
    else if (cmd === "ziele") {
        o = await rufe("/ziele", { n: opt("--n"), json: opt("--json") });
        if (o?.tabelle) endeMit(o.tabelle + "\n" + o.datei, o.ok);
        endeMit(o);
    } else if (cmd === "zerlegen") o = await ZP.zerlegenGang(HAND); // scripts/lib/zeit-proben.cjs
    else if (cmd === "shader") {
        if (SELBST) {
            const f = SK.selbsttest();
            // der Selbsttest: die Shader-Kosten-Linse zählt Orte, Arten, Arbeit, Rauschen und den Stoff-Graph, das Urteil nennt
            // jeden Bruch
            selbsttestEnde(f);
            process.exit(0);
        }
        o = await rufe("/shader", {
            nur: opt("--nur"),
            top: opt("--top", 30),
            ordner: opt("--ordner"),
            stoff: opt("--stoff"),
            gegen: opt("--gegen"),
            datei: opt("--datei"),
        });
        // Ein Fehler ist nie grün: ohne Tabelle und Urteil endet der Befehl mit Exit 1.
        if (!o || o.fehler || !o.tabelle || !Array.isArray(o.rot)) endeMit(o);
        console.log(o.tabelle + (o.ordner ? "\n" + o.ordner : ""));
        if (o.stoff)
            console.log("\n" + o.stoff.tabelle + "\nBudget " + o.stoff.name + " " + JSON.stringify(o.stoff.budget));
        endeMit(o.rot.length ? "\nROT:\n  " + o.rot.join("\n  ") : "\nGRÜN", !o.rot.length);
    } else if (cmd === "reload") o = await rufe("/reload");
    else if (cmd === "stop") o = await rufe("/stop");
    else {
        endeMit(ausDatei(__filename).split('"use strict"')[0].trimEnd());
    }
    // `fehler` als Zeichenkette ist das Versagen des Befehls; als Liste ist es das Konsolen-Buch der Sitzung (pageerror und
    // WebGPU-Meldungen, auch INFO) — ein Buch urteilt nicht, und `[]` ist wahr: status · wache · stand · lauf endeten immer mit 1.
    // `bild --zeit`: die Böe ROT (`zeit.rot`) endet mit Exit 1
    endeMit(o, !(o && (typeof o.fehler === "string" || o.zeit?.rot.length)));
});
