// urteil-zeile.cjs — DIE GEDRUCKTE ROTE ZEILE IST URTEIL (Lehre 6; w28-probe-urteil, Klasse A der Augen-Karte 11.11.: 14 von 70
// Paketen meldeten GRÜN über ihren eigenen ROT-/❌-Zeilen — gate:laub-kante „lod.K1#1 ROT“, gate:pop „lod.K2#1 ROT“, ein
// haar-strich-Vehikel mit vier ❌ und `process.exit(0)`, gpu-probe.yml urteilte am Exit allein). EINE Quelle für drei Leser:
//   istRotZeile(z)   die Zeile trägt ein ROTES Urteil: ❌ · ⛔ · das Wort ROT — nie eine Selbsttest-Zeile mit ✅ (die Mutante ist
//                    ROT, die Linse GRÜN), nie eine Zeile mit dem Etikett „[Selbsttest]“ vorn und nie eine Zählung „0 ❌“/„0 ROT“.
//                    Ein Vermerk heißt nie ROT/❌.
//   wache()          (welt-boot und jede Linse ohne welt-boot) am Prozess-Ende: eine gedruckte ROTE Zeile bei Exit 0 wird Exit 1,
//                    beim Namen — der Exit trägt, was die Zeile sagt (sonst stünde die Zeile als Vermerk ohne ROT/❌).
//   probeUrteil(...) (der Kopf der GPU-Probe, gpu-probe.yml) Log UND Exit: GRÜN nur ohne ROTE Zeile und mit Exit 0; jede ROTE
//                    Zeile reißt, und der Kopf nennt die erste; BEKANNT heißt nur die Ratsche des Messorts (ORT_BEKANNT unten).
//   stationsUrteil(...) (die Stations-Probe) die Zeilen der Punkte-Maschine je gerufener Sprosse, dazu probeUrteil.
// CLI (gpu-probe.yml): node scripts/lib/urteil-zeile.cjs --log <datei> --rc <exit> [--stationen <id>,<id>…]
//   → EINE Zeile `<U>\t<grund>`, U ∈ GRÜN · BEKANNT · ROT. Gate: gate:apparat Klinge 9 (Selbsttest mit Mutanten).
"use strict";

const ROT_RE = /❌|⛔|(?<![A-Za-zÄÖÜäöüß])ROT(?![A-Za-zÄÖÜäöüß])/;
// keine Urteile: die Zählung „0 ❌“/„0 ROT“, und ROT als Beschreibung des erwarteten Ausgangs („→ ROT“, „ist ROT“, „wird ROT“ —
// die Sätze der Selbsttests: die Mutante IST ROT, die Linse urteilt GRÜN)
const ZAEHLUNG_RE =
    /(?<![\d.,])0\s*(?:❌|ROT(?![A-Za-zÄÖÜäöüß]))|(?:→|=>|\b(?:ist|wird|werden|sind|als|bleibt|macht|heißt|nennt|wäre|fällt|das))\s+ROT(?![A-Za-zÄÖÜäöüß])/g;
// DIE RATSCHE DES MESSORTS (w28-linse-wahr): `werkbank bild --ort` urteilt jedes ROT gegen `bekannt` seines Orts
// (spec/profiband/haushalt.json) und schreibt „ABNAHME BEKANNT · ROT wie an main (bekannt): <ort>.<schlüssel> <grund> · …“, wenn JEDES
// ROT dort steht — die Schlüssel sind die ersten Wörter der Glieder (`stadt.leib`, `wiese.band.nahWiese`); ein neues ROT schreibt
// „ABNAHME ROT [...]“ und reißt wie jede Zeile. Die Zeile ist kein ROT (`istRotZeile`: sonst machte die Wache der Werkbank aus dem
// BEKANNT einen Exit 1, GPU-Probe 00d6624d), der Kopf der Probe sammelt ihre Schlüssel aus jeder Zeile
const ORT_BEKANNT = /ABNAHME BEKANNT · ROT wie an main \(bekannt\): /;
const ortSchluessel = (z) =>
    z
        .split(ORT_BEKANNT)[1]
        .split(" · ")
        .map((g) => g.split(" ")[0])
        .filter((w) => /^[a-z][a-z0-9-]*\.[A-Za-z][\w.:-]*$/.test(w));

function istRotZeile(z) {
    // die Ratsche des Orts ist kein ROT der Zeile (sie hat geurteilt: jedes ROT steht in `bekannt`) — ein ROT daneben bleibt eines
    const s = String(z).replace(ZAEHLUNG_RE, "").replace(ORT_BEKANNT, "ABNAHME BEKANNT · ");
    // die Zeile urteilt an ihrem Kopf: „ok“/„OK“ vorn ist ein bestandener Fall, auch wenn er seine Mutante ROT nennt
    // (gate:mp-sync „OK   (d) Selbsttest: die alte Kappe je Frame macht (d) ROT am Gesetz“, z399)
    // eine Zeile mit dem Etikett „[Selbsttest]“ vorn zeigt die Mutante, ihr ❌ ist das Soll (diag-tier-gang.cjs `log`, GPU-Probe a071dc5e:
    // 69 Etikett-Zeilen machten den Kopf ROT über „✅ SELBST-TEST GRÜN“ und Exit 0) — das Urteil des Selbsttests steht ohne Etikett
    // („❌ SELBST-TEST ROT — … ist vakuös“) und reißt wie jede Zeile
    // eine Meldung des Maßes am Lande-Tor (`mass`, unten) ist kein Urteil: ihr Richter steht am Ende der Klasse
    return (
        ROT_RE.test(s) && !s.includes("✅") && !/^\s*ok\s/i.test(s) && !/^\s*\[Selbsttest\]/.test(s) && !MELDET.test(s)
    );
}

// die ROTEN Zeilen eines Texts, je mit der Folgezeile, wenn sie ein Spiegelstrich ist (rotListe: „❌ ROT — n Verletzung(en):“, „   • …“)
function rotZeilen(text) {
    const z = String(text).split(/\r?\n/);
    const aus = [];
    for (let i = 0; i < z.length; i++)
        if (istRotZeile(z[i])) {
            const folge = z[i + 1] && /^\s+(?:•|-)\s/.test(z[i + 1]) ? " " + z[i + 1].trim() : "";
            aus.push((z[i].trim() + folge).slice(0, 300));
        }
    return aus;
}

function probeUrteil({ text, rc }) {
    const rot = rotZeilen(text);
    const zeilen = String(text)
        .split(/\r?\n/)
        .map((z) => z.trim())
        .filter(Boolean);
    const bekannt = new Map();
    for (const z of zeilen.filter((x) => ORT_BEKANNT.test(x))) {
        const ids = ortSchluessel(z);
        if (!ids.length) return { u: "ROT", grund: `${z.slice(0, 220)} — die Ratsche des Orts nennt keinen Schlüssel` };
        for (const id of ids) bekannt.set(id, `${id} (Messort, haushalt.json bekannt)`);
    }
    const ende = () => ({ u: "BEKANNT", grund: `ROT wie an main (bekannt): ${[...bekannt.values()].join(" · ")}` });
    if (!rot.length) return Number(rc) !== 0 ? { u: "ROT", grund: `Exit ${rc} ohne ROTE Zeile: ${(zeilen.at(-1) || "kein Log").slice(0, 200)}` } : bekannt.size ? ende() : { u: "GRÜN", grund: "" }; // prettier-ignore
    // jede ROTE Zeile reißt (der gebuchte Stand der alten Karte fiel am 19.11. als Quelle des BEKANNT): der Kopf nennt die erste
    return { u: "ROT", grund: rot[0].slice(0, 220) };
}

// DIE STATIONS-PROBE (`station:karte2.<leiter>#<n>[+…][@<ref>]`, Auftrag Umsatz 24.11.: kein Macher sah das Urteil seiner Station vor
// der Landung): das Urteil sind die Zeilen der Punkte-Maschine je gerufener Sprosse (punkte.cjs `stationsZeile`: „  GRÜN <id> · <zahl>
// · …“, „  ROT  <id> · …“, „  OFFEN <id> · <grund> · …“). GRÜN nur, wenn JEDE gerufene Sprosse ihre GRÜN-Zeile trägt UND das Log sonst
// kein ROT (probeUrteil); eine OFFENE (ungemessen ist kein Vorurteil) oder fehlende Sprosse ist ROT beim Namen. Der Grund nennt jede
// Sprosse mit Urteil und Zahl — er steht im Kopf des Posts und oben in cloud-post/<zweig>.md.
const STATION_ZEILE = /^\s*(GRÜN|ROT|OFFEN)\s+(karte2\.[a-z0-9.-]+#\d+) · (.*)$/;
// Die Zeile einer gerufenen Sprosse urteilt an ihrem Kopf-Wort (ihre Zahl darf „ROT“ als Maß tragen); jede andere Zeile liest probeUrteil.
function stationsUrteil({ text, rc, ids }) {
    const je = new Map();
    const rest = [];
    for (const z of String(text).split(/\r?\n/)) {
        const m = STATION_ZEILE.exec(z);
        if (m && ids.includes(m[2])) je.set(m[2], { u: m[1], zahl: m[3].split(" · ")[0].trim() });
        else rest.push(z);
    }
    const teile = ids.map((id) =>
        je.has(id) ? `${je.get(id).u} ${id} (${je.get(id).zahl.slice(0, 60)})` : `OHNE ZEILE ${id}`
    );
    const alle = ids.length > 0 && ids.every((id) => je.get(id)?.u === "GRÜN");
    const p = probeUrteil({ text: rest.join("\n"), rc });
    if (alle && p.u !== "ROT") return { u: "GRÜN", grund: teile.join(" · ") };
    // vorn steht der Täter des Laufs, wenn die Sprossen ihn nicht tragen: ein ROT neben grünen Sprossen, eine ROTE Zeile daneben,
    // oder ein Lauf ohne eine einzige Sprossen-Zeile (die Maschine kam nicht an)
    const vorn = p.u === "ROT" && (alle || !je.size || rotZeilen(rest.join("\n")).length);
    return { u: "ROT", grund: (vorn ? `${p.grund} — ` : "") + teile.join(" · ") };
}

// DIE URTEILS-WACHE am Prozess-Ende (einmal je Prozess): jede gedruckte Zeile (console.log/error/warn/info) läuft durch
// `istRotZeile`; endet der Prozess mit 0 nach einer ROTEN Zeile, steht der Grund auf stderr und der Exit wird 1
// Ein Selbsttest (`--selftest`/`--selbsttest`) zeigt seine Mutanten ROT und urteilt am eigenen Ende (selbsttestEnde, urteilEnde):
// dort wacht sie nicht
function wache() {
    if (process.__urteilWache || process.argv.some((x) => /^--sel(f|bs)t?test$/.test(x))) return;
    process.__urteilWache = { erste: null, n: 0 };
    const w = process.__urteilWache;
    for (const k of ["log", "error", "warn", "info"]) {
        const alt = console[k].bind(console);
        console[k] = (...a) => {
            for (const z of a
                .map((x) => (typeof x === "string" ? x : ""))
                .join(" ")
                .split("\n"))
                if (istRotZeile(z)) (w.n++, (w.erste ||= z.trim().slice(0, 300)));
            return alt(...a);
        };
    }
    process.on("exit", (code) => {
        if (code !== 0 || !w.n) return;
        process.stderr.write(
            `❌ URTEILS-WACHE: ${w.n} ROTE Zeile(n) bei Exit 0 — die erste: ${w.erste} (Exit wird 1; ein Vermerk heißt nie ROT/❌)\n`
        );
        process.exitCode = 1;
    });
}

// DAS MASS AM LANDE-TOR (w28-tor-bruch, das Wort des Schöpfers 13.11.: „als würde der ingenieur ein teil anpassen und der tüv die
// ganze zeit bämengelt, bevor die anpassung vollständig“): am Lande-Tor (check.yml, env TOR_KLASSE=bruch an voll und echt) sperrt
// nur BRUCH. Eine Linse, die Invarianten UND eine Schwelle auf ein Maß trägt (ZEIT: Wanduhr/ms auf dem geteilten Läufer; AUSSEHEN:
// ein Bild-Maß), ruft für die Schwelle `mass(art, ok, befund)`: hält sie (ok) → true; reißt sie am Lande-Tor → die Zeile „MELDET
// Maß <art> — <befund>“ und true (die Linse sperrt daran nicht); sonst (lokal, GPU-Probe, Band-Gerät — ihr Richter) und in jedem
// Selbsttest (`alsSelbsttest`, die Mutante MUSS reißen) → false wie jede Schwelle. Die Tafel spec/ci/tor-klassen.json nennt jede
// Stelle mit ihrem Richter, gate:ci-deckung (B) hält sie. Die letzte Zeile der Linse trennt: „MELDET Maß n — …“ steht nach allem.
const MELDET = /^\s*MELDET Maß /;
let selbst = 0;
const alsSelbsttest = (f) => {
    selbst++;
    try {
        return f();
    } finally {
        selbst--;
    }
};
function mass(art, ok, befund) {
    if (ok || process.env.TOR_KLASSE !== "bruch" || selbst) return !!ok;
    const m = (process.__massMeldung ||= []);
    if (!m.length) process.on("exit", () => console.log(`MELDET Maß ${m.length} am Lande-Tor — ${m.join(" · ")}`));
    m.push(`${art} ${befund}`);
    return true;
}

module.exports = { istRotZeile, rotZeilen, probeUrteil, stationsUrteil, wache, mass, alsSelbsttest };

if (require.main === module) {
    const fs = require("fs");
    const a = process.argv.slice(2);
    const opt = (k) => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : undefined);
    let text = "";
    try {
        text = fs.readFileSync(opt("--log"), "utf8");
    } catch (e) {
        text = `❌ das Log der Probe ist nicht lesbar: ${e.message}`;
    }
    const ids = opt("--stationen") ? opt("--stationen").split(",").filter(Boolean) : null;
    const r = ids ? stationsUrteil({ text, rc: opt("--rc") ?? 1, ids }) : probeUrteil({ text, rc: opt("--rc") ?? 1 });
    console.log(`${r.u}\t${r.grund.replace(/[\t\r\n]+/g, " ")}`);
}
