// band-urteil.cjs — DAS URTEIL DER BAND-LINSE (W0): der Zensus eines Messorts (Klasse × Stufe × Pass, aus
// scripts/lib/draw-zaehler.cjs, die Klasse ist die Täter-Klasse des Stamms), der VRAM je Erzeuger und die GPU-Zeit
// gegen den Haushalt (spec/profiband/haushalt.json) und die Ratsche des Orts × Geräts × Sicht
// (`ratsche-<ort>-<gerät>-<sicht>.json`, K26) → die Tabelle
// Ist/Soll/Täter und ZWEI Urteile:
//
//   BAND     das Profi-Band selbst (Befehle · Dreiecke · VRAM · GPU-Zeit je Frame): ROT, solange ein Ist darüber liegt
//            — die Zahl, die jede Welle senkt (Pflicht-OFFEN E). Nie grün gefärbt, wenn es überschritten ist.
//   LINSE    was die Messung selbst bricht oder einen Rückschritt zeigt:
//     unbenannt  ein Befehl ohne Täter-Namen (`UNBENANNT:<type>`), ein Textur-Objekt ohne Erzeuger (Textur-Zensus)
//                oder GPU-Bytes ohne Erzeuger (`tex:?` im VRAM-Abgriff)
//     haushalt   ein benannter Täter, den keine Haushalt-Klasse nimmt — es gibt keine Sammelzeile: jede neue Klasse
//                einer Welle braucht ihre Regel (die stille Rest-Zeile nahm `bodenSatz` als „Einzelstück")
//     stufe      eine Nah-Stufe in der Ferne (die `stufenWand` des Haushalts — der stille L0-Rückfall)
//     ratsche    eine Klasse × Pass (oder ein VRAM-Erzeuger, oder die Summe) über ihrem letzten Ist plus Toleranz
//     leck       VRAM, den kein Bild trägt: Geometrie-Puffer, die nur der Foundry-Cache (`buf:ruhend`) oder nur r184s
//                Attribut-Register (`buf:verwaist`) hält — der Täter beim Namen (W6); und das Rahmen-Ziel des Direktpfads
//                (`tex:r184-ausgabe`), das eine Linse liegen ließ
//     weit       eine Ratsche über der Messung × (1 + Toleranz): sie hielte einen Rückschritt bis zu ihr grün
//     ungemessen keine gemessene Ratsche für diesen Ort × Gerät × Sicht
//   Den Exit der Messfolge trägt JEDE Rot-Zeile (omen-messfolge `bandBefunde`, K26); die Ratsche ziehen nur unbenannt ·
//   haushalt · ratsche · leck auf (`linse`), weit · stufe · ungemessen heilt der Nachzug bzw. der Re-Mint selbst.
//
// Die RATSCHE zieht nur die HÜLLE einer Mess-Serie nach (`werkbank ratsche`: ≥ 4 eingeschwungene Läufe der vollen
// Welt aus Erst- und Zweit-Boot, je Klasse × Pass das Maximum) und nur ohne Linsen-Fehler (unbenannt · haushalt ·
// ratsche); ein Stufen-Befund ist eine Kosten-Wahrheit, die Ratsche hält ihn fest, bis die Stufe fällt.
// Eine FREIE Klasse (`ratsche.frei`, je Grund mit dem Gate der Kosten je Einheit) misst den Weltzustand — die Tiere
// wandern —, die Ratsche hält sie nicht und die Summen-Ratsche zählt nur die gebundenen Klassen; im Band zählt sie voll.
//
//   Werkbank:  node scripts/werkbank.cjs umstellen --ort <id> · band --ort <id>   (die echte Messung am Ort, echte GPU)
//              node scripts/werkbank.cjs ratsche <band-*.json | messfolge-*.json …> [--neu]   (die Ratsche des Orts × Geräts ×
//              Sicht aus der Hülle einer Serie; `--neu` der Re-Mint, K26)
//   Wand:      node scripts/diag-profiband.cjs              (Schema, Summe <= Band, Selbsttests gegen injizierte Fälle)
"use strict";
const fs = require("fs");
const path = require("path");
const { vramFalte } = require("./draw-zaehler.cjs");

const SPEC = path.join(__dirname, "..", "..", "spec", "profiband");

// DIE MESSORTE (S1 W1f): das Band gilt überall, gemessen wird an benannten Orten — die Mess-Wiese (W0, Wald und
// Wiese fern vom Ursprung) und der Genesis-Ring (die Ankunft: zehn Kern-Portale, die Vorschauen). Je Ort Spieler,
// Blick, Dorf-Zug, Ort-Takt und seine EIGENE Ratsche (die Kosten zweier Orte sind zwei Hüllen, nie eine). Ohne Wahl
// gilt der erste Ort (die Mess-Wiese).
function ortOf(haushalt, id) {
    const orte = (haushalt && haushalt.messorte) || [];
    const o = id == null ? orte[0] : orte.find((x) => x.id === id);
    if (!o) throw new Error(`unbekannter Messort „${id}" (messorte: ${orte.map((x) => x.id).join(", ")})`);
    return o;
}

// DIE RATSCHE JE ORT × GERÄT × SICHT: die Kosten eines Orts sind auf der Radeon (iGPU) andere als auf der GTX (alte
// dGPU) und in der Ego-Sicht andere als in Third-Person.
// Jede Ratsche ist EINE Datei `ratsche-<ort>-<gerät>-<sicht>.json`; die Geräte und Sichten nennt der Haushalt (`geraete`,
// `sichten`), die Messung nennt, woran sie stand (`geraet`, `sicht`), und nur deren Ratsche richtet sie.
const ratscheDatei = (ortId, geraet, sicht) => `ratsche-${ortId}-${geraet}-${sicht}.json`;
// Ein Toggle-Ort (`bank`, die Prüfbühne) richtet die GPU-Zeit eines Schalters, nie das Band. Jeder andere Ort misst das Band (E an
// JEDEM Messort) und wählt seine Ratsche; Pflicht (H2b) ist sie an den Orten ohne Anlauf — ein Ort mit Anlauf (`anlauf`: die Stadt,
// die der Spieler gründet, Dach und Gipfel über der erwachten Stadt) urteilt `ungemessen`, bis die Serie seine Ratsche prägt.
const istBandOrt = (o) => o.bank === undefined && o.anlauf === undefined;

function ladeSpec(ortId, wahl) {
    const haushalt = JSON.parse(fs.readFileSync(path.join(SPEC, "haushalt.json"), "utf8"));
    const ort = ortOf(haushalt, ortId);
    const spec = { haushalt, ort, ratsche: null, ratscheDatei: null };
    // Die Ratsche wählt nur, wer Gerät UND Sicht nennt; ein Toggle-Ort (`bank`) trägt keine (`ratscheVon` bricht laut).
    if (wahl && ort.bank === undefined) {
        if (!(haushalt.geraete || {})[wahl.geraet] || !(haushalt.sichten || {})[wahl.sicht])
            throw new Error(
                `Ratschen-Wahl ${wahl.geraet} × ${wahl.sicht}: der Haushalt kennt die Geräte ` +
                    `${Object.keys(haushalt.geraete || {}).join(", ")} und die Sichten ${Object.keys(haushalt.sichten || {}).join(", ")}`
            );
        spec.ratscheDatei = ratscheDatei(ort.id, wahl.geraet, wahl.sicht);
        const f = path.join(SPEC, spec.ratscheDatei);
        // Eine fehlende Datei ist UNGEMESSEN (null): das Band-Urteil nennt sie rot (`ungemessen`), nie still ohne Ratsche.
        spec.ratsche = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
    }
    return spec;
}

// Die Ratsche eines Orts für ein Band-Urteil — ein Toggle-Ort hat keine, das Band richten die Band-Orte. `null` heißt
// ungemessen (die Datei fehlt) und urteilt rot.
function ratscheVon(spec) {
    if (spec.ort.bank !== undefined) throw new Error(`Messort ${spec.ort.id} ist ein Toggle-Ort ohne Ratsche (bank)`);
    return spec.ratsche;
}

// Eine Ratsche schreiben (`werkbank ratsche`): dieselbe Form wie gelesen, unter ihrem Namen Ort × Gerät × Sicht.
function schreibeRatsche(datei, ratsche) {
    fs.writeFileSync(path.join(SPEC, datei), JSON.stringify(ratsche, null, 4) + "\n");
}

// Das Gerät einer Messung: der Adapter-Text (WebGPU `adapterInfo`: Hersteller · Architektur · Beschreibung) gegen die
// Muster des Haushalts — kein Treffer oder zwei sind `null` (keine Ratsche richtet die Messung; das Urteil nennt es rot).
function geraetSchluessel(haushalt, text) {
    if (typeof text !== "string" || !text) return null;
    const treffer = Object.entries(haushalt.geraete || {}).filter(([, g]) => new RegExp(g.muster, "i").test(text));
    return treffer.length === 1 ? treffer[0][0] : null;
}
// Die Sicht einer Messung aus dem Kamera-Modus des Stamms (`state.cameraMode`: first | third).
function sichtSchluessel(haushalt, kamera) {
    const t = Object.entries(haushalt.sichten || {}).find(([, s]) => s.kamera === kamera);
    return t ? t[0] : null;
}
// Jede Ratsche, die der Haushalt fordert: Band-Ort × Gerät × Sicht, mit dem Inhalt der Datei (null = fehlt).
function ratschenAlle(haushalt) {
    const out = [];
    for (const o of (haushalt.messorte || []).filter(istBandOrt))
        for (const geraet of Object.keys(haushalt.geraete || {}))
            for (const sicht of Object.keys(haushalt.sichten || {})) {
                const datei = ratscheDatei(o.id, geraet, sicht);
                const f = path.join(SPEC, datei);
                out.push({ ort: o.id, geraet, sicht, datei, ratsche: fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null });
            }
    return out;
}

// Der Blick eines Orts als Gier des Stamms: die Kamera sieht entlang (sin yaw, 0, cos yaw) (gemessen an der Welt:
// yaw 0 → +z, π/2 → +x), also yaw = atan2(dx, dz) zum Blickpunkt.
function ortGier(ort) {
    return Math.atan2(ort.blick[0] - ort.spieler[0], ort.blick[1] - ort.spieler[1]);
}

// DER GESTELLTE ORT eines Laufs (`werkbank band` zeichnet ihn auf: der Ort der letzten Aufstellung, der Dorf-Zug, der
// Ort-Takt und die Gier beim Zählen) gegen den Ort, den der Lauf nennt — jede Abweichung beim Namen. Ein Lauf ohne
// Aufzeichnung ist ungestellt. DIE SICHT gehört zum gestellten Ort: `sicht` ist die verlangte (ego | third), `z.sicht` die
// gezählte — ohne Verlangen prüft die Wache nur, dass die Messung ihre Sicht nennt.
function ortGestellt(ort, z, sicht) {
    if (!z) return ["keine Aufzeichnung des gestellten Orts (ein Lauf vor der Orts-Wache)"];
    const f = [];
    if (!z.sicht) f.push("keine Sicht aufgezeichnet (Ego oder Third-Person)");
    else if (sicht != null && z.sicht !== sicht) f.push(`Sicht ${z.sicht}, verlangt ${sicht}`);
    if (z.ort !== ort.id) f.push(`aufgestellt ${z.ort ? "am Ort " + z.ort : "ohne --ort"}, nicht ${ort.id}`);
    if (z.dorfZug !== ort.dorfZug) f.push(`Dorf-Zug ${z.dorfZug ? "läuft" : "ruht"}, der Ort will ${ort.dorfZug ? "laufend" : "ruhend"}`);
    const takt = (ort.ortTakt || []).join(",");
    if ((z.ortTakt || []).join(",") !== takt) f.push(`Ort-Takt [${(z.ortTakt || []).join(", ")}], der Ort will [${takt}]`);
    const d = Math.atan2(Math.sin(z.gier - ortGier(ort)), Math.cos(z.gier - ortGier(ort)));
    if (!Number.isFinite(z.gier) || Math.abs(d) > 0.01)
        f.push(`Gier ${Number.isFinite(z.gier) ? z.gier.toFixed(3) : "?"}, der Blick des Orts ${ortGier(ort).toFixed(3)}`);
    return f;
}

// Das Schema der Messorte: eindeutige ids, Spieler und Blick als [x, z], der Dorf-Zug als Wahrheitswert, der Ort-Takt
// als Liste von Stamm-Methoden (die Wand H6 in diag-profiband prüft, dass der Stamm sie trägt), die Ratsche als Datei
// in spec/profiband, die Soll-Zeilen benannt.
function messortePruefen(h) {
    const f = [];
    const orte = h && h.messorte;
    if (!Array.isArray(orte) || !orte.length) return ["messorte fehlt (mindestens ein Ort)"];
    const ids = new Set();
    const xz = (v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite);
    for (const o of orte) {
        if (!o || typeof o.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(o.id) || ids.has(o.id))
            f.push(`Messort ohne/mit doppelter id: ${o && o.id}`);
        ids.add(o && o.id);
        if (!o.titel) f.push(`${o.id}: titel fehlt`);
        if (!xz(o.spieler)) f.push(`${o.id}: spieler ist kein [x, z]`);
        if (!xz(o.blick)) f.push(`${o.id}: blick ist kein [x, z]`);
        else if (xz(o.spieler) && Math.hypot(o.blick[0] - o.spieler[0], o.blick[1] - o.spieler[1]) < 1)
            f.push(`${o.id}: blick liegt auf dem Spieler (keine Richtung)`);
        if (typeof o.dorfZug !== "boolean") f.push(`${o.id}: dorfZug ist kein Wahrheitswert`);
        if (!Array.isArray(o.ortTakt) || o.ortTakt.some((m) => typeof m !== "string" || !/^_?[A-Za-z]\w*$/.test(m)))
            f.push(`${o.id}: ortTakt ist keine Liste von Methoden-Namen`);
        // Der Anker (optional): die Stamm-Methode, die den Ort in der Welt nennt ({x, z}) — die Werkbank prüft beim
        // Aufstellen, dass `spieler` auf ihm steht (diag-profiband H6: der Stamm trägt sie).
        if (o.anker !== undefined && (typeof o.anker !== "string" || !/^_?[A-Za-z]\w*$/.test(o.anker)))
            f.push(`${o.id}: anker ist kein Methoden-Name`);
        // DER ANLAUF (`anlauf` [x, z]): dort steht der Spieler zuerst und schwingt ein, dann am Ort — mit `dach` (m) auf dem Dach. DIE
        // GRÜNDUNG (die Stadt): das Wort des Spielers am Anlauf (`dorf <same> <häuser>`), der Anker der Siedlung, und die Bahn — eine
        // Kette [x, z] ab dem Spieler, die `werkbank umstellen` auf ihrem Weg prüft.
        const g = o.gruendung;
        if ((g || o.dach || o.anlauf) !== undefined && !xz(o.anlauf)) f.push(`${o.id}: anlauf ist kein [x, z]`);
        if (g !== undefined && (!g || !/^dorf \d+ \d+$/.test(g.wort) || !xz(g.anker)))
            f.push(`${o.id}: gruendung ohne wort „dorf <same> <häuser>" oder anker [x, z]`);
        if (g !== undefined && !(Array.isArray(o.bahn) && o.bahn.length > 1 && o.bahn.every(xz) && `${o.bahn[0]}` === `${o.spieler}`))
            f.push(`${o.id}: bahn ist keine Kette [x, z] ab dem Spieler`);
        // DAS WIESEN-GESETZ (K55, `wiese`): die Mess-Wiese trägt es — jede Schwelle eine Zahl, Kranz und Fernblick als [von, bis];
        // das Urteil am Ort spricht gate:profiband H1 (am Gesetz) und `werkbank umstellen --ort` (in der Welt, mit Gras).
        if (o.id === "wiese" && o.wiese === undefined) f.push(`${o.id}: das Wiesen-Gesetz (wiese) fehlt`);
        if (o.wiese !== undefined) {
            const w = o.wiese || {};
            const zahl = ["ring", "hangMax", "trockenMarge", "kroneMax", "randMin", "blickFrei", "blickWinkel", "horizontMax", "grasMin"];
            const fehlt = zahl.filter((k) => typeof w[k] !== "number" || !Number.isFinite(w[k]));
            const spanne = (v) => xz(v) && v[0] >= 0 && v[1] > v[0];
            if (fehlt.length) f.push(`${o.id}: wiese ohne Zahl ${fehlt.join(", ")}`);
            if (!spanne(w.rand) || !spanne(w.fern)) f.push(`${o.id}: wiese.rand / wiese.fern ist kein [von, bis] (m)`);
            else if (!(w.rand[0] > w.ring)) f.push(`${o.id}: wiese.rand beginnt im Ring (${w.rand[0]} ≤ ${w.ring} m)`);
            if (!w.quelle) f.push(`${o.id}: wiese.quelle fehlt`);
        }
        // DER TOGGLE-ORT (1110-6): ein Ort mit `bank` richtet keine Band-Klasse, sondern die GPU-Zeit eines Schalters unter
        // 0,3 ms — eine geborene Welt (`welt`, relativ zu spec/), feste Stellgrößen des Reglers (`stell`), feste Posen und die
        // lange Bank. Er trägt keine Ratsche; jeder Band-Ort trägt eine.
        if (o.bank !== undefined) {
            if (o.ratsche !== undefined) f.push(`${o.id}: ein Toggle-Ort (bank) trägt keine Ratsche`);
            if (typeof o.welt !== "string" || !fs.existsSync(path.join(SPEC, "..", o.welt)))
                f.push(`${o.id}: welt ist keine Datei unter spec/`);
            const b = o.bank;
            if (!b || ![b.n, b.runden, b.je].every((v) => Number.isInteger(v) && v > 0) || !(b.soll > 0))
                f.push(`${o.id}: bank ohne n/runden/je (ganz, > 0) und soll (ms, > 0)`);
            // Eine Bank-Runde rendert n Frames in EINER Aufgabe, der Zeitstempel-Pool (2048) leert sich erst danach: an der
            // Prüfbühne braucht ein Frame ~9,7 Abfragen — 240 Frames verweigerten 288 (Stempel-Wache ROT, 1110-6).
            else if (b.n > 200) f.push(`${o.id}: bank.n ${b.n} füllt den Stempel-Pool je Runde (höchstens 200 Frames)`);
            const st = o.stell;
            if (!st || !Object.keys(st).length || Object.values(st).some((v) => typeof v !== "number" || !Number.isFinite(v)))
                f.push(`${o.id}: stell ist keine Liste fester Stellgrößen`);
            const pIds = new Set();
            if (!Array.isArray(o.posen) || !o.posen.length) f.push(`${o.id}: posen fehlt (mindestens eine)`);
            for (const p of o.posen || []) {
                if (!p || typeof p.id !== "string" || pIds.has(p.id) || !xz(p.spieler) || !xz(p.blick))
                    f.push(`${o.id}: Pose ohne/mit doppelter id oder ohne spieler/blick [x, z]: ${p && p.id}`);
                else if (Math.hypot(p.blick[0] - p.spieler[0], p.blick[1] - p.spieler[1]) < 1)
                    f.push(`${o.id}: Pose ${p.id} blickt auf den Spieler (keine Richtung)`);
                pIds.add(p && p.id);
            }
        } else if (o.ratsche !== undefined)
            // Die Datei folgt aus Ort × Gerät × Sicht (`ratsche-<ort>-<gerät>-<sicht>.json`, K26) — ein genannter Name wäre EINE
            // Ratsche für alle Geräte und Sichten (auf der GTX gerichtet).
            f.push(`${o.id}: ratsche ${o.ratsche} — die Ratsche folgt aus Ort × Gerät × Sicht, kein Ort nennt eine Datei`);
        // Eine Soll-Zeile: die Hülle EINES Exemplars der Art `art` im Pass `pass` — auf EINER Stufe (`stufe`, die Tor-Hülle
        // L0) oder über mehrere (`stufen`, der Wurf: was in der Kaskade für die Art wirft, gleich welche Stufe es ist).
        for (const s of o.soll || []) {
            const stufeOk =
                Number.isInteger(s.stufe) !== Array.isArray(s.stufen) &&
                (!Array.isArray(s.stufen) || (s.stufen.length > 0 && s.stufen.every((x) => Number.isInteger(x))));
            if (!s.name || !s.quelle || !(s.dreieckeJe > 0) || !s.art || !stufeOk || !s.pass)
                f.push(`${o.id}: Soll-Zeile ohne name/art/stufe|stufen/pass/dreieckeJe/quelle`);
        }
    }
    return f;
}

// DER SATZ-INHALT (S3 haus, 1b): ein Satz zeichnet je Pass EINEN Befehl über die Zellen seines Abschnitts — der Täter ist
// nicht der Satz, sondern was darin liegt (draw-zaehler `inhalt`: Klasse × Zellen × Dreiecke je Pass, dazu die Lücken des
// Laufs). Die Ratschen-Zeile und die Tabelle nennen ihn: „bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760".
const inhaltTris = (ih) => (ih || []).reduce((s, x) => s + (x.tris || 0), 0);
const tausend = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
function inhaltText(ih, n) {
    return (ih || [])
        .slice(0, n || 3)
        .map((x) => (x.klasse === "lücke" ? `Lücke ${tausend(x.tris)}` : `${x.klasse} ${x.zellen} Zellen = ${tausend(x.tris)}`))
        .join(" · ");
}

// WAS DIE WELT NOCH BAUT (Seiten-Kontext, die EINE Liste des Einschwingens der Band-Messung, `werkbank band`, und der
// Ruhe vor dem Stand-Fenster von gate:leistungs-vertrag): die Foundry-Schlange, Aufträge im Flug und Lieferungen vor dem
// Ingest-Takt, offene Karten-Bakes, der Streu-Nachschub, ein Chunk im Bau, aufgeschobene
// Streu-Regionen — und der DORF-ZUG (S3 haus, Messort dorf: der Zug läuft): ein Export unterwegs
// (`_autoSettlementPendingKey`) oder eine Siedlung, die über die Takte wächst (`_autoSettlementQueue`, ihre Häuser
// entstehen budgetiert). Ohne die Dorf-Wache zählte die Messung ein halbes Dorf. Und DER SATZ, DER NOCH SCHRUMPFT (1310-1):
// ein Satz über seinem Ziel wartet `ruheTakte` Render-Takte, bevor er auf seinen Inhalt schrumpft (`_chunkSatzVerdichten`,
// `ueberSeit` ≥ 0); ohne die Satz-Wache maß das Band am Dorf die Kapazität der Ankunft (VRAM 124,6 MB, nach 20 s Spiel 118,4:
// Bau-Sätze 8192 → 1024 Ecken, Boden-Index 1,31 M → 653 k). `{}` = nichts offen. Die Werkbank
// installiert sie in die Seite (`EINSCHWING_INSTALL`), gate:profiband prüft sie an einer gestellten Welt (Selbsttest).
function einschwingOffen(r) {
    const st = r.state;
    const f = r._foundry;
    const o = {};
    if (f && f.warte && f.warte.length) o.foundryWarte = f.warte.length;
    if (f && f.pending && f.pending.size) o.foundryImFlug = f.pending.size;
    // eine Lieferung, die angekommen ist und auf die Freigabe des Ingest-Takts wartet (`_foundryIngestTakt`), baut noch
    if (r._foundryIngestQueue && r._foundryIngestQueue.length) o.foundryIngest = r._foundryIngestQueue.length;
    const kb = (r._impostorBakeQueue || []).length;
    if (kb) o.kartenBake = kb;
    if (r._scatterRefillPending) o.streuNachschub = 1;
    if (st.voxelMeshPending && st.voxelMeshPending.size) o.chunkBau = st.voxelMeshPending.size;
    // Eine Streu-Region in Reichweite fehlt, wartet auf ein Asset oder eine Karte oder trägt eine offene Scheibe —
    // ruhig ist die Welt erst ohne sie (eine, die in Ruhe wartet, ist ein Befund: die Messung schwingt nicht ein).
    // Die EINE Antwort der Welt (`_streuWartet`).
    const streuListe = [];
    if (r._streuWartet(st.playerMesh ? st.playerMesh.position : null, streuListe)) o.streuWartet = streuListe.join(" · ");
    const q = r._autoSettlementQueue;
    if (q != null) o.dorfWaechst = q.plan && q.plan.slots ? `${q.idx}/${q.plan.slots.length}` : 1;
    if (r._autoSettlementPendingKey) o.dorfExport = r._autoSettlementPendingKey;
    let schrumpft = 0;
    for (const [, s] of st.chunkSaetze || []) if (s && s.ueberSeit >= 0) schrumpft++;
    if (schrumpft) o.satzSchrumpft = schrumpft;
    return o;
}

const familieOf = (klasse) => {
    const m = /^(f|fimp|fscatter|g):/.exec(klasse);
    return m ? m[1] : null;
};
const istUnbenannt = (klasse) => /^UNBENANNT:/.test(klasse);
const ganz = (x) => Number.isInteger(x) && x >= 0;
const nullOderZahl = (x) => x === null || (Number.isFinite(x) && x >= 0);
const LINSEN_ARTEN = ["unbenannt", "haushalt", "ratsche", "leck"];
// DER SPEICHER OHNE BILD (W6): ein Geometrie-Puffer, den kein Objekt des Szenen-Graphen zeichnet und den nur der Foundry-Cache
// (`ruhend`) oder nur r184s Attribut-Register (`verwaist`) hält (`__pufferZensus`, draw-zaehler) — VRAM an der Geschichte
// statt am Schirm. Jedes MB davon ist ein LECK, der Täter steht im Urteil beim Namen.
const LECK_ERZEUGER = /^buf:(ruhend|verwaist)$/;
// DAS RAHMEN-ZIEL DES DIREKTPFADS: r184 legt es nur an, wenn ein Render MIT Tonemapping auf die Leinwand geht
// (`_getFrameBufferTarget`: rgba16float + depth24plus, 15,8 + 7,9 MB bei 1080p, `isPostProcessingRenderTarget` → der Erzeuger
// `r184-ausgabe`). Die Post-Kette tut das nie (r184 schaltet Tonemapping und Farbraum für ihr Quad ab), im Spiel lebt es also
// nur im Rückfall ohne Kette. Steht es im Band, fuhr eine Linse den Direktpfad und ließ es liegen: in 0710-6 und 0710-9 trug
// `band --ort genesis` nach `zerlegen` 23,7 MB davon. Der Stamm entsorgt es, sobald die Kette wieder zeichnet (`_leinwandWeg`);
// was dennoch im Band steht, ist ein Linsen-Rest beim Namen. Gezählt aus dem VRAM-Abgriff (WebGPU), sonst aus den
// Textur-Objekten (jedes Backend).
const RAHMEN_ZIEL = /^r184-ausgabe/;
function rahmenZielBefunde(vram, texturen) {
    let mb = 0,
        n = 0;
    if (vram && Array.isArray(vram.liste)) {
        for (const v of vram.liste) {
            const { art, erzeuger } = erzeugerOf(v.k);
            if (art === "tex" && RAHMEN_ZIEL.test(erzeuger)) {
                mb += v.mb;
                n += v.n;
            }
        }
    } else if (texturen)
        for (const e of texturen.erzeuger || [])
            if (RAHMEN_ZIEL.test(e.erzeuger)) {
                mb += e.mb;
                n += e.n;
            }
    return n > 0
        ? [
              {
                  art: "leck",
                  schluessel: "leck:tex:r184-ausgabe",
                  ist: +mb.toFixed(1),
                  groesse: "vramMB",
                  text:
                      `tex:r184-ausgabe ${+mb.toFixed(1)} MB in ${n} Texturen — Rahmen-Ziel des Direktpfads, im Spiel nie ` +
                      "angelegt (eine Linse fuhr den Direktpfad und ließ es liegen)",
              },
          ]
        : [];
}
// Eine FREIE Klasse misst den Weltzustand, nicht die Kosten (die Tiere wandern: an der Mess-Wiese 0 bis 3 Arten im Bild):
// die Ratsche hält sie nicht, ihre Kosten je Einheit hält das Gate, das ihr Grund nennt. Im Band zählt sie voll.
const freiGrund = (ratsche, id) => (ratsche && ratsche.frei && ratsche.frei[id]) || null;

function regelPasst(regel, e) {
    if (regel.muster && !new RegExp(regel.muster).test(e.klasse)) return false;
    if (regel.familie && !regel.familie.includes(e.familie)) return false;
    if (regel.art && !regel.art.includes(e.art)) return false;
    if (regel.stufe && !regel.stufe.includes(e.stufe)) return false;
    return true;
}

// Der Täter-Schlüssel eines Zensus-Eintrags (draw-zaehler `klassen[]`: klasse · stufe · art) — das EINE Eingangs-Format
// von `zuordnen` (Band-Urteil und GPU-Zerlegung ordnen über dieselbe Regel).
const einOf = (e) => ({ klasse: e.klasse, familie: familieOf(e.klasse), stufe: e.stufe, art: e.art || null });

// Die Haushalt-Klasse eines Täter-Schlüssels: die erste Klasse, deren Regel passt; sonst keine (ROT `haushalt`).
function zuordnen(haushalt, e) {
    if (istUnbenannt(e.klasse)) return null;
    for (const k of haushalt.klassen) if ((k.regeln || []).some((r) => regelPasst(r, e))) return k.id;
    return null;
}

// Der Erzeuger eines VRAM-Schlüssels (`tex:<label> <format> <größe>` · `buf:<label>`): das gefaltete Label
// (`vramFalte`, dieselbe Regel wie der Abgriff — idempotent) bis zum ersten `:`/`#` (die Karten tragen
// `karte-albedo:<preset>|…`, r184 `bindingBuffer<id>_…`); `?` = ohne Namen.
// Die Geometrie der Tiere (`buf:szene:tier:<seele>`) ist ihr eigener Erzeuger `buf:tier`: sie misst den Weltzustand (die
// Tiere wandern an der Mess-Wiese um den Spieler, 0 bis 10 MB) — die freie Klasse `tier` trägt auch im Speicher keine Ratsche.
function erzeugerOf(k) {
    const m = /^(tex|buf):(\S*)/.exec(String(k));
    if (!m) return { art: "?", erzeuger: "?" };
    const label = m[2] ? vramFalte(m[2]) : "?";
    if (m[1] === "buf" && /^szene:tier:/.test(label)) return { art: "buf", erzeuger: "tier" };
    return { art: m[1], erzeuger: label === "?" ? "?" : label.split(/[:#]/)[0] || "?" };
}
// Ein VRAM-Erzeuger einer FREIEN Klasse (`buf:<id>` mit `ratsche.frei[id]`): Weltzustand, keine Ratsche.
const vramFrei = (ratsche, erzeuger) => {
    const m = /^buf:(.+)$/.exec(erzeuger);
    return !!(m && freiGrund(ratsche, m[1]));
};

// DIE PROBEN EINER MESSUNG: je Klasse × Pass das MAXIMUM über die Zähl-Frames (der teuerste Frame, den der Spieler an
// diesem Ort sieht — die Tiere wandern, der Takt rechnet zwischen den Proben weiter), dMax ebenso.
function zensusMax(proben) {
    const je = new Map();
    for (const z of proben)
        for (const e of z.klassen || []) {
            const a = je.get(e.klasse);
            if (!a) {
                je.set(e.klasse, JSON.parse(JSON.stringify(e)));
                continue;
            }
            for (const [p, c] of Object.entries(e.je || {})) a.je[p] = Math.max(a.je[p] || 0, c);
            for (const [p, t] of Object.entries(e.jeTris || {})) a.jeTris[p] = Math.max(a.jeTris[p] || 0, t);
            if (Number.isFinite(e.dMax)) a.dMax = Number.isFinite(a.dMax) ? Math.max(a.dMax, e.dMax) : e.dMax;
            if (Number.isFinite(e.dMin)) a.dMin = Number.isFinite(a.dMin) ? Math.min(a.dMin, e.dMin) : e.dMin;
            a.inst = Math.max(a.inst || 0, e.inst || 0);
            a.exemplare = Math.max(a.exemplare || 0, e.exemplare || 0);
            // der Satz-Inhalt je Pass (draw-zaehler 1b): der der Probe, deren Pass das Maximum trägt
            for (const [p, ih] of Object.entries(e.inhalt || {}))
                if (!a.inhalt || !a.inhalt[p] || inhaltTris(ih) > inhaltTris(a.inhalt[p]))
                    a.inhalt = Object.assign(a.inhalt || {}, { [p]: ih });
        }
    const klassen = [...je.values()];
    for (const k of klassen) {
        k.cmd = Object.values(k.je || {}).reduce((s, x) => s + x, 0);
        k.tris = Object.values(k.jeTris || {}).reduce((s, x) => s + x, 0);
    }
    klassen.sort((a, b) => b.cmd - a.cmd);
    return { klassen, proben: proben.length, unbenannt: proben.flatMap((z) => z.unbenannt || []).slice(0, 24) };
}

// DIE HÜLLE EINER MESS-SERIE (`werkbank ratsche <band-*.json…>`): die volle Welt schwankt auch eingeschwungen von Lauf
// zu Lauf (ein Bau an der Cull-Kante, die Schatten-Werfer der Streu, die Stufen der Fern-Streu, Erst- gegen Zweit-
// Boot) — die Ratsche nimmt darum nie einen Lauf, sondern die obere Hülle einer Serie: je Klasse × Pass das Maximum
// über alle Proben aller Läufe, der VRAM je Erzeuger und gesamt ebenso. `laeufe` = [{ zensus: [Klassen], vram,
// texturen }] (das `roh` der Band-Messung).
function bandHuelle(laeufe) {
    const zensus = zensusMax(laeufe.map((l) => ({ klassen: l.zensus || [] })));
    // Der VRAM je ERZEUGER: erst je Lauf summiert (die Puffer-Kennungen wechseln von Lauf zu Lauf), dann das Maximum.
    let vram = null;
    const je = new Map();
    for (const l of laeufe) {
        if (!l.vram) continue;
        vram = vram || { mb: 0, liste: [] };
        vram.mb = Math.max(vram.mb, l.vram.mb);
        const lauf = new Map();
        for (const v of l.vram.liste || []) {
            const { art, erzeuger } = erzeugerOf(v.k);
            const k = art + ":" + erzeuger;
            const e = lauf.get(k) || { k, mb: 0, n: 0 };
            e.mb += v.mb;
            e.n += v.n;
            lauf.set(k, e);
        }
        for (const e of lauf.values()) {
            const a = je.get(e.k);
            if (!a || e.mb > a.mb) je.set(e.k, { k: e.k, mb: +e.mb.toFixed(1), n: e.n });
        }
    }
    if (vram) vram.liste = [...je.values()];
    const texturen = laeufe.length ? laeufe[laeufe.length - 1].texturen || null : null;
    return { zensus, vram, texturen };
}

// DIE RENDER-ZIEL-KLASSE: die Ziele der Bild-Kette — Szenen-Ziel und -Tiefe, Tiefen-Abbild, die Ziele der zeitlichen
// Auflösung, die Schatten-Kaskaden, das Rahmen-Ziel — zählen fest je Schirm, nie je Welt (bei 1080p 71,4 MB am Kopf 45f1eeae,
// Genesis third). Ihr Haushalt (`renderZiele`: MB und das Muster ihrer Erzeuger) hält sie als EINE Klasse: darüber ROT mit
// jedem Erzeuger beim Namen (Art `renderziele`, eine Haushalts-Verletzung wie die Stufen-Wand, keine Linsen-Art).
function renderZieleUrteil(haushalt, erzeuger, rot) {
    const rz = haushalt && haushalt.renderZiele;
    if (!rz) return null;
    const muster = new RegExp(rz.erzeuger);
    const taeter = erzeuger.filter((e) => muster.test(e.erzeuger));
    const mb = +taeter.reduce((a, e) => a + e.mb, 0).toFixed(1);
    if (mb > rz.mb)
        rot.push({
            art: "renderziele",
            text:
                `Render-Ziele ${mb} MB über ihrem Haushalt ${rz.mb} MB (Täter: ` +
                taeter.map((e) => `${e.erzeuger} ${e.mb}`).join(" · ") +
                ")",
        });
    return { mb, soll: rz.mb, taeter: taeter.map((e) => e.erzeuger) };
}

function haushaltPruefen(h) {
    const f = [];
    if (!h || h.version !== 1) f.push("haushalt.version ist nicht 1");
    const b = (h && h.band) || {};
    for (const k of ["befehle", "dreiecke", "vramMB", "gpuMs"]) if (!(b[k] > 0)) f.push(`band.${k} fehlt`);
    const paesse = h && h.paesse;
    if (!Array.isArray(paesse) || !paesse.length) f.push("paesse fehlt");
    // DIE GERÄTE und DIE SICHTEN: je Gerät ein Titel und das Muster seines Adapter-Texts, je Sicht der Kamera-Modus
    // des Stamms — jede Ratsche gilt EINEM Ort × Gerät × Sicht.
    const ge = h && h.geraete;
    if (!ge || typeof ge !== "object" || !Object.keys(ge).length) f.push("geraete fehlt (je Gerät titel und muster)");
    for (const [k, g] of Object.entries(ge || {})) {
        if (!/^[a-z][a-z0-9]*$/.test(k) || !g || !g.titel || typeof g.muster !== "string") f.push(`geraete.${k}: titel und muster`);
        else
            try {
                new RegExp(g.muster, "i");
            } catch {
                f.push(`geraete.${k}: muster ${g.muster} ist kein Regex`);
            }
    }
    if (h && h.geraet !== undefined) f.push("geraet (EIN Gerät für jede Ratsche) ist abgelöst — geraete nennt jedes");
    const si = h && h.sichten;
    if (!si || typeof si !== "object" || !Object.keys(si).length) f.push("sichten fehlt (je Sicht titel und kamera)");
    for (const [k, s] of Object.entries(si || {}))
        if (!/^[a-z][a-z0-9]*$/.test(k) || !s || !s.titel || !["first", "third"].includes(s.kamera))
            f.push(`sichten.${k}: titel und kamera (first | third)`);
    f.push(...messortePruefen(h));
    const rz = h && h.renderZiele;
    if (!rz || !(rz.mb > 0) || typeof rz.erzeuger !== "string" || !rz.erzeuger || !rz.quelle)
        f.push("renderZiele braucht {mb > 0, erzeuger (Muster der Erzeuger), quelle}");
    else
        try {
            new RegExp(rz.erzeuger);
        } catch {
            f.push("renderZiele.erzeuger ist kein Muster");
        }
    const kl = (h && h.klassen) || [];
    if (!kl.length) f.push("keine Klassen");
    const ids = new Set();
    let sb = 0,
        st = 0;
    for (const k of kl) {
        if (!k.id || ids.has(k.id)) f.push(`Klasse ohne/mit doppelter id: ${k.id}`);
        ids.add(k.id);
        if (!ganz(k.befehle) || !ganz(k.dreiecke)) f.push(`${k.id}: befehle/dreiecke sind keine ganzen Zahlen >= 0`);
        sb += k.befehle || 0;
        st += k.dreiecke || 0;
        // Die Sammelzeile ist gefallen: sie nahm jede unbekannte Klasse still auf (fail-soft) — der ROT-Weg
        // `haushalt` war tot.
        if (k.rest !== undefined) f.push(`${k.id}: \`rest\` ist die stille Sammelzeile — jede Klasse trägt Regeln`);
        if (!Array.isArray(k.regeln)) f.push(`${k.id}: regeln fehlt`);
        for (const r of k.regeln || []) {
            if (!r.muster && !r.familie && !r.art && !r.stufe) f.push(`${k.id}: leere Regel`);
            if (r.muster)
                try {
                    new RegExp(r.muster);
                    // Ein Muster ist verankert: vorn `^`, hinten `$` oder ein Namensraum-Trenner `:` (`^tier:`) —
                    // `^g:(…|tor)` fing g:torus, `^(bau|…)` jeden „baum…".
                    if (!r.muster.startsWith("^") || !(r.muster.endsWith("$") || r.muster.endsWith(":")))
                        f.push(`${k.id}: Muster ${r.muster} ohne Anker (vorn ^, hinten $ oder :)`);
                } catch {
                    f.push(`${k.id}: Muster ${r.muster} ist kein Regex`);
                }
        }
    }
    if (sb > b.befehle) f.push(`Haushalt-Summe ${sb} Befehle über dem Band ${b.befehle}`);
    if (st > b.dreiecke) f.push(`Haushalt-Summe ${st} Dreiecke über dem Band ${b.dreiecke}`);
    for (const w of (h && h.stufenWand) || [])
        if (!ganz(w.stufe) || !(w.maxM > 0) || !w.grund) f.push("stufenWand-Eintrag ohne stufe/maxM/grund");
    return { fehler: f, summe: { befehle: sb, dreiecke: st } };
}

function ratschePruefen(r, h) {
    const f = [];
    if (!r || r.version !== 1) f.push("ratsche.version ist nicht 1");
    if (!(typeof r.toleranzPct === "number" && r.toleranzPct >= 0)) f.push("toleranzPct fehlt");
    const ta = r && r.toleranzAbs;
    if (!ta || !ganz(ta.befehle) || !ganz(ta.dreiecke) || !nullOderZahl(ta.vramMB))
        f.push("toleranzAbs braucht {befehle, dreiecke, vramMB} (Zahlen >= 0)");
    if (!(r.gemessen === null || (r.gemessen && typeof r.gemessen.datum === "string")))
        f.push("gemessen ist weder null noch { datum, … } (der letzte Nachzug)");
    if (r.gemessen && r.gemessen.eingeschwungen !== true)
        f.push("gemessen stammt aus keiner eingeschwungenen Messung (die Ratsche nimmt nur sie)");
    for (const k of ["befehle", "dreiecke", "vramMB"])
        if (!r.gesamt || !nullOderZahl(r.gesamt[k])) f.push(`gesamt.${k} ist weder null noch Zahl >= 0`);
    const ids = (h.klassen || []).map((k) => k.id);
    const paesse = h.paesse;
    for (const id of ids) {
        const e = r.klassen && r.klassen[id];
        if (!e) {
            f.push(`Ratsche ohne Klasse ${id}`);
            continue;
        }
        for (const p of paesse) {
            const z = e[p];
            if (!z || !nullOderZahl(z.befehle) || !nullOderZahl(z.dreiecke))
                f.push(`Ratsche ${id}.${p} braucht {befehle, dreiecke} (null oder Zahl >= 0)`);
        }
        for (const p of Object.keys(e)) if (!paesse.includes(p)) f.push(`Ratsche ${id} trägt fremden Pass ${p}`);
    }
    for (const id of Object.keys((r && r.klassen) || {}))
        if (!ids.includes(id)) f.push(`Ratsche trägt Klasse ${id}, die der Haushalt nicht kennt`);
    for (const [id, grund] of Object.entries((r && r.frei) || {})) {
        if (!ids.includes(id)) f.push(`frei: ${id} ist keine Haushalt-Klasse`);
        if (typeof grund !== "string" || !/gate:[a-z-]+/.test(grund))
            f.push(`frei.${id} braucht einen Grund, der das Gate der Kosten je Einheit nennt (gate:…)`);
        const e = r.klassen && r.klassen[id];
        if (e && Object.values(e).some((z) => z && (z.befehle != null || z.dreiecke != null)))
            f.push(`frei.${id}: eine freie Klasse trägt keine Ratschen-Werte`);
    }
    for (const [k, v] of Object.entries((r && r.vramMB) || {}))
        if (!nullOderZahl(v)) f.push(`vramMB.${k} ist weder null noch Zahl >= 0`);
    return f;
}

// Liegt ein Ist über seiner Ratsche? Relativ (toleranzPct) UND absolut (toleranzAbs: kleine Zahlen sind diskret —
// ein Tier mehr im Bild sind +6 Befehle, kein Rückschritt).
function ueberRatsche(ist, r, ratsche, groesse) {
    if (r == null) return false;
    const pct = 1 + ((ratsche && ratsche.toleranzPct) || 0) / 100;
    const abs = (ratsche && ratsche.toleranzAbs && ratsche.toleranzAbs[groesse]) || 0;
    return ist > Math.max(r * pct, r + abs);
}

// zensus   = { klassen: [{klasse, stufe, art, je:{pass:cmd}, jeTris:{pass:tris}, dMax}], kamera } (ein Frame oder
//            `zensusMax` über die Proben)
// vram     = { mb, liste: [{k, mb, n}] } (der VRAM-Abgriff der Werkbank, nur WebGPU) oder null
// texturen = { mb, erzeuger: [{erzeuger, mb, n}], unbenannt: [Spur] } (Textur-Objekte, jedes Backend) oder null
// gpu      = { gpuJeFrameMs } (die GPU-Bank) oder null
function bandUrteil({ zensus, vram, texturen, gpu, haushalt, ratsche, ort, ratscheDatei }) {
    const paesse = haushalt.paesse;
    const rot = [];
    const zeilen = new Map();
    const zeile = (id, titel, soll) => {
        if (!zeilen.has(id))
            zeilen.set(id, {
                id,
                titel,
                soll,
                ist: { befehle: 0, dreiecke: 0 },
                je: Object.fromEntries(paesse.map((p) => [p, { befehle: 0, dreiecke: 0 }])),
                taeter: [],
            });
        return zeilen.get(id);
    };
    for (const k of haushalt.klassen) zeile(k.id, k.titel, { befehle: k.befehle, dreiecke: k.dreiecke });
    const ausserhalb = {};
    for (const e of zensus.klassen || []) {
        const ein = einOf(e);
        let cmd = 0,
            tris = 0;
        const je = {};
        for (const [p, c] of Object.entries(e.je || {})) {
            const t = (e.jeTris || {})[p] || 0;
            if (!paesse.includes(p)) {
                ausserhalb[p] = (ausserhalb[p] || 0) + c;
                continue;
            }
            cmd += c;
            tris += t;
            je[p] = { befehle: c, dreiecke: t };
        }
        for (const w of haushalt.stufenWand || []) {
            if (w.familie && !w.familie.includes(ein.familie)) continue;
            if (w.art && !w.art.includes(ein.art)) continue;
            if (ein.stufe !== w.stufe) continue;
            if (Number.isFinite(e.dMax) && e.dMax > w.maxM)
                rot.push({
                    art: "stufe",
                    schluessel: `stufe:${e.klasse}:L${w.stufe}`,
                    ist: e.dMax,
                    groesse: null,
                    text: `${e.klasse}: L${w.stufe} bis ${e.dMax} m im Hauptbild (Wand ${w.maxM} m) — ${w.grund}`,
                });
        }
        if (!cmd && !tris) continue;
        let id = zuordnen(haushalt, ein);
        if (istUnbenannt(e.klasse)) {
            rot.push({
                art: "unbenannt",
                schluessel: `unbenannt:${e.klasse}`,
                ist: cmd,
                groesse: "befehle",
                text: `${e.klasse}: ${cmd} Befehle ohne Täter-Namen (Spur: zensus.unbenannt)`,
            });
            id = "UNBENANNT";
        } else if (!id) {
            rot.push({
                art: "haushalt",
                schluessel: `haushalt:${e.klasse}`,
                ist: cmd,
                groesse: "befehle",
                text: `${e.klasse}: ${cmd} Befehle, keine Haushalt-Klasse nimmt den Täter (Regel in haushalt.json)`,
            });
            id = "OHNE-HAUSHALT";
        }
        const z = zeile(id, id, { befehle: 0, dreiecke: 0 });
        z.ist.befehle += cmd;
        z.ist.dreiecke += tris;
        for (const [p, v] of Object.entries(je)) {
            z.je[p].befehle += v.befehle;
            z.je[p].dreiecke += v.dreiecke;
        }
        z.taeter.push({
            klasse: e.klasse,
            befehle: cmd,
            dreiecke: tris,
            je,
            dMax: e.dMax != null ? e.dMax : null,
            ...(e.inhalt ? { inhalt: e.inhalt } : {}),
        });
    }
    // DIE RATSCHE: eine Klasse × Pass darf nur fallen.
    for (const z of zeilen.values()) {
        z.taeter.sort((a, b) => b.befehle - a.befehle || b.dreiecke - a.dreiecke);
        const rz = ratsche && ratsche.klassen && ratsche.klassen[z.id];
        z.ratsche = rz || null;
        z.frei = freiGrund(ratsche, z.id);
        if (!rz || z.frei) continue;
        for (const p of paesse) {
            const r = rz[p] || {};
            for (const g of ["befehle", "dreiecke"])
                if (ueberRatsche(z.je[p][g], r[g], ratsche, g))
                    rot.push({
                        art: "ratsche",
                        schluessel: `ratsche:${z.id}:${p}:${g}`,
                        ist: z.je[p][g],
                        groesse: g,
                        text: `${z.id} ${p}: ${z.je[p][g]} ${g} über der Ratsche ${r[g]} (Täter: ${z.taeter
                            .slice(0, 3)
                            .map((t) =>
                                t.inhalt && t.inhalt[p] ? `${t.klasse} ${p}: ${inhaltText(t.inhalt[p])}` : t.klasse
                            )
                            .join(", ")})`,
                    });
        }
    }
    const summe = { befehle: 0, dreiecke: 0, je: Object.fromEntries(paesse.map((p) => [p, 0])) };
    // Die gebundene Summe (ohne die freien Klassen des Weltzustands) trägt die Summen-Ratsche.
    const gebunden = { befehle: 0, dreiecke: 0 };
    for (const z of zeilen.values()) {
        summe.befehle += z.ist.befehle;
        summe.dreiecke += z.ist.dreiecke;
        for (const p of paesse) summe.je[p] += z.je[p].befehle;
        if (z.frei) continue;
        gebunden.befehle += z.ist.befehle;
        gebunden.dreiecke += z.ist.dreiecke;
    }
    summe.gebunden = gebunden;
    // DER VRAM je Erzeuger (Abgriff am GPUDevice: das Label ist `texture.name` bzw. das Puffer-Label von r184).
    let speicher = null;
    if (vram && Array.isArray(vram.liste)) {
        const je = new Map();
        for (const v of vram.liste) {
            const { art, erzeuger } = erzeugerOf(v.k);
            const key = art + ":" + erzeuger;
            const e = je.get(key) || { erzeuger: key, mb: 0, n: 0, form: [] };
            e.mb += v.mb;
            e.n += v.n;
            e.form.push(v);
            je.set(key, e);
            if (art === "tex" && erzeuger === "?")
                rot.push({
                    art: "unbenannt",
                    schluessel: `unbenannt:${v.k}`,
                    ist: v.mb,
                    groesse: "vramMB",
                    text: `${v.k}: ${v.mb} MB in ${v.n} Texturen ohne Erzeuger-Namen`,
                });
        }
        // Je Erzeuger seine drei größten Schlüssel (die Täter-Klassen eines Halters, die Formen einer Textur).
        const liste = [...je.values()]
            .map((e) => {
                e.mb = +e.mb.toFixed(1);
                e.form = e.form
                    .sort((a, b) => b.mb - a.mb)
                    .slice(0, 3)
                    .map((v) => v.k);
                return e;
            })
            .sort((a, b) => b.mb - a.mb);
        for (const e of liste)
            if (LECK_ERZEUGER.test(e.erzeuger) && e.mb > 0)
                rot.push({
                    art: "leck",
                    schluessel: `leck:${e.erzeuger}`,
                    ist: e.mb,
                    groesse: "vramMB",
                    text: `VRAM-Leck ${e.erzeuger}: ${e.mb} MB in ${e.n} Puffern, die kein Bild trägt (${e.form.join(" · ")})`,
                });
        const rv = (ratsche && ratsche.vramMB) || {};
        let frei = 0;
        for (const e of liste) {
            if (vramFrei(ratsche, e.erzeuger)) {
                frei += e.mb;
                continue;
            }
            if (ueberRatsche(e.mb, rv[e.erzeuger], ratsche, "vramMB"))
                rot.push({
                    art: "ratsche",
                    schluessel: `ratsche:vram:${e.erzeuger}`,
                    ist: e.mb,
                    groesse: "vramMB",
                    text: `VRAM ${e.erzeuger}: ${e.mb} MB über der Ratsche ${rv[e.erzeuger]}`,
                });
        }
        // gebunden = ohne die freien Erzeuger (wie die Summen-Ratsche der Befehle): die Ratsche hält, was Kosten sind
        speicher = { mb: vram.mb, gebunden: +(vram.mb - frei).toFixed(1), band: haushalt.band.vramMB, erzeuger: liste };
        speicher.renderZiele = renderZieleUrteil(haushalt, liste, rot);
    }
    rot.push(...rahmenZielBefunde(vram, texturen));
    // DIE TEXTUR-OBJEKTE (Backend-unabhängig): jedes trägt seinen Erzeuger — selbst oder über sein Render-Ziel.
    if (texturen)
        for (const t of texturen.unbenannt || [])
            rot.push({
                art: "unbenannt",
                schluessel: `unbenannt:textur:${t.klasse}:${(t.groesse || []).join("x")}`,
                ist: t.mb,
                groesse: "vramMB",
                text:
                    `Textur-Objekt ohne Erzeuger: ${t.klasse}${t.tiefe ? " (Tiefe)" : ""} ${(t.groesse || []).join("x")} ` +
                    `${t.mb} MB${t.ziel ? " in einem namenlosen Ziel" : ", ohne Ziel"}`,
            });
    const rg = (ratsche && ratsche.gesamt) || {};
    if (ueberRatsche(gebunden.befehle, rg.befehle, ratsche, "befehle"))
        rot.push({
            art: "ratsche",
            schluessel: "ratsche:gesamt:befehle",
            ist: gebunden.befehle,
            groesse: "befehle",
            text: `Summe (gebunden) ${gebunden.befehle} Befehle über der Ratsche ${rg.befehle}`,
        });
    if (ueberRatsche(gebunden.dreiecke, rg.dreiecke, ratsche, "dreiecke"))
        rot.push({
            art: "ratsche",
            schluessel: "ratsche:gesamt:dreiecke",
            ist: gebunden.dreiecke,
            groesse: "dreiecke",
            text: `Summe (gebunden) ${gebunden.dreiecke} Dreiecke über der Ratsche ${rg.dreiecke}`,
        });
    if (speicher && ueberRatsche(speicher.gebunden, rg.vramMB, ratsche, "vramMB"))
        rot.push({
            art: "ratsche",
            schluessel: "ratsche:gesamt:vramMB",
            ist: speicher.gebunden,
            groesse: "vramMB",
            text: `VRAM ${speicher.gebunden} MB (gebunden) über der Ratsche ${rg.vramMB}`,
        });
    // UNGEMESSEN: ohne Ratsche dieses Orts × Geräts × Sicht richtet keine Zeile — rot beim Namen, nie still.
    if (!ratsche || ratsche.gemessen == null)
        rot.push({
            art: "ungemessen",
            schluessel: "ratsche:ungemessen",
            ist: null,
            groesse: null,
            text:
                `keine gemessene Ratsche${ratscheDatei ? " " + ratscheDatei : ""}${ort ? " am Ort " + ort.id : ""} — ` +
                "dieser Ort × Gerät × Sicht ist ungemessen, die Re-Mint-Serie fehlt (werkbank ratsche --neu)",
        });
    // ZU WEIT: eine Ratsche über der Messung × (1 + Toleranz) hält keinen Gewinn — der Rückschritt bis zu ihr bliebe grün.
    else rot.push(...ratscheWeit(ratsche, { klassen: [...zeilen.values()], summe: { gebunden }, vram: speicher }, paesse));
    // DAS BAND: jede Größe gegen ihr Soll — ROT, solange ein Ist darüber liegt.
    const B = haushalt.band;
    const gpuMs = gpu && Number.isFinite(gpu.gpuJeFrameMs) ? gpu.gpuJeFrameMs : null;
    const groessen = [
        { name: "Befehle", ist: summe.befehle, soll: B.befehle },
        { name: "Dreiecke", ist: summe.dreiecke, soll: B.dreiecke },
        { name: "VRAM MB", ist: speicher && Number.isFinite(speicher.mb) ? speicher.mb : null, soll: B.vramMB },
        { name: "GPU ms/Frame", ist: gpuMs, soll: B.gpuMs },
    ].map((g) => Object.assign(g, { faktor: g.ist == null ? null : +(g.ist / g.soll).toFixed(2) }));
    const ueber = groessen.filter((g) => g.ist != null && g.ist > g.soll);
    const linse = rot.some((r) => LINSEN_ARTEN.includes(r.art));
    return {
        // GRUEN nur, wenn das Band hält UND die Linse nichts findet; die Ratsche zieht nach, wenn `linse` sauber ist.
        urteil: ueber.length || rot.length ? "ROT" : "GRUEN",
        linse: linse ? "ROT" : "SAUBER",
        bandUrteil: ueber.length ? "UEBER" : groessen.some((g) => g.ist == null) ? "UNGEMESSEN" : "IM BAND",
        groessen,
        rot,
        band: B,
        summe,
        abstand: {
            befehle: +(summe.befehle / B.befehle).toFixed(2),
            dreiecke: +(summe.dreiecke / B.dreiecke).toFixed(2),
            vram: speicher && Number.isFinite(speicher.mb) ? +(speicher.mb / B.vramMB).toFixed(2) : null,
            gpu: gpuMs == null ? null : +(gpuMs / B.gpuMs).toFixed(2),
        },
        ausserhalb,
        klassen: [...zeilen.values()],
        vram: speicher,
        texturen: texturen ? { n: texturen.n, mb: texturen.mb, erzeuger: texturen.erzeuger } : null,
        ort: ort ? ort.id : null,
        soll: ort ? ortSoll(ort, zensus) : [],
        // die Toleranz der richtenden Ratsche: der Leser der Messfolge vergleicht damit B gegen die Basis-Seite A
        toleranz: ratsche ? { toleranzPct: ratsche.toleranzPct, toleranzAbs: ratsche.toleranzAbs } : null,
    };
}

// DIE ZU WEITE RATSCHE (K26, rein): je gebundene Klasse × Pass × Größe, die Summe und jeder VRAM-Erzeuger, deren Ratsche über
// der Messung liegt — über max(Ist × (1 + toleranzPct), Ist + toleranzAbs), die Regel der Ratsche gespiegelt. `u` ist ein
// Band-Urteil oder eine gespeicherte Band-Messung (`klassen[].je`, `summe.gebunden`, `vram`).
function ratscheWeit(ratsche, u, paesse) {
    const out = [];
    if (!ratsche || !u) return out;
    const weit = (schluessel, r, ist, g, text) => {
        if (r == null || !Number.isFinite(ist)) return;
        if (ueberRatsche(r, ist, ratsche, g))
            out.push({ art: "weit", schluessel, ist: r, groesse: null, text: `${text}: Ratsche ${r} über der Messung ${ist} — zu weit` });
    };
    const je = new Map((u.klassen || []).map((z) => [z.id, z]));
    for (const [id, rz] of Object.entries(ratsche.klassen || {})) {
        if (freiGrund(ratsche, id)) continue;
        const z = je.get(id);
        for (const p of paesse)
            for (const g of ["befehle", "dreiecke"]) {
                const ist = z && z.je && z.je[p] ? z.je[p][g] || 0 : 0;
                weit(`weit:${id}:${p}:${g}`, (rz[p] || {})[g], ist, g, `${id} ${p} ${g}`);
            }
    }
    const rg = ratsche.gesamt || {};
    const geb = (u.summe && u.summe.gebunden) || null;
    if (geb) {
        weit("weit:gesamt:befehle", rg.befehle, geb.befehle, "befehle", "Summe (gebunden) Befehle");
        weit("weit:gesamt:dreiecke", rg.dreiecke, geb.dreiecke, "dreiecke", "Summe (gebunden) Dreiecke");
    }
    if (u.vram && Array.isArray(u.vram.erzeuger)) {
        const mb = new Map(u.vram.erzeuger.map((e) => [e.erzeuger, e.mb]));
        for (const [k, r] of Object.entries(ratsche.vramMB || {}))
            if (!vramFrei(ratsche, k)) weit(`weit:vram:${k}`, r, mb.get(k) || 0, "vramMB", `VRAM ${k}`);
        weit("weit:gesamt:vramMB", rg.vramMB, u.vram.gebunden != null ? u.vram.gebunden : u.vram.mb, "vramMB", "VRAM (gebunden)");
    }
    return out;
}

// DIE SOLL-ZEILEN EINES ORTS (haushalt.messorte[].soll): je Studio-Klasse der Art `art` auf Stufe `stufe` die Hülle EINES
// Exemplars im Pass `pass` — die Dreiecke des Passes geteilt durch die Exemplare (die verschiedenen Orte ihrer Instanzen,
// draw-zaehler `exemplare`; zwei Tore einer Vorlage in zwei Gestalten sind zwei Züge-Sätze, `inst / Züge` zählte sie als
// eines): an den Toren des Genesis-Rings die Tor-Hülle gegen das Band je Tor (W3d). Ein Zensus ohne Exemplar-Zahl (vor S1)
// trägt keine Soll-Zeile.
// DER WURF (S3 haus, `stufen`): was in einer Kaskade für die Art wirft, gleich welche Stufe — über die Art zusammen, die
// Exemplare aus dem Satz-Inhalt (je Zelle ihr Eintrag: das Haus, die Feuerstelle); eine Klasse außerhalb eines Satzes (ein
// Tür-Flügel) zählt ihre Dreiecke mit, Exemplare trägt sie im Schatten-Pass keine. Am Dorf: der Haus-Wurf je Haus und
// Kaskade gegen 96 Dreiecke (die Stufe 3 des Gesetzbuchs).
function ortSoll(ort, zensus) {
    const out = [];
    for (const s of ort.soll || []) {
        if (Array.isArray(s.stufen)) {
            let tris = 0;
            const ids = new Set();
            const je = new Map();
            const dazu = (kl, t) => {
                tris += t;
                je.set(kl, (je.get(kl) || 0) + t);
            };
            for (const e of zensus.klassen || []) {
                if (e.art === s.art && s.stufen.includes(e.stufe)) dazu(e.klasse, (e.jeTris || {})[s.pass] || 0);
                for (const x of (e.inhalt || {})[s.pass] || [])
                    if (x.art === s.art && s.stufen.includes(x.stufe)) {
                        dazu(x.klasse, x.tris);
                        for (const id of x.eintraege || []) ids.add(id);
                    }
            }
            if (!tris || !ids.size) continue;
            const huelle = Math.round(tris / ids.size);
            out.push({
                name: s.name,
                klasse: `${s.art} ${s.pass}`,
                exemplare: ids.size,
                huelle,
                soll: s.dreieckeJe,
                faktor: +(huelle / s.dreieckeJe).toFixed(2),
                taeter: [...je.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([kl, t]) => `${kl} ${tausend(t)}`)
                    .join(" · "),
            });
            continue;
        }
        for (const e of zensus.klassen || []) {
            if (e.art !== s.art || e.stufe !== s.stufe) continue;
            const tris = (e.jeTris || {})[s.pass] || 0;
            const exemplare = e.exemplare || 0;
            if (!tris || !exemplare) continue;
            const huelle = Math.round(tris / exemplare);
            out.push({
                name: s.name,
                klasse: e.klasse,
                exemplare: +exemplare.toFixed(2),
                huelle,
                soll: s.dreieckeJe,
                faktor: +(huelle / s.dreieckeJe).toFixed(2),
            });
        }
    }
    return out.sort((x, y) => y.huelle - x.huelle);
}

// DIE RATSCHE NACHZIEHEN (`werkbank ratsche`, die Hülle einer eingeschwungenen Serie der echten GPU, nur ohne Linsen-
// Fehler): jedes Ist — Klasse × Pass, die Summe, der VRAM je Erzeuger — setzt ein ungemessenes Feld und senkt ein
// gemessenes; heben tut sie nie (ein Ist darüber ist ROT, heben ist ein begründeter Akt von Hand im Commit).
// `nur: "vram"` (W6): ein Schnitt, der nur den Speicher bewegt, zieht nur den VRAM nach — die Klassen-Zeilen bleiben die
// Hülle ihrer eigenen Serie (`gemessen`), die VRAM-Serie steht in `gemessen.vram`.
function ratscheNachziehen(ratsche, u, gemessen, nur) {
    const neu = JSON.parse(JSON.stringify(ratsche));
    const aenderungen = [];
    const setze = (obj, key, ist, name) => {
        if (!(Number.isFinite(ist) && ist >= 0)) return;
        const alt = obj[key];
        if (alt == null || ist < alt) {
            obj[key] = ist;
            aenderungen.push(`${name}: ${alt == null ? "–" : alt} → ${ist}`);
        }
    };
    for (const z of nur === "vram" ? [] : u.klassen) {
        const rz = neu.klassen[z.id];
        if (!rz || freiGrund(neu, z.id)) continue;
        for (const p of Object.keys(rz))
            for (const g of ["befehle", "dreiecke"]) setze(rz[p], g, z.je[p] ? z.je[p][g] : 0, `${z.id}.${p}.${g}`);
    }
    if (nur !== "vram") {
        setze(neu.gesamt, "befehle", u.summe.gebunden.befehle, "gesamt.befehle");
        setze(neu.gesamt, "dreiecke", u.summe.gebunden.dreiecke, "gesamt.dreiecke");
    }
    if (u.vram) {
        setze(neu.gesamt, "vramMB", u.vram.gebunden != null ? u.vram.gebunden : u.vram.mb, "gesamt.vramMB");
        neu.vramMB = neu.vramMB || {};
        for (const e of u.vram.erzeuger)
            if (!vramFrei(neu, e.erzeuger)) setze(neu.vramMB, e.erzeuger, e.mb, "vramMB." + e.erzeuger);
        // Ein Erzeuger, den der Abgriff nicht mehr sieht, ist GEFALLEN (W6: die Leinwand-Tiefe `tex:depthBuffer`, die
        // namenlosen `buf:?`) — seine Ratsche zieht auf 0, sonst kehrte er still bis zur alten Hülle zurück.
        const lebt = new Set(u.vram.erzeuger.map((e) => e.erzeuger));
        for (const k of Object.keys(neu.vramMB))
            if (!lebt.has(k) && !vramFrei(neu, k)) setze(neu.vramMB, k, 0, "vramMB." + k);
    }
    // DIE GESAMT-ZEILE IST HÖCHSTENS DIE SUMME IHRER ZEILEN (gate:profiband H2b): jede Zeile zieht je Lauf auf ihr EIGENES
    // Minimum, die Summe der Minima liegt dann unter dem Minimum der Gesamt-Zeile — eine Gesamt-Zeile darüber feuerte nie. Die Kappe gilt, sobald jede Zeile gemessen ist.
    const kappe = (key, zeilen, name) => {
        const alt = neu.gesamt[key];
        if (alt == null || zeilen.some((v) => v == null)) return;
        const summe = key === "vramMB" ? +zeilen.reduce((a, b) => a + b, 0).toFixed(1) : zeilen.reduce((a, b) => a + b, 0);
        if (alt > summe) {
            neu.gesamt[key] = summe;
            aenderungen.push(`gesamt.${key}: ${alt} → ${summe} (die Summe ihrer Zeilen, ${name})`);
        }
    };
    for (const gr of nur === "vram" ? [] : ["befehle", "dreiecke"]) {
        const zeilen = [];
        for (const [id, rz] of Object.entries(neu.klassen || {}))
            if (!freiGrund(neu, id)) for (const p of Object.keys(rz)) zeilen.push((rz[p] || {})[gr]);
        kappe(gr, zeilen, "Klassen × Pässe");
    }
    if (u.vram)
        kappe(
            "vramMB",
            Object.keys(neu.vramMB || {})
                .filter((k) => !vramFrei(neu, k))
                .map((k) => neu.vramMB[k]),
            "Erzeuger"
        );
    // Die Serie bestätigt die Ratsche an IHREM Stand (Version, Gerät, Sicht) auch ohne Änderung — gate:profiband H2b liest das
    // Alter daran.
    if (nur === "vram") {
        if (aenderungen.length) neu.gemessen = Object.assign({}, ratsche.gemessen || gemessen, { vram: gemessen });
    } else neu.gemessen = gemessen;
    return { ratsche: neu, aenderungen };
}

// DER RE-MINT (K26, `werkbank ratsche --neu`): die Ratsche wird die Hülle der Serie am Kopf — jedes gebundene Feld neu, auch
// nach oben (ein Ist über der alten Ratsche ist dann kein Rückschritt dieser Serie, sondern die Wahrheit, die die alte nie
// trug: der Ego-Wurf seit V18.540, auf der GTX gerichtet, auf der Radeon gemessen). Ein begründeter Akt: die Zeilen, die
// steigen, nennt die Ausgabe, der Commit trägt sie.
function ratscheNeu(ratsche) {
    const neu = JSON.parse(JSON.stringify(ratsche));
    for (const [id, rz] of Object.entries(neu.klassen || {}))
        if (!freiGrund(neu, id)) for (const p of Object.keys(rz)) rz[p] = { befehle: null, dreiecke: null };
    neu.gesamt = { befehle: null, dreiecke: null, vramMB: null };
    neu.vramMB = {};
    neu.gemessen = null;
    return neu;
}

// Der Abstand zweier Versionen `M.m.p` in Versions-Schritten (der mittlere Teil zählt; ein anderer Hauptteil ist weit weg).
function versionAbstand(kopf, gemessen) {
    const a = /^(\d+)\.(\d+)\.\d+$/.exec(String(kopf));
    const b = /^(\d+)\.(\d+)\.\d+$/.exec(String(gemessen));
    if (!a || !b) return null;
    return +a[1] !== +b[1] ? Infinity : +a[2] - +b[2];
}

// H2b DIE FRISCHE (K26, rein): jede Ratsche, die der Haushalt fordert (Band-Ort × Gerät × Sicht), steht gemessen, an
// höchstens einer Version vor dem Kopf, an ihrem Ort, Gerät und in ihrer Sicht; ihre Gesamt-Zeile ist höchstens die Summe der
// Klassen (darüber feuert sie nie — die Mess-Wiese trug 4 095 487 Dreiecke über 1 295 324); und gegen jede gegebene Messung
// (`messungen`: { quelle, ort, geraet, sicht, u }) liegt keine Zeile zu weit.
function ratscheFrische({ haushalt, version, ratschen, messungen }) {
    const rot = [];
    const paesse = haushalt.paesse;
    const nameOf = (e) => `${e.ort} × ${e.geraet} × ${e.sicht} (${e.datei})`;
    for (const e of ratschen) {
        const r = e.ratsche;
        if (!r) {
            rot.push(`${nameOf(e)}: fehlt — ungemessen, die Re-Mint-Serie fehlt`);
            continue;
        }
        const g = r.gemessen;
        if (!g) {
            rot.push(`${nameOf(e)}: ungemessen — die Re-Mint-Serie fehlt`);
            continue;
        }
        const d = versionAbstand(version, g.version);
        if (!g.version) rot.push(`${nameOf(e)}: gemessen ${String(g.datum || "?").slice(0, 10)} ohne Version — älter als jede Version des Kopfs ${version}`);
        else if (d == null) rot.push(`${nameOf(e)}: Version ${g.version} oder Kopf ${version} unlesbar`);
        else if (d > 1) rot.push(`${nameOf(e)}: gemessen an V${g.version}, der Kopf ist V${version} — älter als eine Version`);
        if (g.ort !== e.ort || g.geraet !== e.geraet || g.sicht !== e.sicht)
            rot.push(`${nameOf(e)}: trägt die Messung ${g.ort || "?"} × ${g.geraet || "?"} × ${g.sicht || "?"}`);
        for (const gr of ["befehle", "dreiecke"]) {
            let summe = 0;
            for (const [id, k] of Object.entries(r.klassen || {}))
                if (!freiGrund(r, id)) for (const p of paesse) summe += (k[p] || {})[gr] || 0;
            const tot = (r.gesamt || {})[gr];
            if (tot != null && tot > summe)
                rot.push(`${nameOf(e)}: die Gesamt-Zeile ${gr} ${tot} liegt über der Summe der Klassen ${summe} — sie feuert nie`);
        }
        let vSumme = 0;
        for (const [k, v] of Object.entries(r.vramMB || {})) if (!vramFrei(r, k)) vSumme += v || 0;
        const vTot = (r.gesamt || {}).vramMB;
        if (vTot != null && vTot > +vSumme.toFixed(1) + 0.05)
            rot.push(`${nameOf(e)}: die Gesamt-Zeile vramMB ${vTot} liegt über der Summe der Erzeuger ${+vSumme.toFixed(1)} — sie feuert nie`);
    }
    for (const m of messungen || []) {
        const e = ratschen.find((x) => x.ort === m.ort && x.geraet === m.geraet && x.sicht === m.sicht);
        if (!e) {
            rot.push(`${m.quelle}: keine geforderte Ratsche richtet ${m.ort} × ${m.geraet} × ${m.sicht}`);
            continue;
        }
        for (const w of ratscheWeit(e.ratsche, m.u, paesse)) rot.push(`${nameOf(e)}: ${w.text} (${m.quelle})`);
    }
    return rot;
}

// Die Befunde der LINSE, die den Speicher betreffen (`ratsche --nur vram`): ein Leck, eine Textur ohne Erzeuger, ein
// VRAM-Erzeuger oder die VRAM-Summe über der Ratsche. Ein Klassen-Befund (Befehle/Dreiecke eines Passes) gehört der
// Serie seiner Klasse, nie dem Speicher-Nachzug.
function vramBefunde(u) {
    return (u.rot || []).filter(
        (r) =>
            r.art === "leck" ||
            (r.art === "unbenannt" && /^(tex:|Textur-Objekt)/.test(r.text)) ||
            (r.art === "ratsche" && /^VRAM /.test(r.text))
    );
}

// Die Tabelle für das Auge: Ist/Soll/Täter je Klasse, die Summe gegen das Band, der VRAM je Erzeuger, die Urteile.
function bandTabelle(u) {
    const z = [];
    const pad = (s, n) => String(s).padEnd(n);
    const lpad = (s, n) => String(s).padStart(n);
    const k = (x) => (x >= 1000 ? Math.round(x / 1000) + "k" : String(Math.round(x)));
    const kopfBand =
        `BAND ${u.bandUrteil === "UEBER" ? "ROT" : u.bandUrteil}: ` +
        u.groessen
            .map((g) =>
                g.ist == null
                    ? `${g.name} ungemessen`
                    : `${g.name} ${g.name === "Dreiecke" ? k(g.ist) : g.ist}/${g.name === "Dreiecke" ? k(g.soll) : g.soll} (${g.faktor}×)`
            )
            .join(" · ");
    z.push(kopfBand);
    if (u.ort)
        z.push(
            `ORT ${u.ort}` +
                (u.ortGestellt
                    ? u.ortGestellt.length
                        ? ` — NICHT GESTELLT (die Ratsche nimmt den Lauf nicht): ${u.ortGestellt.join(" · ")}`
                        : " — gestellt (Ort, Dorf-Zug, Ort-Takt, Blick)"
                    : "")
        );
    z.push("");
    z.push(
        pad("Klasse", 15) +
            lpad("Befehle Ist/Soll", 18) +
            lpad("haupt/k0/k1", 15) +
            lpad("Dreiecke Ist/Soll", 19) +
            "  Täter (Befehle)"
    );
    for (const r of u.klassen) {
        if (!r.ist.befehle && !r.soll.befehle) continue;
        const je = Object.values(r.je)
            .map((v) => v.befehle)
            .join("/");
        const ueber = r.ist.befehle > r.soll.befehle || r.ist.dreiecke > r.soll.dreiecke ? " !" : "  ";
        z.push(
            pad(r.id + (r.frei ? "*" : ""), 15) +
                lpad(`${r.ist.befehle}/${r.soll.befehle}`, 18) +
                lpad(je, 15) +
                lpad(`${k(r.ist.dreiecke)}/${k(r.soll.dreiecke)}`, 19) +
                ueber +
                r.taeter
                    .slice(0, 4)
                    .map((t) => `${t.klasse} ${t.befehle}`)
                    .join(" · ")
        );
        // der Inhalt jedes Satzes der Klasse je Pass (wer im EINEN Befehl liegt)
        for (const t of r.taeter)
            for (const [p, ih] of Object.entries(t.inhalt || {}))
                if (ih && ih.length) z.push(`    ${t.klasse} ${p}: ${inhaltText(ih, 4)}`);
    }
    z.push(
        pad("SUMME", 15) +
            lpad(`${u.summe.befehle}/${u.band.befehle}`, 18) +
            lpad(Object.values(u.summe.je).join("/"), 15) +
            lpad(`${k(u.summe.dreiecke)}/${k(u.band.dreiecke)}`, 19) +
            `  Abstand ${u.abstand.befehle}× Befehle · ${u.abstand.dreiecke}× Dreiecke`
    );
    for (const r of u.klassen) if (r.frei) z.push(`* ${r.id} ist frei (keine Ratsche): ${r.frei}`);
    // Die Soll-Zeilen des Orts (die Hülle EINES Exemplars gegen ihr Band): benannt, nie Teil des Urteils — das Band selbst
    // urteilt über die Summe, die Ratsche über die Klasse.
    for (const x of u.soll || [])
        z.push(
            `SOLL ${x.name} ${x.klasse}: ${x.huelle} Dreiecke je Exemplar (${x.exemplare} im Bild) / ${x.soll} (${x.faktor}×)` +
                (x.faktor > 1 ? " ROT" : "") +
                (x.taeter ? ` — Täter ${x.taeter}` : "")
        );
    if (Object.keys(u.ausserhalb || {}).length)
        z.push(
            `außerhalb des Haushalts (Post-Kette): ${Object.entries(u.ausserhalb)
                .map(([p, c]) => `${p} ${c}`)
                .join(" · ")} Befehle`
        );
    if (u.vram) {
        z.push("");
        z.push(`VRAM ${u.vram.mb} MB / Band ${u.vram.band} MB (${u.abstand.vram}×) — je Erzeuger:`);
        if (u.vram.renderZiele)
            z.push(
                `  Render-Ziele ${u.vram.renderZiele.mb} MB / Haushalt ${u.vram.renderZiele.soll} MB (${u.vram.renderZiele.taeter.join(" · ")})`
            );
        for (const e of u.vram.erzeuger.slice(0, 18))
            z.push(
                "  " +
                    lpad(e.mb.toFixed(1), 7) +
                    " MB  " +
                    pad(e.n, 6) +
                    e.erzeuger +
                    (e.erzeuger.startsWith("buf:") && e.form && e.form.length && e.form[0] !== e.erzeuger
                        ? "  (" + e.form.map((k) => k.slice(e.erzeuger.length + 1)).join(" · ") + ")"
                        : "")
            );
    } else if (u.texturen) {
        z.push("");
        z.push(
            `Texturen ${u.texturen.mb} MB in ${u.texturen.n} Objekten (r184-Schätzung — dieses Backend hat keinen GPU-Abgriff) — je Erzeuger:`
        );
        for (const e of u.texturen.erzeuger.slice(0, 16))
            z.push("  " + lpad(e.mb.toFixed(1), 7) + " MB  " + pad(e.n, 6) + e.erzeuger);
    }
    // Die Messung: Boot-Art der Serie, Einschwingen, Proben, Foundry-Kanal dieser Ladung (die Werkbank hängt sie an).
    if (u.boot || u.fluss || u.messung) {
        z.push("");
        const b = u.boot
            ? `${u.boot.art}-Boot${u.boot.serie ? ` (Serie ${u.boot.serie})` : ""}, Ladung ${u.boot.ladungen}`
            : "";
        const m = u.messung
            ? `${u.messung.eingeschwungen ? "eingeschwungen" : "NICHT eingeschwungen"} nach ${u.messung.takte} Takten ` +
              `(${Math.round(u.messung.ms / 1000)} s)${u.messung.offen ? " — offen: " + JSON.stringify(u.messung.offen) : ""}, ` +
              `${u.messung.proben} Proben (Maximum je Klasse × Pass)`
            : "";
        const f = u.fluss
            ? `Foundry ${u.fluss.n} Antworten ${u.fluss.mb} MB — von der Platte ${u.fluss.platte} (${u.fluss.platteMb} MB), ` +
              `Neubau ${u.fluss.neuMb} MB`
            : "";
        z.push([b, m, f].filter(Boolean).join(" · "));
    }
    z.push("");
    z.push(kopfBand);
    z.push(
        u.linse === "ROT"
            ? "LINSE ROT — ein Linsen-Fehler oder ein Rückschritt über die Ratsche:"
            : "LINSE SAUBER — jeder Täter benannt und im Haushalt, keine Klasse über ihrer Ratsche."
    );
    for (const r of u.rot.slice(0, 40)) z.push(`  [${r.art}] ${r.text}`);
    return z.join("\n");
}

module.exports = {
    ratscheDatei,
    geraetSchluessel,
    sichtSchluessel,
    ratschenAlle,
    ratscheNeu,
    ratscheFrische,
    einschwingOffen,
    EINSCHWING_INSTALL: `window.__einschwingOffen = ${einschwingOffen.toString()};`,
    ladeSpec,
    ratscheVon,
    ortOf,
    ortGier,
    ortGestellt,
    ortSoll,
    messortePruefen,
    schreibeRatsche,
    haushaltPruefen,
    ratschePruefen,
    bandUrteil,
    zensusMax,
    bandHuelle,
    ratscheNachziehen,
    vramBefunde,
    rahmenZielBefunde,
    bandTabelle,
    einOf,
    zuordnen,
    erzeugerOf,
    ueberRatsche,
};
