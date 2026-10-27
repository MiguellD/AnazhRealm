// DIE DOMÄNEN-TAFEL der Punkte-Maschine (R6d, 27.10., Karte r6-domaene) — die EINE Quelle für „welche Welt-Datei gehört wem“.
// R6 machte eine Messung alt, sobald ein pfad-Glob der Station traf; fast jede Station trägt stamm/daten.js, stamm/dirigent-*.js
// und gelaende-core.js im Pfad, darum machte jeder Zug fast alles alt. R6d hängt die Frische an die DOMÄNE der Änderung:
//   Bereich des Kriteriums (klang.K5 → klang) → BEREICHE → Domänen → DOMAENEN → Stamm-Module (spec/stamm/modul-karte.json am
//   Kopf), Kerne (cores.manifest.json am Kopf), Studio-Verzeichnisse und Einzeldateien.
// Die Domänen D1–D9 sind die neun der Systemkarte (SYSTEMKARTE.md §2); fünf Stamm-Zonen nennt die Systemkarte in keiner Domäne
// (Klang, Feld, Netz, Speicher, Werkstatt) — sie stehen hier als X1–X5 beim Namen (Karte ≠ Code, keine stille Zuordnung).
// Eine Datei darf mehreren Domänen gehören, ein Bereich mehreren Domänen: jede Mehrfach-Zeile zeigt, wo die Architektur verfilzt ist.
// KERN = was jede Domäne trägt: eine Änderung dort verlangt die KANARIEN (Stationen mit `kanarie: true` in stationen/gN.js).
// GETEILT = geteiltes Mess-Werkzeug (welt-boot und Genossen): wie Kern, die Kanarien entscheiden.
// OHNE_WELT = Dateien außerhalb von Spiel und Werkzeug (Lint-Regeln, Agenten-Texte): nie Welt.
// Jede Welt-Datei am Kopf gehört einer Domäne, dem Kern oder OHNE_WELT — sonst ist sie unzugeordnet und `punkte.cjs liste` ROT.
"use strict";

const DOMAENEN = {
    gelaende: {
        name: "D1 Gelände · Boden · Wasser",
        module: ["Gelaende/boden", "Gelaende/chunks", "Gelaende/fern", "Gelaende/kollision", "Wasser/hydro", "Wasser/zellen"],
        dateien: ["voxel-worker.js", "worlds/gelaende/**"],
    },
    vegetation: {
        name: "D2 Vegetation · Natur-Wand",
        module: ["Vegetation/wiese", "Vegetation/baum", "Vegetation/streu"],
        kerne: ["phyto"],
        dateien: ["worlds/terrain/**"],
    },
    siedlung: {
        name: "D3 Siedlung · Dorf → Stadt · Bauen",
        module: ["Siedlung/ort", "Siedlung/bauten", "Siedlung/satz", "Siedlung/bewohner", "Bau/vorlagen", "Bau/buch", "Bau/teile", "Werkstatt/bauen"],
        kerne: ["fachwerk"],
        dateien: ["worlds/fachwerk/**"],
    },
    tiere: {
        name: "D4 Tiere · Rudel",
        // der Leib (Rig, Gang, Ofen-Guss, Tier-Animation) ist Mensch UND Tier
        module: ["Kreatur/leben", "Kreatur/verhalten", "Koerper/leib"],
        kerne: ["tetrapoda"],
        dateien: ["worlds/tetrapoda/**", "worlds/schwarm/**"],
    },
    mensch: {
        name: "D5 Mensch · NPC · Spieler",
        module: ["Koerper/leib", "Koerper/seele", "Koerper/bewegung", "Kampf"],
        kerne: ["koerper", "schmiede"],
        dateien: ["worlds/koerperstudio/**", "worlds/skeleton/**", "worlds/schmiede/**", "worlds/begegnung/**"],
    },
    fahrzeug: {
        name: "D6 Fahrzeug · Ritt · Kamera",
        // die Kamera (_loopCamera) wohnt in Koerper/bewegung
        module: ["Koerper/fahrt", "Koerper/bewegung"],
        kerne: ["vehicle"],
        dateien: ["worlds/garage/**"],
    },
    licht: {
        name: "D7 Licht · Stoff · Ferne",
        module: ["Bild/himmel", "Bild/sicht", "Stoff/material", "Stoff/instanz", "Gelaende/fern"],
        // die Karte (impostor) und das FARB-GESETZ wohnen in foundry-core
        dateien: ["foundry-core.js"],
    },
    studios: {
        name: "D8 Studios · Hülle · Foundry",
        module: ["Studio/bruecke", "Studio/gestalt"],
        dateien: ["foundry-bruecke.js", "foundry-core.js", "cores.manifest.json", "worlds/huelle/**", "worlds/neuntes-buch/**",
            "worlds/fluid/**", "worlds/translated/**", "worlds/tor-ziele.json"],
    },
    takt: {
        name: "D9 Ankunft · Takt · Kosten · Prüfen",
        module: ["Dirigent/ankunft", "Dirigent/takt", "Dirigent/regler", "Bild/kosten", "Bild/diaet"],
        dateien: [],
    },
    klang: { name: "X1 Klang (Systemkarte: keine Domäne)", module: ["Klang"], kerne: ["klang"], dateien: ["worlds/klang/**"] },
    feld: { name: "X2 Feld · Sprache · KI (Systemkarte: keine Domäne)", module: ["Feld/leben", "Feld/dsl", "Feld/nexus", "Feld/sprache"], dateien: [] },
    netz: {
        name: "X3 Netz · Portal · Tore (Systemkarte: keine Domäne)",
        module: ["Netz/p2p", "Netz/identitaet", "Netz/portal"],
        kerne: ["porta"],
        dateien: ["signaling-server.js", "worlds/portale/**"],
    },
    speicher: { name: "X4 Speicher (Systemkarte: keine Domäne)", module: ["Speicher/welten", "Speicher/laden"], dateien: ["save-server.js", "speicher-faden.js"] },
    werkstatt: {
        name: "X5 Werkstatt-Oberfläche (Systemkarte: keine Domäne)",
        module: ["Werkstatt/hud", "Werkstatt/vorschau", "Werkstatt/hof", "Werkstatt/sozial"],
        dateien: [],
    },
};

// der Bereich eines Kriteriums (Schlüssel vor „.K“) → seine Domänen; "*" = jede Domäne (das Profi-Band misst die ganze Welt)
const BEREICHE = {
    gelaende: ["gelaende"],
    wetter: ["licht", "vegetation", "feld"],
    physik: ["mensch", "tiere", "fahrzeug"],
    feld: ["feld", "gelaende", "licht", "speicher", "siedlung"],
    stoffe: ["gelaende", "mensch", "tiere", "licht", "klang"],
    mensch: ["mensch", "siedlung", "tiere"],
    tiere: ["tiere", "feld", "gelaende"],
    vegetation: ["vegetation", "siedlung"],
    oekologie: ["tiere", "feld"],
    affekt: ["feld", "klang"],
    licht: ["licht"],
    ferne: ["licht", "vegetation", "gelaende"],
    material: ["licht", "vegetation", "siedlung", "studios"],
    schatten: ["licht"],
    studios: ["studios"],
    pipeline: ["studios", "werkstatt"],
    ki: ["feld", "studios", "werkstatt"],
    bauen: ["siedlung", "werkstatt", "studios", "mensch"],
    fahrzeug: ["fahrzeug"],
    siedlung: ["siedlung", "vegetation"],
    leib: ["mensch", "fahrzeug"],
    halten: ["mensch", "klang"],
    ultiversum: ["netz", "feld"],
    tore: ["netz", "studios"],
    streaming: ["gelaende", "takt", "studios"],
    profiband: ["*"],
    klang: ["klang"],
    speicher: ["speicher", "siedlung"],
};

// eine Station, die an der Wanduhr urteilt (zeit: true), trägt dazu die Domäne des Takts
const ZEIT_DOMAENE = "takt";

const KERN = {
    module: ["Dirigent/kern", "Dienst", "Daten"],
    kerne: ["gelaende"],
    dateien: ["index.html", "package.json", "package-lock.json", "vendor/**"],
};

// geteiltes Mess-Werkzeug: eine Änderung entscheiden die Kanarien (wie beim Kern); jedes andere Werkzeug (scripts/**, spec/**)
// macht nur die Stationen alt, deren Befehl oder Pfad es nennt (werkzeug:<datei>)
const GETEILT = [
    "scripts/lib/welt-boot.cjs", "scripts/lib/software-gpu.cjs", "scripts/lib/welt-orte.cjs", "scripts/lib/ausgabe-aufnahme.cjs",
    "scripts/lib/stamm.cjs", "scripts/lib/abnahme-urteil.cjs", "scripts/werkbank.cjs", "spec/profiband/haushalt.json",
];

const OHNE_WELT = [".claude/**", ".gitattributes", ".gitignore", ".prettierrc.json", "eslint.config.mjs", "start.bat"];

// MENGE (Regel 4): die geänderten Welt-Zeilen einer FREMDEN Domäne seit der Messung (Stempel-Hunks fallen) über der Schwelle
// machen auch Stationen alt, die die Domäne nicht tragen — ein Umbau dieser Größe ist kein Detail. Begründung der Zahl im
// Bericht bericht/2710-r6-domaene.md (Historie e7a28b06 → 9fa32207)
const MENGE = { zeilen: 400 };

// die Toleranz einer Zahl beim Kanarien- und Sicherheits-Urteil: relativ je Zahl im Zahl-Text (Bild/Funktion eng, Wanduhr weit);
// eine Station darf `toleranz` selbst tragen (nicht im Abdruck)
const TOLERANZ = { bild: 0.05, zeit: 0.25, absolut: 0.02 };

module.exports = { DOMAENEN, BEREICHE, ZEIT_DOMAENE, KERN, GETEILT, OHNE_WELT, MENGE, TOLERANZ };
