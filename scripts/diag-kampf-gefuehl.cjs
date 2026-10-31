#!/usr/bin/env node
// diag-kampf-gefuehl.cjs — DIE GERECHNETE SCHWUNGPHYSIK ERREICHT DEN KAMPF (npm run gate:kampf-gefuehl), headless am ECHTEN
// Chokepoint (_beginPlayerSwing · _tickKampfSchwung · _kampfSweepTick · damageCreature · updateCreatures): (A) Dauer ∝ √I
// eines Eigenwerks, das aus der Stoff-Zeile wiegt (ρ(holz) ×2), ungeklemmt, ± 5 % · (B) der Sweep trifft neben dem
// Fadenkreuz genau einmal, hinter dem Rücken nie · (C) der Hit-Stop friert die Anzeige, nie die fixe Sim · (D) der EINE Fall
// liest das Gefälle (die Tod-Lage in Ereignis-Zeit misst Q13) · (E) der Schwung ist ein additiver Oberkörper-Layer, danach
// byte-alt · (S1/S2) die Stubs von _hitStopFactor und _segSegDistSq feuern.
//
// Die Leben-Prüfung „Kampf" (WELLE_L, scripts/lib/kampf-proben.cjs) spielt wie ein Mensch — das Fadenkreuz durch die echte
// Kamera, der Klick über den EINEN Dispatcher, gezählt nur mitlaufend: Q8 Treffer · Q9 Maus · Q10 Blick · Q11 das Gesetz
// des Haltens · Q12 der ballistische Bogen · G3/T12 das Grob-Tor · T13–T27 die Posten der Leben-Schau; danach Q13 Sturz, Tod
// und Wiederkehr über einen Reload (allein: `--k5`, mit dem echten Renderer); die Selbst-Tests S3–S18 feuern je an ihrer
// Naht, jede Naht restauriert; Q15 der Treffer je Kern-Mutation im Takt des Spiels, im Bild und am Labor (allein: `--k1`, mit dem
// echten Renderer). Aufruf: node scripts/diag-kampf-gefuehl.cjs [--k5 | --k1]
const { statikServer, starteBrowser, warteAufWelt, nullRenderer, sleep, stammLib } = require("./lib/welt-boot.cjs");
// Port über KAMPF_GEFUEHL_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4451.
const PORT = Number(process.env.KAMPF_GEFUEHL_PORT || 4451);

// (T13) Urteil des Rückstoßes (pure, Probe und Selbst-Test): kein Satz im Treffer-Takt, der Fuchs fliegt, die Masse teilt
// (Fuchs ≥ 3 × Bär), die Waffe wirkt (Keule ≥ 1,15 × Dolch).
const RUECK = { satzM: 0.05, fuchsMinM: 0.3, masse: 3, waffe: 1.15 };
function rueckVerdict(R) {
    if (!R || !R.fuchsDolch || !R.fuchsKeule || !R.baerDolch || !R.baerKeule)
        return ["rueckstoss keine Probe (ein Hieb traf nicht oder ein Gerät fehlt)"];
    const v = [];
    const satz = Math.max(R.fuchsDolch.sprung, R.fuchsKeule.sprung, R.baerDolch.sprung, R.baerKeule.sprung);
    if (!(satz <= RUECK.satzM))
        v.push(
            `rueckstoss-satz: ein Ziel springt im Treffer-Takt ${satz.toFixed(2)} m (ein Positions-Satz, kein Stoß)`
        );
    if (!(R.fuchsKeule.weg >= RUECK.fuchsMinM))
        v.push(`rueckstoss-fuchs: die Keule stößt den Fuchs nur ${R.fuchsKeule.weg.toFixed(2)} m (er fliegt nicht)`);
    if (!(R.fuchsKeule.weg >= RUECK.masse * R.baerKeule.weg))
        v.push(
            `rueckstoss-masse: Fuchs ${R.fuchsKeule.weg.toFixed(2)} m gegen Bär ${R.baerKeule.weg.toFixed(2)} m mit derselben Keule — die Masse teilt den Stoß nicht`
        );
    if (!(R.fuchsKeule.weg >= RUECK.waffe * R.fuchsDolch.weg))
        v.push(
            `rueckstoss-waffe: Keule ${R.fuchsKeule.weg.toFixed(2)} m gegen Dolch ${R.fuchsDolch.weg.toFixed(2)} m am selben Fuchs — der Impuls der Waffe wirkt nicht`
        );
    return v;
}
// (T15) der Biss als Stoß: das Ziel (Kitz, Spieler) bekommt Δv > 0, der schwerere Jäger stößt stärker (Fuchs < Wolf < Bär).
const BISS_SOLL = { dvMin: 0.01, jaeger: ["fuchs", "wolf", "baer"] };
function bissVerdict(B) {
    if (!B || !B.beute || !B.spieler) return ["biss keine Probe"];
    const v = [];
    for (const [ziel, name] of [
        ["beute", "das Kitz"],
        ["spieler", "den Spieler"],
    ]) {
        const z = B[ziel];
        for (const j of BISS_SOLL.jaeger) {
            const m = z[j];
            if (!m || m.biss !== true) v.push(`biss-${ziel}: ${j} biss ${name} nicht (keine Probe)`);
            else if (!(m.dv >= BISS_SOLL.dvMin))
                v.push(`biss-${ziel}: ${j} beißt ${name} ohne Rückstoß (Δv ${(m.dv || 0).toFixed(3)} m/s)`);
        }
        const dv = BISS_SOLL.jaeger.map((j) => (z[j] && z[j].dv) || 0);
        if (dv.every((x) => x >= BISS_SOLL.dvMin) && !(dv[0] < dv[1] && dv[1] < dv[2]))
            v.push(
                `biss-masse: an ${name} Fuchs ${dv[0].toFixed(2)} · Wolf ${dv[1].toFixed(2)} · Bär ${dv[2].toFixed(2)} m/s — der schwerere Jäger stößt nicht stärker`
            );
    }
    return v;
}
// (T16) die Treffer-Energie folgt dem Schwung: jeder Hieb trifft, die Befund-Lage springt höchstens × 1,25, jede Streuung
// ist benannt und begrenzt (≥ 0,2 × die stärkste), das Großschwert nie schwächer als der Dolch.
const ENERGIE_SOLL = { treffer: 13, befund: 1.25, boden: 0.2 };
function energieVerdict(E) {
    if (!E || !Array.isArray(E.gross) || !Array.isArray(E.dolch)) return ["energie keine Probe"];
    const v = [];
    const g = E.gross.filter((x) => Number.isFinite(x) && x > 0);
    const d = E.dolch.filter((x) => Number.isFinite(x) && x > 0);
    if (g.length < ENERGIE_SOLL.treffer)
        v.push(
            `energie-treffer: ${g.length} von ${E.gross.length} Großschwert-Hieben trafen (Soll ≥ ${ENERGIE_SOLL.treffer})`
        );
    if (!g.length || !d.length) return v.concat(["energie keine Treffer"]);
    const b = (E.befund || []).filter((x) => Number.isFinite(x) && x > 0);
    if (b.length < 3) v.push("energie-befund: die Befund-Lage traf nicht dreimal (keine Probe)");
    else if (!(Math.max(...b) <= ENERGIE_SOLL.befund * Math.min(...b)))
        v.push(
            `energie-kontakt: abgewandt 1,5–1,7 m ${b.map((x) => x.toFixed(1)).join(" / ")} J (×${(Math.max(...b) / Math.min(...b)).toFixed(1)}, Soll ≤ ×${ENERGIE_SOLL.befund}) — die erste Kontaktstelle richtet`
        );
    const hi = Math.max(...g);
    if (!(Math.min(...g) >= ENERGIE_SOLL.boden * hi))
        v.push(
            `energie-boden: ${Math.min(...g).toFixed(1)} J unter ${ENERGIE_SOLL.boden} × ${hi.toFixed(1)} J — die Streuung ist nicht begrenzt`
        );
    for (const x of E.detail || [])
        if (Number.isFinite(x.eff) && x.eff < 0.99 && (!x.ort || x.ort === "schlagpunkt"))
            v.push(
                `energie-ort: ${x.name}@${x.d} trifft mit ${x.eff} ohne benannten Ort — die Streuung ist nicht benannt`
            );
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    if (!(med(g) >= med(d)))
        v.push(`energie-waffe: Großschwert ${med(g).toFixed(1)} J im Mittel unter dem Dolch ${med(d).toFixed(1)} J`);
    // zu nah: der Ort ist benannt (nicht der Schlagpunkt), die Wirkung steht auf oder über dem Boden des Kerns (0,25)
    const n = E.nah;
    if (!n || !Number.isFinite(n.ke)) v.push("energie-nah: zu nah traf nicht (keine Probe)");
    else if (!n.ort || n.ort === "schlagpunkt")
        v.push(`energie-nah: zu nah ohne benannten Ort (${n.ort || "keiner"}) — die Streuung ist nicht benannt`);
    else if (!(n.eff >= 0.25 - 1e-9 && n.eff < 1))
        v.push(`energie-nah: zu nah mit der Wirkung ${n.eff} — die Streuung ist nicht begrenzt`);
    return v;
}
// (T17) EINE Reichweite: das Verb-Tor des Klicks liest die der Klinge; jenseits nennt der Kanal sie, in Reichweite trifft
// die Serie (≥ 8 von 9).
const REICH_SOLL = { nah: 8 };
function reichVerdict(R) {
    if (!R || !R.weit || !R.nah) return ["reich keine Probe"];
    const v = [];
    if (R.toreZahl > 0)
        v.push(`reich-zwilling: das Verb-Tor liest reachMaxM neben der Klinge (${R.klinge} m) — zwei Reichweiten`);
    if (!R.weit.gesagt.some((t) => /reicht/.test(t)))
        v.push(`reich-stumm: ${9 - R.weit.treffer} Hiebe ins Leere jenseits der Klinge (${R.klinge} m) ohne Hinweis`);
    if (!(R.nah.treffer >= REICH_SOLL.nah)) v.push(`reich-nah: in Reichweite nur ${R.nah.treffer} von 9 Treffern`);
    return v;
}
// (T26) der Hieb im Horizont-Blick: 96 Fälle (8 Waffen × 3 Abstände × Rumpf/Horizont × 3rd/1st) über tryMouseBreak machen
// Schaden, je rotem Fall der Täter; Rücken und Begleiter heil, jenseits der Klinge ein Luftschlag mit Hinweis; die Ernte
// neben dem Wildtier bleibt beim Fadenkreuz.
const KLICK_SOLL = { faelle: 96 };
function klickVerdict(M) {
    if (!M || !Array.isArray(M.faelle) || M.faelle.length !== KLICK_SOLL.faelle)
        return [`klick keine Probe (${M && M.faelle ? M.faelle.length : 0} von ${KLICK_SOLL.faelle} Fällen)`];
    const v = [];
    for (const blick of ["rumpf", "horizont"]) {
        const rot = M.faelle.filter((f) => f.blick === blick && !(f.dmg > 0));
        if (rot.length)
            v.push(
                `klick-${blick}: ${rot.length} von ${M.faelle.filter((f) => f.blick === blick).length} ohne Schaden — ${rot
                    .slice(0, 4)
                    .map((f) => `${f.mode}/${f.wn}/${f.d}: ${f.taeter}`)
                    .join(" · ")}${rot.length > 4 ? " …" : ""}`
            );
    }
    if (!M.ruecken) v.push("klick-ruecken keine Probe");
    else if (M.ruecken.dmg > 0 || M.ruecken.ziel)
        v.push(
            `klick-ruecken: der Wolf hinter dem Rücken (dot ${M.ruecken.dot}) wird gewählt oder getroffen (${M.ruecken.dmg})`
        );
    if (!M.begleiter) v.push("klick-begleiter keine Probe");
    else if (M.begleiter.dmg > 0 || M.begleiter.ziel)
        v.push(`klick-begleiter: der Wolf, der dir folgt, wird im Kegel gewählt oder getroffen (${M.begleiter.dmg})`);
    if (!M.zuWeit) v.push("klick-zuweit keine Probe");
    else if (!M.zuWeit.schwung || !M.zuWeit.gesagt || M.zuWeit.dmg > 0)
        v.push(
            `klick-zuweit: der Dolch jenseits seiner Klinge (${M.zuWeit.klinge} m) — ${M.zuWeit.schwung ? "Schwung" : `kein Schwung (${M.zuWeit.verb})`}, ${M.zuWeit.gesagt ? "Hinweis" : "kein Hinweis"}, Schaden ${M.zuWeit.dmg}`
        );
    // die Ernte neben dem Wildtier: das Fadenkreuz nennt das Verb, der Kegel nie (abbau · pflücken · graben, je ein Fall)
    const E = Array.isArray(M.ernte) ? M.ernte : [];
    for (const soll of ["abbau", "pfluecken", "graben"]) {
        const e = E.find((x) => x.soll === soll);
        if (!e || !e.ziel) v.push(`klick-ernte keine Probe (${soll}: kein Ziel unter dem Fadenkreuz gestellt)`);
        else if (e.verb !== soll || e.dmg > 0)
            v.push(
                `klick-ernte: ${soll} neben dem Wildtier — der Kegel nennt das Verb (${e.verb || "–"}), der Wolf daneben nimmt ${e.dmg}`
            );
    }
    // der Gegenfall: ein Bauwerk jenseits der Arm-Länge unter dem Fadenkreuz nimmt dem Hieb den Wolf vor dem Spieler nicht
    const F = E.find((x) => x.fern);
    if (!F || !F.ziel) v.push("klick-ernte keine Probe (fern: kein Pfeiler unter dem Fadenkreuz gestellt)");
    else if (F.verb !== "hieb" || !(F.dmg > 0))
        v.push(`klick-fern: der Pfeiler 8 m voraus nennt das Verb (${F.verb || "–"}), der Wolf vor dir nimmt ${F.dmg}`);
    return v;
}
// (T18) Pose = Treffer-Volumen = Ich-Sicht: Spitze und Mitte des Geräts auf der Sweep-Strecke (± Klingen-Radius) und im
// Bild der Ich-Kamera.
const POSE_SPALT_M = 0.12;
function poseVerdict(P, E) {
    if (!Array.isArray(P) || !P.length) return ["pose keine Probe"];
    const v = [];
    if (!E) v.push("pose-ichregel keine Probe");
    else {
        if (E.rueckstand) v.push("pose-ichregel: 3rd → 1st → 3rd stellt die Sichtbarkeit des Leibs nicht wieder her");
        if (E.hautImErsten > 0)
            v.push(`pose-ichregel: im 1st zeichnen ${E.hautImErsten} Haut-Meshes (die Kamera sitzt im Leib)`);
    }
    P.forEach((x, i) => {
        if (!x || !x.traf) return v.push(`pose-treffer: Ziel ${i + 1} nicht getroffen (keine Probe)`);
        if (!Number.isFinite(x.spitzeAb)) return v.push(`pose-geraet: Ziel ${i + 1} ohne sichtbares Gerät`);
        if (!(x.spitzeAb <= x.rad && x.mitteAb <= x.rad))
            v.push(
                `pose-volumen: Ziel ${i + 1} — die sichtbare Klinge ${x.spitzeAb} m (Spitze) / ${x.mitteAb} m (Mitte) neben dem Treffer-Volumen (Soll ≤ ${x.rad} m)`
            );
        if (!x.imBild) v.push(`pose-ich: Ziel ${i + 1} — im Treffer-Takt zeigt die Ich-Sicht keine Klinge`);
        if (!(Number.isFinite(x.spalt) && x.spalt <= POSE_SPALT_M))
            v.push(
                `pose-spalt: Ziel ${i + 1} — im Treffer-Takt steht die sichtbare Klinge ${x.spalt} m vor dem Leib (Soll ≤ ${POSE_SPALT_M} m) — sie trifft nicht, wo man sie sieht`
            );
    });
    return v;
}
// (T19) die Ausdauer je Hieb steigt streng mit der Masse des Geräts.
function ausdauerVerdict(A) {
    if (!Array.isArray(A) || A.length < 3) return ["ausdauer keine Probe"];
    const v = [];
    for (const x of A) if (!Number.isFinite(x.zehrt)) v.push(`ausdauer-hieb: ${x.geraet} schwang nicht (keine Probe)`);
    const s = A.filter((x) => Number.isFinite(x.zehrt)).sort((a, b) => a.kg - b.kg);
    for (let i = 1; i < s.length; i++)
        if (s[i].kg > s[i - 1].kg + 1e-6 && !(s[i].zehrt > s[i - 1].zehrt + 1e-6))
            v.push(
                `ausdauer-flach: ${s[i].geraet} (${s[i].kg} kg) zehrt ${s[i].zehrt}, ${s[i - 1].geraet} (${s[i - 1].kg} kg) ${s[i - 1].zehrt} — die Masse wirkt nicht`
            );
    return v;
}
// (T27) Lebenswerte sind Zustand: kein Rufer der Neuberechnung hebt hp, Ausdauer oder Mana über Regen·dt; jede Verletzung
// nennt den Rufer.
const LEBEN_SOLL = { eps: 1e-3 };
function lebenswerteVerdict(L) {
    if (!L || !Array.isArray(L.schritte) || L.schritte.length < 10) return ["lebenswerte keine Probe"];
    const v = [];
    if (!(L.erst && L.erst.hp > 0)) v.push("lebenswerte-biss: der Biss senkte hp nicht (keine Probe)");
    if (!(L.erst && L.erst.st > 0)) v.push("lebenswerte-hieb: der Hieb senkte die Ausdauer nicht (keine Probe)");
    for (const x of L.schritte) {
        if (x.fehler) v.push(`lebenswerte-abbruch: ${x.rufer} warf ${x.fehler}`);
        for (const [k, name] of [
            ["hp", "hp"],
            ["st", "Ausdauer"],
            ["mana", "Mana"],
        ]) {
            const [a, b] = x[k] || [];
            if (!Number.isFinite(a) || !Number.isFinite(b)) {
                v.push(`lebenswerte-leer: ${x.rufer} ohne ${name} (${a} → ${b})`);
                continue;
            }
            if (b - a > (x.regen[k] || 0) + LEBEN_SOLL.eps)
                v.push(
                    `lebenswerte-heilt: ${x.rufer} (${x.weg}) hob ${name} ${a} → ${b}, erlaubt + ${x.regen[k] || 0} (Regen·dt)`
                );
        }
    }
    if (!L.boostAn || !L.boostAb) v.push(`lebenswerte-boost: an ${!!L.boostAn} · ab ${!!L.boostAb} (keine Probe)`);
    return v;
}
function lebenswerteWege(L) {
    const wege = new Set();
    for (const x of (L && L.schritte) || [])
        for (const k of ["hp", "st", "mana"]) {
            const [a, b] = x[k] || [];
            if (b - a > (x.regen[k] || 0) + LEBEN_SOLL.eps) wege.add(x.weg);
        }
    return [...wege];
}
// (T20) Biss, Haut und Leben steigen streng mit der Masse des Leibs (Gattung × Größe).
function kampfWerteVerdict(R) {
    if (!Array.isArray(R) || R.length < 6) return ["kampfwerte keine Probe"];
    const v = [];
    const s = R.slice().sort((a, b) => a.kg - b.kg);
    for (const k of ["damage", "defense", "hpMax"]) {
        let flach = 0,
            erst = null;
        for (let i = 1; i < s.length; i++)
            if (s[i].kg > s[i - 1].kg * 1.05 && !(s[i][k] > s[i - 1][k])) {
                flach++;
                if (!erst) erst = `${s[i - 1].seele}@${s[i - 1].L} ${s[i - 1][k]} → ${s[i].seele}@${s[i].L} ${s[i][k]}`;
            }
        if (flach)
            v.push(`kampfwerte-${k}: ${flach} Stufen der Massen-Reihe ohne Zuwachs (${erst}) — gattungs-/größenblind`);
    }
    return v;
}
// (T21) der Pfeil ist die Gestalt des Schmiede-Kerns (≥ 6 Teile, ≥ 3 Farben, beleuchtet, wirft, 0,70–0,85 m), kein Zwilling
// in Wirt oder Shell.
function pfeilVerdict(P, shell) {
    if (!P) return ["pfeil keine Probe"];
    const v = [];
    if (!(P.teile >= 6 && P.farben >= 3))
        v.push(`pfeil-gestalt: ${P.teile} Teile, ${P.farben} Farben — kein Schaft mit Spitze, Nocke und Federn`);
    if (P.unbeleuchtet > 0) v.push(`pfeil-licht: ${P.unbeleuchtet} Teile in MeshBasic (ohne Licht)`);
    if (!(P.wirft > 0)) v.push("pfeil-schatten: kein Teil wirft Schatten");
    if (!(P.laenge >= 0.7 && P.laenge <= 0.85)) v.push(`pfeil-laenge: ${P.laenge} m längs der Flug-Richtung`);
    if (P.wirtZylinder) v.push("pfeil-zwilling: der Wirt baut seinen eigenen Zylinder (_pfeilMeshAttach)");
    if (shell && shell.eigenerPfeil) v.push("pfeil-zwilling: die Prüfstand-Shell baut ihren eigenen Pfeil");
    if (P.leerStill !== false)
        v.push(
            `pfeil-still: ein leerer Guss (${typeof P.leerStill === "string" ? P.leerStill : "null"}) lässt den Pfeil ohne Meldung unsichtbar fliegen`
        );
    return v;
}
// (T22) der Leichnam liegt auf der Flanke (|vorn·y| ≤ 0,3, oben·y ≤ 0,35), auch hangab, und 10 s danach noch.
function todVerdict(T) {
    if (!T) return ["tod keine Probe"];
    const v = [];
    if (!(Math.abs(T.vornY) <= 0.3))
        v.push(
            `tod-flanke: die Leibes-Achse zeigt nach dem Kippen ${T.vornY > 0 ? "hinauf" : "hinab"} (vorn·y ${T.vornY}) — er steht auf dem ${T.vornY > 0 ? "Hinterteil" : "Kopf"}`
        );
    if (!(T.obenY <= 0.35)) v.push(`tod-kipp: die Hochachse steht (oben·y ${T.obenY})`);
    if (!T.liegt10s) v.push("tod-leichnam: 10 s nach dem Tod ist der Leib fort");
    // der Leichnam ist kein Wesen (Nachbesserung 2): kein Ziel des Fadenkreuzes, kein Platz der Kappe, keine Zahl des Nexus
    if (T.zielLeichnam !== false)
        v.push("tod-ziel: das Fadenkreuz wählt den Leichnam — jeder Klick auf ihn ein Luftschlag");
    if (T.platzFrei !== true)
        v.push("tod-platz: der Leichnam belegt einen der maxCreatures-Plätze — der Spawn gibt still null");
    if (T.nexusZaehlt !== false) v.push("tod-zaehlt: der Nexus zählt den Leichnam als Wesen (creatures_count_above)");
    // die KLASSE (Nachbesserung 3): der Leichnam verlässt die Liste der Wesen — kein Leser muss fragen, keiner kann ihn zählen
    if (T.unterWesen !== false)
        v.push(
            "tod-wesen: der Leichnam steht in der Liste der Wesen (state.creatures) — jeder Leser zählt oder wählt ihn"
        );
    if (T.naechster !== false)
        v.push("tod-naechster: findNearestCreature wählt den Leichnam — er bekommt einen Auftrag");
    if (!(T.stromAnteil >= 1))
        v.push(
            `tod-strom: der Leichnam fehlt im Mehrspieler-Strom (in ${T.stromAnteil} der Proben) — die Kopie beim Mitspieler verschwindet`
        );
    if (T.kopieOben == null || !(T.kopieOben <= 0.35))
        v.push(
            T.kopieOben == null
                ? "tod-kopie: beim Mitspieler liegt keine Kopie"
                : `tod-kopie: die Kopie beim Mitspieler steht (oben·y bis ${T.kopieOben}), der Leib beim Sender liegt`
        );
    if (T.alterLiegt !== true)
        v.push(
            "tod-alter: ein Tier, das am Alter stirbt, ist sofort fort (_creatureNaturalDeath nimmt den Leib) — der Leib verschwindet auf dem Weg des Lebenszyklus"
        );
    if (T.fragen && T.fragen.length)
        v.push(
            `tod-frage: ${T.fragen.join(", ")} fragen selbst nach dem Sterben — der Leichnam stünde unter den Wesen`
        );
    return v;
}
// (T23) jeder Biss-Weg (Jagd, Beute, Gegenwehr) beißt im Ansprung mit dem Maul am Leib (Spalt ≤ 0,05 m).
function bissGesteVerdict(B) {
    if (!B) return ["biss-geste keine Probe"];
    const v = [];
    for (const art of ["jagd", "beute", "gegenwehr"]) {
        const L = B[art] || [];
        if (!L.length) {
            v.push(`biss-weg: ${art} — kein Biss im Takt`);
            continue;
        }
        const ohne = L.filter((b) => b.geste !== "pounce");
        if (ohne.length)
            v.push(
                `biss-geste: ${art} beißt ohne Ansprung (${ohne.length} von ${L.length}: ${ohne.map((b) => b.geste).join(", ")})`
            );
        const fern = L.filter((b) => !(b.spalt <= 0.05));
        if (fern.length)
            v.push(
                `biss-ferne: ${art} beißt mit dem Kopf ${Math.max(...fern.map((b) => b.spalt)).toFixed(2)} m vor dem Leib (Mitten ${fern.map((b) => b.xz).join(" / ")} m)`
            );
    }
    return v;
}
// (T25) die Wunde reist als Anteil des Lebens (voll, halb, 30 % je ± 0,01).
function wundeVerdict(W) {
    if (!Array.isArray(W) || W.length < 2) return ["wunde keine Probe"];
    const v = [];
    for (const x of W) {
        if (!(Math.abs(x.altVoll - 1) <= 0.01))
            v.push(`wunde-alt: ${x.seele} kehrt aus einem vollen alten Stand mit ${x.altVoll} des Lebens zurück`);
        if (!(Math.abs(x.altHalb - 0.5) <= 0.01))
            v.push(`wunde-alt: ${x.seele} kehrt aus einem halb verwundeten alten Stand mit ${x.altHalb} zurück`);
        if (!(Math.abs(x.neu30 - 0.3) <= 0.01))
            v.push(`wunde-neu: ${x.seele} kehrt mit 30 % gespeichert mit ${x.neu30} zurück`);
    }
    return v;
}
// (T24) der Biss kostet, was in Reichweite steht (keine Gestalt jenseits des Grob-Tors), und springt nie über seinen Sprung
// (Sims, Gegenprobe waagrecht); das stehende Reh: ≥ 5 von 6 Ansprüngen beißen; der Kopf zielt aus der gezeigten Pose (zehn
// Takte ohne Fortschritt ≤ 1e-6 rad).
const REH_SOLL = { bisse: 5, kopfDrift: 1e-6, kopfRest: 0.05 };
function bissReichVerdict(R, reh) {
    if (!R) return ["biss-reich keine Probe"];
    const v = [];
    if (!reh || !reh.boden) v.push("biss-reh keine Probe (kein trockener, ebener Ort)");
    else if (!(reh.anspruenge >= reh.versuche && reh.bisse >= REH_SOLL.bisse))
        v.push(
            `biss-reh: ${reh.bisse} Bisse aus ${reh.anspruenge} Ansprüngen auf ein stehendes Reh (Soll ≥ ${REH_SOLL.bisse} von ${reh.versuche}) — ${JSON.stringify(reh.je)}`
        );
    const K = reh && reh.kopfSumme;
    const KL = K && Array.isArray(K.klemme) ? K.klemme : null;
    if (!K) v.push("biss-kopf keine Probe (Wolf vor dem Reh, Pose still)");
    else if (!(Math.abs(K.rest) >= REH_SOLL.kopfRest))
        v.push(
            `biss-kopf-probe: der erste Rest ist ${K.rest} rad — die Pose weist schon aufs Ziel, die Probe trägt nicht`
        );
    else if (!(KL && K.rest >= KL[0] + REH_SOLL.kopfRest && K.rest <= KL[1] - REH_SOLL.kopfRest))
        v.push(
            `biss-kopf-probe: der erste Rest ${K.rest} rad steht an der Klemme ${JSON.stringify(KL)} — dort zeigt sich keine Summe, die Probe trägt nicht`
        );
    else if (!(K.drift <= REH_SOLL.kopfDrift))
        v.push(
            `biss-kopf: ohne Pose-Fortschritt wandert das Ziel der Kopf-Neigung in ${K.takte} Takten ${K.drift} rad (${K.reihe.join(" → ")}) — der Rest summiert sich auf das Ziel des Vor-Takts`
        );
    if (R.gestaltenJeTakt === null) v.push("biss-kosten keine Probe (Wolf und 15 Beutetiere)");
    else if (R.gestaltenJeTakt > 0)
        v.push(
            `biss-kosten: die Wahl der Beute rechnet je Takt ${R.gestaltenJeTakt} Gestalten von Tieren außer Reichweite (${R.msJeTakt} ms je Jäger) — das Grob-Tor fehlt`
        );
    if (R.simsAnspruenge === null) v.push("biss-sims keine Probe");
    else {
        if (R.simsAnspruenge > 0)
            v.push(
                `biss-sims: ${R.simsAnspruenge} Ansprünge in ${R.simsSek} s auf einen Leib ${R.simsUeber} m über Kopf und Sprung — ins Leere`
            );
        if (!(R.simsUeber > 0) || !(R.simsWaagrecht <= R.simsReich))
            v.push(
                `biss-sims-probe: der Leib liegt ${R.simsUeber} m über dem Sprung, der Wolf waagrecht ${R.simsWaagrecht} m vor ihm (Weite ${R.simsReich} m) — die Probe trägt nicht`
            );
    }
    return v;
}
// (Q11) das Urteil des Gesetzes: die Mutation einer Kern-Zahl (Masse, Schneide, Tempo) ändert den Treffer monoton, die
// Kraft der Führung ist der Leib.
function gesetzVerdict(G) {
    if (!G || !G.vor) return ["keine Messung"];
    const v = [];
    const pc = (a, b) => `${a.toFixed(2)} → ${b.toFixed(2)}`;
    const ids = Object.keys(G.vor);
    const schwer = ids.filter((id) => G.masse[id].kg > G.vor[id].kg * 1.001).length;
    if (schwer < ids.length - 1) v.push(`masse: ${schwer} von ${ids.length} Werken wiegen nach der Stoff-Zeile MAT`);
    if (!ids.some((id) => G.eisen[id].art === "SCHNITT") || !ids.some((id) => G.vor[id].frei))
        v.push("kein Schnitt/frei");
    for (const id of ids) {
        const [a, m, t, e, s] = [G.vor, G.masse, G.tempo, G.eisen, G.schneide].map((x) => x[id]);
        if (![a, m, t, e, s].every((x) => x && x.wirk)) v.push(`${id}: traf nicht`);
        else {
            if (m.kg > a.kg * 1.001 && !(m.p > a.p * 1.01))
                v.push(`masse ${id}: ${pc(a.kg, m.kg)} kg, Stoß ${pc(a.p, m.p)}`);
            if (a.frei && !(t.wirk > a.wirk * 1.01 && t.p > a.p * 1.01))
                v.push(`tempo ${id}: Wirkung ${pc(a.wirk, t.wirk)}, Stoß ${pc(a.p, t.p)}`);
            if (e.art === "SCHNITT" && !(s.wirk > e.wirk * 1.01))
                v.push(`schneide ${id}: Wirkung ${pc(e.wirk, s.wirk)}`);
            if (!(Math.abs(a.leib / G.leib - 1) < 1e-6))
                v.push(`fold ${id}: Kraft ÷ Güte ${pc(a.leib, G.leib)} (Leib)`);
        }
    }
    return v;
}
// (Q11 halten.K3) DER WERKZEUG-SATZ: jede Gestalt wirkt am Ziel ihrer Aufgabe über die Hand hinaus, gräbt genau mit offener
// Front, mäht nur mit fassender Schneide, zehrt, wo sie wirkt, führt den Faktor und wirkt verbraucht nicht; Form; Stoff.
const f2 = (x) => (x && Number.isFinite(x.wirk) ? x.wirk.toFixed(2) : "–");
const graebt = (x) => !!x && x.verb === "graben";
const maeht = (x) => !!x && x.verb === "pfluecken" && x.wirk > 0 && x.kraut >= x.wirk && x.wieder;
function satzVerdict(S) {
    if (!S || !S.hand) return ["keine Messung"];
    const v = [];
    for (const [id, g] of Object.entries(S)) {
        if (id === "hand") continue;
        const [x, h, L] = [g[g.ziel] || {}, S.hand[g.ziel] || {}, g.leer || { wirk: 1 }];
        const satt = Object.keys(g).filter((z) => g[z] && g[z].verb && g[z].wirk > 0 && !(g[z].zehrt > 0));
        const halb = g.halb && g.halb.kraft / x.kraft;
        if (!(x.wirk > (h.wirk || 0))) v.push(`${id} wirkt am ${g.ziel} ${f2(x)}`);
        if (g.boden && graebt(g.boden) !== g.oeffnet) v.push(`${id} gräbt gegen die Front`);
        if (g.wiese && g.wiese.wirk > 0 && !g.fasst) v.push(`${id} mäht ohne fassende Schneide`);
        if (satt.length) v.push(`${id} zehrt nicht am ${satt}`);
        if (g.halb && !(Math.abs(halb - S.hand.halb) < 0.01)) v.push(`${id} führt bei wear 0,5 ${halb}`);
        if (L.wirk > 0 || L.zehrt > 0) v.push(`${id} wirkt verbraucht`);
    }
    return v;
}
function formVerdict(F) {
    if (!F || !F.recurve) return ["keine Messung"];
    const w = (k, z) => F[k][z].wirk;
    return [
        [graebt(F.axtBlatt.boden) && !graebt(F.axt.boden), "form: Fällaxt gräbt mit Kopf, nicht mit Blatt"],
        [w("axtBlatt", "baum_eiche") < w("axt", "baum_eiche"), "form: Fällaxt fällt mit Blatt wie mit Kopf"],
        [graebt(F.spaten.boden) && !graebt(F.spatenAxt.boden), "form: Spaten gräbt mit Axt-Kopf, nicht mit Blatt"],
        [w("spatenAxt", "baum_eiche") > w("spaten", "baum_eiche"), "form: Spaten fällt mit Axt-Kopf wie mit Blatt"],
        [maeht(F.sichel.wiese), "sichel: sichel mäht nicht"],
        [!maeht(F.gerade.wiese), "sichel: gerade mäht"],
        [maeht(F.hohl.wiese), "sichel: hohl mäht nicht"],
        [w("recurve", "schuss") > w("bogen", "schuss") * 1.01, "bogen: Recurve 0,6 schießt nicht schneller"],
    ]
        .filter(([ok]) => !ok)
        .map(([, t]) => t);
}
function stoffVerdict(V) {
    const R = ["Frank", "Nihon", "Urvolk"].map((t) => (V || {})[t]).filter(Boolean);
    if (R.length < 3) return ["keine Messung"];
    const v = [];
    R.sort((a, b) => b.haerte - a.haerte).forEach((b, i, [st]) => {
        const a = R[i - 1] || { zehrt: 0, wear: 2 };
        if (!(b.zehrt > a.zehrt * 1.01)) v.push(`stoff: ${b.stoff} zehrt wie ${a.stoff}`);
        if (!(b.wear < a.wear)) v.push(`zustand: ${b.stoff} wie ${a.stoff}`);
        if (!(b.wirk[1] < b.wirk[0])) v.push(`wirkung: ${b.stoff} stumpft nicht`);
        if (!i && !(V.weich > st.zehrt * 1.01)) v.push(`härte: die halbe zehrt wie die volle`);
    });
    return v;
}
// (Q11 halten.K2) DAS STOFF-PAAR am Bus, je Paar [Ego, Third]: die Stoffe des Gesetzes, ein Klang (Pegel > −60 dB) binnen 5 ms
// nach dem Treffer, Funken genau bei Stahl auf Stein, Third = Ego, je zwei Paare ≥ 300 Hz Schwerpunkt auseinander (wie klang.K4).
function paarVerdict(P) {
    const [v, je] = [[], Object.entries(P || {})];
    for (const [k, [e, t]] of je) {
        const bus = e.db > -60 && e.ms >= 0 && e.ms <= 5 && !(e.funken > 0) === (k !== "stahl/stein");
        if (e.stoffe !== k || !bus || JSON.stringify(e) !== JSON.stringify(t)) v.push(k + " " + JSON.stringify([e, t]));
        for (const [l, [f]] of je) if (k < l && !(Math.abs(e.hz - f.hz) >= 300)) v.push(`${k} ≈ ${l}`);
    }
    return je.length === 3 ? v : ["keine Messung"];
}
// (Q12) halten.K4: die Spitze gegen die Parabel ihres Abschusses als Anteil des Falls ½·|g|·τ² ab 0,1 s; Staffel 1 Bahn und
// Treffer-Ort ≤ 5 %, Tempo √(2E/m); Staffel 2 der Pfeil steckt und kehrt aus dem Speicher wieder, das Tempo folgt BOGENMAT.
const fall = (g, t) => 0.5 * Math.abs(g) * t * t;
function bahnAbweichung(l, g) {
    let max = 0;
    for (const [t, ...q] of l.proben)
        if (t >= 0.1 - 1e-9)
            max = Math.max(
                max,
                Math.hypot(...q.map((x, i) => x - l.p0[i] - l.v0[i] * t - (i === 1 ? 0.5 * g * t * t : 0))) / fall(g, t)
            );
    return max;
}
function bogenK4Verdict(K) {
    if (!K || !K.bahn || K.bahn.length < 9) return { s1: ["keine Messung"], s2: ["keine Messung"] };
    const s1 = [];
    for (const l of K.bahn) {
        const a = bahnAbweichung(l, K.g);
        if (!(a <= 0.05)) s1.push(`bahn ${l.wi}°/${l.hz} Hz ${(a * 100).toFixed(1)} %`);
        if (!(Math.abs(Math.hypot(...l.v0) / l.vSoll - 1) <= 0.01)) s1.push(`tempo ${l.wi}°`);
    }
    const [W, T, S, Z] = [K.wand || {}, K.tier || {}, K.speicher || {}, K.zug || {}];
    if (W.treffer) {
        const t = (W.zF - W.p0[2]) / W.v0[2];
        const d = [W.treffer.x, W.treffer.y, W.treffer.z].map(
            (x, i) => x - W.p0[i] - W.v0[i] * t - (i === 1 ? 0.5 * K.g * t * t : 0)
        );
        W.anteil = Math.hypot(...d) / fall(K.g, t);
    }
    if (!(W.anteil <= 0.05)) s1.push("treffer-ort");
    const soll = {
        "steckt-wand": W.steckt === 1 && W.bild,
        "steckt-boden": K.boden >= 3,
        "steckt-tier": T.n >= 1,
        "folgt-tier": T.amTier && Math.abs(T.folgt[0] - 2) < 0.01 && Math.hypot(T.folgt[1], T.folgt[2]) < 0.01,
        "speicher-tier": T.imSnapshot >= 1 && T.wieder === T.n && T.lageGleich && T.bildWieder,
        "speicher-welt": S.imSnapshot >= 1 && S.wieder === S.steckend && S.lageGleich && S.bild,
        "zug-kraft":
            Math.abs(Z.v1 / Z.vS1 - 1) < 0.01 && Math.abs(Z.v2 / Z.vS2 - 1) < 0.01 && Math.abs(Z.v2 / Z.v1 - 1) > 0.02,
    };
    return { s1, s2: Object.keys(soll).filter((k) => !soll[k]) };
}
// S14 — der Täter aus demselben Abschuss: die alte Bahn (semi-implizit je Takt), der alte Abschied (nichts steckt)
function bogenK4Taeter(K) {
    const bahn = K.bahn.map((l) => {
        const [q, v, proben] = [l.p0.slice(), l.v0.slice(), []];
        for (let k = 1; k / l.hz <= 1.5; k++) {
            v[1] += K.g / l.hz;
            for (let i = 0; i < 3; i++) q[i] += v[i] / l.hz;
            proben.push([k / l.hz, ...q]);
        }
        return { ...l, proben };
    });
    return { ...K, bahn, wand: { ...K.wand, steckt: 0 }, boden: 0, tier: {}, speicher: {} };
}
// (Q13) halten.K5 Staffel 1, je Soll beim Namen: der Schaden aus 4 · 8 · 12 m steigt und liegt mit dem Wurf auf EINER Geraden
// über v² (± 3 % des größten), 2 m bleibt unter ihrem Nullpunkt schadlos, jeder Schaden geht als „sturz" durch das Tor — ein
// fester Schaden je Sturz fällt an der Reihe, ein Höhen-Zähler am Wurf; die Tod-Lage ist bei 60 Hz mit Leerlauf und 15 Hz
// ohne ihn bei 0,6 s gleich (≤ 0,5° · 0,5 cm) und kippt; der Wolf tötet über den Biss, die Rückkehr am Anker trägt Leben,
// Wunde, Gnade, Lebens-Spur, Seele, Trauer und Journal; Inventar und Bindung überstehen den Tod, der Abdruck nach dem Reload
// gleicht dem vor dem Speichern je Teil, das Alter des Fuchses eingeschlossen (das erste Bild der Wiederkehr zählt keinen Takt
// des Lebens nach). Der Abdruck ist kanonisches JSON (K5_ABDRUCK, feste Reihe), sein Hash die Zahl.
const hash = (o) => stammLib.sha(JSON.stringify(o)).slice(0, 12);
const f1 = (v) => (v === null || v === undefined ? "–" : Number(v).toFixed(2));
// DER BERICHT einer Probe: JSON, Zahlen auf Tausendstel; `keys` (Leerzeichen-Liste) wählt die Größen
const json = (o) => JSON.stringify(o, (k, x) => (typeof x === "number" ? +x.toFixed(3) : x));
const zeig = (name, o, keys) =>
    console.log(`  (${name}) ${json(keys ? Object.fromEntries(keys.split(" ").map((k) => [k, o && o[k]])) : o)}`);
function k5Verdict(K) {
    const [n2, h4, h8, h12, wurf] = K.sturz;
    const k = (h12.d - h4.d) / (h12.v ** 2 - h4.v ** 2);
    const auf = (x) => Math.abs(x.d - h4.d - k * (x.v ** 2 - h4.v ** 2)) <= 0.03 * h12.d;
    const [[w1, y1], [w2, y2]] = K.lage;
    const { tod, vorTod: V, nachTod: N } = K;
    const gleich = (A, B, t) => JSON.stringify(A[t]) === JSON.stringify(B[t]);
    const soll = {
        "sturz-reihe": h4.d > 0 && k > 0 && auf(h8),
        "sturz-wurf": auf(wurf),
        "sturz-schwelle": n2.d === 0 && h4.d <= k * (h4.v ** 2 - n2.v ** 2),
        "sturz-tor": K.sturz.every((x) => !x.d || x.quelle === "sturz"),
        "tod-lage": Math.abs(w1 - w2) <= 0.5 && Math.abs(y1 - y2) <= 0.005 && w1 > 20,
        tod: tod.q === "jagd" && tod.rueckkehr.every(Boolean) && tod.anker < 2,
        "tod-zustand": !!N.bindung && gleich(V, N, "inventar") && gleich(V, N, "bindung"),
    };
    for (const t of ["ort", "inventar", "leben", "bindung", "alter"])
        soll["wiederkehr-" + t] = gleich(N, K.nachReload, t);
    return Object.keys(soll).filter((x) => !soll[x]);
}
// (Q14) halten.K5 Staffel 2: jede Mutation des getragenen Werks (Eisen · Bronze · Holz) und der Nahrung (Kraut · Fleisch) gibt
// andere Lebenswerte als ihre Geschwister und als der leere Leib, und Werk und Nahrung reisen im Stand (Werte und Nahrung nach
// dem Reload wie vor dem Speichern).
function q14Verdict(K) {
    const [Q, N, R] = [K.q14, K.nachTod, K.nachReload],
        J = JSON.stringify;
    if (!Q) return ["keine Messung"];
    const anders = (M) => new Set([Q.leer, ...Object.values(M)].map(J)).size === 1 + Object.keys(M).length;
    return [
        [anders(Q.werk), "werk-mutation"],
        [anders(Q.nahrung), "nahrung-mutation"],
        [J(N.werte) === J(R.werte) && N.nahrung.length, "stand-werte"],
        [J(N.nahrung) === J(R.nahrung), "stand-nahrung"],
    ]
        .filter(([gut]) => !gut)
        .map(([, n]) => n);
}
// der Lauf: die Probe (sie speichert am Ende), der IDB-Put landet, der Reload, das erste Bild der geladenen Welt (ohne
// Bild-Schleife von Hand, `__seitenTakt`), ihr Abdruck
async function k5Lauf(page) {
    const k5 = await page.evaluate(`(${K5_VOR})(${K5_ABDRUCK})`);
    await sleep(1500);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await warteAufWelt(page, 180000);
    k5.nachReload = await page.evaluate(`window.__seitenTakt().then(${K5_ABDRUCK})`);
    return k5;
}
// die Zahl: der Hash des gespeicherten und des geladenen Abdrucks, dann die ganze Probe (Zahlen auf Tausendstel)
function k5Bericht(K, check) {
    const v = K ? k5Verdict(K) : ["kein Lauf"];
    if (K) console.log(`  (Q13) ${hash(K.nachTod)} → ${hash(K.nachReload)} ` + json(K));
    check(!v.length, "Q13 halten.K5 Staffel 1: Sturz, Tod durch den Wolf, Wiederkehr mit Zustand " + v);
    if (!K) return;
    const mit = (sturz, nachReload = K.nachReload) => k5Verdict({ ...K, sturz, nachReload });
    check(
        mit(K.sturz.map((x) => ({ ...x, d: 20 }))).includes("sturz-reihe") &&
            mit(K.sturz.map((x, i) => (i > 3 ? { ...x, d: K.sturz[1].d } : x))).includes("sturz-wurf"),
        "SELBST-TEST (S17): ein fester Sturz-Schaden ROT an der Reihe, ein Höhen-Zähler am Wurf"
    );
    check(
        mit(K.sturz, { ...K.nachReload, inventar: [] }).includes("wiederkehr-inventar"),
        "SELBST-TEST (S18): eine Wiederkehr ohne Inventar ROT am Teil"
    );
    const Q = K.q14 || {};
    zeig("Q14", { ...Q, stand: [K.nachTod.werte, K.nachReload.werte, K.nachTod.nahrung, K.nachReload.nahrung] });
    // „die Lebenswerte lesen Werk und Nahrung — je Mutation andere Werte als Geschwister und leerer Leib, beide reisen im Stand"
    check(!q14Verdict(K).length, "Q14 halten.K5 Staffel 2: Werk und Nahrung " + q14Verdict(K));
    check(
        q14Verdict({ ...K, nachReload: { ...K.nachReload, nahrung: [] } }).includes("stand-nahrung") &&
            q14Verdict({ ...K, q14: { ...Q, nahrung: { kraut: Q.leer } } }).includes("nahrung-mutation"),
        "SELBST-TEST (S20): ein Stand ohne Nahrung, eine Nahrung ohne Wirkung"
    );
}
const server = statikServer();
let ok = true;
const check = (cond, msg) => {
    console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
    if (!cond) ok = false;
};
// `--k5` endet nach der Probe: Browser und Server zu, das Urteil, der Exit
async function k5Ende(browser, k5) {
    await browser.close();
    server.close();
    k5Bericht(k5, check);
    process.exit(ok ? 0 : 1);
}

const { WELLE_L, K5_VOR, K5_ABDRUCK, K1_BILD, K1_LABOR } = require("./lib/kampf-proben.cjs");
// (Q13) `--k5` fährt nur Sturz, Tod und Wiederkehr — mit dem echten Renderer (die Station halten.K5 am Gerät)
const NUR_K5 = process.argv.includes("--k5");
// (Q15) `--k1` fährt nur den Treffer im Bild je Mutation und das Labor — mit dem echten Renderer (die Station halten.K1 am Gerät)
const NUR_K1 = process.argv.includes("--k1");
// das Bild der Linse (Rezept linse, 800 × 600: die Mitte frei von der Oberfläche — bei 640 × 360 deckte die Konsole den Treffer)
const BILD = NUR_K5 || NUR_K1;

// (Q15) halten.K1 Staffel 2, je Soll beim Namen: im Takt des Spiels trifft das Langschwert in jedem Lauf (vor · masse · schneide),
// die Schneide liegt im Urteil UND in der gezeichneten Pose in der Bahn (≥ 0,9); die Masse (MAT.*.rho × 1,25) hebt das Werk in
// Welt und Labor gleich (über √1,25 — das Gehilz wiegt nicht aus MAT) und die wirksame Masse des Treffers (p ÷ v√eff) wie die des
// Werks (± 2 %), die Schneide (sigY der Eisen-Zeile × 1,5, die Prägung Nihon) senkt die Fase und hebt die Energie je
// Tempo (KE ÷ v²·eff); der Schaden folgt der Energie (Schaden ÷ Kraft der Führung ÷ KE je Zone gleich); das Labor zeigt dasselbe Werk (Masse und
// Fase wie die Welt ± 0,5 %) in jedem Lauf.
const K1_SOLL = { bahn: 0.9, gleich: 0.005, masse: 1.25, band: 0.02 };
function k1Verdict(K) {
    const [W, L] = [K.welt, K.labor];
    const v = [];
    const rel = (a, b) => Math.abs(a / b - 1);
    for (const l of ["vor", "masse", "schneide"]) {
        const [w, b] = [W[l], L[l]];
        if (!w || !w.traf) {
            v.push(l + (w && w.abbruch ? "-abbruch: " + w.abbruch : "-traf"));
            continue;
        }
        if (!(w.edgeQ >= K1_SOLL.bahn && w.schneideBild >= K1_SOLL.bahn)) v.push(l + "-bahn");
        if (!b || !(rel(b.kg, w.kg) <= K1_SOLL.gleich && rel(b.edgeWinkel, w.edgeWinkel) <= K1_SOLL.gleich))
            v.push(l + "-labor");
    }
    if (v.length) return v;
    const mEff = (x) => x.p / (x.v * Math.sqrt(x.eff));
    const je = (x) => x.KE / (x.v * x.v * x.eff);
    const werk = W.masse.kg / W.vor.kg;
    if (!(werk > K1_SOLL.masse ** 0.5 && rel(L.masse.kg / L.vor.kg, werk) <= 1e-3)) v.push("masse-werk");
    if (!(rel(mEff(W.masse) / mEff(W.vor), W.masse.mEffWerk / W.vor.mEffWerk) <= K1_SOLL.band)) v.push("masse-treffer");
    if (!(W.schneide.edgeWinkel < W.vor.edgeWinkel && L.schneide.edgeWinkel < L.vor.edgeWinkel))
        v.push("schneide-fase");
    if (!(je(W.schneide) > je(W.vor) * 1.01)) v.push("schneide-treffer");
    const z = ["vor", "masse", "schneide"].map((l) => W[l]).filter((x) => x.zone === W.vor.zone);
    const wirk = (x) => x.schaden / (x.kraft * x.KE);
    if (z.some((x) => !(rel(wirk(x), wirk(W.vor)) <= 1e-3))) v.push("schaden");
    return v;
}
// der Lauf: je Mutation ein Hieb im Takt des Spiels, das gehaltene Bild (Third) als PNG neben {AUS}, dann das Labor; der Tab des
// Labors verbarg die Welt (rAF schlief, K1_BILD stand 300 s) — die Welt zeichnet vorn wie die Werkbank, das Labor misst ohne Bild,
// ein Abbruch des Bilds steht beim Namen im Urteil
async function k1Lauf(browser, page) {
    const K = { welt: {}, labor: {} };
    const aus = process.env.KAMPF_BILDER || require("path").join(require("os").tmpdir(), "kampf-k1");
    const lab = await browser.newPage();
    await server.zeige(lab, 120000, "worlds/schmiede/index.html", "load");
    await page.bringToFront();
    for (const l of ["vor", "masse", "schneide"]) {
        K.welt[l] = await page.evaluate(K1_BILD, l).catch((e) => ({ abbruch: e.message.split("\n")[0] }));
        if (K.welt[l].traf) await page.screenshot({ path: `${aus}-${l}.png` });
        K.labor[l] = await lab.evaluate(K1_LABOR, l);
    }
    return K;
}
async function k1Ende(browser, K) {
    await browser.close();
    server.close();
    zeig("Q15", K);
    check(
        !k1Verdict(K).length,
        "Q15 halten.K1 Staffel 2: Masse × Schneide × Tempo im Bild und am Labor-Werk " + k1Verdict(K)
    );
    const [W, L] = [K.welt, K.labor];
    check(
        W.vor.traf &&
            k1Verdict({ ...K, welt: { ...W, vor: { ...W.vor, schneideBild: 0.18 } } }).includes("vor-bahn") &&
            k1Verdict({ ...K, welt: { ...W, vor: { abbruch: "x" } } }).includes("vor-abbruch: x") &&
            k1Verdict({ ...K, labor: { ...L, masse: L.vor } }).includes("masse-labor"),
        "SELBST-TEST (S21): die Breitseite im Bild, ein Bild ohne Frame, ein Labor ohne Mutation"
    );
    process.exit(ok ? 0 : 1);
}

(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: BILD ? "linse" : "null", frist: 300000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    if (!BILD) await nullRenderer(page); // GPU-frei, Produktions-Boot
    let out;
    let welle = null;
    let k5 = null;
    try {
        await server.zeige(page, 120000, `index.html${BILD ? "?holz=kienspan" : ""}`, "networkidle0");
        await warteAufWelt(page, 120000);
        // die Welt steht (das EINE Einschwingen, welt-boot): Takt um Takt ein Bild des Loops — der Takt von Hand in Mikro-Tasks
        // gab dem echten Renderer nie ein Bild frei (`--k1` swiftshader: „DIE WELT STEHT NICHT nach 17181 Takten", ankunft 83 offen)
        await page.evaluate(() => window.__weltStehtNach());

        // SYNCHRON messen (keine awaits — der rAF-Loop kann nicht dazwischenfunken).
        if (NUR_K5) return k5Ende(browser, await k5Lauf(page));
        if (NUR_K1) return k1Ende(browser, await k1Lauf(browser, page));
        out = await page.evaluate(() => {
            const s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            // KERN-PFLICHT: die Schwung-/Gefühls-Gesetze leben NUR im schmiede-Gesetzbuch (ARENA).
            const AG = A._arenaGesetz();
            if (!AG || !AG.schwung || !AG.gefuehl) return { error: "ARENA-Gesetz fehlt" };
            const K = AG.schwung;
            const G = AG.gefuehl;

            // ── KONSUM am Zähl-Spion (Lehre 6): der Versorger o[k] zählt, während lauf() den Leser einmal ruft; die
            // Absenzen (kein attackSpeed, kein Direkt-Schaden, die Sim liest nie den Hit-Stop) halten die Wand bis D3d ──
            const ruft = (window.__ruft = (lauf, k) => {
                const eigen = Object.prototype.hasOwnProperty.call(r, k),
                    f0 = r[k];
                let n = 0;
                r[k] = function (...a) {
                    n++;
                    return f0.apply(this, a);
                };
                try {
                    lauf();
                } finally {
                    if (eigen) r[k] = f0;
                    else delete r[k];
                }
                return n > 0;
            });
            o.checks.ruftSelbst = !ruft(() => r._hitStopFactor(0), "_playerSwingDauer"); // ein Leser ohne Ruf bleibt stumm
            const absenzKlick = window.__fehlt(r._playerAttackCreature, /attackSpeed|damageCreature/);
            const absenzDauer = window.__fehlt(r._beginPlayerSwing, /attackSpeed/);
            // der Tod im Kampf fällt den EINEN Fall (_kreaturFaellt, (D) treibt ihn), keiner despawnt selbst
            const absenzTod = window.__fehlt([r._creatureCombatDeath, r._kreaturFaellt], /removeCreature\(/);

            // ── (A) DAUER ∝ √I — ein ECHTER Blueprint durch die ECHTE Quelle, ρ(holz) × 2 in der Stoff-Zeile ──
            const box = (m, sz, p) => ({ shape: "box", material: m, size: sz, position: p || { x: 0, y: 0, z: 0 } });
            const blu = s.blueprints;
            const leicht = {
                name: "_kg_klinge",
                parts: [
                    box("holz", { x: 0.15, y: 1.5, z: 0.15 }),
                    box("holz", { x: 0.6, y: 0.6, z: 0.6 }, { x: 0, y: 1.5, z: 0 }),
                ],
            };
            const zeile = s.materials.holz;
            const rho = zeile.rho;
            const mess = () => [r._swingDynamics(leicht).swingInertia, r._swingDauerFuerBlueprint(leicht)];
            const [I1, D1] = mess();
            zeile.rho = 2 * rho;
            const [I2, D2] = mess();
            zeile.rho = rho;
            o.dauer = { I1, I2, D1, D2 };
            const eps = 0.005;
            o.checks.aBeideUngeklemmt =
                I2 > I1 * 1.5 &&
                D1 > K.minDauerSec + eps &&
                D1 < K.maxDauerSec - eps &&
                D2 > K.minDauerSec + eps &&
                D2 < K.maxDauerSec - eps;
            o.dauerRatio = D1 > 0 ? D2 / D1 : 0;
            o.dauerSoll = I1 > 0 ? Math.sqrt(I2 / I1) : 0;
            o.checks.aVerhaeltnisWurzelI = o.dauerSoll > 0 && Math.abs(o.dauerRatio / o.dauerSoll - 1) <= 0.05;
            // die Faust hat eine endliche Dauer (kein Instant-Prügeln)
            o.checks.aFaustDauer = r._swingDauerFuerBlueprint(null) === K.handDauerSec && K.handDauerSec > 0.1;
            // die Werkstatt-Ablesung (Tempo) liest die Schwung-Quelle (die Rolle von Hand hält den Waffen-Zweig)
            const alsWaffe = Object.assign({}, leicht, { role: "weapon", roleManual: true });
            o.checks.werkstattLiestQuelle = ruft(() => r._blueprintAbilityStats(alsWaffe), "_swingDauerFuerBlueprint");

            // ── Bühne für (B)/(C)/(E): Waffe in die Hand, bekannte Blickrichtung ──
            const p = s.player;
            const pm = s.playerMesh;
            if (!p || !pm) return { error: "kein Spieler" };
            // der Stand der Bühne, je Feld [Halter, Name] — am Ende kehrt jedes zurück
            const BUEHNE = [
                [s, "yaw"],
                [p, "equipped"],
                [p, "_swing"],
                [p, "_hitStopUntil"],
                [s, "_landImpactPending"],
                [p, "lastAttackAt"],
                [s, "maxCreatures"],
                [s, "playerVel"],
                [s, "playerUnderwater"],
                [p, "mountedArch"],
                [p, "walkPhase"],
                [p, "_gaitW"],
                [p, "animationLastTick"],
            ];
            const saved = Object.fromEntries(BUEHNE.map(([h, k]) => [k, h[k]]));
            blu._kg_klinge = leicht;
            p.equipped = { held: "_kg_klinge" };
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
            s.yaw = 0; // Blick nach +z (die _loopCamera-Konvention)
            s.pitch = 0;
            // die Klinge folgt dem Fadenkreuz: die ECHTE Kamera steht auf dem Blick
            r.setCameraMode("first");
            r._loopCamera(900);
            p._hitStopUntil = 0;
            p._swing = null;

            const spawnBei = (dx, dz) => {
                const c = r.spawnCreatureAt(pm.position.x + 200, pm.position.y, pm.position.z + 200, "happy", "wesen");
                if (c) c.position.set(pm.position.x + dx, pm.position.y, pm.position.z + dz);
                return c;
            };
            const reach = r._kampfBladeReach();
            o.reach = reach;
            const cNeben = spawnBei(0.9, Math.min(1.8, reach - 0.4)); // NEBEN dem Crosshair, in der Kapsel
            const cRuecken = spawnBei(0, -2.0); // HINTER dem Rücken
            if (!cNeben || !cRuecken) return { error: "Kreatur-Spawn fehlgeschlagen (Cap?)" };
            // Das Fadenkreuz steht 0,9 m NEBEN dem Ziel auf seiner Leibes-Höhe (Gier 0, die Neigung auf die Mitte):
            // die Klinge zielt durchs Fadenkreuz und fegt den Bogen ±arcHalf.
            {
                const b = new THREE.Box3().setFromObject(cNeben);
                const c = s.camera.position;
                s.pitch = Math.atan2((b.min.y + b.max.y) / 2 - c.y, Math.max(0.5, cNeben.position.z - c.z));
                r._loopCamera(901);
            }
            // ── KONSUM der EINEN Quellen am Zähl-Spion: Klick → Schwung → Dauer, HUD, Hit-Stop, Fall → Gefälle (den Klang misst Q11 halten.K2 am Bus) ──
            p._swing = null;
            o.checks.klickLoestNurAus = ruft(() => r._playerAttackCreature(cNeben), "_beginPlayerSwing") && absenzKlick;
            p._swing = null;
            o.checks.cooldownLiestQuelle = ruft(() => r._beginPlayerSwing(null), "_playerSwingDauer") && absenzDauer;
            if (p._swing) p._swing.lastT = 0;
            o.checks.anzeigeLiestHitStop = !!p._swing && ruft(() => r._tickKampfSchwung(0.001), "_hitStopFactor");
            p._swing = null;
            s._statsHudLastTick = s._statsHudTooltipLastTick = 0;
            o.checks.hudLiestQuelle = ruft(() => r.tickStatsHud(1e6), "_playerSwingDauer");
            s._statsHudLastTick = s._statsHudTooltipLastTick = 0;

            const schwinge = (t0) => {
                // ein voller Schwung über die synthetische Anzeige-Uhr; zählt die
                // hp-Abfälle des Neben-Ziels (Dedup-Beweis) + merkt das Hit-Fenster.
                p._swing = null;
                const okStart = r._beginPlayerSwing(r._pickCreatureAtCrosshair());
                if (!okStart || !p._swing) return { okStart: false, hits: 0 };
                p._swing.lastT = t0;
                let hits = 0;
                let tHit = null;
                let prevHp = cNeben.userData.hp;
                let t = t0;
                for (let k = 0; k < 200 && p._swing; k++) {
                    t += 0.02;
                    r._tickKampfSchwung(t);
                    if (cNeben.userData.hp < prevHp) {
                        hits++;
                        if (tHit === null) tHit = t;
                        prevHp = cNeben.userData.hp;
                    }
                }
                return { okStart: true, hits, tEnd: t, tHit };
            };

            // ── (B) SWEEP: Neben-Ziel EINMAL, Rücken-Ziel NIE, Juice feuert ──
            const hpNeben0 = cNeben.userData.hp;
            const hpRueck0 = cRuecken.userData.hp;
            s._landImpactPending = 0;
            const lauf1 = schwinge(1000);
            o.sweep = lauf1;
            o.checks.bTrifftNeben = lauf1.okStart && cNeben.userData.hp < hpNeben0;
            o.checks.bDedupEinmal = lauf1.hits === 1;
            o.checks.bNieRuecken = cRuecken.userData.hp === hpRueck0 && !cRuecken.userData.dying;
            // das Hit-Stop-Fenster liegt im Gesetz-Band [freezeMinSec, freezeMaxSec] ab dem Treffer-Takt
            o.freeze = lauf1.tHit !== null ? p._hitStopUntil - lauf1.tHit : null;
            o.checks.bHitStopGesetzt =
                o.freeze !== null && o.freeze >= G.freezeMinSec - 1e-9 && o.freeze <= G.freezeMaxSec + 1e-9;
            o.checks.bKameraImpuls = (s._landImpactPending || 0) >= G.dipMin - 1e-9;
            // ein zweiter Schwung trifft WIEDER (der Dedup gilt JE Schwung, nicht
            // global) — das Ziel re-pinnen (der Knockback schob es hinaus).
            const pinNeben = () =>
                cNeben.position.set(pm.position.x + 0.9, pm.position.y, pm.position.z + Math.min(1.8, reach - 0.4));
            p._hitStopUntil = 0;
            pinNeben();
            const hpNeben1 = cNeben.userData.hp;
            const lauf2 = schwinge(2000);
            o.checks.bZweiterSchwungTrifft = lauf2.okStart && cNeben.userData.hp < hpNeben1;

            // ── (S2) SELBST-TEST: Kapsel-Mathe gestubbt (∞) → kein Treffer ──
            p._hitStopUntil = 0;
            pinNeben();
            const savedSeg = r._segSegDistSq;
            r._segSegDistSq = () => Infinity;
            const hpNeben2 = cNeben.userData.hp;
            const laufStub = schwinge(3000);
            r._segSegDistSq = savedSeg; // restaurieren (Gate-Hook-Lehre)
            o.checks.s2LinseFeuert = laufStub.okStart && cNeben.userData.hp === hpNeben2;

            // ── (C) HIT-STOP ≠ SIM: Anzeige friert, die Fixed-Akku läuft weiter ──
            p._hitStopUntil = Number.MAX_SAFE_INTEGER; // Hit-Stop „ewig" (synthetisch)
            // (C1) die Schwung-Phase friert
            p._swing = null;
            r._beginPlayerSwing();
            const swC = p._swing;
            swC.lastT = 5000;
            for (let k = 1; k <= 20; k++) r._tickKampfSchwung(5000 + k * 0.02);
            o.checks.cSchwungFriert = !!p._swing && p._swing.t === 0;
            p._swing = null;
            // (C2) der GANZE Leib steht (halten.K2): mitten im Strike gleitet das Ziel
            if (!pm.userData.rig) r.applyPlayerSoul("human");
            const mesh = s.playerMesh;
            if (!mesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            s.playerUnderwater = false;
            p.mountedArch = null;
            let vStub = 5;
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            const hand = () => mesh.userData.rig.armR.wrist.getWorldPosition(new THREE.Vector3()).sub(mesh.position);
            o.handM = [];
            const gehe = (t0, n) => {
                r._beginPlayerSwing(cNeben);
                p._swing.t = p._swing.windupSec + 0.5 * p._swing.strikeSec;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0);
                const ph0 = p.walkPhase,
                    h0 = hand();
                for (let k = 1; k <= n; k++) {
                    cNeben.position.x += 0.01;
                    r.animatePlayerSoul(t0 + k / 60);
                }
                o.handM.push(hand().distanceTo(h0));
                p._swing = null;
                return p.walkPhase - ph0;
            };
            o.checks.cGangFriert = gehe(6000, 30) === 0 && o.handM[0] === 0;
            // (C3) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (Fixed-Akku-Probe)
            s.playerVel = saved.playerVel; // die Sim braucht den ECHTEN Body (kein Stub)
            const simT0 = s._fixedSimTime;
            const steps1 = r._loopFixedStep(0.05, performance.now() / 1000);
            const steps2 = r._loopFixedStep(0.05, performance.now() / 1000 + 0.05);
            o.simSteps = steps1 + steps2;
            o.simDelta = s._fixedSimTime - simT0;
            o.checks.cSimLaeuftWeiter = o.simSteps >= 2 && o.simDelta > 0;
            // (C4) Gegenprobe: vor dem Treffer läuft die Anzeige-Uhr (der Halt ist ein Fenster ab ihm)
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            p._hitStopAb = 8000;
            o.checks.cGegenprobeLaeuft = gehe(7000, 30) > 0 && o.handM[1] > 0.001;
            // (S1) SELBST-TEST: _hitStopFactor ≡ 1 gestubbt → trotz Hit-Stop läuft die Uhr
            const savedFactor = r._hitStopFactor;
            p._hitStopUntil = Number.MAX_SAFE_INTEGER;
            r._hitStopFactor = () => 1;
            const dPhaseStub = gehe(8000, 30);
            r._hitStopFactor = savedFactor; // restaurieren (Gate-Hook-Lehre)
            p._hitStopUntil = 0;
            o.checks.s1LinseFeuert = dPhaseStub > 0;

            // ── (E) OBERKÖRPER-LAYER additiv über der Lokomotion ──
            const rig = mesh.userData.rig;
            const poseBei = (swing) => {
                vStub = 0;
                p._gaitW = 0;
                p.walkPhase = 0;
                p._swing = swing || null;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(9000);
                r.animatePlayerSoul(9000); // dt=0 (Uhr steht) — deterministische Idle-Pose
                const huelle = mesh.children.find((ch) => ch && ch.userData && ch.userData._creatureSkin);
                return {
                    armX: rig.armR.shoulder.rotation.x,
                    chestY: rig.chest ? rig.chest.rotation.y : 0,
                    // der Layer dreht die Gelenke als Quaternion (der Leib folgt der Klinge) — gemessen wird der
                    // Winkel der Drehung, nicht eine Euler-Achse
                    armQ: rig.armR.shoulder.quaternion.clone(),
                    chestQ: (rig.chest || rig.spine).quaternion.clone(),
                    huelleZ: huelle ? huelle.position.z : 0,
                    legLHip: rig.legL.hip.rotation.x,
                    legRKnee: rig.legR.knee.rotation.x,
                    // die Sohlen in der Welt (Bericht: wie weit der Ausfall die Füße mitnimmt — die Beine-Wand oben prüft
                    // nur die Gelenk-Winkel)
                    fussL: rig.legL.ankle ? rig.legL.ankle.getWorldPosition(new THREE.Vector3()) : null,
                    fussR: rig.legR.ankle ? rig.legR.ankle.getWorldPosition(new THREE.Vector3()) : null,
                };
            };
            const dauerE = r._playerSwingDauer();
            // der Schwung trägt seinen Rahmen (Körper und Gerät, _kampfSchwungRahmen) wie _beginPlayerSwing ihn legt
            const rahmenE = r._kampfSchwungRahmen({});
            const mkSwing = (t) => ({
                t,
                dauer: dauerE,
                windupSec: dauerE * K.windupFrac,
                strikeSec: dauerE * K.strikeFrac,
                weapon: null,
                hits: new Set(),
                rahmen: rahmenE,
                reach: rahmenE.reach,
                ziel: null,
                lastT: 0,
            });
            const pose0 = poseBei(null); // reine Lokomotion (Idle)
            const poseW = poseBei(mkSwing(dauerE * K.windupFrac * 0.6)); // mitten im Windup
            const poseS = poseBei(mkSwing(dauerE * (K.windupFrac + K.strikeFrac * 0.5))); // mitten im Strike (der Ausfall)
            const poseEnd = poseBei(null); // nach dem Schwung: rückstandsfrei
            const gleit = (a, b) => (a && b ? Math.hypot(a.x - b.x, a.z - b.z) : null);
            o.pose = {
                armRad: poseW.armQ.angleTo(pose0.armQ),
                rumpfRad: poseW.chestQ.angleTo(pose0.chestQ),
                fussGleitenM: +Math.max(
                    gleit(poseS.fussL, pose0.fussL) || 0,
                    gleit(poseS.fussR, pose0.fussR) || 0
                ).toFixed(3),
            };
            o.checks.eArmHebt = poseW.armQ.angleTo(pose0.armQ) > 0.3 && poseW.chestQ.angleTo(pose0.chestQ) > 0.05;
            o.checks.eBeineByteGleich = poseW.legLHip === pose0.legLHip && poseW.legRKnee === pose0.legRKnee;
            o.checks.eRueckstandsfrei =
                poseEnd.armQ.equals(pose0.armQ) &&
                poseEnd.chestQ.equals(pose0.chestQ) &&
                poseEnd.huelleZ === pose0.huelleZ;
            p._swing = null;

            // ── Bühne restaurieren (der Rücken-Zeuge fällt zuletzt den EINEN Fall: er liest das Gefälle am Spion) ──
            o.checks.todKipptStattDespawn = ruft(() => r._kreaturFaellt(cRuecken), "_fieldGradient") && absenzTod;
            for (const c of [cNeben, cRuecken]) if (c.parent) r.removeCreature(c); // ein Wesen oder ein Gefallener
            delete blu._kg_klinge;
            for (const [h, k] of BUEHNE) h[k] = saved[k];

            return o;
        });
        welle = await page.evaluate(
            WELLE_L,
            require("../spec/profiband/haushalt.json").messorte.find((o) => o.id === "wiese")
        );
        k5 = await k5Lauf(page).catch((e) => console.log("  (Q13) ABBRUCH " + e.message));
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
        if (NUR_K1) return k1Ende(browser, { welt: { vor: { abbruch: out.error } }, labor: {} });
    }
    await browser.close();
    server.close();

    console.log("\n===== gate:kampf-gefuehl =====\n");
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const c = out.checks;
        console.log(`  (A) I1=${json([out.dauer, out.dauerRatio, out.dauerSoll])}`);
        zeig("B", out, "reach sweep simSteps simDelta handM freeze");
        zeig("E", out.pose);
        for (const [k, satz] of Object.entries({
            // "SELBST-TEST: der Zähl-Spion bleibt stumm, wenn der Leser den Versorger nicht ruft"
            ruftSelbst: "SELBST-TEST: der Zähl-Spion bleibt stumm",
            // "KONSUM: der Crosshair-Klick löst NUR aus (kein attackSpeed, kein Direkt-Schaden)"
            klickLoestNurAus: "KONSUM: der Crosshair-Klick löst NUR aus",
            // "KONSUM: der Cooldown IST die Schwung-Dauer (_playerSwingDauer — EINE Quelle)"
            cooldownLiestQuelle: "KONSUM: der Cooldown IST die Schwung-Dauer",
            // "KONSUM: das Stats-HUD (Angriffstempo) liest die Schwung-Quelle"
            hudLiestQuelle: "KONSUM: das Stats-HUD (Angriffstempo)",
            // "KONSUM: die Werkstatt-Ablesung (Tempo) liest die Schwung-Quelle"
            werkstattLiestQuelle: "KONSUM: die Werkstatt-Ablesung (Tempo)",
            aBeideUngeklemmt: "(A) beide Fixtures liegen UNGEKLEMMT im [min,max]-Band (der Test ist ehrlich)",
            aVerhaeltnisWurzelI: `(A) Schwung-Dauer-Verhältnis ∝ √(I2/I1) ± 5 % (${out.dauerRatio.toFixed(3)} vs ${out.dauerSoll.toFixed(3)})`,
            aFaustDauer: "(A) die leere Faust hat die endliche Hand-Dauer (kein Instant-Prügeln)",
            bTrifftNeben: "(B) der Sweep trifft ein Ziel NEBEN dem Crosshair (in der Klingen-Kapsel)",
            bDedupEinmal: `(B) dedupliziert je Schwung: GENAU EIN Treffer (${out.sweep.hits})`,
            bZweiterSchwungTrifft: "(B) ein zweiter Schwung trifft wieder (Dedup gilt JE Schwung)",
            bNieRuecken: "(B) NIE ein Ziel hinter dem Rücken (die Wand im Sweep-Chokepoint)",
            bHitStopGesetzt: `(B) der Treffer öffnet das Hit-Stop-Fenster im Gesetz-Band (${out.freeze !== null ? (out.freeze * 1000).toFixed(0) + " ms" : "kein Treffer"})`,
            bKameraImpuls: "(B) Kamera-Impuls über den BESTEHENDEN Landungs-Dip (_landImpactPending)",
            s2LinseFeuert: "SELBST-TEST (S2): Kapsel-Mathe ≡ ∞ gestubbt → kein Treffer (die Messung ist nicht blind)",
            // "(C) HIT-STOP: die Schwung-Phase friert (t bleibt 0)"
            cSchwungFriert: "(C) HIT-STOP: die Schwung-Phase friert",
            // "(C) HIT-STOP: der GANZE Leib steht (Gang-Phase und Hand Δ=0, das Ziel gleitet)"
            cGangFriert: "(C) HIT-STOP: der GANZE Leib steht",
            // `(C) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (${out.simSteps} Schritte, Fixed-Akku-Probe)`
            cSimLaeuftWeiter: `(C) die FIXE SIM läuft ${out.simSteps}`,
            // "(C) Gegenprobe: vor dem Treffer laufen Gang und Hand"
            cGegenprobeLaeuft: "(C) Gegenprobe: vor dem Treffer laufen Gang und Hand",
            // "(C) der Schwung-Tick liest den Hit-Stop aus der EINEN Quelle (_hitStopFactor)"
            anzeigeLiestHitStop: "(C) der Schwung-Tick liest den Hit-Stop aus der EINEN",
            s1LinseFeuert:
                "SELBST-TEST (S1): _hitStopFactor ≡ 1 gestubbt → die Uhr läuft (die Freeze-Messung misst den Faktor)",
            // "(D) der EINE Fall (_kreaturFaellt) kippt nach dem Gefälle (_fieldGradient am Spion), keiner despawnt selbst"
            todKipptStattDespawn: "(D) der EINE Fall (_kreaturFaellt)",
            // "(E) OBERKÖRPER-Layer: im Windup heben Arm + Rumpf (additiv über der Lokomotion)"
            eArmHebt: "(E) OBERKÖRPER-Layer: im Windup heben Arm + Rumpf",
            // "(E) die BEINE bleiben byte-gleich (der Layer ist NUR Oberkörper)"
            eBeineByteGleich: "(E) die BEINE bleiben byte-gleich",
            // "(E) nach dem Schwung ist die Pose rückstandsfrei byte-alt"
            eRueckstandsfrei: "(E) nach dem Schwung ist die Pose rückstandsfrei byte-alt",
        }))
            check(c[k], satz);
    }
    console.log("\n  ── WELLE L ──\n");
    if (!welle) {
        console.log("FEHLER: die Welle-L-Proben liefen nicht");
        ok = false;
    } else {
        const z = welle.z,
            c = welle.c;
        if (welle.fehler.length) console.log("  Fehler: " + welle.fehler.join(" · "));
        zeig(
            "Q8",
            z,
            "zoneKopfBein zielKopf zielBein zonen hangabHirsch hangabFuchs kleinFlach stopGross stopKeule keGruppe keRezepte keSpanne aufDerKappe nahkampfRezepte gegenwehr gegenwehrHirsch faktoren panzer gueteUneins gueteGeraete gueteProben pfeilVoll pfeilViertel pfeilHinterWand pfeilFrei schadensPfade schadensZwillinge s7 kernOhneZone kernMitZone kalt s8 sweepFormel typeofSelbst grobFremd grob s9"
        );
        zeig("Q9", z, "haltenKrater rmbSchwert rmbSpaten rmbHand werkstattGriffe ohneWerkstattGriffe");
        zeig("Q10", z, "blick90 blick57 vorDirCos dorfCos pfeilFadenkreuz");
        const G = z.gesetz || {},
            T = G.vor || {};
        const zeile = (id) =>
            ["vor", "masse", "tempo", "eisen", "schneide"].map((k) => `${k} ${f1(G[k][id].wirk)}/${f1(G[k][id].p)}`);
        console.log(
            `  (Q11) Leib ${f1(G.leib)} · Wirkung/Stoß: langschwert ${zeile("langschwert")} · dolch ${zeile("dolch")}`
        );
        const [S, V, SB] = [z.satz || {}, z.stoff, z.selbst || {}];
        const basis = (M) =>
            M && Object.assign({ axt: S.faellaxt, spaten: S.spaten, sichel: S.sichel, bogen: S.langbogen }, M);
        const F = basis(z.form);
        const kurz = (g) =>
            Object.entries(g)
                .filter(([, x]) => x && x.verb !== undefined)
                .map(([k, x]) => `${k} ${x.verb} ${f2(x)}/${x.zehrt.toFixed(4)}`)
                .join(" ");
        for (const [id, g] of Object.entries(S)) console.log(`        ${id} → ${g.ziel || "–"}: ${kurz(g)}`);
        console.log(`        form ${JSON.stringify(z.form)}`);
        console.log(`        stoff ${JSON.stringify(V)}`);
        const gv = gesetzVerdict(G);
        check(
            gv.length === 0,
            "Q11 halten.K1: eine Kern-Zahl ändert den Treffer monoton — Masse (MAT.*.rho) den Stoß, Tempo beides, Schneide (MAT.eisen.sigY) den Schnitt; die Kraft der Führung ist der Leib (kein Spender-Fold)" +
                (gv.length ? " — " + gv.slice(0, 8).join(" · ") + ` (${gv.length})` : "")
        );
        const s12 = gesetzVerdict(Object.assign({}, G, G.s12 || {}));
        check(
            s12.some((x) => x.startsWith("tempo")),
            "SELBST-TEST (S12): ein fester Schaden neben dem Gesetz (_trefferWirkung ≡ 1) — die Tempo-Mutation bleibt stumm, die Linse nennt sie"
        );
        const fv = formVerdict(F),
            nach = (pre) => fv.filter((x) => x === "keine Messung" || x.startsWith(pre));
        const werkV = ["faellaxt", "spitzhacke", "vorschlaghammer", "spaten", "schaufel"]
            .flatMap((id) => satzVerdict({ hand: S.hand, [id]: S[id] || {} }))
            .concat(nach("form"));
        check(
            werkV.length === 0,
            "Q11 halten.K3: das Werk wirkt nach seiner Form — Fällaxt fällt, Hacke und Hammer brechen Fels, Spaten und Schaufel graben, die umgeformte Gestalt (Grab-Blatt, Axt-Kopf) folgt der neuen Form" +
                (werkV.length ? " — " + werkV.join(" · ") : "")
        );
        const skv = nach("sichel");
        check(
            !skv.length,
            `Q11 halten.K3 Sichel erntet über die echte Eingabe nach der Form — ${F && f2(F.sichel.wiese)} Büschel der Mess-Wiese ins kraut, sie wachsen nach; die gerade Sichel mäht nicht, der hohle Säbel mäht${skv.length ? " — ROT " + skv : ""}`
        );
        const ids = Object.keys(S).filter((id) => id !== "hand");
        const gut = ids.filter((id) => !satzVerdict({ hand: S.hand, [id]: S[id] }).length);
        const s2 = satzVerdict(S).concat(nach("bogen"), stoffVerdict(V));
        const zj = (t) => (V && V[t] ? V[t].stoff + " " + V[t].zehrt.toFixed(4) : "–");
        check(
            ids.length >= 22 && !s2.length,
            `Q11 halten.K3 Staffel 2: jede Gestalt der Schmiede (${gut.length} von ${ids.length}) wirkt nach ihrer Form an ihrem Ziel und zehrt, wo sie wirkt, nach der Härte ihrer Stoff-Zeile (${zj("Urvolk")} > ${zj("Nihon")} > ${zj("Frank")} je Hieb, die halbe Härte ${V && V.weich.toFixed(4)})` +
                (s2.length ? " — " + s2.slice(0, 10).join(" · ") + ` (${s2.length})` : "")
        );
        const s13 = formVerdict(basis(SB.form));
        check(
            s13.some((x) => x.includes("gräbt")) && s13.some((x) => x.includes("fällt")),
            "SELBST-TEST (S13): eine Art-Tafel neben dem Gesetz (graben nach task.art, ein Abbau-Profil für alle) — die Form-Mutation bleibt stumm, die Linse nennt sie"
        );
        check(
            s13.includes("sichel: gerade mäht") && s13.includes("sichel: hohl mäht nicht"),
            "SELBST-TEST (S15): mäht, wer Sichel heißt — die Form-Mutation bleibt stumm"
        );
        check(
            stoffVerdict(SB.stoff).some((x) => x.startsWith("stoff")),
            "SELBST-TEST (S16): ein Verschleiß ohne Stoff (der Spender) — Bronze zehrt wie Stahl, die Linse nennt sie"
        );
        const paarV = paarVerdict(z.paar);
        check(
            !paarV.length,
            "Q11 halten.K2 Staffel 2: Klang und Funken aus dem Stoff-Paar am Bus " +
                JSON.stringify(z.paar) +
                (paarV.length ? " — ROT " + paarV.join(" · ") : "")
        );
        check(
            paarVerdict(SB.paar).some((x) => x.includes("≈")),
            "SELBST-TEST (S19): alle Paare gleich — die Linse nennt sie"
        );
        const s6 = satzVerdict({ hand: S.hand, langbogen: SB.bogen });
        check(
            s6.some((x) => x.includes("zehrt nicht")) && s6.some((x) => x.includes("führt bei wear")),
            "SELBST-TEST (S6): der Pfeil ohne Verschleiß (Faktor 1, kein Zehren) — der Satz nennt ihn"
        );
        const K4 = z.bogenK4 || {};
        const k4 = bogenK4Verdict(K4);
        const [Wd, Td, Sd, Zd] = [K4.wand || {}, K4.tier || {}, K4.speicher || {}, K4.zug || {}];
        console.log(
            "  (Q12) Bahn " +
                json({
                    bahn: (K4.bahn || []).map((l) => [l.wi, l.hz, bahnAbweichung(l, K4.g)]),
                    Wd,
                    boden: K4.boden,
                    Td,
                    Sd,
                    Zd,
                    f: K4.fehler,
                })
        );
        check(
            !k4.s1.length,
            "Q12 halten.K4 Staffel 1: die Bahn ist die Parabel (9 Läufe ≤ 5 % des Falls, Tempo √(2E/m), Treffer-Ort) " +
                k4.s1.join(" · ")
        );
        check(
            !k4.s2.length,
            "Q12 halten.K4 Staffel 2: der Pfeil steckt und bleibt (Wand, Boden, Hirsch, Speicher; Zug-Kraft aus BOGENMAT) " +
                k4.s2.join(" · ")
        );
        const s14 = K4.bahn && K4.bahn.length >= 9 ? bogenK4Verdict(bogenK4Taeter(K4)) : { s1: [], s2: [] };
        check(
            s14.s1.some((x) => x.startsWith("bahn")) && s14.s2.includes("steckt-wand"),
            "SELBST-TEST (S14): die alte Bahn und der alte Abschied — die Linse nennt beide"
        );
        k5Bericht(k5, check);
        // EINHEITSBREI an der Tafel: zwei Spender tragen 17 Gestalten — Dauer, Reichweite und die Wirkung bei EINEM Klingen-
        // Tempo (20 m/s) unterscheiden sich, wo nur der Kern sie trägt; ohne Kern (Selbsttest) fällt die Tafel auf die Spender
        const je = (f) =>
            new Set(
                Object.values(T)
                    .filter((x) => x.wirk)
                    .map(f)
            ).size;
        const [L, Gr] = [T.langschwert || {}, T.grossschwert || {}];
        // "EINHEITSBREI: Spender-Teile, ≥3 distinkte Dauern/Reichweiten/Wirkungen — die Quelle ist der Kern (kampfMasze)"
        check(
            je((x) => x.dauer.toFixed(3)) >= 3 &&
                je((x) => x.reach.toFixed(2)) >= 3 &&
                je((x) => x.w20.toFixed(2)) >= 3,
            "EINHEITSBREI: Spender-Teile, ≥3 distinkte Dauern/Reichweiten/Wirkungen"
        );
        // "EINHEITSBREI: die Ordnung stimmt (Dolch flink+kurz < Grossschwert · Messer < Langschwert < Keule bei gleichem
        // Tempo)"
        check(
            T.dolch &&
                T.dolch.dauer < Gr.dauer &&
                T.dolch.reach < Gr.reach &&
                T.messer.w20 < L.w20 &&
                L.w20 < T.keule.w20,
            "EINHEITSBREI: die Ordnung stimmt"
        );
        const ratio = [Gr.dauer / L.dauer, Math.sqrt(Gr.I / L.I)];
        // `EINHEITSBREI: Dauer-Verhältnis == √(I-Verhältnis) ± 5 % gegen kampfMasze (ist ${f1(ratio[0])} soll
        // ${f1(ratio[1])})`
        check(
            Math.abs(ratio[0] / ratio[1] - 1) < 0.05,
            `EINHEITSBREI: Dauer-Verhältnis == √(I-Verhältnis) ${f1(ratio[0])} · ${f1(ratio[1])}`
        );
        const ohne = G.ohneKern || [];
        // "EINHEITSBREI-SELBSTTEST: kampfMasze gestubbt → die Tafel kollabiert auf die zwei Spender (die Wand sieht den
        // Riss)"
        check(
            ohne.length >= 15 && [0, 1].every((i) => new Set(ohne.map((x) => x[i].toFixed(3))).size <= 2),
            "EINHEITSBREI-SELBSTTEST: kampfMasze gestubbt → die Tafel kollabiert auf die"
        );
        // "Q8 K-D2: jeder Treffer trägt eine Zone (die Phantom-Zone war null in 222/222)"
        check(c.zoneJederTreffer, "Q8 K-D2: jeder Treffer trägt eine Zone");
        // "Q8 K-D2: die Zone wirkt — Kopf ÷ Bein ≥ 1,5 (dieselbe Klinge, derselbe Hirsch)"
        check(c.zoneWirkt, "Q8 K-D2: die Zone wirkt");
        // "Q8 K-D3: hangab (Hirsch 1,6 m/−0,62 m, Fuchs 1,3 m/−0,6 m) je ≥ 8/10 — die Klinge folgt dem Fadenkreuz"
        check(c.hangab, "Q8 K-D3: hangab (Hirsch 1,6");
        // "Q8 K-D3: klein auf gleicher Höhe (Hirsch L 0,64) ≥ 8/10 — getroffen wird die Gestalt"
        check(c.kleinFlach, "Q8 K-D3: klein auf gleicher Höhe");
        // "Q8 K-D4: der Hit-Stop ist energie-skaliert — jedes Nahkampf-Rezept stoppt nach SEINER Treffer-Energie (höchstens
        // 3 teilen sie auf ±3 %; Befund: 13 von 17 mit 19,8 J)"
        check(c.hitStopEnergie, "Q8 K-D4: der Hit-Stop ist energie-skaliert");
        // "Q8 K-D5: keine Schadens-Kappe — höchstens 2 Nahkampf-Rezepte auf dem Maximal-Faktor"
        check(c.keineKappe, "Q8 K-D5: keine Schadens-Kappe");
        // "Q8 K-D7: EINE Güte je Gerät — Schaden, Werkstoff-Kraft und Equip-Fold lesen das Lehren-Urteil des Kerns"
        check(c.eineGuete, "Q8 K-D7: EINE Güte je Gerät");
        // "Q8 K-D8: der Pfeil trägt seine Energie in den Schaden (25 %-Auszug ≤ 0,5 × voll)"
        check(c.pfeilImpuls, "Q8 K-D8: der Pfeil trägt seine Energie in den");
        // "Q8 K-D8: eine Wand hält den Pfeil (0 Treffer dahinter, frei 1)"
        check(c.pfeilWand, "Q8 K-D8: eine Wand hält den Pfeil");
        const rz = z.rueck || {};
        zeig("T13", rz);
        const rv = rueckVerdict(z.rueck);
        // "Q8 K-D9: der Rückstoß folgt dem EINEN Impuls-Gesetz — kein Satz im Treffer-Takt, der Fuchs fliegt (≥ 0,3 m), die
        // Masse teilt (Fuchs ≥ 3 × Bär), die Waffe wirkt (Keule ≥ 1,15 × Dolch)" + (rv.length ? " — " + rv.join(" · ") :
        // "")
        check(rv.length === 0, "Q8 K-D9: der Rückstoß folgt " + (rv.length ? " — " + rv.join(" · ") : ""));
        // der Selbst-Test des Urteils: der Befund (2,16 m in EINEM Takt für jede Waffe und jedes Ziel) fällt rot beim Namen
        const alt = { sprung: 2.16, weg: 2.16 };
        const rvAlt = rueckVerdict({ fuchsDolch: alt, fuchsKeule: alt, baerDolch: alt, baerKeule: alt });
        const rvGut = rueckVerdict({
            fuchsDolch: { sprung: 0, weg: 0.5 },
            fuchsKeule: { sprung: 0, weg: 0.9 },
            baerDolch: { sprung: 0, weg: 0.01 },
            baerKeule: { sprung: 0, weg: 0.02 },
        });
        // "Selbst-Test K-D9: der Befund (2,16 m überall, in EINEM Takt) nennt Satz, Masse und Waffe; ein gesunder Stoß
        // bleibt grün"
        check(
            rvGut.length === 0 &&
                ["rueckstoss-satz", "rueckstoss-masse", "rueckstoss-waffe"].every((t) =>
                    rvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test K-D9: der Befund (2,16"
        );
        const bz2 = z.biss || {};
        const bw = (t) =>
            ["fuchs", "wolf", "baer"]
                .map((j) =>
                    t && t[j] ? `${j} ${t[j].biss ? "biss" : "kein Biss"} Δv ${t[j].dv.toFixed(3)}` : j + " –"
                )
                .join(" · ");
        console.log(`  (T15) Biss: Kitz ${bw(bz2.beute)} · Spieler ${bw(bz2.spieler)} m/s`);
        const bv = bissVerdict(z.biss);
        // "0710-4 T15: der Biss stößt durch das EINE Impuls-Gesetz — Kitz und Spieler bekommen ihren Impuls, der schwerere
        // Jäger stößt stärker (Fuchs < Wolf < Bär)" + (bv.length ? " — " + bv.join(" · ") : "")
        check(bv.length === 0, "0710-4 T15: der Biss stößt " + (bv.length ? " — " + bv.join(" · ") : ""));
        const nullBiss = { biss: true, dv: 0 };
        const bvAlt = bissVerdict({
            beute: { fuchs: nullBiss, wolf: nullBiss, baer: nullBiss },
            spieler: { fuchs: nullBiss, wolf: nullBiss, baer: nullBiss },
        });
        const bvVerkehrt = bissVerdict({
            beute: { fuchs: { biss: true, dv: 2 }, wolf: { biss: true, dv: 1 }, baer: { biss: true, dv: 0.5 } },
            spieler: { fuchs: { biss: true, dv: 0.2 }, wolf: { biss: true, dv: 0.4 }, baer: { biss: true, dv: 0.9 } },
        });
        const bvGut = bissVerdict({
            beute: { fuchs: { biss: true, dv: 0.5 }, wolf: { biss: true, dv: 1.4 }, baer: { biss: true, dv: 2.6 } },
            spieler: { fuchs: { biss: true, dv: 0.2 }, wolf: { biss: true, dv: 0.6 }, baer: { biss: true, dv: 1.5 } },
        });
        // "Selbst-Test T15: der Befund (Biss ohne Rückstoß) nennt Beute und Spieler, ein Jäger-Gewicht ohne Wirkung nennt
        // die Masse; ein Biss nach Masse bleibt grün"
        check(
            bvGut.length === 0 &&
                ["biss-beute", "biss-spieler"].every((t) => bvAlt.some((x) => x.startsWith(t))) &&
                bvVerkehrt.some((x) => x.startsWith("biss-masse")),
            "Selbst-Test T15: der Befund (Biss"
        );
        // ═══ WELLE LF KAMPF — die Posten der Leben-Schau 07.10. ═══
        const ez = z.energie || {};
        zeig("T16", ez);
        const ev = energieVerdict(z.energie);
        // "LF Posten 1: die Treffer-Energie folgt dem Schwung — derselbe Hieb trifft immer, springt in der Befund-Lage
        // nicht (≤ ×1,25), jede Streuung nennt ihren Ort und bleibt über dem Boden des Kerns, das Großschwert schlägt nie
        // schwächer als der Dolch" + (ev.length ? " — " + ev.join(" · ") : "")
        check(ev.length === 0, "LF Posten 1: die Treffer-Energie folgt " + (ev.length ? " — " + ev.join(" · ") : ""));
        const evAlt = energieVerdict({
            gross: [15, 18, 16, 91, 25, 17, 15, 18, 16, 91, 25, 17, 60, 40, 30],
            dolch: [24, 32, 28],
            befund: [17, 16, 91],
            detail: [{ name: "grossschwert", d: 1.6, ort: null, eff: 0.3 }],
            nah: { ke: 1.6, ort: null },
        });
        const evGut = energieVerdict({
            gross: [60, 62, 58, 70, 66, 61, 59, 64, 63, 72, 55, 57, 60, 62, 65],
            dolch: [20, 24],
            befund: [61, 62, 60],
            detail: [{ name: "grossschwert", d: 1.3, ort: "griffnah", eff: 0.5 }],
            nah: { ke: 30, ort: "griffnah", eff: 0.4 },
        });
        // "Selbst-Test T16: der Befund (15–91 J je Kontakt, unter dem Dolch) nennt Kontakt und Waffe; ein Schwung-Gesetz
        // bleibt grün"
        check(
            evGut.length === 0 &&
                ["energie-kontakt", "energie-waffe", "energie-nah", "energie-boden", "energie-ort"].every((t) =>
                    evAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T16: der Befund (15–91"
        );
        const rzz = z.reich || {};
        zeig("T17", rzz);
        const rv2 = reichVerdict(z.reich);
        // "LF Posten 3: EINE Reichweite aus der Waffe — das Verb-Tor liest die Klinge, jenseits nennt der Spieler-Kanal die
        // Reichweite, in ihr trifft die Serie" + (rv2.length ? " — " + rv2.join(" · ") : "")
        check(rv2.length === 0, "LF Posten 3: EINE Reichweite aus " + (rv2.length ? " — " + rv2.join(" · ") : ""));
        const rv2Alt = reichVerdict({
            klinge: 2.11,
            toreZahl: 1,
            weit: { treffer: 0, gesagt: [] },
            nah: { treffer: 3, gesagt: [] },
        });
        const rv2Gut = reichVerdict({
            klinge: 2.11,
            toreZahl: 0,
            weit: { treffer: 0, gesagt: ["Zu weit: die Klinge reicht 2,5 m"] },
            nah: { treffer: 9, gesagt: [] },
        });
        // "Selbst-Test T17: der Befund (Tor 6 m, 9 stumme Hiebe) nennt Zwilling, Stille und Nähe; EINE Reichweite bleibt
        // grün"
        check(
            rv2Gut.length === 0 &&
                ["reich-zwilling", "reich-stumm", "reich-nah"].every((t) => rv2Alt.some((x) => x.startsWith(t))),
            "Selbst-Test T17: der Befund (Tor"
        );
        const kz = z.klick || {};
        const kf = Array.isArray(kz.faelle) ? kz.faelle : [];
        const kZahl = (blick) =>
            `${kf.filter((f) => f.blick === blick && f.dmg > 0).length}/${kf.filter((f) => f.blick === blick).length}`;
        zeig("T26", { ...kz, faelle: undefined, rumpf: kZahl("rumpf"), horizont: kZahl("horizont") });
        const klv = klickVerdict(z.klick);
        // "K13 T26: der Hieb trifft im Horizont-Blick — 96 von 96 Klicks auf den Wolf machen Schaden, der Wolf hinter dem
        // Rücken und der Begleiter bleiben heil, jenseits der Klinge ein Luftschlag mit Hinweis, Abbau, Pflücken und Graben
        // neben dem Wildtier bleiben beim Fadenkreuz" + (klv.length ? " — " + klv.join(" · ") : "")
        check(klv.length === 0, "K13 T26: der Hieb trifft " + (klv.length ? " — " + klv.join(" · ") : ""));
        const selbstK = Array.isArray(kz.selbst) ? kz.selbst : [];
        const klvAlt = klickVerdict({
            faelle: [
                ...Array.from({ length: 48 }, (_, i) => ({
                    mode: "first",
                    wn: "langschwert",
                    d: String(i),
                    blick: "rumpf",
                    dmg: 9,
                })),
                ...Array.from({ length: 48 }, (_, i) => ({
                    mode: "first",
                    wn: "langschwert",
                    d: String(i),
                    blick: "horizont",
                    dmg: 0,
                    taeter: "kein Ziel unter dem Fadenkreuz",
                })),
            ],
            ruecken: { dmg: 12, ziel: true, dot: -1 },
            begleiter: { dmg: 9, ziel: true },
            zuWeit: { klinge: 1.02, schwung: false, gesagt: false, dmg: 0, verb: "pfluecken" },
            ernte: [
                { soll: "abbau", ziel: true, verb: "hieb", dmg: 19 },
                { soll: "pfluecken", ziel: true, verb: "hieb", dmg: 19 },
                { soll: "graben", ziel: true, verb: "hieb", dmg: 14 },
                { soll: "hieb", fern: true, ziel: true, verb: "abbau", dmg: 0 },
            ],
        });
        const klvGut = klickVerdict({
            faelle: Array.from({ length: 96 }, (_, i) => ({
                mode: "third",
                wn: "keule",
                d: "0,9",
                blick: i % 2 ? "rumpf" : "horizont",
                dmg: 7,
            })),
            ruecken: { dmg: 0, ziel: false, dot: -1 },
            begleiter: { dmg: 0, ziel: false },
            zuWeit: { klinge: 1.02, schwung: true, gesagt: true, dmg: 0, verb: "hieb" },
            ernte: [
                ...["abbau", "pfluecken", "graben"].map((soll) => ({ soll, ziel: true, verb: soll, dmg: 0 })),
                { soll: "hieb", fern: true, ziel: true, verb: "hieb", dmg: 9 },
            ],
        });
        // `Selbst-Test T26: der Befund (Horizont 0 von 48, der Wolf im Rücken getroffen, der Dolch pflückt, der Kegel
        // erntet den Wolf) nennt Horizont, Rücken, Ferne und je Ernte-Verb den Kegel; ohne die Kegel-Wahl (S10) trifft kein
        // Horizont-Klick, und der Schwung ohne Ziel heißt „kein Ziel unter dem Fadenkreuz" (${JSON.stringify(selbstK)}); 96
        // Treffer bleiben grün`
        check(
            klvGut.length === 0 &&
                ["klick-horizont", "klick-ruecken", "klick-begleiter", "klick-zuweit"].every((t) =>
                    klvAlt.some((x) => x.startsWith(t))
                ) &&
                klvAlt.filter((x) => x.startsWith("klick-ernte:")).length === 3 &&
                klvAlt.some((x) => x.startsWith("klick-fern:")) &&
                selbstK.length === 6 &&
                selbstK.every((t) => !!t) &&
                selbstK.includes("kein Ziel unter dem Fadenkreuz"),
            `Selbst-Test T26: der Befund (Horizont ${JSON.stringify(selbstK)}`
        );
        console.log(
            `  (T18) Pose im Treffer-Takt: ${JSON.stringify(z.pose || null)
                .replace(/"/g, "")
                .slice(0, 400)}`
        );
        console.log(`       Ich-Regel: ${JSON.stringify(z.egoRegel || null)}`);
        const pv = poseVerdict(z.pose, z.egoRegel);
        // "LF Posten 2: Pose, Treffer-Volumen und Ich-Sicht lesen DENSELBEN Schwung — im Treffer-Takt liegt die sichtbare
        // Klinge auf dem Volumen und steht im Bild der Ich-Kamera" + (pv.length ? " — " + pv.join(" · ") : "")
        check(pv.length === 0, "LF Posten 2: Pose, Treffer-Volumen und " + (pv.length ? " — " + pv.join(" · ") : ""));
        const pvAlt = poseVerdict(
            [
                { traf: true, spitzeAb: 1.4, mitteAb: 0.9, imBild: false, rad: 0.35, spalt: 0.48 },
                { traf: true, spitzeAb: 1.2, mitteAb: 0.8, imBild: false, rad: 0.35, spalt: 0.4 },
            ],
            { rueckstand: true, hautImErsten: 3 }
        );
        const pvGut = poseVerdict([{ traf: true, spitzeAb: 0.1, mitteAb: 0.2, imBild: true, rad: 0.35, spalt: 0.03 }], {
            rueckstand: false,
            hautImErsten: 0,
        });
        // "Selbst-Test T18: der Befund (Klinge über dem Kopf, Ich-Sicht leer) nennt Volumen und Ich-Sicht; derselbe Schwung
        // bleibt grün"
        check(
            pvGut.length === 0 &&
                ["pose-volumen", "pose-ich:", "pose-ichregel", "pose-spalt"].every((t) =>
                    pvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T18: der Befund (Klinge"
        );
        zeig("T19", z.ausdauer);
        const av = ausdauerVerdict(z.ausdauer);
        // "LF Posten 8: die Ausdauer je Hieb folgt der Masse des Geräts — die Reihe steigt streng mit kg, nie flach" +
        // (av.length ? " — " + av.join(" · ") : "")
        check(av.length === 0, "LF Posten 8: die Ausdauer je " + (av.length ? " — " + av.join(" · ") : ""));
        const avAlt = ausdauerVerdict([
            { geraet: "dolch", kg: 0.46, zehrt: 5 },
            { geraet: "grossschwert", kg: 2.2, zehrt: 5 },
            { geraet: "keule", kg: 2.18, zehrt: 5 },
        ]);
        const avGut = ausdauerVerdict([
            { geraet: "faust", kg: 0, zehrt: 5 },
            { geraet: "dolch", kg: 0.46, zehrt: 5.5 },
            { geraet: "grossschwert", kg: 2.2, zehrt: 7.2 },
        ]);
        // "Selbst-Test T19: der Befund (5 je Hieb für jede Waffe) nennt die flache Reihe; eine Reihe nach Masse bleibt
        // grün"
        check(
            avGut.length === 0 && avAlt.some((x) => x.startsWith("ausdauer-flach")),
            "Selbst-Test T19: der Befund (5"
        );
        const zL = z.leben || null;
        zeig("T27", zL);
        const lv = lebenswerteVerdict(zL);
        const wegeL = lebenswerteWege(zL);
        check(
            lv.length === 0,
            `K27 T27: Lebenswerte sind Zustand — Wege zur Voll-Heilung außerhalb von Wandlung und Rückkehr ${wegeL.length}` +
                (wegeL.length ? ` (${wegeL.join(", ")})` : "") +
                ", kein Rufer hebt hp, Ausdauer oder Mana über Regen·dt" +
                (lv.length ? " — " + lv.join(" · ") : "")
        );
        const lvSelbst = lebenswerteVerdict(z.lebenSelbst);
        const erstSelbst = lvSelbst.find((x) => x.startsWith("lebenswerte-heilt")) || "";
        check(
            erstSelbst.startsWith("lebenswerte-heilt: equipHeld an") && lebenswerteWege(z.lebenSelbst).length === 4,
            `SELBST-TEST (S11): die alte Zeile (hp, Ausdauer, Mana = Maximum bei jeder Neuberechnung) als Hülle → der erste Rufer heißt equipHeld, 4 Wege (${lebenswerteWege(z.lebenSelbst).join(", ")}; ${erstSelbst || "kein Täter"})`
        );
        zeig("T20", z.kampfWerte);
        const kv = kampfWerteVerdict(z.kampfWerte);
        // "LF Posten 6: Biss, Haut und Leben eines Tiers steigen mit der EINEN Masse seines Leibs — Gattung × Größe, nie
        // gattungs- oder größenblind" + (kv.length ? " — " + kv.join(" · ") : "")
        check(kv.length === 0, "LF Posten 6: Biss, Haut und " + (kv.length ? " — " + kv.join(" · ") : ""));
        const kvAlt = kampfWerteVerdict(
            [15, 64, 94, 335, 4, 60].map((kg, i) => ({
                seele: "t" + i,
                L: 1,
                kg,
                damage: 19.75,
                defense: 11.9,
                hpMax: 100 + i * 10,
            }))
        );
        const kvGut = kampfWerteVerdict(
            [15, 64, 94, 335, 4, 60].map((kg, i) => ({
                seele: "t" + i,
                L: 1,
                kg,
                damage: kg,
                defense: Math.cbrt(kg),
                hpMax: kg * 2,
            }))
        );
        // "Selbst-Test T20: der Befund (damage 19,75 · defense 11,9 überall) nennt Biss und Haut; Werte nach Masse bleiben
        // grün"
        check(
            kvGut.length === 0 &&
                ["kampfwerte-damage", "kampfwerte-defense"].every((t) => kvAlt.some((x) => x.startsWith(t))),
            "Selbst-Test T20: der Befund (damage"
        );
        const shellPf = {
            eigenerPfeil: !stammLib.fehlt(null, /function buildPfeil\s*\(/, { datei: "worlds/schmiede/schmiede.js" }),
        };
        console.log(
            `  (T21) Pfeil: ${JSON.stringify(z.pfeilGestalt || null)} · Shell eigener Pfeil ${shellPf.eigenerPfeil}`
        );
        const pv2 = pfeilVerdict(z.pfeilGestalt, shellPf);
        // "LF Posten 4: der Pfeil ist die Gestalt des Schmiede-Kerns — Schaft, Spitze, Nocke, Federn, beleuchtet, mit
        // Schatten; kein Wirts- und kein Shell-Zwilling" + (pv2.length ? " — " + pv2.join(" · ") : "")
        check(pv2.length === 0, "LF Posten 4: der Pfeil ist " + (pv2.length ? " — " + pv2.join(" · ") : ""));
        const pv2Alt = pfeilVerdict(
            { teile: 1, farben: 1, unbeleuchtet: 1, wirft: 0, laenge: 0.55, wirtZylinder: true, leerStill: true },
            { eigenerPfeil: true }
        );
        const pv2Gut = pfeilVerdict(
            { teile: 6, farben: 4, unbeleuchtet: 0, wirft: 6, laenge: 0.76, wirtZylinder: false, leerStill: false },
            { eigenerPfeil: false }
        );
        // "Selbst-Test T21: der Befund (ein MeshBasic-Zylinder, 0,55 m, Zwillinge, ein leerer Guss still) nennt Gestalt,
        // Licht, Schatten, Länge, Zwilling und die Stille; der Kern-Pfeil, der laut bricht, bleibt grün"
        check(
            pv2Gut.length === 0 &&
                [
                    "pfeil-gestalt",
                    "pfeil-licht",
                    "pfeil-schatten",
                    "pfeil-laenge",
                    "pfeil-zwilling",
                    "pfeil-still",
                ].every((t) => pv2Alt.some((x) => x.startsWith(t))),
            "Selbst-Test T21: der Befund (ein"
        );
        console.log(`  (T22) Tod am Hang (Gefälle längs der Leibes-Achse): ${JSON.stringify(z.tod || null)}`);
        const tv = todVerdict(z.tod);
        // "LF Posten 7: ein Tier stirbt wie ein Tier — es fällt auf die Flanke (auch wenn das Gefälle längs seiner Achse
        // fällt) und bleibt liegen, auch beim Mitspieler und am Alter; der Leichnam ist kein Wesen (nicht in der Liste der
        // Wesen, kein Ziel, kein Platz, keine Zahl, kein Ältester, kein Nächster, kein Leser fragt selbst)" + (tv.length ?
        // " — " + tv.join(" · ") : "")
        check(tv.length === 0, "LF Posten 7: ein Tier stirbt " + (tv.length ? " — " + tv.join(" · ") : ""));
        // die Befunde (auf dem Hinterteil, fort, Ziel/Platz/Zahl; der Leichnam unter den Wesen) fallen rot beim Namen
        const tvAlt = todVerdict({
            vornY: 0.99,
            obenY: 0.12,
            liegt10s: false,
            zielLeichnam: true,
            platzFrei: false,
            nexusZaehlt: true,
            unterWesen: true,
            naechster: true,
            stromAnteil: 1,
            kopieOben: 1,
            fragen: ["_tierRufTakt", "_serializeCreature", "_kreaturIstBeute", "_pickCreatureAtCrosshair"],
            alterLiegt: false,
        });
        // der halbe Schnitt: der Leichnam verlässt die Wesen, aber der Strom vergisst ihn — die Kopie verschwindet
        const tvStumm = todVerdict({
            vornY: 0.05,
            obenY: 0.1,
            liegt10s: true,
            zielLeichnam: false,
            platzFrei: true,
            nexusZaehlt: false,
            unterWesen: false,
            naechster: false,
            stromAnteil: 0,
            kopieOben: null,
            fragen: [],
            alterLiegt: true,
        });
        const tvGut = todVerdict({
            vornY: 0.05,
            obenY: 0.1,
            liegt10s: true,
            zielLeichnam: false,
            platzFrei: true,
            nexusZaehlt: false,
            unterWesen: false,
            naechster: false,
            stromAnteil: 1,
            kopieOben: 0.12,
            fragen: [],
            alterLiegt: true,
        });
        // "Selbst-Test T22: die Befunde (auf dem Hinterteil, nach 22 Takten fort; der Leichnam als Ziel, Platz, Zahl,
        // Nächster, die stehende Kopie, die Leser mit eigener Frage, der Tod am Alter ohne Leib; der Strom
        // ohne ihn) nennen jeden Täter; ein Tier auf der Flanke, das kein Wesen mehr ist und beim Mitspieler liegt, bleibt
        // grün"
        check(
            tvGut.length === 0 &&
                [
                    "tod-flanke",
                    "tod-leichnam",
                    "tod-ziel",
                    "tod-platz",
                    "tod-zaehlt",
                    "tod-wesen",
                    "tod-naechster",
                    "tod-kopie",
                    "tod-frage",
                    "tod-alter",
                ].every((t) => tvAlt.some((x) => x.startsWith(t))) &&
                ["tod-strom", "tod-kopie"].every((t) => tvStumm.some((x) => x.startsWith(t))),
            "Selbst-Test T22: die Befunde (auf"
        );
        const bgz = z.bissGeste || {};
        zeig("T23", bgz);
        const bgv = bissGesteVerdict(z.bissGeste);
        // "LF Posten 5: der Biss trifft, wo die Geste schnappt — auf jedem Biss-Weg im Ansprung und mit dem Kopf am Leib" +
        // (bgv.length ? " — " + bgv.join(" · ") : "")
        check(bgv.length === 0, "LF Posten 5: der Biss trifft " + (bgv.length ? " — " + bgv.join(" · ") : ""));
        const befundBiss = [
            { geste: "keine", spalt: 1.02, xz: 2.39 },
            { geste: "pounce", spalt: 0.61, xz: 1.36 },
        ];
        const bgvAlt = bissGesteVerdict({ jagd: befundBiss, beute: befundBiss, gegenwehr: [] });
        const gutBiss = [{ geste: "pounce", spalt: -0.01, xz: 1.1 }];
        const bgvGut = bissGesteVerdict({ jagd: gutBiss, beute: gutBiss, gegenwehr: gutBiss });
        // "Selbst-Test T23: der Befund (Biss ohne Geste, aus 2,39 m, ein Weg ohne Biss) nennt Geste, Ferne und Weg; ein
        // Biss im Ansprung am Leib bleibt grün"
        check(
            bgvGut.length === 0 &&
                ["biss-geste", "biss-ferne", "biss-weg"].every((t) => bgvAlt.some((x) => x.startsWith(t))),
            "Selbst-Test T23: der Befund (Biss"
        );
        console.log(`  (T25) Wunde über den Reload: ${JSON.stringify(z.wunde || null)}`);
        const wv = wundeVerdict(z.wunde);
        // "LF Posten 6 (Nachbesserung 2): die Wunde reist als Anteil des Lebens — voll bleibt voll, auch aus einem Stand
        // vor dem Massen-Gesetz" + (wv.length ? " — " + wv.join(" · ") : "")
        check(
            wv.length === 0,
            "LF Posten 6 (Nachbesserung 2): die Wunde reist " + (wv.length ? " — " + wv.join(" · ") : "")
        );
        const wvAlt = wundeVerdict([
            { seele: "wesen@1", altVoll: 0.738, altHalb: 0.369, neu30: 0.3 },
            { seele: "baer@1.75", altVoll: 0.407, altHalb: 0.203, neu30: 0.3 },
        ]);
        const wvGut = wundeVerdict([
            { seele: "wesen@1", altVoll: 1, altHalb: 0.5, neu30: 0.3 },
            { seele: "baer@1.75", altVoll: 1, altHalb: 0.5, neu30: 0.3 },
        ]);
        // "Selbst-Test T25: der Befund (ein voller Hirsch bei 124/168 nach dem Reload) nennt die alte Wunde; voll bleibt
        // voll bleibt grün"
        check(wvGut.length === 0 && wvAlt.some((x) => x.startsWith("wunde-alt")), "Selbst-Test T25: der Befund (ein");
        console.log(`  (T24) Biss-Reichweite: ${JSON.stringify(z.bissReich || null)}`);
        console.log(`  (T24) das stehende Reh: ${JSON.stringify(z.bissReh || null)}`);
        const brv = bissReichVerdict(z.bissReich, z.bissReh);
        // "LF Posten 5 (Nachbesserung 2 + 3): der Biss kostet, was in Reichweite steht (0 Gestalten außer Reichweite je
        // Takt, springt nie ins Leere (0 Ansprünge auf den Sims) und trifft ein stehendes Reh (≥ 5 von 6, das Ziel des
        // Kopfs aus der gezeigten Pose)" + (brv.length ? " — " + brv.join(" · ") : "")
        check(brv.length === 0, "LF Posten 5 (Nachbesserung 2 " + (brv.length ? " — " + brv.join(" · ") : ""));
        const brvAlt = bissReichVerdict(
            {
                gestaltenJeTakt: 15,
                msJeTakt: 2.346,
                simsAnspruenge: 6,
                simsSek: 10,
                simsUeber: 1.0,
                simsWaagrecht: 0.9,
                simsReich: 2.6,
            },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 0,
                takte: 61,
                klemme: 14,
                kopfSumme: { takte: 10, rest: 0.31, drift: 0.69, reihe: [0.31, 0.62, 0.93, 1], klemme: [-0.6, 1] },
                boden: {},
                je: { 1.3: { anspruenge: 3, bisse: 0 } },
            }
        );
        const brvGut = bissReichVerdict(
            {
                gestaltenJeTakt: 0,
                msJeTakt: 0.02,
                simsAnspruenge: 0,
                simsSek: 10,
                simsUeber: 1.0,
                simsWaagrecht: 0.9,
                simsReich: 2.6,
            },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 6,
                takte: 70,
                klemme: 8,
                kopfSumme: { takte: 10, rest: 0.31, drift: 0, reihe: [0.31, 0.31, 0.31, 0.31], klemme: [-0.6, 1] },
                boden: {},
                je: {},
            }
        );
        // der Befund Gegenprüfung 3: der erste Rest an der Klemme 1,0 — die alte Summe zeigte dort 1 → 1 → 1 (drift 0)
        const brvKlemme = bissReichVerdict(
            { gestaltenJeTakt: 0, msJeTakt: 0, simsAnspruenge: 0 },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 6,
                kopfSumme: { takte: 10, rest: 1, drift: 0, reihe: [1, 1, 1, 1], klemme: [-0.6, 1] },
                boden: {},
                je: {},
            }
        );
        // "Selbst-Test T24: die Befunde (15 Gestalten je Takt, 6 Ansprünge unter dem Sims, 0 Bisse am Reh, ein Kopf-Ziel,
        // das ohne Pose-Fortschritt 0,69 rad wandert) nennen Kosten, Sims, Reh und Kopf; ein erster Rest an der Klemme
        // (1,0) heißt vakuös; ein Biss nur in Reichweite, der trifft, bleibt grün"
        check(
            brvGut.length === 0 &&
                brvKlemme.some((x) => x.startsWith("biss-kopf-probe:") && /Klemme/.test(x)) &&
                ["biss-kosten:", "biss-sims:", "biss-reh:", "biss-kopf:"].every((t) =>
                    brvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T24: die Befunde (15"
        );
        // "Q8 K-D6: JEDER Waffen-Schadens-Pfad (damageCreature im Namen des Spielers) rechnet im EINEN _kampfRohSchaden"
        check(c.einRohSchaden, "Q8 K-D6: JEDER Waffen-Schadens-Pfad (damageCreature");
        // "Q8 K-D3: fehlt tetrapoda trefferZone, bricht der Treffer-Test laut und benannt (nie still null je Tier)"
        check(c.kernPflichtZone, "Q8 K-D3: fehlt tetrapoda trefferZone");
        // "Q8 T11 Lehre 14: der erste Hieb auf eine kalte Gattung trifft, zerlegt nichts, bricht nicht (die Geburt
        // bestellt)"
        check(c.kaltTrifft, "Q8 T11 Lehre 14: der erste Hieb auf eine");
        // "Q10: der Klingen-Sweep liest _blickVorn (keine Inline-Kopie der Vorwärts-Formel)"
        check(c.sweepBlickVorn, "Q10: der Klingen-Sweep liest _blickVorn");
        // "Welle L: keine typeof-Probe auf eine eigene Methode in den Kampf- und Maus-Methoden der Welle"
        check(c.keinTypeofSelbst, "Welle L: keine typeof-Probe auf eine eigene Methode in");
        // "Gesetz #0: Klinge und Pfeil fragen das EINE Grob-Tor (_trefferErreichbar), es liest den kreatur-Leib — kein
        // drittes Körpermaß"
        check(c.grobLiestLeib, "Gesetz #0: Klinge und Pfeil fragen das EINE Grob-Tor");
        // "Gesetz #0: das Grob-Tor deckt die Gestalt — kein Ende einer Treffer-Glied-Kapsel liegt außerhalb (vier Gattungen
        // × Größen-Grenzen, 90 Takte)"
        check(c.grobDeckt, "Gesetz #0: das Grob-Tor deckt die Gestalt");
        // "Q8 K-D15: die Hand ist kein Panzer (defense und hpMax unberührt; ein Werk der Schmiede faltet auch nicht in den
        // Angriff)"
        check(c.keinPanzer, "Q8 K-D15: die Hand ist kein Panzer");
        // "Q8 K-D16/K-D12: Gegenwehr nach dem Temperament der Gattung — der wehrhafte Bär > 0, der scheue Hirsch 0 bei 20
        // Treffern aus 1,6 m (der Stoß kommt NACH dem Biss-Test)"
        check(c.gegenwehr, "Q8 K-D16/K-D12: Gegenwehr nach dem Temperament der Gattung");
        // "Q9 K-D1: 1st-Person — das Halten nach dem Stoß gräbt nicht (0 Krater)"
        check(c.haltenOhneKrater, "Q9 K-D1: 1st-Person — das");
        // "Q9 K-D17: RMB mit dem Schwert schüttet nie auf (Spaten und leere Hand schon)"
        check(c.rmbSchwert, "Q9 K-D17: RMB mit dem Schwert schüttet nie auf");
        // "Q9 V-D2: bei offener Werkstatt ist der Canvas taub (0 von 4 Griffen; ohne Schublade greift er)"
        check(c.werkstattTaub, "Q9 V-D2: bei offener Werkstatt ist der Canvas taub");
        // "Q10 K-D14: die Ego-Neigung ist der Blick (−90° → −90°, −57,3° → −57,3°)"
        check(c.egoBlick, "Q10 K-D14: die Ego-Neigung ist der Blick");
        // "Q10 V-D4: jedes „vor dir“ liegt vor dem Blick (at_player_forward, „baue dorf hier“: cos > 0,9)"
        check(c.vorDir, "Q10 V-D4: jedes „vor dir“ liegt vor dem Blick");
        // "Q10 K-D14: der Pfeil fliegt aufs Fadenkreuz (< 1° bei 45° Steigung)"
        check(c.pfeilFadenkreuz, "Q10 K-D14: der Pfeil fliegt aufs Fadenkreuz");
        check(
            c.s3 === true,
            "SELBST-TEST (S3): _blickVorn mit der alten −(sin, cos)-Richtung → „vor dir“ kippt hinter dich"
        );
        check(
            c.s4 === true,
            "SELBST-TEST (S4): _geraetGraebt ≡ wahr → das Schwert schüttet auf (die Linse sieht den Rückfall)"
        );
        check(
            c.s5 === true,
            "SELBST-TEST (S5): _kreaturGliedTreffer ≡ null → kein Treffer (die Serie misst die Gestalt)"
        );
        check(
            c.s7 === true,
            "SELBST-TEST (S7): ein Wurf-Täter setzt Kraft × Wirkung × Zone selbst zusammen → die Klassen-Linse nennt ihn"
        );
        check(c.s8 === true, "SELBST-TEST (S8): ohne Bestellung verfehlt der Hieb, und der Bruch nennt die Gattung");
        check(
            c.s9 === true,
            "SELBST-TEST (S9): der Leib ohne Glieder (Reichweite = halb + radius) → Kopf und Rute liegen außerhalb, die Deckungs-Probe nennt sie"
        );
    }
    console.log(`\n  ${ok ? "✅ GRÜN" : "❌ ROT"} — gate:kampf-gefuehl\n`);
    process.exit(ok ? 0 : 1);
})();
