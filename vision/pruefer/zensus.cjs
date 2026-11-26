// zensus.cjs — DER ZENSUS DER PRÜFER-SPROSSEN (26.11., Zweig pm-pruefer): jede Sprosse der Meisterkarte 2, deren Richter-Satz ein
// Urteil über Bilder verlangt (Klasse P und K in stationen/auge-klasse.cjs, dazu jeder Satz mit Prüfer-Wort außerhalb der Tafel),
// nach AUFGABEN-ART — am Wortlaut ihres Richter-Satzes, nie an einer Meinung. Quelle: vision/meisterkarte-2.json (Satz, heute),
// auge-klasse.cjs (KLASSE), vision/richter-tafel.json (der Messort). Schreibt vision/pruefer/zensus.json; Leser: pruefer.cjs
// (`urteil` nimmt Art, Maß und Schwelle der Sprosse NUR von hier — die Schwelle steht wörtlich im Teil-Satz daneben).
//
//   node vision/pruefer/zensus.cjs            schreibt zensus.json und nennt die Zahlen
//   node vision/pruefer/zensus.cjs --pruefe   ROT, wenn zensus.json nicht am Stand von Karte und Tafel steht (Arten, Schwellen)
//
// DIE ARTEN (R11):
//   2afc     Blindpaar / Zwei-Wege-Zwang: Spielbild gegen Foto, Film oder Referenzbild (oder Spiel gegen Spiel)
//   skala    Urteil ohne Gegenbild: plausibel · glaubhaft · stimmig · Staunen 1–7 · Präferenz
//   ordnen   Ordnen, Zuordnen, Benennen, Wiedererkennen: die Wahrheit kennt der Same (das Gesetz, das das Bild schuf)
//   band     K: eine Zahl aus dem Spiel gegen ein Band realer Daten
//   leser    R10: der eingefrorene Leser sagt aus dem Bild die Ursache voraus (Rang ≥ 0,7), Gegenlauf, Neuheit
//   spieler  das Protokoll verlangt ein SPIELENDES Wesen (Blind-Spieler, Zuschauer, Leser über Minuten bis Stunden)
//   zahl     Prüfer-Wort im Satz, der Satz ist aber ganz eine Zahl aus dem Spiel („blindes Bohren“) — kein Prüfer
// `stumpf: "gruen"` heißt: ein Prüfer, der nur rät oder immer Ja sagt, läse GRÜN — dort ist die Eichung an Ankern FREMDER Herkunft
// (Foto gegen Render) oder an gestufter Störung Pflicht. `stumpf: "rot"`: ein stumpfer Prüfer kann nur ROT irren.
"use strict";
const fs = require("fs");
const path = require("path");
const KARTE = path.join(__dirname, "..", "meisterkarte-2.json");
const TAFEL = path.join(__dirname, "..", "richter-tafel.json");
const AUGE = path.join(__dirname, "..", "..", "meisterkarte-quelle", "punkte", "stationen", "auge-klasse.cjs");
const ZIEL = path.join(__dirname, "zensus.json");

// das Prüfer-Wort außerhalb der Tafel KLASSE (dieselbe Probe wie die Decken-Rechnung des Koordinators, 24.11.)
const WORT = /blind|panel|2afc|jury|prüfer|gutachter|hörer|plausib|glaubhaft|glaubwürd|stimmig|„echt“|gegen (real-)?foto|fotos? real|als foto/i;
// von Hand am Wortlaut gelesen, wo die Regel unten nicht trägt — jede Zeile mit ihrem Grund
const HAND = {
    "planet.geologie.lagerstaette#3": ["zahl", "„blindes Bohren“ ist der Vergleichs-Lauf der Prospektor-Probe, kein Urteil"],
    "planet.geologie.lagerstaette#6": ["zahl", "„blindes Bohren“ ist der Vergleichs-Lauf der Prospektor-Probe, kein Urteil"],
    "mensch.netz.stoffwechsel#3": ["zahl", "„plausible Tiefe“ ist die Norm-Tiefe der Leitung, eine Zahl"],
    "erleben.sinne.hoeren#1": ["spieler", "Blind-Lauf: ein Spieler findet den Ausgang nur am Echo"],
    "erleben.sinne.hoeren#2": ["spieler", "Blind-Flug: ein Spieler fliegt nur am Echo"],
    "planet.wetter.vorhersage#2": ["leser", "das eingefrorene Bildmodell liest den Regen aus dem Himmel — die Wahrheit kennt der Same"],
    "planet.erde.gestalt#6": ["spieler", "100 Menschen suchen ihren Wohnort — ein Modell hat keinen"],
    "mensch.zeit.erde#6": ["spieler", "100 Menschen erkennen ihren Ort um 1950 — ein Modell hat keinen"],
    "erleben.sinn.staunen#2": ["skala", "Schätzfrage: eine Zahl aus dem Bild, Median im Faktor 3"],
    "same.physik.stoffe#1": ["ordnen", "der Stoff wird am Verhalten benannt"],
    "mensch.leib.verschieden#1": ["ordnen", "gleiche Paare finden: Wahrheit aus dem Samen"],
    "mensch.kopplung.leib#4": ["skala", "plausibel gegen Daten"],
    "erleben.schoepfen.satz#7": ["ordnen", "Bild ↔ Text: das Bild wird seinem Absatz zugeordnet"],
    "erleben.schoepfen.teilen#5": ["ordnen", "von beiden Eltern verschieden: Unterscheiden, Wahrheit aus dem Samen"],
    "leben.kopplung.leben-formt-planet#7": ["ordnen", "mit und ohne Leben unterscheidbar: Wahrheit aus dem Samen"],
    "leben.evolution.zeitreise#1": ["ordnen", "das Panel ordnet Gegenwart und Epoche"],
    "leben.tiere.lebenszyklus#2": ["ordnen", "Kitz und Hirsch werden als Alter derselben Art erkannt"],
    "mensch.sport.kunst#1": ["ordnen", "Anfänger und Meister werden unterschieden"],
    "planet.kopplung.siedlungslage#6": ["ordnen", "die Jury rät die Lagen aus der Karte — Treffer gegen Zufall"],
    "same.gedaechtnis.alter#3": ["2afc", "Paarvergleich gegen Fotos 10 Jahre alter Bauten"],
    "erleben.kopplung.emergenz#6": ["skala", "plausible Geschichten, am Ort im Bild nachgeprüft"],
    "leben.oeko.netz#7": ["2afc", "Kennzahl-Tafeln werden nicht über Zufall von realen getrennt"],
    "planet.wetter.fremde-atmosphaeren#1": ["2afc", "Himmelsfarbe gegen Foto"],
    "erleben.klang.raum#3": ["ordnen", "Blind-Lokalisierung: die Richtung der Quelle wird benannt"],
    "mensch.leib.gesicht#3": ["ordnen", "das Alter wird geschätzt, die Wahrheit kennt der Same"],
    "mensch.leib.spur#1": ["ordnen", "das Alter wird geschätzt, die Wahrheit kennt der Same"],
    "same.gedaechtnis.alter#4": ["ordnen", "das Baualter wird geschätzt, die Wahrheit kennt der Same"],
    "erleben.schoepfen.hebel#7": ["skala", "ohne Aufploppen: ein Urteil am Film der Annäherung"],
    "erleben.schoepfen.satz#9": ["skala", "der Ort gehorcht Text und Vorzeit: ein Urteil am Bild"],
    "erleben.spieler.rolle#4": ["skala", "epochentreu gegen Quellen: ein Urteil am Wort"],
    "mensch.wirtschaft.technik#2": ["skala", "plausible Pfadfolgen: ein Urteil, die Schwelle ist eine Anzahl"],
    "planet.relief.wandel#3": ["2afc", "Bildfolge gegen die Landsat-Zeitreihe"],
    "planet.relief.boden#4": ["ordnen", "der Bodentyp wird am Anschnitt klassiert — die Referenzprofile der WRB sind fremde Bilder", { lauf: "fremd" }],
    "leben.tiere.mensch#6": ["ordnen", "die Ego-Aufnahme ist ein Bild des Spiels", { lauf: "spiel" }],
    "mensch.leib.gesicht#4": ["ordnen", "„Foto-Niveau“ nennt die Höhe der Schwelle, kein Gegenbild", { lauf: "spiel" }],
    "mensch.geist.innenleben#1": ["ordnen", "der 5-s-Film ist ein Film des Spiels", { lauf: "spiel" }],
    "same.physik.flug#6": ["ordnen", "die Sprung-Videos sind Filme des Spiels", { lauf: "spiel" }],
    "same.gedaechtnis.alter#7": ["ordnen", "das Luftbild ist ein Bild des Spiels", { lauf: "spiel" }],
    "erleben.schoepfen.gespraech#2": ["ordnen", "die Endfassung wird unter den Fassungen als die nächste am Wunsch gewählt", { lauf: "spiel" }],
    "mensch.kultur.schrift#3": ["ordnen", "das Gewerbe wird am Schild benannt", { lauf: "spiel", teil: "nennen das Gewerbe" }],
};
// Bänder, die aus einer veröffentlichten ZAHL leben (kein Bild, keine Datei) — die Literatur-Zahl steht in quellen.json
const BAND_LITERATUR = new Set(["planet.geologie.unterwelt#1", "leben.pflanzen.kraft#4", "leben.pflanzen.jahreslauf#4", "leben.pflanzen.lebenslauf#6", "same.kopplung.ereignis#6"]);

const SPIELER = /blind-spieler|blinde spieler|blind-agent|blinde zuschauer|blinde leser|freie stunde|100 sitzungen/i;
const AFC_STARK = /2afc|blindpaar|verwechsl|„foto|"foto|als foto|trefferquote|blind-fehler|fehlerquote|nicht sicher von|blindurteil ≤|unterscheidet ≤|unterscheidet .* in ≤|trennt sie blind nicht|50 ± 5/i;
const SKALA_STARK = /staunen|präferenz|unser bild|unser werk|vor der lore|gleichwertig/i;
const ORDNEN = /bild-klasse|ordnet|ordnen|zugeordnet|zuordnung|sortier|klassi|erkenn|erkannt|nennt|nennen|benannt|benenn|errät|rät |bestimmt|unterscheidbar|unterscheidet ≥|unterscheidet 2|unterscheidet ≥|getrennt|trennbar|trennt drei|wiedererkennung|datierung|aus dem (nah-)?bild|bildern ≥|vogelschau|hausbild|richtige[rn]? von|region ≥|rateaufgabe|findet|liest|folge|nach funktion|richtig|gattung ≥|wählen die region|stoff aus 10|affekt|sagt aus|epoche ±|kultur ≥|klimazone/i;
const SKALA = /plausib|glaubhaft|glaubwürd|stimmig|kohärent|möglich|lebendige welt|widerspruch|folgerichtig|denkbar|sinnvoll|besonders|„passt|panel ≥|jury ≥|„echt|echt"|„lebt/i;
const AFC_SCHWACH = /foto|film|video|luftbild|satellit|referenz|\bREF\b|bildvergleich|blindtest|blindurteil|blindvergleich|paarvergleich|bildpaar|bildreihe|bildfolge|zeitraffer|silhouette gegen|draufsicht gegen|gegen .*(modellierung|relief|vine|street-view|mikroskop)|wie 4|blindtest/i;
const FREMD = /foto|film|video|satellit|luftbild|landsat|street-view|sonden|mikroskop|webcam|referenz|\bREF\b|marble|juno|cassini|teleskop|aufnahme|museum|herbar|mosaik|globus|(^|[^a-zäöü])reale?[nrs]?([^a-zäöü]|$)|vine-matthews|chicxulub|rekonstruktion|bildquellen|übertragung|angkor|kowloon|tokio|colorado|canyon|yellowstone|atlas|quellen|erdkarten|path-tracing|vergleichstitel|aaa-|korpus|liga|menschliche|von menschen|ausgezeichnete|übersetzungen|gegen daten|wrb|natur-/i;
const SPIELPAAR = /gesetz|spieler-hof|pinsel|spieler-werk|studio-werke|eltern|zwischenfassung|vorschlag ↔/i;
const STUMPF_GRUEN = /verwechsl|fehler(quote)? ≥|nicht sicher|trennt sie blind nicht|trennen .*nicht|„foto|"foto|als foto|„echt|echt"|„lebt|gewählt|wählt unser|präferenz|staunen|gleich alt|plausib|glaubhaft|glaubwürd|stimmig|kohärent|widerspruch|folgerichtig|denkbar|sinnvoll|„passt|möglich|lebendige welt|besonders|gleichwertig|blindpaar ≥|50 ± 5/i;
const MEDIUM = [
    ["klang", /hörer|klang|tonaufnahme|musik|geeichtes ohr|echo|lokalisierung|affekt blind|feldaufnahme des musik|foley|sieht und hört|blindtest gegen feldaufnahme/i],
    ["text", /regelwerk|text gegen|erzählung|geschichten|legende|quests|welt-ziele|geschriebene ziele|verben|gespräch gegen|dialoge|kennzahl-tafeln|zu ende gelesen/i],
    ["film", /film|video|clip|zeitraffer|60 s fahrt|tracking|durchgang|übertragung|sprung-videos/i],
];

// der Teil-Satz, der das Urteil trägt (die Sätze der Karte trennen ihre Hälften mit „;“)
function teilVon(satz, wort) {
    const teile = String(satz).split(";").map((t) => t.trim()).filter(Boolean);
    if (teile.length < 2) return teile[0] || "";
    if (wort) {
        const kopf = wort.split(/…|\(/)[0].trim().slice(0, 14).toLowerCase();
        const t = kopf.length >= 4 && teile.find((x) => x.toLowerCase().includes(kopf));
        if (t) return t;
    }
    return teile.find((x) => WORT.test(x)) || teile.find((x) => AFC_SCHWACH.test(x) || ORDNEN.test(x)) || satz;
}
// die Schwelle WÖRTLICH aus dem Teil-Satz: { mass, op, wert } oder { mass: null, grund }
function schwelleVon(teil) {
    const zahl = (s) => +s.replace(",", ".");
    let m;
    if ((m = /50 ± 5 ?%/.exec(teil))) return { mass: "anteil", op: "band", wert: [0.45, 0.55], wort: m[0] };
    if ((m = /median ≥ (\d+)/i.exec(teil))) return { mass: "median", op: "≥", wert: +m[1], wort: m[0] };
    if ((m = /(≥|≤) (\d+) von (\d+)/.exec(teil))) return { mass: "anteil", op: m[1], wert: +m[2] / +m[3], wort: m[0] };
    if ((m = /(≥|≤) (\d+)× (Zufall|Basisrate)/.exec(teil))) return { mass: "faktor", op: m[1], wert: +m[2], wort: m[0] };
    if (/Fehler ≤|Faktor \d|± 1 Jh|IoU|ΔE|≥ \d+ (verschiedene|benennbare|Ereignisse|Ziel)|≥ 1 Ort|≥ 5$|≥ \d+ Stoffe|≥ 20 je/.test(teil) && !/%/.test(teil)) return { mass: null, grund: "Schwelle anderer Art (Fehler, Faktor, Anzahl) — das Maß trägt pruefer.cjs noch nicht: „" + teil.slice(0, 90) + "“" };
    const alle = [...teil.matchAll(/(≥|≤) ?[„"]?[a-zäöüß]*[“"]? ?(?:bei )?(\d+(?:,\d+)?) ?(%)?/gi)].filter((x) => x[3] === "%" || zahl(x[2]) <= 1);
    if (alle.length) {
        const x = alle[alle.length - 1];
        return { mass: "anteil", op: x[1], wert: x[3] === "%" ? zahl(x[2]) / 100 : zahl(x[2]), wort: x[0].trim() };
    }
    return { mass: null, grund: "ohne Schwelle im Satz (R6: die Zahl daneben ist die Schwelle — hier steht keine)" };
}
function artVon(id, klasse, teil, satz) {
    if (HAND[id]) return HAND[id][0];
    if (klasse === "K") return /fremdwelt-probe|ursachen-probe|R10/i.test(satz) && !/Band der Chronosequenz/.test(satz) ? "leser" : "band";
    if (SPIELER.test(teil)) return "spieler";
    if (AFC_STARK.test(teil)) return "2afc";
    if (SKALA_STARK.test(teil)) return "skala";
    if (ORDNEN.test(teil)) return "ordnen";
    if (SKALA.test(teil)) return "skala";
    if (AFC_SCHWACH.test(teil)) return "2afc";
    return "unklar";
}
function zeile(L, s, e, tafelJe) {
    const id = L.id + "#" + s.nr;
    const klasse = e ? e[0] : "wort";
    const hand = (HAND[id] && HAND[id][2]) || {};
    const teil = klasse === "K" ? s.richter : hand.teil ? String(s.richter).split(";").map((t) => t.trim()).find((t) => t.includes(hand.teil)) : teilVon(s.richter, e && e[1]);
    if (!teil) throw new Error(id + ": die Hand-Zeile nennt einen Teil-Satz, den die Karte nicht trägt");
    const art = artVon(id, klasse, teil, s.richter);
    const z = { id, klasse, art, teil };
    if (HAND[id]) z.hand = HAND[id][1];
    if (art === "zahl") return z;
    z.medium = (MEDIUM.find(([, re]) => re.test(teil)) || ["bild"])[0];
    if (art === "spieler") z.medium = "spiel";
    // der LAUF: woher die Bilder des Urteils kommen · die ANKER: woran der Prüfer scharf wird
    const fremd = hand.lauf ? hand.lauf === "fremd" : art === "band" ? !BAND_LITERATUR.has(id) : art === "leser" ? false : FREMD.test(teil) || (art === "2afc" && !SPIELPAAR.test(teil));
    z.lauf = art === "band" && !fremd ? "literatur" : fremd ? "fremd" : "spiel";
    z.vergleichstitel = /vergleichstitel|aaa-/i.test(teil) || undefined;
    if (art === "band" || art === "leser" || art === "spieler") z.schwelle = { mass: null, grund: art === "band" ? "Band realer Daten: urteilt die Station an der Zahl, sobald das Band mit Quelle liegt" : art === "leser" ? "R10: Rang ≥ 0,7 · Gegenlauf ≥ 80 % · Neuheit ≥ 30 % — das Rang-Maß trägt pruefer.cjs noch nicht" : "ein spielendes Wesen: das Protokoll trägt pruefer.cjs noch nicht" };
    else z.schwelle = schwelleVon(teil);
    if (art === "2afc" || art === "skala" || art === "ordnen") {
        z.stumpf = STUMPF_GRUEN.test(teil) || (z.schwelle.op === "≤" && art === "2afc") || z.schwelle.op === "band" || art === "skala" ? "gruen" : "rot";
        z.anker = art === "2afc" ? "foto-render" : art === "skala" ? "stoerung" : "klasse";
    }
    const t = tafelJe.get(id);
    if (t) z.station = t;
    return z;
}
function rechne() {
    const karte = JSON.parse(fs.readFileSync(KARTE, "utf8"));
    const { KLASSE } = require(AUGE);
    const tafelJe = new Map();
    for (const z of JSON.parse(fs.readFileSync(TAFEL, "utf8")).zeilen) if (!tafelJe.has(z.leiter + "#" + z.sprosse)) tafelJe.set(z.leiter + "#" + z.sprosse, z.station);
    const sprossen = [];
    const leitern = [];
    for (const g of karte.gruppen)
        for (const L of g.kriterien) {
            const reihe = L.sprossen.map((s) => {
                const e = KLASSE[L.id + "#" + s.nr];
                if (e && e[0] === "Z") return null;
                if (!e && !WORT.test(s.richter || "")) return null;
                return zeile(L, s, e, tafelJe);
            });
            leitern.push({ L, reihe });
            reihe.forEach((z, i) => {
                if (!z) return;
                z.leiterHeute = L.heute;
                z.leiterSprossen = L.sprossen.length;
                if (L.zaehlung === "glieder") z.glieder = true;
                z.front = L.zaehlung === "glieder" ? !(L.heuteSprossen || []).includes(L.sprossen[i].nr) : i === L.heute;
                sprossen.push(z);
            });
        }
    // OHNE FREMDE DATEI: der Prüfer kann die Sprosse heute fahren — Bilder aus dem Spiel, Wahrheit aus dem Samen, Maß getragen
    const ohneDatei = (z) => z && (z.art === "ordnen" || z.art === "skala" || z.art === "2afc") && z.lauf === "spiel" && z.medium === "bild" && z.schwelle.mass === "anteil";
    const frei = (z) => !z || z.art === "zahl" || ohneDatei(z);
    // der HEBEL einer Front ohne fremde Datei: sie selbst + der freie Lauf dahinter (Zahl-Sprossen und weitere ohne fremde Datei)
    const hebel = [];
    for (const { L, reihe } of leitern) {
        if (L.zaehlung === "glieder") continue;
        const z = reihe[L.heute];
        if (!z || !ohneDatei(z)) continue;
        let n = 1;
        while (L.heute + n < reihe.length && frei(reihe[L.heute + n])) n++;
        hebel.push({ id: z.id, art: z.art, station: z.station || null, schwelle: z.schwelle.wort, stumpf: z.stumpf, lauf: n, bis: L.heute + n, von: L.sprossen.length, teil: z.teil });
    }
    hebel.sort((a, b) => b.lauf - a.lauf || a.id.localeCompare(b.id));
    // die Tafel je Art
    const arten = {};
    for (const z of sprossen) {
        const a = (arten[z.art] = arten[z.art] || { sprossen: 0, front: 0, P: 0, K: 0, wort: 0, laufSpiel: 0, laufFremd: 0, laufLiteratur: 0, ohneSchwelle: 0, massOffen: 0, medium: {} });
        a.sprossen++;
        a[z.klasse]++;
        if (z.front) a.front++;
        if (z.art === "zahl") continue;
        a[z.lauf === "spiel" ? "laufSpiel" : z.lauf === "fremd" ? "laufFremd" : "laufLiteratur"]++;
        a.medium[z.medium] = (a.medium[z.medium] || 0) + 1;
        if (!z.schwelle.mass) /^ohne Schwelle/.test(z.schwelle.grund) ? a.ohneSchwelle++ : a.massOffen++;
    }
    return {
        quelle: { karte: "vision/meisterkarte-2.json", klasse: "meisterkarte-quelle/punkte/stationen/auge-klasse.cjs", tafel: "vision/richter-tafel.json", gebucht: karte.gruppen.reduce((n, g) => n + g.kriterien.reduce((m, L) => m + L.heute, 0), 0) },
        summe: { sprossen: sprossen.length, P: sprossen.filter((z) => z.klasse === "P").length, K: sprossen.filter((z) => z.klasse === "K").length, wort: sprossen.filter((z) => z.klasse === "wort").length, front: sprossen.filter((z) => z.front && !z.glieder).length, frontOhneFremdeDatei: hebel.length },
        arten,
        frontOhneFremdeDatei: hebel,
        sprossen,
    };
}
const fest = (Z) => JSON.stringify(Z.sprossen.map((z) => [z.id, z.klasse, z.art, z.lauf, z.schwelle && z.schwelle.mass, z.schwelle && z.schwelle.op, z.schwelle && z.schwelle.wert, z.stumpf]));
if (require.main === module) {
    const Z = rechne();
    if (process.argv.includes("--pruefe")) {
        const alt = fs.existsSync(ZIEL) ? JSON.parse(fs.readFileSync(ZIEL, "utf8")) : null;
        if (!alt || fest(alt) !== fest(Z)) {
            console.error("ZENSUS nicht am Stand: vision/pruefer/zensus.json weicht von Karte und Tafel ab — node vision/pruefer/zensus.cjs");
            process.exit(1);
        }
        console.log("ZENSUS am Stand: " + Z.sprossen.length + " Sprossen");
        process.exit(0);
    }
    const unklar = Z.sprossen.filter((z) => z.art === "unklar");
    if (unklar.length) {
        for (const z of unklar) console.error("UNKLAR: " + z.id + " — „" + z.teil + "“ (Zeile in HAND setzen)");
        process.exit(1);
    }
    if (process.argv.includes("--blick")) for (const z of Z.sprossen) console.log([z.id, z.klasse, z.art, z.lauf || "", z.medium || "", z.stumpf || "", z.schwelle ? (z.schwelle.mass ? z.schwelle.op + z.schwelle.wert : "—") : "", z.front ? "F" : "", z.teil.slice(0, 70)].join(" | "));
    fs.writeFileSync(ZIEL, JSON.stringify(Z, null, 1) + "\n");
    console.log("ZENSUS: " + Z.summe.sprossen + " Sprossen (P " + Z.summe.P + " · K " + Z.summe.K + " · Prüfer-Wort außerhalb der Tafel " + Z.summe.wort + ") · Front ihrer Leiter " + Z.summe.front + " · Fronten ohne fremde Datei " + Z.summe.frontOhneFremdeDatei);
    for (const [a, v] of Object.entries(Z.arten)) console.log("  " + a.padEnd(8) + " " + String(v.sprossen).padStart(3) + " Sprossen · Front " + String(v.front).padStart(2) + " · Lauf aus dem Spiel " + v.laufSpiel + " · fremde Datei " + v.laufFremd + " · Literatur-Zahl " + v.laufLiteratur + " · ohne Schwelle " + v.ohneSchwelle + " · Maß offen " + v.massOffen + " · " + JSON.stringify(v.medium));
    for (const h of Z.frontOhneFremdeDatei.slice(0, 10)) console.log("  HEBEL " + h.lauf + ": " + h.id + " (" + h.art + ", " + h.schwelle + ", Messort " + (h.station || "ohne Station") + ") → frei bis S " + h.bis + " von " + h.von);
}
module.exports = { rechne, fest, ZIEL };
