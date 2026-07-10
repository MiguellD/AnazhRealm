# Labs-Andock-Fahrplan — die fünf Schöpfer-Systeme (Anlieferung 09.07.2026)

> **Status (V18.442):** ALLE FÜNF GEDOCKT — schmiede (W-A4a–c, VOLL: Kern+Hand+Portal) ·
> fachwerk (W-A5a Kern + W-A5b settlement/Portal) · koerperstudio + tetrapoda (W-A6
> Daten-Dock: MESHFREI-Kerne + motion-Feld; Shells lesen die Kerne, laden three noch per
> CDN — Portal-Umzug = Folge-Schritt) · klang (W-A7: MESHFREI-Kern + klang-Feld + der
> EINE Lofi-Konsument; Shell liest den Kern, CDN-frei).
> **ÜBERGEORDNET seit 10.07.: `docs/auslagerungs-plan.md` (DER KATALYSATOR-BOGEN) führt die
> Reihenfolge (W-A1–A7); dieser Fahrplan bleibt die Lab-Detail-Referenz.**
> Das Andocken je Lab folgt der **ε-Checkliste des Nervensystem-Plans** (`docs/nervensystem-plan.md`
> TEIL IV Phase ε) — Kern-Split · Manifest-Zeile · Policy-Zeile · components · Gates.
> **Reihenfolge: erst δ fertig (N5 läuft, N6 folgt), dann ε — kein Lab-Hardcode vorher (Moratorium).**

## Die fünf Systeme, kanonisch benannt

| Anlieferung                                     | Welt-id                 | Portal-Blueprint     | Domäne (kind) | Verben                                                          | KIND_POLICY-Zeile (ε)                                                                                                               |
| ----------------------------------------------- | ----------------------- | -------------------- | ------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ANATOMIE · KLINGE — Rückgrat · Schnitt · Lehren | `worlds/schmiede/`      | `welt_schmiede`      | `weapon`      | appear + **wield** (Ω-PHYSIS richtet)                           | `weapon: { prefix: "klinge_", donor: <Waffen-BP>, grown: false, builtIn: false, placeExtra: null }`                                 |
| Fachwerkhaus — parametrisch, begehbar           | `worlds/fachwerk/`      | `welt_fachwerk`      | `haus`        | appear + **place** (mode `settlement`, N5.7) + body             | `haus: { prefix: "haus_", donor: <Haus-BP>, grown: false, placeExtra: null }` — settlement kommt als place-Policy-DATEN aus dem Lab |
| Da Vinci Studio v19 — Living Human              | `worlds/koerperstudio/` | `welt_koerperstudio` | `koerper`     | appear + body + **motion** (Wörterbuch-v1.1-Feld, s. u.)        | eigener Bogen (wahrerguss) — Nervensystem trägt appear; KEINE Wald-/Streu-Nische                                                    |
| Genesis Engine Pro — Generatives Musiksystem    | `worlds/klang/`         | `welt_klang`         | `klang`       | **klang** (Wörterbuch-v1.1-Feld, s. u.) — kein Mesh-Kanal nötig | kein prefix/donor (nicht-geometrische Domäne): components-only                                                                      |
| Tetrapoda — Evolution Lab (Aureus)              | `worlds/tetrapoda/`     | `welt_tetrapoda`     | `kreatur`     | appear + body + **motion**                                      | `kreatur: { prefix: "wesen_", donor: <Kreatur-BP>, grown: false, placeExtra: null }` — Spawn über den Hof, nicht Worldgen           |

## Die Architektur-Prüfung: fließt NACH dem Plan alles durch? (die Schöpfer-Frage)

**Kurz: ja — drei der fünf Domänen fließen durch die BESTEHENDEN Verben; zwei brauchen je EIN
benanntes Wörterbuch-Feld (v1.1, must-ignore-billig per Design) — KEINE neuen Verben, keine
Architektur-Änderung.** Im Einzelnen:

1. **Körper/Avatar + Animationen + Physik:** appear ✅ (Mesh-/Pack-Kanal, N2/N3) · body ✅
   (Feld-Physik ist Host-souverän; die Skin-Mathematik ist als `creature-contract v2` sogar
   schon THREE-frei eingefroren) · Physik ✅ (M3: der Host rechnet). **Lücke: `motion`** —
   Animations-DATEN (Rig-Posen/Clips/Gang-Parameter) sind im Komponenten-Wörterbuch v1 nicht
   vorgesehen → **v1.1-Feld `motion`**, Host-Konsument ist der bestehende Rig-/
   `_animateCompoundMotion`-Bogen (wahrerguss Säule II). Ein Feld, zwei Nutzer (Avatar+Kreatur).
2. **Waffen/Werkzeuge + deren Physik:** ✅ VOLLSTÄNDIG gedeckt — wield-Verb + Ω-PHYSIS ist der
   Richter (Substanz reist, BEDEUTUNG [Schwerpunkt·Hebel·Klingen-Physik] rechnet der Host — exakt
   M3/M9: die Schmiede EICHT die Lehren, der Host LEBT sie). Nur die Policy-Zeile + Donor nötig.
3. **Häuser + Dorf/Stadtbau:** appear ✅ · begehbar = body ✅ (blockerAABBs emergent per Teil) ·
   **Dorf/Stadt = `place.mode settlement` = N5.7** — im Plan benannt, wartet exakt auf DIESES
   Lab (die Settlement-Policy kommt als Daten aus dem Lab, Schwester-Logik zum Wald). Kein Gap
   über das Geplante hinaus.
4. **Musik + Klänge:** **Lücke: `klang`** — die einzige nicht-geometrische Domäne; das Wörterbuch
   v1 kennt kein Audio-Feld. Der Entscheidungsbaum des Plans beantwortet es selbst: KEIN neues
   Host-Verb, sondern **v1.1-Feld `klang`** (die Lab-PRESETS sind schon reine Daten:
   Synth-/Sequenz-Parameter) + EIN Host-Audio-Konsument (die bestehende Audio-Infra [Pings/Lofi]
   wird der eine Leser — kein Parallel-Audio-System).
5. **Kreaturen + Animationen:** appear ✅ (v2-Vertrag steht) · body ✅ · Animation = dieselbe
   `motion`-Lücke wie der Avatar — bewusst EIN Feld für beide (Gesetz #0).

**Die zwei benannten v1.1-Erweiterungen (`motion`, `klang`) sind Komponenten-Felder, keine
Verben** — nach dem Plan-Design genau der billige Weg („Default: Komponente erweitern, nicht
Verb erfinden"). Sie werden je als eigene ε-Welle mit Gate gebaut, BEVOR das jeweilige Lab andockt.

## Andock-Reihenfolge (nach δ, je Lab die ε-Checkliste)

1. **schmiede** ✅ GEDOCKT (10.07., V18.439 — W-A4a: schmiede-core.js, 21 Rezepte, Split-Parität 21/21; W-A4b Hand-Render ✅ V18.440 · W-A4c Portal-Umzug ✅ V18.441 — die Schmiede ist VOLL angedockt; offen nur Donor-Abschied nach Schöpfer-Abnahme + Rüstung/Trank als Rezepte)
2. **fachwerk** ✅ GEDOCKT (10.07. — W-A5a Kern + W-A5b [V18.442]: N5.7 settlement [DORF-QUELLE im Kern, exportSettlement→spawnSettlement, gate:settlement] + Portal [fachwerk.js, CSP, W12, welt_fachwerk, smoke:labs])
3. **tetrapoda** + **koerperstudio** ✅ DATEN-GEDOCKT (V18.442 — motion-Feld v1.1 §8.2 + MESHFREI-Kerne + gate:daten-contract/gate:nervensystem-labs; der motion-KONSUM [_animateCompoundMotion] ist der benannte Folge-Schritt, der Host bleibt der OFEN)
4. **klang** ✅ GEDOCKT (V18.442 — klang-Feld v1.1 §8.3 + klang-core [22 Genres] + der EINE Audio-Konsument: das Lofi-Pad fährt das Genesis-Tempo [_klangStudioPreset/_lofiChordDurationMs])

Porta (`worlds/portale/`, liegt bereit) bleibt der ERSTE ε-Beweis (Plan TEIL VIII Punkt 4).
