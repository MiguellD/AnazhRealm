# Der aktive Tisch — DER EINE PLAN VORWÄRTS

> **Was hier liegt:** nur die Tat, die JETZT (vor Öffentlich-Machen) zählt.
> Das **Backlog** (alle anderen offenen Fäden — Γ-Reste · LOD · Wasser-Render
> finale Form · M9-Sprossen 4-7 · VR · Zeit-Portal · alles post-öffentlich)
> lebt in `docs/roadmap.md` §4. Volle Vergangenheit: `docs/archiv/handover.md`
> Chronik. Vision: `docs/state-of-realm.md` + `docs/das-lebendige-feld.md`.
> Vollendete Pläne im Archiv.

**Stand 13.06.2026 (V18.192 — `claude/stoic-archimedes-36l2it`):** der Schöpfer-Auftrag „alles
offene + alle Unvollständigkeiten in den Backlog" ist umgesetzt — der aktive Tisch ist
nun GEZIELT: nur was VOR Öffentlich-Machen substanziell zählt steht hier, alles andere ist
in `docs/roadmap.md` §4 als Backlog gesichert (nichts vergessen, nichts verloren). **Φ-Bogen
RUND 7/7** (V18.188–V18.191). **W5 Werkzeug-Abnutzung GEBAUT** (V18.192, R-031: ja, kein
Perpetuum mobile — Ω5 lebt am Werkzeug). Der Tisch trägt jetzt nur noch: die **S-Browser-
Abnahmen** des Schöpfers + ggf. **R-037 T-Welle** (ruht bis dritter Bauer).

---

## §0 — Status (alle abgeschlossenen Bögen)

| Bogen | Wann | Aktenort |
|---|---|---|
| Kampf · Schöpfungs-Fluss · Resonanz-Vereinheitlichung | V17.59–.85 · §11 RUND V18.148 | `docs/archiv/kampf-plan.md` |
| Wasser-CA (Fluid-Sim auf Voxel) | V18.84–.94 | `docs/archiv/terrain-t4-wasser-ca-plan.md` |
| Wasser-Render (3 Schichten, V18.31 konsolidiert; Steil-Split V18.111-.114; Stau-Spiegel V18.129; H3 ferne Welten V18.132) | V18.0–.132 | `docs/archiv/wasser-render-architektur-plan.md` |
| UI-Putz (6 Kern-Räume + Werkstatt-Referenz) | V18.32–.83 | `docs/archiv/ui-putz-plan.md` + 4 Raum-Pläne |
| Taille Ω (gefroren, golden) | V18.137–.141 | `docs/taille-spec.md` + `docs/archiv/taille-plan.md` |
| Robustheit (R0–R6 Kern) | V18.122–.152 | `docs/archiv/robustheit-plan.md` |
| Sozial F4 (Zeugnisse · Folgen · Kommentare · Für-dich) | V18.134–.147 | gigant-plan §5 F4 (archiviert) |
| Welten-Föderation F3/W18 (Ko-Präsenz + Wohnen) | V18.144–.146 | `docs/archiv/world-portal-w18-plan.md` |
| Meister-Marsch §8 (W-A · W-B · W-C · W-D · W-E · W-F · W-G · W-H · M1–M8) | V18.154–.179 | `docs/archiv/meister-plan.md` |
| Genese-Bogen Γ (Γ1-Kern · Γ2 · Γ5 V18.166; Γ1-Lesart-4 · Γ4 · Γ4.2/4.4 · Γ4½ V18.179-.181 via Synthese) | V18.166 + V18.180-FIX-Bogen | `docs/archiv/genese-plan.md` |
| Branch-Synthese (clever-gauss × tesla → ein Stamm) | V18.180-FIX bis V18.187 (20 Commits, 10 permanente Lehren) | `docs/wellen-synthese-plan.md` + Archiv-Voll-Datei |
| **Φ-Bogen Φ0–Φ7 (M9-Sprossen 1+2+3 — DAS WELTEN-NETZ, RUND 7/7)** | **V18.188–V18.191** | `docs/archiv/archipel-plan.md` (ALLE Wellen GEBAUT; 58 Wände in 4 Test-Bands; smoke-multiuser end-to-end) |
| **W5 Werkzeug-Abnutzung (R-031: Ω5 lebt am Werkzeug — Mühe-Senke + Reparieren-Akt, Migration-tolerant)** | **V18.192** | unten §1.A + `docs/rueckmeldung.md` R-031 |

---

## §1 — Was JETZT (vor Öffentlich-Machen) auf dem Tisch liegt

### A. W5 — WERKZEUG-ABNUTZUNG GEBAUT (V18.192, R-031 ✓)

Schöpfer-Entscheid 13.06.: „ja, kein perpetuum mobile, sonst ist balance nicht möglich".
∞-Katalysator war als Erst-Wurf-Default bewusst gewählt (Gesamt-Abnahme 11.06.), aber er
bricht die Ω5-Wand am Werkzeug: ein Gerät, das ewig hält, ist Material-Quelle ohne Mühe-
Senke. W5 heilt das ehrlich:

- `bp.wear` (0..1) am Bauplan, FROZEN-Konstanten (`WEAR_PER_STRIKE_BASE=0.018` · Schwelle 5 % · Repair-Fraktion 50 %)
- **Mühe-Senke:** jeder `_strikeArchitecture`-Hieb zehrt wear; hartes Material (eisen) widersteht ~3× länger als weiches (holz) — Härte-Skalierung lebt
- **Kaputt-Wand:** wear < 5 % → Hieb verweigert, Spieler bekommt Repair-Aufruf
- **Equip-Stat-Faktor:** ein verbrauchtes Werkzeug wirkt nur mit 30 % (WEAR_STAT_FLOOR) — auch ohne völlig zu zerbrechen spürbar schwächer (Reparieren hat Mehrwert)
- **Repair-Akt** `repairHeldDevice()` (R2-strukturell, KEIN DSL-Op): zahlt Material analog `_makeCostGate` mit `REPAIR_COST_FRACTION × Schaden-Anteil`; schöpfer-Modus frei
- **Persistenz:** wear < 1 reist im Snapshot; wear === 1 wird OMITTED (Größen-Disziplin); Migration-tolerant: alter Save ohne wear-Feld liest 1 (voll, kein Funktions-Verlust)
- **13 Wände** (`checkBandW5Werkzeugabnutzung`): Konstanten · Migration · Clamp · Härte-Skala · Stat-Faktor · Forge=1 · Strike zehrt · Kaputt-Wand · Repair-Akt · Repair-no-op · Repair-no-held · Snapshot-Round-Trip · R2-Disjunktheit

**OFFEN:** S-Browser-Test des Spielers (Spitzhacke abnutzen + reparieren in pfad-Modus; spürt sich die Balance ehrlich an?).

### B. Die S-Browser-Abnahmen (das Schöpfer-Auge)

Pflicht-Sign-offs (alle GEBAUT, warten auf dein Browser-Auge):

- **R-001 bis R-036 + R-041** (siehe `docs/rueckmeldung.md`) — als „gebaut, S-Abnahme offen" markiert
- **Die Synthese-Werke V18.180-FIX bis V18.187:** Wald-WOW · AAA-Atmosphäre (3 Sonnen-Halos · 4. Cumulus) · Boden atmet · Massiv ~700 m vom Spawn · 12 Streu-Vegetations-Varianten · pro-Halm-HSL-Tints · pro-Eichen-HSL-Tints · Λ.3 Wind-Sway · Λ.6 Subsurface-Backlit am Laub
- **Der Φ-Bogen V18.188-V18.191:** Portal-Karte fühlen · Welt verlinken (Φ1) · Visibility-Wechsel (Φ2) · Region wechseln (Φ3) · Anwesenheit pollen (Φ4) · Welt pinnen + als Mitträger antworten (Φ5) · Halle kuratieren+materialisieren+durchreisen (Φ7) · Compute-Beitrag verifizieren (Φ6)
- **W5 V18.192:** Spitzhacke abnutzen + reparieren in pfad-Modus

**Werkzeuge für deinen Browser-Audit:**

| Skript | Was zeigt |
|---|---|
| `scripts/diag-fischer-wand.cjs` | AAA-Atmosphäre 6-Shot-Galerie |
| `scripts/diag-lambda-volltiefe.cjs` | Λ-Tiefen aller Achsen |
| `scripts/diag-lambda4.cjs` / `-tag.cjs` | Λ.4 Streu-Vegetation |
| `scripts/diag-lebendige-welt.cjs` | Λ.2 Tint-Verteilung |
| `scripts/diag-makro.cjs` | Γ4 Massiv+Tal+Becken A/B-Vista |
| `scripts/diag-ufer-pixel.cjs` | Γ1-Lesart-4 Boden-atmet A/B-Vista |
| `scripts/diag-wald.cjs` | W-H Wald-WOW (Yaw-σ + Painterly) |
| `scripts/diag-wbc-nachbau.cjs` | W-B/W-C/W-D Räume im Nutzer-Zustand |
| `scripts/diag-archipel-last.cjs` | Φ0 Last-Sonde (Snapshot/Adresse/Build-Zeiten) |

---

## §2 — Die GEMERKTEN FÄDEN (Schöpfer 11.06.: „alle wichtig, nie vergessen")

| Faden | Status | Weck-Moment |
|---|---|---|
| R6 Selbst-Erweiterung | ✓ Kern V18.152 | (Rest = M9-Sprosse 3, in Backlog) |
| Phase E Bedrohung/Furcht | ✓ V18.148 | — |
| IndexedDB-Persistenz | ✓ V18.151 | — |
| Fahrzeug-Fahr-Tiefe | ✓ V18.150 | — |
| Statusbar schlanken | ✓ V18.149 | — |

Die nicht-gebauten gemerkten Fäden (B1 Worker-Sheet · V18→V19-Zeit-Portal · VR/WebXR) sind
ins **Backlog `docs/roadmap.md` §4** umgezogen — sie warten auf ihren Weck-Moment, sind dort
namentlich + mit dem Auslöser gesichert (nichts vergessen).

---

## §3 — Schöpfer-Entscheide (echt offen, projekt-unaufklärbar)

Drei der vier ursprünglichen Entscheide sind durchgezogen (R-031 ✓, R-039 → Backlog,
Wasser-Pfad → mit U2 in Backlog). Nur einer wartet noch ehrlich auf Antrieb:

| ID | Frage | Default (gilt) | Alternative | Wann |
|---|---|---|---|---|
| **R-037** | T-Welle Typ-Sicherheit? | Ruhen lassen (no-build bleibt rein) | state-Typisierung investieren (490 tsc-Fehler, 416 auf state-Bag — `state` ist ein dynamisches JS-Objekt; TypeScript ohne `StateShape`-JSDoc-Interface erkennt die Felder nicht — das ist kein Bug, sondern Format-Issue, funktioniert perfekt in JS) | wenn ein dritter Hand mit-tippt |

Die drei DURCHGEZOGENEN (Antwort eingetragen, Folge-Aktion umgesetzt):

| ID | Frage | Schöpfer-Antwort 13.06. | Folge |
|---|---|---|---|
| ~~R-031~~ | Werkzeug-Abnutzung? | „ja, kein perpetuum mobile, sonst ist balance nicht möglich" | **W5 GEBAUT V18.192** (§1.A) |
| ~~Wasser-Pfad~~ | Welche 3 Optionen? | „haben wir das nicht erledigt? grundstruktur klar" — JA, der Kern ist fertig (V18.84-V18.132), die 3 Render-Optionen + alle Reste (Wasserfall-Plane-Überlapp, Unterwasser-Pass B5, Kapillar, U2 Wasser-LOD) sind in roadmap §4 als Feinschliff-Backlog | → roadmap §4 |
| ~~R-039~~ | Devlog/Welle-Schau? | „das letzte ist erst nachdem es öffentlich ist" — Backlog post-öffentlich | → roadmap §4 |

---

## §4 — Was im Backlog liegt (siehe `docs/roadmap.md` §4)

Alles andere — **die KOMPLETTE offene Liste lebt in `docs/roadmap.md` §4** (die VOLLSTÄNDIGE
Karte, nichts vergessen):

- **M9-Sprossen 4-7** — S-Dialog, je Vision-getrieben (eigene Welle je Sprosse)
- **Γ-Reste** (alle 6: Γ7 Baum-Grammatik · Γ1-Lesart-5 Geruch · Γ3 Feld-Charakter · Γ-M Strata · Γ8 Kies+Saum · Γ2 Totholz) — klein, video-getrieben oder optional
- **Wasser-Feinschliff** (Wasserfall-Plane-Überlapp · Unterwasser-Decken-Pass B5 · Kapillar/Stempel an Gebäuden · foam-Strähnen-Politur · Schelf-Konsolidierung) — kleine Reste, alle dokumentiert
- **LOD-Reste** (U2 Wasser-LOD · U6 echtes Clipmap) — eigene Bögen
- **B1 Wasser-Sheet→Worker** — weckt der fühlbare Carve-Hitch
- **echtes V18→V19-Zeit-Portal** — weckt das erste Alt-Build-Artefakt
- **VR/WebXR** — wenn der Schöpfer es ruft (startet bei null)
- **R-039 Devlog/Welle-Schau** — post-öffentlich
- **R-037 T-Welle** (state-JSDoc-Typisierung) — wenn dritter Bauer mit-tippt
- **Browser-Sign-offs** alter Welle-Stapel (J4 · E1–E3 · R1/R2/R3/R5)

---

## §5 — Empfohlene Reihenfolge (was JETZT zählt)

1. **S-Browser-Abnahmen** durchgehen — der Schöpfer-Audit ist der echte Wert-Test (alles
   andere kann ich ohne Schöpfer-Auge nicht abschließen)
2. **W5 Werkzeug-Abnutzung im Browser fühlen** (Spitzhacke pfad-Modus, abnutzen, reparieren —
   spürt es sich balanciert an?)
3. **Wenn Schöpfer ruft** (post-öffentlich oder ein konkretes Weck-Moment trifft): die
   Backlog-Bögen aus `docs/roadmap.md` §4 ziehen (alle dokumentiert, alle bereit)

---

## §6 — Disziplin (aus der Synthese-Welle gelernt + V18.192-Schluss)

Die zehn permanenten Lehren leben in `CLAUDE.md` "Aktueller Stand"-Block +
`docs/archiv/wellen-synthese-plan.md` §16. Besonders relevant für künftige Bögen:

- **Lehre 7 (V18.185):** Ein `static get X()` ohne Setter überdeckt `Klasse.X = ...` LAUTLOS. Source-Probe-Wand MUSS Kommentare strippen.
- **Lehre 9 (V18.185):** Reviewer mit fremden Augen fängt stille Bugs — Mess-Wand auf LIVE-Werten.
- **Lehre 10 (V18.187):** Ein ZU SCHMALES Test-Band gibt FALSCHE Sicherheit. Plan-Wortlaut nennt N Stufen → Wand MUSS N Klassen tragen.
- **NEU V18.192 (R-031-Lehre):** ein Erst-Wurf-Default ist nicht für die Ewigkeit — wenn die Balance-Wand (Ω5) auf eine bestehende Bequemlichkeit (∞-Katalysator) trifft, ist die Heilung eine eigene kleine Welle (Mühe-Senke + Reparieren-Geste, R2-strukturell), die das Perpetuum strukturell ausschließt. Eine Migration-tolerante Form (Default-Wert für fehlende Felder) schützt alte Welten ohne Funktions-Verlust.

Plus die Branch-Heilige-Lektion: „eine Welle nach der anderen am Stamm" — zwei parallele Branches haben die stille Bedingung gebrochen.

---

_Der Tisch trägt nur die nächste Tat. Ein Bogen erwacht → sein Plan kommt aus
`docs/roadmap.md` §4 (oder dem Archiv) auf den Tisch. Er vollendet → zurück
ins Archiv. Das Backlog ist die Heimat für „nicht jetzt, aber nicht vergessen"._
