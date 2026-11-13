#!/usr/bin/env node
// DIE PUNKTE-MASCHINE der Meisterkarte: die Punkte eines Kriteriums sind eine FUNKTION DES SHA, gerechnet wie die CI —
// keine Sitzung misst und bucht mehr von Hand, was hier registriert ist.
//
//   node punkte.cjs run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--bahnen 3] [--port-basis 7700]
//        fährt jede Station des Geräts im Spiel-Baum am SHA, schreibt messung/<sha8>-<geraet>.json
//        --offen: nur die Stationen ohne frische Messung am SHA (das Frische-Urteil der Buchung) · --trocken: nur nennen
//        DIE SITZUNG zuerst (radeon|gtx, fahreSitzung): jede Station mit `probe` in EINER warmen Welt am SHA unter dem ganzen Schloss,
//        die Einträge mit modus "session" und bahn "sitzung", der Kopf der Sitzung als m.sitzung (darin m.sitzung.strom: die Dauerlast
//        jedes Bilds der Sitzung, stromSeite); die Reihe anfang · was die Welt lässt · ende · was sie ändert, die Grundstellung nur nach
//        einer mutierenden Probe oder einem Abbruch; danach die befehl-Stationen
//        --eich (radeon|gtx, DIE EICH-FAHRT, eichEintrag): die Sitzung an derselben Leine über die Proben ohne frische Messung und
//        ohne Eich-Zahl am SHA; je Probe ihre Sekunden (`eich`), das Urteil wie in jeder Fahrt — die OMEN fährt sie als Station zug/eich-gtx.sh
//        Zwillinge (gleicher Befehl und Umgebung) fahren EINMAL; DER BAHN-PLAN (fahrePlan): jede Zeit-Station allein, die übrigen
//        auf bis zu N Bahnen (Vorgabe 3, höchstens 5) zugleich, jede Bahn mit eigenem Spiel-Baum und eigenem Port-Band (portBand) —
//        auf radeon|gtx über das Platz-Schloss (werkzeug/gpu-lauf.sh: ein Bild-Lauf nimmt einen Platz, ein Zeit-Lauf alle)
//        headless misst nie am Platz: ohne --farm ruft run die Farm (punkte-farm.yml im Spiel-Repo, farmRufen), wartet und holt
//        ihre Messung in diesen Baum; --farm <name> fährt AUF dem Läufer (ohne Schloss des Rechners, host = name)
//   node punkte.cjs scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur id,id]
//        der Plan der Farm: die Läufe in höchstens --jobs Scheiben, die schwersten zuerst (JSON auf stdout = die Matrix)
//   node punkte.cjs vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <s>]
//        die Teil-Messungen der Scheiben zur EINEN messung/<sha8>-<geraet>.json samt Roh-Ausgaben
//   node punkte.cjs buchen --kopf <sha> [--trocken]
//        liest alle messung/*.json, urteilt R6 (NACH KONSUM: der Diff seit der Messung trifft, was der Lauf ausführte oder las — eine
//        Messung ohne Konsum-Menge urteilt nach Pfad und Linse wie bisher, gezählt beim Namen) und R10, schreibt stand.json
//        (--trocken: dieselben Zeilen samt RÜCKFALL, stand.json bleibt unberührt)
//   node punkte.cjs beruehrt --basis <sha> --kopf <sha> [--json]   welche Stationen berührt der Diff eines Zweigs: je Gerät die Hälften,
//        deren Messung an der Basis frisch gilt und am Kopf nicht mehr (dasselbe Frische-Urteil wie die Buchung, R6 nach Konsum) —
//        `nur=…` für den Zug-Dienst und den Richter nach der Landung; daneben die Hälften, die schon an der Basis offen sind
//   node punkte.cjs liste [--kopf <sha>]   die registrierten Stationen, geprüft gegen src/gN.js und jeder pfad-Glob gegen den
//        Kopf (sonst origin/main des Spiel-Klons)
//   node punkte.cjs gtx-nutzen --kopf <sha>   die GTX-Stationen, deren Messung am Kopf Punkte ändern kann (nur=… für die OMEN):
//        die gtx-Hälften ohne frische Messung am Kopf, deren Ausgang über die Punkte entscheiden kann (Frische-Urteil der Buchung)
//   node punkte.cjs plan --kopf <neu> --vorher <alt>   der Mess-Plan nach einem Zug: je GPU-Gerät die Stationen, die Punkte halten
//        oder gewinnen können (Staffel 1 auf EINEM Gerät, Zeit-Stationen auf der GTX, rote ohne Heil-Versuch nie)
//   node punkte.cjs gruppen --geraet radeon|gtx|headless [--nur id,id]   je Zeile die Ids EINES Laufs (Zwillinge zusammen, Reihe von
//        nur; jede Probe-Station in der ERSTEN Zeile: die Sitzung ist ein Lauf) — der Messplatz der OMEN fährt je Zeile ein
//        `run --nur`, nie einen Zwilling zweimal, nie eine zweite Welt
//   node punkte.cjs grundstellung   (in einer Probe der Sitzung) der Grund der Sitzung (PUNKTE_SITZUNG_GRUND) kehrt in die Welt an
//        WERKBANK_PORT zurück, ohne Neuladen (`_grundstellung` des Spiels), samt der Zeichenkette der Seite (zeichnerKette); ROT nennt
//        die Größen, die vom Grund abweichen
//   node punkte.cjs grundprobe --baum <Spiel-Baum> [--mutante <zeile>] [--port P]   (Null-Renderer) die Grundstellung der Sitzung
//        an einer Welt des Baums: Gang zwei Regionen weit mit einem Leib, dessen Tier dahinter ankert → Grund → graben, bauen, Ritt, Uhr, Brand, Regen, Ort-Takt → zurück, keine Größe weicht ab; die
//        Mutante (ein Wort der GRUND_TAFEL schweigt) ist ROT beim Namen
//   node punkte.cjs eichtafel --geraet radeon|gtx [--sha a,b] [--schreibe [--nur id,id]]   je Lauf der Sitzung: sein Deckel, das p90 seiner jüngsten
//        Läufe aus ALLEN Mess-Dateien der Karte und der Deckel daraus (eichTafel), dazu Σ heute ↔ aus den Zahlen und die Teile der Fahrt;
//        --sha: je Mess-Datei die Stationen, die am Deckel rissen, vorher ↔ am Deckel der Tafel; --schreibe legt jeden Deckel als Deckel
//        DIESER Karte in die Deckel-Tafel (deckel.json, probeSek) — nur, wenn die Stationen danach halten
//   node punkte.cjs selbsttest [--ohne 3c]   jeder Fall beim Namen (ohne (3c) DIE BAHNEN: sie zeugt Bash-Waisen)
//   node punkte.cjs fremdlast [--sek 60] [--takt 2000]   der Zeuge der Fremd-Last (fremdlastCli): die fremden Kerne über --sek Sekunden beim Namen
//   node punkte.cjs referenz [--n 5] [--umfeld allein|sitzung]   DIE REFERENZFAHRT von Hand (referenzCli): n Fahrten, Streuung, f gegen die Ruhe
//
// FORMAT (stationen/g1.js .. g6.js, module.exports = [ … ]), je Eintrag:
//   kriterium "gelaende.K2" (Bereich-Schlüssel.K<n> wie in src/gN.js) · staffel 1|2 · geraet "radeon"|"gtx"|"headless"
//   oder eine Liste (Staffel 2 einer GPU-Station verlangt ["radeon","gtx"]) · befehl argv im Spiel-Baum (argv[0] "node"
//   oder "bash"; Platzhalter {PORT} {AUS} {BAUM} {KOORD}, {SEK} der Deckel des Laufs in s) · env (optional, dieselben Platzhalter) · gpu true|false (true →
//   über gpu-lauf.sh, nie ohne Schloss) · zeit true|false (true: das Urteil fällt an der Wanduhr — ms, s, fps, p95 je Bild, Pop
//   je s, Takt, Latenz, Sekunden bis sichtbar, oder es reißt nachweislich unter fremder Last —, die Station fährt allein, und
//   DIE REFERENZFAHRT vor und nach ihr misst die Verlangsamung f ihrer Umgebung (ihr Maß roh ÷ f, im Band UNGEMESSEN „unscharf unter
//   Last“), der Zeuge nennt, wer die Last war — referenzFahrt · fremdZeuge · fremdUrteil; false: Bild oder Funktion, sie verträgt parallele
//   Bahnen und trägt den Bericht nur; je Station Pflicht) · minuten (Deckel = 2 × minuten, mindestens 2 min) · urteil (j, lauf) →
//   { gruen, zahl } mit j = JSON aus {AUS} oder null, lauf = { exit, stdout, stderr } · mass (j, lauf, urteil) → [{ wort, wert, soll,
//   richtung "≤"|"≥" (Vorgabe ≤), fest? }] die Zahlen, an denen das Urteil fällt, ODER ohneMass (der Grund) — genau eines an jeder
//   Zeit-Station, an keiner anderen; beide NIE im Abdruck (stationen/mass.cjs, die Tafel am Ende jeder gN.js) · pfad: Globs des gemessenen Pfads
//   (R6) · quelle: der Staffel-Text wörtlich (Teil der Staffel in src/gN.js) · beide (optional, nur true an Staffel 1 auf
//   radeon und gtx: die Staffel nennt beide Geräte, die 1 zählt erst, wenn JEDES grün ist — Pflicht, wo die quelle sie nennt) ·
//   proben (optional): [{ name, stdout | j, gruen }] Roh-Ausgaben des Befehls (stdout) oder seine Rohdatei (j, das JSON an {AUS})
//     mit dem Urteil, das die Station über sie spricht
//   (die Schlupflöcher der Soll-Tafel als Mutanten; der Selbsttest urteilt jede).
//   probe (statt befehl, nur gpu true): { befehl: argv wie oben, sek: der Grund-Deckel in s ohne Eintrag in deckel.json (Vorgabe
//   PROBE_DECKEL_S, je Teil höchstens ein Teil der Fahrt FAHRT_MAX_S − SITZUNG_BOOT_S; darüber die Leine, fahreGruppe) } —
//   die Station misst als Probe in der EINEN warmen Welt der Sitzung (fahreSitzung), nie mit eigenem Boot; dazu {PORT} = der Port
//   der Sitzung (save-server {PORT}, Werkbank {PORT}+20000 = WERKBANK_PORT), PUNKTE_SITZUNG_LOG = das Log ihrer Werkbank,
//   PUNKTE_SITZUNG_STROM = der Strom der Sitzung (je Bild eine Zeile, stromSeite; Zapfen, Marke und Leser exportiert diese Maschine),
//   PUNKTE_PROBE = ihr Name. Dazu optional: mutiert (true: sie ändert die Welt — baut, gräbt, Tab-Tod, Speichern/Laden —, nur nach
//   ihr setzt die Sitzung die Welt zurück) · stellung ("anfang" | "ende": die Reihe der Sitzung, sitzungsReihe) · teile (2…TEILE_MAX: der Lauf fährt in Teil-Proben derselben Welt, je Teil ein Prozess unter dem Deckel, PUNKTE_TEIL „i/N“ und die Frist
//   PUNKTE_TEIL_FRIST_S; der nächste nur nach `@@PUNKTE@@ TEIL WEITER`, EIN Urteil über alle — fahreGruppe). Eine Station trägt GENAU
//   EINES von befehl und probe; auf radeon|gtx NUR probe (DIE FAHRT, fahrtUrteil).
// DIE FAHRT (29.10., das Gesetz des Schöpfers: „Ein kpl. Fahrt durch jedes System max 30 min, inbegriff ist dann auch die dauerlast"):
//   je Karte (radeon, gtx) die Summe der Deckel ihrer Läufe in der Sitzung (Zwillinge einmal) in Teilen je ≤ FAHRT_MAX_S samt Boot,
//   höchstens FAHRT_TEILE_MAX — sonst ROT mit den drei größten beim Namen (pruefeStationen: liste, run und buchen fallen dort); im
//   Läufer die Wache (fahreSitzung): reißt eine Probe ihren Deckel, fällt sie und ist UNGEMESSEN beim Namen, reißt die Fahrt
//   FAHRT_MAX_S, endet die Sitzung und nennt die offenen Proben (m.sitzung.offen) — die Fortsetzung (fahreFortsetzung) misst sie in
//   einer neuen Sitzung (m.fortsetzung), nie bleiben sie still bis zum nächsten `run --offen` liegen.
// Je Kriterium, Staffel und Gerät EINE Station (Schlüssel "<kriterium>#<staffel>"): verlangt eine Staffel Mechanik und Bild, trägt
// sie eine headless-Hälfte (befehl) und eine Karten-Hälfte (probe) unter demselben Schlüssel — die Buchung zählt sie erst, wenn
// jede auf jedem ihrer Geräte grün ist (stufen). Ein Kriterium ohne Staffel-1-Station ist ROT.
//
// BUCHUNG (R2 · R6 · R10): je Station und Gerät zählt die JÜNGSTE Messung, deren Abdruck (Befehl, Urteil, Pfad, Hilfen)
// der Station gleicht und deren KONSUM (Abschnitt „Konsum“: was ihr Lauf ausführte und las — konsum-zeuge.cjs) zwischen Mess-SHA und
// Kopf ohne Stempel unberührt ist; trägt die Messung keinen Konsum, ihr Pfad und ihre Linse (stempelDiff, linsenVon). 1 = jede
// Staffel-1-Station auf mindestens einem ihrer Geräte grün · 2 = dazu jede Staffel-2-Station auf JEDEM ihrer Geräte grün ·
// sonst 0. Ein jüngeres ROT schlägt ein älteres GRÜN.
// DIE RATSCHE (Schöpfer 30.10.: „Tests sichern nur den Rückfall, nie den Fortschritt — das jetzige Minimum sichern und mehr
// hereinholen“): ohne frische Messung (R6-alt, ungemessen, Station neu) gilt je Station und Gerät das GRÜN der letzten Buchung
// weiter („gehalten“, mit Mess-SHA und Zahl von damals); nur ein frisches ROT nimmt es (RÜCKFALL beim Namen), die Wand PFAD
// hält nie. Ohne Vorbuchung (oder `buchen --ohne-ratsche`) ist ungemessen 0.
// KEIN URTEIL IST KEIN ROT (w4-sitzung-urteil, keinUrteil in fahreGruppe — die EINE Stelle, an der Stations-Ergebnisse entstehen): ein
// Lauf, dessen Urteils-Zeile fehlt, dessen Linse vor ihr abstürzt oder dessen eigene Frist reißt, ist UNGEMESSEN beim Namen (der Grund
// wörtlich in m.ungemessen), nie ein frisches ROT — die Ratsche hält gegen ihn; ein echtes ROT (die Linse misst, das Maß reißt) bleibt.
// Ebenso eine Probe der Sitzung, die die Zeichenkette der Seite verändert ließ (w4-grund-zeichner, zeichnerKette in fahreSitzung): ein
// Werkzeug-Bruch beim Namen der Größe, auch über ihr eigenes GRÜN — die Grundstellung danach gibt der Seite zurück, was sie lieh.
// KEINE MESSUNG IST KEIN ROT (pm-fremdlast, Befund 08.11.: die Ratsche nahm Punkte unter fremder Last und nach dem Absturz des Messorts),
// an derselben Stelle: (MESSORT) wirft das Messgerät vor dem Urteil der Linse — ein `muss`-Schritt, die Grundstellung, der Ortswechsel,
// die Seite, die nicht steht —, sagt sein Läufer die EINE Marke `@@PUNKTE@@ MESSORT <grund>` (MESSORT_MARKE): UNGEMESSEN (Messort: …);
// (LAST) ein ROT einer Zeit-Station, deren Referenzfahrt eine Verlangsamung f über REFERENZ_RUHE_BAND zeigt, ist UNGEMESSEN („unscharf
// unter Last“), solange roh ÷ f das Soll hält — reißt ihr Maß auch entlastet, ist es ROT; ein GRÜN unter Last gilt (die Referenzfahrt,
// 11.11.) — DER ZEUGE (fremdZeuge) nennt je Station jeden Prozess außerhalb des eigenen Baums beim Namen, die Grund-Last des Geräts
// (FREMD_GERAET) nie als fremd. ROT ist nur, was die Linse als Zahl gegen ihr Soll urteilt.
// ZWEI WÄNDE (24.10., Prüfung der Buchung 61 → 80): (PFAD) jeder `pfad`-Glob trifft am Mess-SHA und am Kopf mindestens eine
// Datei, sonst ist die Station ROT — ein toter Glob macht R6 blind (die KAMPF-Liste nannte einen Schmiede-Kern, den es nicht gab);
// (GPU) eine GPU-Station zählt nur, wenn ihr Lauf beweist, dass eine Linse auf der Karte zeichnete: ein Adapter eines Herstellers
// in `[linse-gpu]` und keine Weiche „zeichnet nie“ (leib.K4#1 war als GPU gebucht, die Linse zeichnete nie — welt-boot
// „das Rezept ist null“). Den Zeugen sammelt gpu-zeuge.cjs aus jedem node-Prozess der Station; eine ältere Messung ohne ihn
// zeugt nur über ihre Roh-Ausgabe (messung/roh), sonst ist sie ungemessen.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { spawn, spawnSync } = require("child_process");

const DIR = __dirname;
const QUELLE = path.resolve(DIR, "..");
const KOORD = path.resolve(QUELLE, "..");
const GRUPPEN = ["g1", "g2", "g3", "g4", "g5", "g6"];
const GERAETE = ["radeon", "gtx", "headless"];
const TABU_PORT = 4312;

// ───────────────────────────────── Format ─────────────────────────────────
function kriterienDerKarte(srcDir = path.join(QUELLE, "src")) {
    const k = new Map();
    for (const g of GRUPPEN) {
        const m = require(path.join(srcDir, g + ".js"));
        for (const b of m.bereiche) b.kriterien.forEach((x, i) => k.set(b.key + ".K" + (i + 1), { gruppe: g, ...x }));
    }
    return k;
}

const geraeteVon = (st) => (Array.isArray(st.geraet) ? st.geraet : [st.geraet]);
const schluessel = (st) => st.kriterium + "#" + st.staffel;
// DER PFLICHT-RICHTER (04.11., Koordinator: „die 330 bleiben“): eine Station mit pflicht: true und kriterium "pflicht.<Eintrag>" misst
// einen Teil von PFLICHT-OFFEN, den kein Kriterium der Karte trägt. Sie fährt und urteilt wie jede Station, trägt aber keine Punkte:
// die Buchung führt sie in pflichtJe (nie in je, also nie in Σ und nie in gen.cjs), das Pflicht-Band liest sie dort.
const PFLICHT_KRITERIUM = /^pflicht\.[A-Z]$/;
const istPflicht = (st) => !!st && st.pflicht === true && PFLICHT_KRITERIUM.test(st.kriterium);
// DER BREITE-RICHTER (10.11., der Schöpfer: „Ja, Breite öffnen“; BEFUND-GROSSES-BILD-2026-11-10.md §5): eine Station mit breite: true
// und kriterium "breite.<Bereich der Karte>" misst das EINE Kriterium der Staffel Breite ihres Bereichs als Konsum-Leser. Sie fährt und
// urteilt wie jede Station und trägt keine Punkte, bis der Schöpfer die Staffel in die Karte setzt: gebucht wie der Pflicht-Richter
// (pflichtJe, nie je — Σ und gen.cjs bleiben bei den 330); ihre quelle nennt das Kriterium („BREITE <Bereich> = …“).
const BREITE_KRITERIUM = /^breite\.[a-z]+$/;
const istBreite = (st) => !!st && st.breite === true && BREITE_KRITERIUM.test(st.kriterium);
const ohnePunkte = (st) => istPflicht(st) || istBreite(st);

function hilfeText() {
    return fs.readFileSync(path.join(DIR, "hilfe.cjs"), "utf8");
}
// DIE PROBE der Sitzung (29.10., Takt 19 an b3f9ae95 Radeon: 64 GPU-Stationen 879 Stations-Minuten, Mittel 13,7 min — 282 min am
// Schloss, 103 min Abbau-Schwanz, jede Station ihr eigener Boot; die Welt lädt warm in Sekunden): argv und Deckel; eine Station mit
// probe hat keinen befehl. Der Abdruck einer befehl-Station bleibt Byte für Byte (pr nur an einer Probe)
// DAS BUDGET DER FAHRT (29.10., der Schöpfer: „Eine komplette Fahrt durch jedes System max 30 min"): FAHRT_MAX_S samt Boot ist das
// EINE Gesetz der Zeit. DER DECKEL EINER PROBE IST EIN NOT-AUS AN DER LEINE (10.11., pm-deckel; Radeon 78d37554 `run --nur` mit 6 Proben:
// 6 von 6 UNGEMESSEN an Einzel-Uhren — gelaende.K2#2 „Deckel 90 s“, klang.K5#2 „Deckel 45 s“, siedlung.K1#2 und bauen.K1#2 „Frist der
// Probe 39 s“ mit 10/18 Häusern und 2/8 Werken gesehen, leib.K3#2 „/umstellen binnen 11 s“ —, die Fahrt lief 505 s von 1 800; die
// Inventur 07.11.: 762 Deckel-Risse, 60 % der GPU-Ereignisse UNGEMESSEN): je Probe ihr GRUND-Deckel (probeSek: deckel.json je Karte aus
// ihren Grün-Läufen, eichTafel, sonst probe.sek, Vorgabe PROBE_DECKEL_S) — bis dahin tötet nichts; darüber lebt sie, solange sie
// Lebenszeichen gibt (jede Ausgabe auf stdout/stderr oder ein Bild ihrer Welt im Strom, Stille höchstens STILLE_S) und ihr ANTEIL der Fahrt trägt (fahreSitzung: der Rest
// der Fahrt nach Bedarf unter die offenen Proben geteilt — eine `--nur`-Fahrt mit wenigen teilt das ganze Budget unter diesen wenigen).
// Die eigene Frist der Probe ({SEK}, PUNKTE_PROBE_DECKEL_S, PUNKTE_TEIL_FRIST_S) folgt demselben EINEN Deckel. Ein Abbruch bleibt
// UNGEMESSEN beim Namen (Stille, Anteil, Fahrt); der Deckel ändert nie ein Urteil
const PROBE_DECKEL_S = 45;
const PROBE_SEK = PROBE_DECKEL_S;
const FAHRT_MAX_S = 1800;
const STILLE_S = 15;
const PROBE_SCHLUESSEL = ["befehl", "sek", "mutiert", "stellung", "teile"];
// DIE TEILE (probe.teile, fahreGruppe): höchstens TEILE_MAX Teil-Proben je Lauf, jede im Gesetz der Probe; die Fahrt zählt jeden Teil
const TEILE_MAX = 8;
const teileVon = (st) => (st.probe && st.probe.teile) || 1;
const befehlVon = (st) => (st.probe ? st.probe.befehl : st.befehl);
// DIE DECKEL-TAFEL (deckel.json, 01.11. mess-werkzeug; Radeon 25ac4c0c: ~35 von 72 offenen Proben rissen Deckel, die die Eich-Fahrt der
// GTX gesetzt hatte — „die nie endenden auf 10 s“, e245f1813 — und die Radeon nie gefragt): je Karte und Probe der Deckel aus IHREN
// gemessenen Dauern in allen Mess-Dateien (04.11.: nie mehr aus einer einzigen Fahrt — eichTafel, das p90 der jüngsten Läufe), geschrieben
// nur von `eichtafel --schreibe` (⌈1,5 × p90⌉ + 6 s, mindestens 10 s, höchstens das Gesetz der Probe),
// gelesen von probeSek(st, geraet): Fahrt, Läufer und Eich-Tafel je Karte. Ohne Eintrag gilt `probe.sek` der Station. Der Abdruck trägt
// die Einträge der Station (ein neuer Deckel misst neu); ohne Eintrag bleibt er Byte für Byte
const DECKEL_DATEI = path.join(DIR, "deckel.json");
const DECKEL_KARTEN = ["radeon", "gtx"];
let deckelTafel = null;
const deckelVon = () => deckelTafel || (deckelTafel = fs.existsSync(DECKEL_DATEI) ? JSON.parse(fs.readFileSync(DECKEL_DATEI, "utf8")) : {});
const sekRoh = (st) => (st.probe && st.probe.sek) || PROBE_SEK;
const deckelEintraege = (st) => Object.fromEntries(DECKEL_KARTEN.filter((g) => deckelVon()[g] && deckelVon()[g][schluessel(st)] != null).map((g) => [g, deckelVon()[g][schluessel(st)]]));
const probeSek = (st, geraet) => {
    const t = geraet && deckelVon()[geraet];
    if (t && t[schluessel(st)] != null) return t[schluessel(st)];
    const e = Object.values(deckelEintraege(st));
    return geraet ? sekRoh(st) : Math.max(sekRoh(st), ...e);
};
// DER DECKEL IST EINE FUNKTION DES GERÄTS (10.11., Koordinator: die OMEN maß 41 veraltete Stationen am main 6aa7a5a6, 17 rissen „Deckel
// 90 s gerissen: Stille …“ — die Tafel der GTX trug die Zahlen der Radeon und lernte nie, denn jeder Riss zählt zensiert): an der Leine
// (fahreGruppe) ist der Grund-Deckel einer Karte nie kleiner als der der Radeon × ihr TAKT-FAKTOR (taktVon, TAKT_KARTE `takt`, gemessen aus
// den Mess-Dateien), gekappt am Teil der Fahrt je Teil der Probe; eine Zahl der Tafel, die schon
// darüber liegt (die eigenen Grün-Läufe der Karte), bleibt. Die Tafel (probeSek), der Plan der Fahrt (fahrtSumme, der Anteil) und der
// Abdruck bleiben Byte für Byte: mit dem Faktor im Plan stünde die Fahrt der GTX bei 7 394 s in 5 Teilen über dem Gesetz von 3 — die
// Probe, die länger braucht, nimmt ihre Zeit an der Leine, und was über die Fahrt reicht, misst die Fortsetzung
// DIE LEINE LERNT AUS DEN ZAHLEN (11.11., Koordinator): der Grund-Deckel an der Leine ist nie kleiner als der Deckel, den die Reihe der
// Station auf DIESER Karte verlangt (eichTafel → deckelAus: Grün-p90, ohne Grün-Reihe das p90 der Urteile, der jüngste Riss verdoppelt,
// „hängt“ fällt zurück). Bis dahin stand diese Zahl nur in `eichtafel` und kam nie an: `--schreibe` fiel an der Wand der Teile (Σ Deckel
// Radeon 6 114 s, GTX 5 978 s über 3 × 1 740 s), die Tafel blieb vom 09.11., und die volle Fahrt gibt keiner Probe mehr als ihren
// Grund (Σ Bedarf > Fahrt: der Anteil ist der Grund-Deckel) — ankunft.K4#1 riss 7 von 7 Läufen je Karte, die Profi-Band-Proben standen
// mit Urteilen nach 82,7 s (p90) am Deckel 90. Wie der Takt-Faktor: nur an der Leine — Tafel, Plan der Fahrt und Abdruck bleiben Byte
// für Byte (kein Urteil wird alt, weil eine Not-Aus-Uhr wuchs). deckelGelernt: je Karte { id: s }, einmal je Prozess aus den
// Mess-Dateien; der Selbsttest stellt es leer.
let deckelGelernt = null;
const gelerntVon = (geraet) => {
    if (!deckelGelernt) deckelGelernt = {};
    if (!deckelGelernt[geraet]) {
        const je = (deckelGelernt[geraet] = {});
        if (DECKEL_KARTEN.includes(geraet))
            for (const z of eichTafel(ladeGeprueft().stationen, ladeMessungen(), geraet).zeilen) if (z.neu != null && z.neu > z.sek) for (const id of z.ids) je[id] = z.neu;
    }
    return deckelGelernt[geraet];
};
const grundDeckel = (st, geraet) => {
    const eigen = Math.max(probeSek(st, geraet), (geraet && gelerntVon(geraet)[schluessel(st)]) || 0), f = taktVon(geraet);
    if (!(f > 1)) return eigen;
    return Math.max(eigen, Math.min(Math.floor((FAHRT_MAX_S - SITZUNG_BOOT_S) / teileVon(st)), Math.ceil(+(probeSek(st, "radeon") * f).toFixed(6))));
};
// der Abdruck JE KARTE (geraet): der Deckel dieser Karte aus der Deckel-Tafel steht darin — ein neuer Radeon-Deckel misst die Radeon
// neu, nie die GTX; ohne Eintrag (und ohne Karte) Byte für Byte wie bisher
function abdruck(st, hilfe = hilfeText(), geraet = null) {
    const dk = geraet && st.probe && deckelVon()[geraet] && deckelVon()[geraet][schluessel(st)] != null ? { [geraet]: deckelVon()[geraet][schluessel(st)] } : null;
    const roh = JSON.stringify({
        k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {}, gpu: !!st.gpu,
        u: String(st.urteil), p: st.pfad, q: st.quelle, h: hilfe,
        ...(st.probe ? { pr: [st.probe.befehl, sekRoh(st), ...(st.probe.mutiert ? ["mutiert"] : []), ...(st.probe.stellung ? [st.probe.stellung] : []),
            ...(st.probe.teile ? ["teile " + st.probe.teile] : []), ...(dk ? [dk] : [])] } : {}),
    });
    return crypto.createHash("sha1").update(roh).digest("hex").slice(0, 12);
}
// DIE FEINDE DER SITZUNG: eine Probe, die Ports räumt, eine Welt startet oder stoppt, tötete die Welt aller folgenden Proben —
// der Täter beim Namen (pruefeStationen)
const SITZUNG_FEINDE = [
    [/\bnetstat\b/, "netstat (räumt Ports)"],
    [/\btaskkill\b/, "taskkill"],
    [/save-server\.js/, "ein eigener save-server"],
    [/werkbank\.cjs["']?\s+(start|stop)\b/, "werkbank start|stop"],
    [/(^|[\s;(&|])\$?\{?W\}?\s+(start|stop)\b/m, "werkbank start|stop über $W"],
    [/(wb\(\s*|\[\s*WB\s*,\s*)\[?\s*"(start|stop)"/, "werkbank start|stop aus node"],
    [/werkbankTor\s*\(/, "werkbankTor (eigene Welt)"],
    [/--eigen\b/, "--eigen (eigene Welt)"],
];
const sitzungsFeinde = (argv) => SITZUNG_FEINDE.filter(([re]) => re.test(argv.join("\n"))).map(([, n]) => n);
// DIE FEINDE DES WETTERS (w6-musik-pm, 03.11.): eine Probe, die das Wetter unter dem Mess-Halt setzt (`weatherEffectTime` < 0,
// stamm/feld-dsl.js `_messHalt`), misst ein Wort, das nie galt — `_setWeather` verweigert still. Befund w6-musik 6c4b8f35: affekt.K5#2
// fror den Halt hinter dem ersten Wort (−1e9), ab dem zweiten Lauf lief der Sturm sonnig (Schicht-L1 0); derselbe Fund in `trocken`
// der Welt-Probe (der Regen der Alter-Spur fiel still). Der EINE Weg einer Probe ist `window.__wetterSetzen(wort)`
// (scripts/lib/ausgabe-aufnahme.cjs): er taut den Halt für dieses Wort und hält danach wieder. Beim Namen: (a) jeder Befehl, der den
// Halt von Hand friert; (b) eine Probe der Sitzung (die Sitzung hält den Halt), die `_setWeather` ruft und den Halt nie taut. Grenze:
// (b) liest den Befehl als Ganzes — ein Tauen irgendwo in ihm deckt ein Wort davor.
const WETTER_FEINDE = [
    [/\bweatherEffectTime\s*=\s*-/, () => true, "der Halt von Hand gefroren (weatherEffectTime = −…)"],
    [/\._setWeather\(/, (t, probe) => probe && !/\bweatherEffectTime\s*=\s*0\b/.test(t), "_setWeather unter dem Halt der Sitzung (ohne Tauen)"],
];
const wetterFeinde = (argv, probe) => {
    const t = argv.join("\n");
    return WETTER_FEINDE.filter(([re, gilt]) => re.test(t) && gilt(t, probe)).map(([, , n]) => n);
};

// prüft die Stationen gegen die Karte; Rückgabe { stationen, fehler }
function pruefeStationen(liste, karte) {
    const fehler = [];
    const gesehen = new Set();
    const ok = [];
    for (const st of liste) {
        const wer = (st && st.kriterium) + "#" + (st && st.staffel);
        const f = [];
        const k = st && (ohnePunkte(st) || karte.get(st.kriterium));
        if (!k) f.push("Kriterium unbekannt");
        if (st && (st.breite !== undefined || BREITE_KRITERIUM.test(st.kriterium || "")) && !(istBreite(st) && karte.has(st.kriterium.slice(7) + ".K1")))
            f.push("ein Breite-Richter trägt breite: true UND kriterium breite.<Bereich der Karte>");
        if (st && (st.pflicht !== undefined || PFLICHT_KRITERIUM.test(st.kriterium || "")) && !istPflicht(st))
            f.push("ein Pflicht-Richter trägt pflicht: true UND kriterium pflicht.<Eintrag>");
        if (![1, 2].includes(st.staffel)) f.push("staffel nicht 1|2");
        if (st && st.befehl === null) {
            fehler.push(wer + ": befehl null gehört in module.exports.fehlt (mit grund), nie in die fahrbare Liste");
            continue;
        }
        const ge = geraeteVon(st);
        if (!ge.length || ge.some((g) => !GERAETE.includes(g)) || new Set(ge).size !== ge.length) f.push("geraet ungültig");
        if (ge.includes("headless") && (ge.length > 1 || st.gpu)) f.push("headless läuft allein und ohne GPU");
        if (!ge.includes("headless") && !st.gpu) f.push("ein Gerät radeon|gtx verlangt gpu: true");
        if (st.staffel === 2 && st.gpu && !(ge.includes("radeon") && ge.includes("gtx")))
            f.push("Staffel 2 einer GPU-Station verlangt beide Geräte (R2)");
        if (st.beide !== undefined && !(st.beide === true && st.staffel === 1 && ge.includes("radeon") && ge.includes("gtx")))
            f.push("beide nur als true an Staffel 1 auf radeon und gtx");
        if (st.staffel === 1 && st.beide !== true && /an beiden Geräten|beide Geräte|beider Geräte/.test(st.quelle || ""))
            f.push("die Staffel 1 nennt beide Geräte — beide: true (sonst bucht EIN Gerät die 1)");
        if (st.proben !== undefined && !(Array.isArray(st.proben) && st.proben.every((p) => p && typeof p.name === "string" && (typeof p.stdout === "string" || (p.j && typeof p.j === "object")) && typeof p.gruen === "boolean")))
            f.push("proben ist keine Liste von { name, stdout | j, gruen }");
        if (st.probe !== undefined) {
            const p = st.probe;
            if (st.befehl !== undefined) f.push("genau eines von befehl und probe");
            if (!p || typeof p !== "object") f.push("probe ist kein { befehl, sek }");
            else {
                // DER DECKEL (die Fahrt, b): der Grund-Deckel der Station — probe.sek und jeder Eintrag der Deckel-Tafel (nur an ihren
                // eigenen Karten) —, je Teil der Probe höchstens EIN Teil der Fahrt (eine Probe misst in EINER Sitzung); kein Gesetz je Probe,
                // keine Ausnahme je Station: die Zeit bindet die Fahrt (fahrtUrteil), die Leine den Hänger (fahreGruppe)
                const sek = probeSek(st), dk = deckelEintraege(st), teilS = FAHRT_MAX_S - SITZUNG_BOOT_S;
                if (p.sek !== undefined && !(Number.isInteger(p.sek) && p.sek >= 1)) f.push("probe.sek keine ganze Zahl ≥ 1");
                else if (Object.entries(dk).some(([g, x]) => !ge.includes(g) || !Number.isInteger(x) || x < 1))
                    f.push("deckel.json: " + JSON.stringify(dk) + " — je Karte eine ganze Zahl ≥ 1, nur an den Geräten der Station");
                else if (sek * teileVon(st) > teilS) f.push("Deckel " + sek + " s × " + teileVon(st) + " Teil(e) über dem Teil der Fahrt " + teilS + " s (FAHRT_MAX_S − Boot) — eine Probe misst in EINER Sitzung");
                if (Object.keys(p).some((k) => !PROBE_SCHLUESSEL.includes(k))) f.push("probe trägt nur " + PROBE_SCHLUESSEL.join(", "));
                if (p.mutiert !== undefined && typeof p.mutiert !== "boolean") f.push("probe.mutiert nicht boolesch");
                if (p.stellung !== undefined && !["anfang", "ende"].includes(p.stellung)) f.push("probe.stellung nicht anfang|ende");
                if (p.teile !== undefined && !(Number.isInteger(p.teile) && p.teile >= 2 && p.teile <= TEILE_MAX)) f.push("probe.teile keine ganze Zahl 2…" + TEILE_MAX);
                if (Array.isArray(p.befehl) && p.befehl.every((a) => typeof a === "string")) {
                    const feind = sitzungsFeinde(p.befehl);
                    if (feind.length) f.push("probe greift die Welt der Sitzung an: " + feind.join(", "));
                }
            }
            if (!st.gpu || ge.includes("headless")) f.push("probe nur an einer GPU-Station (die Sitzung hält die Welt einer Karte)");
        } else if (ge.some((g) => g !== "headless") && st.befehl !== undefined)
            // DIE FAHRT (a): auf einer Karte misst jede Station als Probe der EINEN Welt — ein eigener Boot je Station war die 610 min
            f.push("befehl auf " + ge.filter((g) => g !== "headless").join("+") + " — eine Station der Karte misst nur als Probe der Sitzung (die Fahrt ≤ " + FAHRT_MAX_S / 60 + " min)");
        const argv = befehlVon(st);
        if (!Array.isArray(argv) || !argv.length || argv.some((a) => typeof a !== "string"))
            f.push((st.probe ? "probe." : "") + "befehl ist kein argv");
        else if (!["node", "bash"].includes(argv[0])) f.push((st.probe ? "probe." : "") + "befehl[0] nicht node|bash");
        else {
            const feind = wetterFeinde(argv, !!st.probe);
            if (feind.length) f.push((st.probe ? "probe." : "") + "befehl setzt das Wetter unter dem Mess-Halt: " + feind.join(", ") + " — der EINE Weg ist `window.__wetterSetzen(wort)`");
        }
        if (st.env && (typeof st.env !== "object" || Object.values(st.env).some((v) => typeof v !== "string")))
            f.push("env ungültig");
        if (typeof st.gpu !== "boolean") f.push("gpu nicht boolesch");
        if (typeof st.zeit !== "boolean") f.push("zeit nicht boolesch (true: das Urteil fällt in ms, die Station fährt allein)");
        if (!(st.minuten > 0)) f.push("minuten fehlt");
        if (typeof st.urteil !== "function") f.push("urteil ist keine Funktion");
        // DAS MASS (das Gesetz der Fremd-Last, stationen/mass.cjs): jede Zeit-Station trägt genau eines — mass (eine Funktion) oder ohneMass
        // (der Grund) —, keine andere eines; beide nie im Abdruck
        const mF = st.mass !== undefined, oF = st.ohneMass !== undefined;
        if (mF && typeof st.mass !== "function") f.push("mass ist keine Funktion");
        if (oF && !(typeof st.ohneMass === "string" && st.ohneMass.length >= 8)) f.push("ohneMass ohne Grund");
        if (st.zeit === true && mF === oF) f.push("eine Zeit-Station trägt genau eines von mass und ohneMass (das Gesetz der Fremd-Last)");
        if (st.zeit !== true && (mF || oF)) f.push("mass und ohneMass nur an einer Zeit-Station");
        if (!Array.isArray(st.pfad) || !st.pfad.length || st.pfad.some((p) => typeof p !== "string" || !p))
            f.push("pfad leer (R6 könnte nie fallen)");
        if (typeof st.quelle !== "string" || st.quelle.length < 8) f.push("quelle fehlt");
        // der Pflicht-Richter hat keine Staffel der Karte: seine quelle nennt den Eintrag („PFLICHT-OFFEN E = …“)
        else if (istPflicht(st)) { if (!st.quelle.startsWith("PFLICHT-OFFEN " + st.kriterium.slice(-1) + " = ")) f.push("quelle nennt nicht „PFLICHT-OFFEN " + st.kriterium.slice(-1) + " = …“"); }
        else if (istBreite(st)) { if (!st.quelle.startsWith("BREITE " + st.kriterium.slice(7) + " = ")) f.push("quelle nennt nicht „BREITE " + st.kriterium.slice(7) + " = …“"); }
        else if (k && !String(k.staffel).includes(st.quelle)) f.push("quelle steht nicht wörtlich in der Staffel");
        else if (k && !new RegExp("(^|\\s)" + st.staffel + " =").test(st.quelle)) f.push("quelle nennt nicht die Stufe " + st.staffel + " =");
        // EINE Station je Staffel und Gerät: eine Staffel trägt eine headless-Hälfte (befehl) und eine Karten-Hälfte (probe) —
        // die Buchung verlangt jede auf jedem ihrer Geräte (stufen); zwei auf demselben Gerät sind doppelt
        const doppelt = ge.filter((g) => gesehen.has(wer + "|" + g));
        if (doppelt.length) f.push("doppelt (auf " + doppelt.join("+") + ")");
        for (const g of ge) gesehen.add(wer + "|" + g);
        if (f.length) fehler.push(wer + ": " + f.join(" · "));
        else ok.push(st);
    }
    const kr = new Set(ok.map((s) => s.kriterium));
    for (const k of kr)
        if (!ok.some((s) => s.kriterium === k && s.staffel === 1)) fehler.push(k + ": keine Staffel-1-Station (eine 2 ohne 1 zählt nie)");
    fehler.push(...fahrtUrteil(ok));
    return { stationen: ok, fehler };
}
// DIE FAHRT einer Karte (c): die Läufe ihrer Sitzung (Zwillinge einmal, gruppiere) mit ihrem Deckel, die größten zuerst, und die
// Summe samt Boot (SITZUNG_BOOT_S) — die Wanduhr, die die Sitzung nie überschreiten kann, außer an der Grundstellung
function fahrtSumme(stationen, geraet) {
    const je = gruppiere(stationen.filter((st) => st.probe && geraeteVon(st).includes(geraet)))
        .map((g) => [g.map(schluessel).join("+"), probeSek(g[0], geraet) * teileVon(g[0])])
        .sort((a, b) => b[1] - a[1]);
    return { je, deckel: je.reduce((s, x) => s + x[1], 0), boot: SITZUNG_BOOT_S, summe: je.reduce((s, x) => s + x[1], 0) + SITZUNG_BOOT_S };
}
// DIE TEILE DER FAHRT (04.11., deckel-wurzel): jeder Teil ist eine Sitzung ≤ FAHRT_MAX_S samt eigenem Boot — die Deckel folgen dem Bedarf
// (eichTafel), was über einen Teil reicht, misst die Fortsetzung (fahreFortsetzung); ROT erst über FAHRT_TEILE_MAX Teilen
const FAHRT_TEILE_MAX = 3;
const fahrtTeile = (f) => Math.max(1, Math.ceil(f.deckel / (FAHRT_MAX_S - f.boot)));
function fahrtUrteil(stationen) {
    return GERAETE.filter((g) => g !== "headless").flatMap((g) => {
        const f = fahrtSumme(stationen, g);
        if (fahrtTeile(f) <= FAHRT_TEILE_MAX) return [];
        return [g + ": die Fahrt " + f.summe + " s in " + fahrtTeile(f) + " Teilen über " + FAHRT_TEILE_MAX + " × " + FAHRT_MAX_S + " s (Σ Deckel " + f.deckel + " s in " + f.je.length + " Läufen + Boot " + f.boot +
            " s) — die größten: " + f.je.slice(0, 3).map(([n, s]) => n + " " + s + " s").join(", ") +
            ((n) => (n > 3 ? " (" + n + " Läufe am Deckel " + f.je[0][1] + " s)" : ""))(f.je.filter((x) => x[1] === f.je[0][1]).length)];
    });
}

function ladeStationen(dir = path.join(DIR, "stationen"), teil = "liste") {
    const alle = [];
    for (const g of GRUPPEN) {
        const f = path.join(dir, g + ".js");
        if (!fs.existsSync(f)) continue;
        const m = require(f);
        if (!Array.isArray(m)) throw new Error(g + ".js exportiert keine Liste");
        if (m.fehlt != null && !Array.isArray(m.fehlt)) throw new Error(g + ".js: fehlt ist keine Liste");
        for (const st of teil === "fehlt" ? m.fehlt || [] : m) alle.push(st);
    }
    return alle;
}
// die Staffeln OHNE Werkzeug (module.exports.fehlt): beim Namen, mit Grund, nie zugleich eine fahrbare Station
function pruefeFehlt(fehlt, karte, stationen) {
    const fehler = [];
    const fahrbar = new Set(stationen.map(schluessel));
    const gesehen = new Set();
    for (const e of fehlt) {
        const wer = (e && e.kriterium) + "#" + (e && e.staffel);
        const f = [];
        if (!e || !karte.get(e.kriterium)) f.push("Kriterium unbekannt");
        if (!e || ![1, 2].includes(e.staffel)) f.push("staffel nicht 1|2");
        if (!e || e.befehl !== null) f.push("fehlt trägt befehl: null");
        if (!e || typeof e.grund !== "string" || e.grund.length < 8) f.push("grund fehlt");
        if (fahrbar.has(wer)) f.push("zugleich fahrbare Station");
        if (gesehen.has(wer)) f.push("doppelt");
        gesehen.add(wer);
        if (f.length) fehler.push("fehlt " + wer + ": " + f.join(" · "));
    }
    return fehler;
}
// DAS URTEIL EINER STATION über einen Lauf: { gruen, zahl, mass? | massFehler? } — oder { fehler } beim Namen (es warf, es ist ungültig).
// Das Maß (massDerStation, das Gesetz der Fremd-Last (2)) liest das Feld der Station über denselben Lauf, gelesen von fremdUrteil
function urteilVon(st, j, lauf) {
    try {
        const u = st.urteil(j, lauf);
        if (!u || typeof u.gruen !== "boolean" || typeof u.zahl !== "string" || !u.zahl) return { fehler: "Urteil ungültig (verlangt { gruen: bool, zahl: Text })" };
        return { gruen: u.gruen, zahl: u.zahl, ...massDerStation(st, j, lauf, u) };
    } catch (e) {
        return { fehler: "Urteil warf: " + String((e && e.message) || e).split("\n")[0] };
    }
}
// DAS MASS EINER STATION über denselben Lauf (st.mass, das Gesetz der Fremd-Last (2)): ein Feld NEBEN dem Urteil, nie im Abdruck — es
// ändert nicht, was die Station misst, nur wie die Maschine ihr ROT unter Last liest. Es wirft nie ins Urteil: ein Maß, das wirft, das
// keine Liste gibt, das schief ist oder unter einem GRÜN reißt (es widerspräche seinem Urteil — die Linse an JEDEM Lauf), zählt nicht
// und steht beim Namen (`massFehler`); unter Last bleibt ein ROT dann UNGEMESSEN
function massDerStation(st, j, lauf, u) {
    if (typeof st.mass !== "function") return {};
    let m;
    try {
        m = st.mass(j, lauf, st.urteil);
    } catch (e) {
        return { massFehler: "das Maß warf: " + String((e && e.message) || e).split("\n")[0].slice(0, 160) };
    }
    const fehl = massFehl({ gruen: u.gruen, mass: m });
    return fehl ? { massFehler: fehl } : { mass: massVon(m) };
}
// KEIN URTEIL (w4-sitzung-urteil; die Regel des Koordinators mit der Ratsche des Schöpfers — 3ed95dcf GTX: sechs Proben trugen als
// jüngste Messung ein „ROT“, das kein Urteil über das Spiel war: „kein K8 der Linse (Exit 2)“, „keine Art-Zeile oder kein Kern-Wechsel“,
// der Gang „Täter: Gang: Error: die Frist der Probe“, und die Buchung stand). Ein Lauf ohne Urteil ist kein frisches ROT, sondern
// UNGEMESSEN beim Namen (eintragen legt ihn nach m.ungemessen, der Grund wörtlich; die Ratsche hält ein gebuchtes GRÜN):
//   (a) die Urteils-Zeile fehlt — das Urteil der Station über den Lauf gleicht ihrem Urteil über den LEEREN Lauf (kein JSON, im stdout
//       nur der Zeuge der Karte, derselbe Exit, dieselbe Diagnose auf stderr): die Ausgabe trug nichts, was es las; darunter
//   (b) der Absturz ohne Zeile (Exit ≠ 0 oder ein Signal: die Linse warf vor ihrer Zeile) — derselbe Vergleich;
//   (c) die eigene Frist der Probe riss — die Marke ihres Läufers (FRIST_MARKE: stationen/seite.cjs, stationen/sitzung-seite.js).
// Ein echtes ROT — die Linse misst, das Maß reißt — bleibt ROT, ebenso ein kaputtes Urteil (es warf, es ist ungültig: laut, nie
// gehalten); über den leeren Lauf urteilt jede Station ROT (Selbsttest 1c), ein GRÜN ist darum nie „ohne Urteil“, außer an der Marke
// (c). Rückgabe der Grund beim Namen oder null.
//   (d) DER MESSORT (pm-fremdlast; Befund 08.11. schatten.K1#2 an a7a9d7bf und e475c6b4: der Schritt `buehne` der Folge — werkbank
//       umstellen — warf nach 2,2 s „Messort buehne: nach dem Wechsel steht die Seite nicht in pruefbuehne“, gebucht als ROT „Folge:
//       …werkbank.cjs:958:37“; in Ruhe GRÜN 0,96 cm/m, 44/44 Kanten): wirft das MESSGERÄT vor dem Urteil der Linse — ein `muss`-Schritt
//       der Folge, die Grundstellung, der Ortswechsel, die Seite, die nicht steht —, sagt sein Läufer es mit der EINEN Marke
//       MESSORT_MARKE (stationen/g3.js folge, stationen/proben-welt.cjs Tor, stationen/sitzung-seite.js Werkzeug, `grundstellung`
//       dieser Maschine): UNGEMESSEN „Messort: …“ beim Namen, auch über ein GRÜN (wie die Frist). ROT ist nur, was die Linse als
//       Zahl gegen ihr Soll urteilt.
const FRIST_MARKE = /^@@PUNKTE@@ FRIST (\d+(?:\.\d+)?) s der Probe gerissen\b/m;
const MESSORT_MARKE = /^@@PUNKTE@@ MESSORT (.+)$/m;
function keinUrteil(u, leer, stdout) {
    const f = FRIST_MARKE.exec(String(stdout || ""));
    if (f) return "Frist der Probe " + f[1] + " s gerissen";
    const mo = MESSORT_MARKE.exec(String(stdout || ""));
    if (mo) return "Messort: " + mo[1].trim().slice(0, 300);
    if (u.gruen || u.fehler || leer.fehler) return null;
    return leer.gruen === false && leer.zahl === u.zahl ? "die Urteils-Zeile fehlt" : null;
}
// DER LEERE LAUF (Selbsttest 1c, die Voraussetzung von keinUrteil): über einen Lauf ohne JSON und ohne Zeile — im stdout nur der Zeuge der
// Karte, Exit 0 · 1 · 2 oder ein Signal — urteilt jede Station ROT; ein GRÜN dort buchte eine Probe ohne Ausgabe, ein Wurf machte „kein
// Urteil“ blind. Rückgabe die Täter beim Namen
const leerUrteile = (stationen) => stationen.flatMap((st) => [0, 1, 2, null].flatMap((exit) => {
    const u = urteilVon(st, null, { exit, stdout: "[linse-gpu] nvidia/pascal", stderr: "" });
    return u.fehler || u.gruen ? [schluessel(st) + " Exit " + exit + ": " + (u.fehler || "GRÜN „" + u.zahl.slice(0, 80) + "“")] : [];
}));
// DIE PROBEN (`proben`): jede Station urteilt ihre Roh-Ausgaben, wie sie es sagt — Rückgabe die Abweichungen beim Namen
function probenUrteil(stationen) {
    const falsch = [];
    for (const st of stationen)
        for (const p of st.proben || []) {
            let u;
            try {
                // eine Rohdatei-Probe (j): das Urteil liest das JSON an {AUS} wie im Lauf (bauen.K1#2: ein Werk, das nicht steht, ROT)
                u = st.urteil(p.j || null, { exit: 0, stdout: p.stdout || "", stderr: "" });
            } catch (e) {
                u = { gruen: null, zahl: "Urteil warf: " + e.message };
            }
            if (!u || u.gruen !== p.gruen)
                falsch.push(schluessel(st) + " " + p.name + ": " + (u && u.gruen ? "GRÜN" : "ROT") + " statt " + (p.gruen ? "GRÜN" : "ROT") + " (" + (u ? u.zahl : "kein Urteil") + ")");
            // DIE ZAHL BEIM NAMEN (`zahl`, w17-siedlung-abnahme): eine Probe kann sagen, was ihre Zahl nennen muss — ein ROT, das den
            // Grund verschweigt („ohne Abnahme (Exit 0)" über einem geurteilten Schuss, siedlung.K4#2), ist eine falsche Probe
            else if (p.zahl && !p.zahl.test(String(u.zahl || "")))
                falsch.push(schluessel(st) + " " + p.name + ": die Zahl nennt nicht " + p.zahl + " (" + String(u.zahl || "").slice(-160) + ")");
            // DAS MASS (das Gesetz der Fremd-Last, massDerStation): das Feld der Station über dieselbe Probe — wohlgeformt, im Einklang mit
            // ihrem Urteil (nie ein reißendes Maß unter einem GRÜN), nie ein Wurf
            else if (typeof st.mass === "function") {
                const m = massDerStation(st, p.j || null, { exit: 0, stdout: p.stdout || "", stderr: "" }, u);
                if (m.massFehler) falsch.push(schluessel(st) + " " + p.name + ": " + m.massFehler);
            }
        }
    return falsch;
}
// der Fehler eines genannten Maßes oder null: eine Liste von Einträgen mit Wort, Wert (eine Zahl, NaN oder null, wo die Probe nichts maß),
// endlichem Soll, Richtung ≤|≥ und fest — und nie ein Maß, das reißt, unter einem GRÜN (es machte unter Last ein ROT, das in Ruhe GRÜN wäre)
function massFehl(u) {
    if (!Array.isArray(u.mass)) return "das Maß ist keine Liste";
    const schief = u.mass.filter((m) => !(m && typeof m.wort === "string" && m.wort && Number.isFinite(m.soll) && (typeof m.wert === "number" || m.wert == null) &&
        (m.richtung == null || m.richtung === "≤" || m.richtung === "≥") && (m.fest == null || m.fest === true) && (m.cpu == null || m.cpu === true) &&
        (m.ab == null || (Number.isFinite(m.ab) && m.wert == null && m.richtung !== "≥"))));
    if (schief.length) return "das Maß ist schief: " + JSON.stringify(schief[0]).slice(0, 160);
    const reisst = u.gruen ? massVon(u.mass).filter((m) => massReisst(m)) : [];
    return reisst.length ? "GRÜN mit reißendem Maß " + reisst.map((m) => m.wort + " " + (m.wert == null ? "≥ " + m.ab : m.wert) + " (Soll " + (m.richtung || "≤") + " " + m.soll + ")").join(" · ") : null;
}
// die Deckel-Tafel ohne Probe: eine fremde Karte, ein Eintrag ohne Probe-Station auf seiner Karte — beim Namen (kein toter Deckel)
function deckelWaisen(stationen, t = deckelVon()) {
    return Object.entries(t).flatMap(([g, je]) => !DECKEL_KARTEN.includes(g) ? ["deckel.json: die Karte " + g + " gibt es nicht (" + DECKEL_KARTEN.join(", ") + ")"]
        : Object.keys(je || {}).filter((id) => !stationen.some((st) => st.probe && schluessel(st) === id && geraeteVon(st).includes(g))).map((id) => "deckel.json: " + g + " " + id + " ohne Probe auf " + g));
}
function ladeGeprueft() {
    const karte = kriterienDerKarte();
    const r = pruefeStationen(ladeStationen(), karte);
    const fehlt = ladeStationen(undefined, "fehlt");
    return { ...r, fehlt, fehler: [...r.fehler, ...pruefeFehlt(fehlt, karte, r.stationen), ...deckelWaisen(r.stationen)] };
}

// ───────────────────────────────── Glob (R6) ─────────────────────────────────
function globRegex(g) {
    let r = "";
    for (let i = 0; i < g.length; i++) {
        const c = g[i];
        if (c === "*" && g[i + 1] === "*") {
            r += g[i + 2] === "/" ? "(?:.*/)?" : ".*";
            i += g[i + 2] === "/" ? 2 : 1;
        } else if (c === "*") r += "[^/]*";
        else if (c === "?") r += "[^/]";
        else r += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
    if (g.endsWith("/")) r += ".*";
    return new RegExp("^" + r + "$");
}
const trifftPfad = (datei, pfad) => pfad.some((g) => globRegex(g).test(datei));
// DIE WAND PFAD: die Globs der Station, die in `dateien` (git ls-tree am SHA) keine Datei treffen
const toteGlobs = (pfad, dateien) => pfad.filter((g) => { const re = globRegex(g); return !dateien.some((f) => re.test(f)); });
const pfadGrund = (tot, wo) => "pfad-Glob trifft " + wo + " keine Datei (R6 blind): " + tot.join(", ");

// ───────────────────────────────── Haken (die Wand HAKEN) ─────────────────────────────────
// DIE WAND HAKEN (w4-z140-rueckfall): eine Station ruft einen Haken der Seite (`window.__<name>(`), den weder das Spiel am Kopf
// (scripts/, stamm/, index.html) noch die Stationen selbst setzen. Befund GTX 1e90e7cd: haar.K1#1 und klang.K2#1 riefen
// `__tiereHalten`, das w4-mess-platz (31.10.) in `__halten` umbenannt hatte — die Szene warf, haar.K1 schoss zwei schwarze Bilder
// und hieß „bild.schwarz 1", als wäre es das Fell. Gesetzt heißt: `window.__x =` (auch `||=`, `??=`), ein Name im Installations-
// Verzeichnis einer Linse (`Object.entries({ … })` vor `window.__${…}`, ohne führende Striche) oder ein Schlüssel `__x:` der
// Stationen. Gerufen heißt: `window.__x(` ohne `?.`.
const HAKEN_SETZT = /window\.__([A-Za-z0-9_]+)\s*(?:\|\||\?\?)?=(?!=)/g;
const HAKEN_RUF = /window\.__([A-Za-z0-9_]+)\(/g;
function hakenGesetzt(texte) {
    const da = new Set();
    for (const t of texte) {
        for (const m of t.matchAll(HAKEN_SETZT)) da.add(m[1]);
        for (const m of t.matchAll(/(?:^|[{,\s])__([A-Za-z0-9_]+)\s*:/g)) da.add(m[1]);
        if (t.includes("window.__${"))
            for (const m of t.matchAll(/Object\.entries\(\{([^}]*)\}\)/g))
                for (const n of m[1].split(",")) if (/^\s*_*[A-Za-z0-9_]+\s*$/.test(n)) da.add(n.trim().replace(/^_+/, ""));
    }
    return da;
}
// je Station die gerufenen Haken, die niemand setzt: ["<id> ruft window.__x", …]; `text(st)` liefert ihren Quelltext samt Proben
const toteHaken = (stationen, da, text) =>
    stationen.flatMap((st) => [...new Set([...text(st).matchAll(HAKEN_RUF)].map((m) => m[1]))].filter((h) => !da.has(h)).map((h) => schluessel(st) + " ruft window.__" + h));
// DIE WAND EXPORT (w7-gesicht): eine Station liest ein Glied eines Werkzeugs des Spiels (`A = require("./scripts/<datei>")`, dann
// `A.<glied>`), das der Kopf nicht exportiert. Befund an 5fba36ea headless: mensch.K4#2 las `A.ladeWelt` aus
// scripts/diag-mensch-anatomie.cjs, das w4-stufen-gesetz (98177d01) als Export „ohne Leser" (git grep in main) gestrichen hatte —
// die Station endete an jedem Kopf seither „ohne Menge oder Gesicht" (TypeError), UNGEMESSEN statt beim Namen. Exportiert heißt
// `module.exports = { … }` oder `module.exports.<glied> =` der Datei am Kopf — ohne jeden Export ist das Modul leer (der Täter von
// 98177d01); ein Export als Ausdruck (`module.exports = f`) und eine Datei ohne Kopf-Stand misst die Wand nicht (die Wand PFAD
// nennt die fehlende Datei).
const REQ_SKRIPT = /([A-Za-z_$][\w$]*)\s*=\s*require\(\\*["'](\.\/scripts\/[^"'\\]+)\\*["']\)/g;
const toteExporte = (stationen, exporte, text) =>
    stationen.flatMap((st) => {
        const t = text(st);
        const aus = new Set();
        for (const m of t.matchAll(REQ_SKRIPT)) {
            const da = exporte(m[2].slice(2));
            const glied = new RegExp("(?<![\\w$.])" + m[1].replace(/\$/g, "\\$") + "\\.([A-Za-z_$][\\w$]*)", "g");
            if (da) for (const g of t.matchAll(glied)) if (!da.has(g[1])) aus.add(schluessel(st) + " liest " + m[1] + "." + g[1] + " aus " + m[2].slice(2));
        }
        return [...aus];
    });
// die Exporte einer Datei am Kopf (je Datei einmal gelesen): eine Menge der Namen, null ohne Export-Objekt
const exportVon = (text) => {
    if (text == null) return null;
    const da = new Set();
    for (const m of text.matchAll(/module\.exports\s*=\s*\{([^}]*)\}/g)) for (const n of m[1].split(",")) if (n.trim()) da.add(n.split(":")[0].trim());
    for (const m of text.matchAll(/module\.exports\.([A-Za-z_$][\w$]*)\s*=/g)) da.add(m[1]);
    return !da.size && /module\.exports\s*=(?!\s*\{)/.test(text) ? null : da;
};
function exporteAm(repo, kopf) {
    const memo = new Map();
    return (datei) => {
        if (!memo.has(datei)) {
            let t = null;
            try {
                t = git(["show", kopf + ":" + datei], repo);
            } catch (e) {}
            memo.set(datei, exportVon(t));
        }
        return memo.get(datei);
    };
}
// der Quelltext einer Station: ihr Eintrag (Befehl, Probe, env) samt jeder Datei, die er unter @KOORD@ oder {KOORD} nennt
function stationText(st) {
    let t = JSON.stringify(st, (k, v) => (typeof v === "function" ? String(v) : v));
    for (const m of t.matchAll(/(?:@KOORD@|\{KOORD\})\/([^"\s'\\]+\.(?:js|cjs))/g)) {
        const f = path.join(KOORD, m[1]);
        if (fs.existsSync(f)) t += "\n" + fs.readFileSync(f, "utf8");
    }
    return t;
}
// was am Kopf und in den Stationen gesetzt ist: das Spiel (scripts/, stamm/, index.html am SHA) und jede .js/.cjs der Stationen
// samt den Skripten ihrer Berichte (bericht/**/skripte)
function hakenAm(repo, kopf) {
    const spiel = git(["grep", "-h", "-F", "window.__", kopf, "--", "scripts", "stamm", "index.html"], repo);
    // die Linsen mit Installations-Verzeichnis ganz (ihr `Object.entries({ … })` steht über mehrere Zeilen)
    const verzeichnis = git(["grep", "-l", "-F", "window.__${", kopf, "--", "scripts", "stamm"], repo)
        .split(/\r?\n/)
        .filter(Boolean)
        .map((z) => git(["show", z], repo));
    const eigen = [DIR, path.join(DIR, "stationen")].flatMap((d) => fs.readdirSync(d).filter((n) => /\.c?js$/.test(n)).map((n) => fs.readFileSync(path.join(d, n), "utf8")));
    const skripte = [];
    const geh = (d, tiefe) => {
        for (const n of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) {
            const p = path.join(d, n.name);
            if (n.isDirectory() && tiefe < 3) geh(p, tiefe + 1);
            else if (n.isFile() && /\.c?js$/.test(n.name) && /[\\/]skripte[\\/]/.test(p)) skripte.push(fs.readFileSync(p, "utf8"));
        }
    };
    geh(path.join(KOORD, "bericht"), 0);
    return hakenGesetzt([spiel, ...verzeichnis, ...eigen, ...skripte]);
}

// ───────────────────────────────── Griffe (die Wand ANKER) ─────────────────────────────────
// DIE WAND ANKER (04.11.): eine Station greift in ein Werkzeug des Spiels — eine Deklaration der obersten Ebene (`tor.quelle`, `tor.dekl`,
// `H.quelle`, die Linse als Bibliothek `H.linse`, das JSON `seite` von werkbankLinse) und Text-Anker darin ([alt, neu], jeder genau
// einmal; dazu der Text einer Datei, `fs.readFileSync("scripts/…")`, an `split`/`replace`). Befund GTX 10770eb5 · 1e90e7cd · 5fba36ea ·
// 6a571e3b · 6d6a8336: lod.K3#1 stand seit w4-laub-karte (6df5c040, 31.10.) an jedem Kopf UNGEMESSEN — „ANKER fehlt in
// scripts/diag-foundry-impostor.cjs kleberProbe: const kr = [“, gesehen erst am Gerät, fünf Mess-Fahrten lang. Die Wand liest jeden
// Griff statisch aus dem Befehl der Station (acorn: Literale, Konstanten der umgebenden Rümpfe, ein Parameter von `.map` oder `for … of`
// über eine Liste, das Objekt `H.seite`) und urteilt ihn am Kopf; einen Griff, den sie nicht lesen kann, nennt sie beim Namen (blind
// ist nie still grün). Eine Station mit eigenem Griff trägt `griff(lies, acorn)` → [Fehler] (lod.K3#1: die Scheiben statt Anker).
// DAS BÜNDEL (09.11.): `tor.dekl(datei, namen, gestellt)` zieht die Liste MIT ihrem Abschluss (proben-welt.cjs `tor.buendel`) und
// deklariert ihn in `new Function`. Befund Radeon 3ccb8f55: fahrzeug.K2#1 UNGEMESSEN — „ReferenceError: urteil is not defined … at
// Object.wegenetzVerdict“: seit f18627146 riefen die Urteile der Fahr-Linse einen Helfer, den keine Liste nannte, gesehen erst am
// Gerät beim Ruf (fahrzeug.K2#1, fahrzeug.K3#2, fahrzeug.K4#1/#2). Die Wand ruft DIESELBE Funktion am Kopf und deklariert das Bündel
// (was die Station stellt, als Attrappe): braucht es einen Namen des Moduls (`require` …), fällt die Kette hier beim Namen.
const ACORN_O = { ecmaVersion: "latest", sourceType: "script", allowHashBang: true, allowReturnOutsideFunction: true };
const astKinder = (n) =>
    Object.keys(n)
        .filter((k) => k !== "type" && k !== "start" && k !== "end")
        .flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]]))
        .filter((c) => c && typeof c.type === "string");
const GRIFF_OBJEKTE = new Set(["tor", "H"]);
const musterNamen = (p) =>
    !p ? [] : p.type === "Identifier" ? [p.name] : p.type === "AssignmentPattern" ? musterNamen(p.left) : p.type === "RestElement" ? musterNamen(p.argument)
        : p.type === "ArrayPattern" ? p.elements.flatMap(musterNamen) : p.type === "ObjectPattern" ? p.properties.flatMap((q) => musterNamen(q.type === "RestElement" ? q.argument : q.value)) : [];
class GriffBlind extends Error {}
// das Bündel der Probe (dieselbe Funktion wie am Gerät) und die Attrappe für das, was die Station selbst stellt
const torBuendel = () => require(path.join(DIR, "stationen", "proben-welt.cjs")).sitzungTor().buendel;
const ATTRAPPE = new Proxy(function () {}, { get: (_z, k) => (k === Symbol.toPrimitive ? () => 0 : ATTRAPPE), apply: () => ATTRAPPE, construct: () => ATTRAPPE });
function griffeVon(st, acorn) {
    const griffe = [], blind = [];
    for (const a of befehlVon(st).filter((x) => typeof x === "string")) {
        let j;
        try {
            j = JSON.parse(a);
        } catch (_e) {
            j = undefined;
        }
        if (j !== undefined) {
            if (j && typeof j === "object" && j.seite && typeof j.seite === "object")
                for (const [k, v] of Object.entries(j.seite))
                    if (Array.isArray(v) && typeof v[0] === "string" && typeof v[1] === "string") griffe.push({ art: "dekl", datei: v[0], namen: [v[1]], anker: v[2] || [], wo: "seite." + k });
                    else blind.push("seite." + k + " ist kein [datei, name, anker]");
            continue;
        }
        let ast = null;
        for (const t of [a, "(" + a + ")"])
            try {
                ast = acorn.parse(t, ACORN_O);
                break;
            } catch (_e) {}
        if (!ast) continue;
        const eltern = new Map();
        const alle = [];
        (function geh(n, p) {
            eltern.set(n, p);
            alle.push(n);
            for (const c of astKinder(n)) geh(c, n);
        })(ast, null);
        const pfad = (n) => (n.type === "Identifier" ? n.name : n.type === "MemberExpression" && !n.computed ? (pfad(n.object) || "?") + "." + n.property.name : null);
        // die Zuweisungen `X.y = { … }` (H.seite)
        const zugewiesen = new Map(alle.filter((n) => n.type === "AssignmentExpression" && n.right.type === "ObjectExpression" && n.left.type === "MemberExpression").map((n) => [pfad(n.left), n.right]));
        const VIELE = Symbol("viele");
        const wert = (n) => {
            if (n.type === "Literal") return n.value;
            if (n.type === "TemplateLiteral" && !n.expressions.length) return n.quasis[0].value.cooked;
            if (n.type === "ArrayExpression") return n.elements.flatMap((e) => (e && e.type === "SpreadElement" ? wert(e.argument) : [wert(e)]));
            if (n.type === "BinaryExpression" && n.operator === "+") return wert(n.left) + wert(n.right);
            if (n.type === "Identifier") return name(n);
            if (n.type === "MemberExpression" && !n.computed) {
                const o = zugewiesen.get(pfad(n.object));
                const p = o && o.properties.find((q) => q.type === "Property" && !q.computed && (q.key.name || q.key.value) === n.property.name);
                if (p) return wert(p.value);
            }
            throw new GriffBlind(n.type + " „" + (pfad(n) || n.type) + "“");
        };
        const name = (n) => {
            for (let p = eltern.get(n), vor = n; p; vor = p, p = eltern.get(p)) {
                if (/Function/.test(p.type) && p.params.some((q) => q.type === "Identifier" && q.name === n.name)) {
                    const ruf = eltern.get(p);
                    if (ruf && ruf.type === "CallExpression" && ruf.arguments[0] === p && ruf.callee.type === "MemberExpression" && ruf.callee.property.name === "map" && p.params[0].name === n.name)
                        return { [VIELE]: wert(ruf.callee.object) };
                    throw new GriffBlind("Parameter „" + n.name + "“");
                }
                if (p.type === "ForOfStatement" && vor === p.body && p.left.type === "VariableDeclaration" && p.left.declarations[0].id.name === n.name) return { [VIELE]: wert(p.right) };
                const body = Array.isArray(p.body) ? p.body : null;
                if (body) {
                    const d = body
                        .filter((s) => s.type === "VariableDeclaration")
                        .flatMap((s) => s.declarations)
                        .filter((d) => d.id.type === "Identifier" && d.id.name === n.name && d.init);
                    const vorher = d.filter((x) => x.start < n.start);
                    if (d.length) return wert((vorher.length ? vorher : d)[(vorher.length ? vorher : d).length - 1].init);
                }
            }
            throw new GriffBlind("Name „" + n.name + "“");
        };
        const viele = (v) => (v && typeof v === "object" && VIELE in v ? v[VIELE] : [v]);
        const datei = (n) => {
            const d = wert(n);
            if (typeof d !== "string") throw new GriffBlind("die Datei ist kein Text");
            return d;
        };
        const ankerListe = (v) => {
            if (!Array.isArray(v) || !v.every((x) => Array.isArray(x) && x.length === 2 && typeof x[0] === "string" && typeof x[1] === "string")) throw new GriffBlind("die Anker sind keine Liste [alt, neu]");
            return v;
        };
        const texte = new Map(); // Name → Datei: `const X = fs.readFileSync("scripts/…")`
        for (const n of alle)
            if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && n.init.type === "CallExpression" && n.init.callee.type === "MemberExpression" && n.init.callee.property.name === "readFileSync" && n.init.arguments[0])
                try {
                    const d = wert(n.init.arguments[0]);
                    if (typeof d === "string" && /^scripts\//.test(d)) texte.set(n.id.name, d);
                } catch (_e) {}
        for (const n of alle) {
            if (n.type !== "CallExpression" || n.callee.type !== "MemberExpression" || n.callee.computed) continue;
            const was = n.callee.property.name, wem = n.callee.object;
            const wo = (pfad(n.callee) || was) + " @" + n.start;
            try {
                if (wem.type === "Identifier" && texte.has(wem.name) && (was === "split" || was === "replace") && n.arguments[0]) {
                    const a = wert(n.arguments[0]);
                    if (typeof a === "string") griffe.push({ art: "roh", datei: texte.get(wem.name), anker: [[a, a]], wo });
                    continue;
                }
                if (!(wem.type === "Identifier" && GRIFF_OBJEKTE.has(wem.name) && ["quelle", "dekl", "linse"].includes(was))) continue;
                if (n.arguments.length < 2 || n.arguments[0].type === "SpreadElement") continue; // `tor.quelle(...L.seite[k])`: das JSON `seite`
                const d = datei(n.arguments[0]);
                const nm = viele(wert(n.arguments[1])).flatMap((x) => (Array.isArray(x) ? x : [x]));
                if (!nm.length || nm.some((x) => typeof x !== "string")) throw new GriffBlind("die Namen sind kein Text");
                if (was === "linse") {
                    const o = n.arguments[2];
                    if (o && o.type !== "ObjectExpression") throw new GriffBlind("die Optionen der Linse sind kein Objekt");
                    const e = o && o.properties.find((q) => q.type === "Property" && !q.computed && (q.key.name || q.key.value) === "ersetze");
                    griffe.push({ art: "datei", datei: d, namen: nm, anker: e ? ankerListe(wert(e.value)) : [], wo });
                } else if (was === "dekl") {
                    // DAS BÜNDEL (`tor.dekl(datei, namen, gestellt)`): die Liste und was die Station selbst stellt — toteAnker urteilt seinen Abschluss
                    const gestellt = n.arguments[2] ? wert(n.arguments[2]) : [];
                    if (!Array.isArray(gestellt) || gestellt.some((x) => typeof x !== "string")) throw new GriffBlind("die gestellten Namen sind keine Liste von Texten");
                    griffe.push({ art: "dekl", datei: d, namen: nm, anker: [], buendel: gestellt, wo });
                } else griffe.push({ art: "dekl", datei: d, namen: nm, anker: was === "quelle" && n.arguments[2] && typeof wert(n.arguments[1]) === "string" ? ankerListe(wert(n.arguments[2])) : [], wo });
            } catch (e) {
                if (!(e instanceof GriffBlind)) throw e;
                blind.push(wo + ": " + e.message);
            }
        }
    }
    return { griffe, blind };
}
// je Station die Griffe, die am Kopf nicht stehen: ["<id>: <Grund>", …]; lies(datei) → Text am Kopf oder null
function toteAnker(stationen, lies, acorn) {
    const memo = new Map();
    const oben = (d) => {
        if (!memo.has(d)) {
            const t = lies(d);
            let top = null, fehler = null, ast = null;
            if (t != null)
                try {
                    top = new Map();
                    ast = acorn.parse(t, ACORN_O);
                    for (const n of ast.body) {
                        if (/Declaration$/.test(n.type) && n.id && n.type !== "VariableDeclaration") top.set(n.id.name, [n.start, n.end]);
                        if (n.type === "VariableDeclaration")
                            for (const x of n.declarations)
                                if (x.id.type === "Identifier") top.set(x.id.name, x.init ? [x.init.start, x.init.end] : [x.start, x.end]);
                                else for (const m of musterNamen(x.id)) top.set(m, [x.start, x.end]); // `const { a, b } = require(…)`
                    }
                } catch (e) {
                    fehler = e.message;
                }
            memo.set(d, { t, top, fehler, ast });
        }
        return memo.get(d);
    };
    const zaehle = (src, anker, wo, fe) => {
        for (const [a, b] of anker) {
            const n = src.split(a).length - 1;
            if (n !== 1) return void fe.add("Anker „" + a.slice(0, 70) + "“ steht " + n + "× in " + wo + " (Soll 1)");
            src = src.replace(a, () => b);
        }
    };
    const aus = [];
    for (const st of stationen) {
        const fe = new Set();
        let g;
        try {
            g = griffeVon(st, acorn);
        } catch (e) {
            g = { griffe: [], blind: ["unlesbar: " + e.message] };
        }
        for (const b of g.blind) fe.add("Griff nicht statisch lesbar (" + b + ") — die Wand ist dort blind");
        for (const x of g.griffe) {
            const d = oben(x.datei);
            if (d.t == null) fe.add(x.datei + " fehlt");
            else if (d.fehler) fe.add(x.datei + " unlesbar: " + d.fehler);
            else if (x.art === "roh") zaehle(d.t, x.anker, x.datei, fe);
            else {
                for (const n of x.namen) if (!d.top.has(n)) fe.add("liest " + n + " aus " + x.datei + " — keine Deklaration auf oberster Ebene");
                if (x.art === "datei") zaehle(d.t.replace(/\r\n/g, "\n"), x.anker, x.datei, fe);
                else if (x.anker.length && d.top.has(x.namen[0])) zaehle(d.t.slice(...d.top.get(x.namen[0])), x.anker, x.datei + " " + x.namen[0], fe);
                if (x.buendel && x.namen.every((n) => d.top.has(n)))
                    try {
                        new Function(...x.buendel, torBuendel()({ text: d.t, ast: d.ast }, x.namen, x.buendel, x.datei))(...x.buendel.map(() => ATTRAPPE));
                    } catch (e) {
                        fe.add("das Bündel " + x.namen.join(" · ") + " deklariert sich nicht — " + String((e && e.message) || e).slice(0, 400));
                    }
            }
        }
        if (typeof st.griff === "function") for (const f of st.griff(lies, acorn) || []) fe.add(f);
        for (const f of fe) aus.push(schluessel(st) + ": " + f);
    }
    return aus;
}
function ankerLeser(repo, kopf) {
    const memo = new Map();
    return (datei) => {
        if (!memo.has(datei)) {
            let t = null;
            try {
                t = git(["show", kopf + ":" + datei], repo);
            } catch (_e) {}
            memo.set(datei, t);
        }
        return memo.get(datei);
    };
}
const acornVon = (repo) => require(require.resolve("acorn", { paths: [repo] }));

// ───────────────────────────────── Zeuge der Karte (Wand GPU) ─────────────────────────────────
const ZEUGE_DATEI = path.join(DIR, "gpu-zeuge.cjs");
const KARTE = /^\[linse-gpu\] ((?:amd|nvidia|intel|apple|qualcomm|arm)\/\S+)/i;
const OHNE_KARTE = /^\[linse-gpu\] .*(swiftshader|llvmpipe|software|kein navigator\.gpu|kein Adapter|kein webgl2)/i;
// liest die Zeilen eines Laufs (stdout, stderr, Zeugen-Datei oder Roh-Ausgabe): { karte, fremd, nie }
function gpuZeuge(text) {
    const z = String(text || "").split(/\r?\n/);
    const karten = [...new Set(z.map((l) => (KARTE.exec(l) || [])[1]).filter(Boolean))];
    const fremd = [...new Set(z.filter((l) => OHNE_KARTE.test(l)).map((l) => l.slice(12).trim()))];
    const nie = new Set(z.filter((l) => /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/.test(l))).size; // je Linse EINE Zeile, wie oft gesammelt auch
    return { karte: karten.join(" ") || null, fremd: fremd.join(" ") || null, nie };
}
// null = die Linse zeichnete auf der Karte, sonst der Grund beim Namen
function gpuWand(z) {
    if (!z) return "kein Zeuge der Karte im Lauf";
    if (z.nie) return "die Linse zeichnet nie (welt-boot: das Rezept ist „null“, " + z.nie + "×)";
    if (z.fremd) return "eine Linse zeichnet ohne Karte ([linse-gpu] " + z.fremd + ")";
    if (!z.karte) return "keine Linse nennt eine Karte ([linse-gpu] <Hersteller>/…)";
    return null;
}

// ───────────────────────────────── git ─────────────────────────────────
// jeder git-Prozess dieser Maschine zählt (gitRufe): die Linse KOSTEN im Selbsttest liest die Zahl, nie eine Wanduhr
let gitRufe = 0;
function git(args, cwd, roh = false) {
    gitRufe++;
    const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 << 20 });
    if (r.status !== 0) throw new Error("git " + args.join(" ") + ": " + String(r.stderr || r.stdout).trim().split("\n")[0]);
    return roh ? r.stdout : r.stdout.trim();
}
// EIN Prozess für VIELE Objekte (cat-file --batch, diff-tree --stdin): die Namen über stdin, die Antwort als Bytes; ein Prozess, der
// seine Antwort nicht fasst (GIT_SAMMEL_MAX) oder fällt, wirft beim Namen — nie eine halbe Antwort
const GIT_SAMMEL_MAX = 1 << 30;
function gitMit(args, cwd, eingabe) {
    gitRufe++;
    const r = spawnSync("git", args, { cwd, input: eingabe, maxBuffer: GIT_SAMMEL_MAX });
    if (r.error || r.status !== 0) throw new Error("git " + args.slice(0, 3).join(" ") + ": " + String((r.error && r.error.message) || r.stderr || "Exit " + r.status).trim().split("\n")[0]);
    return r.stdout;
}
function spielRepo() {
    // git < 2.31 kennt --path-format nicht und gibt es als eigene Zeile zurück (OMEN: git 2.30): die letzte Zeile, gegen KOORD aufgelöst
    const common = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], KOORD).split(/\r?\n/).pop();
    return path.dirname(path.resolve(KOORD, common));
}
function voll(repo, sha) {
    try {
        return git(["rev-parse", "--verify", "--quiet", sha + "^{commit}"], repo);
    } catch (_e) {
        git(["fetch", "-q", "origin"], repo);
        return git(["rev-parse", "--verify", sha + "^{commit}"], repo);
    }
}

// ───────────────────────────────── Läufer ─────────────────────────────────
function findeBash() {
    if (process.env.PUNKTE_BASH) return process.env.PUNKTE_BASH;
    if (process.platform === "win32") {
        for (const p of ["C:/Program Files/Git/bin/bash.exe", "C:/Program Files/Git/usr/bin/bash.exe"]) if (fs.existsSync(p)) return p;
        return null; // nie die WSL-bash aus System32
    }
    return "bash";
}

// DAS PORT-BAND je Gerät und Bahn (26.10., Karte gpu-bahnen): {PORT} = Band-Anfang + 4. Die Stationen leiten aus {PORT} ab:
// −1 (Seite der Werkbank), +1 (Ofen, Wasser-Leben), +3 (KI), +10000 (tier-gang), +20000 (Werkbank oder save-server), +20001,
// +30000 (Kreatur-Linse) — jede Ableitung bleibt in den 10 Ports ihres Bands und seiner +10000-Spiegel. Bis dahin trug jede
// Station einen Port aus ihrer Stelle in der Liste: zwei Nachbarn hätten parallel kollidiert (wetter.K2#1 an 7710 sucht die Seite
// auf 7709), und ab Stelle 100 lief die Liste aus dem Block 7700–7799. headless nimmt die Bänder ab Basis, radeon|gtx ab Basis + 50.
const BAND = 10;
const MAX_BAHNEN = 5;
function portBand(basis, geraet, bahn) {
    const a = Number(basis) + (geraet === "headless" ? 0 : MAX_BAHNEN * BAND) + bahn * BAND;
    const alle = [0, 10000, 20000, 30000].flatMap((d) => Array.from({ length: BAND }, (_, i) => a + d + i));
    if (alle.includes(TABU_PORT)) throw new Error("Port-Band " + a + "–" + (a + BAND - 1) + " trifft " + TABU_PORT + " (--port-basis)");
    return { port: a + 4, alle };
}

// räumt jeden lauschenden Prozess auf den Ports (EIN netstat je Aufruf)
function portRaeumen(ports) {
    const ps = [].concat(ports || []).filter(Boolean).map(String);
    if (!ps.length) return;
    if (process.platform === "win32") {
        const r = spawnSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
        const pids = new Set();
        const re = new RegExp(":(" + ps.join("|") + ")$");
        for (const l of String(r.stdout || "").split(/\r?\n/)) {
            const s = l.trim().split(/\s+/);
            if (s.length >= 5 && /^(LISTEN|ABH)/i.test(s[3]) && re.test(s[1]) && s[4] !== "0") pids.add(s[4]);
        }
        for (const pid of pids) spawnSync("taskkill", ["/F", "/T", "/PID", pid], { encoding: "utf8" });
    } else spawnSync("sh", ["-c", "lsof -t -sTCP:LISTEN " + ps.map((p) => "-i tcp:" + p).join(" ") + " | xargs -r kill -9"], { encoding: "utf8" });
}

function baumTot(pid) {
    if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { encoding: "utf8" });
    else try { process.kill(-pid, "SIGKILL"); } catch (_e) { try { process.kill(pid, "SIGKILL"); } catch (_f) {} }
}

// {SEK} (w4-sitzung-urteil): der Deckel DIESES Laufs in s — die eigene Frist eines Proben-Läufers folgt ihm (seite.cjs, sitzung-seite.js:
// Deckel − 6 s), in der Sitzung, in der Eich-Fahrt (90 s) und am Rest der Fahrt. Bis dahin trug argv die Frist aus der Definition der
// Probe: ANKUNFT 84 s unter dem Deckel 10 s der Station, DORF 39 s unter 27 s — der Deckel tötete, ehe die Probe abbauen und schreiben
// konnte; die Eich-Fahrt (90 s) maß an der Frist der Definition (leib.K4: 27 s), nie den Bedarf.
const ersetze = (s, ctx) =>
    s.replace(/\{PORT\}/g, String(ctx.port)).replace(/\{AUS\}/g, ctx.aus).replace(/\{BAUM\}/g, ctx.baum).replace(/\{KOORD\}/g, ctx.koord)
        .replace(/\{SEK\}/g, String(ctx.sek));

// DIE EINE gpu-lauf.sh (26.10., Prüfung gpu-bahnen): run und Selbsttest fahren dieselbe Datei, die neben dieser Maschine
// (werkzeug/, mit gpu-schloss.sh); eine andere nur ausdrücklich per PUNKTE_GPU_LAUF, und dann prüft der Selbsttest sie. Bis dahin
// fuhr run die alte Ein-Platz-Fassung unter artifacts/profiband/werkzeug/, der Selbsttest die neue: drei Bahnen warteten still
// nacheinander und trugen trotzdem „2/3“.
const GPU_LAUF = process.env.PUNKTE_GPU_LAUF || path.join(DIR, "werkzeug", "gpu-lauf.sh");
// vor dem Schloss wacht gpu-lauf.sh selbst über das Warten (Frist ohne Nachtruhe, Exit 75) und meldet sich alle 60 s; schweigt es
// länger, hängt es — der Lauf fällt, die Station bleibt ungemessen
const SCHLOSS_STILL_S = 600;
const istZeit = (sts) => sts.some((st) => st.zeit === true);

// ───────────────────────── DER ZEUGE DER FREMD-LAST (pm-fremdlast) ─────────────────────────
// BEFUND 08.11. (Radeon): die Zug-Schlange fuhr lokal Statik und `playtest:fast`, während die Maschine Zeit-Stationen maß — ankunft.K2#1
// 11,64 s (in Ruhe 10,09 s), profiband.K1#1 wiese-ego-geht 83,7 ms (in Ruhe 66,9 ms); die Ratsche nahm gebuchte Punkte. DER ZEUGE trennt
// nach dem BAUM: alle FREMD_TAKT_MS liest er jeden Prozess des Rechners (Linux /proc; Windows EIN PowerShell-Lauf über Get-CimInstance
// Win32_Process) und rechnet den EIGENEN Baum (die Nachfahren dieses Läufers; ein Kind nur, wenn es nach seinem Vater entstand). Je Station
// (fahreGruppe) zählt er die CPU-Sekunden jedes FREMDEN Prozesses in ihrem Fenster, beim Namen (kurzName). DIE DIENER (FREMD_DIENER:
// Kernel, Compositor, Ton, der WMI-Wirt des Zeugen) und DIE GRUND-LAST DES GERÄTS (FREMD_GERAET: Defender, Dienst-Wirt, Such-Indexer, der
// Hersteller) stehen daneben. DER ZEUGE URTEILT NIE (11.11.): er nennt im Eintrag (`fremd`), WER die Last war — das Urteil spricht die
// REFERENZFAHRT (unten).
// DIE REFERENZFAHRT (w28-referenzfahrt, der Schöpfer 11.11.: „du killst dich selbst und Stück für Stück jeden anderen Prozess, um die Zeit
// zu erreichen, das ist nicht professionell. Wie in einer CNC eine schnelle Referenzfahrt, die wirklich nicht lange dauern darf, und von
// dort aus die Messung.“ — der Fall: OMEN 11.11., die Claude-App ~1 Kern (git.exe 16–23 CPU-s je Station), siedlung.K5#1 dreimal
// UNGEMESSEN „Fremd-Last: git.exe …“, obwohl 7 048 ms gegen ≤ 500 kein Kern erklärt). Bis heute warf die Maschine jedes ROT einer
// Zeit-Station über 0,30–0,50 fremden Kernen (eine Schwelle je Rechner, ein Effekt je Kern aus EINER ABAB-Eichung der Radeon, auf der
// OMEN nur genähert) — die Geräte mussten Ruhe herstellen. JETZT misst jede Zeit-Station ihre Umgebung SELBST: unmittelbar VOR und NACH
// ihr fährt die Maschine eine feste, deterministische Arbeit (referenzFahrt, je ≤ 1,5 s): (a) EIN Faden rechnet REFERENZ_RUNDEN Runden
// eines FNV-Hashes über einen festen Puffer (256 KB), (b) ALLE Kerne rechnen dasselbe gleichzeitig (worker_threads, je Kern einer, der
// langsamste zählt) — (a) sieht, ob die Last einen Kern frisst oder den Takt senkt, (b), ob sie die Maschine sättigt. DIE RUHE je Rechner
// und Umfeld (Sitzung · allein) ist keine Hand-Zahl: das untere Zehntel (p10, bei < 10 Fahrten der Bestwert) aller Referenzfahrten dieses
// Rechners in seiner Ablage (messung/referenz-<host>.json, referenzRuheAus), aufgefüllt zu Beginn jedes Laufs. DIE VERLANGSAMUNG des
// Laufs f = max über (a), (b) von max(vor, nach) ÷ Ruhe, für (a) zudem nie unter der Verdrängung Wanduhr ÷ Faden-CPU, nie unter 1 — die
// Verlangsamung, die die Umgebung der Station antat. Der Eintrag trägt
// `referenz: { vor, nach, ruhe, f, fEin, fAlle, schwankt, rechner, umfeld }`.
// DAS URTEIL (fremdUrteil, an der EINEN Stelle fahreGruppe, nur an `zeit: true` — Bild-, Zahl- und Verhaltens-Stationen fallen nie an Last):
//   f ≤ REFERENZ_RUHE_BAND → die Umgebung war ruhig: das Urteil der Station gilt wie gemessen (GRÜN, ROT, Abbruch).
//   f darüber → GRÜN gilt (Last macht nie schneller; „GRÜN trotz Last“ mit f und Namen im Grund). ROT mit einem Maß (st.mass, Richtung
//     „≤“ oder „≥“ — die Deklaration der Station, stationen/mass.cjs): entlastet = roh ÷ f („≥“: × f; `fest` bleibt roh) — reißt ein Maß
//     auch entlastet, ist ROT gültig („ROT trotz Last“, beide Zahlen); reißt es nur roh, steht es im Band: UNGEMESSEN „unscharf unter Last:
//     roh X, entlastet ≥ Y, Schwelle Z“. Schwankten vor und nach um mehr als REFERENZ_SCHWANKT (die Last kam oder ging), fährt fahreGruppe
//     die Station EINMAL sofort neu (nie eine mutierende Probe in derselben Welt) — das einzige, was dann noch Ruhe braucht. Ein ROT ohne
//     reißendes Maß, ohne Maß (`ohneMass`) oder nach einem Abbruch bleibt unter Last UNGEMESSEN beim Grund (der Abbruch vorn).
//   Fehlt die Referenz (ein Wurf der Fäden) oder lernt die Ruhe noch (unter REFERENZ_RUHE_MIN Fahrten dieses Rechners und Umfelds — ihr
//   Bestwert könnte selbst unter Last stehen), gilt GRÜN, ein ROT bleibt UNGEMESSEN beim Grund — nie ein Urteil ohne Maßstab.
//   DER STOSS (REFERENZ_STOSS_KERNE) und DIE KARTE (REFERENZ_KARTE_FAKTOR) unten heben f, wo die CPU-Fahrten allein zu wenig sähen.
// DAS BAND DER RUHE: die Referenz selbst streut — gemessen 12.11. 00:40 auf der Radeon (24 Kerne, `referenz --n 5` neben dem Koordinator
// und einem Selbsttest): max ÷ min − 1 Faden 9,7 %, alle Kerne 17,0 %, Wanduhr je Fahrt 555–611 ms; REFERENZ_RUHE_BAND 1,20 liegt darüber.
// Wärme und Turbo (die Fahrt nach einer schweren Station ist wärmer) zählen in f wie jede Verlangsamung — einseitig: nie ein falsches ROT.
// OFFEN: die GPU-Komponente — eine Referenz der Karte verlangte einen zweiten WebGL-Kontext neben der Welt der Sitzung; sie fehlt, eine
// Last allein auf der Karte (ein fremdes Spiel) sieht f nicht.
const FREMD_TAKT_MS = 2000;
const FREMD_FENSTER_S = 10;
const REFERENZ_RUNDEN = 1200;
const REFERENZ_RUHE_BAND = 1.2;
const REFERENZ_SCHWANKT = 0.25;
// DER TAKT-FAKTOR JE KARTE (probeSek: der Deckel ist eine Funktion des Geräts): die Radeon ist das Maß (1). Die GTX (OMEN) GEMESSEN aus
// allen Mess-Dateien am 10.11.: je Station, die beide Karten in der Sitzung mindestens zweimal maßen (60, die Radeon ≥ 5 s), der Median
// ihrer Sekunden GTX ÷ Radeon — Median 1,11, p75 1,38, p90 1,54; der Deckel nimmt das p90 (neun von zehn Proben tragen ihn)
const TAKT_KARTE = { radeon: { takt: 1 }, gtx: { takt: 1.54, taktMedian: 1.11, taktStationen: 60 } };
const taktVon = (geraet) => (TAKT_KARTE[geraet] && TAKT_KARTE[geraet].takt) || 1;
const FREMD_DIENER = /^(system|registry|memory compression|secure system|dwm\.exe|csrss\.exe|audiodg\.exe|wmiprvse\.exe|xorg|xwayland|gnome-shell|kwin_x11|kwin_wayland|pipewire|pulseaudio)$/i;
// DIE GRUND-LAST DES GERÄTS (oben, (1)): Windows (Defender, Dienst-Wirt, Such-Indexer samt seinen Hosts) und der Hersteller (HP Insights,
// OMEN Command Center und OmenCap — die OMEN 11.11. nach dem Windows-Update: OmenCap.exe 36–42 CPU-s je Station, Hersteller wie
// AppHelperCap). Die Hosts des Indexers gemessen an der OMEN 6aa7a5a6 nach dem Halt des HP-Dienstes: SearchProtocolHost 36 CPU-s und
// SearchIndexer 23 CPU-s neben leib.K4#2 — eine Klasse mit dem Indexer, der sie startet
const FREMD_GERAET = /^(msmpeng|mpdefendercoreservice|nissrv|svchost|searchindexer|searchprotocolhost|searchfilterhost|apphelpercap|diagscap|networkcap|sysinfocap|touchpointanalyticsclientservice|omencommandcenterbackground|omencap)\.exe$/i;
const fz1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace(".", ",");
const fz2 = (x) => (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");
// die gekürzte Kommandozeile: das Programm ohne Pfad, Pfad-Argumente auf ihre letzten zwei Glieder, lange Argumente gekappt, ≤ 90 Zeichen
function kurzName(argv) {
    const a = (Array.isArray(argv) ? argv : String(argv || "").match(/"[^"]*"|\S+/g) || []).map((x) => String(x).replace(/^"|"$/g, "")).filter(Boolean);
    if (!a.length) return "?";
    const glieder = (x) => x.split(/[\\/]/).filter(Boolean);
    const kurz = (t) => {
        const f = /^(--?[\w-]+=)(.*[\\/].*)$/.exec(t);
        if (f) return f[1] + glieder(f[2]).slice(-1).join("/");
        if (/[\\/]/.test(t) && !/\s/.test(t) && !/^-/.test(t)) return glieder(t).slice(-2).join("/");
        return t.length > 40 ? t.slice(0, 39) + "…" : t;
    };
    return [glieder(a[0]).pop() || a[0], ...a.slice(1).map(kurz)].join(" ").replace(/\s+/g, " ").slice(0, 90);
}
// der eigene Baum eines Schnappschusses: die Nachfahren der Wurzel, je Kind nur, wenn es nicht vor seinem Vater entstand
function eigenerBaum(p, wurzel) {
    const kinder = new Map();
    for (const [pid, x] of p) if (pid !== x.pp) (kinder.get(x.pp) || kinder.set(x.pp, []).get(x.pp)).push(pid);
    const eigen = new Set([wurzel]);
    const q = [wurzel];
    while (q.length) {
        const v = q.pop(), vs = p.get(v);
        for (const k of kinder.get(v) || []) {
            const ks = p.get(k);
            if (eigen.has(k) || (vs && ks && vs.start && ks.start && ks.start + 50 < vs.start)) continue;
            eigen.add(k);
            q.push(k);
        }
    }
    return eigen;
}
// DER LESER DES WINDOWS-ZEUGEN: die Zeilen des EINEN PowerShell-Laufs (T Zeit · P Prozess · C Kommandozeile eines neuen Prozesses ·
// E Ende des Takts) in Stücken, wie der Strom sie bringt → gib(S) je Takt. Rein: der Selbsttest (5f) speist ihn mit gesetzten Zeilen
function zeugenLeser(gib) {
    const cmd = new Map(); // pid:start → die gekürzte Kommandozeile
    let rest = "", S = null;
    return (d) => {
        rest += String(d);
        const z = rest.split(/\r?\n/);
        rest = z.pop();
        for (const l of z) {
            const f = l.split("\t");
            if (f[0] === "T") S = { t: Number(f[1]), p: new Map() };
            else if (f[0] === "P" && S) {
                const pid = Number(f[1]);
                if (pid === 0) continue; // das Leerlauf-Konto
                const x = { pp: Number(f[2]), cpu: Number(f[3]) / 1e7, start: Number(f[4]), name: f.slice(5).join("\t") };
                x.cmd = cmd.get(pid + ":" + x.start) || x.name;
                S.p.set(pid, x);
            } else if (f[0] === "C" && S) {
                const pid = Number(f[1]), x = S.p.get(pid);
                if (!x) continue;
                const c = f.slice(2).join(" ").trim();
                x.cmd = c ? kurzName(c) : x.name;
                cmd.set(pid + ":" + x.start, x.cmd);
            } else if (f[0] === "E" && S) (gib(S), (S = null));
        }
    };
}
// DIE QUELLE DES ZEUGEN je Plattform: Rückgabe { schnapp?() (synchron, Linux), start?(gib) (Windows: EIN PowerShell-Lauf, gib(S) je Takt),
// stop(), blind? } — ein Schnappschuss S = { t (ms), p: Map(pid → { pp, cpu (s), start (ms), name, cmd? }) }
function zeugenQuelle(taktMs) {
    if (process.platform === "linux") {
        let hz = 100, boot = 0;
        try {
            hz = Number(spawnSync("getconf", ["CLK_TCK"], { encoding: "utf8" }).stdout.trim()) || 100;
            boot = 1000 * Number((/^btime (\d+)$/m.exec(fs.readFileSync("/proc/stat", "utf8")) || [])[1]);
        } catch (e) {
            return { blind: "/proc nicht lesbar: " + e.message, stop() {} };
        }
        const cmd = new Map();
        return {
            schnapp() {
                const p = new Map();
                for (const d of fs.readdirSync("/proc")) {
                    if (!/^\d+$/.test(d)) continue;
                    let s;
                    try { s = fs.readFileSync("/proc/" + d + "/stat", "utf8"); } catch (_e) { continue; }
                    const r = s.lastIndexOf(")"), f = s.slice(r + 2).split(" "), pid = +d;
                    const x = { pp: +f[1], cpu: (+f[11] + +f[12]) / hz, start: boot + (+f[19] / hz) * 1000, name: s.slice(s.indexOf("(") + 1, r) };
                    const k = pid + ":" + Math.round(x.start);
                    if (!cmd.has(k)) {
                        let c = "";
                        try { c = fs.readFileSync("/proc/" + d + "/cmdline", "utf8"); } catch (_e) {}
                        // Chrome schreibt die Zeile seiner Kinder als EIN Feld mit Leerzeichen (setproctitle): dann wie unter Windows zerlegt
                        const t = c.split("\0").filter(Boolean);
                        cmd.set(k, t.length ? kurzName(t.length === 1 && /\s/.test(t[0]) ? t[0] : t) : "[" + x.name + "]");
                    }
                    x.cmd = cmd.get(k);
                    if (pid === 2 || x.pp === 2) x.diener = true; // kthreadd und seine Kernel-Fäden
                    p.set(pid, x);
                }
                return { t: Date.now(), p };
            },
            stop() {},
        };
    }
    if (process.platform === "win32") {
        const skript = [
            "$ErrorActionPreference = 'SilentlyContinue'",
            "[Console]::OutputEncoding = [Text.Encoding]::UTF8",
            "$gesehen = @{}",
            "while ($true) {",
            "  if (-not (Get-Process -Id " + process.pid + " -ErrorAction SilentlyContinue)) { exit 0 }",
            "  $sb = New-Object System.Text.StringBuilder",
            "  [void]$sb.Append(\"T`t\" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + \"`n\")",
            "  $neu = New-Object System.Collections.ArrayList",
            "  foreach ($p in (Get-CimInstance -ClassName Win32_Process -Property ProcessId,ParentProcessId,KernelModeTime,UserModeTime,CreationDate,Name)) {",
            "    $c = 0",
            "    if ($p.CreationDate) { $c = ([DateTimeOffset]$p.CreationDate).ToUnixTimeMilliseconds() }",
            "    $cpu = [uint64]$p.KernelModeTime + [uint64]$p.UserModeTime",
            "    [void]$sb.Append(\"P`t\" + $p.ProcessId + \"`t\" + $p.ParentProcessId + \"`t\" + $cpu + \"`t\" + $c + \"`t\" + $p.Name + \"`n\")",
            "    $k = [string]$p.ProcessId + ':' + $c",
            "    if (-not $gesehen.ContainsKey($k)) { $gesehen[$k] = 1; [void]$neu.Add($p.ProcessId) }",
            "  }",
            "  $alle = $neu.ToArray()",
            "  for ($i = 0; $i -lt $alle.Count; $i += 40) {",
            "    $f = ($alle[$i..([Math]::Min($i + 39, $alle.Count - 1))] | ForEach-Object { 'ProcessId=' + $_ }) -join ' OR '",
            "    foreach ($q in (Get-CimInstance -ClassName Win32_Process -Filter $f -Property ProcessId,CommandLine)) {",
            "      [void]$sb.Append(\"C`t\" + $q.ProcessId + \"`t\" + ([string]$q.CommandLine -replace \"[`t`r`n]\", ' ') + \"`n\")",
            "    }",
            "  }",
            "  [void]$sb.Append(\"E`n\")",
            "  [Console]::Out.Write($sb.ToString())",
            "  [Console]::Out.Flush()",
            "  Start-Sleep -Milliseconds " + Math.max(200, Math.round(taktMs)),
            "}",
        ].join("\n");
        let kind = null;
        return {
            start(gib, blind) {
                try {
                    kind = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", Buffer.from(skript, "utf16le").toString("base64")],
                        { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
                } catch (e) {
                    return blind("PowerShell startet nicht: " + e.message);
                }
                let err = "";
                kind.stdout.on("data", zeugenLeser(gib));
                kind.stderr.on("data", (d) => (err = (err + String(d)).slice(-400)));
                kind.on("error", (e) => blind("PowerShell: " + e.message));
                kind.on("exit", (c) => blind("PowerShell endete (Exit " + c + ")" + (err.trim() ? ": " + err.trim().split(/\r?\n/).pop() : "")));
                kind.unref();
                for (const s of [kind.stdout, kind.stderr]) if (s && s.unref) s.unref();
            },
            stop() {
                if (kind && kind.exitCode == null) try { kind.kill(); } catch (_e) {}
            },
        };
    }
    return { blind: "kein Zeuge auf " + process.platform + " (Linux: /proc, Windows: Get-CimInstance)", stop() {} };
}
// DER ZEUGE: o = { taktMs, wurzel (die PID des eigenen Baums), quelle (ersetzt zeugenQuelle — die Attrappen des Selbsttests) }.
// beginn() öffnet ein Fenster (die Station samt ihren Referenzfahrten), ende(f, marken) schließt es nach dem ersten Takt hinter seinem
// Ende und gibt den Bericht; marken { vor, nach, station: [t0, t1] } nennen die Spannen, deren fremde Kerne er einzeln ausweist
function fremdZeuge(o = {}) {
    const taktMs = o.taktMs || FREMD_TAKT_MS, wurzel = o.wurzel || process.pid;
    const q = o.quelle || zeugenQuelle(taktMs);
    const z = { blind: q.blind || null, letzter: null, offen: new Set(), warten: [], uhr: null, takte: 0 };
    const verarbeite = (S) => {
        if (!S.p.size) return; // ein leerer Takt bezeugt nichts — ein Fenster ohne Takt ist blind
        z.takte++;
        const eigen = eigenerBaum(S.p, wurzel);
        const art = (pid, x) => (eigen.has(pid) ? "eigen" : x.diener || FREMD_DIENER.test(x.name) ? "diener" : FREMD_GERAET.test(x.name) ? "geraet" : "fremd");
        for (const f of z.offen) {
            if (f.tA == null) f.tA = f.basis ? f.basis.t : S.t;
            let dF = 0;
            for (const [pid, x] of S.p) {
                const k = pid + ":" + Math.round(x.start);
                let a = f.erst.get(k);
                if (a === undefined) {
                    const b = f.basis && f.basis.p.get(pid);
                    a = b && Math.abs(b.start - x.start) < 50 ? b.cpu : x.start >= f.tA - 50 ? 0 : x.cpu;
                    f.erst.set(k, a);
                }
                const vor = f.letzt.has(k) ? f.letzt.get(k).cpu : a;
                const w = art(pid, x);
                f.letzt.set(k, { cpu: x.cpu, art: w, name: x.cmd || x.name });
                if (w === "fremd") dF += Math.max(0, x.cpu - vor);
            }
            f.reihe.push([S.t, dF]);
        }
        z.letzter = S;
        z.warten = z.warten.filter((w) => (S.t >= w.t ? (w.ja(), false) : true));
    };
    const blind = (grund) => {
        z.blind = z.blind || grund;
        for (const w of z.warten.splice(0)) w.ja();
    };
    if (!z.blind && q.start) q.start(verarbeite, blind);
    else if (!z.blind && q.schnapp) {
        verarbeite(q.schnapp());
        z.uhr = setInterval(() => verarbeite(q.schnapp()), taktMs);
        if (z.uhr.unref) z.uhr.unref();
    }
    // der Takt hinter t: Linux schnappt sofort, Windows wartet auf den nächsten Takt des Laufs (höchstens drei Takte, sonst blind)
    const nach = (t) => {
        if (z.blind || (z.letzter && z.letzter.t >= t)) return Promise.resolve();
        if (q.schnapp) return Promise.resolve(verarbeite(q.schnapp()));
        return new Promise((ja) => {
            const w = { t, ja };
            z.warten.push(w);
            setTimeout(() => (z.warten.includes(w) ? ((z.warten = z.warten.filter((x) => x !== w)), ja()) : null), 3 * taktMs + 2000);
        });
    };
    return {
        taktMs,
        // der erste Takt (oder blind): wer misst, lässt den Zeugen vorher einen Grund legen
        bereit: () => (z.blind || z.letzter ? Promise.resolve() : nach(Date.now())),
        beginn() {
            const f = { t0: Date.now(), basis: z.letzter, tA: null, erst: new Map(), letzt: new Map(), reihe: [] };
            if (f.basis) f.tA = f.basis.t;
            z.offen.add(f);
            return f;
        },
        async ende(f, marken) {
            const t1 = Date.now();
            if (z.offen.has(f)) await nach(t1);
            z.offen.delete(f);
            return fremdBericht(f, t1, taktMs, z.blind, marken);
        },
        stop() {
            clearInterval(z.uhr);
            q.stop();
        },
        get blind() { return z.blind; },
    };
}
// DER BERICHT eines Fensters: s (die Spanne der Takte), fremdS, kerne (Mittel), fensterKerne (das dichteste FREMD_FENSTER_S-Fenster),
// namen [[Name, CPU-s]] (die drei größten fremden), dienerS + diener (die zwei größten), geraetS + geraet (die Grund-Last des Geräts, die
// drei größten), eigenS, takte; mit marken die fremden Kerne je Spanne (`spannen`: vor und nach das Mittel der Takte, die die
// Referenzfahrt decken, station die Spitze eines Takts in der Station) — oder blind beim Grund
function fremdBericht(f, t1, taktMs, blindGrund, marken) {
    const r = f.reihe, tE = r.length ? r[r.length - 1][0] : null;
    if (!r.length || tE < t1 - 50 || !(tE > f.tA)) return { blind: blindGrund || (!r.length ? "kein Takt im Fenster" : "der letzte Takt liegt vor dem Ende der Station"), takte: r.length };
    const je = { fremd: new Map(), diener: new Map(), geraet: new Map(), eigen: 0 };
    for (const [k, x] of f.letzt) {
        const d = Math.max(0, x.cpu - f.erst.get(k));
        if (!(d > 0)) continue;
        if (x.art === "eigen") je.eigen += d;
        else je[x.art].set(x.name, (je[x.art].get(x.name) || 0) + d);
    }
    const sum = (m) => [...m.values()].reduce((a, b) => a + b, 0);
    const reihe = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, s]) => [n, +s.toFixed(2)]);
    const s = (tE - f.tA) / 1000, fremdS = sum(je.fremd);
    // das dichteste Fenster: n Takte ≈ FREMD_FENSTER_S, je Fenster die fremden Sekunden durch seine Spanne
    const n = Math.max(1, Math.round((FREMD_FENSTER_S * 1000) / taktMs));
    let fensterKerne = fremdS / s;
    if (r.length > n) {
        fensterKerne = 0;
        for (let i = n - 1; i < r.length; i++) {
            const t0 = i - n >= 0 ? r[i - n][0] : f.tA;
            let d = 0;
            for (let j = i - n + 1; j <= i; j++) d += r[j][1];
            if (r[i][0] > t0) fensterKerne = Math.max(fensterKerne, d / ((r[i][0] - t0) / 1000));
        }
    }
    // je Takt [von, bis, Kerne]; eine Spanne [a, b] liest die Takte, die sie schneiden
    const takte = r.map(([t, d], i) => [i ? r[i - 1][0] : f.tA, t, t > (i ? r[i - 1][0] : f.tA) ? d / ((t - (i ? r[i - 1][0] : f.tA)) / 1000) : 0]);
    const schnitt = (sp) => (Array.isArray(sp) ? takte.filter(([a, b]) => b > sp[0] && a < sp[1]) : []);
    const mittel = (sp) => { const x = schnitt(sp), dt = x.reduce((a, [v, b]) => a + (b - v), 0); return x.length && dt > 0 ? +(x.reduce((a, [v, b, k]) => a + k * (b - v), 0) / dt).toFixed(3) : null; }; // prettier-ignore
    const spitze = (sp) => { const x = schnitt(sp); return x.length ? +Math.max(...x.map(([, , k]) => k)).toFixed(3) : null; };
    const spannen = marken ? { vor: mittel(marken.vor), nach: mittel(marken.nach), station: spitze(marken.station) } : null;
    return { s: +s.toFixed(1), takte: r.length, fremdS: +fremdS.toFixed(2), kerne: +(fremdS / s).toFixed(3), fensterKerne: +fensterKerne.toFixed(3),
        namen: reihe(je.fremd).slice(0, 3), dienerS: +sum(je.diener).toFixed(2), diener: reihe(je.diener).slice(0, 2), geraetS: +sum(je.geraet).toFixed(2),
        geraet: reihe(je.geraet).slice(0, 3), eigenS: +je.eigen.toFixed(2), rechnerKerne: os.cpus().length, ...(spannen ? { spannen } : {}) };
}
const fremdNamen = (b) => (b.namen || []).slice(0, 3).map(([n, s]) => n + " " + fz1(s) + " CPU-s").join(" · ");
// ein Wert beim Namen: höchstens vier geltende Ziffern, Komma
const fzW = (x) => String(+Number(x).toPrecision(4)).replace(".", ",");
// DAS MASS EINES ERGEBNISSES (urteilVon trägt es, fremdUrteil liest es): Einträge mit Wort, endlichem Soll und der Richtung „≤“ (Vorgabe)
// oder „≥“, dazu ENTWEDER ein endlicher Wert ODER — DAS AUSGEBLIEBENE EREIGNIS (die OMEN 11.11.: siedlung.K5#1 „nH 300 erstes Haus nach —
// (kein Haus)“ fiel als „Bedingung ohne Zahl“ UNGEMESSEN, das härteste ROT) — `ab`: das Ereignis kam bis ab nicht, sein Wert ist ≥ ab
// (nur an „≤“); ein Wert, den die Probe nicht maß (NaN, „?“, ohne ab), ist kein Maß. `fest` (Befehle, Dreiecke, Kopien, Minuten am Stück)
// teilt keine Last; `cpu` (an einer GPU-Station) sagt: dieses Maß bindet die CPU, nie die Karte (unten, REFERENZ_KARTE_FAKTOR)
const massVon = (m) => (Array.isArray(m) ? m.filter((x) => x && typeof x.wort === "string" && Number.isFinite(x.soll) && (x.richtung == null || x.richtung === "≤" || x.richtung === "≥") &&
    (Number.isFinite(x.wert) || (x.richtung !== "≥" && Number.isFinite(x.ab))))
    .map((x) => ({ wort: x.wort, wert: Number.isFinite(x.wert) ? x.wert : null, ...(Number.isFinite(x.wert) ? {} : { ab: x.ab }), soll: x.soll,
        ...(x.richtung === "≥" ? { richtung: "≥" } : {}), ...(x.fest === true ? { fest: true } : {}), ...(x.cpu === true ? { cpu: true } : {}) })) : []);
const massRoh = (m) => (m.wert == null ? m.ab : m.wert);
const massReisst = (m, w = massRoh(m)) => (m.richtung === "≥" ? w < m.soll : w > m.soll);
// ───────────────────────── DIE REFERENZFAHRT (w28-referenzfahrt; das Gesetz oben) ─────────────────────────
// DIE ARBEIT: je Faden ein fester Puffer (2^16 Wörter) und REFERENZ_RUNDEN Runden FNV-1a darüber; alle Fäden starten auf EIN Zeichen
// (bereit → los), jeder misst seine Schleife an der Wanduhr UND an der CPU-Zeit SEINES Fadens (process.threadCpuUsage); die Prüfsumme
// ist je Faden dieselbe (sonst rechnete nicht dieselbe Arbeit)
const REFERENZ_ARBEIT = [
    "const { parentPort, workerData } = require('worker_threads');",
    "const b = new Uint32Array(1 << 16); for (let i = 0; i < b.length; i++) b[i] = Math.imul(i, 2654435761) >>> 0;",
    "const cpu = () => { if (typeof process.threadCpuUsage !== 'function') return null; const c = process.threadCpuUsage(); return (c.user + c.system) / 1000; };",
    "parentPort.once('message', () => { const c0 = cpu(), t0 = performance.now(); let h = 2166136261;",
    "  for (let r = 0; r < workerData; r++) for (let i = 0; i < b.length; i++) { h = Math.imul(h ^ b[i], 16777619); b[i] = h >>> 0; }",
    "  const c1 = cpu(); parentPort.postMessage({ ms: performance.now() - t0, cpu: c0 == null || c1 == null ? null : c1 - c0, h: h >>> 0 }); });",
    "parentPort.postMessage('bereit');",
].join("\n");
// n Fäden zugleich → { ms (der langsamste), cpu (seine Faden-CPU in ms oder null), h } oder ein Wurf beim Namen (Frist 15 s, ungleiche Prüfsumme)
function referenzLauf(n, runden = REFERENZ_RUNDEN) {
    const { Worker } = require("worker_threads");
    return new Promise((ja, nein) => {
        const ws = [], erg = [];
        let bereit = 0, aus = false;
        const ende = (fn, x) => { if (aus) return; aus = true; clearTimeout(uhr); for (const w of ws) w.terminate().catch(() => {}); fn(x); }; // prettier-ignore
        const uhr = setTimeout(() => ende(nein, new Error("die Referenzfahrt riss ihre Frist (15 s)")), 15000);
        for (let i = 0; i < n; i++) {
            const w = new Worker(REFERENZ_ARBEIT, { eval: true, workerData: runden });
            ws.push(w);
            w.on("error", (e) => ende(nein, e));
            w.on("message", (m) => {
                if (m === "bereit") { if (++bereit === n) for (const x of ws) x.postMessage("los"); return; } // prettier-ignore
                erg.push(m);
                if (erg.length < n) return;
                if (new Set(erg.map((x) => x.h)).size !== 1) return ende(nein, new Error("die Fäden rechneten verschieden (Prüfsummen " + [...new Set(erg.map((x) => x.h))].join(", ") + ")"));
                const lang = erg.reduce((a, x) => (x.ms > a.ms ? x : a));
                ende(ja, { ms: lang.ms, cpu: lang.cpu, h: erg[0].h });
            });
        }
    });
}
// EINE Fahrt: { ein, alle, cpuEin } in ms (ein Faden an Wanduhr und Faden-CPU, alle Kerne an der Wanduhr) — oder { fehler }
async function referenzFahrt() {
    try {
        const a = await referenzLauf(1), b = await referenzLauf(os.cpus().length);
        if (a.h !== b.h) return { fehler: "ein Faden und alle Kerne rechneten verschieden" };
        return { ein: +a.ms.toFixed(1), alle: +b.ms.toFixed(1), ...(Number.isFinite(a.cpu) ? { cpuEin: +a.cpu.toFixed(1) } : {}) };
    } catch (e) {
        return { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 160) };
    }
}
// DIE VERDRÄNGUNG OHNE GELERNTE RUHE (der Koordinator 12.11., Frage 2): Wanduhr ÷ Faden-CPU des einen Fadens ist der Anteil der Zeit, in
// der er nicht rechnen durfte — ein Maß, das keine Ruhe braucht. GEMESSEN 12.11. auf der Radeon (`tcpu`, je 5 Fahrten): ruhig-ish
// Wanduhr 111–152 ms bei CPU 110–156 ms (0,97–1,02), neben 3 Brennern 0,94–1,31, neben 23 Brennern 1,24–1,32 bei Wanduhr 196–226 ms. Es
// trägt NUR die Verdrängung: die CPU-Zeit selbst dehnt sich unter Last (der Zwilling eines Kerns, der Takt: 110 → 172 ms neben 23
// Brennern), und Windows zählt Faden-CPU in Schritten von 15,6 ms. Am echten Werkzeug (`referenz --n 5` ruhig-ish, dann neben 3 Brennern):
// Faden 112–181 ms bei CPU 110–172 ms; neben den Brennern verdrängt 1–1,235, f gegen die Ruhe der ersten fünf 1,146–1,612. Darum ist es eine UNTERE Schranke des Faden-f, die keine Ruhe braucht:
// f Faden = max(gelernte Wanduhr ÷ Ruhe, Wanduhr ÷ (CPU + ein Schritt)). Für alle Kerne trägt es nicht (24 Fäden verdrängen einander
// selbst: ruhig-ish 2,0–2,7) — dort bleibt die gelernte Ruhe allein.
const REFERENZ_CPU_SCHRITT_MS = process.platform === "win32" ? 15.6 : 1;
const verdraengung = (w) => (w && Number.isFinite(w.cpuEin) && w.cpuEin > 0 ? w.ein / (w.cpuEin + REFERENZ_CPU_SCHRITT_MS) : 1);
// DER RECHNER der Referenz (Plattform, Kerne, CPU) — die Ruhe gilt je Rechner und Umfeld
const REFERENZ_RECHNER = process.platform + " · " + os.cpus().length + " Kerne · " + String((os.cpus()[0] || {}).model || "?").trim();
const REFERENZ_RUHE_TAGE = 14;
const REFERENZ_RUHE_MIN = 10;
const REFERENZ_ABLAGE_MAX = 600;
// DIE RUHE (keine Hand-Zahl): je Komponente das untere Zehntel (p10; bei < 10 Werten der Bestwert) aller Fahrten dieses Rechners und
// Umfelds der letzten REFERENZ_RUHE_TAGE Tage; `von` nennt das Datum der Fahrt, die die Ruhe setzt. werte = [{ ein, alle, zeit }]
function referenzRuheAus(werte, jetzt = Date.now()) {
    const frisch = werte.filter((w) => w && Number.isFinite(w.ein) && Number.isFinite(w.alle) && !(Date.parse(w.zeit) < jetzt - REFERENZ_RUHE_TAGE * 864e5));
    if (!frisch.length) return null;
    const unten = (k) => { const x = [...frisch].sort((a, b) => a[k] - b[k]); return x[x.length >= 10 ? Math.floor(0.1 * (x.length - 1)) : 0]; }; // prettier-ignore
    const e = unten("ein"), a = unten("alle");
    return { ein: e.ein, alle: a.alle, n: frisch.length, von: String(e.zeit || "").slice(0, 10) };
}
// DIE ABLAGE DER FAHRTEN (der Koordinator 12.11., Frage 1 und 3: die Ruhe lernte nur aus den Einträgen der Mess-Dateien — fünf Zeit-
// Stationen je Gerät, bis ein ROT urteilte; Kandidaten-Dateien, die aus dem Mess-Baum wandern, nahmen ihre Fahrten mit): EINE Quelle,
// messung/referenz-<host>.json — { rechner, fahrten: [{ umfeld, ein, alle, cpuEin?, zeit }] }, je Rechner seine eigene Datei (zwei Geräte
// schreiben nie in dieselbe), die jüngsten REFERENZ_ABLAGE_MAX. Jede Fahrt jeder Station und jede von Hand (`referenz --n`) geht hinein;
// der Pool liest NUR die Ablagen (alle Dateien referenz-*.json, je Rechner und Umfeld) — der `referenz`-Vermerk im Eintrag ist Bericht,
// nie Quelle. DIE AUFFÜLLUNG: `run` fährt vor der ersten Station (allein) und `fahreSitzung` nach dem Start der Welt (sitzung) so viele
// Fahrten nach, bis REFERENZ_RUHE_MIN frische im Pool liegen (≤ 10 × 0,6 s) — die Ruhe steht in Sekunden, nie erst nach Stationen.
const referenzAblageVon = (mdir, host = os.hostname()) => path.join(mdir, "referenz-" + String(host).replace(/[^A-Za-z0-9_-]/g, "_") + ".json");
function referenzPoolLaden(mdir) {
    const pool = new Map();
    let dateien = [];
    try { dateien = fs.readdirSync(mdir).filter((f) => /^referenz-.+\.json$/.test(f)); } catch (_e) { dateien = []; } // prettier-ignore
    for (const f of dateien) {
        let a;
        try { a = JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")); } catch (_e) { continue; } // prettier-ignore
        for (const w of (a && a.rechner && Array.isArray(a.fahrten) ? a.fahrten : [])) {
            if (!w || !w.umfeld || !Number.isFinite(w.ein)) continue;
            const k = a.rechner + " | " + w.umfeld;
            if (!pool.has(k)) pool.set(k, []);
            pool.get(k).push(w);
        }
    }
    return pool;
}
// DIE REFERENZ DER MASCHINE: fahrt() · merke(umfeld, werte) legt Fahrten in Pool und Ablage · ruhe(umfeld, werte) merkt und gibt die Ruhe ·
// auffuellen(umfeld) fährt nach, bis REFERENZ_RUHE_MIN frische im Pool liegen (Rückgabe die Zahl der nachgefahrenen). o = { mdir, ablage,
// fahrt, rechner } — der Selbsttest stellt Ordner und Fahrt
function echteReferenz(o = {}) {
    const mdir = o.mdir || path.join(DIR, "messung"), ablage = o.ablage || referenzAblageVon(mdir), fahrt = o.fahrt || referenzFahrt, rechner = o.rechner || REFERENZ_RECHNER;
    let pool = null;
    const liste = (umfeld) => {
        if (!pool) pool = referenzPoolLaden(mdir);
        const k = rechner + " | " + umfeld;
        if (!pool.has(k)) pool.set(k, []);
        return pool.get(k);
    };
    const merke = (umfeld, werte) => {
        const zeit = new Date().toISOString(), neu = werte.filter((w) => w && Number.isFinite(w.ein)).map((w) => ({ umfeld, ein: w.ein, alle: w.alle, ...(Number.isFinite(w.cpuEin) ? { cpuEin: w.cpuEin } : {}), zeit }));
        if (!neu.length) return;
        liste(umfeld).push(...neu);
        let a = null;
        try { a = JSON.parse(fs.readFileSync(ablage, "utf8")); } catch (_e) { a = null; } // prettier-ignore
        const alt = a && a.rechner === rechner && Array.isArray(a.fahrten) ? a.fahrten : [];
        try {
            fs.mkdirSync(path.dirname(ablage), { recursive: true });
            fs.writeFileSync(ablage, JSON.stringify({ rechner, fahrten: [...alt, ...neu].slice(-REFERENZ_ABLAGE_MAX) }, null, 0) + "\n");
        } catch (e) {
            console.log("  REFERENZ die Ablage " + ablage + " nicht schreibbar: " + String((e && e.message) || e).split("\n")[0]);
        }
    };
    const frisch = (umfeld) => { const r = referenzRuheAus(liste(umfeld)); return r ? r.n : 0; }; // prettier-ignore
    return {
        fahrt,
        merke,
        ruhe(umfeld, werte) {
            merke(umfeld, werte);
            return referenzRuheAus(liste(umfeld));
        },
        async auffuellen(umfeld) {
            let n = 0;
            for (let i = 0; i < REFERENZ_RUHE_MIN && frisch(umfeld) < REFERENZ_RUHE_MIN; i++) {
                const x = await fahrt();
                if (x.fehler) return { n, fehler: x.fehler };
                merke(umfeld, [x]);
                n++;
            }
            return { n, im: frisch(umfeld) };
        },
    };
}
let referenzDerMaschine = null;
const maschinenReferenz = () => referenzDerMaschine || (referenzDerMaschine = echteReferenz());
// die stille Referenz des Selbsttests: jede Fahrt gleich der Ruhe (f = 1) — die Läufer-Fälle urteilen ihre Mechanik
const stilleReferenz = () => ({ fahrt: async () => ({ ein: 100, alle: 100 }), merke() {}, ruhe: () => ({ ein: 100, alle: 100, n: 99, von: "still" }), auffuellen: async () => ({ n: 0, im: 99 }) });
// die Auffüllung eines Laufs beim Namen (run, fahreSitzung)
async function referenzAuffuellen(umfeld) {
    const t = Date.now(), a = await maschinenReferenz().auffuellen(umfeld);
    if (a.n || a.fehler) console.log("  REFERENZ " + umfeld + ": " + a.n + " Fahrten nachgefahren in " + ((Date.now() - t) / 1000).toFixed(1) + " s" + (a.fehler ? " — Wurf: " + a.fehler : ", " + a.im + " im Pool"));
    return a;
}
// DER BERICHT der Referenz über eine Station: vor, nach, ruhe → f je Komponente (nie unter 1; der Faden zudem nie unter seiner
// Verdrängung), f das größere, schwankt (vor und nach weichen in einer Komponente um mehr als REFERENZ_SCHWANKT voneinander ab) — oder { fehler }
function referenzBericht(vor, nach, ruhe, umfeld) {
    const fehl = [vor, nach].find((x) => !x || x.fehler);
    if (fehl !== undefined) return { fehler: (fehl && fehl.fehler) || "keine Fahrt", umfeld, rechner: REFERENZ_RECHNER };
    if (!ruhe) return { fehler: "keine Ruhe des Rechners", vor, nach, umfeld, rechner: REFERENZ_RECHNER };
    // DIE RUHE LERNT (nur noch, wenn die Auffüllung warf): unter REFERENZ_RUHE_MIN Fahrten ist der Bestwert kein Maßstab — das Urteil gilt
    // wie ohne Referenz (GRÜN zählt, ROT UNGEMESSEN beim Grund)
    if (ruhe.n < REFERENZ_RUHE_MIN) return { fehler: "die Ruhe des Rechners lernt (" + ruhe.n + " von " + REFERENZ_RUHE_MIN + " Fahrten)", vor, nach, ruhe, umfeld, rechner: REFERENZ_RECHNER };
    const fK = (k) => Math.max(1, Math.max(vor[k], nach[k]) / ruhe[k]);
    const sK = (k) => Math.max(vor[k], nach[k]) / Math.min(vor[k], nach[k]) - 1;
    const vEin = Math.max(verdraengung(vor), verdraengung(nach));
    const fEin = +Math.max(fK("ein"), vEin).toFixed(3), fAlle = +fK("alle").toFixed(3);
    return { vor, nach, ruhe, f: Math.max(fEin, fAlle), fEin, fAlle, verdraengt: +Math.max(1, vEin).toFixed(3), schwankt: Math.max(sK("ein"), sK("alle")) > REFERENZ_SCHWANKT,
        rechner: REFERENZ_RECHNER, umfeld };
}
// DER STOSS (die OMEN 11.11., Falle 8): eine Last, die mitten in der Station kam und vor der Fahrt danach ging, sieht die Referenz nie —
// der Zeuge sieht sie: liegt die Spitze eines Takts IN der Station um mehr als REFERENZ_STOSS_KERNE über den fremden Kernen beider
// Fahrten, ist f mindestens die Teilung des Rechners in dieser Spitze: N Kerne (`rechnerKerne`), E eigene (eigenS ÷ s), F fremde →
// max((E + F) ÷ N, 1 + F ÷ N) — über N Kernen teilt der Planer gerecht, darunter nimmt jeder fremde Kern seinen Anteil (Zwilling eines
// Fadens, Takt). Gemessen 12.11. auf der Radeon (tore.K5#1 neben zwei fremden Chrome der Nachbar-Agenten): Spitze 11,15 Kerne, „1 + F“
// hätte f 12,15 gesetzt — jedes ROT dort UNGEMESSEN —, die Teilung setzt 1,46
const REFERENZ_STOSS_KERNE = 0.5;
const stossF = (b, F) => { const N = b.rechnerKerne || os.cpus().length, E = b.s > 0 ? (b.eigenS || 0) / b.s : 0; return +Math.max((E + F) / N, 1 + F / N).toFixed(3); }; // prettier-ignore
// DIE KARTE (Falle 2): die Referenz rechnet auf der CPU; ein fremder Klient der KARTE (der Compositor der App) teilt sie im Zeitscheiben-
// Takt und nimmt einem Bild höchstens seine Hälfte — an einer GPU-Station gilt unter Last für jedes Maß ohne `cpu` mindestens dieser Faktor
const REFERENZ_KARTE_FAKTOR = 2;
// DAS URTEIL über ein Ergebnis der Station st (fahreGruppe; das Gesetz oben): b der Bericht des Zeugen (wer die Last war), r der Bericht
// der Referenz. Jeder Eintrag einer Zeit-Station trägt beide (`fremd`, `referenz`); nur an `zeit: true` urteilt die Last
function fremdUrteil(st, e, b, r) {
    const mit = { ...e, fremd: b, ...(r ? { referenz: r } : {}) };
    if (st.zeit !== true || e.ungemessen) return mit;
    const sp = (!b.blind && b.spannen) || null, refK = sp ? Math.max(sp.vor || 0, sp.nach || 0) : 0;
    const stoss = sp && sp.vor != null && sp.nach != null && sp.station != null && sp.station > refK + REFERENZ_STOSS_KERNE ? stossF(b, sp.station) : null;
    const f = r && !r.fehler ? Math.max(r.f, stoss || 1) : null;
    if (f != null && f <= REFERENZ_RUHE_BAND) return mit;
    const namen = !b.blind && (b.namen || []).length ? " · fremd: " + fremdNamen(b) : "";
    const geraet = !b.blind && b.geraetS > 0 ? " · Gerät (Grund-Last, nie fremd) " + (b.geraet || []).map(([n, s]) => n + " " + fz1(s) + " CPU-s").join(" · ") : "";
    const was = f == null ? "Last ohne Referenz (" + ((r && r.fehler) || "keine Fahrt") + ")" + namen + geraet
        : "Last: Referenz f " + fzW(f) + " (Faden " + fzW(r.fEin) + " · alle Kerne " + fzW(r.fAlle) + (stoss && stoss > r.f ? " · Stoß in der Station " + fz2(sp.station) + " Kerne fremd → " + fzW(stoss) : "") +
            "; vor " + fzW(r.vor.ein) + "/" + fzW(r.vor.alle) + " ms, nach " + fzW(r.nach.ein) + "/" + fzW(r.nach.alle) + " ms, Ruhe " + fzW(r.ruhe.ein) + "/" + fzW(r.ruhe.alle) +
            " ms seit " + r.ruhe.von + ")" + namen + geraet;
    const ab = brachAb([e]);
    if (e.gruen === true && !ab) return { ...mit, grund: (e.grund ? e.grund + " · " : "") + "GRÜN trotz " + was };
    const ms = f != null && !ab ? massVon(e.mass) : [];
    // je Maß sein Teiler: f, an einer GPU-Station ohne `cpu` mindestens REFERENZ_KARTE_FAKTOR; `fest` teilt nie
    const fM = (m) => (m.fest ? 1 : st.gpu === true && !m.cpu ? Math.max(f, REFERENZ_KARTE_FAKTOR) : f);
    const entlastet = (m) => (m.richtung === "≥" ? massRoh(m) * fM(m) : massRoh(m) / fM(m));
    const roh = (m) => (m.wert == null ? "≥ " + fzW(m.ab) + " (ausgeblieben)" : fzW(m.wert));
    const nenn = (m) => m.wort + " roh " + roh(m) + (m.fest ? " (fest)" : ", entlastet " + (m.richtung === "≥" ? "≤ " : "≥ ") + fzW(entlastet(m)) + (fM(m) !== f ? " (÷ " + fzW(fM(m)) + ", Karte)" : "")) +
        ", Schwelle " + (m.richtung || "≤") + " " + fzW(m.soll);
    const reisst = ms.filter((m) => massReisst(m)), hart = reisst.filter((m) => massReisst(m, entlastet(m)));
    if (hart.length) return { ...mit, grund: (e.grund ? e.grund + " · " : "") + "ROT trotz " + was + " — auch entlastet: " + hart.slice(0, 3).map(nenn).join(" · ") };
    const warum = f == null || ab ? "" : reisst.length ? " — unscharf unter Last: " + reisst.slice(0, 3).map(nenn).join(" · ")
        : ms.length ? " — kein Maß reißt (" + ms.length + " gemessen): das ROT liegt in einer Bedingung ohne Zahl"
            : e.massFehler ? " — das Maß fehlt: " + e.massFehler : st.ohneMass ? " — ohne Maß: " + st.ohneMass
                : Array.isArray(e.mass) ? " — kein Maß gemessen (die Probe trug keine Zahl)" : " — die Station nennt kein Maß";
    const grund = (ab ? e.grund + " · " : "") + was + warum + " — kein Urteil, UNGEMESSEN (die Probe sah: " + String(e.zahl).slice(0, 240) + ")";
    // nur im Band, wenn die Last zwischen den Fahrten schwankte: EINE Wiederholung (fahreGruppe)
    return { ...mit, gruen: false, ungemessen: true, grund, zahl: grund, ...(reisst.length && !ab && r && r.schwankt ? { wiederholen: true } : {}) };
}
// der EINE Zeuge des Läufers (fahreGruppe öffnet je Station ein Fenster in ihm; `run` weckt ihn vor dem ersten Lauf)
let zeugeDerMaschine = null;
const maschinenZeuge = () => zeugeDerMaschine || (zeugeDerMaschine = fremdZeuge());
// der stille Zeuge des Selbsttests: jedes Fenster ohne Last (die Attrappen, das Gesetz und der Leser stehen in (5f) beim Namen)
const stillerZeuge = () => ({ taktMs: FREMD_TAKT_MS, bereit: async () => {}, beginn: () => ({}), stop() {}, blind: null,
    ende: async () => ({ s: 0, takte: 0, fremdS: 0, kerne: 0, fensterKerne: 0, namen: [], dienerS: 0, diener: [], geraetS: 0, geraet: [], eigenS: 0, still: true }) });
// DER ZEUGE ÜBER EINE SPANNE (`node punkte.cjs fremdlast [--sek 60] [--takt 2000]`): die fremden Kerne über --sek Sekunden beim Namen
async function fremdlastCli(o) {
    const sek = Number(o.sek) || 60, z = fremdZeuge({ taktMs: Number(o.takt) || FREMD_TAKT_MS });
    await z.bereit();
    const f = z.beginn();
    await warteMs(sek * 1000);
    const b = await z.ende(f);
    z.stop();
    if (b.blind) {
        console.log("FREMDLAST blind: " + b.blind);
        return 1;
    }
    console.log("FREMDLAST " + process.platform + " " + os.cpus().length + " Kerne · " + fz1(b.s) + " s · " + b.takte + " Takte · fremd Σ " + fz1(b.fremdS) + " CPU-s, Mittel " +
        fz2(b.kerne) + " Kerne, dichtestes " + FREMD_FENSTER_S + "-s-Fenster " + fz2(b.fensterKerne) + " Kerne · Diener " + fz1(b.dienerS) + " CPU-s · Gerät " +
        fz1(b.geraetS) + " CPU-s · eigen " + fz1(b.eigenS) + " CPU-s");
    for (const [n, s] of b.namen) console.log("  fremd  " + fz1(s).padStart(6) + " CPU-s  " + n);
    for (const [n, s] of b.diener) console.log("  Diener " + fz1(s).padStart(6) + " CPU-s  " + n);
    for (const [n, s] of b.geraet) console.log("  Gerät  " + fz1(s).padStart(6) + " CPU-s  " + n + " (Grund-Last, nie fremd)");
    console.log(JSON.stringify(b));
    return 0;
}
// DIE REFERENZFAHRT VON HAND (`node punkte.cjs referenz [--n 10] [--umfeld allein|sitzung]`): n Fahrten in die Ablage dieses Rechners
// (referenzAblageVon), je Wanduhr und Faden-CPU, die Streuung (max ÷ min − 1), die Ruhe des Pools danach und f je Fahrt gegen sie
async function referenzCli(o) {
    const n = Number(o.n) || 10, umfeld = o.umfeld || "allein", fahrten = [], ref = maschinenReferenz();
    for (let i = 0; i < n; i++) {
        const t = Date.now(), x = await referenzFahrt();
        if (x.fehler) {
            console.log("REFERENZ Fahrt " + (i + 1) + " warf: " + x.fehler);
            return 1;
        }
        ref.merke(umfeld, [x]);
        fahrten.push({ ...x, wandMs: Date.now() - t });
        console.log("  Fahrt " + (i + 1) + ": Faden " + fzW(x.ein) + " ms (CPU " + (x.cpuEin != null ? fzW(x.cpuEin) : "?") + " ms) · alle " + os.cpus().length + " Kerne " + fzW(x.alle) +
            " ms · Wanduhr " + (Date.now() - t) + " ms");
    }
    const ruhe = ref.ruhe(umfeld, []);
    const streu = (k) => Math.max(...fahrten.map((x) => x[k])) / Math.min(...fahrten.map((x) => x[k])) - 1;
    console.log("REFERENZ " + REFERENZ_RECHNER + " · " + n + " Fahrten in " + path.relative(KOORD, referenzAblageVon(path.join(DIR, "messung"))) + " · Streuung Faden " +
        fz1(100 * streu("ein")) + " %, alle " + fz1(100 * streu("alle")) + " % · Wanduhr max " + Math.max(...fahrten.map((x) => x.wandMs)) + " ms · Ruhe (" + umfeld + ") " +
        (ruhe ? fzW(ruhe.ein) + "/" + fzW(ruhe.alle) + " ms aus " + ruhe.n + " Fahrten seit " + ruhe.von : "keine"));
    for (const [i, x] of fahrten.entries()) {
        const r = referenzBericht(x, x, ruhe, umfeld);
        console.log("  Fahrt " + (i + 1) + (r.fehler ? " — " + r.fehler : " f " + fzW(r.f) + " (Faden " + fzW(r.fEin) + ", verdrängt " + fzW(r.verdraengt) + " · alle " + fzW(r.fAlle) + ")"));
    }
    return 0;
}
// fährt EINE Station; ctx = { baum, koord, port, band, aus, roh, geraet, bahn, plaetze, gpuLauf, bash, deckelMinS }
// Rückgabe { gruen, zahl, exit, minuten, grund?, ungemessen? } — ein Fehler, ein Absturz, ein Deckel ist ROT mit Grund, nie still;
// ein Schloss, das nie kam, und ein Lauf ohne Urteil (keinUrteil: die Zeile fehlt, die eigene Frist riss) sind ungemessen mit Grund.
function fahreStation(st, ctx) {
    return fahreGruppe([st], ctx).then((r) => r[0]);
}
// fährt den Befehl der ERSTEN Station EINMAL und urteilt jede Station der Gruppe über denselben Lauf — Zwillinge (gleicher
// Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) kosten nie zwei Läufe; Rückgabe je Station ein Ergebnis
// DAS WARTEN (27.10., Karte lange-stationen): `minuten` zählt ab dem Start, auch das Warten am Schloss (e7a28b06 Radeon: speicher.K2#1
// 29,51 min, davon 25,7 vor dem Schloss, die Vorfahrt des echt-Jobs); `warten` nennt die Minuten bis „gpu-lauf: Schloss …“ —
// die Arbeit der Station ist minuten − warten
// IN DER SITZUNG (ctx.sitzung = { log, zeuge }): die Probe läuft ohne Schloss (die Sitzung hält es ganz), ohne Port-Räumen (es
// tötete die Welt), unter ihrem eigenen Deckel probe.sek; der Zeuge ist der der Welt der Sitzung plus der eigene der Probe
// DIE WIEDERHOLUNG (die Referenzfahrt, fremdUrteil): steht ein Ergebnis im Band der Last, während vor und nach schwankten, fährt die
// Gruppe EINMAL sofort neu — nie eine mutierende Probe in derselben Welt (sie bleibt UNGEMESSEN beim Grund); die zweite Fahrt zählt,
// `wiederholt` nennt den Grund der ersten
async function fahreGruppe(sts, ctx) {
    const ohneW = (e) => { const x = { ...e }; delete x.wiederholen; return x; }; // prettier-ignore
    const erst = await fahreGruppeEinmal(sts, ctx);
    if (!erst.some((e) => e.wiederholen)) return erst;
    if (ctx.sitzung && mutiertVon(sts)) return erst.map((e) => (e.wiederholen ? { ...ohneW(e), grund: e.grund + " · keine Wiederholung: die Probe mutiert die Welt" } : e));
    const zweit = await fahreGruppeEinmal(sts, ctx);
    return zweit.map((e, i) => ({ ...ohneW(e), wiederholt: String(erst[i].grund || erst[i].zahl).slice(0, 400) }));
}
function fahreGruppeEinmal(sts, ctx) {
    const st = sts[0];
    const sitz = ctx.sitzung || null;
    let tSchloss = null, tEnde = null;
    // DER ZEUGE DER FREMD-LAST (fremdZeuge): das Fenster öffnet vor der Referenzfahrt und schließt nach der zweiten — JEDER Ausgang dieser
    // Stelle geht durch `ganz`, dort urteilt fremdUrteil (an `zeit: true`) und jeder Eintrag trägt den Bericht `fremd` (und `referenz`)
    const zeuge = ctx.zeuge || maschinenZeuge();
    const fenster = zeuge.beginn();
    // DIE REFERENZFAHRT (nur an einer Zeit-Gruppe): unmittelbar vor dem Start und nach dem Ende, die Spannen als Marken des Zeugen
    const ref = istZeit(sts) ? ctx.referenz || maschinenReferenz() : null, marken = {};
    const fahrt = (wo) => { const t = Date.now(); return ref.fahrt().then((x) => ((marken[wo] = [t, Date.now()]), x)); }; // prettier-ignore
    return (ref ? fahrt("vor") : Promise.resolve(null)).then((rVor) => new Promise((ganz0) => {
        const t0 = Date.now();
        // DIE SEKUNDEN DER PROBE (w4-sitzung-eichen): in der Sitzung trägt jedes Ergebnis `s`, vom Start bis zum Ende ihres Prozesses (nie
        // das Leerlaufen der Rohre danach) — die gemessene Zahl, die die Schätzung des Deckels ersetzt; `minuten` bleibt, wie es war
        // DIE TEILE (probe.teile, unten): `s` ist der längste Teil — das Gesetz der Probe gilt je Teil —, `teile` die Sekunden je Teil
        const teileN = (st.probe && st.probe.teile) || 1, teilS = [];
        const mitS = (e) => (!sitz ? e : teileN > 1 && teilS.length ? { ...e, s: Math.max(...teilS), teile: teilS }
            : { ...e, s: +(((tEnde || Date.now()) - t0) / 1000).toFixed(1) });
        let gegangen = false, kzLauf = null;
        const ganz = (es0) => {
            if (gegangen) return;
            gegangen = true;
            // KEIN STILLER RÜCKFALL: ein Eintrag mit Urteil, aber ohne Konsum-Menge (ein Lauf, der am Deckel fiel, ein Start, der warf)
            // nennt den Grund (`konsumFehlt`) — die Buchung zählt ihn beim Namen
            const es = es0.map((e) => (e.ungemessen || e.konsum || e.konsumFehlt ? e : { ...e, konsumFehlt: (kzLauf && kzLauf.konsumFehlt) || "der Lauf endete ohne Urteil seiner Linse (Deckel, Start, Wand)" }));
            const tStop = tEnde || Date.now();
            marken.station = [tSchloss || t0, tStop];
            (ref ? fahrt("nach") : Promise.resolve(null)).then((rNach) => zeuge.ende(fenster, ref ? marken : undefined).then((b) => {
                tEnde = tStop; // das Warten auf den Takt des Zeugen und die Fahrt danach zählen nie in die Sekunden der Probe
                const umfeld = sitz ? "sitzung" : "allein";
                const r = ref ? referenzBericht(rVor, rNach, rVor && rNach && !rVor.fehler && !rNach.fehler ? ref.ruhe(umfeld, [rVor, rNach]) : null, umfeld) : undefined;
                ganz0((tSchloss ? es.map((e) => ({ ...e, warten: +((tSchloss - t0) / 60000).toFixed(2) })) : es).map(mitS).map((e, i) => fremdUrteil(sts[i] || st, e, b, r)));
            }));
        };
        const min = () => +((Date.now() - t0) / 60000).toFixed(2);
        const fertig = (e) => ganz(sts.map(() => e));
        const rot = (grund, exit = null, zahl = "") => fertig({ gruen: false, zahl: zahl || grund, exit, minuten: min(), grund });
        // ein Lauf, der das Schloss nie bekam, ist KEINE Messung: ungemessen beim Grund (eintragen legt ihn nie nach m.je)
        const offen = (grund, exit = null) => fertig({ gruen: false, ungemessen: true, zahl: grund, exit, minuten: min(), grund });
        if (!!sitz !== !!st.probe) return rot(st.probe ? "eine Probe misst nur in der Sitzung (fahreSitzung)" : "ein befehl fährt nie in der Sitzung");
        // in der Sitzung DER EINE DECKEL der Probe je Teil: ihr Grund-Deckel (probeSek, bis dahin tötet nichts) oder ihr Anteil der Fahrt
        // (sitz.anteilS, fahreSitzung), das größere — gekappt am Rest der Fahrt (sitz.restS); die Leine (unten) tötet zwischen Grund und
        // Deckel nur die Stille
        const grundS = sitz ? grundDeckel(st, ctx.geraet) : null;
        const sitzDeckelS = sitz ? Math.max(grundS, Math.floor((sitz.anteilS || 0) / teileN)) : null;
        let fahrtKappt = !!sitz && sitz.restS != null && sitz.restS < sitzDeckelS;
        let deckelS = sitz ? (fahrtKappt ? Math.max(1, Math.floor(sitz.restS)) : sitzDeckelS) : Math.max(ctx.deckelMinS != null ? ctx.deckelMinS : 120, Math.ceil(st.minuten * 60 * 2));
        let argv = befehlVon(st).map((a) => ersetze(a, { ...ctx, sek: deckelS }));
        const env = { ...process.env };
        // die Werkbank der Bahn: wer sie ohne --port ruft, trifft die seines Bands (nie die 4490 einer Nachbar-Bahn)
        if (ctx.port) env.WERKBANK_PORT = String(ctx.port + 20000);
        // in der Sitzung: das Log der Welt (die Karte) und die Grundstellung als Befehl (`node "$PUNKTE_MASCHINE" grundstellung`:
        // eine Probe, die selbst mehrere frische Welten braucht — je nH, je Lauf —, holt sie so, nie mit eigenem Boot)
        // DER DECKEL DES LAUFS (PUNKTE_PROBE_DECKEL_S, w4-linsen-a): die eigene Frist einer Probe folgt ihm, nie dem `sek` der Station —
        // in der Eich-Fahrt (90 s) warf die Seite von halten.K1#2 jeden Takt nach 5 s (sek 10 − 6), Masse und Schneide trafen nie
        // (Radeon 379e5f56: „masse-traf, schneide-traf“, die Eich-Zahl zensiert)
        if (sitz) Object.assign(env, { PUNKTE_SITZUNG_LOG: sitz.log, PUNKTE_MASCHINE: __filename.split(path.sep).join("/"), PUNKTE_SITZUNG_GRUND: sitz.grund || "",
            PUNKTE_PROBE_DECKEL_S: String(deckelS), ...(sitz.strom ? { PUNKTE_SITZUNG_STROM: sitz.strom, PUNKTE_PROBE: sitz.probe } : {}) });
        // headless läuft ohne Karte: starteBrowser griffe lokal sonst die GPU (scripts/lib/software-gpu.cjs) — ohne Schloss
    if (!st.gpu) env.LINSE_GPU = "software";
    for (const [k, v] of Object.entries(st.env || {})) env[k] = ersetze(v, { ...ctx, sek: deckelS });
    if (!st.gpu && env.LINSE_GPU !== "software") return rot("headless verlangt LINSE_GPU=software — die Karte nur unter dem Schloss");
        let exe;
        if (argv[0] === "node") exe = process.execPath;
        else {
            exe = ctx.bash;
            if (!exe) return rot("keine Git-bash gefunden (PUNKTE_BASH)");
        }
        argv = argv.slice(1);
        const zeugeDatei = st.gpu ? ctx.aus + ".gpu-zeuge.txt" : null;
        // DAS SCHLOSS DES RECHNERS (27.10., Takt 8): headless fuhr in 3 Bahnen ohne Schloss neben den Zeit-Stationen der Radeon —
        // profiband.K4#1 84 Hänger statt 0 (607d0c73: max 67 ms), klang.K5#2 p95 0,26 statt 0,11 ms. Darum nimmt auch eine
        // headless-Station ihren Platz im Schloss: ein Zeit-Lauf misst allein auf dem RECHNER, nie nur auf der Karte; die Karte bleibt
        // ihr verwehrt (LINSE_GPU=software), der Zeuge gilt nur GPU-Stationen. Ohne gpuLauf (die Läufer des Selbsttests) läuft sie frei.
        const schloss = !sitz && (st.gpu || !!ctx.gpuLauf);
        if (schloss) {
            if (!ctx.gpuLauf || !fs.existsSync(ctx.gpuLauf)) return rot("gpu-lauf.sh fehlt — eine GPU-Station läuft nie ohne Schloss");
            if (!ctx.bash) return rot("keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh");
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet + "-" + ((ctx.bahn || 0) + 1), exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            // das Platz-Schloss: ein Zeit-Lauf nimmt alle Plätze, ein Bild-Lauf einen von N (N = 1: das Ein-Platz-Schloss)
            env.GPU_LAUF_ART = istZeit(sts) ? "zeit" : "bild";
            env.GPU_LAUF_PLAETZE = String(ctx.plaetze || 1);
        }
        if (st.gpu) {
            // der Zeuge der Karte in JEDEM node-Prozess der Station (die Werkbank schreibt in ihr eigenes Log)
            env.PUNKTE_GPU_ZEUGE = zeugeDatei;
            env.NODE_OPTIONS = ((env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim();
        }
        // DER ZEUGE DES KONSUMS (R6 nach Konsum, konsumAn) in JEDEM node-Prozess des Laufs; die Seite trägt ihn nur, wo kein Zeit-Urteil
        // fällt und die Welt dem Lauf allein gehört (nie in der Sitzung: ihre Welt misst auch Zeit-Proben)
        const konsumOrdner = konsumAn(env, ctx.aus + ".konsum", ctx.baum, !sitz && !istZeit(sts));
        // DER ZEUGE IST EIN LEBENSZEICHEN (11.11., Radeon unter Last: „Deckel 2 s gerissen: Stille seit 2 s nach 2 s“ an der lebenden Probe
        // des Selbsttests — der Zeuge lud 15 ms vor ihrer ersten Zeile, auf dem ausgelasteten Gerät ein Vielfaches): jedes Ereignis im
        // Ordner des Zeugen (`<id>.offen` beim Start eines node-Prozesses der Probe, noch einmal nach seinem Einhängen und vor seinem
        // Abschluss) zählt an der Leine wie eine Zeile der Probe — sein eigenes Einhängen und Abschließen ist nie die Stille, an der sie fällt
        let konsumWache = null;
        try { konsumWache = fs.watch(konsumOrdner, { persistent: false }, () => (tLeben = Date.now())); konsumWache.on("error", () => {}); } catch (_e) { konsumWache = null; }
        try { fs.rmSync(ctx.aus, { force: true }); } catch (_e) {}
        if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
        if (!sitz) portRaeumen(ctx.band || ctx.port);
        let out = "", err = "", tot = false;
        let kind;
        const kappe = (s, d) => (s.length + d.length > 4 << 20 ? (s + d).slice(-(4 << 20)) : s + d);
        // DIE UHR: der Deckel einer GPU-Station zählt ab dem Schloss (die Zeile „gpu-lauf: Schloss …“) und liegt HINTER dem von
        // gpu-lauf.sh, das selbst beendet und löst (trap); davor ist sie die Wache über ein schweigendes gpu-lauf.sh (Nachtruhe und
        // Frist zählt es selbst — eine feste Summe Deckel + Frist riss jeden Lauf, der über die Nacht wartete)
        const stillS = ctx.stillS || SCHLOSS_STILL_S;
        let uhr = null, amSchloss = !schloss;
        const stelle = (s) => { clearTimeout(uhr); const k = kind; uhr = setTimeout(() => { tot = true; baumTot(k.pid); }, s * 1000); };
        // DIE LEINE (in der Sitzung, je Teil ab tA): bis zum Grund-Deckel tötet nichts; danach fällt die Probe, wenn sie STILLE_S kein
        // Lebenszeichen gab (jede Ausgabe, tLeben) oder ihr Deckel (Anteil, Rest der Fahrt) reißt — `riss` nennt, woran
        const stilleS = (sitz && ctx.stilleS) || STILLE_S;
        let tLeben = 0, riss = null;
        const leine = (tA) => {
            clearTimeout(uhr);
            // DIE STILLE (10.11., Koordinator: „kein Lebenszeichen der Probe (Takt/Log), nicht kein Ergebnis in 90 s“): eine Zeile der Probe
            // ODER ein Bild ihrer Welt (der Zapfen der Sitzung brachte Bilder: die Probe treibt einen Loop — zwischen den Befehlen steht die
            // Welt) ist ein Lebenszeichen; eine Probe, die in der Seite rechnet und Bilder zeigt, schweigt nie
            const leben = Math.max(tLeben, (sitz && typeof sitz.lebt === "function" && sitz.lebt()) || 0);
            const k = kind, t = Date.now(), lauf = (t - tA) / 1000, still = (t - leben) / 1000;
            if (lauf >= deckelS || (lauf >= grundS && still >= stilleS)) {
                riss = lauf >= deckelS ? { art: "deckel" } : { art: "stille", still: +still.toFixed(1), lauf: +lauf.toFixed(1) };
                tot = true;
                return baumTot(k.pid);
            }
            const bis = Math.min(deckelS - lauf, Math.max(grundS - lauf, stilleS - still));
            uhr = setTimeout(() => leine(tA), Math.max(50, Math.ceil(bis * 1000)));
        };
        const lauscht = () => {
            if (amSchloss) return;
            if (/^gpu-lauf: Schloss /m.test(err) || /^gpu-lauf: Schloss /m.test(out)) { amSchloss = true; tSchloss = Date.now(); stelle(deckelS + 120); } else stelle(stillS);
        };
        // DIE TEILE EINER PROBE (w19-fahrt-ziel-2-pm, `probe.teile` N): ein Lauf, der mehr Wanduhr braucht als das Gesetz einer Probe
        // (fahrzeug.K2#1: Orte und Fahrt auf dem Wegenetz ~127 s auf der GTX gegen 45 s), fährt in bis zu N Teil-Proben in DERSELBEN
        // Welt — je Teil ein Prozess unter dem Deckel der Probe (die Leine je Teil, gekappt am Rest der Fahrt), mit PUNKTE_TEIL „i/N“ und
        // der Frist PUNKTE_TEIL_FRIST_S = derselbe EINE Deckel des Teils − FRIST_VORLAUF_S. Der
        // nächste Teil fährt nur, wenn der vorige mit Exit 0 `@@PUNKTE@@ TEIL WEITER` sagte; sonst urteilt die Station EINMAL über die
        // Ausgabe aller Teile (EIN Urteil, EIN Gesetz über den ganzen Lauf). Zwischen den Teilen nie eine Grundstellung: die Sitzung
        // sieht EINE Probe. Sagt der letzte Teil WEITER, reichten die Teile nicht — UNGEMESSEN beim Namen, nie still offen.
        let teil = 0;
        const starte = () => {
            teil++;
            const rest = teil > 1 && sitz && sitz.restS != null ? sitz.restS - (Date.now() - t0) / 1000 : Infinity;
            if (rest < deckelS) [fahrtKappt, deckelS] = [true, Math.max(1, Math.floor(rest))];
            if (teileN > 1) Object.assign(env, { PUNKTE_PROBE_DECKEL_S: String(deckelS), PUNKTE_TEIL: teil + "/" + teileN,
                PUNKTE_TEIL_FRIST_S: String(Math.max(1, deckelS - FRIST_VORLAUF_S)) });
            const tA = Date.now();
            let k, outTeil = "", tE = null, gemeldet = false;
            try {
                k = kind = spawn(exe, argv, { cwd: ctx.baum, env, windowsHide: true, detached: process.platform !== "win32" });
            } catch (e) {
                return rot("Start: " + e.message);
            }
            k.stdout.on("data", (d) => { tLeben = Date.now(); out = kappe(out, String(d)); outTeil = kappe(outTeil, String(d)); lauscht(); });
            k.stderr.on("data", (d) => { tLeben = Date.now(); err = kappe(err, String(d)); lauscht(); });
            if (sitz) ((tLeben = tA), leine(tA));
            else stelle(schloss ? stillS : deckelS);
            k.on("error", (e) => { clearTimeout(uhr); rot("Start: " + e.message); });
            // das Ende der Station ist das Ende ihres Prozesses, nie das Schließen der Rohre: ein Enkel, der sie erbt (der Herzschlag
            // `while sleep 300` in gpu-lauf.sh der OMEN), hielte "close" bis zu seinem Erwachen — 26.10.: jede GTX-Station dauerte
            // k × 5 min (fahrzeug.K3#1 5,02 gegen 1,07 auf der Radeon); nach "exit" bleiben den Rohren 2 s zum Leerlaufen
            const ende = (code, sig) => {
                tE = tEnde = tE || Date.now();
                if (gemeldet) return;
                gemeldet = true;
                k.stdout.destroy();
                k.stderr.destroy();
                teilS.push(+((tE - tA) / 1000).toFixed(1));
                const weiter = teileN > 1 && !tot && code === 0 && !sig && /^@@PUNKTE@@ TEIL WEITER$/m.test(outTeil);
                if (weiter && teil < teileN) return (clearTimeout(uhr), starte());
                abschluss(code, sig, weiter);
            };
            k.on("exit", (code, sig) => ((tE = tEnde = tE || Date.now()), setTimeout(() => ende(code, sig), 2000)));
            k.on("close", ende);
        };
        // DER KONSUM DES LAUFS, ehe die Ports fallen: jeder noch lebende Prozess schließt auf Zuruf ab (konsumSchliessen), in der
        // Sitzung dazu das Fenster der Welt (konsumNahme) und ihr Boot — gefaltet in jeden Eintrag des Laufs (`kz`)
        const abschluss = (code, sig, ohneEnde) => {
            clearTimeout(uhr);
            if (konsumWache) konsumWache.close();
            konsumDesLaufs(konsumOrdner, ctx.baum, tot ? null : sitz).then((kz) => urteile(code, sig, ohneEnde, kz));
        };
        const urteile = (code, sig, ohneEnde, kz) => {
            kzLauf = kz;
            if (!sitz) portRaeumen(ctx.band || ctx.port);
            // die Zeugen-Zeilen gehen in die Roh-Ausgabe (die Buchung liest sie dort), die Datei fällt; in der Sitzung zeugt die
            // Werkbank der Welt (ihr Zeuge zuerst), dazu jeder node-Prozess der Probe
            const zeugeText = (sitz && fs.existsSync(sitz.zeuge) ? fs.readFileSync(sitz.zeuge, "utf8") : "") +
                (zeugeDatei && fs.existsSync(zeugeDatei) ? fs.readFileSync(zeugeDatei, "utf8") : "");
            if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
            if (ctx.roh) {
                fs.mkdirSync(path.dirname(ctx.roh), { recursive: true });
                fs.writeFileSync(ctx.roh, "$ " + [exe, ...argv].join(" ") + "\n" + out + (err ? "\n--- stderr ---\n" + err : "") +
                    (zeugeText ? "\n--- gpu-zeuge ---\n" + zeugeText : ""));
            }
            if (tot && !amSchloss) return offen("GPU-Schloss nie bekommen: gpu-lauf.sh schwieg " + stillS + " s beim Warten — beendet, ungemessen", code);
            // der Deckel nennt, wobei er traf: die letzte Zeile der Ausgabe (vegetation.K5#1 hieß an 715754fc und 73bdf938 nur „Deckel 60 s
            // überschritten“ — ihr erster Schuss stand nach 51 s, der zweite trug den Deckel); in der Sitzung ebenso die Wache
            const zuletzt = String(out).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop();
            const wobei = zuletzt ? " (zuletzt: " + zuletzt.slice(0, 160) + ")" : "";
            // DIE WACHE DER FAHRT: in der Sitzung ist eine Probe an der Leine UNGEMESSEN beim Namen (sie misst nicht, was sie soll — nie ROT,
            // nie GRÜN): die Stille über ihrem Grund-Deckel, ihr Anteil der Fahrt, oder der Rest der Fahrt kappte sie (FAHRT_MAX_S)
            const imTeil = teileN > 1 ? " in Teil " + teil + "/" + teileN : "";
            if (tot && sitz) return offen((riss && riss.art === "stille" ? "Deckel " + grundS + " s gerissen: Stille seit " + riss.still + " s nach " + riss.lauf + " s (kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt)"
                : fahrtKappt ? "Deckel der Fahrt " + (sitz.fahrtMaxS || FAHRT_MAX_S) + " s gerissen nach " + deckelS + " s der Probe"
                    : "Deckel " + deckelS + " s gerissen" + (deckelS > grundS ? " (der Anteil der Fahrt, mit Lebenszeichen)" : "")) + imTeil + " — beendet, UNGEMESSEN" + wobei, code);
            if (ohneEnde) return offen("die Teile reichten nicht: Teil " + teil + "/" + teileN + " sagte WEITER — der Lauf ohne Ende, UNGEMESSEN" + wobei, code);
            if (tot) return rot("Deckel " + (schloss ? deckelS + 120 : deckelS) + " s überschritten — beendet" + wobei, code);
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (schloss && code === 75) return offen("GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen", code);
            if (schloss && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
            let j = null;
            if (fs.existsSync(ctx.aus))
                try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) { j = null; }
            const m = min();
            // DIE WAND GPU: ohne Zeugen der Karte ist das Urteil einer GPU-Station ROT beim Grund
            const zeuge = st.gpu ? gpuZeuge(zeugeText + "\n" + out + "\n" + err) : null;
            const wand = zeuge && gpuWand(zeuge);
            const gz = zeuge ? { gpu: zeuge.karte, ...(zeuge.fremd ? { gpuFremd: zeuge.fremd } : {}), ...(zeuge.nie ? { gpuNie: zeuge.nie } : {}) } : {};
            // die Zeugen-Zeilen sind Ausgabe der Station, auch aus Kindern mit eigenem Log (werkbank --eigen am werkbankTor seit
            // tk1-herde): das Urteil liest den Adapter wie die Wand GPU. Der LEERE Lauf (keinUrteil): derselbe Exit, derselbe Zeuge,
            // dieselbe Diagnose, kein JSON und keine Zeile. Ein Absturz (Signal) urteilt über das, was er schrieb — nie GRÜN
            const lauf = { exit: code, stdout: out + (zeugeText ? "\n" + zeugeText : ""), stderr: err };
            const leer = { exit: code, stdout: zeugeText, stderr: err };
            const absturz = sig ? "Absturz: Signal " + sig : null;
            // DER TÄTER eines Laufs ohne Urteil beim Namen: die Fehler-Zeile seines Läufers (seite.cjs, sitzung-seite.js, proben-welt.cjs),
            // sonst die letzte Zeile auf stderr, sonst die letzte der Ausgabe
            const letzte = (t) => String(t).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop();
            const taeter = (/^(?:@@PUNKTE@@ FEHLER|@@ PROBE-FEHLER|PROBE-FEHLER) .*$/m.exec(out) || [])[0] || letzte(err) || zuletzt;
            ganz(sts.map((s) => {
                const r = (grund) => ({ gruen: false, zahl: grund, exit: code, minuten: m, grund, ...gz });
                const u = urteilVon(s, j, lauf);
                const ohne = keinUrteil(u, urteilVon(s, null, leer), lauf.stdout);
                if (ohne) {
                    const grund = (absturz ? absturz + " — " : "") + ohne + " — kein Urteil, UNGEMESSEN (die Probe sah: " + String(u.fehler || u.zahl).slice(0, 240) + ")" +
                        (taeter ? " · Täter: " + taeter.slice(0, 300) : "");
                    return { ...r(grund), ungemessen: true };
                }
                if (u.fehler) return r(u.fehler);
                if (absturz) return r(absturz + " · " + u.zahl);
                if (wand) return { gruen: false, zahl: "Wand GPU: " + wand + " · " + u.zahl, exit: code, minuten: m, grund: "Wand GPU: " + wand, ...gz };
                return { gruen: u.gruen, zahl: u.zahl, exit: code, minuten: m, ...(u.gruen ? {} : { grund: "ROT: " + u.zahl }), ...(u.mass ? { mass: u.mass } : {}), ...(u.massFehler ? { massFehler: u.massFehler } : {}), ...gz };
            }).map((e) => (e.ungemessen ? e : { ...e, ...kz })));
        };
        starte();
    }));
}

function baumAmSha(repo, geraet, sha) {
    const baum = path.join(repo, ".claude", "worktrees", "punkte-" + geraet);
    if (!fs.existsSync(path.join(baum, ".git"))) {
        git(["worktree", "add", "--detach", baum, sha], repo);
    } else {
        git(["checkout", "-q", "--detach", "--force", sha], baum);
        git(["clean", "-fdq", "-e", "node_modules"], baum);
    }
    const ist = git(["rev-parse", "HEAD"], baum);
    if (ist !== sha) throw new Error("Spiel-Baum steht auf " + ist + " statt " + sha);
    const nm = path.join(baum, "node_modules");
    const ziel = path.join(repo, "node_modules");
    if (!fs.existsSync(ziel)) throw new Error("node_modules fehlt im Haupt-Klon " + ziel);
    if (!fs.existsSync(nm)) fs.symlinkSync(ziel, nm, "junction");
    return baum;
}

// DER HALTER EINER SPERRE IST pid + START, NIE DIE pid ALLEIN (11.11., Koordinator): das System vergibt eine freie Nummer neu. Die
// Sperre punkte-radeon hing 12:01–12:30 an pid 24876 — ihr Lauf fiel 12:07 am CI-Abbruch (taskkill, kein exit-Haken), ab 12:21 trug ein
// fremdes bash.exe die Nummer, und die Radeon wartete „belegt“ statt zu messen. Der Halter schrieb seine Marke NACH seinem Start: trägt
// die Nummer heute ein Prozess, der erst nach der Marke begann, ist der Halter tot. prozessStart: ms, null = kein Prozess, NaN =
// unlesbar (dann gilt er als lebend — eine lebende Sperre bricht nie an einer Frage ohne Antwort)
const START_SPIEL_MS = 2000; // Uhr des Dateisystems gegen die Uhr der Prozess-Tafel
function prozessStart(pid) {
    try { process.kill(pid, 0); } catch (e) { if (e.code !== "EPERM") return null; }
    try {
        if (process.platform === "win32") {
            const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
                "$p = Get-CimInstance -ClassName Win32_Process -Filter 'ProcessId=" + Number(pid) + "' -Property CreationDate; if ($p -and $p.CreationDate) { ([DateTimeOffset]$p.CreationDate).ToUnixTimeMilliseconds() } elseif ($p) { 'x' } else { 'tot' }"],
                { encoding: "utf8", windowsHide: true, timeout: 30000 });
            const t = String(r.stdout || "").trim();
            return t === "tot" ? null : /^\d+$/.test(t) ? Number(t) : NaN;
        }
        const s = fs.readFileSync("/proc/" + pid + "/stat", "utf8"), f = s.slice(s.lastIndexOf(")") + 2).split(" ");
        const hz = Number(spawnSync("getconf", ["CLK_TCK"], { encoding: "utf8" }).stdout.trim()) || 100;
        return 1000 * Number((/^btime (\d+)$/m.exec(fs.readFileSync("/proc/stat", "utf8")) || [])[1]) + (+f[19] / hz) * 1000;
    } catch (_e) {
        return NaN;
    }
}
// lebt der Halter, der seine Marke zur Zeit `marke` (ms) schrieb? `start` ist prozessStart(pid)
const halterLebt = (start, marke) => start != null && !(start > marke + START_SPIEL_MS);
// die Sperre des Spiel-Baums: ein Ordner mit der pid des Halters; ein toter Halter (halterLebt) gilt als verwaist, gelöst wird beim
// Prozess-Ende. `o` nur für den Selbsttest: startVon (statt prozessStart), wartMs, einmal (true: ein belegter Baum kehrt mit false heim)
async function baumSperre(repo, geraet, o = {}) {
    const sperre = path.join(repo, ".claude", "worktrees", "punkte-" + geraet + ".sperre");
    fs.mkdirSync(path.dirname(sperre), { recursive: true }); // ein frischer Klon trägt den Ordner noch nicht (sonst ENOENT vor dem ersten Baum)
    for (let gemeldet = false; ; ) {
        try {
            fs.mkdirSync(sperre);
            fs.writeFileSync(path.join(sperre, "pid"), String(process.pid));
            process.on("exit", () => fs.rmSync(sperre, { recursive: true, force: true }));
            return true;
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
            const datei = path.join(sperre, "pid"), da = fs.existsSync(datei);
            const pid = Number((da && fs.readFileSync(datei, "utf8")) || 0);
            // ein Ordner ohne Marke: sein Halter fiel zwischen Ordner und Marke — nach einer Minute verwaist
            if (!pid && Date.now() - fs.statSync(sperre).mtimeMs > 60000) { fs.rmSync(sperre, { recursive: true, force: true }); continue; }
            const start = pid ? (o.startVon || prozessStart)(pid) : NaN;
            if (pid && !halterLebt(start, fs.statSync(datei).mtimeMs)) {
                console.log("Punkte-Maschine: die Sperre des Spiel-Baums " + geraet + " ist verwaist (pid " + pid + (start == null ? " lebt nicht mehr" : " trägt heute ein Prozess, der " +
                    Math.round((start - fs.statSync(datei).mtimeMs) / 1000) + " s nach der Marke begann") + ") — gelöst");
                fs.rmSync(sperre, { recursive: true, force: true });
                continue;
            }
            if (o.einmal) return false;
            if (!gemeldet) { console.log("Punkte-Maschine: der Spiel-Baum " + geraet + " ist belegt (pid " + pid + "), warte"); gemeldet = true; }
            await new Promise((r) => setTimeout(r, o.wartMs || 30000));
        }
    }
}

// ───────────────────────────────── Sitzung ─────────────────────────────────
// DIE SITZUNG (29.10.; der Schöpfer: „eine Messung eines Teilsystems über 10 min heißt, man besichtigt fast alle Funktionen — die Welt
// ist in Sekunden geladen“): je Gerät und SHA EINE Welt — save-server {PORT} und `werkbank start --echt` {PORT}+20000 im Spiel-Baum
// des Geräts, gehalten vom Halter (`punkte.cjs halter`), daneben das GANZE Schloss (gpu-lauf.sh um den Schloss-Halter, zeit, die
// CI-Ruhe einmal; `schlossNehmen`) — und darin jede Station mit `probe` in der Reihe sitzungsReihe. DAS SCHLOSS ZWISCHEN DEN PROBEN
// (Karte w4-grundstellung): wartet ein CI-Job darauf (`ci_wartet`, gpu-schloss.sh), gibt die Sitzung es an der Proben-Grenze frei und
// nimmt es danach neu — die Welt bleibt warm, das Warten zählt nie in die Fahrt. Bis dahin hielt die Sitzung es bis 55 min am Stück.
// DIE GRUNDSTELLUNG OHNE NEULADEN (29.10., Karte w4-grundstellung; der Schöpfer: „Die Welt ist in wenigen Sekunden geladen — das
// Prüftheater hat ein Ende“): nach der Reihe `anfang` nimmt die Sitzung den GRUND der Welt (das Spiel: `_grundstellung`, das
// Speicher-Gesetz samt GRUND_TAFEL), nach jeder mutierenden Probe oder einem Abbruch spielt sie ihn in die laufende Seite zurück
// (sonst nie); Ring, Fern-Ring, Streu, Kronen, Leib und Shader bleiben warm. Bis dahin leerte sie den Spielstand (localStorage, die
// Welten der IndexedDB, die Stand-Dateien des save-servers) und lud die Seite neu — die nächste Probe baute ihren Ring neu (Radeon
// b3f9ae95 29.10.: ~45 s je Probe, die Fahrt ~4 h). DIE TAFEL DER GRUNDSTELLUNG, je Größe ihr Wort zurück:
//   der Stand (Speicher-Gesetz, `_standRueckspielen`): Spieler-Ort und Leben, Uhr, Saison, Wetter und Wetter-Wort, das worldMeta
//     (Taten, Erdbau, Orte, Siedlungen), die Edits (je Reichweite neu, der Faden bekommt die Liste), die Werke (je Id), die Säcke
//     (Baupläne, Stoffe, Werkzeuge je Glied), Inventar, Hotbar, Seele, Regler, Wesen samt Leichen, Pfeile, Tagebuch, Gesetze, DSL;
//   die GRUND_TAFEL des Spiels: Ritt (aussteigen), Sicht, Blick, Nässe und Wetter-Übergang, die Zellen des Brands;
//   GRUND_SEITE (hier): die Globalen der Werkbank an der Seite (`umstellen`: Ort-Takt, Stellgrößen, Bahn, Dorf-Zug) — was beim Grund
//     fehlte, fällt —, das Fenster 1920×1080 (`/fenster`);
//   die ZEICHENKETTE der Seite (hier, zeichnerKette): Renderer und seine Zeichen-Methoden, Post-Kette, `postProcessingFailed`, Gerät,
//     Faden und Sync-Stelle — vor und nach JEDER Probe gelesen; wer sie verändert ließ, ist ein Werkzeug-Bruch beim Namen;
//   nie zurück: die Welt-Uhr (`spielZeit`, monoton, feld.K2#2), die Würfe des Gesetzes (sie folgen dem Ort, speicher.K3), die Caches.
// Weicht nach dem Rückspielen eine Größe vom Grund ab, trägt die Welt nicht mehr: die übrigen Proben sind ungemessen beim Namen der
// Größe, nie ROT. Verließ eine Probe die Welt (ein Tor), kehrt die Seite durch die Tür des Spiels zurück (`_weltBetreten`, dann
// `/reload`: ein Welt-Wechsel ist ein Reload, Ring 8) und spielt den Grund danach. Bis dahin fuhr jede Station ihren eigenen Boot
// (Takt 19: 282 min Schloss, 103 min Abbau-Schwanz). DER BOOT der Welt zählt in die Fahrt (fahrtUrteil): Radeon b3f9ae95 29.10.
// stand die Welt nach 10,5 und 40 s — der Deckel 120 s; das Schloss hält der Halter die Fahrt lang samt Abbau (SITZUNG_MAX_S).
// DER DECKEL NACH SEINER MESSUNG (w4-fehlt-acht): jeder Boot einer Sitzung seither 5,8–8,5 s (Radeon, gegenlauf/eich1–6 a53152c2 …
// 1f17e7d1, messung 3ed96b3f · 73bdf938 · 24a0f3ef; „SITZUNG bereit" ist die Werkbank, die Welt wächst danach am Ort der ersten Probe)
// — 60 s, das Anderthalbfache des Größten je gemessenen (40 s); ein Boot darüber ist ROT beim Namen (der Halter)
const SITZUNG_BOOT_S = 60;
const SITZUNG_MAX_S = FAHRT_MAX_S + 600;
// DER ZWISCHENRAUM je Probe (der Anteil der Fahrt, fahreSitzung): Ort und Grundstellung vor ihr (Radeon 78d37554: Ort 17,4–27,8 s,
// Grundstellung 3,0–5,2 s — höchstens 33 s)
const ZWISCHEN_S = 35;
const GRUNDSTELLUNG_S = 180;
const STAND_DATEIEN = ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"];
const GRUND_SEITE = ["__ortTakt", "__ortStell", "__ortSchritt", "__ortBahn", "__anazhAutoSettlement"];
// GRUND_ZUSTAND (Radeon 6a571e3b 02.11.: nach tiere.K1#2 kehrten vor tiere.K3#2 nur 5 von 9 Wesen des Grunds wieder — „creatures 9 → 5“,
// die Welt trug nicht mehr, 27 Proben ungemessen): die Größen des Zustands, die weder der Stand noch die GRUND_TAFEL des Spiels trägt,
// die eine Probe aber stellt — die Kosten-Kappe der Wesen `maxCreatures` (die Herde am Hang setzte sie auf ihre 5 Glieder, und die
// Wiederkehr der Wesen `spawnCreatures` sagte jedem weiteren ab: „obergrenze“). Der Grund trägt ihr Wort, die Grundstellung setzt es
// VOR dem Stand zurück (die Wesen kehren unter der Kappe des Grunds wieder) und nennt, was sie zurücksetzte (`zustand`)
const GRUND_ZUSTAND = ["maxCreatures"];
// DIE WEGE-LINSE DER GRUNDSTELLUNG (w4-sitzung-reif; der Weg von tempo4 lag nach der Grundstellung weiter über der Mess-Wiese):
// `_stlWegeBuild` malt die Flächen eines Wegs in die Wege-Karte (`state.wegeKarte.siedlungen`), merkt seine Marke (`_stlWegeKeys`) und
// räumt die Natur auf ihm (`_wegeRaeumen`); `_standRueckspielen` lässt Karte und Natur als Caches warm — der Weg einer Probe (tempo4,
// die Straße von fahr-proben, ein erwachtes Dorf, die Stadt) blieb liegen, die Proben danach maßen neben ihm. Der Abdruck je Fläche
// ihr Rechteck auf 0,1 m und die Zahl ihrer Formen, dazu die Marken; läuft in der Seite (r = die Welt).
// DIE TRITTFLÄCHE IST KEIN GRUND (eich5 GTX 379e5f56, eich1 3ed95dcf ebenso: nach vegetation.K5 am Eich-Deckel ging die Grundstellung
// durch die Tür und fand „wege −17“ — 17 Kästen 2,1 m mit EINER Form längs des Wegs, den profiband.K4 vor dem Grund ging; die Sitzung
// endete, 64 Proben UNGEMESSEN): die Trittfläche der Ausstattung (Feuerstelle, Brunnen, Marktstand) setzt das Spiel einmal je Eintrag
// beim ersten Studio-Platz, transient, ohne Snapshot (`_trittFlaecheSetzen`, stamm/siedlung-wege.js) — die neue Seite setzt sie erst,
// wo der Eintrag wieder platziert wird. Der Abdruck trägt sie nie: sie hängt am Eintrag (`_trittBox`), und der Eintrag steht selbst im
// Grund (`architectures`); eine Fläche, die kein Eintrag trägt, bleibt ein Weg.
function wegeAbdruck(r) {
    const wk = r && r.state && r.state.wegeKarte, k = r && r._stlWegeKeys;
    const tritt = new Set(((r && r.state && r.state.architectures) || []).map((e) => e && e._trittBox).filter(Boolean));
    const f = (b) => [b.x0, b.z0, b.x1, b.z1].map((v) => Math.round(v * 10) / 10).join(",") + "/" + (b.formen ? b.formen.length : 0);
    return { flaechen: (wk ? wk.siedlungen : []).filter((b) => !tritt.has(b)).map(f).sort(), keys: k ? [...k].sort() : [] };
}
// die Abweichung vom Abdruck des Grunds beim Namen — „wege +n [Fläche] (neue Marken) −m [Fläche]“ — oder null; eine Marke, die fiel, ist
// keine (die Weltgrenze vergisst das Gedächtnis der Seite, `WELT_GRENZE.gedaechtnis`), eine neue auch ohne Fläche schon (die Natur,
// die ihr Weg räumte, kehrt an Ort und Stelle nicht zurück).
// DIE FLÄCHE EINER GEFALLENEN MARKE IST KEINE (Radeon 6a571e3b 02.11.: nach der Tür hinter tiere.K5#1 fand die Grundstellung „wege −1
// [-119.1,-274.9,279.2,201/272]“ — der Belag des Genesis-Orts, Marke „genesis“ —, die Sitzung endete nach 3 von 72 Proben): den Weg eines
// Plans legt das Gesetz am Ort (`_genesisOrt` aus dem Ort-Takt `__ortSchritt` oder dem Dorf-Takt, `_stlWegeBuild` je Marke einmal), die
// neue Seite der Tür trägt ihn erst, wenn sie dort taktet — unter dem Haken des Start-Orts (`__anazhAutoSettlement = false`, werkbank
// START_ORT) nie von selbst. Fehlt eine Fläche, während jede Marke des Grunds steht, ging ein Weg wirklich verloren (die Marke hält
// das Gesetz davon ab, ihn neu zu legen): ROT wie bisher. Fiel eine Marke, fallen ihre Flächen mit ihr — der Wurf folgt dem Ort (speicher.K3).
// `traegt` (ein Abdruck, der Grund der Sitzung): was er trägt, ist nie neu — eine Probe, an deren Ort das Gesetz den Weg des Grunds
// wieder legte, ließ nichts liegen (bauAbweichung)
function wegeAbweichung(soll, ist, traegt) {
    const zahl = (L) => L.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
    const mehr = (A, B) => [...A.keys()].flatMap((x) => Array(Math.max(0, A.get(x) - (B.get(x) || 0))).fill(x));
    const [S, I, G] = [zahl(soll.flaechen || []), zahl(ist.flaechen || []), zahl((traegt && traegt.flaechen) || [])];
    const basis = new Map([...S, ...[...G].filter(([x, n]) => n > (S.get(x) || 0))]);
    const kennt = (x) => (soll.keys || []).includes(x) || ((traegt && traegt.keys) || []).includes(x);
    const fiel = (soll.keys || []).some((x) => !(ist.keys || []).includes(x));
    const neu = mehr(I, basis), fort = fiel ? [] : mehr(S, I), marken = (ist.keys || []).filter((x) => !kennt(x));
    if (!neu.length && !fort.length && !marken.length) return null;
    const liste = (L) => L.slice(0, 3).map((x) => "[" + x + "]").join(" ") + (L.length > 3 ? " …" : "");
    return "wege" + (neu.length ? " +" + neu.length + " " + liste(neu) : "") + (marken.length ? " (" + marken.slice(0, 4).join(", ") + ")" : "") +
        (fort.length ? " −" + fort.length + " " + liste(fort) : "");
}
// DIE ZEICHENKETTE DER SEITE (w4-grund-zeichner; champion bild-klasse 31.10.: der Strom der Wasser-Wand, `wasserStrom` in
// scripts/lib/wasser-linse.cjs, schaltete seit 18.10. `renderer.render` stumm und `postProcessingFailed` an und gab beides nie zurück —
// seit die Sitzung zwischen den Proben nicht neu lädt, erbte jede Bild-Probe nach gelaende.K2#1 den toten Renderer: tiere.K1#2 „reading
// 'format'“, tiere.K3#2 „tier-Pixel 0/0/0/0“, ein gebuchter Punkt fiel als Rückfall, und keine Probe nannte den Täter). Der Abdruck je
// Glied der Kette, die das Bild der Seite zeichnet: der Renderer (Klasse, Leinwand im Dokument, jede EIGENE Funktion über einer geerbten —
// ein Fremdkörper; der Haken des Stroms trägt `__punkteHaken` und zählt nie), die Post-Kette (da, ihre Fremdkörper), die Weiche
// `postProcessingFailed`, das Gerät (`_deviceLost`: ohne es zeichnet kein Bild), dazu, was der Strom der Welt lieh: der Faden
// (`voxelWorker`) und die Sync-Stelle (`_syncStelle`). Je Seite merkt sie sich die Glieder selbst (`window.__punkteZeichner`, beim
// ersten Ruf in einer Seite, die dem Soll gleicht): Renderer, Post-Kette, Faden und JEDE eigene Funktion samt Haken — ein Tausch in
// derselben Seite weicht ab, auch unter gleichem Namen (der Null-Renderer trägt seine Methoden selbst). Ein Glied, das erst später
// entsteht (die Post-Kette mit dem ersten Bild, `_ensurePostProcessing`), ist nie eine Abweichung, eines, das fällt, immer. Mit `soll`
// (ein Abdruck): die Abweichungen beim Namen (`zeichner.<Glied>`, je Fremdkörper `zeichner.renderer.<Methode>`) und je Größe WIE (wie
// `grundWie`); mit `heilen` gibt die Seite zurück, was verliehen blieb (wie `leihe`): ein Fremdkörper fällt — die Welt ruft wieder ihren
// Prototyp —, ein getauschtes Glied kehrt aus dem Gedächtnis der Seite, Weiche und Sync-Stelle stehen auf dem Soll; das Gerät heilt
// nie (nur die Tür). Läuft in der Seite (r = die Welt): { abdruck, anders, wie, bleibt } — ohne `soll` nur { abdruck } — oder { fehler }
function zeichnerKette(r, soll, heilen) {
    const st = r && r.state;
    if (!st) return { fehler: "keine Welt in der Seite" };
    const kurz = (f) => String(f).replace(/\s+/g, " ").slice(0, 60);
    // die eigenen Funktionen eines Glieds: über einer geerbten, ohne den Haken des Stroms (der Abdruck), oder alle (das Gedächtnis)
    const eigene = (o, alle) => {
        const m = {};
        if (!o || (typeof o !== "object" && typeof o !== "function")) return m;
        for (const k of Object.getOwnPropertyNames(o)) {
            const d = Object.getOwnPropertyDescriptor(o, k);
            if (!d || typeof d.value !== "function") continue;
            if (alle) {
                m[k] = d;
                continue;
            }
            if (d.value.__punkteHaken) continue;
            let p = Object.getPrototypeOf(o), e;
            while (p && !(e = Object.getOwnPropertyDescriptor(p, k))) p = Object.getPrototypeOf(p);
            if (e && typeof e.value === "function" && e.value !== d.value) m[k] = d;
        }
        return m;
    };
    const fremd = (o) => Object.fromEntries(Object.entries(eigene(o, false)).map(([k, d]) => [k, kurz(d.value)]));
    const abdruck = () => {
        const R = st.renderer, P = st.postProcessing;
        return {
            renderer: R ? { klasse: (R.constructor && R.constructor.name) || "?", lose: !!R.domElement && R.domElement.isConnected === false, fremd: fremd(R) } : null,
            post: P ? { fremd: fremd(P) } : null,
            postProcessingFailed: st.postProcessingFailed === true,
            geraet: st._deviceLost === true,
            faden: !!st.voxelWorker,
            syncStelle: r._syncStelle == null ? null : String(r._syncStelle),
        };
    };
    const merke = () => ({ renderer: st.renderer || null, post: st.postProcessing || null, faden: st.voxelWorker || null,
        eigen: { renderer: eigene(st.renderer, true), post: eigene(st.postProcessing, true) } });
    const Z = window.__punkteZeichner || null;
    if (!soll) {
        if (!Z) window.__punkteZeichner = merke();
        else {
            // was erst jetzt entstand (ein Glied, der Haken des Stroms an ihm), trägt das Gedächtnis ab jetzt
            if (!Z.renderer && st.renderer) (Z.renderer = st.renderer), (Z.eigen.renderer = eigene(st.renderer, true));
            if (!Z.post && st.postProcessing) (Z.post = st.postProcessing), (Z.eigen.post = eigene(st.postProcessing, true));
            if (!Z.faden && st.voxelWorker) Z.faden = st.voxelWorker;
            for (const [g, o] of [["renderer", Z.renderer], ["post", Z.post]])
                for (const [k, d] of Object.entries(eigene(o, true))) if (d.value.__punkteHaken) Z.eigen[g][k] = d;
        }
        return { abdruck: abdruck() };
    }
    const vergleich = () => {
        const ist = abdruck(), anders = [], wie = {};
        const nenne = (k, w) => {
            if ("zeichner." + k in wie) return;
            anders.push("zeichner." + k);
            wie["zeichner." + k] = w;
        };
        const sr = soll.renderer, ir = ist.renderer;
        const name = (x) => (x ? x.klasse + (x.lose ? " (Leinwand lose)" : "") : "keiner");
        if (sr && (!ir || sr.klasse !== ir.klasse || sr.lose !== ir.lose)) nenne("renderer", name(sr) + " → " + name(ir));
        else if (Z && Z.renderer && st.renderer !== Z.renderer) nenne("renderer", "getauscht (" + name(ir) + ")");
        if (soll.post && !ist.post) nenne("postKette", "fort");
        else if (Z && Z.post && st.postProcessing !== Z.post) nenne("postKette", st.postProcessing ? "getauscht" : "fort");
        // je Glied: ein Fremdkörper beim Namen (über das Soll), in derselben Seite jeder Tausch und jede gefallene eigene Funktion
        const glied = (g, s, i, o, ze) => {
            for (const k of Object.keys((i && i.fremd) || {}).sort()) if (!(s && s.fremd && k in s.fremd)) nenne(g + "." + k, "eigen: " + i.fremd[k]);
            for (const k of Object.keys(ze || {}).sort()) {
                const d = Object.getOwnPropertyDescriptor(o, k);
                if (!d) nenne(g + "." + k, "fehlt");
                else if (d.value !== ze[k].value && !(d.value && d.value.__punkteHaken)) nenne(g + "." + k, "getauscht: " + kurz(d.value));
            }
        };
        glied("renderer", sr, ir, st.renderer, Z && st.renderer && st.renderer === Z.renderer ? Z.eigen.renderer : null);
        glied("postKette", soll.post, ist.post, st.postProcessing, Z && st.postProcessing && st.postProcessing === Z.post ? Z.eigen.post : null);
        for (const [k, a, b] of [["postProcessingFailed", soll.postProcessingFailed, ist.postProcessingFailed], ["geraet", soll.geraet, ist.geraet],
            ["syncStelle", soll.syncStelle, ist.syncStelle]])
            if (a !== b) nenne(k, String(a) + " → " + String(b));
        if (soll.faden && !ist.faden) nenne("faden", "da → keiner");
        return { ist, anders, wie };
    };
    const vor = vergleich();
    if (heilen && vor.anders.length) {
        if (Z && Z.renderer && st.renderer !== Z.renderer) st.renderer = Z.renderer;
        if (Z && Z.post && st.postProcessing !== Z.post) st.postProcessing = Z.post;
        // je Glied: ein Fremdkörper fällt (ohne Gedächtnis nur, was das Soll nicht trägt), ein getauschtes oder gefallenes Glied kehrt aus dem
        // Gedächtnis; der Haken des Stroms bleibt
        const zurueck = (o, s, ze) => {
            if (!o) return;
            const erbt = eigene(o, false);
            for (const [k, d] of Object.entries(eigene(o, true))) {
                if (d.value.__punkteHaken) continue;
                if (ze && ze[k]) {
                    if (ze[k].value !== d.value) Object.defineProperty(o, k, ze[k]);
                } else if (k in erbt && (ze || !(s && s.fremd && k in s.fremd))) delete o[k];
            }
            if (ze) for (const [k, d] of Object.entries(ze)) if (!Object.getOwnPropertyDescriptor(o, k)) Object.defineProperty(o, k, d);
        };
        zurueck(st.renderer, soll.renderer, Z && st.renderer === Z.renderer ? Z.eigen.renderer : null);
        zurueck(st.postProcessing, soll.post, Z && st.postProcessing && st.postProcessing === Z.post ? Z.eigen.post : null);
        if ((st.postProcessingFailed === true) !== soll.postProcessingFailed) st.postProcessingFailed = soll.postProcessingFailed;
        if (soll.faden && !st.voxelWorker && Z && Z.faden) st.voxelWorker = Z.faden;
        if ((r._syncStelle == null ? null : String(r._syncStelle)) !== soll.syncStelle) r._syncStelle = soll.syncStelle;
    }
    const nach = heilen && vor.anders.length ? vergleich() : vor;
    // das Gedächtnis einer neuen Seite nur aus einer, die dem Soll gleicht
    if (!Z && !nach.anders.length) window.__punkteZeichner = merke();
    return { abdruck: nach.ist, anders: vor.anders, wie: vor.wie, bleibt: nach.anders };
}
const zeichnerCode = (soll, heilen) => "return (" + zeichnerKette + ")(r, " + JSON.stringify(soll || null) + ", " + !!heilen + ");";
// EIN Ruf der Zeichenkette an die Welt `w` (zeichnerKette): ihr Ergebnis oder { fehler } beim Grund — wirft nie
async function zeichnerRuf(w, soll, heilen) {
    try {
        const a = await rufFrist(w, "/eval", { code: zeichnerCode(soll, heilen) }, 30000);
        const e = a && a.ergebnis;
        if (!e || typeof e !== "object") return { fehler: String((a && a.fehler) || "kein Ergebnis: " + JSON.stringify(a)).slice(0, 300) };
        return e;
    } catch (e) {
        return { fehler: String((e && e.message) || e).split("\n")[0] };
    }
}
// DIE LEIHE DER HÄNGER-LINSE (Radeon 6a571e3b 02.11.: profiband.K4#1 „ließ die Zeichenkette verändert: zeichner.renderer._renderObjectDirect
// getauscht: function (object, material, scene, camera) { const vor = H.c…“ — kein Urteil; ebenso streaming.K3#1 an 25ac4c0c, beide über
// `/haenger` der Werkbank): das Instrument der Werkbank (`__haengerAn`, scripts/lib/haenger-linse.cjs des Spiel-Baums) hängt sich beim ersten
// Lauf für immer in die Seite — der Auftraggeber `_renderObjectDirect` und der Knoten-Bau `_nodes.getForRender` am Renderer, die Pipelines,
// Shader und Uploads an `GPUDevice.prototype` und `GPUQueue.prototype` — und merkt sich in `window.__haengerH` (idempotent). Die Proben, die
// es rufen, messen damit richtig; nur gibt es niemand zurück. DIE SITZUNG leiht es der Probe: vor jeder Probe (`nimm`, ohne Instrument in der
// Seite) der Stand jedes seiner Glieder, nach ihr (`gib`, nur wenn das Instrument in ihr entstand) jedes Glied zurück und das Gedächtnis
// fort — die nächste Probe, die es ruft, hängt es frisch an (nie doppelt: ein Haken über einem Haken zählte jede Pipeline zweimal). Was danach
// an den Prototypen des Geräts nicht nativ ist, nennt `bleibt` (ein Glied, das die Linse neu bekam und diese Liste nicht kennt) — die Sitzung
// macht es zum Werkzeug-Bruch beim Namen. Läuft in der Seite (r = die Welt): nimm → { leiht | da }, gib → { zurueck, bleibt } oder { ohne }
function haengerLeihe(r, gib) {
    const R = r && r.state && r.state.renderer;
    const P = window.GPUDevice && window.GPUDevice.prototype, Q = window.GPUQueue && window.GPUQueue.prototype;
    const glieder = [[R, "renderer", ["_renderObjectDirect"]], [R && R._nodes, "renderer._nodes", ["getForRender"]],
        [P, "GPUDevice", ["createRenderPipeline", "createRenderPipelineAsync", "createComputePipeline", "createComputePipelineAsync", "createShaderModule"]],
        [Q, "GPUQueue", ["writeBuffer", "writeTexture", "copyExternalImageToTexture"]]].filter(([o]) => o && (typeof o === "object" || typeof o === "function"));
    // je Prototyp des Geräts JEDE eigene Funktion (auch die Haken der Werkbank selbst, der VRAM-Abgriff): was nach `gib` anders steht, bleibt
    const alle = (o) => Object.getOwnPropertyNames(o).map((k) => [k, Object.getOwnPropertyDescriptor(o, k)]).filter(([, d]) => d && typeof d.value === "function");
    if (!gib) {
        delete window.__punkteHaengerLeihe;
        if (window.__haengerH) return { da: true };
        window.__punkteHaengerLeihe = {
            glieder: glieder.flatMap(([o, n, ks]) => ks.map((k) => [o, n + "." + k, k, Object.getOwnPropertyDescriptor(o, k)])),
            geraet: glieder.filter(([o]) => o === P || o === Q).map(([o, n]) => [o, n, new Map(alle(o).map(([k, d]) => [k, d.value]))]),
        };
        return { leiht: window.__punkteHaengerLeihe.glieder.length };
    }
    const L = window.__punkteHaengerLeihe;
    delete window.__punkteHaengerLeihe;
    if (!L || !window.__haengerH) return { ohne: true };
    const zurueck = [];
    for (const [o, name, k, d] of L.glieder) {
        const jetzt = Object.getOwnPropertyDescriptor(o, k);
        if (d ? jetzt && jetzt.value === d.value : !jetzt) continue;
        if (d) Object.defineProperty(o, k, d);
        else delete o[k];
        zurueck.push(name);
    }
    delete window.__haengerH;
    const bleibt = L.geraet.flatMap(([o, n, vor]) => alle(o).filter(([k, d]) => vor.get(k) !== d.value).map(([k]) => n + "." + k));
    return { zurueck, bleibt };
}
const HAENGER_LEIHE = (gib) => "/* __punkteHaengerLeihe */ return (" + haengerLeihe + ")(r, " + !!gib + ");";
// der Werkzeug-Bruch einer Probe beim Namen jeder Größe, die sie an der Zeichenkette verändert ließ
const zeichnerBruch =(z) => "Werkzeug-Bruch: die Probe ließ die Zeichenkette verändert (" + z.anders.map((k) => k + " " + z.wie[k]).join(" · ") + ")";
const GRUND_NIMM =
    'if (typeof r._grundstellung !== "function") return { fehlt: true }; const t0 = performance.now(); const g = r._grundstellung(); ' +
    "return { grund: g.grund, n: Object.keys(g.abdruck).length, ms: +(performance.now() - t0).toFixed(1), welt: r.state.worldMeta.worldId, " +
    "seite: " + JSON.stringify(GRUND_SEITE) + ".filter((k) => k in window), wege: (" + wegeAbdruck + ")(r), " +
    "zustand: Object.fromEntries(" + JSON.stringify(GRUND_ZUSTAND) + ".map((k) => [k, r.state[k]])) };";
// DIE NAHRUNG DES LEIBS: die Grundstellung spielt den Stand durch die EINE Lade-Kette (`_standRueckspielen` → `loadState`), und der
// Stand ERSETZT die Nahrung des Leibs (`_loadStateRestoreLeben`, w4-nahrung-laden, z143) — die Sitzung räumt sie nie selbst.
const grundSpielen = (g) =>
    "for (const k of " + JSON.stringify(GRUND_SEITE) + ") if (!" + JSON.stringify(g.seite) + ".includes(k)) delete window[k]; " +
    "const zs = " + JSON.stringify(g.zustand || {}) + ", zustand = Object.keys(zs).filter((k) => r.state[k] !== zs[k]); for (const k of zustand) r.state[k] = zs[k]; " +
    "const t0 = performance.now(); const z = r._grundstellung(" + JSON.stringify(g.grund) + "); " +
    "const weg = " + (g.wege ? "(" + wegeAbweichung + ")(" + JSON.stringify(g.wege) + ", (" + wegeAbdruck + ")(r))" : "null") + "; return { ok: z.ok, grund: z.grund || null, " +
    "anders: (z.anders || []).concat(" + JSON.stringify(GRUND_SEITE) + ".filter((k) => k in window && !" + JSON.stringify(g.seite) + ".includes(k)).map((k) => \"seite.\" + k), weg ? [weg] : []), " +
    "neu: z.neu || null, zustand, ms: +(performance.now() - t0).toFixed(1), welt: r.state.worldMeta && r.state.worldMeta.worldId, wie: (" + grundWie + ")(r, " +
    JSON.stringify(g.grund) + ", z.anders || []) };";
// WIE eine Größe vom Grund abweicht (Heilung 30.10.: „abweichend vom Grund: blueprints“ nannte nie den Täter): je Liste des Stands
// (Baupläne, Werke, Stoffe, Werkzeuge) die Glieder, die fehlen, neu sind oder anders stehen — je anderes Glied seine Felder; je
// worldMeta-Feld seine Länge vorher → nachher. Läuft in der Seite (r = die Welt), nur bei einer Abweichung
function grundWie(r, grund, anders) {
    if (!anders.length || !r || typeof r.buildStateSnapshot !== "function") return null;
    const soll = JSON.parse(grund).stand, ist = r.buildStateSnapshot(), J = (x) => JSON.stringify(x), wie = {};
    for (const k of anders) {
        const [a, b] = k.startsWith("worldMeta.") ? [(soll.worldMeta || {})[k.slice(10)], (ist.worldMeta || {})[k.slice(10)]] : [soll[k], ist[k]];
        if (!Array.isArray(a) && !Array.isArray(b)) {
            wie[k] = String(J(a)).slice(0, 80) + " → " + String(J(b)).slice(0, 80);
            continue;
        }
        const name = (e) => String(e && (e.name != null ? e.name : e.id != null ? e.id : J(e).slice(0, 40)));
        const A = new Map((a || []).map((e) => [name(e), e])), B = new Map((b || []).map((e) => [name(e), e]));
        const felder = (x, y) => Object.keys({ ...x, ...y }).filter((f) => J(x[f]) !== J(y[f])).slice(0, 6).join("/");
        // je Name seine ZAHL (ein Feld gleicher Glieder — Etiketten, „happy“ zweimal — zählt jedes; bis 30.10. faltete die Karte sie zu
        // einem und nannte 1 → 1 Glied gleich, wo 1 → 2 stand)
        const zahl = (L) => (L || []).reduce((m, e) => m.set(name(e), (m.get(name(e)) || 0) + 1), new Map());
        const [ZA, ZB] = [zahl(a), zahl(b)];
        const mehr = (X, Y) => [...X.keys()].filter((n) => X.get(n) > (Y.get(n) || 0)).map((n) => n + (X.get(n) - (Y.get(n) || 0) > 1 ? " ×" + (X.get(n) - (Y.get(n) || 0)) : ""));
        wie[k] = { vorher: (a || []).length, nachher: (b || []).length, fehlt: mehr(ZA, ZB).slice(0, 4),
            neu: mehr(ZB, ZA).slice(0, 4),
            anders: [...A.keys()].filter((n) => B.has(n) && J(A.get(n)) !== J(B.get(n))).slice(0, 4).map((n) => n + ":" + felder(A.get(n) || {}, B.get(n) || {})) };
    }
    return wie;
}
const GRUND_TUER =(g) => "const s = JSON.parse(" + JSON.stringify(g.grund) + ").stand; return r._weltBetreten(s, null, { neuLaden: false });";
// DER BAU DER WELT (w4-linsen-a, die Klasse „eine Probe legt etwas in die Welt und trägt kein `mutiert`“; GTX 3ed95dcf: siedlung.K4#2
// setzte einen Ort von 1320 samt Haus und Uhr, die Sitzung stellte danach nicht zurück, und klang.K2#1 stand in ihm — archLod 5459
// Einträge an der Mess-Wiese, nach einer Grundstellung 1297): vor und nach jeder Probe ohne `mutiert` der Abdruck dessen,
// was eine Probe bleibend legt — die Werke je Id (ohne die Würfe des Gesetzes und ohne Bäume: sie folgen dem Ort und dem Wald, nie der
// Probe), die Edits, die Orte im Gedächtnis der Welt (`settlementCells`), die Wege (`wegeAbdruck`). Läuft in der Seite (r = die Welt)
function bauAbdruck(r) {
    const st = r.state, wm = st.worldMeta || {};
    const werke = (st.architectures || []).filter((e) => e && !e._ausGesetz && !e._lodSpecies).map((e) => String(e.id)).sort();
    return { werke, edits: Array.isArray(wm.voxelEdits) ? wm.voxelEdits.length : 0, orte: Object.keys(wm.settlementCells || {}).sort(), wege: wegeAbdruck(r) };
}
// die Abweichung beim Namen — „werke +37 (−0) · orte +k3_-2 · wege +4 […]“ — oder null (ohne Abdruck auf einer Seite: null); `grundWege`
// (der Wege-Abdruck des Grunds): ein Weg, den der Grund trägt, ist nie, was eine Probe liegen ließ (wegeAbweichung `traegt`)
function bauAbweichung(vor, nach, grundWege) {
    if (!vor || !nach) return null;
    const plusMinus = (a, b) => [b.filter((x) => !a.includes(x)), a.filter((x) => !b.includes(x))];
    const [wNeu, wFort] = plusMinus(vor.werke, nach.werke), [oNeu, oFort] = plusMinus(vor.orte, nach.orte);
    const teile = [];
    if (wNeu.length || wFort.length) teile.push("werke +" + wNeu.length + " (−" + wFort.length + ")");
    if (vor.edits !== nach.edits) teile.push("edits " + vor.edits + " → " + nach.edits);
    if (oNeu.length || oFort.length) teile.push("orte " + [...oNeu.map((x) => "+" + x), ...oFort.map((x) => "−" + x)].slice(0, 4).join(" "));
    const w = wegeAbweichung(vor.wege, nach.wege, grundWege);
    if (w) teile.push(w);
    return teile.length ? teile.join(" · ") : null;
}
// DER HALT DER MESSUNG IST EINE LEIHE (13.11., pm-ernte; FUND w28-richter-hand3: eine Probe, die die Bühne stellt — luftwasser.K5#2,
// bauen.K1#2 —, lässt `weatherEffectTime` = −1e9 stehen (scripts/lib/ausgabe-aufnahme.cjs `wetterHalten`); die Grundstellung trägt ihn
// nicht zurück, und unter ihm verweigert die Engstelle der Welt-Akte (stamm/feld-dsl.js `_messHalt`) jedes Setzen: bauen.K5#2 „2/6
// Herkunft × Sicht × Werk“, vegetation.K4#2 „1 gesetzt über die Werkstatt false“ — das Spiel kennt den Halt nie (weatherEffectTime ≥ 0).
// Statt jeder Probe ihr eigenes `weatherEffectTime = 0` (g2.js trägt es fünfmal) liest die Sitzung ihn vor und nach JEDER Probe und
// gibt ihn zurück, wie er stand; setz null: nur lesen. → die Zahl oder null (unlesbar, kein Spiel)
const messHaltRuf = (w, setz) =>
    rufFrist(w, "/eval", { code: "/* __punkteMessHalt */ const s = r.state; " + (setz == null ? "" : "s.weatherEffectTime = " + Number(setz) + "; ") +
        "return typeof s.weatherEffectTime === \"number\" ? s.weatherEffectTime : null;" }, 30000)
        .then((a) => (a && typeof a.ergebnis === "number" ? a.ergebnis : null)).catch(() => null);
// DER STAND DES ORTS (13.11., pm-ernte; schatten.K5#1 Radeon: 0,60:1 mit dem Spieler 3,9 m vom Feuer, am 12.11. 5,28:1 mit 9,4 m —
// die Probe wählt Quelle und Seite des Pfostens vom Spieler aus, und die Sitzung stellte den Ort `dorf` nur EINMAL um: jede Probe danach
// fand den Spieler, wo die vorige ihn ließ): nach dem Umstellen und nach jeder Probe am Ort der Stand des Spielers [x, z, Gier]; weicht er
// um mehr als ORT_WANDER_M oder ORT_DREH_RAD ab, stellt die nächste Probe dort neu um — derselbe Ort, dieselbe Kamera, jede Fahrt.
const ORT_WANDER_M = 0.5, ORT_DREH_RAD = 0.02;
const spielerStand = (w) =>
    rufFrist(w, "/eval", { code: "/* __punkteSpielerStand */ const s = r.state, p = s.playerMesh && s.playerMesh.position; " +
        "return p ? [p.x, p.z, typeof s.yaw === \"number\" ? s.yaw : null] : null;" }, 30000)
        .then((a) => (a && Array.isArray(a.ergebnis) && a.ergebnis.length === 3 ? a.ergebnis : null)).catch(() => null);
const BAU_LIES = ("return (" + bauAbdruck + ")(r);").replace("wege: wegeAbdruck(r)", "wege: (" + wegeAbdruck + ")(r)");

// ein Ruf an die Werkbank MIT Frist (werkbankRuf des Spiels wartet ewig): Rückgabe die Antwort, wirft bei Frist und Fehler.
// JE RUF EINE VERBINDUNG (`agent: false`, Heilung 30.10.): der Agent von Node ≥ 19 hält den Socket offen (keepAlive), die Werkbank
// schließt einen ruhenden nach 5 s (keepAliveTimeout) — stand die Schleife des Läufers länger still (ciWartet als spawnSync: 20 s),
// nahm der nächste Ruf im selben Takt den toten Socket: „read ECONNRESET“ am ersten /fenster, die Welt galt als tot, 69 von 69
// Proben ungemessen (Radeon 3ed96b3f). Dieselbe Regel tragen die Rufe der Proben (sitzungTor, sitzungWerkzeug, sitzungLauf).
function rufFrist(port, weg, nutzlast, ms) {
    return new Promise((ja, nein) => {
        const req = require("http").request({ host: "127.0.0.1", port, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => { try { ja(JSON.parse(d)); } catch (_e) { ja({ roh: d }); } });
        });
        req.setTimeout(ms, () => req.destroy(new Error(weg + " ohne Antwort binnen " + Math.round(ms / 1000) + " s")));
        req.on("error", nein);
        req.end(JSON.stringify(nutzlast || {}));
    });
}
const lebtPid = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const warteMs = (ms) => new Promise((r) => setTimeout(r, ms));
const httpDa = (port) => new Promise((r) => require("http").get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
// ist der Port zu? EIN Verbindungs-Versuch: abgewiesen heißt, niemand lauscht; ein lauschender Port nimmt sofort an, auch wenn sein
// Prozess gerade rechnet — eine Frist ohne Antwort heißt darum nie „zu“
const portZu = (port, ms = 3000) => new Promise((r) => {
    const s = require("net").connect({ host: "127.0.0.1", port });
    const ende = (zu) => { s.destroy(); r(zu); };
    s.setTimeout(ms, () => ende(false));
    s.once("connect", () => ende(false));
    s.once("error", () => ende(true));
});

// DER HALTER (`punkte.cjs halter --baum B --port P --log L --zeuge Z --stop F --eltern pid [--band p,p] [--welt stub.json]`): startet
// die Welt, meldet „SITZUNG bereit“ und hält sie, bis die Stop-Datei liegt, der Läufer stirbt oder die Werkbank endet; dann stop,
// Abbau, Ports frei. Die Werkbank trägt den Zeugen der Karte (gpu-zeuge.cjs → Z). --welt (nur der Selbsttest): { save, werkbank }
// als argv mit {S} {W}
async function halter(o) {
    const baum = path.resolve(o.baum), S = Number(o.port), W = S + 20000;
    const band = String(o.band || [S, W, W - 1].join(",")).split(",").filter(Boolean);
    const welt = o.welt ? JSON.parse(fs.readFileSync(o.welt, "utf8")) : null;
    const ers = (a) => String(a).replace(/\{S\}/g, String(S)).replace(/\{W\}/g, String(W));
    const exe = (a) => (a[0] === "node" ? process.execPath : a[0]);
    const t0 = Date.now();
    portRaeumen(band);
    for (const d of STAND_DATEIEN) fs.rmSync(path.join(baum, d), { force: true });
    const sl = fs.openSync(o.log + ".save", "w");
    const sa = (welt ? welt.save : ["node", "save-server.js"]).map(ers);
    // DER ZEUGE DES KONSUMS in der Welt der Sitzung (--konsum <Ordner>): save-server und Werkbank, ohne die Seite (konsumAn)
    const kenv = (e) => (o.konsum ? (konsumUmgebung(e, path.resolve(o.konsum), baum, false), e) : e);
    if (o.konsum) (fs.rmSync(path.resolve(o.konsum), { recursive: true, force: true }), fs.mkdirSync(path.resolve(o.konsum), { recursive: true }));
    const sv = spawn(exe(sa), sa.slice(1), { cwd: baum, env: kenv({ ...process.env, PORT: String(S) }), stdio: ["ignore", sl, sl], windowsHide: true });
    let wb = null;
    const ab = async (code, zeile) => {
        if (zeile) console.log(zeile);
        if (wb && wb.exitCode == null) {
            await rufFrist(W, "/stop", {}, 30000).catch(() => null);
            for (let i = 0; i < 20 && wb.exitCode == null; i++) await warteMs(500);
            if (wb.exitCode == null) baumTot(wb.pid);
        }
        if (sv.exitCode == null) baumTot(sv.pid);
        portRaeumen(band);
        for (const d of STAND_DATEIEN) fs.rmSync(path.join(baum, d), { force: true });
        process.exit(code);
    };
    for (let i = 0; !(await httpDa(S)); i++) {
        if (sv.exitCode != null || i > 60) return ab(1, "SITZUNG FEHLER der save-server auf " + S + " steht nicht (Exit " + sv.exitCode + ")");
        await warteMs(1000);
    }
    const wl = fs.openSync(o.log, "w");
    // DIE WELT DER SITZUNG OHNE DORF-ZUG (30.10.): `--ort wiese` legt den Dorf-Zug des Orts (haushalt.json `dorfZug: false`) vor das
    // erste Skript JEDER Ladung der Seite (werkbank START_ORT) — wie jede Messung, die mit `start --ort` bootete. Bis dahin bootete die
    // Sitzung ohne Ort: ein Dorf wuchs vom Boot an (`dorfWaechst` in 74 % der Zapfen des Eichlaufs 00763f54, die Foundry mit seinen
    // Häusern belegt — lod.K5#1 92 s Foundry), die Grundstellung spielte es zurück; ein Ort mit Dorf-Zug stellt ihn selbst an
    const wa = (welt ? welt.werkbank : ["node", "scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"]).map(ers);
    const env = kenv({ ...process.env, WERKBANK_PORT: String(W), PUNKTE_GPU_ZEUGE: path.resolve(o.zeuge),
        NODE_OPTIONS: ((process.env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim() });
    wb = spawn(exe(wa), wa.slice(1), { cwd: baum, env, stdio: ["ignore", wl, wl], windowsHide: true });
    const log = () => (fs.existsSync(o.log) ? fs.readFileSync(o.log, "utf8") : "");
    for (let i = 0; !/WERKBANK bereit/.test(log()); i++) {
        if (wb.exitCode != null || /WERKBANK-FEHLER/.test(log()) || i > SITZUNG_BOOT_S * 2)
            return ab(1, "SITZUNG FEHLER die Werkbank startet nicht (Exit " + wb.exitCode + "): " + log().trim().split(/\r?\n/).slice(-3).join(" | ").slice(0, 400));
        await warteMs(500);
    }
    console.log("SITZUNG bereit :" + W + " nach " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    const eltern = Number(o.eltern) || 0;
    for (;;) {
        if (fs.existsSync(o.stop)) return ab(0, "SITZUNG Ende");
        if (eltern && !lebtPid(eltern)) return ab(0, "SITZUNG Ende: der Läufer " + eltern + " lebt nicht mehr");
        if (wb.exitCode != null) return ab(1, "SITZUNG tot: die Werkbank endete (Exit " + wb.exitCode + "): " + log().trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300));
        await warteMs(1000);
    }
}

// DER SCHLOSS-HALTER der Sitzung (Karte w4-grundstellung): gpu-lauf.sh (zeit, die CI-Ruhe einmal, Deckel SITZUNG_MAX_S) um einen
// Wartenden, der endet, wenn die Datei `los` liegt oder der Läufer stirbt — er hält das Schloss, nie die Welt: sie lebt daneben und
// bleibt warm, wenn die Sitzung das Schloss einem wartenden CI-Job gibt. Rückgabe { ok, kind, los, warten (min), grund?, ungemessen? }
function schlossNehmen(o, nr) {
    return new Promise((fertig) => {
        if (!o.bash) return fertig({ ok: false, grund: "keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh" });
        const t0 = Date.now(), los = o.stop + ".los-" + nr;
        fs.rmSync(los, { force: true });
        const warte = 'const fs = require("fs"); const [los, p] = process.argv.slice(1); setInterval(() => { let da = true; ' +
            'try { process.kill(Number(p), 0); } catch (e) { da = e.code === "EPERM"; } if (fs.existsSync(los) || !da) process.exit(0); }, 500);';
        const env = { ...process.env, GPU_LAUF_ART: "zeit", GPU_LAUF_PLAETZE: "1", GPU_LAUF_MAX_S: String(SITZUNG_MAX_S) };
        delete env.NODE_OPTIONS;
        const kind = spawn(o.bash, [o.gpuLauf, "punkte-" + o.geraet + "-sitzung", process.execPath, "-e", warte, los, String(process.pid)],
            { cwd: o.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        let out = "", gemeldet = false, uhr = null;
        const h = { kind, los, ende: new Promise((r) => kind.on("exit", (c) => r(c))), aus: () => out };
        const melde = (r) => {
            if (gemeldet) return;
            gemeldet = true;
            clearTimeout(uhr);
            fertig(Object.assign(h, { warten: +((Date.now() - t0) / 60000).toFixed(2) }, r));
        };
        const still = o.stillS || SCHLOSS_STILL_S;
        const lies = (d) => {
            out += String(d);
            if (/^gpu-lauf: Schloss /m.test(out)) return melde({ ok: true });
            clearTimeout(uhr);
            uhr = setTimeout(() => (baumTot(kind.pid), melde({ ok: false, ungemessen: true, grund: "GPU-Schloss nie bekommen: gpu-lauf.sh schwieg " + still + " s beim Warten" })), still * 1000);
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        lies("");
        kind.on("error", (e) => melde({ ok: false, grund: "gpu-lauf.sh: " + e.message }));
        kind.on("exit", (code) => setTimeout(() => {
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (code === 75) return melde({ ok: false, ungemessen: true, grund: "GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen" });
            melde({ ok: false, grund: "gpu-lauf.sh endete vor dem Schloss (Exit " + code + "): " + out.trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300) });
        }, 300));
    });
}
// gibt das Schloss frei: der Wartende endet, gpu-lauf.sh löst (trap); sonst fällt sein Baum
async function schlossLoesen(h) {
    if (!h || !h.kind || h.kind.exitCode != null) return;
    fs.writeFileSync(h.los, "los\n");
    if ((await Promise.race([h.ende, warteMs(30000).then(() => "frist")])) === "frist") baumTot(h.kind.pid);
    fs.rmSync(h.los, { force: true });
}
// wartet ein CI-Job auf das Schloss? (gpu-schloss.sh neben gpu-lauf.sh: `ci_wartet`, die letzte Zeile von hook.log) — EIN Blick als
// eigener Prozess, nie im Takt des Läufers: Rückgabe ein Promise<bool> mit `.kind` (Heilung 30.10.: als spawnSync stand der Läufer an
// jeder Proben-Grenze, bis bash fertig war — Radeon-Laptop 5,2 s, mit Waisen daneben 20 s an der Frist und dann immer „nein“; derweil
// schloss die Werkbank den ruhenden Socket, rufFrist). Die Frist CI_BLICK_S fällt den Baum (ein hängendes bash): „nein“
const CI_BLICK_S = 60;
const ciWartet = (o) => {
    let kind = null;
    const p = new Promise((ja) => {
        try {
            kind = spawn(o.bash, ["-c", '. "$1" && ci_wartet', "ci", path.join(path.dirname(o.gpuLauf), "gpu-schloss.sh")],
                { env: { ...process.env, ...(o.hookLog ? { GPU_HOOK_LOG: o.hookLog } : {}) }, windowsHide: true, stdio: "ignore" });
        } catch (_e) {
            return ja(false);
        }
        const frist = setTimeout(() => baumTot(kind.pid), CI_BLICK_S * 1000);
        kind.on("error", () => (clearTimeout(frist), ja(false)));
        kind.on("exit", (c) => (clearTimeout(frist), ja(c === 0)));
    });
    p.kind = kind;
    return p;
};

// startet den Halter (daneben das GANZE Schloss, wenn gpuLauf: `schlossNehmen`); Rückgabe { ok, kind, schloss, warten (min), bootS, grund?, ungemessen? }
async function sitzungStarten(o) {
    const schloss = o.gpuLauf ? await schlossNehmen(o, 0) : null;
    if (schloss && !schloss.ok) return schloss;
    return new Promise((fertig) => {
        const t0 = Date.now();
        const argv = [__filename, "halter", "--baum", o.baum, "--port", String(o.port), "--log", o.log, "--zeuge", o.zeuge, "--stop", o.stop,
            "--eltern", String(process.pid), "--band", [].concat(o.band || o.port).join(","), ...(o.welt ? ["--welt", o.welt] : []), ...(o.konsum ? ["--konsum", o.konsum] : [])];
        const env = { ...process.env };
        delete env.NODE_OPTIONS; // der Zeuge sitzt in der Werkbank, nie im Halter (er nennt keine Karte)
        let out = "", gemeldet = false, uhr = null;
        const kind = spawn(process.execPath, argv, { cwd: o.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        const s = { kind, schloss, ende: new Promise((r) => kind.on("exit", (c) => r(c))), aus: () => out, datei: o.log + ".halter" };
        const melde = (r) => {
            if (gemeldet) return;
            gemeldet = true;
            clearTimeout(uhr);
            fs.writeFileSync(o.log + ".halter", out);
            fertig(Object.assign(s, { warten: schloss ? schloss.warten : 0, bootS: +((Date.now() - t0) / 1000).toFixed(1) }, r));
        };
        const lies = (d) => {
            out += String(d);
            if (/^SITZUNG bereit/m.test(out)) return melde({ ok: true });
            clearTimeout(uhr);
            uhr = setTimeout(() => (baumTot(kind.pid), melde({ ok: false, grund: "die Welt der Sitzung steht nach " + (SITZUNG_BOOT_S + 120) + " s nicht" })), (SITZUNG_BOOT_S + 120) * 1000);
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        lies("");
        kind.on("error", (e) => melde({ ok: false, grund: "Halter: " + e.message }));
        kind.on("exit", (code) => setTimeout(() => melde(halterEnde(out, code)), 300));
    });
}
// DAS ENDE DES HALTERS VOR „SITZUNG bereit“: nennt er es (`SITZUNG FEHLER …`: die Werkbank, das Spiel am SHA startet nicht), ist es ROT
// beim Namen — ein Spiel, das nicht startet, ist ein Urteil. STIRBT ER OHNE WORT, sagt sein Exit-Code nichts über das Spiel: UNGEMESSEN
// (11.11., Radeon ab2f2eed 05:47: der Halter der Fortsetzung endete mit Exit 3221226505 = 0xC0000409, ein Absturz des node-Prozesses
// ohne Zeile — 71 Stationen standen als ROT in der Mess-Datei, die Buchung hätte 215 → 188 gebucht; der Dienst weigerte sich und
// buchte den Tag über nichts). `--offen` und die Fortsetzung messen sie neu.
function halterEnde(out, code) {
    const f = (/^SITZUNG FEHLER (.*)$/m.exec(out) || [])[1];
    if (f) return { ok: false, grund: "die Welt der Sitzung startet nicht: " + f };
    return { ok: false, ungemessen: true, grund: "die Welt der Sitzung startet nicht (Halter Exit " + code + " ohne Wort — ungemessen): " + out.trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 300) };
}
// legt die Stop-Datei, wartet auf das Ende des Halters, sonst fällt sein Baum; dann löst das Schloss
async function sitzungStoppen(s, stop) {
    fs.writeFileSync(stop, "stop\n");
    const ende = await Promise.race([s.ende, warteMs(90000).then(() => "frist")]);
    if (ende === "frist") baumTot(s.kind.pid);
    fs.writeFileSync(s.datei, s.aus());
    await schlossLoesen(s.schloss);
    return ende;
}
// DER GRUND der Welt (`_grundstellung` des Spiels) in die Datei `datei` (die Grundstellung der Sitzung und jeder Probe liest sie),
// daneben die Zeichenkette der Seite (`zeichner`, zeichnerKette): Rückgabe { ok, n (Größen), s, grund? }
async function grundNehmen(w, datei) {
    const t0 = Date.now();
    try {
        const a = await rufFrist(w, "/eval", { code: GRUND_NIMM }, 60000);
        const e = a && a.ergebnis;
        if (e && e.fehlt) throw new Error("der Kopf trägt `_grundstellung` nicht (Karte w4-grundstellung)");
        if (!e || typeof e.grund !== "string") throw new Error("kein Grund: " + JSON.stringify(a).slice(0, 300));
        const z = await zeichnerRuf(w, null);
        if (z.fehler || !z.abdruck) throw new Error("die Zeichenkette der Seite: " + (z.fehler || JSON.stringify(z).slice(0, 200)));
        e.zeichner = z.abdruck;
        fs.writeFileSync(datei, JSON.stringify(e));
        return { ok: true, n: e.n, s: +((Date.now() - t0) / 1000).toFixed(1) };
    } catch (e) {
        return { ok: false, s: +((Date.now() - t0) / 1000).toFixed(1), grund: "der Grund der Welt: " + String((e && e.message) || e).split("\n")[0] };
    }
}
// DIE GRUNDSTELLUNG vor einer Probe: der Grund (`datei`) kehrt in die laufende Seite zurück, ohne Neuladen; hat eine Probe die Welt
// verlassen, durch die Tür und `/reload` (Ring 8). Rückgabe { ok, s, ms, neu, tuer?, grund? } — ROT nennt die abweichenden Größen.
// `o.abbruch` (Heilung 30.10.): die Probe davor fiel (Deckel, Absturz, Start) — ihre Seiten-Funktion lief weiter (Radeon 3ed96b3f:
// licht.K5#1 am Deckel, der Wetter-Zug drehte Tag-Länge, Wetter und Bühne weiter) und verdarb den Stand. Dann geht die Grundstellung
// IMMER durch die Tür: das Neuladen beendet jede Arbeit der gefallenen Probe in der Seite, ehe der Grund greift.
// DER WEG SEIT DEM GRUND (w4-sitzung-reif, die Wege-Linse `wegeAbweichung`): nennt das Rückspielen an Ort und Stelle einen Weg, den die
// Probe legte, geht die Grundstellung durch die Tür — die Lade-Kette des Speicher-Gesetzes baut Wege-Karte und Natur aus dem Grund
// neu (an Ort und Stelle bleiben beide warm, `_standRueckspielen`); steht der Weg auch danach, ist die Welt ROT beim Namen des Wegs.
// Rückgabe dann zusätzlich `wege` (der Weg, der durch die Tür ging)
// DIE ZEICHENKETTE ZURÜCK (w4-grund-zeichner, zeichnerKette): nach dem Stand gibt die Seite zurück, was eine Probe ihr an der Kette
// verliehen ließ (`kette`: die Größen, die an Ort und Stelle zurückkehrten); was so nie zurückkehrt (das Gerät, ein Glied ohne
// Gedächtnis der Seite), geht durch die Tür (`ketteTuer`) — steht es auch danach, ist die Welt ROT beim Namen der Größe
async function grundstellung(w, datei, o = {}) {
    const t0 = Date.now();
    try {
        if (!datei || !fs.existsSync(datei)) throw new Error("kein Grund der Sitzung (" + datei + ")");
        const g = JSON.parse(fs.readFileSync(datei, "utf8"));
        const spiel = async () => {
            const a = await rufFrist(w, "/eval", { code: grundSpielen(g) }, 120000);
            if (!a || !a.ergebnis) throw new Error("/eval: " + JSON.stringify(a).slice(0, 300));
            return a.ergebnis;
        };
        const kette = async () => {
            if (!g.zeichner) return null;
            const k = await zeichnerRuf(w, g.zeichner, true);
            if (k.fehler || !Array.isArray(k.bleibt)) throw new Error("die Zeichenkette der Seite: " + (k.fehler || JSON.stringify(k).slice(0, 200)));
            return k;
        };
        let z = o.abbruch ? { ok: false, welt: null } : await spiel(), tuer = false;
        const wege = z.ok ? (z.anders || []).find((a) => /^wege\b/.test(a)) || null : null;
        // DAS RÜCKSPIELEN, DAS AN ORT UND STELLE NICHT TRÄGT (Radeon 6a571e3b 02.11., Lauf 2: tore.K3 fiel mitten in der Konformanz
        // des Portals, ihr mitgebrachtes Werkzeug und Material — ohne `name`, `_standRueckspielen` räumt die Säcke je `name` — blieben,
        // „tools materials“ abweichend, die Welt endete vor fahrzeug.K2#1, 9 Proben ungemessen): JEDE Größe, die an Ort und Stelle vom
        // Grund abweicht, geht durch die Tür wie Weg und Kette — die Lade-Kette baut den Stand aus dem Grund neu; im Kopf beim Namen
        // (`anOrt`: die Größen und WIE), nie still. Erst was auch die Tür nicht zurückbringt, beendet die Welt
        const anOrt = z.ok ? (z.anders || []).filter((a) => !/^wege\b/.test(a)) : [];
        const k1 = z.ok && !wege && !anOrt.length ? await kette() : null;
        const ketteTuer = k1 && k1.bleibt.length ? k1.bleibt : null;
        const anOrtWie = anOrt.length ? z.wie || null : null, zustand0 = z.zustand || [];
        if (wege || ketteTuer || anOrt.length) z = { ok: false, welt: null };
        if (!z.ok && z.welt !== g.welt) {
            const t = await rufFrist(w, "/eval", { code: GRUND_TUER(g) }, 60000);
            if (!t || !t.ergebnis || !t.ergebnis.ok) throw new Error("die Tür zurück in die Welt " + g.welt + ": " + JSON.stringify(t).slice(0, 300));
            const n = await rufFrist(w, "/reload", {}, GRUNDSTELLUNG_S * 1000);
            if (!n || n.neu !== true) throw new Error("/reload: " + JSON.stringify(n).slice(0, 300));
            (z = await spiel()), (tuer = true);
            const k2 = z.ok ? await kette() : null;
            if (k2 && k2.bleibt.length)
                (z.anders = (z.anders || []).concat(k2.bleibt)), (z.wie = { ...(z.wie || {}), ...Object.fromEntries(k2.bleibt.map((k) => [k, k2.wie[k] || "?"])) });
        }
        if (!z.ok) throw new Error(z.grund || "das Rückspielen scheitert");
        if (z.anders.length) throw new Error("abweichend vom Grund: " + z.anders.join(" ") + (z.wie ? " · wie " + JSON.stringify(z.wie).slice(0, 600) : ""));
        // das Fenster wie beim Start der Welt (1920×1080): eine Probe davor stellte es vielleicht anders
        const f = await rufFrist(w, "/fenster", {}, 30000);
        if (!f || !Array.isArray(f.fenster)) throw new Error("/fenster: " + JSON.stringify(f).slice(0, 300));
        return { ok: true, s: +((Date.now() - t0) / 1000).toFixed(1), ms: z.ms, neu: z.neu, ...(tuer ? { tuer } : {}), ...(wege ? { wege } : {}),
            ...(k1 && k1.anders.length && !ketteTuer ? { kette: k1.anders } : {}), ...(ketteTuer ? { ketteTuer } : {}),
            ...(anOrt.length ? { anOrt, anOrtWie } : {}),
            ...((() => { const zs = [...new Set([...zustand0, ...(z.zustand || [])])]; return zs.length ? { zustand: zs } : {}; })()) };
    } catch (e) {
        return { ok: false, s: +((Date.now() - t0) / 1000).toFixed(1), grund: String((e && e.message) || e).split("\n")[0] };
    }
}
// DIE GRUNDPROBE (`punkte.cjs grundprobe --baum <Spiel-Baum> [--mutante <zeile>] [--port P]`, Null-Renderer, Karte w4-grundstellung):
// eine Welt des Spiel-Baums (welt-boot `nullSeite`), der Grund über DIESELBE Zeile wie die Sitzung (GRUND_NIMM), dann gräbt der
// Spieler, baut einen Block, sieht von außen und wendet den Blick, steigt in einen Wagen, die Uhr springt, ein Feuer fängt, Regen zieht auf,
// die Tag-Länge springt auf 1e9 (der Wetter-Zug von licht.K5#1, am Deckel ohne sein finally: Radeon 30.10.) und ein Ort-Takt der Werkbank
// hängt an der Seite — und die Grundstellung der Sitzung (`grundSpielen`) spielt den Grund zurück: GRÜN, wenn jede Tat geschah und
// danach keine Größe vom Grund abweicht. `--mutante <zeile>`: das Wort dieser Zeile der GRUND_TAFEL schweigt (`uhr`: der EINE
// Uhr-Schreiber des Spiels, eine Größe des Stands) — gefangen nur, wenn genau `augenblick.<zeile>` (`timeOfDay`) abweicht: die Mutante
// ROT beim Namen. Exit 0 GRÜN bzw. gefangen, 1 sonst.
// Der Leib isst (`activateConsumable`); das Rückspielen ersetzt die Nahrung durch die des Stands (`_loadStateRestoreLeben`) — sonst weicht `playerLeben` ab.
// `--mutante weg` (w4-sitzung-reif): eine Probe legt ihren Weg wie tempo4 (`_stlWegeBuild` mit der Marke `probe:grundprobe`, die Natur
// weicht ihm) und räumt ihn nie — gefangen nur, wenn das Rückspielen an Ort und Stelle genau ihn nennt (die Wege-Linse,
// `wegeAbweichung`); mit `--tuer` spielt die Grundprobe danach wie die Sitzung den Grund durch die Tür zurück, und der Weg ist fort.
// DIE ZEICHENKETTE (w4-grund-zeichner, zeichnerKette): der Grund trägt sie wie in der Sitzung (grundNehmen), nach dem Rückspielen gibt die
// Seite sie zurück (grundstellung) — keine Tat des Spiels darf sie berühren (sonst ROT beim Namen der Größe); `--mutante zeichner`: eine
// Probe bricht sie wie der alte Strom der Wasser-Wand, der mitten im Ring warf (Renderer stumm, Post-Kette aus, ohne Faden, an der
// Sync-Stelle „naht“) — gefangen nur, wenn genau diese fünf Größen abweichen und an Ort und Stelle zurückkehren.
// DER GANG VOR DEM GRUND (w28-bestand-kennung; Radeon df6c4721: der Grund nach `anfang` trug fünf Leiber der Region -1,1, der Spieler
// stand in 0,0 — jede Grundstellung danach fand `creatures` abweichend an „verband/bestand“, 116 von 124 Proben ungemessen): der
// Spieler geht zwei Regionen weit (30 Schritte à 5 Takten), am Ort seines Aufbruchs tritt ein Leib in den Bestand und folgt ihm (sein
// Auftrag hält ihn gezeichnet) — der Grund trägt einen Leib, dessen Tier außerhalb der nahen Regionen ankert, wie der Gang der GPU, an
// dem der Blick die Leiber hält (der Null-Renderer hat keinen Blick: ohne Auftrag ginge jeder sofort). An main b1531071 ROT:
// `creatures` an Ort und Stelle und nach der Tür. `--mutante bestand`: der Stand trägt wieder nur das Nahe (`_bestandReist` =
// `_bestandNah`) — gefangen nur, wenn genau `creatures` abweicht.
const GRUND_GANG = (mut) => `const st = r.state, pm = st.playerMesh.position, S = r._bestandSeite(), x0 = pm.x, z0 = pm.z;
    if (${JSON.stringify(mut || null)} === "bestand") r._bestandReist = () => r._bestandNah();
    const y = (x, z) => r._terrainMacroSurfaceY(x, z);
    const von = r._bestandHier();
    let t = performance.now();
    for (let i = 1; i <= 30; i++) {
        [pm.x, pm.y] = [x0 + (2 * S * i) / 30, y(x0 + (2 * S * i) / 30, z0) + 1];
        for (let k = 0; k < 5; k++) r._gameLoopTick((t += 100));
        await new Promise((f) => setTimeout(f, 0));
    }
    const c = r.spawnCreatureAt(x0, y(x0, z0), z0, "happy", "wesen", { precise: true });
    if (!c) return { fehler: "kein Leib" };
    r.assignCreatureTask(c, "follow_player", {}, { silent: true });
    r._bestandAdoptieren();
    const tier = c.userData._bestand;
    if (!tier) return { fehler: "die Annahme trägt den Leib nicht" };
    c.position.set(pm.x - 4, y(pm.x - 4, pm.z + 3) + 0.5, pm.z + 3);
    const tierKey = r._bestandKey(tier.x, tier.z), R = r._bestandRegionen().regionen[tierKey];
    return { von, nach: r._bestandHier(), tierKey, nah: r._bestandNah(), folgt: !!R && R.tiere.includes(tier) && !tier.zu, fern: r._bestandNah().includes(tierKey) ? 0 : 1 };`;
async function grundProbe(o) {
    const baum = path.resolve(o.baum || "."), port = Number(o.port || 4741);
    const { statikServer, nullSeite } = require(path.join(baum, "scripts", "lib", "welt-boot.cjs"));
    const server = statikServer();
    await server.lausche(port);
    const { browser, page } = await nullSeite({ frist: 600000 });
    const ev = (code) => page.evaluate((c) => new Function("r", "T", "return (async () => { " + c + " })();")(window.anazhRealm, window.THREE), code);
    try {
        await server.zeige(page);
        await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
        // die Welt läuft an (100 Takte à 100 ms Spielzeit), wie vor der ersten mutierenden Probe der Sitzung
        await ev("let t = performance.now(); for (let i = 1; i <= 100; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
        // der Grund trägt einen eigenen Bauplan mit einem Teil OHNE opChain — geboren wie die Werke des Fachwerks (bank_sitzbank …)
        // … und ein trauriges Tier (das Gefühls-Etikett, die Projektion, die das Speicher-Gesetz trägt — wie nach oekologie.K4#2)
        await ev("if (r.state.creatureEmotions.length) r.state.creatureEmotions[0] = \"sad\";");
        await ev("r.createBlueprint(\"grundprobe_alt\", \"Grundprobe alt\"); r.state.blueprints.grundprobe_alt.parts.push({ shape: \"box\", material: \"holz\", position: { x: 0, y: 0.5, z: 0 }, size: { x: 1, y: 1, z: 1 } });");
        const gang = await ev(GRUND_GANG(o.mutante));
        if (!gang || gang.fehler) throw new Error("der Gang: " + JSON.stringify(gang).slice(0, 300));
        const g = await ev(GRUND_NIMM);
        if (!g || typeof g.grund !== "string") throw new Error("kein Grund: " + JSON.stringify(g).slice(0, 300));
        const zg = await ev(zeichnerCode(null));
        if (!zg || !zg.abdruck) throw new Error("die Zeichenkette der Seite: " + JSON.stringify(zg).slice(0, 300));
        g.zeichner = zg.abdruck;
        const tat = await ev(`const st = r.state, q = st.playerMesh.position.clone(), cs = r.constructor.LIFE_FIELD.cell;
            const y = (dx) => r._terrainMacroSurfaceY(q.x + dx, q.z);
            const edit = r.carveVoxel(q.x + 6, y(6) - 1, q.z, 2);
            const bau = !!r.spawnArchitecture("stein_block", { x: q.x + 20, y: y(20), z: q.z }, { werk: true });
            r.setCameraMode("third");
            [st.yaw, st.pitch] = [st.yaw + 1.3, 0.2];
            const ritt = r.mountArchitecture(r.spawnArchitecture("fahrzeug_gt", { x: q.x - 20, y: y(-20) + 0.5, z: q.z }, { silent: true })).ok;
            // die Hand nimmt ein Schwert (eich8 GTX 379e5f56: halten.K1#2 ließ das Langschwert in der Hand, der Grund trug die leere —
            // die Lade-Kette setzte nur volle Slots, die Sitzung endete an „playerEquipped“)
            const hand = !st.player.equipped?.held && r.equipHeld("klinge_langschwert").ok && st.player.equipped.held === "klinge_langschwert";
            // der Leib isst (Radeon 25ac4c0c 01.11.: halten.K5 trank „consume:_k5“ für 600 s, die Grundstellung ließ die Nahrung im Leib —
            // die Lade-Kette legt nur die des Stands dazu —, und 21 Proben danach waren UNGEMESSEN an „playerLeben“)
            const essen = r.activateConsumable("trank_lebenssaft").ok && st.player.boosts.some((b) => b.source === "consume:trank_lebenssaft");
            // der Weg der Probe (Mutante weg): 6 m breit, 60 m lang neben dem Spieler — wie tempo4 und die Straße von fahr-proben
            const weg = ${JSON.stringify(o.mutante || null)} === "weg" ? r._stlWegeBuild({ roads: [{ pts: [{ x: 0, z: 0 }, { x: 0, z: 60 }], w: 6 }] }, { x: q.x + 40, z: q.z - 30 }, "probe:grundprobe") : 0;
            const wegFlaeche = weg ? (${wegeAbdruck})(r).flaechen.find((f) => !${JSON.stringify((g.wege && g.wege.flaechen) || [])}.includes(f)) || null : null;
            r.setTimeOfDay(0.9, "regler");
            for (let i = 0; i < 625 && !r._brandEntfachen(q.x + ((i % 25) - 12) * cs, q.z + (((i / 25) | 0) - 12) * cs); i++);
            let t = performance.now();
            for (let i = 1; i <= 30; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));
            r._setWeather("rainy", "regler");
            st.dayLengthMinutes = 1e9; // der Wetter-Zug von licht.K5#1 (licht-linsen wetterZug), am Deckel ohne sein finally
            delete st.blueprints.grundprobe_alt;
            const plan = r.createBlueprint("grundprobe_neu", "Grundprobe neu");
            const erd = r._erdbauSetzen("grundprobe", [{ art: "platte", cx: q.x + 30, cz: q.z, phi: 0, ex: 3, ez: 3, y: y(30) }], false);
            // der Bestand weicht ab: JEDES Tier fällt (wie das Rudel von oekologie.K4#2 — die Wiederkehr steht vor einer leeren Liste)
            const tiere0 = st.creatures.length;
            for (const c of st.creatures.slice()) r.removeCreature(c);
            const tiere = tiere0 > 1 && st.creatures.length === 0 && st.creatureEmotions.length === 0;
            window.__ortTakt = [];
            const z = r.constructor.GRUND_TAFEL.find((z) => z[0] === ${JSON.stringify(o.mutante || null)});
            if (z) z[2] = () => {};
            if (${JSON.stringify(o.mutante || null)} === "uhr") r._uhrSetzen = () => false;
            // die Mutanten des Stands: die Kette bringt eine Größe nicht zurück — Baupläne (das Laden), Werke (Abriss und Bau), Erdbau
            const mut = ${JSON.stringify(o.mutante || null)};
            if (mut === "bauplaene") r._deserializeBlueprint = () => null;
            if (mut === "werk") (r._bauAusStand = () => false), (r.removeArchitecture = () => {});
            if (mut === "wesen") r._restoreCreatureFromSnapshot = () => false;
            if (mut === "gefuehl") { const S0 = r.spawnCreatures.bind(r); r.spawnCreatures = (...a) => { const x = S0(...a); r.state.creatureEmotions = r.state.creatureEmotions.map(() => "happy"); return x; }; }
            if (mut === "erdbau") { const L = r.loadState.bind(r), E = st.worldMeta.erdbau; r.loadState = (s) => { const x = L(s); r.state.worldMeta.erdbau = E; return x; }; }
            // die Mutante der Zeichenkette: der alte Strom der Wasser-Wand (wasserStrom bis 31.10.), der im Ring warf — nichts kehrt zurück
            if (mut === "zeichner") {
                st.renderer.render = function () {};
                if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
                st.postProcessingFailed = true;
                st.voxelWorker = null;
                r._syncStelle = "naht";
            }
            return { edit, bau, ritt, hand, essen, weg, wegFlaeche, uhr: st.timeOfDay, feuer: st.brandFeld ? st.brandFeld.size : 0, wetter: st.weather, tag: st.dayLengthMinutes, plan, erd, tiere, mutante: !!z || r._uhrSetzen.length === 0 || ["bauplaene", "werk", "erdbau", "wesen", "gefuehl", "weg", "zeichner", "bestand"].includes(mut) };`);
        const z = await ev(grundSpielen(g));
        // die Zeichenkette zurück wie in der Sitzung (grundstellung): je abweichende Größe beim Namen, dann, was bleibt
        const zk = await ev(zeichnerCode(g.zeichner, true));
        // die Mutante bricht, was der Grund heil trug (der Null-Renderer zeichnet nie über die Post-Kette: seine Weiche steht schon im Grund)
        const gz = g.zeichner;
        const zSoll = o.mutante !== "zeichner" ? [] : ["zeichner.renderer.render", "zeichner.renderer.renderAsync"].concat(gz.postProcessingFailed ? [] : ["zeichner.postProcessingFailed"],
            gz.syncStelle === "naht" ? [] : ["zeichner.syncStelle"], gz.faden ? ["zeichner.faden"] : []);
        const zOk = !!zk && Array.isArray(zk.anders) && [...zk.anders].sort().join(" ") === [...zSoll].sort().join(" ") && zk.bleibt.length === 0;
        const soll = !o.mutante ? [] : { uhr: ["timeOfDay"], bauplaene: ["blueprints"], werk: ["architectures"], erdbau: ["worldMeta.erdbau"], wesen: ["creatures", "creatureEmotions"], bestand: ["creatures"], gefuehl: ["creatureEmotions"], weg: ["wege +1 [x0,z0,x1,z1/Formen]"], zeichner: [], nahrung: ["playerLeben"] }[o.mutante] || ["augenblick." + o.mutante];
        const taten = gang.folgt && gang.fern > 0 && gang.von !== gang.nach && tat.edit && tat.bau && tat.ritt && tat.hand && tat.essen &&tat.feuer > 0 && tat.wetter === "rainy" && tat.tag === 1e9 && tat.plan && tat.erd && tat.tiere && (!o.mutante || tat.mutante) && (o.mutante !== "weg" || (tat.weg > 0 && !!tat.wegFlaeche));
        // die Wege-Linse nennt den Weg beim Rechteck seiner Fläche (6 × 66 m, 40 m neben dem Spieler; die Tat nennt sie, wie die Karte sie
        // trägt) — seine Marke nur, solange das Gedächtnis der Seite steht (ein anderes worldMeta beim Rückspielen vergisst `_stlWegeKeys`,
        // WELT_GRENZE): gefangen ist er, wenn genau DIESE neue Fläche abweicht
        const passt = (x) => (o.mutante === "weg" ? x.anders.length === 1 && new RegExp("^wege \\+1 \\[" + String(tat.wegFlaeche).replace(/[.]/g, "\\.") + "\\]( \\(probe:grundprobe\\))?$").test(x.anders[0])
            : JSON.stringify(x.anders) === JSON.stringify(soll));
        let z2 = null;
        // DIE TÜR (`--tuer`): die Seite lädt neu wie in der Sitzung nach einer gefallenen Probe — der Grund durch `_weltBetreten` (abgelegt,
        // aktiv), dann die Seite neu, dann das Rückspielen
        if (o.tuer || o.welt) {
            // `--welt <spec-Pfad>`: zuvor betritt die Seite eine andere Welt wie der Messort buehne (`importWorldBeside` mit reload)
            if (o.welt) {
                const j = JSON.parse(fs.readFileSync(path.join(baum, "spec", o.welt), "utf8"));
                const nav = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });
                const x = await page.evaluate((j) => { const x = window.anazhRealm.importWorldBeside(j, { reload: true }); return x && x.ok ? { id: x.worldId } : { fehler: JSON.stringify(x).slice(0, 200) }; }, j);
                if (x.fehler) throw new Error("die Welt " + o.welt + ": " + x.fehler);
                await nav;
                await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
                await ev("let t = performance.now(); for (let i = 1; i <= 20; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
            }
            const tuer = await ev(GRUND_TUER(g));
            if (!tuer || !tuer.ok) throw new Error("die Tür: " + JSON.stringify(tuer).slice(0, 300));
            await page.reload({ waitUntil: "domcontentloaded" });
            await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
            await ev("let t = performance.now(); for (let i = 1; i <= 20; i++) if ((r._gameLoopTick((t += 100)), i % 5 === 0)) await new Promise((f) => setTimeout(f, 0));");
            // nach der Tür spielt die Sitzung den Grund noch einmal (grundstellung): ohne Mutante und mit dem Weg steht danach jede Größe im Grund
            if (!o.mutante || o.mutante === "weg" || o.mutante === "zeichner") {
                z2 = await ev(grundSpielen(g));
                const zk2 = await ev(zeichnerCode(g.zeichner, true));
                if (!zk2 || !Array.isArray(zk2.anders)) z2.anders.push("zeichner: " + JSON.stringify(zk2).slice(0, 120));
                else z2.anders.push(...zk2.anders);
            }
        }
        const gruen = taten && z.ok && passt(z) && zOk && (!z2 || (z2.ok && z2.anders.length === 0));
        const wie = o.mutante ? "MUTANTE " + o.mutante + (gruen ? " ROT beim Namen" : " NICHT beim Namen gefangen") : gruen ? "GRÜN" : "ROT";
        console.log("GRUNDPROBE " + wie +
            " · Gang " + JSON.stringify(gang) + " · Grund " + g.n + " Größen (" + g.ms + " ms) · Taten " + JSON.stringify(tat) + " · zurück in " + z.ms + " ms, neu " + JSON.stringify(z.neu) +
            " · abweichend: " + (z.anders.join(" ") || "keine") + (z.ok ? "" : " · " + z.grund) + " · Soll " + (soll.join(" ") || "keine") +
            " · Zeichenkette (" + (g.zeichner.renderer ? g.zeichner.renderer.klasse : "kein Renderer") + "): abweichend " + (zk && zk.anders ? zk.anders.join(" ") || "keine" : JSON.stringify(zk)) +
            (zk && zk.anders && zk.anders.length ? " — wie " + JSON.stringify(zk.wie) + " · danach " + (zk.bleibt.join(" ") || "im Grund") : "") + " · Soll " + (zSoll.join(" ") || "keine") +
            (z2 ? " · nach der Tür abweichend: " + (z2.ok ? z2.anders.join(" ") || "keine" : z2.grund) : ""));
        return gruen;
    } finally {
        await browser.close();
        server.close();
    }
}
// ───────────────────────────────── Der Strom ─────────────────────────────────
// DER AUFNEHMER DER SITZUNG (29.10., der Schöpfer: „Eine komplette Fahrt durch jedes System max 30 min, inbegriffen ist dann auch
// die Dauerlast"): über die GANZE Sitzung je präsentiertem Bild der Welt EINE Zeile — die Bild-Zeit (rAF zu rAF unter derselben
// Schleife, nur gerenderte Bilder: `_gpuLeine.gerendert`, wie `werkbank lauf`), der Takt (der ganze rAF-Rückruf: Spiel-Takt samt
// Ort-Takt), VRAM (`__vram`, der Abgriff), die GPU-Summe des Bilds, wenn der Regler sie neu las (`_gpuTsLast`, dieselbe Quelle
// wie `lauf`), Befehle und Dreiecke (`renderer.info` — das Spiel setzt es je Bild zurück, `_loopRender`), Ort, Sicht, Sattel,
// Regler, Tier-Halt, Drossel, Wetter und die Zelle, die eine Probe gerade misst. Der Haken sitzt an `renderer.setAnimationLoop`
// der Seite: er sieht jedes Bild, das eine Schleife zeigt (lauf, haenger, eval, der Loop der Werkbank), nie die Takte von Hand
// (umstellen, band, gpu-bank — sie zeigen kein Bild). Gezapft wird alle STROM_TAKT_MS und an jeder Proben-Grenze (dann trägt der
// Block die Probe); eine neue Seite (Grundstellung, Welt-Tor) zieht ihn beim nächsten Zapfen neu ein. Ein Fehler des Hakens
// stört nie das Spiel und steht gezählt im Strom (`fehler`). Spalten: STROM_SPALTEN; der Leser: stromLesen.
const STROM_SPALTEN = ["t", "dt", "takt", "vram", "gpu", "befehle", "dreiecke", "x", "z", "sicht", "sattel", "voll", "halt", "last", "wetter", "zelle"];
const STROM_TAKT_MS = 1000;
const STROM_FRIST_MS = 10000;
// in der Seite (werkbank /eval, r = die Welt): zieht den Haken ein (einmal je Seite und Renderer), setzt mit a.zelle die Zelle
// der folgenden Bilder (null: keine) und gibt die Zeilen seit dem letzten Zapfen zurück
function stromSeite(r, a) {
    const st = r && r.state, rend = st && st.renderer;
    if (!rend || typeof rend.setAnimationLoop !== "function") return { bereit: false, grund: "kein Renderer" };
    let S = window.__punkteStrom;
    const neu = !S;
    if (!S)
        S = window.__punkteStrom = { seite: Math.random().toString(36).slice(2, 10), ursprung: Math.round(performance.timeOrigin), zeilen: [],
            namen: { wetter: [], zelle: [] }, zelle: -1, tv: null, gpuAm: null, verloren: 0, fehler: 0, letzterFehler: null, rend: null };
    const nr = (liste, x) => {
        let i = liste.indexOf(x);
        if (i < 0) (i = liste.length), liste.push(x);
        return i;
    };
    // JE RENDERER EIN HAKEN, NIE AN EINER LOSEN LEINWAND (w4-fehlt-acht): eine Probe, die der Welt einen Probe-Renderer leiht (lod.K3#1,
    // `__fimpBacke`: `r.state.renderer` je Bake-Schritt), hakte ihn ein, und der nächste Zapfen hakte den der Welt ein ZWEITES Mal — je
    // Bild zwei Zeilen, die zweite mit dt 0 (das p95 der Dauerlast geschönt). Ein Renderer, dessen Leinwand nicht im Dokument hängt,
    // zeichnet kein Bild des Spielers: der Zapfen liest weiter, hakt ihn nie ein
    S.haken = S.haken || new WeakSet();
    const lose = !!rend.domElement && rend.domElement.isConnected === false;
    if (!lose && S.rend !== rend && S.haken.has(rend)) S.rend = rend;
    if (!lose && S.rend !== rend) {
        S.rend = rend;
        S.haken.add(rend);
        const roh = rend.setAnimationLoop;
        const bild = (t, c0, g0) => {
            const L = r._gpuLeine;
            if (!L || !(L.gerendert > g0)) return;
            const c1 = performance.now(), dt = S.tv == null ? -1 : t - S.tv;
            S.tv = t;
            let gpu = -1;
            if (r._gpuTsAtMs !== S.gpuAm) {
                S.gpuAm = r._gpuTsAtMs;
                if (Number.isFinite(r._gpuTsLast)) gpu = r._gpuTsLast;
            }
            const v = window.__vram, i = rend.info && rend.info.render, p = st.playerMesh && st.playerMesh.position, z = S.zeilen;
            if (z.length >= 120000) (z.splice(0, 20000), (S.verloren += 20000));
            z.push([+t.toFixed(1), dt < 0 ? -1 : +dt.toFixed(2), +(c1 - c0).toFixed(2), v ? +((v.puffer + v.texturen) / 1048576).toFixed(1) : -1,
                gpu >= 0 ? +gpu.toFixed(2) : -1, i ? i.drawCalls : -1, i ? Math.round(i.triangles) : -1, p ? +p.x.toFixed(1) : 0, p ? +p.z.toFixed(1) : 0,
                st.cameraMode === "first" ? 1 : st.cameraMode === "third" ? 2 : 0, st.player && st.player.mountedArch ? 1 : 0, st.perfTargetMs >= 1000 ? 1 : 0,
                Object.getPrototypeOf(r).__tiereGehalten ? 1 : 0, st.perfSense ? +st.perfSense.loadScale.toFixed(2) : -1, nr(S.namen.wetter, String(st.weather)), S.zelle]);
        };
        const huelle = (cb) =>
            function (t, x) {
                const c0 = performance.now(), L = r._gpuLeine, g0 = L ? L.gerendert : 0;
                try {
                    return cb.call(this, t, x);
                } finally {
                    try {
                        bild(t, c0, g0);
                    } catch (e) {
                        S.fehler++;
                        S.letzterFehler = String((e && e.message) || e).slice(0, 160);
                    }
                }
            };
        // der Haken trägt seine Marke: die Zeichenkette der Seite (zeichnerKette) zählt ihn nie als Fremdkörper
        const haken = function (cb) {
            S.tv = null;
            return roh.call(this, typeof cb === "function" ? huelle(cb) : cb);
        };
        haken.__punkteHaken = true;
        rend.setAnimationLoop = haken;
        // eine Schleife, die vor dem Haken lief, fährt ab jetzt durch ihn
        const a0 = rend._animation && rend._animation._animationLoop;
        if (typeof a0 === "function") rend.setAnimationLoop(a0);
    }
    if (a && "zelle" in a) S.zelle = a.zelle == null ? -1 : nr(S.namen.zelle, String(a.zelle));
    const zeilen = S.zeilen;
    S.zeilen = [];
    const lies = (f) => {
        try {
            return f();
        } catch (_e) {
            return null;
        }
    };
    const m = performance.memory;
    return {
        bereit: true, neu, seite: S.seite, ursprung: S.ursprung, zeilen, namen: S.namen, verloren: S.verloren, fehler: S.fehler, letzterFehler: S.letzterFehler,
        heap: m ? +(m.usedJSHeapSize / 1048576).toFixed(1) : null, skala: lies(() => r._szeneSkalaWirk()),
        buehne: lies(() => st.creatures.filter((c) => c.userData && c.userData.buehne).length),
        stempel: lies(() => (window.__stempelWache ? window.__stempelWache().ueberlauf : null)),
        uhr: Number.isFinite(st.timeOfDay) ? +st.timeOfDay.toFixed(3) : null, chunks: st.voxelChunks ? st.voxelChunks.size : null,
        // der Ort des Spielers und der gebaute Ring je Zapfen (30.10.: wo jede Probe stand und wie lange ihr Ring brauchte — auch ohne Bild)
        ort: lies(() => [+st.playerMesh.position.x.toFixed(1), +st.playerMesh.position.z.toFixed(1)]), ring: lies(() => r._builtRingRadius()),
        // was die Welt noch baut (band-urteil `einschwingOffen`: Foundry, Karten-Bake, Dorf, Streu, Chunks) — die Zeit einer Probe nach Ursache
        offen: lies(() => (typeof window.__einschwingOffen === "function" ? Object.keys(window.__einschwingOffen(r)) : null)),
    };
}
const stromCode = (a) => "return (" + stromSeite.toString() + ")(r, " + JSON.stringify(a || {}) + ");";
// EIN Zapfen: die Zeilen seit dem letzten an den Strom (eine JSON-Zeile je Block, mit der Probe); Rückgabe { ok, n?, grund? } —
// wirft nie (ein Zapfen, der scheitert, ist eine Lücke im Strom, nie ein Bruch der Probe)
async function stromZapfen(w, datei, probe, a = {}) {
    let e;
    try {
        const x = await rufFrist(w, "/eval", { code: stromCode(a) }, STROM_FRIST_MS);
        e = x && x.ergebnis;
        if (!e) throw new Error((x && typeof x.fehler === "string" && x.fehler) || "kein Ergebnis");
    } catch (x) {
        return { ok: false, grund: String((x && x.message) || x).split("\n")[0].slice(0, 200) };
    }
    if (!e.bereit) return { ok: false, grund: e.grund || "nicht bereit" };
    fs.appendFileSync(datei, JSON.stringify({ probe, zeit: new Date().toISOString(), ...e }) + "\n");
    return { ok: true, n: e.zeilen.length, seite: e.seite, fehler: e.fehler };
}
// EINE Marke im Strom (eine Probe nennt einen Stand der Welt beim Namen, z. B. den GC-Stand am Anfang der Dauer)
function stromMarke(datei, probe, marke, wert) {
    fs.appendFileSync(datei, JSON.stringify({ probe, zeit: new Date().toISOString(), marke, wert }) + "\n");
}
// DER LESER des Stroms: { bilder: [{ probe, seite, block, wand, …STROM_SPALTEN, uhr, skala, buehne, heap, stempelOk }], marken: [{ probe,
// zeit, marke, wert, bild }], bloecke, seiten, fehler, verloren } — wand = die Wanduhr des Bilds (ms seit 1970), stempelOk: im Block lief
// der Stempel-Pool nicht über, bild = die Zahl der Bilder vor der Marke
function stromLesen(datei) {
    const o = { bilder: [], marken: [], bloecke: 0, seiten: [], fehler: 0, verloren: 0, orte: [] };
    if (!fs.existsSync(datei)) return o;
    const stempelVor = new Map();
    for (const zeile of fs.readFileSync(datei, "utf8").split(/\r?\n/)) {
        if (!zeile.trim()) continue;
        let b;
        try {
            b = JSON.parse(zeile);
        } catch (_e) {
            continue;
        }
        if (b.marke) {
            o.marken.push({ probe: b.probe, zeit: b.zeit, marke: b.marke, wert: b.wert, bild: o.bilder.length });
            continue;
        }
        const block = o.bloecke++;
        if (Array.isArray(b.ort)) o.orte.push({ probe: b.probe, block, ort: b.ort, ring: b.ring });
        if (!o.seiten.includes(b.seite)) o.seiten.push(b.seite);
        o.fehler = Math.max(o.fehler, b.fehler || 0);
        o.verloren = Math.max(o.verloren, b.verloren || 0);
        const sv = stempelVor.get(b.seite);
        const stempelOk = b.stempel == null || sv == null || b.stempel === sv;
        if (b.stempel != null) stempelVor.set(b.seite, b.stempel);
        for (const z of b.zeilen || []) {
            const f = { probe: b.probe, seite: b.seite, block, wand: b.ursprung + z[0], uhr: b.uhr, skala: b.skala, buehne: b.buehne, heap: b.heap, stempelOk };
            STROM_SPALTEN.forEach((k, i) => (f[k] = z[i]));
            f.wetter = (b.namen && b.namen.wetter[f.wetter]) || null;
            f.zelle = f.zelle >= 0 ? (b.namen && b.namen.zelle[f.zelle]) || null : null;
            o.bilder.push(f);
        }
    }
    return o;
}
// der Kopf des Stroms für die Mess-Datei (m.sitzung.strom): die Dauerlast der ganzen Sitzung — Bilder, Bild-p95, Takt-p95, VRAM
const p95Von = (a) => {
    const s = a.filter(Number.isFinite).sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
};
// DER ORT IM DECKEL (w4-stationen-schnell-b; GTX b4bcf19c: licht.K5#1 69 s, mensch.K5#1 50,5 s, gelaende.K2 64,1 s — jede zog im eigenen
// Deckel an einen Ort, den die Sitzung nicht stellte, und zahlte seinen kalten Ring, 11–28 s je Ankunft an der GTX): je Probe der
// weiteste Weg des Spielers (`ort` jedes Zapfens) ab dem Ort, an dem die Sitzung sie begann (der letzte Zapfen vor ihrem ersten) —
// über ORT_IM_DECKEL_M (weiter als der Ring um den Spieler reicht) beim Namen, mit dem kleinsten gebauten Ring in ihr (`ring` < dem
// des Anfangs: der Ring fiel und wuchs neu). Rückgabe [{ probe, m, ringVor, ringMin }], die weitesten zuerst
const ORT_IM_DECKEL_M = 250;
function ortImDeckel(orte, grenzeM = ORT_IM_DECKEL_M) {
    const je = new Map();
    let vor = null;
    for (const z of orte || []) {
        if (z.probe !== (vor && vor.probe) && !je.has(z.probe)) je.set(z.probe, { probe: z.probe, von: vor ? vor.ort : z.ort, ringVor: vor ? vor.ring : z.ring, m: 0, ringMin: z.ring });
        const e = je.get(z.probe);
        if (e && (z.probe !== "(sitzung)")) {
            e.m = Math.max(e.m, Math.hypot(z.ort[0] - e.von[0], z.ort[1] - e.von[1]));
            if (Number.isFinite(z.ring)) e.ringMin = Number.isFinite(e.ringMin) ? Math.min(e.ringMin, z.ring) : z.ring;
        }
        vor = z;
    }
    return [...je.values()].filter((e) => e.probe !== "(sitzung)" && e.m > grenzeM).map((e) => ({ probe: e.probe, m: Math.round(e.m), ringVor: e.ringVor, ringMin: e.ringMin }))
        .sort((a, b) => b.m - a.m);
}
function stromKopf(datei, zaehler) {
    const s = stromLesen(datei);
    const dt = s.bilder.filter((b) => b.dt >= 0);
    return { datei: path.basename(datei), bilder: dt.length, frameP95: p95Von(dt.map((b) => b.dt)), taktP95: p95Von(dt.map((b) => b.takt)),
        vramMax: s.bilder.length ? s.bilder.reduce((m, b) => Math.max(m, b.vram), -Infinity) : null, seiten: s.seiten.length, marken: s.marken.length,
        fehler: s.fehler, verloren: s.verloren, ortImDeckel: ortImDeckel(s.orte), ...zaehler };
}

// DIE REIHE DER SITZUNG (29.10., EINE Fahrt durch jedes System ≤ 30 min samt Dauerlast): zuerst `stellung: "anfang"`, dann jede
// Probe, die die Welt lässt, dann `stellung: "ende"`, dann jede mutierende (`mutiert: true`) — die Dauer von anfang bis ende lebt
// in EINER Seite ohne Neuladen; je in der Gruppe die Reihe der Liste
const stellungVon = (g) => (g[0].probe && g[0].probe.stellung) || null;
const mutiertVon = (g) => g.some((st) => !!(st.probe && st.probe.mutiert));
// DER ORT EINER PROBE (30.10., Eichlauf a53152c2: 14 von 19 Proben fielen am ×3-Deckel, sie warteten im eigenen `/umstellen` auf den
// Ring ihres Messorts — nach jeder Tür kalt): der erste Messort, an den ihr Befehl umstellt (`umstellen --ort X` der Werkbank, `/umstellen
// { ort: "X" }` des Tors), aus dem Befehl selbst gelesen — nie eine zweite Liste; null: sie nennt keinen (Koordinaten, ein Ort aus einer
// Variablen). In der Gruppe stehen die Proben eines Orts beieinander (die Reihe ihres ersten Auftritts), die ohne Ort zuletzt
// (der vierte: der Plan eines Vegetations-Laufs, `[[Ort, Sicht, …], …]` als letztes Argument — sein erster Stand, w4-sitzung-reif)
// (der fünfte, w12-proben-frist: der Messort aus der EINEN Quelle der Orte — `messort("X")` von welt-orte, `ladeSpec("X")` von
// band-urteil, beide lesen spec/profiband/haushalt.json `spieler` wie `umstellen --ort X` — an den die Probe den Leib selbst setzt;
// Radeon 8ef49bef: leib.K4#2 1103 m, klang.K5#2 1110 m, speicher.K4#2 1166 m, fahrzeug.K2#1 2014 m im eigenen Deckel gezogen, je
// Ankunft ein kalter Ring von 11–20 s nach der Tür; jetzt stellt die Sitzung sie vor dem Deckel an die Wiese)
const ORT_MUSTER = [/umstellen\\?",\\?"--ort\\?",\\?"([a-z0-9_-]+)/, /umstellen\\?", \{ ort: \\?"([a-z0-9_-]+)/, /umstellen --ort ([a-z0-9_-]+)/,
    / \[\["([a-z0-9_-]+)","(?:ego|third)",/, /\b(?:messort|ladeSpec)\(\\?"([a-z0-9_-]+)\\?"\)/];
const probeOrt = (st) => {
    const text = [].concat((st.probe && st.probe.befehl) || []).map(String).join(" ");
    for (const re of ORT_MUSTER) {
        const m = re.exec(text);
        if (m) return m[1];
    }
    return null;
};
const nachOrt = (gs) => {
    const orte = [...new Set(gs.map((g) => probeOrt(g[0])).filter(Boolean))];
    const rang = (g) => (probeOrt(g[0]) ? orte.indexOf(probeOrt(g[0])) : orte.length);
    return gs.map((g, i) => [g, i]).sort((a, b) => rang(a[0]) - rang(b[0]) || a[1] - b[1]).map(([g]) => g);
};
// zuletzt (fahrtWellen `haengt`, ctx.zuletzt): die Schlüssel der Läufe, die am Ende ihrer Klasse fahren, nach jedem Ort
const sitzungsReihe = (gruppen, zuletzt = null) => {
    const spaet = (g) => !!zuletzt && zuletzt.has(schluessel(g[0]));
    const klasse = (gs) => [...nachOrt(gs.filter((g) => !spaet(g))), ...gs.filter(spaet)];
    return [
        ...gruppen.filter((g) => stellungVon(g) === "anfang"),
        ...klasse(gruppen.filter((g) => !stellungVon(g) && !mutiertVon(g))),
        ...gruppen.filter((g) => stellungVon(g) === "ende"),
        ...klasse(gruppen.filter((g) => !stellungVon(g) && mutiertVon(g))),
    ];
};
// DIE WELLEN DER FAHRT (13.11., pm-ernte; die Meisterkarte 219/330, seit dem 07.11. netto +1: 24 Paare standen „die Fahrt riss 1800 s
// (vor ankunft.K4#1)“, mensch.K4, vegetation.K5, leib.K3, klang.K5 warteten auf EIN frisches GRÜN): die Radeon braucht für eine volle
// Fahrt Σ ~12 400 s (eichtafel, 8 Teile), der Dienst bekommt Fenster von 10–30 min, jeder neue Kopf macht die Liste wieder alt — und
// die Reihe war fest: jede Fahrt begann mit denselben Proben (gelaende.K5#2, vegetation.K2#1, material.K2#1 194 s, alle GRÜN gehalten),
// die mutierenden und die hinteren erreichte sie nie. Jetzt (run, vor der Sitzung):
//   DIE WELLEN, je eine eigene Sitzung mit eigener Fortsetzung (ein Boot kostet ~6 s, ein Ort ~30 s — die Reihe der Klassen ordnet nur
//          IN der Sitzung, die mutierenden fahren dort nach 20 min Dauer; erst die Welle bringt sie nach vorn):
//          1 NAH  hebt (die Messung auf DIESEM Gerät kann die Punkte ändern: gtxNutzen, die EINE Punkte-Regel über das Frische-Urteil
//                 der Buchung) UND eine Station des Laufs sprach ihr jüngstes Urteil auf irgendeinem Gerät GRÜN (mensch.K4#1: GTX GRÜN,
//                 Radeon ROT; vegetation.K5#2, leib.K3#2, klang.K5#2: GTX GRÜN, die Radeon fehlt) — EIN frisches GRÜN bucht;
//          2 HEBT der übrige Lauf, der Punkte ändern kann; 3 der REST;
//          `anfang` fährt in der Welle des `ende` (die Dauer lebt eine Sitzung);
//   in jeder Welle wer am längsten keinen Lauf auf der Karte hatte, zuerst (nie = ganz vorn; ein Platzhalter „die Fahrt riss“, „die Welt
//          der Sitzung trägt nicht“, ein Schloss, das nie kam, ist kein Lauf) — jede Lücke erntet, was am ältesten ist;
//   wer seit seinem letzten Urteil HAENGT_RISSE Mal an der Leine riss (ankunft.K4#1 28×, gelaende.K2 32×), fährt am Ende seiner Klasse
//          (`haengt` → sitzungsReihe zuletzt) — eine reißende Probe frisst nie die Fahrt der anderen.
// Die Reihe anfang · lässt · ende · ändert (sitzungsReihe) bleibt in jeder Welle; sie ordnet stabil, die Wellen-Reihe gilt in ihren Klassen.
// gruppen: die Läufe (gruppiere) · ms: ladeMessungen() · hebt: Set der Schlüssel oder null (ohne: eine Welle)
// → { wellen: [[gruppe]] ohne leere, namen: ["nah"|"hebt"|"rest"], haengt: Set der Schlüssel, je }
const HAENGT_RISSE = 2;
const NIE_GEFAHREN = /die Fahrt riss|die Welt der Sitzung (trägt|endete|startet)|GPU-Schloss|Schloss nie|der Farm-Lauf trug kein Urteil/;
function fahrtWellen(gruppen, geraet, ms, hebt) {
    const zuletzt = new Map(); // Schlüssel → jüngste Zeit eines echten Laufs auf DIESER Karte
    const urteil = new Map(); // Schlüssel|Gerät → das jüngste Urteil { z, gruen } auf jedem Gerät
    for (const m of ms)
        for (const x of [m.je, m.ungemessen])
            for (const [id, e] of Object.entries(x || {})) {
                if (!e || NIE_GEFAHREN.test(String(e.grund || ""))) continue;
                const z = String(e.zeit || m.zeit || "");
                if ((!m.geraet || m.geraet === geraet) && z > (zuletzt.get(id) || "")) zuletzt.set(id, z);
                const w = id + "|" + (m.geraet || "");
                if (x === m.je && !e.ungemessen && z > ((urteil.get(w) || {}).z || "")) urteil.set(w, { z, gruen: e.gruen === true });
            }
    const gruenIrgendwo = (id) => GERAETE.some((g) => (urteil.get(id + "|" + g) || {}).gruen === true);
    const je = gruppen.map((g, i) => {
        const ids = g.map(schluessel);
        const z = ids.map((id) => zuletzt.get(id) || "").sort()[0]; // die älteste Station des Laufs trägt ihn
        const reihe = g.flatMap((st) => laufSekunden(ms, geraet, schluessel(st))).sort((a, b) => b.zeit.localeCompare(a.zeit));
        const vorn = reihe.findIndex((x) => x.gemessen), risse = (vorn < 0 ? reihe : reihe.slice(0, vorn)).filter((x) => x.zensiert).length;
        const h = !!hebt && ids.some((id) => hebt.has(id));
        return { g, i, ids, z, risse, haengt: risse >= HAENGT_RISSE, welle: !hebt ? "rest" : h && ids.some((id) => hebt.has(id) && gruenIrgendwo(id)) ? "nah" : h ? "hebt" : "rest" };
    });
    // anfang in die Welle des ende
    const ende = je.find((x) => stellungVon(x.g) === "ende");
    if (ende) for (const x of je) if (stellungVon(x.g) === "anfang") x.welle = ende.welle;
    const ordne = (xs) => xs.sort((a, b) => a.z.localeCompare(b.z) || a.i - b.i);
    const namen = ["nah", "hebt", "rest"].filter((n) => je.some((x) => x.welle === n));
    const wellen = namen.map((n) => ordne(je.filter((x) => x.welle === n)));
    return { wellen: wellen.map((xs) => xs.map((x) => x.g)), namen, haengt: new Set(je.filter((x) => x.haengt).map((x) => x.ids[0])), je: wellen.flat() };
}
// eine Probe, die abbrach (Deckel, die eigene Frist, Absturz, Start), ließ die Welt vielleicht mitten im Werk — danach die Grundstellung
const brachAb = (es) => es.some((e) => /^(Deckel |Frist der Probe |Absturz|Start:)/.test(e.grund || ""));
// DIE WELT STEHT, wo der Spieler steht (DER WARME START, fahreSitzung): das EINE Einschwingen von welt-boot (`__weltStehtNach`, jede Seite
// der Werkbank trägt es, WARTEN_SEITE) — kein Messort, kein Umstellen: der Spieler bleibt, wo Boot, Grundstellung oder Tür ihn ließen
const WELT_STEHT = "await __weltDa(); const takte = await __weltStehtNach(); return { takte, chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0, ring: r._builtRingRadius() };";

/// DIE EICH-FAHRT (w4-sitzung-eichen; takt25c GTX an 6b3da705: 36 von 38 Proben rissen ihren geschätzten Deckel und standen UNGEMESSEN):
// `run --eich` fährt die Proben ohne Eich-Zahl am SHA (eichOffen) an derselben Leine wie jede Fahrt und trägt je Probe `eich` — ihre
// Sekunden s und ihren Grund-Deckel sek; an der Leine gefallen (Stille, Anteil, Frist) ist die Zahl zensiert (`gerissen`, eine Untergrenze).
// Der Deckel ändert nie ein Urteil (bis 10.11. hieß ein GRÜN über 45 s „das Urteil zählt nie“ — eine Wanduhr urteilte). Was keine Zahl der
// Probe ist (die Welt endete, die Fahrt riss, kein Schloss), bleibt, wie es fiel
function eichEintrag(st, e, geraet) {
    const am = !!e.ungemessen && RISS_GRUND.test(e.grund || "");
    if (e.ungemessen && !am) return e;
    return { ...e, eich: { s: e.s, sek: probeSek(st, geraet), ...(am ? { gerissen: true } : {}) } };
}
// die Stationen ohne Eich-Zahl am SHA: m = die Mess-Datei des Geräts (oder null), ab(st) = der Abdruck heute — eine Zahl zählt nur zum
// Abdruck, an dem sie fiel (eine geänderte Probe eicht neu)
const eichOffen = (meine, m, sha, ab) =>
    meine.filter((st) => !(m && m.sha === sha && [m.je, m.ungemessen].some((x) => x && x[schluessel(st)] && x[schluessel(st)].eich && x[schluessel(st)].abdruck === ab(st))));
// DIE DECKEL-TAFEL AUS DEN GRÜN-LÄUFEN (10.11., pm-deckel; die Inventur 07.11.: 62 Stationen trugen 10 s, ihre Grün-Läufe brauchten median
// 44,6 s, max 84 s — 248 Risse dort —, weil `laufSekunden` jeden gemessenen Lauf in die Reihe legte, auch das ROT nach 2 s, und das p90
// unter den Boden von 10 s fiel): EINE Quelle je Probe und Karte — die Sekunden ALLER Mess-Dateien DIESER Karte (laufSekunden), nie einer
// Fahrt, nie eines fremden Geräts. DIE REGEL: das p90 der jüngsten DECKEL_REIHE_N GRÜN-Läufe (Rang ⌈0,9 × n⌉), ⌈EICH_FAKTOR × p90⌉ + 6 s
// Vorlauf der Frist; mit weniger als DECKEL_GRUEN_MIN Grün-Läufen die Vorgabe der Station (probe.sek, mindestens PROBE_DECKEL_S), nie unter
// dem Deckel heute (ohne Grün-Reihe sinkt nichts: gelaende.K2, leib.K4 tragen 90 s und rissen dort); NIE unter
// dem höchsten je gemessenen Urteil + Vorlauf (GRÜN oder ein ROT, das sein Maß sprach — der schnelle Fehlschlag drückt nie nach unten, das
// langsame Urteil trägt immer); höchstens ein Teil der Fahrt je Teil der Probe. Ein Lauf an der Leine (zensiert) trägt nie: sein Bedarf ist
// unbekannt, die Leine gibt ihm in jeder Fahrt mit Rest mehr. Ein Deckel ist kein Urteil: das Urteil der Station bleibt Byte für Byte.
// DIE RUHE: ein Deckel heute zwischen ⌈1,1 × p90⌉ + 6 und ⌈EICH_FAKTOR × p90⌉ + 6 bleibt (ein neuer Deckel ändert den Abdruck). DIE FAHRT
// bindet die Tafel nie: was über FAHRT_MAX_S reicht, misst die Fortsetzung (fahreFortsetzung), höchstens FAHRT_TEILE_MAX Teile (fahrtUrteil)
// FRIST_VORLAUF_S: die Probe hat Deckel − 6 s (FRIST_S in stationen/sitzung-seite.js, frist in stationen/seite.cjs) — der Deckel trägt ihre
// Zahl erst mit diesem Vorlauf (Radeon 25ac4c0c mit ⌈1,45 × s⌉: siedlung.K5 13,3 s an der Frist 14 s, halten.K1#2 15 s an 16 s gerissen)
const EICH_FAKTOR = 2, EICH_FAKTOR_MIN = 1.1, FRIST_VORLAUF_S = 6, DECKEL_REIHE_N = 10, DECKEL_P = 0.9, DECKEL_GRUEN_MIN = 3;
const RISS_GRUND = /^(Deckel|Frist der Probe) \d+(\.\d+)? s gerissen/;
// jeder Lauf der Probe `id` auf der Karte aus allen Mess-Dateien ms, der jüngste zuerst: { s, gruen, gemessen, zensiert, zeit, sha } —
// gemessen: ein Urteil fiel (GRÜN oder ROT im Maß), zensiert: an der Leine oder der eigenen Frist gefallen (ein Zwilling erbt den Lauf der
// ersten Station, er zählt nie zweimal; „die Welt endete“, „die Fahrt riss“, kein Schloss, Fremd-Last sind keine Zahl der Probe)
function laufSekunden(ms, geraet, id) {
    const es = [];
    for (const m of ms) {
        if (m.geraet && m.geraet !== geraet) continue;
        for (const x of [m.je, m.ungemessen]) {
            const e = x && x[id];
            if (!e || e.zwilling) continue;
            const mit = (s, gemessen, gruen) => es.push({ s, gruen: !!gruen, gemessen: !!gemessen, zensiert: !gemessen, zeit: String(e.zeit || ""), sha: m.sha });
            // die Eich-Fahrt bis 10.11.: am Eich-Deckel zensiert, „über dem Gesetz“ ein Urteil, das nie zählte (eich.urteil) — die Zahl trägt
            if (e.eich) {
                if (e.eich.gerissen) mit(e.eich.s || 90, false);
                else if (!e.ungemessen) mit(e.eich.s, true, e.gruen === true);
                else if (e.eich.urteil) mit(e.eich.s, true, e.eich.urteil === "GRÜN");
            } else if (e.modus !== "session" || !(e.s > 0)) continue;
            else if (!e.ungemessen) mit(e.s, true, e.gruen === true);
            // an der Leine oder an der eigenen Frist N: die Untergrenze ist das größere von s und N (bauen.K5#2 Radeon: „Frist der Probe
            // 33 s gerissen“ nach 29,2 s Prozess — die Probe zählt ihre Frist selbst)
            else if (RISS_GRUND.test(e.grund || "")) mit(Math.max(e.s, Number(RISS_GRUND.exec(e.grund)[0].match(/\d+(\.\d+)?/)[0])), false);
        }
    }
    return es.sort((a, b) => b.zeit.localeCompare(a.zeit));
}
// der Deckel aus der Reihe: { p90, n, hoch, zensiert, neu } oder null (ohne Lauf); vorgabe = der Deckel ohne Grün-Reihe, sek = der Deckel
// heute (DIE RUHE), teile = die Teil-Proben (der Deckel gilt je Teil)
// DER DECKEL OHNE GRÜN-REIHE LERNT AUCH (11.11., Koordinator; die Mess-Dateien beider Karten): (a) eine Station, die ROT misst, bekommt
// nie drei Grün-Läufe — ihr Deckel stand am langsamsten Urteil + 6 s und riss an jeder Schwankung (Radeon lod.K1#1: Urteile nach
// 74–86 s am Deckel 90, drei Risse am 10./11.11.; lod.K5#1 30–40 s am Deckel 43; haar.K2#1, leib.K1#1, studios.K4#1 ebenso): ohne
// Grün-Reihe trägt das p90 ihrer jüngsten GEMESSENEN Läufe denselben Faktor (der langsamste je bleibt der Boden — der schnelle
// Fehlschlag drückt nie nach unten). (b) eine Station, die an jedem Deckel reißt, blieb für immer ungemessen: „ein Lauf an der Leine
// trägt nie, die Leine gibt ihm in jeder Fahrt mit Rest mehr“ — die volle Fahrt hat nie Rest (Σ Bedarf > Fahrt: der Anteil ist der
// Grund-Deckel). ankunft.K4#1 riss so 7 von 7 Läufen je Karte, leib.K4#2 an 10 · 39 · 84 · 90 · 139 s. Jetzt verdoppelt der jüngste
// Riss den Deckel (seine Untergrenze × EICH_FAKTOR + Vorlauf), bis ein Urteil fällt — oder die Untergrenze ZENSIERT_HAENGT_S erreicht:
// dann hängt die Probe (GTX gelaende.K2#2 lief 1 759 s mit Lebenszeichen), ihr Deckel fällt auf Vorgabe und Boden zurück, `haengt`
// nennt es. Nur die Risse seit dem jüngsten Urteil zählen (die führenden der Reihe).
const ZENSIERT_HAENGT_S = 300;
function deckelAus(reihe, vorgabe, sek, teile = 1) {
    if (!reihe.length) return null;
    const p90Von = (xs) => (xs.length >= DECKEL_GRUEN_MIN ? xs[Math.ceil(DECKEL_P * xs.length) - 1] : null);
    const gruen = reihe.filter((x) => x.gruen).slice(0, DECKEL_REIHE_N).map((x) => x.s).sort((a, b) => a - b);
    const p90 = p90Von(gruen);
    const hoch = Math.max(0, ...reihe.filter((x) => (p90 == null ? x.gemessen : x.gruen)).map((x) => x.s));
    const boden = hoch > 0 ? Math.ceil(+hoch.toFixed(6)) + FRIST_VORLAUF_S : 0;
    const aus = (f, p = p90) => Math.ceil(+(f * p).toFixed(6)) + FRIST_VORLAUF_S;
    const ruhe = (p) => (sek >= aus(EICH_FAKTOR_MIN, p) && sek <= aus(EICH_FAKTOR, p) ? sek : aus(EICH_FAKTOR, p));
    // (a) ohne Grün-Reihe: das p90 der jüngsten gemessenen Läufe
    const p90m = p90 == null ? p90Von(reihe.filter((x) => x.gemessen).slice(0, DECKEL_REIHE_N).map((x) => x.s).sort((a, b) => a - b)) : null;
    let roh = p90 == null ? Math.max(vorgabe, sek, boden, p90m == null ? 0 : ruhe(p90m)) : Math.max(boden, ruhe(p90));
    // (b) die führenden Risse der Reihe (seit dem jüngsten Urteil)
    const vorn = reihe.findIndex((x) => x.gemessen), risse = (vorn < 0 ? reihe : reihe.slice(0, vorn)).filter((x) => x.zensiert);
    const unten = Math.max(0, ...risse.map((x) => x.s)), haengt = unten >= ZENSIERT_HAENGT_S;
    const ausRiss = !haengt && unten > 0 && aus(EICH_FAKTOR, unten) > roh; // der Riss trägt den Deckel (sonst trägt ihn schon die Reihe oder die Vorgabe)
    if (haengt) roh = Math.max(vorgabe, boden);
    else if (ausRiss) roh = aus(EICH_FAKTOR, unten);
    return { p90, n: gruen.length, hoch, zensiert: reihe.filter((x) => x.zensiert).length, ...(p90m != null ? { p90m } : {}), ...(unten > 0 ? { unten } : {}), ...(ausRiss ? { ausRiss: true } : {}), ...(haengt ? { haengt: true } : {}),
        neu: Math.min(Math.floor((FAHRT_MAX_S - SITZUNG_BOOT_S) / teile), roh) };
}
// DIE TAFEL (`eichtafel`, der Leser der Zahlen): je Lauf der Sitzung sein Deckel heute, das p90 seiner Grün-Reihe und der Deckel aus ihr; Σ
// heute ↔ aus den Zahlen und die Teile der Fahrt. ms = die Mess-Dateien (ladeMessungen)
function eichTafel(stationen, ms, geraet) {
    const reihe = sitzungsReihe(gruppiere(stationen.filter((st) => st.probe && geraeteVon(st).includes(geraet))));
    // der Ort im Deckel der jüngsten Sitzung der Karte (stromKopf `ortImDeckel`): wie weit der Lauf im eigenen Deckel zog — der Täter beim Namen
    const letzte = ms.filter((m) => (!m.geraet || m.geraet === geraet) && m.sitzung && m.sitzung.strom)
        .sort((a, b) => String(b.zeit || "").localeCompare(String(a.zeit || "")))[0];
    const ort = new Map(((letzte && letzte.sitzung.strom.ortImDeckel) || []).map((e) => [e.probe, e.m]));
    const zeilen = reihe.map((g) => {
        const sek = probeSek(g[0], geraet), vorgabe = Math.max(PROBE_DECKEL_S, sekRoh(g[0]));
        const d = deckelAus(g.flatMap((st) => laufSekunden(ms, geraet, schluessel(st))).sort((a, b) => b.zeit.localeCompare(a.zeit)), vorgabe, sek, teileVon(g[0]));
        const neu = d ? d.neu : null;
        const urteil = !d ? "ohne Zahl"
            : d.haengt ? "HÄNGT: riss noch bei " + d.unten + " s (≥ " + ZENSIERT_HAENGT_S + " s) — der Deckel fällt zurück"
            : d.p90 == null ? d.n + " Grün-Läufe (unter " + DECKEL_GRUEN_MIN + ") — die Vorgabe " + Math.max(vorgabe, sek) + " s" + (d.hoch ? ", nie unter dem Urteil " + d.hoch + " s" : "") +
                (d.p90m != null ? ", p90 gemessen " + d.p90m + " s" : "") + (d.ausRiss ? ", der jüngste Riss bei " + d.unten + " s verdoppelt" : "")
            : (neu === sek ? "trägt" : neu > sek ? "Deckel zu knapp" : "Deckel zu weit") + (d.ausRiss ? " · der jüngste Riss bei " + d.unten + " s verdoppelt" : "");
        return { ids: g.map(schluessel), sek, s: d ? d.p90 : null, n: d ? d.n : 0, hoch: d ? d.hoch : null, zensiert: d ? d.zensiert : 0, neu, urteil,
            ortM: ort.get(schluessel(g[0])) || null, probeTeile: teileVon(g[0]) };
    });
    // je Lauf seine Teil-Proben (probe.teile): der Deckel gilt je Teil, die Fahrt trägt jeden
    const ausZahlen = zeilen.reduce((a, z) => a + (z.neu != null ? z.neu : z.sek) * z.probeTeile, 0), budget = FAHRT_MAX_S - SITZUNG_BOOT_S;
    return { zeilen, heute: zeilen.reduce((a, z) => a + z.sek * z.probeTeile, 0), ausZahlen, budget, teile: Math.max(1, Math.ceil(ausZahlen / budget)),
        geeicht: zeilen.filter((z) => z.s != null).length };
}
// GERISSEN VORHER ↔ NACHHER an einer Mess-Datei m der Karte: jede Station, die dort an der Leine oder an der eigenen Frist UNGEMESSEN fiel
// (vorher), und die, die am Deckel der Tafel t wieder risse (nachher): ihr Grün-p90 + Vorlauf über dem Deckel. Ohne Grün-p90 ist der Bedarf
// unbekannt — sie zählt als gerissen (unbekannt), nie still als gemessen; die Leine misst sie, wo die Fahrt Rest trägt
function gerissenVorNach(t, m) {
    const je = new Map(t.zeilen.flatMap((z) => z.ids.map((id) => [id, z])));
    const vorher = Object.entries((m && m.ungemessen) || {}).filter(([id, e]) => je.has(id) && RISS_GRUND.test(e.grund || "")).map(([id]) => id);
    const sicher = (z, sek) => z.s != null && z.s + FRIST_VORLAUF_S > sek;
    const amNeu = (id) => sicher(je.get(id), je.get(id).neu != null ? je.get(id).neu : je.get(id).sek);
    const unbekannt = vorher.filter((id) => !amNeu(id) && je.get(id).s == null);
    return { vorher, vorherSicher: vorher.filter((id) => sicher(je.get(id), je.get(id).sek)), nachher: vorher.filter((id) => amNeu(id) || unbekannt.includes(id)),
        sicher: vorher.filter(amNeu), unbekannt };
}
function eichtafelCli(o) {
    if (!["radeon", "gtx"].includes(o.geraet)) throw new Error("--geraet radeon|gtx (die Deckel-Tafel trägt die Sitzung einer Karte)");
    const ms = ladeMessungen();
    // DIE STATIONEN DER TAFEL (w26-deckel-klasse): jede, die mit der Deckel-Tafel ODER nach ihrem eigenen Gesetz (ohne Tafel) hält — eine
    // Station, deren Gesetz sich änderte (tiere.K5#1: teile statt ausnahme, ihr Eintrag 90 s über dem Gesetz 45 s), fiel sonst aus der
    // Tafel, und ihr alter Eintrag hielt sie ROT: der EINE Schreiber der Tafel heilt ihn aus den Zahlen
    const mitTafel = ladeGeprueft().stationen, tafel = deckelVon();
    deckelTafel = {};
    const ohneTafel = ladeGeprueft().stationen;
    deckelTafel = tafel;
    const t = eichTafel([...mitTafel, ...ohneTafel.filter((st) => !mitTafel.some((x) => schluessel(x) === schluessel(st)))], ms, o.geraet);
    for (const z of t.zeilen)
        console.log("  " + z.ids.join("+") + " · Deckel " + z.sek + " s · " + (z.s == null ? "—" : "p90 " + z.s + " s aus " + z.n + " Grün-Läufen") + (z.zensiert ? " · " + z.zensiert + " an der Leine" : "") +
            (z.neu != null ? " → " + z.neu + " s" : "") + " · " + z.urteil + (z.ortM ? " · Ort im Deckel " + z.ortM + " m" : ""));
    console.log("DECKEL-TAFEL " + o.geraet + " aus " + ms.filter((m) => m.geraet === o.geraet).length + " Mess-Dateien: " + t.geeicht + " von " + t.zeilen.length +
        " Läufen mit Zahl · Σ Deckel heute " + t.heute + " s → aus den Zahlen " + t.ausZahlen + " s · die Fahrt in " + t.teile + " Teil(en) je ≤ " + FAHRT_MAX_S +
        " s (Budget " + t.budget + " s = Fahrt − Boot " + SITZUNG_BOOT_S + ")");
    // --sha a,b: GERISSEN an den Mess-Dateien dieser SHAs, vorher (wie sie fielen) ↔ nachher (am Deckel der Tafel)
    for (const sha of String(o.sha || "").split(",").filter(Boolean)) {
        const d = messDatei(sha, o.geraet);
        if (!fs.existsSync(d)) throw new Error("--sha " + sha + ": keine " + path.relative(DIR, d));
        const v = gerissenVorNach(t, JSON.parse(fs.readFileSync(d, "utf8")));
        console.log("GERISSEN " + path.basename(d) + ": " + v.vorher.length + " Stationen rissen dort · sicher gerissen am Deckel heute " + v.vorherSicher.length +
            " → am Deckel der Tafel " + v.sicher.length + (v.sicher.length ? " (" + v.sicher.join(" ") + ")" : "") + " · Bedarf unbekannt (ohne Grün-Reihe, die Leine misst sie) " + v.unbekannt.length);
    }
    // --schreibe (DIE DECKEL-TAFEL, deckel.json): jeder Deckel aus den Zahlen wird der Deckel seiner Karte — nur, wenn die Stationen danach halten
    if (o.schreibe) {
        const alt = deckelVon();
        const neu = JSON.parse(JSON.stringify(alt)), je = (neu[o.geraet] = neu[o.geraet] || {});
        // --nur id,id: nur die Läufe dieser Stationen schreiben ihren Deckel aus den Zahlen (eine Karte, die eine Klasse heilt, ändert
        // nie den Abdruck der übrigen — deren Deckel bleibt Byte für Byte)
        const nur = o.nur ? new Set(String(o.nur).split(",")) : null;
        if (nur) for (const id of nur) if (!t.zeilen.some((z) => z.ids.includes(id))) throw new Error("--nur " + id + ": kein Lauf der Sitzung auf " + o.geraet);
        const n = t.zeilen.filter((z) => z.neu != null && (!nur || z.ids.some((id) => nur.has(id)))).reduce((a, z) => (z.ids.forEach((id) => (je[id] = z.neu)), a + z.ids.length), 0);
        neu[o.geraet] = Object.fromEntries(Object.entries(je).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
        deckelTafel = neu;
        const fehler = ladeGeprueft().fehler;
        if (fehler.length) {
            deckelTafel = alt;
            throw new Error("die Deckel-Tafel aus den Zahlen bricht die Stationen — nichts geschrieben:\n - " + fehler.join("\n - "));
        }
        fs.writeFileSync(DECKEL_DATEI, JSON.stringify(neu, null, 1) + "\n");
        const f = fahrtSumme(ladeGeprueft().stationen, o.geraet);
        console.log("DECKEL-TAFEL " + o.geraet + ": " + n + " Proben aus den Zahlen → deckel.json · Σ Deckel + Boot " + f.summe + " s in " + fahrtTeile(f) + " Teil(en)");
    }
}

// FÄHRT DIE SITZUNG: gruppen (je Gruppe die Stationen EINER Probe, Zwillinge zusammen) der Reihe nach in EINER Welt;
// ctx = { baum, koord, geraet, bash, gpuLauf, port, band, rohDir, welt?, stillS?, stromTaktMs?, eich? }; melde(gruppe, ergebnisse, aus, zeit) je Gruppe.
// Rückgabe der Kopf der Sitzung für die Mess-Datei: { start, port, warten, bootS, grundstellungS, proben, minuten, strom, orte, eich?, grund? }
// DIE REIHE (`sitzungsReihe`) und DAS ZURÜCKSETZEN (29.10.): die Grundstellung nur nach einer Probe mit `mutiert: true` oder nach einem
// Abbruch (bis dahin vor JEDER Probe: die Dauer lebte nie länger als eine Probe); DER STROM (`stromSeite`): der Zapf-Takt über die
// ganze Sitzung, ein Zapfen an jeder Proben-Grenze, die Probe kennt ihn als PUNKTE_SITZUNG_STROM (ihr Name PUNKTE_PROBE)
async function fahreSitzung(gruppen0, ctx, melde) {
    const t0 = Date.now();
    const gruppen = sitzungsReihe(gruppen0, ctx.zuletzt);
    const dir = path.join(ctx.rohDir, "sitzung");
    fs.mkdirSync(dir, { recursive: true });
    const log = path.join(dir, "werkbank.log"), zeuge = path.join(dir, "zeuge.txt"), stop = path.join(dir, "stop"), strom = path.join(dir, "strom.ndjson");
    const grund = path.join(dir, "grund.json");
    for (const f of [stop, zeuge, strom, grund]) fs.rmSync(f, { force: true });
    const kopf = { start: new Date(t0).toISOString(), port: ctx.port, warten: null, bootS: null, grundstellungS: [], proben: 0, freigaben: [] };
    // DER KONSUM DER WELT (R6 nach Konsum): der Zeuge in save-server und Werkbank, ihr Boot als EIN Stück nach dem Start, danach je
    // Probe ein Fenster (fahreGruppe: konsumDesLaufs)
    const konsumWelt = { ordner: path.join(dir, "konsum-welt"), boot: null, nr: 0 };
    const s = await sitzungStarten({ ...ctx, log, zeuge, stop, konsum: konsumWelt.ordner });
    Object.assign(kopf, { warten: s.warten, bootS: s.bootS });
    if (s.ok) konsumWelt.boot = await konsumNahme(konsumWelt.ordner, "boot");
    const ohne = (grund, ungemessen) => ({ gruen: false, zahl: grund, exit: null, minuten: 0, grund, ...(ungemessen ? { ungemessen: true } : {}) });
    let tot = null;
    if (!s.ok) {
        kopf.grund = s.grund;
        for (const g of gruppen) await melde(g, g.map(() => ohne(s.grund, s.ungemessen)), null, new Date().toISOString());
        if (s.kind && s.kind.exitCode == null) baumTot(s.kind.pid);
        await schlossLoesen(s.schloss);
        kopf.minuten = +((Date.now() - t0) / 60000).toFixed(2);
        return kopf;
    }
    console.log("  SITZUNG " + ctx.geraet + " · die Welt steht nach " + s.bootS + " s (Schloss nach " + s.warten + " min) · " + gruppen.length + " Proben · Welt :" + (ctx.port + 20000));
    // DIE LEINE LERNT (grundDeckel): die Proben dieser Fahrt, deren Grund-Deckel aus ihrer Reihe über dem der Tafel steht — beim Namen
    {
        const gl = gruppen.map((g) => [schluessel(g[0]), probeSek(g[0], ctx.geraet), gelerntVon(ctx.geraet)[schluessel(g[0])] || 0]).filter((x) => x[2] > x[1]);
        if (gl.length) console.log("  SITZUNG die Leine lernt aus den Zahlen: " + gl.length + " Proben über dem Deckel der Tafel — " + gl.map((x) => x[0] + " " + x[1] + " → " + x[2] + " s").join(" · "));
    }
    // DIE UHR DER FAHRT ab dem Schloss (der Boot zählt mit, das Warten nie): reißt sie FAHRT_MAX_S (ctx.fahrtMaxS nur im Selbsttest),
    // endet die Sitzung — die laufende Probe fällt am Rest, jede folgende ist UNGEMESSEN beim Namen
    const fahrtMaxS = ctx.fahrtMaxS || FAHRT_MAX_S;
    let fahrt0 = Date.now() - (s.bootS || 0) * 1000;
    const restS = () => fahrtMaxS - (Date.now() - fahrt0) / 1000;
    kopf.offen = [];
    kopf.orte = [];
    kopf.wegeTueren = []; // je Grundstellung, die ein Weg seit dem Grund durch die Tür schickte: vor wem, welcher Weg, s
    // aktOrt: wo die Welt zuletzt eingeschwungen stand — ein Messort, „(hier)“ (DER WARME START, ohne Ort) oder null (nirgends: nach
    // dem Boot, jeder Grundstellung und in jeder neuen Seite); stellSeite: die Seite, in der das geschah
    let aktOrt = null, ortNach = null, stellSeite = null, ortStand = null;
    // DIE EICH-FAHRT (ctx.eich, `run --eich`, eichEintrag): dieselbe Leine, je Probe ihre Sekunden (eich) — im Kopf und im Log
    if (ctx.eich) {
        kopf.eich = { fahrtMaxS };
        console.log("  SITZUNG EICH-FAHRT: je Probe ihre Sekunden an derselben Leine (Grund-Deckel, Stille " + (ctx.stilleS || STILLE_S) + " s, Anteil), die Fahrt ≤ " + fahrtMaxS + " s");
    }
    // DER ANTEIL DER FAHRT (die Leine, fahreGruppe): der Rest der Fahrt nach Bedarf (Grund-Deckel × Teile) unter die Probe und alle nach
    // ihr geteilt, je folgende Probe ZWISCHEN_S für Grundstellung und Ort vorab (Radeon 78d37554: Ort 17,4–27,8 s + Grundstellung
    // 3,0–5,2 s); reicht der Rest nicht (die volle Fahrt), ist der Anteil der Grund-Deckel — was über die Fahrt reicht, misst die Fortsetzung
    const bedarf = (g) => probeSek(g[0], ctx.geraet) * teileVon(g[0]);
    const anteil = (i) => {
        const vor = gruppen.slice(i).reduce((a, g) => a + bedarf(g), 0);
        return Math.max(0, Math.floor(((restS() - ZWISCHEN_S * (gruppen.length - i - 1)) * bedarf(gruppen[i])) / vor));
    };
    // DER ZAPF-TAKT: nie zwei Zapfen der Sitzung zugleich; während der Grundstellung ruht er. `seite`: die Seite des letzten Zapfens
    // (stromSeite zieht je Seite einen Haken ein) — eine neue Seite hat keinen gebauten Ring (DER WARME START)
    const W = ctx.port + 20000, zz = { zapfen: 0, luecken: 0, letzteLuecke: null };
    // das letzte Bild der Welt (die Leine liest es als Lebenszeichen der Probe, fahreGruppe): der Zapfen, der Bilder brachte
    let bildZuletzt = 0;
    let aktuell = "(sitzung)", laeuft = null, ruht = false, seite = null;
    const zapf = (probe) => {
        laeuft = (laeuft || Promise.resolve()).then(() => stromZapfen(W, strom, probe)).then((z) => {
            if (z.ok) (zz.zapfen++, (seite = z.seite), z.n > 0 && (bildZuletzt = Date.now()));
            else (zz.luecken++, (zz.letzteLuecke = z.grund));
        });
        return laeuft;
    };
    let frei = true;
    const takt = setInterval(() => {
        if (ruht || !frei || tot) return;
        frei = false;
        zapf(aktuell).finally(() => (frei = true));
    }, ctx.stromTaktMs || STROM_TAKT_MS);
    await zapf(aktuell);
    // DIE CI-WACHE (Heilung 30.10.): der Blick `ciWartet` läuft neben der Probe, nie an ihrer Grenze — die Grenze liest den letzten
    // fertigen Blick seit der letzten Nahme des Schlosses und stößt den nächsten an (er läuft in der folgenden Probe); fehlt einer seit
    // der Nahme (die erste Grenze, die nach einer Freigabe), wartet sie auf ihn, sonst nie
    const ci = { seit: t0, fertig: null, laeuft: null, n: 0 };
    const ciFrisch = () => !!ci.fertig && ci.fertig.t0 >= ci.seit;
    const ciLos = () => {
        if (!ci.laeuft) {
            const t = Date.now();
            ci.laeuft = ciWartet(ctx);
            ci.laeuft.then((ja) => ((ci.fertig = { t0: t, ja }), (ci.laeuft = null), ci.n++));
        }
        return ci.laeuft;
    };
    const ciWartetJetzt = async () => {
        while (!ciFrisch()) await ciLos();
        const ja = ci.fertig.ja;
        ciLos();
        return ja;
    };
    let zuruecksetzen = false, abbruch = false, gerissen = null, grundDa = null, grundWege = null;
    // DIE AUFFÜLLUNG DER RUHE (die Ablage der Fahrten): mit der Welt der Sitzung, ehe die erste Zeit-Probe misst
    if (gruppen.some(istZeit)) await referenzAuffuellen("sitzung");
    for (const g of gruppen) {
        // DAS SCHLOSS AN DER PROBEN-GRENZE: fiel es (gpu-lauf.sh endete), trägt die Sitzung nicht mehr; wartet ein CI-Job darauf, geht es
        // an ihn und kommt danach wieder — die Welt bleibt warm, das Warten zählt nie in die Fahrt
        if (!tot && s.schloss && s.schloss.kind.exitCode != null) tot = "das Schloss der Sitzung fiel (gpu-lauf.sh Exit " + s.schloss.kind.exitCode + ")";
        if (tot && !kopf.grund) kopf.grund = "die Sitzung trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot;
        if (!tot && !gerissen && s.schloss && (await ciWartetJetzt())) {
            const tf = Date.now();
            ruht = true;
            await schlossLoesen(s.schloss);
            console.log("  SITZUNG das Schloss geht an den wartenden CI-Job (vor " + schluessel(g[0]) + ")");
            s.schloss = await schlossNehmen({ ...ctx, stop }, kopf.freigaben.length + 1);
            ruht = false;
            ci.seit = Date.now(); // ein Blick von vor der Freigabe sah den CI-Job, dem das Schloss eben gehörte: er zählt nie mehr
            const pause = Date.now() - tf;
            fahrt0 += pause;
            kopf.freigaben.push({ vor: schluessel(g[0]), s: +(pause / 1000).toFixed(1) });
            if (!s.schloss.ok) (tot = s.schloss.grund), (kopf.grund = "die Sitzung trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot);
            else console.log("  SITZUNG das Schloss wieder da nach " + (pause / 1000).toFixed(1) + " s");
        }
        // DER GRUND der Welt nach der Reihe `anfang` (nie davor: anfang misst die frische Welt)
        if (!tot && grundDa === null && stellungVon(g) !== "anfang") {
            // fiel die letzte Probe von anfang (Deckel, Absturz), lief ihre Seiten-Funktion weiter: erst die Seite neu (ihre Arbeit endet),
            // dann der Grund — nie ein Grund aus einer Seite, in der eine gefallene Probe noch arbeitet
            if (abbruch) {
                const n = await rufFrist(W, "/reload", {}, GRUNDSTELLUNG_S * 1000).catch((e) => ({ fehler: String((e && e.message) || e) }));
                abbruch = false;
                if (!n || n.neu !== true) tot = "die Seite nach dem Abbruch von anfang lädt nicht neu (/reload: " + JSON.stringify(n).slice(0, 200) + ")";
            }
        }
        if (!tot && grundDa === null && stellungVon(g) !== "anfang") {
            const gn = await grundNehmen(W, grund);
            grundDa = gn.ok ? true : gn.grund;
            if (gn.ok) grundWege = JSON.parse(fs.readFileSync(grund, "utf8")).wege || null; // was der Grund an Wegen trägt (bauAbweichung)
            console.log("  SITZUNG " + (gn.ok ? "der Grund der Welt: " + gn.n + " Größen in " + gn.s + " s" : gn.grund));
        }
        if (!gerissen && restS() <= 0) gerissen = "vor " + schluessel(g[0]);
        if (gerissen) {
            kopf.offen.push(...g.map(schluessel));
            await melde(g, g.map(() => ohne("die Fahrt riss " + fahrtMaxS + " s (" + gerissen + ") — offen, UNGEMESSEN", true)), null, new Date().toISOString());
            continue;
        }
        if (!tot && zuruecksetzen) {
            ruht = true;
            await zapf(aktuell);
            const gs = grundDa === true ? await grundstellung(W, grund, { abbruch }) : { ok: false, grund: grundDa || "kein Grund vor " + schluessel(g[0]) };
            ruht = false;
            if (gs.ok) {
                kopf.grundstellungS.push(gs.s);
                if (gs.wege) kopf.wegeTueren.push({ vor: schluessel(g[0]), wege: gs.wege, s: gs.s });
                // die Zeichenkette, die der Täter verändert ließ: zurück an Ort und Stelle oder durch die Tür (im Kopf bei ihm)
                const taeter = (kopf.zeichner || []).filter((x) => !x.zurueck).pop();
                if (taeter && (gs.kette || gs.ketteTuer)) taeter.zurueck = { vor: schluessel(g[0]), wie: gs.ketteTuer ? "durch die Tür" : "an Ort und Stelle", s: gs.s };
                (aktOrt = null), (ortNach = gs.tuer ? "der Tür" : "der Grundstellung"); // der Grund stellt den Spieler an seinen Ort zurück
                console.log("  SITZUNG Grundstellung vor " + schluessel(g[0]) + ": " + gs.s + " s (im Spiel " + gs.ms + " ms" +
                    (gs.tuer ? ", durch die Tür" + (gs.wege ? " — " + gs.wege : "") + (gs.ketteTuer ? " — " + gs.ketteTuer.join(" ") : "") +
                        (gs.anOrt ? " — an Ort und Stelle abweichend: " + gs.anOrt.join(" ") + (gs.anOrtWie ? " · wie " + JSON.stringify(gs.anOrtWie).slice(0, 300) : "") : "") : "") + ")" +
                    (gs.kette ? " · die Zeichenkette zurück: " + gs.kette.join(" ") : "") + (gs.zustand ? " · der Zustand zurück: " + gs.zustand.join(" ") : ""));
                if (gs.anOrt) (kopf.anOrt = kopf.anOrt || []).push({ vor: schluessel(g[0]), anders: gs.anOrt, wie: gs.anOrtWie });
                if (gs.zustand) (kopf.grundZustand = kopf.grundZustand || []).push({ vor: schluessel(g[0]), zurueck: gs.zustand });
            } else {
                tot = "Grundstellung: " + gs.grund;
                kopf.grund = "die Welt trägt nicht mehr vor " + schluessel(g[0]) + ": " + gs.grund;
                console.log("  SITZUNG " + kopf.grund);
            }
        } else if (!tot) {
            // ohne Grundstellung: das Fenster wie beim Start (eine Probe davor stellte es vielleicht anders) — und das Lebenszeichen der Welt
            const f = await rufFrist(W, "/fenster", {}, 30000).catch((e) => ({ fehler: String((e && e.message) || e) }));
            if (!f || !Array.isArray(f.fenster)) {
                tot = "die Welt antwortet nicht (/fenster: " + JSON.stringify(f).slice(0, 200) + ")";
                kopf.grund = "die Welt trägt nicht mehr vor " + schluessel(g[0]) + ": " + tot;
                console.log("  SITZUNG " + kopf.grund);
            }
        }
        // DER WELT-TOD IST KEIN ENDE DER FAHRT (w28-bestand-kennung; Radeon df6c4721: die Grundstellung fand `creatures` abweichend, und
        // 116 von 124 Proben standen „die Welt der Sitzung trägt nicht mehr — ungemessen“, bis ein Mensch neu fuhr): wie der Riss der Fahrt
        // geht jede Probe ab dem Tod nach `kopf.offen` — die Fortsetzung (fahreFortsetzung) misst sie in einer NEUEN Sitzung mit eigenem
        // Boot und eigenem Grund; sie endet, sobald eine Sitzung keinen offenen Lauf mehr schafft
        if (tot) {
            kopf.offen.push(...g.map(schluessel));
            await melde(g, g.map(() => ohne("die Welt der Sitzung trägt nicht mehr (" + tot + ") — offen, UNGEMESSEN", true)), null, new Date().toISOString());
            continue;
        }
        // DER ORT (30.10.): wechselt die Probe den Messort, stellt die Sitzung EINMAL um — das Warten auf den Ring dort liegt vor dem
        // Deckel der Probe (er misst ihre Arbeit, nie den Ring) und steht je Ort im Kopf (`orte`: s, Takte, Chunks — Pflicht B, die
        // Ankunft); die Proben des Orts danach finden ihn gebaut. Scheitert das Umstellen, stellt die Probe selbst um (beim Namen im Log)
        // DER WARME START (w4-sitzung-eichen; takt25c GTX an 6b3da705: 36 von 38 Proben UNGEMESSEN am Deckel — nach jedem Riss ging
        // die Grundstellung durch die Tür, die Werkbank hält die neue Seite still (`loopAus`), und jede Probe danach zahlte den Ring:
        // am Ort 15–25 s statt ~3 s warm, eine Probe ohne Ort in ihrem eigenen Deckel — die Kaskade): auch eine Probe OHNE Ort misst in
        // der stehenden Welt. Nach dem Boot, jeder Grundstellung und in jeder neuen Seite (Tür, Neuladen, der Zweit-Boot einer Probe:
        // der Zapfen nennt eine andere Seite) schwingt die Sitzung sie EINMAL ein, wo der Spieler steht (`__weltStehtNach`, das EINE
        // Einschwingen von welt-boot) — vor dem Deckel, im Kopf wie ein Ort (`orte`, ort null); anfang misst die frische Welt, nie warm
        await zapf(aktuell);
        if (seite !== stellSeite && aktOrt !== null) (aktOrt = null), (ortNach = ortNach || "einer neuen Seite");
        const ort = probeOrt(g[0]);
        if (ort ? ort !== aktOrt : aktOrt === null && stellungVon(g) !== "anfang") {
            const tu = Date.now();
            const stelle = () => (ort ? rufFrist(W, "/umstellen", { ort, sicht: "ego" }, 300000)
                : rufFrist(W, "/eval", { code: WELT_STEHT }, 300000).then((a) => (a && a.ergebnis && typeof a.ergebnis === "object" ? a.ergebnis : { fehler: (a && a.fehler) || JSON.stringify(a) })))
                .catch((e) => ({ fehler: String((e && e.message) || e) }));
            let u = await stelle();
            // DIE WELT HÄNGT (Radeon-Eich 25ac4c0c 01.11.: nach profiband.K4 stand die Wiese nicht mehr — „wald 11“ offen über 3 601 Takte —,
            // und jede Probe am Ort danach zahlte 36 s und fiel): steht der Ort nicht, geht die Sitzung EINMAL durch die Tür (die Seite neu,
            // der Grund) und stellt neu um — steht er dann, misst die Probe in der heilen Welt; sonst stellt die Probe selbst um wie bisher
            if (u && u.fehler && grundDa === true) {
                const gs = await grundstellung(W, grund, { abbruch: true });
                await zapf(aktuell);
                console.log("  SITZUNG " + (ort ? "Ort " + ort : "die Welt") + " vor " + schluessel(g[0]) + " steht nicht — " +
                    (gs.ok ? "durch die Tür in " + gs.s + " s, neu umgestellt" : "die Tür trägt nicht: " + gs.grund));
                if (gs.ok) (kopf.grundstellungS.push(gs.s), (u = await stelle()), (ortNach = "der Tür (die Welt hing)"));
            }
            const us = +((Date.now() - tu) / 1000).toFixed(1);
            const wo = ort ? "Ort " + ort : "die Welt";
            await zapf(aktuell); // die Bilder des Einschwingens unter „(sitzung)“, nie unter der Probe; der Zapfen nennt die Seite danach
            if (u && !u.fehler) {
                aktOrt = ort || "(hier)";
                stellSeite = seite;
                ortStand = ort ? await spielerStand(W) : null;
                kopf.orte.push({ ort: ort || null, vor: schluessel(g[0]), s: us, takte: u.takte, chunks: u.chunks, nach: ortNach });
                console.log("  SITZUNG " + wo + " vor " + schluessel(g[0]) + ": " + us + " s (" + u.takte + " Takte, " + u.chunks + " Chunks" + (ortNach ? ", nach " + ortNach : "") + ")");
            } else {
                // ohne Ort EIN Versuch je Grundstellung oder Seite: eine Welt, die nicht steht, kostete sonst jede folgende Probe die Frist
                if (!ort) (aktOrt = "(hier)"), (stellSeite = seite);
                kopf.orte.push({ ort: ort || null, vor: schluessel(g[0]), s: us, fehler: String(u && u.fehler).slice(0, 200), nach: ortNach });
                console.log("  SITZUNG " + wo + " vor " + schluessel(g[0]) + " steht nicht nach " + us + " s: " + JSON.stringify(u).slice(0, 200));
            }
            ortNach = null;
        }
        const name = schluessel(g[0]).replace("#", "_");
        const aus = { aus: path.join(ctx.rohDir, name + ".json"), roh: path.join(ctx.rohDir, name + ".out") };
        // DER BAU VOR DER PROBE (bauAbdruck): an jeder Probe ohne `mutiert`, sobald der Grund steht
        const lies = () => rufFrist(W, "/eval", { code: BAU_LIES }, 30000).then((a) => (a && a.ergebnis && typeof a.ergebnis === "object" ? a.ergebnis : null)).catch(() => null);
        const bauVor = !mutiertVon(g) && grundDa === true ? await lies() : null;
        // DIE ZEICHENKETTE VOR DER PROBE (zeichnerKette): an JEDER Probe — anfang, die Welt lassend, ende, mutierend; keine darf die Kette
        // der Seite verändert lassen. Nicht lesbar: beim Namen im Log und im Kopf (`zeichnerBlind`), nie still
        const zVor = await zeichnerRuf(W, null);
        const blind = (wann, z) => {
            (kopf.zeichnerBlind = kopf.zeichnerBlind || []).push({ probe: schluessel(g[0]), wann, fehler: z.fehler });
            console.log("  SITZUNG die Zeichenkette " + wann + " " + schluessel(g[0]) + " nicht lesbar: " + z.fehler);
        };
        if (zVor.fehler) blind("vor", zVor);
        // DIE LEIHE DER HÄNGER-LINSE (haengerLeihe): der Stand ihrer Glieder vor der Probe
        const leiheRuf = (gib) => rufFrist(W, "/eval", { code: HAENGER_LEIHE(gib) }, 30000)
            .then((a) => (a && a.ergebnis && typeof a.ergebnis === "object" ? a.ergebnis : { fehler: String((a && a.fehler) || JSON.stringify(a)).slice(0, 200) }))
            .catch((e) => ({ fehler: String((e && e.message) || e).split("\n")[0] }));
        const leihe = await leiheRuf(false);
        if (leihe.fehler) console.log("  SITZUNG die Leihe der Hänger-Linse vor " + schluessel(g[0]) + " nicht lesbar: " + leihe.fehler);
        const haltVor = await messHaltRuf(W, null);
        const zeit = new Date().toISOString();
        aktuell = schluessel(g[0]);
        const es = await fahreGruppe(g, { ...ctx, ...aus, sitzung: { log, zeuge, strom, grund, probe: aktuell, restS: restS(), anteilS: anteil(gruppen.indexOf(g)), fahrtMaxS, lebt: () => bildZuletzt, konsumWelt } });
        if (es.some((e) => /^Deckel der Fahrt /.test(e.grund || ""))) (gerissen = "in " + aktuell), kopf.offen.push(...g.map(schluessel));
        await zapf(aktuell);
        aktuell = "(sitzung)";
        kopf.proben++;
        // DIE WELT ENDETE UNTER DER PROBE (w4-stationen-heil; Takt 23 GTX an 73bdf938: die Vorfahrt der OMEN nahm die Welt nach
        // 7,0 min — „VORFAHRT … verloren 7.0“ —, ferne.K1#2 lief gerade und stand als ROT „keine LUFT-Zeile … read ECONNRESET“ in der
        // Messung): die Werkbank endet nie an einem Fehler des Spiels (eine tote Seite antwortet mit `fehler`), nur an `/stop` oder
        // einem fremden Ende. Ist ihr Steuer-Port nach der Probe zu oder der Halter fort, ist jedes Nicht-GRÜN dieser Probe keine
        // Messung — ungemessen beim Grund, wie die Proben danach; ein GRÜN hielt seine Messung schon in der Hand.
        const weg = s.kind.exitCode != null ? "der Halter endete (Exit " + s.kind.exitCode + ")"
            : (await portZu(W)) ? "die Werkbank :" + W + " nimmt keine Verbindung mehr an" : null;
        if (weg) {
            tot = "sie endete während " + schluessel(g[0]) + ": " + weg;
            kopf.grund = "die Welt trägt nicht mehr nach " + schluessel(g[0]) + ": " + weg;
            console.log("  SITZUNG " + kopf.grund);
        }
        const unter = (e) => (e.gruen || !weg ? e
            : { ...e, ungemessen: true, grund: "die Welt der Sitzung endete während der Probe (" + weg + ") — ungemessen", zahl: "die Welt der Sitzung endete während der Probe (" + weg + ") — ungemessen; die Probe sah: " + String(e.zahl).slice(0, 240) });
        abbruch = brachAb(es);
        // DIE PROBE LEGTE ETWAS IN DIE WELT UND SAGTE ES NICHT (bauAbweichung): die Sitzung setzt zurück wie nach einer mutierenden und
        // nennt sie beim Namen (kopf.unerklaert) — die nächste Probe misst nie die Welt einer fremden
        const unerklaert = bauVor && !weg ? bauAbweichung(bauVor, await lies(), grundWege) : null;
        if (unerklaert) {
            (kopf.unerklaert = kopf.unerklaert || []).push({ probe: schluessel(g[0]), wie: unerklaert });
            console.log("  SITZUNG " + schluessel(g[0]) + " ließ die Welt verändert und trägt kein mutiert: " + unerklaert + " — die Grundstellung folgt");
        }
        // DIE PROBE LIESS DIE ZEICHENKETTE VERÄNDERT (w4-grund-zeichner, zeichnerKette; der alte Strom der Wasser-Wand in gelaende.K2#1,
        // tiere.K3#2 zahlte): DIESE Probe beim Namen — ihr Urteil ist keines (ein Werkzeug-Bruch beim Namen der Größe, nie ein stilles GRÜN,
        // nie ein ROT des Kriteriums), im Kopf `zeichner`; die Grundstellung folgt und gibt der Seite zurück, was die Probe ihr lieh —
        // nie wandert der Schaden in die nächste Probe
        // DIE HÄNGER-LINSE ZURÜCK (haengerLeihe), ehe die Zeichenkette urteilt: entstand das Instrument in der Probe, kehrt jedes Glied
        // zurück (im Kopf `haenger`); ein Glied am Gerät, das danach anders steht, ist ein Werkzeug-Bruch beim Namen
        // DER ORT WANDERT NIE MIT (spielerStand): trug die Probe den Spieler vom Stand seines Orts fort, gilt der Ort als verlassen — die
        // nächste Probe dort stellt neu um, nie misst sie, wo die vorige ihn ließ
        if (!weg && ortStand && aktOrt && aktOrt !== "(hier)") {
            const jetzt = await spielerStand(W);
            const m = jetzt ? Math.hypot(jetzt[0] - ortStand[0], jetzt[1] - ortStand[1]) : null;
            const dreh = jetzt && jetzt[2] != null && ortStand[2] != null ? Math.abs(jetzt[2] - ortStand[2]) : 0;
            if (m == null || m > ORT_WANDER_M || dreh > ORT_DREH_RAD) {
                (kopf.wanderung = kopf.wanderung || []).push({ probe: schluessel(g[0]), ort: aktOrt, m: m == null ? null : +m.toFixed(2), dreh: +dreh.toFixed(3) });
                console.log("  SITZUNG " + schluessel(g[0]) + " ließ den Spieler " + (m == null ? "unlesbar" : m.toFixed(2) + " m") + " vom Stand des Orts " + aktOrt + " — der nächste stellt neu um");
                (aktOrt = null), (ortStand = null), (ortNach = "der Wanderung von " + schluessel(g[0]));
            }
        }
        // DER HALT DER MESSUNG ZURÜCK (messHaltRuf): ließ die Probe ihn stehen, gibt die Sitzung ihn zurück, wie er vor ihr stand — beim Namen
        const haltNach = weg ? null : await messHaltRuf(W, null);
        if (typeof haltNach === "number" && haltNach < 0 && !(typeof haltVor === "number" && haltVor < 0)) {
            const zurueck = typeof haltVor === "number" ? haltVor : 0;
            await messHaltRuf(W, zurueck);
            (kopf.messHalt = kopf.messHalt || []).push({ probe: schluessel(g[0]), halt: haltNach, zurueck });
            console.log("  SITZUNG " + schluessel(g[0]) + " ließ den Halt der Messung stehen (weatherEffectTime " + haltNach + ") — zurück auf " + zurueck);
        }
        const gab = !weg && !abbruch && leihe.leiht ? await leiheRuf(true) : null;
        if (gab && gab.fehler) console.log("  SITZUNG die Hänger-Linse nach " + schluessel(g[0]) + " nicht zurück: " + gab.fehler);
        if (gab && Array.isArray(gab.zurueck) && gab.zurueck.length) {
            (kopf.haenger = kopf.haenger || []).push({ probe: schluessel(g[0]), zurueck: gab.zurueck.length, ...(gab.bleibt.length ? { bleibt: gab.bleibt } : {}) });
            console.log("  SITZUNG die Hänger-Linse der Werkbank kehrt nach " + schluessel(g[0]) + " zurück: " + gab.zurueck.length + " Glieder" +
                (gab.bleibt.length ? " — es bleibt " + gab.bleibt.join(" ") : ""));
        }
        // DIE ZEICHENKETTE einer gefallenen Probe (Deckel, Absturz: `abbruch`) urteilt nie — ihre Seiten-Funktion läuft weiter (tiere.K5#1
        // am Deckel 10 s, Radeon 25ac4c0c · 6a571e3b: der Raffer und die Pass-Uhr des Laufs hingen noch), die Grundstellung danach geht
        // durch die Tür und prüft die Kette dort (`ketteTuer`); die Probe steht schon UNGEMESSEN beim Grund ihres Falls
        const zNach = !weg && !abbruch && zVor.abdruck ? await zeichnerRuf(W, zVor.abdruck) : null;
        if (zNach && (zNach.fehler || !Array.isArray(zNach.anders))) blind("nach", { fehler: zNach.fehler || JSON.stringify(zNach).slice(0, 200) });
        const kette = zNach && Array.isArray(zNach.anders) && zNach.anders.length ? zNach : null;
        const geraetBleibt = gab && Array.isArray(gab.bleibt) && gab.bleibt.length ? gab.bleibt.map((k) => "haenger." + k) : [];
        const bruch = kette || geraetBleibt.length
            ? zeichnerBruch({ anders: [...(kette ? kette.anders : []), ...geraetBleibt],
                wie: { ...(kette ? kette.wie : {}), ...Object.fromEntries(geraetBleibt.map((k) => [k, "nicht zurück (die Leihe kennt das Glied nicht)"])) } })
            : null;
        if (bruch) {
            const anders = [...(kette ? kette.anders : []), ...geraetBleibt];
            (kopf.zeichner = kopf.zeichner || []).push({ probe: schluessel(g[0]), anders, wie: kette ? kette.wie : {} });
            console.log("  SITZUNG " + schluessel(g[0]) + " ließ die Zeichenkette verändert: " + anders.join(" ") + " — kein Urteil (Werkzeug-Bruch), die Grundstellung folgt");
        }
        const werkzeug = (e) => (!bruch ? e : e.ungemessen ? { ...e, grund: e.grund + " · " + bruch, zahl: e.zahl + " · " + bruch }
            : { ...e, gruen: false, ungemessen: true, grund: bruch + " — kein Urteil, UNGEMESSEN (die Probe sah: " + String(e.zahl).slice(0, 240) + ")",
                zahl: bruch + " — kein Urteil, UNGEMESSEN (die Probe sah: " + String(e.zahl).slice(0, 240) + ")" });
        // ein Wurf am Messort (keinUrteil (d)) ließ die Welt vielleicht halb umgestellt: die nächste Probe beginnt am Grund
        zuruecksetzen = mutiertVon(g) || abbruch || !!unerklaert || !!bruch || es.some((e) => /^Messort: /.test(e.grund || ""));
        // die Eich-Fahrt urteilt erst nach Abbruch und Grundstellung (sie lesen den Grund der Probe, wie er fiel): je Probe ihre Zahl
        await melde(g, es.map(unter).map(werkzeug).map((e, i) => (ctx.eich ? eichEintrag(g[i], e, ctx.geraet) : e)), aus, zeit);
    }
    clearInterval(takt);
    if (ci.laeuft && ci.laeuft.kind && ci.laeuft.kind.exitCode == null) baumTot(ci.laeuft.kind.pid); // kein Blick überlebt die Sitzung
    kopf.ciBlicke = ci.n;
    await zapf(aktuell);
    kopf.strom = stromKopf(strom, zz);
    if (kopf.strom.ortImDeckel.length)
        console.log("  SITZUNG DER ORT IM DECKEL (die Probe zog weiter als " + ORT_IM_DECKEL_M + " m von dem Ort, an dem die Sitzung sie begann — ihr Deckel trug den Ring): " +
            kopf.strom.ortImDeckel.map((e) => e.probe + " " + e.m + " m (Ring " + e.ringVor + " → " + e.ringMin + ")").join(", "));
    kopf.fahrtS = +((Date.now() - fahrt0) / 1000).toFixed(1);
    if (gerissen) {
        kopf.grund = "die Fahrt riss " + fahrtMaxS + " s " + gerissen + " — offen: " + kopf.offen.join(", ");
        console.log("  SITZUNG " + kopf.grund);
    } else if (tot && kopf.offen.length) {
        kopf.grund = (kopf.grund || "die Welt trägt nicht mehr: " + tot) + " — offen: " + kopf.offen.join(", ");
        console.log("  SITZUNG " + kopf.grund);
    } else delete kopf.offen;
    console.log("  SITZUNG Fahrt " + kopf.fahrtS + " s (Soll ≤ " + fahrtMaxS + " s) · " + kopf.proben + " Proben · Grundstellung " + kopf.grundstellungS.length + "×");
    await sitzungStoppen(s, stop);
    kopf.minuten = +((Date.now() - t0) / 60000).toFixed(2);
    return kopf;
}

// DIE FORTSETZUNG DER FAHRT (04.11., deckel-wurzel; Radeon 2674ff9a: die Fahrt riss 1 800 s vor halten.K5#1, 23 Proben standen „die Fahrt
// riss — offen, UNGEMESSEN“, bis ein Mensch `run --offen` rief): riss die Fahrt, misst eine NEUE Sitzung (eigener Boot, eigene Uhr
// ≤ FAHRT_MAX_S) die offenen Läufe aus gruppen (kopf.offen); fährt sie ein `ende`, fährt sie jeden `anfang` mit (der Strom lebt eine
// Sitzung, auswahl). Sie endet, wenn nichts offen ist oder eine Sitzung keinen offenen Lauf mehr schaffte — die übrigen bleiben UNGEMESSEN
// beim Namen „die Fahrt riss“. Ein Lauf, der seinen Deckel reißt, ist nie offen: er steht UNGEMESSEN beim Grund und fährt nie nach.
// fahre(gruppen) → der Kopf der neuen Sitzung; Rückgabe die Köpfe der Fortsetzungen
async function fahreFortsetzung(gruppen, kopf, fahre) {
    const koepfe = [];
    let offen = (kopf && kopf.offen) || [];
    while (offen.length) {
        const rest = gruppen.filter((g) => g.some((st) => offen.includes(schluessel(st))));
        if (!rest.length) break;
        if (rest.some((g) => stellungVon(g) === "ende")) for (const g of gruppen) if (stellungVon(g) === "anfang" && !rest.includes(g)) rest.unshift(g);
        console.log("  FORTSETZUNG der Fahrt: " + offen.length + " offene Proben in " + rest.length + " Läufen — eine neue Sitzung (Teil " + (koepfe.length + 2) + ")");
        const k = await fahre(rest);
        koepfe.push(k);
        const neu = (k && k.offen) || [];
        if (neu.length && (!k.proben || neu.length >= offen.length)) {
            console.log("  FORTSETZUNG endet ohne Fortschritt: " + neu.length + " Proben bleiben offen (" + neu.join(", ") + ")");
            break;
        }
        offen = neu;
    }
    return koepfe;
}

const messDatei = (sha, geraet, mdir = path.join(DIR, "messung")) => path.join(mdir, sha.slice(0, 8) + "-" + geraet + ".json");
// die Dateien am Stand (Wand PFAD)
const dateienAm = (repo, sha) => git(["ls-tree", "-r", "--name-only", sha], repo).split(/\r?\n/).filter(Boolean);
// die Roh-Ausgabe einer Messung (Wand GPU für Messungen ohne eigenen Zeugen); "" wenn keine
const rohAus = (mdir = path.join(DIR, "messung")) => (sha, g, id) => {
    const f = path.join(mdir, "roh", String(sha).slice(0, 8) + "-" + g, id.replace("#", "_") + ".out");
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
};

// DIE AUSWAHL eines Laufs — EINE Quelle für run und scheiben: die Stationen des Geräts nach --nur und --offen am SHA.
// Rückgabe { repo, sha, meine, tot }; meine leer heißt: am SHA ist nichts zu messen (--offen)
function auswahl(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const { stationen, fehler } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const nur = opt.nur ? new Set(opt.nur.split(",")) : null;
    let meine = stationen.filter((st) => geraeteVon(st).includes(opt.geraet) && (!nur || nur.has(schluessel(st))));
    if (nur) for (const id of nur) if (!meine.some((st) => schluessel(st) === id)) throw new Error("--nur " + id + ": keine Station auf " + opt.geraet);
    if (!meine.length) throw new Error("keine Station auf " + opt.geraet);
    const repo = spielRepo();
    const sha = voll(repo, opt.sha);
    // das Frische-Urteil fragt git über DIE R6-QUELLE (ein Prozess je Art, nie je Mess-Kopf); ohne --offen und --eich nur die Dateien am SHA
    const frage = opt.offen || opt.eich;
    const messungen = frage ? ladeMessungen() : [];
    const quelle = frage ? r6Quelle(repo, sha, messungen, stationen) : null;
    const dateien = quelle ? quelle.dateien() : dateienAm(repo, sha);
    const tot = (st) => toteGlobs(st.pfad, dateien);
    // --offen: nur die Stationen, die die Buchung am SHA nicht frisch fände — ein Zug misst, was er berührt, nie die ganze Liste
    // --eich (DIE EICH-FAHRT, eichEintrag): die Proben der Karte ohne frische Messung UND ohne Eich-Zahl am SHA (eichOffen) — jede
    // Eich-Fahrt misst, was die vorige nicht erreichte, bis nichts zu eichen bleibt
    if (opt.eich) {
        if (!["radeon", "gtx"].includes(opt.geraet)) throw new Error("--eich fährt nur die Sitzung einer Karte (radeon|gtx)");
        meine = meine.filter((st) => st.probe);
    }
    if (opt.offen || opt.eich) {
        const frisch = frischUrteil(messungen, quelle.geaendert, hilfeText(), { tot, roh: rohAus(), linsen: quelle.linsenAm(), skript: quelle.skript });
        meine = meine.filter((st) => frisch(st, opt.geraet).ungemessen);
    }
    if (opt.eich) {
        const d = messDatei(sha, opt.geraet), hilfe = hilfeText();
        meine = eichOffen(meine, fs.existsSync(d) ? JSON.parse(fs.readFileSync(d, "utf8")) : null, sha, (st) => abdruck(st, hilfe, opt.geraet));
    }
    // DIE DAUER BRAUCHT IHREN ANFANG (w4-linsen-b; 3ed95dcf GTX: profiband.K4 fuhr in eich1, profiband.K5 allein in eich2 — „kein Stand des
    // Anfangs“, die Zahl „Dauer undefined min in undefined Seite(n)“): eine Probe mit `stellung: "ende"` urteilt über den Strom seit den
    // Marken der Proben mit `stellung: "anfang"` IN DERSELBEN Sitzung (die Datei des Stroms lebt eine Sitzung) — fährt eine Auswahl (--nur,
    // --offen, --eich) ein Ende, fährt sie jeden Anfang ihres Geräts mit
    if (meine.some((st) => st.probe && st.probe.stellung === "ende"))
        for (const st of stationen)
            if (st.probe && st.probe.stellung === "anfang" && geraeteVon(st).includes(opt.geraet) && !meine.includes(st)) meine.push(st);
    return { repo, sha, meine, tot };
}

// DIE FARM (27.10., Karte punkte-farm; die Regel des Schöpfers: „Die Prüfung darf nie länger dauern als das Erstellen“ — der
// headless-Takt an e7a28b06 fuhr 76 Stationen Σ 266 min in 60 min Wanduhr auf dem Laptop): `run --farm <name>` fährt headless auf
// einem Läufer der Farm (.github/workflows/punkte-farm.yml im Spiel-Repo), der nur diesen Lauf trägt — dort hält kein
// Schloss des Rechners (Takt 8: es schützte die Zeit-Stationen vor den Bahnen der Radeon NEBENAN, die auf dem Läufer nie
// laufen); die Karte bleibt verwehrt (LINSE_GPU=software). Eine GPU-Station fährt nie auf der Farm: sie misst nur unter dem
// Schloss ihrer Karte. Rückgabe: die gpu-lauf.sh des Laufs oder null (frei)
function gpuLaufFuer(geraet, farm) {
    if (!farm) return GPU_LAUF;
    if (geraet !== "headless") throw new Error("--farm fährt nur headless — " + geraet + " misst nur unter dem Schloss seiner Karte");
    return null;
}

// DIE SCHEIBEN DER FARM: die Läufe (Zwillinge EIN Lauf, gruppiere) auf höchstens `jobs` Scheiben, die schwersten zuerst in die
// leichteste (LPT) — die Wanduhr der Farm ist die schwerste Scheibe, also mindestens der längste Lauf. gewicht(gruppe) → Minuten.
// Rückgabe [{ nr, gruppen, min }] ohne leere Scheiben, nr ab 1 in der Reihenfolge der Last
function scheibenPlan(gruppen, jobs, gewicht) {
    const k = Math.max(1, Math.min(Number(jobs) || 1, gruppen.length));
    const sch = Array.from({ length: k }, () => ({ gruppen: [], min: 0 }));
    const last = gruppen.map((g, i) => ({ g, w: Math.max(0, Number(gewicht(g)) || 0), i })).sort((a, b) => b.w - a.w || a.i - b.i);
    for (const { g, w } of last) {
        const s = sch.reduce((a, b) => (b.min < a.min ? b : a));
        s.gruppen.push(g);
        s.min = +(s.min + w).toFixed(2);
    }
    return sch.filter((s) => s.gruppen.length).sort((a, b) => b.min - a.min).map((s, i) => ({ nr: i + 1, ...s }));
}
// das Gewicht eines Laufs: die KÜRZESTE seiner jüngsten 5 Messungen auf dem Gerät (eine mit 0 min — toter Glob — zählt nicht), sonst
// die Soll-Minuten seiner ersten Station. Am Laptop zählen die Minuten das Warten auf das Schloss und die Last der Nachbar-Bahnen mit
// (speicher.K3#2 allein 8,6–10,4 min, in 3 Bahnen neben der Radeon 26,6 und 52,3 min; feld.K3#1 0,7–2,6 und 33,6 min) — Last
// verlängert nur, also schätzt die kürzeste den Lauf allein; der Abdruck zählt hier nicht (er urteilt die Frische, nie die Länge)
function laufGewicht(messungen, geraet) {
    const je = new Map();
    for (const m of messungen) {
        if (m.geraet !== geraet) continue;
        for (const [id, e] of Object.entries(m.je || {})) if (e.minuten > 0) (je.get(id) || je.set(id, []).get(id)).push(e);
    }
    const kuerzeste = (id) => {
        const es = (je.get(id) || []).sort((a, b) => String(b.zeit).localeCompare(String(a.zeit))).slice(0, 5);
        return es.length ? Math.min(...es.map((e) => e.minuten)) : null;
    };
    return (g) => {
        const ms = g.map((st) => kuerzeste(schluessel(st))).filter((x) => x != null);
        return ms.length ? Math.max(...ms) : g[0].minuten;
    };
}
// DER ANBIETER DES LAPTOPS: eine Station, deren KI_ENDPUNKT der lokale Ollama ist (Port 11434), verlangt dessen Modell auf dem
// Läufer ihrer Scheibe — die Farm stellt ihn (punkte-farm.yml, Schritt KI-Anbieter), die Station selbst bleibt byte-gleich
const LOKALER_ANBIETER = /^https?:\/\/(127\.0\.0\.1|localhost):11434(\/|$)/;
const kiModelle = (gruppen) =>
    [...new Set(gruppen.flat().filter((st) => st.env && LOKALER_ANBIETER.test(st.env.KI_ENDPUNKT || "") && st.env.KI_MODELL).map((st) => st.env.KI_MODELL))];

// `scheiben`: der Plan der Farm als JSON auf stdout (die Matrix des Workflows), die Zeilen für Menschen auf stderr
function scheibenCli(opt) {
    const { sha, meine } = auswahl(opt);
    const gruppen = gruppiere(meine);
    const plan = scheibenPlan(gruppen, opt.jobs || 12, laufGewicht(ladeMessungen(), opt.geraet));
    const scheiben = plan.map((s) => ({ nr: s.nr, nur: s.gruppen.flat().map(schluessel).join(","), stationen: s.gruppen.flat().length,
        laeufe: s.gruppen.length, min: s.min, ki: kiModelle(s.gruppen).join(" ") }));
    console.error("SCHEIBEN " + sha.slice(0, 8) + " " + opt.geraet + ": " + meine.length + " Stationen in " + gruppen.length + " Läufen auf " +
        scheiben.length + " Scheiben · schwerste ~" + (scheiben[0] ? scheiben[0].min : 0) + " min · Σ ~" + +plan.reduce((a, s) => a + s.min, 0).toFixed(1) + " min");
    for (const s of scheiben) console.error("  " + s.nr + " · ~" + s.min + " min · " + s.laeufe + " Läufe" + (s.ki ? " · KI " + s.ki : "") + " · " + s.nur);
    const aus = { sha, sha8: sha.slice(0, 8), geraet: opt.geraet, stationen: meine.length, laeufe: gruppen.length, scheiben };
    process.stdout.write(JSON.stringify(aus) + "\n");
    return aus;
}

// DIE VEREINIGUNG der Farm: die Teil-Messungen der Scheiben (je Läufer `run --nur … --farm`) in die EINE Messung m des SHA, über
// `eintragen` wie ein Lauf am Platz (ein Teil-Eintrag ersetzt den alten derselben Station, ungemessen bleibt ungemessen); jeder
// Eintrag trägt den Läufer (host), die Datei die Farm. teile: [{ name, m }]; erwartet: [{ nr, nur }] oder null. Rückgabe
// { m, n, fehlt: [{ nr, ids }] } — eine Scheibe ohne Teil (ihr Läufer fiel) steht beim Namen, ihre Stationen bleiben, wie sie waren.
function vereineMessungen(m, teile, sha, geraet, host, erwartet = null) {
    const ziel = m && m.sha === sha ? { ...m, je: { ...m.je }, ...(m.ungemessen ? { ungemessen: { ...m.ungemessen } } : {}), ...(m.konsumTafel ? { konsumTafel: { ...m.konsumTafel } } : {}) }
        : { sha, geraet, zeit: null, host, je: {} };
    const gesehen = new Set();
    let n = 0;
    for (const t of teile) {
        if (!t.m || t.m.sha !== sha || t.m.geraet !== geraet)
            throw new Error("Teil " + t.name + " misst " + (t.m && t.m.sha) + " " + (t.m && t.m.geraet) + " statt " + sha + " " + geraet);
        for (const [id, e] of [...Object.entries(t.m.je || {}), ...Object.entries(t.m.ungemessen || {})]) {
            eintragen(ziel, id, { ...konsumAuf(t.m, e), host: e.host || t.m.host || t.name });
            gesehen.add(id);
            n++;
        }
        if (t.m.zeit && String(t.m.zeit) > String(ziel.zeit || "")) ziel.zeit = t.m.zeit;
    }
    ziel.host = host;
    konsumRaeumen(ziel);
    const fehlt = (erwartet || []).map((s) => ({ nr: s.nr, ids: String(s.nur).split(",").filter((id) => id && !gesehen.has(id)) })).filter((s) => s.ids.length);
    return { m: ziel, n, fehlt };
}

// `vereine --sha <sha> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <epoch s>]`: jedes
// Unterverzeichnis von <dir> (download-artifact: teil-<nr>/) trägt <sha8>-<geraet>.json und roh/<sha8>-<geraet>/
function vereineCli(opt) {
    if (!opt.sha || !opt.geraet || !opt.farm || !opt.teile) throw new Error("vereine --sha <voll> --geraet <g> --farm <name> --teile <dir>");
    const name = opt.sha.slice(0, 8) + "-" + opt.geraet;
    const teile = [];
    for (const d of fs.readdirSync(opt.teile).sort()) {
        const f = path.join(opt.teile, d, name + ".json");
        if (fs.existsSync(f)) teile.push({ name: d, m: JSON.parse(fs.readFileSync(f, "utf8")), roh: path.join(opt.teile, d, "roh", name) });
        else console.log("  Teil " + d + " ohne " + name + ".json");
    }
    const erwartet = opt.scheiben ? JSON.parse(fs.readFileSync(opt.scheiben, "utf8")).scheiben : null;
    const datei = messDatei(opt.sha, opt.geraet);
    const alt = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const r = vereineMessungen(alt, teile, opt.sha, opt.geraet, opt.farm, erwartet);
    fs.writeFileSync(datei, JSON.stringify(r.m, null, 1) + "\n");
    const rohZiel = path.join(DIR, "messung", "roh", name);
    for (const t of teile) {
        if (!fs.existsSync(t.roh)) continue;
        fs.mkdirSync(rohZiel, { recursive: true });
        for (const f of fs.readdirSync(t.roh)) fs.copyFileSync(path.join(t.roh, f), path.join(rohZiel, f));
    }
    // die Zahl: je Läufer die Minuten seiner Läufe (ein Zwilling fuhr nie selbst), die Wanduhr ab dem Beginn der Farm
    const neu = teile.flatMap((t) => Object.entries(t.m.je || {}).map(([id, e]) => ({ id, ...e, host: e.host || t.name })));
    const jeHost = {};
    for (const e of neu) if (!e.zwilling) jeHost[e.host] = +((jeHost[e.host] || 0) + (e.minuten || 0)).toFixed(2);
    const ungemessen = teile.reduce((a, t) => a + Object.keys(t.m.ungemessen || {}).length, 0);
    const gruen = neu.filter((e) => e.gruen).length;
    const wanduhr = opt.beginn ? +((Date.now() / 1000 - Number(opt.beginn)) / 60).toFixed(1) : null;
    const laengste = Math.max(0, ...Object.values(jeHost));
    const zeile = "Farm " + opt.geraet + " " + name.slice(0, 8) + ": " + neu.length + " Stationen aus " + teile.length + " Teilen · GRÜN " + gruen +
        " · ROT " + (neu.length - gruen) + (ungemessen ? " · ungemessen " + ungemessen : "") + " · längster Läufer " + laengste + " min · Σ " +
        +Object.values(jeHost).reduce((a, x) => a + x, 0).toFixed(1) + " min" + (wanduhr != null ? " · Wanduhr " + wanduhr + " min" : "");
    console.log(zeile);
    for (const e of neu.sort((a, b) => a.id.localeCompare(b.id))) console.log(stationsZeile(e.id, e) + " · " + e.host);
    for (const s of r.fehlt) console.log("  FEHLT Scheibe " + s.nr + " (" + s.ids.length + " Stationen, kein Teil): " + s.ids.join(","));
    console.log("→ " + path.relative(KOORD, datei));
    return { ...r, zeile };
}

// DER RUF DER FARM — der EINE Weg einer headless-Messung (G4: der Laptop trägt 0 headless-Last; bis 27.10. fuhr `run --geraet
// headless` am Platz und nahm unter dem Schloss des Rechners Plätze neben den Zeit-Läufen der Radeon: takt10-headless an
// dc06b495 trug nach 1 h 08 min 5 von 81 Stationen, 9 ungemessen am blockierten Schloss). `run --geraet headless` ohne --farm
// ruft punkte-farm.yml im Spiel-Repo (workflow_dispatch am Zweig PUNKTE_FARM_REF, Vorgabe main) mit derselben Auswahl, findet
// den Lauf an seiner Marke (run-name), meldet jeden fertigen Läufer, holt nach dem Lauf die gepushte Messung in den Baum der
// Maschine (git checkout origin/<zweig> -- Datei und Roh-Ausgaben: dieselben Bytes wie am Zweig, ein späterer Merge findet
// gleiche Zugänge) und schreibt die Zeilen, die zug.cjs liest. Ein Ruf, den GitHub abweist, ist ROT beim Grund — nie ein Lauf am
// Platz. Der Schlüssel: GH_TOKEN | GITHUB_TOKEN | git credential (github.com).
const FARM_WORKFLOW = "punkte-farm.yml";
function ghSchluessel() {
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    const r = spawnSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", windowsHide: true });
    const t = (/^password=(.+)$/m.exec(String(r.stdout || "")) || [])[1];
    if (!t) throw new Error("Farm: kein GitHub-Schlüssel (GH_TOKEN, GITHUB_TOKEN oder git credential für github.com)");
    return t.trim();
}
const repoSlug = (url) => {
    const m = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(String(url).trim());
    if (!m) throw new Error("Farm: origin " + url + " ist kein GitHub-Repo");
    return m[1];
};
// die Eingaben des Rufs: die Auswahl reist als Liste (nur) — --offen urteilt HIER, am selben Stand der Messungen, den die Buchung
// liest; die Marke findet den Lauf (run-name)
const farmEingaben = (meine, sha, zweig, marke, jobs) => ({ sha, auswahl: "nur", nur: meine.map(schluessel).join(","), jobs: String(jobs || 12), koord: zweig, marke });
async function farmRufen(opt, a, warte = (ms) => new Promise((r) => setTimeout(r, ms))) {
    const { repo, sha, meine } = a;
    const slug = repoSlug(git(["remote", "get-url", "origin"], repo));
    const zweig = git(["rev-parse", "--abbrev-ref", "HEAD"], KOORD);
    if (zweig === "HEAD") throw new Error("Farm: der Baum der Maschine steht auf keinem Zweig (die Farm pusht ihre Messung auf einen Zweig)");
    const ref = process.env.PUNKTE_FARM_REF || "main";
    const marke = os.hostname() + "-" + process.pid + "-" + Date.now();
    const auswahlArt = opt.nur ? "nur" : opt.offen ? "offen" : "alle";
    const schluesselGh = ghSchluessel();
    const api = async (p, init = {}) => {
        const r = await fetch("https://api.github.com/repos/" + slug + p, { ...init, headers: { Authorization: "Bearer " + schluesselGh,
            Accept: "application/vnd.github+json", "User-Agent": "punkte-maschine", ...(init.body ? { "Content-Type": "application/json" } : {}) } });
        const text = await r.text();
        if (!r.ok) throw new Error("Farm: " + (init.method || "GET") + " " + p + " → " + r.status + " " + text.slice(0, 200));
        return text ? JSON.parse(text) : null;
    };
    await api("/actions/workflows/" + FARM_WORKFLOW + "/dispatches", { method: "POST", body: JSON.stringify({ ref, inputs: farmEingaben(meine, sha, zweig, marke, opt.jobs) }) });
    let lauf = null;
    for (let i = 0; i < 60 && !lauf; i++) {
        await warte(5000);
        const l = await api("/actions/workflows/" + FARM_WORKFLOW + "/runs?event=workflow_dispatch&per_page=30");
        lauf = (l.workflow_runs || []).find((r) => String(r.display_title || r.name).includes(marke)) || null;
    }
    if (!lauf) throw new Error("Farm: der Lauf mit der Marke " + marke + " erschien nicht binnen 5 min (" + ref + ")");
    console.log(startZeile(meine.length, gruppiere(meine), "headless", sha, 1) + " · auf der Farm (" + auswahlArt + ") " + lauf.html_url);
    const gemeldet = new Set();
    for (;;) {
        const j = await api("/actions/runs/" + lauf.id + "/jobs?per_page=100");
        for (const x of j.jobs || [])
            if (x.status === "completed" && !gemeldet.has(x.id)) {
                gemeldet.add(x.id);
                console.log("  Farm: " + x.name + " · " + x.conclusion + " · " + ((new Date(x.completed_at) - new Date(x.started_at)) / 60000).toFixed(1) + " min");
            }
        lauf = await api("/actions/runs/" + lauf.id);
        if (lauf.status === "completed") break;
        await warte(30000);
    }
    const datei = messDatei(sha, "headless");
    const rel = (f) => path.relative(KOORD, f).split(path.sep).join("/");
    const roh = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-headless");
    git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":refs/remotes/origin/" + zweig], KOORD);
    const da = (p) => spawnSync("git", ["cat-file", "-e", "origin/" + zweig + ":" + p], { cwd: KOORD }).status === 0;
    if (!da(rel(datei))) throw new Error("Farm: der Lauf " + lauf.html_url + " endete " + lauf.conclusion + " ohne " + rel(datei) + " auf " + zweig);
    git(["checkout", "origin/" + zweig, "--", rel(datei), ...(da(rel(roh)) ? [rel(roh)] : [])], KOORD);
    const m = JSON.parse(fs.readFileSync(datei, "utf8"));
    const von = "farm:" + lauf.id;
    for (const st of meine) {
        const id = schluessel(st);
        const e = (m.je[id] && String(m.je[id].host).startsWith(von) && m.je[id]) || (m.ungemessen && m.ungemessen[id] && String(m.ungemessen[id].host).startsWith(von) && m.ungemessen[id]);
        console.log(e ? stationsZeile(id, e) : "  OFFEN " + id + " · der Farm-Lauf trug kein Urteil · Bahn farm · ungemessen, `run --offen` misst neu");
    }
    if (lauf.conclusion !== "success") {
        console.log("Farm-Lauf " + lauf.html_url + " endete " + lauf.conclusion);
        process.exitCode = 1;
    }
    console.log("→ " + rel(datei) + " (von " + zweig + ", Lauf " + lauf.id + ")");
    return m;
}

// die Wellen einer Fahrt am SHA (fahrtWellen) samt ihrer Zeile im Log — run und run --trocken: mit --offen fragt sie die Buchung, was auf
// dieser Karte Punkte ändern kann; wirft die Buchung, steht der Grund in der Zeile und die Fahrt ordnet nur nach dem Alter
function wellenDerFahrt(opt, sha, proben) {
    let hebt = null, warf = null;
    if (opt.offen && !opt.eich)
        try {
            hebt = new Set(gtxNutzen(buchenCli({ kopf: sha, trocken: true }), opt.geraet).ja);
        } catch (e) {
            warf = String((e && e.message) || e).split("\n")[0].slice(0, 200);
        }
    const w = fahrtWellen(proben, opt.geraet, ladeMessungen(), hebt);
    const sek = (gs) => gs.reduce((a, g) => a + probeSek(g[0], opt.geraet) * teileVon(g[0]), 0);
    console.log("  WELLEN " + opt.geraet + " am " + sha.slice(0, 8) + (warf ? " OHNE NUTZEN (die Buchung warf: " + warf + ")" : "") + ": " +
        w.wellen.map((gs, i) => (i + 1) + " " + w.namen[i] + " " + gs.length + " Läufe Σ Deckel " + sek(gs) + " s" +
            (w.namen[i] === "rest" ? "" : " (" + sitzungsReihe(gs, w.haengt).map((g) => g.map(schluessel).join("+")).join(" ") + ")")).join(" · ") +
        " · das Älteste zuerst · hängt zuletzt: " + (w.je.filter((x) => x.haengt).map((x) => x.ids[0] + " " + x.risse + "×").join(" ") || "—"));
    return w;
}

async function run(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    // der Zeuge der Fremd-Last legt seinen Grund, ehe die erste Station misst (Windows: der PowerShell-Lauf braucht seinen ersten Takt)
    if (!opt.trocken) await maschinenZeuge().bereit();
    // DIE AUFFÜLLUNG DER RUHE (die Ablage der Fahrten): bis REFERENZ_RUHE_MIN frische Fahrten des Umfelds „allein“ im Pool liegen
    if (!opt.trocken) await referenzAuffuellen("allein");
    const gpuLauf = gpuLaufFuer(opt.geraet, opt.farm);
    const bahnenSoll = Number(opt.bahnen || 3);
    if (!(bahnenSoll >= 1 && bahnenSoll <= MAX_BAHNEN && Number.isInteger(bahnenSoll)))
        throw new Error("--bahnen " + opt.bahnen + ": 1 bis " + MAX_BAHNEN + " (je Bahn ein Port-Band)");
    const band = (b) => portBand(opt.portBasis || 7700, opt.geraet, b);
    for (let b = 0; b < bahnenSoll; b++) band(b);
    const a = auswahl(opt);
    const { repo, sha, tot } = a;
    let meine = a.meine;
    if (!meine.length) {
        console.log("Punkte-Maschine: am " + sha.slice(0, 8) + " ist jede Station auf " + opt.geraet + " frisch gemessen" + (opt.eich ? " oder geeicht — nichts zu eichen" : ""));
        return null;
    }
    // headless misst nie am Platz: ohne --farm ruft run die Farm und holt ihre Messung (farmRufen)
    if (opt.geraet === "headless" && !opt.farm && !opt.trocken) return farmRufen(opt, a);
    if (opt.trocken) {
        console.log("Punkte-Maschine (trocken): " + meine.length + " Station(en) auf " + opt.geraet + " am " + sha.slice(0, 8) + ", " +
            planText(gruppiere(meine), bahnenSoll, opt.geraet) + (opt.eich ? " · EICH-FAHRT: je Probe ihre Sekunden an der Leine, die Fahrt ≤ " + FAHRT_MAX_S + " s" : "") + ": " +
            meine.map((st) => schluessel(st) + (st.zeit ? "(Zeit)" : "")).join(" "));
        const pr = opt.geraet === "headless" ? [] : gruppiere(meine).filter((g) => g[0].probe);
        if (pr.length) wellenDerFahrt(opt, sha, pr);
        return null;
    }
    // EIN Lauf je Spiel-Baum: ein zweiter Lauf auf demselben Gerät checkte sonst seinen SHA in den Baum des ersten
    await baumSperre(repo, opt.geraet);
    const baum = baumAmSha(repo, opt.geraet, sha);
    const datei = messDatei(sha, opt.geraet);
    const rohDir = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-" + opt.geraet);
    fs.mkdirSync(path.dirname(datei), { recursive: true }); // die Farm checkt messung/ nie aus (ihr Teil trägt nur die Scheibe)
    let m = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const host = opt.farm || os.hostname();
    if (!m || m.sha !== sha) m = { sha, geraet: opt.geraet, zeit: null, host, je: {} };
    const hilfe = hilfeText();
    // DIE WAND PFAD: eine Station mit totem Glob am SHA fährt nie — sie ist ROT beim Glob (R6 wäre für ihn blind)
    for (const st of meine.filter((s) => tot(s).length)) {
        const grund = pfadGrund(tot(st), "am " + sha.slice(0, 8));
        m.je[schluessel(st)] = { gruen: false, zahl: grund, exit: null, minuten: 0, grund, zeit: new Date().toISOString(), abdruck: abdruck(st, hilfe, opt.geraet), ...(opt.farm ? { host } : {}) };
        console.log("  ROT  " + schluessel(st) + " · " + grund);
    }
    meine = meine.filter((s) => !tot(s).length);
    if (!meine.length) {
        m.zeit = new Date().toISOString();
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
        return m;
    }
    const alle = gruppiere(meine);
    // DIE SITZUNG zuerst (eine Welt, jede Probe darin), danach der Rest auf den Bahnen wie bisher
    const proben = opt.geraet === "headless" ? [] : alle.filter((g) => g[0].probe);
    const gruppen = alle.filter((g) => !proben.includes(g));
    const bahnen = Math.max(1, Math.min(bahnenSoll, gruppen.filter((g) => !istZeit(g)).length));
    const ctx0 = { koord: KOORD, geraet: opt.geraet, bash: findeBash(), plaetze: bahnen, gpuLauf };
    // je Bahn der EIGENE Spiel-Baum (Spielstände, Rohdateien) und das eigene Port-Band
    const baeume = [baum];
    for (let i = 2; i <= bahnen && gruppen.length; i++) baeume.push(baumAmSha(repo, opt.geraet + "-" + i, sha));
    console.log(startZeile(meine.length, alle, opt.geraet, sha, bahnen) + " (Baum " + baeume.join(", ") + ")");
    fs.mkdirSync(rohDir, { recursive: true });
    // je Gruppe die Einträge ihrer Stationen (der Zwilling erbt Lauf und Roh-Ausgabe der ersten)
    const melde = (g, es, aus, wie) => {
        const ids = g.map(schluessel);
        const zeit = wie.zeit;
        g.forEach((st, i) => {
            const id = ids[i];
            if (aus && i > 0 && fs.existsSync(aus.roh)) fs.copyFileSync(aus.roh, path.join(rohDir, id.replace("#", "_") + ".out"));
            const e = stationsEintrag(es[i], { zeit, abdruck: abdruck(st, hilfe, opt.geraet), port: wie.port, bahn: wie.bahn, host: opt.farm ? host : null, zwilling: i > 0 ? ids[0] : null, modus: wie.modus });
            eintragen(m, id, e);
            console.log(stationsZeile(id, e));
            // die Zahl der Eich-Fahrt (eichEintrag) — die Sekunden VOR der Id: der Fortschritt liest das Urteil aus „<Urteil> <id>“
            if (e.eich) console.log("  EICH " + (e.eich.gerissen ? "≥ " : "") + e.eich.s + " s · " + id + " · Grund-Deckel " + e.eich.sek + " s · " +
                (e.eich.gerissen ? "an der Leine gefallen" : "das Urteil fiel") + (e.zwilling ? " (Zwilling von " + e.zwilling + ")" : ""));
        });
        m.zeit = zeit;
        m.host = host;
        fs.writeFileSync(datei, JSON.stringify(konsumRaeumen(m), null, 1) + "\n");
    };
    if (proben.length) {
        const sb = portBand(opt.portBasis || 7700, opt.geraet, MAX_BAHNEN);
        // DIE WELLEN DER FAHRT (fahrtWellen): mit --offen zuerst, was auf dieser Karte EIN GRÜN bucht, dann was Punkte ändern kann, dann
        // der Rest — je Welle eine Sitzung mit ihrer Fortsetzung, das Älteste zuerst, das Hängende zuletzt; bricht der Dienst die Fahrt
        // ab (CI, Warter), ist die vordere Welle schon gemessen
        const w = wellenDerFahrt(opt, sha, proben);
        const sitzung = (gs) => fahreSitzung(gs, { ...ctx0, baum, port: sb.port, band: sb.alle, rohDir, eich: !!opt.eich, zuletzt: w.haengt },
            (g, es, aus, zeit) => melde(g, es, aus, { zeit, port: sb.port, bahn: "sitzung", modus: "session" }));
        delete m.fortsetzung;
        for (const [i, welle] of w.wellen.entries()) {
            if (w.wellen.length > 1) console.log("  WELLE " + (i + 1) + "/" + w.wellen.length + " " + w.namen[i] + ": " + welle.length + " Läufe — eine Sitzung");
            const k = await sitzung(welle);
            if (i === 0) m.sitzung = k;
            else (m.fortsetzung = m.fortsetzung || []).push({ ...k, welle: w.namen[i] });
            fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
            // DIE FORTSETZUNG (fahreFortsetzung): riss die Fahrt, misst eine neue Sitzung ihre offenen Proben — je Kopf in m.fortsetzung
            await fahreFortsetzung(welle, k, async (gs) => {
                const kf = await sitzung(gs);
                (m.fortsetzung = m.fortsetzung || []).push(kf);
                fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
                return kf;
            });
        }
    }
    await fahrePlan(gruppen, bahnen, async (g, b) => {
        const name = schluessel(g[0]).replace("#", "_");
        const ctx = { ...ctx0, baum: baeume[b], bahn: b, port: band(b).port, band: band(b).alle,
            aus: path.join(rohDir, name + ".json"), roh: path.join(rohDir, name + ".out") };
        const zeit = new Date().toISOString();
        const es = await fahreGruppe(g, ctx);
        melde(g, es, ctx, { zeit, port: ctx.port, bahn: istZeit(g) ? "allein" : b + 1 + "/" + bahnen });
    });
    console.log("→ " + path.relative(KOORD, datei));
    return m;
}
// DER EINTRAG einer Station in der Mess-Datei — EINE Form für Bahn und Sitzung (die Sitzung trägt modus "session", bahn "sitzung")
const stationsEintrag = (e, o) => ({ ...e, zeit: o.zeit, abdruck: o.abdruck, port: o.port, bahn: o.bahn, ...(o.host ? { host: o.host } : {}),
    ...(o.zwilling ? { zwilling: o.zwilling } : {}), ...(o.modus ? { modus: o.modus } : {}) });

// DER EINTRAG einer gefahrenen Station: ein Urteil (GRÜN/ROT) nach m.je, das Buchung und `run --offen` lesen; ein Lauf ohne
// Schloss (Exit 75, gpu-lauf.sh schwieg beim Warten) nach m.ungemessen mit Grund, NIE als ROT — frischUrteil nähme ihn sonst als
// frische Messung, und `run --offen` mäße die Station an diesem SHA nie neu (26.10., Prüfung gpu-bahnen)
function eintragen(m, id, e) {
    e = konsumTafeln(m, e);
    if (e.ungemessen) {
        (m.ungemessen = m.ungemessen || {})[id] = e;
        return;
    }
    m.je[id] = e;
    if (m.ungemessen) delete m.ungemessen[id];
    if (m.ungemessen && !Object.keys(m.ungemessen).length) delete m.ungemessen;
}
// WAS EIN ABGEBROCHENER LAUF GEMESSEN HAT, BLEIBT (`behalte`, 11.11., Koordinator): der Dienst der Radeon beendet die Messung, sobald
// ein CI-Job die Karte nimmt, und verwarf bis dahin die GANZE Mess-Datei — am 11.11. dreimal (06:55 · 12:07 · 12:41), jedes Mal mit
// fertig gemessenen Stationen (12:41: 14), denn die Züge lassen der Karte nur Fenster von 15–20 min und die volle Fahrt braucht mehr:
// die Radeon buchte den ganzen Tag nichts. Jede Station steht nach ihrem Urteil in der Datei (melde); sauber ist, was VOR dem Job
// endete. messungKappen: jeder Eintrag, dessen Lauf (zeit + s) nach `bisMs` endete, weicht dem Eintrag der Datei davor (`alt`, der
// Stand im Archiv) oder fällt; Rückgabe die Ids, die dieser Lauf neu trägt (behalten), und die gekappten (verworfen).
function messungKappen(m, alt, bisMs) {
    const ende = (e) => Date.parse(e.zeit || "") + 1000 * (e.s > 0 ? e.s : (e.minuten || 0) * 60);
    const altVon = (id) => (alt && alt.sha === m.sha && ((alt.je && alt.je[id]) || (alt.ungemessen && alt.ungemessen[id]))) || null;
    const behalten = [], verworfen = [];
    for (const id of [...Object.keys(m.je || {}), ...Object.keys(m.ungemessen || {})]) {
        const e = (m.je && m.je[id]) || m.ungemessen[id], a = altVon(id);
        if (a && JSON.stringify(a) === JSON.stringify(e)) continue; // dieser Lauf rührte ihn nicht an
        if (ende(e) <= bisMs) { behalten.push(id); continue; } // NaN (ohne Zeit) ist nie sauber
        verworfen.push(id);
        if (m.je) delete m.je[id];
        if (m.ungemessen) delete m.ungemessen[id];
        if (a) (a.ungemessen ? (m.ungemessen = m.ungemessen || {}) : m.je)[id] = a;
    }
    if (m.ungemessen && !Object.keys(m.ungemessen).length) delete m.ungemessen;
    return { m, behalten, verworfen };
}
// behalte --sha <sha> --geraet <g> --bis <ISO>: Exit 0 mit behaltenen Stationen, 3 ohne (die Datei steht dann wie im Archiv)
function behalteCli(o) {
    const sha = voll(spielRepo(), o.sha), datei = messDatei(sha, o.geraet), bis = Date.parse(o.bis || "");
    if (!Number.isFinite(bis)) throw new Error("--bis <ISO-Zeit>: bis wann der Lauf allein auf der Karte war");
    if (!fs.existsSync(datei)) { console.log("BEHALTEN 0 — keine " + path.relative(DIR, datei)); process.exitCode = 3; return; }
    const rel = path.relative(KOORD, datei).split(path.sep).join("/");
    const z = spawnSync("git", ["show", "HEAD:" + rel], { cwd: KOORD, encoding: "utf8", maxBuffer: 256 << 20 });
    const alt = z.status === 0 ? JSON.parse(z.stdout) : null;
    const r = messungKappen(JSON.parse(fs.readFileSync(datei, "utf8")), alt, bis);
    const gruen = r.behalten.filter((id) => r.m.je && r.m.je[id] && r.m.je[id].gruen === true).length;
    if (r.behalten.length) fs.writeFileSync(datei, JSON.stringify(r.m, null, 1) + "\n");
    else if (alt) fs.writeFileSync(datei, z.stdout);
    else fs.rmSync(datei, { force: true });
    console.log("BEHALTEN " + r.behalten.length + " Station(en), " + gruen + " GRÜN (endeten vor " + new Date(bis).toISOString() + ")" +
        (r.verworfen.length ? " · verworfen " + r.verworfen.length + ": " + r.verworfen.join(" ") : ""));
    process.exitCode = r.behalten.length ? 0 : 3;
}
// DIE ZEILEN, die der Läufer zug.cjs (artifacts/profiband/werkzeug, Fortschritt nach zug/fortschritt-radeon.txt) liest: Start
// `Punkte-Maschine: <n> Station(en) in `, Station `  GRÜN|ROT  <id> · … · Exit <c> · <min> min[ (Zwilling von <id>)]` — ein neues
// Feld steht VOR „· Exit“ (26.10.: „· allein“ am Zeilenende machte den Fortschritt der Radeon blind); ein ungemessener Lauf heißt
// OFFEN, weder GRÜN noch ROT
const startZeile = (n, gruppen, geraet, sha, bahnen) =>
    "Punkte-Maschine: " + n + " Station(en) in " + gruppen.length + " Läufen auf " + geraet + " am " + sha.slice(0, 8) + " · " + planText(gruppen, bahnen, geraet);
const stationsZeile = (id, e) => {
    const bahn = e.bahn === "allein" ? "allein" : e.bahn === "sitzung" ? "Sitzung" : "Bahn " + e.bahn;
    if (e.ungemessen) return "  OFFEN " + id + " · " + e.grund + " · " + bahn + " · ungemessen, `run --offen` misst neu";
    return "  " + (e.gruen ? "GRÜN" : "ROT ") + " " + id + " · " + e.zahl + " · " + bahn + " · Exit " + e.exit + " · " + e.minuten + " min" +
        (e.zwilling ? " (Zwilling von " + e.zwilling + ")" : "");
};

// Zwillinge (gleicher Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) fahren EINMAL: je Lauf eine Gruppe
function gruppiere(meine) {
    const gruppen = [];
    const je = new Map();
    for (const st of meine) {
        const k = JSON.stringify([st.befehl, st.env || {}, !!st.gpu, ...(st.probe ? [st.probe] : [])]);
        if (!je.has(k)) { je.set(k, []); gruppen.push(je.get(k)); }
        je.get(k).push(st);
    }
    return gruppen;
}
// DIE ZWILLINGE EINER LISTE (27.10., Karte lange-stationen): der Messplatz der OMEN fährt Station für Station (`run --nur <id>`) —
// so fuhr der Lauf von speicher.K1#1 und #2 zweimal (e7a28b06 GTX 12,43 + 12,42 min). `gruppen` nennt je Lauf die Ids seiner
// Zwillinge in der Reihe von `nur` (nur Gelistete), der Messplatz fährt je Zeile EIN `--nur`
function zwillingsGruppen(stationen, geraet, nur) {
    if (!GERAETE.includes(geraet)) throw new Error("--geraet radeon|gtx|headless");
    const meine = stationen.filter((st) => geraeteVon(st).includes(geraet));
    const ids = nur ? nur.split(",") : meine.map(schluessel);
    const liste = ids.map((id) => meine.find((st) => schluessel(st) === id) || id);
    const fremd = liste.filter((x) => typeof x === "string");
    if (fremd.length) throw new Error("--nur " + fremd.join(",") + ": keine Station auf " + geraet);
    // DIE SITZUNG ist EIN Lauf: jede Probe-Station in der ersten Zeile (der Messplatz fährt sie mit EINEM `run --nur`, EINE Welt) —
    // je Zeile eine eigene Sitzung bootete die Welt je Station neu
    const gs = gruppiere(liste);
    const sitz = geraet === "headless" ? [] : gs.filter((g) => g[0].probe).flat();
    return [...(sitz.length ? [sitz] : []), ...gs.filter((g) => !sitz.includes(g[0]))].map((g) => g.map(schluessel));
}
const sollMin = (gs) => gs.reduce((s, g) => s + g[0].minuten, 0);
function planText(gruppen, bahnen, geraet) {
    const sitz = gruppen.filter((g) => g[0].probe), rest = gruppen.filter((g) => !g[0].probe);
    const zeit = rest.filter(istZeit), bild = rest.filter((g) => !istZeit(g));
    const deckel = Math.round(sitz.reduce((s, g) => s + probeSek(g[0], geraet), 0) / 60);
    return (sitz.length ? "Sitzung " + sitz.length + " Proben in EINER Welt (Deckel Σ " + deckel + " min) · " : "") + "Zeit " + zeit.length + " Läufe ~" +
        sollMin(zeit) + " min allein · Bild " + bild.length + " Läufe ~" + sollMin(bild) + " min auf " + bahnen + " Bahn(en) · erwartet ~" +
        Math.round(sollMin(zeit) + sollMin(bild) / bahnen) + " min (Soll-Minuten" + (sitz.length ? " ohne Sitzung" : "") + ")";
}
// DER BAHN-PLAN (26.10., Karte gpu-bahnen: die Prüfung darf nie länger dauern als das Erstellen — ein Radeon-Takt fuhr 45 Stationen
// einzeln in 151–174 min, die meisten Bild-Urteile ohne ms): jede Zeit-Gruppe fährt ALLEIN auf Bahn 0, erst wenn keine andere
// läuft, und keine startet neben ihr; danach die Bild-Gruppen auf bis zu `bahnen` Bahnen zugleich, die längsten zuerst.
// fahre(gruppe, bahn) → Promise; das Platz-Schloss (gpu-lauf.sh) hält dieselbe Regel gegen fremde Läufe.
async function fahrePlan(gruppen, bahnen, fahre) {
    for (const g of gruppen.filter(istZeit)) await fahre(g, 0);
    const schlange = gruppen.filter((g) => !istZeit(g)).sort((a, b) => sollMin([b]) - sollMin([a]));
    await Promise.all(Array.from({ length: bahnen }, async (_, b) => {
        for (let g = schlange.shift(); g; g = schlange.shift()) await fahre(g, b);
    }));
}

// ───────────────────────────────── Buchung ─────────────────────────────────
// messungen: Liste {sha, geraet, je}; geaendert(messSha) → Liste der Dateien bis zum Kopf ohne Stempel (stempelDateien; wirft,
// wenn unbekannt) — die jüngste frische Messung je Station und Gerät (Abdruck gleich, Linse und Pfad seit der Messung unberührt;
// Werkzeug außerhalb der Linse ist kein Wechsel) — das EINE Frische-Urteil für die Buchung und für `run --offen`. opt.tot(st) →
// die toten Globs am Ziel-Stand (Wand PFAD) · opt.roh(sha, geraet, id) → die Roh-Ausgabe einer Messung ohne eigenen Zeugen (Wand
// GPU; "" wenn keine) · opt.linsen(st, messSha) → die Linse der Station am Mess-SHA und am Ziel (linsenAm; wirft, wenn unlesbar)
function frischUrteil(messungen, geaendert, hilfe = hilfeText(), opt = {}) {
    const diffCache = new Map();
    const diff = (sha) => {
        if (!diffCache.has(sha)) {
            try { const d = geaendert(sha); diffCache.set(sha, Array.isArray(d) ? { dateien: d } : d); } catch (e) { diffCache.set(sha, { fehler: e.message }); }
        }
        return diffCache.get(sha);
    };
    return (st, g) => {
        const id = schluessel(st);
        const tot = opt.tot ? opt.tot(st) : [];
        if (tot.length) return { gruen: false, ungemessen: true, tot: true, grund: pfadGrund(tot, "am Kopf") };
        const ab = abdruck(st, hilfe, g);
        let alt = 0, fremd = 0, unbekannt = 0, ohneZeugen = null, taeter = [], linse = 0, linsenTaeter = [], unlesbar = null, zuletzt = null;
        // R6 NACH KONSUM (Abschnitt Konsum): `juengste` = die jüngste Messung der Station mit ihrem Abdruck — trägt sie den Konsum, urteilt
        // die Hälfte nach Konsum (r6 "konsum"), sonst nach Linse und Glob (r6 "naehe", samt dem Grund `konsumFehlt`); ohne Messung null
        let konsumAlt = 0, konsumTaeter = [], juengste = null;
        const frisch = [];
        for (const m of messungen) {
            // der jüngste Lauf ohne Messung (m.ungemessen: kein Urteil, Deckel, Schloss) nennt sich im Grund — nie still gehalten
            const u = m.geraet === g && m.ungemessen && m.ungemessen[id];
            if (u && u.abdruck === ab && (!zuletzt || String(u.zeit) > String(zuletzt.zeit))) zuletzt = { ...u, sha: m.sha };
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            // der Konsum des Eintrags aus der Tafel seiner Mess-Datei; nennt er einen Abdruck, den die Tafel nicht trägt, fehlt er beim Namen
            const K = e.konsum ? konsumVon(e, m) : null;
            if (!juengste || String(e.zeit) > String(juengste.zeit)) juengste = { zeit: e.zeit, konsum: !!K, konsumFehlt: e.konsum && !K ? "die Tafel der Mess-Datei trägt den Abdruck nicht" : e.konsumFehlt };
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            if (K) {
                const kt = konsumTreffer(K, d, st, e.konsumSeite !== false, opt.skript ? opt.skript(m.sha) : null);
                if (kt.length) { konsumAlt++; konsumTaeter = kt; continue; }
            } else {
                // ohne Konsum-Menge wie bisher: die Linse der Station (linsenVon), dann ihr Glob
                let L;
                try { L = new Set(opt.linsen ? opt.linsen(st, m.sha) : []); } catch (e) { unlesbar = e.message; continue; }
                const l = d.dateien.filter((f) => L.has(f));
                if (l.length) { linse++; linsenTaeter = l; continue; }
                const t = d.dateien.filter((f) => !WERKZEUG_PFAD.test(f) && trifftPfad(f, st.pfad));
                if (t.length) { alt++; taeter = t; continue; }
            }
            // ein GRÜN einer GPU-Station trägt den Zeugen der Karte: im Eintrag (seit der Wand) oder in seiner Roh-Ausgabe
            if (st.gpu && e.gruen) {
                const z = "gpu" in e ? { karte: e.gpu, fremd: e.gpuFremd || null, nie: e.gpuNie || 0 } : gpuZeuge(opt.roh ? opt.roh(m.sha, g, id) : "");
                const w = gpuWand(z);
                if (w) { ohneZeugen = w; continue; }
            }
            frisch.push({ ...e, sha: m.sha, geraet: g, r6: K ? "konsum" : "naehe" });
        }
        frisch.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
        const r6 = juengste ? (juengste.konsum ? { r6: "konsum" } : { r6: "naehe", ...(juengste.konsumFehlt ? { r6Grund: juengste.konsumFehlt } : {}) }) : {};
        if (frisch.length) return { ...frisch[0], r6: frisch[0].r6 };
        // der Grund der jüngsten verworfenen Art zuerst: ein GRÜN ohne Zeugen vor dem R6 einer älteren Messung
        const nenne = (xs) => xs.slice(0, 3).join(", ") + (xs.length > 3 ? " +" + (xs.length - 3) : "");
        const grund = ohneZeugen ? "Wand GPU: " + ohneZeugen : konsumAlt && r6.r6 === "konsum" ? "Konsum seit der Messung geändert (R6: " + nenne(konsumTaeter) + ")" : linse ? "Linse seit der Messung geändert (R6: " + nenne(linsenTaeter) + ")" : alt ? "Pfad seit der Messung geändert (R6: " + nenne(taeter) + ")" : unlesbar ? "Linse unlesbar — kein R6-Urteil (" + unlesbar + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)";
        return { gruen: false, ungemessen: true, ...r6, grund: grund + (zuletzt ? " — zuletzt an " + String(zuletzt.sha).slice(0, 8) + ": " + String(zuletzt.grund).slice(0, 200) : "") };
    };
}

// DIE PUNKTE-REGEL (R2) eines Kriteriums — die EINE für die Buchung und für gtx-nutzen: sts die Stationen des Kriteriums,
// urteil(st, g) → { gruen } je Station und Gerät. 1 = jede Staffel-1-Station auf mindestens einem Gerät grün (`beide`: auf
// jedem) · 2 = dazu jede Staffel-2-Station auf JEDEM Gerät grün · sonst 0
function stufen(sts, urteil) {
    const stufe = (n, alle) => {
        const xs = sts.filter((s) => s.staffel === n);
        const r = xs.map((s) => ({ s, je: geraeteVon(s).map((g) => ({ g, e: urteil(s, g) })) }));
        const ok = xs.length > 0 && r.every((x) => (alle || x.s.beide ? x.je.every((y) => y.e.gruen) : x.je.some((y) => y.e.gruen)));
        return { ok, r };
    };
    const s1 = stufe(1, false), s2 = stufe(2, true);
    return { s1, s2, punkte: s1.ok && s2.ok ? 2 : s1.ok ? 1 : 0 };
}

function buchen(kopf, stationen, messungen, geaendert, hilfe = hilfeText(), fehlt = [], opt = {}) {
    const frisch = frischUrteil(messungen, geaendert, hilfe, opt);
    // DIE RATSCHE: das GRÜN der letzten Buchung je Station und Gerät (opt.vorher = stand.json der letzten Buchung)
    const vorher = new Map();
    for (const e of [...Object.values((opt.vorher && opt.vorher.je) || {}), ...Object.values((opt.vorher && opt.vorher.pflichtJe) || {})])
        for (const x of e.stationen || []) if (x.gruen && x.sha) vorher.set(x.id + "|" + x.geraet, x);
    const rueckfall = [];
    const stand = (st, g) => {
        const e = frisch(st, g), v = vorher.get(schluessel(st) + "|" + g);
        if (!v || e.tot) return e;
        if (!e.ungemessen) {
            if (!e.gruen) rueckfall.push(schluessel(st) + " " + g + ": " + (e.zahl || "ROT") + " an " + String(e.sha).slice(0, 8) + " (grün gebucht an " + v.sha.slice(0, 8) + ")");
            return e;
        }
        return { gruen: true, zahl: v.zahl, sha: v.sha, gehalten: true, grund: e.grund, ...(e.r6 ? { r6: e.r6 } : {}) };
    };
    const je = {};
    const pflichtJe = {};
    const kriterien = [...new Set(stationen.map((s) => s.kriterium))].sort();
    for (const k of kriterien) {
        const pflicht = stationen.some((s) => s.kriterium === k && ohnePunkte(s));
        const { s1, s2, punkte } = stufen(stationen.filter((s) => s.kriterium === k), stand);
        const teile = [];
        const offen = [];
        // eine erfüllte Stufe nennt ihre Grünen, eine offene jedes fehlende Gerät beim Grund
        for (const [n, s] of [[1, s1], [2, s2]])
            for (const x of s.r)
                for (const y of x.je) {
                    if (y.e.gruen) teile.push((y.e.gehalten ? "gehalten: " : "") + y.e.zahl + " an " + y.e.sha.slice(0, 8) + " " + y.g);
                    else if (!(n === 1 && s.ok)) offen.push(k + "#" + n + " " + y.g + ": " + (y.e.ungemessen ? y.e.grund : y.e.grund || "ROT: " + y.e.zahl) + (y.e.sha ? " an " + y.e.sha.slice(0, 8) : ""));
                }
        // eine Staffel ohne Werkzeug (fehlt) nennt sich im Beleg — die Maschine bucht sie nie
        if (s1.ok) for (const f of fehlt) if (f.kriterium === k && f.staffel === 2) offen.push(k + "#2: kein Werkzeug (fehlt)");
        (pflicht ? pflichtJe : je)[k] = {
            punkte: pflicht ? 0 : punkte,
            beleg: "Maschine: " + (teile.length ? teile.join(" · ") : "0") + (offen.length ? " — offen: " + offen.join(" · ") : ""),
            // ungemessen/tot: das Frische-Urteil selbst — keine frische Messung am Kopf (tot: die Wand PFAD, eine Messung heilt sie nie)
            stationen: [s1, s2].flatMap((s) => s.r.flatMap((x) => x.je.map((y) => ({ id: schluessel(x.s), geraet: y.g, gruen: !!y.e.gruen, zahl: y.e.zahl || null, sha: y.e.sha || null, grund: y.e.grund || null,
                ...(y.e.ungemessen ? { ungemessen: true } : {}), ...(y.e.tot ? { tot: true } : {}), ...(y.e.gehalten ? { gehalten: true } : {}), ...(y.e.r6 ? { r6: y.e.r6 } : {}),
                ...(x.s.beide ? { beide: true } : {}) })))),
        };
    }
    return { kopf, je, pflichtJe, rueckfall, r6: r6Zaehlung({ je, pflichtJe }) };
}
// DIE ZÄHLUNG VON R6 (kein stiller Rückfall): je Stations-Hälfte der Buchung, wonach ihr Frische-Urteil fiel — `konsum` (die jüngste
// Messung trägt die Konsum-Menge), `naehe` beim Namen (sie trägt keine: Linse und Glob urteilen wie bisher), `ohne` (nie gemessen
// oder toter Glob: kein R6-Urteil)
function r6Zaehlung(s) {
    const alle = [...Object.values(s.je || {}), ...Object.values(s.pflichtJe || {})].flatMap((e) => e.stationen || []);
    const naehe = alle.filter((x) => x.r6 === "naehe").map((x) => x.id + " " + x.geraet);
    return { haelften: alle.length, konsum: alle.filter((x) => x.r6 === "konsum").length, naehe, ohne: alle.filter((x) => !x.r6).length };
}
const r6Zeile = (r) => "R6 nach Konsum: " + r.konsum + " von " + r.haelften + " Hälften · ohne Konsum-Menge (R6 nach Linse und Glob wie bisher) " + r.naehe.length +
    (r.naehe.length ? ": " + r.naehe.slice(0, 12).join(", ") + (r.naehe.length > 12 ? " +" + (r.naehe.length - 12) : "") : "") + " · ohne Messung " + r.ohne;

function ladeMessungen(mdir = path.join(DIR, "messung")) {
    if (!fs.existsSync(mdir)) return [];
    return fs.readdirSync(mdir).filter((f) => /\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")));
}

// R6 urteilt über die Bytes OHNE Versions-Stempel (?v=, "version", VERSION) — 23.10.: jede Versions-Stufe stempelt index.html
// und die Worker neu, und die Buchung am nächsten Kopf warf darum jede Station mit index.html im Pfad weg, obwohl kein Spiel-Byte
// anders war. Mess-Werkzeug (scripts/, spec/, .github/, docs/, artifacts/, *.md) ist kein Weltwechsel — AUSSER der Linse der
// Station (linsenVon): der Abdruck hasht nur den Befehls-String, nie den Inhalt der Linse (28.10.: nach einem Linsen-Umbau galt
// die Messung mit der alten Linse still als frisch).
const WERKZEUG_PFAD = /^(scripts|spec|\.github|docs|artifacts)\/|\.md$/;
const VERSIONS_STEMPEL = [
    [/\?v=[0-9A-Za-z._-]+/g, "?v="],
    [/("version"\s*:\s*")[^"]*"/g, '$1"'],
    [/(VERSION\s*=\s*["'`])[^"'`]*(["'`])/g, "$1$2"],
];
const ohneStempel = (z) => VERSIONS_STEMPEL.reduce((s, [rx, e]) => s.replace(rx, e), z);
// namen: git diff --no-renames --name-only · diffText: git diff --no-renames -U0 über dieselben Stände → { dateien: die Dateien, deren
// Bytes ohne Stempel sich änderten (Werkzeug eingeschlossen — welches davon zählt, urteilt frischUrteil je Station) · zeilen: je
// Text-Datei die geänderten Zeilen am ÄLTEREN Stand [von, bis] (ein Hunk aus reinen Versions-Stempeln fällt; eine reine Einfügung
// nach Zeile a trifft a und a + 1 — sie liegt nur dann in nie ausgeführtem Code, wenn beide Nachbarn es sind; je Hunk `nurKommentar`
// und `ein`, kommentarHunk) · neu: angelegte und gelöschte Dateien (ein gelesenes Verzeichnis, konsumTreffer) }
function stempelDiff(namen, diffText) {
    const je = new Map();
    let cur = null, h = null;
    // je Hunk dazu: bringt er nur Zeilen-Kommentare und Leerzeilen (`nurKommentar` — ob auch die alten Zeilen welche sind, urteilt
    // kommentarHunk am Text des Mess-SHA), ist er eine reine Einfügung (`ein`)
    const hunkZu = () => {
        if (h && h.weg.slice().sort().join("\n") !== h.neu.slice().sort().join("\n"))
            cur.zeilen.push(Object.assign(h.alt, { nurKommentar: h.neu.every((z) => /^\s*(\/\/.*)?$/.test(z)), ein: h.ein }));
        h = null;
    };
    for (const z of String(diffText).split("\n")) {
        const m = /^diff --git a\/(.+?) b\//.exec(z);
        if (m) {
            if (cur) hunkZu();
            cur = { weg: [], neu: [], bin: false, zeilen: [], angelegt: false };
            je.set(m[1], cur);
            continue;
        }
        if (!cur || z.startsWith("+++ ") || z.startsWith("--- ")) continue;
        const k = /^@@ -(\d+)(?:,(\d+))? /.exec(z);
        if (k) {
            hunkZu();
            const [a, n] = [+k[1], k[2] == null ? 1 : +k[2]];
            h = { weg: [], neu: [], alt: n ? [a, a + n - 1] : [Math.max(1, a), a + 1], ein: !n };
        } else if (/^(new|deleted) file mode /.test(z)) cur.angelegt = true;
        else if (/^Binary files /.test(z)) cur.bin = true;
        else if (z[0] === "-" || z[0] === "+") {
            const s = ohneStempel(z.slice(1));
            (z[0] === "-" ? cur.weg : cur.neu).push(s);
            if (h) (z[0] === "-" ? h.weg : h.neu).push(s);
        }
    }
    if (cur) hunkZu();
    const dateien = String(namen).split("\n").filter(Boolean).filter((f) => {
        const d = je.get(f);
        if (!d || d.bin) return true;
        return d.weg.slice().sort().join("\n") !== d.neu.slice().sort().join("\n");
    });
    return { dateien, zeilen: new Map(dateien.filter((f) => je.has(f) && !je.get(f).bin).map((f) => [f, je.get(f).zeilen])),
        neu: new Set(dateien.filter((f) => je.has(f) && je.get(f).angelegt)) };
}
const stempelDateien = (namen, diffText) => stempelDiff(namen, diffText).dateien;
// der Diff zweier Stände des Spiel-Klons für R6 — EINE Stelle für buchen, run --offen und beruehrt: DIE R6-QUELLE (r6Quelle, `geaendert`)
// DAS BEFEHLS-VERZEICHNIS VON NPM (10.11.: 3 der letzten 39 Landungen änderten in package.json nur eine Skript-Zeile, und jeder Prozess
// mit puppeteer liest package.json für dessen Einstellung): `nurNpmSkripte` nennt einen Diff, der in package.json außer `scripts` und
// `version` nichts ändert — er trifft nur einen Lauf, in dem npm lief (der Zeuge sagt es: ":npm" im Konsum, konsumTreffer)
const NPM_VERZEICHNIS = "package.json";

// ───────────────────────────────── Konsum (R6) ─────────────────────────────────
// R6 NACH KONSUM (10.11., Befund GROSSES BILD B2 + B6: an vier der fünf Landungen 900c28e6 … 4e2df19b machte EINE geänderte Datei der
// Linsen-Hülle — abnahme-urteil.cjs, welt-boot.cjs — 388 von 388 Stations-Hälften alt, an der fünften 315; die Messung holt die
// Integration nie ein). Eine Station veraltet nur, wenn sie den geänderten Code AUSFÜHRTE: der Zeuge konsum-zeuge.cjs fährt in jedem
// node-Prozess des Laufs (Vorarbeit r6-konsum-koord, 26.10.), die Faltung legt seinen Konsum komprimiert in den Eintrag der Messung —
// je Skript EIN Bit je Funktion des Parsers am Text des Mess-SHA ("<h>:<Bits>", skriptBits; der Kopf-Code eines geladenen Skripts zählt
// immer) oder "*" (ganz gelesen: Daten, Dokument, Text-Scan; ein Skript ohne Coverage) und je gelesenes Verzeichnis "pfad/" ("pfad/**"
// rekursiv). IM EINTRAG der Mess-Datei: `konsum` (der Abdruck des Laufs, sein Schlüssel in m.konsumTafel — Zwillinge teilen ihn),
// `konsumBoot` (in der Sitzung: der Abdruck des Boots ihrer Welt, EINER für alle Proben), `konsumN` (Dateien), `konsumSeite`,
// `konsumGanz` ({ Grund: Zahl } der ganz gezählten Dateien) — oder `konsumFehlt` (der Grund, warum der Lauf keinen trägt).
// Eine Messung MIT Konsum ist alt, wenn der Diff seit ihr eine Zeile ändert, die der Lauf ausführte (Kopf-Code, der Rumpf einer
// gerufenen Funktion — ein reiner Kommentar-Hunk nie, kommentarHunk), eine ganz gelesene Datei ändert (package.json nur außerhalb
// ihres Befehls-Verzeichnisses, solange kein npm lief — r6Quelle), einem gelesenen Verzeichnis eine Datei gibt oder nimmt
// oder eine im Befehl genannte Datei trifft, die der Konsum nicht als Skript trägt (ein Shell-Skript läuft ohne Zeugen). Die statische
// require-Hülle (linsenVon) und der Glob urteilen über sie nicht mehr — AUSSER: trägt der Konsum die SEITE nicht (`konsumSeite`
// false: eine Zeit-Station, eine Probe der Sitzung — der Zeuge misst dort nie in der Seite, konsum-zeuge.cjs), urteilt über die
// Spiel-Dateien weiter der Glob `pfad`. KEIN STILLER RÜCKFALL: eine Messung OHNE Konsum (ältere Messung, ein hart getöteter Prozess —
// `konsumFehlt` nennt den Grund) urteilt wie bisher nach Linse und Glob, und die Buchung zählt beim Namen, wie viele Hälften nach
// Konsum urteilen und welche nicht (r6Zaehlung).
const KONSUM_ZEUGE = path.join(DIR, "konsum-zeuge.cjs");
const konsumUmgebung = (env, ordner, baum, seite) => {
    Object.assign(env, { PUNKTE_KONSUM: ordner, PUNKTE_KONSUM_BAUM: baum,
        NODE_OPTIONS: ((env.NODE_OPTIONS || "") + ' --require "' + KONSUM_ZEUGE.split(path.sep).join("/") + '"').trim() });
    if (seite) env.PUNKTE_KONSUM_SEITE = "1";
    else delete env.PUNKTE_KONSUM_SEITE;
};
function konsumAn(env, ordner, baum, seite) {
    fs.rmSync(ordner, { recursive: true, force: true });
    fs.mkdirSync(ordner, { recursive: true });
    konsumUmgebung(env, ordner, baum, seite);
    return ordner;
}
const konsumLies = (ordner, re) => fs.readdirSync(ordner).filter((f) => re.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(ordner, f), "utf8")));
const konsumOffen = (ordner) => (fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((f) => f.endsWith(".offen")).map((f) => f.slice(0, -6)) : []);
// DER ABSCHLUSS AUF ZURUF: jeder Prozess des Laufs, der noch lebt (ein Server, den die Linse stehen ließ — das Port-Räumen tötet ihn
// gleich hart), schreibt seinen Konsum, ehe er fällt (`<id>.bitte`, bis KONSUM_FRIST_MS); Rückgabe { stuecke } oder { fehlt }
const KONSUM_FRIST_MS = 3000;
async function konsumSchliessen(ordner) {
    if (!fs.existsSync(ordner)) return { fehlt: "kein Prozess der Station trug den Zeugen" };
    const lebend = konsumOffen(ordner).filter((id) => lebtPid(parseInt(id, 10)));
    for (const id of lebend) fs.writeFileSync(path.join(ordner, id + ".bitte"), "");
    for (const frist = Date.now() + KONSUM_FRIST_MS; lebend.some((id) => fs.existsSync(path.join(ordner, id + ".offen"))) && Date.now() < frist; ) await warteMs(15);
    const offen = konsumOffen(ordner);
    if (offen.length) return { fehlt: offen.length + " Prozess(e) ohne Ende (hart getötet oder ohne Antwort): " + offen.slice(0, 4).join(", ") };
    const stuecke = konsumLies(ordner, /^[\d-]+\.json$/);
    return stuecke.length ? { stuecke } : { fehlt: "kein Prozess der Station trug den Zeugen" };
}
// EIN FENSTER DER WELT (die Sitzung): der Ruf `nimm.<k>` an jeden lebenden Prozess der Welt, jeder antwortet mit `<id>.seg.<k>.json`
// (was er seit der letzten Nahme ausführte); Rückgabe { stuecke } oder { fehlt } — eine Welt, die nicht antwortet, beim Namen
async function konsumNahme(ordner, k) {
    if (!fs.existsSync(ordner)) return { fehlt: "die Welt der Sitzung trägt keinen Zeugen" };
    const lebend = konsumOffen(ordner).filter((id) => lebtPid(parseInt(id, 10)));
    if (!lebend.length) return { fehlt: "kein Prozess der Welt lebt mit Zeugen" };
    fs.writeFileSync(path.join(ordner, "nimm." + k), "");
    const da = (id) => fs.existsSync(path.join(ordner, id + ".seg." + k + ".json"));
    for (const frist = Date.now() + KONSUM_FRIST_MS; !lebend.every(da) && Date.now() < frist; ) await warteMs(10);
    const stumm = lebend.filter((id) => !da(id));
    if (stumm.length) return { fehlt: "die Welt antwortete nicht auf die Nahme " + k + " (Prozess " + stumm.join(", ") + ")" };
    return { stuecke: lebend.map((id) => JSON.parse(fs.readFileSync(path.join(ordner, id + ".seg." + k + ".json"), "utf8"))) };
}
// der Konsum EINES Laufs für seine Einträge: die eigenen Prozesse, in der Sitzung (sitz.konsumWelt) dazu das Fenster der Welt bis
// hierher, ihr Boot als eigener Abdruck (`konsumBoot`, je Sitzung EINMAL gefaltet — die Tafel der Mess-Datei teilt ihn unter allen
// Proben) → { konsum, konsumBoot?, konsumN, konsumSeite } oder { konsumFehlt: Grund }; sitz null: ein gerissener Lauf (kein Fenster)
async function konsumDesLaufs(ordner, baum, sitz) {
    try {
        const eigen = await konsumSchliessen(ordner);
        const welt = sitz && sitz.konsumWelt;
        if (welt && !welt.gefaltet) welt.gefaltet = welt.boot && !welt.boot.fehlt ? konsumFalten(welt.boot.stuecke, baum) : { konsumFehlt: (welt.boot && welt.boot.fehlt) || "die Welt der Sitzung trägt kein Boot-Stück" };
        const teile = [eigen, ...(welt ? [await konsumNahme(welt.ordner, ++welt.nr)] : [])];
        const fehlt = teile.find((x) => x.fehlt);
        if (fehlt) return { konsumFehlt: fehlt.fehlt };
        if (welt && welt.gefaltet.konsumFehlt) return { konsumFehlt: welt.gefaltet.konsumFehlt };
        const k = konsumFalten(teile.flatMap((x) => x.stuecke), baum);
        return welt && k.konsum ? { ...k, konsumBoot: welt.gefaltet.konsum, konsumSeite: k.konsumSeite && welt.gefaltet.konsumSeite } : k;
    } catch (e) {
        return { konsumFehlt: "Konsum: " + e.message };
    } finally {
        fs.rmSync(ordner, { recursive: true, force: true });
    }
}
// DIE FUNKTIONEN eines Skripts aus dem Parser (acorn des Spiels, wie die Wand ANKER), in Quell-Reihenfolge (Eltern vor Kindern): je
// Funktion [von, bis, fuehl] — `fuehl` das Zeichen, an dem die Coverage sie nennt (die Klammer ihres Rumpfs; an einem Pfeil mit
// Ausdruck das letzte Zeichen vor dem Rumpf: es gehört ihr, nie einer Funktion darin). Alles außerhalb jeder Funktion ist der
// KOPF-CODE des Skripts (Tafeln, Konstanten, Zuweisungen, `module.exports`, Klassen-Felder): er läuft beim Laden — V8 nennt ihn nur,
// solange die Skript-Funktion lebt (konsum-zeuge.cjs), der Parser immer. Ein Text, den er nicht liest, wirft (die Datei zählt ganz)
// Dazu `kom`: die Zeilen-Kommentare (//) [von, bis) und `mehr`: was über Zeilen reicht, ohne Code zu sein — Block-Kommentare und
// Schablonen-Texte (ein `//` darin ist Inhalt, kein Kommentar): der Boden von kommentarHunk
function funktionenVon(text, acorn) {
    let ast = null, fehler = null, kom = [], mehr = [];
    for (const sourceType of ["script", "module"]) {
        try {
            [kom, mehr] = [[], []];
            ast = acorn.parse(text, { ecmaVersion: "latest", sourceType, allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true,
                onComment: (block, _t, a, e) => (block ? mehr : kom).push([a, e]) });
            break;
        } catch (e) {
            fehler = e;
        }
    }
    if (!ast) throw fehler;
    const fn = [];
    const geh = (n) => {
        if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(n.type)) {
            let p = n.body.start;
            if (n.body.type !== "BlockStatement") for (p--; p > n.start && /\s/.test(text[p]); ) p--;
            fn.push([n.start, n.end, p]);
        } else if (n.type === "TemplateLiteral" || (n.type === "Literal" && typeof n.value === "string" && n.end - n.start > String(n.value).length + 2)) mehr.push([n.start, n.end]);
        for (const k of astKinder(n)) geh(k);
    };
    geh(ast);
    return { fn: fn.sort((x, y) => x[0] - y[0] || y[1] - x[1]), kom: new Map(kom), mehr };
}
// der Text eines Skripts mit seinen Funktionen, je Inhalt einmal geparst: { h (6 Hex des Texts), fn, start (Zeilen-Anfänge) } oder { fehler }
const skriptCache = new Map();
function skriptVon(text, acorn) {
    // der Schlüssel über den Text mit Unix-Umbrüchen: ein Baum mit CRLF (Windows) und der Blob aus git nennen dasselbe Skript
    const h = crypto.createHash("sha1").update(text.replace(/\r\n/g, "\n")).digest("hex") + (text.includes("\r\n") ? "r" : "");
    if (!skriptCache.has(h)) {
        const start = [0];
        for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) start.push(i + 1);
        try { skriptCache.set(h, { h: h.slice(0, 6), len: text.length, ...funktionenVon(text, acorn), start, text }); } catch (e) { skriptCache.set(h, { h: h.slice(0, 6), fehler: "Parser: " + String(e.message).slice(0, 80) }); }
    }
    return skriptCache.get(h);
}
// DER ABDRUCK EINES SKRIPTS: "<h>:<Bits>" — h nennt den Text am Mess-SHA, je Funktion des Parsers EIN Bit (ausgeführt), base64 ohne
// die leeren Bytes am Ende; der Kopf-Code zählt immer. bereiche: die ausgeführten Zeichen-Bereiche [von, bis) der Coverage
function skriptBits(s, bereiche) {
    const an = new Uint8Array(s.len + 1);
    for (const [a, b] of bereiche) an.fill(1, a, Math.min(s.len, b));
    const bits = Buffer.alloc(Math.ceil(s.fn.length / 8));
    s.fn.forEach(([, , p], i) => { if (an[p]) bits[i >> 3] |= 1 << (i & 7); });
    let n = bits.length;
    while (n && !bits[n - 1]) n--;
    return s.h + ":" + bits.subarray(0, n).toString("base64");
}
// die ausgeführten ZEILEN eines Abdrucks am Text (1-basiert, verschmolzen, [[von, bis]]): der Kopf-Code und der eigene Rumpf jeder
// ausgeführten Funktion (ohne die Funktionen darin, die nie liefen). Eine Zeile zählt, sobald EIN Zeichen von ihr (samt ihrem
// Umbruch) ausgeführt ist: unausgeführt bleibt nur das Innere einer nie gerufenen Funktion. Die Zeile hinter der letzten zählt mit
// (Code, der ans Ende angefügt wird, ist Kopf-Code)
function skriptZeilen(s, bitText) {
    const bits = Buffer.from(bitText, "base64");
    const an = new Uint8Array(s.len).fill(1);
    s.fn.forEach(([a, b], i) => an.fill(i >> 3 < bits.length && bits[i >> 3] & (1 << (i & 7)) ? 1 : 0, a, b));
    const sp = [];
    for (let z = 0; z < s.start.length; z++) {
        const bis = z + 1 < s.start.length ? s.start[z + 1] : s.len;
        let lief = bis === s.start[z]; // die leere letzte Zeile ist Kopf-Code
        for (let i = s.start[z]; i < bis && !lief; i++) lief = an[i] === 1;
        if (!lief) continue;
        if (sp.length && sp[sp.length - 1][1] === z) sp[sp.length - 1][1] = z + 1;
        else sp.push([z + 1, z + 1]);
    }
    if (sp.length && sp[sp.length - 1][1] === s.start.length) sp[sp.length - 1][1]++;
    else sp.push([s.start.length + 1, s.start.length + 1]);
    return sp;
}
// DIE FALTUNG der Roh-Stücke des Zeugen ({ js: { pfad: { len, bereiche } }, skripte, geladen, ganz, warum, browser, seite }) → { konsum:
// base64(deflateRaw(JSON { pfad: "<h>:<Bits>" | "*" })), konsumN: Dateien, konsumSeite: trägt er die Seite (kein Browser ohne Seiten-
// Zeugen), konsumGanz: { Grund: Zahl } der ganz gezählten Dateien }; der Text jeder Datei aus dem Baum der Station (am Mess-SHA)
function konsumFalten(stuecke, baum, acorn = konsumAcorn(baum)) {
    try {
        const k = {}, js = new Map(), warum = {};
        const ganz = (p, grund) => ((k[p] = "*"), (warum[p] = warum[p] || grund));
        let seite = true;
        // ein blinder Prozess (konsum-zeuge.cjs `blind`: ein Kind ohne Zeugen, ein Haken des Zeugen warf): der Lauf führte Code aus, den
        // niemand nennt — kein Konsum, beim Namen
        const blind = stuecke.flatMap((r) => r.blind || []);
        if (blind.length) return { konsumFehlt: blind[0] };
        for (const r of stuecke) {
            if (r.browser && !r.seite) seite = false;
            for (const p of r.ganz) ganz(p, (r.warum && r.warum[p]) || "gelesen");
            for (const p of r.geladen) ganz(p, "Verzeichnis");
            if (r.npm) k[":npm"] = "*"; // kein Pfad: in diesem Lauf lief npm (r6Quelle nurNpmSkripte)
            for (const p of r.skripte || []) if (!js.has(p)) js.set(p, { len: null, bereiche: [] });
            for (const [p, e] of Object.entries(r.js)) {
                const d = js.get(p) || { len: null, bereiche: [] };
                if (d.len != null && d.len !== e.len) ganz(p, "zwei Längen");
                js.set(p, { len: e.len, bereiche: [...d.bereiche, ...e.bereiche] });
            }
        }
        for (const [p, e] of js) {
            if (k[p]) continue;
            // ein Skript, das der Lauf selbst in den Baum legte und wieder nahm (gelaende.K5#1: scripts/.k8-first.cjs), steht an keinem
            // SHA — sein Inhalt kam aus der Linse, die ihn schrieb
            if (!fs.existsSync(path.join(baum, p))) continue;
            const text = fs.readFileSync(path.join(baum, p), "utf8");
            if (e.len != null && text.length !== e.len) { ganz(p, "Länge"); continue; }
            const s = skriptVon(text, acorn);
            if (s.fehler) ganz(p, s.fehler);
            else k[p] = skriptBits(s, e.bereiche);
        }
        const gruende = {};
        for (const g of Object.values(warum)) gruende[g.replace(/ \d.*$/, "")] = (gruende[g.replace(/ \d.*$/, "")] || 0) + 1;
        const sortiert = Object.fromEntries(Object.keys(k).sort().map((p) => [p, k[p]]));
        return { konsum: zlib.deflateRawSync(JSON.stringify(sortiert)).toString("base64"), konsumN: Object.keys(k).length, konsumSeite: seite,
            ...(Object.keys(gruende).length ? { konsumGanz: gruende } : {}) };
    } catch (e) {
        return { konsumFehlt: "Faltung: " + e.message };
    }
}
// der Parser des Spiels: aus dem Baum der Station, sonst aus dem Spiel-Klon (ein Probe-Baum des Selbsttests trägt keine node_modules)
const konsumAcorn = (baum) => {
    try { return acornVon(baum); } catch (_e) { return acornVon(spielRepo()); }
};
// DIE TAFEL DER MESS-DATEI (m.konsumTafel): jeder Abdruck steht EINMAL unter seinem Schlüssel, die Einträge nennen ihn (`konsum`,
// `konsumBoot`) — Zwillinge teilen den Lauf, die Proben einer Sitzung das Boot ihrer Welt. eintragen legt ab, konsumRaeumen nimmt, was
// kein Eintrag mehr nennt, konsumAuf legt die Abdrücke zurück in den Eintrag (vereine: von Tafel zu Tafel)
const KONSUM_FELDER = ["konsum", "konsumBoot"];
const KONSUM_REF = /^k[0-9a-f]{12}$/;
function konsumTafeln(m, e) {
    let neu = e;
    for (const feld of KONSUM_FELDER) {
        const v = e[feld];
        if (typeof v !== "string" || KONSUM_REF.test(v)) continue;
        const h = "k" + crypto.createHash("sha1").update(v).digest("hex").slice(0, 12);
        (m.konsumTafel = m.konsumTafel || {})[h] = v;
        neu = { ...neu, [feld]: h };
    }
    return neu;
}
const konsumAuf = (m, e) => Object.assign({ ...e }, ...KONSUM_FELDER.filter((f) => typeof e[f] === "string" && KONSUM_REF.test(e[f]) && m.konsumTafel && m.konsumTafel[e[f]]).map((f) => ({ [f]: m.konsumTafel[e[f]] })));
function konsumRaeumen(m) {
    if (!m.konsumTafel) return m;
    const genannt = new Set([...Object.values(m.je || {}), ...Object.values(m.ungemessen || {})].flatMap((e) => KONSUM_FELDER.map((f) => e[f])));
    for (const h of Object.keys(m.konsumTafel)) if (!genannt.has(h)) delete m.konsumTafel[h];
    if (!Object.keys(m.konsumTafel).length) delete m.konsumTafel;
    return m;
}
// DER KONSUM EINES EINTRAGS e der Messung m, entfaltet: { k: { pfad: "<h>:<Bits>" | "*" }, dirs } — der Abdruck des Laufs, vereint mit
// dem Boot seiner Sitzung (je Skript die Bits beider; zwei Texte desselben Skripts zählen ganz); null, wenn die Tafel ihn nicht trägt
const konsumCache = new Map();
function konsumVon(e, m) {
    const roh = KONSUM_FELDER.filter((f) => e[f] != null).map((f) => (typeof e[f] === "string" && KONSUM_REF.test(e[f]) ? m && m.konsumTafel && m.konsumTafel[e[f]] : e[f]));
    if (!roh.length || roh.some((x) => x == null)) return null;
    const schluessel = roh.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("|");
    if (!konsumCache.has(schluessel)) {
        const k = {};
        for (const x of roh)
            for (const [p, s] of Object.entries(typeof x === "string" ? JSON.parse(zlib.inflateRawSync(Buffer.from(x, "base64")).toString("utf8")) : x)) {
                if (!(p in k)) k[p] = s;
                else if (k[p] !== s && k[p] !== "*") {
                    const [ha, ba] = k[p].split(":"), [hb, bb] = s === "*" ? ["*", ""] : s.split(":");
                    if (ha !== hb) k[p] = "*";
                    else {
                        const [x1, x2] = [Buffer.from(ba, "base64"), Buffer.from(bb, "base64")];
                        const o = Buffer.alloc(Math.max(x1.length, x2.length));
                        for (let i = 0; i < o.length; i++) o[i] = (x1[i] || 0) | (x2[i] || 0);
                        k[p] = ha + ":" + o.toString("base64");
                    }
                }
            }
        konsumCache.set(schluessel, { k, dirs: Object.keys(k).filter((p) => p.endsWith("/") || p.endsWith("/**")) });
    }
    return konsumCache.get(schluessel);
}
// die Dateien, die der Befehl oder die Umgebung einer Station beim Namen nennt (scripts/…): was davon der Konsum nicht als Skript
// trägt (ein Shell-Skript, eine Tafel an ein fremdes Programm), zählt ganz
const imBefehlGenannt = (st) => new Set([...(befehlVon(st).join(" ") + " " + Object.values(st.env || {}).join(" ")).matchAll(LINSE_IM_BEFEHL)].map((m) => m[1]));
// DAS URTEIL: K = konsumVon(…) · d = { dateien, zeilen?, neu? } (ohne zeilen zählt jede konsumierte Datei ganz) · st die Station
// (ihr Befehl, ihr Glob) · seite: der Konsum trägt die Seite · skript(f) → skriptVon des Texts von f am Mess-SHA (null: nicht lesbar —
// die Datei zählt ganz) → die Täter (die Dateien des Diffs, die der Lauf ausführte oder las)
function konsumTreffer(K, d, st, seite, skript) {
    const genannt = imBefehlGenannt(st);
    return d.dateien.filter((f) => {
        const imDir = (p) => (p.endsWith("/**") ? p === "./**" || f.startsWith(p.slice(0, -2)) : (f.includes("/") ? f.slice(0, f.lastIndexOf("/") + 1) : "./") === p);
        if (d.neu && d.neu.has(f) && K.dirs.some(imDir)) return true;
        if (f === NPM_VERZEICHNIS && d.nurNpmSkripte && !K.k[":npm"]) return false;
        const s = K.k[f];
        if (s) {
            if (s === "*" || !d.zeilen || !d.zeilen.has(f)) return true;
            const q = skript ? skript(f) : null;
            const [h, bits] = s.split(":");
            if (!q || q.fehler || q.h !== h) return true;
            const sp = (q.zeilen = q.zeilen || new Map()).get(bits) || q.zeilen.set(bits, skriptZeilen(q, bits)).get(bits);
            if (d.zeilen.get(f).some((hunk) => sp.some(([x, y]) => hunk[0] <= y && x <= hunk[1]) && !kommentarHunk(q, hunk))) return true;
        } else if (genannt.has(f)) return true;
        return !seite && !WERKZEUG_PFAD.test(f) && trifftPfad(f, st.pfad);
    });
}
// EIN KOMMENTAR FÜHRT NICHTS AUS (10.11.: der Kommentar über einer Funktion ändert sich hier mit ihr — er steht im Kopf-Code und machte
// jeden Lader des Skripts alt, auch den, der die Funktion nie rief): ein Hunk, der nur Zeilen-Kommentare (//) und Leerzeilen bringt
// (stempelDiff `nurKommentar`) und am Text des Mess-SHA nur solche ersetzt — oder zwischen zwei Zeilen einfügt —, ändert keinen Lauf.
// Der Parser nennt die Kommentare (s.kom: Anfang → Ende); in einem Block-Kommentar oder Schablonen-Text (s.mehr) ist `//` Inhalt:
// dort gilt die Regel nie. s = skriptVon am Mess-SHA, hunk = [von, bis] mit nurKommentar und ein
function kommentarHunk(s, hunk) {
    if (!hunk.nurKommentar || !s.kom) return false;
    const inMehr = (p) => s.mehr.some(([a, e]) => a < p && p < e);
    const zeile = (z) => [s.start[z - 1], z < s.start.length ? s.start[z] : s.len];
    // die Einfügung zwischen Zeile a und a + 1: ihre Stelle (der Anfang von a + 1) liegt in keinem Block-Kommentar, keiner Schablone
    if (hunk.ein) return hunk[1] > s.start.length ? !inMehr(s.len) : !inMehr(zeile(hunk[1])[0]);
    for (let z = hunk[0]; z <= hunk[1]; z++) {
        if (z > s.start.length) return false;
        const [a, e] = zeile(z);
        let i = a;
        while (i < e && /\s/.test(s.text[i])) i++;
        if (inMehr(i < e ? i : a) || (i < e && !s.kom.has(i))) return false;
    }
    return true;
}

// DIE LINSE EINER STATION (R6 über das Werkzeug, 28.10.): jede Datei unter scripts/, die ihr Befehl oder ihre Umgebung nennt
// ("scripts/…", "./scripts/…", "{BAUM}/scripts/…"), jede Werkzeug-Datei, die ihr pfad trifft, und jede lokale Datei, die diese
// per require("./…") laden — der Aufruf-Gang `rufe` der Stamm-Bibliothek (scripts/lib/stamm.cjs, acorn), kein zweiter Parser.
// dateien: die Dateien am Stand · lies(f) → Text am Stand oder null · rufe: stammAm(…).rufe. Ein unlesbarer Text wirft (beim Namen)
const LINSE_IM_BEFEHL = /(?<![\w$./-])(?:\{BAUM\}\/|\.\/)?(scripts\/[\w./-]*\w)/g;
function linsenVon(st, dateien, lies, rufe) {
    const da = dateien instanceof Set ? dateien : new Set(dateien);
    const text = befehlVon(st).join(" ") + " " + Object.values(st.env || {}).join(" ");
    const offen = [...text.matchAll(LINSE_IM_BEFEHL)].map((m) => m[1]).filter((f) => da.has(f));
    const pfad = st.pfad.map(globRegex);
    for (const f of da) if (WERKZEUG_PFAD.test(f) && pfad.some((re) => re.test(f))) offen.push(f);
    const linse = new Set();
    while (offen.length) {
        const f = offen.shift();
        if (linse.has(f)) continue;
        linse.add(f);
        if (!/\.[cm]?js$/.test(f)) continue;
        const t = lies(f);
        if (t == null) continue;
        let rs;
        try { rs = rufe(t); } catch (e) { throw new Error("Linse " + f + " unlesbar: " + e.message); }
        for (const r of rs) {
            const a = r.ziel === "require" && r.args[0];
            if (!a || a.type !== "Literal" || typeof a.value !== "string" || !/^\.\.?\//.test(a.value)) continue;
            const ziel = path.posix.normalize(path.posix.join(path.posix.dirname(f), a.value));
            const x = [ziel, ziel + ".cjs", ziel + ".js", ziel + ".json", ziel + "/index.js"].find((k) => da.has(k));
            if (x) offen.push(x);
        }
    }
    return [...linse].sort();
}
// DIE STAMM-BIBLIOTHEK des Spiels am Stand rev — aus git, nie aus dem Arbeitsbaum des Klons (er steht auf beliebigem Zweig);
// ihr acorn löst sie aus node_modules des Klons
function stammAm(repo, rev) {
    const Module = require("module");
    const f = path.join(repo, "scripts", "lib", "stamm.cjs");
    const m = new Module(f, module);
    m.filename = f;
    m.paths = Module._nodeModulePaths(path.dirname(f));
    m._compile(git(["show", rev + ":scripts/lib/stamm.cjs"], repo), f);
    return m.exports;
}

// ───────────────────────────────── DIE R6-QUELLE ─────────────────────────────────
// R6 KOSTET, WAS SICH ÄNDERT — nie, was je gemessen wurde (Gebot 7; 12.11.: 413 Mess-Dateien an 263 Köpfen, je Kopf zwei `git diff`
// und ein `ls-tree`, je Linsen-Blob ein `cat-file`, je Skript ein `git show` — am Messplatz 1,5–2,7 s je git-Prozess (4391 Packs):
// 900 Prozesse in 20 min bei 77 von 263 Köpfen; die Buchung lief seit 01:57 dreißigmal in die 900 s ihrer Schleife und starb wortlos,
// `run --offen` schwieg vor seiner ersten Station ebenso lang). Die Quelle fragt git in EINEM Prozess je Art, nie je Kopf:
//   (1) `cat-file --batch-check`: der Baum jedes Mess-Kopfs · (2) `ls-tree -r` am Kopf · (3) `diff-tree --stdin --raw`: je Mess-Kopf
//   die geänderten Dateien mit beiden Blobs (Baum-Ebene, kein Inhalt) — daraus auch der Baum jedes Mess-Kopfs (der Kopf, rückwärts)
//   (4) das Urteil je DATEI-PAAR (alter Blob → neuer Blob: stempelDiff über seinen Abschnitt des -U0-Diffs) ist eine Funktion zweier
//   unveränderlicher Blobs — DER SPEICHER (r6Speicher, im .git des Spiel-Klons) hält es; nur ein neues Paar fragt git (`diff-tree
//   --stdin -p` über die wenigsten Bäume, die es tragen, auf seine Pfade begrenzt): nach einer Landung die Dateien der Landung
//   (5) die Linse einer Station liest je Blob nur seine require-Ziele — ebenfalls im Speicher; fehlende Blobs in Runden über ALLE
//   Stationen und Köpfe zugleich (`cat-file --batch`, je Runde eine Tiefe der require-Kette), die Skripte des Konsums in einem Zug
// KEIN ANDERES URTEIL: je Datei dieselbe Funktion (stempelDiff) über denselben Text, den `git diff` schriebe (diff-tree mit --textconv
// und --ext-diff wie das Porzellan; die Anzeige-Schalter diff.* liest die Klempnerei nie — an jedem Gerät derselbe Diff), die Linse je
// Station und Kopf unter demselben Schlüssel wie bisher. Die Linse KOSTEN im Selbsttest hält die Zahl der Prozesse (gitRufe).
const R6_DIFF = ["--no-renames", "-U0", "--no-color", "--textconv", "--ext-diff"];
const R6_BUDGET = 4000; // Datei-Abschnitte je Prozess (Bäume × Pfade): die Antwort bleibt weit unter GIT_SAMMEL_MAX
const R6_PFAD_MAX = 20000; // Zeichen der Pfad-Liste eines Prozesses (Windows fasst 32 767 je Befehlszeile)
const R6_SPEICHER_MAX = 400000; // Datei-Paare im Speicher; darüber fällt, was dieser Lauf nicht las
const R6_RUFE_MAX = 4; // Stände der Stamm-Bibliothek, deren require-Ziele der Speicher hält
const R6_KALT_WORT = 2000; // ab so vielen Paaren ohne Urteil nennt sich der kalte Speicher auf stderr
const sha1Hex = (s) => crypto.createHash("sha1").update(s).digest("hex");
// die rohe Zeile von diff-tree: Modus alt, Modus neu, Blob alt, Blob neu, Art, Pfad
const ROH_ZEILE = /^:(\d+) (\d+) ([0-9a-f]+) ([0-9a-f]+) [A-Z]\d*\t(.+)$/;
// DER SPEICHER: { v, zeilen: { rohe Zeile → [zählt, angelegt, Hunks | 0] }, rufe: { Stamm-Blob|acorn → { t, je: { Blob → [Ziel] |
// { fehler } } } } } — jede Zeile die Funktion unveränderlicher Blobs; `v` bindet ihn an git, die Diff-Schalter und den Text von
// stempelDiff samt Stempel-Tafel (ein anderer Stand rechnet alles neu). Unlesbar oder nicht schreibbar: beim Namen auf stderr, das
// Urteil rechnet dann aus git — nie aus einem halben Speicher. Je Prozess und Ordner EINE Instanz.
const r6SpeicherJe = new Map();
function r6Speicher(repo, ordner) {
    const istOrdner = (p) => { try { return fs.statSync(p).isDirectory(); } catch (_e) { return false; } };
    const dir = path.resolve(ordner || (istOrdner(path.join(repo, ".git")) ? path.join(repo, ".git", "punkte-r6") : path.join(os.tmpdir(), "punkte-r6-" + sha1Hex(path.resolve(repo)).slice(0, 12))));
    if (r6SpeicherJe.has(dir)) return r6SpeicherJe.get(dir);
    const datei = path.join(dir, "speicher.json");
    const v = sha1Hex(["Form 1", git(["version"], repo), R6_DIFF.join(" "), String(stempelDiff), String(VERSIONS_STEMPEL)].join("\n"));
    let alt = null;
    if (fs.existsSync(datei)) {
        try { alt = JSON.parse(fs.readFileSync(datei, "utf8")); } catch (e) { console.error("R6-SPEICHER unlesbar (" + datei + ": " + e.message + ") — jedes Datei-Paar fragt git neu"); }
        if (alt && alt.v !== v) alt = null;
    }
    const zeilen = new Map(Object.entries((alt && alt.zeilen) || {})), rufe = (alt && alt.rufe) || {}, benutzt = new Set(), heiss = new Set();
    let schmutz = false;
    const s = {
        datei,
        zeile: (z) => { const f = zeilen.get(z); if (f) benutzt.add(z); return f; },        setze: (z, f) => { zeilen.set(z, f); benutzt.add(z); schmutz = true; },
        rufeVon: (stand) => {
            const e = rufe[stand] || (rufe[stand] = { t: 0, je: {} });
            heiss.add(stand);
            return { groesse: () => Object.keys(e.je).length, lies: (id) => e.je[id], setze: (id, r) => { e.je[id] = r; schmutz = true; } };
        },
        schreibe: () => {
            if (!schmutz) return;
            if (zeilen.size > R6_SPEICHER_MAX) for (const z of [...zeilen.keys()]) if (!benutzt.has(z)) zeilen.delete(z);
            for (const k of heiss) rufe[k].t = Date.now();
            for (const k of Object.keys(rufe).sort((a, b) => rufe[b].t - rufe[a].t).slice(R6_RUFE_MAX)) delete rufe[k];
            try {
                fs.mkdirSync(dir, { recursive: true });
                const tmp = datei + "." + process.pid + ".tmp";
                fs.writeFileSync(tmp, JSON.stringify({ v, zeilen: Object.fromEntries(zeilen), rufe }));
                fs.renameSync(tmp, datei);
                schmutz = false;
            } catch (e) {
                console.error("R6-SPEICHER nicht geschrieben (" + datei + ": " + e.message + ") — der nächste Lauf fragt git nach diesen Paaren erneut");
            }
        },
    };
    r6SpeicherJe.set(dir, s);
    return s;
}
// repo: der Spiel-Klon · kopf: der Stand, an dem geurteilt wird · messungen: die Mess-Dateien (ihre `sha` sind die Mess-Köpfe; ein
// Eintrag { sha } ohne `je` meldet einen weiteren Stand an) · stationen: die Stationen, deren Linsen gefragt werden (der Vorlauf der
// Blobs; eine Station außerhalb der Liste fragt git einzeln) · opt.speicher: der Ordner des Speichers · opt.acorn: der Parser
// → { geaendert(messSha) → { dateien, zeilen, neu, nurNpmSkripte } wie stempelDiff bis zum Kopf (wirft bei unbekanntem Stand) ·
//     linsenAm() → (st, messSha) → die Linse der Station am Mess-SHA UND am Kopf (ein require, das dazukam oder fiel, zählt) ·
//     skript: (messSha) → (pfad) → skriptVon des Texts am Mess-SHA (je Blob einmal geparst; null: nicht lesbar) ·
//     dateien() → die Dateien am Kopf (Wand PFAD) · baum(sha) → { id, b: Pfad → Blob, dateien } }
function r6Quelle(repo, kopf, messungen, stationen = [], opt = {}) {
    const acorn = opt.acorn || acornVon(repo);
    const speicher = () => r6Speicher(repo, opt.speicher);
    // ── die Blobs: EIN Prozess für alle, die eine Runde verlangt
    const texte = new Map();
    const hole = (ids) => {
        const liste = [...new Set(ids)].filter((id) => !texte.has(id));
        for (let i = 0; i < liste.length; i += 2000) {
            const teil = liste.slice(i, i + 2000), aus = gitMit(["cat-file", "--batch"], repo, teil.join("\n") + "\n");
            let p = 0;
            for (const id of teil) {
                const nl = aus.indexOf(10, p);
                if (nl < 0) throw new Error("git cat-file --batch: die Antwort endet vor dem Blob " + id);
                const m = /^[0-9a-f]+ \w+ (\d+)$/.exec(aus.toString("latin1", p, nl));
                texte.set(id, m ? aus.subarray(nl + 1, nl + 1 + Number(m[1])) : null);
                p = m ? nl + 2 + Number(m[1]) : nl + 1;
            }
        }
    };
    const text = (id) => {
        if (!id) throw new Error("git cat-file: kein Blob an diesem Pfad");
        if (!texte.has(id)) hole([id]);
        const b = texte.get(id);
        if (b == null) throw new Error("git cat-file: der Blob " + id + " fehlt im Spiel-Klon");
        return b.toString("utf8");
    };
    // ── die Lage: die Bäume, der Kopf, je Baum seine Datei-Paare mit Urteil
    let L = null;
    const lage = () => {
        if (L) return L;
        const shas = [...new Set(messungen.map((m) => m.sha))].filter((s) => typeof s === "string" && s && !/\s/.test(s));
        const antwort = gitMit(["cat-file", "--batch-check"], repo, [...shas, kopf].map((s) => s + "^{tree}").join("\n") + "\n").toString("utf8").split(/\r?\n/).filter(Boolean);
        if (antwort.length !== shas.length + 1) throw new Error("git cat-file --batch-check: " + antwort.length + " Antworten auf " + (shas.length + 1) + " Stände");
        const baumId = (z) => (/^([0-9a-f]+) tree \d+$/.exec(z) || [])[1] || null;
        const kopfBaum = baumId(antwort[shas.length]);
        if (!kopfBaum) throw new Error("der Kopf " + kopf + " trägt keinen Baum im Spiel-Klon (" + antwort[shas.length] + ")");
        const baumVon = new Map(shas.map((s, i) => [s, baumId(antwort[i])]));
        baumVon.set(kopf, kopfBaum);
        const kopfBlobs = new Map(), namen = [];
        for (const z of git(["ls-tree", "-r", kopfBaum], repo).split(/\r?\n/)) {
            const m = /^\d+ (\w+) ([0-9a-f]+)\t(.+)$/.exec(z);
            if (!m) continue;
            namen.push(m[3]);
            if (m[1] === "blob") kopfBlobs.set(m[3], m[2]);
        }
        const baeume = [...new Set(baumVon.values())].filter((t) => t && t !== kopfBaum);
        const eintraege = new Map(), jeBaum = new Map(baeume.map((t) => [t, []]));
        const eintrag = (z) => {
            let e = eintraege.get(z);
            if (!e) {
                const m = ROH_ZEILE.exec(z);
                if (!m) throw new Error("git diff-tree: unlesbare rohe Zeile „" + z.slice(0, 160) + "“");
                e = { z, om: m[1], oid: m[3], pfad: m[5], f: speicher().zeile(z) || null, h: null };
                eintraege.set(z, e);
            }
            return e;
        };
        // die Antwort von diff-tree --stdin: je Baum-Paar seine Kopfzeile, die rohen Zeilen, mit -p eine Leerzeile und je Datei ihr
        // Abschnitt (ein Typ-Wechsel schreibt zwei) → jePaar(baum, Einträge in roher Reihe, Eintrag → Zeilen seines Abschnitts)
        const kopfzeile = (p) => (p[0] === '"' ? 'diff --git "a/' + p.slice(1) + ' "b/' + p.slice(1) : "diff --git a/" + p + " b/" + p);
        const liesDiff = (aus, jePaar) => {
            let baum = null, es = [], teile = new Map(), i = -1;
            const zu = () => { if (baum) jePaar(baum, es, teile); };
            for (const z of aus.split("\n")) {
                const k = z.length >= 81 && z[0] !== ":" && z[0] !== "+" && z[0] !== "-" ? /^([0-9a-f]{40,64}) ([0-9a-f]{40,64})$/.exec(z) : null;
                if (k) {
                    zu();
                    if (k[2] !== kopfBaum || !jeBaum.has(k[1])) throw new Error("git diff-tree: ein Baum-Paar, das niemand fragte (" + z + ")");
                    [baum, es, teile, i] = [k[1], [], new Map(), -1];
                } else if (!baum) {
                    if (z) throw new Error("git diff-tree: eine Zeile vor dem ersten Baum-Paar („" + z.slice(0, 120) + "“)");
                } else if (z[0] === ":" && i < 0 && !teile.size) es.push(eintrag(z));
                else if (z.startsWith("diff --git ")) {
                    // der Abschnitt der nächsten rohen Zeile; derselbe noch einmal (Typ-Wechsel); oder eine spätere — eine Datei, deren
                    // Text nach textconv gleich blieb, schreibt keinen Abschnitt (sie zählt dann wie im ganzen Diff: genannt, ohne Text)
                    if (i + 1 < es.length && z === kopfzeile(es[i + 1].pfad)) i++;
                    else if (i < 0 || z !== kopfzeile(es[i].pfad)) {
                        let j = i + 2;
                        while (j < es.length && z !== kopfzeile(es[j].pfad)) j++;
                        if (j >= es.length) throw new Error("git diff-tree: ein Abschnitt ohne rohe Zeile („" + z.slice(0, 160) + "“)");
                        i = j;
                    }
                    (teile.get(es[i]) || teile.set(es[i], []).get(es[i])).push(z);
                } else if (i >= 0) teile.get(es[i]).push(z);
                else if (z) throw new Error("git diff-tree: eine Zeile vor dem ersten Abschnitt („" + z.slice(0, 120) + "“)");
            }
            zu();
        };
        if (baeume.length)
            liesDiff(gitMit(["diff-tree", "--stdin", "-r", "--raw", "--no-abbrev", "--no-renames"], repo, baeume.map((t) => t + " " + kopfBaum).join("\n") + "\n").toString("utf8"),
                (t, es) => jeBaum.set(t, es));
        // die Paare ohne Urteil. Je Prozess EINE KLASSE von Pfaden — die mit den wenigsten offenen Paaren, höchstens doppelt so viele wie
        // der kleinste — und die wenigsten Bäume, die ihre Paare tragen (gierig: der Baum mit den meisten zuerst): eine große Datei mit
        // drei Fassungen vergleicht git dreimal, nie je Mess-Kopf (f46b9e81, 32 Dateien in der Landung: jeder Baum über alle Pfade
        // 88,5 s in 2 Prozessen, je Klasse 60–70 s in 6). Jedes Paar fragt git selbst: ein Urteil wird nie aus einem anderen gefolgert
        const urteil = (e, abschnitt) => {
            const r = stempelDiff(e.pfad, abschnitt);
            return [r.dateien.length ? 1 : 0, r.neu.has(e.pfad) ? 1 : 0, r.zeilen.has(e.pfad) ? r.zeilen.get(e.pfad).map((h) => [h[0], h[1], h.nurKommentar ? 1 : 0, h.ein ? 1 : 0]) : 0];
        };
        const offen = new Set(), traeger = new Map();
        for (const t of baeume) for (const e of jeBaum.get(t)) if (!e.f) { offen.add(e); (traeger.get(e) || traeger.set(e, []).get(e)).push(t); }
        if (offen.size > R6_KALT_WORT) console.error("R6-QUELLE: " + offen.size + " Datei-Paare an " + new Set([...traeger.values()].flat()).size + " Mess-Köpfen ohne Urteil im Speicher (" + speicher().datei + ") — git rechnet sie jetzt einmal, danach nur noch die Paare einer Landung");
        const rechne = (ziele) => {
            for (;;) {
                const rest = [...ziele].filter((e) => !e.f);
                if (!rest.length) return;
                const gruppe = [], gedeckt = new Set();
                let pfade = [];
                const fremd = rest.find((e) => e.pfad[0] === '"');
                if (fremd) {
                    // ein Pfad, den git in Anführung schreibt, fährt ohne Pfad-Grenze: der ganze Diff EINES Baums, der ihn trägt
                    gruppe.push(traeger.get(fremd)[0]);
                    for (const e of jeBaum.get(gruppe[0])) if (!e.f && ziele.has(e)) gedeckt.add(e);
                } else {
                    const jePfad = new Map();
                    for (const e of rest) jePfad.set(e.pfad, (jePfad.get(e.pfad) || 0) + 1);
                    const reihe = [...jePfad].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
                    const klasse = new Set([reihe[0][0]]);
                    let lang = reihe[0][0].length + 3;
                    for (const [p, n] of reihe.slice(1)) {
                        if (n > 2 * reihe[0][1] || (lang += p.length + 3) > R6_PFAD_MAX) break;
                        klasse.add(p);
                    }
                    const ziel = new Set(rest.filter((e) => klasse.has(e.pfad))), zahl = new Map();
                    for (const e of ziel) for (const t of traeger.get(e)) zahl.set(t, (zahl.get(t) || 0) + 1);
                    while (ziel.size && (!gruppe.length || (gruppe.length + 1) * klasse.size <= R6_BUDGET)) {
                        let bester = null, meiste = 0;
                        for (const [t, n] of zahl) if (n > meiste) { bester = t; meiste = n; }
                        if (!bester) throw new Error("R6-Quelle: " + ziel.size + " Datei-Paare ohne Baum, der sie trägt");
                        gruppe.push(bester);
                        for (const e of jeBaum.get(bester)) if (ziel.delete(e)) { gedeckt.add(e); for (const t of traeger.get(e)) zahl.set(t, zahl.get(t) - 1); }
                    }
                    pfade = [...klasse];
                }
                const aus = gitMit(["--literal-pathspecs", "diff-tree", "--stdin", "-r", "--raw", "--no-abbrev", "-p", ...R6_DIFF, ...(pfade.length ? ["--", ...pfade] : [])], repo,
                    gruppe.map((t) => t + " " + kopfBaum).join("\n") + "\n").toString("utf8");
                liesDiff(aus, (_t, es, teile) => {
                    for (const e of es) if (!e.f) speicher().setze(e.z, (e.f = urteil(e, (teile.get(e) || []).join("\n"))));
                });
                const stumm = [...gedeckt].filter((e) => !e.f);
                if (stumm.length) throw new Error("git diff-tree: " + stumm.length + " Datei-Paare ohne Antwort, das erste „" + stumm[0].z.slice(0, 160) + "“");
            }
        };
        rechne(offen);
        if (eintraege.size) speicher().schreibe();
        return (L = { baumVon, kopfBaum, kopfBlobs, namen, jeBaum });
    };
    // ── der Baum eines Stands: der Kopf, rückwärts um die Paare seines Diffs (ein Gitlink ist keine Datei)
    const baumJe = new Map();
    const baum = (sha) => {
        const { baumVon, kopfBaum, kopfBlobs, jeBaum } = lage();
        const t = typeof sha === "string" ? baumVon.get(sha) : null;
        if (!t) throw new Error("der Stand " + sha + " ist im Spiel-Klon unbekannt");
        if (!baumJe.has(t)) {
            let b = kopfBlobs;
            if (t !== kopfBaum) {
                const roh = new Map(kopfBlobs);
                for (const e of jeBaum.get(t)) {
                    if (e.om === "000000" || e.om === "160000") roh.delete(e.pfad);
                    else roh.set(e.pfad, e.oid);
                }
                b = new Map([...roh.keys()].sort().map((p) => [p, roh.get(p)]));
            }
            baumJe.set(t, { id: t, b, dateien: new Set(b.keys()) });
        }
        return baumJe.get(t);
    };
    // ── der Diff eines Mess-Kopfs bis zum Kopf, aus den Urteilen seiner Paare
    const diffJe = new Map();
    const hunks = (e) => e.h || (e.h = e.f[2].map((x) => Object.assign([x[0], x[1]], { nurKommentar: !!x[2], ein: !!x[3] })));
    let npmDa = false;
    const npmText = (sha) => {
        if (!npmDa) {
            // erst gelesen, wenn ein Konsum danach fragt: jede Fassung des Befehls-Verzeichnisses in EINEM Prozess
            npmDa = true;
            const { kopfBlobs, jeBaum } = lage();
            const ids = new Set([kopfBlobs.get(NPM_VERZEICHNIS)]);
            for (const es of jeBaum.values()) for (const e of es) if (e.pfad === NPM_VERZEICHNIS && e.om !== "000000" && e.om !== "160000") ids.add(e.oid);
            hole([...ids].filter(Boolean));
        }
        return text(baum(sha).b.get(NPM_VERZEICHNIS));
    };
    const geaendert = (sha) => {
        if (diffJe.has(sha)) return diffJe.get(sha);
        const { baumVon, kopfBaum, jeBaum } = lage();
        const t = typeof sha === "string" ? baumVon.get(sha) : null;
        if (!t) throw new Error("der Mess-SHA " + sha + " ist im Spiel-Klon unbekannt");
        const es = (t === kopfBaum ? [] : jeBaum.get(t)).filter((e) => e.f[0]);
        const d = { dateien: es.map((e) => e.pfad), zeilen: new Map(es.filter((e) => e.f[2]).map((e) => [e.pfad, hunks(e)])), neu: new Set(es.filter((e) => e.f[1]).map((e) => e.pfad)) };
        let nur = null;
        Object.defineProperty(d, "nurNpmSkripte", { enumerable: true, get() {
            if (nur != null) return nur;
            if (!d.dateien.includes(NPM_VERZEICHNIS) || d.neu.has(NPM_VERZEICHNIS)) return (nur = false);
            try {
                const [a, b] = [sha, kopf].map((s) => { const j = JSON.parse(npmText(s)); delete j.scripts; delete j.version; return JSON.stringify(j); });
                return (nur = a === b);
            } catch (_e) {
                return (nur = false);
            }
        } });
        diffJe.set(sha, d);
        return d;
    };
    // ── die Linsen: je Blob seine require-Ziele (Speicher), fehlende Blobs in Runden über alle Stationen und Köpfe
    let linsen = null;
    const linsenAm = () => {
        if (linsen) return linsen;
        const { kopfBlobs, baumVon } = lage();
        const stammId = kopfBlobs.get("scripts/lib/stamm.cjs");
        if (!stammId) throw new Error("der Kopf " + kopf + " trägt scripts/lib/stamm.cjs nicht — keine Linse ist lesbar");
        let acornStand = "ohne";
        try { acornStand = require(require.resolve("acorn/package.json", { paths: [repo] })).version; } catch (_e) { /* eine Stamm-Bibliothek ohne acorn */ }
        const R = speicher().rufeVon(stammId + "|" + acornStand);
        // ein Speicher mit Zielen dieses Stamm-Blobs beweist: er lädt und liest; sonst lädt er JETZT (ein kranker Kopf fällt vor dem Urteil)
        let rufe = R.groesse() ? null : stammAm(repo, kopf).rufe;
        let sammeln = null, verfehlt = false;
        const ziele = new Map();
        const rufeVon = (id) => {
            if (ziele.has(id)) return ziele.get(id);
            let r = R.lies(id);
            if (r === undefined) {
                if (sammeln && !texte.has(id)) { sammeln.add(id); verfehlt = true; return []; }
                const t = text(id).trim();
                rufe = rufe || stammAm(repo, kopf).rufe;
                try {
                    r = rufe(t).filter((x) => x.ziel === "require").map((x) => x.args[0]).filter((a) => a && a.type === "Literal" && typeof a.value === "string" && /^\.\.?\//.test(a.value)).map((a) => a.value);
                } catch (e) {
                    r = { fehler: e.message };
                }
                R.setze(id, r);
            }
            if (!Array.isArray(r)) throw new Error(r.fehler);
            const z = r.map((v) => ({ ziel: "require", args: [{ type: "Literal", value: v }] }));
            ziele.set(id, z);
            return z;
        };
        // die Linse EINER Station an EINEM Baum (rein: Station × Baum); linsenVon liest statt des Texts den Blob-Namen
        const reinJe = new Map();
        const rein = (st, sha) => {
            const { id, b, dateien } = baum(sha);
            const je = reinJe.get(st) || reinJe.set(st, new Map()).get(st);
            if (je.has(id)) return je.get(id);
            verfehlt = false;
            const l = linsenVon(st, dateien, (f) => b.get(f) || null, rufeVon);
            if (!verfehlt) je.set(id, l);
            return l;
        };
        // DER VORLAUF: jede Station an jedem Kopf, an dem eine Messung ohne Konsum-Menge von ihr steht, und am Kopf — je Runde EIN Prozess
        const vorlauf = () => {
            const jeId = new Map();
            for (const st of stationen) jeId.set(schluessel(st), [...(jeId.get(schluessel(st)) || []), st]);
            const paare = new Map();
            for (const m of messungen) {
                if (typeof m.sha !== "string" || !baumVon.get(m.sha)) continue;
                for (const [id, e] of Object.entries(m.je || {})) {
                    if (e.konsum && konsumVon(e, m)) continue;
                    for (const st of jeId.get(id) || []) if (geraeteVon(st).includes(m.geraet)) for (const s of [m.sha, kopf]) {
                        const k = stationen.indexOf(st) + "|" + baumVon.get(s);
                        if (!paare.has(k)) paare.set(k, [st, s]);
                    }
                }
            }
            let rest = [...paare.values()];
            try {
                for (let runde = 0; rest.length; runde++) {
                    if (runde > 64) throw new Error("R6-Quelle: die require-Kette der Linsen endet nach 64 Runden nicht");
                    sammeln = new Set();
                    rest = rest.filter(([st, s]) => {
                        verfehlt = false;
                        try { rein(st, s); } catch (_e) { /* eine unlesbare Linse nennt der Gang des Urteils beim Namen */ }
                        return verfehlt;
                    });
                    const ids = [...sammeln];
                    sammeln = null;
                    if (!ids.length) break;
                    hole(ids);
                }
            } finally {
                sammeln = null;
            }
            speicher().schreibe();
        };
        // JE STATION, nie je Schlüssel (12.11.: unter „<kriterium>#<staffel>“ stehen die headless- und die Karten-Hälfte einer Staffel mit
        // je eigenem Befehl — der Schlüssel allein gab der zweiten Hälfte die Linse der zuerst gefragten, Selbsttest (5q) LINSEN-SCHLÜSSEL)
        const je = new Map();
        let vorgelaufen = false;
        return (linsen = (st, sha) => {
            if (!vorgelaufen) { vorgelaufen = true; vorlauf(); }
            const m = je.get(st) || je.set(st, new Map()).get(st);
            if (!m.has(sha)) m.set(sha, [...new Set([...rein(st, sha), ...rein(st, kopf)])]);
            return m.get(sha);
        });
    };
    // ── die Skripte des Konsums: je Blob einmal gelesen und geparst; der Vorlauf holt, was ein Konsum an einem geänderten Skript fragt
    const skriptJe = new Map();
    let skriptDa = false;
    const skriptVorlauf = () => {
        const ids = new Set();
        for (const m of messungen) {
            let d;
            try { d = geaendert(m.sha); } catch (_e) { continue; }
            if (!d.zeilen.size) continue;
            const gesehen = new Set();
            for (const e of Object.values(m.je || {})) {
                const K = e.konsum ? konsumVon(e, m) : null;
                if (!K || gesehen.has(K)) continue;
                gesehen.add(K);
                for (const f of d.zeilen.keys()) if (K.k[f] && K.k[f] !== "*") ids.add(baum(m.sha).b.get(f));
            }
        }
        hole([...ids].filter(Boolean));
    };
    const skript = (sha) => (f) => {
        if (!skriptDa) { skriptDa = true; skriptVorlauf(); }
        let id = null;
        try { id = baum(sha).b.get(f); } catch (_e) { return null; }
        if (!id) return null;
        if (!skriptJe.has(id)) {
            let s = null;
            try { s = skriptVon(text(id), acorn); } catch (_e) { s = null; }
            skriptJe.set(id, s);
        }
        return skriptJe.get(id);
    };
    return { geaendert, linsenAm, skript, dateien: () => lage().namen, baum };
}

// die GTX-Stationen, deren Messung am Kopf Punkte ändern KANN — gefragt am EINEN Frische-Urteil der Buchung (s = buchen(…), je
// Station und Gerät gruen/ungemessen/tot) und an ihrer EINEN Punkte-Regel (stufen): eine gtx-Hälfte steht in der Liste, wenn sie
// am Kopf keine frische Messung trägt und eine Belegung der übrigen ungemessenen Hälften (sie fahren im selben Takt auf Radeon
// und Farm) ihren Ausgang über die Punkte des Kriteriums entscheiden lässt. Frisch Gemessenes ist Tatsache, eine Messung am Kopf
// wiederholte es (26.10.: takt5z maß 43 Stationen in ~6 h, auch Staffel 1 hinter grüner Radeon). 27.10.: das alte Urteil daneben
// verlangte Radeon-Hälfte und Staffel 1 JETZT grün — am Kopf a03b7b06 waren sie R6-alt und fuhren im selben Takt, 9 Staffeln 2
// mit alter gtx-Hälfte fehlten in der Liste, gebucht Σ 113 statt ≥ 123
// geraet (13.11., fahrtWellen): dieselbe Regel für jede Karte — die Radeon fragt sie vor ihrer Fahrt (WELLE 1), die OMEN hier als gtx-nutzen
function gtxNutzen(s, geraet = "gtx") {
    const ja = [], nein = [];
    const wo = (id, g) => id + "|" + g;
    for (const [k, e] of Object.entries(s.je)) {
        const ids = [...new Set(e.stationen.map((x) => x.id))];
        const sts = ids.map((id) => ({ kriterium: k, staffel: Number(id.slice(id.lastIndexOf("#") + 1)), geraet: e.stationen.filter((x) => x.id === id).map((x) => x.geraet),
            ...(e.stationen.some((x) => x.id === id && x.beide) ? { beide: true } : {}) }));
        const ist = new Map(e.stationen.map((x) => [wo(x.id, x.geraet), x]));
        const offen = e.stationen.filter((x) => x.ungemessen && !x.tot).map((x) => wo(x.id, x.geraet));
        for (const id of ids.filter((i) => ist.has(wo(i, geraet)))) {
            const ich = wo(id, geraet), rest = offen.filter((w) => w !== ich);
            let nutzt = false;
            for (let b = 0; offen.includes(ich) && !nutzt && b < 1 << rest.length; b++) {
                const p = (gtx) => stufen(sts, (st, g) => {
                    const w = wo(schluessel(st), g), i = rest.indexOf(w);
                    return { gruen: w === ich ? gtx : i >= 0 ? ((b >> i) & 1) === 1 : ist.get(w).gruen };
                }).punkte;
                nutzt = p(true) !== p(false);
            }
            (nutzt ? ja : nein).push(id);
        }
    }
    return { ja: ja.sort(), nein: nein.sort() };
}

// DER MESS-PLAN nach einem Zug (26.10.: 10 h vom Landen bis zur Buchung, die Prüfung länger als das Bauen): je GPU-Station
// das, was Punkte halten oder gewinnen kann, am Ergebnis des VORIGEN Kopfs — Staffel 1 braucht EIN grünes Gerät (die
// Zeit-Station auf die ruhige GTX, sonst das Gerät, das grün war), Staffel 2 nur über stehender 1 und auf beiden Geräten;
// eine rote Station ohne Heil-Versuch (der Zug nennt ihr Kriterium nicht) bleibt rot und wird nicht gemessen.
// da(id, g): die JÜNGSTE Messung der Station auf dem Gerät über alle Köpfe (ihr Vorwissen), sonst null · genannt: Set der
// Kriterien, die die Commits seit dem vorigen Kopf nennen · zeit(id): die Station urteilt in ms (ihr Merkmal `zeit`)
// DIE PFLICHT (w4-sitzung-reif, 30.10.): eine Station, deren Staffel einen Eintrag von docs/PFLICHT-OFFEN.md trägt (ihre quelle nennt
// „PFLICHT-OFFEN <X>“ — fahrzeug.K2#2, der Verkehr C), misst der Plan an jedem Zug wie einen Heil-Versuch, auch ohne stehende 1: die
// Pflicht ist der EINE Scope (Betriebsgesetz 2), ihr Messen hängt nie an den Punkten
function messPlan(stationen, da, genannt, zeit) {
    const plan = { radeon: [], gtx: [], uebersprungen: [] };
    for (const st of stationen) {
        const ge = geraeteVon(st).filter((g) => g === "radeon" || g === "gtx");
        if (!ge.length) continue;
        const id = schluessel(st), k = st.kriterium;
        const neu = ge.some((g) => !da(id, g));
        const pflicht = /\bPFLICHT-OFFEN [A-Z]\b/.test(st.quelle || "");
        const heil = genannt.has(k) || neu || pflicht;
        // `beide`: die 1 hält nur auf jedem Gerät — gemessen wird wie eine Staffel 2 (ganz grün hält, ein Heil-Versuch misst)
        if (st.staffel === 1 && st.beide) {
            if (ge.every((g) => da(id, g) && da(id, g).gruen) || heil) for (const g of ge) plan[g].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
        if (st.staffel === 1) {
            const gruen = ge.filter((g) => da(id, g) && da(id, g).gruen);
            if (gruen.length) plan[zeit(id) && gruen.includes("gtx") ? "gtx" : gruen.includes("radeon") ? "radeon" : "gtx"].push(id);
            // ein Heil-Versuch misst auf der GTX — EIN grünes Gerät trägt die 1, die Radeon entwickelt und misst nicht groß (Schöpfer 30.10.)
            else if (heil) plan[ge.includes("gtx") ? "gtx" : ge[0]].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
        const s1 = stationen.find((x) => x.kriterium === k && x.staffel === 1);
        const s1gruen = s1 && geraeteVon(s1).some((g) => da(schluessel(s1), g) && da(schluessel(s1), g).gruen);
        const allesGruen = ge.every((g) => da(id, g) && da(id, g).gruen);
        if ((s1gruen || genannt.has(k) || pflicht) && (allesGruen || heil)) for (const g of ge) plan[g].push(id);
        else plan.uebersprungen.push(id);
    }
    return plan;
}

function planCli(opt) {
    if (!opt.kopf || !opt.vorher) throw new Error("plan --kopf <neu> --vorher <voriger Kopf>");
    const repo = spielRepo();
    const [neu, alt] = [voll(repo, opt.kopf), voll(repo, opt.vorher)];
    const { stationen } = ladeGeprueft();
    const juengste = {};
    for (const m of ladeMessungen())
        for (const [id, e] of Object.entries(m.je || {})) {
            const w = id + "|" + m.geraet;
            if (!juengste[w] || String(e.zeit) > String(juengste[w].zeit)) juengste[w] = e;
        }
    // die Station eines Schlüssels AUF dem Gerät (eine Staffel kann eine headless- und eine Karten-Hälfte tragen)
    const st0 = (id, g) => stationen.find((st) => schluessel(st) === id && geraeteVon(st).includes(g));
    const hilfe = hilfeText(), abJe = new Map();
    const ab = (id, g) => abJe.get(id + "|" + g) || abJe.set(id + "|" + g, abdruck(st0(id, g), hilfe, g)).get(id + "|" + g);
    const da = (id, g) => {
        const e = juengste[id + "|" + g];
        return e && (!e.abdruck || !st0(id, g) || e.abdruck === ab(id, g)) ? e : null;
    };
    // ein Heil-Versuch ist jedes Kriterium, das ein Commit beim Namen nennt, UND jedes, dessen Zweig laut weg.json (wellen: Staffel →
    // Zweig) im Zug landete — 28.10.: „Merge siedlung-k1-innen in integ-probe" nennt kein Kriterium, der Plan übersprang siedlung.K1#2,
    // leib.K2#2 und vegetation.K4#2 als „rot ohne Heil-Versuch", obwohl ihre Zweige gelandet waren
    const genannt = new Set((git(["log", "--format=%B", alt + ".." + neu], repo).match(/\b[a-z]+\.K\d\b/g) || []));
    const gelandet = new Set(git(["log", "--merges", "--format=%s", alt + ".." + neu], repo).split("\n").map((z) => (/^Merge (\S+) in /.exec(z) || [])[1]).filter(Boolean));
    const weg = path.join(DIR, "weg.json");
    for (const w of fs.existsSync(weg) ? JSON.parse(fs.readFileSync(weg, "utf8")).wellen || [] : [])
        for (const [staffel, zweig] of Object.entries(w.staffeln || {})) if (gelandet.has(zweig)) genannt.add(staffel.replace(/#\d+$/, ""));
    const minVon = (id) => Math.max(0, ...["radeon", "gtx"].map((g) => (da(id, g) && da(id, g).minuten - (da(id, g).warten || 0)) || 0));
    const zeit = new Set(stationen.filter((st) => st.zeit).map(schluessel));
    const p = messPlan(stationen, da, genannt, (id) => zeit.has(id));
    const sum = (ids) => Math.round(ids.reduce((a, id) => a + minVon(id), 0));
    console.log("MESS-PLAN " + neu.slice(0, 8) + " nach " + alt.slice(0, 8) + " · genannt: " + ([...genannt].join(" ") || "—"));
    for (const g of ["radeon", "gtx"]) console.log(g + " " + p[g].length + " Stationen ~" + sum(p[g]) + " min · nur=" + p[g].join(","));
    console.log("übersprungen " + p.uebersprungen.length + " (rot ohne Heil-Versuch oder Staffel 2 ohne stehende 1): " + p.uebersprungen.join(" "));
    // DIE RATSCHE im Plan (30.10.): was gebucht GRÜN steht, hält ohne Neumessung — es zu messen ist Rückfall-Probe (die GTX-Hälfte
    // prio 3 im Leerlauf der OMEN, die Radeon-Hälfte nur, wenn die Werkbank ruht); nur der Rest kann gewinnen (prio 1) — sonst misst
    // jeder Kopf ~130 gehaltene Stationen nach (73bdf938: Radeon 72 → 13 Stationen, ~290 → ~23 min)
    const gebucht = new Set();
    for (const e of Object.values((liesStand() || {}).je || {})) for (const x of e.stationen || []) if (x.gruen) gebucht.add(x.id + "|" + x.geraet);
    p.gewinn = {}; p.halten = {};
    for (const g of ["radeon", "gtx"]) {
        p.gewinn[g] = p[g].filter((id) => !gebucht.has(id + "|" + g));
        p.halten[g] = p[g].filter((id) => gebucht.has(id + "|" + g));
        console.log(g + " gewinn " + p.gewinn[g].length + " Stationen ~" + sum(p.gewinn[g]) + " min (prio 1) · nur=" + p.gewinn[g].join(","));
        console.log(g + " halten " + p.halten[g].length + " Stationen ~" + sum(p.halten[g]) + " min (Rückfall-Probe, prio 3) · nur=" + p.halten[g].join(","));
    }
    return p;
}

// DER ZWEITE NUTZEN DES KONSUMS (`beruehrt --basis <sha> --kopf <sha>`): welche Stationen berührt der Diff eines Zweigs? Zweimal das
// EINE Frische-Urteil der Buchung über dieselben Messungen — an der Basis und am Kopf: BERÜHRT ist die Hälfte, deren Messung an der
// Basis frisch gilt und am Kopf nicht mehr (der Zweig traf, was ihr Lauf ausführte oder las; ohne Konsum-Menge: ihre Linse, ihren
// Glob); OFFEN die, die schon an der Basis keine frische Messung trägt (über sie sagt keine Messung etwas — der Richter misst sie
// ohnehin); TOT die mit totem Glob am Kopf. anBasis/amKopf(messSha) → stempelDiff bis zum Stand; opt.basis/opt.kopf wie frischUrteil.
// Rückgabe { je: { geraet: { haelften, beruehrt: [{ id, r6, grund }], offen: [id], tot: [id] } } }
function beruehrt(stationen, messungen, anBasis, amKopf, hilfe = hilfeText(), opt = {}) {
    const fb = frischUrteil(messungen, anBasis, hilfe, opt.basis || {}), fk = frischUrteil(messungen, amKopf, hilfe, opt.kopf || {});
    const je = {};
    for (const st of stationen)
        for (const g of geraeteVon(st)) {
            const z = je[g] || (je[g] = { haelften: 0, beruehrt: [], offen: [], tot: [] });
            const id = schluessel(st), b = fb(st, g), k = fk(st, g);
            z.haelften++;
            if (k.tot) z.tot.push(id);
            else if (b.ungemessen) z.offen.push(id);
            else if (k.ungemessen) z.beruehrt.push({ id, r6: k.r6 || null, grund: k.grund });
        }
    return { je };
}
function beruehrtCli(opt) {
    if (!opt.basis || !opt.kopf) throw new Error("beruehrt --basis <sha> --kopf <sha>");
    const { stationen, fehler } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const repo = spielRepo();
    const [basis, kopf] = [voll(repo, opt.basis), voll(repo, opt.kopf)];
    // je Seite EINE R6-Quelle über dieselben Messungen; die am Kopf kennt dazu die Basis (der Diff des Zweigs)
    const messungen = ladeMessungen();
    const seite = (sha, dazu = []) => {
        const q = r6Quelle(repo, sha, [...messungen, ...dazu.map((s) => ({ sha: s }))], stationen), d = q.dateien();
        return { q, opt: { tot: (st) => toteGlobs(st.pfad, d), roh: rohAus(), linsen: q.linsenAm(), skript: q.skript } };
    };
    const sb = seite(basis), sk = seite(kopf, [basis]);
    const r = beruehrt(stationen, messungen, sb.q.geaendert, sk.q.geaendert, hilfeText(), { basis: sb.opt, kopf: sk.opt });
    Object.assign(r, { basis, kopf, dateien: sk.q.geaendert(basis).dateien.length });
    if (opt.json) return (console.log(JSON.stringify(r)), r);
    console.log("BERÜHRT " + basis.slice(0, 8) + " → " + kopf.slice(0, 8) + " · " + r.dateien + " Dateien im Diff");
    for (const g of GERAETE.filter((x) => r.je[x])) {
        const z = r.je[g], nk = z.beruehrt.filter((x) => x.r6 === "konsum").length;
        console.log(g + " berührt " + z.beruehrt.length + " von " + z.haelften + " (nach Konsum " + nk + ", nach Linse und Glob " + (z.beruehrt.length - nk) + ") · nur=" + z.beruehrt.map((x) => x.id).join(","));
        if (z.offen.length) console.log(g + " offen an der Basis " + z.offen.length + " (keine frische Messung: über sie urteilt kein Konsum) · nur=" + z.offen.join(","));
        if (z.tot.length) console.log(g + " toter Glob am Kopf " + z.tot.length + " · " + z.tot.join(","));
    }
    return r;
}

function gtxNutzenCli(opt) {
    const s = buchenCli({ ...opt, trocken: true });
    const g = opt.geraet || "gtx";
    if (!["radeon", "gtx"].includes(g)) throw new Error("gtx-nutzen --geraet radeon|gtx");
    const n = gtxNutzen(s, g);
    console.log(g.toUpperCase() + "-NUTZEN " + n.ja.length + " von " + (n.ja.length + n.nein.length) + " Stationen am " + s.kopf + " ändern Punkte");
    console.log("nur=" + n.ja.join(","));
    return n;
}

function buchenCli(opt) {
    if (!opt.kopf) throw new Error("--kopf fehlt");
    const { stationen, fehler, fehlt } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const repo = spielRepo();
    const kopfVoll = voll(repo, opt.kopf);
    // DIE R6-QUELLE: was die Buchung von git wissen muss, in einem Prozess je Art (nie je Mess-Kopf)
    const messungen = ladeMessungen();
    const quelle = r6Quelle(repo, kopfVoll, messungen, stationen);
    const dateien = quelle.dateien();
    // die Ratsche hält gegen die letzte Buchung (stand.json vor dem Schreiben)
    const vorher = opt.ohneRatsche ? null : liesStand();
    const s = buchen(kopfVoll.slice(0, 8), stationen, messungen, quelle.geaendert,
        hilfeText(), fehlt, { tot: (st) => toteGlobs(st.pfad, dateien), roh: rohAus(), linsen: quelle.linsenAm(), skript: quelle.skript, vorher });
    s.kopfVoll = kopfVoll;
    s.zeit = new Date().toISOString();
    if (vorher) s.vorher = vorher.kopf;
    // DAS PFLICHT-BAND am Kopf: das Dokument und die Tafeln aus dem Spiel-Baum des Kopfs — unlesbar ist ROT, nie ein Band ohne Quelle
    const zu = liesPflicht();
    if (zu) {
        const tafeln = {};
        for (const e of zu.eintraege || []) if (e.tafel && !tafeln[e.tafel]) tafeln[e.tafel] = JSON.parse(git(["show", kopfVoll + ":" + e.tafel], repo));
        s.pflicht = pflichtBand({ ...s.je, ...s.pflichtJe }, zu, git(["show", kopfVoll + ":" + zu.dokument], repo), tafeln);
    }
    if (opt.trocken) return s;
    fs.writeFileSync(path.join(DIR, "stand.json"), JSON.stringify(s, null, 1) + "\n");
    buchungZeigen(s, "→ stand.json");
    return s;
}
// die Zeilen einer Buchung — `buchen` nach dem Schreiben, `buchen --trocken` ohne (stand.json bleibt unberührt)
function buchungZeigen(s, wohin) {
    for (const [k, e] of Object.entries(s.je)) console.log("  " + k + " " + e.punkte + " · " + e.beleg);
    for (const [k, e] of Object.entries(s.pflichtJe || {})) console.log("  " + k + " (Pflicht-Richter, ohne Punkte) · " + e.beleg);
    for (const r of s.rueckfall) console.log("  RÜCKFALL " + r);
    if (s.pflicht) for (const z of pflichtZeilen(s.pflicht)) console.log(z);
    if (s.r6) console.log(r6Zeile(s.r6));
    const gehalten = Object.values(s.je).reduce((a, e) => a + e.stationen.filter((x) => x.gehalten).length, 0);
    console.log("Kopf " + s.kopf + " · Maschine " + Object.keys(s.je).length + " Kriterien · Σ " + Object.values(s.je).reduce((a, e) => a + e.punkte, 0) +
        (s.vorher ? " · Ratsche gegen " + s.vorher + ": gehalten " + gehalten + ", Rückfall " + s.rueckfall.length : " · ohne Ratsche") + " " + wohin);
}

// ───────────────────────────────── Übergang in gen.cjs ─────────────────────────────────
// liest stand.json (falls da); Rückgabe null oder { kopf, je }
function liesStand(datei = path.join(DIR, "stand.json")) {
    return fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
}
// überschreibt in den Kriterien der Quelle (bereichKey, index, kriterium) punkte und beleg der REGISTRIERTEN
function maschinenKriterium(stand, bereichKey, i, k) {
    const e = stand && stand.je[bereichKey + ".K" + (i + 1)];
    return e ? { ...k, punkte: e.punkte, beleg: e.beleg, maschine: true } : k;
}
// Fehler des Übergangs: Kopf ungleich, Kriterium unbekannt
function standPruefen(stand, kopfKarte, bekannt) {
    const f = [];
    if (!stand) return f;
    if (stand.kopf !== String(kopfKarte).slice(0, 8)) f.push("stand.json am Kopf " + stand.kopf + ", die Karte am Kopf " + kopfKarte + " — punkte.cjs buchen --kopf " + kopfKarte);
    for (const id of Object.keys(stand.je)) if (!bekannt.has(id)) f.push("stand.json bucht " + id + ", die Karte kennt es nicht");
    return f;
}

// ───────────────────────────────── DAS PFLICHT-BAND ─────────────────────────────────
// Schöpfer 04.11.: „diese PFLICHT-OFFEN müssten Teil der Meisterkarte sein, sonst wird es nie erledigt, es besteht kein Anreiz“.
// pflicht.json ordnet jedem Eintrag von docs/PFLICHT-OFFEN.md (am Kopf gelesen — das Dokument ist die EINE Liste der Einträge) die
// Stationen zu, die ihn messen. Je Eintrag: Paare (Station × Gerät) grün/gesamt aus der Buchung, die Punkte der tragenden Kriterien
// (aus den 330, kein eigener Topf), die offenen Paare mit ihrer letzten Zeile. ROT „ohne Richter“ beim Namen: ein Teil des Kriteriums,
// den keine Station misst (`ohneRichter`), ein Eintrag ohne jede Station, ein Eintrag des Dokuments ohne Zeile in pflicht.json, eine
// Klasse der Soll-Tafel am Kopf ohne Station (A, `klassen`), eine Station, die die Buchung nicht kennt. Ein Eintrag fällt nur, wenn
// jedes Paar grün ist und kein Teil ohne Richter steht. Zeilen von pflicht.json, die das Dokument nicht mehr trägt, nennt `gefallen`.
const PFLICHT_DATEI = path.join(DIR, "pflicht.json");
function liesPflicht(datei = PFLICHT_DATEI) {
    return fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
}
// die Einträge des Dokuments: je Zeile „X) …“ der Buchstabe und der Satz „X fällt, wenn …“ (das Kriterium, wörtlich)
function pflichtEintraegeAus(md) {
    const out = [];
    for (const z of String(md || "").split(/\r?\n/)) {
        const m = /^([A-Z])\) /.exec(z);
        if (!m) continue;
        const k = new RegExp("\\b" + m[1] + " fällt, wenn (.+?)\\.(?=\\s+[A-ZÄÖÜ]|\\*\\*|$)").exec(z);
        out.push({ id: m[1], kriterium: k ? m[1] + " fällt, wenn " + k[1] + "." : null });
    }
    return out;
}
function pflichtBand(je, zuordnung, md, tafeln = {}) {
    const doc = pflichtEintraegeAus(md);
    if (!doc.length) throw new Error("Pflicht-Band: " + zuordnung.dokument + " trägt keinen Eintrag „X) …“ — das Band hat keine Quelle");
    const zeile = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 240);
    const stationIn = (id) => {
        const k = id.split("#")[0];
        return ((je[k] && je[k].stationen) || []).filter((x) => x.id === id);
    };
    const eintraege = doc.map((d) => {
        const z = (zuordnung.eintraege || []).find((e) => e.id === d.id);
        const ohne = [];
        if (!z) ohne.push("keine Zeile in pflicht.json — keine Station ist ihm zugeordnet");
        const ids = new Set((z && z.stationen) || []);
        if (z && z.klassen) {
            const tafel = tafeln[z.tafel];
            if (!tafel || !Array.isArray(tafel.klassen)) throw new Error("Pflicht-Band " + d.id + ": die Tafel " + z.tafel + " ist am Kopf unlesbar");
            const ohneSt = tafel.klassen.map((k) => k.id).filter((id) => !(z.klassen[id] || []).length);
            for (const sts of Object.values(z.klassen)) for (const id of sts) ids.add(id);
            if (ohneSt.length) ohne.push(ohneSt.length + " von " + tafel.klassen.length + " Klassen der Tafel ohne Station: " + ohneSt.join(", "));
        }
        if (z) ohne.push(...(z.ohneRichter || []));
        if (z && !ids.size && !ohne.length) ohne.push("keine Station misst ihn");
        const paare = [];
        for (const id of ids) {
            const xs = stationIn(id);
            if (!xs.length) ohne.push(id + ": die Buchung kennt die Station nicht");
            paare.push(...xs);
        }
        const kriterien = [...new Set([...ids].map((id) => id.split("#")[0]))].sort();
        const gruen = paare.filter((x) => x.gruen).length;
        return {
            id: d.id, titel: (z && z.titel) || d.id, kriterium: d.kriterium,
            status: ohne.length ? "ohne Richter" : gruen === paare.length ? "grün" : "offen",
            gruen, gesamt: paare.length, prozent: paare.length ? Math.round((100 * gruen) / paare.length) : 0,
            punkte: kriterien.reduce((a, k) => a + ((je[k] && je[k].punkte) || 0), 0), max: 2 * kriterien.length, kriterien,
            offen: paare.filter((x) => !x.gruen).map((x) => ({ station: x.id, geraet: x.geraet, zeile: zeile((x.ungemessen ? x.grund : "ROT: " + (x.zahl || x.grund)) + (x.sha ? " an " + String(x.sha).slice(0, 8) : "")) })),
            ohneRichter: ohne,
        };
    });
    const gefallen = (zuordnung.eintraege || []).map((e) => e.id).filter((id) => !doc.some((d) => d.id === id));
    return { dokument: zuordnung.dokument, eintraege, gefallen };
}
function pflichtZeilen(p) {
    return p.eintraege.map((e) => "  PFLICHT " + e.id + " " + e.titel + " · " + e.status + " · Paare " + e.gruen + "/" + e.gesamt + " (" + e.prozent + " %) · Punkte " + e.punkte + "/" + e.max +
        (e.ohneRichter.length ? " · ohne Richter: " + e.ohneRichter.length : "")).concat(p.gefallen.length ? ["  PFLICHT gefallen (nicht mehr im Dokument, Zeile streichen): " + p.gefallen.join(", ")] : []);
}

// ───────────────────────────────── Selbsttest ─────────────────────────────────
// `selbsttest --ohne 3c` (w4-sitzung-eichen): ohne den Teil (3c) DIE BAHNEN — er zeugt Bash-Waisen neben einer Sitzung; was fehlt, steht
// in der letzten Zeile beim Namen (bis dahin „Selbsttest ohne (3c)“ von Hand, Exit 1 allein durch den ausgelassenen Teil)
const SELBST_TEILE = ["3c"];
async function selbsttest(o = {}) {
    const ohne = new Set(String(o.ohne || "").split(",").filter(Boolean));
    for (const t of ohne) if (!SELBST_TEILE.includes(t)) throw new Error("--ohne " + t + ": nur " + SELBST_TEILE.join(", "));
    const fall = [];
    const pruef = (name, ok, was) => { fall.push({ name, ok }); console.log((ok ? "  GRÜN " : "  ROT  ") + name + (was ? " — " + was : "")); };
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-selbst-"));
    const karte = kriterienDerKarte();
    // der Zeuge der Fremd-Last ist im Selbsttest still: die Läufer-Fälle urteilen ihre Mechanik, nie die Last des Rechners — der echte
    // Zeuge und seine Attrappen stehen in (5f) beim Namen
    zeugeDerMaschine = stillerZeuge();
    referenzDerMaschine = stilleReferenz();
    // (1) die echten Stationen gegen die Karte
    const echt = ladeGeprueft();
    deckelTafel = {}; // die echte Deckel-Tafel prüft FORMAT (ladeGeprueft); die erfundenen Stationen danach fahren ohne sie
    deckelGelernt = { radeon: {}, gtx: {}, headless: {} }; // ebenso ohne die gelernten Deckel der echten Mess-Dateien (grundDeckel)
    pruef("FORMAT echte Stationen gegen src/gN.js", echt.fehler.length === 0 && echt.stationen.length > 0,
        echt.stationen.length + " Stationen, " + echt.fehlt.length + " fehlt, " + echt.fehler.length + " Fehler" + (echt.fehler.length ? ": " + echt.fehler.join(" | ") : ""));
    // (1d) DER ABDRUCK TRÄGT, WAS DIE MESSUNG ERZEUGT (das Gesetz der Fremd-Last, Koordinator 10.11.: „nie, wie die Maschine ihr Ergebnis
    // unter Last liest“): das Maß einer Zeit-Station (mass, ohneMass) ändert nicht, was sie misst — ihr Abdruck bleibt Byte für Byte, mit,
    // ohne und mit anderem Maß; ein geänderter Befehl der Probe und ein geändertes Urteil machen die Messung weiterhin alt (die Mutanten)
    {
        const st = echt.stationen.find((x) => schluessel(x) === "profiband.K1#1"), h = hilfeText(), g = "gtx", ohne = { ...st };
        delete ohne.mass;
        const ab = abdruck(st, h, g);
        const gleich = [abdruck(ohne, h, g), abdruck({ ...st, mass: () => [{ wort: "x", wert: 1, soll: 0 }] }, h, g), abdruck({ ...ohne, ohneMass: "ein Grund ohne Zahl" }, h, g)];
        const befehl = abdruck({ ...st, probe: { ...st.probe, befehl: [...st.probe.befehl, "--mutante"] } }, h, g);
        const urteil = abdruck({ ...st, urteil: (j, lauf) => ({ ...st.urteil(j, lauf), gruen: true }) }, h, g);
        pruef("ABDRUCK ohne Maß: profiband.K1#1 mit, ohne und mit anderem Maß Byte für Byte derselbe; ein geänderter Befehl der Probe und ein geändertes Urteil machen die Messung alt (Mutanten)",
            typeof st.mass === "function" && gleich.every((x) => x === ab) && befehl !== ab && urteil !== ab, JSON.stringify([ab, gleich, befehl, urteil]));
    }
    // (1s) DIE SPERRE DES SPIEL-BAUMS KENNT IHREN HALTER AN pid + START (11.11.: die Radeon wartete 29 min an einer Nummer, die Windows
    // neu vergeben hatte): eine Marke, die älter ist als der Prozess, der ihre Nummer heute trägt, ist verwaist — gelesen am ECHTEN
    // prozessStart dieser Karte (der Selbsttest selbst trägt die Nummer); der lebende Halter und die Frage ohne Antwort halten
    {
        const repo = path.join(tmp, "sperre-repo"), sp = path.join(repo, ".claude", "worktrees", "punkte-selbst.sperre"), marke = path.join(sp, "pid");
        const lege = (pid, vorS) => { fs.rmSync(sp, { recursive: true, force: true }); fs.mkdirSync(sp, { recursive: true }); fs.writeFileSync(marke, String(pid));
            if (vorS) { const t = new Date(Date.now() - vorS * 1000); fs.utimesSync(marke, t, t); } };
        const start = prozessStart(process.pid), still = console.log;
        const nimm = async (o) => { console.log = () => {}; try { return await baumSperre(repo, "selbst", { einmal: true, ...o }); } finally { console.log = still; } };
        lege(process.pid, 3600); // die Marke eine Stunde vor diesem Prozess: die Nummer wurde neu vergeben
        const neuVergeben = await nimm(), alteRegel = start != null; // die alte Regel (pid lebt) hielte sie für belegt
        lege(process.pid, 0); // die Marke von jetzt, der Prozess begann davor: der Halter lebt
        const lebend = await nimm();
        const kind = spawnSync(process.execPath, ["-e", "0"]);
        lege(kind.pid, 0); // der Halter ist fort
        const tot = prozessStart(kind.pid) == null ? await nimm() : true; // trägt die Nummer schon wieder jemand, urteilt (neuVergeben)
        lege(process.pid, 3600);
        const unlesbar = await nimm({ startVon: () => NaN });
        fs.rmSync(sp, { recursive: true, force: true });
        pruef("SPERRE pid + Start: die neu vergebene Nummer ist verwaist (die alte Regel hielte sie), der lebende Halter und die Frage ohne Antwort halten, der tote fällt",
            Number.isFinite(start) && Math.abs(Date.now() - process.uptime() * 1000 - start) < 5000 && neuVergeben === true && alteRegel && lebend === false && tot === true && unlesbar === false,
            JSON.stringify({ start, gegenUptimeMs: Math.round(Date.now() - process.uptime() * 1000 - start), neuVergeben, lebend, tot, unlesbar }));
    }
    // (1k) WAS EIN ABGEBROCHENER LAUF GEMESSEN HAT, BLEIBT (messungKappen): die Station, die vor dem CI-Job endete, bleibt; die danach
    // endete, weicht ihrem Eintrag im Archiv (oder fällt, wo es keinen gibt); was der Lauf nicht anrührte, bleibt Byte für Byte; ein
    // Eintrag ohne Zeit ist nie sauber. Die Mutante „alles behalten“ (bis = ∞) trüge die Station neben dem Job
    {
        const t0 = Date.parse("2026-11-11T12:30:00.000Z"), iso = (s) => new Date(t0 + s * 1000).toISOString();
        const alt = { sha: "x", je: { "a.K1#1": { gruen: true, zeit: iso(-9000), s: 20 }, "a.K3#1": { gruen: true, zeit: iso(-9000), s: 20 } }, ungemessen: { "a.K2#1": { ungemessen: true, grund: "alt", zeit: iso(-9000), s: 5 } } };
        const lauf = () => ({ sha: "x", je: { "a.K1#1": { gruen: false, zeit: iso(0), s: 30 }, "a.K2#1": { gruen: true, zeit: iso(40), s: 30 }, "a.K3#1": alt.je["a.K3#1"], "a.K4#1": { gruen: true, zeit: iso(60), s: 50 }, "a.K5#1": { gruen: true, s: 1 } } });
        const r = messungKappen(lauf(), alt, t0 + 75000), mut = messungKappen(lauf(), alt, Infinity);
        pruef("BEHALTE ein abgebrochener Lauf: vor dem Job gemessen bleibt (auch ROT), danach weicht dem Archiv oder fällt, Unberührtes bleibt, ohne Zeit nie sauber (Mutante: alles behalten)",
            r.behalten.join() === "a.K1#1,a.K2#1" && r.verworfen.join() === "a.K4#1,a.K5#1" && r.m.je["a.K1#1"].gruen === false && r.m.je["a.K2#1"].gruen === true && !r.m.ungemessen &&
            r.m.je["a.K3#1"] === alt.je["a.K3#1"] && !r.m.je["a.K4#1"] && mut.behalten.includes("a.K4#1") &&
            messungKappen(lauf(), alt, t0 + 20000).m.ungemessen["a.K2#1"].grund === "alt",
            JSON.stringify({ behalten: r.behalten, verworfen: r.verworfen, mutante: mut.behalten }));
    }
    // (1h) DAS ENDE DES HALTERS (halterEnde): das genannte Ende ist ROT beim Namen, der Tod ohne Wort UNGEMESSEN beim Exit-Code
    {
        const he = [halterEnde("x\nSITZUNG FEHLER die Werkbank startet nicht (Exit 1): y\n", 1), halterEnde("", 3221226505), halterEnde("node: letzte Zeile\n", 3)];
        pruef("HALTER-ENDE: `SITZUNG FEHLER …` ist ROT beim Namen; der Halter, der ohne Wort stirbt (Exit 3221226505), ist UNGEMESSEN beim Exit-Code mit seiner letzten Zeile",
            he[0].ok === false && !he[0].ungemessen && he[0].grund === "die Welt der Sitzung startet nicht: die Werkbank startet nicht (Exit 1): y" && he[1].ungemessen === true &&
            /Halter Exit 3221226505 ohne Wort/.test(he[1].grund) && he[2].ungemessen === true && /node: letzte Zeile$/.test(he[2].grund), JSON.stringify(he));
    }
    // (1a) DIE PROBEN: jede Station urteilt ihre Roh-Ausgaben (die Mutanten der Soll-Tafel ROT), eine falsche Probe beim Namen
    {
        const n = echt.stationen.reduce((s, st) => s + (st.proben || []).length, 0);
        const falsch = probenUrteil(echt.stationen);
        pruef("PROBEN jede Station urteilt ihre Roh-Ausgaben wie erwartet (" + n + " Proben)", n > 0 && falsch.length === 0, falsch.join(" | "));
        const luegt = probenUrteil([{ kriterium: "a.K1", staffel: 1, urteil: (j, l) => ({ gruen: /GRÜN/.test(l.stdout), zahl: "z" }),
            proben: [{ name: "Roh", stdout: "GRÜN", gruen: true }, { name: "Mutante", stdout: "ROT", gruen: true }] }]);
        pruef("PROBEN eine Probe, deren Urteil nicht stimmt, beim Namen", luegt.join() === "a.K1#1 Mutante: ROT statt GRÜN (z)", luegt.join());
        const stumm = probenUrteil([{ kriterium: "a.K1", staffel: 1, urteil: (j, l) => ({ gruen: false, zahl: /GRUND/.test(l.stdout) ? "ROT: GRUND" : "ohne Abnahme" }),
            proben: [{ name: "nennt", stdout: "GRUND", gruen: false, zahl: /GRUND$/ }, { name: "schweigt", stdout: "-", gruen: false, zahl: /GRUND$/ }] }]);
        pruef("PROBEN eine Zahl, die ihren Grund verschweigt, beim Namen", stumm.join() === "a.K1#1 schweigt: die Zahl nennt nicht /GRUND$/ (ohne Abnahme)", stumm.join());
        // DAS MASS (das Gesetz der Fremd-Last, das Feld der Station neben ihrem Urteil): ein Maß, das unter einem GRÜN reißt (die Mutante: das
        // Soll falsch herum), ein schiefes und eines, das wirft, beim Namen; ein Maß, das reißt, unter einem ROT und ein ungemessener Wert (NaN) still
        const mU = (mass, gruen) => ({ kriterium: "a.K1", staffel: 1, urteil: () => ({ gruen, zahl: "z" }), mass: typeof mass === "function" ? mass : () => mass, proben: [{ name: "Roh", stdout: "-", gruen }] });
        const luegtMass = probenUrteil([mU([{ wort: "Bild-p95 ms", wert: 30, soll: 33, richtung: "≥" }], true), mU([{ wort: "Bild-p95", wert: 30, soll: "33" }], false),
            mU([{ wort: "Bild-p95 ms", wert: 40, soll: 33 }, { wort: "VRAM", wert: NaN, soll: 118, fest: true }], false), mU([{ wort: "fps", wert: NaN, soll: 30, richtung: "≥" }], true),
            mU(() => { throw new Error("die Zeile fehlt"); }, false)]);
        pruef("PROBEN ein Maß, das unter einem GRÜN reißt, ein schiefes und eines, das wirft, beim Namen; ein reißendes Maß unter ROT und ein ungemessener Wert still",
            luegtMass.length === 3 && luegtMass[0] === "a.K1#1 Roh: GRÜN mit reißendem Maß Bild-p95 ms 30 (Soll ≥ 33)" && /^a\.K1#1 Roh: das Maß ist schief: \{"wort":"Bild-p95"/.test(luegtMass[1]) &&
                luegtMass[2] === "a.K1#1 Roh: das Maß warf: die Zeile fehlt",
            luegtMass.join(" | "));
    }
    // (1c) DER LEERE LAUF (w4-sitzung-urteil): jede echte Station urteilt über ihn ROT — die Voraussetzung von keinUrteil; die Mutanten
    // (ein Urteil, das ohne Ausgabe GRÜN spricht, eines, das an ihr wirft) beim Namen
    {
        const falsch = leerUrteile(echt.stationen);
        pruef("LEERER LAUF jede Station urteilt über ihn ROT (" + echt.stationen.length + " Stationen × Exit 0 · 1 · 2 · Signal)", !falsch.length, falsch.slice(0, 6).join(" | "));
        const mut = leerUrteile([{ kriterium: "a.K1", staffel: 1, urteil: () => ({ gruen: true, zahl: "still grün" }) }, { kriterium: "a.K2", staffel: 1, urteil: (j) => ({ gruen: j.n === 0, zahl: "n" }) }]);
        pruef("LEERER LAUF die Mutanten beim Namen (still grün, wirft)", mut.length === 8 && /^a\.K1#1 Exit 0: GRÜN „still grün“$/.test(mut[0]) && /^a\.K2#1 Exit 0: Urteil warf/.test(mut[4]), mut.join(" | "));
    }
    // (1b) R6 liest Bytes ohne Stempel: Versions-Stempel fallen, Code, Binär und Werkzeug bleiben (welches Werkzeug zählt, urteilt
    // frischUrteil an der Linse der Station)
    {
        const namen = "index.html\nscripts/lib/welt-boot.cjs\nstamm/kampf.js\ngelaende-core.js\nbild.png\nREADME.md";
        const dt = [
            "diff --git a/index.html b/index.html", "--- a/index.html", "+++ b/index.html", "@@ -1 +1 @@",
            '-<script src="phyto-core.js?v=18.546.73" defer></script>', '+<script src="phyto-core.js?v=18.546.74" defer></script>',
            "diff --git a/stamm/kampf.js b/stamm/kampf.js", "--- a/stamm/kampf.js", "+++ b/stamm/kampf.js", "@@ -9 +9 @@", "-x = 1;", "+x = 2;",
            "diff --git a/gelaende-core.js b/gelaende-core.js", "@@ -1 +1 @@", '-importScripts("a.js?v=1.2");', '+importScripts("a.js?v=1.3");', "+neu();",
            "diff --git a/bild.png b/bild.png", "Binary files a/bild.png and b/bild.png differ",
        ].join("\n");
        const w = stempelDateien(namen, dt).join(",");
        pruef("R6 ohne Stempel: Stempel fallen, Code, Binär und Werkzeug bleiben", w === "scripts/lib/welt-boot.cjs,stamm/kampf.js,gelaende-core.js,bild.png,README.md", w);
    }
    // (2) jede Format-Verletzung beim Namen
    const st0 = { kriterium: "gelaende.K4", staffel: 1, geraet: "headless", befehl: ["node", "-e", "0"], gpu: false, zeit: false, minuten: 1,
        urteil: () => ({ gruen: true, zahl: "x" }), pfad: ["stamm/wasser-*.js"], quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" };
    const fv = [
        ["FORMAT-ROT Kriterium unbekannt", { kriterium: "gelaende.K9" }, /Kriterium unbekannt/],
        ["FORMAT-ROT Pflicht-Kriterium ohne pflicht: true", { kriterium: "pflicht.E" }, /Pflicht-Richter trägt pflicht: true/],
        ["FORMAT-ROT pflicht: true an einem Kriterium der Karte", { pflicht: true }, /Pflicht-Richter trägt pflicht: true/],
        ["FORMAT-ROT Pflicht-Richter ohne „PFLICHT-OFFEN E = …“", { kriterium: "pflicht.E", pflicht: true }, /quelle nennt nicht „PFLICHT-OFFEN E = …“/],
        ["FORMAT-ROT Quelle nicht wörtlich", { quelle: "1 = alle Leser folgen irgendwie" }, /nicht wörtlich/],
        ["FORMAT-ROT Quelle andere Stufe", { staffel: 2, quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" }, /Stufe 2/],
        ["FORMAT-ROT Pfad leer", { pfad: [] }, /pfad leer/],
        ["FORMAT-ROT Staffel 2 GPU an einem Gerät", { staffel: 2, geraet: "radeon", gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }, /beide Geräte/],
        ["FORMAT-ROT radeon ohne gpu", { geraet: "radeon", gpu: false }, /gpu: true/],
        ["FORMAT-ROT GPU-Station ohne zeit", { geraet: "radeon", gpu: true, zeit: undefined }, /zeit nicht boolesch/],
        ["FORMAT-ROT Urteil kein Code", { urteil: "(j) => ({gruen:true})" }, /keine Funktion/],
        ["FORMAT-ROT argv npm", { befehl: ["npm", "run", "x"] }, /node\|bash/],
    ];
    for (const [name, mut, re] of fv) {
        const r = pruefeStationen([{ ...st0, ...mut }, ...(mut.staffel === 2 ? [st0] : [])], karte);
        pruef(name, r.fehler.some((f) => re.test(f)), r.fehler.join(" | "));
    }
    {
        const r = pruefeStationen([{ ...st0, staffel: 2, geraet: ["radeon", "gtx"], gpu: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 },
            quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }], karte);
        pruef("FORMAT-ROT Staffel 2 ohne Staffel 1", r.fehler.some((f) => /keine Staffel-1-Station/.test(f)), r.fehler.join(" | "));
        const d = pruefeStationen([st0, st0], karte);
        pruef("FORMAT-ROT doppelte Station", d.fehler.some((f) => /doppelt/.test(f)), d.fehler.join(" | "));
        // eine Staffel mit headless-Hälfte und Karten-Hälfte ist EINE Staffel auf drei Geräten, nie doppelt — ihre zweite headless-Hälfte schon
        const halb = { ...st0, staffel: 2, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" };
        const karteHalb = { ...halb, geraet: ["radeon", "gtx"], gpu: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 } };
        const h2 = pruefeStationen([st0, halb, karteHalb], karte);
        const h3 = pruefeStationen([st0, halb, karteHalb, halb], karte);
        pruef("FORMAT eine Staffel trägt eine headless- und eine Karten-Hälfte, eine zweite headless-Hälfte ist doppelt",
            !h2.fehler.some((f) => /doppelt/.test(f)) && h2.stationen.length === 3 && h3.fehler.some((f) => /doppelt \(auf headless\)/.test(f)), h2.fehler.concat(h3.fehler).join(" | "));
        const n = pruefeStationen([st0, { kriterium: "gelaende.K4", staffel: 2, befehl: null, grund: "kein Werkzeug" }], karte);
        const pf = pruefeStationen([{ ...st0, kriterium: "pflicht.E", pflicht: true, quelle: "PFLICHT-OFFEN E = Frame p95 ≤ 33 ms in jeder Stand-Zelle" }], karte);
        pruef("FORMAT der Pflicht-Richter (pflicht: true, pflicht.E, „PFLICHT-OFFEN E = …“) ist fahrbar ohne Kriterium der Karte", !pf.fehler.length && pf.stationen.length === 1, pf.fehler.join(" | "));
        const br = (x) => pruefeStationen([{ ...st0, kriterium: "breite.gelaende", breite: true, quelle: "BREITE gelaende = EIN Gesetz trägt jede Landform", ...x }], karte);
        pruef("FORMAT der Breite-Richter (breite: true, breite.<Bereich>, „BREITE <Bereich> = …“) ist fahrbar ohne Kriterium der Karte", !br({}).fehler.length && br({}).stationen.length === 1, br({}).fehler.join(" | "));
        pruef("FORMAT-ROT Breite-Richter ohne breite: true, an einem fremden Bereich, ohne „BREITE <Bereich> = …“",
            [{ breite: undefined }, { kriterium: "breite.nirgends" }, { quelle: "1 = irgendein Satz der Karte" }].every((x) => br(x).fehler.length && !br(x).stationen.length), JSON.stringify(br({ kriterium: "breite.nirgends" }).fehler));
        pruef("FORMAT-ROT befehl null in der fahrbaren Liste", n.fehler.some((f) => /gehört in module.exports.fehlt/.test(f)) && n.stationen.length === 1, n.fehler.join(" | "));
        const fl = pruefeFehlt([{ kriterium: "gelaende.K4", staffel: 2, befehl: null }, { kriterium: "gelaende.K4", staffel: 1, befehl: null, grund: "kein Werkzeug" }], karte, [st0]);
        pruef("FORMAT-ROT fehlt ohne Grund · fehlt zugleich fahrbar", fl.length === 2 && /grund fehlt/.test(fl[0]) && /zugleich fahrbare/.test(fl[1]), fl.join(" | "));
        // `beide`: eine Staffel 1, deren Text beide Geräte nennt, trägt es; nie an Staffel 2 oder an einem Gerät
        const pb = { ...st0, kriterium: "profiband.K1", geraet: ["radeon", "gtx"], gpu: true, zeit: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 },
            quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten", mass: () => [] };
        // DAS MASS (das Gesetz der Fremd-Last): eine Zeit-Station ohne mass und ohneMass, eine mit beiden, ein ohneMass ohne Grund, ein mass,
        // das keine Funktion ist, und ein Maß an einer Bild-Station — je ROT beim Namen; ohneMass mit Grund still
        const fm = (mut, basis = { ...pb, beide: true }) => pruefeStationen([{ ...basis, ...mut }], karte).fehler.join(" | ");
        const fmr = [fm({ mass: undefined }), fm({ ohneMass: "das Bild-Maß ohne k" }), fm({ mass: undefined, ohneMass: "kurz" }), fm({ mass: 3 }), fm({ mass: () => [] }, st0),
            fm({ mass: undefined, ohneMass: "das Bild-Maß ohne k" })];
        pruef("FORMAT-ROT das Maß: eine Zeit-Station ohne mass und ohneMass · mit beiden · ohneMass ohne Grund · mass keine Funktion · ein Maß an einer Bild-Station; ohneMass mit Grund still",
            fmr.slice(0, 2).every((x) => /trägt genau eines von mass und ohneMass/.test(x)) && /ohneMass ohne Grund/.test(fmr[2]) && /mass ist keine Funktion/.test(fmr[3]) &&
                /mass und ohneMass nur an einer Zeit-Station/.test(fmr[4]) && fmr[5] === "",
            fmr.join(" || "));
        const bf = [pb, { ...pb, beide: true, geraet: "radeon" }, { ...st0, staffel: 2, beide: true, geraet: ["radeon", "gtx"], gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }]
            .map((s) => pruefeStationen([s, ...(s.staffel === 2 ? [st0] : [])], karte).fehler.join(" | "));
        pruef("FORMAT-ROT die Staffel 1 nennt beide Geräte ohne beide · beide an einem Gerät · beide an Staffel 2",
            /nennt beide Geräte — beide: true/.test(bf[0]) && /beide nur als true/.test(bf[1]) && /beide nur als true/.test(bf[2]) && pruefeStationen([{ ...pb, beide: true }], karte).fehler.length === 0, bf.join(" || "));
        // DIE FAHRT (29.10., eine Fahrt durch jedes System ≤ 30 min je Gerät; 04.11. in höchstens FAHRT_TEILE_MAX Teilen): (a) ein befehl auf
        // einer Karte, (b) eine 80-min-Station und eine Probe über einem Teil der Fahrt in Teilen, (c) die Summe über FAHRT_TEILE_MAX Teilen —
        // jede Klasse ROT beim Namen, die Grenze selbst grün; KEINE Ausnahme je Station (pm-deckel: der Schlüssel `ausnahme` ist ROT)
        const fa = (mut) => pruefeStationen([{ ...pb, beide: true, ...mut }], karte).fehler.join(" | ");
        const tS = FAHRT_MAX_S - SITZUNG_BOOT_S;
        const fb = [fa({ befehl: ["node", "-e", "0"], probe: undefined, geraet: "gtx", beide: undefined }), fa({ probe: { befehl: ["node", "-e", "0"], sek: 4800 } }),
            fa({ probe: { befehl: ["node", "-e", "0"], sek: 900, teile: 2 } }), fa({ probe: { befehl: ["node", "-e", "0"], sek: 90, ausnahme: "der Grund beim Namen" } }),
            fa({ probe: { befehl: ["node", "-e", "0"], sek: 90 } }), fa({ probe: { befehl: ["node", "-e", "0"] } }), fa({ probe: { befehl: ["node", "-e", "0"], sek: tS } })];
        pruef("FAHRT-ROT (a) ein befehl auf gtx · (b) eine 80-min-Station, 900 s × 2 Teile über dem Teil der Fahrt, der Schlüssel ausnahme — je beim Namen; 90 s, ein ganzer Teil und die Vorgabe 45 s grün",
            /befehl auf gtx — eine Station der Karte misst nur als Probe/.test(fb[0]) && new RegExp("Deckel 4800 s × 1 Teil\\(e\\) über dem Teil der Fahrt " + tS + " s").test(fb[1]) &&
            new RegExp("Deckel 900 s × 2 Teil\\(e\\) über dem Teil der Fahrt " + tS + " s").test(fb[2]) && /probe trägt nur befehl, sek, mutiert, stellung, teile/.test(fb[3]) &&
            fb[4] === "" && fb[5] === "" && fb[6] === "" && probeSek({ probe: {} }) === PROBE_DECKEL_S, fb.join(" || "));
        const fp = (n, sek, ge = ["radeon", "gtx"], befehl = "p" + n) => ({ kriterium: "f.K" + n, staffel: 1, geraet: ge, gpu: true, probe: { befehl: ["node", befehl], sek } });
        // die Grenze aus den Konstanten: n × 45 + der Rest = FAHRT_TEILE_MAX × (FAHRT_MAX_S − Boot) (bis 04.11. EIN Teil: 38 × 45 + 30)
        const teilS = FAHRT_MAX_S - SITZUNG_BOOT_S, allS = FAHRT_TEILE_MAX * teilS;
        const nG = Math.floor((allS - 1) / PROBE_DECKEL_S), restG = allS - nG * PROBE_DECKEL_S;
        const grenze = Array.from({ length: nG }, (_, i) => fp(i + 1, PROBE_DECKEL_S)).concat([fp(nG + 1, restG)]);
        const zw = [fp(90, 45, ["radeon", "gtx"], "zw"), { ...fp(90, 45, ["radeon", "gtx"], "zw"), staffel: 2 }]; // Zwillinge: EIN Lauf
        const uf = [fahrtUrteil(grenze), fahrtUrteil([...grenze.slice(0, -1), fp(nG + 1, restG + 1)]), fahrtUrteil([...grenze.slice(0, nG - 1), ...zw, fp(nG + 1, restG)]),
            fahrtUrteil([...grenze.slice(0, nG - 2), fp(nG - 1, 90), fp(nG, 60), fp(nG + 1, restG)]), fahrtUrteil([...grenze.slice(0, -1), fp(nG + 1, restG + 1, ["radeon"])])];
        const ueber = "radeon: die Fahrt " + (allS + 1 + SITZUNG_BOOT_S) + " s in " + (FAHRT_TEILE_MAX + 1) + " Teilen über " + FAHRT_TEILE_MAX + " × " + FAHRT_MAX_S + " s (Σ Deckel " + (allS + 1) +
            " s in " + (nG + 1) + " Läufen + Boot " + SITZUNG_BOOT_S + " s) — die größten: ";
        // EIN Teil über FAHRT_MAX_S ist kein ROT mehr: zwei Teile, die Fortsetzung misst den zweiten (fahreFortsetzung)
        const einTeil = Array.from({ length: Math.floor(teilS / PROBE_DECKEL_S) }, (_, i) => fp(i + 1, PROBE_DECKEL_S)).concat([fp(999, teilS % PROBE_DECKEL_S + 1)]);
        pruef("FAHRT-ROT (c) Σ Deckel über " + FAHRT_TEILE_MAX + " Teilen je " + teilS + " s: die Grenze grün, 1 s darüber ROT je Karte mit den drei größten beim Namen, Zwillinge EIN Lauf, eine Karte allein; " +
            (teilS + 1) + " s sind zwei Teile, grün",
            uf[0].length === 0 && uf[1].length === 2 && uf[1][0].startsWith(ueber) && (uf[1][0].match(/f\.K\d+#1 \d+ s/g) || []).length === 3 &&
            new RegExp("^gtx: die Fahrt " + (allS + 1 + SITZUNG_BOOT_S) + " s").test(uf[1][1]) && uf[2].length === 0 && uf[3].length === 2 &&
            uf[3][0].includes("die größten: f.K" + (nG - 1) + "#1 90 s, f.K" + nG + "#1 60 s, f.K1#1 45 s") && uf[4].length === 1 && /^radeon: /.test(uf[4][0]) &&
            fahrtUrteil(einTeil).length === 0 && fahrtTeile(fahrtSumme(einTeil, "radeon")) === 2 && fahrtSumme(einTeil, "radeon").deckel === teilS + 1, JSON.stringify(uf));
        // DIE DECKEL-TAFEL (deckel.json, 01.11. mess-werkzeug): je Karte ihr Deckel in Fahrt und Läufer, ohne Eintrag probe.sek; nur an den
        // eigenen Karten, 0 s und über einem Teil der Fahrt ROT beim Namen; der Abdruck ohne Eintrag Byte für Byte wie bisher, mit Eintrag ein anderer
        const jk = (mut = {}) => ({ ...pb, beide: true, probe: { befehl: ["node", "-e", "0"], sek: 10, ...mut } });
        const mitTafel = (t, f) => { deckelTafel = t; try { return f(); } finally { deckelTafel = {}; } };
        const abd0 = abdruck(jk(), "hilfe");
        const jf = [mitTafel({ radeon: { "profiband.K1#1": 40 } }, () => [fa({ probe: jk().probe }), fahrtSumme([jk()], "radeon").deckel, fahrtSumme([jk()], "gtx").deckel,
            probeSek(jk(), "radeon"), probeSek(jk(), "gtx"), abdruck(jk(), "hilfe", "radeon"), abdruck(jk(), "hilfe", "gtx"), abdruck(jk(), "hilfe")]),
            mitTafel({ radeon: { "profiband.K1#1": 1800 } }, () => [fa({ probe: jk().probe }), mitTafel({ radeon: { "profiband.K1#1": 60 } }, () => fa({ probe: jk().probe }))]),
            mitTafel({ gtx: { "profiband.K1#1": 0 } }, () => fa({ probe: jk().probe })), mitTafel({ gtx: { "profiband.K1#1": 20 } }, () => fa({ geraet: "radeon", beide: undefined, probe: jk().probe }))];
        pruef("DECKEL-TAFEL je Karte ihr Deckel (Fahrt, Läufer), ohne Eintrag probe.sek; 1800 s über dem Teil der Fahrt, 0 s, eine fremde Karte ROT beim Namen, 60 s grün; der Abdruck je Karte: nur der Eintrag DIESER Karte ändert ihn",
            jf[0][0] === "" && jf[0][1] === 40 && jf[0][2] === 10 && jf[0][3] === 40 && jf[0][4] === 10 && jf[0][5] !== abd0 && jf[0][6] === abd0 && jf[0][7] === abd0 && abdruck(jk(), "hilfe", "radeon") === abd0 &&
            /Deckel 1800 s × 1 Teil\(e\) über dem Teil der Fahrt/.test(jf[1][0]) && jf[1][1] === "" && /deckel.json: .* je Karte eine ganze Zahl ≥ 1/.test(jf[2]) && /deckel.json: {"gtx":20}/.test(jf[3]),
            JSON.stringify(jf));
        const echtGross = ladeStationen().map((s) => (s.probe ? { ...s, probe: { ...s.probe, sek: 90 } } : s));
        const eg = pruefeStationen(echtGross, karte).fehler.filter((f) => /^(radeon|gtx): die Fahrt/.test(f));
        pruef("FAHRT-ROT an der echten Liste: jeder Deckel auf 90 s gebläht reißt die " + FAHRT_TEILE_MAX + " Teile der Fahrt beider Karten (liste, run und buchen fallen dort)",
            eg.length === 2 && eg.every((f) => /die größten: /.test(f)), eg.join(" | "));
    }
    // (3) Läufer: grün / rot / Absturz / Deckel / Urteil ungültig / GPU ohne Schloss / GPU über das Schloss
    const ctx = (n) => ({ baum: tmp, koord: KOORD, port: null, aus: path.join(tmp, n + ".json"), roh: path.join(tmp, n + ".out"), geraet: "radeon", bash: findeBash(), gpuLauf: null, deckelMinS: 0 });
    const schreib = (wert) => ["node", "-e", "require('fs').writeFileSync(process.argv[1], JSON.stringify(" + JSON.stringify(wert) + "))", "{AUS}"];
    const lies = (j) => ({ gruen: j.n === 0, zahl: "n " + j.n });
    let e = await fahreStation({ ...st0, befehl: schreib({ n: 0 }), urteil: lies }, ctx("gruen"));
    pruef("LÄUFER grün", e.gruen === true && e.zahl === "n 0" && e.exit === 0, JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: schreib({ n: 3 }), urteil: lies }, ctx("rot"));
    pruef("LÄUFER rot", e.gruen === false && /ROT: n 3/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: ["node", "-e", "process.exit(3)"], urteil: lies }, ctx("absturz"));
    pruef("LÄUFER ein Urteil, das am Lauf ohne Ausgabe wirft, bleibt ROT beim Namen (kaputt: laut, nie gehalten)", e.gruen === false && !e.ungemessen && e.exit === 3 && /Urteil warf/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, minuten: 0.01, befehl: ["node", "-e", "console.log('SCHRITT /umstellen 41.3 s'); setTimeout(()=>{}, 60000)"], urteil: () => ({ gruen: true, zahl: "still" }) }, ctx("deckel"));
    pruef("LÄUFER Deckel, beim Namen der letzten Zeile", e.gruen === false && /Deckel .* \(zuletzt: SCHRITT \/umstellen 41\.3 s\)$/.test(e.grund), JSON.stringify(e));
    // ein Enkel erbt das Rohr und schläft 20 s (wie ein Herzschlag `( while sleep 300 … ) &` ohne Umleitung): die Station endet
    // mit ihrem Prozess (am alten Läufer: close nach 20,5 s, exit nach 0,46 s)
    e = await fahreStation({ ...st0, befehl: ["bash", "-c", "( sleep 20 ) & echo '{\"n\": 0}' > \"$1\"", "enkel", "{AUS}"], urteil: lies }, ctx("enkel"));
    pruef("LÄUFER ein Enkel mit dem Rohr hält die Station nicht (Ende am Prozess, nie am Rohr)", e.gruen === true && e.minuten < 0.25, JSON.stringify(e));
    e = await fahreStation({ ...st0, env: { LINSE_GPU: "hardware" }, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: true, zahl: l.stdout.trim() || "leer" }) }, ctx("karte"));
    const e2 = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: l.stdout.trim() === "software", zahl: l.stdout.trim() || "leer" }) }, ctx("soft"));
    pruef("LÄUFER headless fährt LINSE_GPU=software, nie die Karte", e.gruen === false && /LINSE_GPU=software/.test(e.grund) && e2.gruen === true, JSON.stringify([e, e2]));
    e = await fahreStation({ ...st0, urteil: () => ({ gruen: 1, zahl: "" }) }, ctx("ungueltig"));
    pruef("LÄUFER Urteil ungültig", e.gruen === false && /Urteil ungültig/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: schreib({ n: 0 }), urteil: lies }, ctx("ohne-schloss"));
    pruef("LÄUFER GPU ohne Schloss läuft nie", e.gruen === false && /gpu-lauf.sh fehlt/.test(e.grund) && !fs.existsSync(path.join(tmp, "ohne-schloss.json")), JSON.stringify(e));
    if (findeBash()) {
        const falsch = path.join(tmp, "gpu-lauf.sh");
        fs.writeFileSync(falsch, '#!/bin/bash\nN="$1"; shift\necho "schloss $N $GPU_LAUF_MAX_S"\n"$@"\n');
        const c = { ...ctx("schloss"), gpuLauf: falsch };
        const mitKarte = (zeilen) => ["node", "-e", "for (const z of " + JSON.stringify(zeilen) + ") console.log(z); require('fs').writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))", "{AUS}"];
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: (j, l) => ({ gruen: j.n === 0 && /schloss punkte-radeon-1 120/.test(l.stdout), zahl: l.stdout.trim().split("\n")[0] }) }, { ...c, deckelMinS: 120 });
        pruef("LÄUFER GPU über das Schloss", e.gruen === true && e.gpu === "amd/rdna-3", JSON.stringify(e));
        // (3c) DAS SCHLOSS DES RECHNERS: headless nimmt einen Platz (bild) neben den Bahnen der Karte, ohne Karte und ohne Zeugen
        e = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU + ' ' + process.env.GPU_LAUF_ART)"],
            urteil: (j, l) => ({ gruen: /schloss punkte-headless-1 120/.test(l.stdout) && /software bild/.test(l.stdout), zahl: l.stdout.trim().split("\n").join(" | ") }) },
            { ...c, geraet: "headless", deckelMinS: 120 });
        pruef("LÄUFER headless nimmt einen Platz im Schloss des Rechners (ein Zeit-Lauf misst allein), nie die Karte", e.gruen === true && e.gpu === undefined, JSON.stringify(e));
        // (3b) DIE WAND GPU: ohne Zeugen der Karte, mit Software-Adapter, mit „zeichnet nie" ROT; der Zeuge aus dem Log eines Kindes GRÜN
        const gs = { ...st0, geraet: "radeon", gpu: true, urteil: lies };
        e = await fahreStation({ ...gs, befehl: schreib({ n: 0 }) }, { ...ctx("ohne-zeugen"), gpuLauf: falsch });
        pruef("WAND GPU ohne Zeugen der Karte → ROT", e.gruen === false && /Wand GPU: keine Linse nennt eine Karte/.test(e.grund) && e.gpu === null, JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] google/swiftshader"]) }, { ...ctx("software"), gpuLauf: falsch });
        pruef("WAND GPU Software-Adapter → ROT", e.gruen === false && /ohne Karte \(\[linse-gpu\] google\/swiftshader\)/.test(e.grund), JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] amd/rdna-3", "[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“"]) }, { ...ctx("nie"), gpuLauf: falsch });
        pruef("WAND GPU die Linse zeichnet nie → ROT", e.gruen === false && /Wand GPU: die Linse zeichnet nie/.test(e.grund) && e.gpuNie === 1, JSON.stringify(e));
        const kind = "const cp = require('child_process'), fs = require('fs'); const fd = fs.openSync(process.argv[1] + '.log', 'w'); " +
            "cp.spawnSync(process.execPath, ['-e', " + JSON.stringify("console.log('[linse-gpu] nvidia/pascal')") + "], { stdio: ['ignore', fd, 'inherit'] }); " +
            "fs.writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))";
        e = await fahreStation({ ...gs, befehl: ["node", "-e", kind, "{AUS}"], urteil: (j, l) => ({ gruen: j.n === 0 && /^\[linse-gpu\] nvidia\/pascal$/m.test(l.stdout), zahl: "n " + j.n }) }, { ...ctx("kind"), gpuLauf: falsch });
        pruef("WAND GPU der Zeuge liest das Log eines Kind-Prozesses, das Urteil sieht seinen Adapter → GRÜN", e.gruen === true && e.gpu === "nvidia/pascal", JSON.stringify(e));
        // (3a) EIN BLOCKIERTES SCHLOSS IST KEINE MESSUNG: Exit 75 und ein gpu-lauf.sh, das beim Warten schweigt, sind ungemessen beim
        // Grund — nie ROT in m.je, und `run --offen` (frischUrteil) misst die Station neu; ein Lauf AM Schloss schweigt, so lang er will
        const c2 = { ...ctx("blockiert"), gpuLauf: path.join(tmp, "blockiert.sh") };
        fs.writeFileSync(c2.gpuLauf, "#!/bin/bash\necho 'SCHLOSS BLOCKIERT von Nachtruhe 0325-0415 nach 2701 s Warten'\nexit 75\n");
        const sg = { ...st0, geraet: "radeon", gpu: true, urteil: () => ({ gruen: true, zahl: "x" }) };
        e = await fahreStation(sg, c2);
        const mb = { sha: "b1", geraet: "radeon", je: {} };
        eintragen(mb, "gelaende.K4#1", { ...e, zeit: "2026-10-26T02:11:00Z", abdruck: abdruck(sg, "h") });
        const fr = frischUrteil([mb], () => [], "h")(sg, "radeon");
        const nachher = { ...mb, je: { ...mb.je }, ungemessen: { ...mb.ungemessen } };
        eintragen(nachher, "gelaende.K4#1", { gruen: true, zahl: "z", exit: 0, minuten: 1 });
        pruef("LÄUFER GPU-Schloss blockiert (Exit 75) ist UNGEMESSEN beim Namen, nie ROT in der Messung — run --offen misst neu",
            e.ungemessen === true && e.gruen === false && /Schloss blockiert.*Nachtruhe 0325-0415/.test(e.grund) && !mb.je["gelaende.K4#1"] &&
            !!mb.ungemessen["gelaende.K4#1"] && fr.ungemessen === true && /R10/.test(fr.grund) && nachher.je["gelaende.K4#1"].gruen && !nachher.ungemessen,
            JSON.stringify([e, mb, fr]));
        const c3 = { ...ctx("schweigt"), gpuLauf: path.join(tmp, "schweigt.sh"), stillS: 2 };
        fs.writeFileSync(c3.gpuLauf, "#!/bin/bash\necho 'gpu-lauf: probe (bild) wartet auf ?' >&2\nsleep 60\n");
        e = await fahreStation(sg, c3);
        // der Wächter 12 s, am Schloss 18 s still (29.10.: mit 3 s gegen 9 s riss der Fall am Laptop unter Last — die bash des Stubs
        // startete erst nach 3 s, der Wächter vor dem Schloss schlug zu; Lehre 26, nie die Wanduhr knapp)
        const c4 = { ...ctx("am-schloss"), gpuLauf: path.join(tmp, "am-schloss.sh"), stillS: 12 };
        fs.writeFileSync(c4.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: Schloss $N (bild, Platz 1 von 2) nach 0 s" >&2\nsleep 18\n"$@"\n');
        const e4 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c4, deckelMinS: 120 });
        pruef("LÄUFER ein Schloss, das nie kommt (gpu-lauf.sh schweigt beim Warten), ist UNGEMESSEN; der Deckel zählt erst ab dem Schloss",
            e.ungemessen === true && /nie bekommen: gpu-lauf.sh schwieg 2 s/.test(e.grund) && e4.gruen === true && !e4.ungemessen, JSON.stringify([e, e4]));
        // (3e) DAS WARTEN: die Minuten bis zur Zeile „gpu-lauf: Schloss …“ stehen als `warten` neben `minuten` (die Arbeit ist die Differenz)
        const c5 = { ...ctx("wartet"), gpuLauf: path.join(tmp, "wartet.sh"), stillS: 30 };
        fs.writeFileSync(c5.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: $N (zeit) wartet auf Vorfahrt" >&2\nsleep 3\necho "gpu-lauf: Schloss $N (zeit) nach 3 s" >&2\n"$@"\n');
        const e5 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c5, deckelMinS: 120 });
        pruef("LÄUFER das Warten am Schloss steht als `warten` (3 s vor dem Schloss), ein Lauf ohne Schloss trägt keins",
            e5.gruen === true && e5.warten >= 0.05 && e5.warten <= e5.minuten && typeof e4.warten === "number" && !("warten" in e2), JSON.stringify([e5, e4.warten, e2]));
    } else pruef("LÄUFER GPU über das Schloss", false, "keine Git-bash");
    // (3d) DER LESER zug.cjs (artifacts/profiband/werkzeug/zug.cjs, punkte(): Fortschritt der Radeon nach zug/fortschritt-radeon.txt) —
    // seine Muster wörtlich: Start und Station in dem Format, das er liest; ein ungemessener Lauf ist weder GRÜN noch ROT noch toter
    // Glob (26.10.: „· allein“ am Zeilenende, n blieb 0, jede ROT-Zeile zählte als toter Glob)
    {
        const START = /^Punkte-Maschine: (\d+) Station\(en\) in /, STATION = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/, TOT = /^  ROT  (\S+) · /;
        const gs = [[{ ...st0, minuten: 2 }], [{ ...st0, minuten: 3, zeit: true }]];
        const s = startZeile(7, gs, "radeon", "0123456789abcdef", 3) + " (Baum x)";
        const z = [stationsZeile("a.K1#1", { gruen: true, zahl: "z · 3", exit: 0, minuten: 1.5, bahn: "2/3" }),
            stationsZeile("a.K1#2", { gruen: false, zahl: "rot", exit: 1, minuten: 0.4, bahn: "allein", zwilling: "a.K1#1" }),
            stationsZeile("a.K1#3", { gruen: false, ungemessen: true, grund: "GPU-Schloss blockiert", exit: 75, minuten: 45, bahn: "1/3" })];
        const t = z.map((l) => STATION.exec(l));
        pruef("LESER zug.cjs: Start- und Stationszeilen im gelesenen Format, ungemessen ist weder GRÜN noch ROT",
            (START.exec(s) || [])[1] === "7" && !!t[0] && t[0][2] === "a.K1#1" && t[0][3] === "1.5" && !!t[1] && t[1][1] === "ROT " && !!t[1][4] &&
            !t[2] && !TOT.test(z[2]) && !/^  (GRÜN|ROT)/.test(z[2]), JSON.stringify([s, ...z]));
    }
    // (3c) DIE BAHNEN: das Platz-Schloss, das run fährt (GPU_LAUF, EINE Quelle), mit Stub-Befehlen, je Fall ein eigenes Schloss in
    // tmp (nie das der Karte, nie ein echter CI-Job: GPU_WORKER_BILD, GPU_HOOK_LOG, GPU_NACHT eigen). Das Urteil ist die REIHENFOLGE
    // der Ereignisse im Log (S = Start unter dem Schloss, E = Ende), nie die Wanduhr (Lehre 26; 26.10. auf dem Laptop: einen Platz
    // nehmen dauerte 2,9–3,8 s, die Fenster von 500/800 ms rissen): ein Stub hält seinen Platz, bis seine Tür (eine Datei) aufgeht
    // oder sein Partner unter dem Schloss steht; der Test öffnet eine Tür erst, wenn der Wartende sein Warten gemeldet hat. Auch die
    // Wächter zählen Ereignisse (27.10., Karte ci-wackler-zensus: unter Last rissen die 120-s-Fenster von bis und die 60-s-Schleifen
    // des Stubs, ruhig 64/64): bis wartet, solange der Lauf lebt, der das Ereignis bringt, der Stub auf Tür oder Partner (dessen
    // Lauf endet, ohne zu stehen, schreibt der Test „X“); ein Lauf, der nie kommt, endet am Schloss mit Exit 75 beim Namen
    if (ohne.has("3c")) console.log("  OHNE (3c) DIE BAHNEN (--ohne 3c)");
    else if (findeBash()) {
        const wz = GPU_LAUF;
        const fw = (p) => p.split(path.sep).join("/");
        const schlossEnv = (n) => ({ GPU_SCHLOSS: fw(path.join(tmp, "bahn-" + n)), GPU_HOOK_LOG: fw(path.join(tmp, "bahn-" + n + ".hook.log")),
            GPU_NACHT: "", GPU_WORKER_BILD: "Kein.Worker.exe", GPU_LAUF_TAKT_S: "1" });
        // $1 Log · $2 wer · $3 {AUS} oder leer · $4 Tür oder leer · $5 Partner oder leer (er steht „S“ oder kam nie „X“)
        const STUB = 'echo "[linse-gpu] amd/rdna-3"; echo "S $2" >> "$1"; ' +
            'while [ -n "$4" ] && [ ! -e "$4" ]; do sleep 0.1; done; ' +
            'while [ -n "$5" ] && ! grep -qx "[SX] $5" "$1"; do sleep 0.1; done; ' +
            'echo "E $2" >> "$1"; [ -n "$3" ] && echo "{\\"n\\": 0}" > "$3"; true';
        // je Lauf die Zeilen-Stelle seines S und E im Log
        const spannen = (log) => {
            const m = {};
            (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "").split(/\r?\n/).forEach((z, i) => {
                const x = /^([SE]) (\S+)$/.exec(z.trim());
                if (x) (m[x[2]] = m[x[2]] || {})[x[1]] = i;
            });
            return m;
        };
        const spanne = (a) => !!a && a.S != null && a.E != null;
        const ueber = (a, b) => spanne(a) && spanne(b) && a.S < b.E && b.S < a.E;
        const nach = (a, b) => spanne(a) && spanne(b) && a.S > b.E;
        const warte = (ms) => new Promise((r) => setTimeout(r, ms));
        // wartet auf ein Ereignis, solange der Lauf r lebt, der es bringt — endet er ohne, ist es false (ROT mit seinem Exit)
        const bis = async (f, r) => { while (!f()) { if (r.code !== undefined) return f(); await warte(100); } return true; };
        // ein fremder Lauf: gpu-lauf.sh direkt, wie ein Macher oder ein zweiter Läufer ihn ruft
        const lauf = (env, art, n, wer, log, tuer = "") => {
            const r = { out: "", err: "", code: undefined };
            r.k = spawn(findeBash(), [wz, "probe-" + wer, "bash", "-c", STUB, "stub", fw(log), wer, "", tuer && fw(tuer), ""],
                { env: { ...process.env, ...env, GPU_LAUF_ART: art, GPU_LAUF_PLAETZE: String(n) }, windowsHide: true });
            r.k.stdout.setEncoding("utf8");
            r.k.stderr.setEncoding("utf8");
            r.k.stdout.on("data", (d) => (r.out += d));
            r.k.stderr.on("data", (d) => (r.err += d));
            r.fertig = new Promise((ok) => { r.k.on("close", (c) => ok((r.code = c))); r.k.on("error", () => ok((r.code = -1))); });
            return r;
        };
        const wartet = (r) => () => /wartet auf/.test(r.err);
        const steht = (log, wer) => () => !!spannen(log)[wer];
        // (a) der Bahn-Plan über den Läufer: Zeit allein auf Bahn 0, danach zwei Bild-Gruppen, die einander unter dem Schloss
        // erwarten — sie enden nur, wenn beide zugleich einen Platz halten
        const planFall = (async () => {
            const env = schlossEnv("plan"), log = path.join(tmp, "bahn-plan.log");
            const G = (wer, zeit, partner) => [{ ...st0, geraet: ["radeon", "gtx"], gpu: true, zeit, env, befehl: ["bash", "-c", STUB, "stub", fw(log), wer, "{AUS}", "", partner], urteil: lies }];
            const es = [];
            // der Deckel des Läufers ist nur der Wächter (eine Stunde), nie das Maß: A hält seinen Platz, bis B steht
            await fahrePlan([G("A", false, "B"), G("Z", true, ""), G("B", false, "A")], 2, async (g, b) => {
                es.push(await fahreGruppe(g, { ...ctx("plan-" + g[0].befehl[5]), gpuLauf: wz, bahn: b, plaetze: 2, deckelMinS: 3600 }));
                if (!spannen(log)[g[0].befehl[5]]) fs.appendFileSync(log, "X " + g[0].befehl[5] + "\n");
            });
            const sp = spannen(log);
            return ["BAHNEN der Plan: zwei Bild-Läufe halten zugleich je einen Platz, der Zeit-Lauf fährt allein (Läufer + Platz-Schloss, N = 2)",
                ueber(sp.A, sp.B) && nach(sp.A, sp.Z) && nach(sp.B, sp.Z) && es.length === 3 && es.every((r) => r[0].gruen) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " " + es.map((r) => r[0].zahl).join(" | ")];
        })();
        // (b) fremde Läufe am Schloss: Bild X hält einen Platz, Zeit Z wartet auf ALLE Plätze, Bild Y kommt danach und tritt nicht bei,
        // solange Z wartet (Vorrang, beim Namen) — Z überlappt nie
        const zeitFall = (async () => {
            const env = schlossEnv("zeit"), log = path.join(tmp, "bahn-zeit.log"), tuer = path.join(tmp, "bahn-zeit.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"), x)];
            const z = lauf(env, "zeit", 2, "Z", log);
            ev.push(await bis(wartet(z), z));
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([x.fertig, z.fertig, y.fertig]);
            const sp = spannen(log);
            return ["BAHNEN ein Zeit-Lauf wartet auf alle Plätze, ein späterer Bild-Lauf tritt nicht vor ihm bei und nennt den Vorrang beim Namen",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Z, sp.X) && nach(sp.Y, sp.Z) && /wartet auf Vorrang: 'probe-Z'/.test(y.err) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/") + " · Y: " + y.err.trim().split("\n")[0]];
        })();
        // (c) N = 1 ist das Ein-Platz-Schloss von vorher: der zweite Bild-Lauf wartet, bis der erste geht
        const einFall = (async () => {
            const env = schlossEnv("eins"), log = path.join(tmp, "bahn-eins.log"), tuer = path.join(tmp, "bahn-eins.tuer");
            const p = lauf(env, "bild", 1, "P", log, tuer);
            const ev = [await bis(steht(log, "P"), p)];
            const q = lauf(env, "bild", 1, "Q", log);
            ev.push(await bis(wartet(q), q));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([p.fertig, q.fertig]);
            const sp = spannen(log);
            return ["BAHNEN N = 1: zwei Bild-Läufe überlappen nie (das alte Schloss)",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Q, sp.P), JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/")];
        })();
        // (d) VORFAHRT: ein wartender CI-Job (hook.log) hält jeden neuen Platz an, auch einen freien; der Hook nimmt das Schloss,
        // sobald der letzte Platz geht, und erst nach ihm fährt der neue Bild-Lauf
        const ciFall = (async () => {
            const env = schlossEnv("ci"), log = path.join(tmp, "bahn-ci.log"), tuer = path.join(tmp, "bahn-ci.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"), x)];
            fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:00 start ci-probe 1/1 echt: wartet auf Schloss von 'probe-X'\r\n");
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
            fs.writeFileSync(tuer, "");
            await x.fertig;
            const hook = await bis(() => { try { fs.mkdirSync(env.GPU_SCHLOSS); return true; } catch (_e) { return false; } }, y);
            if (hook) {
                fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "ci-probe 1/1 echt\npid=" + process.pid + "\n");
                fs.appendFileSync(log, "S H\n");
                fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:05 start ci-probe 1/1 echt: Schloss genommen\r\n");
                fs.appendFileSync(log, "E H\n");
                fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            }
            const codes = [x.code, await y.fertig];
            const sp = spannen(log);
            return ["BAHNEN VORFAHRT: ein wartender CI-Job hält den freien Platz an und bekommt das Schloss, der neue Bild-Lauf fährt nach ihm",
                ev.every(Boolean) && hook && codes.every((c) => c === 0) && nach(sp.H, sp.X) && nach(sp.Y, sp.H) && /Vorfahrt: ein CI-Job wartet/.test(y.err),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Hook " + hook + " Exit " + codes.join("/")];
        })();
        // (e) DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden (die Hooks lösen ein Schloss mit toter pid)
        const vertreterFall = (async () => {
            const env = schlossEnv("vertreter"), log = path.join(tmp, "bahn-vertreter.log");
            const [t1, t2] = [1, 2].map((i) => path.join(tmp, "bahn-vertreter-" + i + ".tuer"));
            const v1 = lauf(env, "bild", 2, "V1", log, t1);
            const ev = [await bis(steht(log, "V1"), v1)];
            const v2 = lauf(env, "bild", 2, "V2", log, t2);
            ev.push(await bis(steht(log, "V2"), v2));
            fs.writeFileSync(t1, "");
            const c1 = await v1.fertig;
            const b = fs.existsSync(path.join(env.GPU_SCHLOSS, "besitzer.txt")) ? fs.readFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "utf8") : "";
            fs.writeFileSync(t2, "");
            const c2 = await v2.fertig;
            const sp = spannen(log);
            return ["BAHNEN DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden mit pid (die Hooks lösen sonst)",
                ev.every(Boolean) && c1 === 0 && c2 === 0 && ueber(sp.V1, sp.V2) && /^probe-V2\r?\npid=\d+/.test(b) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(b) + " " + JSON.stringify(sp) + " Exit " + c1 + "/" + c2];
        })();
        // (f) DIE NACHTRUHE zählt nie zur Warte-Frist (26.10.: 50 min Nacht > 45 min Frist, Exit 75 um 04:11, ROT in der Messung):
        // N wartet in der Nacht mit Frist 0 und läuft nie aus, während zwei Läufe ohne Nacht am selben Schloss nacheinander mit
        // Exit 75 enden — beim Namen des Halters
        const nachtFall = (async () => {
            const env = schlossEnv("nacht"), log = path.join(tmp, "bahn-nacht.log");
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "probe-halter\npid=" + process.pid + "\n");
            const n = lauf({ ...env, GPU_NACHT: "0000-2400", GPU_LAUF_WARTE_S: "0" }, "bild", 2, "N", log);
            const ev = [await bis(() => /wartet auf Nachtruhe 0000-2400/.test(n.err), n)];
            const a1 = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A1", log);
            const c1 = await a1.fertig;
            const c2 = await lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A2", log).fertig;
            const lebt = n.code === undefined;
            baumTot(n.k.pid);
            await n.fertig;
            fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            return ["SCHLOSS die Nachtruhe zählt nie zur Warte-Frist: wer in der Nacht wartet, läuft nicht aus; ohne Nacht endet das Warten mit Exit 75 beim Namen",
                ev[0] && lebt && c1 === 75 && c2 === 75 && /^SCHLOSS BLOCKIERT von probe-halter /m.test(a1.out) && !spannen(log).N,
                "Nacht wartet " + ev[0] + " · lebt " + lebt + " (Exit " + n.code + ") · A " + c1 + "/" + c2 + " · " + a1.out.trim() + " · N: " + n.out.trim()];
        })();
        // (g) DER VORRANG fällt nach derselben Verwaist-Regel wie besitzer.txt und platz.k: ein Eintrag älter als der Systemstart
        // (seine pid lebt, neu vergeben) sperrt nicht; ein haltender Vorrang steht beim Namen in Exit 75
        const vorrangFall = (async () => {
            const env = schlossEnv("vorrang"), log = path.join(tmp, "bahn-vorrang.log");
            const vd = env.GPU_SCHLOSS + ".vorrang", alt = vd + "/" + process.pid;
            fs.mkdirSync(vd, { recursive: true });
            fs.writeFileSync(alt, "probe-alt\npid=" + process.pid + "\n");
            fs.utimesSync(alt, new Date("2001-01-01T00:00:00Z"), new Date("2001-01-01T00:00:00Z"));
            const p = lauf({ ...env, GPU_LAUF_WARTE_S: "20" }, "bild", 2, "P", log);
            const cp = await p.fertig;
            const weg = !fs.existsSync(alt);
            fs.writeFileSync(alt, "probe-zeit\npid=" + process.pid + "\n");
            const q = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "Q", log);
            const cq = await q.fertig;
            fs.rmSync(vd, { recursive: true, force: true });
            const sp = spannen(log);
            return ["SCHLOSS der Vorrang fällt nach der Verwaist-Regel (älter als der Systemstart), ein haltender Vorrang steht beim Namen in Exit 75",
                cp === 0 && weg && spanne(sp.P) && /verwaister Vorrang 'probe-alt' geloest - älter als der Systemstart/.test(p.err) &&
                cq === 75 && /^SCHLOSS BLOCKIERT von Vorrang: 'probe-zeit'/m.test(q.out) && !sp.Q,
                "P Exit " + cp + " weg " + weg + " · " + p.err.trim().split("\n").filter((l) => /Vorrang/.test(l)).join(" ") + " · Q Exit " + cq + " · " + q.out.trim()];
        })();
        // (h)–(j) DER WARTENDE BRICHT ES (10.11., Auftrag gpu-stufe K10, Gebot 10): die OMEN stand 28 min an einem Schloss mit toter pid,
        // ein Radeon-Hook 25 min an „ci-runner A“ ohne pid, während er selbst (Job B) der lebende Runner.Worker war. Als „Worker“ dient
        // hier die laufende bash (GPU_WORKER_BILD), als Hook B der Test, der nur mkdir versucht und selbst nichts bricht
        const vl = (r) => r.err.trim().split("\n").filter((l) => /VERWAIST/.test(l)).join(" ");
        const hookZeilen = (env, ...z) => fs.appendFileSync(env.GPU_HOOK_LOG, z.map((x) => "2026-11-10 " + x + "\r\n").join(""));
        // (h) „ci-runner A“ liegt (29 Byte, keine pid), hook.log nennt B: ein Wartender bricht A, und B hat das Schloss in ≤ 60 s
        const waiseCiFall = (async () => {
            const env = { ...schlossEnv("waise-ci"), GPU_WORKER_BILD: path.basename(findeBash()) }, log = path.join(tmp, "bahn-waise-ci.log");
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "ci-runner 111/1 echt");
            hookZeilen(env, "00:00:00 start ci-runner 111/1 echt: Schloss genommen (refs/heads/a)", "00:20:00 start ci-runner 222/1 echt: wartet auf Schloss von 'ci-runner 111/1 echt'");
            const t0 = Date.now(), w = lauf(env, "zeit", 1, "W", log);
            let hook = false;
            while (!hook && Date.now() - t0 < 60e3) {
                try {
                    fs.mkdirSync(env.GPU_SCHLOSS);
                    hook = true;
                } catch (_e) {
                    await warte(200);
                }
            }
            const ms = Date.now() - t0;
            baumTot(w.k.pid);
            await w.fertig;
            fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            return ["SCHLOSS ein Läufer fährt einen Job: liegt „ci-runner A“, während hook.log B nennt, bricht der Wartende A, und B hat das Schloss in ≤ 60 s",
                hook && /VERWAIST: Halter 'ci-runner 111\/1 echt' \(der Läufer fährt 'ci-runner 222\/1 echt'\) tot — Schloss gelöst/.test(w.err) && !spannen(log).W,
                "B nach " + ms + " ms (" + hook + ") · W: " + vl(w)];
        })();
        // (i) „ci-runner B“ hält und hook.log nennt B: keiner bricht, der Wartende endet mit Exit 75 bei der Vorfahrt
        const haeltCiFall = (async () => {
            const env = { ...schlossEnv("haelt-ci"), GPU_WORKER_BILD: path.basename(findeBash()) }, log = path.join(tmp, "bahn-haelt-ci.log");
            const b = path.join(env.GPU_SCHLOSS, "besitzer.txt");
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(b, "ci-runner 222/1 echt");
            hookZeilen(env, "00:00:00 start ci-runner 111/1 echt: Schloss genommen (refs/heads/a)", "00:20:00 start ci-runner 222/1 echt: verwaistes Schloss 'ci-runner 111/1 echt' geloest",
                "00:20:01 start ci-runner 222/1 echt: Schloss genommen (refs/heads/b)");
            const w = lauf({ ...env, GPU_LAUF_WARTE_S: "3" }, "zeit", 1, "W", log);
            const c = await w.fertig;
            const steht = fs.existsSync(b) && fs.readFileSync(b, "utf8") === "ci-runner 222/1 echt";
            fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            return ["SCHLOSS ein Läufer fährt einen Job: hält „ci-runner B“ und hook.log nennt B, bricht keiner (Exit 75 bei der Vorfahrt)",
                c === 75 && steht && !/VERWAIST/.test(w.err) && !spannen(log).W, "Exit " + c + " · steht " + steht + " · " + w.out.trim() + " " + vl(w)];
        })();
        // (j) ein Halter mit toter pid: der Wartende bricht und ÜBERNIMMT das Schloss in ≤ 60 s, beim Namen (der lebende Halter lässt
        // ihn warten: (f), Exit 75 beim Namen)
        const totFall = (async () => {
            const env = schlossEnv("tot"), log = path.join(tmp, "bahn-tot.log");
            const k = spawn(findeBash(), ["-c", "exit 0"], { windowsHide: true });
            const tot = await new Promise((ok) => k.on("close", () => ok(k.pid)));
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "probe-tot\npid=" + tot + "\n");
            const t0 = Date.now(), w = lauf({ ...env, GPU_LAUF_WARTE_S: "60" }, "zeit", 1, "T", log);
            const c = await w.fertig;
            const ms = Date.now() - t0, sp = spannen(log);
            return ["SCHLOSS der Wartende bricht ein Schloss mit toter pid und übernimmt es in ≤ 60 s (VERWAIST beim Namen)",
                c === 0 && spanne(sp.T) && ms <= 60e3 && !fs.existsSync(env.GPU_SCHLOSS) &&
                new RegExp("VERWAIST: Halter 'probe-tot' \\(Halter pid=" + tot + " lebt nicht\\) tot — Schloss übernommen von 'probe-T'").test(w.err),
                "Exit " + c + " nach " + ms + " ms · " + vl(w)];
        })();
        for (const [name, ok, was] of await Promise.all([planFall, zeitFall, einFall, ciFall, vertreterFall, nachtFall, vorrangFall, waiseCiFall, haeltCiFall, totFall])) pruef(name, ok, was);
    } else pruef("BAHNEN Platz-Schloss", false, "keine Git-bash");
    // (4) Glob
    const gl = [["stamm/kreatur-leben.js", ["stamm/kreatur-*.js"], true], ["stamm/x/kreatur-a.js", ["stamm/kreatur-*.js"], false],
        ["scripts/lib/a/b.cjs", ["scripts/**"], true], ["koerper-core.js", ["koerper-core.js"], true], ["koerper-core.jsx", ["koerper-core.js"], false],
        ["worlds/klang/a.js", ["worlds/klang/"], true], ["stamm/a.js", ["**/a.js"], true]];
    pruef("GLOB Abgleich", gl.every(([f, p, s]) => trifftPfad(f, p) === s), gl.filter(([f, p, s]) => trifftPfad(f, p) !== s).map((x) => x[0]).join(", "));
    // (5) Buchung
    const h = "hilfe";
    const s1 = { ...st0, geraet: ["radeon", "gtx"], gpu: true, pfad: ["stamm/wasser-*.js"] };
    const s2 = { ...s1, staffel: 2, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" };
    const M = (sha, g, id, st, gruen, zeit = "2026-10-23T10:00:00Z", gpu = { gpu: "amd/rdna-3" }) => ({ sha, geraet: g, je: { [id]: { gruen, zahl: gruen ? "z" : "rot", zeit, abdruck: abdruck(st, h), ...gpu } } });
    const keine = () => [];
    // DIE WAND PFAD und die Wand GPU an der Buchung
    {
        const tg = toteGlobs(["stamm/kampf.js", "worlds/schmiede/schmiede-core.js", "stamm/kreatur-*.js"], ["stamm/kampf.js", "stamm/kreatur-leben.js", "schmiede-core.js"]);
        pruef("WAND PFAD der tote Glob beim Namen", tg.join() === "worlds/schmiede/schmiede-core.js", tg.join());
        // DIE WAND HAKEN: gesetzt (direkt, ||=, Verzeichnis einer Linse, Schlüssel), gerufen ohne ?. — der umbenannte Halter beim Namen
        const da = hakenGesetzt([
            "window.__halten = ${halten}; window.__buehne ||= f;",
            "Object.entries({ wasserOrte, __wasserKroneVon }).map(([n, f]) => `window.__${n.replace(/^_+/, \"\")} = ${f};`)",
            "const L = { __aufnahmeRuhig: [1] };",
        ]);
        const th = toteHaken([{ kriterium: "haar.K1", staffel: 1, t: "window.__tiereHalten(); window.__halten(); window.__wasserOrte({}); window.__wasserKroneVon(1); window.__aufnahmeRuhig(1); window.__buehne(); window.__weg?.()" }], da, (st) => st.t);
        pruef("WAND HAKEN der umbenannte Halter beim Namen, jeder gesetzte still", th.join() === "haar.K1#1 ruft window.__tiereHalten", th.join());
        // DIE WAND EXPORT: der gestrichene Export beim Namen (98177d01: ladeWelt), der exportierte still, eine Datei ohne Export-Objekt nie
        const ex = { "scripts/diag-mensch-anatomie.cjs": exportVon("const x = 1;\nmodule.exports = { messe };"), "scripts/lib/y.cjs": exportVon("module.exports.z = 1;"), "scripts/w.cjs": exportVon("module.exports = baue();") }; // prettier-ignore
        const te = toteExporte([{ kriterium: "mensch.K4", staffel: 2, t: JSON.stringify(["node -e 'const A = require(\"./scripts/diag-mensch-anatomie.cjs\"), sb = A.ladeWelt(); A.messe(sb); const Y = require(\"./scripts/lib/y.cjs\"); Y.z; const W = require(\"./scripts/w.cjs\"); W.q'"]) }], (d) => ex[d], (st) => st.t); // prettier-ignore
        pruef("WAND EXPORT der gestrichene Export beim Namen, jeder exportierte still", te.join() === "mensch.K4#2 liest A.ladeWelt aus scripts/diag-mensch-anatomie.cjs", te.join());
        // DIE WAND ANKER: jeder Griff in ein Werkzeug des Spiels am Kopf — der fehlende Anker, der doppelte, die fehlende Deklaration, der
        // Griff, den die Wand nicht lesen kann, je beim Namen; die stehenden still (Konstante, `.map`, `for … of`, `H.seite`, JSON `seite`)
        {
            const acorn = acornVon(spielRepo());
            const code = [
                "async function a(tor) { const L = \"scripts/a.cjs\";",
                "  tor.quelle(L, \"f\", [[\"x = 1;\", \"x = 2;\"]]); tor.quelle(L, \"f\", [[\"const kr = [\", \"y\"]]);",
                "  [\"g\", \"h\"].map((n) => tor.quelle(L, n)); for (const k of [\"f\"]) tor.quelle(L, k); tor.dekl(\"scripts/a.cjs\", [\"f\", \"WEG\"]);",
                "  const q = require(\"fs\").readFileSync(\"scripts/b.cjs\", \"utf8\"); q.split(\"doppelt\");",
                "  const blind = (x) => tor.quelle(L, x); }",
                "H.seite = { MK: [[\"eins\", \"zwei\"]] }; H.linse(\"scripts/b.cjs\", [\"B\"], { ersetze: H.seite.MK, stumm: { f: () => 1 } });",
            ].join("\n");
            const texte = { "scripts/a.cjs": "function f() { const x = 1; }\nconst g = 2;\n", "scripts/b.cjs": "const B = 1; // eins\n// doppelt doppelt\n" };
            const lies = (d) => (d in texte ? texte[d] : null);
            const sa = { kriterium: "lod.K3", staffel: 1, probe: { befehl: ["node", "-e", code, "{AUS}", JSON.stringify({ seite: { __s: ["scripts/a.cjs", "f", [["fehlt", "x"]]] } })] } };
            const ta = toteAnker([sa], lies, acorn);
            const soll = [/Griff nicht statisch lesbar \(tor\.quelle @\d+: Parameter „x“\)/, /Anker „const kr = \[“ steht 0× in scripts\/a\.cjs f /, /liest h aus scripts\/a\.cjs — keine Deklaration/,
                /liest WEG aus scripts\/a\.cjs/, /Anker „doppelt“ steht 2× in scripts\/b\.cjs /, /Anker „fehlt“ steht 0× in scripts\/a\.cjs f /];
            const gut = toteAnker([{ ...sa, probe: { befehl: ["node", "-e", "async function a(tor) { const L = \"scripts/a.cjs\"; tor.quelle(L, \"f\", [[\"x = 1;\", \"x = 2;\"]]); [\"f\", \"g\"].map((n) => tor.quelle(L, n)); }"] } }], lies, acorn);
            pruef("WAND ANKER der fehlende und der doppelte Anker, die fehlende Deklaration, der blinde Griff je beim Namen (6), die stehenden Griffe still",
                ta.length === soll.length && soll.every((re) => ta.some((x) => re.test(x) && x.startsWith("lod.K3#1: "))) && gut.length === 0, JSON.stringify(ta) + " · " + JSON.stringify(gut));
            // lod.K3#1 am Kopf des Spiel-Klons (origin/main): die Scheiben der Linse statt Anker — sie stehen, sie folgen einer Umbenennung, sie
            // fallen beim Namen, wenn C6 nicht mehr in out.oben schreibt; die alten Anker (bis 04.11.) nennt die Wand am Täter von 6df5c040
            const repo = spielRepo(), L = "scripts/diag-foundry-impostor.cjs";
            const kopfText = git(["show", "origin/main:" + L], repo);
            const lk = ladeStationen().find((s) => schluessel(s) === "lod.K3#1");
            const am = (t) => toteAnker([lk], (d) => (d === L ? t : null), acorn);
            const altAnker = { ...lk, griff: undefined, probe: { befehl: ["node", "-e", "async function k(tor) { tor.quelle(\"" + L + "\", \"kleberProbe\", [[\"const H0 = 8;\", \"if (0) { const H0 = 8;\"], [\"const kr = [\", \"} const kr = [\"], [\"rtO.dispose();\", \"x\"]]); }"] } };
            const ka = [am(kopfText), am(kopfText.replace(/\bgO\b/g, "gestaltOben").replace(/\bdeckt\b/g, "deckung")), am(kopfText.replace(/out\.oben\b/g, "out.hoch")), am(kopfText.replace(/C\.oben\b/g, "C.hoch")),
                toteAnker([altAnker], (d) => (d === L ? kopfText : null), acorn)];
            pruef("WAND ANKER lod.K3#1 am Kopf origin/main: die Scheiben stehen und folgen einer Umbenennung; ohne out.oben bzw. C.oben ROT beim Namen; die drei Anker bis 04.11. dort ROT (const kr = [)",
                ka[0].length === 0 && ka[1].length === 0 && /keine Anweisung schreibt out\.oben/.test(ka[2].join()) && /liest C\.oben nicht/.test(ka[3].join()) && /Anker „const kr = \[“ steht 0×/.test(ka[4].join()),
                JSON.stringify(ka));
            // DAS URTEIL OHNE GERÄT: die Scheibe des Druck-Blocks am Kopf druckt aus einem C der Probe die C6-Zeile, die die Station liest —
            // die Ringe an der Karte GRÜN, die waagrecht gebackene Karte (main 715754fc) ROT; die Scheibe der Probe kompiliert
            const PW = require("./stationen/proben-welt.cjs");
            const S = PW.hebungScheiben(acorn, kopfText);
            const drucke = new Function("C", "errs", S.drucke);
            new Function("return (" + S.kleber + ");")();
            const je = (k) => Object.fromEntries(k.map(([p, d, i]) => [p, { karte: { deckung: d, iou: i }, selbst: { deckung: 0.341, iou: 0.237 } }]));
            const zeile = (k) => {
                const z = [], errs = [], log = console.log;
                console.log = (...a) => z.push(a.join(" "));
                try {
                    drucke({ fmt: "bc", oben: { hebungen: [-20, 0, 40, 80], schichtB: 515200, je: je(k) } }, errs);
                } finally {
                    console.log = log;
                }
                return { z: z.join("\n"), errs };
            };
            const ringe = zeile([[-20, 1.004, 0.966], [0, 1.064, 0.894], [40, 1.003, 0.983], [60, 0.882, 0.745], [80, 0.97, 0.97]]);
            const waag = zeile([[-20, 0.493, 0.432], [0, 1.065, 0.894], [40, 0.294, 0.272], [60, 0.182, 0.179], [80, 0.064, 0.064]]);
            const radeon = "[linse-gpu] webgl2/ANGLE (AMD, AMD Radeon(TM) 890M Graphics (0x0000150E) Direct3D11 vs_5_0 ps_5_0, D3D11)\n";
            const u = [lk.urteil(null, { exit: 0, stdout: radeon + ringe.z }), lk.urteil(null, { exit: 1, stdout: radeon + waag.z })];
            pruef("lod.K3#1 OHNE GERÄT: die Scheiben am Kopf (kleberProbe " + S.teile.kleber.join(" von ") + ", Druck-Block " + S.teile.drucke.join(" von ") + " Anweisungen) — die Ringe drucken die C6-Zeile, das Urteil GRÜN; die waagrechte Karte ROT",
                u[0].gruen === true && ringe.errs.length === 0 && u[1].gruen === false && waag.errs.length > 0, JSON.stringify([u, ringe.errs, waag.errs]));
            // DAS BÜNDEL (`tor.dekl` → `tor.buendel`, der Täter fahrzeug.K2#1 am 3ccb8f55): das gezogene Urteil ruft einen Helfer der obersten
            // Ebene, den die Liste nicht nennt. Die Liste allein (tor.dekl bis 09.11.) deklariert sich und wirft erst beim RUF („urteil is not
            // defined“); das Bündel zieht den Helfer in der Reihe der Quelle mit und urteilt. Ein Name, den ein Rumpf selbst bindet (Parameter,
            // Muster, for, catch), zieht nichts mit; ein Name des Moduls in der Kette wirft beim ZIEHEN — die Wand nennt die Kette am Kopf,
            // bis die Station ihn stellt (`gestellt`)
            {
                const C = "scripts/c.cjs";
                const zeilen = [
                    "const { pruefer } = require(\"./lib/welt-boot.cjs\");",
                    "const { errs, check } = pruefer();",
                    "const urteil = (zeilen) => zeilen.flatMap(([ok, t]) => (ok ? [] : [t]));",
                    "const GRENZE = { m: 2 };",
                    "function wegVerdict(m) { return urteil([[m.weg <= GRENZE.m, \"weg \" + m.weg]]); }",
                    "function bericht(m) { const v = wegVerdict(m); check(\"WEG\", v.length === 0, v.join()); return v; }",
                    "function schatten(urteil, { GRENZE: errs = 1 } = {}) { for (const check of [urteil]) try { return check + errs; } catch (pruefer) { return pruefer; } }",
                ];
                const text = zeilen.join("\n");
                const q = { text, ast: acorn.parse(text, ACORN_O) };
                const buendel = PW.sitzungTor().buendel;
                // die Liste allein (tor.dekl bis 09.11.): jede Anweisung der obersten Ebene, die einen genannten Namen deklariert
                const allein = (namen) => q.ast.body.filter((n) => (n.id ? [n.id] : n.declarations.map((d) => d.id)).some((i) => namen.includes(i.name))).map((n) => text.slice(n.start, n.end)).join("\n");
                const ruf = (b) => { try { return JSON.stringify(new Function(b + "\nreturn wegVerdict;")()({ weg: 3 })); } catch (e) { return String(e); } };
                const liste = ["GRENZE", "wegVerdict"];
                const vor = ruf(allein(liste)), nach = ruf(buendel(q, liste, [], C));
                const wand = (rumpf) => toteAnker([{ kriterium: "fahrzeug.K2", staffel: 1, probe: { befehl: ["node", "-e", "async function p(tor) { const C = \"" + C + "\"; " + rumpf + " }"] } }], (d) => (d === C ? text : null), acorn);
                const still = wand("tor.dekl(C, [\"GRENZE\", \"wegVerdict\"]); tor.dekl(C, [\"schatten\"]); tor.dekl(C, [\"bericht\"], [\"check\"]);");
                const kette = wand("tor.dekl(C, [\"bericht\"]);");
                pruef("WAND ANKER das Bündel: die Liste allein wirft erst beim Ruf (urteil is not defined), das Bündel zieht den Helfer in der Reihe der Quelle mit und urteilt; gebundene Namen ziehen nichts mit; require in der Kette ROT beim Namen, gestellt still",
                    vor === "ReferenceError: urteil is not defined" && nach === "[\"weg 3\"]" && buendel(q, liste, [], C) === zeilen.slice(2, 5).join("\n") && buendel(q, ["schatten"], [], C) === zeilen[6] &&
                        still.length === 0 && kette.length === 1 && /^fahrzeug\.K2#1: das Bündel bericht deklariert sich nicht — scripts\/c\.cjs: bericht → check → pruefer lädt mit require /.test(kette[0]),
                    JSON.stringify([vor, nach, still, kette]));
                // EIN Lauf über jeden echten Ruf: jedes `tor.dekl` der Proben (proben-welt.cjs) steht im Befehl einer Station; die Wand zieht sein
                // Bündel aus der Quelle am Kopf origin/main und deklariert es in `new Function` — keines wirft; was der Abschluss über die
                // Liste hinaus mitzieht, steht beim Namen in der Zeile
                const imWerk = [];
                (function geh(n) {
                    if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.object.name === "tor" && n.callee.property.name === "dekl")
                        imWerk.push(n.arguments[1] && n.arguments[1].type === "ArrayExpression" ? n.arguments[1].elements.map((e) => e && e.value).join() : "?");
                    for (const c of astKinder(n)) geh(c);
                })(acorn.parse(fs.readFileSync(path.join(DIR, "stationen", "proben-welt.cjs"), "utf8"), ACORN_O));
                const echt = new Map(); // der Ruf → die Stationen, die ihn tragen
                for (const st of ladeStationen())
                    for (const x of griffeVon(st, acorn).griffe.filter((g) => g.buendel)) {
                        const k = JSON.stringify([x.datei, x.namen, x.buendel]);
                        echt.set(k, [...(echt.get(k) || []), st]);
                    }
                const kopf = ankerLeser(repo, "origin/main");
                const rot = [], mit = [];
                for (const [k, wer] of echt) {
                    const [datei, namen, gestellt] = JSON.parse(k);
                    const f = toteAnker([{ kriterium: wer[0].kriterium, staffel: wer[0].staffel, probe: { befehl: ["node", "-e", "async function p(tor) { tor.dekl(" + k.slice(1, -1) + "); }"] } }], kopf, acorn);
                    rot.push(...f);
                    if (f.length) continue;
                    const t = kopf(datei);
                    const dazu = acorn.parse(buendel({ text: t, ast: acorn.parse(t, ACORN_O) }, namen, gestellt, datei), ACORN_O).body
                        .flatMap((n) => (n.type === "VariableDeclaration" ? n.declarations.flatMap((d) => musterNamen(d.id)) : n.id ? [n.id.name] : []))
                        .filter((x) => !namen.includes(x));
                    if (dazu.length) mit.push(wer.map(schluessel).join(" ") + " ← " + dazu.join(", "));
                }
                const gelesen = new Set([...echt.keys()].map((k) => JSON.parse(k)[1].join()));
                pruef("WAND ANKER das Bündel am Kopf origin/main: jeder tor.dekl-Ruf der Proben (" + imWerk.length + ") steht im Befehl einer Station, zieht und deklariert sich in new Function",
                    imWerk.length > 0 && imWerk.every((x) => gelesen.has(x)) && rot.length === 0,
                    rot.length ? JSON.stringify(rot) : echt.size + " Rufe in " + new Set([...echt.values()].flat().map(schluessel)).size + " Stationen, 0 Würfe; der Abschluss zieht mit: " + (mit.join(" · ") || "nichts"));
            }
        }
        // DER SAUM AM KAMM (ferne.K3, `kammSaum` der Station): die Grenze in Metern am Kamm. An den Spalten der Radeon 04.11. (Kronen wie
        // gewachsen) stehen ≥ 100 Kamm-Spalten, das Urteil GRÜN; die Mutante (12 PIXEL bis 04.11.) wirft sie unter 100 (ROT); ein naher Körper
        // vor dem Auge (6 m über der Sichtlinie, 40 m fern, über das ganze Band) fällt ganz — mit und ohne Mutante ROT; die höchste Krone
        // des Gesetzes am Kamm bleibt, 10 % darüber fällt
        {
            const g3 = require("./stationen/g3.js");
            const fk = ladeStationen().find((s) => schluessel(s) === "ferne.K3#1");
            const R = JSON.parse(fs.readFileSync(path.join(DIR, "stationen", "ferne-k3-radeon-0411.json"), "utf8"));
            const [W, H] = R.leinwand, fov = R.kammFov / (W / H);
            const mpp = (d) => (d * 2 * Math.tan((fov * Math.PI) / 360)) / H;
            const C = { kammKroneM: g3.kammKroneM };
            const sp = R.spalten.map(([x, y, d, gy]) => ({ x, y, d, gy }));
            const pixel = (s) => s.filter((q) => q.d >= 400 && q.d <= 4000 && q.y > 0 && q.y < H - 3 && q.gy != null && q.gy - q.y <= 12);
            const nah = sp.map((q) => (q.gy == null ? q : { ...q, y: Math.round(q.gy - 6 / mpp(40)) }));
            const soll = JSON.parse(/^NEUN ferne\.K3 (\{.*\})$/m.exec(fk.proben[0].stdout)[1]);
            const urteil = (k) => fk.urteil(null, { exit: 0, stdout: "[linse-gpu] webgl2/ANGLE (AMD, AMD Radeon(TM) 890M Graphics)\nNEUN ferne.K3 " +
                JSON.stringify({ ...soll, kamm: k.length, zweiKm: k.filter((q) => q.d >= 1500 && q.d <= 2500).length }) }).gruen;
            const n = [g3.kammSaum(sp, mpp, H, C), pixel(sp), g3.kammSaum(nah, mpp, H, C), pixel(nah)];
            const krone = (m) => g3.kammSaum([{ x: 0, y: 500 - m / mpp(2295), d: 2295, gy: 500 }], mpp, H, C).length;
            pruef("SAUM ferne.K3 in Metern am Kamm (Grenze " + C.kammKroneM + " m): Radeon 04.11. " + n[0].length + " Kamm-Spalten GRÜN, die Mutante 12 px " + n[1].length + " ROT; ein naher Körper 40 m vor dem Auge " +
                n[2].length + " (Mutante " + n[3].length + ") ROT; die höchste Krone am Kamm bleibt, 10 % darüber fällt",
                n[0].length >= 100 && urteil(n[0]) && n[1].length < 100 && !urteil(n[1]) && n[2].length === 0 && !urteil(n[2]) && n[3].length === 0 && !urteil(n[3]) &&
                krone(C.kammKroneM * 0.99) === 1 && krone(C.kammKroneM * 1.1) === 0, JSON.stringify(n.map((x) => x.length)));
        }
        let w = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h, [], { tot: () => ["worlds/schmiede/schmiede-core.js"] });
        pruef("WAND PFAD toter Glob am Kopf → 0", w.je["gelaende.K4"].punkte === 0 && /trifft am Kopf keine Datei \(R6 blind\): worlds\/schmiede/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        const alt = [M("a1", "radeon", "gelaende.K4#1", s1, true, undefined, {})];
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "" });
        pruef("WAND GPU Grün ohne Zeugen (vor der Wand, Roh leer) → 0", w.je["gelaende.K4"].punkte === 0 && /Wand GPU: keine Linse nennt eine Karte/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "$ befehl\n[linse-gpu] amd/rdna-3\nGRÜN\n" });
        pruef("WAND GPU Grün mit dem Zeugen in der Roh-Ausgabe → 1", w.je["gelaende.K4"].punkte === 1, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "[linse-gpu] amd/rdna-3\n[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“\n" });
        pruef("WAND GPU Roh zeigt „zeichnet nie“ → 0", w.je["gelaende.K4"].punkte === 0 && /zeichnet nie/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
    }
    let b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG 1 Gerät → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 nur Radeon → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    const m2 = [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)];
    b = buchen("kopf", [s1, s2], m2, keine, h);
    pruef("BUCHUNG 2 Geräte → 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    // der Pflicht-Richter: grün an beiden Geräten, aber ohne Punkte — nur in pflichtJe, nie in je (Σ und gen.cjs bleiben bei den 330)
    const sp = { ...s1, kriterium: "pflicht.E", pflicht: true, beide: true, quelle: "PFLICHT-OFFEN E = Frame p95 ≤ 33 ms in jeder Stand-Zelle an beiden Geräten" };
    b = buchen("kopf", [s1, s2, sp], [...m2, M("a1", "radeon", "pflicht.E#1", sp, true), M("a1", "gtx", "pflicht.E#1", sp, true)], keine, h);
    pruef("BUCHUNG Pflicht-Richter in pflichtJe mit 0 Punkten, nie in je",
        !b.je["pflicht.E"] && !!b.pflichtJe["pflicht.E"] && b.pflichtJe["pflicht.E"].punkte === 0 && b.pflichtJe["pflicht.E"].stationen.filter((x) => x.gruen).length === 2 && b.je["gelaende.K4"].punkte === 2,
        JSON.stringify(b.pflichtJe));
    const pbE = pflichtBand({ ...b.je, ...b.pflichtJe }, { dokument: "d.md", eintraege: [{ id: "E", titel: "e", stationen: ["pflicht.E#1"] }] }, "E) DAS BAND — **E fällt, wenn p95 hält.**");
    pruef("PFLICHT das Band liest den Pflicht-Richter aus pflichtJe (E grün, 2/2 Paare, 0 Punkte)", pbE.eintraege[0].status === "grün" && pbE.eintraege[0].gesamt === 2 && pbE.eintraege[0].punkte === 0, JSON.stringify(pbE.eintraege[0]));
    // DIE UHR DES GANGS (stationen/g6.js pbSchrittTraegt, 04.11.): ein Schritt mit einer Stand-Zelle von PFLICHT E läuft immer, die
    // übrigen nur im Budget — an der GTX schnitt die feste Uhr 58 s wiese-third-steht in jedem Lauf weg; seit w12-proben-frist nur, solange
    // der Deckel sie trägt (Budget + 3 s): an der Radeon 8ef49bef riss Wiese Third bei 76 s + 18 s den Deckel 90 s, sieben Stationen UNGEMESSEN
    {
        const t = require(path.join(DIR, "stationen", "g6.js")).pbSchrittTraegt;
        pruef("UHR DES GANGS die Stand-Zelle läuft über dem Budget, solange der Deckel sie trägt, die Bewegung nicht, im Budget beide",
            t(["band:wiese-third", "wiese-third-steht"], 80, 6, 84) && !t(["band:wiese-third", "wiese-third-steht"], 76, 18, 84) && !t(["wiese-fahrt"], 80, 8, 84) &&
                t(["wiese-fahrt"], 70, 8, 84) && !t(["band:dorf-ego"], 84, 1, 84));
    }
    // DIE UHR DES TAKTS (stationen/g6.js taktRot, klang.K5#2, w12-klang-takt): eine Seite ohne Cross-Origin-Isolation (performance.now() auf
    // dem 100-µs-Raster, die Sitzung bis 05.11.) ist ROT beim Täter, ehe ein p95 zählt; eine Geh-Phase unter 10 m ist ROT beim Weg (das
    // Stop-and-go trug 6–9 m); die isolierte, bewegte Fahrt ist GRÜN
    {
        const t = require(path.join(DIR, "stationen", "g6.js")).taktRot;
        const P = (weg) => ({ bilder: 600, weg, p95: 0.12, max: 0.3, traeger: [] });
        const j = (iso, weg) => ({ seite: { isoliert: iso }, phasen: { gehen: P(weg), fahrt: { ...P(30), sattel: true }, nacht: P(11) }, aussetzer: { n: 0, still: 0, s: 40 } });
        const [ok, uhr, kurz] = [t(j(true, 14), 0.2, 10), t(j(false, 14), 0.2, 10), t(j(true, 8), 0.2, 10)];
        pruef("UHR DES TAKTS die nicht isolierte Seite ROT beim Kopf des save-servers, 8 m Gehen ROT beim Weg, isoliert und bewegt GRÜN",
            !ok.length && uhr.length === 1 && /^T uhr: .*statischerKopf/.test(uhr[0]) && kurz.length === 1 && /^T gehen: 600 Bilder, 8 m/.test(kurz[0]),
            JSON.stringify([ok, uhr, kurz]));
    }
    b = buchen("kopf", [s1, s2], m2, (sha) => (sha === "b2" ? ["stamm/wasser-hydro.js"] : ["docs/x.md"]), h);
    pruef("BUCHUNG R6 Pfad geändert → GTX alt → 1", b.je["gelaende.K4"].punkte === 1 && /R6/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    // DIE RATSCHE: das GRÜN der letzten Buchung hält ohne frische Messung, ein frisches ROT nimmt es beim Namen, die Wand PFAD hält nie
    {
        const vor = buchen("alt", [s1, s2], m2, keine, h);
        const alt6 = (sha) => (sha === "a1" || sha === "b2" ? ["stamm/wasser-hydro.js"] : []);
        let r = buchen("kopf", [s1, s2], m2, alt6, h, [], { vorher: vor });
        pruef("RATSCHE R6-alt hält das GRÜN der letzten Buchung → 2", r.je["gelaende.K4"].punkte === 2 && /gehalten: z an a1/.test(r.je["gelaende.K4"].beleg) && !r.rueckfall.length, r.je["gelaende.K4"].beleg);
        r = buchen("kopf", [s1, s2], [...m2, M("c3", "gtx", "gelaende.K4#2", s2, false, "2026-10-24T10:00:00Z")], alt6, h, [], { vorher: vor });
        pruef("RATSCHE frisches ROT nimmt die Staffel und nennt den RÜCKFALL → 1", r.je["gelaende.K4"].punkte === 1 && r.rueckfall.length === 1 && /^gelaende\.K4#2 gtx: rot an c3/.test(r.rueckfall[0]), r.rueckfall.join(" | "));
        r = buchen("kopf", [s1, s2], m2, alt6, h, [], { vorher: vor, tot: () => ["stamm/wasser-weg.js"] });
        pruef("RATSCHE die Wand PFAD hält nie → 0", r.je["gelaende.K4"].punkte === 0, r.je["gelaende.K4"].beleg);
        r = buchen("kopf", [s1, s2], m2, alt6, h);
        pruef("RATSCHE ohne Vorbuchung ist ungemessen 0", r.je["gelaende.K4"].punkte === 0, r.je["gelaende.K4"].beleg);
    }
    // (5p) DAS PFLICHT-BAND: grün nur, wenn jedes Paar grün ist und kein Teil ohne Richter steht; die Klasse der Tafel ohne Station, der
    // Eintrag des Dokuments ohne Zeile, die unbekannte Station und der Teil ohne Richter stehen ROT beim Namen; die gefallene Zeile genannt
    {
        const md = "X) DAS ERSTE — **Status: offen. X fällt, wenn a hält.**\nY) DAS ZWEITE — **Y fällt, wenn b hält. Offen benannt: c.**\nZ) DAS DRITTE";
        const jeP = { "a.K1": { punkte: 2, stationen: [{ id: "a.K1#1", geraet: "radeon", gruen: true }, { id: "a.K1#2", geraet: "gtx", gruen: true }] },
            "b.K2": { punkte: 0, stationen: [{ id: "b.K2#1", geraet: "gtx", gruen: false, ungemessen: true, grund: "ungemessen (R10)" }] } };
        const zu = { dokument: "d.md", eintraege: [{ id: "X", titel: "x", stationen: ["a.K1#1", "a.K1#2"] },
            { id: "Y", titel: "y", tafel: "t.json", klassen: { k1: ["b.K2#1"], k2: [] }, stationen: ["q.K9#1"], ohneRichter: ["die Uhr"] }, { id: "W", stationen: [] }] };
        const pb = pflichtBand(jeP, zu, md, { "t.json": { klassen: [{ id: "k1" }, { id: "k2" }] } });
        const [X, Y, Z] = pb.eintraege;
        pruef("PFLICHT jedes Paar grün, kein Teil ohne Richter → grün, Punkte aus den 330", X.status === "grün" && X.gruen === 2 && X.punkte === 2 && X.max === 2 && X.kriterium === "X fällt, wenn a hält.", JSON.stringify(X));
        pruef("PFLICHT ohne Richter beim Namen: Klasse ohne Station, Teil, unbekannte Station; das offene Paar mit seiner Zeile",
            Y.status === "ohne Richter" && /1 von 2 Klassen der Tafel ohne Station: k2/.test(Y.ohneRichter.join("|")) && Y.ohneRichter.includes("die Uhr") &&
            /q\.K9#1: die Buchung kennt die Station nicht/.test(Y.ohneRichter.join("|")) && Y.offen.length === 1 && Y.offen[0].zeile === "ungemessen (R10)" && Y.kriterium === "Y fällt, wenn b hält.", JSON.stringify(Y));
        pruef("PFLICHT Eintrag des Dokuments ohne Zeile → ohne Richter; die Zeile ohne Eintrag → gefallen",
            Z.status === "ohne Richter" && /keine Zeile in pflicht\.json/.test(Z.ohneRichter[0]) && pb.gefallen.join() === "W", JSON.stringify(Z) + " " + pb.gefallen);
        let wirft = false;
        try { pflichtBand(jeP, zu, "kein Eintrag", {}); } catch (_e) { wirft = true; }
        pruef("PFLICHT ein Dokument ohne Eintrag ist ROT, nie ein leeres Band", wirft);
    }
    // (5c) KEIN URTEIL IST KEIN ROT (w4-sitzung-urteil, keinUrteil in fahreGruppe): die Attrappe ohne Zeile, die vor ihrer Zeile abstürzt
    // und die, deren eigene Frist riss (die Marke ihres Läufers), sind UNGEMESSEN beim Namen; die mit rotem Maß bleibt ROT, die mit
    // grünem GRÜN. Die Buchung hält das gebuchte GRÜN gegen den Lauf ohne Zeile (gehalten, sein Grund im Stand) und nennt das rote Maß
    // als RÜCKFALL
    {
        const mass = (j, l) => {
            const z = /^MASS (\d+)$/m.exec(l.stdout);
            return z ? { gruen: +z[1] <= 3, zahl: "Maß " + z[1] + " (Soll ≤ 3)" } : { gruen: false, zahl: "keine MASS-Zeile (Exit " + l.exit + ")" };
        };
        const at = { ...st0, urteil: mass };
        const zeigt = (zeilen, exit = 0) => ["node", "-e", "for (const z of " + JSON.stringify(zeilen) + ") console.log(z); process.exitCode = " + exit];
        const [ohne, sturz, frist, rotM, gruenM] = [
            await fahreStation({ ...at, befehl: zeigt(["die Linse lief, ihre Zeile kam nie"]) }, ctx("ohne-zeile")),
            await fahreStation({ ...at, befehl: ["node", "-e", "console.error('TypeError: k8 is undefined'); process.exit(2)"] }, ctx("ohne-sturz")),
            await fahreStation({ ...at, befehl: zeigt(["MASS 9", "@@PUNKTE@@ FRIST 27 s der Probe gerissen: jeder Takt danach warf"], 1) }, ctx("ohne-frist")),
            await fahreStation({ ...at, befehl: zeigt(["MASS 9"], 1) }, ctx("rot-mass")),
            await fahreStation({ ...at, befehl: zeigt(["MASS 2"]) }, ctx("gruen-mass")),
        ];
        pruef("KEIN URTEIL die Attrappe ohne Zeile, mit Absturz vor ihr, mit gerissener eigener Frist ist UNGEMESSEN beim Namen; das rote Maß ROT, das grüne GRÜN",
            ohne.ungemessen === true && /^die Urteils-Zeile fehlt — kein Urteil, UNGEMESSEN \(die Probe sah: keine MASS-Zeile \(Exit 0\)\) · Täter: die Linse lief, ihre Zeile kam nie$/.test(ohne.grund) &&
            sturz.ungemessen === true && sturz.exit === 2 && /^die Urteils-Zeile fehlt .* · Täter: TypeError: k8 is undefined$/.test(sturz.grund) &&
            frist.ungemessen === true && /^Frist der Probe 27 s gerissen — kein Urteil, UNGEMESSEN \(die Probe sah: Maß 9/.test(frist.grund) && brachAb([frist]) &&
            rotM.gruen === false && !rotM.ungemessen && rotM.grund === "ROT: Maß 9 (Soll ≤ 3)" && gruenM.gruen === true && !gruenM.ungemessen,
            JSON.stringify([ohne, sturz, frist, rotM, gruenM].map((x) => [x.gruen, !!x.ungemessen, x.grund || x.zahl])));
        const id = schluessel(at);
        const lauf = (sha, e) => {
            const m = { sha, geraet: "headless", je: {} };
            eintragen(m, id, stationsEintrag(e, { zeit: "2026-10-30T18:00:00Z", abdruck: abdruck(at, h), port: null, bahn: "1/1" }));
            return m;
        };
        const alt1 = (sha) => (sha === "a1" ? ["stamm/wasser-hydro.js"] : []);
        const vor = buchen("alt", [at], [M("a1", "headless", id, at, true)], keine, h);
        const halt = buchen("kopf", [at], [M("a1", "headless", id, at, true), lauf("c3", ohne)], alt1, h, [], { vorher: vor });
        const fall = buchen("kopf", [at], [M("a1", "headless", id, at, true), lauf("c3", rotM)], alt1, h, [], { vorher: vor });
        const st = halt.je["gelaende.K4"].stationen[0];
        pruef("KEIN URTEIL die Buchung hält das gebuchte GRÜN gegen den Lauf ohne Zeile (sein Grund im Stand), das rote Maß ist RÜCKFALL",
            halt.je["gelaende.K4"].punkte === 1 && !halt.rueckfall.length && st.gehalten === true && /zuletzt an c3: die Urteils-Zeile fehlt/.test(st.grund) &&
            fall.je["gelaende.K4"].punkte === 0 && fall.rueckfall.length === 1 && /^gelaende\.K4#1 headless: Maß 9 \(Soll ≤ 3\) an c3/.test(fall.rueckfall[0]),
            JSON.stringify([halt.je["gelaende.K4"], halt.rueckfall, fall.rueckfall]));
    }
    // (5f) DIE LAST (pm-fremdlast, w28-referenzfahrt; fremdZeuge nennt, referenzFahrt misst, fremdUrteil an der EINEN Stelle fahreGruppe).
    // Die Attrappe der Welt (ihre CPU wächst mit der Wanduhr, der eigene Baum hängt an einer erfundenen Wurzel) und die Attrappe der
    // Referenz (gesetzte Fahrten gegen eine gesetzte Ruhe): AM LÄUFER (a) eine Zeit, die unter Last f 1,8 hält → GRÜN mit Vermerk, (b) Faktor
    // 30 über der Schwelle unter f 1,8 → ROT, (c) im Band, vor = nach → UNGEMESSEN „unscharf“ ohne Wiederholung, (d) im Band, vor ≠ nach →
    // genau EINE Wiederholung, (e) eine Bild-Station unter Last urteilt wie gemessen (keine Fahrt), Ruhe f 1 neben 1,5 fremden Kernen → ROT
    // wie gemessen (der Ruhe-Zwang fiel); der Zeuge trennt Diener, eigenen Baum, Erben und Gerät. Dann DAS GESETZ an gesetzten Berichten mit
    // seinen Mutanten (darunter die alte Regel: der pauschale Wurf), DER LESER des Windows-Zeugen, die Spannen des Berichts und der ECHTE
    // Zeuge als STAND-Zeile
    {
        const T0 = Date.now(), WZ = 4242;
        // dazu weitere Prozesse [pid, Name, Kommandozeile, Kerne]: die Grund-Last des Geräts, die App
        const attrappe = (rate, dazu = []) => ({
            schnapp: () => {
                const t = Date.now(), s = (t - T0) / 1000;
                const p = new Map([
                    [WZ, { pp: 1, cpu: 0.1 * s, start: T0 - 1e6, name: "node", cmd: "node punkte.cjs run" }],
                    [WZ + 1, { pp: WZ, cpu: 3 * s, start: T0 - 5e5, name: "chrome", cmd: "chrome --type=gpu-process" }],
                    [9, { pp: 4, cpu: 2 * s, start: T0 - 9e6, name: "dwm.exe", cmd: "dwm.exe" }],
                    [78, { pp: WZ, cpu: 0.2 * s, start: T0 - 2e6, name: "erbe.exe", cmd: "erbe.exe --alt" }],
                ]);
                if (rate) p.set(77, { pp: 1, cpu: rate * s, start: T0 - 1e5, name: "node", cmd: "node scripts/playtest.cjs --fast" });
                for (const [pid, name, cmd, k] of dazu) p.set(pid, { pp: 4, cpu: k * s, start: T0 - 3e6, name, cmd });
                return { t, p };
            },
            stop() {},
        });
        const zeitSt = { ...st0, zeit: true, urteil: lies,
            befehl: ["node", "-e", "setTimeout(() => require('fs').writeFileSync(process.argv[1], JSON.stringify({ n: Number(process.argv[2]) })), 1500)", "{AUS}", "0"] };
        const zeugen = [];
        const RUHE = { ein: 100, alle: 100, n: 20, von: "2026-11-11" };
        // die Referenz-Attrappe: die Fahrten der Reihe nach (die letzte wiederholt sich), z.n zählt sie
        const refA = (folge) => { const z = { n: 0 }; return { z, fahrt: async () => folge[Math.min(z.n++, folge.length - 1)], ruhe: () => RUHE }; }; // prettier-ignore
        const LAST = { ein: 180, alle: 150 }, STILL = { ein: 100, alle: 100 };
        const mitZeuge = (n, quelle, referenz = refA([STILL])) => ({ ...ctx(n), referenz, zeuge: zeugen[zeugen.push(fremdZeuge({ quelle, taktMs: 300, wurzel: WZ })) - 1] });
        const rotSt = { ...zeitSt, befehl: [...zeitSt.befehl.slice(0, 4), "3"] };
        const massSt = (n) => ({ ...zeitSt, urteil: (j) => ({ gruen: j.n <= 33, zahl: "n " + j.n }), mass: (j) => [{ wort: "n", wert: j.n, soll: 33 }],
            befehl: [...zeitSt.befehl.slice(0, 4), String(n)] });
        const rA = refA([LAST]), rB = refA([LAST]), rC = refA([LAST]), rD = refA([{ ein: 180, alle: 100 }, { ein: 110, alle: 100 }, { ein: 180, alle: 100 }, { ein: 110, alle: 100 }]), rE = refA([LAST]);
        const lA = await fahreStation(massSt(30), mitZeuge("last-a", attrappe(1.5), rA));
        const lB = await fahreStation(massSt(990), mitZeuge("last-b", attrappe(1.5), rB));
        const lC = await fahreStation(massSt(40), mitZeuge("last-c", attrappe(1.5), rC));
        const lD = await fahreStation(massSt(40), mitZeuge("last-d", attrappe(1.5), rD));
        const lE = await fahreStation({ ...rotSt, zeit: false }, mitZeuge("last-e", attrappe(1.5), rE));
        const ruhig = await fahreStation(rotSt, mitZeuge("last-ruhe", attrappe(1.5)));
        const GERAET = [[81, "AppHelperCap.exe", "AppHelperCap.exe", 2], [82, "MsMpEng.exe", "MsMpEng.exe", 1], [84, "OmenCap.exe", "OmenCap.exe", 1]];
        const geraetRot = await fahreStation(rotSt, mitZeuge("last-geraet", attrappe(0, GERAET)));
        zeugen.forEach((z) => z.stop());
        pruef("LAST am Läufer (a) eine Zeit hält unter Last (Referenz f 1,8, playtest:fast 1,5 Kerne fremd) → GRÜN mit Vermerk: f, die Fahrten, die Ruhe und der Fremde beim Namen im Grund, `referenz` und `fremd` im Eintrag",
            lA.gruen === true && !lA.ungemessen && /^GRÜN trotz Last: Referenz f 1,8 \(Faden 1,8 · alle Kerne 1,5; vor 180\/150 ms, nach 180\/150 ms, Ruhe 100\/100 ms seit 2026-11-11\) · fremd: node scripts\/playtest\.cjs --fast/.test(lA.grund) &&
                lA.referenz.f === 1.8 && lA.referenz.schwankt === false && rA.z.n === 2 && lA.fremd.diener[0][0] === "dwm.exe" && lA.fremd.eigenS > lA.fremd.fremdS &&
                !lA.fremd.namen.some(([n]) => /chrome|punkte\.cjs/.test(n)) && lA.fremd.spannen && lA.fremd.spannen.station > 0,
            JSON.stringify([lA.grund, lA.referenz, lA.fremd && lA.fremd.spannen]));
        pruef("LAST am Läufer (b) Faktor 30 über der Schwelle (n 990 gegen ≤ 33) unter f 1,8 → ROT trotz Last mit roh und entlastet",
            lB.gruen === false && !lB.ungemessen && /^ROT: n 990 · ROT trotz Last: Referenz f 1,8 .* — auch entlastet: n roh 990, entlastet ≥ 550, Schwelle ≤ 33$/.test(lB.grund),
            lB.grund);
        pruef("LAST am Läufer (c) im Band (n 40 gegen ≤ 33, entlastet 22,2) unter ruhiger Last (vor = nach) → UNGEMESSEN „unscharf unter Last“, keine Wiederholung (2 Fahrten)",
            lC.ungemessen === true && lC.gruen === false && / — unscharf unter Last: n roh 40, entlastet ≥ 22,22, Schwelle ≤ 33 — kein Urteil, UNGEMESSEN \(die Probe sah: n 40\)$/.test(lC.grund) &&
                !lC.wiederholt && !lC.wiederholen && rC.z.n === 2,
            JSON.stringify([lC.grund, rC.z.n]));
        pruef("LAST am Läufer (d) im Band, vor und nach schwanken (Faden 180 ↔ 110 ms) → genau EINE Wiederholung (4 Fahrten), die zweite zählt, `wiederholt` nennt die erste",
            lD.ungemessen === true && /unscharf unter Last/.test(lD.grund) && /unscharf unter Last/.test(lD.wiederholt || "") && !lD.wiederholen && rD.z.n === 4 && lD.referenz.schwankt === true,
            JSON.stringify([rD.z.n, lD.wiederholt, lD.referenz]));
        pruef("LAST am Läufer (e) eine Bild-Station unter Last urteilt wie gemessen (ROT: n 3), fährt keine Referenz und trägt den Bericht; Ruhe (f 1) neben 1,5 fremden Kernen → ROT wie gemessen (der Ruhe-Zwang fiel)",
            lE.gruen === false && !lE.ungemessen && lE.grund === "ROT: n 3" && rE.z.n === 0 && !lE.referenz && lE.fremd.namen.length > 0 &&
                ruhig.gruen === false && !ruhig.ungemessen && ruhig.grund === "ROT: n 3" && ruhig.referenz.f === 1 && ruhig.fremd.fensterKerne > 1,
            JSON.stringify([lE.grund, rE.z.n, ruhig.grund, ruhig.referenz, ruhig.fremd.fensterKerne]));
        const gb = geraetRot.fremd || {};
        pruef("LAST DAS GERÄT IST KEINE FREMD-LAST: AppHelperCap.exe, MsMpEng.exe und OmenCap.exe stehen im Bericht beim Namen als Gerät, nie als fremd",
            geraetRot.gruen === false && !geraetRot.ungemessen && geraetRot.grund === "ROT: n 3" &&
                JSON.stringify((gb.geraet || []).map(([n]) => n)) === JSON.stringify(["AppHelperCap.exe", "MsMpEng.exe", "OmenCap.exe"]) && gb.geraetS > gb.fremdS &&
                !(gb.namen || []).some(([n]) => /AppHelperCap|MsMpEng|OmenCap/.test(n)),
            JSON.stringify([geraetRot.grund, gb]));
        // DAS GESETZ AN GESETZTEN EINGABEN: je Satz Station, Ergebnis (mit Maß), Bericht des Zeugen, Bericht der Referenz und sein Soll; die
        // MUTANTEN fallen je an ihrem Satz, jeder Satz fällt an einem von ihnen
        {
            const lage = (kerne, spannen) => ({ s: 10, takte: 5, fremdS: kerne * 10, kerne, fensterKerne: kerne, namen: [["Claude.exe --type=gpu-process", kerne * 10]], dienerS: 0, diener: [],
                geraetS: 20, geraet: [["OmenCap.exe", 20]], eigenS: 3, rechnerKerne: 4, ...(spannen ? { spannen } : {}) });
            const ref = (vor, nach = vor) => referenzBericht(vor, nach, RUHE, "allein");
            const L = lage(1.82), L0 = lage(1.5), F18 = ref(LAST), F13 = ref({ ein: 130, alle: 110 }), F1 = ref(STILL), SCHW = ref({ ein: 180, alle: 100 }, { ein: 110, alle: 100 });
            const STOSS = lage(8, { vor: 0, nach: 0, station: 8 });
            const M = (wert, soll, an = {}) => ({ wort: "t ms", wert, soll, ...an });
            const rotM = (...ms) => ({ gruen: false, zahl: "t " + ms.map((m) => massRoh(m)).join("/"), grund: "ROT: t " + ms.map((m) => massRoh(m)).join("/"), mass: ms });
            const gpuSt = { ...zeitSt, gpu: true }, bildSt = { ...zeitSt, zeit: false };
            const gruenT = (u) => u.gruen === true && !u.ungemessen && /^GRÜN trotz Last: Referenz f /.test(u.grund);
            const rotT = (rest) => (u) => u.gruen === false && !u.ungemessen && u.grund.startsWith("ROT: ") && u.grund.includes(" · ROT trotz Last: Referenz f ") && u.grund.endsWith(rest);
            const unscharf = (rest, wdh = false) => (u) => u.ungemessen === true && u.gruen === false && u.zahl === u.grund && u.grund.includes(" — unscharf unter Last: " + rest + " — kein Urteil") && !!u.wiederholen === wdh;
            const offenWeil = (text) => (u) => u.ungemessen === true && u.gruen === false && u.grund.includes(text + " — kein Urteil, UNGEMESSEN");
            const wieGemessen = (e) => (u) => u.gruen === e.gruen && !u.ungemessen && u.grund === e.grund && u.zahl === e.zahl;
            const abbruch = { ...rotM(M(990, 33)), grund: "Deckel 90 s gerissen: Stille — beendet · t 990" };
            const S = [
                ["(a) GRÜN unter f 1,8 → GRÜN mit Vermerk", zeitSt, { gruen: true, zahl: "t 30", mass: [M(30, 33)] }, L, F18, gruenT],
                ["(b) ROT 990 gegen ≤ 33 unter f 1,8 → ROT trotz Last", zeitSt, rotM(M(990, 33)), L, F18, rotT("t ms roh 990, entlastet ≥ 550, Schwelle ≤ 33")],
                ["(c) ROT 40 unter f 1,8, vor = nach → UNGEMESSEN unscharf, keine Wiederholung", zeitSt, rotM(M(40, 33)), L, F18, unscharf("t ms roh 40, entlastet ≥ 22,22, Schwelle ≤ 33")],
                ["(d) ROT 40 unter f 1,8, vor ≠ nach → UNGEMESSEN unscharf, EINE Wiederholung", zeitSt, rotM(M(40, 33)), L, SCHW, unscharf("t ms roh 40, entlastet ≥ 22,22, Schwelle ≤ 33", true)],
                ["(e) Bild-Station ROT unter f 1,8 → ROT wie gemessen", bildSt, rotM(M(990, 33)), L, F18, wieGemessen(rotM(M(990, 33)))],
                ["Ruhe f 1 neben 1,5 Kernen fremd → ROT 40 wie gemessen", zeitSt, rotM(M(40, 33)), L0, F1, wieGemessen(rotM(M(40, 33)))],
                ["„≥“ 10 gegen ≥ 30 unter f 1,8 (entlastet 18) → ROT trotz Last", zeitSt, rotM(M(10, 30, { richtung: "≥" })), L, F18, rotT("t ms roh 10, entlastet ≤ 18, Schwelle ≥ 30")],
                ["„≥“ 20 gegen ≥ 30 unter f 1,8 (entlastet 36) → UNGEMESSEN unscharf", zeitSt, rotM(M(20, 30, { richtung: "≥" })), L, F18, unscharf("t ms roh 20, entlastet ≤ 36, Schwelle ≥ 30")],
                ["ausgeblieben (≥ 8000 gegen ≤ 500) unter f 1,8 → ROT trotz Last", zeitSt, rotM(M(null, 500, { ab: 8000 })), L, F18, rotT("t ms roh ≥ 8000 (ausgeblieben), entlastet ≥ 4444, Schwelle ≤ 500")],
                ["GPU-Station, Maß der Karte: 50 gegen ≤ 33 unter f 1,3 → ÷ 2 (Karte) → UNGEMESSEN unscharf", gpuSt, rotM(M(50, 33)), L, F13, unscharf("t ms roh 50, entlastet ≥ 25 (÷ 2, Karte), Schwelle ≤ 33")],
                ["GPU-Station, Maß der CPU: 50 gegen ≤ 33 unter f 1,3 → ROT trotz Last", gpuSt, rotM(M(50, 33, { cpu: true })), L, F13, rotT("t ms roh 50, entlastet ≥ 38,46, Schwelle ≤ 33")],
                ["Stoß: f 1 an beiden Fahrten, 8 Kerne fremd IN der Station (4 Kerne, 0,3 eigen) → f max(8,3 ÷ 4, 1 + 8 ÷ 4) = 3 → 50 gegen ≤ 33 UNGEMESSEN unscharf", zeitSt, rotM(M(50, 33)), STOSS, F1, unscharf("t ms roh 50, entlastet ≥ 16,67, Schwelle ≤ 33")],
                ["fest (Befehle 210 gegen ≤ 208) unter f 1,8 → ROT trotz Last, nie geteilt", zeitSt, rotM(M(210, 208, { fest: true })), L, F18, rotT("t ms roh 210 (fest), Schwelle ≤ 208")],
                ["ROT ohne Maß unter f 1,8 → UNGEMESSEN (die Station nennt kein Maß)", zeitSt, { gruen: false, zahl: "kein Bild", grund: "ROT: kein Bild" }, L, F18, offenWeil(" — die Station nennt kein Maß")],
                ["Abbruch mit weitem Maß unter f 1,8 → UNGEMESSEN, der Abbruch vorn, nie entlastet", zeitSt, abbruch, L, F18, (u) => u.ungemessen === true && u.grund.startsWith(abbruch.grund + " · Last: ") && !/entlastet/.test(u.grund)],
                ["Referenz fehlt × ROT 990 → UNGEMESSEN beim Grund", zeitSt, rotM(M(990, 33)), L, { fehler: "die Fäden warfen" }, (u) => u.ungemessen === true && /^Last ohne Referenz \(die Fäden warfen\)/.test(u.grund)],
                ["die Ruhe lernt (3 von 10 Fahrten) × ROT 990 → UNGEMESSEN beim Grund", zeitSt, rotM(M(990, 33)), L, referenzBericht(LAST, LAST, { ...RUHE, n: 3 }, "allein"), (u) => u.ungemessen === true && u.grund.startsWith("Last ohne Referenz (die Ruhe des Rechners lernt (3 von 10 Fahrten))") && u.referenz.vor.ein === 180],
                ["Referenz fehlt × GRÜN → GRÜN", zeitSt, { gruen: true, zahl: "t 30", mass: [M(30, 33)] }, L, { fehler: "die Fäden warfen" }, (u) => u.gruen === true && !u.ungemessen && /^GRÜN trotz Last ohne Referenz/.test(u.grund)],
            ];
            const bricht = (U) => S.filter(([, st, e, b, r, soll]) => { const u = U(st, e, b, r); return !(soll(u) && u.fremd === b); }).map(([n]) => n); // prettier-ignore
            const mitF = (r, f) => (r && !r.fehler ? { ...r, f, fEin: f, fAlle: f } : r);
            const mutanten = {
                "die alte Regel (pauschaler Wurf: jede Zeit-Station über 0,50 fremden Kernen UNGEMESSEN „Fremd-Last“)": (st, e, b, r) => (st.zeit === true && !b.blind && b.fensterKerne >= 0.5
                    ? { ...e, fremd: b, referenz: r, gruen: false, ungemessen: true, grund: "Fremd-Last: " + fremdNamen(b), zahl: "Fremd-Last" } : fremdUrteil(st, e, b, r)),
                "die Referenz liefert immer f 1": (st, e, b, r) => fremdUrteil(st, e, b, mitF(r, 1)),
                "winkt „≥“ unter Last GRÜN durch (Last mache größer)": (st, e, b, r) => (massVon(e.mass).some((m) => m.richtung === "≥") && r && !r.fehler && r.f > REFERENZ_RUHE_BAND
                    ? { ...e, fremd: b, referenz: r, gruen: true, grund: "GRÜN trotz Last" } : fremdUrteil(st, e, b, r)),
                "falsch herum bei „≥“ (geteilt statt mal f)": (st, e, b, r) => fremdUrteil(st, { ...e, mass: (e.mass || []).map((m) => (m.richtung === "≥" ? { ...m, wert: m.wert / (r.f * r.f) } : m)) }, b, r),
                "streng (GRÜN unter Last UNGEMESSEN)": (st, e, b, r) => { const u = fremdUrteil(st, e, b, r); return /^GRÜN trotz /.test(u.grund || "") ? { ...u, gruen: false, ungemessen: true } : u; }, // prettier-ignore
                "taub für Schwankung (nie eine Wiederholung)": (st, e, b, r) => fremdUrteil(st, e, b, r && !r.fehler ? { ...r, schwankt: false } : r),
                "blind für die Art (auch die Bild-Station urteilt die Last)": (st, e, b, r) => ({ ...fremdUrteil({ ...st, zeit: true }, e, b, r), fremd: b }),
                "ohne ausgebliebenes Ereignis (kein ab)": (st, e, b, r) => fremdUrteil(st, { ...e, mass: (e.mass || []).filter((m) => m.wert != null) }, b, r),
                "blind für die Karte (GPU-Station wie CPU)": (st, e, b, r) => fremdUrteil({ ...st, gpu: false }, e, b, r),
                "Karte für jedes Maß (cpu überhört)": (st, e, b, r) => fremdUrteil(st, { ...e, mass: (e.mass || []).map((m) => { const x = { ...m }; delete x.cpu; return x; }) }, b, r), // prettier-ignore
                "blind für den Stoß (nur die Fahrten)": (st, e, b, r) => ({ ...fremdUrteil(st, e, { ...b, spannen: undefined }, r), fremd: b }),
                "fest geteilt": (st, e, b, r) => fremdUrteil(st, { ...e, mass: (e.mass || []).map((m) => ({ ...m, fest: undefined })) }, b, r),
                "taub ohne Maß (ein ROT ohne Zahl bleibt ROT)": (st, e, b, r) => (!massVon(e.mass).length ? { ...e, fremd: b, referenz: r } : fremdUrteil(st, e, b, r)),
                "entlastet den Abbruch (sein Grund fällt)": (st, e, b, r) => fremdUrteil(st, brachAb([e]) ? { ...e, grund: "ROT: " + e.zahl } : e, b, r),
                "ohne Referenz wie Ruhe": (st, e, b, r) => fremdUrteil(st, e, b, r && r.fehler ? F1 : r),
            };
            const gebrochen = bricht(fremdUrteil), faellt = Object.entries(mutanten).map(([n, U]) => [n.split(" (")[0], bricht(U)]);
            const alt = faellt[0][1];
            pruef("LAST DAS GESETZ an gesetzten Eingaben (Ruhe 100/100 ms, f 1,8 · 1,3 · 1 · Stoß 3): " + S.length + " Sätze, " + faellt.length +
                " Mutanten fallen je an ihrem Satz, jeder Satz an einem von ihnen; die alte Regel fällt an (a) und (b), f ≡ 1 an (c)",
                gebrochen.length === 0 && faellt.every(([, s]) => s.length > 0) && S.every(([n]) => faellt.some(([, s]) => s.includes(n))) &&
                    alt.some((n) => n.startsWith("(a)")) && alt.some((n) => n.startsWith("(b)")) && faellt[1][1].some((n) => n.startsWith("(c)")),
                JSON.stringify(gebrochen.length ? { gebrochen, beispiel: (() => { const x = S.find(([n]) => n === gebrochen[0]); return fremdUrteil(x[1], x[2], x[3], x[4]).grund; })() } // prettier-ignore
                    : faellt.map(([n, s]) => n + " fällt an " + (s.length ? s.length + " (" + s[0] + ")" : "KEINEM"))));
            // DAS MASS des ausgebliebenen Ereignisses: massVon trägt `ab` nur ohne Wert und nur an „≤“, massFehl rötet ein GRÜN darüber
            const mv = massVon([M(null, 500, { ab: 8000 }), M(null, 30, { ab: 5, richtung: "≥" }), M(NaN, 500)]);
            pruef("LAST das ausgebliebene Ereignis im Maß: `ab` an „≤“ trägt (≥ 8000), an „≥“ und ohne ab fällt es; ein GRÜN über einem ausgebliebenen Maß ist ein Widerspruch",
                mv.length === 1 && mv[0].ab === 8000 && mv[0].wert === null && massReisst(mv[0]) && /GRÜN mit reißendem Maß t ms ≥ 8000/.test(String(massFehl({ gruen: true, mass: [M(null, 500, { ab: 8000 })] }))) &&
                    /schief/.test(String(massFehl({ gruen: false, mass: [M(3, 500, { ab: 8000 })] }))),
                JSON.stringify(mv));
            // DER BERICHT DER REFERENZ: f je Komponente gegen die Ruhe, nie unter 1, schwankt über 25 %; die Ruhe aus den Fahrten (p10 ab
            // 10 Fahrten, sonst der Bestwert, nur die letzten REFERENZ_RUHE_TAGE)
            const alt20 = new Date(Date.now() - 20 * 864e5).toISOString(), heute = new Date().toISOString();
            const werte = [...Array(20)].map((_, i) => ({ ein: 100 + 10 * i, alle: 200 + 10 * i, zeit: heute }));
            const rh = referenzRuheAus([...werte, { ein: 1, alle: 1, zeit: alt20 }]), rh3 = referenzRuheAus(werte.slice(5, 8));
            const rb = referenzBericht({ ein: 90, alle: 300 }, { ein: 95, alle: 310 }, { ein: 100, alle: 200 }, "allein");
            pruef("LAST die Ruhe und f: p10 aus 20 Fahrten (110/210, die 20 Tage alte fällt), der Bestwert aus 3; f je Komponente (Faden 1, alle 1,55), schwankt bei > 25 %",
                rh.ein === 110 && rh.alle === 210 && rh.n === 20 && rh3.ein === 150 && rh3.alle === 250 && rb.fEin === 1 && rb.fAlle === 1.55 && rb.f === 1.55 && rb.schwankt === false &&
                    referenzBericht({ ein: 100, alle: 100 }, { ein: 130, alle: 100 }, RUHE, "x").schwankt === true && referenzBericht(null, STILL, RUHE, "x").fehler,
                JSON.stringify([rh, rh3, rb]));
            // DIE ABLAGE DER FAHRTEN (der Koordinator 12.11.): der Pool liest NUR referenz-*.json — eine Kandidaten-Datei mit `referenz`-Vermerk,
            // die aus dem Mess-Baum wandert, nimmt nichts mit; merke schreibt die eigene Ablage; die Auffüllung fährt bis REFERENZ_RUHE_MIN nach
            {
                const md = path.join(tmp, "referenz-ablage"), md2 = path.join(tmp, "referenz-leer");
                fs.mkdirSync(md, { recursive: true });
                fs.mkdirSync(md2, { recursive: true });
                const RR = "Attrappe · 4 Kerne", jetzt = new Date().toISOString();
                fs.writeFileSync(path.join(md, "referenz-anderer.json"), JSON.stringify({ rechner: RR, fahrten: [...Array(12)].map((_, i) => ({ umfeld: "allein", ein: 100 + i, alle: 200 + i, zeit: jetzt })) }));
                fs.writeFileSync(path.join(md, "kandidat-gtx.json"), JSON.stringify({ je: { "a.K1#1": { referenz: { rechner: RR, umfeld: "allein", vor: { ein: 1, alle: 1 }, nach: { ein: 1, alle: 1 } }, zeit: jetzt } } }));
                const zaehl = { n: 0 }, fahrtA = async () => (zaehl.n++, { ein: 180, alle: 150, cpuEin: 170 });
                const ra = echteReferenz({ mdir: md, rechner: RR, ablage: path.join(md, "referenz-selbst.json"), fahrt: fahrtA });
                const rhA = ra.ruhe("allein", []);
                fs.rmSync(path.join(md, "kandidat-gtx.json"));
                const rhA2 = echteReferenz({ mdir: md, rechner: RR, ablage: path.join(md, "referenz-selbst.json"), fahrt: fahrtA }).ruhe("allein", []);
                const aufA = await ra.auffuellen("allein");
                pruef("LAST die Ablage wird gelesen: 12 Fahrten aus referenz-anderer.json → Ruhe 101/201 aus 12 (der Vermerk einer Kandidaten-Datei zählt nie, ihr Wandern ändert nichts); ein voller Pool fährt nichts nach",
                    rhA && rhA.n === 12 && rhA.ein === 101 && rhA.alle === 201 && rhA2 && rhA2.n === 12 && rhA2.ein === 101 && aufA.n === 0 && zaehl.n === 0, JSON.stringify([rhA, rhA2, aufA, zaehl.n]));
                // run füllt den Pool selbst auf: vorher (leerer Pool) bleibt ein ROT 990 UNGEMESSEN, nach der Auffüllung (10 Fahrten in Sekunden,
                // in der eigenen Ablage) urteilt es ROT trotz Last; die Mutante, deren Auffüllung nichts fährt, bleibt UNGEMESSEN
                const zaehl2 = { n: 0 }, ablage2 = path.join(md2, "referenz-selbst.json");
                const fahrtB = async () => (zaehl2.n++, { ein: 100, alle: 100, cpuEin: 99 });
                const leer = echteReferenz({ mdir: md2, rechner: RR, ablage: ablage2, fahrt: fahrtB });
                const urteil = (ref) => fremdUrteil(zeitSt, rotM(M(990, 33)), L, referenzBericht(LAST, LAST, ref.ruhe("allein", []), "allein"));
                const vorher = urteil(leer);
                const mutante = { ...leer, auffuellen: async () => ({ n: 0 }) };
                await mutante.auffuellen("allein");
                const mutUrteil = urteil(mutante);
                const auf = await leer.auffuellen("allein");
                const nachher = urteil(leer);
                const datei2 = JSON.parse(fs.readFileSync(ablage2, "utf8"));
                const quelle = run.toString() + fahreSitzung.toString();
                pruef("LAST run füllt den Pool selbst auf: leer → ROT 990 UNGEMESSEN („keine Ruhe“); die Auffüllung fährt 10 Fahrten in die eigene Ablage, danach ROT trotz Last; die Mutante ohne Auffüllung bleibt UNGEMESSEN; run (allein) und fahreSitzung (sitzung) rufen sie",
                    vorher.ungemessen === true && /keine Ruhe des Rechners/.test(vorher.grund) && mutUrteil.ungemessen === true && auf.n === 10 && zaehl2.n === 10 && auf.im === 10 &&
                        datei2.rechner === RR && datei2.fahrten.length === 10 && datei2.fahrten.every((w) => w.umfeld === "allein" && w.cpuEin === 99) &&
                        nachher.gruen === false && !nachher.ungemessen && /ROT trotz Last/.test(nachher.grund) &&
                        quelle.includes("referenzAuffuellen(\"allein\")") && quelle.includes("referenzAuffuellen(\"sitzung\")"),
                    JSON.stringify([vorher.grund.slice(0, 120), mutUrteil.ungemessen, auf, zaehl2.n, datei2.fahrten.length, nachher.grund.slice(0, 160)]));
                // DIE VERDRÄNGUNG: Wanduhr 220 bei Faden-CPU 156,4 gegen eine Ruhe von 220 (unter Last gelernt) → der Faden trägt dennoch f
                // = 220 ÷ (156,4 + ein Schritt); ohne Faden-CPU bleibt sie 1; die Mutante ohne Verdrängung urteilt dort f 1 (Ruhe → ROT wie gemessen)
                const vor = { ein: 220, alle: 100, cpuEin: 156.4 }, rv = referenzBericht(vor, vor, { ein: 220, alle: 100, n: 20, von: "x" }, "allein");
                const soll = +(220 / (156.4 + REFERENZ_CPU_SCHRITT_MS)).toFixed(3);
                const ohneCpu = referenzBericht({ ein: 220, alle: 100 }, { ein: 220, alle: 100 }, { ein: 220, alle: 100, n: 20, von: "x" }, "allein");
                const mutV = { ...rv, f: 1, fEin: 1, verdraengt: 1 };
                const uV = fremdUrteil(zeitSt, rotM(M(40, 33)), L, rv), uM = fremdUrteil(zeitSt, rotM(M(40, 33)), L, mutV);
                pruef("LAST die Verdrängung ohne gelernte Ruhe: Wanduhr 220 ÷ (Faden-CPU 156,4 + " + fz1(REFERENZ_CPU_SCHRITT_MS) + ") = " + fzW(soll) + " hebt den Faden über die unter Last gelernte Ruhe; ohne Faden-CPU 1; die Mutante ohne Verdrängung macht aus „unscharf“ ein ROT",
                    rv.fEin === soll && rv.verdraengt === soll && rv.f === soll && ohneCpu.f === 1 && ohneCpu.verdraengt === 1 &&
                        (soll > REFERENZ_RUHE_BAND ? uV.ungemessen === true && /unscharf unter Last/.test(uV.grund) && uM.gruen === false && !uM.ungemessen : true),
                    JSON.stringify([rv, ohneCpu.f, uV.grund && uV.grund.slice(0, 120), uM.grund]));
            }
            // DIE SPANNEN DES BERICHTS (fremdBericht): je Takt die fremden Kerne; vor und nach das Mittel der deckenden Takte, die Station ihre Spitze
            const sp = fremdBericht({ tA: 0, reihe: [[2000, 0.2], [4000, 4], [6000, 0.2]], letzt: new Map(), erst: new Map() }, 5600, 2000, null,
                { vor: [500, 1500], station: [2100, 3900], nach: [4500, 5500] }).spannen;
            const sRadeon = stossF({ rechnerKerne: 24, s: 10, eigenS: 80 }, 11.15), sOmen = stossF({ rechnerKerne: 12, s: 10, eigenS: 60 }, 7);
            pruef("LAST die Spannen des Zeugen: vor 0,1 · Station Spitze 2 · nach 0,1 Kerne fremd; der Stoß teilt den Rechner (Radeon 24 Kerne, 8 eigen, 11,15 fremd → 1,465; OMEN 12, 6 eigen, 7 fremd → 1,583)",
                sp && sp.vor === 0.1 && sp.station === 2 && sp.nach === 0.1 && sRadeon === 1.465 && sOmen === 1.583, JSON.stringify([sp, sRadeon, sOmen]));
        }
        // DER LESER DES WINDOWS-ZEUGEN an gesetzten Zeilen (zeugenLeser — derselbe, der den PowerShell-Lauf liest; kein Prozess, keine
        // Wanduhr): zwei Takte, der zweite 10 s hinter dem ersten und in zwei Stücken, mitten in ihrer Zeile. Die fremde PID 77 hängt an einem
        // toten Vermittler und trägt den Namen ihrer Kommandozeile (nur der erste Takt bringt die C-Zeile), das Leerlauf-Konto (PID 0)
        // rechnet 240 Kerne und zählt nie, die Wurzel und ihr Kind (3 Kerne — derselbe Busy als eigene Station) sind eigen, System ist Diener,
        // der HP-Dienst (AppHelperCap.exe, 2 Kerne, der Name des Win32_Process) ist Gerät
        const ATT = "punkte-fremdlast-attrappe";
        const hns = (s) => Math.round(s * 1e7);
        const zeilen = (t, s, fremdK, mitC) => ["T\t" + t,
            "P\t0\t0\t" + hns(900 + 240 * s) + "\t0\tSystem Idle Process",
            "P\t4\t0\t" + hns(70 + 2 * s) + "\t" + (T0 - 9e6) + "\tSystem",
            "P\t" + WZ + "\t1\t" + hns(1 + 0.1 * s) + "\t" + (T0 - 1e6) + "\tnode.exe",
            "P\t" + (WZ + 1) + "\t" + WZ + "\t" + hns(2 + 3 * s) + "\t" + (T0 - 5e5) + "\tnode.exe",
            "P\t77\t9999\t" + hns(5 + fremdK * s) + "\t" + (T0 - 1e5) + "\tnode.exe",
            "P\t91\t4\t" + hns(40 + 2 * s) + "\t" + (T0 - 8e6) + "\tAppHelperCap.exe",
            ...(mitC ? ["C\t77\t\"C:\\Program Files\\nodejs\\node.exe\" -e while(1){} " + ATT, "C\t" + (WZ + 1) + "\tnode.exe -e while(1){} punkte-fremdlast-eigen"] : []),
            "E", ""].join("\r\n");
        const gelesen = async (fremdK) => {
            let lies2 = null;
            const z = fremdZeuge({ quelle: { start: (gib) => (lies2 = zeugenLeser(gib)), stop() {} }, taktMs: 500, wurzel: WZ });
            const t = Date.now();
            lies2(zeilen(t, 0, fremdK, true));
            const f = z.beginn(), zwei = zeilen(t + 10000, 10, fremdK, false), mitte = zwei.indexOf("P\t77\t") + 9;
            lies2(zwei.slice(0, mitte));
            lies2(zwei.slice(mitte));
            const b = await z.ende(f);
            z.stop();
            return b;
        };
        const lHoch = await gelesen(2), NAME = "node.exe -e while(1){} " + ATT;
        pruef("LAST der Leser des Windows-Zeugen an gesetzten Zeilen (zeugenLeser, zwei Takte im Abstand von 10 s): der fremde Prozess trägt den Namen seiner Kommandozeile über den Takt hinweg, das Leerlauf-Konto zählt nie, der eigene Baum, der Diener und der HP-Dienst (Gerät) sind nie fremd",
            JSON.stringify(lHoch.namen) === JSON.stringify([[NAME, 20]]) && lHoch.fensterKerne === 2 && lHoch.s === 10 && lHoch.takte === 1 && lHoch.eigenS === 31 &&
                JSON.stringify(lHoch.diener) === JSON.stringify([["System", 20]]) && JSON.stringify(lHoch.geraet) === JSON.stringify([["AppHelperCap.exe", 20]]) && lHoch.geraetS === 20,
            JSON.stringify(lHoch));
        // DER ECHTE ZEUGE der Plattform (Linux /proc, Windows der PowerShell-Lauf) liest das lebende Gerät: ein STAND, nie ein Urteil
        const echtZ = fremdZeuge({ taktMs: 500 });
        await echtZ.bereit();
        const echtF = echtZ.beginn();
        await new Promise((ja) => setTimeout(ja, 1500));
        const echtB = await echtZ.ende(echtF);
        echtZ.stop();
        console.log("  STAND der echte Zeuge (" + process.platform + ", Takt 500 ms, kein Urteil): " + (echtB.blind ? "blind — " + echtB.blind + " (" + echtB.takte + " Takte in 1,5 s)"
            : fz2(echtB.fensterKerne) + " Kerne fremd im Fenster (" + echtB.takte + " Takte in " + fz1(echtB.s) + " s)" + (echtB.namen.length ? " · " + fremdNamen(echtB) : "")));
    }
    // (5m) DER MESSORT (pm-fremdlast; keinUrteil (d), die EINE Marke MESSORT_MARKE): die ECHTE Folge von schatten.K1#2 (stationen/g3.js)
    // gegen eine Werkbank-Attrappe im Baum — der muss-Schritt `buehne` wirft „Messort buehne: nach dem Wechsel steht die Seite nicht in
    // pruefbuehne“ (der Befund 08.11. an a7a9d7bf · e475c6b4) → UNGEMESSEN (Messort) beim Namen, die Ratsche hält das gebuchte GRÜN;
    // ohne Wurf GRÜN und ROT wie heute (das rote Maß der Linse ist RÜCKFALL). Dazu das Tor der Welt-Proben (proben-welt torBefehl), das
    // Werkzeug der Seite (sitzung-seite probeBefehl) und `grundstellung`: ein Wurf am Messort trägt die Marke, ein Wurf daneben nie
    {
        const echtS = echt.stationen.find((s) => schluessel(s) === "schatten.K1#2" && s.probe);
        const fb = path.join(tmp, "messort-baum");
        fs.mkdirSync(path.join(fb, "scripts"), { recursive: true });
        fs.writeFileSync(path.join(fb, "scripts", "werkbank.cjs"), [
            'const fs = require("fs"), a = process.argv.slice(2), art = process.env.PUNKTE_SELBST_ART;',
            "const aus = (o, c = 0) => { console.log(JSON.stringify(o, null, 1)); process.exit(c); };",
            "const pose = (zu) => ({ fuss: { halbschattenCm: 2.1, kanten: 10, von: 12 }, zuwachs: { scheibeCmJeM: zu, kanten: 44, von: 44, wegM: 9.25 } });",
            'if (a[0] === "fenster") aus({ ms: 3, fenster: [1920, 1080] });',
            'if (a[0] === "umstellen") art === "messort" ? aus({ ms: 2248, fehler: "Messort buehne: nach dem Wechsel steht die Seite nicht in pruefbuehne", stapel: ["at weltDesOrts (scripts/werkbank.cjs:958:37)"] }, 1) : aus({ ms: 120 });',
            'if (a[0] === "licht") aus({ "0.5": { treueBytes: 0, posen: { ego: pose(art === "rot" ? 0.503 : 0.938), third: pose(0.793) } }, "0.3": { treueBytes: 0, posen: { ego: pose(0.929), third: pose(0.875) } } });',
            'if (a[0] === "zerlegen") { fs.writeFileSync(a[a.indexOf("--json") + 1], JSON.stringify({ auswertung: { zeilen: [{ id: "k0", deltaMs: 0.09 }] } })); aus({ ms: 50 }); }',
            'aus({ fehler: "unbekannt " + a[0] }, 2);',
        ].join("\n"));
        const log = path.join(tmp, "messort-sitzung.log");
        fs.writeFileSync(log, "WERKBANK bereit\n[linse-gpu] amd/rdna-3\n");
        const fo = echtS && { ...st0, befehl: echtS.probe.befehl, env: { ...(echtS.env || {}), PUNKTE_SITZUNG_LOG: log }, urteil: echtS.urteil };
        const fahreArt = async (art) => {
            process.env.PUNKTE_SELBST_ART = art;
            try { return await fahreStation(fo, { ...ctx("messort-" + art), baum: fb }); } finally { delete process.env.PUNKTE_SELBST_ART; }
        };
        const [mo, gr, ro] = fo ? [await fahreArt("messort"), await fahreArt("gruen"), await fahreArt("rot")] : [{}, {}, {}];
        pruef("MESSORT die echte Folge von schatten.K1#2: der muss-Schritt buehne wirft „Seite steht nicht“ → UNGEMESSEN (Messort) beim Namen; ohne Wurf GRÜN und ROT wie heute",
            !!fo && mo.ungemessen === true && mo.gruen === false &&
            /^Messort: buehne: Messort buehne: nach dem Wechsel steht die Seite nicht in pruefbuehne — kein Urteil, UNGEMESSEN \(die Probe sah: Folge: /.test(mo.grund) &&
            gr.gruen === true && !gr.ungemessen && /^Uhr 0\.5 ego 0\.938 cm\/m \(44\/44 Kanten/.test(gr.zahl) &&
            ro.gruen === false && !ro.ungemessen && /^ROT: Uhr 0\.5 ego 0\.503 cm\/m/.test(ro.grund),
            JSON.stringify([mo, gr, ro].map((x) => [x.gruen, !!x.ungemessen, String(x.grund || x.zahl).slice(0, 200)])));
        // die Ratsche: das gebuchte GRÜN hält gegen den Messort-Wurf (gehalten, sein Grund im Stand), das rote Maß der Linse ist RÜCKFALL
        const id = fo ? schluessel(fo) : "-";
        const lauf = (sha, e) => {
            const m = { sha, geraet: "headless", je: {} };
            eintragen(m, id, stationsEintrag(e, { zeit: "2026-11-08T08:00:00Z", abdruck: abdruck(fo, h), port: null, bahn: "1/1" }));
            return m;
        };
        const alt1 = (sha) => (sha === "a1" ? ["stamm/wasser-hydro.js"] : []);
        const vor = fo && buchen("alt", [fo], [M("a1", "headless", id, fo, true)], keine, h);
        const halt = fo && buchen("kopf", [fo], [M("a1", "headless", id, fo, true), lauf("c3", mo)], alt1, h, [], { vorher: vor });
        const fall = fo && buchen("kopf", [fo], [M("a1", "headless", id, fo, true), lauf("c3", ro)], alt1, h, [], { vorher: vor });
        const hs = halt && halt.je[fo.kriterium].stationen[0];
        pruef("MESSORT die Ratsche hält das gebuchte GRÜN gegen den Messort-Wurf, das rote Maß der Linse ist RÜCKFALL",
            !!halt && halt.je[fo.kriterium].punkte === 1 && !halt.rueckfall.length && hs.gehalten === true && /zuletzt an c3: Messort: buehne: Messort buehne/.test(hs.grund) &&
            fall.je[fo.kriterium].punkte === 0 && fall.rueckfall.length === 1 && /^gelaende\.K4#1 headless: Uhr 0\.5 ego 0\.503 cm\/m/.test(fall.rueckfall[0]),
            JSON.stringify(halt && [halt.je[fo.kriterium], halt.rueckfall, fall.rueckfall]));
        // das Tor (proben-welt) gegen eine Werkbank-Attrappe: /umstellen antwortet mit fehler → die Marke; ein Wurf daneben (ein Anker der
        // Linse) bleibt beim alten Urteil; das Werkzeug der Seite (sitzung-seite): /umstellen ohne Werkbank → die Marke
        const srv = require("http").createServer((q, a) => {
            q.resume();
            q.on("end", () => a.end(JSON.stringify(q.url === "/umstellen" ? { ms: 30, fehler: "Messort wiese: der Ring 120 m steht nicht nach 300 Takten" } : { ms: 1, ergebnis: 2 })));
        });
        await new Promise((ja) => srv.listen(0, "127.0.0.1", ja));
        const wp = srv.address().port;
        const zu = require("http").createServer();
        await new Promise((ja) => zu.listen(0, "127.0.0.1", ja));
        const zuPort = zu.address().port;
        await new Promise((ja) => zu.close(ja));
        const { torBefehl } = require(path.join(DIR, "stationen", "proben-welt.cjs"));
        const { probeBefehl } = require(path.join(DIR, "stationen", "sitzung-seite.js"));
        const fehlerZeile = (j, l) => {
            const f = /^PROBE-FEHLER (.*)$/m.exec(l.stdout), z = /^MASS (\d+)$/m.exec(l.stdout);
            return z ? { gruen: +z[1] <= 3, zahl: "Maß " + z[1] } : { gruen: false, zahl: f ? "Probe: " + f[1].split(" | ")[0] : "keine MASS-Zeile (Exit " + l.exit + ")" };
        };
        const torSt = (fn) => ({ ...st0, befehl: torBefehl(fn), env: { WERKBANK_PORT: String(wp) }, urteil: fehlerZeile });
        const [tm, ta, tg] = [
            await fahreStation(torSt(async (tor) => { await tor.ruf("/umstellen", { ort: "wiese" }, 5000); console.log("MASS 2"); }), ctx("tor-messort")),
            await fahreStation(torSt(async (tor) => { await tor.ruf("/eval", {}, 5000); throw new Error("ANKER fehlt in scripts/diag-x.cjs: rahmen"); }), ctx("tor-anker")),
            await fahreStation(torSt(async (tor) => { const e = await tor.ruf("/eval", {}, 5000); console.log("MASS " + e.ergebnis); }), ctx("tor-gruen")),
        ];
        srv.close();
        const seiteSt = { ...st0, befehl: probeBefehl(async (H) => { await H.wb("/umstellen", { ort: "wiese" }, 3000); return { n: 0 }; }, 30).befehl.map((a) => (a === "{PORT}" ? String(zuPort - 20000) : a)),
            urteil: (j) => (j ? { gruen: j.n === 0, zahl: "n " + j.n } : { gruen: false, zahl: "keine Ausgabe" }) };
        const sm = await fahreStation(seiteSt, ctx("seite-messort"));
        const gs = spawnSync(process.execPath, [__filename, "grundstellung", "--port", String(zuPort), "--grund", path.join(tmp, "kein-grund.json")], { encoding: "utf8", timeout: 60000 });
        pruef("MESSORT das Tor, das Werkzeug der Seite und die Grundstellung tragen die Marke beim Namen; ein Wurf daneben (der Anker der Linse) bleibt ROT, das Maß GRÜN",
            tm.ungemessen === true && /^Messort: \/umstellen: Messort wiese: der Ring 120 m steht nicht nach 300 Takten — kein Urteil, UNGEMESSEN/.test(tm.grund) &&
            ta.gruen === false && !ta.ungemessen && /^ROT: Probe: Error: ANKER fehlt in scripts\/diag-x\.cjs: rahmen$/.test(ta.grund) && tg.gruen === true && !tg.ungemessen &&
            sm.ungemessen === true && new RegExp("^Messort: /umstellen: .*ECONNREFUSED.* — kein Urteil, UNGEMESSEN").test(sm.grund) &&
            gs.status === 1 && /^@@PUNKTE@@ MESSORT Grundstellung: kein Grund der Sitzung/m.test(gs.stdout),
            JSON.stringify([tm.grund, ta.grund, tg.zahl, sm.grund, gs.status, String(gs.stdout).slice(-200)]));
    }
    b = buchen("kopf", [s1, s2], m2, () => ["stamm/klang.js", "README.md"], h);
    pruef("BUCHUNG R6 fremde Datei → bleibt 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, (sha) => { if (sha === "a1") throw new Error("unbekannt"); return []; }, h);
    pruef("BUCHUNG SHA unbekannt → 0", b.je["gelaende.K4"].punkte === 0 && /SHA unbekannt/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true, "2026-10-23T09:00:00Z"), M("c3", "radeon", "gelaende.K4#1", s1, false, "2026-10-23T11:00:00Z")], keine, h);
    pruef("BUCHUNG jüngeres ROT schlägt älteres GRÜN → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [{ ...s1, befehl: ["node", "-e", "1"] }], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG Station geändert → alte Messung zählt nicht", b.je["gelaende.K4"].punkte === 0 && /Station seit der Messung geändert/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [], keine, h);
    pruef("BUCHUNG ungemessen → 0 (R10)", b.je["gelaende.K4"].punkte === 0 && /R10/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 grün ohne Staffel 1 → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    {
        const sb = { ...s1, beide: true };
        const nur = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true)], keine, h);
        const zwei = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true), M("b2", "gtx", "gelaende.K4#1", sb, true)], keine, h);
        pruef("BUCHUNG Staffel 1 mit beide: ein grünes Gerät → 0, beide grün → 1", nur.je["gelaende.K4"].punkte === 0 && /gelaende.K4#1 gtx/.test(nur.je["gelaende.K4"].beleg) && zwei.je["gelaende.K4"].punkte === 1,
            nur.je["gelaende.K4"].beleg + " / " + zwei.je["gelaende.K4"].beleg);
        const gn = gtxNutzen(nur);
        pruef("GTX-NUTZEN Staffel 1 mit beide hinter grüner Radeon bleibt in der Liste", gn.ja.join() === "gelaende.K4#1", JSON.stringify(gn));
    }
    // (5b) DIE LINSE an der Buchung (R6 über das Werkzeug): ein Umbau der Linse — im Befehl genannt oder per require geladen —
    // macht die Messung alt; fremdes Werkzeug nie. Der require-Gang ist rufe der Stamm-Bibliothek am Kopf des Spiel-Klons
    {
        const { rufe } = stammAm(spielRepo(), "origin/main");
        const texte = {
            "scripts/diag-x.cjs": '#!/usr/bin/env node\nconst { pruefer } = require("./lib/y.cjs");\nconst ort = require("../spec/ort.json");\n',
            "scripts/lib/y.cjs": 'module.exports = require("./z");\n', "scripts/lib/z.cjs": "module.exports = 1;\n", "scripts/lib/fremd.cjs": "1;\n",
            "spec/ort.json": "{}", "stamm/wasser-hydro.js": "",
        };
        const sl = { ...s1, befehl: ["node", "scripts/diag-x.cjs", "--port", "{PORT}"] };
        const ls = linsenVon(sl, Object.keys(texte), (f) => (f in texte ? texte[f] : null), rufe);
        pruef("LINSE Befehl und require-Hülle (stamm.cjs rufe)", ls.join() === "scripts/diag-x.cjs,scripts/lib/y.cjs,scripts/lib/z.cjs,spec/ort.json", ls.join());
        const ml = [M("a1", "radeon", "gelaende.K4#1", sl, true)];
        const radeon = (w) => w.je["gelaende.K4"].stationen.find((x) => x.geraet === "radeon");
        let w = buchen("kopf", [sl], ml, () => ["scripts/lib/z.cjs"], h, [], { linsen: () => ls });
        pruef("LINSE geändert → ungemessen mit dem Grund", w.je["gelaende.K4"].punkte === 0 && radeon(w).ungemessen && radeon(w).grund === "Linse seit der Messung geändert (R6: scripts/lib/z.cjs)", JSON.stringify(radeon(w)));
        w = buchen("kopf", [sl], ml, () => ["scripts/lib/fremd.cjs", "README.md"], h, [], { linsen: () => ls });
        pruef("LINSE unverändert (fremdes Werkzeug geändert) → frisch", w.je["gelaende.K4"].punkte === 1 && radeon(w).gruen, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [sl], ml, () => [], h, [], { linsen: () => { throw new Error("Linse scripts/diag-x.cjs unlesbar: x"); } });
        pruef("LINSE unlesbar → ungemessen beim Namen", w.je["gelaende.K4"].punkte === 0 && /Linse unlesbar — kein R6-Urteil/.test(radeon(w).grund), radeon(w).grund);
    }
    // (5k) R6 NACH KONSUM (Abschnitt „Konsum“; die Linse mit ihren Mutanten): eine Station veraltet nur, wenn sie den geänderten Code
    // AUSFÜHRTE. Ende zu Ende: der Läufer, der Zeuge in jedem node-Prozess, ein Browser mit Seite und Faden — die Linsen-Bibliothek
    // scripts/lib/linse.cjs führt `ja` aus, reicht `inSeite` als Text an die Seite und ruft `nein` nie; beim Laden gießt sie `gegossen`
    // und `nieGegossen` in Install-Texte, die Linse gibt nur den ersten an die Seite; die Seite führt `getan` aus und `nie` nie, der
    // Faden `imFaden`, sie holt daten.json; ein Kind ruft `k` und wird getötet (der Zeuge bittet es vorher um den Abschluss)
    {
        const baum = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-konsum-"));
        const fn = (n, r) => "function " + n + "() {\n    return " + r + ";\n}\n";
        const pp = path.join(spielRepo(), "node_modules", "puppeteer").split(path.sep).join("/");
        const texte = {
            "probe.html": '<!doctype html><script src="probe.js"></script>',
            "probe.js": fn("getan", 1) + fn("nie", 2) + 'getan();\nnew Worker("faden.js").onmessage = (e) =>\n    fetch("daten.json").then((r) => r.json()).then((j) => (window.da = e.data + j.n));\n',
            "faden.js": fn("imFaden", 5) + fn("nieFaden", 6) + "postMessage(imFaden());\n",
            "kind.js": "exports.k = " + fn("", 1) + "exports.nie = " + fn("", 2),
            "daten.json": '{ "n": 1 }',
            "scripts/werk.sh": "echo 1\n",
            "scripts/lib/linse.cjs": "const TAFEL = { soll: 1 };\n" + fn("ja", "TAFEL.soll") + fn("nein", 2) + fn("inSeite", 3) + fn("gegossen", 4) + fn("nieGegossen", 5) +
                "const INSTALL = `window.__g = ${gegossen.toString()};`;\nconst NIE_INSTALL = `window.__n = ${nieGegossen.toString()};`;\nmodule.exports = { ja, nein, inSeite, INSTALL, NIE_INSTALL };\n",
            "scripts/lauf.cjs": ['const http = require("http"), fs = require("fs"), path = require("path"), L = require("./lib/linse.cjs");', "L.ja();",
                'const kind = require("child_process").spawn(process.execPath, ["-e", "require(\'./kind.js\').k(); console.log(1); setInterval(() => {}, 1000)"], { stdio: ["ignore", "pipe", "inherit"] });',
                'kind.stdout.once("data", () => kind.kill());',
                'const s = http.createServer((q, a) => fs.readFile(path.join(process.cwd(), q.url.slice(1)), (e, d) => a.end(e ? "" : d)));',
                's.listen(0, "127.0.0.1", async () => {', '    const b = await require("' + pp + '").launch({ args: ["--no-sandbox"] });', "    const p = await b.newPage();",
                '    await p.goto("http://127.0.0.1:" + s.address().port + "/probe.html");', "    await p.waitForFunction(() => window.da === 6, { timeout: 20000 });",
                "    const drei = await p.evaluate(L.inSeite);", "    await p.evaluate(L.INSTALL);", '    const vier = await p.evaluate("window.__g()");', "    await b.close();", "    s.close();",
                "    fs.writeFileSync(process.argv[2], JSON.stringify({ n: drei - 3 + vier - 4 }));", "});", ""].join("\n"),
        };
        for (const [n, x] of Object.entries(texte)) (fs.mkdirSync(path.dirname(path.join(baum, n)), { recursive: true }), fs.writeFileSync(path.join(baum, n), x));
        const acorn = acornVon(spielRepo());
        const sk = { ...st0, befehl: ["node", "scripts/lauf.cjs", "{AUS}"], urteil: lies, pfad: ["probe.js", "anders.js", "scripts/lib/linse.cjs"] };
        const ek = await fahreStation(sk, { ...ctx("konsum"), baum, deckelMinS: 120 });
        const K = ek.konsum ? konsumVon(ek, null).k : {};
        const zeilen = (f) => (!K[f] || K[f] === "*" ? K[f] : skriptZeilen(skriptVon(texte[f], acorn), K[f].split(":")[1]).map(([x, y]) => (x === y ? x : x + "-" + y)).join(","));
        // `nein` (Zeilen 5–7), `nieGegossen` (14–16) und `nie` fehlen bis auf die Zeile ihrer schließenden Klammer (ihr Umbruch ist Kopf-Code)
        const soll = { "scripts/lib/linse.cjs": "1-4,7-13,16-21", "probe.js": "1-3,6-11", "faden.js": "1-3,6-9", "kind.js": "1-4,6-8", "daten.json": "*", "probe.html": "*" };
        pruef("KONSUM Ende zu Ende: ausgeführt und gelesen, nie das Nie — die Linsen-Bibliothek im Knoten (ihr Kopf-Code, `ja`, der Text von `inSeite`, der an die Seite gegebene Install-Text; nie `nein`, nie der nur gegossene), die Seite, der Faden, das getötete Kind, die JSON; die Seite trägt er (kein Zeit-Urteil)",
            ek.gruen && ek.konsumSeite === true && Object.entries(soll).every(([f, s]) => zeilen(f) === s) && /^1-/.test(zeilen("scripts/lauf.cjs") || ""),
            JSON.stringify({ gruen: ek.gruen, zahl: ek.zahl, seite: ek.konsumSeite, fehlt: ek.konsumFehlt, zeilen: Object.fromEntries(Object.keys(K).map((f) => [f, zeilen(f)])) }));
        // DIE MUTANTEN an der Buchung: (a) eine Änderung in einer ausgeführten Funktion macht die Station alt, (b) eine Änderung in einer nie
        // ausgeführten Funktion derselben Datei lässt sie frisch, (c) eine Station ohne Konsum-Menge urteilt wie bisher und ist beim Namen gezählt
        const skript = () => (f) => (f in texte ? skriptVon(texte[f], acorn) : null);
        const mk = (mehr) => ({ sha: "a1", geraet: "headless", je: { "gelaende.K4#1": { gruen: true, zahl: "z", zeit: "2026-11-10T10:00:00Z", abdruck: abdruck(sk, h), ...mehr } } });
        const mitK = mk({ konsum: ek.konsum || "", konsumSeite: ek.konsumSeite });
        const d = (f, a, b, neu = false) => () => ({ dateien: [f], zeilen: new Map([[f, [[a, b]]]]), neu: new Set(neu ? [f] : []) });
        const buche = (m, g, linse = []) => buchen("kopf", [sk], [m], g, h, [], { skript, linsen: () => linse });
        const fall = (name, m, g, punkte, grund, linse) => {
            const b = buche(m, g, linse), x = b.je["gelaende.K4"], e = x.stationen[0];
            pruef(name, x.punkte === punkte && (!grund || grund.test(e.grund || "")), x.beleg + " · r6 " + JSON.stringify(b.r6));
            return b;
        };
        fall("KONSUM (a) Änderung in `ja` (ausgeführt) → alt beim Namen der Datei → 0", mitK, d("scripts/lib/linse.cjs", 3, 3), 0, /^Konsum seit der Messung geändert \(R6: scripts\/lib\/linse\.cjs\)$/);
        const b = fall("KONSUM (b) Änderung in `nein` (nie ausgeführt, dieselbe Datei) → frisch → 1", mitK, d("scripts/lib/linse.cjs", 6, 6), 1);
        pruef("KONSUM die Buchung zählt die Hälfte nach Konsum", b.r6.konsum === 1 && b.r6.naehe.length === 0 && b.r6.haelften === 1 && /^R6 nach Konsum: 1 von 1 Hälften/.test(r6Zeile(b.r6)), r6Zeile(b.r6));
        const c = fall("KONSUM (c) dieselbe Änderung an einer Messung OHNE Konsum-Menge → die Linse urteilt wie bisher → alt → 0", mk({ konsumFehlt: "1 Prozess(e) ohne Ende" }), d("scripts/lib/linse.cjs", 6, 6), 0,
            /^Linse seit der Messung geändert \(R6: scripts\/lib\/linse\.cjs\)$/, ["scripts/lib/linse.cjs"]);
        pruef("KONSUM (c) die Station ohne Konsum-Menge ist beim Namen gezählt", c.r6.konsum === 0 && c.r6.naehe.join() === "gelaende.K4#1 headless" && /ohne Konsum-Menge \(R6 nach Linse und Glob wie bisher\) 1: gelaende\.K4#1 headless/.test(r6Zeile(c.r6)), r6Zeile(c.r6));
        fall("KONSUM Text von `inSeite` (an die Seite gereicht, im Knoten nie gerufen) geändert → alt → 0", mitK, d("scripts/lib/linse.cjs", 9, 9), 0, /^Konsum/);
        fall("KONSUM Kopf-Code der Linse geändert (die Tafel, `module.exports`) → alt → 0", mitK, d("scripts/lib/linse.cjs", 19, 19), 0, /^Konsum/);
        fall("KONSUM `gegossen` geändert (beim Laden in den Install-Text gegossen UND an die Seite gegeben) → alt → 0", mitK, d("scripts/lib/linse.cjs", 12, 12), 0, /^Konsum/);
        fall("KONSUM `nieGegossen` geändert (beim Laden gegossen, nie ausgegeben: eine Konstante führt nichts aus) → frisch → 1", mitK, d("scripts/lib/linse.cjs", 15, 15), 1);
        fall("KONSUM Einfügung im Rumpf von `nein` → frisch → 1", mitK, d("scripts/lib/linse.cjs", 5, 6), 1);
        // EIN KOMMENTAR FÜHRT NICHTS AUS: ein Hunk aus Zeilen-Kommentaren im Kopf-Code lässt die Station frisch — bringt er Code, nie;
        // in einem Schablonen-Text ist `//` Inhalt (die Mutante), dort gilt die Regel nie
        {
            const kt = "// der Kopf\nconst A = 1;\n// über f\n// zweite Zeile\nfunction f() {\n    return A;\n}\nconst S = `\n// Inhalt\n`;\nmodule.exports = { f, S };\n";
            const ks = skriptVon(kt, acorn), hk = (a, b, nurKommentar, ein = false) => Object.assign([a, b], { nurKommentar, ein });
            pruef("KONSUM EIN KOMMENTAR FÜHRT NICHTS AUS: Zeilen-Kommentare ersetzt oder eingefügt → kein Treffer; Code statt Kommentar, ein Kommentar statt Code, `//` im Schablonen-Text (Mutanten) → Treffer",
                kommentarHunk(ks, hk(3, 4, true)) && kommentarHunk(ks, hk(2, 3, true, true)) && kommentarHunk(ks, hk(11, 12, true, true)) &&
                !kommentarHunk(ks, hk(3, 4, false)) && !kommentarHunk(ks, hk(2, 2, true)) && !kommentarHunk(ks, hk(9, 9, true)) && !kommentarHunk(ks, hk(8, 9, true, true)),
                JSON.stringify([[3, 4, true], [2, 3, true, true], [11, 12, true, true], [3, 4, false], [2, 2, true], [9, 9, true], [8, 9, true, true]].map((x) => kommentarHunk(ks, hk(...x)))));
            const wk = stempelDiff("a.js", ["diff --git a/a.js b/a.js", "@@ -3,2 +3 @@", "-// über f", "-// zweite Zeile", "+// über f, neu", "@@ -6 +5 @@", "-    return A;", "+    return A + 1; // mehr"].join("\n")).zeilen.get("a.js");
            pruef("KONSUM Diff: der Hunk nennt, ob er nur Zeilen-Kommentare bringt", wk.length === 2 && wk[0].nurKommentar === true && wk[1].nurKommentar === false && !wk[0].ein, JSON.stringify(wk.map((x) => [...x, x.nurKommentar, x.ein])));
        }
        fall("KONSUM Code ans Ende der Linse angefügt (Kopf-Code) → alt → 0", mitK, d("scripts/lib/linse.cjs", 20, 21), 0, /^Konsum/);
        fall("KONSUM Seite: `nie` geändert → frisch → 1", mitK, d("probe.js", 5, 5), 1);
        fall("KONSUM Seite: `getan` geändert → alt → 0", mitK, d("probe.js", 2, 2), 0, /^Konsum/);
        fall("KONSUM geladene JSON geändert → alt → 0", mitK, () => ({ dateien: ["daten.json"], zeilen: new Map(), neu: new Set() }), 0, /^Konsum/);
        fall("KONSUM nie geladene Datei im Glob geändert → frisch → 1", mitK, d("anders.js", 1, 1), 1);
        fall("KONSUM ohne Zeilen (Liste) zählt die konsumierte Datei ganz → 0", mitK, () => ["scripts/lib/linse.cjs"], 0, /^Konsum/);
        fall("KONSUM der Text am Mess-SHA ist nicht der gemessene (anderer Schlüssel) → die Datei zählt ganz → 0", mk({ konsum: { "scripts/lib/linse.cjs": "ffffff:" + K["scripts/lib/linse.cjs"].split(":")[1] }, konsumSeite: true }), d("scripts/lib/linse.cjs", 6, 6), 0, /^Konsum/);
        // OHNE DIE SEITE (eine Zeit-Station, eine Probe der Sitzung): über die Spiel-Dateien urteilt weiter der Glob, über das Werkzeug der Konsum
        const ohneSeite = mk({ konsum: ek.konsum || "", konsumSeite: false });
        fall("KONSUM ohne Seite: eine Spiel-Datei im Glob geändert → alt nach dem Glob → 0", ohneSeite, d("anders.js", 1, 1), 0, /^Konsum seit der Messung geändert \(R6: anders\.js\)$/);
        fall("KONSUM ohne Seite: `nein` der Linse geändert → frisch → 1", ohneSeite, d("scripts/lib/linse.cjs", 6, 6), 1);
        // ein Shell-Skript im Befehl läuft ohne Zeugen: es zählt ganz; ein gelesenes Verzeichnis zählt, wenn eine Datei dazukommt
        const mitSh = { ...sk, befehl: ["bash", "-c", "bash scripts/werk.sh && node scripts/lauf.cjs {AUS}"] };
        const bSh = buchen("kopf", [mitSh], [{ sha: "a1", geraet: "headless", je: { "gelaende.K4#1": { gruen: true, zahl: "z", zeit: "2026-11-10T10:00:00Z", abdruck: abdruck(mitSh, h), konsum: ek.konsum || "", konsumSeite: true } } }],
            d("scripts/werk.sh", 1, 1), h, [], { skript });
        pruef("KONSUM ein im Befehl genanntes Shell-Skript (ohne Zeugen) zählt ganz → alt → 0", bSh.je["gelaende.K4"].punkte === 0 && /^Konsum seit der Messung geändert \(R6: scripts\/werk\.sh\)$/.test(bSh.je["gelaende.K4"].stationen[0].grund), bSh.je["gelaende.K4"].beleg);
        const dir = mk({ konsum: { "worlds/": "*" }, konsumSeite: true });
        fall("KONSUM gelesenes Verzeichnis bekommt eine Datei → alt → 0", dir, d("worlds/neu.js", 1, 1, true), 0, /^Konsum/);
        fall("KONSUM gelesenes Verzeichnis, Unterordner bekommt eine Datei → frisch → 1", dir, d("worlds/a/neu.js", 1, 1, true), 1);
        // package.json: eine Skript-Zeile mehr trifft nur einen Lauf, in dem npm lief
        const pj = (npm) => mk({ konsum: { "package.json": "*", ...(npm ? { ":npm": "*" } : {}) }, konsumSeite: true });
        const dp = (nur) => () => ({ dateien: ["package.json"], zeilen: new Map([["package.json", [[5, 5]]]]), neu: new Set(), nurNpmSkripte: nur });
        fall("KONSUM package.json nur im Befehls-Verzeichnis `scripts` geändert, kein npm im Lauf → frisch → 1", pj(false), dp(true), 1);
        fall("KONSUM package.json im Befehls-Verzeichnis geändert, npm lief → alt → 0", pj(true), dp(true), 0, /^Konsum/);
        fall("KONSUM package.json außerhalb von `scripts` geändert → alt → 0", pj(false), dp(false), 0, /^Konsum/);
        // der Diff: ein Hunk aus reinen Versions-Stempeln fällt, eine Einfügung trifft beide Nachbarn, Anlegen beim Namen
        const wd = stempelDiff("probe.js\nneu.js", ["diff --git a/probe.js b/probe.js", "@@ -2 +2 @@", '-importScripts("a.js?v=1");', '+importScripts("a.js?v=2");',
            "@@ -5,0 +6,2 @@", "+x();", "+y();", "diff --git a/neu.js b/neu.js", "new file mode 100644", "@@ -0,0 +1 @@", "+z();"].join("\n"));
        pruef("KONSUM Diff: der Stempel-Hunk fällt, die Einfügung trifft 5 und 6, Anlegen beim Namen", JSON.stringify(wd.zeilen.get("probe.js")) === "[[5,6]]" && wd.neu.has("neu.js") && !wd.neu.has("probe.js"),
            JSON.stringify([...wd.zeilen]) + " neu " + [...wd.neu]);
        // DIE TAFEL der Mess-Datei: Zwillinge teilen EINEN Abdruck, vereine trägt ihn von Tafel zu Tafel, was kein Eintrag nennt, fällt
        const mt = { sha: "a1", geraet: "headless", je: {} };
        for (const id of ["a.K1#1", "a.K1#2"]) eintragen(mt, id, { gruen: true, zahl: "z", konsum: ek.konsum || "x", konsumSeite: true });
        const ref = mt.je["a.K1#1"].konsum;
        const v = vereineMessungen(null, [{ name: "teil-1", m: mt }], "a1", "headless", "farm").m;
        eintragen(mt, "a.K1#1", { gruen: true, zahl: "z" });
        eintragen(mt, "a.K1#2", { gruen: true, zahl: "z" });
        pruef("KONSUM-TAFEL Zwillinge teilen EINEN Abdruck, die Buchung liest ihn aus der Tafel, vereine trägt ihn mit, ein Abdruck ohne Eintrag fällt",
            KONSUM_REF.test(ref) && v.je["a.K1#2"].konsum === ref && Object.keys(v.konsumTafel).join() === ref && JSON.stringify(konsumVon(v.je["a.K1#1"], v).k) === JSON.stringify(K) &&
            konsumVon(v.je["a.K1#1"], { konsumTafel: {} }) === null && !konsumRaeumen(mt).konsumTafel, JSON.stringify([ref, Object.keys(v.konsumTafel || {}), Object.keys(mt.konsumTafel || {})]));
        // KEIN STILLER RÜCKFALL: ein Prozess ohne Ende (hart getötet) macht den Konsum ungültig — beim Namen, nie still klein
        const ord = path.join(tmp, "getoetet.konsum");
        fs.mkdirSync(ord, { recursive: true });
        fs.writeFileSync(path.join(ord, "1.json"), JSON.stringify({ js: {}, skripte: [], geladen: [], ganz: [] }));
        fs.writeFileSync(path.join(ord, "4194000.offen"), "");
        const kf = await konsumDesLaufs(ord, baum, null);
        pruef("KONSUM ein Prozess ohne Ende → keine Konsum-Menge, der Grund beim Namen", !kf.konsum && /^1 Prozess\(e\) ohne Ende \(hart getötet oder ohne Antwort\): 4194000$/.test(kf.konsumFehlt), JSON.stringify(kf));
        // EIN KIND OHNE ZEUGEN (die Mutante: die Linse startet node mit leerer Umgebung): der Lauf trägt keinen Konsum — beim Namen
        {
            fs.writeFileSync(path.join(baum, "scripts", "blind.cjs"), 'require("child_process").spawnSync(process.execPath, ["-e", "require(\'./kind.js\').k()"], { env: { PATH: process.env.PATH } });\nrequire("fs").writeFileSync(process.argv[2], JSON.stringify({ n: 0 }));\n');
            const eb = await fahreStation({ ...sk, befehl: ["node", "scripts/blind.cjs", "{AUS}"] }, { ...ctx("konsum-blind"), baum, deckelMinS: 60 });
            pruef("KONSUM ein node-Kind mit einer Umgebung ohne den Zeugen → keine Konsum-Menge, der Grund beim Namen", eb.gruen && !eb.konsum && /^ein Kind ohne Zeugen \(seine Umgebung trägt ihn nicht\): /.test(eb.konsumFehlt || ""), JSON.stringify({ gruen: eb.gruen, fehlt: eb.konsumFehlt, konsum: !!eb.konsum }));
        }
        // DIE FENSTER einer lebenden Welt (die Sitzung): das Boot, dann je Probe, was SEIT der letzten Nahme lief — `ja` im ersten Fenster,
        // `nein` im zweiten und `ja` dort nicht mehr; der Kopf-Code des geladenen Moduls steht in jedem
        {
            fs.writeFileSync(path.join(baum, "welt.cjs"), 'const L = require("./scripts/lib/linse.cjs");\nprocess.stdin.on("data", (d) => {\n    const w = String(d).trim();\n    if (w === "ende") process.exit(0);\n    L[w]();\n    console.log("ok " + w);\n});\nconsole.log("bereit");\n');
            const ordner = path.join(tmp, "welt.konsum"), env = { ...process.env };
            konsumAn(env, ordner, baum, false);
            const welt = spawn(process.execPath, ["welt.cjs"], { cwd: baum, env, stdio: ["pipe", "pipe", "inherit"] });
            let aus = "";
            welt.stdout.on("data", (x) => (aus += x));
            const bis = async (re) => { for (const frist = Date.now() + 15000; !re.test(aus) && Date.now() < frist; ) await warteMs(20); return re.test(aus); };
            const fenster = async (k) => { const n = await konsumNahme(ordner, k); return n.fehlt ? n.fehlt : zeilenVon(konsumVon(konsumFalten(n.stuecke, baum, acorn), null).k["scripts/lib/linse.cjs"]); };
            const zeilenVon = (s) => skriptZeilen(skriptVon(texte["scripts/lib/linse.cjs"], acorn), s.split(":")[1]).map(([x, y]) => (x === y ? x : x + "-" + y)).join(",");
            const bereit = await bis(/^bereit$/m);
            const boot = await fenster("boot");
            welt.stdin.write("ja\n");
            await bis(/^ok ja$/m);
            const f1 = await fenster(1);
            welt.stdin.write("nein\n");
            await bis(/^ok nein$/m);
            const f2 = await fenster(2);
            welt.stdin.write("ende\n");
            await new Promise((r) => welt.on("exit", r));
            const stumm = await konsumNahme(ordner, 3);
            pruef("KONSUM-FENSTER einer lebenden Welt: das Boot (nur Kopf-Code), dann je Fenster, was SEIT der letzten Nahme lief (`ja`, danach `nein` ohne `ja`); eine Welt, die endete, beim Namen",
                bereit && boot === "1,4,7,10,13,16-21" && f1 === "1-4,7,10,13,16-21" && f2 === "1,4-7,10,13,16-21" && /kein Prozess der Welt lebt/.test(stumm.fehlt || ""), JSON.stringify({ bereit, boot, f1, f2, stumm }));
        }
        // DER ZWEITE NUTZEN (`beruehrt`): der Diff eines Zweigs gegen dieselbe Konsum-Menge — berührt, wer an der Basis frisch gilt und am
        // Kopf nicht mehr; wer schon an der Basis alt ist, steht als offen (kein Urteil aus dieser Messung)
        {
            const s2 = { ...sk, kriterium: "gelaende.K4", staffel: 2 };
            const m2 = { sha: "a1", geraet: "headless", je: { "gelaende.K4#1": mitK.je["gelaende.K4#1"], "gelaende.K4#2": { ...mitK.je["gelaende.K4#1"], abdruck: abdruck(s2, h), konsum: { "scripts/lib/linse.cjs": "*" } } } };
            const keinDiff = () => ({ dateien: [], zeilen: new Map(), neu: new Set() });
            const r = beruehrt([sk, s2], [m2], keinDiff, d("scripts/lib/linse.cjs", 6, 6), h, { basis: { skript }, kopf: { skript } });
            const r0 = beruehrt([sk, s2], [m2], d("scripts/lib/linse.cjs", 3, 3), d("scripts/lib/linse.cjs", 3, 3), h, { basis: { skript }, kopf: { skript } });
            pruef("BERÜHRT der Zweig ändert `nein`: die Station, die es nie ausführte, bleibt frei, die die Datei ganz las, ist berührt (nach Konsum); schon an der Basis alt → offen",
                r.je.headless.haelften === 2 && r.je.headless.beruehrt.map((x) => x.id + " " + x.r6).join() === "gelaende.K4#2 konsum" && !r.je.headless.offen.length &&
                r0.je.headless.offen.join() === "gelaende.K4#1,gelaende.K4#2" && !r0.je.headless.beruehrt.length, JSON.stringify([r, r0]));
        }
        fs.rmSync(baum, { recursive: true, force: true });
    }
    // (5q) DIE KOSTEN VON R6 (Gebot 7, die Linse zu r6Quelle; 12.11.: ~2000 git-Prozesse je Buchung, fünf und mehr je Mess-Kopf): ein
    // echter Klon mit 10 Ständen — index.html trägt je Stand nur einen neuen Stempel, stamm/welt.js und das Befehls-Verzeichnis von npm
    // eine neue Zeile, die Linsen-Bibliothek scripts/lib/b.cjs ändert sich einmal (Stand 2) —, je Mess-Kopf zwei Mess-Dateien, dazu eine
    // an einem Stand, den der Klon nicht kennt. Das Urteil über 3 Köpfe und über 9 Köpfe bleibt unter DEMSELBEN Deckel an git-Prozessen
    // (an 9 Köpfen eine Pfad-Klasse mehr: die Klassen wachsen mit dem Logarithmus der Fassungen, nie mit den Köpfen),
    // der zweite Lauf am warmen Speicher vier; die Mutante — git je Mess-Kopf gefragt, der Stand bis 12.11. — wächst mit den Köpfen
    // und reißt den Deckel (GEFANGEN); Urteil und Diff sind kalt, warm und in der Mutante Byte für Byte dieselben
    {
        const klon = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-kosten-")), N = 10, DECKEL = 12;
        const inhalt = (i) => ({
            "index.html": '<script src="welt.js?v=1.0.' + i + '"></script>\n',
            "stamm/welt.js": "const a = 1;\nconst stand = " + i + ";\n",
            "stamm/ruhe.js": "const ruhe = 1;\n",
            "package.json": '{ "version": "1.0.' + i + '", "scripts": { "x": "y' + i + '" } }\n',
            "scripts/linse.cjs": 'require("./lib/a.cjs");\n',
            "scripts/lib/a.cjs": 'module.exports = require("./b.cjs");\n',
            "scripts/lib/b.cjs": "module.exports = " + (i < 2 ? 1 : 2) + ";\n",
            "scripts/karte.cjs": 'require("./lib/c.cjs");\n',
            "scripts/lib/c.cjs": "module.exports = " + (i < 7 ? 1 : 2) + ";\n",
            "scripts/lib/stamm.cjs": 'exports.rufe = (t) => [...String(t).matchAll(/require\\("([^"]+)"\\)/g)].map((m) => ({ ziel: "require", args: [{ type: "Literal", value: m[1] }] }));\n',
        });
        // die zehn Stände in EINEM Prozess (fast-import)
        let strom = "";
        for (let i = 1; i <= N; i++) {
            strom += "commit refs/heads/main\nmark :" + i + "\ncommitter T <t@t> " + (1700000000 + i) + " +0000\ndata 2\ns" + (i % 10) + "\n" + (i > 1 ? "from :" + (i - 1) + "\n" : "");
            for (const [p, x] of Object.entries(inhalt(i))) strom += "M 100644 inline " + p + "\ndata " + Buffer.byteLength(x) + "\n" + x + "\n";
            strom += "\n";
        }
        git(["init", "-q", klon], tmp);
        gitMit(["fast-import", "--quiet"], klon, strom);
        const koepfe = git(["rev-list", "--reverse", "main"], klon).split(/\r?\n/), kopf = koepfe[N - 1];
        const stK = (k, pfad) => ({ ...st0, kriterium: k, befehl: ["node", "scripts/linse.cjs"], pfad });
        const [sa, sb, sc, sd] = [stK("a.K1", ["stamm/ruhe.js"]), stK("a.K2", ["stamm/welt.js"]), stK("a.K3", ["index.html"]), stK("a.K4", ["stamm/ruhe.js"])];
        const alle = [sa, sb, sc, sd];
        const ein = (st, i) => [schluessel(st), { gruen: true, zahl: "z", zeit: "2026-11-12T10:" + String(i).padStart(2, "0") + ":00Z", abdruck: abdruck(st, h) }];
        const messDateien = (ks) => [...ks.flatMap((i) => [[sa, sb], [sc]].map((sts) => ({ sha: koepfe[i - 1], geraet: "headless", je: Object.fromEntries(sts.map((st) => ein(st, i))) }))),
            { sha: "f".repeat(40), geraet: "headless", je: Object.fromEntries([ein(sd, 1)]) }];
        // ein Lauf = ein Prozess: der Speicher wird neu von der Platte gelesen; gezählt wird das Urteil über jede Station
        const lauf = (ks, ordner, mutante) => {
            r6SpeicherJe.clear();
            const ms = messDateien(ks), vor = gitRufe, o = { speicher: path.join(tmp, ordner), acorn: {} };
            const q = r6Quelle(klon, kopf, ms, alle, o);
            const geaendert = mutante ? (sha) => r6Quelle(klon, kopf, [{ sha }], [], o).geaendert(sha) : q.geaendert;
            const f = frischUrteil(ms, geaendert, h, { linsen: q.linsenAm(), skript: q.skript });
            const u = alle.map((st) => { const e = f(st, "headless"); return e.gruen ? "frisch an " + koepfe.indexOf(e.sha) : e.grund; });
            const n = gitRufe - vor;
            const d = ks.map((i) => { const x = geaendert(koepfe[i - 1]); return JSON.stringify([x.dateien, [...x.zeilen], [...x.neu], x.nurNpmSkripte]); });
            return { n, u: u.join(" | "), d: d.join("\n"), dateien: ms.length };
        };
        let kalt3, kalt9, warm9, mut9, wurf = null;
        try {
            kalt3 = lauf([2, 3, 4], "r6-drei", false);
            kalt9 = lauf([1, 2, 3, 4, 5, 6, 7, 8, 9], "r6-neun", false);
            warm9 = lauf([1, 2, 3, 4, 5, 6, 7, 8, 9], "r6-neun", false);
            mut9 = lauf([1, 2, 3, 4, 5, 6, 7, 8, 9], "r6-mutante", true);
        } catch (e) {
            wurf = e.message;
        }
        r6SpeicherJe.clear();
        const soll3 = "frisch an 3 | Pfad seit der Messung geändert (R6: stamm/welt.js) | frisch an 3 | Mess-SHA unbekannt — kein R6-Urteil";
        const soll9 = "frisch an 8 | Linse seit der Messung geändert (R6: scripts/lib/b.cjs) | frisch an 8 | Mess-SHA unbekannt — kein R6-Urteil";
        const sollD = JSON.stringify([["package.json", "stamm/welt.js"], [["package.json", [[1, 1]]], ["stamm/welt.js", [[2, 2]]]], [], true]);
        pruef("KOSTEN R6 kostet, was sich ändert: das Urteil über 3 und über 9 Mess-Köpfe fragt git unter demselben Deckel (≤ " + DECKEL + " Prozesse, höchstens einer mehr), am warmen Speicher viermal; ein Stempel allein zählt nie, der unbekannte Stand beim Namen; die Mutante (git je Mess-Kopf gefragt) reißt den Deckel",
            !wurf && kalt3.n <= DECKEL && kalt9.n <= DECKEL && kalt9.n - kalt3.n <= 1 && warm9.n === 4 && mut9.n > DECKEL && kalt3.u === soll3 && kalt9.u === soll9 && warm9.u === soll9 && mut9.u === soll9 &&
            kalt9.d === warm9.d && kalt9.d === mut9.d && kalt9.d.split("\n")[8] === sollD,
            wurf ? "wirft: " + wurf : kalt3.dateien + " Mess-Dateien an 3 Köpfen " + kalt3.n + " git-Prozesse, " + kalt9.dateien + " an 9 Köpfen " + kalt9.n + ", warm " + warm9.n + " · Mutante " + mut9.n +
                (mut9.n > DECKEL ? " GEFANGEN" : " ENTKOMMEN") + " · 3 Köpfe: " + kalt3.u + " · 9 Köpfe: " + kalt9.u + (kalt9.d === mut9.d && kalt9.d === warm9.d ? " · Diff je Kopf dreimal derselbe" : " · DIFF UNGLEICH") + " · Kopf 9: " + kalt9.d.split("\n")[8]);
        // DER LINSEN-SCHLÜSSEL (12.11., wetter.K3#2 gtx nannte an sieben Köpfen die Täter der headless-Hälfte): zwei Hälften EINER Staffel
        // unter demselben Schlüssel — die headless-Hälfte ruft scripts/linse.cjs, die Karten-Hälfte scripts/karte.cjs, dessen Bibliothek
        // c.cjs sich an Stand 7 ändert; beide an Stand 5 gemessen. Die headless-Hälfte bleibt frisch, die Karten-Hälfte ist alt beim Namen
        // ihrer Datei, in jeder Reihenfolge der Frage; die Mutante (die Linse je Schlüssel gemerkt, der Stand bis 12.11.) gibt der zweiten
        // Hälfte die Linse der ersten — die Karten-Hälfte gälte frisch (GEFANGEN)
        if (!wurf) {
            const hk = { ...st0, kriterium: "a.K5", befehl: ["node", "scripts/linse.cjs"], pfad: ["stamm/ruhe.js"] }, ka = { ...hk, geraet: "radeon", befehl: ["node", "scripts/karte.cjs"] };
            const e5 = (st, g) => ({ sha: koepfe[4], geraet: g, je: { [schluessel(st)]: { gruen: true, zahl: "z", zeit: "2026-11-12T10:05:00Z", abdruck: abdruck(st, h, g) } } });
            const ms = [e5(hk, "headless"), e5(ka, "radeon")];
            const urteile = (reihe, mutante) => {
                r6SpeicherJe.clear();
                const q = r6Quelle(klon, kopf, ms, [hk, ka], { speicher: path.join(tmp, "r6-neun"), acorn: {} }), echt = q.linsenAm(), merk = new Map();
                const jeSchluessel = (st, sha) => { const k = schluessel(st) + "|" + sha; return merk.get(k) || merk.set(k, echt(st, sha)).get(k); };
                const f = frischUrteil(ms, q.geaendert, h, { linsen: mutante ? jeSchluessel : echt, skript: q.skript });
                const u = new Map(reihe.map((st) => [st, f(st, st.geraet)]));
                return [hk, ka].map((st) => (u.get(st).gruen ? "frisch" : u.get(st).grund)).join(" | ");
            };
            const sollS = "frisch | Linse seit der Messung geändert (R6: scripts/lib/c.cjs)";
            const [vor, rueck, mut] = [urteile([hk, ka]), urteile([ka, hk]), urteile([hk, ka], true)];
            pruef("LINSEN-SCHLÜSSEL die zwei Hälften einer Staffel tragen je ihre eigene Linse: die Karten-Hälfte ist alt an ihrer Bibliothek, die headless-Hälfte frisch, in jeder Reihenfolge; die Mutante (je Schlüssel gemerkt) gibt der zweiten die Linse der ersten",
                vor === sollS && rueck === sollS && mut !== sollS, vor + " · umgekehrt gefragt: " + rueck + " · Mutante: " + mut + (mut !== sollS ? " GEFANGEN" : " ENTKOMMEN"));
            r6SpeicherJe.clear();
        }
        fs.rmSync(klon, { recursive: true, force: true });
    }
    // (6) Übergang in gen.cjs
    const stand = { kopf: "abcd1234", je: { "gelaende.K4": { punkte: 2, beleg: "Maschine: z" } } };
    const k0 = { name: "n", punkte: 1, beleg: "Hand" };
    const k1 = maschinenKriterium(stand, "gelaende", 3, k0), k2 = maschinenKriterium(stand, "gelaende", 1, k0);
    pruef("GEN registriert → Maschine, sonst Hand", k1.punkte === 2 && k1.maschine && k1.beleg === "Maschine: z" && k2 === k0, JSON.stringify([k1, k2]));
    const pf = standPruefen(stand, "ffff0000", new Set(["gelaende.K4"]));
    pruef("GEN Kopf ungleich ist ROT", pf.some((f) => /Kopf abcd1234/.test(f)), pf.join(" | "));
    // X: eine Hälfte am Kopf — gruen frisch gemessen, alt ohne frische Messung (das Frische-Urteil der Buchung: ungemessen)
    const X = (id, geraet, gruen, alt) => ({ id, geraet, gruen: !!gruen, ...(alt ? { ungemessen: true } : {}) });
    const nz = gtxNutzen({ je: {
        "a.K1": { stationen: [X("a.K1#1", "radeon", true), X("a.K1#1", "gtx", false, 1), X("a.K1#2", "radeon", true), X("a.K1#2", "gtx", false, 1)] },
        "b.K1": { stationen: [X("b.K1#1", "radeon", false), X("b.K1#1", "gtx", false, 1), X("b.K1#2", "radeon", true), X("b.K1#2", "gtx", false, 1)] },
        "c.K1": { stationen: [X("c.K1#1", "headless", true), X("c.K1#2", "radeon", false), X("c.K1#2", "gtx", false, 1)] },
        "d.K1": { stationen: [X("d.K1#1", "headless", false), X("d.K1#2", "radeon", true), X("d.K1#2", "gtx", false, 1)] },
        "e.K1": { stationen: [X("e.K1#1", "headless", true), X("e.K1#2", "radeon", true), X("e.K1#2", "gtx", true)] },
        "f.K1": { stationen: [X("f.K1#1", "headless", true), X("f.K1#2", "radeon", true), { ...X("f.K1#2", "gtx", false, 1), tot: true }] },
    } });
    pruef("GTX-NUTZEN Staffel 1 hinter grüner Radeon fällt, Staffel 2 nur, wo Staffel 1 stehen kann und die Radeon-Hälfte nicht frisch rot ist; frisch Gemessenes und die Wand PFAD nie",
        nz.ja.join() === "a.K1#2,b.K1#1,b.K1#2" && nz.nein.join() === "a.K1#1,c.K1#2,d.K1#2,e.K1#2,f.K1#2", JSON.stringify(nz));
    // DIE KLASSE 27.10. (a03b7b06, gebucht Σ 113 statt ≥ 123): eine Staffel 2 mit alter gtx-Hälfte steht in der Liste — vor dem
    // Takt (Radeon-Hälfte und Staffel 1 R6-alt, sie fahren im selben Takt) wie nach ihm (Radeon frisch grün); frisch gemessen nie.
    // Durch die echte Buchung (frischUrteil, R6), nicht an Hand gesetzten Zuständen
    {
        const r6 = (sha) => (sha === "v1" ? ["stamm/wasser-hydro.js"] : []);
        const vorher = ["radeon", "gtx"].flatMap((g) => [M("v1", g, "gelaende.K4#1", s1, true), M("v1", g, "gelaende.K4#2", s2, true)]);
        const amKopf = (g, id, st) => M("k0", g, id, st, true, "2026-10-23T12:00:00Z");
        const nach = [...vorher, amKopf("radeon", "gelaende.K4#1", s1), amKopf("radeon", "gelaende.K4#2", s2), amKopf("gtx", "gelaende.K4#1", s1)];
        const [a, z, c] = [vorher, nach, [...nach, amKopf("gtx", "gelaende.K4#2", s2)]].map((ms) => gtxNutzen(buchen("kopf", [s1, s2], ms, r6, h)));
        pruef("GTX-NUTZEN Staffel 2 mit R6-alter gtx-Hälfte steht in der Liste, gleich ob die Radeon-Hälfte alt oder frisch grün ist; frisch gemessen nie",
            a.ja.join() === "gelaende.K4#1,gelaende.K4#2" && z.ja.join() === "gelaende.K4#2" && c.ja.length === 0, JSON.stringify([a.ja, z.ja, c.ja]));
    }
    const P = (k, s, ge) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node"], gpu: true });
    const V = (id, g, gruen) => ({ id, geraet: g, gruen, zahl: gruen ? "ok" : "rot" });
    const vor = [V("a.K1#1", "radeon", true), V("a.K1#1", "gtx", true), V("a.K1#2", "radeon", true), V("a.K1#2", "gtx", true),
        V("b.K1#1", "radeon", false), V("b.K1#1", "gtx", false), V("c.K1#1", "radeon", false), V("c.K1#1", "gtx", false),
        V("d.K1#1", "radeon", false), V("d.K1#1", "gtx", true), V("d.K1#2", "radeon", true), V("d.K1#2", "gtx", false)];
    const mp = messPlan([P("a.K1", 1, ["radeon", "gtx"]), P("a.K1", 2, ["radeon", "gtx"]), P("b.K1", 1, ["radeon", "gtx"]), P("c.K1", 1, ["radeon", "gtx"]), P("d.K1", 1, ["radeon", "gtx"]), P("d.K1", 2, ["radeon", "gtx"])],
        (id, g) => vor.find((x) => x.id === id && x.geraet === g) || null, new Set(["c.K1"]), (id) => id === "d.K1#1");
    pruef("MESS-PLAN Staffel 1 auf EINEM Gerät (Zeit auf der GTX), rot ohne Heil-Versuch fällt, genannt fährt auf der GTX (Radeon = Werkbank), Staffel 2 nur ganz grün oder geheilt",
        mp.radeon.join() === "a.K1#1,a.K1#2" && mp.gtx.join() === "a.K1#2,c.K1#1,d.K1#1" && mp.uebersprungen.join() === "b.K1#1,d.K1#2", JSON.stringify(mp));
    {
        const bv = [V("e.K1#1", "radeon", true), V("e.K1#1", "gtx", true), V("f.K1#1", "radeon", true), V("f.K1#1", "gtx", false)];
        const bp = messPlan([{ ...P("e.K1", 1, ["radeon", "gtx"]), beide: true }, { ...P("f.K1", 1, ["radeon", "gtx"]), beide: true }],
            (id, g) => bv.find((x) => x.id === id && x.geraet === g) || null, new Set(), () => true);
        pruef("MESS-PLAN Staffel 1 mit beide: ganz grün hält auf beiden Geräten, halb rot ohne Heil-Versuch fällt",
            bp.radeon.join() === "e.K1#1" && bp.gtx.join() === "e.K1#1" && bp.uebersprungen.join() === "f.K1#1", JSON.stringify(bp));
    }
    {
        // DIE PFLICHT (w4-sitzung-reif): die Staffel 2 trägt PFLICHT-OFFEN C, ihre 1 ist rot und keiner nennt das Kriterium — der Plan misst
        // sie trotzdem an jedem Zug auf beiden Geräten, auch nach einem frischen ROT; dieselbe Staffel ohne die Pflicht bleibt übersprungen
        const pv = [V("p.K1#1", "radeon", false), V("p.K1#1", "gtx", false), V("p.K1#2", "radeon", false), V("p.K1#2", "gtx", false),
            V("q.K1#1", "radeon", false), V("q.K1#1", "gtx", false), V("q.K1#2", "radeon", false), V("q.K1#2", "gtx", false)];
        const pp = messPlan([P("p.K1", 1, ["radeon", "gtx"]), { ...P("p.K1", 2, ["radeon", "gtx"]), quelle: "2 = auch x, und der Verkehr der Stadt (PFLICHT-OFFEN C): y, beide Geräte" },
            P("q.K1", 1, ["radeon", "gtx"]), { ...P("q.K1", 2, ["radeon", "gtx"]), quelle: "2 = auch x, beide Geräte" }],
        (id, g) => pv.find((x) => x.id === id && x.geraet === g) || null, new Set(), () => false);
        pruef("MESS-PLAN eine Staffel mit PFLICHT-OFFEN misst an jedem Zug auf beiden Geräten (auch ohne stehende 1, auch nach ROT); ohne die Pflicht übersprungen",
            pp.radeon.join() === "p.K1#2" && pp.gtx.join() === "p.K1#2" && pp.uebersprungen.join() === "p.K1#1,q.K1#1,q.K1#2", JSON.stringify(pp));
    }
    pruef("GEN unbekanntes Kriterium ist ROT", standPruefen({ kopf: "abcd1234", je: { "x.K1": {} } }, "abcd1234", new Set()).length === 1);
    // (7) DIE FARM: Scheiben (LPT, Zwillinge zusammen, Gewicht aus der jüngsten Messung), der Anbieter je Scheibe, die Vereinigung
    // der Teile (ersetzt, ungemessen, fehlende Scheibe beim Namen, fremder SHA wirft) und kein Schloss nur für headless
    {
        const S = (k, s, min, extra = {}) => ({ ...st0, kriterium: k, staffel: s, minuten: min, befehl: ["node", k], ...extra });
        const zw = S("a.K1", 2, 1, { befehl: ["node", "a.K1"] });
        const gs = gruppiere([S("a.K1", 1, 1), zw, S("b.K1", 1, 7), S("c.K1", 1, 5), S("d.K1", 1, 4), S("e.K1", 1, 3),
            S("f.K1", 1, 1, { env: { KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" } })]);
        const mess = [{ geraet: "headless", je: { "a.K1#1": { minuten: 10, zeit: "2026-10-27T01:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 0, zeit: "2026-10-27T02:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 30, zeit: "2026-10-27T02:30:00Z" } } },
            { geraet: "radeon", je: { "b.K1#1": { minuten: 99, zeit: "2026-10-27T03:00:00Z" } } }];
        const p = scheibenPlan(gs, 3, laufGewicht(mess, "headless"));
        const ids = p.map((s) => s.gruppen.flat().map(schluessel).join(","));
        const ki = p.map((s) => kiModelle(s.gruppen).join(" "));
        pruef("FARM die Scheiben: die schwersten zuerst in die leichteste, Zwillinge EIN Lauf, Gewicht = die kürzeste der jüngsten 5 Messungen > 0 auf dem Gerät, sonst Soll",
            p.length === 3 && p.map((s) => s.min).join() === "10,10,10" && ids.join(" | ") === "a.K1#1,a.K1#2 | b.K1#1,e.K1#1 | c.K1#1,d.K1#1,f.K1#1" &&
            ki.join("|") === "||qwen3:4b-instruct" && scheibenPlan(gs, 99, () => 1).length === gs.length, JSON.stringify(p.map((s, i) => [s.min, ids[i], ki[i]])));
        const alt = { sha: "f1", geraet: "headless", host: "laptop", je: { "a.K1#1": { gruen: false, zahl: "rot", minuten: 3 }, "z.K1#1": { gruen: true, zahl: "z", minuten: 1 } } };
        const t1 = { name: "teil-1", m: { sha: "f1", geraet: "headless", host: "farm:7/1", zeit: "2026-10-27T10:00:00Z", je: { "a.K1#1": { gruen: true, zahl: "g", minuten: 2, host: "farm:7/1" }, "a.K1#2": { gruen: true, zahl: "g", minuten: 2, zwilling: "a.K1#1", host: "farm:7/1" } } } };
        const t2 = { name: "teil-2", m: { sha: "f1", geraet: "headless", host: "farm:7/2", zeit: "2026-10-27T10:05:00Z", je: {}, ungemessen: { "b.K1#1": { gruen: false, ungemessen: true, grund: "x" } } } };
        const v = vereineMessungen(alt, [t1, t2], "f1", "headless", "farm:7", [{ nr: 1, nur: "a.K1#1,a.K1#2" }, { nr: 2, nur: "b.K1#1" }, { nr: 3, nur: "c.K1#1,d.K1#1" }]);
        let wirft = "";
        try { vereineMessungen(alt, [{ name: "teil-9", m: { sha: "f2", geraet: "headless", je: {} } }], "f1", "headless", "farm:7"); } catch (e) { wirft = e.message; }
        pruef("FARM die Vereinigung: ein Teil ersetzt den alten Eintrag, Fremdes bleibt, ungemessen bleibt ungemessen, die fehlende Scheibe beim Namen, ein fremder SHA wirft",
            v.n === 3 && v.m.je["a.K1#1"].gruen && v.m.je["a.K1#1"].host === "farm:7/1" && v.m.je["z.K1#1"].gruen && !v.m.je["b.K1#1"] && v.m.ungemessen["b.K1#1"] &&
            v.m.host === "farm:7" && v.m.zeit === "2026-10-27T10:05:00Z" && !alt.je["a.K1#1"].gruen && v.fehlt.length === 1 && v.fehlt[0].nr === 3 &&
            v.fehlt[0].ids.join() === "c.K1#1,d.K1#1" && /teil-9 misst f2 headless statt f1 headless/.test(wirft), JSON.stringify([v, wirft]));
        const fe = farmEingaben([S("a.K1", 1, 1), zw], "f1", "koordination", "laptop-1-2");
        pruef("FARM der Ruf: die hier gewählte Liste reist als nur, die Marke findet den Lauf, origin nennt das Repo",
            JSON.stringify(fe) === JSON.stringify({ sha: "f1", auswahl: "nur", nur: "a.K1#1,a.K1#2", jobs: "12", koord: "koordination", marke: "laptop-1-2" }) &&
            repoSlug("https://github.com/MiguellD/AnazhRealm.git") === "MiguellD/AnazhRealm" && repoSlug("git@github.com:MiguellD/AnazhRealm") === "MiguellD/AnazhRealm",
            JSON.stringify(fe));
        let gpuWirft = "";
        try { gpuLaufFuer("radeon", "farm:7/1"); } catch (e) { gpuWirft = e.message; }
        pruef("FARM headless fährt auf dem Läufer ohne Schloss des Rechners, am Platz mit ihm; eine GPU-Station nie auf der Farm",
            gpuLaufFuer("headless", "farm:7/1") === null && gpuLaufFuer("headless", undefined) === GPU_LAUF && gpuLaufFuer("gtx") === GPU_LAUF && /nur headless/.test(gpuWirft), gpuWirft);
    }
    // (8) DIE ZWILLINGE EINER LISTE (Messplatz der OMEN): je Zeile ein Lauf, Zwillinge zusammen, die Reihe von nur, nur Gelistete
    {
        const Z = (k, s, b, ge = ["radeon", "gtx"]) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node", b], env: {}, gpu: true });
        const zs = [Z("a.K1", 1, "x"), Z("a.K1", 2, "x"), Z("b.K1", 1, "y"), Z("c.K1", 1, "x", ["radeon"]), Z("d.K1", 1, "x")];
        const g1 = zwillingsGruppen(zs, "gtx", "b.K1#1,a.K1#2,d.K1#1").map((g) => g.join("+")).join(" ");
        const g2 = zwillingsGruppen(zs, "gtx").map((g) => g.join("+")).join(" ");
        let wirft = "";
        try { zwillingsGruppen(zs, "gtx", "c.K1#1"); } catch (x) { wirft = x.message; }
        pruef("GRUPPEN Zwillinge in EINEM Lauf, Reihe von nur, nur Gelistete, eine Station eines anderen Geräts ist ROT",
            g1 === "b.K1#1 a.K1#2+d.K1#1" && g2 === "a.K1#1+a.K1#2+d.K1#1 b.K1#1" && /c.K1#1: keine Station auf gtx/.test(wirft), JSON.stringify([g1, g2, wirft]));
        const P = (k, s, b) => ({ ...Z(k, s, b), befehl: undefined, probe: { befehl: ["node", b] } });
        const ps = [Z("a.K1", 1, "x"), P("e.K1", 1, "p"), P("e.K1", 2, "p"), Z("b.K1", 1, "y"), P("f.K1", 1, "q")];
        const g3 = zwillingsGruppen(ps, "gtx").map((g) => g.join("+")).join(" ");
        pruef("GRUPPEN die Sitzung ist EIN Lauf: jede Probe-Station in der ersten Zeile, die befehl-Läufe danach", g3 === "e.K1#1+e.K1#2+f.K1#1 a.K1#1 b.K1#1", g3);
    }
    // (9) DIE SITZUNG: das Format der Probe (genau eines, nur GPU, Deckel, die Feinde der Welt beim Namen), der Abdruck einer
    // befehl-Station Byte für Byte, und der Lauf mit einer Stub-Welt — EIN Start, jede Probe darin unter ihrem Deckel, die
    // Grundstellung vor jeder Probe (auch nach dem Fehler: die Seite neu, nie die Sitzung), das Schloss EINMAL für die Sitzung,
    // die Einträge im heutigen Format mit modus "session"; eine Welt, die stirbt, macht den Rest ungemessen, eine, die nie steht, ROT
    {
        const gp = { ...st0, geraet: ["radeon", "gtx"], gpu: true, befehl: undefined, probe: { befehl: ["node", "-e", "0"], sek: 30 } };
        const fe = (mut) => pruefeStationen([{ ...gp, ...mut }], karte).fehler.join(" | ");
        const f = [fe({ befehl: ["node", "-e", "0"] }), fe({ geraet: "headless", gpu: false }), fe({ probe: { befehl: ["node", "-e", "0"], sek: 5000 } }),
            fe({ probe: { befehl: ["bash", "-c", "raeum() { for p in $(netstat -ano); do :; done; }; node scripts/werkbank.cjs start --echt"] } }), fe({})];
        pruef("SITZUNG-FORMAT genau eines von befehl und probe · probe nur an einer GPU-Station · Deckel ≤ ein Teil der Fahrt · die Feinde der Welt beim Namen",
            /genau eines von befehl und probe/.test(f[0]) && /probe nur an einer GPU-Station/.test(f[1]) && /Deckel 5000 s × 1 Teil\(e\) über dem Teil der Fahrt/.test(f[2]) &&
            /greift die Welt der Sitzung an: netstat \(räumt Ports\), werkbank start\|stop/.test(f[3]) && f[4] === "", f.join(" || "));
        // DIE FEINDE DES WETTERS: die Mutante von affekt.K5#2 bis 03.11. (das Wort, dahinter der Halt gefroren) ist ROT beim Namen —
        // headless und als Probe; ein Wort unter dem Halt der Sitzung ohne Tauen ebenso; der EINE Weg und ein getautes Wort sind frei
        const mutK5 = "r._setWeather(L.wetter || \"sunny\", \"regler\");\n        st.weatherEffectTime = -1e9;";
        const fh = (b) => pruefeStationen([{ ...st0, befehl: ["node", "-e", b] }], karte).fehler.join(" | ");
        const fp = (b) => fe({ probe: { befehl: ["node", "-e", b], sek: 30 } });
        const fw = [fh(mutK5), fp(mutK5), fp("r._setWeather(\"sunny\", \"human\")"), fh("r._setWeather(\"sunny\", \"human\")"),
            fp("st.weatherEffectTime = 0; r._setWeather(\"rainy\", \"nexus\")"), fp("window.__wetterSetzen(\"stormy\")"), fh("window.__wetterSetzen(\"stormy\")")];
        pruef("WETTER-FEINDE die Probe, die unter dem Mess-Halt setzt, beim Namen (der Halt von Hand gefroren · _setWeather unter dem Halt der Sitzung); der EINE Weg frei",
            /befehl setzt das Wetter unter dem Mess-Halt: der Halt von Hand gefroren/.test(fw[0]) && !/ohne Tauen/.test(fw[0]) &&
            /probe\.befehl setzt das Wetter unter dem Mess-Halt: der Halt von Hand gefroren \(weatherEffectTime = −…\), _setWeather unter dem Halt der Sitzung \(ohne Tauen\)/.test(fw[1]) &&
            /_setWeather unter dem Halt der Sitzung \(ohne Tauen\)/.test(fw[2]) && fw[3] === "" && fw[4] === "" && fw[5] === "" && fw[6] === "", fw.join(" || "));
        const pb = (p) => fe({ probe: { befehl: ["node", "-e", "0"], sek: 30, ...p } });
        const f2 = [pb({ mutiert: "ja" }), pb({ stellung: "mitte" }), pb({ ausnahme: "der Grund beim Namen", sek: 91 }), pb({ wache: 1 }),
            pb({ mutiert: true, stellung: "ende", sek: 900 })];
        pruef("SITZUNG-FORMAT die Schlüssel der Fahrt: mutiert boolesch · stellung anfang|ende · keine ausnahme je Station · nichts sonst; 900 s grün (die Leine, kein Gesetz je Probe)",
            /mutiert nicht boolesch/.test(f2[0]) && /stellung nicht anfang\|ende/.test(f2[1]) && /probe trägt nur befehl, sek, mutiert, stellung, teile/.test(f2[2]) &&
            /probe trägt nur befehl, sek, mutiert, stellung, teile/.test(f2[3]) && f2[4] === "", f2.join(" || "));
        // DIE TEILE (probe.teile, fahreGruppe): 2…TEILE_MAX ganz; der Abdruck trägt sie, die Fahrt zählt den Deckel je Teil
        const f3 = [pb({ teile: 1 }), pb({ teile: TEILE_MAX + 1 }), pb({ teile: 2.5 }), pb({ teile: 3, mutiert: true })];
        const tlp = { ...gp, probe: { ...gp.probe, teile: 3 } };
        pruef("SITZUNG-FORMAT die Teile: 2…" + TEILE_MAX + " ganz; der Abdruck trägt sie, die Fahrt zählt den Deckel je Teil",
            f3.slice(0, 3).every((x) => /probe\.teile keine ganze Zahl 2…8/.test(x)) && f3[3] === "" &&
            abdruck(tlp, "h") !== abdruck(gp, "h") && fahrtSumme([tlp], "gtx").deckel === 3 * fahrtSumme([gp], "gtx").deckel, f3.join(" || "));
        const h = "hilfe";
        const alt = (st) => crypto.createHash("sha1").update(JSON.stringify({ k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {},
            gpu: !!st.gpu, u: String(st.urteil), p: st.pfad, q: st.quelle, h })).digest("hex").slice(0, 12);
        pruef("SITZUNG-ABDRUCK eine befehl-Station Byte für Byte wie vor der Sitzung, eine Probe trägt Befehl und Deckel",
            abdruck(st0, h) === alt(st0) && abdruck(gp, h) !== abdruck({ ...gp, probe: { ...gp.probe, sek: 31 } }, h) &&
            abdruck(gp, h) !== abdruck({ ...gp, probe: { ...gp.probe, befehl: ["node", "-e", "1"] } }, h), abdruck(st0, h) + " " + alt(st0));
        const altP = (st) => crypto.createHash("sha1").update(JSON.stringify({ k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {},
            gpu: !!st.gpu, u: String(st.urteil), p: st.pfad, q: st.quelle, h, pr: [st.probe.befehl, probeSek(st)] })).digest("hex").slice(0, 12);
        pruef("SITZUNG-ABDRUCK eine Probe ohne mutiert und stellung Byte für Byte wie am Sitzungs-Stand; mutiert und stellung ändern ihn",
            abdruck(gp, h) === altP(gp) && abdruck({ ...gp, probe: { ...gp.probe, mutiert: true } }, h) !== abdruck(gp, h) &&
            abdruck({ ...gp, probe: { ...gp.probe, stellung: "ende" } }, h) !== abdruck(gp, h),
            abdruck(gp, h) + " " + altP(gp));
        e = await fahreStation({ ...gp, urteil: lies }, ctx("probe-allein"));
        pruef("SITZUNG eine Probe fährt nie außerhalb der Sitzung", e.gruen === false && /nur in der Sitzung/.test(e.grund), JSON.stringify(e));
        const P = 41004 + (process.pid % 400) * 10;
        const zaehler = path.join(tmp, "welt-zaehler.txt");
        const stub = path.join(tmp, "welt-stub.cjs");
        fs.writeFileSync(stub, [
            'const http = require("http"), fs = require("fs"); const [W, z, art] = process.argv.slice(2); const n = (x) => fs.appendFileSync(z, x + "\\n");',
            'n("start"); if (art === "kaputt") { console.log("WERKBANK-FEHLER stub"); process.exit(4); }',
            // DIE SEITE wie die des Spiels: der Renderer und die Post-Kette tragen ihre Zeichen-Methoden am Prototyp, die Welt zeichnet über
            // `_loopRender` (ohne Gerät nie; die Post-Kette, mit `postProcessingFailed` der Renderer direkt) in das Ziel des Renderers
            'let seite = null; class Rd { constructor() { this.info = { render: { drawCalls: 7, triangles: 900 } }; this._animation = { _animationLoop: null }; this.domElement = { isConnected: true }; this.ziel = 0; }',
            '  setAnimationLoop(cb) { this._animation._animationLoop = cb || null; } render() { this.ziel++; } renderAsync() { return Promise.resolve(this.render()); } _renderObjectDirect() { return 1; } }',
            'function GPUDevice() {} GPUDevice.prototype.createRenderPipeline = function () { return 1; }; GPUDevice.prototype.createBuffer = function () { return 1; };',
            'class Pk { constructor(R) { this.R = R; } render() { this.R.ziel++; } }',
            'class Welt { _loopRender() { const st = this.state; if (st._deviceLost) return; if (st.postProcessing && !st.postProcessingFailed) st.postProcessing.render(); else st.renderer.render(); } }',
            'const neu = () => { const R = new Rd();',
            '  seite = { win: { __vram: { puffer: 1048576, texturen: 1048576 }, GPUDevice }, R, welt: Object.assign(new Welt(), { state: { renderer: R, postProcessing: new Pk(R), postProcessingFailed: false, voxelWorker: {},',
            '  _deviceLost: false, perfRegulator: true, playerMesh: { position: { x: 1, z: 2 } }, cameraMode: "first",',
            '  player: { mountedArch: null }, perfTargetMs: 1000, perfSense: { loadScale: 1 }, weather: "sunny", creatures: [], timeOfDay: 0.5 }, _gpuLeine: { gerendert: 0 } }) }; }; neu();',
            'setInterval(() => { const cb = seite.R._animation._animationLoop; if (cb) cb(performance.now()); }, 16);',
            // der Weg einer Probe (art „weg“): die Grundstellung an Ort und Stelle nennt ihn, bis die Seite neu lud; „weg-bleibt“ trägt ihn
            // auch durch die Tür (die Wege-Linse der Grundstellung, grundSpielen)
            'let geladen = false; const weg = () => (art === "weg-bleibt" || (art === "weg" && !geladen) ? ["wege +1 [-312.4,-1060.2,-87.6,-1015.1/1] (probe:tempo4)"] : []);',
            'http.createServer((q, r) => { let d = ""; q.on("data", (c) => (d += c)); q.on("end", () => { const b = d ? JSON.parse(d) : {}; const s = (o) => r.end(JSON.stringify(o));',
            // eine Probe greift in die Seite („seite: <code>“, r = die Welt), die Zeichenkette der Sitzung läuft in ihr — beide wie /eval der Werkbank
            '  const inSeite = (c) => { try { return s({ ergebnis: new Function("r", "window", c)(seite.welt, seite.win) }); } catch (e) { return s({ fehler: String(e && e.message) }); } };',
            '  if (q.url === "/eval") { if (/^seite: /.test(b.code)) return inSeite(b.code.slice(7)); if (/__punkteZeichner|__punkteHaengerLeihe|__punkteMessHalt|__punkteSpielerStand/.test(b.code)) return inSeite(b.code);',
            '    if (/_grundstellung\\(\\)/.test(b.code)) { n("nimm"); return s({ ergebnis: { grund: "{}", n: 3, ms: 1, welt: "w1", seite: [], wege: { flaechen: [], keys: [] } } }); }',
            '    if (/_grundstellung\\("/.test(b.code)) { n("grund"); return s({ ergebnis: { ok: true, anders: (art === "anders" || (art === "anders-ort" && !geladen) ? ["augenblick.brand"] : []).concat(weg()), neu: {}, ms: 1, welt: "w1" } }); }',
            '    if (/__punkteStrom/.test(b.code)) return s({ ergebnis: new Function("r", "window", "performance", b.code)(seite.welt, seite.win, performance) });',
            '    if (/_weltBetreten\\(/.test(b.code)) { n("tuer"); return s({ ergebnis: { ok: true, worldId: "w1" } }); }',
            // DER WARME START: das Einschwingen der Sitzung vor einer Probe ohne Ort (WELT_STEHT)
            '    if (/__weltStehtNach\\(/.test(b.code)) { n("warm"); return s({ ergebnis: { takte: 31, chunks: 81, ring: 4 } }); }',
            '    if (b.code === "loop an") { seite.R.setAnimationLoop(() => seite.welt._gpuLeine.gerendert++); return s({ ergebnis: 1 }); }',
            '    if (b.code === "loop aus") { seite.R.setAnimationLoop(null); return s({ ergebnis: 0 }); }',
            '    if (b.code === "tod") { n("tod"); return r.end(JSON.stringify({ ergebnis: "tod" }), () => process.exit(3)); }',
            '    if (b.code === "mord") { n("mord"); process.exit(3); } return s({ ergebnis: "warm" }); }',
            '  if (q.url === "/reload") { n("reload"); neu(); geladen = true; return s({ neu: true, ms: 1 }); } if (q.url === "/fenster") return s({ fenster: [1920, 1080] });',
            // DIE WELT HÄNGT (art „haengt“): der Ort steht nicht, bis die Seite neu lud
            '  if (q.url === "/umstellen") { n("umstellen:" + b.ort); if (art === "haengt" && !geladen) return s({ fehler: "DIE WELT STEHT NICHT nach 3601 Takten: wald 11" }); return s({ takte: 3, steht: true, chunks: 9 }); }',
            '  if (q.url === "/stop") { n("stop"); s({ stop: true }); return setTimeout(() => process.exit(0), 50); } s({ fehler: "unbekannt" }); }); })',
            '  .listen(Number(W), "127.0.0.1", () => { console.log("[linse-gpu] amd/stub-sitzung"); console.log("WERKBANK bereit: Steuer 127.0.0.1:" + W); });',
        ].join("\n"));
        const welt = (art) => {
            const w = path.join(tmp, "welt-" + art + ".json");
            fs.writeFileSync(w, JSON.stringify({ save: ["node", "-e", 'require("http").createServer((q, r) => r.end("ok")).listen(Number(process.env.PORT), "127.0.0.1")'],
                werkbank: ["node", stub, "{W}", zaehler, art] }));
            return w;
        };
        const ruf = ["node", "-e", 'const fs = require("fs"); require("http").request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/eval", method: "POST" }, (r) => { let d = ""; ' +
            'r.on("data", (c) => (d += c)); r.on("end", () => fs.writeFileSync(process.argv[1], JSON.stringify({ welt: JSON.parse(d).ergebnis, log: !!process.env.PUNKTE_SITZUNG_LOG }))); })' +
            '.end(JSON.stringify({ code: process.argv[2] }));', "{AUS}"];
        const warm = (j, l) => ({ gruen: !!j && j.welt === "warm" && j.log && /^\[linse-gpu\] amd\/stub-sitzung$/m.test(l.stdout), zahl: "welt " + (j && j.welt) });
        const S = (k, s, probe, urteil) => ({ ...gp, kriterium: k, staffel: s, probe, urteil });
        const hookLog = path.join(tmp, "sitzung-hook.log");
        fs.writeFileSync(hookLog, "2026-10-29 10:00:00 ende ci-probe 1/1 echt\n");
        const lauf = async (gruppen, art, gpuLauf, fahrtMaxS, eich, mehr = {}) => {
            fs.rmSync(zaehler, { force: true });
            const rohDir = path.join(tmp, "roh-" + art);
            const es = {}, reihe = [];
            const kopf = await fahreSitzung(gruppen, { koord: KOORD, geraet: "radeon", bash: findeBash(), gpuLauf, baum: tmp, port: P, band: [P, P + 20000, P + 19999],
                rohDir, welt: art === "kein-start" ? undefined : welt(art), stillS: 20, stilleS: 1, stromTaktMs: 200, hookLog, ...(fahrtMaxS ? { fahrtMaxS } : {}), ...(eich ? { eich } : {}), ...mehr },
            (g, xs, aus, zeit) => g.forEach((st, i) => { reihe.push(schluessel(st)); es[schluessel(st)] = stationsEintrag(xs[i], { zeit, abdruck: abdruck(st, h), port: P, bahn: "sitzung", zwilling: i ? schluessel(g[0]) : null, modus: "session" }); }));
            return { es, kopf, reihe, rohDir, z: fs.existsSync(zaehler) ? fs.readFileSync(zaehler, "utf8").trim().split("\n") : [] };
        };
        const gl = findeBash() ? path.join(tmp, "sitzung-schloss.sh") : null;
        const glLog = path.join(tmp, "sitzung-schloss.log");
        if (gl) fs.writeFileSync(gl, '#!/bin/bash\nN="$1"; shift\necho "$N $GPU_LAUF_ART $GPU_LAUF_MAX_S" >> "' + glLog.split(path.sep).join("/") + '"\necho "gpu-lauf: Schloss $N (zeit) nach 0 s" >&2\n"$@"\n');
        if (gl) fs.copyFileSync(path.join(DIR, "werkzeug", "gpu-schloss.sh"), path.join(tmp, "gpu-schloss.sh"));
        const g1 = [[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: ["node", "-e", "console.log('SCHRITT /umstellen 41.3 s'); setTimeout(() => {}, 60000)"], sek: 2 }, lies)],
            [S("c.K1", 1, { befehl: ["node", "-e", "process.exit(1)"], sek: 30 }, (j, l) => ({ gruen: l.exit === 0, zahl: "exit " + l.exit }))],
            [S("d.K1", 1, { befehl: [...ruf, "return 2"], sek: 30 }, warm), S("d.K1", 2, { befehl: [...ruf, "return 2"], sek: 30 }, warm)]];
        const r1 = await lauf(g1, "gut", gl);
        const x = r1.es;
        const zeile = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/;
        const schloss = gl && fs.existsSync(glLog) ? fs.readFileSync(glLog, "utf8").trim().split("\n") : [];
        pruef("SITZUNG EINE Welt: jede Probe darin (WERKBANK_PORT, das Log, der Zeuge der Welt), der Deckel der Probe beim Namen ihrer letzten Zeile, nach dem Fehler die nächste in DERSELBEN Welt, Zwillinge EIN Lauf",
            r1.z.filter((l) => l === "start").length === 1 && x["a.K1#1"].gruen && /^Deckel 2 s gerissen: Stille seit [\d.]+ s nach [\d.]+ s \(kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt\) — beendet, UNGEMESSEN \(zuletzt: SCHRITT \/umstellen 41\.3 s\)$/.test(x["b.K1#1"].grund) && x["b.K1#1"].ungemessen === true &&
            x["c.K1#1"].gruen === false && x["c.K1#1"].exit === 1 &&
            x["d.K1#1"].gruen && x["d.K1#2"].gruen && x["d.K1#2"].zwilling === "d.K1#1" && x["a.K1#1"].gpu === "amd/stub-sitzung" && r1.kopf.proben === 4, JSON.stringify([r1.z, x]));
        pruef("SITZUNG der Grund nach der Reihe anfang, die Grundstellung nur nach einem Abbruch oder einer mutierenden Probe — nie vor jeder; nach dem Abbruch (b.K1 am Deckel) durch die Tür (die Seite neu: die Arbeit der gefallenen Probe endet in der Seite); nie ein zweiter Start; am Ende stop",
            r1.z.join(",") === "start,nimm,warm,tuer,reload,grund,warm,stop" && r1.kopf.grundstellungS.length === 1 && typeof r1.kopf.bootS === "number", JSON.stringify([r1.z, r1.kopf]));
        // DER WARME START (takt25c GTX 6b3da705: nach jedem Riss die Tür, die neue Seite still, die nächste Probe zahlte den Ring im
        // eigenen Deckel — 36 von 38 UNGEMESSEN): eine Probe ohne Ort misst in der stehenden Welt — nach dem Boot und nach der Tür
        // EINMAL eingeschwungen, nie vor jeder; je Probe ihre Sekunden (s), b.K1 am Deckel 2 s
        pruef("SITZUNG DER WARME START: eine Probe ohne Ort misst in der stehenden Welt — nach dem Boot (vor a) und nach der Tür (vor c) EINMAL eingeschwungen (WELT_STEHT), nie vor jeder (b, d), vor dem Deckel und im Kopf wie ein Ort (ort null)",
            r1.kopf.orte.length === 2 && r1.kopf.orte.every((o) => o.ort === null && o.takte === 31 && o.chunks === 81 && typeof o.s === "number") &&
            r1.kopf.orte[0].vor === "a.K1#1" && r1.kopf.orte[0].nach === null && r1.kopf.orte[1].vor === "c.K1#1" && r1.kopf.orte[1].nach === "der Tür", JSON.stringify(r1.kopf.orte));
        pruef("SITZUNG DIE SEKUNDEN DER PROBE: jedes Ergebnis einer gefahrenen Probe trägt s (Start bis Ende ihres Prozesses) — b.K1 am Deckel 2 s nach 2 s, a.K1 in Sekunden",
            ["a.K1#1", "b.K1#1", "c.K1#1", "d.K1#1", "d.K1#2"].every((id) => typeof x[id].s === "number") && x["b.K1#1"].s >= 2 && x["b.K1#1"].s < 4 && x["a.K1#1"].s < 5,
            JSON.stringify(Object.entries(x).map(([id, e]) => id + " " + e.s)));
        // DER KONSUM IN DER SITZUNG (R6 nach Konsum): der Zeuge in save-server und Werkbank der Welt (hier die Attrappe welt-stub.cjs im Baum),
        // je geurteilter Probe ihr Fenster der Welt und EIN Boot-Abdruck für alle; eine Probe ohne Urteil (b.K1 am Deckel) trägt keinen
        {
            const mit = Object.keys(x).filter((id) => !x[id].ungemessen), ohne = Object.keys(x).filter((id) => x[id].ungemessen);
            const kv = mit.map((id) => (x[id].konsum ? konsumVon(x[id], null) : null));
            pruef("SITZUNG DER KONSUM DER WELT: jede geurteilte Probe trägt ihr Fenster der Welt (die Werkbank im Baum) und EINEN Boot-Abdruck für alle; die Probe ohne Urteil trägt keinen",
                ["a.K1#1", "d.K1#1", "d.K1#2"].every((id) => mit.includes(id)) && ohne.includes("b.K1#1") &&
                mit.every((id) => typeof x[id].konsum === "string" && x[id].konsumBoot === x["a.K1#1"].konsumBoot && !x[id].konsumFehlt) && kv.every((k) => k && /^[0-9a-f]{6}:/.test(k.k["welt-stub.cjs"] || "")) &&
                ohne.every((id) => !("konsum" in x[id])), JSON.stringify(Object.keys(x).map((id) => [id, x[id].ungemessen ? "ungemessen" : x[id].konsumFehlt || (x[id].konsum || "").length, (x[id].konsumBoot || "").length])));
        }
        pruef("SITZUNG das Schloss EINMAL für die ganze Sitzung (zeit, die Proben nehmen es nie)",
            !gl || (schloss.length === 1 && /^punkte-radeon-sitzung zeit \d+$/.test(schloss[0])), JSON.stringify(schloss));
        pruef("SITZUNG das Format von heute: je Station gruen, zahl, exit, minuten, zeit, abdruck, port, bahn und modus \"session\"; die Zeile liest zug.cjs",
            Object.values(x).every((e) => ["gruen", "zahl", "exit", "minuten", "zeit", "abdruck", "port", "bahn"].every((k) => k in e) && e.modus === "session" && e.bahn === "sitzung") &&
            Object.entries(x).every(([id, e]) => (e.ungemessen ? /^  OFFEN \S+ · (Deckel .*|.* — kein Urteil, UNGEMESSEN .*) · Sitzung · ungemessen/ : zeile).test(stationsZeile(id, e)) && / · Sitzung · /.test(stationsZeile(id, e))) &&
            // die Attrappe c stürzt ohne Zeile ab (Exit 1, ihr Urteil liest nur den Exit): kein Urteil, UNGEMESSEN beim Namen (keinUrteil)
            x["c.K1#1"].ungemessen === true && /^die Urteils-Zeile fehlt — kein Urteil, UNGEMESSEN \(die Probe sah: exit 1\)$/.test(x["c.K1#1"].grund),
            JSON.stringify(Object.entries(x).map(([id, e]) => stationsZeile(id, e))));
        // DIE LEINE (10.11., pm-deckel; Radeon 78d37554 `run --nur` mit 6 Proben: 6 von 6 UNGEMESSEN an Einzel-Uhren, die Fahrt 505 s von
        // 1 800): (a) die Probe ohne Lebenszeichen fällt über ihrem Grund-Deckel nach der Stille beim Namen, die Fahrt läuft weiter (die
        // nächste GRÜN); die LEBENDE (4 s Arbeit, je 0,3 s eine Zeile, Grund 2 s) misst GRÜN, und ihre eigene Frist folgt dem EINEN Deckel
        // ({SEK} = PUNKTE_PROBE_DECKEL_S = ihr Anteil der Fahrt, über dem Grund); (c) ein ROT im Maß nach 3 s am Grund 1 s bleibt ROT
        // gemessen — der Deckel ändert nie ein Urteil. DIE MUTANTE (vorher ROT am Täter): die feste Uhr je Station (bis 10.11.) tötete l nach 2 s
        const lebt = ["node", "-e", 'const t = setInterval(() => console.log("@@ Schritt"), 300); setTimeout(() => { clearInterval(t); require("fs").writeFileSync(process.argv[1], ' +
            'JSON.stringify({ n: 0, sek: Number(process.argv[2]), env: Number(process.env.PUNKTE_PROBE_DECKEL_S) })); }, 4000)', "{AUS}", "{SEK}"];
        const rotMass = ["node", "-e", 'const t = setInterval(() => console.log("@@ Schritt"), 300); setTimeout(() => { clearInterval(t); require("fs").writeFileSync(process.argv[1], JSON.stringify({ n: 7 })); }, 3000)', "{AUS}"];
        const nN = (j) => ({ gruen: !!j && j.n === 0, zahl: "n " + (j ? j.n : "—") + (j && j.sek ? " sek " + j.sek + " env " + j.env : "") });
        const rl = await lauf([[S("s.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 2 }, nN)], [S("l.K1", 1, { befehl: lebt, sek: 2 }, nN)],
            [S("r.K1", 1, { befehl: rotMass, sek: 1 }, nN)], [S("n.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut");
        const xl = rl.es, sekEnv = (/ sek (\d+) env (\d+)$/.exec((xl["l.K1#1"] || {}).zahl || "") || []).slice(1).map(Number);
        pruef("LEINE (a) die stille Probe fällt über ihrem Grund-Deckel 2 s nach 1 s Stille beim Namen, die Fahrt läuft weiter; die LEBENDE (4 s Arbeit am Grund 2 s) misst GRÜN, " +
            "ihre Frist folgt dem EINEN Deckel ({SEK} = PUNKTE_PROBE_DECKEL_S = der Anteil > 2 s); (c) ROT im Maß nach 3 s am Grund 1 s bleibt ROT gemessen",
            !!xl["s.K1#1"] && xl["s.K1#1"].ungemessen === true && /^Deckel 2 s gerissen: Stille seit [\d.]+ s nach [\d.]+ s \(kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt\) — beendet, UNGEMESSEN$/.test(xl["s.K1#1"].grund) && xl["s.K1#1"].s < 4 &&
            !!xl["l.K1#1"] && xl["l.K1#1"].gruen === true && !xl["l.K1#1"].ungemessen && xl["l.K1#1"].s >= 4 && sekEnv.length === 2 && sekEnv[0] > 2 && sekEnv[0] === sekEnv[1] &&
            !!xl["r.K1#1"] && xl["r.K1#1"].gruen === false && !xl["r.K1#1"].ungemessen && /^n 7/.test(xl["r.K1#1"].zahl) && xl["r.K1#1"].s >= 3 && !!xl["n.K1#1"] && xl["n.K1#1"].gruen === true,
            JSON.stringify(Object.entries(xl).map(([id, e]) => [id, e.gruen, e.ungemessen, e.s, e.grund || e.zahl])));
        // DIE MUTANTE der festen Uhr: trägt die Fahrt keinen Rest (60 s, nach l ein Bedarf von 1 000 s), ist ihr Anteil null und der Deckel der
        // Grund — die lebende fällt nach 2 s beim Namen, wie jede bis 10.11.; die Fahrt läuft weiter
        const rm = await lauf([[S("l.K1", 1, { befehl: lebt, sek: 2 }, nN)], [S("n.K1", 1, { befehl: [...ruf, "return 1"], sek: 1000 }, warm)]], "gut", null, 60);
        // DIE WELT LEBT (10.11., Koordinator: „Stille heißt kein Lebenszeichen der Probe (Takt/Log)“): eine Probe, die 3 s schweigt, aber den
        // Loop der Welt treibt (ihre Bilder kommen im Zapfen an), misst über ihrem Grund-Deckel 2 s GRÜN; dieselbe ohne Loop (die Welt steht
        // zwischen den Befehlen) fällt wie bisher — die Mutante, die nur Zeilen der Probe zählte. DER DECKEL DES GERÄTS: dieselbe stille
        // Probe (3 s, Grund 2 s) reißt auf der Radeon (Takt-Faktor 1) und misst auf der GTX (Takt-Faktor 1,54: der Grund-Deckel ⌈2 × 1,54⌉ = 4 s)
        const schweigt = (loop) => ["node", "-e", 'const fs = require("fs"), http = require("http"); const e = (c) => new Promise((ok) => http.request({ host: "127.0.0.1", ' +
            'port: Number(process.env.WERKBANK_PORT), path: "/eval", method: "POST" }, (r) => { r.resume(); r.on("end", ok); }).end(JSON.stringify({ code: c }))); ' +
            '(async () => { ' + (loop ? 'await e("loop an"); ' : "") + 'await new Promise((w) => setTimeout(w, 3000)); ' + (loop ? 'await e("loop aus"); ' : "") +
            'fs.writeFileSync(process.argv[1], JSON.stringify({ n: 0 })); })();', "{AUS}"];
        const rw = await lauf([[S("w.K1", 1, { befehl: schweigt(true), sek: 2 }, nN)], [S("v.K1", 1, { befehl: schweigt(false), sek: 2 }, nN)]], "gut");
        const rg = await lauf([[S("v.K1", 1, { befehl: schweigt(false), sek: 2 }, nN)]], "gut", null, null, null, { geraet: "gtx" });
        const stille = /^Deckel 2 s gerissen: Stille seit [\d.]+ s nach [\d.]+ s \(kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt\) — beendet, UNGEMESSEN$/;
        pruef("LEINE DIE WELT LEBT: die stille Probe, die den Loop der Welt treibt, misst über ihrem Grund-Deckel 2 s GRÜN; dieselbe ohne Loop fällt nach der Stille beim Namen (die Mutante: nur Zeilen zählten)",
            !!rw.es["w.K1#1"] && rw.es["w.K1#1"].gruen === true && !rw.es["w.K1#1"].ungemessen && rw.es["w.K1#1"].s >= 3 &&
                !!rw.es["v.K1#1"] && rw.es["v.K1#1"].ungemessen === true && stille.test(rw.es["v.K1#1"].grund), JSON.stringify(Object.entries(rw.es).map(([id, e]) => [id, e.gruen, e.s, e.grund || e.zahl])));
        const vSt = S("v.K1", 1, { befehl: schweigt(false), sek: 2 }, nN);
        pruef("LEINE DER DECKEL DES GERÄTS: dieselbe stille Probe (3 s, Grund 2 s) reißt mit Faktor 1 (Radeon) und misst mit dem Takt-Faktor der GTX (Grund an der Leine " +
            grundDeckel(vSt, "gtx") + " s); die Radeon behält ihren Deckel, Tafel und Plan der Fahrt bleiben Byte für Byte",
            taktVon("radeon") === 1 && taktVon("gtx") > 1.5 && grundDeckel(vSt, "radeon") === 2 && probeSek(vSt, "gtx") === 2 && grundDeckel(vSt, "gtx") === Math.ceil(2 * taktVon("gtx")) &&
                !!rg.es["v.K1#1"] && rg.es["v.K1#1"].gruen === true && !rg.es["v.K1#1"].ungemessen && rg.es["v.K1#1"].s >= 3 && stille.test(rw.es["v.K1#1"].grund),
            JSON.stringify([rg.es["v.K1#1"], rw.es["v.K1#1"] && rw.es["v.K1#1"].grund]));
        pruef("LEINE die MUTANTE ohne Rest der Fahrt: der Deckel ist der Grund, die lebende Probe fällt nach 2 s beim Namen (Deckel 2 s, kein Anteil), die nächste misst GRÜN",
            !!rm.es["l.K1#1"] && rm.es["l.K1#1"].ungemessen === true && /^Deckel 2 s gerissen — beendet, UNGEMESSEN \(zuletzt: @@ Schritt\)$/.test(rm.es["l.K1#1"].grund) && rm.es["l.K1#1"].s < 4 &&
            !!rm.es["n.K1#1"] && rm.es["n.K1#1"].gruen === true, JSON.stringify(rm.es));
        // DER HALT DER MESSUNG IST EINE LEIHE (messHaltRuf): h stellt die Bühne und lässt weatherEffectTime −1e9 stehen; die nächste Probe k
        // findet den Halt des Spiels (0), der Kopf nennt h. DIE MUTANTE (vorher ROT am Täter, Radeon fd5df4bf bauen.K5#2 2/6): ohne die
        // Rückgabe fände k −1e9
        {
            const haltU = (j) => ({ gruen: !!j && j.welt === 0, zahl: "halt " + (j && j.welt) });
            const rh = await lauf([[S("h.K1", 1, { befehl: [...ruf, "seite: r.state.weatherEffectTime = -1e9; return \"warm\";"], sek: 30 }, warm)],
                [S("k.K1", 1, { befehl: [...ruf, "seite: return r.state.weatherEffectTime;"], sek: 30 }, haltU)]], "gut");
            pruef("SITZUNG DER HALT DER MESSUNG ZURÜCK: h ließ weatherEffectTime −1e9 stehen, k misst am Halt des Spiels (0), der Kopf nennt h beim Namen",
                !!rh.es["h.K1#1"] && rh.es["h.K1#1"].gruen === true && !!rh.es["k.K1#1"] && rh.es["k.K1#1"].gruen === true &&
                    JSON.stringify(rh.kopf.messHalt) === JSON.stringify([{ probe: "h.K1#1", halt: -1e9, zurueck: 0 }]),
                JSON.stringify([rh.es["k.K1#1"] && rh.es["k.K1#1"].zahl, rh.kopf.messHalt]));
        }
        // DIE TEILE EINER PROBE (probe.teile, w19-fahrt-ziel-2-pm): je Teil ein Prozess unter dem Deckel mit PUNKTE_TEIL und der Frist
        // (Gesetz − Vorlauf, nie der Eich-Deckel), der nächste nur nach WEITER, EIN Urteil über alle Teile, `s` der längste, `teile` je Teil;
        // der Deckel eines Teils und ein letzter Teil, der WEITER sagt, sind UNGEMESSEN beim Namen. DIE MUTANTE (vorher ROT am Täter): ohne
        // `teile` urteilt die Station nach dem ersten Teil — die Fahrt von fahrzeug.K2#1 hieße ROT, wo sie nur hielt
        const teilB = (plan) => ["node", "-e", 'const t = process.env.PUNKTE_TEIL || "1/1"; const p = ' + JSON.stringify(plan) + '[t.split("/")[0] - 1]; ' +
            'console.log("T " + t + " " + process.env.PUNKTE_TEIL_FRIST_S); if (p === "haengt") setTimeout(() => {}, 60000); else console.log(p === "weiter" ? "@@PUNKTE@@ TEIL WEITER" : "ENDE");'];
        const teilU = (j, l) => ({ gruen: /^ENDE$/m.test(l.stdout), zahl: (l.stdout.match(/^T .*$/gm) || []).join(",") + (/^ENDE$/m.test(l.stdout) ? " ENDE" : "") });
        const rt = await lauf([[S("t.K1", 1, { befehl: teilB(["weiter", "weiter", "ende"]), sek: 30, teile: 3 }, teilU)], [S("u.K1", 1, { befehl: teilB(["weiter", "ende", "weiter"]), sek: 30, teile: 3 }, teilU)],
            [S("v.K1", 1, { befehl: teilB(["weiter", "haengt"]), sek: 2, teile: 2 }, teilU)], [S("w.K1", 1, { befehl: teilB(["weiter", "weiter"]), sek: 30, teile: 2 }, teilU)],
            [S("m.K1", 1, { befehl: teilB(["weiter", "weiter", "ende"]), sek: 30 }, teilU)]], "teile", null, 200);
        // die Fahrt von 200 s trägt keinen Rest über den Grund-Deckeln (Σ 274 s): je Teil der Grund 30 s, die Frist 24 s. In der Eich-Fahrt
        // mit dem ganzen Budget folgt die Frist jedes Teils dem EINEN Deckel — dem Anteil je Teil, über dem Grund
        const re = await lauf([[S("e.K1", 1, { befehl: teilB(["weiter", "ende"]), sek: 30, teile: 2 }, teilU)]], "teile-eich", null, null, true);
        const xt = { ...rt.es, ...re.es };
        const fristE = (/^T 1\/2 (\d+),T 2\/2 (\d+) ENDE$/.exec(xt["e.K1#1"].zahl) || []).slice(1).map(Number);
        pruef("SITZUNG DIE TEILE: drei Teile EIN Urteil (Frist 24 s = Deckel 30 − 6 ohne Rest der Fahrt, mit Rest der Anteil je Teil − 6; s der längste, je Teil seine Sekunden); endet Teil 2 ohne WEITER, " +
            "fährt Teil 3 nie; der Deckel in Teil 2/2 und ein letzter Teil mit WEITER UNGEMESSEN beim Namen; die MUTANTE ohne teile ROT nach Teil 1",
            xt["t.K1#1"].gruen === true && xt["t.K1#1"].zahl === "T 1/3 24,T 2/3 24,T 3/3 24 ENDE" && xt["t.K1#1"].teile.length === 3 && xt["t.K1#1"].s === Math.max(...xt["t.K1#1"].teile) &&
            xt["u.K1#1"].gruen === true && xt["u.K1#1"].zahl === "T 1/3 24,T 2/3 24 ENDE" && xt["u.K1#1"].teile.length === 2 &&
            xt["v.K1#1"].ungemessen === true && /^Deckel 2 s gerissen in Teil 2\/2 — beendet, UNGEMESSEN/.test(xt["v.K1#1"].grund) && xt["v.K1#1"].teile.length === 2 && xt["v.K1#1"].s >= 2 &&
            xt["w.K1#1"].ungemessen === true && /^die Teile reichten nicht: Teil 2\/2 sagte WEITER/.test(xt["w.K1#1"].grund) &&
            xt["m.K1#1"].gruen === false && xt["m.K1#1"].zahl === "T 1/1 undefined" && !xt["m.K1#1"].ungemessen &&
            xt["e.K1#1"].gruen === true && fristE.length === 2 && fristE[0] > 24 && fristE[0] === fristE[1] && xt["e.K1#1"].eich && xt["e.K1#1"].eich.sek === 30,
            JSON.stringify(Object.entries(xt).map(([id, e]) => [id, e.gruen, e.ungemessen, e.zahl, e.grund, e.s, e.teile])));
        // DIE REIHE und DER STROM: anfang, die Welt lassend, ende, mutierend — die Grundstellung nur nach der mutierenden; jede Probe kennt
        // den Strom und ihren Namen, die Bilder ihres Loops stehen unter ihrem Namen, der Kopf trägt die Dauerlast
        const umw = ["node", "-e", 'require("fs").writeFileSync(process.argv[1], JSON.stringify({ strom: process.env.PUNKTE_SITZUNG_STROM, probe: process.env.PUNKTE_PROBE }))', "{AUS}"];
        const loop = ["node", "-e", 'const h = require("http"); const e = (c) => new Promise((f) => h.request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/eval", method: "POST" }, ' +
            '(r) => (r.resume(), r.on("end", f))).end(JSON.stringify({ code: c }))); (async () => { await e("loop an"); await new Promise((f) => setTimeout(f, 400)); await e("loop aus"); ' +
            'require("fs").writeFileSync(process.argv[1], "{}"); })();', "{AUS}"];
        const umwOk = (j) => ({ gruen: !!j && !!j.strom && fs.existsSync(j.strom) && !!j.probe, zahl: JSON.stringify(j) });
        const da = (j) => ({ gruen: !!j, zahl: "da" });
        const r5 = await lauf([[S("m.K1", 1, { befehl: loop, sek: 30, mutiert: true }, da)], [S("n.K1", 1, { befehl: umw, sek: 30 }, umwOk)],
            [S("a.K1", 1, { befehl: loop, sek: 30, stellung: "anfang" }, da)], [S("e.K1", 1, { befehl: umw, sek: 30, stellung: "ende" }, umwOk)],
            [S("o.K1", 1, { befehl: umw, sek: 30, mutiert: true }, umwOk)]], "reihe", null);
        const sr = stromLesen(path.join(r5.rohDir, "sitzung", "strom.ndjson"));
        const je = (p) => sr.bilder.filter((b) => b.probe === p).length;
        pruef("SITZUNG die Reihe: anfang · was die Welt lässt · ende · was sie ändert; die Grundstellung nur nach der mutierenden (m vor o)",
            r5.reihe.join(" ") === "a.K1#1 n.K1#1 e.K1#1 m.K1#1 o.K1#1" && r5.z.join(",") === "start,nimm,warm,grund,warm,stop" && Object.values(r5.es).every((e) => e.gruen), JSON.stringify([r5.reihe, r5.z, r5.es]));
        pruef("SITZUNG DER STROM: der Haken über /eval in der Seite, jede Probe kennt ihn (PUNKTE_SITZUNG_STROM, PUNKTE_PROBE), die Bilder ihres Loops unter ihrem Namen, EINE Seite über die Grundstellung (kein Neuladen), der Kopf trägt die Dauerlast",
            je("a.K1#1") >= 5 && je("m.K1#1") >= 5 && je("n.K1#1") === 0 && sr.seiten.length === 1 && sr.bilder.every((b) => b.vram === 2 && b.befehle === 7 && b.voll === 1) &&
            r5.kopf.strom && r5.kopf.strom.bilder >= 8 && r5.kopf.strom.luecken === 0 && r5.kopf.strom.zapfen >= 10 && r5.kopf.strom.fehler === 0,
            JSON.stringify({ a: je("a.K1#1"), m: je("m.K1#1"), seiten: sr.seiten.length, kopf: r5.kopf.strom }));
        const r2g = [[S("a.K1", 1, { befehl: [...ruf, "tod"], sek: 30 }, (j) => ({ gruen: !!j && j.welt === "tod", zahl: "tod" }))], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]];
        const r2 = await lauf(r2g, "stirbt", null);
        const r2f = { es: {}, gefahren: [] };
        const r2k = await fahreFortsetzung(r2g, r2.kopf, async (gs) => {
            r2f.gefahren.push(gs.map((g) => schluessel(g[0])).join(","));
            const k = await lauf(gs, "stirbt", null);
            Object.assign(r2f.es, k.es);
            return k.kopf;
        });
        pruef("SITZUNG eine Welt, die stirbt: die Sitzung startet nie neu, die übrigen Proben sind offen, UNGEMESSEN beim Grund (nie ROT) — die Fortsetzung misst sie in einer neuen Sitzung (b GRÜN), a fährt nie nach",
            r2.z.filter((l) => l === "start").length === 1 && r2.es["b.K1#1"].ungemessen === true && /trägt nicht mehr .* — offen, UNGEMESSEN$/.test(r2.es["b.K1#1"].grund) &&
            /trägt nicht mehr.* — offen: b.K1#1$/.test(r2.kopf.grund) && JSON.stringify(r2.kopf.offen) === "[\"b.K1#1\"]" &&
            r2f.gefahren.join("|") === "b.K1#1" && r2f.es["b.K1#1"].gruen === true && r2k.length === 1 && !r2k[0].offen,
            JSON.stringify([r2.z, r2.es, r2.kopf, r2f, r2k.map((k) => k.offen)]));
        // DIE WELT ENDET UNTER DER PROBE (Takt 23 GTX an 73bdf938: die Vorfahrt der OMEN nahm sie nach 7,0 min, ferne.K1#2 stand als ROT
        // „read ECONNRESET“ in der Messung): der Ruf der Probe reißt ohne Antwort, die Probe endet nicht GRÜN — das ist keine Messung
        const r12 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "mord"], sek: 30 }, (j, l) => ({ gruen: !!j && j.welt === "warm", zahl: "exit " + l.exit }))],
            [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "mord", null);
        pruef("SITZUNG eine Welt, die UNTER der Probe endet (die Vorfahrt der OMEN): die Probe ist UNGEMESSEN beim Grund, nie ROT; die übrigen ebenso",
            r12.z.join(",") === "start,nimm,warm,mord" && r12.es["a.K1#1"].ungemessen === true && /endete während der Probe/.test(r12.es["a.K1#1"].grund) &&
            /die Probe sah: exit [1-9]/.test(r12.es["a.K1#1"].zahl) && r12.es["b.K1#1"].ungemessen === true && /trägt nicht mehr/.test(r12.es["b.K1#1"].grund),
            JSON.stringify([r12.z, r12.es, r12.kopf]));
        // DER WEG EINER PROBE (w4-sitzung-reif; tempo4 legt seinen Weg über die Wiese, `_standRueckspielen` lässt die Wege-Karte und die
        // Natur, die er räumte, warm): nennt die Grundstellung an Ort und Stelle einen Weg seit dem Grund, geht sie durch die Tür (die
        // Lade-Kette des Speicher-Gesetzes baut Karte und Natur aus dem Grund neu) — die nächste Probe misst im Grund; trägt die Welt ihn
        // auch durch die Tür, sind die übrigen UNGEMESSEN beim Namen des Wegs
        const r13 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "weg", null);
        pruef("SITZUNG DER WEG EINER PROBE: die Grundstellung nennt ihn und geht durch die Tür, danach misst die nächste Probe im Grund (die Tür im Kopf beim Namen des Wegs)",
            r13.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,warm,stop" && r13.es["m.K1#1"].gruen && r13.es["b.K1#1"].gruen &&
            r13.kopf.wegeTueren.length === 1 && /^wege \+1 .*probe:tempo4/.test(r13.kopf.wegeTueren[0].wege), JSON.stringify([r13.z, r13.es, r13.kopf.wegeTueren]));
        const r14 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "weg-bleibt", null);
        pruef("SITZUNG MUTANTE ein Weg, der auch die Tür überlebt: die übrigen Proben UNGEMESSEN beim Namen des Wegs (nie ROT, nie still weiter)",
            r14.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,stop" && r14.es["m.K1#1"].gruen && r14.es["b.K1#1"].ungemessen === true &&
            /abweichend vom Grund: wege \+1 .*probe:tempo4/.test(r14.es["b.K1#1"].grund), JSON.stringify([r14.z, r14.es]));
        // DIE TRITTFLÄCHE IST KEIN GRUND (eich5 GTX 379e5f56: „wege −17“ nach der Tür, die Sitzung endete): der Abdruck trägt die
        // Trittfläche eines Eintrags nie — nach der Tür fehlt sie ohne Abweichung; eine Fläche, die kein Eintrag trägt, bleibt ein Weg
        {
            const kasten = (x) => ({ x0: x, z0: -63.7, x1: x + 2.1, z1: -61.6, formen: [{ typ: "kasten" }] });
            const [weg, t1, t2] = [{ x0: -10, z0: 0, x1: 10, z1: 60, formen: [{}, {}] }, kasten(-119.9), kasten(-3.2)];
            const welt = (fl, arch) => ({ state: { wegeKarte: { siedlungen: fl }, architectures: arch }, _stlWegeKeys: new Set(["dorf:1"]) });
            const grund = wegeAbdruck(welt([weg, t1, t2], [{ _trittBox: t1 }, { _trittBox: t2 }, { _trittBox: false }]));
            const tuer = wegeAbdruck(welt([weg], [{ _trittBox: undefined }, { _trittBox: undefined }, { _trittBox: false }]));
            const waise = wegeAbdruck(welt([weg, t1], [{ _trittBox: undefined }]));
            pruef("SITZUNG DIE TRITTFLÄCHE IST KEIN GRUND: der Abdruck trägt die Trittfläche eines Eintrags nie — nach der Tür fehlt sie ohne Abweichung (eich5: „wege −17“); eine Fläche ohne Eintrag bleibt ein Weg (+1)",
                grund.flaechen.length === 1 && wegeAbweichung(grund, tuer) === null &&
                /^wege \+1 \[-119\.9,-63\.7,-117\.8,-61\.6\/1\]$/.test(String(wegeAbweichung(grund, waise))), JSON.stringify([grund, tuer, waise]));
        }
        // DER ABBRUCH VON ANFANG: fällt die letzte Probe von anfang am Deckel, lädt die Seite neu, ehe der Grund genommen wird
        const r10 = await lauf([[S("a.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 2, stellung: "anfang" }, lies)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", null);
        pruef("SITZUNG DER ABBRUCH VON ANFANG: die Seite neu, ehe der Grund genommen wird (nie ein Grund aus einer Seite, in der eine gefallene Probe arbeitet)",
            r10.z.join(",") === "start,reload,nimm,grund,warm,stop" && r10.es["a.K1#1"].ungemessen === true && r10.es["b.K1#1"].gruen, JSON.stringify([r10.z, r10.es]));
        // DER ORT: die Proben eines Messorts stehen beieinander (die Reihe ihres ersten Auftritts, ohne Ort zuletzt), die Sitzung stellt je
        // Ort EINMAL um (vor dem Deckel der Probe, je Ort im Kopf), nach einer Grundstellung neu (der Grund stellt den Spieler zurück)
        const mitOrt = (o) => [...ruf, "return 1", "umstellen --ort " + o];
        const r11 = await lauf([[S("a.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)], [S("b.K1", 1, { befehl: mitOrt("genesis"), sek: 30 }, warm)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("d.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)],
            [S("m.K1", 1, { befehl: mitOrt("wiese"), sek: 30, mutiert: true }, warm)], [S("n.K1", 1, { befehl: mitOrt("wiese"), sek: 30, mutiert: true }, warm)]], "gut", null);
        pruef("SITZUNG DER ORT: die Proben eines Messorts beieinander, EIN Umstellen je Ort vor dem Deckel der Probe, nach der Grundstellung neu, je Ort im Kopf",
            r11.reihe.join(" ") === "a.K1#1 d.K1#1 b.K1#1 c.K1#1 m.K1#1 n.K1#1" &&
            r11.z.join(",") === "start,nimm,umstellen:wiese,umstellen:genesis,umstellen:wiese,grund,umstellen:wiese,stop" &&
            r11.kopf.orte.length === 4 && r11.kopf.orte[3].nach === "der Grundstellung" && Object.values(r11.es).every((e) => e.gruen),
            JSON.stringify([r11.reihe, r11.z, r11.kopf.orte]));
        // DER ORT WANDERT NIE MIT (spielerStand; schatten.K5#1 Radeon 3,9 m gegen 9,4 m vom Feuer): v trägt den Spieler 5 m vom Stand der
        // Wiese, w (dieselbe Wiese) findet den Ort neu umgestellt; x (ruhig) lässt ihn stehen, y misst ohne Umstellen. DIE MUTANTE (vorher ROT
        // am Täter): EIN Umstellen je Ort wie bis 13.11. — w mäße 5 m daneben
        {
            const geht = (o) => [...ruf, "seite: r.state.playerMesh.position.x += 5; return \"warm\";", "umstellen --ort " + o];
            const rw2 = await lauf([[S("v.K1", 1, { befehl: geht("wiese"), sek: 30 }, warm)], [S("w.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)],
                [S("x.K1", 1, { befehl: mitOrt("genesis"), sek: 30 }, warm)], [S("y.K1", 1, { befehl: mitOrt("genesis"), sek: 30 }, warm)]], "gut", null);
            pruef("SITZUNG DER ORT WANDERT NIE MIT: v trug den Spieler 5 m fort, w stellt die Wiese neu um (beim Namen im Kopf); nach der ruhigen x misst y ohne Umstellen",
                rw2.z.join(",") === "start,nimm,umstellen:wiese,umstellen:wiese,umstellen:genesis,stop" && Object.values(rw2.es).every((e) => e.gruen) &&
                    JSON.stringify(rw2.kopf.wanderung) === JSON.stringify([{ probe: "v.K1#1", ort: "wiese", m: 5, dreh: 0 }]) && rw2.kopf.orte[1].nach === "der Wanderung von v.K1#1",
                JSON.stringify([rw2.z, rw2.kopf.wanderung, rw2.kopf.orte]));
        }
        // DIE NEUE SEITE (DER WARME START): eine Probe, die die Seite neu lädt (ein Zweit-Boot, eine Welt durch die Tür), lässt eine Seite
        // ohne Ring — die nächste Probe desselben Orts stellt neu um (vorher fand sie den Ort „gebaut“ und baute ihn im eigenen Deckel)
        const neuLaden = ["node", "-e", 'require("http").request({ host: "127.0.0.1", port: Number(process.env.WERKBANK_PORT), path: "/reload", method: "POST" }, ' +
            '(r) => (r.resume(), r.on("end", () => require("fs").writeFileSync(process.argv[1], "{}")))).end("{}")', "{AUS}", "umstellen --ort wiese"];
        const r15 = await lauf([[S("a.K1", 1, { befehl: neuLaden, sek: 30 }, da)], [S("d.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", null);
        pruef("SITZUNG DIE NEUE SEITE: lädt eine Probe die Seite neu, stellt die nächste ihres Orts neu um (der Ring der alten Seite ist fort) — im Kopf nach „einer neuen Seite“; ohne Ort danach kein zweites Einschwingen",
            r15.z.join(",") === "start,nimm,umstellen:wiese,reload,umstellen:wiese,stop" && r15.kopf.orte.length === 2 && r15.kopf.orte[1].nach === "einer neuen Seite" &&
            Object.values(r15.es).every((e) => e.gruen), JSON.stringify([r15.z, r15.kopf.orte, r15.es]));
        // DIE WELT HÄNGT (Radeon-Eich 25ac4c0c: „wald 11“ offen, jede Probe am Ort danach zahlte 36 s und fiel): steht der Ort nicht, geht die
        // Sitzung EINMAL durch die Tür und stellt neu um — die Probe misst in der heilen Welt, im Kopf nach „der Tür (die Welt hing)“
        const rH = await lauf([[S("a.K1", 1, { befehl: mitOrt("wiese"), sek: 30 }, warm)]], "haengt", null);
        pruef("SITZUNG DIE WELT HÄNGT: der Ort steht nicht — EINMAL durch die Tür, neu umgestellt, die Probe misst in der heilen Welt",
            rH.z.join(",") === "start,nimm,umstellen:wiese,tuer,reload,grund,umstellen:wiese,stop" && rH.kopf.orte.length === 1 && rH.kopf.orte[0].nach === "der Tür (die Welt hing)" &&
            !rH.kopf.orte[0].fehler && rH.es["a.K1#1"].gruen, JSON.stringify([rH.z, rH.kopf.orte, rH.es]));
        // DIE EICH-FAHRT (eichEintrag): der Deckel ändert nie ein Urteil — GRÜN nach 50 s bleibt GRÜN (bis 10.11. „über dem Gesetz 45 s,
        // das Urteil zählt nie“), ROT bleibt ROT, je mit ihrer Zahl; an der Leine gefallen ist die Zahl zensiert (gerissen), der Grund bleibt
        // wörtlich; die Welt, die endete, und die Fahrt, die riss, tragen keine Zahl der Probe
        const pe = (p) => ({ ...gp, probe: { befehl: ["node", "-e", "0"], sek: 10, ...p } });
        const riss = "Deckel 10 s gerissen: Stille seit 15 s nach 25 s (kein Lebenszeichen) — beendet, UNGEMESSEN (zuletzt: SCHRITT /bild 14.5 s)";
        const ee = [eichEintrag(pe({}), { gruen: true, zahl: "z", exit: 0, minuten: 0.8, s: 50 }), eichEintrag(pe({ sek: 60 }), { gruen: false, zahl: "rot", grund: "ROT: rot", exit: 0, minuten: 0.8, s: 50 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: riss, grund: riss, exit: 1, minuten: 0.5, s: 25.3 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: "w", grund: "die Welt der Sitzung endete während der Probe (x) — ungemessen", s: 3 }),
            eichEintrag(pe({}), { gruen: false, ungemessen: true, zahl: "f", grund: "Deckel der Fahrt 1800 s gerissen nach 12 s der Probe — beendet, UNGEMESSEN", s: 12 })];
        pruef("EICH der Deckel ändert nie ein Urteil: GRÜN nach 50 s am Grund 10 s bleibt GRÜN · ROT bleibt ROT · an der Leine zensiert, der Grund wörtlich · Welt und Fahrt ohne Zahl",
            ee[0].gruen === true && !ee[0].ungemessen && ee[0].eich.s === 50 && ee[0].eich.sek === 10 && ee[0].zahl === "z" &&
            ee[1].gruen === false && !ee[1].ungemessen && ee[1].eich.s === 50 && ee[1].eich.sek === 60 &&
            ee[2].ungemessen === true && ee[2].eich.gerissen === true && ee[2].grund === riss &&
            !ee[3].eich && !ee[4].eich && ee[3].grund === "die Welt der Sitzung endete während der Probe (x) — ungemessen", JSON.stringify(ee));
        // DIE EICH-FAHRT in der Stub-Welt: dieselbe Leine — die lebende Probe (4 s Arbeit am Grund 2 s) misst GRÜN, ihre Zahl beim Namen
        const r16 = await lauf([[S("a.K1", 1, { befehl: lebt, sek: 2 }, nN)]], "gut", null, null, true);
        const ea = r16.es["a.K1#1"] || {};
        pruef("EICH-FAHRT an derselben Leine: die lebende Probe über ihrem Grund-Deckel (2 s) misst GRÜN, eich s ≥ 4 · sek 2; der Kopf nennt die Fahrt",
            ea.gruen === true && !!ea.eich && ea.eich.sek === 2 && ea.eich.s >= 4 && ea.eich.s < 12 && !!r16.kopf.eich && r16.kopf.eich.fahrtMaxS === FAHRT_MAX_S,
            JSON.stringify([ea, r16.kopf.eich]));
        // DER ZEUGE IST EIN LEBENSZEICHEN (R6 nach Konsum; Radeon 11.11. unter Last: die lebende Probe oben fiel „Stille seit 2 s nach
        // 2 s“, weil der Konsum-Zeuge vor ihrer ersten Zeile rechnete): eine STUMME Probe aus zwei node-Prozessen nacheinander (je 1,5 s)
        // fällt an der Leine (Grund 2 s, Stille 3 s) nicht — Start und Ende jedes Prozesses meldet der Zeuge (`.offen`, „bereit“,
        // „endet“), und jedes zählt wie eine Zeile; dieselbe Stille ohne node-Prozess (die Mutante) fällt nach 3 s beim Namen. Die
        // Fristen tragen einen Prozess-Start von bis zu 2,7 s (das ausgelastete Mess-Gerät)
        if (findeBash()) {
            const stumm = ["bash", "-c", "sleep 0.3; node -e \"setTimeout(() => {}, 1500)\"; exec node -e \"setTimeout(() => require('fs').writeFileSync(process.argv[1], JSON.stringify({ n: 0 })), 1500)\" \"$0\"", "{AUS}"];
            const ohneZeugen = ["bash", "-c", "sleep 3.4; echo '{\"n\":0}' > \"$0\"", "{AUS}"];
            const rL = await lauf([[S("a.K1", 1, { befehl: stumm, sek: 2 }, nN)], [S("b.K1", 1, { befehl: ohneZeugen, sek: 2 }, nN)]], "gut", null, null, false, { stilleS: 3 });
            const [la, lb] = [rL.es["a.K1#1"] || {}, rL.es["b.K1#1"] || {}];
            pruef("LEBENSZEICHEN DES ZEUGEN: die stumme Probe aus zwei node-Prozessen (über 3 s ohne Zeile) misst GRÜN — Start und Ende jedes Prozesses zählen an der Leine; dieselbe Stille ohne Zeugen fällt nach 3 s beim Namen (Mutante)",
                la.gruen === true && !la.ungemessen && la.s >= 3.2 && lb.ungemessen === true && /^Deckel 2 s gerissen: Stille seit [\d.]+ s nach [\d.]+ s /.test(lb.grund || ""), JSON.stringify([la.gruen, la.zahl, la.s, lb.ungemessen, lb.grund]));
        }
        // DIE AUSWAHL DER EICH-FAHRT (eichOffen): eine Probe mit Zahl am SHA und heutigem Abdruck fällt heraus; ohne Zahl, mit fremdem Abdruck
        // (die Probe änderte sich) oder an einem anderen SHA bleibt sie — die nächste Eich-Fahrt misst den Rest
        const [sa, sb, sc] = ["a", "b", "c"].map((n) => S(n + ".K1", 1, { befehl: ["node", n], sek: 10 }, lies));
        const mo = { sha: "s1", je: { "a.K1#1": { eich: { s: 3 }, abdruck: abdruck(sa, h) } },
            ungemessen: { "b.K1#1": { eich: { s: 50 }, abdruck: "alt" }, "c.K1#1": { grund: "Deckel 10 s gerissen" } } };
        const eo = [eichOffen([sa, sb, sc], mo, "s1", (st) => abdruck(st, h)), eichOffen([sa], mo, "s2", (st) => abdruck(st, h)), eichOffen([sa], null, "s1", (st) => abdruck(st, h))]
            .map((l) => l.map(schluessel).join(","));
        pruef("EICH die Auswahl: mit Zahl am SHA und heutigem Abdruck heraus · ohne Zahl, mit fremdem Abdruck, an einem anderen SHA oder ohne Mess-Datei bleibt sie",
            eo.join(" | ") === "b.K1#1,c.K1#1 | a.K1#1 | a.K1#1", eo.join(" | "));
        // DIE MUTANTE (b) DER INVENTUR (07.11., Entwurf 2): die Reihe [2 s ROT, 2 s ROT, 41/44/48 s GRÜN] gab dem alten p90 aller Läufe den
        // Boden 10 s (62 Stationen, 248 Risse) — die Grün-Reihe gibt ⌈2 × 48⌉ + 6 = 102 s; nie unter dem höchsten je grünen Lauf (zehn junge
        // 10 s, ein alter 80 s: 86 s, nie 26 s); unter drei Grün-Läufen die Vorgabe
        const rr = (s, gruen) => ({ s, gruen, gemessen: true, zensiert: false, zeit: "", sha: "x" });
        const db = [deckelAus([rr(2, false), rr(2, false), rr(41, true), rr(44, true), rr(48, true)], PROBE_DECKEL_S, 10),
            deckelAus([...Array.from({ length: 10 }, () => rr(10, true)), rr(80, true)], PROBE_DECKEL_S, 10), deckelAus([rr(30, true), rr(2, false)], PROBE_DECKEL_S, 10)];
        pruef("DECKEL (b) aus der Grün-Reihe: [2 ROT, 2 ROT, 41, 44, 48 GRÜN] → 102 s (alt 10 s) · nie unter dem höchsten Grün (80 s → 86, nie 26) · unter 3 Grün-Läufen die Vorgabe 45 s",
            db[0].neu >= 102 && db[0].p90 === 48 && db[1].neu === 86 && db[1].p90 === 10 && db[2].neu === PROBE_DECKEL_S && db[2].p90 === null, JSON.stringify(db));
        // (c) OHNE GRÜN-REIHE (11.11.): drei ROT-Urteile 74 · 86 · 86 s am Deckel 90 → ⌈2 × 86⌉ + 6 = 178 s (alt 92: das Urteil + 6, es riss an
        // jeder Schwankung); ein Deckel 120 in der Ruhe (101–178) bleibt. (d) DER RISS VERDOPPELT: zwei Risse bei 90 s ohne Urteil → 186 s;
        // ein Riss VOR dem jüngsten Urteil zählt nie. (e) HÄNGT: riss noch bei 378 s (≥ ZENSIERT_HAENGT_S) → zurück auf die Vorgabe
        const zz = (s) => ({ s, gruen: false, gemessen: false, zensiert: true, zeit: "", sha: "x" });
        const dc = [deckelAus([rr(86, false), rr(86, false), rr(74, false)], 90, 90), deckelAus([rr(86, false), rr(86, false), rr(74, false)], 90, 120),
            deckelAus([zz(90), zz(90)], 90, 90), deckelAus([rr(40, false), zz(90)], 90, 90), deckelAus([zz(378), zz(186), zz(90)], 90, 378)];
        pruef("DECKEL (c–e) ohne Grün-Reihe: drei ROT-Urteile bis 86 s → 178 s (alt 92), in der Ruhe bleibt 120 · der jüngste Riss verdoppelt (90 → 186), ein Riss vor dem Urteil zählt nie · riss noch bei 378 s: HÄNGT, zurück auf 90",
            dc[0].neu === 178 && dc[0].p90m === 86 && dc[1].neu === 120 && dc[2].neu === 186 && dc[2].unten === 90 && dc[2].ausRiss === true && !dc[0].ausRiss && dc[3].neu === 90 && !dc[3].unten && dc[4].neu === 90 && dc[4].haengt === true, JSON.stringify(dc));
        // DIE LEINE LERNT (grundDeckel): der gelernte Deckel der Karte hebt NUR den Grund an der Leine — Tafel (probeSek), Abdruck und die
        // andere Karte bleiben Byte für Byte; ohne gelernte Zahl der Deckel der Tafel
        {
            const stL = { ...S("l.K1", 1, { befehl: ["node", "l"], sek: 10 }, lies), geraet: ["radeon", "gtx"] }, ab0 = abdruck(stL, h, "radeon"), leer = deckelGelernt;
            deckelGelernt = { radeon: { "l.K1#1": 37 }, gtx: {}, headless: {} };
            const gl = [grundDeckel(stL, "radeon"), probeSek(stL, "radeon"), abdruck(stL, h, "radeon") === ab0, probeSek(stL, "gtx")];
            deckelGelernt = leer;
            pruef("LEINE LERNT: der gelernte Deckel (37 s) hebt den Grund an der Leine der Karte; Tafel 10 s und Abdruck bleiben, ohne gelernte Zahl der Deckel der Tafel",
                gl[0] === 37 && gl[1] === 10 && gl[2] === true && gl[3] === 10 && grundDeckel(stL, "radeon") === 10, JSON.stringify(gl));
        }
        // DIE WELLEN DER FAHRT (fahrtWellen, 13.11.: 24 Paare „die Fahrt riss (vor ankunft.K4#1)“, die feste Reihe begann jede Fahrt mit
        // denselben Proben): a hebt, Radeon ROT, GTX GRÜN → NAH; m mutierend, hebt, GTX GRÜN → NAH (nie nach 20 min Dauer); b hebt, zwei Risse
        // seit dem Urteil → HEBT und hängt (am Ende seiner Klasse, auch hinter seinem Ort wiese); c hebt, nie gefahren → HEBT ganz vorn; y `ende`
        // hebt, x `anfang` fährt in seiner Welle; d Rest, sein jüngster Eintrag nur „die Fahrt riss“ (kein Lauf) → vor e (echt gefahren)
        {
            const wo = (o) => [...ruf, "return 1", ...(o ? ["umstellen --ort " + o] : [])];
            const gw = [["a", {}], ["m", { mutiert: true }], ["b", {}, "wiese"], ["c", {}], ["x", { stellung: "anfang" }], ["y", { stellung: "ende" }], ["d", {}], ["e", {}]]
                .map(([n, x, o]) => [S(n + ".K1", 1, { befehl: wo(o), sek: 30, ...x }, warm)]);
            const zw = (i) => "2026-11-0" + i + "T00:00:00.000Z";
            const ein = (g, n, i, e) => ({ sha: "w" + n + i, geraet: g, zeit: zw(i), je: e.ungemessen ? {} : { [n + ".K1#1"]: { zeit: zw(i), ...e } }, ungemessen: e.ungemessen ? { [n + ".K1#1"]: { zeit: zw(i), ...e } } : {} });
            const msw = [ein("radeon", "a", 3, { gruen: false, zahl: "ROT" }), ein("gtx", "a", 2, { gruen: true, zahl: "GRÜN" }), ein("gtx", "m", 2, { gruen: true, zahl: "GRÜN" }),
                ein("radeon", "b", 1, { gruen: false, zahl: "ROT", s: 20, modus: "session" }), ein("radeon", "b", 2, { ungemessen: true, grund: "Deckel 90 s gerissen — beendet, UNGEMESSEN", s: 90, modus: "session" }),
                ein("radeon", "b", 3, { ungemessen: true, grund: "Deckel 90 s gerissen — beendet, UNGEMESSEN", s: 90, modus: "session" }),
                ein("radeon", "d", 1, { gruen: true, zahl: "GRÜN" }), ein("radeon", "d", 9, { ungemessen: true, grund: "die Fahrt riss 1800 s (vor b.K1#1) — offen, UNGEMESSEN" }),
                ein("radeon", "e", 5, { gruen: true, zahl: "GRÜN" }), ein("radeon", "y", 4, { gruen: false, zahl: "ROT" }), ein("radeon", "x", 4, { gruen: true, zahl: "GRÜN" })];
            const hw = new Set(["a.K1#1", "m.K1#1", "b.K1#1", "c.K1#1", "y.K1#1"]);
            const fw = fahrtWellen(gw, "radeon", msw, hw), ohne = fahrtWellen(gw, "radeon", msw, null);
            const zl = (w) => w.wellen.map((gs, i) => w.namen[i] + ":" + sitzungsReihe(gs, w.haengt).map((g) => g[0].kriterium[0]).join("")).join(" ");
            pruef("WELLEN DER FAHRT: nah (a, m) · hebt (x anfang mit seinem ende y, c nie gefahren vor b, b hängt nach 2 Rissen hinter seinem Ort) · rest (d nur Fahrt-Riss vor e); ohne Nutzen EINE Welle, das Älteste zuerst",
                zl(fw) === "nah:am hebt:xcby rest:de" && fw.haengt.has("b.K1#1") && fw.haengt.size === 1 && zl(ohne) === "rest:xcdaebym" && ohne.wellen.length === 1 &&
                    sitzungsReihe(gw.slice(2, 4)).map((g) => g[0].kriterium[0]).join("") === "bc", zl(fw) + " · ohne " + zl(ohne));
        }
        // DIE TAFEL (eichTafel, der Leser der Zahlen) aus den Mess-Dateien JE KARTE: a die Mutante (b) auf der Radeon, ihre 300 s der GTX zählen
        // nie; b ein Grün-Lauf → die Vorgabe; c nur an der Frist gefallen → die Vorgabe (zensiert trägt nie); d ohne Lauf; e trägt (die Ruhe);
        // f zu weit; g nie unter dem höchsten Grün; h in 2 Teilen höchstens ein halber Teil der Fahrt je Teil; Zwillinge EINE Zeile.
        // GERISSEN an der Datei von heute: a (am Grund 10 s, Bedarf 54 s) heilt, c bleibt unbekannt
        {
            const tq = (n, sek, extra = {}) => ({ ...S(n + ".K1", 1, { befehl: ["node", "q" + n], sek, ...extra }, lies), geraet: ["radeon", "gtx"] });
            const qs = [tq("a", 10), tq("b", 45), tq("c", 20), tq("d", 20), tq("e", 46), tq("f", 90), tq("g", 30), tq("h", 50, { teile: 2 })];
            const qw = { ...tq("a", 10), staffel: 2 };
            const laeufe = [["radeon", "a", 2, false], ["radeon", "a", 2, false], ["radeon", "a", 41, true], ["radeon", "a", 44, true], ["radeon", "a", 48, true],
                ["gtx", "a", 300, true], ["gtx", "a", 300, true], ["gtx", "a", 300, true], ["radeon", "b", 30, true], ["radeon", "c", 14.2, "Frist der Probe 14 s gerissen — kein Urteil, UNGEMESSEN"],
                ["radeon", "e", 20, true], ["radeon", "e", 20, true], ["radeon", "e", 20, true], ["radeon", "f", 6, true], ["radeon", "f", 6, true], ["radeon", "f", 6, true],
                ["radeon", "g", 80, true], ...Array.from({ length: 10 }, () => ["radeon", "g", 10, true]), ["radeon", "h", 1000, true], ["radeon", "h", 1000, true], ["radeon", "h", 1000, true]];
            const zq = (i) => "2026-11-01T00:" + String(Math.floor(i / 60)).padStart(2, "0") + ":" + String(i % 60).padStart(2, "0") + ".000Z";
            const msq = laeufe.map(([g, n, s, w], i) => ({ sha: "q" + i, geraet: g, zeit: zq(i),
                ...(typeof w === "string" ? { je: {}, ungemessen: { [n + ".K1#1"]: { gruen: false, ungemessen: true, zahl: w, grund: w, s, zeit: zq(i), modus: "session" } } }
                    : { je: { [n + ".K1#1"]: { gruen: w, zahl: "z", s, zeit: zq(i), modus: "session" } }, ungemessen: {} }) }));
            const heute = { sha: "qh", geraet: "radeon", zeit: zq(99), je: {}, ungemessen: { "a.K1#1": { gruen: false, ungemessen: true, grund: "Deckel 10 s gerissen — beendet, UNGEMESSEN", s: 10.4, zeit: zq(99), modus: "session" },
                "c.K1#1": msq[9].ungemessen["c.K1#1"] } };
            const tq1 = eichTafel([...qs, qw], [...msq, heute], "radeon");
            const tql = tq1.zeilen.map((z) => z.ids.join("+") + " " + z.sek + (z.neu != null ? "→" + z.neu : "") + " " + z.urteil).sort().join(" | ");
            const gv = gerissenVorNach(tq1, heute);
            pruef("DECKEL-TAFEL aus den Grün-Läufen je Karte: a 10 → 102 (die GTX zählt nie), b und c die Vorgabe 45, d ohne Zahl, e trägt, f 90 → 18, g → 86, h je Teil ≤ 870; Zwillinge EINE Zeile; Σ heute ↔ aus den Zahlen; GERISSEN heute 2 → a heilt, c unbekannt",
                tql === "a.K1#1+a.K1#2 10→102 Deckel zu knapp | b.K1#1 45→45 1 Grün-Läufe (unter 3) — die Vorgabe 45 s, nie unter dem Urteil 30 s | " +
                    "c.K1#1 20→45 0 Grün-Läufe (unter 3) — die Vorgabe 45 s | d.K1#1 20 ohne Zahl | e.K1#1 46→46 trägt | f.K1#1 90→18 Deckel zu weit | " +
                    "g.K1#1 30→86 Deckel zu knapp | h.K1#1 50→870 Deckel zu knapp" && tq1.heute === 10 + 45 + 20 + 20 + 46 + 90 + 30 + 100 &&
                    tq1.ausZahlen === 102 + 45 + 45 + 20 + 46 + 18 + 86 + 1740 && tq1.geeicht === 5 && tq1.teile === 2 &&
                    laufSekunden(msq, "radeon", "a.K1#1").length === 5 && laufSekunden(msq, "gtx", "a.K1#1").map((x) => x.s).join() === "300,300,300" &&
                    gv.vorher.join() === "a.K1#1,c.K1#1" && gv.vorherSicher.join() === "a.K1#1" && gv.sicher.length === 0 && gv.unbekannt.join() === "c.K1#1" && gv.nachher.join() === "c.K1#1",
                tql + " · Σ " + tq1.heute + " → " + tq1.ausZahlen + " · " + JSON.stringify(gv));
        }
        // der Ort eines Vegetations-Laufs (w4-sitzung-reif): der erste Stand seines Plans — die Sitzung stellt ihn vor dem Deckel
        const plan = (...p) => ({ probe: { befehl: ["node", "-e", "(async function vegetationLauf() {})()", "{AUS}", "{PORT}", JSON.stringify(p)] } });
        const vo = [plan(["wiese", "third", 0.5, null, "wiese"]), plan(["genesis", "ego", 0.5, null, "wiese"], ["wiese", "ego", 0.3, null, "wiese"]), plan()].map(probeOrt);
        pruef("SITZUNG DER ORT eines Vegetations-Laufs: der erste Stand seines Plans (wiese, genesis), ohne Plan keiner",
            vo.join(",") === "wiese,genesis," && vo[2] === null, JSON.stringify(vo));
        // der Messort aus der Quelle der Orte (w12-proben-frist): `messort("X")` · `ladeSpec("X")` nennen den Ort; ein `umstellen` gewinnt
        const lib = (code) => ({ probe: { befehl: ["node", "-e", code, "{AUS}"] } });
        const vl = [lib('const M = require("scripts/lib/welt-orte.cjs").messort("wiese"); go(M.x, M.z);'),
            lib('const mo = require("scripts/lib/band-urteil.cjs").ladeSpec("dorf").ort.spieler;'),
            lib('await tor.ruf("/umstellen", { ort: "genesis" }); const M = messort("wiese");'), lib("const M = { x: 1, z: 2 };")].map(probeOrt);
        pruef("SITZUNG DER ORT aus der Quelle der Orte: messort(\"wiese\") → wiese, ladeSpec(\"dorf\") → dorf, ein umstellen davor gewinnt, Koordinaten keiner",
            vl.join(",") === "wiese,dorf,genesis," && vl[3] === null, JSON.stringify(vl));
        // DIE GRUNDSTELLUNG, DIE NICHT TRÄGT: weicht nach dem Rückspielen eine Größe vom Grund ab, geht sie durch die Tür; weicht sie auch
        // danach ab, sind die übrigen Proben UNGEMESSEN beim Namen der Größe (nie ROT)
        const r7 = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "anders", null);
        pruef("SITZUNG eine Grundstellung, nach der eine Größe vom Grund abweicht, auch durch die Tür: die übrigen Proben UNGEMESSEN beim Namen der Größe",
            r7.es["m.K1#1"].gruen && r7.es["b.K1#1"].ungemessen === true && /abweichend vom Grund: augenblick\.brand/.test(r7.es["b.K1#1"].grund) && r7.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,stop",
            JSON.stringify([r7.z, r7.es]));
        // DAS RÜCKSPIELEN, DAS AN ORT UND STELLE NICHT TRÄGT (Radeon 6a571e3b Lauf 2: „tools materials“ nach tore.K3, 9 Proben ungemessen):
        // die Abweichung geht durch die Tür, die nächste Probe misst in der heilen Welt, der Kopf nennt die Größe (anOrt)
        const r7b = await lauf([[S("m.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30, mutiert: true }, warm)]], "anders-ort", null);
        pruef("SITZUNG DAS RÜCKSPIELEN, DAS AN ORT UND STELLE NICHT TRÄGT: durch die Tür, die nächste Probe misst GRÜN, der Kopf nennt die Größe (anOrt augenblick.brand)",
            r7b.es["m.K1#1"].gruen && r7b.es["b.K1#1"].gruen === true && !r7b.es["b.K1#1"].ungemessen && r7b.z.join(",") === "start,nimm,warm,grund,tuer,reload,grund,warm,stop" &&
            JSON.stringify((r7b.kopf.anOrt || []).map((x) => x.vor + ":" + x.anders.join(" "))) === JSON.stringify(["b.K1#1:augenblick.brand"]),
            JSON.stringify([r7b.z, r7b.es, r7b.kopf.anOrt]));
        // DIE ZEICHENKETTE DER SEITE (w4-grund-zeichner; champion bild-klasse 31.10.: der alte `wasserStrom` ließ `renderer.render` stumm und
        // `postProcessingFailed` an — gelaende.K2#1 blieb ungenannt, tiere.K3#2 fiel als Rückfall „tier-Pixel 0/0/0/0“): eine Probe bricht die
        // Kette wie er, ohne `mutiert` (ihr folgte keine Grundstellung) und mit (wie gelaende.K2#1: die Grundstellung danach spielte nur den
        // Stand) — die nächste Probe zeichnet ein Bild über den Weg der Welt (`_loopRender`); eine Probe verliert das Gerät (an Ort und Stelle
        // heilt es nie: die Tür); eine Probe leiht `render` und gibt es per Zuweisung zurück (wie draw-zaehler), der Haken des Stroms hängt
        const BRICH = 'seite: const s = r.state; s.renderer.render = function () {}; if (typeof s.renderer.renderAsync === "function") s.renderer.renderAsync = () => Promise.resolve(); s.postProcessingFailed = true; return "warm";';
        const BILD = "seite: const z = r.state.renderer.ziel; r._loopRender(); return { gezeichnet: r.state.renderer.ziel > z };";
        const GERAET = 'seite: r.state._deviceLost = true; return "warm";';
        const ZAEHLT = 'seite: const R = r.state.renderer, roh = R.render; R.render = function (...a) { return roh.apply(this, a); }; r._loopRender(); R.render = roh; return "warm";';
        const bildDa = (j) => ({ gruen: !!j && !!j.welt && j.welt.gezeichnet === true, zahl: "gezeichnet " + (j && j.welt && j.welt.gezeichnet) });
        const r17 = await lauf([[S("z.K1", 1, { befehl: [...ruf, ZAEHLT], sek: 30 }, warm)], [S("g.K2", 1, { befehl: [...ruf, BRICH], sek: 30 }, warm)],
            [S("t.K1", 2, { befehl: [...ruf, BILD], sek: 30 }, bildDa)], [S("g.K3", 1, { befehl: [...ruf, BRICH], sek: 30, mutiert: true }, warm)],
            [S("t.K3", 2, { befehl: [...ruf, BILD], sek: 30, mutiert: true }, bildDa)], [S("v.K1", 1, { befehl: [...ruf, GERAET], sek: 30, mutiert: true }, warm)],
            [S("t.K4", 2, { befehl: [...ruf, BILD], sek: 30, mutiert: true }, bildDa)]], "zeichner", null);
        const zx = r17.es;
        pruef("SITZUNG DIE ZEICHENKETTE: eine Probe überschreibt renderer.render und setzt postProcessingFailed — die Sitzung nennt SIE beim Namen (kein Urteil: Werkzeug-Bruch mit der Größe, nie GRÜN, nie ROT des Kriteriums), die Grundstellung stellt die Kette zurück, die nächste Probe zeichnet — ohne und mit mutiert",
            ["g.K2#1", "g.K3#1"].every((id) => !!zx[id] && zx[id].ungemessen === true && zx[id].gruen === false &&
                /^Werkzeug-Bruch: die Probe ließ die Zeichenkette verändert \(zeichner\.renderer\.render eigen: function \(\) \{\} · zeichner\.renderer\.renderAsync eigen: .* · zeichner\.postProcessingFailed false → true\) — kein Urteil, UNGEMESSEN/.test(zx[id].grund)) &&
            ["t.K1#2", "t.K3#2"].every((id) => !!zx[id] && zx[id].gruen === true) && (r17.kopf.zeichner || []).map((x) => x.probe).join(",") === "g.K2#1,g.K3#1,v.K1#1",
            JSON.stringify([r17.z, zx, r17.kopf.zeichner]));
        pruef("SITZUNG DIE ZEICHENKETTE durch die Tür: verliert eine Probe das Gerät, heilt die Grundstellung es an Ort und Stelle nie — die Seite neu, die nächste Probe zeichnet; eine Leihe, die per Zuweisung zurückgab, und der Haken des Stroms sind nie ein Bruch",
            !!zx["v.K1#1"] && zx["v.K1#1"].ungemessen === true && /zeichner\.geraet false → true/.test(zx["v.K1#1"].grund) && !!zx["t.K4#2"] && zx["t.K4#2"].gruen === true &&
            !!zx["z.K1#1"] && zx["z.K1#1"].gruen === true && !zx["z.K1#1"].ungemessen &&
            r17.z.join(",") === "start,nimm,warm,grund,warm,grund,warm,grund,warm,grund,tuer,reload,grund,warm,stop", JSON.stringify([r17.z, zx]));
        // DAS GEDÄCHTNIS DER SEITE (zeichnerKette ohne Sitzung): der Null-Renderer trägt seine Methoden selbst (kein Prototyp, `_makeHeadlessRenderer`)
        // — ein Tausch unter gleichem Namen weicht ab und kehrt zurück, ebenso Faden und Sync-Stelle; der Haken des Stroms, nach dem Gedächtnis
        // gesetzt, bleibt und weicht nie ab; eine Post-Kette, die erst mit dem ersten Bild entsteht, ist keine Abweichung
        {
            const kette = (win) => new Function("window", "return " + zeichnerKette.toString())(win);
            const win = {}, Z = kette(win), echt = () => "echt", schleife = () => {}, faden = { faden: 1 };
            const welt = { state: { renderer: { render: echt, setAnimationLoop: schleife, domElement: { isConnected: true } }, postProcessing: null,
                postProcessingFailed: true, voxelWorker: faden, _deviceLost: false } };
            const soll = Z(welt, null).abdruck;
            const haken = function () {};
            haken.__punkteHaken = true;
            welt.state.renderer.setAnimationLoop = haken;
            welt.state.postProcessing = { render() {} };
            const still = Z(welt, soll);
            welt.state.renderer.render = function () {};
            welt.state.voxelWorker = null;
            welt._syncStelle = "naht";
            const bruch = Z(welt, soll), heil = Z(welt, soll, true), danach = Z(welt, soll);
            pruef("ZEICHENKETTE DAS GEDÄCHTNIS DER SEITE: der Tausch einer eigenen Methode (Null-Renderer) weicht ab und kehrt zurück, Faden und Sync-Stelle ebenso; der Haken des Stroms und eine spät gebaute Post-Kette sind nie eine Abweichung",
                still.anders.length === 0 && bruch.anders.join(" ") === "zeichner.renderer.render zeichner.syncStelle zeichner.faden" &&
                bruch.wie["zeichner.renderer.render"] === "getauscht: function () {}" && heil.bleibt.length === 0 && danach.anders.length === 0 &&
                welt.state.renderer.render === echt && welt.state.renderer.setAnimationLoop === haken && welt.state.voxelWorker === faden && welt._syncStelle === null,
                JSON.stringify([still, bruch, heil, danach]));
        }
        // DIE LEIHE DER HÄNGER-LINSE (haengerLeihe; Radeon 6a571e3b 02.11.: profiband.K4#1 „zeichner.renderer._renderObjectDirect getauscht:
        // … const vor = H.c“ — kein Urteil): das Instrument der Werkbank hängt sich beim ersten `/haenger` in Renderer, Knoten-Bau und die
        // Prototypen des Geräts. Ohne die Leihe nennt die Zeichenkette den Auftraggeber (vorher ROT); mit ihr kehrt jedes Glied zurück, das
        // Gedächtnis fällt (die nächste Probe hängt es frisch an), ein Haken, den die Leihe nicht kennt, bleibt beim Namen; stand das Instrument
        // schon vor der Probe in der Seite, leiht sie nichts
        {
            const vorbau = (win) => {
                const nativ = function createRenderPipeline() {}, puffer = function createBuffer() {}, vram = function writeBuffer() {};
                win.GPUDevice = function () {};
                Object.assign(win.GPUDevice.prototype, { createRenderPipeline: nativ, createBuffer: puffer });
                win.GPUQueue = function () {};
                win.GPUQueue.prototype.writeBuffer = vram;
                const diaet = function _renderObjectDirect() {}, bau = { getForRender() {} };
                const welt = { state: { renderer: { _renderObjectDirect: diaet, _nodes: Object.create(bau), render() {}, domElement: { isConnected: true } },
                    postProcessing: null, postProcessingFailed: false, voxelWorker: {}, _deviceLost: false } };
                return { welt, nativ, puffer, vram, diaet };
            };
            const haengerAn = (win, welt, auchPuffer) => {
                win.__haengerH = { an: false };
                const R = welt.state.renderer, rod = R._renderObjectDirect, N = R._nodes, gfr = N.getForRender, P = win.GPUDevice.prototype;
                R._renderObjectDirect = function () { const vor = win.__haengerH.cur; return rod.apply(this, arguments) || vor; };
                N.getForRender = function () { return gfr.apply(this, arguments); };
                const crp = P.createRenderPipeline;
                P.createRenderPipeline = function (d) { return crp.call(this, d); };
                const wb = win.GPUQueue.prototype.writeBuffer;
                win.GPUQueue.prototype.writeBuffer = function () { return wb.apply(this, arguments); };
                if (auchPuffer) {
                    const cb = P.createBuffer;
                    P.createBuffer = function () { return cb.apply(this, arguments); };
                }
            };
            const mit = (win) => [new Function("window", "return " + haengerLeihe.toString())(win), new Function("window", "return " + zeichnerKette.toString())(win)];
            // vorher: ohne die Leihe nennt die Zeichenkette den Auftraggeber
            const w0 = {}, v0 = vorbau(w0), [, Z0] = mit(w0), soll0 = Z0(v0.welt, null).abdruck;
            haengerAn(w0, v0.welt);
            const ohne = Z0(v0.welt, soll0);
            // nachher: die Leihe gibt jedes Glied zurück, die Kette steht, das Gedächtnis fällt
            const w1 = {}, v1 = vorbau(w1), [L1, Z1] = mit(w1), soll1 = Z1(v1.welt, null).abdruck;
            const nimm = L1(v1.welt, false);
            haengerAn(w1, v1.welt);
            const gib = L1(v1.welt, true), still = Z1(v1.welt, soll1);
            const R1 = v1.welt.state.renderer, P1 = w1.GPUDevice.prototype;
            // die Mutante: das Instrument hängt sich an ein Glied, das die Leihe nicht kennt — es bleibt beim Namen
            const w2 = {}, v2 = vorbau(w2), [L2] = mit(w2);
            L2(v2.welt, false);
            haengerAn(w2, v2.welt, true);
            const gib2 = L2(v2.welt, true);
            // das Instrument stand schon: nichts geliehen, nichts zurück
            const w3 = { __haengerH: {} }, v3 = vorbau(w3), [L3] = mit(w3);
            const da = L3(v3.welt, false), ohne3 = L3(v3.welt, true);
            pruef("SITZUNG DIE LEIHE DER HÄNGER-LINSE: ohne sie nennt die Zeichenkette den Auftraggeber (vorher ROT); mit ihr kehren Auftraggeber, Knoten-Bau und die Prototypen des Geräts zurück, die Kette steht, das Gedächtnis fällt; ein Glied, das die Leihe nicht kennt, bleibt beim Namen; stand das Instrument schon, leiht sie nichts",
                ohne.anders.join(" ") === "zeichner.renderer._renderObjectDirect" && nimm.leiht === 10 &&
                JSON.stringify(gib) === JSON.stringify({ zurueck: ["renderer._renderObjectDirect", "renderer._nodes.getForRender", "GPUDevice.createRenderPipeline", "GPUQueue.writeBuffer"], bleibt: [] }) &&
                still.anders.length === 0 && R1._renderObjectDirect === v1.diaet && !Object.prototype.hasOwnProperty.call(R1._nodes, "getForRender") &&
                P1.createRenderPipeline === v1.nativ && w1.GPUQueue.prototype.writeBuffer === v1.vram && !("__haengerH" in w1) && !("__punkteHaengerLeihe" in w1) &&
                JSON.stringify(gib2.bleibt) === JSON.stringify(["GPUDevice.createBuffer"]) && da.da === true && ohne3.ohne === true,
                JSON.stringify([ohne, nimm, gib, still, gib2, da, ohne3]));
        }
        // ... und in der Sitzung: eine Probe hängt das Instrument an (wie `/haenger`), zweimal hintereinander — keine nennt die Zeichenkette,
        // je Probe kehrt es zurück (im Kopf `haenger`), ohne Grundstellung; die Mutante mit einem unbekannten Glied ist ein Werkzeug-Bruch beim Namen
        {
            const HAENGER = (puffer) => "seite: const R = r.state.renderer, rod = R._renderObjectDirect, P = window.GPUDevice.prototype, crp = P.createRenderPipeline; " +
                "window.__haengerH = { an: false }; R._renderObjectDirect = function () { const vor = window.__haengerH.cur; return rod.apply(this, arguments) || vor; }; " +
                "P.createRenderPipeline = function (d) { return crp.call(this, d); }; " +
                (puffer ? "const cb = P.createBuffer; P.createBuffer = function () { return cb.apply(this, arguments); }; " : "") + "return \"warm\";";
            const r18 = await lauf([[S("h.K1", 1, { befehl: [...ruf, HAENGER(false)], sek: 30 }, warm)], [S("h.K2", 1, { befehl: [...ruf, HAENGER(false)], sek: 30 }, warm)],
                [S("h.K3", 1, { befehl: [...ruf, HAENGER(true)], sek: 30 }, warm)]], "gut", null);
            const hx = r18.es;
            pruef("SITZUNG DIE LEIHE DER HÄNGER-LINSE in der Sitzung: zwei Proben, die das Instrument anhängen, urteilen GRÜN ohne Werkzeug-Bruch und ohne Grundstellung, je Probe kehren 2 Glieder zurück; die Mutante mit einem unbekannten Glied am Gerät ist ein Werkzeug-Bruch beim Namen (haenger.GPUDevice.createBuffer)",
                hx["h.K1#1"].gruen === true && hx["h.K2#1"].gruen === true && !hx["h.K1#1"].ungemessen && !hx["h.K2#1"].ungemessen &&
                JSON.stringify((r18.kopf.haenger || []).map((x) => x.probe + ":" + x.zurueck)) === JSON.stringify(["h.K1#1:2", "h.K2#1:2", "h.K3#1:2"]) &&
                hx["h.K3#1"].ungemessen === true && /^Werkzeug-Bruch: die Probe ließ die Zeichenkette verändert \(haenger\.GPUDevice\.createBuffer nicht zurück/.test(hx["h.K3#1"].grund) &&
                (r18.kopf.zeichner || []).map((x) => x.probe).join(",") === "h.K3#1" && r18.z.join(",") === "start,nimm,warm,stop", JSON.stringify([r18.z, hx, r18.kopf.haenger, r18.kopf.zeichner]));
        }
        // DIE FLÄCHE EINER GEFALLENEN MARKE IST KEINE (Radeon 6a571e3b 02.11.: nach der Tür „wege −1 [-119.1,-274.9,279.2,201/272]“, der Belag des
        // Genesis-Orts, die Sitzung endete nach 3 von 72 Proben): fiel die Marke „genesis“ mit der Seite, ist ihre fehlende Fläche keine
        // Abweichung; steht die Marke und die Fläche fehlt, ging der Weg verloren (ROT wie bisher); legte das Gesetz den Weg des Grunds an
        // einem Ort wieder, ließ die Probe dort nichts liegen (bauAbweichung mit dem Grund) — ohne den Grund wäre sie beim Namen gerufen
        {
            const plan = { x0: -119.1, z0: -274.9, x1: 279.2, z1: 201, formen: Array(272).fill({}) };
            const welt = (fl, keys) => ({ state: { wegeKarte: { siedlungen: fl }, architectures: [] }, _stlWegeKeys: new Set(keys) });
            const grund = wegeAbdruck(welt([plan], ["genesis"])), tuer = wegeAbdruck(welt([], [])), verloren = wegeAbdruck(welt([], ["genesis"]));
            const bauLeer = { werke: [], edits: 0, orte: [], wege: tuer }, bauGelegt = { werke: [], edits: 0, orte: [], wege: grund };
            pruef("SITZUNG DIE FLÄCHE EINER GEFALLENEN MARKE IST KEINE: nach der Tür fehlt der Belag des Genesis-Orts ohne Abweichung; steht seine Marke ohne Fläche, ist der Weg verloren (−1); legt das Gesetz ihn an seinem Ort wieder, nennt bauAbweichung die Probe nur ohne den Grund",
                wegeAbweichung(grund, tuer) === null && wegeAbweichung(grund, verloren) === "wege −1 [-119.1,-274.9,279.2,201/272]" &&
                bauAbweichung(bauLeer, bauGelegt, grund) === null && /^wege \+1 \[-119\.1,-274\.9,279\.2,201\/272\] \(genesis\)$/.test(String(bauAbweichung(bauLeer, bauGelegt))),
                JSON.stringify([wegeAbweichung(grund, tuer), wegeAbweichung(grund, verloren), bauAbweichung(bauLeer, bauGelegt, grund), bauAbweichung(bauLeer, bauGelegt)]));
        }
        // GRUND_ZUSTAND (Radeon 6a571e3b 02.11.: die Herde am Hang ließ `maxCreatures` bei ihren 5 Gliedern, die Grundstellung brachte 5 von
        // 9 Wesen zurück, die Welt trug nicht mehr): der Grund trägt die Kappe, das Rückspielen setzt sie VOR dem Stand zurück und nennt sie;
        // ohne ihr Wort im Grund (die Mutante: ein Grund von vor GRUND_ZUSTAND) kehren die Wesen unter der Kappe der Probe wieder — 5 von 9
        {
            const welt = (max) => {
                const st = { maxCreatures: max, creatures: [], worldMeta: { worldId: "w1" } };
                return { state: st, _grundstellung() {
                    st.creatures = Array.from({ length: Math.min(9, st.maxCreatures) }, (_, i) => i);
                    return { ok: true, anders: st.creatures.length === 9 ? [] : ["creatures"], neu: { wesen: st.creatures.length } };
                }, buildStateSnapshot: () => ({ creatures: st.creatures }) };
            };
            const spiel = (g, w) => new Function("r", "window", "performance", grundSpielen(g))(w, {}, { now: () => 0 });
            const g = { grund: JSON.stringify({ stand: { creatures: Array(9).fill(0) } }), seite: [], wege: null, zustand: { maxCreatures: 20 } };
            const w1 = welt(5), heil = spiel(g, w1);
            const w2 = welt(5), alt = spiel({ ...g, zustand: undefined }, w2);
            const w3 = welt(20), still = spiel(g, w3);
            pruef("SITZUNG GRUND_ZUSTAND: die Kappe der Wesen kehrt vor dem Stand zurück (9 von 9 Wesen, genannt: maxCreatures); ohne ihr Wort im Grund kehren 5 von 9 wieder (vorher ROT: creatures); stand sie, nennt die Grundstellung nichts",
                heil.ok && heil.anders.length === 0 && heil.zustand.join() === "maxCreatures" && w1.state.maxCreatures === 20 && w1.state.creatures.length === 9 &&
                alt.anders.join() === "creatures" && w2.state.creatures.length === 5 && still.anders.length === 0 && still.zustand.length === 0,
                JSON.stringify([heil, alt, still]));
        }
        // DAS SCHLOSS ZWISCHEN DEN PROBEN: wartet ein CI-Job (die letzte Zeile von hook.log), geht das Schloss an der Proben-Grenze an ihn und kommt
        // danach wieder — die Welt startet nie neu, das Warten zählt nie in die Fahrt
        if (gl) {
            fs.writeFileSync(glLog, "");
            fs.appendFileSync(hookLog, "2026-10-29 10:00:05 start ci-probe 1/1 echt: wartet auf Schloss von 'punkte-radeon-sitzung'\n");
            const r8 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut", gl);
            fs.writeFileSync(hookLog, "2026-10-29 10:00:00 ende ci-probe 1/1 echt\n");
            const sl = fs.readFileSync(glLog, "utf8").trim().split("\n");
            pruef("SITZUNG DAS SCHLOSS ZWISCHEN DEN PROBEN: ein wartender CI-Job bekommt es an jeder Proben-Grenze, die Sitzung nimmt es neu, die Welt bleibt (ein Start)",
                sl.length === 3 && r8.kopf.freigaben.length === 2 && r8.z.filter((l) => l === "start").length === 1 && r8.es["a.K1#1"].gruen && r8.es["b.K1#1"].gruen,
                JSON.stringify([sl, r8.kopf.freigaben, r8.z]));
            // DER LANGSAME BLICK (Heilung 30.10., Radeon 3ed96b3f: 69 von 69 Proben ungemessen, „read ECONNRESET“ am ersten /fenster):
            // ci_wartet braucht hier 7 s (der Laptop 5,2 s, mit Waisen daneben 20 s) — als spawnSync stand der Läufer so lange, die Werkbank
            // schloss den ruhenden Socket (keepAliveTimeout 5 s), der nächste Ruf nahm ihn: die Welt galt als tot. Der Blick läuft neben
            // der Probe, jeder Ruf hat seine Verbindung: die Welt trägt über jede Grenze, beide Proben messen, keine Freigabe
            const langsam = path.join(tmp, "langsam");
            fs.mkdirSync(langsam, { recursive: true });
            fs.copyFileSync(gl, path.join(langsam, "sitzung-schloss.sh"));
            fs.writeFileSync(path.join(langsam, "gpu-schloss.sh"), "ci_wartet() { sleep 7; return 1; }\n");
            const r9 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "gut",
                path.join(langsam, "sitzung-schloss.sh"));
            pruef("SITZUNG DER LANGSAME BLICK: ci_wartet 7 s hält den Läufer nie an — die Welt trägt über jede Proben-Grenze, beide Proben messen, keine Freigabe",
                !!r9.es["a.K1#1"] && r9.es["a.K1#1"].gruen && !!r9.es["b.K1#1"] && r9.es["b.K1#1"].gruen && !r9.kopf.grund && r9.kopf.freigaben.length === 0 && r9.kopf.ciBlicke >= 1,
                JSON.stringify([r9.es, r9.kopf.grund, r9.kopf.freigaben, r9.kopf.ciBlicke]));
        }
        // DIE WACHE DER FAHRT: reißt die Uhr der Fahrt (hier 8 s), fällt die laufende Probe am Rest (UNGEMESSEN beim Namen), jede folgende
        // ist offen, die Sitzung endet und nennt sie; die Fahrt davor misst wie immer
        const r6 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 30 }, lies)],
            [S("c.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm), S("c.K1", 2, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "fahrt", null, 8);
        pruef("SITZUNG DIE WACHE DER FAHRT: die Probe am Rest der Fahrt UNGEMESSEN (Deckel der Fahrt), die folgenden offen beim Namen, die Sitzung endet und nennt sie",
            r6.es["a.K1#1"].gruen && r6.es["b.K1#1"].ungemessen === true && /^Deckel der Fahrt 8 s gerissen nach \d+ s der Probe — beendet, UNGEMESSEN$/.test(r6.es["b.K1#1"].grund) &&
            ["c.K1#1", "c.K1#2"].every((id) => r6.es[id].ungemessen === true && /^die Fahrt riss 8 s \(in b\.K1#1\) — offen, UNGEMESSEN$/.test(r6.es[id].grund)) &&
            JSON.stringify(r6.kopf.offen) === JSON.stringify(["b.K1#1", "c.K1#1", "c.K1#2"]) && /^die Fahrt riss 8 s in b\.K1#1 — offen: b\.K1#1, c\.K1#1, c\.K1#2$/.test(r6.kopf.grund) &&
            r6.kopf.fahrtS < 14 && r6.z.filter((l) => l === "start").length === 1 && r6.z[r6.z.length - 1] === "stop", JSON.stringify([r6.es, r6.kopf, r6.z]));
        // DIE FORTSETZUNG DER FAHRT (04.11., deckel-wurzel; Radeon 2674ff9a: 23 Proben „die Fahrt riss — offen“): reißt die Fahrt (hier 12 s),
        // misst eine NEUE Sitzung die offenen Läufe (c braucht 5 s, d) — keine bleibt still offen; die Probe, die wirklich hängt (b, Deckel
        // 7 s), reißt ihren Deckel, ist nie offen und fährt nie nach: UNGEMESSEN beim Grund, auch nach der Fortsetzung
        {
            const fuenf = ["node", "-e", 'setTimeout(() => require("fs").writeFileSync(process.argv[1], JSON.stringify({ n: 0 })), 5000)', "{AUS}"];
            const gf = [[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)], [S("b.K1", 1, { befehl: ["node", "-e", "setTimeout(() => {}, 60000)"], sek: 7 }, lies)],
                [S("c.K1", 1, { befehl: fuenf, sek: 30 }, lies)], [S("d.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]];
            const k1 = await lauf(gf, "fahrt", null, 12);
            const esf = { ...k1.es }, gefahren = [];
            const koepfe = await fahreFortsetzung(gf, k1.kopf, async (gs) => {
                gefahren.push(gs.map((g) => schluessel(g[0])).join(","));
                const k = await lauf(gs, "fahrt", null, 12);
                Object.assign(esf, k.es);
                return k.kopf;
            });
            pruef("SITZUNG DIE FORTSETZUNG DER FAHRT: riss die Fahrt, misst eine neue Sitzung die offenen (c, d GRÜN); der Hänger b reißt seinen Deckel, ist nie offen, fährt nie nach — UNGEMESSEN beim Grund",
                esf["a.K1#1"].gruen && esf["b.K1#1"].ungemessen === true && /^Deckel 7 s gerissen — beendet, UNGEMESSEN/.test(esf["b.K1#1"].grund) &&
                (k1.kopf.offen || []).includes("c.K1#1") && !(k1.kopf.offen || []).includes("b.K1#1") && gefahren.length === 1 && !/b\.K1/.test(gefahren[0]) &&
                koepfe.length === 1 && !koepfe[0].offen && esf["c.K1#1"].gruen === true && !esf["c.K1#1"].ungemessen && esf["d.K1#1"].gruen === true,
                JSON.stringify([k1.kopf.offen, gefahren, esf, koepfe.map((k) => [k.offen, k.fahrtS])]));
        }
        const r3 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "kaputt", null);
        pruef("SITZUNG eine Welt, die nie steht, ist ROT beim Grund (die Station misst, ob das Spiel bootet)",
            r3.es["a.K1#1"].gruen === false && !r3.es["a.K1#1"].ungemessen && /startet nicht: die Werkbank startet nicht/.test(r3.es["a.K1#1"].grund), JSON.stringify(r3));
        if (findeBash()) {
            const bl = path.join(tmp, "sitzung-blockiert.sh");
            fs.writeFileSync(bl, "#!/bin/bash\necho 'SCHLOSS BLOCKIERT von ci-echt nach 2701 s Warten'\nexit 75\n");
            const r4 = await lauf([[S("a.K1", 1, { befehl: [...ruf, "return 1"], sek: 30 }, warm)]], "kein-start", bl);
            pruef("SITZUNG ein blockiertes Schloss ist UNGEMESSEN beim Namen, die Welt startet nie", r4.es["a.K1#1"].ungemessen === true && /blockiert.*ci-echt/.test(r4.es["a.K1#1"].grund) && !r4.z.length, JSON.stringify(r4));
        }
    }
    // (10) DER HAKEN DES STROMS in einer gestellten Seite (stromSeite, wie die Werkbank ihn per /eval zieht): nur gerenderte Bilder
    // (die Leine gespannt: kein Bild), die Bild-Zeit nur innerhalb EINER Schleife, die Zelle ab dem Zapfen, der sie setzt, ein Wurf des
    // Hakens gezählt und nie in das Spiel geworfen, eine Schleife von vor dem Haken fährt durch ihn, der Zapfen leert; der Leser
    // nennt Zelle, Wetter, Wanduhr, Marke und den Überlauf des Stempel-Pools
    {
        const welt = () => {
            const uhrMs = { t: 0 };
            const R = { info: { render: { drawCalls: 50, triangles: 1e5 } }, _animation: { _animationLoop: null }, setAnimationLoop(cb) { this._animation._animationLoop = cb || null; } };
            const r = { state: { renderer: R, playerMesh: { position: { x: 3, z: 4 } }, cameraMode: "first", player: { mountedArch: null }, perfTargetMs: 1000,
                perfSense: { loadScale: 1 }, weather: "sunny", creatures: [], timeOfDay: 0.5 }, _gpuLeine: { gerendert: 0 }, _gpuTsAtMs: 1, _gpuTsLast: 9.5,
                _szeneSkalaWirk: () => 0.75 };
            const win = { __vram: { puffer: 50 * 1048576, texturen: 60 * 1048576 }, __stempelWache: () => ({ ueberlauf: uhrMs.ueberlauf || 0 }) };
            const perf = { now: () => uhrMs.t, timeOrigin: 1e12, memory: { usedJSHeapSize: 200 * 1048576 } };
            const zapf = (a) => new Function("r", "window", "performance", stromCode(a))(r, win, perf);
            const bild = (t, leine = false) => {
                uhrMs.t = t;
                const cb = R._animation._animationLoop;
                if (cb) cb(t);
            };
            return { r, R, win, uhrMs, zapf, bild, spiel: (leine) => () => { if (!leine.an) r._gpuLeine.gerendert++; } };
        };
        const W1 = welt(), leine = { an: false };
        const e0 = W1.zapf({});
        W1.R.setAnimationLoop(W1.spiel(leine));
        W1.bild(0);
        W1.bild(16.7);
        leine.an = true;
        W1.bild(25);
        leine.an = false;
        W1.bild(33.4);
        const e1 = W1.zapf({ zelle: "wiese-ego-steht" });
        W1.bild(50.1);
        W1.R.setAnimationLoop(null);
        W1.R.setAnimationLoop(W1.spiel(leine));
        W1.bild(1000);
        W1.r._gpuTsAtMs = 2;
        W1.bild(1016.7);
        const e2 = W1.zapf({ zelle: null });
        Object.defineProperty(W1.r.state, "playerMesh", { get() { throw new Error("kaputt"); }, configurable: true });
        let warf = false;
        try {
            W1.bild(1033.4);
        } catch (_e) {
            warf = true;
        }
        const e3 = W1.zapf({});
        const W2 = welt();
        W2.R.setAnimationLoop(W2.spiel({ an: false }));
        W2.zapf({});
        W2.bild(5);
        W2.bild(21.7);
        const e4 = W2.zapf({});
        const dt = (e) => e.zeilen.map((z) => z[1]).join(",");
        pruef("STROM-HAKEN nur gerenderte Bilder, die Bild-Zeit je Schleife (neue Schleife: −1), die Zelle ab ihrem Zapfen, VRAM · Befehle · Dreiecke · Sicht · Regler je Bild",
            e0.bereit && e0.neu && e0.zeilen.length === 0 && dt(e1) === "-1,16.7,16.7" && e1.zeilen.every((z) => z[15] === -1 && z[3] === 110 && z[5] === 50 && z[9] === 1 && z[11] === 1) &&
            dt(e2) === "16.7,-1,16.7" && e2.zeilen.every((z) => e2.namen.zelle[z[15]] === "wiese-ego-steht") && e2.zeilen[0][4] === -1 && e2.zeilen[2][4] === 9.5 && !e2.neu,
            JSON.stringify([e1.zeilen, e2.zeilen]));
        pruef("STROM-HAKEN ein Wurf des Hakens stört das Spiel nie (gezählt im Strom), eine Schleife von vor dem Haken fährt durch ihn",
            !warf && e3.fehler === 1 && /kaputt/.test(e3.letzterFehler) && e3.zeilen.length === 0 && W1.r._gpuLeine.gerendert === 7 && dt(e4) === "-1,16.7", JSON.stringify([warf, e3, e4.zeilen]));
        const sd = path.join(tmp, "strom-lesen.ndjson");
        const zeile = (probe, e, stempel) => fs.appendFileSync(sd, JSON.stringify({ probe, zeit: "z", ...e, stempel }) + "\n");
        zeile("a.K1#1", e1, 0);
        stromMarke(sd, "a.K1#1", "dauer-anfang", { heapMB: 1 });
        zeile("b.K1#1", e2, 2);
        const L = stromLesen(sd);
        pruef("STROM-LESER je Bild Probe, Seite, Wanduhr, Zelle und Wetter beim Namen, die Marke an ihrer Stelle unter den Bildern, ein Block nach Pool-Überlauf ohne GPU-Gültigkeit",
            L.bilder.length === 6 && L.bloecke === 2 && L.seiten.length === 1 && L.bilder[0].wand === 1e12 && L.bilder[3].zelle === "wiese-ego-steht" && L.bilder[0].zelle === null &&
            L.bilder.every((b) => b.wetter === "sunny") && L.marken.length === 1 && L.marken[0].bild === 3 && L.bilder[0].stempelOk && !L.bilder[3].stempelOk,
            JSON.stringify([L.bilder.map((b) => [b.probe, b.zelle, b.stempelOk]), L.marken]));
        // DER ORT IM DECKEL (ortImDeckel): die Probe, die 1 200 m zog und deren Ring fiel, beim Namen; die, die 34 m ging, und die Sitzung
        // selbst (ihre Grundstellung, ihr Umstellen) nie — die Zapfen der Seite (`ort`, `ring`), wie stromSeite sie schreibt
        const od = path.join(tmp, "strom-ort.ndjson");
        const block = (probe, ort, ring) => fs.appendFileSync(od, JSON.stringify({ probe, zeit: "z", seite: "s", ursprung: 0, zeilen: [], namen: { wetter: [], zelle: [] }, ort, ring }) + "\n");
        block("(sitzung)", [0, 0], 4);
        block("a.K1#1", [0, 0], 4);
        block("a.K1#1", [1200, 0], 0);
        block("a.K1#1", [1200, 0], 3);
        block("(sitzung)", [-280, -1046], 4);
        block("b.K1#1", [-250, -1030], 4);
        block("(sitzung)", [5000, 0], 1);
        const OD = stromKopf(od, {}).ortImDeckel;
        pruef("ORT IM DECKEL die Probe, die weiter als ihr Ring zog, beim Namen samt Ring; die nahe und die Sitzung selbst nie",
            OD.length === 1 && OD[0].probe === "a.K1#1" && OD[0].m === 1200 && OD[0].ringVor === 4 && OD[0].ringMin === 0, JSON.stringify(OD));
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    const rot = fall.filter((f) => !f.ok);
    console.log((rot.length ? "SELBSTTEST ROT — " + rot.map((f) => f.name).join(", ") : "SELBSTTEST GRÜN") + " (" + (fall.length - rot.length) + "/" + fall.length +
        (ohne.size ? ", ohne " + [...ohne].map((t) => "(" + t + ")").join(" ") : "") + ")");
    return rot.length ? 1 : 0;
}

// ───────────────────────────────── CLI ─────────────────────────────────
function opts(argv) {
    const o = {};
    for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) {
        const k = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        o[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    }
    return o;
}

if (require.main === module) {
    const [verb, ...rest] = process.argv.slice(2);
    const o = opts(rest);
    (async () => {
        if (verb === "run") await run(o);
        else if (verb === "halter") await halter(o);
        else if (verb === "grundstellung") {
            // in einer Probe: die Grundstellung der Welt der Sitzung (WERKBANK_PORT, der Grund PUNKTE_SITZUNG_GRUND)
            const g = await grundstellung(Number(o.port || process.env.WERKBANK_PORT), o.grund || process.env.PUNKTE_SITZUNG_GRUND);
            console.log(g.ok ? "GRUNDSTELLUNG " + g.s + " s (im Spiel " + g.ms + " ms, neu " + JSON.stringify(g.neu) + ")" +
                (g.kette ? " · die Zeichenkette zurück: " + g.kette.join(" ") : g.ketteTuer ? " · die Zeichenkette durch die Tür: " + g.ketteTuer.join(" ") : "") : "GRUNDSTELLUNG ROT: " + g.grund);
            // die Grundstellung ist Messort, nie Linse (keinUrteil (d)): eine Probe, die ihre Ausgabe erbt, trägt die Marke
            if (!g.ok) console.log("@@PUNKTE@@ MESSORT Grundstellung: " + String(g.grund).replace(/\s+/g, " ").slice(0, 280));
            process.exitCode = g.ok ? 0 : 1;
        }
        else if (verb === "grundprobe") process.exitCode = (await grundProbe(o)) ? 0 : 1;
        else if (verb === "scheiben") scheibenCli(o);
        else if (verb === "vereine") vereineCli(o);
        else if (verb === "buchen") {
            const s = buchenCli(o);
            if (o.trocken) buchungZeigen(s, "(trocken: stand.json unberührt)");
        }
        else if (verb === "gtx-nutzen") gtxNutzenCli(o);
        else if (verb === "beruehrt") beruehrtCli(o);
        else if (verb === "eichtafel") eichtafelCli(o);
        else if (verb === "behalte") behalteCli(o);
        else if (verb === "plan") planCli(o);
        else if (verb === "gruppen") for (const g of zwillingsGruppen(ladeGeprueft().stationen, o.geraet, o.nur)) console.log(g.join(","));
        else if (verb === "liste") {
            const { stationen, fehler, fehlt } = ladeGeprueft();
            // DIE WAND PFAD am Kopf (--kopf, sonst origin/main des Spiel-Klons): jeder Glob trifft eine Datei
            const repo = spielRepo();
            const kopf = voll(repo, o.kopf || "origin/main");
            const dateien = dateienAm(repo, kopf);
            for (const st of stationen) {
                const t = toteGlobs(st.pfad, dateien);
                if (t.length) fehler.push(schluessel(st) + ": " + pfadGrund(t, "am Kopf " + kopf.slice(0, 8)));
            }
            // DIE WAND HAKEN am Kopf: jeder gerufene Haken der Seite ist gesetzt
            for (const h of toteHaken(stationen, hakenAm(repo, kopf), stationText)) fehler.push(h + " — niemand setzt ihn am Kopf " + kopf.slice(0, 8) + " (Wand HAKEN)");
            // DIE WAND EXPORT am Kopf: jedes Glied, das eine Station aus einem Werkzeug des Spiels liest, exportiert es
            for (const x of toteExporte(stationen, exporteAm(repo, kopf), stationText)) fehler.push(x + " — der Kopf " + kopf.slice(0, 8) + " exportiert es nicht (Wand EXPORT)");
            // DIE WAND ANKER am Kopf: jede Deklaration und jeder Text-Anker, den eine Station aus einem Werkzeug des Spiels liest, steht dort
            for (const x of toteAnker(stationen, ankerLeser(repo, kopf), acornVon(repo))) fehler.push(x + " — am Kopf " + kopf.slice(0, 8) + " (Wand ANKER)");
            for (const st of stationen) console.log("  " + schluessel(st) + " · " + geraeteVon(st).join("+") + (st.gpu ? " · GPU" : "") + (st.zeit ? " · Zeit" : " · Bild") + (st.probe ? " · Sitzung ≤ " + probeSek(st) + " s" : "") + " · " + st.minuten + " min · " + befehlVon(st).join(" ") + " · " + abdruck(st));
            for (const e of fehlt) console.log("  FEHLT " + e.kriterium + "#" + e.staffel + " · " + String(e.grund).slice(0, 140));
            for (const f of fehler) console.log("  ROT " + f);
            console.log(stationen.length + " Stationen · " + new Set(stationen.map((s) => s.kriterium)).size + " Kriterien · fehlt " + fehlt.length + " · Fehler " + fehler.length);
            process.exitCode = fehler.length ? 1 : 0;
        } else if (verb === "selbsttest") process.exitCode = await selbsttest(o);
        else if (verb === "fremdlast") process.exitCode = await fremdlastCli(o);
        else if (verb === "referenz") process.exitCode = await referenzCli(o);
        else {
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--offen] [--eich] [--trocken] [--bahnen 3] [--port-basis 7700] [--farm <name>] · gruppen --geraet <g> [--nur id,id] · scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur …] · vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben <json>] [--beginn <s>] · beruehrt --basis <sha> --kopf <sha> [--json] · buchen --kopf <sha> [--trocken] · liste [--kopf <sha>] · eichtafel --geraet radeon|gtx [--sha a,b] [--schreibe] · behalte --sha <sha> --geraet <g> --bis <ISO> · selbsttest [--ohne 3c] · fremdlast [--sek 60] [--takt 2000] · referenz [--n 5] [--umfeld allein|sitzung]");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, liesPflicht, pflichtBand, pflichtEintraegeAus, pruefeStationen, trifftPfad, toteGlobs, gpuZeuge, gpuWand, abdruck, fahreStation,
    frischUrteil, stempelDateien, stempelDiff, r6Quelle, beruehrt, konsumFalten, konsumVon, konsumTreffer, skriptVon, skriptZeilen, r6Zaehlung, linsenVon, ladeGeprueft, ladeMessungen, spielRepo, voll, git, schluessel, geraeteVon, hilfeText,
    griffeVon, toteAnker, ankerLeser, acornVon,
    // DER STROM für die Probe der Sitzung (require(process.env.PUNKTE_MASCHINE)): EIN Zapfen, EINE Marke, EIN Leser, der Ruf mit Frist
    stromZapfen, stromMarke, stromLesen, rufFrist, STROM_SPALTEN };
