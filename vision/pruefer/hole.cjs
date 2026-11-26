// hole.cjs — DER HOLER DER REFERENZEN (R11, 26.11.): holt die Sätze, die vision/pruefer/quellen.json unter `saetze` mit einer
// `abfrage` führt, aus BENANNTEN öffentlichen Quellen und schreibt je Datei Adresse, Lizenz, Urheber-Zeile, sha256 und Bytes zurück
// in das Manifest. Die Dateien liegen NIE im Repo und nie neben diesem Skript: `--ziel` ist ein Ordner außerhalb jedes Repo-Baums.
//
//   node vision/pruefer/hole.cjs --ziel C:/…/AnazhRealm-korpus [--nur <satz-id>] [--trocken]
//   node vision/pruefer/hole.cjs anker --ziel C:/…/AnazhRealm-korpus --zuordnung C:/…/AnazhRealm-pruefer-zuordnung --bauer <Kennung>
//
// DIE WÄNDE: nur Lizenzen der Liste (gemeinfrei · CC0 · CC BY · offene Behörden-Daten) — alles andere bleibt liegen und steht beim
// Namen unter `liegenGeblieben` („Lizenz offen“) · nur JPEG und PNG (am Anfang der Datei geprüft, nie am Namen) · je Datei ≤ 30 MB ·
// die Welle zusammen ≤ 1 GB · eine Anfrage je 1,2 s, der Client nennt sich allgemein · nichts von außen wird ausgeführt · ein
// Fehler der Quelle ist ROT beim Namen, nie ein stiller halber Satz (`stand` sagt „geholt n von soll“).
// Quellen-Arten der `abfrage`:
//   { "art": "nasa", "q": "<Suchwort>", "id": "<Regex auf nasa_id>", "mit": "<Regex auf Titel+Schlagworte>", "ohne": "<Regex>", "ab": 2010 }
//       NASA Image and Video Library (images-api.nasa.gov): Inhalte der NASA sind in der Regel gemeinfrei (media usage guidelines);
//       jede Zeile, die einen fremden Urheber nennt (ESA, ©, courtesy …), bleibt liegen. Geholt wird die Größe „~medium“.
//   { "art": "commons-suche", "suche": "<Suchwort>" } | { "art": "commons", "kategorie": "<Name>" }
//       Wikimedia Commons: die Lizenz je Datei aus `extmetadata.License`; geholt wird die Vorschau der Breite `breite` (ein Skalierer
//       für alle Dateien eines Satzes: gleiche Kodierung beider Seiten).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const MANIFEST = path.join(__dirname, "quellen.json");
const UA = { "User-Agent": "referenz-korpus-holer/1.0 (node; research)" };
const MAX_DATEI = 30 * 1024 * 1024, MAX_WELLE = 1024 * 1024 * 1024, PAUSE_MS = 1200;
const warte = (ms) => new Promise((z) => setTimeout(z, ms));
const ohneTags = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
const AGENTUR = "ESA|JAXA|CNES|DLR|ASI|ISRO|Roscosmos|SpaceX|Boeing|Lockheed|Northrop|Blue Origin|ULA|Getty|Reuters|AP";
const FREMD = new RegExp("\\b(" + AGENTUR + ")\\b", "i"), FREMD_IM_TEXT = new RegExp("credits?:[^.]{0,80}\\b(" + AGENTUR + ")\\b", "i");
const freieLizenz =(code) => /^(pd|cc0|cc-zero|cc-by-\d)/i.test(code || "") && !/-(sa|nc|nd)/i.test(code || "");
async function json(url) {
    await warte(PAUSE_MS);
    const r = await fetch(url, { headers: UA });
    const t = await r.text();
    if (!r.ok || !/^\s*[{[]/.test(t)) throw new Error("die Quelle antwortet nicht mit Daten (" + r.status + "): " + t.slice(0, 80).replace(/\s+/g, " "));
    return JSON.parse(t);
}
async function datei(url) {
    await warte(PAUSE_MS);
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length > MAX_DATEI) throw new Error("über 30 MB");
    const jpg = b[0] === 0xff && b[1] === 0xd8, png = b.length > 8 && b.readUInt32BE(0) === 0x89504e47;
    if (!jpg && !png) throw new Error("kein JPEG/PNG (Anfang der Datei)");
    return { b, endung: jpg ? "jpg" : "png" };
}
// → Kandidaten { titel, adresse, seite, lizenz, urheber, frei, grund }
async function* nasa(a) {
    for (let seite = 1; seite <= 12; seite++) {
        const r = await json("https://images-api.nasa.gov/search?" + new URLSearchParams({ q: a.q, media_type: "image", page: String(seite), page_size: "100", ...(a.ab ? { year_start: String(a.ab) } : {}) }));
        const items = ((r.collection || {}).items || []);
        if (!items.length) return;
        for (const it of items) {
            const d = (it.data || [])[0] || {};
            const text = [d.title, (d.keywords || []).join(" · ")].join(" ‖ ");
            if (a.id && !new RegExp(a.id, "i").test(d.nasa_id || "")) continue;
            if (a.mit && !new RegExp(a.mit, "i").test(text)) continue;
            if (a.ohne && new RegExp(a.ohne, "i").test(text + " " + (d.description || "").slice(0, 600))) continue;
            // fremd: die Urheber-Zeile nennt eine andere Agentur oder Firma, oder der Text nennt ein Schutzrecht / eine fremde Bild-Quelle
            const zeile = [d.photographer, d.secondary_creator].join(" ");
            const fremd = FREMD.test(zeile) || /©|copyright|courtesy/i.test(zeile + " " + d.description) || FREMD_IM_TEXT.test(d.description || "");
            yield { titel: d.title, adresse: "https://images-assets.nasa.gov/image/" + encodeURIComponent(d.nasa_id) + "/" + encodeURIComponent(d.nasa_id) + "~medium.jpg", seite: "https://images.nasa.gov/details/" + d.nasa_id,
                lizenz: "gemeinfrei (NASA media usage guidelines)", urheber: ohneTags("NASA" + (d.center ? "/" + d.center : "") + (d.photographer ? " — " + d.photographer : d.secondary_creator ? " — " + d.secondary_creator : "")), frei: !fremd, grund: fremd ? "nennt einen fremden Urheber oder ein Schutzrecht" : null, jahr: String(d.date_created || "").slice(0, 4) };
        }
    }
}
async function* commons(a, breite) {
    let weiter = {};
    for (let seite = 0; seite < 6; seite++) {
        const gen = a.art === "commons" ? { generator: "categorymembers", gcmtitle: "Category:" + a.kategorie, gcmtype: "file", gcmlimit: "100" } : { generator: "search", gsrsearch: a.suche + " filetype:bitmap", gsrnamespace: "6", gsrlimit: "100" };
        const r = await json("https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", ...gen, prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: String(breite), iiextmetadatafilter: "License|LicenseShortName|Artist|Credit", ...weiter }));
        const seiten = Object.values((r.query || {}).pages || {}).sort((x, y) => (x.index || 0) - (y.index || 0));
        for (const p of seiten) {
            const ii = (p.imageinfo || [])[0];
            if (!ii || ii.mime !== "image/jpeg" || ii.width < breite) continue;
            if (a.ohne && new RegExp(a.ohne, "i").test(p.title)) continue;
            const m = ii.extmetadata || {}, code = (m.License || {}).value || "", kurz = (m.LicenseShortName || {}).value || code || "ohne Angabe";
            yield { titel: p.title, adresse: ii.thumburl, seite: ii.descriptionurl, lizenz: kurz, urheber: ohneTags((m.Artist || {}).value || (m.Credit || {}).value || "ohne Angabe"), frei: freieLizenz(code), grund: freieLizenz(code) ? null : "Lizenz nicht in der Liste: " + kurz };
        }
        if (!r.continue) return;
        weiter = r.continue;
    }
}
async function haupt(argv) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    const ziel = arg("--ziel");
    if (!ziel) throw new Error("--ziel fehlt (ein Ordner AUSSERHALB jedes Repo-Baums)");
    const zielAbs = path.resolve(ziel);
    for (let d = zielAbs; ; d = path.dirname(d)) {
        if (fs.existsSync(path.join(d, ".git"))) throw new Error("--ziel liegt in einem Repo-Baum (" + d + ") — kein fremdes Bild im Repo");
        if (path.dirname(d) === d) break;
    }
    if (argv[0] === "anker") return anker(argv, zielAbs);
    const M = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const trocken = argv.includes("--trocken");
    let welle = M.saetze.reduce((n, s) => n + (s.dateien || []).reduce((m, f) => m + f.bytes, 0), 0);
    for (const s of M.saetze) {
        if (!s.abfrage || (arg("--nur") && arg("--nur") !== s.id) || (!arg("--nur") && (s.dateien || []).length >= s.soll)) continue;
        const dir = path.join(zielAbs, s.art, s.quelle.toLowerCase().replace(/[^a-z0-9]+/g, "-"), s.id);
        const da = new Set((s.dateien || []).map((f) => f.adresse));
        s.dateien = s.dateien || [];
        s.liegenGeblieben = [];
        let fehler = null;
        try {
            for await (const k of s.abfrage.art === "nasa" ? nasa(s.abfrage) : commons(s.abfrage, s.breite || 1280)) {
                if (s.dateien.length >= s.soll) break;
                if (da.has(k.adresse)) continue;
                if (!k.frei) { if (s.liegenGeblieben.length < 60) s.liegenGeblieben.push({ titel: k.titel, seite: k.seite, lizenz: k.lizenz, grund: "Lizenz offen: " + k.grund }); continue; }
                if (trocken) { console.log("  " + s.id + ": " + k.titel + " (" + k.lizenz + ")"); s.dateien.push({ adresse: k.adresse, bytes: 0 }); continue; }
                let d;
                try { d = await datei(k.adresse); } catch (e) { console.log("  " + s.id + ": " + k.titel + " — " + e.message); continue; }
                if (welle + d.b.length > MAX_WELLE) { fehler = "der Deckel der Welle (1 GB) ist erreicht"; break; }
                const name = String(s.dateien.length + 1).padStart(3, "0") + "." + d.endung;
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.join(dir, name), d.b);
                welle += d.b.length;
                da.add(k.adresse);
                s.dateien.push({ datei: name, adresse: k.adresse, seite: k.seite, titel: k.titel, lizenz: k.lizenz, urheber: k.urheber, sha256: crypto.createHash("sha256").update(d.b).digest("hex"), bytes: d.b.length });
            }
        } catch (e) {
            fehler = e.message;
        }
        s.stand = "geholt " + s.dateien.length + " von " + s.soll + (fehler ? " — ABBRUCH: " + fehler : "") + " · ungesichtet";
        s.ablage = path.relative(zielAbs, dir).replace(/\\/g, "/");
        console.log(s.id + ": " + s.stand + " · liegen geblieben " + s.liegenGeblieben.length);
        if (!trocken) fs.writeFileSync(MANIFEST, JSON.stringify(summe(M), null, 1) + "\n"); // nach jedem Satz: ein Abbruch verliert nichts
    }
    return 0;
}
// anker: aus den Sätzen der Eichung (fuer "eichung", je Klasse gleich viele, reihum über die Sätze der Klasse) das BLINDE BLATT
// und die GETRENNTE Zuordnung bauen — der Holer legt bereit, die Läufe startet ein anderer Kontext (der Bauer ist nie der Prüfer).
//   node vision/pruefer/hole.cjs anker --ziel <korpus> --zuordnung <ordner außerhalb des Korpus> --bauer <Kennung> [--art 2afc] [--je 100] [--saat 1]
function anker(argv, zielAbs) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    const { blattBauen } = require("./pruefer.cjs");
    const M = JSON.parse(fs.readFileSync(MANIFEST, "utf8")), E = M.eichung;
    const art = arg("--art", "2afc"), je = +arg("--je", 100), saat = +arg("--saat", 1), id = "eichung-" + art;
    if (!arg("--zuordnung") || !arg("--bauer")) throw new Error("--zuordnung und --bauer fehlen");
    const zu = path.resolve(arg("--zuordnung"), id);
    if (zu.startsWith(zielAbs + path.sep)) throw new Error("die Zuordnung liegt AUSSERHALB des Korpus-Ordners — der Prüfer sieht den Korpus");
    const aufgaben = [];
    for (const klasse of E.optionen) {
        const saetze = M.saetze.filter((s) => s.fuer === "eichung" && s.klasse === klasse && (s.dateien || []).length), wahl = [];
        for (let i = 0; wahl.length < je && saetze.some((s) => s.dateien[i]); i++)
            for (const s of saetze) if (s.dateien[i] && wahl.length < je) wahl.push({ bilder: ["../../" + s.ablage + "/" + s.dateien[i].datei], wahr: klasse });
        if (wahl.length < je) throw new Error("Korpus fehlt: die Klasse „" + klasse + "“ trägt " + wahl.length + " von " + je + " Ankern");
        aufgaben.push(...wahl);
    }
    const paare = path.join(zielAbs, "paare", id), blatt = path.join(zielAbs, "blatt", id);
    fs.mkdirSync(paare, { recursive: true });
    fs.writeFileSync(path.join(paare, "paare.json"), JSON.stringify({ sprosse: null, art, form: E.form, frage: E.frage, optionen: E.optionen, herkunft: E.herkunft, bauer: arg("--bauer"), aufgaben }, null, 1) + "\n");
    const r = blattBauen(paare, blatt, zu, saat);
    M.blaetter = (M.blaetter || []).filter((b) => b.id !== id).concat({ id, art, form: E.form, herkunft: E.herkunft, aufgaben: r.aufgaben, jeKlasse: je, saat, bauer: arg("--bauer"), blatt: "blatt/" + id, zuordnungSha256: r.zuordnungSha256, zuordnung: "getrennt, außerhalb des Korpus-Ordners (" + path.basename(path.dirname(zu)) + "/" + id + "/zuordnung.json)", stand: "bereit · ungesichtet · kein Lauf gefahren" });
    fs.writeFileSync(MANIFEST, JSON.stringify(summe(M), null, 1) + "\n");
    console.log("BLATT " + id + ": " + r.aufgaben + " Anker (" + E.optionen.map((o) => je + " " + o).join(" · ") + ") → " + blatt + " · Zuordnung " + r.zuordnungSha256.slice(0, 16) + " getrennt in " + zu);
    return 0;
}
function summe(M) {
    const alle = M.saetze.flatMap((s) => s.dateien || []);
    M.summe = { saetze: M.saetze.length, dateien: alle.length, bytes: alle.reduce((n, f) => n + f.bytes, 0), liegenGeblieben: M.saetze.reduce((n, s) => n + (s.liegenGeblieben || []).length, 0) };
    return M;
}
if (require.main === module) haupt(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message); process.exit(2); });
module.exports = { freieLizenz, summe };
