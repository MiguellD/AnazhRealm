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
//  (K27 LEBENSWERTE SIND ZUSTAND) T27: im Modus pfad senken Biss und Hieb hp und Ausdauer; kein Rufer der Stat-
//      Neuberechnung (Gerät · Panel · Boost · Tod-Takt) hebt hp, Ausdauer oder Mana über Regen·dt, voll setzen nur
//      applyPlayerSoul und _playerDeathRespawn. (S11) die alte Zeile (jede Neuberechnung = Maximum) als Hülle → der
//      erste Rufer heißt equipHeld, 4 Wege. Vorher 4 Wege; die Linse lokal ohne T27 84 s, mit T27 61 s.
//
//   node scripts/diag-kampf-gefuehl.cjs
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
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
        if (l.gestaltKg == null) continue; // ohne Kern-Dichte nennt masse-kern den Täter; 0 kg (offene Haut) ist ROT
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
// (T26) DER HIEB TRIFFT IM HORIZONT-BLICK (K13 — pure Funktion, Probe UND Selbst-Test): die Klick-Pfad-Matrix — 8 Waffen ×
// {0,9 m · 1,3 m · Reichweite − 0,2 m} × {Rumpf, Horizont} × {3rd, 1st} gegen einen gehaltenen Wolf, geklickt über den EINEN
// Dispatcher (tryMouseBreak, nie _beginPlayerSwing direkt): jeder der 96 Fälle macht Schaden; je rotem Fall der Täter beim
// Namen (kein Schwung · kein Ziel unter dem Fadenkreuz · zu weit · Sweep vorbei). Ein Wolf hinter dem Rücken und ein Begleiter bleiben heil
// (kein Ziel, kein Schaden); ein Wolf unter dem Fadenkreuz jenseits der Klinge (der Dolch, Reichweite + 0,8 m) bleibt ein Luftschlag mit
// dem Hinweis — nie ein Pflücken oder Graben dahinter. Vorher: Rumpf 46 von 48, Horizont 0 von 48 („kein Ziel"). DIE ERNTE NEBEN DEM
// WILDTIER (Runde 2): trägt das Fadenkreuz in Arm-Länge sein Ziel (Block · Blüte · Boden vor der Spitzhacke), bleibt der Klick dort
// und ein ruhiger Wolf im Schwung-Kegel heil; ein Bauwerk jenseits der Arm-Länge nimmt dem Hieb den Wolf vor dem Spieler nicht.
// Vorher (6133e62d): abbau → hieb 38,1 · pflücken → hieb 26,5 · graben → hieb 10,9 — der Kegel nannte das Verb.
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
// (T27) LEBENSWERTE SIND ZUSTAND (K27 — pure Funktion, Probe UND Selbst-Test): ein Biss senkt hp, ein Hieb die Ausdauer;
// kein Rufer der Stat-Neuberechnung hebt hp, Ausdauer oder Mana über Regen·dt; die Rückkehr steht voll; auf das Maximum
// setzen nur applyPlayerSoul und _playerDeathRespawn. Jede Verletzung nennt den Rufer und seinen Weg (Gerät · Panel ·
// Boost · Tod-Takt). Befund K27: recomputePlayerStats setzte hp, Ausdauer und Mana bei JEDER Neuberechnung auf das Maximum.
const LEBEN_SOLL = { vollRufer: ["_playerDeathRespawn", "applyPlayerSoul"], eps: 1e-3 };
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
    const R = L.rueckkehr;
    if (!R || !(R.wunde > 0) || !(Math.abs(R.hp - R.hpMax) <= LEBEN_SOLL.eps))
        v.push(`lebenswerte-rueckkehr: nach dem Tod steht hp ${R && R.hp} von ${R && R.hpMax} (Wunde ${R && R.wunde})`);
    if (!L.boostAn || !L.boostAb) v.push(`lebenswerte-boost: an ${!!L.boostAn} · ab ${!!L.boostAb} (keine Probe)`);
    const vr = (L.vollRufer || []).join(",");
    if (vr !== LEBEN_SOLL.vollRufer.join(","))
        v.push(`lebenswerte-voll: auf das Maximum setzen [${vr}], Soll [${LEBEN_SOLL.vollRufer.join(",")}]`);
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
    if (P.leerStill !== false)
        v.push(
            `pfeil-still: ein leerer Guss (${typeof P.leerStill === "string" ? P.leerStill : "null"}) lässt den Pfeil ohne Meldung unsichtbar fliegen`
        );
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
// danach 2–8 von 42–84) stehen in der Zeile daneben. Die Probe hält Ort, Haltung und die Gier des Rehs fest (K13b): ihr erster
// Rest hing an der Gier, in die das Reh sich unter den Ansprüngen gedreht hatte (20 Läufe: 18 × 0,5871, 2 × 1,0 an der Klemme).
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
const server = statikServer();

const { WELLE_L } = require("./lib/kampf-proben.cjs");

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
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
            const codeOf = window.__codeOf;

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
            // der Tod im Kampf fällt den EINEN Fall (_kreaturFaellt), der kippt und despawnt nicht selbst
            const fallSrc = codeOf(r._kreaturFaellt);
            o.checks.todKipptStattDespawn =
                /_kreaturFaellt\(/.test(deathSrc) &&
                !/removeCreature\(/.test(deathSrc) &&
                /_fieldGradient/.test(fallSrc) &&
                /dying/.test(fallSrc) &&
                !/removeCreature\(/.test(fallSrc);
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
            "(D) Source-Wand: _creatureCombatDeath fällt den EINEN Fall (_kreaturFaellt kippt nach _fieldGradient), keiner despawnt selbst"
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
                mensch: { wirtKg: 111.5, gestaltKg: 0 },
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
                ["masse-kern", "masse-zwilling", "masse-hirsch", "masse-baer", "masse-mensch", "masse-reihe"].every((t) =>
                    mvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T14: der Befund (Kapsel aus der Hüft-Höhe, Dichten im Wirt, der Mensch ohne geschlossene Haut 0 kg) nennt Kern, Zwilling, Hirsch, Bär, Mensch und Reihe; eine Tafel aus EINER Quelle bleibt grün"
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
        const kz = z.klick || {};
        const kf = Array.isArray(kz.faelle) ? kz.faelle : [];
        const kZahl = (blick) =>
            `${kf.filter((f) => f.blick === blick && f.dmg > 0).length}/${kf.filter((f) => f.blick === blick).length}`;
        console.log(
            `  (T26) Klick-Pfad-Matrix (8 Waffen × 3 Abstände × 3rd/1st): Rumpf ${kZahl("rumpf")} · Horizont ${kZahl("horizont")} mit Schaden · Rücken ${JSON.stringify(kz.ruecken || null)} · Begleiter ${JSON.stringify(kz.begleiter || null)} · Dolch jenseits ${JSON.stringify(kz.zuWeit || null)} · Ernte neben dem Wildtier ${JSON.stringify(kz.ernte || null)} · ${kz.ms} ms`
        );
        const klv = klickVerdict(z.klick);
        check(
            klv.length === 0,
            "K13 T26: der Hieb trifft im Horizont-Blick — 96 von 96 Klicks auf den Wolf machen Schaden, der Wolf hinter dem Rücken und der Begleiter bleiben heil, jenseits der Klinge ein Luftschlag mit Hinweis, Abbau, Pflücken und Graben neben dem Wildtier bleiben beim Fadenkreuz" +
                (klv.length ? " — " + klv.join(" · ") : "")
        );
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
            `Selbst-Test T26: der Befund (Horizont 0 von 48, der Wolf im Rücken getroffen, der Dolch pflückt, der Kegel erntet den Wolf) nennt Horizont, Rücken, Ferne und je Ernte-Verb den Kegel; ohne die Kegel-Wahl (S10) trifft kein Horizont-Klick, und der Schwung ohne Ziel heißt „kein Ziel unter dem Fadenkreuz" (${JSON.stringify(selbstK)}); 96 Treffer bleiben grün`
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
        const zL = z.leben || null;
        const fmtL = (x) =>
            `${x.rufer} hp ${x.hp[0]}→${x.hp[1]} · Ausdauer ${x.st[0]}→${x.st[1]} · Mana ${x.mana[0]}→${x.mana[1]}`;
        console.log(
            `  (T27) Lebenswerte im Modus pfad: Biss −${zL && zL.erst && zL.erst.hp} hp · Hieb −${zL && zL.erst && zL.erst.st} Ausdauer · ` +
                `Rückkehr ${JSON.stringify(zL && zL.rueckkehr)} · voll setzen [${zL && (zL.vollRufer || []).join(", ")}]`
        );
        for (const x of (zL && zL.schritte) || []) console.log(`        ${fmtL(x)}`);
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
            "LF Posten 7: ein Tier stirbt wie ein Tier — es fällt auf die Flanke (auch wenn das Gefälle längs seiner Achse fällt) und bleibt liegen, auch beim Mitspieler und am Alter; der Leichnam ist kein Wesen (nicht in der Liste der Wesen, kein Ziel, kein Platz, keine Zahl, kein Ältester, kein Nächster, kein Leser fragt selbst)" +
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
            aeltester: false,
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
            aeltester: false,
            naechster: false,
            stromAnteil: 1,
            kopieOben: 0.12,
            fragen: [],
            alterLiegt: true,
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
                    "tod-alter",
                ].every((t) => tvAlt.some((x) => x.startsWith(t))) &&
                ["tod-strom", "tod-kopie"].every((t) => tvStumm.some((x) => x.startsWith(t))),
            "Selbst-Test T22: die Befunde (auf dem Hinterteil, nach 22 Takten fort; der Leichnam als Ziel, Platz, Zahl, Ältester und Nächster, die stehende Kopie, die Leser mit eigener Frage, der Tod am Alter ohne Leib; der Strom ohne ihn) nennen jeden Täter; ein Tier auf der Flanke, das kein Wesen mehr ist und beim Mitspieler liegt, bleibt grün"
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
                kaltZerlegt: 0,
                kaltVerts: 0,
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
            { gestaltenJeTakt: 0, msJeTakt: 0, simsAnspruenge: 0, kaltZerlegt: 0 },
            {
                versuche: 6,
                anspruenge: 6,
                bisse: 6,
                kopfSumme: { takte: 10, rest: 1, drift: 0, reihe: [1, 1, 1, 1], klemme: [-0.6, 1] },
                boden: {},
                je: {},
            }
        );
        check(
            brvGut.length === 0 &&
                brvKlemme.some((x) => x.startsWith("biss-kopf-probe:") && /Klemme/.test(x)) &&
                ["biss-kosten:", "biss-sims:", "biss-reh:", "biss-kopf:", "biss-kalt:"].every((t) =>
                    brvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T24: die Befunde (15 Gestalten je Takt, 6 Ansprünge unter dem Sims, 0 Bisse am Reh, ein Kopf-Ziel, das ohne Pose-Fortschritt 0,69 rad wandert, 2 kalte Gattungen zerlegt) nennen Kosten, Sims, Reh, Kopf und Kälte; ein erster Rest an der Klemme (1,0) heißt vakuös; ein Biss nur in Reichweite, der trifft, bleibt grün"
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
