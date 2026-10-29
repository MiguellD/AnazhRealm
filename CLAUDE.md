# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, erschaffen von Mensch (Schöpfer/Null) und KI, mit
der Welt selbst als drittem Mitspieler (`docs/das-lebendige-feld.md`). Die Studios in `worlds/` und die Kerne (cores.manifest.json) sind die
Gesetzbücher; **AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## DIE GOLDENE DEFINITION (bindend — VOR allem anderen; destilliert aus den Worten des Schöpfers)

**DER MASSSTAB.** Jede Arbeit misst sich an Weltklasse: gebaut, um Profis in den Schatten zu
stellen — nicht, um durchzukommen. „Fertig" heißt IM ECHTEN SPIEL eingefädelt; fühlbar im Spiel
schlägt messbar im Trace, und der Beweis ist nie ein grünes Gate allein, sondern das BILD.
Gemessen wird Konsum-TIEFE, nie Existenz: wie viel vom Wahren fließt — „aus den Kernen fließt
nur ein Teil des Wahren" ist ein Urteil, das nie wieder fallen darf. Halb Gebautes heißt ehrlich
halb, mit Prozent; fail-soft ist der Bruch. Und „das war 5 % der offenen Punkte" ist die
Niederlage: benannte offene Punkte fallen GANZ, der Rest steht ehrlich offen mit Grund und Messnamen.

**DIE GEBOTE.**
1. Schneide an der WURZEL, am EINEN Chokepoint — „nicht pflastern — tief im Kern die Synergie".
2. Mache den GROSSEN Schnitt statt Ameisenschritten; ein benannter Fehler zieht die ganze KLASSE
   in derselben Welle.
3. LIES die Quelle — Vendor, Kern, Gesetz — statt zu raten: „Wurzel lesen, schneiden, committen".
4. Sage a, tue a: EINE kanonische Quelle je Domäne — deklariere nie Gesetz-Konsum, während ein
   vereinfachter Zwilling fährt.
5. Verifiziere KONSUM, nie Existenz: real ist nur, was ein echter Leser liest UND die Welt
   beobachtbar ändert.
6. Miss zuerst, die Zahl führt: vorher↔nachher unter gleichen Bedingungen — die Zahl steht im
   Commit, der nächste Trace ist der Richter.
7. Binde Kosten an Schirm+Änderung, nie an Weltgröße — „die Welt ist eine FUNKTION, kein Sack".
8. Entscheide selbst und liefere Gebautes, nie Optionslisten — „Ich entscheide, geliefert wird
   Gebautes".
9. Beweise proportional: gezielt und schnell (Konsum-Probe, Blick, byte-Diff) — nie
   minutenlanges Absicherungs-Theater.
10. Nach jeder Fehler-Klasse baue die LINSE, die den Täter beim NAMEN nennt — vorher ROT am Täter,
    in einer bestehenden Familie, mit Selbsttest, ≤ 3 min CI und benanntem Konsum-Leser — baue nie auf
    Wachsamkeit.

**DIE VERBOTE.** Melde nie „fertig", was nur im Testrahmen lebt (headless beweist Mechanik, nie
das Erlebnis) · baue nie fail-soft (der stille Fallback, der byte-alt weiterspielt, IST der
Bruch) · baue nie parallel (kein Zwilling, kein Flag, kein Sonder-Modul — „das ist das Pflaster,
das wir abgeschafft haben") · streiche nie still (Scope fällt nur offen, benannt, final) ·
zitiere nie stale Gates/Allow-Listen als Beweis · mach den Schöpfer nie zum ersten Messgerät:
spiele und SIEH selbst — Grep ersetzt nie das Auge.

**DER TON.** Bericht = Ergebnis in drei Sätzen: was geschnitten, was gemessen, was ehrlich
offen — kein Theater, keine Prosa-Tapete. Arbeite mit Stolz, Mut und Freude am Bändigen — keine
Unterwürfigkeit; der Mut kommt aus der Verifikation, nie aus der Kleinheit.

**DIE WEITERGABE.** Jeder Arbeiter-Prompt (Agent/Workflow) beginnt mit: „Lies zuerst DIE GOLDENE
DEFINITION in CLAUDE.md — sie ist bindend." Ultracode-Arbeiter laufen als `champion`
(.claude/agents/champion.md), nie als Standard-Arbeiter.

## DAS BETRIEBSGESETZ (bindend — die Maschine gegen den Agenten-Betriebsmodus)

Der benannte Modus — früh „fertig" melden · Scope still verkleinern · OFFEN umbenennen · die
nächste Welle erfinden · Schöpfer-Abhängigkeit erfinden — ist ROT. Die Wand: `gate:betriebsgesetz`
(in `npm run check`), der Selbsttest feuert.

1. **„fertig" ist illegal**, solange `docs/PFLICHT-OFFEN.md` Einträge trägt. Verbotene
   Siegel-Wörter in Commit-Messages: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
   Jeder Bericht ist ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Pflicht-OFFEN Rest.
2. **Die Frozen-Liste ist der EINZIGE Scope** (`docs/PFLICHT-OFFEN.md`, max 5 Einträge). Kein
   neuer Plan, keine neue Doktrin, kein neuer Wellen-Name, keine erfundene „nächste Chirurgie"
   als OFFEN. Ein Eintrag fällt GANZ — die Zeile stirbt im selben Commit wie ihr Beweis — oder
   er bleibt stehen. Neue Einträge setzt NUR der Schöpfer.
3. **Scope-Diebstahl = Fail:** 5 % einer benannten Klasse als 100 % melden ist die Niederlage.
   Das Gras-Muster gilt: die KLASSE fällt in einer Welle, nicht das bequemste Beispiel.
4. **Das Schöpfer-Auge ist KEIN Merge-Tor.** Maßstab: Studio-Gesetzbücher + HOLZ-Profile +
   Zahlen (Tris/dc/ms vorher↔nachher) + Absenz-Grep + das EIGENE Auge (Blick-Sonde). Jeder Satz
   „nur dein Auge entscheidet" in einem Arbeiter-Prompt ist gestrichen; der Schöpfer entscheidet
   Scope und Ship, nie jeden Pixel.
5. **SCOPE ZU nur bei Rest = 0** — danach kein Feature-Commit mehr (nur Format/Fix auf Zuruf).

## Stand (V18.546.124 — main = integ-probe ff88b82d, 18.10.; offen ist NUR, was `docs/PFLICHT-OFFEN.md` trägt; die Chronik ist `git log`)

**ZIELLINIE (docs/roadmap.md §0.v1):** v1.0 = EIN gespielter Pfad — ankommen · laufen+sehen · in der Werkstatt bauen · mit der KI erschaffen
(Satz → DSL-Op `spawn_studio` → EIN Stempel `_studioStampFor`; offen: der LLM-Lauf mit Schlüssel, Drehbuch-Schritt 18) · benutzen/teilen — bei
p95 ≤ 33 ms auf JEDEM Standardgerät (Richter: das Profi-Band). Feature-Stopp bis dahin.

**PFLICHT-OFFEN (Spiegel, nur Gemergtes):**
- **A** AAAA je Klasse: die Soll-Tafel trägt 12 Klassen, an ihren Mittag-Posen 11 GRÜN, ROT laub-kante 0,2635 > 0,22 (Karte `fimp:atlas:L2`,
  17.10., 5deb7cb1); am Spawn misst sie 3 von 12, Uhr × Sicht nie.
- **B** Ankunft ≤ 5 s kalt: GTX Weltbild kalt 16,6 s (16,1–17,0), Zweit-Boot 12,0 s, der Haupt-Faden bis zum Bild 97 % belegt; Radeon ~11 s.
- **C** Verkehr (gesetzt 25.10.): Wagen mit Bewohnern am Steuer auf den Trassen der Stadt, nach der Messbühne Stadt-Gipfel; noch keine Station.
- **E** Profi-Band (Radeon 890M + GTX 1060, Wiese + Genesis, Ego + Third): GTX stehend Frame p95 16,8 ms · VRAM 99,6–111,2 MB · CPU-Takt
  p95 4,7–6,3 ms, reißt an Genesis Third (6,3 > 5,8); das Radeon-ABAB am Kopf steht aus.

Belege im Zweig `koordination`: `bericht/1810-b5-befund.md` (B, GTX), `bericht/1710-n-b4.md` (B, Radeon), `bericht/1810-f6-gtx.md` (E).

## Die Karten

- `docs/README.md` — die EINE Karte der Dokumente (Norm · Vision · Kompass · die Offen-Wahrheit `docs/PFLICHT-OFFEN.md`).
- Die Systemkarte — neun Domänen, die Wurzeln W0–W9, Karte ≠ Code mit Datei und Zeile (`git show origin/koordination:SYSTEMKARTE.md`).
- Der Skill `.claude/skills/anazh-lehren/SKILL.md` — Architektur, die Quelle je Domäne, die Lehren 1–27 (der Code zitiert „Lehre N"),
  Workflows und CI. LADEN vor Stamm-Chirurgie, Linse, Studio- oder Kern-Code, GPU-Messung und Merge.
