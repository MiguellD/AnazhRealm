#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kampf-gefuehl.cjs — DIE GERECHNETE SCHWUNGPHYSIK ERREICHT DEN KAMPF
// (npm run gate:kampf-gefuehl; Orakel Tier-1 #5).
//
// Die Linse hält fünf Kampf-Gesetze am ECHTEN Chokepoint (_beginPlayerSwing /
// _tickKampfSchwung / _kampfSweepTick / damageCreature / updateCreatures),
// headless/Null-Renderer:
//
//  (A) DAUER ∝ √I: die Schwung-Dauer zweier Waffen (echte _swingDynamics-
//      Trägheiten zweier Blueprints, beide UNGEKLEMMT im [min,max]-Band)
//      verhält sich wie √(I2/I1) ± 5 % — die EINE Quelle; die attackSpeed-
//      Parallel-Wahrheit ist für den Spieler-Schwung gefallen (Source-Proben:
//      Cooldown/HUD/Werkstatt lesen _swingDauer*, _playerAttackCreature liest
//      KEIN attackSpeed und schädigt NICHT selbst — der Klick löst nur aus).
//  (B) KLINGEN-SWEEP: ein Ziel NEBEN dem Crosshair (0.9 m seitlich der Blick-
//      Linie, innerhalb der Klingen-Kapsel) wird in der Strike-Phase getroffen,
//      GENAU EINMAL je Schwung (Dedup); ein Ziel HINTER dem Rücken NIE.
//      Treffer-Juice: Hit-Stop-Fenster gesetzt + Kamera-Impuls über den
//      BESTEHENDEN Landungs-Dip (_landImpactPending) + Klang-One-Shot über die
//      EXISTIERENDE Maschine (Stimme-aus → stumm, kein zweiter AudioContext).
//  (C) HIT-STOP ≠ SIM: während des Hit-Stops steht die ANZEIGE-Uhr (walkPhase
//      + Schwung-Phase frieren), aber die FIXE SIM läuft weiter — die Fixed-
//      Akku-Probe (_loopFixedStep steppt, _fixedSimTime wächst) beweist es;
//      Source-Probe: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE.
//  (D) TOD-KIPPEN: ein Kill despawnt NICHT sofort — der Körper kippt (die
//      Rotation WÄCHST über die Ticks, Richtung aus _fieldGradient), das
//      sterbende Wesen ist inert (damageCreature-Wand), der Despawn kommt
//      erst NACH der Frist (kippDauer + Nachklang).
//  (E) OBERKÖRPER-LAYER: der Schwung ist ein WEITERER additiver Posen-Layer
//      über der Lokomotion (rechter Arm/Rumpf bewegen sich, die BEINE bleiben
//      byte-gleich); nach dem Schwung ist die Pose rückstandsfrei byte-alt.
//  (S) SELBST-TESTS (die Linse feuert): (S1) _hitStopFactor ≡ 1 gestubbt →
//      die Anzeige-Uhr läuft trotz Hit-Stop — die Freeze-Messung misst den
//      echten Faktor. (S2) _segSegDistSq ≡ ∞ gestubbt → der Sweep trifft
//      nichts — die Treffer-Messung fließt durch die echte Kapsel-Mathe.
//      Beide Stubs restauriert (Gate-Hook-Lehre).
//
// WELLE L (06.10.) — die Leben-Prüfung „Kampf" (artifacts/profiband/leben/befund-kampf.md) als Linse am ECHTEN
// Chokepoint, gespielt wie ein Mensch: das Fadenkreuz wird über Gier und Neigung durch die ECHTE Kamera
// (_loopCamera, 1st und 3rd) auf das Ziel geführt, geklickt wird über den EINEN Dispatcher (tryMouseBreak /
// _tickHarvest / tryMousePlace / Canvas-mousedown), geschlagen über _beginPlayerSwing + _tickKampfSchwung.
// Gezählt wird nur mitlaufend (damageCreature, _kampfHitJuice, _beginPlayerSwing, dslRun-Voxel-Ops); keine Probe
// ersetzt die Stelle, an der ein Defekt saß (Q0). Die Voxel-Ops werden gezählt und nicht ausgeführt (der Krater ist
// das Urteil des Dispatchers, nicht des Schnitzers).
//  (Q8 TREFFER) Zone wirkt (Kopf ÷ Hinterlauf, jeder Treffer trägt eine Zone) · hangab (Hirsch 1,6 m/−0,62 m, Fuchs
//      1,3 m/−0,6 m) und klein flach (Hirsch L 0,64) je ≥ 8/10 · Hit-Stop-Energie Keule ≠ Grossschwert (≥ 10 %) · keine Schadens-Kappe (höchstens
//      2 von 17 Rezepten auf dem Maximal-Faktor) · Gegenwehr nach dem Temperament der Gattung (Bär > 0, Hirsch 0 bei 20 Treffern in 1,6 m, pfad) · die Hand ist
//      kein Panzer (defense/hpMax gleich) · Kampf verschleißt, ein verbrauchtes Gerät schlägt nicht · der Pfeil:
//      Schaden ∝ Energie (25 %-Auszug ≤ 0,5 × voll) und eine Wand hält ihn (0 Treffer dahinter) · die fünf
//      Phantom-Leser sind aus dem Stamm verschwunden · EINE Güte je Gerät (Schaden, Werkstoff-Kraft, Fold) · der Bogen
//      verschleißt wie die Klinge (wear 0,5 → 0,65 des Schadens, jeder Schuss zehrt, verbraucht löst er nicht) und
//      JEDER Waffen-Schadens-Pfad (damageCreature im Namen des Spielers) rechnet im EINEN _kampfRohSchaden · fehlt
//      tetrapoda trefferZone, bricht der Treffer-Test laut · der erste Treffer auf eine Gattung zerlegt keine Haut
//      (vorgebacken im Takt der EINEN Bake-Uhr) · der Sweep liest _blickVorn · keine typeof-Probe auf eine eigene Methode.
//  (Q9 MAUS) 3rd-Person 10 Klicks auf ein Tier in 2 m → 10 Schwünge, 0 Krater · 1st-Person Halten nach dem Stoß →
//      0 Krater · RMB mit Schwert → 0 Aufschüttungen (Spaten und leere Hand schütten weiter) · offene Werkstatt →
//      4 Canvas-Klicks, 0 Griffe in die Welt · FERTIGEN eines Bauwerks → Bau-Modus, die Hand bleibt leer.
//  (Q10 BLICK) Ego-Neigung −90° → Blick −90° · jedes „vor dir" (at_player_forward, „baue dorf hier") liegt vor dem
//      Blick (cos > 0,9) · der Pfeil fliegt aufs Fadenkreuz (< 1° bei 45° Steigung).
//  SELBST-TESTS (nur wo die Naht existiert): (S3) _blickVorn mit der alten −(sin, cos)-Richtung → „vor dir" kippt
//      hinter dich · (S4) _geraetGraebt ≡ true → das Schwert schüttet auf · (S5) _kreaturGliedTreffer ≡ null → kein
//      Treffer · (S6) der Pfeil ohne Verschleiß (_wearStatFactor ≡ 1, _kampfVerschleiss leer) → die Bogen-Probe ist
//      rot · (S7) ein Wurf-Täter setzt seinen Schaden selbst zusammen (die alte Pfeil-Zeile) → die Klassen-Linse nennt
//      ihn · (S8) ohne das Vorbacken → der erste Hieb zerlegt die Haut · (S9) der Leib ohne Glieder (Reichweite halb +
//      radius) → das Grob-Tor weist Kopf und Rute ab, die Deckungs-Probe T12 nennt sie. Jede Naht restauriert.
//  (KEIN DRITTER LEIB, Integration Welle L) G3: Klinge und Pfeil fragen das EINE Grob-Tor _trefferErreichbar, es liest
//      den kreatur-Leib (_kreaturLeib.reichweite) · T12: das Tor deckt die Gestalt (jedes Ende jeder Treffer-Glied-Kapsel,
//      vier Gattungen in jeder Größen-Grenze, 90 Spiel-Takte).
//
//   node scripts/diag-kampf-gefuehl.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Port über KAMPF_GEFUEHL_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4451.
const PORT = Number(process.env.KAMPF_GEFUEHL_PORT || 4451);

// (T13) DAS URTEIL DES RÜCKSTOSSES (0710-2, K-D9 — pure Funktion, Probe UND Selbst-Test): kein Positions-Satz im Treffer-
// Takt, der Fuchs fliegt, die Masse des Leibs teilt den Stoß (Fuchs ≥ 3 × Bär mit derselben Keule), der Impuls der Waffe
// wirkt (Keule ≥ 1,15 × Dolch am selben Fuchs). Vorher: 2,16 m für jede Waffe und jedes Ziel, in EINEM Takt.
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
// (T14) DIE MASSE-TAFEL (0710-4 — pure Funktion, Probe UND Selbst-Test): jeder Leib wiegt, was seine Gestalt wiegt — das
// Volumen der geschlossenen Haut (die Linse rechnet es selbst, Divergenz-Satz) mal der Dichte SEINES Kerns (tetrapoda
// MASSSTAB.dichteKgM3 · koerper LEIB.dichteKgM3), der Wagen sein Kern-Volumen (carPhys) mal FAHR.masseDichte. Der Wirt hält
// keine Dichte (kein STOSS.dichteLeib / dichteWagen, kein Kapsel-Leser _kreaturMasse), und die Reihe steht: Fuchs < Wolf <
// Hirsch < Bär < Wagen. Vorher: Kapsel aus der Hüft-Höhe × 1000 im Wirt — der Hirsch wog 436 kg, der Bär 255.
const MASSE = { toleranz: 0.02, reihe: ["fuchs", "wolf", "hirsch", "baer", "gt"] };
function masseVerdict(M) {
    if (!M || !M.leiber) return ["masse keine Probe"];
    const v = [];
    for (const k of M.kernFehlt || []) v.push(`masse-kern: ${k} fehlt — die Dichte lebt im Wirt, nicht im Gesetzbuch`);
    for (const z of M.zwillinge || []) v.push(`masse-zwilling: ${z} im Wirt (eine Studio-Größe neben dem Kern)`);
    for (const name of [...MASSE.reihe, "mensch"]) {
        const l = M.leiber[name];
        if (!l || !(l.wirtKg > 0)) {
            v.push(`masse-${name}: keine Masse im Wirt`);
            continue;
        }
        if (!(l.gestaltKg > 0)) continue; // ohne Kern-Dichte nennt masse-kern den Täter
        if (!(Math.abs(l.wirtKg - l.gestaltKg) <= MASSE.toleranz * l.gestaltKg))
            v.push(
                `masse-${name}: der Wirt rechnet ${l.wirtKg.toFixed(1)} kg, die Gestalt wiegt ${l.gestaltKg.toFixed(1)} kg`
            );
    }
    for (let i = 1; i < MASSE.reihe.length; i++) {
        const a = M.leiber[MASSE.reihe[i - 1]];
        const b = M.leiber[MASSE.reihe[i]];
        if (a && b && !(a.wirtKg < b.wirtKg))
            v.push(
                `masse-reihe: ${MASSE.reihe[i - 1]} ${a.wirtKg.toFixed(1)} kg ≥ ${MASSE.reihe[i]} ${b.wirtKg.toFixed(1)} kg`
            );
    }
    return v;
}
// (T15) DER BISS ALS STOSS (0710-4 — pure Funktion, Probe UND Selbst-Test): Fuchs, Wolf und Bär (Größe 1) beißen je ein
// Kitz (die Jagd auf Beute — das Kitz, 20 kg, ist die Beute jedes der drei: höchstens jagd.beuteMasse × die Masse des
// Jägers, Welle LF; den Hirsch, 94 kg, schlägt der Fuchs, 15 kg, nicht) und den Spieler (die Jagd auf den Spieler): das Ziel
// bekommt seinen Impuls (Δv > 0), und der schwerere Jäger stößt stärker (Fuchs < Wolf < Bär). Vorher: Schaden ohne
// Rückstoß auf allen Biss-Wegen.
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
// (T16) DIE TREFFER-ENERGIE FOLGT DEM SCHWUNG (Welle LF kampf, Posten 1 — pure Funktion, Probe UND Selbst-Test): derselbe
// Großschwert-Hieb auf denselben Hirsch (drei Abstände × fünf Lagen, Fadenkreuz auf der Leibes-Mitte) trifft jedes Mal; in der
// Befund-Lage (abgewandt, 1,5 · 1,6 · 1,7 m) springt seine Energie nicht (höchstens ×1,25); jede Streuung ist
// BENANNT — ein Treffer unter voller Wirkung nennt seinen Ort auf der Klinge (griffnah, hand, spitze) — und BEGRENZT (keine
// Energie unter 0,2 × der stärksten desselben Geräts, der Boden des Kerns); das schwere Schwert schlägt im
// Mittel nie schwächer als der Dolch. Befund 07.10.: abgewandt 1,6 m 15–18 J (Griff-Drittel), 1,7 m 91 J (×6), schwächer als
// der Dolch (24–32 J).
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
// (T17) EINE REICHWEITE AUS DER WAFFE (Welle LF kampf, Posten 3 — pure Funktion, Probe UND Selbst-Test): das Verb-Tor des
// Klicks liest dieselbe Reichweite wie die Klinge (kein reachMaxM im Dispatcher); ein Tier unter dem Fadenkreuz jenseits der
// Klinge bekommt keinen stummen Hieb — der Spieler-Kanal nennt die Reichweite; in Reichweite trifft die Serie (≥ 8 von 9).
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
// (T18) POSE = TREFFER-VOLUMEN = ICH-SICHT (Welle LF kampf, Posten 2 — pure Funktion, Probe UND Selbst-Test): im Treffer-Takt
// liegen die sichtbare Spitze des Geräts und seine Mitte auf der Geraden der Strecke, die der Sweep der Gestalt reicht (höchstens
// ihr Klingen-Radius daneben), und Spitze und Mitte stehen im Bild der Ich-Kamera — bei jedem der drei Ziele.
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
// (T19) DIE AUSDAUER JE HIEB AUS DER WAFFEN-MASSE (Welle LF kampf, Posten 8 — pure Funktion, Probe UND Selbst-Test): ein Hieb
// zehrt mit der Masse des Geräts — die Reihe steigt streng mit kg (Faust < Dolch < … < Vorschlaghammer), zwei Geräte
// verschiedener Masse zehren nie gleich. Befund 07.10.: 5 je Hieb für Dolch, Großschwert und Keule.
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
// (T20) DIE KAMPF-WERTE AUS GATTUNG × GRÖSSE (Welle LF kampf, Posten 6 — pure Funktion, Probe UND Selbst-Test): Biss, Haut
// und Leben eines Tiers steigen streng mit der Masse seines Leibs — über alle Gattungen und Größen hinweg (die Masse IST
// Gattung × Größe). Befund 07.10.: damage 19,75 und defense 11,9 für jede Gattung und Größe.
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
// (T21) DIE GESTALT DES PFEILS (Welle LF kampf, Posten 4 — pure Funktion, Probe UND Selbst-Test): was fliegt, ist der Pfeil
// des Schmiede-Kerns — Schaft, Spitze, Nocke, drei Federn (mindestens 6 Teile, mindestens 3 Farben), beleuchtet, wirft Schatten,
// 0,70–0,85 m lang; der Wirt baut keinen eigenen Zylinder, die Prüfstand-Shell keinen eigenen Pfeil.
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
    if (P.leerStill !== false) v.push("pfeil-still: ein leerer Guss lässt den Pfeil ohne Meldung unsichtbar fliegen");
    return v;
}
// (T22) EIN TIER STIRBT WIE EIN TIER (Welle LF kampf, Posten 7 — pure Funktion, Probe UND Selbst-Test): nach dem Kippen liegt
// der Leib auf der Flanke — die Leibes-Achse waagrecht (|vorn·y| ≤ 0,3), die Hochachse gekippt (oben·y ≤ 0,35) — auch wenn
// das Gefälle längs der Achse fällt; und er liegt 10 s danach noch da. Befund: Kopf senkrecht (vorn·y ≈ 1), nach 22 Takten fort.
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
    if (T.aeltester !== false)
        v.push(
            "tod-aeltester: der Lebenszyklus wählt den Leichnam als Ältesten (_findOldestCreature) — er stirbt ein zweites Mal und ist sofort fort"
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
    if (T.fragen && T.fragen.length)
        v.push(
            `tod-frage: ${T.fragen.join(", ")} fragen selbst nach dem Sterben — der Leichnam stünde unter den Wesen`
        );
    return v;
}
// (T23) DER BISS TRIFFT, WO DIE GESTE SCHNAPPT (Welle LF kampf, Posten 5 — pure Funktion, Probe UND Selbst-Test): auf jedem
// der drei Biss-Wege (Jagd auf den Spieler, Beute, Gegenwehr) beißt das Tier im Ansprung (die Geste pounce läuft im
// Biss-Takt) und mit dem Maul am Leib (Spalt Kopf ↔ Leib ≤ 0,05 m). Befund K-D13: 9 von 12 Bissen ohne Geste, aus 1,36–2,39 m XZ.
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
// (T25) DIE WUNDE REIST ALS ANTEIL DES LEBENS (Welle LF kampf Nachbesserung 2 — pure Funktion, Probe UND Selbst-Test): voll bleibt
// voll, halb bleibt halb (ein Stand von vor dem Massen-Gesetz), 30 % bleiben 30 % (ein neuer Stand) — je ± 0,01.
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
// (T24) DER BISS KOSTET, WAS IN REICHWEITE STEHT, UND SPRINGT NIE INS LEERE (Welle LF kampf Nachbesserung 2 — pure Funktion, Probe
// UND Selbst-Test): die Wahl der Beute rechnet keine Gestalt eines Tiers jenseits des Grob-Tors (Lehre 25: billige Filter
// zuerst), und kein Jäger springt einen Leib an, der über seinem Sprung liegt (der Spieler auf einem Sims) — die Gegenprobe:
// waagrecht stand er in der Weite seines Ansprungs. Befund Gegenprüfung 1: 15 Gestalten je Takt bei 15 Beutetieren außer
// Reichweite (1,29–2,35 ms je Jäger), unter dem Sims ein Ansprung alle 1,6 s. Dazu das stehende Reh (Größe 0,8, aus 1,6 und
// 1,3 m): mindestens 5 von 6 Ansprüngen beißen — der Biss trifft auch ein Ziel, das größer ist als das Kitz, und dort, wo die
// Hetze hält.
// Der Kopf zielt aus der gezeigten Pose (98042fd4, Nachbesserung 3 die Wand): stehen Pose und Ziel still, steht das Ziel der
// Kopf-Neigung still — zehn Takte _kreaturBissKopf ohne Pose-Fortschritt, das Ziel wandert höchstens 1e-6 rad (die Probe trägt
// nur, wenn der erste Rest ≥ 0,05 rad ist). Vorher summierte sich der Rest je Takt auf das Ziel des Vor-Takts und lief an die
// Klemme (BISS.kopfNeigung). Die Klemmen-Takte im Spiel-Takt (Bericht, kein Urteil — sie streuen je Lauf: vorher 12–18 von 60,
// danach 2–8 von 42–84) stehen in der Zeile daneben.
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
    if (!K) v.push("biss-kopf keine Probe (Wolf vor dem Reh, Pose still)");
    else if (!(Math.abs(K.rest) >= REH_SOLL.kopfRest))
        v.push(
            `biss-kopf-probe: der erste Rest ist ${K.rest} rad — die Pose weist schon aufs Ziel, die Probe trägt nicht`
        );
    else if (!(K.drift <= REH_SOLL.kopfDrift))
        v.push(
            `biss-kopf: ohne Pose-Fortschritt wandert das Ziel der Kopf-Neigung in ${K.takte} Takten ${K.drift} rad (${K.reihe.join(" → ")}) — der Rest summiert sich auf das Ziel des Vor-Takts`
        );
    if (R.kaltZerlegt === null) v.push("biss-kalt keine Probe (Wolf und Fuchs, 35 m, kalt)");
    else if (R.kaltZerlegt > 0)
        v.push(
            `biss-kalt: die Wahl der Beute zerlegt ${R.kaltZerlegt} Gestalten noch kalter Gattungen synchron im Kreatur-Takt (${R.kaltVerts} Vertices, Jäger und Beute 35 m außer Reichweite) — an der Bake-Uhr vorbei`
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
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// ── WELLE L — die Proben der Leben-Prüfung „Kampf" (Seiten-Funktion; läuft auf JEDEM Stand: fehlt eine Naht, misst
// die Probe das Verhalten trotzdem — so ist die Linse auf dem Vorher-Stand rot und benennt den Defekt) ──
async function WELLE_L() {
    const r = window.anazhRealm,
        s = r.state,
        A = r.constructor,
        p = s.player,
        pm = s.playerMesh;
    const w = { z: {}, c: {}, fehler: [] };
    const fn = (n) => typeof r[n] === "function";
    const V3 = () => new THREE.Vector3();
    const grad = (rad) => (rad * 180) / Math.PI;
    const saved = {
        yaw: s.yaw,
        pitch: s.pitch,
        cam: s.cameraMode,
        held: p.equipped ? p.equipped.held : null,
        swing: p._swing,
        hitStop: p._hitStopUntil,
        mode: r.getGameMode(),
        maxC: s.maxCreatures,
        lock: s.isPointerLocked,
        hp: p.hp,
        grace: p.respawnGraceUntil,
        breakHeld: p.breakHeld,
        hotbar: Array.isArray(s.hotbar) ? s.hotbar.slice() : s.hotbar,
    };
    // ── die mitlaufenden Zähler (rufen IMMER durch; nur die Voxel-Ops werden gezählt statt geschnitzt) ──
    const orig = {
        damageCreature: r.damageCreature,
        juice: r._kampfHitJuice,
        swing: r._beginPlayerSwing,
        dsl: r.dslRun,
        damagePlayer: r.damagePlayer,
    };
    let T = 50000; // die Anzeige-Uhr der Probe (Kamera + Schwung), synthetisch
    const treff = [];
    const juice = [];
    const zaehl = { schwung: 0, carve: 0, fill: 0, gegenwehr: 0 };
    r.damageCreature = function (c, amount, opts) {
        const res = orig.damageCreature.call(this, c, amount, opts);
        const st0 = opts && opts.stoss;
        treff.push({
            c,
            amount,
            src: opts && opts.source,
            t: T,
            ok: !!(res && res.ok),
            stoss: st0 ? { p: st0.p, m: st0.m } : null,
        });
        return res;
    };
    r._kampfHitJuice = function (...a) {
        // neu: (creature, now, urteil, keEigen) — die Zone reist im Urteil; alt: (creature, now, keOpt, zoneKind)
        const z = a[2] && typeof a[2] === "object" ? a[2].zone || null : typeof a[3] === "string" ? a[3] : null;
        const u = a[2] && typeof a[2] === "object" ? a[2] : null;
        juice.push({
            zone: z,
            t: T,
            ke: u && Number.isFinite(u.KE) ? u.KE : null,
            ort: u ? u.ort || null : null,
            eff: u && Number.isFinite(u.eff) ? u.eff : null,
            v: u && Number.isFinite(u.v) ? u.v : null,
        });
        return orig.juice.apply(this, a);
    };
    // die Zähl-Hülle reicht die Argumente durch (das Ziel des Hiebs, Welle LF)
    r._beginPlayerSwing = function (...a) {
        const ok = orig.swing.apply(this, a);
        if (ok) zaehl.schwung++;
        return ok;
    };
    r.dslRun = function (prog, opts) {
        const op = Array.isArray(prog) ? prog[0] : null;
        if (op === "voxel_carve") return (zaehl.carve++, { ok: true });
        if (op === "voxel_fill") return (zaehl.fill++, { ok: true });
        return orig.dsl.call(this, prog, opts);
    };
    r.damagePlayer = function (amount, source) {
        if (source === "gegenwehr") zaehl.gegenwehr++;
        return orig.damagePlayer.call(this, amount, source);
    };
    const tiere = [];
    // JE PRÜFUNG IHR EIGENER ABBRUCH (Welle LF kampf Nachbesserung 2): fehlt einer Prüfung ihre Naht (ein älterer Stand), nennt sie
    // sich mit dem Fehler, und die übrigen laufen weiter — vorher brach die Linse am Basis-Stand mit „_kampfSchwungRahmen is
    // not a function“ ganz ab und nannte keinen Täter.
    const teil = async (name, f) => {
        try {
            await f();
        } catch (e) {
            w.fehler.push(name + " ABBRUCH " + ((e && e.stack) || String(e)).split("\n").slice(0, 2).join(" | "));
        }
    };
    try {
        const kamera = () => {
            T += 0.02;
            r._loopCamera(T);
            s.camera.updateMatrixWorld(true);
        };
        const camDir = () => s.camera.getWorldDirection(V3());
        // Das Fadenkreuz auf einen Welt-Punkt führen wie die Hand des Spielers: Gier und Neigung nachführen, bis der
        // Strahl der ECHTEN Kamera ihn trifft (beide Kamera-Arten; die Neigung in der Spiel-Klemme ±90°).
        // Rückgabe: der Rest-Winkel in Grad (ein unerreichbarer Blick bleibt als Fehler stehen).
        const zielen = (pt) => {
            const fehler = () => {
                kamera();
                const c = s.camera.position;
                const d = camDir();
                const v = V3()
                    .set(pt.x - c.x, pt.y - c.y, pt.z - c.z)
                    .normalize();
                const gy = Math.atan2(v.x, v.z) - Math.atan2(d.x, d.z);
                return {
                    gy: Math.atan2(Math.sin(gy), Math.cos(gy)),
                    gp: Math.asin(Math.max(-1, Math.min(1, v.y))) - Math.asin(Math.max(-1, Math.min(1, d.y))),
                    ang: d.angleTo(v),
                };
            };
            const kl = (x) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, x));
            for (let it = 0; it < 40; it++) {
                const e = fehler();
                if (e.ang < 2e-4) break;
                s.yaw += e.gy;
                const p0 = s.pitch;
                const e0 = fehler().gp;
                s.pitch = kl(p0 + (p0 > 1.5 ? -0.01 : 0.01));
                const ab = (fehler().gp - e0) / (s.pitch - p0);
                s.pitch = Math.abs(ab) > 1e-6 ? kl(p0 - Math.max(-0.5, Math.min(0.5, e0 / ab))) : p0;
            }
            return grad(fehler().ang);
        };
        const fussY = () => pm.position.y - 0.5;
        const setze = (seele) => {
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 8);
            const c = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 300, "happy", seele);
            if (c) tiere.push(c);
            return c;
        };
        // vor den Spieler stellen (Breitseite, Füße auf der Fuß-Höhe des Spielers + dy), unverwundbar gezählt
        const stelle = (c, d, seit = 0, dy = 0) => {
            c.position.set(pm.position.x + seit, fussY() + dy, pm.position.z + d);
            c.rotation.set(0, Math.PI / 2, 0);
            c.userData.hp = 1e6;
            c.userData.fearUntil = 0;
            c.userData._steuer = null; // es STEHT: der Steuer-Schritt beginnt neu aus dieser Gier, ohne Lauf und Sprung
            c.userData._hopH = 0;
            c.userData._hopV = 0;
            c.updateMatrixWorld(true);
        };
        const parke = (c) => stelle(c, 60, 60 + tiere.indexOf(c) * 4);
        // der Spieler STEHT auf dem Boden (seine Füße auf der Höhe, auf der die Tiere im Takt stehen): ein Biss braucht den Kopf
        // am Leib, auch in der Höhe (Posten 5). `halte` stellt ihn je Takt zurück, `zurueck` an die Lage davor.
        const amBoden = () => {
            const alt = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
            const P = { x: alt.x, y: r.getTerrainHeightAt(alt.x, alt.z) + A.PLAYER_FOOT_OFFSET, z: alt.z };
            const halte = () => pm.position.set(P.x, P.y, P.z);
            halte();
            return { P, halte, zurueck: () => pm.position.set(alt.x, alt.y, alt.z) };
        };
        const punkt = (c, teil) => {
            c.updateMatrixWorld(true);
            const tb = c.userData._tierBaum;
            const o = teil && tb && tb.teile && tb.teile[teil];
            if (o) return o.getWorldPosition(V3());
            return new THREE.Box3().setFromObject(c).getCenter(V3());
        };
        const schwung = () => {
            p._swing = null;
            p._hitStopUntil = 0;
            const n0 = treff.length,
                j0 = juice.length;
            // der Klick: das Ziel ist der Pick unter dem Fadenkreuz, wie der EINE Dispatcher ihn reicht (tryMouseBreak)
            const ok = r._beginPlayerSwing(r._pickCreatureAtCrosshair());
            if (!ok || !p._swing) return { ok: false, treff: [], juice: [] };
            p._swing.lastT = T;
            for (let k = 0; k < 1200 && p._swing; k++) {
                T += 0.005;
                r._tickKampfSchwung(T);
            }
            return { ok: true, treff: treff.slice(n0), juice: juice.slice(j0) };
        };
        const ausruesten = (name) => {
            const res = r.equipHeld(name);
            if (name && !(res && res.ok)) w.fehler.push("equipHeld " + name + ": " + (res && res.reason));
        };
        const traf = (sw, c) => sw.treff.find((t) => t.c === c && t.src === "player") || null;
        if (fn("setCameraMode")) r.setCameraMode("first");
        if (fn("closeAllDrawers")) r.closeAllDrawers();
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();

        // ═══ Q8 — TREFFER ═══
        const hirsch = setze("wesen");
        const fuchs = setze("fuchs");
        if (!hirsch || !fuchs) throw new Error("Kreatur-Spawn fehlgeschlagen");
        const L0 = hirsch.scale.x;
        parke(fuchs);
        ausruesten("klinge_langschwert");
        // (T1) die Zone wirkt: Kopf und Hinterlauf desselben Hirschs, dieselbe Klinge
        stelle(hirsch, 1.6);
        w.z.zielKopf = zielen(punkt(hirsch, "headGroup"));
        const sK = schwung();
        stelle(hirsch, 1.6);
        w.z.zielBein = zielen(punkt(hirsch, "hlP"));
        const sB = schwung();
        const aK = traf(sK, hirsch),
            aB = traf(sB, hirsch);
        w.z.zoneKopfBein = aK && aB ? aK.amount / aB.amount : null;
        const jz = [...sK.juice, ...sB.juice];
        w.z.zonen = jz.map((j) => j.zone);
        w.c.zoneJederTreffer = jz.length >= 2 && jz.every((j) => !!j.zone);
        w.c.zoneWirkt = w.z.zoneKopfBein !== null && w.z.zoneKopfBein >= 1.5;
        // (T2) hangab und klein auf gleicher Höhe, je 10 Hiebe mit dem Fadenkreuz auf der Leibes-Mitte: der Hirsch
        // des Befunds (1,6 m, Füße 0,62 m unter deinen — „hangab 2/5"), der Fuchs 1,3 m vor dir 0,6 m tiefer, der
        // kleine Hirsch L 0,64 auf gleicher Höhe („1 aus 10"). Jedes Ziel liegt in der Reichweite der Klinge (Schulter
        // 1,7 m über dem Fuß, Langschwert 2,1 m + Klingen-Radius) — was die Klinge erreicht und das Fadenkreuz trägt,
        // trifft sie.
        const seiten = [-0.3, -0.15, 0, 0.15, 0.3, -0.22, 0.22, -0.05, 0.05, 0.1];
        const serie = (c, d, dy) => {
            let n = 0;
            for (const sx of seiten) {
                stelle(c, d, sx, dy);
                zielen(punkt(c, null));
                if (traf(schwung(), c)) n++;
            }
            return n;
        };
        w.z.hangabHirsch = serie(hirsch, 1.6, -0.62);
        parke(hirsch);
        w.z.hangabFuchs = serie(fuchs, 1.3, -0.6);
        parke(fuchs);
        hirsch.scale.setScalar(0.64);
        w.z.kleinFlach = serie(hirsch, 1.6, 0);
        hirsch.scale.setScalar(L0);
        w.c.hangab = w.z.hangabHirsch >= 8 && w.z.hangabFuchs >= 8;
        w.c.kleinFlach = w.z.kleinFlach >= 8;
        // (S5) SELBST-TEST: ohne Glieder-Treffer trifft die Klinge nichts (die Serie misst die Gestalt)
        if (fn("_kreaturGliedTreffer")) {
            const sv = r._kreaturGliedTreffer;
            r._kreaturGliedTreffer = () => null;
            try {
                hirsch.scale.setScalar(0.64);
                w.z.s5 = serie(hirsch, 1.6, 0);
            } finally {
                r._kreaturGliedTreffer = sv;
                hirsch.scale.setScalar(L0);
            }
            w.c.s5 = w.z.s5 === 0;
        }
        // (T3) die Hit-Stop-Energie: Grossschwert und Keule auf denselben Brust-Punkt
        const G = A._arenaGesetz().gefuehl;
        const stopEnergie = (name) => {
            ausruesten(name);
            stelle(hirsch, 1.6);
            zielen(punkt(hirsch, null));
            const t = traf(schwung(), hirsch);
            if (!t) return null;
            const e = (p._hitStopUntil - t.t - G.freezeMinSec) / (G.freezeMaxSec - G.freezeMinSec);
            return e * G.keRefJ;
        };
        w.z.stopGross = stopEnergie("klinge_grossschwert");
        w.z.stopKeule = stopEnergie("klinge_keule");
        // (K-D4 entscheidet unten an der ganzen Rezept-Tafel, T4: jede Waffe stoppt nach IHRER Energie)
        // (T13) DER RÜCKSTOSS JE MASSE UND WAFFE (0710-2, K-D9 — jedes Ziel sprang bei JEDER Waffe 2,16 m, eine Kappe, in
        // EINEM Takt): ein frischer Fuchs und ein frischer Bär, Dolch und Keule, je EIN Hieb auf die Brust. Für die Probe
        // steht der Steuer-Schritt der Tiere (die Naht `_steuerGesetz`, danach restauriert): kein Wunsch, keine Flucht nach dem
        // Treffer bewegt das Ziel — der Weg nach 1,5 s Kreatur-Takt ist allein der Stoß. Gemessen: der Sprung im Treffer-Takt
        // und der Weg danach.
        const fuchsR = setze("fuchs");
        const baer = setze("baer");
        const rueck = (c, name) => {
            if (!c || !s.blueprints[name]) return null;
            ausruesten(name);
            stelle(c, 1.1);
            c.userData._stossV = null;
            c.userData._steuer = { gier: c.rotation.y, v: 0 };
            zielen(punkt(c, null));
            const x0 = c.position.x,
                z0 = c.position.z;
            const t = traf(schwung(), c);
            if (!t) return null;
            const sprung = Math.hypot(c.position.x - x0, c.position.z - z0);
            const sv = c.userData._stossV;
            const dv = sv ? Math.hypot(sv.x, sv.z) : 0;
            const masse =
                typeof r._leibMasse === "function"
                    ? r._leibMasse(c)
                    : typeof r._kreaturMasse === "function"
                      ? r._kreaturMasse(c)
                      : null;
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (st) => {
                st.v = 0;
            };
            A._steuerGesetz = () => steht;
            try {
                // wie der Loop: der feste Sim-Schritt trägt den Stoß (0710-5), dann der Kreatur-Takt
                for (let k = 0; k < 90; k++) {
                    if (typeof r._kreaturStossSchritt === "function") {
                        r._kreaturStossSchritt(1 / 60);
                        r._leibKontakte();
                    }
                    r.updateCreatures(1 / 60);
                }
            } finally {
                A._steuerGesetz = steuerRoh;
            }
            const weg = Math.hypot(c.position.x - x0, c.position.z - z0);
            parke(c);
            return {
                sprung: +sprung.toFixed(3),
                weg: +weg.toFixed(3),
                dv: +dv.toFixed(3),
                masse: masse === null ? null : +masse.toFixed(1),
                p: t.stoss && Number.isFinite(t.stoss.p) ? +t.stoss.p.toFixed(2) : null,
                m: t.stoss && Number.isFinite(t.stoss.m) ? +t.stoss.m.toFixed(2) : null,
            };
        };
        w.z.rueck = {
            fuchsDolch: rueck(fuchsR, "klinge_dolch"),
            fuchsKeule: rueck(fuchsR, "klinge_keule"),
            baerDolch: rueck(baer, "klinge_dolch"),
            baerKeule: rueck(baer, "klinge_keule"),
        };
        // (T14) DIE MASSE-TAFEL (0710-4): je Gattung ein frisches Tier der Größe 1, der Spieler und ein GT — die Masse, mit
        // der der Wirt stößt, gegen das Gewicht der Gestalt (die Linse misst die geschlossene Haut selbst).
        {
            const TC = globalThis.__tetrapodaCore;
            const KC = globalThis.__koerperCore;
            const VC = globalThis.__vehicleCore;
            const dichteTier = TC && TC.MASSSTAB ? TC.MASSSTAB.dichteKgM3 : undefined;
            const dichteMensch = KC && KC.LEIB ? KC.LEIB.dichteKgM3 : undefined;
            const dichteWagen = VC && VC.FAHR ? VC.FAHR.masseDichte : undefined;
            const kernFehlt = [];
            if (!(dichteTier > 0)) kernFehlt.push("tetrapoda MASSSTAB.dichteKgM3");
            if (!(dichteMensch > 0)) kernFehlt.push("koerper LEIB.dichteKgM3");
            if (!(dichteWagen > 0)) kernFehlt.push("vehicle FAHR.masseDichte");
            const zwillinge = [];
            if (A.STOSS && A.STOSS.dichteLeib !== undefined) zwillinge.push("STOSS.dichteLeib " + A.STOSS.dichteLeib);
            if (A.STOSS && A.STOSS.dichteWagen !== undefined)
                zwillinge.push("STOSS.dichteWagen " + A.STOSS.dichteWagen);
            if (typeof r._kreaturMasse === "function") zwillinge.push("_kreaturMasse (die Kapsel aus der Hüft-Höhe)");
            // das Volumen der geschlossenen Haut (Klasse fell/haut, jede Kante gerade oft) im Rahmen von `rahmen`
            const hautVolumen = (teil, rahmen, klassen) => {
                rahmen.updateMatrixWorld(true);
                const inv = new THREE.Matrix4().copy(rahmen.matrixWorld).invert();
                const mm = new THREE.Matrix4();
                let vol = 0;
                teil.traverse((o) => {
                    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                    const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
                    if (!klassen.includes(kl)) return;
                    const pa = o.geometry.attributes.position.array;
                    const ix = o.geometry.index ? o.geometry.index.array : null;
                    const n = ix ? ix.length : pa.length / 3;
                    const kanten = new Map();
                    let vv = 0;
                    for (let t = 0; t + 2 < n; t += 3) {
                        const ia = ix ? ix[t] : t;
                        const ib = ix ? ix[t + 1] : t + 1;
                        const ic = ix ? ix[t + 2] : t + 2;
                        const [ax, ay, az] = [pa[3 * ia], pa[3 * ia + 1], pa[3 * ia + 2]];
                        const [bx, by, bz] = [pa[3 * ib], pa[3 * ib + 1], pa[3 * ib + 2]];
                        const [cx, cy, cz] = [pa[3 * ic], pa[3 * ic + 1], pa[3 * ic + 2]];
                        vv += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
                        for (const [u, q] of [
                            [ia, ib],
                            [ib, ic],
                            [ic, ia],
                        ]) {
                            const key = u < q ? u + ":" + q : q + ":" + u;
                            kanten.set(key, (kanten.get(key) || 0) + 1);
                        }
                    }
                    for (const zz of kanten.values()) if (zz % 2) return; // offen: keine Masse
                    mm.multiplyMatrices(inv, o.matrixWorld);
                    vol += Math.abs(vv) * Math.abs(mm.determinant());
                });
                return vol;
            };
            const wirtLeib = (k) =>
                typeof r._leibMasse === "function" ? r._leibMasse(k) : r._kreaturMasse ? r._kreaturMasse(k) : 0;
            const leiber = {};
            const ort = pm.position;
            for (const [name, seele] of [
                ["fuchs", "fuchs"],
                ["wolf", "wolf"],
                ["hirsch", "wesen"],
                ["baer", "baer"],
            ]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                const c = r.spawnCreatureAt(ort.x + 320, ort.y, ort.z + 320, "calm", seele, { bodySize: 1 });
                if (!c) continue;
                const tb = c.userData._tierBaum;
                const sk = new THREE.Vector3();
                c.getWorldScale(sk);
                const vol = tb && tb.wrap ? hautVolumen(tb.wrap, c, ["fell"]) * sk.x * sk.y * sk.z : 0;
                leiber[name] = { wirtKg: wirtLeib(c), gestaltKg: dichteTier > 0 ? vol * dichteTier : null, vM3: vol };
                r.removeCreature(c);
            }
            {
                // der Spieler: seine Nah-Gestalt (der Fern-Klon daneben trägt dieselbe Haut noch einmal)
                let nah = null;
                pm.traverse((o) => {
                    if (!nah && o.userData && o.userData._menschFern && o.userData._menschFern.nah)
                        nah = o.userData._menschFern.nah;
                });
                const vol = hautVolumen(nah || pm, pm, ["haut"]);
                leiber.mensch = {
                    wirtKg: typeof r._leibMasse === "function" ? r._leibMasse(pm) : 0,
                    gestaltKg: dichteMensch > 0 ? vol * dichteMensch : null,
                    vM3: vol,
                };
            }
            {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: ort.x + 330, y: r.getTerrainHeightAt(ort.x + 330, ort.z + 330) + 0.5, z: ort.z + 330 },
                    { silent: true, precise: true }
                );
                const prof = e ? r._vehicleProfile(e) : null;
                const G = prof ? r._fahrSatz(e, prof) : null;
                if (G)
                    leiber.gt = {
                        wirtKg:
                            typeof r._fahrMasse === "function"
                                ? r._fahrMasse(G)
                                : A.STOSS && A.STOSS.dichteWagen
                                  ? G.m * A.STOSS.dichteWagen
                                  : 0,
                        gestaltKg: dichteWagen > 0 ? G.m * dichteWagen : null,
                        vM3: G.m,
                    };
                if (e) r.removeArchitecture(e);
            }
            w.z.masse = { leiber, kernFehlt, zwillinge };
        }
        // (T15) DER BISS ALS STOSS (0710-4): je Jäger (Größe 1) ein Biss auf ein frisches Kitz 1,2 m neben ihm (die Jagd auf
        // Beute, _tickCreatureScentStrike) und einer auf den Spieler 1,2 m vor ihm (die Jagd, _tickCreatureHuntStrike, im
        // Pfad-Modus, volle Gesundheit, der Spieler auf dem Boden). Der Biss ist der Ansprung (Posten 5): der Kreatur-Takt läuft,
        // bis das Maul schnappt (höchstens 1,5 s). Gemessen: das Δv, das der Stoß des Bisses dem Ziel gibt (im Biss-Takt, am
        // Ziel gelesen — vorher und nachher _stossV bzw. playerVel).
        {
            const bissAlt = { mode: r.getGameMode(), hp: p.hp, gnade: p.respawnGraceUntil };
            r.setGameMode("pfad");
            const B0 = amBoden();
            const ort0 = B0.P;
            const beute = {};
            const spieler = {};
            let stossNach = null;
            const geschw = (ziel) => {
                if (!ziel) return { x: s.playerVel.x(), z: s.playerVel.z() };
                const sv = ziel.userData._stossV;
                return { x: sv ? sv.x : 0, z: sv ? sv.z : 0 };
            };
            const bsRoh = r._bissStoss;
            r._bissStoss = function (beisser, ziel) {
                const v0 = geschw(ziel);
                const o = bsRoh.call(this, beisser, ziel);
                const v1 = geschw(ziel);
                stossNach = Math.hypot(v1.x - v0.x, v1.z - v0.z);
                return o;
            };
            const beiss = (fest) => {
                stossNach = null;
                for (let k = 0; k < 90 && stossNach === null; k++) {
                    fest();
                    r.updateCreatures(1 / 60);
                    r._kreaturStossSchritt(1 / 60);
                    r._leibKontakte();
                }
                return stossNach;
            };
            try {
                for (const seele of ["fuchs", "wolf", "baer"]) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 3);
                    const bx = ort0.x + 400,
                        bz = ort0.z + 400;
                    const j = r.spawnCreatureAt(bx, ort0.y, bz, "calm", seele, { bodySize: 1 });
                    const h = r.spawnCreatureAt(bx + 1.2, ort0.y, bz, "calm", "wesen", { bodySize: 0.6 });
                    if (j && h) {
                        // gemessen wird der Stoß des Bisses, nicht seine Trefferquote: bis zu drei Ansprünge aus der Ruhe (ein
                        // Ansprung des Freude-Hüpfers geht über ein Kitz hinweg — benannt offen, Nachbesserung 2; vorher
                        // wackelte die Wand in 2 von 27 Läufen am Fuchs)
                        let dv = null;
                        let ansatz = false;
                        for (let a = 0; a < 3 && dv === null; a++) {
                            j.position.set(bx, r.getTerrainHeightAt(bx, bz), bz);
                            j.rotation.set(0, Math.PI / 2, 0); // dem Kitz zugewandt
                            Object.assign(j.userData, {
                                _steuer: null,
                                _stossV: null,
                                _verhaltenAktion: null,
                                _hopH: 0,
                                _hopV: 0,
                                nextHuntStrikeAt: 0,
                            });
                            h.position.set(bx + 1.2, r.getTerrainHeightAt(bx + 1.2, bz), bz);
                            h.userData._stossV = null;
                            h.userData.hp = 1e6;
                            ansatz = r._tickCreatureScentStrike(j) === true;
                            if (!ansatz) break;
                            dv = beiss(() => {
                                h.position.x = bx + 1.2;
                                h.position.z = bz;
                                h.userData.fearUntil = 0;
                            });
                        }
                        beute[seele] = { biss: dv !== null, dv: dv || 0 };
                    }
                    if (h) r.removeCreature(h);
                    if (j) {
                        // derselbe Jäger 1,2 m vor dem Spieler, ihm zugewandt
                        j.position.set(ort0.x + 1.2, r.getTerrainHeightAt(ort0.x + 1.2, ort0.z), ort0.z);
                        j.rotation.set(0, -Math.PI / 2, 0);
                        j.userData._steuer = null;
                        j.userData._stossV = null;
                        j.userData._verhaltenAktion = null;
                        j.userData._hopH = 0; // es steht (der Sprung am Kitz ist gelandet)
                        j.userData._hopV = 0;
                        j.userData.nextHuntStrikeAt = 0;
                        p.hp = p.maxHp || 100;
                        p.respawnGraceUntil = 0;
                        B0.halte();
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        const ansatz = r._tickCreatureHuntStrike(j) === true;
                        const dv = ansatz ? beiss(B0.halte) : null;
                        spieler[seele] = { biss: dv !== null, dv: dv || 0 };
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        r.removeCreature(j);
                    }
                }
            } finally {
                delete r._bissStoss;
                B0.zurueck();
                p.hp = bissAlt.hp;
                p.respawnGraceUntil = bissAlt.gnade;
                if (r.getGameMode() !== bissAlt.mode) r.setGameMode(bissAlt.mode);
            }
            w.z.biss = { beute, spieler };
        }
        parke(hirsch);
        // (T4) keine Schadens-Kappe: je Nahkampf-Rezept EIN Hieb auf die Brust, Faktor = Schaden ÷ (Kraft × Güte × Zone)
        const sc = globalThis.__schmiedeCore;
        const ZT = A._arenaGesetz().zonen || null;
        const faktoren = [];
        for (const id of Object.keys(sc.REZEPT_ZU_GATTUNG)) {
            const g = sc.GATTUNGEN[sc.REZEPT_ZU_GATTUNG[id]];
            if (g && g.task && g.task.art === "bogen") continue;
            const name = "klinge_" + id;
            if (!s.blueprints[name]) continue;
            ausruesten(name);
            r._setBlueprintWear(s.blueprints[name], 1);
            stelle(hirsch, 1.5);
            zielen(punkt(hirsch, null));
            const sw = schwung();
            const t = traf(sw, hirsch);
            if (!t) {
                faktoren.push({ id, f: null });
                continue;
            }
            const z = sw.juice.length && sw.juice[0].zone;
            const zm = z && ZT && ZT[z] ? ZT[z].mul : 1;
            const ke = sw.juice.length && Number.isFinite(sw.juice[0].ke) ? sw.juice[0].ke : null;
            faktoren.push({ id, f: t.amount / ((p.stats.damage || 5) * r._heldGueteFaktor() * zm), ke });
        }
        const fs = faktoren.filter((x) => x.f !== null).map((x) => x.f);
        const fMax = Math.max(...fs);
        w.z.faktoren = faktoren.map((x) => x.id + ":" + (x.f === null ? "-" : x.f.toFixed(2))).join(" ");
        w.z.aufDerKappe = fs.filter((f) => f >= fMax * 0.99).length;
        w.z.nahkampfRezepte = faktoren.length;
        w.c.keineKappe = fs.length >= 15 && w.z.aufDerKappe <= 2;
        // K-D4 — DER HIT-STOP IST ENERGIE-SKALIERT an der ganzen Tafel: die Treffer-Energie (sie trägt Hit-Stop und Dip) je
        // Nahkampf-Rezept, ein Hieb auf die Brust; die größte Gruppe von Rezepten, deren Energie auf ±3 % gleich ist. Der Befund
        // (Ω-Φ4-Tautologie KE = ½·I·ω² bei ω ∝ 1/√I): 13 von 17 Rezepten stoppten mit 19,8 J.
        {
            const ke = faktoren
                .map((x) => x.ke)
                .filter((x) => Number.isFinite(x) && x > 0)
                .sort((a, b) => a - b);
            let gruppe = 0;
            for (let i = 0; i < ke.length; i++) {
                let n = 0;
                for (let j = i; j < ke.length && ke[j] <= ke[i] * 1.06; j++) n++;
                gruppe = Math.max(gruppe, n);
            }
            w.z.keGruppe = gruppe;
            w.z.keRezepte = ke.length;
            w.z.keSpanne = ke.length ? +(ke[ke.length - 1] / ke[0]).toFixed(1) : null;
            w.c.hitStopEnergie = ke.length >= 15 && gruppe <= 3;
        }
        // (T5) die Gegenwehr folgt dem TEMPERAMENT DER GATTUNG (Welle LF 08.10., K-D12): 20 Treffer mit Rückstoß aus 1,6 m
        // im Modus pfad — der Bär (wehrhaft) schlägt zurück, der Hirsch derselben Größe (scheu, ein Fluchttier) nie.
        // Vorher lief die Probe am Hirsch, den die Substanz-Tags „wehrhaft" nannten.
        r.setGameMode("pfad");
        p.hp = 1e9;
        p.respawnGraceUntil = -Infinity;
        // Die Gegenwehr ist der Ansprung (Welle LF kampf, Posten 5): nach jedem Treffer läuft der Kreatur-Takt 1 s (der Spieler
        // steht auf dem Boden) — gezählt wird, was das Maul am Leib schnappt.
        const gegenwehrAn = (c) => {
            const g0 = zaehl.gegenwehr;
            const B = amBoden();
            try {
                for (let i = 0; i < 20; i++) {
                    stelle(c, 1.6);
                    r.damageCreature(c, 5, {
                        source: "player",
                        fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
                        knockback: 16,
                    });
                    for (let k = 0; k < 60; k++) {
                        B.halte();
                        r.updateCreatures(1 / 60);
                        r._kreaturStossSchritt(1 / 60);
                        r._leibKontakte();
                    }
                }
            } finally {
                B.zurueck();
            }
            parke(c);
            return zaehl.gegenwehr - g0;
        };
        const baerG = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 300, "happy", "baer", {
            bodySize: 1,
        });
        const hirschG = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 304, "happy", "wesen", {
            bodySize: 1,
        });
        if (baerG) tiere.push(baerG);
        if (hirschG) tiere.push(hirschG);
        w.z.gegenwehr = baerG ? gegenwehrAn(baerG) : 0;
        w.z.gegenwehrHirsch = hirschG ? gegenwehrAn(hirschG) : -1;
        w.z.temperamentBaer = baerG ? r._creatureTemperament(baerG) : null;
        w.z.temperamentHirsch = hirschG ? r._creatureTemperament(hirschG) : null;
        r.setGameMode(saved.mode);
        p.hp = saved.hp;
        w.c.gegenwehr =
            w.z.temperamentBaer === "wehrhaft" &&
            w.z.gegenwehr > 0 &&
            w.z.temperamentHirsch === "scheu" &&
            w.z.gegenwehrHirsch === 0;
        // (T6) die Hand ist kein Panzer
        ausruesten(null);
        const st0 = r.computePlayerStats().stats;
        const leer = { d: st0.defense, hp: st0.hpMax, dmg: st0.damage };
        ausruesten("klinge_langschwert");
        const st1 = r.computePlayerStats().stats;
        w.z.panzer = `defense ${leer.d.toFixed(2)}→${st1.defense.toFixed(2)} · hpMax ${leer.hp.toFixed(1)}→${st1.hpMax.toFixed(1)} · damage ${leer.dmg.toFixed(2)}→${st1.damage.toFixed(2)}`;
        w.c.keinPanzer = st1.defense === leer.d && st1.hpMax === leer.hp && st1.damage > leer.dmg;
        // (T7) Verschleiß: 16 Treffer zehren die Klinge, ein verbrauchtes Gerät schlägt nicht
        const bpL = s.blueprints.klinge_langschwert;
        r._setBlueprintWear(bpL, 1);
        let n7 = 0;
        for (let i = 0; i < 16; i++) {
            stelle(hirsch, 1.6);
            zielen(punkt(hirsch, null));
            if (traf(schwung(), hirsch)) n7++;
        }
        w.z.wear16 = r._blueprintWear(bpL);
        w.z.treffer16 = n7;
        r._setBlueprintWear(bpL, 0.02);
        stelle(hirsch, 1.6);
        zielen(punkt(hirsch, null));
        w.z.trefferVerbraucht = traf(schwung(), hirsch) ? 1 : 0;
        r._setBlueprintWear(bpL, 1);
        w.c.verschleiss = n7 >= 12 && w.z.wear16 < 0.99 && w.z.trefferVerbraucht === 0;
        // (T8) der Pfeil: Impuls im Schaden, die Wand hält ihn
        ausruesten("klinge_langbogen");
        const rec = fn("_heldBogenRecipe") ? r._heldBogenRecipe() : null;
        const schuss = (frac, ziel) => {
            const n0 = treff.length;
            const list = s._pfeile || [];
            const vorher = list.length;
            p._shotCooldownUntil = 0;
            p._swing = null;
            r._beginPlayerShot(rec, frac);
            const pf = (s._pfeile || [])[vorher];
            if (!pf) return { flog: false, treffer: null };
            for (let k = 1; k <= 360 && s._pfeile.includes(pf); k++) r._tickPfeile(pf.born + k / 120);
            const t = treff.slice(n0).find((x) => x.c === ziel);
            return { flog: true, treffer: t || null };
        };
        if (!rec) w.fehler.push("Bogen-Rezept kalt");
        else {
            stelle(hirsch, 2.5);
            zielen(punkt(hirsch, null));
            const voll = schuss(1, hirsch);
            stelle(hirsch, 2.5);
            zielen(punkt(hirsch, null));
            const viertel = schuss(0.25, hirsch);
            w.z.pfeilVoll = voll.treffer ? voll.treffer.amount : null;
            w.z.pfeilViertel = viertel.treffer ? viertel.treffer.amount : null;
            w.c.pfeilImpuls =
                w.z.pfeilVoll !== null && w.z.pfeilViertel !== null && w.z.pfeilViertel <= 0.5 * w.z.pfeilVoll;
            // die Wand: ein Stein-Riegel 4 m vor dem Spieler, der Hirsch 9 m dahinter
            s.blueprints._kg_wand = {
                name: "_kg_wand",
                parts: [
                    {
                        shape: "box",
                        material: "stein",
                        size: { x: 6, y: 4, z: 0.4 },
                        position: { x: 0, y: 2, z: 0 },
                    },
                ],
            };
            const wand = r.spawnArchitecture(
                "_kg_wand",
                { x: pm.position.x, y: pm.position.y, z: pm.position.z + 4 },
                { precise: true, seed: 1 } // genau dort (keine Spieler-Klemme), der Fuß der Wand auf deinem
            );
            if (!wand) w.fehler.push("Wand-Spawn fehlgeschlagen");
            stelle(hirsch, 13);
            zielen(punkt(hirsch, null));
            const hinter = schuss(1, hirsch);
            w.z.pfeilHinterWand = hinter.treffer ? 1 : 0;
            if (wand) r.removeArchitecture(wand);
            delete s.blueprints._kg_wand;
            stelle(hirsch, 13);
            zielen(punkt(hirsch, null));
            const frei = schuss(1, hirsch);
            w.z.pfeilFrei = frei.treffer ? 1 : 0;
            w.c.pfeilWand = !!wand && w.z.pfeilHinterWand === 0 && w.z.pfeilFrei === 1;
            // (T7b) der Bogen ist eine geführte Waffe wie die Klinge (K-D6 ganz): sein Verschleiß wirkt im Schaden
            // (wear 0,5 → _wearStatFactor 0,65 des vollen), jeder Schuss zehrt ihn, ein verbrauchter Bogen (wear 0,02,
            // unter WEAR_KAPUTT_SCHWELLE) löst nicht — dieselbe Wand wie Hieb und Abbau.
            const bpB = s.blueprints.klinge_langbogen;
            const bogenBei = (wear) => {
                r._setBlueprintWear(bpB, wear);
                stelle(hirsch, 2.5);
                zielen(punkt(hirsch, null));
                const sh = schuss(1, hirsch);
                return { flog: sh.flog, amount: sh.treffer ? sh.treffer.amount : null, nach: r._blueprintWear(bpB) };
            };
            const bogenProbe = () => {
                const b1 = bogenBei(1),
                    b5 = bogenBei(0.5),
                    b02 = bogenBei(0.02);
                r._setBlueprintWear(bpB, 1);
                const F = A.WEAR_STAT_FLOOR;
                const soll = F + (1 - F) * 0.5;
                const verh = b1.amount && b5.amount !== null ? b5.amount / b1.amount : null;
                return {
                    voll: b1.amount,
                    halb: b5.amount,
                    verh,
                    soll,
                    zehrtVoll: 1 - b1.nach,
                    zehrtHalb: 0.5 - b5.nach,
                    verbrauchtFlog: b02.flog ? 1 : 0,
                    verbrauchtTraf: b02.amount !== null ? 1 : 0,
                    ok:
                        verh !== null &&
                        Math.abs(verh - soll) < 0.01 &&
                        b1.nach < 1 &&
                        b5.nach < 0.5 &&
                        !b02.flog &&
                        b02.amount === null,
                };
            };
            w.z.bogen = bogenProbe();
            w.c.bogenVerschleiss = w.z.bogen.ok;
            // (S6) SELBST-TEST mit dem Täter: der Pfeil ohne Verschleiß (Faktor ≡ 1, kein Zehren — der alte Zwilling)
            {
                const svF = r._wearStatFactor,
                    svV = r._kampfVerschleiss;
                r._wearStatFactor = () => 1;
                r._kampfVerschleiss = () => {};
                try {
                    w.z.s6 = bogenProbe();
                } finally {
                    r._wearStatFactor = svF;
                    r._kampfVerschleiss = svV;
                    delete r._wearStatFactor;
                    delete r._kampfVerschleiss;
                    r._setBlueprintWear(bpB, 1);
                }
                w.c.s6 = w.z.s6.ok === false;
            }
        }
        // (T7c) die KLASSE der Waffen-Schadens-Pfade: jede Methode, die ein Wesen im Namen des Spielers schädigt
        // (damageCreature mit source "player"), rechnet ihren Schaden im EINEN Roh-Schaden-Gesetz _kampfRohSchaden —
        // kein Pfad setzt Kraft × Wirkung × Zone selbst zusammen (der Pfeil tat es, ohne Verschleiß).
        {
            const klasse = () => {
                const tat = [];
                const pfade = [];
                for (const k of Object.getOwnPropertyNames(A.prototype)) {
                    const d = Object.getOwnPropertyDescriptor(A.prototype, k);
                    if (k === "constructor" || !d || typeof d.value !== "function") continue; // constructor = die ganze Klasse
                    const code = String(d.value)
                        .replace(/\/\/.*$/gm, "")
                        .replace(/\/\*[\s\S]*?\*\//g, "");
                    if (!/damageCreature\(/.test(code) || !/source:\s*"player"/.test(code)) continue;
                    pfade.push(k);
                    if (!/_kampfRohSchaden\(/.test(code)) tat.push(k);
                }
                return { pfade, tat };
            };
            const kl = klasse();
            w.z.schadensPfade = kl.pfade.join(",");
            w.z.schadensZwillinge = kl.tat.join(",") || "–";
            w.c.einRohSchaden = kl.pfade.length >= 2 && kl.tat.length === 0;
            // (S7) SELBST-TEST mit dem Täter: ein Waffen-Pfad, der seinen Schaden selbst zusammensetzt (die Pfeil-Zeile
            // von d1ab1c64 wörtlich, als Wurf verkleidet) — die Klassen-Linse muss ihn beim Namen nennen
            A.prototype.__taeterWurf = function (hit, pf, urteil) {
                return this.damageCreature(hit, pf.kraft * this._trefferWirkung(urteil) * urteil.zoneMul, {
                    source: "player",
                });
            };
            try {
                const kt = klasse();
                w.z.s7 = kt.tat.join(",") || "–";
                w.c.s7 = kt.tat.includes("__taeterWurf");
            } finally {
                delete A.prototype.__taeterWurf;
            }
        }
        // (T9) EINE Güte je Gerät: der Schadens-Faktor (_heldGueteFaktor) und die Güte des Werks (computeBlueprintQuality —
        // Werkstoff-Kraft, Equip-Fold) lesen dasselbe Lehren-Urteil des Kerns (schmiede gueteFaktor → Anteil)
        {
            const GU = A._arenaGesetz().guete;
            let uneins = 0,
                n9 = 0;
            const proben9 = [];
            for (const id of Object.keys(sc.REZEPT_ZU_GATTUNG)) {
                const name = "klinge_" + id;
                if (!s.blueprints[name]) continue;
                ausruesten(name);
                const anteil = (sc.gueteFaktor(id) - GU.faktorLeer) / (GU.faktorVoll - GU.faktorLeer);
                const q = r.computeBlueprintQuality(s.blueprints[name]);
                const gF = r._heldGueteFaktor();
                const gSoll = GU.faktorLeer + (GU.faktorVoll - GU.faktorLeer) * q;
                n9++;
                const eins = Math.abs(q - anteil) < 1e-9 && Math.abs(gF - gSoll) < 1e-9;
                if (!eins) {
                    uneins++;
                    if (proben9.length < 4)
                        proben9.push(
                            `${id}: Güte ${q.toFixed(2)} · Lehre ${anteil.toFixed(2)} · Schaden ×${gF.toFixed(2)}`
                        );
                }
            }
            w.z.gueteUneins = uneins;
            w.z.gueteGeraete = n9;
            w.z.gueteProben = proben9.join(" | ");
            w.c.eineGuete = n9 >= 17 && uneins === 0;
        }
        // die fünf Phantom-Leser (0 Definitionen im Kern) — kein Aufruf im Stamm
        // (Absenz über den Code ohne Kommentare — Kommentare dürfen die Gefallenen zitieren, Lehre 6)
        const stamm = Object.getOwnPropertyNames(A.prototype)
            .map((k) => {
                const d = Object.getOwnPropertyDescriptor(A.prototype, k);
                return d && typeof d.value === "function"
                    ? String(d.value)
                          .replace(/\/\/.*$/gm, "")
                          .replace(/\/\*[\s\S]*?\*\//g, "")
                    : "";
            })
            .join("\n");
        w.z.phantome = (stamm.match(/\b(zoneMulAt|zoneKindAt|zoneJuiceAt|handlingMul|handlingWindF)\b/g) || []).length;
        w.c.keinePhantome = w.z.phantome === 0;
        const codeVon = (name) =>
            fn(name)
                ? String(A.prototype[name])
                      .replace(/\/\/.*$/gm, "")
                      .replace(/\/\*[\s\S]*?\*\//g, "")
                : "";
        // (T10) KERN-PFLICHT des Treffer-Volumens: fehlt tetrapoda trefferZone, bricht der erste Treffer-Test LAUT
        // (_kernPflichtBruch, benannt) — nie still null, das je Tier gespeichert jedes Wesen unverwundbar machte.
        // Gegenprobe: mit dem Kern trägt dasselbe Tier seine Glieder, jedes mit Zone.
        {
            const frisch = setze("wesen");
            const tcEcht = globalThis.__tetrapodaCore;
            let bruch = null,
                rueck;
            globalThis.__tetrapodaCore = Object.assign({}, tcEcht, { trefferZone: undefined });
            try {
                rueck = r._kreaturTrefferGlieder(frisch);
            } catch (e) {
                bruch = String((e && e.message) || e);
            } finally {
                globalThis.__tetrapodaCore = tcEcht;
            }
            w.z.kernOhneZone = bruch
                ? /tetrapoda:trefferZone/.test(bruch)
                    ? "Bruch benannt"
                    : "Bruch ohne Namen"
                : rueck === null
                  ? "still null" + (frisch.userData._trefferGlieder === null ? ", je Tier gespeichert" : "")
                  : "Liste";
            delete frisch.userData._trefferGlieder;
            const gl = r._kreaturTrefferGlieder(frisch);
            w.z.kernMitZone = Array.isArray(gl) ? gl.length : 0;
            w.c.kernPflichtZone =
                w.z.kernOhneZone === "Bruch benannt" && Array.isArray(gl) && gl.length > 0 && gl.every((g) => !!g.zone);
            r.removeCreature(frisch);
            tiere.splice(tiere.indexOf(frisch), 1);
        }
        // (T11) der KALTE ERSTE TREFFER je Gattung (Lehre 14): ein Tier einer Gattung, deren Treffer-Glieder noch niemand
        // kennt, steht in der Welt, die Welt läuft 60 Spiel-Takte, dann der erste Hieb — gezählt werden die Haut-Vertices,
        // die der Hieb SELBST zerlegt (_kreaturGliederGruppen im Treffer-Pfad). Vorgebacken (die EINE Bake-Uhr): 0.
        const gattungVon = (c) => {
            const ud = c.userData || {};
            return (
                ud.gattung ||
                ud.recipe ||
                ud.preset ||
                (A.TETRAPODA_SOUL_MAP && A.TETRAPODA_SOUL_MAP[ud.soul || "wesen"]) ||
                ud.soul ||
                "wesen"
            );
        };
        const kalterTreffer = (seele) => {
            ausruesten("klinge_langschwert");
            const c = setze(seele);
            if (!c) return { traf: false, zerlegt: null };
            if (r._trefferGliedNamen) r._trefferGliedNamen.delete(gattungVon(c));
            stelle(c, 9, 4);
            for (let k = 0; k < 60; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            p._swing = null;
            p._hitStopUntil = 0;
            let zerlegt = 0;
            const svG = r._kreaturGliederGruppen;
            r._kreaturGliederGruppen = function (cr) {
                const G = svG.call(this, cr);
                if (G) for (const [, g] of G.gruppen) zerlegt += g.verts;
                return G;
            };
            let t = null;
            try {
                stelle(c, 1.6);
                zielen(punkt(c, null));
                t = traf(schwung(), c);
            } finally {
                r._kreaturGliederGruppen = svG;
                delete r._kreaturGliederGruppen;
            }
            parke(c);
            return { traf: !!t, zerlegt, gattung: gattungVon(c) };
        };
        w.z.kalt = kalterTreffer("baer");
        w.c.kaltVorgebacken = w.z.kalt.traf && w.z.kalt.zerlegt === 0;
        // (S8) SELBST-TEST mit dem Täter: ohne das Vorbacken zerlegt der erste Hieb die Haut (die Linse zählt den Hieb)
        if (fn("_tickTrefferGliederVorbacken")) {
            r._tickTrefferGliederVorbacken = () => {};
            try {
                w.z.s8 = kalterTreffer("wolf");
            } finally {
                delete r._tickTrefferGliederVorbacken;
            }
            w.c.s8 = w.z.s8.traf && w.z.s8.zerlegt > 0;
        }
        // (G1) der Klingen-Sweep liest die EINE Vorwärts-Richtung (_blickVorn) — keine Inline-Kopie der Formel
        {
            const sw = codeVon("_kampfSweepTick");
            w.z.sweepFormel = (sw.match(/Math\.(sin|cos)\(/g) || []).length;
            w.c.sweepBlickVorn = /this\._blickVorn\(/.test(sw) && w.z.sweepFormel === 0;
        }
        // (G2) keine typeof-Probe auf eine EIGENE Methode in den Methoden, die die Welle L (Kampf und Maus) schrieb —
        // die Methode existiert immer; die Probe wäre ein stiller Rückfall, nie ein Vertrag
        {
            const welleL = [
                "fertigeBlueprint",
                "_ruestungDaempft",
                "_kreaturGliederGruppen",
                "_gliedKapselMemo",
                "_kreaturTrefferGlieder",
                "_kreaturGliedTreffer",
                "_kreaturGattung",
                "_tickTrefferGliederVorbacken",
                "_bauModusFuer",
                "_kampfKlingenAchse",
                "_kampfUrteil",
                "_kampfKraft",
                "_kampfRohSchaden",
                "_trefferWirkung",
                "_kampfStats",
                "_kampfVerschleiss",
                "_geraetVerbraucht",
                "_eigenwerkSchwungKE",
                "_schmiedeGueteAnteil",
                "_schmiedeGestalt",
                "_geraetGraebt",
                "_blickVorn",
                "_blickGierZu",
                "_blickZiel",
                "_uiSchubladeOffen",
                "_uiZeigerFrei",
            ];
            const selbst = [];
            for (const m of welleL) {
                for (const x of codeVon(m).matchAll(/typeof this\.([\w$]+) === "function"/g))
                    if (typeof A.prototype[x[1]] === "function") selbst.push(m + "→" + x[1]);
            }
            w.z.typeofSelbst = selbst.join(",") || "–";
            w.c.keinTypeofSelbst = selbst.length === 0;
        }
        // (G3) KEIN DRITTER LEIB (Integration Welle L, Gesetz #0): Klinge und Pfeil fragen das EINE Grob-Tor
        // (_trefferErreichbar), und das liest den kreatur-Leib (_kreaturLeib) — kein eigenes Körpermaß (2 × Skala) im
        // Treffer-Pfad.
        {
            const sw = codeVon("_kampfSweepTick");
            const pf = codeVon("_tickPfeile");
            w.z.grobFremd = ((sw + pf).match(/\.scale\.x\b/g) || []).length;
            w.c.grobLiestLeib =
                /this\._trefferErreichbar\(/.test(sw) &&
                /this\._trefferErreichbar\(/.test(pf) &&
                /this\._kreaturLeib\(/.test(codeVon("_trefferErreichbar")) &&
                w.z.grobFremd === 0;
        }
        // (T12) DAS GROB-TOR DECKT DIE GESTALT: jede Gattung in jeder Größen-Grenze (VERHALTEN.groessen), 90 Spiel-Takte;
        // je Probe jedes Ende jeder Treffer-Glied-Kapsel (+ ihr Radius) — ein Punkt der Gestalt, den das Tor abweist,
        // wäre ein Treffer, den die Gestalt nie richten darf. Gemessen wird die RÄUMLICHE Spanne vom Fuß-Ursprung (das Tor
        // fragt waagrecht): sie deckt das Tier in jeder Lage (gekippt, am Hang, im Sprung), nicht nur in der gezeigten.
        // Ohne die Naht (Vorher-Stand) misst sie das alte Inline-Tor.
        const grobTor = fn("_trefferErreichbar")
            ? (c, x, z, sp) => r._trefferErreichbar(c, x, z, sp)
            : (c, x, z, sp) => {
                  const L = Math.max(0.3, c.scale.x || 1);
                  return Math.hypot(c.position.x - x, c.position.z - z) <= sp + 2 * L;
              };
        const gestaltSchar = [];
        {
            const G = A._verhaltenGesetz().groessen;
            const groessen = [...new Set(G.flatMap((k) => [k.min, k.max]))].sort((a, b) => a - b);
            let n = 0;
            for (const seele of ["wesen", "wolf", "fuchs", "baer"]) {
                for (const bs of groessen) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 8);
                    const ort = pm.position;
                    const c = r.spawnCreatureAt(ort.x + 300, ort.y, ort.z + 300, "happy", seele, { bodySize: bs });
                    if (!c) continue;
                    tiere.push(c);
                    stelle(c, 12 + 4 * Math.floor(n / 8), -14 + 4 * (n % 8));
                    gestaltSchar.push({ c, seele, bs });
                    n++;
                }
            }
        }
        const gestaltDeckung = () => {
            const v = V3();
            const o = { proben: 0, ausserhalb: 0, jeL: {}, taeter: [] };
            for (const e of gestaltSchar) {
                const c = e.c;
                const gl = r._kreaturTrefferGlieder(c);
                if (!gl) continue;
                c.updateMatrixWorld(true);
                const L = r._kreaturHueftL(c);
                for (const g of gl) {
                    const rr = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
                    for (const q of [g.a, g.b]) {
                        v.copy(q).applyMatrix4(g.anker.matrixWorld);
                        const dx = v.x - c.position.x,
                            dz = v.z - c.position.z;
                        const d = Math.hypot(dx, dz);
                        const h = Math.hypot(dx, v.y - c.position.y, dz) + rr;
                        o.proben++;
                        o.jeL[e.seele] = Math.max(o.jeL[e.seele] || 0, h / L);
                        // der äußerste Punkt der Kapsel in dieser Richtung, mit Spanne 0 befragt
                        const ux = d > 1e-9 ? dx / d : 1,
                            uz = d > 1e-9 ? dz / d : 0;
                        if (!grobTor(c, c.position.x + ux * h, c.position.z + uz * h, 0)) {
                            o.ausserhalb++;
                            if (o.taeter.length < 3) o.taeter.push(e.seele + "@" + e.bs.toFixed(2));
                        }
                    }
                }
            }
            return o;
        };
        {
            const summe = { proben: 0, ausserhalb: 0, jeL: {}, taeter: [] };
            for (let k = 0; k < 90; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (k % 6) continue;
                const o = gestaltDeckung();
                summe.proben += o.proben;
                summe.ausserhalb += o.ausserhalb;
                for (const [g, x] of Object.entries(o.jeL)) summe.jeL[g] = Math.max(summe.jeL[g] || 0, x);
                for (const t of o.taeter) if (summe.taeter.length < 3) summe.taeter.push(t);
            }
            w.z.grob = summe;
            w.c.grobDeckt = summe.proben > 0 && summe.ausserhalb === 0;
        }
        // (S9) SELBST-TEST mit dem Täter: der Leib ohne seine Glieder (Reichweite = halb + radius, der Kontakt-Leib) —
        // Kopf und Rute liegen draußen, die Deckungs-Probe nennt sie
        if (fn("_trefferErreichbar")) {
            const svLeib = r._kreaturLeib;
            r._kreaturLeib = function (cr, L, out) {
                const o = svLeib.call(this, cr, L, out);
                o.reichweite = o.halb + o.radius;
                return o;
            };
            try {
                w.z.s9 = gestaltDeckung();
            } finally {
                delete r._kreaturLeib;
            }
            w.c.s9 = w.z.s9.ausserhalb > 0;
        }
        for (const e of gestaltSchar) {
            r.removeCreature(e.c);
            tiere.splice(tiere.indexOf(e.c), 1);
        }

        // ═══ Q9 — MAUS-ABSICHT ═══
        ausruesten("klinge_langschwert");
        s.isPointerLocked = true;
        // (M1) 3rd-Person: 10 Klicks auf den Hirsch 2 m vor dir. Liegt ein Bau näher auf dem Kamera-Strahl (die
        // Start-Plattform), gilt das Nächste — der Klick zählt dann als verdeckt, nie als Treffer-Probe.
        if (fn("setCameraMode")) r.setCameraMode("third");
        const z1 = { c: zaehl.carve, t: treff.length };
        let fk = 0,
            frei = 0,
            freiSchwung = 0;
        for (let i = 0; i < 10; i++) {
            stelle(hirsch, 2);
            zielen(punkt(hirsch, null));
            const pick = r._pickCreatureAtCrosshair();
            const imKreuz = !!(pick && pick.creature === hirsch);
            if (imKreuz) fk++;
            const ap = r._pickArchitectureAtCrosshair();
            const istFrei =
                imKreuz &&
                !(ap && ap.point && s.camera.position.distanceTo(ap.point) < s.camera.position.distanceTo(pick.point));
            if (istFrei) frei++;
            p._swing = null;
            p.breakHeld = false;
            p.stamina = (p.stats && p.stats.staminaMax) || 100; // zwischen zwei Klicks atmet der Spieler
            const s0 = zaehl.schwung;
            r.tryMouseBreak();
            if (istFrei && zaehl.schwung > s0) freiSchwung++;
            if (p._swing) {
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing; k++) {
                    T += 0.005;
                    r._tickKampfSchwung(T);
                }
            }
        }
        w.z.dritte = {
            fadenkreuz: fk,
            frei,
            schwuenge: freiSchwung,
            krater: zaehl.carve - z1.c,
            treffer: treff.slice(z1.t).filter((t) => t.c === hirsch).length,
        };
        w.c.dritteSchwingt = fk === 10 && frei >= 8 && freiSchwung === frei && w.z.dritte.krater === 0;
        // (M2) 1st-Person: Drücken auf den Hirsch, der Stoß schiebt ihn fort, das Halten setzt nach
        if (fn("setCameraMode")) r.setCameraMode("first");
        stelle(hirsch, 1.6);
        zielen(punkt(hirsch, null));
        const z2 = zaehl.carve;
        p._swing = null;
        p.breakHeld = true;
        p.lastHarvestStrikeAt = performance.now() / 1000;
        r.tryMouseBreak();
        stelle(hirsch, 1.6, 7); // aus dem Fadenkreuz geschoben
        for (let i = 0; i < 6; i++) {
            if (p._swing) {
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing; k++) {
                    T += 0.005;
                    r._tickKampfSchwung(T);
                }
            }
            p.lastHarvestStrikeAt = -Infinity;
            r._tickHarvest();
        }
        p.breakHeld = false;
        p._swing = null;
        w.z.haltenKrater = zaehl.carve - z2;
        w.c.haltenOhneKrater = w.z.haltenKrater === 0;
        // (M3) RMB: Schwert schüttet nie auf; Spaten und leere Hand schon
        parke(hirsch);
        const boden = (d) => {
            s.yaw = 0;
            zielen({ x: pm.position.x, y: fussY(), z: pm.position.z + d });
        };
        const rmb = (n) => {
            const f0 = zaehl.fill;
            for (let i = 0; i < n; i++) r.tryMousePlace();
            return zaehl.fill - f0;
        };
        boden(4);
        w.z.rmbSchwert = rmb(3);
        ausruesten("klinge_spaten");
        boden(4);
        w.z.rmbSpaten = rmb(1);
        ausruesten(null);
        boden(4);
        w.z.rmbHand = rmb(1);
        w.c.rmbSchwert = w.z.rmbSchwert === 0 && w.z.rmbSpaten === 1 && w.z.rmbHand === 1;
        // (S4) SELBST-TEST: gräbt jedes Gerät, schüttet das Schwert auf
        if (fn("_geraetGraebt")) {
            const sv = r._geraetGraebt;
            r._geraetGraebt = () => true;
            try {
                ausruesten("klinge_langschwert");
                boden(4);
                w.z.s4 = rmb(1);
            } finally {
                r._geraetGraebt = sv;
            }
            w.c.s4 = w.z.s4 === 1;
        }
        // (M4) die offene Werkstatt: 4 Klicks auf den Canvas — gezählt wird, wie oft der Canvas in die Welt greift
        // (sein Dispatcher tryMouseBreak; hier gezählt statt ausgeführt, die Probe misst den Canvas, nicht das Ziel)
        ausruesten(null);
        boden(4);
        const cv = document.getElementById("world-canvas");
        const tmbOrig = r.tryMouseBreak;
        let griffe = 0;
        r.tryMouseBreak = () => (griffe++, true);
        try {
            r.toggleDrawer("werkstatt");
            const offen = !!document.querySelector('.drawer[data-drawer="werkstatt"]:not([hidden])');
            s.isPointerLocked = true; // der Zeiger war gefangen, als die Schublade aufging (Befund V-D2)
            for (let i = 0; i < 4 && cv; i++) {
                cv.dispatchEvent(new MouseEvent("mousedown", { button: 0, bubbles: true }));
                cv.dispatchEvent(new MouseEvent("mouseup", { button: 0, bubbles: true }));
            }
            w.z.werkstattGriffe = cv ? griffe : null;
            r.closeAllDrawers();
            // Gegenprobe: ohne Schublade greift derselbe Klick in die Welt
            s.isPointerLocked = true;
            griffe = 0;
            if (cv) {
                cv.dispatchEvent(new MouseEvent("mousedown", { button: 0, bubbles: true }));
                cv.dispatchEvent(new MouseEvent("mouseup", { button: 0, bubbles: true }));
            }
            w.z.ohneWerkstattGriffe = cv ? griffe : null;
            w.c.werkstattTaub = offen && w.z.werkstattGriffe === 0 && w.z.ohneWerkstattGriffe === 1;
        } finally {
            r.tryMouseBreak = tmbOrig;
            delete r.tryMouseBreak;
            p.breakHeld = false;
        }
        // (M5) FERTIGEN eines Bauwerks (die Eiche) → der Bau-Modus, nicht die Hand
        r.setGameMode("schöpfer");
        const fert = r.fertigeBlueprint("baum_eiche");
        w.z.fertigen = {
            ok: !!(fert && fert.ok),
            hand: (p.equipped && p.equipped.held) || null,
            bauModus: !!(s.buildMode && s.buildMode.active && s.buildMode.blueprintName === "baum_eiche"),
        };
        w.c.fertigenBaut = w.z.fertigen.bauModus && w.z.fertigen.hand !== "baum_eiche";
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();
        ausruesten(null);
        r.setGameMode(saved.mode);
        s.isPointerLocked = saved.lock;

        // ═══ Q10 — BLICK-WAHRHEIT ═══
        if (fn("setCameraMode")) r.setCameraMode("first");
        const blickBei = (pitch) => {
            s.pitch = pitch;
            kamera();
            return grad(Math.asin(Math.max(-1, Math.min(1, camDir().y))));
        };
        w.z.blick90 = blickBei(-Math.PI / 2);
        w.z.blick57 = blickBei(-1.0);
        w.c.egoBlick = Math.abs(w.z.blick90 + 90) < 0.5 && Math.abs(w.z.blick57 - grad(-1.0)) < 0.5;
        // „vor dir": at_player_forward und „baue dorf hier" gegen den Blick der Kamera (waagrecht)
        const vorDir = (naht) => {
            let min = Infinity;
            for (const y of [0, 0.9, 2.4, -1.7]) {
                s.yaw = y;
                s.pitch = 0;
                kamera();
                const d = camDir();
                const h = Math.hypot(d.x, d.z) || 1;
                // die Naht (Selbst-Test) gilt nur der DSL-Position, nie der Kamera
                const sv = naht ? r._blickVorn : null;
                if (naht) r._blickVorn = naht;
                let pos;
                try {
                    pos = r.dslPositions.at_player_forward([10], { state: s, rng: () => 0.5 });
                } finally {
                    if (naht) {
                        r._blickVorn = sv;
                        delete r._blickVorn;
                    }
                }
                const vx = pos.x - pm.position.x,
                    vz = pos.z - pm.position.z;
                min = Math.min(min, (vx * d.x + vz * d.z) / (h * (Math.hypot(vx, vz) || 1)));
            }
            return min;
        };
        w.z.vorDirCos = vorDir();
        s.yaw = 0.9;
        s.pitch = 0;
        kamera();
        const dD = camDir();
        // „baue dorf hier" trägt den Blick des Sprechers (Gier, Programm-Stelle 3 — die Welle L Folge, Gegenprüfung Runde 1:
        // der Anker hing am Blick jedes Peers): seine Vorwärts-Richtung (`_blickVorn`) blickt wie die Kamera.
        const dsl = r.parseChatToDsl("baue dorf hier");
        const gier = dsl && dsl.program ? dsl.program[3] : null;
        const vg = Number.isFinite(gier) ? r._blickVorn(gier, 0) : null;
        w.z.dorfCos = vg
            ? (vg.x * dD.x + vg.z * dD.z) / (Math.hypot(dD.x, dD.z) * (Math.hypot(vg.x, vg.z) || 1))
            : null;
        w.c.vorDir = w.z.vorDirCos > 0.9 && w.z.dorfCos !== null && w.z.dorfCos > 0.9;
        // (S3) SELBST-TEST: die alte −(sin, cos)-Richtung in der Naht → „vor dir" kippt hinter dich
        if (fn("_blickVorn")) {
            const echt = r._blickVorn;
            w.z.s3 = vorDir((yaw, pitch, out) => {
                const o = echt.call(r, yaw, pitch, out);
                o.x = -o.x;
                o.z = -o.z;
                return o;
            });
            w.c.s3 = w.z.s3 < 0;
        }
        // der Pfeil aufs Fadenkreuz bei 45° Steigung: seine BAHN erreicht den Punkt des Fadenkreuzes (Welle LF: er fällt, die
        // Ballistik hebt ihn) — gemessen der Winkel zwischen Pfeil und Fadenkreuz-Punkt von der Kamera aus, wenn der Pfeil die
        // Weite des Punkts erreicht
        if (rec) {
            ausruesten("klinge_langbogen");
            s.yaw = 0;
            s.pitch = Math.PI / 4;
            kamera();
            const cam = s.camera.position.clone();
            const zp = r._blickZiel(A.BLICK_ZIEL_M);
            const Z = V3().set(zp.x, zp.y, zp.z);
            const weite = Z.distanceTo(cam);
            const vorher = (s._pfeile || []).length;
            p._shotCooldownUntil = 0;
            r._beginPlayerShot(rec, 1);
            const pf = (s._pfeile || [])[vorher];
            if (pf) {
                for (let k = 1; k <= 2400 && s._pfeile.includes(pf); k++) {
                    if (V3().set(pf.x, pf.y, pf.z).distanceTo(cam) >= weite) break;
                    r._tickPfeile(pf.born + k / 240);
                }
                const P = V3().set(pf.x, pf.y, pf.z);
                w.z.pfeilFadenkreuz = grad(P.sub(cam).angleTo(V3().subVectors(Z, cam)));
                if (s._pfeile.includes(pf)) {
                    r._pfeilDespawn(pf);
                    s._pfeile.splice(s._pfeile.indexOf(pf), 1);
                }
            }
            w.c.pfeilFadenkreuz = Number.isFinite(w.z.pfeilFadenkreuz) && w.z.pfeilFadenkreuz < 1;
        }

        // ═══ WELLE LF KAMPF (09.10.) — die Posten der Leben-Schau 07.10. (befund-kampf.md) ═══
        if (fn("setCameraMode")) r.setCameraMode("first");
        // (T16) DIE TREFFER-ENERGIE FOLGT DEM SCHWUNG (Posten 1): derselbe Hieb auf denselben Hirsch — drei Abstände (1,3 ·
        // 1,6 · 1,9 m) × fünf Lagen des Leibs (Breitseite, abgewandt, zugewandt, zwei schräg), das Fadenkreuz auf der
        // Leibes-Mitte. Gemessen: die Energie des Urteils je Treffer (KE am Kontakt). Befund: Großschwert in 1,6 m, Hirsch
        // abgewandt → Kontakt am Griff-Drittel, 15–18 J; in 1,7 m 91 J; der Dolch 24–32 J.
        await teil("T16", async () => {
            const hE = setze("wesen");
            const detail = [];
            const energie = (name, d, rotY, dy = 0) => {
                ausruesten(name);
                if (s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                stelle(hE, d, 0, dy);
                hE.rotation.set(0, rotY, 0);
                hE.updateMatrixWorld(true);
                zielen(punkt(hE, null));
                const sw = schwung();
                const j = traf(sw, hE) && sw.juice[0];
                if (j)
                    detail.push({
                        name: name.replace("klinge_", ""),
                        d,
                        ort: j.ort,
                        eff: j.eff && +j.eff.toFixed(2),
                        v: j.v && +j.v.toFixed(1),
                    });
                return j && Number.isFinite(j.ke) ? +j.ke.toFixed(2) : null;
            };
            const lagen = [Math.PI / 2, 0, Math.PI, Math.PI / 4, -Math.PI / 4];
            const reihe = (name, abst) => {
                const out = [];
                for (const d of abst) for (const ry of lagen) out.push(energie(name, d, ry));
                return out;
            };
            w.z.energie = {
                gross: reihe("klinge_grossschwert", [1.3, 1.6, 1.9]),
                dolch: reihe("klinge_dolch", [1.2, 1.6]),
            };
            w.z.energie.detail = detail;
            w.z.energie.befund = [1.5, 1.6, 1.7].map((d) => energie("klinge_grossschwert", d, 0));
            // die benannte Streuung: zu nah (ein Kitz, L 0,6, in 0,6 m auf einer Stufe 1 m über dem Fuß, Breitseite — der Bogen
            // liegt waagrecht, der Leib nur am Griff-Teil) trifft das Großschwert nicht mit dem Schlagpunkt — der Kern nennt
            // den Ort und hält die Wirkung über seinem Boden
            {
                const wegRoh = r._kampfTrefferWeg;
                let weg = null;
                r._kampfTrefferWeg = function (...a) {
                    const o = wegRoh.apply(this, a);
                    weg = o ? [+o.lo.toFixed(2), +o.hi.toFixed(2)] : null;
                    return o;
                };
                let ke;
                const L0e = hE.scale.x;
                try {
                    hE.scale.setScalar(0.6);
                    ke = energie("klinge_grossschwert", 0.6, Math.PI / 2, 1.0);
                } finally {
                    hE.scale.setScalar(L0e);
                    r._kampfTrefferWeg = wegRoh;
                    delete r._kampfTrefferWeg;
                }
                const j = juice[juice.length - 1];
                w.z.energie.nah = { ke, ort: j ? j.ort : null, eff: j ? j.eff : null, weg };
            }
            if (hE) parke(hE);
        });
        // (T17) EINE REICHWEITE AUS DER WAFFE (Posten 3): die Befund-Geometrie — ein Fuchs 1,8 m vor dir, seine Füße 0,77 m
        // tiefer, das Fadenkreuz auf ihm, neun Klicks über den EINEN Dispatcher (tryMouseBreak) mit dem Langschwert. Gemessen:
        // das Verb des Drückens (hieb am Tier oder Luftschlag), Treffer, und was der Spieler-Kanal sagt. Gegenprobe: derselbe
        // Fuchs in 1,3 m / −0,6 m (in Reichweite) trifft. Befund: das Tor wählte „hieb" bis 6 m ab der Schulter, die Klinge
        // reichte 2,46 m — 9 Schwünge, 0 Treffer, kein Hinweis.
        await teil("T17", async () => {
            const fR = setze("fuchs");
            ausruesten("klinge_langschwert");
            if (s.blueprints.klinge_langschwert) r._setBlueprintWear(s.blueprints.klinge_langschwert, 1);
            const sagRoh = r._spielerSagt;
            const gesagt = [];
            r._spielerSagt = function (t) {
                gesagt.push(String(t));
                return sagRoh.call(this, t);
            };
            const klick = () => {
                p._swing = null;
                p._hitStopUntil = 0;
                r._spielerSagtLetzte = null;
                const n0 = treff.length;
                r.tryMouseBreak();
                if (p._swing) {
                    p._swing.lastT = T;
                    for (let k = 0; k < 1200 && p._swing; k++) {
                        T += 0.005;
                        r._tickKampfSchwung(T);
                    }
                }
                return treff.slice(n0).filter((t) => t.c === fR && t.src === "player").length;
            };
            const serieR = (d, dy) => {
                const g0 = gesagt.length;
                let n = 0;
                for (let i = 0; i < 9; i++) {
                    stelle(fR, d, 0, dy);
                    zielen(punkt(fR, null));
                    n += klick();
                }
                return { treffer: n, gesagt: gesagt.slice(g0) };
            };
            try {
                w.z.reich = {
                    klinge: +r._kampfBladeReach().toFixed(2),
                    weit: serieR(1.8, -0.77),
                    nah: serieR(1.3, -0.6),
                    // der Code des Dispatchers ohne Kommentare (die Kommentare zitieren die alte Zahl)
                    toreZahl: (
                        A.prototype.tryMouseBreak
                            .toString()
                            .replace(/\/\/[^\n]*/g, "")
                            .match(/reachMaxM/g) || []
                    ).length,
                };
            } finally {
                r._spielerSagt = sagRoh;
                delete r._spielerSagt;
                parke(fR);
            }
        });
        // (T18) POSE, TREFFER-VOLUMEN UND ICH-SICHT LESEN DENSELBEN SCHWUNG (Posten 2): je Ziel EIN Großschwert-Hieb; im
        // Treffer-Takt steht die Anzeige-Uhr (Hit-Stop ∞), die Pose des Spielers wird gelegt (animatePlayerSoul), die Kamera
        // folgt (_loopCamera). Gemessen gegen das TREFFER-VOLUMEN selbst — die Strecke, die der Sweep der Gestalt reicht
        // (_kreaturGliedTreffer, Strecke a→b): der Abstand der sichtbaren Spitze und der Klingen-Mitte (Ecken des Geräts in
        // Welt, die Spitze am weitesten vom Handgelenk) von ihrer Geraden, und ob Spitze und Mitte im Bild der Ich-Kamera
        // liegen (Spitze UND Mitte). Befund: im Treffer-Takt stand das Großschwert über dem Kopf (ks02), die Ich-Sicht zeigte keine Klinge (ks01).
        await teil("T18", async () => {
            const hP = setze("wesen");
            ausruesten("klinge_grossschwert");
            if (s.blueprints.klinge_grossschwert) r._setBlueprintWear(s.blueprints.klinge_grossschwert, 1);
            // die Studio-Gestalt in der Hand abwarten (die Foundry baut sie; bis dahin trägt der Teile-Bau) — gemessen wird die
            // Klinge, die der Spieler sieht
            for (let i = 0; i < 120 && !(pm.userData.heldMesh && pm.userData.heldMesh.userData.foundryHeld); i++)
                await new Promise((res) => setTimeout(res, 125));
            // die Ich-Regel bleibt rückstandsfrei: 3rd → 1st → 3rd stellt jede Sichtbarkeit des Leibs wieder her, und im 1st
            // zeichnet keine Haut (die Kamera sitzt im Leib) außer dem Gerät in der Hand
            {
                const heldR = pm.userData.heldMesh;
                const unterGeraet = (o) => {
                    for (let n = o; n && n !== pm; n = n.parent) if (n === heldR) return true;
                    return false;
                };
                const sicht = () => {
                    const a = [];
                    pm.traverse((o) => {
                        if (o.isMesh) a.push(o.visible);
                    });
                    return a.join(",");
                };
                r.setCameraMode("third");
                r._loopCamera(T);
                const v3 = sicht();
                r.setCameraMode("first");
                r._loopCamera(T);
                let hautSichtbar = 0;
                pm.traverseVisible((o) => {
                    if (o.isMesh && !unterGeraet(o)) hautSichtbar++;
                });
                r.setCameraMode("third");
                r._loopCamera(T);
                w.z.egoRegel = { rueckstand: sicht() !== v3, hautImErsten: hautSichtbar };
                r.setCameraMode("first");
                r._loopCamera(T);
            }
            // die Strecke der Klinge im Kontakt-Takt: der Kontakt-Richter des Sweeps (Welle LF: _kampfKlingenKontakt —
            // Klinge B → T und das Tier), auf älteren Ständen der Glied-Test der Gestalt (Strecke a → b)
            const naht = fn("_kampfKlingenKontakt") ? "_kampfKlingenKontakt" : "_kreaturGliedTreffer";
            const gtRoh = r[naht];
            let strecke = null;
            r[naht] = function (...arg) {
                const tr = gtRoh.apply(this, arg);
                if (naht === "_kampfKlingenKontakt") {
                    const [, cr, , B, Tt] = arg;
                    if (tr && cr === hP && !strecke)
                        strecke = {
                            a: V3().set(B.x, B.y, B.z),
                            b: V3().set(Tt.x, Tt.y, Tt.z),
                            rad: A._arenaGesetz().schwung.bladeRadiusM,
                        };
                } else {
                    const [cr, ax, ay, az, bx, by, bz, rad] = arg;
                    if (tr && cr === hP && !strecke)
                        strecke = { a: V3().set(ax, ay, az), b: V3().set(bx, by, bz), rad };
                }
                return tr;
            };
            const geraetPunkte = () => {
                const held = pm.userData && pm.userData.heldMesh;
                const rig = pm.userData && pm.userData.rig;
                if (!held || !rig || !rig.armR || !rig.armR.wrist) return null;
                pm.updateMatrixWorld(true);
                const W = rig.armR.wrist.getWorldPosition(V3());
                let tip = null,
                    best = -1;
                const v = V3();
                held.traverse((o) => {
                    const pa = o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                    if (!pa) return;
                    for (let i = 0; i < pa.count; i += Math.max(1, Math.floor(pa.count / 400))) {
                        v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld);
                        const d2 = v.distanceToSquared(W);
                        if (d2 > best) {
                            best = d2;
                            tip = v.clone();
                        }
                    }
                });
                return tip ? { W, T: tip, M: W.clone().add(tip).multiplyScalar(0.5) } : null;
            };
            const abGerade = (q, a, b) => {
                const ab = V3().subVectors(b, a);
                const t = V3().subVectors(q, a).dot(ab) / Math.max(1e-9, ab.lengthSq());
                return V3().copy(a).addScaledVector(ab, t).distanceTo(q);
            };
            const imBild = (q) => {
                const n = q.clone().project(s.camera);
                return Math.abs(n.x) <= 1 && Math.abs(n.y) <= 1 && n.z < 1 && n.z > -1;
            };
            const probe = (d, rotY, seit) => {
                stelle(hP, d, seit);
                hP.rotation.set(0, rotY, 0);
                hP.updateMatrixWorld(true);
                zielen(punkt(hP, null));
                strecke = null;
                p._swing = null;
                p._hitStopUntil = 0;
                const n0 = treff.length;
                if (!r._beginPlayerSwing(r._pickCreatureAtCrosshair()) || !p._swing) return null;
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing && !treff.slice(n0).some((t) => t.c === hP); k++) {
                    T += 0.004;
                    r._tickKampfSchwung(T);
                }
                if (!strecke || !p._swing) return { traf: false };
                // der Treffer-Takt: die Anzeige-Uhr steht, die Pose dieses Takts wird gelegt, die Ich-Kamera folgt
                p._hitStopUntil = Infinity;
                r.animatePlayerSoul(T);
                r._loopCamera(T);
                s.camera.updateMatrixWorld(true);
                const g = geraetPunkte();
                const out = { traf: true };
                if (g) {
                    out.spitzeAb = +abGerade(g.T, strecke.a, strecke.b).toFixed(2);
                    out.mitteAb = +abGerade(g.M, strecke.a, strecke.b).toFixed(2);
                    // die Klinge steht im Bild: Spitze UND Mitte in der Ich-Kamera (die Hand allein ist keine Klinge) — und sie
                    // ZEICHNET: das Gerät und jeder Knoten über ihm bis zur Szene sind sichtbar (die Ich-Sicht verbarg den
                    // ganzen Leib samt der Hand, an der das Gerät hängt)
                    const held = pm.userData.heldMesh;
                    let zeichnet = true;
                    for (let n = held; n && !n.isScene; n = n.parent) if (!n.visible) zeichnet = false;
                    let meshSichtbar = 0;
                    held.traverseVisible((o) => {
                        if (o.isMesh) meshSichtbar++;
                    });
                    out.zeichnet = zeichnet && meshSichtbar > 0;
                    out.imBild = out.zeichnet && imBild(g.T) && imBild(g.M);
                    out.held = held.userData.foundryHeld ? "studio" : "teile";
                    // die Klinge TRIFFT, WO MAN SIE SIEHT: der Spalt zwischen der sichtbaren Klinge (Handgelenk → Spitze) und der
                    // Gestalt des Tiers (seine Glieder-Kapseln) im Treffer-Takt
                    const gl = r._kreaturTrefferGlieder(hP) || [];
                    hP.updateMatrixWorld(true);
                    let spalt = Infinity;
                    for (const gg of gl) {
                        const pa = V3().copy(gg.a).applyMatrix4(gg.anker.matrixWorld);
                        const pb = V3().copy(gg.b).applyMatrix4(gg.anker.matrixWorld);
                        const d = Math.sqrt(
                            r._segSegDistSq(
                                g.W.x,
                                g.W.y,
                                g.W.z,
                                g.T.x,
                                g.T.y,
                                g.T.z,
                                pa.x,
                                pa.y,
                                pa.z,
                                pb.x,
                                pb.y,
                                pb.z
                            )
                        );
                        spalt = Math.min(spalt, d - gg.r * gg.anker.matrixWorld.getMaxScaleOnAxis());
                    }
                    out.spalt = Number.isFinite(spalt) ? +Math.max(0, spalt).toFixed(2) : null;
                    out.rad = strecke.rad;
                }
                p._hitStopUntil = 0;
                p._swing = null;
                r.animatePlayerSoul(T + 0.02);
                return out;
            };
            try {
                w.z.pose = [probe(1.6, 0, 0), probe(1.6, Math.PI / 2, 0), probe(1.8, Math.PI / 2, 0.3)];
            } finally {
                r[naht] = gtRoh;
                delete r[naht];
                p._hitStopUntil = 0;
                p._swing = null;
                parke(hP);
            }
        });
        // (T19) DIE AUSDAUER JE HIEB AUS DER MASSE (Posten 8): im Modus pfad je Gerät EIN Hieb über _beginPlayerSwing bei
        // voller Ausdauer — gemessen, was der Hieb zehrt, und die Masse des Geräts (kampfMasze des Kerns). Befund: 5 je Hieb
        // für Dolch, Großschwert und Keule (flach).
        await teil("T19", async () => {
            const modeA = r.getGameMode();
            r.setGameMode("pfad");
            const zehr = [];
            for (const name of [
                null,
                "klinge_dolch",
                "klinge_langschwert",
                "klinge_grossschwert",
                "klinge_keule",
                "klinge_vorschlaghammer",
            ]) {
                ausruesten(name);
                if (name && s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                p._swing = null;
                p.stamina = 100;
                const ok = r._beginPlayerSwing();
                const km = name && s.blueprints[name] ? r._schmiedeKampfMasze(s.blueprints[name]) : null;
                zehr.push({
                    geraet: name ? name.replace("klinge_", "") : "faust",
                    kg: km ? +km.masseKg.toFixed(3) : 0,
                    zehrt: ok ? +(100 - p.stamina).toFixed(2) : null,
                });
                p._swing = null;
            }
            p.stamina = 100;
            if (r.getGameMode() !== modeA) r.setGameMode(modeA);
            w.z.ausdauer = zehr;
        });
        // (T20) DIE KAMPF-WERTE AUS GATTUNG × GRÖSSE (Posten 6): je Gattung (Fuchs · Wolf · Hirsch · Bär) und Größe (0,62 · 1 ·
        // 2) ein frisches Tier — Biss (damage), Haut (defense), Leben (hpMax) aus computeCreatureStats und die EINE Masse
        // seines Leibs (_leibMasse). Befund: damage 19,75 und defense 11,9 überall, nur hpMax 99,8–158,9.
        await teil("T20", async () => {
            const reihe = [];
            for (const seele of ["fuchs", "wolf", "wesen", "baer"])
                for (const L of [0.62, 1, 2]) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                    const c = r.spawnCreatureAt(
                        pm.position.x + 500,
                        pm.position.y,
                        pm.position.z + 500,
                        "calm",
                        seele,
                        {
                            bodySize: L,
                        }
                    );
                    if (!c) continue;
                    const st0 = r.computeCreatureStats(c).stats;
                    reihe.push({
                        seele,
                        L,
                        kg: +r._leibMasse(c).toFixed(1),
                        damage: +st0.damage.toFixed(2),
                        defense: +st0.defense.toFixed(2),
                        hpMax: +st0.hpMax.toFixed(1),
                    });
                    r.removeCreature(c);
                }
            w.z.kampfWerte = reihe;
        });
        // (T21) DIE GESTALT DES PFEILS AUS DEM SCHMIEDE-KERN (Posten 4): ein Schuss mit dem Langbogen — gezählt, was fliegt
        // (Teile, beleuchteter Stoff, Schatten, Länge längs der Flug-Richtung), dazu die Quelle: der Wirt baut keinen eigenen
        // Zylinder, die Prüfstand-Shell keinen eigenen Pfeil. Befund: ein brauner MeshBasic-Zylinder ohne Spitze und Federn.
        await teil("T21", async () => {
            ausruesten("klinge_langbogen");
            const recP = fn("_heldBogenRecipe") ? r._heldBogenRecipe() : null;
            const pfeilAus = { teile: 0, unbeleuchtet: 0, wirft: 0, laenge: null, farben: 0 };
            if (recP) {
                const n0 = (s._pfeile || []).length;
                p._shotCooldownUntil = 0;
                r._beginPlayerShot(recP, 1);
                const pf = (s._pfeile || [])[n0];
                if (pf && pf.mesh) {
                    pf.mesh.updateMatrixWorld(true);
                    const inv = new THREE.Matrix4().copy(pf.mesh.matrixWorld).invert();
                    const box = new THREE.Box3().makeEmpty();
                    const bb = new THREE.Box3();
                    const farben = new Set();
                    pf.mesh.traverse((o) => {
                        if (!o.isMesh) return;
                        pfeilAus.teile++;
                        if (o.material && o.material.isMeshBasicMaterial) pfeilAus.unbeleuchtet++;
                        if (o.castShadow) pfeilAus.wirft++;
                        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
                        box.union(
                            bb
                                .copy(o.geometry.boundingBox)
                                .applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld))
                        );
                        const c = o.geometry.attributes.color;
                        if (c) farben.add([c.getX(0), c.getY(0), c.getZ(0)].map((x) => x.toFixed(2)).join("/"));
                    });
                    pfeilAus.laenge = +(box.max.z - box.min.z).toFixed(3);
                    pfeilAus.farben = farben.size;
                }
                if (pf) {
                    r._pfeilDespawn(pf);
                    s._pfeile.splice(s._pfeile.indexOf(pf), 1);
                }
            }
            pfeilAus.wirtZylinder = /CylinderGeometry\(0\.015/.test(A.prototype._pfeilMeshAttach.toString());
            // ein leerer Guss bricht laut (Nachbesserung 2): der Ofen liefert nichts (_foundryBuildGroup ≡ null, die Vorlage frisch) —
            // der Pfeil darf nicht still unsichtbar fliegen
            if (fn("_pfeilVorlage")) {
                const memo = r._pfeilVorlageMemo;
                const fbg = r._foundryBuildGroup;
                r._pfeilVorlageMemo = null;
                r._foundryBuildGroup = () => null;
                try {
                    r._pfeilMeshAttach({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 1 });
                    pfeilAus.leerStill = true;
                } catch (_e) {
                    pfeilAus.leerStill = false;
                } finally {
                    r._foundryBuildGroup = fbg;
                    delete r._foundryBuildGroup;
                    r._pfeilVorlageMemo = memo;
                }
            }
            w.z.pfeilGestalt = pfeilAus;
        });
        // (T22) EIN TIER STIRBT WIE EIN TIER (Posten 7): ein Hirsch auf geneigtem Boden, das Gefälle LÄNGS seiner Leibes-Achse
        // (die Befund-Lage ks09: er blickt hangab) — die Naht `_fieldGradient` trägt das Gefälle (0,3 längs der Achse); dann der
        // Tod und der Kreatur-Takt. Gemessen: wohin die Leibes-Achse (vorn, lokal +z) und die Hochachse nach dem Kippen zeigen,
        // und ob der Leib 10 s danach noch liegt. Befund: der Hirsch richtete sich auf das Hinterteil auf (Kopf senkrecht) und war
        // nach 22 Takten fort.
        await teil("T22", async () => {
            const hT = setze("wesen");
            stelle(hT, 20, 6);
            hT.userData.bornAt = 1; // der Älteste der Welt — wählt der Lebenszyklus nach dem Tod noch ihn?
            const gier = 0.7;
            hT.rotation.set(0, gier, 0);
            hT.updateMatrixWorld(true);
            const fgRoh = r._fieldGradient;
            r._fieldGradient = function () {
                // das Gefälle zeigt hangab = längs der Leibes-Achse (die Außen-Normale neigt sich nach vorn)
                return { x: Math.sin(gier) * 0.3, y: 1, z: Math.cos(gier) * 0.3 };
            };
            let tod = null;
            try {
                r.damageCreature(hT, 1e9, { source: "world" });
            } finally {
                r._fieldGradient = fgRoh;
                delete r._fieldGradient;
            }
            const K = A._arenaGesetz().gefuehl;
            for (let k = 0; k < Math.ceil((K.kippDauerSec + 0.2) / 0.05); k++) r.updateCreatures(0.05);
            hT.updateMatrixWorld(true);
            const q = hT.getWorldQuaternion(new THREE.Quaternion());
            const vorn = V3().set(0, 0, 1).applyQuaternion(q);
            const oben = V3().set(0, 1, 0).applyQuaternion(q);
            tod = { vornY: +vorn.y.toFixed(2), obenY: +oben.y.toFixed(2) };
            // DER MEHRSPIELER-STROM (Nachbesserung 3): der Takt des Senders, sein Strom an einen Mitspieler (dieselbe Seite als
            // Empfänger, `_p2pHandleCreaturePos`) und dessen Sicht-Takt — die Kopie liegt, wie der Leib liegt, die ganze Zeit
            const sent = [];
            const sendRoh = r.p2pSend;
            r.p2pSend = (m) => sent.push(m);
            const peer = "kg-peer";
            const kopie = { imStrom: 0, proben: 0, obenMax: -Infinity };
            try {
                for (let k = 0; k < 200; k++) {
                    r.updateCreatures(0.05); // 10 s danach
                    if (k % 20 !== 19) continue;
                    sent.length = 0;
                    r._p2pBroadcastCreatures();
                    const msg = sent.find((m) => m && m.type === "creature-pos");
                    if (msg) r._p2pHandleCreaturePos(peer, msg);
                    for (let f = 0; f < 30; f++) r._p2pTickRemoteCreatures(k * 0.05 + f / 60, 1 / 60);
                    kopie.proben++;
                    const id = hT.userData.netId;
                    if (msg && msg.list.some((e) => e.id === id)) kopie.imStrom++;
                    const rc = s.p2p.remoteCreatures.get(peer + ":" + id);
                    if (rc && rc.mesh) {
                        rc.mesh.updateMatrixWorld(true);
                        const qk = rc.mesh.getWorldQuaternion(new THREE.Quaternion());
                        kopie.obenMax = Math.max(kopie.obenMax, V3().set(0, 1, 0).applyQuaternion(qk).y);
                    }
                }
            } finally {
                r.p2pSend = sendRoh;
                if (r.p2pSend === A.prototype.p2pSend) delete r.p2pSend;
                for (const [key, rc] of s.p2p.remoteCreatures)
                    if (rc.peerId === peer) r._disposeRemoteCreature(key, rc);
            }
            tod.stromAnteil = kopie.proben ? +(kopie.imStrom / kopie.proben).toFixed(2) : 0;
            tod.kopieOben = Number.isFinite(kopie.obenMax) ? +kopie.obenMax.toFixed(2) : null;
            tod.liegt10s = !!hT.parent && !!hT.userData.dying;
            // DER LEICHNAM IST KEIN WESEN (Nachbesserung 2 + 3): er steht nicht in der Liste der Wesen; das Fadenkreuz auf ihm
            // wählt ihn nicht, er belegt keinen Platz der Kappe (ein Spawn bei maxCreatures = alle Leiber samt Leichnam gelingt),
            // der Nexus zählt ihn nicht, der Lebenszyklus wählt ihn nicht als Ältesten, findNearestCreature nicht als Nächsten;
            // und kein Leser fragt selbst nach dem Sterben (die Frage lebt nur im Tod, im Leichnam-Takt und im Schadens-Tor)
            tod.unterWesen = s.creatures.indexOf(hT) !== -1;
            tod.aeltester = r._findOldestCreature() === hT;
            tod.naechster = r.findNearestCreature(hT.position, 3) === hT;
            const ohneKommentar = (f) =>
                String(f)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");
            const FRAGT_ERLAUBT = new Set(["damageCreature", "_creatureCombatDeath", "_tickLeichname"]);
            // über die Deskriptoren (nie A.prototype[n]: ein Getter liefe mit dem Prototyp als this und legte seinen Cache dort ab)
            tod.fragen = Object.getOwnPropertyNames(A.prototype).filter((n) => {
                const d = Object.getOwnPropertyDescriptor(A.prototype, n);
                return (
                    n !== "constructor" &&
                    !FRAGT_ERLAUBT.has(n) &&
                    d &&
                    typeof d.value === "function" &&
                    /\.dying\b/.test(ohneKommentar(d.value))
                );
            });
            if (tod.liegt10s) {
                zielen(punkt(hT, null));
                const pick = r._pickCreatureAtCrosshair();
                tod.zielLeichnam = !!(pick && pick.creature === hT);
                const cap0 = s.maxCreatures;
                s.maxCreatures = s.creatures.length + (s.leichname || []).length;
                const neuS = r.spawnCreatureAt(
                    pm.position.x + 300,
                    pm.position.y,
                    pm.position.z + 310,
                    "happy",
                    "wolf"
                );
                s.maxCreatures = cap0;
                tod.platzFrei = !!neuS;
                if (neuS) r.removeCreature(neuS);
                const lebend = s.creatures.filter((c) => c && c.userData && !c.userData.dying).length;
                tod.nexusZaehlt = r.dslConditions.creatures_count_above([lebend], { state: s }) === true;
            }
            w.z.tod = tod;
            if (hT.parent) r.removeCreature(hT);
        });
        // (T25) DIE WUNDE REIST ALS ANTEIL DES LEBENS (Nachbesserung 2, Posten 6): ein Hirsch (1,0) und ein Bär (1,75) — ein Stand von vor
        // dem Massen-Gesetz trug hp absolut gegen das Leben der Substanz (der Leib ohne Volumen rechnet es noch: leibV = 0);
        // voll gespeichert kehrt er voll zurück, halb verwundet halb; ein neuer Stand mit 30 % Leben kehrt mit 30 % zurück.
        // Befund Gegenprüfung 1: ein voller Hirsch stand nach dem Reload bei 124/168, ein voller Bär bei 159/391.
        await teil("T25", async () => {
            const wunde = [];
            for (const [seele, L] of [
                ["wesen", 1],
                ["baer", 1.75],
            ]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
                const c = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 320, "happy", seele, {
                    bodySize: L,
                });
                if (!c) continue;
                const tb = c.userData._tierBaum;
                const lv = tb.leibV;
                tb.leibV = 0;
                const hpAlt = r.computeCreatureStats(c).stats.hpMax; // das Leben vor dem Massen-Gesetz
                tb.leibV = lv;
                const zurueck = (snap) => {
                    const c2 = r._restoreCreatureFromSnapshot(snap, "happy");
                    const q = c2 ? +(c2.userData.hp / c2.userData.hpMax).toFixed(3) : null;
                    if (c2) r.removeCreature(c2);
                    return q;
                };
                const roh = r._serializeCreature(c);
                const alt = (hp) => {
                    const o = JSON.parse(JSON.stringify(roh));
                    delete o.hpAnteil;
                    o.hp = hp;
                    return o;
                };
                c.userData.hp = 0.3 * c.userData.hpMax;
                const neu30 = r._serializeCreature(c);
                r.removeCreature(c);
                wunde.push({
                    seele: seele + "@" + L,
                    hpAlt: +hpAlt.toFixed(1),
                    altVoll: zurueck(alt(+hpAlt.toFixed(2))),
                    altHalb: zurueck(alt(+(0.5 * hpAlt).toFixed(2))),
                    neu30: zurueck(neu30),
                });
            }
            w.z.wunde = wunde;
        });
        // (T23) DER BISS TRIFFT, WO DIE GESTE SCHNAPPT (Posten 5): alle drei Biss-Wege im ECHTEN Kreatur-Takt (updateCreatures,
        // 1/60 s) — ein Wolf jagt den stehenden Spieler (6 m vor ihm), ein Wolf beißt ein Kitz 1,5 m vor seiner Schnauze (der
        // Beute-Biss, _tickCreatureScentStrike), ein Bär wehrt sich gegen Hiebe aus 1,6 m (die Gegenwehr). Gemessen im Biss-Takt
        // (damagePlayer / damageCreature): die Geste des Beißers (seine laufende Aktion) und der Spalt zwischen seinem KOPF
        // (die Treffer-Glieder der Zone kopf, die Gestalt) und dem Leib des Gebissenen (die Kapsel des Spielers / die Glieder
        // des Tiers), dazu der Abstand der Mitten. Befund K-D13: 12 Bisse am stehenden Spieler, 9 ohne Geste, aus 1,36–2,39 m XZ.
        await teil("T23", async () => {
            const kopfKapseln = (c) => {
                c.updateMatrixWorld(true);
                return (r._kreaturTrefferGlieder(c) || [])
                    .filter((g) => g.zone === "kopf")
                    .map((g) => ({
                        a: g.a.clone().applyMatrix4(g.anker.matrixWorld),
                        b: g.b.clone().applyMatrix4(g.anker.matrixWorld),
                        r: g.r * g.anker.matrixWorld.getMaxScaleOnAxis(),
                    }));
            };
            const abst = (a, b, c2, d) =>
                Math.sqrt(r._segSegDistSq(a.x, a.y, a.z, b.x, b.y, b.z, c2.x, c2.y, c2.z, d.x, d.y, d.z));
            const spaltSpieler = (c) => {
                // die Achse der Spieler-Kapsel zwischen ihren Kappen (Fuß + Radius … Saum − Radius)
                const rK = A.PLAYER_WALL_RADIUS;
                const P0 = V3().set(pm.position.x, pm.position.y - A.PLAYER_FOOT_OFFSET + rK, pm.position.z);
                const P1 = V3().set(
                    pm.position.x,
                    pm.position.y + A.PLAYER_FOOT_OFFSET + A.PLAYER_STEP_UP - rK,
                    pm.position.z
                );
                let m = Infinity;
                for (const k of kopfKapseln(c)) m = Math.min(m, abst(k.a, k.b, P0, P1) - k.r - A.PLAYER_WALL_RADIUS);
                return m;
            };
            const spaltTier = (c, z) => {
                const K = kopfKapseln(c);
                z.updateMatrixWorld(true);
                let m = Infinity;
                for (const g of r._kreaturTrefferGlieder(z) || []) {
                    const pa = g.a.clone().applyMatrix4(g.anker.matrixWorld);
                    const pb = g.b.clone().applyMatrix4(g.anker.matrixWorld);
                    const rg = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
                    for (const k of K) m = Math.min(m, abst(k.a, k.b, pa, pb) - k.r - rg);
                }
                return m;
            };
            const geste = (c) => {
                const a = c.userData._verhaltenAktion;
                return a && s.creatureAnimationTime < a.bis ? a.name : "keine";
            };
            const xz = (a, b) => +Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z).toFixed(2);
            const neu = (seele, x, z, L) => {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
                const c = r.spawnCreatureAt(x, pm.position.y, z, "calm", seele, { bodySize: L });
                if (!c) return null;
                tiere.push(c);
                c.position.set(x, fussY(), z);
                c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                c.userData.fearUntil = 0;
                c.userData.hp = 1e6;
                c.updateMatrixWorld(true);
                return c;
            };
            const bisse = { jagd: [], beute: [], gegenwehr: [] };
            const mitBiss = { spieler: null, tier: null, kitz: null };
            const dpGate = r.damagePlayer;
            const dcGate = r.damageCreature;
            r.damagePlayer = function (amount, source) {
                const c = mitBiss.spieler;
                if (c && (source === "jagd" || source === "gegenwehr"))
                    bisse[source].push({ geste: geste(c), spalt: +spaltSpieler(c).toFixed(3), xz: xz(c, pm) });
                return dpGate.call(this, amount, source);
            };
            r.damageCreature = function (c2, amount, opts) {
                const j = mitBiss.tier;
                if (j && c2 === mitBiss.kitz && opts && opts.source === "jagd")
                    bisse.beute.push({ geste: geste(j), spalt: +spaltTier(j, c2).toFixed(3), xz: xz(j, c2) });
                return dcGate.call(this, c2, amount, opts);
            };
            const savedT23 = {
                mode: r.getGameMode(),
                hp: p.hp,
                gnade: p.respawnGraceUntil,
                ort: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
            };
            // der Spieler steht auf dem Boden (seine Füße auf der Höhe, auf der auch die Tiere stehen)
            const P = {
                x: pm.position.x,
                y: r.getTerrainHeightAt(pm.position.x, pm.position.z) + A.PLAYER_FOOT_OFFSET,
                z: pm.position.z,
            };
            const halte = () => {
                pm.position.set(P.x, P.y, P.z);
                s.playerVel.setValue(0, s.playerVel.y(), 0);
                p.hp = 1e9;
                p.respawnGraceUntil = -Infinity;
            };
            // der Takt des Spiels: der Kreatur-Takt, dann der feste Sim-Schritt der Leiber (der getragene Stoß, Leib an Leib)
            const tickT23 = () => {
                halte();
                r.updateCreatures(1 / 60);
                r._kreaturStossSchritt(1 / 60);
                r._leibKontakte();
            };
            try {
                r.setGameMode("pfad");
                for (const c of tiere) if (c.parent) parke(c);
                // (a) die Jagd auf den stehenden Spieler
                const wolf = neu("wolf", P.x + 0.4, P.z + 6, 1);
                if (wolf) {
                    wolf.rotation.set(0, Math.PI, 0);
                    mitBiss.spieler = wolf;
                    for (let k = 0; k < 1500 && bisse.jagd.length < 3; k++) tickT23();
                    mitBiss.spieler = null;
                    r.removeCreature(wolf);
                }
                // (b) der Beute-Biss: ein Wolf, das Kitz 1,5 m vor ihm (40 m vom Spieler — er jagt das Kitz, nicht ihn)
                const jaeger = neu("wolf", P.x + 40, P.z + 40, 1);
                const kitz = neu("wesen", P.x + 40, P.z + 41.5, 0.6);
                if (jaeger && kitz) {
                    jaeger.rotation.set(0, 0, 0);
                    kitz.rotation.set(0, Math.PI / 2, 0);
                    mitBiss.tier = jaeger;
                    mitBiss.kitz = kitz;
                    const K0 = { x: kitz.position.x, y: kitz.position.y, z: kitz.position.z };
                    const J0 = { x: jaeger.position.x, y: jaeger.position.y, z: jaeger.position.z };
                    // je Versuch: der Wolf steht wieder 1,5 m vor dem Kitz (ruhend, ihm zugewandt), seine Biss-Uhr ist frei;
                    // der Takt läuft, bis der Ansprung endet (das Kitz hält still)
                    for (let a = 0; a < 6 && bisse.beute.length < 2; a++) {
                        jaeger.position.set(J0.x, J0.y, J0.z);
                        jaeger.rotation.set(0, 0, 0);
                        jaeger.userData._steuer = null;
                        jaeger.userData._stossV = null;
                        jaeger.userData.nextHuntStrikeAt = 0;
                        jaeger.userData._verhaltenAktion = null;
                        jaeger.userData._hopH = 0;
                        jaeger.userData._hopV = 0;
                        for (let k = 0; k < 90; k++) {
                            kitz.position.set(K0.x, kitz.position.y, K0.z);
                            kitz.userData._stossV = null;
                            kitz.userData.hp = 1e6;
                            kitz.userData.fearUntil = 0;
                            if (k === 0) r._tickCreatureScentStrike(jaeger);
                            tickT23();
                        }
                    }
                    mitBiss.tier = null;
                }
                if (jaeger) r.removeCreature(jaeger);
                if (kitz) r.removeCreature(kitz);
                // (b2) das stehende Reh (Nachbesserung 2): ein Wolf, ein Reh (Größe 0,8) breitseits vor ihm — sechs Ansprünge aus der
                // Ruhe (drei aus 1,6 m, drei aus 1,3 m, wo die Hetze hält), je 90 Takte; gezählt Ansprünge, Bisse und die Takte,
                // in denen das Ziel der Kopf-Neigung an der Klemme des Bisses (BISS.kopfNeigung) steht (Bericht: der Kopf
                // schwang über, solange sein Rest sich je Takt auf das Ziel des Vor-Takts summierte)
                await teil("T24 Reh", async () => {
                    const reh = { versuche: 6, anspruenge: 0, bisse: 0, takte: 0, klemme: 0, je: {} };
                    const j2 = neu("wolf", P.x - 40, P.z + 40, 1);
                    const r2 = neu("wesen", P.x - 40, P.z + 41.6, 0.8);
                    // der Ort: trockener Boden für beide (im Wasser schwämme das Reh mit der Wasserlinie an der Schulter), auf dem
                    // die Boden-Karte des Chunks (die Sicht, auf der ein Tier steht — _standSicht) beim Gesetz liegt: wo sie
                    // tiefer liegt, stünde das Reh tiefer als der Wolf (headless an der ersten Probe 0,94 m)
                    const trocken = (c, x, z) => {
                        const gy = r.getTerrainHeightAt(x, z);
                        c.position.set(x, gy, z);
                        return (
                            r._kreaturSchwimmt(c, r._creatureGroundY(c)) === null &&
                            Math.abs(r._standSicht(x, z, gy, false) - gy) < 0.15
                        );
                    };
                    const ortR = [
                        [-14, 14],
                        [14, -14],
                        [-14, -14],
                        [14, 14],
                        [-40, 40],
                        [40, -40],
                        [-40, -40],
                        [70, 0],
                        [0, 70],
                        [-70, 0],
                    ].find(
                        ([ox, oz]) =>
                            j2 &&
                            r2 &&
                            trocken(r2, P.x + ox, P.z + oz + 1.6) &&
                            trocken(j2, P.x + ox, P.z + oz) &&
                            trocken(j2, P.x + ox, P.z + oz + 0.3)
                    );
                    if (j2 && r2 && ortR) {
                        const R0 = { x: P.x + ortR[0], z: P.z + ortR[1] + 1.6 };
                        r2.position.set(R0.x, r.getTerrainHeightAt(R0.x, R0.z), R0.z);
                        r2.rotation.set(0, Math.PI / 2, 0);
                        const J0 = { x: R0.x, y: r.getTerrainHeightAt(R0.x, R0.z - 1.6), z: R0.z - 1.6 };
                        j2.position.set(J0.x, J0.y, J0.z);
                        // beide stehen erst (die Erdung des Takts), der Wolf ohne Ansprung
                        j2.userData.nextHuntStrikeAt = Infinity;
                        for (let k = 0; k < 30; k++) {
                            r2.position.x = R0.x;
                            r2.position.z = R0.z;
                            tickT23();
                        }
                        reh.boden = {
                            ort: ortR,
                            reh: +(r2.position.y - r.getTerrainHeightAt(R0.x, R0.z)).toFixed(2),
                            wolf: +(j2.position.y - r.getTerrainHeightAt(j2.position.x, j2.position.z)).toFixed(2),
                        };
                        const KN = A._bissGesetz().kopfNeigung;
                        const dcT = r.damageCreature;
                        r.damageCreature = function (c2, amount, opts) {
                            if (c2 === r2 && opts && opts.source === "jagd") reh.bisse++;
                            return dcT.call(this, c2, amount, opts);
                        };
                        try {
                            for (let a = 0; a < reh.versuche; a++) {
                                // drei Ansprünge aus 1,6 m, drei aus 1,3 m (dort hält die Hetze: der Spalt ist die halbe Weite)
                                const dist = a < reh.versuche / 2 ? 1.6 : 1.3;
                                const zeile = reh.je[dist] || (reh.je[dist] = { anspruenge: 0, bisse: 0 });
                                const b0 = reh.bisse,
                                    n0 = reh.anspruenge;
                                j2.position.set(J0.x, r.getTerrainHeightAt(J0.x, R0.z - dist), R0.z - dist);
                                j2.rotation.set(0, 0, 0);
                                Object.assign(j2.userData, {
                                    _steuer: null,
                                    _stossV: null,
                                    nextHuntStrikeAt: 0,
                                    _verhaltenAktion: null,
                                    _hopH: 0,
                                    _hopV: 0,
                                });
                                let letzte = null;
                                for (let k = 0; k < 90; k++) {
                                    r2.position.set(R0.x, r2.position.y, R0.z);
                                    Object.assign(r2.userData, { _stossV: null, _steuer: null, hp: 1e6, fearUntil: 0 });
                                    if (k === 0) r._tickCreatureScentStrike(j2);
                                    tickT23();
                                    const VA = j2.userData._verhaltenAktion;
                                    if (!(VA && VA.bissAkt && s.creatureAnimationTime < VA.bis)) continue;
                                    if (VA !== letzte) {
                                        letzte = VA;
                                        reh.anspruenge++;
                                    }
                                    // die Höhe des Ansprungs (Bericht: der Freude-Hüpfer 0,8 / 1,2 m oder so hoch wie das Ziel)
                                    reh.hubMaxM = Math.max(reh.hubMaxM || 0, +(j2.userData._hopH || 0).toFixed(3));
                                    if (VA.biss && Number.isFinite(VA.kopfZiel)) {
                                        reh.takte++;
                                        if (VA.kopfZiel <= KN[0] + 1e-6 || VA.kopfZiel >= KN[1] - 1e-6) reh.klemme++;
                                    }
                                }
                                zeile.anspruenge += reh.anspruenge - n0;
                                zeile.bisse += reh.bisse - b0;
                            }
                        } finally {
                            r.damageCreature = dcT;
                        }
                    }
                    // DIE REST-SUMME (Nachbesserung 3, deterministisch): der Wolf 1,3 m vor dem Reh in der Stand-Pose, eine Biss-Geste
                    // offen; zehnmal das Zielen des Kopfs (_kreaturBissKopf) ohne Takt dazwischen — die gezeigte Pose steht still
                    if (j2 && r2 && ortR && j2.userData._tierBaum) {
                        const R0 = { x: P.x + ortR[0], z: P.z + ortR[1] + 1.6 };
                        r2.position.set(R0.x, r.getTerrainHeightAt(R0.x, R0.z), R0.z);
                        j2.position.set(R0.x, r.getTerrainHeightAt(R0.x, R0.z - 1.3), R0.z - 1.3);
                        j2.rotation.set(0, 0, 0);
                        const gang = j2.userData._tierBaum._gang || (j2.userData._tierBaum._gang = {});
                        gang.bissKopf = 0;
                        gang.bissRumpf = 0;
                        j2.updateMatrixWorld(true);
                        r2.updateMatrixWorld(true);
                        const VA = { biss: { ziel: r2 }, kopfZiel: 0, rumpfZiel: 0 };
                        const m = r._kreaturMaul(j2, {});
                        const reihe = [];
                        if (m)
                            for (let k = 0; k < 10; k++) {
                                r._kreaturBissKopf(j2, VA, m, r2);
                                reihe.push(+VA.kopfZiel.toFixed(4));
                            }
                        if (reihe.length)
                            reh.kopfSumme = {
                                takte: reihe.length,
                                rest: reihe[0],
                                drift: +(Math.max(...reihe) - Math.min(...reihe)).toFixed(6),
                                reihe: reihe.slice(0, 4),
                            };
                    }
                    if (j2) r.removeCreature(j2);
                    if (r2) r.removeCreature(r2);
                    w.z.bissReh = reh;
                });
                // (c) die Gegenwehr: ein Bär wird aus 1,6 m geschlagen (Breitseite, wie T5), dann läuft der Takt 1 s
                const baer = neu("baer", P.x, P.z + 1.6, 1);
                if (baer) {
                    mitBiss.spieler = baer;
                    for (let h = 0; h < 30 && bisse.gegenwehr.length < 2; h++) {
                        stelle(baer, 1.6);
                        baer.userData._stossV = null;
                        dcGate.call(r, baer, 5, {
                            source: "player",
                            fromPos: { x: P.x, y: P.y, z: P.z },
                            knockback: 16,
                        });
                        for (let k = 0; k < 60; k++) tickT23();
                    }
                    mitBiss.spieler = null;
                    r.removeCreature(baer);
                }
                // (T24) DER BISS KOSTET, WAS IN REICHWEITE STEHT, UND SPRINGT NIE INS LEERE (Nachbesserung 2):
                // (a) die Kosten — ein Wolf, 15 Beutetiere 8–28 m um ihn (keines in der Weite seines Ansprungs): je Beute-Biss-
                // Takt gezählt, wie viele Gestalten er rechnet (_kreaturBissRadial auf ein Tier), dazu die Zeit je Takt (Bericht)
                const reich = {
                    gestaltenJeTakt: null,
                    msJeTakt: null,
                    simsAnspruenge: null,
                    simsSek: 10,
                    kaltZerlegt: null,
                };
                await teil("T24", async () => {
                    // (c) DIE KALTE GATTUNG (Nachbesserung 3, Lehre 14): ein Wolf und ein Fuchs 35 m vor ihm, beide Gattungen kalt
                    // (wie eine Gattung, die nie nah beim Spieler stand — das Namen-Memo vergessen, danach wiederhergestellt);
                    // gezählt, wie oft die Wahl der Beute eine Gestalt synchron zerlegt (_kreaturGliederGruppen) und wie viele
                    // Vertices. Befund Gegenprüfung 2: das Maul des Jägers (Wolf 29 987 Vertices) und die Gestalt der Beute (Fuchs
                    // 31 405) — 12,4 und 3,1 ms im Kreatur-Takt, an der Bake-Uhr vorbei
                    {
                        const J1 = { x: P.x + 60, z: P.z - 60 };
                        const wolfC = neu("wolf", J1.x, J1.z, 1);
                        const fuchsC = neu("fuchs", J1.x + 35, J1.z, 1);
                        if (wolfC && fuchsC) {
                            wolfC.position.y = r.getTerrainHeightAt(J1.x, J1.z);
                            fuchsC.position.y = r.getTerrainHeightAt(J1.x + 35, J1.z);
                            const memo = r._trefferGliedNamen || new Map();
                            const gesichert = new Map();
                            for (const c of [wolfC, fuchsC]) {
                                const g = r._kreaturGattung(c);
                                if (memo.has(g)) gesichert.set(g, memo.get(g));
                                memo.delete(g);
                                delete c.userData._trefferGlieder;
                            }
                            const grRoh = r._kreaturGliederGruppen;
                            let zerlegt = 0,
                                verts = 0;
                            r._kreaturGliederGruppen = function (cr) {
                                zerlegt++;
                                const G = grRoh.call(this, cr);
                                if (G) for (const [, g] of G.gruppen) verts += g.verts || 0;
                                return G;
                            };
                            try {
                                wolfC.userData.nextHuntStrikeAt = 0;
                                wolfC.userData._verhaltenAktion = null;
                                r._tickCreatureScentStrike(wolfC);
                            } finally {
                                r._kreaturGliederGruppen = grRoh;
                                delete r._kreaturGliederGruppen;
                                for (const [g, n] of gesichert) memo.set(g, n);
                            }
                            reich.kaltZerlegt = zerlegt;
                            reich.kaltVerts = verts;
                        }
                        if (wolfC) r.removeCreature(wolfC);
                        if (fuchsC) r.removeCreature(fuchsC);
                    }
                    {
                        const J0 = { x: P.x - 60, z: P.z - 60 };
                        const wolfK = neu("wolf", J0.x, J0.z, 1);
                        const schar = [];
                        for (let i = 0; i < 15 && wolfK; i++) {
                            const a = (i / 15) * Math.PI * 2,
                                d = 8 + (i % 5) * 5;
                            const x = J0.x + Math.sin(a) * d,
                                z = J0.z + Math.cos(a) * d;
                            const c = neu(i % 3 ? "wesen" : "fuchs", x, z, 0.8);
                            if (!c) continue;
                            c.position.y = r.getTerrainHeightAt(x, z);
                            schar.push(c);
                        }
                        if (wolfK && schar.length === 15) {
                            wolfK.position.y = r.getTerrainHeightAt(J0.x, J0.z);
                            for (const c of [wolfK, ...schar]) c.updateMatrixWorld(true);
                            reich.beute = schar.filter((o) => r._kreaturIstBeute(wolfK, o)).length;
                            const radRoh = r._kreaturBissRadial;
                            let gestalten = 0;
                            r._kreaturBissRadial = function (c2, z2, m2) {
                                if (z2) gestalten++;
                                return radRoh.call(this, c2, z2, m2);
                            };
                            const takt = () => {
                                wolfK.userData.nextHuntStrikeAt = 0;
                                wolfK.userData._verhaltenAktion = null;
                                r._tickCreatureScentStrike(wolfK);
                            };
                            try {
                                for (let k = 0; k < 20; k++) takt();
                                gestalten = 0;
                                const N = 200;
                                const t0 = performance.now();
                                for (let k = 0; k < N; k++) takt();
                                reich.msJeTakt = +((performance.now() - t0) / N).toFixed(4);
                                reich.gestaltenJeTakt = gestalten / N;
                            } finally {
                                r._kreaturBissRadial = radRoh;
                            }
                        }
                        for (const c of schar) r.removeCreature(c);
                        if (wolfK) r.removeCreature(wolfK);
                    }
                    // (b) der Sims — auf trockenem Boden neben der Plattform (der erste Ort, an dem weder der Wolf noch der Fuß des
                    // Sims im Wasser steht) steht der Spieler 3,5 m über dem Boden, ein Wolf jagt ihn wie in (a): 10 s im Takt,
                    // gezählt jeder Ansprung; je Takt die Höhe der Füße über Kopf plus Sprung (das Kleinste zählt — so hoch reicht
                    // der Wolf nie); die Gegenprobe: waagrecht steht er in der Weite seines Ansprungs (ohne die Höhe spränge er)
                    {
                        const P0 = { x: P.x, y: P.y, z: P.z };
                        const wolfS = neu("wolf", P.x + 0.4, P.z + 6, 1);
                        const trocken = (x, z) => {
                            wolfS.position.set(x, r.getTerrainHeightAt(x, z), z);
                            return r._kreaturSchwimmt(wolfS, r._creatureGroundY(wolfS)) === null;
                        };
                        const ort = wolfS
                            ? [
                                  [40, 40],
                                  [-40, 40],
                                  [40, -40],
                                  [-40, -40],
                                  [70, 0],
                                  [0, 70],
                              ].find(
                                  ([ox, oz]) => trocken(P0.x + ox, P0.z + oz) && trocken(P0.x + ox + 0.4, P0.z + oz + 6)
                              )
                            : null;
                        if (wolfS && ort) {
                            P.x = P0.x + ort[0];
                            P.z = P0.z + ort[1];
                            P.y = r.getTerrainHeightAt(P.x, P.z) + A.PLAYER_FOOT_OFFSET + 3.5;
                            halte();
                            wolfS.position.set(P.x + 0.4, r.getTerrainHeightAt(P.x + 0.4, P.z + 6), P.z + 6);
                            wolfS.rotation.set(0, Math.PI, 0);
                            wolfS.userData._steuer = null;
                            let letzte = null,
                                n = 0,
                                minWaag = Infinity,
                                minUeber = Infinity;
                            const zustaende = new Set();
                            try {
                                for (let k = 0; k < reich.simsSek * 60; k++) {
                                    tickT23();
                                    const VA = wolfS.userData._verhaltenAktion;
                                    if (VA && VA.bissAkt && VA !== letzte) {
                                        letzte = VA;
                                        n++;
                                    }
                                    zustaende.add(wolfS.userData._motionZustand || "–");
                                    const w2 = r._kreaturBissRadial(wolfS, null);
                                    if (w2 !== null && w2 < minWaag) minWaag = w2;
                                    const m = r._kreaturMaul(wolfS, {});
                                    const hop = A._bissGesetz().geste.hop ? r._kreaturSprungHoehe(wolfS) : 0;
                                    if (m && !(wolfS.userData._hopH > 0))
                                        minUeber = Math.min(
                                            minUeber,
                                            r._spielerKapsel({}).y0 - (Math.max(m.ay, m.by) + m.r + hop)
                                        );
                                }
                                reich.simsUeber = +minUeber.toFixed(2);
                                reich.simsAnspruenge = n;
                                reich.simsWaagrecht = +minWaag.toFixed(2);
                                reich.simsReich = +r._kreaturBissReich(wolfS).toFixed(2);
                                reich.simsZustaende = [...zustaende];
                            } finally {
                                Object.assign(P, P0);
                                halte();
                            }
                        }
                        if (wolfS) r.removeCreature(wolfS);
                    }
                });
                w.z.bissReich = reich;
            } finally {
                r.damagePlayer = dpGate;
                r.damageCreature = dcGate;
                halte();
                pm.position.set(savedT23.ort.x, savedT23.ort.y, savedT23.ort.z);
                p.hp = savedT23.hp;
                p.respawnGraceUntil = savedT23.gnade;
                if (r.getGameMode() !== savedT23.mode) r.setGameMode(savedT23.mode);
            }
            w.z.bissGeste = bisse;
        });
    } catch (e) {
        w.fehler.push("ABBRUCH " + ((e && e.stack) || String(e)).split("\n").slice(0, 3).join(" | "));
    } finally {
        r.damageCreature = orig.damageCreature;
        r._kampfHitJuice = orig.juice;
        r._beginPlayerSwing = orig.swing;
        r.dslRun = orig.dsl;
        r.damagePlayer = orig.damagePlayer;
        delete r.damageCreature;
        delete r._kampfHitJuice;
        delete r._beginPlayerSwing;
        delete r.dslRun;
        delete r.damagePlayer;
        for (const c of tiere) if (c.parent) r.removeCreature(c); // die Wesen und die Gefallenen
        for (const pf of (s._pfeile || []).slice()) r._pfeilDespawn(pf);
        if (s._pfeile) s._pfeile.length = 0;
        try {
            r.equipHeld(saved.held || null);
        } catch (_e) {}
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();
        if (Array.isArray(saved.hotbar)) s.hotbar = saved.hotbar;
        if (r.getGameMode() !== saved.mode) r.setGameMode(saved.mode);
        if (fn("setCameraMode")) r.setCameraMode(saved.cam);
        s.yaw = saved.yaw;
        s.pitch = saved.pitch;
        s.isPointerLocked = saved.lock;
        p.hp = saved.hp;
        p.respawnGraceUntil = saved.grace;
        p.breakHeld = saved.breakHeld;
        p._swing = saved.swing;
        p._hitStopUntil = saved.hitStop;
        s.maxCreatures = saved.maxC;
    }
    return w;
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei, Produktions-Boot
    });
    let out = null;
    let welle = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: die Welt settled pumpen (plateau-basiert, die V18.273-Lehre).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 40) break;
                if (ticks % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });

        // SYNCHRON messen (keine awaits — der rAF-Loop kann nicht dazwischenfunken).
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            for (const fn of [
                "_swingDynamics",
                "_swingDauerFuerBlueprint",
                "_playerSwingDauer",
                "_beginPlayerSwing",
                "_playerAttackCreature",
                "_tickKampfSchwung",
                "_kampfSweepTick",
                "_kampfBladeReach",
                "_segSegDistSq",
                "_hitStopFactor",
                "_kampfHitJuice",
                "_playKampfOneShot",
                "_applyKampfSchwungPose",
                "damageCreature",
                "_creatureCombatDeath",
                "updateCreatures",
                "_loopFixedStep",
                "animatePlayerSoul",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            // KERN-PFLICHT 17.07. — der SWING_LAWS-Zwilling ist gefallen: die
            // Schwung-/Gefühls-Gesetze leben NUR im schmiede-Gesetzbuch (ARENA).
            const AG = A._arenaGesetz();
            if (!AG || !AG.schwung || !AG.gefuehl) return { error: "ARENA-Gesetz fehlt" };
            const K = AG.schwung;
            const G = AG.gefuehl;
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");

            // ── KONSUM-Proben (Lehre 6): die EINE Quelle ist verdrahtet ──
            const atkSrc = codeOf(r._playerAttackCreature);
            o.checks.klickLoestNurAus =
                /_beginPlayerSwing/.test(atkSrc) && !/attackSpeed/.test(atkSrc) && !/damageCreature/.test(atkSrc);
            o.checks.cooldownLiestQuelle =
                /_playerSwingDauer/.test(codeOf(r._beginPlayerSwing)) &&
                !/attackSpeed/.test(codeOf(r._beginPlayerSwing));
            o.checks.hudLiestQuelle = /_playerSwingDauer/.test(codeOf(r.tickStatsHud));
            o.checks.werkstattLiestQuelle = /_swingDauerFuerBlueprint/.test(codeOf(r._blueprintAbilityStats));
            o.checks.simLiestNieHitStop =
                !/_hitStopFactor/.test(codeOf(r._stepFixedSim)) && !/_hitStopFactor/.test(codeOf(r._loopFixedStep));
            o.checks.anzeigeLiestHitStop =
                /_hitStopFactor/.test(codeOf(r.animatePlayerSoul)) &&
                /_hitStopFactor/.test(codeOf(r._tickKampfSchwung));
            o.checks.layerImRigPfad = /_applyKampfSchwungPose/.test(codeOf(r.animatePlayerSoul));
            const juiceSrc = codeOf(r._kampfHitJuice);
            o.checks.juiceKanaele = /_landImpactPending/.test(juiceSrc) && /_playKampfOneShot/.test(juiceSrc);
            // Welle 5 Klang: der Treffer klingt aus dem Gesetz (klang:SUBSTANZ.treffer) über den EINEN Ereignis-
            // Chokepoint `_substanzKlang` — er trägt Master, Symphonie-Wand und keinen zweiten Kontext.
            const shotSrc = codeOf(r._substanzKlang);
            o.checks.klangEineMaschine =
                /_substanzKlang\(/.test(codeOf(r._playKampfOneShot)) &&
                /masterGain/.test(shotSrc) &&
                /enabled/.test(shotSrc) &&
                !/new\s+AudioContext/.test(shotSrc);
            const deathSrc = codeOf(r._creatureCombatDeath);
            o.checks.todKipptStattDespawn =
                /_fieldGradient/.test(deathSrc) && /dying/.test(deathSrc) && !/removeCreature\(/.test(deathSrc);
            // der Leichnam-Takt trägt den Abschied, und der Kreatur-Takt treibt ihn
            o.checks.abschiedNachFrist =
                /dying/.test(codeOf(r._tickLeichname)) &&
                /removeCreature\(/.test(codeOf(r._tickLeichname)) &&
                /_tickLeichname\(/.test(codeOf(r.updateCreatures));
            // Stimme-aus respektiert (headless: Symphonie nie aktiviert → stumm, kein Throw)
            o.checks.stimmeAusStumm = r._playKampfOneShot({ härte: 1 }) === false && !s.symphony.enabled;

            // ── (A) DAUER ∝ √I — zwei ECHTE Blueprints durch die ECHTE Quelle ──
            const box = (m, sz, p) => ({ shape: "box", material: m, size: sz, position: p || { x: 0, y: 0, z: 0 } });
            const blu = s.blueprints;
            const leicht = {
                name: "_kg_klinge",
                parts: [
                    box("holz", { x: 0.15, y: 1.5, z: 0.15 }),
                    box("eisen", { x: 0.6, y: 0.6, z: 0.6 }, { x: 0, y: 1.5, z: 0 }),
                ],
            };
            const schwer = {
                name: "_kg_hammer",
                parts: [
                    box("holz", { x: 0.15, y: 2.0, z: 0.15 }),
                    box("eisen", { x: 0.9, y: 0.9, z: 0.9 }, { x: 0, y: 2.0, z: 0 }),
                ],
            };
            const I1 = r._swingDynamics(leicht).swingInertia;
            const I2 = r._swingDynamics(schwer).swingInertia;
            const D1 = r._swingDauerFuerBlueprint(leicht);
            const D2 = r._swingDauerFuerBlueprint(schwer);
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

            // ── Bühne für (B)/(C)/(E): Waffe in die Hand, bekannte Blickrichtung ──
            const p = s.player;
            const pm = s.playerMesh;
            if (!p || !pm) return { error: "kein Spieler" };
            const saved = {
                yaw: s.yaw,
                equipped: p.equipped,
                swing: p._swing,
                hitStop: p._hitStopUntil,
                landImpact: s._landImpactPending,
                lastAttackAt: p.lastAttackAt,
                maxCreatures: s.maxCreatures,
                vel: s.playerVel,
                uw: s.playerUnderwater,
                mounted: p.mountedArch,
                walkPhase: p.walkPhase,
                gaitW: p._gaitW,
                lastTick: p.animationLastTick,
                soul: p.soul,
            };
            blu._kg_klinge = leicht;
            p.equipped = { held: "_kg_klinge" };
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
            s.yaw = 0; // Blick nach +z (die _loopCamera-Konvention)
            s.pitch = 0;
            // die Klinge folgt dem Fadenkreuz (Welle L): die ECHTE Kamera steht auf dem Blick
            if (typeof r.setCameraMode === "function") r.setCameraMode("first");
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
            // die Klinge zielt durchs Fadenkreuz und fegt den Bogen ±arcHalf (Welle L).
            {
                const b = new THREE.Box3().setFromObject(cNeben);
                const c = s.camera.position;
                s.pitch = Math.atan2((b.min.y + b.max.y) / 2 - c.y, Math.max(0.5, cNeben.position.z - c.z));
                r._loopCamera(901);
            }

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
            // (C2) die Gang-Phase friert (echter Konsument animatePlayerSoul)
            if (!pm.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
            const mesh = s.playerMesh;
            if (!mesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            s.playerUnderwater = false;
            p.mountedArch = null;
            let vStub = 5;
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            const gehe = (t0, n) => {
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0);
                const ph0 = p.walkPhase;
                for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
                return p.walkPhase - ph0;
            };
            const dPhaseGestoppt = gehe(6000, 30);
            o.dPhaseGestoppt = dPhaseGestoppt;
            o.checks.cGangFriert = dPhaseGestoppt === 0;
            // (C3) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (Fixed-Akku-Probe)
            s.playerVel = saved.vel; // die Sim braucht den ECHTEN Body (kein Stub)
            const simT0 = s._fixedSimTime;
            const steps1 = r._loopFixedStep(0.05, performance.now() / 1000);
            const steps2 = r._loopFixedStep(0.05, performance.now() / 1000 + 0.05);
            o.simSteps = steps1 + steps2;
            o.simDelta = s._fixedSimTime - simT0;
            o.checks.cSimLaeuftWeiter = o.simSteps >= 2 && o.simDelta > 0;
            // (C4) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            p._hitStopUntil = 0;
            const dPhaseFrei = gehe(7000, 30);
            o.dPhaseFrei = dPhaseFrei;
            o.checks.cGegenprobeLaeuft = dPhaseFrei > 0;
            // (S1) SELBST-TEST: _hitStopFactor ≡ 1 gestubbt → trotz Hit-Stop läuft die Uhr
            const savedFactor = r._hitStopFactor;
            p._hitStopUntil = Number.MAX_SAFE_INTEGER;
            r._hitStopFactor = () => 1;
            const dPhaseStub = gehe(8000, 30);
            r._hitStopFactor = savedFactor; // restaurieren (Gate-Hook-Lehre)
            p._hitStopUntil = 0;
            o.dPhaseStub = dPhaseStub;
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
                    // der Layer dreht die Gelenke als Quaternion (Welle LF: der Leib folgt der Klinge) — gemessen wird der
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
            // der Schwung trägt seinen Rahmen (Körper und Gerät, _kampfSchwungRahmen) wie _beginPlayerSwing ihn legt; ein Stand
            // ohne Rahmen (vor Welle LF kampf) schwingt ohne ihn — die Pose-Probe misst dann seinen alten Layer
            const rahmenE =
                typeof r._kampfSchwungRahmen === "function" ? r._kampfSchwungRahmen({}) : { reach: undefined };
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

            // ── (D) TOD-KIPPEN: Rotation wächst, inert, Despawn erst nach Frist ──
            const cTod = spawnBei(60, 60); // weit weg — kein Sweep-/Spieler-Einfluss
            if (!cTod) return { error: "Tod-Kreatur-Spawn fehlgeschlagen" };
            // up·y der gedrehten Hochachse — reine Quaternion-Mathe (R(q)·(0,1,0)).y
            // = 1 − 2(qx² + qz²), kein THREE nötig.
            const upY = (c) => 1 - 2 * (c.quaternion.x * c.quaternion.x + c.quaternion.z * c.quaternion.z);
            const kill = r.damageCreature(cTod, 99999, { source: "world" });
            // der Gefallene liegt: nicht mehr unter den Wesen, in der Liste der Gefallenen, in der Szene
            const liegt = (c) => (s.leichname || []).indexOf(c) !== -1 && s.creatures.indexOf(c) === -1 && !!c.parent;
            o.checks.dKillKipptErst = !!kill.killed && !!cTod.userData.dying && liegt(cTod);
            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) r.updateCreatures(dt);
            };
            const uy0 = upY(cTod);
            tick(2, 0.1); // t=0.2
            const uyA = upY(cTod);
            tick(3, 0.1); // t=0.5
            const uyB = upY(cTod);
            o.kipp = { uy0, uyA, uyB };
            o.checks.dRotationWaechst = uy0 > 0.95 && uyA < uy0 - 0.005 && uyB < uyA - 0.05;
            o.checks.dNochDa = liegt(cTod);
            const nachtreten = r.damageCreature(cTod, 10, { source: "world" });
            o.checks.dSterbendInert = nachtreten.ok === false && nachtreten.reason === "dying";
            tick(5, 0.1); // t=1.0 — der Kipp ist vollendet, der Nachklang läuft
            const uyC = upY(cTod);
            o.kipp.uyC = uyC;
            o.checks.dGekippt = uyC < 0.35 && liegt(cTod);
            // der Leichnam liegt (Welle LF, Posten 7): nach dem Kippen bleibt er, bis die Frist des Gesetzbuchs (kippDauer +
            // leichnamSec, Kreatur-Uhr) verstrichen ist — dann kehrt er zur Erde zurück
            const GT = r.constructor._arenaGesetz().gefuehl;
            tick(4, 0.1); // t=1.4
            const liegtNoch = liegt(cTod);
            tick(Math.ceil((GT.kippDauerSec + GT.leichnamSec - 1.4) / 0.1) + 3, 0.1);
            o.checks.dDespawnNachFrist = liegtNoch && (s.leichname || []).indexOf(cTod) === -1 && !cTod.parent;

            // ── EINHEITSBREI-WAND (18.07.) — die 13 Gattungen differenzieren ──
            // Fake-Blueprints mit BYTE-GLEICHEN Donor-Parts (KIND_SUBSTANCE.
            // geraet_schwert) aber verschiedener studioGestalt: unterscheiden
            // sich Dauer/Reichweite/Schaden, KANN die Quelle nur der Kern sein
            // (kampfMasze) — die Donor-Parts können es nicht liefern (Absenz-
            // Beweis im Konsum-Beweis). Selbst-Test: kampfMasze gestubbt →
            // alles kollabiert auf EINE Dauer — die Wand MUSS es sehen.
            try {
                const sc = globalThis.__schmiedeCore;
                const donorParts = JSON.parse(JSON.stringify(r.constructor.KIND_SUBSTANCE.geraet_schwert.parts));
                const gattungen = ["dolch", "messer", "langschwert", "saebel", "grossschwert", "keule", "kriegsaxt"];
                const probe = () => {
                    const rows = [];
                    for (const id of gattungen) {
                        const bp = { name: "klinge_" + id, studioGestalt: id, parts: donorParts };
                        const dauer = r._swingDauerFuerBlueprint(bp);
                        const heldSaved = r._heldImplementBlueprint;
                        r._heldImplementBlueprint = () => bp;
                        let reach = null;
                        let dmgF = null;
                        try {
                            reach = r._kampfBladeReach();
                            // die WIRKUNG des Treffer-Urteils (Welle L: seine Energie gegen keRefJ, keine Klemme)
                            // bei EINEM Klingen-Tempo — die Ordnung trägt die gemessene Masse.
                            dmgF = r._trefferWirkung(r._kampfUrteil(20, 0, null));
                        } finally {
                            r._heldImplementBlueprint = heldSaved;
                        }
                        rows.push({ id, dauer, reach, dmgF });
                    }
                    return rows;
                };
                r._kampfMaszeMemo = null; // frisch messen
                const rows = probe();
                const by = {};
                for (const row of rows) by[row.id] = row;
                o.brei = rows
                    .map((x) => `${x.id}:${x.dauer.toFixed(2)}s/${x.reach.toFixed(2)}m/×${x.dmgF.toFixed(2)}`)
                    .join(" ");
                o.checks.breiDauerDistinct = new Set(rows.map((x) => x.dauer.toFixed(3))).size >= 3;
                o.checks.breiReachDistinct = new Set(rows.map((x) => x.reach.toFixed(2))).size >= 3;
                o.checks.breiDmgDistinct = new Set(rows.map((x) => x.dmgF.toFixed(2))).size >= 3;
                o.checks.breiOrdnung =
                    by.dolch.dauer < by.grossschwert.dauer &&
                    by.dolch.reach < by.grossschwert.reach &&
                    by.messer.dmgF < by.langschwert.dmgF &&
                    by.langschwert.dmgF < by.keule.dmgF;
                // Texel==Gesetz: das UNGEKLEMMTE Paar langschwert/grossschwert
                // hält dauer2/dauer1 == √(I2/I1) ± 5 % gegen kampfMasze.
                const k1 = sc.kampfMasze("langschwert");
                const k2 = sc.kampfMasze("grossschwert");
                const soll = Math.sqrt(k2.traegheit / k1.traegheit);
                const ist = by.grossschwert.dauer / by.langschwert.dauer;
                o.breiRatio = { ist, soll };
                o.checks.breiRatio = Math.abs(ist / soll - 1) < 0.05;
                // Selbst-Test: ohne kampfMasze kollabiert alles auf die EINE
                // Donor-Dauer — die Distinct-Wand MUSS rot sehen können.
                const kmSaved = r._schmiedeKampfMasze;
                r._schmiedeKampfMasze = () => null;
                let stubRows = null;
                try {
                    stubRows = probe();
                } finally {
                    r._schmiedeKampfMasze = kmSaved;
                }
                o.checks.breiSelbsttest =
                    new Set(stubRows.map((x) => x.dauer.toFixed(3))).size === 1 &&
                    new Set(stubRows.map((x) => x.reach.toFixed(2))).size === 1;
            } catch (eBrei) {
                o.breiErr = (eBrei && eBrei.message) || String(eBrei);
            }

            // ── Bühne restaurieren ──
            for (const c of [cNeben, cRuecken]) if (c.parent) r.removeCreature(c); // ein Wesen oder ein Gefallener
            delete blu._kg_klinge;
            s.yaw = saved.yaw;
            p.equipped = saved.equipped;
            p._swing = saved.swing;
            p._hitStopUntil = saved.hitStop;
            s._landImpactPending = saved.landImpact;
            p.lastAttackAt = saved.lastAttackAt;
            s.maxCreatures = saved.maxCreatures;
            s.playerVel = saved.vel;
            s.playerUnderwater = saved.uw;
            p.mountedArch = saved.mounted;
            p.walkPhase = saved.walkPhase;
            p._gaitW = saved.gaitW;
            p.animationLastTick = saved.lastTick;

            return o;
        });
        welle = await page.evaluate(WELLE_L);
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== KAMPF-GEFÜHL — Dauer ∝ √I · Klingen-Sweep · Hit-Stop ≠ Sim · Tod-Kippen (gate:kampf-gefuehl) =====\n"
    );
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const c = out.checks;
        console.log(
            `  (A) I1=${out.dauer.I1.toFixed(3)} → ${out.dauer.D1.toFixed(3)} s · I2=${out.dauer.I2.toFixed(3)} → ${out.dauer.D2.toFixed(3)} s · Ratio ${out.dauerRatio.toFixed(3)} (soll √(I2/I1)=${out.dauerSoll.toFixed(3)})`
        );
        console.log(
            `  (B) Reichweite ${out.reach.toFixed(2)} m · Treffer je Schwung ${out.sweep.hits} · (C) Sim-Schritte im Hit-Stop ${out.simSteps} (Δt ${out.simDelta.toFixed(3)} s) · Phase gestoppt ${out.dPhaseGestoppt.toFixed(3)} / frei ${out.dPhaseFrei.toFixed(2)}`
        );
        console.log(
            `  (D) up·y: ${out.kipp.uy0.toFixed(2)} → ${out.kipp.uyA.toFixed(2)} → ${out.kipp.uyB.toFixed(2)} → ${out.kipp.uyC.toFixed(2)} · (E) Arm ${out.pose.armRad.toFixed(2)} rad · Rumpf ${out.pose.rumpfRad.toFixed(2)} rad · Füße im Strike ${out.pose.fussGleitenM} m verschoben\n`
        );
        if (out.brei) console.log(`  (BREI) ${out.brei}\n`);
        check(
            c.breiDauerDistinct && c.breiReachDistinct && c.breiDmgDistinct,
            "EINHEITSBREI: byte-gleiche Donor-Parts, ≥3 distinkte Dauern/Reichweiten/Schadens-Faktoren — die Quelle ist der Kern (kampfMasze)" +
                (out.breiErr ? " — FEHLER: " + out.breiErr : "")
        );
        check(
            c.breiOrdnung,
            "EINHEITSBREI: die Ordnung stimmt (Dolch flink+kurz < Grossschwert · Messer < Langschwert < Keule im Schaden)"
        );
        check(
            c.breiRatio,
            `EINHEITSBREI: Dauer-Verhältnis == √(I-Verhältnis) ± 5 % gegen kampfMasze (ist ${out.breiRatio ? out.breiRatio.ist.toFixed(3) : "?"} soll ${out.breiRatio ? out.breiRatio.soll.toFixed(3) : "?"})`
        );
        check(
            c.breiSelbsttest,
            "EINHEITSBREI-SELBSTTEST: kampfMasze gestubbt → alles kollabiert auf EINE Donor-Dauer (die Wand sieht den Riss)"
        );
        check(c.klickLoestNurAus, "KONSUM: der Crosshair-Klick löst NUR aus (kein attackSpeed, kein Direkt-Schaden)");
        check(c.cooldownLiestQuelle, "KONSUM: der Cooldown IST die Schwung-Dauer (_playerSwingDauer — EINE Quelle)");
        check(c.hudLiestQuelle, "KONSUM: das Stats-HUD (Angriffstempo) liest die Schwung-Quelle");
        check(c.werkstattLiestQuelle, "KONSUM: die Werkstatt-Ablesung (Tempo) liest die Schwung-Quelle");
        check(c.aBeideUngeklemmt, "(A) beide Fixtures liegen UNGEKLEMMT im [min,max]-Band (der Test ist ehrlich)");
        check(
            c.aVerhaeltnisWurzelI,
            `(A) Schwung-Dauer-Verhältnis ∝ √(I2/I1) ± 5 % (${out.dauerRatio.toFixed(3)} vs ${out.dauerSoll.toFixed(3)})`
        );
        check(c.aFaustDauer, "(A) die leere Faust hat die endliche Hand-Dauer (kein Instant-Prügeln)");
        check(c.bTrifftNeben, "(B) der Sweep trifft ein Ziel NEBEN dem Crosshair (in der Klingen-Kapsel)");
        check(c.bDedupEinmal, `(B) dedupliziert je Schwung: GENAU EIN Treffer (${out.sweep.hits})`);
        check(c.bZweiterSchwungTrifft, "(B) ein zweiter Schwung trifft wieder (Dedup gilt JE Schwung)");
        check(c.bNieRuecken, "(B) NIE ein Ziel hinter dem Rücken (die Wand im Sweep-Chokepoint)");
        check(
            c.bHitStopGesetzt,
            `(B) der Treffer öffnet das Hit-Stop-Fenster im Gesetz-Band (${out.freeze !== null ? (out.freeze * 1000).toFixed(0) + " ms" : "kein Treffer"})`
        );
        check(c.bKameraImpuls, "(B) Kamera-Impuls über den BESTEHENDEN Landungs-Dip (_landImpactPending)");
        check(c.juiceKanaele, "(B) Hit-Juice wired: Kamera-Dip + Klang-One-Shot in _kampfHitJuice");
        check(c.klangEineMaschine, "(B) Klang über die EXISTIERENDE Maschine (masterGain, kein zweiter AudioContext)");
        check(c.stimmeAusStumm, "(B) Stimme-aus respektiert: Symphonie aus → der Treffer bleibt stumm");
        check(
            c.s2LinseFeuert,
            "SELBST-TEST (S2): Kapsel-Mathe ≡ ∞ gestubbt → kein Treffer (die Messung ist nicht blind)"
        );
        check(c.cSchwungFriert, "(C) HIT-STOP: die Schwung-Phase friert (t bleibt 0)");
        check(c.cGangFriert, "(C) HIT-STOP: die Gang-Phase friert (walkPhase Δ=0 am echten Konsumenten)");
        check(
            c.cSimLaeuftWeiter,
            `(C) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (${out.simSteps} Schritte, Fixed-Akku-Probe)`
        );
        check(c.cGegenprobeLaeuft, "(C) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder");
        check(c.simLiestNieHitStop, "(C) Source-Wand: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE");
        check(c.anzeigeLiestHitStop, "(C) und NUR die Anzeige-Uhr (animatePlayerSoul + Schwung-Tick) liest ihn");
        check(
            c.s1LinseFeuert,
            "SELBST-TEST (S1): _hitStopFactor ≡ 1 gestubbt → die Uhr läuft (die Freeze-Messung misst den Faktor)"
        );
        check(c.dKillKipptErst, "(D) TOD: der Kill setzt dying — KEIN Sofort-Despawn");
        check(c.dRotationWaechst, "(D) der Körper KIPPT: die Rotation wächst über die Ticks (entlang _fieldGradient)");
        check(c.dSterbendInert, "(D) ein sterbendes Wesen ist inert (damageCreature-Wand: reason=dying)");
        check(c.dGekippt && c.dNochDa, "(D) gekippt (~83°) und noch DA während des Nachklangs");
        check(
            c.dDespawnNachFrist,
            "(D) der Leichnam liegt nach dem Kippen und fällt erst NACH der Frist (Kipp + Leichnam)"
        );
        check(
            c.todKipptStattDespawn,
            "(D) Source-Wand: _creatureCombatDeath kippt (_fieldGradient), despawnt nicht selbst"
        );
        check(
            c.abschiedNachFrist,
            "(D) und der Leichnam-Takt (_tickLeichname, aus updateCreatures) trägt den Abschied (removeCreature nach der Frist)"
        );
        check(c.eArmHebt, "(E) OBERKÖRPER-Layer: im Windup heben Arm + Rumpf (additiv über der Lokomotion)");
        check(c.eBeineByteGleich, "(E) die BEINE bleiben byte-gleich (der Layer ist NUR Oberkörper)");
        check(c.eRueckstandsfrei, "(E) nach dem Schwung ist die Pose rückstandsfrei byte-alt");
        check(c.layerImRigPfad, "(E) KONSUM: animatePlayerSoul wendet den Schwung-Layer an");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log("\n  ── WELLE L — Treffer · Maus · Blick (die Leben-Prüfung „Kampf“ als Linse) ──\n");
    if (!welle) {
        console.log("FEHLER: die Welle-L-Proben liefen nicht");
        ok = false;
    } else {
        const z = welle.z,
            c = welle.c;
        const f1 = (v) => (v === null || v === undefined ? "–" : Number(v).toFixed(2));
        if (welle.fehler.length) console.log("  Fehler: " + welle.fehler.join(" · "));
        console.log(
            `  (Q8) Zone Kopf÷Bein ${f1(z.zoneKopfBein)} (Ziel-Rest ${f1(z.zielKopf)}°/${f1(z.zielBein)}°, Zonen ${JSON.stringify(z.zonen)}) · hangab Hirsch ${z.hangabHirsch}/10, Fuchs ${z.hangabFuchs}/10 · klein flach ${z.kleinFlach}/10`
        );
        console.log(
            `       Hit-Stop-Energie Grossschwert ${f1(z.stopGross)} J · Keule ${f1(z.stopKeule)} J · gleiche Energie (±3 %) höchstens ${z.keGruppe} von ${z.keRezepte} Rezepten, Spanne ×${z.keSpanne} · Kappe ${z.aufDerKappe} von ${z.nahkampfRezepte} · Gegenwehr Bär ${z.gegenwehr}/20 · Hirsch ${z.gegenwehrHirsch}/20`
        );
        console.log(`       Faktoren ${z.faktoren}`);
        console.log(
            `       ${z.panzer} · Verschleiß wear ${f1(z.wear16)} nach ${z.treffer16} Treffern, verbraucht ${z.trefferVerbraucht} Treffer · Phantome ${z.phantome} · Güte uneins ${z.gueteUneins} von ${z.gueteGeraete}${z.gueteProben ? " (" + z.gueteProben + ")" : ""}`
        );
        console.log(
            `       Pfeil voll ${f1(z.pfeilVoll)} · 25 % ${f1(z.pfeilViertel)} · hinter der Wand ${z.pfeilHinterWand} · frei ${z.pfeilFrei}`
        );
        const bg = z.bogen || {};
        console.log(
            `       Bogen-Verschleiß: wear 1 ${f1(bg.voll)} · wear 0,5 ${f1(bg.halb)} (÷ ${f1(bg.verh)}, Soll ${f1(bg.soll)}) · zehrt je Schuss ${bg.zehrtVoll === undefined ? "–" : bg.zehrtVoll.toFixed(4)}/${bg.zehrtHalb === undefined ? "–" : bg.zehrtHalb.toFixed(4)} · verbraucht (0,02) flog ${bg.verbrauchtFlog}, traf ${bg.verbrauchtTraf} · Täter S6 ok=${z.s6 ? z.s6.ok : "–"}`
        );
        console.log(
            `       Waffen-Schadens-Pfade ${z.schadensPfade} · ohne _kampfRohSchaden: ${z.schadensZwillinge} · Täter S7 nennt ${z.s7 || "–"} · trefferZone fehlt → ${z.kernOhneZone} (mit Kern ${z.kernMitZone} Glieder)`
        );
        console.log(
            `       kalter erster Treffer ${z.kalt ? z.kalt.gattung + ": traf " + z.kalt.traf + ", zerlegt " + z.kalt.zerlegt + " Vertices" : "–"} · Täter S8 ${z.s8 ? z.s8.gattung + ": zerlegt " + z.s8.zerlegt : "–"} · Sweep Math.sin/cos ${z.sweepFormel} · typeof-Selbst ${z.typeofSelbst}`
        );
        const gr = z.grob || {};
        const jeL = gr.jeL
            ? Object.entries(gr.jeL)
                  .map(([g, x]) => g + " " + x.toFixed(2))
                  .join(" · ")
            : "–";
        console.log(
            `       Grob-Tor: Körpermaße außerhalb des Leibs ${z.grobFremd} · Gestalt-Proben ${gr.proben || 0}, außerhalb ${gr.ausserhalb === undefined ? "–" : gr.ausserhalb}${gr.taeter && gr.taeter.length ? " (" + gr.taeter.join(", ") + ")" : ""} · Gestalt je L ${jeL} · Täter S9 außerhalb ${z.s9 ? z.s9.ausserhalb + " (" + z.s9.taeter.join(", ") + ")" : "–"}`
        );
        console.log(
            `  (Q9) 3rd: Fadenkreuz ${z.dritte && z.dritte.fadenkreuz}/10, frei ${z.dritte && z.dritte.frei}, Schwünge ${z.dritte && z.dritte.schwuenge}, Krater ${z.dritte && z.dritte.krater}, Treffer ${z.dritte && z.dritte.treffer} · Halten nach dem Stoß ${z.haltenKrater} Krater · RMB Schwert ${z.rmbSchwert}/3, Spaten ${z.rmbSpaten}, Hand ${z.rmbHand} · Werkstatt: der Canvas greift ${z.werkstattGriffe}/4 (ohne Schublade ${z.ohneWerkstattGriffe}/1) · FERTIGEN ${JSON.stringify(z.fertigen)}`
        );
        console.log(
            `  (Q10) Ego-Neigung −90° → ${f1(z.blick90)}°, −57,3° → ${f1(z.blick57)}° · vor dir min cos ${f1(z.vorDirCos)} · „baue dorf hier" cos ${f1(z.dorfCos)} · Pfeil↔Fadenkreuz ${f1(z.pfeilFadenkreuz)}°\n`
        );
        check(c.zoneJederTreffer, "Q8 K-D2: jeder Treffer trägt eine Zone (die Phantom-Zone war null in 222/222)");
        check(c.zoneWirkt, "Q8 K-D2: die Zone wirkt — Kopf ÷ Bein ≥ 1,5 (dieselbe Klinge, derselbe Hirsch)");
        check(
            c.keinePhantome,
            "Q8 K-D2: die fünf Phantom-Leser (zoneMulAt/…/handlingWindF) sind aus dem Stamm verschwunden"
        );
        check(
            c.hangab,
            "Q8 K-D3: hangab (Hirsch 1,6 m/−0,62 m, Fuchs 1,3 m/−0,6 m) je ≥ 8/10 — die Klinge folgt dem Fadenkreuz"
        );
        check(c.kleinFlach, "Q8 K-D3: klein auf gleicher Höhe (Hirsch L 0,64) ≥ 8/10 — getroffen wird die Gestalt");
        check(
            c.hitStopEnergie,
            "Q8 K-D4: der Hit-Stop ist energie-skaliert — jedes Nahkampf-Rezept stoppt nach SEINER Treffer-Energie (höchstens 3 teilen sie auf ±3 %; Befund: 13 von 17 mit 19,8 J)"
        );
        check(c.keineKappe, "Q8 K-D5: keine Schadens-Kappe — höchstens 2 Nahkampf-Rezepte auf dem Maximal-Faktor");
        check(c.verschleiss, "Q8 K-D6: Kampf verschleißt die Klinge, ein verbrauchtes Gerät schlägt nicht");
        check(
            c.eineGuete,
            "Q8 K-D7: EINE Güte je Gerät — Schaden, Werkstoff-Kraft und Equip-Fold lesen das Lehren-Urteil des Kerns"
        );
        check(c.pfeilImpuls, "Q8 K-D8: der Pfeil trägt seine Energie in den Schaden (25 %-Auszug ≤ 0,5 × voll)");
        check(c.pfeilWand, "Q8 K-D8: eine Wand hält den Pfeil (0 Treffer dahinter, frei 1)");
        const rz = z.rueck || {};
        const rw = (m) =>
            m
                ? `Sprung ${m.sprung} m · Weg ${m.weg} m (Δv ${m.dv} m/s, Leib ${m.masse} kg, Schlag p ${m.p} · m ${m.m})`
                : "–";
        console.log(
            `  (T13) Rückstoß: Fuchs Dolch ${rw(rz.fuchsDolch)} · Fuchs Keule ${rw(rz.fuchsKeule)} · Bär Dolch ${rw(rz.baerDolch)} · Bär Keule ${rw(rz.baerKeule)}`
        );
        const rv = rueckVerdict(z.rueck);
        check(
            rv.length === 0,
            "Q8 K-D9: der Rückstoß folgt dem EINEN Impuls-Gesetz — kein Satz im Treffer-Takt, der Fuchs fliegt (≥ 0,3 m), die Masse teilt (Fuchs ≥ 3 × Bär), die Waffe wirkt (Keule ≥ 1,15 × Dolch)" +
                (rv.length ? " — " + rv.join(" · ") : "")
        );
        // der Selbst-Test des Urteils: der Befund (2,16 m in EINEM Takt für jede Waffe und jedes Ziel) fällt rot beim Namen
        const alt = { sprung: 2.16, weg: 2.16 };
        const rvAlt = rueckVerdict({ fuchsDolch: alt, fuchsKeule: alt, baerDolch: alt, baerKeule: alt });
        const rvGut = rueckVerdict({
            fuchsDolch: { sprung: 0, weg: 0.5 },
            fuchsKeule: { sprung: 0, weg: 0.9 },
            baerDolch: { sprung: 0, weg: 0.01 },
            baerKeule: { sprung: 0, weg: 0.02 },
        });
        check(
            rvGut.length === 0 &&
                ["rueckstoss-satz", "rueckstoss-masse", "rueckstoss-waffe"].every((t) =>
                    rvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test K-D9: der Befund (2,16 m überall, in EINEM Takt) nennt Satz, Masse und Waffe; ein gesunder Stoß bleibt grün"
        );
        const mz = z.masse || {};
        const ml = mz.leiber || {};
        console.log(
            "  (T14) Masse-Tafel (Wirt / Gestalt): " +
                ["fuchs", "wolf", "hirsch", "baer", "mensch", "gt"]
                    .map((k) =>
                        ml[k]
                            ? `${k} ${ml[k].wirtKg.toFixed(1)} / ${ml[k].gestaltKg === null ? "–" : ml[k].gestaltKg.toFixed(1)} kg`
                            : k + " –"
                    )
                    .join(" · ") +
                (mz.zwillinge && mz.zwillinge.length ? " · Zwillinge: " + mz.zwillinge.join(", ") : "")
        );
        const mv = masseVerdict(z.masse);
        check(
            mv.length === 0,
            "0710-4 T14: EINE Masse je Leib — die Gestalt (geschlossene Haut × Dichte des Kerns, der Wagen carPhys × FAHR.masseDichte), keine Dichte im Wirt, die Reihe Fuchs < Wolf < Hirsch < Bär < Wagen" +
                (mv.length ? " — " + mv.join(" · ") : "")
        );
        // der Selbst-Test der Tafel: der Befund (Kapsel aus der Hüft-Höhe, Dichten im Wirt) fällt rot beim Namen
        const mvAlt = masseVerdict({
            kernFehlt: ["tetrapoda MASSSTAB.dichteKgM3"],
            zwillinge: ["STOSS.dichteLeib 1000", "STOSS.dichteWagen 150"],
            leiber: {
                fuchs: { wirtKg: 35.4, gestaltKg: 15 },
                wolf: { wirtKg: 140.5, gestaltKg: 64 },
                hirsch: { wirtKg: 435.6, gestaltKg: 94.2 },
                baer: { wirtKg: 254.8, gestaltKg: 335.4 },
                mensch: { wirtKg: 98.8, gestaltKg: 98.8 },
                gt: { wirtKg: 1341.4, gestaltKg: 1341.4 },
            },
        });
        const mvGut = masseVerdict({
            kernFehlt: [],
            zwillinge: [],
            leiber: {
                fuchs: { wirtKg: 15, gestaltKg: 15 },
                wolf: { wirtKg: 64, gestaltKg: 64 },
                hirsch: { wirtKg: 94.2, gestaltKg: 94.2 },
                baer: { wirtKg: 335.4, gestaltKg: 335.4 },
                mensch: { wirtKg: 98.8, gestaltKg: 98.8 },
                gt: { wirtKg: 1341.4, gestaltKg: 1341.4 },
            },
        });
        check(
            mvGut.length === 0 &&
                ["masse-kern", "masse-zwilling", "masse-hirsch", "masse-baer", "masse-reihe"].every((t) =>
                    mvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T14: der Befund (Kapsel aus der Hüft-Höhe, Dichten im Wirt) nennt Kern, Zwilling, Hirsch, Bär und Reihe; eine Tafel aus EINER Quelle bleibt grün"
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
        check(
            bv.length === 0,
            "0710-4 T15: der Biss stößt durch das EINE Impuls-Gesetz — Kitz und Spieler bekommen ihren Impuls, der schwerere Jäger stößt stärker (Fuchs < Wolf < Bär)" +
                (bv.length ? " — " + bv.join(" · ") : "")
        );
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
        check(
            bvGut.length === 0 &&
                ["biss-beute", "biss-spieler"].every((t) => bvAlt.some((x) => x.startsWith(t))) &&
                bvVerkehrt.some((x) => x.startsWith("biss-masse")),
            "Selbst-Test T15: der Befund (Biss ohne Rückstoß) nennt Beute und Spieler, ein Jäger-Gewicht ohne Wirkung nennt die Masse; ein Biss nach Masse bleibt grün"
        );
        // ═══ WELLE LF KAMPF — die Posten der Leben-Schau 07.10. ═══
        const ez = z.energie || {};
        const fJ = (a) => (Array.isArray(a) ? a.map((x) => (x === null ? "–" : x.toFixed(1))).join(" ") : "–");
        const en = ez.nah || {};
        console.log(
            `  (T16) Treffer-Energie J: Großschwert ${fJ(ez.gross)} · Befund-Lage abgewandt 1,5/1,6/1,7 m ${fJ(ez.befund)} · Dolch ${fJ(ez.dolch)} · zu nah (Kitz 0,6 m, 1 m höher) ${Number.isFinite(en.ke) ? en.ke.toFixed(1) : "–"} J am Ort ${en.ort || "–"}, Weg ${JSON.stringify(en.weg || null)} m`
        );
        console.log(
            `       je Treffer (Ort · Wirkung · Tempo m/s): ${(ez.detail || []).map((x) => `${x.name}@${x.d} ${x.ort || "–"} ${x.eff} ${x.v}`).join(" · ")}`
        );
        const ev = energieVerdict(z.energie);
        check(
            ev.length === 0,
            "LF Posten 1: die Treffer-Energie folgt dem Schwung — derselbe Hieb trifft immer, springt in der Befund-Lage nicht (≤ ×1,25), jede Streuung nennt ihren Ort und bleibt über dem Boden des Kerns, das Großschwert schlägt nie schwächer als der Dolch" +
                (ev.length ? " — " + ev.join(" · ") : "")
        );
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
        check(
            evGut.length === 0 &&
                ["energie-kontakt", "energie-waffe", "energie-nah", "energie-boden", "energie-ort"].every((t) =>
                    evAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T16: der Befund (15–91 J je Kontakt, unter dem Dolch) nennt Kontakt und Waffe; ein Schwung-Gesetz bleibt grün"
        );
        const rzz = z.reich || {};
        console.log(
            `  (T17) Reichweite: Klinge ${rzz.klinge} m · Fuchs 1,8 m/−0,77 m: ${rzz.weit ? rzz.weit.treffer : "–"}/9 Treffer, gesagt ${JSON.stringify((rzz.weit && rzz.weit.gesagt.slice(0, 1)) || [])} · Fuchs 1,3 m/−0,6 m: ${rzz.nah ? rzz.nah.treffer : "–"}/9 · reachMaxM im Verb-Tor ${rzz.toreZahl}`
        );
        const rv2 = reichVerdict(z.reich);
        check(
            rv2.length === 0,
            "LF Posten 3: EINE Reichweite aus der Waffe — das Verb-Tor liest die Klinge, jenseits nennt der Spieler-Kanal die Reichweite, in ihr trifft die Serie" +
                (rv2.length ? " — " + rv2.join(" · ") : "")
        );
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
        check(
            rv2Gut.length === 0 &&
                ["reich-zwilling", "reich-stumm", "reich-nah"].every((t) => rv2Alt.some((x) => x.startsWith(t))),
            "Selbst-Test T17: der Befund (Tor 6 m, 9 stumme Hiebe) nennt Zwilling, Stille und Nähe; EINE Reichweite bleibt grün"
        );
        console.log(
            `  (T18) Pose im Treffer-Takt: ${JSON.stringify(z.pose || null)
                .replace(/"/g, "")
                .slice(0, 400)}`
        );
        console.log(`       Ich-Regel: ${JSON.stringify(z.egoRegel || null)}`);
        const pv = poseVerdict(z.pose, z.egoRegel);
        check(
            pv.length === 0,
            "LF Posten 2: Pose, Treffer-Volumen und Ich-Sicht lesen DENSELBEN Schwung — im Treffer-Takt liegt die sichtbare Klinge auf dem Volumen und steht im Bild der Ich-Kamera" +
                (pv.length ? " — " + pv.join(" · ") : "")
        );
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
        check(
            pvGut.length === 0 &&
                ["pose-volumen", "pose-ich:", "pose-ichregel", "pose-spalt"].every((t) =>
                    pvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T18: der Befund (Klinge über dem Kopf, Ich-Sicht leer) nennt Volumen und Ich-Sicht; derselbe Schwung bleibt grün"
        );
        console.log(
            `  (T19) Ausdauer je Hieb: ${(z.ausdauer || []).map((x) => `${x.geraet} ${x.kg} kg → ${x.zehrt}`).join(" · ")}`
        );
        const av = ausdauerVerdict(z.ausdauer);
        check(
            av.length === 0,
            "LF Posten 8: die Ausdauer je Hieb folgt der Masse des Geräts — die Reihe steigt streng mit kg, nie flach" +
                (av.length ? " — " + av.join(" · ") : "")
        );
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
        check(
            avGut.length === 0 && avAlt.some((x) => x.startsWith("ausdauer-flach")),
            "Selbst-Test T19: der Befund (5 je Hieb für jede Waffe) nennt die flache Reihe; eine Reihe nach Masse bleibt grün"
        );
        console.log(
            `  (T20) Kampf-Werte (kg → Biss/Haut/Leben): ${(z.kampfWerte || []).map((x) => `${x.seele}@${x.L} ${x.kg} → ${x.damage}/${x.defense}/${x.hpMax}`).join(" · ")}`
        );
        const kv = kampfWerteVerdict(z.kampfWerte);
        check(
            kv.length === 0,
            "LF Posten 6: Biss, Haut und Leben eines Tiers steigen mit der EINEN Masse seines Leibs — Gattung × Größe, nie gattungs- oder größenblind" +
                (kv.length ? " — " + kv.join(" · ") : "")
        );
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
        check(
            kvGut.length === 0 &&
                ["kampfwerte-damage", "kampfwerte-defense"].every((t) => kvAlt.some((x) => x.startsWith(t))),
            "Selbst-Test T20: der Befund (damage 19,75 · defense 11,9 überall) nennt Biss und Haut; Werte nach Masse bleiben grün"
        );
        const shellSrc = fs.readFileSync(path.join(root, "worlds/schmiede/schmiede.js"), "utf8");
        const shellPf = {
            eigenerPfeil:
                /function buildPfeil\s*\(/.test(shellSrc) ||
                !/buildPfeil\s*=\s*\(\)\s*=>\s*SC\.buildPfeil\(\)/.test(shellSrc),
        };
        console.log(
            `  (T21) Pfeil: ${JSON.stringify(z.pfeilGestalt || null)} · Shell eigener Pfeil ${shellPf.eigenerPfeil}`
        );
        const pv2 = pfeilVerdict(z.pfeilGestalt, shellPf);
        check(
            pv2.length === 0,
            "LF Posten 4: der Pfeil ist die Gestalt des Schmiede-Kerns — Schaft, Spitze, Nocke, Federn, beleuchtet, mit Schatten; kein Wirts- und kein Shell-Zwilling" +
                (pv2.length ? " — " + pv2.join(" · ") : "")
        );
        const pv2Alt = pfeilVerdict(
            { teile: 1, farben: 1, unbeleuchtet: 1, wirft: 0, laenge: 0.55, wirtZylinder: true, leerStill: true },
            { eigenerPfeil: true }
        );
        const pv2Gut = pfeilVerdict(
            { teile: 6, farben: 4, unbeleuchtet: 0, wirft: 6, laenge: 0.76, wirtZylinder: false, leerStill: false },
            { eigenerPfeil: false }
        );
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
            "Selbst-Test T21: der Befund (ein MeshBasic-Zylinder, 0,55 m, Zwillinge, ein leerer Guss still) nennt Gestalt, Licht, Schatten, Länge, Zwilling und die Stille; der Kern-Pfeil, der laut bricht, bleibt grün"
        );
        console.log(`  (T22) Tod am Hang (Gefälle längs der Leibes-Achse): ${JSON.stringify(z.tod || null)}`);
        const tv = todVerdict(z.tod);
        check(
            tv.length === 0,
            "LF Posten 7: ein Tier stirbt wie ein Tier — es fällt auf die Flanke (auch wenn das Gefälle längs seiner Achse fällt) und bleibt liegen, auch beim Mitspieler; der Leichnam ist kein Wesen (nicht in der Liste der Wesen, kein Ziel, kein Platz, keine Zahl, kein Ältester, kein Nächster, kein Leser fragt selbst)" +
                (tv.length ? " — " + tv.join(" · ") : "")
        );
        // die Befunde: Runde 1 (auf dem Hinterteil, nach 22 Takten fort, Ziel/Platz/Zahl) und Gegenprüfung 2 (der Leichnam unter
        // den Wesen: Ältester, Nächster, die stehende Kopie beim Mitspieler, 17 Leser mit eigener Frage)
        const tvAlt = todVerdict({
            vornY: 0.99,
            obenY: 0.12,
            liegt10s: false,
            zielLeichnam: true,
            platzFrei: false,
            nexusZaehlt: true,
            unterWesen: true,
            aeltester: true,
            naechster: true,
            stromAnteil: 1,
            kopieOben: 1,
            fragen: ["_tierRufTakt", "_serializeCreature", "_kreaturIstBeute", "_pickCreatureAtCrosshair"],
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
            aeltester: false,
            naechster: false,
            stromAnteil: 0,
            kopieOben: null,
            fragen: [],
        });
        const tvGut = todVerdict({
            vornY: 0.05,
            obenY: 0.1,
            liegt10s: true,
            zielLeichnam: false,
            platzFrei: true,
            nexusZaehlt: false,
            unterWesen: false,
            aeltester: false,
            naechster: false,
            stromAnteil: 1,
            kopieOben: 0.12,
            fragen: [],
        });
        check(
            tvGut.length === 0 &&
                [
                    "tod-flanke",
                    "tod-leichnam",
                    "tod-ziel",
                    "tod-platz",
                    "tod-zaehlt",
                    "tod-wesen",
                    "tod-aeltester",
                    "tod-naechster",
                    "tod-kopie",
                    "tod-frage",
                ].every((t) => tvAlt.some((x) => x.startsWith(t))) &&
                ["tod-strom", "tod-kopie"].every((t) => tvStumm.some((x) => x.startsWith(t))),
            "Selbst-Test T22: die Befunde (auf dem Hinterteil, nach 22 Takten fort; der Leichnam als Ziel, Platz, Zahl, Ältester und Nächster, die stehende Kopie, die Leser mit eigener Frage; der Strom ohne ihn) nennen jeden Täter; ein Tier auf der Flanke, das kein Wesen mehr ist und beim Mitspieler liegt, bleibt grün"
        );
        const bgz = z.bissGeste || {};
        const bgZeile = (L) =>
            (L || []).map((b) => `${b.geste} Spalt ${b.spalt.toFixed(2)} m / Mitten ${b.xz} m`).join(" · ") || "–";
        console.log(
            `  (T23) Biss — Jagd: ${bgZeile(bgz.jagd)}\n         Beute: ${bgZeile(bgz.beute)}\n         Gegenwehr: ${bgZeile(bgz.gegenwehr)}`
        );
        const bgv = bissGesteVerdict(z.bissGeste);
        check(
            bgv.length === 0,
            "LF Posten 5: der Biss trifft, wo die Geste schnappt — auf jedem Biss-Weg im Ansprung und mit dem Kopf am Leib" +
                (bgv.length ? " — " + bgv.join(" · ") : "")
        );
        const befundBiss = [
            { geste: "keine", spalt: 1.02, xz: 2.39 },
            { geste: "pounce", spalt: 0.61, xz: 1.36 },
        ];
        const bgvAlt = bissGesteVerdict({ jagd: befundBiss, beute: befundBiss, gegenwehr: [] });
        const gutBiss = [{ geste: "pounce", spalt: -0.01, xz: 1.1 }];
        const bgvGut = bissGesteVerdict({ jagd: gutBiss, beute: gutBiss, gegenwehr: gutBiss });
        check(
            bgvGut.length === 0 &&
                ["biss-geste", "biss-ferne", "biss-weg"].every((t) => bgvAlt.some((x) => x.startsWith(t))),
            "Selbst-Test T23: der Befund (Biss ohne Geste, aus 2,39 m, ein Weg ohne Biss) nennt Geste, Ferne und Weg; ein Biss im Ansprung am Leib bleibt grün"
        );
        console.log(`  (T25) Wunde über den Reload: ${JSON.stringify(z.wunde || null)}`);
        const wv = wundeVerdict(z.wunde);
        check(
            wv.length === 0,
            "LF Posten 6 (Nachbesserung 2): die Wunde reist als Anteil des Lebens — voll bleibt voll, auch aus einem Stand vor dem Massen-Gesetz" +
                (wv.length ? " — " + wv.join(" · ") : "")
        );
        const wvAlt = wundeVerdict([
            { seele: "wesen@1", altVoll: 0.738, altHalb: 0.369, neu30: 0.3 },
            { seele: "baer@1.75", altVoll: 0.407, altHalb: 0.203, neu30: 0.3 },
        ]);
        const wvGut = wundeVerdict([
            { seele: "wesen@1", altVoll: 1, altHalb: 0.5, neu30: 0.3 },
            { seele: "baer@1.75", altVoll: 1, altHalb: 0.5, neu30: 0.3 },
        ]);
        check(
            wvGut.length === 0 && wvAlt.some((x) => x.startsWith("wunde-alt")),
            "Selbst-Test T25: der Befund (ein voller Hirsch bei 124/168 nach dem Reload) nennt die alte Wunde; voll bleibt voll bleibt grün"
        );
        console.log(`  (T24) Biss-Reichweite: ${JSON.stringify(z.bissReich || null)}`);
        console.log(`  (T24) das stehende Reh: ${JSON.stringify(z.bissReh || null)}`);
        const brv = bissReichVerdict(z.bissReich, z.bissReh);
        check(
            brv.length === 0,
            "LF Posten 5 (Nachbesserung 2 + 3): der Biss kostet, was in Reichweite steht (0 Gestalten außer Reichweite je Takt, keine kalte Gattung zerlegt), springt nie ins Leere (0 Ansprünge auf den Sims) und trifft ein stehendes Reh (≥ 5 von 6, das Ziel des Kopfs aus der gezeigten Pose)" +
                (brv.length ? " — " + brv.join(" · ") : "")
        );
        const brvAlt = bissReichVerdict(
            {
                gestaltenJeTakt: 15,
                msJeTakt: 2.346,
                simsAnspruenge: 6,
                simsSek: 10,
                simsUeber: 1.0,
                simsWaagrecht: 0.9,
                simsReich: 2.6,
                kaltZerlegt: 2,
                kaltVerts: 61392,
            },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 0,
                takte: 61,
                klemme: 14,
                kopfSumme: { takte: 10, rest: 0.31, drift: 0.69, reihe: [0.31, 0.62, 0.93, 1] },
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
                kaltZerlegt: 0,
                kaltVerts: 0,
            },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 6,
                takte: 70,
                klemme: 8,
                kopfSumme: { takte: 10, rest: 0.31, drift: 0, reihe: [0.31, 0.31, 0.31, 0.31] },
                boden: {},
                je: {},
            }
        );
        check(
            brvGut.length === 0 &&
                ["biss-kosten:", "biss-sims:", "biss-reh:", "biss-kopf:", "biss-kalt:"].every((t) =>
                    brvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T24: die Befunde (15 Gestalten je Takt, 6 Ansprünge unter dem Sims, 0 Bisse am Reh, ein Kopf-Ziel, das ohne Pose-Fortschritt 0,69 rad wandert, 2 kalte Gattungen zerlegt) nennen Kosten, Sims, Reh, Kopf und Kälte; ein Biss nur in Reichweite, der trifft, bleibt grün"
        );
        check(
            c.bogenVerschleiss,
            "Q8 K-D6: der Bogen verschleißt wie die Klinge — wear 0,5 trifft mit 0,65, jeder Schuss zehrt, verbraucht (0,02) löst er nicht"
        );
        check(
            c.einRohSchaden,
            "Q8 K-D6: JEDER Waffen-Schadens-Pfad (damageCreature im Namen des Spielers) rechnet im EINEN _kampfRohSchaden"
        );
        check(
            c.kernPflichtZone,
            "Q8 K-D3: fehlt tetrapoda trefferZone, bricht der Treffer-Test laut und benannt (nie still null je Tier)"
        );
        check(
            c.kaltVorgebacken,
            "Q8 Lehre 14: der erste Treffer auf eine Gattung zerlegt keine Haut — die Treffer-Glieder sind vorgebacken (die EINE Bake-Uhr)"
        );
        check(c.sweepBlickVorn, "Q10: der Klingen-Sweep liest _blickVorn (keine Inline-Kopie der Vorwärts-Formel)");
        check(
            c.keinTypeofSelbst,
            "Welle L: keine typeof-Probe auf eine eigene Methode in den Kampf- und Maus-Methoden der Welle"
        );
        check(
            c.grobLiestLeib,
            "Gesetz #0: Klinge und Pfeil fragen das EINE Grob-Tor (_trefferErreichbar), es liest den kreatur-Leib — kein drittes Körpermaß"
        );
        check(
            c.grobDeckt,
            "Gesetz #0: das Grob-Tor deckt die Gestalt — kein Ende einer Treffer-Glied-Kapsel liegt außerhalb (vier Gattungen × Größen-Grenzen, 90 Takte)"
        );
        check(c.keinPanzer, "Q8 K-D15: die Hand ist kein Panzer (defense und hpMax unberührt, der Angriff steigt)");
        check(
            c.gegenwehr,
            "Q8 K-D16/K-D12: Gegenwehr nach dem Temperament der Gattung — der wehrhafte Bär > 0, der scheue Hirsch 0 bei 20 Treffern aus 1,6 m (der Stoß kommt NACH dem Biss-Test)"
        );
        check(
            c.dritteSchwingt,
            "Q9 K-D1: 3rd-Person — jeder freie Klick auf das Tier im Fadenkreuz schwingt (≥ 8 von 10 frei), 0 Krater"
        );
        check(c.haltenOhneKrater, "Q9 K-D1: 1st-Person — das Halten nach dem Stoß gräbt nicht (0 Krater)");
        check(c.rmbSchwert, "Q9 K-D17: RMB mit dem Schwert schüttet nie auf (Spaten und leere Hand schon)");
        check(
            c.werkstattTaub,
            "Q9 V-D2: bei offener Werkstatt ist der Canvas taub (0 von 4 Griffen; ohne Schublade greift er)"
        );
        check(c.fertigenBaut, "Q9 V-k11: FERTIGEN eines Bauwerks öffnet den Bau-Modus, die Hand bleibt leer");
        check(c.egoBlick, "Q10 K-D14: die Ego-Neigung ist der Blick (−90° → −90°, −57,3° → −57,3°)");
        check(
            c.vorDir,
            "Q10 V-D4: jedes „vor dir“ liegt vor dem Blick (at_player_forward, „baue dorf hier“: cos > 0,9)"
        );
        check(c.pfeilFadenkreuz, "Q10 K-D14: der Pfeil fliegt aufs Fadenkreuz (< 1° bei 45° Steigung)");
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
            c.s6 === true,
            "SELBST-TEST (S6): der Pfeil ohne Verschleiß (_wearStatFactor ≡ 1, _kampfVerschleiss leer) → die Bogen-Probe ist rot"
        );
        check(
            c.s7 === true,
            "SELBST-TEST (S7): ein Wurf-Täter setzt Kraft × Wirkung × Zone selbst zusammen → die Klassen-Linse nennt ihn"
        );
        check(
            c.s8 === true,
            "SELBST-TEST (S8): ohne das Vorbacken zerlegt der erste Hieb die Haut (die Linse zählt den Hieb)"
        );
        check(
            c.s9 === true,
            "SELBST-TEST (S9): der Leib ohne Glieder (Reichweite = halb + radius) → Kopf und Rute liegen außerhalb, die Deckungs-Probe nennt sie"
        );
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die gerechnete Schwungphysik erreicht den Kampf: √I führt · die Klinge trifft · die Sim steht nie" : "❌ ROT — das Kampf-Gefühl trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
