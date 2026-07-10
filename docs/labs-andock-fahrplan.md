# Labs-Andock-Fahrplan — die fünf Schöpfer-Systeme (Anlieferung 09.07.2026)

> **Status (ABSCHIEDS-WELLE nach V18.444): DER FAHRPLAN IST ABGESCHLOSSEN — alle fünf
> Systeme VOLL angedockt (Gestalt + Bewegung + Klang + Bauten + Klingen).** Zusätzlich zur
> Nachlese: der KOERPER-DOCK (die 8 Morph-Dials formen den Avatar [`_koerperStudioDials`/
> `KOERPER_DIAL_MAP`], die 5 tetrapoda-Dials formen `wesen`↔deer [`TETRAPODA_SOUL_MAP`/
> `TETRAPODA_DIAL_MAP`, tag-neutral]), DIE EINE EMOTIONS→PROFIL-BRÜCKE
> (`MOTION_EMOTION_PROFILES`; Rig + Compound lesen sie: Atem/Pose-Deltas/walkPhase —
> `gate:nervensystem-labs` D/E, Zahlen-Beweise) und der DONOR-ABSCHIED (geraet_schwert
> donorOnly; die Klon-Sichtbarkeits-Regel am Auto-Register-Chokepoint). Offen bleiben nur
> benannte Lab-seitige Fäden (Rüstung/Trank-Presets · Geräte-Gestalten · L1-Diät —
> Schöpfer-Lab-Entscheide, nichts erfinden).
>
> **Status (Nachlese-Welle nach V18.442):** ALLE FÜNF GEDOCKT + ALLE FÜNF PORTALE —
> schmiede (W-A4a–c, VOLL: Kern+Hand+Portal) · fachwerk (W-A5a Kern + W-A5b settlement/
> Portal + Nachlese: Worldgen-Auto-Dörfer) · koerperstudio + tetrapoda (W-A6 Daten-Dock:
> MESHFREI-Kerne + motion-Feld; Nachlese: Portal-Umzug [W-A4c-Muster, vendored r128,
> byte-treue Splits koerperstudio.js/tetrapoda.js, W12-Brücken, smoke:labs] + der
> motion-ERSTKONSUMENT [Schwanz-Rolle liest fx.motion]) · klang (W-A7: MESHFREI-Kern +
> klang-Feld + der EINE Lofi-Konsument [Tempo + seit der Nachlese SKALA]; Nachlese:
> Portal-Umzug klang.js, THREE-frei). smoke:labs = 7 Portale — JEDES Schöpfer-Lab ist
> ein Portal.
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

1. **schmiede** ✅ GEDOCKT (10.07., V18.439 — W-A4a: schmiede-core.js, 21 Rezepte, Split-Parität 21/21; W-A4b Hand-Render ✅ V18.440 · W-A4c Portal-Umzug ✅ V18.441 — die Schmiede ist VOLL angedockt; **Donor-Abschied geraet_schwert ✅ [Abschieds-Welle, Schöpfer-Segen]**; offen nur Rüstung/Trank als Rezepte [warten auf Lab-Presets])
2. **fachwerk** ✅ GEDOCKT (10.07. — W-A5a Kern + W-A5b [V18.442]: N5.7 settlement [DORF-QUELLE im Kern, exportSettlement→spawnSettlement, gate:settlement] + Portal [fachwerk.js, CSP, W12, welt_fachwerk, smoke:labs])
3. **tetrapoda** + **koerperstudio** ✅ VOLL (V18.442 Daten-Dock [motion-Feld v1.1 §8.2 + MESHFREI-Kerne + gate:daten-contract/gate:nervensystem-labs] + Nachlese-Welle: PORTALE [welt_tetrapoda/welt_koerperstudio, W12-Brücken, vendored r128] + der motion-ERSTKONSUMENT [die Schwanz-Rolle des EINEN Animators liest fx.motion via _motionStudioProfile, fail-soft byte-alt]; Beifang: der W-A6-Alias-Bug der tetrapoda-Shell geheilt [presets doppelt geschachtelt → emo.set warf]. **ABSCHIEDS-WELLE: der Gang-/Rig-Konsum IST GEBAUT** — der Rig bleibt der ANIMATOR (SkinnedMesh-Wand), liest aber die Studio-Zahlen (Atem lab-idle-normalisiert + MOTION_RIG_MAP-Pose-Deltas + walkPhase×freq-Faktor über die EINE Emotions-Brücke); die GESTALT-Dials speisen `_humanoidSkeleton` (Avatar) + `_creatureSkeleton` (wesen↔deer) — „kein eigener Avatar, keine eigenen Kreaturen" ist WAHR (der Host bleibt der OFEN)
4. **klang** ✅ VOLL (V18.442 klang-Feld v1.1 §8.3 + klang-core [22 Genres] + Tempo-Konsument; Nachlese-Welle: PORTAL [welt_klang, klang.js THREE-frei] + SKALA/HARMONIK [_lofiActiveScale + der EINE skalen-bewusste Ton-Mapper _lofiScaleSemitone, Oktav-Faltung mod Skalenlänge, fail-soft byte-alt])

Porta (`worlds/portale/`, liegt bereit) bleibt der ERSTE ε-Beweis (Plan TEIL VIII Punkt 4).
