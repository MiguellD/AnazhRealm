// diag-v1-pfad.cjs — DER SPIELGANG (SG1, 17.10.; vorher die V1-Pfad-Linse der Welle L). Schöpfer 17.10.: „ein effizienter,
// schneller Test müsste einen Durchgang machen wie ein Spieler … ändert man nur den Fahrzeug-Bereich, wird nur der getestet."
// Anlass: in Third verschwand im Auto das Fahrzeug (der gleitende Arm der Kamera traf den eigenen Wagen, Arm 0,30) — kein Gate
// fand es, 2 min Fahren fanden es (geheilt in 1215d560, `_gerittenesWerk`). Der erste Gang fand die zweite Hälfte derselben
// Klasse: der Band-Partner des Wagens (L1) blieb am Ort des Aufstiegs, am Wagen blendete die L0 aus (geheilt mit SG1).
// EIN Boot mit leerer Platte (frisches Profil, IDB leer) auf dem ECHTEN Renderer, wo die EINE Weiche (`linsenGpu`) die Karte
// gibt (lokal, der Job echt auf der GTX); wo sie swiftshader gäbe (die Batterie der CI), auf dem Null-Renderer: swiftshader
// kostete den Gang 11 min statt 51 s (Pipeline-Bau 42–292 s je Programm), und sein Holz änderte die Welt, die er prüfte (der
// Deckel der Ankunft, unter dem Frame-Budget stand die Welt nie, der GT ohne Studio-Stufen, CI 39045669231) — dort urteilt
// der Gang die Mechanik jeder Station, das Bild urteilt die Karte. Der Loop treibt die Welt selbst, die Proben warten in seinen
// Takten (`__gang.takte`), die Tasten sind KeyboardEvents. Die Stationen in der Reihenfolge eines Spielers, je Station
// Spieler-Gesetze als Urteil und auf der Karte ein Bild aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs, Bühne
// Mittag · Sonne · Sommer):
//   ankunft   Start → Kontrolle in Takten und ms (`_weltbildDa`); das erste Bild ist GANZ: der Ladeschirm wich über das Gesetz
//             von gate:ankunft L2a (`_ankunftsBild`: keine Lücke, nie über Ruhe oder Deckel), er ist weg, W trägt den Spieler;
//             V-k4 der Fensterwechsel löst W. Die Ankunft ist der Boot jeder Station: sie läuft immer.
//   lichtung  V-D1 (Q15): keine Krone über der Genesis-Plattform, EINE Plattform, der Ring um sie auch über dem Frame-Budget.
//   fahrt     ein Studio-Wagen (`fahrzeug_gt`) vor dem Spieler (die Welt stellt ihn auf fahrbaren Grund); E steigt ein, die
//             Sicht springt auf Third, W fährt 100 m, der Spieler lenkt (A/D) in die freieste Richtung: der Kamera-Arm
//             (`_kamArm`) endet nie am eigenen Wagen (p50 ≥ 0,9, sonst sein Täter), jede zeichnende Stufe (Primär und
//             Band-Partner) steht am Wagen, und er füllt im Third-Bild sein Band (die Klassen-Teilung der Abnahme
//             `__klassenTeilung`: das Bild mit gegen ohne Wagen, Rauschen gemessen); E steigt aus, die Sicht kehrt zurück.
//             DER SELBSTTEST IM LAUF: die ersten 20 m fahren mit dem alten Mount-Follow (`_archInstanceUpdate` ohne den
//             Band-Partner, eingespielt) — das Urteil muss ROT werden und die Stufe beim Namen nennen. (Der alte Strahl ohne
//             `_gerittenesWerk` trifft den Wagen heute nicht mehr: sein Ziel liegt über der Hülle, gemessen t 1,0 mit und ohne.)
//   wort      V-D6 der KI-Fehler nennt den Host · V-k5/V-k6/V-D8 der Satz trifft die Welt · V-k5-KLASSE jede Op ohne ihren
//             Ort scheitert benannt an `dslEvalPos` · R2 die Wasser-Suche ist bit-gleich zum Scan und scannt trocken ≤ 8 je Ring.
//   werkstatt V-D5 das Rezeptbuch nach dem Spielmodus · V-D3 die Vorschau zeigt ihr Werk (Masken-Gesetz ≥ 99 %) · V-D3
//             FREMDER ZUG jeder Wartende erwacht nach einem fremd gezogenen Körper (≤ 20 s) · V-D3 RAHMEN jede Gestalt füllt
//             die Vorschau [0,5; 0,9].
// Die Befunde jeder Probe trägt git (Lehre 15); die statische Wand W2–W7 (Text am AST) fiel mit SG1 (Richter-Macher 16.10.:
// Linsen urteilen Verhalten, nie Text) — ihr Verhalten tragen V-D3, V-D1 und V-k5.
// DIE WAHL: `--station ankunft,fahrt` fährt nur diese; `--nach-diff <rev>` liest die geänderten Dateien seit <rev>: eine
// stamm-Datei ruft die Stationen ihres Moduls (spec/stamm/modul-karte.json, Tafel STATIONEN), was die Welt sonst lädt
// (worlds/, Kerne, index.html, diese Linse), den ganzen Gang; Doku, Spec und andere Skripte nur die Ankunft.
//   node scripts/diag-v1-pfad.cjs [--selftest] [--station a,b] [--nach-diff <rev>] [--bilder <ordner>]   Port: V1_PFAD_PORT (4421)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.V1_PFAD_PORT || 4421);
const root = path.resolve(__dirname, "..");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const ARGV = process.argv.slice(2);
const OPT = (k) => (ARGV.includes(k) ? ARGV[ARGV.indexOf(k) + 1] : null);

// ── DIE STATIONEN in der Reihenfolge eines Spielers: je Station die Module des Stamms, deren Änderung sie ruft. ──
const STATIONEN = [
    ["ankunft", /^Dirigent\/(ankunft|takt|regler)$/],
    ["lichtung", /^(Gelaende\/boden|Vegetation\/baum|Siedlung\/(ort|satz))$/],
    ["fahrt", /^(Koerper\/(fahrt|bewegung)|Gelaende\/(chunks|kollision))$/],
    ["wort", /^(Feld\/|Wasser\/hydro$|Netz\/p2p$)/],
    ["werkstatt", /^(Werkstatt|Studio|Bau)\//],
];
// Was jede Station trägt (Konstruktor, Dienste, Tafeln) und was die Welt außerhalb des Stamms lädt, ruft den ganzen Gang;
// was sie nie lädt (Doku, Spec, andere Skripte), nur die Ankunft — sie ist der Boot jeder Station.
const ALLE_MODULE = /^(Dirigent\/kern|Dienst|Daten)$/;
const NIE_GELADEN = /^(docs|spec|artifacts|\.github|\.claude)\/|\.md$|^scripts\/(?!diag-v1-pfad\.cjs$|lib\/(welt-boot|ausgabe-aufnahme|abnahme-urteil|software-gpu)\.cjs$)/;
function stationenFuer(dateien, ordnung) {
    const modulVon = new Map(ordnung.map(([m]) => [`stamm/${m.toLowerCase().replace("/", "-")}.js`, m]));
    const S = new Set(["ankunft"]);
    const grund = [];
    for (const d of dateien) {
        if (NIE_GELADEN.test(d)) continue;
        const m = modulVon.get(d);
        const s = m && !ALLE_MODULE.test(m) ? STATIONEN.filter(([, re]) => re.test(m)).map(([n]) => n) : STATIONEN.map(([n]) => n);
        s.forEach((n) => S.add(n));
        grund.push(`${d}${m ? ` (${m})` : ""} → ${s.join(",") || "ankunft"}`);
    }
    return { stationen: STATIONEN.map(([n]) => n).filter((n) => S.has(n)), grund };
}

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
// Das Band des Wagens im Third-Bild (Anteil der Pixel, die der Wagen zeichnet): gemessen 17.10. Radeon 1,3 % (GT nach 100 m,
// 9 m vor der Kamera, 640×360) — darunter steht er nicht im Bild, darüber steht die Kamera in ihm.
const SOLL = { vorschauAnteil: 0.99, rahmenMin: 0.5, rahmenMax: 0.9, zugMs: 20000, karteMin: 0.5, karteMax: 1.5 };
Object.assign(SOLL, { kontrolleM: 2, fahrM: 100, armMin: 0.9, wagenMin: 0.005, wagenMax: 0.2, rauschenMax: 0.002, stufeM: 2, radMax: 0.05 });
// Der Wechsel und der Hang (Befund des Schöpfers 17.10.): je Rückkehr nach Third die Kamera ≤ azGrad an der Gier nach 10 Bildern,
// die Gier drehte in Ego ≥ egoGrad (sonst beweist der Wechsel nichts); der Ruck bei fester Lenkung (die zweite Differenz der
// Kamera im Rahmen des Wagens je Bild, p95) ≤ ruckM; bergab höchstens schnappMax Schnapper des Arms (ein Bild, das ihn um mehr
// als `schnapp` einzieht). Die Schwellen aus der Messung (Radeon, Spielgang 18.10.): siehe die Zeilen des Urteils.
Object.assign(SOLL, { wechselS: 2, kreisMs: 3, kreisM: 10, egoGrad: 30, azGrad: 10, ruckM: 0.05, gleichMax: 0.15, hochMin: 10, schnapp: 0.05, schnappMax: 3, hangM: 60, hangMin: 0.2, hangMittel: 0.3 });
const pct = (x) => `${(100 * (x || 0)).toFixed(1)} %`;
// ANKUNFT: das erste Weltbild ist ganz (das Gesetz von L2a sagt es selbst im Log, wenn es über Ruhe oder Deckel wich), der
// Ladeschirm ist weg, W trägt den Spieler.
function ankunftVerdict(m) {
    if (!m || m.gestartet !== true) return ["ankunft start"];
    const out = [];
    if (!(m.ms > 0)) out.push("ankunft: kein erstes Weltbild (`_weltbildDa` fehlt)");
    if ((m.ohne || []).length) out.push(`ankunft halb: ${m.ohne[0]}`);
    if (m.ladeschirm) out.push("ankunft: der Ladeschirm steht nach dem Weltbild");
    if (!(m.weg >= SOLL.kontrolleM)) out.push(`kontrolle: W trug den Spieler ${m.weg} m in ${m.wegTakte} Takten (Soll ≥ ${SOLL.kontrolleM} m)`);
    return out;
}
// Die gesunden Abschnitte des Selbst-Tests (Wechsel und Hang)
const GLATT = { ruckN: 120, ruckP95: 0.02, gleichN: 200, gleichP95: 0.04, hochP05: 19, radN: 400, radWeg: 0 };
const WECHSEL_GESUND = Object.assign({ wechsel: [[74, 4], [70, 4]], stufeWeg: 0.1, anteil: 0.02, rauschen: 0 }, GLATT);
const HANG_GESUND = Object.assign({ gefaelle: 0.42, weg: 60, armN: 200, armMin: 0.6, schnapp: 0, armWeg: 0.4, stufeWeg: 0.1, anteil: 0.02, rauschen: 0 }, GLATT);
// FAHRT: Aufstieg in Third, 100 m mit W, der Arm hält, der Wagen steht in seinem Band im Bild; die Sicht im Wechsel unter fester
// Lenkung; ein Steilhang bergab; Abstieg in die alte Sicht. Der Täter des Arms beim Namen: endet er in der Hülle des gerittenen
// Werks (`imWagen`), trifft sein Strahl den eigenen Wagen.
function fahrtVerdict(m) {
    if (!m || m.gestartet !== true) return [`fahrt start${m && m.grund ? `: ${m.grund}` : ""}`];
    const out = [];
    if (m.sichtRitt !== "third") out.push(`sicht: im Ritt ${m.sichtRitt}, nicht third`);
    if (!(m.weg >= SOLL.fahrM)) out.push(`fahrt: ${m.weg} m statt ${SOLL.fahrM} m`);
    if (!(m.armN > 0)) out.push("kamera-arm: keine Probe im Ritt (vakuös)");
    // ein Arm vor Boden und Bau ist das Gesetz des gleitenden Arms; ROT ist der Arm, der am eigenen Wagen endet
    else if (!(m.armP50 >= SOLL.armMin) && m.imWagen > m.armN / 2)
        out.push(
            `kamera-arm p50 ${m.armP50} (min ${m.armMin}) < ${SOLL.armMin} — ${m.imWagen} von ${m.armN} Proben enden am gerittenen Werk ${m.typ}: der Strahl der Kamera trifft den eigenen Wagen`
        );
    const w = m.wechsel || {};
    const h = m.hang || {};
    // JEDE ZEICHNENDE STUFE je Bild am Wagen, in jedem Abschnitt; das Bild urteilt die Karte (der Null-Renderer der CI hat keins:
    // `bild: false`, die Linse prüft, dass die Karte eins hat)
    for (const [wo, a] of [["", m], [" im Wechsel", w], [" am Hang", h]]) {
        if (a.stufeWeg > SOLL.stufeM) out.push(`aufbau${wo} ${a.stufeWeg} m neben dem Wagen: die Stufe ${a.stufeTaeter} zieht nicht mit (_archInstanceUpdate)`);
        if (a.radWeg > SOLL.radMax) out.push(`rad${wo}: die Stufen im Band zeigen das Rad verschieden (Drehung um ${a.radWeg}, ${a.radN} Proben) — eine Stufe steht in der Ruhe-Lage (_archInstanceAdd)`);
        if (a.bild !== false && (a === m || a.anteil != null) && !(a.anteil >= SOLL.wagenMin && a.anteil <= SOLL.wagenMax))
            out.push(`wagen${wo} im Bild ${pct(a.anteil)} außerhalb [${pct(SOLL.wagenMin)}; ${pct(SOLL.wagenMax)}]`);
    }
    if (m.bild !== false && !(m.rauschen <= SOLL.rauschenMax)) out.push(`bild-rauschen ${m.rauschen} > ${SOLL.rauschenMax} (die Maske des Wagens trägt nicht)`);
    // DER WECHSEL: je Rückkehr nach Third steht die Kamera nach 10 Bildern an der Gier; der Ruck bei fester Lenkung
    const nach = w.wechsel || [];
    if (nach.length < 2 || !nach.every(([ego]) => ego >= SOLL.egoGrad))
        out.push(`wechsel: ${nach.length} Rückkehr nach Third, die Gier drehte in Ego ${nach.map(([g]) => `${g}°`).join(" · ") || "—"} (vakuös: Soll 2 je ≥ ${SOLL.egoGrad}°)`);
    for (const [ego, n10] of nach)
        if (!(n10 <= SOLL.azGrad)) out.push(`kamera nach dem Wechsel ${n10}° neben der Gier nach 10 Bildern (in Ego drehte sie ${ego}°, Soll ≤ ${SOLL.azGrad}°): die Chase-Cam beginnt aus der alten Richtung`);
    // DER RUCK, DER GLEICHLAUF, DIE HÖHE über der Fahrbahn: im Kreis (feste Lenkung) und am Hang
    for (const [wo, a] of [["im Wechsel", w], ["am Hang", h]]) {
        if (a === h && !(h.gefaelle >= SOLL.hangMittel)) continue;
        if (!(a.ruckN >= 30 && a.gleichN >= 30)) out.push(`kamera ${wo}: ${a.ruckN || 0} Bilder Ruck, ${a.gleichN || 0} Bilder Gleichlauf (vakuös, Soll ≥ 30)`);
        else {
            if (a === w && !(a.ruckP95 <= SOLL.ruckM)) out.push(`kamera-ruck seitlich p95 ${a.ruckP95} m je Bild bei fester Lenkung (Soll ≤ ${SOLL.ruckM}): die Kamera springt quer gegen den Wagen`);
            if (!(a.gleichP95 <= SOLL.gleichMax))
                out.push(`gleichlauf ${wo} p95 ${a.gleichP95} (Soll ≤ ${SOLL.gleichMax}): das Bild zeigt den Wagen nicht, wo die Physik ihn zu seiner Zeit hat (_applyFixedInterpolation)`);
            if (!(a.hochP05 >= SOLL.hochMin)) out.push(`kamera ${wo} p05 ${a.hochP05}° über der Fahrbahn (Soll ≥ ${SOLL.hochMin}°): die Elevation steht zur Welt, nicht zur Fahrbahn`);
        }
    }
    // DER HANG: ein Steilhang, der Wagen fährt ihn bergab, der Arm pumpt nicht
    if (!(h.gefaelle >= SOLL.hangMittel)) out.push(`hang: kein Steilhang ≥ ${SOLL.hangMittel} im Umkreis (vakuös)`);
    else {
        if (!(h.weg >= SOLL.hangM * 0.8)) out.push(`hang: ${h.weg} m bergab statt ${SOLL.hangM} m`);
        if (!(h.armN > 0)) out.push("hang: keine Probe des Arms (vakuös)");
        else if (h.schnapp > SOLL.schnappMax) out.push(`kamera-arm pumpt bergab: ${h.schnapp} Schnapper auf ${h.weg} m (Arm-Weg ${h.armWeg}, min ${h.armMin}; Soll ≤ ${SOLL.schnappMax})`);
    }
    if (m.abgestiegen !== true) out.push("fahrt: E steigt nicht aus");
    else if (m.sichtNach !== m.sichtVor) out.push(`sicht: nach dem Abstieg ${m.sichtNach} statt ${m.sichtVor}`);
    return out;
}
// V-D3 FREMDER ZUG (K38): jeder Wartende erwacht nach der Ankunft eines Körpers, den ein ANDERER zuerst zog.
function zugVerdict(m) {
    if (!m || m.gestartet !== true) return ["zug start"];
    const out = [];
    for (const [wer, z] of [
        ["vorschau", m.vorschau],
        ["hand", m.hand],
    ]) {
        if (!z) out.push(`zug ${wer}: keine Probe (vakuös)`);
        else if (!z.fremd) out.push(`zug ${wer}: kein fremder Zug im Flug (vakuös)`);
        else if (!(Number.isFinite(z.ms) && z.ms <= SOLL.zugMs)) // null ist nie 0 (Lehre 17)
            out.push(
                z.imCache
                    ? `zug ${wer} schläft: ${z.key} liegt im Cache, ${wer === "hand" ? "die Hand" : "die Vorschau"} wartet weiter`
                    : `zug ${wer}: ${z.key} nach ${SOLL.zugMs} ms nicht angekommen (der fremde Zug im Rang der Ferne)`
            );
    }
    // V-D3 STUFEN (K38-N2): jede Stufe der Werkstatt-Vorschau (L0 · L1 · die L2-Karte) erwacht, wenn ihr Stoff ankommt —
    // die Karte wartet auf ihre Höhen-Stufe (Rahmen und Sichthöhe) bzw. auf ihren Bake, nie auf eine Uhr.
    const st = m.stufen || [];
    if (st.length !== 3) out.push(`zug stufen: ${st.length} von 3 Stufen gemessen (vakuös)`);
    for (const s of st)
        if (!(Number.isFinite(s.ms) && s.ms <= SOLL.zugMs))
            out.push(
                s.da
                    ? `zug stufe L${s.lod} schläft: ${s.wart} ist da, die Vorschau wartet weiter`
                    : `zug stufe L${s.lod}: ${s.wart} nach ${SOLL.zugMs} ms nicht da`
            );
        // die Karte steht in ihrer Größe: die Box der Vorschau misst die Höhe ihrer Höhen-Stufe (der Rahmen rahmt die Karte,
        // nie den Stamm des Einheits-Quads)
        else if (s.lod === 2 && !(s.hoch / s.soll >= SOLL.karteMin && s.hoch / s.soll <= SOLL.karteMax))
            out.push(
                `zug stufe L2 rahmen: die Box der Karte misst ${s.hoch} m, ihre Höhen-Stufe ${s.soll} m — Täter die Box der Karten-Instanz (Einheits-Quad)`
            );
    // V-D3 VORRAT (K38-N2): der Vorrat zieht über den EINEN Zug je Körper-Schlüssel — ein Leser, der während des
    // Vorrats-Flugs denselben Körper braucht, hängt sich an, nie ein zweiter Auftrag (bis 15.10. bestellte
    // `_foundryPrefetchLibrary` an `_foundryZug` vorbei: der Leser fand keinen Zug und bestellte den Körper ein zweites Mal).
    const vr = m.vorrat;
    if (!vr) out.push("zug vorrat: keine Probe (vakuös)");
    else if (!vr.imFlug) out.push(`zug vorrat: ${vr.key} nicht im Flug des Vorrats (vakuös: ${vr.auftraege} Aufträge, Cache ${vr.imCache}, Phase ${vr.phase})`);
    else if (vr.auftraege !== 1)
        out.push(`zug vorrat: ${vr.key} ${vr.auftraege}× bestellt — Täter _foundryPrefetchLibrary bestellt an _foundryZug vorbei`);
    return out;
}
// V-D3 RAHMEN (K05, WS-01): die projizierte Box3 jeder Gestalt in [0,5; 0,9] der Bildkante, jede Waffe des Buchs gemessen.
// Befund integ-probe 32027dc2 (Runner R10): Messer 0,059, Median 0,157 — Täter der 3-m-Mindestabstand der Vorschau.
function rahmenVerdict(m) {
    if (!m || m.gestartet !== true) return ["rahmen start"];
    const out = [];
    const e = m.eintraege || [];
    const waffen = e.filter((q) => q.kind === "weapon" && Number.isFinite(q.fuell)).length;
    if (!(m.waffenImBuch > 0) || waffen !== m.waffenImBuch) out.push(`rahmen waffen ${waffen} von ${m.waffenImBuch} gemessen`);
    const frist = e.filter((q) => q.frist).map((q) => q.id);
    if (frist.length) out.push(`rahmen ${frist.length} ohne Gestalt nach Frist (${frist.slice(0, 4).join(", ")})`);
    const aus = e
        .filter((q) => Number.isFinite(q.fuell) && !(q.fuell >= SOLL.rahmenMin && q.fuell <= SOLL.rahmenMax))
        .sort((a, b) => a.fuell - b.fuell);
    if (aus.length)
        out.push(
            `rahmen ${aus.length} außerhalb [${SOLL.rahmenMin}; ${SOLL.rahmenMax}]: ${aus
                .slice(0, 5)
                .map((q) => `${q.id} ${q.fuell} (${q.kante} m, Abstand ${q.dist} m)`)
                .join(", ")} — Täter _workshopCenterPreviewOn`
        );
    return out;
}
function vorschauVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.renders > 0)) out.push("vorschau zeichnete nie");
    if (!(m.vertices > 0)) out.push("vorschau ohne Werk");
    if (!(m.anteil >= SOLL.vorschauAnteil))
        out.push(`vorschau ${(100 * (m.anteil || 0)).toFixed(1)} % im Bild (Maske ${m.maskeImRender}, Auge ${m.augeAbstand} m)`);
    if (m.maskeDanach !== m.maskeWelt) out.push(`welt-maske nach dem Vorschau-Render ${m.maskeDanach} statt ${m.maskeWelt}`);
    return out;
}

function lichtungVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.baeume > 0)) out.push("kein Wald um die Plattform gewachsen");
    if (m.kronen > 0) out.push(`${m.kronen} Krone(n) über der Scheibe (nächster Stamm ${m.naechsterStamm} m, ${m.naechsteArt})`);
    if (!(m.ringPortale > 0)) out.push("kein Genesis-Ring (über dem Frame-Budget)");
    else if (!(m.ringMitteAbstand <= 1)) out.push(`ring-mitte ${m.ringMitteAbstand} m neben der Plattform`);
    if (m.trocken !== true) out.push("plattform im wasser");
    if (m.plattformen !== 1) out.push(`${m.plattformen} Plattformen nach dem zweiten Leger`);
    return out;
}

function rezeptVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.friedenGesperrt) out.push("frieden: der Knopf ist ohne Material frei (Vorbedingung)");
    if (!m.schoepferFrei) out.push(`schöpfer: der Knopf bleibt gesperrt („${m.titel}")`);
    return out;
}
function tasteVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.gedrueckt) out.push("keydown kam nicht an (Vorbedingung)");
    if (m.nachBlur) out.push("W bleibt nach dem Fensterwechsel gedrückt");
    return out;
}
function kiVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.fehler) out.push("kein Fehler gemeldet (Vorbedingung: der Dienst läuft nicht)");
    else {
        if (/CORS/i.test(m.fehler)) out.push(`lokaler Endpunkt als CORS gemeldet („${m.fehler.slice(0, 60)}…")`);
        if (!m.fehler.includes(m.host)) out.push("der Fehler nennt den Host nicht");
    }
    return out;
}
function satzVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.trockenOrt) out.push("kein Ort ohne Wasser gefunden (Vorbedingung)");
    else if (m.amWasserOhneWasser > 0) out.push(`${m.amWasserOhneWasser} Eichen „am Wasser" ohne Wasser`);
    else if (!/Kein Wasser/.test(m.amWasserZeile || "")) out.push(`die Absage fehlt („${m.amWasserZeile}")`);
    if (!(m.birkenAbsender > 0)) out.push("der Absender pflanzte keine Birke (Vorbedingung)");
    if (/baum_/.test(m.birkenZeile || "") || (m.birkenLabel && !(m.birkenZeile || "").includes(m.birkenLabel)))
        out.push(`der Chat nennt die interne id („${m.birkenZeile}")`);
    if (!m.gesendet) out.push("nichts gesendet (Vorbedingung)");
    else if (!/^\["at",/.test(m.ortKnoten || "")) out.push(`der Ort reist spieler-relativ: ${m.ortKnoten}`);
    if (m.gesendet && !(m.birkenEmpfaenger > 0)) out.push("der Empfänger pflanzte nichts");
    else if (m.gesendet && !(m.empfaengerAbstandZumAbsender <= 40))
        out.push(`der Empfänger pflanzt ${m.empfaengerAbstandZumAbsender} m vom Absender`);
    if (m.telemetrieImChat) out.push("Dorf-Telemetrie im Spieler-Chat");
    return out;
}

// Die V-k5-KLASSE: jede Op mit einem verlangten Ort, den es nicht gibt (near_water in trockener Welt), scheitert benannt
// („kein Wasser im Umkreis von 60 m", die Op im Eintrag), wirft nie, ändert die Welt nirgends; die chain meldet ehrlich; das
// Dorf ohne Ort gründet nie beim Spieler.
const ORT_OPS = [
    "spawn_creature",
    "spawn_tree",
    "spawn_studio",
    "spawn_island",
    "spawn_ufo",
    "spawn_village",
    "spawn_temple",
    "spawn_waterfall",
    "spawn_blueprint",
    "spawn_fractal",
    "deposit_life",
    "deposit_emotion",
];
function ortVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const soll = new RegExp(`kein Wasser im Umkreis von ${m.radius} m`);
    for (const op of ORT_OPS) {
        const e = m.ops && m.ops[op];
        if (!e) {
            out.push(`${op}: nicht gelaufen`);
            continue;
        }
        if (e.kalt) out.push(`${op}: Buch kalt (Vorbedingung)`);
        else if (e.fehler) out.push(`${op}: wirft (${e.fehler.slice(0, 80)})`);
        if (e.akte && e.akte.length)
            out.push(`${op}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`);
        if (!e.kalt && !(soll.test(e.grund || "") && e.effekt === op)) out.push(`${op}: scheitert nicht benannt`);
        if (e.ok) out.push(`${op}: meldet Erfolg`);
    }
    const c = m.chain;
    if (!c) out.push("chain: nicht gelaufen");
    else {
        if (c.ok) out.push("chain: meldet Erfolg ohne Ort");
        if (c.fehler) out.push(`chain: wirft (${c.fehler.slice(0, 80)})`);
        if (!(soll.test(c.grund || "") && c.effekt === "spawn_tree")) out.push("chain: nennt den Grund nicht");
        const spawns = (c.akte || []).filter((a) => a.nm !== "_depositLife");
        if (spawns.length) out.push(`chain: wirkt ohne Ort (${spawns.map((a) => a.nm).join(", ")})`);
        if (!(c.akte || []).some((a) => a.nm === "_depositLife")) out.push("chain: bricht ganz ab (der Feld-Akt beim Spieler fehlt)");
    }
    if (!m.buchWarm) out.push("dorf: Buch kalt (Vorbedingung)");
    if (m.dorfAuftraege > 0) out.push(`dorf ohne Ort gründet beim Spieler (${m.dorfAuftraege} Worker-Auftrag)`);
    if (m.dorfOhneOrt != null) out.push("dorf ohne Ort liefert ein Dorf");
    return out;
}

// Der REST der V-k5-KLASSE: jeder UNGÜLTIGE Ort (kein Knoten, at ohne Zahl, ein Text statt der Zahl eines Auflösers, kein
// Spieler) scheitert benannt an `dslEvalPos` — [Name, Programm, Soll-Grund (RegExp), die Op im Eintrag, ohne Spieler].
const KNOTEN = [
    ["Text statt Knoten (die KI ohne Klammern)", ["spawn_studio", "eiche", "near_water", 6], "^„near_water“ ist kein Ort-Knoten", "spawn_studio"],
    ["leerer Knoten", ["spawn_tree", [], 1, "eiche", 5], "^leerer Ort-Knoten", "spawn_tree"],
    ["Zahl statt Knoten", ["spawn_creature", 42, 1, "happy"], "^„42“ ist kein Ort-Knoten", "spawn_creature"],
    ["Objekt statt Knoten", ["spawn_ufo", { x: 3, z: 4 }], "ist kein Ort-Knoten", "spawn_ufo"],
    ["Text statt Knoten im Feld-Akt", ["deposit_life", "near_water", 0.5], "^„near_water“ ist kein Ort-Knoten", "deposit_life"],
    ["at ohne x und z", ["spawn_tree", ["at"], 1, "eiche", 5], "^at: x fehlt", "spawn_tree"],
    ["at mit Text", ["spawn_studio", "eiche", ["at", "abc", 0, "abc"], 1], "^at: x „abc“ ist keine Zahl", "spawn_studio"],
    ["at mit null (Number(null) === 0)", ["spawn_creature", ["at", null, 3, 5], 1, "happy"], "^at: x fehlt", "spawn_creature"],
    ["at ohne z", ["spawn_ufo", ["at", 12, 3]], "^at: z fehlt", "spawn_ufo"],
    ["at mit Text-Höhe", ["spawn_island", ["at", 5, "hoch", 5], 6, 7], "^at: y „hoch“ ist keine Zahl", "spawn_island"],
    ["near_water mit Text-Radius", ["spawn_tree", ["near_water", "abc"], 1, "eiche", 5], "^near_water: Radius „abc“ ist keine Zahl", "spawn_tree"],
    ["near_player mit Text-Radius", ["spawn_creature", ["near_player", "weit"], 1, "happy"], "^near_player: Radius „weit“ ist keine Zahl", "spawn_creature"],
    ["far_player ohne Abstände (das Dorf)", ["spawn_village", ["far_player"], 7], "^far_player: Mindest-Abstand fehlt", "spawn_village"],
    ["far_player mit Text-Höchstabstand", ["spawn_temple", ["far_player", 180, "weit"], 7], "^far_player: Höchst-Abstand „weit“ ist keine Zahl", "spawn_temple"],
    ["random_position mit Text-Spanne", ["spawn_ufo", ["random_position", "x"]], "^random_position: Spanne „x“ ist keine Zahl", "spawn_ufo"],
    ["at_player_forward mit Text-Abstand", ["spawn_tree", ["at_player_forward", "abc"], 1, "eiche", 5], "^at_player_forward: Abstand „abc“ ist keine Zahl", "spawn_tree"],
    ["at_field_need mit Text-Radius", ["deposit_life", ["at_field_need", "abc"], 0.5], "^at_field_need: Radius „abc“ ist keine Zahl", "deposit_life"],
    ["voxel_carve mit null-Koordinaten", ["voxel_carve", null, 50, null, 3], "^at: x fehlt", "voxel_carve"],
    ["voxel_fill mit leerem x", ["voxel_fill", "", 10, 5, 2], "^at: x „“ ist keine Zahl", "voxel_fill"],
    ["at_player ohne Spieler", ["spawn_tree", ["at_player"], 1, "eiche", 5], "^at_player: kein Spieler in der Welt", "spawn_tree", true],
    ["near_player ohne Spieler", ["spawn_creature", ["near_player", 10], 1, "happy"], "^near_player: kein Spieler in der Welt", "spawn_creature", true],
    ["Feld-Akt ohne Knoten und ohne Spieler", ["deposit_life"], "^at_player: kein Spieler in der Welt", "deposit_life", true],
    ["die nächste Kreatur ohne Spieler", ["creature_task_nearest", "wander"], "^at_player: kein Spieler in der Welt", "creature_task_nearest", true],
];
const KNOTEN_DEFAULT = { near_water: 60, at_player_forward: 5, at_field_need: 50 };
function knotenEintragOk(e, soll, effekt) {
    return !!e && !e.fehler && !(e.akte && e.akte.length) && !e.ok && new RegExp(soll).test(e.grund || "") && e.effekt === effekt;
}
function knotenVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const [name, , soll, effekt] of KNOTEN) {
        const e = m.laeufe && m.laeufe[name];
        if (!e) {
            out.push(`${name}: nicht gelaufen`);
            continue;
        }
        if (e.fehler) out.push(`${name}: wirft (${e.fehler.slice(0, 80)})`);
        if (e.akte && e.akte.length)
            out.push(`${name}: wirkt ohne Ort (${e.akte.map((a) => `${a.nm} ${a.abstand == null ? "ohne Ort" : a.abstand + " m vom Spieler"}`).join(", ")})`);
        if (!(new RegExp(soll).test(e.grund || "") && e.effekt === effekt))
            out.push(`${name}: scheitert nicht benannt (${e.grund ? `„${e.grund}“ an ${e.effekt}` : "kein Grund"})`);
        if (e.ok) out.push(`${name}: meldet Erfolg`);
    }
    const d = m.defaults || {};
    if (d.near_water !== `kein Wasser im Umkreis von ${KNOTEN_DEFAULT.near_water} m`)
        out.push(`near_water ohne Radius: „${d.near_water}“ (Soll ${KNOTEN_DEFAULT.near_water} m)`);
    for (const k of ["at_player_forward", "at_field_need"])
        if (!(Math.abs((d[k] == null ? NaN : d[k]) - KNOTEN_DEFAULT[k]) < 0.05))
            out.push(`${k} ohne Zahl: ${d[k]} m vom Spieler (Soll ${KNOTEN_DEFAULT[k]} m)`);
    if (m.messOrtOhneSpieler != null) out.push(`der Mess-Ort einer Regel ohne Spieler ist ${JSON.stringify(m.messOrtOhneSpieler)}`);
    if (m.ohneKnoten !== true) out.push(`ohne Knoten kein Default-Ort: ${m.ohneKnoten}`);
    const g = m.gesund || {};
    if (!(g.ok === true && g.akte === 1 && !g.grund)) out.push(`ein gültiger at-Knoten wirkt nicht (Vorbedingung: ${JSON.stringify(g)})`);
    return out;
}

// R2 — DIE WASSER-SUCHE: das Urteil des Lands `_landAt` ist bit-gleich zum vollen Spalten-Scan, und die dichte Ring-Suche
// scannt am trockenen Ort (kein Wasser im Kreis, der teuerste Fall) nicht mehr Spalten als die 8-Strahlen-Suche von
// cf9a07ba (8 je 4-m-Ring). Befund 6b988a07: 351/1330/8037 Spalten für 40/80/200 m.
const ALT8 = (R) => 8 * Math.floor(R / 4);
function sucheVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    const ex = m.exakt || {};
    if (!(ex.n >= 1000)) out.push(`zu wenig Urteile (${ex.n}, Vorbedingung)`);
    if (!(ex.nass > 0)) out.push("kein nasser Punkt in der Stichprobe (Vorbedingung)");
    if (ex.falsch > 0) out.push(`das Urteil weicht vom vollen Scan ab: ${ex.falsch} von ${ex.n} (${(ex.beispiele || []).join(" ")})`);
    for (const pfad of ["trinken", "chat", "ki", "ki@trocken-voll"]) {
        const z = (m.zaehlung || {})[pfad.includes("@") ? pfad : `${pfad}@trocken`];
        if (!z) {
            out.push(`${pfad}: nicht gezählt`);
            continue;
        }
        const s = z.hoch != null ? z.hoch : z.scans;
        if (!(s <= ALT8(z.R)))
            out.push(`${pfad} ${z.R} m: ${s} Spalten-Scans bei ${z.proben} Proben${z.hoch != null ? " (hochgerechnet)" : ""} (Soll ≤ ${ALT8(z.R)})`);
    }
    return out;
}

const server = statikServer();

// DER ZÄHLER DER TAKTE (Seite, vor dem ersten Skript): sobald der Loop steht, läuft er über diese Hülle — sie zählt jeden
// Takt, merkt den Takt der Kontrolle (`_weltbildDa`) und ruft je Takt die Probe der Station (`jeTakt`).
function TAKT_ZAEHLER() {
    const A = (window.__gang = { takte: 0, kontrolle: null, jeTakt: null, loop: null });
    const iv = setInterval(() => {
        const r = window.anazhRealm;
        const R = r && r.state && r.state.renderer;
        if (!R || typeof r._gameLoopTick !== "function" || typeof R.setAnimationLoop !== "function") return;
        clearInterval(iv);
        const loop = r._gameLoopTick;
        A.loop = (t) => {
            A.takte++;
            A.t = t; // die Zeit des Bilds (der Takt der Seite)
            loop(t);
            if (A.kontrolle == null && r.state._weltbildDa) A.kontrolle = A.takte;
            if (A.jeTakt) A.jeTakt();
        };
        // der Null-Renderer hat keinen Loop (sein setAnimationLoop ist leer): der Takt der Seite treibt ihn, ein Bild je Takt
        if (R._isHeadlessNull) requestAnimationFrame(function f(t) {
            A.loop(t);
            requestAnimationFrame(f);
        });
        else R.setAnimationLoop(A.loop);
    }, 1);
}

// ── DIE STATIONEN IN DER SEITE (Funktionsrumpf; r = die Welt, der Loop treibt sie, `tick(n)` wartet n seiner Takte). ──
async function probe(arg) {
    const { kiPort, soll: SOLL } = arg;
    const S = new Set(arg.stationen);
    const zugFrist = SOLL.zugMs + 2000; // die Frist des fremden Zugs, 2 s über dem Soll
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = { zeit: [], bilder: {} };
    const r = window.anazhRealm;
    const st = r.state;
    const R = st.renderer;
    const A = window.__gang;
    const marke = (n) => out.zeit.push((A.station = [n, Math.round(performance.now()), A.takte]));
    const tick = async (n) => {
        const z = A.takte + (n || 1);
        for (const dl = performance.now() + 120000; A.takte < z && performance.now() < dl; ) await sleep(4);
    };
    const taste = (art, key, code) => window.dispatchEvent(new KeyboardEvent(art, { key, code, bubbles: true }));
    const tippe = async (key, code) => (taste("keydown", key, code), taste("keyup", key, code), tick(2));
    // DAS BILD aus dem Ausgabe-Pfad (Satz „messung": der Schuss zeigt, was jetzt steht), der Loop ruht um den Schuss
    const [W, H] = [640, 360];
    // Die Aufnahme beginnt die Geschichte der zeitlichen Auflösung auch über eine 1×1-Größe ihres Ziels (der Neubeginn des
    // Vendor-TRAANode); der Zeit-Knoten des Stamms beginnt sie über `_traaR.neu` — die 1×1-Größe schuf das Ziel neu, ein Leser
    // band danach das zerstörte („Destroyed texture TRAANode.resolve", Spielgang 17.10., ~17 Takte nach dem Schuss beim
    // nächsten Sprung des Auges): im Gang bleibt das Ziel, wie es ist, und der Versatz des Laubs beginnt wie nach der Größe
    // mit dem ersten Frame (`_versatzIndex`, sonst unterschieden sich zwei Schüsse derselben Pose im Laub: Rauschen 0,011)
    const schuss = async () => {
        const z = st.traaNode && st.traaNode._historyRenderTarget;
        if (z) z.setSize = (w, h) => (w === 1 && h === 1 ? z : Object.getPrototypeOf(z).setSize.call(z, w, h));
        if (z) st.traaNode._versatzIndex = -1;
        try {
            return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
        } finally {
            if (z) delete z.setSize;
        }
    };
    const png = (u8) => {
        const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(W, H);
        img.data.set(u8.subarray(0, W * H * 4));
        ctx.putImageData(img, 0, 0);
        return cv.toDataURL("image/png");
    };
    // Je Schuss die Bühne (Mittag · Sonne · Sommer, die Bild-Uhr steht); danach spielt der Gang weiter: ihr Halt fällt — unter
    // der gehaltenen Wetter-Uhr verweigert das Spiel jeden Welt-Akt (`dslEval`, der Satz der Station Wort pflanzte nichts)
    const angehalten = async (fn) => {
        R.setAnimationLoop(null);
        try {
            window.__buehne();
            return await fn();
        } finally {
            st.weatherEffectTime = 0;
            const uhr = Object.getOwnPropertyDescriptor(r, "_bildZeit");
            if (uhr && uhr.get && uhr.get.__buehne) delete r._bildZeit;
            R.setAnimationLoop(A.loop);
        }
    };
    // ── ANKUNFT: Start → Kontrolle, das erste Bild, W trägt den Spieler; V-k4 der Fensterwechsel löst W ──
    marke("ankunft");
    try {
        const m = (out.ankunft = { gestartet: false, ms: Math.round(st._weltbildDa || 0), takte: A.kontrolle });
        m.ohne = (st.logBuffer || []).map(String).filter((z) => /Das erste Weltbild steht ohne/.test(z));
        m.ladeschirm = r._ladeschirmSteht();
        const p0 = st.playerMesh.position.clone();
        const weg = () => Math.hypot(st.playerMesh.position.x - p0.x, st.playerMesh.position.z - p0.z);
        const k0 = A.takte;
        taste("keydown", "w", "KeyW");
        for (let i = 0; i < 600 && weg() < SOLL.kontrolleM; i++) await tick(1);
        [m.weg, m.wegTakte] = [+weg().toFixed(2), A.takte - k0];
        const t = (out.taste = { gestartet: false, gedrueckt: st.keys.w === true });
        window.dispatchEvent(new Event("blur"));
        t.nachBlur = st.keys.w === true;
        taste("keyup", "w", "KeyW");
        // DAS BILD DER ANKUNFT, wenn sie aus der Ferne geglitten ist (`_ankunftGleit`, ANKUNFT_GLEIT_BILDER gezeichnete Bilder):
        // eine Aufnahme mitten im Gleiten zählte ihre Frames als Bilder des Gleitens mit
        for (let i = 0; i < 900 && st._ankunftGleit >= 0 && st._ankunftGleit < r.constructor.ANKUNFT_GLEIT_BILDER; i++) await tick(1);
        if (!R._isHeadlessNull)
            await angehalten(async () => {
                out.bilder.ankunft = png(await schuss());
            });
        t.gestartet = m.gestartet = true;
    } catch (e) {
        out.ankunft = Object.assign(out.ankunft || {}, { err: (e && e.stack) || String(e) });
    }
    if (S.has("lichtung")) marke("lichtung");
    // ── V-D1: die Ankunft ──
    if (S.has("lichtung")) try {
        const m = { gestartet: false };
        out.lichtung = m;
        const dl0b = performance.now() + 60000;
        while (performance.now() < dl0b && !st.architectures.some((a) => a && a.type === "start_plattform")) await tick(1, 100);
        const plat = st.architectures.find((a) => a && a.type === "start_plattform");
        if (!plat) throw new Error("keine Genesis-Plattform");
        const platR = st.blueprints.start_plattform.parts[0].size.x / 2;
        const P = plat.position;
        m.plattform = [+P.x.toFixed(1), +P.z.toFixed(1)];
        m.trocken = r._landAt(P.x, P.z, 0);
        r._ensureGenesisPlatform(); // die Spawn-Idempotenz liest `_genesisPlattform`: kein zweiter Leger legt eine zweite
        m.plattformen = st.architectures.filter((a) => a && a.type === "start_plattform").length;
        // Der Wald wächst um den Spieler: ticken, bis die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`; bis D3d
        // 150 s Wanduhr, bis die Bäume im 40-m-Kreis 15 Runden ruhten)
        const baeume = () =>
            st.architectures.filter((a) => a && /^baum_/.test(a.type) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 40);
        await window.__weltStehtNach(() => tick(1, 20));
        let kronen = 0,
            naechster = Infinity,
            art = null;
        const bs = baeume();
        for (const a of bs) {
            const d = Math.hypot(a.position.x - P.x, a.position.z - P.z);
            const krone = r._naturKrone(a.type, a);
            if (d < platR + krone) kronen++;
            if (d < naechster) {
                naechster = d;
                art = a.type;
            }
        }
        m.baeume = bs.length;
        m.kronen = kronen;
        m.naechsterStamm = Number.isFinite(naechster) ? +naechster.toFixed(2) : null;
        m.naechsteArt = art;
        // Der Genesis-Ring: der Kreis der Kern-Portale um den Genesis-Ort — im ECHTEN Spiel-Takt auf einem Gerät, dessen
        // Frame-Budget immer überschritten ist (die Radeon 890M der Werkbank: 160 von 160 Proben über 40 s):
        // `_frameOverBudget` steht fest auf wahr (das langsame Gerät).
        Object.defineProperty(st, "_frameOverBudget", { configurable: true, get: () => true, set: () => {} });
        try {
            // gewartet in Läufen des Genesis-Takts (`_tickGenesisOrt`, je Sekunde einer), nie in einer Zahl von Takten
            for (let n = 0, t = r._genesisOrtT, i = 0; n < 3 && i < 3000 && !(st.worldMeta && st.worldMeta.genesisPortalRing); i++) {
                await tick(1);
                if (r._genesisOrtT !== t) [t, n] = [r._genesisOrtT, n + 1];
            }
        } finally {
            delete st._frameOverBudget;
            st._frameOverBudget = false;
        }
        const ring = st.architectures.filter(
            (a) => a && /^welt_/.test(a.type) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 80
        );
        m.ringPortale = ring.length;
        if (ring.length) {
            const cx = ring.reduce((s2, a) => s2 + a.position.x, 0) / ring.length;
            const cz = ring.reduce((s2, a) => s2 + a.position.z, 0) / ring.length;
            m.ringMitteAbstand = +Math.hypot(cx - P.x, cz - P.z).toFixed(2);
        }
        m.gestartet = true;
    } catch (e) {
        out.lichtung = Object.assign(out.lichtung || {}, { err: (e && e.stack) || String(e) });
    }
    // ── FAHRT: ein Studio-Wagen vor dem Spieler, Aufstieg, der alte Mount-Follow, 100 m mit W, der Arm und das Bild; dann die
    // Sicht im Wechsel unter fester Lenkung und ein zweiter Wagen am Steilhang bergab; Abstieg ──
    if (S.has("fahrt")) {
        marke("fahrt");
        const m = (out.fahrt = { gestartet: false, typ: "fahrzeug_gt" });
        try {
            const pe = { type: m.typ, position: { x: 0, y: 0, z: 0 }, rotationY: 0, scale: 1, _fahrAchseX: true };
            const G = r._fahrSatz(pe, r._vehicleProfile(pe));
            if (!G) throw new Error(`kein Fahr-Gesetz für ${m.typ} (Buch kalt?)`);
            const k = r._fahrHuelleBau(pe, G);
            let e = null;
            const fahrt = () => (Number.isFinite(e.rotationY) ? e.rotationY : 0) + Math.PI / 2; // Studio-Wagen: Bug +x
            const grad = (a) => Math.round((Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 180) / Math.PI);
            // DER WAGEN, und E STEIGT EIN: die Welt stellt ihn hin (vor dem Spieler auf fahrbaren Grund, `_fahrPlatzSuche`; am
            // Hang genau), der Spieler tritt 1,5 m neben die Mitte an eine Flanke, an der E kein Tor erreicht (der Genesis-Ring
            // wächst, während der Gang fährt), und blickt in die Fahrt
            const steigEin = async (x, z, ry, precise) => {
                const flanke = async (px, pz, f, seite) => {
                    const [sx, sz] = [px + Math.cos(f) * 1.5 * seite, pz - Math.sin(f) * 1.5 * seite];
                    st.playerMesh.position.set(sx, r.getTerrainHeightAt(sx, sz) + 1.8, sz);
                    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    st.yaw = f;
                    await tick(12);
                    return r._findNearestAffordanceEntry("isPortal", r.constructor.PORTAL_REACH_M + 0.5);
                };
                if (precise) await flanke(x, z, ry, 1); // der Spieler geht hin: gezeichnet wird, was um ihn steht
                // ein Wagen späterer Orte trägt die Saat des ersten (derselbe Körper, kein neuer Bau im Faden des Studios)
                e = r.spawnArchitecture(m.typ, { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { rotationY: ry - Math.PI / 2, precise, seed: m.saat });
                if (!e) throw new Error(`die Welt stellt ${m.typ} bei ${Math.round(x)}/${Math.round(z)} nicht hin`);
                for (let i = 0; i < 900 && !r._archIsRendered(e); i++) await tick(1);
                if (!r._archIsRendered(e)) throw new Error(`${m.typ} bei ${Math.round(x)}/${Math.round(z)} nach 900 Takten ungezeichnet`);
                const tor = (await flanke(e.position.x, e.position.z, fahrt(), 1)) && (await flanke(e.position.x, e.position.z, fahrt(), -1));
                if (tor) throw new Error(`an ${m.typ} bei ${Math.round(x)}/${Math.round(z)} erreicht E das Tor ${tor.type}`);
                const vor = st.cameraMode;
                await tippe("e", "KeyE");
                for (let i = 0; i < 30 && st.player.mountedArch !== e.id; i++) await tick(1);
                if (st.player.mountedArch !== e.id) throw new Error(`E steigt nicht ein bei ${Math.round(x)}/${Math.round(z)} (${(st.logBuffer || []).slice(-2).join(" · ")})`);
                return vor;
            };
            const P = st.playerMesh.position.clone();
            m.sichtVor = await steigEin(P.x + Math.sin(st.yaw) * 8, P.z + Math.cos(st.yaw) * 8, st.yaw);
            m.saat = e.seed;
            m.bahn = [Math.round(e.position.x), Math.round(e.position.z), +fahrt().toFixed(2)];
            m.sichtRitt = st.cameraMode;
            // JE BILD IM RITT (die Probe nach dem Takt: der Wagen, wie er gezeichnet ist, und die Kamera, die ihn sah):
            //  · der Arm und wo er endet — am gerittenen Werk (seine Hülle im Fahrt-Rahmen um den Kugel-Radius der Kamera + 0,5 m;
            //    der Befund 17.10. stand 2,72 m hinter der Mitte, 0,17 m hinter der Hülle);
            //  · jede zeichnende Stufe (Primär `instSlots`, Band-Partner `instSlotsBand`) im Rahmen des Wagens: ihr Slot weicht vom
            //    ersten Blick auf ihn ab, wenn der Wagen fährt und die Stufe nicht (der starre Aufbau 0, das Rad federt um den Hub);
            //  · in Third die Kamera im Rahmen des gezeichneten Wagens: ihr SEITLICHER RUCK ist die zweite Differenz ihrer Quer-Lage je
            //    Bild (ein Folgen mit festem Nachlauf hat keinen), ihr Azimut gegen die Gier zählt in Bildern seit dem Wechsel nach
            //    Third, ihre Höhe ist der Winkel über der Ebene der Räder; der GLEICHLAUF ist der Weg des gezeichneten Wagens je Bild
            //    gegen das Tempo des Kerns.
            const rr = r.constructor._bewegungsBlock("kamera", ["armRadiusM"]).armRadiusM;
            const [M, V, erst] = [new THREE.Matrix4(), new THREE.Vector3(), new WeakMap()];
            let L = null; // der Lauf eines Abschnitts
            const lauf = () => (L = { arm: [], imWagen: 0, stufeWeg: 0, stufeTaeter: null, wechsel: [], c: [], ruck: [], hoch: [], gleich: [], sicht: st.cameraMode, fest: false });
            A.jeTakt = () => {
                if (!L || !e || st.player.mountedArch !== e.id) return;
                // DER GLEICHLAUF des gezeichneten Wagens: sein Weg je Bild durch die Zeit des Bilds gegen das Tempo des Kerns (1 =
                // er zeigt, wo die Physik ihn zu dieser Zeit hat; ein Bild mit zwei Sim-Schritten oder keinem bricht es)
                const v = e._fahr ? Math.hypot(e._fahr.vlong || 0, e._fahr.vlat || 0) : 0;
                const [p, t] = [[e.position.x, e.position.z], A.t];
                if (L.fest && L.p && t - L.t > 0 && t - L.t < 100 && v > 1) L.gleich.push(Math.hypot(p[0] - L.p[0], p[1] - L.p[1]) / ((t - L.t) / 1000) / v);
                [L.p, L.t] = [p, t];
                const f = fahrt();
                r._archEntryWorldMatrix(e, M);
                const oben = V.setFromMatrixColumn(M, 1).normalize().toArray();
                M.invert();
                for (const [liste, wer] of [[e.instSlots, `L${e._servedLod != null ? e._servedLod : e._lodLevel}`], [e.instSlotsBand, `L${e._lodBandLevel} (Band)`]])
                    for (const s of liste || []) {
                        const g = st.archInstanceGroups.get(s.key);
                        if (!g || !(s.slot >= 0)) continue;
                        const a = g.mesh.instanceMatrix.array;
                        V.set(a[s.slot * 16 + 12], a[s.slot * 16 + 13], a[s.slot * 16 + 14]).applyMatrix4(M);
                        if (!erst.has(s)) erst.set(s, V.clone());
                        const d = V.distanceTo(erst.get(s));
                        if (d > L.stufeWeg) [L.stufeWeg, L.stufeTaeter] = [d, wer];
                    }
                // IM BAND ZEIGT JEDE STUFE DASSELBE RAD: je Ecke (Nabe im Vorlagen-Raum) die Drehung (Lenkung, Rolle) des ersten
                // drehenden Teils in Primär und Partner — die größte Abweichung der Spalten (eine Stufe, die das Rad in der
                // Ruhe-Lage zeigt, weicht um Lenk- und Roll-Winkel ab)
                if (e.instSlotsBand && e.instSlots) {
                    const pr = r._foundryPresetForEntry(e);
                    const f0 = r._foundryFlattenFor(e, pr, e._servedLod != null ? e._servedLod : e._lodLevel);
                    const f1 = f0 && r._bandOhneZwilling(r._foundryFlattenFor(e, pr, e._lodBandLevel), f0);
                    const ecken = (f, liste) => {
                        const k = new Map();
                        (f ? f.leaves : []).forEach((lf, i) => {
                            const s = liste[i];
                            const g = s && lf.rad && lf.rad.dreht && st.archInstanceGroups.get(s.key);
                            const ecke = g && `${Math.round(lf.rad.hx * 20)}:${Math.round(lf.rad.hz * 20)}`;
                            if (ecke && !k.has(ecke)) k.set(ecke, new THREE.Matrix4().extractRotation(new THREE.Matrix4().fromArray(g.mesh.instanceMatrix.array, s.slot * 16)));
                        });
                        return k;
                    };
                    const [k0, k1] = [ecken(f0, e.instSlots), ecken(f1, e.instSlotsBand)];
                    for (const [ecke, a] of k0) {
                        const b = k1.get(ecke);
                        if (!b) continue;
                        const d = Math.max(...a.elements.map((x, i) => Math.abs(x - b.elements[i])));
                        [L.radN, L.radWeg] = [(L.radN || 0) + 1, Math.max(L.radWeg || 0, d)];
                    }
                }
                const third = st.cameraMode === "third";
                if (third !== (L.sicht === "third")) {
                    if (third) L.wechsel.push({ n: 0, ego: grad(f - L.egoAb) });
                    else L.egoAb = f;
                    [L.sicht, L.c.length] = [st.cameraMode, 0];
                }
                if (!third || !(st._kamArm >= 0)) return;
                const c = st.camera.position;
                const [dx, dz] = [c.x - e.position.x, c.z - e.position.z];
                const l = dx * Math.sin(f) + dz * Math.cos(f);
                const q = dx * Math.cos(f) - dz * Math.sin(f);
                L.arm.push(st._kamArm);
                if (l >= k.heck - rr - 0.5 && l <= k.bug + rr + 0.5 && Math.abs(q) <= k.hw + rr + 0.5) L.imWagen++;
                const w = L.wechsel[L.wechsel.length - 1];
                const n = w ? ++w.n : Infinity;
                if (n === 10) w.nach10 = grad(Math.atan2(-dx, -dz) - f);
                L.c.push(q);
                // die Höhe der Kamera über der Fahrbahn: ihr Winkel über der Ebene des Wagens (Gesetz: die Elevation der Chase-Cam)
                const ab = Math.hypot(dx, c.y - e.position.y, dz);
                if (L.fest) L.hoch.push((Math.asin((dx * oben[0] + (c.y - e.position.y) * oben[1] + dz * oben[2]) / ab) * 180) / Math.PI);
                const [q0, q1, q2] = L.c.slice(-3);
                if (L.c.length > 2 && L.fest && n > 15) L.ruck.push(Math.abs(q2 - 2 * q1 + q0));
            };
            const schluss = () => {
                const a = L.arm.slice().sort((x, y) => x - y);
                const s = L.ruck.slice().sort((x, y) => x - y);
                let [schnapp, armWeg] = [0, 0];
                for (let i = 1; i < L.arm.length; i++) [schnapp, armWeg] = [schnapp + (L.arm[i] - L.arm[i - 1] < -SOLL.schnapp), armWeg + Math.abs(L.arm[i] - L.arm[i - 1])];
                const n = { armN: a.length, armP50: +(a[a.length >> 1] || 0).toFixed(3), armMin: +(a[0] || 0).toFixed(3), imWagen: L.imWagen, stufeWeg: +L.stufeWeg.toFixed(1), stufeTaeter: L.stufeTaeter };
                Object.assign(n, { wechsel: L.wechsel.map((w) => [w.ego, w.nach10]), ruckN: s.length, ruckP95: +(s[Math.floor(s.length * 0.95)] || 0).toFixed(3), schnapp, armWeg: +armWeg.toFixed(2) });
                const h = L.hoch.slice().sort((x, y) => x - y);
                n.hochP05 = +(h[Math.floor(h.length * 0.05)] || 0).toFixed(1);
                const g = L.gleich.map((x) => Math.abs(x - 1)).sort((x, y) => x - y);
                [n.gleichN, n.gleichP95] = [g.length, +(g[Math.floor(g.length * 0.95)] || 0).toFixed(3)];
                [n.radN, n.radWeg] = [L.radN || 0, +(L.radWeg || 0).toFixed(3)];
                L = null;
                return n;
            };
            // DER WAGEN IM BILD (die Klassen-Teilung der Abnahme): dieselbe Pose mit und ohne Wagen, sein Wurf aus in beiden
            const wagenBild = async (name) =>
                R._isHeadlessNull ? { bild: false } : angehalten(async () => {
                    const gr = new Set([...(e.instSlots || []), ...(e.instSlotsBand || [])].map((s) => (st.archInstanceGroups.get(s.key) || {}).mesh).filter(Boolean));
                    if (e.mesh) gr.add(e.mesh);
                    const alt = [...gr].map((o) => [o, o.visible, o.castShadow]);
                    const bundles = () => st.scene.traverse((o) => o.isBundleGroup && (o.needsUpdate = true));
                    const auf = async (ohne) => {
                        for (const [o, v] of alt) o.visible = ohne ? false : v;
                        bundles();
                        r._schattenAlleNeu();
                        return schuss();
                    };
                    try {
                        for (const o of gr) o.castShadow = false;
                        const [G1, G2, O] = [await auf(false), await auf(false), await auf(true)];
                        const { teil } = window.__klassenTeilung(G1, [O], W, H, 18);
                        out.bilder[name] = png(G1);
                        return { anteil: +(teil.reduce((s, x) => s + (x === 1), 0) / (W * H)).toFixed(4), rauschen: window.__bildRauschen(G1, G2, W, H, 18).anteil, teile: gr.size };
                    } finally {
                        for (const [o, v, c] of alt) [o.visible, o.castShadow] = [v, c];
                        bundles();
                    }
                });
            // DER SELBSTTEST IM LAUF: die ersten 20 m fährt der alte Mount-Follow (`_archInstanceUpdate` ohne den Band-Partner,
            // der Stand vor SG1) — der Aufbau muss am Ort des Aufstiegs stehen bleiben und das Urteil ROT beim Namen werden
            if (Object.prototype.hasOwnProperty.call(r, "_archInstanceUpdate")) throw new Error("_archInstanceUpdate ist schon eingespielt");
            const folger = r._archInstanceUpdate;
            r._archInstanceUpdate = function (entry) {
                const band = entry.instSlotsBand;
                entry.instSlotsBand = null;
                try {
                    return folger.call(this, entry);
                } finally {
                    entry.instSlotsBand = band;
                }
            };
            // DIE FAHRT wie ein Spieler: W, und er lenkt (A/D) in die freieste Richtung vor dem Bug (am Hang um die Falllinie) —
            // je 4 Takte die Boxen der Werke im 30-m-Kreis (lazy `_populateBlockerAABBs`), die unter dem Dach in das Band der halben
            // Wagen-Breite + 0,4 m ragen, je Richtung ±40° die freie Strecke bis 25 m (eine Wende kostet). Welche Taste die Gier
            // hebt, lernt er an der ersten Lenkung; steht der Wagen 40 Takte, setzt er 60 Takte mit S zurück. Um die Lichtung steht
            // Wald: eine gerade Bahn fuhr am 17.10. nach 51–64 m in Kiefer und Birke.
            let [pfad, lenk, hebt, ziel, boxen] = [0, null, "a", 0, []];
            const lenke = (soll) => {
                if (lenk !== soll) {
                    if (lenk) taste("keyup", lenk, `Key${lenk.toUpperCase()}`);
                    if (soll) taste("keydown", soll, `Key${soll.toUpperCase()}`);
                    lenk = soll;
                }
            };
            const sammle = () =>
                st.architectures.flatMap((a) => {
                    if (!a || a === e || !a.position || Math.hypot(a.position.x - e.position.x, a.position.z - e.position.z) > 30) return [];
                    if (!a.blockerAABBs) r._populateBlockerAABBs(a);
                    return (a.blockerAABBs || []).filter((b) => !(b.botY > r.getTerrainHeightAt((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2) + 1.6) && !(b.dick < 0.12));
                });
            const freiBis = (h, [x0, z0] = [e.position.x, e.position.z], weit = 25) => {
                const [fx, fz] = [Math.sin(h), Math.cos(h)];
                let frei = weit;
                for (const b of boxen) {
                    const ec = [[b.minX, b.minZ], [b.minX, b.maxZ], [b.maxX, b.minZ], [b.maxX, b.maxZ]].map(([px, pz]) => [(px - x0) * fx + (pz - z0) * fz, (px - x0) * fz - (pz - z0) * fx]);
                    const [t0, t1] = [Math.min(...ec.map((c) => c[0])), Math.max(...ec.map((c) => c[0]))];
                    const [q0, q1] = [Math.min(...ec.map((c) => c[1])), Math.max(...ec.map((c) => c[1]))];
                    if (t1 > 0 && q1 > -k.hw - 0.4 && q0 < k.hw + 0.4) frei = Math.min(frei, Math.max(0, t0));
                }
                return frei;
            };
            let [still, zurueck, lernt] = [0, 0, null];
            const fahre = async (bis, um) => {
                for (let i = 0; i < 6000 && pfad < bis; i++) {
                    if (i % 4 === 0 && !zurueck) {
                        boxen = sammle();
                        let best = -Infinity;
                        for (let dh = -40; dh <= 40; dh += 10) {
                            const h = (um != null ? um : fahrt()) + (dh * Math.PI) / 180;
                            const wert = freiBis(h) - Math.abs(dh) * 0.05;
                            if (wert > best) [best, ziel] = [wert, h];
                        }
                    }
                    const [x0, z0, g0] = [e.position.x, e.position.z, fahrt()];
                    L.fest = !zurueck && i > 30;
                    await tick(1);
                    const d = Math.hypot(e.position.x - x0, e.position.z - z0);
                    pfad += d;
                    still = d < 0.005 ? still + 1 : 0;
                    const dg = Math.atan2(Math.sin(fahrt() - g0), Math.cos(fahrt() - g0));
                    if (lenk && !zurueck && Math.abs(dg) > 0.002) lernt = (lernt || 0) + (lenk === hebt ? dg : -dg);
                    if (lernt !== null && lernt < -0.05) [hebt, lernt] = [hebt === "a" ? "d" : "a", 0];
                    if (still > 40 && !zurueck) {
                        [zurueck, still] = [60, 0];
                        lenke(null);
                        taste("keyup", "w", "KeyW");
                        taste("keydown", "s", "KeyS");
                    } else if (zurueck && --zurueck === 0) {
                        taste("keyup", "s", "KeyS");
                        taste("keydown", "w", "KeyW");
                    }
                    if (zurueck) continue;
                    const fehl = Math.atan2(Math.sin(fahrt() - ziel), Math.cos(fahrt() - ziel)); // positiv: die Gier muss fallen
                    lenke(fehl > 0.03 ? (hebt === "a" ? "d" : "a") : fehl < -0.03 ? hebt : null);
                }
            };
            // DER WECHSEL UNTER FESTER LENKUNG (Befund des Schöpfers 17.10.: Ego ↔ Third in der Fahrt — in Third der Wagen
            // unsichtbar oder an alter Stelle, Third ruckelt quer): der Spieler hält die Lenkung bei Schritt-Tempo (W unter
            // `kreisMs`, S über dem 1,5-fachen) und wechselt mit V je `wechselS` Spiel-Sekunden Third → Ego → Third → Ego → Third.
            const kreise = async () => {
                let pedal = null;
                for (let w = 0; w < 4; w++) {
                    await tippe("v", "KeyV");
                    for (let t0 = st._fixedSimTime, i = 0; i < 3000 && st._fixedSimTime - t0 < SOLL.wechselS; i++) {
                        const v = Math.abs((e._fahr && e._fahr.vlong) || 0);
                        const soll = v < SOLL.kreisMs ? "w" : v > 1.5 * SOLL.kreisMs ? "s" : null;
                        if (soll !== pedal) [pedal && taste("keyup", pedal, `Key${pedal.toUpperCase()}`), soll && taste("keydown", soll, `Key${soll.toUpperCase()}`), (pedal = soll)];
                        lenke(hebt);
                        L.fest = st._fixedSimTime - t0 > 0.5;
                        await tick(1);
                    }
                }
                if (pedal) taste("keyup", pedal, `Key${pedal.toUpperCase()}`);
                L.fest = false;
            };
            const halt = async () => {
                lenke(null);
                taste("keyup", "w", "KeyW");
                taste("keydown", "s", "KeyS"); // die Bremse bis zum Stand
                for (let i = 0, still = 0; i < 900 && still < 20; i++) {
                    const [x0, z0] = [e.position.x, e.position.z];
                    await tick(1);
                    still = Math.hypot(e.position.x - x0, e.position.z - z0) < 0.002 ? still + 1 : 0;
                }
                taste("keyup", "s", "KeyS");
                await tippe("e", "KeyE");
                for (let i = 0; i < 30 && st.player.mountedArch === e.id; i++) await tick(1);
            };
            const k0 = A.takte;
            taste("keydown", "w", "KeyW");
            try {
                try {
                    lauf();
                    await fahre(20);
                    out.fahrtAlt = Object.assign({}, m, { gestartet: true, weg: +pfad.toFixed(1) }, schluss(), await wagenBild("fahrt-alter-folger"));
                } finally {
                    delete r._archInstanceUpdate;
                }
                lauf();
                await fahre(SOLL.fahrM);
                [m.weg, m.fahrTakte] = [+pfad.toFixed(1), A.takte - k0];
                Object.assign(m, schluss(), await wagenBild("fahrt"));
            } finally {
                await halt();
            }
            [m.abgestiegen, m.sichtNach] = [st.player.mountedArch == null, st.cameraMode];
            // DIE ORTE DER ÜBERGÄNGE in Ringen um den Abstieg (je 10 m): ein freier Platz für den Kreis (kein Bau, kein Baum im
            // Kreis von `kreisM`, eben auf ±1,5 m, Land) und der nächste STEILHANG (Befund 17.10.: „am Steilhang bergab folgt die
            // Kamera komisch"), dessen Falllinie über `hangM` Meter je 5 m um ≥ `hangMin` fällt (im Mittel ≥ `hangMittel`) und
            // keinen Bau im Band des Wagens kreuzt. Je Ort ein Wagen, wie ihn ein Spieler hinstellt (der Hang genau, der Bug bergab).
            const [hx, hz] = [e.position.x, e.position.z];
            boxen = st.architectures.flatMap((a) => (a && a.position && Math.hypot(a.position.x - hx, a.position.z - hz) < 400 ? (a.blockerAABBs || (r._populateBlockerAABBs(a), a.blockerAABBs) || []) : []));
            // E betritt ein Tor in seiner Reichweite (`_fahrStandFrei` „tor"): kein Ort im Kreis der Tore
            const torFrei = r.constructor.PORTAL_REACH_M + r.constructor.MOUNT_RANGE_M + 2;
            const ort = (wahl) => {
                const tore = st.architectures.filter((a) => a && a.position && a.affordances && a.affordances.isPortal);
                for (let rad = 10; rad <= 300; rad += 10)
                    for (let i = 0, n = Math.round((2 * Math.PI * rad) / 10); i < n; i++) {
                        const [x, z] = [hx + Math.sin((i / n) * 2 * Math.PI) * rad, hz + Math.cos((i / n) * 2 * Math.PI) * rad];
                        const o = r._landAt(x, z, 0) && !tore.some((t) => Math.hypot(t.position.x - x, t.position.z - z) < torFrei) && wahl(x, z, r.getTerrainHeightAt(x, z));
                        if (o) return Object.assign(o, { x, z, ort: [Math.round(x), Math.round(z)] });
                    }
                return null;
            };
            const kreisOrt = ort((x, z, y) =>
                !boxen.some((b) => Math.max(b.minX - x, 0, x - b.maxX) ** 2 + Math.max(b.minZ - z, 0, z - b.maxZ) ** 2 < SOLL.kreisM ** 2) &&
                [0, 1, 2, 3, 4, 5, 6, 7].every((j) => Math.abs(r.getTerrainHeightAt(x + Math.sin((j * Math.PI) / 4) * SOLL.kreisM, z + Math.cos((j * Math.PI) / 4) * SOLL.kreisM) - y) < 1.5) && { d: 0 }
            );
            m.wechsel = { ort: kreisOrt && kreisOrt.ort };
            if (kreisOrt) {
                await steigEin(kreisOrt.x, kreisOrt.z, 0, true);
                try {
                    lauf();
                    await kreise();
                    Object.assign(m.wechsel, schluss(), await wagenBild("fahrt-wechsel"));
                } finally {
                    await halt();
                }
            }
            const hang = ort((x, z, y) => {
                for (let j = 0; j < 16; j++) {
                    const d = (j / 16) * 2 * Math.PI;
                    let [min, alt] = [Infinity, y];
                    for (let s = 5; s <= SOLL.hangM && min >= SOLL.hangMin; s += 5) {
                        const h = r.getTerrainHeightAt(x + Math.sin(d) * s, z + Math.cos(d) * s);
                        [min, alt] = [Math.min(min, (alt - h) / 5), h];
                    }
                    const g = (y - alt) / SOLL.hangM;
                    if (min >= SOLL.hangMin && g >= SOLL.hangMittel && freiBis(d, [x - Math.sin(d) * 6, z - Math.cos(d) * 6], SOLL.hangM + 6) >= SOLL.hangM + 6) return { d, gefaelle: +g.toFixed(2) };
                }
                return null;
            });
            m.hang = { gefaelle: hang ? hang.gefaelle : 0, ort: hang && hang.ort };
            if (hang) {
                await steigEin(hang.x, hang.z, hang.d, true);
                [pfad, ziel] = [0, hang.d];
                taste("keydown", "w", "KeyW");
                try {
                    lauf();
                    await fahre(SOLL.hangM, hang.d);
                    Object.assign(m.hang, { weg: +pfad.toFixed(1) }, schluss(), await wagenBild("fahrt-hang"));
                } finally {
                    await halt();
                }
            }
            m.gestartet = true;
        } catch (e) {
            Object.assign(m, { err: (e && e.stack) || String(e), grund: String((e && e.message) || e) });
        } finally {
            A.jeTakt = null;
        }
    }
    if (S.has("wort")) marke("wort");
    // ── V-D6: der KI-Fehler nennt die Ursache ──
    if (S.has("wort")) try {
        const m = { gestartet: false };
        out.ki = m;
        const llm = st.llm;
        const alt = {
            enabled: llm.enabled,
            provider: llm.provider,
            ep: llm.providerConfig.ollama.endpoint,
            px: llm.providerConfig.ollama.useProxy,
            last: llm.lastResponseAt,
        };
        llm.enabled = true;
        llm.provider = "ollama";
        llm.providerConfig.ollama.endpoint = "http://127.0.0.1:" + kiPort;
        llm.providerConfig.ollama.useProxy = false;
        llm.lastResponseAt = -1e9;
        let antwort = null;
        try {
            antwort = await r.llmCall("hallo welt");
        } finally {
            llm.enabled = alt.enabled;
            llm.provider = alt.provider;
            llm.providerConfig.ollama.endpoint = alt.ep;
            llm.providerConfig.ollama.useProxy = alt.px;
            llm.lastResponseAt = alt.last;
        }
        m.fehler = antwort && antwort.error ? String(antwort.error) : null;
        m.host = "127.0.0.1:" + kiPort;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-k5 · V-k6 · V-D8: der Satz trifft die Welt ──
    if (S.has("wort")) try {
        const m = { gestartet: false };
        out.satz = m;
        const pm = st.playerMesh.position;
        const ausgabe = document.getElementById("chat-output");
        const letzteZeile = () => (ausgabe && ausgabe.lastElementChild ? ausgabe.lastElementChild.textContent : "");
        const nass = (x, z) => !r._landAt(x, z, 0.2);
        // Ein Ort ohne Wasser im 84-m-Kreis (eigenes 4-m-Raster, unabhängig von der Such-Funktion des Spiels).
        const trockenUm = (x, z) => {
            for (let dz = -84; dz <= 84; dz += 4)
                for (let dx = -84; dx <= 84; dx += 4) if (dx * dx + dz * dz <= 84 * 84 && nass(x + dx, z + dz)) return false;
            return true;
        };
        let ort = null;
        // K16 (das Flussnetz-Gelände): die Plattform selbst ist trocken (das nächste Wasser 292 m) — der Ort liegt außerhalb
        // ihrer Lichtung (`_grundrissVon`, + 30 m für die Kronen des Satzes), sonst pflanzt der Absender nichts.
        const platz = st.architectures.find((a) => a && a.type === "start_plattform");
        const licht = platz && r._grundrissVon(platz);
        const frei = (x, z) =>
            !licht || Math.hypot(x - platz.position.x, z - platz.position.z) > (licht.lichtung || 0) + 30;
        // ...und der Satz pflanzt dort (der Gang endet die Fahrt an jedem Ort, auch im Dorf: die Wand der Natur `_naturWand`
        // — Grundriss, Weg, Platz, Acker — schweigt im 12-m-Kreis, sonst wuchs „vor dir" keine Birke)
        const pflanzbar = (x, z) =>
            [[0, 0], [12, 0], [-12, 0], [0, 12], [0, -12], [8, 8], [-8, 8], [8, -8], [-8, -8]].every(
                ([dx, dz]) => !r._naturWand("baum_birke", { x: x + dx, y: r._voxelSurfaceY(x + dx, z + dz), z: z + dz })
            );
        for (const [x, z] of [[pm.x, pm.z], [200, 200], [-200, 200], [200, -200], [-200, -200], [400, 0], [0, 400], [-400, 0]]) {
            if (frei(x, z) && r._landAt(x, z, 1) && trockenUm(x, z) && pflanzbar(x, z)) {
                ort = { x, z };
                break;
            }
        }
        m.trockenOrt = ort;
        const setze = (x, z) => {
            pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            st.yaw = 0;
        };
        // neu ist, was vorher nicht stand (der laufende Loop pflanzt und räumt den Wald: ein neues Werk füllt eine Lücke)
        const neue = (vorher, typ) => st.architectures.filter((a) => a && a.type === typ && !vorher.has(a));
        if (ort) {
            setze(ort.x, ort.z);
            const v0 = new Set(st.architectures);
            r.processChatCommand("pflanz mir einen eichenhain am wasser");
            const n0 = neue(v0, "baum_eiche");
            m.amWasserOhneWasser = n0.length;
            m.amWasserZeile = letzteZeile();
            for (const a of n0.reverse()) r.removeArchitecture(a);
        }
        // V-D8 + V-k6: „pflanz mir zwei birken" beim Absender — das Label im Chat, der Ort reist aufgelöst.
        const p2p = st.p2p;
        const p2pAlt = { enabled: p2p.enabled, connected: p2p.connected };
        const sendAlt = r.p2pSend;
        const gesendet = [];
        p2p.enabled = true;
        p2p.connected = true;
        r.p2pSend = (o) => gesendet.push(o);
        const sx = ort ? ort.x : pm.x,
            sz = ort ? ort.z : pm.z;
        setze(sx, sz);
        const v1 = new Set(st.architectures);
        try {
            r.processChatCommand("pflanz mir zwei birken");
        } finally {
            r.p2pSend = sendAlt;
            p2p.enabled = p2pAlt.enabled;
            p2p.connected = p2pAlt.connected;
        }
        const nB = neue(v1, "baum_birke");
        m.birkenAbsender = nB.length;
        m.birkenZeile = letzteZeile();
        m.birkenLabel = (st.blueprints.baum_birke && st.blueprints.baum_birke.label) || null;
        const msg = gesendet.find((o) => o && o.type === "dsl");
        m.gesendet = !!msg;
        m.ortKnoten = msg && Array.isArray(msg.program) ? JSON.stringify(msg.program[2]) : null;
        for (const a of nB.slice().reverse()) r.removeArchitecture(a);
        // Der Empfänger steht 200 m weiter: seine Birken stehen dort, wo der Absender sie wollte.
        if (msg) {
            setze(sx + 200, sz);
            const v2 = new Set(st.architectures);
            r._p2pMsgDsl({ type: "dsl", peerId: "peer-empfaenger-probe", program: msg.program }, { peerId: "self" });
            const nE = neue(v2, "baum_birke");
            m.birkenEmpfaenger = nE.length;
            m.empfaengerAbstandZumAbsender = nE.length
                ? +Math.max(...nE.map((a) => Math.hypot(a.position.x - sx, a.position.z - sz))).toFixed(1)
                : null;
            for (const a of nE.reverse()) r.removeArchitecture(a);
        }
        setze(sx, sz);
        // V-D8: die Dorf-Zählung bleibt im Log.
        const z0 = ausgabe ? ausgabe.childElementCount : 0;
        // die Signatur des Akts (welle-m-nexus): das Ergebnis des Dorfs und die Quelle, die es verlangt (der Spieler)
        r._nachDorfOrientieren({ placed: 1, haeuser: [], mitte: { x: sx, z: sz } }, "human");
        const neuZeilen = ausgabe ? Array.from(ausgabe.children).slice(z0).map((c) => c.textContent) : [];
        m.telemetrieImChat = neuZeilen.some((t) => /Bauten n=/.test(t));
        m.gestartet = true;
    } catch (e) {
        out.satz = Object.assign(out.satz || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-k5-KLASSE: jede Op, deren verlangter Ort fehlt, scheitert benannt — an dem trockenen Ort der Satz-Probe ──
    if (S.has("wort")) try {
        const m = { gestartet: false, ops: {} };
        out.ort = m;
        const ort = out.satz && out.satz.trockenOrt;
        if (!ort) throw new Error("kein Ort ohne Wasser im 84-m-Kreis (Vorbedingung)");
        const pm = st.playerMesh.position;
        pm.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
        st.yaw = 0;
        // Beobachtungs-Punkte: jeder Welt-Akt einer Op (er wird aufgezeichnet und läuft weiter); das Dorf und der Voxel-Edit
        // werden nur aufgezeichnet (der Dorf-Bau ist ein Worker-Rundlauf, ein Edit gräbt die Mess-Welt um — gezählt wird,
        // ob eine Op ohne Ort wirken will); die nächste Kreatur wird mit ihrem Bezugs-Ort aufgezeichnet.
        const akte = [];
        const ortVon = {
            spawnCreatureAt: (a) => ({ x: a[0], z: a[2] }),
            spawnArchitecture: (a) => a[1] || null,
            spawnIslandAt: (a) => ({ x: a[0], z: a[2] }),
            spawnUfoAt: (a) => ({ x: a[0], z: a[2] }),
            spawnSettlement: (a) => (a[0] && a[0].position) || null,
            _depositLife: (a) => ({ x: a[0], z: a[1] }),
            _depositEmotion: (a) => ({ x: a[0], z: a[1] }),
            carveVoxelSphere: (a) => ({ x: a[0], z: a[2] }),
            fillVoxelSphere: (a) => ({ x: a[0], z: a[2] }),
            assignTaskToNearestCreature: (a) => a[0] || null,
        };
        const nurAufzeichnen = { spawnSettlement: () => Promise.resolve(null), carveVoxelSphere: () => {}, fillVoxelSphere: () => {} };
        const alt = {};
        for (const nm of Object.keys(ortVon)) {
            alt[nm] = r[nm];
            r[nm] = function (...a) {
                const p = ortVon[nm](a);
                akte.push({ nm, abstand: p && Number.isFinite(p.x) ? +Math.hypot(p.x - pm.x, p.z - pm.z).toFixed(1) : null });
                return nurAufzeichnen[nm] ? nurAufzeichnen[nm]() : alt[nm].apply(this, a);
            };
        }
        const NW = ["near_water", 60];
        const baum = Object.keys(st.blueprints).find((k) => k.startsWith("baum_")) || "baum_eiche";
        const OPS = [
            ["spawn_creature", NW, 2, "happy"],
            ["spawn_tree", NW, 2, "eiche", 5],
            ["spawn_studio", "eiche", NW, 3, 5],
            ["spawn_island", NW, 10, 5, 12],
            ["spawn_ufo", NW],
            ["spawn_village", NW, 7],
            ["spawn_temple", NW, 7],
            ["spawn_waterfall", NW, 7],
            ["spawn_blueprint", baum, NW, 7],
            ["spawn_fractal", NW, "temple", 0, 0.5, 7],
            ["deposit_life", NW, 0.5],
            ["deposit_emotion", "joy", 0.5, NW],
        ];
        const lauf = (prog) => {
            const a0 = akte.length;
            const res = r.dslRun(prog, { source: "test" });
            const ohne = res.log.find((e) => e.event === "invalid_position");
            const wurf = res.log.find((e) => /exception/.test(e.event));
            return {
                ok: res.ok,
                grund: ohne ? ohne.grund || null : null,
                effekt: ohne ? ohne.effekt || null : null,
                fehler: wurf ? `${wurf.event}: ${wurf.message}` : null,
                kalt: res.log.some((e) => e.event === "skipped"),
                akte: akte.slice(a0),
            };
        };
        try {
            for (const prog of OPS) m.ops[prog[0]] = lauf(prog);
            // Die chain bricht genau die Op ohne Ort ab, läuft weiter (der Feld-Akt beim Spieler) und meldet ehrlich.
            m.chain = lauf(["chain", ["spawn_tree", NW, 1, "eiche", 5], ["deposit_life", ["at_player"], 0.1]]);
            // DER REST DER KLASSE: jeder ungültige Ort (kein Knoten, at ohne Zahl, Text statt Zahl, kein Spieler) — je
            // Programm durch `dslRun`; „ohne Spieler" nimmt den Spieler-Leib für genau diesen Lauf aus der Welt (synchron,
            // kein Takt dazwischen).
            const k = { gestartet: false, laeufe: {} };
            out.knoten = k;
            try {
                const leib = st.playerMesh;
                const ohneSpieler = (fn) => {
                    st.playerMesh = null;
                    try {
                        return fn();
                    } finally {
                        st.playerMesh = leib;
                    }
                };
                for (const [name, prog, ohne] of (arg && arg.knoten) || []) k.laeufe[name] = ohne ? ohneSpieler(() => lauf(prog)) : lauf(prog);
                // Die Defaults der Auflöser: ein FEHLENDER Radius/Abstand ist der dokumentierte, nie die Untergrenze.
                const grundVon = (node) => {
                    try {
                        r.dslEvalPos(node, r.dslCtx({ source: "test" }));
                        return null;
                    } catch (e) {
                        return e && e.dslKeinOrt ? e.dslKeinOrt.grund : String(e);
                    }
                };
                const abstandVon = (node) => {
                    const q = r.dslEvalPos(node, r.dslCtx({ source: "test" }));
                    return +Math.hypot(q.x - pm.x, q.z - pm.z).toFixed(2);
                };
                k.defaults = {
                    near_water: grundVon(["near_water"]),
                    at_player_forward: abstandVon(["at_player_forward"]),
                    at_field_need: abstandVon(["at_field_need"]),
                };
                // Ohne Knoten (node == null) der Default-Spawn: ein Ort, kein Wurf.
                k.ohneKnoten = grundVon(null) || [r.dslEvalPos(null, r.dslCtx({ source: "test" }))].every((q) => [q.x, q.y, q.z].every(Number.isFinite));
                // Der Mess-Ort einer Regel ohne Positions-Knoten (Wetter) ohne Spieler: keiner — nie der Ursprung.
                k.messOrtOhneSpieler = ohneSpieler(() => r._ruleRewardPos(["weather", "sunny"], r.dslCtx({ source: "test" })));
                // Gegenprobe: ein gültiger at-Knoten wirkt genau einmal.
                const g = lauf(["deposit_life", ["at", pm.x + 3, pm.y, pm.z + 4], 0.1]);
                k.gesund = { ok: g.ok, akte: g.akte.length, grund: g.grund };
                k.gestartet = true;
            } catch (e) {
                k.err = (e && e.stack) || String(e);
            }
        } finally {
            for (const nm of Object.keys(alt)) r[nm] = alt[nm];
        }
        // Das Dorf selbst: ein verlangter, fehlender Ort gründet nie beim Spieler (der Worker-Auftrag ist der
        // Beobachtungs-Punkt; die Absage kommt vor ihm).
        const anfrage = r._foundryRequestSettlement;
        let auftraege = 0;
        r._foundryRequestSettlement = function () {
            auftraege++;
            return Promise.resolve(null);
        };
        m.buchWarm = !!(r._foundry && r._foundry.ready && r._foundry.recipes);
        try {
            m.dorfOhneOrt = await r.spawnSettlement({ position: null, seed: 7, nH: 9 });
        } finally {
            r._foundryRequestSettlement = anfrage;
        }
        m.dorfAuftraege = auftraege;
        m.radius = NW[1];
        m.gestartet = true;
    } catch (e) {
        out.ort = Object.assign(out.ort || {}, { err: (e && e.stack) || String(e) });
    }
    // ── R2: DIE WASSER-SUCHE SCANNT NUR, WO WASSER SEIN KANN — gezählt werden Spalten-Scans (`_voxelSurfaceY`) ──
    if (S.has("wort")) try {
        const m = { gestartet: false, zaehlung: {} };
        out.suche = m;
        const ort = out.satz && out.satz.trockenOrt;
        if (!ort) throw new Error("kein Ort ohne Wasser im 84-m-Kreis (Vorbedingung)");
        const plat = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = plat ? { x: plat.position.x, z: plat.position.z } : { x: 0, z: 0 };
        const scan = r._voxelSurfaceY;
        const urteil = r._landAt;
        // (a) Das Urteil gegen den vollen Spalten-Scan (die Referenz, wie bis 06.10. gerechnet): 3 Margen, je 400 Punkte
        //     um den trockenen Ort, die Plattform und das nächste Wasser (deterministischer Zufall).
        const ref = (x, z, mg) => {
            const s = scan.call(r, x, z);
            // die Definition des Lands ohne Beweise: über dem gezeichneten Wasser am Körper UND über dem des Gesetzes
            if (s === null || !Number.isFinite(s)) return !(r._atlasWaterLevelAt(x, z, -1e9) > -Infinity);
            return !(s < r._koerperWasser(x, z, s) + mg) && !(s < r._atlasWaterLevelAt(x, z, s) + mg);
        };
        // das nächste Wasser des Gesetzes (K16: 292 m von der Plattform, die 200-m-Suche fand keins — die Stichprobe war trocken)
        const w0 = r._findNearestWaterPoint(P.x, P.z, 800);
        const zentren = [ort, P].concat(w0 ? [w0] : []);
        let seed = 12345;
        const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
        let n = 0,
            falsch = 0,
            nass = 0;
        const beispiele = [];
        for (const c of zentren)
            for (let i = 0; i < 400; i++) {
                const a = rnd() * Math.PI * 2,
                    d = Math.sqrt(rnd()) * 220;
                const x = c.x + Math.cos(a) * d,
                    z = c.z + Math.sin(a) * d;
                for (const mg of [0.2, 0.4, 1.5]) {
                    const soll = ref(x, z, mg);
                    n++;
                    if (!soll) nass++;
                    if (urteil.call(r, x, z, mg) !== soll) {
                        falsch++;
                        if (beispiele.length < 3) beispiele.push(`(${x.toFixed(1)}, ${z.toFixed(1)}, ${mg})`);
                    }
                }
            }
        // Der Spieler-Wille: ein Graben und eine Aufschüttung (voxelEdits) am Ufer — das Urteil liest dieselbe Dichte samt
        // Edits. Die Edits leben nur für diese Urteile (kein Remesh), danach ist die Liste wie vorher.
        const wm = st.worldMeta;
        const editsAlt = wm.voxelEdits;
        const ufer = w0 || P;
        const sy = scan.call(r, ufer.x + 6, ufer.z) ?? 0;
        wm.voxelEdits = (editsAlt || []).concat([
            { x: ufer.x + 6, y: sy, z: ufer.z, r: 7, strength: 48, mode: "carve" },
            { x: ufer.x - 6, y: sy + 1, z: ufer.z + 4, r: 6, strength: 48, mode: "fill" },
        ]);
        try {
            for (let i = 0; i < 300; i++) {
                const a = rnd() * Math.PI * 2,
                    d = Math.sqrt(rnd()) * 16;
                const x = ufer.x + Math.cos(a) * d,
                    z = ufer.z + Math.sin(a) * d;
                for (const mg of [0.2, 0.4, 1.5]) {
                    const soll = ref(x, z, mg);
                    n++;
                    if (!soll) nass++;
                    if (urteil.call(r, x, z, mg) !== soll) {
                        falsch++;
                        if (beispiele.length < 3) beispiele.push(`Edit (${x.toFixed(1)}, ${z.toFixed(1)}, ${mg})`);
                    }
                }
            }
        } finally {
            wm.voxelEdits = editsAlt;
        }
        m.exakt = { n, falsch, nass, beispiele, wasserGefunden: !!w0 };
        // (b) Spalten-Scans und Proben je Such-Pfad: die Suche selbst gerufen; Scan und Urteil sind Beobachtungs-Punkte
        //     (sie zählen und reichen durch). Trocken = kein Wasser im Kreis, der teuerste Fall.
        let scans = 0,
            proben = 0;
        const eigen = (k) => Object.prototype.hasOwnProperty.call(r, k);
        const nassAlt = r._nassAt;
        const hatte = { scan: eigen("_voxelSurfaceY"), urteil: eigen("_nassAt") };
        r._voxelSurfaceY = function (...a) {
            scans++;
            return scan.apply(this, a);
        };
        // die Ring-Suche fragt die Spalten-Probe `_nassAt` (der Beobachtungs-Punkt zählt und reicht durch)
        r._nassAt = function (...a) {
            proben++;
            return nassAlt.apply(this, a);
        };
        try {
            for (const [pfad, R] of [
                ["trinken", r.constructor.CREATURE_DRINK_SEARCH_RADIUS],
                ["chat", 80],
                ["ki", 200],
            ])
                for (const [wo, c] of [
                    ["trocken", ort],
                    ["plattform", P],
                ]) {
                    scans = proben = 0;
                    const w = r._findNearestWaterPoint(c.x, c.z, R);
                    m.zaehlung[`${pfad}@${wo}`] = { R, proben, scans, gefunden: !!w };
                }
            // Der teuerste Fall ganz: kein Wasser im 200-m-Kreis heißt, die Suche fragt ALLE Proben ihrer Ringe (4-m-Ringe,
            // Bogen ≤ 4 m), und jede ist trocken. Am trockenen Ort jede dieser Proben gefragt; gezählt die Spalten, die die
            // TROCKENEN zahlen (eine nasse beendet die Suche) — so viele zahlt die KI-Suche in einer Welt ohne Wasser.
            let trockenScans = 0,
                trockenProben = 0,
                nassProben = 0;
            for (let rr = 4; rr <= 200; rr += 4) {
                const D = Math.max(8, Math.ceil((2 * Math.PI * rr) / 4));
                for (let d = 0; d < D; d++) {
                    const s0 = scans;
                    const ja = !r._nassAt(ort.x + Math.cos((d / D) * Math.PI * 2) * rr, ort.z + Math.sin((d / D) * Math.PI * 2) * rr, 0.2);
                    if (ja) {
                        trockenProben++;
                        trockenScans += scans - s0;
                    } else nassProben++;
                }
            }
            const alle = trockenProben + nassProben;
            m.zaehlung["ki@trocken-voll"] = {
                R: 200,
                proben: trockenProben,
                scans: trockenScans,
                nass: nassProben,
                // hochgerechnet auf alle Proben der Ringe (eine Welt, in der jede trocken ist)
                hoch: trockenProben ? Math.round((trockenScans * alle) / trockenProben) : null,
                gefunden: false,
            };
        } finally {
            if (hatte.scan) r._voxelSurfaceY = scan;
            else delete r._voxelSurfaceY;
            if (hatte.urteil) r._nassAt = nassAlt;
            else delete r._nassAt;
        }
        m.gestartet = true;
    } catch (e) {
        out.suche = Object.assign(out.suche || {}, { err: (e && e.stack) || String(e) });
    }
    if (S.has("werkstatt")) marke("werkstatt");
    // ── V-D5: das Rezeptbuch urteilt nach dem Spielmodus ──
    if (S.has("werkstatt")) try {
        const m = { gestartet: false };
        out.rezept = m;
        const host = document.getElementById("inventory-recipes");
        if (!host) throw new Error("kein #inventory-recipes");
        const lbl = (st.blueprints.baum_eiche && st.blueprints.baum_eiche.label) || "baum_eiche";
        const knopf = () => {
            for (const row of host.querySelectorAll(".recipe-row")) {
                const nm = row.querySelector(".recipe-name");
                if (nm && nm.textContent === lbl) return row.querySelector("button");
            }
            return null;
        };
        const modusAlt = r.getGameMode();
        r.setGameMode("frieden");
        r.renderRecipeBook();
        const k0 = knopf();
        m.friedenGesperrt = !!k0 && k0.disabled === true;
        r.setGameMode("schöpfer");
        r.renderRecipeBook();
        const k1 = knopf();
        m.schoepferFrei = !!k1 && k1.disabled === false;
        m.titel = k1 ? k1.title || "" : "kein Knopf";
        r.setGameMode(modusAlt);
        m.gestartet = true;
    } catch (e) {
        out.rezept = Object.assign(out.rezept || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D3: die Werkstatt-Vorschau ──
    if (S.has("werkstatt")) try {
        const m = { gestartet: false };
        out.vorschau = m;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.eiche && st.blueprints.baum_eiche))
            await sleep(80);
        // Das Welt-Auge steht beim Spieler (der Loop spiegelt es je Frame) — dort, wo der neue Spieler die Werkstatt öffnet.
        await tick(20);
        if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
        const ws = r._ensureWorkshopState();
        const lu = r._ensureLodUniforms();
        // Der Beobachtungs-Punkt, im selben Takt wie das Öffnen (vor dem async init() des Vorschau-Renderers): der
        // Neben-Renderer bekommt den Masken-Stand, die GPU-Arbeit bleibt aus.
        const rec = [];
        if (!ws.preview) throw new Error("keine Vorschau nach dem Öffnen der Werkstatt");
        ws.preview.renderer.render = () => {
            rec.push({
                an: lu.uLodMaskOn.value,
                auge: lu.uLodAuge.value.clone(),
                perf: lu.uLodPerf.value,
                ref: lu.uLodRef.value,
                cfg: { d0: lu.uLodD0.value, d1: lu.uLodD1.value, fade: lu.uLodFade.value, fade0: lu.uLodFade0.value },
            });
        };
        r.selectBlueprintForEdit("baum_eiche");
        const dl2 = performance.now() + 90000;
        while (performance.now() < dl2) {
            const p = ws.preview;
            if (p && p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length) break;
            await tick(1, 80);
        }
        const p = ws.preview;
        if (!p || !p.currentMesh) {
            // Der Zustand beim Namen: liegt der Körper im Cache, schläft die Vorschau; sonst wartet sie auf den Zug.
            const bpE = st.blueprints.baum_eiche;
            const pr = r._foundryPresetForEntry({ type: "baum_eiche" });
            const lodE = bpE && Number.isFinite(bpE._recipeLod) ? bpE._recipeLod | 0 : 0;
            const k = pr ? r._foundryKoerperKey(pr, r._foundryVariantFor(r._werkSame(bpE, "baum_eiche"), pr), lodE) : null;
            throw new Error(
                `keine Vorschau-Gestalt — ${k}: im Cache ${!!(k && f.cache.has(k))} · angefragt ${!!(k && f.requested && f.requested.has(k))} · Vorschau pending ${!!r._wsStudioPending} · Schlange ${(f.warte || []).length} · im Flug ${f.pending ? f.pending.size : 0}`
            );
        }
        p.rendererReady = true;
        m.maskeWelt = lu.uLodMaskOn.value;
        r._workshopRender();
        m.maskeDanach = lu.uLodMaskOn.value;
        m.renders = rec.length;
        m.gestartet = true;
        const R = rec[rec.length - 1];
        if (R) {
            m.maskeImRender = R.an;
            const law = globalThis.__phytoCore.lodCrossfadeMask;
            const v = new THREE.Vector3();
            let n = 0,
                behalten = 0,
                dSum = 0;
            p.currentMesh.updateMatrixWorld(true);
            p.currentMesh.traverse((o) => {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                const g = o.geometry;
                const pos = g.attributes.position;
                const aL = g.attributes.aLodLevel,
                    aH = g.attributes.aH0,
                    aHL = g.attributes.aH0L;
                const fol = !!(o.material && o.material.userData && /foliage|grass/.test(o.material.userData.foundryKind || ""));
                const schritt = Math.max(1, Math.floor(pos.count / 400));
                for (let j = 0; j < pos.count; j += schritt) {
                    v.fromBufferAttribute(pos, j).applyMatrix4(o.matrixWorld);
                    const stufe = aL ? aL.getX(j) : 0;
                    const cd = Math.hypot(R.auge.x - v.x, R.auge.z - v.z) * R.perf;
                    dSum += cd / R.perf;
                    const lk = Math.min(R.ref / Math.max(aH ? aH.getX(j) : 1, 1e-3), 1);
                    const lkL = Math.min(R.ref / Math.max(aHL ? aHL.getX(j) : 1, 1e-3), 1);
                    let k = 0;
                    for (let d = 0; d < 16; d++) {
                        const dh = (d + 0.5) / 16;
                        let keep = true;
                        if (R.an > 0.5 && stufe > 0.5) {
                            const L = law(cd * lk, dh, R.cfg, stufe > 1.5 ? 1 : 0, fol, cd * lkL);
                            keep = stufe > 2.5 ? L.f1o < dh : L.keep;
                        }
                        if (keep) k++;
                    }
                    behalten += k / 16;
                    n++;
                }
            });
            m.vertices = n;
            m.anteil = n ? behalten / n : 0;
            m.augeAbstand = n ? +(dSum / n).toFixed(1) : null;
        }
    } catch (e) {
        out.vorschau = Object.assign(out.vorschau || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D3 FREMDER ZUG (K38): der Wartende erwacht, wenn ein ANDERER seinen Körper-Schlüssel zuerst zog ──
    // Der fremde Besteller läuft über seinen eigenen Chokepoint (die Welt: `_foundryFlattenFor`; für die Hand: die
    // Vorschau), der Wartende über seinen (`selectBlueprintForEdit` · `_heldFoundryGroup`). Der Körper wird vorher aus dem
    // Cache geräumt (`_foundryCacheEvict`, die EINE Räumungs-Naht), die Vorschau steht dabei auf einem Teile-Bauplan.
    if (S.has("werkstatt")) try {
        const m = { gestartet: false };
        out.zug = m;
        const ws = r._ensureWorkshopState();
        const p = ws.preview;
        const f = r._foundry;
        if (!p || !f || !f.ready || !f.recipes) throw new Error("keine Vorschau oder kein Buch");
        const teile = Object.keys(st.blueprints).find((n) => {
            const b = st.blueprints[n];
            return b && Array.isArray(b.parts) && b.parts.length && !r._foundryPresetForEntry({ type: n });
        });
        const zuTeilen = () => {
            if (teile) r.selectBlueprintForEdit(teile);
        };
        const schluessel = (bpName) => {
            const preset = r._foundryPresetForEntry({ type: bpName });
            const variant = r._foundryVariantFor(r._werkSame(st.blueprints[bpName], bpName), preset);
            return { preset, variant, key: r._foundryKoerperKey(preset, variant, 0) };
        };
        const imFlug = (k) => !!(f.requested && f.requested.has(k)) && !f.cache.has(k);
        // (a) die Vorschau hinter dem Zug der Welt
        zuTeilen();
        const a = schluessel("baum_eiche");
        r._foundryCacheEvict(a.key);
        let same = 1;
        while (same < 100000 && r._foundryVariantFor(same, a.preset) !== a.variant) same++;
        const pm = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
        // ohne Ort: die Gestalt kommt aus dem Samen (mit Ort wählt der Platz sie, `_foundryGestaltFor`), der Rang ist der
        // der Ferne (`_foundryAuftragD2` ohne Ort = ∞)
        r._foundryFlattenFor({ type: "baum_eiche", seed: same }, a.preset, 0);
        m.vorschau = { key: a.key, fremd: imFlug(a.key) };
        const t0 = performance.now();
        r.selectBlueprintForEdit("baum_eiche");
        const steht = () => !!(p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length);
        while (performance.now() < t0 + zugFrist && !steht()) await tick(1, 80);
        m.vorschau.ms = steht() ? Math.round(performance.now() - t0) : null;
        m.vorschau.imCache = f.cache.has(a.key);
        // (b) die Hand hinter dem Zug der Vorschau: geweckt zählt nur NACH der Ankunft
        const klinge = Object.keys(st.blueprints)
            .sort()
            .find((n) => /^klinge_/.test(n) && r._foundryPresetForEntry({ type: n }));
        if (klinge) {
            zuTeilen();
            const b = schluessel(klinge);
            r._foundryCacheEvict(b.key);
            r.selectBlueprintForEdit(klinge);
            m.hand = { key: b.key, fremd: imFlug(b.key), geweckt: 0, vorAnkunft: 0 };
            const echt = r._refreshHeldMesh;
            r._refreshHeldMesh = function () {
                if (f.cache.has(b.key)) m.hand.geweckt++;
                else m.hand.vorAnkunft++;
            };
            try {
                const t1 = performance.now();
                const erst = r._heldFoundryGroup(klinge);
                m.hand.erst = erst === "pending" ? "pending" : erst ? "gruppe" : String(erst);
                while (performance.now() < t1 + zugFrist && !m.hand.geweckt) await tick(1, 80);
                m.hand.ms = m.hand.geweckt ? Math.round(performance.now() - t1) : null;
                m.hand.imCache = f.cache.has(b.key);
            } finally {
                r._refreshHeldMesh = echt;
            }
        }
        // (c) JEDE STUFE der Vorschau (K38-N2): die Eiche mit der LOD-Wahl 0 · 1 · 2, ihr Stoff vorher geräumt — L0/L1 der
        // Körper der Stufe, die L2-Karte ihre Höhen-Stufe (Rahmen + Sichthöhe), ihre Höhe und ihre Zelle im Atlas.
        m.stufen = [];
        const bpE = st.blueprints.baum_eiche;
        const lodAlt = bpE._recipeLod;
        try {
            for (const s of [0, 1, 2]) {
                zuTeilen();
                bpE._recipeLod = s;
                const preset = r._foundryPresetForEntry({ type: "baum_eiche" });
                const variant = r._foundryVariantFor(r._werkSame(bpE, "baum_eiche"), preset);
                const kKey = r._foundryKoerperKey(preset, variant, s === 2 ? r._foundryHoehenStufe(preset) : s);
                r._foundryCacheEvict(kKey);
                const at = s === 2 ? r._impostorAtlas() : null;
                const zKey = "fimp:" + r._foundryKartenKey(preset, variant, null);
                if (at) {
                    if (f.hoehen) f.hoehen.delete(kKey);
                    at.zellen.delete(zKey);
                }
                const t2 = performance.now();
                r.selectBlueprintForEdit("baum_eiche");
                while (performance.now() < t2 + zugFrist && !steht()) await tick(1, 80);
                const z = at ? at.zellen.get(zKey) : null;
                const box = steht() ? new THREE.Box3().setFromObject(p.currentMesh) : null;
                m.stufen.push({
                    hoch: box ? Math.round((box.max.y - box.min.y) * 100) / 100 : null,
                    soll: f.hoehen && f.hoehen.get(kKey) > 0 ? Math.round(f.hoehen.get(kKey) * 100) / 100 : null,
                    lod: s,
                    wart: at ? `die Karte ${zKey} (Höhen-Stufe ${kKey})` : `der Körper ${kKey}`,
                    ms: steht() ? Math.round(performance.now() - t2) : null,
                    da: at ? !!(z && (z.gebacken || (z.frame && f.hoehen && f.hoehen.get(kKey) > 0))) : f.cache.has(kKey),
                });
            }
        } finally {
            bpE._recipeLod = lodAlt;
        }
        // (d) DER VORRAT (K38-N2): eine Boden-Art (kein Baum, der Vorrat wärmt nur sie) wird geräumt, der Vorrat läuft neu
        // an; sobald ihr Körper im Flug ist, fragt ein Leser denselben Schlüssel — gezählt wird jeder Auftrag an den Worker.
        const bodenArt = (r._foundryLibrarySpec().species || []).find(
            (sp) => !r._foundryPresetIsTree(sp) && r._foundryGestalten(sp) > 0
        );
        const tV = performance.now();
        while (f._vorrat && performance.now() < tV + zugFrist) await tick(1, 80); // der Boot-Vorrat läuft aus
        if (bodenArt && !f._vorrat) {
            const lodV = (r._foundryKindStages(bodenArt) || [2, 0])[0];
            const vKey = r._foundryKoerperKey(bodenArt, 1, lodV);
            r._foundryCacheEvict(vKey);
            m.vorrat = { key: vKey, imFlug: false, auftraege: 0 };
            let sd = 1;
            while (sd < 100000 && r._foundryVariantFor(sd, bodenArt) !== 1) sd++;
            const echtReq = r._foundryRequest;
            // der Leser fragt im Flug: nach dem Auftrag des Vorrats (als Mikro-Aufgabe, vor jeder Worker-Antwort)
            r._foundryRequest = function (preset, variant, lod, ...rest) {
                const zusage = echtReq.call(this, preset, variant, lod, ...rest);
                if (r._foundryKoerperKey(preset, variant, lod) === vKey && ++m.vorrat.auftraege === 1)
                    queueMicrotask(() => {
                        m.vorrat.imCache = f.cache.has(vKey);
                        m.vorrat.phase = String(f._vorrat);
                        m.vorrat.imFlug = !m.vorrat.imCache;
                        r._foundryFlattenFor({ type: bodenArt, seed: sd }, bodenArt, lodV);
                    });
                return zusage;
            };
            try {
                await r._foundryPrefetchLibrary();
            } finally {
                r._foundryRequest = echtReq;
            }
        }
        m.gestartet = true;
    } catch (e) {
        out.zug = Object.assign(out.zug || {}, { err: (e && e.stack) || String(e) });
    }
    // ── V-D3 RAHMEN (K05, WS-01): jedes Rezept und jeder Bauplan füllt die Vorschau ──
    // Die Wahl läuft über die Chokepoints des Spielers (selectStudioRecipeForView · selectBlueprintForEdit), die Kamera
    // stellt `_workshopRender` (der Vorschau-Renderer ist oben der Beobachtungs-Punkt, keine GPU-Arbeit); gemessen wird
    // die projizierte Box3 der Gestalt: größere Kante je Bildkante (NDC, auf das Bild geklemmt) — das Maß des Runners.
    if (S.has("werkstatt")) try {
        const m = { gestartet: false, eintraege: [] };
        out.rahmen = m;
        const ws = r._ensureWorkshopState();
        const p = ws.preview;
        const f = r._foundry;
        if (!p || !f || !f.recipes) throw new Error("keine Vorschau oder kein Buch");
        const fuell = () => {
            const o = p.currentMesh;
            o.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(o);
            if (b.isEmpty()) return null;
            const cam = p.camera;
            cam.updateMatrixWorld(true);
            let x0 = 1,
                x1 = -1,
                y0 = 1,
                y1 = -1;
            const v = new THREE.Vector3();
            for (const x of [b.min.x, b.max.x])
                for (const y of [b.min.y, b.max.y])
                    for (const z of [b.min.z, b.max.z]) {
                        v.set(x, y, z).project(cam);
                        x0 = Math.min(x0, v.x);
                        x1 = Math.max(x1, v.x);
                        y0 = Math.min(y0, v.y);
                        y1 = Math.max(y1, v.y);
                    }
            const cl = (q) => Math.max(-1, Math.min(1, q));
            const fw = (cl(x1) - cl(x0)) / 2,
                fh = (cl(y1) - cl(y0)) / 2;
            const s = b.getSize(new THREE.Vector3());
            return { fuell: +Math.max(fw, fh).toFixed(3), kante: +Math.max(s.x, s.y, s.z).toFixed(3) };
        };
        const liste = Object.keys(f.recipes)
            .sort()
            .map((id) => ["rezept", id, f.recipes[id].kind])
            .concat(Object.keys(st.blueprints).sort().map((id) => ["bauplan", id, st.blueprints[id].preset || "teile"]));
        m.waffenImBuch = liste.filter((e) => e[2] === "weapon").length;
        const t0 = performance.now();
        const frist = t0 + 150000;
        for (const [art, id, kind] of liste) {
            const e = { art, id, kind };
            m.eintraege.push(e);
            if (performance.now() > frist) {
                e.frist = true;
                continue;
            }
            const ti = performance.now();
            if (art === "rezept") r.selectStudioRecipeForView(id);
            else r.selectBlueprintForEdit(id);
            const dl = performance.now() + 20000;
            while (performance.now() < dl && r._wsStudioPending) await sleep(40);
            e.ms = Math.round(performance.now() - ti);
            if (r._wsStudioPending) {
                e.frist = true;
                continue;
            }
            if (!p.currentMesh) {
                e.leer = true;
                continue;
            }
            r._workshopRender();
            Object.assign(e, fuell() || { leer: true });
            e.dist = +p.orbit.dist.toFixed(3);
        }
        m.ms = Math.round(performance.now() - t0);
        m.aspekt = +p.camera.aspect.toFixed(3);
        m.gestartet = true;
    } catch (e) {
        out.rahmen = Object.assign(out.rahmen || {}, { err: (e && e.stack) || String(e) });
    }
    marke("ende");
    return out;
}

(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die V1-Pfad-Linse nennt jeden Täter des Befunds ===");
        const gesund = { gestartet: true, renders: 1, vertices: 1200, anteil: 1, maskeImRender: 0, maskeWelt: 1, maskeDanach: 1 };
        check("Selbst-Test V-D3: gesunde Vorschau == 0 Täter", vorschauVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["leere Vorschau (21 108 Dreiecke, 0 im Bild)", { anteil: 0, maskeImRender: 1, augeAbstand: 36 }, "vorschau 0.0 %"],
            ["Vorschau zeichnet nie", { renders: 0 }, "vorschau zeichnete nie"],
            ["Welt-Maske bleibt aus", { maskeDanach: 0 }, "welt-maske"],
        ]) {
            const v = vorschauVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test V-D3: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const zugGesund = {
            gestartet: true,
            vorschau: { key: "eiche|2|0", fremd: true, ms: 1500, imCache: true },
            hand: { key: "klinge|1|0", fremd: true, ms: 900, imCache: true },
            stufen: [0, 1, 2].map((lod) => ({ lod, wart: "eiche|2|" + lod, ms: 800, da: true, hoch: 21.4, soll: 21 })),
            vorrat: { key: "gras|1|1", imFlug: true, auftraege: 1 },
        };
        check("Selbst-Test V-D3 Fremder Zug: gesund == 0 Täter", zugVerdict(zugGesund).length === 0, zugVerdict(zugGesund).join(" · "));
        const zugMit = (wer, z) => Object.assign({}, zugGesund, { [wer]: Object.assign({}, zugGesund[wer], z) });
        for (const [name, bruch, soll] of [
            ["die Vorschau schläft nach der Ankunft (Zweig-CI 38453848494)", zugMit("vorschau", { ms: null, imCache: true }), "zug vorschau schläft"],
            ["der fremde Zug im Rang der Ferne", zugMit("vorschau", { ms: null, imCache: false }), "zug vorschau: eiche|2|0 nach"],
            ["die Hand schläft nach der Ankunft", zugMit("hand", { ms: null, imCache: true }), "zug hand schläft"],
            ["kein fremder Zug (vakuös)", zugMit("vorschau", { fremd: false }), "zug vorschau: kein fremder Zug"],
            ["keine Klinge im Buch (vakuös)", Object.assign({}, zugGesund, { hand: null }), "zug hand: keine Probe"],
            [
                "die L2-Karte schläft nach der Ankunft ihrer Höhen-Stufe (K38-N1 offen)",
                Object.assign({}, zugGesund, { stufen: [...zugGesund.stufen.slice(0, 2), { lod: 2, wart: "fimp:eiche|2", ms: null, da: true }] }),
                "zug stufe L2 schläft",
            ],
            ["keine Stufen gemessen (vakuös)", Object.assign({}, zugGesund, { stufen: [] }), "zug stufen: 0 von 3"],
            ["der Leser bestellt im Flug des Vorrats neu (bis 15.10.)", zugMit("vorrat", { auftraege: 2 }), "zug vorrat: gras|1|1 2×"],
            ["der Vorrat zieht nicht (vakuös)", zugMit("vorrat", { imFlug: false }), "zug vorrat: gras|1|1 nicht im Flug"],
            ["keine Vorrats-Probe (vakuös)", Object.assign({}, zugGesund, { vorrat: null }), "zug vorrat: keine Probe"],
            [
                "die Vorschau rahmt den Stamm (Box des Einheits-Quads, Bild 15.10.)",
                Object.assign({}, zugGesund, { stufen: [...zugGesund.stufen.slice(0, 2), { lod: 2, wart: "fimp:eiche|2", ms: 900, da: true, hoch: 1.1, soll: 21 }] }),
                "zug stufe L2 rahmen",
            ],
        ]) {
            const v = zugVerdict(bruch);
            check(`Selbst-Test V-D3 Fremder Zug: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const waffe = (id, fuell) => ({ art: "rezept", id, kind: "weapon", fuell, kante: 0.4, dist: 3 });
        const gesundR = { gestartet: true, waffenImBuch: 2, eintraege: [waffe("beil", 0.7), waffe("messer", 0.7)] };
        check("Selbst-Test V-D3 Rahmen: gesunde Vorschau == 0 Täter", rahmenVerdict(gesundR).length === 0, rahmenVerdict(gesundR).join(" · "));
        for (const [name, bruch, soll] of [
            ["Messer 0,059 (3-m-Mindestabstand, Runner WS-01)", { eintraege: [waffe("beil", 0.7), waffe("messer", 0.059)] }, "rahmen 1 außerhalb"],
            ["ein Bauplan sprengt das Bild (0,97)", { eintraege: gesundR.eintraege.concat([{ art: "bauplan", id: "haus", kind: "teile", fuell: 0.97 }]) }, "rahmen 1 außerhalb"],
            ["eine Waffe ungemessen", { eintraege: [waffe("beil", 0.7), { art: "rezept", id: "messer", kind: "weapon", leer: true }] }, "rahmen waffen 1 von 2"],
            ["eine Gestalt bleibt pending", { eintraege: gesundR.eintraege.concat([{ art: "rezept", id: "eiche", kind: "tree", frist: true }]) }, "rahmen 1 ohne Gestalt"],
        ]) {
            const v = rahmenVerdict(Object.assign({}, gesundR, bruch));
            check(`Selbst-Test V-D3 Rahmen: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gesundA = { gestartet: true, baeume: 9, kronen: 0, ringPortale: 10, ringMitteAbstand: 0, trocken: true, plattformen: 1 };
        check("Selbst-Test V-D1: gesunde Lichtung == 0 Täter", lichtungVerdict(gesundA).length === 0);
        for (const [name, bruch, soll] of [
            ["Tanne 2,0 m vom Mittelpunkt (V-D1)", { kronen: 2, naechsterStamm: 1.97, naechsteArt: "baum_tanne" }, "2 Krone"],
            ["Ring um den Ursprung, 36 m daneben", { ringMitteAbstand: 36 }, "ring-mitte"],
            ["kein Ring über dem Frame-Budget", { ringPortale: 0 }, "kein Genesis-Ring"],
            ["Plattform im See", { trocken: false }, "plattform im wasser"],
            ["der zweite Leger sucht nicht (Zwilling)", { plattformen: 2 }, "2 Plattformen"],
            ["kein Wald gewachsen (vakuös)", { baeume: 0 }, "kein Wald"],
        ]) {
            const v = lichtungVerdict(Object.assign({}, gesundA, bruch));
            check(`Selbst-Test V-D1: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // Die Einzelschnitte: je ein gesunder Zustand ohne Täter, je der Befund-Zustand mit Täter beim Namen.
        const gesundS = {
            gestartet: true,
            trockenOrt: { x: 0, z: 0 },
            amWasserOhneWasser: 0,
            amWasserZeile: "Kein Wasser in Reichweite — am Wasser wächst hier nichts.",
            birkenAbsender: 2,
            birkenZeile: "2× Birke aus dem Studio vor dir gewachsen",
            birkenLabel: "Birke",
            gesendet: true,
            ortKnoten: '["at",1,2,3]',
            birkenEmpfaenger: 2,
            empfaengerAbstandZumAbsender: 12,
            telemetrieImChat: false,
        };
        for (const [kurz, urteil, gesund, brueche] of [
            ["V-D5", rezeptVerdict, { gestartet: true, friedenGesperrt: true, schoepferFrei: true }, [["schöpfer gesperrt (V-D5)", { schoepferFrei: false, titel: "Es fehlt: 44× holz" }, "schöpfer"]]],
            ["V-k4", tasteVerdict, { gestartet: true, gedrueckt: true, nachBlur: false }, [["Klebetaste (V-k4)", { nachBlur: true }, "W bleibt"]]],
            [
                "V-D6",
                kiVerdict,
                { gestartet: true, fehler: "Keine Antwort von 127.0.0.1:9 — der lokale Dienst läuft nicht", host: "127.0.0.1:9" },
                [["CORS-Märchen (V-D6)", { fehler: "Cloud blockt Browser-Direct-Call (CORS). Optionen: …" }, "lokaler Endpunkt"]],
            ],
            [
                "V-k5 V-k6 V-D8",
                satzVerdict,
                gesundS,
                [
                    ["6 Eichen am Spieler (V-k5)", { amWasserOhneWasser: 6, amWasserZeile: "6× baum_eiche aus dem Studio am Wasser gewachsen" }, "6 Eichen"],
                    ["interne id im Chat (V-D8)", { birkenZeile: "2× baum_birke aus dem Studio vor dir gewachsen" }, "der Chat nennt"],
                    ["Ort reist relativ (V-k6)", { ortKnoten: '["at_player_forward",10]' }, "der Ort reist"],
                    ["Empfänger pflanzt bei sich (V-k6)", { empfaengerAbstandZumAbsender: 203 }, "der Empfänger pflanzt"],
                    ["Telemetrie im Chat (V-D8)", { telemetrieImChat: true }, "Dorf-Telemetrie"],
                ],
            ],
            [
                "Ankunft",
                ankunftVerdict,
                { gestartet: true, ms: 9000, takte: 120, ohne: [], ladeschirm: false, weg: 2.4, wegTakte: 40 },
                [
                    ["halbes Weltbild über den Deckel (L2a)", { ohne: ["Das erste Weltbild steht ohne: Horizont — der Deckel von 60000 ms ist erreicht."] }, "ankunft halb"],
                    ["der Ladeschirm bleibt", { ladeschirm: true }, "ankunft: der Ladeschirm"],
                    ["W trägt den Spieler nicht", { weg: 0, wegTakte: 600 }, "kontrolle: W trug den Spieler 0 m"],
                ],
            ],
            [
                "Fahrt",
                fahrtVerdict,
                { gestartet: true, typ: "fahrzeug_gt", sichtVor: "first", sichtRitt: "third", sichtNach: "first", weg: 100.4, armN: 300, armP50: 1, armMin: 0.6, imWagen: 0, anteil: 0.12, rauschen: 0, abgestiegen: true, wechsel: WECHSEL_GESUND, hang: HANG_GESUND },
                [
                    [
                        "der Arm trifft den eigenen Wagen (Befund 17.10., Arm 0,30)",
                        { armP50: 0.3, armMin: 0.28, imWagen: 280 },
                        "kamera-arm p50 0.3 (min 0.28) < 0.9 — 280 von 300 Proben enden am gerittenen Werk fahrzeug_gt: der Strahl der Kamera trifft den eigenen Wagen",
                    ],
                    ["im Ritt bleibt die Sicht", { sichtRitt: "first" }, "sicht: im Ritt first"],
                    ["der Wagen verschwindet im Bild", { anteil: 0.001 }, "wagen im Bild 0.1 %"],
                    ["die Fahrt bleibt stecken", { weg: 12 }, "fahrt: 12 m"],
                    ["nach dem Abstieg bleibt Third", { sichtNach: "third" }, "sicht: nach dem Abstieg third"],
                    ["kein Wagen vor dem Spieler", { gestartet: false, grund: "die Welt stellt fahrzeug_gt nicht hin" }, "fahrt start: die Welt"],
                    ["der Aufbau bleibt am Ort des Aufstiegs (Befund SG1, L1 im Band)", { stufeWeg: 20.1, stufeTaeter: "L1 (Band)" }, "aufbau 20.1 m neben dem Wagen: die Stufe L1 (Band)"],
                    ["auf dem Null-Renderer (kein Bild) urteilt die Mechanik weiter", { bild: false, anteil: null, stufeWeg: 21.6, stufeTaeter: "L1 (Band)" }, "aufbau 21.6 m"],
                    ["Third beginnt aus der alten Richtung (Befund 17.10., `_kamYaw` nur in Third)", { wechsel: Object.assign({}, WECHSEL_GESUND, { wechsel: [[74, 31], [70, 4]] }) }, "kamera nach dem Wechsel 31°"],
                    ["Ego dreht nicht (vakuös)", { wechsel: Object.assign({}, WECHSEL_GESUND, { wechsel: [[3, 1], [80, 4]] }) }, "wechsel: 2 Rückkehr"],
                    ["die Kamera springt je Bild quer gegen den Wagen", { wechsel: Object.assign({}, WECHSEL_GESUND, { ruckP95: 0.31 }) }, "kamera-ruck seitlich p95 0.31"],
                    ["das Bild liegt um die Schritte des Bilds zurück (prev vor dem Bild)", { wechsel: Object.assign({}, WECHSEL_GESUND, { gleichP95: 0.56 }) }, "gleichlauf im Wechsel p95 0.56"],
                    ["die Kamera steht bergab unter der Fahrbahn (Elevation zur Welt)", { hang: Object.assign({}, HANG_GESUND, { hochP05: -4.7, ruckP95: 0.31 }) }, "kamera am Hang p05 -4.7°"],
                    ["der Band-Partner zeigt das Rad in Ruhe", { radN: 768, radWeg: 1.998 }, "rad: die Stufen im Band"],
                    ["Wechsel ohne Gleichlauf-Proben (vakuös)", { wechsel: Object.assign({}, WECHSEL_GESUND, { gleichN: 0 }) }, "kamera im Wechsel: 120 Bilder Ruck, 0 Bilder Gleichlauf"],
                    ["der Band-Partner bleibt im Wechsel zurück", { wechsel: Object.assign({}, WECHSEL_GESUND, { stufeWeg: 9.4, stufeTaeter: "L1 (Band)" }) }, "aufbau im Wechsel 9.4 m"],
                    ["der Wagen fehlt nach dem Wechsel im Bild", { wechsel: Object.assign({}, WECHSEL_GESUND, { anteil: 0 }) }, "wagen im Wechsel im Bild 0.0 %"],
                    ["der Arm pumpt bergab", { hang: Object.assign({}, HANG_GESUND, { schnapp: 14, armWeg: 6.2 }) }, "kamera-arm pumpt bergab: 14"],
                    ["kein Steilhang (vakuös)", { hang: { gefaelle: 0 } }, "hang: kein Steilhang"],
                ],
            ],
        ]) {
            check(`Selbst-Test ${kurz}: gesund == 0 Täter`, urteil(gesund).length === 0, urteil(gesund).join(" · "));
            for (const [name, bruch, soll] of brueche) {
                const v = urteil(Object.assign({}, gesund, bruch));
                check(`Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
            }
        }
        // Die V-k5-Klasse: gesund ohne Täter, je Befund-Zustand der Täter beim Namen.
        const opGesund = (op) => ({ ok: false, grund: "kein Wasser im Umkreis von 60 m", effekt: op, fehler: null, kalt: false, akte: [] });
        const gesundO = {
            gestartet: true,
            radius: 60,
            ops: Object.fromEntries(ORT_OPS.map((op) => [op, opGesund(op)])),
            chain: { ok: false, grund: "kein Wasser im Umkreis von 60 m", effekt: "spawn_tree", fehler: null, akte: [{ nm: "_depositLife", abstand: 0 }] },
            buchWarm: true,
            dorfAuftraege: 0,
            dorfOhneOrt: null,
        };
        check("Selbst-Test V-k5-Klasse: gesund == 0 Täter", ortVerdict(gesundO).length === 0, ortVerdict(gesundO).join(" · "));
        const mitOp = (op, e) => Object.assign({}, gesundO, { ops: Object.assign({}, gesundO.ops, { [op]: Object.assign(opGesund(op), e) }) });
        for (const [name, bruch, soll] of [
            ["TypeError (6b988a07)", mitOp("spawn_creature", { fehler: "op_exception: Cannot read properties of null (reading 'x')", grund: null, effekt: null }), "spawn_creature: wirft"],
            ["Dorf am Spieler-Ort über die Op (6b988a07)", mitOp("spawn_village", { akte: [{ nm: "spawnSettlement", abstand: null }] }), "spawn_village: wirkt ohne Ort"],
            ["still am Spieler-Ort (cf9a07ba)", mitOp("spawn_studio", { ok: true, grund: null, effekt: null, akte: [{ nm: "spawnArchitecture", abstand: 4.1 }] }), "spawn_studio: wirkt ohne Ort"],
            ["Absage ohne Grund", mitOp("deposit_life", { grund: null }), "deposit_life: scheitert nicht benannt"],
            ["chain meldet Erfolg", Object.assign({}, gesundO, { chain: Object.assign({}, gesundO.chain, { ok: true }) }), "chain: meldet Erfolg"],
            ["chain bricht ganz ab", Object.assign({}, gesundO, { chain: Object.assign({}, gesundO.chain, { akte: [] }) }), "chain: bricht ganz ab"],
            ["spawnSettlement ohne Ort gründet beim Spieler", Object.assign({}, gesundO, { dorfAuftraege: 1 }), "dorf ohne Ort gründet"],
        ]) {
            const v = ortVerdict(bruch);
            check(`Selbst-Test V-k5-Klasse: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // Der Rest der V-k5-Klasse: gesund ohne Täter, je Befund-Zustand (c52089c7) der Täter beim Namen.
        const kGesund = (name) => {
            const [, , soll, effekt] = KNOTEN.find((e) => e[0] === name);
            return { ok: false, grund: soll.replace(/^\^/, ""), effekt, fehler: null, akte: [] };
        };
        const gesundK = {
            gestartet: true,
            laeufe: Object.fromEntries(KNOTEN.map(([name]) => [name, kGesund(name)])),
            defaults: { near_water: "kein Wasser im Umkreis von 60 m", at_player_forward: 5, at_field_need: 50 },
            messOrtOhneSpieler: null,
            ohneKnoten: true,
            gesund: { ok: true, akte: 1, grund: null },
        };
        check("Selbst-Test V-k5-Klasse (Rest): gesund == 0 Täter", knotenVerdict(gesundK).length === 0, knotenVerdict(gesundK).join(" · "));
        const mitK = (name, e) => Object.assign({}, gesundK, { laeufe: Object.assign({}, gesundK.laeufe, { [name]: Object.assign(kGesund(name), e) }) });
        const still = (nm, abstand) => ({ ok: true, grund: null, effekt: null, akte: [{ nm, abstand }] });
        const mitD = (d) => Object.assign({}, gesundK, { defaults: Object.assign({}, gesundK.defaults, d) });
        for (const [name, bruch, soll] of [
            ["der Text wird der Ursprung", mitK(KNOTEN[0][0], still("spawnArchitecture", 412.6)), `${KNOTEN[0][0]}: wirkt ohne Ort`],
            ["at(null) wird die 0 (Lehre 17)", mitK("at mit null (Number(null) === 0)", still("spawnCreatureAt", 300.2)), "at mit null (Number(null) === 0): wirkt ohne Ort"],
            ["das Dorf ohne Abstände beim Spieler", mitK("far_player ohne Abstände (das Dorf)", still("spawnSettlement", 9.6)), "far_player ohne Abstände (das Dorf): wirkt ohne Ort"],
            ["voxel_carve gräbt bei 0", mitK("voxel_carve mit null-Koordinaten", still("carveVoxelSphere", 300.2)), "voxel_carve mit null-Koordinaten: wirkt ohne Ort"],
            ["ohne Spieler am Ursprung", mitK("at_player ohne Spieler", still("spawnArchitecture", 300.2)), "at_player ohne Spieler: wirkt ohne Ort"],
            ["die nächste Kreatur am Ursprung", mitK("die nächste Kreatur ohne Spieler", still("assignTaskToNearestCreature", 300.2)), "die nächste Kreatur ohne Spieler: wirkt ohne Ort"],
            ["Absage ohne die Op", mitK("leerer Knoten", { effekt: null }), "leerer Knoten: scheitert nicht benannt"],
            ["near_water ohne Radius sucht 8 m", mitD({ near_water: "kein Wasser im Umkreis von 8 m" }), "near_water ohne Radius"],
            ["vorn ohne Abstand 1 m", mitD({ at_player_forward: 1 }), "at_player_forward ohne Zahl"],
            ["Bedarf ohne Radius 10 m", mitD({ at_field_need: 10 }), "at_field_need ohne Zahl"],
            ["der Mess-Ort ohne Spieler ist der Ursprung", Object.assign({}, gesundK, { messOrtOhneSpieler: { x: 0, z: 0 } }), "der Mess-Ort"],
            ["ohne Knoten scheitert der Spawn", Object.assign({}, gesundK, { ohneKnoten: "nicht verlangt" }), "ohne Knoten kein Default-Ort"],
            ["ein gültiger Knoten wirkt nicht (vakuös)", Object.assign({}, gesundK, { gesund: { ok: false, akte: 0, grund: "at: x fehlt" } }), "ein gültiger at-Knoten"],
        ]) {
            const v = knotenVerdict(bruch);
            check(`Selbst-Test V-k5-Klasse (Rest): ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        // R2: gesund (Urteil exakt, trocken wenige Scans), je Befund-Zustand der Täter beim Namen.
        const gesundW = {
            gestartet: true,
            exakt: { n: 3600, falsch: 0, nass: 400, beispiele: [] },
            zaehlung: {
                "trinken@trocken": { R: 40, proben: 351, scans: 0 },
                "chat@trocken": { R: 80, proben: 1330, scans: 12 },
                "ki@trocken": { R: 200, proben: 1954, scans: 90 },
                "ki@trocken-voll": { R: 200, proben: 8037, scans: 300 },
            },
        };
        check("Selbst-Test R2: gesund == 0 Täter", sucheVerdict(gesundW).length === 0, sucheVerdict(gesundW).join(" · "));
        const mitZ = (k, z) => Object.assign({}, gesundW, { zaehlung: Object.assign({}, gesundW.zaehlung, { [k]: z }) });
        for (const [name, bruch, soll] of [
            ["Spalten-Scan je Probe (6b988a07)", mitZ("ki@trocken", { R: 200, proben: 1954, scans: 1954 }), "ki 200 m: 1954 Spalten-Scans"],
            ["ohne Wasser alle 8037 Proben gescannt", mitZ("ki@trocken-voll", { R: 200, proben: 8037, scans: 8037 }), "ki@trocken-voll 200 m: 8037"],
            ["Trinken scannt je Probe", mitZ("trinken@trocken", { R: 40, proben: 351, scans: 351 }), "trinken 40 m"],
            ["der Fels-Beweis lügt", Object.assign({}, gesundW, { exakt: { n: 3600, falsch: 3, nass: 400, beispiele: ["(1, 2, 0.2)"] } }), "das Urteil weicht"],
            ["kein nasser Punkt (vakuös)", Object.assign({}, gesundW, { exakt: { n: 3600, falsch: 0, nass: 0 } }), "kein nasser Punkt"],
        ]) {
            const v = sucheVerdict(bruch);
            check(`Selbst-Test R2: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const vorWelt = fahrtVerdict({ gestartet: true, typ: "fahrzeug_gt", sichtVor: "first", sichtRitt: "third", sichtNach: "first", weg: 100, armN: 300, armP50: 0.68, armMin: 0.46, imWagen: 0, anteil: 0.013, rauschen: 0, abgestiegen: true, stufeWeg: 1.7, wechsel: WECHSEL_GESUND, hang: HANG_GESUND });
        check("Selbst-Test Fahrt: ein Arm vor Boden und Bau (p50 0,68, nie am Wagen) ist kein Täter", vorWelt.length === 0, vorWelt.join(" · "));
        // DIE WAHL: eine Datei des Stamms ruft die Stationen ihres Moduls, was die Welt sonst lädt den ganzen Gang, Doku nur die Ankunft
        const ordnung = JSON.parse(fs.readFileSync(path.join(root, "spec/stamm/modul-karte.json"), "utf8")).ordnung;
        for (const [dateien, soll] of [
            [["stamm/koerper-fahrt.js"], "ankunft,fahrt"],
            [["stamm/bild-kosten.js"], "ankunft"],
            [["docs/PFLICHT-OFFEN.md", "scripts/diag-ankunft.cjs"], "ankunft"],
            [["stamm/werkstatt-vorschau.js", "stamm/feld-dsl.js"], "ankunft,wort,werkstatt"],
            [["stamm/dienst.js"], "ankunft,lichtung,fahrt,wort,werkstatt"],
            [["worlds/garage/vehicle-core.js"], "ankunft,lichtung,fahrt,wort,werkstatt"],
            [["scripts/diag-v1-pfad.cjs"], "ankunft,lichtung,fahrt,wort,werkstatt"],
        ]) {
            const ist = stationenFuer(dateien, ordnung).stationen.join(",");
            check(`Selbst-Test Wahl: ${dateien.join(" + ")} → ${soll}`, ist === soll, ist);
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die V1-Pfad-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }


    // DIE WAHL DER STATIONEN: `--station` nennt sie, `--nach-diff` liest sie aus den Dateien seit <rev>, sonst der ganze Gang
    const alle = STATIONEN.map(([n]) => n);
    let stationen = alle;
    if (OPT("--station")) {
        const w = OPT("--station").split(",");
        const fremd = w.filter((n) => !alle.includes(n));
        if (fremd.length) throw new Error(`unbekannte Station ${fremd.join(",")} — es gibt ${alle.join(" · ")}`);
        stationen = alle.filter((n) => n === "ankunft" || w.includes(n));
    } else if (OPT("--nach-diff")) {
        const diff = require("child_process").execFileSync("git", ["diff", "--name-only", OPT("--nach-diff")], { cwd: root, encoding: "utf8" });
        const ordnung = JSON.parse(fs.readFileSync(path.join(root, "spec/stamm/modul-karte.json"), "utf8")).ordnung;
        const w = stationenFuer(diff.split("\n").filter(Boolean), ordnung);
        w.grund.forEach((g) => console.log(`  ${g}`));
        stationen = w.stationen;
    }
    console.log(`=== DER SPIELGANG: ${stationen.join(" → ")} ===`);
    const os = require("os");
    const bilderOrt = path.resolve(OPT("--bilder") || path.join(os.tmpdir(), "spielgang"));
    const platte = fs.mkdtempSync(path.join(os.tmpdir(), "spielgang-platte-")); // die leere Platte (IDB leer)
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // DIE KARTE oder der Null-Renderer: die EINE Weiche sagt, ob die Maschine eine Karte gibt (Kopf der Datei)
    const karte = require("./lib/software-gpu.cjs").linsenGpu() === "hardware";
    const browser = await starteBrowser({ art: karte ? "linse" : "null", frist: 1800000, profil: platte });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => (window.__anazhForceFoundry = true));
    // auf dem Null-Renderer lebt der Dorf-Takt wie im Spiel (Ring, Start-Dorf; sein Hook ruht ihn sonst headless)
    if (!karte) await page.evaluateOnNewDocument(() => Object.assign(window, { __anazhHeadlessNullRenderer: true, __anazhAutoSettlement: true }));
    await page.evaluateOnNewDocument(TAKT_ZAEHLER);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state._weltbildDa && window.__gang.loop, { timeout: 900000, polling: 250 });
    const bootS = ((Date.now() - t0) / 1000).toFixed(1);
    const nullR = await page.evaluate(() => !!window.anazhRealm.state.renderer._isHeadlessNull);
    console.log(karte ? "  Renderer: die Karte — jede Station mit Bild" : "  Renderer: Null (die Weiche gibt keine Karte) — die Mechanik jeder Station, das Bild urteilt die Karte");
    if (nullR === karte) check("der Renderer, den die Weiche wählt", false, `Karte ${karte}, Null-Renderer ${nullR}`);
    if (karte) await page.evaluate(require("./lib/ausgabe-aufnahme.cjs").AUSGABE_INSTALL);
    // Der KI-Endpunkt der V-D6-Probe: ein Port, auf dem nichts lauscht (der Linsen-Server liegt auf PORT).
    // DER PULS DES GANGS je 30 s (die CI sieht, wo er steht): die Station, ihre Sekunden, die Takte
    const puls = setInterval(() => page.evaluate(() => [window.__gang.station, Math.round(performance.now()), window.__gang.takte]).then(([s, t, k]) => s && console.log(`  … ${s[0]} seit ${((t - s[1]) / 1000).toFixed(0)} s, ${k - s[2]} Takte`)).catch(() => {}), 30000);
    const out = await page.evaluate(probe, { kiPort: PORT + 3, soll: SOLL, stationen, knoten: KNOTEN.map(([name, prog, , , ohne]) => [name, prog, !!ohne]) });
    clearInterval(puls);
    await browser.close();
    server.close();
    fs.rmSync(platte, { recursive: true, force: true });
    fs.mkdirSync(bilderOrt, { recursive: true });
    for (const [name, url] of Object.entries(out.bilder)) fs.writeFileSync(path.join(bilderOrt, `${name}.png`), Buffer.from(url.split(",")[1], "base64"));

    // DAS URTEIL je Station: die Probe ohne Ausnahme, die Täter beim Namen; die Laufzeit aus den Marken der Seite
    const urteil = (station, name, m, verdikt, zeile) => {
        if (!stationen.includes(station)) return [];
        const mm = m || {};
        if (mm.err) check(`${name.split(" ")[0]} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
        const v = verdikt(mm);
        check(name, v.length === 0, `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`);
        return v;
    };
    for (const [i, [n, ms, takte]] of out.zeit.slice(0, -1).entries()) {
        const [, ms2, takte2] = out.zeit[i + 1];
        console.log(`=== ${n.toUpperCase()} — ${((ms2 - ms) / 1000).toFixed(1)} s · ${takte2 - takte} Takte${n === "ankunft" ? ` (Boot bis Kontrolle ${bootS} s)` : ""} ===`);
        if (n === "ankunft") {
            urteil(n, "Ankunft das erste Weltbild ist ganz, der Ladeschirm weicht, W trägt den Spieler", out.ankunft, ankunftVerdict, (m) =>
                `Kontrolle nach ${m.takte} Takten · ${(m.ms / 1000).toFixed(1)} s ab Navigation · ${m.ohne.length}× halb · W ${m.weg} m in ${m.wegTakte} Takten`);
            urteil(n, "V-k4 der Fensterwechsel löst die gehaltene Taste", out.taste, tasteVerdict, (m) => `W gedrückt ${m.gedrueckt} · nach blur ${m.nachBlur}`);
        } else if (n === "lichtung")
            urteil(n, "V-D1 die Plattform steht auf einer Lichtung (keine Krone über der Scheibe), der Genesis-Ring um sie", out.lichtung, lichtungVerdict, (m) =>
                `Plattform ${JSON.stringify(m.plattform)} · ${m.baeume} Bäume im 40-m-Kreis · nächster Stamm ${m.naechsterStamm} m (${m.naechsteArt}) · Kronen über der Scheibe ${m.kronen} · Ring ${m.ringPortale} Portale, Mitte ${m.ringMitteAbstand} m`);
        else if (n === "fahrt") {
            const bild = (m) => (m.bild === false ? "ohne Bild (Null-Renderer)" : `${pct(m.anteil)} des Bilds (${m.teile} Teile, Rauschen ${m.rauschen})`);
            const zeile = (m) => {
                const [w, h] = [m.wechsel || {}, m.hang || {}];
                const wechsel = w.wechsel ? ` · WECHSEL an ${JSON.stringify(w.ort)}: Gier in Ego/Abstand nach 10 Bildern ${w.wechsel.map(([g, a]) => `${g}°/${a}°`).join(" · ")} · Ruck seitlich p95 ${w.ruckP95} m (${w.ruckN} Bilder) · über der Fahrbahn p05 ${w.hochP05}° · Gleichlauf p95 ${w.gleichP95} (${w.gleichN}) · Rad zwischen den Stufen ≤ ${w.radWeg} (${w.radN}) · Aufbau ≤ ${w.stufeWeg} m · Wagen ${bild(w)}` : "";
                const hang = h.armN != null ? ` · HANG ${h.gefaelle} an ${JSON.stringify(h.ort)}: ${h.weg} m · Arm p50 ${h.armP50} min ${h.armMin} · ${h.schnapp} Schnapper, Arm-Weg ${h.armWeg} · Ruck seitlich p95 ${h.ruckP95} m (${h.ruckN} Bilder) · über der Fahrbahn p05 ${h.hochP05}° · Gleichlauf p95 ${h.gleichP95} (${h.gleichN}) · Rad zwischen den Stufen ≤ ${h.radWeg} (${h.radN}) · Aufbau ≤ ${h.stufeWeg} m · Wagen ${bild(h)}` : "";
                return `${m.typ} an ${JSON.stringify(m.bahn)} · Sicht ${m.sichtVor} → ${m.sichtRitt} → ${m.sichtNach} · ${m.weg} m in ${m.fahrTakte} Takten · Arm p50 ${m.armP50} min ${m.armMin} (${m.armN} Takte, ${m.imWagen} am Wagen) · Wagen ${bild(m)} · Aufbau ≤ ${m.stufeWeg} m · Rad zwischen den Stufen ≤ ${m.radWeg} (${m.radN})${wechsel}${hang}`;
            };
            urteil(n, `Fahrt E steigt ein in Third, W fährt ${SOLL.fahrM} m, der Arm hält ≥ ${SOLL.armMin}, der Wagen steht im Bild; Ego ↔ Third in der Fahrt; bergab am Steilhang; E steigt aus`, out.fahrt, fahrtVerdict, zeile);
            const alt = out.fahrtAlt ? fahrtVerdict(out.fahrtAlt) : [];
            check(
                "Selbst-Test im Lauf: der alte Mount-Follow (`_archInstanceUpdate` ohne den Band-Partner) macht die Fahrt ROT beim Namen",
                alt.some((t) => t.startsWith("aufbau")),
                out.fahrtAlt ? `${zeile(out.fahrtAlt)} — ${alt.join(" · ")}` : "nicht gefahren"
            );
        } else if (n === "wort") {
            urteil(n, "V-D6 der KI-Fehler nennt die Ursache (lokaler Dienst läuft nicht, nicht CORS)", out.ki, kiVerdict, (m) => `„${(m.fehler || "").slice(0, 90)}"`);
            urteil(n, "V-k5 V-k6 V-D8 der Satz trifft die Welt: kein Wasser → laute Absage · der Ort reist aufgelöst · das Label im Chat · keine Telemetrie", out.satz, satzVerdict, (m) =>
                `ohne Wasser ${m.amWasserOhneWasser} Eichen („${m.amWasserZeile}") · Absender ${m.birkenAbsender} Birken („${m.birkenZeile}") · Ort ${m.ortKnoten} · Empfänger ${m.birkenEmpfaenger} Birken ${m.empfaengerAbstandZumAbsender} m vom Absender · Telemetrie ${m.telemetrieImChat}`);
            const opZeile = (om, op) => {
                const e = (om.ops || {})[op] || {};
                return `${op} ${e.fehler ? "wirft" : e.akte && e.akte.length ? `${e.akte.length} Akt(e)` : e.grund ? "benannt" : "still"}`;
            };
            urteil(n, "V-k5-Klasse jede Op mit near_water in trockener Welt scheitert benannt (0 Würfe, 0 Welt-Akte, die chain meldet ehrlich, kein Dorf beim Spieler)", out.ort, ortVerdict, (m) =>
                `${m.radius} m: ${ORT_OPS.map((op) => opZeile(m, op)).join(" · ")} · chain ${m.chain && m.chain.ok ? "Erfolg" : "abgesagt"} · Dorf-Aufträge ${m.dorfAuftraege}`);
            urteil(n, `V-k5-Klasse (Rest) jeder ungültige Ort scheitert benannt (${KNOTEN.length} Programme), die Defaults der Auflöser gelten`, out.knoten, knotenVerdict, (m) => {
                const kl = m.laeufe || {};
                const kd = m.defaults || {};
                const benannt = KNOTEN.filter(([name, , soll, effekt]) => knotenEintragOk(kl[name], soll, effekt)).length;
                const akte = KNOTEN.reduce((s, [name]) => s + ((kl[name] && kl[name].akte) || []).length, 0);
                return `${benannt}/${KNOTEN.length} benannt · ${akte} Welt-Akte ohne Ort · near_water ohne Radius „${kd.near_water}“ · vorn ohne Abstand ${kd.at_player_forward} m · Bedarf ohne Radius ${kd.at_field_need} m · Mess-Ort ohne Spieler ${JSON.stringify(m.messOrtOhneSpieler)}`;
            });
            urteil(n, "R2 das Wasser-Urteil ist bit-gleich zum vollen Scan, die Suche scannt trocken höchstens wie die 8-Strahlen-Suche", out.suche, sucheVerdict, (m) => {
                const zz = m.zaehlung || {};
                const z = (k) => (zz[k] ? `${k} ${zz[k].R} m: ${zz[k].proben} Proben/${zz[k].scans} Scans${zz[k].hoch != null ? ` (hochgerechnet ${zz[k].hoch})` : ""}` : `${k} —`);
                const ex = m.exakt ? `${m.exakt.falsch} von ${m.exakt.n} Urteilen abweichend (${m.exakt.nass} nass)` : "—";
                return [ex, ...["trinken", "chat", "ki"].flatMap((p) => [z(`${p}@trocken`), z(`${p}@plattform`)]), z("ki@trocken-voll")].join(" · ");
            });
        } else if (n === "werkstatt") {
            urteil(n, "V-D5 das Rezeptbuch urteilt nach dem Spielmodus (schöpfer gibt den Knopf frei)", out.rezept, rezeptVerdict, (m) => `frieden gesperrt ${m.friedenGesperrt} · schöpfer frei ${m.schoepferFrei}`);
            urteil(n, "V-D3 die Eiche der Werkstatt-Vorschau steht im Bild (Masken-Gesetz über die Vorschau-Vertices ≥ 99 %)", out.vorschau, vorschauVerdict, (m) =>
                `${m.vertices || 0} Proben · ${pct(m.anteil)} behalten · Maske im Render ${m.maskeImRender} · Welt-Auge ${m.augeAbstand} m`);
            const zZ = (wer, z) => (z ? `${wer} ${z.key} fremd ${z.fremd} · ${z.ms == null ? "nie" : z.ms + " ms"}` : `${wer} —`);
            urteil(n, `V-D3 Fremder Zug jeder Wartende erwacht nach einem fremd gezogenen Körper, jede Stufe der Vorschau nach ihrem Stoff (≤ ${SOLL.zugMs} ms)`, out.zug, zugVerdict, (m) =>
                `${zZ("vorschau", m.vorschau)} · ${zZ("hand", m.hand)} · Stufen ${(m.stufen || []).map((q) => `L${q.lod} ${q.ms == null ? "nie" : q.ms + " ms"}`).join(" · ")} · Vorrat ${m.vorrat ? `${m.vorrat.key} ${m.vorrat.auftraege}× bestellt` : "—"}`);
            urteil(n, `V-D3 Rahmen jede Gestalt füllt die Vorschau (projizierte Box3 in [${SOLL.rahmenMin}; ${SOLL.rahmenMax}] der Bildkante)`, out.rahmen, rahmenVerdict, (m) => {
                const s = (m.eintraege || []).map((q) => q.fuell).filter(Number.isFinite).sort((a, b) => a - b);
                return `${s.length} gemessen (min ${s[0]} · median ${s[s.length >> 1]} · max ${s[s.length - 1]}) · ${(m.eintraege || []).filter((q) => q.leer).length} ehrlich leer · ${m.waffenImBuch} Waffen · ${m.ms} ms`;
            });
        }
    }
    console.log(`  Bilder: ${Object.keys(out.bilder).map((b) => path.join(bilderOrt, b + ".png")).join(" · ")}`);
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Spielgang trägt seine Spieler-Gesetze.");
    process.exit(0);
})().catch((e) => {
    console.error("Spielgang-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
