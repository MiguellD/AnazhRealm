// werkbank.cjs — DIE WERKBANK der Look-Arbeit (V18.503): EINE Welt bleibt offen, Fragen gehen per
// Befehl hinein. Befund 01.10.: jede Hypothese startete die Welt neu (Boot + Einschwingen 3–5 min,
// swiftshader 15–100 s je Bild) — 15 Läufe an einem Tag für Fragen, die zusammen ~30 s echte
// Rechenzeit brauchten. Profis tauschen live (Hot-Reload) und lesen Puffer-Ansichten; das hier ist
// der Weg dorthin: die Welt bleibt stehen, eine Methode aus dem Arbeitsbaum wird in die laufende
// Seite getauscht, das Terrain-Material neu gebaut, das Bild ist in Sekunden da.
//
//   node scripts/werkbank.cjs start [--port 4490] [--holz voll|nah|kienspan]
//                                                           Welt + Steuer-Server (bleibt offen)
//   node scripts/werkbank.cjs umstellen <x> <z>            Spieler setzen, einschwingen
//   node scripts/werkbank.cjs umstellen --ort <id> [--pose p] [--sicht ego|third] an einen MESSORT (spec/profiband/haushalt.json
//                                                           `messorte`: wiese · genesis · dorf · buehne): Spieler, Blick, Dorf-Zug,
//                                                           Ort-Takt und Sicht (ohne Wahl Ego, K26) des Orts;
//                                                           ein Toggle-Ort (buehne, 1110-6) betritt seine Welt, hält Stellgrößen
//                                                           und Lade-Ring fest, `--pose` stellt an eine seiner Stationen
//   node scripts/werkbank.cjs bild <px> <py> <pz> <lx> <ly> <lz> [--datei f.png] [--w 640 --h 360] [--ziel name] [--wahl N]
//                                                           [--uhr 0..1] Bühne + echter Frame (Ausgabe-Pfad); --uhr: dieselbe
//                                                           Bühne zu dieser Stunde (0,5 Mittag), die Leuchtquellen folgen
//                                      [--klasse <regex>] [--spieler] [--abstand] [--ist <id>[:L<n>|:wirkung]]
//                                                           DIE KLASSEN IM BILD (K63, die Soll-Tafel spec/abnahme/
//                                                           soll-tafel.json): in voller Puffer-Größe unter EINER Uhr G, G2
//                                                           und je Teil-Klasse ein Schuss ohne sie → die Teilung des Bilds
//                                                           (`<datei>.maske.png`, je Klasse ein Ton), ihr Rauschen und die
//                                                           Maße je Klasse (abnahme-urteil `klassenMasse`) im Begleit-JSON;
//                                                           `--abstand` zählt je Klasse den Boden-Abstand in Bändern,
//                                                           `--ist` schreibt die Messung in die Tafel, `--spieler` lässt
//                                                           den Spieler-Leib im Bild
//   node scripts/werkbank.cjs methode <name> [--terrain] [--quelle datei]  Methode aus anazhRealm.js (Arbeitsbaum;
//                                                           `--quelle`: aus einem anderen Stand, die Basis eines A/B)
//                                                           live tauschen; --terrain baut das EINE
//                                                           Chunk-Material neu und hängt es an alle Chunks
//   node scripts/werkbank.cjs eval '<js>'                  Funktionsrumpf in der Seite (r = Welt, T = THREE)
//   node scripts/werkbank.cjs albedo [--nur <regex>] [--ordner d]  DIE ALBEDO-SICHT je Mesh-Klasse
//                                                           (scripts/lib/licht-linsen.cjs; Karte = 0,180)
//   node scripts/werkbank.cjs albedo --tafel [--datei f.json] [--ordner d]  DIE WELT-SEITE DER ALBEDO-TAFEL (S1 W1e,
//                                                           spec/farbe/albedo-tafel.json): je Zeile ihr Exemplar (fehlt es,
//                                                           setzt die Linse es — danach kein Band in derselben Welt), die
//                                                           Züge ihrer Klasse und ihres Stoffs, Basis-Albedo; Eichung 0,180.
//                                                           Urteil gegen das Labor-Ist der Tafel; Nachzug mit
//                                                           diag-albedo-tafel.cjs --nachziehen
//   node scripts/werkbank.cjs licht [--ist <id>]           DIE LICHT-BILANZ (18-%-Karte, je Licht); `--ist` schreibt
//                                                           E alle / E Umgebung in die Soll-Tafel (K63-n1)
//   node scripts/werkbank.cjs licht --laub [eiche,birke] [--ordner d] | --selbsttest  DAS LAUB IM GEGENLICHT (K19, phyto-core
//                                                           `laubDurchlass`): Luma Gegenlicht/Auflicht je Art ≥ 1,3
//   node scripts/werkbank.cjs fernwald [--blicke nord,ost] DIE FERNWALD-LINSE: der gesetzte Fernwald im Bild (glatte
//                                                           Fläche, Textur, Vielfalt, Farbe; scripts/lib/fernwald-linse.cjs)
//   node scripts/werkbank.cjs zaehlen [px py pz lx ly lz] [--alle]
//                                                           DER DRAW-ZÄHLER: GPU-Befehle + Dreiecke je Pass
//                                                           (Hauptbild · jede Kaskade) und Täter-Klasse, ein Frame
//                                                           (scripts/lib/draw-zaehler.cjs; Top 16, --alle alle)
//   node scripts/werkbank.cjs puffer [--top n]             DIE PUFFER-LINSE: nach erzwungenem GC jeder Geometrie-Puffer beim
//                                                           Halter (szene · bild · ruhend · verwaist — scripts/lib/draw-
//                                                           zaehler.cjs `__pufferZensus`) und der VRAM je Schlüssel
//   node scripts/werkbank.cjs fluss                        DIE FLUSS-LINSE: was der Foundry-Kanal den Haupt-Thread
//                                                           kostet (Bytes · Entpacken · Platte · Worker-Auslastung);
//                                                           erster Ruf installiert (scripts/lib/fluss-linse.cjs)
//   node scripts/werkbank.cjs diaet [frames] [--modus ruhe|drehen|gehen] [--tiere halten|frei] | diaet --selbsttest
//                                                           DIE DIÄT-LINSE: was Observer-Diät und Bundles je gerendertem
//                                                           Frame arbeiten (Prüfungen · Voll-Refreshs · Gänge und ihre
//                                                           Wiederholung je Render · Uploads · writeBuffer) und NETTO kosten
//                                                           — jeder verschachtelte Render (der Schatten im ersten Licht-
//                                                           Empfänger) ist abgezogen und beim Pfad genannt
//                                                           (scripts/lib/diaet-linse.cjs; Exit 1: Wiederholung oder Refresh ohne Änderung im Stand)
//   node scripts/werkbank.cjs takt [n] [--extra a,b]       DIE TAKT-LINSE: CPU je Loop-Subsystem, n Takte, Render
//                                                           ruht (scripts/lib/takt-linse.cjs)
//   node scripts/werkbank.cjs stand [n] [--ein s] [--ruhe max-s] [--regler voll|frei] [--tiere frei|halten]
//                                                           DIE STAND-LINSE (Welle K): was die Fege-Takte (Ring, Stufen-
//                                                           Wahl, Cull, Streu, Nah-Streu, Nah-Wiese, Saum-Wache) im Stand
//                                                           arbeiten — Einheiten, Zeit je Takt, Welt-Matrizen je Frame —
//                                                           im echten Loop, Folge B A A B (A = die Wache gebrochen;
//                                                           scripts/lib/stand-linse.cjs); Urteil: Ruhe 0 Einheiten
//   node scripts/werkbank.cjs sicht [--ruhe n] [--sonne n] [--drehen n] [--dreh-grad g] [--gehen n] [--tag laeuft|steht]
//                                                           [--ein s] [--regler voll]
//                                                           DIE SICHT-LINSE: was die Sicht-Kette je gerendertem Frame
//                                                           arbeitet (Pässe · Prüfungen · Ecken · Bytes · Treffer) im
//                                                           echten Loop — Ruhe, Ruhe mit laufender Sonne (die Tageslänge
//                                                           des Spiels), Drehen (1°/Frame), Gehen
//                                                           (scripts/lib/sicht-linse.cjs, Urteil wie gate:sicht-arbeit)
//   node scripts/werkbank.cjs lauf [sek] [--ein s] [--regler frei|voll] [--tiere halten|frei] [--ruhe max-s]
//                                                           DER ECHTE LAUF: der Spiel-Loop läuft (rAF), nach
//                                                           `--ein` Sekunden Einschwingen misst er `sek` Sekunden
//                                                           Frame-Zeit · GPU-Zeit (timestamp-query) · Befehle und
//                                                           Dreiecke je Frame und Pass (Anteil der Frames je
//                                                           Pass) · VRAM · Regler-Stand; „voll" hebt die
//                                                           Regler-Decke (loadScale → 1, die volle Welt)
//   node scripts/werkbank.cjs profil [sek] [--regler frei|voll] [--top n]
//                                                           DAS CPU-PROFIL des echten Laufs (Chrome-Profiler,
//                                                           200 µs): Selbst- und Gesamtzeit je Funktion — wer
//                                                           den Takt trägt, beim Namen (nach einem `lauf`)
//   node scripts/werkbank.cjs haenger [sek] [--ein s] [--regler voll|frei] [--tiere frei|halten] [--wandern kreis]
//                                     [--schwelle ms] [--probe] [--json datei] | haenger --selbsttest
//                                     | haenger --erst [ABBAABBA] [--ein s] [--art wolf]
//                                                           DIE HÄNGER-LINSE (scripts/lib/haenger-linse.cjs): der echte
//                                                           Lauf unter dem Chrome-Profiler (1 ms), je Frame über der
//                                                           Schwelle (100 ms) die Ursache beim Namen — TAKT (die Engstelle
//                                                           im Spiel-Takt) · NEBEN (Haupt-Thread außerhalb des Takts) ·
//                                                           GC · GPU (der Haupt-Thread wartet: synchrone Pipelines mit
//                                                           Stoff-Namen, Shader, Upload) — und die Tabelle je Ursache;
//                                                           `--probe` schmuggelt zwei benannte Lasten ein, die die Linse
//                                                           nennen muss. Exit 1: kein Profil, keine Eichung, eine Probe
//                                                           nicht genannt; `--selbsttest` (ohne Welt) prüft die Auswertung
//   node scripts/werkbank.cjs schirm [--datei f.png]         DER SCHIRM: Screenshot des präsentierten Canvas
//                                                           (was der Spieler sieht) nach 1 s echtem Loop
//   node scripts/werkbank.cjs fenster <w> <h>               Viewport wechseln wie ein Spieler (resize-Ereignis)
//   node scripts/werkbank.cjs gpu-bank [n] [--runden r]      DIE GPU-BANK: n Frames ohne rAF/VSync hintereinander, die
//                                                           reine GPU-Zeit je Frame (wenn GPU-gebunden)
//   node scripts/werkbank.cjs zerlegen [--runden r] [--n frames] [--nur a,b] [--json datei] [--bilder [ordner]]
//                                      [--selbsttest [--last iter]]
//                                                           DIE GPU-ZERLEGUNG (scripts/lib/zerlege-linse.cjs): schaltet
//                                                           jeden benannten Verbraucher des echten Wegs ab (Pässe, Post-
//                                                           Stufen, Klassen, leerer Frame) und misst je Schalter die gpu-
//                                                           bank-Differenz ABBA (r ≥ 4 Runden à n Frames, Median ± σ =
//                                                           1,4826 × MAD, dazu Δ CPU und Δ Pass-Stempel) → Tabelle mit Σ,
//                                                           Rest, Frame-Anatomie (jeder GPU-Befehl je Frame mit Bytes) und
//                                                           Beleg je Schalter; `--nur` nimmt Schalter-ids (Tabelle zeigt
//                                                           sie), `--bilder` legt je Schalter das AUS-Bild aus dem Ausgabe-
//                                                           Pfad ab, `--selbsttest` schmuggelt einen Vollbild-Pass fester
//                                                           Last ein und prüft, dass er als Posten erscheint (Δ ≈ seine
//                                                           Kosten allein) und wieder verschwindet; die STEMPEL-PROBE nennt,
//                                                           wie viel derselben Last der Pass-Stempel sieht. Exit 1: ein
//                                                           Schalter schaltet nicht, der Zustand ist nicht zurück, ein
//                                                           Fenster änderte die Größe, oder der Selbsttest ist ROT.
//     MESSFOLGE am ruhigen Messplatz (keine fremde Last, Port 3000 frei; Zeiten nur ruhig, ~3 min je Lauf):
//       npm start                                           (save-server :4312, eigenes Fenster)
//       node scripts/werkbank.cjs start --echt              (eigenes Fenster; wartet auf „WERKBANK bereit")
//       node scripts/werkbank.cjs umstellen --ort wiese
//       node scripts/werkbank.cjs lauf 10 --ein 30 --ruhe 300 --tiere frei   (einschwingen: der Bau ruht)
//       node scripts/werkbank.cjs zerlegen --selbsttest     (die Linse prüft sich: Posten gefunden, plausibel, weg)
//       node scripts/werkbank.cjs zerlegen --runden 6 --json artifacts/werkbank/zerlegen-omen.json
//       node scripts/werkbank.cjs zerlegen --nur haupt,tiefenkopie,traa,nachbild,bloom,godrays,kontrast,feldPass,leer --runden 8
//       node scripts/werkbank.cjs stop
//   node scripts/werkbank.cjs ziele [--n frames] [--json datei] [--selbsttest]
//                                                           DER ZIEL-ZENSUS (scripts/lib/ziel-zensus.cjs): jede GPU-Textur mit
//                                                           Erzeuger, Schreibern und Lesern je Pass über n Frames der Bank-Runde,
//                                                           der Inhalt der Farb-Texturen zurück — Urteil über die Täter-Klassen
//                                                           (ohne Leser · teilbar · volle Auflösung · Tiefe · Format); Exit 1,
//                                                           solange eine fällt. `--selbsttest` schmuggelt je Klasse einen Täter
//                                                           in den echten Frame (jeder beim Namen rot, danach restlos fort)
//   node scripts/werkbank.cjs shader [--nur <regex>] [--top n] [--ordner d]
//                                    [--stoff boden [--gegen alt.wgsl] [--datei neu.wgsl] [--rauschprobe]] | shader --selbsttest
//                                                           DIE SHADER-KOSTEN-LINSE (scripts/lib/shader-kosten.cjs): ein echter
//                                                           Frame (Bühne), je gezeichnetem Programm die statischen Kosten
//                                                           seines erzeugten Fragments je Fragment — Abtastungen unbedingt ·
//                                                           im Zweig · in Schleifen, Ladungen, Schleifen, Rausch-Aufrufe,
//                                                           Ops-Schätzung; `--ordner` legt das WGSL ab. `--stoff` hält einen
//                                                           Stoff (STOFFE: boden) gegen sein Budget, `--gegen` stellt ein
//                                                           gesichertes Programm daneben, `--datei` sichert das jetzige,
//                                                           `--rauschprobe` misst das Atlas-Rauschen der GPU gegen MaterialX/
//                                                           das Rausch-Gesetz auf der CPU; `--selbsttest` (ohne Welt) prüft
//                                                           die Zählung. Exit 1: ein Fehler, kein Programm im Frame, der
//                                                           Stoff nicht im Frame, ein Budget gebrochen, die Probe ROT
//   node scripts/werkbank.cjs band [--ort <id>] [--datei f.json] [--proben n] [--cap sek]
//                                                           DIE BAND-LINSE (W0): einschwingen (volle Welt, bis der Bau
//                                                           ruht), n Proben (Maximum je Klasse × Stufe × Pass) + VRAM
//                                                           je Erzeuger + gpu-bank gegen den Haushalt und die Ratsche
//                                                           (spec/profiband/, scripts/lib/band-urteil.cjs) → Tabelle
//                                                           Ist/Soll/Täter, BAND (Befehle · Dreiecke · VRAM · GPU-ms)
//                                                           und LINSE; Exit 1, solange eins ROT ist. `--ort` urteilt gegen
//                                                           die Ratsche des Orts × Geräts × Sicht (der Adapter-Text und der
//                                                           Kamera-Modus wählen sie, `umstellen --sicht ego|third` stellt
//                                                           sie; ohne Ort: die Mess-Wiese) und nennt seine Soll-Zeilen
//   node scripts/werkbank.cjs ratsche [--ort <id>] <band-*.json | messfolge-*.json …> [--nur vram] [--neu]
//                                                           DIE RATSCHE AUS EINER SERIE (nur Node): ≥ 4 Läufe der echten GPU
//                                                           an EINEM Ort × Gerät × Sicht und EINER Version, eingeschwungen,
//                                                           Erst- und Zweit-Boot — die Hülle zieht nach (setzt, senkt, hebt
//                                                           nie), nur bei sauberer LINSE; `--neu` = der RE-MINT (K26): die
//                                                           Ratsche wird die Hülle, auch nach oben, jede gehobene Zeile beim
//                                                           Namen
//   node scripts/werkbank.cjs gpu-fehler                     DIE GPU-FEHLER-LINSE: jede WebGPU-Validierung (Device-Meldung mit
//                                                           Pass) und jeder Draw ohne gesetzten Vertex-Slot, mit Pipeline,
//                                                           Pass und three-Objekt (scripts/lib/gpu-fehler.cjs); nur nach
//                                                           `start --gpu-fehler` (sie hüllt jeden Draw — nie mit Zeit-Läufen)
//   node scripts/werkbank.cjs reload | status | stop
//
// DIE MESS-SERIE: jeder `start` fährt ein eigenes Browser-Profil (Scratch, beim `stop` gelöscht) — der erste Boot ist
// ein ERST-Boot (leere Platte), jedes `reload` ein ZWEIT-Boot (die Foundry-Platte im Profil bleibt). `--serie <name>`
// hält das Profil unter artifacts/werkbank/profil-<name> über Neustarts hinweg (der Spieler, der das Spiel morgen
// wieder öffnet). `status` und `band` nennen die Boot-Art; `fluss` zählt Platte gegen Neubau (MB).
//
// `start --echt [--seite <url>]` fährt die ECHTE GPU (Fenster, WebGPU über den Hardware-Adapter, 1920×1080 bei DPR 1) gegen
// den laufenden save-server (`npm start`, :4312 — der Flugschreiber schreibt anazhRealmPerf.json); ohne
// `--echt` fährt sie headless auf dem eigenen Seiten-Port an der Weiche des Start-Rezepts (lokal der Hardware-Adapter, in der
// CI und mit LINSE_GPU=software swiftshader; die erste Zeile `[linse-gpu]` nennt ihn) — Zeit-Urteile (band, gpu-bank) zählen
// nur mit `--echt` unter dem GPU-Schloss. In beiden zählt der VRAM-ABGRIFF jede GPUDevice-Allokation (Puffer + Texturen,
// live nach destroy) — das ist der Speicher, nicht ein Proxy.
//
// Höhen relativ zum Boden: `bild` nimmt py/ly mit Präfix `+` als Abstand über `_voxelSurfaceY(px,pz)`
// bzw. `(lx,lz)` (z. B. `+1.6`). Die Bilder sind dieselbe Aufnahme wie die Beweis-Sonden
// (`scripts/lib/ausgabe-aufnahme.cjs`: Bühne Mittag · Sonne · Sommer, Ausgabe-Pfad).
"use strict";
const { statikServer } = require("./lib/welt-boot.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { AUSGABE_INSTALL, wetterUrteil } = require("./lib/ausgabe-aufnahme.cjs");
const { LINSEN_INSTALL } = require("./lib/licht-linsen.cjs");
const { ZAEHLER_INSTALL, FALTE_INSTALL } = require("./lib/draw-zaehler.cjs");
const { FLUSS_INSTALL } = require("./lib/fluss-linse.cjs");
const { TAKT_INSTALL } = require("./lib/takt-linse.cjs");
const SICHT = require("./lib/sicht-linse.cjs");
const DIAET = require("./lib/diaet-linse.cjs");
const STAND = require("./lib/stand-linse.cjs");
const { FERNWALD_INSTALL } = require("./lib/fernwald-linse.cjs");
const { GPU_FEHLER_INSTALL, GPU_FEHLER_OBJEKT } = require("./lib/gpu-fehler.cjs");
const BAND = require("./lib/band-urteil.cjs");
const ZL = require("./lib/zerlege-linse.cjs");
const SK = require("./lib/shader-kosten.cjs");
const AT = require("./lib/albedo-tafel.cjs");
// DIE WIESE des Messorts (K55): die EINE Messung und ihr Urteil, in die Seite getragen beim Umstellen
const { WIESE_INSTALL } = require("./lib/welt-orte.cjs");
// DER VRAM-ABGRIFF (jede GPU-Allokation beim Namen, dazu der Grund des Ziel-Zensus) — EINE Quelle für Werkbank und Gates.
const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const ZZ = require("./lib/ziel-zensus.cjs");
const HL = require("./lib/haenger-linse.cjs");

const root = path.resolve(__dirname, "..");
// DIE MESSUNG IN DIE SOLL-TAFEL (K63-n1, `bild --klasse … --ist <id>[:L<n>|:wirkung]`, `licht --ist <id>`): das Werkzeug
// schreibt, was es gemessen hat, in die EINE Tafel (spec/abnahme/soll-tafel.json, wie `--nachziehen` die Albedo-Tafel) — Ist
// und Täter rechnet die Linse daraus (abnahme-urteil `sollTafelUrteil`); von Hand steht dort keine Zahl.
const SOLL_TAFEL = path.join(root, "spec", "abnahme", "soll-tafel.json");
// DER ORT DER BILDER DER TAFEL (K63-n8, abnahme-urteil `bildPfadFehler`): je Ziel `--ist <id>[:teil]` EIN Name unter
// artifacts/soll-tafel/ (gitignored, lokal) — Bild, Maske und Begleit-JSON nebeneinander
const sollAblage = (ziel, endung) => {
    const d = path.join(root, "artifacts", "soll-tafel");
    fs.mkdirSync(d, { recursive: true });
    return path.join(d, String(ziel).replace(/:/g, "-") + endung);
};
// der Stand des Arbeitsbaums für das Begleit-JSON eines Bilds (K32) und jede Messung der Tafeln: `gitStand` (SHA, „+geaendert"
// bei Änderungen an versionierten Dateien außer den Tafeln) und der Code-Abdruck jeder Quelle — EINE Quelle, abnahme-urteil
const { stammVersion, pruefsumme, kernStand, sollQuelle, gitStand } = require("./lib/abnahme-urteil.cjs").standLeser(root);
function sollIstSchreiben(ziel, messung) {
    const [id, teil] = String(ziel).split(":");
    const text = fs.readFileSync(SOLL_TAFEL, "utf8");
    const t = JSON.parse(text);
    const k = t.klassen.find((x) => x.id === id);
    if (!k) throw new Error(`--ist ${ziel}: die Soll-Tafel trägt keine Klasse „${id}"`);
    // DER STAND (K63-n2, abnahme-urteil `messStand`): die Version des Stamms und die Prüfsumme jeder Quelle der Klasse, wie sie
    // beim Messen auf der Platte standen — ändert sich eine, ist das Ist veraltet
    messung.stand = Object.assign({}, messung.stand, { version: messung.stand.version || stammVersion() });
    messung.quellen = Object.fromEntries((k.quellen || []).map((d) => [d, pruefsumme(d)]));
    if (teil === "wirkung") (k.wirkung = k.wirkung || {}).messung = messung;
    // je Stufe ein Schuss (K63-n4, `milchweiss`: die Tore des Schusses in der Stufe L<n>)
    else if (/^L\d$/.test(teil || "")) (k.mass.messung = k.mass.messung || {})[teil] = messung;
    else if (teil) throw new Error(`--ist ${ziel}: Teil „${teil}" unbekannt (L<n> je Stufe, wirkung)`);
    else k.mass.messung = messung;
    // DER SCHREIBER PRÜFT (K63-n7, abnahme-urteil `sollIstAbweisung`): in die Tafel fällt nur, was die Linse liest — ein Schuss,
    // in dem die Klasse nicht zeichnete (der L1-Schuss 14 s nach dem Umstellen: Membran und Nebel ohne Tor), bricht laut
    const ab = require("./lib/abnahme-urteil.cjs").sollIstAbweisung(JSON.parse(text), t, id, sollQuelle());
    if (ab.length)
        throw new Error(`--ist ${ziel}: die Linse liest die Messung nicht — ${ab.join(" · ")} — die Tafel bleibt, wie sie war`);
    fs.writeFileSync(SOLL_TAFEL, JSON.stringify(t, null, 4) + "\n");
    return `${id}${teil ? ":" + teil : ""} → spec/abnahme/soll-tafel.json`;
}
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(opt("--port", process.env.WERKBANK_PORT || 4490));
const SEITEN_PORT = PORT - 1;
// Das Holz-Profil der Welt: ohne Wahl erkennt sie swiftshader und fährt „kienspan" (ohne Schatten,
// kleiner Ring) — Kosten-Fragen für das Schöpfer-Holz stellen `--holz voll`.
const HOLZ = opt("--holz", process.env.WERKBANK_HOLZ || "");
const ECHT = argv.includes("--echt");
// DIE GPU-FEHLER-LINSE nur auf Zuruf (`start --gpu-fehler`): sie hüllt jeden Draw in eine JS-Probe — eine Zeit-Messung
// (lauf, gpu-bank, band) liefe sonst mit ihrer Last.
const GPU_FEHLER = argv.includes("--gpu-fehler");
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
function rufe(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            {
                host: "127.0.0.1",
                port: PORT,
                path: weg,
                method: "POST",
                headers: { "Content-Type": "application/json" },
            },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

// Eine Klassen-Methode (4 Leerzeichen eingerückt, prettier-Form) aus dem Quelltext schneiden.
function methodeAusQuelle(quelle, name) {
    const kopf = new RegExp(`\\n    (async )?${name}\\(([^)]*)\\) \\{\\n`);
    const m = kopf.exec(quelle);
    if (!m) return null;
    const start = m.index + 1;
    const ende = quelle.indexOf("\n    }\n", start);
    if (ende < 0) return null;
    const text = quelle.slice(start, ende + 6);
    return `(${m[1] || ""}function ${name}(${m[2]}) {${text.slice(text.indexOf("{\n") + 1)})`;
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
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        // DIE WETTER-WACHE: der Zustand vor dem Lauf (Wort und Uhr des Auto-Zugs — eine Uhr unter 0 ist eingefroren, der Halt)
        // und die Marke im Buch des Wetter-Spions. Dreht im Lauf ein Schreiber das Wetter (nicht die Bühne), schreibt einer am
        // `_setWeather` vorbei, taut die Uhr oder ist ein eingefrorenes Wort danach ein anderes, ist der Lauf ROT und nennt den
        // Täter (`wetterUrteil`, scripts/lib/ausgabe-aufnahme.cjs).
        const wetterVor = { wetter: st.weather, uhr: st.weatherEffectTime, seq: window.__wetterBuch().seq };
        window.__buehne();
        // Die Tiere halten still (Vergleichbarkeit) — außer `--tiere frei`: der Halte-Griff setzt x/z je Takt zurück,
        // die Tier-KI sucht dann jeden Takt neu (Feld-Raycasts), das kostet CPU, die das Spiel so nie zahlt.
        if (k.tiere !== "frei" && window.__tiereHalten) window.__tiereHalten();
        const decke = st.perfTargetMs;
        if (k.regler === "voll") st.perfTargetMs = 1000;
        if (st.playerMesh) st.playerMesh.visible = true;
        // DIE PASS-UHR (scripts/lib/zerlege-linse.cjs, dieselbe wie `zerlegen`): r184 stempelt jeden Render-Pass mit
        // `r:<Aufruf>:<Kontext>:f<Frame>`; der Stapel der gerade rendernden Pässe beim Stempeln nennt den Pass (die EINE
        // Benennung `__passName`: haupt · k0/k1 · post · TRAA …), der Pool trägt die ms. Ein Pass, der mitten im Render neu
        // beginnt (r184 `copyFramebufferToTexture`), überschreibt seinen Anfangs-Stempel — `zerlegen` nennt ihn. Derselbe
        // Haken zählt je gerendertem Frame die Befehle und Dreiecke je Pass, exklusiv (`uhr.frameZ`, renderer.info).
        const uhr = window.__passUhr();
        const proben = [];
        let messen = false,
            tVor = null,
            tRenderVor = null,
            gpuAm = r._gpuTsAtMs;
        rend.setAnimationLoop((t) => {
            // Das Wetter hält die Wetter-Wache der Bühne (scripts/lib/ausgabe-aufnahme.cjs) je Takt.
            window.__wetterHalten();
            const c0 = performance.now();
            const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
            const z = (uhr.frameZ = {});
            try {
                if (window.__ortSchritt) window.__ortSchritt();
                r._gameLoopTick(t);
            } finally {
                uhr.frameZ = null;
            }
            // Unter der GPU-Leine rendert nicht jeder Takt — gezählt werden GERENDERTE Frames (der Takt läuft weiter).
            const gerendert = !r._gpuLeine || r._gpuLeine.gerendert > g0;
            if (!messen) {
                if (gerendert) tRenderVor = t;
                return void (tVor = t);
            }
            const p = { dt: tVor == null ? null : t - tVor, cpu: performance.now() - c0, gerendert };
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
            // Abstand der GPU-Fertig-Zeitpunkte ist der echte Durchsatz, CPU-Ende → GPU-fertig der Verzug, den der
            // Spieler als Eingabe-Lag spürt.
            const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
            if (q && gerendert) {
                const cEnde = performance.now();
                q.onSubmittedWorkDone().then(() => {
                    p.gpuFertig = performance.now();
                    p.verzug = p.gpuFertig - cEnde;
                });
            }
            tVor = t;
            proben.push(p);
        });
        try {
            await sleep(k.ein * 1000);
            // DIE RUHE: zwischen frischen Welten streute die GPU um ±5 ms (Foundry, Karten-Bäcker, Streaming noch
            // unterwegs). Mit `--ruhe <max s>` misst der Lauf erst, wenn 3 s lang alles steht: Chunks gleich, Foundry-
            // Schlange + Ingest leer, Karten-Bäcker ohne Wartende/Hängende, die Mesh-Zone fertig oder 10 s ohne Fortschritt.
            const ruheZustand = () => {
                const f = r._foundry;
                const z = typeof r._impostorCensus === "function" ? r._impostorCensus() || {} : {};
                const pm = st.playerMesh.position;
                const R2 = (st.architectureCullingRadius || 0) ** 2;
                let offen = 0;
                for (const e of st.architectures || []) {
                    const dx = e.position.x - pm.x,
                        dz = e.position.z - pm.z;
                    if (dx * dx + dz * dz <= R2 && !r._archIsRendered(e)) offen++;
                }
                return {
                    chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                    foundry:
                        (f && f.pending ? f.pending.size : 0) +
                        (f && f.warte ? f.warte.length : 0) +
                        (r._foundryIngestQueue ? r._foundryIngestQueue.length : 0),
                    karten:
                        (r._impostorBakeQueue || []).length +
                        (r._impostorBakePending ? 1 : 0) +
                        (z.wartend || 0) +
                        (z.haengendeBakes || 0),
                    meshOffen: offen,
                };
            };
            let ruhe = null;
            if (k.ruhe > 0) {
                const t0 = performance.now();
                let vor = ruheZustand(),
                    ruhigSeit = performance.now(),
                    offenSeit = performance.now(),
                    ruhig = false;
                while (performance.now() - t0 < k.ruhe * 1000) {
                    await sleep(250);
                    const z = ruheZustand();
                    if (z.meshOffen !== vor.meshOffen) offenSeit = performance.now();
                    const still =
                        z.chunks === vor.chunks &&
                        z.foundry === 0 &&
                        z.karten === 0 &&
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
            const v0 = Object.assign({}, window.__vram || {});
            const wache = () => (window.__stempelWache ? window.__stempelWache() : null);
            const s0 = wache();
            messen = true;
            uhr.messen = true;
            await sleep(k.sek * 1000);
            messen = false;
            uhr.messen = false;
            const s1 = wache();
            rend.setAnimationLoop(null);
            // Die GPU-Fertig-Meldungen laufen der CPU hinterher — warten, bis die Schlange leer ist.
            if (rend.backend && rend.backend.device) await rend.backend.device.queue.onSubmittedWorkDone();
            await sleep(50);
            const jePassFrame = (await uhr.lesen()) || {};
            const quant = (arr, q) => {
                const a = arr.filter(Number.isFinite).sort((x, y) => x - y);
                return a.length ? +a[Math.min(a.length - 1, Math.floor(q * a.length))].toFixed(2) : null;
            };
            const spalte = (f) => proben.map((p) => p[f]).filter(Number.isFinite);
            const dt = spalte("dtRender"),
                takt = spalte("dt"),
                cpu = proben.filter((p) => p.gerendert).map((p) => p.cpu),
                gpu = spalte("gpu");
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
                    jePass[ps] = {
                        anteil: n ? +(w.length / n).toFixed(2) : null,
                        p50: quant(w, 0.5),
                        max: quant(w, 1),
                    };
                }
                return {
                    frames: n,
                    mittel: n ? Math.round(summe.reduce((a, b) => a + b, 0) / n) : null,
                    p95: quant(summe, 0.95),
                    max: quant(summe, 1),
                    jePass,
                };
            };
            const s = st.perfSense || {};
            const v = window.__vram || {};
            const mb = (b) => (Number.isFinite(b) ? +(b / 1048576).toFixed(1) : null);
            const cam = st.camera;
            const dir = new window.THREE.Vector3();
            cam.getWorldDirection(dir);
            return {
                regler: k.regler,
                sekunden: k.sek,
                frames: dt.length,
                fps: dt.length ? +((1000 * dt.length) / dt.reduce((a, b) => a + b, 0)).toFixed(1) : null,
                frameMs: zahl(dt),
                cpuTaktMs: zahl(cpu),
                taktMs: zahl(takt),
                leine: r._gpuLeine
                    ? {
                          ausgesetztPct: +(
                              (100 * proben.filter((p) => !p.gerendert).length) /
                              Math.max(1, proben.length)
                          ).toFixed(1),
                          imFlug: r._gpuLeine.imFlug,
                      }
                    : null,
                gpuMs: Object.assign(zahl(gpu), { n: gpu.length, quelle: s.gpuQuelle || null }),
                gpuDurchsatzMs: (() => {
                    const g = proben.map((p) => p.gpuFertig).filter(Number.isFinite);
                    return zahl(g.slice(1).map((x, i) => x - g[i]));
                })(),
                gpuVerzugMs: zahl(spalte("verzug")),
                gpuJePassMs: Object.fromEntries(
                    Object.entries(jePassFrame).map(([p, e]) => {
                        const w = Object.values(e);
                        return [p, { p50: quant(w, 0.5), p95: quant(w, 0.95), frames: w.length }];
                    })
                ),
                // Die Pass-Stempel gelten nur, wenn im Fenster kein Pass ohne Abfrage blieb (ein voller Pool schreibt
                // seine Stempel in fremde Plätze — `__stempelWache`).
                stempel:
                    s0 && s1
                        ? {
                              imLauf: s1.ueberlauf - s0.ueberlauf,
                              seitBoot: s1.ueberlauf,
                              spitze: s1.spitze,
                              pool: s1.pool,
                              gueltig: s1.ueberlauf === s0.ueberlauf,
                          }
                        : null,
                befehle: passZahl("dc"),
                dreiecke: passZahl("tri"),
                ueber17: dt.length ? +((100 * dt.filter((x) => x > 17).length) / dt.length).toFixed(1) : null,
                ueber33: dt.length ? +((100 * dt.filter((x) => x > 33.4).length) / dt.length).toFixed(1) : null,
                vramMB: {
                    jetzt: mb(v.puffer + v.texturen),
                    puffer: mb(v.puffer),
                    texturen: mb(v.texturen),
                    spitze: mb(v.spitze),
                    nPuffer: v.nPuffer,
                    nTexturen: v.nTexturen,
                    wuchsImFenster: mb(v.puffer + v.texturen - (v0.puffer + v0.texturen)),
                    gross: window.__vramBericht ? window.__vramBericht(14) : null,
                },
                stellgroessen: {
                    loadScale: Number.isFinite(s.loadScale) ? +s.loadScale.toFixed(2) : null,
                    szeneSkala: typeof r._szeneSkalaWirk === "function" ? r._szeneSkalaWirk() : null,
                    pixelRatio: rend.getPixelRatio ? rend.getPixelRatio() : null,
                    foliageRadius: st.foliageRadius != null ? Math.round(st.foliageRadius) : null,
                    foliageDichte: st._foliageDensityScale != null ? +(+st._foliageDensityScale).toFixed(2) : null,
                    archRadius: st.architectureCullingRadius != null ? Math.round(st.architectureCullingRadius) : null,
                    ring: st._activeRingRadius,
                    schattenIntervall: st._shadowMinInterval != null ? +(+st._shadowMinInterval).toFixed(1) : null,
                    holz: st._holzProfil,
                },
                phasenEwmaMs: s.phase
                    ? Object.fromEntries(Object.entries(s.phase).map(([a, b]) => [a, +(+b).toFixed(2)]))
                    : null,
                kamera: {
                    pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)),
                    blick: [dir.x, dir.y, dir.z].map((x) => +x.toFixed(2)),
                },
                chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                ruhe,
                wetter: st.weather,
                // das Rohe der Wetter-Wache — das Urteil spricht die Werkbank (`wetterUrteil`)
                wetterHalt: {
                    vorher: wetterVor.wetter,
                    nachher: st.weather,
                    uhrVorher: Number.isFinite(wetterVor.uhr) ? +wetterVor.uhr.toFixed(1) : null,
                    uhrNachher: Number.isFinite(st.weatherEffectTime) ? +st.weatherEffectTime.toFixed(1) : null,
                    buch: window.__wetterBuch(wetterVor.seq).buch,
                },
                saison: st.season,
            };
        } finally {
            messen = false;
            rend.setAnimationLoop(null);
            uhr.ab();
            st.perfTargetMs = decke;
        }
    })();
}

// Das CPU-Profil verdichten: Selbstzeit je Funktion (Name + Datei:Zeile) und Gesamtzeit (jede Funktion
// einmal je Stapel gezählt, Rekursion doppelt nie). Prozent beziehen sich auf die gesampelte Wanduhr.
function profilAuswerten(p, top) {
    const knoten = new Map(p.nodes.map((n) => [n.id, n]));
    const selbst = new Map();
    for (let i = 0; i < p.samples.length; i++) {
        const id = p.samples[i];
        selbst.set(id, (selbst.get(id) || 0) + (p.timeDeltas[i] || 0));
    }
    const gesamtUs = p.timeDeltas.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const name = (n) => {
        const c = n.callFrame;
        const datei = (c.url || "").split("/").pop().split("?")[0];
        return `${c.functionName || "(anonym)"} ${datei}:${c.lineNumber + 1}`;
    };
    const jeSelbst = new Map();
    const jeGesamt = new Map();
    const lauf = (id, stapel) => {
        const n = knoten.get(id);
        const k = name(n);
        const s = selbst.get(id) || 0;
        jeSelbst.set(k, (jeSelbst.get(k) || 0) + s);
        const neu = stapel.has(k) ? stapel : new Set(stapel).add(k);
        const summe = (n.children || []).reduce((a, c) => a + lauf(c, neu), s);
        if (!stapel.has(k)) jeGesamt.set(k, (jeGesamt.get(k) || 0) + summe);
        return summe;
    };
    lauf(p.nodes[0].id, new Set());
    const liste = (m) =>
        [...m.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, top)
            .map(
                ([k, us]) =>
                    `${((100 * us) / gesamtUs).toFixed(1).padStart(5)} %  ${(us / 1000).toFixed(0).padStart(6)} ms  ${k}`
            );
    return { gesampeltMs: Math.round(gesamtUs / 1000), selbst: liste(jeSelbst), gesamt: liste(jeGesamt) };
}

// DIE GPU-BANK (Seiten-Kontext): n Frames direkt hintereinander rendern (ohne rAF, ohne VSync), dann auf die GPU
// warten. Liegt die GPU je Frame über der CPU, ist Gesamtzeit / n die reine GPU-Zeit je Frame — die rAF-Kadenz rastet
// am VSync ein und misst nur bei tiefer Schlange die GPU (gemessen 04.10.: 33,5 ms „Boden" war CPU 16 ms + VSync).
function gpuBank(k) {
    return (async () => {
        const r = window.anazhRealm;
        const rend = r.state.renderer;
        const q = rend.backend && rend.backend.device ? rend.backend.device.queue : null;
        if (!q) return { fehler: "kein GPU-Device" };
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

// DER TIER-ZÄHLER (Seiten-Kontext, OMEN 07.10.): die Tiere streuen zwischen Boots stark (0–3 Arten im Bild, 11–101 Befehle)
// und waren der größte unbenannte Störfaktor jeder ABAB-Folge — je Messung steht ihre Zahl daneben, ein Weltzustand, kein
// Urteil: gesamt, im Sichtkegel des Hauptbilds (davon nah ≤ `ANALOG_NAH_M`), mit Schatten-Wurf je Kaskade (ein sichtbarer
// werfender Leib, dessen Hülle das Frustum der Kaskaden-Kamera trifft), die Arten (die Gattung) gesamt und im Sichtkegel.
function tierZahl() {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const frustum = (kam) => {
        if (!kam || !kam.projectionMatrix || !kam.matrixWorldInverse) return null;
        const m = new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse);
        return new T.Frustum().setFromProjectionMatrix(m, kam.coordinateSystem);
    };
    const cam = st.camera;
    const sicht = frustum(cam);
    const csm = st.csmNode;
    const dl = st.directionalLight;
    const kaskaden =
        csm && csm.lights && csm.lights.length
            ? csm.lights.map((l) => l && l.shadow && l.shadow.camera)
            : dl && dl.shadow && dl.shadow.camera
              ? [dl.shadow.camera]
              : [];
    const kf = kaskaden.map(frustum);
    const nahM = r.constructor.ANALOG_NAH_M || 64;
    const aus = { gesamt: 0, sicht: 0, sichtNah: 0, schatten: {}, arten: {}, artenSicht: {} };
    kf.forEach((_, i) => (aus.schatten["k" + i] = 0));
    const huelle = new T.Box3(),
        teil = new T.Box3(),
        kugel = new T.Sphere();
    for (const c of st.creatures || []) {
        if (!c || !c.position) continue;
        aus.gesamt++;
        // die Art: die Gattung am Körper (Studio-Rezept, z. B. „deer"), sonst die Seele
        const art = (c.userData && (c.userData.gattung || c.userData.soul)) || "?";
        aus.arten[art] = (aus.arten[art] || 0) + 1;
        // die Hülle der sichtbaren Leiber (nah das Studio-Tier, fern bleibt der Ort mit 1 m) und ob einer davon wirft
        huelle.makeEmpty();
        let wirft = false;
        c.traverseVisible((n) => {
            if (!n.isMesh || !n.geometry) return;
            if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
            teil.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld);
            huelle.union(teil);
            if (n.castShadow) wirft = true;
        });
        if (huelle.isEmpty()) kugel.set(c.position, 1);
        else huelle.getBoundingSphere(kugel);
        if (sicht && sicht.intersectsSphere(kugel)) {
            aus.sicht++;
            aus.artenSicht[art] = (aus.artenSicht[art] || 0) + 1;
            if (cam.position.distanceTo(c.position) <= nahM) aus.sichtNah++;
        }
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
// still — `ruhig` Takte am Stück. Ein Bau, der in Ruhe ungebaut bleibt (Bake-Lücke), steht im Ergebnis, er hält das
// Einschwingen nicht auf. Deckel `capMs`: dann `eingeschwungen: false`, und die Ratsche verweigert den Nachzug — ein
// Einzelbild der wachsenden Welt pinnte sonst ihre halbe Gestalt (drei Läufe am selben Ort: Tier 7/88/110, Boden
// 29/72/37, Baum 30/87/51).
function bandEinschwingen(k) {
    return (async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
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
            const pm = st.playerMesh.position;
            const rad2 = st.architectureCullingRadius * st.architectureCullingRadius;
            let ungebaut = 0;
            for (const e of st.architectures || []) {
                const dx = e.position.x - pm.x,
                    dz = e.position.z - pm.z;
                if (dx * dx + dz * dz <= rad2 && !r._archIsRendered(e)) ungebaut++;
            }
            let instanzen = 0;
            if (st.archInstanceGroups)
                for (const g of st.archInstanceGroups.values()) instanzen += g.mesh ? g.mesh.count : 0;
            const ls = st.perfSense ? +st.perfSense.loadScale.toFixed(3) : 1;
            return { chunks: st.voxelChunks ? st.voxelChunks.size : 0, instanzen, ungebaut, loadScale: ls };
        };
        while (performance.now() < dl) {
            try {
                window.__buehne();
                if (window.__ortSchritt) window.__ortSchritt();
                r._gameLoopTick(performance.now());
            } catch (_e) {}
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
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const proben = [];
        for (let i = 0; i < (k.n || 6); i++) {
            if (i)
                for (let t = 0; t < (k.zwischen || 20); t++) {
                    try {
                        window.__buehne();
                        if (window.__ortSchritt) window.__ortSchritt();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    await sleep(50);
                }
            window.__buehne();
            try {
                if (r.state.fernRing) r._tickFeldPass(r.state.fernRing);
            } catch (_e) {}
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
    } else await new Promise((r) => seiten.listen(SEITEN_PORT, "127.0.0.1", r));
    // DAS PROFIL DER MESS-SERIE: ohne eigenes Profil legte puppeteer je Start ein namenloses an — jede Zahl war eine
    // Erst-Boot-Zahl („17 von 319 von der Platte"). Scratch je Start (beim `stop` gelöscht) oder benannt (`--serie`).
    const profil = SERIE
        ? path.join(root, "artifacts", "werkbank", "profil-" + SERIE.replace(/[^a-z0-9_-]+/gi, "_"))
        : path.join(require("os").tmpdir(), `werkbank-profil-${PORT}-${Date.now()}`);
    const serieNeu = !fs.existsSync(profil);
    fs.mkdirSync(profil, { recursive: true });
    const boot = { serie: SERIE || null, profil, serieNeu, ladungen: 0 };
    const bootArt = () => (boot.serieNeu && boot.ladungen <= 1 ? "erst" : "zweit");
    const browser = await puppeteer.launch({
        headless: !ECHT,
        userDataDir: profil,
        protocolTimeout: 3600000,
        defaultViewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : null,
        // Echt: der Hardware-Adapter im Fenster; sonst die Weiche (lokal der Hardware-Adapter headless, in der CI swiftshader)
        // — die Schalter je Plattform trägt das EINE Rezept (die alte Vulkan-Kopie lieferte unter Windows keinen Adapter: die
        // Werkbank fuhr ohne --echt still WebGL2).
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1940,1200"] : linsenWebGpuArgs(),
    });
    await adapterZeile(browser);
    const page = await browser.newPage();
    if (!ECHT) await page.setViewport({ width: 640, height: 360 });
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    // DIE GPU-FEHLER-LINSE (V-D7): jede WebGPU-Validierung mit Pass und Objekt beim Namen (scripts/lib/gpu-fehler.cjs).
    if (GPU_FEHLER) await page.evaluateOnNewDocument(GPU_FEHLER_INSTALL);
    const fehler = [];
    const zerstoert = { n: 0 };
    // Der Zeuge des vollen Stempel-Pools (r184 warnt nur EINMAL je Seite — warnOnce): die Zahl zählt
    // `__stempelWache` (scripts/lib/zerlege-linse.cjs), die Warnung belegt, dass es geschah.
    const stempelWarnung = { n: 0 };
    page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
    // Der Tod der Seite beim NAMEN (04.10.: zweimal „detached Frame" ohne Spur — Absturz, Schließen oder
    // Navigation waren nicht zu unterscheiden): jedes Ende landet mit Uhrzeit im Werkbank-Log.
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
    const lade = async () => {
        boot.ladungen++;
        const basis = ECHT ? ECHT_SEITE : `http://127.0.0.1:${SEITEN_PORT}`;
        await page.goto(`${basis}/index.html${HOLZ ? `?holz=${HOLZ}` : ""}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        await page.evaluate(AUSGABE_INSTALL);
        await page.evaluate(LINSEN_INSTALL);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(BAND.EINSCHWING_INSTALL);
        await page.evaluate(FLUSS_INSTALL);
        await page.evaluate(TAKT_INSTALL);
        await page.evaluate(DIAET.DIAET_INSTALL);
        await page.evaluate(SICHT.SICHT_INSTALL);
        await page.evaluate(`window.__tierZahl = ${tierZahl.toString()};`);
        await page.evaluate(STAND.STAND_INSTALL);
        await page.evaluate(FERNWALD_INSTALL);
        // die Orte aus der Welt (`__weltOrt`: eben · hang · hangfuss · ufer — der Wasser-Ort der Soll-Tafel, K63-n4)
        await page.evaluate(require("./lib/welt-orte.cjs").WELT_ORTE_INSTALL);
        await page.evaluate(ZL.ZERLEGE_INSTALL);
        await page.evaluate(SK.SHADER_INSTALL);
        await page.evaluate(ZZ.ZIEL_INSTALL);
        await page.evaluate(HL.HAENGER_INSTALL);
        await page.evaluate(async () => {
            const dl = performance.now() + 300000;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 200));
        });
        await page.evaluate(async () => {
            const dl = performance.now() + 60000;
            while (
                !(window.anazhRealm && window.anazhRealm.state.renderer && window.anazhRealm.state.renderer.backend) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 200));
        });
        if (GPU_FEHLER) await page.evaluate(GPU_FEHLER_OBJEKT);
    };
    await lade();
    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));

    // DER ORT (spec/profiband/haushalt.json `messorte`): mit `--ort` steht der Spieler am Ort, blickt in seine Richtung
    // (Gier aus dem Blickpunkt), der Dorf-Zug folgt dem Ort (`false` = `window.__anazhAutoSettlement = false`: was er
    // sonst baut, hinge an der Bildrate; `true` = der Haken fällt, der Zug läuft wie im Spiel) und der Ort-Takt (Stamm-
    // Methoden, die der ruhende Zug sonst ruft — am Genesis-Ring Ring und Vorschauen) läuft in JEDEM Takt der Werkbank
    // (`__ortSchritt`: umstellen, Einschwingen, Proben, Lauf). Ohne `--ort` (x z) bleiben Zug und Blick, wie sie sind,
    // der Ort-Takt ist leer.
    // Der Ort, an dem die Werkbank zuletzt umstellte (`umstellen --ort`) — die Albedo-Tafel nennt ihn.
    let aktOrt = null;
    // DIE SICHT des gestellten Orts (K26): Ego oder Third-Person — der Ort wird in ihr aufgestellt, die Band richtet die
    // Ratsche dieses Orts × Geräts × Sicht.
    let aktSicht = null;
    // DIE WELT DES ORTS (Toggle-Ort, haushalt.json `welt`, 1110-6): die Prüfbühne ist eine geborene Welt — sie betritt die
    // Seite wie im Spiel durch das Welt-Tor (importWorldBeside + aktiv + Neuladen). Steht die Seite schon in ihr (derselbe
    // slug), bleibt sie; ein Import, der nicht greift, oder eine Seite, die danach in einer anderen Welt steht, bricht laut.
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
        const res = await page.evaluate((j) => {
            const r = window.anazhRealm;
            const x = r.importWorldBeside(j);
            if (!x || !x.ok) return { fehler: JSON.stringify(x).slice(0, 200) };
            r.activeWorldSet(x.worldId);
            return { id: x.worldId };
        }, json);
        if (res.fehler)
            throw new Error(`Messort ${ort.id}: die Welt ${ort.welt} ließ sich nicht importieren (${res.fehler})`);
        await lade();
        await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
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
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                // DER ANKER des Orts (haushalt.json `anker`): die Stamm-Methode nennt, wo der Ort in DIESER Welt steht —
                // steht er mehr als 1 m neben dem Spieler-Platz der Spec, bricht die Aufstellung laut ab (am 07.10. zog der
                // Genesis-Ring 36 m um die Plattform, die Messung stand 36 m daneben und urteilte über einen leeren Rand).
                if (o && o.anker) {
                    const a = r[o.anker]();
                    if (!a || !Number.isFinite(a.x) || !Number.isFinite(a.z) || Math.hypot(a.x - x, a.z - z) > 1)
                        throw new Error(
                            `Messort ${o.ort}: der Anker ${o.anker} steht bei ${a ? a.x + " " + a.z : "?"}, der Ort bei ${x} ${z} — ` +
                                "der Ort wandert mit der Welt (spec/profiband/haushalt.json)"
                        );
                }
                window.__ortTakt = (o && o.takt) || [];
                // DIE STELLGRÖSSEN des Orts (Toggle-Ort, haushalt.json `stell`): der Regler hält sie je Takt fest — an der
                // Wiese wanderte der Laub-Radius je Sitzung 50 ↔ 55 m, die GPU-Bank derselben Seite um 0,2 ms; an der Bühne
                // stand der Lade-Ring je Sitzung bei 25 oder 81–93 Chunks (der Ring wächst nur bei Kopfraum und vollem
                // Ring, `_activeRingRadius`), die Bank derselben Pose um 0,8–1,0 ms (1110-6). `ring` setzt Ziel UND aktiven
                // Ring, wie der Null-Renderer es tut.
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
                if (o && o.dorfZug === false) window.__anazhAutoSettlement = false;
                else if (o && o.dorfZug === true) delete window.__anazhAutoSettlement;
                if (o && Number.isFinite(o.gier)) {
                    r.state.yaw = o.gier;
                    r.state.pitch = 0;
                }
                if (o && o.kamera) r.setCameraMode(o.kamera);
                r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                let stabil = 0,
                    last = -1,
                    takte = 0;
                const dl = performance.now() + 150000;
                while (performance.now() < dl) {
                    try {
                        window.__buehne();
                        window.__ortSchritt();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    // Ein Toggle-Ort ruht erst, wenn der gebaute Ring sein Ziel erreicht und kein Chunk mehr im Bau ist.
                    const ruht =
                        !stell ||
                        ((!stell.ring || r._builtRingRadius() >= stell.ring) &&
                            !(r.state.voxelMeshPending && r.state.voxelMeshPending.size > 0));
                    if (takte >= 40 && stabil >= 15 && ruht) break;
                    await sleep(50);
                }
                if (stell && stell.ring && r._builtRingRadius() < stell.ring)
                    throw new Error(
                        `Messort ${o.ort}: der Ring steht nach ${takte} Takten bei ${r._builtRingRadius()}, Ziel ${stell.ring}`
                    );
                return {
                    takte,
                    chunks: last,
                    gier: +r.state.yaw.toFixed(4),
                    dorfZug: window.__anazhAutoSettlement !== false,
                    ortTakt: window.__ortTakt,
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
            // DAS GESICHT (K63-n2, `--gesicht <m>`): die Kamera steht <m> vor dem Kopf des Spielers (sein Kopf-Gelenk, 8 cm darüber
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
            const px = gpos ? gpos[0] : Number(k.px),
                pz = gpos ? gpos[2] : Number(k.pz),
                lx = gpos ? gpos[3] : Number(k.lx),
                lz = gpos ? gpos[5] : Number(k.lz);
            const py = gpos ? gpos[1] : boden(px, pz, k.py),
                ly = gpos ? gpos[4] : boden(lx, lz, k.ly);
            rend.setAnimationLoop(null);
            // DIE KLASSE (K63, die Soll-Tafel): das Bild in voller Puffer-Größe — Dither und Kanten leben im Pixel des Schirms
            if (k.klasse) {
                const db = rend.getDrawingBufferSize(new window.THREE.Vector2());
                k.w = Math.round(db.x);
                k.h = Math.round(db.y);
            }
            // die Kamera VOR der Bühne: die Bühne setzt Tag und Nacht neu, und das Licht des Auges steht an der Kamera
            // (`_dayNightApplyAugenLicht`, seine Stärke aus dem Himmel am Auge) — danach gesetzt, stand es an der Kamera des
            // letzten Schusses (K16: das Auge in der Höhle schwarz, Helligkeit 0, das Licht lag draußen unter dem Himmel)
            const cam = r.state.camera;
            cam.position.set(px, py, pz);
            cam.lookAt(lx, ly, lz + 1e-4);
            cam.updateMatrixWorld(true);
            window.__buehne();
            // `--uhr u` (0..1, 0,5 = Mittag): die Bühne mit Sonne und Sommer, aber zu dieser Stunde — Himmel, Umgebung und die
            // Leuchtquellen (`_leuchtTakt`, eine Sekunde, bis jede gewählte Quelle eingeblendet ist) folgen ihr
            if (Number.isFinite(k.uhr)) {
                const st = r.state;
                if (st.world) st.world.timeOfDay = k.uhr;
                // der Pfad des Spielers (sein Satz „nacht"): der Uhr-Schreiber springt, der Himmel folgt im selben Anwenden
                r.setTimeOfDay(k.uhr, "human");
                for (let i = 0; i < 20 && typeof r._leuchtTakt === "function"; i++) {
                    r._leuchtTakt();
                    await new Promise((ok) => setTimeout(ok, 50));
                }
            }
            if (r.state.playerMesh) r.state.playerMesh.visible = !!k.spieler;
            // DAS ZIEL des Bilds ist der Blick-Punkt (K32): die Aufnahme prüft, ob es im Bild und frei ist, und die Blick-Wahl
            // sucht bis zu `wahl` Posen um den Ort (Standard drei Runden, 42 — gemessen 13.10. am Dreier-Hain: frei erst in Pose 26;
            // `--wahl 0` schießt nur die genannte Pose)
            const ziel = { x: lx, y: ly, z: lz, name: k.ziel || "Blickziel" };
            const wahl = k.wahl != null ? Number(k.wahl) : 42;
            let auf = null;
            let gewaehlt = null;
            // DIE EINE UHR der Klassen-Messung (K63-n1): das Bild und jeder Schuss der Teilung rendern zu derselben Zeit
            const fest = k.klasse ? performance.now() : null;
            for (let i = 0; i < 2; i++) {
                try {
                    if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
                } catch (_e) {}
                r._schattenAlleNeu();
                // die Blick-Wahl im ersten Schuss, der zweite steht an ihrer Pose; das Bild trägt die Wahl des ersten
                auf = await window.__ausgabeAufnahme(k.w, k.h, 1, { ziel, wahl: i === 0 ? wahl : 0, fest: i === 1 ? fest : null });
                if (i === 0) gewaehlt = auf.abnahme.wahl || null;
            }
            if (gewaehlt) {
                auf.abnahme.wahl = gewaehlt;
                auf.abnahme.zeile = window.__abnahmeUrteil(auf.abnahme).zeile;
            }
            // Die Welt RUHT zwischen den Befehlen (nur `umstellen` tickt): im Leerlauf fraß der Loop unter
            // swiftshader ~3 Kerne und verfälschte jede andere Messung.
            window.__letzteAufnahme = auf.u8;
            const u8 = auf.u8,
                W = k.w,
                H = k.h;
            // DIE KLASSEN IM BILD (K63-n1, scripts/lib/abnahme-urteil.cjs `klassenTeilung` · `bildRauschen` · `klassenMasse`): an
            // derselben Pose unter der EINEN Uhr des Bilds (`fest`) G — die Szene, jede gemessene Klasse ohne Schattenwurf —, G2
            // derselbe Schuss (das Rauschen der Messung) und je Teil-Klasse (`_taeterKlasse`, jeder Name unter dem Ausdruck
            // `k.klasse` für sich) O ohne sie. Die Teilung gibt jedes Pixel höchstens EINER Klasse; die Maße liest das Bild selbst
            // (mit Schatten). `k.abstand`: je 2×2-Block der Teilung der Strahl der Block-Mitte bis zum gezeichneten Boden
            // (`_bodenSichtAt`), gezählt je Klasse in Abstands-Bändern, dazu cos θ des Blicks je Band. Die Nah-Wiese ruht, solange
            // Objekte verborgen sind (ihr Takt setzt je Kachel `visible`), jedes Bündel nimmt neu auf; danach steht alles wie vorher.
            let klasse = null;
            if (k.klasse) {
                const re = new RegExp(k.klasse);
                const zeichnet = (o) =>
                    o.visible === true && !!o.geometry && (o.isMesh || o.isLine || o.isPoints || o.isSprite);
                // DER KOPF IN STOFFEN (K63-n2, `--gesicht`): ein Teil des Spielers, dessen Gewichte am Kopf hängen (head, Augen,
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
                // DER BAU-SATZ IN BEREICHEN (K63-n3, `_bauSatzArt` · `_tickBauSatz`): ein Bau-Satz zeichnet die Instanz-Gruppen
                // vieler Exemplare als EIN Mesh — die Teilung führt jeden Bereich beim Namen seiner Gruppe (`_taeterGruppe`:
                // Exemplar und Stufe, f:drachentor:L1), nie den Satz. Ein Bereich verbirgt sich, indem er den Satz verlässt
                // (`_chunkSatzAus`), und kehrt über den EINEN Weg zurück (`_bauSatzMarke` → `_tickBauSatz`); ein Nur-Wurf-Satz
                // zeichnet nie ins Bild und bleibt, wie er ist. Vorher hieß das ganze Tor ab L1 „bauSatz“.
                const bauSaetze = new Map();
                for (const [art, s] of r.state.chunkSaetze || [])
                    if (s.mesh && s.mesh.userData && s.mesh.userData.bauSatz && !s.spec.nurWurf)
                        bauSaetze.set(s.mesh, { art, s });
                r.state.scene.traverse((o) => {
                    if (!zeichnet(o)) return;
                    const bs = bauSaetze.get(o);
                    if (bs) {
                        for (const key of bs.s.bloecke.keys()) {
                            const kl = r._taeterGruppe(key);
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
                const bundlesNeu = () =>
                    r.state.scene.traverse((o) => {
                        if (o.isBundleGroup) o.needsUpdate = true;
                    });
                const wieseEigen = Object.prototype.hasOwnProperty.call(r, "_tickNahWiese");
                const wieseAlt = r._tickNahWiese;
                r._tickNahWiese = () => 0;
                const schuss = async (aus) => {
                    for (const o of aus) verbirg(o);
                    bundlesNeu();
                    try {
                        r._schattenAlleNeu();
                        return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung", fest })).u8;
                    } finally {
                        for (const o of aus) zeig(o);
                        r._tickBauSatz();
                        bundlesNeu();
                    }
                };
                try {
                    for (const o of wurf.keys()) o.castShadow = false;
                    const G = await schuss([]);
                    const G2 = await schuss([]);
                    const Os = [];
                    for (const n of namen) Os.push(await schuss(teile.get(n)));
                    const schwelle = 18;
                    const rauschen = window.__bildRauschen(G, G2, W, H, schwelle);
                    const { teil, misch } = window.__klassenTeilung(G, Os, W, H, schwelle);
                    const klassen = {};
                    namen.forEach((n, j) => {
                        const m = new Uint8Array(W * H);
                        for (let p = 0; p < W * H; p++) m[p] = teil[p] === j + 1 ? 1 : 0;
                        const ms = window.__klassenMasse(u8, m, W, H);
                        if (ms.pixel) klassen[n] = Object.assign({ objekte: teile.get(n).length }, ms);
                    });
                    // DIE PROBEN DES GESICHTS (K63-n2, `--gesicht`): je Vertex des Kopfs sein Zug — die Iris an ihrem Gelenk
                    // (irisL/R), auf der Kopf-Haut (Gewicht am Gelenk head) der Ton, den der Ofen ihm gab (koerper `kopfToene`:
                    // Lippe, Höhle; der Haar-Ton der Kappe; die Haut) —, projiziert auf den Schirm; `__gesichtMasse` liest das BILD dort,
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
                            cosN = baender.slice(1).map(() => 0);
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
                        };
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
                    const cv2 = document.createElement("canvas");
                    cv2.width = W;
                    cv2.height = H;
                    const ctx2 = cv2.getContext("2d");
                    const img2 = ctx2.createImageData(W, H);
                    img2.data.set(mu8);
                    ctx2.putImageData(img2, 0, 0);
                    klasse = {
                        ausdruck: k.klasse,
                        schwelle,
                        rauschen,
                        misch,
                        toene: namen.map((n, j) => `${n}=${ton[j % ton.length].join("/")}`),
                        klassen,
                        abstand,
                        gesicht,
                        maske: cv2.toDataURL("image/png"),
                    };
                } finally {
                    for (const [o, c] of wurf) o.castShadow = c;
                    bundlesNeu();
                    r._schattenAlleNeu();
                    if (wieseEigen) r._tickNahWiese = wieseAlt;
                    else delete r._tickNahWiese;
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
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            return {
                kamera: auf.abnahme.pose.kamera.map((v) => +v.toFixed(2)),
                abnahme: auf.abnahme,
                hell: +(l / n).toFixed(1),
                kontrast: +(k2 / (2 * n)).toFixed(2),
                dc: auf.info.drawCalls,
                dreiecke: auf.info.triangles,
                ms: Math.round(auf.ms),
                klasse,
                png: cv.toDataURL("image/png"),
            };
        }, k);

    const steuer = http.createServer((req, res) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", async () => {
            const send = (o) => {
                if (res.headersSent) return;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(o));
            };
            let b = {};
            try {
                b = d ? JSON.parse(d) : {};
            } catch (_e) {}
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
                    await page.evaluate(lauf, { sek: 0.5, ein: 1, regler: b.regler || "frei" });
                    await page.evaluate(() => {
                        const r = window.anazhRealm;
                        r.state.renderer.setAnimationLoop((t) => r._gameLoopTick(t));
                    });
                    await new Promise((res) => setTimeout(res, 300));
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `schirm-${Date.now()}.png`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    await page.screenshot({ path: datei });
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    return send({ datei, ms: Date.now() - t0 });
                }
                // DAS FENSTER: Viewport wechseln wie ein Spieler (Fenster ziehen, Vollbild) — feuert das resize-Ereignis.
                if (req.url === "/fenster") {
                    await page.setViewport({ width: +b.w || 1920, height: +b.h || 1080, deviceScaleFactor: 1 });
                    return send({ fenster: [+b.w || 1920, +b.h || 1080], ms: Date.now() - t0 });
                }
                if (req.url === "/gpu-bank")
                    return send(
                        Object.assign(await page.evaluate(gpuBank, { n: +b.n || 12, runden: +b.runden || 3 }), {
                            ms: Date.now() - t0,
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
                                weltakt:
                                    typeof window.__weltaktBuch === "function"
                                        ? window.__weltaktBuch(a.seitWelt)
                                        : null,
                                ort: {
                                    dorfZug: window.__anazhAutoSettlement !== false,
                                    ortTakt: window.__ortTakt || [],
                                    gier: st.yaw,
                                    spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                                    kamera: st.cameraMode,
                                },
                                fenster: { innen: [window.innerWidth, window.innerHeight], puffer: [db.x, db.y] },
                                tiere: typeof window.__tierZahl === "function" ? window.__tierZahl() : null,
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
                            ms: Date.now() - t0,
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
                    return send(
                        Object.assign(
                            await page.evaluate(() => window.__gpuFehler || { fehlt: "Abgriff nicht installiert" }),
                            { ms: Date.now() - t0 }
                        )
                    );
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
                        });
                        // DIE WIESE (K55): ein Ort mit Wiesen-Gesetz (`wiese`) hält es in der Welt, die eben stand — dieselbe
                        // Messung wie gate:profiband H1 (scripts/lib/welt-orte.cjs), dazu das Gras der gebauten Boden-Karte. Ein
                        // Ort, der keine Wiese ist, bricht die Aufstellung laut: bis K55 stand die Mess-Wiese nach K16 in einem
                        // Nadelwald-Hang (Hang 16,8°), und die ABAB 1410-2 verglich zwei Szenen.
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
                                    ms: Date.now() - t0,
                                }
                            )
                        );
                    }
                    aktOrt = null;
                    aktSicht = null;
                    return send(Object.assign(await umstellen(+b.x, +b.z), { ms: Date.now() - t0 }));
                }
                if (req.url === "/bild") {
                    const o = await bild(Object.assign({ w: 640, h: 360 }, b));
                    const datei = path.resolve(
                        b.datei || path.join(root, "artifacts", "werkbank", `bild-${Date.now()}.png`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    fs.writeFileSync(datei, Buffer.from(o.png.split(",")[1], "base64"));
                    delete o.png;
                    // DIE KLASSE (K63): die Maske neben dem Bild, die Maße im Begleit-JSON
                    if (o.klasse) {
                        const mdatei = datei.replace(/\.png$/i, "") + ".maske.png";
                        fs.writeFileSync(mdatei, Buffer.from(o.klasse.maske.split(",")[1], "base64"));
                        o.klasse.maske = mdatei;
                        o.abnahme.klasse = o.klasse;
                    }
                    // DAS BEGLEIT-JSON (K32): die Abnahme des Bilds mit dem Stand des Arbeitsbaums (SHA, geändert ja/nein)
                    o.abnahme.stand.sha = gitStand();
                    // DIE MESSUNG IN DIE SOLL-TAFEL (K63-n1, `--ist <id>[:L<n>|:wirkung]`)
                    if (b.ist) {
                        if (!o.klasse) throw new Error("--ist braucht --klasse (die Teilung des Bilds)");
                        const kl = o.klasse;
                        if (!Object.keys(kl.klassen).length)
                            throw new Error(`--ist ${b.ist}: die Klasse zeichnet kein Pixel im Bild — die Tafel bleibt, wie sie war`);
                        // DER ORT DES BILDS (K63-n8, abnahme-urteil `bildPfadFehler`): das Bild der Tafel liegt beim Namen des
                        // Ziels unter artifacts/soll-tafel/ (gitignored, lokal) — nie im Scratch, auf den die Tafel nicht zeigen
                        // darf; kopiert erst, wenn die Tafel die Messung genommen hat (eine abgewiesene ersetzt kein Bild)
                        const ablage = sollAblage(b.ist, ".png");
                        o.ist = sollIstSchreiben(b.ist, {
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
                        if (ablage !== datei) {
                            fs.copyFileSync(datei, ablage);
                            fs.copyFileSync(kl.maske, sollAblage(b.ist, ".maske.png"));
                        }
                    }
                    const begleit = datei.replace(/\.png$/i, "") + ".abnahme.json";
                    fs.writeFileSync(begleit, JSON.stringify(o.abnahme, null, 1));
                    if (b.ist && sollAblage(b.ist, ".png") !== datei)
                        fs.copyFileSync(begleit, sollAblage(b.ist, ".abnahme.json"));
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
                    return send({ ergebnis: o, ms: Date.now() - t0 });
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
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/albedo" && b.nahFern) {
                    // DIE ALBEDO NAH GEGEN FERN (0910-8): Boden-Satz gegen Fern-Ring an derselben Stelle, das Urteil in Node.
                    // Vorher steht die Welt: der Ring der Chunks trägt das Quadrat der Linse (≥ 2, Ziel und aktiv wie `stell.ring`
                    // der Bühne — im Software-Holz wählte der Regler je Sitzung Ring 1 oder 2), kein Chunk ist im Bau, und die
                    // Karte der Fern-Krone ist für DIESEN Ort gefüllt (kein Füll-Job offen: nach dem Umstellen hielt die Karte
                    // bereit 1 mit der Mitte am Spawn, am Messort mischte nichts — nah Y 0,13 wie main). Den Takt treibt die Route selbst wie `umstellen` (danach läuft kein
                    // Loop: einmal stand die Welt 120 s bei 9 Chunks und bereit 0). Steht sie nach 120 s nicht, misst die Linse
                    // trotzdem und urteilt laut — mit dem Zustand der Welt (`welt`) beim Namen.
                    // DAS QUADRAT DER LINSE ist das 5 × 5 der Chunks um den Chunk des SPIELERS (die Linse wählt ihre Orte um
                    // ihn): jeder steht im Boden-Satz oder ist leer. `_builtRingRadius` misst um `lastPlayerVoxelChunk` — in
                    // einem von acht frischen Läufen (Integration V18.542, Software-Holz unter Last) fehlte der Linse die
                    // Nord-Reihe des Quadrats, die Wiese hatte 1 statt 3 Orte (ROT „wiese: 1 Orte“ ohne Grund).
                    const welt = await page.evaluate(async () => {
                        const r = window.anazhRealm;
                        const st = r.state;
                        const t0 = performance.now();
                        const frist = t0 + 120000;
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
                        // DIE KARTE GEHÖRT DIESEM ORT (K53): ihr Anker ist die Chunk-Mitte des Spielers in der Größe des Rings
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
                        while (performance.now() < frist) {
                            if (!(st.chunkRingRadius >= 2)) st.chunkRingRadius = 2;
                            if (!(st._activeRingRadius >= 2)) st._activeRingRadius = 2;
                            const k = st.fernKroneNah;
                            const baut = st.voxelMeshPending && st.voxelMeshPending.size > 0;
                            q = quadrat();
                            if (q.fehlt.length === 0 && !baut && (!k || karteHier(k))) return zustand(true);
                            try {
                                if (window.__buehne) window.__buehne();
                                if (window.__ortSchritt) window.__ortSchritt();
                                r._gameLoopTick(performance.now());
                            } catch (_e) {}
                            takte++;
                            await new Promise((w) => setTimeout(w, 50));
                        }
                        q = quadrat();
                        return zustand(false);
                    });
                    // DER UPLOAD IM HAUPTBILD (Integration V18.542), VOR der Linse in der stehenden Welt: die Linse schießt in
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
                        if (st.wegeKarte) for (const s of st.wegeKarte.stufen) texe.push(s.tex, s.kronen.tex);
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
                        const bilder = async (n) => {
                            const ziel = gezeichnet + n;
                            const frist = performance.now() + 30000;
                            while (gezeichnet < ziel && performance.now() < frist) {
                                try {
                                    if (window.__buehne) window.__buehne();
                                    r._gameLoopTick(performance.now());
                                } catch (_e) {}
                                await new Promise((w) => setTimeout(w, 50));
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
                    const m = await page.evaluate(() => window.__nahFernSicht({}));
                    m.welt = welt;
                    m.upload = upload;
                    const u = require("./lib/licht-linsen.cjs").nahFernUrteil(m);
                    const aus = Object.assign({ messung: m }, u);
                    if (b.datei) fs.writeFileSync(path.resolve(b.datei), JSON.stringify(aus, null, 1));
                    return send(
                        Object.assign(aus, { datei: b.datei ? path.resolve(b.datei) : null, ms: Date.now() - t0 })
                    );
                }
                if (req.url === "/albedo" && b.tafel) {
                    // DIE WELT-SEITE DER ALBEDO-TAFEL: dieselbe Linse, je Tafel-Zeile Exemplar · Klasse · Stoff.
                    const t = AT.ladeTafel();
                    // DAS AUGE DER STUFE (`exemplar.stufeNah`, K63-n7) wählt die Stufe JEDES Exemplars neu (gemessen 15.10., Radeon:
                    // das Haus sprang mit dem Auge am Wagen von L1 auf L2) — jede solche Zeile misst in ihrem eigenen Gang NACH
                    // den übrigen, die Karte der Eichung liest der erste Gang
                    const nahZ = t.zeilen.filter((z) => ((z.welt || {}).exemplar || {}).stufeNah);
                    const liste = await page.evaluate((o) => window.__albedoSicht(o), {
                        zeilen: t.zeilen.filter((z) => !nahZ.includes(z)),
                        w: 640,
                        h: 400,
                    });
                    for (const z of nahZ) {
                        const l2 = await page.evaluate((o) => window.__albedoSicht(o), { zeilen: [z], w: 640, h: 400 });
                        for (const e of l2) if (e.name !== "graukarte") liste.push(e);
                    }
                    const ordner = path.resolve(b.ordner || path.join(root, "artifacts", "werkbank", "albedo-tafel"));
                    fs.mkdirSync(ordner, { recursive: true });
                    const welt = {};
                    let eichung = null;
                    for (const e of liste) {
                        if (e.png) {
                            fs.writeFileSync(
                                path.join(
                                    ordner,
                                    "welt-" + String(e.id || e.name).replace(/[^a-z0-9_-]+/gi, "_") + ".png"
                                ),
                                Buffer.from(e.png.split(",")[1], "base64")
                            );
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
                        // der Stand der Welt-Seite (K63-n3, abnahme-urteil `kernStand`): Version und Prüfsumme jedes Kerns
                        stand: kernStand(),
                        echt: ECHT,
                        geraet,
                        ort: aktOrt,
                        spieler,
                        eichung,
                        welt,
                    };
                    const datei = path.resolve(b.datei || path.join(ordner, `welt-${Date.now()}.json`));
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    fs.writeFileSync(datei, JSON.stringify(messung, null, 1));
                    // Das Urteil gegen das LABOR-Ist der Tafel (die Labor-Seite misst diag-albedo-tafel.cjs --labor).
                    const g = { labor: {}, welt, karten: {}, eichung: { welt: eichung, labor: {} } };
                    for (const z of t.zeilen) if (z.ist) g.labor[z.id] = z.ist.labor;
                    for (const [sid, k] of Object.entries(t.karten)) {
                        if (k.ist) g.karten[sid] = k.ist;
                        g.eichung.labor[sid] = t.karte.albedo;
                    }
                    const u = AT.tafelUrteil(t, g);
                    return send({ urteil: u.urteil, tabelle: AT.tafelTabelle(u), datei, ordner, ms: Date.now() - t0 });
                }
                if (req.url === "/albedo") {
                    const liste = await page.evaluate((o) => window.__albedoSicht(o), { nur: b.nur || null });
                    const ordner = path.resolve(b.ordner || path.join(root, "artifacts", "werkbank", "albedo"));
                    fs.mkdirSync(ordner, { recursive: true });
                    for (const e of liste) {
                        fs.writeFileSync(
                            path.join(ordner, e.name.replace(/[^a-z0-9_-]+/gi, "_") + ".png"),
                            Buffer.from(e.png.split(",")[1], "base64")
                        );
                        delete e.png;
                    }
                    return send({ klassen: liste, ordner, ms: Date.now() - t0 });
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
                                fs.mkdirSync(path.dirname(d), { recursive: true });
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
                        probe = await page.evaluate(() => window.__rauschProbe());
                        rot.push(...SK.probeUrteil(probe));
                    }
                    return send({
                        programme: zeilen.length,
                        tabelle,
                        stoff: stoffBericht,
                        probe,
                        rot,
                        ordner: b.ordner || null,
                        ms: Date.now() - t0,
                    });
                }
                if (req.url === "/diaet") {
                    const o = await page.evaluate((k) => window.__diaetLauf(k), {
                        frames: Number(b.frames) || 90,
                        modus: b.modus || "ruhe",
                        grad: Number(b.grad) || 1,
                        tiere: b.tiere || "halten",
                    });
                    return send(Object.assign(o, { urteil: DIAET.diaetUrteil(o), ms: Date.now() - t0 }));
                }
                if (req.url === "/takt") {
                    const o = await page.evaluate((k) => window.__taktZerlegung(k), {
                        n: Number(b.n) || 120,
                        extra: b.extra ? String(b.extra).split(",") : [],
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/stand") {
                    const o = await page.evaluate((k) => window.__standLauf(k), {
                        n: Number(b.n) || 120,
                        ein: b.ein != null ? Number(b.ein) : 5,
                        ruhe: b.ruhe != null ? Number(b.ruhe) : 120,
                        regler: b.regler || "voll",
                        tiere: b.tiere || "frei",
                    });
                    return send(
                        Object.assign(o, {
                            urteil: STAND.standUrteil(o),
                            fehler: fehler.slice(-5),
                            ms: Date.now() - t0,
                        })
                    );
                }
                if (req.url === "/sicht") {
                    const o = await page.evaluate((k) => window.__sichtLauf(k), {
                        ein: Number(b.ein) || 5,
                        ruhe: b.ruhe != null ? Number(b.ruhe) : 120,
                        sonne: b.sonne != null ? Number(b.sonne) : 0,
                        drehen: b.drehen != null ? Number(b.drehen) : 360,
                        drehGrad: b.drehGrad != null ? Number(b.drehGrad) : 1,
                        gehen: b.gehen != null ? Number(b.gehen) : 120,
                        tag: b.tag || "laeuft",
                        regler: b.regler || "voll",
                    });
                    return send(Object.assign(o, { urteil: SICHT.sichtUrteil(o), ms: Date.now() - t0 }));
                }
                if (req.url === "/fluss") {
                    const o = await page.evaluate(() => {
                        const i = window.__flussLinse();
                        return i && i.installiert ? i : window.__flussBericht();
                    });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                // DIE PUFFER-LINSE: nach einem erzwungenen GC jeder Geometrie-Puffer beim Halter (szene · bild · ruhend ·
                // verwaist, `__pufferZensus`) und der VRAM je Schlüssel — ohne Einschwingen, ohne Proben (der Stand jetzt).
                if (req.url === "/puffer") {
                    const cdp = await page.target().createCDPSession();
                    await cdp.send("HeapProfiler.collectGarbage");
                    await cdp.detach();
                    const o = await page.evaluate(
                        async (top) => {
                            for (let i = 0; i < 3; i++) await new Promise((res) => setTimeout(res, 30));
                            // Ein gezählter Frame zuerst: `bild` heißt „dieser Frame zeichnete ihn" (__zensusCalls).
                            window.__buehne();
                            await window.__drawZensus({ top: 1 });
                            window.__kehrausJetzt();
                            window.__texturZensus();
                            const puffer = window.__pufferZensus();
                            const v = window.__vram || {};
                            const mb = (x) => +(x / 1048576).toFixed(1);
                            return {
                                vramMB: mb((v.puffer || 0) + (v.texturen || 0)),
                                pufferMB: mb(v.puffer || 0),
                                texturenMB: mb(v.texturen || 0),
                                gcMB: mb(v.gc || 0),
                                puffer,
                                gross: window.__vramBericht ? window.__vramBericht(top) : null,
                            };
                        },
                        Number(b.top) || 30
                    );
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
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
                        } catch (_e) {}
                        return window.__drawZensus({ top: 16, alle: !!k.alle });
                    }, b);
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                // DIE BAND-LINSE: ein Zähl-Frame (alle Klassen) + der VRAM je Erzeuger + die Szenen-Puffer je Klasse +
                // die GPU-Bank (nur mit GPU-Device) + der Fluss — geurteilt gegen Haushalt und Ratsche (spec/profiband).
                if (req.url === "/band") {
                    // DIE BAND-MESSUNG: einschwingen (bis der Bau ruht), Proben (das Maximum je Klasse × Pass), dann der
                    // VRAM je Erzeuger, die Szenen-Puffer je Klasse, der Fluss und die GPU-Bank — geurteilt gegen Haushalt
                    // und Ratsche (spec/profiband).
                    // Ein Toggle-Ort (bank, 1110-6) trägt keine Ratsche: das Band bricht VOR dem Messen laut.
                    BAND.ratscheVon(BAND.ladeSpec(b.ort));
                    // DAS GERÄT und DIE SICHT (K26): sie wählen die Ratsche — der Adapter-Text gegen die Muster des Haushalts, der
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
                    // DER SPEICHER NACH DEM COLLECTOR: was niemand zerstört, aber auch niemand mehr hält, gibt Chrome mit
                    // dem GC frei (der Abgriff bucht es dann aus) — gemessen wird das Lebende, nicht die Laune des GC.
                    const cdp = await page.target().createCDPSession();
                    await cdp.send("HeapProfiler.collectGarbage");
                    await cdp.detach();
                    const roh = await page.evaluate(async () => {
                        // Die Finalisierer des Collectors laufen als eigene Aufgaben.
                        for (let i = 0; i < 3; i++) await new Promise((res) => setTimeout(res, 30));
                        // Die Regler-Decke zurück (bandEinschwingen hob sie für die volle Welt).
                        if (window.__bandDecke != null) {
                            window.anazhRealm.state.perfTargetMs = window.__bandDecke;
                            window.__bandDecke = null;
                        }
                        // Die Zensus-Linsen zuerst: sie buchen die über ihr three-Objekt benannten Texturen und Puffer im
                        // Abgriff um (Texturen über ihr Ziel, Puffer über ihren Halter).
                        window.__kehrausJetzt();
                        const texturen = window.__texturZensus();
                        const puffer = window.__pufferZensus();
                        const v = window.__vram;
                        const mb = (x) => +(x / 1048576).toFixed(1);
                        const pm = window.anazhRealm.state.playerMesh.position;
                        return {
                            texturen,
                            spieler: [pm.x, pm.z].map((x) => +x.toFixed(1)),
                            vram:
                                v && v.nTexturen + v.nPuffer > 0
                                    ? {
                                          mb: mb(v.puffer + v.texturen),
                                          puffer: mb(v.puffer),
                                          texturen: mb(v.texturen),
                                          spitze: mb(v.spitze),
                                          gc: mb(v.gc || 0),
                                          liste: window.__vramBericht(100000),
                                      }
                                    : null,
                            puffer,
                            fluss: window.__flussBericht ? window.__flussBericht() : null,
                        };
                    });
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
                        b.datei || path.join(root, "artifacts", "werkbank", `band-${Date.now()}.json`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
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
                        ms: Date.now() - t0,
                    });
                }
                // DER ZIEL-ZENSUS (scripts/lib/ziel-zensus.cjs): n Frames der Bank-Runde, jede Textur mit Erzeuger, Schreibern
                // und Lesern je Pass, der Inhalt der Farb-Texturen zurück → das Urteil über die Täter-Klassen. `selbsttest`
                // schmuggelt je Klasse einen Täter ein (jeder muss beim Namen rot fallen) und baut ihn danach restlos ab (kein
                // Name des Selbsttests bleibt im Zensus).
                if (req.url === "/ziele") {
                    const n = Number(b.n) || 12;
                    const zensus = async () => {
                        const z = await page.evaluate((k) => window.__zielZensus(k), { n });
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
                        const lesen = await page.evaluate((k) => window.__zielLesen(k), { ids });
                        return { z, lesen, u: ZZ.zielUrteil(z, lesen) };
                    };
                    let selbst = null;
                    if (b.selbsttest) {
                        const s = await page.evaluate(() => window.__zielSchmuggel(true));
                        if (!s || s.fehler)
                            return send({ fehler: "Schmuggel: " + ((s && s.fehler) || "keine Antwort") });
                        let mit;
                        try {
                            mit = await zensus();
                        } finally {
                            await page.evaluate(() => window.__zielSchmuggel(false));
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
                        b.json || path.join(root, "artifacts", "werkbank", `ziele-${Date.now()}.json`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    fs.writeFileSync(datei, JSON.stringify({ zensus: z, lesen, urteil: u, selbst, rest }, null, 1));
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
                        ms: Date.now() - t0,
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
                        last = await page.evaluate((k) => window.__zerlegeLast(k), {
                            an: true,
                            iter: Number(b.last) || 96,
                        });
                        if (!last || last.fehler) return send(Object.assign({ fehler: "Selbsttest-Last" }, last || {}));
                    }
                    try {
                        const inv = await page.evaluate((k) => window.__zerlegeInventur(k), { n, kette });
                        if (inv.fehler) return send(inv);
                        const { haushalt } = BAND.ladeSpec();
                        const sch = ZL.zerlegeSchalter(inv, haushalt, {
                            nur: b.nur ? String(b.nur).split(",") : null,
                            unbekannteImmer: !!b.selbsttest,
                        });
                        const roh = await page.evaluate((k) => window.__zerlegeMessen(k), {
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
                                    : path.join(root, "artifacts", "werkbank", `zerlegen-${Date.now()}`)
                            );
                            fs.mkdirSync(ordner, { recursive: true });
                            const schreibe = (name, png) =>
                                fs.writeFileSync(path.join(ordner, name), Buffer.from(png.split(",")[1], "base64"));
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
                            await page.evaluate((k) => window.__zerlegeLast(k), { an: false });
                            last.weg = true;
                            const inv2 = await page.evaluate((k) => window.__zerlegeInventur(k), { n: 3, kette });
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
                            b.json || path.join(root, "artifacts", "werkbank", `zerlegen-${Date.now()}.json`)
                        );
                        fs.mkdirSync(path.dirname(datei), { recursive: true });
                        fs.writeFileSync(
                            datei,
                            JSON.stringify(
                                {
                                    echt: ECHT,
                                    boot: { art: bootArt(), serie: boot.serie, ladungen: boot.ladungen },
                                    inventur: inv,
                                    schalter: sch,
                                    auswertung: a,
                                    roh,
                                    selbsttest: selbst,
                                    stempel: stempelZ,
                                },
                                null,
                                1
                            )
                        );
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
                            ms: Date.now() - t0,
                        });
                    } finally {
                        if (last && !last.weg) await page.evaluate((k) => window.__zerlegeLast(k), { an: false });
                    }
                }
                if (req.url === "/lauf") {
                    const o = await page.evaluate(lauf, {
                        sek: Number(b.sek) || 20,
                        ein: b.ein != null ? Number(b.ein) : 30,
                        ruhe: Number(b.ruhe) || 0,
                        regler: b.regler || "frei",
                        tiere: b.tiere || "halten",
                    });
                    if (o.stempel) o.stempel.warnung = stempelWarnung.n;
                    if (o.wetterHalt) o.wetterHalt = wetterUrteil(o.wetterHalt);
                    return send(Object.assign(o, { fehler: fehler.slice(-5), ms: Date.now() - t0 }));
                }
                if (req.url === "/profil") {
                    const cdp = await page.target().createCDPSession();
                    await cdp.send("Profiler.enable");
                    await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
                    await cdp.send("Profiler.start");
                    const l = await page.evaluate(lauf, {
                        sek: Number(b.sek) || 8,
                        ein: 2,
                        regler: b.regler || "voll",
                        tiere: b.tiere || "halten",
                    });
                    const { profile } = await cdp.send("Profiler.stop");
                    await cdp.detach();
                    return send(
                        Object.assign(profilAuswerten(profile, Number(b.top) || 30), {
                            fps: l.fps,
                            // die Frames des Fensters (die ms je Frame = gesampelt / Frames) und die Wetter-Wache des Laufs
                            frames: l.frames,
                            wetterHalt: wetterUrteil(l.wetterHalt),
                            ms: Date.now() - t0,
                        })
                    );
                }
                // DIE HÄNGER-LINSE (scripts/lib/haenger-linse.cjs): der echte Lauf unter dem Chrome-Profiler (1 ms), je
                // Frame über der Schwelle die Ursache beim Namen (TAKT · NEBEN · GC · GPU und die Engstelle).
                // DIE ERST-PROBE (scripts/lib/haenger-linse.cjs): ABBA in EINER Welt — der Vendor-Weg gegen die Erst-Zeichnung
                if (req.url === "/erst-probe") {
                    const aus = await page.evaluate((k) => window.__erstProbe(k), {
                        folge: b.folge || "ABBAABBA",
                        ein: b.ein != null ? Number(b.ein) : 15,
                        art: b.art || "wolf",
                    });
                    const u = HL.erstUrteil(aus);
                    return send(Object.assign({ aus, ms: Date.now() - t0 }, u));
                }
                if (req.url === "/haenger") {
                    const cdp = await page.target().createCDPSession();
                    await cdp.send("Profiler.enable");
                    await cdp.send("Profiler.setSamplingInterval", { interval: 1000 });
                    await cdp.send("Profiler.start");
                    let roh = null,
                        profile = null;
                    try {
                        roh = await page.evaluate((k) => window.__haengerLauf(k), {
                            sek: Number(b.sek) || 120,
                            ein: b.ein != null ? Number(b.ein) : 10,
                            regler: b.regler || "voll",
                            tiere: b.tiere || "frei",
                            wandern: b.wandern || "aus",
                            probe: !!b.probe,
                        });
                    } finally {
                        profile = (await cdp.send("Profiler.stop")).profile;
                        await cdp.detach();
                    }
                    const a = HL.haengerAuswerten(roh, profile, { schwelle: Number(b.schwelle) || 100 });
                    const befunde = HL.haengerLinsenBefunde(a);
                    const datei = path.resolve(
                        b.json || path.join(root, "artifacts", "werkbank", `haenger-${Date.now()}.json`)
                    );
                    fs.mkdirSync(path.dirname(datei), { recursive: true });
                    // Das ROHE (Takte + Profil) daneben: `haenger --auswerten <roh>` urteilt es neu, ohne Welt
                    fs.writeFileSync(datei.replace(/\.json$/, "") + ".roh.json", JSON.stringify({ roh, profile }));
                    fs.writeFileSync(
                        datei,
                        JSON.stringify(
                            Object.assign(
                                { echt: ECHT, boot: { art: bootArt(), ladungen: boot.ladungen }, befunde },
                                a
                            ),
                            null,
                            1
                        )
                    );
                    return send({
                        tabelle: HL.haengerTabelle(a),
                        befunde,
                        haenger: a.haengerN,
                        datei,
                        ms: Date.now() - t0,
                    });
                }
                if (req.url === "/licht") {
                    const o = await page.evaluate(() => window.__lichtBilanz());
                    // DIE MESSUNG IN DIE SOLL-TAFEL (K63-n1, `licht --ist <id>`): E an der waagrechten Karte, alle Lichter und
                    // nur die Umgebung (der Himmel)
                    if (b.ist)
                        o.ist = sollIstSchreiben(b.ist, {
                            werkzeug: "licht",
                            datum: new Date().toISOString(),
                            stand: { sha: gitStand() },
                            geraet: { adapter: await page.evaluate(() => window.__abnahmeMessen({}).geraet.adapter) },
                            E_alle: o.alle && o.alle.oben ? o.alle.oben.E : null,
                            E_umgebung: o.umgebung && o.umgebung.oben ? o.umgebung.oben.E : null,
                            sonnenRichtung: o.sonnenRichtung,
                        });
                    return send(Object.assign(o, { ms: Date.now() - t0 }));
                }
                if (req.url === "/fernwald")
                    return send(
                        Object.assign(
                            await page.evaluate((o) => window.__fernwaldLinse(o), {
                                blicke: b.blicke ? String(b.blicke).split(",") : null,
                                w: Number(b.w) || 1280,
                                h: Number(b.h) || 720,
                            }),
                            { ms: Date.now() - t0 }
                        )
                    );
                if (req.url === "/reload") {
                    await lade();
                    await page.evaluate(() => window.anazhRealm.state.renderer.setAnimationLoop(null));
                    return send({ neu: true, ms: Date.now() - t0 });
                }
                if (req.url === "/stop") {
                    send({ stop: true });
                    // Ports SOFORT frei geben (sonst fand ein Neustart :4489 noch belegt — gemessen 01.10.).
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
                    ms: Date.now() - t0,
                });
            }
        });
    });
    await new Promise((r) => steuer.listen(PORT, "127.0.0.1", r));
    console.log(`WERKBANK bereit: Steuer 127.0.0.1:${PORT} · Seite :${SEITEN_PORT}`);
}

(async () => {
    const cmd = argv[0];
    if (cmd === "start") return starte();
    const a = argv.slice(1).filter((x, i, arr) => !x.startsWith("--") && !(i > 0 && arr[i - 1].startsWith("--")));
    let o;
    if (cmd === "status") o = await rufe("/status");
    else if (cmd === "umstellen")
        o = await rufe("/umstellen", { x: a[0], z: a[1], ort: opt("--ort"), pose: opt("--pose"), sicht: opt("--sicht") });
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
            w: Number(opt("--w", 640)),
            h: Number(opt("--h", 360)),
            ziel: opt("--ziel"),
            wahl: opt("--wahl"),
            klasse: opt("--klasse"),
            spieler: argv.includes("--spieler"),
            abstand: argv.includes("--abstand"),
            gesicht: opt("--gesicht"),
            ist: opt("--ist"),
        });
    else if (cmd === "methode")
        o = await rufe("/methode", { name: a[0], terrain: argv.includes("--terrain"), quelle: opt("--quelle") });
    else if (cmd === "eval") o = await rufe("/eval", { code: a[0] });
    else if (cmd === "albedo" && argv.includes("--nah-fern")) {
        // DIE ALBEDO NAH GEGEN FERN (0910-8): je Ort im Chunk-Quadrat Boden-Satz gegen Fern-Ring aus 420 m, dazu das Gesetz an
        // der Stelle; `--selbsttest` (ohne Welt) prüft das Urteil: im Band grün (auch ein Ring, der im Band seiner Abtastung
        // rauscht), der Boden-Satz doppelt so hell rot mit dem Täter Boden-Satz, ein Ring neben dem Gesetz mit dem Täter
        // Fern-Ring, zu wenige Orte, ein leerer Schuss, ein fehlendes Gesetz und eine Karte, die nicht steht, laut.
        if (argv.includes("--selbsttest")) {
            const LL = require("./lib/licht-linsen.cjs");
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
            const pruefe = (name, u, muss) => {
                const ok = muss ? u.befunde.some((b) => muss.test(b)) : u.befunde.length === 0;
                if (!ok) f.push(`${name}: ${u.befunde.join(" · ") || "(grün)"}`);
            };
            pruefe("im Band", LL.nahFernUrteil({ orte: ruhig }), null);
            pruefe(
                "main (Boden doppelt so hell)",
                LL.nahFernUrteil({ orte: ruhig.map((o, i) => (i ? o : ort("wald", 0, 0.115, 0.056))) }),
                /^NAH-FERN wald 0\/0 .*Y 0.115 gegen Fern-Ring Y 0.056 \(\+105 %\).*Täter Boden-Satz \+105 %/
            );
            pruefe(
                "der Ring neben dem Gesetz",
                LL.nahFernUrteil({ orte: ruhig.map((o, i) => (i ? o : ort("wald", 0, 0.055, 0.075, 1.1, 0.056))) }),
                /Täter Fern-Ring \+34 %/
            );
            pruefe(
                "das Rauschen des Rings im Band",
                LL.nahFernUrteil({ orte: ruhig.map((o, i) => (i ? o : ort("wald", 0, 0.055, 0.066, 1.1, 0.056))) }),
                null
            );
            pruefe(
                "ohne Gesetz",
                LL.nahFernUrteil({
                    orte: ruhig.map((o, i) => (i ? o : Object.assign(ort("wald", 0, 0.06, 0.06), { gesetz: null }))),
                }),
                /ohne das Gesetz an der Stelle/
            );
            pruefe("zu wenige Wiesen-Orte", LL.nahFernUrteil({ orte: ruhig.slice(0, 4) }), /NAH-FERN wiese: 1 Orte/);
            pruefe(
                "leerer Schuss",
                LL.nahFernUrteil({
                    orte: ruhig.concat([Object.assign(ort("wiese", 400, 0.06, 0.06), { nah: { n: 0 } })]),
                }),
                /leerer Schuss/
            );
            pruefe("Karte steht nicht", LL.nahFernUrteil({ orte: ruhig, nahKarte: 0 }), /NAH-FERN Karte: .*bereit 0/);
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
                LL.nahFernUrteil({ orte: ruhig, upload: hoch(frisch) }),
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
                LL.nahFernUrteil({ orte: ruhig, upload: hoch([]) }),
                /die Probe ist blind/
            );
            pruefe(
                "die Upload-Probe ohne gezeichnetes Bild",
                LL.nahFernUrteil({ orte: ruhig, upload: hoch(frisch, true, 0) }),
                /NAH-FERN Upload: 0 von 3 Bildern gezeichnet/
            );
            pruefe(
                "die Upload-Probe in einer Welt, die nie ruht",
                LL.nahFernUrteil({ orte: ruhig, upload: hoch(frisch, false) }),
                /NAH-FERN Upload: der Boden-Satz ruhte in 1 Versuchen nie drei Takte/
            );
            pruefe(
                "die Welt steht",
                LL.nahFernUrteil({ orte: ruhig, welt: { gestanden: true, ms: 900, chunk: "-21,-20", fehlt: [] } }),
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
                LL.nahFernUrteil({
                    orte: ruhig.map((o, i) =>
                        i
                            ? o
                            : Object.assign(ort("wald", 0, 0.06, 0.058), {
                                  nah: {
                                      n: 4096,
                                      Y: 0.6,
                                      rgb: [0.6, 0.6, 0.6],
                                      still: false,
                                      spur: { hell: [[4096, 0.69]] },
                                  },
                              })
                    ),
                }),
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
            console.log(
                f.length
                    ? "SELBSTTEST ROT:\n  " + f.join("\n  ")
                    : "SELBSTTEST GRÜN: das Nah-Fern-Urteil nennt die zwei Farben derselben Stelle beim Namen"
            );
            process.exit(f.length ? 1 : 0);
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
        o = await rufe("/albedo", {
            nur: opt("--nur"),
            ordner: opt("--ordner"),
            tafel: argv.includes("--tafel"),
            datei: opt("--datei"),
        });
        if (o && o.tabelle) {
            console.log(o.tabelle + "\n\n" + o.datei + "\n" + o.ordner);
            process.exit(o.urteil === "GRUEN" ? 0 : 1);
        }
        // Ein Fehler der Tafel ist nie grün.
        if (argv.includes("--tafel")) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(1);
        }
    } else if (cmd === "licht" && argv.includes("--laub")) {
        // DAS LAUB IM GEGENLICHT (K19): je Art der nächste Baum, der Spieler am Augen-Ort (die Stufe folgt ihm), Gegenlicht
        // gegen Auflicht; das Urteil `laubLichtUrteil` (≥ 1,3, Labor ± 10 % wo gemessen). `--selbsttest` ohne Welt.
        const LL = require("./lib/licht-linsen.cjs");
        if (argv.includes("--selbsttest")) {
            const m = (v) => ({ verhaeltnis: v, gegen: { Y: v }, auf: { Y: 1 }, stoffe: "laub" });
            const f = [
                [LL.laubLichtUrteil({ welt: { eiche: m(1.4) } }).urteil, "GRUEN"],
                [
                    LL.laubLichtUrteil({ welt: { eiche: m(0.3) } }).befunde.join(),
                    /eiche: Gegenlicht\/Auflicht 0\.3 < 1\.3/,
                ],
                [LL.laubLichtUrteil({ welt: { eiche: m(1.4) }, labor: { eiche: { verhaeltnis: 1.0 } } }).urteil, "ROT"],
                [
                    LL.laubLichtUrteil({ welt: { eiche: m(1.4) }, labor: { eiche: { verhaeltnis: 1.35 } } }).urteil,
                    "GRUEN",
                ],
                // das Labor misst unter EINEM Licht: gegen die Welt-Seite `sonne`, nie gegen die volle Licht-Kette
                [
                    LL.laubLichtUrteil({
                        welt: { eiche: Object.assign(m(1.4), { sonne: { verhaeltnis: 1.0 } }) },
                        labor: { eiche: { verhaeltnis: 1.4 } },
                    }).befunde.join(),
                    /Welt 1 gegen Labor 1\.4 \(nur Sonne\)/,
                ],
                [LL.laubLichtUrteil({ welt: { birke: { fehler: "keine Laub-Senke" } } }).urteil, "ROT"],
                [LL.laubLichtUrteil({}).urteil, "ROT"],
            ];
            const fehl = f.filter(([ist, soll]) => (soll instanceof RegExp ? !soll.test(ist) : ist !== soll));
            console.log(`LAUB-LICHT Selbsttest: ${f.length - fehl.length}/${f.length}`);
            process.exit(fehl.length ? 1 : 0);
        }
        const welt = {};
        // Das Exemplar je Art: das nächste zum Messort Wiese (spec/profiband/haushalt.json) — derselbe Baum in jedem Lauf.
        const wiese = require("../spec/profiband/haushalt.json").messorte.find((m) => m.id === "wiese");
        for (const art of String(opt("--laub", "eiche,birke")).split(",")) {
            const c = `return await window.__laubGegenlicht(Object.assign({ art: ${JSON.stringify(art)} }, __o));`;
            // am Anker stehen: welche Bäume eine nahe Stufe (eine Laub-Senke) tragen, folgt dem Spieler
            await rufe("/umstellen", { x: wiese.spieler[0], z: wiese.spieler[1] });
            const plan = (
                await rufe("/eval", {
                    code: `const __o = { plan: true, anker: ${JSON.stringify(wiese.spieler)} }; ${c}`,
                })
            ).ergebnis;
            if (!plan || plan.fehler) {
                welt[art] = plan || { fehler: "kein Plan" };
                continue;
            }
            await rufe("/umstellen", { x: plan.auge[0], z: plan.auge[1] });
            const w = (await rufe("/eval", { code: `const __o = { ziel: ${JSON.stringify(plan.ziel)} }; ${c}` }))
                .ergebnis;
            const ordner = opt("--ordner");
            if (w && w.gegen)
                for (const k of ["gegen", "auf"]) {
                    if (ordner)
                        fs.writeFileSync(
                            path.join(ordner, `laub-${art}-${k}.png`),
                            Buffer.from(w[k].png.split(",")[1], "base64")
                        );
                    delete w[k].png;
                }
            welt[art] = w;
        }
        const u = LL.laubLichtUrteil({ welt });
        // `--datei`: die Welt-Seite für das Labor-Urteil (diag-albedo-tafel.cjs --laub --welt <datei>)
        if (opt("--datei")) fs.writeFileSync(path.resolve(opt("--datei")), JSON.stringify({ welt }, null, 1));
        console.log(JSON.stringify({ welt, zeilen: u.zeilen }, null, 1));
        console.log(`LAUB-LICHT ${u.urteil}${u.befunde.length ? ": " + u.befunde.join(" | ") : ""}`);
        process.exit(u.urteil === "GRUEN" ? 0 : 1);
    } else if (cmd === "licht") o = await rufe("/licht", { ist: opt("--ist") });
    else if (cmd === "fernwald") o = await rufe("/fernwald", { blicke: opt("--blicke"), w: opt("--w"), h: opt("--h") });
    else if (cmd === "fluss") o = await rufe("/fluss", {});
    else if (cmd === "puffer") o = await rufe("/puffer", { top: opt("--top") });
    else if (cmd === "takt") o = await rufe("/takt", { n: a[0], extra: opt("--extra", "") });
    else if (cmd === "diaet") {
        if (argv.includes("--selbsttest")) {
            const f = DIAET.selbsttest();
            console.log(
                f.length
                    ? "SELBSTTEST ROT:\n  " + f.join("\n  ")
                    : "SELBSTTEST GRÜN: das Diät-Urteil nennt die Wiederholung im Stand, den Refresh ohne Änderung und eine blinde Linse beim Namen"
            );
            process.exit(f.length ? 1 : 0);
        }
        o = await rufe("/diaet", {
            frames: a[0],
            modus: opt("--modus", "ruhe"),
            grad: opt("--grad"),
            tiere: opt("--tiere", "halten"),
        });
        if (o && o.urteil) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(o.urteil.length ? 1 : 0);
        }
    } else if (cmd === "stand")
        o = await rufe("/stand", {
            n: a[0],
            ein: opt("--ein"),
            ruhe: opt("--ruhe"),
            regler: opt("--regler", "voll"),
            tiere: opt("--tiere", "frei"),
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
                { alle: argv.includes("--alle") },
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
        if (o && o.tabelle) {
            console.log(o.tabelle + "\n\n" + (o.datei || ""));
            process.exit(o.urteil === "GRUEN" && (!o.stempel || o.stempel.urteil === "GRUEN") ? 0 : 1);
        }
    } else if (cmd === "ratsche") {
        // DIE RATSCHE AUS EINER SERIE (nur Node, keine Welt nötig): jede Datei ist eine Band-Messung der echten GPU am Messort
        // (`band --datei` oder das JSON eines Boots der Messfolge, ihr Schritt „band"), eingeschwungen; die Serie trägt
        // mindestens vier Läufe aus Erst- UND Zweit-Boot, alle an EINEM Ort × Gerät × Sicht und an EINER Version (K26). Die
        // Hülle (Maximum je Klasse × Pass, VRAM je Erzeuger) wird gegen den Haushalt von heute geurteilt — nur bei sauberer
        // LINSE zieht sie nach (setzt ungemessene Felder, senkt gemessene, hebt nie). `--neu` ist der RE-MINT: die Ratsche
        // wird die Hülle der Serie, auch nach oben (die alte Ratsche richtet ihn nicht, nur Haushalt, Namen und Lecks).
        // die Serie: jede .json der Befehlszeile (`--neu` ist ein Schalter ohne Wert — die Lese-Regel der Optionen nähme ihm
        // sonst die erste Datei)
        const dateien = argv
            .slice(1)
            .filter((x) => /\.json$/i.test(x))
            .map((f) => path.resolve(f));
        const laeufe = dateien.map((f) => {
            const j = JSON.parse(fs.readFileSync(f, "utf8"));
            const e = Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
            return e ? (e.ergebnis && e.ergebnis.messung) || null : j;
        });
        const neu = argv.includes("--neu");
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
        if (fehler.length) {
            console.log("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
            process.exit(1);
        }
        const ratscheSpec = BAND.ladeSpec(ortId, { geraet, sicht });
        const { haushalt, ort } = ratscheSpec;
        const alt = BAND.ratscheVon(ratscheSpec);
        if (!alt) {
            console.log(`Ratsche NICHT nachgezogen: ${ratscheSpec.ratscheDatei} fehlt — jeder Ort × Gerät × Sicht trägt seine Datei`);
            process.exit(1);
        }
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
        if (fehler.length) {
            console.log("Ratsche NICHT nachgezogen:\n  " + fehler.join("\n  "));
            process.exit(1);
        }
        const h = BAND.bandHuelle(laeufe.map((u) => u.roh));
        const u = BAND.bandUrteil(Object.assign({ haushalt, ratsche: alt, ort, ratscheDatei: ratscheSpec.ratscheDatei }, h));
        Object.assign(u, { messung: null, boot: null });
        console.log(BAND.bandTabelle(u));
        // `--nur vram` zieht nur den Speicher nach: dann zählen nur die Speicher-Befunde der LINSE; der Re-Mint lässt die
        // Ratschen-Zeilen der alten Ratsche aus (er ersetzt sie), Haushalt, Namen und Lecks nie.
        const linse = (u.rot || []).filter((r) => ["unbenannt", "haushalt", "ratsche", "leck"].includes(r.art));
        const sperrt = nurVram ? BAND.vramBefunde(u) : neu ? linse.filter((r) => r.art !== "ratsche") : linse;
        if (sperrt.length) {
            console.log("\nRatsche NICHT nachgezogen: LINSE ROT — erst die Befunde heilen:\n  " + sperrt.map((r) => r.text).join("\n  "));
            process.exit(1);
        }
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
        console.log(
            `\nRatsche ${ratscheSpec.ratscheDatei} (Ort ${ort.id} × ${geraet} × ${sicht}, V${version}) ` +
                `${neu ? "NEU GEMINTET" : "nachgezogen"} (${r.aenderungen.length}): ${r.aenderungen.join(" · ") || "nichts fiel"}` +
                (neu ? `\nDer Re-Mint hebt ${hebt.length} Zeilen: ${hebt.join(" · ") || "keine"}` : "")
        );
        process.exit(0);
    } else if (cmd === "lauf") {
        o = await rufe("/lauf", {
            sek: a[0],
            ein: opt("--ein"),
            regler: opt("--regler", "frei"),
            tiere: opt("--tiere", "halten"),
            ruhe: opt("--ruhe", 0),
        });
        // Die Wetter-Wache: ein Lauf, der das Wetter nicht hält, endet mit Exit 1 und nennt den Täter.
        if (o && o.wetterHalt && o.wetterHalt.urteil === "ROT") {
            console.log(JSON.stringify(o, null, 1));
            console.log(`WETTER-WACHE ROT: ${o.wetterHalt.taeter.join(" · ")}`);
            process.exit(1);
        }
    } else if (cmd === "profil")
        o = await rufe("/profil", {
            sek: a[0],
            regler: opt("--regler", "voll"),
            top: opt("--top", 30),
            tiere: opt("--tiere", "halten"),
        });
    else if (cmd === "haenger") {
        if (argv.includes("--selbsttest")) {
            const f = HL.selbsttest();
            console.log(
                f.length
                    ? "SELBSTTEST ROT:\n  " + f.join("\n  ")
                    : "SELBSTTEST GRÜN: die Hänger-Linse nennt Takt-Last, Neben-Last, Collector und GPU-Warten nach synchronen Pipelines beim Namen, die Eichung legt den Profiler auf die Seiten-Uhr"
            );
            process.exit(f.length ? 1 : 0);
        }
        // `--erst [folge]`: die Erst-Probe (ABBA in einer Welt, Exit 1 bei einem Befund)
        if (argv.includes("--erst")) {
            const i = argv.indexOf("--erst");
            const folge = argv[i + 1] && /^[AB]+$/.test(argv[i + 1]) ? argv[i + 1] : "ABBAABBA";
            const e = await rufe("/erst-probe", { folge, ein: opt("--ein"), art: opt("--art") });
            if (!e || !e.tabelle) {
                console.log(JSON.stringify(e, null, 1));
                process.exit(1);
            }
            console.log(e.tabelle);
            if (e.befunde.length) console.log("\nLINSE ROT:\n  " + e.befunde.join("\n  "));
            process.exit(e.befunde.length ? 1 : 0);
        }
        // `--auswerten <x.roh.json>`: ein gesicherter Lauf neu geurteilt (nur Node — eine andere Schwelle, eine neue Linse)
        if (opt("--auswerten")) {
            const { roh, profile } = JSON.parse(fs.readFileSync(opt("--auswerten"), "utf8"));
            const a = HL.haengerAuswerten(roh, profile, { schwelle: Number(opt("--schwelle", 100)) });
            const befunde = HL.haengerLinsenBefunde(a);
            console.log(HL.haengerTabelle(a));
            if (befunde.length) console.log("\nLINSE ROT:\n  " + befunde.join("\n  "));
            process.exit(befunde.length ? 1 : 0);
        }
        o = await rufe("/haenger", {
            sek: a[0],
            ein: opt("--ein"),
            regler: opt("--regler", "voll"),
            tiere: opt("--tiere", "frei"),
            wandern: opt("--wandern", "aus"),
            schwelle: opt("--schwelle", 100),
            probe: argv.includes("--probe"),
            json: opt("--json"),
        });
        if (!o || o.fehler || !o.tabelle) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(1);
        }
        console.log(o.tabelle + "\n\n" + o.datei);
        if (o.befunde.length) console.log("\nLINSE ROT:\n  " + o.befunde.join("\n  "));
        process.exit(o.befunde.length ? 1 : 0);
    } else if (cmd === "schirm") o = await rufe("/schirm", { datei: opt("--datei"), regler: opt("--regler", "frei") });
    else if (cmd === "fenster") o = await rufe("/fenster", { w: a[0], h: a[1] });
    else if (cmd === "gpu-fehler") o = await rufe("/gpu-fehler", {});
    else if (cmd === "gpu-bank") o = await rufe("/gpu-bank", { n: a[0], runden: opt("--runden", 3) });
    else if (cmd === "ziele") {
        o = await rufe("/ziele", { n: opt("--n"), json: opt("--json"), selbsttest: argv.includes("--selbsttest") });
        if (o && o.tabelle) {
            console.log(o.tabelle + (o.selbst ? "\n\n" + o.selbst : "") + "\n" + o.datei);
            process.exit(o.ok ? 0 : 1);
        }
        console.log(JSON.stringify(o, null, 1));
        process.exit(1);
    } else if (cmd === "zerlegen") {
        const bi = argv.indexOf("--bilder");
        o = await rufe("/zerlegen", {
            runden: opt("--runden"),
            n: opt("--n"),
            nur: opt("--nur"),
            json: opt("--json"),
            bilder: bi < 0 ? false : argv[bi + 1] && !argv[bi + 1].startsWith("--") ? argv[bi + 1] : true,
            selbsttest: argv.includes("--selbsttest"),
            last: opt("--last"),
        });
        if (o && o.tabelle) {
            console.log(o.tabelle + "\n\n" + o.datei + (o.ordner ? "\n" + o.ordner : ""));
            process.exit(o.ok ? 0 : 1);
        }
        if (!o || o.fehler) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(1);
        }
    } else if (cmd === "shader") {
        if (argv.includes("--selbsttest")) {
            const f = SK.selbsttest();
            console.log(
                f.length
                    ? "SELBSTTEST ROT:\n  " + f.join("\n  ")
                    : "SELBSTTEST GRÜN: die Shader-Kosten-Linse zählt Orte, Arten, Arbeit, Rauschen und den Stoff-Graph, das Urteil nennt jeden Bruch"
            );
            process.exit(f.length ? 1 : 0);
        }
        o = await rufe("/shader", {
            nur: opt("--nur"),
            top: opt("--top", 30),
            ordner: opt("--ordner"),
            stoff: opt("--stoff"),
            gegen: opt("--gegen"),
            datei: opt("--datei"),
            rauschprobe: argv.includes("--rauschprobe"),
        });
        // Ein Fehler ist nie grün: ohne Tabelle und Urteil endet der Befehl mit Exit 1.
        if (!o || o.fehler || !o.tabelle || !Array.isArray(o.rot)) {
            console.log(JSON.stringify(o, null, 1));
            process.exit(1);
        }
        console.log(o.tabelle + (o.ordner ? "\n" + o.ordner : ""));
        if (o.stoff)
            console.log("\n" + o.stoff.tabelle + "\nBudget " + o.stoff.name + " " + JSON.stringify(o.stoff.budget));
        if (o.probe) console.log("\nRausch-Probe (max |GPU − CPU| je Probe, Grenze 1e-4) " + JSON.stringify(o.probe));
        console.log(o.rot.length ? "\nROT:\n  " + o.rot.join("\n  ") : "\nGRÜN");
        process.exit(o.rot.length ? 1 : 0);
    } else if (cmd === "reload") o = await rufe("/reload");
    else if (cmd === "stop") o = await rufe("/stop");
    else {
        console.log(fs.readFileSync(__filename, "utf8").split('"use strict"')[0].trimEnd());
        process.exit(1);
    }
    console.log(JSON.stringify(o, null, 1));
})().catch((e) => {
    console.error("WERKBANK-FEHLER:", (e && e.message) || e);
    process.exit(1);
});
